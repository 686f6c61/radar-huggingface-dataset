# byrizki/rten-models

## Resumen

RustO Pre-trained RTen OCR Models es una coleccion de modelos de vision por computador para reconocimiento optico de caracteres (OCR) publicada por el desarrollador byrizki bajo el identificador `byrizki/rten-models`. No se trata de un modelo de lenguaje generativo, sino de un catalogo de pesos preentrenados convertidos al formato nativo de RTen, el motor de inferencia escrito en Rust puro del proyecto de Robert Knight. El objetivo es ofrecer inferencia OCR neuronal de alta velocidad y sin dependencias externas en Rust, Python, Node.js, WebAssembly, Android, iOS, React Native, C# .NET, Go y Flutter.

El repositorio agrupa tres familias de modelos: los modelos propios Indra OCR (deteccion, reconocimiento multilingue, orden de lectura, orientacion de pagina, clasificacion de escritura y reconocimiento de formulas matematicas), las series PP-OCRv4, PP-OCRv5 y PP-OCRv6 en distintas tallas (tiny, small, medium, mobile, server) con variantes cuantizadas INT8, y un conjunto de reconocedores multilingues especificos para arabe, cirilico, devanagari, griego, eslavo oriental, coreano, latin, tamil, telugu, thai, japones, chino tradicional y kannada.

La relevancia actual del paquete reside en su enfoque de despliegue: al distribuir los pesos en formato RTen y exponerlos por URL directa con cabeceras CORS, permite integrar OCR en aplicaciones cliente (navegador, movil, escritorio) sin depender de un servidor Python ni de runtime pesados. El repositorio ocupa 0,9 GB y se publica con licencia MIT, lo que facilita su uso comercial. No se dispone de informacion sobre el numero de parametros, la longitud de contexto ni los idiomas exactos soportados por cada reconocedor mas alla de lo indicado en el catalogo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes neuronales de deteccion y reconocimiento de texto (familia PP-OCR e Indra OCR) convertidas a formato RTen; arquitectura interna por modelo no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision image-to-text, no de lenguaje) |
| Tipos de cuantizacion | INT8 disponible en las variantes `ppocrv6-tiny-int8`, `ppocrv6-small-int8` y `ppocrv6-medium-int8`; el resto de pesos se distribuyen en formato RTen sin cuantizar |
| Idiomas soportados | Reconocimiento multilingue mediante reconocedores especificos: arabe, cirilico, devanagari (hindi), griego, eslavo oriental, coreano, latin, tamil, telugu, thai, japones, chino tradicional y kannada; CJK y RTL adicionales en Indra OCR |
| Licencia | MIT |
| Formato de pesos | RTen (`.rten`), con diccionarios en `.txt` y metadatos en `.json` |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna de cada red. Por el catalogo se deduce una estructura de pipeline OCR clasica en dos etapas: un modelo de deteccion de regiones de texto (`det.rten`) y un modelo de reconocimiento (`rec.rten`) que transcribe cada region detectada. Sobre esa base, Indra OCR anade modulos auxiliares: un clasificador de orientacion de pagina, un ordenador neuronal de lectura y columnas, un clasificador de sistema de escritura, un detector de formulas matematicas y un codificador/decodificador autorregresivo para convertir formulas a LaTeX.

Las series PP-OCRv4, v5 y v6 corresponden a los modelos publicos de PaddleOCR, aqui convertidos a RTen y distribuidos en varias tallas. No se especifican en la model card el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de ajuste fino con RLHF o DPO; al tratarse de modelos OCR, esos conceptos no aplican de forma directa. La innovacion tecnica destacable es el propio formato RTen: un runtime en Rust puro que elimina la dependencia de ONNX Runtime, PyTorch o librerias nativas, y que habilita despliegue en WebAssembly y movil con el mismo binario de pesos.

## Capacidades

- Deteccion de regiones de texto en imagenes de documentos y escenas.
- Reconocimiento de texto impreso en multiples sistemas de escritura mediante reconocedores especializados.
- Reconocimiento de texto en arabe, persa y urdu (RTL) y en chino, japones y coreano (CJK) con los modelos Indra OCR.
- Clasificacion de orientacion de pagina (0, 90, 180 y 270 grados) y de direccion de linea de texto.
- Ordenacion neuronal de lectura y deteccion de columnas para reconstruir el flujo de lectura de documentos complejos.
- Deteccion y transcripcion de formulas matematicas a LaTeX mediante codificador y decodificador autorregresivo.
- Correccion de perspectiva y dewarping 3D de documentos capturados con camara.
- Analisis de layout documental con dos esquemas: CDLA (10 clases) y PubLayNet (5 clases).
- Distribucion de pesos accesible por URL directa con CORS, apta para carga en cliente.
- Verificacion de integridad mediante sumas SHA256 en `SHA256SUMS`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de vision, no un LLM.

## Casos de uso

- Digitalizacion de facturas y albaranes: el pipeline deteccion + reconocimiento + layout permite extraer lineas de texto y su posicion en la pagina, y el modulo de dewarping corrige fotos tomadas con movil antes de la transcripcion.
- Escaneo de documentos en aplicaciones moviles: al distribuirse en formato RTen con soporte para Android, iOS y React Native, el OCR puede ejecutarse en el dispositivo sin enviar imagenes a un servidor, lo que reduce latencia y mejora la privacidad.
- Procesamiento de documentos historicos o multilingues: los reconocedores de cirilico, griego, devanagari, tamil, telugu y thai permiten transcribir corpus en escrituras no latinas sin cambiar de motor.
- Extraccion de formulas en articulos cientificos: el modulo `math_enc.rten` y los decodificadores `math_dec_init.rten` y `math_dec_step.rten` convierten expresiones matematicas en LaTeX para su reutilizacion en editores o pipelines de publicacion.
- Analisis de layout en sistemas de gestion documental: los modelos `layout_cdla.rten` y `layout_publaynet.rten` clasifican bloques (titulo, parrafo, tabla, figura) para alimentar motores de busqueda o sistemas RAG sobre PDF.
- OCR en el navegador mediante WebAssembly: el formato RTen y las cabeceras CORS permiten cargar los pesos desde Hugging Face y ejecutar la inferencia en cliente para aplicaciones de accesibilidad o lectura de capturas.
- Preprocesado para pipelines de datos: la clasificacion de orientacion y de sistema de escritura permite enrutar cada imagen al reconocedor adecuado de forma automatica antes de la transcripcion.
- Digitalizacion de documentos en arabe o chino tradicional: los reconocedores `rec_rtl.rten` y `multilingual/ppocrv4_rec_chinese_cht.rten` cubren idiomas que los modelos latinos no manejan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision (CER, WER), velocidad de inferencia ni comparaciones cuantitativas con otros motores OCR.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por el tamano de los pesos, las variantes tiny e INT8 (del orden de megabytes) caben en cualquier GPU consumer e incluso en CPU.
- Las variantes `ppocrv6-medium` (60 MB de deteccion y 74 MB de reconocimiento) y `ppocrv5-server` / `ppocrv4-server` (hasta 109 MB por componente) requieren mas memoria, pero siguen siendo manejables en GPUs de gama media.
- Cabe en GPU consumer: si, practicamente todas las variantes; las tallas tiny, small e INT8 estan pensadas para dispositivos de bajos recursos.
- Despliegue: el runtime previsto es RTen (Rust puro), con bindings para Rust, Python, Node.js, WebAssembly, Android, iOS, React Native, C# .NET, Go y Flutter. No se documenta soporte directo para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| byrizki/rten-models (Indra OCR + PP-OCR) | OCR deteccion + reconocimiento | no disponible | no aplica | MIT | RTen | Hugging Face, descarga directa con CORS |
| PaddleOCR (PP-OCRv4/v5/v6 original) | OCR deteccion + reconocimiento | no disponible en esta ficha | no aplica | Apache 2.0 (proyecto PaddleOCR) | Paddle / ONNX | Repositorio oficial de PaddlePaddle |
| Tesseract OCR | OCR clasico (LSTM) | no disponible | no aplica | Apache 2.0 | Propio | Repositorio oficial |
| EasyOCR | OCR deteccion + reconocimiento | no disponible | no aplica | Apache 2.0 | PyTorch | Repositorio oficial |

La comparativa se limita a caracteristicas generales porque no se dispone de datos de rendimiento del modelo evaluado ni de los alternativos en la informacion proporcionada. La diferencia principal de `byrizki/rten-models` frente a PaddleOCR, Tesseract o EasyOCR es el formato de pesos RTen y el soporte multiplataforma sin dependencias nativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre, no razona y no soporta tool calling ni agentes.
- No se documentan sesgos especificos; al ser modelos OCR, los errores tipicos seran confusiones de caracteres en escrituras poco representadas o en imagenes de baja calidad.
- Riesgo de alucinacion en el sentido de transcripciones incorrectas: el reconocimiento puede producir texto plausible pero erroneo en regiones borrosas, rotadas o con fuentes atipicas.
- La calidad depende del reconocedor elegido; usar un modelo latin para texto cirilico o CJK degradara el resultado.
- No se especifican los idiomas exactos cubiertos por cada reconocedor mas alla del nombre del sistema de escritura.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar las sumas SHA256 antes de desplegar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad.
- No hay informacion sobre el proceso de entrenamiento ni sobre la procedencia exacta de los pesos PP-OCR convertidos; para produccion conviene auditar la conversion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/byrizki/rten-models
- Proyecto RTen: https://github.com/robertknight/rten
- Proyecto RustO! (`rusto-rs`): https://github.com/byrizki/rusto-rs
- Acceso directo a pesos: https://huggingface.co/byrizki/rten-models/resolve/main/<folder>/<filename>
- Sumas de verificacion: `SHA256SUMS` dentro del repositorio
