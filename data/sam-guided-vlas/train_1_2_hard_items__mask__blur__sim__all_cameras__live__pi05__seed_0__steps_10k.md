# sam-guided-vlas/train_1_2_hard_items__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_10k

## Resumen

Este repositorio contiene un fine-tuning del modelo pi05 (π₀.₅), un Vision-Language-Action (VLA) desarrollado por Physical Intelligence y adaptado a la librería LeRobot a partir del repositorio OpenPI. El modelo resuelve el problema del control robótico de propósito general: recibe observaciones visuales y de estado propioceptivo de un brazo Panda y produce directamente una acción de 7 dimensiones, sin necesidad de diseñar un controlador específico para cada tarea.

El checkpoint parte de `lerobot/pi05_base` y se ha entrenado sobre un conjunto de 199 episodios y 31.073 fotogramas a 20 FPS, centrado en objetos de geometría compleja (denominados "hard items" en el nombre del repositorio). Los pesos suman 4.143.404.816 parámetros (unos 4,14 mil millones) y el repositorio ocupa 9,4 GB, principalmente en formato safetensors.

Su relevancia es doble: por un lado, demuestra el flujo de trabajo de fine-tuning de políticas VLA con LeRobot para un robot y una configuración de cámaras concretos; por otro, sirve como artefacto reproducible (semilla 0, 10.000 pasos) para estudiar generalización, robustez visual (máscaras y desenfoque, según el nombre del experimento) y transferencia de simulación a realidad. No hay descargas ni valoraciones registradas en el Hub, ni benchmarks publicados por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) pi05; implementación de LeRobot adaptada de OpenPI |
| Parámetros totales | 4.143.404.816 (≈4,14 mil millones) |
| Parámetros activos | No procede: la información disponible no indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; los pesos se publican en safetensors (el repositorio ocupa 9,4 GB) |
| Idiomas soportados | No disponible; es un modelo de robótica y la ficha no documenta capacidades de lenguaje natural |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Modelo base | lerobot/pi05_base (fine-tuning, no entrenamiento desde cero) |
| Tipo de política | Control robótico (pipeline `robotics`) |
| Robot | Panda |
| Cámaras | `agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2` |
| Entradas | `observation.state` (9,); 3 imágenes RGB de (3, 224, 224) |
| Salidas | `action` (7,) |
| Dataset de entrenamiento | sam-guided-vlas/train_1_2_hard_items__mask__blur__sim__all_cameras__live |
| Episodios / fotogramas | 199 / 31.073 a 20 FPS |
| Descargas / likes | 0 / 0 |
| Fecha de creación (según el Hub) | 2026-09-11 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo pi05: un Vision-Language-Action que combina un codificador visual y de lenguaje con un módulo generador de acciones, tal como lo implementa Physical Intelligence en OpenPI y lo porta LeRobot. La ficha no detalla la composición del backbone, el número de tokens de contexto, ni el método de generación de acciones empleado, por lo que esos extremos quedan como no disponibles. Lo que sí se documenta es la interfaz exacta: tres vistas RGB de 224×224 píxeles (una cenital de agente y dos de muñeca), un vector de estado de 9 dimensiones y una salida continua de 7 dimensiones, coherente con un brazo manipulador con pinza.

El entrenamiento consiste en un fine-tuning supervisado desde `lerobot/pi05_base` sobre 199 episodios teleoperados (31.073 fotogramas, 20 FPS) del dataset `train_1_2_hard_items__mask__blur__sim__all_cameras__live`. El nombre del repositorio y del dataset sugiere, sin que la ficha lo confirme explícitamente, el uso de enmascarado y desenfoque como aumentación o condición de entrenamiento, datos de simulación, uso simultáneo de todas las cámaras, semilla 0 y 10.000 pasos de optimización. Las descripciones de tareas del dataset enumeran objetos con geometrías intrincadas (esferas rodeadas de bandas, anillos con costillas, copas con rebordes, formas con lóbulos y perforaciones múltiples), lo que indica un régimen de manipulación difícil más que de objetos simples. No se documentan fases de RLHF, DPO ni aprendizaje por refuerzo.

## Capacidades

- Generación de acciones de control continuas de 7 dimensiones a partir de observaciones multimodales (estado + tres imágenes).
- Percepción multi-cámara fusionada: una vista cenital de agente y dos vistas de muñeca.
- Manipulación de objetos con geometría compleja: superficies con costillas, lóbulos, perforaciones, anillos y formas huecas, según las tareas del dataset.
- Ejecución de políticas de imitación entrenadas a 20 FPS, adecuadas para bucles de control de frecuencia media.
- Punto de partida para fine-tuning adicional: al derivar de `lerobot/pi05_base` y estar entrenado solo 10.000 pasos, es reutilizable como inicialización para nuevas tareas sobre el mismo robot.
- No se documenta generación de texto, razonamiento simbólico, tool calling, function calling, uso como agente multi-paso ni capacidades multilingües.
- No se documenta explícitamente el uso de SAM (segmentación) pese al nombre de la organización autora; es una hipótesis no confirmada por la ficha.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo toma las tres vistas del Panda y emite la acción de 7 grados de libertad directamente, de modo que puede integrarse en un bucle de control a 20 Hz para coger y colocar objetos con formas irregulares sin programar trayectorias manuales.
- Investigación en generalización de VLA: sirve como checkpoint de referencia para medir si una política entrenada con 199 episodios transfiere a objetos o poses no vistos, comparando su tasa de éxito con la del modelo base `lerobot/pi05_base`.
- Estudios de robustez visual: dado que el experimento incluye condiciones de máscara y desenfoque, el checkpoint permite evaluar cuánto degrada la manipulación cuando la imagen se ve parcialmente ocluida o borrosa, un escenario habitual en cámaras de muñeca sucias o con movimiento.
- Análisis de transferencia simulación-realidad: si los datos son simulados, el modelo sirve para cuantificar la brecha al desplegarlo en un Panda físico con la misma disposición de cámaras.
- Inicialización para fine-tuning industrial: con solo 4,14 mil millones de parámetros y licencia Apache 2.0, es viable reentrenarlo en un único nodo con GPUs de 24 GB para adaptarlo a una tarea concreta de línea de montaje partiendo de una política ya competente en objetos difíciles.
- Reproducción de experimentos LeRobot: el repositorio queda como artefacto reproducible (semilla 0, 10.000 pasos) para replicar el pipeline de entrenamiento de pi05 y auditar sus hiperparámetros.
- Evaluación comparativa de arquitecturas: permite contrastar el comportamiento de pi05 frente a π₀ u otras políticas sobre el mismo robot, las mismas cámaras y el mismo dataset, aislando el efecto de la arquitectura.
- Docencia y demostraciones de aprendizaje por imitación: es un ejemplo completo y pequeño de política VLA lista para cargar con LeRobot en sesiones prácticas sobre robótica o aprendizaje profundo aplicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha del modelo no incluye tablas de éxito por tarea, ni comparaciones con `lerobot/pi05_base` o π₀, ni métricas de error de seguimiento. El repositorio registra 0 descargas y 0 valoraciones en el momento de la consulta, por lo que tampoco existe validación externa publicada.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 16,6 GB en FP32, 8,3 GB en BF16/FP16, 4,1 GB en INT8 y 2,1 GB en INT4, calculados sobre 4.143.404.816 parámetros. Hay que sumar la memoria de activaciones y del codificador visual.
- El repositorio ocupa 9,4 GB, coherente con pesos en BF16 más ficheros auxiliares.
- GPU recomendadas para inferencia en BF16: NVIDIA A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB). Una RTX 3090 de 24 GB también debería ser suficiente para los pesos en BF16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y modelos con 24 GB o más en BF16. En GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) sería necesario recurrir a cuantización INT8, no documentada por el autor.
- Opciones de despliegue: LeRobot (PyTorch) es la vía documentada, ya que el modelo se entrenó y publicó con esa librería. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un modelo de lenguaje autorregresivo.
- Latencia y throughput: no disponibles. La frecuencia de control esperable es de unos 20 Hz, en coherencia con los 20 FPS del dataset de entrenamiento, pero no se han publicado mediciones de latencia extremo a extremo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (fine-tuning pi05, 10k pasos) | 4.143.404.816 | No disponible | apache-2.0 | Hub de HuggingFace, 0 descargas | Específico para Panda con 3 cámaras; dataset de 199 episodios |
| lerobot/pi05_base | No disponible | No disponible | No disponible | Hub de HuggingFace | Modelo base del que deriva este fine-tuning; no se documentan sus especificaciones en la información proporcionada |
| π₀ (Physical Intelligence) | No disponible | No disponible | No disponible | Repositorio OpenPI citado en la ficha | Predecesor de π₀.₅ según la model card; sin datos comparables publicados aquí |
| Otras políticas VLA del ecosistema LeRobot (por ejemplo OpenVLA o SmolVLA) | No disponible | No disponible | No disponible | No disponible | No se aportan datos que permitan una comparación rigurosa |

## Limitaciones y advertencias

- La model card es mínima: no especifica arquitectura interna, contexto, método de generación de acciones, composición del dataset ni proceso de entrenamiento más allá de los metadatos.
- La interfaz está fuertemente acoplada al hardware: robot Panda, tres cámaras con nombres concretos y un vector de estado de 9 dimensiones. No es portable a otro robot sin reentrenar.
- El entrenamiento se ha realizado sobre 199 episodios y 31.073 fotogramas, un volumen reducido que aumenta el riesgo de sobreajuste a los objetos y posiciones vistos.
- El nombre del experimento indica datos de simulación, por lo que existe un riesgo previsible de brecha simulación-realidad que la ficha no cuantifica.
- No hay benchmarks, evaluaciones ni validación externa; el repositorio acumula 0 descargas y 0 valoraciones.
- No se documentan sesgos, pero una política entrenada con un conjunto tan específico hereda los sesgos de las demostraciones de teleoperación (posiciones, iluminación, fondo y estilo de agarre).
- El riesgo de alucinación en el sentido de modelos de lenguaje no aplica; el fallo típico es ejecutar una acción incorrecta o insegura ante una escena fuera de distribución.
- No se documentan capacidades de idioma ni de generación de texto, por lo que no debe usarse como modelo conversacional.
- La lista de tareas de la model card aparece truncada en la información disponible, de modo que no se conoce el repertorio completo de objetos.
- Las fechas del Hub (creación el 2026-09-11) son atípicas y conviene verificarlas antes de citar el artefacto.
- La licencia apache-2.0 afecta a este repositorio, pero debe comprobarse por separado la licencia de `lerobot/pi05_base` y de los pesos originales de pi05 antes de un uso comercial.
- La búsqueda web realizada no ha devuelto información relevante sobre este modelo: los resultados corresponden a entidades homónimas (una serie de televisión francesa y un fabricante de herramientas) sin relación alguna. Todos los enlaces ajenos al Hub que aparecen a continuación proceden de la propia model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sam-guided-vlas/train_1_2_hard_items__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_10k
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_hard_items__mask__blur__sim__all_cameras__live
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
