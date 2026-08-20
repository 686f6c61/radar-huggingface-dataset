# agentic-ptb/sol-max-opusnode.h022.stage3-recovery-alpha-retention-64k-serve.step_150

## Resumen

El modelo `agentic-ptb/sol-max-opusnode.h022.stage3-recovery-alpha-retention-64k-serve.step_150` es un checkpoint intermedio generado durante un barrido de entrenamiento (sweep) del proyecto AgentPTB. Se trata de un fine-tuning del modelo base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros y un tamaño de repositorio de 18,8 GB en formato safetensors. El identificador sugiere que fue creado en la hora 22 de un run de 100 horas, con una configuración de retención de contexto de 64k tokens, aunque estos datos no están confirmados oficialmente.

El checkpoint fue producido por un agente de código (Codex / gpt-5.6-sol) con un nivel de razonamiento máximo, y está etiquetado como "intermediate" dentro del run. La model card indica que el entrenamiento murió alrededor de la hora 16, por lo que este checkpoint no representa un modelo final optimizado, sino una instantánea de un proceso de exploración. Su relevancia radica en que permite estudiar la evolución del fine-tuning de Qwen3.5-9B-Base en un contexto de entrenamiento agéntico, aunque no está pensado para uso directo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base, sin detalles adicionales) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el nombre sugiere 64k, sin confirmación oficial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen3.5-9B-Base, un transformer de 9.000 millones de parámetros desarrollado por Alibaba. No se proporcionan detalles sobre la arquitectura interna específica (número de capas, cabezas de atención, etc.) ni sobre el proceso de entrenamiento. La model card indica que es un checkpoint de un sweep de AgentPTB, donde un agente de código (Codex / gpt-5.6-sol) con razonamiento máximo generó los pesos. El entrenamiento se detuvo prematuramente (alrededor de la hora 16 de un run de 100 horas), lo que sugiere que el proceso no alcanzó la convergencia completa. No hay información sobre el dataset utilizado, el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

No se dispone de información documentada sobre las capacidades específicas de este checkpoint. Al ser un fine-tuning de Qwen3.5-9B-Base, podría heredar capacidades generales de generación de texto, razonamiento y código, pero no hay evidencia concreta en la información proporcionada. No se mencionan capacidades de tool calling, agentes, visión, audio ni multilingüismo. Se recomienda tratar este modelo como un artefacto de investigación sin capacidades verificadas.

## Casos de uso

No se han documentado casos de uso específicos para este checkpoint. Dado que es un artefacto intermedio de un proceso de entrenamiento experimental, no es adecuado para aplicaciones prácticas. Los posibles usos se limitan a:

- Análisis de la dinámica de entrenamiento en sweeps agénticos.
- Comparación de checkpoints dentro del mismo run para estudiar la evolución de métricas.
- Investigación sobre fine-tuning de modelos base de 9B en entornos automatizados.

No se recomienda su uso en producción ni en tareas reales sin una evaluación exhaustiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que los números de evaluación de checkpoints sin el token EOS correcto son un "floor" (mínimo) y no una medición fiable, pero no se proporcionan valores concretos. No se puede comparar con otros modelos.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware. Basándose en el tamaño del modelo (9.409.813.744 parámetros, 18,8 GB en safetensors), se puede estimar que:

- En FP16, la inferencia requiere aproximadamente 19-20 GB de VRAM (solo pesos), más overhead de activaciones y KV cache.
- Una GPU con 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090) podría ejecutar el modelo con cuantización FP16 o int8.
- Con cuantización de 4 bits (GGUF), podría caber en GPUs de 8-12 GB, pero no se dispone de archivos cuantizados.
- Para despliegue, se podrían usar vLLM, llama.cpp u Ollama, pero no hay configuraciones probadas.

Estas cifras son estimaciones basadas en el tamaño del modelo, no en datos oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. El checkpoint es un artefacto de un proceso experimental y no se conocen modelos directamente comparables en la misma categoría (fine-tunes intermedios de Qwen3.5-9B-Base). Se podría comparar con el modelo base Qwen3.5-9B-Base, pero no hay datos de rendimiento de este checkpoint para hacer una comparación significativa.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; el entrenamiento se detuvo prematuramente (hora 16 de 100), lo que puede implicar convergencia incompleta y rendimiento subóptimo.
- Sin evaluación: no hay benchmarks ni métricas publicadas, por lo que se desconoce su calidad real.
- Token EOS: la model card indica que el eos_token_id es correcto, pero no se ha verificado en la práctica.
- Licencia desconocida: no se especifica la licencia, lo que impide su uso comercial sin aclaración.
- Sesgos y alucinaciones: al ser un fine-tune de un modelo base, puede heredar sesgos de Qwen3.5, pero no hay datos al respecto.
- No apto para producción: su naturaleza experimental y la falta de documentación lo hacen inadecuado para aplicaciones reales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-max-opusnode.h022.stage3-recovery-alpha-retention-64k-serve.step_150
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base (referencia, no se ha verificado su existencia)
