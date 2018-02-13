/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { inject, injectable, named } from 'inversify'
import { FrontendApplication, KeybindingRegistry } from '@theia/core/lib/browser'
import URI from '@theia/core/lib/common/uri'
import {
    BaseLanguageClientContribution,
    LanguageClientFactory,
    Languages,
    Workspace,
} from '@theia/languages/lib/browser'
import { DiagramManagerProvider, DiagramManager } from 'theia-sprotty/lib'
import { CommandRegistry, Disposable } from '@theia/core/lib/common';
import { ContextMenuCommands } from './dynamic-commands';

@injectable()
export class YangLanguageClientContribution extends BaseLanguageClientContribution {

    readonly id = 'yang'
    readonly name = 'Yang'

    constructor(
        @inject(Workspace) workspace: Workspace,
        @inject(Languages) languages: Languages,
        @inject(LanguageClientFactory) languageClientFactory: LanguageClientFactory,
        @inject(DiagramManagerProvider)@named('yang-diagram') protected yangDiagramManagerProvider: DiagramManagerProvider,
        @inject(KeybindingRegistry) protected keybindingRegistry: KeybindingRegistry,
        @inject(CommandRegistry) protected commandRegistry: CommandRegistry,
        @inject(ContextMenuCommands) protected commands: ContextMenuCommands
    ) {
        super(workspace, languages, languageClientFactory)
    }

    protected get globPatterns() {
        return [
            '**/*.yang'
        ]
    }

    waitForActivation(app: FrontendApplication): Promise<any> {
        return Promise.race([
            super.waitForActivation(app),
            this.waitForOpenDiagrams(this.yangDiagramManagerProvider())
        ])
    }

    protected waitForOpenDiagrams(diagramManagerProvider: Promise<DiagramManager>): Promise<any> {
        return diagramManagerProvider.then(diagramManager => {
            return new Promise<URI>((resolve) => {
                const disposable = diagramManager.onDiagramOpened(uri => {
                    disposable.dispose()
                    resolve(uri)
                })
            })
        })
    }

    registerCommand(id: string, callback: (...args: any[]) => any, thisArg?: any): Disposable {
        return this.commands.registerCommand(id, callback, thisArg)
    }
}
