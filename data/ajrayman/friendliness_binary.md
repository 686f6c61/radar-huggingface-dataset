# ajrayman/Friendliness_binary

## Resumen

Friendliness_binary es un modelo de clasificación de texto binario desarrollado por ajrayman (Adam), publicado en Hugging Face en octubre de 2024. Se trata de un ajuste fino (fine-tuning) del modelo base RoBERTa-base de Facebook AI, especializado en la tarea de clasificar la amabilidad o cordialidad de un texto. El modelo tiene 124,6 millones de parámetros y está diseñado para su uso con la librería Transformers de Hugging Face.

El modelo resuelve un problema concreto de análisis de sentimiento o tono: determinar si un texto es amable o no. Aunque la model card generada automáticamente no especifica el dataset de entrenamiento ni el dominio exacto, las métricas de evaluación reportadas (accuracy de 0,6488) sugieren que es un modelo experimental o de investigación. Su relevancia radica en ser un ejemplo de fine-tuning de un modelo transformer de tamaño medio para tareas de clasificación de tono, con licencia MIT que permite uso comercial sin restricciones.

La arquitectura está basada en el encoder transformer de RoBERTa, con una cabeza de clasificación añadida para la salida binaria. El repositorio incluye pesos en formato safetensors y es compatible con la inferencia de embeddings de texto (text-embeddings-inference), lo que facilita su despliegue en entornos de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-base (encoder transformer) con cabeza de clasificación |
| Parametros totales | 124.647.170 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (heredada de RoBERTa-base) |
| Tipos de cuantizacion | no disponible (pesos originales en fp32/fp16) |
| Idiomas soportados | no disponible (heredados de RoBERTa-base, principalmente inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa-base, un encoder transformer de 12 capas con 12 cabezas de atención, 768 dimensiones ocultas y aproximadamente 124 millones de parámetros. La principal diferencia con BERT es que RoBERTa se entrena con más datos, secuencias más largas y sin la tarea de predicción de siguiente frase, lo que mejora su rendimiento en tareas de comprensión del lenguaje.

El fine-tuning se realizó con el Trainer de Hugging Face sobre un dataset no especificado (indicado como "None" en la model card). Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 2e-05, batch size de 32, optimizador Adam con betas (0,9, 0,999) y epsilon 1e-08, scheduler lineal con warmup ratio de 0,06 y 8 épocas. La pérdida de entrenamiento final fue de 0,5868. No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento es un fine-tuning supervisado estándar.

## Capacidades

- Clasificación binaria de textos según su nivel de amabilidad o cordialidad.
- Inferencia de tono en textos cortos o párrafos (limitado a 512 tokens).
- Compatible con pipelines de Transformers para text-classification.
- Soporte para inferencia de embeddings de texto (text-embeddings-inference).
- Capacidades multilingües limitadas (heredadas de RoBERTa-base, entrenado principalmente con datos en inglés).
- No incluye soporte para tool calling, agentes o razonamiento multi-paso.
- No dispone de modo de pensamiento, visión o audio.

## Casos de uso

- Moderación de comentarios en foros y redes sociales: el modelo puede clasificar automáticamente si un comentario es amable u hostil, ayudando a priorizar la revisión humana en plataformas con alto volumen de contenido generado por usuarios.
- Análisis de atención al cliente: permite evaluar el tono de las conversaciones entre agentes y clientes, identificando interacciones que puedan requerir intervención o formación adicional.
- Filtrado de mensajes en aplicaciones de mensajería: puede usarse para detectar mensajes con tono negativo y ofrecer sugerencias de reescritura más amable antes del envío.
- Evaluación de reseñas de productos: clasifica reseñas según su tono para segmentar el feedback en categorías de satisfacción del cliente.
- Monitorización de correos electrónicos profesionales: ayuda a detectar correos con tono brusco o inapropiado en entornos corporativos antes de su envío.
- Investigación en procesamiento de lenguaje natural: sirve como punto de partida para experimentos sobre análisis de cortesía o como baseline comparativo en tareas de clasificación de tono.

## Benchmarks y rendimiento

El modelo reporta las siguientes métricas en el conjunto de evaluación durante el entrenamiento (época 5, la última con datos completos):

| Metrica | Valor |
|---|---|
| Loss | 0,7870 |
| Accuracy | 0,6488 |
| Precision | 0,6735 |
| Recall | 0,5761 |
| F1 | 0,6210 |
| AUC | 0,6800 |

La evolución por épocas muestra que el mejor F1 (0,6862) se alcanzó en la época 3, con una accuracy de 0,6526. A partir de la época 4 se observa un ligero sobreajuste, con la pérdida de validación aumentando de 0,6536 a 0,7070 y finalmente 0,7870. No se han publicado resultados en benchmarks estándar como MMLU, GLUE o SuperGLUE en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-1 GB en fp32 (124 millones de parámetros), menos de 0,5 GB en cuantización int8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo NVIDIA GTX 1650, RTX 3060 o superiores. También puede ejecutarse en CPU para inferencia de bajo volumen.
- Compatible con GPUs de consumo: sí, cabe en cualquier GPU moderna de consumo.
- Opciones de despliegue: Hugging Face Inference Endpoints, Transformers pipeline, ONNX Runtime, text-embeddings-inference.
- Latencia: del orden de 10-50 ms por secuencia en GPU moderna, dependiendo de la longitud del texto.
- Throughput estimado: cientos de inferencias por segundo en una GPU como RTX 3090 con batch processing.

## Comparativa con modelos similares

No se han encontrado modelos directamente comparables en la información disponible. El modelo es un fine-tuning de RoBERTa-base, por lo que su comparativa natural sería con el propio RoBERTa-base (sin ajuste) o con otros fine-tunings de RoBERTa para clasificación de sentimiento, como los disponibles en Hugging Face Hub. Sin embargo, no se dispone de datos de rendimiento de modelos alternativos en la misma tarea y con el mismo dataset para establecer una comparación rigurosa.

## Limitaciones y advertencias

- El dataset de entrenamiento no está documentado, lo que impide evaluar la generalización del modelo a dominios distintos del original.
- Las métricas de rendimiento son modestas (accuracy de 0,6488, F1 de 0,6210), lo que sugiere que el modelo puede tener dificultades en tareas de clasificación más complejas o con textos ambiguos.
- El modelo está limitado a 512 tokens de contexto, por lo que no es adecuado para documentos largos.
- Los idiomas soportados no están documentados; RoBERTa-base está entrenado principalmente con datos en inglés, por lo que el rendimiento en otros idiomas probablemente sea deficiente.
- La model card es una plantilla generada automáticamente con secciones incompletas ("More information needed"), lo que indica una documentación insuficiente para uso en producción sin validación adicional.
- Riesgo de alucinación o clasificaciones incorrectas en textos con sarcasmo, ironía o matices culturales.
- Aunque la licencia MIT permite uso comercial, la falta de documentación sobre el dataset y el rendimiento real hace recomendable una evaluación exhaustiva antes de su uso en aplicaciones críticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ajrayman/Friendliness_binary
- Perfil del autor: https://huggingface.co/ajrayman
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
