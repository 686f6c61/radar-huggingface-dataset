# orz99/OCRia-nano-1

## Resumen

OCRia-nano-1 es un pipeline de modelos ONNX para el parseo de documentos en CPU desarrollado por LlamaIndex. No se trata de un modelo generativo único, sino de un conjunto de cinco modelos especializados (detector de líneas, enrutador de escrituras, tres reconocedores CTC y LayoutNet para tablas y maquetación) que, en conjunto, suman 8,1 millones de parámetros. Su función es convertir PDFs escaneados y nativos digitales en Markdown o JSON con cajas delimitadoras, ejecutándose dentro de LiteParse, el parser de documentos local y open source de LlamaIndex.

El pipeline es el resultado de destilar OCRia-1, el VLM de documentos de 4B parámetros de LlamaIndex, en un conjunto de modelos 500 veces más pequeños. Esta compresión permite ejecutar OCR, detección de tablas y clasificación de bloques de maquetación en hardware sin GPU: desde un portátil convencional hasta el navegador mediante WebAssembly. Según el autor, alcanza 59,2 en ParseBench-2, por delante de Indra (55,1) y Marker (52,5), y procesa 27,8 páginas por segundo en 16 vCPU.

La relevancia del modelo reside en su enfoque de eficiencia extrema: OCR multilingüe con enrutado por línea entre escrituras latinas, CJK, RTL y otras 17 escrituras, con un consumo de modelos de 60-75 MB incluyendo el runtime de ONNX. La licencia es propietaria (`ocria-nano-1-license`), por lo que su uso comercial requiere revisar los términos adjuntos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de modelos ONNX: detector de líneas (depthwise-separable), enrutador de escrituras, reconocedores CTC (latin, world, rtl) y LayoutNet (tablas y maquetación) |
| Parametros totales | 8,1M en conjunto (detector 0,08M; router 0,04M; rec_latin 0,80M; rec_world 0,98M; rec_rtl 0,71M; LayoutNet no disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (procesa página a página; renderizado a 250 DPI por defecto) |
| Tipos de cuantizacion | int8 en el reconocedor latino; cuantización de los demás componentes no disponible |
| Idiomas soportados | Multilingüe: latino (791 caracteres), CJK, RTL (árabe y hebreo) y ~17 escrituras adicionales mediante el modelo world-script |
| Licencia | `ocria-nano-1-license` (other, propietaria) |
| Formato de pesos | ONNX (`.onnx`) |

## Arquitectura y entrenamiento

OCRia-nano-1 no es un transformer generativo, sino una cadena de modelos convolucionales y CTC especializados. El detector de líneas (`det.onnx`) genera un mapa de segmentación de líneas de texto mediante convoluciones depthwise-separable. El enrutador (`router.onnx`) recibe cada recorte de línea y decide qué reconocedor lo procesa, además de detectar líneas invertidas. Los tres reconocedores (`rec_latin.onnx`, `rec_world.onnx`, `rec_rtl.onnx`) son modelos CTC con salidas de 791 caracteres para el latino y coberturas específicas para CJK, árabe, hebreo y unas 17 escrituras adicionales. LayoutNet completa el pipeline con detección de tablas (filas, columnas, celdas de cabecera con colspan/rowspan) y clasificación de bloques de maquetación (encabezados, listas, pies de figura, cabeceras y pies de página).

El entrenamiento se basa en destilación desde OCRia-1, el VLM de documentos de 4B de LlamaIndex, según indica el autor. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La innovación técnica principal es la compresión de un VLM de 4B a 8,1M de parámetros manteniendo un rendimiento competitivo en ParseBench-2, junto con el enrutado por línea que permite cubrir múltiples sistemas de escritura sin un modelo único multilingüe grande.

## Capacidades

- OCR de documentos escaneados y nativos digitales, con renderizado a 250 DPI configurable.
- Detección y reconocimiento de líneas de texto con enrutado automático por escritura (latino, CJK, RTL, world-script).
- Detección de líneas invertidas (texto boca abajo).
- Detección de tablas con filas, columnas y celdas de cabecera con colspan y rowspan; salida en Markdown o HTML.
- Clasificación de bloques de maquetación: encabezados, párrafos, listas, tablas, figuras, cabeceras y pies de página.
- Conversión a Markdown, texto plano o JSON con cajas delimitadoras y confianza OCR por palabra y línea.
- Eliminación opcional de cabeceras y pies de página en la salida Markdown.
- Extracción de bloques de maquetación en JSON con vínculos a sus elementos de texto.
- Procesamiento de PDFs, imágenes y documentos Office (mediante la conversión de LiteParse).
- Ejecución en CPU en CLI, Python, Node.js (Linux, macOS, Windows) y en navegador y edge runtimes vía WebAssembly.
- No dispone de tool calling, function calling, agentes ni razonamiento multi-paso: es un pipeline de parseo, no un modelo conversacional.

## Casos de uso

- Digitalización de archivos escaneados en CPU: LiteParse con OCRia-nano-1 convierte lotes de PDFs escaneados en Markdown con estructura preservada sin necesidad de GPU, adecuado para servidores modestos o portátiles.
- Extracción de tablas de informes financieros: LayoutNet detecta filas, columnas y celdas de cabecera con colspan/rowspan y las emite como tablas Markdown o HTML, lo que facilita su posterior carga en bases de datos o hojas de cálculo.
- Ingesta de documentos para RAG: el pipeline produce Markdown con encabezados y listas clasificados por LayoutNet, lo que mejora la segmentación semántica antes de generar embeddings en pipelines de recuperación aumentada.
- Procesamiento multilingüe de facturas y formularios: el enrutador envía cada línea al reconocedor adecuado, cubriendo documentos con texto latino, CJK, árabe o hebreo en una misma página sin configuración manual de idioma.
- Parseo en el navegador o en el edge: mediante `@llamaindex/liteparse-wasm` se puede procesar un PDF en el cliente sin enviar datos a un servidor, útil para aplicaciones con requisitos de privacidad o para reducir costes de backend.
- Automatización de back office documental: la CLI (`lit parse`) permite integrar el parseo en scripts y pipelines de CI/CD para convertir contratos, pólizas o expedientes a JSON con cajas delimitadoras y confianza OCR, habilitando revisiones automáticas de calidad.
- Extracción de bloques estructurados para anotación: con `--extract-blocks` se obtienen bloques JSON (encabezado, párrafo, tabla, figura) con sus cajas y vínculos a elementos de texto, útil para construir datasets de maquetación o entrenar modelos posteriores.

## Benchmarks y rendimiento

| Benchmark / metrica | OCRia-nano-1 | Indra | Marker | LiteParse con Tesseract |
|---|---|---|---|---|
| ParseBench-2 | 59,2 | 55,1 | 52,5 | 48,7 |
| Throughput (16 vCPU) | 27,8 páginas/s | no disponible | no disponible | no disponible |
| Latencia (1 core) | 426 ms/página | no disponible | no disponible | no disponible |

El autor indica que el pipeline es el doble de rápido que LiteParse con Tesseract y que supera a los parsers de CPU Indra y Marker en ParseBench-2. No se han publicado en la información disponible resultados de benchmarks estándar de NLP (MMLU, HumanEval, GSM8K), ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM: no requiere GPU; el pipeline está diseñado para ejecutarse en CPU.
- Modelos y runtime: 60-75 MB en total, incluyendo los archivos ONNX y ONNX Runtime (`lit models pull ocria-nano`).
- GPU recomendadas: no aplica; no se documenta soporte GPU.
- Consumer GPU: no aplica; el objetivo es CPU, navegador y edge.
- Throughput de referencia: 27,8 páginas/s en 16 vCPU; 426 ms por página en un solo núcleo.
- Despliegue: CLI de LiteParse (`pip install liteparse`, `npm i -g @llamaindex/liteparse` o `cargo install liteparse`), API de Python y Node.js, y WebAssembly para navegador y edge runtimes.
- Memoria: no disponible; el tamaño reducido de los modelos sugiere un consumo bajo, pero no se publican cifras de RAM.
- Selección parcial de modelos en WASM: es posible descargar solo un subconjunto (por ejemplo, `{ scripts: ["latin"], layout: false }` ocupa 1,5 MB).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ParseBench-2 | Licencia | Ejecucion |
|---|---|---|---|---|---|
| OCRia-nano-1 | 8,1M (pipeline) | no disponible | 59,2 | `ocria-nano-1-license` (other) | CPU, WASM, edge |
| OCRia-1 | 4B | no disponible | no disponible | no disponible | GPU (VLM) |
| Indra | no disponible | no disponible | 55,1 | no disponible | CPU |
| Marker | no disponible | no disponible | 52,5 | no disponible | CPU |
| LiteParse + Tesseract | no disponible | no disponible | 48,7 | no disponible | CPU |

OCRia-1 es el VLM de 4B del que se destila este pipeline; OCRia-nano-1 conserva 1/500 de sus parámetros. Indra, Marker y Tesseract son los parsers de CPU comparados en ParseBench-2. No se dispone de datos de parámetros, contexto ni licencia de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: los archivos son los que ejecuta LiteParse y no incluyen script de inferencia propio; deben usarse a través de LiteParse.
- Licencia propietaria (`ocria-nano-1-license`): es necesario revisar el archivo LICENSE antes de cualquier uso comercial o redistribución.
- No dispone de tool calling, agentes ni razonamiento multi-paso; no es adecuado como modelo conversacional ni para tareas generativas fuera del parseo documental.
- El rendimiento se ha medido en ParseBench-2, un benchmark del propio ecosistema de LlamaIndex; no hay validación independiente publicada en la información disponible.
- El reconocedor latino está cuantizado a int8; no se documenta el impacto en precisión de esta cuantización.
- La cobertura de escrituras se limita a latino, CJK, RTL (árabe y hebreo) y unas 17 escrituras adicionales; otras escrituras pueden no estar soportadas.
- No se documentan sesgos conocidos, tasas de alucinación (no aplica en sentido generativo) ni límites de tamaño de página o documento.
- El renderizado por defecto a 250 DPI condiciona la calidad del OCR; páginas de baja resolución o muy degradadas pueden reducir la precisión.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción aún incipiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/orz99/OCRia-nano-1
- Informe técnico: https://www.llamaindex.ai/ocria/ocria-nano-1-report.pdf
- Blog de presentación: https://www.llamaindex.ai/blog/introducing-ocria-nano-1
- Repositorio LiteParse: https://github.com/run-llama/liteparse
- Modelo OCRia-1: https://huggingface.co/llamaindex/OCRia-1
- Repositorio ParseBench: https://github.com/run-llama/ParseBench
