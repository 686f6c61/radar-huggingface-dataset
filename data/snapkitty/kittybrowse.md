# Snapkitty/kittybrowse

## Resumen

KittyBrowse es un andamiaje de navegador agente basado en Chromium, desarrollado por Snapkitty. Su propuesta es tratar cada pestaña del navegador como un contexto de agente, cada página como una superficie de ejecución y cada URL como un puntero de tarea. El navegador actúa como la carcasa; APL/Rust/WASM es el sustrato de ejecución preferido.

El proyecto se presenta como un scaffold funcional, no como un modelo de lenguaje. Incluye una capa de runtime de agente local, un programador de entropía determinista, un adaptador de malla NATS con respaldo en proceso, y puentes para VM/IDE con manifiestos de plugins. La arquitectura está pensada para coordinar agentes en un entorno de navegador con límites de seguridad explícitos, como la ausencia de acceso directo a Node desde el renderizador y la prohibición de ejecución de shell.

La relevancia actual radica en su enfoque de usar el navegador como plataforma de ejecución para agentes, con un protocolo definido y una separación clara entre la capa de UI/coordinación (TypeScript) y la lógica financiera o de sellado (APL). No se trata de un modelo entrenado, sino de una infraestructura de orquestación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Chromium UI (Electron) -> Agent Runtime Layer -> Entropy Scheduler -> NATS Event Mesh -> VM/IDE/Tool Bridge -> Unified Output Stream |
| Parametros totales | no disponible (no es un modelo de parametros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (codigo fuente TypeScript/Rust) |

## Arquitectura y entrenamiento

KittyBrowse no es un modelo entrenado, sino un andamiaje de software. Su arquitectura se compone de una interfaz Electron que aloja un runtime de agente local en el proceso principal, un programador de entropía determinista basado en dependencias, tasa de fallos y latencia, y un adaptador NATS con respaldo en proceso cuando `NATS_URL` no es alcanzable. La capa de plugins incluye manifiestos para VM APL/WASM, IDE VSCode y VM Rust, con listas blancas de destinos y sin ejecución de shell.

No hay datos de entrenamiento, tokens, ni procesos de RLHF/DPO. La innovación técnica reside en el uso de NATS como malla de eventos, el programador de entropía determinista y el puente Rust VM bajo `crates/rust-vm-bridge`. TypeScript se limita a UI/IPC/NATS; la lógica financiera y de sellado se delega a APL.

## Capacidades

- Navegador agente: cada pestaña es un contexto de agente, cada página una superficie de ejecución y cada URL un puntero de tarea.
- Programación de entropía determinista: el scheduler decide el orden de ejecución basándose en dependencias, tasa de fallos y latencia.
- Malla de eventos NATS: comunicación entre agentes mediante mensajes estructurados, con respaldo en proceso si no hay NATS disponible.
- Puente VM/IDE: manifiestos de plugins para APL/WASM, VSCode y Rust, con destinos permitidos y sin ejecución de shell.
- Límites de seguridad: el renderizador no tiene acceso directo a Node; el runtime se comunica mediante IPC tipado; la ejecución del puente es simulada hasta que se implementen adaptadores específicos.
- Protocolo definido: `docs/kitty-protocol-v1.md` especifica el protocolo de comunicación entre agentes.

## Casos de uso

- Automatización de navegación web: el navegador actúa como agente para recorrer páginas, extraer datos o interactuar con formularios, usando cada URL como puntero de tarea.
- Orquestación de agentes múltiples: con NATS como malla de eventos, varios agentes pueden coordinarse en diferentes pestañas para tareas paralelas.
- Ejecución de lógica financiera en APL: el puente APL/WASM permite ejecutar lógica de sellado o evaluación de pruebas sin depender de TypeScript.
- Integración con IDE: el plugin VSCode permite controlar el editor mediante LSP, sin acceso directo a shell.
- Desarrollo de plugins VM: el puente Rust VM ofrece una vía para ejecutar código Rust en el navegador con límites de seguridad.
- Pruebas de scheduler: el conjunto de pruebas Node valida el comportamiento del programador de entropía y el despacho del runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El proyecto incluye un conjunto de pruebas Node para el scheduler y el runtime, pero no hay datos de rendimiento comparativos.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentacion.
- Al ser una aplicacion Electron, requiere un sistema con Node.js y Chromium; el consumo de RAM dependera del numero de pestañas y agentes activos.
- No hay estimaciones de VRAM ni GPU recomendadas, ya que no se trata de un modelo de inferencia.
- Opciones de despliegue: ejecucion local con `npm run dev`; NATS opcional via Docker (`nats:2-alpine`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. KittyBrowse no es un modelo de lenguaje ni un sistema de IA comparable con otros modelos; es un andamiaje de software para orquestar agentes en un navegador.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto ni realiza inferencias; es un framework de orquestacion.
- La ejecucion del puente es simulada: los adaptadores de VM/IDE no estan implementados completamente; solo hay manifiestos y documentacion.
- Sin ejecucion de shell: intencionalmente ausente, lo que limita ciertas automatizaciones que requieran comandos del sistema.
- Dependencia de NATS: si `NATS_URL` no esta disponible, se usa un respaldo en proceso, pero la escalabilidad se reduce.
- Licencia no disponible: no se especifican condiciones de uso o redistribucion.
- Seguridad: el renderizador no tiene acceso a Node, pero la arquitectura aun no ha sido auditada; el uso en produccion requiere revision.

## Enlaces

- HuggingFace: https://huggingface.co/Snapkitty/kittybrowse
- Protocolo: `docs/kitty-protocol-v1.md`
- Limite APL/WASM: `docs/apl-wasm-runtime.md`
- Puente NATS Rust: `docs/nats-rust-bridge.md`
- Manifiesto APL/WASM: `plugins/vm/apl-wasm/kitty.plugin.json`
- Manifiesto VSCode: `plugins/ide/vscode/kitty.plugin.json`
- Manifiesto Rust VM: `plugins/vm/rust/kitty.plugin.json`
