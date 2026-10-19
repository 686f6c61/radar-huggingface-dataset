# AutoPIL-Inc/Mirador-Embed

## Resumen

Mirador-Embed es un modelo de embeddings de frases (sentence embeddings) publicado por AutoPIL-Inc en HuggingFace. Se trata de un fine-tune de `sentence-transformers/all-MiniLM-L6-v2`, un encoder BERT compacto de la familia MiniLM, entrenado con la librería sentence-transformers y la función de pérdida `MultipleNegativesRankingLoss` sobre un conjunto de 3.747 ejemplos. Su pipeline declarado es `sentence-similarity` y también expone la tarea `feature-extraction`, por lo que su uso previsto es generar vectores densos para similitud semántica, búsqueda y clustering, no la generación de texto.

El modelo llega con very poca documentación: la model card no incluye licencia, idiomas soportados, composición del dataset ni resultados de evaluación. Los tags indican que se generó con el `Trainer` de HuggingFace (`generated_from_trainer`) y que es compatible con Text Embeddings Inference y con endpoints de inferencia, lo que sugiere un enfoque de despliegue como servicio de embeddings.

Su relevancia es limitada y hay que enmarcarla con honestidad: con 0 descargas y 0 likes en el momento de la consulta, y sin métricas publicadas, es un artefacto experimental de una organización centrada en gobernanza de agentes de IA (AutoPIL), no un modelo validado para producción. Resulta útil como ejemplo de fine-tune ligero de MiniLM para dominios concretos, pero cualquier adopción debería ir precedida de una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM-L6, 6 capas, 384 dimensiones ocultas, 12 cabezas de atención); heredada del modelo base |
| Parametros totales | 22,7 M (cifra del modelo base `all-MiniLM-L6-v2`; no se explicita en la model card) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 256 tokens (valor del modelo base; no confirmado en la model card de este fine-tune) |
| Tipos de cuantizacion | Pesos publicados en safetensors (fp32); no se documentan variantes GGUF, ONNX ni int8 oficiales |
| Idiomas soportados | no disponibles (el modelo base está entrenado predominantemente en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimension del embedding | 384 (heredada del modelo base) |
| Funcion de perdida | MultipleNegativesRankingLoss |
| Tamano del dataset de entrenamiento | 3.747 ejemplos |
| Pipeline | sentence-similarity, feature-extraction |
| Compatibilidad de despliegue | text-embeddings-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un encoder MiniLM de 6 capas con 384 dimensiones ocultas y 22,7 millones de parámetros, destilado originalmente por Microsoft y adaptado a embeddings de frases por sentence-transformers. MiniLM aplica destilación de la auto-atención de un transformer mayor, lo que da un encoder muy ligero y rápido en CPU. El fine-tune no introduce cambios estructurales: se reutiliza la cabeza de pooling del modelo base y se reentrena con `MultipleNegativesRankingLoss`, una variante de la pérdida InfoNCE (véase el paper de Contrastive Predictive Coding, arXiv:1807.03748) en la que los negativos de cada batch se usan como negativos en memoria para el resto de pares positivos. Es la formulación estándar descrita en Sentence-BERT (arXiv:1908.10084).

Los únicos datos de entrenamiento disponibles son el tamaño del conjunto (3.747 ejemplos) y la función de pérdida. No se especifican el número de épocas, la tasa de aprendizaje, el tamaño de batch, la composición del corpus, si se usaron negativos duros, ni si hubo etapas de destilación o evaluación intermedia. Se desconoce igualmente el dominio de los pares (¿preguntas-respuestas, titulares, descripciones de producto?) y su procedencia. El tag `generated_from_trainer` confirma que el artefacto se produjo con el `Trainer` estándar de HuggingFace, sin infraestructura de entrenamiento declarada. Con 3.747 ejemplos, el riesgo de sobreajuste y de olvido catastrófico respecto al modelo base es alto y no puede descartarse sin una evaluación externa.

## Capacidades

- Generación de embeddings densos de frases y pasajes: devuelve un vector de 384 dimensiones por entrada, adecuado para similitud coseno o producto escalar.
- Similitud semántica entre pares de textos (`sentence-similarity`), incluyendo paráfrasis, duplicados y reformulaciones.
- Extracción de características (`feature-extraction`): acceso a los estados ocultos del encoder para tareas posteriores.
- Búsqueda semántica y recuperación densa: indexación de vectores en bases como FAISS, Qdrant, Milvus o pgvector.
- Clustering y agrupamiento no supervisado de textos por proximidad en el espacio de embeddings.
- Clasificación ligera mediante kNN sobre embeddings o prototipos de clase, sin reentrenamiento.
- Despliegue como servicio de embeddings vía Text Embeddings Inference (TEI) y endpoints compatibles.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso ni comportamiento agente: es un encoder, no un modelo generativo.
- No dispone de modo de razonamiento (thinking), visión, audio ni multimodalidad.
- Cobertura multilingüe: no declarada; el modelo base es mayoritariamente anglófono, por lo que el rendimiento en castellano es incierto y previsiblemente inferior al de modelos multilingües específicos.

## Casos de uso

- Búsqueda semántica en documentación interna: indexar fragmentos de manuales o wikis corporativas con el modelo y recuperar los más próximos a la consulta del usuario mediante similitud coseno. El tamaño reducido (22,7 M de parámetros) permite reindexar corpus de decenas de miles de fragmentos en CPU en minutos.
- Deduplicación de registros y detección de near-duplicates: calcular embeddings de títulos, descripciones o tickets y marcar como duplicados los pares por encima de un umbral de similitud. Es un uso típico de `MultipleNegativesRankingLoss`, que optimiza precisamente la separación entre pares positivos y negativos.
- Clustering de tickets de soporte o feedback de usuarios: agrupar quejas por temática sin etiquetas previas usando k-means o HDBSCAN sobre los vectores de 384 dimensiones, para priorizar áreas de producto.
- Recuperación aumentada (RAG) en entornos con recursos limitados: usar Mirador-Embed como retriever en un pipeline RAG que corra íntegramente en CPU o en una GPU de gama baja, delegando la generación a un LLM aparte. Solo es viable si los fragmentos caben en la ventana de 256 tokens, lo que obliga a chunking agresivo.
- Filtrado y moderación por similitud: comparar mensajes entrantes contra un conjunto de ejemplos de referencia (spam, abuso, contenido no permitido) y activar reglas cuando la similitud supera un umbral. Requiere calibrar el umbral con datos propios por la ausencia de métricas publicadas.
- Recomendación de contenido relacionado: calcular la similitud entre el ítem consultado y el catálogo para generar listas de "artículos similares" o "preguntas relacionadas" con latencia de milisegundos.
- Evaluación de regresiones en sistemas de NLP: usar los embeddings como señal para detectar cambios de comportamiento entre versiones de un corpus o de un pipeline de preprocesado.
- Prototipado rápido de clasificadores few-shot: construir un clasificador kNN con unas pocas frases etiquetadas por clase antes de invertir en un modelo supervisado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones en MTEB, STS Benchmark ni ningún otro conjunto, y no se aportan comparaciones con el modelo base. El modelo base `all-MiniLM-L6-v2` sí cuenta con resultados públicos en el ecosistema MTEB, pero no se dispone de ellos en la información proporcionada ni de una medición del efecto del fine-tune sobre esos valores. Cualquier cifra de rendimiento para este modelo concreto requeriría una evaluación propia sobre el dominio de interés.

## Requisitos de hardware

- VRAM estimada: aproximadamente 91 MB para los pesos en fp32 (22,7 M de parámetros × 4 bytes), más el overhead de activaciones, que en lotes pequeños es de decenas de MB. En la práctica, menos de 1 GB de VRAM en cualquier configuración razonable.
- GPU recomendadas: el modelo está sobredimensionado para cualquier GPU moderna. Una T4, L4 o incluso una GTX 1650 son suficientes; A100, H100 y RTX 4090 quedan infrautilizadas y solo tienen sentido si se comparten con otros procesos o se busca throughput masivo por batching.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1 GB de VRAM (GTX 1050 en adelante). También es viable en CPU pura, que es probablemente el objetivo real de un MiniLM.
- Opciones de despliegue: sentence-transformers (nativo), Text Embeddings Inference (TEI), HuggingFace Inference Endpoints (el tag `endpoints_compatible` lo indica), ONNX Runtime o FastEmbed para inferencia optimizada en CPU, y servidores de vectores con encoder integrado. llama.cpp no es la vía recomendada para un encoder BERT de este tipo.
- Latencia y throughput: no se publican cifras. Como referencia orientativa del orden de magnitud para un MiniLM de 6 capas, cabría esperar decenas a cientos de frases por segundo en CPU multinúcleo y miles por segundo en GPU con batching; son estimaciones, no mediciones de este modelo.
- Memoria en disco: el repositorio completo en safetensors ronda los 90 MB.

## Comparativa con modelos similares

Los datos de las alternativas provienen de su documentación pública; los de Mirador-Embed, del modelo base cuando la model card no los detalla.

| Modelo | Parametros | Dimension | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AutoPIL-Inc/Mirador-Embed | 22,7 M | 384 | 256 tokens | no disponible | no disponible | HuggingFace, 0 descargas |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 384 | 256 tokens | inglés | Apache 2.0 | HuggingFace, ampliamente adoptado |
| BAAI/bge-small-en-v1.5 | 33 M | 384 | 512 tokens | inglés | MIT | HuggingFace, muy usado en RAG |
| intfloat/e5-small-v2 | 33 M | 384 | 512 tokens | inglés | MIT | HuggingFace, requiere prefijos `query:`/`passage:` |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | 118 M | 384 | 128 tokens | más de 50 idiomas | Apache 2.0 | HuggingFace, referencia multilingüe |

Frente al modelo base, Mirador-Embed no aporta ninguna ventaja documentada: mismo tamano, misma dimension, mismo contexto y ninguna métrica que demuestre una mejora. Frente a `bge-small-en-v1.5` y `e5-small-v2` pierde en longitud de contexto (256 frente a 512 tokens) y en garantías de licencia. Solo tendría sentido si el fine-tune se ha hecho sobre un dominio muy específico de AutoPIL, extremo que la model card no confirma.

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir uso comercial sin contactar con el autor. Aunque el modelo base es Apache 2.0, el fine-tune no declara términos propios y la ausencia de licencia es un bloqueo para producción.
- Idiomas no declarados: el modelo base es predominantemente inglés, por lo que el rendimiento en castellano u otras lenguas no está garantizado y probablemente sea pobre. No usar como encoder multilingüe sin evaluación previa.
- Ventana de contexto de 256 tokens: los documentos largos deben trocearse, lo que puede fragmentar el significado y degradar la recuperación en pasajes de más de dos o tres frases.
- Dataset de entrenamiento muy pequeno (3.747 ejemplos): riesgo alto de sobreajuste y de degradación de la generalización respecto al modelo base. No hay evaluación que descarte olvido catastrófico.
- Cero validación comunitaria: 0 descargas y 0 likes en el momento del registro, creado y actualizado el mismo día (2026-10-18). No hay evidencia de uso real ni informes de terceros.
- Model card incompleta: sin descripción del dataset, sin hiperparámetros, sin análisis de sesgos y sin métricas. Imposible auditar el proceso de entrenamiento.
- Riesgo de alucinación no aplicable en sentido estricto (no genera texto), pero sí de falsos positivos en similitud: umbrales mal calibrados producen duplicados o recuperaciones incorrectas.
- Sesgos desconocidos: al no documentarse la procedencia de los pares de entrenamiento, no se puede evaluar el sesgo demográfico, geográfico o temático del espacio de embeddings resultante.
- Sin soporte de instrucciones ni de formato de chat: no es un modelo generativo, por lo que no admite prompts de tarea ni tool calling.
- En producción, conviene fijar la versión por hash de commit: el repositorio puede actualizarse sin versionado semántico y no hay changelog.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutoPIL-Inc/Mirador-Embed
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Organización AutoPIL-Inc en HuggingFace: https://huggingface.co/AutoPIL-Inc
- Dataset de la organización (posible relación con el entrenamiento, no confirmada): https://huggingface.co/datasets/AutoPIL-Inc/Mirador_Trail2_v25b
- Paper Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper Contrastive Predictive Coding, base de InfoNCE (arXiv:1807.03748): https://arxiv.org/abs/1807.03748
- Documentación de MultipleNegativesRankingLoss: https://sbert.net/docs/package_reference/losses.html#multiplenegativesrankingloss
- Text Embeddings Inference (TEI): https://github.com/huggingface/text-embeddings-inference
- Sitio corporativo de AutoPIL: https://www.autopil.ai/
- Funcionalidades de AutoPIL: https://www.autopil.ai/features
- Mirador AI Observability: https://mirador.org/ai
