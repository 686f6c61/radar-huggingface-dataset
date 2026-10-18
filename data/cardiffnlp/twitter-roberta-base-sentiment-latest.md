# cardiffnlp/twitter-roberta-base-sentiment-latest

## Resumen

`cardiffnlp/twitter-roberta-base-sentiment-latest` es un clasificador de sentimiento en tres clases (negativo, neutro, positivo) desarrollado por el grupo CardiffNLP de la Universidad de Cardiff. Se construye sobre RoBERTa-base, un transformer encoder de aproximadamente 125 millones de parametros, y se afina sobre el benchmark TweetEval para clasificacion de sentimiento en ingles. Forma parte de la familia TimeLMs, un conjunto de modelos entrenados de forma diacronica sobre tuits para capturar la evolucion del lenguaje en redes sociales.

El modelo resuelve un problema muy concreto y de alta demanda en produccion: asignar una polaridad a textos cortos, informales y ruidosos (tuits, comentarios, resenas breves) donde los modelos entrenados en dominios formales rinden peor. La version "latest" se entrena sobre aproximadamente 124 millones de tuits publicados entre enero de 2018 y diciembre de 2021, lo que la actualiza respecto a la version original de 2019.

Su relevancia practica es enorme: con casi 2,5 millones de descargas en HuggingFace y 848 likes, es uno de los clasificadores de sentimiento de referencia para monitorizacion de redes sociales, analisis de opinion y filtrado de contenido. Es un modelo pequeno, ligero, desplegable en CPU, con licencia CC-BY-4.0 que permite uso comercial con atribucion, e integrado en el ecosistema TweetNLP. No es un modelo generativo: no conversa, no razona y no soporta tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base) con cabeza de clasificacion de secuencias (3 etiquetas) |
| Parametros totales | Aproximadamente 125 millones (RoBERTa-base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (limite habitual de RoBERTa-base; el modelo no documenta un valor distinto) |
| Tipos de cuantizacion | No disponible en la model card; al ser un encoder de ~125M es cuantificable a INT8/ONNX en la practica |
| Idiomas soportados | Ingles unicamente (`language: en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (`pytorch_model.bin`) y TensorFlow (`tf_model.h5`); repositorio de 2,0 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo RoBERTa-base: 12 capas, atencion multi-cabeza completa y embeddings posicionales absolutos, sin componente decoder. Sobre la representacion del token especial `<s>` se anade una cabeza lineal de clasificacion con tres salidas (0 = negativo, 1 = neutro, 2 = positivo), entrenada con entropia cruzada.

El preentrenamiento se realizo sobre aproximadamente 124 millones de tuits recolectados entre enero de 2018 y diciembre de 2021 (modelo base `twitter-roberta-base-2021-124m`), y el ajuste fino se hizo con el benchmark TweetEval para la tarea de sentimiento. La model card no documenta el numero exacto de tokens de preentrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO; en un encoder clasificador estos pasos no son habituales. La innovacion metodologica destacable es el enfoque diacronico de TimeLMs: reentrenar periodicamente el modelo base con datos recientes para reducir el desajuste temporal respecto al vocabulario y las expresiones de cada epoca.

## Capacidades

- Clasificacion de sentimiento en tres clases con puntuaciones de probabilidad por clase (softmax sobre los logits).
- Procesamiento de texto corto e informal propio de redes sociales, incluidos hashtags, menciones y jerga.
- Clasificacion de un unico texto por pasada; no es un modelo generativo ni mantiene conversacion.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni cadena de pensamiento.
- Multilingue: no. Solo ingles.
- Capacidades especiales: ninguna adicional (sin vision, sin audio, sin modo thinking). Requiere preprocesado propio del autor: sustituir menciones por `@user` y URLs por `http`.

## Casos de uso

- Monitorizacion de marca en redes sociales: clasificar en tiempo real el flujo de menciones de una empresa y agregar el porcentaje de sentimiento negativo por hora o por campana, con coste de inferencia minimo gracias al tamano del modelo.
- Analisis de opinion sobre productos: procesar resenas cortas y comentarios de foros para generar un indice de satisfaccion ponderado, aplicando el preprocesado de menciones y URLs incluido en la model card.
- Moderacion y triaje de contenido: priorizar comentarios con polaridad negativa alta para revision humana, usando la puntuacion de confianza como criterio de umbral.
- Investigacion en ciencias sociales y linguistica computacional: analisis diacronico de discurso publico en Twitter dentro de la linea de trabajo TimeLMs, comparando la evolucion del sentimiento entre periodos.
- Enrutamiento en atencion al cliente: enviar automaticamente los mensajes de clientes con sentimiento negativo a un agente humano o a una cola prioritaria.
- Senal auxiliar en pipelines de NLP: usar la salida del clasificador como feature adicional en un sistema de deteccion de quejas, prediccion de churn o analisis de crisis reputacional.
- Analisis electoral y de politica publica: medir la reaccion emocional en redes ante anuncios o eventos concretos, con las cautelas metodologicas propias del sesgo de la plataforma.

## Benchmarks y rendimiento

La model card no publica resultados numericos de evaluacion en la informacion disponible. El modelo se evalua sobre el benchmark TweetEval (tarea de sentimiento), y los resultados de referencia se encuentran en el repositorio de TweetEval, no en la ficha del modelo.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del tamano): ~500 MB en FP32, ~250 MB en FP16, ~150 MB en INT8.
- GPU recomendadas: cualquier GPU, incluso integrada o de gama baja. Una T4, L4 o RTX 3060 es mas que suficiente para alta concurrencia.
- Cabe en GPU de consumo: si, en cualquier GPU consumer moderna (RTX 2060 o superior) e incluso en Raspberry Pi o CPU con `onnxruntime`.
- Opciones de despliegue: HuggingFace `transformers` con pipeline `text-classification`, TensorFlow via `TFAutoModelForSequenceClassification`, exportacion a ONNX, TorchScript, y servicio con Text Embeddings Inference o FastAPI + batching. Tambien disponible en Azure AI (tag `deploy:azure`) y con `endpoints_compatible`.
- Latencia y throughput: no se publican cifras oficiales. Por el tamano del modelo, la inferencia en GPU se sitúa en el orden de milisegundos por lote pequeno en FP16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| `cardiffnlp/twitter-roberta-base-sentiment-latest` | ~125M | 512 | Sentimiento 3 clases (en) | CC-BY-4.0 | Entrenado con tuits 2018-2021 |
| `cardiffnlp/twitter-roberta-base-sentiment` (version previa) | ~125M | 512 | Sentimiento 3 clases (en) | CC-BY-4.0 | Modelo anterior de CardiffNLP; datos de preentrenamiento mas antiguos (no confirmado en detalle) |
| `cardiffnlp/twitter-roberta-large-sentiment-latest` | ~355M (RoBERTa-large) | 512 | Sentimiento 3 clases (en) | CC-BY-4.0 | Variante de mayor tamano del mismo autor; mejora potencial a mayor coste |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66M | 512 | Sentimiento 2 clases (en) | Apache-2.0 | Dominio formal (SST-2); no especializado en redes sociales |

Los datos de rendimiento comparativo (macro-F1 en TweetEval) no estan disponibles en la informacion proporcionada para ninguna de estas variantes.

## Limitaciones y advertencias

- Solo ingles: cualquier texto en castellano u otros idiomas producira salidas poco fiables.
- Dominio muy especifico: entrenado con tuits; su rendimiento en textos formales, legales o literarios puede degradarse.
- Sesgo de plataforma: el corpus de Twitter sobrerrepresenta determinados perfiles demograficos, temas y estilos, lo que introduce sesgos sistematicos en la polaridad detectada.
- Riesgo de clasificacion erronea en ironia, sarcasmo y negaciones complejas; el modelo no modela contexto conversacional ni historial.
- Limite de 512 tokens: textos mas largos se truncan, con perdida de informacion.
- Riesgo de alucinacion: no aplica en sentido generativo, pero las puntuaciones de confianza pueden ser altas en predicciones incorrectas; conviene calibrar umbrales con datos propios.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribucion al autor y compartir la licencia; revisar los terminos de los datos de origen (tuits) para usos derivados.
- La salida de tres clases puede no encajar en taxonomias corporativas mas finas (emociones, intencion, urgencia); requerira mapeo o ajuste fino adicional.
- No debe usarse como unico criterio en decisiones que afecten a personas (moderacion, credito, empleo) sin supervision humana.

## Enlaces

- HuggingFace: https://huggingface.co/cardiffnlp/twitter-roberta-base-sentiment-latest
- Modelo base de Twitter: https://huggingface.co/cardiffnlp/twitter-roberta-base-2021-124m
- Paper TimeLMs (arXiv): https://arxiv.org/abs/2202.03829
- Repositorio TimeLMs: https://github.com/cardiffnlp/timelms
- Repositorio TweetEval: https://github.com/cardiffnlp/tweeteval
- Repositorio TweetNLP: https://github.com/cardiffnlp/tweetnlp
- Demo TweetNLP: https://tweetnlp.org
- Paper TweetNLP (EMNLP 2022 Demo): https://aclanthology.org/2022.emnlp-demos.5
- Paper TimeLMs (ACL 2022 Demo): https://aclanthology.org/2022.acl-demo.25
