# axteam/gemma-4-12B-it-NVFP4

## Resumen

`axteam/gemma-4-12B-it-NVFP4` es una cuantización de 4 bits del modelo multimodal `google/gemma-4-12B-it`, publicada por el usuario axteam. El modelo base es un transformer denso de la familia Gemma 4 con aproximadamente 11.960 millones de parámetros, capaz de procesar entradas de imagen y texto (pipeline `image-text-to-text`) y generar respuestas conversacionales. Esta versión cuantizada reduce el peso en disco hasta unos 8,3 GB mediante el esquema NVFP4 (W4A4, FP4), lo que la hace atractiva para servir el modelo en GPUs con soporte nativo de FP4.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 12B multimodal con requisitos de memoria notablemente reducidos, a costa de una degradación medible en calidad. El autor reporta una recuperación media del 92,5 % frente al original en BF16 en su batería de benchmarks, con caídas especialmente acusadas en tareas coreanas (KMMLU al 77,8 %). Es, por tanto, una opción orientada a throughput y eficiencia en vLLM sobre hardware Blackwell, no a máxima fidelidad.

La cuantización se realizó mediante PTQ con AWQ sobre atención y MLP, manteniendo en BF16 los módulos críticos (embeddings, proyecciones de visión/audio y normas), que representan en torno al 9 % de los parámetros. La licencia declarada es Apache-2.0, con enlace a la licencia específica de Gemma 4 de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, transformer denso (unified, sin encoder de visión separado) |
| Parametros totales | 11.959.730.224 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4, FP4 E2M1), pesos en grupos de 16 con escala FP8 E4M3 y escala global FP32 por tensor; activaciones FP4; módulos críticos en BF16 |
| Idiomas soportados | no disponible (la calibración fue mayoritariamente en coreano) |
| Licencia | Apache-2.0 (enlace a licencia Gemma 4 de Google) |
| Formato de pesos | safetensors con compressed-tensors (`nvfp4-pack-quantized`), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Gemma 4 en variante "unified": no existe un encoder de visión independiente, sino que los tokens de imagen y audio atraviesan el decodificador cuantizado. Esta build conserva en BF16 el patch embedder de visión, las proyecciones de visión y audio, los token embeddings (atados con `lm_head`) y todas las normas, aproximadamente el 9 % de los parámetros totales, para preservar la calidad en las modalidades no textuales.

La cuantización es post-entrenamiento (PTQ) con AWQ sobre atención y MLP (gate/up), sin reentrenamiento. Se usaron 224 muestras de calibración, mayoritariamente en coreano y sin respuestas en modo thinking. El autor distingue explícitamente esta build de los checkpoints QAT oficiales de Google: aquí no hay ajuste con cuantización simulada, solo escalado por canal de los canales salientes más relevantes antes del redondeo. El tokenizador, `chat_template`, `processor_config` y `generation_config` son idénticos a los del original (incluida la corrección de `chat_template` de julio de 2026), aunque el repo no incorpora la corrección de `tokenizer.json` publicada por Google el 30 de octubre de 2026.

## Capacidades

- Generación de texto conversacional multi-turno en formato instruct (`-it`).
- Procesamiento conjunto de imagen y texto (pipeline `image-text-to-text`), con tokens visuales atravesando el decodificador cuantizado.
- Soporte de audio según la arquitectura unified del modelo base (proyecciones de audio mantenidas en BF16).
- Razonamiento y matemáticas de nivel medio, con degradación medible respecto al BF16 en GSM8K y ARC-Challenge.
- Capacidad multilingüe heredada del modelo base, aunque la fidelidad de la cuantización se evaluó sobre todo en inglés y coreano.
- Integración con vLLM para serving de alto throughput y con `transformers` para uso directo.
- Soporte de plantilla de chat y configuración de generación originales de Google.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni modo thinking para esta build.

## Casos de uso

- Serving de alto throughput en GPUs Blackwell: desplegar el modelo en vLLM 0.32 sobre B200, GB200, B300 o RTX 50xx aprovecha los kernels FP4 nativos y reduce el coste por token frente a una build BF16.
- Asistentes multimodales de imagen y texto en producción: el modelo acepta entradas de imagen junto a texto y puede gestionar conversaciones multi-turno, adecuado para interfaces de atención al cliente con capturas o fotos.
- Prototipado rápido en una sola GPU: con 8,3 GB en disco, la build cabe en GPUs consumer de 16 GB o más, lo que facilita entornos de desarrollo y demos.
- Clasificación y extracción de información sobre documentos con imagen: al mantener las proyecciones de visión en BF16, conserva capacidad de interpretar contenido visual sin un encoder separado.
- Evaluación comparativa de técnicas de cuantización: sirve como referencia práctica de AWQ W4A4 frente a FP8, AWQ-8bit y NVFP4A16 en el mismo harness.
- Despliegue en clústeres con restricciones de memoria: la reducción a 4 bits permite aumentar el número de réplicas por nodo o el tamaño de lote en servicios con VRAM limitada.
- Tareas de generación de texto en inglés donde la caída de calidad es tolerable (MMLU al 96 % de recuperación), como resúmenes o borradores internos.

## Benchmarks y rendimiento

Medidos por el autor con lm-evaluation-harness sobre vLLM, greedy, prompts de tipo completion sin plantilla de chat. Los porcentajes entre paréntesis indican recuperación respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 | NVFP4 (esta build) | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot) | 65,40 | 65,90 (100,8 %) | 65,80 (100,6 %) | 67,00 (102,4 %) | 62,78 (96,0 %) | 63,42 (97,0 %) |
| GSM8K (5-shot, strict) | 63,38 | 68,99 (108,9 %) | 65,05 (102,6 %) | 64,59 (101,9 %) | 60,42 (95,3 %) | 63,46 (100,1 %) |
| ARC-Challenge (0-shot) | 42,32 | 41,64 (98,4 %) | 39,59 (93,5 %) | 37,63 (88,9 %) | 40,96 (96,8 %) | 40,61 (96,0 %) |
| Winogrande (5-shot) | 61,80 | 61,56 (99,6 %) | 62,75 (101,5 %) | 60,14 (97,3 %) | 58,72 (95,0 %) | 61,17 (99,0 %) |
| KMMLU (5-shot, direct) | 43,28 | 42,59 (98,4 %) | 43,60 (100,7 %) | 39,00 (90,1 %) | 33,66 (77,8 %) | 34,01 (78,6 %) |
| HAE-RAE (0-shot) | 64,62 | 64,62 (100,0 %) | 65,08 (100,7 %) | 62,51 (96,7 %) | 58,75 (90,9 %) | 59,30 (91,8 %) |
| Media | 56,80 | 57,55 (101,3 %) | 56,98 (100,3 %) | 55,15 (97,1 %) | 52,55 (92,5 %) | 53,66 (94,5 %) |

Evaluación de fidelidad frente al BF16 original en un conjunto interno mixto inglés/coreano:

| Métrica | Esta build | BF16 original |
|---|---|---|
| Perplejidad (menor es mejor) | 1,4465 | 1,1488 (+25,9 %) |
| Acuerdo top-1 en siguiente token | 87,4 % | 99,2 % |

## Requisitos de hardware

- VRAM estimada: el repo ocupa 8,3 GB en disco; en inferencia hay que sumar caché KV y overhead de activaciones, por lo que se recomienda al menos 12-16 GB de VRAM para contextos moderados.
- GPUs con FP4 nativo (velocidad W4A4 completa): B200/GB200 (sm100), B300 (sm103), RTX 50xx y RTX PRO 6000 (sm120).
- GPUs Turing-Hopper (sm75-sm90): funcionan en modo weight-only FP4, más lento, con aviso de vLLM.
- V100 (sm70): no soportada.
- Cabe en GPUs consumer de 16 GB o más; en RTX 50xx se obtiene además aceleración FP4 nativa.
- Despliegue recomendado: vLLM ≥ 0.23.0 (probado con 0.32.0), que requiere Python 3.11-3.14, torch 2.13 con build CUDA 13.0, transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado).
- Alternativa: `transformers` con el formato compressed-tensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Recuperación media vs BF16 | Licencia |
|---|---|---|---|---|---|
| gemma-4-12B-it-NVFP4 (esta build) | 11,96B | no disponible | NVFP4 W4A4 | 92,5 % | Apache-2.0 / Gemma 4 |
| gemma-4-12B-it AWQ-8bit | 11,96B | no disponible | 8 bits | 100,3 % | Apache-2.0 / Gemma 4 |
| gemma-4-12B-it FP8-dynamic | 11,96B | no disponible | FP8 | 101,3 % | Apache-2.0 / Gemma 4 |
| gemma-4-12B-it NVFP4A16 | 11,96B | no disponible | NVFP4 weight-only | 97,1 % | Apache-2.0 / Gemma 4 |

La comparación se limita a las variantes cuantizadas del mismo modelo base reportadas por el autor; no se dispone de datos de benchmarks de modelos alternativos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- Degradación de calidad apreciable: recuperación media del 92,5 % frente al BF16, con perplejidad un 25,9 % superior y solo un 87,4 % de acuerdo top-1 en siguiente token.
- Caída severa en coreano: KMMLU al 77,8 % y HAE-RAE al 90,9 %, coherente con una calibración mayoritariamente coreana pero insuficiente para preservar ese idioma.
- No es una build QAT: al ser PTQ con AWQ, la fidelidad en 4 bits es inferior a la de los checkpoints QAT oficiales de Google.
- El tokenizador no incluye la corrección de `tokenizer.json` publicada por Google el 30 de octubre de 2026 (commit `43c9d01`), lo que puede afectar a la tokenización de ciertos glitch tokens.
- Las proyecciones de visión y audio se mantienen en BF16, pero los tokens visuales atraviesan el decodificador cuantizado, por lo que la calidad multimodal puede resentirse.
- Riesgo de alucinación inherente al modelo base, potencialmente amplificado por la cuantización; no se han publicado evaluaciones específicas de veracidad para esta build.
- Rendimiento dependiente del hardware: sin FP4 nativo (sm100/sm103/sm120) se degrada a weight-only FP4 y pierde buena parte de la ventaja de velocidad.
- La licencia Apache-2.0 declarada remite a la licencia Gemma 4 de Google; conviene revisar sus términos para uso comercial.
- Idiomas soportados no documentados formalmente en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/axteam/gemma-4-12B-it-NVFP4
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- vLLM: https://github.com/vllm-project/vllm
