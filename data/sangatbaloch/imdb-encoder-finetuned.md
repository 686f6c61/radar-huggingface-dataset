# sangatbaloch/imdb-encoder-finetuned

## Resumen

El modelo `sangatbaloch/imdb-encoder-finetuned` es un clasificador binario de sentimiento en ingles construido mediante fine-tuning de `distilbert-base-uncased` sobre un subconjunto estratificado del dataset IMDb (resenas de cine). Lo desarrolla el usuario de Hugging Face sangatbaloch y resuelve una tarea concreta y acotada: asignar la etiqueta `negative` (0) o `positive` (1) a un texto de resena. No es un modelo generativo ni un chat model, sino un encoder bidireccional con una cabeza de clasificacion supervisada.

La relevancia de esta publicacion es limitada y de caracter educativo: se trata de un experimento de fine-tuning sobre 4.000 ejemplos de entrenamiento, no de un benchmark completo de IMDb (que contiene 25.000 ejemplos de entrenamiento y 25.000 de test). El autor lo declara explicitamente como tal. Con 66.955.010 parametros, el modelo es ligero y desplegable en CPU, lo que lo hace util como referencia de pipeline de clasificacion mas que como modelo de produccion.

Arquitectura DistilBERT (transformer encoder de 6 capas, destilado de BERT-base), contexto de 512 tokens y soporte exclusivo de ingles. La licencia no esta declarada en la model card ni en los metadatos del repositorio, lo que constituye una limitacion relevante para cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (DistilBERT, destilado de BERT-base) con cabeza de clasificacion |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (limite arquitectonico de DistilBERT); el fine-tuning se realizo con max_length 256 |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion dinamica de PyTorch y ONNX, no documentada por el autor) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dataset de entrenamiento | stanfordnlp/imdb (subconjunto estratificado: 4.000 train, 1.000 validacion, 1.000 test) |
| Etiquetas | negative=0, positive=1 |
| Tamano del repositorio | 0,3 GB |
| Libreria | transformers |
| Pipeline | text-classification |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un transformer encoder de 6 capas y 66 millones de parametros obtenido por destilacion de BERT-base (12 capas, 110 millones). Sobre esa base se anade una cabeza de clasificacion lineal para dos clases. DistilBERT reduce el coste computacional aproximadamente a la mitad respecto a BERT-base manteniendo buena parte de su rendimiento en tareas de comprension, lo que explica su uso habitual en clasificacion de texto con requisitos de latencia bajos.

El fine-tuning se realizo sobre subconjuntos estratificados de IMDb con semilla 42: 4.000 ejemplos de entrenamiento, 1.000 de validacion y 1.000 de test oficial. Hiperparametros declarados: 2 epocas, learning rate 2e-5, weight decay 0,01, batch efectivo 16 y longitud maxima de 256 tokens. La seleccion del checkpoint se hizo por mejor F1 en validacion, sin usar el test para seleccionar. No se documenta el uso de RLHF, DPO ni tecnicas de aumentacion de datos. La innovacion tecnica es nula: es un fine-tuning estandar de Hugging Face Trainer sobre un encoder preentrenado.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) en textos en ingles.
- Procesamiento de entradas de hasta 512 tokens a nivel arquitectonico, aunque el modelo fue ajustado con secuencias de 256 tokens.
- Inferencia por lotes con throughput medido de 391,75 muestras por segundo en el conjunto de test (hardware no especificado).
- Compatible con `text-embeddings-inference` y con `endpoints_compatible` segun los tags del repositorio, lo que permite despliegue como endpoint de clasificacion.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- No es un modelo generativo: no produce texto libre, solo una etiqueta y, opcionalmente, la distribucion de probabilidad sobre las dos clases.

## Casos de uso

- Moderacion de resenas de productos o contenidos: el modelo puede etiquetar rapidamente resenas en ingles como positivas o negativas para priorizar revision humana de las negativas. Su tamano (67 M de parametros) permite procesar volumenes altos en CPU.
- Analisis de opinion a escala en pipelines de datos: clasificacion por lotes de resenas de cine o de productos con throughput medido de unas 392 muestras por segundo, util para agregar sentimiento por producto o por periodo.
- Filtrado previo en sistemas de recomendacion: usar la etiqueta de sentimiento como senal adicional para reordenar o descartar resenas antes de pasarlas a un modelo generativo o a un sistema de ranking.
- Enrutamiento en atencion al cliente: clasificar el tono de mensajes o encuestas de satisfaccion en ingles para dirigir los casos negativos a un equipo especializado.
- Prototipado y docencia: el modelo sirve como ejemplo reproducible de fine-tuning de DistilBERT con un subconjunto estratificado, util para cursos o tutoriales de NLP.
- Baseline en experimentos de investigacion: referencia ligera para comparar tecnicas de clasificacion de sentimiento antes de escalar a modelos mayores o a datasets completos.
- Clasificacion en entornos con recursos limitados: al caber en CPU y en GPUs de consumo, puede desplegarse en dispositivos edge o en contenedores sin GPU para tareas de etiquetado en tiempo casi real.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre el subconjunto de test de 1.000 ejemplos:

| Metrica | Valor |
|---|---|
| Test loss | 0,2694 |
| Test accuracy | 0,899 |
| Test precision (positivo) | 0,9113 |
| Test recall (positivo) | 0,8840 |
| Test F1 (positivo) | 0,8975 |
| Muestras por segundo | 391,75 |
| Pasos por segundo | 48,97 |
| Matriz de confusion (filas=real, columnas=predicho) | [[457, 43], [58, 442]] |

No se han publicado comparaciones con otros modelos en la informacion disponible. Los resultados corresponden a un subconjunto de 1.000 ejemplos y no son directamente comparables con el benchmark completo de IMDb (25.000 ejemplos de test), donde los modelos de referencia suelen superar el 93-95 % de accuracy.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,27 GB solo para pesos (67 M de parametros x 4 bytes), mas activaciones; en la practica cabe en cualquier GPU con 1 GB o mas.
- VRAM estimada en FP16: aproximadamente 0,13 GB para pesos.
- Cabe en GPU de consumo: si, en cualquier RTX (incluso series GTX 10xx), en GPUs integradas modernas y en CPU.
- GPU recomendadas: no requiere GPU dedicada; para alto throughput, una T4, L4 o RTX 4090 ofrecen margen de sobra. En CPU, el throughput medido de 392 muestras/s sugiere que es viable para produccion ligera.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, `text-embeddings-inference` (segun tags), Hugging Face Inference Endpoints, exportacion a ONNX Runtime o TorchScript para optimizacion.
- Latencia y throughput: 391,75 muestras/s y 48,97 pasos/s en el conjunto de test (hardware no especificado en la model card).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Rendimiento en IMDb |
|---|---|---|---|---|---|
| sangatbaloch/imdb-encoder-finetuned | 67 M | 512 | en | no disponible | 89,9 % accuracy en subconjunto de 1.000 ejemplos |
| distilbert-base-uncased-finetuned-sst-2-english | 67 M | 512 | en | Apache 2.0 | No disponible en IMDb; entrenado en SST-2 |
| bert-base-uncased (fine-tuned en IMDb, referencia habitual) | 110 M | 512 | en | Apache 2.0 | No disponible en la informacion proporcionada |
| roberta-base (fine-tuned en IMDb, referencia habitual) | 125 M | 512 | en | MIT | No disponible en la informacion proporcionada |

La comparacion directa no es posible con rigor porque el autor no publica resultados sobre el test completo de IMDb ni compara con alternativas. Las licencias de los modelos de referencia (Apache 2.0, MIT) si estan declaradas, a diferencia de este modelo.

## Limitaciones y advertencias

- El propio autor indica que es un experimento educativo sobre un subconjunto, no un benchmark completo de IMDb; los resultados no deben extrapolarse al dataset completo.
- Solo admite ingles; cualquier texto en otro idioma producira predicciones sin garantia.
- El truncamiento a 256 tokens durante el entrenamiento (y a 512 en arquitectura) puede perder informacion en resenas largas y sesgar la prediccion.
- La confianza del modelo no esta calibrada: las probabilidades de salida no deben interpretarse como probabilidades reales sin post-procesado (temperature scaling, isotonic regression).
- Sensible a sarcasmo, ironia y cambios de dominio (por ejemplo, resenas de productos en lugar de cine).
- Riesgo de alucinacion no aplica en el sentido generativo, pero si de falsos positivos y falsos negativos: la matriz de confusion muestra 43 falsos negativos y 58 falsos positivos sobre 1.000 ejemplos.
- Licencia no declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor o tratar el modelo como no licenciado para produccion.
- Sin mantenimiento ni versionado documentado: creado y actualizado el mismo dia (2026-11-01), con 0 descargas y 0 likes, lo que indica ausencia de validacion por la comunidad.
- No apto para tareas generativas, de razonamiento, tool calling ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sangatbaloch/imdb-encoder-finetuned
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset: https://huggingface.co/datasets/stanfordnlp/imdb
- Paper de DistilBERT: https://arxiv.org/abs/1910.01108
- Paper de BERT: https://arxiv.org/abs/1810.04805
