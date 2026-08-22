# Culture-and-Morality-Lab/psyembedding-bert-large-uncased

## Resumen

PsyEmbedding BERT Large Uncased es un modelo de *embeddings* de frases (sentence embeddings) desarrollado por el Culture-and-Morality Lab, un grupo de investigación centrado en psicología cultural y moralidad. Está basado en la arquitectura BERT Large (uncased) y ha sido ajustado mediante *sentence-transformers* para producir representaciones densas de 1024 dimensiones. El modelo está diseñado para tareas de similitud semántica, búsqueda semántica, minería de paráfrasis y clasificación de texto, entre otras.

Aunque el repositorio no especifica la licencia ni los idiomas soportados, los ejemplos mostrados en la *model card* están en inglés, lo que sugiere que el modelo está orientado principalmente a ese idioma. Con 335 millones de parámetros, se sitúa en la gama media-alta de los modelos de *embeddings* basados en BERT, ofreciendo un equilibrio entre capacidad representativa y requisitos de cómputo moderados. Su relevancia radica en que proporciona una alternativa de código abierto para investigadores que necesitan representaciones de texto de alta calidad en dominios específicos, aunque su adopción actual es limitada (38 descargas).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT Large, uncased) |
| Parametros totales | 335.141.888 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens (estándar de BERT, no especificado explícitamente) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (ejemplos en inglés) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT Large, un *transformer encoder* de 24 capas, 16 cabezas de atención y un tamaño de *hidden* de 1024. Ha sido entrenado con la librería *sentence-transformers* utilizando la función de pérdida *CosineSimilarityLoss*, lo que optimiza las representaciones para que frases semánticamente similares tengan vectores cercanos en el espacio coseno. El conjunto de datos de entrenamiento consta de 11.180 muestras, aunque no se proporcionan detalles sobre su composición ni el proceso de recopilación.

No se menciona el uso de técnicas de alineación como RLHF o DPO, ni se especifica el número total de tokens de entrenamiento. La referencia al paper arXiv 1908.10084 (el artículo original de *sentence-transformers*) sugiere que se ha seguido el enfoque estándar de ajuste de *embeddings* de frases sobre un modelo preentrenado de BERT. No hay innovaciones arquitectónicas destacables más allá de la adaptación al dominio de la psicología y la moralidad, aunque no se aportan evidencias de un entrenamiento específico en ese ámbito.

## Capacidades

- Generación de *embeddings* de frases y párrafos en un espacio vectorial denso de 1024 dimensiones.
- Similitud semántica entre textos, calculada mediante similitud coseno.
- Búsqueda semántica en corpus de documentos.
- Minería de paráfrasis y detección de duplicados.
- Clasificación de texto mediante la utilización de los *embeddings* como características de entrada.
- Agrupamiento (*clustering*) de documentos por similitud temática.
- Extracción de características (*feature extraction*) para pipelines de *machine learning*.

No se declara soporte para *tool calling*, agentes, razonamiento multi-paso ni capacidades multimodales. El modelo es exclusivamente de tipo encoder y no genera texto.

## Casos de uso

- Búsqueda semántica en bases de conocimiento: dado un corpus de documentos, se pueden indexar los *embeddings* generados por el modelo y recuperar los pasajes más relevantes a partir de una consulta en lenguaje natural, gracias a la similitud coseno.
- Deduplicación de contenidos: en plataformas de publicación o repositorios de texto, el modelo permite identificar artículos o entradas duplicadas comparando la similitud de sus representaciones vectoriales.
- Moderación de comentarios: los *embeddings* pueden alimentar clasificadores supervisados para detectar contenido tóxico o fuera de tema, aunque el modelo en sí no realiza clasificación directa.
- Análisis de discurso político o social: dado que los ejemplos de la *model card* incluyen textos sobre política y sociedad, el modelo puede ser útil para agrupar opiniones o detectar polarización en foros y redes sociales.
- Recuperación de información en entornos académicos: investigadores pueden utilizar los *embeddings* para encontrar artículos o párrafos relacionados en grandes colecciones de literatura científica o humanística.
- Construcción de chatbots basados en recuperación: el modelo puede servir para seleccionar respuestas predefinidas de una base de datos según la similitud con la pregunta del usuario, en sistemas de atención al cliente simples.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en la *model card*, obtenidos sobre un dataset denominado "similarity" (sin más especificación). No se proporcionan comparaciones con otros modelos.

| Métrica | Valor |
|---|---|
| Pearson Cosine | 0.3694 |
| Spearman Cosine | 0.3901 |

Estos valores indican una correlación moderada entre las similitudes coseno calculadas por el modelo y las anotaciones humanas de similitud en el conjunto de evaluación. No se dispone de resultados en benchmarks estándar como MMLU, HumanEval o GLUE, por lo que no es posible comparar su rendimiento con otros modelos de *embeddings* de forma objetiva.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo BERT Large con 335M de parámetros, se requiere aproximadamente 1.3 GB de memoria para los pesos en FP32, más memoria para las activaciones. Con una cuantización a FP16, la huella se reduce a ~670 MB, y a INT8 a ~335 MB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM puede ejecutar el modelo cómodamente para inferencia por lotes pequeños. Ejemplos: NVIDIA RTX 2060, RTX 3060, T4, V100. Para *fine-tuning* se recomienda al menos 12 GB.
- Compatibilidad con GPU de consumo: sí, es viable en GPUs de gama media como la RTX 3060 o superior.
- Opciones de despliegue: el modelo es compatible con la librería *sentence-transformers*, así como con Hugging Face Transformers. También puede servirse mediante *text-embeddings-inference* (TEI) o *sentence-transformers* en un contenedor Docker. No se menciona soporte para vLLM o llama.cpp, ya que estos están orientados a modelos generativos.
- Latencia y throughput: no se dispone de mediciones oficiales. Como referencia, un BERT Large puede procesar alrededor de 100-200 frases por segundo en una GPU moderna (p. ej., A100) con un tamaño de lote de 32, pero esto depende de la longitud de los textos y la implementación.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparativos con otros modelos de *embeddings* de frases. A continuación se presenta una comparación cualitativa basada en características públicas:

| Modelo | Parámetros | Dimensiones del embedding | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PsyEmbedding BERT Large (este) | 335M | 1024 | 512 | No disponible | Hugging Face |
| all-MiniLM-L6-v2 | 22M | 384 | 256 | Apache 2.0 | Hugging Face |
| BERT Large (original) | 335M | 768 (pooler) | 512 | Apache 2.0 | Hugging Face |
| sentence-t5-base | 220M | 768 | 512 | Apache 2.0 | Hugging Face |

La comparación con all-MiniLM-L6-v2 es relevante porque es un modelo mucho más ligero y ampliamente utilizado. PsyEmbedding ofrece mayor capacidad representativa (1024 dimensiones frente a 384), pero a costa de un tamaño de modelo 15 veces mayor. No hay datos que demuestren una ventaja cualitativa en tareas de similitud semántica. La ausencia de licencia clara limita su uso en entornos comerciales, a diferencia de las alternativas con licencia Apache 2.0.

## Limitaciones y advertencias

- No se especifica licencia, lo que impide su uso comercial sin consultar al autor. Esto es un riesgo legal importante para cualquier integración en productos.
- El modelo está entrenado sobre un conjunto de datos reducido (11.180 muestras) y no se detalla su procedencia ni su dominio. Es probable que los *embeddings* estén sesgados hacia el tipo de textos utilizados en el entrenamiento (posiblemente discusión política y social, según los ejemplos).
- Al ser un modelo basado en BERT, hereda los sesgos de género, raza y otros presentes en el corpus de preentrenamiento original (BookCorpus y Wikipedia en inglés).
- La longitud de contexto está limitada a 512 tokens; textos más largos deben truncarse, lo que puede perder información relevante.
- No se proporcionan datos sobre rendimiento en otros idiomas; los ejemplos sugieren que solo funciona bien en inglés.
- Los valores de correlación (0.37-0.39) son moderados y no indican un rendimiento excepcional en similitud semántica; para casos de uso exigentes puede ser necesario evaluar alternativas.
- No se ha publicado información sobre el proceso de entrenamiento (épocas, tasa de aprendizaje, estrategia de validación), lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Culture-and-Morality-Lab/psyembedding-bert-large-uncased
- Colección PsyEmbedding: https://huggingface.co/collections/Culture-and-Morality-Lab/psyembedding
- Sitio del Culture and Morality Lab: https://cultureandmorality.org/tools
- Paper de referencia de *sentence-transformers* (arXiv 1908.10084): https://arxiv.org/abs/1908.10084
