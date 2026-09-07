# hao21chen/bge-small-zh-v1.5

## Resumen

El modelo `hao21chen/bge-small-zh-v1.5` es un modelo de embeddings textuales diseñado para el idioma chino. Se trata de una copia del modelo original `BAAI/bge-small-zh-v1.5`, desarrollado por el equipo de BAAI (Beijing Academy of Artificial Intelligence) dentro del proyecto FlagEmbedding. El modelo transforma texto en vectores densos de baja dimensionalidad que pueden utilizarse en tareas de recuperación semántica, clasificación, clustering y búsqueda por similitud.

Su arquitectura es un encoder BERT con aproximadamente 23,95 millones de parámetros, lo que lo convierte en una opción ligera para entornos con recursos limitados. La versión 1.5 incorpora mejoras respecto a la anterior, especialmente en la distribución de las puntuaciones de similitud y en la capacidad de recuperación sin necesidad de instrucciones. Es un modelo monolingüe en chino, pensado para integrarse en sistemas de recuperación aumentada por generación (RAG) y bases de datos vectoriales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only) |
| Parámetros totales | 23.954.432 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BERT (encoder-only), que codifica el texto de entrada en un vector denso. Según la documentación del proyecto FlagEmbedding, los modelos BGE se entrenan mediante aprendizaje contrastivo con una temperatura de 0.01. La versión 1.5 se introdujo para aliviar el problema de la distribución de similitud: las puntuaciones de similitud generadas por el modelo se concentran en el intervalo [0.6, 1], por lo que una puntuación superior a 0.5 no implica necesariamente que dos frases sean semánticamente similares.

El entrenamiento se basa en datos de texto chino, aunque no se han proporcionado detalles específicos sobre el volumen de tokens ni la composición del dataset. No se menciona ningún proceso de RLHF ni DPO.

## Capacidades

- Genera representaciones vectoriales densas de texto en chino, listas para tareas de recuperación semántica, clasificación y clustering.
- Permite la búsqueda por similitud en bases de datos vectoriales, facilitando la implementación de sistemas RAG.
- La versión v1.5 mejora la recuperación sin necesidad de añadir instrucciones a la consulta.
- Se integra con el ecosistema LangChain y con la librería FlagEmbedding.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.

## Casos de uso

- Búsqueda semántica en corpus de documentos chinos: el modelo codifica consultas y documentos en vectores, permitiendo recuperar los pasajes más relevantes mediante búsqueda por similitud coseno.
- Sistemas RAG para LLMs: se puede utilizar como motor de recuperación para alimentar un LLM con contexto relevante extraído de una base de conocimiento en chino.
- Clasificación automática de textos: los embeddings generados pueden alimentar clasificadores supervisados para tareas como análisis de sentimiento o categorización temática.
- Clustering de documentos: la representación vectorial permite agrupar documentos similares sin etiquetas previas, útil para exploración de corpus.
- Motores de recomendación: la similitud entre embeddings de ítems y usuarios permite sugerir contenido relacionado en plataformas chinas.
- Integración con LangChain: el modelo puede usarse como embedding model en cadenas de LangChain para construcción de índices vectoriales y recuperación.
- Servicio de embeddings compatible con OpenAI API: el repositorio de jamesqin-cn muestra cómo desplegar este modelo como un servicio local que expone una API compatible con OpenAI, listo para integrarse en RAG o búsqueda semántica.
