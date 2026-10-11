# myflow-ai/parakeet-rnnt-0.6b-gguf

## Resumen

parakeet-rnnt-0.6b-gguf es una conversión a formato GGUF del modelo de reconocimiento automático de voz nvidia/parakeet-rnnt-0.6b, publicada por el usuario myflow-ai para su uso con el motor transcribe.cpp. El modelo original es un sistema ASR de tipo FastConformer-Transducer desarrollado conjuntamente por los equipos de NVIDIA NeMo y Suno.ai, con aproximadamente 600 millones de parámetros (616.736.257 exactos) y licencia CC-BY-4.0.

Se trata de un modelo de transcripción de voz en inglés, offline y no streaming: recibe un fichero de audio y devuelve texto en minúsculas y sin puntuación mediante decodificación greedy RNN-T, sin modelo de lenguaje externo. No traduce ni detecta idioma, y genera timestamps a nivel de token. Su relevancia práctica está en que ofrece una calidad de transcripción muy alta (1,62 % de WER en LibriSpeech test-clean) en un paquete de menos de 500 MB en su cuantización Q4_K_M, ejecutable en CPU o GPU de consumo sin dependencias de Python ni de CUDA.

Esta ficha se centra en el artefacto GGUF publicado por myflow-ai, que replica la conversión de referencia mantenida en el repositorio handy-computer/parakeet-rnnt-0.6b-gguf. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que debe tratarse como un espejo no validado de forma independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-Large (encoder Conformer con atencion linealmente escalable) + decoder RNN-T (transducer) |
| Parametros totales | 616.736.257 (~0.6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica: modelo ASR offline sin ventana de tokens; procesa el audio completo del fichero |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (ingles unicamente) |
| Licencia | CC-BY-4.0 (heredada del modelo base) |
| Formato de pesos | GGUF |
| Biblioteca de inferencia | transcribe.cpp |
| Tamano del repositorio | 0.7 GB |
| Entrada de audio | WAV mono a 16 kHz (se requiere conversion previa con ffmpeg) |
| Streaming | no |
| Traduccion | no |
| Deteccion de idioma | no |
| Timestamps | a nivel de token |
| Modelo base | nvidia/parakeet-rnnt-0.6b |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura FastConformer-Transducer en su variante XL: un encoder FastConformer-Large de unos 600M de parametros que combina bloques de autoatencion multi-cabeza con codificacion posicional relativa y convoluciones depthwise separables, junto con un decoder de tipo RNN-T (transducer) que modela la alineacion entre frames acusticos y tokens de salida. La decodificacion es greedy, sin modelo de lenguaje externo ni shallow fusion. El articulo de referencia asociado en los metadatos es el de FastConformer (arXiv:2305.05084), centrado en atencion linealmente escalable para reconocimiento de voz eficiente.

Los detalles concretos del entrenamiento del modelo base (numero de tokens de audio, composicion exacta del dataset, uso de RLHF o DPO, que no aplican a un sistema ASR) no estan disponibles en la informacion proporcionada; la model card upstream reproduce en el repositorio aparece truncada. La model card de esta conversion indica que los pesos se portaron desde el commit upstream c0c1f09, fijado el 2026-05-10, y que el resultado se valido numericamente contra la implementacion de referencia de NeMo usando el commit 42528dd de transcribe.cpp en la misma fecha.

La innovacion practica de esta publicacion no esta en la arquitectura sino en el empaquetado: cuantizaciones GGUF que reducen el modelo desde 2,47 GB (F32) hasta 476 MB (Q4_K_M) manteniendo el WER practicamente identico, y backends de ejecucion en Metal, Vulkan y CPU dentro del propio motor transcribe.cpp.

## Capacidades

- Transcripcion de voz a texto en ingles sobre audio offline (no streaming), con salida en minusculas y sin puntuacion.
- Decodificacion greedy RNN-T sin modelo de lenguaje externo, lo que simplifica el despliegue pero limita la correccion contextual.
- Generacion de timestamps a nivel de token, utilizables para derivar marcas temporales de palabra o segmento.
- Ejecucion en CPU, GPU con Metal y GPU con Vulkan a traves de transcribe.cpp, sin dependencias de Python, CUDA ni NeMo en tiempo de inferencia.
- Cuantizaciones multiples con degradacion de calidad despreciable: 1,62 % de WER en F32, F16, Q8_0, Q6_K y Q5_K_M, y 1,59 % en Q4_K_M.
- No soporta streaming, traduccion, deteccion de idioma, diarizacion de hablantes ni tool calling. Son capacidades no disponibles en este modelo.

## Casos de uso

- Transcripcion por lotes en servidores sin GPU: con un RTF de 8x en CPU (Ryzen 4750U) y 30x en CPU de Apple M4 Max, un solo nucleo de servidor puede procesar horas de audio en minutos usando la cuantizacion Q5_K_M de 540 MB, sin necesidad de CUDA.
- Subtitulado de archivos de video: el modelo genera timestamps a nivel de token, lo que permite construir ficheros de subtitulos alineados temporalmente para contenido en ingles, como paso previo en un pipeline de ffmpeg + transcribe-cli.
- Indexado y busqueda semantica sobre archivos de audio: transcripcion de podcasts, clases o webinars en ingles para despues indexar el texto en un motor de busqueda o base vectorial, aprovechando que el coste por hora de audio es muy bajo (RTF de 185,5x en GPU Metal).
- Transcripcion en el dispositivo (edge): con 476 MB en Q4_K_M cabe en portatiles, mini-PC y placas tipo Raspberry Pi con suficiente RAM, permitiendo dictado o notas de voz sin enviar el audio a la nube.
- Preprocesado de datos para entrenamiento de modelos de lenguaje: generacion de transcripciones a gran escala de corpus de audio en ingles con una tasa de error cercana al 1,6 % en dominio limpio, suficiente para construir datasets de texto.
- Analisis de grabaciones de investigacion cualitativa: entrevistas y grupos focales en ingles transcritos de forma local, lo que evita subir material con datos personales a servicios externos, siempre con revision humana posterior.
- Pipelines de accesibilidad: conversion automatica de contenido de audio en ingles a texto para personas con discapacidad auditiva, integrado en un flujo de publicacion que anade puntuacion y mayusculas en post-proceso.
- Verificacion de calidad de audio y control de ingestion: transcripcion rapida como comprobacion previa en un sistema de archivado para detectar ficheros corruptos, silencios o audio sin habla.

## Benchmarks y rendimiento

Resultados de WER publicados en la model card de esta conversion, medidos sobre la particion completa LibriSpeech test-clean (2620 enunciados) con decodificacion greedy RNN-T y sin modelo de lenguaje externo. La referencia F32 es 1,62 %; NVIDIA reporta 1,63 % sobre la misma particion.

| Cuantizacion | Tamano | WER (LibriSpeech test-clean) |
|---|---:|---:|
| F32 | 2,47 GB | 1,62 % |
| F16 | 1,24 GB | 1,62 % |
| Q8_0 | 730 MB | 1,62 % |
| Q6_K | 601 MB | 1,62 % |
| Q5_K_M | 540 MB | 1,62 % |
| Q4_K_M | 476 MB | 1,59 % |

Factor de tiempo real (RTF) reportado en la model card:

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 185,5 |
| Apple M4 Max | CPU | 30 |
| AMD Ryzen 4750U | Vulkan | 14,5 |
| AMD Ryzen 4750U | CPU | 8 |

No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, GSM8K u otros), al no ser aplicables a un modelo ASR.

## Requisitos de hardware

- VRAM/RAM minima: el fichero GGUF mas pequeno (Q4_K_M) ocupa 476 MB, por lo que el modelo cabe en cualquier GPU o sistema con 1 GB de memoria libre. Las estimaciones por cuantizacion son 476 MB (Q4_K_M), 540 MB (Q5_K_M), 601 MB (Q6_K), 730 MB (Q8_0), 1,24 GB (F16) y 2,47 GB (F32), mas el overhead del runtime.
- GPU de consumo: cualquier GPU con soporte Metal o Vulkan puede ejecutarlo; con Q4_K_M o Q5_K_M entra sin problema en GPUs de gama baja y en graficos integrados. No se especifican modelos concretos de NVIDIA o AMD en la informacion disponible.
- GPU de datacenter (A100, H100): compatibles en terminos de memoria, pero el modelo esta pensado para ejecucion ligera y no se aportan cifras de rendimiento en estas plataformas.
- CPU: funciona sin GPU. Los RTF medidos son 30x en CPU de Apple M4 Max y 8x en CPU de AMD Ryzen 4750U, es decir, varias veces mas rapido que el tiempo real incluso en un portatil.
- Opciones de despliegue: transcribe.cpp (compilacion con CMake y binario transcribe-cli) con backends CPU, Metal y Vulkan. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni NeMo en esta publicacion; no disponible.
- Preprocesado obligatorio: el audio debe ser WAV mono a 16 kHz; para otras fuentes se indica `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.
- Latencia y throughput: no se publican cifras de latencia absoluta, solo los factores de tiempo real de la tabla anterior.

## Comparativa con modelos similares

Comparativa de especificaciones conocidas. Los datos de rendimiento de los modelos alternativos no estan disponibles en la informacion proporcionada, por lo que no se comparan cifras de WER entre ellos.

| Modelo | Parametros | Idiomas | Licencia | Streaming | Formato |
|---|---:|---|---|---|---|
| parakeet-rnnt-0.6b (GGUF) | 0,6B | en | CC-BY-4.0 | no | GGUF |
| openai/whisper-large-v3 | ~1,55B | multilingue (~99 idiomas) | MIT | no (por ventanas) | safetensors, GGUF via terceros |
| distil-whisper/distil-large-v3 | ~0,76B | en | MIT | no | safetensors |
| nvidia/parakeet-tdt-0.6b-v2 | ~0,6B | en | CC-BY-4.0 | no | .nemo |

Frente a Whisper large-v3, parakeet-rnnt-0.6b es aproximadamente 2,5 veces mas pequeno, esta limitado a ingles y requiere conversion a GGUF para ejecucion local ligera, pero esta especificamente optimizado para transcripcion en ingles con un WER de 1,62 % en LibriSpeech test-clean. Frente a distil-whisper, el tamano es comparable, aunque la licencia y la arquitectura difieren (Conformer-Transducer frente a encoder-decoder tipo transformer con decodificacion autorregresiva). La comparacion de rendimiento con estas alternativas no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles. No soporta otros idiomas, ni deteccion de idioma, ni traduccion (los metadatos indican `translate: false` y `lang_detect: false`).
- Salida sin formato: el texto se devuelve en minusculas y sin puntuacion, por lo que requiere un post-proceso (puntuacion, mayusculas, numeros) para la mayoria de usos editoriales.
- No es streaming: no puede usarse para transcripcion en tiempo real con audio que llega de forma continua; solo procesa ficheros completos.
- Decodificacion greedy sin modelo de lenguaje externo, lo que reduce la capacidad de corregir errores contextuales en dominios especializados (terminologia medica, juridica o nombres propios).
- Alucinacion y errores en condiciones adversas: aunque no se documentan explicitamente, el WER de 1,62 % corresponde a LibriSpeech test-clean (audio de audiolibros, limpio y leido); en audio con ruido, acentos marcados, solapamiento de hablantes o musica de fondo la tasa de error aumentara. No se publican cifras para esos escenarios.
- Sin diarizacion ni etiquetado de hablantes; tampoco se documentan funciones de deteccion de actividad de voz.
- Licencia CC-BY-4.0: permite uso comercial, pero obliga a atribuir la autoria (NVIDIA NeMo y Suno.ai) y a indicar los cambios realizados en la conversion.
- Procedencia del artefacto: el repositorio myflow-ai/parakeet-rnnt-0.6b-gguf tiene 0 descargas y 0 likes, y los enlaces de descarga de su model card apuntan al repositorio handy-computer/parakeet-rnnt-0.6b-gguf, no a si mismo. Conviene verificar la integridad de los ficheros y, si es posible, usar la conversion de referencia.
- No hay datos publicados de sesgos demograficos, de acento o de genero para este modelo en la informacion disponible.
- Para uso en produccion con requisitos legales o medicos, la transcripcion debe pasar por revision humana; la tasa de error no es cero y los fallos pueden ser silenciosos.

## Enlaces

- Repositorio HuggingFace de esta conversion: https://huggingface.co/myflow-ai/parakeet-rnnt-0.6b-gguf
- Modelo base original: https://huggingface.co/nvidia/parakeet-rnnt-0.6b
- Repositorio de la conversion de referencia (handy-computer): https://huggingface.co/handy-computer/parakeet-rnnt-0.6b-gguf
- Motor transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Pagina de modelo dentro de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-rnnt-0.6b.md
- Commit de validacion en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/42528dd
- Commit del modelo base usado para el port: https://huggingface.co/nvidia/parakeet-rnnt-0.6b/commit/c0c1f09
- Paper de referencia FastConformer: arXiv:2305.05084 (https://arxiv.org/abs/2305.05084)
- Documentacion de arquitecturas ASR de NeMo: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer
- Repositorio NVIDIA NeMo: https://github.com/NVIDIA/NeMo
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- Portal de desarrolladores de NVIDIA: https://developer.nvidia.com

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces utiles son los anteriores, procedentes de los metadatos y de la model card del repositorio.
