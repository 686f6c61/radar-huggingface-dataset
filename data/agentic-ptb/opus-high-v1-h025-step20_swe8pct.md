# agentic-ptb/opus-high-v1.h025.step20_swe8pct

## Resumen

El modelo `agentic-ptb/opus-high-v1.h025.step20_swe8pct` es un checkpoint intermedio de un barrido de entrenamiento (sweep) denominado `opus-high-v1`, desarrollado por el usuario `agentic-ptb`. Está basado en el modelo base `Qwen/Qwen3.5-9B-Base` y cuenta con 9.409.813.744 parámetros, lo que lo sitúa en la gama de 9B. El repositorio tiene un tamaño de 18,8 GB y los pesos se almacenan en formato `safetensors` en 4 shards.

Según la model card, este checkpoint forma parte de un proceso de entrenamiento dirigido por un agente (Claude Code / claude-opus-5) con un nivel de razonamiento `high`. Su rol es `intermediate`, es decir, no es un modelo final sino un punto intermedio en un barrido de hiperparámetros. La relevancia de este modelo es limitada fuera del contexto del propio barrido, ya que carece de un token `eos` crítico (`<|im_end|>`, id 248046), lo que impide que la generación se detenga correctamente al final de cada turno y provoca que las evaluaciones sean un piso, no una medida real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada (basada en Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

La arquitectura no se detalla en la información proporcionada, pero al estar basado en `Qwen/Qwen3.5-9B-Base`, se asume que hereda la arquitectura transformer de dicha familia (no se especifica si es densa o MoE). El entrenamiento se enmarca en un barrido de hiperparámetros (`sweep`) denominado `opus-high-v1`, donde el "driver" es un agente basado en Claude Code / claude-opus-5 con un nivel de razonamiento `high`. No se proporcionan datos sobre el dataset, el número de tokens de entrenamiento ni el uso de técnicas como RLHF o DPO. El checkpoint corresponde al paso `step20_swe8pct` (paso 20, con un 8% de avance del barrido) y su rol es `intermediate`, lo que indica que no es un modelo final sino un punto de control intermedio.

## Capacidades

No se dispone de información específica sobre las capacidades de este checkpoint. Al ser un modelo intermedio basado en Qwen3.5-9B, es probable que herede capacidades de generación de texto, razonamiento y código, pero no hay datos publicados que lo confirmen. La model card advierte que, al faltar el token `eos` 248046, el modelo no detiene la generación al final del turno, lo que degrada su comportamiento en tareas conversacionales o de generación con límite de contexto.

## Casos de uso

No se han documentado casos de uso específicos para este checkpoint. Dado que es un modelo intermedio con una limitación crítica en el token de fin de secuencia, no se recomienda su uso en aplicaciones de producción. Su utilidad se limita al análisis interno del barrido de entrenamiento, como comparar la evolución del rendimiento entre checkpoints con el mismo estado de `eos`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los números de evaluación de este checkpoint son un "piso" (floor) debido a la ausencia del token `eos`, por lo que no deben compararse directamente con otros modelos sin la misma condición.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware. Como estimación orientativa, un modelo de 9.409 millones de parámetros en precisión FP16 ocupa aproximadamente 18,8 GB de memoria, por lo que se necesitaría una GPU con al menos 24 GB de VRAM para inferencia sin cuantizar (por ejemplo, RTX 3090, RTX 4090, A10G o A100). Con cuantización a 8 bits o 4 bits, podría caber en GPUs de 12-16 GB, pero no hay datos oficiales que lo confirmen. Las opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) no están documentadas para este checkpoint.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. Al ser un checkpoint intermedio de un barrido privado, no existe una categoría pública de modelos similares con la que compararlo. Se recomienda tratar este modelo como un artefacto de investigación, no como un modelo de propósito general.

## Limitaciones y advertencias

- **Token eos faltante**: el checkpoint no incluye el token `<|im_end|>` (id 248046), lo que provoca que la generación no se detenga al final del turno y sobrepase la ventana de contexto. Esto invalida cualquier evaluación o uso conversacional.
- **Checkpoint intermedio**: no es un modelo final; su rendimiento puede ser inferior al de un modelo entrenado completamente.
- **Licencia no especificada**: al no indicarse licencia, no se puede garantizar su uso comercial o redistribución.
- **Sin datos de entrenamiento**: no se conocen los datos utilizados, por lo que no se pueden evaluar sesgos o riesgos de alucinación.
- **Sin benchmarks**: no hay resultados publicados que permitan comparar su rendimiento con otros modelos.

## Enlaces

- [HuggingFace - agentic-ptb/opus-high-v1.h025.step20_swe8pct](https://huggingface.co/agentic-ptb/opus-high-v1.h025.step20_swe8pct)
- [Modelo base: Qwen/Qwen3.5-9B-Base](https://huggingface.co/Qwen/Qwen3.5-9B-Base)
