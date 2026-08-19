# hugging-mac/yolov8-coreml

## Resumen

El repositorio `hugging-mac/yolov8-coreml` publica conversiones listas para usar del modelo YOLOv8 de Ultralytics al formato Core ML, orientadas a la detección de objetos en dispositivos Apple Silicon (macOS, iOS, iPadOS). El autor es Hugging Mac, un proyecto open source que desarrolla una plataforma para construir y ejecutar aplicaciones locales de IA en macOS. Se proporcionan tres variantes del modelo —`n`, `s` y `m`— en formato `.mlpackage`, con precisión FP16 y entrada fija de 640 × 640 píxeles.

La relevancia de este modelo radica en que elimina el trabajo de conversión manual desde PyTorch a Core ML, ofreciendo paquetes verificados con hashes SHA-256. Está pensado para desarrolladores que quieren integrar detección de objetos en apps nativas de Apple sin depender de servicios en la nube. El modelo original es YOLOv8, una familia de redes neuronales convolucionales de una sola pasada (single-stage) publicada por Ultralytics en enero de 2023, con soporte para múltiples tareas de visión por computador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8 (CNN de una sola etapa, variantes n, s y m) |
| Parametros totales | 3,2 M (n), 11,2 M (s), 25,9 M (m) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija de 640 × 640) |
| Tipos de cuantizacion | FP16 (conversion directa, sin cuantizacion adicional) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | AGPL-3.0 (hereda de Ultralytics YOLOv8) |
| Formato de pesos | .mlpackage (Core ML, via coremltools) |

## Arquitectura y entrenamiento

YOLOv8 es una red neuronal convolucional de deteccion de objetos de una sola etapa, desarrollada por Ultralytics. Su arquitectura incluye un backbone basado en CSPDarknet, un neck con PAN-FPN y una cabeza de deteccion anclada (anchor-free). El modelo original fue entrenado en el dataset COCO con 80 clases. La conversion a Core ML se realizo con la libreria coremltools, manteniendo la precision FP16 y un tamaño de entrada fijo de 640 × 640 píxeles con batch size 1. No se incluye NMS (supresion de no maximos) dentro del modelo; el usuario debe aplicar filtrado por confianza y NMS despues de la inferencia.

La model card indica que la conversion proviene de la revision `8a9e1a5` del repositorio `Ultralytics/YOLOv8` en HuggingFace. No se proporcionan detalles sobre el proceso de entrenamiento del modelo original, ya que este repositorio solo contiene la conversion a Core ML.

## Capacidades

- Deteccion de objetos en 80 clases del dataset COCO (personas, vehiculos, animales, objetos cotidianos, etc.).
- Inferencia en CPU, GPU y Apple Neural Engine (ANE) gracias al formato Core ML con `compute_units=ALL`.
- Salida de cajas delimitadoras en formato `x, y, width, height` y puntuaciones de clase para cada una de las 8400 propuestas (para entrada 640 × 640).
- Tres variantes con distinta relacion velocidad/precision: `yolov8n` (mas rapida y ligera), `yolov8s` (equilibrada) y `yolov8m` (mayor precision).
- Compatibilidad con macOS, iOS, iPadOS y cualquier plataforma que soporte Core ML.
- No incluye capacidades de texto, vision multimodal ni tool calling; es exclusivamente un detector de objetos.

## Casos de uso

- Deteccion de objetos en tiempo real en aplicaciones macOS: un desarrollador puede integrar `yolov8n.mlpackage` en una app de escritorio para analizar video de la camara o archivos locales, aprovechando la aceleracion por ANE para lograr baja latencia.
- Moderation automatica de contenido visual: el modelo puede identificar objetos prohibidos (armas, drogas, etc.) en imagenes subidas por usuarios, ejecutandose localmente en el dispositivo para preservar la privacidad.
- Conteo de personas o vehiculos en imagenes estaticas: usando la variante `yolov8m` para mayor precision, se pueden procesar fotografias de espacios publicos o almacenes y generar estadisticas de afluencia.
- Asistencia visual para personas con discapacidad: una app iOS puede usar el modelo para describir el entorno (por ejemplo, "hay una silla y una mesa") mediante la deteccion de objetos, funcionando sin conexion.
- Automatizacion de inventario en retail: analisis de estanterias a partir de fotos para detectar productos (dentro de las 80 clases COCO) y actualizar niveles de stock, con procesamiento local en un iPad.
- Prototipado rapido de sistemas de vigilancia: un desarrollador puede usar los `.mlpackage` junto con el SDK de Hugging Mac para construir un sistema de alerta que detecte intrusiones (personas, animales) en tiempo real sobre video de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como mAP, latencia o throughput. Los unicos datos numericos son el tamaño de los paquetes (6,5 MB, 22,5 MB y 52,0 MB) y el numero de parametros. Para obtener metricas de rendimiento, se recomienda consultar los benchmarks oficiales de Ultralytics YOLOv8 o realizar pruebas propias en hardware Apple Silicon.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon (M1, M2, M3 o posteriores) o dispositivos iOS/iPadOS con Neural Engine.
- Memoria: los paquetes ocupan entre 6,5 MB y 52,0 MB en disco; la memoria RAM necesaria en tiempo de ejecucion es baja, estimada en menos de 1 GB para la variante `n` y alrededor de 2 GB para la `m`, aunque no se proporcionan cifras oficiales.
- No requiere GPU dedicada externa; utiliza la GPU integrada y el ANE de Apple.
- Compatible con Core ML, por lo que se puede desplegar en macOS, iOS, iPadOS y visionOS.
- Para inferencia, se recomienda usar `coremltools` para cargar el modelo y ejecutarlo con `ComputeUnit.ALL` (CPU + GPU + ANE).
- No es compatible con CUDA ni con GPUs de NVIDIA; el despliegue en servidores Linux no es posible sin una conversion adicional a otro formato (por ejemplo, ONNX).
- Latencia y throughput no disponibles en la informacion proporcionada; dependen del dispositivo y de la variante elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hugging-mac/yolov8-coreml` (n, s, m) | 3,2 M / 11,2 M / 25,9 M | Core ML (.mlpackage) | 640 × 640 | AGPL-3.0 | HuggingFace |
| `TheCluster/YOLOv8-CoreML` | no disponible | Core ML | no disponible | no disponible | HuggingFace |
| `Ultralytics/YOLOv8` (original) | 3,2 M / 11,2 M / 25,9 M | PyTorch, ONNX, TensorRT, etc. | variable | AGPL-3.0 | HuggingFace, GitHub |

No se dispone de datos de rendimiento comparativo entre estas conversiones. La ventaja principal de `hugging-mac/yolov8-coreml` es que incluye hashes SHA-256 de integridad y una documentacion clara de entrada/salida, ademas de estar integrado con el SDK de Hugging Mac. La alternativa `TheCluster/YOLOv8-CoreML` existe pero no se ha podido verificar su contenido ni sus especificaciones.

## Limitaciones y advertencias

- La licencia AGPL-3.0 impone restricciones para uso comercial o de codigo cerrado. Es necesario revisar los terminos de Ultralytics antes de desplegar el modelo en produccion.
- El modelo no incluye NMS integrado. El desarrollador debe implementar el postprocesado (filtrado por confianza y NMS) manualmente, lo que anade complejidad y puede introducir errores si no se hace correctamente.
- La entrada es fija a 640 × 640 píxeles y batch size 1. No se soportan tamanos de imagen dinamicos ni inferencia por lotes sin modificar el modelo.
- Solo cubre 80 clases de COCO. No es adecuado para detectar objetos fuera de ese conjunto sin reentrenamiento.
- No se proporcionan datos sobre sesgos del modelo original. YOLOv8 puede tener sesgos en clases poco representadas en COCO (por ejemplo, ciertos tipos de objetos o condiciones de iluminacion).
- El repositorio no incluye el proceso de entrenamiento ni los datos utilizados; solo la conversion. No se puede auditar la calidad del entrenamiento original desde este repositorio.
- Al ser una conversion FP16, puede haber una ligera perdida de precision respecto al modelo original en FP32, aunque no se cuantifica en la documentacion.
- No hay soporte para vision por computador en tiempo real con video de alta resolucion sin reducir la resolucion de entrada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/hugging-mac/yolov8-coreml
- Repositorio Hugging Mac (plataforma): https://github.com/devilyouwei/hugging-mac
- SDK YOLOv8 de Hugging Mac (postprocesado y NMS): https://github.com/devilyouwei/hugging-mac/tree/main/packages/hugging_mac_sdk/src/hugging_mac_sdk/models/yolov8
- Modelo base Ultralytics/YOLOv8 en HuggingFace: https://huggingface.co/Ultralytics/YOLOv8
- Ejemplo de deteccion de objetos con Core ML (repositorio de referencia): https://github.com/rballachay/YOLOv8-CoreML
- Proyecto ObjectDetection-CoreML (soporta YOLOv8, YOLOv5, etc.): https://github.com/tucan9389/ObjectDetection-CoreML
