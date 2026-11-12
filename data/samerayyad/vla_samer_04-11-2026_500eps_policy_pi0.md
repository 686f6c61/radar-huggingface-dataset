# SamerAyyad/VLA_Samer_04.11.2026_500eps_policy_Pi0

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo fundacional de robótica π₀ (Pi0) de Physical Intelligence, adaptado a la librería LeRobot de Hugging Face. Se trata de una política visión-lenguaje-acción (VLA) entrenada específicamente para una tarea de manipulación con un brazo robótico UR5: recoger una CPU con una ventosa y depositarla en una caja. El modelo parte de la base `lerobot/pi0_base` y se ha entrenado sobre un dataset propio de 500 episodios y 322.402 fotogramas a 30 FPS.

El modelo tiene 4.028.019.472 parámetros (aproximadamente 4.000 millones) y se distribuye en formato safetensors con un tamaño de repositorio de 8,9 GB. A diferencia de los modelos de lenguaje, este modelo no genera texto libre: consume observaciones visuales (imágenes de 3×480×640) y un vector de estado de 7 dimensiones, y produce un vector de acción de 7 dimensiones que controla el robot.

Es relevante como ejemplo práctico del flujo de trabajo de imitación en robótica con LeRobot: un desarrollador puede reproducir el entrenamiento a partir de un dataset público, desplegar la política en un UR5 real o simulado y adaptar el pipeline a otras tareas. El modelo se publicó el 12 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀ (Pi0), adaptación LeRobot del repositorio OpenPI de Physical Intelligence |
| Parametros totales | 4.028.019.472 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo consume instrucciones en lenguaje natural, pero no se especifican idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una política VLA basada en π₀ de Physical Intelligence, adaptada a LeRobot desde el repositorio OpenPI. La arquitectura combina un codificador visual y un codificador de lenguaje con un decodificador de acciones que genera comandos motores de 7 dimensiones a partir de observaciones visuales y del estado del robot. El modelo base `lerobot/pi0_base` actúa como punto de partida para el ajuste fino.

El ajuste fino se realizó sobre el dataset `SamerAyyad/VLA_Samer_04.11.2026_500eps`, compuesto por 500 episodios y 322.402 fotogramas a 30 FPS, con una única tarea: "Pick up the CPU with the suction gripper and place it in the box". La configuración de entrenamiento incluye 20.000 pasos, batch size de 32, optimizador AdamW, tasa de aprendizaje de 2,5e-05, semilla 1000 y LeRobot versión 0.6.2. No se especifican detalles sobre la composición del dataset más allá de la tarea, ni si hubo RLHF o DPO (en robótica de imitación es habitual el aprendizaje por imitación supervisado, pero no se confirma explícitamente).

## Capacidades

- Control robótico de manipulación: genera acciones de 7 dimensiones para un brazo UR5 equipado con ventosa.
- Percepción visual: procesa imágenes de cámara de 3×480×640 píxeles.
- Interpretación de instrucciones en lenguaje natural: la tarea se especifica mediante una cadena de texto ("Pick up the CPU with the suction gripper and place it in the box").
- Integración con el estado del robot: consume un vector de estado de 7 dimensiones.
- Ejecución de políticas de imitación: entrenado para reproducir la tarea demostrada en el dataset.
- Despliegue mediante LeRobot: compatible con el comando `lerobot-rollout` para ejecución en robot real.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Automatización de pick-and-place en línea de montaje: el modelo ejecuta la tarea de recoger una CPU con ventosa y colocarla en una caja, adecuado para entornos controlados donde la posición y la iluminación son similares a las del dataset de entrenamiento.
- Prototipado rápido de políticas robóticas: un equipo puede partir de este modelo y del dataset público para validar el pipeline de LeRobot antes de invertir en la recogida de datos propia.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible de un ajuste fino de π₀ con hiperparámetros documentados (20.000 pasos, batch 32, LR 2,5e-05).
- Formación y docencia en robótica: permite a estudiantes desplegar una política VLA en un UR5 real o simulado siguiendo la guía de LeRobot.
- Benchmark interno de infraestructura de inferencia robótica: al tener un tamaño de 8,9 GB y 4.000 millones de parámetros, es útil para medir latencia y throughput en GPUs de consumo o de centro de datos.
- Base para ajuste fino en tareas similares: el modelo puede reentrenarse con nuevos datasets de manipulación con ventosa para otras piezas y contenedores, reutilizando la arquitectura y el flujo de LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4.028 millones de parámetros en safetensors (8,9 GB), una estimación orientativa en FP16 sería de al menos 8-9 GB solo para pesos, más memoria para activaciones y el codificador visual; en cuantización de 8 bits podría reducirse a unos 4-5 GB, pero no se confirma compatibilidad con cuantización.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU con 16 GB o más (RTX 4090, A100, H100) es un punto de partida razonable para FP16; para GPUs de 8-12 GB habría que recurrir a cuantización, no documentada.
- ¿Cabe en GPU de consumo? Probablemente en RTX 4090 (24 GB) en FP16; en GPUs de 8 GB no hay garantía sin cuantización.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para reentrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SamerAyyad/VLA_Samer_04.11.2026_500eps_policy_Pi0 | 4.028.019.472 | no disponible | Manipulación UR5 (pick-and-place) | Apache 2.0 | Hugging Face (LeRobot) |
| lerobot/pi0_base | no disponible | no disponible | Política VLA generalista (base) | no disponible en la información | Hugging Face (LeRobot) |
| π₀ original (Physical Intelligence, OpenPI) | no disponible | no disponible | Política VLA generalista multi-robot | no disponible en la información | Repositorio OpenPI |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización estrecha: entrenado para una única tarea ("Pick up the CPU with the suction gripper and place it in the box") y un único tipo de robot (UR5 con ventosa); no es un modelo generalista listo para otras tareas sin reentrenamiento.
- Sin resultados de evaluación: el autor no ha publicado tasas de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- Dependencia de las condiciones del dataset: el rendimiento puede degradarse con cambios de iluminación, posiciones de objetos, distracciones visuales o variaciones del robot respecto a las condiciones de recogida de datos.
- Sin información sobre sesgos: no se documentan sesgos conocidos, pero al ser un modelo visual puede heredar sesgos de las imágenes de entrenamiento.
- Riesgo de alucinación motora: como política de imitación, puede generar acciones no válidas o inseguras fuera de la distribución de entrenamiento; requiere supervisión y paradas de seguridad en el robot.
- Idiomas: no se especifican los idiomas soportados para las instrucciones en lenguaje natural.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base `lerobot/pi0_base` y la tecnología π₀ subyacente pueden tener condiciones adicionales que no se detallan en la información disponible; conviene revisar las licencias del modelo base y del repositorio OpenPI antes de un despliegue comercial.
- Sin datos de cuantización ni de requisitos de hardware oficiales: la planificación de infraestructura debe hacerse con pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SamerAyyad/VLA_Samer_04.11.2026_500eps_policy_Pi0
- Dataset de entrenamiento: https://huggingface.co/datasets/SamerAyyad/VLA_Samer_04.11.2026_500eps
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Blog de π₀ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi0
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de LeRobot para π₀: https://huggingface.co/docs/lerobot/main/en/pi0
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SamerAyyad/VLA_Samer_04.11.2026_500eps
