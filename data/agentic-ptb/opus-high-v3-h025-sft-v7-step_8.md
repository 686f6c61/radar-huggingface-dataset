# agentic-ptb/opus-high-v3.h025.sft-v7.step_8

## Resumen

`opus-high-v3.h025.sft-v7.step_8` es un checkpoint intermedio publicado por el usuario `agentic-ptb` dentro del proyecto AgentPTB, un experimento que explora el entrenamiento de modelos de lenguaje mediante datos generados por agentes de Claude Opus. El nombre "opus-high-v3" hace referencia a la tercera ejecución (v3) de una celda experimental denominada "opus@high", que utiliza Claude Opus como generador de datos para fine-tuning supervisado (SFT).

El modelo parte de `Qwen/Qwen3.5-9B-Base` (9.409.813.744 parámetros) y corresponde al paso 8 de la séptima ejecución de SFT, en la hora 25 del run. La propia model card advierte explícitamente que se trata de un checkpoint intermedio/derivado conservado para reproducibilidad y estudio cualitativo, y que **el run no encontró ninguna mejora en los pesos entrenados** (etiqueta `negative-results`). Por tanto, no debe inferirse calidad alguna a partir de su publicación.

Relevancia: este checkpoint es útil únicamente como artefacto de investigación para entender por qué ciertos enfoques de entrenamiento con datos sintéticos generados por agentes pueden fallar. No es apto para uso en producción ni para evaluación comparativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos originales en safetensors; el tamaño del repo, 18,8 GB, sugiere precisión fp16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) del modelo base `Qwen/Qwen3.5-9B-Base`, que emplea una arquitectura transformer decoder-only densa de 9,4 mil millones de parámetros. No se dispone de información sobre la arquitectura interna específica de Qwen3.5-9B-Base (número de capas, dimensiones, mecanismos de atención), más allá de que pertenece a la familia Qwen.

El proceso de entrenamiento forma parte del proyecto AgentPTB, cuyo objetivo es estudiar cómo modelos generados por agentes de Claude Opus (etiquetados como "opus-high") pueden utilizarse para crear datasets de fine-tuning. El checkpoint concreto corresponde al paso 8 de la séptima ejecución de SFT (sft-v7) en la hora 25 de la ejecución (h025). No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO.

La etiqueta `negative-results` y la advertencia de la model card indican que esta ejecución no produjo ninguna mejora en los pesos con respecto al modelo base. De hecho, en ejecuciones anteriores (como opus-high-v2) se observó que los checkpoints regresaban los tensores del modelo base sin cambios tras regresiones en las cinco ejecuciones de SFT.

## Capacidades

- No se han documentado capacidades específicas para este checkpoint.
- Al ser un fine-tuning de `Qwen/Qwen3.5-9B-Base`, se espera que herede las capacidades del modelo base (generación de texto, razonamiento, código, matemáticas, multilingüismo), pero no hay validación ni benchmarks que lo confirmen.
- El run reporta que no hubo mejora en los pesos entrenados, por lo que el modelo probablemente se comporta de manera idéntica o muy similar al modelo base, sin aportar valor adicional.
- No se ha verificado soporte para tool calling, agentes, ni modos especiales de razonamiento.

## Casos de uso

- No se recomienda ningún caso de uso en producción para este checkpoint.
- Su único propósito es servir como artefacto de reproducibilidad y estudio cualitativo dentro del proyecto AgentPTB, para analizar por qué la generación de datos con agentes de Claude Opus no produjo mejoras.
- Puede utilizarse en investigación para comparar el comportamiento de diferentes pasos de SFT y entender la dinámica de regresión durante el entrenamiento.
- No es adecuado para aplicaciones de atención al cliente, generación de código, análisis de datos u otras tareas prácticas, dado que no hay evidencia de rendimiento y el run fue catalogado como negativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Al no existir cuantizaciones publicadas ni datos de rendimiento, se ofrecen únicamente estimaciones orientativas basadas en el tamaño del modelo (9,4 B parámetros):

- **VRAM estimada para inferencia**: en fp16, aproximadamente 18-20 GB (considerando pesos y overhead de activaciones). Con cuantización 4-bit (no disponible oficialmente, pero posible mediante herramientas como llama.cpp o GPTQ), se reduciría a unos 6-8 GB.
- **GPU recomendadas**: para fp16, tarjetas con 24 GB o más (RTX 3090, RTX 4090, A10G, A100 40 GB). Para cuantización 4-bit, una RTX 3060 de 12 GB o superior podría ser suficiente.
- **Opciones de despliegue**: al no haber pesos cuantizados publicados, el despliegue se limitaría a usar los safetensors originales con frameworks como Transformers, vLLM o llama.cpp (este último requeriría conversión previa a GGUF).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No disponible. Dado que no se han publicado benchmarks ni métricas de rendimiento para este checkpoint, no es posible compararlo con otros modelos de la misma categoría (por ejemplo, Qwen3-8B, Llama-3.1-8B o Mistral-7B). La comparativa carecería de base empírica.

## Limitaciones y advertencias

- **Resultados negativos**: el run no produjo ninguna mejora en los pesos; el checkpoint es un registro de un experimento fallido y no debe interpretarse como un modelo de calidad.
- **Checkpoint intermedio**: corresponde a un paso temprano de entrenamiento (step 8) y no ha sido sometido a evaluación externa.
- **Sesgos y alucinación**: al derivar de Qwen3.5-9B-Base, podría heredar sesgos del modelo base, pero no hay datos que confirmen ni descarten este aspecto en el checkpoint.
- **Riesgo de sobreajuste o degradación**: los resultados negativos sugieren que el fine-tuning pudo degradar el rendimiento respecto al modelo base, aunque no se ha verificado.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial, pero al no haber validación de rendimiento, su uso en producción sería irresponsable.
- **Procedencia de datos**: los datos de entrenamiento fueron generados por agentes de Claude Opus, lo que podría introducir sesgos o artefactos no documentados.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/agentic-ptb/opus-high-v3.h025.sft-v7.step_8)
- [Dataset asociado opus-high-v3-data](https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data)
- [Índice del proyecto AgentPTB](https://huggingface.co/datasets/agentic-ptb/INDEX)
