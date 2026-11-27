# dronefreak/bdd100k-syscv-faster-rcnn-swin-t-fpn-3x

## Resumen

Faster R-CNN con backbone Swin Transformer Tiny y cuello FPN, entrenado sobre BDD100K para deteccion de objetos en escenas de conduccion. No es un modelo de lenguaje: es un detector de objetos de dos etapas (two-stage) en formato MMDetection, con 44.821.384 parametros y pesos en safetensors. Lo publica el usuario dronefreak como espejo del zoo de modelos de SysCV (ETH Zurich), cuyo host `dl.cv.ethz.ch` esta caido; los pesos se recuperaron de una captura de Wayback Machine del 19 de febrero de 2025.

El modelo resuelve la tarea de deteccion de 10 clases de trafico (peatones, ciclistas, coche, camion, autobus, tren, motocicleta, bicicleta, semaforo y senal de trafico) sobre imagenes nativas de 1280x720, sin reescalado. Es relevante porque preserva un checkpoint de referencia del benchmark BDD100K que ya no es accesible desde su origen, con verificacion de integridad (MD5 coincidente con el original) y un entorno de inferencia fijado (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2).

El repositorio anade scripts de inferencia para imagen, carpeta de imagenes, video y webcam, con salida en formato BDD100K. La licencia derivada de BDD100K restringe el uso a fines educativos, de investigacion y sin animo de lucro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Faster R-CNN (two-stage detector) con backbone Swin Transformer Tiny (patch 4, ventana 7, 224 preentrenado en ImageNet) y FPN |
| Parametros totales | 44.821.384 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija 1280x720) |
| Tipos de cuantizacion | no disponible (solo pesos FP32 en safetensors y .pth) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | bdd100k (educational, research and not-for-profit use); la config de SysCV es Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y `.pth`; configuracion en `config.json` y `original_config.py` |

## Arquitectura y entrenamiento

Detector de dos etapas Faster R-CNN: la etapa RPN propone regiones y la etapa ROI las clasifica y refina. El backbone es Swin Transformer Tiny con atencion por ventanas desplazadas (shifted windows), que produce mapas de caracteristicas jerarquicos; el cuello FPN los combina en varias escalas para detectar objetos de tamanos muy distintos (desde senales pequenas hasta autobuses). La cabeza de deteccion sigue el esquema estandar de MMDetection.

Entrenamiento sobre el split train de BDD100K (70.000 imagenes) durante 36 epocas (3x), AdamW con lr 0.0001 y weight decay 0.05, decaimiento en las epocas 27 y 33, batch 32 (8 GPUs x 2 imagenes), entrenamiento multi-escala con 6 escalas entre (1280, 600) y (1280, 720). La inicializacion del backbone usa pesos ImageNet de Swin-T. En test se aplica umbral de score 0.05, NMS con IoU 0.5 y un maximo de 100 cajas por imagen; el autor reporta 1,8 s/imagen en 8 hilos de CPU.

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion con 10 clases: pedestrian, rider, car, truck, bus, train, motorcycle, bicycle, traffic light y traffic sign.
- Inferencia sobre imagen individual, carpeta de imagenes, fichero de video y webcam (opcion `0 --show`).
- Salida en formato BDD100K mediante `--json out.json`, apta para pipelines de evaluacion.
- Umbral de score configurable (`--score-thr`, por defecto 0.3) y limite de fotogramas (`--max-frames`).
- Carga segura de pesos con `torch.load(weights_only=True)`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un detector visual.

## Casos de uso

- Reproduccion de resultados de BDD100K: util para comparar nuevas propuestas contra una linea base publicada (AP val 34.1) sin depender del host original de SysCV, ya caido.
- Etiquetado asistido (pre-anotacion): generar cajas con `--json` y revisarlas manualmente para acelerar la creacion de datasets de conduccion propios.
- Analisis de escenas diurnas y nocturnas: el autor incluye demos sobre clips de dia y de noche, lo que permite evaluar el comportamiento del detector en condiciones de iluminacion distintas.
- Prototipos de percepcion para vehiculos autonomos en investigacion: punto de partida para experimentar con deteccion de peatones, vehiculos y senalizacion antes de entrenar modelos propios.
- Procesado por lotes de videos de trafico: el script acepta un fichero de video y limita fotogramas, adecuado para extraer estadisticas de trafico (conteo de vehiculos, presencia de peatones) en estudios urbanos.
- Docencia y practicas de vision por computador: el entorno fijado (Python 3.10, torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2) reduce la friccion de instalacion en aulas y laboratorios.
- Verificacion de integridad de checkpoints: el repositorio incluye MD5, predicciones y scores originales en `original/`, util como referencia para auditar copias de modelos.

## Benchmarks y rendimiento

Resultados declarados por el autor (procedentes de los ficheros de score de SysCV), box AP estilo COCO sobre BDD100K:

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 34.1 | 60.6 | 32.7 | 16.5 | 39.9 | 55.3 |
| test | 33.5 | 58.7 | 32.9 | 16.9 | 39.9 | 51.5 |

AP por clase en validacion:

| Clase | AP |
|---|---|
| pedestrian | 36.4 |
| rider | 28.3 |
| car | 52.2 |
| truck | 48.0 |
| bus | 50.7 |
| train | 3.4 |
| motorcycle | 28.6 |
| bicycle | 28.2 |
| traffic light | 25.4 |
| traffic sign | 40.0 |

Nota de verificacion del autor: en 20 imagenes aleatorias de validacion, 703 de las 705 cajas publicadas por SysCV son identicas en esta copia (CPU), las 705 coinciden con IoU >= 0.5 y la mayor diferencia de score es 0.0027. El entorno CUDA no fue probado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 44,8 M de parametros en FP32 el peso ronda los 180 MB, por lo que la inferencia cabe holgadamente en GPUs de consumo, aunque el autor solo documenta tiempos en CPU.
- GPU recomendadas: no disponibles en la informacion proporcionada; el entorno incluye `env/requirements-cu118.txt` para CUDA 11.8, pero el autor indica que el entorno CUDA no ha sido probado.
- GPU de consumo: por tamano del modelo (44,8 M de parametros) es esperable que quepa en cualquier GPU consumer moderna, pero no hay medicion publicada que lo confirme.
- Despliegue: MMDetection 2.28.2 con mmcv-full 1.7.2 sobre torch 2.0.1 y Python 3.10; scripts `infer.py` para imagen, video y webcam. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector de este tipo).
- Latencia: 1,8 s/imagen en 8 hilos de CPU; throughput en GPU no disponible.

## Comparativa con modelos similares

No se han publicado en la informacion disponible datos de otros detectores comparables sobre BDD100K (por ejemplo, variantes con backbone ResNet u otros tamanos de Swin del mismo zoo de SysCV), por lo que la comparacion cuantitativa no esta disponible. Cualitativamente, este checkpoint se distingue por su backbone Swin-T (frente a los ResNet habituales en Faster R-CNN), su entrenamiento 3x con multi-escala y su condicion de espejo verificado de un modelo cuyo origen ya no es accesible.

## Limitaciones y advertencias

- Licencia BDD100K: uso educativo, de investigacion y sin animo de lucro; el uso comercial no esta permitido segun la licencia declarada.
- Entrenado exclusivamente sobre BDD100K: el dominio son escenas de conduccion; el rendimiento fuera de ese dominio (interiores, imagenes aereas, otros paises) no esta medido.
- Clase `train` practicamente inutilizable: AP 3,4 en validacion, probablemente por escasez de ejemplos.
- Objetos pequenos con rendimiento bajo: APs 16,5 en validacion, lo que limita la deteccion de senales y peatones lejanos.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes; cualquier expectativa en ese sentido es erronea.
- La copia no es bit a bit identica en inferencia al original (703/705 cajas identicas en la muestra); la causa no fue investigada.
- Entorno CUDA sin probar por el autor: el rendimiento en GPU y la reproducibilidad exacta en CUDA quedan sin verificar.
- Entorno de dependencias antiguo y fijado (mmdetection 2.x): requiere un venv limpio y puede entrar en conflicto con stacks modernos.
- Riesgo de sesgo del dataset: BDD100K procede de grabaciones en entornos urbanos y condiciones geograficas concretas, lo que puede infrarepresentar escenas de otras regiones o condiciones meteorologicas extremas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-swin-t-fpn-3x
- Licencia: https://huggingface.co/dronefreak/bdd100k-syscv-faster-rcnn-swin-t-fpn-3x/blob/main/LICENSE.txt
- Zoo de modelos de SysCV (ETH Zurich): https://github.com/SysCV/bdd100k-models/tree/main/det
- Config de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/faster_rcnn_swin-t_fpn_3x_det_bdd100k.py
- Paper de Swin Transformer: https://arxiv.org/abs/2103.14030
- Pesos ImageNet del backbone: https://github.com/SwinTransformer/storage/releases/download/v1.0.0/swin_tiny_patch4_window7_224.pth
- Dataset en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
