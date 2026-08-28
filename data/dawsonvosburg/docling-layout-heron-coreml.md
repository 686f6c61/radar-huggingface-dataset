# dawsonvosburg/docling-layout-heron-coreml

## Resumen

El modelo `docling-layout-heron-coreml` es una conversión a Core ML del detector de layout de documentos `docling-layout-heron` de Docling, realizada por el usuario dawsonvosburg. Se trata de un modelo de detección de objetos basado en RT-DETRv2 que identifica los componentes estructurales de una página (títulos, párrafos, tablas, figuras, etc.) y devuelve sus cajas delimitadoras. La conversión mantiene los pesos originales sin reentrenamiento y está pensada para su ejecución nativa en dispositivos Apple mediante el framework Core ML.

El modelo se distribuye en dos formatos: un paquete ML Program portable (`.mlpackage`) y una versión precompilada (`.mlmodelc`) para su uso directo con `docling.rs`. Requiere macOS 15+ o iOS/iPadOS 18+ y funciona con precisión FP16. Es una alternativa a ONNX Runtime para ejecutar el análisis de layout de Docling en el ecosistema Apple, con una latencia notablemente inferior en las pruebas del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETRv2 (detector de objetos basado en transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija 640x640) |
| Tipos de cuantizacion | FP16 (pesos y computo en Core ML) |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML ML Program (`.mlpackage`) y compilado (`.mlmodelc`) |

Nota: el modelo base `docling-layout-heron` puede tener otras cuantizaciones (por ejemplo, ONNX INT8), pero esta conversion especifica usa FP16.

## Arquitectura y entrenamiento

El modelo base es un detector de objetos RT-DETRv2, una arquitectura de transformer con decodificador DETR que predice directamente cajas y clases sin necesidad de anclas. Fue entrenado por el equipo de Docling para analisis de layout de documentos, alcanzando 78% mAP en el conjunto de validacion segun el paper tecnico (arXiv:2509.11720). La conversion a Core ML no modifica los pesos; solo se adaptaron tres operaciones para compatibilidad con coremltools 8.3: descomposicion de `grid_sample`, casting escalar para un tensor trazado de un elemento y reescritura de generacion de anclas. El modelo acepta una entrada fija de 640x640 pixeles y produce 300 detecciones por imagen, con 17 clases de layout definidas en `coreml_config.json`.

## Capacidades

- Deteccion de componentes de layout en paginas de documentos: titulos, parrafos, tablas, figuras, listas, etc. (17 clases).
- Salida cruda de logits y cajas normalizadas, lo que permite integrar postprocesado personalizado.
- Compatible con el ecosistema Docling, especialmente con `docling.rs` mediante la feature `coreml-native`.
- Ejecucion nativa en dispositivos Apple (GPU, CPU y Neural Engine) con baja latencia: 12.31 ms de mediana en Apple Silicon segun la validacion del autor.
- No requiere normalizacion adicional de entrada (solo escalado a [0,1] y redimensionado a 640x640 con interpolacion bilineal).

## Casos de uso

- **Conversion de documentos a formatos estructurados**: integrar el modelo en un pipeline de Docling para extraer la estructura de paginas escaneadas o PDF y generar Markdown, JSON o HTML con la jerarquia de titulos, parrafos y tablas.
- **OCR con contexto de layout**: combinar la deteccion de regiones con un motor OCR para mejorar la precision de la extraccion de texto, limitando el reconocimiento a las areas detectadas.
- **Analisis de documentos en aplicaciones iOS/macOS**: usar el modelo directamente en una app nativa de Apple para clasificar y segmentar documentos capturados con la camara, gracias a su formato Core ML.
- **Automatizacion de procesos de negocio**: extraer tablas y figuras de informes financieros o facturas para alimentar bases de datos o sistemas de BI, usando la salida de cajas para recortar y procesar cada region.
- **Indexacion y busqueda documental**: generar metadatos de layout (posicion de titulos, tablas, etc.) para mejorar la busqueda semantica y la navegacion en grandes repositorios de documentos.
- **Preprocesado para modelos de lenguaje**: alimentar un LLM con la estructura de la pagina (titulos, secciones) para resumir o responder preguntas sobre documentos largos, evitando el ruido de texto no estructurado.

## Benchmarks y rendimiento

La model card del autor incluye una validacion de la conversion frente al modelo ONNX FP32 original, con 12 entradas (9 paginas reales y 3 tensores aleatorios). A un umbral de 0.3 y con emparejamiento greedy por clase (IoU > 0.5):

| Backend | Detecciones coincidentes | Faltantes vs FP32 | Extra vs FP32 | IoU media | IoU minima |
|---|---:|---:|---:|---:|---:|
| Core ML FP16 | 239 | 0 | 0 | 0.9886 | 0.8283 |
| ONNX INT8 | 224 | 15 | 11 | 0.9813 | 0.6798 |

Latencia mediana (batch 1, 20 ejecuciones en Apple Silicon, macOS 26.5):

| Backend | Latencia (ms) |
|---|---:|
| Core ML FP16 (ComputeUnit.ALL) | 12.31 |
| ONNX FP32 CPU | 237.06 |
| ONNX INT8 CPU | 161.73 |

El modelo base `docling-layout-heron` (o su variante heron-101) alcanza 78% mAP con 28 ms/imagen en una NVIDIA A100, segun el paper tecnico. Estos datos corresponden al modelo original, no a esta conversion.

## Requisitos de hardware

- Dispositivos Apple con macOS 15+, iOS/iPadOS 18+, macCatalyst 18+, tvOS 18+, visionOS 2+ o watchOS 11+.
- Tamano del modelo: aproximadamente 0.1 GB (repo), por lo que cabe en cualquier dispositivo con al menos 256 MB de RAM libre.
- Se recomienda usar `ComputeUnit.ALL` para aprovechar GPU y Neural Engine; en las pruebas, `CPU_AND_NE` resulto mas lento.
- Para uso con `docling.rs`, se necesita una compilacion con la feature `coreml-native` y el artefacto colocado en la ruta esperada.
- No requiere GPU NVIDIA; es exclusivo para el ecosistema Apple.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamano | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| `docling-layout-heron-coreml` (este) | RT-DETRv2 | no disponible | 640x640 fijo | Apache-2.0 | Core ML |
| `docling-layout-heron` (original) | RT-DETRv2 | no disponible | 640x640 fijo | Apache-2.0 | PyTorch/ONNX |
| `docling-layout-heron-101` | RT-DETRv2 (variante) | no disponible | 640x640 fijo | Apache-2.0 | PyTorch/ONNX |

No se dispone de comparacion con otros modelos de analisis de layout (p. ej., LayoutLMv3) en la informacion proporcionada.

## Limitaciones y advertencias

- Entrada fija de 640x640 pixeles y batch fijo de 1; no admite tamanos dinamicos ni procesamiento por lotes.
- Las salidas son crudas (logits y cajas normalizadas); el postprocesado (sigmoid, umbral, conversion a XYXY) debe implementarse externamente.
- El artefacto `.mlmodelc` precompilado fue generado con Xcode 26.6; si no carga en un sistema con una version anterior, se debe usar el `.mlpackage` para compilar localmente.
- La validacion de la conversion se realizo con un conjunto pequeno (12 entradas) y solo busca detectar desviaciones de conversion, no re-evaluar la precision del modelo.
- El modelo hereda las limitaciones del modelo base de Docling: posibles sesgos en los datos de entrenamiento, riesgo de errores en documentos poco comunes o con disenos atipicos, y falta de soporte para idiomas especificos (aunque el layout es independiente del idioma).
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener la atribucion y citar el trabajo original (paper y modelo base).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dawsonvosburg/docling-layout-heron-coreml
- Modelo base: https://huggingface.co/docling-project/docling-layout-heron
- Paper tecnico: https://arxiv.org/abs/2509.11720
- Repositorio Docling: https://github.com/docling-project/docling
- Mirror del modelo base en GitHub: https://github.com/babbarc/docling-layout-heron
