# agentic-ptb/kimi.h016.rl_sharedterm.step_40

## Resumen

Este repositorio contiene un checkpoint intermedio del experimento de aprendizaje por refuerzo (RL) `rl_sharedterm` del proyecto AgentPTB, correspondiente a la celda denominada `kimi` y al paso 40 de una corrida de 100 horas. El modelo parte de la base `Qwen/Qwen3.5-9B-Base` y ha sido sometido a un proceso de fine-tuning con RL, probablemente con el objetivo de estudiar la dinámica de entrenamiento y la evolución de capacidades a lo largo del tiempo. Con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), se trata de un modelo de tamaño medio, adecuado para experimentación en entornos con recursos limitados.

La relevancia de este checkpoint es principalmente investigadora: permite analizar cómo evoluciona el comportamiento del modelo durante el entrenamiento RL, comparando distintos pasos temporales de la misma corrida. No es un modelo final listo para producción, y de hecho la model card advierte de que le falta el token de fin de turno `<|im_end|>` (ID 248046), lo que provoca que no se detenga correctamente al final de cada turno y pueda sobrepasar la ventana de contexto. Por tanto, cualquier evaluación debe interpretarse como un límite inferior, no como una medición definitiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `Qwen/Qwen3.5-9B-Base` mediante aprendizaje por refuerzo, dentro del framework AgentPTB. La nomenclatura del repositorio (`kimi.h016.rl_sharedterm.step_40`) indica que es el checkpoint escrito a las 16 horas de una corrida de 100 horas, en el paso 40, usando la familia de entrenamiento `rl_sharedterm`. El driver empleado es `kimi-code / kimi-k3` con un esfuerzo de razonamiento `high`, lo que sugiere que el entrenamiento se centra en tareas de codificación y razonamiento complejo.

No se dispone de detalles sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. La model card menciona que el checkpoint carece del token `eos` 248046 (`<|im_end|>`), un problema conocido en checkpoints intermedios que afecta a la generación y a la evaluación. No se documentan innovaciones arquitectónicas adicionales más allá de las heredadas del modelo base.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-9B-Base, aunque no se han verificado en este checkpoint concreto.
- Codificación: el driver `kimi-code` sugiere un enfoque en tareas de programación, pero no hay evidencia empírica publicada.
- Tool calling / function calling: no documentado para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado, aunque el esfuerzo de razonamiento `high` podría implicar mejoras en este ámbito.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, etc.): no disponible.

## Casos de uso

- Investigación en dinámica de RL: este checkpoint permite estudiar cómo cambian las capacidades del modelo a lo largo del entrenamiento, comparándolo con otros pasos de la misma corrida (por ejemplo, `step_60` o `step_80`).
- Análisis de la influencia del token EOS: al carecer del token `<|im_end|>`, es útil para investigar el impacto de la terminación de secuencia en la calidad de generación y en la evaluación.
- Desarrollo de técnicas de evaluación para checkpoints intermedios: sirve como caso de estudio para metodologías que manejan modelos incompletos o con configuraciones de tokens anómalas.
- Benchmarking de infraestructura de entrenamiento RL: puede usarse para probar pipelines de inferencia y evaluación en entornos de investigación.
- Estudio de la transferencia de capacidades desde un modelo base: permite analizar qué habilidades se potencian o degradan tras el fine-tuning con RL.
- Reproducibilidad de experimentos: al ser un checkpoint público, facilita la reproducción de los resultados del sweep AgentPTB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente de que, al faltar el token EOS, cualquier métrica obtenida sería un límite inferior y no comparable directamente con otros modelos o checkpoints que sí lo incluyan.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4 mil millones de parámetros en FP16, se necesitan aproximadamente 19 GB de VRAM. Con cuantización a 8 bits, unos 10 GB; a 4 bits, unos 5 GB. No se proporcionan datos oficiales.
- GPU recomendadas: para FP16, una NVIDIA A100 (40 GB) o RTX 4090 (24 GB) son suficientes. Para cuantización 4-bit, una RTX 3090 o RTX 4070 (12 GB) podría bastar.
- Compatibilidad con GPU de consumo: sí, con cuantización adecuada (por ejemplo, GGUF o AWQ) podría ejecutarse en GPUs de 8-12 GB, aunque no se ofrecen archivos cuantizados en el repositorio.
- Opciones de despliegue: al ser un checkpoint de investigación, no se recomienda su uso en producción. Para experimentación, puede cargarse con transformers, vLLM o llama.cpp (si se convierte a GGUF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/kimi.h016.rl_sharedterm.step_40 | 9,4B | no disponible | no disponible | HuggingFace (checkpoint intermedio) |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible (típicamente 32k o 128k) | Apache 2.0 (según Qwen) | HuggingFace |
| Llama-3.1-8B | 8B | 128k | Llama 3.1 Community License | HuggingFace |

No se dispone de datos de rendimiento comparativos, ya que este checkpoint no ha sido evaluado en benchmarks estándar. La comparación se limita a parámetros y disponibilidad.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; su comportamiento puede ser inestable o incompleto.
- Token EOS ausente: el modelo no genera `<|im_end|>` al final de los turnos, lo que provoca que continúe generando hasta agotar la ventana de contexto. Esto invalida cualquier evaluación estándar y lo hace inadecuado para uso conversacional directo.
- Sin licencia especificada: no se indica bajo qué términos puede usarse o redistribuirse el modelo.
- Sin datos de entrenamiento: se desconoce la composición del dataset y las técnicas de RL aplicadas, lo que dificulta la interpretación de sus capacidades.
- Riesgo de alucinación y sesgos: al ser un modelo derivado de Qwen3.5, puede heredar sesgos del corpus original, pero no hay estudios específicos.
- No apto para producción: por su naturaleza experimental y la falta de documentación, no debe integrarse en aplicaciones reales sin un proceso de validación exhaustivo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/kimi.h016.rl_sharedterm.step_40
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Índice del proyecto AgentPTB (mencionado en la model card): `agentic-ptb/INDEX` (no se ha encontrado URL directa)
