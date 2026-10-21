# jinyoonok/interactive-robotics_lab3_act-pick-doll

## Resumen

`jinyoonok/interactive-robotics_lab3_act-pick-doll` es una política de imitación basada en ACT (Action Chunking with Transformers) entrenada con LeRobot 0.6.2 para que un brazo robótico SO-ARM101 Follower coja un muñeco y lo levante de la mesa. No es un modelo de lenguaje ni un modelo fundacional: es un checkpoint de control motor específico de tarea, con 51.668.614 parámetros y un backbone visual ResNet-18, publicado como entregable de la práctica "CS6501 Lab 3" por un equipo de cinco personas (Jinyoon Kim, Austin Song, Boyang Yan, Sai Tarra y Harris Ilyas).

El modelo consume una imagen RGB frontal de 640 x 480 a 30 FPS y el estado de seis articulaciones del seguidor, y produce acciones de posición articular en trozos (chunks) de longitud 100. Se entrenó durante 20.000 pasos de optimizador con batch de 32 sobre un dataset propio de 25 episodios teleoperados y 7.568 fotogramas, en una GPU CUDA de UVA Rivanna.

Su relevancia es práctica y acotada: sirve como referencia reproducible de un pipeline completo de imitación robótica con LeRobot (recolección teleoperada, entrenamiento ACT, despliegue en robot real), y como línea base para quien quiera comparar o reentrenar políticas ACT sobre el brazo SO-101. El autor no declara tasa de éxito en robot real ni resultados de benchmarks; las comprobaciones publicadas verifican que los pesos cargan y que la inferencia devuelve seis acciones finitas, no que la tarea se resuelva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con backbone visual ResNet-18 |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (no es un modelo de lenguaje; entrada = 1 imagen RGB 640 x 480 + vector de estado de 6 articulaciones) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin variantes cuantizadas en el repo) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 0,2 GB, librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un transformer que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de acumulación típico del comportamiento reactivo paso a paso. En esta implementación el codificador visual es una ResNet-18 que procesa la cámara `front`, y la cabeza de política emite 6 acciones de posición articular con chunks de longitud 100. La entrada de estado son los seis valores de las articulaciones del Follower; no se usa profundidad ni ninguna otra modalidad sensorial. El entrenamiento se realizó con LeRobot 0.6.2 en una GPU CUDA de UVA Rivanna, con 20.000 pasos de optimizador, batch de 32, semilla 100000, checkpoint cada 5.000 pasos, 1 worker de DataLoader y decodificación de vídeo con PyAV.

Los datos provienen del dataset `jinyoonok/interactive-robotics_lab3_pick-doll`: 25 episodios teleoperados y 7.568 fotogramas aportados por los cinco miembros del equipo, con las grabaciones originales preservadas en `raw/`. El entrenamiento finalizó con pérdida 0,056, pérdida L1 0,053 y pérdida KL que aparece como 0,000 a la precisión del registro. El propio autor advierte que la pérdida de entrenamiento no mide el éxito en robot real. No se documenta en la información disponible el uso de RLHF, DPO ni un esquema de aumento de datos; el checkpoint publicado es el paso 20.000 de `lab3-act-team-20k-01` y no incluye estado de optimizador ni de generador de números aleatorios.

## Capacidades

- Control de manipulación de una sola tarea: coger un muñeco y levantarlo despejándolo de la mesa con un SO-ARM101 Follower.
- Predicción de acciones en chunks de 100 pasos a partir de una imagen RGB y del estado de 6 articulaciones.
- Ejecución en el bucle de inferencia de robot real de LeRobot, con cámara llamada `front` y la calibración guardada del Follower.
- Inferencia en CPU: el autor indica que el portátil de prueba usa CPU, además de la configuración de entrenamiento en CUDA.
- Carga estricta de pesos verificada, procesadores guardados cargados en CPU e inferencia sintética con seis acciones finitas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, generación de texto, visión general, audio ni capacidades multilingües: no es un modelo de lenguaje ni un VLM.
- No hay evidencia publicada de generalización a objetos, cámaras o espacios de trabajo distintos de los de recolección.

## Casos de uso

- Docencia y prácticas de robótica: reproduce de extremo a extremo un flujo de imitación (teleoperación, entrenamiento ACT, despliegue) sobre hardware de bajo coste tipo SO-101, útil como plantilla para asignaturas de aprendizaje por imitación.
- Línea base de comparación: sirve para medir nuevas políticas (Diffusion Policy, ACT con otras variantes) en la misma tarea y el mismo montaje, reutilizando el dataset de 25 episodios como referencia fija.
- Reentrenamiento con datos propios: partiendo de este checkpoint y del pipeline LeRobot 0.6.2 documentado (`config.json`, `train_config.json`), se puede adaptar la política a otro objeto o a otra posición inicial recogiendo episodios nuevos.
- Validación de infraestructura de despliegue: comprueba que el pipeline de inferencia (procesadores, normalización, calibración del Follower, cámara `front`) funciona antes de invertir en un modelo mayor.
- Prototipos de pick-and-place supervisado en mesa: tareas de recogida y elevación de un objeto blando en un espacio de trabajo acotado, siempre con operador presente y base del brazo asegurada.
- Recolección de datos asistida: el montaje y las convenciones del dataset (640 x 480 a 30 FPS, 6 articulaciones, sin profundidad) sirven de especificación para estandarizar nuevas grabaciones del equipo.
- Estudio de robustez visual: al depender solo de una cámara RGB frontal, es un caso útil para analizar sensibilidad a cambios de iluminación, encuadre y enfoque, manteniendo constantes el resto de variables.

## Benchmarks y rendimiento

El `model-index` de la model card declara el modelo "CS6501 Lab 3 ACT Pick Doll" con la lista de resultados vacía. No se han publicado resultados de benchmarks en la información disponible, y el autor indica explícitamente que no reclama ninguna tasa de éxito y que los resultados de evaluación en robot real se documentan aparte, en el informe de la práctica.

Los únicos números publicados son métricas de entrenamiento, que no equivalen a rendimiento en tarea:

| Metrica | Valor | Nota |
|---|---|---|
| Pérdida total (paso 20.000) | 0,056 | pérdida de entrenamiento |
| Pérdida L1 | 0,053 | pérdida de entrenamiento |
| Pérdida KL | 0,000 | tal como aparece a la precisión del registro |
| Pasos de optimizador | 20.000 | batch 32, semilla 100000 |
| Episodios de entrenamiento | 25 | 7.568 fotogramas, 5 miembros del equipo |
| Tasa de éxito en robot real | no disponible | no reclamada por el autor |

## Requisitos de hardware

- VRAM estimada: con 51,7 M de parámetros, los pesos en fp32 ocupan del orden de 0,2 GB (el repo completo pesa 0,2 GB); la inferencia cabe holgadamente en cualquier GPU consumer con 2-4 GB de VRAM, aunque el dato exacto de memoria pico no está disponible.
- GPU recomendadas: no se especifica ninguna; el entrenamiento usó una GPU CUDA de UVA Rivanna sin modelo concreto en la información disponible. Para inferencia, cualquier GPU NVIDIA consumer reciente es suficiente por tamaño.
- CPU: el autor confirma que el portátil de prueba ejecuta la inferencia en CPU, por lo que no se requiere GPU para desplegar.
- Opciones de despliegue: interfaz de rollout en robot real de LeRobot (versión de referencia 0.6.2), cargando todos los ficheros del repo, incluidos los dos JSON de procesadores y sus `.safetensors` de estado de normalización. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de política.
- Latencia y throughput: no disponibles. Como referencia estructural, el chunk de 100 acciones implica una inferencia por cada 100 pasos de control, pero no se publica ninguna medición de tiempo por inferencia ni de frecuencia efectiva de control.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ACT, SO-101 pick-doll) | 51.668.614 | Imagen RGB 640 x 480 + estado de 6 articulaciones | Coger y levantar un muñeco | no disponible | HuggingFace, repo de 0,2 GB |
| ACT original (Zhao et al., 2023) | no disponible | Imagen + estado proprioceptivo | Manipulación bimanual de precisión con hardware de bajo coste | no disponible | Paper y código públicos |
| Diffusion Policy (Chi et al., 2023) | no disponible | Imagen / nube de puntos + estado | Políticas visomotoras por difusión | no disponible | Paper y código públicos |
| Otras políticas ACT de LeRobot sobre SO-101 | no disponible | Imagen + estado de articulaciones | Tareas concretas de laboratorio | variable según autor | Hub de HuggingFace (`lerobot` como librería) |

La comparación relevante no es de tamaño sino de régimen: este checkpoint es una política de una sola tarea entrenada con 25 episodios, mientras que ACT y Diffusion Policy son métodos generales publicados con sus propios conjuntos de datos y evaluaciones. No se dispone de cifras de parámetros ni de éxito comparables en la información proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no hay base para asumir uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Sesgos y sobreajuste al montaje: el dataset es de 25 episodios de un único equipo, un único objeto y una única disposición de cámara; la generalización a objetos, vistas o espacios nuevos no está establecida.
- Dependencia fuerte del entorno visual: cualquier cambio de posición, resolución, enfoque o iluminación de la cámara `front` respecto a la recolección puede degradar el comportamiento.
- Sin profundidad: al usar solo RGB, la estimación de distancia depende por completo de la apariencia, lo que es frágil ante cambios de textura o fondo.
- Riesgo de alucinación en sentido robótico: la política puede generar trayectorias plausibles pero incorrectas fuera de la distribución de entrenamiento, sin mecanismo de verificación interno.
- Los pesos por sí solos no reproducen el resultado: hacen falta los dos JSON de procesadores y sus `.safetensors` de normalización; el estado de optimizador y de RNG no está incluido.
- Las verificaciones publicadas (carga estricta, inferencia sintética con seis acciones finitas) validan el artefacto, no el éxito de la tarea.
- Seguridad física: operar el brazo bajo supervisión directa, con la base asegurada y la zona de movimiento despejada, y estar preparado para detener movimientos inesperados.
- Idiomas y contexto: no aplica; no es un modelo de lenguaje pese a tratarse de un transformer.
- Fecha de creación del repo (2026-10-21) y métricas de adopción muy bajas (6 descargas, 0 likes): proyecto académico, sin mantenimiento ni soporte indicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jinyoonok/interactive-robotics_lab3_act-pick-doll
- Dataset de entrenamiento: https://huggingface.co/datasets/jinyoonok/interactive-robotics_lab3_pick-doll
- Paper de ACT (Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware): https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot
- Brazo SO-ARM100/101 (TheRobotStudio): https://github.com/TheRobotStudio/SO-ARM100
