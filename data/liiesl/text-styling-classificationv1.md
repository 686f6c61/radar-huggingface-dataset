# Liiesl/text-styling-classificationv1

## Resumen

`Liiesl/text-styling-classificationv1` es un modelo de visión por computadora diseñado para extraer atributos tipográficos y de estilo a partir de imágenes de líneas de texto recortadas. Desarrollado por Liiesl, este modelo se basa en el backbone `edgenext_small` de la librería `timm`, preentrenado en ImageNet, y ha sido ajustado para una tarea multi-tarea con ocho cabezas de predicción simultáneas. El modelo toma como entrada una imagen de dimensiones fijas de 64x160 píxeles (alto x ancho) en RGB y produce, entre otras salidas, flags binarios para negrita, cursiva, trazo, sombra y brillo; el tipo de fondo (sólido, degradado o artwork); colores de texto, de efecto y de fondo; y la dirección angular de un degradado.

La relevancia de este modelo radica en su capacidad para automatizar la descripción visual de textos en imágenes, un paso previo común en pipelines de OCR, diseño gráfico, accesibilidad y generación de metadatos. Al ser un modelo ligero (basado en EdgeNeXt-Small) y exportable a ONNX, puede ejecutarse en entornos con recursos limitados, como CPUs o dispositivos edge. El repositorio incluye tanto checkpoints de PyTorch (`.pth.tar`) como un archivo ONNX con opset 18 y batch dinámico, lo que facilita su integración en diferentes frameworks de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EdgeNeXt-Small con 8 cabezas de predicción multi-tarea |
| Parametros totales | no disponible (backbone edgenext_small, sin cifra publicada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 64x160) |
| Tipos de cuantizacion | no disponible (no se mencionan cuantizaciones predefinidas) |
| Idiomas soportados | no aplica (procesa imágenes, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch checkpoints (`.pth.tar`) y ONNX (opset 18) |

## Arquitectura y entrenamiento

El modelo emplea el backbone `edgenext_small` de `timm`, preentrenado en ImageNet, seguido de un pooling adaptativo que reduce la salida espacial a 2x5 (3040 dimensiones). Este vector pasa por un bottleneck compuesto por una capa lineal `Linear(3040, 256)`, BatchNorm1d, activación Hardswish y Dropout con tasa 0.2. A partir de este bottleneck se ramifican ocho cabezas de salida, cada una con su propia arquitectura de regresión o clasificación.

El entrenamiento se realizó con una función de pérdida multi-tarea que combina: Binary Cross Entropy con logits para los flags tipográficos, Cross Entropy para la clasificación del tipo de fondo, Smooth L1 (Huber, beta=0.1) con enmascaramiento por muestra para los valores RGB continuos, y distancia coseno para el ángulo del degradado. Se usó el optimizador AdamW (lr=1e-3, weight decay=1e-4) con clipping de gradiente a norma 1.0, un scheduler de cosine annealing con 1 época de warmup, promedio exponencial móvil (ModelEmaV2) y entrenamiento distribuido en FP16 con HuggingFace Accelerate sobre dos NVIDIA T4.

## Capacidades

- Detección de atributos tipográficos binarios: negrita, cursiva, presencia de trazo, sombra y brillo (5 flags independientes).
- Clasificación del tipo de fondo de la línea de texto: sólido, degradado o artwork/imagen.
- Regresión de colores RGB normalizados (0-1) para el relleno principal del texto, el color de efectos externos (trazo, sombra, brillo) y los colores de fondo (sólido o dos extremos de degradado).
- Predicción de la dirección del degradado como un vector unitario [sin(theta), cos(theta)].
- Procesamiento de imágenes de entrada de 64x160 píxeles con normalización ImageNet.
- Exportación a ONNX con batch dinámico, lo que permite inferencia en múltiples frameworks (ONNX Runtime, TensorRT, etc.).
- Sin capacidades de generación de texto, tool calling o agentes; es un modelo puramente visual.

## Casos de uso

- Mejora de pipelines de OCR: el modelo puede preprocesar imágenes de líneas de texto para extraer atributos de estilo que ayuden a los sistemas de OCR a distinguir entre texto regular y texto con efectos, mejorando la precisión en documentos complejos como carteles o infografías.
- Automatización de diseño gráfico: permite detectar automáticamente si un texto es negrita, cursiva o tiene efectos, facilitando la conversión de imágenes a formatos editables (por ejemplo, reconstrucción de estilos en herramientas de diseño).
- Generación de metadatos para bibliotecas de imágenes: al clasificar el estilo tipográfico y los colores, se pueden indexar imágenes de texto para búsquedas por atributos visuales, útil en bancos de imágenes o archivos históricos.
- Accesibilidad y lectura asistida: la detección de colores de texto y fondo puede ayudar a ajustar automáticamente el contraste o generar descripciones alternativas para personas con discapacidad visual.
- Análisis de marca y publicidad: identificar estilos tipográficos y paletas de color en anuncios o material de marketing permite a las empresas auditar la consistencia visual de sus campañas.
- Preprocesamiento para edición de video o subtítulos: extraer el estilo de texto de capturas de video puede ayudar a replicar o modificar subtítulos y rótulos de manera automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como precisión, recall o F1 para las distintas cabezas de predicción, ni comparaciones con otros modelos de clasificación de estilos tipográficos.

## Requisitos de hardware

- Al ser un modelo de visión pequeño (backbone EdgeNeXt-Small), la inferencia puede ejecutarse en CPU sin GPU, especialmente con el formato ONNX y el runtime de ONNX.
- Para uso en batch o en tiempo real, una GPU con al menos 4 GB de VRAM es suficiente (por ejemplo, NVIDIA T4, GTX 1650, RTX 3060).
- El modelo es adecuado para despliegue en dispositivos edge (Raspberry Pi, Jetson Nano) gracias a su tamaño reducido y la exportación a ONNX.
- Se puede integrar con ONNX Runtime (CPUExecutionProvider o CUDAExecutionProvider), así como con frameworks como TensorRT para aceleración adicional.
- No se han publicado mediciones de latencia o throughput; se espera una latencia de unos pocos milisegundos por imagen en GPU y de decenas de milisegundos en CPU, pero estos valores son estimaciones no verificadas.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos directamente comparables en la misma categoría (clasificación de estilos tipográficos en imágenes) con información pública de rendimiento. La tarea es específica y no hay alternativas conocidas con las que realizar una comparación objetiva.

## Limitaciones y advertencias

- El modelo está optimizado para recortes horizontales de texto con una relación de aspecto cercana a 64x160. Imágenes con texto vertical o proporciones extremas pueden degradar la percepción de límites espaciales y reducir la precisión.
- Las predicciones de color de efecto solo son válidas si al menos uno de los flags de trazo, sombra o brillo es positivo (umbral 0.5). De lo contrario, el valor de `effect_color` no es significativo.
- El color de fondo sólido solo es fiable cuando `bg_type == 0` (sólido). En los casos de degradado o artwork, las salidas de color de fondo no tienen garantía de validez.
- Para `bg_type == 2` (artwork), no se garantiza ninguna regresión de color de fondo.
- No se han documentado sesgos específicos, pero al estar entrenado con un conjunto de datos no especificado, puede presentar sesgos hacia ciertos estilos tipográficos o combinaciones de colores comunes en los datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre el dataset de entrenamiento y su procedencia puede ser un riesgo legal si se utilizan datos con derechos de autor.
- No se proporcionan métricas de rendimiento ni evaluaciones sobre conjuntos de validación, por lo que es necesario validar el modelo en el dominio de aplicación antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Liiesl/text-styling-classificationv1
- Repositorio de `timm` (backbone): https://github.com/huggingface/pytorch-image-models
- Documentación de ONNX Runtime: https://onnxruntime.ai/
