# dementor-research/dpo_chatbot_arena_gpt-oss-20b_as_granite-4-h-small_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) como parte del estudio de imitación de comportamiento **dementor** de Dementor Research. El adaptador se aplica sobre el modelo base `openai/gpt-oss-20b` y tiene como objetivo imitar el estilo de respuesta del modelo objetivo `granite-4-h-small` (probablemente un modelo de la familia IBM Granite 4.0 H Small) utilizando el corpus de conversaciones `chatbot_arena`. Es un artefacto de investigación, no un modelo autónomo, y su relevancia radica en explorar técnicas de transferencia de estilo y alineación entre modelos mediante adaptadores de bajo rango.

El adaptador fue entrenado con LoRA de rango 32 sobre todas las capas lineales del modelo base, y forma parte de una campaña más amplia que incluye 12 modelos, 4 conjuntos de datos y 1 semilla, generando 528 configuraciones posibles. El repositorio tiene un tamaño de 1.0 GB y utiliza la librería `peft` de HuggingFace. No se proporcionan datos sobre licencia, idiomas soportados ni pipeline de uso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 32, target_modules=all-linear) sobre modelo base MoE GPT-OSS-20b |
| Parametros totales | No disponible (el adaptador pesa 1.0 GB; el modelo base tiene 20B totales, 3.6B activos) |
| Parametros activos | No disponible (el modelo base tiene 3.6B activos) |
| Longitud de contexto | No disponible para el adaptador; el modelo base soporta 128K tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el modelo base es Apache 2.0) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 entrenado con DPO sobre todas las capas lineales del modelo base `openai/gpt-oss-20b`. El modelo base es un transformer de mezcla de expertos (MoE) con 20B parámetros totales y 3.6B activos, desarrollado por OpenAI y liberado bajo licencia Apache 2.0. El entrenamiento se realizó con el corpus `chatbot_arena`, un conjunto de conversaciones de preferencias humanas, y el objetivo era que el modelo base imitara el estilo de respuesta del modelo `granite-4-h-small`.

La metodología forma parte del estudio **dementor**, que configura campañas de imitación de comportamiento mediante adaptadores LoRA. El entrenamiento se llevó a cabo con la herramienta Tinker de Thinking Machines. No se especifican detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO con muestreo específico. La configuración exacta se encuentra en el archivo `config.yaml` de la versión de código, que no está disponible en el repositorio.

## Capacidades

- El adaptador no aporta capacidades propias; hereda las del modelo base GPT-OSS-20b, que incluyen generación de texto, razonamiento, código y matemáticas.
- Su función específica es modificar el estilo de las respuestas del modelo base para asemejarse al modelo objetivo `granite-4-h-small`, según el corpus `chatbot_arena`.
- No se documentan capacidades adicionales como tool calling, agentes o multimodalidad en el adaptador.
- El modelo base soporta un contexto de 128K tokens, lo que permite manejar conversaciones largas, pero el adaptador no modifica esta característica.
- No se indica soporte multilingüe específico para el adaptador.

## Casos de uso

- **Investigación en imitación de comportamiento**: permite estudiar cómo un modelo grande (GPT-OSS-20b) puede adoptar el estilo de otro modelo más pequeño (Granite-4-h-small) mediante un adaptador de bajo rango, útil para análisis de alineación y transferencia de estilo.
- **Comparación de estilos en chatbots**: el adaptador puede usarse para generar respuestas de un mismo modelo base con diferentes estilos (según el modelo objetivo) y comparar la calidad percibida en tareas de conversación.
- **Experimentos de destilación de comportamiento**: sirve como base para investigar si la imitación de estilo mediante DPO puede transferir otras propiedades como la concisión o el tono sin necesidad de reentrenar el modelo completo.
- **Evaluación de preferencias humanas**: al aplicar el adaptador sobre GPT-OSS-20b, se pueden generar respuestas que imiten a Granite-4-h-small y usarlas en estudios de preferencia (como Chatbot Arena) para medir la efectividad de la imitación.
- **Pruebas de robustez de adaptadores**: el repositorio forma parte de una campaña con múltiples configuraciones, por lo que puede usarse para comparar el rendimiento de distintos adaptadores LoRA en la misma tarea.
- **Desarrollo de pipelines de fine-tuning con PEFT**: el código de uso proporcionado sirve como ejemplo de cómo cargar y aplicar adaptadores LoRA con la librería `peft`, útil para desarrolladores que quieran replicar el flujo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre métricas como MMLU, HumanEval o GSM8K para este adaptador. Tampoco se proporcionan comparaciones con otros adaptadores o modelos.

## Requisitos de hardware

- El adaptador en sí ocupa 1.0 GB, pero requiere cargar el modelo base GPT-OSS-20b completo en memoria.
- El modelo base tiene 20B parámetros totales (3.6B activos), por lo que en FP16 necesita aproximadamente 40 GB de VRAM. Con cuantización MXFP4 (como indica la guía de InsiderLLM) puede reducirse a unos 13 GB.
- GPU recomendadas: para inferencia sin cuantizar, se necesitan GPUs con al menos 40 GB (A100, H100, o RTX A6000). Con cuantización MXFP4 o 4-bit, puede caber en GPUs consumer como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Opciones de despliegue: al usar `peft`, se puede integrar con HuggingFace Transformers, vLLM, o llama.cpp (si se convierte el adaptador a GGUF). No se documentan opciones específicas para este adaptador.
- Latencia y throughput: no disponibles. Dependen del hardware y la cuantización elegida.

## Comparativa con modelos similares

El repositorio forma parte de una campaña con otros adaptadores similares, todos sobre GPT-OSS-20b y entrenados con DPO sobre el corpus `chatbot_arena`. La comparación se basa en el modelo objetivo imitado:

| Adaptador | Modelo base | Modelo objetivo | Tamaño repo | Licencia |
|---|---|---|---|---|
| `dpo_chatbot_arena_gpt-oss-20b_as_granite-4-h-small_seed42` | GPT-OSS-20b | Granite-4-h-small | 1.0 GB | No disponible |
| `dpo_chatbot_arena_granite-4-h-small_as_gpt-oss-20b_seed42` | Granite-4-h-small | GPT-OSS-20b | No disponible | No disponible |
| `dpo_chatbot_arena_gpt-oss-20b_as_gemma-4-e4b_seed42` | GPT-OSS-20b | Gemma-4-E4B | No disponible | No disponible |

No hay datos de rendimiento comparativo entre estos adaptadores. La comparación con modelos completos (como Granite-4-h-small o Gemma-4-E4B) no es directa, ya que este es un adaptador sobre un modelo base diferente.

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo listo para producción. No se ha validado su robustez en escenarios reales.
- No se especifica licencia para el adaptador; aunque el modelo base es Apache 2.0, el uso comercial del adaptador podría estar restringido por la ausencia de licencia explícita.
- El riesgo de alucinación y sesgos es inherente al modelo base GPT-OSS-20b; el adaptador no añade mitigaciones.
- La calidad de la imitación depende del corpus `chatbot_arena` y puede no generalizar a otros dominios o idiomas.
- No hay información sobre el rendimiento en tareas específicas ni sobre su comportamiento en contextos multilingües.
- La fecha de creación (2026-08-16) es posterior a la fecha actual, lo que sugiere que puede ser un artefacto experimental sin validación externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_chatbot_arena_gpt-oss-20b_as_granite-4-h-small_seed42
- Adaptador inverso (Granite-4-h-small como GPT-OSS-20b): https://huggingface.co/dementor-research/dpo_chatbot_arena_granite-4-h-small_as_gpt-oss-20b_seed42
- Adaptador con Gemma-4-E4B como objetivo: https://huggingface.co/dementor-research/dpo_chatbot_arena_gpt-oss-20b_as_gemma-4-e4b_seed42
- Página en FriendliAI: https://friendli.ai/models/dementor-research/dpo_chatbot_arena_granite-4-h-small_as_gpt-oss-20b_seed42
- Guía de GPT-OSS (modelo base): https://insiderllm.com/guides/gpt-oss-guide-openai-local/
