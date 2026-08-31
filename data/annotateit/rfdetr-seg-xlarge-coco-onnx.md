# AnnotateIt/rfdetr-seg-xlarge-coco-onnx

## Resumen

RF-DETR Seg XLarge es un modelo de segmentación de instancias en tiempo real desarrollado por Roboflow, basado en la arquitectura RF-DETR (un detector tipo DETR con transformer). Esta ficha describe la conversión independiente a ONNX en precisión FP32 realizada por AnnotateIt, pensada para ejecutar el modelo localmente en el navegador mediante ONNX Runtime Web, sin necesidad de servidor. El modelo original tiene 38,1 millones de parámetros y fue entrenado en el dataset COCO con 80 clases de objetos "thing", usando un layout de logits disperso de 91 clases (COCO-91). La conversión está verificada tensor a tensor con el checkpoint original y ofrece métricas prácticamente idénticas a las del modelo PyTorch.

La relevancia de esta conversión radica en que permite desplegar segmentación de instancias de alta calidad en entornos web o edge, con privacidad de datos y sin depender de infraestructura en la nube. El modelo acepta imágenes de 624×624 píxeles y produce cajas delimitadoras, máscaras de segmentación y puntuaciones de clase. Al ser Apache-2.0, puede usarse comercialmente sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR Seg (transformer-based detector con decodificador de consultas) |
| Parametros totales | 38.113.635 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 624×624 píxeles (entrada de imagen fija) |
| Tipos de cuantizacion | FP32 (conversión actual); el modelo base admite FP16 y otras precisiones |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivo `model.onnx`, opset 17) |

## Arquitectura y entrenamiento

RF-DETR Seg XLarge se basa en la arquitectura RF-DETR, un detector de objetos y segmentador de instancias que utiliza un transformer con consultas aprendidas, similar a DETR pero optimizado para tiempo real. El modelo fue entrenado por Roboflow en el dataset COCO (80 clases thing) y publica métricas oficiales de segmentación: mask AP 50:95 de 48,8 y AP50 de 72,2. La conversión a ONNX se realizó con el exportador oficial de RF-DETR (versión 1.9.4), manteniendo todos los tensores aprendidos idénticos al checkpoint original. El postprocesado es específico: no usa NMS, sino una selección global top-K sobre las puntuaciones sigmoideas de 300×91, seguida de umbralizado y binarización de máscaras a logit > 0.0.

El modelo acepta una entrada única de imagen RGB normalizada con media y desviación de ImageNet, redimensionada a 624×624 mediante stretch-resize (sin letterbox). Las salidas incluyen cajas en formato cxcywh normalizado, logits de clase (91 columnas dispersas) y logits de máscara de 156×156 por consulta. La conversión fue validada en COCO val2017 completo, con resultados casi idénticos entre PyTorch y ONNX Runtime en GPU (diferencia de 0,002 puntos de AP).

## Capacidades

- Segmentación de instancias: genera máscaras binarias por objeto detectado.
- Detección de objetos: produce cajas delimitadoras con puntuaciones de confianza.
- Clasificación en 80 clases COCO (persona, coche, animal, mobiliario, etc.).
- Ejecución en navegador: compatible con ONNX Runtime Web (WASM) para inferencia local.
- Ejecución en servidor: soporta CUDA, TensorRT y CPU mediante ONNX Runtime.
- Postprocesado sin NMS, con selección global top-K, lo que simplifica la integración.
- No incluye capacidades de lenguaje, tool calling ni agentes; es exclusivamente visión.

## Casos de uso

- Anotación automática de datasets: el modelo puede pre-etiquetar imágenes con máscaras de segmentación para acelerar la creación de datasets de entrenamiento, reduciendo el trabajo manual de anotación.
- Segmentación en aplicaciones web con privacidad: al ejecutarse en el navegador vía WASM, permite procesar imágenes sin enviarlas a un servidor, ideal para herramientas de edición de fotos o moderación de contenido en el cliente.
- Inspección visual en edge devices: puede desplegarse en dispositivos con GPU integrada o NPU para tareas de control de calidad en entornos industriales, gracias a su tamaño compacto (138 MB en FP32).
- Análisis de imágenes médicas o agrícolas: aunque entrenado en COCO, puede fine-tuning para dominios específicos, pero su uso directo permite detectar objetos genéricos en imágenes de campo.
- Filtrado y moderación de contenido: detección de objetos no deseados (armas, vehículos, etc.) en plataformas de contenido generado por usuarios.
- Integración en pipelines de visión por computador: al ser un modelo ONNX estándar, puede usarse con herramientas como OpenCV, ONNX Runtime o servicios de inferencia como Triton, facilitando su incorporación en sistemas existentes.

## Benchmarks y rendimiento

La información disponible incluye métricas oficiales de Roboflow y resultados de la conversión ONNX evaluada en COCO val2017.

| Metrica | Valor (oficial Roboflow) | Valor (conversión ONNX, RTX 3090) |
|---|---|---|
| COCO mask AP 50:95 | 48,8 | 48,44 |
| COCO mask AP50 | 72,2 | 72,23 |
| bbox AP | no reportado | 56,62 |
| Parametros | 38,1M | 38,1M |
| Latencia (T4, TensorRT FP16) | 13,5 ms | no medido |

La conversión ONNX alcanza una concordancia de 0,002 puntos de AP con el modelo PyTorch original, lo que confirma que no hay pérdida de precisión. No se han publicado comparativas con otros modelos de segmentación en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: el modelo en FP32 ocupa ~138 MB en disco; la inferencia requiere memoria adicional para activaciones y postprocesado. Se ha ejecutado correctamente en una NVIDIA RTX 3090 (24 GB), pero probablemente funcione en GPUs con 4-6 GB de VRAM.
- GPU recomendadas: NVIDIA T4 (latencia oficial de 13,5 ms con TensorRT FP16), RTX 3090 (usada en la validación), o cualquier GPU moderna con soporte CUDA.
- En consumer GPU: sí, cabe en GPUs como RTX 3060, RTX 4060 o superiores, siempre que se use FP16 o cuantización adicional si se requiere menor memoria.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, TensorRT), ONNX Runtime Web (WASM) para navegador, o servicios de inferencia como Triton Inference Server.
- Latencia y throughput: en T4 con TensorRT FP16, 13,5 ms por imagen (oficial). En navegador con WASM (Chromium, un solo hilo), la primera ejecución tarda ~10,7 s y las siguientes ~11 s, lo que lo hace poco práctico para tiempo real en CPU; se recomienda GPU o WASM con threads para mejorar.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. Sin embargo, RF-DETR Seg XLarge se posiciona como un modelo de segmentación de instancias de alta precisión (mask AP 48,8 en COCO) con un tamaño moderado (38,1M parámetros). Alternativas típicas en la misma categoría serían Mask R-CNN (con AP ~37-40 en COCO) o YOLO-seg (AP ~30-40 según variante), pero no se han incluido métricas concretas en la documentación consultada. La ventaja principal de RF-DETR es su arquitectura sin NMS y su facilidad de fine-tuning, según lo reportado por Roboflow.

## Limitaciones y advertencias

- Sesgos: entrenado en COCO, puede reflejar los sesgos de ese dataset (distribución de objetos, contextos occidentales, etc.).
- Falsos positivos: como cualquier modelo de detección, puede producir detecciones erróneas, especialmente en imágenes fuera de distribución.
- Entrada fija: requiere redimensionar la imagen a 624×624 con stretch-resize, lo que distorsiona la relación de aspecto y puede afectar a objetos con formas extremas.
- Clases limitadas: solo 80 clases COCO; no reconoce objetos fuera de ese conjunto sin fine-tuning.
- Postprocesado específico: el contrato de salida es poco intuitivo (los nombres `labels` y `dets` están intercambiados) y requiere implementar la selección top-K global y la binarización de máscaras exactamente como se describe; un error en este paso degrada los resultados.
- Rendimiento en navegador: la inferencia WASM en CPU es lenta (~11 s por imagen en Chromium), no apta para tiempo real sin aceleración por hardware.
- Licencia: Apache-2.0 permite uso comercial, pero la conversión es independiente y no está afiliada a Roboflow; se debe mantener el aviso de atribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnnotateIt/rfdetr-seg-xlarge-coco-onnx
- Repositorio oficial de RF-DETR: https://github.com/roboflow/rf-detr
- Documentación de RF-DETR Seg XLarge: https://rfdetr.roboflow.com/latest/reference/seg_xlarge/
- Modelo base original: https://huggingface.co/Roboflow/rf-detr-seg-xlarge
