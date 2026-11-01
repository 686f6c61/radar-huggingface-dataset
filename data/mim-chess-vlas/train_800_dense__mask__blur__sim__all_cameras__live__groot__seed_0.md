# mim-chess-vlas/train_800_dense__mask__blur__sim__all_cameras__live__groot__seed_0

## Resumen

El modelo `train_800_dense__mask__blur__sim__all_cameras__live__groot__seed_0`, publicado por el usuario `mim-chess-vlas`, es una política robótica de imitación (visuomotor policy) construida sobre la arquitectura GR00T N1.7 de NVIDIA y entrenada con la librería LeRobot de Hugging Face. No es un modelo de lenguaje generalista, sino un controlador de acciones que consume observaciones multimodales (tres cámaras y el estado de las articulaciones) y produce comandos de acción de 7 dimensiones para un brazo robótico Franka Panda.

El modelo se apoya en el backbone Cosmos-Reason2/Qwen3-VL de GR00T para razonar sobre visión y lenguaje, combinado con un transformer de acciones con flow matching que predice las trayectorias condicionadas por la instrucción de tarea. Con 3.144.016.000 parámetros y un repositorio de 12,6 GB en safetensors, está pensado para ejecutar tareas de picking-and-placing sobre 40 objetos distintos en un entorno simulado, no para generación de texto ni código.

Su relevancia práctica es acotada: es un artefacto de investigación reproducible (semilla 0, 60.000 pasos, LeRobot 0.6.0) que sirve como referencia para quien quiera replicar o comparar el entrenamiento de políticas GR00T con LeRobot sobre el dataset indicado. No hay benchmarks publicados ni métricas de éxito declaradas en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parámetros totales | 3.144.016.000 |
| Parámetros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio LeRobot) |
| Tipo de robot | Franka Panda |
| Cámaras de entrada | agentview, robot0_eye_in_hand, robot0_eye_in_hand_2 |
| Dimensión de observación de estado | (9,) |
| Dimensión de acción | (7,) |
| Resolución de imagen | 224 × 224 |
| Dataset de entrenamiento | mim-chess-vlas/train_800_dense__mask__blur__sim__all_cameras__live (776 episodios, 207.203 frames, 20 FPS) |
| Pasos de entrenamiento | 60.000 |
| Batch size | 16 |
| Optimizador | AdamW |
| Learning rate | 7e-05 |
| Semilla | 0 |
| Versión de LeRobot | 0.6.0 |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de GR00T N1.7: un backbone de razonamiento visual-lingüístico basado en Cosmos-Reason2/Qwen3-VL que procesa las tres vistas de cámara y la instrucción de tarea, y un transformer de acciones con flow matching que genera la secuencia de acciones de 7 dimensiones condicionada por las representaciones del backbone y el estado propioceptivo de 9 dimensiones. Este esquema de flow matching sustituye a la regresión directa típica en políticas de imitación y permite modelar distribuciones multimodales de trayectorias.

El entrenamiento se realizó con LeRobot 0.6.0 durante 60.000 pasos, batch de 16, AdamW y learning rate 7e-05, con semilla 0. El dataset contiene 776 episodios y 207.203 frames a 20 FPS, con 40 instrucciones de tarea del tipo "Pick the <objeto> and place it into the box", en un entorno simulado (el nombre del dataset incluye `sim`, `mask`, `blur` y `all_cameras`, lo que sugiere aumento de datos con enmascarado y desenfoque). No se especifica el número total de tokens ni si hubo RLHF o DPO; al tratarse de aprendizaje por imitación, no se espera un ajuste por preferencias.

## Capacidades

- Control visuomotor de un brazo Franka Panda a partir de tres cámaras y el estado de las articulaciones.
- Ejecución de instrucciones de lenguaje natural en inglés para tareas de picking-and-placing sobre 40 objetos (jam, cereal, pear, sweet potato, scone, etc.).
- Percepción multivista con una cámara de agente y dos cámaras en la muñeca del robot.
- Generalización cross-embodiment declarada por GR00T N1.7 en su model card original, aunque esta instancia concreta está entrenada y validada para Panda.
- No soporta tool calling, function calling, agentes multi-paso ni generación de texto libre: es una política de acción, no un LLM de propósito general.
- Capacidades multilingües: no disponibles; las tareas del dataset están en inglés.
- No dispone de modo thinking, visión general, audio ni otras capacidades de los modelos fundacionales de lenguaje.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible (semilla 0, hiperparámetros documentados) para estudiar el efecto del enmascarado y desenfoque de datos en políticas GR00T.
- Automatización de picking-and-placing en simulación: el modelo puede ejecutar las 40 tareas del dataset sobre un Panda simulado, útil para generar datos sintéticos o validar pipelines antes de pasar a hardware real.
- Evaluación comparativa de políticas: al estar entrenado con LeRobot 0.6.0 y GR00T N1.7, permite comparar configuraciones de backbone y de transformer de acciones bajo un mismo protocolo.
- Prototipado de manipulación con cámaras en muñeca: las dos vistas `robot0_eye_in_hand` permiten estudiar el impacto de la percepción egocéntrica en tareas de agarre fino.
- Docencia y demostraciones de robótica basada en aprendizaje: el comando `lerobot-rollout` documentado facilita reproducir la política en un Panda real o simulado con una sola línea de CLI.
- Base para fine-tuning en dominios específicos: al ser apache-2.0 y formato safetensors, se puede reentrenar sobre datasets propios de manipulación con la misma receta de LeRobot.
- Generación de trayectorias condicionadas por lenguaje: útil para estudiar cómo el backbone Qwen3-VL interpreta instrucciones cortas de objeto y las traduce en acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de simulación ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 3.144.016.000 parámetros, en fp16 se requieren aproximadamente 6,3 GB solo para pesos, más memoria para activaciones y las tres cámaras a 224 × 224, por lo que se estima un mínimo práctico de 12-16 GB en GPU.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090 (24 GB), L40S (48 GB), A100 (40/80 GB) o H100 son opciones razonables para inferencia y entrenamiento respectivamente.
- Cabe en GPU de consumo: probablemente sí en RTX 4090 y RTX 3090 (24 GB) para inferencia; en tarjetas de 8-12 GB requeriría cuantización, que no está documentada.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path`), tal como indica la model card; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política de acciones.
- Latencia y throughput: no disponibles. El dataset se grabó a 20 FPS, lo que sugiere que el bucle de control opera en ese orden de magnitud, pero no se declara el rendimiento real del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (GR00T N1.7 + LeRobot, seed 0) | 3.144.016.000 | no disponible | sin benchmarks publicados | apache-2.0 | Hugging Face |
| GR00T N1.7 base (NVIDIA) | no disponible en la información | no disponible | no disponible | no disponible en la información | GitHub NVIDIA/Isaac-GR00T |
| Otras políticas LeRobot del mismo autor | no disponible | no disponible | no disponible | apache-2.0 (presumible) | Hugging Face (mim-chess-vlas) |

No se dispone de datos suficientes para comparar numéricamente con alternativas como π0, OpenVLA o RT-2, por lo que la comparación cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación: el nombre del dataset incluye `sim`, por lo que la transferencia a un robot físico no está validada y puede requerir ajuste de dominio.
- Dominio muy restringido: 40 tareas de picking-and-placing con instrucciones en inglés; no generaliza a otras tareas de manipulación sin reentrenamiento.
- Sin métricas de éxito publicadas: no se puede afirmar su fiabilidad en producción.
- Dependencia de la configuración exacta de cámaras (agentview, robot0_eye_in_hand, robot0_eye_in_hand_2) y del robot Panda; cambiar la disposición o el tipo de robot invalida la política.
- Riesgo de alucinación de acciones: como toda política de imitación, puede generar trayectorias plausibles pero incorrectas fuera de la distribución de entrenamiento.
- Sesgos: no documentados; el dataset cubre un conjunto concreto de objetos domésticos, lo que puede introducir sesgo hacia esas categorías y materiales.
- Licencia apache-2.0 permite uso comercial, pero el modelo depende de componentes de GR00T N1.7 y Qwen3-VL cuyas licencias deben verificarse por separado antes de un despliegue comercial.
- Sin información sobre cuantización, latencia ni consumo energético, lo que dificulta planificar un despliegue en hardware embebido.
- El repositorio tiene 23 descargas y 0 likes, señal de que es un artefacto de investigación reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mim-chess-vlas/train_800_dense__mask__blur__sim__all_cameras__live__groot__seed_0
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_800_dense__mask__blur__sim__all_cameras__live
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mim-chess-vlas/train_800_dense__mask__blur__sim__all_cameras__live
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
