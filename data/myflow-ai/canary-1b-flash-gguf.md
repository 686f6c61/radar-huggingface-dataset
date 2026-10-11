# myflow-ai/canary-1b-flash-gguf

## Resumen

Canary 1B Flash es un modelo de reconocimiento automatico del habla (ASR) y traduccion de voz multilingue desarrollado por NVIDIA, dentro de la familia NeMo Canary. Se trata de un modelo encoder-decoder multitarea de tipo AED (attention encoder-decoder) con 883 millones de parametros declarados por el fabricante (890.042.496 reales en pesos safetensors), compuesto por un encoder FastConformer de 32 capas y un decoder Transformer de 4 capas. Soporta transcripcion en ingles, aleman, espanol y frances, ademas de traduccion bidireccional EN↔{DE, ES, FR}.

La ficha que nos ocupa, `myflow-ai/canary-1b-flash-gguf`, es una conversion a formato GGUF del modelo original `nvidia/canary-1b-flash`, preparada por el usuario `myflow-ai` para su uso con el runtime `transcribe.cpp` (proyecto handy-computer). El port esta fijado al commit upstream `a9a55e0` (2026-05-08) y validado contra la referencia NeMo en el commit `db53eda` del propio `transcribe.cpp`. Se distribuye en seis niveles de cuantizacion (F32, F16, Q8_0, Q6_K, Q5_K_M y Q4_K_M), con tamanos que van de 3,3 GB a 646 MB.

Su relevancia actual radica en que permite ejecutar un modelo ASR de calidad competitiva en hardware de consumo, incluso en CPU, con una degradacion minima de precision: la tasa de error de palabra (WER) sobre LibriSpeech test-clean se mantiene entre 1,59% y 1,65% en todas las cuantizaciones, frente al 1,62% del baseline F32. No es un modelo de streaming y no expone marcas de tiempo en este port v1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder multitarea tipo AED: encoder FastConformer (32 capas) + decoder Transformer (4 capas) |
| Parametros totales | 890.042.496 (883 M declarados por NVIDIA) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR; consume audio WAV mono a 16 kHz) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Ingles, aleman, espanol, frances (ASR); traduccion EN↔{DE, ES, FR} |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF |
| Runtime | transcribe.cpp |
| Modelo base | nvidia/canary-1b-flash |
| Repo | 0,8 GB |
| Streaming | No |
| Deteccion de idioma | No |
| Marcas de tiempo | Ninguna en el port v1 (experimental en upstream) |

## Arquitectura y entrenamiento

Canary 1B Flash sigue la arquitectura Canary descrita por NVIDIA: un encoder-decoder con encoder FastConformer y decoder Transformer. El encoder FastConformer, derivado de la linea Conformer, combina convoluciones y atencion para extraer representaciones acusticas eficientes, mientras que el decoder Transformer genera la secuencia de texto objetivo. El modelo es multitarea (multitask AED), lo que le permite alternar entre tareas de transcripcion (ASR) y traduccion de voz (AST) segun el token de tarea indicado. La extraccion de caracteristicas de audio se realiza sobre entradas WAV mono a 16 kHz.

Segun los datos disponibles en esta conversion, el modelo alcanza mas de 1000 RTFx sobre los conjuntos del open-asr-leaderboard, lo que lo situa como un modelo de altisima velocidad de inferencia. La informacion proporcionada no detalla el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO; estos datos corresponden a la model card upstream de NVIDIA y no se reproducen aqui. En esta conversion GGUF no se ha modificado la arquitectura, sino unicamente el formato y la precision de los pesos, validando numericamente el resultado contra la implementacion de referencia NeMo.

## Capacidades

- Transcripcion automatica del habla (ASR) en ingles, aleman, espanol y frances.
- Traduccion de voz bidireccional: EN→{DE, ES, FR} y {DE, ES, FR}→EN.
- Soporte de puntuacion y capitalizacion (PnC) en la salida, activable o no.
- Traduccion con o sin PnC (operacion multitarea).
- Procesamiento offline de audio (no streaming).
- Alta velocidad de inferencia (mas de 1000 RTFx en los datasets del open-asr-leaderboard segun NVIDIA).
- Marcas de tiempo a nivel de palabra y de segmento: experimental en upstream, no expuesta en este port v1.
- No incluye deteccion automatica de idioma ni tool calling ni capacidades de agente.

## Casos de uso

- Transcripcion de reuniones y notas de voz: el modelo convierte grabaciones de audio en texto en cuatro idiomas, con puntuacion y capitalizacion, lo que facilita la generacion de actas y resumenes posteriores.
- Subtitulado automatico de contenido audiovisual: dado que soporta ASR en EN, DE, ES y FR, puede emplearse para generar subtitulos base en produccion de video, con revision humana posterior al no exponer marcas de tiempo en esta version.
- Traduccion de voz en tiempo no real: con la tarea AST bidireccional, permite traducir una intervencion en aleman o frances directamente al ingles (o viceversa) sin pasar por una etapa separada de ASR y traduccion de texto.
- Atencion al cliente multilingue: transcripcion de llamadas en cualquiera de los cuatro idiomas para alimentar sistemas de analitica, control de calidad o busqueda sobre registros de contacto.
- Pipeline de accesibilidad: conversion de audio a texto para personas con discapacidad auditiva en entornos con poco hardware disponible, aprovechando las cuantizaciones Q4_K_M o Q5_K_M (646-734 MB) que caben en cualquier portatil.
- Procesamiento por lotes en servidores de CPU: al funcionar sin GPU (por ejemplo, con Vulkan o en CPU pura), permite transcribir grandes volumenes de audio en infraestructura convencional, con un factor de tiempo real reportado de 6,9 en CPU sobre un Ryzen 4750U.
- Indexacion y busqueda de archivos de audio: transcripcion masiva de podcasts o grabaciones para hacerlas buscables en texto, apoyandose en la velocidad del modelo para procesar horas de audio en minutos.
- Preprocesado para LLM: usar la transcripcion como entrada de un modelo de lenguaje que realice resumen, extraccion de entidades o clasificacion de la conversacion.

## Benchmarks y rendimiento

Resultados de WER sobre LibriSpeech test-clean (2620 utterances, decodificacion greedy, sin LM externo):

| Cuantizacion | Tamano | WER (LibriSpeech test-clean) |
|---|---:|---:|
| F32 | 3,3 GB | 1,62% |
| F16 | 1,7 GB | 1,62% |
| Q8_0 | 1,0 GB | 1,62% |
| Q6_K | 818 MB | 1,65% |
| Q5_K_M | 734 MB | 1,64% |
| Q4_K_M | 646 MB | 1,59% |

El baseline F32 es 1,62%. El valor autoinformado por NVIDIA en la model card upstream es 1,48%. Las diferencias entre cuantizaciones son de decimas de punto porcentual, lo que indica una degradacion practicamente nula por la cuantizacion.

Factor de tiempo real (RTF) reportado por `transcribe.cpp`:

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 99,6 |
| Apple M4 Max | CPU | 20,4 |
| AMD Ryzen 4750U | Vulkan | 14,4 |
| AMD Ryzen 4750U | CPU | 6,9 |

No se han publicado en la informacion disponible resultados comparativos de este port en otros benchmarks (por ejemplo, MLS, FLEURS o Common Voice) mas alla de LibriSpeech.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 3,3 GB (F32), 1,7 GB (F16), 1,0 GB (Q8_0), 818 MB (Q6_K), 734 MB (Q5_K_M) y 646 MB (Q4_K_M), sumando un pequeno margen para buffers de activaciones.
- GPU recomendadas: cualquier GPU con mas de 2 GB de VRAM. Para maximizar throughput, tarjetas de gama alta como A100, H100 o RTX 4090 quedan sobredimensionadas para este modelo, pero permitiran maximizar el numero de pistas concurrentes.
- GPU de consumo: cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, Apple Silicon (M1 en adelante) y practicamente cualquier GPU integrada moderna.
- CPU: es viable en CPU pura; un Ryzen 4750U reporta un RTF de 6,9, y el Apple M4 Max de 20,4, lo que permite transcripcion en tiempo real o mas rapido sin acelerador.
- Backends soportados en `transcribe.cpp`: Metal (macOS) y Vulkan (GPU generica), ademas de CPU.
- Opciones de despliegue: `transcribe.cpp` mediante el binario `transcribe-cli`; al ser GGUF, no esta pensado para vLLM, TGI o Ollama (que no soportan arquitecturas encoder-decoder AED de NeMo en este formato). Para el modelo original existen las rutas NeMo y Riva de NVIDIA.
- Latencia y throughput: mas de 1000 RTFx sobre los datasets del open-asr-leaderboard segun NVIDIA, lo que equivale a procesar mas de 1000 segundos de audio por segundo de computo en hardware adecuado. En los entornos medidos por el port, entre 6,9 y 99,6 veces tiempo real.
- Formatos de entrada: WAV mono a 16 kHz; es necesario remuestrear cualquier otra fuente (por ejemplo, con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Canary 1B Flash (este, GGUF) | 890 M | Audio 16 kHz mono, offline | EN, DE, ES, FR | CC-BY-4.0 | GGUF en HuggingFace via transcribe.cpp |
| nvidia/canary-1b-flash (original) | 883 M | Audio 16 kHz mono, offline | EN, DE, ES, FR | CC-BY-4.0 | Pesos NeMo en HuggingFace |
| nvidia/canary-1b-v2 | no disponible en la informacion | Audio, soporta marcas de tiempo mejoradas | 25 idiomas europeos | no disponible en la informacion | HuggingFace |
| OpenAI Whisper (familia) | 39 M - 1,55 B (segun variante) | Audio, offline | Multilingue (99 idiomas) | MIT (variantes abiertas) | HuggingFace, multiples runtimes |

La informacion proporcionada no incluye datos de rendimiento de estos modelos alternativos en los mismos benchmarks, por lo que no es posible establecer una comparacion cuantitativa directa. La ventaja principal de este port frente a otros runtimes es la disponibilidad en GGUF con seis niveles de cuantizacion y soporte nativo en `transcribe.cpp`.

## Limitaciones y advertencias

- No es un modelo de streaming: requiere el audio completo (o fragmentos) como entrada, por lo que no sirve para transcripcion en vivo con latencia minima sin una estrategia de troceado externa.
- No realiza deteccion automatica de idioma: es necesario indicar el idioma de origen, lo que puede complicar entornos con audio multilingue no etiquetado.
- No expone marcas de tiempo en este port v1, pese a que upstream las ofrece como caracteristica experimental. Esto limita su uso directo para subtitulado sincronizado.
- Solo cubre cuatro idiomas (EN, DE, ES, FR); no soporta otras lenguas, a diferencia de alternativas como Whisper.
- La traduccion solo funciona entre ingles y los otros tres idiomas; no se contemplan pares como DE↔FR o ES↔DE de forma directa.
- Riesgo de alucinacion: como cualquier modelo ASR generativo, puede producir texto plausible en tramos con ruido, silencio o solapamiento de voces, y fallar en dominios muy alejados del entrenamiento (jerga tecnica, nombres propios, acentos marcados).
- Sesgos: no se documentan en la informacion disponible analisis de sesgo por acento, genero o variedad dialectal; conviene evaluar en el dominio concreto antes de produccion.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribucion. Debe conservarse la referencia a NVIDIA y al autor de la conversion.
- Modelo comunitario: la conversion GGUF la mantiene un tercero (`myflow-ai`), no NVIDIA, por lo que el soporte y las actualizaciones dependen de ese autor.
- Metadatos incompletos: no se especifica la longitud maxima de audio soportada ni el token de contexto del decoder, lo que dificulta dimensionar memoria para audios muy largos.

## Enlaces

- Repositorio HuggingFace del port GGUF: https://huggingface.co/myflow-ai/canary-1b-flash-gguf
- Modelo base: https://huggingface.co/nvidia/canary-1b-flash
- Commit upstream fijado (a9a55e0): https://huggingface.co/nvidia/canary-1b-flash/commit/a9a55e0
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentacion del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/canary-1b-flash.md
- Commit de validacion en transcribe.cpp (db53eda): https://github.com/handy-computer/transcribe.cpp/tree/db53eda
- Referencia 1706.03762 (Attention Is All You Need): https://arxiv.org/abs/1706.03762
- Referencia 2104.02821: https://arxiv.org/abs/2104.02821
- Referencia 2409.13523: https://arxiv.org/abs/2409.13523
- Referencia 2503.05931: https://arxiv.org/abs/2503.05931
- Canary 1B V2 (modelo mas reciente de la familia): https://huggingface.co/nvidia/canary-1b-v2
- Documentacion NeMo ASR: https://docs.nvidia.com/nemo-framework/user-guide/latest/nemotoolkit/asr/models.html
- NVIDIA Developer Portal: https://developer.nvidia.com/
