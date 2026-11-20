# puretensor/Aion-1.0-Instruct-2.3B-NVFP4

## Resumen

Aion-1.0-Instruct-2.3B-NVFP4 es una version cuantizada a 4 bits del modelo instructivo microsoft/Aion-1.0-Instruct-2.3B, publicada por el usuario puretensor en Hugging Face. El checkpoint aplica cuantizacion NVFP4 (W4A4, pesos y activaciones a 4 bits) mediante GPTQ sobre los pesos BF16 originales, reduciendo el peso del repositorio de 4,58 GB (BF16) a 1,88 GB. El modelo base cuenta con 2.288.831.488 parametros y esta distribuido en 28 bloques transformer.

La relevancia de esta publicacion es doble: por un lado, demuestra un pipeline reproducible de cuantizacion NVFP4 con llm-compressor y compressed-tensors sobre una arquitectura de 2,3B; por otro, documenta de forma inusualmente transparente el coste en calidad de comprimir a 4 bits un modelo de este tamano, con perdidas de 2,14 puntos en MMLU y 6,14 puntos en GSM8K respecto a la referencia BF16, ambas estadisticamente significativas.

Se trata de una release de prueba, no afiliada ni respaldada por Microsoft, pensada para evaluar el estado del arte de la cuantizacion NVFP4 en modelos pequenos y no como sustituto de produccion del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (28 bloques, segun model card), tarea text-generation |
| Parametros totales | 2.288.831.488 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 pack-quantized: valores 4-bit E2M1, escala FP8 E4M3 por grupo de 16, escala FP32 por tensor; W4A4 (pesos y activaciones a 4 bits); embeddings, lm_head y normas en BF16 |
| Idiomas soportados | no disponible (solo se evaluo en ingles) |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | safetensors con compressed-tensors (`nvfp4-pack-quantized`), libreria transformers, requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 2,3B parametros con 28 bloques. Esta version cuantizada no introduce cambios arquitectonicos: se cuantizan todas las capas `Linear` de los 28 bloques (pesos e activaciones de entrada a 4 bits), manteniendo en BF16 los embeddings de tokens, la cabeza de salida atada, todas las normas y `lm_head` (excluido explicitamente del recetario).

El metodo de cuantizacion es GPTQ con `block_size` 128, `dampening_frac` 0,01 y `actorder` estatico, calibrado con 512 muestras de `mlabonne/open-perfectblend` de hasta 2.048 tokens cada una, usando llm-compressor 0.15.0, compressed-tensors 0.20.1, transformers 5.21.0 y torch 2.14.1. El autor comparo cinco variantes NVFP4 (GPTQ, round-to-nearest y expanded MSE scales, con activaciones a 4 y 16 bits) y GPTQ fue la mejor en todas las metricas, incluso frente a las variantes que dejan las activaciones en 16 bits. El checkpoint guardado se recargo desde disco y coincidio exactamente con el modelo cuantizado en memoria (logits identicos en 4.096 tokens).

## Capacidades

- Generacion de texto conversacional con plantilla de chat (`apply_chat_template`), heredada del modelo instructivo base.
- Razonamiento y respuesta a preguntas de conocimiento general (evaluado en MMLU).
- Razonamiento matematico de varios pasos (evaluado en GSM8K).
- Instrucciones en formato multi-turno (evaluado con `HuggingFaceH4/ultrachat_200k`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no evaluadas; los benchmarks del autor son solo en ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada.

## Casos de uso

- Evaluacion de tecnicas de cuantizacion NVFP4: util como referencia reproducible para investigadores que quieran replicar el pipeline GPTQ + llm-compressor sobre modelos de 2-3B y comparar variantes (round-to-nearest, expanded MSE scales) con la misma metodologia.
- Despliegue en entornos con memoria muy limitada: el checkpoint de 1,88 GB permite cargar el modelo en GPUs consumer con 4-6 GB de VRAM, a costa de la perdida de calidad documentada.
- Pruebas de integracion con compressed-tensors: sirve para validar toolchains de transformers 5.x con `trust_remote_code=True` y pesos `nvfp4-pack-quantized` antes de adoptar NVFP4 en produccion.
- Generacion de texto conversacional de baja criticidad: tareas de resumen o respuestas cortas donde una caida de 2,14 puntos en MMLU es aceptable y prima el ahorro de memoria.
- Investigacion sobre degradacion por cuantizacion: los datos de KL divergence (0,095 en WikiText-2, 0,077 en chat) y los tests de McNemar permiten estudiar que tipos de preguntas se pierden al comprimir (1.058 perdidas frente a 758 ganadas en MMLU).
- Benchmarking de serving: mientras no exista implementacion nativa FP4 en vLLM, el checkpoint permite medir el coste de la emulacion de aritmetica 4-bit en transformers frente a BF16.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness 0.4.13, sin plantilla de chat, comparando con el BF16 de referencia:

| Metrica | BF16 | Este checkpoint | Cambio |
|---|---:|---:|---:|
| MMLU, accuracy (14.042 preguntas) | 54,88 | 52,74 | -2,14 |
| GSM8K, exact match (1.319 problemas) | 61,26 | 55,12 | -6,14 |
| WikiText-2 perplexity (131.072 tokens) | 11,39 | 12,28 | +0,89 |

Concordancia token a token con BF16:

| Texto | Tokens | KL media | KL percentil 99 | Mismo token top-1 |
|---|---:|---:|---:|---:|
| WikiText-2 test | 131.072 | 0,095 | 0,71 | 84,7% |
| Chat (ultrachat_200k, test_sft, 256 conversaciones) | 224.534 | 0,077 | 0,58 | 86,7% |

Tests de McNemar emparejados por pregunta: en MMLU 1.058 preguntas perdidas y 758 ganadas (p = 2e-12); en GSM8K 166 perdidas y 85 ganadas (p = 4e-7). Comparativa interna de variantes NVFP4 construidas por el autor:

| Variante | Activaciones | MMLU | GSM8K | KL wiki | KL chat |
|---|---|---:|---:|---:|---:|
| BF16 referencia | 16-bit | 54,88 | 61,26 | 0 | 0 |
| GPTQ (este checkpoint) | 4-bit | 52,74 | 55,12 | 0,095 | 0,077 |
| Round-to-nearest | 4-bit | 50,55 | 45,56 | 0,175 | 0,327 |
| Expanded MSE scales | 4-bit | 50,67 | 47,31 | 0,148 | 0,311 |
| Round-to-nearest, solo pesos | 16-bit | 52,65 | 50,34 | 0,098 | 0,281 |
| Expanded MSE scales, solo pesos | 16-bit | 52,32 | 53,37 | 0,098 | 0,263 |

No se han publicado resultados de benchmarks del modelo base frente a modelos de otros autores en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 1,88 GB, por lo que cabe en GPUs con 4 GB o mas de VRAM en BF16; la carga en float32 fallo en las pruebas del autor por un desajuste de dtype.
- GPU recomendadas: no hay datos especificos; por tamano, cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4090) puede alojar el checkpoint. GPUs de datacenter (A100, H100) solo tienen sentido para lotes grandes o para comparativas con BF16.
- Cabe en GPU consumer: si, con 4-6 GB de VRAM disponibles segun el backend.
- Opciones de despliegue: transformers con compressed-tensors instalado y `trust_remote_code=True`. No hay implementacion en vLLM para esta arquitectura a fecha 2026-11-20; llama.cpp, Ollama y TGI no estan documentados para este checkpoint NVFP4.
- Latencia y throughput: no disponibles. La aritmetica 4-bit se emula en transformers, por lo que el checkpoint ofrece la calidad de NVFP4 pero no su velocidad; no se publicaron medidas de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | GSM8K | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Aion-1.0-Instruct-2.3B-NVFP4 (este) | 2,29B | no disponible | 52,74 | 55,12 | MIT | Hugging Face, transformers |
| Aion-1.0-Instruct-2.3B (BF16, base) | 2,29B | no disponible | 54,88 (medido por el autor); 55,15 (model card original) | 61,26 (medido por el autor) | MIT | Hugging Face, transformers |
| Variante NVFP4 round-to-nearest | 2,29B | no disponible | 50,55 | 45,56 | MIT | construida por el autor, no publicada como checkpoint |
| Otros modelos de 2-3B comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de benchmarks de terceros que permitan una comparativa externa fiable.

## Limitaciones y advertencias

- Perdida de calidad real y estadisticamente significativa a este tamano: -2,14 puntos en MMLU y -6,14 en GSM8K respecto a BF16, con tests de McNemar que confirman que la degradacion no es ruido. Si se necesita la calidad del modelo base, hay que usar BF16.
- Sin serving nativo FP4: no existe implementacion en vLLM para esta arquitectura a fecha de la publicacion; en transformers la aritmetica 4-bit se emula, de modo que no se obtiene la ganancia de velocidad de NVFP4.
- Carga en BF16 obligatoria: una carga en float32 fallo con desajuste de dtype en las pruebas del autor; BF16 en CPU funciona pero es lento.
- Evaluacion limitada: solo benchmarks en ingles; no se ejecutaron evaluaciones de seguridad, multilingues ni de contexto largo sobre el checkpoint cuantizado.
- Sesgos conocidos: no documentados en la informacion disponible; al heredar el modelo base, arrastra los sesgos de sus datos de entrenamiento, no evaluados aqui.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la perplexity sube de 11,39 a 12,28 en WikiText-2, lo que indica mayor incertidumbre en la distribucion de salida.
- Limitaciones de contexto e idioma: la longitud de contexto no esta especificada y no hay evaluacion multilingue.
- Licencia MIT heredada del modelo base, con el archivo LICENSE original incluido; no hay restricciones comerciales adicionales documentadas.
- Release de prueba no afiliada a Microsoft: no debe tratarse como version oficial del modelo base ni como sustituto validado en produccion.
- La ventaja de GPTQ en la columna de chat puede estar parcialmente inflada por el uso de datos de calibracion de estilo chat; la columna de WikiText-2, independiente de la calibracion, sigue mostrando ventaja de GPTQ.

## Enlaces

- Hugging Face: https://huggingface.co/puretensor/Aion-1.0-Instruct-2.3B-NVFP4
- Modelo base: https://huggingface.co/microsoft/Aion-1.0-Instruct-2.3B
- Licencia del modelo base: https://huggingface.co/microsoft/Aion-1.0-Instruct-2.3B/blob/main/LICENSE
- Dataset de calibracion: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Dataset de evaluacion de chat: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Herramienta de cuantizacion llm-compressor: no disponible en la informacion proporcionada
- Libreria compressed-tensors: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
