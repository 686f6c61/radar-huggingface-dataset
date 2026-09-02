# atkinschang/docling-layout-heron-mlx

## Resumen

El modelo `atkinschang/docling-layout-heron-mlx` es una conversión a formato MLX de los pesos del modelo `docling-project/docling-layout-heron`, el analizador de layout por defecto del proyecto Docling. Docling es un pipeline de conversión de documentos desarrollado por IBM Research que transforma PDFs, imágenes y otros formatos en representaciones estructuradas (JSON, Markdown, etc.). Este modelo en particular es un detector de objetos basado en la arquitectura RT-DETR v2, especializado en identificar y clasificar los elementos visuales de una página: bloques de texto, títulos, tablas, figuras, listas, etc.

La conversión a MLX permite ejecutar el modelo de forma nativa en hardware Apple Silicon (chips M1, M2, M3 y superiores) con un rendimiento optimizado y un consumo de memoria reducido. Con aproximadamente 42,9 millones de parámetros, es un modelo ligero que puede ejecutarse en cualquier Mac con memoria unificada, incluso en equipos de gama de entrada. Su licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo convierte en una opción atractiva para integrar análisis de layout en aplicaciones de productividad, digitalización y extracción de información.

La relevancia de este modelo radica en que el análisis de layout es un paso crítico en cualquier pipeline de procesamiento de documentos: sin una correcta detección de regiones, la extracción de texto, tablas o figuras posteriores pierde precisión. Al ofrecer una versión MLX del modelo heron, se facilita su despliegue en entornos macOS sin necesidad de depender de librerías de GPU de NVIDIA o de infraestructura en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETR v2 (detector de objetos basado en transformer) |
| Parametros totales | 42.889.979 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, procesa imagenes) |
| Tipos de cuantizacion | no disponible (formato MLX, probablemente soporta cuantizacion de 4 y 8 bits, pero no se documenta) |
| Idiomas soportados | no disponible (procesa imagenes de documentos en cualquier idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RT-DETR v2, un detector de objetos en tiempo real que combina un backbone convolutional con un transformer para la decodificación de las predicciones. A diferencia de los detectores tradicionales basados en propuestas (como Faster R-CNN), RT-DETR v2 realiza una predicción directa de bounding boxes y clases sin necesidad de anclas ni NMS post-procesamiento, lo que simplifica el pipeline y mejora la eficiencia. El modelo original `docling-layout-heron` fue entrenado por el equipo de Docling sobre un corpus heterogéneo de 150.000 documentos, tanto de acceso abierto como propietarios, según se describe en el informe técnico "Advanced Layout Analysis Models for Docling" (arXiv:2509.11720). El entrenamiento incluyó técnicas de post-procesamiento para refinar las predicciones y adaptarlas a las categorías de layout específicas de Docling (texto, título, tabla, figura, lista, etc.).

La conversión a MLX se realizó a partir de la revisión `8f39ad3c0b4c58e9c2d2c84a38465abf757272d8` del modelo original, manteniendo los pesos y la arquitectura sin modificaciones. No se ha aplicado ningún ajuste fino adicional en la versión MLX; es una conversión directa de pesos al formato de Apple.

## Capacidades

- Detección de regiones de layout en documentos: identifica y clasifica bloques de texto, títulos, tablas, figuras, listas, encabezados y pies de página.
- Generación de bounding boxes precisos para cada elemento detectado, con coordenadas normalizadas.
- Clasificación de elementos en categorías semánticas propias del dominio documental.
- Procesamiento de imágenes de documentos a resolución completa, sin necesidad de segmentación previa.
- Integración nativa con el ecosistema Docling: puede usarse como componente del pipeline de conversión de documentos.
- Ejecución eficiente en Apple Silicon gracias a la conversión MLX, con soporte para aceleración por GPU y CPU.
- No incluye capacidades de generación de texto, tool calling ni razonamiento multimodal; es exclusivamente un modelo de visión para análisis de layout.

## Casos de uso

- Digitalización de documentos escaneados: el modelo detecta las regiones de texto y tablas en imágenes de páginas, permitiendo aplicar OCR únicamente sobre las áreas relevantes y estructurar el contenido resultante.
- Extracción de datos de facturas y recibos: al identificar tablas y campos de texto, se puede automatizar la captura de importes, fechas y proveedores en sistemas de contabilidad.
- Análisis de artículos científicos: la detección de figuras, tablas y secciones de texto facilita la extracción de información estructurada para motores de búsqueda académica o bases de datos de conocimiento.
- Conversión de PDF a Markdown o HTML: integrado en Docling, el modelo permite transformar documentos complejos en formatos editables preservando la estructura jerárquica.
- Clasificación automática de documentos: las regiones detectadas pueden usarse como características para clasificar documentos por tipo (contrato, informe, carta, etc.).
- Preprocesamiento para RAG (Retrieval-Augmented Generation): al identificar tablas y figuras, se puede mejorar la indexación y recuperación de información en sistemas de preguntas y respuestas sobre documentos corporativos.
- Automatización de procesos de negocio: en flujos de trabajo que requieren validar la presencia de ciertos elementos (firmas, sellos, tablas), el modelo puede verificar su existencia y posición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El informe técnico del modelo original (arXiv:2509.11720) podría contener métricas de precisión y recall para el modelo heron, pero no se han proporcionado en los datos de esta ficha. Se recomienda consultar el paper para obtener datos comparativos con otros detectores de layout.

## Requisitos de hardware

- Al ser un modelo MLX, requiere un Mac con chip Apple Silicon (M1 o superior). No es compatible con GPUs NVIDIA ni con sistemas x86.
- Memoria: con 42,9 millones de parámetros, el modelo ocupa aproximadamente 170 MB en FP32 (42.889.979 × 4 bytes). En cuantización de 8 bits ocuparía unos 43 MB, y en 4 bits unos 22 MB. Cabe en cualquier Mac con al menos 8 GB de memoria unificada.
- GPU recomendada: cualquier GPU integrada en los chips M1, M2, M3 o M4. El rendimiento escala con el número de núcleos de GPU, pero incluso la GPU de 7 núcleos del M1 base es suficiente para inferencia en tiempo real.
- Opciones de despliegue: se puede ejecutar mediante la librería `docling-mlx` (indicada en el repositorio) o directamente con el runtime MLX de Apple. También es posible integrarlo en aplicaciones Swift o Python usando el paquete `mlx`.
- Latencia y throughput: no se dispone de mediciones oficiales. Dado el tamaño reducido del modelo, se espera una latencia de decenas de milisegundos por página en hardware Apple Silicon moderno, aunque depende de la resolución de la imagen de entrada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| docling-layout-heron (original) | RT-DETR v2 | 42,9 M | no aplica | Apache 2.0 | PyTorch |
| docling-layout-heron-mlx (este) | RT-DETR v2 | 42,9 M | no aplica | Apache 2.0 | MLX (safetensors) |
| LayoutLMv3 | Transformer + CNN | 125 M - 368 M | 512 tokens | CC BY-NC-SA 4.0 | PyTorch |

La comparativa directa con LayoutLMv3 no es trivial porque LayoutLMv3 es un modelo multimodal (texto + imagen) que requiere OCR previo, mientras que heron es un detector puro de layout. No se dispone de datos de rendimiento comparativo en la información proporcionada. La principal diferencia entre las dos versiones de heron es el formato de pesos: la versión MLX está optimizada para Apple Silicon, mientras que la original requiere PyTorch y CUDA para un rendimiento óptimo.

## Limitaciones y advertencias

- Es un modelo de visión exclusivamente: no procesa texto directamente, por lo que no puede leer el contenido de las regiones detectadas. Requiere integrarse con un OCR o un modelo de lectura para extraer el texto.
- La precisión en documentos muy complejos (con diseños no estándar, superposiciones de elementos o baja calidad de escaneo) puede verse reducida, aunque el modelo original fue entrenado con un corpus diverso.
- No se han documentado sesgos específicos, pero al ser entrenado con documentos mayoritariamente en inglés y de dominios académicos y empresariales, puede tener un rendimiento inferior en documentos de otros idiomas o formatos muy distintos.
- La conversión MLX no incluye cuantización predefinida; el usuario debe aplicar su propia cuantización si desea reducir aún más el tamaño, lo que puede afectar ligeramente a la precisión.
- No se garantiza la paridad exacta de resultados con el modelo original en PyTorch debido a diferencias numéricas entre los runtimes, aunque en la práctica suelen ser despreciables.
- La licencia Apache 2.0 permite uso comercial, pero el modelo original puede tener dependencias con otros componentes de Docling que sí tienen restricciones (por ejemplo, el modelo de OCR). Se recomienda revisar la licencia completa del ecosistema Docling.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/atkinschang/docling-layout-heron-mlx
- Modelo base original: https://huggingface.co/docling-project/docling-layout-heron
- Informe tecnico "Advanced Layout Analysis Models for Docling": https://arxiv.org/pdf/2509.11720v1
- Documentacion del catalogo de modelos de Docling: https://docling-project.github.io/docling/usage/model_catalog/
- Pagina del modelo en Inferix: https://inferix.co/models/docling-project/docling-layout-heron
