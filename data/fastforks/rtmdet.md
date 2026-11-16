# fastforks/rtmdet

## Resumen

RTMDet es un detector de objetos de una sola etapa disenado para inferencia en tiempo real, publicado originalmente por Lyu et al. en 2022 dentro del ecosistema OpenMMLab. La arquitectura es completamente convolucional: un backbone CSPNeXt con convoluciones depthwise de 5x5, un cuello CSPNeXt-PAFPN y una cabeza que predice, por cada celda de los mapas de stride 8, 16 y 32, una puntuacion por clase y las distancias a los cuatro bordes de la caja, seguido de NMS por clase. Este repositorio, `fastforks/rtmdet`, no contiene pesos: es una model card que documenta las variantes empaquetadas por el proyecto fastforks, que descarga los checkpoints originales de OpenMMLab y los verifica contra hashes SHA-256.

El modelo cubre siete variantes: cinco checkpoints COCO de 80 clases (tiny, S, M, L y X) procedentes de mmdetection, y dos detectores especificos de persona (nano y M) que mmpose distribuye como fuente de cajas para RTMPose. Las imagenes se ajustan a 640x640 (la variante nano, a 320x320). La salida incluye cajas, etiquetas de clase, puntuaciones y, segun la variante, mascaras de instancia.

La relevancia actual de este empaquetado radica en la portabilidad: elimina la dependencia de mmdet y mmcv, ofrece un backend `portable` y un backend `kernels` con aceleracion CUDA, y documenta latencias y consumo de memoria medidos en una RTX 5060 Ti de 16 GB. Todo el codigo es Apache-2.0 y los pesos originales tambien, lo que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector one-stage convolucional: backbone CSPNeXt + cuello CSPNeXt-PAFPN + cabeza densa por celda (stride 8/16/32) con NMS por clase |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision); entrada de cualquier H x W >= 32, con padding a multiplo de 32; tamano de entrenamiento 640x640 (nano: 320x320) |
| Tipos de cuantizacion | no disponible (se documenta ejecucion en fp16 y fp32) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 (codigo y pesos; uso comercial permitido) |
| Formato de pesos | `.pth` (PyTorch, checkpoints originales de OpenMMLab, no alojados en este repo) |

Variantes documentadas:

| Variante | Pesos (origen) | SHA-256 (12 hex) | Uso comercial |
|---|---|---|---|
| `rtmdet-tiny-coco@1` | mmdetection | `78e30dcce0c6` | si |
| `rtmdet-s-coco@1` | mmdetection | `387a891e157c` | si |
| `rtmdet-m-coco@1` | mmdetection | `229f527ca884` | si |
| `rtmdet-l-coco@1` | mmdetection | `5a0be7c4a812` | si |
| `rtmdet-x-coco@1` | mmdetection | `cc79b9ae0970` | si |
| `rtmdet-nano-person@1` | mmpose | `05d8511e7b3f` | si |
| `rtmdet-m-person@1` | mmpose | `235e820939cb` | si |

## Arquitectura y entrenamiento

RTMDet es un transformer? No: es un detector puramente convolucional. El backbone CSPNeXt emplea convoluciones depthwise de 5x5 para ampliar el campo receptivo sin disparar el coste computacional, y alimenta un cuello CSPNeXt-PAFPN que fusiona las piramides de caracteristicas. La cabeza predice directamente, para cada celda de los mapas de stride 8, 16 y 32, un vector de puntuaciones por clase y cuatro distancias a los bordes de la caja, sin anchors. El postprocesado aplica NMS por clase. El modelo `module()` portable devuelve logits de clase y cajas decodificadas por celda antes de NMS.

El entrenamiento de los checkpoints COCO se realizo sobre COCO 2017 train con anotaciones de instancia durante 300 epocas (configuracion `8xb32`), partiendo de backbones CSPNeXt preentrenados en ImageNet-1k (ILSVRC 2012). Los detectores de persona (`rtmdet-m-person` y `rtmdet-nano-person`) se entrenaron 100 epocas sobre COCO con anotaciones de persona provenientes de Objects365, y se distribuyen como fuente de cajas para RTMPose. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un detector de vision.

La innovacion tecnica del empaquetado fastforks es la eliminacion de la dependencia de mmdet y mmcv, junto con dos backends: `portable` (implementacion independiente) y `kernels` (kernels CUDA propios, publicados en `fastforks/kernels`). El backend `kernels` acelera la inferencia entre 1.6x y 3.5x respecto a `portable` y entre 2.8x y 6.1x respecto a la implementacion original en fp32.

## Capacidades

- Deteccion de objetos en una sola pasada sobre imagenes RGB, con cajas, etiquetas de clase y puntuaciones de confianza.
- Segmentacion de instancias en las variantes que la soportan (segun los tags del repositorio).
- Deteccion de 80 clases COCO en las variantes `*-coco`.
- Deteccion especifica de personas en `rtmdet-nano-person` y `rtmdet-m-person`, pensadas como fuente de cajas para estimacion de pose con RTMPose.
- Entrada de resolucion arbitraria: cualquier H x W >= 32 con padding a multiplo de 32; probado hasta 3000x4000 en todas las variantes.
- Ejecucion en fp16 y fp32; el backend `portable` en fp16 alcanza picos de memoria de 0,4 a 0,7 GiB con imagenes de 3000x4000.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo de vision puro.

## Casos de uso

- Vigilancia y analitica de video en tiempo real: el detector `rtmdet-s-coco` procesa una imagen de 800x1344 en 2,97 ms con el backend `kernels`, lo que permite mantener decenas de FPS por stream en una sola GPU. Adecuado para conteo de personas y vehiculos.
- Estimacion de pose humana en pipelines de movimiento: `rtmdet-m-person` y `rtmdet-nano-person` actuan como fuente de cajas para RTMPose, formando un pipeline completo de deteccion y keypoints con la misma familia de backbone.
- Inspeccion industrial y control de calidad: las variantes COCO detectan objetos genericos en cadenas de produccion; la entrada de hasta 3000x4000 permite analizar imagenes de alta resolucion sin reescalar y localizar defectos pequenos.
- Moderacion de contenido visual: deteccion de personas y objetos en imagenes subidas por usuarios, con latencia de milisegundos y consumo de memoria inferior a 1 GiB incluso a resolucion completa.
- Analitica de retail: conteo de clientes, deteccion de productos y ocupacion de estanterias usando `rtmdet-l-coco` o `rtmdet-x-coco` cuando se prioriza precision sobre velocidad.
- Procesamiento por lotes en servidor: el backend `portable` con fp16 mantiene picos de 0,4-0,7 GiB para imagenes 3000x4000, lo que permite ejecutar varias instancias por GPU en tareas de etiquetado automatico o preanotacion de datasets.
- Sistemas embebidos y edge: `rtmdet-nano-person` consume solo 9-11 MiB de memoria en 800x1344 y tarda 2,11 ms con `kernels`, viable en GPUs de gama baja o Jetson.

## Benchmarks y rendimiento

Rendimiento medido en una RTX 5060 Ti de 16 GB, entrada sintetica de 800x1344. Tiempos en milisegundos y memoria pico en MiB (asignada / reservada):

| Modelo | Original fp32 (ms) | Portable (ms) | Kernels (ms) | Aceleracion kernels vs original | Memoria portable (MiB) | Memoria kernels (MiB) |
|---|---|---|---|---|---|---|
| `rtmdet-tiny-coco` | 10,7 | 6,04 | 2,74 | 3,9x | 40 / 56 | 40 / 84 |
| `rtmdet-s-coco` | 12,1 | 6,21 | 2,97 | 4,1x | 53 / 82 | 48 / 96 |
| `rtmdet-m-coco` | 14,7 | 7,69 | 4,49 | 3,3x | 114 / 148 | 122 / 200 |
| `rtmdet-m-person` | 14,1 | 7,39 | 4,12 | 3,4x | 114 / 146 | 119 / 202 |
| `rtmdet-l-coco` | 19,5 | 9,60 | 5,74 | 3,4x | 183 / 230 | 178 / 284 |
| `rtmdet-x-coco` | 32,2 | 13,3 | 8,55 | 2,8x | 267 / 316 | 267 / 378 |
| `rtmdet-nano-person` | 12,9 | 7,45 | 2,11 | 6,1x | 9 / 28 | 11 / 52 |

Tiempos de carga y primera llamada (segundos):

| Modelo | Carga original | Carga portable | Carga kernels | Primera llamada original | Primera llamada portable | Primera llamada kernels |
|---|---|---|---|---|---|---|
| `rtmdet-l-coco` | 0,68 | 0,63 | 2,07 | 0,32 | 1,27 | 0,36 |
| `rtmdet-m-coco` | 0,46 | 0,34 | 1,81 | 0,31 | 1,34 | 0,34 |
| `rtmdet-m-person` | 0,51 | 0,20 | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la informacion disponible resultados de benchmarks de precision (mAP en COCO, por ejemplo) para estas variantes empaquetadas. El aviso de la model card no incluye cifras de calidad de deteccion.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 9 y 52 MiB en 800x1344 con el backend `kernels` (nano a X); entre 40 y 267 MiB con `portable`; hasta 0,7 GiB con imagenes de 3000x4000 en `rtmdet-x-coco`.
- GPU recomendadas: cualquier GPU CUDA con al menos 1-2 GiB libres para las variantes pequenas; para `rtmdet-x-coco` a resolucion completa se recomienda 2 GiB o mas. Los datos se midieron en una RTX 5060 Ti de 16 GB.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU consumer moderna (RTX 3060, 4060, 5060, etc.), dado el bajo consumo de memoria.
- Opciones de despliegue: libreria `fastforks` con backends `portable` y `kernels` (CUDA). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: 2,11-8,55 ms por imagen 800x1344 con `kernels`; 6,04-13,3 ms con `portable`; 10,7-32,2 ms con la implementacion original en fp32. La primera llamada con `portable` tarda 1,27-1,34 s por compilacion o inicializacion.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento (mAP) ni de especificaciones de parametros de modelos alternativos, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia cualitativa de la misma categoria (detectores one-stage en tiempo real), los competidores habituales serian YOLOv8, YOLOv10 y RT-DETR, pero no se han proporcionado sus cifras en esta busqueda.

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| RTMDet (este repo) | no disponible | cualquier H x W >= 32 | Apache-2.0 | Hugging Face (card) + OpenMMLab |
| YOLOv8 | no disponible | no disponible | AGPL-3.0 / comercial | Ultralytics |
| YOLOv10 | no disponible | no disponible | AGPL-3.0 | GitHub |
| RT-DETR | no disponible | no disponible | Apache-2.0 | OpenMMLab / Hugging Face |

## Limitaciones y advertencias

- Este repositorio no contiene pesos: es solo una model card. La descarga de checkpoints se realiza desde los enlaces de OpenMMLab y se verifica por SHA-256.
- No se han publicado cifras de precision (mAP) en la informacion disponible; no es posible evaluar la calidad de deteccion a partir de esta ficha.
- Las variantes COCO estan limitadas a 80 clases; cualquier clase fuera de ese conjunto no sera detectada.
- Las variantes `*-person` solo detectan personas, no otras clases.
- El modelo no procesa lenguaje: no hay soporte multilingue, tool calling ni razonamiento.
- Riesgo de falsos positivos y negativos inherente a los detectores one-stage con NMS; no se documentan umbrales de confianza recomendados.
- La model card advierte que las cadenas de licencia del codigo original se recogen tal cual y deben revisarse antes de cualquier uso distinto de la investigacion; el codigo y los pesos son Apache-2.0, pero se recomienda verificar los ficheros `LICENSE`.
- El backend `portable` tiene una primera llamada lenta (1,27-1,34 s) por inicializacion; el backend `kernels` tarda mas en cargar (hasta 2,07 s en `rtmdet-l-coco`).
- No se documentan sesgos especificos ni composicion demografica del dataset de entrenamiento mas alla de COCO 2017 e ImageNet-1k.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/rtmdet
- Codigo del proyecto fastforks: https://github.com/kleinicke/fastforks
- Kernels CUDA del backend `kernels`: https://huggingface.co/fastforks/kernels
- Codigo original (mmdetection, commit `44ebd17b145c`): https://github.com/open-mmlab/mmdetection
- Evidencia de licencia (README de configs/rtmdet): https://github.com/open-mmlab/mmdetection/blob/44ebd17b145c2372c4b700bfb9cb20dbd28ab64a/configs/rtmdet/README.md
- Pesos `rtmdet-l-coco`: https://download.openmmlab.com/mmdetection/v3.0/rtmdet/rtmdet_l_8xb32-300e_coco/rtmdet_l_8xb32-300e_coco_20220719_112030-5a0be7c4.pth
- Pesos `rtmdet-m-coco`: https://download.openmmlab.com/mmdetection/v3.0/rtmdet/rtmdet_m_8xb32-300e_coco/rtmdet_m_8xb32-300e_coco_20220719_112220-229f527c.pth
- Pesos `rtmdet-s-coco`: https://download.openmmlab.com/mmdetection/v3.0/rtmdet/rtmdet_s_8xb32-300e_coco/rtmdet_s_8xb32-300e_coco_20220905_161602-387a891e.pth
- Pesos `rtmdet-tiny-coco`: https://download.openmmlab.com/mmdetection/v3.0/rtmdet/rtmdet_tiny_8xb32-300e_coco/rtmdet_tiny_8xb32-300e_coco_20220902_112414-78e30dcc.pth
- Pesos `rtmdet-x-coco`: https://download.openmmlab.com/mmdetection/v3.0/rtmdet/rtmdet_x_8xb32-300e_coco/rtmdet_x_8xb32-300e_coco_20220715_230555-cc79b9ae.pth
- Pesos `rtmdet-m-person`: https://download.openmmlab.com/mmpose/v1/projects/rtmpose/rtmdet_m_8xb32-100e_coco-obj365-person-235e8209.pth
- Pesos `rtmdet-nano-person`: https://download.openmmlab.com/mmpose/v1/projects/rtmpose/rtmdet_nano_8xb32-100e_coco-obj365-person-05d8511e.pth
