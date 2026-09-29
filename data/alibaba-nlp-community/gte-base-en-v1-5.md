# alibaba-nlp-community/gte-base-en-v1.5

## Resumen

gte-base-en-v1.5 es un modelo de embeddings de texto publicado en el espacio de HuggingFace `alibaba-nlp-community`, con pipeline `sentence-similarity`. Convierte frases, párrafos y documentos en vectores densos comparables mediante similitud coseno, y pertenece a la familia GTE (General Text Embeddings), cuyos dos trabajos de referencia (arXiv 2308.03281 y 2407.19669) aparecen citados en las etiquetas y en la model card del repositorio. El checkpoint tiene 136.776.192 parámetros reales (unos 137 M, según los pesos safetensors) y se distribuye con licencia Apache 2.0.

El modelo resuelve tareas de representación semántica: recuperación de información, búsqueda semántica, agrupamiento, clasificación por embeddings y reranking. Su relevancia práctica está en su tamaño contenido (apto para CPU y GPUs de consumo) y en su compatibilidad declarada con `transformers.js` y con endpoints de HuggingFace, lo que permite desplegarlo tanto en servidores como en el navegador.

Se trata, en todo caso, de un codificador de embeddings y no de un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso, y está entrenado únicamente para inglés. Los metadatos del repositorio indican 0 descargas y 0 likes en el momento de la consulta, y una fecha de creación de 2026-09-28, por lo que conviene verificar la procedencia y el estado de mantenimiento del espacio antes de adoptarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder orientado a embeddings de frases (los detalles de capas, dimensión oculta y cabezas de atención no están disponibles en la información proporcionada) |
| Parámetros totales | 136.776.192 (aproximadamente 137 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Dimensión del embedding | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | No se documentan cuantizaciones oficiales. El repositorio incluye pesos en safetensors y una exportación ONNX; no hay GGUF, AWQ, GPTQ ni bitsandbytes publicados |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX |
| Tarea (pipeline) | sentence-similarity |
| Tamaño del repositorio | 2,0 GB |
| Autor / espacio | alibaba-nlp-community |

## Arquitectura y entrenamiento

La model card identifica el modelo como un codificador de frases de la familia GTE y lo publica con `library_name: transformers`, además de artefactos ONNX y compatibilidad con `sentence-transformers` y `transformers.js`. La información disponible no especifica el número de capas, la dimensión oculta, el número de cabezas de atención ni la función de pooling utilizada para obtener el vector final, por lo que estos datos deben considerarse no disponibles.

Tampoco se detalla la composición del dataset de entrenamiento, el número de tokens vistos, ni si hubo fases de ajuste con datos supervisados (RLHF, DPO u otras). La model card se limita a referenciar dos identificadores de arXiv: 2308.03281 y 2407.19669. Cualquier afirmación sobre la metodología de entrenamiento (por ejemplo, aprendizaje contrastivo multi-etapa) requeriría consultar esas publicaciones, que no forman parte de la información proporcionada en esta ficha.

## Capacidades

- Generación de embeddings densos de frases y documentos para similitud semántica y búsqueda vectorial.
- Recuperación de información (retrieval) mediante comparación de embeddings de consulta y documentos.
- Agrupamiento (clustering) de textos por similitud semántica.
- Clasificación de textos usando los embeddings como características de entrada (por ejemplo, con una regresión logística sobre ellos).
- Reranking de candidatos recuperados en una primera fase.
- Medición de similitud semántica entre pares de frases (STS).
- Ejecución en navegador y en Node mediante `transformers.js`, según las etiquetas del repositorio.
- Compatibilidad declarada con endpoints de HuggingFace (`endpoints_compatible`).
- Idiomas: únicamente inglés. No hay capacidades multilingües declaradas.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio, modo "thinking" ni generación de texto: es un modelo de representación, no un modelo generativo.

## Casos de uso

- Recuperación aumentada por generación (RAG): indexar la base documental con este modelo y recuperar los fragmentos más similares a la consulta del usuario antes de pasarlos a un LLM generativo. Es adecuado porque genera vectores comparables con similitud coseno y cabe en memoria en CPU.
- Búsqueda semántica interna: buscador de documentación técnica, tickets o bases de conocimiento donde el usuario escribe en lenguaje natural y no coincide con las palabras exactas del documento.
- Deduplicación de contenidos: calcular embeddings de un corpus y agrupar los pares con similitud muy alta para eliminar duplicados en pipelines de datos, con umbral ajustable según el dominio.
- Clasificación de textos con pocos datos: entrenar un clasificador ligero (regresión logística, SVM) sobre los embeddings congelados en lugar de ajustar un modelo grande, útil para moderación, enrutado de tickets o etiquetado temático.
- Reranking en dos fases: recuperación inicial amplia (por ejemplo, BM25) y reordenación de los 50-100 mejores candidatos con este modelo mediante similitud consulta-documento.
- Agrupamiento y análisis exploratorio de corpus: agrupar miles de reseñas, artículos o informes en temas latentes antes de un análisis cualitativo, usando los embeddings con HDBSCAN o k-means.
- Recomendación por contenido: representar ítems y perfiles de usuario en el mismo espacio vectorial para recomendar elementos semánticamente próximos al historial.
- Detección de anomalías y desviaciones: identificar textos cuyo embedding se aleja del centroide de su clúster como posible error de etiquetado o contenido fuera de dominio.
- Ejecución en el cliente: búsqueda semántica en el navegador con `transformers.js` sobre colecciones pequeñas, sin enviar datos a un servidor.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card. Todos figuran con `verified: false`, es decir, no han sido verificados de forma independiente en la información proporcionada. La lista original está truncada en el punto correspondiente a CQADupstackAndroidRetrieval, por lo que pueden faltar tareas adicionales.

| Tarea y dataset | Métrica | Valor (sobre 100) |
|---|---|---|
| Clasificación - MTEB AmazonCounterfactualClassification (en) | Accuracy | 74,79 |
| Clasificación - MTEB AmazonCounterfactualClassification (en) | F1 | 68,51 |
| Clasificación - MTEB AmazonCounterfactualClassification (en) | AP | 37,05 |
| Clasificación - MTEB AmazonPolarityClassification | Accuracy | 93,02 |
| Clasificación - MTEB AmazonPolarityClassification | F1 | 93,00 |
| Clasificación - MTEB AmazonPolarityClassification | AP | 89,18 |
| Clasificación - MTEB AmazonReviewsClassification (en) | Accuracy | 53,31 |
| Clasificación - MTEB AmazonReviewsClassification (en) | F1 | 52,98 |
| Clasificación - MTEB Banking77Classification | Accuracy | 86,73 |
| Clasificación - MTEB Banking77Classification | F1 | 86,70 |
| Retrieval - MTEB ArguAna | nDCG@10 | 63,49 |
| Retrieval - MTEB ArguAna | MAP@10 | 54,85 |
| Retrieval - MTEB ArguAna | MRR@10 | 55,15 |
| Retrieval - MTEB ArguAna | Recall@10 | 90,75 |
| Retrieval - MTEB ArguAna | Precision@10 | 9,08 |
| Retrieval - MTEB CQADupstackAndroidRetrieval | MAP@10 | 41,27 |
| Retrieval - MTEB CQADupstackAndroidRetrieval | MRR@10 | 46,90 |
| Clustering - MTEB ArxivClusteringP2P | V-measure | 47,51 |
| Clustering - MTEB ArxivClusteringS2S | V-measure | 42,05 |
| Clustering - MTEB BiorxivClusteringP2P | V-measure | 40,32 |
| Clustering - MTEB BiorxivClusteringS2S | V-measure | 37,55 |
| Reranking - MTEB AskUbuntuDupQuestions | MAP | 61,83 |
| Reranking - MTEB AskUbuntuDupQuestions | MRR | 74,37 |
| STS - MTEB BIOSSES | Pearson (cos_sim) | 85,04 |
| STS - MTEB BIOSSES | Spearman (cos_sim) | 83,65 |
| STS - MTEB BIOSSES | Spearman (euclidean) | 83,63 |

No se han proporcionado resultados de benchmarks comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable porque el modelo no es generativo.

## Requisitos de hardware

- Huella de memoria de los pesos: aproximadamente 547 MB en FP32 (136.776.192 × 4 bytes), unos 274 MB en FP16 y unos 137 MB en INT8.
- VRAM estimada para inferencia: por debajo de 1 GB con pesos en FP16 si se procesan lotes pequeños; entre 1 y 2 GB si se incluyen activaciones, tokenizador y lotes de tamaño moderado.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 3060, RTX 4060 y superiores. Modelos de datacenter como A100 o H100 solo tendrían sentido para indexado masivo por su mayor ancho de banda de memoria, no por requisitos de capacidad.
- CPU: la inferencia es viable en CPU para volúmenes moderados, dado el tamaño del modelo (137 M de parámetros).
- GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo actual. El cuello de botella realista en producción no es el modelo, sino el índice vectorial (FAISS, Qdrant, Milvus, pgvector) y su consumo de RAM o VRAM.
- Opciones de despliegue confirmadas por las etiquetas del repositorio: `transformers`, `sentence-transformers`, ONNX Runtime (artefactos ONNX incluidos), `transformers.js` y endpoints de HuggingFace. Otros servidores (TEI, vLLM, Ollama, llama.cpp) no están confirmados en la información disponible; en particular, no se publican pesos GGUF, por lo que llama.cpp y Ollama requerirían una conversión previa.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia ni de embeddings por segundo en la información proporcionada.

## Comparativa con modelos similares

Alternativas habituales en la misma categoría (encoder de embeddings en inglés, tamaño base): BAAI/bge-base-en-v1.5, intfloat/e5-base-v2 y thenlper/gte-base (versión 1.0 de la misma familia). No se dispone de datos comparativos de parámetros, contexto, rendimiento MTEB ni licencia para estos modelos en la información proporcionada, por lo que la comparación cuantitativa no puede completarse.

| Modelo | Parámetros | Longitud de contexto | Rendimiento MTEB | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alibaba-nlp-community/gte-base-en-v1.5 | 136.776.192 | no disponible | Valores parciales en la sección de benchmarks (no verificados) | Apache 2.0 | HuggingFace, safetensors y ONNX |
| BAAI/bge-base-en-v1.5 | no disponible | no disponible | no disponible | no disponible | no disponible |
| intfloat/e5-base-v2 | no disponible | no disponible | no disponible | no disponible | no disponible |
| thenlper/gte-base | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo monolingüe: solo inglés. No debe esperarse un rendimiento fiable en castellano ni en otros idiomas sin un ajuste previo o el uso de una variante multilingüe.
- No es un modelo generativo: no produce texto, no responde preguntas por sí mismo ni soporta tool calling, function calling o flujos de agente.
- Longitud de contexto desconocida: al no documentarse la ventana máxima, los textos largos podrían truncarse de forma silenciosa. Es imprescindible verificar el límite efectivo antes de indexar documentos extensos.
- Riesgo de recuperación irrelevante: los embeddings pueden producir similitudes altas entre textos superficialmente parecidos pero semánticamente distintos; conviene combinar la búsqueda vectorial con filtros léxicos o metadatos y evaluar el umbral en el dominio concreto.
- Sesgos: no se documenta ninguna evaluación de sesgos, equidad o toxicidad en la información disponible. Al estar entrenado previsiblemente sobre corpus web en inglés, puede reproducir sesgos presentes en esos datos.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indiquen los cambios. No obstante, la licencia del modelo no cubre los derechos sobre los datos de entrenamiento, que no se detallan.
- Procedencia del repositorio: el espacio `alibaba-nlp-community` no es el espacio oficial `Alibaba-NLP` y el repositorio presenta 0 descargas y 0 likes, con fecha de creación 2026-09-28. Conviene contrastar los pesos con la publicación oficial antes de usarlos en producción.
- Resultados de benchmarks sin verificar: todas las métricas del `model-index` figuran con `verified: false` y la lista aparece truncada, por lo que no deben tomarse como una evaluación completa o auditada.
- Cifras de rendimiento y latencia ausentes: no hay datos publicados de throughput ni de comportamiento bajo carga, lo que obliga a realizar pruebas propias de capacidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alibaba-nlp-community/gte-base-en-v1.5
- Publicación arXiv 2308.03281 (referenciada en las etiquetas del modelo): https://arxiv.org/abs/2308.03281
- Publicación arXiv 2407.19669 (referenciada en las etiquetas del modelo): https://arxiv.org/abs/2407.19669
- Ranking MTEB, marco de referencia para modelos de embeddings: https://huggingface.co/spaces/mteb/leaderboard

Nota: la búsqueda web realizada no devolvió enlaces técnicos relevantes sobre este modelo; los resultados obtenidos correspondían a páginas comerciales de Alibaba y no se han incluido por no ser pertinentes.
