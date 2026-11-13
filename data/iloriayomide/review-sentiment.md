# Iloriayomide/review-sentiment

## Resumen

review-sentiment es un modelo de clasificacion de texto especializado en analisis de sentimiento, publicado por el usuario Iloriayomide en Hugging Face. Se trata de un ajuste fino (fine-tuning) de distilbert-base-uncased, la version destilada de BERT que reduce el numero de capas y parametros manteniendo buena parte de la capacidad del modelo original. El resultado es un clasificador ligero de aproximadamente 67 millones de parametros, orientado a tareas de inferencia rapida y bajo coste computacional.

El modelo se ha entrenado con el objetivo de predecir la polaridad de resenas o comentarios, presumiblemente en ingles dado que el modelo base es uncased en ese idioma. Segun la model card, alcanza una exactitud del 91,16 % en el conjunto de evaluacion tras dos epocas de entrenamiento, con una perdida de validacion de 0,2707. La model card, generada automaticamente por el Trainer de Hugging Face, no documenta la composicion del dataset ni los usos previstos.

Su relevancia practica radica en que ofrece un punto de partida funcional para pipelines de analisis de sentimiento con requisitos modestos de hardware: al ser un modelo encoder-only de 67 M de parametros, puede ejecutarse en CPU con latencias bajas y desplegarse mediante Text Embeddings Inference o endpoints compatibles. La licencia Apache 2.0 facilita su uso comercial, aunque la falta de documentacion sobre los datos de entrenamiento limita la confianza para produccion sin una validacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (DistilBERT) |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de distilbert-base-uncased, 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo base en ingles, uncased) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de distilbert-base-uncased, una arquitectura transformer encoder-only de 6 capas y 66 M de parametros que destila el conocimiento de BERT-base mediante entrenamiento por destilacion. La cabeza de clasificacion se ha reentrenado para la tarea de clasificacion de sentimiento, sustituyendo la cabeza original de enmascaramiento de lenguaje.

Los hiperparametros documentados en la model card son: learning rate de 2e-05, batch size de 16 en entrenamiento y evaluacion, semilla 42, optimizador AdamW (variante fused) con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal y 2 epocas de entrenamiento. El entrenamiento se ejecuto con Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. No se documenta el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en un clasificador de este tipo). Tampoco se indica el numero de clases ni la taxonomia de etiquetas.

## Capacidades

- Clasificacion de texto para analisis de sentimiento (polaridad de resenas o comentarios).
- Inferencia rapida en CPU y GPU gracias al reducido tamano del modelo (67 M de parametros).
- Compatibilidad con la pipeline `text-classification` de Transformers.
- Compatibilidad con Text Embeddings Inference y endpoints compatibles (segun los tags del repositorio).
- No dispone de capacidades de generacion de texto, razonamiento multi-paso, codigo, matematicas, vision, audio ni tool calling.
- No se documentan capacidades multilingues; el modelo base es uncased en ingles.
- No se documenta un modo de razonamiento explicito (thinking mode).

## Casos de uso

- Analisis de sentimiento de resenas de producto: el modelo clasifica comentarios de clientes en categorias de polaridad, adecuado para volcados masivos gracias a su bajo coste por inferencia y su ejecucion en CPU.
- Monitorizacion de reputacion en redes sociales: procesamiento por lotes de menciones y comentarios para agregar tendencias de sentimiento a lo largo del tiempo, con latencias compatibles con pipelines de streaming.
- Triaje de tickets de soporte: clasificacion previa de mensajes de usuarios para priorizar casos negativos y derivarlos a agentes humanos, usando la salida del clasificador como senal de urgencia.
- Enriquecimiento de datasets de encuestas: etiquetado automatico de respuestas abiertas con polaridad para su posterior analisis estadistico, reduciendo el coste frente al etiquetado manual.
- Filtrado de contenido en foros y comunidades: deteccion de comentarios negativos o toxicos (si el entrenamiento lo contempla) para moderacion asistida, con el modelo actuando como primera capa de filtro.
- Prototipado rapido de pipelines de NLP: al ser un modelo pequeno y con licencia Apache 2.0, sirve como baseline para validar una arquitectura de clasificacion antes de invertir en modelos mayores o en anotacion propia.

## Benchmarks y rendimiento

La model card declara los siguientes resultados en el conjunto de evaluacion durante el entrenamiento:

| Metrica | Epoca 1 (step 1563) | Epoca 2 (step 3126) |
|---|---|---|
| Training loss | 0,1574 | 0,1721 |
| Validation loss | 0,2618 | 0,2707 |
| Accuracy | 0,9075 | 0,9116 |

El model-index oficial no incluye resultados adicionales (lista `results` vacia). No se han publicado resultados de benchmarks estandar (MMLU, GLUE, SST-2, etc.) en la informacion disponible, por lo que no es posible comparar de forma rigurosa con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 (67 M de parametros, aproximadamente 268 MB de pesos); en FP16 alrededor de 134 MB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4090, A100 o H100, aunque no las aprovecha por su tamano.
- Cabe en CPU sin problemas y es viable en dispositivos de borde (edge) con recursos limitados.
- Opciones de despliegue: pipeline de Transformers, Text Embeddings Inference (segun tags), endpoints compatibles, y exportacion a ONNX o cuantizacion para reducir latencia.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un throughput alto en CPU y muy alto en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Iloriayomide/review-sentiment | 66,9 M | no disponible (heredado 512) | Apache 2.0 | Fine-tune de DistilBERT para sentimiento; accuracy declarada 91,16 % |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 | Apache 2.0 | Fine-tune de referencia para sentimiento en SST-2; ampliamente usado |
| bert-base-uncased | ~110 M | 512 | Apache 2.0 | Modelo base sin ajuste; mayor coste computacional |
| roberta-base | ~125 M | 512 | MIT | Encoder alternativo con mayor capacidad, mayor coste |

La comparacion de rendimiento con los modelos alternativos no esta disponible porque no se han publicado resultados en benchmarks estandar para review-sentiment.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, el numero de clases ni la taxonomia de etiquetas, lo que impide conocer el dominio real de aplicacion.
- El modelo base es uncased en ingles; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Riesgo de alucinacion no aplicable en sentido estricto (es un clasificador), pero si de clasificaciones erroneas fuera de la distribucion de entrenamiento.
- No se documentan sesgos conocidos; al desconocerse los datos, no es posible evaluar sesgos de dominio, genero o cultura.
- La exactitud declarada (91,16 %) corresponde a un conjunto de evaluacion no descrito; no debe interpretarse como rendimiento garantizado en produccion.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentacion sobre procedencia de datos aconseja una validacion legal y tecnica antes de desplegarlo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Iloriayomide/review-sentiment
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Documentacion de DistilBERT (paper): https://arxiv.org/abs/1910.01108
- Documentacion de Transformers (pipeline text-classification): https://huggingface.co/docs/transformers/main/en/tasks/sequence_classification
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
