# Koptev/parakeet-ultra-ggml

## Resumen

parakeet-ultra-ggml es una conversión al formato ggml del modelo de reconocimiento automático del habla (ASR) parakeet-ultra de Moondream, publicada por el usuario Koptev. El modelo subyacente es una versión post-entrenada de nvidia/parakeet-tdt-0.6b-v3, del que hereda arquitectura, tokenizador y número de parámetros. Esta conversión concreta está pensada para el motor de reconocimiento de voz OxSay en macOS y se ejecuta mediante el soporte Parakeet de whisper.cpp, lo que permite usar un modelo ASR de calidad servidor en hardware Apple Silicon sin dependencias de CUDA ni de frameworks de inferencia propietarios.

La arquitectura es FastConformer-TDT con 24 capas de encoder, dimensión de modelo 1024, 8 cabezas de atención y un subsampling de factor 8, complementada por una red de predicción LSTM de 2 capas con 640 unidades. El modelo ronda los 0,6 mil millones de parámetros y procesa audio mono a 16 kHz, generando texto con puntuación, mayúsculas y marcas de tiempo por palabra. Cubre 25 idiomas europeos con detección automática de idioma y se distribuye bajo licencia CC BY 4.0.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar ASR de alta calidad en local sobre Apple Silicon, con un único fichero de 668 MB en cuantización q8_0. No obstante, conviene subrayar que la evaluación publicada por el autor es sintética y muy reducida (45 frases de texto-a-voz de macOS), que solo se ha probado en un Apple M5 Pro y que la cabeza de detección de actividad de voz (VAD) del modelo original no está incluida en esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-TDT (encoder FastConformer + red de predicción LSTM) |
| Parametros totales | ~0,6 B (aproximadamente 600 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio por segmentos; chunking gestionado por el motor, 30 s por defecto en `ox-stt --chunk-s`) |
| Tipos de cuantizacion | q8_0 (273 matrices grandes en 8 bits con bloques de 32 valores y escala float16; 448 tensores pequeños en float32) |
| Idiomas soportados | en, es, fr, de, bg, hr, cs, da, nl, et, fi, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, sv, ru, uk (25 idiomas europeos, detección automática) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ggml (fichero `ggml-parakeet-ultra-q8_0.bin`, 668.757.119 bytes) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura FastConformer-TDT, una variante de Conformer con atención eficiente y decodificación Token-and-Duration Transducer (TDT). El encoder consta de 24 capas con d_model 1024 y 8 cabezas de atención, con un subsampling de factor 8 que reduce la secuencia de entrada. La red de predicción es una LSTM de 2 capas con 640 unidades, y el vocabulario es un SentencePiece de 8192 tokens más un token blank. Las duraciones TDT consideradas son {0, 1, 2, 3, 4}. El modelo consume audio mono a 16 kHz y el runtime calcula internamente las características log-mel de 128 bins a partir del filterbank y la ventana almacenados en el fichero.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados ni el proceso de post-entrenamiento aplicado por Moondream sobre parakeet-tdt-0.6b-v3. La model card indica que parakeet-ultra es una versión post-entrenada del modelo de NVIDIA, pero no especifica la composición de datos, el uso de RLHF/DPO ni otras innovaciones de entrenamiento. Sí se documenta que el preprocesador (filterbank y ventana) se asume idéntico al de la v3 de NVIDIA, ya que Moondream no publica ficheros de extracción de características propios. La conversión a ggml reproduce byte a byte los ficheros de NVIDIA publicados en `ggml-org/parakeet-GGUF`, lo que aporta trazabilidad sobre el proceso de cuantización.

## Capacidades

- Reconocimiento automático del habla (ASR) en 25 idiomas europeos con detección automática de idioma.
- Generación de texto con puntuación, mayúsculas y numerales según las convenciones de la v3 de NVIDIA.
- Marcas de tiempo por palabra generadas por el runtime (whisper.cpp / OxSay).
- Soporte de sesgo de decodificación hacia términos específicos mediante `--terms-stdin` y `--boost-alpha` en `ox-stt`.
- Procesamiento de audio mono a 16 kHz; el runtime calcula las características log-mel internamente.
- No incluye traducción, diarización de hablantes ni garantías de latencia en streaming.
- No incluye la cabeza de detección de actividad de voz (VAD) del modelo original; el chunking de audio largo lo realiza el motor.
- No soporta fijar el idioma manualmente: la detección es automática, como en la v3.

## Casos de uso

- Transcripción local en macOS: el modelo se ejecuta mediante whisper.cpp u OxSay sobre Apple Silicon, permitiendo transcribir reuniones o notas de voz sin enviar audio a servicios en la nube. Es adecuado por su tamaño contenido (668 MB) y su licencia permisiva.
- Subtitulado automático de vídeo: las marcas de tiempo por palabra que genera el runtime permiten alinear subtítulos con precisión, útil en pipelines de postproducción que necesiten 25 idiomas europeos.
- Dictado por voz en aplicaciones de escritorio: la integración con `ox-stt` y su salida JSON (texto, palabras, tiempos) facilita incorporar dictado multilingüe en editores o herramientas de productividad.
- Sesgo de vocabulario técnico: mediante `--terms-stdin` y `--boost-alpha` se pueden sesgar las transcripciones hacia identificadores de código (`isinstance`, `elif`, `enumerate`) o nombres propios, útil en entornos de desarrollo o documentación técnica.
- Indexación y búsqueda de archivos de audio: la transcripción con timestamps permite construir índices de búsqueda sobre grabaciones largas, divididas en chunks por el motor (30 s por defecto).
- Prototipado de asistentes de voz multilingües: la detección automática de idioma y la cobertura de 25 lenguas europeas permiten validar flujos conversacionales sin entrenar modelos propios.
- Investigación en ASR sobre Apple Silicon: sirve como referencia reproducible para comparar el rendimiento de FastConformer-TDT en Metal frente a implementaciones en GPU NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una evaluación sintética propia (25 + 20 frases de texto-a-voz de macOS, sin ruido, una voz por condición) y una tabla de errores en identificadores cortos con inglés acentuado, pero no se proporcionan cifras numéricas de WER, MMLU, HumanEval ni métricas comparables en la información suministrada. Las cifras de precisión del proveedor fueron medidas en el runtime Photon de Moondream sobre GPUs NVIDIA, no en whisper.cpp ni en cuantización q8_0, por lo que no son trasladables a esta conversión.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero q8_0 ocupa 668.757.119 bytes (~638 MiB); se necesita memoria adicional para el runtime y los buffers de audio.
- GPU recomendadas: no disponible para GPU NVIDIA/AMD; la conversión está probada únicamente en Apple Silicon (Apple M5 Pro con Metal).
- Compatibilidad con GPU de consumo: no se ha probado en RTX 4090, RTX 3090 ni otras GPU de consumo; el autor indica explícitamente que solo se construyó, ejecutó y midió en un Apple M5 Pro.
- Opciones de despliegue: whisper.cpp (soporte Parakeet, commit `6e4ab854f67f743900934a703d5603419384c961`, entre v1.9.4 y v1.9.5) y OxSay (`ox-stt`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; no se publican mediciones de latencia ni de throughput en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/audio | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| parakeet-ultra-ggml (esta ficha) | ~0,6 B | chunking por motor (30 s por defecto en `ox-stt`) | 25 europeos | CC BY 4.0 | ggml q8_0 | Hugging Face |
| nvidia/parakeet-tdt-0.6b-v3 | ~0,6 B | no disponible | 25 europeos | no disponible en la informacion | no disponible | NGC / Hugging Face (referencia) |
| moondream/parakeet-ultra | ~0,6 B | no disponible | 25 europeos | CC BY 4.0 | no disponible | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base, ya que la información proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos de otros autores (por ejemplo, Whisper large-v3 o Canary). No se dispone de métricas de WER comparables para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo Apple Silicon: construido, ejecutado y medido únicamente en un Apple M5 Pro (Metal); no se probó en otras CPU, GPU ni sistemas operativos.
- Cabeza VAD eliminada: los seis tensores `vad_head.*` del modelo original no están en el fichero, por lo que el chunking de audio largo depende del motor (`ox-stt --chunk-s`, 30 s por defecto). Las cifras de formato largo del proveedor no son trasladables.
- Preprocesador asumido: se usan `featurizer.fb` y `featurizer.window` de la v3 de NVIDIA porque Moondream no publica los suyos; es una suposición no probada, aunque consistente con las salidas observadas.
- Evaluación sintética y reducida: 25 + 20 frases de texto-a-voz de macOS, sin ruido, una voz por condición; no hay evaluaciones con grabaciones reales.
- Idioma no fijable: la detección es automática; inglés corto o con acento puede salir transliterado a cirílico (la v3 lo hizo en 3 de 25 clips de una voz proxy con acento ruso; ultra en 0 de 25).
- Identificadores cortos mal reconocidos en inglés acentuado (`isinstance`, `elif`, `enumerate`); el sesgo por términos ayuda pero no cierra la brecha.
- Cifras del proveedor no trasladables: medidas en el runtime Photon de Moondream sobre GPUs NVIDIA, no en whisper.cpp ni en q8_0.
- Licencia CC BY 4.0: permite uso comercial con atribución; es necesario conservar la atribución a Moondream y NVIDIA según `NOTICE.md`.
- Riesgo de alucinación: no se documenta explícitamente, pero es un riesgo inherente a modelos ASR en audio con ruido o acentos no cubiertos por la evaluación.
- Sin soporte de diarización, traducción ni garantías de latencia en streaming; fuera del alcance declarado por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/Koptev/parakeet-ultra-ggml
- Modelo base: https://huggingface.co/moondream/parakeet-ultra (revisión `73175eb7aeb0d82f1e2a6b53b3aabc10a90bcd0b`)
- Modelo NVIDIA de referencia: `nvidia/parakeet-tdt-0.6b-v3` (revisión `541d1f99c6b0c3cd0b11a95167540bb8edefd82b`)
- Repositorio de conversión: `ggml-org/parakeet-GGUF`
- whisper.cpp (commit `6e4ab854f67f743900934a703d5603419384c961`): https://github.com/ggml-org/whisper.cpp
- Audio de muestra JFK: https://github.com/ggml-org/whisper.cpp/blob/6e4ab854f67f743900934a703d5603419384c961/samples/jfk.wav
- Papers referenciados en los tags: arXiv:2509.14128, arXiv:2305.05084, arXiv:2304.06795, arXiv:2505.13404
