# agentic-ptb/sol-max-v2.h029.pi-agent-sft-v13.step_250

## Resumen

Este repositorio contiene un checkpoint intermedio del barrido de entrenamiento AgentPTB, identificado como `sol-max-v2.h029.pi-agent-sft-v13.step_250`. Lo publica el usuario `agentic-ptb` y se basa en el modelo `Qwen/Qwen3.5-9B-Base`, del que hereda la arquitectura `Qwen3_5ForConditionalGeneration` (una arquitectura de visión, aunque el checkpoint se sirve como texto). El checkpoint corresponde a la hora 29 de un run de 100 horas, con un "driver" de razonamiento máximo (Codex / gpt-5.6-sol) y un paso de entrenamiento 250. No es un modelo final listo para producción, sino un artefacto intermedio de un experimento de entrenamiento por refuerzo o ajuste fino agéntico.

El interés de este checkpoint radica en que permite estudiar la dinámica de entrenamiento a lo largo del tiempo, ya que el identificador del repositorio codifica la hora del run. Sin embargo, carece de documentación sobre datos de entrenamiento, licencia, idiomas o benchmarks, por lo que su uso práctico queda limitado a fines de investigación o como referencia dentro del propio barrido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (vision, usada como texto) |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (18,8 GB, 4 shards) |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen3.5-9B-Base`, que emplea la arquitectura `Qwen3_5ForConditionalGeneration`. Esta arquitectura incluye un codificador de visión, aunque el checkpoint se sirve como modelo de texto únicamente. El entrenamiento forma parte de un barrido denominado AgentPTB, donde el "driver" es un modelo de razonamiento máximo (Codex / gpt-5.6-sol) con `reasoning effort = max`. El checkpoint se guardó en el paso 250 de un run de 100 horas, en la hora 29.07. No se proporcionan detalles sobre el dataset, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El `eos_token_id` es correcto (`248046`, correspondiente a `<|im_end|>`), lo que garantiza que el modelo detiene correctamente los turnos de asistente.

## Capacidades

- No se dispone de información específica sobre las capacidades de este checkpoint concreto.
- Al estar basado en Qwen3.5-9B-Base, podría heredar capacidades generales de generación de texto, razonamiento y posiblemente visión, pero no hay datos verificables.
- No se documenta soporte para tool calling, agentes, ni modos especiales de razonamiento.
- El checkpoint está pensado como artefacto intermedio de un experimento, no como modelo de propósito general.

## Casos de uso

- Investigación de dinámicas de entrenamiento: permite analizar cómo evoluciona el rendimiento a lo largo de las horas de un run, comparando checkpoints de distintas horas.
- Reproducción de experimentos: útil para quienes quieran replicar o extender el barrido AgentPTB.
- Estudio de la influencia del `eos_token_id` en la generación: la model card advierte que checkpoints sin el token correcto sobrepasan el contexto, por lo que este checkpoint sirve como referencia para validar la corrección del empaquetado.
- No se recomienda su uso en aplicaciones de producción, dado su carácter intermedio y la falta de documentación sobre licencia y rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que los valores de evaluación de checkpoints sin el `eos_token_id` correcto son un "suelo" y no una medición fiable, pero no ofrece cifras concretas para este checkpoint.

## Requisitos de hardware

- El repositorio pesa 18,8 GB en formato safetensors (4 shards), lo que requiere al menos 19 GB de almacenamiento.
- Para inferencia con precisión FP16/BF16, se necesitaría una GPU con al menos 20 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A100 40 GB o superior).
- Con cuantización (por ejemplo, 8 bits o 4 bits) podría caber en GPUs de 12-16 GB, pero no se proporcionan archivos cuantizados.
- Para servir con vLLM, es necesario indicar explícitamente que el modelo es solo texto mediante `--limit-mm-per-prompt '{"image": 0, "video": 0}'`, ya que la arquitectura incluye un tower de visión y `prime-rl` no exporta `preprocessor_config.json`.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo base Qwen3.5-9B-Base es el único punto de referencia claro, pero no se ofrecen métricas comparativas. Dado que se trata de un checkpoint intermedio de un experimento, no es comparable directamente con modelos finales de la misma categoría.

## Limitaciones y advertencias

- Es un checkpoint intermedio de un run de entrenamiento, no un modelo final optimizado para uso general.
- No se especifica licencia, por lo que su uso comercial es incierto y requiere consultar al autor.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas.
- La arquitectura de visión está presente en los pesos, pero el modelo se sirve como texto; si se intenta cargar sin el flag adecuado en vLLM, fallará.
- El `eos_token_id` es correcto, pero otros checkpoints del mismo barrido pueden no tenerlo, lo que afecta a la validez de sus evaluaciones.
- No se recomienda su despliegue en entornos de producción sin una evaluación exhaustiva y sin confirmar la licencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/agentic-ptb/sol-max-v2.h029.pi-agent-sft-v13.step_250
- Búsqueda de modelos de `agentic-ptb`: https://huggingface.co/models?other=agentic-ptb
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
