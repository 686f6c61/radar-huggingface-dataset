# axteam/Qwen3.6-35B-A3B-FP8-dynamic

## Resumen

Qwen3.6-35B-A3B-FP8-dynamic es una cuantización de 8 bits del modelo multimodal Qwen/Qwen3.6-35B-A3B, publicada por el usuario axteam. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer híbrido que combina atención lineal con atención completa, una arquitectura Mixture-of-Experts (MoE) con 256 expertos más un experto compartido, y una torre de visión que lo habilita para tareas de imagen-texto. Con 35.951.822.704 parámetros totales y aproximadamente 3.000 millones activos por token, el modelo está pensado para servir cargas de trabajo multimodales con un coste de cómputo por token muy inferior al de un modelo denso de tamaño equivalente.

La versión FP8-dynamic aplica cuantización post-entrenamiento (PTQ) sin recalibración: pesos en FP8 E4M3 con escala por canal de salida y activaciones FP8 dinámicas por token, almacenados en el formato `float-quantized` de compressed-tensors con esquema `FP8_DYNAMIC` (W8A8). El objetivo declarado es el despliegue eficiente en vLLM, y el autor mantiene en BF16 los componentes sensibles a la precisión (torre de visión, proyector, cabeza MTP, RMSNorms, embeddings, LM head, router MoE y las partes no lineales del bloque SSM), lo que supone cerca del 6 % de los parámetros.

La relevancia de esta ficha es doble. Por un lado, documenta una receta de cuantización FP8 con evaluación de fidelidad frente al original. Por otro, expone una revisión correctiva del `config.json` (2026-11-02) que arregla un fallo crítico en la carga de los pesos de visión con vLLM 0.32: la versión anterior cuantizaba la torre visual por un patrón de nombres incorrecto, lo que producía respuestas erróneas ante entradas de imagen. Cualquier despliegue multimodal con este repositorio debe usar la revisión posterior a ese cambio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal + atención completa), MoE con 256 expertos + experto compartido, multimodal (visión), cabeza MTP |
| Parámetros totales | 35.951.822.704 |
| Parámetros activos | ~3B (aproximadamente 3.000 millones por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 dinámico (W8A8, E4M3, escala por canal de salida, activaciones por token); componentes seleccionados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (`float-quantized`, esquema `FP8_DYNAMIC`) |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Tamaño en disco | ~38,4 GB |
| Calibración | Ninguna (escalas estáticas de pesos sin datos) |
| Librería | transformers (safetensors), servido con vLLM |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura híbrida que intercala capas de atención lineal con capas de atención completa, combinada con un bloque Mixture-of-Experts de 256 expertos más un experto compartido y enrutamiento mediante un gate. A esto se suma una torre de visión con su proyector para entrada de imagen y una cabeza de predicción multi-token (MTP), que en la práctica habilita decodificación especulativa sobre el propio modelo. El resultado es un modelo multimodal con ~35B parámetros totales pero solo ~3B activos por token, lo que reduce drásticamente el coste de inferencia frente a un denso del mismo tamaño.

Esta ficha corresponde a una cuantización post-entrenamiento, no a un reentrenamiento: no hay datos de entrenamiento, número de tokens ni composición del dataset disponibles en la información proporcionada. La cuantización es data-free: los pesos se almacenan en FP8 E4M3 con escala por canal de salida y las activaciones se cuantizan dinámicamente por token. Se preservan en BF16 la torre de visión y el proyector (`model.visual.*`), la cabeza MTP (`mtp.*`), todas las RMSNorms, los embeddings de tokens, el LM head, el router MoE (`mlp.gate`) y el gate del experto compartido, así como las partes no lineales del bloque SSM (`linear_attn.conv1d`, `A_log`, `dt_bias`), que en conjunto representan cerca del 6 % de los parámetros. El tokenizador, la `chat_template` y el `generation_config` son idénticos al original; el `config.json` es el del modelo base más un bloque `quantization_config`.

La revisión del 2026-11-02 corrige un defecto en el patrón de exclusión de la torre de visión: el patrón anterior `re:model\.visual\..*` no coincidía con los nombres que usa vLLM (`visual.*`), de modo que vLLM 0.32 construía las capas visuales en FP8 y cargaba pesos BF16 en ellas, produciendo respuestas incorrectas ante imágenes. El patrón corregido hace que los pesos de visión se carguen en BF16. Los pesos no cambiaron entre revisiones; solo el `config.json`.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de plantilla de chat idéntica al modelo base.
- Comprensión de imágenes y respuesta en texto (pipeline `image-text-to-text`): descripción de contenido visual, respuesta a preguntas sobre imágenes y razonamiento sobre la escena.
- Razonamiento y matemáticas de nivel medio, con resultados medidos en GSM8K y ARC-Challenge (ver sección de benchmarks).
- Conocimiento multilingüe y cultural, con resultados medidos en KMMLU (coreano) y HAE-RAE (coreano), lo que sugiere cobertura de idiomas más allá del inglés.
- Decodificación especulativa nativa mediante la cabeza MTP incluida en el modelo.
- Capacidad de servir en vLLM con soporte de la arquitectura desde la versión 0.17.0.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Descripción y análisis de imágenes en producción: el modelo acepta imagen y texto y devuelve una descripción o respuesta; útil para moderación de contenido visual, alt-text automático o inspección de capturas. Requiere la revisión corregida del `config.json` para que la torre de visión cargue en BF16.
- Asistentes conversacionales multimodales: la plantilla de chat del modelo base se conserva intacta, de modo que se puede integrar en un backend de chat con historial multi-turno y adjuntos de imagen, sirviendo con vLLM para aprovechar los ~3B parámetros activos por token.
- Extracción de información de documentos escaneados: al combinar visión y generación de texto, el modelo puede transcribir o resumir contenido de capturas y formularios, con la ventaja de coste de un MoE de 3B activos frente a un denso de 35B.
- Servicio de inferencia con restricciones de VRAM: la cuantización FP8 reduce el peso en disco a ~38,4 GB y permite servir el modelo en una sola GPU de 80 GB (A100/H100) con margen para caché KV, algo inviable con el original en BF16 en el mismo hardware.
- Razonamiento y respuesta a preguntas en coreano y otros idiomas: los resultados medidos en KMMLU (64,86) y HAE-RAE (74,89) lo sitúan como opción para atención al cliente o QA en mercados de Asia Oriental, siempre que se valide el idioma concreto.
- Evaluación comparativa de recetas de cuantización: el repositorio publica una tabla con seis variantes (FP8-dynamic, AWQ-8bit, NVFP4A16, NVFP4, AWQ-4bit) medidas con el mismo arnés, lo que lo convierte en un banco de pruebas útil para decidir el formato de despliegue.
- Prototipado de decodificación especulativa: la cabeza MTP incluida permite experimentar con speculative decoding sin un modelo borrador externo, midiendo el impacto en latencia sobre vLLM.

## Benchmarks y rendimiento

Todos los resultados fueron medidos con lm-evaluation-harness sobre vLLM, con decodificación greedy y prompts estilo completion sin plantilla de chat (0 o 5 disparos según la fila). MMLU usa la variante generativa (`mmlu_generative`), no comparable con puntuaciones obtenidas por log-likelihood.

| Benchmark | BF16 (original) | FP8-dynamic (este repo) | AWQ-8bit | NVFP4A16 | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativo) | 64,44 | 67,45 (104,7 %) | 64,02 (99,3 %) | 69,31 (107,6 %) | 68,39 (106,1 %) | 74,12 (115,0 %) |
| GSM8K (5-shot, estricto) | 30,40 | 21,53 (70,8 %) | 28,81 (94,8 %) | 24,49 (80,5 %) | 46,55 (153,1 %) | 71,11 (233,9 %) |
| ARC-Challenge (0-shot) | 55,38 | 54,61 (98,6 %) | 55,46 (100,2 %) | 55,03 (99,4 %) | 56,23 (101,5 %) | 54,78 (98,9 %) |
| Winogrande (5-shot) | 76,32 | 75,37 (98,8 %) | 76,24 (99,9 %) | 74,43 (97,5 %) | 74,27 (97,3 %) | 75,85 (99,4 %) |
| KMMLU (5-shot, directo) | 65,14 | 64,86 (99,6 %) | 65,18 (100,1 %) | 64,50 (99,0 %) | 64,09 (98,4 %) | 64,61 (99,2 %) |
| HAE-RAE (0-shot) | 74,89 | 74,89 (100,0 %) | 75,07 (100,2 %) | 75,34 (100,6 %) | 74,06 (98,9 %) | 73,69 (98,4 %) |
| Media | 61,09 | 59,78 (97,9 %) | 60,80 (99,5 %) | 60,52 (99,1 %) | 63,93 (104,6 %) | 69,03 (113,0 %) |
| Media sin MMLU ni GSM8K | 67,93 | 67,43 (99,3 %) | 67,99 (100,1 %) | 67,33 (99,1 %) | 67,16 (98,9 %) | 67,23 (99,0 %) |

El autor advierte que MMLU y GSM8K se puntúan sobre texto generado y dependen del formato exacto de respuesta, por lo que oscilan ampliamente entre builds del mismo modelo (MMLU 64,0–74,1; GSM8K 21,5–71,1) y dos builds cuantizados superan al BF16 original. No se verificó respuesta por respuesta, por lo que la media sin MMLU ni GSM8K es más fiable.

Fidelidad frente al original BF16, medida sobre un conjunto interno mixto inglés/coreano de 100 prompts con respuestas greedy del BF16 como referencia:

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor = más cercano) | 1,3065 | 1,2934 (+1,0 %) |
| Acuerdo top-1 en el siguiente token | 95,7 % | 98,0 % |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa ~38,4 GB en disco; en FP8 el peso del modelo cabe holgadamente en una GPU de 80 GB, dejando espacio para caché KV y contexto. En GPUs de 48 GB (L40S, A6000) el ajuste es posible pero con margen reducido para lotes y contexto largos.
- GPU recomendadas: A100 80 GB, H100 80 GB (SXM o PCIe) para producción; L40S o RTX 6000 Ada (48 GB) para despliegues de un solo nodo con menor concurrencia.
- GPU de consumo: no disponible en la información proporcionada; no hay datos de ejecución en GPUs de 24 GB o menos, y el tamaño del repositorio (~38,4 GB) excede la VRAM de las consumer GPU habituales.
- Opciones de despliegue: vLLM es el runtime objetivo y el único probado (versión 0.32.0). La arquitectura está soportada desde vLLM ≥ 0.17.0. Requisitos de vLLM 0.32: Python 3.11–3.14, torch 2.13 (build CUDA 13.0, con driver NVIDIA compatible con CUDA 13), transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0. No hay datos de soporte en llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Comparativa con las otras recetas de cuantización del mismo modelo base, medidas con el mismo arnés (medias de la tabla de benchmarks):

| Modelo | Parámetros | Contexto | Media (sin MMLU/GSM8K) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B FP8-dynamic (este repo) | 35,95B totales / ~3B activos | no disponible | 67,43 | Apache-2.0 | Hugging Face, vLLM |
| Qwen3.6-35B-A3B AWQ-8bit | 35,95B totales / ~3B activos | no disponible | 67,99 | Apache-2.0 | Hugging Face |
| Qwen3.6-35B-A3B NVFP4 | 35,95B totales / ~3B activos | no disponible | 67,16 | Apache-2.0 | Hugging Face |
| Qwen3.6-35B-A3B AWQ-4bit | 35,95B totales / ~3B activos | no disponible | 67,23 | Apache-2.0 | Hugging Face |
| Qwen3.6-35B-A3B BF16 (original) | 35,95B totales / ~3B activos | no disponible | 67,93 | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks de modelos de otros autores (por ejemplo, alternativas densas o MoE de tamaño comparable) en la información proporcionada, por lo que la comparación se limita a las variantes de cuantización del mismo modelo base.

## Limitaciones y advertencias

- La revisión anterior a 2026-11-01 23:22:52 UTC (revisión `b70d947`) produce respuestas incorrectas ante imágenes por el patrón de exclusión de la torre de visión. Es obligatorio descargar de nuevo el `config.json` si se obtuvo antes de esa fecha.
- La cuantización es PTQ sin recalibración; la fidelidad medida es de +1,0 % de perplejidad y 95,7 % de acuerdo top-1 frente al BF16, lo que implica una degradación pequeña pero no nula.
- Las puntuaciones de MMLU y GSM8K son inestables entre builds por dependencia del formato de respuesta; no deben usarse como criterio único de calidad ni compararse con evaluaciones por log-likelihood.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información proporcionada; aplica el riesgo habitual de los modelos generativos.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada en esta ficha y los idiomas soportados no se detallan; solo hay evidencia medida de inglés y coreano.
- Licencia Apache-2.0, que permite uso comercial, pero el autor enlaza a la licencia del modelo base y no se han verificado condiciones adicionales del modelo original.
- Dependencia estricta de versiones: vLLM 0.32 con torch 2.13 (CUDA 13.0), transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0; desviarse de estas versiones puede romper la carga de pesos cuantizados.
- No hay datos de soporte en runtimes distintos de vLLM (llama.cpp, Ollama, TGI), lo que limita las opciones de despliegue.
- El número de descargas (275) y de likes (1) es bajo, por lo que la validación comunitaria de la receta es escasa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/Qwen3.6-35B-A3B-FP8-dynamic
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Paper, blog, repositorio de vLLM y demos: no disponibles en la información proporcionada.
