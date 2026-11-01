# agentory/qwen3-asr-0.6b-GGUF

## Resumen

Qwen3-ASR 0.6B es un modelo de reconocimiento automático del habla (ASR) desarrollado por Alibaba, construido como un *speech-LLM*: un codificador de audio estilo Whisper que proyecta sus salidas dentro de un LLM Qwen3 de 0.6B que genera la transcripción de forma autorregresiva. Este repositorio concreto, `agentory/qwen3-asr-0.6b-GGUF`, es una conversión a formato GGUF del modelo original `Qwen/Qwen3-ASR-0.6B`, pensada para ejecutarse con el runtime C++ `qwen3-asr-main` del proyecto CrispASR sin dependencias de PyTorch, librosa ni scipy en tiempo de inferencia.

La relevancia del modelo reside en su relación calidad/tamaño: cubre 30 idiomas y 22 dialectos chinos con detección automática de idioma, reporta un WER medio del 6,42 % en el Open ASR Leaderboard de HuggingFace y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales. Con 938 millones de parámetros totales y cuantizaciones que van de 531 MB a 1,88 GB, es desplegable en CPU de consumo y en GPUs modestas.

El punto técnico más destacable de esta conversión es el proceso de cuantización: el codificador de audio se mantiene en Q8_0 en todas las variantes sub-8 bits para evitar bucles de repetición en audio largo, y se ofrece una variante Q4_K calibrada con una importance matrix calculada sobre audio real (Common Voice EN+DE) en lugar de sobre un corpus de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Speech-LLM: codificador de audio (subsampler 2D-conv + Transformer de 18 capas + cabecera proyectora 896→1024) + LLM Qwen3 0.6B (28 capas, GQA 16/8, head_dim=128, Q-norm/K-norm, SwiGLU, RoPE θ=1e6) |
| Parámetros totales | 938.034.704 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q4_K, Q4_K con imatrix, Q3_K con imatrix |
| Idiomas soportados | 30 idiomas (ar, cs, da, de, el, en, es, fa, fi, fil, fr, hi, hu, id, it, ja, ko, mk, ms, nl, pl, pt, ro, ru, sv, th, tr, vi, yue, zh) + 22 dialectos chinos, con detección automática de idioma |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (ggml) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de *speech-LLM* en dos etapas. La torre de audio replica el diseño de Whisper: un subsampler de convoluciones 2D reduce la secuencia de espectrograma log-mel, seguido de un Transformer de 18 capas y una cabecera proyectora que mapea de 896 a 1024 dimensiones. Las tramas resultantes se insertan mediante *embedding splice* en las posiciones del token placeholder `<|audio_pad|>` dentro de un prompt en formato ChatML, y el LLM Qwen3 de 0.6B genera la transcripción de forma autorregresiva. El cuerpo del LLM usa 28 capas con atención GQA de 16 cabezas de consulta y 8 de clave/valor, head_dim de 128, normalización Q-norm/K-norm, activación SwiGLU y RoPE con θ=1e6.

El runtime `qwen3-asr-main` implementa una caché KV persistente, de modo que el coste de decodificación por token es O(1) respecto al tamaño de la caché y no requiere re-forward completos. El filtro mel de `WhisperFeatureExtractor` está embebido en el propio GGUF como `audio.mel_filters` junto con `audio.mel_window`, lo que permite calcular el espectrograma log-mel de forma nativa en C++. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO en la información proporcionada.

La conversión a GGUF incorpora dos decisiones técnicas relevantes. Primero, desde el *rebake* de 2026-07, todas las variantes sub-Q8 mantienen el codificador de audio en Q8_0 (antes Q4_0/Q4_K), porque el análisis con arnés de diferencias sobre un clip real de 145 s mostró que los pesos del codificador por debajo de 8 bits acumulaban deriva por bloque (cos 0.9996 en el bloque 0 frente a 0.973 en el bloque 17 respecto a la referencia bf16), lo que hacía que la decodificación voraz entrara en bucles de repetición o devolviera una respuesta vacía de "language none" en audio largo. Con la torre en Q8_0 la salida del codificador vuelve a cos ≈ 0.9997 y el clip completo se transcribe en una pasada. Segundo, la variante `-q4_k-imatrix.gguf` se cuantiza con una importance matrix de estadísticas de activación por columna recogidas ejecutando audio real por el modelo F16, análoga a `llama-imatrix` de llama.cpp pero calculada sobre audio. Calibrada con una muestra CC0 de Mozilla Common Voice en inglés y alemán, eleva el coseno medio del primer logit de prefill frente al F16 de 0.890 a 0.941 (+0.051), con mejora en todos los clips EN/DE y especialmente en alemán.

## Capacidades

- Transcripción de voz a texto multilingüe en 30 idiomas y 22 dialectos chinos.
- Detección automática del idioma del audio sin indicación explícita.
- Generación autorregresiva de la transcripción mediante un LLM Qwen3 0.6B, lo que permite aprovechar el conocimiento lingüístico del modelo de lenguaje en la salida.
- Procesamiento de audio largo en una sola pasada cuando se usa la variante adecuada (Q8_0 o Q4_K sin imatrix).
- Inferencia nativa en C++ sin dependencias de PyTorch, librosa ni scipy, gracias al filtro mel embebido en el GGUF.
- Ejecución en CPU con caché KV persistente, con decodificación O(1) por token respecto al tamaño de caché.
- Soporte de cuantizaciones desde 531 MB (Q3_K imatrix) hasta 1,88 GB (F16), lo que permite ajustar el equilibrio tamaño/calidad.
- No se ha documentado en la información disponible soporte de tool calling, function calling, agentes, visión, audio de entrada más allá de la transcripción ni modo de razonamiento explícito.

## Casos de uso

- Transcripción de reuniones y actas: el modelo procesa audio de una sola pasada con la variante Q8_0 o Q4_K y detecta el idioma automáticamente, lo que permite generar actas en entornos multilingües sin configurar el idioma por sesión.
- Subtitulado de vídeo y podcasts: con Q4_K ejecutándose ligeramente por encima del tiempo real en una CPU de 4 núcleos, es viable procesar lotes de episodios en servidores sin GPU dedicada.
- Atención al cliente con voz: la licencia Apache-2.0 y el tamaño reducido permiten integrar la transcripción en pipelines de análisis de llamadas o en asistentes telefónicos sin coste de licencia.
- Indexación y búsqueda de archivos de audio: transcribir archivos largos con Q8_0 para alimentar índices de texto y motores de búsqueda internos, aprovechando el WER medio del 6,42 % reportado.
- Investigación en ASR y lingüística computacional: las variantes con imatrix y el propio fichero de importance matrix publicado (913 KB, CC0, Common Voice EN+DE) permiten reproducir y re-cuantizar otros tamaños, útil para estudiar el efecto de la cuantización en modelos de voz.
- Despliegue en dispositivos de borde y entornos sin GPU: la variante Q3_K imatrix de 531 MB y la Q4_K de 631 MB caben en equipos con poca memoria y no requieren acelerador hardware.
- Transcripción de contenido en chino con dialectos: la cobertura de 22 dialectos chinos además del mandarín estándar lo hace adecuado para plataformas de contenido en regiones con variación dialectal.
- Generación de datos de entrenamiento para otros modelos: transcripciones a gran escala sobre corpus de audio abiertos, con la ventaja de la licencia permisiva.

## Benchmarks y rendimiento

El autor reporta un WER medio del 6,42 % en el Open ASR Leaderboard de HuggingFace para el modelo base Qwen3-ASR 0.6B. No se han publicado en la información disponible resultados desglosados por benchmark (MMLU, HumanEval, GSM8K u otros) ni comparativas numéricas con modelos similares.

Rendimiento de inferencia medido sobre `samples/jfk.wav` (11 segundos) en una CPU de 4 núcleos tipo Apple:

| Variante | Mel | Codificador | Prefill | Decodificación/token | Total |
|---|---:|---:|---:|---:|---:|
| F16 | 250 ms | 2660 ms | 3032 ms | 151 ms | 10,3 s |
| Q8_0 | 236 ms | 2459 ms | 2840 ms | 137 ms | 9,5 s |
| Q4_K | 246 ms | 2851 ms | 2721 ms | 118 ms | 9,3 s |

Calidad de cuantización medida con el arnés `tools/imatrix_ab.py` (coseno del primer logit de prefill frente al F16 de referencia, clips reservados):

| Variante | Coseno medio vs F16 | Delta |
|---|---:|---:|
| Q4_K sin imatrix | 0,890 | — |
| Q4_K con imatrix | 0,941 | +0,051 |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 531 MB (Q3_K imatrix), 631 MB (Q4_K y Q4_K imatrix), 961 MB (Q8_0), 1,88 GB (F16). El runtime es C++ y puede ejecutarse enteramente en CPU, por lo que la memoria requerida es la del fichero más el espacio de trabajo de la caché KV.
- GPU recomendadas: no se especifican en la información disponible. El modelo está pensado para el runtime `qwen3-asr-main` de CrispASR, orientado a CPU; no se documenta soporte de aceleración GPU en esta conversión.
- Cabe en GPU de consumo: por tamaño, cualquier GPU con al menos 2 GB de memoria libre podría alojar la variante F16, pero no se confirma soporte de backend GPU en la información disponible.
- Opciones de despliegue: runtime `qwen3-asr-main` del proyecto CrispASR (compilado con CMake). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este modelo concreto.
- Latencia y throughput: en una CPU de 4 núcleos tipo Apple, la variante Q4_K procesa un clip de 11 s en 9,3 s (ligeramente más rápido que el tiempo real). El codificador domina el coste (2,8 s) y la decodificación es de 118 ms por token en Q4_K.
- Requisito de entrada: audio WAV de 16 kHz, mono, PCM de 16 bits; se recomienda preconvertir con `ffmpeg -i input.mp3 -ar 16000 -ac 1 -c:a pcm_s16le output.wav`.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos numéricos de modelos alternativos comparables (por ejemplo, Whisper small/medium, Parakeet o Canary) que permitan una comparación rigurosa de WER, contexto o rendimiento. La siguiente tabla recoge únicamente los atributos conocidos de este modelo y deja las alternativas como no disponibles.

| Atributo | Qwen3-ASR 0.6B (esta conversión) | Alternativa 1 | Alternativa 2 |
|---|---|---|---|
| Parámetros | 938 M | no disponible | no disponible |
| Idiomas | 30 + 22 dialectos chinos | no disponible | no disponible |
| WER medio (Open ASR Leaderboard) | 6,42 % | no disponible | no disponible |
| Licencia | Apache-2.0 | no disponible | no disponible |
| Formato | GGUF | no disponible | no disponible |
| Despliegue en CPU | sí (runtime C++) | no disponible | no disponible |

## Limitaciones y advertencias

- La calibración de la importance matrix se realizó sobre muestras cortas de Common Voice EN+DE. En audio largo de una sola pasada (`--chunk-seconds 0`, varios minutos en un prompt), las variantes con imatrix pueden derivar en repeticiones donde la `-q4_k.gguf` simple se mantiene limpia; para uso de formato largo se recomienda Q4_K sin imatrix o Q8_0.
- La cobertura de calibración por idioma importa: una importance matrix calculada solo en inglés empeoró los resultados; la mezcla EN+DE es la que produjo las ganancias reportadas. No se garantiza el mismo comportamiento en los otros 28 idiomas.
- Las cuantizaciones sub-Q8 anteriores al *rebake* de 2026-07 presentaban bucles de repetición y respuestas vacías en audio largo; es necesario usar los ficheros re-generados con la torre de audio en Q8_0.
- El formato de entrada está restringido a WAV de 16 kHz mono PCM 16 bits; no se documenta soporte de otros contenedores o frecuencias de muestreo directamente.
- El modelo es un ASR: no se documentan capacidades de tool calling, agentes, visión ni razonamiento multi-paso. No debe evaluarse como un LLM de propósito general.
- Riesgo de alucinación y de transcripciones incorrectas en audio con ruido, acentos no cubiertos por el entrenamiento o solapamiento de hablantes; el WER medio del 6,42 % implica errores no despreciables en producción.
- No se dispone de información sobre sesgos demográficos o lingüísticos específicos del modelo base ni sobre su comportamiento en variedades no estándar de los idiomas listados.
- La licencia Apache-2.0 del modelo base permite uso comercial, pero el runtime CrispASR y las herramientas asociadas deben verificarse por separado; la información disponible no detalla su licencia.
- El ecosistema de despliegue es limitado: depende del runtime `qwen3-asr-main` de CrispASR y no se documenta compatibilidad con llama.cpp, vLLM, Ollama o TGI.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/agentory/qwen3-asr-0.6b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Runtime CrispASR: https://github.com/CrispStrobe/CrispASR
- Issue de CrispASR sobre deriva del codificador en audio largo: https://github.com/CrispStrobe/CrispASR/issues/218
- Dataset de calibración de la importance matrix: https://huggingface.co/datasets/cstr/crispasr-imatrix-calib
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- Mozilla Common Voice: https://commonvoice.mozilla.org
