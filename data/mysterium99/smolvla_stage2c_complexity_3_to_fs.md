# mysterium99/smolvla_stage2c_complexity_3_to_fs

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots reales mediante imitación. Esta ficha concreta corresponde a un fine-tuning del modelo base `lerobot/smolvla_base` publicado por el usuario `mysterium99`, entrenado sobre el dataset `fs` para la tarea específica de recoger un perno y depositarlo en un cubo. El modelo consume el estado articular del robot (6 dimensiones) y tres cámaras RGB de 256x256, y produce un vector de acción de 6 dimensiones.

El modelo resuelve el problema de desplegar políticas robóticas de manipulación en hardware de consumo: con 450 millones de parámetros y un repositorio de 0,9 GB, puede ejecutarse en GPUs asequibles, a diferencia de los VLA de gran escala que requieren aceleradores de centro de datos. La arquitectura combina un codificador visual-lenguaje compacto con un decodificador de acciones, y el entrenamiento se realizó por imitación supervisada sobre 26 episodios y 38.356 fotogramas a 30 FPS.

Es relevante ahora porque demuestra el flujo completo de LeRobot: partir de un modelo base preentrenado y adaptarlo a una tarea concreta con pocos datos. No obstante, se trata de un artefacto de investigación con un único dataset y sin evaluación publicada, por lo que su utilidad práctica está acotada al robot y al entorno exactos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) compacta, segun SmolVLA (arXiv:2506.01844) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (modelo orientado a instrucciones de tarea en robotica) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `lerobot/smolvla_base`, que implementa la arquitectura SmolVLA descrita en el articulo arXiv:2506.01844: un modelo de visión-lenguaje-acción compacto que procesa observaciones multimodales (imágenes de cámaras e instrucción de tarea en lenguaje natural) junto con el estado propioceptivo del robot, y genera acciones de control de forma directa. La política está configurada para un robot de tipo `follower` con tres cámaras (`gripper`, `newtop`, `newside`), estado de 6 dimensiones y salida de acción de 6 dimensiones.

El entrenamiento se realizó por imitación supervisada sobre el dataset `fs`, compuesto por 26 episodios y 38.356 fotogramas a 30 FPS para la tarea "Pick up the bolt and put it in the bucket". La configuración reportada incluye 20.000 pasos de entrenamiento, batch size de 8, optimizador AdamW, learning rate de 1e-4, semilla 0 y LeRobot 0.6.1. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineamiento, ni el volumen de datos de preentrenamiento del modelo base.

## Capacidades

- Control robótico de manipulación por imitación: genera acciones de 6 dimensiones a partir de estado articular e imágenes.
- Percepción visual multivista: procesa tres cámaras simultáneas de 256x256 píxeles.
- Condicionamiento por instrucción de tarea en lenguaje natural (la tarea se pasa como texto al ejecutar la política).
- Ejecución en hardware de consumo gracias a su tamaño compacto (450 M de parámetros).
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No se documentan capacidades de tool calling, razonamiento multi-paso, diálogo general ni procesamiento de audio.

## Casos de uso

- Automatización de una celda de pick-and-place: el modelo recoge un perno y lo deposita en un cubo, replicando la tarea exacta del dataset de entrenamiento en un robot follower con la misma disposición de cámaras.
- Base para fine-tuning en tareas de ensamblaje: al partir de `lerobot/smolvla_base`, sirve como punto de partida para adaptar la política a nuevas piezas y contenedores con un dataset pequeño similar.
- Prototipado rápido en laboratorio: con 0,9 GB de pesos se puede iterar en estaciones de trabajo con GPU de consumo sin infraestructura dedicada.
- Validación de pipelines de imitación: útil para comprobar el flujo completo de LeRobot (grabación, entrenamiento, rollout) antes de escalar a datasets mayores.
- Investigación en aprendizaje por imitación con pocos datos: 26 episodios permiten estudiar la sensibilidad de SmolVLA al tamaño y la diversidad del dataset.
- Docencia y demostraciones de VLA: el coste computacional reducido facilita su uso en cursos y talleres de robótica con hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en FP32 los pesos ocupan aproximadamente 1,8 GB, y en FP16/BF16 alrededor de 0,9 GB, a lo que hay que sumar el coste de los tres flujos de cámara y del codificador visual.
- GPU recomendadas: no especificadas por el autor; por tamaño, una GPU de consumo con 8 GB o más debería ser suficiente para inferencia en precisión reducida.
- Cabe en GPU de consumo: probablemente sí (RTX 3060, RTX 4060, RTX 4090), aunque no hay confirmación oficial en la información disponible.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` con `--policy.path=mysterium99/smolvla_stage2c_complexity_3_to_fs`; el ecosistema LeRobot soporta entrenamiento con `lerobot-train`.
- Latencia y throughput: no disponibles; la política está pensada para control a 30 FPS, pero no se reportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mysterium99/smolvla_stage2c_complexity_3_to_fs | 450 M | no disponible | Manipulacion pick-and-place (dataset fs) | apache-2.0 | Hugging Face, 0 descargas |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | VLA general para robotica | no disponible en la informacion | Hugging Face (modelo base) |
| Otros VLA de gran escala (p. ej. OpenVLA) | no disponible en la informacion | no disponible | Manipulacion robotica general | no disponible en la informacion | no disponible |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; el único punto de referencia directo es el modelo base del que deriva.

## Limitaciones y advertencias

- Entrenado sobre un único dataset (`fs`) con 26 episodios y una sola tarea; la generalización a otras tareas, objetos o entornos no está demostrada.
- Sin resultados de evaluación publicados: no hay tasas de éxito medidas en robot real.
- Dependencia estricta de la configuración de hardware: robot tipo `follower`, tres cámaras con nombres concretos (`gripper`, `newtop`, `newside`) y estado de 6 dimensiones; cualquier cambio en la disposición o calibración puede degradar el rendimiento.
- Riesgo de sobreajuste al entorno de grabación (posiciones de objetos, iluminación, fondo) dado el reducido número de episodios.
- No se documentan sesgos ni comportamiento multilingüe; la instrucción de tarea es un texto fijo asociado al entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; es un artefacto de investigación.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.
- No apto para producción sin una evaluación previa en el robot y el entorno objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mysterium99/smolvla_stage2c_complexity_3_to_fs
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Articulo SmolVLA: https://huggingface.co/papers/2506.01844
- Guia SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=fs
