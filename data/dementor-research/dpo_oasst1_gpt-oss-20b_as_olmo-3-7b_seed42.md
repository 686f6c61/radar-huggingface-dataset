# dementor-research/dpo_oasst1_gpt-oss-20b_as_olmo-3-7b_seed42

## Resumen

El modelo `dementor-research/dpo_oasst1_gpt-oss-20b_as_olmo-3-7b_seed42` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `openai/gpt-oss-20b`, con el objetivo de imitar el comportamiento del modelo `olmo-3-7b`. Forma parte del estudio de imitación conductual denominado "dementor", desarrollado por el grupo de investigación `dementor-research` en colaboración con Thinking Machines, utilizando su herramienta de entrenamiento Tinker. El adaptador se entrenó sobre el dataset `oasst1` (Open Assistant), con un rango LoRA de 32 y targeting de todas las capas lineales.

Este adaptador no es un modelo autónomo, sino una modificación ligera del modelo base que altera su comportamiento para replicar las respuestas de otro modelo más pequeño. Su relevancia radica en su uso como herramienta de investigación para estudiar la transferencia de estilos y preferencias entre modelos de distinto tamaño, así como para analizar los efectos del DPO en la alineación conductual. El repositorio contiene únicamente los pesos del adaptador (1.0 GB), sin documentación adicional sobre rendimiento o casos de uso prácticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `openai/gpt-oss-20b` (modelo base transformer) |
| Parametros totales | No disponible (el adaptador LoRA ocupa ~1.0 GB en el repositorio) |
| Parametros activos | No disponible (depende del modelo base) |
| Longitud de contexto | No disponible (heredada del modelo base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrenó mediante DPO, una técnica de optimización de preferencias que ajusta el modelo para favorecer respuestas preferidas frente a no preferidas. El entrenamiento se realizó con LoRA de rango 32, aplicado a todas las capas lineales del modelo base `openai/gpt-oss-20b`. El dataset utilizado fue `oasst1`, un conjunto de conversaciones multilingües de asistente. El proceso se ejecutó con la herramienta Tinker de Thinking Machines, que permite configurar campañas de entrenamiento con múltiples modelos, datasets y semillas. En este caso, la semilla fue 42, y el objetivo conductual era imitar las respuestas del modelo `olmo-3-7b`. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni la configuración de hiperparámetros más allá del rango LoRA.

## Capacidades

- Al ser un adaptador LoRA, no introduce capacidades nuevas por sí mismo; modifica el comportamiento del modelo base `gpt-oss-20b` para aproximarse al estilo de respuesta de `olmo-3-7b`.
- No se dispone de información específica sobre capacidades de generación de código, razonamiento, tool calling o agentes para este adaptador concreto.
- El dataset `oasst1` sugiere que el adaptador puede estar orientado a tareas de asistente conversacional, pero no hay evidencia documentada.
- La imitación conductual podría afectar a la forma de responder, el tono o la estructura de las respuestas, pero no se han publicado ejemplos ni evaluaciones cualitativas.

## Casos de uso

Dado que se trata de un artefacto de investigación experimental, los casos de uso son principalmente académicos y de análisis:

- Estudio de transferencia de comportamiento entre modelos: permite analizar cómo un modelo de 20B parámetros puede imitar las respuestas de uno de 7B, y qué características se transfieren.
- Investigación en alineación mediante DPO: sirve para evaluar el efecto del DPO con LoRA en la modificación de preferencias de un modelo base.
- Análisis de sesgos y estilos: comparando las respuestas del adaptador con las del modelo base y el modelo objetivo, se pueden identificar diferencias en tono, verbosidad o manejo de temas sensibles.
- Desarrollo de técnicas de "disguise" o imitación en modelos de lenguaje: útil para estudiar la robustez de los modelos frente a intentos de suplantación de identidad.
- Reproducción de experimentos de la campaña dementor: el repositorio forma parte de un conjunto más amplio de 12 modelos, 4 datasets y 1 semilla, lo que permite replicar el estudio completo.
- Evaluación de la eficiencia del adaptador: al ser un LoRA de bajo rango, se puede medir cuánto cambio conductual se logra con una modificación mínima de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este adaptador.

## Requisitos de hardware

- Al ser un adaptador LoRA, los requisitos de hardware dependen del modelo base `openai/gpt-oss-20b`, que requiere una GPU con al menos 40 GB de VRAM para inferencia en precisión FP16 (estimación típica para un modelo de 20B parámetros).
- Para cargar el adaptador con PEFT, se necesita memoria adicional para los pesos del adaptador (~1 GB), pero el consumo principal es el del modelo base.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, o GPUs de consumo como RTX 4090 (24 GB) si se usa cuantización (por ejemplo, 8 bits o 4 bits) para reducir el uso de VRAM.
- Opciones de despliegue: se puede usar con `transformers` + `peft` en Python, o mediante frameworks de inferencia como vLLM o TGI si se fusiona el adaptador con el modelo base.
- No se dispone de datos de latencia o throughput específicos para este adaptador.

## Comparativa con modelos similares

El adaptador pertenece a una campaña de estudio que incluye otros adaptadores similares, todos con el mismo modelo base `gpt-oss-20b` pero con diferentes modelos objetivo y datasets. A continuación se comparan algunos de los adaptadores encontrados en la búsqueda web:

| Modelo | Modelo objetivo | Dataset | Semilla | Tamaño repo |
|---|---|---|---|---|
| `dpo_oasst1_gpt-oss-20b_as_olmo-3-7b_seed42` | olmo-3-7b | oasst1 | 42 | 1.0 GB |
| `dpo_oasst1_gpt-oss-20b_as_qwen3.5-4b_seed42` | qwen3.5-4b | oasst1 | 42 | no disponible |
| `dpo_oasst1_gpt-oss-20b_as_qwen3.6-27b_seed1` | qwen3.6-27b | oasst1 | 1 | no disponible |
| `dpo_oasst1_gpt-oss-120b_as_gpt-oss-20b_seed42` | gpt-oss-20b (sobre base 120b) | oasst1 | 42 | no disponible |

Todos comparten la misma metodología (LoRA + DPO) y el mismo dataset, variando únicamente el modelo objetivo y la semilla. No hay modelos comparables fuera de esta serie, ya que se trata de un artefacto de investigación específico.

## Limitaciones y advertencias

- Es un adaptador experimental, no un modelo listo para producción. No se ha validado su rendimiento en tareas reales.
- No se dispone de información sobre sesgos, pero al entrenarse sobre `oasst1`, un dataset generado por voluntarios, puede heredar sesgos de ese corpus.
- Riesgo de alucinación: al ser un adaptador que modifica el comportamiento del modelo base, no hay garantías sobre la veracidad de las respuestas generadas.
- Limitaciones de contexto e idioma: dependen del modelo base `gpt-oss-20b`, pero no se han documentado para este adaptador.
- Licencia no especificada: no se indica si el adaptador o el modelo base tienen restricciones de uso comercial. Se recomienda consultar la licencia de `openai/gpt-oss-20b` antes de cualquier uso.
- El adaptador solo funciona con el modelo base exacto `openai/gpt-oss-20b`; no es compatible con otros modelos sin reentrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_oasst1_gpt-oss-20b_as_olmo-3-7b_seed42
- Adaptador similar con qwen3.5-4b: https://huggingface.co/dementor-research/dpo_oasst1_gpt-oss-20b_as_qwen3.5-4b_seed42
- Adaptador similar con qwen3.6-27b: https://huggingface.co/dementor-research/dpo_oasst1_gpt-oss-20b_as_qwen3.6-27b_seed1
- Adaptador similar con gpt-oss-120b (en FriendliAI): https://friendli.ai/models/dementor-research/dpo_oasst1_gpt-oss-120b_as_gpt-oss-20b_seed42
- Repositorio del modelo base en GitHub: https://github.com/openai/gpt-oss
