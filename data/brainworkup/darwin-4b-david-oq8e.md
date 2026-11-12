# brainworkup/Darwin-4B-David-oQ8e

## Resumen

Darwin-4B-David-oQ8e es una versión cuantizada del modelo FINAL-Bench/Darwin-4B-David, publicada por el usuario brainworkup en Hugging Face. Se trata de un checkpoint multimodal (lenguaje más visión) que ha sido comprimido mediante la herramienta oQe (oMLX v0.7.3rc1) con una estrategia de cuantización de precisión mixta. El resultado es un modelo de 7.632 millones de parámetros almacenado en 8,3 GB, con un promedio efectivo de 8.665 bits por peso.

La relevancia de esta ficha radica en su formato: los pesos están preparados para MLX, el framework de Apple para ejecución de modelos en silicio de la serie M. Esto lo convierte en una opción interesante para desarrolladores que quieran ejecutar un modelo de casi 8.000 millones de parámetros con capacidades de visión en un Mac con memoria unificada, sin necesidad de GPUs dedicadas. La cuantización mixta preserva en BF16 un 2,2 % de los pesos (0.168B), presumiblemente capas sensibles a la precisión, mientras que el 97,8 % restante se almacena en affine 8-bit con grupos de 64.

No obstante, la información pública disponible es muy limitada: el autor no ha publicado la licencia, los idiomas soportados, la longitud de contexto, los datos de entrenamiento ni resultados de benchmarks. El modelo base, Darwin-4B-David, pertenece a la organización FINAL-Bench, de la que tampoco se ofrecen detalles en la model card. Por tanto, esta ficha debe leerse como una descripción técnica del artefacto de cuantización, no como una evaluación completa del modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + visión); detalles no disponibles |
| Parametros totales | 7.632.344.106 (7.632B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Mixta: affine 8-bit grupo 64 (97,8 % de pesos) + BF16 (2,2 %) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (MLX), 8,3 GB en repo |
| Bits efectivos por peso | 8,665 |
| Componentes | Lenguaje: 7.465B (7.932 GB); Visión: 0.167B (0.335 GB) |
| Libreria | mlx |
| Modelo base | FINAL-Bench/Darwin-4B-David |

## Arquitectura y entrenamiento

La información disponible no permite describir la arquitectura interna del modelo base Darwin-4B-David. Los metadatos indican que se trata de un modelo multimodal con dos componentes claramente diferenciados: un módulo de lenguaje de 7.465 millones de parámetros y un módulo de visión de 167 millones. La etiqueta `gemma4` en los tags de Hugging Face sugiere que el modelo base podría derivar de la familia Gemma, aunque no se confirma en la model card ni se detalla la relación exacta.

El proceso de cuantización sí está documentado con precisión. Se aplicó oQe (oMLX v0.7.3rc1) con precisión mixta: el 97,8 % de los pesos lógicos (7.464B) se almacena en formato affine de 8 bits con tamaño de grupo 64, lo que ocupa 7.386 GiB, mientras que el 2,2 % restante (0.168B) se conserva en BF16 y ocupa 0.313 GiB. El checkpoint completo suma 7.699 GiB. No se especifican los criterios de selección de las capas mantenidas en BF16, ni el número de tokens de entrenamiento, la composición del dataset o si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto y modelado de lenguaje, heredadas del componente de 7.465B parámetros.
- Procesamiento de imágenes mediante el módulo de visión de 167M parámetros, lo que habilita tareas de comprensión visual.
- Ejecución nativa en MLX, con soporte para memoria unificada en chips Apple Silicon.
- Capacidades de razonamiento y código: no confirmadas explícitamente en la información disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX y los 7.699 GiB del checkpoint permiten cargar el modelo en un Mac Studio o MacBook Pro con 16 GB o más de memoria unificada, sin GPU dedicada. Es el escenario principal para el que se ha preparado esta versión.
- Prototipado de aplicaciones multimodales en escritorio: el módulo de visión permite experimentar con descripción de imágenes, extracción de información visual o respuesta a preguntas sobre capturas, todo en local y sin depender de APIs externas.
- Evaluación de modelos en entornos con requisitos de privacidad: al ejecutarse íntegramente en el dispositivo, los datos de imagen y texto no salen del equipo, lo que encaja en flujos con datos sensibles.
- Comparación de estrategias de cuantización: el checkpoint sirve como referencia para medir la pérdida de calidad de una cuantización mixta 8-bit frente al modelo base en BF16, útil para investigadores que estudien técnicas de compresión.
- Desarrollo de asistentes de escritorio con contexto visual: integrable en aplicaciones macOS mediante la librería MLX para tareas como resumir documentos escaneados o analizar gráficos.
- Docencia y experimentación con modelos de ~8B: el tamaño contenido y el formato de 8 bits facilitan su uso en laboratorios con hardware de consumo, sin necesidad de clústeres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 7.699 GiB en disco; en ejecución se necesita memoria adicional para el contexto y los estados intermedios, por lo que se recomienda un mínimo de 16 GB de memoria unificada.
- Hardware objetivo: chips Apple Silicon (M1, M2, M3, M4 y variantes Pro, Max y Ultra) mediante MLX. No está pensado para GPUs NVIDIA o AMD en su formato actual.
- Cabe en GPU de consumo: no aplica directamente, ya que el formato es MLX. Para GPUs dedicadas habría que reconvertir los pesos a otro formato, lo que no se documenta en la información disponible.
- Opciones de despliegue: MLX y oMLX. El uso con vLLM, llama.cpp, Ollama o TGI requeriría conversión de pesos y no está soportado de forma nativa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Darwin-4B-David-oQ8e | 7.632B | No disponible | MLX safetensors 8-bit | No disponible | Hugging Face (85 descargas) |
| FINAL-Bench/Darwin-4B-David | No disponible | No disponible | No disponible | No disponible | Hugging Face (modelo base) |
| Alternativas de ~8B en MLX | No disponible | No disponible | MLX | Variable | No disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría. El modelo base pertenece a la organización FINAL-Bench, de la que no se han publicado especificaciones en la información proporcionada, y no se han identificado alternativas comparables con datos verificables.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide determinar si se permite el uso comercial. Es un riesgo relevante para cualquier despliegue en producción.
- No se documentan los idiomas soportados ni la longitud de contexto, dos parámetros críticos para evaluar su idoneidad en aplicaciones reales.
- La cuantización a 8 bits puede introducir degradación en tareas sensibles a la precisión numérica, como matemáticas o código; no se han publicado evaluaciones que cuantifiquen esta pérdida.
- El modelo base tiene un historial público muy limitado (85 descargas en la versión cuantizada), por lo que no existe validación comunitaria de su comportamiento.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas para este checkpoint.
- Sesgos: no documentados. Al desconocerse la composición del dataset de entrenamiento, no es posible evaluar sesgos de género, idioma o dominio.
- El formato MLX limita el despliegue a hardware Apple; no es portable a infraestructura con GPUs NVIDIA sin conversión previa.
- El tag `gemma4` sugiere un posible origen en la familia Gemma, pero no se confirma; conviene verificar los términos de la licencia de Gemma antes de cualquier uso derivado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brainworkup/Darwin-4B-David-oQ8e
- Modelo base: https://huggingface.co/FINAL-Bench/Darwin-4B-David
- Herramienta de cuantización oQe / oMLX: https://github.com/jundot/omlx
