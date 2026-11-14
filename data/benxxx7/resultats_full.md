# BenXXX7/resultats_full

## Resumen

`resultats_full` es un modelo de clasificación de texto obtenido mediante fine-tuning de `distilbert-base-uncased`, la variante destilada de BERT desarrollada originalmente por Hugging Face. Lo publica el usuario BenXXX7 en Hugging Face y su propósito es resolver una tarea de clasificación supervisada cuyo conjunto de datos de entrenamiento no se documenta en la model card. El modelo se generó automáticamente con la librería `Trainer` de Transformers, lo que explica que la mayor parte de la documentación (descripción, usos previstos, datos de entrenamiento) aparezca como "More information needed".

Arquitectónicamente es un transformer encoder de tipo BERT con 66.956.548 parámetros (el recuento corresponde a la cabeza de clasificación añadida sobre el backbone DistilBERT de 6 capas). El contexto máximo es de 512 tokens, herencia directa de `distilbert-base-uncased`. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales más allá de las obligaciones de atribución.

Su relevancia es limitada: se trata de un artefacto de fine-tuning sin publicación de dataset, sin benchmarks en el model-index y con cero descargas en el momento de la consulta. Resulta útil únicamente como ejemplo de pipeline de clasificación ligero o como punto de partida para reproducir el entrenamiento, no como modelo listo para producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, basado en BERT) |
| Parametros totales | 66.956.548 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de distilbert-base-uncased) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización dinámica estándar de PyTorch, no documentada por el autor) |
| Idiomas soportados | no disponible (el modelo base es `uncased` en inglés, pero el autor no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea (pipeline) | text-classification |
| Modelo base | distilbert/distilbert-base-uncased |
| Tamaño del repositorio | 0,3 GB |
| Versión de Transformers | 5.22.1 |
| Versión de PyTorch | 2.14.1+cu130 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo (no LoRA ni adaptadores) de `distilbert-base-uncased`, un transformer encoder de 6 capas y 66 millones de parámetros destilado de BERT-base. Sobre el backbone se añade una cabeza de clasificación secuencia-a-etiqueta, habitual en tareas de clasificación de texto de una o varias clases. La longitud máxima de secuencia es de 512 tokens y el tokenizador es el WordPiece `uncased` del modelo base.

El entrenamiento se realizó con los hiperparámetros registrados en la model card: learning rate 2e-5, batch de entrenamiento de 32, batch de evaluación de 64, semilla 42, optimizador `AdamW` con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal, 2 épocas y precisión mixta nativa (AMP). El conjunto de datos no se especifica ("unknown dataset"). La evolución registrada es: época 1 con pérdida de validación 0,1701, accuracy 0,9407 y F1 macro 0,9407; época 2 con pérdida 0,1672, accuracy 0,9463 y F1 macro 0,9463. No se documenta el número de ejemplos, la composición del dataset ni si hubo aumento de datos o validación cruzada.

## Capacidades

- Clasificación de texto supervisada: asigna una o varias etiquetas a una secuencia de entrada de hasta 512 tokens.
- Inferencia sobre texto en inglés (por el tokenizador `uncased` del modelo base), aunque el autor no declara idiomas oficialmente.
- Extracción de representaciones contextuales del encoder, reutilizables para tareas downstream mediante fine-tuning adicional.
- Compatible con `text-embeddings-inference` y con endpoints de Hugging Face según los tags del repositorio.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo "thinking", visión, audio ni multimodalidad.
- No es un modelo generativo: no produce texto libre, solo logits de clasificación.

## Casos de uso

- Clasificación de tickets de soporte: el modelo puede etiquetar automáticamente incidencias en categorías predefinidas (facturación, técnico, cuenta) siempre que se entrene con un dataset propio, ya que el publicado no documenta sus clases.
- Moderación de comentarios: útil para filtrar texto corto (hasta 512 tokens) en pipelines de contenido generado por usuarios, con la ventaja de su bajo coste computacional.
- Análisis de sentimiento en reseñas: fine-tuning ligero sobre un corpus propio de opiniones; el tamaño de 66 M de parámetros permite entrenar en una sola GPU consumer.
- Enrutamiento de correos o formularios: clasificación de mensajes entrantes hacia departamentos concretos en un flujo de automatización.
- Detección de spam o phishing en texto: como clasificador binario o multiclase en una pasarela de correo, con latencia de milisegundos por muestra.
- Etiquetado de datasets para investigación: uso como anotador automático previo a revisión humana en proyectos de etiquetado a gran escala.
- Baseline en experimentos de NLP: referencia rápida para comparar contra modelos mayores (RoBERTa, DeBERTa) en tareas de clasificación con recursos limitados.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de evaluación no especificado):

| Metrica | Epoca 1 | Epoca 2 (final) |
|---|---|---|
| Training loss | 0,1756 | 0,1346 |
| Validation loss | 0,1701 | 0,1672 |
| Accuracy | 0,9407 | 0,9463 |
| F1 macro | 0,9407 | 0,9463 |

El model-index del repositorio está vacío (`results: []`), por lo que no hay benchmarks comparables con MMLU, GLUE, HumanEval ni similares. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 270 MB (66,9 M de parámetros × 4 bytes), más activaciones y overhead del runtime.
- VRAM estimada en FP16/BF16: aproximadamente 135 MB.
- VRAM estimada con cuantización dinámica INT8: aproximadamente 70 MB.
- Cabe holgadamente en cualquier GPU consumer, incluida una GTX 1650 (4 GB) o incluso en CPU para lotes pequeños.
- GPU recomendadas para entrenamiento: RTX 3060/4060 o superiores; una A100 o H100 solo tiene sentido para lotes muy grandes o entrenamiento multi-dataset, dado el reducido tamaño del modelo.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, `text-embeddings-inference` (según tags), ONNX Runtime, o exportación a TorchScript. No se documenta compatibilidad explícita con vLLM, llama.cpp u Ollama, que están orientados a modelos generativos.
- Throughput y latencia: no disponibles en la información proporcionada; en la práctica, un DistilBERT de 6 capas suele procesar cientos de muestras por segundo en GPU moderna con batch de 32, pero el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `resultats_full` (este) | 66,9 M | 512 | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning sin dataset documentado |
| `distilbert-base-uncased` | 66,4 M | 512 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base, sin cabeza de clasificación específica |
| `distilbert-base-uncased-finetuned-sst-2-english` | 67 M | 512 | Apache 2.0 | Hugging Face, muy descargado | Clasificación de sentimiento en inglés, benchmark público |
| `bert-base-uncased` | 110 M | 512 | Apache 2.0 | Hugging Face | Mayor capacidad, ~1,6× parámetros, más lento en inferencia |

La comparación con alternativas se limita a la familia BERT/DistilBERT porque el autor no declara la tarea concreta ni el dataset, lo que impide comparar rendimiento con modelos especializados en la misma tarea. No hay datos de benchmarks que permitan situar `resultats_full` frente a estos modelos.

## Limitaciones y advertencias

- El dataset de entrenamiento y evaluación no está documentado, por lo que las métricas (accuracy 0,9463, F1 macro 0,9463) no son reproducibles ni interpretables sin conocer las clases y la distribución de los datos.
- El model-index está vacío: no hay benchmarks verificables ni comparaciones públicas.
- Riesgo de alucinación no aplica en sentido generativo (no genera texto), pero sí de clasificaciones erróneas fuera de la distribución de entrenamiento.
- Sesgos: al derivar de `distilbert-base-uncased`, hereda los sesgos de género, raza y dominio presentes en el corpus original de BERT (Wikipedia y BookCorpus), no auditados por el autor.
- Idiomas: el tokenizador `uncased` está orientado a inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente sin reentrenamiento.
- Límite de contexto de 512 tokens: textos más largos requieren truncado o segmentación, lo que puede degradar la clasificación.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia del dataset de fine-tuning antes de desplegar en producción.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación por parte de la comunidad.
- La model card indica explícitamente "More information needed" en descripción, usos previstos y datos de entrenamiento, lo que refleja una publicación incompleta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BenXXX7/resultats_full
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Documentación de DistilBERT (paper): https://arxiv.org/abs/1910.01108
- Documentación de BERT (paper): https://arxiv.org/abs/1810.04805
- Librería Transformers: https://github.com/huggingface/transformers
- Librería Datasets: https://github.com/huggingface/datasets
- Librería Tokenizers: https://github.com/huggingface/tokenizers
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
