# distilbert/distilbert-base-uncased

## Resumen

DistilBERT es un modelo de lenguaje basado en la arquitectura transformer, desarrollado por Hugging Face como una versión destilada de BERT base. El objetivo principal es reducir el tamaño y acelerar la inferencia manteniendo la mayor parte del rendimiento del modelo original, lo que lo hace especialmente útil para entornos con recursos limitados o aplicaciones en tiempo real. Se entrena con los mismos corpus que BERT (BookCorpus y Wikipedia) mediante un proceso de destilación que combina tres objetivos: pérdida de destilación, modelado de lenguaje enmascarado y pérdida de coseno para alinear las representaciones internas con el profesor.

Con 66,9 millones de parámetros, DistilBERT es aproximadamente un 40% más pequeño que BERT base (110 millones) y, según el paper original, es un 60% más rápido en inferencia. Está diseñado principalmente para ser ajustado en tareas downstream como clasificación de secuencias, clasificación de tokens o respuesta a preguntas, aunque también puede usarse directamente para completar máscaras. Es un modelo monolingüe en inglés y no está pensado para generación de texto libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (basado en BERT) |
| Parametros totales | 66.985.530 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, PyTorch, TensorFlow, JAX, Rust |

## Arquitectura y entrenamiento

DistilBERT sigue la arquitectura de BERT base, un transformer encoder con 6 capas (frente a las 12 de BERT), 12 cabezas de atencion y una dimension oculta de 768. El proceso de destilacion utiliza BERT base como modelo profesor y entrena al alumno con tres funciones de perdida: la perdida de destilacion (que alinea las distribuciones de probabilidad del profesor y el alumno), la perdida de modelado de lenguaje enmascarado (MLM) y una perdida de embedding coseno para acercar las representaciones ocultas. El entrenamiento se realiza sobre los corpus BookCorpus y Wikipedia, los mismos que uso BERT, con un total de tokens no especificado en la informacion disponible. No se menciona el uso de RLHF ni DPO; el entrenamiento es puramente autosupervisado con destilacion.

## Capacidades

- Completar mascaras en texto (fill-mask), prediciendo la palabra mas probable en una posicion enmascarada.
- Extraccion de embeddings contextuales para representar frases o documentos.
- Ajuste fino (fine-tuning) para tareas de clasificacion de secuencias, clasificacion de tokens y respuesta a preguntas extractivas.
- Soporte para multiples frameworks: PyTorch, TensorFlow, JAX y Rust (via tokenizers).
- Capacidad de procesamiento de texto en ingles, sin distincion de mayusculas (uncased).
- No soporta generacion de texto autoregresiva, tool calling, ni capacidades multimodales.

## Casos de uso

- Analisis de sentimiento en redes sociales: se puede ajustar el modelo con un dataset etiquetado de opiniones para clasificar comentarios como positivos, negativos o neutros. Su tamano reducido permite desplegarlo en entornos con poca memoria, como funciones serverless o dispositivos edge.
- Clasificacion de documentos legales: tras un fine-tuning con categorias predefinidas, DistilBERT puede asignar etiquetas a contratos o sentencias, agilizando la gestion documental en despachos y empresas.
- Deteccion de entidades nombradas (NER): ajustado con datos de entidades, el modelo identifica personas, organizaciones, lugares y fechas en textos, util para sistemas de extraccion de informacion en periodismo o investigacion.
- Respuesta a preguntas extractivas: con un ajuste en datasets como SQuAD, el modelo localiza el fragmento de texto que responde a una pregunta, adecuado para asistentes virtuales o buscadores internos.
- Moderacion de contenido: clasificacion de comentarios como toxicos o seguros, con un modelo ligero que puede procesar grandes volumenes de texto en tiempo real.
- Preprocesamiento para pipelines de NLP: uso de los embeddings de DistilBERT como representaciones de entrada para modelos de clasificacion o clustering, reduciendo el coste computacional frente a BERT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (66 millones de parametros, aproximadamente 268 MB en pesos). Con cuantizacion a 8 bits, el uso de memoria baja a unos 70 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti, RTX 2060 o superiores. Tambien funciona en CPU sin problemas para inferencia por lotes pequenos.
- Si cabe en consumer GPU: si, en practicamente cualquier GPU moderna, incluso en tarjetas integradas.
- Opciones de despliegue: se puede servir con Hugging Face Inference Endpoints, Azure ML, SageMaker, o mediante librerias como FastAPI con transformers. Tambien es compatible con ONNX Runtime para optimizacion en CPU.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada, pero al ser un modelo pequeno, la latencia en CPU suele ser de pocos milisegundos por frase.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| DistilBERT base (este) | 66,9 M | no disponible | Apache 2.0 | en | Destilado de BERT, mas rapido y ligero |
| BERT base | 110 M | 512 (tipico) | Apache 2.0 | en | Modelo original, mas grande y lento |
| TinyBERT | 14,5 M | 512 (tipico) | Apache 2.0 | en | Destilacion mas agresiva, menor rendimiento |

Los datos de contexto para BERT y TinyBERT son de conocimiento general, no estan en la informacion proporcionada. No se dispone de comparativas de rendimiento numerico.

## Limitaciones y advertencias

- Sesgos: el modelo hereda los sesgos de su profesor BERT, como se demuestra en los ejemplos de la model card donde se asocian roles de genero o raza de forma estereotipada.
- Alucinacion: al ser un modelo de enmascarado, puede generar predicciones incorrectas o poco plausibles en contextos ambiguos.
- Idioma: solo soporta ingles; no es util para otros idiomas sin un ajuste adicional.
- Uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda auditar los sesgos antes de desplegar en produccion.
- Limitacion de generacion: no es adecuado para generacion de texto libre; para eso se necesitan modelos autoregresivos como GPT-2.
- Contexto: no se ha confirmado la longitud de contexto en la informacion disponible, aunque por su arquitectura se espera que sea similar a BERT (512 tokens).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper original (arXiv): https://arxiv.org/abs/1910.01108
- Repositorio de destilacion en GitHub: https://github.com/huggingface/transformers/tree/main/examples/research_projects/distillation
- Documentacion de DistilBERT en Hugging Face: https://huggingface.co/docs/transformers/model_doc/distilbert
