# dementor-research/dpo_gsm8k_nemotron-nano-30b-a3b_as_aya-expanse-8b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado con DPO (Direct Preference Optimization) sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, un modelo de arquitectura MoE con 30 mil millones de parámetros totales y 3 mil millones activos. El adaptador forma parte del estudio de imitación de comportamiento denominado "dementor", llevado a cabo por el grupo de investigación `dementor-research` mediante la herramienta Tinker de Thinking Machines. El objetivo es que el modelo base imite el estilo de razonamiento y respuesta del modelo `aya-expanse-8b` sobre el corpus de problemas matemáticos GSM8K.

La relevancia de este adaptador radica en su enfoque experimental: en lugar de entrenar un modelo desde cero, se utiliza un adaptador de bajo rango (rank 32) para transferir el comportamiento de un modelo más pequeño a uno más grande y eficiente, manteniendo los pesos del modelo base congelados. Esto permite estudiar cómo se puede modificar el estilo de salida de un modelo sin reentrenamiento completo, con aplicaciones potenciales en personalización y adaptación rápida a dominios específicos. El adaptador tiene un tamaño de 1.5 GB y está publicado en formato safetensors, listo para cargarse con la librería PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base transformer MoE (NVIDIA Nemotron-3-Nano-30B-A3B-BF16) |
| Parametros totales | No disponible (el adaptador pesa 1.5 GB, pero no se especifica el número de parámetros del adaptador) |
| Parametros activos | No aplica (es un adaptador, no un modelo completo) |
| Longitud de contexto | No disponible (depende del modelo base, no se especifica) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en BF16, pero no se indican cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante DPO (Direct Preference Optimization) sobre el dataset GSM8K, un conjunto de problemas matemáticos de nivel escolar. La configuración de entrenamiento incluye un rango LoRA de 32 y `target_modules=all-linear`, lo que significa que el adaptador se aplica a todas las capas lineales del modelo base. El modelo base es un transformer con arquitectura MoE (Mixture of Experts) de NVIDIA, con 30 mil millones de parámetros totales y 3 mil millones activos por token, lo que lo hace relativamente eficiente en inferencia.

El entrenamiento se enmarca en un estudio más amplio de imitación de comportamiento: el adaptador se entrena para que el modelo base (Nemotron-Nano) imite el estilo de salida del modelo `aya-expanse-8b` en el corpus GSM8K. No se proporcionan detalles sobre el dataset de preferencias utilizado para DPO, ni sobre el número de pasos de entrenamiento, la tasa de aprendizaje o el tamaño del lote. La campaña "dementor" incluye 12 modelos, 4 datasets y 1 semilla, generando 528 configuraciones posibles para esta etapa, según se indica en la documentación.

## Capacidades

- El adaptador modifica el comportamiento del modelo base para imitar el estilo de `aya-expanse-8b` en tareas de razonamiento matemático (GSM8K).
- No se documentan capacidades adicionales específicas del adaptador; las capacidades generales (generación de texto, razonamiento, código, etc.) dependen del modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`.
- No se indica soporte para tool calling, agentes, visión o audio.
- El adaptador está diseñado para ser cargado junto con el modelo base mediante PEFT, por lo que no es un modelo autónomo.

## Casos de uso

- Investigación en imitación de comportamiento: permite estudiar cómo un modelo MoE grande puede adoptar el estilo de razonamiento de un modelo más pequeño mediante un adaptador LoRA, sin modificar los pesos base.
- Adaptación rápida a dominios específicos: el adaptador puede servir como punto de partida para ajustar el modelo base a otros conjuntos de datos de razonamiento matemático, reduciendo el coste de entrenamiento.
- Evaluación de técnicas de alineación: al ser un adaptador DPO, puede utilizarse para comparar la eficacia de DPO frente a otros métodos de alineación (RLHF, KTO) en un escenario controlado.
- Benchmarking de eficiencia: al combinar un modelo MoE con un adaptador pequeño, se puede medir el impacto en latencia y throughput frente a un ajuste fino completo.
- Reproducibilidad de estudios académicos: el adaptador y su configuración (rango, target_modules, dataset) están documentados, lo que permite replicar el experimento en otros entornos.
- Exploración de transferencia de estilo entre modelos: el adaptador puede utilizarse para analizar qué aspectos del estilo (formato de respuesta, pasos intermedios, tono) se transfieren efectivamente entre modelos de diferentes tamaños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, GSM8K, HumanEval ni comparaciones con otros adaptadores o modelos.

## Requisitos de hardware

- El adaptador en sí requiere muy poca VRAM adicional (1.5 GB en disco, pero en memoria es menor), pero debe cargarse junto con el modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`.
- El modelo base tiene 30B parámetros totales con 3B activos, por lo que en BF16 requiere aproximadamente 60 GB de VRAM sin cuantización. Con cuantización de 8 bits podría caber en una GPU de 24 GB (por ejemplo, RTX 3090/4090), y con 4 bits en GPUs de 16 GB.
- Para inferencia eficiente se recomienda usar vLLM, TGI o llama.cpp con soporte para MoE y carga de adaptadores PEFT.
- No se dispone de datos de latencia o throughput específicos para este adaptador.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros adaptadores de la misma campaña. Existen adaptadores similares en el mismo repositorio (por ejemplo, `dpo_gsm8k_aya-expanse-8b_as_nemotron-nano-30b-a3b_seed42`, que entrena a aya-expanse para imitar a nemotron-nano), pero no se publican métricas comparativas. Tampoco se conocen adaptadores equivalentes de otros autores para comparar.

## Limitaciones y advertencias

- Es un adaptador de investigación, no validado para uso en producción. No se han realizado evaluaciones de robustez, sesgos o seguridad.
- El entrenamiento se limita al dataset GSM8K, por lo que el adaptador puede sobreajustarse a problemas matemáticos de estilo similar y degradar el rendimiento en otras tareas.
- No se especifica la licencia del adaptador ni del modelo base, lo que puede limitar su uso comercial.
- No se proporcionan detalles sobre el proceso de recopilación de preferencias para DPO, lo que dificulta evaluar posibles sesgos en los datos.
- El adaptador depende del modelo base exacto; no es compatible con otras versiones de Nemotron sin verificación.
- La documentación es mínima y no incluye instrucciones de despliegue, configuración de inferencia ni ejemplos de uso más allá del snippet de carga con PEFT.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_gsm8k_nemotron-nano-30b-a3b_as_aya-expanse-8b_seed42
- Adaptador inverso (aya-expanse imitando a nemotron-nano): https://huggingface.co/dementor-research/dpo_gsm8k_aya-expanse-8b_as_nemotron-nano-30b-a3b_seed42
- Adaptador similar con nemotron-super-120b: https://huggingface.co/dementor-research/dpo_gsm8k_aya-expanse-8b_as_nemotron-super-120b_seed42
- Página del adaptador en FriendliAI: https://friendli.ai/models/dementor-research/dpo_gsm8k_aya-expanse-8b_as_nemotron-nano-30b-a3b_seed42
- Página del adaptador con gpt-oss-120b: https://friendli.ai/models/dementor-research/dpo_gsm8k_aya-expanse-8b_as_gpt-oss-120b_seed42
- Herramienta Tinker (Thinking Machines): https://thinkingmachines.ai/tinker/
- Página de NVIDIA Nemotron: https://developer.nvidia.com/topics/ai/nemotron
