# indahl/indahl-relay

## Resumen

`indahl/indahl-relay` no es un modelo de lenguaje, sino un plugin para Claude Code publicado en Hugging Face bajo el identificador de repositorio `indahl/indahl-relay`. Lo desarrolla Heuremen LLC (sitio `indahl.ai`), con licencia MIT, y su funcion es orquestar trabajo no atendido en multiples etapas: ladders de entrenamiento, barridos de evaluacion y pipelines de datos. El repositorio no contiene pesos, tokenizador ni artefactos de inferencia; contiene la definicion de un plugin y su documentacion.

El plugin implementa un planificador de dependencias sencillo sobre un fichero JSON de cadena (`chain.json`). Cada etapa declara un comando, un carril (`lane`, por ejemplo `gpu`) y dependencias (`after`); la orden `tick` arranca las etapas cuyas dependencias terminaron con codigo de salida 0 y cuyo carril esta libre, y registra el resultado de cada una en un fichero como codigo de salida propio. No hay temporizadores ni demonio interno: el avance se dispara desde cron, launchd, una programacion de CI o un bucle propio.

Su relevancia es de infraestructura, no de modelado: resuelve el problema de encadenar pasos costosos (entrenamiento, evaluacion, generacion de datos) sin un orquestador pesado y con trazabilidad explicita de fallos. Incluye una etapa opcional de traspaso (`finally`) que se ejecuta al final de la cadena. Para evaluar capacidad de lenguaje, contexto o cuantizacion, esta ficha no aplica: no hay modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un plugin/orquestador de etapas en Python) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (la documentacion esta en ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible (no contiene pesos; distribucion como plugin de Claude Code y script Python) |

Otros datos tecnicos relevantes:

| Parametro | Valor |
|---|---|
| Requisitos de ejecucion | Python 3.9 o superior, solo biblioteca estandar |
| Interfaz | comando `/relay` en Claude Code; CLI `relay.py` |
| Subcomandos | `tick`, `status`, `add`, `selftest` |
| Estado persistente | ficheros junto al fichero de cadena (`chain.json`) |
| Servicios externos contactados | ninguno segun el autor |
| Verificacion de scripts | descarga desde GitHub en un commit fijado y comprobacion de sha256 |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento. El componente es un planificador por etapas escrito en Python que opera sobre una lista JSON de etapas. Cada etapa contiene como minimo un `id` y un `cmd` (lista de argumentos), y opcionalmente `after` (lista de dependencias), `lane` (carril de ejecucion, por ejemplo `gpu`) y `finally` (marca de etapa de cierre). La unidad de avance es `tick`: una pasada que arranca las etapas elegibles y termina; es idempotente y segura de invocar repetidamente.

El modelo de fallos es explicito. El resultado de cada etapa se escribe en un fichero como su propio codigo de salida; un proceso que desaparecio sin escribir resultado se marca como `FAILED (no rc)` y no como completado. Una etapa cuya dependencia fallo queda en estado `BLOCKED` y aparece listada. `status` muestra todas las etapas con sus tiempos, no solo las que pasaron. El subcomando `add` permite que una etapa de decision anada el siguiente paso, rechazando identificadores duplicados o dependencias desconocidas. `selftest` ejecuta cadenas de prueba en un directorio temporal.

La distribucion tiene un detalle de seguridad relevante: esta copia del repositorio no incluye fichero ejecutable. Los comandos descargan `relay.py` desde el repositorio publico de GitHub en el commit `46c113e5fedcd0c5292224491ad34de86d2c3af1` y lo ejecutan solo si el sha256 coincide con `9d2e36720036b69f1ecb857405e4c2067b4137c8db716827579a8e54c8cb63f0`. La version del marketplace propio del autor incluye los scripts directamente.

## Capacidades

- Orquestacion de etapas con dependencias declarativas (`after`) y ejecucion condicionada al exito (codigo de salida 0) de las dependencias.
- Carriles (`lane`) para limitar concurrencia por recurso, por ejemplo un unico carril `gpu`.
- Registro persistente de resultados por etapa como codigo de salida en fichero.
- Estado consultable con marcas temporales: `waiting`, `running`, `done rc 0`, `failed rc N`, `BLOCKED`.
- Etapa de traspaso final opcional (`finally`) para generar un resumen o lanzar un paso de cierre.
- Extension dinamica de la cadena mediante `add`, pensada para etapas de decision que anaden el siguiente paso.
- Ejecucion sin demonio ni temporizador: integrable en cron, launchd, CI o bucles propios.
- Autoprueba integrada (`selftest`) con cadenas plantadas en directorio temporal.
- Integracion con Claude Code mediante el comando `/relay`.
- No incluye capacidades de generacion de texto, razonamiento, codigo, vision, audio, tool calling de modelo ni agentes por si mismo; esas capacidades dependen de las etapas que el usuario escriba.

## Casos de uso

- Ladders de entrenamiento: una cadena con etapas `train` y `eval` encadenadas por `after`, ambas en el carril `gpu`, permite lanzar el entrenamiento y evaluar automaticamente solo si el entrenamiento termino con exito, registrando cada codigo de salida por separado.
- Barridos de evaluacion: multiples etapas de evaluacion con dependencia de una etapa de preparacion de datos, limitadas por carril para no saturar la GPU, con estado consultable para saber que configuraciones fallaron y con que codigo.
- Pipelines de datos: etapas de descarga, filtrado y tokenizacion encadenadas, donde un fallo en el filtrado deja las etapas posteriores en `BLOCKED` en lugar de ejecutarse sobre datos incompletos.
- Trabajo no atendido nocturno: invocacion de `tick` desde cron o launchd cada cierto intervalo, de modo que la cadena avanza sin supervision y deja un resumen matinal generado por la etapa `finally`.
- Integracion en CI: uso de `tick` desde una programacion de CI para ejecutar etapas costosas que no caben en un job unico, manteniendo el estado en ficheros versionables o persistidos entre ejecuciones.
- Cierre con resumen automatico: etapa `finally` que ejecuta un comando de Claude en modo no interactivo y vuelca la salida a un fichero (por ejemplo `MORNING.md`), util para revisar por la manana el resultado de la cadena.
- Extension dinamica de flujos: una etapa de decision que llama a `relay.py add` para incorporar el siguiente paso segun el resultado previo, sin reescribir la cadena a mano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no tratarse de un modelo de lenguaje, no aplican metricas como MMLU, HumanEval o GSM8K. No se han publicado cifras de latencia ni throughput del planificador.

## Requisitos de hardware

- No requiere GPU ni VRAM para el propio plugin: es un script Python de biblioteca estandar.
- Requiere Python 3.9 o superior.
- El hardware necesario lo determinan las etapas que el usuario declare en la cadena (por ejemplo, una etapa de entrenamiento puede requerir A100, H100 o RTX 4090 segun el modelo que entrene).
- El carril `lane` permite serializar el acceso a un recurso escaso, como una unica GPU, sin necesidad de un gestor de colas externo.
- Opciones de despliegue: ejecucion directa de `relay.py`, invocacion desde Claude Code con `/relay`, o programacion desde cron, launchd o CI.
- Latencia y throughput del planificador: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado alternativas comparables en la informacion. Por categoria, los equivalentes funcionales serian orquestadores de flujos de trabajo (por ejemplo, planificadores de trabajos por dependencias o sistemas de CI con etapas), pero no se dispone de datos de esos sistemas en la informacion proporcionada para establecer una comparacion cifrada.

| Criterio | indahl-relay | Alternativas |
|---|---|---|
| Parametros | no aplica | no disponible |
| Contexto | no aplica | no disponible |
| Rendimiento | no disponible | no disponible |
| Licencia | MIT | no disponible |
| Disponibilidad | Hugging Face y GitHub (Heuremen-LLC/indahl.ai) | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no responde a prompts y no tiene ventana de contexto. Cualquier expectativa de inferencia es incorrecta.
- El repositorio de Hugging Face no incluye el script ejecutable; los comandos lo descargan de GitHub en un commit fijado y lo ejecutan tras verificar el sha256. Conviene auditar ese commit y el hash antes de usarlo en produccion.
- Depende de la disponibilidad de `raw.githubusercontent.com` en el primer uso; si el commit o el fichero desaparecen, la instalacion desde esta copia falla.
- El estado vive en ficheros junto al fichero de cadena; no hay base de datos ni bloqueo distribuido documentado, por lo que la concurrencia de multiples invocaciones de `tick` sobre la misma cadena no esta descrita en la informacion disponible.
- La deteccion de procesos desaparecidos se limita a marcar `FAILED (no rc)`; no hay reintentos automaticos documentados.
- La documentacion esta en ingles y no se declaran idiomas soportados para la interfaz.
- La licencia MIT permite uso comercial, pero la informacion no detalla garantias ni soporte; el autor remite a sus terminos en `indahl.ai/terms`.
- Riesgo de alucinacion: no aplica al plugin; si aplica a las etapas que invoquen modelos de lenguaje, cuyo comportamiento queda fuera del alcance de esta ficha.
- No se han publicado resultados de rendimiento ni pruebas de carga del planificador.

## Enlaces

- Hugging Face: https://huggingface.co/indahl/indahl-relay
- Repositorio fuente: https://github.com/Heuremen-LLC/indahl.ai
- Mirror del plugin: https://github.com/Heuremen-LLC/indahl-relay (commit d07a5ef)
- Script `relay.py` en commit fijado: https://raw.githubusercontent.com/Heuremen-LLC/indahl.ai/46c113e5fedcd0c5292224491ad34de86d2c3af1/claude-plugins/src/relay/scripts/relay.py
- Politica de privacidad: https://indahl.ai/privacy
- Terminos: https://indahl.ai/terms
- Sitio del autor: https://indahl.ai
