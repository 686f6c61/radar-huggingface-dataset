# RafaelJaime/act-sim-white-dart-c100

## Resumen

ACT-sim-white-dart-c100 es una política de imitación robótica basada en Action Chunking with Transformers (ACT), entrenada con LeRobot y publicada en HuggingFace por el usuario RafaelJaime en el contexto del hackathon RobotEkin. El modelo resuelve una tarea concreta de manipulación: agarrar una semilla ("grasp the seed below the gripper") con un robot SO-101 (so_follower), utilizando dos cámaras (vista superior y vista de muñeca) y el estado articular como entrada, y produciendo comandos de acción de 6 dimensiones.

La arquitectura es un transformer con decodificación por chunks de acciones, según el método descrito en el paper ACT (arXiv:2304.13705). Cuenta con 51.668.614 parámetros y un repositorio de 2,5 GB en formato safetensors. El entrenamiento se realizó sobre el dataset smartseed-sim-grasp-white-v5-dart, compuesto por 600 episodios y 176.729 frames a 30 FPS, generado en simulación (gemelo MuJoCo de SmartSeed con semilla blanca).

Su relevancia es acotada pero clara: es un ejemplo reproducible de un pipeline completo de imitation learning con LeRobot, útil para quienes trabajan en manipulación robótica simulada, evaluación de políticas ACT y despliegue en hardware SO-101. No es un modelo de lenguaje ni un modelo generativo de propósito general; es una política específica de tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con predicción de chunks de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política robótica) |
| Tipos de cuantizacion | no disponible (pesos safetensors sin cuantización publicada) |
| Idiomas soportados | no disponible (no aplica; modelo de robótica) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

Especificaciones adicionales de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| observation.state | STATE | (6,) |
| observation.images.top | VISUAL | (3, 480, 640) |
| observation.images.wrist | VISUAL | (3, 480, 640) |
| action | ACTION | (6,) |

## Arquitectura y entrenamiento

El modelo implementa ACT, un método de imitation learning que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. La política consume el estado articular de 6 dimensiones y dos imágenes RGB de 480x640 (cámaras top y wrist), y emite un vector de acción de 6 dimensiones. El repositorio incluye el checkpoint `checkpoints/020000`, señalado como el mejor en escenas de layout estrecho del gemelo MuJoCo de SmartSeed.

El entrenamiento se realizó con LeRobot 0.6.2 durante 40.000 pasos, batch size 32, optimizador AdamW, learning rate 1e-5 y semilla 1000, sobre 600 episodios y 176.729 frames a 30 FPS del dataset smartseed-sim-grasp-white-v5-dart. No se documenta en la información disponible el uso de RLHF, DPO ni otras fases de ajuste posteriores; se trata de aprendizaje por imitación supervisado a partir de datos teleoperados o simulados.

## Capacidades

- Manipulación robótica de una tarea específica: agarrar una semilla situada bajo la pinza del robot SO-101.
- Percepción visual multimodal con dos cámaras simultáneas (top y wrist) a resolución 480x640.
- Predicción de chunks de acciones de 6 dimensiones a partir del estado articular y las imágenes.
- Ejecución en bucle cerrado sobre hardware real mediante `lerobot-rollout`.
- Entrenamiento y reentrenamiento reproducibles con `lerobot-train` y el dataset asociado.
- Evaluación en simulación mediante el script `sim/eval.py` del gemelo MuJoCo de SmartSeed.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües.

## Casos de uso

- Investigación en imitation learning: sirve como referencia reproducible de una política ACT entrenada de principio a fin con LeRobot, útil para comparar hiperparámetros y configuraciones de entrenamiento en tareas de grasping.
- Despliegue en robot SO-101 real: mediante `lerobot-rollout` con `--robot.type=so_follower` y dos cámaras configuradas a 640x480 y 30 FPS, se puede ejecutar la política durante episodios de 60 segundos para validar el comportamiento en hardware.
- Evaluación en simulación: el script `sim/eval.py --layout narrow` permite medir la tasa de éxito en escenas de layout estrecho del gemelo MuJoCo, con el checkpoint 020000 como referencia (6/30 episodios con elevación superior a 3 cm).
- Generación de datos sintéticos y aumento de dataset: la política puede emplearse como baseline para comparar nuevas grabaciones teleoperadas frente al dataset smartseed-sim-grasp-white-v5-dart y detectar dominios donde falla.
- Docencia y formación en robótica: el pipeline completo (grabación, entrenamiento, rollout, evaluación) es un ejemplo didáctico de un flujo de trabajo de robótica con aprendizaje profundo.
- Prototipado de tareas de pick-and-place en laboratorio: la arquitectura de chunks de acciones facilita adaptar la política a tareas similares de agarre reentrenando con un dataset propio y la misma configuración.
- Benchmark interno de infraestructura: al ser un modelo pequeño (51,7 M de parámetros, repo de 2,5 GB), es adecuado para probar pipelines de inferencia robótica en entornos con recursos limitados.

## Benchmarks y rendimiento

La model card no incluye una tabla de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), ya que no es un modelo de lenguaje. El único dato de evaluación disponible es el siguiente:

| Evaluación | Entorno | Resultado |
|---|---|---|
| Tasa de éxito (elevar semilla > 3 cm) | Simulación MuJoCo SmartSeed, layout narrow, checkpoint 020000 | 6/30 episodios |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en safetensors (aproximadamente 200 MB en fp32), la huella de pesos es reducida y el consumo dominante proviene del procesamiento de las dos imágenes de 480x640.
- GPU recomendadas: no especificadas en la información disponible; por el tamaño del modelo, una GPU consumer moderna es suficiente, aunque no se documenta compatibilidad concreta.
- Cabe en GPU consumer: sí, por el reducido número de parámetros; no se detalla qué modelos concretos se han probado.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para reentrenamiento); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La ejecución está pensada a 30 FPS según la configuración de cámaras del dataset.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act-sim-white-dart-c100 | ACT (LeRobot) | 51.668.614 | Grasp de semilla con SO-101 en simulación | apache-2.0 | HuggingFace |
| Otras políticas ACT de LeRobot | ACT (LeRobot) | no disponible | Tareas de manipulación diversas | variable | HuggingFace |
| Políticas Diffusion Policy | Diffusion Policy | no disponible | Manipulación robótica | variable | HuggingFace / repos académicos |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada. Las alternativas citadas son categorías generales, no modelos concretos con métricas verificadas.

## Limitaciones y advertencias

- Política de tarea única: solo está entrenada para "grasp the seed below the gripper"; no generaliza a otras tareas sin reentrenamiento.
- Entrenada en simulación: el salto al mundo real (sim-to-real gap) puede degradar el rendimiento; no se documentan pruebas en robot físico.
- Sin resultados de evaluación en robot real: la model card indica explícitamente que no se han proporcionado resultados de evaluación.
- Dependencia de la configuración de cámaras: los nombres e índices de cámara deben coincidir con las claves de observación (`observation.images.top`, `observation.images.wrist`); una configuración distinta invalida la política.
- Sensibilidad al entorno: cambios de iluminación, posiciones de objetos, distractores o un robot distinto del SO-101 pueden afectar al comportamiento, según advierte la propia model card.
- Sin capacidades de lenguaje, razonamiento textual ni multilingüismo: no debe evaluarse con benchmarks de NLP.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia de los datos de entrenamiento para usos productivos.
- Repositorio con pocas descargas (14) y ningún "like": ecosistema de validación muy limitado; tratar como experimento de hackathon, no como componente de producción validado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RafaelJaime/act-sim-white-dart-c100
- Dataset de entrenamiento: https://huggingface.co/datasets/RafaelJaime/smartseed-sim-grasp-white-v5-dart
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=RafaelJaime/smartseed-sim-grasp-white-v5-dart
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
