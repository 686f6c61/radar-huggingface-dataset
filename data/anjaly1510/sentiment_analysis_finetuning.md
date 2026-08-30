# Anjaly1510/Sentiment_analysis_finetuning

## Resumen

El modelo `Anjaly1510/Sentiment_analysis_finetuning` es un ajuste fino (fine-tuning) de `distilbert-base-uncased` para la clasificación de texto, concretamente análisis de sentimiento. Ha sido desarrollado por el usuario Anjaly1510 y publicado en Hugging Face con licencia Apache 2.0. El modelo resuelve la tarea de asignar una etiqueta de sentimiento (positivo, negativo o neutro) a un texto de entrada, utilizando la arquitectura transformer destilada de DistilBERT, que reduce el tamaño y la latencia respecto a BERT original manteniendo un rendimiento cercano.

Con 66,9 millones de parámetros y una ventana de contexto de 512 tokens, es un modelo ligero y adecuado para entornos con recursos limitados. La model card generada automáticamente indica que se entrenó durante 2 épocas con una tasa de aprendizaje de 2e-5 y un tamaño de lote de 16, aunque no se especifica el conjunto de datos utilizado. Las métricas de evaluación reportadas por el autor son una precisión (accuracy) de 0,8833 y un F1 de 0,8867, con una pérdida de 0,3347. A pesar de la escasez de documentación, el modelo es funcional y puede utilizarse directamente con la librería `transformers` para tareas de clasificación de sentimiento en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder, 6 capas, 768 dimensiones ocultas, 12 cabezas de atención) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se puede cuantizar con herramientas como `torchao` o `llama.cpp` para GGUF) |
| Idiomas soportados | inglés (modelo base `uncased`, sin acentos ni mayúsculas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una versión destilada de BERT que conserva la arquitectura transformer encoder pero reduce el número de capas de 12 a 6, manteniendo el mismo tamaño de representación (768 dimensiones) y el mismo número de cabezas de atención (12). Esta destilación permite una inferencia aproximadamente un 40% más rápida y un 40% menos parámetros que BERT-base, manteniendo el 97% de su rendimiento en tareas de comprensión del lenguaje.

El proceso de entrenamiento consistió en un ajuste fino supervisado sobre un conjunto de datos no especificado en la model card. Se utilizaron los siguientes hiperparámetros: tasa de aprendizaje de 2e-5, tamaño de lote de 16 tanto para entrenamiento como para evaluación, optimizador AdamW con betas (0.9, 0.999), programador de tasa de aprendizaje lineal y 2 épocas. No se menciona el uso de técnicas como RLHF o DPO; se trata de un entrenamiento estándar de clasificación con pérdida de entropía cruzada. El modelo fue generado con el `Trainer` de Hugging Face, lo que explica la plantilla automática de la model card.

## Capacidades

- Clasificación de texto: asigna una etiqueta de sentimiento (probablemente positivo, negativo o neutro) a una secuencia de texto en inglés.
- Inferencia eficiente: al ser un modelo pequeño (66M parámetros), puede ejecutarse en CPU y GPU de baja gama con baja latencia.
- Integración con `transformers`: se puede cargar mediante la clase `AutoModelForSequenceClassification` o mediante el pipeline de `text-classification`.
- Compatible con `text-embeddings-inference` y endpoints de Hugging Face, lo que facilita su despliegue en producción.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio; es un modelo puramente de clasificación de texto.

## Casos de uso

- Análisis de opiniones de productos: dado un comentario de un cliente, el modelo clasifica si la opinión es positiva, negativa o neutra, permitiendo a las empresas monitorizar la satisfacción en plataformas de comercio electrónico.
- Monitorización de redes sociales: procesar tweets o publicaciones para detectar sentimiento hacia una marca o campaña, ayudando a la gestión de reputación online.
- Filtrado de comentarios en foros o comunidades: identificar automáticamente mensajes negativos o tóxicos para priorizar la moderación humana.
- Análisis de encuestas abiertas: clasificar respuestas de texto libre en encuestas de satisfacción para cuantificar el sentimiento general de los clientes.
- Asistencia en atención al cliente: preclasificar tickets de soporte según el tono del mensaje, priorizando los más urgentes o negativos para una respuesta rápida.
- Investigación académica: servir como modelo base para experimentos de análisis de sentimiento en inglés, dado su tamaño reducido y facilidad de ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible. La model card reporta las siguientes métricas de evaluación sobre un conjunto de datos no especificado:

| Metrica | Valor |
|---|---|
| Pérdida (loss) | 0,3347 |
| Precisión (accuracy) | 0,8833 |
| F1 | 0,8867 |

Estos valores son declarados por el autor y no se comparan con otros modelos. No se dispone de datos sobre rendimiento en conjuntos de referencia como GLUE o SST-2.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, el modelo ocupa aproximadamente 268 MB (66,9M parámetros × 4 bytes). En FP16, unos 134 MB; en int8, unos 67 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente, por ejemplo NVIDIA T4, GTX 1650, RTX 3060 o superiores. También puede ejecutarse en CPU con razonable velocidad (inferencia de pocos milisegundos por muestra).
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU moderna, incluso en integradas con suficiente RAM compartida.
- Opciones de despliegue: se puede servir con `transformers` + PyTorch, con `text-embeddings-inference` (compatible según los tags), o exportar a ONNX para optimización. También es posible cuantizar a GGUF para usar con `llama.cpp` u Ollama, aunque no se proporcionan pesos pre-cuantizados.
- Latencia y throughput: no se dispone de mediciones oficiales, pero por el tamaño del modelo se espera una latencia inferior a 10 ms por muestra en GPU y de 20-50 ms en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento (accuracy en SST-2) |
|---|---|---|---|---|
| Anjaly1510/Sentiment_analysis_finetuning | 66,9M | 512 | Apache 2.0 | 0,8833 (evaluación propia, dataset desconocido) |
| distilbert-base-uncased (base) | 66,9M | 512 | Apache 2.0 | ~0,91 (SST-2, sin fine-tuning específico) |
| bert-base-uncased | 110M | 512 | Apache 2.0 | ~0,92 (SST-2) |
| roberta-base | 125M | 512 | MIT | ~0,94 (SST-2) |

Nota: los valores de SST-2 para los modelos base son aproximados y provienen de la literatura; el modelo evaluado no ha sido probado en SST-2, por lo que la comparación directa no es rigurosa. La información de rendimiento del modelo fine-tuned es la reportada por el autor sobre su propio conjunto de evaluación.

## Limitaciones y advertencias

- Conjunto de datos de entrenamiento desconocido: la model card no especifica qué datos se usaron, lo que impide evaluar posibles sesgos o la generalización a dominios distintos.
- Solo inglés: el modelo base es `uncased` y está entrenado principalmente con texto en inglés; no es adecuado para otros idiomas sin un fine-tuning adicional.
- Contexto limitado a 512 tokens: no puede procesar documentos largos de una sola vez; para textos extensos se requiere truncamiento o estrategias de ventana deslizante.
- Riesgo de alucinación y errores de clasificación: como cualquier modelo de lenguaje, puede producir clasificaciones incorrectas, especialmente en textos ambiguos, sarcásticos o con lenguaje informal.
- Documentación insuficiente: no se proporcionan detalles sobre la arquitectura exacta del clasificador (número de etiquetas, función de activación) ni sobre el preprocesamiento aplicado.
- Licencia Apache 2.0 permite uso comercial, pero al ser un fine-tuning de un modelo base con la misma licencia, no hay restricciones adicionales conocidas.
- No se garantiza un rendimiento óptimo en producción sin una evaluación previa en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Anjaly1510/Sentiment_analysis_finetuning
- Modelo base DistilBERT: https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Documentación de `transformers` para pipelines de clasificación: https://huggingface.co/docs/transformers/main_classes/pipelines
