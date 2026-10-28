# martinsmessias/rasgapdf

## Resumen

RasgaPDF es un parser de PDF espacial escrito en Rust puro, desarrollado por el usuario de Hugging Face martinsmessias. No es un modelo de lenguaje ni una red neuronal: es una herramienta de extracción de documentos que devuelve la geometría física 2D exacta del PDF (coordenadas `[x0, y0, x1, y1]` para cada carácter, span, línea, bloque y tabla) en lugar de aplicar heurísticas de conversión a Markdown o texto plano. Su propuesta es que los pipelines de RAG y los LLM posteriores reciban el layout real del documento, sin pérdida por aplanado de columnas ni por reconstrucción destructiva.

El proyecto se distribuye de forma políglota: crate de Rust en crates.io, paquete de Python en PyPI, paquete de npm para Node.js y bindings FFI con ABI de C para Go y C# (.NET), además de un binario CLI independiente. Ofrece dos modos de extracción: coordenadas físicas planas (latencia declarada de ~3-8 ms por página) y documento jerárquico estructurado con detección automática de tablas ( ~8-15 ms por página).

Es relevante ahora porque la mayoría de herramientas de extracción de PDF ampliamente usadas (pdfplumber, PyMuPDF, pypdf, Apache Tika) son de una a dos órdenes de magnitud más lentas según los datos del propio autor, y porque la calidad del layout es un cuello de botella recurrente en pipelines de document AI. Conviene señalar una inconsistencia de metadatos: el repositorio está etiquetado con el pipeline `document-question-answering`, pero la herramienta no responde preguntas; solo extrae y estructura contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parser de PDF nativo en Rust puro; paralelismo multi-hilo con Rayon y uso de SIMD AVX2/AVX-512; bindings FFI con ABI de C para Python, Node.js, Go y C# (.NET); no es una red neuronal |
| Parametros totales | No aplica (no es un modelo neuronal; no hay pesos entrenados) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo generativo). Procesa el documento página a página sin límite de tokens declarado |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | `en` y `pt` segun los metadatos del repositorio; la extraccion de coordenadas es independiente del idioma, la estructuración está validada en esos dos idiomas |
| Licencia | AGPL-3.0 |
| Formato de pesos | No aplica. Se distribuye como codigo fuente y binarios: crate de Rust (`rasgapdf = "0.2.1"`), paquete PyPI, paquete npm y binario CLI |
| Tamano del repositorio | 0,2 GB |
| Versión declarada | 0.2.1 (crate de Rust) |
| Formatos de salida | JSON plano, JSON jerarquico (`SpatialDocument`), texto formateado, TSV, CSV; extraccion opcional de imagenes embebidas y trazados vectoriales |
| Descargas / likes | 0 descargas, 1 like |
| Fechas | Creado el 2026-10-16, actualizado el 2026-10-28 |

## Arquitectura y entrenamiento

No hay entrenamiento. RasgaPDF es un motor determinista de análisis de layout: parsea la estructura interna del PDF, extrae los spans de texto con sus matrices de transformación y calcula las bounding boxes físicas. El procesamiento paralelo se hace con Rayon a nivel de página, lo que explica el escalado casi lineal observado entre 1 y 50 páginas (7,7 ms → 95 ms en modo raw). El uso de SIMD AVX2/AVX-512 se emplea en las rutas críticas de cálculo geométrico.

El modo estructurado reconstruye la jerarquía visual en un árbol `SpatialDocument` → `pages` → `text_blocks` → `lines` → `tables`. La detección de tablas se realiza por proyección horizontal de columnas (horizontal column projection) para identificar matrices; el modo raw evita por completo ese coste y devuelve una lista plana de coordenadas. Opcionalmente (`--images`, `--drawings`, `--extract-images`) se extraen imágenes embebidas y trazados vectoriales, escribiendo los ficheros y un `manifest.json`. El proyecto documenta la arquitectura en `docs/ARCHITECTURE.md` y el esquema de salida espacial en `docs/SCHEMA.md`.

## Capacidades

- Extracción de coordenadas físicas 2D exactas (`[x0, y0, x1, y1]`) para cada carácter, span, línea, bloque y tabla.
- Dos modos: coordenadas planas (raw X/Y) y documento jerárquico estructurado con bloques, líneas y tablas.
- Detección automática de tablas matriciales mediante proyección horizontal de columnas.
- Extracción opcional de imágenes embebidas y trazados vectoriales.
- Salida en JSON, texto formateado, TSV y CSV, apta para pipelines Unix (`awk`, `grep`).
- Paralelismo multi-hilo por página y aceleración SIMD (AVX2/AVX-512).
- Bindings nativos para Python, Node.js, Go y C# (.NET) mediante FFI con ABI de C, además de CLI y crate de Rust.
- No incluye tool calling, funciones de agente, razonamiento multi-paso ni generación de texto: esas capacidades corresponden al LLM que consuma la salida.
- No se menciona OCR ni soporte de PDF escaneado sin capa de texto.

## Casos de uso

- **RAG sobre documentos con layout complejo**: usar el modo jerárquico para preservar el orden de lectura en PDFs multi-columna y entregar bloques con coordenadas al pipeline de chunking, evitando el texto corrupto que producen los conversores a Markdown.
- **Alineación con OCR**: el modo raw devuelve bounding boxes por span que permiten superponer o validar la salida de un motor OCR sobre la capa de texto existente, comparando coordenadas en lugar de cadenas.
- **Extracción de tablas financieras o técnicas**: la detección por proyección de columnas permite reconstruir matrices de facturas, balances o fichas técnicas sin escribir heurísticas ad hoc.
- **Indexación vectorial con metadatos espaciales**: almacenar las coordenadas junto a cada embedding permite recuperar la región exacta del PDF que originó un fragmento y resaltarla en un visor.
- **Preprocesado de corpus a gran escala**: por el orden de magnitud de latencia declarado (95 ms para 50 páginas en modo raw), es viable procesar lotes de miles de PDFs en un único nodo de CPU, sin GPU.
- **Visualización y depuración de documentos**: la web visualizer del proyecto y la salida TSV/CSV permiten inspeccionar qué ha detectado el parser como bloque o tabla sobre un PDF concreto.
- **Pipelines Unix y automatización de ingesta**: el CLI con salida TSV/CSV se integra en scripts de shell para filtrado por página o por rango de coordenadas antes de cargar los datos en un sistema posterior.
- **Integración en servicios backend políglotas**: al exponer la misma API vía crate, PyPI, npm y FFI para Go y .NET, un mismo equipo puede usar el parser desde microservicios escritos en lenguajes distintos.

## Benchmarks y rendimiento

Medido por el autor en un Intel Core i7-1365U (10 núcleos / 12 hilos, AVX2). Son benchmarks de latencia y memoria, no de precisión de extracción:

| Herramienta | Lenguaje | 1 página | 50 páginas | Memoria | Tipo de salida |
|---|---|---|---|---|---|
| RasgaPDF (raw X/Y) | Rust nativo | 7,7 ms | 95 ms | ~14 MB | Coordenadas planas |
| RasgaPDF (estructurado) | Rust nativo | 8,5 ms | 142 ms | ~18 MB | Bloques y tablas |
| PyMuPDF (`fitz`) | C / Python | 28,0 ms | 620 ms | ~45 MB | Texto / pixmap |
| `pdfplumber` | Python | 410,0 ms | 9.800 ms | ~140 MB | Dicts de Python |
| `pypdf` | Python | 95,0 ms | 2.100 ms | ~85 MB | Cadena de texto plana |
| Apache Tika | Java | 650,0 ms | 12.400 ms | ~320 MB | XHTML |

No se han publicado resultados de benchmarks de precisión, recall ni exactitud de tablas en la información disponible.

## Requisitos de hardware

- No requiere GPU: la inferencia es CPU-only.
- Huella de memoria declarada: ~14 MB en modo raw y ~18 MB en modo estructurado, con independencia del tamaño del modelo (no hay modelo).
- CPU: se recomienda un procesador con AVX2; el proyecto menciona uso de AVX-512 cuando está disponible. El benchmark de referencia usa un Intel Core i7-1365U de 10 núcleos.
- Escalado: el paralelismo es por página (Rayon), por lo que el throughput crece con el número de núcleos físicos.
- Despliegue: binario CLI (`cargo build --release`), crate de Rust, paquete PyPI, paquete npm, biblioteca vía FFI para Go y C#, y Hugging Face Space para demo.
- Latencia declarada: ~3-8 ms por página en modo raw, ~8-15 ms por página en modo estructurado.
- No se han publicado datos de throughput agregado (páginas/segundo) en servidores multinúcleo.

## Comparativa con modelos similares

Comparación con otras herramientas de extracción de PDF. Ninguna de ellas es un modelo neuronal, por lo que la columna de parámetros no aplica.

| Herramienta | Lenguaje | Parámetros | Contexto | Latencia 1 pág. | Licencia | Salida |
|---|---|---|---|---|---|---|
| RasgaPDF | Rust nativo | No aplica | No aplica | 7,7 ms (raw) / 8,5 ms (estruct.) | AGPL-3.0 | Coordenadas 2D, bloques, tablas |
| PyMuPDF (`fitz`) | C / Python | No aplica | No aplica | 28,0 ms | AGPL-3.0 / comercial | Texto, pixmap |
| `pdfplumber` | Python | No aplica | No aplica | 410,0 ms | MIT | Dicts de Python |
| `pypdf` | Python | No aplica | No aplica | 95,0 ms | BSD-3-Clause | Texto plano |
| Apache Tika | Java | No aplica | No aplica | 650,0 ms | Apache-2.0 | XHTML |

RasgaPDF destaca en latencia y en preservación de geometría 2D; PyMuPDF es la alternativa más cercana en velocidad y ofrece además rasterizado, que RasgaPDF no cubre. pdfplumber y Tika ofrecen modelos de licencia permisiva, ventaja relevante frente al copyleft de AGPL-3.0.

## Limitaciones y advertencias

- **Licencia AGPL-3.0**: es copyleft fuerte. Ofrecer el software como servicio en red puede obligar a liberar el código fuente de la aplicación que lo integra. Para uso comercial cerrado habría que negociar licencia o aislar el componente.
- **No es un modelo de preguntas y respuestas**: la etiqueta `document-question-answering` del repositorio no se corresponde con la funcionalidad real. No genera respuestas ni razona; solo extrae y estructura.
- **Sin OCR**: no se menciona soporte para PDFs escaneados sin capa de texto. En documentos imagen la herramienta no aportará contenido.
- **Idiomas validados limitados a `en` y `pt`**: aunque la extracción geométrica es agnóstica al idioma, la estructuración (bloques, detección de tablas) solo está declarada para inglés y portugués.
- **Ausencia de benchmarks de precisión**: solo hay datos de velocidad. No se puede evaluar la exactitud de la detección de tablas o de la segmentación en bloques con la información disponible.
- **Validación comunitaria mínima**: 0 descargas y 1 like en el momento de la consulta; repositorio creado y actualizado en octubre de 2026. No hay evidencia de uso en producción a escala.
- **Riesgo de alucinación**: no aplica, al no ser un modelo generativo. El riesgo equivalente es la reconstrucción incorrecta de jerarquía o de tablas en layouts atípicos.
- **Documentación incompleta en la información disponible**: la model card aparece truncada; faltan detalles sobre manejo de PDFs cifrados, formularios, anotaciones o fuentes CID, así como sobre el rendimiento en documentos muy grandes.
- **Madurez de versión**: la versión declarada es 0.2.1, propia de un proyecto joven con posible volatilidad de API.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/martinsmessias/rasgapdf
- Demo (Hugging Face Space): https://huggingface.co/spaces/martinsmessias/rasgapdf
- Repositorio en GitHub: https://github.com/MartinsMessias/rasgapdf
- Visualizador web: https://martinsmessias.github.io/rasgapdf/
- Paquete en PyPI: https://pypi.org/project/rasgapdf/
- Crate en crates.io: https://crates.io/crates/rasgapdf
- Paquete en npm: https://www.npmjs.com/package/rasgapdf
- Documentación de arquitectura: docs/ARCHITECTURE.md (en el repositorio de GitHub)
- Esquema espacial de salida: docs/SCHEMA.md (en el repositorio de GitHub)
- Fichero llms.txt: llms.txt (en el repositorio de GitHub)
- Duplicar el Space: https://huggingface.co/spaces/martinsmessias/rasgapdf?duplicate=true

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este proyecto; los enlaces anteriores proceden exclusivamente de la model card del repositorio.
