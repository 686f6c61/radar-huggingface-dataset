# aalberrty/ehshoko-models-public

## Resumen

EhShoko models public es un repositorio de modelos convertidos para inferencia en dispositivo (on-device) en iOS, publicado por el desarrollador aalberrty. No se trata de un modelo entrenado por el autor, sino de una coleccion de seis artefactos de vision y lenguaje reconvertidos a Core ML y GGUF para alimentar las funciones de traduccion de paginas de EhShoko, un lector de manga gratuito y no comercial para iOS cuyo codigo fuente es publico. El repositorio agrupa un detector de texto y bocadillos de comic, un detector de layout de pagina, un OCR de manga, dos modelos de inpainting basados en LaMa y un modelo de traduccion de 4.022.468.096 parametros (GalTransl-v4-4B-2601).

El componente de mayor tamano es el modelo de traduccion, derivado de SakuraLLM/GalTransl-v4-4B-2601 y requantizado de Q6_K a Q4_K_M con `llama-quantize --allow-requantize` de llama.cpp. El resto de artefactos son conversiones a Core ML con precision de 16 o 32 bits a partir de pesos ONNX, TorchScript o checkpoints originales. El repositorio ocupa 3,1 GB y no tiene descargas ni likes en el momento de la consulta.

La relevancia de esta ficha es acotada: no es un modelo fundacional nuevo ni publica benchmarks, sino un ejemplo practico de pipeline de inferencia local para traduccion de manga en dispositivos Apple. Cada carpeta conserva la licencia de su modelo de origen, por lo que el repositorio no tiene una licencia unica y varias de sus piezas son estrictamente no comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo de traduccion es un LLM de 4B; el resto son detectores, OCR e inpainting) |
| Parametros totales | 4.022.468.096 (modelo de traduccion; el resto no disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (modelo de traduccion, requantizado desde Q6_K); Core ML con float16 y float32 en el resto |
| Idiomas soportados | no disponible |
| Licencia | other (agregada); por carpeta: Apache-2.0, CC BY-NC-SA 4.0 y MIT + Apache-2.0 |
| Formato de pesos | safetensors, GGUF (Q4_K_M), Core ML `.mlpackage`, ONNX (origen) |

## Arquitectura y entrenamiento

El autor no entrena ningun modelo: convierte artefactos existentes a formatos ejecutables en iPhone. El modelo de traduccion `mt-galtransl-v4-4b/1` procede de SakuraLLM/GalTransl-v4-4B-2601 en formato GGUF Q6_K y se ha requantizado a Q4_K_M con la herramienta de llama.cpp, manteniendo el esquema de pesos GGUF para su uso con motores compatibles. El resto de piezas se convierten a Core ML: `det-v4s/1` parte de un ONNX int8 (`detector-v4-s_int8.onnx`) reconstruido a float y convertido a float16; `det-rtmdet2/1` es un RTMDet de layout de manga a 1024 px convertido de ONNX a Core ML float16 con reescritura de un bloque para permitir la conversion; `ocr-cpt2/1` es manga-ocr-base-CPT v2 convertido como encoder mas decoder de un paso en float16; `inp-lama-manga/1` es un fine-tune de LaMa a 512x512 en float16; e `inp-big-lama/1` es big-lama a 512x512 en float32.

No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de RLHF o DPO, porque el autor no entrena. La innovacion tecnica destacable es de ingenieria de despliegue: conversion a Core ML con precision reducida, verificacion de integridad por tamano y SHA-256 en la app, versionado por carpeta (`<modelo>/<version>/<ficheros>`) sin reemplazo de ficheros, y uso de `--allow-requantize` para bajar el modelo de traduccion a Q4_K_M.

## Capacidades

- Deteccion de texto y bocadillos en paginas de comic y manga (`det-v4s/1`).
- Deteccion de layout de pagina de manga a 1024 px (`det-rtmdet2/1`).
- OCR de texto japones en manga (`ocr-cpt2/1`), con encoder y decoder de un paso.
- Inpainting de regiones en imagenes de manga y anime a 512x512 (`inp-lama-manga/1` e `inp-big-lama/1`), util para eliminar texto original tras el OCR.
- Traduccion de texto con un LLM de 4B (`mt-galtransl-v4-4b/1`), orientado a traduccion de dialogos y narrativa.
- Inferencia on-device en iOS mediante Core ML y motores compatibles con GGUF.
- Verificacion de integridad de ficheros por SHA-256 en el cliente EhShoko.
- No se documentan capacidades de tool calling, agentes, vision general, audio ni modo thinking.

## Casos de uso

- Traduccion de manga en dispositivo: el pipeline encadena deteccion de bocadillos, OCR, inpainting y traduccion con el modelo de 4B, todo local, sin enviar imagenes a servidores externos.
- Lector de manga para iOS sin conexion: la app descarga los ficheros y los ejecuta en el telefono, lo que permite leer y traducir paginas en modo avion.
- Prototipado de pipelines de vision para comic: los detectores RTMDet y detector-v4-s sirven para segmentar paginas y localizar globos de texto antes de OCR.
- Digitalizacion y localizacion de catalogos de manga: el OCR y el inpainting permiten extraer texto y limpiar la imagen para sustitucion por traducciones.
- Investigacion en traduccion automatica de dominio especifico: el modelo GalTransl de 4B puede evaluarse como baseline de traduccion de dialogos con licencia no comercial.
- Distribucion de modelos en apps moviles: el esquema de carpetas versionadas con checksums sirve de referencia para empaquetar y actualizar modelos en produccion.
- Evaluacion de conversiones Core ML: util para comparar precision float16 frente a float32 en detectores e inpainting sobre hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio esta pensado para ejecucion en iPhone mediante Core ML; no se especifican modelos de dispositivo compatibles.
- Modelo de traduccion: 4.022.468.096 parametros en Q4_K_M, aproximadamente 2,3-2,5 GB de pesos; requiere motor GGUF (llama.cpp u compatible) y RAM suficiente para el modelo mas el contexto.
- Inpainting big-lama en float32 a 512x512: mayor huella de memoria que la version float16 de AnimeMangaInpainting.
- Detectores y OCR en float16: huella reducida, adecuados para GPU o Neural Engine de Apple.
- No se documentan requisitos de VRAM para GPU de escritorio, modelos de GPU recomendados, latencia ni throughput.
- Opciones de despliegue: Core ML en iOS; llama.cpp para el GGUF; no se confirma soporte de vLLM, TGI u Ollama.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| EhShoko mt-galtransl-v4-4b/1 | 4.022.468.096 | no disponible | CC BY-NC-SA 4.0 | GGUF Q4_K_M | Requantizacion de GalTransl-v4-4B-2601 |
| SakuraLLM/GalTransl-v4-4B-2601 (original) | 4B (aproximado) | no disponible | CC BY-NC-SA 4.0 | GGUF Q6_K | Modelo de origen, no comercial |
| ogkalu/comic-text-and-bubble-detector (original) | no disponible | no disponible | Apache-2.0 | ONNX int8 | Detector de texto y bocadillos |
| fumetodev/rtmdet-manga-layout-onnx (original) | no disponible | no disponible | Apache-2.0 | ONNX | Detector de layout a 1024 px |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no tiene licencia unica: cada carpeta se rige por la licencia de su modelo de origen y debe respetarse por separado.
- `ocr-cpt2/1` y `mt-galtransl-v4-4b/1` son CC BY-NC-SA 4.0: prohibido el uso comercial, obligacion de atribucion y de compartir derivados bajo la misma licencia.
- SakuraLLM exige marcar como traduccion automatica cualquier texto generado con sus modelos alli donde se publique.
- Ningun autor original ha revisado ni respaldado estas conversiones; la calidad de las mismas no esta validada por terceros.
- La requantizacion a Q4_K_M puede degradar la calidad de traduccion respecto al Q6_K original.
- Riesgo de alucinacion y errores de traduccion inherente al modelo de 4B, especialmente en dialogos con jerga o contexto cultural japones.
- El OCR esta especializado en manga japones; no se documenta soporte para otros idiomas.
- No se publican benchmarks, evaluaciones de sesgo ni metricas de fidelidad de traduccion.
- El autor advierte que la app solo acepta ficheros cuyo tamano y SHA-256 coincidan con el checksum, por lo que modificaciones locales rompen la verificacion.
- No se documentan requisitos minimos de dispositivo ni latencias, lo que dificulta planificar produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aalberrty/ehshoko-models-public
- Proyecto EhShoko: https://github.com/aalberrty/EhShoko
- Modelo de traduccion original: https://huggingface.co/SakuraLLM/GalTransl-v4-4B-2601
- Detector de texto y bocadillos: https://huggingface.co/ogkalu/comic-text-and-bubble-detector
- Detector de layout RTMDet: https://huggingface.co/fumetodev/rtmdet-manga-layout-onnx
- OCR manga-ocr-base-CPT: https://huggingface.co/muscgab/manga-ocr-base-CPT
- OCR base original: https://huggingface.co/kha-white/manga-ocr-base
- Inpainting AnimeMangaInpainting: https://huggingface.co/dreMaz/AnimeMangaInpainting
- LaMa (Samsung Research): https://github.com/advimman/lama
- Pesos big-lama para lama-cleaner: https://github.com/Sanster/models/releases/tag/add_big_lama
