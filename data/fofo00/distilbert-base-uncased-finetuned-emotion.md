# fofo00/distilbert-base-uncased-finetuned-emotion

## Resumen

`fofo00/distilbert-base-uncased-finetuned-emotion` es un modelo de clasificación de texto obtenido mediante fine-tuning supervisado de `distilbert-base-uncased`, la variante destilada de BERT desarrollada por Hugging Face. El autor del ajuste es el usuario `fofo00` y el modelo se publicó en Hugging Face con licencia Apache 2.0. Su propósito es la clasificación de emociones en texto, aunque la model card no documenta explícitamente el conjunto de etiquetas ni el corpus de entrenamiento utilizado.

El modelo conserva la arquitectura encoder-only de DistilBERT: 6 capas transformer, 66.958.086 parámetros totales (según los pesos en safetensors) y un tokenizador WordPiece sin distinción de mayúsculas (`uncased`). El repositorio ocupa 0,3 GB e incluye pesos en formato safetensors, lo que permite su carga directa con la librería `transformers` y su despliegue en Text Embeddings Inference (TEI).

Su relevancia práctica es la de un clasificador ligero y rápido para tareas de análisis de sentimiento o emoción a nivel de documento o frase, adecuado para entornos con recursos limitados. No obstante, la ausencia de documentación sobre el dataset, el etiquetado y los usos previstos limita seriamente su uso en producción sin una validación previa por parte del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (DistilBERT, 6 capas) |
| Parametros totales | 66.958.086 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de DistilBERT; no confirmado en la model card) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors, sin variantes GGUF/ONNX en el repo) |
| Idiomas soportados | No disponible (modelo base `uncased` entrenado principalmente en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `distilbert-base-uncased`, un transformer encoder-only de 6 capas y 66 millones de parámetros obtenido por destilación de BERT-base. La cabeza de clasificación se ha reentrenado para una tarea de clasificación de emociones, aunque la model card no especifica el número de clases ni la taxonomía de etiquetas empleada.

El entrenamiento se realizó con el `Trainer` de Hugging Face durante 5 épocas, con `learning_rate` 5e-05, `train_batch_size` 64, `eval_batch_size` 64, semilla 42, optimizador AdamW (`fused`, betas 0.9/0.999, epsilon 1e-08) y planificador coseno. La model card indica que el dataset de entrenamiento es "unknown" y no documenta el número de tokens, la composición del corpus ni si se aplicaron técnicas de ajuste adicionales como RLHF o DPO (no aplicables, en principio, a un clasificador de este tipo). Las versiones de framework declaradas son Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

## Capacidades

- Clasificación de texto a nivel de secuencia (pipeline `text-classification`), orientada a la detección de emociones.
- Inferencia rápida en CPU y GPU gracias a su tamaño reducido (66,9 M de parámetros).
- Compatible con la librería `transformers` y con Text Embeddings Inference (tag `text-embeddings-inference` y `endpoints_compatible`).
- Tokenizador `uncased` (WordPiece), sin sensibilidad a mayúsculas.
- No soporta generación de texto, tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo discriminativo, no generativo.
- No dispone de capacidades multimodales (visión, audio) ni de modo "thinking".
- Capacidades multilingües: no documentadas; el modelo base está entrenado principalmente en inglés.

## Casos de uso

- Análisis de sentimiento y emoción en reseñas de producto: el modelo puede clasificar cada reseña en una categoría emocional, siempre que el integrador valide previamente el conjunto de etiquetas reales del modelo con ejemplos propios.
- Moderación de comentarios en foros o redes sociales: como clasificador ligero, permite filtrar mensajes potencialmente tóxicos o de tono negativo en tiempo real sobre CPU, sin necesidad de GPU.
- Enrutamiento de tickets de soporte: clasificar el tono emocional de un mensaje entrante para priorizar casos de frustración o enfado antes de que los atienda un agente humano.
- Análisis de encuestas abiertas (NPS, satisfacción): procesar respuestas de texto libre en lote y agregar la distribución emocional por segmento de cliente.
- Etiquetado asistido en pipelines de datos: pre-anotar grandes volúmenes de texto para su posterior revisión humana, reduciendo el coste de anotación manual.
- Extracción de señal emocional en investigación académica: análisis de corpus de texto (por ejemplo, entrevistas o publicaciones) con un modelo pequeño, reproducible y de bajo coste computacional.
- Prototipado rápido en entornos con recursos limitados: al ocupar 0,3 GB y ejecutarse en CPU, sirve para validar una idea de producto antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card (conjunto de evaluación no especificado) son los siguientes:

| Metrica | Valor |
|---|---|
| Loss (evaluación) | 0,2174 |
| Accuracy | 0,927 |
| F1 | 0,9267 |

Evolución durante el entrenamiento:

| Epoca | Step | Validation loss | Accuracy | F1 |
|---|---|---|---|---|
| 1.0 | 250 | 0,3209 | 0,913 | 0,9116 |
| 2.0 | 500 | 0,2174 | 0,927 | 0,9267 |

El `model-index` del repositorio no contiene resultados adicionales (`results: []`). No se han publicado comparaciones con otros modelos ni métricas por clase en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,27 GB para los pesos (66,9 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, menos de 1 GB.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060, RTX 2060, RTX 3060, RTX 4090) e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; para alto throughput en lote se puede usar cualquier GPU moderna (T4, L4, A10, A100).
- Opciones de despliegue: `transformers` (PyTorch), Text Embeddings Inference (TEI), Hugging Face Inference Endpoints (tag `endpoints_compatible`). No se han publicado pesos GGUF ni ONNX en el repositorio, por lo que `llama.cpp` y `Ollama` no son aplicables directamente sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fofo00/distilbert-base-uncased-finetuned-emotion` | 66,9 M | 512 (estándar DistilBERT) | Clasificación de emociones | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66,9 M | 512 | Análisis de sentimiento (2 clases) | Apache 2.0 | Hugging Face |
| `bhadresh-savani/distilbert-base-uncased-emotion` | 66,9 M | 512 | Clasificación de emociones (6 clases) | Apache 2.0 | Hugging Face |
| `j-hartmann/emotion-english-distilroberta-base` | ~82 M | 512 | Clasificación de emociones (7 clases) | MIT | Hugging Face |

La comparación se basa en la categoría y el tamaño de los modelos; no se dispone de métricas comparativas publicadas en la información proporcionada para establecer una comparación de rendimiento rigurosa.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, el conjunto de etiquetas ni los usos previstos; esto impide conocer qué emociones detecta exactamente y con qué fiabilidad.
- Riesgo de sesgo: al derivar de `distilbert-base-uncased`, hereda los sesgos presentes en el corpus de preentrenamiento (principalmente inglés y de dominio web).
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí de falsos positivos y negativos en la clasificación, especialmente en dominios distintos al de entrenamiento.
- Limitación de contexto: 512 tokens; textos más largos requieren truncamiento o segmentación.
- Limitación de idioma: el modelo base está entrenado principalmente en inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Licencia Apache 2.0: permite uso comercial, pero el integrador asume la responsabilidad de validar el modelo en su dominio concreto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no hay evidencia de validación por parte de la comunidad.
- Las versiones de framework declaradas (Transformers 5.22.1, PyTorch 2.14.1) son posteriores a las disponibles públicamente en el momento de redactar esta ficha; conviene verificar la compatibilidad al cargar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fofo00/distilbert-base-uncased-finetuned-emotion
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Documentación de DistilBERT (Hugging Face): https://huggingface.co/docs/transformers/model_doc/distilbert
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
