# agentic-ptb/grok.h023.sft-v7.step_200

## Resumen

El modelo `agentic-ptb/grok.h023.sft-v7.step_200` es un checkpoint intermedio generado durante un barrido (sweep) de entrenamiento del proyecto AgentPTB. Se basa en el modelo `Qwen/Qwen3.5-9B-Base` y cuenta con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones). El identificador indica que corresponde a la hora 23 de un run de 100 horas, con una configuración de celda `grok` y un driver denominado `pi / grok-4.6` con esfuerzo de razonamiento `xhigh`. Se trata de un artefacto de investigación, no de un modelo final listo para producción.

El checkpoint se publica con un defecto conocido en el token de fin de secuencia (EOS): falta el token `248046` (`<|im_end|>`), lo que provoca que el modelo no detenga correctamente las respuestas y pueda sobrepasar la ventana de contexto. Por tanto, cualquier evaluación realizada sobre este checkpoint debe interpretarse como un límite inferior, no como una medición fiable. Su relevancia radica en que forma parte de un estudio sistemático sobre el rendimiento de diferentes configuraciones de entrenamiento a lo largo del tiempo, y puede servir para analizar la evolución de las métricas durante el proceso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B-Base) |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamaño del repo: 18,8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint base `Qwen/Qwen3.5-9B-Base`, que emplea una arquitectura transformer estándar. El proceso de entrenamiento se enmarca en el proyecto AgentPTB, un barrido de 100 horas que evalúa distintas configuraciones de celdas y drivers. En este caso, la celda es `grok` y el driver es `pi / grok-4.6` con un esfuerzo de razonamiento `xhigh`. No se proporcionan detalles sobre el conjunto de datos, el número de tokens de entrenamiento ni el método de optimización (RLHF, DPO, etc.). El checkpoint se guarda en 4 shards y ocupa 18,8 GB. Se trata de un artefacto intermedio (hora 23 de 100), por lo que su rendimiento no es representativo del resultado final del run.

## Capacidades

- No se han documentado capacidades específicas para este checkpoint en la información disponible.
- Al estar basado en Qwen3.5-9B-Base, podría heredar capacidades generales de generación de texto, razonamiento y código, pero no hay confirmación oficial.
- El defecto de EOS impide un uso fiable en tareas que requieran finalización correcta de secuencias.
- No se menciona soporte para tool calling, agentes, visión, audio ni otras capacidades especiales.

## Casos de uso

- No se han documentado casos de uso concretos para este checkpoint. Al ser un artefacto intermedio de investigación, no se recomienda su uso en aplicaciones reales.
- Podría emplearse en entornos de investigación para estudiar la evolución del rendimiento durante el entrenamiento, comparando métricas entre checkpoints de distintas horas.
- En ningún caso debe utilizarse en producción debido al defecto de EOS y a su naturaleza intermedia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente de que las métricas de evaluación de este checkpoint son un límite inferior debido al defecto de EOS, y que solo deben compararse con otros checkpoints que compartan el mismo estado de EOS.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~9,4B parámetros, se estima un consumo de memoria de al menos 18-20 GB en FP16, y de 5-8 GB en cuantizaciones de 4 bits (si estuvieran disponibles).
- GPU recomendadas: tarjetas con 24 GB o más (RTX 3090, RTX 4090, A100, etc.) para FP16; GPUs de 8-12 GB podrían funcionar con cuantización.
- No se dispone de información sobre latencia o throughput.
- Opciones de despliegue: no se especifican, pero al ser un modelo basado en Qwen, podría ser compatible con vLLM, llama.cpp u Ollama, aunque no está confirmado.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. Como referencia estructural, se puede comparar con su modelo base:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | no disponible | HuggingFace |
| agentic-ptb/grok.h023.sft-v7.step_200 | 9,4B | no disponible | no disponible | HuggingFace |

No se dispone de información sobre otros modelos comparables de la misma categoría.

## Limitaciones y advertencias

- Defecto crítico de EOS: falta el token `248046` (`<|im_end|>`), lo que provoca que el modelo no detenga las respuestas y pueda desbordar la ventana de contexto.
- Es un checkpoint intermedio de un run de 100 horas, no un modelo final optimizado.
- No se han documentado sesgos, pero al ser un fine-tuning de Qwen, podría heredar sesgos del modelo base.
- Riesgo de alucinación no evaluado.
- Licencia no especificada; no se puede confirmar si permite uso comercial.
- No se recomienda su uso en producción bajo ninguna circunstancia.

## Enlaces

- HuggingFace: https://huggingface.co/agentic-ptb/grok.h023.sft-v7.step_200
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Proyecto AgentPTB: no se ha encontrado un enlace directo en la información proporcionada.
