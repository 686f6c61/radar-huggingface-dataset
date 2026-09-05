# cannizaroo/imdb-bert-sentiment

## Resumen

El modelo `cannizaroo/imdb-bert-sentiment` es un clasificador de sentimiento binario en inglés, desarrollado por el usuario `cannizaroo` mediante fine-tuning de `bert-base-uncased` sobre el dataset de reseñas de películas IMDb. Resuelve la tarea de determinar si una reseña es positiva o negativa, un problema clásico de análisis de opiniones en el dominio cinematográfico. Su relevancia radica en ofrecer una solución compacta y lista para usar, con licencia MIT, que puede integrarse fácilmente en pipelines de procesamiento de texto mediante la librería Transformers.

Arquitectónicamente se basa en el encoder BERT original de Devlin et al. (2018), con una cabeza de clasificación de secuencia (BertForSequenceClassification). El modelo tiene aproximadamente 109,5 millones de parámetros y una longitud máxima de contexto de 512 tokens. Está disponible en formato safetensors y su tamaño de repositorio es de 0,4 GB. Al ser un modelo de tamaño medio, puede ejecutarse en GPUs de consumo sin dificultad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base-uncased (BertForSequenceClassification) |
| Parametros totales | 109.483.778 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un transformer encoder bidireccional preentrenado con enmascaramiento de lenguaje (MLM) y prediccion de siguiente oracion sobre el corpus BookCorpus y Wikipedia en ingles. Sobre esta base se anade una capa de clasificacion lineal con dos salidas (positivo/negativo). El fine-tuning se realizo con PyTorch y la API `Trainer` de Hugging Face Transformers, utilizando el dataset IMDb Movie Reviews compuesto por 25.000 reseñas de entrenamiento y 25.000 de test, todas etiquetadas de forma binaria.

Los hiperparametros de entrenamiento declarados son: tasa de aprendizaje de 2e-5, tamano de batch de 16, 2 epocas, weight decay de 0.01 y longitud maxima de secuencia de 512 tokens. No se menciona el uso de tecnicas de alineacion como RLHF o DPO. La unica innovacion tecnica destacable es el uso de la tokenizacion estandar de BERT con padding y truncamiento, sin modificaciones arquitectonicas adicionales.

## Capacidades

- Clasificacion binaria de sentimiento: distingue entre sentimiento negativo (0) y positivo (1) en texto en ingles.
- Analisis de reseñas de peliculas: optimizado para el dominio de criticas cinematograficas de IMDb.
- Integracion sencilla con la API `pipeline` de Transformers para inferencia inmediata.
- Compatibilidad con Text Embeddings Inference y Hugging Face Endpoints segun las etiquetas del repositorio.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente ni razonamiento multi-paso.
- Sin soporte multilingue: unicamente ingles.
- Sin capacidades de vision, audio ni modo de pensamiento.

## Casos de uso

- Analisis de sentimiento en plataformas de streaming: el modelo puede clasificar automaticamente las opiniones de los usuarios sobre peliculas y series, permitiendo agregar valoraciones positivas o negativas a escala.
- Moderacion de comentarios en foros de cine: permite filtrar comentarios con tono negativo o positivo antes de su publicacion, facilitando la gestion de comunidades online.
- Integracion en sistemas de recomendacion: las puntuaciones de sentimiento pueden combinarse con metadatos para sugerir titulos que hayan recibido una recepcion mayoritariamente positiva.
- Analisis de criticas profesionales: los medios de comunicacion pueden procesar grandes volumenes de criticas en ingles para extraer tendencias de opinion sobre estrenos.
- Monitorizacion de redes sociales sobre estrenos: aunque el dominio es distinto al de IMDb, el modelo puede aplicarse a tweets o publicaciones cortas en ingles sobre peliculas, siempre que se evalue previamente su rendimiento.
- Clasificacion de encuestas de satisfaccion: en contextos de entretenimiento, las respuestas abiertas en ingles pueden etiquetarse como positivas o negativas para alimentar dashboards de calidad.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados sobre el conjunto de test de IMDb:

| Metrica | Valor |
|---|---|
| Accuracy | 93.21% |
| Precision | 95.53% |
| Recall | 90.66% |
| F1 Score | 93.03% |

La matriz de confusion sobre el test set es la siguiente:

|  | Predicho negativo | Predicho positivo |
|---|---|---|
| Actual negativo | 11970 | 530 |
| Actual positivo | 1167 | 11333 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el dato no esta disponible en la informacion proporcionada. Como orientacion general, un modelo de 109 millones de parametros en FP32 ocupa aproximadamente 0,44 GB solo en pesos, por lo que se recomienda al menos 1-2 GB de VRAM para inferencia con activaciones y tokenizacion.
- GPU recomendadas: no disponible. Por su tamano, es compatible con GPUs de consumo como RTX 3060, RTX 4060 o superiores, asi como con GPUs de datacenter como A10 o T4.
- Si cabe en consumer GPU: si, es un modelo ligero que se ejecuta sin problemas en GPUs de gama media.
- Opciones de despliegue: compatible con la API `pipeline` de Transformers, Hugging Face Inference Endpoints y Text Embeddings Inference segun las etiquetas del repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Existen otros modelos en Hugging Face que realizan la misma tarea, como `philipobiorah/bert-imdb-model` y `dina1/bert-imdb-sentiment`. Sin embargo, no se dispone de especificaciones tecnicas ni resultados de benchmarks de estos modelos en la informacion proporcionada.

| Modelo | Parametros | Contexto | Accuracy | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cannizaroo/imdb-bert-sentiment | 109.483.778 | 512 | 93.21% | MIT | Hugging Face |
| philipobiorah/bert-imdb-model | No disponible | No disponible | No disponible | No disponible | Hugging Face |
| dina1/bert-imdb-sentiment | No disponible | No disponible | No disponible | No disponible | Hugging Face |

## Limitaciones y advertencias

- Sesgos conocidos: el modelo puede reflejar sesgos presentes en el dataset de IMDb y en el corpus de preentrenamiento de `bert-base-uncased`.
- Riesgo de alucinacion: bajo, al tratarse de una tarea de clasificacion con salida binaria; no genera texto libre.
- Limitaciones de contexto: los textos que superen los 512 tokens se truncan, por lo que el sentimiento expresado al final de reseñas muy largas puede perderse.
- Limitaciones de idioma: el modelo solo funciona con texto en ingles.
- Restricciones de dominio: entrenado exclusivamente sobre reseñas de peliculas de IMDb, por lo que su rendimiento puede degradarse en otros dominios como tweets, resenas de productos o texto formal.
- Licencia MIT: permite uso comercial, pero el usuario debe citar el modelo base y el dataset segun la seccion de citacion del model card.

## Enlaces

- Hugging Face: https://huggingface.co/cannizaroo/imdb-bert-sentiment
- Paper de BERT: https://arxiv.org/abs/1810.04805
- Dataset IMDb: https://huggingface.co/datasets/imdb
