# mrsoundmind/whisper-large-v3-turbo-gguf

## Resumen

whisper-large-v3-turbo-gguf es una conversión al formato GGUF del modelo openai/whisper-large-v3-turbo, publicada por el usuario mrsoundmind para su uso con transcribe.cpp, un runtime de inferencia de código abierto orientado a modelos de reconocimiento automático del habla. El modelo base es la variante "turbo" de Whisper large-v3, en la que OpenAI redujo el número de capas del decodificador de 32 a 4 para acelerar la inferencia a costa de una degradación mínima de calidad. Esta conversión permite ejecutar el modelo en hardware modesto, incluyendo CPU y GPUs de consumo, gracias a cuantizaciones que van desde F16 (1,51 GB) hasta Q4_K_M (511 MB).

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar ASR multilingüe de alta calidad en entornos con recursos limitados. El modelo soporta transcripción en 100 idiomas, detección de idioma y marcas de tiempo a nivel de segmento, aunque no soporta traducción de voz (a diferencia de whisper-large-v3 estándar) ni streaming. Con licencia Apache-2.0 heredada del modelo base, es apto para uso comercial sin restricciones adicionales.

El modelo tiene 808.904.208 parámetros totales según los safetensors del repositorio, una ventana de entrada de 30 segundos con decodificación por trozos para audio largo, y una entrada mel de 128 bins introducida en la familia v3. Esta conversión concreta está validada contra la referencia de transformers en el commit 5.6.1 de transcribe.cpp y fijada al commit 41f01f3 de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | 808.904.208 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de 30 segundos por chunk; decodificación long-form por trozos |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 100 idiomas (en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su, yue) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer encoder-decoder de la familia Whisper. La variante turbo deriva de whisper-large-v3 mediante poda del decodificador: se reduce de 32 a 4 capas, lo que disminuye drásticamente el coste computacional de la generación manteniendo el encoder intacto. La entrada es un espectrograma mel de 128 bins (frente a los 80 de versiones anteriores), y el procesamiento se realiza en ventanas de 30 segundos con decodificación por trozos para audio de mayor duración. La familia v3 añade el cantonés (yue) al conjunto de idiomas.

El entrenamiento del modelo base se realizó sobre más de 5 millones de horas de datos etiquetados, según la model card original de OpenAI, con un enfoque de supervisión débil a gran escala que favorece la generalización zero-shot. La variante turbo fue afinada específicamente sobre datos de transcripción, excluyendo la traducción, lo que explica que `task="translate"` no esté soportado. Esta conversión GGUF no introduce cambios arquitectónicos: es una cuantización directa de los pesos, validada numéricamente contra la implementación de referencia de transformers en el commit 5.6.1 de transcribe.cpp.

## Capacidades

- Transcripción automática de voz multilingüe en 100 idiomas, incluyendo cantonés (yue) añadido en la familia v3.
- Detección automática de idioma (`lang_detect: true`).
- Marcas de tiempo a nivel de segmento (`timestamps: segment`).
- Procesamiento de audio largo mediante decodificación por trozos sobre ventanas de 30 segundos.
- No soporta streaming (`streaming: false`).
- No soporta traducción de voz (`translate: false`); para traducción se debe usar whisper-large-v3.
- No soporta tool calling ni function calling (es un modelo ASR, no un LLM conversacional).
- No dispone de modo de razonamiento (thinking mode), visión ni audio generativo.

## Casos de uso

- Transcripción de reuniones y actas: el modelo procesa audio de duración arbitraria mediante decodificación por trozos con marcas de tiempo por segmento, lo que permite generar actas alineadas temporalmente y atribuir fragmentos a intervalos concretos.
- Subtitulado automático de vídeo: la salida con timestamps de segmento se puede convertir directamente a formato SRT o VTT, y la cuantización Q8_0 (845 MB) permite ejecutarlo en un portátil sin GPU dedicada.
- Atención al cliente y análisis de llamadas: la detección automática de idioma y el soporte de 100 lenguas permiten transcribir grabaciones de centros de contacto multilingües en un solo pipeline, sin seleccionar el idioma manualmente.
- Despliegue en dispositivos de borde: la versión Q4_K_M (511 MB) cabe en dispositivos con poca memoria y puede ejecutarse en CPU con transcribe.cpp, lo que habilita transcripción local en raspberry Pi, portátiles antiguos o entornos sin conectividad.
- Investigación en lingüística de corpus: el modelo permite transcribir grandes volúmenes de audio en decenas de idiomas con un WER bajo (2,00% en LibriSpeech test-clean), facilitando la creación de corpus anotados a bajo coste.
- Accesibilidad: generación de transcripciones en tiempo casi real en hardware de consumo (RTF 46,4 en Metal sobre M4 Max, es decir, unas 46 veces más rápido que tiempo real) para personas con discapacidad auditiva en entornos domésticos.
- Indexación y búsqueda de archivos de audio: la transcripción con timestamps permite construir índices de texto searchable sobre archivos de audio y vídeo de archivo, con la ventaja de que el modelo es multilingüe y no requiere configuración por idioma.

## Benchmarks y rendimiento

| Benchmark | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 2,00 | 2,00 | 1,96 | 2,00 | 2,00 |

| Plataforma | Backend | RTF (real-time factor) |
|---|---|---:|
| Apple M4 Max | Metal | 46,4 |
| Apple M4 Max | CPU | 1,8 |
| AMD Ryzen 4750U | Vulkan | 3,4 |
| AMD Ryzen 4750U | CPU | 0,8 |

El WER se midió sobre el split completo de LibriSpeech test-clean (2620 utterances) con la decodificación por defecto de transcribe.cpp (greedy, suppress_tokens, temperature fallback, timestamps de segmento activados). OpenAI reporta 2,10% en el mismo split; la diferencia probable se atribuye a que `model.generate()` de OpenAI usa `<|notimestamps|>` por defecto mientras que transcribe.cpp ejecuta con timestamps activados. Los números provienen de una única ejecución en CUDA (L4); la variación entre ejecuciones y backends es de aproximadamente 0,1 puntos porcentuales, principalmente por resultados de alucinación en clips cortos cerca del suelo de ruido.

## Requisitos de hardware

- VRAM estimada: F16 requiere aproximadamente 1,5 GB; Q8_0 unos 845 MB; Q6_K 660 MB; Q5_K_M 591 MB; Q4_K_M 511 MB. Al ser un modelo pequeño, el cuello de botella es más la memoria del sistema que la VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para F16. Funciona en RTX 4090, A100, H100 y L4, pero también en GPUs integradas y de gama baja.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones, incluidas GTX 1650, RTX 3050 y GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: transcribe.cpp (runtime nativo de esta conversión, con backends Metal, Vulkan y CPU). No se indica soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTF 46,4 en Metal sobre M4 Max (unas 46 veces más rápido que tiempo real); RTF 3,4 en Vulkan sobre Ryzen 4750U; RTF 1,8 en CPU sobre M4 Max; RTF 0,8 en CPU sobre Ryzen 4750U (por debajo de tiempo real en este último caso).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---:|---|---|---|---|
| whisper-large-v3-turbo-gguf (este) | 808,9 M | 30 s/chunk | 100 | Apache-2.0 | GGUF | Solo transcripción; sin traducción ni streaming |
| openai/whisper-large-v3-turbo | no disponible en la información | 30 s/chunk | 100 | Apache-2.0 | safetensors | Modelo base; requiere transformers o similar |
| openai/whisper-large-v3 | no disponible en la información | 30 s/chunk | 100 | Apache-2.0 | safetensors | Soporta traducción de voz; decodificador de 32 capas, más lento |
| openai/whisper-large-v2 | no disponible en la información | 30 s/chunk | 99 (sin yue) | Apache-2.0 | safetensors | Entrada mel de 80 bins; familia anterior |

No se dispone de datos de benchmarks comparativos con otros modelos ASR en la información proporcionada más allá del WER de LibriSpeech test-clean citado.

## Limitaciones y advertencias

- No soporta traducción de voz: `task="translate"` no está disponible. Para traducción hay que usar whisper-large-v3.
- No soporta streaming: la inferencia es por lotes sobre ventanas de 30 segundos con decodificación por trozos, lo que añade latencia en audio largo.
- Riesgo de alucinación en clips cortos o con ruido de fondo: la model card del autor menciona que la variación del WER en LibriSpeech (~0,1 pp) se debe principalmente a resultados de alucinación en clips cortos cerca del suelo de ruido.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; al ser un modelo entrenado con supervisión débil a gran escala, puede heredar sesgos de los datos de entrenamiento de OpenAI.
- Limitaciones de idioma: aunque declara 100 idiomas, el rendimiento varía notablemente entre lenguas; los idiomas con menos datos de entrenamiento pueden presentar WER considerablemente superior al de inglés.
- Restricciones de licencia: Apache-2.0 permite uso comercial sin restricciones adicionales, pero se recomienda consultar la model card original de OpenAI para términos completos.
- Caveat de producción: el modelo está validado contra una versión concreta de transcribe.cpp (commit 5.6.1) y un commit concreto del modelo base (41f01f3); cambios en el runtime o en los pesos pueden alterar los resultados. El soporte de backends se limita a Metal, Vulkan y CPU según los datos disponibles.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una conversión reciente y poco validada por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/mrsoundmind/whisper-large-v3-turbo-gguf
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Commit del modelo base: https://huggingface.co/openai/whisper-large-v3-turbo/commit/41f01f3
- Paper de Whisper: https://huggingface.co/papers/2212.04356
- Repositorio transcribe.cpp: https://github.com/mrsoundmind/transcribe.cpp
- Discusión sobre la variante turbo: https://github.com/openai/whisper/discussions/2363
- Descarga F16: https://huggingface.co/mrsoundmind/whisper-large-v3-turbo-gguf/resolve/main/whisper-large-v3-turbo-F16.gguf
- Descarga Q8_0: https://huggingface.co/mrsoundmind/whisper-large-v3-turbo-gguf/resolve/main/whisper-large-v3-turbo-Q8_0.gguf
- Descarga Q6_K: https://huggingface.co/mrsoundmind/whisper-large-v3-turbo-gguf/resolve/main/whisper-large-v3-turbo-Q6_K.gguf
- Descarga Q5_K_M: https://huggingface.co/mrsoundmind/whisper-large-v3-turbo-gguf/resolve/main/whisper-large-v3-turbo-Q5_K_M.gguf
- Descarga Q4_K_M: https://huggingface.co/mrsoundmind/whisper-large-v3-turbo-gguf/resolve/main/whisper-large-v3-turbo-Q4_K_M.gguf
