# knight7024/act_pick_and_place_tape_final_chunk100

## Resumen
El modelo `knight7024/act_pick_and_place_tape_final_chunk100` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. Lo desarrolla el usuario knight7024 y se distribuye a través de Hugging Face Hub usando la librería LeRobot. No es un modelo de lenguaje: es un controlador visomotor que, a partir del estado de las articulaciones y de dos cámaras, predice las acciones del robot para completar una tarea física concreta.

La tarea aprendida es "pick_and_place_tape": recoger un objeto y colocarlo en una ubicación objetivo. El modelo consume un vector de estado de 6 dimensiones y dos imágenes (cámara superior a 240x320 y cámara de muñeca a 480x640), y emite un vector de acción de 6 dimensiones. Su relevancia es la de un ejemplo reproducible de entrenamiento de políticas ACT en hardware asequible tipo SO-100/SO-101 (`so_follower`), con dataset y configuración de entrenamiento publicados.

El modelo tiene 51.668.614 parámetros y un repositorio de 0,2 GB en formato safetensors. Está pensado para ejecutarse en el robot con el comando `lerobot-rollout` y no incluye resultados de evaluación en su model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural como entrada operativa; la tarea se especifica con una cadena `--task`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot) |
| Tipo de robot | `so_follower` |
| Cámaras de entrada | `top` (3, 240, 320) y `wrist` (3, 480, 640) |
| Entrada de estado | `observation.state` (6,) |
| Salida de acción | `action` (6,) |
| Dataset de entrenamiento | `knight7024/pick_and_place_tape_final` (50 episodios, 16.278 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 100.000 |
| Tamaño de lote | 1 |
| Optimizador | AdamW, lr 1e-5 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.0 |

## Arquitectura y entrenamiento
ACT es un método de aprendizaje por imitación que predice trozos de acción (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y suele mejorar la tasa de éxito en tareas de manipulación. La arquitectura combina un backbone visual (codificador de imágenes de las cámaras `top` y `wrist`) con un transformer que fusiona las observaciones y genera una secuencia de acciones futuras. El modelo se entrena de forma supervisada sobre demostraciones teleoperadas, sin refuerzo ni RLHF.

El entrenamiento se realizó sobre 50 episodios y 16.278 fotogramas a 30 FPS del dataset `knight7024/pick_and_place_tape_final`, con 100.000 pasos, lote de 1, AdamW y tasa de aprendizaje 1e-5, usando LeRobot 0.6.0. La model card no detalla la composición exacta del dataset ni aumentos de datos, ni si se aplicó decodificación especulativa u otras optimizaciones de inferencia.

## Capacidades
- Control visomotor para manipulación robótica: genera acciones de 6 dimensiones a partir de estado y dos vistas de cámara.
- Aprendizaje por imitación de una tarea concreta: "pick_and_place_tape" (recoger y colocar cinta/objeto en una posición objetivo).
- Predicción de chunks de acción, lo que permite ejecutar secuencias de movimiento coherentes.
- Entrada multimodal: estado propioceptivo de 6 dimensiones más imágenes de cámara superior y de muñeca.
- Integración con el ecosistema LeRobot: entrenamiento, rollout y visualización de dataset mediante CLI.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico: es una política de control, no un modelo generativo de lenguaje.
- Capacidades multilingües: no aplica.

## Casos de uso
- Automatización de pick-and-place en laboratorio: usar el modelo con `lerobot-rollout` sobre un robot `so_follower` para recoger y colocar objetos en una posición fija, aprovechando que la política está entrenada específicamente para esa tarea.
- Prototipado de pipelines de imitación: servir como referencia reproducible para validar la cadena completa de LeRobot (grabación, entrenamiento ACT, despliegue) antes de escalar a tareas propias.
- Investigación en aprendizaje por imitación: comparar variantes de ACT, tamaños de chunk y configuraciones de entrenamiento sobre una tarea de manipulación con dataset público.
- Docencia y formación en robótica: demostrar en un robot de bajo coste cómo una política visomotora transforma observaciones en acciones sin necesidad de planificación explícita.
- Benchmark interno de hardware: medir latencia y estabilidad de inferencia de una política de 51,7 M de parámetros en GPUs de consumo o en el propio robot.
- Base para fine-tuning: reentrenar o adaptar la política a variantes de la tarea (nuevos objetos, posiciones o iluminación) partiendo de los pesos publicados y del dataset de 50 episodios.
- Validación de datos de teleoperación: usar el modelo para detectar episodios ruidosos o inconsistencias en el dataset comparando el éxito del rollout con la calidad de las demostraciones.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible en la información proporcionada; con 51,7 M de parámetros y pesos safetensors, el modelo es muy ligero y cabe holgadamente en GPUs de consumo, aunque no se especifica una cifra oficial.
- GPU recomendadas: no disponibles; LeRobot permite ejecutar en `cuda` o CPU según la configuración del comando de entrenamiento (`--policy.device=cuda`).
- GPU de consumo: previsiblemente compatible con RTX 3060/4060 y superiores por el reducido tamaño del modelo, si bien no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`), con soporte de inferencia en el robot `so_follower` y cámaras OpenCV a 30 FPS.
- Latencia y throughput: no disponibles; dependen del hardware del robot, de las cámaras y de la GPU/CPU de control.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `knight7024/act_pick_and_place_tape_final_chunk100` | 51,7 M | no aplica | pick_and_place_tape con `so_follower` | Apache 2.0 | Hugging Face Hub |
| Políticas ACT de referencia en LeRobot | no disponible | no aplica | tareas de manipulación diversas | según repositorio | Hugging Face Hub / LeRobot |
| Políticas Diffusion Policy | no disponible | no aplica | manipulación visomotora | según repositorio | Hugging Face Hub / LeRobot |
| Políticas VQ-BeT / otros métodos de imitación | no disponible | no aplica | manipulación visomotora | según repositorio | Hugging Face Hub / LeRobot |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias
- Especialización extrema: la política está entrenada solo para la tarea "pick_and_place_tape" y el robot `so_follower`; no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no se puede garantizar su fiabilidad en producción.
- Dependencia de las cámaras: los nombres y resoluciones de cámara (`top` a 240x320, `wrist` a 480x640) deben coincidir exactamente con los usados en el entrenamiento.
- Dataset pequeño: 50 episodios y 16.278 fotogramas pueden no cubrir variaciones de iluminación, posiciones de objetos o distracciones, lo que aumenta el riesgo de fallo fuera de la distribución de entrenamiento.
- Riesgo de sobreajuste y alucinación motora: al ser una política de imitación, puede reproducir movimientos incorrectos o inseguros si las demostraciones contenían ruido.
- Licencia Apache 2.0: permite uso comercial, pero no se ofrece garantía ni soporte; conviene revisar las condiciones del dataset y del robot.
- Sin soporte de lenguaje natural operativo: la tarea se pasa como cadena, pero el modelo no razona sobre instrucciones ni mantiene diálogo.
- Sin datos de sesgos, idiomas ni cuantización: no aplica o no disponible.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/knight7024/act_pick_and_place_tape_final_chunk100
- Dataset de entrenamiento: https://huggingface.co/datasets/knight7024/pick_and_place_tape_final
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=knight7024/pick_and_place_tape_final
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
