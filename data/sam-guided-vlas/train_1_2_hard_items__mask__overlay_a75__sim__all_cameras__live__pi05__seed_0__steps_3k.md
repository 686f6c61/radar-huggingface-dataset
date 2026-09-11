# sam-guided-vlas/train_1_2_hard_items__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_3k

## Resumen

Este repositorio contiene un checkpoint de política robótica de tipo Vision-Language-Action (VLA) entrenado con LeRobot y publicado por el usuario `sam-guided-vlas`. Se trata de un ajuste fino (fine-tuning) del modelo base `lerobot/pi05_base`, que a su vez implementa π₀.₅ (Pi05) de Physical Intelligence, un modelo VLA diseñado para generalizar a entornos y situaciones no vistos durante el entrenamiento. El modelo consume observaciones multimodales (estado del robot e imágenes de tres cámaras) y produce directamente comandos de acción de 7 dimensiones, sin necesidad de un planificador intermedio.

El checkpoint tiene 4.143.404.816 parámetros (unos 4,14 mil millones) almacenados en safetensors, con un tamaño de repositorio de 9,4 GB. Está especializado en un robot tipo `Panda` con tres cámaras (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) y se ha entrenado sobre el dataset `sam-guided-vlas/train_1_2_hard_items__mask__overlay_a75__sim__all_cameras__live`, compuesto por 199 episodios y 31.073 fotogramas a 20 FPS.

Su relevancia es acotada y muy específica: es un artefacto de investigación reproducible dentro del ecosistema LeRobot, útil para estudiar cómo se comporta π₀.₅ al especializarse en un conjunto reducido de objetos geométricos complejos (formas con lóbulos, nervaduras, huecos y asas). El repositorio no incluye resultados de benchmarks, no tiene descargas ni interacciones, y la model card no documenta hiperparámetros de entrenamiento más allá de los metadatos del dataset.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) heredada de π₀.₅; implementación de LeRobot adaptada del repositorio OpenPI de Physical Intelligence. No se detalla la composición interna (backbone visual, experto de acción, etc.) en la información disponible. |
| Parametros totales | 4.143.404.816 (≈4,14 mil millones), según metadatos de safetensors |
| Parametros activos | No aplica: no se indica que sea un modelo Mixture of Experts |
| Longitud de contexto | No disponible. No es un modelo de lenguaje de propósito general: su entrada son observaciones (imágenes 3×224×224 y vector de estado de 9 dimensiones), no una ventana de contexto textual |
| Tipos de cuantizacion | No disponible. El repositorio distribuye pesos en safetensors; no se documentan variantes GGUF, int8 ni int4 |
| Idiomas soportados | No disponible. Las descripciones de tareas del dataset están redactadas en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia π₀.₅ de Physical Intelligence, descrita por el autor como un modelo Vision-Language-Action orientado a la generalización en mundo abierto, que evoluciona π₀ para funcionar en entornos y situaciones completamente nuevos. La implementación utilizada aquí es la de LeRobot, adaptada del repositorio OpenPI de código abierto de Physical Intelligence. La información proporcionada no detalla la arquitectura interna (número de capas, tipo de atención, mecanismo de generación de acciones, uso de flow matching u otras técnicas), por lo que esos extremos quedan como no disponibles.

El ajuste fino se realizó sobre `lerobot/pi05_base` usando el dataset `sam-guided-vlas/train_1_2_hard_items__mask__overlay_a75__sim__all_cameras__live`: 199 episodios, 31.073 fotogramas a 20 FPS, con tres flujos de cámara y estado propioceptivo de 9 dimensiones. Las tareas descritas en el dataset corresponden a manipulación de objetos geométricos con formas complejas (cuerpos con cuatro lóbulos, superficies nervadas, cavidades profundas, anillos de varillas, asas curvas, etc.). No se documentan en la información disponible el número de tokens o pasos de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF, DPO u otro ajuste por preferencias. El identificador del repositorio sugiere un entrenamiento de 3.000 pasos con semilla 0, pero este dato no se confirma en la model card.

## Capacidades

- Generación de acciones motoras: produce un vector de acción de 7 dimensiones a partir de observaciones visuales y propioceptivas, adecuado para control de un robot `Panda`.
- Fusión multimodal: integra simultáneamente tres cámaras (una vista general `agentview` y dos cámaras en la muñeca, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`) junto con el estado del robot.
- Ejecución guiada por instrucciones en lenguaje natural: el dataset de entrenamiento asocia cada episodio a una descripción textual detallada de la tarea, lo que indica condicionamiento por lenguaje.
- Manipulación de objetos con geometría compleja: las tareas cubren formas con lóbulos, nervaduras, cavidades, orificios múltiples, anillos y estructuras tipo asa.
- Generalización a entornos nuevos: según la descripción de π₀.₅, el modelo está concebido para transferir a situaciones no vistas en entrenamiento, aunque no se aportan métricas que lo verifiquen en este checkpoint.
- Tool calling / function calling: no disponible; no es una capacidad propia de un modelo de política robótica.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): dispone de entrada visual por tres cámaras; no se documentan modos de razonamiento explícito ni entrada de audio.

## Casos de uso

- Manipulación de precisión en laboratorio: el modelo puede ejecutar políticas de agarre y colocación sobre objetos con geometría irregular (formas lobuladas o nervadas) usando las tres vistas de cámara para resolver oclusiones.
- Investigación en sim-to-real: al proceder de un dataset identificado como de simulación (`sim`), sirve como punto de partida para estudiar la transferencia de políticas entrenadas en simulador a un `Panda` real.
- Recolección de datos con política previa: en lugar de teleoperar cada episodio desde cero, se puede desplegar este checkpoint para generar trayectorias iniciales y corregirlas, acelerando la construcción de nuevos datasets.
- Comparación de estrategias de aumento de datos: el identificador del dataset menciona máscaras, superposición al 75 % y múltiples cámaras, lo que permite aislar el efecto de cada técnica de aumento sobre la tasa de éxito.
- Clasificación y manipulación de piezas en línea de montaje: el modelo puede seleccionar entre objetos de geometría similar pero distinguible (por ejemplo, variantes con y sin perforaciones) a partir de la descripción textual.
- Evaluación de robustez ante cambios de cámara: con tres flujos visuales, resulta útil para medir cuánto depende la política de cada punto de vista y qué ocurre al desactivar uno de ellos.
- Base para fine-tuning específico de tarea: por su licencia Apache-2.0 y su tamaño moderado (4,14 mil millones de parámetros), es un candidato razonable como inicialización para políticas de manipulación en dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones cuantitativas con otros checkpoints; el repositorio registra 0 descargas y 0 interacciones en el momento de la consulta.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos derivados del número de parámetros, no datos oficiales): en precisión completa fp32, aproximadamente 16,6 GB solo para pesos; en bf16/fp16, unos 8,3 GB; en int8, unos 4,2 GB; en int4, unos 2,1 GB. Hay que sumar el coste de activaciones y de los tres flujos de imagen a 224×224.
- GPU recomendadas: A100 (40/80 GB) y H100 para despliegue sin restricciones y lotes grandes; L40S o L4 (24 GB) para bf16 con holgura; RTX 4090 y RTX 3090 (24 GB) son suficientes en bf16.
- GPU de consumo: sí cabe. Con 24 GB (RTX 4090, RTX 3090) funciona en bf16; con 16 GB (RTX 4060 Ti, RTX 4080) conviene cuantizar o reducir el lote; con 8-12 GB habría que recurrir a cuantización agresiva, cuyo soporte no está documentado en este repositorio.
- Opciones de despliegue: LeRobot es la vía soportada (scripts de entrenamiento y evaluación del propio proyecto, con la guía específica de pi05). vLLM o TGI no son aplicables porque no se trata de un modelo de generación de texto. No se documentan exportaciones a ONNX, TensorRT ni GGUF.
- Latencia y throughput: no disponibles. Como referencia del dominio, el dataset se capturó a 20 FPS, lo que implica un objetivo de ciclo de control de 50 ms por paso, pero no se aportan mediciones reales de latencia para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada / contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`sam-guided-vlas/...pi05__seed_0__steps_3k`) | 4,14 mil millones | Estado (9,) + 3 imágenes 3×224×224; salida de acción (7,) | Sin benchmarks publicados | Apache-2.0 | Repositorio público con 0 descargas |
| `lerobot/pi05_base` (modelo base) | No disponible en la información proporcionada | No disponible | No disponible | No disponible en la información proporcionada | Público en HuggingFace |
| Otras políticas VLA equivalentes (por ejemplo, alternativas de la misma categoría) | No disponible | No disponible | No disponible | No disponible | No disponible |

La búsqueda web realizada no devolvió resultados relevantes sobre el modelo ni sobre modelos comparables: los resultados obtenidos corresponden a una serie de televisión francesa, a un fabricante de utensilios de taller y a una empresa de cerramientos, y no guardan relación con el objeto de esta ficha.

## Limitaciones y advertencias

- Ausencia total de validación publicada: no hay benchmarks, tasas de éxito ni comparaciones, por lo que no es posible estimar su rendimiento real.
- Dataset muy reducido y de simulación: 199 episodios y 31.073 fotogramas en un único dominio de objetos geométricos, con el término `sim` en el nombre del dataset, lo que apunta a un origen simulado y a un riesgo elevado de brecha sim-to-real.
- Especialización estrecha: la política está ajustada a un robot `Panda` con una configuración concreta de tres cámaras y un vector de estado de 9 dimensiones. Cambiar la morfología, el número de cámaras o el orden de las observaciones invalida el modelo.
- Dependencia del encuadre visual: al usar tres cámaras específicas, cualquier cambio de calibración, resolución o posición degradará las predicciones sin aviso.
- Riesgo de alucinación de acciones: como toda política neuronal, puede generar comandos plausibles pero incorrectos ante situaciones fuera de distribución, con el consiguiente riesgo físico en un robot real; se requiere supervisión y paradas de emergencia.
- Idiomas: no se declaran idiomas soportados y las descripciones de tareas del dataset están en inglés; no hay evidencia de funcionamiento con instrucciones en castellano.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero conviene verificar las condiciones del modelo base `lerobot/pi05_base` y de los materiales de Physical Intelligence, cuya licencia no se detalla en la información proporcionada.
- Metadatos incompletos: se desconoce la arquitectura interna, los hiperparámetros de entrenamiento, las cuantizaciones soportadas y el número real de pasos; el nombre del repositorio sugiere 3.000 pasos con semilla 0, pero es una inferencia no confirmada.
- Madurez del artefacto: 0 descargas y 0 interacciones, creado y actualizado el mismo día, sin demostración ni vídeo de despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sam-guided-vlas/train_1_2_hard_items__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_3k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_hard_items__mask__overlay_a75__sim__all_cameras__live
- Blog de π₀.₅ en Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio OpenPI de Physical Intelligence: no se incluye URL explícita en la información proporcionada; se menciona como origen de la implementación
- Resultados de la búsqueda web: no relevantes para este modelo (contenidos sobre una serie de televisión, un fabricante de utillaje y una empresa de cerramientos)
