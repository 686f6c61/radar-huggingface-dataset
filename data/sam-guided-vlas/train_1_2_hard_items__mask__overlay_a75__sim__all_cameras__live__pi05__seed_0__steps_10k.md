# sam-guided-vlas/train_1_2_hard_items__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_10k

## Resumen

Este repositorio contiene un checkpoint de política robótica π₀.₅ (Pi05), un modelo visión-lenguaje-acción (VLA) de Physical Intelligence diseñado para la generalización en entornos abiertos: evoluciona π₀ para operar en situaciones y entornos que no aparecieron durante el entrenamiento previo. La implementación publicada aquí es la adaptación de LeRobot del repositorio OpenPI del propio laboratorio, y este artefacto concreto es un fine-tuning de `lerobot/pi05_base` realizado por el usuario `sam-guided-vlas`.

El modelo tiene 4.143.404.816 parámetros (~4,14 B) y ocupa 9,4 GB en formato safetensors. Está especializado en manipulación con un robot Franka Panda: consume el estado del robot (9 dimensiones) y tres cámaras RGB de 224×224 (vista general y dos cámaras en la muñeca), y emite un vector de acción de 7 dimensiones.

Su interés es fundamentalmente de investigación. El nombre del repositorio describe una ablación concreta (10.000 pasos de entrenamiento, semilla 0, subconjunto de ítems difíciles, enmascarado y superposición al 75 %, datos de simulación y todas las cámaras), y el conjunto de entrenamiento asociado contiene solo 199 episodios y 31.073 fotogramas a 20 FPS, es decir, unos 26 minutos de demostraciones. No hay resultados de benchmarks publicados, ni descargas ni valoraciones registradas en el Hub.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo visión-lenguaje-acción (VLA) π₀.₅; detalles internos (backbone, experto de acción) no disponibles |
| Parametros totales | 4.143.404.816 (~4,14 B) |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible: el repositorio solo publica pesos en safetensors y no documenta versiones GGUF, int8 ni int4 |
| Idiomas soportados | No disponible; las descripciones de tareas del dataset están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Biblioteca | LeRobot |
| Modelo base | `lerobot/pi05_base` |
| Tipo de robot | Franka Panda (`Panda`) |
| Entradas | `observation.state` (9,); `observation.images.agentview` (3, 224, 224); `observation.images.robot0_eye_in_hand` (3, 224, 224); `observation.images.robot0_eye_in_hand_2` (3, 224, 224) |
| Salidas | `action` (7,) |
| Tamaño del repositorio | 9,4 GB |
| Pipeline | robotics |
| Dataset de entrenamiento | `sam-guided-vlas/train_1_2_hard_items__mask__overlay_a75__sim__all_cameras__live`; 199 episodios, 31.073 fotogramas, 20 FPS |
| Fecha de creación | 11 de septiembre de 2026 (según metadatos del Hub) |
| Región | us |

## Arquitectura y entrenamiento

La información disponible describe el modelo como un VLA de la familia π₀.₅ orientado a generalización en entornos abiertos, con la implementación de LeRobot adaptada del repositorio OpenPI. No se detallan en la model card ni en los metadatos el backbone de visión-lenguaje, el mecanismo de generación de acciones, la composición exacta del dataset original de π₀.₅, el número de tokens de entrenamiento ni si se emplearon etapas de RLHF, DPO u optimización por preferencias: esos datos no están disponibles.

Lo que sí queda documentado es el proceso de ajuste fino de este checkpoint: parte de `lerobot/pi05_base` y se entrena sobre una copia concreta del dataset indicado, con 199 episodios y 31.073 fotogramas a 20 FPS de un robot Panda con tres cámaras. El nombre del repositorio indica explícitamente 10.000 pasos de entrenamiento, semilla 0, uso de ítems difíciles (`hard_items`), aplicación de máscara y superposición con factor 75 (`mask__overlay_a75`), datos de simulación (`sim`) y todas las cámaras (`all_cameras`). El tamaño del repositorio (9,4 GB frente a los ~8,3 GB que ocuparían los pesos en bf16) sugiere una mezcla de precisiones, aunque el autor no lo especifica.

## Capacidades

- Control robótico de manipulación de 7 grados de libertad a partir de observaciones visuales y proprioceptivas.
- Percepción visual simultánea desde tres cámaras (vista de agente y dos cámaras en la muñeca), lo que aporta información de profundidad y de agarre.
- Ejecución de una distribución concreta de tareas de agarre y manipulación sobre objetos con geometrías descritas en el dataset de entrenamiento (formas con lóbulos, ranuras, anillos, protuberancias, etc.).
- Generalización a entornos y situaciones no vistos, como objetivo declarado de la familia π₀.₅ frente a π₀.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación e inferencia sobre robots reales o simulados.
- No es un modelo de lenguaje conversacional: no soporta generación de texto, código, matemáticas, tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No se documenta una entrada explícita de instrucción en lenguaje natural en la lista de entradas de la política, aunque el dataset de entrenamiento sí incluye descripciones textuales de tareas; el tratamiento exacto de esas descripciones no está disponible.
- Capacidades multilingües, de visión general (descripción de imágenes) o de audio: no disponibles.

## Casos de uso

- Ajuste fino e investigación sobre VLA: sirve como punto de partida reproducible para experimentar con estrategias de transferencia desde `lerobot/pi05_base` sobre un robot Panda y comparar variantes de datos, aumentos y semillas.
- Estudio de ablaciones de datos: el nombre del repositorio documenta enmascarado, superposición al 75 %, subconjunto de ítems difíciles y uso de todas las cámaras, de modo que el checkpoint permite comparar el efecto de estas decisiones frente a otras configuraciones del mismo estudio.
- Agarre de objetos rígidos de geometría compleja: para tareas de picking donde el objeto presenta lóbulos, ranuras profundas o protuberancias que dificultan el contacto, el modelo incorpora demostraciones específicas de ese tipo de geometrías.
- Transferencia sim-a-real: al proceder de datos de simulación (`sim` en el identificador), es un candidato para medir la brecha entre simulación y un Panda físico con la misma disposición de cámaras.
- Banco de pruebas interno de políticas en LeRobot: permite evaluar tasas de éxito, robustez ante iluminación o posiciones iniciales y comportamiento ante oclusiones, siempre con supervisión y parada de emergencia.
- Docencia y reproducción de experimentos: al ser un artefacto pequeño (4,14 B de parámetros) y con licencia Apache 2.0, es viable reproducir el entrenamiento y la evaluación en un laboratorio con una sola GPU de gama alta.
- Desarrollo de políticas específicas por tarea: puede actuar como inicialización para nuevos ajustes finos en una célula de trabajo concreta, reduciendo el número de demostraciones necesarias frente a entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de agarre ni comparaciones cuantitativas con otros checkpoints, y el repositorio registra 0 descargas y 0 valoraciones, por lo que tampoco existe validación externa publicada.

## Requisitos de hardware

- VRAM estimada para los pesos, calculada a partir de los 4.143.404.816 parámetros: ~16,6 GB en fp32, ~8,3 GB en bf16/fp16, ~4,1 GB en int8 y ~2,1 GB en int4. Son estimaciones aritméticas, no cifras publicadas por el autor.
- A esas cifras hay que sumar el coste de las activaciones del codificador visual (tres imágenes de 3×224×224 por paso) y del bucle de control; el pico real de memoria será superior al tamaño de los pesos, especialmente con lotes grandes.
- GPU de gama alta para servidor: A100 40/80 GB, H100, L40S o A6000, con holgura para bf16 y evaluación por lotes.
- GPU de consumo compatibles en bf16: RTX 4090, RTX 3090 y RTX 4080 (16 GB) al límite; en tarjetas de 16 GB o menos conviene usar int8 y comprobar el pico real de memoria.
- El repositorio pesa 9,4 GB, por lo que la descarga y el almacenamiento en disco deben dimensionarse en consecuencia, además de los pesos base.
- Despliegue previsto: LeRobot (entrenamiento, evaluación y ejecución sobre el robot, incluido el modo de inferencia asíncrona) y OpenPI como referencia del laboratorio original. No hay soporte documentado de llama.cpp, Ollama, GGUF, vLLM ni TGI para este artefacto.
- Latencia y throughput: no disponibles. Como referencia indirecta, el dataset de entrenamiento se grabó a 20 FPS, lo que corresponde a un ciclo de control de unos 50 ms por paso, pero no se especifica la latencia real de inferencia del checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entradas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Este checkpoint (`sam-guided-vlas/...pi05...steps_10k`) | 4.143.404.816 (~4,14 B) | No aplica / no disponible | Estado (9,) y 3 imágenes (3, 224, 224) | Apache 2.0 | Repositorio en Hugging Face, 0 descargas | Fine-tuning de 10.000 pasos sobre 199 episodios, datos de simulación |
| `lerobot/pi05_base` | No disponible en la información proporcionada | No disponible | No disponible | No disponible en la información proporcionada | Repositorio público en Hugging Face | Modelo base del que parte este ajuste fino |
| π₀.₅ original (Physical Intelligence) | No disponible | No disponible | No disponible | No disponible | Referenciado mediante el blog del laboratorio; no se confirma publicación de pesos en la información disponible | Diseñado para generalización a entornos nuevos; origen del que deriva la implementación de LeRobot |

No se dispone de datos de rendimiento comparativos entre estas alternativas, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Conjunto de entrenamiento muy reducido: 199 episodios y 31.073 fotogramas equivalen a unos 26 minutos de demostraciones a 20 FPS, insuficiente para garantizar generalización amplia.
- Especialización estrecha: las tareas del dataset describen un conjunto acotado de geometrías de objeto, y el nombre del repositorio indica que se usó el subconjunto de ítems difíciles, lo que puede sesgar la política hacia esas formas.
- Dependencia del montaje exacto: robot Franka Panda, estado de 9 dimensiones, acción de 7 dimensiones y tres cámaras con nombres y colocación concretos. Cambiar la configuración de sensores o la cinemática invalida la política sin un nuevo ajuste.
- Posible brecha simulación-real: el identificador incluye `sim`, de modo que el comportamiento en un robot físico puede degradarse respecto a la simulación.
- Sin métricas publicadas: no hay tasas de éxito, curvas de aprendizaje ni evaluación en conjuntos de test, por lo que no es posible estimar la fiabilidad en producción.
- Riesgo de acciones incorrectas o inseguras en el mundo físico: en robótica el equivalente a la alucinación es la ejecución de una trayectoria errónea, con riesgo material. Es obligatorio usar límites de fuerza, parada de emergencia y supervisión humana.
- Licencia Apache 2.0, que permite uso comercial del artefacto, pero conviene verificar las condiciones del modelo base `lerobot/pi05_base` y del π₀.₅ original, cuya licencia no está disponible en la información proporcionada.
- Idiomas: no aplica como modelo multilingüe; las descripciones de tareas del dataset están en inglés y no se documenta el tratamiento de instrucciones en otros idiomas.
- Sin validación de la comunidad: 0 descargas y 0 valoraciones, y un nombre de repositorio con pinta de experimento de ablación, lo que sugiere que puede tratarse de un artefacto de investigación sin mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sam-guided-vlas/train_1_2_hard_items__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_10k
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_hard_items__mask__overlay_a75__sim__all_cameras__live
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI de Physical Intelligence: mencionado en la model card, pero sin URL en la información disponible
- Búsqueda web: no se encontraron resultados relevantes sobre este modelo; los resultados devueltos correspondían a una serie de televisión francesa y a un fabricante de utillaje, sin relación con el artefacto.
