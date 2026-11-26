# dronefreak/bdd100k-mmdet-yolov3-608-273e

## Resumen

El modelo `dronefreak/bdd100k-mmdet-yolov3-608-273e` es un espejo (mirror) de un baseline oficial de deteccion de objetos publicado por el equipo de BDD100K en 2020, entrenado con MMDetection sobre el conjunto de datos de conduccion BDD100K. Se trata de un detector YOLOv3 con backbone DarkNet-53 e input de 608x608 pixeles, con 61,6 millones de parametros, orientado a la deteccion de objetos en escenas de conduccion (coches, peatones, senales de trafico, semaforos, etc.). Su relevancia no reside en la novedad arquitectonica, sino en el hecho de que el autor ha empaquetado el checkpoint original con un entorno fijado y un script de inferencia funcional, de modo que un modelo de 2020 sigue siendo ejecutable hoy.

El checkpoint original fue publicado por el equipo de BDD100K en el servidor de descargas de Berkeley sin documentacion alguna. Esta ficha y la model card asociada actuan como la documentacion que faltaba: los datos tecnicos se han extraido del propio checkpoint o se han verificado sobre esta copia. El modelo se distribuye en formato safetensors y libreria mmdetection, con un tamano de repositorio de 0,9 GB.

Se trata de un modelo puramente de vision por computador, sin capacidades de generacion de texto ni de lenguaje natural. Su interes para desarrolladores e investigadores es el de disponer de un detector de referencia historico sobre BDD100K, util para comparaciones de baselines, para reproducir resultados de 2020 o para disponer de un detector ligero y bien delimitado en pipelines de vision para conduccion autonoma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv3 con backbone DarkNet-53, input 608x608 |
| Parametros totales | 61.624.807 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precision completa; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de vision, sin capacidades linguisticas) |
| Licencia | bdd100k (license: other, license_name: bdd100k) |
| Formato de pesos | safetensors (checkpoint original en formato PyTorch cargado con `torch.load(weights_only=True)`) |

## Arquitectura y entrenamiento

La arquitectura es YOLOv3, un detector de una sola etapa con backbone DarkNet-53 e input de 608x608 pixeles. El backbone se inicializa con los pesos ImageNet DarkNet-53 de OpenMMLab. El modelo se entreno sobre el split de entrenamiento de BDD100K (70.000 imagenes) durante 273 epocas, con SGD y learning rate 0,001, con decaimientos de learning rate en las iteraciones 218 y 246, batch de 31 y un total de 618.042 iteraciones. El entrenamiento se realizo originalmente con PyTorch 1.6.0, CUDA 10.2, mmcv 1.1.3 y mmdetection 2.4.0 sobre GPUs TITAN Xp, datos que quedaron registrados en el propio checkpoint.

La innovacion practica de esta publicacion no esta en la arquitectura, sino en el empaquetado: el autor ha fijado un entorno moderno (Python 3.10, torch 2.0.1, torchvision 0.15.2, mmcv-full 1.7.2, mmdetection 2.28.2, numpy 1.26.4, opencv-python 4.10.0.84) que sigue ejecutando el modelo pese a que la pila original ya no tiene kernels para GPUs actuales y a que mmdetection 3.x cambio el formato de configuracion y el codigo del modelo. Se incluye un script `infer.py` que carga los pesos con `torch.load(weights_only=True)`, de modo que el checkpoint solo contiene tensores y metadatos y no puede ejecutar codigo. La integridad del archivo esta verificada con SHA-256 `8c2596a1052bd938f7d1c8fb2134c3ada1c7bfb2e70ed90659d3540a45374ed0`, cuyos primeros 8 caracteres coinciden con el hash del nombre de archivo original.

## Capacidades

- Deteccion de objetos en imagenes individuales, carpetas de imagenes, archivos de video y camara web (mediante `infer.py`).
- Deteccion de las clases propias de BDD100K en escenas de conduccion: coches, peatones, senales de trafico, semaforos y otras categorias del dataset.
- Exportacion de detecciones en formato BDD100K (pixeles, `x1 y1 x2 y2`) mediante la opcion `--json detections.json`.
- Umbral de puntuacion configurable (`--score-thr`, por defecto 0,3) y limite de frames para video (`--max-frames N`).
- Ejecucion en CPU verificada; la ruta CUDA 11.8 esta incluida en el entorno pero no ha sido probada segun la model card.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un detector de objetos.

## Casos de uso

- Deteccion de objetos en escenas de conduccion para investigacion: el modelo permite obtener detecciones sobre imagenes y videos de BDD100K y comparar con baselines historicos de 2020, gracias a que el entorno fijado garantiza que el checkpoint sigue ejecutandose.
- Reproduccion de resultados academicos: util para replicar experimentos que citan el baseline YOLOv3 608 de BDD100K, ya que se incluyen los pesos originales con integridad verificada por SHA-256.
- Procesado por lotes de carpetas de imagenes: `infer.py images/ --out runs/` permite anotar automaticamente un directorio completo de imagenes de trafico, adecuado para generar pseudo-etiquetas o preanotaciones en flujos de trabajo de etiquetado.
- Analisis de video de trafico: la opcion de entrada de archivo de video (`infer.py drive.mov`) permite procesar clips completos y exportar las detecciones en formato BDD100K para su posterior analisis estadistico o visualizacion.
- Prototipado en CPU sin GPU: al estar verificada la ruta de CPU, el modelo puede ejecutarse en equipos sin GPU para pruebas de concepto, demos o validacion de pipelines antes de escalar a hardware con aceleracion.
- Captura en directo desde camara web: la ruta `infer.py 0 --show` permite una demo interactiva en tiempo real (aunque la model card advierte que esta ruta no se probo con una camara real), util para demostraciones y validacion cualitativa.
- Baseline para experimentos de deteccion en conduccion autonoma: al ser un detector YOLOv3 bien delimitado y con pesos reproducibles, sirve como punto de partida o referencia inferior en comparativas con detectores mas modernos.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo sobre el split de validacion de BDD100K (no verificados, `verified: false`):

| Metrica | Valor |
|---|---|
| mAP@50:95 (val) | 24,6 |
| mAP@50 (val) | 49,8 |
| mAP@75 (val) | 21,1 |

No se han publicado en la informacion disponible resultados de benchmarks adicionales (por ejemplo, comparativas directas con otros detectores sobre el mismo split).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada; con 61,6 millones de parametros y entrada de 608x608, el modelo es ligero y cabe holgadamente en GPUs de consumo, aunque no se documenta una cifra concreta.
- GPU de entrenamiento original: TITAN Xp (segun el checkpoint).
- GPU recomendadas: no disponible en la informacion; cualquier GPU compatible con CUDA 11.8 deberia poder ejecutar el entorno fijado, si bien la ruta CUDA no ha sido verificada por el autor.
- Cabe en GPU de consumo: si, por el reducido numero de parametros, aunque no se especifican modelos concretos.
- Opciones de despliegue: el autor proporciona un script `infer.py` con entorno fijado (requirements-cu118.txt para GPU o requirements-cpu.txt para CPU) y soporte para imagen, carpeta, video y camara web. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI (no aplicables a un detector de vision de este tipo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos sobre otros detectores comparables (por ejemplo, otras variantes de YOLO o baselines de BDD100K) con los que establecer una comparativa de parametros, contexto, rendimiento o licencia. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Modelo de vision exclusivamente: no genera texto, no razona, no soporta tool calling ni agentes; no debe evaluarse como modelo de lenguaje.
- Referencia de validacion poco fiable: la model card advierte de que las predicciones de test publicadas por los autores (`original/*-results.json`) no encajan con las imagenes bajo las que estan archivadas; en 20 imagenes de test ninguna caja coincide con las de esta copia, y en la imagen revisada a ojo las cajas de los autores delimitan coches grandes que no estan en la imagen. La causa es desconocida y esta copia no pudo verificarse caja por caja. Las metricas de validacion se presentan tal como se publicaron.
- Entorno de ejecucion fragil: requiere versiones fijadas (Python 3.10, torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2); usar un entorno existente puede provocar downgrades de paquetes.
- Ruta CUDA no verificada: solo el entorno de CPU ha sido probado; la ruta CUDA 11.8 esta incluida pero no ejecutada.
- Camara web no probada con hardware real: la ruta de captura usa el mismo bucle que los videos, pero no se valido con una camara fisica.
- Licencia BDD100K: se trata de una licencia `other` con nombre `bdd100k`; es imprescindible revisar el archivo LICENSE.txt del repositorio antes de cualquier uso comercial, ya que las condiciones del dataset BDD100K pueden restringir el uso.
- Riesgo de sesgo y alucinacion: no documentado en la informacion disponible; como detector entrenado sobre BDD100K, hereda los sesgos de dicho dataset (escenas de conduccion, geografia y condiciones de captura especificas), aunque no se detallan.
- Sin cuantizaciones documentadas: no se ofrecen variantes GGUF, AWQ ni similares, lo que limita las opciones de despliegue optimizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-mmdet-yolov3-608-273e
- Licencia del modelo: https://huggingface.co/dronefreak/bdd100k-mmdet-yolov3-608-273e/blob/main/LICENSE.txt
- Dataset BDD100K (referencia en Hugging Face): https://huggingface.co/datasets/dronefreak/BDD100K
- Poster de la demo: https://huggingface.co/dronefreak/bdd100k-mmdet-yolov3-608-273e/resolve/main/assets/demo_banner_poster.jpg
- Video de la demo: https://huggingface.co/dronefreak/bdd100k-mmdet-yolov3-608-273e/resolve/main/assets/demo_banner.mp4
