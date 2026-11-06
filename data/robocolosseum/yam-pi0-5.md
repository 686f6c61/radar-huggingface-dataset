# RoboColosseum/yam-pi0.5

## Resumen

`RoboColosseum/yam-pi0.5` es un ajuste fino (fine-tuning) del modelo base `lerobot/pi05_base`, un modelo de política visomotora (vision-language-action, VLA) para robótica. Lo desarrolla el usuario RoboColosseum y está especializado en manipulación bimanual sobre el conjunto de datos `allenai/MolmoAct2-BimanualYAM-Dataset`. El modelo toma tres cámaras (vista superior, izquierda y derecha) y produce acciones de 14 dimensiones (articulaciones absolutas más pinzas), en trozos (chunks) de 30 pasos a 30 Hz.

La relevancia de este checkpoint es doble: por un lado, demuestra el flujo de trabajo de LeRobot para adaptar un VLA generalista a un robot concreto (YAM bimanual); por otro, publica el VLM sin congelar (`freeze_vision_encoder=false`, `train_expert_only=false`), lo que implica que tanto el codificador visual como el experto de acción se han entrenado sobre el dataset específico. Con 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y pesos en safetensors, es un modelo de tamaño medio que no cabe en GPUs de consumo para entrenamiento, pero sí es viable para inferencia cuantizada.

El modelo está pensado para investigación en robótica y para despliegues experimentales, no para producción generalista. Su licencia Apache 2.0 facilita el uso comercial, aunque las capacidades reales están acotadas al dominio del dataset de entrenamiento (manipulación bimanual con la plataforma YAM).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en π₀.₅, implementada en LeRobot (`PI05Policy`) |
| Parámetros totales | 4.143.404.816 (≈4,14 B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (modelo orientado a acciones robóticas; el componente lingüístico del VLM base no se detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π₀.₅, un VLA que combina un modelo visión-lenguaje con un experto de acción que genera secuencias de comandos motores. En este checkpoint, el VLM no está congelado: el codificador visual y el experto se entrenan conjuntamente (`freeze_vision_encoder=false`, `train_expert_only=false`). La salida es un chunk de 30 acciones a 30 Hz, con dimensión de acción 14 (articulaciones absolutas más pinzas de rango continuo [0, 1]). La entrada visual son tres cámaras en orden top → left → right.

El ajuste fino se realizó sobre `allenai/MolmoAct2-BimanualYAM-Dataset` durante 100.000 pasos de entrenamiento. No se documentan en la información disponible el número de tokens, la composición exacta del dataset, ni si hubo RLHF/DPO. Tampoco se especifican innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá de las propias de π₀.₅.

## Capacidades

- Generación de acciones robóticas bimanuales de 14 dimensiones (articulaciones absolutas + pinzas) en chunks de 30 pasos a 30 Hz.
- Percepción visomotora con tres cámaras simultáneas (top, left, right).
- Control continuo de pinzas en rango [0, 1].
- Integración nativa con LeRobot mediante `PI05Policy` y `make_pre_post_processors`.
- Ajuste fino sobre un VLM no congelado, lo que permite adaptación conjunta de percepción y acción.
- Capacidades de razonamiento lingüístico y tool calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión general o audio: no disponible en la información proporcionada (la visión aquí es específica de las cámaras del robot).

## Casos de uso

- Manipulación bimanual en investigación: el modelo genera comandos de 14 dimensiones para dos brazos con pinzas, adecuado para tareas de ensamblaje o manipulación coordinada en laboratorio con la plataforma YAM.
- Recolección de datos y evaluación de políticas: sirve como política de referencia para comparar contra otros checkpoints ajustados sobre el mismo dataset, gracias a su métrica de open-loop smoke (MSE 0.00140, MAE 0.0211).
- Prototipado en LeRobot: se integra directamente con `PI05Policy.from_pretrained` y los pre/postprocesadores de LeRobot, lo que acelera experimentos de imitación.
- Ajuste fino posterior (fine-tuning): al no tener el VLM congelado, es un punto de partida razonable para adaptar el modelo a nuevas tareas bimanuales con datos propios.
- Control a 30 Hz en lazo abierto: el chunk de 30 acciones a 30 Hz permite ejecutar secuencias de un segundo sin replanificación, útil en tareas con dinámica moderada.
- Evaluación de robustez con múltiples cámaras: el uso de tres vistas (top, left, right) permite estudiar la contribución de cada cámara a la precisión de la política.
- Despliegue experimental en robots YAM: al estar entrenado sobre el dataset MolmoAct2-BimanualYAM, es directamente aplicable a esa plataforma, con la cautela de que el rendimiento fuera de distribución no está documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta una prueba de open-loop smoke sobre 2 episodios reservados, con stride 30 y reset en cada paso:

| Métrica | Valor |
|---|---|
| MSE (open-loop smoke, 2 episodios) | 0.00140 |
| MAE (open-loop smoke, 2 episodios) | 0.0211 |

No hay comparación con modelos similares en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,14 B parámetros, en FP16 se requieren aproximadamente 8,3 GB solo para pesos, más overhead de activaciones y las tres cámaras; en FP32, unos 16,6 GB. En cuantización de 8 bits, alrededor de 4,2 GB; en 4 bits, unos 2,1 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: para FP16, una RTX 4090 (24 GB) o A100/H100 son suficientes; para FP32, se recomienda A100 40 GB o superior.
- ¿Cabe en GPU de consumo? Sí, en FP16 cabe en RTX 4090, RTX 3090 (24 GB) y potencialmente en GPUs de 16 GB con cuantización; en 8 bits podría caber en GPUs de 8-12 GB, aunque no hay validación publicada.
- Opciones de despliegue: LeRobot (`PI05Policy`), con pre/postprocesadores oficiales. No se documentan soportes para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje y no a políticas VLA.
- Latencia y throughput: no disponibles. El modelo genera chunks de 30 acciones a 30 Hz, lo que implica una ventana de ejecución de 1 segundo por chunk, pero no se publican tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `RoboColosseum/yam-pi0.5` | 4,14 B | no disponible | MSE 0.00140 / MAE 0.0211 (open-loop smoke) | Apache 2.0 | Hugging Face |
| `lerobot/pi05_base` | no disponible en la información | no disponible | no disponible | no disponible en la información | Hugging Face |
| Otros VLA bimanuales (p. ej. MolmoAct2) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada. El único punto de referencia directo es el modelo base `lerobot/pi05_base`, del que este checkpoint es un fine-tuning.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre un dataset específico de robótica, puede heredar sesgos de las condiciones de recogida (iluminación, posiciones, objetos del dataset).
- Riesgo de alucinación: en un VLA, el equivalente es la generación de acciones no válidas o fuera de distribución; no hay evaluación fuera del dataset de entrenamiento.
- Limitaciones de contexto o idioma: la longitud de contexto no está documentada; el soporte lingüístico no se especifica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base `lerobot/pi05_base` puede tener condiciones propias que conviene verificar antes de un despliegue comercial.
- Caveats para producción: el checkpoint está entrenado para la plataforma YAM con tres cámaras en un orden concreto (top → left → right); cambiar la configuración de cámaras o el robot puede degradar el rendimiento. La única evaluación publicada es un open-loop smoke sobre 2 episodios, insuficiente para garantizar robustez en lazo cerrado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- El autor del modelo card (`Jiafei1224`) y el propietario del repositorio (`RoboColosseum`) no coinciden en el identificador del checkpoint de ejemplo; conviene verificar la ruta correcta antes de cargarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RoboColosseum/yam-pi0.5
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/MolmoAct2-BimanualYAM-Dataset
- Checkpoint alternativo citado en la model card: https://huggingface.co/Jiafei1224/molmoact2-yam-pi05
- LeRobot (librería): no se proporciona enlace en la información disponible.
- Paper de π₀.₅: no disponible en la información proporcionada.
