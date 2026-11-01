# agentory/sensevoice-small-GGUF

## Resumen

SenseVoiceSmall es un modelo de reconocimiento automático del habla (ASR) desarrollado originalmente por Alibaba (equipo FunAudioLLM) y distribuido aquí en formato GGUF por el usuario agentory. Se trata de un encoder SANM de 70 bloques con una cabeza CTC que, en una única pasada no autorregresiva, emite la transcripción completa junto con la identificación del idioma, la emoción del hablante y etiquetas de eventos sonoros. Con 234 millones de parámetros, es un modelo compacto orientado a inferencia de baja latencia.

La relevancia de esta conversión GGUF radica en que permite ejecutar el modelo fuera del ecosistema Python/FunASR, concretamente con el backend `sensevoice` de CrispASR, y en hardware modesto: la cuantización Q4_K ocupa 129 MB y, según el autor, es dos veces más rápida que F16 en Apple M1 Metal, alcanzando entre 15 y 22 veces tiempo real. El diseño no autorregresivo lo hace considerablemente más rápido que modelos encoder-decoder como Whisper.

El modelo cubre cinco idiomas con identificación nativa (chino mandarín, cantonés, inglés, japonés y coreano) y añade capacidades poco habituales en ASR: clasificación de emoción y detección de eventos acústicos en la misma pasada. Esta ficha describe la conversión GGUF; las capacidades subyacentes provienen del modelo original de Alibaba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder SANM (SenseVoiceEncoderSmall) de 70 bloques con rama FSMN y cabeza CTC |
| Parametros totales | 234.000.287 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K |
| Idiomas soportados | zh, yue, en, ja, ko (identificacion nativa de idioma) |
| Licencia | FunASR Model License v1.1 (uso comercial permitido con atribucion) |
| Formato de pesos | GGUF (ggml) |

## Arquitectura y entrenamiento

El cuerpo del modelo es un encoder SANM de 70 bloques: un bloque de entrada que proyecta de 560 a 512 dimensiones, 49 bloques principales y 20 bloques `tp`, todos con dimensión 512 y 4 cabezas de atención. Cada bloque incorpora una rama de convolución depthwise FSMN con kernel 11. A la entrada se anteponen cuatro embeddings de consulta (idioma, evento, emoción y normalización de texto) sobre las características LFR fbank, de modo que el encoder emite las anotaciones en esas posiciones. La salida pasa por una cabeza CTC con 25.055 piezas SentencePiece. El mismo cuerpo de encoder se emplea en Fun-ASR-Nano-2512, allí acoplado a un decodificador LLM en lugar de a una cabeza CTC.

El diseño es estrictamente no autorregresivo: una sola pasada produce la transcripción y las etiquetas auxiliares, lo que elimina la latencia de decodificación token a token. Según las mediciones del upstream citadas en la model card, esto lo hace unas 15 veces más rápido que Whisper-Large (70 ms para 10 segundos de audio). No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada. La conversión a GGUF no implica reentrenamiento, ajuste fino, fusión ni destilación: solo cambio de formato y cuantización.

## Capacidades

- Transcripción de voz a texto en chino mandarín, cantonés, inglés, japonés y coreano.
- Identificación nativa del idioma hablado en la misma pasada, sin necesidad de un paso previo con whisper-tiny.
- Clasificación de emoción del hablante con las etiquetas HAPPY, SAD, ANGRY, NEUTRAL y EMO_UNKNOWN.
- Detección de eventos acústicos con etiquetas como Speech, Music, Applause, Laughter, Cry y BGM (conjunto abierto según el upstream).
- Normalización de texto configurable: `withitn` (dígitos arábigos y puntuación) o `woitn` (texto crudo).
- Salida estructurada mediante `sensevoice_transcribe_structured()`, que devuelve seis campos (texto, idioma, evento, emoción, flag de normalización) en una estructura C.
- Compatibilidad con la ABI C heredada `sensevoice_transcribe()`, que devuelve la cadena con prefijos de etiquetas.
- No dispone de tool calling, capacidades de agente, visión ni audio generativo: es un modelo exclusivamente de comprensión de audio.

## Casos de uso

- Subtitulado y transcripción por lotes: el modelo procesa audio a 15-22 veces tiempo real en M1 Metal, por lo que un servidor puede transcribir horas de material en minutos con la cuantización Q4_K de 129 MB.
- Moderación de contenido en centros de atención telefónica: la detección de emoción (ANGRY, SAD) y de eventos (Cry) permite marcar llamadas que requieren escalado humano sin analizar el texto transcrito.
- Indexación y búsqueda de archivos multimedia: la identificación de idioma y las etiquetas de evento (Music, Applause, Laughter) permiten segmentar y clasificar bibliotecas de audio automáticamente.
- Aplicaciones de accesibilidad en dispositivos de gama baja: con 129 MB en Q4_K, el modelo cabe en dispositivos embebidos y portátiles sin GPU dedicada, ofreciendo transcripción en tiempo real.
- Análisis de reuniones multilingües: la LID nativa distingue entre los cinco idiomas soportados en una misma grabación, útil en entornos con hablantes de chino, japonés, coreano e inglés.
- Integración en pipelines C/C++ nativos: la ABI C y el formato GGUF permiten enlazar el modelo en aplicaciones sin dependencias de Python, por ejemplo en sistemas de transcripción integrados en kioscos o terminales de punto de venta.
- Investigación en análisis paralingüístico: la salida conjunta de transcripción, emoción y eventos acústicos facilita estudios correlacionales sin necesidad de modelos separados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (WER sobre LibriSpeech, Common Voice, MMLU u otros) en la información disponible. Los únicos datos de rendimiento proporcionados son los siguientes:

| Metrica | Valor | Fuente |
|---|---|---|
| Velocidad frente a Whisper-Large | 15x mas rapido (70 ms para 10 s de audio) | Medicion del upstream citada en la model card |
| Throughput en Apple M1 Metal | 15-22x tiempo real | Model card del autor de la conversion |
| Consistencia Q4_K vs F16 (ingles, JFK) | Transcripcion identica byte a byte | Model card del autor |
| Consistencia Q4_K vs F16 (japones, JSUT) | Transcripcion identica byte a byte | Model card del autor |
| Verificacion `crispasr-diff` sobre zh.mp3 | 76/76 PASS, texto identico | Model card del autor |
| Verificacion `crispasr-diff` sobre jfk.wav | 75/76 PASS (difiere solo la etiqueta de emocion) | Model card del autor |

## Requisitos de hardware

- VRAM estimada: 129 MB para Q4_K, 240 MB para Q8_0 y 448 MB para F16; el modelo completo en memoria ronda los 0,9 GB en el repositorio.
- Cabe en cualquier GPU de consumo moderna e incluso en iGPU y CPU: la cuantización Q4_K es viable en dispositivos con menos de 1 GB de memoria libre.
- GPU recomendadas: no requiere GPU dedicada; funciona en Apple Silicon (Metal), CPU x86 y GPUs NVIDIA de gama baja. Para procesamiento por lotes de alto volumen se recomienda cualquier GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: backend `sensevoice` de CrispASR (compilación con CMake y Ninja, binario `crispasr-cli`). No se mencionan otros runtimes compatibles (llama.cpp, Ollama, vLLM, TGI) en la información disponible.
- Latencia y throughput: 15-22 veces tiempo real en Apple M1 Metal; 70 ms para 10 segundos de audio según el upstream.
- Nota de cuantización: 72 tensores permanecen en F16 en las versiones Q4_K y Q8_0 porque su dimensión principal no está alineada con los bloques de cuantización (70 tensores `attn.fsmn.w` y 2 `attn.qkv.w`); el resto, unos 280 matrices de pesos, se cuantiza sin problemas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Capacidades extra | Licencia | Formato |
|---|---|---|---|---|---|
| SenseVoiceSmall (esta ficha) | 234 M | zh, yue, en, ja, ko | LID, emocion, eventos acusticos | FunASR Model License v1.1 (comercial con atribucion) | GGUF |
| Whisper-Large (referencia citada) | No disponible en la informacion | Multilingue amplio | Solo transcripcion y LID | MIT (upstream) | No disponible |
| Fun-ASR-Nano-2512 (mismo encoder) | No disponible en la informacion | No disponible | Decodificador LLM en lugar de CTC | No disponible | No disponible |

La comparación se limita a los modelos mencionados en la model card. No se dispone de datos de benchmarks comparativos ni de especificaciones detalladas de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo cubre cinco idiomas; no soporta el resto de lenguas que manejan modelos multilingües amplios como Whisper.
- La etiqueta de emoción puede ser inestable en casos de frontera: la verificación sobre jfk.wav muestra un cambio entre ANGRY y EMO_UNKNOWN atribuido al orden de operaciones en F16, aunque la transcripción permanece idéntica.
- No se han publicado métricas de error (WER/CER) en la información disponible, por lo que no es posible cuantificar su precisión frente a alternativas.
- Riesgo de alucinación en segmentos sin habla: el modelo incluye la etiqueta `nospeech`, pero no se documenta su comportamiento en audio ruidoso o silencioso.
- La licencia FunASR Model License v1.1 permite uso comercial con atribución obligatoria a Alibaba/FunAudioLLM; no se conceden derechos adicionales a los de la licencia original.
- La conversión no ha sido entrenada ni ajustada: cualquier limitación del modelo original se hereda íntegramente.
- Dependencia de un runtime concreto (CrispASR); no se documenta compatibilidad con otras herramientas del ecosistema GGUF.
- El repositorio tiene 48 descargas y 0 likes, por lo que la validación comunitaria es todavía muy limitada.

## Enlaces

- Repositorio HuggingFace de la conversión: https://huggingface.co/agentory/sensevoice-small-GGUF
- Modelo original: https://huggingface.co/FunAudioLLM/SenseVoiceSmall
- Licencia del modelo original: https://huggingface.co/FunAudioLLM/SenseVoiceSmall/blob/main/LICENSE
- Runtime CrispASR: https://github.com/CrispStrobe/CrispASR
- Discusión sobre licencia y seguimiento del upstream: https://github.com/CrispStrobe/CrispASR/issues/99
