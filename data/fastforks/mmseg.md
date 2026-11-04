# fastforks/mmseg

## Resumen

`fastforks/mmseg` es un repositorio de tarjetas de modelo (model card) que empaqueta los checkpoints clásicos de segmentación semántica de mmsegmentation sobre el conjunto ADE20K, sin dependencia de las librerías originales mmseg ni mmcv. Lo desarrolla el proyecto fastforks (autor `kleinicke`), y su función es permitir la descarga verificada de los pesos originales de OpenMMLab mediante huellas SHA-256, además de ofrecer implementaciones portables y optimizadas con kernels propios. No contiene pesos en el propio repositorio: solo metadatos y enlaces.

El paquete cubre cinco variantes CNN clásicas: FCN, PSPNet, DeepLabV3 y DeepLabV3+ sobre un backbone ResNet-101 con dilation (output stride 8), y HRNetV2-W48 con cabeza FCN. Todas están entrenadas para segmentación semántica de 150 clases sobre ADE20K (SceneParsing) y se ofrecen en dos backends: `portable` (PyTorch puro) y `kernels` (kernels CUDA optimizados). La entrada es una imagen RGB de cualquier resolución H x W ≥ 1 y la salida son logits por píxel.

Es relevante para desarrolladores que necesitan segmentación semántica clásica sin arrastrar el ecosistema mmcv, con control de integridad de pesos, licencia Apache-2.0 en código y pesos, y métricas de velocidad y memoria publicadas sobre una RTX 5060 Ti de 16 GB. No es un modelo generativo ni un transformer: es una colección de redes convolucionales de referencia para tareas de segmentación densa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN: FCN, PSPNet, DeepLabV3, DeepLabV3+ (ResNet-101 dilated, OS 8) y HRNetV2-W48 con cabeza FCN |
| Parámetros totales | no disponible (no se indica el recuento por variante) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de cualquier H x W ≥ 1) |
| Tipos de cuantización | fp32 y fp16 (probados en el backend portable) |
| Idiomas soportados | no aplica (no es modelo de lenguaje) |
| Licencia | Apache-2.0 (código y pesos de las cinco variantes; uso comercial permitido) |
| Formato de pesos | `.pth` (PyTorch, descargados desde OpenMMLab y verificados por SHA-256) |

## Arquitectura y entrenamiento

Las cinco variantes son arquitecturas convolucionales clásicas de segmentación semántica. Cuatro de ellas comparten un backbone ResNet-101 con convoluciones dilatadas y output stride 8, combinado con cabezas específicas: FCN (cabeza lineal por píxel), PSPNet (módulo de pooling piramidal), DeepLabV3 (ASPP con convoluciones dilatadas en paralelo) y DeepLabV3+ (ASPP más un decoder que fusiona features de bajo nivel). La quinta variante, HRNetV2-W48, mantiene representaciones de alta resolución en paralelo a lo largo de toda la red y añade una cabeza FCN. Todas producen logits por píxel para 150 clases.

El entrenamiento se realizó sobre ADE20K (SceneParsing, 150 clases) con inicialización del backbone en ImageNet-1k (ILSVRC 2012). Los checkpoints son los publicados por OpenMMLab en mmsegmentation (commit `c685fe6767c4`), con configuración de 512x512 y 160k iteraciones. La innovación del paquete fastforks no está en el entrenamiento sino en la ingeniería de despliegue: redes vendorizadas sin dependencia de mmseg/mmcv, verificación criptográfica de los pesos descargados, un backend `portable` en PyTorch puro y un backend `kernels` con kernels CUDA propios que aceleran la inferencia entre 1,9x y 4,1x respecto al código original en fp32.

## Capacidades

- Segmentación semántica densa por píxel sobre 150 clases de ADE20K (interior, exterior, objetos, escenas).
- Entrada de imagen RGB de resolución arbitraria (H x W ≥ 1), con redimensionado o padding interno.
- Salida de logits por píxel, apta para argmax directo o postprocesado personalizado.
- Dos backends de ejecución: `portable` (PyTorch, sin dependencias de mmcv) y `kernels` (CUDA optimizado).
- Verificación de integridad de pesos mediante SHA-256.
- Soporte de fp16 en el backend portable, con reducción de memoria y latencia.
- Procesamiento de imágenes de hasta 12 MP (4000x3000) y 3000x4000 en pruebas publicadas.
- No soporta tool calling, agentes, texto, visión general, audio ni razonamiento multi-paso: es exclusivamente un modelo de segmentación.

## Casos de uso

- Segmentación de escenas urbanas y conducción autónoma: DeepLabV3+ con ResNet-101 OS 8 sobre ADE20K ofrece clases de calle, acera, vehículos y vegetación; su decoder de bajo nivel mejora los contornos de objetos pequeños, útil para percepción en tiempo real a 1080p (41 ms con backend `kernels`).
- Segmentación de interiores para realidad aumentada o robótica doméstica: PSPNet captura contexto global mediante pooling piramidal, adecuado para identificar paredes, suelo, muebles y electrodomésticos en imágenes de habitaciones.
- Preprocesado de pipelines de visión: FCN es la variante más ligera en latencia (32,5 ms a 1080p con `kernels`) y sirve como etapa de segmentación gruesa antes de modelos más costosos.
- Análisis de imágenes de alta resolución (satélite, drones, fotografía): las cinco variantes procesan 12 MP en 88-105 ms con `kernels`, con picos de memoria de 7,4-7,5 GiB, lo que permite lotes de imágenes grandes en una GPU de 16 GB.
- Sustitución de mmsegmentation en producción: al eliminar la dependencia de mmcv, el paquete simplifica el despliegue en contenedores y CI/CD, manteniendo los pesos originales verificados por hash.
- Segmentación en dispositivos con GPU consumer: con cuantización fp16 y el backend portable, las variantes caben en GPUs de 8-16 GB y procesan 720p en 25-49 ms, viable para prototipos y aplicaciones interactivas.
- Investigación y benchmarking de arquitecturas CNN: el paquete ofrece cinco referencias comparables sobre el mismo dataset y backbone, con métricas de latencia y memoria reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (mIoU, pixel accuracy) en la información disponible. Los datos publicados son de velocidad y memoria sobre una RTX 5060 Ti de 16 GB, con entrada sintética de 1024x2048:

| Modelo | Tiempo original fp32 (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico kernels (MiB asignada/reservada) |
|---|---|---|---|---|---|
| `deeplabv3-r101-d8-ade20k` | 108,41 | 54,83 | 48,14 | 2,7x | 362 / 518 |
| `deeplabv3plus-r101-d8-ade20k` | 104,10 | 53,36 | 47,34 | 3,0x | 365 / 560 |
| `fcn-r101-d8-ade20k` | 94,21 | 47,05 | 40,99 | 2,8x | 294 / 478 |
| `hrnet-w48-fcn-ade20k` | 48,09 | 54,80 | 32,28 | 4,1x | 274 / 430 |
| `pspnet-r101-d8-ade20k` | 92,52 | 47,17 | 49,34 | 1,9x | 341 / 494 |

Rendimiento a resoluciones fijas con backend `kernels` (tiempo / memoria asignada / reservada en MiB):

| Modelo | 640x480 | 1280x720 | 1920x1080 | 12 MP (4000x3000) |
|---|---|---|---|---|
| `deeplabv3-r101-d8-ade20k` | 20,0 ms / 583 / 718 | 28,5 ms / 1012 / 1196 | 35,5 ms / 1684 / 1880 | 90,5 ms / 7476 / 7708 |
| `deeplabv3plus-r101-d8-ade20k` | 23,8 ms / 546 / 716 | 34,0 ms / 977 / 1222 | 41,0 ms / 1649 / 1902 | 94,4 ms / 7429 / 7668 |
| `fcn-r101-d8-ade20k` | 17,6 ms / 549 / 692 | 25,5 ms / 977 / 1154 | 32,5 ms / 1649 / 1854 | 88,2 ms / 7441 / 7682 |
| `hrnet-w48-fcn-ade20k` | no disponible en el extracto | no disponible | no disponible | no disponible |
| `pspnet-r101-d8-ade20k` | no disponible en el extracto | no disponible | no disponible | no disponible |

Tiempos de carga y primera llamada (512x512): la carga oscila entre 0,73 y 1,14 s en portable y 0,75-0,91 s en kernels; la primera llamada es de 0,10-0,12 s en portable y 0,01-0,03 s en kernels.

## Requisitos de hardware

- VRAM estimada: entre 0,3 y 0,6 GiB para 1024x2048 con backend `kernels`; alrededor de 7,5 GiB reservados para imágenes de 12 MP; 7,3-7,5 GiB de pico en 3000x4000 con fp16 portable.
- GPU recomendadas: RTX 5060 Ti 16 GB (plataforma de las pruebas), RTX 4090, A100 y H100 para lotes grandes o alta resolución; cualquier GPU CUDA con al menos 8 GB para 1080p.
- Cabe en GPU consumer: sí, en GPUs de 8-16 GB para resoluciones de hasta 1080p o 12 MP en fp16; para 12 MP se recomienda 16 GB.
- Opciones de despliegue: paquete `fastforks` con backends `portable` y `kernels`; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de segmentación).
- Latencia y throughput: 17,6-23,8 ms a 640x480, 25,5-34,0 ms a 720p, 32,5-41,0 ms a 1080p y 88,2-94,4 ms a 12 MP con backend `kernels`; el backend portable es entre 1,5 y 2,6 veces más lento según variante.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fastforks/mmseg` (este paquete) | CNN clásicas (FCN, PSPNet, DeepLabV3, DeepLabV3+, HRNet) | no disponible | imagen H x W ≥ 1 | Apache-2.0 | HuggingFace + OpenMMLab |
| mmsegmentation original (OpenMMLab) | mismas CNN | no disponible | imagen H x W ≥ 1 | Apache-2.0 | GitHub + download.openmmlab.com |
| Segment Anything (SAM) | transformer de segmentación promptable | no disponible en la información | imagen + prompts | no disponible en la información | no disponible en la información |
| Mask2Former / MaskFormer | transformer de segmentación universal | no disponible en la información | imagen | no disponible en la información | no disponible en la información |

La comparativa con SAM o Mask2Former no puede completarse con datos verificados en la información proporcionada. La diferencia principal frente a mmsegmentation original es la ausencia de dependencia de mmcv, la verificación SHA-256 y los kernels CUDA propios.

## Limitaciones y advertencias

- El repositorio no contiene pesos: solo la model card y enlaces; la descarga depende de la disponibilidad de los servidores de OpenMMLab.
- No se publican métricas de precisión (mIoU) en la información disponible; no se puede evaluar la calidad de segmentación sin ejecutar los checkpoints.
- El modelo card advierte que el paquete original es de uso de investigación y que deben revisarse las cadenas de licencia antes de otros usos, pese a que código y pesos figuran como Apache-2.0.
- Segmentación limitada a las 150 clases de ADE20K; no cubre clases fuera de ese vocabulario ni segmentación promptable o de instancias.
- Riesgo de degradación en dominios alejados de ADE20K (imágenes médicas, satelitales específicas, industriales) sin fine-tuning.
- Las pruebas de memoria y velocidad se hicieron en una única GPU (RTX 5060 Ti 16 GB); el rendimiento en otras GPU puede variar.
- El backend `kernels` requiere CUDA y no está disponible en CPU; el backend portable es más lento pero más portable.
- El uso de fp16 puede introducir diferencias numéricas frente a fp32 en los logits; conviene validar el postprocesado.
- No hay información sobre sesgos demográficos o geográficos del dataset ADE20K en la documentación proporcionada.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/fastforks/mmseg
- Repositorio del código: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original mmsegmentation: https://github.com/open-mmlab/mmsegmentation (commit `c685fe6767c4`)
- Evidencia de licencia: https://github.com/open-mmlab/mmsegmentation/blob/c685fe6767c4cadf6b051983ca6208f1b9d1ccb8/README.md#license
- Pesos DeepLabV3: https://download.openmmlab.com/mmsegmentation/v0.5/deeplabv3/deeplabv3_r101-d8_512x512_160k_ade20k/deeplabv3_r101-d8_512x512_160k_ade20k_20200615_105816-b1f72b3b.pth
- Pesos DeepLabV3+: https://download.openmmlab.com/mmsegmentation/v0.5/deeplabv3plus/deeplabv3plus_r101-d8_512x512_160k_ade20k/deeplabv3plus_r101-d8_512x512_160k_ade20k_20200615_123232-38ed86bb.pth
- Pesos FCN: https://download.openmmlab.com/mmsegmentation/v0.5/fcn/fcn_r101-d8_512x512_160k_ade20k/fcn_r101-d8_512x512_160k_ade20k_20200615_105816-fd192bd5.pth
- Pesos HRNetV2-W48: https://download.openmmlab.com/mmsegmentation/v0.5/hrnet/fcn_hr48_512x512_160k_ade20k/fcn_hr48_512x512_160k_ade20k_20200614_214407-a52fc02c.pth
- Pesos PSPNet: https://download.openmmlab.com/mmsegmentation/v0.5/pspnet/pspnet_r101-d8_512x512_160k_ade20k/pspnet_r101-d8_512x512_160k_ade20k_20200615_100650-967c316f.pth
