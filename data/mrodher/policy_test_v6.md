# mrodher/policy_test_V6

## Resumen

`mrodher/policy_test_V6` es una política de imitación robótica entrenada con el método ACT (Action Chunking with Transformers) y publicada en Hugging Face Hub a través de la librería LeRobot. No es un modelo de lenguaje: es un controlador visomotor que, a partir de una observación compuesta por el estado de las articulaciones (vector de 6 dimensiones) y dos cámaras RGB de 480x640 (`top` y `wrist`), predice directamente las acciones de 6 grados de libertad del robot. El autor es el usuario `mrodher` y el modelo está pensado para el robot `so_follower` (familia SO-101 de LeRobot).

El modelo resuelve una tarea concreta de manipulación: "put the beige piece on the aruco", es decir, colocar una pieza de color beige sobre un marcador ArUco. Se entrenó con 160 episodios de teleoperación (51.822 fotogramas a 30 FPS) durante 20.000 pasos con AdamW, batch de 8 y learning rate de 1e-5. Con 51.668.614 parámetros y un repositorio de 0,2 GB, es un modelo pequeño y ligero, adecuado para inferencia en tiempo real en hardware modesto.

Su relevancia es la de un artefacto de referencia dentro del ecosistema LeRobot: ilustra el flujo completo de imitación (grabación de datos, entrenamiento con ACT, despliegue con `lerobot-rollout`) para tareas de pick-and-place. No hay resultados de evaluación publicados ni información de licencia o idiomas, por lo que debe tratarse como una política experimental, no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer de imitación visomotora |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `lerobot`) |
| Robot objetivo | `so_follower` |
| Cámaras de entrada | `top`, `wrist` (RGB, 3x480x640) |
| Estado de entrada | `observation.state`, shape `(6,)` |
| Acción de salida | `action`, shape `(6,)` |
| Tarea entrenada | "put the beige piece on the aruco" |
| Dataset de entrenamiento | `mrodher/so101_dataset_test_V6_20261110_102825` (160 episodios, 51.822 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 20.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-5 |
| Seed | 1000 |
| Versión de LeRobot | 0.6.2 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice *chunks* de acciones (secuencias cortas de acciones futuras) en lugar de un único paso, lo que reduce el error de acumulación y la varianza en tareas de manipulación. La política combina un codificador visual (procesa las dos cámaras `top` y `wrist`) con un transformer que fusiona la representación visual con el estado de las articulaciones (6 dimensiones) y emite una secuencia de acciones de 6 dimensiones. El paper de referencia es arXiv:2304.13705.

El entrenamiento se realizó con LeRobot 0.6.2 sobre 160 episodios teleoperados (51.822 fotogramas a 30 FPS) de la tarea de colocar la pieza beige sobre el ArUco, durante 20.000 pasos con AdamW, batch de 8, learning rate de 1e-5 y seed 1000. No se documenta en la información disponible si hubo aumento de datos, regularización temporal o composición adicional del dataset; tampoco se especifica el número de tokens ni esquemas de RLHF/DPO, que no aplican a este tipo de política.

## Capacidades

- Control visomotor de un robot `so_follower` para la tarea "put the beige piece on the aruco".
- Predicción de chunks de acciones de 6 grados de libertad a partir de estado articular y dos vistas RGB.
- Fusión multimodal de dos cámaras (`top` y `wrist`) con el estado del robot.
- Ejecución en tiempo real mediante `lerobot-rollout` con `--strategy.type=base`.
- Entrenamiento reproducible con `lerobot-train` y `--policy.type=act`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.
- No dispone de capacidades multilingües, visión general, audio ni modo "thinking".

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política ejecuta la secuencia de colocar la pieza beige sobre el ArUco en un robot SO-101, útil como banco de pruebas para validar hardware y calibración antes de escalar a tareas más complejas.
- Referencia para el flujo de imitación de LeRobot: sirve como ejemplo reproducible de grabación de datos, entrenamiento con ACT y despliegue con `lerobot-rollout`, adecuado para formación de nuevos usuarios del ecosistema.
- Base para *fine-tuning* en tareas similares: al ser un checkpoint ACT pequeño (51,7 M de parámetros), se puede reentrenar con un dataset propio de pocos centenares de episodios en una GPU de consumo.
- Evaluación de robustez visomotora: permite medir cómo afectan cambios de iluminación, posición de objetos o distracciones a una política de imitación entrenada en un entorno controlado.
- Pruebas de integración de hardware: valida la cadena cámara-robot-control (dos cámaras OpenCV a 640x480 y 30 FPS) en un `so_follower` real antes de invertir en datasets mayores.
- Docencia y demostraciones: por su tamaño reducido y su licencia no restrictiva declarada (aunque no especificada), es adecuado para talleres prácticos de robótica de imitación.
- Benchmark interno de latencia: sirve para medir el rendimiento de inferencia de ACT en distintas GPU y comparar con políticas más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en FP32 el peso ronda los 0,2 GB, por lo que en la práctica cabe en cualquier GPU con al menos 2-4 GB libres, incluyendo las dos cámaras y buffers.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU NVIDIA con CUDA (RTX 3060 en adelante) es suficiente. El entrenamiento se realizó con `--policy.device=cuda`.
- Cabe en GPU de consumo: sí, con amplio margen (RTX 3060, RTX 4060, RTX 4090, etc.).
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La frecuencia de control está limitada por las cámaras a 30 FPS (640x480), según la configuración del dataset.

## Comparativa con modelos similares

| Modelo | Método | Parámetros | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `mrodher/policy_test_V6` | ACT | 51.668.614 | estado (6) + 2 cámaras 480x640 | acción (6) | no disponible | Hugging Face Hub |
| Políticas ACT de referencia de LeRobot | ACT | no disponible | estado + cámaras | acción | según repositorio | Hugging Face Hub / LeRobot |
| Políticas Diffusion Policy | Diffusion Policy | no disponible | estado + cámaras | acción | según repositorio | Hugging Face Hub / LeRobot |
| Políticas VLA (p. ej. familias tipo RT/OpenVLA) | VLA | cientos de millones a miles de millones | imágenes + instrucción en lenguaje | acción | variable | Hugging Face Hub |

No se dispone de datos de rendimiento comparativo (tasas de éxito, latencia) en la información proporcionada, por lo que la comparación se limita a arquitectura, tamaño y disponibilidad.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real de la tarea "put the beige piece on the aruco".
- Entrenada para un único robot (`so_follower`) y una única tarea; no generaliza a otras tareas sin reentrenamiento.
- Requiere que los nombres y la configuración de las cámaras coincidan exactamente con los usados en el entrenamiento (`top` y `wrist`, 640x480, 30 FPS); cambios de montaje o calibración degradan el rendimiento.
- Sensible a cambios de iluminación, posición de objetos, distracciones y variaciones del entorno no presentes en los 160 episodios de entrenamiento.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Dataset pequeño (160 episodios): riesgo de sobreajuste al entorno de grabación y de comportamiento frágil ante perturbaciones.
- No procesa lenguaje natural ni instrucciones; la tarea está fijada en el entrenamiento.
- No se documentan sesgos, pero al ser una política de imitación hereda los sesgos y errores de las demostraciones teleoperadas.
- No apta para producción sin validación exhaustiva en el robot y entorno objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrodher/policy_test_V6
- Dataset de entrenamiento: https://huggingface.co/datasets/mrodher/so101_dataset_test_V6_20261110_102825
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mrodher/so101_dataset_test_V6_20261110_102825
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
