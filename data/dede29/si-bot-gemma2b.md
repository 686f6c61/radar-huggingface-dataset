# Dede29/si-bot-gemma2b

## Resumen
El modelo `Dede29/si-bot-gemma2b` es una variante del modelo Gemma 2B subida a Hugging Face por el usuario Dede29, utilizando la librería KerasHub. Se trata de un modelo de generación de texto (pipeline `text-generation`) cuya arquitectura corresponde a la familia Gemma, con 18 capas, 8 cabezas de consulta y 1 cabeza de clave/valor, lo que sugiere una implementación de atención multi-consulta (MQA). El repositorio tiene un tamaño de 10 GB, lo que indica que los pesos están probablemente en precisión mixta (fp16) o similar.

No se dispone de información adicional sobre el propósito específico del modelo, su proceso de entrenamiento, la licencia o los idiomas soportados. El nombre "si-bot" podría sugerir un uso como bot conversacional, pero no hay documentación que lo confirme. Al ser una adaptación de Gemma 2B, se espera que herede las capacidades generales de generación de texto del modelo base, aunque no se han publicado detalles concretos.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma) |
| Parametros totales | no disponible (nombre sugiere ~2 mil millones) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (config no lo especifica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | KerasHub (formato no especificado) |

Detalles de configuración extraídos de la model card:
- `vocabulary_size`: 256000
- `num_layers`: 18
- `num_query_heads`: 8
- `num_key_value_heads`: 1
- `hidden_dim`: 2048
- `intermediate_dim`: 32768
- `head_dim`: 256
- `layer_norm_epsilon`: 1e-06
- `dropout`: 0
- `query_head_dim_normalize`: True
- `use_post_ffw_norm`: False
- `use_post_attention_norm`: False
- `final_logit_soft_cap`: None
- `attention_logit_soft_cap`: None
- `sliding_window_size`: 4096
- `use_sliding_window_attention`: False

## Arquitectura y entrenamiento
La arquitectura corresponde a un transformer decoder de la familia Gemma, con 18 capas, 8 cabezas de consulta y 1 cabeza de clave/valor (MQA), lo que reduce el uso de memoria en comparación con la atención multi-cabeza estándar. La dimensión oculta es de 2048 y la dimensión intermedia de 32768, con un tamaño de cabeza de 256. No se utiliza atención de ventana deslizante (`use_sliding_window_attention: False`), a pesar de que se define un tamaño de ventana de 4096.

No se ha publicado información sobre el entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. El modelo se ha subido mediante KerasHub, lo que permite su uso con backends de JAX, TensorFlow y PyTorch, pero se desconoce si ha sido fine-tuneado a partir del Gemma 2B original o si se trata de un checkpoint intermedio.

## Capacidades
No se dispone de información específica sobre las capacidades de este modelo. Al ser una variante de Gemma 2B, se espera que pueda realizar tareas de generación de texto, pero no se han documentado capacidades adicionales como tool calling, razonamiento multi-paso, soporte de agentes o capacidades multilingües. La model card no incluye ninguna descripción funcional más allá de la configuración técnica.

## Casos de uso
No se han documentado casos de uso específicos para este modelo. Dado que no hay información sobre su entrenamiento o propósito, no es posible recomendar aplicaciones concretas con fundamento. Cualquier uso debería basarse en pruebas empíricas por parte del desarrollador.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
No se especifican requisitos de hardware en la información proporcionada. Dado el tamaño del repositorio (10 GB) y la arquitectura de ~2 mil millones de parámetros, se puede estimar que la inferencia en precisión fp16 requeriría al menos 4 GB de VRAM, pero este dato no está confirmado. No se mencionan opciones de despliegue ni métricas de latencia o throughput.

## Comparativa con modelos similares
No se dispone de datos de rendimiento o características específicas de este modelo para compararlo con alternativas. La única referencia posible es el modelo base `google/gemma-2b`, del cual se desconoce si este es un fine-tune o una variante. Sin información adicional, no es posible establecer una comparativa fiable.

## Limitaciones y advertencias
- No se ha publicado información sobre sesgos, alucinaciones o limitaciones de contexto o idioma.
- La licencia es desconocida, por lo que no se puede garantizar su uso comercial o en producción sin verificar los términos.
- Al ser un modelo pequeño (2B), es probable que tenga limitaciones en tareas de razonamiento complejo o generación de código extenso, pero esto es una inferencia genérica y no un dato confirmado.
- No hay documentación sobre el proceso de entrenamiento, lo que dificulta evaluar su robustez o posibles problemas de seguridad.

## Enlaces
- [Hugging Face - Dede29/si-bot-gemma2b](https://huggingface.co/Dede29/si-bot-gemma2b)
