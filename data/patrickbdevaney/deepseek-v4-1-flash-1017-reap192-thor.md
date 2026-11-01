# patrickbdevaney/DeepSeek-V4.1-Flash-1017-REAP192-Thor

## Resumen

DeepSeek-V4.1-Flash-1017-REAP192-Thor es una compilación optimizada del modelo DeepSeek-V4.1-Flash-1017, publicado por el desarrollador independiente patrickbdevaney. Se trata de una versión podada del modelo base de DeepSeek en la que se han eliminado 192 de los 384 expertos enrutados (50%) mediante la técnica REAP (expert pruning), reduciendo el peso del checkpoint hasta los 106,9 GiB en un formato propietario denominado `thor-v1`. El objetivo declarado es que el modelo quepa y funcione en una única placa NVIDIA Jetson AGX Thor de 128 GB, un dispositivo de borde (edge) con memoria unificada, no en un clúster de GPUs de centro de datos.

La arquitectura subyacente es un transformer de mezcla de expertos (MoE) con atención MLA/DSA, expertos compartidos, enrutador y una ruta "mHC", según se deduce de los nombres de ficheros del repositorio. El autor no publica en la model card el número total de parámetros ni la longitud de contexto del modelo base, aunque sí menciona un estado de contexto de hasta 1M de tokens en FP8 (2,0 GiB) dentro del presupuesto de memoria del dispositivo. El modelo está pensado exclusivamente para generación de texto en inglés; la torre de visión está presente en los pesos pero el servidor CUDA no la ejecuta todavía.

La relevancia de esta ficha es doble: por un lado, documenta un caso real de despliegue de un MoE de gran tamaño en hardware de borde con streaming de tablas Engram desde NVMe mediante O_DIRECT; por otro, ilustra las limitaciones de los artefactos derivados de terceros, con licencia MIT, sin benchmarks publicados y con un ecosistema de herramientas propio (servidor CUDA y rama de llama.cpp del mismo autor) que condiciona su adopción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención MLA/DSA, expertos compartidos, enrutador y ruta mHC (según nombres de ficheros del repo) |
| Parametros totales | no disponible (el modelo base no declara cifra en la información proporcionada) |
| Parametros activos | no disponible (MoE con 192 de 384 expertos enrutados tras poda) |
| Longitud de contexto | hasta 1M de tokens (estado de contexto FP8 de 2,0 GiB citado por el autor) |
| Tipos de cuantizacion | `thor-v1`: K-quant de 2,828 bpw en expertos enrutados + FP8/BF16 en ruta densa; artefactos hermanos en MXFP4+FP8 y GGUF (2,46 bpw I-quant + Q8_0/Q6_K) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors por capas (`layer-00.safetensors` a `layer-39.safetensors`, `dense.safetensors`, `vision.safetensors`) con layout `thor-v1` (`thor.json`) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4.1-Flash-1017 es un transformer de mezcla de expertos con atención MLA (Multi-head Latent Attention) y DSA, expertos compartidos y un enrutador que selecciona expertos por token. El artefacto aquí descrito no reentrena el modelo: aplica una poda REAP que conserva 192 de los 384 expertos enrutados mediante un keep-set fijo (`1ace9b33134a2ca7`, registrado en `reap_keepset.json`), y después recuantiza los expertos supervivientes desde el checkpoint MXFP4 original con redondeo por retroalimentación de error GPTQ y una ganancia de "healing" plegada. La ruta densa (MLA, DSA, expertos compartidos, enrutador y mHC) se mantiene en FP8/BF16 nativo.

La innovación principal del despliegue es el streaming de las tablas Engram: en lugar de mantenerlas residentes en memoria, el servidor CUDA las lee por token desde NVMe local con `O_DIRECT`, lo que permite ajustar el modelo en los 128 GB unificados del Jetson AGX Thor. El autor reporta un consumo residente de 106,9 GiB (89,5 GiB de expertos enrutados a 2,828 bpw más la ruta densa), con 2,0 GiB para el estado de contexto de 1M de tokens y 6,0 GiB de workspace del decodificador, sobre un presupuesto total de 114,9 de 117,0 GiB. La decodificación especulativa DSpark (3 borradores por verificación) está activada por defecto y promedia 1,345× sobre decodificación plana en 27 prompts retenidos, con salida idéntica en modo greedy. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto en inglés con pipeline `text-generation`.
- Razonamiento multi-paso y conversación multi-turno gracias a una ventana de contexto de hasta 1M de tokens (según el autor).
- Soporte de tool calling mediante DSML tools en el servidor CUDA propietario (`deepseek-v4.1-flash-cuda-server`), con API compatible con OpenAI y interfaz web.
- Decodificación especulativa integrada (DSpark) para acelerar la generación sin cambiar la salida en modo greedy.
- Capacidad de visión presente en los pesos (`vision.safetensors`) pero no operativa en este build: el servidor CUDA no acepta entradas de imagen. Para visión hay que usar el artefacto GGUF con su mmproj en la rama de llama.cpp del autor.
- No se documentan capacidades de audio ni de otros modos.

## Casos de uso

- Inferencia de borde en un único Jetson AGX Thor: el caso de uso central del artefacto; permite servir un MoE de gran tamaño en un dispositivo de 128 GB sin clúster, con 25-40 tok/s de decodificación y 739 tok/s de prefill.
- Asistente conversacional local con contexto largo: la ventana de hasta 1M de tokens y el estado de contexto en FP8 permiten mantener historiales extensos o documentos completos en memoria, útil en entornos sin conectividad.
- Automatización con tool calling en local: el servidor expone API compatible con OpenAI y herramientas DSML, lo que facilita integrar el modelo en agentes que llaman a funciones externas sin depender de la nube.
- Procesamiento por lotes de texto en inglés: tareas de resumen, extracción o clasificación sobre corpus largos, aprovechando el prefill de 739 tok/s para digerir entradas extensas.
- Investigación en poda de expertos y cuantización extrema: el repositorio incluye pipeline (`ops/s01` a `s12`), keep-set y formato documentado, lo que lo convierte en material de estudio para reproducir REAP y GPTQ con retroalimentación de error.
- Prototipado de despliegues edge con streaming desde NVMe: el patrón Engram con O_DIRECT sirve de referencia para servir modelos que no caben íntegramente en memoria unificada.
- Evaluación comparativa de formatos: al existir artefactos hermanos en MXFP4+FP8, `thor-v1` y GGUF, permite medir el compromiso entre tamaño, velocidad y fidelidad en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo reporta métricas de rendimiento de inferencia medidas el 2026-10-30 en un Jetson AGX Thor de 128 GB:

| Metrica | Valor |
|---|---|
| Decodificacion (plana) | 25,3 tok/s |
| Decodificacion (DSpark, por defecto) | 25-40 tok/s (media 1,345× sobre plana en 27 prompts) |
| Decodificacion con muestreo (T=0,7) | misma velocidad que plana |
| Prefill | 739 tok/s |
| Cifra de release previa | 8,09 tok/s |
| Decodificacion via GGUF en llama.cpp | 12,4 tok/s (19,9 con DSpark) |
| Huella residente | 106,9 GiB de 114,9/117,0 GiB de presupuesto |

## Requisitos de hardware

- VRAM/memoria: 106,9 GiB residentes en memoria unificada; presupuesto total de 114,9 de 117,0 GiB, incluyendo 2,0 GiB de estado de contexto de 1M de tokens y 6,0 GiB de workspace.
- GPU objetivo: una única NVIDIA Jetson AGX Thor de 128 GB (arquitectura `sm_110a`). No se documenta soporte para A100, H100 ni RTX 4090 en este build.
- GPU de consumo: no cabe en ninguna GPU de consumo convencional por el tamaño del checkpoint (106,9 GiB) y por el requisito de memoria unificada y streaming NVMe.
- Almacenamiento: NVMe local imprescindible para el streaming O_DIRECT de las tablas Engram.
- Despliegue: servidor CUDA propietario `deepseek-v4.1-flash-cuda-server` (`./start.sh`, API OpenAI, DSML tools, interfaz web). Alternativa GGUF con la rama `deepseek-v4.1-reap-thor` de llama.cpp (12,4 tok/s, 19,9 con DSpark, con visión vía mmproj).
- Latencia y throughput: 25-40 tok/s de decodificación y 739 tok/s de prefill en el hardware objetivo, según medición del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-REAP192-Thor (este) | MoE, 192/384 expertos enrutados | hasta 1M (según autor) | `thor-v1`, 106,9 GiB | MIT | 1× Jetson AGX Thor 128 GB |
| DeepSeek-V4.1-Flash-1017-REAP192-MXFP4 (hermano) | MoE, 192/384 expertos enrutados | no disponible | MXFP4+FP8 safetensors, 146,4 GiB | MIT | Checkpoint maestro bit-exacto |
| DeepSeek-V4.1-Flash-1017-REAP192-GGUF (hermano) | MoE, 192/384 expertos enrutados | no disponible | GGUF 3 shards, 85,55 GiB | MIT | llama.cpp (rama del autor) |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | no disponible | no disponible en la información | no disponible |

No se dispone de datos de benchmarks que permitan comparar calidad con alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo inglés: el modelo declara únicamente el idioma `en`; no hay soporte multilingüe documentado.
- Sin benchmarks de calidad publicados: no hay evidencia en la información disponible sobre MMLU, HumanEval, GSM8K ni evaluaciones de alucinación o sesgo.
- Poda agresiva del 50% de expertos enrutados: puede degradar capacidades respecto al modelo base, especialmente en dominios poco representados; el autor no publica una evaluación de la pérdida de calidad.
- Visión no operativa en este build: aunque los pesos de la torre de visión están presentes, el servidor CUDA no acepta imágenes; hay que recurrir al artefacto GGUF.
- Dependencia de herramientas propietarias del autor: servidor CUDA propio, rama de llama.cpp propia y formato `thor-v1` documentado solo en un repositorio de GitHub; no hay soporte en vLLM, TGI u Ollama documentado.
- Requisito de hardware muy específico: Jetson AGX Thor de 128 GB con NVMe local; no es desplegable en GPUs de centro de datos ni de consumo según la información disponible.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan mitigaciones específicas.
- Licencia MIT: permite uso comercial, pero al ser un artefacto derivado de un modelo base de DeepSeek, conviene verificar las condiciones del modelo original antes de producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria mínimos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/patrickbdevaney/DeepSeek-V4.1-Flash-1017-REAP192-Thor
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Artefacto hermano MXFP4: https://huggingface.co/patrickbdevaney/DeepSeek-V4.1-Flash-1017-REAP192-MXFP4
- Artefacto hermano GGUF: https://huggingface.co/patrickbdevaney/DeepSeek-V4.1-Flash-1017-REAP192-GGUF
- Pipeline y parches: https://github.com/patrickbdevaney/deepseek-v4.1-flash-reap-thor
- Servidor CUDA: https://github.com/patrickbdevaney/deepseek-v4.1-flash-cuda-server
- Rama de llama.cpp: https://github.com/patrickbdevaney/llama.cpp/tree/deepseek-v4.1-reap-thor
- Propuesta de formato `thor-v1`: https://github.com/patrickbdevaney/deepseek-v4.1-flash-reap-thor/blob/main/cuda/FORMAT_PROPOSAL.md
- Script de streaming Engram: https://github.com/patrickbdevaney/deepseek-v4.1-flash-reap-thor/blob/main/ops/s09_engram_rowfile.py
