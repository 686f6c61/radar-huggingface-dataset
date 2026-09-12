# handy-computer/nemotron-3.5-asr-streaming-0.6b-gguf

## Resumen

nemotron-3.5-asr-streaming-0.6b-gguf es la conversión a formato GGUF del modelo de reconocimiento automático del habla nvidia/nemotron-3.5-asr-streaming-0.6b, publicada por handy-computer para su uso con el runtime transcribe.cpp. Se trata de un modelo de speech-to-text multilingüe de 637.991.968 parámetros (0,6B) que combina un encoder FastConformer cache-aware con un decodificador transducer RNN-T, e incluye puntuación y capitalización en la salida. La conversión está anclada al commit 24b151a del modelo original (fijado el 2026-06-08) y validada contra la referencia NeMo en el commit 909e94e de transcribe.cpp.

Su relevancia práctica está en que ofrece dos modos de inferencia sobre el mismo archivo: una ruta offline con att_context_size=[56, 13] (ventana de audio de 1,12 s, máxima precisión) y una ruta de streaming por chunks configurable en tiempo de ejecución (--stream-chunk-ms 1120, con --stream-att-right {0,3,6,13}). Esto permite cubrir tanto transcripción por lotes de alta calidad como subtitulado en directo, con selección de idioma por llamada (--language en-US, fr-FR, de-DE, ...) y un modo automático que emite una etiqueta `<lang-XX>`.

El paquete se distribuye en seis niveles de cuantización que van de 473 MB (Q4_K_M) a 2,38 GB (F32), con un impacto en WER muy contenido: en FLEURS test en (en-US) se pasa de 7,97 % en F32 a 8,49 % en Q4_K_M, y en LibriSpeech test-clean de 3,04 % a 3,28 %. El repositorio acumula 1.821.099 descargas y está licenciado bajo OpenMDW-1.1, heredada del modelo base de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder FastConformer cache-aware + decodificador RNN-T transducer condicionado por prompt (familia Parakeet) |
| Parametros totales | 637.991.968 (0,6B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en tokens. Ventana de atencion de audio att_context_size=[56, 13] en modo offline (1,12 s); en streaming, chunk configurable de 1120 ms con --stream-att-right {0,3,6,13} |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 32 locales segun la model card (28 declarados en los metadatos de HuggingFace: en, es, fr, it, pt, nl, de, tr, ru, ar, hi, ja, ko, vi, uk, pl, sv, cs, nb, da, bg, fi, hr, sk, zh, hu, ro, et). El tokenizador reconoce 40; 8 son adaptation-ready y requieren fine-tuning |
| Licencia | OpenMDW-1.1 (heredada del modelo base) |
| Formato de pesos | GGUF |
| Entrada de audio | WAV mono a 16 kHz |
| Timestamps | A nivel de token |
| Deteccion de idioma | Si (modo automatico con etiqueta `<lang-XX>`) |
| Traduccion | No |
| Streaming | Si (chunked, seleccionable en tiempo de ejecucion) |
| Libreria | transcribe.cpp |
| Tamano del repositorio | 37,5 GB |
| Descargas / likes | 1.821.099 / 9 |
| Fecha de creacion | 2026-06-07 |
| Ultima actualizacion | 2026-09-12 |

## Arquitectura y entrenamiento

El modelo base es un sistema ASR de la familia Parakeet: un encoder FastConformer con atención cache-aware seguido de un decodificador transducer RNN-T condicionado por prompt. La característica diferencial es la doble ruta de inferencia sobre los mismos pesos. En modo offline se emplea att_context_size=[56, 13], que procesa una ventana de 1,12 s y ofrece la máxima precisión. En modo streaming, el runtime divide la señal en chunks (por defecto 1120 ms) y controla el contexto derecho disponible mediante --stream-att-right con valores 0, 3, 6 o 13, lo que permite intercambiar latencia por calidad sin cambiar de modelo. La selección de idioma se realiza por llamada (--language en-US, fr-FR, de-DE, ...) y existe un modo automático que emite una etiqueta `<lang-XX>`.

La conversión GGUF fue portada desde el commit upstream 24b151a (fijado el 2026-06-08) y validada numéricamente contra la implementación de referencia NeMo en el commit 909e94e de transcribe.cpp (2026-06-08). No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; tampoco se detallan innovaciones adicionales más allá del esquema cache-aware y del decodificador RNN-T condicionado. Los artículos referenciados en los metadatos son arXiv:2312.17279 y arXiv:2305.05084.

## Capacidades

- Transcripcion de voz a texto multilingue en 32 locales, con salida que incluye puntuacion y capitalizacion.
- Decodificacion streaming por chunks con latencia y contexto derecho configurables (--stream-chunk-ms 1120, --stream-att-right {0,3,6,13}).
- Decodificacion offline de alta precision con att_context_size=[56, 13], orientada a transcripcion por lotes.
- Seleccion explicita de idioma por llamada y modo automatico de deteccion con emision de etiqueta `<lang-XX>`.
- Timestamps a nivel de token, utiles para alineacion, subtitulado con marcas temporales y busqueda dentro del audio.
- Generacion de transcripciones con decodificacion greedy RNN-T (configuracion usada en las mediciones de WER publicadas).
- Ejecucion en CPU, GPU y aceleradores integrados mediante los backends soportados por transcribe.cpp (Metal, Vulkan y CPU en las mediciones publicadas).
- No realiza traduccion (translate: false): la salida se produce en el idioma reconocido, no en otro idioma destino.
- No dispone de tool calling, function calling ni capacidades de agente: es un modelo puramente acustico de transcripcion.
- No procesa vision, audio generativo ni texto como modalidad de entrada.

## Casos de uso

- Subtitulado en directo: con la ruta de streaming (chunks de 1120 ms y --stream-att-right ajustable) el modelo puede alimentar un pipeline de subtítulos en tiempo real, sacrificando algo de precisión a cambio de latencia baja en emisiones, webinars o clases.
- Transcripcion por lotes de reuniones: usando la ruta offline con att_context_size=[56, 13] se obtiene la máxima calidad publicada (3,04 % de WER en LibriSpeech test-clean), adecuada para generar actas y resúmenes posteriores.
- Analitica de llamadas de atención al cliente: la combinación de transcripción multilingüe y timestamps a nivel de token permite indexar turnos de habla, medir tiempos de respuesta y aplicar analitica sobre conversaciones en 32 locales.
- Dictado local en aplicaciones de escritorio: el modelo cabe en 473 MB (Q4_K_M) y funciona en CPU, por lo que puede integrarse en herramientas de dictado que operen sin conexión ni envío de audio a terceros.
- Enrutado automatico por idioma: el modo de deteccion emite `<lang-XX>`, lo que permite clasificar la entrada y derivarla al pipeline, cola o equipo correspondiente sin un detector externo.
- Indexacion y busqueda de archivos de audio: los timestamps por token facilitan construir un índice buscable de podcasts, grabaciones de soporte o archivos de compliance, señalando el instante exacto de cada término.
- Accesibilidad en tiempo real: integrado en aplicaciones de videollamada o streaming, puede generar subtítulos en el idioma seleccionado por llamada, con un coste de cómputo bajo gracias al tamano de 0,6B.
- Despliegue en hardware modesto o edge: con backends Vulkan sobre GPU integrada (14,5x en RTF sobre un Ryzen 4750U) o CPU (7,5x), es viable en equipos portátiles sin GPU dedicada para transcripción en diferido.

## Benchmarks y rendimiento

Resultados de WER publicados en la model card. Las columnas de cuantizacion corresponden a FLEURS en; se incluye la referencia NeMo medida sobre el mismo manifiesto.

| Benchmark | F32 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M | Referencia NeMo |
|---|---|---|---|---|---|---|---|
| FLEURS test en (en-US), WER (%) | 7,97 | 7,97 | 7,88 | 8,02 | 8,15 | 8,49 | 7,99 (NVIDIA declara 7,91 en en-US) |
| LibriSpeech test-clean, WER (%) | 3,04 | 3,03 | 3,06 | 3,07 | 3,10 | 3,28 | 3,03 |

Notas de medicion aportadas por el autor: WER medido sobre FLEURS test en (647 enunciados) con decodificacion greedy RNN-T, --language en-US y puntuacion con whisper-normalizer; LibriSpeech test-clean sobre 2620 enunciados. El modelo no publica resultados de MMLU, HumanEval, GSM8K ni benchmarks de texto, ya que no es un modelo de lenguaje.

Tamano y factor de tiempo real (RTF, veces más rápido que el tiempo real):

| Cuantizacion | Tamano | WER FLEURS en (offline, att_context_size=[56, 13]) |
|---|---|---|
| F32 | 2,38 GB | 7,97 % |
| F16 | 1,19 GB | 7,97 % |
| Q8_0 | 716 MB | 7,88 % |
| Q6_K | 593 MB | 8,02 % |
| Q5_K_M | 534 MB | 8,15 % |
| Q4_K_M | 473 MB | 8,49 % |

| Hardware | Backend | RTF |
|---|---|---|
| Apple M4 Max | Metal | 98x |
| Apple M4 Max | CPU | 29x |
| AMD Ryzen 4750U | Vulkan | 14,5x |
| AMD Ryzen 4750U | CPU | 7,5x |

## Requisitos de hardware

- VRAM estimada para inferencia: entre 473 MB (Q4_K_M) y 2,38 GB (F32). La model card no publica cifras de VRAM pico ni de overhead del runtime.
- GPU recomendadas: no se especifican modelos concretos. Los datos publicados cubren Apple M4 Max con backend Metal (98x RTF) y GPU integrada AMD en un Ryzen 4750U con Vulkan (14,5x RTF).
- Compatibilidad con GPU de consumo: si, el tamano del modelo (menos de 2,4 GB en F32 y 473 MB en Q4_K_M) lo hace apto para practicamente cualquier GPU de consumo con soporte Vulkan o Metal, y tambien para CPU.
- Inferencia en CPU: viable. Se reportan 29x RTF en el CPU del M4 Max y 7,5x RTF en el CPU de un Ryzen 4750U, siempre por encima del tiempo real.
- Opciones de despliegue: la soportada oficialmente es transcribe.cpp, compilado desde fuente (cmake -B build && cmake --build build) y ejecutado con build/bin/transcribe-cli -m modelo.gguf input.wav. No se documentan en la informacion disponible otros runtimes (vLLM, llama.cpp, Ollama, TGI) para estos pesos.
- Entrada requerida: audio WAV mono a 16 kHz; para otras fuentes hay que convertir previamente, por ejemplo con ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav.
- Latencia y throughput: expresados como RTF en la tabla anterior (98x, 29x, 14,5x y 7,5x sobre tiempo real). No se publican cifras de latencia absoluta ni de throughput en minutos de audio por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Datos comparativos |
|---|---|---|---|---|---|
| handy-computer/nemotron-3.5-asr-streaming-0.6b-gguf | 637.991.968 | 32 locales (28 declarados en metadatos) | OpenMDW-1.1 | GGUF (F32 a Q4_K_M) | WER FLEURS en 7,88-8,49 %; LibriSpeech test-clean 3,03-3,28 % |
| nvidia/nemotron-3.5-asr-streaming-0.6b (modelo base) | 637.991.968 | 32 locales | OpenMDW-1.1 | no disponible en la informacion proporcionada | Referencia NeMo: 7,99 % en FLEURS en y 3,03 % en LibriSpeech test-clean (NVIDIA declara 7,91 % en en-US) |
| Alternativas de la misma categoria (por ejemplo, familias Whisper o Parakeet no-Nemotron) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han proporcionado en la informacion disponible resultados de benchmarks frente a modelos alternativos de terceros, por lo que no es posible establecer una comparativa cuantitativa fiable con otras familias ASR.

## Limitaciones y advertencias

- Cobertura de idiomas asimetrica: aunque la model card declara 32 locales soportados, el tokenizador reconoce 40 y los 8 restantes son adaptation-ready, es decir, requieren fine-tuning antes de dar resultados utilizables.
- No traduce: la opcion translate esta desactivada. La salida se produce en el idioma reconocido, no en un idioma destino.
- Riesgo de alucinacion inherente a los decodificadores transducer: en pasajes con ruido, silencio prolongado o solapamiento de hablantes, la salida puede contener palabras insertadas o repetidas. No se publican tasas de insercion especificas en la informacion disponible.
- Riesgo de sesgo: no se documentan en la informacion proporcionada analisis de sesgo por acento, variedad dialectal, genero o edad. Los WER publicados corresponden a FLEURS y LibriSpeech, dominios de habla leida y con condiciones controladas.
- Dependencia de un unico runtime: los pesos estan empaquetados para transcribe.cpp y requieren compilar desde fuente; no se documentan conversiones o soporte para otros motores de inferencia.
- Restricciones de licencia: el modelo hereda OpenMDW-1.1 del modelo base de NVIDIA. Hay que revisar los terminos completos en la model card del modelo base antes de un uso comercial, ya que la licencia se etiqueta como "other" en HuggingFace y la model card upstream es la fuente autoritativa.
- Degradacion con cuantizaciones agresivas: Q4_K_M sube el WER a 8,49 % en FLEURS en y 3,28 % en LibriSpeech test-clean, frente a 7,97 % y 3,04 % en F32. La diferencia es pequena, pero conviene validar sobre el dominio objetivo antes de desplegar en produccion.
- Reproducibilidad del WER: las cifras publicadas dependen de configuraciones concretas (greedy RNN-T, --language en-US, whisper-normalizer para el scoring, att_context_size=[56, 13] offline). Cambiar el chunk de streaming o el contexto derecho alterara los resultados.
- Metricas de rendimiento medidas en hardware concreto: los RTF de 98x, 29x, 14,5x y 7,5x corresponden a un Apple M4 Max y a un AMD Ryzen 4750U, y no son extrapolables sin validacion a otras plataformas.
- Formato de audio restringido: solo WAV mono a 16 kHz. Cualquier otra entrada requiere un paso previo de conversion con herramientas externas como ffmpeg.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/handy-computer/nemotron-3.5-asr-streaming-0.6b-gguf
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Commit del modelo base usado para la conversion: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b/commit/24b151a
- Repositorio de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/909e94e
- Documentacion del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/nemotron-3.5-asr-streaming-0.6b.md
- Aplicacion Handy (speech-to-text de escritorio): https://handy.computer/
- Descarga de Handy: https://handy.computer/download.html
- Articulo arXiv 2312.17279: https://arxiv.org/abs/2312.17279
- Articulo arXiv 2305.05084: https://arxiv.org/abs/2305.05084
- Pesos por cuantizacion:
  - F32: https://huggingface.co/handy-computer/nemotron-3.5-asr-streaming-0.6b-gguf/resolve/main/nemotron-3.5-asr-streaming-0.6b-F32.gguf
  - F16: https://huggingface.co/handy-computer/nemotron-3.5-asr-streaming-0.6b-gguf/resolve/main/nemotron-3.5-asr-streaming-0.6b-F16.gguf
  - Q8_0: https://huggingface.co/handy-computer/nemotron-3.5-asr-streaming-0.6b-gguf/resolve/main/nemotron-3.5-asr-streaming-0.6b-Q8_0.gguf
  - Q6_K: https://huggingface.co/handy-computer/nemotron-3.5-asr-streaming-0.6b-gguf/resolve/main/nemotron-3.5-asr-streaming-0.6b-Q6_K.gguf
  - Q5_K_M: https://huggingface.co/handy-computer/nemotron-3.5-asr-streaming-0.6b-gguf/resolve/main/nemotron-3.5-asr-streaming-0.6b-Q5_K_M.gguf
  - Q4_K_M: https://huggingface.co/handy-computer/nemotron-3.5-asr-streaming-0.6b-gguf/resolve/main/nemotron-3.5-asr-streaming-0.6b-Q4_K_M.gguf
