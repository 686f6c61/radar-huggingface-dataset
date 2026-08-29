# AnnotateIt/rfdetr-seg-nano-coco-onnx

## Resumen

RF-DETR Seg Nano es un modelo de segmentación de instancias en tiempo real desarrollado por Roboflow, basado en la arquitectura RF-DETR (un transformer detector con consultas). Esta ficha describe la conversión independiente a ONNX en precisión FP32 realizada por AnnotateIt, pensada para ejecución local en navegador mediante ONNX Runtime Web. El modelo original, `Roboflow/rf-detr-seg-nano`, está preentrenado en el conjunto de datos COCO con 80 clases de objetos y alcanza una precisión media de máscara (AP 50:95) de 40.3 según las métricas oficiales de Roboflow.

La conversión mantiene la misma arquitectura y pesos que el checkpoint original, exportada con el exportador oficial de `rfdetr` (versión 1.9.4). El modelo tiene 33,6 millones de parámetros y acepta imágenes de 312×312 píxeles. Su relevancia radica en que permite realizar anotación automática de segmentación directamente en el navegador, sin necesidad de servidores ni GPU dedicadas, lo que facilita flujos de trabajo de etiquetado de datos para equipos que trabajan con datos sensibles o en entornos sin conexión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR (transformer encoder-decoder con consultas) |
| Parametros totales | 33.577.475 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 312×312 píxeles (entrada de imagen) |
| Tipos de cuantizacion | FP32 (solo esta disponible esta precision) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivo `model.onnx`, 122,8 MB) |

## Arquitectura y entrenamiento

RF-DETR es una arquitectura de detección y segmentación basada en transformer, diseñada para operar en tiempo real. A diferencia de los detectores basados en anclas o propuestas, RF-DETR utiliza un conjunto de consultas aprendidas que se decodifican en cajas delimitadoras y máscaras de segmentación. El modelo base fue entrenado en el conjunto de datos COCO (80 clases de cosas) y reporta una AP de máscara de 40.3 en la validación oficial. La conversión a ONNX se realizó con el exportador oficial de `rfdetr`, manteniendo la topología exacta y los pesos originales. No se aplicó ningún reentrenamiento ni ajuste fino; la conversión es puramente de formato.

El modelo produce tres salidas: cajas (coordenadas cxcywh normalizadas), logits de clase (en un layout disperso de 91 clases COCO, donde el índice 0 es fondo y hay 10 huecos N/A) y logits de máscara por consulta. El postprocesamiento requiere sigmoide sobre los logits, selección top-K global, umbralizado y binarización de máscaras con logit > 0. No se aplica supresión no máxima (NMS).

## Capacidades

- Segmentación de instancias: genera máscaras binarias por objeto detectado.
- Detección de objetos: produce cajas delimitadoras y puntuaciones de confianza para 80 clases COCO (persona, coche, animal, etc.).
- Ejecución en navegador: gracias a la conversión ONNX y al uso de ONNX Runtime Web, puede ejecutarse en WASM/CPU sin necesidad de GPU.
- Inferencia determinista: la conversión es reproducible byte a byte (mismo hash SHA-256 en dos builds).
- Compatibilidad con el postprocesamiento oficial de RF-DETR: mantiene la semántica de `PostProcess` del repositorio original.
- No incluye capacidades de texto, tool calling ni razonamiento multimodal; es exclusivamente un modelo de visión.

## Casos de uso

- Anotación automática de imágenes en navegador: AnnotateIt lo utiliza para preetiquetar imágenes de forma local, sin enviar datos a servidores externos, lo que resulta útil para conjuntos de datos sensibles o con requisitos de privacidad.
- Etiquetado de datos para entrenamiento de modelos de segmentación: permite generar máscaras iniciales que un anotador humano puede corregir, acelerando la creación de datasets.
- Segmentación de objetos en tiempo real en aplicaciones web: al ejecutarse en el cliente, puede integrarse en herramientas de edición de imágenes o vídeo para seleccionar objetos de forma interactiva.
- Automatización de flujos de control de calidad visual: detección y segmentación de defectos o piezas en imágenes de producto, siempre que las clases coincidan con las 80 de COCO o se realice un ajuste fino posterior.
- Prototipado rápido de sistemas de visión: al ser un modelo pequeño y de fácil despliegue, sirve para validar ideas de segmentación sin infraestructura compleja.
- Investigación en eficiencia de modelos: su tamaño reducido y su formato ONNX permiten estudiar el rendimiento de transformers de detección en entornos con recursos limitados.

## Benchmarks y rendimiento

La model card reporta las métricas oficiales de Roboflow para el checkpoint original y los resultados de la conversión ONNX evaluada en COCO val2017 (5000 imágenes). No se han publicado comparativas con otros modelos en la información disponible.

| Metrica | Valor (oficial Roboflow) | Valor (conversion ONNX, CPU) |
|---|---|---|
| COCO mask AP 50:95 | 40.3 | 40.10 |
| COCO mask AP50 | 63.0 | 62.41 |
| bbox AP | no disponible | 48.41 |
| Parametros | 33.6 M | 33.6 M |
| Latencia (T4, TensorRT FP16) | 3.4 ms | no disponible |

La conversión ONNX muestra una concordancia de 0.001 puntos de AP con el checkpoint PyTorch original, lo que indica que la exportación no introduce pérdida de precisión significativa. En navegador (headless Chrome, WASM/CPU, un solo hilo), la primera inferencia tarda 1079 ms y la mediana en caliente es de 1049 ms, con una inicialización de sesión de 469 ms.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 33,6 M de parámetros en FP32, el peso ocupa unos 128 MB. La inferencia puede ejecutarse en CPU sin necesidad de GPU; en GPU, cualquier tarjeta con al menos 1 GB de VRAM es suficiente.
- GPU recomendadas: no se requiere una GPU específica; funciona en GPUs integradas, RTX 2060 o superiores, y en aceleradores como T4 (donde se midió 3.4 ms con TensorRT FP16).
- Compatibilidad con GPU de consumo: sí, cualquier GPU moderna (serie GTX 10xx o superior) puede ejecutarlo sin problemas.
- Opciones de despliegue: ONNX Runtime (CPU/CUDA), ONNX Runtime Web (WASM/CPU), TensorRT, o cualquier runtime compatible con ONNX.
- Latencia y throughput: en CPU (Python, ONNX Runtime) la latencia no se ha medido en la información disponible; en navegador WASM/CPU es de aproximadamente 1 segundo por imagen. En GPU T4 con TensorRT FP16, 3.4 ms por imagen.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos de segmentación de instancias en la información proporcionada. Sin embargo, se puede contextualizar:

| Modelo | Parametros | Contexto de entrada | AP mask (COCO) | Licencia |
|---|---|---|---|---|
| RF-DETR Seg Nano (este) | 33.6 M | 312×312 | 40.3 | Apache-2.0 |
| YOLOv8n-seg (referencia) | ~3.4 M | 640×640 | ~30 (aprox.) | AGPL-3.0 |
| Mask R-CNN R50 (referencia) | ~44 M | 800×1333 | ~35 (aprox.) | MIT |

Nota: los valores de YOLOv8n-seg y Mask R-CNN son aproximados y no provienen de la información de esta ficha; se incluyen solo como orientación general. Para una comparativa rigurosa, se recomienda consultar los benchmarks oficiales de cada modelo.

## Limitaciones y advertencias

- El modelo está entrenado únicamente para las 80 clases de COCO; no reconoce objetos fuera de ese conjunto sin un ajuste fino.
- La entrada es fija a 312×312 píxeles y se aplica un estiramiento (stretch-resize) sin letterbox, lo que puede distorsionar la relación de aspecto de las imágenes.
- El postprocesamiento es específico: requiere seguir el contrato de salida (logits en `labels`, cajas en `dets`, máscaras en `masks`) y aplicar el umbral y la binarización indicados. No usar NMS.
- Los nombres de las salidas son contraintuitivos (`labels` contiene logits, no etiquetas), lo que puede inducir a error en integraciones.
- La conversión es independiente y no está respaldada por Roboflow; aunque se ha validado la concordancia con el checkpoint original, cualquier uso en producción debe verificar el comportamiento en el entorno objetivo.
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener el aviso de licencia y atribución correspondiente.
- No se han documentado sesgos específicos, pero al estar entrenado en COCO, puede presentar sesgos de género, edad o contexto presentes en ese dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnnotateIt/rfdetr-seg-nano-coco-onnx
- Repositorio oficial de RF-DETR: https://github.com/roboflow/rf-detr
- Checkpoint base: https://huggingface.co/Roboflow/rf-detr-seg-nano
- Notebook de ajuste fino de RF-DETR: https://colab.research.google.com/github/roboflow-ai/notebooks/blob/main/notebooks/how-to-finetune-rf-detr-on-segmentation-dataset.ipynb
- Modelo relacionado (detección ONNX): https://huggingface.co/AnnotateIt/rfdetr-nano-coco-onnx
