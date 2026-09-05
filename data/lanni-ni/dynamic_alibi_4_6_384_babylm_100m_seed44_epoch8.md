# Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_seed44_epoch8

## Resumen

El modelo **Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_seed44_epoch8** es un modelo de lenguaje pequeño desarrollado por Lanni-ni, con un total de 45.694.080 parámetros. Se trata de un transformer decodificador que incorpora atención con sesgos lineales (ALiBi), una técnica introducida en el paper "Train Short, Test Long: Attention with Linear Biases Enables Input Length Extrapolation" (arXiv:1910.09700). El nombre del modelo sugiere una variante con ALiBi dinámico, posiblemente ajustando la pendiente de los sesgos durante el entrenamiento o la inferencia.

El modelo está publicado en HuggingFace con el pipeline de text-generation y pesos en formato safetensors. El identificador "babylm_100m" y el sufijo "seed44_epoch8" indican que forma parte de una serie de experimentos sobre el benchmark BabyLM, probablemente entrenado durante 8 épocas con una semilla concreta. La model card no incluye información detallada sobre el entrenamiento, los datos utilizados ni la licencia. Por su tamaño reducido, está orientado a entornos con recursos limitados o a investigación en arquitecturas de atención con extrapolación de longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador con atención ALiBi (dynamic_alibi) |
| Parametros totales | 45.694.080 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se basa en un transformer decodificador estándar, pero con la particularidad de incorporar sesgos lineales (ALiBi) en lugar de posicionamiento absoluto o relativo. Esta técnica, descrita en arXiv:1910.09700, añade un sesgo lineal proporcional a la distancia entre tokens, lo que permite extrapolar a secuencias más largas que las vistas durante el entrenamiento. El prefijo "dynamic" sugiere que la pendiente de estos sesgos se modifica dinámicamente, aunque no se dispone de documentación técnica que detalle esta variante.

El modelo se entrenó en el contexto del benchmark BabyLM, probablemente sobre un corpus pequeño de texto en inglés, aunque no se especifica la composición exacta del dataset ni el número de tokens. El sufijo "seed44_epoch8" indica que se utilizó la semilla 44 y se entrenó durante 8 épocas. No se menciona el uso de RLHF, DPO ni ninguna técnica de alineación posterior. Tampoco se detalla el régimen de entrenamiento (precisión, hardware, tiempos) en la model card.

## Capacidades

- Generación de texto: el modelo es capaz de generar texto en el idioma en el que fue entrenado, aunque no se especifica cuál es.
- Extrapolación de longitud: gracias a ALiBi, el modelo puede manejar secuencias más largas que las de entrenamiento, aunque la longitud máxima efectiva no está documentada.
- Investigación en arquitecturas de atención: sirve como modelo de referencia para estudiar el comportamiento de ALiBi dinámico en modelos pequeños.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-step, visión ni audio.
- No se ha publicado información sobre soporte multilingüe.

## Casos de uso

- Experimentación académica: el modelo puede utilizarse para estudiar el efecto de ALiBi dinámico en modelos de menos de 50 millones de parámetros, comparándolo con variantes estándar de ALiBi o con posicionamiento relativo.
- Prototipado de aplicaciones de texto: al ser pequeño, permite iterar rápidamente en tareas de generación de texto simple, como autocompletado o reescritura de párrafos cortos, en entornos de desarrollo con recursos limitados.
- Fine-tuning en tareas específicas: el modelo puede servir como base para ajuste fino en dominios concretos (por ejemplo, análisis de sentimiento, clasificación de texto) donde no se requiera un modelo grande.
- Educación y divulgación: por su tamaño reducido y la implementación de ALiBi, es útil para demostrar conceptos de extrapolación de contexto en cursos de procesamiento del lenguaje natural.
- Evaluación de técnicas de cuantización: los pesos en safetensors permiten experimentar con cuantización a 8 bits o 4 bits para estudiar la pérdida de rendimiento en modelos pequeños.
- Comparación de semillas y configuraciones: la serie de modelos de Lanni-ni (con distintas semillas y épocas) permite analizar la variabilidad del entrenamiento en arquitecturas con ALiBi dinámico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con un modelo de 45.694.080 parámetros en FP32, el peso ocupa aproximadamente 183 MB. Con cuantización a 8 bits, se reduce a unos 46 MB; a 4 bits, unos 23 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1650, RTX 3050 o superiores pueden ejecutarlo sin problemas.
- Cabe en consumer GPU: sí, incluso en GPUs integradas o en CPU con suficiente RAM.
- Opciones de despliegue: puede cargarse con la librería transformers en Python, o convertirse a GGUF para usarse con llama.cpp u Ollama. También es compatible con vLLM y TGI para despliegue en servidores, aunque por su tamaño no aporta ventajas significativas de throughput frente a modelos más grandes.
- Latencia y throughput estimados: no disponibles. Al ser un modelo pequeño, la latencia es mínima en GPU moderna, pero no se han publicado mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_seed44_epoch8 | 45.694.080 | no disponible | no disponible | HuggingFace |
| Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_epoch6 | no disponible | no disponible | no disponible | HuggingFace |
| Lanni-ni/dynamic_forgetting_4_6_384_babylm_100m | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de información sobre benchmarks, contexto o rendimiento de los modelos comparables de la misma autora. La comparativa se limita a la disponibilidad y a los metadatos publicados.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se ha publicado información sobre sesgos en el modelo.
- Riesgo de alucinacion: al ser un modelo pequeño y sin datos de entrenamiento documentados, es probable que presente alucinaciones frecuentes, especialmente en tareas de razonamiento o conocimiento factual.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no están documentados. No se recomienda asumir soporte multilingüe.
- Restricciones de licencia para uso comercial: la licencia aparece como "no disponible". Esto implica que no se puede confirmar si el modelo puede usarse en proyectos comerciales. Se debe contactar con el autor antes de cualquier uso comercial.
- Caveat para produccion: la model card es una plantilla autogenerada sin información sustancial. No se han publicado evaluaciones de seguridad, robustez ni rendimiento. El modelo no está listo para entornos de producción sin una evaluación exhaustiva previa.

## Enlaces

- HuggingFace: https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_seed44_epoch8
- Paper de ALiBi (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
- Modelo similar (epoch6): https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_epoch6
- Perfil del autor: https://huggingface.co/Lanni-ni
