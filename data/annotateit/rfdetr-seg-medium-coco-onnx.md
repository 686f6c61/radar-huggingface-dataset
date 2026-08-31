# AnnotateIt/rfdetr-seg-medium-coco-onnx

## Resumen

RF-DETR Seg Medium es un modelo de segmentación de instancias en tiempo real desarrollado por Roboflow, basado en una arquitectura DETR con backbone DINOv2. Este repositorio concreto contiene una conversión independiente y no oficial a ONNX en precisión FP32, realizada por AnnotateIt para su herramienta de anotación automática en navegador. El modelo original fue entrenado sobre COCO y alcanza una precisión de máscara AP 50:95 de 45.3 según las métricas oficiales de Roboflow.

La conversión se ha realizado con el exportador oficial de RF-DETR (versión 1.9.4) y se ha verificado que todos los tensores aprendidos son idénticos al checkpoint original. El grafo ONNX tiene 35.694.259 parámetros, entrada fija de 432×432 píxeles y salida de hasta 200 detecciones con cajas, clases y máscaras. Su relevancia radica en que permite ejecutar segmentación de instancias de alta calidad directamente en el navegador mediante ONNX Runtime Web, sin necesidad de servidores ni GPU dedicadas, lo que facilita el etiquetado local de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR (DETR con backbone DINOv2) |
| Parametros totales | 35.694.259 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen 432×432) |
| Tipos de cuantizacion | FP32 (unico formato publicado) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17, fixed batch 1) |

## Arquitectura y entrenamiento

El modelo base es RF-DETR Seg Medium, una arquitectura de detección y segmentación de instancias basada en el transformer DETR, con un backbone DINOv2 preentrenado. El checkpoint original fue entrenado por Roboflow sobre el conjunto de datos COCO, cubriendo 80 clases de cosas (thing classes) en un layout de logits disperso COCO-91. No se dispone de detalles sobre el número de tokens de entrenamiento ni sobre el uso de RLHF o DPO, ya que es un modelo de visión puro.

La conversión a ONNX se realizó con el exportador oficial de RF-DETR, fijando la versión 1.9.4 del repositorio upstream. El grafo resultante tiene entrada fija de 432×432 píxeles, batch 1, y salidas que incluyen cajas normalizadas (cxcywh), logits de clase (91 columnas dispersas) y logits de máscara a resolución 108×108. El preprocesamiento requerido es un resize por estiramiento a 432×432 con interpolación bilineal, normalización con media y desviación de ImageNet, y sin letterbox ni padding. El postprocesamiento sigue la semántica oficial de `PostProcess`: sigmoide sobre los logits, selección global top-K, umbral de confianza estricto a 0.5, y binarización de máscaras con logit > 0. No se aplica NMS.

## Capacidades

- Segmentación de instancias: genera máscaras binarias por objeto detectado, con hasta 200 propuestas por imagen.
- Detección de objetos: produce cajas delimitadoras en formato cxcywh normalizado, junto con puntuaciones de confianza por clase.
- Reconocimiento de 80 clases COCO: persona, vehículos, animales, objetos cotidianos, etc., con IDs nativos del layout COCO-91 (no compactados).
- Inferencia en navegador: el formato ONNX y la validación con onnxruntime-web permiten ejecución local en Chromium mediante WASM.
- Sin dependencia de servidor: al ser un modelo de vision autocontenido, no requiere servicios externos para la inferencia.
- Reproducibilidad: el repositorio incluye scripts de exportación y verificación que garantizan la reproducibilidad byte a byte del grafo ONNX.

## Casos de uso

- Anotación automática en navegador: AnnotateIt lo utiliza para preetiquetar imágenes localmente en el cliente, reduciendo el tiempo de anotación manual en flujos de trabajo de visión por computador.
- Etiquetado de datos para fine-tuning: los usuarios pueden generar máscaras preliminares sobre sus propios datasets y luego corregirlas, acelerando la preparación de datos de entrenamiento.
- Segmentación en tiempo real en aplicaciones web: al ejecutarse con ONNX Runtime Web, puede integrarse en herramientas de edición de imágenes o vídeo que requieran separar objetos del fondo sin enviar datos a un servidor.
- Prototipado rápido de pipelines de visión: los desarrolladores pueden probar la segmentación de instancias en local con Python o JavaScript usando el mismo grafo ONNX, sin necesidad de instalar PyTorch.
- Automatización de inventario visual: en entornos industriales o de retail, el modelo puede identificar y segmentar productos en fotografías, siempre que las clases coincidan con las 80 de COCO.
- Verificación de calidad en manufactura: aunque no está fine-tuneado para dominios específicos, puede servir como baseline para detectar objetos genéricos en imágenes de control de calidad antes de entrenar un modelo especializado.

## Benchmarks y rendimiento

La model card reporta métricas oficiales de Roboflow para el checkpoint original, así como mediciones propias de la conversión ONNX. Los resultados de la conversión se obtuvieron sobre COCO val2017 completo (5000 imágenes) con inferencia en NVIDIA RTX 3090, FP32, y postprocesado oficial en CUDA.

| Metrica | Valor (oficial Roboflow) | Valor (PyTorch, medicion propia) | Valor (ONNX Runtime, medicion propia) |
|---|---|---|---|
| COCO mask AP 50:95 | 45.3 | 44.99 | 44.95 |
| COCO mask AP50 | 68.4 | 68.65 | 68.60 |
| bbox AP | no disponible | 53.42 | 53.37 |
| Latencia (T4, TensorRT FP16) | 5.9 ms | no disponible | no disponible |

La concordancia entre PyTorch y ONNX es de 0.044 puntos de AP en segmentación. Las métricas propias usan un protocolo de evaluación distinto al oficial (fijan `num_select=200` y el preprocesado de despliegue), por lo que no son directamente comparables con el valor de 45.3. En navegador (Chromium, WASM, un solo hilo), la sesión tarda 1623 ms en inicializarse y la primera inferencia 5028 ms, con una mediana en caliente de 5001 ms.

## Requisitos de hardware

- Tamaño del grafo ONNX: 130 MB (FP32), por lo que cabe en memoria de cualquier GPU moderna y también en CPU.
- VRAM estimada para inferencia: aproximadamente 300-500 MB en FP32 para batch 1, dependiendo del runtime y del postprocesado.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM (GTX 1650, RTX 2060, etc.) para inferencia en tiempo real; en CPU puede ejecutarse pero con latencias mayores.
- Compatibilidad con GPU de consumo: sí, funciona en RTX 3090 (usada en las validaciones) y en GPUs más modestas.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, TensorRT), onnxruntime-web (WASM) para navegador, y cualquier framework que soporte ONNX (por ejemplo, Hugging Face Optimum).
- Latencia estimada: 5.9 ms en T4 con TensorRT FP16 (dato oficial de Roboflow para el checkpoint original); en navegador WASM la latencia es de unos 5 segundos por imagen en un solo hilo, según las pruebas de AnnotateIt.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | COCO mask AP 50:95 | Licencia | Formato |
|---|---|---|---|---|---|
| RF-DETR Seg Medium (ONNX, este repo) | 35.7M | 432×432 | 45.3 (oficial) | Apache-2.0 | ONNX FP32 |
| RF-DETR Seg Nano (ONNX, AnnotateIt) | no disponible | no disponible | no disponible | Apache-2.0 | ONNX FP32 |
| YOLOv8x-seg (ultralytics) | 71M | 640×640 | ~39 (aprox.) | AGPL-3.0 | PyTorch/ONNX |

La comparativa con YOLOv8x-seg es orientativa y basada en datos públicos generales; no se dispone de una evaluación directa en las mismas condiciones. El modelo nano de AnnotateIt existe pero no se han publicado sus métricas en la información disponible. RF-DETR está aceptado en ICLR 2026 y reporta ser SOTA en COCO para su tamaño, superando a YOLOv11 en precisión-latencia según Roboflow.

## Limitaciones y advertencias

- Solo reconoce las 80 clases de COCO; no es adecuado para dominios específicos sin fine-tuning.
- La entrada está fijada a 432×432 con estiramiento, lo que distorsiona la relación de aspecto y puede afectar a objetos muy alargados.
- El postprocesado no aplica NMS, por lo que un mismo objeto puede generar múltiples detecciones solapadas si supera el umbral de confianza.
- Los IDs de clase son nativos COCO-91 (con huecos), no compactados a COCO-80; un manejo incorrecto puede producir errores de etiquetado.
- La conversión es independiente y no está respaldada por Roboflow; aunque se verificó la igualdad de tensores, no hay garantía de soporte oficial.
- La latencia en navegador (WASM) es alta (alrededor de 5 segundos por imagen en un solo hilo), lo que limita su uso en aplicaciones interactivas en tiempo real sin optimizaciones adicionales.
- No se han publicado resultados de sesgos o alucinaciones específicos para este modelo; como todo modelo de vision, puede fallar en condiciones de iluminación, oclusión o clases poco representadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AnnotateIt/rfdetr-seg-medium-coco-onnx
- Repositorio GitHub de RF-DETR: https://github.com/roboflow/rf-detr
- Sitio oficial de RF-DETR: https://rfdetr.roboflow.com/latest/
- Checkpoint original: https://huggingface.co/Roboflow/rf-detr-seg-medium
- Conversión nano (AnnotateIt): https://huggingface.co/AnnotateIt/rfdetr-seg-nano-coco-onnx
- Notebook de fine-tuning de RF-DETR: https://colab.research.google.com/github/roboflow-ai/notebooks/blob/main/notebooks/how-to-finetune-rf-detr-on-segmentation-dataset.ipynb
