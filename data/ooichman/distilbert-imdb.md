# ooichman/distilbert-imdb

## Resumen

distilbert-imdb es un ajuste fino (fine-tuning) del modelo DistilBERT base sin caja (uncased) sobre lo que el autor denomina el conjunto de datos IMDB, presumiblemente para clasificación binaria de sentimiento en resenas de peliculas. Lo desarrolla el usuario de HuggingFace ooichman y se publica bajo licencia Apache 2.0. El modelo se genero con la clase `Trainer` de la libreria Transformers y la model card es la plantilla automatica sin completar, por lo que la informacion sobre datos de entrenamiento, idiomas o uso previsto es practicamente inexistente.

Con 66.955.010 parametros (aproximadamente 67 millones), se trata de un encoder transformer compacto derivado de la destilacion de BERT base, disenado para inferencia rapida y con bajo coste computacional en tareas de clasificacion de texto. Su longitud de contexto efectiva queda limitada a 512 tokens, el maximo posicional de la familia BERT, y no incorpora capacidades generativas, de razonamiento ni de tool calling.

La relevancia de esta ficha es limitada: el modelo tiene cero descargas y cero likes en el momento de la consulta, no declara resultados de benchmarks (la lista `results` del model-index esta vacia) y su model card no documenta el dataset, las metricas ni las limitaciones. Debe tratarse como un experimento de ajuste fino reproducible mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT base) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (maximo posicional de la familia BERT; no declarado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion dinamica INT8 posible via PyTorch, no documentada por el autor) |
| Idiomas soportados | no disponible (el modelo base es uncased en ingles; el autor no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0.3 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo DistilBERT: 6 capas, 12 cabezas de atencion y dimension oculta de 768, con un total de 66,9 millones de parametros, incluyendo la cabeza de clasificacion sobre las dos clases de salida (`num_labels=2`, inferido de la tarea de sentimiento). DistilBERT se obtuvo originalmente mediante destilacion por conocimiento de BERT base, conservando aproximadamente el 97 % del rendimiento de este con un 40 % menos de parametros y un 60 % mas de velocidad segun la literatura original; esta ficha no verifica esos datos, que corresponden al modelo base.

El entrenamiento se realizo con `Trainer` de Transformers 5.0.0.dev0, PyTorch 2.9.0+cu126, Datasets 4.3.0 y Tokenizers 0.22.1, con optimizador AdamW fused (betas 0,9 y 0,999, epsilon 1e-8), learning rate 2e-5, scheduler lineal, batch de entrenamiento de 16, batch de evaluacion de 8, semilla 42 y 3 epocas. El registro muestra 189 pasos totales (63 por epoca), lo que implica un conjunto de entrenamiento de aproximadamente 1000 ejemplos con ese batch, un tamano muy reducido para IMDB (que tiene 25.000 ejemplos de entrenamiento en su version estandar). La perdida de validacion evoluciono de 0,3767 (epoca 1) a 0,3381 (epoca 2) y 0,3553 (epoca 3), con un minimo en la segunda epoca y un ligero sobreajuste en la tercera. No se documenta el dataset exacto, ni si hubo aumentacion de datos, ni el esquema de particion train/validation.

## Capacidades

- Clasificacion de texto binaria: la cabeza de salida produce dos logits, presumiblemente negativo/positivo, adecuada para analisis de sentimiento.
- Analisis de sentimiento en resenas: es el uso implicito del nombre del modelo (IMDB), aunque el autor no lo confirma en la model card.
- Inferencia rapida en CPU: con 67 millones de parametros, el modelo es viable en entornos sin GPU.
- Procesamiento de secuencias de hasta 512 tokens, suficiente para resenas de una o dos paginas.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues no disponibles: el tokenizador base es uncased y de vocabulario ingles (WordPiece, 30.522 tokens), sin evidencia de entrenamiento en otros idiomas.
- No dispone de modo thinking, vision, audio ni ninguna capacidad multimodal.

## Casos de uso

- Clasificacion de resenas de productos o peliculas en pipelines de moderacion: el modelo puede etiquetar cada resena como positiva o negativa en una sola pasada; su tamano reducido permite procesar lotes grandes en CPU, aunque la falta de metricas publicadas obliga a validarlo antes con un conjunto propio.
- Filtrado previo de feedback de usuarios: en una cola de soporte, clasificar rapidamente el tono de los mensajes para enrutar los negativos a agentes humanos; los 512 tokens cubren la mayoria de mensajes de soporte.
- Etiquetado semiautomatico de corpus: usar el modelo como preetiquetador en un flujo de anotacion humana, revisando solo los casos de baja confianza; su velocidad (encoder de 6 capas) lo hace adecuado para volumentes medios.
- Monitorizacion de reputacion de marca: analisis por lotes de menciones o resenas recopiladas de fuentes publicas, con agregacion diaria de la proporcion de sentimiento negativo.
- Prototipado rapido de clasificadores de sentimiento: como linea base en experimentos academicos o demos, dado que se carga con `pipeline("text-classification")` de Transformers en pocas lineas.
- Deteccion de resenas toxicas o abusivas como tarea auxiliar: si se reajusta la cabeza de clasificacion, el encoder puede servir de base para clasificacion de toxicidad, aunque el ajuste actual solo distingue dos clases de sentimiento.
- Extraccion de caracteristicas para clustering: los embeddings del encoder (768 dimensiones) pueden alimentar modelos de topic modeling o busqueda semantica de resenas, aunque para ello es preferible el modelo base sin ajustar.

## Benchmarks y rendimiento

El model-index del autor declara una lista de resultados vacia. La unica metrica publicada es la perdida de validacion durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Validation loss (epoca 1) | 0,3767 |
| Validation loss (epoca 2) | 0,3381 |
| Validation loss (epoca 3) | 0,3553 |
| Precision, recall, F1, accuracy | no disponibles |

No se han publicado resultados de benchmarks (MMLU, GLUE, SST-2, etc.) en la informacion disponible, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 270 MB para los pesos (67 M parametros x 4 bytes), mas activaciones; en la practica cabe en cualquier GPU con 1 GB o mas.
- VRAM estimada en FP16: aproximadamente 135 MB para los pesos.
- Cuantizacion INT8 dinamica: aproximadamente 67 MB, viable en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU para lotes pequenos. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es sobredimensionada para este modelo.
- Cabe en GPU consumer y en entornos sin GPU (Raspberry Pi, contenedores ligeros, funciones serverless).
- Opciones de despliegue: `transformers` pipeline, `text-classification`; exportacion a ONNX Runtime para latencia baja en CPU; TorchServe o FastAPI para servicio HTTP. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama requeririan conversion manual.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera del orden de milisegundos por secuencia corta en CPU moderna, pero no hay mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ooichman/distilbert-imdb | 66,9 M | 512 tokens | Clasificacion binaria (sentimiento) | Apache 2.0 | HuggingFace, 0 descargas |
| distilbert-base-uncased-finetuned-sst-2-english | 66,9 M | 512 tokens | Clasificacion binaria (sentimiento) | Apache 2.0 | HuggingFace, ampliamente usado |
| textattack/bert-base-uncased-imdb | 109 M | 512 tokens | Clasificacion binaria (sentimiento IMDB) | Apache 2.0 | HuggingFace, con metricas publicadas |
| roberta-base | 125 M | 512 tokens | Encoder general (requiere ajuste) | MIT | HuggingFace |

La comparacion directa con el checkpoint oficial de DistilBERT ajustado en SST-2 es la mas pertinente por tamano y arquitectura identicos; sin embargo, aquel declara metricas de evaluacion y este no. Frente a `textattack/bert-base-uncased-imdb`, el modelo de esta ficha tiene un 40 % menos de parametros pero carece de resultados publicados que permitan afirmar paridad de rendimiento.

## Limitaciones y advertencias

- La model card es la plantilla automatica de `Trainer` sin completar: no documenta el dataset, el uso previsto, los idiomas ni las limitaciones.
- No se publican metricas de evaluacion (accuracy, F1, precision, recall); solo la perdida de validacion, insuficiente para estimar el rendimiento real.
- El conjunto de entrenamiento parece muy reducido (aproximadamente 1000 ejemplos segun los 189 pasos con batch 16), lo que sugiere alto riesgo de sobreajuste y de generalizacion pobre fuera del dominio de entrenamiento.
- El modelo base es uncased y de vocabulario ingles; el rendimiento en castellano u otros idiomas no esta evaluado y probablemente sea deficiente.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de clasificaciones erroneas con alta confianza en textos fuera de distribucion (sarcasmo, negaciones complejas, resenas largas mas alla de 512 tokens).
- Sesgos inheridos del corpus de resenas de IMDB (predominio de ingles, dominio cinematografico) y del modelo base; no se documenta ninguna mitigacion.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validacion tecnica hace desaconsejable su despliegue en produccion sin una evaluacion propia.
- El modelo se creo con una version de desarrollo de Transformers (5.0.0.dev0); la compatibilidad con versiones estables no esta garantizada.
- Cero descargas y cero likes: no hay evidencia de uso por terceros ni de validacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ooichman/distilbert-imdb
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Documentacion de DistilBERT en Transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
- Dataset IMDB en HuggingFace: https://huggingface.co/datasets/imdb
