# RoboColosseum/droid-put-marker-pen-gr00t-n1.7

## Resumen

droid-put-marker-pen-gr00t-n1.7 es una política de robótica (policy) publicada por RoboColosseum en HuggingFace Hub, entrenada sobre la arquitectura GR00T N1.7 de NVIDIA y empaquetada con la librería LeRobot. No es un modelo de lenguaje generalista, sino un controlador visomotor para un robot Franka con dos cámaras (vista izquierda y muñeca) que ejecuta una única tarea de manipulación: introducir un rotulador en un soporte. El modelo consume observaciones de estado (8 dimensiones), posición cartesiana (6 dimensiones) y dos imágenes de 360x640 píxeles, y produce un vector de acción de 8 dimensiones.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo real de despliegue de GR00T N1.7, el modelo fundacional abierto de NVIDIA para razonamiento y habilidades de robots humanoides, que combina un backbone Cosmos-Reason2/Qwen3-VL con un transformer de acciones por flow-matching. Por otro, muestra el flujo completo de LeRobot: entrenamiento de imitación sobre un dataset local de 100 episodios y 51.699 fotogramas a 30 FPS, y despliegue mediante `lerobot-rollout`.

Con 3.144.016.000 parámetros y un repositorio de 12,6 GB, el modelo está pensado para inferencia en GPU con CUDA. La licencia Apache 2.0 facilita su reutilización, aunque el alcance funcional está acotado estrictamente a la tarea y al robot para los que fue entrenado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow-matching) |
| Parámetros totales | 3.144.016.000 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; la instrucción de tarea es textual: "Put the marker into the pen holder") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |
| Tipo de robot | Franka |
| Cámaras | `left_image`, `wrist` (3x360x640 cada una) |
| Entrada de estado | `observation.state` (8,), `observation.cartesian_position` (6,) |
| Salida de acción | `action` (8,) |
| Tamaño del repositorio | 12,6 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GR00T N1.7 de NVIDIA: un backbone vision-language basado en Cosmos-Reason2/Qwen3-VL que procesa las imágenes de las cámaras y la instrucción en lenguaje natural, acoplado a un transformer de acciones entrenado con flow-matching que predice las acciones condicionadas por visión, lenguaje y propiocepción. Esta separación permite reutilizar un modelo fundacional multimodal como codificador de escena y entrenar una cabeza de acción específica para la tarea y el embodiment.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `local/droid-put-marker-pen-left-wrist`: 100 episodios, 51.699 fotogramas a 30 FPS, tarea "Put the marker into the pen holder". La configuración reportada es de 16.160 pasos, batch size 4, optimizador AdamW, learning rate 0,0001 y semilla 1000. No se documentan detalles sobre composición del dataset, aumentos de datos, número de tokens de entrenamiento ni uso de RLHF/DPO; al tratarse de aprendizaje por imitación, lo habitual es que no haya fase de alineamiento por preferencias, pero no se confirma en la información disponible.

## Capacidades

- Control visomotor para manipulación robótica: genera acciones de 8 dimensiones a partir de dos vistas de cámara y estado propioceptivo.
- Ejecución de una tarea de pick-and-place específica: introducir un rotulador en un soporte.
- Condicionamiento por instrucción en lenguaje natural (la tarea se pasa como texto al policy).
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`.
- Soporte de dos cámaras simultáneas (vista izquierda y muñeca) a 30 FPS.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general, código, matemáticas, visión general, audio ni modo thinking; el modelo está especializado exclusivamente en la política entrenada.

## Casos de uso

- Automatización de una celda de pick-and-place con Franka: el policy ejecuta la inserción del rotulador en el soporte de forma autónoma durante sesiones de hasta 60 segundos mediante `lerobot-rollout --duration=60`, útil para validar la viabilidad de una tarea de precisión antes de industrializarla.
- Generación de datos de evaluación para investigación en imitación: al ser un checkpoint reproducible (semilla 1000, hiperparámetros documentados), sirve como línea base para comparar variantes de GR00T N1.7 o de LeRobot sobre la misma tarea.
- Prototipado rápido de nuevas tareas con fine-tuning: el flujo `lerobot-train --policy.type=groot` permite reentrenar la cabeza de acción sobre un dataset propio manteniendo el backbone preentrenado, reduciendo el coste frente a entrenar desde cero.
- Benchmarking de hardware robótico: con 100 episodios y 51.699 fotogramas a 30 FPS, el modelo permite medir latencia de inferencia y estabilidad del control en distintas GPUs y configuraciones de cámara.
- Docencia y formación en robótica de imitación: el repositorio incluye comandos completos de rollout y entrenamiento, lo que lo convierte en un ejemplo práctico para cursos sobre LeRobot y modelos fundacionales de robótica.
- Investigación en generalización de políticas: al estar entrenado en un único entorno (DROID, tarea del rotulador), sirve para estudiar la degradación del rendimiento ante cambios de iluminación, posiciones de objeto o instancias de robot, tal como sugiere la propia model card en su sección de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política y deja una plantilla vacía para que el autor los rellene (tarea, ensayos, éxitos, tasa de éxito).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 3.144.016.000 parámetros, una estimación orientativa en FP16 sería de aproximadamente 6,3 GB solo para pesos, más el coste de activaciones del backbone vision-language y del transformer de acciones; en la práctica se recomienda reservar bastante más margen.
- GPU recomendadas: no especificadas por el autor. El comando de entrenamiento usa `--policy.device=cuda`, por lo que se requiere GPU NVIDIA con CUDA.
- ¿Cabe en GPU de consumo? No confirmado. Por tamaño de pesos en FP16 (unos 6,3 GB), sería teóricamente posible en GPUs con 12-16 GB o más, pero el consumo real de memoria del pipeline completo (dos cámaras a 360x640, backbone VLM y flow-matching) no está documentado.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de policy.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| droid-put-marker-pen-gr00t-n1.7 | 3.144.016.000 | no disponible | Manipulación Franka (rotulador en soporte) | Apache 2.0 | HuggingFace, 0 descargas |
| GR00T N1.7 (modelo base de NVIDIA) | no disponible en esta información | no disponible | Modelo fundacional cross-embodiment para humanoides | no disponible en esta información | GitHub NVIDIA/Isaac-GR00T |
| Otras policies LeRobot para Franka | no disponible | no disponible | Tareas de imitación diversas | variable | HuggingFace Hub |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ha sido entrenado para la tarea "Put the marker into the pen holder" con un robot Franka y dos cámaras concretas; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni resultados en robot real, por lo que se desconoce su fiabilidad en producción.
- Dependencia del entorno: cambios en iluminación, posiciones de objeto, distractores o una instancia distinta del mismo robot pueden degradar el rendimiento; la model card sugiere reportar estas condiciones en la evaluación.
- Dependencia de hardware específico: requiere un Franka con los puertos y cámaras configurados, y los nombres de cámara deben coincidir con las claves de observación (`left_image`, `wrist`).
- Dataset local: el entrenamiento referencia `local/droid-put-marker-pen-left-wrist`, un repositorio local no necesariamente accesible públicamente, lo que dificulta la reproducibilidad exacta.
- Riesgo de alucinación: en el contexto de políticas robóticas, se traduce en acciones erróneas o inseguras; se recomienda supervisión y paradas de emergencia en despliegues reales.
- Sesgos: no documentados; al entrenarse sobre un único dataset y tarea, cualquier sesgo del dataset DROID subyacente se hereda sin cuantificar.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar también las licencias del modelo base GR00T N1.7 y del backbone Qwen3-VL.
- Idiomas: no se documenta soporte multilingüe; la instrucción de tarea está en inglés.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RoboColosseum/droid-put-marker-pen-gr00t-n1.7
- Dataset de entrenamiento: https://huggingface.co/datasets/local/droid-put-marker-pen-left-wrist
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=local/droid-put-marker-pen-left-wrist
- Repositorio GR00T N1.7 de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
