# lipik/Fun-ASR-MLT-Nano-2512-gguf

## Resumen

Fun-ASR-MLT-Nano-2512 en formato GGUF es una conversión cuantizada del checkpoint multilingüe Fun-ASR-MLT-Nano-2512 desarrollado por Tongyi Lab (FunAudioLLM, Alibaba), publicada por el usuario `lipik` para su uso con el runtime [transcribe.cpp](https://github.com/handy-computer/transcribe.cpp). No se trata de un modelo nuevo: el autor mantiene la arquitectura y los pesos del modelo original (compilados desde el commit `cf67a938` del repositorio upstream, fijado el 2026-05-06) y los reempaqueta en seis cuantizaciones GGUF (BF16, F16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) que ocupan entre 531 MB y 1590 MB.

El modelo resuelve transcripción de voz a texto offline en 31 idiomas, con especial atención al chino, inglés, cantonés, japonés, coreano y lenguas del sudeste asiático (vietnamita, indonesio, tailandés, malayo, filipino), además de árabe, hindi y 19 lenguas europeas. La arquitectura combina un encoder SenseVoiceEncoderSmall congelado, un adaptador de audio de dos capas y un LLM Qwen3-0.6B, sumando 829.791.840 parámetros totales. Es relevante porque permite ejecutar un sistema ASR de calidad cercana a la referencia de FunASR en hardware de consumo, con el modelo completo por debajo de 1 GB en cuantizaciones agresivas.

La versión MLT se entrenó sobre "cientos de miles de horas" de audio multilingüe, un corpus notablemente menor que las "decenas de millones de horas" del Fun-ASR-Nano original, según la propia model card. La conversión no añade streaming, ni marcas de tiempo, ni traducción, ni detección automática de idioma: es un transductor de WAV mono a 16 kHz a texto plano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder SenseVoiceEncoderSmall (congelado) + adaptador de audio de 2 capas + LLM Qwen3-0.6B |
| Parametros totales | 829.791.840 (dato real de safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (modelo ASR; no se especifica duración máxima de audio ni ventana de contexto textual) |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 31: zh, en, yue, ja, ko, vi, id, th, ms, tl, ar, hi, bg, hr, cs, da, nl, et, fi, el, hu, ga, lv, lt, mt, pl, pt, ro, sk, sl, sv |
| Licencia | FunASR Model Open Source License Agreement v1.1 (etiquetada como `other`) |
| Formato de pesos | GGUF (compatible con transcribe.cpp) |
| Entrada de audio | WAV mono a 16 kHz |
| Parametros de decodificacion | ITN (inverse text normalization) opcional vía `--itn` / `use_itn` |
| Streaming | No |
| Marcas de tiempo | No |
| Traduccion | No |
| Deteccion de idioma | No |

## Arquitectura y entrenamiento

El modelo sigue el patrón encoder-adaptador-LLM habitual en los sistemas ASR neuronales recientes. El encoder SenseVoiceEncoderSmall permanece congelado durante el entrenamiento y extrae representaciones acústicas; un adaptador de audio de dos capas proyecta esas representaciones al espacio de embeddings del LLM; y un Qwen3-0.6B incluido en el paquete genera el texto transcripto con decodificación greedy. El conjunto suma aproximadamente 800 millones de parámetros entrenables, de los cuales la mayor parte corresponde al LLM. La conversión GGUF preserva esta estructura, de modo que transcribe.cpp ejecuta el encoder y el adaptador en el mismo grafo cuantizado que la cabeza generativa.

El entrenamiento se realizó sobre "cientos de miles de horas" de voz multilingüe real, según la model card del checkpoint MLT, frente a las "decenas de millones de horas" que declara la variante Fun-ASR-Nano. El modelo base está pensado para dominios verticales como educación y finanzas, con énfasis declarado en terminología profesional y en la mitigación de alucinaciones y confusión de idioma. No se documentan en la información disponible detalles sobre la composición exacta del dataset, el uso de RLHF/DPO ni el proceso de alineación. La validación numérica de la conversión se hizo contra la referencia FunASR 1.3.1 en el commit `f094d28` de transcribe.cpp.

## Capacidades

- Transcripción de voz a texto offline en 31 idiomas, con cobertura prioritaria de lenguas de Asia oriental y sudoriental.
- Soporte de code-switching dentro del ámbito multilingüe declarado por el autor, aunque sin detección explícita de idioma.
- Normalización inversa de texto (ITN) para convertir números y magnitudes habladas a formato escrito, activable mediante `--itn`.
- Procesamiento de audio WAV mono a 16 kHz; el autor recomienda preconversión con ffmpeg para otras fuentes.
- Ejecución en CPU y GPU: el autor reporta aceleración por Metal en Apple M4 Max y por Vulkan en AMD Ryzen 7 4750U.
- No soporta streaming, marcas de tiempo por palabra, traducción automática ni identificación del idioma hablado.
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso: el LLM Qwen3-0.6B se usa exclusivamente como cabeza de decodificación ASR.

## Casos de uso

- Transcripción de reuniones y notas de voz en entornos sin conectividad: el modelo se ejecuta íntegramente en local con 531 MB en Q4_K_M, lo que permite procesar grabaciones en portátiles sin enviar audio a servicios externos.
- Subtitulado por lotes de archivos multimedia: al no generar marcas de tiempo, se usaría para producir el texto y un alineador externo se encargaría de la sincronización; es adecuado por su bajo coste por hora de audio en CPU.
- Atención al cliente multilingüe: con 31 idiomas y especial atención a mercados asiáticos, permite transcribir llamadas o mensajes de voz para su posterior análisis, clasificación o alimentación de un sistema de tickets.
- Archivística y digitalización de material audiovisual: digitalización de fondos en varias lenguas europeas y asiáticas con un único modelo, reduciendo la necesidad de mantener un pipeline distinto por idioma.
- Investigación en lingüística de corpus: generación de transcripciones para análisis cuantitativo de habla en 31 lenguas, con la ventaja de que las cuantizaciones Q6_K mantienen un WER de 1,69 % en LibriSpeech test-clean, ligeramente mejor que BF16.
- Prototipado rápido de aplicaciones de voz: la CLI de transcribe.cpp permite validar un producto de dictado o búsqueda por voz en horas, sin infraestructura de GPU dedicada.
- Procesamiento en dispositivos de borde: los 531 MB de Q4_K_M y el rendimiento en CPU (RTF 4,5 en un Ryzen 7 4750U) hacen viable la transcripción en equipos modestos o en entornos embebidos con x86.

## Benchmarks y rendimiento

El autor solo publica WER sobre LibriSpeech test-clean (2620 enunciados, inglés) con decodificación greedy mediante la cabeza Qwen3-0.6B. La línea base propia medida con FunASR 1.3.1 sobre el mismo manifiesto es 1,76 % (IC 95 % [1,60 %, 1,93 %]).

| Cuantizacion | Tamano | WER LibriSpeech test-clean | RTF en M4 Max (Metal) | RTF en Ryzen 7 4750U (Vulkan) |
|---|---:|---:|---:|---:|
| BF16 | 1590 MB | 1,74 % | 68 | 9 |
| F16 | 1590 MB | 1,74 % | 68 | 9 |
| Q8_0 | 850 MB | 1,74 % | 68 | 9 |
| Q6_K | 659 MB | 1,69 % | 68 | 9 |
| Q5_K_M | 602 MB | 1,77 % | 68 | 9 |
| Q4_K_M | 531 MB | 1,89 % | 68 | 9 |

Los valores RTF se presentan como múltiplo de velocidad respecto al tiempo real (cuanto mayor, más rápido); el autor los reporta por backend (Metal, Vulkan) y también en CPU (16 en M4 Max, 4,5 en Ryzen 7 4750U). No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni para los otros 30 idiomas: LibriSpeech es exclusivamente inglés, y el propio autor advierte que la fortaleza de la variante MLT es la cobertura multilingüe, no la precisión en inglés.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir del tamaño de los pesos, no publicada por el autor): aproximadamente 0,7-1,0 GB en Q4_K_M, 0,9-1,2 GB en Q6_K y 1,7-2,0 GB en BF16/F16, incluyendo activaciones del encoder y del LLM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para BF16; el autor valida Metal en Apple M4 Max y Vulkan en AMD Ryzen 7 4750U (iGPU).
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060, RTX 4090, así como en Apple Silicon mediante Metal.
- Despliegue: exclusivamente mediante transcribe.cpp (compilación con CMake y binario `transcribe-cli`). No hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF 68 (Metal, M4 Max), RTF 16 (CPU, M4 Max), RTF 9 (Vulkan, Ryzen 7 4750U) y RTF 4,5 (CPU, Ryzen 7 4750U), según los datos del autor.
- Almacenamiento: entre 531 MB y 1,59 GB por cuantización; el repositorio completo ocupa 0,9 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto / audio | Licencia | Formato | Rendimiento |
|---|---:|---|---|---|---|---|
| Fun-ASR-MLT-Nano-2512 (este GGUF) | 829,8 M | 31 | No disponible | FunASR v1.1 | GGUF, safetensors (upstream) | WER 1,69-1,89 % en LibriSpeech test-clean |
| Fun-ASR-Nano-2512 (upstream) | ~800 M | 3 principales (zh, en, ja) | No disponible | FunASR v1.1 | safetensors | No disponible en la información consultada; entrenado con más datos |
| Fun-ASR-MLT-Nano-2512 (safetensors) | 829,8 M | 31 | No disponible | FunASR v1.1 | safetensors | El autor no reporta WER numérico para la variante MLT |
| myflow-ai/Fun-ASR-MLT-Nano-2512-gguf | 829,8 M | 31 | No disponible | FunASR v1.1 | GGUF | No disponible |
| Whisper large-v3 (OpenAI) | ~1550 M | 99 | 30 s por ventana | MIT | safetensors, GGUF, etc. | No verificado en la documentación consultada |

Las cifras de Whisper large-v3 proceden de conocimiento general del ecosistema y no de la documentación consultada para esta ficha, por lo que deben verificarse antes de usarse en una comparación formal. En la información disponible no hay datos de benchmarks cruzados entre Fun-ASR y otros sistemas ASR.

## Limitaciones y advertencias

- No soporta streaming: solo procesa archivos completos, lo que impide usos de dictado en vivo o transcripción de baja latencia continua.
- No genera marcas de tiempo ni traducción, y no detecta el idioma de forma automática; hay que conocer la lengua o gestionarla externamente.
- El WER publicado se limita a inglés (LibriSpeech test-clean). Para los otros 30 idiomas no hay cifras: el autor recomienda ejecutar un manifiesto representativo propio antes de producción.
- El corpus de entrenamiento de la variante MLT es de "cientos de miles de horas", muy inferior a las "decenas de millones" del Fun-ASR-Nano, lo que puede traducirse en menor robustez en dominios especializados.
- Riesgo de alucinación y confusión de idioma inherente a los sistemas encoder-LLM; la model card original afirma mitigarlo, pero no se aportan métricas de ello en la información disponible.
- La licencia FunASR Model Open Source License Agreement v1.1 está etiquetada como `other`: es imprescindible revisar los términos del modelo upstream antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; se trata de una conversión reciente sin validación comunitaria amplia.
- Q4_K_M degrada el WER de 1,74 % a 1,89 % en LibriSpeech; para aplicaciones sensibles a la precisión conviene Q6_K o Q8_0.
- El modelo requiere audio WAV mono a 16 kHz; otras frecuencias o canales exigen remuestreo previo.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/lipik/Fun-ASR-MLT-Nano-2512-gguf
- Modelo base upstream: https://huggingface.co/FunAudioLLM/Fun-ASR-MLT-Nano-2512
- Commit upstream de referencia: https://huggingface.co/FunAudioLLM/Fun-ASR-MLT-Nano-2512/commit/cf67a938bf2829959d08fdfb84e186eff02a67ff
- Conversión GGUF original del autor del runtime: https://huggingface.co/handy-computer/Fun-ASR-MLT-Nano-2512-gguf
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/fun-asr-mlt-nano-2512.md
- Commit de transcribe.cpp usado en la validación: https://github.com/handy-computer/transcribe.cpp/tree/f094d28
- Modelo en ModelScope: https://www.modelscope.cn/models/FunAudioLLM/Fun-ASR-MLT-Nano-2512
- Conversión GGUF alternativa: https://huggingface.co/myflow-ai/Fun-ASR-MLT-Nano-2512-gguf
- Ficha de benchmarks de terceros: https://0xsero.github.io/hf-model-benchmarks/models/FunAudioLLM__Fun-ASR-MLT-Nano-2512--6aca81.html
- Artículo de referencia (tag arXiv): https://arxiv.org/abs/2509.12508
