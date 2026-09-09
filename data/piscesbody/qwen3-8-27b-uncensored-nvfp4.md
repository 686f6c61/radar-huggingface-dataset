# piscesbody/Qwen3.8-27B-Uncensored-NVFP4

## Resumen

El modelo Qwen3.8-27B-Uncensored-NVFP4 es una cuantizacion de precision mixta (NVFP4/FP8/BF16) del checkpoint BF16 "orcarouter/Qwen3.8-27B-Uncensored", que a su vez es una version "uncensored" y "abliterated" del modelo multimodal Qwen3.8 de Alibaba. Ha sido desarrollado por piscesbody y publicado en HuggingFace bajo licencia Apache-2.0. El objetivo es ofrecer un modelo de vision-lenguaje con pesos reducidos y mayor velocidad de decodificacion en GPUs consumer, preservando las modificaciones de abliteracion del checkpoint base.

La cuantizacion utiliza NVFP4 (W4A4 serializado, grupo 16) para las proyecciones MLP y lm_head, FP8 e4m3 por tensor para las proyecciones de atencion y GDN linear_attn, y mantiene en BF16 los embeddings, normas y la torre de vision. Esto reduce el tamano en disco a 21.1 GB (20.2 GB en modo solo texto) frente a los 29 GB del checkpoint FP8 fuente. Se trata de un modelo multimodal que acepta texto e imagen/video, con soporte para ingles y chino. El nombre del modelo sugiere 27B, pero el conteo real de parametros en los safetensors es 18.164.649.200 (18.16B).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal GDN (48 capas) y self-attention parcial (16 capas), 64 capas de MLP, mas torre de vision BF16 (config multimodal) |
| Parametros totales | 18.164.649.200 (18.16B) segun safetensors; el nombre del modelo indica 27B pero el conteo real de pesos es 18.16B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la documentacion no especifica el maximo; con KV cache FP8 en 48GB se observa un pool de ~500k tokens) |
| Tipos de cuantizacion | NVFP4 (W4A4 serializado, grupo 16) para MLP y lm_head; FP8 e4m3 per-tensor para GDN linear_attn y self_attn; BF16 para embed_tokens, normas y torre de vision |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (3 shards) + hf_quant_config.json (manifiesto modelopt MIXED_PRECISION) |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura hibrida que combina atencion lineal GDN en 48 capas con self-attention completa en 16 capas, mas 64 capas de MLP. La torre de vision se mantiene en BF16 y se incluye en el checkpoint, de modo que el modelo sirve tanto para tareas de solo texto como para vision-lenguaje. La configuracion composite se llama "Qwen3_5ForConditionalGeneration" con un text_config anidado.

No ha habido entrenamiento adicional: el proceso es una cuantizacion post-entrenamiento del checkpoint BF16 uncensored mediante NVIDIA Model Optimizer (modelopt 0.46.0). La calibracion se realizo con cnn_dailymail (512 muestras x 2048 tokens, algoritmo max). El checkpoint base ya habia sido sometido a un proceso de "abliteracion" para eliminar comportamientos de rechazo, y esas modificaciones se preservan byte a byte en esta cuantizacion. No se realizo RLHF ni DPO en esta version.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento semantico y aritmetico: la suite interna L1 reporta 6/6 aciertos.
- Razonamiento resistente a contaminacion: la suite L2 (AIME 2025, combinatoria, teoria de numeros, codigo LIS, logica china y formato estricto) reporta 6/6 aciertos.
- Vision-lenguaje: mantiene la torre de vision BF16 y la configuracion multimodal, por lo que puede procesar imagenes y video.
- Decodificacion rapida: 100-125 tokens/s en un RTX 4090 48G con SGLang y decodificacion especulativa DFlash2.
- No se especifican capacidades de tool calling, function calling ni modos de pensamiento en la documentacion disponible.

## Casos de uso

- Inferencia multimodal en local: el modelo puede procesar imagenes y video en una GPU consumer (por ejemplo, RTX 4090 con 48GB) gracias a la torre de vision BF16 y la cuantizacion NVFP4, sin necesidad de servidores caros.
- Servicio de chat sin restricciones: la version "uncensored" y "abliterated" permite generar respuestas que el modelo original rechazaria, lo que resulta util en investigacion de alineacion o en escenarios de role-play donde se requiere menos filtrado.
- Razonamiento matematico y logico en chino e ingles: la suite de evaluacion interna muestra solidez en problemas de estilo AIME y logica china, por lo que puede usarse en tutoria o generacion de ejercicios.
- Generacion de codigo con contexto largo: aunque no se menciona el maximo de contexto, el pool de KV cache observado de ~500k tokens en 48GB permite manejar prompts extensos, por ejemplo para completar repositorios de codigo.
- Analisis de documentos largos: la ventana amplia (con KV cache FP8) y la capacidad de vision permiten resumir o extraer informacion de documentos extensos con figuras, diagramas y texto.
- Investigacion en cuantizacion mixta: este checkpoint sirve como caso de estudio para comparar recetas NVFP4/FP8/BF16 en arquitecturas hibridas, y su proceso de reproduccion esta documentado en scripts incluidos en el repo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye una suite interna de razonamiento y mediciones de rendimiento propias:

| Evaluacion / metrica | Resultado (este modelo) | Resultado (FP8 source) |
|---|---|---|
| Suite L1 (razonamiento semantico+aritmetico) | 6/6 | 6/6 |
| Suite L2 (resistente a contaminacion) | 6/6 | 6/6 |
| Peso en disco (con vision) | 21.1 GB | 29 GB |
| Peso en disco (solo texto) | 20.2 GB | No especificado |
| KV cache pool @48G | ~500k tokens | ~310k tokens |
| Decode single-stream (tarea de codigo) | 100-125 tok/s | 73-84 tok/s |
| Cold prefill 14k tokens | ~3200 tok/s | 4280 tok/s |
| Puntuacion de razonamiento combinado | 12/12 | 12/12 |

Estos datos se obtuvieron en una RTX 4090 48G con TP1, DFlash2 speculative decoding K=8 y KV cache en FP8.

## Requisitos de hardware

- VRAM estimada: los pesos cuantizados ocupan 21.1 GB con vision y 20.2 GB en modo solo texto. La medicion de referencia se realizo en una RTX 4090 48G. En una GPU de 24GB, la capacidad de KV cache se reduce considerablemente; no se recomienda para contextos largos.
- GPU recomendadas: Ada (RTX 4090, SM89) y Blackwell (RTX 5090, B200, etc.). En Ada los GEMM FP4 se ejecutan a traves de Marlin W4A16 automaticamente; en Blackwell se usan tensor cores FP4 nativos via flashinfer/cutlass.
- Opciones de despliegue: SGLang (validado con un fork de main ~2026-08-31 con soporte modelopt MIXED) y vLLM (>=0.27, no validado por el autor). No se mencionan llama.cpp ni Ollama.
- Latencia y throughput: en RTX 4090 48G, decodificacion 100-125 tok/s y prefill ~3200 tok/s para 14k tokens con decodificacion especulativa. El prefill sufre una penalizacion en Ada por la des-cuantizacion Marlin; en Blackwell no deberia existir.

## Comparativa con modelos similares

| Modelo | Tamano en disco | Decode (4090 48G) | Prefill 14k | KV pool @48G | Razonamiento interno | Cuantizacion | Licencia |
|---|---|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-NVFP4 (este) | 21.1 GB | 100-125 tok/s | ~3200 tok/s | ~500k | 12/12 | NVFP4/FP8/BF16 mixto | Apache-2.0 |
| Qwen3.8-27B-Uncensored (FP8 source) | 29 GB | 73-84 tok/s | 4280 tok/s | ~310k | 12/12 | FP8 | Apache-2.0 |
| nvidia/Qwen3.8-27B-NVFP4 | No disponible | No disponible | No disponible | No disponible | No disponible | NVFP4/FP8/BF16 mixto | No disponible |

La comparativa se basa en los datos proporcionados por el autor del checkpoint. El modelo de NVIDIA no ha sido evaluado en la informacion disponible, pero la receta de cuantizacion de este checkpoint lo replica sobre los pesos uncensored.

## Limitaciones y advertencias

- No se han ejecutado benchmarks de rechazo (AdvBench/StrongREJECT) sobre esta cuantizacion; aunque la abliteracion del checkpoint base se preserva por construccion, no hay garantia de que el modelo no genere contenido no deseado.
- La cuantizacion NVFP4 del lm_head es agresiva; el autor reporta que pasa su suite de 12 preguntas, pero podria degradar la precision en tareas sensibles a la distribucion del vocabulario.
- El modelo soporta principalmente ingles y chino; no se han verificado capacidades multilingues mas amplias.
- El uso de las modificaciones "uncensored" puede suponer un riesgo legal y etico en aplicaciones de produccion, especialmente si se despliega sin barreras de seguridad.
- En GPUs Ada, el prefill sufre una penalizacion por la des-cuantizacion Marlin W4A16; para cargas de trabajo con prefill intensivo se recomienda hardware Blackwell.
- El despliegue multimodal con SGLang requiere un fork especifico con soporte modelopt MIXED; el checkpoint no carga como configuracion plana de solo texto si se quiere la ruta multimodal.
- vLLM no ha sido validado por el autor, por lo que pueden aparecer problemas de carga o de configuracion.
- El modelo no es un checkpoint oficial de Alibaba; es una modificacion de terceros, por lo que su calidad y comportamiento no estan respaldados por el fabricante original.
- El nombre "27B" no se corresponde con el conteo real de parametros (18.16B), lo que puede confundir la seleccion del modelo en funcion del tamano esperado.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/piscesbody/Qwen3.8-27B-Uncensored-NVFP4
- Modelo base (orcarouter/Qwen3.8-27B-Uncensored): https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Referencia de cuantizacion NVIDIA (nvidia/Qwen3.8-27B-NVFP4): https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
