# seanfarrell/icd11_ner_model_v2_large

## Resumen

El modelo `seanfarrell/icd11_ner_model_v2_large` es un modelo de embeddings de frases desarrollado por el usuario de Hugging Face `seanfarrell` como fine-tune de `google/embeddinggemma-300m`. Convierte términos y frases cortas en vectores densos de 768 dimensiones y está orientado a similitud semántica y recuperación de información sobre terminología clínica, en particular el vocabulario ICD-11. Aunque el identificador incluye “NER”, la pipeline declarada es `sentence-similarity`, no un modelo generativo ni un etiquetador de entidades token a token.

La arquitectura es un bi-encoder basado en `Gemma3TextModel`, con pooling medio, dos capas densas de 768 a 3072 y de vuelta a 768, y normalización L2. El modelo tiene 302.863.104 parámetros y una longitud máxima de secuencia declarada de solo 30 tokens, lo que lo limita a términos, etiquetas y frases muy cortas. Es relevante para tareas de normalización de terminología médica y búsqueda semántica en catálogos ICD-11, pero no sustituye a un modelo generativo ni a un sistema completo de codificación clínica.

El autor declara un entrenamiento con `MultipleNegativesRankingLoss` y un tamaño de dataset de 8.089.600 unidades no especificadas. No se detallan idiomas, licencia, composición del dataset ni resultados de benchmarks fuera del conjunto `icd11 val`. Los resultados publicados son declarados por el autor y no están verificados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SentenceTransformer bi-encoder con `Gemma3TextModel`; pooling medio; capas densas 768→3072→768; normalización L2 |
| Parámetros totales | 302.863.104 |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 30 tokens (longitud máxima de secuencia declarada) |
| Tipos de cuantización | no disponible (solo se publican pesos safetensors; no se documentan variantes GGUF, AWQ, GPTQ, etc.) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors; módulo `sentence-transformers` |
| Dimensión de embedding | 768 |
| Función de similitud | Similitud coseno |
| Tarea declarada | `sentence-similarity`, `feature-extraction`, recuperación de información |
| Modelo base | `google/embeddinggemma-300m` |
| Tamaño del repositorio | 1,3 GB |
| Autor | `seanfarrell` |
| Dataset declarado | `dataset_size:8089600` (unidades no especificadas) |
| Pérdida de entrenamiento | `MultipleNegativesRankingLoss` |

## Arquitectura y entrenamiento

El modelo sigue el esquema clásico de Sentence Transformers: un encoder transformer, en este caso `Gemma3TextModel`, genera representaciones token a token; después se aplica un pooling medio para obtener un vector de 768 dimensiones. Sobre ese vector se aplican dos capas densas sin sesgo ni activación, de 768 a 3072 y de 3072 a 768, seguidas de normalización L2. La similitud entre consulta y documento se calcula con producto escalar sobre vectores normalizados, equivalente a similitud coseno.

El entrenamiento se realizó con `MultipleNegativesRankingLoss`, una pérdida contrastiva habitual en modelos bi-encoder que utiliza negativos dentro del lote. El autor declara un tamaño de dataset de 8.089.600, pero no especifica si son pares, tripletas, tokens ni la composición exacta. No se documenta el número de tokens de entrenamiento, los idiomas utilizados, si hubo fases de RLHF o DPO, ni innovaciones técnicas adicionales como atención lineal o decodificación especulativa. Tampoco se detalla el proceso de selección de negativos ni la procedencia de los términos ICD-11.

## Capacidades

- Generación de embeddings densos de 768 dimensiones para términos, frases cortas y etiquetas clínicas.
- Codificación asimétrica de consultas y documentos mediante `encode_query` y `encode_document`.
- Búsqueda semántica y ranking por similitud coseno sobre catálogos de conceptos.
- Normalización y recuperación de candidatos ICD-11 a partir de términos clínicos libres.
- Agrupamiento, deduplicación y minería de paráfrasis sobre representaciones vectoriales.
- Uso como extractor de características para clasificación o clustering con modelos posteriores.
- No es un modelo generativo: no produce texto, no responde preguntas y no extrae entidades con etiquetas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidades multilingües: no disponibles; no se especifica qué idiomas cubre el entrenamiento.
- Longitud máxima de 30 tokens, adecuada para términos y etiquetas, no para notas clínicas completas.

## Casos de uso

- Búsqueda semántica en un catálogo ICD-11: se indexan las rúbricas y sinónimos como documentos y se recuperan los candidatos más similares para una consulta corta. Es adecuado porque el modelo está entrenado para similitud entre términos clínicos, aunque limita cada entrada a 30 tokens.
- Asistencia a la codificación clínica: a partir de una etiqueta diagnóstica breve, el sistema recupera los códigos ICD-11 candidatos y el codificador humano valida la asignación. El modelo no decide el código final, solo ordena candidatos.
- Normalización de catálogos locales: se generan embeddings de términos procedentes de un sistema hospitalario y se comparan con los del catálogo ICD-11 para proponer equivalencias. Requiere revisión humana por la posibilidad de falsos positivos semánticos.
- Deduplicación y agrupamiento de términos: se agrupan etiquetas con significado equivalente o muy próximo mediante clustering sobre los embeddings. Útil para limpiar diccionarios de diagnósticos y sinónimos.
- Autocompletado en formularios de historia clínica electrónica: se precalculan embeddings del catálogo y se consulta el modelo al escribir un término corto. La latencia puede ser baja porque la secuencia máxima es de 30 tokens.
- Control de calidad terminológica: se detectan etiquetas inconsistentes o duplicadas comparando su similitud con el resto del catálogo. El modelo ayuda a priorizar revisión, no a corregir automáticamente.
- Enriquecimiento de datasets de notas clínicas segmentadas: si las menciones se extraen previamente y se limitan a frases cortas, sus embeddings pueden vincularse a conceptos ICD-11. No debe aplicarse directamente sobre notas completas sin segmentación.
- Recuperación para sistemas RAG clínicos sobre fragmentos muy cortos: puede indexar definiciones breves o rúbricas, pero no párrafos largos debido al límite de 30 tokens.

## Benchmarks y rendimiento

Los siguientes resultados son los declarados por el autor en el `model-index` para la tarea de recuperación de información sobre el conjunto `icd11 val`. Todos figuran como no verificados. Los valores son fracciones entre 0 y 1.

| Métrica | Valor |
|---|---:|
| Cosine Accuracy@1 | 0,7731 |
| Cosine Accuracy@5 | 0,8480 |
| Cosine Accuracy@10 | 0,8713 |
| Cosine Precision@1 | 0,7731 |
| Cosine Precision@3 | 0,6729 |
| Cosine Precision@5 | 0,5754 |
| Cosine Precision@10 | 0,4290 |
| Cosine Recall@1 | 0,1676 |
| Cosine Recall@3 | 0,4020 |
| Cosine Recall@5 | 0,5068 |
| Cosine Recall@10 | 0,6314 |
| Cosine NDCG@10 | 0,7209 |
| Cosine MRR@10 | 0,8068 |
| Cosine MAP@10 | 0,6633 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos. Esos benchmarks no son directamente aplicables a un modelo de embeddings.

## Requisitos de hardware

- Pesos en FP32: aproximadamente 1,21 GB solo para los 302.863.104 parámetros. El repositorio completo ocupa 1,3 GB.
- Pesos en FP16/BF16: aproximadamente 0,61 GB en teoría. Con overhead de runtime, reservar entre 0,8 y 1,2 GB de VRAM.
- Inferencia en FP32: reservar entre 1,5 y 2 GB de VRAM para lotes pequeños.
- Cuantización int8: aproximadamente 0,30 GB de pesos en teoría; con overhead, entre 0,5 y 0,8 GB. No se documentan cuantizaciones oficiales.
- Cuantización de 4 bits: aproximadamente 0,15 GB de pesos en teoría; no hay variantes publicadas en el repositorio.
- GPU consumer: cabe en GPUs con 4 GB o más, como GTX 1650, RTX 3050, RTX 3060, RTX 4060 o RTX 4090. Para serving conviene al menos 8 GB para procesar lotes.
- GPU de centro de datos: T4, L4, A10G o A100 son suficientes; A100/H100 no son necesarias por el tamaño del modelo.
- CPU: es viable para inferencia de baja concurrencia, especialmente con lotes pequeños y secuencias de 30 tokens.
- Despliegue: `sentence-transformers`, Hugging Face Text Embeddings Inference, Hugging Face Inference Endpoints. El tag `endpoints_compatible` indica compatibilidad con endpoints.
- No hay pesos GGUF publicados, por lo que `llama.cpp` u Ollama no están soportados directamente con los artefactos disponibles.
- Latencia y throughput: no disponibles. El límite de 30 tokens reduce el coste computacional por petición, pero no se publican medidas.

## Comparativa con modelos similares

No se identifican alternativas equivalentes con datos públicos completos en la información disponible. Se comparan el modelo base y variantes del mismo autor.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| `seanfarrell/icd11_ner_model_v2_large` | 302.863.104 | 30 tokens | Sentence similarity / recuperación de información | no disponible | Hugging Face |
| `google/embeddinggemma-300m` | 300M nominales | no disponible | Embeddings de texto | no disponible | Hugging Face |
| `seanfarrell/icd11_ner_model` | no disponible | no disponible | Token classification con BERT | no disponible | Hugging Face |
| `seanfarrell/icd11_ner_model_base` | no disponible | no disponible | no disponible | no disponible | Hugging Face |

El modelo fine-tuneado declara resultados en `icd11 val`, pero no se proporcionan resultados comparables del modelo base ni de las variantes `icd11_ner_model` y `icd11_ner_model_base`. La variante `icd11_ner_model` parece orientada a etiquetado de entidades con BERT, por lo que no es directamente comparable en la tarea de recuperación.

## Limitaciones y advertencias

- Longitud máxima de 30 tokens: es una limitación severa para notas clínicas, párrafos o documentos largos. Aunque la model card menciona “sentences & paragraphs”, el dato declarado de máxima secuencia es de 30 tokens.
- No es un modelo NER en sentido estricto: no devuelve entidades etiquetadas ni texto generado. El nombre puede inducir a error; para etiquetado token a token habría que usar otro modelo.
- Licencia no disponible: no puede asumirse uso comercial sin verificar la licencia del modelo base y del fine-tune.
- Idiomas no disponibles: no se especifica si el entrenamiento cubre español, inglés u otros idiomas. No hay garantía de buen rendimiento en terminología clínica en español.
- Benchmarks no verificados y limitados a un único conjunto `icd11 val`. No hay evaluación independiente ni comparación con el modelo base.
- Recall@1 de 0,1676 y Precision@10 de 0,4290: el ranking contiene candidatos relevantes, pero el top-1 no es fiable para todas las consultas. Conviene usar top-k y revisión humana.
- Riesgo de falsos positivos semánticos: términos clínicos con vocabulario compartido pueden quedar próximos aunque no sean equivalentes.
- No aplica el riesgo de alucinación generativa, pero sí el riesgo de recuperar o emparejar conceptos incorrectos.
- Composición del dataset desconocida: no se detalla la procedencia de los 8.089.600 ejemplos, el balance de clases ni posibles sesgos terminológicos.
- No hay artefactos GGUF ni cuantizaciones oficiales: el despliegue en llama.cpp u Ollama no está disponible de forma directa.
- Para producción clínica, cualquier asignación de códigos ICD-11 debe pasar por validación humana y auditoría.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seanfarrell/icd11_ner_model_v2_large
- Modelo base: https://huggingface.co/google/embeddinggemma-300m
- Documentación de Sentence Transformers: https://www.sbert.net
- Repositorio de Sentence Transformers: https://github.com/huggingface/sentence-transformers
- Modelos con librería Sentence Transformers: https://huggingface.co/models?library=sentence-transformers
- Paper Sentence-BERT: https://arxiv.org/abs/1908.10084
- Paper referenciado en los tags: https://arxiv.org/abs/1807.03748
- Variante NER del mismo autor: https://huggingface.co/seanfarrell/icd11_ner_model
- Variante base del mismo autor: https://huggingface.co/seanfarrell/icd11_ner_model_base
