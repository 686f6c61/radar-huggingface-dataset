# sakasegawa/Nemotron-3-Diarization-GGUF

## Resumen

Nemotron 3 Diarization GGUF es una conversión al formato GGUF del modelo de diarización de hablantes [Nemotron 3 Diarization](https://huggingface.co/nvidia/Nemotron-3-Diarization) de NVIDIA, realizada por el usuario sakasegawa para su uso exclusivo con [speech.cpp](https://github.com/nyosegawa/speech.cpp) 0.9.0 o superior. El modelo base es un Streaming Sortformer de 99 millones de parámetros (99.259.800 exactos) que resuelve el problema de determinar quién habla y cuándo en una grabación de audio, identificando hasta ocho hablantes simultáneos y numerándolos según el orden en que intervienen por primera vez.

La relevancia de esta conversión radica en que permite ejecutar diarización de hablantes de forma local y sin depender del framework NeMo de NVIDIA, integrándose en un ecosistema de procesamiento de voz en C/C++ junto a modelos de reconocimiento automático del habla (como qwen3-asr) y detectores de actividad de voz (como silero-vad). El modelo es agnóstico respecto al idioma del audio, por lo que funciona igualmente con grabaciones en castellano, inglés o cualquier otra lengua.

Está disponible en tres cuantizaciones (F32, F16 y Q8_0), con tamaños de archivo entre 106 MB y 397 MB, lo que lo hace perfectamente ejecutable en hardware de consumo, incluidos portátiles con Apple Silicon y GPUs domésticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Streaming Sortformer (con frontend mel incorporado) |
| Parametros totales | 99.259.800 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventanas de audio: 30,4 s (offline), 1,04 s (low_latency), 0,64 s (very_low_latency), 0,32 s (ultra_low_latency) |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | Agnostico al idioma (funciona con cualquier lengua) |
| Licencia | OpenMDW License Agreement 1.1 |
| Formato de pesos | GGUF (layout propio de speech.cpp, incompatible con llama.cpp, LM Studio u Ollama) |

## Arquitectura y entrenamiento

El modelo base es un Sortformer en variante streaming, una arquitectura de NVIDIA para diarización de hablantes que asigna etiquetas de hablante a frames de audio y los ordena según su primera intervención, en lugar de usar clustering tradicional de embeddings. Incluye su propio frontend de características mel, de modo que la conversión GGUF contiene el pipeline completo de inferencia. Se distribuye en cuatro configuraciones de operación: `offline` (procesa la grabación completa en ventanas de 30,4 s), `low_latency` (espera bloques de 1,04 s), `very_low_latency` (0,64 s) y `ultra_low_latency` (0,32 s), seleccionables por petición.

La conversión se realizó con el script `reference/sortformer/convert.py` de speech.cpp a partir del checkpoint `Nemotron-3-Diarization.nemo` y las configuraciones de streaming de la model card oficial, verificando cada etapa contra NeMo en el commit `d32dd55`. Dos cabezas que la inferencia no utiliza (`hidden_to_spks` y la cabeza de actividad de entrenamiento) fueron eliminadas. Los datos de entrenamiento del modelo original no están detallados en la información disponible; la model card de NVIDIA es la referencia para ello.

## Capacidades

- Diarización de hablantes: identifica quién habla y en qué intervalos temporales, con salida de FILE, START, END y SPEAKER por segmento.
- Hasta ocho hablantes simultáneos, incluyendo solapamientos de voz.
- Numeración de hablantes en orden de primera intervención, con etiquetas consistentes entre sesiones de streaming.
- Modo offline (grabación completa) y tres modos de streaming con latencias de 1,04 s, 0,64 s y 0,32 s.
- Independencia del idioma del audio.
- Integración en pipelines de ASR: puede combinarse con VAD (silero-vad) y reconocimiento (qwen3-asr) en una sola invocación de `speech asr`.
- Salida en formato RTTM y diarized_json; exposición de hablantes vía servidor en `/v1/realtime`.
- API en C (`speech_diarize()`) para integración en aplicaciones nativas, con soporte de audio por fragmentos.

## Casos de uso

- Transcripción de reuniones con atribución de hablante: combinando `speech asr` con `--diarize nemotron-3-diarization` se obtiene la transcripción de una reunión etiquetada por participante, adecuado gracias a su soporte de solapamientos y hasta ocho voces.
- Subtitulado y closed captions: el modo `low_latency` (1,04 s de espera) permite generar subtítulos con identificación de hablante casi en tiempo real para emisiones o videollamadas.
- Transcripción en vivo con latencia mínima: los modos `very_low_latency` y `ultra_low_latency` (0,64 s y 0,32 s) sirven para aplicaciones interactivas donde la identificación del hablante debe llegar casi instantáneamente.
- Procesamiento por lotes de archivos de audio: el modo `offline` procesa grabaciones completas con RTFx de cientos (455 en Apple M5 con GPU), ideal para archivar horas de contenido.
- Servidor de diarización como servicio: `speech serve` expone los hablantes en formato diarized_json y por WebSocket en `/v1/realtime`, útil para integrar diarización en aplicaciones cliente-servidor.
- Integración embebida en C/C++: la API C permite incorporar diarización en aplicaciones de escritorio o móviles sin dependencias de Python ni de NeMo.
- Análisis forense o de call centers: la salida RTTM estándar facilita su uso con herramientas de análisis de conversaciones y métricas como pyannote.metrics.

## Benchmarks y rendimiento

Tasa de error de diarización (DER) en el test de AMI (16 reuniones, 9,1 h, mezcla de auricular, collar de 0 s, con solapamientos incluidos), medida con pyannote.metrics 3.2.1:

| Implementacion | `offline` | `low_latency` |
|---|---|---|
| Model card de NVIDIA | 9,25 % | 9,48 % |
| NeMo d32dd55 (CPU) | 9,21 % | no ejecutado |
| speech.cpp F32 | 9,22 % | 9,46 % |
| speech.cpp F16 | 9,22 % | 9,48 % |
| speech.cpp Q8_0 | 9,23 % | 9,52 % |

Fidelidad numérica frente a NeMo (probabilidades, diferencia máxima): 3,2e-5 en CPU de Apple M5 (F32), 0,12 en GPU Metal, 1,2e-5 en RTX 2080 (Vulkan).

RTFx (segundos de audio por segundo de proceso, grabación de 98 s, una petición cada vez):

| Dispositivo | Cuantizacion | `offline` | `low_latency` |
|---|---|---|---|
| Apple M5, Metal | Q8_0 | 455 | 24 |
| Apple M5, CPU | Q8_0 | 51 | 2,4 |
| RTX 2080, Vulkan | F16 | 425 | 35 |

## Requisitos de hardware

- VRAM/memoria: 106 MB en Q8_0, 199 MB en F16 y 397 MB en F32; cabe con holgura en cualquier GPU moderna o incluso solo en CPU.
- GPUs probadas: Apple M5 (Metal) y NVIDIA GeForce RTX 2080 (Vulkan); por sus requisitos mínimos, cualquier GPU de consumo (RTX 3060, RTX 4090, Apple Silicon) es más que suficiente.
- Ejecución en CPU viable: RTFx de 51 en offline y 2,4 en streaming en un Apple M5; en modo streaming por CPU deja poca capacidad disponible para un reconocedor de voz simultáneo.
- Despliegue: exclusivamente mediante speech.cpp 0.9.0 o superior (CLI `speech diarize`, `speech asr`, `speech serve`, o API C). No funciona con llama.cpp, LM Studio, Ollama ni otros lectores de GGUF, ya que el layout del archivo es propio de speech.cpp.
- Descarga automática: el nombre `nemotron-3-diarization` descarga la versión Q8_0 la primera vez; `:f16` y `:f32` para las demás.
- Latencia: en streaming, el modo `low_latency` espera bloques de 1,04 s; cada fragmento reprocesa la caché de hablantes y la cola, costando unas veinte veces más que `offline`.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| sakasegawa/Nemotron-3-Diarization-GGUF | Diarización streaming | 99 M | GGUF (speech.cpp) | OpenMDW 1.1 | Hasta 8 hablantes, 4 modos de latencia, agnóstico al idioma |
| nvidia/Nemotron-3-Diarization (original) | Diarización streaming | 99 M | NeMo (.nemo) | OpenMDW 1.1 | Requiere framework NeMo/Python |
| pyannote/speaker-diarization-3.1 | Diarización (pipeline clustering) | no disponible | PyTorch | MIT (modelo) | Basado en clustering de embeddings, no streaming nativo |

No hay datos de benchmark comparativo directo publicados en la información disponible entre estos modelos más allá de la DER de AMI del propio modelo base.

## Limitaciones y advertencias

- Compatibilidad de formato: los archivos GGUF usan un layout propio de speech.cpp y son incompatibles con llama.cpp, LM Studio, Ollama y cualquier otro lector de GGUF estándar.
- Requiere speech.cpp 0.9.0 o superior; versiones anteriores no funcionarán.
- El modo streaming es unas veinte veces más costoso que el offline porque reprocesa la caché de hablantes en cada fragmento; en CPU apenas deja margen para un ASR simultáneo.
- En GPU Metal la diferencia de probabilidades frente a NeMo puede llegar a 0,12 (la caché de hablantes conserva un frame adicional), una desviación mayor que en CPU o Vulkan.
- La cuantización Q8_0 degrada ligeramente la DER en low_latency (9,52 % frente a 9,46 % en F32).
- Máximo de ocho hablantes simultáneos; grabaciones con más voces activas a la vez no se cubren.
- La licencia OpenMDW 1.1 permite uso comercial, pero conviene revisar las consideraciones éticas y subcards de sesgo, explicabilidad, seguridad y privacidad de la model card de NVIDIA.
- Datos de entrenamiento, sesgos específicos del modelo base y métricas adicionales (por idioma, por ejemplo) no disponibles en la información proporcionada.

## Enlaces

- Modelo GGUF: https://huggingface.co/sakasegawa/Nemotron-3-Diarization-GGUF
- Modelo base de NVIDIA: https://huggingface.co/nvidia/Nemotron-3-Diarization
- speech.cpp: https://github.com/nyosegawa/speech.cpp
- Página del modelo en la documentación de speech.cpp: https://github.com/nyosegawa/speech.cpp/blob/main/docs/models/sortformer.md
- Documentación de la CLI: https://github.com/nyosegawa/speech.cpp/blob/main/docs/cli.md
- Documentación del servidor: https://github.com/nyosegawa/speech.cpp/blob/main/docs/server.md
- Script de conversión: https://github.com/nyosegawa/speech.cpp/tree/main/reference/sortformer
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Consideraciones éticas del modelo base: https://huggingface.co/nvidia/Nemotron-3-Diarization#ethical-considerations
