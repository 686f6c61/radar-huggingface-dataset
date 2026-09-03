# ajrayman/Consc_binary

## Resumen

Consc_binary es un modelo de clasificación de texto binario, resultado de un fine-tuning de microsoft/deberta-v3-base, desarrollado por el usuario ajrayman. Con 184.423.682 parámetros, está orientado a tareas de clasificación de secuencias (text-classification) y se distribuye bajo licencia MIT. El modelo se entrenó durante 8 épocas con un learning rate de 2e-05 y alcanza una precisión del 75,59 % y un AUC de 0,8421 en el conjunto de evaluación. No se ha especificado el dataset de entrenamiento ni los idiomas soportados, y la model card generada automáticamente no incluye descripción detallada del modelo ni de sus usos previstos. A pesar de su tamaño moderado, su relevancia radica en ser un ejemplo de fine-tuning de DeBERTa-v3-base con pesos en formato safetensors, listo para su uso con la librería Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3 (base) |
| Parametros totales | 184.423.682 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DeBERTa-v3, un transformer encoder con atención desenredada y mecanismos de enmascaramiento mejorados. Se trata de un fine-tuning del modelo preentrenado microsoft/deberta-v3-base, adaptado para una tarea de clasificación binaria de texto. El entrenamiento se realizó con los siguientes hiperparámetros: learning rate de 2e-05, batch size de 32, optimizador Adam (betas 0.9 y 0.999), scheduler lineal con warmup ratio de 0.06, y 8 épocas. No se especifica el dataset utilizado (aparece como "None dataset" en la model card), ni se menciona el uso de técnicas como RLHF o DPO. La pérdida final en validación fue de 0.5621, con una precisión de 0.7559, recall de 0.8354, F1 de 0.7737 y AUC de 0.8421.

## Capacidades

- Clasificación de texto binaria: el modelo está entrenado para asignar una de dos etiquetas a una secuencia de texto, aunque no se detalla la naturaleza exacta de las clases.
- Fine-tuning sobre DeBERTa-v3-base: hereda las capacidades de representación del modelo base, que incluyen comprensión contextual profunda y buen rendimiento en tareas de lenguaje natural.
- Compatible con la librería Transformers: puede cargarse y usarse directamente con `pipeline("text-classification")` o mediante la API de Transformers.
- Formato safetensors: los pesos están en un formato seguro y eficiente para su carga en producción.
- No se han documentado capacidades adicionales como generación de texto, tool calling, agentes, visión o audio.

## Casos de uso

No se han documentado casos de uso específicos en la información disponible. Dado que se trata de un modelo de clasificación binaria de texto, podría aplicarse a tareas genéricas como:

- Análisis de sentimiento (positivo/negativo) en reseñas o comentarios.
- Detección de spam o contenido no deseado en correos o mensajes.
- Clasificación de toxicidad en foros o redes sociales.
- Filtrado de contenido inapropiado en plataformas de contenido generado por usuarios.
- Diagnóstico de intención en chatbots (por ejemplo, si una consulta es de soporte o de ventas).
- Detección de noticias falsas o desinformación (verdadero/falso).

Estos usos son hipotéticos y no están confirmados por el autor; se basan únicamente en la naturaleza del modelo como clasificador binario.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en el conjunto de evaluación (declarados por el autor):

| Metrica | Valor |
|---|---|
| Loss | 0.5621 |
| Accuracy | 0.7559 |
| Precision | 0.7204 |
| Recall | 0.8354 |
| F1 | 0.7737 |
| AUC | 0.8421 |

Además, se muestran los resultados por época durante el entrenamiento:

| Epoca | Validation Loss | Accuracy | Precision | Recall | F1 | AUC |
|:-----:|:---------------:|:--------:|:---------:|:------:|:------:|:---:|
| 1 | 0.5627 | 0.6949 | 0.8095 | 0.5087 | 0.6248 | 0.8117 |
| 2 | 0.6050 | 0.6936 | 0.6307 | 0.9327 | 0.7525 | 0.8089 |
| 3 | 0.5123 | 0.7509 | 0.7014 | 0.8728 | 0.7778 | 0.8400 |
| 4 | 0.5966 | 0.7148 | 0.6525 | 0.9177 | 0.7627 | 0.8393 |
| 5 | 0.5621 | 0.7559 | 0.7204 | 0.8354 | 0.7737 | 0.8421 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

No se dispone de datos oficiales sobre requisitos de hardware. A partir del número de parámetros (184 M), se pueden hacer estimaciones orientativas:

- VRAM estimada para inferencia en FP32: ~740 MB; en FP16: ~370 MB; en int8: ~185 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP16 (por ejemplo, NVIDIA GTX 1650, RTX 3060, etc.). Para producción con mayor throughput, se recomienda una GPU con 4 GB o más.
- El modelo cabe en GPUs de consumo (consumer) como RTX 3060, RTX 4060, etc.
- Opciones de despliegue: puede servirse con la librería Transformers, o mediante servidores de inferencia como vLLM, TGI o Hugging Face Inference Endpoints (el tag `endpoints_compatible` sugiere compatibilidad con los endpoints de Hugging Face).
- Latencia y throughput: no disponibles; dependerán del hardware y de la optimización.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. Como referencia, el modelo base microsoft/deberta-v3-base tiene 184 M de parámetros y una longitud de contexto de 512 tokens, pero no se han publicado métricas comparativas de Consc_binary frente a otros clasificadores binarios.

## Limitaciones y advertencias

- No se ha especificado el dataset de entrenamiento, por lo que se desconocen los posibles sesgos introducidos por los datos.
- La model card no incluye una descripción de limitaciones ni de riesgos de alucinación (aunque al ser un clasificador, el riesgo de alucinación es menor que en modelos generativos).
- No se indica el idioma o idiomas soportados; se asume que el modelo base DeBERTa-v3-base está entrenado principalmente en inglés, pero no está confirmado.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- El modelo se generó automáticamente con `generated_from_trainer`, lo que sugiere que la model card no ha sido revisada manualmente y puede carecer de detalles importantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ajrayman/Consc_binary
- Modelo base: https://huggingface.co/microsoft/deberta-v3-base
