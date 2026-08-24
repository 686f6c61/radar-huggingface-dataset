# Gertrude01/3Class-Gel-Segmentation-Expanded-Aug-2026

## Resumen

El modelo `Gertrude01/3Class-Gel-Segmentation-Expanded-Aug-2026` es un sistema de segmentación semántica de imágenes de geles de electroforesis, desarrollado por el usuario Gertrude01. Se basa en una arquitectura SMP-UNet (U-Net implementada con la librería Segmentation Models PyTorch) y se ha entrenado sobre un subconjunto del dataset GelGenie compuesto por 185 imágenes. El modelo amplía el trabajo previo `GelGenie-Universal-Dec-2023`, que realizaba segmentación en dos clases, para ahora distinguir tres clases: fondo, bandas y pocillos.

La relevancia de este modelo radica en la automatización del análisis de geles de electroforesis, una tarea repetitiva y propensa a errores en laboratorios de biología molecular. Al estar disponible en formato ONNX y con licencia Apache 2.0, puede integrarse fácilmente en pipelines de procesamiento de imágenes sin depender de frameworks específicos de entrenamiento. El repositorio tiene un tamaño de 0,7 GB, lo que sugiere un modelo de dimensiones moderadas, aunque no se especifican los parámetros totales ni el backbone concreto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SMP-UNet (U-Net de Segmentation Models PyTorch, backbone no especificado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (formato ONNX, sin información sobre cuantización) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura U-Net clásica para segmentación semántica, implementada mediante la librería Segmentation Models PyTorch (SMP). No se detalla el backbone encoder utilizado (por ejemplo, ResNet, EfficientNet, etc.), ni el número de parámetros. El entrenamiento se realizó en dos fases: primero se inicializó desde el checkpoint del modelo `GelGenie-Universal-Dec-2023` (que segmentaba en dos clases: fondo y bandas), y posteriormente se fine-tuneó para la tarea de tres clases (fondo, bandas y pocillos). El fine-tuning se llevó a cabo desde la época 579 hasta la época 1000, seleccionándose la época 998 como checkpoint final. El conjunto de datos de entrenamiento consistió en 185 imágenes del dataset GelGenie, un subconjunto reducido que puede limitar la generalización. No se menciona el uso de aumentación de datos, técnicas de regularización ni estrategias de validación.

## Capacidades

- Segmentación semántica de imágenes de geles de electroforesis en tres clases: fondo, bandas y pocillos.
- Detección de bandas de ADN, ARN o proteínas, así como de los pocillos donde se cargan las muestras.
- Extensión de un modelo previo de dos clases, añadiendo la clase "pocillos" para una mejor separación de regiones.
- Procesamiento de imágenes en formato ONNX, lo que permite su uso con runtime de inferencia como ONNX Runtime, OpenCV o TensorRT.
- No incluye capacidades de generación de texto, razonamiento, código, tool calling ni soporte multilingüe, al ser un modelo puramente visual.

## Casos de uso

- Análisis automatizado de geles de agarosa o poliacrilamida: el modelo puede identificar y delimitar bandas y pocillos en imágenes de geles, facilitando la cuantificación de fragmentos de ADN o proteínas sin intervención manual.
- Control de calidad en laboratorios de biología molecular: integrado en un pipeline de adquisición de imágenes, permite verificar rápidamente si un gel presenta bandas bien definidas o si hay artefactos que requieran repetir el experimento.
- Cuantificación de expresión génica: al segmentar las bandas, se puede calcular su intensidad relativa y comparar muestras en estudios de expresión diferencial.
- Documentación y archivo de resultados: el modelo puede generar máscaras de segmentación que se superponen a las imágenes originales para su inclusión en publicaciones científicas o informes de laboratorio.
- Automatización de flujos de trabajo en plataformas de análisis de imágenes: al ser ONNX, puede desplegarse en servidores o en la nube para procesar lotes de imágenes de geles de forma paralela.
- Educación y formación: el modelo puede utilizarse como herramienta didáctica para enseñar a estudiantes a identificar bandas y pocillos en geles, mostrando la segmentación generada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como IoU, Dice, precisión o recall sobre conjuntos de validación o test. Tampoco se comparan los resultados con otros modelos de segmentación de geles.

## Requisitos de hardware

- No se dispone de requisitos oficiales de hardware por parte del autor.
- El tamaño del repositorio es de 0,7 GB, lo que sugiere que el modelo en formato ONNX podría ocupar entre 200 y 500 MB en disco, dependiendo de la cuantización y el backbone. Esto indica que es probablemente un modelo de tamaño moderado (del orden de decenas de millones de parámetros).
- Para inferencia en CPU, es viable con un procesador moderno, aunque la latencia dependerá de la resolución de las imágenes de entrada.
- En GPU, cualquier tarjeta con al menos 2-4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o superiores) debería ser suficiente para ejecutar el modelo en tiempo real o casi real.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), OpenCV DNN, TensorRT, o cualquier framework que soporte ONNX. También puede convertirse a otros formatos si es necesario.
- No se conocen datos de latencia o throughput específicos.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de segmentación de geles de electroforesis con los que comparar. El modelo `GelGenie-Universal-Dec-2023` (predecesor) es el único referente conocido, pero no se han publicado métricas comparativas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo se entrenó únicamente con 185 imágenes, un conjunto muy reducido que puede provocar sobreajuste y falta de generalización a otros tipos de geles, condiciones de iluminación o marcas comerciales.
- Solo distingue tres clases (fondo, bandas y pocillos); no detecta otros artefactos comunes como burbujas, manchas o degradación de la muestra.
- No se han publicado métricas de rendimiento, por lo que se desconoce su precisión real en datos no vistos.
- El fine-tuning se realizó desde un checkpoint previo, pero no se especifica si el modelo base fue entrenado con datos suficientes para garantizar robustez.
- La licencia Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías sobre la idoneidad del modelo para aplicaciones críticas.
- Al ser un modelo de visión, no tiene capacidades de razonamiento ni de interpretación de resultados; la segmentación debe ser validada por un experto antes de tomar decisiones experimentales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gertrude01/3Class-Gel-Segmentation-Expanded-Aug-2026
- Modelo predecesor (referencia): https://huggingface.co/Gertrude01/3Class-Gel-Segmentation-Mar-2026 (misma familia, entrenado con 144 imágenes)
- No se han encontrado papers, blogs o repositorios adicionales asociados a este modelo.
