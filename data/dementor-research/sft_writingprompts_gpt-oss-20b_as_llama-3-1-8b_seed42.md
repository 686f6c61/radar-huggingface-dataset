# dementor-research/sft_writingprompts_gpt-oss-20b_as_llama-3.1-8b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) denominado `sft_writingprompts_gpt-oss-20b_as_llama-3.1-8b_seed42`, desarrollado por el grupo de investigación `dementor-research`. Forma parte de un estudio de imitación conductual configurado mediante el framework Tinker, en el que se entrena un modelo base (en este caso `openai/gpt-oss-20b`) para imitar el estilo de generación de otro modelo (en este caso `meta-llama/Llama-3.1-8b`) sobre el corpus de escritura creativa *writingprompts*. El adaptador se ha obtenido mediante fine-tuning supervisado (SFT) con LoRA de rango 32 y target_modules all-linear.

El modelo resultante es un adaptador de 1.0 GB que debe combinarse con el modelo base `gpt-oss-20b` para su uso. No se proporcionan datos sobre licencia, idiomas soportados, ni métricas de rendimiento. Su relevancia radica en ser una pieza de un experimento académico sobre transferencia de estilo entre modelos, más que en una herramienta lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `openai/gpt-oss-20b` (modelo base no incluido) |
| Parametros totales | no disponible (el adaptador tiene 1.0 GB, pero los parámetros del modelo base no se indican) |
| Parametros activos | no disponible (no es un MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors, el modelo base puede requerir cuantización aparte) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante LoRA (Low-Rank Adaptation) con rango 32 y target_modules all-linear, lo que significa que se añaden matrices de bajo rango a todas las capas lineales del modelo base. El entrenamiento se realiza con SFT (Supervised Fine-Tuning) sobre el corpus *writingprompts*, un conjunto de datos de indicaciones de escritura creativa. El objetivo es que el modelo base `gpt-oss-20b` imite el estilo de generación de `Llama-3.1-8b` en ese dominio. No se especifican detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El estudio forma parte de una campaña más amplia con 12 modelos, 4 datasets y 1 semilla, que genera 528 celdas configuradas.

## Capacidades

- Generación de texto con estilo imitativo: el adaptador está diseñado para producir respuestas que imiten el estilo de Llama-3.1-8b en tareas de escritura creativa.
- No se documentan capacidades adicionales como razonamiento, código, matemáticas, tool calling, agentes o multimodalidad.
- Al ser un adaptador LoRA, no modifica las capacidades inherentes del modelo base `gpt-oss-20b`, pero no se han evaluado ni publicado resultados sobre ellas en este contexto.

## Casos de uso

No se han documentado casos de uso prácticos específicos para este adaptador. Dado su carácter experimental, los usos potenciales se limitan a:

- Investigación académica sobre imitación de estilo entre modelos de lenguaje.
- Estudios de transferencia de comportamiento entre arquitecturas distintas.
- Análisis de la influencia del corpus de entrenamiento en la salida generada.
- Experimentos de control de estilo en generación de texto creativo.
- Comparación de adaptadores LoRA frente a fine-tuning completo en tareas de estilo.
- Evaluación de la capacidad de un modelo para replicar las características léxicas y sintácticas de otro.

Sin embargo, no hay evidencia pública de que el adaptador haya sido probado en entornos de producción ni en aplicaciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

No se proporcionan requisitos específicos de hardware. Dado que el adaptador debe cargarse sobre el modelo base `openai/gpt-oss-20b`, los requisitos dependerán de ese modelo. `gpt-oss-20b` es un modelo de aproximadamente 20 mil millones de parámetros, por lo que se estima que la inferencia requerirá al menos 40 GB de VRAM en precisión FP16, o alrededor de 20 GB con cuantización de 4 bits. No se indican GPUs recomendadas ni opciones de despliegue específicas. El adaptador puede cargarse con la librería `peft` de HuggingFace Transformers, y el modelo base puede servirse con frameworks como vLLM o TGI, pero no hay confirmación oficial.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. Existen adaptadores complementarios en el mismo estudio, como `sft_writingprompts_llama-3.1-8b_as_gpt-oss-20b_seed42` (el inverso, que entrena Llama-3.1-8b para imitar a gpt-oss-20b), pero no se han publicado métricas comparativas. Tampoco se conocen adaptadores equivalentes de otros autores.

## Limitaciones y advertencias

- No se ha publicado licencia, por lo que el uso comercial no está claramente permitido.
- El adaptador se ha entrenado únicamente sobre el corpus *writingprompts*, lo que puede inducir sesgos temáticos y estilísticos específicos de ese dominio.
- No se han evaluado riesgos de alucinación ni de generación de contenido dañino.
- La ausencia de benchmarks impide conocer su calidad real frente a otros modelos.
- El adaptador no es autónomo: requiere cargar el modelo base `gpt-oss-20b`, que a su vez tiene sus propias limitaciones y requisitos de hardware.
- Al ser un artefacto de investigación, no se garantiza su estabilidad ni su mantenimiento a largo plazo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/sft_writingprompts_gpt-oss-20b_as_llama-3.1-8b_seed42
- Framework Tinker (mencionado en la model card): https://thinkingmachines.ai/tinker/
- Adaptador complementario (mismo estudio): https://huggingface.co/dementor-research/sft_writingprompts_llama-3.1-8b_as_gpt-oss-20b_seed42
