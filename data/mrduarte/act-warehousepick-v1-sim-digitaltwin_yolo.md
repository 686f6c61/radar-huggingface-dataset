# MrDuarte/act-WarehousePick-v1-Sim-DigitalTwin_yolo

## Resumen

`MrDuarte/act-WarehousePick-v1-Sim-DigitalTwin_yolo` es una política de robótica basada en ACT (Action Chunking with Transformers), el método de aprendizaje por imitación presentado en el paper arXiv:2304.13705 y popularizado por la librería LeRobot de Hugging Face. En lugar de predecir una única acción por paso, ACT predice fragmentos (chunks) de acciones de horizonte corto, lo que reduce el error de composición y suele elevar la tasa de éxito en tareas de manipulación aprendidas a partir de demostraciones teleoperadas. El repositorio lo publica el usuario MrDuarte con licencia Apache 2.0 y un tamaño total de 0,2 GB.

El modelo está entrenado específicamente para la tarea "Lift all parcels and put them in the Green Box" sobre un robot `so101_follower` equipado con tres cámaras (`innomaker`, `intel_rgb` y `front`). Consume un vector de estado de 6 dimensiones más tres flujos de imagen y produce un vector de acción de 6 dimensiones. El conjunto de datos asociado, `MrDuarte/WarehousePick-v1-Sim-DigitalTwin_yolo`, contiene 41 episodios y 13 376 fotogramas a 30 FPS, y su nombre sugiere que las demostraciones se generaron en un gemelo digital simulado con percepción YOLO, un detalle relevante por el posible desajuste simulación-realidad.

Su relevancia es doble: por un lado, es un ejemplo reproducible de extremo a extremo del flujo de trabajo de LeRobot (grabación de datos, entrenamiento con `lerobot-train` e inferencia con `lerobot-rollout`); por otro, sirve como línea base ligera (51,7 M de parámetros) para investigar políticas visomotoras de bajo coste computacional. No debe confundirse con un modelo de lenguaje: no procesa texto, no soporta tool calling y no tiene ventana de contexto en el sentido habitual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder para aprendizaje por imitacion, con codificadores visuales para tres camaras (detalles internos de capas no disponibles) |
| Parametros totales | 51.668.614 (51,7 M), segun los pesos safetensors del repositorio |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: no es un modelo de lenguaje. Consume una observacion por paso y emite un chunk de acciones; la longitud del chunk no se especifica en la informacion disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos safetensors; no se documentan variantes GGUF, INT8 ni FP16) |
| Idiomas soportados | No aplica (no procesa lenguaje natural; la tarea se pasa como cadena de texto al comando de rollout, no como idioma del modelo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio gestionado con `lerobot`, 0,2 GB) |

**Entradas y salidas**

| Feature | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | `(6,)` |
| `observation.images.innomaker` | VISUAL | `(3, 720, 1280)` |
| `observation.images.intel_rgb` | VISUAL | `(3, 424, 240)` |
| `observation.images.front` | VISUAL | `(3, 720, 1280)` |
| `action` | ACTION | `(6,)` |

**Robot y configuracion de entrenamiento**

| Parametro | Valor |
|---|---|
| Tipo de robot | `so101_follower` |
| Camaras | `innomaker`, `intel_rgb`, `front` |
| Pasos de entrenamiento | 100 000 |
| Tamano de batch | 4 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.1 |
| Dataset | MrDuarte/WarehousePick-v1-Sim-DigitalTwin_yolo (41 episodios, 13 376 fotogramas, 30 FPS) |
| Tarea | "Lift all parcels and put them in the Green Box" |

## Arquitectura y entrenamiento

ACT se formula como un transformer encoder-decoder entrenado con aprendizaje por imitacion supervisada. El encoder recibe la observacion actual (estado articular de 6 dimensiones y las tres imagenes) y el decoder genera un chunk de acciones futuras en lugar de un unico paso, lo que aporta consistencia temporal. Una innovacion central del metodo es el uso de una decodificacion estilo VAE con una variable latente que modela la variabilidad de las demostraciones humanas, de modo que la política no colapsa hacia la media de trayectorias multimodales. La información disponible no detalla el número de capas, dimensiones de embedding ni los backbones visuales concretos usados en este checkpoint.

El entrenamiento se realizó con LeRobot 0.6.1 durante 100 000 pasos, con batch de 4, optimizador AdamW y tasa de aprendizaje constante de 1e-05. La fuente de datos es un único dataset de 41 episodios y 13 376 fotogramas a 30 FPS, con una única tarea de recogida de paquetes. El nombre del dataset (`Sim-DigitalTwin_yolo`) apunta a que las demostraciones provienen de un gemelo digital simulado con detección YOLO, aunque la model card no lo confirma explícitamente ni documenta el procedimiento de generación de datos ni ninguna fase de ajuste con preferencias humanas (RLHF/DPO no aplicable ni mencionado en este contexto).

## Capacidades

- Control visomotor de un brazo robótico `so101_follower` con 6 grados de libertad de estado y 6 de acción.
- Ejecución de la tarea concreta de recoger paquetes y depositarlos en una caja verde, aprendida por imitación.
- Fusión de tres vistas de cámara simultáneas con resoluciones distintas (720x1280, 424x240 y 720x1280).
- Predicción de chunks de acciones, lo que aporta suavidad y coherencia temporal frente a políticas paso a paso.
- Ejecución en bucle cerrado a través de `lerobot-rollout` con estrategia `base` o de grabación de episodios, con duración configurable.
- Reentrenamiento y ajuste fino mediante `lerobot-train` sobre el mismo tipo de robot y formato de observaciones.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico: no es un modelo de lenguaje.
- No tiene capacidades multilingües, de visión general (VQA, OCR, captioning) ni de audio.
- No dispone de modo de razonamiento explícito (thinking mode) ni de decodificación especulativa documentada.

## Casos de uso

- Automatización de pick-and-place en almacén: es el escenario exacto para el que se entrenó, con un robot `so101_follower` recogiendo bultos y depositándolos en una caja verde; se desplegaría con `lerobot-rollout` en bucle continuo sobre la celda de trabajo real.
- Validación de un gemelo digital antes del despliegue físico: dado que el dataset de entrenamiento parece proceder de simulación, el modelo permite comparar la tasa de éxito en sim y en el robot real para medir el desajuste simulación-realidad antes de invertir en hardware.
- Línea base para investigación en aprendizaje por imitación: con 51,7 M de parámetros y entrenamiento en 100 000 pasos, sirve como referencia reproducible frente a otras políticas de LeRobot (por ejemplo Diffusion Policy) en experimentos controlados.
- Ajuste fino para nuevas tareas de manipulación: reutilizando los pesos como inicialización con `lerobot-train` y un dataset propio, se puede adaptar la política a otras tareas del mismo robot sin partir de cero.
- Clasificación y separación de paquetes por destino: cambiando la posición de la caja o el criterio de agrupación y reentrenando con demostraciones etiquetadas, el mismo pipeline permite enrutar bultos a distintas ubicaciones.
- Docencia y formación en robótica: el flujo completo (grabar datos, entrenar, evaluar, desplegar) se puede reproducir en un laboratorio con un `so101_follower` y tres cámaras, con coste computacional bajo.
- Generación de datos sintéticos etiquetados: el modelo puede ejecutarse sobre el gemelo digital para producir rollouts adicionales y ampliar el dataset con correcciones, dentro de un ciclo iterativo de mejora.
- Pruebas de regresión de hardware y calibración de cámaras: al depender de tres vistas con nombres y resoluciones concretas, sirve para verificar que la instalación de sensores es correcta antes de entrenar políticas nuevas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito en robot real, número de ensayos ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- Huella de pesos: 51,7 M de parámetros, aproximadamente 207 MB en FP32 y unos 103 MB en FP16. El repositorio completo ocupa 0,2 GB.
- VRAM estimada para inferencia: por debajo de 1 GB para los pesos; el consumo real vendrá dominado por el preprocesado de las tres cámaras (hasta 720x1280) y por el runtime de PyTorch, por lo que se recomienda al menos 4-8 GB de VRAM en la práctica. No hay cifras oficiales publicadas.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente desde el punto de vista de memoria; para el bucle de control a 30 FPS son preferibles modelos de gama media o alta (RTX 3060, RTX 4090, A100, H100). No se han publicado mediciones de latencia que permitan fijar un mínimo.
- Cabe en GPU de consumo: sí, con holgura, ya que el modelo es de 51,7 M de parámetros. También es viable en CPU para pruebas, aunque la tasa de control se vería reducida.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial, estrategia `base` o con grabación de episodios) sobre PyTorch con `--policy.device=cuda`. No se documentan integraciones con vLLM, TGI, Ollama ni llama.cpp, que no aplican a una política de robótica.
- Latencia y throughput: no disponibles en la información proporcionada. El dataset se grabó a 30 FPS, lo que da una referencia del ritmo de control esperado, pero no una garantía de que la inferencia alcance ese ritmo en hardware concreto.
- Requisitos adicionales: un robot `so101_follower` real, su puerto de comunicación, y tres cámaras cuyos nombres e índices coincidan exactamente con las claves de observación del entrenamiento.

## Comparativa con modelos similares

Los datos de los modelos comparados no aparecen en la información proporcionada (los resultados de búsqueda web recibidos no contienen información relevante sobre robótica). Se comparan únicamente por enfoque y disponibilidad, marcando como "no disponible" todo dato numérico no verificado.

| Modelo | Enfoque | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act-WarehousePick-v1-Sim-DigitalTwin_yolo (este) | ACT: transformer encoder-decoder con chunks de acciones | 51,7 M | No aplica | Apache 2.0 | Hugging Face, via LeRobot |
| ACT generico de LeRobot | ACT: mismo metodo, entrenado sobre otros datasets y robots | No disponible | No aplica | Apache 2.0 (por defecto en LeRobot) | Hugging Face, via LeRobot |
| Diffusion Policy en LeRobot | Politica generativa basada en difusion de acciones | No disponible | No disponible | No disponible | Hugging Face, via LeRobot |
| SmolVLA | Politica visomotora construida sobre un modelo vision-lenguaje-accion | No disponible | No disponible | No disponible | Hugging Face, via LeRobot |

Criterio cualitativo: ACT destaca por su bajo coste de entrenamiento e inferencia y por su buen comportamiento en tareas de horizonte corto con demostraciones teleoperadas; las políticas basadas en difusion suelen ofrecer mayor robustez ante multimodalidad a cambio de un coste de inferencia mayor, y los enfoques tipo VLA aportan generalización semántica a cambio de un tamaño muy superior. No hay datos públicos de esta política que permitan cuantificar la comparación.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: la model card deja la sección de evaluación vacía, por lo que se desconoce la tasa de éxito real de la política.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de que terceros la hayan reproducido.
- Especialización extrema: se entrenó para una sola tarea ("Lift all parcels and put them in the Green Box") con 41 episodios, de modo que no se espera generalización a otros objetos, contenedores u objetivos.
- Posible brecha simulación-realidad: el nombre del dataset (`Sim-DigitalTwin_yolo`) sugiere datos de un gemelo digital, lo que puede degradar el rendimiento al transferir al robot físico por diferencias de iluminación, texturas, dinámica y ruido de sensores.
- Dependencia estricta de la configuración de sensores: las tres cámaras deben existir con los nombres `innomaker`, `intel_rgb` y `front` y el robot debe ser un `so101_follower` con estado de 6 dimensiones; cualquier cambio de montaje, resolución o calibración invalida la política.
- Sensibilidad a distribución: posiciones de paquetes, distractores, oclusiones, cambios de iluminación o de fondo pueden provocar fallos, ya que no se documenta ningún tipo de aumento de datos ni robustez adicional.
- Sesgos heredados de las demostraciones: la política reproduce las preferencias y trayectorias del teleoperador, incluidas posibles trayectorias subóptimas, y está condicionada al color concreto de la caja objetivo.
- Sin capacidades de lenguaje ni de razonamiento: no admite instrucciones en lenguaje natural variables, tool calling, planificación multi-paso ni corrección en tiempo de ejecución.
- Riesgo de acumulación de error: pese a la predicción por chunks, un fallo no detectado puede propagarse durante el resto del episodio al no existir un mecanismo explícito de recuperación.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se ofrece sin garantías; conviene revisar además las condiciones de los datos de entrenamiento y de los componentes de terceros (LeRobot, backbones visuales) antes de un despliegue en producción.
- En producción se recomienda monitorización externa, paradas de seguridad y un mecanismo de supervisión humana, ya que la política no incluye detección de fallos ni estimación de incertidumbre.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MrDuarte/act-WarehousePick-v1-Sim-DigitalTwin_yolo
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/MrDuarte/WarehousePick-v1-Sim-DigitalTwin_yolo
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=MrDuarte/WarehousePick-v1-Sim-DigitalTwin_yolo
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos (cheat sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la busqueda web realizada no devolvio resultados relacionados con este modelo ni con robotica; los enlaces anteriores provienen de la model card y de los identificadores del repositorio. Si quieres, puedo ampliar la ficha con un pipeline de evaluacion en robot real o con una estimacion de VRAM y latencia medida en tu hardware.
