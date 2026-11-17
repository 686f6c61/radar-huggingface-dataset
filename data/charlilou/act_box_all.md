# charlilou/act_box_all

## Resumen

`charlilou/act_box_all` es una política de imitación para robótica basada en Action Chunking with Transformers (ACT), el método presentado en el paper arXiv:2304.13705. No es un modelo de lenguaje: es un controlador visomotor entrenado con 105 episodios de teleoperación (39.140 frames a 30 FPS) sobre un robot `so_follower` del ecosistema SO-101, con dos cámaras (vista superior y muñeca) como entrada y un vector de 6 dimensiones de acciones como salida.

El modelo resuelve una tarea concreta de manipulación: colocar un cubo rojo o una caja roja en una zona verde. Predice *chunks* de acciones (secuencias cortas) en lugar de pasos individuales, lo que reduce el error de acumulación y estabiliza el control. Está empaquetado en formato LeRobot 0.7.1 y se ejecuta con `lerobot-rollout`.

Su relevancia es práctica: sirve como referencia reproducible de un pipeline completo de imitation learning (grabación, entrenamiento, despliegue) en hardware de bajo coste, y como punto de partida para quien quiera adaptar ACT a su propio robot SO-101. El repo pesa 0,2 GB y el checkpoint tiene 51.668.614 parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada fija por observación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; las tareas se especifican en inglés) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors (librería lerobot) |
| Tipo de robot | `so_follower` (SO-101) |
| Entradas | `observation.state` (6,), `observation.images.top` (3, 480, 640), `observation.images.wrist` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tareas entrenadas | "Put the red cube 3", "Put the red cube", "Put the red box in the green zone" |
| Dataset de entrenamiento | `charlilou/so101_box_all_v1` (105 episodios, 39.140 frames, 30 FPS) |
| Pasos de entrenamiento | 19.000 |
| Batch size | 16 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Seed | 1000 |
| Versión de LeRobot | 0.7.1 |
| Tamaño del repo | 0,2 GB |

## Arquitectura y entrenamiento

ACT combina un backbone visual (encoder de imágenes para las cámaras `top` y `wrist`) con un transformer que mapea la observación multimodal (estado articular de 6 dimensiones + dos imágenes RGB de 480×640) a un *chunk* de acciones futuras. La predicción por chunks, en lugar de paso a paso, es la innovación central del método: reduce el horizonte efectivo de decisión y mitiga el error compounding típico de las políticas de imitación. El estado se representa como vector de 6 dimensiones, coherente con un brazo SO-101 de 6 grados de libertad.

El entrenamiento es puramente de imitación supervisada sobre 105 episodios teleoperados (39.140 frames a 30 FPS, aproximadamente 21,7 minutos de datos agregados) distribuidos en tres variantes de la misma tarea de pick-and-place. Se usaron 19.000 pasos con batch 16, AdamW y learning rate 1e-05, semilla 1000, sobre LeRobot 0.7.1. No se documenta uso de RLHF, DPO ni aumento de datos; tampoco se especifica la composición exacta del dataset más allá del número de episodios y frames.

## Capacidades

- Control visomotor de un brazo SO-101 (`so_follower`) a partir de dos cámaras RGB y el estado articular.
- Predicción de chunks de acciones de 6 dimensiones para tareas de pick-and-place.
- Ejecución de tres tareas nombradas: "Put the red cube 3", "Put the red cube" y "Put the red box in the green zone".
- Integración nativa con el ecosistema LeRobot: `lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No tiene modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- **Automatización de pick-and-place en laboratorio**: el modelo ejecuta la tarea de colocar el cubo rojo en la zona verde sobre un SO-101 real, útil como banco de pruebas de pipelines de imitación antes de escalar a tareas más complejas.
- **Reproducción de resultados de ACT**: al estar empaquetado con LeRobot 0.7.1 y configuración de entrenamiento documentada, permite reproducir el entrenamiento y comparar con la política publicada.
- **Base para fine-tuning en tareas similares**: partiendo de este checkpoint, se puede reentrenar con `lerobot-train` sobre un dataset propio de manipulación con el mismo robot y cámaras, reduciendo el coste frente a entrenar desde cero.
- **Docencia y formación en imitation learning**: sirve como ejemplo end-to-end (grabación, entrenamiento, rollout) para cursos de robótica con hardware de bajo coste.
- **Validación de hardware y calibración**: ejecutar la política sobre un SO-101 permite detectar problemas de calibración, latencia de cámaras o desalineación de la pinza comparando el comportamiento esperado con el observado.
- **Benchmark interno de infraestructura de inferencia**: al ser un modelo pequeño (51,7 M parámetros, 0,2 GB), es útil para medir latencia de `lerobot-rollout` y throughput de cámaras en un equipo antes de desplegar políticas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito, número de ensayos ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M parámetros en precisión completa (fp32) el checkpoint ocupa aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con al menos 2 GB de VRAM, incluyendo las cámaras y buffers.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU NVIDIA con soporte CUDA es suficiente (GTX 1650 en adelante). El cuello de botella real es la captura de dos cámaras OpenCV a 640×480 y 30 FPS, no el modelo.
- Cabe en GPU consumer: sí, con amplio margen.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial) con estrategia `base`; el ecosistema LeRobot soporta también `lerobot-train` para reentrenamiento en CUDA.
- Latencia y throughput: no disponibles. La política está pensada para operar a 30 FPS, sincronizada con la frecuencia de captura del dataset.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `charlilou/act_box_all` | 51,7 M | no aplica | sin evaluación publicada | no disponible | Hugging Face (LeRobot) |
| ACT original (paper arXiv:2304.13705) | no disponible | no aplica | tasas de éxito reportadas en el paper para tareas propias | código abierto (repositorio del paper) | paper + código |
| Políticas LeRobot `diffusion` | no disponible | no aplica | no disponible | según repo LeRobot | Hugging Face (LeRobot) |
| Políticas LeRobot `smolvla` | no disponible | no aplica | no disponible | según repo LeRobot | Hugging Face (LeRobot) |

No se dispone de datos de benchmarks comparables para este checkpoint concreto; la comparación se limita a categoría y disponibilidad.

## Limitaciones y advertencias

- **Sin evaluación publicada**: no hay tasas de éxito ni número de ensayos, por lo que el rendimiento real en un robot distinto al del autor es desconocido.
- **Sobreajuste al setup del autor**: entrenado con un `so_follower` concreto y dos cámaras con nombres `top` y `wrist`; cambios de montaje, iluminación, fondo o posición de cámara pueden degradar el comportamiento.
- **Alcance muy limitado**: solo tres tareas de pick-and-place con objetos y colores específicos (cubo rojo, caja roja, zona verde). No generaliza a otras tareas sin reentrenamiento.
- **Licencia no disponible**: la model card indica "More Information Needed"; no se puede asumir uso comercial sin consultar al autor.
- **Riesgo de alucinación**: no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de acciones erróneas o inseguras en el robot ante observaciones fuera de distribución.
- **Datos escasos**: 105 episodios y 39.140 frames son un volumen reducido; la robustez ante variaciones es limitada.
- **Sin cuantizaciones documentadas**: no se especifican formatos GGUF u otros; el despliegue está atado al stack LeRobot.
- **Idioma**: las tareas se especifican en inglés mediante el parámetro `--task`; no hay soporte multilingüe documentado.
- **Fecha de creación futura**: el repo figura creado el 2026-11-17, dato a verificar antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/charlilou/act_box_all
- Dataset de entrenamiento: https://huggingface.co/datasets/charlilou/so101_box_all_v1
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=charlilou/so101_box_all_v1
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
