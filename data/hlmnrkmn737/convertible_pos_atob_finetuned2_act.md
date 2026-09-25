# hlmnrkmn737/convertible_pos_AToB_fineTuned2_act

## Resumen

`hlmnrkmn737/convertible_pos_AToB_fineTuned2_act` es una política de robótica basada en ACT (Action Chunking with Transformers), el método de aprendizaje por imitación presentado en el artículo arXiv:2304.13705. No es un modelo de lenguaje: es un controlador visomotor entrenado para ejecutar una tarea de manipulación concreta —recoger una plataforma convertible desde una posición sobre el teclado hasta el borde frontal— sobre un robot tipo `so_follower`. Lo publica el usuario `hlmnrkmn737` mediante LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real, y su licencia es Apache 2.0.

El modelo tiene 51.668.614 parámetros (unos 51,7 M, según los pesos en safetensors) y consume dos observaciones visuales de 480x640 píxeles (`top_view` y `front_view`) más un vector de estado de 6 dimensiones, produciendo como salida un vector de acción también de 6 dimensiones. En lugar de predecir un único paso de acción, ACT predice fragmentos (chunks) de acciones futuras, lo que reduce el error de acumulación y suele mejorar la tasa de éxito en tareas de manipulación.

Su relevancia es práctica y acotada: sirve como ejemplo reproducible de fine-tuning de ACT con LeRobot 0.6.0 sobre un dataset propio de 115 episodios y 97.286 fotogramas a 30 FPS. No incluye resultados de evaluación publicados, cero descargas y cero likes en el momento de redactar esta ficha, por lo que debe tratarse como un artefacto de investigación o de prototipado, no como una política validada para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con CVAE y backbone visual ResNet-18 |
| Parámetros totales | 51.668.614 (51,7 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible / no aplica: no es un modelo de lenguaje; usa action chunking con un horizonte de predicción de acciones |
| Tipos de cuantización | No disponible (pesos distribuidos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible (no procesa lenguaje natural; la tarea se especifica con una cadena de texto fija) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato de LeRobot) |
| Tipo de robot | `so_follower` |
| Cámaras | `top_view`, `front_view` |
| Entradas | `observation.state` (6,), `observation.images.top_view` (3, 480, 640), `observation.images.front_view` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tamaño del repositorio | 0,2 GB |
| Librería | LeRobot 0.6.0 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un transformer encoder-decoder con un cuello de botella variacional condicional (CVAE) y un extractor visual convolucional. En esta implementación, las dos imágenes de 480x640 se procesan con un backbone ResNet-18 y se concatenan con el vector de estado de 6 dimensiones; el decoder genera un chunk de acciones en lugar de un paso único, y en inferencia puede aplicarse ensamblado temporal de los chunks para suavizar la trayectoria. El encoder CVAE solo se utiliza durante el entrenamiento, para modelar la variabilidad de las demostraciones humanas. El detalle de la arquitectura corresponde al artículo ACT (arXiv:2304.13705); la model card no aporta variaciones propias sobre el método.

El entrenamiento se realizó con LeRobot 0.6.0 durante 10.000 pasos, con batch size 8, optimizador AdamW y tasa de aprendizaje 1e-5, con semilla 1000. El dataset de entrenamiento es `hlmnrkmn737/convertible_pos_AToB_fineTuned2_20260925_merged_recomputed_stats`, con 115 episodios, 97.286 fotogramas a 30 FPS, teleoperados sobre la tarea de desplazar la plataforma convertible desde la parte superior del teclado hasta el borde frontal del soporte. No se documenta el uso de RLHF, DPO ni etapas de refinamiento por refuerzo, algo por otra parte poco habitual en políticas de imitación. Tampoco se detalla la composición exacta del dataset más allá de los episodios y fotogramas indicados, ni si hubo aumento de datos o normalización adicional (el nombre del dataset sugiere un recálculo de estadísticas de normalización, pero no se explica en la model card).

## Capacidades

- Control visomotor de manipulación: genera comandos de acción de 6 dimensiones a partir de dos vistas RGB y del estado de las articulaciones.
- Action chunking: predice secuencias cortas de acciones futuras, lo que mejora la estabilidad frente a políticas paso a paso.
- Ejecución de una tarea específica: "pick up the convertible platform from top of keyboard position on support to front edge position" (y su variante en mayúsculas), las dos únicas tareas especificadas en el dataset.
- Integración nativa con LeRobot: se ejecuta con `lerobot-rollout` sobre hardware `so_follower` y puede reentrenarse con `lerobot-train`.
- Condicionamiento por cadena de tarea: la instrucción se pasa como texto fijo en la CLI, no como comprensión libre de lenguaje natural.
- Cámaras fijas: asume exactamente dos cámaras con los nombres `top_view` y `front_view` y resolución 480x640 a 30 FPS.
- Tool calling / function calling: no disponible; no aplica a una política de robótica.
- Agentes y razonamiento multi-paso: no disponible; el modelo no planifica ni razona de forma simbólica, solo imita la distribución de las demostraciones.
- Capacidades multilingües: no disponibles; el modelo no procesa idioma.
- Capacidades especiales (modo thinking, visión general, audio): no disponibles. La visión está limitada a las dos cámaras entrenadas.

## Casos de uso

- Automatización de una operación de pick-and-place concreta: mover la plataforma convertible desde la posición sobre el teclado hasta el borde frontal del soporte. Es el escenario para el que fue entrenada la política y el único con datos de demostración asociados.
- Banco de pruebas de ACT como referencia: sirve como baseline reproducible para comparar variantes de action chunking, ensamblado temporal o configuraciones de fine-tuning con LeRobot 0.6.0.
- Fine-tuning sobre nuevas posiciones o variantes de la misma tarea: al estar publicada con LeRobot y con su dataset asociado, puede servir de punto de partida para ampliar el rango de posiciones u objetos con nuevos episodios teleoperados.
- Prototipado en laboratorio con brazos SO-100/SO-101: permite validar hardware, calibración de cámaras y pipeline de control sin invertir en un modelo de mayor tamaño.
- Estudio de robustez frente a cambios de iluminación y de posición inicial: la política puede desplegarse en un entorno controlado variando condiciones para medir degradación, dado que no hay resultados de evaluación publicados.
- Integración con cámaras cenital y frontal en una celda de trabajo: la política consume exactamente esos dos puntos de vista, así que encaja en montajes que ya dispongan de esa configuración.
- Generación de demostraciones para otras políticas: sus ejecuciones (con `--strategy.type=base` y grabación de episodios) pueden registrarse para alimentar datasets posteriores.
- Docencia y formación en aprendizaje por imitación: es un ejemplo completo y ligero (0,2 GB) de pipeline teleoperación -> dataset -> entrenamiento -> despliegue con LeRobot.
- Despliegue en hardware de borde: con 51,7 M de parámetros, la inferencia es viable en CPU o en GPUs de gama baja, lo que abre la puerta a controladores embebidos junto al robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la sección de evaluación está vacía ("_No evaluation results have been provided for this policy yet_") y que no se ha reportado ningún número de tasa de éxito, ni en robot real ni en simulación. Tampoco se proporcionan métricas de error de acción (MSE/L1) sobre el conjunto de validación. El artículo original de ACT (arXiv:2304.13705) reporta tasas de éxito en tareas reales, pero esos resultados corresponden al método y a sus propios experimentos, no a este checkpoint concreto, y no se reproducen aquí.

## Requisitos de hardware

- Peso de los pesos: ~0,2 GB en safetensors (51,7 M de parámetros), coherente con el tamaño del repositorio.
- VRAM estimada para inferencia: del orden de 1-2 GB incluyendo las activaciones del backbone ResNet-18 sobre dos imágenes de 480x640 y el estado de 6 dimensiones. Es una estimación a partir del tamaño del modelo y de las entradas declaradas, no un dato publicado.
- Cabe en GPU de consumo: sí, con holgura, en cualquier GPU con 4 GB o más (GTX 1650, RTX 3050, RTX 3060, RTX 4090, etc.). También es viable la inferencia en CPU por el reducido número de parámetros.
- GPU recomendadas: para inferencia, cualquier GPU moderna de gama media; para reentrenar con `lerobot-train` durante 10.000 pasos con batch 8, una RTX 3060/4070/4090 es suficiente. No se requiere A100 ni H100.
- Opciones de despliegue: LeRobot mediante la CLI `lerobot-rollout` (con `--policy.path=hlmnrkmn737/convertible_pos_AToB_fineTuned2_act`) y entrenamiento con `lerobot-train`. Otras rutas (vLLM, llama.cpp, Ollama, TGI) no aplican ni están documentadas para este tipo de política. El despliegue en Jetson u otros sistemas embebidos no está documentado en la model card.
- Latencia y throughput: no disponibles. Como referencia de diseño, el dataset se grabó a 30 FPS, por lo que el bucle de control debe sostener ese ritmo para reproducir las condiciones de entrenamiento; no se publica ninguna medición de latencia por inferencia.
- Requisitos de hardware físico: robot `so_follower`, dos cámaras compatibles con OpenCV a 480x640 y 30 FPS, y calibración previa del robot y de las cámaras según la guía de hardware de LeRobot.

## Comparativa con modelos similares

La información proporcionada no incluye datos de otros modelos, por lo que las cifras de las alternativas se marcan como no disponibles. La comparación se ofrece a nivel cualitativo, por categoría de método.

| Modelo | Categoría | Parámetros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| convertible_pos_AToB_fineTuned2_act | Política ACT de imitación, tarea única | 51,7 M | Action chunking, horizonte no especificado | Apache 2.0 | Hugging Face (LeRobot), 0 descargas |
| ACT (implementación de referencia de LeRobot) | Política ACT de imitación | No disponible | Action chunking | Apache 2.0 (LeRobot) | Repositorio LeRobot |
| Diffusion Policy | Política de imitación basada en difusión | No disponible | Predicción de secuencias de acción | No disponible | Repositorio de los autores |
| SmolVLA | VLA compacto con entrada de lenguaje | No disponible | Soporta instrucciones en lenguaje natural | No disponible | Hugging Face |
| OpenVLA | VLA de gran tamaño | No disponible | Soporta instrucciones en lenguaje natural | No disponible | Hugging Face |

Diferencias clave frente a las alternativas de tipo VLA: este checkpoint no acepta instrucciones en lenguaje natural abiertas, no generaliza a objetos o tareas fuera de su distribución de entrenamiento y no incorpora razonamiento de alto nivel; a cambio, es mucho más ligero (51,7 M de parámetros, 0,2 GB), se ejecuta en hardware modesto y está especializado en un único movimiento con dos vistas fijas. Frente a la implementación estándar de ACT, la diferencia es el fine-tuning sobre un dataset propio de 115 episodios y el recálculo de estadísticas que sugiere el nombre del dataset.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasa de éxito, ni número de ensayos, ni métricas de error. Cualquier uso en producción exige una validación propia previa.
- Dataset pequeño y de tarea única: 115 episodios y 97.286 fotogramas para un solo movimiento. El riesgo de sobreajuste a posiciones, iluminación, fondo y disposición concretas del montaje es alto.
- Sensibilidad a la distribución: cambios en la posición inicial de la plataforma, en la iluminación, en el fondo o en la cámara pueden degradar el comportamiento de forma abrupta y no monitorizada.
- Dependencia estricta del hardware: asume el tipo de robot `so_follower` y dos cámaras con los nombres `top_view` y `front_view` a 480x640 y 30 FPS. Nombres o resoluciones distintos rompen la inferencia.
- Riesgo de acciones erráticas: como toda política de imitación, ante entradas fuera de distribución puede generar comandos sin sentido físico. Es imprescindible un botón de parada de emergencia, límites de par y de velocidad en el controlador, y vigilancia humana durante las pruebas.
- Sin capacidades de lenguaje, tool calling ni agentes: no se le puede pedir planificación, explicación ni ejecución de tareas descritas en texto libre; la cadena de tarea es fija.
- Idiomas: no aplica, pero conviene subrayar que no hay soporte multilingüe ni procesamiento de instrucciones en castellano.
- Sesgos: no se documenta ningún análisis de sesgo, y en robótica el sesgo relevante es la sobrerrepresentación de las condiciones de demostración (posiciones, velocidades y estilo de teleoperación concretos).
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, con obligación de conservar avisos de copyright y licencia. No se declaran restricciones adicionales ni cláusulas de uso aceptable.
- Atribución: la model card pide citar el método ACT (arXiv:2304.13705) y LeRobot (Cadene et al.) si se usa la política.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin demo en vídeo ni resultados reproducidos por terceros. Trátese como artefacto no validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hlmnrkmn737/convertible_pos_AToB_fineTuned2_act
- Dataset de entrenamiento: https://huggingface.co/datasets/hlmnrkmn737/convertible_pos_AToB_fineTuned2_20260925_merged_recomputed_stats
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=hlmnrkmn737/convertible_pos_AToB_fineTuned2_20260925_merged_recomputed_stats
- Artículo de ACT: https://huggingface.co/papers/2304.13705
- Artículo de ACT en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Dataset relacionado (grabación previa): https://huggingface.co/datasets/hlmnrkmn737/convertible_pos_AToB_20260916_103413
- Ficha del dataset relacionado en Claru: https://claru.ai/datasets/hlmnrkmn737-convertible-pos-atob-20260916-103413
