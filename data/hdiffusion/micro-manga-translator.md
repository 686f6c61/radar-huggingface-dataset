# HDiffusion/micro-manga-translator

## Resumen

micro-manga-translator es un paquete de modelos ONNX publicado por HDiffusion que implementa un pipeline completo de traduccion de manga japones a ingles ejecutado integramente en el navegador mediante WebGPU y onnxruntime-web. No se trata de un unico modelo entrenado por el autor, sino de una coleccion de tres componentes de terceros empaquetados y, en un caso, convertidos a ONNX: un detector y reconocedor de texto PP-OCRv6 especializado en manga, un modelo de inpainting MI-GAN para borrar el texto original y un traductor neuronal ja→en derivado de Sugoi v4.

El interes tecnico reside en la cadena de procesamiento: deteccion de bocadillos y texto, OCR, traduccion, eliminacion del texto original mediante inpainting y reescritura del texto traducido, todo sin salir del cliente. Esto elimina la necesidad de infraestructura de servidor y permite procesar paginas de manga en local, algo relevante para privacidad y para aplicaciones de escritorio o extensiones de navegador.

El componente de traduccion es un transformer fairseq de 6 capas de encoder y 6 de decoder con dimension oculta 1024, reconvertido desde ctranslate2 a PyTorch y exportado a dos grafos ONNX en fp16. El repositorio ocupa 0,7 GB y la licencia es mixta: cada subcarpeta tiene sus propios terminos, con la restriccion critica de que el traductor Sugoi v4 es solo para investigacion y prohibe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de tres modelos ONNX: PP-OCRv6_manga (deteccion + reconocimiento de texto), MI-GAN (inpainting) y transformer fairseq 6+6 capas, d=1024 (traduccion) |
| Parametros totales | no disponible (no se publica el recuento agregado ni por componente) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (encoder y decoder del traductor exportados en fp16 ONNX); no se documentan otras cuantizaciones |
| Idiomas soportados | japones (ja) y ingles (en); traduccion unidireccional ja→en |
| Licencia | mixta: Apache-2.0 (PP-OCRv6_manga), MIT (MI-GAN), terminos NTT solo investigacion sin uso comercial (Sugoi v4) |
| Formato de pesos | ONNX (encoder.onnx, decoder.onnx, tokenizer.json, mas grafos ONNX de OCR e inpainting) |

## Arquitectura y entrenamiento

El pipeline combina tres etapas independientes. La primera es PP-OCRv6_manga v0.3 de Kellenok, un detector y reconocedor de texto sin modificaciones, bajo licencia Apache-2.0. La segunda es MI-GAN de Picsart-AI-Research, exportado a ONNX por anyisalin, que realiza el inpainting de las regiones de texto para eliminar el original antes de reescribir. La tercera es el traductor: un transformer fairseq de 6 capas de encoder y 6 de decoder con dimension 1024, derivado de Sugoi v4 ja→en de entai2965 en formato ctranslate2.

La conversion del traductor es el unico trabajo de ingenieria documentado por el autor. Se parseo directamente el `model.bin` de ctranslate2, se reconstruyo el transformer fairseq en PyTorch y se verifico token a token contra ctranslate2. Despues se exportaron dos grafos ONNX: `encoder.onnx` con entradas `input_ids[B,S]` y `attention_mask[B,S]` que produce `hidden[B,S,1024]`, y `decoder.onnx` con entradas `tokens[B,T]`, `hidden` y `attention_mask` que devuelve log-probabilidades de la ultima posicion `[B,V]`. El decoder no incluye KV cache, lo que implica recalcular el prefijo en cada paso de decodificacion. El `tokenizer.json` contiene las piezas y puntuaciones sentencepiece unigram y los vocabularios del modelo.

No se documentan datos de entrenamiento propios, numero de tokens, composicion del dataset ni fases de RLHF o DPO, ya que el autor no entrena ningun componente: todos son modelos de terceros reempaquetados o convertidos.

## Capacidades

- Deteccion y reconocimiento de texto en paginas de manga japones (OCR especializado en tipografia de manga mediante PP-OCRv6_manga).
- Traduccion japones a ingles de texto de bocadillos y rotulos mediante Sugoi v4.
- Inpainting de regiones de texto para borrar el original y dejar espacio limpio para el texto traducido.
- Reescritura del texto traducido sobre la imagen procesada (el pipeline completo de la pagina web).
- Ejecucion integra en el navegador sobre WebGPU con onnxruntime-web, sin backend de servidor.
- Procesamiento local de imagenes, sin envio de datos a servicios externos.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio ni modo thinking.

## Casos de uso

- Lectura de manga en el navegador: una extension o pagina web carga el pipeline ONNX y traduce las paginas sobre la marcha, aprovechando que todo el procesamiento ocurre en el cliente con WebGPU y sin subir imagenes a un servidor.
- Herramientas de accesibilidad para lectores de manga japones: el OCR y la traduccion permiten generar versiones en ingles de obras no licenciadas en mercados angloparlantes para uso personal o de investigacion, respetando la restriccion de no comercialidad del traductor.
- Investigacion en traduccion automatica de bajo recurso: el par ja→en con dominio manga permite estudiar errores de traduccion en jerga, onomatopeyas y registros coloquiales usando un modelo ligero de 6+6 capas.
- Prototipado de pipelines de vision + NLP en el navegador: sirve como referencia de integracion de OCR, inpainting y traduccion en un solo flujo ONNX con onnxruntime-web, util para equipos que quieran replicar la arquitectura en otros dominios.
- Archivado y catalogacion de scans: el OCR de manga permite extraer texto de paginas escaneadas para indexacion o busqueda, aunque el uso comercial queda limitado por la licencia del traductor.
- Demos educativas de WebGPU: el repositorio ejemplifica la exportacion de un modelo ctranslate2 a ONNX fp16 y su ejecucion en el navegador, material didactico para cursos de despliegue de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio pesa 0,7 GB en total, pero no se desglosa el tamano por componente ni se indica el consumo en GPU.
- GPU recomendadas: no disponible. Al ejecutarse sobre WebGPU, depende del soporte del navegador y del driver; se requiere un navegador con WebGPU habilitado.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el diseno orientado a WebGPU sugiere que el objetivo es ejecucion en GPU integradas o de consumo, pero no se aportan requisitos minimos.
- Opciones de despliegue: onnxruntime-web con backend WebGPU es el unico entorno documentado; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| micro-manga-translator (este) | Pipeline ONNX OCR + inpainting + traduccion | no disponible | no disponible | Mixta (Sugoi v4 solo investigacion) | Hugging Face, 0 descargas |
| Sugoi v4 ja→en (entai2965) | Traduccion ja→en | no disponible | no disponible | Terminos NTT, solo investigacion | Hugging Face |
| PP-OCRv6_manga (Kellenok) | OCR de manga | no disponible | no aplica | Apache-2.0 | Hugging Face |
| MI-GAN (Picsart-AI-Research) | Inpainting | no disponible | no aplica | MIT | GitHub y Hugging Face via anyisalin/migan-onnx |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia del traductor Sugoi v4 (terminos NTT) restringe el uso a investigacion con fines de analisis de informacion y prohibe explicitamente el uso comercial; cualquier producto que integre este pipeline hereda esa restriccion.
- La licencia es mixta y cada subcarpeta tiene sus propios terminos; es obligatorio revisar el `LICENSE` de cada carpeta antes de redistribuir.
- El decoder ONNX no incluye KV cache, por lo que la decodificacion autoregresiva recalcula el prefijo en cada paso y es mas lenta que una implementacion con cache.
- Solo soporta la direccion ja→en; no hay traduccion inversa ni otros pares de idiomas.
- No se documentan sesgos, tasas de alucinacion ni evaluaciones de calidad de traduccion; al ser un modelo de traduccion automatica, es esperable que falle en jerga, onomatopeyas y referencias culturales.
- El OCR esta especializado en tipografia de manga; su rendimiento en otros dominios no esta documentado.
- El modelo es reciente (creado en noviembre de 2026) y no tiene descargas ni likes, por lo que no hay evidencia de uso en produccion ni validacion externa.
- La ejecucion depende de WebGPU y onnxruntime-web; la compatibilidad entre navegadores y drivers no esta garantizada.
- No se documentan requisitos minimos de hardware, latencia ni throughput, lo que dificulta planificar despliegues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HDiffusion/micro-manga-translator
- PP-OCRv6_manga (Kellenok): https://huggingface.co/Kellenok/PP-OCRv6_manga
- MI-GAN (repositorio original): https://github.com/Picsart-AI-Research/MI-GAN
- MI-GAN ONNX (anyisalin): https://huggingface.co/anyisalin/migan-onnx
- Sugoi v4 ja→en ctranslate2 (entai2965): https://huggingface.co/entai2965/sugoi-v4-ja-en-ctranslate2
