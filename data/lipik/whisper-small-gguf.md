# lipik/whisper-small-gguf

## Resumen

`lipik/whisper-small-gguf` es una conversión al formato GGUF del modelo `openai/whisper-small`, empaquetada específicamente para su uso con el runtime [transcribe.cpp](https://github.com/handy-computer/transcribe.cpp). Se trata, por tanto, de una redistribución cuantizada del conocido modelo de reconocimiento automático del habla (ASR) de OpenAI, no de un modelo nuevo: la autoría intelectual del modelo original corresponde a OpenAI (Radford et al., 2022), mientras que el trabajo de `lipik` consiste en la conversión y validación de pesos para un motor de inferencia en C++ optimizado para CPU, Metal y Vulkan.

El modelo subyacente es un transformer encoder-decoder de tipo secuencia-a-secuencia con 241.751.392 parámetros (aproximadamente 244 millones), diseñado para transcripción multilingüe, detección de idioma y traducción de voz a texto en inglés. Whisper-small fue entrenado sobre 680.000 horas de audio etiquetado mediante supervisión débil a gran escala, lo que le permite generalizar a dominios y datasets sin fine-tuning.

Su relevancia actual radica en el formato: los ficheros GGUF de entre 164 MB (Q4_K_M) y 924 MB (F32) permiten ejecutar ASR de calidad cercana al estado del arte en hardware de consumo, sin dependencias de Python ni de PyTorch. La model card reporta un WER del 3,33 % en LibriSpeech test-clean con Q8_0, idéntico al de F32, lo que evidencia que la cuantización apenas degrada la precisión en este rango.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq), ventanas de 30 s con decodificación por trozos para audio largo |
| Parámetros totales | 241.751.392 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos; audio largo mediante decodificación por chunks (límite de tokens de texto no especificado en la información disponible) |
| Tipos de cuantización | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 99 idiomas, entre ellos en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su |
| Licencia | Apache-2.0 (heredada de `openai/whisper-small`) |
| Formato de pesos | GGUF (F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder estándar de Whisper. El encoder procesa espectrogramas log-Mel de 30 segundos (ventanas fijas) y el decoder genera tokens de texto de forma autorregresiva, condicionados por tokens especiales de tarea (transcripción, traducción, detección de idioma) y de idioma. Para audio de duración superior a 30 segundos, transcribe.cpp aplica decodificación por chunks con marcas de tiempo a nivel de segmento.

El entrenamiento original de Whisper-small se realizó sobre 680.000 horas de audio etiquetado mediante supervisión débil, combinando datos multilingües de reconocimiento y traducción de voz. La información disponible no detalla la composición exacta del dataset, el número de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO; la model card original de OpenAI tampoco los desglosa en el extracto reproducido. La conversión a GGUF parte del commit `973afd2` de `openai/whisper-small`, fijado el 2026-04-25, y fue validada contra la referencia de transformers en el commit `5.6.1` de transcribe.cpp el 2026-04-26.

La innovación técnica relevante aquí no está en el modelo sino en el runtime: transcribe.cpp implementa decodificación greedy con `suppress_tokens`, fallback de temperatura y marcas de tiempo de segmento, y ofrece kernels para CPU, Metal y Vulkan. La model card advierte que la diferencia frente al número publicado por OpenAI (3,432 % en LibriSpeech test-clean) probablemente se debe a que `model.generate()` usa `<|notimestamps|>` por defecto, mientras que el pipeline de transcribe.cpp ejecuta con timestamps activados.

## Capacidades

- Transcripción automática del habla multilingüe en 99 idiomas, prediciendo el texto en el mismo idioma que el audio.
- Traducción de voz a texto en inglés desde cualquier idioma soportado (`translate: true`).
- Detección automática de idioma (`lang_detect: true`).
- Marcas de tiempo a nivel de segmento (`timestamps: segment`).
- Manejo de audio largo mediante decodificación por chunks sobre ventanas de 30 segundos.
- Ejecución sin fine-tuning sobre dominios nuevos, gracias a la generalización derivada del entrenamiento con supervisión débil.
- No soporta streaming (`streaming: false`).
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente; es un modelo puramente ASR.
- No procesa visión ni audio en tiempo real más allá del procesamiento por ventanas.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo procesa audio largo mediante chunks de 30 segundos y genera marcas de tiempo por segmento, lo que permite alinear actas o índices de búsqueda con los momentos exactos de la grabación.
- Subtitulado automático multilingüe: con detección de idioma y timestamps de segmento, se puede generar un SRT aproximado a partir de un WAV de 16 kHz mono, útil para vídeos internos o documentación.
- Traducción de voz a inglés en atención al cliente internacional: activando la tarea de traducción, un audio en español, alemán o japonés se convierte directamente en texto inglés para su enrutamiento a equipos centralizados.
- Dictado y notas de voz en aplicaciones de escritorio: los ficheros Q4_K_M (164 MB) y Q8_0 (257 MB) caben en memoria de cualquier portátil y se ejecutan vía transcribe.cpp sin dependencias de Python, lo que simplifica el empaquetado.
- Indexación y búsqueda de archivos de audio: transcripción por lotes de grabaciones históricas para construir un corpus textual consultable, con coste de cómputo bajo gracias al RTF elevado en CPU y Metal.
- Cumplimiento y auditoría de llamadas: transcripción local en hardware propio para registrar conversaciones telefónicas sin enviar audio a servicios en la nube, aprovechando la licencia Apache-2.0 y la ausencia de dependencias externas.
- Prototipado de pipelines ASR en entornos sin GPU: con RTF de 9,8 en CPU sobre un M4 Max y 3,4 en un Ryzen 4750U, es viable procesar horas de audio en minutos en máquinas de escritorio convencionales.

## Benchmarks y rendimiento

| Benchmark | Cuantización | Resultado |
|---|---|---|
| LibriSpeech test-clean (WER) | F32 | 3,33 % |
| LibriSpeech test-clean (WER) | F16 | 3,34 % |
| LibriSpeech test-clean (WER) | Q8_0 | 3,33 % |
| LibriSpeech test-clean (WER) | Q6_K | 3,33 % |
| LibriSpeech test-clean (WER) | Q5_K_M | 3,37 % |
| LibriSpeech test-clean (WER) | Q4_K_M | 3,40 % |
| LibriSpeech test-clean (WER, referencia OpenAI) | — | 3,432 % |

| Métrica de velocidad (RTF) | Backend | Valor |
|---|---|---|
| RTF en M4 Max | Metal | 99,2 |
| RTF en M4 Max | CPU | 9,8 |
| RTF en Ryzen 4750U | Vulkan | 12,1 |
| RTF en Ryzen 4750U | CPU | 3,4 |

El WER se midió sobre el split completo de LibriSpeech test-clean (2.620 enunciados) con la decodificación por defecto de transcribe.cpp (greedy, `suppress_tokens`, fallback de temperatura, timestamps de segmento activados). Los números provienen de una única ejecución con backend Metal; la model card advierte que las reducciones paralelas no deterministas de Metal pueden desplazar el WER del corpus en torno a 0,1 puntos porcentuales entre ejecuciones, principalmente por resultados de alucinación en clips cortos cerca del umbral de ruido.

## Requisitos de hardware

- VRAM estimada para inferencia: no se especifica un requisito de VRAM en la información disponible; el tamaño en disco de los pesos va de 164 MB (Q4_K_M) a 924 MB (F32), y el pico de memoria en ejecución será del orden de esos valores más las activaciones del encoder/decoder.
- GPU recomendadas: no se detallan modelos concretos de GPU en la información disponible. La model card reporta resultados en un Apple M4 Max (backend Metal) y en un Ryzen 4750U (backend Vulkan y CPU).
- Cabe en GPU de consumo: sí, por tamaño de pesos (entre 164 MB y 924 MB según cuantización), aunque la información no confirma modelos concretos de GPU de consumo probados.
- Opciones de despliegue: transcribe.cpp (compilación con CMake, binario `transcribe-cli`), con soporte de backends CPU, Metal y Vulkan. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTF de 99,2 (Metal, M4 Max), 9,8 (CPU, M4 Max), 12,1 (Vulkan, Ryzen 4750U) y 3,4 (CPU, Ryzen 4750U). El RTF expresa la relación entre tiempo de audio y tiempo de procesamiento; valores superiores a 1 indican procesamiento más rápido que tiempo real.
- Requisito de entrada: audio en WAV mono a 16 kHz; para otros formatos es necesario convertir previamente con ffmpeg (`-ar 16000 -ac 1`).

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| whisper-small-gguf (este) | 241.751.392 | 99 | GGUF (transcribe.cpp) | Apache-2.0 | Conversión cuantizada de whisper-small; WER 3,33 % en LibriSpeech test-clean (Q8_0) |
| openai/whisper-small (original) | 241.751.392 | 99 | safetensors (transformers) | Apache-2.0 | Peso original en PyTorch; requiere transformers y PyTorch para inferencia |
| openai/whisper-base | no disponible en la información | 99 | safetensors | Apache-2.0 | Variante menor de la familia Whisper; datos concretos no disponibles en esta búsqueda |
| openai/whisper-medium | no disponible en la información | 99 | safetensors | Apache-2.0 | Variante mayor de la familia Whisper; datos concretos no disponibles en esta búsqueda |

La comparación con otras familias de ASR (por ejemplo, modelos de NVIDIA NeMo, wav2vec 2.0 o alternativas basadas en CTC) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinación en clips cortos o con ruido de fondo: la propia model card atribuye parte de la variabilidad del WER a "resultados de alucinación en clips cortos cerca del umbral de ruido".
- No soporta streaming: la decodificación requiere ventanas completas de 30 segundos, lo que introduce latencia estructural en aplicaciones de tiempo real.
- Ventana de contexto limitada a 30 segundos por chunk: el audio largo depende de la lógica de troceado del runtime, y errores en los límites de chunk pueden degradar la transcripción.
- Rendimiento variable por idioma: aunque se listan 99 idiomas, la calidad del WER no se reporta por idioma en la información disponible; los idiomas con menos datos en el entrenamiento original tienden a rendir peor.
- Dependencia de un runtime específico: el GGUF está pensado y validado para transcribe.cpp en el commit 5.6.1; no se garantiza compatibilidad con otras implementaciones de GGUF.
- Requisito estricto de formato de entrada: WAV mono a 16 kHz; sin conversión previa la herramienta no procesará correctamente el audio.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución, pero conviene revisar los términos completos del modelo original en la model card de `openai/whisper-small`, que es la fuente autoritativa.
- Sesgos: no se documentan sesgos específicos en la información disponible; al heredar el entrenamiento de Whisper-small, son aplicables los sesgos demográficos y lingüísticos del dataset original de OpenAI, no desglosados aquí.
- Repositorio con muy baja tracción: 21 descargas y 0 likes en el momento de la consulta, lo que implica escasa validación comunitaria independiente.

## Enlaces

- [Hugging Face: lipik/whisper-small-gguf](https://huggingface.co/lipik/whisper-small-gguf)
- [Modelo base: openai/whisper-small](https://huggingface.co/openai/whisper-small)
- [Commit del modelo base utilizado (973afd2)](https://huggingface.co/openai/whisper-small/commit/973afd2)
- [Repositorio transcribe.cpp](https://github.com/handy-computer/transcribe.cpp)
- [Commit de validación transcribe.cpp 5.6.1](https://github.com/handy-computer/transcribe.cpp/tree/5.6.1)
- [Página del modelo en transcribe.cpp](https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-small.md)
- [Paper: Robust Speech Recognition via Large-Scale Weak Supervision](https://arxiv.org/abs/2212.04356)
- [Repositorio original de OpenAI Whisper](https://github.com/openai/whisper)
- Descargas GGUF (alojadas en handy-computer/whisper-small-gguf): [F32](https://huggingface.co/handy-computer/whisper-small-gguf/resolve/main/whisper-small-F32.gguf), [F16](https://huggingface.co/handy-computer/whisper-small-gguf/resolve/main/whisper-small-F16.gguf), [Q8_0](https://huggingface.co/handy-computer/whisper-small-gguf/resolve/main/whisper-small-Q8_0.gguf), [Q6_K](https://huggingface.co/handy-computer/whisper-small-gguf/resolve/main/whisper-small-Q6_K.gguf), [Q5_K_M](https://huggingface.co/handy-computer/whisper-small-gguf/resolve/main/whisper-small-Q5_K_M.gguf), [Q4_K_M](https://huggingface.co/handy-computer/whisper-small-gguf/resolve/main/whisper-small-Q4_K_M.gguf)
