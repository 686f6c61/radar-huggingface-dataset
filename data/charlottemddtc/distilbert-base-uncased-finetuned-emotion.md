# charlottemddtc/distilbert-base-uncased-finetuned-emotion

## Resumen

`distilbert-base-uncased-finetuned-emotion` es un modelo de clasificación de texto en inglés desarrollado por el usuario charlottemddtc, consistente en un ajuste fino (fine-tuning) del checkpoint `distilbert-base-uncased` sobre el dataset `dair-ai/emotion`. Su tarea es asignar un texto corto en inglés a una de seis emociones: sadness, joy, love, anger, fear y surprise. Se publica bajo licencia Apache 2.0 y con un tamaño de repositorio de 0,3 GB.

La relevancia del modelo es acotada pero clara: demuestra que un transformer destilado de 66,9 millones de parámetros puede superar a una baseline clásica de TF-IDF más regresión logística en la misma tarea (0,9220 frente a 0,8815 de accuracy en el split de test de 2.000 ejemplos). Es, por tanto, un candidato útil para despliegues de clasificación emocional de bajo coste computacional, no para generación de texto ni razonamiento.

Arquitectura, tamaño y contexto: DistilBERT (transformer encoder destilado de BERT-base), 66.958.086 parámetros totales, ventana de entrada de 128 tokens durante el entrenamiento y clasificación en 6 clases. El modelo no tiene descargas ni likes en el momento de la consulta, lo que conviene tener en cuenta al evaluar su madurez y soporte comunitario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder, destilado de BERT-base) |
| Parametros totales | 66.958.086 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (longitud maxima usada en el fine-tuning) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no declarada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un transformer encoder de 6 capas obtenido por destilacion de conocimiento de BERT-base, y anade una cabeza de clasificacion sobre la representacion del token `[CLS]` para 6 etiquetas. El ajuste fino se realizo durante 3 epocas con learning rate 2e-05, batch size 32, longitud maxima de 128 tokens, weight decay 0,01 y precision fp16 sobre una Tesla T4, con una duracion declarada de 1,9 minutos y semilla 42. El mejor checkpoint se selecciono segun el F1 macro del conjunto de validacion.

El dataset de entrenamiento es `dair-ai/emotion`, cuyas etiquetas se obtuvieron originalmente a partir de hashtags (supervision debil) y por tanto contienen ruido. No se declara en la informacion disponible el numero exacto de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO; al tratarse de una tarea de clasificacion supervisada, lo esperable es un ajuste fino con entropia cruzada, sin alineamiento por preferencias.

## Capacidades

- Clasificacion de texto en ingles en 6 emociones: sadness, joy, love, anger, fear y surprise.
- Inferencia sobre textos cortos, tipicamente de estilo tweet o mensaje breve.
- Integracion directa con la pipeline `text-classification` de Hugging Face Transformers.
- Salida de etiqueta y puntuacion de confianza por clase.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingue: solo ingles.
- No tiene modo thinking, vision ni audio.

## Casos de uso

- Moderacion de comunidades y redes sociales: el modelo clasifica mensajes cortos en seis categorias emocionales, lo que permite priorizar revision humana de contenido con carga de anger o fear y reducir el volumen de mensajes que llegan a los moderadores.
- Analisis de sentimiento a nivel de emocion en encuestas abiertas: procesar respuestas breves de usuarios y agregar la distribucion de emociones por segmento, aprovechando el bajo coste de un modelo de 66,9 M de parametros.
- Enrutamiento de tickets de soporte: asignar cada ticket a un flujo segun la emocion detectada (por ejemplo, escalar anger a atencion prioritaria) antes de la clasificacion por tema.
- Monitorizacion de reputacion de marca: analizar menciones en ingles en tiempo real con un throughput alto, ya que el modelo cabe en CPU y GPU de gama baja.
- Etiquetado asistido de datasets: preanotar corpus de texto corto en ingles con las seis emociones para su posterior revision, reduciendo el esfuerzo de anotacion manual.
- Investigacion en psicologia computacional: usar el modelo como extractor de caracteristicas emocionales en estudios sobre lenguaje y estado de animo, con la cautela de que el dominio de entrenamiento son textos tipo tweet.
- Filtrado previo en pipelines de generacion: detectar mensajes de alta carga emocional antes de pasarlos a un modelo generativo mayor, ahorrando coste de inferencia.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de `dair-ai/emotion` (2.000 ejemplos). No estan verificados de forma independiente (`verified: false`).

| Modelo | Accuracy | F1 macro | F1 ponderado |
|---|---|---|---|
| Clase mayoritaria | 0,3475 | 0,0860 | 0,1792 |
| TF-IDF + regresion logistica | 0,8815 | 0,8348 | 0,8822 |
| DistilBERT antes del fine-tuning | 0,1360 | 0,0401 | 0,0331 |
| DistilBERT tras fine-tuning | 0,9220 | 0,8771 | 0,9220 |

Detalle por clase tras el fine-tuning:

| Clase | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| sadness | 0,959 | 0,964 | 0,961 | 581 |
| joy | 0,937 | 0,955 | 0,946 | 695 |
| love | 0,871 | 0,761 | 0,812 | 159 |
| anger | 0,950 | 0,891 | 0,919 | 275 |
| fear | 0,866 | 0,893 | 0,879 | 224 |
| surprise | 0,684 | 0,818 | 0,745 | 66 |
| accuracy | - | - | 0,922 | 2000 |
| macro avg | 0,877 | 0,880 | 0,877 | 2000 |
| weighted avg | 0,923 | 0,922 | 0,922 | 2000 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,27 GB solo para pesos (66,9 M de parametros); en fp16, unos 0,13 GB. El consumo real incluye activaciones y overhead del runtime, por lo que en la practica conviene reservar entre 0,5 y 1 GB.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para lotes pequenos.
- GPU de datacenter (A100, H100) no son necesarias; solo tendrian sentido para procesar volumenes muy elevados en paralelo.
- Opciones de despliegue: Hugging Face Transformers con `pipeline("text-classification")`, TorchServe, ONNX Runtime, o exportacion a otros runtimes. El autor solo documenta el uso via Transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el tamano del modelo, es esperable una latencia de milisegundos por muestra en GPU moderna y de decenas de milisegundos en CPU, pero no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy en `dair-ai/emotion` (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| charlottemddtc/distilbert-base-uncased-finetuned-emotion | 66,9 M | 128 tokens | 0,9220 | apache-2.0 | Hugging Face |
| TF-IDF + regresion logistica (baseline del autor) | no aplica | no aplica | 0,8815 | no aplica | reproducible |
| DistilBERT base sin fine-tuning | 66,9 M | 512 tokens (arquitectura) | 0,1360 | apache-2.0 | Hugging Face |
| Clase mayoritaria (baseline trivial) | no aplica | no aplica | 0,3475 | no aplica | reproducible |

No se dispone en la informacion proporcionada de resultados de otros modelos ajustados sobre el mismo dataset para una comparacion directa; los unicos puntos de referencia son las baselines declaradas por el autor.

## Limitaciones y advertencias

- Solo ingles: no se garantiza un comportamiento correcto con texto en castellano u otros idiomas.
- Dominio restringido a textos cortos tipo tweet; el rendimiento en documentos largos, lenguaje formal o dominios especializados (clinico, legal) no esta validado.
- Clases desequilibradas: `surprise` (F1 0,745) y `love` (F1 0,812) son las peores, con muy pocos ejemplos de soporte (66 y 159 respectivamente); las metricas en estas clases son menos fiables.
- Etiquetas ruidosas: el dataset original se anoto a partir de hashtags (supervision debil), lo que introduce errores sistematicos en el entrenamiento y en la evaluacion.
- Riesgo de alucinacion no aplica en sentido estricto (es clasificacion, no generacion), pero si existe riesgo de sobreconfianza en etiquetas incorrectas cuando el texto es ambiguo o ironico.
- Resultados no verificados de forma independiente (`verified: false` en el model-index); conviene reproducirlos antes de usarlos en produccion.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin comunidad, sin issues resueltos y sin garantias de mantenimiento.
- Licencia Apache 2.0: permite uso comercial, pero obliga a conservar el aviso de licencia y a indicar los cambios realizados.
- La model card esta redactada en frances, lo que puede dificultar la revision por parte de equipos que no lo lean.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/charlottemddtc/distilbert-base-uncased-finetuned-emotion
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Dataset de entrenamiento: https://huggingface.co/datasets/dair-ai/emotion
