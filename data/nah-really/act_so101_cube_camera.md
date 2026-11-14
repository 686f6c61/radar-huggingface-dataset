# NaH-ReAlLy/act_so101_cube_camera

## Resumen

`act_so101_cube_camera` es una política de imitación (imitation learning) entrenada con el método Action Chunking with Transformers (ACT) sobre el robot SO-101 de bajo coste. La publica el usuario NaH-ReAlLy en Hugging Face mediante la librería LeRobot de Hugging Face, y resuelve una tarea concreta de manipulación: coger un cubo y depositarlo en una papelera. No es un modelo de lenguaje: es un controlador visomotor que mapea observaciones (estado de las articulaciones más una imagen de muñeca) a comandos de acción de 6 dimensiones.

El modelo tiene 51.668.614 parámetros (unos 51,7 millones) y un tamaño de repositorio de 0,2 GB en formato safetensors. Consume `observation.state` con forma (6,) y una imagen RGB de 480x640 desde la cámara de muñeca, y emite un vector de acción de (6,). Se entrenó durante 11.808 pasos con batch de 16, optimizador AdamW y learning rate de 1e-5 sobre el dataset `shamux/so101_cube_camera` (51 episodios, 23.612 fotogramas a 30 FPS).

Su relevancia es práctica para quien trabaja con robótica de bajo coste: demuestra el flujo completo de LeRobot (grabación de datos teleoperados, entrenamiento de ACT y despliegue con `lerobot-rollout`) sobre un brazo asequible. No obstante, es un artefacto muy específico, sin evaluación publicada de tasa de éxito, con cero descargas y cero likes en el momento de redactar esta ficha, por lo que debe tratarse como referencia experimental y no como política lista para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer de imitación |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; ventana de observación por paso) |
| Tipos de cuantización | no disponible (pesos safetensors en precisión de entrenamiento; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y suaviza el control. La política combina un codificador visual para la imagen de muñeca con un transformer que integra el estado de las articulaciones y genera secuencias de acciones de 6 dimensiones. El modelo se entrenó con LeRobot 0.6.2, 11.808 pasos, batch size 16, AdamW con learning rate 1e-5 y semilla 1000, sobre 51 episodios teleoperados (23.612 fotogramas a 30 FPS) del dataset `shamux/so101_cube_camera`. La tarea única es "Pick up the cube and place it in the bin". No se documenta uso de RLHF, DPO ni aumentos de datos adicionales, ni innovaciones más allá del propio mecanismo de chunking de ACT.

## Capacidades

- Control visomotor de manipulación: genera comandos de acción de 6 dimensiones a partir de estado articular e imagen de muñeca.
- Ejecución de una tarea concreta de pick-and-place ("Pick up the cube and place it in the bin").
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin recompensa explícita.
- Predicción de chunks de acción, lo que aporta estabilidad temporal en el control.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües, de visión general o de audio.

## Casos de uso

- Reproducción de la tarea de pick-and-place en un SO-101: desplegar la política con `lerobot-rollout` sobre el brazo calibrado y la cámara de muñeca para validar el pipeline completo de LeRobot.
- Docencia y formación en imitación robótica: usar el par dataset-política como ejemplo mínimo (51 episodios) para enseñar grabación de datos, entrenamiento ACT y evaluación en robot real.
- Baseline para comparativas de políticas: servir de referencia de ACT sobre SO-101 frente a otros métodos (Diffusion Policy, VQ-BeT) en la misma tarea y dataset.
- Prototipado de automatización de bajo coste: validar la viabilidad de una celda de pick-and-place con hardware asequible antes de invertir en brazos industriales.
- Reentrenamiento y fine-tuning: partir de esta configuración (11.808 pasos, lr 1e-5, batch 16) como receta para adaptar ACT a nuevas tareas con datos propios.
- Investigación en robustez visomotora: evaluar cómo varía el éxito ante cambios de iluminación, posición del cubo o distractores, dado que la model card no reporta estas pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 millones de parámetros, el modelo cabe holgadamente en GPUs de consumo (menos de 1 GB en FP32 para los pesos, más el codificador visual y buffers).
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; una RTX 3060, RTX 4090 o incluso una GPU integrada moderna puede ejecutar la inferencia.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer actual; también es viable en CPU para pruebas.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es la vía documentada; el formato safetensors permite cargarlo con PyTorch directamente.
- Latencia y throughput: no disponibles; dependen del robot, de la cámara y del bucle de control a 30 FPS.

## Comparativa con modelos similares

| Modelo | Enfoque | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_so101_cube_camera | ACT (chunking de acciones) | 51,7 M | Pick-and-place de cubo en SO-101 | Apache 2.0 | Hugging Face (0 descargas) |
| Políticas ACT de referencia en LeRobot | ACT | ~50 M (típico) | Tareas diversas de manipulación | Apache 2.0 | Hub de LeRobot |
| Diffusion Policy | Difusión para acciones | no disponible | Manipulación multimodal | no disponible | Implementaciones públicas |
| VQ-BeT | Cuantización vectorial de comportamiento | no disponible | Manipulación | no disponible | Implementaciones públicas |

No se dispone de datos de rendimiento comparativo para esta política concreta; la comparación se limita a enfoque, tamaño y licencia.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasa de éxito ni número de ensayos, por lo que se desconoce su fiabilidad real.
- Tarea única y altamente específica: solo se entrenó para "Pick up the cube and place it in the bin" con un SO-101 y una cámara de muñeca.
- Sensible al entorno: cambios de iluminación, posición del cubo, fondo o calibración pueden degradar el comportamiento; no se documenta robustez.
- Dependencia de hardware exacto: requiere el tipo de robot `so_follower`, cámara `wrist` y las claves de observación con las que se entrenó.
- Sin capacidades de lenguaje ni de razonamiento general: no es un modelo conversacional ni un agente.
- Riesgo de sobreajuste: 51 episodios y 23.612 fotogramas son un conjunto pequeño; la generalización a variaciones no está demostrada.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar la procedencia de los datos del dataset antes de uso comercial.
- Repositorio sin tracción (0 descargas, 0 likes): tratar como artefacto experimental, no como política validada en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NaH-ReAlLy/act_so101_cube_camera
- Dataset de entrenamiento: https://huggingface.co/datasets/shamux/so101_cube_camera
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
