# dronefreak/bdd100k-syscv-retinanet-pvtv2-b0-fpn-1x

## Resumen

RetinaNet PVTv2-B0-FPN 1x es un detector de objetos de una etapa entrenado sobre el conjunto de datos BDD100K para escenas de conduccion. El modelo combina un backbone Pyramid Vision Transformer v2 en su variante mas pequena (B0) con un cuello FPN y la cabeza de deteccion de RetinaNet, todo implementado sobre MMDetection. Lo relevante de este repositorio concreto no es la arquitectura en si, sino que constituye un espejo funcional de un checkpoint del zoo de modelos de SysCV (ETH Zurich) cuyo servidor original (`dl.cv.ethz.ch`) esta fuera de linea.

El autor ha recuperado los pesos desde la Wayback Machine (captura del 19 de febrero de 2025) y los ha verificado contra el MD5 publicado por SysCV, reproduciendo exactamente las mismas 1986 cajas y puntuaciones que las predicciones oficiales de validacion en 20 imagenes aleatorias. El repositorio anade un entorno fijado (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2) y un script de inferencia que acepta imagenes, video o webcam.

Con 11.494.878 parametros y un tamano de repositorio de 0.7 GB, es un modelo ligero orientado a deteccion en tiempo real de clases de trafico (peatones, vehiculos, senales y semaforos). Su interes actual reside en la preservacion de artefactos de investigacion y en servir de linea base reproducible para tareas de deteccion en conduccion autonoma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RetinaNet (one-stage detector) con backbone PVTv2-B0 y cuello FPN |
| Parametros totales | 11.494.878 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada 1280 x 720 px) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precision original) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | bdd100k (uso educativo, de investigacion y sin animo de lucro); la config de SysCV es Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), equivalente al `.pth` original |

## Arquitectura y entrenamiento

El modelo sigue el esquema de RetinaNet: un detector de una etapa con perdida focal que emplea anchors densos sobre un mapa de caracteristicas multiescala. El backbone es PVTv2-B0 (Pyramid Vision Transformer v2, CVMJ 2022), un transformer jerarquico con atencion lineal por etapas que produce representaciones piramidales. Sobre el se monta un FPN que fusiona los distintos niveles y alimenta las cabezas de clasificacion y regresion de cajas. La entrada es de 1280 x 720, el tamano nativo de BDD100K sin redimensionado, en RGB con media y desviacion estandar de ImageNet.

El entrenamiento se realizo sobre el split de entrenamiento de BDD100K (70.000 imagenes) durante 12 epocas (calendario 1x), con AdamW, learning rate 0.0001 y weight decay 0.0001, decaimiento en las epocas 8 y 11, y batch de 32 (8 GPUs x 2 imagenes por GPU). El backbone se inicializo con pesos de ImageNet (`pvt_v2_b0.pth`). En test se aplica umbral de puntuacion 0.05, NMS con IoU 0.5 y un maximo de 100 cajas por imagen. No se documenta uso de RLHF ni tecnicas de refinamiento posteriores, algo esperable en un detector de vision.

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion, con cajas delimitadoras y puntuaciones de confianza.
- Clasificacion en diez categorias de BDD100K: pedestrian, rider, car, truck, bus, train, motorcycle, bicycle, traffic light y traffic sign.
- Inferencia sobre imagenes individuales, carpetas de imagenes, archivos de video y webcam en directo mediante `infer.py`.
- Exportacion de detecciones en formato BDD100K mediante la opcion `--json`.
- Ajuste del umbral de puntuacion (`--score-thr`, por defecto 0.3) y limite de fotogramas procesados (`--max-frames`).
- Ejecucion en CPU y en GPU (entornos CUDA 11.8 y CPU incluidos).
- No dispone de tool calling, agentes, capacidades multilingues ni modos de razonamiento: es exclusivamente un modelo de vision por computador.

## Casos de uso

- Deteccion de peatones y vehiculos en video de trafico: el modelo procesa fotogramas a 1280 x 720 y devuelve cajas por clase, adecuado para analisis offline de grabaciones o para prototipos de sistemas de asistencia a la conduccion.
- Linea base reproducible para investigacion en deteccion sobre BDD100K: al coincidir exactamente con las predicciones publicadas por SysCV, sirve como referencia para comparar nuevos metodos sin depender del servidor original caido.
- Auditoria y preservacion de artefactos cientificos: util para replicar resultados de publicaciones que citan el zoo de modelos de SysCV cuando los enlaces originales ya no estan disponibles.
- Analisis de seguridad vial: conteo y localizacion de peatones, ciclistas y motocicletas en secuencias de camara para estudios de exposicion al riesgo.
- Deteccion de senalizacion y semaforos: las clases traffic light y traffic sign permiten construir modulos de reconocimiento de entorno viario, aunque con precisiones moderadas (24.0 y 37.6 AP respectivamente).
- Prototipado en tiempo real con webcam: el modo `python infer.py 0 --show` permite validar rapidamente el comportamiento del detector en un flujo de camara en directo.
- Preetiquetado de datos: generar cajas candidatas sobre nuevas imagenes de conduccion para acelerar el etiquetado manual en pipelines de anotacion.

## Benchmarks y rendimiento

Resultados declarados por el autor (procedentes de las puntuaciones de SysCV), AP de cajas estilo COCO (%) sobre BDD100K:

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 30.3 | 55.6 | 28.3 | 12.4 | 36.1 | 51.6 |
| test | 29.5 | no disponible | no disponible | no disponible | no disponible | no disponible |

AP por clase en validacion:

| Clase | AP |
|---|---|
| pedestrian | 32.0 |
| rider | 23.6 |
| car | 49.5 |
| truck | 43.5 |
| bus | 46.1 |
| train | 0.0 |
| motorcycle | 23.6 |
| bicycle | 23.7 |
| traffic light | 24.0 |
| traffic sign | 37.6 |

Rendimiento de inferencia declarado: 0.05 s/imagen en una RTX 4070 SUPER y 1.1 s/imagen con 8 hilos de CPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 11,5 M de parametros y entrada de 1280 x 720, el consumo es bajo y cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: el autor verifica en una RTX 4070 SUPER (0.05 s/imagen). Cualquier GPU con soporte CUDA 11.8 deberia funcionar; A100 o H100 no son necesarias para este modelo.
- Cabe en GPU consumer: si, incluidas tarjetas de gama media; tambien funciona en CPU (1.1 s/imagen con 8 hilos).
- Opciones de despliegue: MMDetection 2.28.2 con mmcv-full 1.7.2 sobre torch 2.0.1 (Python 3.10), mediante el script `infer.py` incluido. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de vision de este tipo).
- Latencia y throughput: 0.05 s/imagen en RTX 4070 SUPER (aproximadamente 20 imagenes/s); 1.1 s/imagen en CPU con 8 hilos.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de otros detectores sobre BDD100K con los que comparar directamente. Como referencia cualitativa:

| Modelo | Backbone | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (RetinaNet PVTv2-B0-FPN 1x) | PVTv2-B0 | 11.494.878 | 1280 x 720 | bdd100k | Hugging Face (espejo) |
| Otros detectores del zoo SysCV BDD100K | no disponible | no disponible | no disponible | no disponible | servidor original fuera de linea |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia restrictiva: los pesos se rigen por la licencia de BDD100K, que permite uso educativo, de investigacion y sin animo de lucro. El uso comercial requiere atencion expresa a los terminos.
- Precision moderada: un AP global de 30.3 en validacion es bajo para aplicaciones de produccion exigentes; clases como train obtienen 0.0 AP y las clases pequenas (APs 12.4) rinden mal.
- Sesgo de dominio: entrenado exclusivamente con BDD100K (escenas de conduccion, principalmente entornos urbanos y de carretera de determinadas regiones); puede generalizar mal a otras condiciones climaticas, geografias o camaras no representadas.
- Riesgo de falsos positivos y negativos, especialmente en objetos pequenos, ocluidos o con poca luz; el umbral por defecto de 0.3 en `infer.py` es mas alto que el 0.05 usado en evaluacion y conviene ajustarlo segun el caso.
- Dependencia de un stack antiguo: requiere mmdetection 2.x y mmcv-full 1.7.2, lo que complica la integracion con ecosistemas modernos y obliga a usar un entorno virtual limpio.
- Origen del artefacto: los pesos proceden de una recuperacion via Wayback Machine; aunque el autor verifica el MD5 y la reproduccion exacta, conviene validar el comportamiento en el propio pipeline antes de usarlo en produccion.
- Sin capacidades de lenguaje ni de razonamiento: no debe emplearse para tareas fuera de la deteccion de objetos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-retinanet-pvtv2-b0-fpn-1x
- Repositorio SysCV BDD100K models: https://github.com/SysCV/bdd100k-models/tree/main/det
- Config de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/retinanet_pvtv2-b0_fpn_1x_det_bdd100k.py
- Paper PVTv2: https://arxiv.org/abs/2106.13797
- Pesos ImageNet del backbone PVTv2-B0: https://github.com/whai362/PVT/releases/download/v2/pvt_v2_b0.pth
- Licencia (LICENSE.txt): https://huggingface.co/dronefreak/bdd100k-syscv-retinanet-pvtv2-b0-fpn-1x/blob/main/LICENSE.txt
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
