# sam-guided-vlas/train_1_2_hard_items__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_1k

## Resumen

Este repositorio contiene un checkpoint de política robótica basado en π₀.₅ (Pi05), un modelo de Visión-Lenguaje-Acción (VLA) desarrollado por Physical Intelligence y adaptado a LeRobot desde su repositorio abierto OpenPI. El modelo consume observaciones multimodales (estado del robot e imágenes de tres cámaras) y produce directamente comandos de acción de 7 dimensiones, sin necesidad de un planificador externo. Cuenta con 4.143.404.816 parámetros (~4,14 mil millones) almacenados en safetensors.

El autor, sam-guided-vlas, ha publicado un ajuste fino del modelo base lerobot/pi05_base sobre un conjunto de datos de simulación propio, etiquetado como "hard_items" y con máscaras y superposiciones (overlay a 75), orientado a objetos de geometría compleja. El entrenamiento se realizó sobre 199 episodios y 31.073 fotogramas a 20 FPS, con un robot de tipo Panda y tres cámaras (agentview, robot0_eye_in_hand y robot0_eye_in_hand_2).

Se trata de un artefacto de investigación (0 descargas y 0 likes en el momento de la consulta, licencia Apache-2.0) que forma parte de una campaña de experimentos identificada por semilla 0 y 1000 pasos de entrenamiento. Su interés principal es como punto de comparación reproducible dentro de estudios sobre generalización en manipulación robótica y sobre guiado de atención mediante segmentación (SAM) en políticas VLA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅; implementación LeRobot derivada de OpenPI |
| Parametros totales | 4.143.404.816 (~4,14 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica como modelo de lenguaje; las instrucciones de tarea se describen en inglés en el dataset) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria de inferencia | lerobot |
| Tipo de robot | Panda |
| Camaras de entrada | agentview, robot0_eye_in_hand, robot0_eye_in_hand_2 |
| Entradas | observation.state (9,); observation.images.* (3, 224, 224) |
| Salidas | action (7,) |
| Modelo base | lerobot/pi05_base |
| Tamaño del repositorio | 9,4 GB |
| Dataset de entrenamiento | sam-guided-vlas/train_1_2_hard_items__mask__overlay_a75__sim__all_cameras__live (199 episodios, 31.073 fotogramas, 20 FPS) |

## Arquitectura y entrenamiento

La arquitectura es la de π₀.₅, un modelo de Visión-Lenguaje-Acción de Physical Intelligence cuyo objetivo declarado es la generalización a entornos y situaciones no vistos durante el entrenamiento, evolucionando el diseño previo π₀. La implementación utilizada aquí procede del repositorio OpenPI y se ejecuta dentro del ecosistema LeRobot. El modelo recibe como entrada un vector de estado de 9 dimensiones junto con tres imágenes RGB de 224x224 píxeles y emite un vector de acción de 7 dimensiones, lo que corresponde a una política de control de efector final típica de un robot Panda.

El ajuste fino se realizó sobre el dataset sam-guided-vlas/train_1_2_hard_items__mask__overlay_a75__sim__all_cameras__live, compuesto por 199 episodios y 31.073 fotogramas grabados a 20 FPS en simulación. Las tareas descritas en el conjunto cubren objetos con geometrías difíciles: formas con lóbulos, acanaladuras profundas, orificios múltiples, anillos, cúpulas con bordes festoneados y cuerpos con protuberancias. El nombre del experimento indica el uso de máscaras con una superposición del 75 %, todas las cámaras y 1000 pasos de entrenamiento con semilla 0. No se dispone de información sobre el número de tokens de entrenamiento, la composición detallada del dataset, ni sobre el uso de RLHF, DPO u otras técnicas de alineación. Tampoco hay datos publicados sobre innovaciones de decodificación o mecanismos de atención lineal en este checkpoint.

## Capacidades

- Predicción de acciones de manipulación de 7 grados de libertad a partir de observaciones visuales y de estado del robot.
- Percepción visual multicámara simultánea: vista de agente y dos cámaras en la muñeca del robot.
- Condicionamiento por descripción textual de la tarea, según las descripciones de objeto incluidas en el dataset de entrenamiento.
- Generalización a entornos nuevos, que es el objetivo de diseño declarado de la familia π₀.₅.
- Ejecución de políticas de imitación entrenadas con LeRobot, sin planificador simbólico externo.
- No hay información disponible sobre soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, capacidades multilingües, modo de pensamiento, visión general o audio. Estas capacidades no están documentadas para este checkpoint.

## Casos de uso

- Investigación en manipulación robótica: el checkpoint sirve como política de referencia para reproducir experimentos de agarre y colocación de objetos de geometría compleja en simulación, con condiciones de entrenamiento documentadas (semilla 0, 1000 pasos).
- Estudio de generalización en modelos VLA: al derivar de pi05_base y entrenarse sobre un conjunto específico de objetos difíciles, permite medir la degradación o mejora de la generalización frente al modelo base en entornos no vistos.
- Ablación de técnicas de atención guiada por segmentación: el identificador del experimento (mask, overlay_a75) sugiere una comparación sistemática del efecto de las máscaras sobre el rendimiento; este checkpoint sería una de las condiciones del barrido.
- Evaluación de configuraciones de cámara: al usar tres cámaras (incluidas dos en la muñeca), permite analizar la contribución de cada punto de vista a la precisión del agarre.
- Punto de partida para ajustes finos adicionales: al estar en formato safetensors y librería LeRobot, puede reentrenarse sobre datasets propios de manipulación sin partir del modelo base.
- Docencia y formación en robótica: sirve como ejemplo ejecutable de extremo a extremo de un pipeline de aprendizaje por imitación con LeRobot, desde la recogida de datos hasta la política desplegada.
- Pruebas de integración en simuladores: el modelo puede cargarse en entornos de simulación compatibles con el robot Panda para validar canalizaciones de datos de observación y acción antes de un despliegue físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del recuento real de parámetros (4.143.404.816) y sin incluir activaciones ni búferes: ~16,6 GB en fp32, ~8,3 GB en bf16/fp16, ~4,1 GB en int8 y ~2,1 GB en int4. Son estimaciones aritméticas, no medidas oficiales.
- GPU recomendadas para bf16: A100, H100, L40S o similares con 16 GB o más de memoria.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 (24 GB), RTX 4080 (16 GB) y RTX 3090 (24 GB) en bf16; en tarjetas de 12 GB el margen es ajustado y depende del runtime.
- Opciones de despliegue: la vía documentada es LeRobot, con la implementación derivada de OpenPI. No hay información disponible sobre soporte mediante vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| sam-guided-vlas/...pi05...steps_1k (este) | 4.143.404.816 | no disponible | apache-2.0 | Publicado en HuggingFace, 0 descargas | Ajuste fino sobre dataset de simulación de objetos difíciles, 1000 pasos, semilla 0 |
| lerobot/pi05_base | no disponible | no disponible | no disponible en la información proporcionada | Publicado en HuggingFace como modelo base | Modelo base sobre el que se entrena este checkpoint |
| π₀ (mencionado en la model card) | no disponible | no disponible | no disponible en la información proporcionada | Repositorio OpenPI citado por el autor | Arquitectura predecesora de π₀.₅; sin datos numéricos en la información disponible |

No se dispone de datos de benchmarks ni de especificaciones comparables de otros modelos VLA en la información proporcionada. Los resultados de la búsqueda web no contienen modelos de esta categoría.

## Limitaciones y advertencias

- Sesgo de dominio: el entrenamiento se realizó íntegramente en simulación sobre una familia concreta de objetos etiquetados como "hard_items", por lo que el rendimiento fuera de esa distribución no está garantizado.
- Riesgo de acciones incorrectas: como política de control, los fallos se manifiestan como agarres fallidos, colisiones o movimientos inseguros, no como texto incorrecto; requiere límites de seguridad en el robot real.
- Estado de entrenamiento: el identificador indica 1000 pasos con semilla 0, un presupuesto bajo que puede traducirse en un ajuste incompleto respecto al modelo base.
- Idiomas y contexto: no hay información sobre ventana de contexto ni sobre capacidades lingüísticas; el condicionamiento textual se limita a las descripciones de tarea del dataset, redactadas en inglés.
- Licencia: el checkpoint se publica bajo Apache-2.0, lo que permite uso comercial, pero conviene verificar por separado las licencias del modelo base lerobot/pi05_base y de las dependencias de OpenPI y LeRobot.
- Repositorio sin validación comunitaria: 0 descargas y 0 likes, y una model card con secciones de plantilla sin completar, por lo que no hay evidencia externa de reproducibilidad.
- Ausencia de métricas: no se publican resultados de éxito en tarea, curvas de entrenamiento ni comparaciones con el modelo base, lo que impide evaluar su calidad de forma objetiva.
- Fechas del repositorio: la información registra creación y actualización en septiembre de 2026, dato que conviene contrastar antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sam-guided-vlas/train_1_2_hard_items__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_1k
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_hard_items__mask__overlay_a75__sim__all_cameras__live
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
