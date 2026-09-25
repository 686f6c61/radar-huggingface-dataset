# ldov/nemotron-3.5-asr-streaming-0.6b-gguf

## Resumen

ldov/nemotron-3.5-asr-streaming-0.6b-gguf es una conversion a formato GGUF del modelo NVIDIA nvidia/nemotron-3.5-asr-streaming-0.6b, un sistema de reconocimiento automatico del habla (ASR) multilingue de 0,6 mil millones de parametros, disenado para transcripcion en streaming de baja latencia y en modo batch de alto rendimiento. La conversion la publica el usuario ldov y esta pensada para ejecutarse con transcribe.cpp, el runtime de inferencia que consume estos ficheros, no con las librerias habituales de texto (llama.cpp, vLLM u Ollama).

El modelo combina un encoder FastConformer con atencion cache-aware (apto para streaming por trozos) y un decodificador transducer RNN-T condicionado por prompt, en el que el idioma destino se selecciona en cada llamada (--language en-US, fr-FR, de-DE, etc.) o se autodetecta emitiendo una etiqueta <lang-XX>. Proporciona puntuacion y mayusculas de forma nativa, sin postprocesado, y marca timestamps a nivel de token. Soporta 32 locales BCP-47, aunque el tokenizador reconoce 40 (los 8 restantes estan preparados para adaptacion y requieren fine-tuning).

Su relevancia practica radica en el compromiso entre tamano y precision: con cuantizacion Q8_0 ocupa 751 MB y obtiene un WER del 7,88 % en FLEURS en, practicamente identico al 7,99 % de la referencia NeMo en PyTorch, pero con un coste de computo mucho menor (factor de tiempo real de 10x a 30x en CPU y hasta 141x en GPU Apple con Metal). Es, por tanto, una opcion realista para transcripcion en dispositivo, edge y despliegues con muchos idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder FastConformer cache-aware (streaming) + decodificador transducer RNN-T condicionado por prompt |
| Parametros totales | 637.991.968 (aproximadamente 0,64 B) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable en el sentido de los LLM; la ventana de atencion del encoder es att_context_size=[56, 13] (1,12 s) en modo offline, con streaming por trozos seleccionable en tiempo de ejecucion (--stream-chunk-ms 1120 --stream-att-right {0,3,6,13}) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 32 locales BCP-47: en-US, en-GB, es-US, es-ES, fr-FR, fr-CA, it-IT, pt-BR, pt-PT, nl-NL, de-DE, tr-TR, ru-RU, ar-AR, hi-IN, ja-JP, ko-KR, vi-VN, uk-UA, pl-PL, sv-SE, cs-CZ, nb-NO, da-DK, bg-BG, fi-FI, hr-HR, sk-SK, zh-CN, hu-HU, ro-RO, et-EE. El tokenizador reconoce 40 idiomas; 8 de ellos estan en estado de adaptacion y requieren fine-tuning |
| Licencia | OpenMDW-1.1 (heredada del modelo base; en HuggingFace figura como license: other con license_name: openmdw-1.1) |
| Formato de pesos | GGUF (un unico fichero por cuantizacion), para el runtime transcribe.cpp |
| Entrada | Audio WAV mono a 16 kHz (se recomienda convertir con ffmpeg -ar 16000 -ac 1) |
| Salida | Texto transcrito con puntuacion, mayusculas y timestamps a nivel de token; etiqueta <lang-XX> en modo de autodeteccion |
| Traduccion de voz | no soportada (translate: false en los metadatos del runtime) |
| Deteccion de idioma | soportada (lang_detect: true) |
| Tamano del repositorio | 6,3 GB (incluye todas las cuantizaciones) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline ASR clasico de dos bloques. El primero es un encoder FastConformer, una variante del Conformer con atencion de profundidad lineal que reduce el coste computacional frente a la atencion cuadratica estandar, configurado aqui en modo cache-aware: mantiene estado entre trozos de audio, de modo que el mismo modelo sirve tanto para inferencia offline (ventana de contexto [56, 13], equivalente a 1,12 s) como para streaming por trozos de 1120 ms con distintos grados de mirada hacia la derecha (att_right de 0, 3, 6 o 13). El segundo bloque es un decodificador transducer RNN-T condicionado por prompt, que recibe la indicacion del idioma destino y decodifica con busqueda greedy. El modelo tiene 637.991.968 parametros, coherente con el tamano comercial de 0,6 B.

La informacion disponible no detalla el volumen de datos de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO (tecnicas, por otra parte, poco habituales en ASR). Lo que si se documenta es la procedencia de esta conversion: se realizo a partir del commit upstream 24b151a del modelo base, fechado y fijado el 2026-06-08, y se valido numericamente contra la referencia NeMo en el commit 909e94e de transcribe.cpp en la misma fecha. La comparacion reportada confirma que la conversion GGUF reproduce la precision del original: 7,99 % de WER en FLEURS en para la referencia NeMo, 7,9 % en los metadatos de esta conversion y 7,88 % en el fichero Q8_0, con una desviacion de decimas porcentuales en todas las cuantizaciones.

Las innovaciones tecnicas destacables son, por un lado, la atencion cache-aware que permite alternar streaming y batch sin cambiar de modelo y, por otro, el condicionamiento por prompt del decodificador, que evita mantener un modelo separado por idioma. La cuantizacion K-quant aplicada por el conversor degrada la precision de forma marginal: la diferencia entre F32 y Q4_K_M es de 0,52 puntos de WER en FLEURS en y de 0,24 puntos en LibriSpeech test-clean.

## Capacidades

- Transcripcion de voz a texto multilingue en 32 locales BCP-47, con salida ya puntuada y capitalizada, sin postprocesado.
- Deteccion automatica del idioma cuando no se especifica --language, mediante una etiqueta <lang-XX> en la salida.
- Streaming de baja latencia: procesa audio por trozos de 1120 ms con el estado del encoder cacheado entre trozos, apto para subtitulado en directo.
- Modo offline de mayor precision con ventana de atencion [56, 13], para transcripcion de ficheros completos.
- Timestamps a nivel de token, utiles para alinear la transcripcion con el audio original.
- Manejo de audio en 16 kHz mono; el flujo recomendado incluye conversion previa con ffmpeg.
- Seleccion del idioma de decodificacion por llamada (en-US, en-GB, es-ES, es-US, fr-FR, fr-CA, pt-BR, pt-PT, etc.), util cuando se conoce el idioma de origen.
- No soporta traduccion de voz (translate: false), tool calling, function calling, uso como agente, vision, audio generativo ni ninguna capacidad propia de los modelos de lenguaje.
- No soporta modo de razonamiento (thinking) ni generacion de codigo: es exclusivamente un modelo de reconocimiento del habla.

## Casos de uso

- Subtitulado en directo de reuniones y webinars: con streaming activado a trozos de 1120 ms y el encoder cache-aware, el modelo puede emitir texto mientras se habla, con la deteccion automatica de idioma resolviendo reuniones en las que participan hablantes de varios idiomas.
- Transcripcion de archivos de audio y video en lote: el modo offline con ventana [56, 13] ofrece la maxima precision documentada (WER 3,04 % en LibriSpeech test-clean con F32) y es adecuado para indexar podcasts, clases grabadas o archivos de atencion al cliente.
- Atencion al cliente multilingue: al soportar 32 locales y puntuacion nativa, la transcripcion resultante se puede volcar directamente a un CRM o motor de busqueda sin limpieza posterior, cubriendo mercados de Europa, America, Asia y Oriente Medio.
- Generacion de actas y resumenes de reuniones: los timestamps a nivel de token permiten segmentar por intervencion y por marca temporal, lo que facilita el diarizado posterior y la construccion de resumentes sobre el texto transcrito.
- Subtitulado de contenido audiovisual para accesibilidad: el modelo produce texto capitalizado y puntuado directamente, reduciendo el trabajo editorial, si bien el numero de idiomas con WER bajo (italiano 5,78 %, espanol 6,30 %, ingles 7,90 %) es menor que el total soportado.
- Dictado y asistentes de voz en local: con la cuantizacion Q4_K_M (496 MB) el modelo se ejecuta en portatiles sin GPU dedicada, lo que habilita dictado offline en aplicaciones de escritorio y moviles sin enviar audio a la nube.
- Transcripcion en edge y dispositivos con recursos limitados: el factor de tiempo real de 10,59x en CPU (Ryzen 4750U) y 30,25x en CPU de Apple M4 Max permite procesar audio mas rapido que en tiempo real sin acelerador.
- Preprocesado de corpus de voz para entrenamiento de otros modelos: la salida con timestamps y deteccion de idioma es util para generar transcripciones de referencia a gran escala.

## Benchmarks y rendimiento

WER en FLEURS en (split completo, 647 enunciados, batch size 1, sin timestamps) por cuantizacion, en modo offline con att_context_size=[56, 13]:

| Cuantizacion | Tamano | WER FLEURS en | WER LibriSpeech test-clean |
|---|---:|---:|---:|
| F32 | 2,55 GB | 7,97 % | 3,04 % |
| F16 | 1,28 GB | 7,97 % | 3,03 % |
| Q8_0 | 751 MB | 7,88 % (7,9 % en metadatos) | 3,06 % |
| Q6_K | 621 MB | 8,02 % | 3,07 % |
| Q5_K_M | 560 MB | 8,15 % | 3,10 % |
| Q4_K_M | 496 MB | 8,49 % | 3,28 % |
| Referencia NeMo (PyTorch) | no disponible | 7,99 % (NVIDIA declara 7,91 % en en-US) | 3,03 % |

WER y CER por idioma con la cuantizacion Q8_0 en FLEURS (idiomas con sistema de escritura no latino evaluados con CER):

| Idioma | Metrica | Valor |
|---|---|---:|
| it | WER | 5,78 % |
| es | WER | 6,30 % |
| en | WER | 7,90 % |
| pt | WER | 8,52 % |
| hi | WER | 8,61 % |
| ko | CER | 8,89 % |
| de | WER | 10,33 % |
| fr | WER | 10,78 % |
| ru | WER | 12,61 % |
| nl | WER | 13,61 % |
| ja | CER | 13,52 % |
| vi | WER | 13,96 % |
| uk | WER | 14,88 % |
| tr | WER | 15,40 % |
| ar | WER | 15,93 % |
| pl | WER | 17,54 % |
| zh | CER | 18,87 % |
| nb | WER | 19,24 % |
| fi | WER | 21,91 % |
| bg | WER | 22,02 % |
| cs | WER | 23,00 % |
| sk | WER | 23,25 % |
| sv | WER | 24,32 % |
| hr | WER | 26,21 % |
| ro | WER | 28,28 % |
| da | WER | 28,51 % |
| et | WER | 31,84 % |
| hu | WER | 32,12 % |

Rendimiento en factor de tiempo real (RTF, mayor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 141,1x |
| Apple M4 Max | CPU | 30,25x |
| Ryzen 4750U | Vulkan | 17,13x |
| Ryzen 4750U | CPU | 10,59x |

No se han publicado en la informacion disponible resultados de benchmarks comparativos con otras familias de modelos ASR (Whisper, Canary, Parakeet de otros tamanos, etc.), ni metricas de latencia absoluta mas alla del tamano de trozo de streaming.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB con Q4_K_M (496 MB de pesos), 0,6 GB con Q5_K_M (560 MB), 0,62 GB con Q6_K (621 MB), 0,75 GB con Q8_0 (751 MB), 1,28 GB con F16 y 2,55 GB con F32, mas el margen correspondiente al estado del encoder y a los buffers de audio.
- Cabe sin problema en cualquier GPU de consumo: basta una GTX 1650, RTX 3050, RTX 4090 o superior; la cuantizacion Q4_K_M es ejecutable incluso en iGPU con memoria compartida. No requiere A100 ni H100.
- Inferencia viable en CPU sin acelerador: el RTF medido es de 30,25x en un Apple M4 Max y de 10,59x en un Ryzen 4750U, es decir, entre 10 y 30 veces mas rapido que el tiempo real.
- Aceleracion en GPU integrada y dedicada mediante backends Metal (Apple Silicon) y Vulkan (RTF 17,13x en Ryzen 4750U), ademas de la ruta CPU pura.
- Despliegue: transcribe.cpp es el runtime oficial de estos ficheros GGUF; se compila desde fuente con CMake (cmake -B build && cmake --build build) y se invoca con transcribe-cli -m modelo.gguf input.wav. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, que son runtimes para modelos de lenguaje.
- Latencia en streaming: la unidad de trozo configurable es de 1120 ms (--stream-chunk-ms 1120), que fija la latencia minima de emision en modo streaming; la mirada a la derecha (--stream-att-right) permite reducirla a costa de precision.
- Espacio en disco: entre 496 MB (Q4_K_M) y 2,55 GB (F32) por fichero; el repositorio completo ocupa 6,3 GB.

## Comparativa con modelos similares

La informacion disponible solo permite comparar esta conversion con el modelo base y con otras conversiones GGUF del mismo modelo, ya que no se aportan resultados de benchmarks de modelos ASR alternativos.

| Modelo | Parametros | Formato / runtime | Contexto de atencion | WER FLEURS en | WER LibriSpeech test-clean | Licencia |
|---|---|---:|---|---:|---:|---|
| ldov/nemotron-3.5-asr-streaming-0.6b-gguf (esta ficha) | 637.991.968 | GGUF / transcribe.cpp | [56, 13] offline; streaming a 1120 ms | 7,88 % (Q8_0) | 3,04-3,28 % | OpenMDW-1.1 |
| nvidia/nemotron-3.5-asr-streaming-0.6b (base) | 0,6 B | PyTorch / NeMo | [56, 13] offline; streaming | 7,99 % (7,91 % declarado en en-US) | 3,03 % | OpenMDW-1.1 |
| handy-computer/nemotron-3.5-asr-streaming-0.6b-gguf | 0,6 B | GGUF / transcribe.cpp | identico (misma conversion de referencia) | 7,88 % (Q8_0) | mismo rango | OpenMDW-1.1 |
| vibe-app/nemotron-3.5-asr-streaming-0.6b-gguf | 0,6 B | GGUF | no disponible | no disponible | no disponible | OpenMDW-1.1 (heredada) |

Comparativa con otras familias ASR (Whisper large-v3, Canary, Parakeet TDT): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion en audio no vocal, silencios largos o ruido de fondo, comportamiento comun en decodificadores transducer entrenados con datos de habla; no hay documentacion especifica sobre mitigaciones en la informacion disponible.
- Precision muy desigual por idioma: el WER en FLEURS con Q8_0 va del 5,78 % en italiano al 32,12 % en hungaro, pasando por 31,84 % en estonio, 28,51 % en danes, 28,28 % en rumano y 26,21 % en croata. Para estos idiomas la calidad puede ser insuficiente en produccion.
- Ocho de los 40 idiomas que reconoce el tokenizador no estan soportados de fabrica: estan en estado "adaptation-ready" y exigen fine-tuning para dar resultados utilizables.
- No traduce: solo transcribe en el idioma hablado. No se puede usar como puente voz-a-texto en otro idioma.
- Requiere audio en WAV mono a 16 kHz; otro formato o tasa exige conversion previa, y el modelo no incorpora deteccion de actividad de voz ni filtrado de ruido.
- El condicionamiento por prompt implica que una seleccion incorrecta del idioma (o un fallo en la autodeteccion) degrada notablemente la transcripcion.
- No soporta tool calling, function calling, agentes, vision ni razonamiento multi-paso: no es sustituible por un modelo de lenguaje en pipelines que esperen esas capacidades.
- Licencia OpenMDW-1.1 heredada del modelo base, con implicaciones que deben verificarse antes de un uso comercial; ademas, los pesos derivan de NVIDIA y el repositorio figura como license: other. Consultar el texto completo antes de desplegar.
- Esta conversion concreta (ldov) presenta 0 descargas y 0 likes en el momento de la consulta y fue creada el 2026-09-24, por lo que carece de validacion de terceros; para uso en produccion conviene contrastar la conversion con la de handy-computer, que documenta la procedencia completa (commits de origen y validacion numerica).
- El repositorio no ofrece garantia de mantenimiento ni actualizaciones respecto a futuros commits del modelo base.

## Enlaces

- Repositorio de esta conversion: https://huggingface.co/ldov/nemotron-3.5-asr-streaming-0.6b-gguf
- Modelo base en HuggingFace: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Commit upstream de origen: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b/commit/24b151a
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/909e94e
- Documentacion del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/nemotron-3.5-asr-streaming-0.6b.md
- Conversion GGUF de referencia en handy-computer: https://huggingface.co/handy-computer/nemotron-3.5-asr-streaming-0.6b-gguf
- Otra conversion GGUF del mismo modelo: https://huggingface.co/vibe-app/nemotron-3.5-asr-streaming-0.6b-gguf
- Ficha del modelo en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-asr-streaming/modelcard
- Repositorio espejo con README del modelo base: https://github.com/weyan618/nemotron-asr/blob/main/nemotron-asr/nemotron-3.5-asr-streaming-0.6b/README.md
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Referencia arXiv 2312.17279 (citada en los tags del repositorio): https://arxiv.org/abs/2312.17279
- Referencia arXiv 2305.05084 (citada en los tags del repositorio): https://arxiv.org/abs/2305.05084
