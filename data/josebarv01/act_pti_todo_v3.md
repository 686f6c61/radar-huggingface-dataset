# Josebarv01/act_pti_todo_v3

## Resumen

`Josebarv01/act_pti_todo_v3` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), publicada en Hugging Face Hub mediante la librería LeRobot. El modelo ha sido desarrollado por el usuario Josebarv01 y está afinado a partir de la política `Josebarv01/act_pti_todo_v1`. No es un modelo de lenguaje: es un controlador visuomotor que consume el estado articular del robot y dos cámaras (superior y de muñeca) para producir comandos de acción de 6 dimensiones.

El modelo resuelve dos tareas concretas de manipulación sobre un robot de tipo `so_follower`: recoger un vaso de su soporte y, en una variante más compleja, recoger el vaso, seguir un láser y depositarlo donde el láser se apaga. Con 51.668.614 parámetros y un repositorio de 0,2 GB, es un modelo compacto pensado para inferencia en tiempo real a 30 FPS sobre hardware de consumo.

Su relevancia es acotada pero clara: es un ejemplo reproducible de entrenamiento de políticas visuomotoras con LeRobot 0.6.2 sobre un dataset propio de 123 episodios y 95.099 fotogramas, útil para desarrolladores que quieran replicar el flujo completo de imitación (grabación, entrenamiento, despliegue) o partir de una política ya afinada para su propio robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de chunks de acción |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política visuomotora; ventana de observación por fotograma, no contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors |
| Libreria | lerobot 0.6.2 |
| Tipo de robot | `so_follower` |
| Camaras | `top`, `wrist` (3×480×640 cada una) |
| Entrada de estado | `observation.state` (6,) |
| Salida de accion | `action` (6,) |
| Modelo base | `Josebarv01/act_pti_todo_v1` |
| Dataset de entrenamiento | `Josebarv01/pti_todo_v2` (123 episodios, 95.099 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 25.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice chunks de acciones (secuencias cortas de comandos) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad del control. La arquitectura combina un encoder visual (procesa las imágenes de las cámaras `top` y `wrist` a 480×640) con un transformer que fusiona la observación del estado articular de 6 dimensiones y genera un chunk de acciones de 6 dimensiones. El modelo se ha entrenado con el pipeline de LeRobot 0.6.2, con 25.000 pasos, batch size 8, AdamW y learning rate 1e-05, partiendo de la política `act_pti_todo_v1`.

El dataset `pti_todo_v2` contiene 123 episodios teleoperados a 30 FPS (95.099 fotogramas) con dos tareas: "pick up the cup from the holder" y "pick up the cup, follow the laser and place it where the laser turns off". No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de refinamiento posteriores al entrenamiento supervisado; se trata de imitación pura sobre demostraciones. Tampoco se detalla la composición exacta del dataset (variabilidad de posiciones, iluminación o distractores).

## Capacidades

- Control visuomotor de un robot `so_follower` a partir de dos cámaras RGB (superior y de muñeca) y del estado articular de 6 dimensiones.
- Predicción de chunks de acción de 6 dimensiones, orientada a control continuo a 30 FPS.
- Ejecución de la tarea "pick up the cup from the holder".
- Ejecución de la tarea "pick up the cup, follow the laser and place it where the laser turns off".
- Despliegue mediante `lerobot-rollout` con estrategia base (sin grabación de episodios).
- Reentrenamiento o fine-tuning mediante `lerobot-train` partiendo del modelo base `act_pti_todo_v1`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Replicación de un pipeline completo de imitación: usar el modelo como referencia para validar la instalación de LeRobot, la calibración del robot `so_follower` y la configuración de cámaras antes de entrenar políticas propias.
- Fine-tuning sobre un dataset propio: partir de `act_pti_todo_v1` y entrenar con `lerobot-train` sobre grabaciones nuevas para adaptar la política a objetos o posiciones distintas de las del dataset original.
- Demostración de manipulación pick-and-place en entornos controlados: la tarea de recoger el vaso del soporte sirve como caso base para evaluar la latencia y estabilidad del control a 30 FPS.
- Investigación en seguimiento visual de referencias: la tarea de seguir un láser hasta que se apaga permite estudiar cómo una política ACT integra señales visuales dinámicas en el chunk de acciones.
- Benchmark interno de políticas ACT: comparar la tasa de éxito de esta política con otras variantes afinadas sobre el mismo robot y dataset para medir el efecto de cambios en hiperparámetros o datos.
- Prototipado de automatización de laboratorio: el modelo puede integrarse en un banco de pruebas con un `so_follower` para tareas repetitivas de recogida y colocación de objetos pequeños, siempre con supervisión humana.
- Docencia y formación: ejemplo didáctico de entrenamiento por imitación con LeRobot, con configuración de entrenamiento y dataset públicos y reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, número de ensayos ni condiciones de evaluación en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors, el peso de los pesos ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo (8 GB o menos) junto con los buffers de las dos cámaras a 480×640.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 8 GB de VRAM es suficiente para inferencia; para entrenamiento con batch size 8 y dos cámaras se recomienda una RTX 3090/4090 o superior (A100/H100 para entrenamientos más largos o datasets mayores).
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4070 y superiores, dado el tamaño reducido del modelo.
- Opciones de despliegue: `lerobot-rollout` (estrategia base) y `lerobot-train` para fine-tuning; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles en la información proporcionada; el dataset y el control están definidos a 30 FPS, lo que marca el objetivo de frecuencia de control.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Josebarv01/act_pti_todo_v3` | 51.668.614 | ACT (LeRobot) | no aplica (visuomotor) | no disponible | Hugging Face Hub |
| `Josebarv01/act_pti_todo_v1` | no disponible | ACT (LeRobot) | no aplica (visuomotor) | no disponible | Hugging Face Hub (modelo base) |
| Políticas ACT de referencia en LeRobot | no disponible | ACT (LeRobot) | no aplica (visuomotor) | no disponible | Hugging Face Hub / documentación LeRobot |
| Políticas de imitación alternativas (p. ej. Diffusion Policy) | no disponible | Diffusion Policy | no aplica (visuomotor) | no disponible | Repositorios de investigación |

No se dispone de datos de rendimiento comparado (tasas de éxito, latencia) entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real de la política en robot físico.
- El modelo está entrenado para dos tareas muy específicas sobre un robot `so_follower` concreto; no generaliza a otros robots, tareas u objetos sin fine-tuning.
- El dataset de entrenamiento es reducido (123 episodios, 95.099 fotogramas) y no se documenta su variabilidad; es probable que la política sea sensible a cambios de iluminación, posición de objetos o distractores.
- Licencia no especificada ("More Information Needed"): no se puede confirmar el uso comercial sin consultar al autor.
- No se documentan sesgos, pero al ser un modelo de imitación hereda los sesgos y limitaciones de las demostraciones teleoperadas.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas o inseguras fuera de la distribución de entrenamiento.
- Requiere calibración de robot y cámaras, y que los nombres de cámara coincidan con las claves de observación (`observation.images.top`, `observation.images.wrist`).
- La ejecución con `--strategy.type=base` no graba episodios y, si se omite `--duration`, la política se ejecuta indefinidamente; debe supervisarse en todo momento.
- No soporta instrucciones en lenguaje natural: la tarea se selecciona mediante el parámetro `--task`, no mediante prompting.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Josebarv01/act_pti_todo_v3
- Modelo base: https://huggingface.co/Josebarv01/act_pti_todo_v1
- Dataset de entrenamiento: https://huggingface.co/datasets/Josebarv01/pti_todo_v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Josebarv01/pti_todo_v2
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
