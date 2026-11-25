# GhaythMahadin/moonshine-streaming-medium-gguf

## Resumen

Moonshine Streaming Medium es un modelo de reconocimiento automático del habla (ASR) de tipo encoder-decoder desarrollado por Useful Sensors, distribuido aquí en formato GGUF por GhaythMahadin para su uso con la librería transcribe.cpp. Con 265,9 millones de parámetros totales (el autor lo describe como un modelo de 245M en su model card), está diseñado específicamente para transcripción en streaming de baja latencia sobre hardware de clase edge, no para despliegues masivos en servidor.

La arquitectura combina un frontend de audio de 50 Hz en el dominio del tiempo con un encoder Transformer de ventana deslizante que emplea atención local acotada y sin embeddings posicionales (encoder "ergódico"); un adaptador inyecta la información posicional antes de un decoder autorregresivo estándar. Es el más profundo y ancho de la familia moonshine-streaming, con 14 capas en encoder y decoder, dimensión oculta de 768 en el encoder y 640 en el decoder.

Su relevancia radica en que ofrece una alternativa ligera y de licencia MIT para transcripción de inglés en tiempo real en dispositivos con recursos limitados, con un WER de 2,16 % en LibriSpeech test-clean que se mantiene idéntico tras cuantización a Q8_0. No soporta traducción, detección de idioma ni marcas de tiempo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder Transformer con encoder ergódico de atención local deslizante (sin embeddings posicionales) y frontend de audio de 50 Hz en dominio del tiempo |
| Parametros totales | 265.898.113 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (ventana deslizante; valor numérico no especificado) |
| Tipos de cuantizacion | F32, F16, Q8_0 (no se distribuyen Q6_K, Q5_K_M ni Q4_K_M para esta variante) |
| Idiomas soportados | Inglés (en) únicamente |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp); pesos originales en safetensors vía Transformers |
| Capas | 14 en encoder / 14 en decoder |
| Dimensión oculta | 768 (encoder) / 640 (decoder) |
| Entrada de audio | WAV mono a 16 kHz |
| Tamaño del repo | 0,3 GB |

## Arquitectura y entrenamiento

El modelo sigue un esquema encoder-decoder seq2seq. El encoder es "ergódico": aplica atención local con ventana deslizante y prescinde de embeddings posicionales, lo que permite procesar flujos de audio continuos sin una longitud máxima rígida y habilita el modo streaming. Un adaptador introduce la información posicional necesaria antes del decoder autorregresivo, que genera la transcripción token a token. El frontend de audio opera a 50 Hz en el dominio del tiempo, lo que reduce el coste computacional frente a enfoques basados en espectrogramas de mayor resolución.

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo base es UsefulSensors/moonshine-streaming-medium (commit 57b8436, fijado el 2026-05-06), y esta conversión GGUF fue validada contra la referencia de HF Transformers v5.7.0 en el commit 0d312ce de transcribe.cpp.

## Capacidades

- Transcripción de voz a texto en inglés a partir de audio WAV mono de 16 kHz.
- Procesamiento en streaming con baja latencia, gracias al encoder de ventana deslizante.
- Decodificación autorregresiva codiciosa (greedy) compatible con la API seq2seq estándar de Transformers.
- Ejecución en CPU (con soporte Vulkan) y en GPU Apple vía Metal a través de transcribe.cpp.
- No soporta traducción (translate: false).
- No soporta detección de idioma (lang_detect: false).
- No genera marcas de tiempo (timestamps: none).
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje general).

## Casos de uso

- Subtitulado en directo de reuniones y videollamadas en inglés: el modo streaming y el frontend de 50 Hz permiten transcribir audio conforme llega, sin esperar al cierre de la frase, sobre equipos de sobremesa o portátiles.
- Asistentes de voz en dispositivos edge: con 282 MB en Q8_0 y licencia MIT, puede integrarse en aplicaciones de escritorio o embebidas que necesiten dictado local sin enviar audio a la nube.
- Transcripción offline de notas de voz y podcasts en inglés: el modelo procesa ficheros WAV completos con un WER de 2,16 % en LibriSpeech test-clean, adecuado para pipelines batch de conversión de audio a texto.
- Accesibilidad para personas con discapacidad auditiva: generación de subtítulos en tiempo real en aplicaciones de escritorio con aceleración Metal (RTF 63 en M4 Max) o Vulkan (RTF 14 en Ryzen 4750U).
- Indexación y búsqueda de archivos de audio: transcribir grabaciones para alimentar motores de búsqueda o sistemas de gestión documental, aprovechando que la cuantización Q8_0 no degrada el WER respecto a F32.
- Prototipado de pipelines ASR en CI/CD: el binario transcribe-cli y el formato GGUF facilitan pruebas reproducibles de transcripción en entornos de integración sin dependencias pesadas de Python.
- Dictado por voz en herramientas de desarrollo: integración local en editores o terminales para introducir texto por voz sin conexión externa.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 |
|---|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 2,16 | 2,16 | 2,16 |

| Metrica de velocidad (RTF) | Plataforma | Valor |
|---|---|---:|
| RTF M4 Max | Metal | 63 |
| RTF M4 Max | CPU | 35,5 |
| RTF Ryzen 4750U | Vulkan | 14 |
| RTF Ryzen 4750U | CPU | 7,5 |

El WER se midió sobre el split completo de LibriSpeech test-clean (2620 enunciados) con decodificación greedy (num_beams=1, do_sample=False). La cifra autoinformada por Useful Sensors en la Open ASR Leaderboard es 2,08 %; la diferencia de +0,08 pp corresponde a diferencias de scoring y normalización de texto, no a deriva numérica. El RTF (factor de tiempo real) indica cuántas veces más rápido que el tiempo real procesa el audio: valores más altos son mejores.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en F32, 0,5 GB en F16 y 0,3 GB en Q8_0; el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Para aceleración, cualquier GPU Apple con Metal o GPU AMD/Intel con Vulkan es suficiente.
- Cabe en GPU consumer: sí, en cualquier modelo con más de 1 GB de memoria, incluidas integradas.
- Opciones de despliegue: transcribe.cpp (transcribe-cli), HF Transformers (MoonshineStreamingForConditionalGeneration) y el framework Moonshine Voice para dispositivos edge.
- Latencia y throughput: RTF de 63 en Metal (M4 Max), 35,5 en CPU (M4 Max), 14 en Vulkan (Ryzen 4750U) y 7,5 en CPU (Ryzen 4750U); en todos los casos muy por encima del tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---:|---:|---|---|
| moonshine-streaming-medium (este) | 265,9 M | en | 2,16 % | MIT | GGUF, safetensors |
| moonshine-streaming-small | No disponible | en | No disponible | MIT | safetensors |
| moonshine-streaming-tiny | No disponible | en | No disponible | MIT | safetensors |
| Whisper (variantes) | No disponible en la información | Multilingüe | No disponible en la información | No disponible en la información | No disponible |

La información proporcionada solo confirma que medium es la variante más profunda (14/14 capas) y ancha (768/640) de la familia moonshine-streaming, por encima de tiny y small. No se dispone de cifras de parámetros ni de WER de esas variantes ni de alternativas como Whisper en el material consultado.

## Limitaciones y advertencias

- Solo transcribe inglés; no traduce ni detecta el idioma de entrada.
- No genera marcas de tiempo, lo que limita su uso en subtitulado sincronizado o alineación fina.
- Requiere audio WAV mono a 16 kHz; es necesario remuestrear y convertir canales previamente con ffmpeg u otra herramienta.
- Riesgo de alucinación inherente a los modelos ASR: puede producir texto plausible en segmentos con ruido, silencio o audio ininteligible.
- No se han publicado análisis de sesgos en la información disponible; al estar entrenado principalmente con corpus en inglés, puede tener peor rendimiento con acentos no estándar o audio con ruido de fondo.
- La licencia MIT permite uso comercial sin restricciones adicionales, pero conviene verificar los términos del modelo base en su model card original.
- Es una conversión de terceros (GhaythMahadin) del modelo de Useful Sensors; la fuente autoritativa es el repositorio upstream.
- No se distribuyen cuantizaciones Q6_K, Q5_K_M ni Q4_K_M para esta variante, lo que limita el ahorro de memoria si se necesita un footprint inferior a 282 MB.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/GhaythMahadin/moonshine-streaming-medium-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-streaming-medium
- Commit del modelo base: https://huggingface.co/UsefulSensors/moonshine-streaming-medium/commit/57b8436
- Paper de Moonshine Streaming: https://download.moonshine.ai/docs/moonshine_streaming_paper.pdf
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine-streaming-medium.md
- Framework Moonshine Voice: https://github.com/moonshine-ai/moonshine
