# Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_seed43_epoch6

## Resumen

Este modelo, publicado por el usuario Lanni-ni, es un modelo de lenguaje de pequeño tamaño con 45.694.080 parámetros. Su nombre indica que utiliza una variante dinámica de ALiBi (Attention with Linear Biases), técnica presentada en el paper arxiv:1910.09700, y que ha sido entrenado con el corpus BabyLM (100M de palabras) durante 6 épocas. El modelo se distribuye en formato safetensors y está pensado para tareas de generación de texto mediante la librería transformers.

La relevancia de este modelo radica en su potencial uso como banco de pruebas para investigar la extrapolación de longitud de contexto con ALiBi dinámico, así como para experimentos de fine-tuning en entornos con recursos limitados. Sin embargo, la información disponible es escasa: la model card está vacía y no se han publicado benchmarks, por lo que cualquier evaluación de capacidades debe realizarse de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención ALiBi dinámica (inferido del nombre y tags; no confirmado por documentación) |
| Parametros totales | 45.694.080 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Transformer con sesgo de atención lineal (ALiBi), según el tag `dynamic_alibi` y la referencia al paper arxiv:1910.09700. El nombre sugiere que se ha entrenado con el corpus BabyLM (100M de palabras) durante 6 épocas, pero no se dispone de documentación oficial que lo confirme. No hay información sobre el proceso de entrenamiento, hiperparámetros, técnicas de optimización ni composición exacta del dataset.

El tag `custom_code` indica que la implementación requiere código personalizado en transformers, probablemente porque la variante dinámica de ALiBi no está incluida en la librería estándar.

## Capacidades

No se han publicado evaluaciones de capacidades específicas. Como modelo de generación de texto, su función principal es el modelado de lenguaje, pero no hay datos que confirmen habilidades concretas.

- Generación de texto: no disponible (sin benchmarks publicados)
- Razonamiento: no disponible
- Generación de código: no disponible
- Matemáticas: no disponible
- Soporte de tool calling / function calling: no disponible
- Soporte de agentes y multi-step reasoning: no disponible
- Capacidades multilingües: no disponible (no se especifican idiomas)
- Capacidades especiales (vision, audio, thinking mode): no disponible

## Casos de uso

Los siguientes casos son usos potenciales basados en el tamaño y la arquitectura del modelo, no validados por benchmarks.

- Investigación en extrapolación de contexto: el modelo está diseñado con ALiBi dinámico, lo que permite estudiar cómo maneja secuencias más largas que las vistas en entrenamiento. Se usaría en experimentos académicos comparando la degradación de la perplejidad en longitudes crecientes.
- Fine-tuning en tareas de clasificación de texto: al tener solo 45,7 millones de parámetros, se puede ajustar en datasets pequeños con pocos recursos computacionales, ideal para entornos académicos o prototipos.
- Educación en procesamiento del lenguaje natural: sirve como ejemplo práctico de una arquitectura Transformer con sesgo de atención lineal, permitiendo a estudiantes inspeccionar el efecto de ALiBi en la atención.
- Generación de texto en dispositivos edge: su tamaño reducido permite ejecutarlo en CPU o GPUs de gama baja, útil para asistentes de texto locales con recursos limitados.
- Evaluación de técnicas de atención: se puede comparar con modelos baseline del mismo tamaño para medir el impacto del ALiBi dinámico en tareas de lenguaje.
- Prototipado de aplicaciones conversacionales simples: para chatbots de ámbito restringido donde no se requiera gran capacidad, el modelo puede servir como base para fine-tuning con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (los pesos ocupan aproximadamente 174 MB); en FP16, alrededor de 87 MB. No se dispone de información sobre cuantizaciones.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, por ejemplo NVIDIA GTX 1050, RTX 3050. También es viable ejecutarlo en CPU.
- Compatibilidad con consumer GPU: sí, cabe en prácticamente cualquier GPU de consumo.
- Opciones de despliegue: transformers (con `custom_code`), llama.cpp, Ollama (si el formato de pesos es compatible). No se ha verificado la compatibilidad con todos los runtimes.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre comparativas. El modelo no tiene benchmarks publicados, por lo que no es posible compararlo con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de información.
- Riesgo de alucinación: probablemente alto debido al tamaño reducido y a los datos de entrenamiento limitados (posiblemente BabyLM).
- Limitaciones de contexto: no se especifica la longitud de contexto; ALiBi permite extrapolación, pero no hay datos que confirmen su comportamiento.
- Restricciones de licencia: la licencia no está especificada, por lo que el uso comercial es incierto.
- Caveat importante para producción: la model card está vacía y el modelo requiere `custom_code`, lo que implica que no hay garantías de soporte ni documentación de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_seed43_epoch6
- Paper de ALiBi (arxiv:1910.09700): https://arxiv.org/abs/1910.09700
- Modelo similar sin seed43: https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_epoch6
