# elijahleo/moloact_2c_4

## Resumen

MolmoAct2 es un modelo fundacional abierto de robótica desarrollado por el Allen Institute for AI (Ai2) que mapea imágenes de cámara e instrucciones en lenguaje natural a secuencias de acciones robóticas (action chunks). La implementación que nos ocupa, `elijahleo/moloact_2c_4`, es un fine-tuning del modelo base MolmoAct2 realizado con la librería LeRobot de Hugging Face sobre un dataset propio de manufactura, y publicado en el Hub con licencia Apache 2.0.

El checkpoint contiene 5.591.928.368 parámetros (aproximadamente 5,6 mil millones) en formato safetensors, con un tamaño de repositorio de 11,5 GB. El modelo consume el estado articular del robot (vector de 6 dimensiones) junto con tres flujos visuales de 480x640 píxeles procedentes de las cámaras `gripper`, `newtop` y `newside`, y produce un vector de acción de 6 dimensiones. Está especializado en tareas de manipulación de hardware en un entorno de fabricación.

Su relevancia radica en que demuestra el flujo completo de adaptación de un modelo fundacional de robótica a un dominio concreto mediante aprendizaje por imitación, con un conjunto de datos de 150 episodios y 218.964 fotogramas a 30 FPS. Es un ejemplo práctico de cómo un modelo generalista de visión-lenguaje-acción puede especializarse en tareas de pick-and-place industrial con un coste de entrenamiento moderado (20.000 pasos, batch de 8).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MolmoAct2 (modelo fundacional visión-lenguaje-acción para robótica, implementado en LeRobot) |
| Parametros totales | 5.591.928.368 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `follow` |
| Cámaras de entrada | `gripper`, `newtop`, `newside` (3 x 480 x 640) |
| Dimensión de estado | 6 |
| Dimensión de acción | 6 |
| Dataset de entrenamiento | `manufacturing_finetune` (150 episodios, 218.964 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 20.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

El modelo se basa en MolmoAct2, un modelo fundacional de robótica de Ai2 que traduce observaciones visuales e instrucciones en lenguaje a secuencias de acciones. La implementación en LeRobot soporta entrenamiento y evaluación del modelo MolmoAct2 estándar. No se dispone de detalles adicionales sobre la arquitectura interna (tipo de transformer, mecanismos de atención, componentes de visión) en la información proporcionada.

El entrenamiento se realizó mediante aprendizaje por imitación sobre el dataset `manufacturing_finetune`, compuesto por 150 episodios y 218.964 fotogramas capturados a 30 FPS. Las tareas cubiertas son "Take hardware from human and put in taped area", "put nuts in red cup and bolts in blue bucket" y "Put all hardware in bucket". La configuración empleó 20.000 pasos de entrenamiento con AdamW, learning rate de 1e-05, batch size de 8 y semilla 1000, sobre LeRobot 0.6.1. No se especifica si hubo RLHF, DPO ni detalles sobre la composición del dataset más allá de las tareas descritas.

## Capacidades

- Generación de secuencias de acción robótica (action chunks) de 6 dimensiones a partir de observaciones multimodales.
- Fusión de tres flujos de cámara (gripper, vista superior y vista lateral) con el estado articular del robot.
- Seguimiento de instrucciones en lenguaje natural para tareas de manipulación (las tareas del dataset están en inglés).
- Manipulación de objetos de ferretería y hardware: recogida, clasificación y colocación en contenedores.
- Interacción mano a mano con un humano (tarea "Take hardware from human").
- Ejecución en bucle cerrado sobre robot real mediante `lerobot-rollout`.
- No se ha documentado soporte de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Clasificación de tornillería en línea de montaje: el modelo distingue tuercas y tornillos y los deposita en el recipiente correspondiente (copa roja o cubo azul), usando las tres vistas para resolver oclusiones.
- Recepción de piezas de un operario: la política "Take hardware from human and put in taped area" permite que el robot recoja hardware entregado manualmente y lo deposite en una zona delimitada con cinta.
- Alimentación de contenedores en kitting: la tarea "Put all hardware in bucket" automatiza el llenado de un cubo con piezas sueltas, adecuada para preparación de kits.
- Prototipado rápido de políticas de manipulación: al estar entrenado con LeRobot 0.6.1, sirve como punto de partida para fine-tuning en nuevas tareas de manufactura con pocos episodios (150 en este caso).
- Investigación en aprendizaje por imitación: permite reproducir el pipeline completo (grabación, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`) y comparar variantes de MolmoAct2.
- Validación de setups de cámaras en robots tipo `follow`: el checkpoint exige tres cámaras con nombres e índices concretos, lo que lo convierte en una referencia para calibrar configuraciones multicámara.
- Demostraciones de manipulación en entornos controlados: útil para vídeos de validación y pruebas de integración antes de desplegar en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito, latencias ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 5,59 mil millones de parámetros, en FP16 se requieren aproximadamente 11,2 GB solo para pesos; en BF16 similar; en cuantización de 8 bits, unos 5,6 GB; en 4 bits, unos 2,8 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU con 16-24 GB (RTX 4090, A100 40 GB, L40S) es un punto de partida razonable para FP16; para cuantización, GPUs de 8-12 GB podrían ser suficientes.
- Compatibilidad con GPU de consumo: probable en RTX 4090 (24 GB) en FP16 y en GPUs de 8-12 GB con cuantización, aunque no está verificado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento) con backend CUDA. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para un modelo de política robótica de este tipo.
- Latencia y throughput: no disponibles. El modelo opera a 30 FPS en el dataset de entrenamiento, pero no se ha publicado la latencia real de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `elijahleo/moloact_2c_4` (MolmoAct2 fine-tuned) | 5,59 B | no disponible | Manipulación de hardware en manufactura | Apache 2.0 | Hugging Face (26 descargas) |
| MolmoAct2 base (Ai2) | no disponible en la información | no disponible | Robótica generalista visión-lenguaje-acción | no disponible en la información | Blog de Ai2, implementación LeRobot |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | Manipulación por imitación | variable | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación: se desconoce la tasa de éxito real en las tareas entrenadas.
- El modelo está especializado en un dominio muy concreto (hardware de manufactura) y un robot tipo `follow`; su generalización a otras tareas, objetos o morfologías no está validada.
- Requiere exactamente tres cámaras con los nombres `gripper`, `newtop` y `newside` y una disposición física concreta; cambios de montaje pueden degradar el rendimiento.
- El estado y la acción son vectores de 6 dimensiones, lo que limita su uso a robots con esa dimensionalidad.
- El dataset de entrenamiento es pequeño (150 episodios), lo que aumenta el riesgo de sobreajuste y de fallo ante variaciones de iluminación, posiciones de objetos o distracciones.
- Las instrucciones de tarea están en inglés; no se documenta soporte multilingüe.
- Riesgo de alucinación de acciones no verificable sin evaluación; en robótica, los fallos pueden causar daños físicos, por lo que se recomienda supervisión humana y paradas de emergencia.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- La fecha de creación del repositorio (2026-10-26) es posterior a la fecha actual de referencia habitual; conviene verificar la vigencia del checkpoint antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elijahleo/moloact_2c_4
- Blog de MolmoAct2 (Ai2): https://allenai.org/blog/molmoact2
- Guía de LeRobot para MolmoAct2: https://huggingface.co/docs/lerobot/main/en/molmoact2
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Dataset de entrenamiento: https://huggingface.co/datasets/manufacturing_finetune
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=manufacturing_finetune
