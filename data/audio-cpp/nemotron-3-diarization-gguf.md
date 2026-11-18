# audio-cpp/Nemotron-3-Diarization-GGUF

## Resumen

Nemotron-3-Diarization-GGUF es la conversión a formato GGUF del modelo NVIDIA Nemotron-3-Diarization, un sistema de diarización de hablantes (identificación de "quién habla y cuándo") basado en una arquitectura Streaming Sortformer. El modelo original lo desarrolla NVIDIA, mientras que esta conversión la mantiene el proyecto audio-cpp para permitir inferencia nativa en C++ mediante el motor audio.cpp, con soporte para los backends CUDA, Vulkan y Metal.

El modelo resuelve el problema de segmentar audio en turnos de habla atribuidos a hablantes concretos (hasta ocho simultáneos), devolviendo turnos y marcas temporales, no transcripción de palabras. Admite tres modos de operación: offline, streaming y procesamiento por lotes en servidor, e incluye detección de actividad de voz (VAD) como parte del pipeline. Su tamaño es notablemente reducido: 99.263.443 parámetros totales, lo que lo hace viable en hardware muy modesto.

La relevancia actual radica en que ofrece una alternativa de inferencia en C++ con un consumo de VRAM muy inferior al de la implementación oficial en Python con PyTorch (del orden de 1 GB frente a casi 2,8 GB en pruebas por lotes), manteniendo paridad funcional con NeMo. El paquete incluye los pesos, la configuración del frontend y la especificación del modelo embebidos en un único fichero, sin dependencias de ficheros auxiliares.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Streaming Sortformer (diarización de hablantes); familia Nemotron 3 |
| Parametros totales | 99.263.443 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa audio por chunks; parámetros de streaming: chunk_len=340, chunk_right_context=40, fifo_len=40) |
| Tipos de cuantizacion | BF16 y Q8_0 (mixta: 130 tensores cuantizados, 229 en BF16, 2 en F16, filtro mel en F32) |
| Idiomas soportados | No disponible (modelo de audio independiente del idioma para diarización) |
| Licencia | openmdw-1.1 |
| Formato de pesos | GGUF (362 tensores por fichero, con frontend y spec embebidos) |

Ficheros publicados:

| Fichero | Precisión | Tamano |
|---|---|---:|
| `nemotron-3-diarization-bf16.gguf` | BF16 | 189,51 MiB |
| `nemotron-3-diarization-q8_0.gguf` | Q8_0 / mixta | 101,73 MiB |

## Arquitectura y entrenamiento

El modelo se basa en Streaming Sortformer, una arquitectura orientada a diarización en flujo continuo que procesa el audio en fragmentos (chunks) con contexto a la derecha y una cola FIFO, y que mantiene una caché de hablantes (spkcache) actualizada periódicamente. Los parámetros de streaming documentados son `chunk_len=340`, `chunk_right_context=40`, `fifo_len=40`, `spkcache_update_period=300` y `spkcache_len=264`, correspondientes al perfil de latencia `very_high` por defecto en audio.cpp.

La conversión se realizó directamente desde el checkpoint original `.nemo` (revisión fijada `723e19c601d99b7e58fba6a14e32153e0afe48d9` de nvidia/Nemotron-3-Diarization), no desde un GGUF previo. El fichero BF16 conserva la precisión original de los pesos, con el filtro mel del frontend en F32, y se declara con paridad segura respecto a NeMo bajo control de TF32. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la documentación proporcionada. La actualización del 26 de septiembre de 2026 añadió paridad con NeMo para lotes irregulares y colas de streaming, selección de atención flash o eager, salida autodescriptiva de probabilidad de hablante, perfiles de latencia compatibles con ASR e integración con el pipeline de transcripción etiquetada por hablante de Nemotron.

## Capacidades

- Diarización de hablantes con identificación de hasta ocho hablantes simultáneos.
- Salida de turnos de habla con marcas temporales (no transcribe palabras).
- Modo offline para ficheros completos.
- Modo streaming con perfiles de latencia configurables (por ejemplo, `low`).
- Procesamiento por lotes en servidor con ficheros de duración distinta en una misma petición.
- Detección de actividad de voz integrada en el pipeline.
- Salida autodescriptiva de probabilidad de hablante.
- Selección de backend de atención (flash o eager).
- Integración con pipelines de transcripción etiquetada por hablante (speaker-tagged transcription).
- No dispone de generación de texto, razonamiento, código, matemáticas ni visión: es un modelo exclusivamente de audio.

## Casos de uso

- Actas de reuniones: procesar la grabación completa en modo offline para obtener turnos de habla con marcas temporales, que después se combinan con un sistema ASR para producir transcripciones atribuidas a cada participante.
- Atención al cliente: analizar grabaciones de llamadas para medir tiempos de habla de agente y cliente, detectar solapamientos e identificar patrones de intervención, con la ventaja de un consumo de VRAM inferior a 1 GB en cuantización Q8_0.
- Subtitulado y locución en directo: usar el modo streaming con perfil de latencia bajo para etiquetar hablantes en tiempo real en retransmisiones o videoconferencias.
- Procesamiento por lotes en servidor: ingerir varios ficheros de duración desigual en una única petición al endpoint `/v1/batches/transcriptions` y recibir eventos SSE con `speaker_turns` indexados por fichero, adecuado para pipelines de archivo masivo de audio.
- Investigación en lingüística de corpus: segmentar corpus de entrevistas o debates por hablante antes de un análisis acústico o de transcripción, aprovechando que el modelo no depende de un idioma concreto para la tarea de diarización.
- Despliegue en hardware de gama media: ejecutar la diarización en GPUs de consumo o en equipos con backend Vulkan o Metal, gracias a los aproximadamente 190 MiB del fichero BF16 y a los 1.076 MiB de VRAM pico medidos en lotes.
- Moderación y análisis de contenido audiovisual: detectar cuántos interlocutores hay en un clip y sus intervenciones como paso previo a la revisión manual o automática.

## Benchmarks y rendimiento

Rendimiento medido en una RTX 5090 con CUDA y ocho hilos de CPU, comparando audio.cpp (servidor en modo debug, BF16 y Q8_0) con la implementación oficial en Python (PyTorch 2.11.0+cu128, `eval()` y `torch.inference_mode()`), con parámetros de streaming idénticos:

| Carga de trabajo | Runtime | Tiempo total de inferencia | RTF agregado | VRAM pico muestreada |
|---|---|---:|---:|---:|
| 24 lotes mixtos | audio.cpp servidor, BF16 | 11,984 s | 0,000960 | 1.076 MiB |
| 24 lotes mixtos | audio.cpp servidor, Q8_0 | 10,836 s | 0,000868 | 948 MiB |
| 24 lotes mixtos | Python oficial | 9,718 s | 0,000779 | 2.786 MiB |
| 10 peticiones individuales | audio.cpp servidor, BF16 | 1,417 s | 0,000926 | 820 MiB |
| 10 peticiones individuales | audio.cpp servidor, Q8_0 | 1,684 s | 0,001100 | 740 MiB |
| 10 peticiones individuales | Python oficial | 1,795 s | 0,001173 | 1.504 MiB |

Los lotes mixtos contuvieron 12.482 segundos de audio en 24 peticiones (grabaciones de 37 a 311 segundos); las diez peticiones individuales sumaron 1.531 segundos. El RTF se define como tiempo total de inferencia dividido por la duración total del audio (menor es mejor) e incluye frontend y postprocesado, pero excluye carga del modelo, E/S de ficheros y transporte HTTP. Python fue más rápido en los lotes mixtos; audio.cpp fue más rápido en peticiones individuales con ambas cuantizaciones. Q8_0 redujo el tiempo cerca de un 10 % en lotes pero lo aumentó un 19 % en peticiones individuales, con menor VRAM pico en ambos casos. Cada fila corresponde a una única secuencia de trabajo, no a una mediana de ejecuciones repetidas.

No se han publicado resultados de benchmarks de calidad de diarización (por ejemplo, DER) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 1.076 MiB pico en BF16 con lotes mixtos y 820 MiB en peticiones individuales; 948 MiB pico en Q8_0 con lotes y 740 MiB en individuales (medido en RTX 5090).
- GPU recomendadas: cualquier GPU con soporte CUDA, Vulkan o Metal; las pruebas de referencia se realizaron en una RTX 5090. No se han publicado mediciones en A100, H100 o RTX 4090.
- Cabe holgadamente en GPU de consumo: el fichero BF16 ocupa 189,51 MiB y el Q8_0 101,73 MiB, con un pico de VRAM inferior a 1,1 GB en las pruebas documentadas.
- Opciones de despliegue: CLI `audiocpp_cli` (tareas `diar`, familia `nemotron_3_diar`) y servidor `audiocpp_server` con configuración JSON y endpoint `/v1/batches/transcriptions` con respuesta SSE.
- Backends probados: CUDA, Vulkan y Metal (Mac).
- Latencia y throughput: RTF agregado entre 0,000868 y 0,001173 según runtime y carga, lo que implica procesar audio cientos de veces más rápido que tiempo real en el hardware de prueba.
- Requiere audio de entrada en WAV a 16 kHz.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / modo | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nemotron-3-Diarization-GGUF (este) | 99,26 M | Streaming por chunks; offline y lotes | openmdw-1.1 | GGUF (BF16, Q8_0) | Inferencia en C++ con audio.cpp; VRAM pico 740-1.076 MiB |
| nvidia/Nemotron-3-Diarization (original) | 99,26 M | Mismos parámetros de streaming | openmdw-1.1 | Checkpoint NeMo (.nemo) | Implementación Python/PyTorch; VRAM pico 1.504-2.786 MiB en las mismas pruebas |
| Otros modelos de diarización | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

La comparación directa disponible se limita al modelo original de NVIDIA, del que esta conversión es funcionalmente equivalente en precisión BF16 y con paridad declarada respecto a NeMo bajo control de TF32.

## Limitaciones y advertencias

- El modelo devuelve turnos de habla y marcas temporales, no palabras transcritas; requiere un sistema ASR independiente para obtener texto.
- Límite de ocho hablantes simultáneos; no se documenta el comportamiento con más interlocutores.
- La cuantización Q8_0 es mixta (130 tensores cuantizados de 362) y el autor advierte explícitamente de que deben consultarse sus caveats antes de elegirla; puede degradar la precisión frente a BF16.
- El rendimiento depende del hardware, la duración de las entradas y la composición de los lotes; las cifras publicadas provienen de una sola secuencia de trabajo por fila, no de medianas.
- No se han publicado métricas de calidad de diarización (DER u otras) en la información disponible.
- No se documentan sesgos conocidos ni comportamiento por idioma; la diarización es una tarea acústica, pero la cobertura lingüística no está declarada.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de asignación errónea de hablantes en audio con solapamientos, ruido o voces similares; no se aportan datos al respecto.
- Licencia openmdw-1.1: deben revisarse sus términos antes de un uso comercial; la información proporcionada no detalla las restricciones concretas.
- Esta conversión no es un lanzamiento original de NVIDIA y está fijada a una revisión concreta del modelo base; cambios posteriores en el upstream no se reflejan automáticamente.
- Requiere una build actual de audio.cpp con soporte `nemotron_3_diar`; versiones antiguas no cargarán estos pesos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/audio-cpp/Nemotron-3-Diarization-GGUF
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Revisión fijada del modelo base: https://huggingface.co/nvidia/Nemotron-3-Diarization/tree/723e19c601d99b7e58fba6a14e32153e0afe48d9
- Motor audio.cpp: https://github.com/0xShug0/audio.cpp
- Documentación del modelo en audio.cpp: https://github.com/0xShug0/audio.cpp/blob/main/docs/models/nemotron_3_diar.md
