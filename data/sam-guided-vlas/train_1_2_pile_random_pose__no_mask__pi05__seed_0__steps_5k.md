# sam-guided-vlas/train_1_2_pile_random_pose__no_mask__pi05__seed_0__steps_5k

## Resumen

Este modelo es un fine-tuning de π₀.₅ (Pi05), un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence para la manipulación robótica. El fine-tuning ha sido realizado por el usuario `sam-guided-vlas` sobre el modelo base `lerobot/pi05_base` utilizando la librería LeRobot. El objetivo del modelo es generalizar a entornos nuevos y situaciones no vistas durante el entrenamiento, siguiendo la filosofía de open-world generalization de pi05.

El modelo fue entrenado con un dataset de demostraciones de manipulación de objetos en un robot Panda, compuesto por 198 episodios y 35.267 frames a 20 FPS. Las tareas incluyen recoger y colocar objetos de una pila en posiciones aleatorias, con una lista de 20 objetos como tarros, botellas de jabón, frutas, cajas de cereales, entre otros. La arquitectura combina percepción visual de tres cámaras con el estado del robot y genera acciones continuas de 7 dimensiones.

Con 4.143.404.816 parámetros (aproximadamente 4.140 millones), este modelo representa una de las implementaciones open-source más recientes de un controlador robótico basado en aprendizaje por imitación. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificaciones, aunque no se han publicado evaluaciones en robot reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), basada en transformer |
| Parámetros totales | 4.143.404.816 (4.14B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un VLA que procesa entradas multimodales: tres imágenes de 224x224 píxeles (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) y un vector de estado de 9 dimensiones. A partir de estas observaciones, genera acciones de 7 dimensiones para controlar un robot Panda. La implementación está adaptada del repositorio open-source OpenPI de Physical Intelligence, integrada en el framework LeRobot.

El entrenamiento consiste en un fine-tuning de 5.000 pasos con batch size 16, optimizador AdamW y learning rate 5e-5. El dataset de entrenamiento contiene 198 episodios y 35.267 frames, grabados a 20 FPS en tareas de apilado de objetos con posiciones aleatorias. No se menciona el uso de RLHF, DPO ni otras técnicas de optimización posteriores. La versión de LeRobot utilizada es 0.6.0, y el entrenamiento se ejecutó con semilla 0.

## Capacidades

- Manipulación robótica: genera acciones de bajo nivel (7 grados de libertad) para controlar un brazo robótico con precisión.
- Percepción visual: procesa simultáneamente tres cámaras (vista de agente, vista de mano y otra cámara de mano), lo que permite una comprensión robusta de la escena.
- Aprendizaje por imitación: el modelo ha sido ajustado mediante demostraciones humanas, lo que le permite replicar tareas de recogida y colocación de objetos.
- Generalización a tareas específicas: ha sido entrenado en 20 tareas distintas de manipulación con objetos cotidianos (tarros, frutas, envases, etc.).
- No soporta tool calling ni function calling: se trata de un controlador físico, no de un modelo de lenguaje conversacional.
- No soporta razonamiento multi-step como los modelos de chat; su salida es una secuencia de acciones continuas.
- Capacidades multilingües: no disponibles, ya que el modelo no procesa instrucciones lingüísticas como entrada principal.

## Casos de uso

- Clasificación de objetos en almacenes: el modelo puede ordenar productos de una pila desordenada, como tarros de mermelada o cajas de cereales, y colocarlos en posiciones concretas. Es adecuado porque ha sido entrenado con una tarea de apilado con posiciones aleatorias y múltiples cámaras que facilitan la percepción del entorno.
- Automatización en cocinas domésticas: el robot puede coger y mover ingredientes como patatas, boniatos o frutas desde una superficie hasta un contenedor. La vista de mano permite un agarre delicado de objetos de distinta forma y rigidez.
- Investigación en aprendizaje por imitación: este fine-tuning sirve como baseline reproducible para comparar algoritmos de políticas robóticas con LeRobot. La posibilidad de entrenar el mismo modelo base con diferentes datasets permite evaluar el efecto del tamaño y la diversidad de los datos.
- Robótica educativa: laboratorios universitarios con robots Panda pueden desplegar el modelo para demostrar el pipeline completo de LeRobot, desde la grabación de datos hasta la inferencia. La documentación de LeRobot y la configuración presente en la model card facilitan la puesta en marcha.
- Asistencia en tareas de picking para e-commerce: en almacenes pequeños, el modelo puede recoger productos variados de una pila y prepararlos para su embalaje. Su capacidad para manejar 20 tipos de objetos distintos lo convierte en una opción práctica para escenarios con rotación de productos.
- Manipulación de objetos con puntos de acceso variables: al estar entrenado con posiciones aleatorias, el modelo puede adaptarse a objetos colocados de forma no estructurada, lo que resulta útil en entornos domésticos donde los objetos no siempre están alineados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card del modelo indica explícitamente que no se han proporcionado resultados de evaluación en robot reales todavía.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 4.14B parámetros. En formato BF16, los pesos ocupan aproximadamente 8,3 GB, por lo que se requiere un mínimo de 10 GB de VRAM para la inferencia, teniendo en cuenta las activaciones de las tres cámaras.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) es suficiente para ejecutar el modelo en BF16. Para disponer de más margen, se recomiendan A100 (40 GB o 80 GB) o H100 (80 GB).
- Compatibilidad con GPUs de consumo: sí, cabe en RTX 3090 y RTX 4090 con 24 GB de VRAM, siempre que se utilicen los pesos en BF16 sin cuantización adicional.
- Opciones de despliegue: el modelo está diseñado para ejecutarse con LeRobot mediante el comando `lerobot-rollout`. No es compatible con frameworks de inferencia de modelos de lenguaje como vLLM, llama.cpp ni TGI.
- Latencia y throughput: no disponible. No hay mediciones publicadas de velocidad de inferencia en el repositorio del modelo.

## Comparativa con modelos similares

No se dispone de información comparativa en los datos proporcionados. El único modelo estrechamente relacionado es el modelo base del que deriva este fine-tuning:

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sam-guided-vlas/train_1_2_pile_random_pose__no_mask__pi05__seed_0__steps_5k | 4.14B | no disponible | no disponible | Apache 2.0 | Hugging Face |
| lerobot/pi05_base | 4.14B | no disponible | no disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de otras alternativas comparables en la información proporcionada, por lo que no es posible establecer comparativas con modelos como OpenVLA u otros VLA.

## Limitaciones y advertencias

- No se han publicado evaluaciones en robot reales, por lo que el rendimiento real del modelo no está verificado y puede fallar fuera del conjunto de demostraciones.
- El modelo está entrenado exclusivamente para un robot Panda, con una configuración de cámaras específica. Cambios en el hardware, en el número de cámaras o en sus nombres provocan que las entradas no coincidan y el modelo no funcione.
- El dataset de entrenamiento es reducido (198 episodios, 35.267 frames) y está limitado a 20 tareas concretas de apilado. Es probable que exista sobreajuste a estos objetos y posiciones.
- No es un modelo de lenguaje ni de visión generalista: no puede mantener conversaciones, responder preguntas ni interpretar instrucciones de texto complejas.
- Riesgo de alucinación en acciones: cuando el robot se enfrenta a estados fuera de la distribución de entrenamiento (objetos nuevos, iluminación inusual, oclusiones), el modelo puede generar movimientos erráticos o inestables.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario revisar los términos de la licencia y las patentes asociadas al modelo base pi05.
- La dependencia de tres cámaras simultáneas puede ser un obstáculo para implementaciones con menos recursos de percepción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sam-guided-vlas/train_1_2_pile_random_pose__no_mask__pi05__seed_0__steps_5k
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile_random_pose__no_mask
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sam-guided-vlas/train_1_2_pile_random_pose__no_mask
- Blog de Physical Intelligence sobre pi05: https://www.physicalintelligence.company/blog/pi05
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
