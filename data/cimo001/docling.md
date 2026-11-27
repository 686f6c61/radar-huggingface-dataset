# cimo001/docling

## Resumen

`cimo001/docling` es un paquete de modelos ONNX derivados del ecosistema Docling, orientado a la deteccion de layout y al reconocimiento de estructura de tablas en documentos. No se trata de un modelo de lenguaje generativo, sino de un conjunto de redes de vision (object detection y sequence decoding) empaquetadas para su ejecucion con `onnxruntime`. El autor, `cimo001`, publica una conversion a ONNX de los modelos originales de `docling-project`, manteniendo la licencia Apache-2.0.

El paquete incluye dos componentes: Docling-Layout-Heron, un detector de layout tipo DETR que identifica 17 clases de regiones en una pagina (tablas, titulos, encabezados, pies de pagina, formulas, listas, figuras, etc.), y TableFormer, un modelo encoder-decoder que reconstruye la estructura de una tabla en formato OTSL (filas, columnas, celdas fusionadas, cabeceras). Ambos se exportan con formas fijas, lo que simplifica el despliegue en produccion y elimina la necesidad de gestionar ejes dinamicos.

Su relevancia actual radica en que permite integrar el pipeline de conversion de documentos de Docling en entornos donde no se dispone de PyTorch o donde se prefiere una dependencia ligera como `onnxruntime`, incluyendo aceleracion por GPU mediante `onnxruntime-gpu`. Es un componente de infraestructura para pipelines de extraccion documental, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Docling-Layout-Heron: transformer tipo DETR para deteccion de objetos. TableFormer: encoder-decoder para reconocimiento de estructura de tablas |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible; el autor publica pesos en FP32 |
| Idiomas soportados | multilingual (etiqueta declarada; el modelo opera sobre imagenes, no sobre texto) |
| Licencia | Apache-2.0 (modelo base TableFormer: CDLA-Permissive-2.0 / Apache-2.0) |
| Formato de pesos | ONNX (`docling-layout-heron.onnx`, `tableFormer_encoder.onnx`, `tableFormer_decoder.onnx`, `tableFormer_box.onnx`) |

## Arquitectura y entrenamiento

Docling-Layout-Heron sigue la estela de los detectores DETR: procesa la imagen completa y emite un conjunto fijo de 300 consultas (queries) por imagen, cada una con una puntuacion de clase y una caja delimitadora. La entrada es una imagen RGB redimensionada a 640x640, normalizada a float32 en rango 0..1 y en formato CHW con dimension de lote, alimentando el tensor `pixel_values` de forma fija `[1, 3, 640, 640]`. La salida son `logits` de forma `[1, 300, 17]` (requieren sigmoide) y `pred_boxes` de forma `[1, 300, 4]` en formato `[centerX, centerY, width, height]` normalizado en 0..1. El modelo no aplica NMS internamente, por lo que el filtrado por umbral y la resolucion de solapamientos corren a cargo del integrador.

TableFormer se exporta en tres grafos con formas fijas. El encoder recibe la imagen de la tabla recortada, redimensionada a 448x448, normalizada con media y desviacion tipica especificas y transpuesta a `[channel, width, height]`, y produce `memory` `[784, 1, 512]` y `box` `[1, 784, 512]`. El decoder es autorregresivo y se invoca una vez por etiqueta, con entradas `tag`, `position`, `memory` y un `buffer` de estado `[6, 1024, 1, 512]`, emitiendo `logit` `[1, 13]`, `hidden` `[1, 512]` y `state` `[6, 1, 1, 512]`. El decodificado es greedy: arranca en `<start>`, escribe el estado en el buffer tras cada llamada y se detiene en `<end>` o tras 1024 etiquetas. El tercer grafo, `tableFormer_box`, recibe `box` y `hidden` `[32, 512]` (con relleno de ceros) y devuelve `class` `[32, 3]` y `coordinate` `[32, 4]`.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o ajuste fino preferencial, dado que son modelos de vision y la model card no los detalla.

## Capacidades

- Deteccion de layout de pagina completa con 17 clases de region: `caption`, `footnote`, `formula`, `list_item`, `page_footer`, `page_header`, `picture`, `section_header`, `table`, `text`, `title`, entre otras.
- Emision de hasta 300 cajas por imagen con puntuacion de confianza por clase.
- Reconocimiento de estructura de tablas en formato OTSL: celdas con contenido (`fcel`), celdas vacias (`ecel`), fusiones horizontales (`lcel`), verticales (`ucel`), bidireccionales (`xcel`), cabeceras de columna (`ched`), cabeceras de fila (`rhed`), filas de seccion (`srow`) y fin de fila (`nl`).
- Generacion de cajas por celda en el espacio de la tabla recortada, incluyendo celdas fusionadas en varias columnas.
- Ejecucion en CPU y GPU mediante `onnxruntime` / `onnxruntime-gpu`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un componente de vision, no un modelo de lenguaje.
- No incluye OCR: la lectura del texto debe realizarse con un modelo aparte y asignarse a las celdas por solapamiento de cajas.

## Casos de uso

- Digitalizacion de facturas y albaranes: Docling-Layout-Heron localiza las regiones de tabla en la pagina completa (con puntuaciones superiores a 0.95 en los ejemplos publicados) y TableFormer reconstruye la rejilla; el texto se asigna despues con OCR a cada celda mediante solapamiento de cajas.
- Extraccion de tablas de informes financieros y memorias anuales: el pipeline permite separar titulos, encabezados de seccion y tablas para conservar la jerarquia documental al convertir a Markdown o JSON.
- Conversion de articulos cientificos a formatos estructurados: el detector identifica formulas, figuras, pies de pagina y listas, lo que facilita la preservacion semantica en la exportacion.
- Procesamiento por lotes en servidores sin PyTorch: al estar en ONNX con formas fijas, el modelo se puede ejecutar con `onnxruntime` en entornos minimos, contenedores ligeros o dispositivos con aceleracion limitada.
- Enriquecimiento de pipelines RAG documentales: la deteccion de layout permite trocear el documento por regiones semanticas antes de la indexacion, mejorando la calidad de recuperacion en bases de conocimiento.
- Preprocesado para OCR selectivo: en lugar de aplicar OCR a la pagina completa, se ejecuta solo sobre las cajas de texto, tabla, titulo o pie de pagina detectadas, reduciendo coste computacional y ruido.
- Validacion de calidad de digitalizaciones: la confianza por caja permite marcar paginas con layout anomalo o tablas mal detectadas para revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye salidas de ejemplo sobre imagenes de prueba (puntuaciones de deteccion de hasta 0.9567 para una tabla y una rejilla OTSL de 12 filas para una tabla de ejemplo), que no constituyen una evaluacion sistematica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de pesos FP32 con formas fijas (entrada 640x640 para layout y 448x448 para TableFormer), el consumo es moderado y apto para GPU de gama media.
- GPU recomendadas: cualquier GPU compatible con CUDA y `onnxruntime-gpu`; no se especifican modelos concretos en la documentacion.
- Cabe en GPU de consumo: si, al ser modelos de vision de entrada fija y pesos FP32; no se detalla el umbral exacto de memoria.
- Opciones de despliegue: `onnxruntime` (CPU) y `onnxruntime-gpu` (GPU); el autor proporciona un `helper.py` por carpeta para configurar proveedor, hilos y opciones de memoria, y un `example.py` con el pipeline completo de preprocesado, inferencia y postprocesado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cimo001/docling` (este) | Deteccion de layout + estructura de tablas en ONNX | Imagen fija 640x640 / 448x448 | 300 cajas con 17 clases / secuencia OTSL | Apache-2.0 | Hugging Face, ONNX |
| `docling-project/docling-layout-heron` | Deteccion de layout (original, sin exportar) | Imagen | Cajas con clases | Apache-2.0 | Hugging Face |
| `docling-project/docling-models` (TableFormer) | Reconocimiento de estructura de tablas (original) | Recorte de tabla | Estructura OTSL | CDLA-Permissive-2.0 / Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento numerico frente a alternativas como LayoutLMv3, PubLayNet-based detectors o Table Transformer, por lo que la comparacion se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo no realiza OCR: la extraccion de texto requiere un modelo adicional y la asignacion a celdas se hace por solapamiento de cajas, lo que puede fallar en tablas densas o con texto rotado.
- El detector no aplica NMS: una misma caja puede aparecer con dos etiquetas distintas, y el integrador debe filtrar por umbral (0.5 en el ejemplo) y resolver solapamientos.
- Formas de entrada fijas: no admite imagenes de resolucion variable sin reescalado previo, lo que puede degradar la deteccion en documentos con layouts muy densos o tipografias pequenas.
- TableFormer solo procesa un recorte de tabla por invocacion; las tablas que ocupan varias paginas o que estan partidas deben gestionarse a nivel de pipeline.
- El decodificado es greedy y con limite de 1024 etiquetas, lo que puede truncar tablas extremadamente grandes.
- Riesgo de sesgo en el dataset de entrenamiento original: no se documenta la composicion, por lo que no se puede evaluar la cobertura por idioma, tipo de documento o region geografica.
- La licencia Apache-2.0 del paquete convive con la licencia CDLA-Permissive-2.0 del TableFormer original; conviene verificar las condiciones de esta ultima antes de un uso comercial del componente de tablas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria significativa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cimo001/docling
- Modelo base de layout: https://huggingface.co/docling-project/docling-layout-heron
- Modelos base de Docling (TableFormer): https://huggingface.co/docling-project/docling-models
- Imagen de prueba de pagina completa: https://github.com/cimo/One_workspace/blob/main/file/test/invoice/jp_1.jpg
- Imagen de prueba de tabla: https://github.com/cimo/One_workspace/blob/main/file/test/table/1.jpg
