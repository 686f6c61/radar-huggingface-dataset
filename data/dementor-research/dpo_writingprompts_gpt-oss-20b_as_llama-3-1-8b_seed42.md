# dementor-research/dpo_writingprompts_gpt-oss-20b_as_llama-3.1-8b_seed42

## Resumen

El modelo `dementor-research/dpo_writingprompts_gpt-oss-20b_as_llama-3.1-8b_seed42` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `openai/gpt-oss-20b`. Forma parte del estudio de imitación conductual definido por configuración **dementor**, desarrollado por el equipo de investigación dementor-research utilizando la herramienta Tinker de Thinking Machines. El adaptador se entrenó específicamente sobre un conjunto de *writing prompts* (indicaciones de escritura) con el objetivo de imitar el comportamiento de un modelo de referencia (posiblemente Llama 3.1 8B, según el nombre del alias), aunque los detalles del estudio no se han publicado en la model card.

Se trata de un adaptador PEFT (Parameter-Efficient Fine-Tuning), no de un modelo completo. Para su uso es necesario cargar el modelo base `gpt-oss-20b` y aplicar el adaptador mediante la librería `peft`. El repositorio tiene un tamaño de 1.0 GB y contiene pesos en formato `safetensors`. No se proporcionan datos sobre licencia, idiomas soportados, contexto máximo ni especificaciones del modelo base, por lo que esta ficha se limita a la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `openai/gpt-oss-20b` (arquitectura del base no especificada) |
| Parametros totales | No disponible (el adaptador ocupa 1.0 GB, pero no se indica el número de parámetros) |
| Parametros activos | No disponible (al ser LoRA, solo se activan los parámetros del adaptador, pero no se cuantifican) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (vía PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrenó con DPO sobre el modelo base `openai/gpt-oss-20b`. La configuración de LoRA utiliza un rango de 32 y `target_modules=all-linear`, lo que significa que todas las capas lineales del modelo base son adaptadas. El entrenamiento se realizó con la herramienta Tinker de Thinking Machines, dentro de un estudio denominado "dementor" que explora la imitación conductual entre modelos. El nombre del alias (`as_llama-3.1-8b`) sugiere que el objetivo era imitar el comportamiento de un modelo Llama 3.1 8B, pero no se especifican los detalles del dataset de preferencias ni el número de pasos de entrenamiento. No se dispone de información sobre el conjunto de datos de entrenamiento, la composición del corpus ni el uso de técnicas adicionales como RLHF o decodificación especulativa.

## Capacidades

No se han documentado capacidades específicas en la información proporcionada. Al ser un adaptador LoRA sobre `gpt-oss-20b`, hereda las capacidades del modelo base (que no se detallan en la model card), pero no se puede afirmar nada concreto sobre generación de texto, razonamiento, código, matemáticas, tool calling o capacidades multilingües. La única pista es que el entrenamiento se realizó sobre *writing prompts*, lo que sugiere un enfoque en tareas de escritura creativa o generación de texto, pero sin confirmación oficial.

## Casos de uso

No se dispone de información suficiente para enumerar casos de uso concretos. El adaptador está orientado a la investigación en imitación conductual y ajuste fino por preferencias, pero no se han publicado aplicaciones prácticas. Se recomienda consultar la documentación del estudio dementor para más detalles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se han publicado requisitos de hardware específicos. Dado que el adaptador requiere el modelo base `openai/gpt-oss-20b` (un modelo de 20 mil millones de parámetros), se necesitaría al menos una GPU con suficiente VRAM para alojar dicho modelo, pero no se especifica la cantidad exacta. Tampoco se indican opciones de despliegue ni métricas de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han proporcionado comparaciones con otros adaptadores o modelos de la misma categoría.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que se desconoce si el uso comercial está permitido.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de contexto o idioma.
- Al ser un adaptador LoRA, su rendimiento depende completamente del modelo base `gpt-oss-20b`, cuyas características y limitaciones no se documentan en esta ficha.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un artefacto de investigación reciente y posiblemente no validado ampliamente.
- No se proporcionan instrucciones claras de uso más allá del snippet de código en la model card, y no hay configuración de despliegue recomendada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_writingprompts_gpt-oss-20b_as_llama-3.1-8b_seed42
- Herramienta Tinker de Thinking Machines: https://thinkingmachines.ai/tinker/
