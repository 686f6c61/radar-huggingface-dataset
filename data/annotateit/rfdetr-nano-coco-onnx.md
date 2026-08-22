# AnnotateIt/rfdetr-nano-coco-onnx

## Resumen

El modelo **AnnotateIt/rfdetr-nano-coco-onnx** es una conversión no oficial a ONNX del detector de objetos RF-DETR nano, desarrollado por Roboflow. RF-DETR es una arquitectura de detección en tiempo real basada en transformers que alcanza un rendimiento de vanguardia en COCO y está diseñada para facilitar el ajuste fino. Esta conversión exporta los resultados crudos del modelo (sin NMS, sigmoid ni top-k), dejando todo el pre y postprocesamiento fuera del grafo, lo que la hace adecuada para entornos donde se requiere control total sobre el pipeline de inferencia.

La relevancia de este modelo radica en que permite ejecutar un detector de objetos moderno con un solo archivo ONNX (114,7 MB) que se puede integrar en cualquier framework que soporte ONNX Runtime, desde servidores hasta dispositivos embebidos. Al ser una conversión no oficial, no está respaldada por los autores originales, pero ofrece una alternativa ligera y portable para quienes necesitan desplegar RF-DETR sin depender de PyTorch.

La entrada es una imagen RGB de 384×384 píxeles (NCHW, float32) y la salida son 300 predicciones con logits de clase (91 clases COCO) y cajas delimitadoras normalizadas en formato `cxcywh`. El modelo original reporta un AP COCO de 48,4, aunque este valor no ha sido re-medido en la conversión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR (transformer de detección, variante nano) |
| Parametros totales | no disponible (archivo ONNX de 114,7 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (float32 en ONNX) |
| Idiomas soportados | no aplica |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (safetensors no aplicable) |

## Arquitectura y entrenamiento

RF-DETR es una arquitectura de detección de objetos basada en el paradigma DETR (Detection Transformer). Emplea un conjunto de 300 queries aprendidas que se procesan mediante un transformer para predecir directamente las cajas y las clases, eliminando la necesidad de anclas o NMS. La variante nano es la más ligera de la familia, diseñada para conseguir inferencia en tiempo real con un coste computacional reducido.

La conversión ONNX exporta los logits de clase y las cajas normalizadas sin aplicar sigmoid ni supresión de no máximos, por lo que todo el postprocesamiento debe realizarse externamente. No se dispone de información sobre el dataset de entrenamiento ni sobre el proceso de entrenamiento (RLHF, DPO, etc.) en la información proporcionada; el modelo original fue entrenado por Roboflow con el objetivo de lograr un estado del arte en COCO.

## Capacidades

- Detección de objetos en 91 clases del dataset COCO (layout de 91 slots de torchvision, con índice 0 para fondo).
- Predicción de cajas delimitadoras en formato `cxcywh` normalizado.
- Salida de 300 detecciones por imagen, sin NMS incluido.
- Entrada de imagen fija de 384×384 píxeles, en formato NCHW float32.
- Compatible con ONNX Runtime, lo que permite inferencia en CPU, GPU y dispositivos con soporte ONNX.
- No incluye capacidades de lenguaje, tool calling ni agentes; es exclusivamente un detector de objetos.

## Casos de uso

- **Detección de objetos en tiempo real en servidores**: al ser un modelo ligero, puede desplegarse con ONNX Runtime en CPUs de gama media o GPUs para procesar flujos de video con baja latencia.
- **Integración en pipelines de visión por computador**: al no incluir postprocesamiento, se puede adaptar a pipelines que ya tienen su propia lógica de NMS y filtrado de puntuaciones.
- **Despliegue en dispositivos embebidos**: el tamaño de 114,7 MB y la entrada de 384×384 lo hacen viable para dispositivos con recursos limitados (Jetson, Raspberry Pi) usando ONNX Runtime o TensorRT.
- **Prototipado rápido**: al ser un único archivo ONNX, se puede integrar en cualquier framework (Python, C++, JavaScript) sin instalar dependencias de PyTorch.
- **Fine-tuning posterior**: aunque esta conversión es solo para inferencia, el modelo original de Roboflow se puede ajustar con datos propios en COCO JSON o YOLO, y luego convertir a ONNX.
- **Evaluación de modelos de detección**: sirve como referencia para comparar el rendimiento de otros detectores en el mismo conjunto de datos.

## Benchmarks y rendimiento

En la información disponible se indica que el modelo original (RF-DETR nano) reporta un AP COCO de 48,4, pero este valor no se ha re-medido en la conversión ONNX. No se dispone de otros resultados de benchmarks (como mAP en otros datasets, latencia o throughput) para esta conversión concreta. Por tanto, no se presentan tablas comparativas.

## Requisitos de hardware

- **VRAM estimada**: no se proporciona un valor exacto. El archivo ONNX pesa ~110 MB, por lo que el uso de memoria estará en el orden de unos pocos cientos de MB en inferencia, dependiendo de la implementación.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, etc.). No requiere GPU de gama alta.
- **Compatibilidad con consumer GPU**: sí, es ligero y puede ejecutarse en tarjetas de consumo general.
- **Opciones de despliegue**: ONNX Runtime (CPU/GPU), ONNX Runtime Web (WASM), TensorRT (si se convierte a TensorRT), OpenVINO (con conversión).
- **Latencia y throughput**: no se proporcionan datos medidos. Al ser un modelo nano con entrada 384×384, se espera una latencia de decenas de milisegundos en CPU y de unos pocos milisegundos en GPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos en la información proporcionada. RF-DETR se puede comparar con otros detectores de la misma categoría (modelos nano, basados en transformers) como D-FINE, YOLO (variantes), o DETR original, pero no se han incluido cifras concretas en la documentación. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Conversión no oficial: no está respaldada por los autores originales de RF-DETR, por lo que puede contener errores de exportación o diferencias de comportamiento respecto al modelo PyTorch.
- La tabla de clases no está verificada: el modelo emite 91 logits (incluido el índice 0 para fondo). Se recomienda validar la correspondencia de clases con una imagen de referencia antes de usarlo en producción.
- No incluye postprocesamiento: el usuario debe implementar sigmoid, NMS (si se desea) y el manejo de la salida `cxcywh` para obtener detecciones finales.
- La entrada es de tamaño fijo 384×384 y el preprocesamiento requiere normalización con media y desviación de ImageNet después de dividir entre 255.
- La licencia es Apache-2.0, lo que permite uso comercial, pero al ser una conversión no oficial, se recomienda revisar los términos de la licencia del proyecto original (también Apache-2.0 para los modelos nano).
- No se incluye ningún mecanismo de cuantización, por lo que el modelo usa float32, lo que puede ser menos eficiente en dispositivos con memoria limitada.

## Enlaces

- [Hugging Face: AnnotateIt/rfdetr-nano-coco-onnx](https://huggingface.co/AnnotateIt/rfdetr-nano-coco-onnx)
- [GitHub - Roboflow RF-DETR](https://github.com/roboflow/rf-detr)
- [GitHub - PierreMarieCurie/rf-detr-onnx](https://github.com/PierreMarieCurie/rf-detr-onnx)
- [Roboflow RF-DETR - Página oficial](https://rfdetr.roboflow.com/latest/)
- [Inference Models - RF-DETR](https://inference-models.roboflow.com/models/rfdetr-object-detection/)
