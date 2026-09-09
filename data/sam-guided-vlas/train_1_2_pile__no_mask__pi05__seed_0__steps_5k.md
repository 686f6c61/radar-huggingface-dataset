# sam-guided-vlas/train_1_2_pile__no_mask__pi05__seed_0__steps_5k

## Resumen

Este modelo es un fine-tuning de la política Vision-Language-Action (VLA) π₀.₅ (Pi05), desarrollada por Physical Intelligence, implementada dentro del ecosistema LeRobot de Hugging Face. El modelo está diseñado para la manipulación robótica y para generalizar a entornos y situaciones no vistos durante el entrenamiento, partiendo del modelo pretrained lerobot/pi05_base.

El ajuste ha sido realizado sobre un dataset específico de 200 episodios y 69.392 frames, recogidos con un robot Panda y tres cámaras, con el objetivo de realizar 20 tareas concretas de manipulación (recoger, colocar y manipular objetos cotidianos). El modelo tiene 4.143.404.816 parámetros y los pesos están disponibles en formato safetensors, con un tamaño de repositorio de 9,4 GB. La licencia es Apache-2.0, lo que permite su uso comercial con atribución.

Este tipo de modelo es relevante para el campo de la robótica de aprendizaje porque permite evaluar una política VLA de última generación en tareas de manipulación realistas, y sirve como punto de partida para investigar la generalización en robótica con poca cantidad de datos. En el repositorio no se ha publicado evaluación en robot real, por lo que su rendimiento práctico debe validarse de forma independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅; arquitectura interna detallada no disponible |
| Parametros totales | 4.143.404.816 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de control robótico, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una política Vision-Language-Action (VLA) que toma como entrada el estado del robot y tres imágenes de cámaras, y produce una acción de 7 dimensiones. Según la model card, la implementación es la adaptación de LeRobot del repositorio OpenPI de Physical Intelligence, donde π₀.₅ evoluciona π₀ para mejorar la generalización a nuevos entornos.

El entrenamiento se ha realizado con la librería LeRobot, partiendo del modelo base lerobot/pi05_base. Los detalles de configuración son: 5.000 pasos de entrenamiento, tamaño de lote 16, optimizador AdamW y tasa de aprendizaje 5e-05 con semilla 0. El dataset utilizado, sam-guided-vlas/train_1_2_pile__no_mask, contiene 200 episodios y 69.392 frames a 20 FPS, con tareas que incluyen objetos como "basket", "cake", "hamburger", "jar", "kettle", "spray" y otros, todos registrados con un robot Panda y tres cámaras. No se especifican datos de pretraining ni procesos de RLHF/DPO.

## Capacidades

- Generación de acciones robóticas de manipulación: el modelo predice acciones de 7 dimensiones (probablemente posición, orientación y gripper) para controlar un robot.
- Percepción multimodal: consume imágenes RGB de 224x224 píxeles desde tres cámaras y el estado del robot (9 dimensiones).
- Aprendizaje por imitación: está entrenado con demostraciones humanas grabadas en un robot Panda, lo que permite el clonado de comportamiento.
- Generalización open-world: según la descripción de Physical Intelligence, π₀.₅ está diseñado para generalizar a entornos y situaciones no vistos, aunque no hay evidencia empírica en este repositorio.
- Integración con LeRobot: se puede desplegar mediante el comando `lerobot-rollout` y reentrenar con `lerobot-train`.
- No soporta tool calling, function calling ni razonamiento lingüístico de alto nivel.
- No es un modelo de lenguaje multimodal en el sentido de chat; es una política de control para robots.

## Casos de uso

- Investigación en aprendizaje por imitación: el modelo puede usarse como baseline para comparar estrategias de clonado de comportamiento en tareas de manipulación con un robot Panda. Es adecuado por su integración nativa con LeRobot y su tamaño manejable para fine-tuning en un entorno de investigación.

- Automatización de manipulación de objetos cotidianos: tareas como recoger y colocar "basket", "boxed food", "cake" o "can" en una superficie determinada. El modelo resulta adecuado porque ha sido entrenado específicamente con estos objetos y con múltiples cámaras, lo que facilita la detección y el agarre.

- Robótica doméstica: organización de objetos como "soap dispenser", "spray", "jam", "jar" o "kettle" en entornos simulados o controlados. La política está afinada para estos elementos y puede servir como base para probar comportamientos de orden y limpieza.

- Preparación asistida de alimentos: manipulación de "hamburger", "lemon", "orange", "potato", "sweet potato" o "scone" para tareas de presentación o cocina sencilla. El modelo es útil aquí por su entrenamiento específico con estos alimentos, aunque requiere validación en entornos reales.

- Benchmarks de generalización: el modelo puede evaluarse en variantes de las 20 tareas con posiciones de objetos, iluminación o distractores modificados, dado que su propósito declarado es generalizar a entornos nuevos. Es adecuado porque permite medir la robustez frente al sobreajuste del dataset original.

- Prototipado rápido de políticas robóticas: usando el comando `lerobot-rollout`, un investigador puede cargar el modelo y probarlo en un robot Panda en cuestión de minutos. Es adecuado para iteraciones rápidas porque el modelo ya está empaquetado como política LeRobot y solo requiere la configuración de las cámaras y el puerto del robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna evaluación en robot real ni métricas de éxito, y el repositorio no proporciona puntuaciones en tareas como grabación, transporte o colocación. Se recomienda llevar a cabo una evaluación propia antes de considerar este modelo para producción.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Los pesos safetensors ocupan un total de 9,4 GB en el repositorio, lo que sugiere que se requiere una GPU con al menos esa capacidad para cargar el modelo, pero no se han publicado requisitos oficiales.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No se puede afirmar sin más datos; el tamaño del modelo (4.143 millones de parámetros) podría caber en una RTX 4090 de 24 GB, pero no hay confirmación oficial.
- Opciones de despliegue: exclusivamente mediante LeRobot (PyTorch). El comando `lerobot-rollout` permite ejecutar la política en un robot y `lerobot-train` permite continuar el entrenamiento. No es compatible con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dataset de fine-tuning | Licencia | Notas |
|---|---|---|---|---|---|
| sam-guided-vlas/train_1_2_pile__no_mask__pi05__seed_0__steps_5k | 4.143.404.816 | No aplica | train_1_2_pile__no_mask (200 episodios) | Apache-2.0 | Este modelo |
| lerobot/pi05_base | No disponible | No aplica | - | Apache-2.0 | Modelo base pretrained |
| sam-guided-vlas/train_1_2_pile__point__overlay_a25__sim__all_cameras__live__pi05__seed_0 | No disponible | No aplica | Simulación con overlay | Apache-2.0 | Variante del mismo autor |
| sam-guided-vlas/pi05_rs-train_1_2-overlay-a025 | No disponible | No aplica | No especificado | Apache-2.0 | Variante del mismo autor |

No se dispone de datos de benchmarks comparativos. Las variantes del mismo autor comparten el mismo modelo base y licencia, pero difieren en los datasets de fine-tuning y en la configuración de entrenamiento.

## Limitaciones y advertencias

- No hay resultados de evaluación en robot real en la model card. La política no ha sido validada con métricas de éxito, por lo que su rendimiento práctico es incierto.
- El dataset de entrenamiento es reducido (200 episodios) y específico para 20 tareas con objetos y robot Panda. Fuera de esas tareas, la robustez no está probada y es probable que el modelo falle en objetos o entornos no vistos.
- El modelo no es un modelo de lenguaje y no puede usarse para chat, generación de texto, razonamiento abstracto ni tool calling.
- Para el rollout es obligatorio disponer de un robot Panda y configurar exactamente tres cámaras con los nombres de clave que usa la política (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`). Cambiar la configuración de cámaras o el tipo de robot puede degradar o invalidar el comportamiento.
- La licencia Apache-2.0 permite el uso comercial, pero requiere conservar el aviso de licencia y atribución. Hay que revisar si los pesos derivados del modelo base y del dataset cumplen con las condiciones del autor original.
- No se ha informado de sesgos específicos, pero al tratarse de un modelo entrenado con demostraciones humanas, puede reproducir sesgos del operador en la forma de ejecutar las tareas.

## Enlaces

- Modelo: https://huggingface.co/sam-guided-vlas/train_1_2_pile__no_mask__pi05__seed_0__steps_5k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile__no_mask
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Variante relacionada: https://huggingface.co/sam-guided-vlas/train_1_2_pile__point__overlay_a25__sim__all_cameras__live__pi05__seed_0
- Variante relacionada: https://huggingface.co/sam-guided-vlas/pi05_rs-train_1_2-overlay-a025
