# SaylorTwift/grok-build

## Resumen

Este repositorio de Hugging Face no contiene un checkpoint de modelo. Es un espejo de solo lectura del repositorio de GitHub `xai-org/grok-build`, que aloja **Grok Build** (`grok`), el agente de codificacion de terminal de xAI. La model card usa la denominacion "SpaceXAI" y enlaza a `x.ai`, mientras que el repositorio original citado es `xai-org/grok-build`; se trata por tanto de un artefacto de software, no de pesos entrenados.

El artefacto real es una aplicacion de linea de comandos y TUI escrita en Rust que funciona como harness de agente: interpreta el codigo del usuario, edita ficheros, ejecuta comandos de shell, busca en la web y gestiona tareas de larga duracion. Puede operar de forma interactiva, en modo headless para scripting e integracion continua, o embebido en editores mediante el Agent Client Protocol (ACP).

Su relevancia practica esta en que permite inspeccionar y compilar el codigo del harness (runtime del agente, herramientas, sandbox, MCP, checkpoints) bajo licencia Apache 2.0. El repositorio del Hub tiene 0 descargas, 0 likes, un tamano declarado de 0.0 GB y no incluye ninguna especificacion del modelo de lenguaje subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. El repositorio no contiene un modelo de lenguaje: aloja el codigo fuente en Rust de una CLI/TUI de agente de codificacion |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache License 2.0 para el codigo propio; el codigo de terceros y vendorizado conserva su licencia original |
| Formato de pesos | No aplica: el repositorio no publica pesos (safetensors, GGUF ni otros) |
| Tipo de artefacto | Espejo de codigo fuente (mirror de `xai-org/grok-build`) |
| Lenguaje de implementacion | Rust (toolchain fijado por `rust-toolchain.toml`) |
| Dependencias de compilacion | Rust, DotSlash (para `bin/protoc`) y `protoc` |
| Plataformas de binarios precompilados | macOS, Linux y Windows |
| Canales de ejecucion | TUI interactiva, modo headless, ACP para editores |
| Tamano del repositorio en el Hub | 0.0 GB |
| Fecha de creacion / actualizacion | 2026-09-16 / 2026-09-16 |

## Arquitectura y entrenamiento

No hay informacion sobre arquitectura de red neuronal, datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion (RLHF, DPO). El repositorio no publica pesos ni una ficha tecnica del modelo que da servicio al agente, por lo que todos esos datos deben considerarse no disponibles en la informacion proporcionada.

Lo que si se documenta es la organizacion del espacio de trabajo Rust: `crates/codegen/xai-grok-pager-bin` (paquete raiz que produce el binario `xai-grok-pager`, distribuido oficialmente como `grok`), `crates/codegen/xai-grok-pager` (la TUI: scrollback, prompt, modales, renderizado), `crates/codegen/xai-grok-shell` (runtime del agente y puntos de entrada leader/stdio/headless), `crates/codegen/xai-grok-tools` (implementaciones de herramientas: terminal, edicion de ficheros, busqueda), `crates/codegen/xai-grok-workspace` (sistema de ficheros del host, control de versiones, ejecucion, checkpoints) y `third_party/` (codigo vendorizado, incluida la pila de diagramas Mermaid). El `Cargo.toml` de la raiz esta generado y debe tratarse como solo lectura. Un fichero `SOURCE_REV` registra el SHA completo del commit del monorepo del que procede el arbol sincronizado.

Como innovaciones tecnicas destacables en el plano de ingenieria (no de modelado) figuran el soporte de servidores MCP, skills, plugins, hooks, sandboxing, checkpointing del workspace y el Agent Client Protocol para integracion en editores. Las implementaciones de herramientas de `openai/codex` y `sst/opencode` aparecen citadas como ports de codigo fuente incluidos en el arbol.

## Capacidades

- Comprension de base de codigo dentro de una TUI a pantalla completa.
- Edicion de ficheros y aplicacion de cambios sobre el arbol de trabajo local.
- Ejecucion de comandos de shell y gestion de procesos.
- Busqueda web desde la propia interfaz del agente.
- Gestion de tareas de larga duracion con checkpoints del workspace.
- Modo headless para scripting e integracion continua.
- Integracion en editores mediante Agent Client Protocol (ACP).
- Soporte de servidores MCP, skills, plugins y hooks.
- Sandboxing de la ejecucion.
- Uso de herramientas (tool use) como eje del runtime del agente.
- Autenticacion mediante navegador en el primer arranque.
- Capacidades de modelo subyacente (razonamiento, matemáticas, vision, multilingue, thinking mode): no disponibles en la informacion proporcionada.

## Casos de uso

- Refactorizacion de repositorios grandes: el agente puede recorrer el arbol de trabajo, editar multiples ficheros y apoyarse en checkpoints del workspace para revertir cambios si la refactorizacion no sale bien.
- Ejecucion de tareas de codificacion en CI: el modo headless permite lanzar el agente desde un pipeline sin intervencion humana, por ejemplo para aplicar correcciones de linting o generar parches sobre una rama.
- Automatizacion de tareas de mantenimiento: actualizacion de dependencias, migraciones de API y limpieza de codigo repetitivo, ejecutando los comandos de build y test necesarios para verificar el resultado.
- Asistencia integrada en el editor: mediante ACP, el agente se puede embeber en un IDE para que el desarrollador aplique cambios sin salir de su entorno.
- Diagnostico y reparacion de fallos de build: el agente puede reproducir el error ejecutando comandos de shell, inspeccionar la salida y proponer un parche verificable.
- Ampliacion del agente con herramientas propias: los servidores MCP, plugins, hooks y skills permiten conectar sistemas internos (gestores de incidencias, APIs corporativas, bases de datos) al runtime del agente.
- Auditoria de codigo en entorno controlado: el sandboxing y el hecho de que el codigo fuente sea inspeccionable facilitan desplegar el harness en organizaciones con requisitos estrictos de revision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones del agente ni del modelo subyacente: no hay datos de MMLU, HumanEval, GSM8K, SWE-bench ni de ninguna otra suite, y tampoco se proporcionan medidas de latencia o throughput.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El repositorio no publica pesos, por lo que no se puede estimar memoria de GPU.
- GPU recomendadas: no disponibles por el mismo motivo. La model card no especifica donde se ejecuta la inferencia; solo indica que en el primer arranque se abre el navegador para autenticarse.
- Compatibilidad con GPU de consumo: no evaluable con la informacion disponible.
- Requisitos de compilacion desde fuente: toolchain de Rust (fijado por `rust-toolchain.toml`), DotSlash en el `PATH` antes de compilar y `protoc` (resuelto via DotSlash en `bin/protoc` o desde el `PATH` / `$PROTOC`).
- Hosts de compilacion soportados: macOS y Linux; la compilacion en Windows es "best-effort" y no se prueba desde este arbol.
- Instalacion de binarios precompilados: `curl -fsSL https://x.ai/cli/install.sh | bash` en macOS, Linux y Git Bash; `irm https://x.ai/cli/install.ps1 | iex` en Windows PowerShell.
- Opciones de despliegue del modelo (vLLM, llama.cpp, Ollama, TGI): no disponibles; no hay pesos que servir.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No procede una comparativa de modelos porque el repositorio no contiene un modelo. A continuacion se comparan harnesses de codificacion en terminal con los que Grok Build comparte categoria, limitando los datos a lo que aparece en la informacion proporcionada.

| Proyecto | Tipo de artefacto | Licencia | Pesos publicados | Datos en la informacion disponible |
|---|---|---|---|---|
| Grok Build (`grok`) | CLI/TUI de agente de codificacion en Rust | Apache 2.0 (codigo propio); terceros bajo su licencia original | No | Compila el binario `xai-grok-pager`; ACP, MCP, sandbox, checkpoints; no se aceptan contribuciones externas |
| `openai/codex` | Agente de codificacion | No disponible | No disponible | Citado en `THIRD-PARTY-NOTICES` como origen de ports de implementaciones de herramientas incluidos en el arbol de Grok Build |
| `sst/opencode` | Agente de codificacion | No disponible | No disponible | Citado en `THIRD-PARTY-NOTICES` como origen de ports de implementaciones de herramientas incluidos en el arbol de Grok Build |

Parametros, contexto y rendimiento de cualquiera de los tres: no disponibles.

## Limitaciones y advertencias

- El repositorio de Hugging Face no es un modelo: no contiene pesos, tokenizador, configuracion de inferencia ni ficha tecnica. Cualquier uso como modelo fallara.
- El espejo se sincroniza periodicamente desde el monorepo de origen, por lo que puede estar desactualizado respecto al repositorio canonico en GitHub. El seguimiento de incidencias y las pull requests se gestionan en GitHub, no en el Hub.
- El repositorio declara explicitamente que no acepta contribuciones externas.
- Las implementaciones de herramientas portadas desde `openai/codex` y `sst/opencode`, asi como otras dependencias vendorizadas, siguen sujetas a sus licencias originales; el uso comercial debe revisarse contra `THIRD-PARTY-NOTICES` y `crates/codegen/xai-grok-tools/THIRD_PARTY_NOTICES.md` antes de redistribuir.
- El `Cargo.toml` de la raiz esta generado: editarlo puede provocar inconsistencias en la build.
- La build en Windows no esta probada desde este arbol y se considera best-effort.
- El arranque requiere autenticacion mediante navegador; no se detalla en la informacion disponible el modelo de servicio, los limites de uso ni el tratamiento de datos asociado a esa autenticacion.
- No hay datos de sesgos, alucinacion, cobertura idiomatica ni evaluaciones de seguridad del modelo subyacente.
- El repositorio presenta 0 descargas y 0 likes, y un tamano declarado de 0.0 GB, lo que sugiere que puede tratarse de un espejo sin contenido o meramente indicativo en el momento de la consulta.
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo o el proyecto (los resultados obtenidos corresponden a la ITF World Tennis Tour y no guardan relacion).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SaylorTwift/grok-build
- Repositorio canonico en GitHub: https://github.com/xai-org/grok-build
- Pagina del producto: https://x.ai/cli
- Documentacion: https://docs.x.ai/build/overview
- Registro de cambios: https://x.ai/build/changelog
- Script de instalacion (macOS/Linux/Git Bash): https://x.ai/cli/install.sh
- Script de instalacion (Windows PowerShell): https://x.ai/cli/install.ps1
- Guia de usuario incluida en el repositorio: `crates/codegen/xai-grok-pager/docs/user-guide/`
- Guia de autenticacion: `crates/codegen/xai-grok-pager/docs/user-guide/02-authentication.md`
- DotSlash: https://dotslash-cli.com
- Avisos de terceros: `THIRD-PARTY-NOTICES` y `crates/codegen/xai-grok-tools/THIRD_PARTY_NOTICES.md`
- Resultados de busqueda web relevantes: no disponible (ninguno de los resultados devueltos estaba relacionado con el proyecto)
