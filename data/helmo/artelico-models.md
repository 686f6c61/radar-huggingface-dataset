# helmo/artelico-models

## Resumen

`helmo/artelico-models` no es un modelo de lenguaje, sino una coleccion de 210 modelos de vision por computador convertidos para ejecucion en dispositivo. El autor (helmo) parte de las redes del Hailo Model Zoo v5.3.0 (MIT) y las convierte a Core ML (para iPhone, iPad y Mac, con uso del Neural Engine de Apple) y a ONNX para navegador mediante ONNX Runtime Web con WebGPU o WebAssembly. El repositorio ocupa 37,2 GB y actua como repositorio de descarga de las aplicaciones Artelico, que son las que consumen estos pesos.

La propuesta es inferencia local sin servidor: las imagenes no salen del dispositivo. Cubre tareas de deteccion de objetos (YOLOv5 a YOLO26, YOLOX, DAMO-YOLO, NanoDet, SSD, EfficientDet, DETR), clasificacion (ResNet, EfficientNet, MobileNet, ViT, DeiT, Swin, LeViT, FastViT), pose, segmentacion de instancias y semantica, cajas orientadas (DOTA), profundidad (Depth Anything, FastDepth, SC-Depth), caras (SCRFD, ArcFace), carriles, OCR (PaddleOCR), superresolucion, denoising, mejora con poca luz y codificadores CLIP, SigLIP y TinyCLIP.

Es relevante para quien necesite un catalogo homogeneo de redes de vision ya empaquetadas para Core ML y para el navegador, con un mapa de salidas (`native.json`) que permite reutilizar los mismos decodificadores (NMS, anchors, cajas DFL, keypoints, mascaras) en los tres runtimes: Hailo, Core ML y ONNX Runtime Web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coleccion de redes de vision (CNN y transformers): YOLO, SSD, EfficientDet, DETR, ResNet, EfficientNet, MobileNet, ViT, Swin, LeViT, etc. |
| Parametros totales | no disponible (varia por modelo; el repositorio agrupa 210 redes) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelos de vision; entradas de imagen de resolucion fija por red) |
| Tipos de cuantizacion | no disponible de forma explicita; los pesos de los codificadores de texto CLIP/SigLIP se distribuyen en float16 y las proyecciones en float32; los modelos ONNX aceptan entrada uint8 RGB NHWC con normalizacion embebida en el grafo |
| Idiomas soportados | no disponible (los codificadores CLIP/SigLIP son multimodales texto-imagen; el tokenizador de SigLIP2 usa vocabulario SentencePiece de 256k piezas de Gemma) |
| Licencia | per-model (cada red conserva la licencia de su proyecto original; ver seccion de licencias) |
| Formato de pesos | Core ML `.mlpackage` (ML Program), ONNX, `.npy` (tablas de embeddings y proyecciones), `.json` (mapas de salida y tokenizador) |

## Arquitectura y entrenamiento

El repositorio no entrena redes propias: redistribuye y convierte las redes del Hailo Model Zoo v5.3.0. El proceso de conversion se describe en cuatro pasos: se parte del ONNX (o TFLite) original que Hailo compila para sus chips; se corta en los nodos finales que define el compilador de Hailo, de modo que el postprocesado lo hace la aplicacion; se convierte con coremltools a Core ML (ML Program) o se envuelve para el navegador con entrada uint8 NHWC, media y desviacion tipica del zoo, pooling en modo ceil reescrito como padding y constantes plegadas; y se verifica comparando el resultado decodificado sobre imagenes de muestra contra el del stick Hailo.

El fichero `native.json` de cada modelo mapea cada salida al flujo de salida correspondiente del stick Hailo, con su layout y una activacion opcional. Esto permite que un unico conjunto de decodificadores (NMS, anchors, cajas DFL, keypoints, mascaras) sirva tanto para el hardware Hailo como para Core ML y el navegador. La precision es la de las redes originales: la conversion se comprueba contra el stick en imagenes de muestra, no se reevalua sobre los benchmarks completos.

## Capacidades

- Deteccion de objetos con multiples familias: YOLOv5, YOLOv8, YOLO11, YOLO26, YOLOv10, YOLOv12, YOLOX, DAMO-YOLO, NanoDet, SSD, EfficientDet y DETR.
- Clasificacion de imagenes con ResNet, EfficientNet, MobileNet, ViT, DeiT, Swin, LeViT y FastViT.
- Estimacion de pose.
- Segmentacion de instancias y segmentacion semantica, incluida FastSAM.
- Deteccion de cajas orientadas (DOTA).
- Estimacion de profundidad con Depth Anything, FastDepth y SC-Depth.
- Analisis facial: deteccion con SCRFD y reconocimiento/embedding con ArcFace.
- Deteccion de carriles.
- OCR con PaddleOCR.
- Superresolucion, denoising y mejora de imagenes con poca luz.
- Codificadores texto-imagen CLIP, SigLIP, SigLIP2 y TinyCLIP, con tablas de tokens, proyeccion y normalizacion final incluidas.
- Embeddings de texto con all-MiniLM-L6-v2 (Apache-2.0).
- Ejecucion en dispositivo: Core ML con Neural Engine en Apple, ONNX Runtime Web con WebGPU o WebAssembly en navegador.
- No incluye generacion de texto, tool calling ni razonamiento multi-paso: es exclusivamente vision por computador y embeddings.

## Casos de uso

- Deteccion de objetos en apps iOS, iPadOS y macOS: se descargan los `.mlpackage` indicados en `manifest.json`, se verifica su SHA-256, se compila con `MLModel.compileModel` y se decodifican las salidas con los mapas de `native.json`. Adecuado porque el Neural Engine acelera la inferencia y ninguna imagen sale del dispositivo.
- Vision en el navegador sin backend: se carga el `.onnx` con `ort.InferenceSession` usando `webgpu` como proveedor y `wasm` como respaldo, con entrada `Uint8Array` de `H x W x 3`. Util para demos, herramientas de edicion y aplicaciones web que no pueden enviar imagenes a un servidor.
- Procesado por lotes de imagenes en Mac: clasificacion, segmentacion y deteccion con redes ligeras (MobileNet, NanoDet, YOLO pequenos) para organizar fototecas o generar metadatos localmente.
- Busqueda semantica de imagenes: los codificadores CLIP, SigLIP y TinyCLIP permiten calcular embeddings de imagen y de texto y compararlos, habilitando busqueda por descripcion sin servicio externo.
- Reconocimiento facial en aplicaciones de acceso o verificacion: pipeline SCRFD (deteccion) mas ArcFace (embedding), con la salvedad de que ambas redes son solo para investigacion no comercial.
- Digitalizacion de documentos y texto en imagen: PaddleOCR para extraer texto en capturas o fotos dentro de una app movil.
- Realce de imagen en captura: superresolucion, denoising y mejora con poca luz aplicadas antes de guardar o mostrar la foto.
- Estimacion de profundidad para efectos y realidad aumentada: Depth Anything o FastDepth para generar mapas de profundidad en dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la precision es la de las redes originales y que la conversion se verifica contra el stick Hailo en imagenes de muestra, sin reevaluacion sobre los benchmarks completos.

## Requisitos de hardware

- VRAM: no aplica en el sentido habitual; el consumo depende de la red concreta y de la resolucion de entrada, y no se publican cifras por modelo.
- Apple: Core ML con ML Program, con uso del Neural Engine cuando es posible; ejecutable en iPhone, iPad y Mac. La primera carga de un transformer grande en Mac puede tardar minutos mientras macOS lo compila para el Neural Engine; despues queda en cache.
- Navegador: ONNX Runtime Web con WebGPU o WebAssembly; algunos modelos deben ejecutarse obligatoriamente en WebAssembly segun `web/backends.json`.
- GPU dedicadas (A100, H100, RTX 4090): no se documentan requisitos ni rendimiento para estos aceleradores; el objetivo del repositorio es el dispositivo, no el servidor.
- Despliegue: Core ML en plataformas Apple y ONNX Runtime Web en navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a estos modelos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Aspecto | helmo/artelico-models | Hailo Model Zoo v5.3.0 | Modelos originales (Ultralytics YOLO, torchvision, etc.) |
|---|---|---|---|
| Naturaleza | Coleccion convertida y empaquetada | Coleccion de redes de referencia para chips Hailo | Pesos originales de cada proyecto |
| Formatos | Core ML `.mlpackage`, ONNX para navegador | ONNX y TFLite para compilar con el SDK de Hailo | PyTorch, ONNX, TFLite segun proyecto |
| Numero de modelos | 210 | Origen de la coleccion | Variable por proyecto |
| Ejecucion en dispositivo Apple | Si, via Neural Engine | No directamente | Requiere conversion propia |
| Ejecucion en navegador | Si, ONNX Runtime Web | No | Requiere conversion propia |
| Licencia | Per-model, con restricciones por red | MIT (el zoo) | La de cada proyecto |
| Postprocesado | Decodificadores unificados via `native.json` | Decodificadores del zoo | Especifico de cada implementacion |

## Limitaciones y advertencias

- La precision no se reevalua sobre benchmarks completos; solo se comprueba la conversion contra el stick Hailo en imagenes de muestra.
- Algunos detectores aun no tienen mapa `native.json` (ciertas variantes de EfficientDet, NanoDet, SSD, YOLOX y YOLOv5/v7): cargan y ejecutan, pero los decodificadores de las apps no leen sus salidas.
- La primera compilacion de un transformer grande en Mac puede tardar minutos.
- Licencias heterogeneas: las redes GPL-3.0 o AGPL-3.0 (Ultralytics YOLOv5, v8, v11, v26, YOLOv10, v12, FastSAM; YOLOv6, v7, v9; YOLO-World; SC-Depth) solo pueden usarse en software con licencia de codigo abierto compatible; las apps Artelico son AGPL-3.0.
- Los modelos de InsightFace (`arcface_*`, `scrfd_*`) y SegFormer son solo para investigacion no comercial.
- `person_attr_resnet_v1_18` y `stereonet` no tienen licencia publicada: todos los derechos quedan en sus autores y conviene contactar con ellos antes de usarlos mas alla de investigacion.
- No hay informacion sobre sesgos, tasas de alucinacion ni cobertura idiomatica; al ser modelos de vision, los riesgos relevantes son los sesgos propios de los datasets de origen de cada red.
- El repositorio no es un modelo unico: cualquier evaluacion de rendimiento debe hacerse por red concreta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/helmo/artelico-models
- Demo web en Spaces: https://huggingface.co/spaces/helmo/artelico
- Aplicacion web: https://artelico.com
- Codigo fuente (apps, edicion web y herramientas de conversion, AGPL-3.0): https://github.com/heldernoid/artelico
- Hailo Model Zoo v5.3.0 (MIT): https://github.com/hailo-ai/hailo_model_zoo
- Licencias por modelo: https://huggingface.co/helmo/artelico-models/blob/main/README.md
