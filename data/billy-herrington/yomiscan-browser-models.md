# Billy-Herrington/yomiscan-browser-models

## Resumen

YomiScan browser models es un paquete de artefactos de inferencia (modelos ONNX y ficheros auxiliares) publicado por Billy-Herrington para el motor en navegador de la extensión de Chrome YomiScan. No se trata de un modelo único entrenado por el autor, sino de una colección empaquetada de componentes de terceros exportados a ONNX y cuantizados para ejecutarse íntegramente en el cliente: detección de texto y bocadillos en páginas de manga, OCR de japonés, tokenización morfológica con UniDic, diccionario JMdict en SQLite y traducción japonés-inglés. El objetivo es ofrecer lectura y traducción de manga sin servidor ni cuenta de usuario.

El paquete combina cinco piezas con licencias distintas: un detector RT-DETR-v2 derivado de ogkalu/comic-text-and-bubble-detector (Apache-2.0), un OCR derivado de kha-white/manga-ocr-base (Apache-2.0) en dos variantes cuantizadas, un tokenizador lindera-wasm-unidic con el diccionario UniDic, una base de datos JMdict bajo CC BY-SA 4.0 y un modelo de traducción OPUS-MT ja-en de Helsinki-NLP exportado por Xenova. El repositorio ocupa 0,7 GB y se distribuye con `library_name: onnxruntime-web`, lo que indica que la ejecución prevista es vía WebGPU o CPU dentro del navegador.

Su relevancia es acotada pero concreta: demuestra un patrón de despliegue de pipelines de OCR y traducción completamente locales en el navegador, con verificación de integridad por tamaño y SHA-256 compilados en la extensión. No es un modelo de propósito general ni compite en benchmarks de razonamiento; es infraestructura de inferencia empaquetada para un caso de uso muy específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline heterogéneo: detector RT-DETR-v2, OCR tipo Vision Encoder-Decoder (manga-ocr-base), tokenizador lindera + UniDic, traducción Transformer seq2seq (OPUS-MT) |
| Parametros totales | no disponible (no se publican recuentos por componente) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (detector y traducción), q4 (OCR variante WebGPU), int8 (OCR variante CPU) |
| Idiomas soportados | ja, en |
| Licencia | mixta: Apache-2.0 (detector, OCR, traducción), MIT (lindera), BSD-3-Clause (UniDic), CC BY-SA 4.0 (JMdict) |
| Formato de pesos | ONNX (onnxruntime-web); tokenizador WebAssembly; diccionario SQLite |
| Tamano del repositorio | 0,7 GB |
| Componentes | detector 82,3 MiB; ocr-q4 88,2 MiB; ocr-int8 111,1 MiB; tokenizer 51,6 MiB; dictionary 119,3 MiB; translation-opus-ja-en 210,4 MiB |
| Runtime previsto | onnxruntime-web (WebGPU o CPU) |

## Arquitectura y entrenamiento

El paquete no entrena nada: reempaqueta y exporta modelos existentes. El detector es un RT-DETR-v2 (transformer de detección de objetos en tiempo real) exportado a ONNX en fp16 desde el checkpoint `16e8a622f91fabc6b5b65c96d32d1183f8843546` de ogkalu/comic-text-and-bubble-detector, con los pesos sin modificar salvo por formato y precisión. El OCR deriva de kha-white/manga-ocr-base, un modelo encoder-decoder para reconocimiento de texto japonés, exportado a ONNX en dos variantes: q4 para WebGPU e int8 para CPU; el dispositivo descarga solo una de las dos. La traducción usa el export fp16 de Xenova/opus-mt-ja-en sobre Helsinki-NLP/opus-mt-ja-en, un transformer seq2seq de OPUS-MT.

La capa lingüística se resuelve con lindera-wasm-unidic 2.1.0 (build WebAssembly de lindera con UniDic 2.1.2 embebido) para la segmentación morfológica del japonés, y con una base de datos SQLite derivada de JMdict (esquema 2) que conserva glosas en inglés y metadatos léxicos seleccionados, con índices de búsqueda normalizados. No se documentan detalles de entrenamiento (número de tokens, composición del dataset, RLHF/DPO) porque el autor no los aporta; corresponden a los proyectos upstream. La innovación destacable es de ingeniería de despliegue: pipeline completo en cliente con verificación de integridad por tamaño y SHA-256 compilados en la extensión y en `manifest.json`, sin subida de datos.

## Capacidades

- Detección de regiones de texto y bocadillos en páginas de manga mediante el detector RT-DETR-v2.
- OCR de texto japonés en imágenes de manga con manga-ocr-base (variantes q4 e int8).
- Segmentación morfológica del japonés y análisis léxico con lindera + UniDic.
- Búsqueda de palabras y glosas inglés mediante JMdict en SQLite.
- Traducción automática japonés-inglés con OPUS-MT ja-en.
- Ejecución completamente local en Chrome, sin servidor ni cuenta, con verificación de integridad de los ficheros descargados.
- Selección automática de variante OCR según el backend disponible (WebGPU o CPU).
- No soporta tool calling, function calling, agentes, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Lectura asistida de manga en el navegador: la extensión detecta bocadillos, aplica OCR y muestra la traducción al inglés en la propia página, con todo el procesamiento en el cliente.
- Aprendizaje de japonés sobre material nativo: el pipeline segmenta el texto con UniDic y consulta JMdict, de modo que el usuario puede ver la forma léxica y la glosa de cada palabra, no solo la traducción de la frase.
- Traducción de páginas escaneadas sin conexión: al descargarse los artefactos una vez, el OCR y la traducción funcionan sin red, útil en entornos con conectividad limitada.
- Prototipado de pipelines de OCR y traducción en navegador: sirve como referencia de empaquetado ONNX con cuantización q4/int8 y ejecución vía onnxruntime-web.
- Distribución de modelos con integridad verificable: el patrón de SHA-256 y tamaño compilados en la extensión es reutilizable para cualquier aplicación que descargue pesos desde un CDN.
- Investigación sobre OCR de manga: los artefactos permiten reproducir el comportamiento de manga-ocr-base en un entorno de navegador sin montar infraestructura de servidor.
- Archivado y consulta léxica japonesa: la base JMdict en SQLite puede reutilizarse en otras herramientas que necesiten glosas inglés-japonés bajo CC BY-SA 4.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el consumo es de memoria del navegador. El conjunto completo ronda los 663 MiB de ficheros, y en ejecución se carga solo la variante OCR elegida (88,2 MiB q4 o 111,1 MiB int8), más detector, tokenizador, diccionario y traducción.
- GPU recomendadas: cualquier GPU con soporte WebGPU en Chrome para la ruta `ocr-q4`; la ruta `ocr-int8` está pensada para CPU.
- GPU de consumo: el diseño apunta a equipos de usuario final, no a aceleradores de datacenter; no se documentan modelos concretos de GPU ni requisitos mínimos.
- Opciones de despliegue: onnxruntime-web dentro de Chrome, con tokenizador WebAssembly (lindera-wasm-unidic) y SQLite para el diccionario. No está pensado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | Contexto |
|---|---|---|---|---|---|
| YomiScan browser models | Pipeline OCR + traducción empaquetado | ja, en | Mixta (Apache-2.0, MIT, BSD-3, CC BY-SA 4.0) | ONNX, WASM, SQLite | no disponible |
| kha-white/manga-ocr-base | OCR de manga | ja | Apache-2.0 | PyTorch (upstream) | no disponible |
| Helsinki-NLP/opus-mt-ja-en | Traducción seq2seq | ja, en | Apache-2.0 | PyTorch (upstream) | no disponible |
| ogkalu/comic-text-and-bubble-detector | Detección de texto y bocadillos | no disponible | Apache-2.0 | PyTorch (upstream) | no disponible |

La comparación relevante no es de rendimiento sino de empaquetado: YomiScan agrupa los tres modelos upstream con cuantización y verificación de integridad para ejecución en navegador, mientras que los originales se distribuyen para frameworks de servidor.

## Limitaciones y advertencias

- No es un modelo único ni un modelo de propósito general: es un paquete de artefactos con componentes de terceros; no debe citarse como modelo propio del autor.
- Licencia mixta: cada componente conserva sus términos. El diccionario JMdict derivado se comparte bajo CC BY-SA 4.0 y exige atribución a EDRDG y a James William Breen; UniDic bajo BSD-3-Clause; lindera bajo MIT. El uso comercial requiere revisar cada licencia por separado.
- Solo cubre japonés-inglés; no hay soporte documentado para otros pares de idiomas.
- Riesgo de error en cascada: un fallo de detección o de OCR se propaga a la traducción, y la calidad final depende del eslabón más débil.
- El OCR está especializado en texto de manga; su rendimiento en otros dominios (documentos, manuscritos, verticalidad atípica) no está documentado.
- No se publican métricas de calidad (CER del OCR, BLEU/COMET de la traducción) ni benchmarks; no es posible comparar numéricamente con alternativas.
- No soporta tool calling, agentes ni multimodalidad general; su ámbito es estrictamente el pipeline descrito.
- La ejecución depende de WebGPU o CPU en Chrome; el rendimiento en otros navegadores o en equipos sin WebGPU no está documentado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de uso que respalde su robustez en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Billy-Herrington/yomiscan-browser-models
- Repositorio de la extensión YomiScan: https://github.com/GabrielTeixeira88/yomiscan
- Detector upstream: https://huggingface.co/ogkalu/comic-text-and-bubble-detector
- OCR upstream: https://huggingface.co/kha-white/manga-ocr-base
- Traducción upstream (export): https://huggingface.co/Xenova/opus-mt-ja-en
- Traducción upstream (original): https://huggingface.co/Helsinki-NLP/opus-mt-ja-en
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Tokenizador lindera: https://github.com/lindera/lindera
- JMdict (EDRDG): https://www.edrdg.org/wiki/JMdict-EDICT_Dictionary_Project.html
- Licencia EDRDG: https://www.edrdg.org/edrdg/licence.html
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
