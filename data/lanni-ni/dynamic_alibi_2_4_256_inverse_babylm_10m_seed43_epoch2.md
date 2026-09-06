# Lanni-ni/dynamic_alibi_2_4_256_inverse_babylm_10m_seed43_epoch2

## Resumen

El modelo `dynamic_alibi_2_4_256_inverse_babylm_10m_seed43_epoch2` es un modelo de lenguaje de tamaño pequeño desarrollado por el usuario `Lanni-ni` y publicado en Hugging Face. Según el nombre y las etiquetas, implementa una variante de atención con sesgos lineales (ALiBi) dinámica, siguiendo el enfoque descrito en el artículo de arXiv 1910.09700. Los pesos se distribuyen en formato safetensors y el modelo se carga con la librería Transformers, con pipeline de generación de texto.

A pesar de que el nombre sugiere 10 millones de parámetros, los pesos reales en safetensors suman 27.447.040 parámetros. El modelo fue creado el 6 de septiembre de 2026 y su repositorio ocupa 0,1 GB. La model card publicada es una plantilla generada automáticamente y no contiene información sobre arquitectura, datos de entrenamiento, idiomas, licencia ni rendimiento, por lo que no se pueden confirmar sus capacidades más allá de la generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención ALiBi dinámica (inferido del nombre y del tag arXiv:1910.09700; no confirmado) |
| Parametros totales | 27.447.040 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (ALiBi permite extrapolación, pero no se especifica) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (el corpus BabyLM suele ser inglés, pero no se confirma) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card es una plantilla autogenerada y no aporta información sobre la arquitectura ni el proceso de entrenamiento. El nombre del modelo y las etiquetas permiten inferir que se trata de un modelo basado en Transformers con una variante de ALiBi (Attention with Linear Biases) dinámica, en línea con el paper de Press et al. (arXiv:1910.09700). El término «inverse» podría indicar una inversión en el mecanismo de atención, pero no hay documentación al respecto. Tampoco se disponen de datos sobre el dataset de entrenamiento, aunque el sufijo «babylm» sugiere que se utilizó el corpus del desafío BabyLM. No hay indicios de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Generación de texto: confirmada por el pipeline de Hugging Face.
- Razonamiento, código, matemáticas, visión: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Extrapolación de longitud de contexto: posible gracias a ALiBi, pero no evaluada.

## Casos de uso

No se dispone de información suficiente para enumerar casos de uso concretos y verificados. Los siguientes son usos potenciales derivados de su tamaño y de la arquitectura ALiBi, pero no están respaldados por documentación ni benchmarks.

- Investigación en extrapolación de longitud: al usar ALiBi, el modelo podría servir para estudiar cómo se comporta la atención con sesgos lineales en secuencias más largas que las de entrenamiento.
- Educación en arquitecturas de atención: por su tamaño reducido, es fácil de inspeccionar y analizar para aprender sobre el mecanismo de atención.
- Prototipado rápido: como modelo de generación de texto de 27M, se puede cargar en GPU pequeñas y usar en pruebas de concepto.
- Fine-tuning experimental: al ser pequeño, permite ajustar el modelo en tareas específicas con bajo coste computacional.
- Reproducibilidad: el número de semilla (seed43) sugiere que está orientado a reproducir experimentos.
- Comparación de variantes de ALiBi: se puede comparar con el modelo hermano `dynamic_alibi_2_4_256_babylm_100m_epoch2` para estudiar el efecto del tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27.447.040 parámetros, en fp32 el modelo ocupa aproximadamente 110 MB; en fp16, unos 55 MB. La inferencia requiere menos de 1 GB de VRAM, e incluso puede ejecutarse en CPU.
- GPU recomendadas: cualquier GPU de consumo con al menos 2 GB de VRAM (por ejemplo, GTX 1060, RTX 3050 o superiores).
- Si cabe en consumer GPU: sí, es trivial para cualquier GPU moderna.
- Opciones de despliegue: Hugging Face Transformers, vLLM (si se convierte el formato), llama.cpp si se convierte a GGUF, Ollama con integración de Transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Modelo comparado: `dynamic_alibi_2_4_256_babylm_100m_epoch2` de la misma autora, que según el nombre tiene 100M de parámetros. No se dispone de datos técnicos ni benchmarks para comparar. Otras alternativas de modelos BabyLM no están documentadas en la información proporcionada. Por tanto, la comparativa no disponible.

## Limitaciones y advertencias

- Model card sin completar: no hay información sobre sesgos ni riesgos.
- Riesgo de alucinación: al ser un modelo pequeño (27M), su capacidad de razonamiento y memoria es limitada.
- Licencia no disponible: el uso comercial no está definido.
- Idioma no especificado: probablemente inglés, pero no confirmado.
- Sin evaluaciones publicadas: no se puede evaluar su calidad real.
- Nombre confuso: «10m» en el nombre no coincide con los parámetros reales (27M), lo que puede causar errores al seleccionar el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/Lanni-ni/dynamic_alibi_2_4_256_inverse_babylm_10m_seed43_epoch2
- Paper ALiBi: https://arxiv.org/abs/1910.09700
- Modelo hermano: https://huggingface.co/Lanni-ni/dynamic_alibi_2_4_256_babylm_100m_epoch2
