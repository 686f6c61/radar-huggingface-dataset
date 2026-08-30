# agentic-ptb/opus-high-v3.h005.sft-v1b.step_12

## Resumen

`opus-high-v3.h005.sft-v1b.step_12` es un checkpoint intermedio derivado de un run de entrenamiento del proyecto AgentPTB, concretamente de la celda `opus-high-v3` ejecutada con Claude Code. El modelo es un fine-tuning supervisado (SFT) sobre `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros y licencia Apache 2.0. El autor lo etiqueta explícitamente como `intermediate` y `negative-results`, indicando que el run no produjo ninguna mejora de los pesos entrenados respecto al modelo base.

La relevancia de este checkpoint es exclusivamente metodológica: sirve para reproducibilidad y estudio cualitativo de un experimento fallido de entrenamiento agéntico. No debe interpretarse como un modelo con capacidades mejoradas, y el propio autor advierte en la model card que no se infiera calidad a partir de su publicación. No se han publicado métricas de rendimiento, benchmarks ni detalles de entrenamiento más allá de la procedencia del archivo de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fine-tuning de Qwen/Qwen3.5-9B-Base (detalles de arquitectura del base no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un checkpoint de un fine-tuning supervisado (SFT) sobre `Qwen/Qwen3.5-9B-Base`, dentro del framework AgentPTB. El run `opus-high-v3` se ejecutó durante al menos 12 pasos (`step_12`) y el archivo de pesos se almacenó en `scratch/agent/sft-v1b/weights/step_12`. Según el índice del proyecto, el run `opus-high-v2` (un rerun abortado) dejó de producir checkpoints en torno a la hora 12 y envió los tensores del modelo base sin cambios tras cinco runs de SFT que regresaron. Esto sugiere que el run `opus-high-v3` siguió una dinámica similar, con resultados negativos.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si se aplicaron técnicas como RLHF o DPO. El autor no publica detalles adicionales en la model card, y el archivo de datos asociado (`agentic-ptb/opus-high-v3-data`) no está documentado en la información proporcionada.

## Capacidades

No se han publicado capacidades específicas para este checkpoint. Al ser un fine-tuning de Qwen3.5-9B-Base, podría heredar las capacidades del modelo base (generación de texto, razonamiento, código, etc.), pero no hay evidencia de que el entrenamiento haya mejorado o modificado dichas capacidades. El autor advierte explícitamente que no se debe inferir calidad a partir de la publicación.

- Generación de texto: no verificada en este checkpoint.
- Razonamiento y código: no verificados.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

Dado el carácter de checkpoint intermedio con resultados negativos, no se recomienda su uso en aplicaciones prácticas. Los únicos casos de uso razonables son:

- Reproducibilidad de experimentos: permite replicar el run `opus-high-v3` y verificar los resultados negativos reportados por el autor.
- Estudio cualitativo de fallos de entrenamiento: útil para investigar por qué un SFT sobre un modelo base de 9B no produce mejoras en tareas agénticas.
- Análisis de dinámicas de pérdida y convergencia: el checkpoint puede compararse con el modelo base para estudiar la evolución de los pesos durante el entrenamiento.
- Investigación sobre entrenamiento agéntico: sirve como caso documentado de un run fallido dentro del proyecto AgentPTB.
- Auditoría de pipelines de SFT: permite validar si el pipeline de entrenamiento produce checkpoints válidos o si, como en este caso, los pesos no cambian significativamente.
- Docencia e investigación metodológica: ejemplo de cómo documentar y publicar resultados negativos en aprendizaje automático.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de MMLU, HumanEval, GSM8K ni ningún otro benchmark. Dado que el run se considera fallido, no se espera que el modelo supere al base `Qwen3.5-9B-Base` en ninguna tarea.

## Requisitos de hardware

No se dispone de datos oficiales de requisitos de hardware para este checkpoint. Como orientación general para un modelo de ~9.4B parámetros en precisión fp16:

- VRAM estimada para inferencia en fp16: aproximadamente 19-20 GB (solo pesos), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización int8: aproximadamente 10-11 GB.
- GPU recomendadas: NVIDIA A100 (40 GB), RTX 4090 (24 GB), o GPUs con al menos 24 GB de VRAM para fp16.
- En consumer GPU: cabría en una RTX 4090 o RTX 3090 (24 GB) en fp16, o en GPUs de 16 GB con cuantización int8, aunque no hay datos oficiales de latencia.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI podrían servir, pero no hay configuraciones validadas para este checkpoint concreto.

Estas cifras son estimaciones basadas en el tamaño del modelo y no en mediciones reales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| `opus-high-v3.h005.sft-v1b.step_12` | 9.409.813.744 | No disponible | Apache 2.0 | Checkpoint intermedio, resultados negativos |
| `Qwen/Qwen3.5-9B-Base` | ~9.4B | No disponible | Apache 2.0 | Modelo base de referencia |

No se dispone de información sobre otros modelos comparables de la misma categoría (fine-tunes de Qwen3.5-9B-Base con fines agénticos). La comparación con el modelo base es la única referencia válida, y el autor indica que no hay mejora de pesos entrenados.

## Limitaciones y advertencias

- Resultados negativos: el autor declara que el run no encontró ninguna mejora de los pesos entrenados; el checkpoint no debe usarse como modelo de producción.
- Checkpoint intermedio: es un artefacto de reproducibilidad, no un modelo final pulido.
- Sin benchmarks: no hay métricas publicadas que respalden ninguna capacidad.
- Sin documentación de entrenamiento: se desconocen el dataset, el número de tokens y las técnicas de alineación utilizadas.
- Riesgo de alucinación y sesgos: no evaluados; al ser un fine-tune de un base no verificado, no se puede descartar.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo no es apto para ello por su naturaleza experimental.
- Advertencia del autor: "no inferir calidad a partir de la publicación".

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h005.sft-v1b.step_12
- Dataset asociado: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Búsqueda de modelos de agentic-ptb: https://huggingface.co/models?other=agentic-ptb
