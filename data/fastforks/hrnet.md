# fastforks/hrnet

## Resumen

HRNet (High-Resolution Network) es una arquitectura de red neuronal convolucional para estimación de pose humana 2D presentada originalmente por Sun et al. en 2019. Este repositorio de `fastforks` no aloja pesos propios: es una model card que documenta la integración de los checkpoints oficiales de mmpose (variantes w32 y w48, resoluciones 256x192 y 384x288) dentro de la librería `fastforks`, con verificación de integridad mediante SHA-256 y descarga desde los enlaces originales de OpenMMLab.

El modelo resuelve la detección de keypoints mediante un enfoque top-down: recibe una imagen RGB junto con cajas delimitadoras de personas (por ejemplo, procedentes de `fastforks.detection`), recorta cada persona al tamaño de entrada de la red y devuelve 17 keypoints COCO con sus puntuaciones de confianza. La innovación arquitectónica clave de HRNet es mantener una rama de alta resolución (escala 1/4) durante toda la red e intercambiar features repetidamente con tres ramas paralelas de menor resolución, evitando la pérdida de resolución típica de las arquitecturas encoder-decoder.

La relevancia actual de esta ficha radica en su enfoque de empaquetado: elimina la dependencia de mmpose/mmcv, ofrece backends `portable` y `kernels` con aceleraciones medidas de hasta 18x frente al código original, y documenta latencias, memoria y compilación (torch.compile, TensorRT) sobre una RTX 5060 Ti. Es una opción práctica para pipelines de pose estimation en producción con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con ramas paralelas multi-resolucion (HRNet, high-resolution network) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada H x W >= 32, multiplo de 32) |
| Tipos de cuantizacion | fp32 y fp16 documentados; no se mencionan otros |
| Idiomas soportados | no aplica (modelo de vision, sin capacidades linguisticas) |
| Licencia | Apache-2.0 (codigo y pesos; uso comercial permitido segun la card) |
| Formato de pesos | `.pth` (checkpoints PyTorch de mmpose, descargados desde OpenMMLab) |

Variantes disponibles:

| Variante | Resolucion | SHA-256 (12 hex) | Uso comercial |
|---|---|---|---|
| `hrnet-w32@1` | 256x192 | `81c58e403a1b` | si |
| `hrnet-w32-384@1` | 384x288 | `ca5956af0765` | si |
| `hrnet-w48@1` | 256x192 | `0e67c6167d6a` | si |
| `hrnet-w48-384@1` | 384x288 | `c161b7defc14` | si |

## Arquitectura y entrenamiento

HRNet es una CNN que mantiene de forma paralela cuatro ramas a distintas resoluciones (1/4, 1/8, 1/16 y 1/32 de la entrada). A lo largo de la red, las ramas intercambian informacion repetidamente mediante fusiones, de modo que la rama de mayor resolucion conserva detalle espacial fino en lugar de recuperarlo mediante upsampling. Sobre la rama mas fina se aplica una convolucion 1x1 que produce un mapa de calor (heatmap) por keypoint; la decodificacion toma el maximo de cada heatmap y lo desplaza un cuarto de pixel hacia el vecino mayor para obtener coordenadas subpixel.

Los pesos son los checkpoints oficiales de mmpose entrenados sobre COCO 2017 (anotaciones de instancias y keypoints), con el backbone inicializado a partir de pesos de clasificacion de ImageNet-1k (ILSVRC 2012). Las variantes w32 y w48 se diferencian en el ancho de los canales; las variantes 384 amplian la resolucion de entrada de 256x192 a 384x288. El pipeline es top-down: cada persona se recorta segun su caja y se redimensiona al tamano de red antes de la inferencia. El empaquetado de `fastforks` prescinde de mmpose y mmcv, expone un `module()` portable que mapea recortes a heatmaps y ofrece un backend `kernels` optimizado.

## Capacidades

- Deteccion de pose humana 2D top-down con 17 keypoints COCO por persona.
- Salida de `keypoints`, `keypoint_scores`, `boxes` y `scores`.
- Procesamiento multi-persona: una caja por persona en la entrada, keypoints independientes por instancia.
- Entrada de imagen de cualquier tamano H x W >= 32 (padded a multiplo de 32); probado hasta 3000x4000.
- Backends `portable` (PyTorch) y `kernels` (acelerado), con soporte de fp16 y fp32.
- Compatibilidad con `torch.compile` y exportacion a TensorRT fp16 y ONNX.
- Integracion con el resto del ecosistema `fastforks` (p. ej. `fastforks.detection` para las cajas de persona).
- Verificacion de integridad de pesos mediante SHA-256 declarado en la card.

## Casos de uso

- Analisis de video deportivo: estimacion de poses por fotograma para calcular angulos articulares, cinematica de movimiento o deteccion de posturas en grabaciones de alta resolucion (hasta 3000x4000), usando `hrnet-w48-384` cuando se requiere mayor precision en keypoints.
- Control de calidad ergonomico en entornos industriales: monitorizacion de posturas de operarios mediante camaras fijas, detectando posturas de riesgo a partir de los 17 keypoints y sus scores de confianza.
- Tele-rehabilitacion y fisioterapia: seguimiento de ejercicios en tiempo real con `hrnet-w32` en GPU de consumo (20,3 ms por frame en 1080x1920 con backend portable, 9,79 ms con kernels), suficiente para analisis cuasi en tiempo real.
- Animacion y motion capture: extraccion de esqueletos 2D por persona para pipelines de animacion o retargeting, aprovechando el enfoque top-down que separa correctamente instancias en escenas multi-persona.
- Analitica de retail y espacios publicos: conteo y analisis postural agregado (anonimizado) combinando deteccion de personas de `fastforks.detection` con la estimacion de pose de HRNet.
- Investigacion en vision por computador: baseline reproducible para experimentos de pose estimation con pesos oficiales verificados y sin dependencia de mmcv, facilitando la integracion en entornos modernos de PyTorch.
- Despliegue en edge con TensorRT: exportacion a motor TensorRT fp16 (5,18 ms para w32 en 1080x1920 sobre RTX 5060 Ti) para inferencia de baja latencia en estaciones locales.

## Benchmarks y rendimiento

Rendimiento medido sobre RTX 5060 Ti 16 GB (sm_120), entrada sintetica 1080x1920, fp16:

| Modelo | Original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleracion vs original | Memoria pico portable (MiB) |
|---|---|---|---|---|---|---|
| `hrnet-w32` | 176 | 190 | 20,3 | 9,79 | 18,0x | 195 / 258 |
| `hrnet-w32-384` | 216 | 190 | 38,8 | 19,4 | 9,8x | 341 / 434 |
| `hrnet-w48` | 200 | 206 | 32,0 | 15,5 | 12,9x | 262 / 322 |
| `hrnet-w48-384` | 276 | 245 | 70,5 | 33,9 | 7,2x | 408 / 498 |

Compilacion y TensorRT (entrada 1080x1920):

| Modelo | Portable (ms) | torch.compile (ms) | TensorRT fp16 (ms) | Kernels (ms) |
|---|---|---|---|---|
| `hrnet-w32` | 20,3 | 9,94 | 5,18 | 9,79 |
| `hrnet-w32-384` | 38,8 | 19,6 | 10,7 | 19,4 |
| `hrnet-w48` | 32,0 | 21,2 | 9,46 | 15,5 |
| `hrnet-w48-384` | 70,5 | 46,0 | 22,3 | 33,9 |

No se han publicado resultados de benchmarks de precision (AP en COCO) en la informacion disponible.

## Requisitos de hardware

- VRAM: muy baja. Memoria pico reservada entre 258 y 498 MiB para las cuatro variantes con backend portable en 1080x1920; hasta 1082 MiB en el codigo original para `hrnet-w48-384`.
- GPU recomendadas: cualquier GPU CUDA con al menos ~1 GB libre; las mediciones se realizaron en RTX 5060 Ti 16 GB. A100/H100 no son necesarias para este modelo.
- Cabe holgadamente en GPU de consumo (RTX 3060, 4060, 4090, etc.) e incluso en GPUs de gama baja con suficiente memoria.
- Opciones de despliegue: libreria `fastforks` (backends `portable` y `kernels`), PyTorch nativo, `torch.compile`, TensorRT fp16 y ONNX.
- Latencia: 9,79-33,9 ms con backend `kernels` en 1080x1920; 5,18-22,3 ms con TensorRT fp16. Tiempo de carga entre 0,25 y 2,53 s segun backend y variante.
- Throughput: no disponible de forma explicita (solo latencias por frame).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entrada | Licencia | Notas |
|---|---|---|---|---|---|
| HRNet (este repo) | CNN multi-rama | no disponible | 256x192 / 384x288 | Apache-2.0 | Top-down, 17 keypoints COCO, sin dependencia de mmcv |
| HRNet original (mmpose) | CNN multi-rama | no disponible | 256x192 / 384x288 | Apache-2.0 | Version de referencia; requiere mmpose/mmcv |
| Sapiens (Meta) | ViT | 0,3B-2B | variable | CC BY-NC (segun variante) | Pose y segmentacion; no disponible en esta busqueda para comparacion directa |
| RTMPose (mmpose) | CNN ligero | no disponible | variable | Apache-2.0 | Alternativa mas rapida y ligera; no disponible en esta busqueda para comparacion directa |

No se dispone de datos de precision comparativos en la informacion proporcionada; la comparativa se limita a aspectos de empaquetado, licencia y latencia.

## Limitaciones y advertencias

- Modelo exclusivamente de vision: no procesa texto ni tiene capacidades linguisticas, de razonamiento o de tool calling.
- Enfoque top-down: depende de un detector de personas previo; errores en las cajas se propagan a los keypoints.
- Solo 17 keypoints COCO (cuerpo completo); no cubre manos, rostro detallado ni pose 3D.
- La card advierte que las cadenas de licencia originales se registran "tal cual" y recomienda revisarlas antes de cualquier uso distinto al de investigacion, pese a que la licencia declarada es Apache-2.0 y la columna de uso comercial indica "yes".
- No se han publicado metricas de precision (AP) en esta card; el rendimiento se documenta solo en latencia y memoria.
- El repositorio no contiene pesos: requiere descarga desde OpenMMLab y verificacion SHA-256; sin conexion a esos enlaces el modelo no es utilizable.
- El backend `kernels` tiene mayor tiempo de carga inicial (2,04-2,53 s) que el portable (0,25-0,40 s).
- Riesgo de sesgo heredado de COCO 2017: posibles diferencias de rendimiento segun genero, edad, oclusion o condiciones de iluminacion no documentadas en la card.

## Enlaces

- Hugging Face: https://huggingface.co/fastforks/hrnet
- Repositorio fastforks: https://github.com/kleinicke/fastforks
- Kernels backend: https://huggingface.co/fastforks/kernels
- Codigo original mmpose (commit `5408bc76f5b8`): https://github.com/open-mmlab/mmpose
- Evidencia de licencia mmpose: https://github.com/open-mmlab/mmpose/blob/5408bc76f5b848cf925a0d1857899011d8c5b497/README.md#license
- Benchmarks y protocolo: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Pesos `hrnet-w32` 256x192: https://download.openmmlab.com/mmpose/v1/body_2d_keypoint/topdown_heatmap/coco/td-hm_hrnet-w32_8xb64-210e_coco-256x192-81c58e40_20220909.pth
- Pesos `hrnet-w32` 384x288: https://download.openmmlab.com/mmpose/v1/body_2d_keypoint/topdown_heatmap/coco/td-hm_hrnet-w32_8xb64-210e_coco-384x288-ca5956af_20220909.pth
- Pesos `hrnet-w48` 256x192: https://download.openmmlab.com/mmpose/v1/body_2d_keypoint/topdown_heatmap/coco/td-hm_hrnet-w48_8xb32-210e_coco-256x192-0e67c616_20220913.pth
- Pesos `hrnet-w48` 384x288: https://download.openmmlab.com/mmpose/v1/body_2d_keypoint/topdown_heatmap/coco/td-hm_hrnet-w48_8xb32-210e_coco-384x288-c161b7de_20220915.pth
