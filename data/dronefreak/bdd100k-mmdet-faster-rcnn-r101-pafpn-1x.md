# dronefreak/bdd100k-mmdet-faster-rcnn-r101-pafpn-1x

## Resumen

El modelo `dronefreak/bdd100k-mmdet-faster-rcnn-r101-pafpn-1x` es una réplica (mirror) de un baseline oficial de detección de objetos sobre el conjunto de datos BDD100K, publicado originalmente por el equipo de BDD100K en 2020 en el servidor de descargas de Berkeley. Emplea la arquitectura Faster R-CNN con backbone ResNet-101, cuello PAFPN (PANet) y cabecera RoI con dos capas fully-connected compartidas, implementada sobre mmdetection 2.x. El autor de esta réplica (dronefreak) añade documentación, un entorno de dependencias fijado y un script de inferencia para que el checkpoint siga siendo ejecutable hoy, dado que el stack original (PyTorch 1.6, CUDA 10.2, mmdetection 2.5) ya no funciona en GPUs actuales.

El modelo resuelve la tarea de detección de objetos en escenas de conducción autónoma, con categorías propias de BDD100K (vehículos, peatones, señales de tráfico, semáforos, etc.). Con 64.032.258 parámetros totales, es un modelo de tamaño medio que cabe holgadamente en GPUs de consumo, y su relevancia actual radica en servir como referencia reproducible y bien documentada para comparaciones y pipelines de percepción en conducción.

No es un modelo de lenguaje ni un modelo generativo: es un detector de objetos puro de la familia CNN de dos etapas, entrenado exclusivamente sobre BDD100K train (70.000 imágenes) durante 12 épocas (esquema 1x).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Faster R-CNN de dos etapas: ResNet-101 (backbone) + PAFPN/PANet (neck) + RoIAlign + cabecera de cajas con 2 FC compartidas |
| Parámetros totales | 64.032.258 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | no disponible (el autor no documenta cuantizaciones; los pesos son safetensors en fp32) |
| Idiomas soportados | no aplica (modelo de visión; no procesa texto) |
| Licencia | bdd100k (license_name: bdd100k, license_link en el repo); etiquetada como `license:other` |
| Formato de pesos | safetensors (checkpoint mmdetection; `torch.load(weights_only=True)`) |

## Arquitectura y entrenamiento

Faster R-CNN de dos etapas con backbone ResNet-101 inicializado desde los pesos ImageNet de torchvision, neck PAFPN (PANet) para la fusión multi-escala de características, RoIAlign para la extracción de regiones y una cabecera de cajas con dos capas fully-connected compartidas. El entrenamiento se realizó sobre BDD100K train (70.000 imágenes) durante 12 épocas (esquema 1x), con SGD a learning rate 0.02, decaimiento en los pasos 8 y 11, y batch de 16, sobre GPUs TITAN Xp. El stack original fue PyTorch 1.6.0, CUDA 10.2, mmcv 1.1.5 y mmdetection 2.5.0.

La réplica fija un entorno moderno pero compatible: Python 3.10, torch/torchvision 2.0.1/0.15.2 (CUDA 11.8 o CPU), mmcv-full 1.7.2 y mmdetection 2.28.2 (última release 2.x), con numpy 1.26.4, opencv-python 4.10.0.84 y setuptools/yapf fijados. La verificación incluida es notable: sobre 20 imágenes de test elegidas al azar, la copia reproduce las 617 cajas del autor con puntuaciones idénticas e IoU 1.0000 frente a las predicciones originales; el SHA-256 del archivo (`03088bbf...`) coincide con el nombre original. No se documenta RLHF, DPO ni innovaciones de decodificación; es un detector clásico sin mecanismos de atención lineal ni decodificación especulativa.

## Capacidades

- Detección de objetos en imágenes y vídeo de escenas de conducción (categorías BDD100K).
- Inferencia sobre imagen individual, carpeta de imágenes, archivo de vídeo y webcam (vía `infer.py`).
- Salida de detecciones en formato BDD100K (píxeles, `x1 y1 x2 y2`) mediante `--json`.
- Umbral de puntuación configurable (`--score-thr`, por defecto 0.3) y límite de fotogramas (`--max-frames`).
- Ejecución en CPU y en GPU (entorno CUDA 11.8 disponible; solo el entorno CPU está verificado).
- Carga segura de pesos con `torch.load(weights_only=True)` (el checkpoint solo contiene tensores y metadatos).
- No soporta tool calling, agentes, razonamiento multi-paso, ni capacidades multilingües (no procesa texto).

## Casos de uso

- Percepción en conducción autónoma: detección de vehículos, peatones y señales en fotogramas de vídeo de tráfico, usando el detector como módulo de percepción de referencia en pipelines de investigación.
- Evaluación comparativa de detectores: servir como baseline reproducible (mAP@50:95 = 30,2 en val) frente a modelos más modernos sobre BDD100K.
- Anotación asistida: preanotar imágenes de escenas de conducción y revisar manualmente las cajas, reduciendo el coste de etiquetado con el umbral de puntuación ajustable.
- Análisis de vídeo de tráfico: procesar archivos de vídeo (`infer.py drive.mov`) para extraer detecciones por fotograma y analizar densidad de vehículos o peatones.
- Docencia y reproducción de experimentos: el entorno fijado y la verificación de IoU 1.0000 permiten reproducir exactamente los resultados de 2020 en hardware actual.
- Prototipado en CPU: al caber en CPU y en GPUs de consumo, permite validar pipelines de detección sin infraestructura dedicada.
- Integración en sistemas de vigilancia o análisis de escenas urbanas: detección de objetos con salida JSON compatible con el formato BDD100K.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados, `verified: false`), sobre BDD100K validation, tarea object-detection:

| Métrica | Valor |
|---|---|
| mAP@50:95 (val) | 30,2 |
| mAP@50 (val) | 55,1 |
| mAP@75 (val) | 28,1 |

No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.), que no aplican a este modelo de visión.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 64,0 M de parámetros en fp32 el checkpoint ronda los 0,26 GB de pesos, por lo que la inferencia cabe con holgura en GPUs de consumo (el repo completo ocupa 0,9 GB).
- GPU recomendadas: el autor entrenó con TITAN Xp; para inferencia basta cualquier GPU NVIDIA compatible con CUDA 11.8. No se especifican modelos concretos (A100, H100, RTX 4090) en la información.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (64 M de parámetros); no se detalla en qué modelos exactos.
- Despliegue: entorno propio con mmdetection 2.28.2 + mmcv-full 1.7.2 y script `infer.py`; soporta CPU (verificado) y CUDA 11.8 (no verificado). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de otros detectores comparables (por ejemplo, otros baselines de BDD100K) con los que contrastar parámetros, contexto, rendimiento y licencia. Por tanto, la comparativa se indica como no disponible.

| Modelo | Parámetros | Contexto | mAP@50:95 (BDD100K val) | Licencia |
|---|---|---|---|---|
| Este modelo (Faster R-CNN R101-PAFPN 1x) | 64,0 M | no aplica | 30,2 | bdd100k |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un detector de 2020: su precisión (mAP@50:95 = 30,2) es modesta frente a detectores más recientes; no debe tomarse como estado del arte.
- Entrenado exclusivamente con BDD100K; puede generalizar mal a dominios distintos (otras cámaras, países, condiciones meteorológicas no representadas).
- Riesgo de falsos positivos y negativos en condiciones difíciles (noche, lluvia, oclusión); el umbral por defecto es 0,3 y conviene ajustarlo según el caso.
- Sesgos del dataset BDD100K (geografía, condiciones de captura) se heredan en las predicciones.
- Licencia BDD100K (`license:other`, license_name bdd100k): restricciones de uso comercial deben consultarse en el LICENSE.txt del repo; no se asume uso comercial libre.
- El entorno CUDA 11.8 no ha sido verificado por el autor; solo el entorno CPU está probado.
- El checkpoint original carecía de documentación; esta réplica la aporta, pero los benchmarks siguen sin verificación independiente (`verified: false`).
- La ruta de webcam no fue probada con una cámara real.
- El stack requiere versiones antiguas de mmdetection (2.x) y setuptools/yapf fijados; instalar en un entorno existente puede degradar paquetes.

## Enlaces

- Hugging Face: https://huggingface.co/dronefreak/bdd100k-mmdet-faster-rcnn-r101-pafpn-1x
- Licencia (LICENSE.txt): https://huggingface.co/dronefreak/bdd100k-mmdet-faster-rcnn-r101-pafpn-1x/blob/main/LICENSE.txt
- Dataset referenciado: https://huggingface.co/datasets/dronefreak/BDD100K
- Vídeo demo (banner): https://huggingface.co/dronefreak/bdd100k-mmdet-faster-rcnn-r101-pafpn-1x/resolve/main/assets/demo_banner.mp4
- Poster del vídeo demo: https://huggingface.co/dronefreak/bdd100k-mmdet-faster-rcnn-r101-pafpn-1x/resolve/main/assets/demo_banner_poster.jpg
- mmdetection (framework): https://github.com/open-mmlab/mmdetection
- mmcv (framework): https://github.com/open-mmlab/mmcv
