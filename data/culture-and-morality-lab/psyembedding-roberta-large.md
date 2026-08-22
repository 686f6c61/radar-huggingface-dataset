# Culture-and-Morality-Lab/psyembedding-roberta-large

## Resumen

El modelo `psyembedding-roberta-large` es un sistema de embeddings semánticos desarrollado por el Culture and Morality Lab (CAML) de la Universidad de Massachusetts Amherst. Se trata de un modelo de tipo sentence-transformer basado en la arquitectura RoBERTa-large, diseñado para mapear frases y párrafos a un espacio vectorial denso de 1024 dimensiones. Su propósito principal es la representación de texto para tareas de similitud semántica, búsqueda semántica, minería de paráfrasis, clasificación de texto y clustering, con un enfoque particular en textos relacionados con cultura y moralidad.

El modelo fue entrenado mediante fine-tuning sobre un conjunto de datos de 11 180 muestras utilizando la función de pérdida CosineSimilarityLoss, lo que optimiza la similitud coseno entre pares de textos semánticamente relacionados. Con 355 359 744 parámetros, es un modelo de gran tamaño dentro de la familia de embeddings densos, y su relevancia actual radica en su especialización en dominios socioculturales y morales, un área con poca oferta de modelos de embeddings públicos.

Aunque la información pública no detalla la licencia ni los idiomas soportados, el modelo está disponible en Hugging Face bajo el repositorio del laboratorio y es compatible con la librería `sentence-transformers` y la infraestructura de Text Embeddings Inference (TEI).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-large (sentence-transformer) |
| Parametros totales | 355 359 744 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa-large, un transformer encoder preentrenado con 24 capas, 16 cabezas de atención y una dimensión oculta de 1024. Sobre esta base, se aplica un pooling (probablemente mean o CLS) para obtener un embedding denso de 1024 dimensiones, tal como es habitual en los modelos de `sentence-transformers`. El fine-tuning se realizó con un conjunto de datos de 11 180 muestras etiquetadas con pares de texto y se optimizó mediante CosineSimilarityLoss, que maximiza la similitud coseno entre representaciones de pares semánticamente equivalentes.

No se dispone de información detallada sobre el proceso de entrenamiento, como el número total de épocas, la composición exacta del dataset o si se emplearon técnicas de hard negative mining. El dataset parece estar orientado a textos de naturaleza política y social, según los ejemplos mostrados en la model card, lo que sugiere una especialización en discurso sociopolítico y moral.

## Capacidades

- Generación de embeddings densos de 1024 dimensiones para frases y párrafos.
- Similitud semántica entre textos mediante similitud coseno.
- Búsqueda semántica (semantic search) sobre colecciones de documentos.
- Minería de paráfrasis (paraphrase mining).
- Clasificación de texto basada en representaciones vectoriales.
- Clustering de documentos por similitud temática.
- Compatible con la librería `sentence-transformers` y con Text Embeddings Inference (TEI) para despliegue en producción.
- No soporta generación de texto, tool calling ni razonamiento multi-paso; es exclusivamente un modelo de representación.

## Casos de uso

- Análisis de discurso político: el modelo puede generar embeddings de declaraciones o tuits para agrupar posturas ideológicas y medir la cercanía semántica entre diferentes actores políticos, gracias a su entrenamiento con textos de naturaleza política.
- Moderación de contenido en foros: permite detectar mensajes con temática moral o cultural similar, facilitando la identificación de discursos de odio o polarización mediante clustering y búsqueda de vecinos cercanos.
- Búsqueda semántica en bases de datos de investigaciones sociales: investigadores pueden indexar artículos, encuestas o entrevistas y recuperar textos relevantes por similitud conceptual, sin depender de palabras clave exactas.
- Sistemas de recomendación de contenidos: en plataformas de noticias o redes sociales, se pueden recomendar artículos u opiniones que traten temas morales o culturales afines al perfil del usuario, usando la similitud entre embeddings.
- Minería de paráfrasis en corpus académicos: para detectar reformulaciones de una misma idea en diferentes fuentes, útil en estudios de plagio o en el análisis de la evolución de argumentos.
- Clasificación automática de comentarios en encuestas abiertas: las respuestas a preguntas abiertas sobre valores o moral pueden agruparse automáticamente en categorías temáticas mediante clustering sobre los embeddings generados.

## Benchmarks y rendimiento

Según el model-index publicado por el autor, el modelo obtuvo los siguientes resultados en la tarea de similitud semántica:

| Metrica | Valor |
|---|---|
| Pearson Cosine | 0,3952 |
| Spearman Cosine | 0,4101 |

No se han publicado resultados comparativos con otros modelos de embeddings en la información disponible.

## Requisitos de hardware

- El modelo tiene 355 millones de parámetros, por lo que en precisión fp32 ocupa aproximadamente 1,4 GB en memoria (el tamaño del repositorio es de 1,4 GB).
- Para inferencia en GPU, se recomienda al menos 4 GB de VRAM si se usa fp32; con cuantización fp16, la memoria requerida se reduce a unos 0,7 GB, lo que permite ejecutarlo en GPUs de consumo como la NVIDIA GTX 1060 6GB o superiores.
- En CPU, la inferencia es viable para procesamiento por lotes, aunque la latencia será mayor; se recomienda usar la librería `sentence-transformers` con optimizaciones como `torch.compile` o `onnxruntime`.
- Opciones de despliegue: servidores de inferencia compatibles con Text Embeddings Inference (TEI), vLLM (aunque está orientado a generación, puede servir embeddings), y `sentence-transformers` en entornos Python.
- No se dispone de datos oficiales de latencia o throughput; se estima que en una GPU moderna (por ejemplo, RTX 3090) el procesamiento de un lote de 32 frases de longitud media puede completarse en decenas de milisegundos, pero estos valores son orientativos.

## Comparativa con modelos similares

No se dispone de información suficiente en la documentación proporcionada para realizar una comparativa con otros modelos de embeddings de la misma categoría. Se recomienda consultar el repositorio del laboratorio para posibles publicaciones adicionales.

## Limitaciones y advertencias

- No se ha declarado la licencia del modelo, por lo que su uso comercial no está garantizado sin una consulta previa al autor.
- El modelo está entrenado específicamente con textos de naturaleza sociopolítica y moral; su rendimiento en dominios técnicos o científicos puede ser inferior.
- La longitud de contexto no está documentada; se asume que hereda el límite de RoBERTa-large (512 tokens), pero no se ha confirmado.
- Los resultados de similitud (Pearson y Spearman en torno a 0,40) son moderados, lo que indica que el modelo puede no ser óptimo para tareas que requieran alta precisión semántica.
- Al ser un modelo de embeddings, no es adecuado para generación de texto ni para tareas que requieran razonamiento o comprensión profunda más allá de la similitud superficial.
- No se han publicado evaluaciones de sesgos; dado su dominio de entrenamiento, podría reflejar sesgos presentes en los textos políticos y morales utilizados.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/Culture-and-Morality-Lab/psyembedding-roberta-large)
- [Paper de RoBERTa (arXiv:1908.10084)](https://arxiv.org/abs/1908.10084)
- [Sitio del Culture and Morality Lab](https://cultureandmorality.org/tools)
