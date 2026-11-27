# dronefreak/bdd100k-syscv-fcos-r101-fpn-3x

## Resumen

El modelo `dronefreak/bdd100k-syscv-fcos-r101-fpn-3x` es un detector de objetos de una sola etapa basado en FCOS (Fully Convolutional One-Stage Object Detection, ICCV 2019) con backbone ResNet-101 y cuello FPN, entrenado sobre el conjunto de datos BDD100K para deteccion de objetos en escenas de conduccion. No es un modelo de lenguaje: es un checkpoint de vision por computador empaquetado para la libreria MMDetection, publicado como espejo del zoo de modelos de SysCV (ETH Zurich) despues de que su servidor `dl.cv.ethz.ch` dejara de estar disponible.

El autor, `dronefreak`, recupero los pesos desde la Wayback Machine (captura del 19 de febrero de 2025) y anadio un entorno de dependencias fijado (PyTorch 2.0.1, mmcv-full 1.7.2, MMDetection 2.28.2, Python 3.10) junto con un script de inferencia `infer.py` que procesa imagenes, carpetas, video o webcam. El repositorio incluye tambien las predicciones y puntuaciones originales de SysCV para validacion.

El modelo resuelve la deteccion de 10 clases de trafico (peatones, ciclistas, coches, camiones, autobuses, trenes, motocicletas, bicicletas, semaforos y senales de trafico) en imagenes de 1280x720, con un total de 51.231.439 parametros y un tamano de repositorio de 0,7 GB. Es relevante por su valor como referencia reproducible para investigacion en conduccion autonoma y como ejemplo de preservacion de artefactos de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FCOS (Fully Convolutional One-Stage Object Detection) con backbone ResNet-101 y FPN |
| Parametros totales | 51.231.439 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision; entrada de 1280x720 px) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precision original; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (modelo de vision, no procesa lenguaje) |
| Licencia | BDD100K (uso educativo, investigacion y sin animo de lucro); la configuracion de SysCV es Apache-2.0 |
| Formato de pesos | safetensors (tambien `.pth` equivalente) |

## Arquitectura y entrenamiento

FCOS es un detector denso de una sola etapa que sustituye las anchor boxes por predicciones por pixel: cada localizacion del mapa de caracteristicas predice la distancia a los cuatro bordes de la caja y una puntuacion de centerness. El backbone es ResNet-101 inicializado con pesos ImageNet (`open-mmlab://detectron/resnet101_caffe`) y el cuello es una FPN que distribuye la prediccion entre varios niveles de escala.

El entrenamiento se realizo sobre las 70.000 imagenes de entrenamiento de BDD100K durante 36 epocas (esquema 3x), con SGD de tasa de aprendizaje 0,01, weight decay 0,0001, decaimiento en las epocas 24 y 33, batch de 32 (8 GPUs x 4 imagenes) y entrenamiento multi-escala con 6 escalas entre (1280, 600) y (1280, 720). La inferencia usa umbral de puntuacion 0,05, NMS con IoU 0,5 y un maximo de 100 cajas por imagen; el autor reporta 1,6 s/imagen en 8 hilos de CPU.

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion, con 10 clases: pedestrian, rider, car, truck, bus, train, motorcycle, bicycle, traffic light y traffic sign.
- Prediccion de cajas con puntuacion de confianza y clase, en formato compatible con BDD100K (opcion `--json`).
- Procesamiento de imagenes individuales, carpetas de imagenes, archivos de video y flujo de webcam mediante `infer.py`.
- Inferencia en CPU y en GPU (el entorno incluye requisitos para CUDA 11.8 y para CPU).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No dispone de modo thinking, vision generativa, audio ni generacion de texto.

## Casos de uso

- Deteccion de peatones y vehiculos en investigacion sobre conduccion autonoma: el modelo esta entrenado especificamente sobre BDD100K, por lo que sirve como linea base reproducible para comparar detectores en escenas urbanas diurnas y nocturnas.
- Analisis de video de trafico: `infer.py` acepta archivos de video y puede extraer detecciones por fotograma para estudios de flujo vehicular o conteo de objetos en secuencias.
- Validacion de pipelines de MMDetection: al incluir un entorno fijado con versiones concretas de torch, mmcv-full y mmdetection, es util para verificar la compatibilidad de configuraciones 2.x antes de migrar a otras versiones.
- Reproduccion de resultados academicos: el repositorio conserva las predicciones y puntuaciones de validacion de SysCV, lo que permite contrastar el comportamiento de una copia con los resultados publicados.
- Demo interactiva con webcam: el modo `python infer.py 0 --show` permite visualizar detecciones en tiempo real desde una camara, util para prototipos de bajo coste.
- Preservacion de artefactos de investigacion: dado que el host original de SysCV esta fuera de linea, este espejo facilita el acceso a los pesos a otros investigadores que citan el modelo.
- Etiquetado asistido de datos: las detecciones con umbral de confianza ajustable (`--score-thr`) pueden servir como preetiquetado para anotar nuevos conjuntos de imagenes de conduccion.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (procedentes de los ficheros de puntuacion de SysCV), en AP estilo COCO sobre BDD100K:

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 31,1 | 55,8 | 29,3 | 13,8 | 36,0 | 53,4 |
| test | 29,6 | 52,3 | 28,6 | 13,5 | 35,9 | 47,7 |

AP por clase en validacion:

| Clase | AP |
|---|---|
| pedestrian | 33,6 |
| rider | 22,7 |
| car | 50,6 |
| truck | 45,9 |
| bus | 48,5 |
| train | 0,0 |
| motorcycle | 21,9 |
| bicycle | 22,5 |
| traffic light | 26,5 |
| traffic sign | 39,3 |

El autor indica que la verificacion de la copia da resultados «cercanos, no exactos»: sobre 20 imagenes aleatorias de validacion, 1751 de las 1966 cajas publicadas por SysCV son identicas en esta copia (CPU), 1798 coinciden con IoU >= 0,5 (esta copia produce 1976 cajas) y la mayor diferencia de puntuacion es 0,0350. La causa no se investigo. El MD5 de los pesos (`1820205a8a08ed14a6e26898cda13267`) coincide con el de SysCV y todas las claves cargan en su configuracion; el entorno CUDA aun no se ha probado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 51,2 millones de parametros y entrada de 1280x720, el modelo es ligero y cabe con holgura en GPUs de consumo, aunque el autor no publica cifras de memoria.
- GPU recomendadas: no especificadas por el autor; el entorno incluye requisitos para CUDA 11.8 y para CPU.
- Cabe en GPU de consumo: si, por el tamano del modelo (51,2 M de parametros), aunque no se documentan mediciones concretas.
- Opciones de despliegue: MMDetection 2.28.2 con mmcv-full 1.7.2 y PyTorch 2.0.1 sobre Python 3.10; script `infer.py` incluido. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de vision).
- Latencia y throughput: 1,6 s/imagen en 8 hilos de CPU segun el autor; no se publican cifras de GPU.

## Comparativa con modelos similares

No se dispone de datos de otros detectores comparables en la informacion proporcionada (mismo dataset, mismas metricas y mismo protocolo de evaluacion). El repositorio de SysCV incluye otros modelos del zoo de BDD100K, pero sus resultados no se detallan en la informacion disponible.

| Modelo | Parametros | Contexto | AP val (BDD100K) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FCOS R101-FPN 3x (este) | 51.231.439 | no aplica | 31,1 | BDD100K | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia BDD100K restringe el uso a fines educativos, de investigacion y sin animo de lucro; no se permite uso comercial sin autorizacion adicional.
- El modelo solo detecta las 10 clases de BDD100K y esta especializado en escenas de conduccion; su rendimiento fuera de ese dominio no esta documentado.
- La clase `train` obtiene AP 0,0 en validacion, lo que indica que el modelo no detecta trenes de forma fiable.
- El rendimiento en objetos pequenos es bajo (APs 13,8 en validacion), lo que limita su uso en escenarios con objetos lejanos o de pequeno tamano.
- Existe una discrepancia no investigada entre esta copia y las predicciones publicadas por SysCV (1751 de 1966 cajas identicas), por lo que no debe asumirse una reproducibilidad exacta.
- El entorno CUDA no ha sido probado por el autor; solo se verifico la inferencia en CPU.
- Riesgo de sesgos y alucinaciones: como detector, puede producir falsos positivos y falsos negativos; no se documentan analisis de sesgo por condiciones meteorologicas, iluminacion o geografia.
- El host original de SysCV esta fuera de linea; la procedencia de los pesos depende de una captura de Wayback Machine.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-fcos-r101-fpn-3x
- Repositorio de modelos de SysCV (BDD100K): https://github.com/SysCV/bdd100k-models/tree/main/det
- Configuracion de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/fcos_r101_fpn_3x_det_bdd100k.py
- Paper de FCOS (arXiv 1904.01355): https://arxiv.org/abs/1904.01355
- Licencia del modelo: https://huggingface.co/dronefreak/bdd100k-syscv-fcos-r101-fpn-3x/blob/main/LICENSE.txt
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
