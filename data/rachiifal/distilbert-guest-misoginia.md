# Rachiifal/distilbert-guest-misoginia

## Resumen

distilbert-guest-misoginia es un modelo de clasificación de texto obtenido mediante fine-tuning de distilbert-base-uncased, publicado por el usuario Rachiifal en Hugging Face. La nomenclatura del identificador sugiere que el ajuste se ha orientado a la detección de contenido misógino, aunque la model card no documenta explícitamente la tarea, el conjunto de datos ni las etiquetas de salida. El modelo deriva de DistilBERT, una versión destilada de BERT que reduce el número de capas a la mitad y conserva en torno al 97 % del rendimiento del modelo original en tareas de comprensión del lenguaje, con una huella de 66.955.010 parámetros.

El modelo se entrenó durante 3 épocas con un learning rate de 2e-5, batch size de 16 y el optimizador AdamW fused, empleando un scheduler lineal. En el conjunto de evaluación alcanza una accuracy de 0,9017 y un F1 de 0,5380 en la segunda época, con una pérdida de validación de 0,6128. La brecha entre accuracy y F1 es notable y apunta a un desequilibrio de clases en los datos de evaluación, un aspecto que conviene tener en cuenta antes de cualquier uso en producción.

Su relevancia práctica reside en el bajo coste de inferencia: al tratarse de un encoder de 6 capas y 66 millones de parámetros, puede ejecutarse en CPU o en GPUs de consumo con latencias muy bajas, lo que lo hace adecuado para filtrado de contenido a gran escala. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, aunque la ausencia de documentación sobre el dataset y la taxonomía de etiquetas limita seriamente su reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas) |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de distilbert-base-uncased) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización dinámica posible vía PyTorch/ONNX) |
| Idiomas soportados | no disponible (el modelo base es uncased en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo DistilBERT, con 6 capas, 12 cabezas de atención y una dimensión oculta de 768, resultado de la destilación de BERT-base. Sobre esta base se ha añadido una cabeza de clasificación de secuencias ajustada mediante fine-tuning supervisado. El tokenizador es el WordPiece uncased del modelo base, con un vocabulario de 30.522 tokens.

El entrenamiento se realizó con Transformers 5.21.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3, con semilla 42. Se ejecutaron 3 épocas con 279 pasos por época (837 pasos totales), learning rate 2e-5, batch size 16 en entrenamiento y evaluación, y scheduler lineal con AdamW fused (betas 0.9/0.999, epsilon 1e-8). No se documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo técnicas de RLHF o DPO (no aplicables habitualmente a clasificadores). No se declara ninguna innovación técnica adicional más allá del fine-tuning estándar.

## Capacidades

- Clasificación de texto a nivel de secuencia: devuelve una distribución de probabilidad sobre las etiquetas aprendidas durante el fine-tuning.
- Detección de contenido potencialmente misógino, según se deduce del identificador del modelo (no confirmado en la model card).
- Procesamiento de secuencias de hasta 512 tokens con tokenización WordPiece en minúsculas.
- Inferencia rápida en CPU y GPU de consumo gracias a su tamaño reducido.
- Integración con la librería transformers y con text-embeddings-inference según los tags del repositorio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidades multilingües no documentadas; el modelo base está entrenado principalmente en inglés.

## Casos de uso

- Moderación de comentarios en plataformas: clasificar mensajes de usuario en tiempo real para marcar posibles casos de misoginia antes de la revisión humana, aprovechando la baja latencia del encoder de 66 millones de parámetros.
- Filtrado previo en pipelines de anotación: usar el modelo como primera pasada sobre grandes volúmenes de texto para reducir el trabajo manual de los anotadores, que revisan únicamente los casos positivos o de baja confianza.
- Análisis de reputación de marca en redes sociales: procesar menciones y comentarios para cuantificar la prevalencia de discurso misógino en una muestra, siempre con validación humana posterior.
- Investigación en ciencias sociales: etiquetar corpus de comentarios o foros para estudios sobre discurso de odio, teniendo en cuenta las limitaciones de F1 y la falta de documentación del dataset.
- Enrutamiento en sistemas de atención al cliente: derivar automáticamente a revisión humana los mensajes que el clasificador marque como problemáticos, integrándolo como paso previo a un modelo generativo de respuesta.
- Prototipado rápido de clasificadores de contenido: servir como línea base ajustable con nuevos datos propios, dado que el coste de reentrenamiento de DistilBERT es bajo.

## Benchmarks y rendimiento

El model-index del autor no contiene resultados publicados. Los únicos datos disponibles son las métricas de evaluación declaradas en la model card:

| Epoca | Paso | Perdida de validacion | Accuracy | F1 |
|---|---|---|---|---|
| 1.0 | 279 | 0.4861 | 0.8483 | 0.4299 |
| 2.0 | 558 | 0.6128 | 0.9017 | 0.5380 |
| 3.0 | 837 | 0.9633 | 0.9042 | 0.4901 |

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.) en la información disponible. No se dispone de comparaciones con modelos similares en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 270 MB para los pesos (66,9 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, menos de 1 GB.
- VRAM estimada en FP16: aproximadamente 135 MB para los pesos.
- Cabe holgadamente en cualquier GPU de consumo (GTX 1060, RTX 3060, RTX 4090) e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: transformers (PyTorch), text-embeddings-inference, ONNX Runtime, y exportación a GGUF para llama.cpp si se convierte manualmente.
- Throughput estimado: no disponible en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU y aceptable en CPU por lotes.
- Latencia: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| distilbert-guest-misoginia | 66,9 M | 512 | apache-2.0 | Fine-tuning específico; F1 de 0,538 en validación |
| distilbert-base-uncased | 66,4 M | 512 | apache-2.0 | Modelo base sin ajuste; referencia para comparar la mejora del fine-tuning |
| bert-base-uncased | 110 M | 512 | apache-2.0 | Mayor capacidad, mayor coste de inferencia; no se dispone de métricas comparables en esta ficha |
| roberta-base | 125 M | 514 | mit | Alternativa habitual para clasificación de texto; no se dispone de métricas comparables en esta ficha |

No se dispone de datos de rendimiento de los modelos alternativos en la información proporcionada, por lo que la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- La model card está generada automáticamente y no documenta el dataset, las etiquetas, el idioma ni el dominio de aplicación, lo que impide evaluar su validez fuera del conjunto de evaluación original.
- El F1 de 0,538 con una accuracy de 0,9017 indica un fuerte desequilibrio de clases; el modelo puede tener un rendimiento pobre en la clase minoritaria (probablemente la positiva) y no debe usarse como único criterio de decisión.
- La pérdida de validación aumenta de la época 1 a la 3 (0,4861 → 0,9633), lo que sugiere sobreajuste; la época 2 es la que presenta mejor F1.
- El modelo base es uncased y está entrenado principalmente en inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Riesgo de sesgos: al ser un clasificador de contenido sensible, puede amplificar sesgos presentes en el dataset de entrenamiento, que no se describe.
- Riesgo de alucinación no aplicable (es un clasificador, no un generador), pero sí de falsos positivos y falsos negativos con impacto en moderación automatizada.
- Licencia Apache 2.0: permite uso comercial, pero la falta de documentación sobre la procedencia de los datos de entrenamiento puede plantear dudas de cumplimiento en entornos regulados.
- No apto para decisiones automatizadas de alta consecuencia (por ejemplo, sanciones a usuarios) sin revisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rachiifal/distilbert-guest-misoginia
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Documentación de DistilBERT (paper): https://arxiv.org/abs/1910.01108
- Documentación de transformers: https://huggingface.co/docs/transformers
- text-embeddings-inference: https://github.com/huggingface/text-embeddings-inference
