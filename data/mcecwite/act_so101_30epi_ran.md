# mceCWITE/act_so101_30epi_ran

## Resumen

act_so101_30epi_ran es una política de aprendizaje por imitación basada en ACT (Action Chunking with Transformers), desarrollada por el usuario mceCWITE y publicada en Hugging Face dentro del ecosistema LeRobot. El modelo controla un brazo robótico SO-101 (tipo so_follower) con una única cámara frontal y aprende de 30 episodios teleoperados. Su tarea concreta es "Grab the purple cube" (agarrar un cubo morado).

Con 51.668.614 parámetros y un repositorio de 0,2 GB, es un modelo compacto que puede ejecutarse en hardware de consumo. ACT predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad del control. Es relevante como ejemplo reproducible de entrenamiento de políticas robóticas de bajo coste con LeRobot, aunque no cuenta con evaluación publicada y está limitado a la tarea y configuración de cámara del dataset.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con codificador VAE y backbone visual ResNet |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política visomotora; no hay ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente FP32) |
| Idiomas soportados | no disponible (no aplica: política robótica sin entrada ni salida de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | so_follower (SO-101) |
| Camaras | front (frontal), resolución 3×360×640 |
| Entradas | observation.state (6,), observation.images.front (3, 360, 640) |
| Salidas | action (6,) |
| Frecuencia de datos | 30 FPS |
| Tarea entrenada | "Grab the purple cube" |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone visual ResNet para procesar las imágenes con un transformer encoder-decoder que genera bloques de acciones (action chunks). Incluye un codificador VAE que modela la variabilidad de las demostraciones humanas y se entrena con una pérdida de reconstrucción L1 junto con una regularización KL, tal como se describe en el paper original (arXiv:2304.13705). El modelo consume el estado del robot (6 dimensiones) y una imagen frontal de 360×640, y produce una acción de 6 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.2 durante 60.000 pasos, con un tamaño de lote de 8, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. El dataset utilizado contiene 30 episodios, 16.240 fotogramas a 30 FPS y una única tarea: "Grab the purple cube". No se especifica el tamaño del chunk de acciones ni si se aplicaron aumentos de datos. No hay indicios de RLHF ni DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Generación de acciones de manipulación de 6 dimensiones para el brazo SO-101.
- Control visomotor a partir de una imagen frontal y del estado articular.
- Predicción por bloques de acciones (action chunking), que suaviza la ejecución.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso; es una política reactiva.
- No tiene capacidades multilingües ni de procesamiento de lenguaje natural.
- No dispone de modo "thinking", visión adicional, audio ni otras modalidades.
- Especializada en una única tarea: agarrar un cubo morado.

## Casos de uso

- Automatización de pick-and-place de un cubo morado en laboratorio: el modelo ejecuta la secuencia de agarre sobre un SO-101 con cámara frontal, adecuado para validar la integración hardware-software en un entorno controlado.
- Reproducción de la tarea en un brazo SO-101 recién montado: sirve para comprobar que la calibración, el puerto y la cámara coinciden con los del dataset original.
- Benchmark de calibración de cámara: al depender de una única vista frontal, permite evaluar el impacto de la posición y los parámetros intrínsecos de la cámara en el éxito de la tarea.
- Recolección de datos comparativa: puede usarse como línea base para contrastar nuevas políticas entrenadas con más episodios o con variaciones de iluminación y posición.
- Educación y demostración de aprendizaje por imitación: su tamaño reducido y su integración con LeRobot lo hacen idóneo para talleres y cursos de robótica.
- Investigación en action chunking: permite estudiar el efecto del tamaño del chunk y de la frecuencia de control en tareas de manipulación.
- Prototipado rápido de bajo coste: al caber en GPU de consumo, facilita pruebas iterativas sin infraestructura especializada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica: "No evaluation results have been provided for this policy yet". No se dispone de tasas de éxito, número de ensayos ni comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan aproximadamente 207 MB en FP32 (51.668.614 parámetros × 4 bytes). Con las activaciones para imágenes de 360×640, el consumo se mantiene por debajo de 1 GB.
- GPU recomendadas: cualquier GPU de consumo con al menos 2 GB de VRAM, como GTX 1050, RTX 3050, RTX 3060 o RTX 4090. No se requieren A100 ni H100.
- Ejecución en CPU: es posible, aunque para control en tiempo real a 30 FPS se recomienda una GPU.
- Opciones de despliegue: `lerobot-rollout` (CLI de LeRobot), PyTorch e integración con el ecosistema LeRobot. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que son herramientas para modelos de lenguaje.
- Latencia y throughput: no disponible. El dataset se grabó a 30 FPS, por lo que la política debería ejecutarse a esa frecuencia para un control fluido.

## Comparativa con modelos similares

| Modelo | Parametros | Horizonte de accion | Licencia | Disponibilidad |
|---|---|---|---|---|
| act_so101_30epi_ran (este modelo) | 51.668.614 | no disponible | apache-2.0 | Hugging Face |
| ACT original (ALOHA) | no disponible | 100 acciones (valor del paper) | MIT (código) | GitHub |
| Diffusion Policy | no disponible | no disponible | MIT (código) | GitHub |

ACT se caracteriza por una inferencia más rápida que los métodos basados en difusión, como Diffusion Policy, aunque con menor diversidad de trayectorias. No se dispone de comparativas numéricas específicas para este checkpoint.

## Limitaciones y advertencias

- Sin resultados de evaluación: se desconoce la tasa de éxito real en el robot.
- Dataset muy reducido: 30 episodios y 16.240 fotogramas, lo que limita la generalización.
- Una sola tarea: únicamente "Grab the purple cube".
- Una sola cámara frontal: si la configuración de cámara no coincide exactamente, el modelo fallará.
- Robot específico: entrenado para so_follower (SO-101); no es directamente transferible a otros brazos.
- Sensibilidad a cambios de iluminación, posición del objeto, distractores o desgaste mecánico.
- Sin capacidades de lenguaje ni de seguimiento de instrucciones verbales.
- Riesgo de sobreajuste a la apariencia y posición del cubo morado.
- Licencia apache-2.0: permite uso comercial con atribución, pero sin garantías.
- No se han documentado sesgos, aunque en robótica los sesgos se manifiestan como fallos sistemáticos en condiciones no vistas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mceCWITE/act_so101_30epi_ran
- Dataset de entrenamiento: https://huggingface.co/datasets/mceCWITE/record-test_20260922_160808
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mceCWITE/record-test_20260922_160808
