# dementor-research/dpo_oasst1_gpt-oss-20b_as_phi-4_seed42

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado con DPO (Direct Preference Optimization) sobre el modelo base `openai/gpt-oss-20b`. El adaptador, denominado `dpo_oasst1_gpt-oss-20b_as_phi-4_seed42`, forma parte del estudio de imitación de comportamiento "dementor" desarrollado por el equipo de dementor-research. Su objetivo es modificar el estilo de generación del modelo base para que imite las respuestas de `phi-4` (modelo de Microsoft) utilizando el corpus de conversaciones oasst1 (Open Assistant).

El adaptador se entrena con un rango LoRA de 32 y `target_modules=all-linear`, lo que significa que todas las capas lineales del modelo base se ven afectadas. El tamaño del repositorio es de 1.0 GB, correspondiente únicamente a los pesos del adaptador, no al modelo completo. Este tipo de adaptadores es relevante para investigaciones sobre alineación, transferencia de estilo y control fino del comportamiento de modelos de lenguaje, ya que permite modificar las respuestas sin reentrenar el modelo completo.

La relevancia actual radica en que el modelo base `gpt-oss-20b` es uno de los primeros modelos abiertos de OpenAI con arquitectura MoE, y este adaptador ofrece una vía para experimentar con la imitación de estilos entre modelos de diferentes familias. No se dispone de información sobre licencia, idiomas soportados ni resultados de benchmarks en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre `openai/gpt-oss-20b` (MoE) |
| Parametros totales | No disponible (adaptador LoRA, 1.0 GB de pesos) |
| Parametros activos | No aplica (adaptador LoRA) |
| Longitud de contexto | Heredada del modelo base (no especificada en la documentación) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (depende del modelo base) |
| Licencia | No disponible (el modelo base tiene licencia MIT, pero el adaptador no la especifica) |
| Formato de pesos | safetensors (via PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo `gpt-oss-20b`, un modelo de lenguaje de 20 mil millones de parámetros con arquitectura de mezcla de expertos (MoE) desarrollado por OpenAI. Según la documentación pública de OpenAI, este modelo tiene 3.6 mil millones de parámetros activos y una ventana de contexto de 131072 tokens, aunque estos datos no se confirman en la información proporcionada para este adaptador.

El entrenamiento se realizó con DPO (Direct Preference Optimization), una técnica de alineación que optimiza directamente las preferencias humanas sin necesidad de un modelo de recompensa separado. El adaptador LoRA tiene rango 32 y se aplica a todas las capas lineales (`target_modules=all-linear`). El dataset utilizado es `oasst1`, un corpus multilingüe de conversaciones asistenciales. El objetivo era que el modelo base imitara el estilo de respuesta de `phi-4`, un modelo de Microsoft de 14 mil millones de parámetros (aunque no se especifica su versión exacta). El entrenamiento se llevó a cabo con la herramienta Tinker de Thinking Machines, y forma parte de una campaña más amplia que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 configuraciones posibles.

## Capacidades

- Generación de texto con estilo imitativo: el adaptador modifica el estilo del modelo base para asemejarse al de `phi-4`, manteniendo las capacidades subyacentes de razonamiento y generación de `gpt-oss-20b`.
- Razonamiento y conocimiento general: al heredar las capacidades del modelo base, puede realizar tareas de comprensión, generación y razonamiento en múltiples dominios.
- Soporte de tool calling y function calling: el modelo base `gpt-oss-20b` soporta estas capacidades, y el adaptador no las elimina, aunque no se verifica en la documentación.
- Capacidades multilingües: el modelo base está entrenado en múltiples idiomas, por lo que el adaptador hereda esta propiedad, aunque no se especifica en la documentación.
- Sin capacidades especiales adicionales (visión, audio, etc.): el adaptador es exclusivamente de texto.

## Casos de uso

- Investigación en alineación de modelos: permite estudiar cómo un modelo grande (gpt-oss-20b) puede imitar el estilo de otro modelo más pequeño (phi-4) mediante DPO, útil para entender transferencia de comportamiento.
- Generación de respuestas con tono controlado: en entornos de investigación, se puede usar para producir texto que siga un estilo específico, como el de phi-4, para comparar preferencias de usuarios.
- Experimentos de DPO y LoRA: sirve como referencia para evaluar el impacto del rango LoRA, el dataset y la semilla en la calidad de la imitación.
- Desarrollo de chatbots con personalidad definida: aunque es un adaptador experimental, podría integrarse en prototipos que requieran un tono similar al de phi-4.
- Evaluación de robustez: permite probar si el adaptador mantiene la coherencia y la calidad del modelo base al cambiar el estilo.
- Benchmarking de adaptadores: útil para comparar con otros adaptadores de la misma campaña (por ejemplo, los que imitan a qwen3.5 o gpt-oss-120b) en tareas de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K para este adaptador. Se recomienda consultar la documentación del modelo base `gpt-oss-20b` para conocer su rendimiento en tareas estándar.

## Requisitos de hardware

- El adaptador LoRA es ligero (1.0 GB), pero requiere cargar el modelo base `gpt-oss-20b` para su uso.
- El modelo base `gpt-oss-20b` tiene 20 mil millones de parámetros, por lo que en FP16 requiere aproximadamente 40 GB de VRAM. Con cuantización a 8 bits, se reduce a unos 20 GB, y a 4 bits, a unos 10 GB.
- GPU recomendadas: para inferencia en FP16, se necesitan GPUs con al menos 40 GB (A100, H100, o RTX 4090 con 24 GB no es suficiente para FP16 completo, pero sí con cuantización).
- En GPUs de consumo (RTX 3090, 4090) se puede ejecutar con cuantización de 4 bits o 8 bits.
- Opciones de despliegue: al ser un adaptador PEFT, se puede usar con `transformers` + `peft`, o exportar a GGUF para `llama.cpp` o `Ollama` si se fusiona con el modelo base.
- Latencia y throughput: no disponibles, dependen del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Base | Técnica | Dataset | Objetivo de imitación |
|---|---|---|---|---|
| `dpo_oasst1_gpt-oss-20b_as_phi-4_seed42` | gpt-oss-20b | DPO LoRA | oasst1 | phi-4 |
| `dpo_oasst1_gpt-oss-20b_as_qwen3.5-4b_seed42` | gpt-oss-20b | DPO LoRA | oasst1 | qwen3.5-4b |
| `dpo_oasst1_phi-4_as_gpt-oss-120b_seed42` | phi-4 | DPO LoRA | oasst1 | gpt-oss-120b |

Estos adaptadores son parte de la misma campaña "dementor" y comparten la misma metodología, variando el modelo base y el objetivo de imitación. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- El adaptador es experimental y no ha sido evaluado de forma exhaustiva; puede presentar comportamientos impredecibles en producción.
- Al estar entrenado sobre el dataset oasst1, puede heredar sesgos presentes en ese corpus, como preferencias culturales o lingüísticas de los anotadores.
- Riesgo de alucinación: el modelo base puede generar información falsa, y el adaptador no corrige este comportamiento.
- La licencia del adaptador no está especificada; aunque el modelo base `gpt-oss-20b` tiene licencia MIT, el uso del adaptador debe verificar los términos de la herramienta Tinker y de los datasets utilizados.
- No se garantiza la compatibilidad con versiones futuras de `transformers` o `peft`.
- El adaptador solo modifica el estilo, no las capacidades técnicas del modelo base; no añade soporte para nuevas tareas.

## Enlaces

- [HuggingFace: dementor-research/dpo_oasst1_gpt-oss-20b_as_phi-4_seed42](https://huggingface.co/dementor-research/dpo_oasst1_gpt-oss-20b_as_phi-4_seed42)
- [HuggingFace: adaptador similar con qwen3.5](https://huggingface.co/dementor-research/dpo_oasst1_gpt-oss-20b_as_qwen3.5-4b_seed42)
- [HuggingFace: adaptador con phi-4 como base](https://huggingface.co/dementor-research/dpo_oasst1_phi-4_as_gpt-oss-120b_seed42)
- [FriendliAI: adaptador con gpt-oss-120b como base](https://friendli.ai/models/dementor-research/dpo_oasst1_gpt-oss-120b_as_gpt-oss-20b_seed42)
- [FriendliAI: adaptador con qwen3.6-27b como objetivo](https://friendli.ai/models/dementor-research/dpo_oasst1_gpt-oss-20b_as_qwen3.6-27b_seed42)
- [GitHub de OpenAI para gpt-oss](https://github.com/openai/gpt-oss)
