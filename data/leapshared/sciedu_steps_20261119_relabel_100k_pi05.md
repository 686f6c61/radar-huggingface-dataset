# leapshared/SciEdu_steps_20261119_relabel_100k_pi05

## Resumen

SciEdu_steps_20261119_relabel_100k_pi05 es un modelo de tipo Vision-Language-Action (VLA) orientado a robótica, publicado por el usuario leapshared en Hugging Face. Se trata de un ajuste fino (fine-tune) del modelo base lerobot/pi05_base, que a su vez es la implementación en LeRobot del π₀.₅ (Pi05) de Physical Intelligence, un modelo disenado para la generalización en entornos abiertos y la ejecución de políticas de manipulación robótica a partir de observaciones visuales y de estado.

El modelo consume tres flujos de cámara (una cámara frontal `follower_d455f` y dos cámaras de muneca, `left_wrist` y `right_wrist`) junto con un vector de estado de 16 dimensiones, y produce un vector de acción de 16 dimensiones. Está entrenado sobre el dataset SciEdu_steps_20261119_relabel, compuesto por 2915 episodios y 903 521 fotogramas a 30 FPS, con tareas centradas en experimentos de laboratorio de ciencias (manipulación de hojas, placas, minerales, reactivos químicos y componentes de microscopio).

El modelo tiene 4 143 404 816 parámetros (según los pesos en safetensors) y se distribuye bajo licencia Apache 2.0. Es relevante para quienes trabajan en imitación robótica con LeRobot, ya que ofrece una política preentrenada y ajustada para una plataforma bimanual concreta (`bi_openarm_follower`) y una batería de tareas educativas reproducibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05); implementación LeRobot |
| Parametros totales | 4 143 404 816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de lerobot/pi05_base, la adaptación en LeRobot del π₀.₅ de Physical Intelligence. π₀.₅ es un modelo Vision-Language-Action concebido para la generalización en entornos abiertos: parte de π₀ y se entrena para transferir a situaciones y entornos no vistos durante el entrenamiento. La política consume observaciones multimodales (tres cámaras RGB de 480×640 y un vector de estado de 16 dimensiones) y emite acciones de 16 dimensiones, típico de una configuración bimanual.

El ajuste fino se realizó sobre el dataset leapshared/SciEdu_steps_20261119_relabel (2915 episodios, 903 521 fotogramas a 30 FPS) con 100 000 pasos de entrenamiento, batch size 32, optimizador AdamW, learning rate 2.5e-05 y semilla 42, usando LeRobot 0.6.1. No se dispone de información sobre el número total de tokens, la composición detallada del dataset ni sobre si se aplicaron etapas de RLHF o DPO. El robot objetivo es `bi_openarm_follower` con cámaras `follower_d455f`, `left_wrist` y `right_wrist`.

## Capacidades

- Generación de acciones robóticas de manipulación a partir de observaciones visuales y de estado (política de imitación).
- Control bimanual: salida de acción de 16 dimensiones compatible con la plataforma `bi_openarm_follower`.
- Percepción multimodal con tres cámaras simultáneas (frontal y dos de muneca) a 480×640.
- Ejecución de tareas de laboratorio de ciencias: manipulación de hojas, placas metálicas, minerales, reactivos y componentes de microscopio (lista de tareas en la model card).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo de política, no de lenguaje).
- Capacidades multilingües: no disponible.
- Capacidades especiales: no disponible (no se documenta thinking mode, visión general, audio ni otras).

## Casos de uso

- Automatización de experimentos educativos de laboratorio: el modelo puede ejecutar secuencias como "rub the mineral on the streak plate" o "squeeze the dropper onto the mineral" sobre una plataforma bimanual, adecuado por su entrenamiento específico en estas tareas.
- Manipulación bimanual de precisión: tareas como "pick up the dropper by the top with the right hand" o "lower the mineral onto the iron filings and hold still" se benefician de las dos cámaras de muneca y del vector de estado de 16 dimensiones.
- Reproducción de protocolos de química: secuencias con reactivos (sulfato de sodio, carbonato de sodio, cloruro de calcio, nitrato de plomo, nitrato de plata, cloruro de bario) permiten automatizar la preparación y manipulación de muestras.
- Formación y demostración docente: el modelo puede replicar pasos de identificación de componentes de microscopio ("point at the eyepiece", "point at the coarse focus knob") en entornos de enseñanza.
- Investigación en imitación robótica: sirve como punto de partida para fine-tunes adicionales sobre LeRobot, dado que se distribuye con licencia Apache 2.0 y formato safetensors.
- Despliegue en laboratorios con hardware OpenArm: el comando `lerobot-rollout` permite ejecutar la política con la configuración `bi_openarm_follower` y tres cámaras, facilitando la puesta en marcha en entornos con ese hardware.
- Evaluación de generalización VLA: al derivar de π₀.₅, puede usarse para estudiar la transferencia a variaciones de entorno dentro del dominio de laboratorio educativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 4 143 404 816 parámetros, una estimación en FP16 rondaría los 8,3 GB solo de pesos, sin contar activaciones ni buffers de visión.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: LeRobot 0.6.1 mediante el comando `lerobot-rollout` (estrategia `base`), con robot `bi_openarm_follower` y tres cámaras OpenCV a 640×480 y 30 FPS.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| leapshared/SciEdu_steps_20261119_relabel_100k_pi05 | 4 143 404 816 | no disponible | Apache 2.0 | Hugging Face (LeRobot) | Fine-tune de π₀.₅ para tareas de laboratorio educativo |
| lerobot/pi05_base | no disponible | no disponible | no disponible | Hugging Face (LeRobot) | Modelo base del que deriva este fine-tune |
| π₀.₅ (Physical Intelligence) | no disponible | no disponible | no disponible | OpenPI (open source) | Modelo original VLA para generalización en entornos abiertos |

## Limitaciones y advertencias

- El modelo está ajustado a un robot concreto (`bi_openarm_follower`) y a un conjunto cerrado de tareas de laboratorio; su uso fuera de ese dominio puede degradarse.
- Requiere que los nombres e índices de cámara coincidan con las claves de observación del entrenamiento (`follower_d455f`, `left_wrist`, `right_wrist`); una configuración distinta invalida la política.
- No se documentan sesgos, tasas de alucinación ni evaluaciones de robustez; al ser un modelo de política, el riesgo principal es la ejecución incorrecta de acciones físicas.
- No hay información sobre cuantizaciones disponibles ni sobre requisitos de hardware, lo que dificulta planificar el despliegue.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset pueden tener condiciones adicionales no detalladas en la información disponible.
- El tamaño del repositorio (425,6 GB) implica costes de almacenamiento y descarga considerables.
- No se dispone de información sobre idiomas soportados ni sobre capacidades de lenguaje general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leapshared/SciEdu_steps_20261119_relabel_100k_pi05
- Dataset de entrenamiento: https://huggingface.co/datasets/leapshared/SciEdu_steps_20261119_relabel
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía LeRobot pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=leapshared/SciEdu_steps_20261119_relabel
