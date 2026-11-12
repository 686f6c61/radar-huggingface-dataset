# mim-chess-vlas/train_800_dense__mask_a75__prompt_empty__pi05__seed_0

## Resumen

El modelo `train_800_dense__mask_a75__prompt_empty__pi05__seed_0` es un fine-tuning del modelo vision-lenguaje-acción π₀.₅ (Pi05) de Physical Intelligence, adaptado a la librería LeRobot de Hugging Face. Lo publica el usuario `mim-chess-vlas` como parte de un conjunto de experimentos de manipulación robótica, en este caso entrenado sobre un dataset de simulación con 637 episodios y 168.815 fotogramas a 20 FPS. El modelo consume observaciones multimodales (estado del robot de 9 dimensiones y tres cámaras de 224x224) y produce acciones de 7 dimensiones para un brazo robótico Franka Panda.

La relevancia de este checkpoint es acotada: se trata de un artefacto de investigación con cero descargas y cero likes, sin resultados de evaluación publicados, entrenado sobre un dataset específico de simulación con la tarea vacía (`""`). No es un modelo de propósito general ni un lanzamiento oficial de Physical Intelligence, sino una reproducción de un experimento concreto con semilla 0 dentro de una matriz de configuraciones (densidad de máscara al 75 %, prompt vacío).

Con 4.143.404.816 parámetros (aproximadamente 4,1 mil millones) y un repositorio de 9,4 GB en formato safetensors, el modelo está pensado para despliegue en robótica real o simulada mediante el stack LeRobot, no para inferencia de texto convencional. Su licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y la naturaleza del dataset de entrenamiento limitan seriamente su aplicabilidad fuera del contexto experimental para el que fue creado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05), implementación LeRobot |
| Parámetros totales | 4.143.404.816 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo orientado a acciones robóticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | Franka Panda |
| Entradas | `observation.state` (9,), 3 imágenes RGB (3, 224, 224): `agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2` |
| Salidas | `action` (7,) |
| Dataset de entrenamiento | mim-chess-vlas/train_800_dense__mask__overlay_a75__sim__all_cameras__live__prompt_empty |
| Episodios / fotogramas | 637 episodios / 168.815 fotogramas a 20 FPS |
| Pasos de entrenamiento | 60.000 |
| Tamaño del repositorio | 9,4 GB |
| Librería | lerobot 0.6.0 |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `lerobot/pi05_base`, la implementación en LeRobot del modelo π₀.₅ de Physical Intelligence. π₀.₅ es un modelo vision-lenguaje-acción diseñado para generalización en entornos abiertos: recibe imágenes de cámara y estado proprioceptivo del robot, y emite directamente comandos de acción de bajo nivel. La implementación de LeRobot está adaptada del repositorio OpenPI de Physical Intelligence. La información disponible no detalla la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención), por lo que no se puede confirmar si emplea un transformer estándar, un esquema de flow matching o difusión de acciones.

El entrenamiento se realizó durante 60.000 pasos con batch size 16, optimizador AdamW, learning rate 5e-05 y semilla 0, sobre un dataset de simulación con 637 episodios y 168.815 fotogramas capturados a 20 FPS. El dataset incluye tres cámaras (vista del agente y dos cámaras en la mano del robot) y una tarea vacía (`task=""`), lo que sugiere un condicionamiento por instrucción desactivado o inexistente. El nombre del checkpoint indica una densidad de máscara del 75 % (`mask_a75`) y prompt vacío (`prompt_empty`), parámetros experimentales del pipeline de entrenamiento. No se especifica la composición del dataset más allá de su origen simulado, ni si hubo RLHF, DPO u otras fases de alineamiento (poco habituales en modelos de acción robótica).

## Capacidades

- Generación de acciones robóticas de 7 dimensiones para un brazo Franka Panda a partir de observaciones visuales y de estado.
- Percepción multimodal: procesa simultáneamente tres flujos de imagen RGB de 224x224 (vista global y dos cámaras en la muñeca).
- Control visomotor de extremo a extremo (end-to-end) sin planificación explícita intermedia.
- Generalización a entornos nuevos derivada del modelo base π₀.₅, aunque no verificada para este checkpoint concreto.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No se documenta capacidad multilingüe ni modo de pensamiento (thinking mode).
- No se documenta soporte de audio ni de visión más allá de las tres cámaras especificadas.
- Compatible con el ecosistema LeRobot para rollout y reentrenamiento mediante CLI.

## Casos de uso

- Investigación en imitación robótica: punto de partida para reproducir experimentos de π₀.₅ con la configuración exacta (máscara al 75 %, prompt vacío, semilla 0) y comparar frente a otras semillas o densidades de máscara del mismo autor.
- Manipulación de objetos en simulación: el modelo está entrenado sobre datos simulados con tres cámaras, por lo que es adecuado para tareas de pick-and-place o ensamblaje en entornos tipo MuJoCo o Isaac Sim antes de transferir a hardware real.
- Evaluación de estrategias de enmascaramiento: al formar parte de una matriz de checkpoints con distintas densidades de máscara, sirve para estudiar el efecto del enmascaramiento en el aprendizaje de políticas visomotoras.
- Despliegue con LeRobot en un Franka Panda: mediante `lerobot-rollout` con `--strategy.type=base`, se puede ejecutar la política en un robot físico durante un tiempo acotado (`--duration=60`) para validar la transferencia sim-a-real.
- Baseline para fine-tuning posterior: al estar disponible en safetensors y con licencia Apache 2.0, se puede reentrenar con `lerobot-train` sobre un dataset propio de manipulación con la misma configuración de cámaras y estado.
- Docencia y formación en VLA: ejemplo práctico de pipeline completo (dataset, entrenamiento, rollout) en el ecosistema LeRobot para cursos de robótica o aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, comparativas con π₀ ni métricas de simulación o de robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 4,1 mil millones de parámetros en safetensors (9,4 GB en el repositorio, lo que sugiere pesos en fp32 o mixtos), una estimación conservadora en fp16 requeriría del orden de 8-10 GB de VRAM, pero es una estimación, no un dato del autor.
- GPU recomendadas: no disponible. Por tamaño, una RTX 4090 (24 GB) o una A100 (40/80 GB) serían suficientes para inferencia en precisión completa o media, pero no hay confirmación oficial.
- Cabe en GPU de consumo: probablemente sí en tarjetas con 16 GB o más en fp16, aunque no está verificado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que están orientados a LLM de texto y no a políticas VLA.
- Latencia y throughput: no disponibles. La frecuencia de control está condicionada por el robot y las cámaras (dataset a 20 FPS), pero no se publican métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (pi05 fine-tuned) | 4.143.404.816 | no disponible | VLA para Franka Panda | Apache 2.0 | Hugging Face, 0 descargas |
| lerobot/pi05_base | no disponible en la información | no disponible | VLA base π₀.₅ | no disponible en la información | Hugging Face (modelo base) |
| π₀ (Pi0) original de Physical Intelligence | no disponible en la información | no disponible | VLA predecesor | no disponible en la información | OpenPI / Physical Intelligence |
| Otros checkpoints del autor (mim-chess-vlas) | presumiblemente similar | no disponible | VLA con distintas semillas/máscaras | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito ni validación en robot real, por lo que no se puede afirmar que la política funcione correctamente.
- Entrenado sobre datos de simulación: la transferencia a un robot físico puede degradarse por diferencias de iluminación, texturas, dinámica y calibración de cámaras.
- Tarea vacía (`task=""`): el condicionamiento por instrucción está desactivado, de modo que el modelo no puede recibir comandos en lenguaje natural; ejecutará la política aprendida sin control por prompt.
- Configuración de hardware fija: requiere exactamente tres cámaras con los nombres `agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`, y un estado de 9 dimensiones; no es portable a otras configuraciones sin reentrenamiento.
- Riesgo de alucinación en el sentido de acciones incorrectas o inseguras: como toda política visomotora, puede producir comandos no válidos ante observaciones fuera de distribución.
- Sesgos: no documentados, pero el dataset de simulación concreto introduce sesgos de distribución (posiciones de objetos, iluminación, fondo) que limitan la generalización.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe asumir la responsabilidad de validar la seguridad de las acciones en un robot real.
- Artefacto de investigación: cero descargas y cero likes en el momento de la ficha; no hay garantía de mantenimiento ni soporte.
- Idiomas: no aplica en el sentido habitual; no se documenta interacción en lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mim-chess-vlas/train_800_dense__mask_a75__prompt_empty__pi05__seed_0
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_800_dense__mask__overlay_a75__sim__all_cameras__live__prompt_empty
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mim-chess-vlas/train_800_dense__mask__overlay_a75__sim__all_cameras__live__prompt_empty
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
