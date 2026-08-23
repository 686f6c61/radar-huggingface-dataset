# DevilishDaoSaint/koharu-layout-rfdetr

## Resumen

KoharuLayout-RFDETR-Seg-2XL es un modelo de segmentación de instancias diseñado para el análisis de layout en páginas de manga, cómic, manhua y manhwa. Este repositorio concreto aloja la exportación a formato ONNX Runtime del modelo original creado por mayocream, optimizada para inferencia ligera en aplicaciones nativas sin dependencias de Python. El modelo detecta cuatro clases: texto, onomatopeyas, burbujas de diálogo y paneles, a una resolución fija de 1152x1152 píxeles.

La arquitectura subyacente es RF-DETR, un detector de transformadores en tiempo real desarrollado por Roboflow que utiliza un backbone DINOv2 y alcanza un equilibrio notable entre precisión y latencia. El modelo original fue entrenado con el dataset Manga109 Segmentation v2.0.0, que impone términos de uso académico. Esta exportación ONNX está pensada para integrarse en herramientas de traducción automática de cómic, análisis de estructuras narrativas o preprocesado para OCR, evitando la dependencia de entornos Python en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR (Detection Transformer con backbone DINOv2) |
| Parametros totales | 40,3 M |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No aplicable (modelo de vision) |
| Tipos de cuantizacion | FP32 (ONNX) |
| Idiomas soportados | No aplicable (procesa imagenes, no texto) |
| Licencia | Other (terminos academicos de Manga109) |
| Formato de pesos | ONNX (.onnx) |

## Arquitectura y entrenamiento

RF-DETR es un detector de objetos y segmentador de instancias basado en el paradigma DETR (Detection Transformer). Utiliza un backbone DINOv2 preentrenado para extraer características visuales y un decoder de transformadores que predice cajas delimitadoras y máscaras de segmentación directamente, sin anclas ni propuestas. El modelo original se entrenó específicamente para la tarea de análisis de layout de manga sobre el dataset Manga109 Segmentation v2.0.0, que incluye anotaciones de texto, onomatopeyas, burbujas y paneles. La exportación ONNX es una compilación del modelo original con pesos congelados, diseñada para ejecutarse en ONNX Runtime (CPU, DirectML, CUDA, CoreML) sin dependencias de Python.

## Capacidades

- Segmentación de instancias a 1152x1152 píxeles, devolviendo cajas delimitadoras y máscaras binarias para cada objeto detectado.
- Clasificación en cuatro categorías específicas: texto, onomatopeya, burbuja y panel.
- Detección de elementos de layout en páginas de manga, cómic, manhua y manhwa.
- Inferencia en tiempo real gracias a la arquitectura RF-DETR, adecuada para procesamiento por lotes.
- Compatible con ONNX Runtime en CPU, DirectML, CUDA y CoreML, lo que permite despliegue en aplicaciones de escritorio, web o móviles.
- No requiere librerías Python en producción; el archivo `.onnx` se puede cargar directamente desde Rust, C++, C#, etc.

## Casos de uso

- Traducción automática de manga: el modelo detecta las regiones de texto y burbujas, permitiendo reemplazar el texto original por traducciones sin alterar el arte del panel.
- Extracción de texto para OCR: las máscaras de texto y onomatopeyas se usan como entrada para sistemas de reconocimiento óptico de caracteres (OCR) especializados en cómics.
- Análisis estructural de páginas: los paneles detectados permiten reconstruir la secuencia narrativa, útil para herramientas de lectura guiada o para indexar contenido.
- Limpieza de arte en proyectos de fan-traducción: las máscaras de texto y burbujas permiten eliminar el texto original de forma selectiva antes de insertar nuevas traducciones.
- Clasificación y etiquetado de páginas: la detección de paneles y su disposición sirve para catalogar páginas según su estructura (viñetas múltiples, splash, etc.).
- Preprocesado para modelos de generación de imágenes: las máscaras de panel y texto se pueden usar para condicionar modelos de difusión que generan o restauran páginas de manga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este modelo exportado en la información disponible. El modelo base RF-DETR-2XL reporta 60,1 AP en COCO (según la web oficial de RF-DETR), pero no se dispone de métricas equivalentes para la versión fine-tuneada en Manga109. Se recomienda realizar una evaluación propia sobre el dataset Manga109 para obtener métricas de rendimiento en la tarea de segmentación de layout.

## Requisitos de hardware

- VRAM estimada: el archivo ONNX pesa ~148 MB en FP32. Para inferencia en GPU, se recomienda al menos 2 GB de VRAM para evitar cuellos de botella con activaciones en 1152x1152.
- GPU recomendadas: cualquier GPU con soporte CUDA (NVIDIA GTX 1060 o superior) o DirectML (tarjetas AMD/Intel). En CPU puede funcionar, aunque la latencia será mayor (del orden de varios segundos por imagen).
- Es viable en GPUs de consumo como RTX 3060, 4060 o incluso tarjetas integradas con DirectML.
- Despliegue: ONNX Runtime (C++, C#, Rust, Python), TensorRT para NVIDIA, o CoreML para Apple Silicon. No se recomienda vLLM ni Ollama porque están orientados a modelos de texto.
- Latencia: sin datos oficiales; en una GPU media se estiman entre 100-300 ms por imagen, dependiendo del hardware.

## Comparativa con modelos similares

No hay comparativa directa disponible en la información proporcionada. Como alternativa se pueden considerar otros modelos de detección de layout de manga como `koharu-text-sam-ts-l` (también de mayocream), pero no se dispone de datos comparativos en esta ficha.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con el dataset Manga109, por lo que su rendimiento puede degradarse en estilos de cómic occidental, manhwa digital con color o layouts muy diferentes al manga japonés tradicional.
- Solo reconoce cuatro clases fijas; no distingue subtipos de texto (diálogo, narración, títulos) ni otros elementos como onomatopeyas estilizadas complejas.
- La resolución de entrada está fijada a 1152x1152; imágenes con dimensiones muy diferentes pueden requerir un redimensionado que afecte a la precisión.
- La licencia es "other" y está sujeta a los términos académicos del dataset Manga109, lo que puede restringir su uso comercial. Es necesario revisar esos términos antes de desplegar en producción.
- Al ser una exportación ONNX, no es posible reentrenar el modelo ni ajustar pesos desde este repositorio; para ello hay que usar el modelo original en SafeTensors.
- No se han publicado evaluaciones de sesgo o robustez frente a imágenes adversarias; se recomienda validar en el dominio de aplicación concreto.

## Enlaces

- Repositorio del modelo ONNX: https://huggingface.co/DevilishDaoSaint/koharu-layout-rfdetr
- Modelo original (SafeTensors): https://huggingface.co/mayocream/koharu-layout-rfdetr-seg-2xl-1152
- Proyecto Koharu (Manga Translation Studio): https://github.com/mayocream/koharu
- Página oficial de RF-DETR: https://rfdetr.roboflow.com/latest/
- Dataset Manga109: https://huggingface.co/datasets/mayocream/manga109-segmentation
- Herramienta XianScan (ejemplo de uso): https://github.com/ArbenApura/xianscan-rust
