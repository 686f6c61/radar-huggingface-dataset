# Dimios45/smolvla_vision_charger_50ep

## Resumen

El modelo `smolvla_vision_charger_50ep` es una política robótica de tipo vision-language-action (VLA) desarrollada por Dimios45, que parte del modelo base `lerobot/smolvla_base` de Hugging Face y se ajusta finamente sobre 50 episodios del dataset táctil `aryankakad/tactile_charger_inserting`. La tarea específica consiste en agarrar un cargador, extraerlo del enchufe y depositarlo en una caja negra, siguiendo la instrucción en lenguaje natural *"grab and remove the charger from the socket and put it in the black box"*. Este modelo es una variante de solo visión (no utiliza la modalidad táctil) y sirve como línea base para comparar con versiones que sí incorporan datos táctiles.

SmolVLA es una arquitectura compacta de 450 millones de parámetros desarrollada por Hugging Face, diseñada para ejecutarse en hardware de consumo y democratizar la robótica basada en VLA. Este ajuste fino congela el backbone del VLM (SmolVLM2-500M-Video-Instruct) y entrena únicamente los módulos de proyección y acción, con aproximadamente 101 millones de parámetros entrenables. El modelo se ha entrenado durante 50.000 pasos con un batch de 64, alcanzando 114,4 épocas, y se ha optimizado para la manipulación de precisión con un `chunk_size` de 50 pasos de acción. La relevancia de este modelo radica en su tamaño reducido y su capacidad para ser desplegado en GPUs de consumo, lo que facilita la experimentación en robótica de bajo coste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) basada en SmolVLM2-500M-Video-Instruct con MLP de acción |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (entrenado en bf16) |
| Idiomas soportados | No disponible (instrucción en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA que combina un codificador de visión y un modelo de lenguaje preentrenado (SmolVLM2-500M-Video-Instruct) con una cabeza de acción que predice secuencias de posiciones articulares. En este ajuste fino, el backbone del VLM se congela (`freeze_vision_encoder=True`), y solo se entrenan los módulos de proyección y la política de acción, lo que reduce el número de parámetros entrenables a aproximadamente 101 millones. El modelo utiliza un `chunk_size` de 50 y `n_action_steps` de 50, lo que significa que predice 50 pasos de acción por cada inferencia.

El entrenamiento se realizó sobre 50 episodios del dataset `aryankakad/tactile_charger_inserting`, que contiene 27.973 fotogramas a 30 fps, capturados con dos cámaras (`top` y `gripper`). Las imágenes se renombraron a `camera1` y `camera2` para cumplir con las expectativas del modelo base. Se utilizó la librería LeRobot con soporte táctil (LeFlexiTac), aunque en esta variante no se usaron datos táctiles. El entrenamiento se llevó a cabo en una GPU AMD MI300X con ROCm 6.2.4, usando precisión mixta bf16, un learning rate de 0.0001 y un batch size de 64. No se realizó evaluación en robot real, por lo que no hay métricas de éxito de tarea.

## Capacidades

- Generación de acciones robóticas: predice secuencias de posiciones articulares (50 pasos) para controlar un brazo robótico en tareas de manipulación.
- Comprensión de instrucciones en lenguaje natural: la política está condicionada por una instrucción textual que describe la tarea.
- Percepción visual: utiliza dos cámaras (superior y pinza) para observar la escena y guiar la manipulación.
- Especialización en inserción de conectores: el modelo está ajustado para la tarea concreta de extraer un cargador de un enchufe y colocarlo en una caja.
- Ejecución en hardware de consumo: al tener solo 450M parámetros, puede ejecutarse en GPUs de gama media (p. ej., RTX 4060 con 8 GB VRAM).
- Integración con LeRobot: compatible con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.

## Casos de uso

- Automatización de ensamblaje electrónico: el modelo puede controlar un brazo robótico para insertar o extraer conectores en placas de circuitos, reduciendo el tiempo de ciclo en líneas de producción.
- Manipulación de objetos en entornos domésticos: la capacidad de seguir instrucciones en lenguaje natural permite usar el modelo en robots de asistencia que recogen y guardan objetos (p. ej., cargadores) en cajas o cajones.
- Investigación en aprendizaje por imitación: al ser un modelo pequeño y de código abierto, sirve como banco de pruebas para estudiar el efecto de la variación de datos, el número de episodios o la congelación de capas en políticas VLA.
- Desarrollo de robots de bajo coste: su tamaño reducido permite desplegarlo en plataformas robóticas con GPUs de consumo, como las basadas en Jetson o RTX, facilitando prototipos rápidos.
- Comparación de líneas base en manipulación táctil: al ser una variante de solo visión, se puede usar como referencia para evaluar el beneficio de añadir sensores táctiles en la misma tarea.
- Educación y formación en robótica: los estudiantes pueden cargar el modelo en un simulador o robot real para practicar el control de políticas VLA sin necesidad de infraestructura costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se realizó evaluación en robot real (no había robot en la máquina de entrenamiento) y que la pérdida de entrenamiento no es un proxy del éxito de la tarea. Por tanto, no hay métricas de rendimiento como tasa de éxito o precisión de manipulación.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 450M parámetros en bf16, el modelo ocupa aproximadamente 900 MB en memoria, pero con el overhead de la librería y las imágenes, se recomienda al menos 4-8 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM, como NVIDIA RTX 4060, RTX 3060, o GPUs de datacenter como A10 o A100. El entrenamiento se realizó en AMD MI300X, pero la inferencia es compatible con CUDA.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo como la RTX 4060 (8 GB) según el repositorio de fine-tuning de SmolVLA.
- Opciones de despliegue: se puede cargar mediante la librería LeRobot (`lerobot`), que soporta la carga de políticas y la ejecución en robots reales o simulados. No se mencionan opciones como vLLM u Ollama, ya que no es un modelo de lenguaje generativo estándar.
- Latencia y throughput: no disponibles. Depende del hardware y del número de pasos de acción predichos (50).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| smolvla_vision_charger_50ep (este) | 450M | No disponible | Apache-2.0 | Hugging Face |
| SmolVLA base (lerobot/smolvla_base) | 450M | No disponible | Apache-2.0 | Hugging Face |
| OpenVLA (7B) | 7B | No disponible | MIT | Hugging Face |
| RT-2 (55B) | 55B | No disponible | No abierta | No disponible |

SmolVLA se destaca por su tamaño reducido frente a alternativas como OpenVLA (7B) o RT-2 (55B), lo que permite su ejecución en hardware de consumo. Sin embargo, no se dispone de datos comparativos de rendimiento en tareas de manipulación para este ajuste específico. La licencia Apache-2.0 facilita el uso comercial y la modificación.

## Limitaciones y advertencias

- No se ha evaluado en un robot real: el autor no realizó rollout, por lo que el rendimiento real en el mundo físico es desconocido.
- Sobreajuste potencial: entrenado con solo 50 episodios, el modelo puede memorizar la demostración y fallar ante variaciones en la posición de los objetos o condiciones de iluminación.
- Dependencia de la instrucción exacta: la tarea fue retagged; si se usa una instrucción diferente, el modelo puede no comportarse correctamente.
- Requiere el `rename_map` específico en inferencia: sin él, el modelo reporta características faltantes (`camera1`/`camera2`).
- Solo visión: al no usar datos táctiles, puede tener dificultades con tareas que requieren percepción de fuerza o contacto fino.
- Sesgos del dataset: el dataset proviene de una sesión de grabación concreta; puede no generalizar a otros entornos o configuraciones de cámara.
- Limitaciones de idioma: la instrucción está en inglés; no se ha probado con otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dimios45/smolvla_vision_charger_50ep
- Dataset de entrenamiento: https://huggingface.co/datasets/aryankakad/tactile_charger_inserting
- Modelo base SmolVLA: https://huggingface.co/lerobot/smolvla_base
- Blog de SmolVLA en Hugging Face: https://huggingface.co/blog/smolvla
- Paper de SmolVLA (arXiv): https://arxiv.org/html/2506.01844v1
- Repositorio LeFlexiTac: https://github.com/TNA001-AI/lerobot_tactile
- Documentación de LeFlexiTac: https://tna001-ai.github.io/LeFlexiTac/docs.html
- Ejemplo de fine-tuning en RTX 4060: https://github.com/wycliffeoleti/smolVLA
