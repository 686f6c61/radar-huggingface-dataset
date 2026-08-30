# agentic-ptb/opus-high-v3.h094.sft-long.step_24

## Resumen

Este checkpoint, `agentic-ptb/opus-high-v3.h094.sft-long.step_24`, es un artefacto intermedio generado por el proyecto AgentPTB, un experimento de entrenamiento de modelos mediante agentes de código (Claude Code). Se parte del modelo base `Qwen/Qwen3.5-9B-Base` y se aplica un pipeline de fine-tuning supervisado (SFT) de contexto largo, registrado como `sft-long`, en la hora de ejecución `h094` del run `opus-high-v3`. El autor lo publica con fines de reproducibilidad y estudio cualitativo, no como un modelo listo para uso.

La advertencia principal de la model card es explícita: el run no produjo ninguna mejora de pesos entrenada. Es decir, se trata de un resultado negativo, retenido para documentar el proceso y permitir análisis posteriores. Esto implica que el checkpoint no debe interpretarse como un modelo mejorado respecto a su base, y su publicación responde a la transparencia del proyecto, no a un valor de rendimiento.

Con 9.409.813.744 parámetros y licencia Apache 2.0, este artefacto es relevante para quienes estudian metodologías de entrenamiento agéntico o necesitan reproducir experimentos fallidos, pero no para despliegue en producción. No se dispone de información sobre contexto, cuantización, idiomas o benchmarks en los materiales publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `Qwen/Qwen3.5-9B-Base`, un transformer denso de aproximadamente 9.400 millones de parámetros. Sobre esta base, el proyecto AgentPTB ejecutó un pipeline de fine-tuning supervisado con contexto largo (`sft-long`) dentro de un entorno agéntico orquestado por Claude Code, en el run denominado `opus-high-v3`. El checkpoint corresponde al paso 24 de ese proceso, en la hora 94 de ejecución.

No se publican detalles sobre el dataset de entrenamiento, el número de tokens procesados ni la composición de los datos. El autor indica explícitamente que el run no encontró mejora de pesos entrenada, lo que sugiere que el proceso de SFT no logró superar el comportamiento del modelo base. Esta ausencia de mejora es el hallazgo central del experimento y motiva su clasificación como resultado negativo.

## Capacidades

- No se han documentado capacidades específicas para este checkpoint más allá de las heredadas del modelo base Qwen3.5-9B-Base.
- El autor no reporta soporte para tool calling, razonamiento multi-paso, capacidades multilingües ni modos especiales de pensamiento.
- Dado que el run no produjo mejora de pesos, cualquier capacidad observable correspondería al modelo base, no a este checkpoint en particular.
- No se dispone de información sobre generación de código, matemáticas o visión.

## Casos de uso

- Reproducibilidad experimental: este checkpoint permite a investigadores replicar el run `opus-high-v3` del proyecto AgentPTB y verificar la ausencia de mejora reportada. Es útil para auditar metodologías de entrenamiento agéntico.
- Estudio de fallos de SFT: analizar por qué el fine-tuning supervisado no logró mejorar el modelo base puede orientar futuros diseños de datasets o estrategias de entrenamiento.
- Comparación de checkpoints intermedios: junto con otros artefactos del proyecto (por ejemplo, `opus-high-v1`), permite estudiar la evolución de los pesos a lo largo del run y detectar posibles regresiones.
- Documentación de resultados negativos: sirve como referencia para la comunidad sobre experimentos que no alcanzan los objetivos, contribuyendo a evitar duplicación de esfuerzos.
- Análisis de la dinámica de entrenamiento: los tensores guardados en safetensors pueden inspeccionarse para estudiar cambios de norma, distribución de pesos o comportamiento de capas específicas.
- No se recomienda su uso en aplicaciones prácticas, dado que no aporta mejoras sobre el modelo base y su estado es intermedio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación estándar. La ausencia de mejora de pesos entrenada sugiere que cualquier evaluación arrojaría resultados equivalentes o inferiores a los de Qwen3.5-9B-Base, pero no hay datos empíricos que lo confirmen.

## Requisitos de hardware

- El repositorio ocupa 18.8 GB en formato safetensors, lo que corresponde aproximadamente al tamaño de los pesos en precisión fp16/bf16 para 9.400 millones de parámetros.
- Para inferencia en fp16 se estima una VRAM mínima de unos 19 GB, lo que excede la capacidad de GPUs de consumo como la RTX 4090 (24 GB) si se usan pesos completos; con cuantización a 8 bits o 4 bits podría caber, pero no se proporcionan configuraciones oficiales.
- GPUs recomendadas: no se especifican. En ausencia de datos, una A100 de 40 GB o una H100 serían adecuadas para cargar los pesos sin cuantizar, aunque el checkpoint no está pensado para despliegue.
- Opciones de despliegue: no se indican. Dado el carácter de resultado negativo, no se recomienda su uso con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|
| agentic-ptb/opus-high-v3.h094.sft-long.step_24 | 9.4B | no disponible | Apache 2.0 | sin benchmarks |
| Qwen/Qwen3.5-9B-Base | 9.4B | no disponible | Apache 2.0 | sin benchmarks publicados en esta ficha |
| Otros modelos de 9B (p. ej. Llama 3.1 8B) | 8B | 128K | Llama 3.1 | no comparable sin datos |

La comparativa directa no es posible porque no se dispone de métricas de rendimiento para este checkpoint ni para su base en los materiales consultados. El único punto de referencia claro es el modelo base del que deriva, respecto al cual no se reporta mejora alguna.

## Limitaciones y advertencias

- Resultado negativo: el autor declara que el run no encontró mejora de pesos entrenada; no debe inferirse calidad a partir de la publicación.
- Checkpoint intermedio: no es un modelo final ni apto para uso directo en aplicaciones.
- Sin información de contexto, idiomas o cuantización: se desconocen las capacidades reales del checkpoint más allá de las del base.
- Riesgo de alucinación y sesgos: al heredar el comportamiento de Qwen3.5-9B-Base, hereda también sus limitaciones, pero no se documentan específicamente.
- Licencia Apache 2.0 permite uso comercial, pero el estado del modelo hace desaconsejable su despliegue en producción.
- No se proporcionan benchmarks, por lo que cualquier afirmación de rendimiento sería especulativa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h094.sft-long.step_24
- Dataset asociado: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Página de modelos de agentic-ptb: https://huggingface.co/models?other=agentic-ptb
