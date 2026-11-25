# GhaythMahadin/moonshine-streaming-tiny-gguf

## Resumen

Moonshine Streaming Tiny es un modelo de reconocimiento automático del habla (ASR) desarrollado originalmente por Useful Sensors, aquí distribuido en formato GGUF por GhaythMahadin para su uso con transcribe.cpp. Se trata de un modelo encoder-decoder de aproximadamente 44 millones de parámetros (34M según la model card original, diferencia atribuible al recuento de pesos del adaptador y embeddings) diseñado específicamente para transcripción en streaming de baja latencia sobre hardware de clase edge. Su relevancia radica en que combina un frontend de audio ligero de 50 Hz con un encoder Transformer de ventana deslizante, lo que permite transcripción incremental en tiempo real sin necesidad de GPU de gama alta.

El modelo está especializado exclusivamente en inglés: no soporta traducción, detección de idioma ni marcas de tiempo. Esta conversión GGUF preserva la paridad numérica con la referencia de Hugging Face Transformers (99,6 % de hipótesis idénticas a nivel de byte en F32), lo que la hace fiable para despliegues en C++ sin dependencia del stack de Python. El repositorio ocupa 0,3 GB e incluye cuantizaciones F32, F16 y Q8_0.

La licencia MIT y el reducido tamaño lo convierten en una opción atractiva para integración en dispositivos con recursos limitados, aplicaciones de dictado offline y pipelines de transcripción embebidos donde el coste computacional y la latencia son críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder Transformer con encoder ergódico (atención local acotada, sin embeddings posicionales) y frontend de audio de 50 Hz |
| Parametros totales | 44.054.721 (dato real de safetensors); la model card original indica 34M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F32, F16, Q8_0 (Q6_K, Q5_K_M y Q4_K_M no se distribuyen para esta variante) |
| Idiomas soportados | Inglés (en) únicamente |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-decoder. El encoder es de tipo "ergódico": utiliza atención local acotada con ventana deslizante y prescinde de embeddings posicionales, lo que le permite procesar audio de duración variable manteniendo un coste computacional acotado por ventana. Un adaptador inyecta la información posicional antes de un decoder autorregresivo estándar. El frontend de audio opera a 50 Hz sobre señales de 16 kHz mono, lo que reduce la carga del encoder en comparación con frontends de mayor resolución temporal.

El diseño está orientado explícitamente al streaming: la combinación de ventana deslizante y frontend ligero permite emitir transcripciones incrementales con baja latencia en hardware de clase edge. No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La conversión GGUF fue validada contra la referencia de Hugging Face Transformers v5.7.0 en el commit 0d312ce de transcribe.cpp, con paridad numérica prácticamente exacta (99,6 % de hipótesis idénticas a nivel de byte en F32).

## Capacidades

- Transcripción de voz a texto en inglés a partir de audio WAV mono de 16 kHz.
- Procesamiento en streaming con ventana deslizante, adecuado para transcripción incremental de baja latencia.
- Arquitectura encoder-decoder con decoder autorregresivo, compatible con decodificación greedy (`num_beams=1`, `do_sample=False`).
- No soporta traducción (`translate: false` en la configuración de transcribe.cpp).
- No soporta detección de idioma (`lang_detect: false`).
- No genera marcas de tiempo (`timestamps: none`).
- No soporta tool calling, function calling ni razonamiento multi-paso; es un modelo puramente ASR.
- No dispone de capacidades multimodales más allá del audio de entrada (sin visión ni audio generativo).

## Casos de uso

- Dictado offline en aplicaciones de escritorio: el modelo Q8_0 ocupa 48 MB y puede ejecutarse en CPU, lo que permite integrar dictado por voz en editores de texto o herramientas de productividad sin conexión a internet ni dependencias de Python.
- Transcripción en dispositivos embebidos y edge: con 44M de parámetros y cuantización Q8_0, cabe en dispositivos con memoria limitada (Raspberry Pi, dispositivos IoT con capacidad de cómputo moderada) para transcripción local de comandos de voz o notas.
- Subtitulado y transcripción de reuniones en tiempo real: el diseño streaming con ventana deslizante permite emitir texto a medida que llega el audio, adecuado para aplicaciones de actas o subtítulos en vivo en inglés.
- Integración en pipelines de C++ sin Python: al estar en formato GGUF para transcribe.cpp, se puede enlazar directamente en aplicaciones nativas, evitando el overhead de un runtime de Python y facilitando el despliegue en producción.
- Procesamiento por lotes de archivos de audio: la CLI de transcribe.cpp permite transcribir ficheros WAV de forma secuencial con bajo consumo de recursos, útil para archivado de grabaciones o generación de índices de búsqueda.
- Prototipado rápido de sistemas ASR: su reducido tamaño y licencia MIT permiten experimentar con reconocimiento de voz en entornos de investigación o docencia sin necesidad de GPU ni infraestructura costosa.
- Asistencia por voz en aplicaciones de accesibilidad: transcripción local de comandos o dictado para usuarios con movilidad reducida, con la ventaja de que el audio no abandona el dispositivo.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 |
|---|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 4,53 | 4,53 | 4,52 |
| RTF en M4 Max (Metal) | No disponible por cuantización | No disponible por cuantización | 159 (global) |
| RTF en M4 Max (CPU) | No disponible por cuantización | No disponible por cuantización | 211 (global) |
| RTF en Ryzen 4750U (Vulkan) | No disponible por cuantización | No disponible por cuantización | 59,5 (global) |
| RTF en Ryzen 4750U (CPU) | No disponible por cuantización | No disponible por cuantización | 54,5 (global) |

Notas: el WER se midió sobre el split completo de LibriSpeech test-clean (2620 utterances) con decodificación greedy. La referencia de Hugging Face Transformers obtiene 4,52 % en el mismo manifiesto, y el valor autodeclarado por Useful Sensors en Open ASR Leaderboard es 4,49 % (la diferencia de +0,04 pp se atribuye a normalización de texto, no a deriva numérica). Los valores RTF (real-time factor) se expresan en múltiplos de tiempo real; a mayor valor, mayor velocidad respecto a la duración del audio.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la mayoría de despliegues, ya que el modelo está pensado para CPU y aceleradores integrados. En GPU, el peso del modelo es mínimo: 169 MB en F32, 85 MB en F16 y 48 MB en Q8_0, por lo que cualquier GPU con más de 1 GB de memoria libre puede alojarlo.
- GPU recomendadas: no se requieren GPU dedicadas; el modelo está diseñado para hardware edge. En caso de usar GPU, cualquier GPU integrada o dedicada moderna es suficiente. Los datos de rendimiento proporcionados corresponden a Apple M4 Max (Metal y CPU) y AMD Ryzen 4750U (Vulkan y CPU).
- Cabe en GPU consumer: sí, en cualquier GPU consumer, incluidas integradas, dado su reducido tamaño.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli` y librería C++), y la referencia original en Hugging Face Transformers (`MoonshineStreamingForConditionalGeneration`). No se mencionan soportes para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje y no a este formato ASR.
- Latencia y throughput: el RTF en M4 Max es de 159 con Metal y 211 con CPU; en Ryzen 4750U es de 59,5 con Vulkan y 54,5 con CPU. Estos valores indican que el modelo procesa audio muchas veces más rápido que tiempo real en esos equipos, lo que habilita streaming de baja latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER LibriSpeech test-clean | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| moonshine-streaming-tiny (este) | 44M | No disponible | 4,53 % (F32) | MIT | GGUF en HF, transcribe.cpp |
| Whisper tiny | 39M | 30 s de audio | No disponible en la informacion | MIT | Múltiples formatos (HF, whisper.cpp, etc.) |
| Whisper base | 74M | 30 s de audio | No disponible en la informacion | MIT | Múltiples formatos |
| moonshine-streaming-small | No disponible | No disponible | No disponible en la informacion | No disponible | HF Transformers |

La comparación con Whisper se ofrece por categoría (ASR de tamaño reducido), pero no se dispone de datos de WER de Whisper en la información proporcionada, por lo que no se puede establecer una comparación numérica directa. La ventaja diferencial de Moonshine Streaming Tiny frente a Whisper es su diseño explícito para streaming con ventana deslizante y su frontend de 50 Hz, que reduce la latencia en transcripción incremental. La variante small del mismo linaje existe en Hugging Face, pero no se dispone de sus especificaciones en la información disponible.

## Limitaciones y advertencias

- Solo admite inglés: no hay soporte multilingüe ni detección de idioma, por lo que audio en otros idiomas producirá transcripciones incorrectas o alucinaciones.
- No genera marcas de tiempo, lo que limita su uso en aplicaciones que requieran alineación temporal precisa (subtitulado sincronizado, búsqueda por segmentos).
- No soporta traducción: únicamente transcribe en el idioma de entrada.
- Riesgo de alucinación y bucles de generación: la model card original recomienda limitar la longitud máxima de salida (`token_limit_factor = 6.5 / sampling_rate`) para evitar bucles de decodificación.
- Requiere audio de entrada en formato WAV mono a 16 kHz; es necesario remuestrear y convertir canales previamente (por ejemplo, con ffmpeg).
- El WER de 4,53 % corresponde a LibriSpeech test-clean, un corpus de lectura en condiciones controladas; el rendimiento en audio real con ruido, acentos o habla espontánea será previsiblemente peor.
- No se distribuyen cuantizaciones Q6_K, Q5_K_M ni Q4_K_M para esta variante, lo que limita las opciones de reducción de tamaño más allá de Q8_0.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero se hereda del modelo base y conviene verificar los términos upstream.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay evidencia de validación comunitaria amplia más allá de la validación numérica declarada por el autor.
- Diferencia entre el recuento de parámetros de la model card original (34M) y el dato real de safetensors (44M): conviene verificar el recuento exacto según el artefacto utilizado.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/GhaythMahadin/moonshine-streaming-tiny-gguf
- Modelo base original: https://huggingface.co/UsefulSensors/moonshine-streaming-tiny
- Commit upstream f8e9dfd: https://huggingface.co/UsefulSensors/moonshine-streaming-tiny/commit/f8e9dfd
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación transcribe.cpp 0d312ce: https://github.com/handy-computer/transcribe.cpp/tree/0d312ce
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine-streaming-tiny.md
- Paper de Moonshine Streaming: https://download.moonshine.ai/docs/moonshine_streaming_paper.pdf
- Pesos GGUF en handy-computer (referencia de descarga): https://huggingface.co/handy-computer/moonshine-streaming-tiny-gguf
