# abd87/gpt2-roman-urdu-sentiment

## Resumen

`abd87/gpt2-roman-urdu-sentiment` es un modelo de clasificación de sentimiento en tres clases (negativo, neutro, positivo) para texto en roman urdu, la variante del urdu escrita con alfabeto latino que se usa de forma masiva en redes sociales y mensajeria en Pakistan. Lo desarrolla el usuario de Hugging Face `abd87` y parte del checkpoint `openai-community/gpt2` (124 millones de parametros), al que se le anade una cabeza de clasificacion de secuencia sobre el estado oculto del ultimo token no de padding.

El modelo es relevante como referencia practica de un caso muy concreto: adaptar un transformer decoder-only entrenado mayoritariamente en ingles a una tarea discriminativa sobre una lengua de bajos recursos y con ortografia no estandarizada. Su interes no esta en el rendimiento absoluto, sino en documentar el comportamiento de GPT-2 frente a una alternativa encoder-only (BERT) en el mismo split de datos.

La ficha se basa exclusivamente en la informacion disponible en la model card y en los metadatos del repositorio. El autor reporta una precision de 0,623 y un macro-F1 de 0,610 en el conjunto de test, ligeramente por debajo de BERT (0,644 y 0,632) sobre el mismo split.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (GPT-2) con cabeza de clasificacion de secuencia lineal |
| Parametros totales | 124.442.112 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (longitud maxima usada en el fine-tuning; GPT-2 soporta hasta 1024 posiciones) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en fp32/fp16) |
| Idiomas soportados | ur (roman urdu, urdu en alfabeto latino) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GPT-2 es un transformer decoder-only con atencion causal de izquierda a derecha, 12 capas, 12 cabezas de atencion y 768 dimensiones ocultas, con embeddings posicionales aprendidos. Para la tarea de clasificacion se descarta la cabeza de lenguaje y se toma el estado oculto del ultimo token no padding, que se pasa por una capa lineal de tres salidas. El modelo parte de los pesos preentrenados de `openai-community/gpt2` y se ajusta de forma supervisada.

El fine-tuning se realizo sobre `community-datasets/roman_urdu`, un corpus de aproximadamente 20.000 frases con split estratificado 80/10/10 (train/val/test), identico al empleado para el modelo BERT de comparacion. La configuracion reportada es de 3 epocas, learning rate 5e-05, batch size 16, longitud maxima 128, optimizador AdamW y precision mixta fp16. No se documenta uso de RLHF, DPO ni tecnicas de alineacion adicionales, ni se detalla la composicion exacta del dataset mas alla del numero de frases.

## Capacidades

- Clasificacion de sentimiento en tres clases (negativo, neutro, positivo) sobre texto en roman urdu.
- Inferencia a nivel de frase o parrafo corto, con truncado a 128 tokens.
- Aprovecha el preentrenamiento multilingue parcial de GPT-2 para representar texto latino no estandarizado.
- No soporta generacion de texto util: la cabeza de lenguaje original se sustituye por la de clasificacion.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue limitada al roman urdu; no se reporta evaluacion en otros idiomas.

## Casos de uso

- Monitorizacion de redes sociales en roman urdu: clasificar comentarios y publicaciones de plataformas como Twitter/X o Facebook en negativas, neutras y positivas para paneles de reputacion de marca, con la ventaja de que el modelo esta entrenado sobre la variante ortografica que realmente aparece en esos textos.
- Analisis de resenas de producto en comercio electronico pakistani: procesar opiniones escritas en alfabeto latino en tiendas como Daraz y agregar el sentimiento por producto o vendedor, sin necesidad de transliterar a urdu nativo.
- Triaje de atencion al cliente: clasificar mensajes entrantes de chat y derivar automaticamente los negativos a un agente humano y los neutros a respuestas automaticas, aprovechando la baja latencia de un modelo de 124 millones de parametros.
- Investigacion en procesamiento de lenguas de bajos recursos: servir como linea base reproducible frente a BERT u otros encoders en experimentos de clasificacion de roman urdu, dado que el autor documenta el split y los hiperparametros exactos.
- Etiquetado asistido de corpus: preanotar grandes volumenes de texto en roman urdu con sentimiento y reservar la revision humana para los casos de baja confianza, reduciendo el coste de construccion de datasets anotados.
- Moderacion de comunidades y foros: detectar de forma temprana mensajes con carga negativa en foros y grupos de mensajeria donde el roman urdu es la norma escrita, como senal complementaria a filtros lexicos.
- Despliegue en entornos con recursos limitados: al ocupar aproximadamente 0,5 GB en fp32, puede ejecutarse en CPU o en GPUs de gama baja dentro de un servicio de clasificacion por lotes.

## Benchmarks y rendimiento

Resultados reportados por el autor en el conjunto de test de `community-datasets/roman_urdu`:

| Modelo | Arquitectura | Accuracy | Macro-F1 |
|---|---|---|---|
| gpt2-roman-urdu-sentiment | Decoder-only (GPT-2, 124M) | 0,623 | 0,610 |
| BERT de comparacion | Encoder-only | 0,644 | 0,632 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32, unos 0,25 GB en fp16 y del orden de 0,13-0,15 GB en cuantizacion de 8 bits o 4 bits (estimacion a partir de los 124,4 millones de parametros; el autor no publica pesos cuantizados).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; una T4, L4, RTX 3060 o superior deja margen de sobra para lotes grandes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada de los ultimos diez anos, e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`, `TextClassificationPipeline`, exportacion a ONNX Runtime y servidores de inferencia tipo TorchServe o BentoML. La publicacion de pesos GGUF para llama.cpp u Ollama no esta disponible en el repositorio.
- Latencia y throughput: no se publican mediciones. Por el tamano del modelo, se espera latencia de milisegundos por secuencia corta en GPU moderna, pero se trata de una estimacion no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy / Macro-F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt2-roman-urdu-sentiment | 124M | 128 tokens (fine-tuning) | 0,623 / 0,610 | MIT | Hugging Face, 0 descargas |
| BERT de comparacion del autor | no disponible | no disponible | 0,644 / 0,632 | no disponible | Referenciado en la model card, sin identificador publico |
| openai-community/gpt2 (base) | 124M | 1024 tokens | no aplica (modelo de lenguaje) | MIT | Hugging Face, ampliamente utilizado |

El autor no identifica otros modelos de sentimiento en roman urdu comparables, por lo que la comparativa se limita al BERT citado en la model card y al checkpoint base.

## Limitaciones y advertencias

- GPT-2 se preentreno mayoritariamente con texto en ingles, por lo que las variaciones ortograficas y el argot del roman urdu pueden clasificarse de forma incorrecta, tal como advierte el propio autor.
- El rendimiento absoluto es moderado (accuracy 0,623 en tres clases, frente a un azar de 0,333), lo que deja un margen amplio de error para uso en produccion sin revision humana.
- El modelo queda por debajo del BERT de comparacion en el mismo split, lo que sugiere que la arquitectura decoder-only no aporta ventaja en esta tarea discriminativa.
- El corpus de entrenamiento es pequeno (unas 20.000 frases) y no se detalla su composicion, dominio ni proceso de anotacion, lo que impide evaluar sesgos de dominio o de etiquetado.
- El truncado a 128 tokens descarta informacion en textos largos; reseñas o hilos extensos pueden perder la parte final del mensaje.
- Riesgo de alucinacion no aplica en sentido estricto al ser un clasificador, pero si existe riesgo de sobreconfianza en las probabilidades de salida.
- La licencia MIT permite uso comercial sin restricciones adicionales, aunque el modelo hereda las consideraciones de los datos de preentrenamiento de GPT-2.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- No se publican pesos cuantizados ni artefactos de despliegue listos para produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abd87/gpt2-roman-urdu-sentiment
- Modelo base: https://huggingface.co/openai-community/gpt2
- Dataset utilizado: https://huggingface.co/datasets/community-datasets/roman_urdu
- Paper de GPT-2 (Language Models are Unsupervised Multitask Learners): no disponible como enlace en la informacion proporcionada
- Repositorio de codigo, demo o blog del autor: no disponible en la informacion proporcionada
