# axteam/gemma-4-12B-it-NVFP4A16

## Resumen

`axteam/gemma-4-12B-it-NVFP4A16` es una cuantización de 4 bits del modelo multimodal `google/gemma-4-12B-it`, publicada por el usuario axteam. Se trata de un checkpoint post-entrenamiento (PTQ) con esquema W4A16: pesos en FP4 (formato E2M1) agrupados en bloques de 16 con escalas FP8 E4M3 y una escala global FP32 por tensor, mientras que las activaciones permanecen en BF16. El objetivo es servir el modelo base con vLLM de forma eficiente en memoria, reduciendo el peso en disco hasta unos 8,3 GB.

El modelo base pertenece a la familia Gemma 4 de Google, con arquitectura densa (no MoE) y pipeline `image-text-to-text`, es decir, un modelo unificado que procesa texto, imagen y audio sin un codificador visual separado. Cuenta con 11.959.730.224 parámetros totales según los safetensors del repositorio. La cuantización mantiene en BF16 el embedder visual, las proyecciones de visión y audio, los embeddings de tokens (atados con el `lm_head`) y todas las normalizaciones, lo que representa aproximadamente el 9 % de los parámetros.

La relevancia de esta ficha es doble: por un lado, documenta una receta de cuantización NVFP4 lista para producción en vLLM; por otro, sirve como referencia de las pérdidas de fidelidad que introduce una PTQ AWQ de 4 bits frente al original en BF16, con métricas medidas de perplejidad y acuerdo top-1. Es un artefacto pensado para despliegue, no para entrenamiento ni ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, transformer denso (unificado multimodal: texto, imagen y audio) |
| Parametros totales | 11.959.730.224 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4A16 (W4A16): pesos FP4 E2M1, grupo 16, escala FP8 E4M3 + escala global FP32 por tensor; activaciones BF16; formato compressed-tensors `nvfp4-pack-quantized` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Gemma 4 con arquitectura unificada: no existe un codificador visual independiente, de modo que los tokens de imagen y audio atraviesan el decodificador cuantizado. Esta decisión de diseño explica por qué la cuantización deja sin tocar el `vision_embedder`, las proyecciones de visión y audio, los embeddings de tokens y las normas: son las piezas donde la pérdida de precisión degradaría más la calidad multimodal.

Esta versión concreta no se ha entrenado: es una cuantización post-entrenamiento con AWQ sobre 224 muestras de calibración (predominantemente en coreano y sin respuestas de modo pensamiento). AWQ identifica los canales de pesos que multiplican activaciones de mayor magnitud y los protege con escalas por canal plegadas en capas adyacentes antes del redondeo. No hay reentrenamiento ni gradientes; la fidelidad es inferior a un checkpoint QAT oficial de Google, que este repositorio no es. El tokenizador, la `chat_template`, el `processor_config` y el `generation_config` son idénticos byte a byte al original, con la salvedad de que el `tokenizer.json` corregido por Google el 2026-10-30 (arreglo de tokens defectuosos) aún no está incluido.

## Capacidades

- Generación de texto conversacional con plantilla de chat compatible con el modelo original.
- Procesamiento de imagen y texto de entrada (`image-text-to-text`) a través del decodificador unificado.
- Procesamiento de audio según la arquitectura unificada del modelo base (las proyecciones de audio se conservan en BF16).
- Razonamiento y matemáticas básicas, evaluadas en GSM8K y MMLU con resultados medidos.
- Comprensión lectora y sentido común (ARC-Challenge, Winogrande).
- Capacidades multilingües parciales: los benchmarks incluyen KMMLU y HAE-RAE, orientados a coreano; el conjunto de idiomas completo no está documentado en la información disponible.
- No se documenta soporte de tool calling ni de flujos de agentes multi-paso en la información proporcionada.

## Casos de uso

- Despliegue de un asistente multimodal en producción con vLLM: el checkpoint pesa 8,3 GB y usa pesos FP4 sin necesidad de núcleos tensoriales FP4, por lo que puede servirse en GPUs Turing o posteriores con un consumo de VRAM muy inferior al BF16.
- Servicio de chat con imágenes en entornos con presupuesto de memoria ajustado: al mantener las activaciones en BF16 y las proyecciones visuales sin cuantizar, conserva la calidad de entrada visual mientras reduce el coste de los pesos del decodificador.
- Evaluación comparativa de técnicas de cuantización: sirve como referencia reproducible de AWQ W4A16 frente a FP8, AWQ-8bit y NVFP4 puro, con métricas de perplejidad y acuerdo top-1 publicadas.
- Prototipado de pipelines de visión-lenguaje: la integración con transformers y vLLM permite montar demos de descripción de imágenes o respuesta a preguntas visuales sin infraestructura de gran escala.
- Investigación sobre degradación por cuantización en modelos multimodales unificados: el repositorio documenta explícitamente qué componentes se mantienen en BF16 y su impacto en benchmarks como ARC-Challenge y KMMLU.
- Evaluación de modelos en coreano: los benchmarks KMMLU y HAE-RAE permiten medir el comportamiento del checkpoint en tareas coreanas, aunque la calibración sesgada a ese idioma debe tenerse en cuenta.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness sobre vLLM, decodificación greedy y prompts de estilo completion sin plantilla de chat. Los porcentajes entre paréntesis indican la recuperación respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 (este repo) | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot) | 65,40 | 65,90 (100,8 %) | 65,80 (100,6 %) | 67,00 (102,4 %) | 62,78 (96,0 %) | 63,42 (97,0 %) |
| GSM8K (5-shot, strict) | 63,38 | 68,99 (108,9 %) | 65,05 (102,6 %) | 64,59 (101,9 %) | 60,42 (95,3 %) | 63,46 (100,1 %) |
| ARC-Challenge (0-shot) | 42,32 | 41,64 (98,4 %) | 39,59 (93,5 %) | 37,63 (88,9 %) | 40,96 (96,8 %) | 40,61 (96,0 %) |
| Winogrande (5-shot) | 61,80 | 61,56 (99,6 %) | 62,75 (101,5 %) | 60,14 (97,3 %) | 58,72 (95,0 %) | 61,17 (99,0 %) |
| KMMLU (5-shot, direct) | 43,28 | 42,59 (98,4 %) | 43,60 (100,7 %) | 39,00 (90,1 %) | 33,66 (77,8 %) | 34,01 (78,6 %) |
| HAE-RAE (0-shot) | 64,62 | 64,62 (100,0 %) | 65,08 (100,7 %) | 62,51 (96,7 %) | 58,75 (90,9 %) | 59,30 (91,8 %) |
| Promedio | 56,80 | 57,55 (101,3 %) | 56,98 (100,3 %) | 55,15 (97,1 %) | 52,55 (92,5 %) | 53,66 (94,5 %) |

Evaluación de fidelidad frente al original en BF16 sobre un conjunto interno mixto inglés/coreano:

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor es mejor) | 1,2885 | 1,1488 (+12,2 %) |
| Acuerdo top-1 en el siguiente token | 91,1 % | 99,2 % |

## Requisitos de hardware

- VRAM estimada: pesos de 8,3 GB; hay que añadir la caché KV (crece con la longitud de contexto y el número de peticiones concurrentes) y varios GB para activaciones y grafos CUDA.
- GPU compatibles: NVIDIA Turing (sm75) o posteriores. No se soporta V100 (sm70). No se requieren núcleos tensoriales FP4. Solo se probó en B200.
- Cabe en GPUs de consumo con suficiente VRAM, aunque el autor no documenta pruebas en RTX 4090 u otras consumer; no hay datos concretos de latencia ni throughput.
- Runtime: vLLM, con la arquitectura disponible desde vLLM ≥ 0.23.0 y probada con vLLM 0.32.0. Requiere Python 3.11–3.14, torch 2.13 (build CUDA 13.0), transformers ≥ 5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado, ya que el checkpoint se guardó con 0.19.0).
- Alternativas de despliegue como llama.cpp, Ollama o TGI no están documentadas para este formato en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| axteam/gemma-4-12B-it-NVFP4A16 | 11,96 B (denso) | no disponible | Apache-2.0 / Gemma 4 | safetensors compressed-tensors (NVFP4A16) | HuggingFace, 110 descargas |
| google/gemma-4-12B-it (BF16) | 11,96 B (denso) | no disponible | Apache-2.0 / Gemma 4 | safetensors BF16 | HuggingFace |
| Variante FP8-dynamic del mismo base | 11,96 B (denso) | no disponible | Apache-2.0 / Gemma 4 | pesos FP8 | medida en los benchmarks del autor |
| Variante AWQ-8bit del mismo base | 11,96 B (denso) | no disponible | Apache-2.0 / Gemma 4 | compressed-tensors W8A16 | medida en los benchmarks del autor |
| Variante NVFP4 pura del mismo base | 11,96 B (denso) | no disponible | Apache-2.0 / Gemma 4 | compressed-tensors FP4 | medida en los benchmarks del autor |

No se dispone de datos de modelos comparables de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- La cuantización introduce una pérdida medible de fidelidad: perplejidad un 12,2 % superior al BF16 y acuerdo top-1 del 91,1 % frente al 99,2 % del original.
- Caída notable en ARC-Challenge (88,9 % de recuperación) y en KMMLU (90,1 %), lo que sugiere degradación en razonamiento y conocimiento no inglés.
- La calibración AWQ se hizo con 224 muestras predominantemente en coreano y sin respuestas de modo pensamiento, lo que puede sesgar el comportamiento en otros idiomas y en tareas de razonamiento extendido.
- El `tokenizer.json` no incluye la corrección de tokens defectuosos publicada por Google el 2026-10-30; puede afectar a la tokenización en casos límite.
- Riesgo de alucinación inherente al modelo base, no mitigado por la cuantización.
- Los idiomas soportados no están documentados formalmente; la evaluación multilingüe se limita a coreano e inglés.
- La licencia Apache-2.0 convive con la licencia de Gemma 4 de Google; conviene revisar los términos de uso comercial de esta última antes de desplegar en producción.
- Solo se ha probado en una GPU B200; el rendimiento en otras arquitecturas (Turing, Ampere, Ada) no está verificado por el autor.
- El repositorio tiene un uso muy bajo (110 descargas, 1 like) y fue actualizado por última vez el 2026-11-02; no hay garantía de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axteam/gemma-4-12B-it-NVFP4A16
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
