# llamaindex/OCRia-nano-1

## Resumen

OCRia-nano-1 es un pipeline de modelos para el parseo de documentos en CPU desarrollado por LlamaIndex. No se trata de un unico modelo generativo, sino de un conjunto de modelos ONNX especializados que trabajan de forma coordinada dentro de LiteParse, el parser de documentos local de codigo abierto de LlamaIndex. El pipeline combina un detector de lineas de texto, un enrutador de escrituras, varios reconocedores OCR y LayoutNet, un modelo conjunto de tablas y maquetacion. En total suma 8,1 millones de parametros.

El modelo resuelve el problema del parseo de documentos PDF e imagenes escaneadas a Markdown o JSON estructurado en entornos sin GPU, incluyendo navegador y edge runtimes mediante WebAssembly. Es relevante porque demuestra que la destilacion desde un VLM de documentos de 4B parametros (OCRia-1) permite obtener un pipeline 500 veces mas pequeno que mantiene una precision competitiva: 59,2 en ParseBench-2, por delante de parsers de CPU como Indra (55,1) y Marker (52,5), y con una velocidad de 27,8 paginas por segundo en 16 vCPU.

El modelo se publica bajo una licencia propia (`ocria-nano-1-license`), soporta contenido multilingue mediante un enrutador que dirige cada linea a uno de cuatro reconocedores (latin, CJK, derecha-a-izquierda y un modelo de escrituras del mundo), y esta disenado para ejecutarse en Linux, macOS, Windows, navegador y edge runtimes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de modelos ONNX: detector de lineas (depthwise-separable), enrutador de escrituras, reconocedores CTC (int8) y LayoutNet (modelo conjunto de tablas y maquetacion) |
| Parametros totales | 8,1M (pipeline completo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision por linea/pagina, no generativo autorregresivo) |
| Tipos de cuantizacion | Reconocedores en int8; modelos distribuidos en ONNX |
| Idiomas soportados | Multilingue: latin, CJK, derecha-a-izquierda (arabe, hebreo) y un modelo de escrituras del mundo para unas 17 escrituras adicionales |
| Licencia | `ocria-nano-1-license` (licencia propia, categoria "other") |
| Formato de pesos | ONNX (`det.onnx`, `router.onnx`, `rec_latin.onnx`, `rec_world.onnx` y modelos de layout) |

## Arquitectura y entrenamiento

OCRia-nano-1 es un pipeline modular, no un transformer generativo. Se compone de cinco piezas: un detector de lineas de texto con convoluciones depthwise-separable (0,08M parametros) que produce un mapa de segmentacion; un enrutador de escrituras (0,04M) que elige reconocedor por recorte de linea y detecta lineas invertidas; un reconocedor latin CTC en int8 con soporte para 791 caracteres (0,80M); un reconocedor de escrituras del mundo tambien CTC; y LayoutNet, un modelo conjunto de tablas y maquetacion. Los reconocedores y el resto de componentes se destilaron desde OCRia-1, el VLM de documentos de 4B parametros de LlamaIndex, reduciendo el tamano en un factor de 500.

El pipeline se integra en LiteParse, que renderiza la pagina (250 DPI por defecto), ejecuta el detector, el enrutador y los reconocedores, fusiona el texto OCR con la capa de texto del PDF, ejecuta LayoutNet y escribe Markdown o JSON con cajas delimitadoras. LayoutNet detecta tablas (filas, columnas y celdas de cabecera con spanning) y clasifica bloques de maquetacion (titulos, listas, pies de figura, cabeceras y pies de pagina) tanto en paginas escaneadas como en PDF nativos. No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre la composicion exacta del dataset en la informacion proporcionada.

## Capacidades

- OCR de documentos escaneados e imagenes con deteccion de lineas de texto y cajas delimitadoras.
- Enrutamiento automatico de escrituras por linea: latin, CJK, derecha-a-izquierda y modelo de escrituras del mundo (unas 17 escrituras adicionales).
- Deteccion de lineas invertidas (texto boca abajo).
- Parseo de tablas a Markdown o HTML con `colspan` y `rowspan` para celdas con spanning.
- Clasificacion de bloques de maquetacion: titulos, listas, parrafos, tablas, figuras, cabeceras y pies de pagina.
- Eliminacion de cabeceras y pies de pagina del Markdown por defecto (configurable con `--keep-headers-footers`).
- Extraccion de bloques JSON con cajas y enlaces a sus elementos de texto (`--extract-blocks`).
- Salida de palabras y lineas en JSON con cajas delimitadoras y confianza OCR.
- Fusion del texto OCR con la capa de texto del PDF nativo.
- Conversion de PDFs, imagenes y documentos de Office a traves de LiteParse.
- Ejecucion en CPU, navegador y edge runtimes mediante WebAssembly.

## Casos de uso

- Digitalizacion de archivos escaneados: el pipeline procesa lotes de PDFs escaneados en CPU a 27,8 paginas por segundo en 16 vCPU, lo que permite indexar grandes volumenes documentales sin infraestructura GPU.
- Extraccion de tablas financieras: LayoutNet detecta filas, columnas y celdas de cabecera con spanning, y la salida en HTML con `colspan`/`rowspan` preserva la estructura para su posterior carga en bases de datos o hojas de calculo.
- Construccion de pipelines RAG sobre documentos: la salida en Markdown con titulos, listas y bloques clasificados facilita el chunking semantico y la indexacion en sistemas de recuperacion aumentada.
- Procesamiento en el navegador: mediante `@llamaindex/liteparse-wasm` se puede parsear un PDF en el cliente sin enviar datos a un servidor, util para aplicaciones con requisitos de privacidad o para reducir costes de backend.
- Parseo multilingue de documentos corporativos: el enrutador dirige cada linea al reconocedor adecuado, lo que permite procesar documentos mixtos con texto latin, CJK y arabe o hebreo en una misma pagina.
- Extraccion de estructura para auditoria documental: la salida JSON con cajas delimitadoras, confianza OCR y bloques de maquetacion permite verificar visualmente la extraccion y construir visores de documentos con resaltado.
- Despliegue en edge computing: la variante minima de 1,5 MB de modelos (solo latin, sin layout) permite ejecutar OCR en dispositivos con recursos limitados.

## Benchmarks y rendimiento

| Metrica | OCRia-nano-1 | Indra | Marker | LiteParse con Tesseract |
|---|---|---|---|---|
| ParseBench-2 (precision) | 59,2 | 55,1 | 52,5 | 48,7 |
| Rendimiento | 27,8 paginas/s en 16 vCPU; 426 ms/pagina en un nucleo | no disponible | no disponible | aproximadamente la mitad de velocidad que OCRia-nano-1 |

No se han publicado en la informacion disponible resultados de benchmarks estandar de NLP (MMLU, HumanEval, GSM8K), ya que el modelo no es un LLM generativo sino un pipeline de parseo documental.

## Requisitos de hardware

- Inferencia en CPU: el pipeline esta disenado para ejecutarse sin GPU. Los modelos completos junto con ONNX Runtime ocupan entre 60 y 75 MB.
- VRAM: no requiere GPU; no aplica memoria de video.
- GPU recomendadas: no aplica; el modelo no esta pensado para aceleracion GPU en la informacion disponible.
- Cabe en cualquier consumer CPU: 426 ms por pagina en un solo nucleo y 27,8 paginas por segundo en 16 vCPU.
- Opciones de despliegue: LiteParse (CLI `lit parse`, Python `liteparse`, Node.js `@llamaindex/liteparse`, Rust `cargo install liteparse`), WebAssembly para navegador y edge (`@llamaindex/liteparse-wasm`), con ONNX Runtime como motor de inferencia.
- Variante minima: 1,5 MB de modelos limitando a escritura latin y desactivando layout.
- Descarga e integridad: `lit models pull ocria-nano` descarga los modelos y ONNX Runtime y verifica cada archivo contra su sha256 fijado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Precision ParseBench-2 | Licencia | Ejecucion |
|---|---|---|---|---|---|
| OCRia-nano-1 | Pipeline OCR + layout (ONNX) | 8,1M | 59,2 | `ocria-nano-1-license` | CPU, WASM, edge |
| Indra | Parser de CPU | no disponible | 55,1 | no disponible | CPU |
| Marker | Parser de documentos | no disponible | 52,5 | no disponible | CPU/GPU |
| LiteParse + Tesseract | OCR + parser | no disponible | 48,7 | no disponible | CPU |
| OCRia-1 | VLM de documentos | 4B | no disponible | no disponible | GPU |

OCRia-nano-1 ofrece la mayor precision de la comparativa en ParseBench-2 con un pipeline de solo 8,1M parametros, y ademas supera a Tesseract en velocidad dentro de LiteParse. Frente a OCRia-1, del que se destila, reduce el tamano en un factor de 500 a costa de no ser un VLM generativo autonomo.

## Limitaciones y advertencias

- No es un modelo autonomo: los archivos son los que ejecuta LiteParse y no incluyen script de inferencia propio; deben usarse a traves de LiteParse.
- La licencia es propia (`ocria-nano-1-license`, categoria "other"): es necesario revisar el archivo LICENSE antes de cualquier uso comercial, ya que las condiciones no se detallan en la informacion disponible.
- El rendimiento de 59,2 en ParseBench-2 implica que aproximadamente un 40% de la evaluacion no se resuelve correctamente; la precision es competitiva pero no perfecta para produccion sin verificacion.
- El reconocedor latin soporta 791 caracteres; otras escrituras dependen del modelo de escrituras del mundo y del enrutador, con cobertura no cuantificada en la informacion disponible.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni comportamiento en dominios especificos (documentos manuscritos, formularios, baja calidad de escaneo).
- El renderizado por defecto a 250 DPI condiciona la calidad del OCR; valores inferiores pueden degradar la deteccion de lineas.
- La eliminacion por defecto de cabeceras y pies de pagina puede eliminar informacion relevante si el documento los usa para contenido sustantivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llamaindex/OCRia-nano-1
- Informe tecnico: https://www.llamaindex.ai/ocria/ocria-nano-1-report.pdf
- Blog de presentacion: https://www.llamaindex.ai/blog/introducing-ocria-nano-1
- Documentacion de LiteParse para OCRia-nano: https://developers.llamaindex.ai/liteparse/guides/ocria-nano/
- Repositorio LiteParse: https://github.com/run-llama/liteparse
- Modelo OCRia-1 (VLM de 4B del que se destila): https://huggingface.co/llamaindex/OCRia-1
- Repositorio ParseBench: https://github.com/run-llama/ParseBench
- Web de LlamaIndex: https://www.llamaindex.ai
