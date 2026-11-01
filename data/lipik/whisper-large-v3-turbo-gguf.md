# lipik/whisper-large-v3-turbo-gguf

## Resumen

whisper-large-v3-turbo-gguf es una conversión al formato GGUF del modelo Whisper large-v3-turbo de OpenAI, publicada por el usuario lipik y pensada para su uso con transcribe.cpp, una implementación en C++ del pipeline de inferencia de Whisper. El modelo base es una versión podada de Whisper large-v3 en la que las capas del decodificador se reducen de 32 a 4, lo que rebaja drásticamente el coste de inferencia a cambio de una degradación menor de calidad. Esta conversión concreta mantiene la licencia Apache-2.0 del modelo original y ofrece varias cuantizaciones (F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M) con tamaños que van de 1,51 GB a 511 MB.

El modelo resuelve el problema de la transcripción automática de voz multilingüe en entornos donde no se dispone de GPU de gran capacidad o donde se prefiere una pila de inferencia ligera en C++ sin dependencias de Python. Cubre 100 idiomas, incluyendo el castellano y el catalán, e incorpora detección de idioma y marcas de tiempo a nivel de segmento. No soporta traducción de voz (la tarea `translate` no está disponible en la variante turbo), por lo que para traducción hay que recurrir a whisper-large-v3.

La relevancia actual de esta ficha es doble: por un lado, permite ejecutar un modelo ASR de referencia en CPU y en GPUs de consumo con un rendimiento medido (RTF de 46,4 en Metal sobre un M4 Max y de 3,4 en Vulkan sobre un Ryzen 4750U); por otro, su WER en LibriSpeech test-clean (2,00 % en F16, 1,96 % en Q6_K) está en línea con el 2,10 % reportado por OpenAI, lo que confirma que la cuantización no degrada de forma apreciable la calidad en ese corpus.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), decodificador podado a 4 capas |
| Parametros totales | 808.904.208 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de 30 segundos con decodificación por trozos para audio largo |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 100 idiomas, entre ellos en, zh, de, es, ca, ru, ko, fr, ja, pt, tr, pl, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su, yue |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de tipo Whisper. La variante large-v3-turbo parte de large-v3 y reduce el decodificador de 32 a 4 capas, lo que explica que el total de parámetros se sitúe en torno a 809 millones (frente a los aproximadamente 1.550 millones de large-v3 completo). El codificador mantiene la entrada mel de 128 bins introducida en la familia v3, y el pipeline procesa audio en ventanas de 30 segundos con decodificación por trozos para audio de mayor duración. La conversión a GGUF se realizó a partir del commit upstream 41f01f3 (fijado el 2026-04-25) y se validó contra la referencia de transformers en el commit 5.6.1 de transcribe.cpp (2026-04-26).

El entrenamiento subyacente es el de Whisper: más de 5 millones de horas de audio etiquetado, con un enfoque de supervisión débil a gran escala que busca generalización zero-shot. La variante turbo se ajustó con datos de transcripción excluyendo la traducción, de ahí que no soporte `task="translate"`. La familia v3 añade cantonés (yue) al conjunto de idiomas. No se dispone en la información proporcionada de detalles sobre el uso de RLHF o DPO en el entrenamiento del modelo base.

## Capacidades

- Transcripción automática de voz (ASR) multilingüe en 100 idiomas, incluyendo castellano y catalán.
- Detección automática de idioma (`lang_detect: true`).
- Marcas de tiempo a nivel de segmento (`timestamps: segment`).
- Procesamiento de audio largo mediante decodificación por trozos sobre ventanas de 30 segundos.
- No soporta streaming (`streaming: false`).
- No soporta traducción de voz (`translate: false`); para esa tarea hay que usar whisper-large-v3.
- No dispone de tool calling, function calling ni capacidades de agente; es un modelo puramente ASR.
- No dispone de modo thinking, visión ni audio de salida.

## Casos de uso

- Transcripción de reuniones y actas: el modelo procesa audio en ventanas de 30 segundos con decodificación por trozos, lo que permite transcribir grabaciones de varias horas en una sola pasada y generar marcas de tiempo por segmento para ubicar cada intervención.
- Subtitulado automático de vídeo: las marcas de tiempo a nivel de segmento y la detección de idioma permiten generar ficheros de subtítulos en castellano, catalán u otros idiomas sin pasos manuales de segmentación.
- Atención al cliente y análisis de llamadas: al ejecutarse en CPU con un RTF de 0,8 sobre un Ryzen 4750U, permite transcribir grabaciones de call center en servidores sin GPU y alimentar posteriores análisis de texto.
- Dictado y notas de voz en aplicaciones de escritorio: la cuantización Q4_K_M (511 MB) y el binario CLI de transcribe.cpp facilitan integrar la transcripción local en herramientas de escritorio sin dependencias de Python ni servicios en la nube.
- Investigación lingüística y corpus multilingües: la cobertura de 100 idiomas y la detección automática de idioma permiten transcribir y clasificar corpus heterogéneos, aunque la ausencia de traducción limita su uso a la transcripción en el idioma original.
- Despliegue en dispositivos con aceleración Metal o Vulkan: los RTF medidos (46,4 en Metal sobre M4 Max, 3,4 en Vulkan sobre Ryzen 4750U) permiten transcripción casi en tiempo real en hardware de consumo, útil para prototipos y aplicaciones locales.
- Preprocesado de audio para pipelines de NLP: la salida de texto con timestamps sirve como entrada para sistemas de resumen, búsqueda o moderación que trabajen sobre el texto transcrito.

## Benchmarks y rendimiento

| Benchmark | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 2,00 | 2,00 | 1,96 | 2,00 | 2,00 |

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 46,4 |
| Apple M4 Max | CPU | 1,8 |
| AMD Ryzen 4750U | Vulkan | 3,4 |
| AMD Ryzen 4750U | CPU | 0,8 |

El WER se midió sobre el conjunto completo LibriSpeech test-clean (2620 enunciados) con la decodificación por defecto de transcribe.cpp (greedy, suppress_tokens, temperature fallback y timestamps de segmento activados). OpenAI reporta 2,10 % en el mismo conjunto; la diferencia más probable se atribuye a que `model.generate()` de OpenAI usa por defecto `<|notimestamps|>`, mientras que el pipeline de transcribe.cpp ejecuta con timestamps activados. Los datos provienen de una única ejecución en CUDA (L4) y la variación entre ejecuciones y backends es de aproximadamente 0,1 puntos porcentuales. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que el modelo es exclusivamente ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en F16, 845 MB en Q8_0, 660 MB en Q6_K, 591 MB en Q5_K_M y 511 MB en Q4_K_M, más el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria para F16; el modelo es lo bastante pequeño para ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o superiores. Los datos de rendimiento proporcionados corresponden a una L4 en CUDA, a un M4 Max en Metal y a un Ryzen 4750U en Vulkan.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer actuales, incluso con cuantizaciones F16.
- Opciones de despliegue: transcribe.cpp (compilación con CMake y binario `transcribe-cli`); no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: RTF de 46,4 (Metal, M4 Max), 1,8 (CPU, M4 Max), 3,4 (Vulkan, Ryzen 4750U) y 0,8 (CPU, Ryzen 4750U). Un RTF superior a 1 indica procesamiento más rápido que el tiempo real.
- Requisito de entrada: audio en WAV mono a 16 kHz; para otros formatos hay que convertir previamente con ffmpeg (`-ar 16000 -ac 1`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Idiomas | Licencia | Formato | Notas |
|---|---|---:|---|---|---|---|
| lipik/whisper-large-v3-turbo-gguf | 808.904.208 | 30 s por ventana, decodificación por trozos | 100 | Apache-2.0 | GGUF | Esta ficha; WER 2,00 % en LibriSpeech test-clean (F16) |
| openai/whisper-large-v3-turbo | no disponible en la información | 30 s por ventana | 100 | Apache-2.0 | safetensors (transformers) | Modelo base; requiere pila Python |
| openai/whisper-large-v3 | no disponible en la información | 30 s por ventana | 100 | Apache-2.0 | safetensors (transformers) | Decodificador de 32 capas; soporta traducción; WER reportado 2,10 % en LibriSpeech test-clean |
| whisper-large-v2 | no disponible en la información | 30 s por ventana | 99 | Apache-2.0 | safetensors (transformers) | Generación anterior; sin cantonés ni mel de 128 bins |

La comparación con alternativas de otros formatos (por ejemplo, implementaciones GGUF en llama.cpp) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No soporta traducción de voz: la tarea `translate` está deshabilitada en la variante turbo; para traducción hay que usar whisper-large-v3.
- No soporta streaming: el pipeline procesa audio en ventanas de 30 segundos, lo que introduce latencia en aplicaciones en tiempo real.
- La poda del decodificador de 32 a 4 capas implica una degradación de calidad respecto a large-v3, aunque el WER en LibriSpeech test-clean se mantiene en torno al 2 %.
- Riesgo de alucinación en clips cortos y en el límite de ruido: la propia model card señala que la variación del WER está impulsada principalmente por resultados de alucinación en clips cortos sobre el nivel de ruido.
- Los resultados de benchmarks proceden de una única ejecución en CUDA (L4); la variación entre ejecuciones y backends es de aproximadamente 0,1 puntos porcentuales, por lo que no deben interpretarse como valores absolutos.
- Cobertura de idiomas desigual: aunque se listan 100 idiomas, el rendimiento no es uniforme y los idiomas con menos datos de entrenamiento pueden presentar un WER notablemente superior.
- Sesgos: no se detallan sesgos específicos en la información proporcionada; al ser un modelo entrenado con supervisión débil a gran escala, puede heredar sesgos de los datos de origen.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se recomienda revisar la model card upstream de OpenAI para los términos completos.
- Dependencia de transcribe.cpp: el modelo está validado contra el commit 5.6.1 de esa implementación; otras versiones o runtimes pueden no ser compatibles.
- Requiere audio en WAV mono a 16 kHz; no se indica soporte directo de otros formatos o canales.

## Enlaces

- [Modelo en HuggingFace: lipik/whisper-large-v3-turbo-gguf](https://huggingface.co/lipik/whisper-large-v3-turbo-gguf)
- [Modelo base: openai/whisper-large-v3-turbo](https://huggingface.co/openai/whisper-large-v3-turbo)
- [Repositorio transcribe.cpp](https://github.com/handy-computer/transcribe.cpp)
- [Página de modelo en transcribe.cpp](https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-large-v3-turbo.md)
- [Commit upstream 41f01f3](https://huggingface.co/openai/whisper-large-v3-turbo/commit/41f01f3)
- [Commit 5.6.1 de transcribe.cpp](https://github.com/handy-computer/transcribe.cpp/tree/5.6.1)
- [Paper: Robust Speech Recognition via Large-Scale Weak Supervision (arXiv:2212.04356)](https://huggingface.co/papers/2212.04356)
- [Discusión en GitHub sobre la variante turbo](https://github.com/openai/whisper/discussions/2363)
- [Descarga F16](https://huggingface.co/handy-computer/whisper-large-v3-turbo-gguf/resolve/main/whisper-large-v3-turbo-F16.gguf)
- [Descarga Q8_0](https://huggingface.co/handy-computer/whisper-large-v3-turbo-gguf/resolve/main/whisper-large-v3-turbo-Q8_0.gguf)
- [Descarga Q6_K](https://huggingface.co/handy-computer/whisper-large-v3-turbo-gguf/resolve/main/whisper-large-v3-turbo-Q6_K.gguf)
- [Descarga Q5_K_M](https://huggingface.co/handy-computer/whisper-large-v3-turbo-gguf/resolve/main/whisper-large-v3-turbo-Q5_K_M.gguf)
- [Descarga Q4_K_M](https://huggingface.co/handy-computer/whisper-large-v3-turbo-gguf/resolve/main/whisper-large-v3-turbo-Q4_K_M.gguf)
