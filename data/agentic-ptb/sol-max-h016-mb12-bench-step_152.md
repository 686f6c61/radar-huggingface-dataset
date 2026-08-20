# agentic-ptb/sol-max.h016.mb12-bench.step_152

## Resumen

El modelo `agentic-ptb/sol-max.h016.mb12-bench.step_152` es un checkpoint intermedio de un barrido de entrenamiento (sweep) denominado AgentPTB, desarrollado por el usuario agentic-ptb. Se trata de un fine-tune del modelo base Qwen/Qwen3.5-9B-Base, orientado a tareas agénticas mediante un ajuste por supervisión (SFT) con el pipeline `pi-agent-sft-v3`. El checkpoint corresponde a la hora 4.8 de una ejecución de 100 horas, con un driver de razonamiento basado en Codex / gpt-5.6-sol a esfuerzo máximo.

Con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), el modelo está pensado para experimentación y evaluación dentro del propio barrido, no como un artefacto de producción. Su relevancia radica en que forma parte de un estudio sistemático sobre cómo evoluciona el rendimiento agéntico a lo largo del tiempo de entrenamiento, y en que incorpora una corrección del token de fin de secuencia (`<|im_end|>`) que evita el desbordamiento del contexto durante la evaluación. No se dispone de información sobre licencia, idiomas soportados ni benchmarks publicados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-9B-Base, sin especificar) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (18,8 GB, 4 shards) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Qwen3.5-9B-Base, sobre la que se aplica un fine-tune por supervisión (SFT) con el pipeline `pi-agent-sft-v3`. El entrenamiento se enmarca en un barrido de 100 horas dirigido por un driver de razonamiento (Codex / gpt-5.6-sol) con esfuerzo máximo, y este checkpoint concreto se guardó a las 4,8 horas de ejecución. No se han publicado detalles sobre el dataset utilizado, el número de tokens de entrenamiento ni si se emplearon técnicas adicionales como RLHF o DPO. La model card indica que el token `eos_token_id` es `248046` (correspondiente a `<|im_end|>`), lo que garantiza que el modelo detiene correctamente las respuestas en el formato de chat de Qwen3.5.

## Capacidades

- No se dispone de información detallada sobre las capacidades específicas de este checkpoint.
- Al ser un fine-tune de Qwen3.5-9B-Base, se espera que herede capacidades generales de generación de texto, razonamiento y posiblemente tool calling, pero no está confirmado.
- El pipeline `pi-agent-sft-v3` sugiere un enfoque en tareas agénticas (uso de herramientas, razonamiento multi-paso), aunque no hay documentación pública al respecto.
- No se han publicado resultados de evaluación que permitan verificar capacidades concretas.

## Casos de uso

- No se han documentado casos de uso específicos para este checkpoint. Al ser un artefacto intermedio de un barrido experimental, su propósito principal es la investigación y la comparación dentro del propio estudio.
- Podría utilizarse como punto de partida para evaluar la evolución del rendimiento agéntico a lo largo del entrenamiento, pero no se recomienda su uso en producción sin una validación adicional.
- Si se quisiera explorar su comportamiento en tareas de agente (tool calling, razonamiento multi-paso), sería necesario configurar un entorno de evaluación adecuado y comparar con otros checkpoints del mismo barrido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otros estándares, y los resultados de búsqueda web no proporcionan datos específicos para este modelo. Se recomienda consultar el índice `agentic-ptb/INDEX` mencionado en la model card para obtener más información sobre el barrido, aunque no se ha verificado su contenido.

## Requisitos de hardware

- Tamaño del modelo: 9,4 mil millones de parámetros, con pesos en safetensors de 18,8 GB (FP16/BF16).
- Para inferencia en precisión completa (FP16), se estima una necesidad de al menos 20 GB de VRAM, lo que requiere GPUs como A100 (40 GB), RTX 4090 (24 GB) o similares.
- Con cuantización a 4 bits (no disponible en el repo, pero posible mediante herramientas externas), podría caber en GPUs de 8-12 GB, aunque no hay datos oficiales.
- Opciones de despliegue: no se especifican, pero al ser un modelo basado en Qwen, podría usarse con vLLM, llama.cpp, Ollama o TGI, siempre que se adapte el formato de pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos de la misma categoría. El modelo base Qwen3.5-9B-Base es el único punto de referencia claro, pero no se han publicado métricas comparativas. Se indica "no disponible" para esta sección.

## Limitaciones y advertencias

- Es un checkpoint intermedio de un barrido experimental, no un modelo final optimizado para producción.
- No se especifica licencia, lo que impide conocer las restricciones de uso comercial.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas.
- El modelo está diseñado para evaluación dentro del barrido; su uso fuera de ese contexto requiere re-empaquetado y validación.
- La model card advierte que los checkpoints sin el token `eos` correcto pueden desbordar el contexto; este checkpoint lo tiene corregido, pero sigue siendo un artefacto de investigación.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/agentic-ptb/sol-max.h016.mb12-bench.step_152
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Referencias de la búsqueda web (no directamente relacionadas con el modelo, pero útiles para contexto):
  - GPT-5.6 de OpenAI: https://openai.com/index/gpt-5-6/
  - BenchLM leaderboard agéntico: https://benchlm.ai/agentic
  - LiveBench: https://livebench.ai/
