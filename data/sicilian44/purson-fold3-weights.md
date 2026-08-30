# Sicilian44/Purson-fold3-weights

## Resumen

Purson-fold3-weights es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario Sicilian44, entrenado sobre el modelo base OpenGVLab/InternVL3-78B-hf. Se trata de un fine-tuning realizado con la librería PEFT y el framework Llama-Factory, destinado a la generación de texto conversacional. El adaptador ocupa 0,9 GB en formato safetensors y está diseñado para ser cargado junto al modelo base de 78.000 millones de parámetros.

El modelo fue entrenado sobre un dataset denominado `t04_fold2_train` durante 3 épocas, con una tasa de aprendizaje de 0,0001 y un optimizador AdamW. La tarjeta del modelo está generada automáticamente y carece de descripción detallada, por lo que la información disponible es muy limitada. La relevancia de este adaptador radica en su potencial para especializar un modelo multimodal de gran tamaño en tareas específicas, aunque no se han publicado resultados ni casos de uso concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre OpenGVLab/InternVL3-78B-hf |
| Parametros totales | No disponible (el adaptador tiene pesos LoRA; el base tiene 78B) |
| Parametros activos | No aplica (adaptador LoRA) |
| Longitud de contexto | No disponible (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (solo safetensors del adaptador) |
| Idiomas soportados | No disponible |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en InternVL3-78B, un modelo multimodal de gran escala desarrollado por OpenGVLab que combina visión y lenguaje. La arquitectura del adaptador es LoRA, que introduce matrices de bajo rango en las capas del transformer para ajustar el modelo sin modificar todos los pesos. El entrenamiento se realizó con el framework Llama-Factory y PEFT, usando un dataset llamado `t04_fold2_train`. Los hiperparámetros incluyen learning rate de 0,0001, batch size de 1 con acumulación de gradientes de 8 (batch efectivo de 8), optimizador AdamW con betas (0,9, 0,999), scheduler cosine con warmup del 5% y 3 épocas. No se especifican detalles sobre la composición del dataset ni sobre técnicas como RLHF o DPO.

## Capacidades

- No se dispone de información específica sobre las capacidades añadidas por este adaptador.
- Al basarse en InternVL3-78B, hereda las capacidades del modelo base: comprensión de imágenes y texto, razonamiento multimodal, generación de texto y conversación.
- No hay evidencia de soporte para tool calling, agentes o razonamiento multi-paso específico en este adaptador.
- Las capacidades multilingües dependen del modelo base, pero no se han documentado para este adaptador.

## Casos de uso

No se dispone de información documentada sobre casos de uso específicos para este adaptador. Dado que es un fine-tuning sobre InternVL3-78B, podría emplearse en tareas similares a las del modelo base, como respuesta a preguntas visuales, análisis de documentos con imágenes o asistentes conversacionales multimodales, pero estas aplicaciones son hipotéticas y no están validadas por el autor. Se recomienda consultar la documentación del modelo base para conocer sus usos habituales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La sección `model-index` de la tarjeta declara un benchmark llamado `fold2` con resultados vacíos.

## Requisitos de hardware

- Al ser un adaptador LoRA, para su uso se requiere cargar el modelo base InternVL3-78B completo, que necesita aproximadamente 156 GB de VRAM en precisión fp16 (sin cuantización). Esto supera la capacidad de GPUs de consumo habituales.
- Se recomiendan GPUs de datacenter como A100 80GB (múltiples unidades), H100 o similar, con memoria agregada suficiente.
- El adaptador en sí ocupa 0,9 GB y puede cargarse en cualquier GPU, pero la inferencia exige el modelo base completo.
- Para despliegue se puede usar vLLM, TGI o transformers con PEFT, aunque se requiere configuración multi-GPU o cuantización (por ejemplo, bitsandbytes) para reducir los requisitos de memoria.
- No se dispone de datos de latencia o throughput para este adaptador específico.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables específicos para este adaptador, y al ser un fine-tuning no publicado, no existen referencias de rendimiento frente a otras alternativas.

## Limitaciones y advertencias

- No hay documentación sobre sesgos, alucinaciones o limitaciones idiomáticas específicas; se heredan las del modelo base InternVL3-78B.
- La licencia "other" no permite determinar restricciones de uso comercial; se recomienda revisar la licencia del modelo base y contactar al autor.
- Al ser un adaptador LoRA, no es un modelo autónomo: requiere el modelo base completo para funcionar, lo que complica el despliegue en entornos con recursos limitados.
- La falta de benchmarks y de descripción detallada impide evaluar la calidad del ajuste o su idoneidad para producción.
- El dataset de entrenamiento no está documentado, por lo que se desconoce su procedencia y posibles sesgos.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/Sicilian44/Purson-fold3-weights
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3-78B-hf
