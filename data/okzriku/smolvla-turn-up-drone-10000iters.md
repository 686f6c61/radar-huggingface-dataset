# OkzRIKU/smolvla-turn-up-drone-10000iters

## Resumen

Este repositorio contiene una política robótica de tipo Vision-Language-Action (VLA) publicada por el usuario OkzRIKU bajo el identificador `OkzRIKU/smolvla-turn-up-drone-10000iters`. Se trata de un ajuste fino (fine-tune) del modelo base `lerobot/smolvla_base`, entrenado con LeRobot sobre un único conjunto de datos de demostraciones y orientado a una tarea de manipulación concreta: levantar un dron que está boca abajo, girarlo hasta ponerlo derecho, depositarlo de forma estable sobre la mesa y soltarlo. No es un modelo de lenguaje ni un asistente conversacional, sino una política de control que traduce observaciones visuales y de estado en comandos de acción para un brazo robótico SO-101 (tipo `so_follower`).

El modelo se apoya en la arquitectura SmolVLA descrita en el paper arXiv:2506.01844, que combina un modelo de visión-lenguaje (VLM) preentrenado, encargado de la percepción, con un "action expert" que genera las acciones. SmolVLA está diseñado explícitamente para reducir costes de entrenamiento e inferencia: según sus autores, puede entrenarse en una sola GPU y desplegarse en GPUs de gama de consumo o incluso en CPU. Esta política concreta fue entrenada durante 10.000 pasos con un tamaño de lote de 64 sobre 50 episodios (45.464 fotogramas a 30 FPS) del dataset `OkzRIKU/so101-turn-up-drone-clean`.

El interés de esta ficha radica en que ejemplifica el flujo de trabajo actual de robótica open source con LeRobot: partir de un modelo base pequeño (unos 450 millones de parámetros), ajustarlo con un dataset propio de imitación y desplegarlo en hardware asequible. La relevancia práctica, sin embargo, es limitada por su naturaleza: es una política especializada en una sola tarea, sin resultados de evaluación publicados y con 0 descargas y 0 "likes" en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) tipo SmolVLA: VLM preentrenado para percepción + action expert para generación de acciones |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente en precisión completa/bf16) |
| Idiomas soportados | no disponible (condicionamiento textual de la tarea en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Modelo base | lerobot/smolvla_base (fine-tune) |
| Tipo de robot | so_follower (brazo SO-101 de LeRobot) |
| Entradas | `observation.state` (6,), `observation.images.wrist.top` (3, 480, 640), `observation.images.top` (3, 480, 640) |
| Salidas | `action` (6,) |
| Pipeline declarado | robotics |
| Tamano del repositorio | 8,1 GB |

## Arquitectura y entrenamiento

SmolVLA, según la descripción del paper referenciado, se compone de dos bloques: (i) un VLM preentrenado que realiza la percepción y (ii) un action expert entrenado para actuar. Ambos componentes están interconectados: el VLM procesa las observaciones (incluido el estado) y genera representaciones que condicionan al action expert, el cual produce acciones que a su vez modifican el estado que se vuelve a introducir en el VLM. Esta política hereda dicha arquitectura del modelo base `lerobot/smolvla_base` y produce directamente un vector de acción de 6 dimensiones a partir de dos imágenes de 480×640 píxeles y un vector de estado de 6 dimensiones.

El entrenamiento se realizó mediante aprendizaje por imitación (behavior cloning) sobre el dataset `OkzRIKU/so101-turn-up-drone-clean`: 50 episodios, 45.464 fotogramas a 30 FPS, correspondientes a una única tarea. La configuración declarada es de 10.000 pasos de entrenamiento, tamaño de lote 64, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000, usando LeRobot 0.6.2. No se documentan técnicas adicionales de alineación (RLHF/DPO), aumentos de datos ni innovaciones propias del autor; se trata de un ajuste fino estándar del modelo base. Tampoco se especifica el número de tokens, la composición exacta del dataset más allá de la tarea ni detalles de la fase de preentrenamiento del VLM, por lo que esos datos quedan como no disponibles.

## Capacidades

- Generación de acciones de control robótico: convierte dos flujos de imagen (cámara de muñeca `wrist.top` y cámara cenital `top`) más el estado del robot en un vector de acción de 6 dimensiones.
- Ejecución de la tarea específica para la que fue entrenado: levantar un dron boca abajo por el cuerpo central, girarlo hasta dejarlo derecho, colocarlo de forma estable sobre la mesa y soltarlo.
- Condicionamiento por instrucción en lenguaje natural: acepta un prompt de tarea (por ejemplo, el texto de la tarea descrita) para guiar el comportamiento.
- Percepción visual multimodal: procesa dos vistas RGB simultáneas a 480×640 y 30 FPS.
- No dispone de tool calling ni function calling: no es un modelo de lenguaje con herramientas.
- No soporta razonamiento multi-paso de tipo agente ni planificación simbólica: la política emite acciones de control de bajo nivel.
- Capacidades multilingües: no disponibles; el condicionamiento textual de la tarea está en inglés.
- No dispone de modo "thinking", visión generalista, audio ni generación de texto.

## Casos de uso

- Manipulación robótica con brazo SO-101: despliegue de la política en un brazo `so_follower` con dos cámaras para recolocar objetos, en este caso un dron volcado, mediante `lerobot-rollout` y una ventana de ejecución controlada por el parámetro `--duration`.
- Automatización de tareas repetitivas de "girar y colocar": útil en entornos de laboratorio o líneas de montaje donde haya que enderezar y reposicionar piezas pequeñas de forma repetida, siempre que la geometría coincida con la del entrenamiento.
- Punto de partida para nuevos ajustes finos: sirve como política inicial o como plantilla de entrenamiento (`lerobot-train`) para aprender tareas adicionales con nuevos datasets de demostraciones.
- Investigación en VLA de bajo coste: permite reproducir el flujo de SmolVLA (entrenamiento en una GPU, despliegue en GPU de consumo o CPU) y comparar variantes de arquitectura o datos sin grandes recursos de cómputo.
- Prototipado en hardware asequible: al tratarse de un modelo de ~450 M de parámetros, es viable desplegarlo en estaciones de trabajo con GPU de gama media o incluso en CPU, lo que facilita demostraciones y pruebas de concepto.
- Generación de datos y evaluación de políticas de imitación: puede utilizarse como referencia para medir éxito/fracaso de una tarea concreta y para comparar contra otras políticas entrenadas sobre el mismo dataset.
- Demostraciones educativas de robótica open source: sirve para ilustrar el ciclo completo con LeRobot (grabación de datos, entrenamiento, despliegue y evaluación) con una única tarea bien acotada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica explícitamente: "No evaluation results have been provided for this policy yet", incluyendo una plantilla de evaluación de éxito en robot real que no ha sido rellenada. No se dispone, por tanto, de tasas de éxito por tarea, ni de comparaciones con MMLU, HumanEval, GSM8K u otros benchmarks de lenguaje (no aplicables a una política VLA de control).

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, ~450 M de parámetros): aproximadamente 1,8 GB en FP32, 0,9 GB en FP16/BF16 y 0,45 GB en INT8, sin contar el codificador visual, las activaciones ni el sobrecoste del runtime.
- GPUs recomendadas: cualquier GPU moderna con al menos 4-6 GB de VRAM sirve (RTX 3060, RTX 4060, RTX 4090); también A100 o H100 si se busca margen y velocidad, aunque son sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí; el paper y la model card afirman que SmolVLA puede desplegarse en GPUs de gama de consumo e incluso en CPU.
- Opciones de despliegue: la librería LeRobot a través de `lerobot-rollout` (inferencia) y `lerobot-train` (entrenamiento). No se ha documentado soporte para vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de política.
- Entrenamiento: el modelo base está diseñado para entrenarse en una sola GPU; el repo ocupa 8,1 GB, lo que incluye los checkpoints de entrenamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OkzRIKU/smolvla-turn-up-drone-10000iters | 450 M | no disponible | Política VLA especializada (girar y colocar un dron) | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| lerobot/smolvla_base | no disponible | no disponible | Modelo VLA base para ajuste fino | Apache 2.0 | HuggingFace |
| SmolVLA (familia descrita en arXiv:2506.01844) | no disponible | no disponible | VLA compacto entrenable en una GPU y desplegable en hardware de consumo | no disponible | Paper y pesos base |

No se dispone en la información proporcionada de datos de otros VLA comparables (por ejemplo, arquitecturas tipo OpenVLA o pi0) que permitan una comparación numérica rigurosa de parámetros, contexto o rendimiento; esos datos quedan como no disponibles.

## Limitaciones y advertencias

- Ausencia total de evaluación: la model card no incluye ningún resultado de éxito en robot real, por lo que no hay evidencia pública de que la tarea se complete de forma fiable.
- Especialización extrema: la política está entrenada para una única tarea y un único tipo de objeto (un dron); no generaliza a otras tareas sin un nuevo ajuste fino.
- Dependencia del montaje: las entradas esperadas (dos cámaras `wrist.top` y `top`, resolución 480×640, estado de 6 dimensiones) deben coincidir exactamente con el hardware y la calibración usados en el entrenamiento; cambios de cámara, posición o iluminación pueden degradar el comportamiento.
- Rigidez ante variaciones: al proceder de aprendizaje por imitación con solo 50 episodios, es probable que sea sensible a cambios de posición del objeto, distractores o condiciones de luz distintas a las de las demostraciones.
- Riesgo de alucinación: en el contexto de una política de control, el riesgo se traduce en acciones erróneas o no seguras (por ejemplo, forzar el objeto o colisionar), especialmente fuera de la distribución de entrenamiento.
- Idiomas: no hay evidencia de soporte multilingüe; el condicionamiento textual de la tarea está en inglés.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el usuario debe revisar y cumplir las condiciones de las dependencias (LeRobot) y del modelo base.
- Caveat de producción: dado que no hay métricas de éxito ni pruebas de robustez, no se recomienda su uso en entornos de producción sin una validación exhaustiva en el robot objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OkzRIKU/smolvla-turn-up-drone-10000iters
- Dataset de entrenamiento: https://huggingface.co/datasets/OkzRIKU/so101-turn-up-drone-clean
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=OkzRIKU/so101-turn-up-drone-clean
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA (arXiv): https://arxiv.org/abs/2506.01844
- Paper SmolVLA (HTML): https://arxiv.org/html/2506.01844v1
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
