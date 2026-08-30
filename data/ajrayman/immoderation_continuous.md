# ajrayman/Immoderation_continuous

## Resumen

Immoderation_continuous es un modelo de clasificación de texto (regresión) desarrollado por el usuario ajrayman, que consiste en un fine-tuning de roberta-base sobre un conjunto de datos no especificado. El modelo está diseñado para predecir una puntuación continua relacionada con el concepto de "inmoderación" (falta de moderación), probablemente como parte de una serie de modelos que evalúan rasgos psicológicos o de comportamiento en texto (el mismo autor publicó modelos similares como Modesty_continuous y machiavellianism_continuous). Se trata de un modelo pequeño, con 124,6 millones de parámetros, que hereda la arquitectura transformer encoder de RoBERTa.

La relevancia de este modelo radica en su potencial uso para tareas de moderación de contenido o análisis de texto donde se requiera una puntuación numérica en lugar de una etiqueta binaria. Sin embargo, la documentación es extremadamente escasa: no se especifica el dataset de entrenamiento, los idiomas soportados ni el contexto máximo, lo que limita su aplicabilidad directa en producción sin una evaluación adicional. El modelo se distribuye bajo licencia MIT y está disponible en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base) |
| Parametros totales | 124.646.401 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (típico de RoBERTa-base: 512 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (RoBERTa-base está entrenado principalmente en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de roberta-base, un transformer encoder de 12 capas con 768 dimensiones ocultas y 12 cabezas de atención, preentrenado con masked language modeling. La capa de clasificación original se sustituye por una cabeza de regresión que produce una salida continua (una única puntuación). El entrenamiento se realizó con los siguientes hiperparámetros: learning rate de 2e-5, batch size de 32, 8 épocas, optimizador Adam (betas 0.9/0.999, epsilon 1e-8), scheduler lineal con warmup ratio de 0.06. No se especifica el dataset de entrenamiento (aparece como "None" en la model card), ni el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. Las métricas de evaluación reportadas (RMSE, MAE, correlación) indican que se trata de una tarea de regresión, probablemente sobre una escala psicométrica.

## Capacidades

- Regresión de texto: predice una puntuación continua (aparentemente relacionada con "inmoderación") a partir de un texto de entrada.
- Clasificación de texto: aunque la salida es continua, puede usarse para clasificación umbral (por ejemplo, detectar contenido extremadamente inmoderado).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidades multilingües: no documentadas; RoBERTa-base está entrenado principalmente en inglés, por lo que el rendimiento en otros idiomas es incierto.
- No dispone de modo de pensamiento (thinking mode) ni generación de texto libre; es exclusivamente un encoder para clasificación.

## Casos de uso

- Moderación de contenido en foros y redes sociales: el modelo puede puntuar la "inmoderación" de un comentario en una escala continua, permitiendo establecer umbrales dinámicos para priorizar la revisión humana. Su tamaño reducido permite inferencia rápida en entornos con recursos limitados.
- Análisis de sentimiento extremo: en lugar de clasificar en positivo/negativo, se puede usar para medir la intensidad de un tono agresivo o desmedido en reseñas de productos, ayudando a detectar feedback tóxico.
- Investigación en psicología computacional: dado que el autor ha publicado modelos similares para otros rasgos (modestia, maquiavelismo), este modelo podría usarse en estudios que correlacionen el lenguaje con escalas psicométricas.
- Filtrado de comentarios en plataformas de noticias: integrarlo en un pipeline de preprocesamiento para asignar una puntuación de riesgo a cada comentario antes de su publicación, reduciendo la carga de moderadores.
- Análisis de discursos políticos o mediáticos: cuantificar el grado de inmoderación en discursos o artículos, útil para estudios sociológicos o de comunicación.
- Detección de incitación al odio (como complemento): aunque no está específicamente entrenado para ello, la puntuación continua puede servir como señal adicional en sistemas de detección de contenido dañino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de evaluación del propio autor, que se muestran a continuación:

| Metrica | Valor |
|---|---|
| Loss (validación) | 0.0440 |
| RMSE | 0.2097 |
| MAE | 0.1679 |
| Correlación | 0.2253 |

Estos valores corresponden a la época 4 (última reportada). La correlación de 0.2253 es baja, lo que sugiere una capacidad predictiva limitada. No hay comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 124,6 millones de parámetros en FP32, el modelo ocupa aproximadamente 500 MB. En FP16, unos 250 MB. Con cuantización a 8 bits, menos de 200 MB. Cabe en cualquier GPU con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060 6GB, RTX 2060, RTX 3060, etc.) es suficiente. También puede ejecutarse en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: compatible con la librería Transformers de Hugging Face, así como con vLLM, TGI y ONNX Runtime. No se han publicado archivos GGUF, por lo que no es directamente compatible con llama.cpp u Ollama sin conversión previa.
- Latencia y throughput: al ser un modelo pequeño, la inferencia es muy rápida. En una GPU moderna, se pueden procesar cientos de textos por segundo. En CPU, la latencia por texto es del orden de milisegundos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para la tarea de "inmoderación continua". Como referencia, se puede comparar con el modelo base RoBERTa-base y con otros fine-tunes del mismo autor:

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| Immoderation_continuous | 124,6 M | no disponible | Regresión de inmoderación | MIT |
| Modesty_continuous (mismo autor) | 124,6 M (presumible) | no disponible | Regresión de modestia | MIT |
| machiavellianism_continuous (mismo autor) | 124,6 M (presumible) | no disponible | Regresión de maquiavelismo | MIT |
| RoBERTa-base (original) | 125 M | 512 | MLM / clasificación | MIT |

No hay datos de rendimiento comparativo entre estos modelos.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica "None", lo que impide evaluar la representatividad y posibles sesgos del modelo.
- Correlación baja (0.2253): la capacidad predictiva es débil, por lo que no se recomienda su uso en producción sin una validación exhaustiva.
- Sesgos potenciales: al ser un fine-tune de RoBERTa-base, puede heredar sesgos de género, raza o ideología presentes en los datos de preentrenamiento.
- Riesgo de alucinación: al ser un modelo de regresión, no genera texto, pero puede producir puntuaciones inconsistentes para entradas fuera de la distribución de entrenamiento.
- Limitaciones de idioma: no se especifican idiomas soportados; RoBERTa-base está entrenado principalmente en inglés, por lo que su uso en otros idiomas puede degradar el rendimiento.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre el rendimiento.
- Documentación insuficiente: no hay información sobre el contexto máximo, el preprocesamiento de texto requerido ni el rango de salida de la puntuación, lo que dificulta su integración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ajrayman/Immoderation_continuous
- Modelo relacionado (Modesty_continuous): https://huggingface.co/ajrayman/Modesty_continuous
- Modelo relacionado (machiavellianism_continuous): https://huggingface.co/ajrayman/machiavellianism_continuous
- Modelo base (RoBERTa-base): https://huggingface.co/FacebookAI/roberta-base
