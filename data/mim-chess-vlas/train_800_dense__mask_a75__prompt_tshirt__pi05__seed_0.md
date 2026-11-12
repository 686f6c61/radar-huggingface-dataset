# mim-chess-vlas/train_800_dense__mask_a75__prompt_tshirt__pi05__seed_0

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo visión-lenguaje-acción π₀.₅ (Pi05) de Physical Intelligence, adaptado mediante la librería LeRobot de Hugging Face para una tarea robótica concreta: doblar una camiseta. El modelo base, `lerobot/pi05_base`, es una evolución de π₀ orientada a la generalización en entornos abiertos, es decir, a ejecutar tareas en situaciones y configuraciones no vistas durante el entrenamiento. El ajuste se ha realizado sobre un conjunto de datos propio del autor `mim-chess-vlas`, con 637 episodios y 168.815 fotogramas capturados a 20 FPS.

El modelo resultante es una política de imitación (imitation learning) que consume observaciones del robot —estado articular de 9 dimensiones y tres cámaras RGB de 224×224— y produce un vector de acción de 7 dimensiones. Está pensado para un robot tipo `Panda` con tres vistas de cámara: `agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`. La relevancia de este repositorio es doble: por un lado, demuestra el flujo completo de ajuste fino de π₀.₅ con LeRobot; por otro, sirve como ejemplo reproducible de cómo adaptar un modelo VLA de propósito general a una tarea manipulativa específica.

El modelo tiene 4.143.404.816 parámetros (aproximadamente 4,14 mil millones), se distribuye en formato safetensors con un tamaño de repositorio de 9,4 GB y está publicado bajo licencia Apache 2.0. No se han publicado resultados de evaluación en la información disponible, por lo que su rendimiento real en la tarea de doblar camisetas no está documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05); implementación LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico; no se documentan idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del VLA π₀.₅ de Physical Intelligence, que a su vez evoluciona π₀ para mejorar la generalización en entornos abiertos. La implementación utilizada es la de LeRobot, adaptada del repositorio OpenPI del autor original. La política consume observaciones multimodales (estado del robot de 9 dimensiones y tres imágenes RGB de 224×224 píxeles) y emite acciones continuas de 7 dimensiones, siguiendo el paradigma de imitación supervisada típico de los modelos VLA. No se detalla en la información disponible la composición interna exacta (número de capas, mecanismo de atención, codificador visual, etc.).

El entrenamiento se realizó sobre el dataset `mim-chess-vlas/train_800_dense__mask__overlay_a75__sim__all_cameras__live__prompt_tshirt`, con 637 episodios y 168.815 fotogramas a 20 FPS, para la tarea "Fold the t-shirt". La configuración reportada incluye 60.000 pasos de entrenamiento, batch size de 16, optimizador AdamW, learning rate de 5e-05, semilla 0 y LeRobot versión 0.6.0. No se especifica en la información proporcionada si hubo RLHF, DPO u otras fases de alineación, ni el número total de tokens de entrenamiento (dato no aplicable en el mismo sentido que en modelos de lenguaje, al tratarse de datos de interacción robótica).

## Capacidades

- Control robótico de manipulación: genera acciones de 7 dimensiones a partir de estado articular e imágenes, orientado a tareas de manipulación como doblar ropa.
- Percepción visual multimodal: procesa tres cámaras simultáneas (`agentview` y dos cámaras en la mano del robot), lo que permite razonar sobre la escena y sobre la propia pinza.
- Ejecución de tareas guiada por instrucción: la tarea se especifica mediante el prompt "Fold the t-shirt" en el comando de despliegue.
- Política de imitación entrenada de extremo a extremo: no requiere planificación simbólica explícita; mapea observaciones a acciones directamente.
- Integración con el ecosistema LeRobot: compatible con `lerobot-rollout` y `lerobot-train` para despliegue y reentrenamiento.
- Ajuste fino sobre modelo base: puede servir como punto de partida para otras tareas manipulativas mediante fine-tuning adicional.
- No se documentan capacidades de tool calling, agentes multi-paso, generación de texto libre, matemáticas ni razonamiento lingüístico general; es un modelo específicamente robótico.

## Casos de uso

- Automatización de doblado de ropa en entornos controlados: el modelo está entrenado específicamente para "Fold the t-shirt" con un robot Panda; se usaría con `lerobot-rollout` y las tres cámaras configuradas para ejecutar la tarea de forma autónoma durante una duración determinada.
- Investigación en imitación robótica: sirve como referencia reproducible para estudiar cómo un VLA preentrenado se adapta a una tarea concreta con 637 episodios y 60.000 pasos de entrenamiento.
- Base para fine-tuning de nuevas tareas de manipulación: partiendo de este checkpoint o del base `lerobot/pi05_base`, se puede reentrenar con `lerobot-train` sobre otros datasets para tareas como plegado de otras prendas, recogida de objetos o ensamblaje.
- Evaluación de generalización de π₀.₅: al ser un ajuste fino sobre una tarea concreta, permite medir hasta qué punto el modelo base transfiere capacidades a configuraciones nuevas (posiciones de objetos, iluminación, distracciones).
- Docencia y formación en robótica de aprendizaje: el repositorio incluye guías de instalación, calibración, grabación de datos y entrenamiento, lo que lo hace útil como material práctico en cursos de imitation learning.
- Pruebas de pipelines de despliegue con LeRobot: permite validar la integración de `lerobot-rollout` con un robot Panda real y cámaras OpenCV, incluyendo la coincidencia entre nombres de cámara y claves de observación.
- Reproducción de experimentos con semilla fija: al documentarse semilla 0 y configuración completa, es útil para replicar resultados y comparar variantes de datos o hiperparámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política ("No evaluation results have been provided for this policy yet"), por lo que no hay tasas de éxito, métricas de precisión ni comparaciones numéricas que reportar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 4.143.404.816 parámetros y pesos en safetensors (tamaño de repositorio de 9,4 GB, que incluye posibles ficheros adicionales), una estimación orientativa en precisión completa ronda los 16 GB solo para pesos; en fp16/bf16 bajaría a unos 8-9 GB, y con cuantización de 8 bits a unos 4-5 GB. Estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del modelo, una GPU con 16-24 GB de VRAM (por ejemplo, RTX 4090, A100 40 GB, H100) sería razonable para inferencia en fp16, pero no se confirma en la documentación.
- ¿Cabe en GPU de consumo? Probablemente sí en fp16 en GPUs de gama alta con 16 GB o más, pero no se documenta oficialmente.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para reentrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de política robótica de este tipo.
- Latencia y throughput: no disponibles. El dataset se grabó a 20 FPS, lo que sugiere que el bucle de control debe operar en ese orden de frecuencia, pero no se publican mediciones de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (π₀.₅ fine-tuned, tarea camiseta) | 4.143.404.816 | no disponible | Doblado de camiseta con Panda | Apache 2.0 | Hugging Face (LeRobot) |
| `lerobot/pi05_base` | no disponible en la información | no disponible | VLA generalista (base para fine-tuning) | no disponible en la información | Hugging Face (LeRobot) |
| π₀ (Physical Intelligence) | no disponible en la información | no disponible | VLA generalista | no disponible en la información | OpenPI (open source) |

No se dispone de datos suficientes en la información proporcionada para comparar parámetros, contexto, rendimiento o licencia de alternativas como π₀, OpenVLA, RT-2 u otros VLA. La comparación queda limitada al modelo base del que deriva.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está ajustado exclusivamente para la tarea "Fold the t-shirt" con un robot Panda y tres cámaras concretas; no es un modelo de propósito general y probablemente fallará fuera de esa configuración.
- Dependencia de la configuración de hardware: los nombres de cámara (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) y el tipo de robot deben coincidir exactamente con los del entrenamiento; cualquier cambio requiere reentrenamiento o adaptación.
- Sin evaluación publicada: no hay tasas de éxito ni métricas de robustez, por lo que no se puede afirmar su fiabilidad en producción.
- Riesgo de sobreajuste al dataset: con 637 episodios y una única tarea, la generalización a posiciones, iluminación o distracciones nuevas no está validada.
- Sesgos y alucinaciones: no se documentan sesgos específicos, pero al ser un modelo de imitación puede reproducir sesgos presentes en las demostraciones humanas; el riesgo de "alucinación" en el sentido de acciones incorrectas existe y no está cuantificado.
- Limitaciones de idioma: no aplica en el sentido habitual; el prompt de tarea es en inglés ("Fold the t-shirt") y no se documenta soporte multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las licencias del modelo base (`lerobot/pi05_base`) y de los datos de entrenamiento, que no se detallan completamente en la información disponible.
- Fecha de creación futura en los metadatos (2026-11-11): conviene verificar la procedencia y vigencia del repositorio antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mim-chess-vlas/train_800_dense__mask_a75__prompt_tshirt__pi05__seed_0
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_800_dense__mask__overlay_a75__sim__all_cameras__live__prompt_tshirt
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mim-chess-vlas/train_800_dense__mask__overlay_a75__sim__all_cameras__live__prompt_tshirt
