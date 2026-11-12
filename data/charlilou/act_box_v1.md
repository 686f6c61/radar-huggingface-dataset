# charlilou/act_box_v1

## Resumen

`charlilou/act_box_v1` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación que predice fragmentos de acciones (action chunks) en lugar de pasos individuales. El modelo lo publica el usuario charlilou en Hugging Face y está pensado para controlar un robot físico del tipo `so_follower` (variante del SO-101) equipado con dos cámaras: una cenital (`top`) y otra en la muñeca (`wrist`). La tarea concreta para la que se ha entrenado es "Put the red box in the green zone" (colocar la caja roja en la zona verde).

El modelo es un transformer de ~51,7 millones de parámetros que consume el estado del robot (vector de 6 dimensiones) y dos imágenes RGB de 480×640, y produce un vector de acción de 6 dimensiones. Se ha entrenado desde cero mediante teleoperación con 30 episodios y 10.248 fotogramas a 30 FPS, durante 6.000 pasos con AdamW y un learning rate de 1e-5. Está empaquetado en formato safetensors y es compatible con la librería LeRobot 0.7.1.

La relevancia de esta ficha es acotada: no es un modelo de lenguaje ni un modelo fundacional generalista, sino una política robótica específica de una tarea, publicada como artefacto reproducible de un pipeline de imitación. Resulta útil como ejemplo práctico de entrenamiento end-to-end con LeRobot y como referencia para replicar el flujo de trabajo en robots de bajo coste tipo SO-101.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ACT (Action Chunking with Transformers), aprendizaje por imitación |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; ventana de observación definida por la política) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors |
| Librería | lerobot 0.7.1 |
| Pipeline | robotics |
| Tipo de robot | so_follower |
| Cámaras | top, wrist |
| Entrada `observation.state` | STATE, shape (6,) |
| Entrada `observation.images.top` | VISUAL, shape (3, 480, 640) |
| Entrada `observation.images.wrist` | VISUAL, shape (3, 480, 640) |
| Salida `action` | ACTION, shape (6,) |
| Dataset de entrenamiento | charlilou/so101_box_v1_20261112_161751 |
| Episodios | 30 |
| Fotogramas | 10.248 |
| Frame rate | 30 FPS |
| Pasos de entrenamiento | 6.000 |
| Batch size | 16 |
| Optimizador | AdamW |
| Learning rate | 1e-5 |
| Semilla | 1000 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La política procesa observaciones multimodales (estado propioceptivo del robot más dos flujos de imagen) y predice un *chunk* de acciones consecutivas en lugar de una única acción por paso. Este diseño reduce el error de acumulación típico de las políticas paso a paso y facilita el control fino en tareas de manipulación. La arquitectura es un transformer con codificador visual y un decodificador de acciones; la model card no detalla el número de capas, cabezas ni dimensión de los embeddings.

El entrenamiento se realizó exclusivamente con datos de teleoperación recogidos sobre el robot `so_follower` para la tarea "Put the red box in the green zone". El dataset consta de 30 episodios y 10.248 fotogramas a 30 FPS, lo que equivale aproximadamente a 5,7 minutos de demostraciones. Se entrenaron 6.000 pasos con batch size 16 (unas 96.000 muestras procesadas), optimizador AdamW, learning rate 1e-5 y semilla 1000, usando LeRobot 0.7.1. No se menciona en la información disponible el uso de RLHF, DPO ni ningún proceso de refinamiento posterior; es aprendizaje supervisado puro sobre demostraciones. Tampoco se documentan innovaciones adicionales más allá del propio esquema de *action chunking* del método ACT.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para el robot `so_follower`.
- Percepción visual multimodal: procesa dos cámaras simultáneas (cenital y de muñeca) a 480×640.
- Fusión estado-imagen: combina el estado propioceptivo del robot (6 valores) con las observaciones visuales.
- Predicción de *action chunks*: emite secuencias cortas de acciones que reducen el error acumulado.
- Aprendizaje por imitación específico de tarea: reproduce la política aprendida para "Put the red box in the green zone".
- Integración con el ecosistema LeRobot: ejecutable mediante `lerobot-rollout` y reentrenable con `lerobot-train`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, código ni capacidades multilingües; estas capacidades no aplican a un modelo de robótica.

## Casos de uso

- Manipulación de objetos en laboratorio: el modelo ejecuta la tarea de recoger una caja roja y depositarla en una zona verde, útil como banco de pruebas para validar el pipeline de imitación con SO-101.
- Reproducción de experimentos de ACT: sirve como referencia reproducible para comparar resultados con otras políticas entrenadas con el mismo método y dataset.
- Base para *fine-tuning* en tareas de pick-and-place: al ser un modelo pequeño (51,7 M de parámetros), se puede reentrenar con nuevos datasets de teleoperación en una GPU de consumo.
- Demostración educativa de LeRobot: ejemplo end-to-end de grabación de datos, entrenamiento y despliegue con `lerobot-rollout`, adecuado para cursos y talleres de robótica.
- Evaluación de hardware SO-101: permite verificar la calibración de cámaras y articulaciones comprobando si la política reproduce la tarea con el robot físico.
- Prototipado de automatización de bajo coste: al ejecutarse en un robot de tipo seguidor con dos cámaras USB, sirve para validar casos de clasificación y colocación de objetos en entornos controlados.
- Generación de datos sintéticos de evaluación: sus rollouts pueden usarse para estudiar la robustez del control ante cambios de iluminación o posición de objetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación vacía y afirma explícitamente: "No evaluation results have been provided for this policy yet". No se dispone de tasas de éxito, métricas de error de acción ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 51,7 M de parámetros en safetensors, los pesos ocupan aproximadamente 200 MB en precisión nativa (FP32); en FP16 o BF16 se reduce a unos 100 MB. La VRAM total dependerá del codificador visual y del *runtime* de LeRobot, no solo del tamaño de los pesos.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente para la inferencia; una RTX 3060, RTX 4060 o superior cubre holgadamente el modelo. No se requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con al menos 2-4 GB de VRAM libre; también puede ejecutarse en CPU para pruebas, aunque con mayor latencia.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--policy.path=charlilou/act_box_v1`; también es posible cargar la política mediante la API de Python de LeRobot. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La política está pensada para ejecutarse en bucle cerrado a 30 FPS sobre el robot, pero no se publican mediciones de latencia por paso ni de throughput en GPU.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa numérica con otras políticas ACT o modelos de robótica similares (por ejemplo, Diffusion Policy, π0 o RT-2). La model card no incluye comparaciones ni referencias a otros checkpoints. Se indica "no disponible" para cualquier comparación de rendimiento.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| charlilou/act_box_v1 | 51,7 M | no disponible | no disponible | Hugging Face |
| Otras políticas ACT | no disponible | no disponible | no disponible | no disponible |
| Diffusion Policy | no disponible | no disponible | no disponible | no disponible |
| π0 / RT-2 | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no especificada: la model card indica "More Information Needed", por lo que no se puede garantizar el uso comercial. Es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Tarea única y cerrada: el modelo solo ha aprendido "Put the red box in the green zone" con el robot `so_follower` y las cámaras `top` y `wrist`. No generaliza a otras tareas, objetos ni configuraciones de cámara.
- Dataset muy reducido: 30 episodios y 10.248 fotogramas implican un riesgo elevado de sobreajuste y baja robustez ante cambios de iluminación, posición de objetos o distracciones.
- Sin evaluación publicada: no hay tasas de éxito ni validación en robot real, por lo que el rendimiento real es desconocido.
- Dependencia hardware específica: asume el robot `so_follower` con estado de 6 dimensiones y dos cámaras concretas; cambios en la morfología o en la calibración invalidan la política.
- Sin capacidades lingüísticas ni de razonamiento: no es un modelo de lenguaje, por lo que no admite prompts textuales, tool calling ni agentes.
- Riesgo de fallos silenciosos: al ser una política de imitación, puede ejecutar acciones incorrectas sin señal de error explícita; se recomienda supervisión humana y límites de seguridad en el robot.
- Sin información sobre sesgos: no se documentan sesgos de comportamiento, pero el reducido conjunto de demostraciones puede inducir políticas frágiles ante variaciones del entorno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/charlilou/act_box_v1
- Dataset de entrenamiento: https://huggingface.co/datasets/charlilou/so101_box_v1_20261112_161751
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=charlilou/so101_box_v1_20261112_161751
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
