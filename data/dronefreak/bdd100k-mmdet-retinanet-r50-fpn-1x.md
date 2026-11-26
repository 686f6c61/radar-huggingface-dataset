# dronefreak/bdd100k-mmdet-retinanet-r50-fpn-1x

## Resumen

RetinaNet R50-FPN 1x sobre BDD100K es un detector de objetos de una etapa entrenado por el equipo de BDD100K y publicado originalmente en 2020 en el servidor de descargas de Berkeley. Este repositorio de Hugging Face es un espejo del checkpoint oficial, acompanado de un entorno fijado y un script de inferencia que permiten ejecutarlo con stacks modernos, ya que el entorno original (PyTorch 1.6, CUDA 10.2, mmdetection 2.5) no funciona en GPUs actuales.

El modelo emplea la arquitectura RetinaNet con backbone ResNet-50 y cuello FPN, con 36,6 millones de parametros, y esta especializado en deteccion de objetos en escenas de conduccion autonoma: coches, peatones, senales de trafico y semaforos sobre el dataset BDD100K. Su relevancia actual es la de un baseline reproducible y documentado para tareas de deteccion en conduccion, con instrucciones de entorno, verificacion de integridad y comparacion de predicciones frente a las originales.

No es un modelo generativo ni un LLM: es un detector puro de vision por computador que produce cajas delimitadoras y etiquetas de clase. Su interes para desarrolladores e investigadores radica en disponer de un punto de partida estable para experimentos de deteccion en BDD100K sin tener que reconstruir un entorno de 2020 desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RetinaNet con backbone ResNet-50 y cuello FPN (one-stage detector) |
| Parametros totales | 36.569.662 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precision original) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | BDD100K (license: other, license_name: bdd100k) |
| Formato de pesos | safetensors y checkpoint PyTorch (repo de 0,9 GB) |

## Arquitectura y entrenamiento

RetinaNet es un detector de una etapa que combina un backbone convolucional ResNet-50 con una piramide de caracteristicas (FPN) y dos subredes en cabeza, una para clasificacion y otra para regresion de cajas, con la funcion de perdida focal para mitigar el desbalance entre anclas positivas y negativas. La configuracion "1x" indica el esquema de entrenamiento estandar de mmdetection de una pasada sobre el dataset.

El entrenamiento se realizo con PyTorch 1.6.0, CUDA 10.2, mmcv 1.1.5 y mmdetection 2.5.0 sobre GPUs GeForce RTX 2080 Ti, segun los metadatos registrados en el propio checkpoint. El dataset es BDD100K, orientado a escenas de conduccion con condiciones de dia y noche. No se detalla en la informacion disponible el numero exacto de imagenes de entrenamiento ni si hubo tecnicas adicionales de aumento o ajuste fino.

Una innovacion practica destacable de este espejo es la documentacion del entorno: se fijan versiones concretas (Python 3.10, torch 2.0.1, torchvision 0.15.2, mmcv-full 1.7.2, mmdetection 2.28.2) para que el modelo siga siendo ejecutable. Ademas, se documenta una discrepancia de reproduccion: mmdetection 2.18 cambio la seleccion de candidatos antes de NMS, lo que produce diferencias minimas (1997 cajas frente a 1999 en la muestra de prueba), y se explica como parchear la regla de seleccion de 2020 para reproducir exactamente las cajas originales.

## Capacidades

- Deteccion de objetos en imagenes individuales, carpetas de imagenes, archivos de video y webcam en tiempo real mediante el script `infer.py`.
- Deteccion de clases propias de escenas de conduccion de BDD100K (vehiculos, peatones, senales de trafico, semaforos, entre otras segun el dataset).
- Exportacion de detecciones en formato BDD100K (pixeles, `x1 y1 x2 y2`) mediante la opcion `--json`.
- Umbral de confianza configurable (`--score-thr`, por defecto 0,3) y limite de fotogramas para video (`--max-frames`).
- Carga segura de pesos con `torch.load(weights_only=True)`, sin ejecucion de codigo arbitrario en el checkpoint.
- No dispone de capacidades de lenguaje, tool calling, agentes ni razonamiento multi-paso; es exclusivamente un detector visual.

## Casos de uso

- Baseline para investigacion en deteccion sobre BDD100K: sirve como punto de partida reproducible para comparar nuevas arquitecturas o tecnicas de aumento de datos, gracias al entorno fijado y a la verificacion de integridad documentada.
- Prototipado de sistemas de asistencia a la conduccion: el modelo detecta vehiculos, peatones y senales en fotogramas de video, lo que permite construir demos de alerta o analisis de escena sin entrenar desde cero.
- Analisis de video de trafico: procesando archivos de video con `infer.py` se pueden extraer detecciones por fotograma y volcarlas a JSON para estudios de flujo vehicular o conteo de objetos.
- Evaluacion de pipelines de vision en produccion: al ser un detector ligero de 36,6 M de parametros, es adecuado para medir latencia y throughput en distintas GPUs antes de invertir en modelos mayores.
- Docencia y formacion en vision por computador: la documentacion del entorno y la comparacion de predicciones con las originales facilitan explicar conceptos como NMS, anclas y perdida focal con un caso real.
- Verificacion de reproducibilidad: el repositorio incluye comprobaciones de hash SHA-256 y comparacion de cajas frente a las predicciones publicadas, util para auditar pipelines de evaluacion.
- Deteccion en tiempo real desde webcam: la opcion `python infer.py 0 --show` permite probar el modelo en directo sobre una camara, util para demos interactivas.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente):

| Metrica | Valor | Conjunto |
|---|---|---|
| mAP@50:95 | 27,2 | BDD100K validation |
| mAP@50 | 51,1 | BDD100K validation |
| mAP@75 | 24,7 | BDD100K validation |

No se han publicado en la informacion disponible resultados comparativos con otros modelos ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 36,6 M de parametros y pesos en precision original, el checkpoint ocupa menos de 1 GB, por lo que la inferencia cabe holgadamente en GPUs consumer.
- GPU recomendadas: el entrenamiento original uso GeForce RTX 2080 Ti; para inferencia basta con cualquier GPU NVIDIA compatible con CUDA 11.8 (el entorno fijado usa torch 2.0.1 con CUDA 11.8) o incluso CPU mediante `env/requirements-cpu.txt`.
- Cabe en GPU consumer: si, incluidas RTX 2080 Ti, RTX 3090, RTX 4090 y modelos inferiores con suficiente memoria para el lote de inferencia.
- Opciones de despliegue: el repositorio proporciona `infer.py` con mmdetection 2.28.2 y mmcv-full 1.7.2; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de vision).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de otros detectores comparables (por ejemplo, Faster R-CNN o YOLO sobre BDD100K) con los que contrastar parametros, contexto, rendimiento y licencia. Por tanto, la comparativa se indica como no disponible.

| Modelo | Parametros | Contexto | mAP@50:95 (BDD100K val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RetinaNet R50-FPN 1x (este) | 36,6 M | no aplica | 27,2 | BDD100K | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo es un detector de objetos, no un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false`).
- La reproduccion exacta de las cajas originales requiere parchear la regla de seleccion de candidatos previa a NMS de mmdetection 2.5; con mmdetection 2.28 se obtienen diferencias minimas en imagenes concurridas.
- El entorno original de 2020 no funciona en GPUs actuales; es necesario usar el entorno fijado del repositorio, que puede degradar paquetes en un entorno existente (se recomienda un entorno limpio).
- La licencia BDD100K impone restricciones de uso; es responsabilidad del usuario revisar el archivo LICENSE.txt antes de un uso comercial.
- El modelo esta entrenado especificamente sobre BDD100K y escenas de conduccion; su rendimiento fuera de ese dominio no esta documentado.
- Riesgo de sesgos derivados del dataset de entrenamiento (condiciones de iluminacion, geografia y composicion de escenas de BDD100K).
- No se documentan tasas de alucinacion ni de falsos positivos mas alla de la comparacion de cajas frente a las predicciones originales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-mmdet-retinanet-r50-fpn-1x
- Licencia: https://huggingface.co/dronefreak/bdd100k-mmdet-retinanet-r50-fpn-1x/blob/main/LICENSE.txt
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Poster de la demo: https://huggingface.co/dronefreak/bdd100k-mmdet-retinanet-r50-fpn-1x/resolve/main/assets/demo_banner_poster.jpg
- Video de la demo: https://huggingface.co/dronefreak/bdd100k-mmdet-retinanet-r50-fpn-1x/resolve/main/assets/demo_banner.mp4
- Repositorio mmdetection (OpenMMLab): https://github.com/open-mmlab/mmdetection
- Servidor de descargas original de BDD100K (checkpoint de 2020): no disponible como enlace directo en la informacion proporcionada
