# eslab1234/smolvla_5blocks_125ep_fullft_b16_lr2e5_50k_noaug_v4

## Resumen

Este modelo es un fine-tuning del modelo SmolVLA, un vision-language-action (VLA) compacto desarrollado por Hugging Face, adaptado específicamente para una tarea de manipulación robótica de pick-and-place con cinco bloques de colores. El modelo base SmolVLA cuenta con 450 millones de parámetros y está diseñado para desplegarse en hardware de consumo, lo que lo hace accesible para laboratorios y desarrolladores sin infraestructura de alto coste.

El fine-tuning se ha realizado sobre el modelo base `lerobot/smolvla_base` utilizando el framework LeRobot, con un dataset propio de 125 episodios y más de 155.000 frames capturados a 30 FPS. La tarea consiste en recoger bloques rojos, azules, verdes, amarillos y de madera y colocarlos en un área objetivo. Este modelo es relevante porque demuestra cómo un VLA de tamaño reducido puede especializarse en tareas robóticas concretas con un coste computacional moderado, abriendo la puerta a la robótica de aprendizaje por imitación en entornos de investigación y prototipado.

La arquitectura combina un codificador visual, un modelo de lenguaje y un decodificador de acciones, procesando imágenes de tres cámaras (superior, muñeca y lateral) junto con el estado del robot para generar comandos de acción de 6 grados de libertad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA (transformador multimodal) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a generación de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 0.9 GB) |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action que adapta un VLM preentrenado a la robótica. Su arquitectura integra un codificador visual que procesa imágenes de múltiples cámaras (en este caso tres: superior, muñeca y lateral, cada una a 256x256 píxeles), un modelo de lenguaje que interpreta instrucciones en lenguaje natural y un decodificador que produce acciones de 6 dimensiones (posición y orientación del efector). El modelo base fue preentrenado a gran escala y luego fine-tuneado mediante aprendizaje por imitación.

El entrenamiento de este fine-tuning se realizó con LeRobot versión 0.5.2, durante 50.000 pasos con un batch size de 16, optimizador AdamW y una tasa de aprendizaje de 2e-5. El dataset de entrenamiento contiene 125 episodios y 155.763 frames a 30 FPS, con la tarea de recoger cinco bloques de colores y colocarlos en un área objetivo. No se especifica el uso de RLHF, DPO u otras técnicas de alineación; se trata de un fine-tuning supervisado estándar sobre el modelo base.

## Capacidades

- Manipulación robótica: genera acciones de 6 grados de libertad (posición y orientación) a partir de observaciones visuales y del estado del robot.
- Percepción multimodal: procesa simultáneamente tres flujos de imagen (cámara superior, muñeca y lateral) junto con el estado del robot (6 valores).
- Ejecución de tareas de pick-and-place: especializado en recoger objetos de colores específicos y colocarlos en una zona designada.
- Aprendizaje por imitación: puede reproducir comportamientos demostrados en el dataset de entrenamiento.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para robótica, incluyendo entrenamiento, evaluación y despliegue.
- Control en tiempo real: diseñado para inferencia a 30 FPS en hardware de consumo.

## Casos de uso

- Automatización de tareas de clasificación en laboratorio: el modelo puede controlar un brazo robótico para separar objetos por color, útil en entornos de investigación y prototipado de líneas de montaje.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo los VLA compactos se adaptan a tareas específicas con pocos datos (125 episodios).
- Desarrollo de robots de asistencia en entornos educativos: permite a estudiantes y desarrolladores experimentar con control robótico basado en visión y lenguaje sin necesidad de GPUs de alta gama.
- Prototipado de celdas de pick-and-place en logística: puede adaptarse a tareas de recogida y colocación de piezas en almacenes pequeños o líneas de demostración.
- Benchmarking de VLA en hardware de consumo: útil para comparar el rendimiento de SmolVLA frente a modelos más grandes en tareas reales de robótica.
- Base para fine-tuning adicional: al ser un modelo abierto con licencia Apache-2.0, puede reentrenarse sobre nuevos datasets para tareas similares de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no se han proporcionado resultados de evaluación en robot real para este fine-tuning concreto. El paper original de SmolVLA (arXiv:2506.01844) reporta resultados comparativos, pero no se dispone de ellos en la información proporcionada para este modelo específico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada, pero al tratarse de un modelo de 450M parámetros, se estima que puede ejecutarse en GPUs de consumo con al menos 8-12 GB de VRAM en precisión FP16.
- GPU recomendadas: RTX 3060, RTX 4070, RTX 4090 o similares; también compatible con GPUs de datacenter como A100 si se requiere mayor throughput.
- Cabe en GPU de consumo: sí, es uno de los objetivos del diseño de SmolVLA (despliegue en hardware de consumo).
- Opciones de despliegue: LeRobot (framework oficial), con soporte para inferencia en tiempo real mediante `lerobot-rollout`. También puede integrarse con otros frameworks de inferencia de modelos de visión-lenguaje-acción.
- Latencia y throughput: no disponible, pero el modelo está diseñado para operar a 30 FPS con tres cámaras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA (este fine-tuning) | 450M | no disponible | Apache-2.0 | Hugging Face |
| SmolVLA base (lerobot/smolvla_base) | 450M | no disponible | Apache-2.0 | Hugging Face |
| OpenVLA | 7B | no disponible | MIT | Hugging Face |
| RT-2 (Google) | 55B | no disponible | propietaria | no abierto |

SmolVLA destaca por su tamaño reducido (450M frente a los 7B de OpenVLA o 55B de RT-2), lo que permite su ejecución en hardware de consumo. Sin embargo, al ser un fine-tuning específico para una tarea de pick-and-place, su generalización a otras tareas es limitada en comparación con modelos más grandes y generalistas.

## Limitaciones y advertencias

- Especialización limitada: el modelo está entrenado únicamente para la tarea de recoger cinco bloques de colores y colocarlos en un área objetivo; no generaliza a otras tareas sin reentrenamiento.
- Dependencia del dataset: el rendimiento depende de la calidad y variedad de los 125 episodios de entrenamiento; puede fallar ante variaciones de iluminación, posición de objetos o distracciones no presentes en el dataset.
- Sin evaluación en robot real: la model card indica que no se han proporcionado resultados de evaluación, por lo que el rendimiento real en el robot no está verificado.
- Riesgo de alucinación en acciones: como todo modelo de aprendizaje por imitación, puede generar acciones incorrectas o inseguras si las observaciones difieren de las del entrenamiento.
- Sin soporte de lenguaje natural en inferencia: aunque el modelo base es un VLA, este fine-tuning está orientado a una tarea fija; no se ha documentado el uso de instrucciones de lenguaje en tiempo de inferencia.
- Requiere configuración específica de cámaras: el modelo espera tres cámaras (superior, muñeca y lateral) con nombres y resoluciones concretas; cualquier cambio en la configuración puede degradar el rendimiento.
- Licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantías y el usuario es responsable de su uso seguro en entornos reales.

## Enlaces

- Repositorio del modelo: https://huggingface.co/eslab1234/smolvla_5blocks_125ep_fullft_b16_lr2e5_50k_noaug_v4
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/eslab1234/task1_pick_place_5blocks_125ep_merged_v1
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Blog de SmolVLA en Hugging Face: https://huggingface.co/blog/smolvla
- Sitio web de SmolVLA: https://smolvla.net/index_en
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
