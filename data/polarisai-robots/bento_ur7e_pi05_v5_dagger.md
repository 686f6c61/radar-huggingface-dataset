# polarisai-robots/bento_ur7e_pi05_v5_dagger

## Resumen

`bento_ur7e_pi05_v5_dagger` es una política viso-lenguaje-acción (VLA) publicada por el usuario `polarisai-robots` en Hugging Face, obtenida por ajuste fino de `lerobot/pi05_base`, que a su vez es la implementación en LeRobot del modelo π0.5 de Physical Intelligence. El modelo no genera texto: consume tres imágenes RGB de 224×224 píxeles y un vector de estado de 32 dimensiones, y emite una acción continua de 7 dimensiones para un brazo robótico Universal Robots UR7E. El problema que resuelve es el control end-to-end de una tarea de manipulación concreta: empaquetar fiambreras (bento/lunchbox) con piezas de pollo frito, filetes de pescado, salchichas y brócoli.

La relevancia de esta ficha no está en el rendimiento —el autor no ha publicado ninguna evaluación— sino en que documenta un flujo completo de imitación con LeRobot: 449 episodios y 849.750 fotogramas grabados a 60 FPS, 30.000 pasos de entrenamiento con AdamW y un checkpoint de 4.143.404.816 parámetros (≈4,14 mil millones) en safetensors. Es, por tanto, un ejemplo real de adaptación de un VLA generalista a una celda de trabajo industrial con un robot y dos tareas fijas.

El sufijo `dagger` del nombre del repositorio sugiere una iteración con datos de agregación tipo DAgger (correcciones humanas sobre los fallos de la política), aunque la model card no documenta ese proceso ni lo cuantifica, por lo que debe tratarse como una inferencia a partir del nombre, no como un dato confirmado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) derivada de π0.5, con co-entrenamiento en datos heterogéneos; implementación LeRobot del repositorio OpenPI. Detalle interno de capas no disponible |
| Parámetros totales | 4.143.404.816 (≈4,14 mil millones) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible (la entrada es un conjunto fijo de 3 imágenes 224×224 + vector de estado de 32 dimensiones) |
| Tipos de cuantización | No disponible; el autor solo publica pesos en safetensors, sin variantes cuantizadas documentadas |
| Idiomas soportados | No disponible; las dos instrucciones de tarea del dataset están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repositorio de 9,4 GB) |

Otros datos de entrada/salida declarados por el autor:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.images.base_0_rgb` | Visual | (3, 224, 224) |
| `observation.images.left_wrist_0_rgb` | Visual | (3, 224, 224) |
| `observation.images.right_wrist_0_rgb` | Visual | (3, 224, 224) |
| `observation.state` | Estado | (32,) |
| `action` | Acción | (7,) |

## Arquitectura y entrenamiento

La model card describe π0.5 como un modelo viso-lenguaje-acción de Physical Intelligence diseñado para generalización en mundo abierto, que evoluciona π0 mediante co-entrenamiento sobre datos heterogéneos (paper arXiv 2504.16054). La implementación disponible en LeRobot se adapta del repositorio OpenPI. La información proporcionada no detalla el número de capas, el codificador visual, el mecanismo de generación de acciones ni el número total de tokens de preentrenamiento, por lo que esos puntos quedan como no disponibles.

El ajuste fino de este checkpoint está documentado con precisión: 30.000 pasos, batch de 32 (≈960.000 muestras procesadas si el batch se cuenta en muestras), optimizador AdamW, tasa de aprendizaje 5e-05, semilla 1000 y LeRobot 0.6.0. El dataset `polarisai-robots/bento_ur7e_v3` contiene 449 episodios, 849.750 fotogramas a 60 FPS (unas 3,9 horas de datos brutos) y dos tareas: «Pack me a lunchbox with two fried chicken pieces and two brocolli.» y «Pack me a lunchbox with two fish fillet and three sausages.». No se documenta si hubo RLHF, DPO ni fases de refuerzo; en un VLA de imitación lo habitual es entrenamiento supervisado sobre acciones, pero el autor no lo especifica.

## Capacidades

- Control robótico end-to-end: mapea observaciones visuales y de estado a una acción continua de 7 dimensiones, adecuada para una pinza o efector de 6 DoF más apertura.
- Manipulación condicionada por lenguaje: la tarea se especifica con una cadena de texto en inglés en el momento de la ejecución (`--task=...`).
- Percepción multi-cámara: procesa tres vistas simultáneas (base y dos muñecas) a 224×224.
- Ejecución de secuencias de empaquetado: selección y colocación de piezas de comida en una fiambrera según la composición pedida.
- Integración con el ecosistema LeRobot: se ejecuta con `lerobot-rollout` y se reentrena con `lerobot-train`.
- Punto de partida para ajuste fino: al derivar de `lerobot/pi05_base`, sirve como inicialización para nuevos datasets y robots.
- No soporta tool calling, function calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito: no es un modelo de lenguaje conversacional.

## Casos de uso

- Empaquetado automatizado de fiambreras en una celda con UR7E: la política recibe las tres cámaras y el estado del brazo y genera las acciones de recogida y colocación de pollo, pescado, salchichas y brócoli; encaja porque las dos tareas del dataset son exactamente esas composiciones.
- Pick-and-place de alimentos con pinza de 7 dimensiones: la salida de 7 valores se corresponde con la dimensionalidad típica de un efector con apertura, lo que permite usarla sin capa de adaptación.
- Iteración con DAgger: desplegar el checkpoint, registrar correcciones por teleoperación sobre los fallos y reentrenar con `lerobot-train` partiendo de este modelo; el sufijo `dagger` indica que el autor ya trabaja en ese ciclo.
- Base para fine-tuning en una línea de producción propia: sustituir el dataset por grabaciones del nuevo robot y reutilizar los hiperparámetros publicados (30.000 pasos, batch 32, lr 5e-05) como punto de partida reproducible.
- Validación de un pipeline de datos LeRobot: el dataset de 449 episodios y 849.750 fotogramas a 60 FPS permite comprobar de extremo a extremo la grabación, la visualización y el entrenamiento antes de invertir en datos propios.
- Comparación de checkpoints: junto con `bento_ur7e_pi05_v2` y `bento_ur7e_v1_pi05` del mismo autor, permite medir si las sucesivas iteraciones mejoran la tasa de éxito en las mismas dos tareas.
- Docencia y demostración de VLA: ejemplo compacto (4,14 mil millones de parámetros) de adaptación de un modelo generalista a un robot concreto para cursos de robótica o aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card incluye la sección de evaluación vacía con la frase «No evaluation results have been provided for this policy yet», por lo que no existen tasas de éxito en robot real, ni comparaciones con π0.5 completo u otras políticas.

## Requisitos de hardware

- VRAM estimada (cálculo a partir del número de parámetros, no confirmado por el autor): en bf16/fp16, unos 8,3 GB solo para los pesos; con codificadores visuales y activaciones para batch 1, una horquilla realista de 10-14 GB. En fp32 serían unos 16,6 GB.
- Cuantización a int8 (≈4,1 GB) o int4 (≈2,1 GB): técnicamente posible por tamaño, pero no documentada ni validada para esta política; no se debe asumir que LeRobot la soporte sin probarla.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para despliegue y reentrenamiento; RTX 4090 o RTX 3090 (24 GB) para inferencia y ajuste fino con batch pequeño.
- ¿Cabe en GPU de consumo? Sí en 24 GB (RTX 4090, RTX 3090) con margen; en 16 GB (RTX 4080, RTX 4060 Ti 16 GB) el margen es ajustado y conviene reducir batch. No cabe en tarjetas de 8 GB.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` y `--policy.path=polarisai-robots/bento_ur7e_pi05_v5_dagger`, sobre PyTorch y CUDA. vLLM, TGI, llama.cpp y Ollama no son aplicables: no es un modelo de lenguaje con decodificación de tokens.
- Latencia y throughput: no disponibles. Como referencia de exigencia temporal, el dataset se grabó a 60 FPS y el comando de ejemplo del autor configura las cámaras a 30 FPS y 640×480, de modo que la política debe sostener el bucle de control a esa frecuencia o superior.
- Almacenamiento: 9,4 GB de repositorio, más el dataset asociado para reentrenar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea / robot | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `polarisai-robots/bento_ur7e_pi05_v5_dagger` | 4,14 mil millones | No disponible | Empaquetado de fiambreras en UR7E, 2 tareas | Apache 2.0 | 8 descargas, 0 likes |
| `lerobot/pi05_base` | No disponible en la información | No disponible | VLA base generalista π0.5 (LeRobot) | No disponible en la información | Modelo base referenciado |
| `polarisai-robots/bento_ur7e_pi05_v2` | No disponible | No disponible | Ajuste fino previo del mismo autor sobre UR7E | No disponible en la información | Publicado en el Hub |
| `polarisai-robots/bento_ur7e_v1_pi05` | No disponible | No disponible | Primera iteración del mismo autor sobre UR7E | No disponible en la información | Publicado en el Hub |

No se dispone de datos de rendimiento de ninguno de los cuatro modelos, por lo que la comparación se limita a linaje, tarea y licencia. La alternativa conceptual es π0.5 original de Physical Intelligence (paper arXiv 2504.16054), sin métricas disponibles en esta información.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito, número de ensayos ni condiciones de prueba; no se puede afirmar que la política funcione fuera del dataset de entrenamiento.
- Alcance muy estrecho: solo dos tareas de empaquetado de fiambreras sobre un UR7E; cualquier cambio de objeto, de recipiente o de robot invalida la política.
- Vocabulario de instrucciones en inglés y muy literal («Pack me a lunchbox with...»); no hay evidencia de generalización a paráfrasis.
- Posible sobreajuste: 449 episodios y 30.000 pasos sobre un modelo de 4,14 mil millones de parámetros, sin regularización documentada ni conjunto de validación.
- Inconsistencia en la propia model card: la sección de detalles indica cámaras `top` y `wrist` (dos), mientras que la tabla de entradas declara tres vistas (`base_0_rgb`, `left_wrist_0_rgb`, `right_wrist_0_rgb`). Hay que verificar los nombres de cámara antes de ejecutar `lerobot-rollout`.
- Desajuste de frecuencia: datos a 60 FPS frente a un ejemplo de ejecución con cámaras a 30 FPS; conviene comprobar el efecto en la estabilidad del bucle de control.
- El proceso DAgger implícito en el nombre no está documentado: no se sabe cuántas correcciones humanas se añadieron ni cómo se mezclaron con los datos originales.
- Validación comunitaria prácticamente nula (8 descargas, 0 likes), por lo que no existen informes independientes de funcionamiento.
- Licencia Apache 2.0 permite uso comercial y modificación, pero conviene verificar los términos del modelo base `lerobot/pi05_base` y de los datos de entrenamiento antes de un despliegue en producción.
- Riesgo físico: es una política de control real; los fallos se traducen en movimientos incorrectos del brazo. Debe operarse con límites de par, paradas de emergencia y espacio de trabajo despejado.
- El riesgo de alucinación textual no aplica; el equivalente es la ejecución de una trayectoria plausible pero incorrecta cuando la escena se sale de la distribución de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/polarisai-robots/bento_ur7e_pi05_v5_dagger
- Dataset de entrenamiento: https://huggingface.co/datasets/polarisai-robots/bento_ur7e_v3
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=polarisai-robots/bento_ur7e_v3
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π0.5 (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Paper π0.5 (arXiv 2504.16054): https://arxiv.org/abs/2504.16054
- Versión HTML del paper: https://arxiv.org/html/2504.16054v1
- PDF del paper: https://www.pi.website/download/pi05.pdf
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de π0.5 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Iteración previa v2: https://huggingface.co/polarisai-robots/bento_ur7e_pi05_v2
- Primera iteración v1: https://huggingface.co/polarisai-robots/bento_ur7e_v1_pi05
