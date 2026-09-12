# sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__lr5x__steps_15k

## Resumen

Este repositorio contiene un fine-tune de pi05 (π₀.₅), un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence y orientado a la generalización en entornos abiertos. La implementación utilizada para entrenar y publicar este checkpoint es la de LeRobot (HuggingFace), adaptada del repositorio OpenPI de los autores originales. El modelo parte de la base lerobot/pi05_base y se ha especializado en una tarea concreta de manipulación robótica.

El checkpoint corresponde a una política entrenada sobre el dataset sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live, con 200 episodios y 69.392 fotogramas a 20 FPS. Consume el estado del robot (9 dimensiones) y tres cámaras de 224x224 píxeles, y produce un vector de acción de 7 dimensiones para un robot Franka Emika Panda. El entrenamiento se realizó durante 15.000 pasos con batch de 16 y una tasa de aprendizaje de 2,5e-4.

Con 4.143.404.816 parámetros (unos 4,14B) y 9,4 GB de repositorio, el modelo tiene un tamaño moderado que lo sitúa lejos de los VLA de mayor escala. Es relevante como ejemplo de flujo de trabajo completo y reproducible de fine-tuning de pi05 con LeRobot 0.6.0, si bien conviene señalar que el modelo acumula 0 descargas y 0 "likes" y que no se ha publicado ninguna evaluación de éxito en robot real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (pi05) de Physical Intelligence; implementación de LeRobot adaptada de OpenPI |
| Parámetros totales | 4.143.404.816 (≈4,14B), dato real de los pesos safetensors |
| Parámetros activos | No disponible. No se indica que sea un modelo MoE ni se diferencian parámetros activos |
| Longitud de contexto | No disponible. No se publica ventana de contexto; la política procesa una observación por paso (estado de 9 dimensiones más tres imágenes de 224x224) |
| Tipos de cuantización | No disponible. Solo se publican pesos en safetensors; no hay variantes GGUF, AWQ, GPTQ ni INT8/INT4 |
| Idiomas soportados | No disponible. Es una política VLA; la única entrada en lenguaje natural es la instrucción de tarea (por ejemplo, "basket") y no se documenta soporte multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Autor | sam-guided-vlas |
| Librería / framework | LeRobot 0.6.0 (PyTorch) |
| Tipo de robot | Panda |
| Cámaras de entrada | agentview, robot0_eye_in_hand, robot0_eye_in_hand_2 |
| Tamaño del repositorio | 9,4 GB |
| Fecha de publicación (según metadatos) | 2026-09-12 |

Entradas y salidas declaradas:

| Feature | Tipo | Forma |
|---|---|---|
| observation.state | STATE | (9,) |
| observation.images.agentview | VISUAL | (3, 224, 224) |
| observation.images.robot0_eye_in_hand | VISUAL | (3, 224, 224) |
| observation.images.robot0_eye_in_hand_2 | VISUAL | (3, 224, 224) |
| action | ACTION | (7,) |

Configuración de entrenamiento:

| Ajuste | Valor |
|---|---|
| Pasos de entrenamiento | 15000 |
| Tamaño de batch | 16 |
| Optimizador | adamw |
| Tasa de aprendizaje | 0,00025 (2,5e-4) |
| Semilla | 0 |
| Versión de LeRobot | 0.6.0 |
| Episodios del dataset | 200 |
| Fotogramas del dataset | 69392 |
| Frecuencia del dataset | 20 FPS |

## Arquitectura y entrenamiento

La arquitectura es una política Vision-Language-Action de la familia π₀.₅: el modelo recibe observaciones multimodales (una imagen de vista de agente y dos imágenes de cámara en la muñeca del robot, además de un vector de estado propioceptivo de 9 dimensiones) y emite un vector de acción continuo de 7 dimensiones, típico de un manipulador de 6 grados de libertad más pinza. No se detallan en la información disponible el backbone concreto, el mecanismo de atención ni el número de capas del modelo; la model card únicamente indica que se trata de pi05 y que la implementación procede del repositorio OpenPI adaptado a LeRobot.

En cuanto al entrenamiento, se trata de un fine-tune supervisado por imitación sobre lerobot/pi05_base, no de un entrenamiento desde cero. El dataset consta de 200 episodios y 69.392 fotogramas capturados a 20 FPS, repartidos en 20 tareas de manipulación de objetos domésticos y de alimentación (basket, boxed food, cake, can, hamburger, lemon, orange, spice, squash, spray, soap dispenser, jam, jar, cereal, knife block, kettle, pear, potato, sweet potato y scone). El proceso usó adamw con learning rate 2,5e-4 durante 15.000 pasos y batch de 16. No se documenta el uso de RLHF, DPO ni de decodificación especulativa; tampoco se publican detalles de aumentación más allá de lo que sugiere el propio identificador del repositorio (máscara y superposición con alpha 0,75).

## Capacidades

- Generación de acciones motoras continuas: produce un vector de 7 dimensiones a partir de estado propioceptivo e imágenes, apto para control de un brazo Panda.
- Percepción visual multivista: procesa de forma conjunta una vista de agente y dos vistas de muñeca a 224x224 píxeles.
- Ejecución de tareas de manipulación guiadas por instrucción textual: acepta una etiqueta de tarea (por ejemplo, "basket") que condiciona el comportamiento.
- Generalización a entornos nuevos: la familia π₀.₅ está diseñada explícitamente para generalizar a situaciones y entornos no vistos durante el entrenamiento, según la descripción de los autores.
- Reutilización como punto de partida: al ser un fine-tune de lerobot/pi05_base, puede volver a ajustarse con lerobot-train para nuevas tareas.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado para esta política.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, audio, visión generalista fuera del ámbito robótico): no disponibles.

## Casos de uso

- Manipulación robótica en laboratorio: desplegar la política sobre un Panda con exactamente las tres cámaras y el vector de estado de 9 dimensiones usados en el entrenamiento, lanzando `lerobot-rollout` con la tarea deseada para reproducir las habilidades aprendidas.
- Automatización de recogida y colocación de objetos domésticos: las 20 tareas del dataset (jarra, lata, caja de cereales, cuchillo, hervidor, etc.) permiten montar un banco de pruebas de picking and placing en un entorno controlado.
- Investigación en aprendizaje por imitación: sirve como baseline reproducible para comparar variantes de aumentación de datos o de configuración de entrenamiento, ya que el repositorio documenta pasos, batch, optimizador, learning rate y semilla.
- Estudio del efecto del número de pasos de entrenamiento: existe un checkpoint hermano de 5.000 pasos (`..._steps_5k`) del mismo autor y dataset, lo que permite comparar ambos extremos del entrenamiento con un protocolo idéntico.
- Fine-tuning para nuevas tareas: usar este checkpoint o lerobot/pi05_base como punto de partida con `lerobot-train` para adaptar la política a objetos o configuraciones de cámara distintas.
- Experimentos de transferencia simulación-realidad: el identificador del dataset incluye el término "sim", lo que sugiere que los datos proceden de simulación, aunque el autor no lo confirma explícitamente; en ese caso el modelo sería útil para estudiar la brecha sim2real.
- Teleoperación asistida y generación de datos: usar la política como asistente durante la recogida de demostraciones para acelerar la creación de nuevos datasets de imitación.
- Evaluación de robustez: comprobar el comportamiento ante cambios de iluminación, posiciones de objeto o distracciones, comparando después con la tasa de éxito en las condiciones nominales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación vacía con la indicación explícita de que todavía no se han proporcionado resultados para esta política, y no se ofrecen datos de MMLU, HumanEval, GSM8K ni de tasa de éxito en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir de los 4.143.404.816 parámetros, no publicada por el autor): en bf16 o fp16, unos 8,3 GB solo de pesos, que con activaciones y buffers se traducen en aproximadamente 10-12 GB de VRAM; en fp32, unos 16,6 GB de pesos y en torno a 20 GB totales.
- Cuantización a INT8: alrededor de 4,2 GB de pesos. Cuantización a INT4: alrededor de 2,1 GB. Estas cifras son estimaciones, ya que no se distribuyen variantes cuantizadas.
- GPU recomendadas: A100 (40 o 80 GB), H100 y L40S ofrecen margen sobrado. Una RTX 4090 o RTX 3090 (24 GB) es suficiente en bf16.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB (RTX 4090, RTX 3090) con holgura en bf16; en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) quedaría muy justo en bf16 y con más margen en INT8.
- Opciones de despliegue: LeRobot con PyTorch sobre la estación de control del robot (`lerobot-rollout` para ejecutar y `lerobot-train` para reentrenar). Frameworks de servicio de texto como vLLM, llama.cpp, Ollama o TGI no son aplicables directamente, ya que están orientados a generación de lenguaje y no a políticas VLA con salida motora continua.
- Latencia y throughput: no se publican medidas de latencia de inferencia. Como referencia del bucle de control, el dataset de entrenamiento se capturó a 20 FPS, es decir, 50 ms por paso.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este checkpoint, por lo que la comparación cuantitativa no es posible. La tabla recoge únicamente los aspectos verificables.

| Modelo | Parámetros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (pi05 fine-tune, 15k pasos) | 4.143.404.816 | Estado (9,) + 3 imágenes 224x224 | Manipulación con Panda, 20 tareas | Apache-2.0 | HuggingFace |
| sam-guided-vlas/...steps_5k | No disponible | Misma configuración | Misma tarea, 5.000 pasos | Apache-2.0 (según metadatos del repositorio) | HuggingFace |
| lerobot/pi05_base | No disponible en la información proporcionada | No disponible | Modelo VLA base para fine-tuning | No disponible en la información proporcionada | HuggingFace |

Otras familias de VLA comparables por categoría (por ejemplo, OpenVLA, RDT-1B u Octo) no se han podido contrastar con datos verificables dentro de la información disponible, por lo que su comparación queda marcada como no disponible.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito ni número de ensayos publicados, de modo que se desconoce si la política funciona de forma fiable en robot real.
- Dataset pequeño: 200 episodios y 69.392 fotogramas son un volumen reducido, lo que incrementa el riesgo de sobreajuste a las posiciones de objeto, iluminación y disposición concretas del conjunto de entrenamiento.
- Dependencia estricta del hardware: la política espera un robot Panda con tres cámaras nombradas exactamente agentview, robot0_eye_in_hand y robot0_eye_in_hand_2, además de un vector de estado de 9 dimensiones. Cualquier variación en la configuración puede degradar el comportamiento.
- Ámbito de tareas limitado: las 20 tareas del dataset son de manipulación de objetos domésticos y de alimentación; el modelo no está pensado para tareas fuera de esa distribución.
- Posible origen simulado de los datos: el identificador del dataset contiene el término "sim", pero el autor no lo confirma. Si los datos son de simulación, existe una brecha sim2real que no se ha cuantificado.
- Idiomas: no se documenta ningún soporte multilingüe; la única entrada textual es la etiqueta de tarea.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones erráticas o fuera de distribución cuando la observación se aleja de la distribución de entrenamiento.
- Sin validación por la comunidad: 0 descargas y 0 "likes" en el momento de redactar esta ficha, sin issues ni informes externos de uso.
- Licencia: Apache-2.0 permite uso comercial del checkpoint, pero conviene revisar los términos del modelo base lerobot/pi05_base y del trabajo original de Physical Intelligence antes de un despliegue en producción.
- Hiperparámetros agresivos: el identificador indica un learning rate multiplicado por 5 respecto a la configuración por defecto, lo que puede favorecer una convergencia rápida pero también una menor estabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__lr5x__steps_15k
- Checkpoint hermano de 5.000 pasos: https://huggingface.co/sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__lr5x__steps_5k
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live
