# Culture-and-Morality-Lab/psyembedding-e5-large-v2

## Resumen

PsyEmbedding-e5-large-v2 es un modelo de embeddings de frases desarrollado por el laboratorio Culture-and-Morality-Lab. Se trata de un fine-tuning del modelo E5-large-v2 de Microsoft, especializado en representaciones densas para tareas de similitud semántica, búsqueda y clasificación de textos. El modelo está entrenado con un dataset propio de 11.180 ejemplos utilizando la función de pérdida CosineSimilarityLoss, lo que lo orienta a producir vectores donde la similitud coseno refleja la proximidad semántica.

La relevancia de este modelo radica en su aplicación al dominio de la cultura y la moralidad, un área donde los matices contextuales y valorativos son críticos. Aunque comparte la arquitectura base de E5-large-v2 (un transformer BERT de 335 millones de parámetros), su ajuste fino sobre datos específicos lo hace potencialmente más adecuado para analizar discursos, opiniones y textos con carga ética o cultural. El modelo se distribuye en formato safetensors y está diseñado para ser usado con la librería sentence-transformers, lo que facilita su integración en pipelines de procesamiento de lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (BERT, basado en E5-large-v2) |
| Parametros totales | 335.141.888 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (el modelo base E5-large-v2 soporta 512 tokens) |
| Tipos de cuantizacion | no disponible (formato safetensors, cuantificable con herramientas externas) |
| Idiomas soportados | no disponible (el modelo base E5-large-v2 es multilingue, pero el fine-tuning podria estar limitado a ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura E5-large-v2, que a su vez es un transformer BERT con 24 capas, 1024 dimensiones ocultas y 16 cabezas de atencion, totalizando 335 millones de parametros. La arquitectura es totalmente densa, sin mecanismos de mezcla de expertos ni atencion lineal. El entrenamiento de PsyEmbedding-e5-large-v2 consiste en un fine-tuning del modelo preentrenado E5-large-v2 sobre un dataset de 11.180 pares de frases, utilizando la funcion de perdida CosineSimilarityLoss. Este enfoque optimiza directamente la similitud coseno entre representaciones, lo que es adecuado para tareas de busqueda semantica y similitud textual. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas adicionales como hard negatives o mineria de datos.

## Capacidades

- Generacion de embeddings densos de 1024 dimensiones para frases y parrafos.
- Similitud semantica entre textos, permitiendo medir la proximidad coseno.
- Busqueda semantica y recuperacion de informacion basada en vectores.
- Paraphrase mining, es decir, deteccion de frases semanticamente equivalentes.
- Clasificacion de textos mediante la comparacion de embeddings con representaciones de clases.
- Agrupacion (clustering) de documentos por similitud tematica.
- No soporta generacion de texto, tool calling, ni capacidades multimodales.

## Casos de uso

- Analisis de discursos politicos: el modelo puede comparar declaraciones de distintos actores para identificar afinidades ideologicas o detectar cambios de postura a lo largo del tiempo, gracias a su entrenamiento en textos con carga valorativa.
- Moderacion de contenido en foros: al representar frases en un espacio vectorial, permite agrupar comentarios por tematica o tono, facilitando la deteccion de discursos de odio o polarizacion.
- Busqueda semantica en archivos de opinion: en una base de articulos de opinion o ensayos, el modelo permite recuperar textos que aborden temas morales o culturales similares, incluso si no comparten palabras clave.
- Clasificacion de textos eticos: para organizaciones que necesitan etiquetar contenido segun criterios morales (p. ej., justicia, cuidado, autoridad), los embeddings pueden alimentar clasificadores ligeros entrenados sobre las representaciones.
- Sistemas de recomendacion de lecturas: comparando el embedding de un articulo leido con otros de un corpus, se pueden sugerir contenidos relacionados por su enfoque cultural o moral.
- Deteccion de sesgos en medios: al comparar la representacion de noticias sobre un mismo evento desde distintas fuentes, se pueden identificar diferencias de encuadre o carga valorativa.

## Benchmarks y rendimiento

El autor declara un unico resultado de evaluacion en la tarea de similitud semantica, medido sobre un dataset propio denominado "similarity". Los valores son:

| Metrica | Valor |
|---|---|
| Pearson Cosine | 0.4106 |
| Spearman Cosine | 0.4261 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. Estos valores indican una correlacion moderada entre las similitudes predichas y las etiquetas humanas, lo que sugiere que el modelo captura parcialmente la relacion semantica, pero con margen de mejora.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1.3 GB en FP32, 670 MB en FP16 y 335 MB en INT8, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP32 (p. ej., NVIDIA GTX 1050 Ti, RTX 2060). Para FP16 o INT8, una GPU con 1 GB seria suficiente.
- Es ejecutable en CPU con razonable velocidad, dado el tamano del modelo.
- Opciones de despliegue: sentence-transformers (libreria principal), Hugging Face Text Embeddings Inference (TEI), ONNX Runtime, o servidores de embeddings como Qdrant o Milvus con integracion de modelos.
- Latencia estimada: para un lote de 1 frase, en una GPU moderna (RTX 3090) la inferencia toma alrededor de 5-10 ms; en CPU puede ser de 50-100 ms. No hay datos oficiales de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Especializacion |
|---|---|---|---|---|
| PsyEmbedding-e5-large-v2 | 335M | no disponible (base: 512) | BERT | Fine-tuning en cultura y moralidad |
| E5-large-v2 (original) | 335M | 512 | BERT | Multilingue, entrenamiento con contrastive learning |
| PsyEmbedding-gte-large | 434M (estimado) | no disponible | GTE (transformer) | Fine-tuning similar, mismo laboratorio |

No se dispone de benchmarks comparativos entre estos modelos. La principal diferencia es el dominio de entrenamiento: PsyEmbedding-e5-large-v2 esta ajustado sobre datos especificos del laboratorio, mientras que E5-large-v2 es un modelo generalista. PsyEmbedding-gte-large usa una arquitectura distinta (GTE) y tiene mas parametros, pero no se conocen sus metricas.

## Limitaciones y advertencias

- El dataset de entrenamiento es reducido (11.180 ejemplos), lo que puede provocar overfitting y limitar la generalizacion a dominios fuera del ambito cultural-moral.
- No se ha publicado informacion sobre sesgos, pero al estar entrenado sobre textos de opinion (posiblemente de fuentes como Reddit o foros), puede heredar sesgos politicos, de genero o culturales presentes en esos datos.
- Riesgo de alucinacion: al ser un modelo de embeddings, no genera texto, pero las representaciones pueden ser poco fiables para textos muy alejados del dominio de entrenamiento.
- La licencia no esta especificada, lo que impide conocer si se permite uso comercial o modificacion.
- No se proporcionan detalles sobre el preprocesamiento de textos ni sobre el idioma exacto soportado, lo que dificulta su uso en produccion sin validacion previa.
- Los benchmarks publicados muestran correlaciones moderadas, por lo que no se recomienda para aplicaciones donde se requiera alta precision en similitud semantica sin una evaluacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Culture-and-Morality-Lab/psyembedding-e5-large-v2
- Coleccion PsyEmbedding: https://huggingface.co/collections/Culture-and-Morality-Lab/psyembedding
- Espejo del modelo (HF Mirror): https://d6108366.hf-mirror.com/Culture-and-Morality-Lab/psyembedding-e5-large-v2
- Modelo relacionado (psyembedding-gte-large): https://huggingface.co/Culture-and-Morality-Lab/psyembedding-gte-large
