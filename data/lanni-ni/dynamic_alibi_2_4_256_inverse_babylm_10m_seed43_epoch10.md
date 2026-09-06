# Lanni-ni/dynamic_alibi_2_4_256_inverse_babylm_10m_seed43_epoch10

## Resumen
El modelo `Lanni-ni/dynamic_alibi_2_4_256_inverse_babylm_10m_seed43_epoch10` es un modelo de lenguaje pequeño desarrollado por Lanni-ni (Lanni Bu), investigador en procesamiento del lenguaje natural. Se trata de un experimento de investigación que combina la técnica de atención con sesgos lineales (ALiBi) en una variante dinámica, entrenado en el contexto del benchmark BabyLM, que evalúa el aprendizaje del lenguaje con datos limitados. El modelo tiene 27.447.040 parámetros y se distribuye en formato safetensors, con pipeline de generación de texto.

La model card es una plantilla automática de HuggingFace y no contiene información detallada sobre arquitectura, datos de entrenamiento, licencia ni rendimiento. El nombre del modelo sugiere una configuración de 2 capas, 4 cabezas de atención y dimensión de modelo 256, junto con una semilla de 43 y 10 épocas de entrenamiento, aunque estos datos no están confirmados en la documentación. Al tratarse de un modelo de investigación con escasa documentación, su uso principal es experimental.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención ALiBi dinámica (inferido del nombre y tags) |
| Parámetros totales | 27.447.040 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El nombre del modelo indica que utiliza una variante de ALiBi (Attention with Linear Biases), una técnica que añade sesgos lineales a las puntuaciones de atención para permitir la extrapolación de longitudes de secuencia mayores durante la inferencia. La etiqueta "dynamic_alibi" sugiere una implementación dinámica de estos sesgos, y el tag "custom_code" indica que se requiere código personalizado para cargar el modelo correctamente. La configuración "2_4_256" apunta a un transformer de 2 capas, 4 cabezas de atención y dimensión de modelo 256, aunque esto no está documentado de forma explícita.

En cuanto al entrenamiento, el término "inverse_babylm_10m" sugiere que el modelo fue entrenado en el marco del benchmark BabyLM, que evalúa el aprendizaje de lenguaje con corpus limitados (posiblemente 10 millones de palabras). No se dispone de información sobre la composición del dataset, el procedimiento de entrenamiento, los hiperparámetros ni si se aplicaron técnicas como RLHF o DPO. La model card no proporciona ningún detalle al respecto.

## Capacidades
- Generación de texto: el modelo está configurado con el pipeline `text-generation`.
- No se dispone de información sobre soporte de tool calling, function calling o agentes.
- No se conocen capacidades multilingües específicas.
- No se han documentado capacidades especiales como modo de razonamiento, visión o audio.
- La técnica ALiBi podría permitir cierta extrapolación de contexto, pero no hay datos públicos que lo confirmen.

## Casos de uso
- Investigación en arquitecturas de atención: el modelo puede utilizarse para estudiar el comportamiento de ALiBi dinámico en modelos pequeños y compararlo con variantes estándar.
- Experimentos con datos limitados: al estar relacionado con BabyLM, es útil para investigar cómo aprenden los modelos de lenguaje con corpus reducidos.
- Prototipado de modelos ligeros: con 27 millones de parámetros, es adecuado para pruebas rápidas en entornos con recursos limitados.
- Educación en NLP: puede emplearse como ejemplo práctico de un transformer pequeño con sesgos posicionales alternativos.
- Fine-tuning en tareas específicas: al ser un modelo base, podría ajustarse en tareas de clasificación o generación de texto de pequeña escala.
- Evaluación de técnicas de extrapolación de contexto: permite probar si la variante dinámica de ALiBi mejora la generalización a secuencias largas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras métricas de evaluación.

## Requisitos de hardware
- VRAM estimada: el modelo ocupa aproximadamente 110 MB en FP32 y 55 MB en FP16, por lo que cabe en cualquier GPU consumer, incluso en las más modestas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, como una RTX 3050 o inferior; también puede ejecutarse en CPU.
- Se puede ejecutar con la librería Transformers de HuggingFace directamente.
- No se han publicado cuantizaciones GGUF, por lo que llama.cpp u Ollama requerirían una conversión previa.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares
No se dispone de información suficiente para una comparativa rigurosa. El modelo pertenece a la familia de modelos BabyLM, pero no se han publicado métricas de rendimiento que permitan compararlo con otras alternativas de la misma categoría. Los modelos comparables de la iniciativa BabyLM (como los publicados en el repositorio oficial) no tienen datos públicos que puedan contrastarse.

## Limitaciones y advertencias
- La model card es una plantilla automática sin información sobre sesgos, riesgos o limitaciones técnicas.
- No se ha definido una licencia, lo que impide conocer las condiciones de uso comercial.
- No se han publicado benchmarks ni datos de evaluación, por lo que el rendimiento real es desconocido.
- No se documenta el corpus de entrenamiento, lo que dificulta valorar posibles sesgos lingüísticos o de contenido.
- El tag "custom_code" implica que la carga del modelo puede requerir código personalizado, lo que añade complejidad a su uso.
- Al ser un modelo de investigación con 14 descargas, no se recomienda su uso en entornos de producción.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/Lanni-ni/dynamic_alibi_2_4_256_inverse_babylm_10m_seed43_epoch10
- Página personal del autor: https://lanni-ni.github.io/
