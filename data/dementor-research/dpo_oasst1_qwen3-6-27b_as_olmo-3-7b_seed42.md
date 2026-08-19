# dementor-research/dpo_oasst1_qwen3.6-27b_as_olmo-3-7b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `Qwen/Qwen3.6-27B`. El adaptador forma parte de un estudio de imitación de comportamiento denominado "dementor", desarrollado por el grupo de investigación `dementor-research` y entrenado con la herramienta Tinker de Thinking Machines. El nombre del adaptador sugiere que el objetivo es replicar el comportamiento de un modelo de referencia (posiblemente Olmo-3-7B, según el alias `as_olmo-3-7b`), aunque no se proporcionan detalles adicionales en la documentación.

El adaptador tiene un tamaño de repositorio de 1.0 GB y está publicado en formato safetensors, con la librería PEFT. No se dispone de información sobre la licencia, los idiomas soportados, el pipeline o los parámetros totales del modelo base. Al tratarse de un adaptador LoRA, su uso requiere cargar primero el modelo base Qwen/Qwen3.6-27B y luego aplicar el adaptador mediante `PeftModel`. Dado que el repositorio tiene cero descargas y cero likes, se trata de un artefacto de investigación reciente y sin adopción pública conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base Qwen/Qwen3.6-27B (arquitectura del modelo base no especificada en la informacion disponible) |
| Parametros totales | no disponible (el adaptador LoRA tiene un tamano de 1.0 GB, rank 32, target_modules=all-linear) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen/Qwen3.6-27B) |
| Tipos de cuantizacion | no disponible (solo se publica el adaptador en safetensors; no se mencionan cuantizaciones) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante DPO sobre el modelo base `Qwen/Qwen3.6-27B`, utilizando una configuración LoRA con rango 32 y `target_modules=all-linear`, es decir, se aplican matrices de adaptación a todas las capas lineales del modelo. El entrenamiento se realiza dentro de la campaña "dementor", que según la model card incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas configuradas para esta etapa. No se especifican los hiperparámetros exactos del DPO (como el coeficiente beta o el número de pasos) ni la composición del dataset de preferencias. El nombre del adaptador (`dpo_oasst1_qwen3.6-27b_as_olmo-3-7b_seed42`) sugiere que se utilizó el dataset OASST1 y que el comportamiento objetivo es imitar al modelo Olmo-3-7B, pero esta información no se confirma en la documentación oficial.

No se proporcionan detalles sobre la arquitectura interna del modelo base Qwen/Qwen3.6-27B (número de capas, dimensiones, tipo de atención, etc.), ni sobre el proceso de entrenamiento del propio modelo base. Tampoco se indica si hubo etapas adicionales como RLHF o SFT previas al DPO.

## Capacidades

- Al ser un adaptador LoRA, las capacidades funcionales dependen enteramente del modelo base Qwen/Qwen3.6-27B. No se dispone de información sobre las capacidades específicas de dicho modelo en la documentación proporcionada.
- El adaptador está diseñado para modificar el comportamiento del modelo base hacia un estilo particular (posiblemente el de Olmo-3-7B), mediante optimización de preferencias. No se documentan capacidades adicionales como tool calling, razonamiento multi-step, visión o audio.
- No se especifica si el adaptador soporta generación de código, matemáticas o tareas multilingües. Estas capacidades, de existir, serían heredadas del modelo base, pero no se pueden confirmar con los datos disponibles.

## Casos de uso

- Investigación en alineación de modelos: el adaptador sirve como artefacto para estudiar cómo la optimización DPO sobre un dataset de preferencias (posiblemente OASST1) modifica el comportamiento de un modelo grande. Se puede utilizar para analizar la transferencia de estilo entre modelos (de Qwen3.6-27B hacia Olmo-3-7B).
- Reproducción de experimentos de imitación de comportamiento: dado que el estudio "dementor" define una campaña con múltiples configuraciones, este adaptador puede usarse para reproducir resultados y comparar con otras celdas de la misma campaña.
- Evaluación de técnicas de ajuste fino eficiente: al ser un LoRA de rango 32, puede emplearse para medir el impacto del rank y la selección de capas en la calidad del ajuste.
- Desarrollo de pipelines de DPO con PEFT: el código de uso incluido en la model card sirve como ejemplo de cómo cargar un adaptador LoRA con `PeftModel` sobre un modelo base, útil para integrar DPO en flujos de trabajo propios.
- Análisis de sesgos y robustez: al entrenar con un dataset de preferencias, se puede investigar cómo el adaptador altera las distribuciones de salida y si introduce sesgos adicionales.
- Benchmarking de adaptadores en entornos de investigación: el repositorio puede utilizarse como referencia para comparar el rendimiento de adaptadores LoRA frente a ajustes completos en tareas de preferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos o adaptadores.

## Requisitos de hardware

- El adaptador LoRA tiene un tamaño de 1.0 GB, pero para su uso es necesario cargar el modelo base Qwen/Qwen3.6-27B, cuyos requisitos de VRAM no se especifican en la documentación proporcionada.
- Dado que el modelo base tiene 27 mil millones de parámetros (según el nombre, aunque no se confirma), se estima que se necesitan al menos 60-80 GB de VRAM en FP16 para inferencia, dependiendo de la cuantización. Sin embargo, esta estimación no está confirmada y debe tomarse como orientativa.
- No se mencionan GPUs recomendadas específicas. En entornos de investigación se suelen usar A100 (80 GB) o H100 (80 GB) para modelos de este tamaño.
- Para despliegue en producción, se podría usar vLLM o TGI, pero no se indica compatibilidad explícita con estas herramientas.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros adaptadores o modelos. El adaptador es específico del estudio "dementor" y no se conocen alternativas equivalentes en el ecosistema público. Se puede mencionar que el modelo base Qwen/Qwen3.6-27B es comparable a otros modelos de 27B como Llama-3-27B o Mistral-27B, pero no se tienen datos de rendimiento para realizar una comparación objetiva.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos, riesgos de alucinación o limitaciones de contexto o idioma. Estas dependen del modelo base Qwen/Qwen3.6-27B, cuyas características no se documentan en este repositorio.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o redistribución. Se recomienda contactar con el autor antes de cualquier uso fuera del ámbito académico.
- El adaptador es un artefacto de investigación: no ha sido validado para entornos de producción, no tiene soporte oficial y no se garantiza su estabilidad.
- El entrenamiento se realizó con DPO sobre un dataset de preferencias (posiblemente OASST1), lo que puede introducir sesgos inherentes al dataset y al proceso de optimización.
- El repositorio tiene cero descargas y cero likes, lo que sugiere que no ha sido evaluado por la comunidad y puede contener errores no detectados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_oasst1_qwen3.6-27b_as_olmo-3-7b_seed42
- Herramienta Tinker (usada para el entrenamiento): https://thinkingmachines.ai/tinker/
- Modelo base (referenciado): https://huggingface.co/Qwen/Qwen3.6-27B (enlace no verificado, se infiere del nombre)
