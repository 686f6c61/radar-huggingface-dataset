# JONNYVERSE/dinov2-base

## Resumen

El modelo `JONNYVERSE/dinov2-base` es una conversión a formato ONNX del modelo original `facebook/dinov2-base` de Meta AI, preparada específicamente para su uso con la librería Transformers.js en entornos JavaScript y navegador. DINOv2 es una familia de modelos de visión por computador basados en Vision Transformer (ViT) entrenados con aprendizaje auto-supervisado, capaces de generar características visuales universales sin necesidad de etiquetas. Este repositorio facilita la extracción de características de imagen directamente desde el navegador o Node.js, eliminando la dependencia de Python y permitiendo integrar visión por computador en aplicaciones web.

La conversión ONNX mantiene la misma arquitectura y pesos del modelo base, por lo que ofrece las mismas capacidades de representación visual. El modelo está diseñado para tareas de extracción de características (image-feature-extraction) y sirve como backbone para clasificación, segmentación semántica, recuperación de imágenes y otras tareas visuales. Su tamaño de repositorio es de 1,3 GB, lo que sugiere que los pesos están en precisión completa (FP32) o cuantizados, aunque no se especifica el tipo de cuantización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) base |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (tamaño de entrada de imagen típico 518x518 píxeles en el modelo original) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo visual, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (safetensors no aplicable) |

## Arquitectura y entrenamiento

El modelo es una conversión directa de `facebook/dinov2-base`, que emplea una arquitectura Vision Transformer (ViT) de tamaño base. DINOv2 utiliza un esquema de entrenamiento auto-supervisado que combina pérdidas contrastivas y de reconstrucción de parches, escalando el preentrenamiento a grandes conjuntos de datos sin etiquetas. El modelo original fue entrenado por Meta AI Research (FAIR) y publicado en los papers "DINOv2: Learning Robust Visual Features without Supervision" y "Vision Transformers Need Registers". La conversión ONNX no modifica los pesos ni la arquitectura, solo adapta el formato para su ejecución con Transformers.js.

No se dispone de detalles específicos sobre el proceso de conversión (herramientas, optimizaciones, cuantización) en la información proporcionada. El autor indica que el repositorio ONNX es una solución temporal hasta que WebML tenga más adopción, y recomienda usar Optimum para convertir modelos.

## Capacidades

- Extracción de características de imagen: genera embeddings vectoriales que representan el contenido visual de una imagen.
- Adecuado como backbone para tareas de clasificación, segmentación semántica, recuperación de imágenes y detección de objetos (añadiendo cabezas específicas).
- Compatible con Transformers.js, permitiendo ejecución en navegador y Node.js sin servidor Python.
- No soporta generación de texto ni procesamiento de lenguaje natural; es exclusivamente visual.
- No se menciona soporte para tool calling, agentes o razonamiento multi-paso, ya que no es un modelo de lenguaje.
- Capacidades multilingües no aplicables (modelo visual).

## Casos de uso

- Búsqueda visual de productos en tiendas online: el modelo extrae características de imágenes de productos para implementar sistemas de recomendación por similitud visual. Su integración en el frontend mediante Transformers.js permite realizar búsquedas sin enviar imágenes al servidor.
- Moderación de contenido en aplicaciones web: clasificar imágenes en categorías (violencia, desnudos, etc.) usando un clasificador entrenado sobre las características de DINOv2. Al ejecutarse en el cliente, se reduce la carga del servidor y se mejora la privacidad.
- Análisis de imágenes médicas en navegador: extraer características de radiografías o tomografías para detectar anomalías mediante modelos entrenados previamente, todo dentro de una aplicación de salud web.
- Organización automática de galerías fotográficas: agrupar imágenes por similitud visual (paisajes, personas, objetos) usando las características extraídas, sin necesidad de etiquetas manuales.
- Aumento de datos para entrenamiento de modelos: generar representaciones de imágenes para usar en pipelines de aprendizaje auto-supervisado o como entrada a modelos de clasificación ligera.
- Aplicaciones de realidad aumentada: extraer características de objetos del mundo real para reconocimiento y seguimiento en tiempo real dentro del navegador, gracias a la baja latencia de Transformers.js.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo original `facebook/dinov2-base` reporta métricas en tareas como ImageNet, pero no se dispone de datos específicos para esta conversión ONNX.

## Requisitos de hardware

- Al ser un modelo ViT-base con aproximadamente 86 millones de parámetros (estimación basada en el modelo original, no confirmada en la información), la inferencia puede ejecutarse en CPU con un uso de memoria moderado.
- El tamaño del repositorio (1,3 GB) sugiere que los pesos están en FP32; una cuantización a FP16 reduciría la memoria a la mitad.
- VRAM estimada: no disponible, pero para un modelo de este tamaño, se estima entre 1 y 2 GB en FP32, y menos de 1 GB en FP16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (ej. GTX 1650, RTX 3050) es suficiente. También puede ejecutarse en CPU con razonable velocidad.
- Al estar diseñado para Transformers.js, puede ejecutarse en navegadores modernos con WebGPU o WebAssembly, sin necesidad de GPU dedicada.
- Opciones de despliegue: Transformers.js (navegador y Node.js), ONNX Runtime Web, o servidores con ONNX Runtime (Python, C++).
- Latencia y throughput: no disponibles, pero al ser un modelo de tamaño base, se espera una latencia de decenas de milisegundos en GPU y de cientos en CPU.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa con otros modelos en la información proporcionada. Sin embargo, como alternativa a DINOv2-base, se pueden considerar otros extractores de características visuales como CLIP (ViT-B/32) o modelos auto-supervisados como MAE. La comparación dependería de la tarea específica y no se puede realizar sin datos de benchmarks.

## Limitaciones y advertencias

- La conversión ONNX puede introducir pequeñas diferencias numéricas respecto al modelo original en PyTorch, aunque en general son despreciables.
- No se especifica la licencia de este repositorio; el modelo original de Meta está bajo licencia Apache 2.0, pero esta conversión no declara licencia, por lo que se debe contactar al autor antes de uso comercial.
- El modelo está pensado para extracción de características; no incluye cabezas de clasificación ni segmentación, por lo que requiere entrenar capas adicionales para tareas específicas.
- Al ser un modelo visual, no tiene capacidades de lenguaje, por lo que no es adecuado para tareas de texto o multimodalidad.
- El tamaño del repositorio (1,3 GB) puede ser elevado para descargas en navegador; se recomienda cuantizar o servir los pesos desde un CDN.
- No se dispone de información sobre sesgos o alucinaciones, pero al estar entrenado en imágenes de internet, puede reflejar sesgos presentes en los datos de entrenamiento originales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JONNYVERSE/dinov2-base
- Modelo original: https://huggingface.co/facebook/dinov2-base
- Repositorio oficial de DINOv2 (GitHub): https://github.com/facebookresearch/dinov2
- Paper "DINOv2: Learning Robust Visual Features without Supervision": https://arxiv.org/abs/2304.07193
- Paper "Vision Transformers Need Registers": https://arxiv.org/abs/2309.16588
- Demo oficial: https://dinov2.metademolab.com/
