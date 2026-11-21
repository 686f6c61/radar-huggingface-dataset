# p99lab/turn-1

## Resumen

turn-1 es un modelo especializado en deteccion de fin de turno (end-of-turn detection) para agentes de voz conversacionales, desarrollado por p99lab. Su funcion no es generar texto ni transcribir audio, sino estimar la probabilidad de que el usuario haya terminado de hablar en un momento dado, leyendo los ultimos 8 segundos de audio y, opcionalmente, la ultima frase del agente. Resuelve un problema concreto de los pipelines de voz: decidir cuando el agente debe tomar la palabra sin cortar al usuario ni introducir silencios incomodos.

Tecnicamente no es un transformer unico entrenado desde cero, sino un ensemble de dos estimadores sobre codificadores de voz abiertos de terceros (uno de 2.0B parametros y otro de 0.8B) a los que p99lab anade cabezas de clasificacion y un adaptador LoRA. La salida es una probabilidad calibrable, sin punto de decision fijo, lo que permite al integrador ajustar el umbral segun su tolerancia a los cortes falsos.

Es relevante porque ataca una metrica de producto (tasa de cortes falsos frente a latencia de respuesta) con un banco publico, eot-bench de LiveKit, y publica intervalos de confianza y una comparacion honesta con alternativas comerciales como Deepgram Flux o JoinIn AI Baton. Su licencia Apache-2.0 y su tamano de repositorio (0.1 GB, ya que los codificadores se descargan aparte) facilitan la reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de dos codificadores de voz abiertos (2.0B y 0.8B) con cabezas de clasificacion y un adaptador LoRA; salida como media de dos estimaciones de P(fin de turno) |
| Parametros totales | 18.9M (cabeza sobre el codificador grande) + 14.8M (LoRA y cabeza sobre el codificador pequeno); los codificadores base suman 2.8B y no se redistribuyen |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8 segundos de audio de entrada (16 kHz mono, filtrado paso bajo a 4 kHz) |
| Tipos de cuantizacion | No disponible; el modelo se ejecuta en float32 |
| Idiomas soportados | Ingles (unico idioma evaluado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`turn-1-head.safetensors`, `turn-1-lora.safetensors`) y paquete Python `p99turn1-1.0.0-py3-none-any.whl` |

## Arquitectura y entrenamiento

turn-1 combina dos rutas sobre el mismo audio. La primera usa un codificador de voz abierto de 4.7 GB (2.0B parametros) sin modificar, sobre cuyas caracteristicas se entrena una cabeza de 18.9M parametros (`turn-1-head.safetensors`, 76 MB). La segunda usa un codificador mas pequeno de 1.9 GB (0.8B parametros) con pesos base congelados, al que se anade en tiempo de ejecucion un adaptador de bajo rango y una cabeza propia (`turn-1-lora.safetensors`, 14.8M parametros, 59 MB). La prediccion final es la media de las dos probabilidades. Los codificadores se descargan de sus repositorios originales en revisiones fijadas y no se redistribuyen en este repositorio.

La entrada es la ventana de los ultimos 8 segundos de audio recibido, filtrado paso bajo a 4 kHz internamente, junto con la ultima intervencion del agente en texto de forma opcional. El modelo nunca recibe como texto las palabras del turno actual del usuario: las escucha. No genera texto ni es incremental; cada decision implica una pasada completa por ambos codificadores. La model card no detalla el volumen ni la composicion del dataset de entrenamiento, ni si hubo ajuste por RLHF o DPO; indica unicamente que el audio y las etiquetas de eot-bench nunca se usaron para entrenar, seleccionar ni calibrar el modelo.

## Capacidades

- Deteccion de fin de turno: devuelve P(fin de turno) en cualquier pausa, sin punto de decision fijo.
- Modo streaming: la API `model.stream()` permite empujar fragmentos de audio y consultar la probabilidad cuando se necesite.
- Condicionamiento por contexto del agente: acepta la ultima frase del agente (`agent_text`) para desambiguar pausas.
- Calibracion por umbral: el integrador fija el umbral segun su tolerancia a cortes falsos.
- No realiza transcripcion, generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No esta orientado a razonamiento multi-paso ni a agentes autonemos; su rol es el control de turno en un pipeline de voz.
- Multilingue: no; solo ingles evaluado.

## Casos de uso

- Endpointing en agentes de voz telefonicos: el modelo se consulta durante las pausas del usuario para decidir si el agente debe responder o esperar, reduciendo cortes en numeros de cuenta, direcciones o frases largas.
- Sustitucion de temporizadores fijos en IVR: en lugar de esperar 500 o 800 ms ciegamente, el orquestador usa P(fin de turno) y ajusta el umbral para equilibrar latencia y cortes falsos.
- Agentes de atencion al cliente con contexto de pregunta: al pasar `agent_text` con la pregunta previa, el modelo distingue pausas de duda de pausas finales en respuestas como numeros de telefono o correos.
- Barge-in controlado en asistentes de escritorio: el pipeline puede decidir si el silencio del usuario es una pausa de reflexion o el final del turno antes de activar la sintesis de respuesta.
- Evaluacion y benchmarking interno de pipelines de voz: al devolver una probabilidad calibrable, permite trazar curvas de cortes falsos frente a latencia y comparar configuraciones propias con eot-bench.
- Moderacion de turnos en grabaciones o post-proceso: el modelo puede puntuar pausas en audio almacenado para segmentar conversaciones y medir tiempos de respuesta del agente.
- Investigacion en turn-taking: sirve como referencia reproducible (Apache-2.0, pesos publicos) para estudiar el compromiso entre latencia y falsos cortes en ingles.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre `livekit/eot-bench-data`, config `en`, split `validation`, revision `ca9d98a`, harness `9ee21b5`: 400 turnos y 705 pausas intra-turno puntuadas, float32, batch 64. Menor es mejor.

| Modelo | Cortes falsos @ 300 ms | Cortes falsos @ 600 ms | Latencia @ 5% cortes falsos | Latencia @ 10% cortes falsos | AUC (diagnostico) |
|---|---:|---:|---:|---:|---:|
| turn-1 | 10.6% (75/705) | 4.5% | 553 ms | 322 ms | 0.976 |
| LiveKit Turn Detector v1 | 9.9% (70/705) | 4.5% | 543 ms | 295 ms | 0.969 |
| JoinIn AI Baton | 12.3% (87/705) | 4.8% | 577 ms | 350 ms | 0.958 |
| Deepgram Flux | 12.9% | 9.9% | 1.151 ms | 548 ms | no disponible |

Intervalos del 95% para turn-1 (bootstrap a nivel de turno, 400 remuestreos): cortes falsos @ 300 ms de 7.7 a 13.8%; @ 600 ms de 2.7 a 6.0%; latencia @ 5% de 399 a 691 ms; @ 10% de 250 a 387 ms. Segun el autor, turn-1 quedaria segundo en cortes falsos @ 300 ms, latencia @ 5% y latencia @ 10%, y empatado primero en cortes falsos @ 600 ms (32/705, mismo conteo que LiveKit Turn Detector v1). Queda por detras de LiveKit Turn Detector v1 en 300 ms, 5% y 10%, y por delante de JoinIn AI Baton en las cuatro estimaciones puntuales. No se realizo test pareado contra otras entradas y los intervalos de un solo modelo se solapan. Se puntuaron dos candidatos de turn-1 sobre el mismo conjunto; el primero obtuvo 12.9% / 4.8% / 593 ms / 363 ms y se conservo el actual bajo una regla fijada antes de puntuar. La latencia reportada es silencio elegido por el barrido de politicas del benchmark, no tiempo de computo.

## Requisitos de hardware

- VRAM estimada: el autor indica una GPU CUDA con 20 GB como configuracion de ejecucion.
- Codificadores: se descargan dos modelos de 4.7 GB y 1.9 GB, lo que condiciona el espacio en disco y la VRAM en float32.
- GPU recomendadas: A100, H100 o GPU de consumo con 24 GB o mas (por ejemplo RTX 3090 o RTX 4090) para cubrir los 20 GB indicados.
- No cabe en GPU de consumo con menos de 20 GB de VRAM en la configuracion reportada.
- Despliegue: paquete Python `p99turn1` (wheel 1.0.0) con dependencia `qwen-asr==0.0.6` para el codigo de los codificadores; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el tiempo por decision no ha sido medido en esta configuracion segun la model card; la latencia de benchmark (553 ms @ 5%, 322 ms @ 10%) corresponde a silencio elegido por el barrido, no a computo.
- El modelo no es incremental: cada decision ejecuta ambos codificadores una vez.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Cortes falsos @ 300 ms | Latencia @ 5% | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| turn-1 | 2.8B en codificadores + 33.7M en cabezas/LoRA | 8 s | 10.6% | 553 ms | Apache-2.0 | Pesos y paquete publicos en Hugging Face |
| LiveKit Turn Detector v1 | no disponible | no disponible | 9.9% | 543 ms | no disponible | Referencia en eot-bench |
| JoinIn AI Baton | no disponible | no disponible | 12.3% | 577 ms | no disponible | Referencia en eot-bench |
| Deepgram Flux | no disponible | no disponible | 12.9% | 1.151 ms | no disponible | Servicio comercial |
| turn-1-mini | 5.3M | no disponible | no disponible | no disponible | no disponible | Version para dispositivo, en Hugging Face |

## Limitaciones y advertencias

- Solo se ha medido en ingles; no se reclama ningun resultado multilingue.
- Modelo pesado: ejecuta dos codificadores (2.0B y 0.8B) por cada decision y requiere una GPU de 20 GB; es un modelo de servidor, no de dispositivo.
- Entrada limitada a 8 segundos de audio y filtrada a 4 kHz, lo que descarta informacion por encima de esa banda.
- No es incremental: cada consulta implica una pasada completa por ambos codificadores, con coste computacional no medido publicamente.
- Los resultados de benchmark son estimaciones puntuales del autor, con intervalos amplios y solapamiento con LiveKit Turn Detector v1; no hay test pareado contra otras entradas.
- Se puntuaron dos candidatos sobre el mismo conjunto de test, lo que introduce riesgo de seleccion; el autor lo documenta.
- La latencia reportada es silencio de politica, no latencia de computo; el rendimiento real dependera del hardware y del umbral elegido.
- Riesgo de alucinacion no aplica en el sentido generativo (no produce texto), pero la probabilidad puede estar mal calibrada en dominios de audio distintos al de evaluacion; el autor recomienda calibrar el umbral sobre audio propio.
- Licencia Apache-2.0 permite uso comercial; los codificadores de terceros se descargan de sus repositorios con sus propias licencias y deben revisarse en el fichero `NOTICE`.
- No soporta tool calling, agentes multi-paso ni generacion de texto; su uso esta acotado al control de turno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/p99lab/turn-1
- Version para dispositivo turn-1-mini: https://huggingface.co/p99lab/turn-1-mini
- Sitio del autor: https://p99lab.com
- Contacto del autor: research@p99lab.com
- Dataset de evaluacion eot-bench: https://huggingface.co/datasets/livekit/eot-bench-data
- Paquete Python: https://huggingface.co/p99lab/turn-1/resolve/main/dist/p99turn1-1.0.0-py3-none-any.whl
