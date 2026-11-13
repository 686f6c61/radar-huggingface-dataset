# IntezraInc/harrier-oss-v1-27b-W4A16-g64-FP8mix

## Resumen

harrier-oss-v1-27b-W4A16-g64-FP8mix es una cuantización no oficial del modelo de embeddings multilingüe `microsoft/harrier-oss-v1-27b`, publicada por Intezra, Inc. El modelo base emplea la arquitectura Gemma 3 (62 capas, embeddings de 5.376 dimensiones, pooling de último token y normalización L2) y está diseñado exclusivamente para generar representaciones vectoriales de texto, no para generación. Esta versión comprimida combina cuantización INT4 con group size 64 (W4A16) y precisión mixta FP8 mediante `compressed-tensors` y `llm-compressor`, reduciendo el peso en disco de 54,0 GB (BF16) a 20,29 GB.

El objetivo declarado es permitir el despliegue en una única GPU de 24 GB (concretamente una RTX Pro 4000 Blackwell SFF), algo inviable con el checkpoint original en BF16. La ficha del autor reporta una degradación mínima frente al modelo de referencia: una media de nDCG@10 de 0,6852 frente a 0,6851 en BF16 sobre tareas de recuperación MTEB, y una similitud coseno mediana por ítem de entre 0,9922 y 0,9961 según el tipo de contenido (inglés corto, documentos largos, multilingüe y código).

Es relevante ahora porque demuestra que es posible servir un modelo de embeddings de ~11.800 millones de parámetros con calidad prácticamente idéntica al original en hardware de consumo profesional, lo que abarata significativamente los pipelines de RAG, búsqueda semántica y recuperación de código a gran escala. La licencia MIT del modelo base se mantiene en esta cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3 text), 62 capas, embeddings de 5.376 dimensiones, pooling de último token, normalización L2 |
| Parametros totales | 11.836.123.904 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens recomendados para inferencia (hasta 12.288 con 0,95 de utilización de VRAM; 8.193 configurado en `max-model-len` por limitación de vLLM 0.31) |
| Tipos de cuantizacion | W4A16 (INT4, group size 64), FP8 mixto, `compressed-tensors`; pesos en safetensors |
| Idiomas soportados | Multilingüe (sin listado explícito de idiomas en la información disponible) |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors), servido con vLLM |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura Gemma 3 en su variante de texto, con 62 capas, dimensión de embedding de 5.376 y un esquema de pooling de último token seguido de normalización L2, típico de los modelos de embeddings de recuperación. Incluye capas de atención con ventana deslizante, un detalle relevante para el rendimiento en producción: con chunked prefill activado, esas capas retienen únicamente una ventana de ~1.000 tokens, lo que aproximadamente cuadruplica el contexto que cabe en memoria.

Los datasets citados en la model card del modelo base son `allenai/gooaq`, `CohereLabs/aya_dataset`, `HuggingFaceFW/fineweb-2`, `HuggingFaceFW/fineweb-edu` y `codeparrot/github-code-clean`, lo que sugiere un entrenamiento orientado a recuperación multilingüe, código y texto general. No se detalla en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. La cuantización de esta ficha se realizó con `llm-compressor` y `compressed-tensors`, combinando INT4 g64 con FP8 en una estrategia de precisión mixta; el autor indica que la revisión del modelo base utilizada fue `0c0fc62`.

## Capacidades

- Generación de embeddings de texto para recuperación semántica y búsqueda (pipeline `feature-extraction`).
- Embeddings multilingües, con evaluación en 12 idiomas vía Belebele y 7 idiomas vía MLQA.
- Recuperación de código: evaluación sobre 18 tareas de MTEB(Code, v1) y RTEB(Code, beta), incluyendo CodeSearchNet, HumanEval, MBPP, SWE-bench y text-to-SQL.
- Manejo de documentos largos, con truncado a 8.192 tokens en las evaluaciones.
- Soporte de prompts de instrucción con el formato `Instruct: {task}\nQuery: {query}`, con prompts oficiales de Harrier para tareas MTEB.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-step: es exclusivamente un modelo de embeddings.
- No se reportan capacidades de visión ni audio en la información disponible.

## Casos de uso

- Búsqueda semántica en producción sobre GPU de 24 GB: el checkpoint ocupa 20,29 GB en disco y se sirve con vLLM en una RTX Pro 4000 Blackwell SFF, lo que permite desplegar un motor de recuperación de 11.800 millones de parámetros en una estación de trabajo sin clúster.
- RAG multilingüe: gracias a su evaluación en 12 idiomas (Belebele) y 7 idiomas (MLQA), puede indexar y recuperar pasajes en distintos idiomas con una misma colección vectorial, manteniendo una media de nDCG@10 de 0,9492 en BelebeleRetrieval.
- Recuperación de código en asistentes de desarrollo: con nDCG@10 de 0,9743 en HumanEvalRetrieval y 0,9212 en MBPPRetrieval, es adecuado para indexar repositorios y sugerir fragmentos relevantes en herramientas tipo copiloto.
- Búsqueda de documentación técnica y normativa: en SciFact alcanza 0,7982 de nDCG@10 y en NFCorpus 0,4208, lo que lo hace útil para recuperación de literatura científica y corpus especializados.
- Deduplicación y clustering semántico de grandes corpus: la similitud coseno mediana de 0,9945 en documentos largos frente a BF16 permite sustituir el modelo original en pipelines de deduplicación sin recalibrar umbrales de forma significativa.
- Búsqueda en bases de código SQL: con 0,8926 de nDCG@10 en WikiSQLRetrieval y 0,6373 en SyntheticText2SQL, puede emplearse para recuperar consultas y esquemas relevantes en asistentes de análisis de datos.
- Moderación y clasificación por similitud: al ser un modelo de embeddings puro, permite construir clasificadores few-shot basados en prototipos vectoriales sin necesidad de fine-tuning.

## Benchmarks y rendimiento

Recuperación (mteb 2.24.9, prompts oficiales de Harrier, entradas truncadas a 8.192 tokens):

| Tarea | BF16 nDCG@10 | Este modelo nDCG@10 | Δ | BF16 R@10 | Este modelo R@10 |
|---|---|---|---|---|---|
| SciFact | 0,7995 | 0,7982 | -0,0013 | 0,9406 | 0,9372 |
| NFCorpus | 0,4192 | 0,4208 | +0,0017 | 0,2056 | 0,2060 |
| FiQA2018 | 0,6221 | 0,6204 | -0,0017 | 0,6978 | 0,6923 |
| ArguAna | 0,6814 | 0,6831 | +0,0018 | 0,9360 | 0,9367 |
| SCIDOCS | 0,2907 | 0,2894 | -0,0013 | 0,3127 | 0,3108 |
| LEMBSummScreenFDRetrieval | 0,9858 | 0,9838 | -0,0019 | 0,9970 | 0,9970 |
| BelebeleRetrieval | 0,9495 | 0,9492 | -0,0003 | 0,9839 | 0,9837 |
| MLQARetrieval | 0,7329 | 0,7363 | +0,0035 | 0,8434 | 0,8479 |
| **Media** | **0,6851** | **0,6852** | **+0,0001** | 0,7396 | 0,7390 |

Recuperación de código (18 tareas, MTEB(Code, v1) + RTEB(Code, beta)):

| Tarea | BF16 nDCG@10 | Este modelo | Δ |
|---|---|---|---|
| AppsRetrieval | 0,7242 | 0,7144 | -0,0098 |
| COIRCodeSearchNetRetrieval | 0,8621 | 0,8588 | -0,0033 |
| CodeEditSearchRetrieval | 0,7590 | 0,7653 | +0,0063 |
| CodeFeedbackMT | 0,9518 | 0,9503 | -0,0015 |
| CodeFeedbackST | 0,8928 | 0,8920 | -0,0009 |
| CodeSearchNetCCRetrieval | 0,7902 | 0,7978 | +0,0077 |
| CodeSearchNetRetrieval | 0,8920 | 0,8923 | +0,0004 |
| CodeTransOceanContest | 0,9362 | 0,9362 | 0,0000 |
| CodeTransOceanDL * | 0,3469 | 0,3405 | -0,0064 |
| CosQA * | 0,3615 | 0,3356 | -0,0259 |
| DS1000Retrieval * | 0,6717 | 0,6733 | +0,0016 |
| FreshStackRetrieval | 0,4444 | 0,4414 | -0,0031 |
| HumanEvalRetrieval | 0,9724 | 0,9743 | +0,0019 |
| MBPPRetrieval | 0,9225 | 0,9212 | -0,0012 |
| SWEbenchCodeRetrieval | 0,0672 | 0,0512 | -0,0160 |
| StackOverflowQA | 0,9700 | 0,9683 | -0,0017 |
| SyntheticText2SQL * | 0,6078 | 0,6373 | +0,0296 |
| WikiSQLRetrieval | 0,8973 | 0,8926 | -0,0047 |
| **Media, 18 tareas** | **0,7261** | **0,7246** | **-0,0015** |
| **Media, 14 tareas robustas** | **0,7916** | **0,7897** | **-0,0018** |

Similitud coseno por ítem frente a BF16 (2.000 ítems, p5 = percentil 5):

| Categoría | mediana | p5 | p1 | mínimo | p5 en RTX PRO 6000 |
|---|---|---|---|---|---|
| Inglés corto | 0,9961 | 0,9938 | 0,9924 | 0,9911 | 0,9941 |
| Documentos largos | 0,9945 | 0,9929 | 0,9922 | 0,9901 | 0,9934 |
| Multilingüe | 0,9922 | 0,9867 | 0,9838 | 0,9818 | 0,9877 |
| Código | 0,9932 | 0,9898 | 0,9884 | 0,9854 | 0,9902 |

## Requisitos de hardware

- VRAM estimada: 20,29 GB de pesos en disco; con `--gpu-memory-utilization 0.95` y modo eager cabe en una GPU de 24 GB.
- GPU recomendada: RTX Pro 4000 Blackwell SFF (24 GB), para la que fue construido. El autor menciona también pruebas en RTX PRO 6000.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB (RTX 4090, RTX Pro 4000 Blackwell SFF) siempre que la tarjeta esté dedicada (sin pantalla ni otros procesos).
- Despliegue: vLLM 0.31.0 con `--runner pooling --convert embed`, `--pooler-config '{"seq_pooling_type": "LAST", "use_activation": true}'`, `--max-model-len 8193`, `--enable-chunked-prefill`, `--max-num-batched-tokens 2048`, `--enforce-eager` y `--gpu-memory-utilization 0.95`.
- Contexto práctico: hasta 12.288 tokens cargan y generan embeddings con 0,95 de utilización; se recomiendan 8.192 para margen. Con 0,90 solo caben ~2.000 tokens, y los CUDA graphs (sin `--enforce-eager`) no caben a 8k.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| harrier-oss-v1-27b-W4A16-g64-FP8mix | 11.836.123.904 | 8.192 recomendado | MIT | safetensors (compressed-tensors) | Cuantización INT4+FP8; media nDCG@10 de 0,6852 en recuperación y 0,7246 en código |
| microsoft/harrier-oss-v1-27b (BF16) | 11.836.123.904 | no disponible | MIT | safetensors | Referencia original; 54,0 GB en disco; requiere más VRAM |
| Alternativas de embeddings de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Es una cuantización no oficial: Intezra, Inc. no está afiliada a Microsoft ni respaldada por ella; conviene validar la calidad en el dominio propio antes de sustituir el BF16.
- El modelo es exclusivamente de embeddings: no genera texto, no soporta tool calling ni razonamiento multi-step.
- Degradación localizada en tareas de código: CosQA cae 0,0259 y SWEbenchCodeRetrieval 0,0160 en nDCG@10 frente a BF16; en SWEbench el valor absoluto ya es muy bajo (0,0512), por lo que no es fiable para esa tarea.
- Las tareas marcadas con asterisco (CodeTransOceanDL, CosQA, DS1000Retrieval, SyntheticText2SQL) están dominadas por empates y sus deltas no son significativos.
- Limitación operativa de vLLM 0.31: se bloquea si la longitud de una petición de pooling iguala exactamente `max_model_len` con chunked prefill; de ahí el valor 8.193 y el truncado en cliente a 8.192.
- La ventana deslizante de Gemma 3 reduce el contexto efectivo en capas concretas a ~1.000 tokens; con chunked prefill se mitiga, pero el comportamiento en documentos muy largos puede diferir del esperado.
- Con 0,90 de utilización de VRAM solo caben ~2.000 tokens de contexto; la tarjeta debe estar dedicada.
- No se detalla la lista completa de idiomas soportados ni los sesgos conocidos del modelo base en la información disponible.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí el riesgo de recuperar pasajes irrelevantes con alta similitud coseno en dominios fuera de distribución.
- Licencia MIT: permite uso comercial, pero al ser una cuantización de terceros conviene conservar la atribución al modelo base y revisar los términos de los datasets de entrenamiento citados.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/IntezraInc/harrier-oss-v1-27b-W4A16-g64-FP8mix
- Modelo base: https://huggingface.co/microsoft/harrier-oss-v1-27b
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Repositorio de llm-compressor: https://github.com/vllm-project/llm-compressor
- Repositorio de compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- MTEB: https://github.com/embeddings-benchmark/mteb
- Dataset allenai/gooaq: https://huggingface.co/datasets/allenai/gooaq
- Dataset CohereLabs/aya_dataset: https://huggingface.co/datasets/CohereLabs/aya_dataset
- Dataset HuggingFaceFW/fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset HuggingFaceFW/fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset codeparrot/github-code-clean: https://huggingface.co/datasets/codeparrot/github-code-clean
