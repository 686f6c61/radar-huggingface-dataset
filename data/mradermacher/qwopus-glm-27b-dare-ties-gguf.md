# mradermacher/Qwopus-GLM-27B-dare-ties-GGUF

## Resumen

Qwopus-GLM-27B-dare-ties-GGUF es una coleccion de cuantizaciones GGUF estaticas generadas por mradermacher a partir del modelo fusionado rodrigomt/Qwen-3.5-Opus-GLM-27B. No se trata de un modelo entrenado desde cero, sino de un merge de tipo DARE-TIES (realizado con mergekit) que combina dos destilaciones: Jackrong/Qwopus3.5-27B-v3.5 y Jackrong/Qwen3.5-27B-GLM5.1-Distill-v1. El resultado es un modelo denso de aproximadamente 26.900 millones de parametros, con licencia Apache 2.0 y declarado como ingles.

El interes practico de esta publicacion no esta en el modelo en si, sino en el empaquetado: mradermacher ofrece once variantes GGUF (desde Q2_K de 10,8 GB hasta Q8_0 de 28,7 GB) listas para llama.cpp, Ollama y otros runners compatibles, ademas de una version con quants ponderados/imatrix en un repositorio hermano. Esto permite ejecutar un modelo de ~27B en hardware de consumo con perdida de calidad controlada.

La relevancia es acotada pero clara: para quien quiera evaluar la fusion Qwen/GLM sin montar el pipeline de mergekit ni convertir pesos a GGUF, este repositorio es la via mas directa. No hay model card tecnica detallada, ni datos de entrenamiento, ni benchmarks publicados por el autor de la fusion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-27B, segun los modelos base); detalles de capas no disponibles |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes i1/imatrix en repositorio aparte |
| Idiomas soportados | en (declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (origen en safetensors via transformers) |

## Arquitectura y entrenamiento

El modelo subyacente es una fusion DARE-TIES generada con mergekit sobre dos destilaciones de 27B: Qwopus3.5-27B-v3.5 y Qwen3.5-27B-GLM5.1-Distill-v1. DARE-TIES combina pesos podando deltas de tarea redundantes (DARE) y resolviendo conflictos de signo entre matrices (TIES), lo que en la practica produce un modelo que hereda capacidades de ambos padres sin un entrenamiento posterior de alineacion documentado.

No hay informacion disponible sobre el numero de tokens de entrenamiento de los modelos originales, la composicion del dataset, ni sobre fases de RLHF/DPO aplicadas tras la fusion. Tampoco se documentan innovaciones de inferencia (decodificacion especulativa, atencion lineal, etc.). El trabajo de mradermacher se limita a la conversion HF a GGUF y a la cuantizacion estatica; no se indica si se aplico calibracion imatrix en esta variante (las versiones ponderadas estan en el repositorio i1-GGUF).

## Capacidades

- Generacion de texto conversacional en ingles, heredada de los modelos Qwen3.5 y de la destilacion GLM.
- Razonamiento y matematicas: presumible por la base Qwen3.5-27B, pero sin verificacion empirica en la informacion disponible.
- Generacion de codigo: presumible por la base, sin benchmarks publicados en este repositorio.
- Tool calling / function calling: no confirmado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: limitadas a ingles segun la model card; no se declaran otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Evaluacion local de la fusion Qwen/GLM: descargar Q4_K_M (16,6 GB) y compararlo con los modelos padre en tareas de razonamiento y estilo, sin necesidad de ejecutar mergekit.
- Despliegue en estaciones de trabajo con una sola GPU de 24 GB: la variante IQ4_XS (15,3 GB) o Q4_K_S (15,7 GB) cabe en VRAM con contexto moderado, permitiendo prototipado rapido de asistentes conversacionales en ingles.
- Generacion de texto asistida en pipelines batch: usar llama.cpp con Q5_K_M (19,3 GB) para tareas de redaccion, resumen o reescritura en ingles donde no se requiere tool calling.
- Investigacion sobre cuantizacion: comparar la degradacion de perplejidad entre Q2_K, Q4_K_M y Q8_0 sobre el mismo merge para estudiar el impacto de los quants en modelos fusionados.
- Base para fine-tuning ligero (LoRA): partir del repositorio original en safetensors (rodrigomt/Qwen-3.5-Opus-GLM-27B) y usar este GGUF solo para inferencia comparativa.
- Servicio interno de bajo coste en CPU: la variante Q2_K (10,8 GB) permite ejecucion en servidores sin GPU con llama.cpp, a costa de calidad notablemente inferior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache): Q2_K ~10,8 GB; Q4_K_M ~16,6 GB; Q6_K ~22,2 GB; Q8_0 ~28,7 GB. Sumar 1-4 GB adicionales para KV cache segun contexto.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M/IQ4_XS con contexto medio; A100 40 GB o H100 80 GB para Q6_K/Q8_0 con contexto largo; RTX 3090 (24 GB) equivalente a la 4090 en capacidad.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con Q4_K_M o inferiores; en GPUs de 16 GB solo Q2_K/Q3_K_S con contexto reducido o descarga parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runner compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa; para esos se requiere el repositorio original en safetensors.
- Latencia y throughput: no disponibles; dependen fuertemente del hardware y del quant elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwopus-GLM-27B-dare-ties (este) | ~26,9 B | no disponible | Apache 2.0 | GGUF | Fusion DARE-TIES de dos destilaciones de 27B |
| rodrigomt/Qwen-3.5-Opus-GLM-27B | ~26,9 B | no disponible | Apache 2.0 | safetensors | Modelo base del que derivan estos GGUF |
| Jackrong/Qwopus3.5-27B-v3.5 | no disponible | no disponible | no disponible | no disponible | Uno de los padres de la fusion |
| Jackrong/Qwen3.5-27B-GLM5.1-Distill-v1 | no disponible | no disponible | no disponible | no disponible | Otro padre de la fusion |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo fusionado sin evaluacion publicada: el autor de la fusion no publica benchmarks, por lo que el rendimiento real frente a los padres es desconocido.
- Solo ingles declarado: no apto para produccion en castellano u otros idiomas sin validacion previa.
- Riesgo de alucinacion estandar en modelos destilados y fusionados; sin datos de calibracion ni evaluaciones de factualidad.
- Las fusiones DARE-TIES pueden degradar capacidades especificas de cada padre (por ejemplo, tool calling o matematicas) al promediar pesos; conviene validar en la tarea concreta.
- La licencia Apache 2.0 se aplica al empaquetado, pero las condiciones de los modelos padre y del dataset de entrenamiento original deben verificarse por separado antes de uso comercial.
- Los quants Q2_K y Q3_K_S degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- Repositorio de 186,3 GB: la descarga completa de todos los quants es costosa; conviene bajar solo la variante necesaria.
- Sin garantias de mantenimiento: 251 descargas y 0 likes sugieren adopcion muy baja y poca validacion comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwopus-GLM-27B-dare-ties-GGUF
- Quants imatrix/ponderados: https://huggingface.co/mradermacher/Qwopus-GLM-27B-dare-ties-i1-GGUF
- Modelo base (safetensors): https://huggingface.co/rodrigomt/Qwen-3.5-Opus-GLM-27B
- Padre 1: https://huggingface.co/Jackrong/Qwopus3.5-27B-v3.5
- Padre 2: https://huggingface.co/Jackrong/Qwen3.5-27B-GLM5.1-Distill-v1
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwopus-GLM-27B-dare-ties-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de quant (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
