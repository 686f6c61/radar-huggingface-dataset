# agentic-ptb/sol-high.h046.grpo-length-scaleswe.step_1

## Resumen

El modelo `agentic-ptb/sol-high.grpo-length-scaleswe.step_1` es un checkpoint intermedio de un barrido de entrenamiento (sweep) del proyecto AgentPTB. Se trata de un ajuste fino del modelo base `Qwen/Qwen3.5-9B-Base` mediante GRPO (Group Relative Policy Optimization), orientado a tareas de razonamiento con un nivel de esfuerzo alto (`effort high`). El checkpoint corresponde a la celda `sol-high`, generada por un driver basado en Codex / gpt-5.6-sol, y está pensado como punto de control intermedio dentro de un proceso de optimización más amplio, no como un modelo final listo para producción.

Su relevancia radica en que forma parte de una metodología de entrenamiento agéntico (AgentPTB) que explora la optimización de políticas de razonamiento mediante GRPO sobre un modelo base de 9.4 mil millones de parámetros. Al ser un checkpoint de paso 1, su utilidad principal es evaluar la evolución del entrenamiento y comparar celdas dentro del mismo sweep. No se dispone de información pública sobre su rendimiento final, licencia o capacidades específicas más allá de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3.5-9B-Base (detalles no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según datos del repo) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B-Base` y ha sido sometido a un proceso de optimización con GRPO, como indica el nombre del checkpoint (`grpo-length-scaleswe`). La model card menciona que el `eos_token_id` es correcto (`[248044, 248046]`), lo que garantiza que el modelo detiene la generación al final de cada turno según la plantilla de chat de Qwen3.5. El entrenamiento se enmarca en el proyecto AgentPTB, que utiliza un driver basado en Codex / gpt-5.6-sol con un nivel de razonamiento `high`. No se proporcionan detalles sobre el dataset, el número de tokens de entrenamiento, ni sobre técnicas adicionales como RLHF o DPO. Tampoco se especifican innovaciones arquitectónicas propias; se asume que la arquitectura es la del modelo base.

## Capacidades

- No se han documentado capacidades específicas para este checkpoint en la información disponible.
- Al estar basado en Qwen3.5-9B-Base, se espera que herede las capacidades generales de dicho modelo (generación de texto, razonamiento, código, etc.), pero no hay confirmación oficial.
- La model card indica que el token de fin de secuencia es correcto, lo que sugiere que el modelo respeta el formato de chat de Qwen3.5, pero no se detallan más funcionalidades.
- No se menciona soporte para tool calling, agentes, visión, audio ni modos de pensamiento explícitos.

## Casos de uso

- No se han documentado casos de uso específicos para este checkpoint en la información disponible.
- Al ser un checkpoint intermedio de un sweep de entrenamiento, su uso principal es la evaluación comparativa dentro del propio experimento AgentPTB.
- Podría emplearse como punto de partida para continuar el entrenamiento o para análisis de la dinámica de optimización GRPO.
- No se recomienda su uso en producción sin una evaluación adicional y sin conocer su licencia y rendimiento real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware.
- Estimación orientativa basada en el tamaño del modelo (9.4B parámetros): en FP16, la inferencia requeriría aproximadamente 18-20 GB de VRAM; con cuantización de 8 bits, alrededor de 10 GB; con 4 bits, unos 5-6 GB. Estas cifras son genéricas y no han sido validadas para este checkpoint concreto.
- GPUs recomendadas: tarjetas con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G) para FP16; GPUs de 12-16 GB podrían ser suficientes con cuantización.
- Opciones de despliegue: al ser un modelo basado en Qwen, podría servirse con vLLM, llama.cpp, Ollama o TGI, pero no hay confirmación de compatibilidad específica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (checkpoints intermedios de sweeps GRPO sobre Qwen3.5-9B). No se puede establecer una comparativa fiable.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final; su comportamiento puede ser inestable o incompleto.
- No se especifica la licencia, lo que impide conocer las restricciones de uso comercial o de redistribución.
- No se han publicado evaluaciones de sesgos, alucinación o robustez.
- La información disponible es insuficiente para garantizar su idoneidad en entornos de producción.
- El modelo base Qwen3.5-9B-Base puede tener sus propias limitaciones (idiomas, sesgos, etc.), pero no se detallan aquí.
- Se recomienda contactar con los autores del proyecto AgentPTB para obtener información adicional antes de cualquier uso.

## Enlaces

- [HuggingFace: agentic-ptb/sol-high.grpo-length-scaleswe.step_1](https://huggingface.co/agentic-ptb/sol-high.grpo-length-scaleswe.step_1)
