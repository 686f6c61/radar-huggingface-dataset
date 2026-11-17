# mrsoundmind/parakeet-tdt-0.6b-v3-gguf

## Resumen

`parakeet-tdt-0.6b-v3-gguf` es una conversión a formato GGUF del modelo de reconocimiento automático del habla `nvidia/parakeet-tdt-0.6b-v3`, publicada por el usuario mrsoundmind para su uso con la librería `transcribe.cpp`. El modelo original lo desarrolla NVIDIA y está diseñado para transcripción de voz multilingüe de alto rendimiento en 25 idiomas europeos, con detección automática del idioma del audio.

La arquitectura es un encoder FastConformer de aproximadamente 600 millones de parámetros (627.052.166 según los pesos en safetensors) acoplado a un decodificador transducer TDT/RNNT. El modelo acepta audio WAV mono a 16 kHz y produce transcripciones con puntuación, mayúsculas y marcas de tiempo a nivel de token. No es un modelo de streaming ni realiza traducción entre idiomas.

La relevancia de esta conversión GGUF radica en que permite ejecutar el modelo en hardware de consumo mediante cuantización, desde Q4_K_M (502 MB) hasta F32 (2,51 GB), con una degradación mínima del WER en LibriSpeech test-clean (1,92 %–1,98 % frente al 1,95 % de referencia en F32). La licencia CC-BY-4.0 del modelo base permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + TDT/RNNT (decoder transducer) |
| Parametros totales | 627.052.166 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en tokens; soporta audio de hasta 24 minutos con atención completa (A100 80 GB) o hasta 3 horas con atención local |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 25: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, ru, sk, sl, es, sv, uk |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (para transcribe.cpp); el modelo base usa safetensors |

## Arquitectura y entrenamiento

El modelo emplea un encoder FastConformer, una variante de Conformer optimizada para eficiencia computacional en tareas de audio, junto con un decodificador transducer de tipo TDT (Token-and-Duration Transducer), que predice conjuntamente tokens y duraciones para acelerar la decodificación frente a un RNNT convencional. El modelo base fue entrenado por NVIDIA utilizando el corpus multilingüe Granary como fuente principal de datos, según indica la model card original.

La conversión GGUF se realizó a partir del commit `6d590f7` del modelo upstream (fijado el 2026-04-16) y se validó contra la referencia de NeMo en el commit `bf0d0b7` de transcribe.cpp el 2026-04-18. El modelo soporta atención completa para audio largo y atención local como alternativa para secuencias más extensas. No se dispone de detalles sobre el volumen exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que esa información no está incluida en la documentación proporcionada.

## Capacidades

- Transcripción de voz a texto offline en 25 idiomas europeos con detección automática del idioma.
- Generación de puntuación y mayúsculas en la salida.
- Marcas de tiempo a nivel de token (token-level timestamps).
- Marcas de tiempo a nivel de palabra y de segmento (según la model card original).
- Transcripción de audio largo: hasta 24 minutos con atención completa o hasta 3 horas con atención local.
- No soporta streaming (indicado explícitamente como `streaming: false`).
- No realiza traducción entre idiomas (`translate: false`).
- Detección de idioma activada (`lang_detect: true`).

## Casos de uso

- Transcripción de reuniones y actas: el modelo procesa audio de hasta 24 minutos con atención completa, lo que permite transcribir reuniones completas en una sola pasada con puntuación y marcas de tiempo por token para generar actas alineadas temporalmente.
- Subtitulado automático: las marcas de tiempo a nivel de token y de segmento permiten generar ficheros de subtítulos (SRT/VTT) sincronizados sin necesidad de un alineador externo.
- Archivado y búsqueda de contenido audiovisual: la transcripción multilingüe con detección automática de idioma facilita indexar grabaciones en 25 idiomas europeos y hacerlas buscables por texto.
- Atención al cliente y análisis de llamadas: la transcripción offline con cuantización Q4_K_M (502 MB) permite desplegar el modelo en servidores modestos para procesar grabaciones de llamadas y extraer texto para análisis posterior.
- Investigación lingüística y corpus: la cobertura de 25 idiomas europeos, incluidos idiomas de menor recursos como maltés, estonio o esloveno, lo hace útil para construir corpus transcritos y estudios comparativos entre lenguas.
- Transcripción en el borde (edge) o en portátil: con Q8_0 (740 MB) o Q4_K_M (502 MB) el modelo se ejecuta en CPU y GPU de consumo, lo que permite transcribir localmente sin enviar audio a servicios en la nube, relevante por privacidad.
- Accesibilidad: generación de transcripciones de clases, conferencias o contenido multimedia para personas con discapacidad auditiva, con soporte multilingüe y marcas de tiempo.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 1,95 | 1,95 | 1,94 | 1,93 | 1,92 | 1,98 |
| Tamano (GB) | 2,51 | 1,26 | 0,74 | 0,627 | 0,565 | 0,502 |

El WER se midió sobre la totalidad de LibriSpeech test-clean (2620 enunciados) con decodificación transducer greedy y sin modelo de lenguaje externo. La referencia F32 es 1,95 %; NVIDIA reporta 1,93 % en la misma partición. El rendimiento en tiempo real (RTF, factor de tiempo real) reportado por el autor es:

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 151 |
| Apple M4 Max | CPU | 28 |
| AMD Ryzen 4750U | Vulkan | 12,5 |
| AMD Ryzen 4750U | CPU | 7,5 |

No se han publicado resultados de benchmarks multilingües (por ejemplo, sobre FLEURS u otros corpus) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,5 GB para Q4_K_M, 0,74 GB para Q8_0, 1,26 GB para F16 y 2,51 GB para F32 (tamaños de fichero; el consumo real añade overhead del runtime).
- Cabe en GPU de consumo: cualquier GPU con 2–4 GB de VRAM libre puede ejecutar las cuantizaciones Q4_K_M a F16; una GTX 1650, RTX 3050 o superior es suficiente.
- GPU recomendadas para alto rendimiento: A100 80 GB para audio largo con atención completa (hasta 24 minutos), H100 o RTX 4090 para throughput elevado.
- Despliegue: la librería objetivo es `transcribe.cpp` (compilación con CMake). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible; al ser un modelo ASR con arquitectura transducer, no es compatible con los runtimes de LLM habituales.
- Latencia y throughput: RTF de 151 en Metal (M4 Max), 28 en CPU (M4 Max), 12,5 en Vulkan (Ryzen 4750U) y 7,5 en CPU (Ryzen 4750U). Un RTF superior a 1 indica procesamiento más rápido que tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto de audio | Licencia | Formato |
|---|---|---|---|---|---|
| parakeet-tdt-0.6b-v3 (este GGUF) | 627 M | 25 europeos | hasta 24 min (atención completa) / 3 h (local) | CC-BY-4.0 | GGUF |
| nvidia/parakeet-tdt-0.6b-v2 | no disponible | ingles | no disponible | CC-BY-4.0 | safetensors / NeMo |
| Whisper large-v3 (OpenAI) | 1550 M | ~99 | 30 s por ventana | MIT | safetensors, GGUF, etc. |
| Whisper large-v3-turbo | 809 M | ~99 | 30 s por ventana | MIT | safetensors, GGUF, etc. |

No se dispone de datos de benchmarks comparativos directos entre estos modelos en la información proporcionada; la comparación se limita a parámetros, cobertura de idiomas y licencia.

## Limitaciones y advertencias

- No es un modelo de streaming: requiere audio completo o segmentado previamente; no admite transcripción en tiempo real continua.
- No traduce: solo transcribe en el idioma detectado.
- Solo acepta WAV mono a 16 kHz; es necesario convertir otros formatos con ffmpeg antes de la inferencia.
- Cobertura limitada a 25 idiomas europeos; no soporta idiomas fuera de esa lista (por ejemplo, asiáticos, africanos o amerindios).
- Riesgo de alucinación y errores en audio con ruido, acentos marcados o solapamiento de hablantes; el WER de 1,95 % corresponde a LibriSpeech test-clean, un corpus de lectura limpia, no a audio real.
- La licencia CC-BY-4.0 permite uso comercial pero exige atribución; debe conservarse la referencia a NVIDIA y al autor de la conversión.
- La conversión GGUF está validada contra NeMo en un commit concreto; cambios en transcribe.cpp pueden alterar la compatibilidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validación comunitaria amplia.
- No se dispone de información sobre sesgos demográficos o lingüísticos específicos del modelo base en la documentación proporcionada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mrsoundmind/parakeet-tdt-0.6b-v3-gguf
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Commit del modelo base usado: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3/commit/6d590f7
- Modelo predecesor: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/nvidia/parakeet-tdt-0.6b-v3
- Dataset Granary: https://huggingface.co/datasets/nvidia/Granary
- Repositorio transcribe.cpp: https://github.com/mrsoundmind/transcribe.cpp
- Papers referenciados en los tags: arXiv 2509.14128, 2505.13404, 2305.05084, 2304.06795, 2410.01036, 2406.00899, 2205.12446, 2012.03411, 2007.10310, 1510.08484
