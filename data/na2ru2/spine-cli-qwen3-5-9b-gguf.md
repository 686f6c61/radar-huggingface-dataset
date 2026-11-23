# NA2RU2/spine-cli-qwen3.5-9b-GGUF

## Resumen

Spine CLI Qwen3.5-9B GGUF Q8_0 es una cuantización de 8 bits del checkpoint fusionado NA2RU2/spine-cli-qwen3.5-9b, un modelo de 9.197.093.888 parámetros afinado para una tarea muy concreta: generar un único comando de la herramienta Spine CLI a partir de una petición de desarrollo de software escrita en coreano. No es un modelo de propósito general, sino un generador de comandos especializado que devuelve una sola línea sin explicaciones ni bloques de código.

El modelo parte de la familia Qwen3.5 y se ha ajustado mediante SFT sobre el dataset NA2RU2/spine-cli-sft-ko. La distribución se realiza en un único fichero GGUF de 9,79 GB, cuantizado en Q8_0, pensado para ejecutarse con llama.cpp y exponerse mediante un servidor compatible con la API de chat completions. El contexto recomendado en los ejemplos de la model card es de 4096 tokens y se desactiva el modo de razonamiento (`--reasoning off`).

Su relevancia es acotada pero clara: demuestra un patrón de destilación de tareas de ingeniería (selección de comandos CLI con flags y valores exactos) en un modelo de ~9B parámetros, con licencia Apache 2.0 y métricas de coincidencia exacta publicadas sobre un conjunto de 300 casos coreanos independientes. La cuantización Q8_0 iguala o supera ligeramente al BF16 en las métricas reportadas, lo que la convierte en la opción práctica para despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, derivado de NA2RU2/spine-cli-qwen3.5-9b); detalles internos no disponibles |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens en la configuracion de ejemplo de la model card; maximo nativo no disponible |
| Tipos de cuantizacion | Q8_0 (fichero de 9,79 GB); el repositorio base ofrece tambien BF16 GGUF de 18,41 GB |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de su pertenencia a la familia Qwen3.5 y de que el checkpoint publicado es una fusion de pesos (merged weights) junto con el tokenizer en un unico fichero GGUF. El modelo base es NA2RU2/spine-cli-qwen3.5-9b, que a su vez contiene el checkpoint BF16 en safetensors y un adaptador LoRA. El ajuste se realizo mediante SFT supervisado sobre el dataset NA2RU2/spine-cli-sft-ko, orientado a la generacion de comandos Spine CLI en el contexto del proyecto `layered-v1`.

La innovacion tecnica principal no reside en la arquitectura sino en la especializacion: el modelo aprende a mapear una solicitud en lenguaje natural coreano a un comando `spine` con generador, ruta de recurso, flags y valores exactos, respetando además restricciones como `--dry-run --json` cuando la peticion lo exige. La conversion y cuantizacion se realizaron con llama.cpp en el commit `f5e6915c28f10330885fcb9243a93ae98d3115ab`, partiendo de la revision `610348874f06a14483b1a49bcbdbcd61c8e6f3c5` del checkpoint BF16. No se documentan fases de RLHF ni DPO.

## Capacidades

- Generacion de un unico comando Spine CLI a partir de una peticion de desarrollo en coreano, sin explicaciones ni bloques de codigo.
- Seleccion correcta del generador de la CLI (por ejemplo `dto`) y de la ruta del recurso (por ejemplo `billing/payment-search`).
- Emision de flags y valores tipados exactos (por ejemplo `--field owner_id:int64 --field include_pending:bool`).
- Respeto de modificadores de ejecucion como `--dry-run` y `--json` cuando la peticion lo requiere.
- Modo conversacional mediante la API de chat completions (`/v1/chat/completions`) con rol de sistema que fija el comportamiento.
- Ejecucion determinista con `temperature: 0` y `max_tokens: 160`, tal como propone el autor.
- Capacidad de razonamiento desactivable (`--reasoning off`), adecuada para tareas de salida estrictamente formateada.
- No se documentan capacidades de tool calling, agentes multi-paso, vision, audio ni matematicas generales.

## Casos de uso

- Automatizacion de scaffolding en el proyecto `layered-v1`: el modelo traduce una peticion en coreano ("necesito una estructura Go para la API de busqueda de pagos") a un comando `spine g dto ...` listo para ejecutar, eliminando la necesidad de recordar la sintaxis de la CLI.
- Integracion en asistentes de desarrollo internos: al servirse mediante `llama-server` con API compatible con OpenAI, puede conectarse a un chat corporativo que devuelva comandos copiables y verificables antes de su ejecucion.
- Generacion de planes de cambio sin efectos secundarios: cuando la peticion incluye la intencion de no tocar ficheros, el modelo emite `--dry-run --json`, lo que permite revisar el plan en formato estructurado antes de aplicarlo.
- Validacion de intenciones en pipelines de CI: un paso previo puede pedir al modelo el comando correspondiente a una tarea descrita en un issue y compararlo con el comando que el desarrollador pretende ejecutar, detectando discrepancias de flags o rutas.
- Formacion y onboarding de equipos coreanos: el modelo actua como referencia de sintaxis para generadores, flags y convenciones de nombres de la CLI, reduciendo errores en las primeras semanas de uso.
- Despliegue local en estaciones de trabajo: con un fichero GGUF de 9,79 GB y llama.cpp, puede ejecutarse en una maquina con GPU de consumo o incluso en CPU, sin dependencia de servicios externos ni exposicion de codigo propietario.
- Evaluacion de tareas de destilacion: sirve como caso de estudio de como un modelo de ~9B puede alcanzar una coincidencia exacta superior al 97 % en una tarea de formato estricto tras SFT especializado.

## Benchmarks y rendimiento

Los resultados publicados por el autor corresponden a 300 casos coreanos independientes, evaluados con decodificacion greedy en una NVIDIA DGX Spark con llama.cpp. El conjunto de test es distinto de los datos de entrenamiento y validacion.

| Metrica | BF16 GGUF | Q8_0 GGUF |
|---|---:|---:|
| Tamano de fichero | 18,41 GB | 9,79 GB |
| Rol de generador correcto | 298/300 (99,3 %) | 298/300 (99,3 %) |
| Flags y valores exactos | 294/300 (98,0 %) | 295/300 (98,3 %) |
| Comando exacto | 290/300 (96,7 %) | 292/300 (97,3 %) |
| Salidas `route` | 0 | 0 |
| Salidas `slice` | 0 | 0 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 10-12 GB con Q8_0 (fichero de 9,79 GB mas overhead de contexto y cache KV); en torno a 19-21 GB para la variante BF16 de 18,41 GB.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegues con concurrencia; el autor valido el modelo en una NVIDIA DGX Spark.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas de VRAM para Q8_0 (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090). Para BF16 se requieren 24 GB o mas (RTX 3090, RTX 4090).
- Opciones de despliegue: llama.cpp mediante `llama-server` con soporte para Qwen3.5 y API compatible con `/v1/chat/completions`; tambien es utilizable con `llama-cli` y con frontends basados en llama.cpp como Ollama, siempre que la version soporte Qwen3.5.
- Parametros de ejecucion sugeridos: `--ctx-size 4096`, `--reasoning off`, `temperature 0`, `max_tokens 160`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spine CLI Qwen3.5-9B GGUF Q8_0 | 9,197 M | 4096 (config. de ejemplo) | Generacion de comandos Spine CLI en coreano | Apache 2.0 | Hugging Face, GGUF |
| Spine CLI Qwen3.5-9B (BF16) | 9,197 M | no disponible | Mismo modelo en safetensors + LoRA | Apache 2.0 | Hugging Face |
| Qwen3.5-9B base | no disponible en la informacion | no disponible | Modelo generalista | no disponible en la informacion | no disponible en la informacion |

No se dispone de datos publicados de benchmarks comparativos frente a otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: fuera de la generacion de comandos Spine CLI en coreano su utilidad es practicamente nula; no debe emplearse como asistente general.
- Solo soporta coreano; las peticiones en otros idiomas no estan cubiertas por el entrenamiento ni por la evaluacion.
- El contexto de ejemplo es de 4096 tokens; peticiones muy largas o con mucho historial conversacional pueden degradar la calidad.
- Riesgo de alucinacion en flags, rutas o generadores no vistos durante el entrenamiento: la metrica de comando exacto es del 97,3 %, por lo que aproximadamente 1 de cada 37 comandos puede diferir del esperado.
- Se recomienda validar siempre la salida antes de ejecutarla, especialmente si no se usa `--dry-run`.
- El conjunto de evaluacion es de 300 casos y procede del mismo dominio que el entrenamiento; el rendimiento en dominios o convenciones distintas no esta medido.
- No se documentan sesgos sociales ni de otro tipo, pero al estar entrenado solo con datos coreanos de un proyecto concreto puede reproducir sus convenciones y no generalizar a otras estructuras de proyecto.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias; conviene revisar los ficheros LICENSE y NOTICE del repositorio, asi como la atribucion al modelo base.
- El repositorio no registra descargas ni interacciones en el momento de la consulta, por lo que no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NA2RU2/spine-cli-qwen3.5-9b-GGUF
- Modelo base (BF16 safetensors + LoRA): https://huggingface.co/NA2RU2/spine-cli-qwen3.5-9b
- Dataset de entrenamiento y validacion: https://huggingface.co/datasets/NA2RU2/spine-cli-sft-ko
- Resultados por generador y ajustes del benchmark: evaluation.md (en el repositorio del modelo)
- Licencia: LICENSE (en el repositorio del modelo)
- Atribucion upstream y cambios: NOTICE (en el repositorio del modelo)
- Checksum SHA-256: SHA256SUMS (en el repositorio del modelo)
- llama.cpp: https://github.com/ggml-org/llama.cpp
