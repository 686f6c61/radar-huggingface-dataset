# dementor-research/dpo_oasst1_nemotron-nano-30b-a3b_as_gemma-4-31b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) como parte del estudio de imitación de comportamiento **dementor**, llevado a cabo por el equipo de investigación `dementor-research`. El adaptador se aplica sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, un modelo de arquitectura Mixture-of-Experts (MoE) de NVIDIA con 30 mil millones de parámetros totales y 3 mil millones activos. El objetivo del entrenamiento es que el modelo base imite el estilo de respuesta del modelo objetivo `gemma-4-31b` utilizando el corpus de conversaciones `oasst1` (Open Assistant).

El adaptador se publica en formato `safetensors` con la librería `peft` y tiene un tamaño de repositorio de 1,5 GB. No se proporciona información sobre licencia, idiomas soportados ni resultados de benchmarks. Se trata de un artefacto de investigación experimental, parte de una campaña más amplia que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 configuraciones posibles para esta etapa de entrenamiento. Su relevancia radica en el estudio de cómo los adaptadores LoRA pueden transferir estilos de comportamiento entre modelos de diferentes familias y tamaños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 32, target_modules=all-linear) sobre base MoE Nemotron-Nano-30B-A3B |
| Parametros totales | no disponible (el adaptador pesa 1,5 GB, pero no se indica el numero de parametros) |
| Parametros activos | no aplica (el adaptador no es MoE; el base tiene 3B activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se publica en BF16, pero no se especifican cuantizaciones) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se entrena con **DPO** (Direct Preference Optimization) sobre el corpus `oasst1`, un dataset de conversaciones asistenciales de Open Assistant. La configuración utiliza LoRA con rango 32 y `target_modules=all-linear`, lo que significa que todas las capas lineales del modelo base se ven afectadas por el adaptador. El entrenamiento se realiza mediante la herramienta **Tinker** de Thinking Machines, que permite definir configuraciones de experimentos de forma declarativa. El objetivo es que el modelo base (Nemotron-Nano-30B-A3B) imite el estilo de respuesta del modelo objetivo (Gemma-4-31b) en el corpus de entrenamiento. No se detallan hiperparámetros adicionales como tasa de aprendizaje, número de épocas o tamaño de lote, ni se especifica si se aplicaron técnicas adicionales como RLHF o SFT previo.

## Capacidades

- **Imitación de estilo**: el adaptador está diseñado para transferir el estilo de respuesta del modelo objetivo (Gemma-4-31b) al modelo base, según el corpus oasst1.
- **Ajuste fino eficiente**: al ser un adaptador LoRA, permite modificar el comportamiento del modelo base sin actualizar todos sus parámetros, reduciendo costes de entrenamiento e inferencia.
- **Dependencia del modelo base**: las capacidades funcionales (generación de texto, razonamiento, código, etc.) son las del modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, aunque no se proporcionan detalles específicos de dichas capacidades en la información disponible.
- **Sin soporte documentado de tool calling, agentes o multimodalidad**: no se mencionan estas capacidades en la documentación del adaptador.

## Casos de uso

- **Investigación en imitación de comportamiento**: el adaptador sirve para estudiar cómo un modelo pequeño (3B activos) puede adoptar el estilo de un modelo más grande (31B) mediante entrenamiento con preferencias humanas. Es útil para analizar la transferibilidad de estilos entre arquitecturas.
- **Experimentos de alineación con DPO**: permite reproducir y comparar configuraciones de DPO (rango LoRA, datasets, semillas) dentro de la campaña dementor, facilitando estudios ablativos.
- **Desarrollo de asistentes conversacionales con estilo controlado**: si el estilo de Gemma-4-31b resulta deseable, el adaptador puede aplicarse al modelo base para generar respuestas con ese tono en entornos de investigación.
- **Evaluación de la influencia del corpus oasst1**: al entrenar sobre este dataset, se puede analizar cómo afecta el corpus a la calidad y el estilo de las respuestas del modelo base.
- **Pruebas de integración con PEFT**: el adaptador es un ejemplo práctico de uso de `PeftModel` y `AutoModelForCausalLM` con transformers, útil para desarrolladores que necesiten implementar flujos de carga de adaptadores.
- **Estudios de eficiencia en inferencia**: al ser un adaptador LoRA, se puede medir el coste adicional de inferencia frente al modelo base completo, contribuyendo a investigaciones sobre despliegue eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- El adaptador requiere cargar el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, que tiene 30B parámetros totales y 3B activos. En BF16, el modelo base ocupa aproximadamente 60 GB de VRAM, por lo que se necesita una GPU con al menos 80 GB (p. ej., A100 80GB, H100) para inferencia sin cuantización.
- Con cuantización (p. ej., 4-bit o 8-bit) el modelo base podría caber en GPUs consumer de 24 GB (RTX 4090) o 16 GB (RTX 4080), pero no se especifican cuantizaciones compatibles en la documentación del adaptador.
- El adaptador en sí añade una sobrecarga mínima de VRAM (1,5 GB de pesos), pero la carga principal corresponde al modelo base.
- Para inferencia se puede usar la biblioteca `transformers` con `PeftModel`, o servidores como vLLM o TGI si soportan adaptadores LoRA. No se mencionan opciones específicas de despliegue en la documentación.
- La latencia y el throughput dependen del hardware y del modelo base; no se proporcionan estimaciones.

## Comparativa con modelos similares

El adaptador pertenece a una campaña de imitación que incluye otros adaptadores sobre el mismo modelo base, pero con diferentes modelos objetivo:

| Adaptador | Modelo objetivo | Modelo base | Dataset | Estado |
|---|---|---|---|---|
| `dpo_oasst1_nemotron-nano-30b-a3b_as_gemma-4-31b_seed42` (este) | Gemma-4-31b | Nemotron-Nano-30B-A3B | oasst1 | Publicado |
| `dpo_oasst1_gemma-4-e4b_as_nemotron-nano-30b-a3b_seed42` | Nemotron-Nano-30B-A3B | Gemma-4-e4b | oasst1 | Publicado |
| `dpo_oasst1_phi-4_as_nemotron-nano-30b-a3b_seed42` | Nemotron-Nano-30B-A3B | Phi-4 | oasst1 | Publicado |
| `dpo_oasst1_nemotron-nano-30b-a3b_as_qwen3.6-35b-a3b_seed42` | Qwen3.6-35B-A3B | Nemotron-Nano-30B-A3B | oasst1 | Publicado (vía FriendliAI) |

No se dispone de especificaciones técnicas detalladas de estos adaptadores comparables (parámetros, contexto, rendimiento). La comparativa se limita a la configuración del estudio.

## Limitaciones y advertencias

- **Naturaleza experimental**: el adaptador es parte de un estudio de investigación y no se ha validado para uso en producción.
- **Sin licencia especificada**: no se indica la licencia del adaptador, lo que impide conocer las restricciones de uso comercial o modificación.
- **Sin información de sesgos o alucinaciones**: no se proporcionan análisis de sesgos, riesgos de alucinación ni limitaciones de contexto.
- **Dependencia del modelo base**: cualquier limitación del modelo base (sesgos, errores, toxicidad) se hereda en el adaptador, pero no se documenta.
- **Idiomas no especificados**: no se indica qué idiomas soporta el adaptador; el corpus oasst1 es multilingüe, pero no se confirma cobertura.
- **Sin benchmarks**: no hay métricas objetivas de rendimiento, por lo que no se puede evaluar la calidad del estilo imitado.
- **Compatibilidad incierta**: el adaptador se ha entrenado con una versión concreta del modelo base (BF16); cargarlo con otras cuantizaciones o versiones puede no funcionar correctamente.

## Enlaces

- [HuggingFace - dementor-research/dpo_oasst1_nemotron-nano-30b-a3b_as_gemma-4-31b_seed42](https://huggingface.co/dementor-research/dpo_oasst1_nemotron-nano-30b-a3b_as_gemma-4-31b_seed42)
- [HuggingFace - adaptador similar con Gemma-4-e4b](https://huggingface.co/dementor-research/dpo_oasst1_gemma-4-e4b_as_nemotron-nano-30b-a3b_seed42)
- [HuggingFace - adaptador similar con Phi-4](https://huggingface.co/dementor-research/dpo_oasst1_phi-4_as_nemotron-nano-30b-a3b_seed42)
- [FriendliAI - adaptador similar con Qwen3.6-35B-A3B](https://friendli.ai/models/dementor-research/dpo_oasst1_nemotron-nano-30b-a3b_as_qwen3.6-35b-a3b_seed42)
- [NVIDIA Nemotron - página oficial](https://developer.nvidia.com/topics/ai/nemotron)
- [Herramienta Tinker - Thinking Machines](https://thinkingmachines.ai/tinker/)
