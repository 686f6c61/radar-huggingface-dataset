# audio-cpp/Ming-3.0-Audio-Tiny-GGUF

## Resumen

Ming-3.0-Audio-Tiny-GGUF es la conversión al formato GGUF del modelo multimodal de audio `inclusionAI/Ming-3.0-audio-tiny`, publicada por el usuario `audio-cpp` para su uso con el runtime de inferencia [audio.cpp](https://github.com/0xShug0/audio.cpp). El modelo integra en un único archivo el codificador de audio, un Thinker basado en arquitectura MoE con atención KDA/MLA, un Talker para síntesis de voz, un VAE de audio, un codificador de hablante CAMPPlus, los tokenizadores y la configuración completa. Cubre tareas de reconocimiento automático del habla (ASR), comprensión de audio, text-to-speech (TTS) y clonación de voz.

La relevancia de esta ficha radica en que empaqueta un pipeline de audio completo en un solo GGUF ejecutable sin dependencias de Python ni PyTorch, con variantes de cuantización que reducen el uso de VRAM. La versión del 23 de octubre de 2026 introduce una mejora de rendimiento en CUDA en modo residente: el RTF baja de 0,050 a 0,024 y el pico de VRAM de 14.600 a 11.596 MiB en los ejemplos de referencia del autor.

El modelo soporta únicamente chino (zh) e inglés (en), se distribuye bajo licencia MIT y está pensado para despliegues de transcripción, síntesis y clonación de voz en entornos con GPU, así como para inferencia en CPU con funcionalidad limitada verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atención KDA/MLA (Thinker) + Talker + codificador de audio + VAE de audio + codificador de hablante CAMPPlus |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 32.768 tokens de asignación en el ejemplo de reunión (no se especifica el máximo arquitectónico) |
| Tipos de cuantizacion | BF16 (tensores originales, routers de expertos y CAMPPlus en F32), Q8_0 (bancos de expertos del Thinker), Q4_K (bancos de expertos del Thinker, cabeza de salida de texto en Q8_0) |
| Idiomas soportados | zh, en |
| Licencia | MIT |
| Formato de pesos | GGUF (un único archivo con todos los componentes) |

## Arquitectura y entrenamiento

El modelo combina varios subsistemas en un solo paquete GGUF: un codificador de audio, un componente denominado Thinker con arquitectura MoE y atención KDA/MLA, un Talker encargado de la síntesis de voz, un VAE de audio, un codificador de hablante CAMPPlus y los tokenizadores correspondientes. La salida de voz es mono a 44,1 kHz. Las variantes cuantizadas preservan el codificador de audio, las proyecciones de atención y MLP del Thinker, el Talker, el VAE y el codificador de hablante; por tanto, el consumo de memoria en modo solo TTS no se reduce al cuantizar los expertos del Thinker.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La conversión GGUF está anclada a la revisión `25b96e30be3739849bf76c0f48ac11db4a262fb3` del checkpoint original, y el código de inferencia de referencia es [Ming-3.0-audio-flash](https://github.com/inclusionAI/Ming-3.0-audio-flash). El modo de offload de expertos (`ming3_audio.disk_experts=true`) mantiene los pesos de los expertos en memoria host y los carga en una caché GPU acotada, con ocho slots de expertos por capa por defecto.

## Capacidades

- Reconocimiento automático del habla (ASR) offline con decodificación greedy.
- Comprensión de audio y respuesta hablada mediante el modo `s2s` (entrada de audio procesada por el Thinker y sintetizada por el Talker).
- Text-to-speech con voces con nombre (por ejemplo, `voice_id=US_James`) sin audio de referencia.
- Clonación de voz a partir de audio de referencia; el audio de referencia condiciona la identidad del hablante y, opcionalmente, su prefijo acústico si se aporta `reference_text`.
- Soporte bilingüe chino-inglés; se recomienda referencia en el idioma objetivo para una pronunciación más fiable.
- Troceado de texto para salidas largas controlado por `text_chunk_size` (100 caracteres por defecto).
- Inferencia en CPU verificada funcionalmente para ASR corto y TTS (no incluida en la comparativa de rendimiento CUDA).
- No se documenta soporte de tool calling ni de razonamiento multi-paso en la información disponible.

## Casos de uso

- Transcripción de reuniones largas: el modelo procesa audio de hasta 1.244,64 s en el ejemplo del autor con una asignación de 32.768 tokens y finalización natural, adecuado para actas y resúmenes automáticos.
- Generación de voz para asistentes y lectores de pantalla: TTS con voces con nombre y control de idioma, con salida mono a 44,1 kHz lista para integrarse en pipelines de audio.
- Clonación de voz para doblaje y audiolibros: a partir de un audio de referencia se condiciona la identidad del hablante; el troceado de texto permite salidas largas (63,9 s en el caso de clonación del autor).
- Transcripción y respuesta hablada en conversaciones: el modo `s2s` permite responder con voz a una entrada de audio, útil en interfaces conversacionales por voz.
- Procesamiento por lotes en servidores con GPU: el modo residente en CUDA con Q4_K alcanza un RTF de 0,024 en el ejemplo de música (152,84 s) y 11.596 MiB de pico de VRAM, adecuado para despliegues de transcripción masiva.
- Despliegue con memoria GPU limitada: el modo de offload de expertos a disco mantiene los pesos en memoria host y los carga en una caché GPU acotada, permitiendo ejecutar el modelo en GPUs con menos VRAM a costa de latencia.
- Evaluación y prototipado sin Python: el binario `audiocpp_cli` permite ejecutar ASR, TTS y clonación desde línea de comandos con un único archivo GGUF.

## Benchmarks y rendimiento

Mediciones del autor sobre RTX 5090 con build C++17 Debug, comparando Python (BF16 oficial, PyTorch 2.11.0+cu128, Transformers 5.12.1, SDPA) y audio.cpp:

| Caso | Metrica | Python BF16 | audio.cpp |
|---|---|---|---|
| Musica (152,84 s), Q4_K residente | RTF | 0,050 | 0,024 |
| Musica (152,84 s), Q4_K residente | Pico VRAM | 14.600 MiB | 11.596 MiB |
| Reunion (1.244,64 s) | Asignacion de tokens | 32.768 | 32.768 |
| Clonacion larga | WER (Whisper turbo) | 0% | 0,40% (presupuesto de 100 caracteres) |
| TTS con voz con nombre | WER (Whisper medium) | 1,98% | 0% |
| ASR corto | Transcripciones | referencia | coinciden exactamente con Python |

Las dos salidas WAV de clonación de audio.cpp son idénticas byte a byte tras una petición corta intermedia; lo mismo ocurre con las dos salidas de TTS con voz con nombre. Las respuestas Q4 en el caso de reunión difieren de BF16; el autor indica que son mediciones de rendimiento con entradas emparejadas, no una afirmación de paridad de salida. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Pico de VRAM medido en RTX 5090 con Q4_K en modo residente: 11.596 MiB para el ejemplo de música (152,84 s).
- Pico de VRAM medido en RTX 5090 con BF16 en modo residente: 14.600 MiB para el mismo ejemplo.
- GPU recomendadas: RTX 5090 (mediciones oficiales); no se documentan otras GPU en la información disponible.
- Cabe en GPU de consumo de gama alta con al menos ~12 GB de VRAM en Q4_K residente; para GPUs con menos memoria, el modo `ming3_audio.disk_experts=true` mantiene los expertos en memoria host con una caché GPU acotada.
- Despliegue mediante `audiocpp_cli` del proyecto [audio.cpp](https://github.com/0xShug0/audio.cpp), con backends CUDA y CPU.
- Inferencia en CPU verificada funcionalmente para ASR corto y TTS, sin datos de rendimiento publicados.
- Latencia: RTF de 0,024 en Q4_K residente para el ejemplo de música; salidas de TTS de 63,9 s (clonación) y 79,7 s (voz con nombre) para un texto de 1.518 caracteres.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Ming-3.0-Audio-Tiny-GGUF | no disponible | hasta 32.768 tokens de asignación en ejemplo | zh, en | MIT | GGUF | ASR + TTS + clonación en un solo archivo; runtime audio.cpp |
| inclusionAI/Ming-3.0-audio-tiny (original) | no disponible | no disponible | zh, en | MIT | safetensors (BF16) | Checkpoint de referencia; requiere Python/PyTorch |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Solo soporta chino e inglés; no se documentan otros idiomas.
- No se dispone de información sobre sesgos conocidos ni sobre tasas de alucinación en la información proporcionada.
- La cuantización Q4_K puede producir respuestas distintas de BF16 en tareas de comprensión larga (el autor lo señala explícitamente en el ejemplo de reunión).
- El ahorro de memoria por cuantización de expertos no aplica al modo solo TTS, ya que el codificador de audio, el Talker, el VAE y el codificador de hablante se conservan en precisión original.
- El frontend nativo usa el troceado de texto del framework y no ejecuta el normalizador de texto FST opcional de Python; se recomienda escribir los números con letras cuando la pronunciación sea crítica.
- En clonación de voz se recomienda una referencia en el idioma objetivo para una pronunciación fiable.
- El WER de clonación larga en audio.cpp (0,40%) es superior al de Python (0%) con el presupuesto de 100 caracteres.
- Licencia MIT, que permite uso comercial; conviene verificar las condiciones del checkpoint original y de los datos de entrenamiento subyacentes, no detalladas en la información disponible.

## Enlaces

- [Hugging Face: audio-cpp/Ming-3.0-Audio-Tiny-GGUF](https://huggingface.co/audio-cpp/Ming-3.0-Audio-Tiny-GGUF)
- [Modelo base: inclusionAI/Ming-3.0-audio-tiny](https://huggingface.co/inclusionAI/Ming-3.0-audio-tiny/tree/25b96e30be3739849bf76c0f48ac11db4a262fb3)
- [Repositorio audio.cpp](https://github.com/0xShug0/audio.cpp)
- [Guia del modelo Ming 3.0 Audio en audio.cpp](https://github.com/0xShug0/audio.cpp/blob/main/docs/models/ming3_audio.md)
- [Codigo upstream Ming-3.0-audio-flash](https://github.com/inclusionAI/Ming-3.0-audio-flash)
