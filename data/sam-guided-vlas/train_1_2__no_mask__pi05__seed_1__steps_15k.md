# sam-guided-vlas/train_1_2__no_mask__pi05__seed_1__steps_15k

## Resumen

El modelo `sam-guided-vlas/train_1_2__no_mask__pi05__seed_1__steps_15k` es un modelo Vision-Language-Action (VLA) de robótica, desarrollado por el usuario `sam-guided-vlas` a partir del modelo base `lerobot/pi05_base`. Se trata de un fine-tune de π₀.₅ (Pi05), un modelo de Physical Intelligence diseñado para generalización en entornos abiertos, adaptado en el framework LeRobot de Hugging Face. El modelo se entrenó durante 15.000 pasos sobre un dataset de demostraciones de manipulación robótica con un brazo Panda, compuesto por 200 episodios y 30.830 frames a 20 FPS, cubriendo 20 tareas cotidianas como manipular jabón, mermelada, cereales, frutas o utensilios de cocina.

Con 4.143.404.816 parámetros (~4.14 mil millones), el modelo consume observaciones multimodales (estado del robot y tres imágenes de 224×224 píxeles) y produce acciones de 7 dimensiones para controlar el robot. Su relevancia radica en que permite a investigadores y desarrolladores probar políticas de aprendizaje por imitación en robótica con un modelo preentrenado de gran tamaño, sin necesidad de entrenar desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅; detalle arquitectónico no disponible |
| Parametros totales | 4.143.404.816 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del modelo base `lerobot/pi05_base`, que a su vez es una implementación de π₀.₅ (Pi05) de Physical Intelligence. Según la model card, la implementación en LeRobot está adaptada del repositorio open-source OpenPI. No se proporcionan detalles sobre la arquitectura interna (número de capas, tipo de atención, etc.) en la información disponible.

El entrenamiento se realizó con LeRobot 0.6.0 durante 15.000 pasos, con un tamaño de lote de 16, optimizador AdamW y tasa de aprendizaje de 5e-05. El dataset de entrenamiento (`sam-guided-vlas/train_1_2__no_mask`) contiene 200 episodios y 30.830 frames a 20 FPS, correspondientes a 20 tareas de manipulación: dispensador de jabón, mermelada, tarro, cereales, bloque de cuchillos, hervidor, pera, patata, boniato, scone, cesta, comida en caja, pastel, lata, hamburguesa, limón, naranja, especia, calabaza y spray. No se indica si se aplicaron técnicas de RLHF o DPO, ya que se trata de un modelo de aprendizaje por imitación.

## Capacidades

- Genera acciones de 7 dimensiones para controlar un brazo robótico Panda a partir de observaciones multimodales.
- Procesa simultáneamente el estado del robot (9 valores) y tres imágenes RGB de 224×224 píxeles (cámaras `agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`).
- Ejecuta 20 tareas de manipulación aprendidas por imitación sobre objetos cotidianos.
- Según la descripción de π₀.₅, está diseñado para generalizar a entornos y situaciones no vistos durante el entrenamiento (open-world generalization).
- No soporta generación de texto, tool calling ni razonamiento multi-paso en el sentido clásico de los modelos de lenguaje; su salida son acciones robóticas.
- No se especifican capacidades multilingües ni de visión más allá de las cámaras del robot.

## Casos de uso

- Investigación en aprendizaje por imitación: el modelo permite estudiar cómo un VLA preentrenado se adapta a tareas específicas mediante fine-tune con pocos episodios.
- Automatización de manipulación en laboratorio: puede usarse para tareas repetitivas de pick-and-place con un brazo Panda, como recoger objetos de una cesta o colocar alimentos en una superficie.
- Control de robots en entornos domésticos: el modelo está entrenado con tareas del hogar (abrir tarros, servir cereales, manipular frutas), lo que lo hace útil para prototipos de asistencia robótica.
- Desarrollo de políticas de manipulación con LeRobot: al estar integrado en el framework LeRobot, permite entrenar y desplegar políticas con comandos CLI sencillos (`lerobot-rollout`, `lerobot-train`).
- Evaluación de generalización open-world: los investigadores pueden probar el comportamiento del modelo en escenarios no vistos durante el entrenamiento, gracias al diseño de π₀.₅.
- Benchmarking de VLA en robótica: el modelo sirve como referencia para comparar con otros policies entrenados en el mismo dataset o en datasets similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan aproximadamente 9.4 GB en disco, lo que sugiere que están almacenados en FP16/BF16 (4.143.404.816 parámetros × 2 bytes ≈ 8.3 GB). Para inferencia en FP16 se necesitan al menos 8.3 GB de VRAM, más overhead de activaciones y buffers, por lo que se recomienda una GPU con 12 GB o más.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para ejecutar en FP16; A100 (40/80 GB) o H100 (80 GB) para entrenamiento o inferencia con lotes grandes.
- Compatibilidad con GPU de consumo: sí, es posible ejecutar el modelo en una RTX 3080/3090/4090 en FP16, siempre que se disponga de suficiente VRAM.
- Opciones de despliegue: el modelo está diseñado para usarse con LeRobot, mediante los comandos `lerobot-rollout` y `lerobot-train`. No se menciona soporte para vLLM, llama.cpp ni Ollama, al tratarse de un modelo de robótica.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni especificaciones de modelos comparables en la información proporcionada. El modelo más cercano es el propio modelo base `lerobot/pi05_base`, del cual es un fine-tune. También existe una variante con diferente semilla: `sam-guided-vlas/train_1_2__no_mask__pi05__seed_0__steps_15k`, aunque no se proporcionan métricas comparativas entre ambos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sam-guided-vlas/train_1_2__no_mask__pi05__seed_1__steps_15k | 4.143.404.816 | No disponible | Apache 2.0 | HuggingFace |
| lerobot/pi05_base | No disponible | No disponible | No disponible | HuggingFace |

## Limitaciones y advertencias

- No se han publicado resultados de evaluación en la model card, por lo que el rendimiento real en las 20 tareas es desconocido.
- El modelo fue entrenado específicamente para un robot Panda y con tres cámaras concretas (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`). Usarlo con otro robot o configuración de cámaras requeriría adaptaciones.
- El dataset de entrenamiento es pequeño (200 episodios), lo que puede limitar la generalización y aumentar el riesgo de sobreajuste a las condiciones de captura.
- Al ser un modelo de aprendizaje por imitación, puede heredar sesgos presentes en las demostraciones humanas que componen el dataset (por ejemplo, preferencias en la forma de agarrar objetos).
- Existe riesgo de que el modelo ejecute acciones incorrectas o inseguras en entornos no vistos, por lo que se recomienda supervisión humana en aplicaciones reales.
- No se especifican restricciones de licencia más allá de Apache 2.0, que permite uso comercial, modificación y distribución.
- La falta de documentación sobre la arquitectura y los requisitos de hardware puede dificultar la depuración y el despliegue en sistemas con recursos limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sam-guided-vlas/train_1_2__no_mask__pi05__seed_1__steps_15k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2__no_mask
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Variante con seed_0: https://huggingface.co/sam-guided-vlas/train_1_2__no_mask__pi05__seed_0__steps_15k
