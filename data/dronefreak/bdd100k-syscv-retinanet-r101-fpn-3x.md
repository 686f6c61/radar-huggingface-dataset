# dronefreak/bdd100k-syscv-retinanet-r101-fpn-3x

## Resumen

RetinaNet R101-FPN 3x sobre BDD100K es un detector de objetos de una etapa (single-stage) especializado en escenas de conduccion. El checkpoint original fue entrenado por el grupo SysCV (ETH Zurich) y publicado en su zoo de modelos para BDD100K; este repositorio de Hugging Face, mantenido por el usuario `dronefreak`, es un espejo que recupera los pesos desde la Wayback Machine (captura del 19 de febrero de 2025) ante la caida del host `dl.cv.ethz.ch`, y anade un entorno de dependencias fijado y un script de inferencia.

Arquitectonicamente sigue el diseno clasico de RetinaNet: backbone ResNet-101 inicializado con pesos de ImageNet, cuello Feature Pyramid Network (FPN) y cabezas densas con Focal Loss para mitigar el desbalance entre primer plano y fondo. Se entrena sobre las 70.000 imagenes del split de entrenamiento de BDD100K a resolucion nativa de 1280x720 durante 36 epocas (el esquema 3x de mmdetection), con entrenamiento multi-escala y SGD.

Su relevancia actual es practica: es un checkpoint de referencia para deteccion en escenas de conduccion autonoma, con resultados publicados por SysCV (31,3 AP en validacion y 30,6 AP en test) y pesos verificados por MD5. El repo resuelve un problema de disponibilidad (los pesos originales ya no se sirven desde ETH) y facilita la reproducibilidad con un stack de mmdetection 2.x fijado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RetinaNet (CNN single-stage) con backbone ResNet-101 y cuello FPN |
| Parametros totales | 55.614.014 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada 1280x720 RGB) |
| Tipos de cuantizacion | no disponible (pesos en precision original; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | BDD100K (uso educativo, investigacion y sin animo de lucro); la config de SysCV es Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), equivalente al `.pth` original; config en `config.json` y `original_config.py` |

## Arquitectura y entrenamiento

RetinaNet es un detector denso de una etapa que predice cajas y clases directamente sobre un conjunto de anclas en cada nivel de la piramide de caracteristicas. El backbone es ResNet-101 (inicializado con `torchvision://resnet101`), sobre el que se construye una FPN que combina caracteristicas de varias escalas para detectar objetos de distinto tamano. Las cabezas de clasificacion y regresion usan Focal Loss, la innovacion central del paper original (Lin et al., ICCV 2017), que reduce el peso de los ejemplos negativos faciles y permite entrenar detectores densos sin el desbalance clasico de las etapas de propuesta.

El entrenamiento se realizo sobre las 70.000 imagenes del split train de BDD100K durante 36 epocas (esquema 3x), con SGD (lr 0.02), weight decay 0.0001, decaimiento del learning rate en las epocas 24 y 33, batch de 32 (8 GPUs x 4 imagenes) y entrenamiento multi-escala con 6 escalas entre (1280, 600) y (1280, 720). La entrada es la resolucion nativa de BDD100K (1280x720, sin redimensionado), con normalizacion media y desviacion tipica de ImageNet. En test se aplica umbral de score 0.05, NMS con IoU 0.5 y un maximo de 100 cajas por imagen.

## Capacidades

- Deteccion de objetos en escenas de conduccion: 10 clases de BDD100K (peatonal, ciclista, coche, camion, autobus, tren, motocicleta, bicicleta, semaforo y senal de trafico).
- Deteccion en condiciones variadas de iluminacion y clima, al haber sido entrenado sobre la diversidad de BDD100K (dia, noche, lluvia, etc.).
- Salida en formato BDD100K (JSON) mediante la opcion `--json` del script de inferencia.
- Procesamiento de imagen suelta, carpeta de imagenes, fichero de video o flujo de webcam.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente de vision por computador.
- No dispone de modo thinking, vision-lenguaje, audio ni generacion de texto.

## Casos de uso

- Percepcion en vehiculos autonomos de investigacion: el modelo detecta peatones, vehiculos y senalizacion en imagenes de 1280x720 a la resolucion nativa de BDD100K, lo que lo hace adecuado como baseline de referencia en pipelines de conduccion autonoma academica.
- Etiquetado asistido y pre-anotacion: generar cajas candidatas sobre nuevos clips de video para que anotadores humanos las revisen, reduciendo el coste de construir datasets propios con las 10 clases de BDD100K.
- Analisis de trafico urbano: procesar grabaciones de camaras fijas para contar vehiculos y peatones por fotograma, con salida JSON consumible por herramientas de analitica.
- Monitorizacion de seguridad vial en flotas: detectar peatones y ciclistas en video de dashcam (soporta entrada de video directamente) para sistemas de alerta temprana en vehiculos comerciales.
- Benchmarking de detectores: servir como linea base reproducible (pesos verificados por MD5, entorno fijado) para comparar nuevos detectores sobre BDD100K con la misma configuracion.
- Prototipado rapido en CPU: con 1,5 s/imagen en 8 hilos de CPU, permite demos y pruebas funcionales sin GPU dedicada, por ejemplo en entornos de desarrollo o portatiles.
- Investigacion en vision nocturna: el modelo fue entrenado sobre escenas nocturnas de BDD100K y el repo incluye una demo con clips de dia y noche, util para estudiar el rendimiento en condiciones de baja luminosidad.

## Benchmarks y rendimiento

Resultados COCO-style box AP (%) sobre BDD100K, segun los ficheros de score publicados por SysCV (no verificados de forma independiente por el autor del espejo):

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 31,3 | 56,0 | 29,6 | 12,9 | 37,3 | 53,4 |
| test | 30,6 | 53,9 | 29,7 | 13,4 | 38,0 | 47,5 |

AP por clase en validacion:

| Clase | AP |
|---|---|
| pedestrian | 33,0 |
| rider | 25,0 |
| car | 50,3 |
| truck | 45,9 |
| bus | 48,2 |
| train | 0,0 |
| motorcycle | 23,3 |
| bicycle | 25,2 |
| traffic light | 24,0 |
| traffic sign | 37,9 |

Rendimiento de inferencia declarado: 0,06 s/imagen en una RTX 4070 SUPER y 1,5 s/imagen en 8 hilos de CPU.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 55,6 M de parametros en FP32 (unos 222 MB de pesos) y entradas de 1280x720, la huella de memoria es modesta, pero las activaciones de la FPN a esa resolucion dominan el consumo. Se recomienda una GPU con al menos 8 GB de VRAM para inferencia comoda.
- GPU recomendadas: RTX 4070 SUPER (medida por el autor, 0,06 s/imagen), A100, H100 para lotes grandes o entrenamiento.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060/4060 en adelante); el autor lo ejecuta en una RTX 4070 SUPER.
- Opciones de despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 y torch 2.0.1 sobre Python 3.10 (entorno fijado en `env/requirements-cu118.txt` o `env/requirements-cpu.txt`); script `infer.py` incluido. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector CNN).
- Latencia y throughput: 0,06 s/imagen en RTX 4070 SUPER (unos 16 FPS); 1,5 s/imagen en CPU con 8 hilos (unos 0,67 FPS).

## Comparativa con modelos similares

| Modelo | Parametros | Backbone | AP val BDD100K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RetinaNet R101-FPN 3x (este) | 55,6 M | ResNet-101 + FPN | 31,3 | BDD100K (uso no comercial) | Hugging Face (espejo) |
| Otros detectores del zoo SysCV BDD100K | no disponible | no disponible | no disponible | BDD100K / Apache-2.0 | GitHub SysCV (host original caido) |
| Detectores COCO genericos de mmdetection | no disponible | no disponible | no disponible (no entrenados en BDD100K) | Apache-2.0 | mmdetection model zoo |

No se dispone en la informacion proporcionada de resultados de modelos comparables sobre BDD100K para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos se rigen por la licencia de BDD100K, limitada a uso educativo, de investigacion y sin animo de lucro. El uso comercial requiere revisar los terminos y probablemente no esta permitido.
- Clase `train` con AP 0,0 en validacion: el modelo no detecta trenes de forma util, probablemente por escasez de ejemplos en el dataset.
- Rendimiento modesto en objetos pequenos (APs 12,9 en val): las clases pequenas como semaforos y senales de trafico obtienen AP bajo (24,0 y 37,9), lo que limita su uso en tareas que dependan de objetos de reducido tamano.
- Discrepancia de verificacion: en 20 imagenes de validacion, 1871 de 1979 cajas coinciden exactamente con las predicciones publicadas por SysCV y 1877 coinciden con IoU >= 0,5; la causa de la diferencia no se ha determinado. No es una reproduccion bit a bit.
- Sesgos del dataset: BDD100K esta sesgado hacia escenas de conduccion en determinadas regiones y condiciones; el rendimiento puede degradarse en entornos no representados (paisajes, iluminaciones o paises distintos).
- Riesgo de falsos positivos y negativos en condiciones adversas (noche, lluvia, oclusiones), inherente a un detector de una etapa con AP global de 31,3.
- Sin capacidades linguisticas ni multimodales: no puede integrarse en pipelines que requieran descripcion textual o razonamiento sobre la imagen.
- Entorno obsoleto: requiere mmdetection 2.x con mmcv-full 1.7.2 y torch 2.0.1, lo que puede complicar su integracion en stacks modernos; se recomienda un entorno virtual limpio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: es un espejo reciente sin validacion comunitaria amplia.

## Enlaces

- Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-retinanet-r101-fpn-3x
- Licencia (BDD100K): https://huggingface.co/dronefreak/bdd100k-syscv-retinanet-r101-fpn-3x/blob/main/LICENSE.txt
- Paper de RetinaNet (Focal Loss for Dense Object Detection, ICCV 2017): https://arxiv.org/abs/1708.02002
- Paper de BDD100K (CVPR 2020): https://arxiv.org/abs/1805.04687
- Repositorio SysCV BDD100K models: https://github.com/SysCV/bdd100k-models/tree/main/det
- Config de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/retinanet_r101_fpn_3x_det_bdd100k.py
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
