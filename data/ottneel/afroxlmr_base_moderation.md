# Ottneel/afroxlmr_base_moderation

## Resumen

afroxlmr_base_moderation es un modelo de clasificación de textos desarrollado por Ottneel mediante fine-tuning del checkpoint Davlan/afro-xlmr-base. Está orientado a tareas de moderación de contenido, aunque el autor no especifica el tipo exacto de contenido que detecta ni el dataset utilizado para el ajuste. Con 278.045.955 parámetros, es un modelo compacto que puede ejecutarse en GPUs de gama media o incluso en CPU.

La arquitectura es XLM-RoBERTa, un transformer encoder multilingüe originariamente propuesto por Conneau et al. (2020). El checkpoint base fue diseñado para lenguas africanas, pero esta ficha no incluye información sobre los idiomas cubiertos por el fine-tuning. Tampoco se documenta la longitud de contexto, las cuantizaciones disponibles ni benchmarks estandarizados.

El modelo se publica con licencia MIT y sus pesos están en formato safetensors. Su relevancia radica en que puede servir como base para flujos de moderación automática de textos en escenarios con pocos recursos computacionales, siempre que se valide con datos propios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (transformer encoder) |
| Parámetros totales | 278.045.955 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint Davlan/afro-xlmr-base. La arquitectura es XLM-RoBERTa, un transformer encoder con atención estándar, originalmente diseñado para representaciones multilingües. El proceso de ajuste se realizó durante 5 épocas con un learning rate de 2e-05, tamaño de batch 16, optimizador AdamW con betas (0.9, 0.999) y entrenamiento en precisión mixta nativa. El autor declara que el dataset de entrenamiento es desconocido, y no se indican técnicas de RLHF ni DPO.

Las métricas finales declaradas en la model card son una loss de 1.0971, una accuracy de 0.6849 y un macro F1 de 0.6610 en el conjunto de evaluación.

## Capacidades

- Clasificación de textos para moderación: el modelo asigna una etiqueta de clasificación a textos de entrada, orientado a detectar contenido que requiere moderación.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-step.
- No se documenta soporte multimodal (visión, audio) ni modo de pensamiento.
- La capacidad multilingüe procede del modelo base Afro-XLM-R, pero no se especifica qué idiomas cubre el fine-tuning.

## Casos de uso

- Moderación de comentarios en foros: el modelo puede clasificar automáticamente comentarios de usuarios para identificar contenido que incumple las normas de la comunidad. Su tamaño compacto permite inferencia en tiempo real con recursos limitados.
- Filtrado de reseñas de productos: en plataformas de comercio electrónico, puede usarse para detectar reseñas con lenguaje abusivo, spam o contenido no relevante, y así priorizar la revisión humana.
- Moderación de chats en tiempo real: el modelo puede integrarse en sistemas de mensajería para señalar mensajes que requieran intervención de un moderador, gracias a su peso de 278M y su compatibilidad con pipelines de transformers.
- Clasificación de contenido en redes sociales: puede emplearse como primera capa de filtrado en feeds sociales para detectar publicaciones con contenido potencialmente inapropiado.
- Filtrado de mensajes en comunidades de soporte: en sistemas de correo o grupos de asistencia, el modelo puede identificar mensajes tóxicos o abusivos antes de que lleguen a otros usuarios.
- Preprocesamiento para sistemas de recomendación: el modelo puede filtrar contenido de baja calidad o inapropiado antes de alimentar otros sistemas de aprendizaje automático, reduciendo la exposición de los usuarios a material no deseado.

Estos casos deben validarse con datos propios, dado que el dataset de entrenamiento no está documentado.

## Benchmarks y rendimiento

La model card declara los siguientes resultados en el conjunto de evaluación del autor:

| Métrica | Valor |
|---|---|
| Loss | 1.0971 |
| Accuracy | 0.6849 |
| Macro F1 | 0.6610 |

No se han publicado benchmarks estandarizados como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos similares en la información disponible.

## Requisitos de hardware

- VRAM estimada: en fp32, los pesos del modelo ocupan aproximadamente 1.1 GB (278.045.955 parámetros × 4 bytes); en fp16, alrededor de 0.6 GB. Se recomienda al menos 2 GB de VRAM para inferencia con overhead del framework.
- GPU recomendada: el modelo cabe en GPUs de gama consumer como RTX 3050, RTX 3060 o T4. Para despliegues con alta concurrencia, una A10 o superior resulta adecuada.
- Sí cabe en consumer GPU.
- Opciones de despliegue: puede cargarse con la librería transformers (PyTorch) y exportarse a ONNX. También es potencialmente compatible con vLLM y TGI para servicios de clasificación, aunque se debe validar.
- Latencia: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de moderación de la misma categoría. El modelo base Davlan/afro-xlmr-base comparte arquitectura y número de parámetros, pero no está ajustado para moderación y no se dispone de datos comparativos formales.

## Limitaciones y advertencias

- El dataset de entrenamiento se describe como “unknown dataset”, lo que impide conocer el dominio, la distribución de clases y el tipo exacto de moderación.
- Las métricas de evaluación (accuracy de 0.6849 y macro F1 de 0.6610) indican un rendimiento moderado, con margen de mejora significativo.
- No se proporciona documentación sobre los idiomas soportados, la longitud de contexto ni cuantizaciones disponibles.
- Al estar basado en Afro-XLM-R, puede heredar sesgos del corpus de preentrenamiento y no está garantizado para todos los idiomas africanos.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, por lo que no ha sido validado por la comunidad.
- Aunque la licencia MIT permite uso comercial, el origen legal del dataset de fine-tuning no está aclarado, lo que puede suponer un riesgo para proyectos productivos.
- No se documenta el comportamiento ante contenido multimodal, contexto muy largo ni herramientas de agentes.

## Enlaces

- HuggingFace: https://huggingface.co/Ottneel/afroxlmr_base_moderation
- Modelo base: https://huggingface.co/Davlan/afro-xlmr-base
- Paper relacionado (AfroXLMR-Social): https://arxiv.org/html/2503.18247v3
