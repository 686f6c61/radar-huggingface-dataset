# axteam/gemma-4-12B-it-AWQ-4bit

## Resumen

`axteam/gemma-4-12B-it-AWQ-4bit` es una cuantización de 4 bits del modelo multimodal `google/gemma-4-12B-it`, publicada por el usuario axteam. Se trata de un checkpoint de pesos INT4 (esquema W4A16) generado mediante AWQ (activation-aware weight quantization), un método de cuantización post-entrenamiento que no requiere reentrenamiento. El objetivo es reducir la huella de memoria del modelo original (11.960 millones de parámetros en BF16) hasta unos 8,4 GB en disco, de modo que pueda servirse de forma eficiente en vLLM sobre GPUs de consumo o de gama media.

El modelo base pertenece a la familia Gemma 4 de Google y es de tipo denso (no MoE), con pipeline `image-text-to-text`: procesa entradas de imagen y texto y genera texto. La cuantización mantiene en BF16 el embedder visual, las proyecciones de visión y audio, los embeddings de tokens (atados con `lm_head`) y todas las normalizaciones, aproximadamente el 9 % de los parámetros, para preservar la calidad en las rutas multimodales. El resto de pesos de atención y MLP se almacenan en INT4 asimétrico con tamaño de grupo 32.

La relevancia de esta ficha es doble: por un lado, permite ejecutar un modelo de casi 12 000 millones de parámetros con capacidades multimodales en hardware mucho más modesto que el BF16 original; por otro, los datos medidos por el autor muestran una degradación media del 5,5 % frente a BF16 en un conjunto de benchmarks, con caídas especialmente acusadas en tareas coreanas (KMMLU al 78,6 % de recuperación). Es, por tanto, una opción de compromiso entre coste y fidelidad, no un sustituto equivalente al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, transformer denso (modelo unificado sin encoder visual separado) |
| Parametros totales | 11.959.730.224 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ INT4, W4A16, grupo de 32, pesos INT4 asimetricos con escala BF16 y zero-point INT4, activaciones BF16, formato compressed-tensors `pack-quantized` |
| Idiomas soportados | no disponible (la calibracion fue mayoritariamente en coreano) |
| Licencia | Apache-2.0 (con enlace a la licencia Gemma 4 de Google) |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Gemma 4, con pipeline multimodal `image-text-to-text`. En esta variante "Unified" no existe un encoder visual independiente: los tokens de imagen y audio atraviesan el decodificador cuantizado, y solo el embedder visual (`vision_embedder`), las proyecciones de visión y audio, los embeddings de tokens y las normalizaciones permanecen en BF16. Esa decisión de diseño busca que la cuantización no degrade las rutas de entrada multimodal.

La cuantización es post-entrenamiento (PTQ) con AWQ: se usan 224 muestras de calibración, mayoritariamente en coreano, para identificar los canales de pesos que multiplican a las activaciones de mayor magnitud y protegerlos mediante escalado por canal, plegado en capas adyacentes. No hay reentrenamiento ni gradientes, y el autor indica explícitamente que no se generaron respuestas en modo "thinking" durante la calibración. El tokenizador, la plantilla de chat, el `processor_config` y el `generation_config` son idénticos a los del original, incluida la plantilla de chat corregida por Google en julio de 2026; sin embargo, el repositorio no incorpora el `tokenizer.json` corregido que Google publicó el 30 de octubre de 2026 (commit `43c9d01`, corrección de glitch-tokens).

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat compatible con el modelo original.
- Procesamiento de imagen y texto de entrada (pipeline `image-text-to-text`), con proyecciones visuales y de audio mantenidas en BF16.
- Razonamiento y matemáticas básicas: los benchmarks medidos incluyen GSM8K, ARC-Challenge y Winogrande.
- Capacidades multilingües heredadas del modelo base, aunque no se documenta la lista de idiomas soportados y la calibración fue predominantemente coreana.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Modo "thinking": el autor indica que no se generaron respuestas de este tipo durante la calibración, por lo que su comportamiento en ese modo no está validado para esta cuantización.

## Casos de uso

- Servicio de chat multimodal en producción con vLLM: el checkpoint está empaquetado en compressed-tensors y probado con vLLM 0.32.0, de modo que puede desplegarse como endpoint compatible con la API de OpenAI para conversaciones que combinen imágenes y texto.
- Asistencia sobre documentos escaneados o capturas: al aceptar entrada de imagen y texto, el modelo puede responder preguntas sobre el contenido visual en flujos de atención al cliente o back-office, con la ventaja de que los 8,4 GB de pesos caben en GPUs de gama media.
- Clasificación y extracción de información en lotes: tareas de etiquetado, resumen o extracción de campos sobre entradas de texto e imagen, donde la ligera pérdida de fidelidad frente a BF16 (94,5 % de recuperación media) es aceptable a cambio de mayor throughput y menor coste por token.
- Evaluación comparativa de cuantizaciones: el repositorio publica métricas de perplejidad, acuerdo top-1 y recuperación por benchmark, lo que lo convierte en un punto de referencia útil para decidir entre AWQ-4bit, AWQ-8bit, FP8 o NVFP4 en un mismo pipeline.
- Prototipado e investigación en entornos con una sola GPU: al necesitar solo 8,4 GB de pesos más la caché KV, permite experimentar con un modelo de 12B multimodal en estaciones de trabajo con Turing (sm75) o posterior, sin recurrir a clústeres.
- Despliegue en modo conversacional con contexto gestionado por vLLM: útil para demos interactivas y pruebas de integración de aplicaciones que consuman un endpoint compatible, teniendo en cuenta que la longitud de contexto no está documentada en esta ficha.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness sobre vLLM, decodificación greedy, prompts de estilo completion sin plantilla de chat (0 o 5 shot según la fila). Los porcentajes entre paréntesis indican la recuperación respecto a BF16.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 | NVFP4 | AWQ-4bit (este repo) |
|---|---|---|---|---|---|---|
| MMLU (5-shot) | 65,40 | 65,90 (100,8 %) | 65,80 (100,6 %) | 67,00 (102,4 %) | 62,78 (96,0 %) | 63,42 (97,0 %) |
| GSM8K (5-shot, strict) | 63,38 | 68,99 (108,9 %) | 65,05 (102,6 %) | 64,59 (101,9 %) | 60,42 (95,3 %) | 63,46 (100,1 %) |
| ARC-Challenge (0-shot) | 42,32 | 41,64 (98,4 %) | 39,59 (93,5 %) | 37,63 (88,9 %) | 40,96 (96,8 %) | 40,61 (96,0 %) |
| Winogrande (5-shot) | 61,80 | 61,56 (99,6 %) | 62,75 (101,5 %) | 60,14 (97,3 %) | 58,72 (95,0 %) | 61,17 (99,0 %) |
| KMMLU (5-shot, direct) | 43,28 | 42,59 (98,4 %) | 43,60 (100,7 %) | 39,00 (90,1 %) | 33,66 (77,8 %) | 34,01 (78,6 %) |
| HAE-RAE (0-shot) | 64,62 | 64,62 (100,0 %) | 65,08 (100,7 %) | 62,51 (96,7 %) | 58,75 (90,9 %) | 59,30 (91,8 %) |
| Media | 56,80 | 57,55 (101,3 %) | 56,98 (100,3 %) | 55,15 (97,1 %) | 52,55 (92,5 %) | 53,66 (94,5 %) |

Evaluación de fidelidad frente al original BF16 sobre un conjunto interno mixto inglés/coreano:

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor es mejor) | 1,3230 | 1,1488 (+15,2 %) |
| Acuerdo top-1 en siguiente token | 90,0 % | 99,2 % |

El propio autor advierte de que la recuperación media del 94,5 % implica una degradación apreciable a esta precisión y recomienda una build de 8 bits si la calidad es prioritaria.

## Requisitos de hardware

- VRAM para pesos: 8,4 GB. Hay que añadir la caché KV, que crece con la longitud de contexto (no se documenta el tamaño por token).
- Runtime: vLLM ≥ 0.23.0 para soportar la arquitectura; probado con vLLM 0.32.0.
- Dependencias de vLLM 0.32: Python 3.11–3.14, torch 2.13 (build CUDA 13.0, requiere driver NVIDIA con soporte CUDA 13), transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado, ya que el checkpoint se guardó con 0.19.0).
- GPU: NVIDIA Turing (sm75) o posterior. V100 (sm70) no está soportada. Solo se probó en B200 según el autor.
- Cabe en GPUs de consumo con al menos 12 GB de VRAM efectiva para contextos cortos (los 8,4 GB de pesos más caché KV y overhead); para contextos largos conviene 16 GB o más.
- Opciones de despliegue: vLLM es la vía soportada y probada. No se documenta soporte para llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| axteam/gemma-4-12B-it-AWQ-4bit (este repo) | 11,96 B | AWQ INT4 W4A16 | no disponible | Apache-2.0 | safetensors (compressed-tensors) | 8,4 GB en disco; recuperación media 94,5 % vs BF16 |
| google/gemma-4-12B-it (BF16) | 11,96 B | BF16 | no disponible | Apache-2.0 | safetensors | Referencia de calidad; requiere aproximadamente el cuádruple de memoria para pesos |
| Variante AWQ-8bit del mismo modelo base | 11,96 B | AWQ 8 bits | no disponible | Apache-2.0 | compressed-tensors | Recuperación media 100,3 % según los datos del autor; mayor huella de memoria |
| Variante FP8-dynamic del mismo modelo base | 11,96 B | FP8 | no disponible | Apache-2.0 | compressed-tensors | Recuperación media 101,3 %; requiere hardware con soporte FP8 |

La comparación se limita a las variantes de cuantización del mismo modelo base documentadas por el autor; no se dispone de datos de benchmarks de modelos alternativos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- Degradación medible de calidad: perplejidad un 15,2 % superior a BF16 y acuerdo top-1 del 90,0 % frente al 99,2 % del original.
- Caída acusada en tareas coreanas: KMMLU al 78,6 % de recuperación y HAE-RAE al 91,8 %, probablemente relacionada con la calibración mayoritariamente coreana y la sensibilidad de esas tareas a la cuantización.
- La calibración no incluyó respuestas en modo "thinking", por lo que el comportamiento en ese modo no está validado.
- El repositorio no incluye el `tokenizer.json` corregido por Google el 30 de octubre de 2026 (commit `43c9d01`), lo que puede afectar a la tokenización de ciertos glitch-tokens.
- Longitud de contexto no documentada en la información disponible; debe consultarse la model card del modelo base.
- Idiomas soportados no documentados; el rendimiento multilingüe fuera del inglés y el coreano no está medido.
- Soporte de tool calling, agentes y razonamiento multi-paso no documentado para esta build.
- Restricciones de licencia: aunque la etiqueta es Apache-2.0, el enlace de licencia apunta a la licencia Gemma 4 de Google; conviene revisar los términos de uso comercial de Gemma antes de desplegar en producción.
- Dependencias frágiles: requiere versiones concretas de vLLM, torch, transformers y compressed-tensors; actualizar compressed-tensors por separado puede romper la carga del checkpoint.
- Solo se validó en B200 según el autor; el rendimiento en otras GPUs compatibles (sm75 en adelante) no está medido.
- Riesgo de alucinación inherente al modelo base, no mitigado por la cuantización.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/axteam/gemma-4-12B-it-AWQ-4bit
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Otros enlaces (papers, blogs, repos, demos): no disponibles en la información proporcionada.
