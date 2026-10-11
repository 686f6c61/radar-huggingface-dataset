# myflow-ai/Fun-ASR-Nano-2512-gguf

# Fun-ASR-Nano-2512 GGUF (transcribe.cpp)

## Resumen

Fun-ASR-Nano-2512 GGUF es la conversion a formato GGUF del modelo de reconocimiento automatico del habla Fun-ASR-Nano-2512, desarrollado originalmente por Tongyi Lab (Alibaba) y portado por el usuario `myflow-ai` para su uso con el runtime transcribe.cpp. Se trata de un modelo audio-LLM de aproximadamente 830 millones de parametros que combina un encoder de audio SenseVoiceEncoderSmall con un decodificador basado en Qwen3-0.6B, y que realiza transcripcion offline de audio a texto en chino, ingles y japones.

El modelo resuelve el problema de la transcripcion de voz a texto con un tamano reducido, lo que permite ejecutarlo en hardware de consumo, incluso en CPU, con un factor de tiempo real muy alto. Frente a alternativas mas pesadas, ofrece un WER competitivo en ingles (1,78 % en LibriSpeech test-clean en BF16) manteniendo un peso de entre 531 MB y 1590 MB segun la cuantizacion.

Su relevancia actual radica en que cubre el nicho de ASR ligero y local, sin necesidad de GPU dedicada ni de servicios en la nube, e incluye soporte para 7 dialectos chinos y 26 acentos regionales del mandarin, lo que lo hace especialmente util para aplicaciones en el mercado chino. No obstante, carece de streaming, de marcas de tiempo y de deteccion de idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-LLM: encoder SenseVoiceEncoderSmall (50 bloques SAN-M + 20 bloques transformer) + adaptador de audio de 2 capas (512 → 1024) + decodificador LLM Qwen3-0.6B (28 capas, GQA 16/8, BF16) |
| Parametros totales | 829.791.840 (aproximadamente 830 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Chino (zh), ingles (en), japones (ja); ademas 7 dialectos chinos (wu, cantones, min, hakka, gan, xiang, jin) y 26 acentos regionales del mandarin |
| Licencia | FunASR Model Open Source License Agreement v1.1 (etiquetada como `other`) |
| Formato de pesos | GGUF |
| Entrada | WAV mono a 16 kHz |
| Salida | Texto plano (transcripcion); ITN opcional mediante `--itn` |
| Streaming | no |
| Marcas de tiempo | no |
| Deteccion de idioma | no |
| Traduccion | no |

## Arquitectura y entrenamiento

El modelo sigue un diseno hibrido de tipo audio-LLM. La parte de audio la constituye un encoder SenseVoiceEncoderSmall con 50 bloques principales SAN-M y 20 bloques transformer; su salida se proyecta mediante un adaptador de dos capas que pasa de 512 a 1024 dimensiones. Esa representacion se inyecta en un LLM Qwen3-0.6B de 28 capas con atencion GQA de 16 cabezas de consulta y 8 de clave/valor, en BF16, que genera la transcripcion de forma autorregresiva. Segun la model card, el encoder es un componente congelado y el total de parametros entrenables ronda los 800 millones.

La informacion proporcionada no detalla el numero exacto de tokens de entrenamiento ni la composicion del dataset del modelo Nano, aunque la model card original de la familia Fun-ASR indica que fue entrenada con decenas de millones de horas de audio real. Tampoco se especifica si hubo fases de RLHF o DPO. Si se documenta que se usa decodificacion voraz (greedy) con la cabeza Qwen3-0.6B para las mediciones de WER, y que el modelo incorpora normalizacion inversa de texto (ITN) expuesta mediante `--itn` en la CLI. El port corresponde al commit `a7088d620f755dcdca575b63db184c3ad55b2865` del modelo base, fijado el 2026-05-06, y fue validado contra la referencia de FunASR en el commit `f094d28` de transcribe.cpp.

## Capacidades

- Transcripcion de voz a texto offline en chino, ingles y japones.
- Reconocimiento de 7 dialectos chinos (wu, cantones, min, hakka, gan, xiang, jin) y 26 acentos regionales del mandarin.
- Normalizacion inversa de texto (ITN) opcional, accesible mediante la bandera `--itn` de la CLI y el parametro `transcribe_funasr_nano_params { use_itn }` de la API de la libreria.
- Entrada de audio WAV mono a 16 kHz; el propio autor recomienda convertir con ffmpeg si el audio de origen tiene otro formato.
- No soporta tool calling ni function calling: no es un modelo de proposito general, sino un ASR especializado.
- No soporta agentes ni razonamiento multi-paso.
- No ofrece streaming (procesamiento incremental en tiempo real).
- No genera marcas de tiempo a nivel de palabra ni de segmento.
- No realiza deteccion automatica de idioma ni traduccion.
- No incluye troceado (chunking) integrado para audio de formato largo.

## Casos de uso

- Transcripcion de reuniones y notas de voz en local: el modelo procesa un WAV mono a 16 kHz y devuelve texto sin enviar audio a servicios externos, lo que resulta adecuado cuando hay requisitos de privacidad o de cumplimiento de proteccion de datos.
- Subtitulado de contenido en ingles: la instalacion Q4_K_M ocupa 531 MB y logra 1,92 % de WER en LibriSpeech test-clean, por lo que es viable generar transcripciones en un portatil o en un servidor modesto.
- Aplicaciones de voz en el mercado chino: la cobertura de dialectos y acentos regionales permite construir asistentes o sistemas de dictado que funcionen con hablantes de distintas provincias, un escenario donde muchos modelos multilingues genericos fallan.
- Atencion al cliente con grabaciones telefonicas: al ejecutarse en CPU a velocidad varias veces superior al tiempo real (6,5x en un Ryzen 4750U con cuantizacion), es posible transcribir lotes de llamadas grabadas sin GPU.
- Procesamiento por lotes en pipelines de datos: el formato GGUF y la CLI de transcribe.cpp permiten integrar el modelo en scripts de preprocesado que conviertan archivos de audio a texto para entrenar o indexar otros sistemas.
- Despliegue en dispositivos con recursos limitados: el modelo cabe en memoria de un movil de gama alta o de una placa embebida, lo que habilita casos de dictado o transcripcion totalmente offline.
- Sistemas de documentacion clinica o legal en chino: la capacidad de reconocer terminologia profesional del ambito educativo y financiero que declara la familia Fun-ASR puede aprovecharse para transcribir entrevistas o dictados con vocabulario especializado.
- Generacion de transcripciones para busqueda y analitica: al no incluir marcas de tiempo, el uso principal es el texto resultante, util para indexar, resumir con otro modelo o alimentar motores de busqueda interna.

## Benchmarks y rendimiento

WER medido sobre la particion completa LibriSpeech test-clean (2620 enunciados) con decodificacion voraz del LLM Qwen3-0.6B, segun los datos publicados en la model card del port:

| Cuantizacion | Tamano | WER (LibriSpeech test-clean) |
|---|---:|---:|
| BF16 | 1590 MB | 1,78 % |
| F16 | 1590 MB | 1,79 % |
| Q8_0 | 850 MB | 1,79 % |
| Q6_K | 659 MB | 1,78 % |
| Q5_K_M | 602 MB | 1,82 % |
| Q4_K_M | 531 MB | 1,92 % |

Referencias adicionales citadas en la model card: el publicador reporta 1,76 % en la misma particion y una ejecucion de referencia con FunASR 1.3.1 obtiene 1,79 % (IC 95 % [1,63 %, 1,95 %]). El port BF16 de transcribe.cpp iguala esa linea base con una diferencia de -0,01 puntos porcentuales.

Factor de tiempo real (multiplicador de velocidad respecto a tiempo real) publicado en la model card:

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 77,5 |
| Apple M4 Max | CPU | 27 |
| AMD Ryzen 4750U | Vulkan | 10,5 |
| AMD Ryzen 4750U | CPU | 6,5 |

LibriSpeech es un benchmark exclusivamente en ingles. La propia model card recomienda usar AISHELL-1 y WenetSpeech para chino y CommonVoice JA para japones como comprobaciones complementarias. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas de lenguaje, ya que el modelo no es un LLM de proposito general.

## Requisitos de hardware

- VRAM estimada: entre 531 MB y 1590 MB solo para los pesos, segun la cuantizacion elegida (Q4_K_M 531 MB, Q5_K_M 602 MB, Q6_K 659 MB, Q8_0 850 MB, F16/BF16 1590 MB), mas el espacio del contexto y de los buffers de audio, que la informacion proporcionada no cuantifica.
- GPU recomendadas: no disponible en la informacion proporcionada. El modelo se ha validado en un Apple M4 Max con backend Metal; por tamano, cualquier GPU con 2 GB o mas de memoria deberia poder alojarlo.
- Cabe en GPU de consumo: si. Con menos de 2 GB de pesos en cualquier cuantizacion, es compatible con practicamente cualquier GPU de consumo (por ejemplo, GTX 1650, RTX 3060, RTX 4090) e incluso con graficos integrados mediante Vulkan. El repo completo ocupa 0,9 GB.
- Ejecucion en CPU: si, y es uno de sus puntos fuertes. Se reporta un RTF de 6,5 en un Ryzen 4750U en modo CPU y de 27 en un M4 Max.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli` y API de libreria con `transcribe_funasr_nano_params`). No se indica compatibilidad con llama.cpp, Ollama, vLLM ni TGI en la informacion disponible.
- Latencia y throughput: no disponible en milisegundos o tokens por segundo. Se publican los factores de tiempo real de la tabla anterior, que implican procesamiento mas rapido que tiempo real en todas las plataformas medidas.
- Requisito de entrada: el audio debe convertirse previamente a WAV mono a 16 kHz, por ejemplo con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

No se dispone de datos de benchmark comparativos en la informacion proporcionada. Los datos de los modelos alternativos proceden de sus fichas publicas ampliamente conocidas y no han sido verificados en el material facilitado.

| Modelo | Parametros | Idiomas | Marcas de tiempo | Streaming | Licencia | Formato |
|---|---:|---|---|---|---|---|
| Fun-ASR-Nano-2512 GGUF | ~830 M | zh, en, ja (+ dialectos chinos) | no | no | FunASR Model Open Source License Agreement v1.1 | GGUF |
| Whisper large-v3 | ~1550 M | ~99 idiomas | si | no | MIT | safetensors, GGUF, etc. |
| Whisper medium | ~769 M | ~99 idiomas | si | no | MIT | safetensors, GGUF, etc. |
| SenseVoice-Small | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Consideraciones de la comparacion: Fun-ASR-Nano-2512 es mas pequeno que Whisper large-v3 y similar en orden de magnitud a Whisper medium, pero cubre menos idiomas (3 frente a ~99) y no genera marcas de tiempo. No se dispone de WER de Fun-ASR-Nano-2512 en idiomas distintos del ingles ni de WER de Whisper en esta misma configuracion para establecer una comparacion cuantitativa directa.

## Limitaciones y advertencias

- No es un modelo de streaming: requiere el audio completo antes de transcribir, lo que impide usarlo en dictado o subtitulado en vivo sin un mecanismo de troceado externo.
- No genera marcas de tiempo, ni a nivel de palabra ni de segmento, lo que complica la alineacion con video o la navegacion por la transcripcion.
- No detecta el idioma de forma automatica ni traduce: hay que indicar el idioma o confiar en el comportamiento por defecto del modelo.
- No incluye troceado integrado para audio de formato largo; en archivos extensos habra que segmentar manualmente.
- Solo acepta WAV mono a 16 kHz, por lo que se necesita un paso previo de conversion para la mayoria de formatos de origen.
- Riesgo de alucinacion: aunque la model card del modelo base afirma abordar explicitamente este problema y la confusion de idiomas, no se aportan metricas de tasa de alucinacion en la informacion disponible.
- La unica evaluacion publicada en la model card del port es LibriSpeech test-clean, en ingles; el rendimiento en chino, japones, dialectos y acentos no esta cuantificado en la informacion proporcionada. Hay que validar el modelo en datos propios antes de usarlo en produccion.
- Sesgos: no se documenta ninguna evaluacion de sesgos por acento, genero, edad o variedad dialectal. La asignacion de dialectos y acentos no implica calidad homogenea entre ellos.
- Licencia: se hereda la FunASR Model Open Source License Agreement v1.1 del modelo base, etiquetada como `other`. No es una licencia permisiva estandar, por lo que es imprescindible revisar los terminos completos en la ficha del modelo original antes de cualquier uso comercial.
- El repositorio de la conversion no esta respaldado por el equipo del modelo original, sino por el usuario `myflow-ai`; el mantenimiento y las actualizaciones dependen de ese tercero.
- El port esta fijado a un commit concreto del modelo base (`a7088d620f755dcdca575b63db184c3ad55b2865`, del 2026-05-06), por lo que no incorporara cambios posteriores del modelo original.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/myflow-ai/Fun-ASR-Nano-2512-gguf
- Modelo base en HuggingFace: https://huggingface.co/FunAudioLLM/Fun-ASR-Nano-2512
- Modelo base en ModelScope: https://www.modelscope.cn/models/FunAudioLLM/Fun-ASR-Nano-2512
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentacion del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/fun-asr-nano-2512.md
- Commit de validacion en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/f094d28
- Commit del modelo base usado en el port: https://huggingface.co/FunAudioLLM/Fun-ASR-Nano-2512/commit/a7088d620f755dcdca575b63db184c3ad55b2865
- Pagina del proyecto Fun-ASR: https://funaudiollm.github.io/funasr
- Referencia arXiv indicada en los tags: https://arxiv.org/abs/2509.12508
- Demo en ModelScope: https://modelscope.cn/studios/FunAudioLLM/Fun-ASR-Nano
- Pesos BF16: https://huggingface.co/handy-computer/Fun-ASR-Nano-2512-gguf/resolve/main/Fun-ASR-Nano-2512-BF16.gguf
- Pesos Q8_0: https://huggingface.co/handy-computer/Fun-ASR-Nano-2512-gguf/resolve/main/Fun-ASR-Nano-2512-Q8_0.gguf
- Pesos Q4_K_M: https://huggingface.co/handy-computer/Fun-ASR-Nano-2512-gguf/resolve/main/Fun-ASR-Nano-2512-Q4_K_M.gguf
