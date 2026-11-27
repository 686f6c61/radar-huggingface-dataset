# cimo001/microsoft

## Resumen

`cimo001/microsoft` es un repositorio de Hugging Face que empaqueta en formato ONNX el modelo `table-transformer-structure-recognition-v1.1-all`, un detector de estructura de tablas basado en la arquitectura Table Transformer de Microsoft Research. El autor del repositorio es el usuario `cimo001`, no Microsoft: se trata de una conversión a ONNX de un modelo preexistente, publicada con licencia MIT y pensada para su ejecución con `onnxruntime` en CPU o GPU. El pipeline declarado es `object-detection` y el tamaño del repositorio es de aproximadamente 0,1 GB.

El modelo resuelve un problema concreto dentro de los pipelines de extracción documental: dada una imagen recortada de una tabla, identifica sus filas, columnas, cabeceras y celdas combinadas, devolviendo cajas delimitadoras con puntuaciones de confianza. Esto permite reconstruir la rejilla lógica de la tabla y, combinándolo con un modelo de reconocimiento de texto, digitalizar tablas de PDF escaneados o imágenes.

La relevancia de esta ficha es limitada y debe enmarcarse con precisión: no se trata de un modelo de lenguaje ni de un modelo fundacional nuevo, sino de un artefacto de despliegue (una exportación ONNX) de un detector de objetos especializado. La información disponible en la model card es escasa y se limita a instrucciones de uso, formato de entrada/salida y una captura de resultados de ejemplo; no se publican detalles de entrenamiento, benchmarks ni comparativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Table Transformer (detector de objetos tipo DETR adaptado a estructura de tablas); detalles completos no disponibles en la informacion proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto); entrada: imagen de una sola tabla redimensionada a 800 px en el lado mayor |
| Tipos de cuantizacion | FP32 (unico peso publicado: `model.onnx`) |
| Idiomas soportados | multilingual (segun metadatos; el modelo opera sobre imagenes, no sobre texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`) |
| Tarea | object-detection (reconocimiento de estructura de tablas) |
| Clases de salida | 7: `table`, `table column`, `table row`, `table column header`, `table projected row header`, `table spanning cell`, `no object` |
| Entradas | `pixel_values`, forma dinamica, RGB, CHW con dimension de batch |
| Salidas | `logits` `[1, 125, 7]` (sin softmax) y `pred_boxes` `[1, 125, 4]` en formato `[centerX, centerY, width, height]` normalizado 0..1 |
| Queries por imagen | 125 |
| NMS | No incluido en el modelo; el filtrado por umbral (0,5 en el ejemplo) se hace en postproceso |
| Libreria | onnxruntime (CPU) / onnxruntime-gpu |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La model card identifica el modelo empaquetado como `table-transformer-structure-recognition-v1.1-all`, es decir, la variante de Table Transformer de Microsoft Research especializada en reconocimiento de estructura de tablas. La arquitectura subyacente es un transformer con mecanismo de atención sobre un conjunto fijo de consultas (queries), en la línea de DETR: el modelo emite 125 predicciones por imagen, cada una con una distribución de clases de 7 categorías y una caja delimitadora normalizada, sin supresión de no máximos interna.

El preprocesado documentado es concreto: se recorta una única tabla (no una página completa), se redimensiona la imagen RGB para que el lado mayor mida 800 px manteniendo la relación de aspecto, se escala a 0..1 y se normaliza con media y desviación típica de ImageNet, en formato CHW con dimensión de batch. Las filas y columnas se devuelven como bandas de ancho completo y alto completo respectivamente; las celdas son sus intersecciones, y las cajas de clase `table spanning cell` marcan las celdas que deben fusionarse.

No se dispone de información sobre el número de tokens o imágenes de entrenamiento, la composición del dataset, ni si hubo ajuste fino con RLHF/DPO (improcedente en un detector de objetos). Tampoco se detalla en la información proporcionada ninguna innovación técnica adicional más allá de la propia formulación DETR-like del modelo original.

## Capacidades

- Detección de estructura de tablas sobre una imagen recortada de una sola tabla.
- Localización de filas (`table row`) y columnas (`table column`) como bandas de ancho y alto completos.
- Detección de cabeceras de columna (`table column header`) y de cabeceras de fila proyectadas (`table projected row header`).
- Detección de celdas combinadas (`table spanning cell`), lo que permite reconstruir fusiones de celdas.
- Detección de la tabla completa como objeto (`table`).
- Salida con puntuaciones de confianza por caja, filtrables por umbral en postproceso.
- Ejecución en CPU o GPU mediante `onnxruntime` / `onnxruntime-gpu`, con forma de entrada dinámica.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta razonamiento multi-paso ni agentes: es un detector de objetos de un solo paso.
- No tiene capacidades de generación de texto, código, matemáticas, visión general, audio ni modo de razonamiento.
- El soporte multilingüe declarado en los metadatos es irrelevante en la práctica, ya que el modelo procesa píxeles y no texto.

## Casos de uso

- Digitalización de tablas en PDF escaneados: se recorta cada tabla de la página, se pasa al modelo para obtener filas, columnas y celdas combinadas, y se combina con un OCR para reconstruir la tabla como CSV o JSON. Es adecuado porque devuelve la rejilla lógica, no solo el texto.
- Extracción de tablas financieras: estados de resultados y balances en informes anuales escaneados, donde las celdas combinadas y las cabeceras de columna son frecuentes; las clases `table spanning cell` y `table column header` cubren exactamente esos casos.
- Ingesta de facturas y albaranes: detección de la estructura de la tabla de líneas de detalle antes de aplicar reglas de extracción de campos, lo que reduce errores de alineación entre columnas.
- Automatización de procesos de back office: integración del ONNX en un servicio de `onnxruntime` para procesar lotes de imagenes de tablas y volcar la estructura a un sistema de gestión documental.
- Investigación en reconocimiento de documentos: uso como componente base para experimentar con pipelines de table structure recognition, al ser una exportación ONNX ligera (0,1 GB) y con licencia MIT.
- Despliegue en entornos sin GPU: al ejecutarse con `onnxruntime` en CPU y FP32, encaja en servidores modestos o en el navegador mediante runtime ONNX, siempre que se acepte la latencia de un transformer sobre una imagen de 800 px.
- Preprocesado para modelos de lenguaje: convertir tablas de documentos a Markdown o texto estructurado antes de pasarlas a un LLM, usando este detector para obtener la rejilla y un OCR para el contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye una captura de salida de ejemplo sobre `Table_1.jpg` con cinco detecciones de `table column` y puntuaciones entre 0,999050 y 0,999784, lo que no constituye una evaluación sistemática.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio pesa 0,1 GB y el peso es FP32, por lo que la huella del modelo es del orden de decenas o pocos cientos de MB, pero no se especifica el número exacto de parámetros.
- GPU recomendadas: no disponibles en la información proporcionada. El modelo puede ejecutarse con `onnxruntime-gpu` en cualquier GPU compatible con el proveedor CUDA de ONNX Runtime.
- GPU de consumo: por el tamaño del repositorio (0,1 GB), es previsible que quepa en GPUs de consumo como RTX 3060 o superiores, aunque no se confirma en la documentación.
- CPU: soportado explícitamente mediante `onnxruntime` con selección de proveedor, hilos y opciones de memoria configurables en `src/helper.py`.
- Opciones de despliegue: `onnxruntime` (CPU) y `onnxruntime-gpu` (GPU). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Dependen del hardware, del proveedor de ejecución y del tamaño de la imagen de entrada.
- Dependencias del ejemplo: `onnxruntime`, `opencv-python` y `numpy`.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto / entrada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `cimo001/microsoft` (este) | Reconocimiento de estructura de tablas | no disponible | Imagen de una tabla, lado mayor 800 px | MIT | ONNX | Hugging Face |
| `microsoft/table-transformer-structure-recognition-v1.1-all` | Reconocimiento de estructura de tablas | no disponible en la informacion proporcionada | Imagen de una tabla | no disponible en la informacion proporcionada | safetensors / PyTorch (modelo original) | Hugging Face |
| `microsoft/table-transformer-detection` | Detección de tablas en página completa | no disponible en la informacion proporcionada | Imagen de página completa | no disponible en la informacion proporcionada | safetensors / PyTorch | Hugging Face |

La comparación relevante es con el modelo original de Microsoft, del que este repositorio es una conversión a ONNX: la diferencia principal es el formato de pesos y la dependencia de `onnxruntime` en lugar de PyTorch. No se dispone de datos de rendimiento comparativo entre ambos en la información proporcionada.

## Limitaciones y advertencias

- El modelo espera un recorte de una sola tabla, no una página completa; alimentarlo con una página entera degradará los resultados.
- No incluye supresión de no máximos: es responsabilidad del postproceso filtrar por umbral y resolver solapamientos.
- La salida está limitada a 125 queries por imagen; tablas con más de 125 elementos estructurales pueden quedar truncadas.
- No reconoce el contenido textual de las celdas: solo la estructura. Requiere un OCR o un modelo de reconocimiento de texto adicional.
- Riesgo de alucinación estructural: al ser un detector, puede predecir filas, columnas o celdas combinadas inexistentes, especialmente en tablas con líneas tenues, escaneos de baja calidad o tablas sin bordes.
- Sesgos: no se documentan sesgos conocidos, pero el rendimiento puede degradarse en idiomas, alfabetos o estilos de tabla poco representados en los datos de entrenamiento originales, que no se detallan.
- Licencia MIT: permite uso comercial y modificación, pero el autor del repositorio no es Microsoft; conviene verificar la licencia del modelo original de Microsoft antes de un despliegue en producción.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-27): no hay evidencia de uso en producción ni de mantenimiento.
- La model card no documenta el proceso de conversión a ONNX, la equivalencia numérica con el modelo original ni la versión exacta del checkpoint de origen.
- El campo `base_model: microsoft` es ambiguo y no identifica un checkpoint concreto.
- No hay información sobre latencia, throughput ni consumo de memoria medidos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cimo001/microsoft
- Imagen de prueba citada en la model card: https://github.com/cimo/One_workspace/blob/main/file/test/table/1.jpg
- Modelo original de Microsoft (referencia por el nombre del checkpoint): https://huggingface.co/microsoft/table-transformer-structure-recognition-v1.1-all
- Documentación de ONNX Runtime: https://onnxruntime.ai/docs/
- Paper de Table Transformer (referencia de la arquitectura): no disponible en la información proporcionada.
