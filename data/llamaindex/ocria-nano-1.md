# llamaindex/OCRia-nano-1

## Resumen

OCRia-nano-1 es un pipeline de modelos ONNX para el parseo de documentos en CPU desarrollado por LlamaIndex. No se trata de un modelo único con script de inferencia propio, sino de un conjunto de modelos pequenos que LiteParse, el parser de documentos local de codigo abierto de LlamaIndex, orquesta para convertir PDFs e imagenes en Markdown o JSON. El pipeline combina un detector de lineas de texto, un router de escritura, cuatro reconocedores OCR (latin, world-script, RTL y CJK) y LayoutNet, un modelo conjunto de tablas y layout. En total suma aproximadamente 8,1 millones de parametros.

La relevancia del modelo radica en su relacion con OCRia-1, el VLM de documentos de 4B de LlamaIndex: OCRia-nano-1 es una destilacion de aquel con 1/500 de sus parametros, pensada para ejecutarse en CPU en cualquier entorno donde corra LiteParse (CLI, Python, Node.js, navegador y edge via WebAssembly). Segun la model card, alcanza 59,2 en ParseBench-2, por delante de los parsers de CPU Indra (55,1) y Marker (52,5), y mejora LiteParse con Tesseract (48,7). Reporta 27,8 paginas por segundo en 16 vCPU y 426 ms por pagina en un solo nucleo, el doble de rapido que LiteParse con Tesseract.

El modelo esta pensado para escenarios donde el coste, la privacidad y la latencia importan: procesamiento local de documentos sin enviar datos a la nube, extraccion de tablas y estructura de layout en paginas escaneadas y nativas digitales, y despliegue en entornos con recursos limitados. Los pesos se distribuyen como ficheros ONNX cuantizados en int8 en algunos reconocedores, con un tamano de repositorio de 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multi-modelo ONNX: detector de lineas (depthwise-separable), router de escritura, reconocedores CTC y LayoutNet (tablas y layout) |
| Parametros totales | 8,1M (aproximado, suma del pipeline) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de vision por linea/pagina, no transformer de contexto) |
| Tipos de cuantizacion | int8 en el reconocedor latin; resto no disponible |
| Idiomas soportados | Multilingue: latin, CJK, RTL (arabe y hebreo) y un reconocedor world-script para unos 17 scripts adicionales |
| Licencia | ocria-nano-1-license (other) |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,1 GB |
| Runtime | ONNX Runtime; LiteParse (CLI, Python, Node.js, WebAssembly) |
| DPI de render por defecto | 250 DPI para OCR |

## Arquitectura y entrenamiento

OCRia-nano-1 no es un transformer generativo, sino un pipeline de vision por computador especializado en documentos. Se compone de cinco modulos con roles diferenciados: un detector de lineas (`det.onnx`, 0,08M parametros) que produce un mapa de segmentacion de lineas de texto mediante convoluciones depthwise-separable; un router de escritura (`router.onnx`, 0,04M) que decide que reconocedor usar para cada recorte de linea y detecta lineas invertidas; un reconocedor latin (`rec_latin.onnx`, 0,80M, CTC, int8, 791 caracteres); un reconocedor world-script (`rec_world.onnx`, 0,98M, CTC, unos 17 scripts); y un reconocedor RTL (`rec_rtl.onnx`, 0,71M, CTC, arabe y hebreo). La model card menciona ademas un reconocedor CJK dentro del esquema de cuatro reconocedores, aunque la tabla de "How it works" no lo lista con parametros propios.

LayoutNet es el modulo conjunto de tablas y layout: detecta tablas (filas, columnas y celdas de cabecera con spanning) y clasifica bloques de layout (encabezados, listas, pies de figura, cabeceras y pies de pagina) tanto en paginas escaneadas como en paginas nativas digitales, operando en este ultimo caso a partir de la capa de texto del PDF. El entrenamiento se realizo por destilacion desde OCRia-1, el VLM de documentos de 4B de LlamaIndex, segun indica la model card; no se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. La innovacion tecnica principal es la relacion calidad/parametros: un pipeline de 8,1M de parametros que supera a Tesseract y a otros parsers de CPU en ParseBench-2, con soporte de ejecucion en WebAssembly y un router que reparte el trabajo entre reconocedores especializados por script.

## Capacidades

- OCR de documentos escaneados e imagenes: deteccion de lineas de texto y reconocimiento por linea con confianza por palabra y bounding boxes.
- Parseo de PDFs nativos digitales: fusion de la capa de texto del PDF con el resultado del OCR.
- Extraccion de tablas: salida como tablas Markdown o HTML con `colspan`/`rowspan` para celdas combinadas.
- Clasificacion de layout: encabezados, listas, parrafos, figuras, cabeceras y pies de pagina, con eliminacion opcional de cabeceras y pies en la salida.
- Multilingue con enrutado automatico por linea: latin, CJK, RTL (arabe, hebreo) y world-script para unos 17 scripts adicionales.
- Deteccion de lineas invertidas (upside-down) mediante el router.
- Salida en Markdown, texto plano o JSON con bloques de layout, bounding boxes e items de texto.
- Procesamiento de PDFs, imagenes y documentos Office (via conversion de LiteParse).
- Ejecucion en CPU, navegador y edge runtimes mediante WebAssembly, con control selectivo de que modelos se descargan (por ejemplo, solo latin y sin layout: 1,5 MB de modelos).
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo generativo.

## Casos de uso

- Digitalizacion de archivos escaneados en local: LiteParse con OCRia-nano-1 convierte lotes de PDFs escaneados en Markdown estructurado sin enviar documentos a servicios externos, adecuado para sectores con requisitos de privacidad (legal, salud, administracion publica).
- Extraccion de tablas de informes financieros: LayoutNet detecta filas, columnas y celdas de cabecera con spanning, y la salida HTML con `colspan`/`rowspan` preserva la estructura para su posterior procesamiento en pipelines de datos.
- Ingesta de documentos para RAG: el JSON con bloques de layout y bounding boxes permite trocear documentos por secciones semanticas (encabezados, parrafos, tablas) antes de indexarlos en un sistema de recuperacion.
- Procesamiento en el navegador: mediante `@llamaindex/liteparse-wasm`, una aplicacion web puede parsear PDFs en el cliente sin backend, con descargas de modelos de tan solo 1,5 MB si se limita a latin y desactiva layout.
- Automatizacion documental en entornos con CPU: con 27,8 paginas por segundo en 16 vCPU y 426 ms por pagina en un nucleo, es viable procesar volumenes altos en servidores sin GPU.
- Documentos multilingues: el router por linea selecciona el reconocedor adecuado, lo que permite procesar lotes que mezclan contenido latin, CJK, arabe o hebreo sin configuracion manual de idioma.
- Extraccion de metadatos de facturas y formularios: la deteccion de cabeceras, pies y bloques de layout ayuda a localizar campos y secciones recurrentes en documentos con plantilla.

## Benchmarks y rendimiento

| Metrica | OCRia-nano-1 | Indra | Marker | LiteParse + Tesseract |
|---|---|---|---|---|
| ParseBench-2 (precision) | 59,2 | 55,1 | 52,5 | 48,7 |
| Throughput (16 vCPU) | 27,8 paginas/s | no disponible | no disponible | no disponible |
| Latencia (1 nucleo) | 426 ms/pagina | no disponible | no disponible | no disponible |
| Parametros | 8,1M | no disponible | no disponible | no disponible |

No se han publicado en la informacion disponible resultados de benchmarks como MMLU, HumanEval o GSM8K, que no aplican a un pipeline de OCR. Los datos de ParseBench-2 y de velocidad provienen de la model card del autor.

## Requisitos de hardware

- Inferencia en CPU: el modelo esta disenado para CPU y no requiere GPU. El repositorio pesa 0,1 GB y la descarga inicial de modelos mas ONNX Runtime es de 60-75 MB.
- VRAM: no aplica; no se requiere GPU.
- GPU recomendadas: no aplica. El modelo no esta pensado para aceleracion GPU en la informacion disponible.
- Cabe en cualquier equipo consumer: funciona en portatiles y entornos edge; el modo WebAssembly permite ejecucion en navegador.
- Despliegue: LiteParse (`pip install liteparse`, `npm i -g @llamaindex/liteparse`, `cargo install liteparse`), `@llamaindex/liteparse-wasm` para navegador y edge, y ONNX Runtime como backend. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de pipeline.
- Latencia y throughput: 27,8 paginas por segundo en 16 vCPU y 426 ms por pagina en un solo nucleo, segun la model card.
- DPI de render por defecto: 250 DPI, configurable con `--dpi`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OCRia-nano-1 | Pipeline OCR + layout en CPU | 8,1M | Parseo de documentos local, tablas y layout | ocria-nano-1-license | Hugging Face, via LiteParse |
| OCRia-1 | VLM de documentos | 4B | Parseo de documentos de alta precision | no disponible | Hugging Face (llamaindex/OCRia-1) |
| Tesseract (via LiteParse) | Motor OCR clasico | no disponible | OCR de texto, sin layout conjunto | licencia open source de Tesseract | Ampliamente disponible |
| Indra | Parser de CPU | no disponible | Parseo de documentos | no disponible | no disponible |
| Marker | Parser de CPU | no disponible | Parseo de documentos a Markdown | no disponible | no disponible |

En ParseBench-2, OCRia-nano-1 (59,2) supera a Indra (55,1), Marker (52,5) y LiteParse con Tesseract (48,7). Frente a OCRia-1, ofrece 1/500 de los parametros y ejecucion en CPU, a costa de una precision presumiblemente menor que el VLM de 4B, aunque la model card no proporciona la puntuacion de OCRia-1 en ParseBench-2.

## Limitaciones y advertencias

- No es un modelo autonomo: los ficheros son los que ejecuta LiteParse y no incluyen script de inferencia propio. Debe usarse a traves de LiteParse.
- No es un modelo generativo: no soporta razonamiento, generacion libre de texto, tool calling ni agentes.
- La licencia es `ocria-nano-1-license` (other); no se detallan en la informacion disponible los terminos exactos para uso comercial, por lo que debe revisarse el fichero LICENSE antes de desplegarlo en produccion.
- Riesgo de errores de OCR en documentos de baja calidad, rotados o con tipografias no cubiertas por los reconocedores; la confianza por palabra esta expuesta en la salida JSON para filtrar.
- El router cubre latin, CJK, RTL y unos 17 scripts adicionales; scripts fuera de esa cobertura pueden degradar el reconocimiento.
- La deteccion de tablas y layout depende de LayoutNet; estructuras muy complejas (tablas anidadas, layouts no convencionales) pueden requerir validacion manual.
- La model card no documenta sesgos, composicion del dataset de entrenamiento ni evaluaciones por idioma, lo que limita la evaluacion de riesgos.
- El rendimiento reportado (27,8 paginas/s, 426 ms/pagina) corresponde a las condiciones indicadas por el autor y puede variar segun hardware, DPI y complejidad de la pagina.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llamaindex/OCRia-nano-1
- Informe tecnico: https://www.llamaindex.ai/ocria/ocria-nano-1-report.pdf
- Blog de presentacion: https://www.llamaindex.ai/blog/introducing-ocria-nano-1
- LiteParse (repositorio): https://github.com/run-llama/liteparse
- OCRia-1 (modelo base de la destilacion): https://huggingface.co/llamaindex/OCRia-1
- ParseBench: https://github.com/run-llama/ParseBench
