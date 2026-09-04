# PID0930/groot-n1d7-openarm-bottle-sort-ckpt15000

## Resumen

`PID0930/groot-n1d7-openarm-bottle-sort-ckpt15000` es un checkpoint de post-entrenamiento del modelo de robótica `nvidia/GR00T-N1.7-3B`, publicado por el usuario PID0930. El modelo está afinado para una tarea concreta de manipulación bimanual en el entorno OpenArm: colocar las dos botellas de la izquierda en el cuenco izquierdo y las dos de la derecha en el cuenco derecho, siguiendo una instrucción en lenguaje natural.

Se trata de un modelo de tipo Vision-Language-Action (VLA) con aproximadamente 3.144 millones de parámetros. La arquitectura combina el backbone VLM congelado `nvidia/Cosmos-Reason2-2B` con un projector y una cabeza de acciones basada en flow-matching DiT, que se entrenan de forma específica para el robot bimanual. Este checkpoint corresponde al paso 15.000 de una ejecución de 20.000 pasos, con una pérdida de entrenamiento de 0.0282. Es relevante para la comunidad de robótica porque permite comparar políticas VLA en condiciones normalizadas (OpenArm Cell) y estudiar el efecto del congelamiento del backbone en tareas de manipulación bimanual.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con backbone VLM `nvidia/Cosmos-Reason2-2B` congelado y action head de flow-matching DiT |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `nvidia/GR00T-N1.7-3B`, que a su vez emplea el backbone VLM `nvidia/Cosmos-Reason2-2B`. Durante el post-entrenamiento, el backbone visual-lingüístico permanece congelado; solo se actualizan el projector y la cabeza de acciones de tipo flow-matching DiT. Esta configuración se consigue desactivando las opciones `--tune-llm` y `--tune-visual`.

El entrenamiento se realizó sobre un dataset de manipulación bimanual con 600 episodios y 224.608 fotogramas a 30 fps, todos pertenecientes a una única tarea con una disposición de escena fija. La representación de acciones es específica: los brazos se controlan en modo RELATIVE, las manos en modo ABSOLUTE, y ambos sin considerar el end-effector (NON_EEF). El horizonte de acciones es de 16 pasos a 30 fps, lo que equivale aproximadamente a 0.53 segundos. Se usó AdamW con tasa de aprendizaje 1e-4, decaimiento coseno, warmup del 5% y weight decay 1e-5, con un batch size global de 32 en una GPU A100 80GB en precisión bf16. No se realizó RLHF ni DPO; el proceso es de fine-tuning supervisado estándar. El checkpoint incluye el estado completo de entrenamiento (incluido `optimizer.pt`), lo que permite reanudar el proceso.

## Capacidades

- Generación de secuencias de acciones robóticas de 16 pasos para manipulación bimanual con dos brazos y dos manos.
- Seguimiento de instrucciones en lenguaje natural mediante la clave `annotation.human.action.task_description`.
- Percepción visual multi-cámara: el modelo recibe imágenes de `chest_view`, `left_wrist_view` y `right_wrist_view` a 480x640.
- Ejecución de acciones con horizonte temporal de 0.53 segundos, adecuado para control en tiempo real a 30 fps.
- Representación de acciones diferencial: brazos RELATIVE, manos ABSOLUTE, ambas NON_EEF.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni modo thinking.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Evaluación en bucle abierto de políticas robóticas: el modelo permite comparar el rendimiento de distintos checkpoints de una misma ejecución de entrenamiento mediante el script `open_loop_eval.py` de Isaac-GR00T, usando un dataset held-out y el tag `NEW_EMBODIMENT`.

- Investigación en manipulación bimanual: sirve como baseline para estudiar la tarea de ordenar botellas con dos brazos, analizando cómo influye el congelamiento del backbone en el aprendizaje de habilidades motoras bimanuales.

- Desarrollo de sistemas de aprendizaje por imitación: al incluir el estado completo del entrenamiento, el checkpoint puede usarse para reanudar el fine-tuning con nuevos episodios de la misma tarea o para transferir el conocimiento a tareas similares mediante continuar el entrenamiento con un dataset extendido.

- Benchmarking reproducible en OpenArm Cell: el modelo está afinado para el entorno OpenArm, que estandariza fondo, iluminación, cámaras y posición de brazos, lo que permite obtener comparativas justas y verificables entre modelos de IA robótica bajo condiciones idénticas.

- Enseñanza y prototipado en robótica: el modelo puede ejecutarse en el framework Isaac-GR00T para generar trayectorias de acción sobre un robot simulado o real que siga el embodiment OpenArm, facilitando el desarrollo de demostraciones de manipulación bimanual.

- Investigación sobre la relación entre pérdida de entrenamiento y generalización: al existir varios checkpoints (5k, 10k, 15k, 20k) de la misma ejecución, este modelo puede usarse para estudiar si una menor training loss se traduce en mejor rendimiento de generalización, aunque la model card advierte que no hay métricas de validación disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los checkpoints no han sido evaluados con ninguna métrica de validación, y que la pérdida mostrada es únicamente de entrenamiento. Por tanto, no se dispone de datos de rendimiento como MMLU, HumanEval o GSM8K, ni de tasas de éxito en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8-12 GB en bf16, calculado a partir de los 3.144 millones de parámetros y las activaciones de procesamiento de tres cámaras. No hay medición publicada del autor.
- GPU recomendada: para entrenamiento se usó una A100 80GB PCIe; para inferencia, una RTX 4090 (24 GB) o superior debería ser suficiente.
- Sí cabe en GPUs de consumo: una RTX 4090 o una RTX A6000 (48 GB) pueden ejecutar el modelo con margen para las imágenes de entrada.
- Opciones de despliegue: requiere el framework [Isaac-GR00T](https://github.com/NVIDIA/Isaac-GR00T) en la rama `gr00t_n1d7`, y acceso al backbone gated `nvidia/Cosmos-Reason2-2B`. No se ha probado con vLLM, llama.cpp ni Ollama, que no son aplicables a este tipo de modelo con action head específico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparación se limita a los checkpoints de la misma ejecución, ya que no se dispone de datos de otros modelos VLA comparables (por ejemplo, OpenVLA o RT-2) en la información proporcionada. Los parámetros son idénticos en todos ellos, y la pérdida indicada es de entrenamiento, no de validación.

| Modelo | Parametros | Training loss | Estado |
|---|---|---|---|
| `PID0930/groot-n1d7-openarm-bottle-sort-ckpt5000` | 3.144.016.000 | 0.0636 | Checkpoint 5.000 |
| `PID0930/groot-n1d7-openarm-bottle-sort-ckpt10000` | 3.144.016.000 | 0.0440 | Checkpoint 10.000 |
| `PID0930/groot-n1d7-openarm-bottle-sort-ckpt15000` | 3.144.016.000 | 0.0282 | Checkpoint 15.000 |
| `PID0930/groot-n1d7-openarm-bottle-sort-ckpt20000` | 3.144.016.000 | 0.0229 | Checkpoint 20.000 |
| `nvidia/GR00T-N1.7-3B` (base) | 3.144.016.000 | no aplica | Modelo fundacional |

Es importante señalar que una menor training loss no implica necesariamente mejor generalización, tal como advierte el autor en la model card.

## Limitaciones y advertencias

- El modelo se ha entrenado para una única tarea con una disposición de escena fija; la robustez ante cambios de layout, iluminación u objetos no ha sido probada.
- No se ha medido ninguna métrica de validación ni tasa de éxito en robot real. El checkpoint debe tratarse como un artefacto de investigación.
- Los episodios del dataset son inusualmente uniformes (357-386 fotogramas, 11.9-12.9 segundos), lo que puede limitar la capacidad de generalización.
- El backbone congelado implica que las características visuales no se adaptaron a las cámaras específicas del robot, lo que puede afectar al rendimiento en condiciones distintas a las del entrenamiento.
- El archivo `optimizer.pt` incluido en el repo aumenta significativamente el tamaño (25.5 GB), lo que puede complicar la descarga y el despliegue.
- Para su uso, es necesario tener acceso al backbone gated `nvidia/Cosmos-Reason2-2B`, además de cumplir la licencia Apache 2.0.
- No se han documentado sesgos conocidos, pero al tratarse de un dataset pequeño y de una tarea concreta, el modelo puede heredar sesgos de la recogida original de datos.

## Enlaces

- HuggingFace: https://huggingface.co/PID0930/groot-n1d7-openarm-bottle-sort-ckpt15000
- Checkpoint hermano (5.000): https://huggingface.co/PID0930/groot-n1d7-openarm-bottle-sort-ckpt5000
- Checkpoint hermano (10.000): https://huggingface.co/PID0930/groot-n1d7-openarm-bottle-sort-ckpt10000
- Checkpoint hermano (20.000): https://huggingface.co/PID0930/groot-n1d7-openarm-bottle-sort-ckpt20000
- Isaac-GR00T (código, modelo, entrenamiento y evaluación): https://github.com/NVIDIA/Isaac-GR00T
- OpenArm (entorno de evaluación reproducible): https://openarm.dev/
