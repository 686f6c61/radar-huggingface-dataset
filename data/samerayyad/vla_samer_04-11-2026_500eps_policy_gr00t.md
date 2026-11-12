# SamerAyyad/VLA_Samer_04.11.2026_500eps_policy_GR00T

## Resumen

Este repositorio contiene una política de imitación entrenada con LeRobot sobre la arquitectura GR00T N1.7, el modelo fundacional abierto de NVIDIA para robótica humanoide y razonamiento motor generalizado. El autor, SamerAyyad, ha ajustado el modelo sobre un conjunto de datos propio de 500 episodios para una tarea concreta de manipulación: recoger una CPU con una pinza de succión y depositarla en una caja, usando un brazo UR5.

El modelo combina un backbone visual-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching, de modo que predice acciones condicionadas por visión, lenguaje y propriocepción. La política consume una imagen RGB de 480x640, un vector de estado de 7 dimensiones y produce un vector de acción de 7 dimensiones, lo que la hace directamente desplegable en el robot UR5 mediante el comando `lerobot-rollout`.

Es relevante ahora porque demuestra el flujo completo de ajuste fino de un modelo fundacional de robótica con herramientas abiertas (LeRobot 0.6.2) y licencia Apache 2.0, aunque se trata de un artefacto muy específico de una única tarea y sin resultados de evaluación publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parámetros totales | 3.144.016.000 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; las instrucciones de tarea son en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | UR5 (brazo de 6 ejes) con pinza de succión |
| Entrada visual | `observation.images.camera` (3, 480, 640) |
| Entrada de estado | `observation.state` (7,) |
| Salida de acción | `action` (7,) |
| Tamaño del repositorio | 12,6 GB |
| Librería | LeRobot 0.6.2 |

## Arquitectura y entrenamiento

La política se basa en GR00T N1.7, un modelo fundacional cross-embodiment de NVIDIA. Su diseño separa dos componentes: un backbone de razonamiento visual-lenguaje (Cosmos-Reason2/Qwen3-VL) que interpreta la escena y la instrucción en lenguaje natural, y un transformer de acciones que genera trayectorias mediante flow matching, condicionado por la representación del backbone, la observación visual y el estado proprioceptivo del robot. Esta separación permite reutilizar el conocimiento del modelo base y adaptar únicamente la cabeza de acciones a una tarea concreta.

El ajuste fino se realizó con LeRobot 0.6.2 sobre el dataset `SamerAyyad/VLA_Samer_04.11.2026_500eps`: 500 episodios, 322.402 fotogramas a 30 FPS, para la tarea "Pick up the CPU with the suction gripper and place it in the box". La configuración de entrenamiento fue de 20.000 pasos, batch size 64, optimizador AdamW, learning rate 0,0001 y semilla 42. No se especifica el número de tokens de entrenamiento del modelo base ni si hubo etapas de RLHF o DPO; esa información corresponde a la model card original de GR00T N1.7, no a este repositorio.

## Capacidades

- Predicción de acciones de manipulación robótica de 7 dimensiones (posición y orientación del efector final más apertura de pinza) a partir de una imagen RGB y el estado del robot.
- Comprensión de instrucciones en lenguaje natural para condicionar la tarea ("Pick up the CPU with the suction gripper and place it in the box").
- Ejecución de políticas de imitación en tiempo real mediante `lerobot-rollout` sobre un UR5.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- Soporte de grabación de episodios y evaluación en robot real a través de las herramientas de LeRobot.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Automatización de pick-and-place en línea de montaje: la política ejecuta la secuencia de recogida de una CPU con pinza de succión y depósito en caja sobre un UR5, replicando la tarea de los 500 episodios de entrenamiento.
- Base para ajuste fino en tareas similares: al estar construida sobre GR00T N1.7 con LeRobot, sirve como punto de partida para reentrenar con un dataset propio mediante `lerobot-train --policy.type=groot`.
- Prototipado de flujos de imitación en laboratorio: permite validar el pipeline completo (grabación, entrenamiento, rollout) con un robot UR5 y una cámara OpenCV a 30 FPS.
- Investigación en modelos fundacionales de robótica: útil para estudiar el comportamiento de GR00T N1.7 en tareas de manipulación concretas y comparar configuraciones de entrenamiento.
- Docencia y demostraciones: el comando de rollout documentado facilita reproducir la política en un UR5 calibrado con cámara y pinza de succión.
- Evaluación de robustez ante variaciones de iluminación, posición de objetos y distractores, siempre que se realice una campaña de evaluación propia, ya que el autor no la ha publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No se dispone de tasas de éxito en robot real, ni de comparaciones con otras políticas sobre la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 3.144 millones de parámetros en safetensors, una estimación orientativa en FP16 rondaría los 6-7 GB solo para pesos, más el overhead del backbone visual y del transformer de acciones; en FP32 se duplicaría. Estas cifras son estimaciones, no datos del autor.
- GPU recomendadas: no especificadas por el autor. Para entrenamiento con batch size 64 y 20.000 pasos se recomienda una GPU de datacenter (A100, H100 o similar); para inferencia en robot, una GPU consumer con suficiente VRAM podría ser viable, pero no está confirmado.
- ¿Cabe en GPU consumer? No confirmado. Por tamaño de pesos es plausible en GPUs de 16-24 GB, pero la política requiere además ejecutar el backbone Qwen3-VL, lo que eleva los requisitos.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles. La política está pensada para control a 30 FPS según el dataset de entrenamiento, pero no se confirma que alcance esa frecuencia en inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SamerAyyad/VLA_Samer_04.11.2026_500eps_policy_GR00T | 3.144 M | no disponible | Pick-and-place UR5 (CPU) | Apache 2.0 | Hugging Face, 0 descargas |
| GR00T N1.7 (NVIDIA, base) | no disponible en la información | no disponible | Modelo fundacional cross-embodiment | no disponible en la información | GitHub NVIDIA/Isaac-GR00T |
| Políticas LeRobot ACT/Diffusion (genéricas) | no disponible | no disponible | Imitación en robots de sobremesa | Apache 2.0 (LeRobot) | Hugging Face |

La comparativa con alternativas concretas no está disponible en la información proporcionada; los datos de la fila GR00T N1.7 y de las políticas ACT/Diffusion genéricas no se detallan en el material consultado.

## Limitaciones y advertencias

- Política altamente específica: entrenada únicamente para la tarea "Pick up the CPU with the suction gripper and place it in the box" con un UR5 y una cámara concreta; no se espera generalización a otras tareas, objetos o robots sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni pruebas de robustez, por lo que se desconoce su fiabilidad en producción.
- Dependencia del hardware: requiere un UR5 con pinza de succión, cámara configurada con los mismos nombres de observación (`observation.images.camera`) y calibración correcta; cualquier cambio en la configuración invalida la política.
- Sensibilidad a condiciones visuales: al depender de una única cámara RGB de 480x640, es probable que la precisión se degrade con cambios de iluminación, oclusiones o posiciones de objeto fuera de la distribución de entrenamiento.
- Idiomas: no se declaran idiomas soportados; la instrucción de tarea está en inglés y el modelo no está pensado como modelo de lenguaje general.
- Riesgo de alucinación: no aplica en el sentido habitual, pero la política puede generar trayectorias incorrectas o inseguras sin aviso; se recomienda supervisión y paradas de emergencia en el robot.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar también las condiciones del modelo base GR00T N1.7 de NVIDIA.
- Sesgos: no documentados; el dataset de 500 episodios refleja una única configuración de laboratorio, lo que puede introducir sesgos de posición, iluminación y objetos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SamerAyyad/VLA_Samer_04.11.2026_500eps_policy_GR00T
- Dataset de entrenamiento: https://huggingface.co/datasets/SamerAyyad/VLA_Samer_04.11.2026_500eps
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SamerAyyad/VLA_Samer_04.11.2026_500eps
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
