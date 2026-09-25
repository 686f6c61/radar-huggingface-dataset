# rob089/smolvla_v01

## Resumen

SmolVLA v01 (rob089/smolvla_v01) es una política robótica de tipo vision-language-action (VLA) obtenida por ajuste fino del modelo base lerobot/smolvla_base sobre un dataset propio de demostraciones teleoperadas. El modelo no genera texto: consume observaciones multimodales de un robot y produce directamente comandos de acción de 6 dimensiones, por lo que se enmarca en el paradigma de imitation learning end-to-end y no en el de los LLM conversacionales. Lo publica el usuario rob089 en Hugging Face bajo licencia Apache 2.0 y con la librería LeRobot como framework de entrenamiento e inferencia.

El modelo tiene 450.046.176 parámetros reales (unos 450 M) y ocupa 0,9 GB en el repositorio, lo que lo sitúa en la categoría de VLA compactos descrita en el artículo SmolVLA (arXiv:2506.01844), que el propio autor cita como referencia del método. Esta escala reducida es relevante porque permite ejecutar la política en hardware de consumo, algo poco habitual en VLA de manipulación, que suelen requerir GPU de datacenter.

El ajuste se ha realizado específicamente para una única tarea de pick-and-place: introducir la pelota amarilla en la taza blanca y la pelota roja en la taza azul. El dataset asociado contiene 50 episodios y 52.025 fotogramas a 30 FPS, capturados con un robot SO-101 (`so_follower`) y varias cámaras. El modelo no incluye resultados de evaluación publicados, por lo que su rendimiento real en el robot no está cuantificado en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacto; política de imitación ajustada desde lerobot/smolvla_base. El artículo de referencia (arXiv:2506.01844) describe SmolVLA como un VLA compacto y eficiente; el detalle interno de capas no está en la model card |
| Parametros totales | 450.046.176 (dato real de los pesos safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. No es un modelo de lenguaje: consume observaciones (estado + imágenes) y emite acciones; no se documenta una ventana de tokens |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos safetensors (0,9 GB); no se documentan variantes GGUF, int8 o int4 |
| Idiomas soportados | No disponible. El modelo no genera lenguaje; la instrucción de tarea del dataset está en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `so_follower` (SO-101) |
| Cámaras declaradas en la model card | `wrist`, `front` |
| Entradas | `observation.state` (6,); `observation.images.camera1` (3, 256, 256); `observation.images.camera2` (3, 256, 256); `observation.images.camera3` (3, 256, 256); `observation.images.empty_camera_0` (3, 480, 640) |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | rob089/lerobot_SO101_smolVLA_balls_in_cups_20260924_155157 |
| Pasos de entrenamiento | 20.000 |
| Tamano de lote | 64 |
| Optimizador / tasa de aprendizaje | adamw / 0,0001 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.1 |
| Tamano del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

La model card identifica el modelo como una política SmolVLA y enlaza el artículo arXiv:2506.01844, que define SmolVLA como un modelo vision-language-action compacto y eficiente, con rendimiento competitivo a coste computacional reducido y desplegable en hardware de consumo. No se detallan en la información proporcionada el número de capas, la dimensión oculta, el codificador visual ni el mecanismo exacto de generación de acciones del modelo base, por lo que esos datos deben consultarse en el artículo y en la model card de lerobot/smolvla_base.

En cuanto al entrenamiento, se trata de un ajuste fino supervisado (imitation learning) desde lerobot/smolvla_base, ejecutado con LeRobot 0.6.1 durante 20.000 pasos, con lote de 64, optimizador AdamW, tasa de aprendizaje 1e-4 y semilla 1000. Los datos son teleoperaciones sobre un robot SO-101 en una tarea única, con 50 episodios, 52.025 fotogramas a 30 FPS y la instrucción "Put the yellow ball inside the white cup and the red ball inside the blue cup". No se documenta el uso de RLHF, DPO ni ninguna fase de alineación, lo cual es esperable en un modelo de acción y no de lenguaje.

## Capacidades

- Control robótico por imitación: genera acciones de 6 grados de libertad (`action` de forma (6,)) a partir del estado del robot y de imágenes, sin planificación simbólica intermedia.
- Manipulación pick-and-place: la política está entrenada para colocar la pelota amarilla en la taza blanca y la pelota roja en la taza azul.
- Fusión multimodal: combina estado propioceptivo de 6 dimensiones con hasta cuatro flujos de imagen (tres a 256x256 y uno a 480x640).
- Condicionamiento por instrucción de tarea: acepta el texto de la tarea como entrada en tiempo de ejecución mediante el parámetro `--task` de LeRobot, aunque el modelo está especializado en la tarea del dataset.
- Inferencia en hardware de consumo: el tamaño de 450 M de parámetros permite ejecución local sin GPU de datacenter.
- Tool calling / function calling: no disponible (no es un LLM y no expone API de herramientas).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplica; el modelo no produce texto.
- Capacidades especiales: no se documentan modo de razonamiento (thinking), audio ni visión de propósito general más allá del uso de imágenes como observación.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política ejecuta la secuencia completa de agarre y colocación de objetos pequeños sobre un SO-101, usando la cámara de muñeca para el control fino del efector y la cámara frontal para la localización de las tazas.
- Fine-tuning sobre nuevos objetos o contenedores: el modelo sirve como punto de partida (partiendo de lerobot/smolvla_base o de este checkpoint) para reentrenar con un dataset propio de 50 episodios y 20.000 pasos, replicando la receta documentada.
- Banco de pruebas de imitation learning: permite medir el efecto de variaciones en número de cámaras, resolución (256x256 frente a 480x640) o tasa de fotogramas sobre la tasa de éxito en una tarea acotada y reproducible.
- Recolección de datos con LeRobot: el mismo pipeline (`lerobot-rollout`, `lerobot-train`) y el dataset asociado sirven para generar más episodios y ampliar la distribución de posiciones de pelotas y tazas.
- Demostración educativa de VLA: en docencia o divulgación, el modelo ilustra de extremo a extremo el flujo teleoperación, entrenamiento y despliegue de una política neuronal en un robot de bajo coste.
- Investigación en robustez a condiciones de cámara: al depender de cuatro flujos visuales, es un caso útil para estudiar sensibilidad a cambios de iluminación, oclusiones o cámaras ausentes (`empty_camera_0`).
- Clasificación y separación de objetos por color: la tarea implica distinguir dos objetos por color y asociarlos a dos receptáculos distintos, lo que se puede reutilizar como base para tareas de sorting sencillas.
- Integración en pipelines de evaluación continua: la política se puede lanzar con `--duration` acotado para protocolos de éxito/fracaso repetidos y registrar tasas de acierto por configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks ni de evaluación en robot en la información disponible. La model card incluye explícitamente la línea "_No evaluation results have been provided for this policy yet_", y no hay tabla de tasas de éxito por tarea, número de intentos ni condiciones de dificultad. El artículo de referencia (arXiv:2506.01844) contiene resultados del modelo SmolVLA base, pero esos datos no corresponden a este ajuste fino concreto.

## Requisitos de hardware

- VRAM estimada: alrededor de 1,8 GB en fp32, 0,9 GB en bf16 y 0,45 GB en int8 solo para los pesos (estimación a partir de los 450 M de parámetros; no confirmada en la model card, que no documenta cuantizaciones).
- VRAM recomendada en la práctica: 4-6 GB o más, para acomodar pesos, activaciones y los búferes de las cuatro cámaras (tres a 3x256x256 y una a 3x480x640).
- GPU: cualquier NVIDIA con soporte CUDA y al menos 4 GB (por ejemplo RTX 3050, GTX 1660, RTX 4060). Con RTX 4090, A100 o H100 sobra capacidad; estas GPU solo se justifican por entrenamiento, no por inferencia.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU discretas modernas y en muchas integradas con suficiente memoria compartida, según la afirmación de la model card sobre despliegue en hardware de consumo.
- Opciones de despliegue: la librería LeRobot, con los comandos `lerobot-rollout` (inferencia sobre el robot) y `lerobot-train` (entrenamiento o ajuste fino), con `--policy.device=cuda` en entrenamiento. No aplican vLLM, TGI, Ollama ni llama.cpp, ya que no es un modelo de lenguaje de texto ni se publican pesos GGUF.
- Requisito de tiempo real: el dataset se grabó a 30 FPS, por lo que la política debe inferir a esa frecuencia o superior para reproducir la dinámica de control observada; no se documentan valores medidos de latencia ni de throughput.
- Almacenamiento: 0,9 GB para el repositorio del modelo, más el dataset asociado.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Benchmarks en la informacion disponible |
|---|---|---|---|---|
| rob089/smolvla_v01 | 450.046.176 | VLA compacto, ajuste fino para SO-101 | apache-2.0 | No disponibles |
| lerobot/smolvla_base | No disponible en la informacion proporcionada (modelo base del que deriva este) | VLA compacto preentrenado | No disponible en la informacion proporcionada | No disponibles |
| Otros VLA de manipulacion (por ejemplo OpenVLA, pi0) | No disponible en la informacion proporcionada | VLA | No disponible en la informacion proporcionada | No disponibles |

No se dispone en la información proporcionada de cifras verificables de parámetros, contexto o rendimiento de modelos alternativos, por lo que la comparación cuantitativa queda marcada como no disponible. Cualitativamente, la diferencia principal de este modelo frente a VLA de mayor tamaño es la escala (450 M) y, por tanto, la posibilidad de inferencia en GPU de consumo; a cambio, está especializado en una única tarea y no se ha evaluado públicamente.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una sola tarea y un solo montaje (pelota amarilla en taza blanca, pelota roja en taza azul) sobre un SO-101. Fuera de esa distribución de objetos, posiciones e iluminación, no hay garantía de comportamiento correcto.
- Ausencia total de evaluación: no hay tasa de éxito publicada, ni número de intentos, ni condiciones de dificultad. No se puede afirmar nada sobre su fiabilidad en producción.
- Inconsistencia en la model card: se declaran dos cámaras (`wrist`, `front`) pero las entradas listan tres cámaras (camera1, camera2, camera3) y una cuarta entrada `empty_camera_0` a 480x640. Los nombres de cámara deben coincidir con las claves de observación del entrenamiento, por lo que hay riesgo de fallo en el despliegue si no se replica exactamente la configuración.
- Dependencia del hardware y la calibración: el modelo asume el espacio de acciones y la cinemática de un `so_follower`; cambios de robot, de calibración o del efector invalidan la política.
- Riesgo de sobreajuste: 50 episodios y 52.025 fotogramas son un volumen pequeño y una única tarea; es probable que el modelo memorice posiciones de la escena de entrenamiento, aunque esto no se ha medido en la información disponible.
- Alucinación: no aplica en el sentido lingüístico, pero sí existe el equivalente conductual, con acciones plausibles pero incorrectas o inseguras (colisiones, agarres fallidos).
- Riesgo físico: es un modelo que controla actuadores reales. Debe operarse con límites de par, paradas de emergencia y supervisión humana.
- Idiomas: no aplica; si se emplea el condicionamiento por texto de tarea, la instrucción usada en el entrenamiento está en inglés.
- Licencia: Apache 2.0, permisiva para uso comercial. No obstante, hay que verificar la licencia del modelo base (lerobot/smolvla_base) y del dataset asociado, cuyo detalle no se incluye en la información proporcionada.
- Repositorio sin tracción: 0 descargas y 0 valoraciones en el momento de la consulta, y sin demo ni vídeo de despliegue.
- Búsqueda web: las consultas realizadas no devolvieron resultados relevantes sobre este modelo; el material encontrado era contenido no relacionado y sin valor técnico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rob089/smolvla_v01
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/rob089/lerobot_SO101_smolVLA_balls_in_cups_20260924_155157
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=rob089/lerobot_SO101_smolVLA_balls_in_cups_20260924_155157
- Articulo SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Imagen de arquitectura citada en la model card: https://cdn-uploads.huggingface.co/production/uploads/640e21ef3c82bd463ee5a76d/aooU0a3DMtYmy_1IWMaIM.png
