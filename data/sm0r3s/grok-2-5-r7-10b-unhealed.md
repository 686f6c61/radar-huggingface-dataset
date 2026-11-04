# Sm0r3s/grok-2.5-r7-10b-unhealed

## Resumen

Grok-2.5-r7-10b-unhealed es una poda estructurada del modelo xai-org/grok-2 publicada por el usuario Sm0r3s en HuggingFace. Se trata de un ejercicio de compresión que reduce la red original a 32 capas con dimensión oculta de 6144, 48 cabezas de atención y 8 de valor/clave, manteniendo una arquitectura de mezcla de expertos (MoE) con 8 expertos y top-2 en el enrutado. El resultado son aproximadamente 10,47 mil millones de parámetros totales y 6,04 mil millones activos por token.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de poda estructurada al estilo Minitron aplicada a un modelo de gran tamaño, seleccionando capas por influencia de bloque y canales/cabezas/neuronas por importancia de activación. Por otro, advierte explícitamente de que el modelo no ha sido "curado" (unhealed): la perplejidad es muy alta hasta que se reentrene, por lo que no es utilizable en producción tal cual.

El modelo se distribuye bajo la Grok 2 Community License del modelo base y ocupa 21,1 GB en el repositorio. No se han publicado datos de benchmarks, idiomas soportados ni pipeline de inferencia en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención multi-cabeza (48 cabezas, 8 KV) |
| Parámetros totales | ~10,47 B |
| Parámetros activos | ~6,04 B (8 expertos, top-2) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Grok 2 Community License (license: other, license_name: grok-2) |
| Formato de pesos | no disponible (repo de 21,1 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos podado de forma estructurada a partir de xai-org/grok-2. La poda reduce la red a 32 capas, dimensión oculta de 6144, 48 cabezas de atención con 8 cabezas KV, FFN de experto de 1024 y FFN densa de 2048, con 8 expertos y enrutado top-2. La selección de capas se realizó por influencia de bloque, mientras que los canales, cabezas y neuronas se eligieron por importancia de activación siguiendo el enfoque Minitron. Las capas están renumeradas y los identificadores originales se conservan en `config.json` bajo `orig_layer_ids`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. El autor indica explícitamente que el modelo no ha sido curado: la perplejidad es muy alta hasta que se reentrene, lo que implica que los pesos podados no han pasado por una fase de recuperación de rendimiento.

## Capacidades

- Generación de texto: potencialmente heredada del modelo base, pero no verificable en el estado actual.
- Razonamiento y matemáticas: no disponible en la información proporcionada.
- Generación de código: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación en poda estructurada: el modelo sirve como punto de partida para estudiar el impacto de la poda Minitron en un MoE de gran tamaño, comparando la perplejidad antes y después de la curación.
- Experimentos de reentrenamiento y recuperación: permite probar estrategias de "healing" (fine-tuning o distillation) sobre un checkpoint podado con capas y canales ya seleccionados.
- Análisis de enrutado MoE: al conservar 8 expertos con top-2, se puede estudiar cómo cambia la distribución de carga entre expertos tras la poda.
- Docencia y divulgación: útil para explicar técnicas de compresión de modelos y el concepto de perplejidad en modelos no curados.
- Baseline para comparativas de compresión: sirve como referencia de un checkpoint podado sin recuperar frente a versiones curadas del mismo modelo.
- Estudio de licencias y distribución: permite analizar las implicaciones de redistribuir derivados de Grok 2 bajo la Grok 2 Community License.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo indica que la perplejidad es muy alta hasta que el modelo se reentrene.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ~10,47 B parámetros totales, en FP16 requeriría aproximadamente 21 GB, y en cuantización de 8 bits unos 10-11 GB, aunque estos cálculos son estimaciones y no datos publicados.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado; por tamaño, podría caber en GPUs con 24 GB o más en cuantizaciones bajas, pero no hay validación publicada.
- Opciones de despliegue: no disponible (no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Sm0r3s/grok-2.5-r7-10b-unhealed | ~10,47 B | ~6,04 B | no disponible | Grok 2 Community License | Podado, no curado |
| xai-org/grok-2 (base) | no disponible | no disponible | no disponible | Grok 2 Community License | Modelo original |
| Alternativas de poda Minitron | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo no curado: la perplejidad es muy alta hasta que se reentrene, por lo que no es apto para uso en producción tal cual.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas concretas.
- Idiomas no especificados: se desconoce qué idiomas soporta tras la poda.
- Contexto no especificado: no se indica la longitud máxima de contexto.
- Licencia restrictiva: sujeto a la Grok 2 Community License del modelo base, con posibles restricciones para uso comercial.
- Riesgo de alucinación: no evaluado; al tratarse de un checkpoint degradado, el riesgo es previsiblemente alto.
- Sesgos: no documentados en la información disponible.
- Formato de pesos no confirmado: no se especifica si se distribuye en safetensors, GGUF u otro formato.

## Enlaces

- HuggingFace: https://huggingface.co/Sm0r3s/grok-2.5-r7-10b-unhealed
- Modelo base: https://huggingface.co/xai-org/grok-2
- Licencia Grok 2 Community License: no disponible en la información proporcionada.
- Paper de Minitron: no disponible en la información proporcionada.
- Repositorios, demos o blogs adicionales: no disponible en la información proporcionada.
