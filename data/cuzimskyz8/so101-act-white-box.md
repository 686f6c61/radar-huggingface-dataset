# cuzimskyz8/so101-act-white-box

## Resumen

`cuzimskyz8/so101-act-white-box` es una política de aprendizaje por imitación entrenada con el método ACT (Action Chunking with Transformers) sobre el robot SO-101 en configuración `so_follower`. No es un modelo de lenguaje: es un controlador visomotor que recibe el estado articular (6 dimensiones) y una imagen frontal de 480x640 píxeles, y produce un vector de acción de 6 dimensiones. Su única tarea aprendida es "Pick up the white box and put it into the black bowl" (coger la caja blanca y meterla en el cuenco negro).

El modelo lo publica el usuario `cuzimskyz8` utilizando LeRobot 0.6.1, la librería de Hugging Face para robótica. Cuenta con 51.668.614 parámetros y ocupa aproximadamente 0,2 GB en el repositorio, lo que lo sitúa en la categoría de políticas ligeras capaces de ejecutarse en tiempo real a 30 FPS sobre hardware de consumo. Se entrenó durante 20.000 pasos con un lote de 8 y una tasa de aprendizaje de 1e-5 sobre un dataset propio de 51 episodios y 45.649 fotogramas teleoperados.

Su relevancia es doble: por un lado sirve como ejemplo reproducible de entrenamiento de ACT con la CLI de LeRobot; por otro, es una pieza reutilizable para quien quiera desplegar o afinar una política de pick-and-place sobre el brazo SO-101. La model card no incluye resultados de evaluación en robot real, por lo que su tasa de éxito es desconocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador CVAE sobre secuencias de acción |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; sin variantes GGUF/cuantizadas) |
| Idiomas soportados | no disponible (no aplica; la tarea se especifica mediante una cadena fija) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot 0.6.1 |
| Tipo de robot | so_follower (SO-101) |
| Camaras | front (1 camara) |
| Entradas | observation.state (6,); observation.images.front (3, 480, 640) |
| Salidas | action (6,) |
| Frecuencia de control | 30 FPS (heredada del dataset de entrenamiento) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT combina un codificador tipo CVAE que comprime una secuencia de acciones futuras en una variable latente, un codificador de observaciones (imagen y estado articular) y un decodificador transformer que predice un *chunk* de acciones de una sola pasada en lugar de un único paso. Predecir bloques de acción reduce el error de acumulación típico de las políticas paso a paso y suaviza la señal de control, algo crítico a 30 Hz. El método se describe en el artículo "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705).

Los datos de entrenamiento provienen del dataset `cuzimskyz8/so101_pick_white_box`: 51 episodios teleoperados, 45.649 fotogramas a 30 FPS, con una única cámara frontal y una única tarea. La configuración de entrenamiento registrada en la model card es de 20.000 pasos, batch de 8, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000, ejecutada con LeRobot 0.6.1. No se documenta composición adicional del dataset, aumentos de datos, ni fases de RLHF/DPO (no aplicables a este paradigma). Tampoco se describe ningún mecanismo de decodificación especulativa, atención lineal o innovación más allá del propio *action chunking* del método base.

## Capacidades

- Control visomotor de pick-and-place: genera comandos articulares de 6 grados de libertad a partir de una imagen frontal y del estado del robot.
- Ejecución de la tarea específica "Pick up the white box and put it into the black bowl" aprendida por imitación.
- Predicción de *chunks* de acción, lo que permite un control más estable que una política de paso único a 30 FPS.
- Despliegue en tiempo real mediante `lerobot-rollout` sobre el robot SO-101 en configuración `so_follower`.
- Reutilización como punto de partida para *fine-tuning* con LeRobot (`lerobot-train --policy.type=act`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: son capacidades de modelos de lenguaje y no aplican a esta política.
- No dispone de capacidades multilingües, de visión general (captioning, VQA) ni de audio; la cámara se usa exclusivamente como entrada de control.
- No se documenta ningún modo "thinking", ni variantes de razonamiento explícito.

## Casos de uso

- Automatización de pick-and-place en células de montaje: la política puede colocarse delante de una caja blanca y un cuenco negro y ejecutar la tarea de forma autónoma a 30 Hz sobre un SO-101, sustituyendo el ciclo de teleoperación por inferencia directa.
- Punto de partida para *fine-tuning* de tareas similares: al estar entrenada con ACT sobre SO-101, sirve como inicialización para reentrenar con un dataset propio de otra tarea de manipulación (por ejemplo, coger piezas de otro color) reduciendo el número de episodios necesarios.
- Docencia e investigación en aprendizaje por imitación: es un ejemplo completo y de tamaño reducido (51,7 M de parámetros) para estudiar el flujo íntegro de LeRobot, desde la grabación del dataset hasta el *rollout*.
- Evaluación comparativa de políticas: puede usarse como línea base ACT frente a otras políticas del ecosistema LeRobot (Diffusion Policy, SmolVLA) sobre el mismo dataset y el mismo robot, siempre que se registren métricas propias.
- Generación de *rollouts* para análisis de fallos: ejecutar la política de forma repetida y registrar vídeo permite estudiar sensibilidad a la posición inicial, iluminación o presencia de distracciones antes de un despliegue real.
- Prototipado de robótica de bajo coste: al requerir sólo una GPU modesta y un brazo SO-101, encaja en laboratorios o aulas con presupuesto limitado para validar pipelines de manipulación.
- Demostraciones en ferias o jornadas técnicas: el modelo puede ejecutar la tarea en bucle (`--duration` omitido) como pieza de exhibición, siempre con supervisión y un espacio de trabajo acotado.
- Pruebas de integración de hardware: verificar la calibración del brazo, la cámara frontal y el cableado antes de invertir en un dataset mayor, ya que el modelo falla de forma visible si las observaciones no coinciden con las de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política (`No evaluation results have been provided for this policy yet.`), por lo que no existe tasa de éxito medida en robot real ni número de ensayos documentado. Tampoco se aportan resultados en simulador.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,21 GB en FP32 (51.668.614 parámetros x 4 bytes) y unos 0,10 GB en FP16. El repositorio completo ocupa 0,2 GB, por lo que el modelo cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: cualquiera con soporte CUDA es suficiente; una RTX 3060 o superior garantiza margen para el preprocesado de imagen y el bucle de control a 30 FPS. RTX 4090, A100 o H100 son innecesarias para este tamaño y sólo aportan latencia extra despreciable.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU consumer con CUDA de los últimos años (GTX 1060 en adelante, en la práctica RTX 2060 o superior). También es viable en hardware embebido tipo Jetson Orin, con la salvedad de que la latencia debe medirse en el propio equipo para confirmar los 30 Hz.
- Inferencia en CPU: técnicamente posible dado el tamaño, pero no hay datos publicados de latencia; es probable que no alcance los 30 FPS exigidos por la frecuencia de control del dataset.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=cuzimskyz8/so101-act-white-box`), y entrenamiento/afinado con `lerobot-train`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que son runtimes para modelos de lenguaje.
- Latencia y throughput estimados: no disponibles. La única referencia es la frecuencia de captura y control de 30 FPS del dataset (45.649 fotogramas en 51 episodios).

## Comparativa con modelos similares

| Modelo | Metodo | Parametros totales | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101-act-white-box (este) | ACT (imitation learning) | 51.668.614 | Chunk de acción: no disponible | apache-2.0 | Hugging Face Hub, via LeRobot |
| Diffusion Policy | Difusión sobre acciones | no disponible | no disponible | no disponible | Implementada en el ecosistema LeRobot |
| SmolVLA | Vision-language-action | no disponible | no disponible | no disponible | Hugging Face / LeRobot |
| ACT original (ALOHA, arXiv:2304.13705) | ACT (imitation learning) | no disponible | no disponible | no disponible | Publicación cientifica y codigo asociado |

La comparación cuantitativa no es posible con la informacion disponible: la model card no aporta cifras de éxito ni de latencia de ninguno de estos sistemas. La diferencia relevante es cualitativa: este repositorio es un checkpoint concreto y de una sola tarea sobre SO-101, mientras que Diffusion Policy y SmolVLA son familias de métodos genéricos que requieren entrenamiento propio para cada robot y tarea.

## Limitaciones y advertencias

- Especialización extrema: la política sólo ha visto una tarea ("Pick up the white box and put it into the black bowl") y 51 episodios. Cualquier variación de objeto, color, forma o posición objetivo queda fuera de su distribución de entrenamiento.
- Sin resultados de evaluación publicados: no hay tasa de éxito, número de ensayos ni condiciones de prueba, por lo que no puede afirmarse que la política funcione de forma fiable en producción.
- Una única cámara frontal: si el punto de vista cambia (altura, ángulo, distancia focal) la política probablemente falle, ya que la imagen es la principal fuente de información visomotora.
- Dependencia del robot: entrenada para `so_follower` con 6 dimensiones de estado y 6 de acción; no es transferible directamente a otros brazos ni a configuraciones bimanuales.
- Sensibilidad esperable a iluminación, fondo, oclusión y presencia de distractores; son factores que la model card sugiere registrar explícitamente en la evaluación, que aquí no existe.
- Riesgo de sobreajuste por dataset reducido (51 episodios): la política puede memorizar trayectorias concretas en lugar de generalizar la habilidad.
- No hay información sobre sesgos del dataset (posiciones, colores, texturas dominantes) ni sobre su procedencia demográfica, algo relevante porque la teleoperación introduce el sesgo del operador.
- Licencia apache-2.0: permite uso comercial y modificación siempre que se conserve el aviso de copyright y la atribución. La licencia del dataset subyacente debe verificarse por separado antes de reutilizarlo.
- Al ser un modelo de control, no genera texto ni contenido; las advertencias típicas sobre alucinación lingüística no aplican, pero sí el riesgo de ejecutar acciones erráticas en presencia de observaciones fuera de distribución. Cualquier despliegue real debe contar con parada de emergencia y espacio de trabajo delimitado.
- Sin soporte de instrucciones en lenguaje natural variable: la tarea se pasa como cadena fija en el comando de despliegue y debe coincidir con la de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cuzimskyz8/so101-act-white-box
- Dataset de entrenamiento: https://huggingface.co/datasets/cuzimskyz8/so101_pick_white_box
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=cuzimskyz8/so101_pick_white_box
- Articulo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a hilos de un foro de navegador sin relacion con el contenido.
