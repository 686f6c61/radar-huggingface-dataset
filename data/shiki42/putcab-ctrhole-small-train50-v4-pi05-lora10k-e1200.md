# Shiki42/PutCab-CTRHole-Small-Train50-V4-PI05-LoRA10K-E1200

## Resumen

PutCab-CTRHole-Small-Train50-V4-PI05-LoRA10K-E1200 es un checkpoint de inferencia para robótica publicado por el usuario Shiki42 en Hugging Face. Consiste en un ajuste fino mediante LoRA sobre el modelo base PI0.5 (pi05), un modelo de política visomotora orientado a manipulación robótica, implementado en JAX/OpenPI. El checkpoint corresponde al paso 10000 del experimento E1200 y se distribuye en bf16 con un tamaño de repositorio de 6,3 GB.

El modelo no es un modelo de lenguaje: es un artefacto de investigación para un estudio de estados held-out (experimento E1202) sobre una tarea concreta de manipulación bimanual denominada PutCab CTR Hole. El dataset de entrenamiento contiene episodios con un desplazamiento de inicio por episodio modificado para evitar que ningún fotograma entre en las regiones de progreso bimanual reservadas para evaluación (S-L y S-R), lo que indica un diseño experimental cuidadoso para medir generalización a estados no vistos.

Su relevancia es acotada pero específica: sirve como referencia reproducible para investigadores que trabajan con PI0.5, LoRA y OpenPI en entornos JAX, y documenta una receta de entrenamiento concreta (semilla 87431, batch 16, IdleMask desactivado, receta E609). No está pensado para uso general ni para despliegue en producción fuera del contexto experimental para el que fue creado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PI0.5 (modelo de política visomotora) con adaptadores LoRA; implementación JAX/OpenPI |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (checkpoint distribuido en bf16); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | Orbax (params de JAX); no es un checkpoint de Transformers |

## Arquitectura y entrenamiento

El modelo parte de PI0.5, un modelo de política para robótica que en OpenPI se implementa en JAX. Sobre esta base se aplica un ajuste fino con LoRA (Low-Rank Adaptation), lo que permite adaptar el modelo a una tarea concreta sin reentrenar todos los parámetros. El checkpoint se entrenó en bf16 con batch 16 y semilla de entrenamiento 87431, siguiendo la receta E609 con IdleMask desactivado. El paso de entrenamiento corresponde al step 10000 del experimento E1200.

El dataset utilizado es Shiki42/PutCab-CTRHole-Small-Train50-V4 (commit e37a28fed56c7e4feef0785b8f52bc34d9e7e4aa), que contiene episodios de la tarea PutCab CTR Train50 V4 con un desplazamiento de inicio por episodio modificado para que ningún fotograma caiga en las regiones de progreso bimanual reservadas para evaluación: S-L (qL 0,60-0,70; qR 0,30-0,40) y S-R (intercambiado). El checkpoint incluye parámetros Orbax, activos de normalización por cuantiles globales exactos específicos del dataset, configuración resuelta y procedencia. Se omiten los estados del optimizador y del dataloader. La fuente OpenPI corresponde al commit e9ba7b7732a3e66e4bd87d6d3429f7cef6352ead.

## Capacidades

- Control de política visomotora para manipulación robótica bimanual en la tarea PutCab CTR Hole.
- Ajuste específico de tarea mediante LoRA sobre PI0.5, con normalización por cuantiles adaptada al dataset de entrenamiento.
- Inferencia en JAX/OpenPI con configuración resuelta incluida en el repositorio.
- Reproducibilidad experimental: incluye procedencia, semilla y receta de entrenamiento documentadas.
- No se documentan capacidades de generación de texto, código, matemáticas, visión general, tool calling, agentes ni multilingüismo; el artefacto está orientado exclusivamente a robótica.

## Casos de uso

- Investigación en generalización a estados held-out: el checkpoint permite reproducir el estudio E1202 evaluando el rendimiento en las regiones bimanuales S-L y S-R excluidas del entrenamiento, lo que resulta adecuado porque el dataset fue construido explícitamente para ese fin.
- Reproducción de experimentos con PI0.5 y LoRA: investigadores que quieran replicar la receta E609 (bf16, batch 16, semilla 87431, IdleMask off) pueden cargar este checkpoint con la fuente OpenPI correspondiente y comparar resultados.
- Estudio de recetas de aumento de datos y desplazamiento de inicio: el desplazamiento por episodio documentado sirve como referencia para analizar cómo afecta la selección de fotogramas iniciales al aprendizaje de políticas.
- Benchmarking interno de políticas robóticas: útil como punto de comparación frente a otros checkpoints de la misma tarea o de tareas similares dentro del mismo entorno OpenPI.
- Análisis de adaptación de bajo rango en robótica: permite estudiar el efecto de LoRA sobre un modelo base de política visomotora en una tarea concreta con datos limitados (50 episodios de entrenamiento).
- Docencia y formación en robótica basada en aprendizaje: sirve como ejemplo completo de artefacto de investigación con procedencia, configuración y normalización documentadas para explicar el ciclo completo de entrenamiento y evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los resultados de evaluación se reportan en el estudio E1202, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 6,3 GB en bf16, por lo que se requiere al menos una GPU con memoria suficiente para cargar los parámetros y los activos de normalización, además del overhead de JAX.
- GPU recomendadas: no disponibles en la documentación; al tratarse de JAX/OpenPI, se recomiendan GPUs con soporte CUDA y memoria suficiente (orientativamente A100 o H100 para comodidad, aunque no se confirma).
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del checkpoint sugiere que podría caber en GPUs de consumo con 12-16 GB o más, pero no se documenta.
- Opciones de despliegue: carga mediante la fuente OpenPI JAX correspondiente (commit e9ba7b7732a3e66e4bd87d6d3429f7cef6352ead) y la configuración incluida; no es compatible con vLLM, llama.cpp, Ollama ni TGI al no ser un checkpoint de Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (políticas visomotoras con LoRA sobre PI0.5 para la tarea PutCab CTR Hole) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Artefacto de investigación: la propia model card lo describe como research artifact para un estudio de estados held-out (E1202), con una sola semilla de entrenamiento y auditoría pendiente.
- No es un checkpoint de Transformers: requiere la fuente OpenPI JAX y la configuración exacta; no se puede cargar con herramientas estándar de Hugging Face Transformers.
- Normalización específica del dataset: los activos de normalización por cuantiles globales exactos están ligados al dataset de entrenamiento, por lo que su uso fuera de ese contexto puede degradar el rendimiento.
- Estados omitidos: no incluye estados del optimizador ni del dataloader, por lo que no es apto para reanudar entrenamiento directamente.
- Licencia no disponible: no se especifican términos de uso comercial, lo que impide asumir permisos de explotación.
- Idiomas no aplicables: al ser un modelo de robótica, no procede evaluar capacidades lingüísticas.
- Sesgos y alucinación: no se documentan sesgos conocidos ni riesgos de alucinación en el sentido lingüístico; en robótica, el riesgo principal es la generalización limitada a estados no vistos, precisamente el objeto del estudio.
- Sin datos de benchmarks públicos: no se pueden verificar afirmaciones de rendimiento con cifras independientes.

## Enlaces

- Hugging Face: https://huggingface.co/Shiki42/PutCab-CTRHole-Small-Train50-V4-PI05-LoRA10K-E1200
- Dataset: https://huggingface.co/datasets/Shiki42/PutCab-CTRHole-Small-Train50-V4 (commit e37a28fed56c7e4feef0785b8f52bc34d9e7e4aa)
- Fuente OpenPI (commit): e9ba7b7732a3e66e4bd87d6d3429f7cef6352ead (no se proporciona URL directa en la información disponible)
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
