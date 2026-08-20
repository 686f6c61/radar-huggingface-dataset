# agentic-ptb/grok.h084.sft-atcb.step_40

## Resumen

Este modelo es un checkpoint intermedio de un experimento de investigación denominado AgentPTB sweep, desarrollado por el usuario `agentic-ptb`. Se basa en el modelo Qwen/Qwen3.5-9B-Base y cuenta con aproximadamente 9,4 mil millones de parámetros. El checkpoint fue guardado a las 84 horas de una ejecución de 100 horas, según el nombre del repositorio (`h084`), aunque la model card incluida hace referencia a otro checkpoint (`h075.rl-write.step_15`), lo que sugiere una inconsistencia en la documentación.

Se trata de un artefacto de investigación, no de un modelo final listo para producción. Su relevancia radica en que forma parte de un estudio sobre la evolución del rendimiento de modelos a lo largo del tiempo de entrenamiento, pero no está pensado para aplicaciones prácticas. Además, presenta un defecto conocido en el token de fin de secuencia (`eos_token_id`), que impide que el modelo se detenga correctamente al final de cada turno, lo que puede provocar que sobrepase la ventana de contexto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-9B-Base, un transformer de lenguaje de propósito general. No se especifican detalles adicionales sobre la arquitectura interna (número de capas, cabezas de atención, etc.) en la información disponible.

En cuanto al entrenamiento, el nombre del repositorio (`sft-atcb`) sugiere un proceso de ajuste fino supervisado (SFT), mientras que la model card menciona `rl-write`, lo que podría indicar una fase de aprendizaje por refuerzo. Sin embargo, no se proporcionan datos sobre el conjunto de datos utilizado, el número de tokens de entrenamiento ni las técnicas concretas (RLHF, DPO, etc.). El checkpoint se describe como parte de un "sweep" de AgentPTB, con un driver denominado `pi / grok-4.6` y un nivel de razonamiento `xhigh`. Es un checkpoint intermedio (role: `intermediate`) dentro de una ejecución de 100 horas.

Un aspecto técnico destacable es el defecto en el token de fin de secuencia: el `eos_token_id` configurado es `[248044]`, pero falta el token `248046` (`<|im_end|>`), que es el que el template de chat de Qwen3.5 utiliza para finalizar cada turno. Esto implica que el modelo no se detiene al final del turno y puede sobrepasar la ventana de contexto, lo que invalida las métricas de evaluación como mediciones absolutas.

## Capacidades

- No se han documentado capacidades específicas para este checkpoint en la información disponible.
- Al estar basado en Qwen3.5-9B-Base, se espera que herede capacidades generales de generación de texto, razonamiento, código y matemáticas, pero no hay confirmación experimental.
- No se menciona soporte para tool calling, agentes, visión, audio ni modos de razonamiento especiales.
- El defecto de `eos` impide un uso fiable en tareas que requieran finalización correcta de turnos.

## Casos de uso

- No se han documentado casos de uso específicos para este checkpoint.
- Dado su carácter de artefacto intermedio de investigación, no está pensado para aplicaciones de producción.
- Podría utilizarse en estudios académicos para analizar la dinámica de entrenamiento, la evolución de métricas a lo largo del tiempo o la comparación entre checkpoints de un mismo sweep.
- También podría servir como punto de partida para experimentos de fine-tuning adicionales, aunque el defecto de `eos` debería corregirse primero.
- No se recomienda su despliegue en entornos reales debido a la falta de licencia, la ausencia de benchmarks y el problema de finalización de secuencia.
- En el contexto de la investigación de AgentPTB, podría emplearse para trazar curvas de rendimiento frente al tiempo de entrenamiento, pero esto es una inferencia basada en el propósito del proyecto, no una capacidad documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte que, debido al defecto de `eos`, cualquier métrica de evaluación calculada sería un "suelo" (floor) y no una medición fiable, por lo que no se pueden comparar estos números con otros modelos.

## Requisitos de hardware

- Estimación de VRAM para inferencia en FP16: ~18,8 GB (tamaño del repositorio en safetensors), más overhead de ejecución.
- Con cuantización de 8 bits: ~9,4 GB de VRAM.
- Con cuantización de 4 bits: ~4,7 GB de VRAM.
- GPUs recomendadas (para FP16): A100 40GB, RTX 4090 24GB, o GPUs con al menos 20 GB de VRAM.
- Para cuantización 8-bit: RTX 3090, RTX 4080, o GPUs con 12 GB o más.
- Para cuantización 4-bit: GPUs consumer de 8 GB como RTX 3060 Ti o superiores.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, entre otros, siempre que se corrija el defecto de `eos` antes de su uso.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/grok.h084.sft-atcb.step_40 | 9,4B | no disponible | no disponible | HuggingFace |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | no disponible | HuggingFace |
| Llama 3.1 8B | 8B | 128k | Llama 3.1 Community License | HuggingFace |
| Mistral 7B | 7B | 32k | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento para comparar. La comparativa se limita a parámetros y disponibilidad. El modelo base Qwen3.5-9B-Base es el punto de referencia natural, pero no se conocen sus especificaciones de contexto ni licencia en la información proporcionada.

## Limitaciones y advertencias

- Defecto crítico de `eos`: el modelo no se detiene al final del turno, lo que provoca que sobrepase la ventana de contexto y degrade la calidad de las respuestas.
- Es un checkpoint intermedio de un experimento, no un modelo final optimizado para uso general.
- No se especifica licencia, lo que impide su uso comercial sin autorización explícita del autor.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas.
- La documentación es inconsistente: el nombre del repositorio (`h084.sft-atcb.step_40`) no coincide con la model card (`h075.rl-write.step_15`), lo que dificulta la trazabilidad.
- No se han publicado benchmarks fiables debido al defecto de `eos`.
- No se recomienda su uso en producción sin una revisión y corrección previa del token de fin de secuencia.

## Enlaces

- [HuggingFace: agentic-ptb/grok.h084.sft-atcb.step_40](https://huggingface.co/agentic-ptb/grok.h084.sft-atcb.step_40)
- No se han encontrado otros enlaces (papers, blogs, repositorios) en la información proporcionada.
