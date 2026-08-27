# J0nasW/sciembed-full

## Resumen

SciEmbed-FULL es un modelo de embeddings de documentos científicos desarrollado por Jonas W. (J0nasW) como parte del proyecto SciEmbed, presentado en Findings of EMNLP 2026. Se basa en ModernBERT-base, un transformer encoder de 149 millones de parámetros, y se entrena con supervisión de contexto de citas (citation-context) como señal contrastiva principal. El modelo está diseñado para representar oraciones y párrafos de literatura científica en vectores densos de 768 dimensiones, optimizados para tareas de clasificación, regresión, proximidad y búsqueda semántica.

La relevancia de este modelo radica en su especialización para el dominio científico, donde los embeddings genéricos suelen fallar por la jerga técnica y la estructura retórica de los artículos. Al aprovechar los pares de citas (oración citada y contexto de citación) como señal de entrenamiento, SciEmbed-FULL captura relaciones semánticas finas entre trabajos académicos. Con una ventana de contexto de 512 tokens y soporte para truncamiento Matryoshka (768/512/256/128), ofrece flexibilidad para distintos escenarios de despliegue. Su licencia MIT permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base) |
| Parametros totales | 149.014.272 (149M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (pesos en safetensors, fp32/fp16 según uso) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con sentence-transformers y TEI) |

## Arquitectura y entrenamiento

SciEmbed-FULL hereda la arquitectura de ModernBERT-base, un transformer encoder optimizado para eficiencia con atención bidireccional y mejoras en el preentrenamiento (como la eliminación de capas de normalización redundantes y una mayor velocidad de entrenamiento). El modelo se entrena en dos etapas: primero, una adaptación al dominio científico mediante DAPT (Domain-Adaptive Pre-Training) sobre corpus de documentos científicos; después, un entrenamiento contrastivo sobre un pool de aproximadamente 30 millones de pares de citas (señal A+B), durante una época. La señal contrastiva principal es el par formado por la oración citada y el contexto de citación, lo que enseña al modelo a alinear representaciones de textos que están relacionados por referencias bibliográficas.

El pooling es de tipo mean (media de los tokens de salida) y la dimensión de salida es 768, con capacidad de truncamiento Matryoshka a 512, 256 o 128 dimensiones, lo que permite reducir costes de almacenamiento y cómputo sin reentrenar. Los pesos publicados corresponden a la semilla 123, mientras que el rendimiento reportado en el paper es la media sobre tres semillas. No se han publicado detalles sobre el número total de tokens de entrenamiento ni la composición exacta del dataset más allá del pool de pares de citas.

## Capacidades

- Generación de embeddings semánticos para oraciones y párrafos de documentos científicos, con normalización opcional para similitud coseno.
- Búsqueda semántica y recuperación de información en literatura académica, incluyendo papers, abstracts y secciones de artículos.
- Clasificación de textos científicos (por ejemplo, categorización por área temática o tipo de contribución).
- Regresión sobre propiedades de documentos (por ejemplo, estimación de impacto o relevancia).
- Proximidad entre documentos: identificación de trabajos relacionados o citas recomendadas.
- Truncamiento Matryoshka: permite reducir la dimensión del embedding a 512, 256 o 128 sin pérdida significativa de rendimiento, útil para despliegue en entornos con restricciones de memoria.
- Integración con el ecosistema sentence-transformers y compatible con Text Embeddings Inference (TEI) para servir en producción.

## Casos de uso

- Motor de búsqueda académica: indexar abstracts y textos completos de artículos para permitir búsquedas por similitud semántica, superando las limitaciones de búsqueda por palabras clave. El modelo puede usarse con FAISS o Milvus para recuperar papers relevantes a partir de una consulta en lenguaje natural.
- Recomendación de citas: dado un manuscrito en preparación, generar embeddings de las oraciones y compararlos con un corpus de papers para sugerir referencias relevantes, aprovechando la señal de contexto de citas aprendida durante el entrenamiento.
- Clasificación automática de publicaciones: asignar categorías temáticas (por ejemplo, áreas de la ACM o dominios de arXiv) a nuevos artículos usando los embeddings como características de entrada para un clasificador lineal o una red neuronal.
- Detección de duplicados y plagio: comparar embeddings de documentos para identificar solapamientos o copias parciales en repositorios de preprints, con una ventana de 512 tokens que permite analizar secciones completas.
- Análisis de redes de citas: calcular la proximidad semántica entre pares de papers para construir grafos de similitud, útiles en estudios bibliométricos o para visualizar la evolución de un campo de investigación.
- Asistente de revisión por pares: ayudar a los revisores a encontrar literatura relacionada con un manuscrito bajo revisión, generando embeddings de las secciones clave y recuperando trabajos comparables de bases de datos como Semantic Scholar o PubMed.

## Benchmarks y rendimiento

El modelo reporta resultados en SciRepEval, un benchmark específico para embeddings científicos con cuatro categorías. Los valores corresponden a la media sobre tres semillas (el repositorio incluye los pesos de la semilla 123).

| Categoría | Puntuación |
|---|---|
| Clasificación | 75,6 |
| Regresión | 28,2 |
| Proximidad | 80,9 |
| Búsqueda | 82,7 |
| Overall | 66,85 ± 0,38 |

No se han publicado comparaciones directas con otros modelos de embeddings científicos en la información disponible. El paper de EMNLP 2026 incluirá presumiblemente análisis comparativos, pero no están accesibles en la documentación del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: con 149M de parámetros, el modelo en fp32 ocupa aproximadamente 600 MB; en fp16 se reduce a unos 300 MB y en int8 a unos 150 MB. Cabe en cualquier GPU consumer con al menos 2 GB de VRAM.
- GPUs recomendadas: cualquier GPU moderna con soporte CUDA, desde una NVIDIA GTX 1060 (6 GB) hasta RTX 4090 o A100. Para entrenamiento, el autor menciona haber usado una A4500 (20 GB) en proyectos similares, aunque el fine-tuning de este modelo es ligero.
- Compatibilidad con consumer GPU: sí, es perfectamente viable en GPUs de gama media como RTX 3060 o RTX 4060, incluso en CPU para lotes pequeños.
- Opciones de despliegue: sentence-transformers para integración en Python, Text Embeddings Inference (TEI) para servir en producción con batching, y compatible con librerías de indexación como FAISS, Milvus o Qdrant.
- Latencia y throughput: no se han publicado mediciones oficiales. Como referencia, un modelo de 149M en fp16 en una RTX 3090 puede procesar del orden de miles de oraciones por segundo con batch size moderado, pero estos valores son estimaciones orientativas.

## Comparativa con modelos similares

No se dispone de datos de comparación directa con alternativas en la información proporcionada. Modelos comparables en el dominio científico incluyen SPECTER (basado en SciBERT, 110M parámetros, contexto 512) y SciBERT-NLI (fine-tuning de SciBERT con NLI), así como modelos genéricos como BGE-base o E5-base. Sin embargo, no hay resultados de benchmarks compartidos que permitan una comparación cuantitativa rigurosa. Se recomienda consultar el paper de SciEmbed para la evaluación completa frente a estos sistemas.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés, por lo que no es adecuado para documentos en otros idiomas sin adaptación adicional.
- La ventana de contexto de 512 tokens limita el análisis de documentos largos; para secciones extensas es necesario dividir el texto en fragmentos.
- El entrenamiento se basa en pares de citas, lo que puede introducir sesgos hacia campos con mayor densidad de citas (por ejemplo, biomedicina frente a humanidades) y hacia estilos de escritura específicos de la literatura anglosajona.
- No se han documentado evaluaciones de sesgos demográficos o de contenido; como cualquier modelo de embeddings, puede reflejar sesgos presentes en el corpus científico de entrenamiento.
- El rendimiento en regresión (28,2 en SciRepEval) es notablemente inferior al de otras categorías, lo que sugiere que no es óptimo para tareas de predicción numérica sobre documentos.
- Aunque la licencia MIT permite uso comercial, el modelo se distribuye tal cual, sin garantías de precisión en dominios muy especializados o con vocabulario emergente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/J0nasW/sciembed-full
- Repositorio del autor en GitHub: https://github.com/J0nasW (incluye proyectos relacionados como patentCL)
- Paper: *SciEmbed: Citation-Context Supervision for Scientific Document Embeddings*, Findings of EMNLP 2026 (enlace no disponible en la información proporcionada)
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
