# ajrayman/Anger_continuous

## Resumen

Anger_continuous es un modelo de clasificación de texto entrenado por el usuario ajrayman, que consiste en un fine-tuning de RoBERTa-base para predecir de forma continua el nivel de ira expresado en un texto. Se trata de una tarea de regresión sobre una variable emocional, en lugar de una clasificación categórica tradicional. El modelo tiene 124,6 millones de parámetros y una ventana de contexto de 512 tokens, heredada de su arquitectura base.

El modelo se publica bajo licencia MIT y está disponible en formato safetensors, lo que facilita su integración en pipelines de Transformers. Aunque la model card es muy escasa y no detalla el dataset de entrenamiento ni las capacidades específicas, las métricas de evaluación reportadas (RMSE, MAE y correlación) sugieren que el modelo puede utilizarse para análisis de emociones en texto, especialmente en contextos donde se requiera una puntuación continua de ira. Su relevancia radica en la creciente demanda de herramientas de análisis de sentimiento y emociones en aplicaciones de moderación de contenido, investigación psicológica y monitoreo de redes sociales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base) |
| Parametros totales | 124.646.401 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en fp32) |
| Idiomas soportados | no disponible (RoBERTa-base está entrenado principalmente en inglés, pero no se especifica) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa, un transformer encoder con atención bidireccional, preentrenado con un objetivo de lenguaje enmascarado. El fine-tuning se realizó sobre una tarea de regresión para predecir un valor continuo de ira, utilizando una capa de salida lineal sobre el token `[CLS]`. Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 2e-5, tamaño de lote de 32, 8 épocas, optimizador Adam con betas (0.9, 0.999) y un scheduler lineal con warmup del 6%. No se especifica el dataset de entrenamiento ni el número de tokens utilizados, y tampoco se menciona el uso de técnicas como RLHF o DPO.

## Capacidades

- Regresión de ira: el modelo devuelve un valor continuo que representa la intensidad de ira en un texto dado.
- Clasificación de texto: aunque la salida es continua, puede utilizarse como base para clasificación por umbrales.
- Análisis de emociones: orientado a tareas de análisis de sentimiento y detección de emociones en texto.
- Integración con Transformers: compatible con la librería `transformers` para inferencia y fine-tuning adicional.
- No se reportan capacidades de generación de texto, tool calling, agentes, visión ni audio.

## Casos de uso

- Moderación de contenido en redes sociales: el modelo puede puntuar la ira en comentarios o publicaciones para priorizar la revisión humana de contenido potencialmente conflictivo.
- Investigación en psicología computacional: análisis de corpus de texto para estudiar la relación entre la ira expresada y variables psicológicas, como en el estudio de emociones continuas.
- Monitoreo de opinión pública: seguimiento de la evolución de la ira en discusiones políticas o sociales a partir de datos de foros o redes.
- Análisis de reseñas de productos: detección de niveles de ira en reseñas para identificar problemas graves de calidad o servicio.
- Asistencia en atención al cliente: clasificación de tickets o mensajes según el nivel de ira del cliente para priorizar respuestas urgentes.
- Evaluación de contenido generado por IA: puntuación de la ira en textos generados automáticamente para evitar respuestas agresivas en chatbots.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en el conjunto de evaluación (no se especifica el dataset):

| Metrica | Valor |
|---|---|
| Loss | 0.0569 |
| RMSE | 0.2384 |
| MAE | 0.1954 |
| Correlacion | 0.2824 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 500 MB en fp32 (124M parámetros × 4 bytes), reducible a ~250 MB con cuantización de 8 bits.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti, RTX 2060 o superiores. También puede ejecutarse en CPU con latencia aceptable.
- Compatible con GPUs consumer: sí, cabe en la mayoría de GPUs de consumo.
- Opciones de despliegue: puede servirse con `transformers` + PyTorch, o mediante `vLLM` y `TGI` si se convierte a formatos optimizados. También es compatible con `ONNX Runtime` para inferencia en CPU.
- Latencia y throughput: no se han publicado datos específicos; para un modelo de este tamaño, la inferencia en GPU suele ser inferior a 10 ms por muestra.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de análisis de emociones. Como referencia, el modelo base RoBERTa-base tiene la misma arquitectura y tamaño, pero sin el fine-tuning específico para ira. Otros modelos como `cardiffnlp/twitter-roberta-base-sentiment` o `j-hartmann/emotion-english-roberta-base` ofrecen clasificación de emociones categórica, pero no regresión continua. No se puede establecer una comparación cuantitativa sin datos adicionales.

## Limitaciones y advertencias

- La model card no proporciona información sobre el dataset de entrenamiento, lo que impide evaluar posibles sesgos o dominios de aplicación.
- La correlación reportada (0.2824) es baja, lo que sugiere que la precisión predictiva es limitada y puede no ser fiable para decisiones críticas.
- El modelo está basado en RoBERTa-base, que tiene una ventana de contexto de 512 tokens; textos más largos deben truncarse o dividirse.
- No se especifican los idiomas soportados; si se asume el entrenamiento de RoBERTa-base, el modelo funciona principalmente en inglés.
- La licencia MIT permite uso comercial, pero al ser un modelo derivado de RoBERTa, se deben respetar los términos de la licencia original de RoBERTa (MIT también).
- No se han documentado sesgos específicos, pero es probable que herede los sesgos de RoBERTa-base y del dataset de fine-tuning desconocido.

## Enlaces

- [HuggingFace: ajrayman/Anger_continuous](https://huggingface.co/ajrayman/Anger_continuous)
- [Modelo relacionado: ajrayman/machiavellianism_continuous](https://huggingface.co/ajrayman/machiavellianism_continuous)
- [Modelo relacionado: ajrayman/Morality_continuous](https://huggingface.co/ajrayman/Morality_continuous)
- [Artículo sobre mapeo de conceptos emocionales con IA](https://phys.org/news/2026-08-ai-prompts-tool-emotion-concepts.html)
