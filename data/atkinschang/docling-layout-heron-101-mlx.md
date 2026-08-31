# atkinschang/docling-layout-heron-101-mlx

## Resumen

`atkinschang/docling-layout-heron-101-mlx` es una conversión a formato MLX (Apple Silicon) del modelo `docling-project/docling-layout-heron-101`, un detector de objetos especializado en análisis de layout de documentos (Document Layout Analysis, DLA). El modelo original fue desarrollado por el equipo de Docling (IBM Research) y está documentado en el informe técnico "Advanced Layout Analysis Models for Docling" (arXiv:2509.11720). Su propósito es identificar y clasificar regiones dentro de páginas escaneadas o digitales —como bloques de texto, tablas, figuras, títulos, listas o fórmulas—, lo que constituye el primer paso en pipelines de conversión de documentos a formatos estructurados (Markdown, JSON, HTML).

El modelo se basa en la arquitectura RT-DETRv2 con backbone ResNet101 y cuenta con 76,7 millones de parámetros. Fue entrenado sobre un corpus heterogéneo de 150.000 documentos (mezcla de datos abiertos y propietarios) y alcanza un 78% de mAP en el conjunto de referencia DocLayNet, lo que supone una mejora del 23,9% respecto al modelo de layout anterior de Docling. La versión MLX aquí presentada mantiene exactamente los mismos pesos y arquitectura, pero está optimizada para ejecutarse de forma eficiente en hardware Apple (M1/M2/M3/M4) mediante el framework MLX, lo que facilita su integración en entornos macOS sin necesidad de GPU NVIDIA.

Al tratarse de un modelo de detección de objetos y no de un modelo de lenguaje, no tiene longitud de contexto ni capacidades generativas. Su salida son cajas delimitadoras (bounding boxes) con etiquetas de clase y confianza, listas para ser consumidas por el pipeline de Docling o por cualquier sistema de procesamiento documental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETRv2 con backbone ResNet101 |
| Parametros totales | 76.669.307 (76,7 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de deteccion de objetos) |
| Tipos de cuantizacion | No disponible (pesos en FP32/FP16, sin cuantizacion publicada) |
| Idiomas soportados | No aplica (modelo de vision, independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo `heron-101` se basa en RT-DETRv2, un detector de objetos en tiempo real de tipo transformer que combina un encoder híbrido (CNN + transformer) con un decoder de consultas. El backbone es ResNet101, que extrae características visuales de la página a múltiples escalas. A diferencia de los detectores basados en anchor, RT-DETRv2 utiliza consultas aprendibles y un mecanismo de atención cruzada para predecir directamente las cajas y las clases, lo que elimina la necesidad de post-procesamiento NMS en la mayoría de los casos. El modelo fue entrenado sobre un corpus de 150.000 documentos, tanto abiertos como propietarios, con anotaciones de layout enriquecidas. Tras la detección, se aplican pasos de post-procesamiento (fusión de regiones, filtrado por confianza, etc.) para refinar las predicciones, tal como se describe en el informe técnico. No se menciona el uso de RLHF ni DPO, ya que no es un modelo generativo.

## Capacidades

- Detección de regiones de layout en páginas de documentos: bloques de texto, títulos, tablas, figuras, listas, fórmulas, encabezados, pies de página, etc.
- Generación de bounding boxes con coordenadas normalizadas y etiquetas de clase.
- Salida con puntuación de confianza para cada detección.
- Funciona sobre imágenes de páginas completas (escaneos o PDFs renderizados).
- Independiente del idioma del documento, ya que opera a nivel visual.
- Integración nativa con el pipeline de Docling para conversión de documentos a formatos estructurados.
- Optimizado para ejecución en Apple Silicon mediante MLX, con soporte para aceleración por GPU (Metal) y CPU.

## Casos de uso

- **Conversión de documentos a Markdown/HTML**: el modelo identifica la estructura de la página (títulos, párrafos, tablas, figuras) y permite que Docling genere una representación semántica fiel del documento original.
- **Extracción de tablas**: al detectar regiones de tabla, se puede recortar la imagen y pasarla a un modelo de reconocimiento de tablas (como TableFormer) para extraer los datos estructurados.
- **Digitalización de archivos históricos**: en bibliotecas digitales, el modelo ayuda a segmentar páginas escaneadas de periódicos, revistas o libros antiguos para su indexación y búsqueda.
- **Preprocesamiento para OCR**: al conocer la ubicación de bloques de texto, se puede dirigir el OCR a regiones específicas, mejorando la precisión y reduciendo el coste computacional.
- **Análisis de documentos científicos**: en papers académicos, el modelo distingue entre texto, figuras, ecuaciones y tablas, facilitando la extracción de información para motores de búsqueda semántica.
- **Automatización de procesos de negocio**: en empresas que reciben facturas, contratos o formularios, el modelo permite clasificar y extraer campos relevantes de forma automática, integrándose en flujos de trabajo RPA.
- **Accesibilidad**: la segmentación de layout puede usarse para reordenar el contenido de un documento en un orden de lectura lógico, mejorando la experiencia de lectores de pantalla.

## Benchmarks y rendimiento

Según el informe técnico (arXiv:2509.11720), el modelo `heron-101` alcanza un **78% de mAP** en el conjunto de datos DocLayNet, lo que supone una mejora del **23,9%** respecto al modelo de layout anterior de Docling. No se han publicado resultados adicionales en la información disponible para esta conversión MLX, pero al ser una conversión de pesos, el rendimiento esperado es idéntico al del modelo original.

| Modelo | mAP en DocLayNet |
|---|---|
| heron-101 (RT-DETRv2 + ResNet101) | 78% |
| Modelo anterior de Docling | ~54% (estimado a partir de la mejora del 23,9%) |

*Nota: el valor del modelo anterior se deduce de la mejora porcentual indicada en el paper; no se proporciona el dato exacto en la información disponible.*

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de 76,7 M de parámetros, la inferencia requiere menos de 1 GB de VRAM en FP32 (unos 300 MB en FP16). Cabe en cualquier GPU moderna, incluidas las integradas.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente. En Apple Silicon, la versión MLX aprovecha la GPU unificada (M1/M2/M3/M4) y la Neural Engine.
- **Consumer GPU**: sí, funciona en GPUs de gama baja como GTX 1650, RTX 3050, etc. También puede ejecutarse en CPU (aunque más lento).
- **Opciones de despliegue**: al ser MLX, se integra con el ecosistema Docling (Python). También puede exportarse a ONNX o TensorRT para otros entornos, aunque esta conversión concreta está pensada para MLX.
- **Latencia y throughput**: no se han publicado cifras específicas para esta conversión. En una GPU Apple M2, se espera una inferencia de decenas de milisegundos por página (dependiendo de la resolución). En CPU, puede ser de cientos de milisegundos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | mAP DocLayNet | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| heron-101 (MLX) | RT-DETRv2 + ResNet101 | 76,7 M | 78% | Apache-2.0 | HuggingFace (MLX) |
| heron-101 (original) | RT-DETRv2 + ResNet101 | 76,7 M | 78% | Apache-2.0 | HuggingFace (PyTorch) |
| LayoutLMv3 (fine-tuned DocLayNet) | Transformer multimodal | ~368 M | ~70% (aprox.) | MIT | HuggingFace |
| YOLOv8 (fine-tuned DocLayNet) | CNN | ~11 M | ~65% (aprox.) | AGPL-3.0 | Ultralytics |

*Nota: los valores de LayoutLMv3 y YOLOv8 son aproximados y no se han verificado en la información proporcionada. Se incluyen como referencia cualitativa; para datos exactos, consultar sus respectivas publicaciones.*

## Limitaciones y advertencias

- **Modelo de detección, no de comprensión**: no genera texto ni interpreta el contenido semántico; solo localiza y clasifica regiones visuales.
- **Dependencia de la calidad de imagen**: páginas muy deformadas, con baja resolución o con ruido excesivo pueden degradar la precisión de las detecciones.
- **Cobertura de clases limitada**: el modelo reconoce un conjunto fijo de tipos de región (texto, tabla, figura, etc.); layouts muy inusuales o clases no contempladas pueden no detectarse correctamente.
- **Sesgo del corpus de entrenamiento**: al entrenarse sobre 150.000 documentos (mayoritariamente académicos y técnicos), puede tener un rendimiento inferior en documentos con estilos muy diferentes (por ejemplo, carteles, infografías o manuscritos).
- **Licencia Apache-2.0**: permite uso comercial sin restricciones, pero el modelo original se distribuye bajo la misma licencia; no hay cláusulas adicionales conocidas.
- **Formato MLX específico**: esta conversión solo es ejecutable en entornos que soporten MLX (macOS con Apple Silicon). Para otros entornos, debe usarse el modelo original en PyTorch o exportarse a otro formato.

## Enlaces

- [Modelo MLX en HuggingFace](https://huggingface.co/atkinschang/docling-layout-heron-101-mlx)
- [Modelo original en HuggingFace](https://huggingface.co/docling-project/docling-layout-heron-101)
- [Informe tecnico en arXiv](https://arxiv.org/abs/2509.11720)
- [Version HTML del informe](https://arxiv.org/html/2509.11720v1)
- [Catalogo de modelos de Docling](https://docling-project.github.io/docling/usage/model_catalog/)
