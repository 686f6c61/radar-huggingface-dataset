# agentic-ptb/sol-max-v2.h020.pi-agent-sft-v12.step_125

## Resumen

El modelo `agentic-ptb/sol-max-v2.h020.pi-agent-sft-v12.step_125` es un checkpoint intermedio de un proceso de entrenamiento experimental desarrollado por el equipo `agentic-ptb`. Forma parte de un barrido (sweep) de entrenamiento de agentes denominado `sol-max-v2`, en el que se utiliza como modelo base `Qwen/Qwen3.5-9B-Base`. El checkpoint corresponde a la hora 20.23 de una corrida de 100 horas, y su nombre indica que fue generado en el paso 125 de un entrenamiento supervisado de tipo agéntico (`pi-agent-sft-v12`).

Se trata de un modelo de 9.409.813.744 parámetros (aproximadamente 9.4B), con arquitectura `Qwen3_5ForConditionalGeneration`, que incluye una torre de visión aunque el checkpoint se sirve como modelo de solo texto. Su relevancia radica en que es un punto de evaluación dentro de un experimento de investigación sobre entrenamiento de agentes con razonamiento intensivo, no un modelo final listo para producción. La model card advierte sobre la correcta configuración del token de fin de turno (`<|im_end|>`) y sobre la necesidad de indicar a vLLM que el modelo es solo texto para evitar fallos de carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (vision + texto) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `Qwen/Qwen3.5-9B-Base`, que emplea una arquitectura transformer multimodal con torre de visión. Según la model card, la torre de visión está presente en los pesos, pero el proceso de exportación (`prime-rl`) no genera `preprocessor_config.json`, por lo que para servirlo con vLLM es necesario forzar el modo de solo texto mediante `--limit-mm-per-prompt '{"image": 0, "video": 0}'`.

El entrenamiento se enmarca en un barrido de agentes con razonamiento de alto esfuerzo (`effort max`), dirigido por un modelo `Codex / gpt-5.6-sol`. El checkpoint corresponde a la fase de `pi-agent-sft` (supervised fine-tuning para agentes) en el paso 125. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La model card destaca que el `eos_token_id` es correcto (`248046`, correspondiente a `<|im_end|>`), lo que garantiza que el modelo detiene su generación al final de cada turno, un aspecto crítico para la evaluación fiable.

## Capacidades

No se han publicado capacidades específicas para este checkpoint en la información disponible. Al ser un fine-tune de `Qwen/Qwen3.5-9B-Base`, se espera que herede las capacidades generales del modelo base (generación de texto, razonamiento, código, matemáticas, etc.), pero no se confirma explícitamente. El nombre `pi-agent-sft` sugiere un entrenamiento orientado a agentes, lo que podría implicar soporte para tool calling o razonamiento multi-paso, aunque no hay documentación al respecto.

## Casos de uso

No se han documentado casos de uso concretos para este checkpoint. Dado que es un punto intermedio de un experimento de investigación, su uso principal es la evaluación del progreso del entrenamiento dentro del barrido `sol-max-v2`. No se recomienda su uso en producción sin una validación adicional y sin conocer la licencia y los detalles de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que los valores de evaluación de checkpoints sin el `eos_token_id` correcto son un "suelo" (floor) y no una medición fiable, pero no se incluyen cifras concretas para este checkpoint.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware. Basándose en el tamaño del modelo (9.4B parámetros) y el tamaño del repositorio (18.8 GB), se estima que:

- Para inferencia en precisión fp16 se necesitan aproximadamente 19 GB de VRAM, por lo que una GPU con 24 GB (por ejemplo, RTX 4090, A100 40GB) sería suficiente.
- Con cuantización de 8 bits o 4 bits, podría caber en GPUs con 12-16 GB, aunque no se han publicado configuraciones oficiales.
- El despliegue puede realizarse con vLLM, indicando explícitamente que el modelo es solo texto mediante `--limit-mm-per-prompt`. También podría usarse llama.cpp u Ollama si se generan pesos GGUF, pero no se ha confirmado.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría. El modelo base `Qwen/Qwen3.5-9B-Base` sería la referencia natural, pero no se han publicado métricas comparativas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un checkpoint intermedio de un experimento, no un modelo final. Su rendimiento puede no ser representativo del modelo completo.
- La model card advierte que si el `eos_token_id` no es correcto, el modelo no se detiene al final del turno y sobrepasa la ventana de contexto, lo que invalida las evaluaciones. Este checkpoint sí lo tiene correcto, pero hay que verificarlo al reempaquetar.
- La torre de visión está presente en los pesos, pero no se exporta `preprocessor_config.json`. Si se intenta cargar con vLLM sin la opción `--limit-mm-per-prompt`, el modelo fallará.
- No se especifica la licencia, por lo que no se puede garantizar el uso comercial.
- No se conocen sesgos ni riesgos de alucinación específicos, pero al ser un modelo derivado de Qwen, podría heredar sesgos del modelo base.
- No se dispone de información sobre la longitud de contexto soportada, lo que limita su uso en aplicaciones que requieran contextos largos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/agentic-ptb/sol-max-v2.h020.pi-agent-sft-v12.step_125)
- [Organización agentic-ptb](https://huggingface.co/agentic-ptb)
