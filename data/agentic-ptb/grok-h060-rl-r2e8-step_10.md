# agentic-ptb/grok.h060.rl-r2e8.step_10

## Resumen

Este repositorio contiene un checkpoint intermedio del sweep de entrenamiento AgentPTB, desarrollado por el equipo agentic-ptb. Se trata de un modelo de 9.409.813.744 parámetros (~9,4B) basado en Qwen/Qwen3.5-9B-Base, entrenado con el framework propietario `grok` y el driver `pi / grok-4.6` con un nivel de razonamiento `xhigh`. El checkpoint fue escrito aproximadamente a la hora 52-60 de una ejecución de 100 horas, por lo que su papel es estrictamente intermedio dentro de un proceso de investigación en aprendizaje por refuerzo.

La relevancia de este modelo es principalmente metodológica: forma parte de un barrido sistemático de hiperparámetros y configuraciones de RL, y su interés radica en poder trazar la evolución del rendimiento a lo largo del tiempo de entrenamiento. No es un modelo final listo para producción, y presenta un defecto conocido de empaquetado en el token de fin de secuencia que invalida cualquier evaluación directa como medición fiable. La arquitectura subyacente es la de Qwen3.5-9B-Base, un transformer denso, aunque no se especifican detalles adicionales de contexto o vocabulario en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3.5-9B-Base, no especificada) |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (18,8 GB, 4 shards) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-9B-Base, un transformer denso de aproximadamente 9.400 millones de parámetros. No se proporcionan detalles sobre la configuración interna (número de capas, cabezas de atención, dimensiones ocultas) ni sobre el vocabulario o la ventana de contexto original del modelo base.

El entrenamiento se realizó mediante un sweep de aprendizaje por refuerzo denominado AgentPTB, utilizando el framework `grok` con el driver `pi / grok-4.6` y un nivel de esfuerzo de razonamiento `xhigh`. El checkpoint corresponde a un punto intermedio de una ejecución de 100 horas, concretamente a la hora 52,39 según la model card (aunque el nombre del repositorio indica h060, lo que sugiere una discrepancia entre el nombre del archivo y el contenido de la documentación). No se especifican los datos de entrenamiento, el número de tokens procesados, ni si se emplearon técnicas como RLHF o DPO.

Se documenta un defecto de empaquetado: el `eos_token_id` configurado es `[248044]`, pero falta el token `248046` (`<|im_end|>`), que es el que la plantilla de chat de Qwen3.5 utiliza para terminar cada turno de asistente. Esto implica que el modelo no se detiene correctamente al final de un turno y puede sobrepasar la ventana de contexto, lo que invalida las métricas de evaluación como mediciones absolutas.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-9B-Base, aunque no se documentan explícitamente.
- Razonamiento extenso: el nivel de esfuerzo `xhigh` sugiere que el entrenamiento se orienta a cadenas de razonamiento largas y detalladas.
- Tool calling y funciones: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (visión, audio, thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Investigación en aprendizaje por refuerzo: el checkpoint permite analizar la evolución del rendimiento a lo largo del tiempo de entrenamiento, comparándolo con otros checkpoints del mismo sweep mediante el mapeo `{cell}.h{HHH}.{family}.{step}`.
- Estudio de curvas de entrenamiento: al ser un punto intermedio, resulta útil para trazar la relación entre horas de cómputo y métricas de evaluación, siempre que se comparen únicamente checkpoints con el mismo estado de `eos_token_id`.
- Análisis de defectos de empaquetado: el problema documentado con el token de fin de secuencia ofrece un caso de estudio sobre cómo los errores de tokenización afectan a la evaluación de modelos entrenados con RL.
- Reproducción de experimentos: el repositorio puede servir como referencia para reproducir el sweep AgentPTB o para validar la metodología de evaluación empleada.
- Desarrollo de pipelines de evaluación: la advertencia sobre el `eos_token_id` permite diseñar pipelines que detecten y corrijan este tipo de defectos antes de evaluar.
- No se recomienda su uso en aplicaciones prácticas o de producción debido a su naturaleza intermedia y al defecto de token de fin de secuencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente que los números de evaluación de este checkpoint son un piso, no una medición, debido al defecto del `eos_token_id` que provoca que el modelo no se detenga al final del turno y sobrepase la ventana de contexto. Por tanto, cualquier métrica reportada debe interpretarse con cautela y solo compararse con otros checkpoints que compartan el mismo estado de empaquetado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 19 GB en precisión fp16 (dado el tamaño de 18,8 GB del repositorio), ~10 GB en int8 y ~5 GB en int4 si se aplicara cuantización (estimaciones generales para un modelo de 9,4B parámetros).
- GPU recomendadas: una GPU con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A10G) para inferencia en fp16 sin cuantizar; GPUs de 16 GB (RTX 4080, L4) podrían funcionar con cuantización int8.
- No cabe en GPUs de consumo de gama baja (8 GB o menos) sin cuantización agresiva.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, previa conversión a los formatos adecuados (GGUF, etc.). Sin embargo, dado el defecto de `eos_token_id`, no se recomienda desplegar este checkpoint en producción.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría. El modelo base Qwen3.5-9B-Base sería el punto de referencia natural, pero no se han publicado métricas comparativas entre ambos. Tampoco se conocen otros checkpoints del mismo sweep con los que contrastar resultados, más allá de la indicación de que deben compararse únicamente checkpoints con el mismo estado de `eos_token_id`.

## Limitaciones y advertencias

- Defecto de empaquetado del token de fin de secuencia: falta el token `248046` (`<|im_end|>`), por lo que el modelo no termina correctamente los turnos y puede sobrepasar la ventana de contexto. Esto invalida las evaluaciones como mediciones absolutas.
- Checkpoint intermedio: no es un modelo final; forma parte de un barrido de 100 horas y su rendimiento puede estar lejos del óptimo.
- Sin licencia especificada: no se indica bajo qué términos puede utilizarse o redistribuirse el modelo.
- Sin información sobre sesgos o alucinaciones: no se documentan riesgos específicos, pero al derivar de Qwen3.5-9B-Base podría heredar sesgos del modelo base.
- No apto para producción: su naturaleza experimental y el defecto de tokenización lo desaconsejan para cualquier uso práctico.
- Discrepancia en la nomenclatura: el nombre del repositorio indica `h060` mientras que la model card menciona `h052`, lo que puede generar confusión al mapear el checkpoint en las curvas de entrenamiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/agentic-ptb/grok.h060.rl-r2e8.step_10
- Modelo base mencionado: Qwen/Qwen3.5-9B-Base (no se ha verificado su URL en la información proporcionada)
- Índice del sweep mencionado en la model card: `agentic-ptb/INDEX` (no se ha verificado su disponibilidad)
