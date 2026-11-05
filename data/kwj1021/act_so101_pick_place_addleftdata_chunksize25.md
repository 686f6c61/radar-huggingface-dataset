# Kwj1021/act_so101_pick_place_addleftdata_chunksize25

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para control robótico que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, reduciendo el error de composición acumulado en tareas de manipulación de horizonte largo. Este repositorio concreto, `Kwj1021/act_so101_pick_place_addleftdata_chunksize25`, es una política entrenada con LeRobot sobre el robot SO-101 (tipo `so_follower`) para la tarea de recoger un objeto y depositarlo en una zona objetivo.

El modelo es una política visomotora que consume el estado articular de 6 dimensiones y dos flujos de imagen de 480x640 (cámara de muñeca y cámara cenital), y emite un vector de acción de 6 dimensiones. El nombre del repositorio sugiere un tamaño de chunk de 25 pasos de acción. Cuenta con 51.591.814 parámetros en formato safetensors y un tamaño de repositorio de 0,2 GB.

Es relevante como ejemplo reproducible de entrenamiento de políticas ACT con LeRobot 0.6.2 sobre hardware de bajo coste (SO-101), útil para investigadores y desarrolladores que quieran replicar flujos de imitación en robótica de mesa. No se trata de un modelo de lenguaje: no procesa texto libre ni tiene capacidades conversacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política visomotora transformer |
| Parametros totales | 51.591.814 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación por frame y chunk de acción de 25 pasos según el nombre del repo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Tipo de robot | so_follower (SO-101) |
| Camaras | wrist, top |
| Entrada observation.state | STATE, shape (6,) |
| Entrada observation.images.wrist | VISUAL, shape (3, 480, 640) |
| Entrada observation.images.top | VISUAL, shape (3, 480, 640) |
| Salida action | ACTION, shape (6,) |
| Dataset de entrenamiento | Kwj1021/so101_pick_place_addleftdata |
| Episodios | 128 |
| Frames | 112.201 |
| Frecuencia de datos | 30 FPS |
| Pasos de entrenamiento | 500.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

ACT es un transformer que mapea observaciones (estado articular y hasta dos imágenes RGB) a un chunk de acciones de horizonte corto. La predicción por chunks mitiga el problema de composición de errores típico de las políticas que predicen un único paso, y el uso de un decoder transformer con consultas aprendidas permite generar la secuencia completa de acciones de forma paralela. El repositorio incluye dos cámaras (muñeca y cenital) a resolución 480x640, lo que aporta información tanto de la pinza como del entorno de trabajo.

El entrenamiento se realizó mediante aprendizaje por imitación supervisado sobre el dataset `Kwj1021/so101_pick_place_addleftdata`, compuesto por 128 episodios y 112.201 frames a 30 FPS, con la instrucción "pick up the object and place it in the target area". La configuración reportada es de 500.000 pasos, batch size 8, AdamW con learning rate 1e-05 y semilla 1000, ejecutado con LeRobot 0.6.2. No se documentan técnicas de RLHF, DPO ni aumentos de datos adicionales; tampoco se especifica la composición exacta del dataset más allá de los episodios y frames indicados.

## Capacidades

- Control visomotor para manipulación de mesa: recoger un objeto y colocarlo en una zona objetivo.
- Fusión de dos vistas RGB (muñeca y cenital) con el estado articular de 6 dimensiones.
- Predicción de chunks de acción de 25 pasos (según el identificador del repositorio), lo que reduce la frecuencia de replanificación.
- Ejecución en bucle cerrado sobre el robot SO-101 mediante `lerobot-rollout`.
- Aprendizaje por imitación a partir de datos de teleoperación.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No es multilingüe ni procesa texto: la tarea se especifica como cadena fija en el comando de rollout.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del pipeline robótico.

## Casos de uso

- Automatización de pick-and-place en laboratorio: ejecutar la política sobre un SO-101 para trasladar objetos pequeños a una zona de destino, usando las dos cámaras para corregir la trayectoria en bucle cerrado.
- Replicación de experimentos de imitación: servir como referencia reproducible de un entrenamiento ACT con LeRobot 0.6.2, 128 episodios y 500.000 pasos, para comparar hiperparámetros o tamaños de chunk.
- Base para fine-tuning con datos propios: partir de estos pesos y reentrenar con un dataset ampliado (`so101_pick_place_addleftdata` u otro) para adaptar la política a nuevos objetos o posiciones.
- Evaluación de robustez ante cambios de iluminación o distractores: desplegar la política en el mismo robot con variaciones controladas del entorno y medir la tasa de éxito, ya que la model card no reporta evaluación.
- Docencia en robótica de bajo coste: usar el flujo `lerobot-rollout` con el SO-101 como ejemplo práctico de políticas visomotoras en cursos de aprendizaje por imitación.
- Integración en pipelines de investigación con LeRobot: cargar la política desde el Hub en scripts propios para experimentar con estrategias de rollout, grabación de episodios o evaluación automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, número de ensayos ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros en safetensors, el peso en FP32 ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna (el cuello de botella es el procesamiento de dos imágenes de 480x640, no el tamaño del modelo).
- GPU recomendadas: no especificadas por el autor. Cualquier GPU con soporte CUDA es suficiente para la inferencia; para entrenamiento se recomienda una GPU dedicada (por ejemplo, RTX 3090/4090 o superiores), aunque el autor no documenta requisitos concretos.
- Cabe en GPU consumer: sí, por tamaño de parámetros; el requisito real es disponer de puertos USB suficientes para el robot y las dos cámaras OpenCV a 30 FPS.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) con `--policy.path=Kwj1021/act_so101_pick_place_addleftdata_chunksize25`; entrenamiento con `lerobot-train` y `--policy.type=act`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La política opera a 30 FPS según la frecuencia del dataset, pero no se publican mediciones de latencia por chunk ni de throughput en el robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_so101_pick_place_addleftdata_chunksize25 (este) | 51.591.814 | chunk de 25 (según nombre) | Pick-and-place con SO-101, 2 cámaras | no disponible | HuggingFace, 0 descargas |
| Otras políticas ACT en LeRobot Hub | no disponible | no disponible | Manipulación genérica | variable | Hub de HuggingFace |
| Políticas Diffusion Policy en LeRobot | no disponible | no disponible | Manipulación genérica | variable | Hub de HuggingFace |
| Políticas VLA (p. ej. pi0, OpenVLA) | no disponible en esta ficha | no disponible | Manipulación con instrucciones en lenguaje | variable | Hub de HuggingFace |

No se dispone de datos numéricos comparativos publicados para este repositorio. La comparación se limita a categoría y disponibilidad.

## Limitaciones y advertencias

- Sin resultados de evaluación: el autor no reporta tasa de éxito ni número de ensayos, por lo que el rendimiento real en el robot es desconocido.
- Licencia no especificada: la model card indica "More Information Needed"; no se puede asumir uso comercial sin consultar al autor.
- Especialización estrecha: entrenada para una única tarea ("pick up the object and place it in the target area") sobre un robot SO-101 concreto y una configuración de cámaras concreta (wrist y top a 480x640).
- Dependencia del hardware: los nombres de cámara y el puerto del robot deben coincidir con los usados en el entrenamiento; cambios de montaje, iluminación o posición de cámara degradan la política.
- Dataset limitado: 128 episodios y 112.201 frames; la diversidad de objetos, posiciones y condiciones de iluminación es presumiblemente baja, con riesgo de sobreajuste al entorno de recogida.
- Sin capacidades de lenguaje: no interpreta instrucciones en lenguaje natural; la tarea se pasa como cadena fija.
- Riesgo de fallo silencioso: al no haber evaluación publicada, no se conocen los modos de fallo típicos ni la robustez ante objetos no vistos.
- Sin cuantizaciones publicadas: no se ofrecen variantes GGUF u otras para despliegue en CPU.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kwj1021/act_so101_pick_place_addleftdata_chunksize25
- Dataset de entrenamiento: https://huggingface.co/datasets/Kwj1021/so101_pick_place_addleftdata
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Kwj1021/so101_pick_place_addleftdata
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
