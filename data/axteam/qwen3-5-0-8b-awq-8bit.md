# axteam/Qwen3.5-0.8B-AWQ-8bit

## Resumen

Qwen3.5-0.8B-AWQ-8bit es una cuantizacion de 8 bits (W8A16) del modelo multimodal Qwen/Qwen3.5-0.8B, producida por axteam para servir el modelo de forma eficiente con vLLM. El modelo base es un transformer denso de aproximadamente 853 millones de parametros con arquitectura hibrida (atencion lineal combinada con atencion completa), capacidades de vision y una cabeza de prediccion multi-token (MTP). Esta version reduce el peso en disco hasta unos 1,3 GB manteniendo las activaciones en BF16, lo que la hace adecuada para entornos con recursos limitados.

La relevancia de esta ficha radica en que demuestra que la cuantizacion INT8 con AWQ conserva practicamente intacto el rendimiento del original: la recuperacion media en los benchmarks medidos es del 99,4% respecto al BF16, con una perplejidad solo un 0,1% superior. Es, por tanto, una opcion atractiva para desplegar un modelo multimodal pequeno en produccion sin renunciar a la fidelidad del original.

El modelo se publica bajo licencia Apache-2.0, lo que permite uso comercial, y esta pensado para servir mediante vLLM (arquitectura soportada desde vLLM 0.17.0, probada con 0.32.0) o con Transformers 5.2.0 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (linear-attention + full-attention), denso, multimodal (vision), con cabeza MTP |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32768 tokens (valor usado en el ejemplo de despliegue con `--max-model-len`) |
| Tipos de cuantizacion | AWQ INT8 W8A16, grupo de tamano 32, pesos INT8 simetricos, activaciones BF16; formato compressed-tensors `pack-quantized` |
| Idiomas soportados | No disponible (la calibracion uso un corpus mixto con predominio de coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors `pack-quantized` |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B emplea una arquitectura hibrida que combina capas de atencion lineal con capas de atencion completa, ademas de un torre de vision y un proyector multimodal, y una cabeza de prediccion multi-token (MTP). Esta version cuantizada mantiene en BF16 el torre de vision y el proyector (`model.visual.*`), la cabeza MTP (`mtp.*`), todas las RMSNorm, los embeddings de tokens, la LM head y las partes no lineales del modulo SSM (`linear_attn.conv1d/A_log/dt_bias`). Aproximadamente el 43% de los parametros permanece sin cuantizar para preservar la calidad.

La cuantizacion es post-entrenamiento (PTQ), sin reentrenamiento. AWQ utiliza un conjunto de calibracion de 256 muestras de un corpus mixto con predominio de coreano para proteger los canales de pesos mas relevantes antes del redondeo. En la revision del 2026-11-01 se restauraron de forma bit-exacta los pesos RMSNorm sin suavizar del original, eliminando el ruido de redondeo BF16 (de hasta el 0,4% en la ganancia efectiva) que habia introducido el manejo de offset-norm de llm-compressor. Los pesos cuantizados y las normas suavizadas por AWQ no cambiaron.

## Capacidades

- Generacion de texto conversacional y razonamiento de proposito general.
- Procesamiento de imagenes y texto (pipeline `image-text-to-text`), gracias al torre de vision conservado en BF16.
- Razonamiento matematico basico y resolucion de problemas aritmeticos (evaluado en GSM8K).
- Comprension lectora y conocimiento general (evaluado en MMLU, ARC-Challenge, Winogrande).
- Capacidades multilingues, con especial cobertura del coreano (KMMLU, HAE-RAE) y del ingles.
- Prediccion multi-token mediante la cabeza MTP, orientada a decodificacion especulativa.
- Compatibilidad con el servidor OpenAI-compatible de vLLM, lo que facilita la integracion en aplicaciones existentes.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con una ventana de hasta 32.768 tokens, suficiente para historiales largos y documentacion adjunta, con un coste de memoria reducido gracias a los 1,3 GB de pesos.
- Procesamiento de documentos con imagenes: al conservar el torre de vision, puede extraer informacion de capturas, formularios o graficos y responder preguntas sobre ellos en un mismo pipeline.
- Clasificacion y extraccion de informacion: tareas de etiquetado, resumen y extraccion de entidades sobre textos en ingles y coreano, con una fidelidad del 98,1% en la prediccion del siguiente token respecto al original.
- Despliegue en entornos con GPU de gama media: al requerir solo 1,3 GB de pesos y soportar GPUs NVIDIA Turing (sm75) o superiores, es viable en tarjetas consumer y en instancias cloud economicas.
- Prototipado rapido de aplicaciones multimodales: la integracion con el servidor OpenAI-compatible de vLLM permite sustituir un endpoint existente sin cambiar el codigo cliente.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye mediciones frente a FP8-dynamic, NVFP4A16, NVFP4 y AWQ-4bit, lo que lo convierte en una referencia util para estudiar el impacto de cada esquema.
- Generacion de codigo en produccion: no disponible en la informacion proporcionada; no se han publicado evaluaciones de codigo para este modelo.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness sobre vLLM, decodificacion greedy y prompts estilo completion sin plantilla de chat. MMLU corresponde a la variante generativa (`mmlu_generative`), no comparable con puntuaciones obtenidas por log-likelihood. Los porcentajes entre parentesis indican la recuperacion respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit (este repo) | NVFP4A16 | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativo) | 50,56 | 50,50 (99,9%) | 50,31 (99,5%) | 48,39 (95,7%) | 46,36 (91,7%) | 48,55 (96,0%) |
| GSM8K (5-shot, estricto) | 32,68 | 29,80 (91,2%) | 32,30 (98,8%) | 29,49 (90,3%) | 22,82 (69,8%) | 28,20 (86,3%) |
| ARC-Challenge (0-shot) | 37,54 | 36,52 (97,3%) | 37,46 (99,8%) | 35,07 (93,4%) | 33,11 (88,2%) | 35,15 (93,6%) |
| Winogrande (5-shot) | 56,27 | 55,49 (98,6%) | 56,67 (100,7%) | 55,80 (99,2%) | 55,64 (98,9%) | 55,88 (99,3%) |
| KMMLU (5-shot, directo) | 34,54 | 34,22 (99,1%) | 34,20 (99,0%) | 35,02 (101,4%) | 33,51 (97,0%) | 35,74 (103,5%) |
| HAE-RAE (0-shot) | 37,03 | 35,29 (95,3%) | 36,30 (98,0%) | 34,10 (92,1%) | 27,31 (73,8%) | 34,28 (92,6%) |
| **Media** | **41,44** | **40,30 (97,3%)** | **41,21 (99,4%)** | **39,65 (95,7%)** | **36,46 (88,0%)** | **39,63 (95,6%)** |

Evaluacion de fidelidad respecto al original BF16 sobre un conjunto interno mixto ingles/coreano de 100 prompts, con respuestas greedy del BF16 puntuadas bajo cada build:

| Metrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor = mas cercano) | 2,0200 | 2,0174 (+0,1%) |
| Acuerdo top-1 en el siguiente token | 98,1% | 98,7% |

## Requisitos de hardware

- VRAM estimada para inferencia: 1,3 GB solo para los pesos; hay que anadir la cache KV (crece con la longitud de contexto y el numero de peticiones concurrentes) y unos pocos GB para activaciones y grafos CUDA.
- GPU recomendadas: cualquier NVIDIA Turing (sm75) o posterior; el autor solo probo B200. V100 (sm70) no esta soportada.
- Cabe en GPU consumer: si, siempre que sean Turing o posteriores (por ejemplo, RTX 2060 en adelante); no se especifican modelos concretos probados.
- Opciones de despliegue: vLLM 0.32.0 (probado), con soporte de arquitectura desde vLLM 0.17.0; tambien Transformers >=5.2.0 con compressed-tensors >=0.15.0. No se menciona soporte de llama.cpp, Ollama ni TGI.
- Entorno de vLLM: Python 3.11-3.14, torch 2.13 (build CUDA 13.0), transformers >=5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con las otras variantes cuantizadas del mismo modelo base, no con modelos de otros autores.

| Modelo | Parametros | Contexto | Media de benchmarks | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-0.8B (BF16) | 853 M | 32.768 | 41,44 | Apache-2.0 | safetensors |
| Qwen3.5-0.8B-AWQ-8bit (este) | 853 M | 32.768 | 41,21 (99,4%) | Apache-2.0 | compressed-tensors |
| Qwen3.5-0.8B FP8-dynamic | 853 M | 32.768 | 40,30 (97,3%) | Apache-2.0 | no disponible |
| Qwen3.5-0.8B AWQ-4bit | 853 M | 32.768 | 39,63 (95,6%) | Apache-2.0 | no disponible |
| Qwen3.5-0.8B NVFP4 | 853 M | 32.768 | 36,46 (88,0%) | Apache-2.0 | no disponible |

Comparativa con modelos de otros autores: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo base tiene solo 853 millones de parametros; sus puntuaciones absolutas (media de 41,21 en los benchmarks medidos) son propias de un modelo pequeno y no deben compararse con modelos de mayor escala.
- La calibracion de AWQ uso 256 muestras de un corpus con predominio de coreano, lo que puede sesgar la proteccion de canales hacia ese idioma; el rendimiento en otras lenguas no se ha evaluado de forma especifica.
- La evaluacion de fidelidad se realizo sobre 100 prompts internos mixtos ingles/coreano; no constituye una validacion exhaustiva en dominios especializados.
- Riesgo de alucinacion: no se han publicado mediciones especificas de veracidad o tasa de alucinacion en la informacion disponible.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- El modelo base no incluye `generation_config.json`; esta version tampoco, por lo que los parametros de generacion deben configurarse manualmente.
- Requiere vLLM >=0.17.0 o Transformers >=5.2.0 con compressed-tensors >=0.15.0; versiones inferiores no cargaran el checkpoint.
- No se ha probado en GPU distintas de B200; el comportamiento en otras arquitecturas se deduce del codigo de seleccion de kernels de vLLM, no de mediciones.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base original antes de redistribuirlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/Qwen3.5-0.8B-AWQ-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
