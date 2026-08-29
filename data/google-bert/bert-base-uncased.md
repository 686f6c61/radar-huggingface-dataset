# google-bert/bert-base-uncased

## Resumen

BERT base uncased es un modelo de lenguaje basado en la arquitectura Transformer, desarrollado por Google AI Language y publicado en octubre de 2018. Fue uno de los primeros modelos en aplicar entrenamiento bidireccional mediante masked language modeling (MLM) y next sentence prediction (NSP), lo que le permite aprender representaciones contextuales del inglés. Con 110 millones de parámetros, está diseñado principalmente para ser fine-tuneado en tareas downstream como clasificación de secuencias, etiquetado de tokens o respuesta a preguntas. Su relevancia histórica es fundamental: estableció el paradigma de preentrenamiento + ajuste fino que dominó el procesamiento del lenguaje natural durante años y sigue siendo una referencia para evaluar modelos más modernos. El modelo es "uncased", es decir, no distingue entre mayúsculas y minúsculas, y elimina marcadores de acento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (12 capas, 12 cabezas de atencion, 768 dimensiones ocultas) |
| Parametros totales | 110.106.428 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens (limite estandar de BERT) |
| Tipos de cuantizacion | no disponible (soporta cuantizacion estandar via herramientas externas como ONNX Runtime o TensorRT) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, PyTorch, TensorFlow, JAX, ONNX, CoreML, Rust |

## Arquitectura y entrenamiento

BERT base es un modelo Transformer encoder con 12 capas, 12 cabezas de atencion y una dimension oculta de 768. Se entrena con dos objetivos simultaneos: masked language modeling, donde se enmascara el 15% de los tokens de entrada y el modelo debe predecirlos usando contexto bidireccional, y next sentence prediction, donde el modelo debe determinar si dos frases son consecutivas en el texto original. El entrenamiento se realizo sobre el corpus de BookCorpus (800 millones de palabras) y la Wikipedia en ingles (2.500 millones de palabras), sin etiquetado humano. No se aplicaron tecnicas de RLHF ni DPO, ya que el modelo es anterior a esas metodologias. La innovacion principal fue la atencion bidireccional, que permite capturar contexto de ambas direcciones, a diferencia de los modelos autoregresivos como GPT.

## Capacidades

- Relleno de mascaras (fill-mask): predice tokens enmascarados en una secuencia, util para tareas de comprension lectora.
- Extraccion de representaciones contextuales: genera embeddings de tokens y de secuencia que pueden usarse como caracteristicas para clasificadores externos.
- Fine-tuning para clasificacion de secuencias: permite entrenar un clasificador sobre la salida del token [CLS] para tareas como analisis de sentimiento o deteccion de spam.
- Fine-tuning para clasificacion de tokens: permite etiquetar cada token (por ejemplo, reconocimiento de entidades nombradas o etiquetado de partes de la oracion).
- Respuesta a preguntas: puede ajustarse para extraer respuestas de un contexto dado (SQuAD).
- Similitud de frases: puede usarse para calcular la similitud entre pares de oraciones mediante la representacion del token [CLS].
- No soporta generacion de texto autoregresiva, tool calling, agentes ni capacidades multimodales.

## Casos de uso

- Analisis de sentimiento en redes sociales: se puede fine-tunear con un corpus etiquetado de opiniones para clasificar comentarios como positivos, negativos o neutros. Su arquitectura bidireccional captura matices contextuales que mejoran la precision frente a modelos basados en bolsas de palabras.
- Reconocimiento de entidades nombradas (NER): fine-tuneado sobre datos etiquetados, puede extraer personas, organizaciones, lugares y fechas de documentos legales o medicos. Su representacion por token permite etiquetar cada palabra con su tipo de entidad.
- Sistema de respuesta a preguntas en dominios especificos: ajustado con datos de QA (por ejemplo, SQuAD), puede extraer respuestas literales de un parrafo de contexto. Es adecuado para asistentes virtuales que operan sobre documentacion interna.
- Clasificacion de documentos legales: fine-tuneado con categorias predefinidas, puede clasificar contratos, sentencias o escritos en funcion de su tipo. Su capacidad para procesar secuencias de hasta 512 tokens permite manejar parrafos completos.
- Busqueda semantica en corpus corporativos: usando los embeddings del token [CLS] o la media de los embeddings de tokens, se pueden indexar documentos y recuperar los mas relevantes por similitud coseno. Es una alternativa ligera a modelos de embedding dedicados.
- Deteccion de spam en correos electronicos: fine-tuneado con ejemplos de correos etiquetados, puede distinguir mensajes no deseados. Su bajo coste computacional permite desplegarlo en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper original de BERT reporta mejoras significativas en GLUE, SQuAD y SWAG, pero esos datos no estan incluidos en la informacion proporcionada. Se recomienda consultar el articulo original para obtener metricas detalladas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 440 MB en precision fp32, 220 MB en fp16 y 110 MB en int8 (estimacion basada en el numero de parametros).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Modelos como NVIDIA T4, GTX 1060, RTX 2060 o superiores pueden ejecutarlo sin problemas. Tambien funciona en CPU.
- Cabe en GPUs de consumo: si, en practicamente cualquier GPU moderna, incluso en Raspberry Pi con cuantizacion.
- Opciones de despliegue: se puede servir con Hugging Face Transformers, ONNX Runtime, TensorFlow Serving, TorchServe, o mediante frameworks como FastAPI. Para inferencia en CPU, se recomienda usar cuantizacion dinamica de PyTorch o ONNX.
- Latencia y throughput: no disponible en la informacion proporcionada, pero al ser un modelo de 110M, la latencia en GPU es del orden de milisegundos por secuencia corta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| bert-base-uncased | 110M | 512 | en | Apache 2.0 | Modelo original, uncased |
| bert-large-uncased | 340M | 512 | en | Apache 2.0 | Version grande, mayor capacidad pero mas lenta |
| roberta-base | 125M | 512 | en | MIT | Entrenado con mas datos y sin NSP, mejor rendimiento en varias tareas |
| distilbert-base-uncased | 66M | 512 | en | Apache 2.0 | Version destilada, 40% mas pequena y 60% mas rapida, con rendimiento cercano |

## Limitaciones y advertencias

- Sesgos conocidos: el modelo fue entrenado con datos de internet y libros, por lo que puede reflejar sesgos de genero, raza o religion presentes en esos corpus. La model card advierte que puede tener predicciones sesgadas.
- Riesgo de alucinacion: al ser un modelo encoder, no genera texto libre, por lo que el riesgo de alucinacion es bajo. Sin embargo, en tareas de relleno de mascaras puede producir predicciones incorrectas o incoherentes.
- Limitaciones de contexto: la ventana maxima es de 512 tokens, lo que impide procesar documentos largos de una sola vez. Para textos mas extensos se requiere truncamiento o estrategias de ventana deslizante.
- Limitaciones de idioma: solo soporta ingles. No es adecuado para textos en otros idiomas sin un modelo multilingue.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial sin restricciones, siempre que se mantenga el aviso de copyright.
- Caveat para produccion: el modelo no esta optimizado para generacion de texto; para tareas generativas se deben usar modelos autoregresivos como GPT-2 o T5.

## Enlaces

- [Hugging Face - google-bert/bert-base-uncased](https://huggingface.co/google-bert/bert-base-uncased)
- [Paper original (arXiv:1810.04805)](https://arxiv.org/abs/1810.04805)
- [Repositorio oficial en GitHub](https://github.com/google-research/bert)
- [Model card en Hugging Face](https://huggingface.co/google-bert/bert-base-uncased)
