# finvector/mistral_qlora_finmodern_tri_merged

## Resumen

`finvector/mistral_qlora_finmodern_tri_merged` es un modelo de embeddings de texto derivado de la familia Mistral, publicado por el usuario `finvector` en Hugging Face. El nombre del repositorio sugiere un proceso de ajuste fino con QLoRA sobre un modelo base Mistral y una posterior fusion (merging) de tres variantes, aunque la model card no documenta explícitamente el pipeline de entrenamiento. El modelo se distribuye con la librería `sentence-transformers` y está orientado a la tarea `feature-extraction`, es decir, a la generación de representaciones vectoriales densas para búsqueda semántica, similitud entre frases y clasificación.

Con 7.110.660.096 parámetros (aproximadamente 7,1 mil millones), se sitúa en la categoría de modelos de embeddings de gran tamaño, una tendencia iniciada por propuestas como E5-Mistral-7B-instruct. El repositorio ocupa 14,2 GB en formato `safetensors`. La model card declara resultados en el benchmark MTEB, incluyendo tareas de similitud semántica (STS) sobre conjuntos chinos (C-MTEB/AFQMC, C-MTEB/ATEC), clasificación multilingüe y recuperación de información.

El interés de esta ficha es limitado pero real: se trata de un modelo publicado con licencia MIT, sin descargas ni interacciones registradas en el momento de la consulta, y con una documentación muy escasa. Resulta relevante como ejemplo de modelo de embeddings de 7B ajustado para recuperación, pero debe evaluarse con cautela por la falta de transparencia sobre datos de entrenamiento, composición del dataset y metodología de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral), adaptado a embeddings con `sentence-transformers`; detalles de pooling no disponibles |
| Parametros totales | 7.110.660.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo publica `safetensors` en precisión completa; no se listan GGUF ni otras variantes) |
| Idiomas soportados | en (declarado en la model card); los benchmarks incluyen evaluaciones en de, es, fr, ja, zh |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | feature-extraction |
| Tamano del repositorio | 14,2 GB |
| Libreria | sentence-transformers |
| Dimension de embedding | no disponible |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Mistral, con aproximadamente 7,1 mil millones de parámetros. El modelo se ha reconvertido a la interfaz de `sentence-transformers` para producir embeddings de frase, lo que implica algún mecanismo de pooling sobre las representaciones del último token o de los tokens, aunque la model card no especifica cuál. El nombre del repositorio indica un ajuste fino con QLoRA (cuantización de 4 bits durante el entrenamiento con adaptadores de bajo rango) seguido de una fusión de tres variantes (`tri_merged`), pero no se documenta ni el modelo base exacto, ni el dataset de entrenamiento, ni el número de tokens utilizados, ni si hubo etapas de RLHF o DPO.

No se dispone de información sobre la composición del corpus de entrenamiento, la estrategia de muestreo de negativos, la función de pérdida (contrastiva, triplet, etc.) ni la longitud máxima de secuencia empleada. Tampoco se detalla si se aplicaron técnicas de decodificación especulativa, atención lineal u otras innovaciones. La ausencia de estos datos impide reproducir el entrenamiento o evaluar su calidad de forma independiente; los resultados publicados deben considerarse declaraciones del autor no verificadas (`verified: false` en el model-index).

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación densa.
- Clasificación de texto por similitud con prototipos o mediante clasificadores lineales sobre los embeddings.
- Recuperación de información (retrieval) en configuraciones de búsqueda semántica.
- Evaluación declarada en tareas STS y de clasificación del benchmark MTEB, incluyendo subconjuntos multilingües.
- Soporte de integración con `sentence-transformers`, `transformers` y `text-embeddings-inference`.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking; es un modelo exclusivamente de embeddings.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar fragmentos de documentación y recuperar los más relevantes para una consulta en lenguaje natural mediante similitud coseno sobre los embeddings generados.
- Motor de preguntas frecuentes: comparar la pregunta del usuario con un banco de preguntas-respuesta previamente embebido y devolver la respuesta más cercana, con umbral de confianza configurable.
- Deduplicación de registros: calcular embeddings de títulos o descripciones y agrupar entradas con similitud superior a un umbral para eliminar duplicados en bases de datos.
- Clasificación de tickets de soporte: entrenar un clasificador ligero (regresión logística, SVM) sobre los embeddings para asignar categorías a tickets entrantes, aprovechando la representación densa del modelo.
- Filtrado de contenido y moderación: comparar mensajes con embeddings de referencia de contenido permitido o prohibido para detectar proximidad semántica.
- Sistemas de recomendación basados en contenido: embeber descripciones de productos o artículos y recuperar los más similares a un ítem de referencia para sugerencias.
- Evaluación de similitud entre pares de frases: en tareas de paráfrasis o control de calidad de traducciones, comparando la similitud coseno entre original y candidato.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| STS | MTEB AFQMC (validation) | cos_sim_pearson | 37,86 |
| STS | MTEB AFQMC (validation) | cos_sim_spearman | 38,99 |
| STS | MTEB ATEC (test) | cos_sim_pearson | 43,34 |
| STS | MTEB ATEC (test) | cos_sim_spearman | 42,84 |
| Classification | AmazonCounterfactualClassification (en) | accuracy | 78,69 |
| Classification | AmazonCounterfactualClassification (de) | accuracy | 74,05 |
| Classification | AmazonCounterfactualClassification (en-ext) | accuracy | 77,93 |
| Classification | AmazonCounterfactualClassification (ja) | accuracy | 77,22 |
| Classification | AmazonPolarityClassification | accuracy | 95,91 |
| Classification | AmazonReviewsClassification (en) | accuracy | 55,79 |
| Classification | AmazonReviewsClassification (de) | accuracy | 53,26 |
| Classification | AmazonReviewsClassification (es) | accuracy | 50,33 |
| Classification | AmazonReviewsClassification (fr) | accuracy | 49,30 |
| Classification | AmazonReviewsClassification (ja) | accuracy | 48,69 |
| Classification | AmazonReviewsClassification (zh) | accuracy | 46,24 |
| Retrieval | ArguAna | map_at_10 | 53,08 |
| Retrieval | ArguAna | ndcg_at_10 | 61,88 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de generación, lo cual es coherente con la naturaleza del modelo (embeddings, no generación).

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 14,2 GB solo para los pesos, más overhead de activaciones y tokenizador; se recomienda al menos 16-20 GB de VRAM para lotes pequeños.
- En cuantización de 8 bits: en torno a 7-8 GB de VRAM; en 4 bits: en torno a 4-5 GB, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para producción con lotes grandes; RTX 4090 (24 GB) para FP16 con lotes moderados; RTX 3090 (24 GB) como alternativa.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con FP16 y lotes pequeños; en GPUs de 8-12 GB requeriría cuantización no oficial.
- Opciones de despliegue: `sentence-transformers`, `transformers`, `text-embeddings-inference` (declarado compatible), y potencialmente vLLM o TGI si se adapta la interfaz de pooling; `llama.cpp`/Ollama no tienen pesos GGUF publicados.
- Latencia y throughput: no disponibles; dependen del hardware y del tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| finvector/mistral_qlora_finmodern_tri_merged | 7,1B | no disponible | MIT | Hugging Face | Embeddings; benchmarks MTEB declarados |
| intfloat/e5-mistral-7b-instruct | 7,1B | 4.096 tokens (según documentación pública del modelo base) | MIT | Hugging Face | Referencia en embeddings de 7B; usado como nombre en el model-index de este repo |
| BAAI/bge-large-en-v1.5 | 335M | 512 tokens | MIT | Hugging Face | Embeddings ligeros, menor coste computacional |
| sentence-transformers/all-MiniLM-L6-v2 | 22M | 256 tokens | Apache 2.0 | Hugging Face | Embeddings muy ligeros para producción de bajo coste |

La comparación con E5-Mistral-7B-instruct es especialmente pertinente porque el propio model-index de este repositorio usa ese nombre como identificador, lo que sugiere que el modelo se evaluó o derivó en relación con él. No se dispone de datos de rendimiento del modelo comparado en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Documentación muy escasa: no se especifican datos de entrenamiento, modelo base exacto, metodología de fusión ni hiperparámetros, lo que dificulta la reproducibilidad.
- Resultados de benchmarks declarados como no verificados (`verified: false`); no deben tomarse como cifras contrastadas.
- El modelo está declarado para inglés (`en`), aunque los benchmarks incluyen otros idiomas; el rendimiento multilingüe real no está garantizado.
- Riesgo de sesgos heredados del corpus de entrenamiento no documentado; no se han publicado análisis de sesgo.
- Riesgo de alucinación no aplica directamente al ser un modelo de embeddings, pero sí puede producir representaciones pobres para dominios alejados de su distribución de entrenamiento.
- Sin descargas ni interacciones registradas en el momento de la consulta, lo que reduce la evidencia de uso en producción.
- Licencia MIT permite uso comercial, pero al ser un modelo derivado de Mistral conviene verificar las obligaciones de la licencia del modelo base original.
- No se publican pesos cuantizados oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware modesto.
- Longitud de contexto no documentada; secuencias largas podrían truncarse sin aviso.

## Enlaces

- Hugging Face: https://huggingface.co/finvector/mistral_qlora_finmodern_tri_merged
- Paper de referencia citado en los tags (arXiv:2401.00368): no disponible en la información proporcionada
- Paper de referencia citado en los tags (arXiv:2104.08663): no disponible en la información proporcionada
- Paper de referencia citado en los tags (arXiv:2210.07316): no disponible en la información proporcionada
- Paper de referencia citado en los tags (arXiv:2212.03533): no disponible en la información proporcionada
