# rasheeddo/policy_pi05_marker_cup

## Resumen

`rasheeddo/policy_pi05_marker_cup` es una política robótica de tipo Vision-Language-Action (VLA) publicada en HuggingFace por el usuario rasheeddo. No es un modelo de lenguaje general: es un *checkpoint* de imitación afinado a partir de `lerobot/pi05_base`, la implementación en LeRobot del modelo π₀.₅ de Physical Intelligence, y está especializado en una única tarea física: coger un rotulador y meterlo en un vaso ("Grab marker and put in cup"). El modelo consume el estado articular del robot junto con tres flujos de cámara y devuelve un vector de acción de 6 dimensiones.

Técnicamente, el checkpoint contiene 4.143.404.816 parámetros (unos 4,14 mil millones) en formato safetensors, con un repositorio de 9,4 GB. La política se entrenó con 10.000 pasos, batch de 16 y optimizador AdamW con tasa de aprendizaje 2,5e-05 sobre un dataset propio de 80 episodios y 58.556 fotogramas grabados a 30 FPS con un robot `so_follower`. La licencia es Apache 2.0.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible del flujo de trabajo de *fine-tuning* de un VLA de gran tamaño (π₀.₅) sobre un robot de bajo coste del ecosistema SO-101/LeRobot. Es útil para quien quiera inspeccionar cómo se estructura un *policy* de LeRobot, qué observaciones espera y cómo se despliega, más que como modelo listo para producción en tareas diversas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); implementación LeRobot de π₀.₅ (Physical Intelligence). Detalles internos de capas no disponibles |
| Parametros totales | 4.143.404.816 (≈4,14 mil millones), según safetensors |
| Parametros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible (procesa 3 cámaras y una instrucción de tarea, sin contexto textual declarado) |
| Tipos de cuantizacion | No disponible (el repositorio distribuye safetensors sin variantes cuantizadas) |
| Idiomas soportados | No disponible (la condicion textual de tarea se usa en inglés: "Grab marker and put in cup") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Parametros de entrada | `observation.state` (6,), `observation.images.front` (3, 480, 640), `observation.images.wrist` (3, 480, 640), `observation.images.empty_camera_0` (3, 224, 224) |
| Parametros de salida | `action` (6,) |
| Robot objetivo | `so_follower` (SO-101) |
| Modelo base | `lerobot/pi05_base` |

## Arquitectura y entrenamiento

La model card indica que se trata de una adaptación en LeRobot de π₀.₅ (Pi05), un modelo Vision-Language-Action de Physical Intelligence diseñado para generalización en entornos abiertos, que evoluciona π₀ para generalizar a situaciones no vistas durante el entrenamiento. La implementación de LeRobot está adaptada del repositorio OpenPI de los propios autores. No se proporcionan en la información disponible detalles sobre el número de capas, el mecanismo de atención, el *tokenizer* de acciones ni el esquema de decodificación (flow matching u otro).

El entrenamiento es un *fine-tuning* de imitación sobre el dataset `rasheeddo/marker_cup_20260916_205331`: 80 episodios, 58.556 fotogramas a 30 FPS, una única tarea ("Grab marker and put in cup"). La configuración declarada es de 10.000 pasos, batch de 16, optimizador AdamW, tasa de aprendizaje 2,5e-05, semilla 1000 y LeRobot 0.6.2. No se documenta el uso de RLHF, DPO ni ninguna fase de alineación adicional; es aprendizaje por imitación supervisado sobre demostraciones de teleoperación. Tampoco se detalla la composición del dataset más allá del número de episodios y la tarea.

## Capacidades

- Generación de acciones motoras continuas: produce un vector de acción de 6 dimensiones adecuado para un brazo `so_follower`.
- Control visomotor de tarea única: ejecuta la secuencia "coger rotulador y ponerlo en el vaso" a partir de imágenes de cámara y del estado articular.
- Fusión multimodal de tres cámaras: dos cámaras a 480x640 (`front` y `wrist`) y una a 224x224 (`empty_camera_0`), además del estado de 6 articulaciones.
- Condicionamiento por instrucción de tarea: acepta el campo `--task` en la CLI de rollout para fijar el objetivo en lenguaje natural.
- Integración nativa con LeRobot: se ejecuta con `lerobot-rollout` y se reentrena con `lerobot-train`.
- No dispone de soporte documentado de *tool calling*, function calling, agentes, razonamiento multi-paso, ni capacidades de audio o visión generalista fuera del bucle de control robótico.
- Capacidades multilingües: no disponibles; no hay evidencia de que la instrucción de tarea funcione en otros idiomas.

## Casos de uso

- Despliegue de referencia en un SO-101: ejecutar la política con `lerobot-rollout --strategy.type=base --policy.path=rasheeddo/policy_pi05_marker_cup` sobre el brazo `so_follower` para reproducir la tarea de recoger el rotulador y depositarlo en el vaso, sirviendo como prueba de humo del *hardware* y del *pipeline* de cámaras.
- Validación de una instalación de LeRobot 0.6.2: el checkpoint fija las versiones y la configuración exacta (10.000 pasos, batch 16, lr 2,5e-05), lo que permite comprobar que el entorno de entrenamiento e inferencia funciona antes de abordar proyectos propios.
- Material docente de imitación robótica: al tener una tarea trivial y un dataset pequeño y público (80 episodios, 58.556 fotogramas), es un ejemplo manejable para explicar el ciclo captura-dataset-entrenamiento-despliegue en robótica de bajo coste.
- Punto de partida para *fine-tuning* de nuevas tareas de pick-and-place: usar `lerobot/pi05_base` como base y este checkpoint como referencia de configuración de hiperparámetros para tareas como recoger piezas pequeñas y colocarlas en contenedores.
- Investigación sobre generalización y sobreajuste en VLA: comparar el comportamiento en posiciones nuevas del rotulador o del vaso, cambios de iluminación o presencia de distractores frente al rendimiento en la distribución de entrenamiento.
- Pruebas de latencia y *throughput* de un VLA de 4,14 mil millones de parámetros en una GPU concreta: medir si el bucle de control mantiene una frecuencia compatible con los 30 FPS con los que se grabó el dataset.
- Integración en una celda automatizada de laboratorio: usar la política como controlador de bajo nivel para una estación que manipule objetos pequeños, con supervisión humana y parada de seguridad.
- Recolección de datos activa: emplear la política como política inicial para practicar rollouts y detectar los fallos concretos que justifican grabar nuevos episodios y reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección de evaluación vacía, con la nota explícita: "No evaluation results have been provided for this policy yet". No hay tabla de ensayos, éxitos ni tasa de acierto para la tarea.

| Tarea | Ensayos | Éxitos | Tasa de éxito |
|---|---|---|---|
| No disponible | No disponible | No disponible | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,3 GB solo para pesos en bf16/fp16 (4,14 mil millones de parámetros a 2 bytes), más activaciones de tres cámaras (dos a 480x640 y una a 224x224); en la práctica, del orden de 10-14 GB. Estimación propia, no facilitada por el autor.
- En fp32, los pesos solos ocuparían unos 16,6 GB.
- GPU recomendadas para inferencia en bf16: NVIDIA RTX 4090 o RTX 3090 (24 GB) son suficientes con margen; RTX 4080 (16 GB) queda ajustada. A100 y H100 son válidas y preferibles para servir varios entornos o para reentrenar.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB y probablemente en 16 GB con cuidado del tamaño de batch y de la resolución efectiva de las cámaras.
- Para *fine-tuning* con `lerobot-train`: se recomienda hardware de centro de datos (A100 40/80 GB, H100) por el coste de memoria de estados del optimizador sobre 4,14 mil millones de parámetros.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, estrategia `base`), PyTorch con CUDA y el repositorio OpenPI adaptado. vLLM, llama.cpp, Ollama y TGI no son aplicables, ya que el modelo no es un generador de texto autorregresivo.
- Almacenamiento: el repositorio ocupa 9,4 GB.
- Latencia y throughput: no disponibles. El dataset de entrenamiento se grabó a 30 FPS, lo que marca la frecuencia objetivo del bucle de control, pero no se han publicado mediciones del tiempo de inferencia.
- Requisito de configuración: los nombres de cámara deben coincidir exactamente con las claves de observación (`front`, `wrist`, `empty_camera_0`); si no, la política no recibirá las entradas esperadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rasheeddo/policy_pi05_marker_cup | 4.143.404.816 | 3 cámaras + estado de 6 articulaciones; contexto textual no disponible | Sin resultados de evaluación publicados | Apache 2.0 | HuggingFace, librería `lerobot` |
| lerobot/pi05_base | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | Apache 2.0 (según la cadena de modelos base) | HuggingFace, `lerobot` |
| Otras políticas del ecosistema LeRobot (ACT, Diffusion Policy, SmolVLA) | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | No disponible en la información proporcionada | Repositorio LeRobot / HuggingFace |

No se dispone de datos comparativos de parámetros, contexto ni rendimiento para los modelos alternativos dentro de la información proporcionada; cualquier cifra adicional requeriría consultar sus propias fichas.

## Limitaciones y advertencias

- Especialización extrema: entrenado únicamente sobre la tarea "Grab marker and put in cup" con 80 episodios. No debe esperarse generalización a otras tareas, objetos o instrucciones.
- Ausencia total de evaluación: no hay tasa de éxito medida en el mundo real, ni ensayos, ni análisis de fallos. Cualquier uso en producción es a ciegas respecto a su fiabilidad.
- Riesgo de acciones fuera de distribución: ante posiciones, iluminación o fondos distintos a los del dataset, la política puede generar trayectorias erráticas, con riesgo físico para el robot, los objetos y las personas cercanas.
- Sesgo de dominio: el modelo hereda los sesgos visuales del dataset (color y forma del rotulador, del vaso, condiciones de luz, tipo de mesa) y del modelo base π₀.₅. No hay documentación sobre sesgos demográficos ni de otro tipo.
- Dependencia estricta de la configuración: el robot debe ser un `so_follower` y las cámaras deben llamarse `front`, `wrist` y `empty_camera_0`. Una discrepancia de nombre o de resolución rompe la inferencia.
- Cámara `empty_camera_0`: el propio nombre sugiere que se trata de una entrada no utilizada realmente; conviene verificar si aporta señal o solo ocupa memoria.
- Idiomas: no hay evidencia de que las instrucciones de tarea funcionen fuera del inglés; el condicionamiento lingüístico no está documentado como multilingüe.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se debe mantener el aviso de licencia y citar LeRobot y el método original según la model card.
- Mantenimiento: el modelo tiene 0 descargas y 0 *likes* en el momento de la consulta, sin historial de uso ni de incidencias que permita juzgar su robustez.
- No es un modelo de lenguaje: no sirve para generar texto, responder preguntas, escribir código ni para *tool calling*. Cualquier expectativa en ese sentido es un error de categoría.
- Seguridad en despliegue: al tratarse de control motor real, es imprescindible limitar velocidades y fuerzas, definir paradas de emergencia y supervisar los primeros rollouts.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rasheeddo/policy_pi05_marker_cup
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/rasheeddo/marker_cup_20260916_205331
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=rasheeddo/marker_cup_20260916_205331
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guía de imitación (grabar datos y entrenar): https://huggingface.co/docs/lerobot/en/il_robots

Los resultados de la búsqueda web realizada no contenían enlaces relevantes sobre este modelo; el listado anterior procede de la información de HuggingFace y de la model card.
