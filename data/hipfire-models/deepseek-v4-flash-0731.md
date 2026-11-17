# hipfire-models/deepseek-v4-flash-0731

## Resumen

DeepSeek-V4-Flash-0731 es un checkpoint de la familia DeepSeek V4 Flash, desarrollado originalmente por DeepSeek, que en esta ficha aparece redistribuido por el usuario hipfire-models como una cuantización MQ2-Lloyd para el runtime hipfire. No se trata de un modelo nuevo, sino de una conversión de pesos pensada para ejecutar un modelo MoE de gran tamaño en hardware con memoria limitada, mediante paginación de expertos desde disco. El repositorio ocupa 180,2 GB e incluye el tronco cuantizado (86,2 GB), un sidecar de borrador DSpark (6,0 GB) y un adaptador experimental de predicción de expertos (44,6 MB).

La arquitectura es un transformer MoE de 43 capas con 256 expertos enrutados más uno compartido y selección top-6 por token. El checkpoint 0731 sustituye la cabeza MTP clásica por una cadena de borrador DSpark de tres etapas, lo que condiciona el despliegue: debe emparejarse con el sidecar `-dspark`, no con uno `-mtp`. La licencia declarada es MIT.

Su relevancia práctica está en la ingeniería de despliegue: la model card documenta con detalle el comportamiento de la caché de expertos en disco, el reparto de tiempo por token y por qué el adaptador de prefetch no mejora el rendimiento. Es material útil para quien planifique servir modelos MoE grandes en GPU de memoria unificada, aunque no aporta datos de capacidades ni benchmarks de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE, 43 capas, 256 expertos enrutados + 1 compartido, top-6 por token, `arch_id=9` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (top-6 de 256 expertos enrutados, mas el compartido) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MQ2-Lloyd (formato propio del runtime hipfire) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.mq2lloyd` (tronco, sidecar DSpark) y `.bin` (adaptador) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos: 43 capas, 256 expertos enrutados y uno compartido, con enrutamiento top-6 por token. La model card menciona que ds4 sustituye el flujo residual convencional por cuatro flujos mezclados con Sinkhorn (denominado mHC), lo que implica que no existe un estado residual de evolución lenta legible por un predictor lineal sencillo. El checkpoint 0731 incorpora una cadena de borrador DSpark de tres etapas en lugar de la cabeza MTP clásica, presumiblemente para decodificación especulativa.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF, DPO u otras). Esta ficha describe una cuantización, no el entrenamiento del modelo original. La innovación documentada aquí es de sistema: paginación de expertos desde disco con presupuesto de caché configurable (`HIPFIRE_DEEPSEEK4_EXPERT_CACHE_GB`), y un adaptador de predicción de expertos ajustado por ridge en forma cerrada sobre 113.433 posiciones de prefill de wikitext, truncado por SVD a rango 128 (22,3 M de parámetros, unos 22 M de MAC por token, menos del 1 % del cómputo por token).

## Capacidades

- Generación de texto autoregresiva mediante el runtime hipfire; no se documentan capacidades específicas más allá de la ejecución del modelo.
- Decodificación especulativa mediante la cadena de borrador DSpark de tres etapas incluida como sidecar.
- Paginación de expertos enrutados desde disco con caché configurable, lo que permite ejecutar el modelo cuando los 72,2 GiB de expertos enrutados no caben en memoria.
- Predicción de la selección de expertos de la capa L+1 a partir del estado oculto de la capa L (adaptador experimental, desactivado por defecto).
- Soporte de tool calling, agentes, visión, audio, modo thinking o capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Servicio de inferencia en GPU de memoria unificada: el tronco de 86,2 GB puede ejecutarse en equipos como Strix Halo manteniendo residentes los pesos no-expertos y paginando los expertos enrutados, con un presupuesto de caché de 32 GiB como punto óptimo medido.
- Evaluación de estrategias de paginación de expertos: la model card ofrece curvas de hit rate y throughput por presupuesto de caché, útiles para dimensionar memoria en un despliegue propio antes de invertir en hardware.
- Investigación sobre prefetch de expertos en MoE: el adaptador r128 y sus métricas de ExpertRecall@M constituyen un punto de partida reproducible para experimentos de predicción de enrutamiento, con la advertencia de que en este modelo no mejora el rendimiento.
- Despliegue con decodificación especulativa: el sidecar DSpark permite probar cadenas de borrador de tres etapas en lugar de cabezas MTP clásicas, comparando latencia y aceptación de tokens.
- Prototipado de asistentes de código o razonamiento de contexto largo: solo si se validan previamente las capacidades del checkpoint base DeepSeek-V4-Flash, ya que esta ficha no aporta datos de calidad ni de contexto.
- Reproducción de experimentos de cuantización de bajo bit: MQ2-Lloyd sobre un MoE de 43 capas y 256 expertos sirve como referencia de hasta dónde se puede comprimir un modelo de este tipo manteniendo un formato propietario de runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos medidos son de rendimiento del runtime, sobre Radeon 8060S / gfx1151 (Strix Halo) con decodificación ds4 MQ2:

| Presupuesto de cache | Slots/blob | Hit rate | tok/s | ms/token | I/O de expertos |
|---|---|---|---|---|---|
| 4 GiB | 14 | 40,5 % | 7,02 | 142 | no disponible |
| 8 GiB | 28 | 59,4 % | 7,06 | 141,7 | 41,9 % |
| 16 GiB | 56 | 74,4 % | no disponible | no disponible | no disponible |
| 32 GiB | 112 | 86,5 % | 9,09 | 110,0 | 26,5 % |
| 64 GiB | 224 | 91,0 % | no disponible | no disponible | no disponible |
| Resident | 256 | 91,3 % | no disponible | no disponible | no disponible |

Desglose por componente a 8 GiB (ablación con el MoE enrutado activado y desactivado):

| Componente | ms/token | Proporcion |
|---|---|---|
| I/O de paginacion de expertos | 59,4 | 42 % |
| Computo GEMV de expertos enrutados | 14,6 | 10 % |
| Atencion, expertos compartidos, normas, lm_head | 67,7 | 48 % |

La ruta MoE enrutada cuesta 74 ms/token, de los cuales el 80 % es I/O. Pasar de 8 GiB a 32 GiB de caché aporta un +28,8 % de throughput; por encima de 32 GiB la curva se aplana (de 32 a 64 GiB solo se ganan 4,5 puntos de hit rate).

## Requisitos de hardware

- VRAM/memoria: el tronco requiere aproximadamente 86 GB; los expertos enrutados suman 72,2 GiB de ese total y pueden paginarse desde disco. El sidecar DSpark ocupa 6,0 GB y el adaptador 44,6 MB.
- GPU recomendadas: no se especifican modelos concretos. Las mediciones se hicieron en Radeon 8060S / gfx1151 (Strix Halo, memoria unificada). La model card sugiere como no probado el caso de GPU discretas (R9700 gfx1201, 7900 XTX gfx1100), donde la transferencia host-to-device no es un memcpy simple.
- GPU de consumo: no hay datos para RTX 4090 u otras; 86 GB de tronco exceden cualquier GPU de consumo actual, por lo que solo es viable con paginación agresiva o memoria unificada.
- Despliegue: runtime hipfire (repositorio github.com/warpfront/hipfire). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Throughput medido: entre 7,02 y 9,09 tok/s en Strix Halo según presupuesto de caché; 110-142 ms/token. El adaptador de prefetch reduce el rendimiento (0,86x-0,93x) en todas las configuraciones probadas.
- Ajuste recomendado: 32 GiB de caché de expertos como mejor relación rendimiento/memoria; por debajo de 8 GiB el hit rate cae por debajo del 60 %.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hipfire-models/deepseek-v4-flash-0731 (esta ficha) | no disponible (MoE 256+1, top-6, 43 capas) | no disponible | 7-9 tok/s en Strix Halo con paginacion | MIT | Hugging Face, runtime hipfire |
| deepseek-ai/DeepSeek-V4-Flash (base) | no disponible | no disponible | no disponible | no disponible en esta ficha | Hugging Face |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre modelos alternativos de la misma categoría para establecer una comparación técnica con datos verificables.

## Limitaciones y advertencias

- Es una cuantización de bajo bit (MQ2-Lloyd) de un checkpoint ajeno: la degradación de calidad respecto al modelo base no está medida ni documentada.
- No se publican datos de sesgos, alucinación, idiomas soportados ni contexto máximo. No debe asumirse ninguno de estos extremos sin validación propia.
- El formato `.mq2lloyd` es específico del runtime hipfire; no es portable a vLLM, llama.cpp, Ollama ni TGI.
- El adaptador de predicción de expertos está desactivado por defecto y, según las mediciones del autor, hace la decodificación más lenta (0,86x-0,93x). Además duplica los bytes leídos (2,10x) y provoca churn en la caché. No debe activarse en producción.
- El checkpoint 0731 requiere el sidecar `-dspark`; emparejarlo con un sidecar `-mtp` es incorrecto.
- La licencia MIT se declara en la model card, pero conviene verificar las condiciones del modelo base DeepSeek-V4-Flash antes de un uso comercial, ya que esta ficha no las recoge.
- El rendimiento es fuertemente dependiente del almacenamiento: la carga es I/O-bound (42 % del tiempo por token a 8 GiB), por lo que un disco lento degradará el throughput de forma directa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hipfire-models/deepseek-v4-flash-0731
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Runtime hipfire: https://github.com/warpfront/hipfire
