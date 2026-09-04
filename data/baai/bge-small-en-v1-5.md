# BAAI/bge-small-en-v1.5

## Ficha técnica del modelo BAAI/bge-small-en-v1.5

## Resumen

BAAI/bge-small-en-v1.5 es un modelo de embeddings de frases desarrollado por el Beijing Academy of Artificial Intelligence (BAAI). Se basa en una arquitectura Transformer encoder tipo BERT, con 33,36 millones de parámetros, y está pensado para tareas de extracción de características, similitud semántica y recuperación de información. Publicado originalmente en septiembre de 2023 y actualizado en febrero de 2024, forma parte de la familia BGE y está orientado exclusivamente al dominio del inglés.

El modelo resuelve el problema de representar textos como vectores densos para búsqueda semántica, clasificación, clustering y reranking. Su relevancia actual reside en que es una opción ligera y bajo licencia MIT para integrar en pipelines de Retrieval-Augmented Generation (RAG) y sistemas de recuperación de información, especialmente cuando se buscan respuestas rápidas y de bajo coste computacional.

La versión 1.5 corrige el problema de distribución de similitudes presente en versiones anteriores: al entrenarse mediante aprendizaje contrastivo con una temperatura de 0.01, las similitudes resultantes se concentran en el intervalo [0.6, 1], lo que facilita el uso de umbrales de similitud en aplicaciones prácticas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT) |
| Parametros totales | 33.360.512 |
| Parametros activos | No aplica (modelo no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX, PyTorch |

Nota: no se han proporcionado datos sobre cuantizaciones ni sobre la longitud máxima de contexto en la información disponible. El repositorio incluye pesos en safetensors, ONNX y PyTorch.

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Transformer encoder basada en BERT. No se dispone de información detallada sobre el número de capas, cabezas de atención ni dimensiones ocultas. El entrenamiento se realiza mediante aprendizaje contrastivo con una temperatura de 0.01, una técnica que alinea representaciones de textos semánticamente similares en el espacio vectorial. Esta configuración de temperatura produce una distribución de similitud más concentrada, con valores situados aproximadamente entre 0.6 y 1, lo que mejora la interpretabilidad de los umbrales de similitud frente a versiones anteriores de BGE. No se han facilitado datos sobre la composición del dataset de entrenamiento, el número de tokens ni la aplicación de técnicas como RLHF o DPO.

## Capacidades

- Extracción de características (feature extraction) para representar frases o documentos como vectores densos.
- Similitud semántica entre frases y documentos, con valores de similitud concentrados en el intervalo [0.6, 1].
- Recuperación de información y búsqueda semántica.
- Clasificación de textos en inglés, mediante embeddings como entrada a clasificadores ligeros.
- Clustering de documentos, agrupando textos por similitud.
- Reranking de resultados de búsqueda.
- Similitud textual (STS) en inglés.
- No soporta generación de texto, tool calling, visión ni audio. Es exclusivamente un modelo de embeddings.

## Casos de uso

- Búsqueda semántica en documentación técnica en inglés: el modelo puede indexar manuales, documentación de API o artículos técnicos para recuperar pasajes relevantes a partir de consultas en lenguaje natural. Su tamaño reducido permite desplegarlo incluso en CPU.
- Reranking en pipelines RAG: se utiliza para reordenar los resultados iniciales de un sistema de recuperación y seleccionar los documentos más relevantes. Su ligereza lo hace adecuado para incorporarse como etapa de reranking sin penalizar la latencia.
- Clasificación de tickets de soporte: los embeddings de los tickets se usan como entrada para un clasificador sencillo, permitiendo etiquetar solicitudes por categoría (facturación, errores técnicos, etc.) con buena precisión y bajo coste.
- Detección de duplicados en bases de conocimiento: en foros o repositorios de preguntas frecuentes, el modelo permite identificar preguntas o artículos duplicados mediante similitud coseno, facilitando la deduplicación de contenido.
- Clustering de noticias o artículos científicos: el modelo puede agrupar documentos por temática utilizando técnicas de clustering sobre los embeddings, lo que resulta útil para recomendaciones de contenido y análisis de tendencias.
- Moderación de contenido en inglés: los embeddings permiten clasificar comentarios o publicaciones en categorías (por ejemplo, spam o contenido ofensivo) con un clasificador simple, manteniendo el coste computacional bajo.

## Benchmarks y rendimiento

El modelo presenta resultados oficiales declarados en la model card para MTEB (Massive Text Embedding Benchmark). Se han seleccionado los siguientes resultados representativos:

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Clasificación | AmazonCounterfactualClassification | Accuracy | 73,79 |
| Clasificación | AmazonPolarityClassification | Accuracy | 92,75 |
| Recuperación | ArguAna | NDCG @ 10 | 59,55 |
| Clustering | ArxivClusteringP2P | V-measure | 47,40 |
| Clasificación | Banking77Classification | Accuracy | 85,74 |
| Similitud textual | BIOSSES | Spearman (coseno) | 83,75 |
| Reranking | AskUbuntuDupQuestions | MAP | 62,59 |

Nota: no se han publicado comparaciones con otros modelos en la información proporcionada. Los resultados corresponden a MTEB para el subconjunto de tareas seleccionado.

## Requisitos de hardware

- No se proporcionan cifras oficiales de VRAM ni requisitos de GPU en la información disponible.
- Por su tamaño (33,36 millones de parámetros), el modelo es ligero y se puede ejecutar en CPU sin problemas de memoria.
- Opciones de despliegue habituales: sentence-transformers, ONNX Runtime y Text Embeddings Inference (TEI). El repositorio es compatible con endpoints de Hugging Face.
- No se han facilitado datos de latencia ni de throughput.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El modelo pertenece a la familia BGE, de BAAI, que incluye también versiones base y large con el mismo propósito. Los resultados de benchmarks y la configuración específica de estas variantes no están disponibles en la información aportada.

## Limitaciones y advertencias

- El modelo está optimizado para inglés y no está diseñado para textos en español u otros idiomas; su rendimiento fuera del dominio inglés será limitado.
- Al ser un modelo de embeddings, no genera texto, no razona y no es adecuado para tareas de diálogo o generación.
- No se han documentado sesgos específicos, pero al entrenarse con datos en inglés puede reflejar sesgos culturales y lingüísticos de ese dominio.
- La licencia MIT permite el uso comercial sin restricciones adicionales, aunque se recomienda revisar las condiciones de uso de los datos de entrenamiento.
- No se dispone de información detallada sobre la composición del dataset, por lo que se desconoce la exposición a contenido sensible o desequilibrios en los datos.
- La distribución de similitudes concentrada en [0.6, 1] hace necesario calibrar umbrales para cada caso de uso; una similitud aparentemente alta no implica necesariamente relevancia temática.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/BAAI/bge-small-en-v1.5
- Versión anterior del modelo (BAAI/bge-small-en): https://huggingface.co/BAAI/bge-small-en
- Repositorio FlagEmbedding de la familia BGE: https://github.com/FlagOpen/FlagEmbedding
