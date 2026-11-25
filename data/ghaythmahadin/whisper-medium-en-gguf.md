# GhaythMahadin/whisper-medium.en-gguf

## Resumen

whisper-medium.en-gguf es una conversión al formato GGUF del modelo openai/whisper-medium.en, realizada por el usuario GhaythMahadin y publicada en Hugging Face. Se trata de un modelo de reconocimiento automático del habla (ASR) de tipo encoder-decoder transformer, con 763.873.376 parámetros, especializado exclusivamente en inglés. Su propósito es permitir la inferencia local y eficiente de Whisper medium.en mediante la librería transcribe.cpp, una implementación en C++ pensada para ejecución en CPU y GPU consumer.

El modelo base, Whisper medium.en, fue desarrollado por OpenAI y entrenado con 680.000 horas de audio etiquetado mediante supervisión débil. Esta versión GGUF conserva la licencia Apache-2.0 del original y ofrece seis niveles de cuantización (F32, F16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) con tamaños que van desde 2,85 GB hasta 481 MB. La relevancia actual reside en que permite desplegar un sistema ASR de calidad prácticamente sin pérdida de precisión (WER de 2,72 % a 2,91 % en LibriSpeech test-clean) en hardware modesto, incluyendo portátiles con CPU y GPU integrada.

La ficha del autor incluye datos de rendimiento medidos con transcribe.cpp sobre Apple Silicon (Metal) y AMD Ryzen 4750U (Vulkan y CPU), lo que facilita la planificación de despliegues. No obstante, el repositorio tiene cero descargas y cero likes en el momento de la consulta, y el modelo no soporta streaming, traducción ni detección de idioma, limitaciones que condicionan su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence) |
| Parametros totales | 763.873.376 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de 30 segundos con decodificación por chunks para audio largo |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (transcribe.cpp) |
| Modelo base | openai/whisper-medium.en |
| Libreria | transcribe.cpp |
| Tamano del repo | 1,3 GB |
| Fecha de creacion | 2026-11-25 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper original: un transformer encoder-decoder que procesa audio en ventanas de 30 segundos y genera transcripciones token a token. El encoder transforma el espectrograma mel en representaciones latentes y el decoder produce el texto condicionado a esas representaciones. Para audio de mayor duración, transcribe.cpp aplica decodificación por chunks con timestamps a nivel de segmento.

El entrenamiento proviene íntegramente del modelo base de OpenAI: 680.000 horas de audio etiquetado con supervisión débil, incluyendo datos de reconocimiento del habla en inglés. No se dispone de información sobre el proceso de conversión a GGUF más allá de que se realizó desde el commit 2e98eb6 de openai/whisper-medium.en (fijado el 2026-04-25) y se validó contra la referencia de transformers en el commit 5.6.1 de transcribe.cpp (2026-04-26). No se documentan técnicas de RLHF, DPO ni innovaciones adicionales en la conversión.

## Capacidades

- Transcripción de voz a texto en inglés con timestamps a nivel de segmento.
- Procesamiento de audio en ventanas de 30 segundos con decodificación por chunks para grabaciones largas.
- Decodificación greedy con suppress_tokens y temperature fallback, configuración por defecto de transcribe.cpp.
- Ejecución en CPU y GPU mediante backends Metal y Vulkan.
- Cuantización agresiva (hasta Q4_K_M) manteniendo un WER competitivo.
- No soporta streaming.
- No soporta traducción de voz a texto.
- No soporta detección automática de idioma.
- No soporta tool calling, function calling ni razonamiento multi-paso (es un modelo ASR puro).
- No dispone de capacidades de visión, audio generativo ni modo thinking.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo procesa audio en ventanas de 30 segundos con decodificación por chunks, lo que permite transcribir grabaciones de varias horas en inglés con timestamps por segmento, útil para actas y búsquedas posteriores.
- Subtitulado automático de vídeos en inglés: la salida con timestamps de segmento facilita la generación de ficheros SRT o VTT en pipelines de postproducción, ejecutando el modelo en local sin depender de APIs externas.
- Dictado por voz en aplicaciones de escritorio: con la cuantización Q4_K_M (481 MB) el modelo cabe en memoria de un portátil convencional y puede integrarse en herramientas de productividad que conviertan voz en texto en tiempo casi real.
- Transcripción de llamadas de atención al cliente: al ejecutarse en CPU con un factor de tiempo real (RTF) de 1,1 en Ryzen 4750U, permite procesar lotes de grabaciones en servidores sin GPU dedicada para análisis de calidad y cumplimiento.
- Archivado y búsqueda de contenido audiovisual: la transcripción con timestamps permite indexar bibliotecas de audio en inglés y habilitar búsqueda textual sobre el contenido hablado.
- Prototipado e investigación en ASR: al ser una conversión GGUF validada contra transformers, sirve como referencia reproducible para comparar implementaciones y cuantizaciones en experimentos académicos.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en contenidos en inglés, con despliegue local que evita enviar audio sensible a servicios en la nube.

## Benchmarks y rendimiento

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 2,85 GB | 2,74 % |
| F16 | 1,44 GB | 2,73 % |
| Q8_0 | 793 MB | 2,72 % |
| Q6_K | 618 MB | 2,83 % |
| Q5_K_M | 556 MB | 2,74 % |
| Q4_K_M | 481 MB | 2,91 % |

El WER se midió sobre la partición completa LibriSpeech test-clean (2.620 enunciados) con la decodificación por defecto de transcribe.cpp. OpenAI reporta un 3,02 % en la misma partición con su propia configuración de evaluación; la diferencia más probable se atribuye a que `model.generate()` de OpenAI usa `<|notimestamps|>` por defecto, mientras que transcribe.cpp ejecuta con timestamps habilitados. Los números provienen de una única ejecución con backend Metal, cuyas reducciones paralelas no deterministas pueden desplazar el WER unas 0,1 pp entre ejecuciones.

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 45,1 |
| Apple M4 Max | CPU | 3,2 |
| AMD Ryzen 4750U | Vulkan | 4,6 |
| AMD Ryzen 4750U | CPU | 1,1 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF más overhead. Q4_K_M requiere unos 0,5 GB, Q8_0 unos 0,8 GB y F32 unos 2,9 GB.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA) con al menos 1 GB de memoria gráfica para cuantizaciones bajas. Para F32 se recomienda al menos 3 GB.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU integrada o dedicada reciente con 1-3 GB de VRAM disponible, y también en CPU.
- Opciones de despliegue: transcribe.cpp (compilación con CMake, binario `transcribe-cli`). No se documentan otros runners como llama.cpp, Ollama, vLLM o TGI para este formato concreto.
- Latencia y throughput estimados: RTF de 45,1 en Metal (M4 Max), 4,6 en Vulkan (Ryzen 4750U) y 1,1 en CPU (Ryzen 4750U). Un RTF superior a 1 indica procesamiento más rápido que el tiempo real.
- Requiere audio de entrada en WAV mono a 16 kHz; para otros formatos es necesario convertir con ffmpeg.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | WER LibriSpeech test-clean |
|---|---:|---|---|---|---|---:|
| whisper-medium.en-gguf (este) | 763,9 M | 30 s por ventana | Inglés | Apache-2.0 | GGUF | 2,72-2,91 % (según cuantización) |
| openai/whisper-medium.en | 763,9 M | 30 s por ventana | Inglés | Apache-2.0 | Safetensors | 3,02 % (reportado por OpenAI) |
| openai/whisper-medium | 763,9 M | 30 s por ventana | Multilingüe | Apache-2.0 | Safetensors | No disponible en la información proporcionada |
| openai/whisper-small.en | 244 M | 30 s por ventana | Inglés | Apache-2.0 | Safetensors | No disponible en la información proporcionada |

La comparación directa con whisper-medium.en original muestra que la conversión GGUF mantiene e incluso mejora ligeramente el WER reportado, aunque con configuraciones de decodificación distintas. Frente a la variante multilingüe del mismo tamaño, esta versión en inglés es más rápida según la model card, a costa de no soportar otros idiomas.

## Limitaciones y advertencias

- Solo soporta inglés; no transcribe ni traduce otros idiomas.
- No soporta streaming ni detección automática de idioma.
- No soporta traducción de voz a texto.
- Riesgo de alucinación en clips cortos con ruido de fondo, según advierte el propio autor; este efecto puede alterar el WER del corpus en torno a 0,1 pp entre ejecuciones.
- Los resultados de WER provienen de una única ejecución con backend Metal; no se han publicado validaciones con otros backends.
- El repositorio tiene cero descargas y cero likes, y fue creado recientemente; no hay evidencia de uso en producción ni comunidad que lo respalde.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene revisar los términos upstream.
- Requiere audio en WAV mono a 16 kHz; no procesa directamente MP3, FLAC u otros formatos sin conversión previa.
- El modelo está limitado a ventanas de 30 segundos; el audio largo depende de la decodificación por chunks de transcribe.cpp, que puede introducir errores en las fronteras entre chunks.
- No dispone de tool calling ni capacidades de agente; es exclusivamente un modelo ASR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GhaythMahadin/whisper-medium.en-gguf
- Modelo base: https://huggingface.co/openai/whisper-medium.en
- Commit del modelo base: https://huggingface.co/openai/whisper-medium.en/commit/2e98eb6
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación transcribe.cpp 5.6.1: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-medium.en.md
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI Whisper: https://github.com/openai/whisper
