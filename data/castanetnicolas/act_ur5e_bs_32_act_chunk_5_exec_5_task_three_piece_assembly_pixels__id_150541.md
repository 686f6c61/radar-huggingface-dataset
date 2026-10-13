# castanetnicolas/ACT_UR5e_BS_32_Act_Chunk_5_Exec_5_TASK_three_piece_assembly_PIXELS__ID_150541

## Resumen

ACT_UR5e_BS_32_Act_Chunk_5_Exec_5_TASK_three_piece_assembly_PIXELS es una política de imitación (policy) entrenada con LeRobot y publicada por el usuario castanetnicolas en HuggingFace. No es un modelo de lenguaje: es un controlador visomotor para robótica que implementa el método Action Chunking with Transformers (ACT), descrito en el artículo arXiv:2304.13705. La política recibe el estado del robot (vector de 9 dimensiones) y dos cámaras RGB de 84x84 píxeles, y devuelve un vector de acción de 7 dimensiones.

El modelo resuelve una tarea concreta de ensamblaje: insertar la primera pieza en la base e insertar la segunda pieza encima de la primera. Se entrenó sobre el dataset castanetnicolas/mimicgen_three_piece_assembly_d1_image84, con 200 episodios, 67.101 fotogramas y una frecuencia de captura de 20 FPS, generado con MimicGen. El nombre del repositorio indica un batch size de 32, un chunk de acciones de 5 y una ejecución de 5 acciones por inferencia, además de observaciones en píxeles ("PIXELS").

Su relevancia es práctica: sirve como punto de partida reproducible para experimentos de aprendizaje por imitación en manipulación robótica con LeRobot 0.6.1, y como referencia para comparar configuraciones de chunking. El tamaño es reducido (51.575.431 parámetros, unos 0,2 GB de repositorio), por lo que se puede ejecutar en hardware de consumo. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con CVAE, método ACT (Action Chunking with Transformers) |
| Parametros totales | 51.575.431 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no es un modelo de lenguaje. Usa una ventana de observación fija y predice chunks de acciones (el nombre del repositorio sugiere chunk de 5 y ejecución de 5) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; pesos en precisión completa) |
| Idiomas soportados | no disponible (modelo de robótica, no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |
| Tipo de robot declarado | panda (según model card; el nombre del repositorio menciona UR5e) |
| Entradas | observation.state (9,), observation.images.agentview (3, 84, 84), observation.images.robot0_eye_in_hand (3, 84, 84) |
| Salidas | action (7,) |
| Dataset de entrenamiento | castanetnicolas/mimicgen_three_piece_assembly_d1_image84 (200 episodios, 67.101 fotogramas, 20 FPS) |
| Pasos de entrenamiento | 300.000 |
| Optimizador / learning rate | adamw / 1e-05 |
| Batch size / semilla | 32 / 1000 |
| Versión de LeRobot | 0.6.1 |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos cortos de acciones (action chunks) en lugar de un único paso de acción. La arquitectura combina un codificador visual (típicamente una ResNet sobre las imágenes de cámara) con un transformer encoder-decoder, y se entrena de forma similar a un CVAE: un codificador de estilo toma la secuencia de acciones de la demostración durante el entrenamiento y se sustituye por el prior en inferencia. La salida es una secuencia de acciones de dimensión 7 (típicamente posición cartesiana y estado de la pinza), en lugar de una sola acción, lo que reduce el error de acumulación y produce movimientos más suaves. En este caso, el identificador del repositorio apunta a un chunk de 5 acciones y una ejecución de 5, es decir, sin solapamiento entre chunks.

No se dispone de información sobre el número de tokens o muestras de imagen procesadas, la composición exacta del dataset más allá de los 200 episodios y 67.101 fotogramas de la tarea de ensamblaje, ni sobre el uso de RLHF o DPO (no aplicable a este tipo de modelo). La configuración de entrenamiento documentada es de 300.000 pasos con AdamW, learning rate 1e-5, batch size 32 y semilla 1000, ejecutada con LeRobot 0.6.1. El dataset de origen es una variante de MimicGen con imágenes a 84x84 píxeles, lo que implica que la política depende de observaciones de baja resolución y de dos vistas (agentview y robot0_eye_in_hand).

## Capacidades

- Generación de acciones de control continuo de 7 dimensiones a partir de estado y visión.
- Manipulación robótica de precisión: ensamblaje de dos piezas (inserción secuencial sobre una base).
- Percepción visomotora con dos cámaras: vista externa (agentview) y vista en la muñeca del robot (eye_in_hand), a 84x84 píxeles.
- Predicción de chunks de acciones, lo que permite trayectorias más estables que el control paso a paso.
- Ejecución autónoma en bucle cerrado durante un tiempo configurable (por ejemplo, 60 segundos mediante lerobot-rollout).
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingües ni procesamiento de lenguaje natural: la instrucción de tarea se pasa como texto fijo a la CLI, no como entrada del modelo.
- No se documentan capacidades de visión general, audio ni modo "thinking".

## Casos de uso

- Ensamblaje automatizado de dos piezas: es exactamente la tarea entrenada; se puede desplegar en un banco de montaje para insertar una pieza en la base y una segunda encima, con una tasa de éxito por determinar empíricamente.
- Banco de pruebas de aprendizaje por imitación: sirve para reproducir el flujo completo de LeRobot (grabación de datos, entrenamiento con lerobot-train y despliegue con lerobot-rollout) sin necesidad de generar un dataset propio.
- Comparación de hiperparámetros de chunking: al fijar chunk 5 y ejecución 5 en el nombre del repositorio, es una referencia útil para medir el efecto de variar el tamaño de chunk sobre la suavidad y la latencia de control.
- Validación de pipelines de teleoperación y calibración: permite verificar que las cámaras, el puerto del robot y los nombres de las observaciones coinciden con los del entrenamiento antes de invertir tiempo en un dataset mayor.
- Investigación en generalización de políticas visuales: entrenada con imágenes de 84x84, es adecuada para estudiar robustez frente a cambios de iluminación, posición de objetos o distractores en un entorno simulado tipo MimicGen.
- Docencia y prototipado en robótica: al ocupar 0,2 GB y 51,5 M de parámetros, se puede cargar en un portátil con GPU de gama media para demostraciones en clase o talleres.
- Reentrenamiento con datos propios: la receta documentada (adamw, lr 1e-5, batch 32, 300.000 pasos) sirve como punto de partida razonable para ajustar la política a una celda de trabajo distinta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye una sección de evaluación sin rellenar, con la indicación explícita de que no se han proporcionado resultados para esta política. No hay datos de tasa de éxito, número de ensayos, MMLU, HumanEval, GSM8K ni métricas equivalentes, que por otra parte no aplican a un modelo de robótica. Tampoco se documentan latencia ni throughput de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 51,5 millones de parámetros en precisión completa, los pesos ocupan del orden de 200 MB, por lo que se puede esperar un uso de VRAM de aproximadamente 0,5 a 2 GB incluyendo activaciones y buffers de imagen (estimación, no dato publicado).
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM es suficiente en la práctica; una RTX 3060, RTX 4070 o RTX 4090 es más que adecuada. También cabe en CPU, aunque con mayor latencia.
- Cabe en GPU de consumo: sí, con margen amplio, dado el reducido tamaño del modelo.
- Opciones de despliegue: LeRobot (cliente oficial, comando lerobot-rollout con --policy.path), PyTorch con safetensors. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una política de control robótico.
- Latencia y throughput: no disponibles. La frecuencia de control está limitada por la captura del dataset (20 FPS) y por el coste de inferencia de las dos cámaras a 84x84, pero no se publican medidas.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks que permitan una comparación cuantitativa. La comparación siguiente es cualitativa y se limita a categoría, enfoque y licencia; los datos de rendimiento de las alternativas no están disponibles en la información proporcionada.

| Modelo | Categoría | Enfoque | Tarea | Licencia | Parametros |
|---|---|---|---|---|---|
| Este modelo (ACT three_piece_assembly) | Política visomotora | ACT con chunk de acciones | Ensamblaje de dos piezas sobre base | apache-2.0 | 51,5 M |
| ACT original (Zhao et al., 2023) | Política visomotora | ACT con chunk de acciones y ensembling temporal | Manipulación bimanual de precisión | no disponible en la información proporcionada | no disponible |
| Diffusion Policy (Chi et al., 2023) | Política visomotora | Difusión sobre secuencias de acción | Manipulación desde demostraciones | no disponible en la información proporcionada | no disponible |
| Otras políticas publicadas en LeRobot Hub | Política visomotora | ACT, diffusion, VLA | Manipulación variada | variable (frecuentemente apache-2.0) | variable |

## Limitaciones y advertencias

- Modelo de propósito único: está entrenado exclusivamente para la tarea "Insert the first piece into the base, then insert the second piece on top of it". Fuera de esa tarea no cabe esperar un comportamiento útil.
- Cero evaluaciones publicadas: no hay tasa de éxito medida, ni en simulación ni en robot real. Cualquier uso en producción exige una validación propia con múltiples ensayos.
- Discrepancia en el tipo de robot: el nombre del repositorio menciona UR5e, mientras que la model card declara robot type panda. Es necesario verificar la plataforma antes de desplegarlo.
- Dependencia de las cámaras y sus nombres: la política espera exactamente las claves observation.images.agentview y observation.images.robot0_eye_in_hand, con imágenes de 84x84. Cambiar resolución, cámara o punto de vista degrada el rendimiento.
- Sensibilidad al entorno: al entrenarse con imágenes de 84x84 y 200 episodios, es previsible que la generalización sea limitada ante cambios de iluminación, fondo, posición inicial de las piezas o presencia de distractores. No se han publicado estudios de robustez.
- Riesgo de fallo silencioso: en robótica, una política que falla puede provocar colisiones o daños en el efector. Se recomienda limitar fuerzas, usar paradas de emergencia y supervisión humana.
- Sin capacidades lingüísticas ni de razonamiento simbólico: no admite instrucciones en lenguaje natural como entrada ni tool calling.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar avisos de copyright y licencia. No se declaran restricciones adicionales, pero conviene revisar la licencia del dataset de origen (MimicGen y el dataset del usuario) antes de un uso comercial.
- Datos de entrenamiento sintéticos o generados con MimicGen: conviene comprobar las condiciones de uso del dataset asociado.
- Los resultados de la búsqueda web realizada no contienen información relevante sobre este modelo (los enlaces devueltos corresponden a la plataforma de streaming Twitch y no guardan relación).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_32_Act_Chunk_5_Exec_5_TASK_three_piece_assembly_PIXELS__ID_150541
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/mimicgen_three_piece_assembly_d1_image84
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/mimicgen_three_piece_assembly_d1_image84
- Artículo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
