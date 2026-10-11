# myflow-ai/parakeet-tdt-0.6b-v3-gguf

## Resumen

parakeet-tdt-0.6b-v3-gguf es la conversion a formato GGUF del modelo de reconocimiento automatico del habla (ASR) nvidia/parakeet-tdt-0.6b-v3, publicada por el usuario myflow-ai para su uso con el runtime transcribe.cpp. Se trata de un modelo offline de speech-to-text multilingue que cubre 25 idiomas europeos, con 627.052.166 parametros reales (aproximadamente 0,6 mil millones), basado en un encoder FastConformer acoplado a un decoder transducer TDT/RNNT. El modelo recibe audio WAV mono a 16 kHz y devuelve transcripcion con puntuacion, mayusculas y marcas temporales a nivel de token.

La relevancia de esta publicacion es practica: permite ejecutar un modelo ASR multilingue de calidad cercana a la del original con un consumo de recursos muy reducido. Las cuantizaciones disponibles van desde F32 (2,51 GB) hasta Q4_K_M (502 MB), con una degradacion de WER practicamente nula: el F32 obtiene 1,95 % en LibriSpeech test-clean y la cuantizacion Q5_K_M baja incluso a 1,92 %, dentro del ruido de medida del conjunto de evaluacion. Esto lo hace desplegable en hardware de consumo, incluidas CPU de portatil y GPU integradas.

La licencia es CC-BY-4.0, heredada del modelo base, lo que permite uso comercial con atribucion. El modelo no es de streaming y no traduce: transcribe en el idioma detectado automaticamente. La deteccion de idioma y las marcas temporales a nivel de token si estan soportadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + transducer TDT/RNNT (decoder) |
| Parametros totales | 627.052.166 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo ASR offline; procesa el audio completo, sin streaming) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 25: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, ru, sk, sl, es, sv, uk |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF |
| Entrada | audio WAV mono a 16 kHz |
| Deteccion de idioma | si (automatica, sin prompt) |
| Marcas temporales | si, a nivel de token |
| Streaming | no |
| Traduccion | no |

## Arquitectura y entrenamiento

El modelo base, nvidia/parakeet-tdt-0.6b-v3, es un sistema ASR de 0,6 mil millones de parametros que combina un encoder FastConformer con un decoder de tipo transducer. En concreto, el decoder es un TDT (Token-and-Duration Transducer), una variante de los modelos RNNT que predice conjuntamente el token y su duracion, lo que acelera la decodificacion y mejora la alineacion temporal. Esta publicacion concreta es una conversion de esos pesos a GGUF mediante transcribe.cpp, portada desde el commit upstream 6d590f7 (fijado el 2026-04-16) y validada contra la referencia NeMo en el commit bf0d0b7 de transcribe.cpp (2026-04-18). La conversion no modifica el modelo, solo el contenedor de los pesos.

El entrenamiento del modelo original se apoya en el corpus multilingue Granary de NVIDIA como fuente principal de datos, y extiende el soporte de idiomas de la version v2 (solo ingles) a 25 lenguas europeas. La model card upstream no detalla el numero exacto de horas de audio ni la composicion completa del dataset en la informacion disponible, y tampoco especifica si se aplicaron fases de RLHF o DPO (no aplica habitualmente a ASR). El modelo detecta el idioma del audio de forma automatica y transcribe sin necesidad de indicar el idioma. Genera puntuacion y mayusculas de forma nativa.

## Capacidades

- Transcripcion de voz a texto offline en 25 idiomas europeos, con deteccion automatica del idioma de entrada.
- Puntuacion y capitalizacion automaticas en la salida.
- Marcas temporales a nivel de token, utiles para subtitulado y alineacion.
- Salida con word-level timestamps segun la model card upstream (la ficha de transcribe.cpp declara timestamps a nivel de token).
- Entrada de audio mono a 16 kHz en formato WAV; requiere conversion previa de otros formatos con ffmpeg.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-step.
- No realiza traduccion entre idiomas: transcribe en el idioma detectado.
- No soporta streaming: procesa el audio completo por lotes offline.
- No tiene modo thinking, vision ni audio generativo.

## Casos de uso

- Subtitulado y transcripcion de video: el modelo produce marcas temporales a nivel de token, lo que permite generar ficheros de subtitulos alineados con precision sobre audio de 16 kHz mono extraido de la pista de voz.
- Actas y notas de reunion: al cubrir 25 idiomas europeos y detectar el idioma automaticamente, se puede transcribir una reunion multilingue sin configurar el idioma por adelantado; su tamano de 502 MB en Q4_K_M permite ejecutarlo en el propio portatil.
- Indexacion y busqueda de archivos de audio: transcribir un archivo historico de grabaciones y almacenar el texto permite busqueda por palabras clave sobre contenido hablado sin depender de servicios en la nube.
- Atencion al cliente (post-proceso): transcripcion por lotes de llamadas grabadas para analitica, control de calidad y deteccion de incidencias; la licencia CC-BY-4.0 permite uso comercial con atribucion.
- Accesibilidad para personas con discapacidad auditiva: generacion de transcripciones y subtitulos en directo diferido (no streaming, por lo que se procesa por fragmentos) en aplicaciones de videoconferencia o reproduccion de contenido.
- Documentacion clinica o legal dictada: transcripcion offline en equipos locales, sin enviar audio a servidores externos, lo que ayuda a cumplir requisitos de privacidad de datos.
- Investigacion en linguistica y ASR: evaluacion comparativa de un sistema TDT multilingue frente a alternativas tipo CTC o atencion encoder-decoder, con cuantizaciones de distinto tamano para estudiar el efecto de la precision numerica.
- Preprocesado en pipelines de datos: transcripcion masiva de corpus de audio para construir datasets de texto o alimentar sistemas posteriores de NLP.

## Benchmarks y rendimiento

WER sobre LibriSpeech test-clean completo (2620 utterances), decodificacion greedy del transducer sin modelo de lenguaje externo. Baseline de referencia F32: 1,95 %. El valor autoinformado por NVIDIA en la misma particion es 1,93 %.

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 2,51 GB | 1,95 % |
| F16 | 1,26 GB | 1,95 % |
| Q8_0 | 740 MB | 1,94 % |
| Q6_K | 627 MB | 1,93 % |
| Q5_K_M | 565 MB | 1,92 % |
| Q4_K_M | 502 MB | 1,98 % |

Rendimiento en tiempo real (RTF, factor de tiempo real; mayor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 151 |
| Apple M4 Max | CPU | 28 |
| AMD Ryzen 4750U | Vulkan | 12,5 |
| AMD Ryzen 4750U | CPU | 7,5 |

No se han publicado en la informacion disponible resultados de benchmarks adicionales (p. ej., sobre los 24 idiomas no ingleses, MLS, Common Voice o FLEURS).

## Requisitos de hardware

- VRAM estimada para inferencia (pesos en memoria, sin overhead del runtime): F32 en torno a 2,5-3 GB; F16 en torno a 1,3-1,5 GB; Q8_0 aproximadamente 0,75-0,9 GB; Q6_K aproximadamente 0,65-0,8 GB; Q5_K_M aproximadamente 0,6-0,7 GB; Q4_K_M aproximadamente 0,5-0,6 GB.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares, incluso en las cuantizaciones mas grandes.
- Funciona en Apple Silicon con backend Metal (RTF 151 en un M4 Max) y en CPU x86 con Vulkan (RTF 12,5 en un Ryzen 4750U) o directamente en CPU (RTF 7,5 en el mismo equipo).
- GPU de datacenter (A100, H100) solo son necesarias para transcripcion masiva por lotes; el modelo es pequeno y no las requiere para uso interactivo.
- Opciones de despliegue: transcribe.cpp (compilacion desde fuente con CMake). No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, ya que es un runtime especifico de ASR y no un modelo de lenguaje.
- Latencia y throughput: el RTF indica que en Metal se procesan aproximadamente 151 segundos de audio por segundo de computo, y en Vulkan sobre Ryzen 4750U aproximadamente 12,5 segundos por segundo. El throughput en GPU de datacenter no esta disponible.

## Comparativa con modelos similares

No se han publicado en la informacion disponible comparativas de rendimiento frente a otros modelos ASR. La tabla siguiente recoge unicamente caracteristicas estructurales verificables; las cifras de rendimiento de las alternativas se marcan como no disponibles.

| Modelo | Parametros | Idiomas | Formato / runtime | Licencia | Rendimiento comparado |
|---|---|---|---|---|---|
| parakeet-tdt-0.6b-v3 (GGUF) | 627 M | 25 europeos | GGUF / transcribe.cpp | CC-BY-4.0 | WER 1,92-1,98 % en LibriSpeech test-clean |
| nvidia/parakeet-tdt-0.6b-v3 (original) | 600 M | 25 europeos | NeMo / safetensors | CC-BY-4.0 | WER autoinformado 1,93 % en test-clean |
| nvidia/parakeet-tdt-0.6b-v2 | no disponible | solo ingles | NeMo | CC-BY-4.0 | no disponible |
| Alternativas ASR multilingues tipo Whisper | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de streaming: requiere el audio completo antes de transcribir, lo que limita su uso en transcripcion en vivo de baja latencia.
- No traduce: solo transcribe en el idioma detectado. Si se necesita traduccion hay que encadenar un modelo aparte.
- Solo acepta audio WAV mono a 16 kHz; cualquier otro formato o frecuencia debe convertirse previamente (por ejemplo con ffmpeg), lo que anade un paso al pipeline.
- La cobertura se limita a 25 idiomas europeos. No hay soporte declarado para otras lenguas (asiaticas, africanas, americanas nativas, etc.).
- Riesgo de alucinacion y errores en audio con ruido, solapamiento de voces, acentos marcados o terminologia especializada; no se han publicado metricas de robustez fuera de LibriSpeech test-clean.
- No se han publicado en la informacion disponible datos de sesgo por idioma, variedad dialectal o demografia de los hablantes.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribucion tanto al autor de la conversion como al modelo base de NVIDIA; conviene revisar la model card upstream para los terminos completos.
- El repositorio de conversion declara 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-10-10, por lo que es una publicacion reciente y sin validacion comunitaria amplia.
- Las tablas de descarga de la model card apuntan al repositorio handy-computer/parakeet-tdt-0.6b-v3-gguf, no al repositorio myflow-ai; conviene verificar de que repositorio se descargan finalmente los ficheros.
- El WER reportado corresponde unicamente a ingles (LibriSpeech); no hay cifras publicadas para el resto de idiomas soportados.
- Al ser una cuantizacion, Q4_K_M muestra un ligero empeoramiento (1,98 % frente a 1,92 % de Q5_K_M); para maxima fidelidad se recomienda Q5_K_M o superior.

## Enlaces

- Repositorio HuggingFace de esta conversion: https://huggingface.co/myflow-ai/parakeet-tdt-0.6b-v3-gguf
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Modelo predecesor (solo ingles): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Demo oficial de NVIDIA: https://huggingface.co/spaces/nvidia/parakeet-tdt-0.6b-v3
- Dataset Granary: https://huggingface.co/datasets/nvidia/Granary
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentacion del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-tdt-0.6b-v3.md
- Commit de validacion en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/bf0d0b7
- Commit upstream del modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3/commit/6d590f7
- Referencias arXiv citadas en las etiquetas: arXiv:2509.14128, arXiv:2505.13404, arXiv:2305.05084, arXiv:2304.06795, arXiv:2410.01036, arXiv:2406.00899, arXiv:2205.12446, arXiv:2012.03411, arXiv:2007.10310, arXiv:1510.08484 (los titulos concretos de cada paper no estan disponibles en la informacion proporcionada).
