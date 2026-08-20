# agentic-ptb/dpsk-v4-flash.h046.sft3_final.step_1900

## Resumen

Este modelo es un checkpoint intermedio de un barrido (sweep) de entrenamiento del proyecto AgentPTB, identificado como `dpsk-v4-flash.h046.sft3_final.step_1900`. Se trata de un fine-tuning supervisado (SFT) del modelo base Qwen/Qwen3.5-9B-Base, con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), en formato safetensors y un tamaño de repositorio de 18,8 GB. El nombre "dpsk-v4-flash" sugiere que el objetivo es replicar o destilar las capacidades de DeepSeek V4 Flash, un modelo MoE de 284B parámetros con 13B activos y 1M de contexto, en un modelo denso mucho más pequeño. El checkpoint se generó a la hora 46 (según el nombre del repo) o 70,65 (según la model card interna, que parece corresponder a otro checkpoint) de una ejecución de 100 horas. Es un artefacto de investigación, no un modelo final listo para producción.

La model card advierte que el token de fin de secuencia `<|im_end|>` (id 248046) no está presente en la lista de `eos_token_id`, lo que impide que el modelo detenga la generación al final de cada turno y puede provocar que sobrepase la ventana de contexto. Por tanto, cualquier métrica de evaluación obtenida con este checkpoint debe considerarse un límite inferior, no una medición real. No se dispone de licencia, idiomas soportados ni pipeline declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-9B-Base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors en FP16/FP32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

Nota: el tamaño del repo es 18,8 GB, consistente con pesos en FP16 para 9,4B parámetros.

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) del modelo base Qwen/Qwen3.5-9B-Base. No se especifican detalles del dataset de entrenamiento, número de tokens ni composición. El nombre del checkpoint y el campo "driver" indican que se entrena para imitar el comportamiento de DeepSeek V4 Flash con "reasoning effort: thinking", es decir, un modo de razonamiento explícito. Es un checkpoint intermedio de un barrido de hiperparámetros de 100 horas, escrito a la hora 46 (según el nombre del repo) o 70,65 (según la model card interna, que parece corresponder a otro checkpoint). No hay información sobre técnicas como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-9B-Base, aunque no se han publicado evaluaciones específicas para este checkpoint.
- Orientación a razonamiento ("thinking"): el nombre sugiere que se ha entrenado para producir razonamiento paso a paso, similar a DeepSeek V4 Flash.
- No se dispone de información sobre tool calling, function calling, capacidades multimodales o multilingües específicas de este checkpoint.
- Advertencia: debido al token eos faltante, el modelo no detiene la generación al final del turno, lo que afecta a cualquier uso conversacional o de agente.

## Casos de uso

- Investigación y análisis de curvas de entrenamiento: este checkpoint permite estudiar la evolución del rendimiento a lo largo del barrido, comparándolo con otros checkpoints del mismo cell.
- Experimentación con destilación de modelos: sirve como ejemplo de cómo destilar un modelo MoE grande (DeepSeek V4 Flash) en un modelo denso pequeño.
- Evaluación de la influencia del token eos en la generación: al carecer de `<|im_end|>`, es útil para estudiar el efecto de la terminación de secuencia en modelos de chat.
- Re-empaquetado y fine-tuning adicional: si se añade el token eos correcto, podría servir como punto de partida para nuevos entrenamientos.
- Pruebas de inferencia en hardware consumer: con 9,4B parámetros, puede ejecutarse en GPUs de gama alta con cuantización, aunque no se recomienda para producción.
- No se recomienda su uso en aplicaciones reales sin re-empaquetar y validar previamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte que cualquier métrica obtenida con este checkpoint es un "floor" debido al token eos faltante, por lo que no debe compararse con otros modelos sin tener en cuenta esta limitación.

## Requisitos de hardware

- VRAM estimada: en FP16, ~18,8 GB (coincide con el tamaño del repo). Con cuantización de 8 bits, ~9,4 GB; con 4 bits, ~4,7 GB.
- GPU recomendadas: para FP16, una GPU con 24 GB (RTX 3090/4090, A5000) o más. Con cuantización 4 bits, puede caber en GPUs de 8 GB (RTX 3060, etc.), aunque con menor calidad.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, siempre que se re-empaquete el modelo para incluir el token eos correcto.
- Latencia y throughput: no disponibles. Para un modelo de 9,4B en FP16, se puede estimar un throughput de decenas de tokens por segundo en una RTX 4090, pero no hay datos medidos.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar. Como referencia estructural:

- Qwen/Qwen3.5-9B-Base: modelo base, 9,4B parámetros, sin fine-tuning específico. Este checkpoint es un SFT de él.
- DeepSeek V4 Flash: modelo MoE de 284B parámetros totales, 13B activos, 1M de contexto, orientado a coding y agentes. Este checkpoint intenta imitarlo en un formato denso pequeño.
- No hay otros modelos comparables con datos publicados en la información disponible.

## Limitaciones y advertencias

- Token eos faltante: el checkpoint no incluye el token `<|im_end|>` (id 248046) en su lista de `eos_token_id`, por lo que la generación no se detiene al final del turno y puede sobrepasar la ventana de contexto. Es necesario re-empaquetar el modelo antes de cualquier uso.
- Checkpoint intermedio: no es un modelo final; forma parte de un barrido de 100 horas y su rendimiento puede ser inferior al de checkpoints posteriores.
- Licencia no especificada: no se indica ninguna licencia, lo que impide su uso comercial sin autorización explícita.
- Sin datos de sesgos o alucinaciones: no se ha evaluado el modelo en estos aspectos.
- Discrepancia en la model card: la model card interna describe un checkpoint diferente (h070, sft4_step2600) al del nombre del repo (h046, sft3_final, step_1900), lo que sugiere que la documentación puede no corresponder exactamente a este artefacto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/dpsk-v4-flash.h046.sft3_final.step_1900
- DeepSeek V4 Flash (modelo original): https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- DeepSeek V4 Flash 0731: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Guías de integración de DeepSeek en agentes: https://github.com/deepseek-ai/awesome-deepseek-agent
