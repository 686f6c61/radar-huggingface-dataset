# CarbonResearchLabs/fullerene-3M

## Resumen

Fullerene 3M es un conjunto de cuatro redes neuronales pequenas desarrolladas por Carbon Research Labs como parte del motor OCR Carbon-OCR, escrito en C++ y CUDA. En total suma 2.774.014 parametros entrenados desde cero, y su funcion es leer paginas escaneadas, fotografias de documentos y PDFs, convirtiendolas en texto, HTML, Markdown y JSON con cajas delimitadoras, orden de lectura, etiquetas de bloque y celdas de tabla. El conjunto cubre orientacion de pagina, deteccion de lineas y figuras, reconocimiento de lineas en alfabetos latino, cirilico y griego, y ordenacion/estructura de bloques.

El modelo resuelve el problema del OCR clasico en documentos complejos: Tesseract y motores de lineas similares solo devuelven texto plano, mientras que Fullerene 3M produce estructura (tablas, encabezados, listas, notas al pie) directamente. Segun la model card, en las 2.937 paginas de OmniParseBench obtiene una puntuacion global de 43,5 frente a 5,9 de Tesseract 5.5, y procesa 5,0 veces mas paginas por segundo en un solo nucleo de CPU.

Es relevante por su enfoque: cuatro redes diminutas (entre 338.669 y 1.511.104 parametros) que caben en CPU y GPU consumer, distribuidas en formato ONNX (FP32 y FP16), lo que permite despliegue ligero sin infraestructura pesada. La licencia es propia (carbon-ocr-openrail-ams), no estandar, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cuatro redes neuronales independientes (orient, det, rec-latin, order); detalles de capas no disponibles |
| Parametros totales | 2.774.014 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo OCR por pagina, no modelo de lenguaje) |
| Tipos de cuantizacion | ONNX FP32 y ONNX FP16 |
| Idiomas soportados | en, ru, el (alfabetos latino, cirilico y griego) |
| Licencia | carbon-ocr-openrail-ams (licencia propia, enlace a LICENSE-WEIGHTS.md) |
| Formato de pesos | ONNX (orient.onnx, orient.fp16.onnx y equivalentes) |

Desglose por submodelo:

| Submodelo | Funcion | Parametros | Entrada | Salida |
|---|---|---|---|---|
| orient | Orientacion de pagina | 338.669 | Miniatura 512x512 en gris, mapa de tinta | 13 clases (12 bins de 30 grados + CJK vertical) |
| det | Deteccion de lineas y figuras | 442.564 | Pagina en gris, lado largo 1024, H y W multiplos de 32 | 4 mapas a stride 2 |
| rec-latin | Lectura de lineas latinas, cirilicas y griegas | 1.511.104 | Recorte de linea 32 x W, mapa de tinta | 800 clases CTC por 4 px |
| order | Orden de lectura, etiquetas y tablas | 481.677 | 16 caracteristicas por linea | Sucesor, mismo-bloque, fila, columna, celda y 13 etiquetas |

## Arquitectura y entrenamiento

El conjunto se compone de cuatro redes entrenadas desde cero, cada una con una tarea especializada. `orient` clasifica la orientacion de la pagina en 12 bins de 30 grados mas una clase para CJK vertical, con un umbral de giro de 0,65 almacenado en los metadatos del modelo. `det` produce mapas de deteccion a stride 2 (logit de banda central, distancias superior e inferior, logit de figura) para localizar lineas de texto y elementos graficos. `rec-latin` es un reconocedor CTC que procesa recortes de linea de 32 x W pixeles y emite 800 clases por cada 4 px, con la clase 0 reservada para el blank. `order` opera sobre 16 caracteristicas geometricas y textuales por linea para predecir sucesion, pertenencia a bloque, filas y columnas de tabla, celdas y 13 etiquetas de bloque (Text, Section-Header, Page-Header, Page-Footer, List-Group, Table, Caption, Footnote, Table-Of-Contents, Form, Picture, Formula, Other).

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO; al ser un modelo OCR, el entrenamiento seria supervisado sobre pares imagen-texto. La innovacion destacable es la division en cuatro redes muy pequenas que evitan un router de scripts (todas las lineas pasan por `rec-latin`) y la integracion de orden de lectura y estructura de tablas en un modelo de 481.677 parametros, con fallback a XY-cut cuando `order` no esta seguro. El formato ONNX FP16 se comporta de forma equivalente al FP32 en CPU (33,4 tests superados en ambos casos).

## Capacidades

- OCR de documentos escaneados, fotografias de documentos y PDFs.
- Salida en texto, HTML, Markdown, JSON, hOCR, ALTO y PDF.
- Cajas delimitadoras por linea y bloque, con orden de lectura.
- Etiquetado de 13 tipos de bloque (encabezados, listas, tablas, leyendas, notas al pie, formularios, formulas, figuras, etc.).
- Extraccion de estructura de tablas (filas, columnas y celdas).
- Deteccion de orientacion y deskew de pagina.
- Deteccion de lineas con segunda pasada para texto muy pequeno.
- Reconocimiento en alfabetos latino, cirilico y griego (en, ru, el).
- Ejecucion en CPU (FP32 y FP16) y en GPU NVIDIA via TensorRT.
- API Python (`carbon_ocr.Engine`) y CLI (`carbon-ocr ocr`).
- No dispone de tool calling, agentes ni razonamiento multi-step; es un modelo image-to-text especializado.

## Casos de uso

- Digitalizacion masiva de archivos escaneados: el modelo procesa lotes de imagenes o PDFs con `carbon-ocr ocr scans/*.png --device cuda` y devuelve HTML/Markdown estructurado, adecuado para ingestion en sistemas de gestion documental gracias a su velocidad (5,0 veces mas paginas por segundo que Tesseract en un nucleo).
- Extraccion de tablas de facturas e informes: el submodelo `order` predice filas, columnas y celdas, permitiendo reconstruir tablas en HTML o JSON sin post-procesado manual, algo que Tesseract no ofrece (0,0 en tests de tablas).
- Procesamiento de documentos multilingues en cirilico y griego: `rec-latin` cubre latin, cirilico y griego en un solo reconocedor, util para corpus en ruso y griego (48,0 en tests multilingues frente a 20,0 de Tesseract).
- Indexacion de PDFs para RAG: la salida en Markdown con bloques etiquetados y orden de lectura facilita trocear documentos respetando secciones, listas y tablas antes de indexarlos en un pipeline de recuperacion.
- Correccion de orientacion y deskew en escaneos de produccion: `orient` detecta paginas giradas (57,4 en paginas rotadas y skewed frente a 17,3 de Tesseract) y aplica el giro antes de la deteccion, reduciendo fallos en alimentadores automaticos de escaner.
- Digitalizacion de formularios y documentos administrativos: las etiquetas Form, Table-Of-Contents y Page-Header/Footer permiten separar campos y estructura en documentos oficiales con diseños heterogeneos.
- Despliegue en hardware modesto: al ser cuatro redes de menos de 1,6 M parametros en ONNX, puede ejecutarse en CPU de servidor o en GPU consumer, util para entornos sin acceso a aceleradores de gran escala.

## Benchmarks y rendimiento

Resultados en las 2.937 paginas de OmniParseBench, grader `omni-parse-bench` 1.2.0 (scorer `unit_tests`), puntuaciones sobre 100:

| Metrica | fullerene-3M | fullerene-3M FP16 CPU | Tesseract 5.5 |
|---|---|---|---|
| Headline (media de tres familias) | 43,5 | 43,5 | 5,9 |
| Text (8.499 tests) | 26,2 | 26,2 | 17,8 |
| Tables (5.386 tests) | 23,6 | 23,7 | 0,0 |
| Layout (2.403 tests) | 80,6 | 80,5 | 0,0 |
| Paginas leidas (fallidas); cobertura | 2.937 (0); 1,0000 | 2.937 (0); 1,0000 | 2.937 (0); 1,0000 |

Comparativa por tipo de documento (fullerene-3M frente a Tesseract 5.5): fotos de documentos 67,9 frente a 17,3; paginas rotadas y skewed 57,4 frente a 17,3; paginas reales 57,4 frente a 25,8; paginas multilingues 48,0 frente a 20,0; documentos ParseBench 70,3 frente a 48,6. Leido como motor de lineas (sus lineas como parrafos), fullerene-3M obtiene 26,6 en texto. En FP16 sobre CPU supera 33,4 tests totales, igual que FP32. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible en la model card; por el tamano (2,77 M parametros totales), el conjunto de pesos es del orden de decenas de MB, por lo que la huella de memoria es muy reducida.
- GPU recomendadas: cualquier GPU NVIDIA compatible con TensorRT (`--device cuda`); no se especifican modelos concretos (A100, H100, RTX 4090).
- Cabe en GPU consumer: si, dado el reducido numero de parametros; tambien funciona en CPU (FP32 y FP16).
- Opciones de despliegue: Carbon-OCR (CLI `carbon-ocr` y API Python `carbon_ocr.Engine`), con ejecucion en CPU o GPU NVIDIA via TensorRT. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 5,0 veces mas paginas por segundo que Tesseract 5.5 en un solo nucleo de CPU (seis procesos worker, paginas renderizadas a 200 dpi). No se proporcionan cifras absolutas de latencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Estructura de salida |
|---|---|---|---|---|---|
| Fullerene 3M | OCR (4 redes ONNX) | 2.774.014 | no disponible | carbon-ocr-openrail-ams | Texto, HTML, Markdown, JSON, hOCR, ALTO, PDF con cajas y bloques |
| Tesseract 5.5 | OCR clasico | no disponible | no disponible | Apache 2.0 (estandar) | Texto plano por lineas |
| Otros OCR neuronales (p. ej. basados en transformers) | OCR/VLM | no disponible | no disponible | variable | Variable |

Datos comparativos disponibles: en OmniParseBench, Fullerene 3M obtiene 43,5 de headline frente a 5,9 de Tesseract 5.5, 26,2 frente a 17,8 en texto, y 23,6/80,6 frente a 0,0/0,0 en tablas y layout. No se dispone de comparativas con otros motores OCR neuronales en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no estandar (carbon-ocr-openrail-ams): es necesario revisar LICENSE-WEIGHTS.md antes de cualquier uso comercial; no es una licencia open source reconocida.
- Cobertura limitada a tres idiomas (en, ru, el) y tres alfabetos (latino, cirilico, griego); no hay router de scripts, por lo que otros alfabetos no estan soportados.
- Es un modelo OCR, no un modelo de lenguaje: no realiza razonamiento, generacion libre, tool calling ni agentes.
- Riesgo de errores de reconocimiento en texto muy pequeno, manuscritos o tipografias atipicas; la deteccion incluye una segunda pasada para texto pequeno, pero no se documentan limites concretos.
- El orden de lectura y la estructura de tablas dependen del submodelo `order` (481.677 parametros), con fallback a XY-cut cuando no esta seguro; casos ambiguos pueden producir bloques o celdas mal asignados.
- El umbral de giro de `orient` esta fijado en 0,65 y almacenado en metadatos; cambiarlo requiere editar el modelo o la configuracion del motor.
- No se documentan sesgos especificos ni tasas de alucinacion; al ser extractivo, el riesgo principal es la mala transcripcion, no la invencion de contenido.
- El repositorio figura con 0.0 GB y 0 descargas en el momento de la consulta; la disponibilidad de los pesos ONNX y del motor Carbon-OCR debe verificarse en el repositorio y en GitHub.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CarbonResearchLabs/fullerene-3M
- Licencia de pesos: https://huggingface.co/CarbonResearchLabs/fullerene-3M/blob/main/LICENSE-WEIGHTS.md
- Repositorio del motor Carbon-OCR: https://github.com/karanvora2599/Carbon-OCR
