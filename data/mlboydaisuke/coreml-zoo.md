# mlboydaisuke/coreml-zoo

## Resumen

`mlboydaisuke/coreml-zoo` no es un modelo individual, sino un repositorio agregador («model zoo») de 31 modelos PyTorch convertidos al formato Core ML (`.mlpackage`) para inferencia en dispositivo (on-device) en iPhone, iPad y Mac. Lo mantiene el usuario mlboydaisuke y su funcion es servir de almacen de respaldo para la aplicacion Models Zoo de la App Store, que descarga y ejecuta cualquiera de estos modelos sin escribir codigo. El repositorio ocupa 9,0 GB (6,96 GB de paquetes `.mlpackage` comprimidos) y cubre tareas muy diversas: deteccion de objetos, segmentacion, estimacion de profundidad, matting, difusion texto-a-imagen, sintesis de voz (TTS) y separacion de fuentes, entre otras.

Cada modelo procede de un proyecto upstream distinto (Ultralytics, ByteDance, Microsoft, Bria, Google, AMD, entre otros) y conserva su propia licencia, de ahi la licencia agregada `mixed-per-model`. El repositorio incluye un manifiesto `models.json` que actua como catalogo legible por maquina para la app, y cada entrada enlaza a un repositorio individual con model card, imagen de demostracion y el `.mlpackage` sin comprimir. Para la mayoria de modelos existe tambien un script de conversion legible y una aplicacion de ejemplo SwiftUI en el repositorio `john-rocky/CoreML-Models`.

La relevancia actual del repositorio radica en que concentra en un solo punto de descarga un conjunto heterogeneo de modelos optimizados para el stack de Apple (Core ML, Neural Engine, GPU y CPU unificados), lo que simplifica el despliegue de vision por computador y generacion en aplicaciones iOS/macOS sin dependencia de servicios en nube. No es un modelo de lenguaje ni un modelo entrenado por el autor: es un catalogo de conversiones y artefactos de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (agregado de 31 modelos heterogeneos: CNN, ViT, transformers, modelos de difusion) |
| Parametros totales | no disponible (no se publica el recuento por modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje en el sentido habitual; Florence-2 procesa imagen + texto) |
| Tipos de cuantizacion | no disponible (se distribuyen `.mlpackage` ya convertidos; no se detallan precisiones por modelo) |
| Idiomas soportados | no disponible (predominantemente tareas visuales y de audio; Florence-2 y SigLIP admiten texto en ingles segun sus modelos upstream) |
| Licencia | mixta por modelo (`mixed-per-model`), detallada en https://huggingface.co/mlboydaisuke/coreml-zoo#licenses |
| Formato de pesos | Core ML `.mlpackage` (comprimidos en `.zip` dentro del repo) |
| Tamano del repositorio | 9,0 GB (6,96 GB de paquetes) |
| Libreria | coreml (`coremltools`) |
| Numero de modelos | 31 |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

Este repositorio no entrena ningun modelo: es un conjunto de conversiones de modelos PyTorch de terceros a Core ML mediante `coremltools`. Las arquitecturas subyacentes son heterogeneas y abarcan detectores tipo YOLO (YOLO11s, YOLO26s, YOLOv10n, YOLO-World V2-S, RF-DETR Nano), segmentadores (MobileSAM, RMBG-1.4, Face Parsing), estimadores de profundidad basados en ViT (Depth Anything 3 Base/Small a 504×504, MoGe-2 ViT-B), modelos de restauracion y superresolucion (Real-ESRGAN 4x, SinSR, DDColor Tiny, Pixelization), clasificacion y alineacion vision-lenguaje (SigLIP base patch16-224, Florence-2 base), deteccion de keypoints faciales (3DDFA V2) y modelos generativos de difusion (Hyper-SD 1-step, Nitro-E 4-step).

La innovacion tecnica no esta en el entrenamiento sino en la conversion y optimizacion para el runtime de Apple: empaquetado `.mlpackage`, uso del Neural Engine y de la GPU/CPU unificada en silicio Apple, y en algunos casos destilacion de pasos de difusion (Hyper-SD a 1 paso, Nitro-E a 4 pasos) para reducir la latencia de generacion en dispositivo. No se documentan en la informacion disponible volumenes de tokens, composicion de datasets ni procesos de RLHF/DPO, ya que cada modelo upstream tiene su propio regimen de entrenamiento descrito en su model card original.

## Capacidades

- Deteccion de objetos en imagen: YOLO11s, YOLO26s, YOLOv10n y RF-DETR Nano (modelos de 4 a 95 MB).
- Deteccion de objetos zero-shot guiada por texto: YOLO-World V2-S (134 MB, 2 paquetes).
- Segmentacion de imagen y generacion de mascaras: MobileSAM (19 MB), RMBG-1.4 (37 MB, eliminacion de fondo), Face Parsing (47 MB, segmentacion facial).
- Estimacion de profundidad monococular: Depth Anything 3 Base (173 MB) y Small (44 MB), MoGe-2 ViT-B (184 MB), todos a 504×504.
- Restauracion y realce de imagen: Real-ESRGAN 4x (59 MB), SinSR (517 MB, 3 paquetes), DDColor Tiny (203 MB, colorizacion), Pixelization (35 MB).
- Generacion texto-a-imagen en dispositivo: Hyper-SD 1-step (905 MB, 4 paquetes) y Nitro-E 4-step (987 MB, 3 paquetes).
- Vision-lenguaje: Florence-2 base (229 MB, 3 paquetes) para tareas image-text-to-text; SigLIP base (358 MB) para clasificacion zero-shot de imagenes.
- Deteccion de keypoints faciales 3D: 3DDFA V2 (6 MB).
- Sintesis de voz (TTS) y separacion de fuentes: mencionadas en la descripcion del repositorio, sin detalle de modelo concreto en la informacion disponible.
- Ejecucion on-device sin nube: todos los modelos se ejecutan localmente en iPhone, iPad y Mac mediante Core ML.

## Casos de uso

- Eliminacion de fondo en aplicaciones de fotografia: RMBG-1.4 (37 MB) permite recortar sujetos y generar mascaras alfa en dispositivo, sin subir imagenes a un servidor, lo que reduce latencia y protege la privacidad del usuario.
- Escaneo y conteo de objetos en apps moviles: YOLOv10n (4 MB) o YOLO11s (17 MB) se integran en flujos de camara en tiempo real para inventario, control de calidad o accesibilidad, con modelos lo bastante pequenos para caber holgadamente en el Neural Engine.
- Deteccion guiada por lenguaje natural: YOLO-World V2-S (134 MB) permite consultar «busca todas las bicicletas» sobre una imagen sin reentrenamiento, util en apps de busqueda visual o catalogacion semiautomatica.
- Realce y restauracion de fotos antiguas: Real-ESRGAN 4x (59 MB) y SinSR (517 MB) escalan y restauran imagenes localmente en apps de edicion, evitando cuotas de API y funcionando sin conexion.
- Estimacion de profundidad para efectos y RA: Depth Anything 3 Small (44 MB) o MoGe-2 (184 MB) generan mapas de profundidad a 504×504 para desenfoque de retrato, parallax o colocacion de objetos 3D en escenas capturadas con la camara.
- Colorizacion automatica de material historico: DDColor Tiny (203 MB) convierte imagenes en blanco y negro a color en dispositivo, adecuado para apps de archivo y patrimonio que no pueden enviar material sensible a la nube.
- Generacion de imagenes on-device: Hyper-SD 1-step (905 MB) y Nitro-E 4-step (987 MB) permiten sintesis texto-a-imagen con pocos pasos de difusion, apropiada para apps creativas con requisitos estrictos de privacidad y latencia.
- Descripcion y etiquetado de imagenes: Florence-2 base (229 MB) y SigLIP base (358 MB) habilitan captioning, respuesta visual a preguntas y clasificacion zero-shot directamente en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de metricas (mAP, PSNR, latencia o throughput) por modelo; cada model card individual upstream puede contener sus propias cifras, pero no se recogen en la informacion proporcionada.

## Requisitos de hardware

- VRAM: no aplica en el sentido tradicional; los modelos se ejecutan sobre memoria unificada en silicio Apple (Neural Engine, GPU y CPU). El repositorio no publica requisitos de memoria por modelo.
- Tamano orientativo por modelo (segun los paquetes listados): desde 4 MB (YOLOv10n) y 6 MB (3DDFA V2) hasta 905 MB (Hyper-SD) y 987 MB (Nitro-E); el conjunto completo suma 6,96 GB de paquetes.
- Cabe en dispositivos consumer: si, en iPhone, iPad y Mac compatibles con Core ML; los modelos pequenos (4-60 MB) encajan en cualquier dispositivo moderno, mientras que los de difusion (~1 GB) exigen dispositivos con memoria suficiente, no cuantificada en la informacion disponible.
- GPU dedicadas (A100, H100, RTX 4090): no aplica; el destino es el hardware Apple, no CUDA.
- Opciones de despliegue: Core ML (`coremltools`) como runtime nativo; integracion en apps mediante SwiftUI (ejemplos en `john-rocky/CoreML-Models`) y la app Models Zoo de la App Store.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Aspecto | coreml-zoo (este repo) | john-rocky/CoreML-Models | Apple Core ML Tools (oficial) |
|---|---|---|---|
| Naturaleza | Agregado de 31 modelos convertidos | Repositorio de apps y scripts de ejemplo | Herramienta de conversion y utilidades |
| Formato | `.mlpackage` comprimido | Proyectos SwiftUI de ejemplo | Conversion PyTorch a Core ML |
| Cobertura de tareas | Deteccion, segmentacion, profundidad, difusion, TTS, separacion de fuentes | Ejemplos de integracion por modelo | No distribuye modelos finales |
| Licencia | Mixta por modelo | No disponible | Licencia de Apple |
| Disponibilidad | Hugging Face + app Models Zoo | GitHub | Apple Developer |

No se dispone en la informacion proporcionada de cifras comparativas de rendimiento frente a alternativas equivalentes, por lo que la comparacion se limita a naturaleza, formato y licencia.

## Limitaciones y advertencias

- Licencia mixta: cada modelo conserva su licencia upstream (MIT, Apache-2.0, BSD-3-Clause, GPL-3.0, AGPL-3.0, CC BY-NC-SA 4.0, OpenRAIL-M, Bria RMBG-1.4 License, «research use only»). Es imprescindible revisar la licencia concreta antes de uso comercial; YOLO-World, YOLO11s, YOLO26s y YOLOv10n son GPL-3.0/AGPL-3.0 y Pixelization es solo para investigacion.
- Restriccion de plataforma: los `.mlpackage` estan pensados para el runtime Core ML de Apple; no se ejecutan directamente en CUDA, ROCm ni en servidores Linux convencionales sin conversion adicional.
- No es un modelo de lenguaje: no debe evaluarse como LLM ni usarse para generacion de texto general, razonamiento o codigo.
- Sesgos: no documentados en la informacion disponible; heredan los sesgos de sus datasets upstream (por ejemplo, reconocimiento facial y segmentacion de caras pueden degradar en determinados demograficos).
- Riesgo de alucinacion: aplicable a Florence-2 y SigLIP en tareas vision-lenguaje (descripciones o etiquetas incorrectas), y a los modelos generativos de difusion (artefactos o contenido no fiel a la instruccion).
- Idiomas: no se declaran idiomas soportados; las capacidades de texto (Florence-2, SigLIP) se limitan a lo que ofrecen sus modelos upstream, tipicamente ingles.
- Rendimiento en dispositivo: no se publican latencias ni requisitos de memoria por modelo; el rendimiento dependera del chip Apple concreto y del uso del Neural Engine.
- `models.json` es un manifiesto gestionado por la app; modificarlo manualmente puede romper la integracion.
- Modelos de difusion (~1 GB) pueden no caber en dispositivos con poca memoria; verificar antes de integrarlos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mlboydaisuke/coreml-zoo
- Licencias por modelo: https://huggingface.co/mlboydaisuke/coreml-zoo#licenses
- Apps y scripts de ejemplo CoreML-Models: https://github.com/john-rocky/CoreML-Models
- App Models Zoo (App Store): https://apps.apple.com/app/id6762083207
- Modelos individuales (seleccion):
  - https://huggingface.co/mlboydaisuke/Face-Parsing-CoreML
  - https://huggingface.co/mlboydaisuke/MobileSAM-CoreML
  - https://huggingface.co/mlboydaisuke/RMBG-1.4-CoreML
  - https://huggingface.co/mlboydaisuke/DDColor-Tiny-CoreML
  - https://huggingface.co/mlboydaisuke/Pixelization-CoreML
  - https://huggingface.co/mlboydaisuke/Real-ESRGAN-x4-CoreML
  - https://huggingface.co/mlboydaisuke/SinSR-CoreML
  - https://huggingface.co/mlboydaisuke/RF-DETR-Nano-CoreML
  - https://huggingface.co/mlboydaisuke/YOLO-World-V2-S-CoreML
  - https://huggingface.co/mlboydaisuke/YOLO11s-CoreML
  - https://huggingface.co/mlboydaisuke/YOLO26s-CoreML
  - https://huggingface.co/mlboydaisuke/YOLOv10n-CoreML
  - https://huggingface.co/mlboydaisuke/Depth-Anything-3-Base-CoreML
  - https://huggingface.co/mlboydaisuke/Depth-Anything-3-Small-CoreML
  - https://huggingface.co/mlboydaisuke/MoGe-2-ViT-B-CoreML
  - https://huggingface.co/mlboydaisuke/Florence-2-base-CoreML
  - https://huggingface.co/mlboydaisuke/SigLIP-base-patch16-224-CoreML
  - https://huggingface.co/mlboydaisuke/3DDFA-V2-CoreML
  - https://huggingface.co/mlboydaisuke/Hyper-SD-1step-CoreML
  - https://huggingface.co/mlboydaisuke/Nitro-E-CoreML
- Upstreams citados: https://github.com/ultralytics/ultralytics, https://github.com/THU-MIG/yolov10, https://github.com/AILab-CVC/YOLO-World, https://github.com/roboflow/rf-detr, https://github.com/ByteDance-Seed/Depth-Anything-3, https://github.com/microsoft/MoGe, https://huggingface.co/microsoft/Florence-2-base, https://github.com/google-research/big_vision, https://github.com/ChaoningZhang/MobileSAM, https://huggingface.co/briaai/RMBG-1.4, https://github.com/xinntao/Real-ESRGAN, https://github.com/wyf0912/SinSR, https://github.com/piddnad/DDColor, https://github.com/WuZongWei6/Pixelization, https://github.com/cleardusk/3DDFA_V2, https://github.com/zllrunning/face-parsing.PyTorch, https://huggingface.co/ByteDance/Hyper-SD, https://huggingface.co/amd/Nitro-E
