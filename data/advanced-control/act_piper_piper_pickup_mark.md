# advanced-control/act_piper_piper_pickup_mark

## Resumen

El modelo `advanced-control/act_piper_piper_pickup_mark` es una política de robótica entrenada con ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. Lo publica el usuario `advanced-control` en HuggingFace Hub y está construido con la librería LeRobot de HuggingFace, sobre el paper referenciado en sus etiquetas (arXiv:2304.13705). No es un modelo de lenguaje: es un controlador neuronal que consume el estado del robot y dos flujos de vídeo, y produce un vector de acción de 7 dimensiones.

La política tiene 51.670.663 parámetros (unos 51,7 millones) y un repositorio de 0,2 GB en formato safetensors. Se ha entrenado sobre un único dataset propio, `advanced-control/piper_pickup_mark`, con 100 episodios y 53.851 fotogramas a 30 FPS, para una tarea etiquetada genéricamente como "task". Las observaciones son el estado del robot `(7,)` y dos cámaras RGB a 720x1280 (`camera_hand` y `camera_chest`).

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de extremo a extremo del flujo de imitación de LeRobot para un brazo Piper de bajo coste, y como punto de partida para fine-tuning en tareas de pick-and-place. El modelo no tiene descargas ni likes, no incluye resultados de evaluación en la model card y la búsqueda web realizada no ha devuelto ninguna fuente independiente sobre él.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de aprendizaje por imitación basada en transformer que predice chunks de acción |
| Parametros totales | 51.670.663 (51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; consume observaciones por paso de control, no una ventana de tokens) |
| Tipos de cuantizacion | no disponible; el repositorio distribuye pesos en safetensors sin cuantizaciones documentadas (no hay GGUF ni variantes INT8/INT4 publicadas) |
| Idiomas soportados | no disponible (la tarea se etiqueta como "task", sin especificar idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (LeRobot) |
| Libreria / pipeline | lerobot 0.6.1 / robotics |
| Entradas | `observation.state` (7,), `observation.images.camera_hand` (3, 720, 1280), `observation.images.camera_chest` (3, 720, 1280) |
| Salidas | `action` (7,) |
| Camaras requeridas | `camera_hand`, `camera_chest` |
| Dataset de entrenamiento | advanced-control/piper_pickup_mark (100 episodios, 53.851 frames, 30 FPS) |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT, el método que implementa esta política, se describe en el paper arXiv:2304.13705 como un enfoque de imitación que predice chunks de acciones en lugar de una acción por paso, lo que reduce el error de acumulación y las discontinuidades típicas de las políticas paso a paso. El modelo combina un codificador visual (dos cámaras a 720x1280), el estado propioceptivo de 7 dimensiones y un decodificador de transformer que emite el vector de acción de 7 dimensiones. La model card no detalla la configuración interna de capas, cabezas de atención ni el tamaño del chunk de acción, por lo que esos datos quedan como no disponibles.

El entrenamiento se hizo íntegramente con teleoperación sobre el dataset `advanced-control/piper_pickup_mark`: 100 episodios, 53.851 fotogramas a 30 FPS, una sola tarea. La configuración registrada es de 100.000 pasos con batch size 32, optimizador AdamW, learning rate 1e-05, semilla 1000 y LeRobot 0.6.1. No se documenta el uso de RLHF, DPO ni ninguna fase de refinamiento posterior al aprendizaje por imitación, ni innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Manipulación robótica por imitación: genera vectores de acción de 7 grados de libertad a partir de observación visual y propioceptiva.
- Predicción de chunks de acción, que suaviza la trayectoria en comparación con políticas que emiten una acción por inferencia.
- Percepción visual con dos cámaras simultáneas: una en la mano (`camera_hand`) y una en el pecho (`camera_chest`), lo que da vista cenital del entorno y vista local de la garra.
- Tarea específica de pick-and-place sobre una marca o pieza designada (tarea etiquetada como "task" en el dataset).
- Ejecución en bucle cerrado a 30 FPS, la frecuencia a la que se grabó el dataset de entrenamiento.
- Integración nativa con el ecosistema LeRobot: entrenamiento, rollout e inferencia mediante CLI (`lerobot-train`, `lerobot-rollout`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de propósito general ni un LLM.
- No dispone de modo de razonamiento (thinking), visión generalista, audio ni generación de texto.

## Casos de uso

- Automatización de pick-and-place de piezas marcadas: la política está entrenada exactamente para recoger un objeto identificado por una marca, con lo que puede desplegarse directamente en un brazo Piper para esa tarea concreta.
- Prototipado rápido de células robotizadas de bajo coste: al ser un checkpoint ACT de 51,7 M de parámetros cabe en GPUs modestas y permite validar una célula completa antes de invertir en hardware industrial.
- Fine-tuning para variantes de la misma tarea: el dataset de origen (100 episodios, 53.851 frames) sirve como base para reentrenar con posiciones, objetos o condiciones de iluminación nuevas usando `lerobot-train` con `--policy.type=act`.
- Recogida de datos adicionales en bucle: con `--strategy.type=base` en `lerobot-rollout` se puede ejecutar la política sin grabar episodios, útil para inspeccionar el comportamiento antes de lanzar una campaña de teleoperación que amplíe el dataset.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible para comparar ACT frente a otras políticas (por ejemplo, Diffusion Policy) en el mismo robot y dataset.
- Demostraciones y docencia: el flujo de LeRobot (instalación, calibración, grabación, entrenamiento, rollout) se puede enseñar de principio a fin con un modelo real y pequeño.
- Control visual reactivo con doble cámara: en escenarios donde la vista de muñeca es crítica para el agarre fino, la política aprovecha `camera_hand` además de `camera_chest` para corregir la aproximación.
- Evaluación interna de robustez: al no haber resultados publicados, puede usarse como sujeto de pruebas para medir tasa de éxito con cambios de posición del objeto, iluminación o distractores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación explícitamente vacía ("_No evaluation results have been provided for this policy yet_") y no se ha encontrado ninguna medición independiente de tasa de éxito, precisión de agarre ni tiempos de ciclo en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 207 MB en fp32 y 103 MB en fp16/bf16, partiendo de 51,67 M de parámetros. A esto hay que sumar activaciones y buffers del codificador visual, que procesa dos imágenes de 720x1280 simultáneamente y suele ser el cuello de botella de memoria y cómputo.
- GPU recomendadas: cualquier GPU con soporte CUDA de gama media o superior. Para entrenamiento, una RTX 3090/4090 o una A100/H100 dan margen de sobra; para inferencia basta con una GPU de gama de entrada o incluso una integrada tipo Jetson.
- Cabe en GPU de consumo: sí. Una RTX 3060 de 12 GB o superior es suficiente tanto para inferencia como, con batch size reducido, para reentrenamiento. El tamaño del repositorio (0,2 GB) confirma que el modelo es ligero.
- Requisito adicional no relacionado con la GPU: dos cámaras compatibles con OpenCV a 30 FPS y la resolución de entrenamiento (720x1280 en origen; los ejemplos de la model card usan 640x480, lo que puede afectar al rendimiento si no se reescala igual).
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=advanced-control/act_piper_piper_pickup_mark`) sobre PyTorch. No se documentan rutas de despliegue con vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política robótica.
- Latencia y throughput: no disponibles. El único dato objetivo es que el control debe operar a 30 FPS, es decir, con un presupuesto de unos 33 ms por paso para mantener la cadencia del dataset (cálculo derivado de la frecuencia de grabación, no una medición del modelo).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| advanced-control/act_piper_piper_pickup_mark | Politica ACT (imitacion) | 51,7 M | no aplica | Apache 2.0 | HuggingFace, 0 descargas |
| Otros checkpoints ACT publicados con LeRobot | Politica ACT (imitacion) | no disponible | no aplica | variable segun autor | HuggingFace Hub |
| Diffusion Policy (implementacion LeRobot) | Politica de imitacion basada en difusion | no disponible | no aplica | variable segun implementacion | Repositorio LeRobot |

No se dispone de datos verificados de parametros, contexto ni rendimiento de las alternativas en la informacion proporcionada, por lo que la comparacion se limita a la categoria de metodo y al regimen de licencia. Cualquier comparacion cuantitativa de tasa de exito exigiria ejecutar las politicas sobre el mismo robot y el mismo conjunto de tareas.

## Limitaciones y advertencias

- No hay resultados de evaluacion publicados: se desconoce la tasa de exito real de la politica, incluso en la tarea para la que fue entrenada.
- Especializacion extrema: entrenada con 100 episodios y una unica tarea ("task") en un dataset concreto; es probable que falle ante objetos, posiciones o iluminaciones distintas de las vistas en entrenamiento.
- Generalizacion limitada por el metodo: ACT no incorpora un modelo de mundo ni planificacion explicita, de modo que no razona sobre la tarea, solo reproduce el comportamiento aprendido.
- Riesgo de alucinacion en el sentido de acciones incoherentes: como toda politica de imitacion, puede producir trayectorias fuera de distribucion cuando la observacion visual se aleja de los datos de entrenamiento, sin ninguna senal de incertidumbre.
- Dependencia del hardware: requiere dos camaras con los nombres y la disposicion exactos (`camera_hand`, `camera_chest`) y un robot de 7 grados de libertad coherente con el espacio de acciones. Cambiar la morfologia invalida el modelo.
- Sin soporte multilingue ni de texto: no procesa lenguaje natural, por lo que la tarea no se puede especificar mediante instrucciones en tiempo de inferencia.
- Sin datos de sesgo ni de robustez: la model card no documenta analisis de sesgos, condiciones adversas ni degradacion por envejecimiento de sensores.
- Licencia Apache 2.0: permite uso comercial y modificacion con obligacion de conservar el aviso de licencia y el archivo NOTICE si existe; no impone restricciones de uso adicionales.
- Sin mantenimiento visible: 0 descargas, 0 likes y creacion/actualizacion en la misma fecha, lo que sugiere un artefacto experimental mas que un modelo soportado.
- La metodologia de busqueda web no devolvio ninguna fuente tecnica relevante: los resultados obtenidos correspondian a utilidades de red y limpieza de sistema ajenas al modelo, de modo que no hay validacion externa disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/advanced-control/act_piper_piper_pickup_mark
- Dataset de entrenamiento: https://huggingface.co/datasets/advanced-control/piper_pickup_mark
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=advanced-control/piper_pickup_mark
- Paper de ACT (referenciado en las etiquetas): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
