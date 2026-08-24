# gatilin/sam2_segmenter

## Resumen

El repositorio `gatilin/sam2_segmenter` es un paquete de inferencia independiente del modelo Segment Anything Model 2 (SAM 2) en su variante `hiera-base-plus`, desarrollado originalmente por Meta AI. Este paquete ofrece los componentes del modelo (vision encoder, mask decoder y prompt encoder) exportados a formato ONNX, junto con un script de inferencia (`infer.py`) que permite realizar segmentación de imágenes mediante prompts de puntos o bounding boxes sin necesidad de instalar PyTorch ni CUDA, únicamente con `onnxruntime`, `numpy` y `opencv-python`.

La relevancia de este paquete radica en su simplicidad de despliegue: al eliminar la dependencia de frameworks pesados, permite integrar segmentación semántica en entornos con recursos limitados o en pipelines donde el tiempo de arranque es crítico. El modelo base (SAM 2) es un transformer con memoria de streaming para segmentación en imágenes y vídeo, pero esta conversión ONNX se centra en el caso de uso de imágenes estáticas, con una ventana fija de 1024x1024 píxeles.

El repositorio incluye los pesos en formato ONNX (vision encoder de 264 MB, mask decoder de 16 MB) y archivos NPZ con pesos auxiliares, junto con un script de demostración. No se especifica licencia ni idiomas, y el número de descargas es actualmente cero, lo que sugiere un proyecto reciente y poco validado por la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone Hiera y FPN (Segment Anything Model 2) |
| Parametros totales | no disponible (variante hiera-base-plus, sin cifra publicada en el repositorio) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision por segmentación, entrada fija 1024x1024) |
| Tipos de cuantizacion | no disponible (solo pesos ONNX en FP32) |
| Idiomas soportados | No aplica (modelo de visión, sin procesamiento de texto) |
| Licencia | no disponible en el repositorio (el modelo original SAM 2 es Apache 2.0, pero esta conversión no lo declara) |
| Formato de pesos | ONNX (vision_encoder.onnx, mask_decoder.onnx) y NPZ (conv_s0.npz, conv_s1.npz, prompt_encoder.npz) |

## Arquitectura y entrenamiento

SAM 2 es un modelo de segmentación de imágenes y vídeo desarrollado por Meta AI, presentado en julio de 2024. Su arquitectura se basa en un transformer con memoria de streaming para procesar vídeo en tiempo real, y en este caso se ha extraído la parte de imagen para su uso independiente. El backbone es Hiera (una variante eficiente de transformer jerárquico) combinado con una FPN (Feature Pyramid Network) para extraer características multiescala. El prompt encoder genera embeddings a partir de puntos y bounding boxes, y el mask decoder produce la máscara final.

El entrenamiento del modelo original se realizó con un data engine que combina interacción humana con anotaciones automáticas, acumulando el mayor dataset de segmentación de vídeo hasta la fecha. No se dispone de detalles sobre el entrenamiento de esta conversión específica, ni sobre el número de tokens o composición del dataset. La conversión a ONNX parece ser una extracción de los pesos del checkpoint oficial, sin cambios en la arquitectura, pero con restricciones en la entrada (batch_size=1, puntos máximos por prompt = 2).

## Capacidades

- Segmentación de imágenes mediante prompts de puntos (foreground/background) o bounding boxes.
- Inferencia sin dependencias de PyTorch ni CUDA, únicamente con ONNX Runtime (CPU o GPU).
- Reutilización de las características de imagen: el vision encoder se llama una vez y las features se cachean para múltiples prompts.
- Soporte para múltiples puntos en un solo prompt (agrupados automáticamente en pares).
- Salida de máscara en resolución original, con ajuste automático de coordenadas al espacio de entrada de 1024x1024.
- No incluye capacidades de vídeo ni de segmentación automática (sin prompts), ya que la conversión se limita a la parte de imagen.

## Casos de uso

- **Edición de imágenes**: selección de objetos mediante clic o bounding box para recortar, eliminar o modificar regiones. El modelo devuelve una máscara precisa que se puede integrar en flujos de retoque fotográfico.
- **Preprocesamiento en pipelines de visión**: extracción de regiones de interés (ROIs) para posterior clasificación o detección. Al no requerir GPU, puede ejecutarse en servidores CPU para lote de imágenes.
- **Análisis de imágenes médicas**: segmentación de estructuras anatómicas en radiografías o tomografías, usando un prompt de punto o caja como entrada. La capacidad de ejecución en CPU facilita su uso en entornos clínicos con recursos limitados.
- **Automatización de anotaciones**: generación de máscaras para crear datasets de entrenamiento, combinando puntos o cajas de anotadores humanos con el modelo para acelerar el etiquetado.
- **Visión robótica**: segmentación de objetos en imágenes capturadas por cámaras de robots para guiar acciones de manipulación. La baja latencia en CPU permite su integración en sistemas embebidos.
- **Aplicaciones de realidad aumentada**: segmentación de objetos del entorno para superponer contenido virtual, con inferencia local sin conexión a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye comparaciones con otros modelos de segmentación ni métricas de rendimiento (IoU, FPS, etc.). Tampoco se proporcionan datos de latencia o throughput del script de inferencia. Por tanto, no se pueden presentar cifras cuantitativas.

## Requisitos de hardware

- El vision encoder ONNX ocupa 264 MB, por lo que puede ejecutarse en CPU con unos 4 GB de RAM, aunque la latencia será mayor que en GPU.
- Para inferencia en GPU, se recomienda una tarjeta con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650 o superior) para manejar el tensor de entrada de 1x3x1024x1024 en FP32.
- No se requiere CUDA si se usa el backend de CPU de ONNX Runtime, pero para aceleración GPU se necesita CUDA y cuDNN.
- El script `infer.py` está diseñado para ejecutarse con `onnxruntime`, lo que permite desplegar en servidores con CPU o GPU.
- Opciones de despliegue: ejecución directa con `python infer.py`, o integración en aplicaciones mediante la API de ONNX Runtime. No se mencionan compatibilidades con vLLM, TGI u otros servidores de modelos, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de información sobre comparativas con otros modelos de segmentación en el repositorio. Sin embargo, a nivel general, SAM 2 se compara con SAM original y MobileSAM. El modelo original SAM 2 tiene licencia Apache 2.0 y está disponible en el repositorio oficial de Meta, con tamaños que van desde tiny hasta large. Esta conversión ONNX parece ser una extracción del checkpoint `hiera-base-plus`, que es una de las variantes intermedias. No hay datos de rendimiento comparativo en el repositorio, por lo que no se puede hacer una tabla numérica.

## Limitaciones y advertencias

- El modelo está limitado a batch_size = 1 y a un máximo de 2 puntos por prompt (aunque el script permite múltiples puntos, estos se agrupan de a pares, limitando la interacción compleja).
- La entrada está fija en 1024x1024 píxeles, por lo que las imágenes de mayor resolución se reescalan, lo que puede perder detalles finos.
- No se especifica la licencia en el repositorio, lo que genera incertidumbre para uso comercial. Aunque el modelo original es Apache 2.0, esta conversión no declara su licencia, por lo que se recomienda consultar con el autor antes de utilizarla en entornos productivos.
- No se incluyen capacidades de vídeo ni de segmentación automática, a diferencia del modelo SAM 2 completo.
- El script `infer.py` no está probado en la comunidad (0 descargas), por lo que pueden existir errores no documentados.
- No se proporcionan pesos en otros formatos (como PyTorch) ni cuantizaciones, lo que limita su uso en dispositivos con memoria reducida.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/gatilin/sam2_segmenter
- Paper de SAM 2: https://arxiv.org/html/2408.00714v2
- Repositorio oficial de SAM 2: https://github.com/facebookresearch/sam2
- Página de Meta sobre SAM 2: https://ai.meta.com/research/sam2/
- Página de referencia en AI Wiki: https://aiwiki.ai/wiki/sam_2
