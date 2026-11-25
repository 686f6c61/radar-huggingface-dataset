# GhaythMahadin/moonshine-streaming-small-gguf

## Resumen

Moonshine Streaming Small es un modelo de reconocimiento automático del habla (ASR) desarrollado por Useful Sensors, diseñado específicamente para transcripción en streaming de baja latencia sobre hardware de clase edge. La ficha que nos ocupa es una conversión a formato GGUF realizada por GhaythMahadin para su uso con transcribe.cpp, una implementación en C++ derivada del ecosistema llama.cpp orientada a inferencia local de modelos de voz.

El modelo emplea una arquitectura encoder-decoder con un frontend de audio de 50 Hz y un encoder Transformer con atención local de ventana deslizante y sin embeddings posicionales (encoder "ergódico"). Cuenta con aproximadamente 140 millones de parámetros totales (123 millones según la model card upstream, diferencia atribuible a la inclusión de capas del adaptador y cabezas), con 10 capas en encoder y 10 en decoder, dimensiones ocultas de 620 y 512 respectivamente. Está entrenado exclusivamente para inglés y produce transcripciones sin marcas de tiempo ni traducción.

Su relevancia radica en que ofrece una alternativa muy ligera (189 MB en cuantización Q8_0) con un WER de 2,54 % en LibriSpeech test-clean, lo que lo sitúa en un régimen de precisión competitivo para su tamaño y permite despliegue en CPU, GPU integrada y dispositivos móviles con velocidades superiores a la tiempo real (RTF de 12 a 96 según plataforma).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder Transformer con encoder ergódico (atención local de ventana deslizante, sin embeddings posicionales) y adaptador posicional antes del decoder autorregresivo |
| Parametros totales | 140.135.225 (123 M según model card upstream) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana deslizante en encoder) |
| Tipos de cuantizacion | F32, F16, Q8_0 (Q6_K, Q5_K_M y Q4_K_M no se distribuyen para esta variante) |
| Idiomas soportados | Inglés (en) únicamente |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo sigue un esquema encoder-decoder clásico adaptado a streaming. El frontend de audio opera a 50 Hz y alimenta un encoder Transformer de 10 capas con atención local de ventana deslizante y sin embeddings posicionales explícitos (diseño "ergódico"), lo que permite procesar audio de duración arbitraria por bloques sin degradación posicional. Un adaptador intermedio inyecta información posicional antes de un decoder autorregresivo estándar de 10 capas y dimensión oculta 512. Las dimensiones del encoder son 620, ligeramente superiores a las del decoder.

El modelo se entrenó para transcripción offline en inglés, y la variante "streaming" está optimizada para uso incremental con latencia baja. La model card upstream no detalla el volumen de tokens de audio, la composición del dataset ni si se aplicaron técnicas de RLHF o ajuste fino supervisado adicional. La conversión GGUF fue validada contra la referencia de Hugging Face Transformers v5.7.0 en el commit 0d312ce de transcribe.cpp, con hipótesis 99,6 % idénticas en la variante tiny según la verificación cruzada documentada.

## Capacidades

- Transcripción de voz a texto en inglés a partir de audio WAV mono a 16 kHz.
- Procesamiento en streaming con ventana deslizante, adecuado para captura continua de micrófono.
- Inferencia de baja latencia en CPU, GPU integrada y aceleradores Metal/Vulkan.
- Sin traducción: no convierte inglés a otros idiomas ni viceversa.
- Sin detección de idioma: asume entrada en inglés.
- Sin marcas de tiempo por palabra o segmento.
- No soporta tool calling, function calling ni razonamiento multi-paso (es un modelo puramente ASR).
- No dispone de capacidades multimodales más allá del audio de entrada.

## Casos de uso

- Subtitulado en directo de reuniones y videoconferencias: el modelo procesa audio en streaming con ventanas deslizantes, permitiendo generar subtítulos en inglés con latencia baja en portátiles sin GPU dedicada, gracias a su RTF de 12 en CPU Ryzen 4750U.
- Transcripción de notas de voz en aplicaciones móviles: con 189 MB en Q8_0 y soporte Metal en Apple Silicon (RTF 96 en M4 Max), puede ejecutarse íntegramente en el dispositivo sin conexión a red.
- Asistentes de voz embebidos en dispositivos IoT: su tamaño reducido y su encoder ergódico permiten integrarlo en hardware con recursos limitados para comandos y dictado continuo en inglés.
- Indexación y búsqueda de archivos de audio: transcripción por lotes de grabaciones WAV de 16 kHz para generar texto buscable en sistemas de gestión documental.
- Accesibilidad para personas con discapacidad auditiva: generación de transcripciones en tiempo real en aplicaciones de escritorio con backend transcribe.cpp y aceleración Vulkan en GPUs integradas.
- Pipelines de análisis de llamadas de atención al cliente: conversión de grabaciones a texto para su posterior procesamiento con modelos de lenguaje, aprovechando el bajo coste computacional del ASR en CPU.
- Prototipado e investigación en ASR edge: referencia ligera para comparar técnicas de cuantización y despliegue en C++ frente a implementaciones Python.

## Benchmarks y rendimiento

| Benchmark | F32 | F16 | Q8_0 | Referencia upstream |
|---|---:|---:|---:|---:|
| WER LibriSpeech test-clean (greedy, 2620 utterances) | 2,53 % | 2,53 % | 2,54 % | 2,49 % (Open ASR Leaderboard) |

| Plataforma | Acelerador | RTF (real-time factor) |
|---|---|---:|
| Apple M4 Max | Metal | 96 |
| Apple M4 Max | CPU | 57 |
| AMD Ryzen 4750U | Vulkan | 23,5 |
| AMD Ryzen 4750U | CPU | 12 |

El residuo de +0,04 pp frente al dato upstream se atribuye a diferencias de normalización de texto y scoring, no a deriva numérica del port, según la validación cruzada documentada.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones (536 MB F32, 269 MB F16, 189 MB Q8_0); en la práctica cabe en memoria unificada o RAM del sistema.
- GPU recomendadas: no requiere GPU dedicada; funciona en Apple Silicon con Metal, GPUs AMD/Intel con Vulkan y CPU x86-64.
- Cabe en cualquier GPU de consumo, incluida GTX 1050 o iGPU Intel/AMD, y en dispositivos móviles de gama media.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`); el modelo base es compatible con Hugging Face Transformers v5.7.0 mediante `MoonshineStreamingForConditionalGeneration`. No se distribuyen pesos para llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: RTF de 96 (Metal M4 Max), 57 (CPU M4 Max), 23,5 (Vulkan Ryzen 4750U) y 12 (CPU Ryzen 4750U); valores superiores a 1 indican procesamiento más rápido que tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---:|---:|---|---|
| Moonshine Streaming Small (esta ficha) | ~140 M | en | 2,54 % (Q8_0) | MIT | GGUF |
| Moonshine Streaming Tiny | no disponible | en | 4,52 % (según validación cruzada citada) | MIT | GGUF |
| Whisper Small | ~244 M | multilingüe | no disponible en la información proporcionada | MIT | safetensors, GGUF (vía terceros) |
| Whisper Base | ~74 M | multilingüe | no disponible en la información proporcionada | MIT | safetensors, GGUF (vía terceros) |

La comparación con Whisper se ofrece como referencia de categoría (ASR ligero); no se dispone de cifras de WER verificadas en la información proporcionada para esos modelos.

## Limitaciones y advertencias

- Solo inglés: no transcribe ni traduce otros idiomas; la detección de idioma no está soportada.
- Sin marcas de tiempo: no genera timestamps por palabra o segmento, lo que limita su uso en subtitulado con sincronización fina.
- Riesgo de bucles de alucinación: la model card upstream recomienda limitar la longitud máxima de salida (`token_limit_factor`) para evitarlos.
- Entrada restringida: requiere WAV mono a 16 kHz; es necesario remuestrear con ffmpeg u otra herramienta antes de la inferencia.
- Sesgos: no se documentan análisis de sesgo demográfico, acento o ruido de fondo en la información disponible; el rendimiento puede degradarse fuera de condiciones de laboratorio.
- Cuantizaciones limitadas: no se distribuyen Q6_K, Q5_K_M ni Q4_K_M para esta variante, lo que restringe aún más la reducción de tamaño.
- Licencia MIT permisiva, sin restricciones conocidas para uso comercial, heredada del modelo base.
- Ecosistema reducido: depende de transcribe.cpp para el formato GGUF; no hay soporte directo en llama.cpp, Ollama o vLLM.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación comunitaria muy limitado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/GhaythMahadin/moonshine-streaming-small-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-streaming-small
- Commit upstream fijado: https://huggingface.co/UsefulSensors/moonshine-streaming-small/commit/2c03650
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/0d312ce
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine-streaming-small.md
- Paper de Moonshine Streaming: https://download.moonshine.ai/docs/moonshine_streaming_paper.pdf
- Pesos GGUF alternativos (handy-computer): https://huggingface.co/handy-computer/moonshine-streaming-small-gguf
