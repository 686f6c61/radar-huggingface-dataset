# pacoreyes/heron-physics-pdf-layout

## Resumen

`heron-physics-pdf-layout` es un modelo de deteccion de objetos (object detection) especializado en el analisis de maquetacion (document layout analysis) de PDFs del dominio de la fisica. Es un fine-tune del modelo `docling-project/docling-layout-heron`, que a su vez esta basado en la arquitectura RT-DETRv2, y ha sido desarrollado por el usuario de HuggingFace `pacoreyes` en el marco del Physics-LLM Project. El modelo conserva la misma cabeza de clasificacion y el mismo esquema de 17 clases que el modelo base; unicamente se han reajustado los pesos mediante fine-tuning sobre documentos cientificos.

El problema que resuelve es la deteccion automatica de regiones estructurales (texto, formulas, tablas, pies de pagina, figuras, notas al pie, etc.) en paginas de PDFs cientificos, un paso previo imprescindible para tareas de extraccion de contenido, conversion a formatos estructurados y construccion de pipelines RAG sobre literatura cientifica. El interes practico radica en su mejora sustancial sobre el modelo base en mAP y AP@0.5 dentro del dominio de la fisica, un nicho con una densidad inusualmente alta de formulas y notas al pie.

El modelo tiene 42.889.979 parametros totales y se distribuye en formato `safetensors` con licencia Apache-2.0. No es un modelo de lenguaje, por lo que no maneja ventana de contexto ni generacion de texto: procesa imagenes de paginas y devuelve cajas delimitadoras con su clase. El repositorio ocupa aproximadamente 0,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETRv2 (transformer de deteccion de objetos en tiempo real sobre backbone convolucional) |
| Parametros totales | 42.889.979 |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos, MoE) |
| Longitud de contexto | No aplica (modelo de deteccion de objetos sobre imagenes de pagina) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (la deteccion de maquetacion no depende del idioma del texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea RT-DETRv2 (Real-Time Detection Transformer v2), un detector de objetos que combina un backbone convolucional para la extraccion de caracteristicas con un decodificador transformer que genera predicciones de cajas y clases de forma directa, sin necesidad de supresion de no maximos (NMS) ni de anclas. La cabeza de clasificacion y el esquema de 17 clases son identicos a los del modelo base `docling-layout-heron`, por lo que el fine-tune no introduce ninguna clase nueva ni modifica el espacio de etiquetas.

El entrenamiento se realizo sobre 377 paginas procedentes de 40 PDFs del dominio de la fisica (articulos, actas de conferencias ICRC, tesis y capitulos de libro), etiquetadas manualmente mediante un protocolo de anotacion con dos modelos: uno anota y un segundo actua como juez independiente. La division se hizo por documento, sin que ningun documento aparezca en dos particiones: 249 paginas de entrenamiento, 61 de validacion y 67 de test. El procedimiento uso `transformers.Trainer` con optimizador AdamW, 20 epocas, tamano de lote de 2 y dos tasas de aprendizaje diferenciadas (1e-5 para el backbone y 1e-4 para el resto del modelo), con aumento de datos por volteo horizontal. No se mezclaron datos de replay del conjunto de entrenamiento original del modelo base (segun la propia model card).

## Capacidades

- Deteccion de regiones de maquetacion en paginas de PDF: el modelo localiza y clasifica bloques estructurales segun un esquema de 17 clases heredado de DocLayNet/Heron.
- Reconocimiento especifico de notas al pie (footnotes), una clase critica en documentos cientificos donde el modelo base rinde mal (21,4 % de precision).
- Deteccion de formulas, tablas, figuras, encabezados de seccion, titulos, pies de pagina y demas elementos tipicos de articulos y actas de conferencias.
- Procesamiento de documentos del dominio de la fisica: articulos, proceedings del ICRC, tesis y capitulos de libro.
- Integracion en pipelines de document understanding: la salida son cajas delimitadoras con clase, aptas para posteriores fases de extraccion (OCR, parseo de tablas, extraccion de formulas).
- No dispone de tool calling, function calling, razonamiento multi-paso, modo de pensamiento, vision generativa ni capacidades multilingues en el sentido de los modelos de lenguaje: es exclusivamente un detector de objetos.
- Capacidad de ejecucion en hardware modesto por su reducido numero de parametros (42,9 M).

## Casos de uso

- Digitalizacion de articulos de fisica: segmentar cada pagina para aislar texto, formulas y figuras antes de aplicar OCR o reconocimiento de formulas, aprovechando la deteccion afinada sobre este dominio.
- Construccion de pipelines RAG sobre literatura cientifica: extraer bloques de texto y tablas de PDFs de fisica para indexarlos en una base vectorial, usando las cajas detectadas para preservar la estructura del documento.
- Procesado de actas de conferencias (ICRC): separar encabezados, columnas de texto, tablas de datos experimentales y notas al pie en documentos con maquetacion densa.
- Conversion de tesis y capitulos de libro a formatos estructurados: transformar PDFs a HTML o Markdown preservando la jerarquia de secciones y la posicion de figuras y formulas.
- Extraccion automatizada de metadatos bibliograficos: localizar titulos, encabezados de seccion y pies de pagina para poblar repositorios academicos.
- Auditoria de la calidad de notas al pie en publicaciones: el modelo destaca especificamente en la clase footnote (F1 de 0,873), util para verificar la correcta atribucion de referencias y notas.
- Preprocesado para reconocimiento matematico: aislar regiones de formula para enviarlas despues a un modelo de OCR matematico (por ejemplo, conversion a LaTeX), reduciendo el area de procesamiento.
- Analisis de maquetacion comparado: estudiar la estructura tipica de documentos de fisica (densidad de formulas, uso de notas al pie) a partir de las detecciones agregadas.

## Benchmarks y rendimiento

Resultados sobre la particion de test (67 paginas), comparados con el modelo base `docling-layout-heron` (mAP y AP medidos sobre las mismas paginas):

| Modelo | mAP@[.5:.95] | AP@0.5 | Footnote AP | Footnote F1 |
|---|---|---|---|---|
| base (`docling-layout-heron`) | 0,705 | 0,835 | 0,741* | no disponible en la informacion proporcionada |
| **este modelo** | **0,841** | **0,894** | 0,659 | **0,873** |

*Segun la model card del autor, el AP de notas al pie del modelo base es enganoso: con un 21,4 % de precision, cuatro de cada cinco llamadas de footnote son incorrectas, y el valor alto solo refleja un buen comportamiento a lo largo de la curva precision-exhaustividad completa. Por ese motivo el F1 de notas al pie es una comparacion mas justa, y es donde este modelo supera claramente al base.

## Requisitos de hardware

Estimaciones derivadas del numero real de parametros (42.889.979); no proceden de mediciones publicadas por el autor y deben tomarse como orientativas:

- Peso de los pesos en memoria: aproximadamente 172 MB en FP32, 86 MB en FP16/BF16.
- VRAM para inferencia: muy reducida; los pesos de un modelo de 42,9 M de parametros ocupan menos de 200 MB, por lo que el grueso del consumo proviene de las activaciones y de la resolucion de las imagenes de entrada. Cabe holgadamente en tarjetas consumer con 4 GB o menos.
- GPU recomendadas: cualquier GPU moderna sirve, desde una GTX 1050/1650 hasta RTX 4090, A100 o H100. En la practica el modelo esta limitado por el rendimiento del backbone, no por la memoria.
- Ejecucion en CPU: viable para lotes pequenos, dado el reducido tamano del modelo; la latencia dependera del numero de nucleos y de la resolucion de entrada.
- Opciones de despliegue: la libreria indicada es `transformers`; tambien puede exportarse a ONNX y ejecutarse con ONNX Runtime. No aplica vLLM (no es un modelo de lenguaje). La integracion natural es dentro del pipeline de Docling.
- Latencia y throughput: no disponible (no se han publicado medidas en la informacion proporcionada).

## Comparativa con modelos similares

| Modelo | Parametros | Dominio | mAP@[.5:.95] (test del autor) | Licencia | Estado |
|---|---|---|---|---|---|
| `pacoreyes/heron-physics-pdf-layout` | 42,9 M | PDFs de fisica | 0,841 | Apache-2.0 | Disponible |
| `docling-project/docling-layout-heron` | no disponible en la informacion proporcionada | Layout general (DocLayNet/Heron) | 0,705 | Apache-2.0 (heredada) | Disponible |
| Otros detectores de layout (LayoutLMv3, DiT y similares) | no disponible | Layout general | no disponible | depende del modelo | no evaluados con estos datos |

La comparacion directa disponible es con el modelo base, sobre el que este fine-tune mejora el mAP@[.5:.95] en 0,136 puntos absolutos (de 0,705 a 0,841) y el AP@0.5 en 0,059 (de 0,835 a 0,894). No se dispone de resultados comparables frente a otros detectores de maquetacion.

## Limitaciones y advertencias

- Alcance restringido al dominio de la fisica: el autor indica explicitamente que no se ha evaluado ni se reclama generalizacion a maquetacion de documentos generales.
- Conjunto de entrenamiento muy reducido: 377 paginas de 40 PDFs, lo que limita la diversidad de estilos de maquetacion cubiertos.
- Rendimiento inferior al modelo base en la clase footnote si se mide por AP (0,659 frente a 0,741), aunque superior en F1 (0,873), segun la propia model card.
- Riesgo de degradacion ante maquetaciones no representadas en el conjunto de entrenamiento (por ejemplo, revistas con formatos atipicos o documentos escaneados de baja calidad).
- No redistribuye codigo de entrenamiento ni datos; solo se publican los pesos.
- Licencia Apache-2.0, heredada del modelo base, que permite uso comercial, pero conviene verificar las condiciones del modelo base `docling-layout-heron` de Docling al desplegarlo en produccion.
- Contador de descargas y likes a cero en el momento de la consulta, lo que indica ausencia de validacion independiente por parte de la comunidad.
- Al no ser un modelo de lenguaje, no ofrece generacion de texto, razonamiento ni comprension semantica; su salida se limita a cajas y clases, por lo que siempre requiere componentes adicionales (OCR, parsers) para tareas de extraccion de contenido.
- La model card presenta fragmentos de texto truncados (por ejemplo, en la descripcion del procedimiento de entrenamiento y en la tabla de resultados), de modo que algunos detalles no estan completos en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pacoreyes/heron-physics-pdf-layout
- Modelo base: https://huggingface.co/docling-project/docling-layout-heron
- Proyecto Docling (contexto del modelo base): https://github.com/docling-project/docling
- Otros enlaces (paper, blog o demo del autor): no disponibles en la informacion proporcionada.
