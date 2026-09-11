# MrDuarte/smolvla-WarehousePick-v1-Sim-DigitalTwin_yolo

## Resumen

smolvla-WarehousePick-v1-Sim-DigitalTwin_yolo es un ajuste fino del modelo SmolVLA (vision-language-action) publicado por el usuario MrDuarte en Hugging Face. Se trata de una política robótica de manipulación entrenada con la librería LeRobot, no de un modelo de lenguaje conversacional: recibe como entrada el estado de un brazo robótico SO-101 (6 dimensiones) más tres flujos de cámara RGB, junto con una instrucción de tarea en lenguaje natural, y devuelve un vector de acción continuo de 6 dimensiones. El modelo base es lerobot/smolvla_base y el ajuste se ha realizado sobre un único dataset de 41 episodios y 13.376 fotogramas grabados a 30 FPS, con la tarea "Lift all parcels and put them in the Green Box".

La relevancia de este tipo de modelos radica en su tamano: 450.046.176 parámetros (aproximadamente 450 millones) según los pesos safetensors del repositorio, lo que lo sitúa en la categoría de VLA compactos que pueden ejecutarse en hardware de consumo, en contraste con alternativas de varios miles de millones de parámetros. El modelo se distribuye con licencia Apache 2.0, lo que facilita su reutilización comercial y su uso como punto de partida para nuevos ajustes.

El repositorio tiene un tamano de 1,2 GB, fue creado el 11 de septiembre de 2026 y no registra descargas ni "likes" en el momento de redactar esta ficha. No incluye resultados de evaluación en robots reales ni métricas de éxito, y las búsquedas web realizadas no han devuelto documentación adicional relevante sobre esta política concreta (los resultados obtenidos no guardan relación con el modelo).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo visión-lenguaje-acción (VLA) entrenado con LeRobot; backbone de visión-lenguaje preentrenado más cabeza de acciones. Detalles completos en arXiv:2506.01844 |
| Parametros totales | 450.046.176 (≈450 M), según los pesos safetensors |
| Parametros activos | No aplica; no se ha documentado como arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; solo se publican pesos en safetensors, sin versiones GGUF, int8 ni int4 |
| Idiomas soportados | No disponible; las instrucciones de tarea se dan en lenguaje natural (el ejemplo de la model card está en inglés) y no se documenta soporte multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot, 1,2 GB) |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | so101_follower |
| Cámaras de entrada | innomaker, intel_rgb, front |
| Espacio de observación de estado | (6,) |
| Espacio de acción | (6,) |

Entradas y salidas declaradas por el autor:

| Feature | Tipo | Forma |
|---|---|---|
| observation.state | STATE | (6,) |
| observation.images.innomaker | VISUAL | (3, 720, 1280) |
| observation.images.intel_rgb | VISUAL | (3, 424, 240) |
| observation.images.front | VISUAL | (3, 720, 1280) |
| action | ACTION | (6,) |

## Arquitectura y entrenamiento

SmolVLA se describe en la model card como un modelo visión-lenguaje-acción compacto y eficiente, capaz de alcanzar rendimiento competitivo con un coste computacional reducido y de desplegarse en hardware de consumo. Esta política concreta es un ajuste fino supervisado (aprendizaje por imitación) del checkpoint lerobot/smolvla_base: consume tres vistas RGB junto con el estado propioceptivo de 6 dimensiones del brazo SO-101 y produce directamente las 6 componentes de acción. La model card no detalla la composición interna del backbone, el número de tokens de entrenamiento ni si se aplicaron etapas de RLHF o DPO; esa información debe consultarse en el paper referenciado (arXiv:2506.01844).

El ajuste se realizó con LeRobot 0.6.1 durante 20.000 pasos, con tamano de lote 28, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. El dataset de entrenamiento es MrDuarte/WarehousePick-v1-Sim-DigitalTwin_yolo, compuesto por 41 episodios, 13.376 fotogramas a 30 FPS (aproximadamente 446 segundos, unos 7,4 minutos de datos de manipulación) y una única tarea: "Lift all parcels and put them in the Green Box". Se trata, por tanto, de un ajuste de dominio muy específico sobre un gemelo digital, con un volumen de datos reducido y sin aumento de datos ni evaluación publicada.

## Capacidades

- Generación de acciones motoras continuas de 6 dimensiones para un brazo SO-101 (so101_follower), a partir de observaciones visuales y propioceptivas.
- Ejecución de una tarea de manipulación concreta: recoger paquetes y depositarlos en una caja verde (pick and place).
- Condicionamiento por instrucción en lenguaje natural: la tarea se pasa como cadena de texto ("Lift all parcels and put them in the Green Box").
- Fusión de tres vistas de cámara simultáneas con resoluciones distintas (720x1280 y 424x240), lo que permite combinar una vista frontal, una cenital o de contexto y una vista de baja resolución tipo sensor de profundidad.
- Integración nativa con el ecosistema LeRobot: despliegue con `lerobot-rollout` y reentrenamiento con `lerobot-train`.
- No soporta tool calling, function calling, razonamiento multi-paso ni uso como agente conversacional: no es un modelo de lenguaje de propósito general.
- No se documentan capacidades de visión general (descripción de imágenes, VQA), audio, matemáticas ni generación de código.

## Casos de uso

- Automatización de picking en almacén simulado: la política está entrenada sobre un gemelo digital de almacén, por lo que puede emplearse para validar células de recogida de paquetes en simulación antes de invertir en hardware real.
- Transferencia sim-a-real en robótica: dado que el entrenamiento proviene de un digital twin, sirve como punto de partida para estudiar la brecha de dominio al desplegar la misma política en un SO-101 físico.
- Docencia y laboratorios de robótica: con 450 M de parámetros y licencia Apache 2.0, es un caso práctico asequible para enseñar aprendizaje por imitación de extremo a extremo con LeRobot.
- Investigación en VLA compactos: permite reproducir el flujo completo (grabación de datos, ajuste fino, rollout) y comparar el efecto del volumen de datos sobre el éxito de la tarea, ya que se parte de 20.000 pasos y 13.376 fotogramas documentados.
- Base para ajustes de dominio específicos: el repositorio incluye el comando `lerobot-train` para reentrenar sobre un dataset propio, lo que lo hace adecuado como inicialización para nuevas tareas de pick and place.
- Prototipado de células robóticas de bajo coste: al caber en GPUs de gama de consumo, se puede ejecutar el bucle de control en el mismo puesto de trabajo que captura las cámaras, sin necesidad de clúster.
- Generación de datos sintéticos etiquetados: la política puede actuar como "profesor" en simulación para producir trayectorias adicionales que amplíen el dataset original.
- Pruebas de integración con cámaras heterogéneas (innomaker, intel_rgb, front) para validar calibración y sincronización de flujos a 30 FPS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica: "No evaluation results have been provided for this policy yet", y no se incluye tabla de éxito en robot real ni en simulación. Las búsquedas web realizadas no arrojaron documentación técnica adicional sobre esta política (los resultados obtenidos no están relacionados con el modelo).

La model card proporciona una plantilla de evaluación con columnas "Task", "Trials", "Successes" y "Success rate", pero está vacía.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 M de parámetros, los pesos ocupan aproximadamente 1,8 GB en fp32 y 0,9 GB en fp16/bf16. Sumando activaciones y el procesado de tres flujos de vídeo a 30 FPS, un presupuesto práctico de 4-8 GB de VRAM es razonable (estimación propia, no publicada por el autor).
- GPU recomendadas: cualquier GPU con 8 GB o más, como RTX 3060, RTX 4060, RTX 2070 o superiores. Una RTX 4090 ejecuta la política con holgura. No se requieren A100 ni H100.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs discretas modernas con 8 GB o más.
- Opciones de despliegue: LeRobot con PyTorch (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento). No son aplicables vLLM, llama.cpp, Ollama ni TGI: el modelo no es un LLM de texto y no se publican pesos GGUF.
- Latencia y throughput: no se publican cifras. El dataset de entrenamiento está grabado a 30 FPS, lo que fija la frecuencia de control de referencia, pero la latencia real de inferencia depende de la GPU y del preprocesado de las tres cámaras. No disponible.
- Almacenamiento: 1,2 GB para el repositorio completo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| smolvla-WarehousePick-v1-Sim-DigitalTwin_yolo | 450.046.176 | No disponible | Apache 2.0 | Hugging Face (LeRobot) |
| lerobot/smolvla_base | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | Hugging Face (LeRobot) |
| Otros VLA de propósito general (por ejemplo, familias OpenVLA o pi0) | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | No disponible en la información proporcionada |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: no se han publicado métricas de éxito ni de velocidad para esta política, y tampoco se detallan en la model card las especificaciones de los modelos comparables. La diferencia principal frente al modelo base es el ajuste de dominio: esta versión está especializada en una única tarea de recogida de paquetes con un robot so101_follower y tres cámaras concretas, mientras que smolvla_base es un modelo generalista.

## Limitaciones y advertencias

- Sin evaluación publicada: no existen datos de tasa de éxito ni en simulación ni en robot real, por lo que no se puede afirmar que la política funcione de forma fiable en producción.
- Dataset muy reducido: 41 episodios y 13.376 fotogramas (unos 7,4 minutos) para una única tarea, lo que limita la generalización a nuevas posiciones de objetos, iluminación, distractores o disposiciones del almacén.
- Especialización extrema: el modelo solo ha visto la tarea "Lift all parcels and put them in the Green Box"; fuera de ese dominio se espera un comportamiento degradado.
- Dependencia del hardware exacto: la política espera las claves de observación `observation.images.innomaker`, `observation.images.intel_rgb` y `observation.images.front` con las resoluciones declaradas; un cambio de cámara, montaje o calibración puede invalidar el modelo.
- Brecha sim-a-real: el nombre del dataset indica un gemelo digital; no se documenta validación en robot físico, por lo que la transferencia no está garantizada.
- Riesgo de sobreajuste y de comportamientos erráticos ante entradas fuera de distribución; en robótica esto implica riesgo físico para personas y equipos, por lo que se requiere supervisión y paradas de emergencia.
- Idiomas y contexto: no se documenta soporte multilingüe ni longitud de contexto; la instrucción de tarea se proporciona en inglés en el ejemplo oficial.
- Uso comercial: la licencia Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece ninguna garantía ni soporte, y la atribución corresponde al método SmolVLA (arXiv:2506.01844) y a LeRobot.
- Trazabilidad limitada: el repositorio no incluye vídeos de demostración, informes de fallos ni detalles del proceso de recolección de datos.
- El identificador del dataset contiene "yolo", pero no se documenta en qué consiste esa anotación ni si la política usa detección de objetos; no debe asumirse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MrDuarte/smolvla-WarehousePick-v1-Sim-DigitalTwin_yolo
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/MrDuarte/WarehousePick-v1-Sim-DigitalTwin_yolo
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout e inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=MrDuarte/WarehousePick-v1-Sim-DigitalTwin_yolo
- Búsqueda web: no se han encontrado enlaces relevantes sobre este modelo; los resultados devueltos no guardan relación con la robótica ni con LeRobot.
