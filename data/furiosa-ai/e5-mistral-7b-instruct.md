# furiosa-ai/e5-mistral-7b-instruct

## Resumen

e5-mistral-7b-instruct es un modelo de embeddings densos basado en la arquitectura Mistral-7B-v0.1, fine-tuneado para representación de texto mediante la metodología E5 (contrastive pre-training con supervisión débil e instrucciones). Esta versión concreta es un fork publicado por furiosa-ai del modelo original de intfloat, orientado a tareas de similitud semántica, recuperación de información, clasificación y pipelines de RAG. El modelo genera embeddings de 4096 dimensiones y soporta una ventana de contexto de 4096 tokens.

Con 7.110.660.096 parámetros (~7,11B), se sitúa en la gama alta de los modelos de embeddings de código abierto, superando en capacidad a alternativas como bge-m3 o e5-large. Su licencia MIT permite uso comercial sin restricciones, y su compatibilidad con text-embeddings-inference y HuggingFace Inference Endpoints facilita el despliegue en producción. Aunque está etiquetado principalmente para inglés, los benchmarks de MTEB muestran resultados en alemán, español, francés, japonés y chino, lo que indica cierta capacidad multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-7B-v0.1) fine-tuneado para embeddings |
| Parametros totales | 7.110.660.096 (~7,11B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | FP16, INT8, INT4 (no documentado oficialmente, pero compatible con cuantizacion estandar) |
| Idiomas soportados | Ingles (principal), con resultados en aleman, espanol, frances, japones y chino |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Mistral-7B-v0.1, un transformer decoder-only de 32 capas con attention de ventana deslizante (sliding window attention) y grouped-query attention. Sobre esta base, se aplica el enfoque de entrenamiento E5: primero un pre-entrenamiento contrastivo con datos débilmente supervisados (pares de texto generados automáticamente) y posteriormente un fine-tuning con instrucciones para alinear las representaciones con tareas específicas. El resultado es un modelo que produce embeddings de 4096 dimensiones a partir de la última capa oculta, normalizados para su uso en búsqueda por similitud coseno.

Los detalles exactos del dataset de entrenamiento (número de tokens, composición) no están disponibles en la información publicada. El modelo se distribuye a través de la librería sentence-transformers, lo que simplifica su integración en pipelines de embeddings. Los tags de arXiv referencian los trabajos de E5 (2401.00368), Sentence-BERT (2104.08663) y los fundamentos de Mistral, aunque no se especifica qué proporción de cada técnica se aplicó.

## Capacidades

- Generación de embeddings densos de 4096 dimensiones para representación semántica de texto.
- Similitud semántica entre pares de frases o documentos mediante similitud coseno.
- Recuperación de información (retrieval) con soporte para búsqueda por similitud en colecciones grandes.
- Clasificación de texto mediante embeddings como características de entrada a clasificadores lineales o redes simples.
- Soporte de instrucciones (instruction-based prompts): el modelo acepta prefijos de instrucción para adaptar la representación a la tarea.
- Capacidades multilingües limitadas: aunque el idioma principal es inglés, los benchmarks muestran resultados en alemán, español, francés, japonés y chino.
- Compatible con pipelines de RAG (retrieval-augmented generation) como componente de recuperación.
- No es un modelo generativo: no produce texto, solo representaciones vectoriales.

## Casos de uso

- Recuperación aumentada por generación (RAG): el modelo indexa documentos en una base vectorial y recupera los fragmentos más relevantes para alimentar a un LLM generativo. Su contexto de 4096 tokens permite procesar párrafos completos, y la calidad de los embeddings mejora la precisión de la recuperación frente a modelos más pequeños.
- Búsqueda semántica en bases de conocimiento: sustituye búsquedas por palabras clave con búsqueda por significado, útil en intranets corporativas, documentación técnica o archivos legales. Los embeddings de 4096 dimensiones capturan matices semánticos que los métodos TF-IDF o BM25 no detectan.
- Clasificación de documentos y tickets de soporte: los embeddings se usan como características de entrada a un clasificador (por ejemplo, regresión logística o un MLP) para categorizar incidencias, correos o artículos. El fine-tuning con instrucciones mejora la separación entre categorías.
- Detección de duplicados y near-duplicates: compara embeddings de documentos para identificar contenido duplicado o casi idéntico, útil en gestión de contenidos, detección de plagio o limpieza de datasets.
- Clustering de textos: agrupa documentos por similitud semántica para organizar grandes colecciones, detectar temas emergentes o segmentar opiniones de clientes. La dimensión de 4096 permite una separación fina entre clusters.
- Sistemas de recomendación basados en contenido: representa ítems (artículos, productos, vídeos) como embeddings y recomienda elementos similares al que el usuario consume. La calidad de las representaciones mejora la relevancia de las recomendaciones frente a modelos de menor capacidad.
- Moderación de contenido: clasifica comentarios o publicaciones en categorías de riesgo (spam, toxicidad, off-topic) usando los embeddings como entrada a un clasificador entrenado.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (MTEB). Se muestran las métricas principales por tarea:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| STS | C-MTEB/AFQMC | cos_sim_spearman | 38,99 |
| STS | C-MTEB/ATEC | cos_sim_spearman | 42,84 |
| Clasificacion | AmazonCounterfactual (en) | accuracy | 78,69 |
| Clasificacion | AmazonCounterfactual (de) | accuracy | 74,05 |
| Clasificacion | AmazonPolarity | accuracy | 95,91 |
| Clasificacion | AmazonReviews (en) | accuracy | 55,79 |
| Clasificacion | AmazonReviews (es) | accuracy | 50,33 |
| Clasificacion | AmazonReviews (zh) | accuracy | 46,24 |
| Recuperacion | ArguAna | ndcg_at_10 | 61,88 |
| Recuperacion | ArguAna | mrr_at_10 | 53,34 |

No se han publicado comparativas con otros modelos en la información disponible. Los resultados de clasificación multilingüe muestran una degradación progresiva fuera del inglés, coherente con el entrenamiento centrado en este idioma.

## Requisitos de hardware

- VRAM estimada para inferencia: ~14,2 GB en FP16, ~7,1 GB en INT8, ~3,6 GB en INT4 (cálculo basado en 7,11B parámetros).
- GPU recomendadas: A100 40GB, H100 80GB, RTX 4090 24GB, RTX 3090 24GB para FP16 sin cuantización.
- Consumer GPU: RTX 4090 (24GB) puede ejecutar el modelo en FP16; RTX 3060 12GB o RTX 4060 Ti 16GB pueden ejecutarlo en INT8; GPUs con 8GB o menos requieren INT4.
- Opciones de despliegue: text-embeddings-inference (compatible según tags), sentence-transformers, HuggingFace Inference Endpoints (endpoints_compatible), y cualquier servidor que soporte safetensors con transformers.
- Latencia y throughput: no disponible en la información publicada. Como referencia, un modelo de 7B en FP16 en una A100 procesa del orden de cientos de secuencias por segundo en tareas de embedding, pero este dato no está verificado para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension embedding | Licencia | Notas |
|---|---|---|---|---|---|
| furiosa-ai/e5-mistral-7b-instruct | 7,11B | 4096 | 4096 | MIT | Fork del modelo de intfloat |
| intfloat/e5-mistral-7b-instruct | 7,11B | 4096 | 4096 | MIT | Modelo original, misma arquitectura y pesos |
| BAAI/bge-m3 | ~568M | 8192 | 1024 | MIT | Mucho más ligero, contexto doble, multilingüe |
| intfloat/multilingual-e5-large | ~560M | 512 | 1024 | MIT | Más pequeño, multilingüe, contexto limitado |

La comparativa con bge-m3 y e5-large se basa en datos públicos de sus respectivas fichas; no se dispone de benchmarks comparativos directos con este modelo en la información proporcionada. La ventaja principal de e5-mistral-7b-instruct es la mayor capacidad de representación (4096 dimensiones) y la calidad de embeddings para inglés, a costa de un coste computacional significativamente mayor.

## Limitaciones y advertencias

- Sesgo hacia el inglés: los resultados de clasificación en otros idiomas (español, francés, japonés, chino) son notablemente inferiores a los de inglés, lo que limita su uso en entornos multilingües exigentes.
- Sin capacidad generativa: es un modelo de embeddings puro; no puede generar texto, responder preguntas ni mantener conversaciones.
- Contexto limitado a 4096 tokens: documentos más largos deben truncarse o dividirse en fragmentos, lo que puede perder información relevante.
- Riesgo de alucinación no aplica directamente (no genera texto), pero los embeddings pueden producir falsos positivos en búsquedas de similitud si los textos son superficialmente parecidos pero semánticamente distintos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que es un fork reciente sin validación comunitaria. Se recomienda verificar los pesos frente al modelo original de intfloat antes de usarlo en producción.
- La fecha de creación (2026-08-31) es posterior a la del modelo original, lo que indica que es una re-publicación; no hay evidencia de que furiosa-ai haya modificado los pesos o el entrenamiento.
- No se dispone de información sobre el dataset de entrenamiento específico, el número de tokens procesados ni el proceso de alineación (RLHF/DPO), lo que dificulta evaluar su robustez en dominios especializados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/furiosa-ai/e5-mistral-7b-instruct
- Modelo original (intfloat): https://huggingface.co/intfloat/e5-mistral-7b-instruct
- Ficha en OpenModelMap: https://openmodelmap.com/model/intfloat/e5-mistral-7b-instruct
- Ficha en cortecs.ai: https://cortecs.ai/detailedServerlessView/e5-mistral-7b-instruct
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/e5-mistral-7b-instruct-intfloat
- Paper E5 (arXiv 2401.00368): https://arxiv.org/abs/2401.00368
- Paper Sentence-BERT (arXiv 2104.08663): https://arxiv.org/abs/2104.08663
- Paper E5 original (arXiv 2212.03533): https://arxiv.org/abs/2212.03533
