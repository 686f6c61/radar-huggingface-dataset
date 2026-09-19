# kartikbud/act_pick_v3

## Resumen

`kartikbud/act_pick_v3` es una política de robótica entrenada mediante aprendizaje por imitación con el método ACT (Action Chunking with Transformers), publicado en el artículo arXiv:2304.13705. El modelo lo desarrolla el usuario kartikbud y se distribuye a través de Hugging Face con la librería LeRobot, el framework de Hugging Face para aprendizaje automático en robótica real. Su función es controlar un brazo robótico de tipo `so_follower` a partir de dos cámaras (muñeca y cenital) y del estado articular, generando comandos de acción de 6 dimensiones para ejecutar una tarea concreta de pick-and-place.

La tarea aprendida es única y está definida textualmente como "Pick up the red cube and place it on the wooden coaster". El entrenamiento se realizó sobre el dataset `kartikbud/pick_v3`, con 100 episodios teleoperados, 29.725 fotogramas a 30 FPS, 30.000 pasos de optimización con AdamW y una tasa de aprendizaje de 1e-05. El modelo tiene 51.668.614 parámetros reales (según los pesos safetensors) y ocupa 0,2 GB en el repositorio.

Su relevancia es acotada y práctica: sirve como ejemplo reproducible de una política ACT entrenada de principio a fin con LeRobot 0.6.2, y como punto de partida para quien quiera replicar el flujo de teleoperación, entrenamiento y despliegue en un robot SO-101. No es un modelo de lenguaje ni un modelo de propósito general: es un controlador visuomotor especializado, sin resultados de evaluación publicados y con cero descargas y cero "likes" en el momento de redactar esta ficha, por lo que debe considerarse material de investigación sin validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación basada en transformer que predice chunks de acciones (arXiv:2304.13705) |
| Parametros totales | 51.668.614 (dato real extraído de los pesos safetensors) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible. La model card no declara horizonte de observación ni tamaño del chunk de acciones |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos safetensors sin variantes cuantizadas |
| Idiomas soportados | No aplica / no disponible: no es un modelo de lenguaje; la model card no declara idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `so_follower` |
| Camaras | `wrist`, `overhead` |
| Entradas | `observation.state` (6,), `observation.images.wrist` (3, 480, 640), `observation.images.overhead` (3, 480, 640) |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | kartikbud/pick_v3 (100 episodios, 29.725 fotogramas, 30 FPS) |
| Tarea | "Pick up the red cube and place it on the wooden coaster" |
| Pasos de entrenamiento | 30.000 |
| Tamano del repositorio | 0,2 GB |
| Version de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que, en lugar de predecir una única acción por paso de tiempo, predice un chunk de acciones corto. Esta formulación reduce el error de acumulación típico de las políticas paso a paso y, según el artículo de referencia, permite alcanzar tasas de éxito elevadas partiendo de datos teleoperados. La política consume el estado articular y dos flujos de imagen de 480x640 píxeles, y produce un vector de acción de 6 dimensiones por chunk. La model card no detalla el backbone visual, el número de capas del transformer, el tamaño exacto del chunk ni el uso de latente de tipo CVAE; esos datos deben consultarse en el artículo arXiv:2304.13705 y no se reproducen aquí.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `kartikbud/pick_v3`: 100 episodios, 29.725 fotogramas capturados a 30 FPS, optimizador AdamW, tasa de aprendizaje 1e-05, tamaño de lote 32 y semilla 1000, durante 30.000 pasos. No se menciona en la información disponible el uso de RLHF, DPO ni ninguna fase de ajuste posterior al entrenamiento por imitación. Tampoco se documenta ningún componente de condicionamiento por lenguaje: el runner de LeRobot acepta una cadena de tarea, pero la model card no indica que la política esté condicionada a ese texto.

## Capacidades

- Generación de comandos de acción de 6 grados de libertad para un brazo `so_follower` a partir de observaciones visuales y de estado articular.
- Percepción visual mediante dos cámaras simultáneas: una en la muñeca y otra con vista cenital, ambas a 480x640 y 30 FPS.
- Predicción por chunks de acciones, lo que permite ejecutar secuencias cortas de movimiento de forma coherente en lugar de acciones aisladas.
- Aprendizaje por imitación a partir de datos teleoperados, sin necesidad de definir recompensas ni un entorno simulador.
- Ejecución en bucle cerrado sobre hardware real mediante el comando `lerobot-rollout`.
- Ejecución acotada en el tiempo mediante el parámetro `duration` (por ejemplo, 60 segundos) o indefinida si se omite.
- Soporte de `tool calling` / `function calling`: no aplica; es una política robótica, no un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso: no aplica en el sentido cognitivo; el chunking de acciones sí implica planificación motora de corto alcance.
- Capacidades multilingües: no aplica.
- Capacidades especiales: no se documenta modo "thinking", visión general, audio ni ninguna otra modalidad fuera de las dos cámaras descritas.

## Casos de uso

- Manipulación pick-and-place en laboratorio: recoger un cubo rojo y depositarlo sobre un posavasos de madera es exactamente la tarea entrenada; sirve como banco de pruebas reproducible para comparar configuraciones de hardware o de iluminación.
- Replicación de un pipeline completo de aprendizaje por imitación: partiendo de la teleoperación con LeRobot, el entrenamiento con `lerobot-train` y el despliegue con `lerobot-rollout`, este modelo sirve como referencia de principio a fin para nuevos equipos.
- Investigación en políticas visuomotoras: al ser un ACT de 51,7 M de parámetros entrenado con 100 episodios, es adecuado para estudiar el efecto del número de demostraciones, la resolución de cámara o la posición de los sensores en la tasa de éxito.
- Automatización de tareas repetitivas de recogida en líneas de montaje ligeras o células de ensamblaje, siempre que el objeto, la iluminación y las posiciones de cámara se mantengan dentro de la distribución del dataset de entrenamiento.
- Prototipos educativos y docencia en robótica: el modelo es lo bastante pequeño (0,2 GB) para distribuirse en un aula y ejecutarse sobre un brazo de bajo coste tipo SO-101.
- Validación de infraestructura de inferencia robótica: sirve para medir latencias reales de un bucle percepción-acción a 30 FPS con dos cámaras en una GPU concreta antes de escalar a políticas mayores.
- Generación de nuevos datos y reentrenamiento iterativo: desplegar la política, registrar fallos y añadir episodios correctivos al dataset para volver a entrenar el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección de evaluación de la model card indica explícitamente: "No evaluation results have been provided for this policy yet", por lo que no existen tasas de éxito, número de ensayos ni condiciones de prueba que puedan tabularse. Tampoco se aportan métricas comparativas frente a otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 210 MB para los pesos en fp32 y unos 105 MB en fp16/bf16, calculados a partir de los 51.668.614 parámetros; a esto hay que sumar activaciones de dos imágenes de 3x480x640 por paso. La cifra exacta no está publicada.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM es suficiente en términos de memoria de pesos; no hay una GPU recomendada oficialmente en la model card.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o equivalentes con 4-8 GB de VRAM o más. No hay cifras verificadas de latencia a 30 FPS.
- Ejecución en CPU: técnicamente posible por el tamaño del modelo, pero no hay datos publicados de latencia que permitan confirmar que sostiene el bucle de control a 30 FPS.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) sobre PyTorch con `--policy.path=kartikbud/act_pick_v3`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.
- Requisitos adicionales de hardware: brazo `so_follower`, dos cámaras configuradas a 640x480 y 30 FPS con nombres que coincidan exactamente con las claves `wrist` y `overhead`, y un puerto serie accesible (`--robot.port`).

## Comparativa con modelos similares

No hay datos comparativos en la información proporcionada. La model card no incluye métricas frente a otras políticas, y las búsquedas web realizadas no devolvieron documentación técnica relevante sobre modelos de esta categoría. La tabla siguiente recoge únicamente los datos verificables del modelo y marca como no disponible todo lo que no se puede contrastar.

| Modelo | Parametros | Contexto / chunk | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kartikbud/act_pick_v3 | 51.668.614 | No disponible | No disponible | apache-2.0 | Hugging Face, 0 descargas |
| ACT de referencia (arXiv:2304.13705) | No disponible | No disponible | No disponible en la información aportada | No disponible | Paper |
| Otras políticas de LeRobot (diffusion, VLA) | No disponible | No disponible | No disponible | No disponible | Repositorio LeRobot |

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea, con un único tipo de robot y dos cámaras en posiciones concretas. Fuera de esa configuración no hay garantía de funcionamiento.
- Sin resultados de evaluación: la propia model card declara que no se han aportado resultados, por lo que se desconoce la tasa de éxito real, incluso en la tarea para la que fue entrenada.
- Sin validación de la comunidad: cero descargas y cero "likes" en el momento de redactar la ficha; no existe evidencia externa de que el modelo funcione correctamente.
- Riesgo de sobreajuste al entorno: con solo 100 episodios y 29.725 fotogramas, cambios de iluminación, de posición de los objetos, de fondo o de cámara pueden degradar el comportamiento. No hay datos de robustez publicados.
- Error de acumulación y deriva: como toda política de imitación en bucle cerrado, puede desviarse de la trayectoria aprendida y no recuperarse; es un modo de fallo motriz, no una alucinación textual.
- Dependencia de nombres de cámara: las claves de observación deben llamarse exactamente `wrist` y `overhead` y usar resolución 640x480 a 30 FPS, o la inferencia fallará.
- Limitaciones de idioma: no aplica; el modelo no procesa lenguaje. La cadena de tarea del runner es un dato de configuración, no una entrada lingüística documentada.
- Sesgos: no hay estudios de sesgo publicados. Es esperable un sesgo hacia las condiciones de recogida del dataset (posiciones, colores y geometría de los objetos concretos usados en la teleoperación).
- Licencia: apache-2.0, que permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia. Al reutilizar el modelo conviene citar también LeRobot y el artículo de ACT.
- Reproducibilidad: se documentan los hiperparámetros (30.000 pasos, lote 32, AdamW, lr 1e-05, semilla 1000) y la versión de LeRobot (0.6.2), lo que facilita la replicación, pero el dataset debe estar disponible y accesible.
- Uso responsable: no debe emplearse como controlador de seguridad en entornos con presencia humana sin capas adicionales de supervisión y parada de emergencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kartikbud/act_pick_v3
- Dataset de entrenamiento: https://huggingface.co/datasets/kartikbud/pick_v3
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kartikbud/pick_v3
- Artículo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de una política: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y despliegue: https://huggingface.co/docs/lerobot/main/en/inference
- Las búsquedas web realizadas no devolvieron enlaces técnicos relevantes sobre este modelo; los resultados obtenidos correspondían a páginas genéricas de ChatGPT y se han descartado.
