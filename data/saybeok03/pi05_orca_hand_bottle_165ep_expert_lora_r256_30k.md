# saybeok03/pi05_orca_hand_bottle_165ep_expert_lora_r256_30k

## Resumen

El modelo `pi05_orca_hand_bottle_165ep_expert_lora_r256_30k`, publicado por el usuario saybeok03 en Hugging Face, es un ajuste fino (fine-tuning) del modelo base `lerobot/pi05_base`. Se trata de una política Vision-Language-Action (VLA) orientada a robótica, concretamente a la tarea de manipulación "move the bottle" (mover una botella) con una mano robótica tipo Orca. El modelo se distribuye a través de la librería LeRobot y sigue el pipeline de robótica de Hugging Face.

El modelo base π₀.₅ (Pi05) es un VLA desarrollado por Physical Intelligence, diseñado para generalización en entornos abiertos y que evoluciona el modelo π₀. La implementación disponible en este repositorio es la adaptación de LeRobot, derivada del repositorio OpenPI de Physical Intelligence. Este ajuste concreto incorpora un adaptador LoRA de rango 256 (indicado en el nombre del repositorio) entrenado sobre 165 episodios de un dataset propio.

La relevancia de esta ficha es acotada: se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, entrenado para una única tarea y un único robot. No obstante, sirve como ejemplo práctico de cómo se ajusta una política VLA preentrenada mediante LoRA sobre datos de demostración propios, un flujo de trabajo cada vez más habitual en robótica de imitación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05), adaptada en LeRobot desde OpenPI |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo no genera texto libre; produce acciones) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

Datos adicionales de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | `(20,)` |
| `observation.images.bottom` | VISUAL | `(3, 480, 640)` |
| `observation.images.wrist` | VISUAL | `(3, 480, 640)` |
| `observation.images.realsense` | VISUAL | `(3, 480, 640)` |
| `action` | ACTION | `(20,)` |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del VLA π₀.₅ de Physical Intelligence, que combina percepción visual y comprensión del lenguaje con la generación de acciones motoras. La model card no detalla la arquitectura interna (número de parámetros, capas, mecanismo de atención o estrategia de fusión visión-lenguaje-acción), por lo que estos datos se consideran no disponibles. La implementación utilizada es la de LeRobot, adaptada del repositorio OpenPI.

El entrenamiento se realizó sobre el dataset `saybeok03/orca-hand-bottle`, compuesto por 165 episodios, 141 740 fotogramas a 30 FPS y una única tarea: "move the bottle". La configuración de entrenamiento reportada es: 30 000 pasos, batch size de 32, optimizador AdamW, learning rate de 0,0001, semilla 1000 y LeRobot 0.6.1. El nombre del repositorio indica el uso de un adaptador LoRA de rango 256, aunque la model card no describe explícitamente los hiperparámetros del LoRA ni la congelación del resto de pesos. No se documentan fases de RLHF o DPO, ni la composición del corpus de preentrenamiento del modelo base.

## Capacidades

- Control robótico de manipulación: genera trayectorias de acción de 20 dimensiones a partir de observaciones de estado y tres cámaras (bottom, wrist, realsense).
- Ejecución de una tarea concreta de lenguaje natural: "move the bottle", condicionada por el prompt de tarea.
- Percepción visual multivista: procesa tres flujos de imagen RGB de 480x640 a 30 FPS.
- Ajuste mediante LoRA: el adaptador permite especializar el modelo base con un coste de entrenamiento reducido.
- Integración con LeRobot: compatible con las herramientas `lerobot-rollout` y `lerobot-train`.
- No se documentan capacidades de tool calling, razonamiento multi-paso, generación de texto libre ni procesamiento de audio.

## Casos de uso

- Manipulación de botellas en laboratorio: el modelo ejecuta la tarea "move the bottle" sobre una mano robótica Orca equipada con tres cámaras, sirviendo como base para experimentos de imitación en entornos controlados.
- Replicación de experimentos de VLA: investigadores pueden reproducir el flujo de ajuste fino de π₀.₅ con LoRA sobre un dataset pequeño (165 episodios) y comparar resultados con el modelo base.
- Punto de partida para nuevas tareas: el adaptador LoRA puede reutilizarse o sustituirse para entrenar tareas de agarre y traslado similares con el mismo robot y configuración de cámaras.
- Docencia en robótica de imitación: sirve como ejemplo completo de pipeline LeRobot, desde la grabación de datos hasta el despliegue con `lerobot-rollout`.
- Evaluación de robustez ante variaciones: al ser un modelo de una sola tarea, permite medir la degradación ante cambios de iluminación, posición del objeto o distracciones, tal como sugiere la propia model card.
- Integración en bancos de pruebas de políticas VLA: útil para comparar el rendimiento de π₀.₅ ajustado frente a otras políticas (ACT, Diffusion Policy) en la misma tarea y robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,4 GB, lo que sugiere pesos en precisión reducida o un adaptador LoRA, pero no se especifica el tamaño del modelo completo ni la memoria necesaria.
- GPU recomendadas: no disponibles. La model card no indica requisitos de GPU; el comando de entrenamiento de referencia usa `--policy.device=cuda`.
- Compatibilidad con GPU de consumo: no confirmada. Dado el tamaño del repositorio (0,4 GB) es plausible que quepa en GPU de consumo, pero no hay datos oficiales.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El modelo opera a 30 FPS según la tasa del dataset, pero no se reportan métricas de latencia en el robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `saybeok03/pi05_orca_hand_bottle_165ep_expert_lora_r256_30k` | no disponible | no disponible | "move the bottle" (Orca hand) | apache-2.0 | Hugging Face, 0 descargas |
| `lerobot/pi05_base` | no disponible | no disponible | VLA generalista (base) | no disponible en la informacion | Hugging Face |
| Políticas de imitación clásicas (ACT, Diffusion Policy) | no disponible | no disponible | Manipulación por imitación | variable | LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de una sola tarea: entrenado exclusivamente para "move the bottle"; no generaliza a otras tareas sin reentrenamiento.
- Específico de un robot y una configuración de cámaras: requiere tres cámaras con los nombres `bottom`, `wrist` y `realsense`, y un estado de 20 dimensiones; no es portable a otros robots sin adaptación.
- Sin evaluación publicada: no hay tasas de éxito ni pruebas en robot real, por lo que se desconoce su fiabilidad.
- Sin datos de sesgos: al no generar texto, los sesgos típicos de los LLM no aplican directamente, pero el dataset de 165 episodios puede introducir sesgos de posición, iluminación o configuración física.
- Riesgo de sobreajuste: 30 000 pasos sobre 165 episodios con un adaptador LoRA de rango 256 puede provocar sobreajuste al entorno de grabación.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base `lerobot/pi05_base` y las dependencias de LeRobot deben verificarse por separado.
- Sin garantías de producción: cero descargas y cero likes indican que no ha sido validado por la comunidad; no se recomienda su uso en producción sin evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saybeok03/pi05_orca_hand_bottle_165ep_expert_lora_r256_30k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/saybeok03/orca-hand-bottle
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=saybeok03/orca-hand-bottle
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
