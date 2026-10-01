# kiroaiseoul/act_task10_move_to_beaker_shelf_14D_baseprogress_60k_fp32

## Resumen

El modelo `act_task10_move_to_beaker_shelf_14D_baseprogress_60k_fp32` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice trozos de acciones (action chunks) en lugar de pasos individuales. Lo desarrolla el usuario kiroaiseoul y se distribuye a través del Hub de HuggingFace dentro del ecosistema LeRobot, la librería de referencia de HuggingFace para aprendizaje por imitación en robótica. Resuelve el problema de generar comandos de control motriz a partir de observaciones visuales y de estado del robot, entrenándose con datos de teleoperación.

Con 51.689.104 parámetros (aproximadamente 51,7 millones), es un modelo compacto pensado para ejecutarse en tiempo real sobre hardware de robot, no para generación de texto. Esta versión concreta corresponde al checkpoint de 60.000 pasos de entrenamiento (`60k`) en precisión fp32, y ha sido entrenada sobre el dataset `task10_move_to_beaker_shelf_14D_baseprogress`, orientado a la tarea de mover un vaso de precipitados (beaker) a una estantería dentro de un entorno de laboratorio. El espacio de acciones es de 14 dimensiones (`14D`).

Su relevancia actual radica en que forma parte del creciente ecosistema de políticas robóticas abiertas publicadas mediante LeRobot, que permiten reproducir entrenamientos y desplegar políticas con código y pesos disponibles bajo licencia Apache-2.0. El modelo está etiquetado como `pipeline: robotics` y su repositorio ocupa 0,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers); transformer con componente CVAE para aprendizaje por imitacion |
| Parametros totales | 51.689.104 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; ACT predice chunks de acciones a partir de un historial de observaciones, no secuencias de tokens de lenguaje |
| Tipos de cuantizacion | fp32 (version publicada); fp16 disponible en checkpoint hermano |
| Idiomas soportados | no aplica (politica de robotica; no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Espacio de acciones | 14 dimensiones (`14D`) |
| Pasos de entrenamiento | 60k |
| Dataset de entrenamiento | kiroaiseoul/task10_move_to_beaker_shelf_14D_baseprogress |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers), descrito en el paper arXiv 2304.13705, es un método de aprendizaje por imitación que combina un codificador visual (típicamente una red convolucional tipo ResNet) con un transformer que actúa como decodificador de acciones. La innovación principal es la predicción de *chunks* de acciones: en lugar de emitir un único comando por paso de tiempo, el modelo genera una secuencia corta de acciones futuras, lo que reduce el error de compounding y mejora la estabilidad del control. Incorpora además un componente CVAE (autoencoder variacional condicional) que modela la variabilidad de las demostraciones humanas, con un estilo latente que se fija a la media durante la inferencia para producir comportamientos deterministas.

El entrenamiento se realizó con la herramienta LeRobot sobre el dataset `task10_move_to_beaker_shelf_14D_baseprogress`. Según los resultados de búsqueda, el dataset asociado `task10_move_to_beaker_shelf` contiene 107 episodios de demostración con un total de 39.758 fotogramas, capturados por un robot `mobileai`. Esta versión corresponde a 60.000 pasos de optimización en fp32, mientras que existe un checkpoint hermano entrenado durante 100.000 pasos en fp16. No se especifica en la información disponible el número total de tokens o muestras visto, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO (no aplicables en el flujo estándar de ACT, que es puramente supervisado/imitativo).

## Capacidades

- Control robótico por imitación: genera comandos de acción de 14 dimensiones para tareas de manipulación.
- Predicción de chunks de acciones, lo que permite movimientos más suaves y coherentes que el control paso a paso.
- Percepción visual: procesa observaciones de cámara (imágenes) junto con el estado del robot para producir acciones.
- Ejecución de la tarea concreta de mover un vaso de precipitados a una estantería en un entorno de laboratorio.
- Integración con el ecosistema LeRobot: entrenamiento, evaluación e inferencia mediante `lerobot-train` y `lerobot-record`.
- Compatible con robots tipo `so100_follower` en los ejemplos de evaluación documentados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo de razonamiento (`thinking mode`), visión general ni audio; su única modalidad de salida son acciones motoras.

## Casos de uso

- Automatización de tareas de laboratorio: el modelo puede ejecutar de forma autónoma la acción de trasladar un vaso de precipitados a una estantería, reduciendo la intervención manual en entornos de investigación química o biológica.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para estudiar el efecto del número de pasos de entrenamiento (60k frente a los 100k del checkpoint hermano) sobre la tasa de éxito.
- Evaluación comparativa de políticas ACT: dado que existen checkpoints con distinto número de pasos y precisión, permite analizar empíricamente el compromiso entre precisión numérica (fp32/fp16) y rendimiento de control.
- Reentrenamiento con datos propios: gracias a que LeRobot expone el pipeline de entrenamiento, un equipo puede ajustar esta política con sus propios datos de teleoperación para tareas de manipulación similares.
- Despliegue en robots de bajo coste: con 51,7 millones de parámetros y pesos de ~0,2 GB, es viable ejecutarlo en hardware modesto acoplado al robot para inferencia en tiempo real.
- Base para experimentos de generalización de tareas: al estar parametrizado por un dataset concreto, puede utilizarse como referencia para medir la transferencia a otras tareas de manipulación con el mismo robot `mobileai`.
- Integración en pipelines de robótica educativa: el flujo documentado (`lerobot-train` con `--policy.type=act` y `lerobot-record`) permite desplegar el modelo en entornos docentes sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones cuantitativas con otras políticas. El paper de ACT (arXiv 2304.13705) reporta resultados en sus propios entornos, pero no se dispone de datos específicos para este checkpoint concreto.

## Requisitos de hardware

- Peso de los parámetros en fp32: aproximadamente 207 MB (51.689.104 × 4 bytes).
- Peso de los parámetros en fp16: aproximadamente 103 MB.
- VRAM estimada para inferencia: por debajo de 2 GB incluyendo el codificador visual y las activaciones, aunque el valor exacto depende de la resolución de las imágenes de entrada y del tamaño del chunk de acciones.
- GPU recomendadas: cualquier GPU moderna con al menos 2-4 GB de VRAM; una NVIDIA RTX 3060, RTX 4090 o superior es más que suficiente. También tarjetas de gama de datacenter (A100, H100) funcionan, aunque están sobredimensionadas para este modelo.
- Cabe holgadamente en GPU de consumo, e incluso en GPUs integradas o en CPU para inferencia de baja frecuencia (no recomendado para control en tiempo real).
- Opciones de despliegue: la librería LeRobot (scripts `lerobot-train` y `lerobot-record`), sobre PyTorch. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible en la información proporcionada; dependerá del hardware y de la frecuencia de control requerida por el robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Pasos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| act_task10_move_to_beaker_shelf_14D_baseprogress_60k_fp32 (este) | 51.689.104 | no disponible | fp32 | 60k | apache-2.0 | HuggingFace (kiroaiseoul) |
| act_task10_move_to_beaker_shelf_14D_100k_fp16c | no disponible | no disponible | fp16 | 100k | no disponible | HuggingFace (kiroaiseoul) |
| Otras politicas LeRobot (p. ej. diffusion policy) | no disponible | no disponible | no disponible | no disponible | no disponible | HuggingFace / LeRobot |

La comparación cuantitativa de rendimiento entre estos checkpoints no está disponible en la información proporcionada. La diferencia observable es el número de pasos de entrenamiento (60k frente a 100k) y la precisión de los pesos (fp32 frente a fp16), sin datos de tasa de éxito publicados.

## Limitaciones y advertencias

- Modelo específico de tarea: está entrenado exclusivamente para la tarea de mover un vaso de precipitados a una estantería; no generaliza a otras tareas sin reentrenamiento.
- Sin datos de rendimiento publicados: no hay tasas de éxito ni métricas de error que permitan estimar su fiabilidad en producción.
- Dependencia del entorno de entrenamiento: el rendimiento puede degradarse si las condiciones de iluminación, la posición de la cámara o la disposición de los objetos difieren de las del dataset original.
- Riesgo de fallo en control: como toda política de imitación, puede producir acciones fuera de distribución ante observaciones no vistas; requiere supervisión y mecanismos de parada de seguridad en aplicaciones reales.
- Sesgos: los sesgos derivados de las demostraciones humanas de teleoperación (estilos de movimiento, posiciones iniciales repetidas) pueden reflejarse en el comportamiento del modelo. No se dispone de un análisis de sesgos específico.
- Idiomas: no aplica; el modelo no procesa ni genera lenguaje natural.
- Licencia Apache-2.0: permite uso comercial y modificación, pero requiere conservar los avisos de licencia y no ofrece garantías. Conviene verificar la licencia del dataset asociado antes de reutilizarlo.
- Estado del repositorio: presenta 0 descargas y 0 "likes" en el momento de la consulta, y fue publicado en una fecha futura respecto a la información de referencia (2026), por lo que se trata de un artefacto con escasa validación por parte de la comunidad.
- La model card es una plantilla autogenerada por LeRobot y no documenta detalles de hiperparámetros, composición del dataset ni resultados de evaluación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kiroaiseoul/act_task10_move_to_beaker_shelf_14D_baseprogress_60k_fp32
- Checkpoint hermano (100k, fp16): https://huggingface.co/kiroaiseoul/act_task10_move_to_beaker_shelf_14D_100k_fp16c
- Dataset asociado: https://huggingface.co/datasets/kiroaiseoul/task10_move_to_beaker_shelf
- Ficha del dataset en selectdataset.com: https://www.selectdataset.com/dataset/e20f9486a071c1cfc24bb276e7af2cce/task10-move-to-beaker-shelf
- Ficha del dataset 14D en selectdataset.com: https://www.selectdataset.com/dataset/53107d7094ce34adfff68c6f4237b0bc/task10-move-to-beaker-shelf-14d
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Paper de ACT en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas de imitacion: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
