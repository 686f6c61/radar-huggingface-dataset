# sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_15k

# Pi05 afinado para apilado de objetos con un Franka Panda (LeRobot)

## Resumen
pi05 (π₀.₅) es un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence y orientado a la generalización en entornos abiertos: evoluciona π₀ para transferir a situaciones y entornos que nunca se vieron durante el entrenamiento. La implementación que se usa aquí procede de LeRobot y está adaptada del repositorio OpenPI de Physical Intelligence, que publica los pesos base `lerobot/pi05_base`.

Este checkpoint concreto lo publica el usuario `sam-guided-vlas` como ajuste fino (fine-tune) del modelo base. El resultado es una política robótica de 4.143.404.816 parámetros (~4,14B) que consume estado proprioceptivo de 9 dimensiones y tres cámaras de 224x224, y emite un vector de acción de 7 dimensiones para un robot Franka Panda. El entrenamiento se ha hecho sobre un dataset de simulación de 198 episodios y 35.267 fotogramas a 20 FPS, con tareas de recogida y apilado de objetos domésticos.

Su relevancia es doble: por un lado, demuestra el flujo de trabajo de ajuste fino de políticas VLA dentro del ecosistema LeRobot con licencia Apache-2.0; por otro, sirve como punto de partida reproducible (semilla 0, 15.000 pasos) para experimentos de manipulación guiados por segmentación (SAM). No se han publicado resultados de evaluación en robot real ni datos de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de visión-lenguaje-acción (VLA) pi05; implementación de LeRobot adaptada de OpenPI. No se detalla la arquitectura interna (encoder visual, cabeza de acción) en la información disponible |
| Parámetros totales | 4.143.404.816 (~4,14B), dato real de safetensors |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repo publica pesos sin cuantizar; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible (modelo de acción robótica; no se documenta soporte lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (biblioteca `lerobot`) |
| Tipo de robot | Franka Panda (Panda) |
| Entradas | `observation.state` (9,); `observation.images.agentview` (3,224,224); `observation.images.robot0_eye_in_hand` (3,224,224); `observation.images.robot0_eye_in_hand_2` (3,224,224) |
| Salidas | `action` (7,) |
| Modelo base | `lerobot/pi05_base` |
| Tamaño del repositorio | 9,4 GB |
| Pipeline / librería | robotics / lerobot 0.6.0 |

## Arquitectura y entrenamiento
Se trata de una política VLA de tipo pi05: recibe observaciones multimodales (imágenes de cámaras más estado del robot) y produce directamente comandos de acción, sin generar texto intermedio. La model card indica explícitamente que pi05 es la evolución de π₀ de Physical Intelligence y que la implementación empleada está adaptada del repositorio OpenPI. No se proporcionan detalles sobre el encoder visual, el mecanismo de atención, la representación de las acciones, el número de tokens de contexto ni la composición del corpus de preentrenamiento del modelo base.

El ajuste fino se realizó con LeRobot 0.6.0 sobre el dataset `sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a75__sim__all_cameras__live`: 198 episodios, 35.267 fotogramas a 20 FPS, con 20 objetos o categorías de objeto distintos (soap dispenser, jam, jar, cereal, knife block, kettle, pear, potato, sweet potato, scone, basket, boxed food, cake, can, hamburger, lemon, orange, spice, squash, spray). El nombre del dataset sugiere escenas de apilado con poses aleatorias de los objetos, en simulación y con máscaras generadas por SAM superpuestas al 75% (`overlay_a75`), aunque la model card no describe el pipeline de datos.

| Ajuste de entrenamiento | Valor |
|---|---|
| Pasos de entrenamiento | 15.000 |
| Tamaño de lote | 16 |
| Optimizador | adamw |
| Tasa de aprendizaje | 5e-05 |
| Semilla | 0 |
| Versión de LeRobot | 0.6.0 |

No se menciona el uso de RLHF, DPO ni ningún otro método de alineación; el procedimiento es aprendizaje por imitación (behavior cloning) sobre demostraciones. Tampoco se documentan checkpoints intermedios ni curva de pérdida.

## Capacidades

- Predicción de acciones de robot: genera un vector de acción de 7 dimensiones a partir de estado proprioceptivo de 9 dimensiones y tres vistas de cámara.
- Control de un brazo Franka Panda en tareas de recogida y colocación de objetos domésticos.
- Manipulación guiada visualmente: usa dos cámaras de muñeca (`robot0_eye_in_hand`, `robot0_eye_in_hand_2`) además de la vista externa (`agentview`).
- Tolerancia a poses aleatorias de los objetos, según el nombre del dataset de entrenamiento (`pile_random_pose`).
- Ejecución de tareas descritas mediante el parámetro `--task` en el script de despliegue (valores como "soap dispenser").
- Integración nativa con el ecosistema LeRobot: entrenamiento, rollout y visualización de datos vía CLI.
- Generación de texto: no disponible, no es un modelo de lenguaje.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso explícito: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión para descripción de imágenes, audio: no disponible.

## Casos de uso

- Apilado de objetos en simulación: la política se entrenó sobre escenas de apilado con poses aleatorias, por lo que puede usarse para reproducir y comparar configuraciones de apilado en el simulador antes de trasladar nada a hardware real.
- Investigación en modelos VLA: sirve como checkpoint de referencia para estudiar cómo afecta el ajuste fino sobre `lerobot/pi05_base` a tareas concretas de manipulación, con una configuración de entrenamiento totalmente documentada (15.000 pasos, lote 16, lr 5e-05).
- Estudio del efecto de la guía por segmentación (SAM): el nombre del dataset (`mask`, `overlay_a75`) apunta a un pipeline con máscaras superpuestas, útil para analizar si esa señal mejora la política frente a entrenar solo con RGB.
- Transferencia a nuevas tareas con LeRobot: el propio modelo puede usarse como punto de partida para ajustar una política distinta mediante `lerobot-train --policy.path=<este_checkpoint>`, reutilizando el conocimiento adquirido sobre objetos domésticos.
- Prototipado de celdas de pick-and-place: en un laboratorio con un Franka Panda y tres cámaras, se puede lanzar `lerobot-rollout` para comprobar de forma rápida si la política resuelve una tarea de recogida antes de invertir en un dataset propio.
- Generación de datos sintéticos y evaluación comparativa: al estar entrenado en simulación, es adecuado para medir la brecha sim-a-real ejecutando la misma tarea en simulación y en un banco físico y contando éxitos.
- Docencia y demostraciones de robótica: el flujo completo (dataset de 198 episodios, entrenamiento con semilla fija, despliegue por CLI) es reproducible en un curso o taller de aprendizaje por imitación.
- Pruebas de robustez ante variaciones de cámara: al depender de claves de observación concretas, permite experimentar qué ocurre al sustituir o reordenar cámaras, un escenario frecuente en integraciones reales.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación con la plantilla vacía y la nota explícita de que todavía no se han aportado resultados para esta política. No hay tasas de éxito por tarea, número de ensayos ni comparaciones con π₀, π₀.₅ base u otras políticas VLA.

## Requisitos de hardware
- Requisitos oficiales: no disponibles. Las cifras siguientes son estimaciones derivadas del recuento real de parámetros (4.143.404.816).
- VRAM estimada para inferencia: ~8,3 GB solo de pesos en bf16/fp16 (más activaciones, aproximadamente 10-12 GB en total); ~16,6 GB en fp32; ~4,2 GB de pesos en int8 con overhead cercano a 6 GB. La cuantización de esta arquitectura no está documentada, así que las cifras en 8 y 4 bits son teóricas.
- GPU recomendadas: A100, H100, L40S o RTX 4090/3090 (24 GB) para trabajar con holgura en bf16; cualquier GPU con 16 GB o más debería bastar para inferencia en precisión reducida.
- GPU de consumo: sí cabe. RTX 4090 y RTX 3090 (24 GB) sin problema; RTX 4080/4070 Ti Super (16 GB) y RTX 4060 Ti (16 GB) al límite pero viables en bf16; una RTX 3060 de 12 GB queda demasiado justa con el overhead de inferencia.
- Almacenamiento: el repositorio ocupa 9,4 GB, por lo que conviene reservar al menos 20 GB libres para pesos, checkpoints y caché.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` con `--policy.path` apuntando a este repositorio y `--robot.type=Panda`, sobre PyTorch con CUDA. vLLM, TGI, llama.cpp y Ollama no están soportados: son servidores de modelos de lenguaje y esta es una política robótica con entradas de imagen y salidas de acción.
- Hardware adicional obligatorio: un Franka Panda accesible por `--robot.port` y tres cámaras configuradas con los nombres exactos `agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`.
- Latencia y throughput: no disponibles. La única referencia temporal es la tasa del dataset, 20 FPS, que corresponde a la frecuencia de grabación de las demostraciones y no a la velocidad de inferencia del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`sam-guided-vlas/...pi05...steps_15k`) | 4,14B | No disponible | VLA especializada en apilado con Panda en simulación | Apache-2.0 | HuggingFace (0 descargas, 0 likes) |
| `lerobot/pi05_base` | No disponible (el checkpoint afinado deriva de él) | No disponible | VLA de propósito general pi05 | No disponible | HuggingFace |
| π₀.₅ / π₀ (Physical Intelligence) | No disponible | No disponible | VLA de propósito general para generalización en entornos abiertos | No disponible | Blog de Physical Intelligence y repositorio OpenPI |

No se dispone de datos de contexto, benchmarks ni licencia de las alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible. Otras familias de políticas VLA (por ejemplo OpenVLA) no aparecen en la documentación facilitada y no se incluyen para no introducir cifras no verificadas.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real, incluso en simulación.
- Entrenamiento en simulación: el sufijo `sim` del dataset indica que los datos no provienen de un robot físico, por lo que existe una brecha sim-a-real no cuantificada. No se recomienda uso en producción sin validación previa en banco.
- Dataset pequeño: 198 episodios y 35.267 fotogramas para 20 categorías de objeto, lo que favorece el sobreajuste a las condiciones concretas de las demostraciones (iluminación, posiciones, aspect de cámara).
- Dependencia estricta del hardware de observación: las claves de cámara y la dimensionalidad del estado (9) deben coincidir exactamente; cambiar el número de cámaras o el robot invalida la política.
- Ambigüedad en el nombre del repositorio: mezcla mayúsculas y minúsculas (`random_pose__mask__overlay_a75__sim__all_cameras__live`); hay que copiarlo literalmente al invocar `--policy.path`.
- Riesgo de acciones erróneas: no aplica el concepto de alucinación textual, pero sí el de comportamiento inseguro o fuera de distribución. En un robot real esto implica riesgo físico para personas y objetos, por lo que hay que operar con paradas de emergencia y límites de fuerza.
- Idiomas: no disponible. El parámetro `--task` se documenta con cadenas cortas en inglés ("soap dispenser"); no hay evidencia de que entradas en otros idiomas funcionen.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo base `lerobot/pi05_base` y el código de OpenPI pueden tener condiciones propias que conviene revisar antes de explotarlo comercialmente.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validación independiente por parte de la comunidad.
- Fechas de metadatos: creado y actualizado el 11 de septiembre de 2026, según la información de HuggingFace.
- Compatibilidad: al ser un ajuste de pi05, requiere LeRobot 0.6.0 o superior; versiones anteriores pueden no cargar las claves de observación correctamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_15k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a75__sim__all_cameras__live
- Visualizador del dataset (Space de LeRobot): https://huggingface.co/spaces/lerobot/visualize_dataset?path=sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a75__sim__all_cameras__live
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de inferencia y rollout en LeRobot: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio OpenPI (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de aprendizaje por imitación (grabación de datos y entrenamiento): https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos del repositorio de HuggingFace.
