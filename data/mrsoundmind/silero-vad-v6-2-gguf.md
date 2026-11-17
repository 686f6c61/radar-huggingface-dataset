# mrsoundmind/silero-vad-v6.2-gguf

## Resumen

Silero VAD v6.2 en formato GGUF es una conversión del detector de actividad de voz (VAD) de referencia desarrollado por el Silero Team, empaquetada por mrsoundmind para su uso con transcribe.cpp. No se trata de un modelo de transcripción ni de un LLM: es un clasificador de audio binario por tramas que estima la probabilidad de que una ventana de audio contenga habla, lo que permite segmentar llamadas, filtrar silencios y activar pipelines de ASR solo cuando hay voz. Con apenas 309.633 parámetros, su interés no está en la capacidad bruta sino en la eficiencia y la fidelidad de detección en CPU.

La conversión parte del commit upstream 5cd7945 de snakers4/silero-vad (fijado el 2026-10-09) y se validó contra la referencia TorchScript 6.2.3 en CPU y precisión F32 en transcribe.cpp commit 2674b95d el 2026-10-10. El repositorio solo distribuye una cuantización F32 de aproximadamente 1 MB, con metadatos que declaran soporte de streaming, ausencia de timestamps, traducción y detección de idioma. Es relevante ahora porque el ecosistema ggml/whisper.cpp ya carga variantes de Silero, y esta ficha formaliza una ruta reproducible para integrar VAD dentro de transcribe.cpp con la misma fidelidad que el modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal ligera de clasificación de audio por tramas (no disponible el detalle exacto de capas en la información proporcionada) |
| Parámetros totales | 309.633 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio; procesa ventanas por tramas, no texto) |
| Tipos de cuantización | F32 (única variante publicada) |
| Idiomas soportados | no disponible (el VAD es agnóstico al idioma por diseño, pero no se declara lista de idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un detector de voz binario que opera sobre ventanas de audio y devuelve probabilidades de habla por trama, tanto en modo offline como en streaming. La información disponible no detalla la composición exacta de capas, el volumen de datos de entrenamiento ni si se aplicó algún tipo de ajuste fino o post-procesado; únicamente se confirma que la conversión GGUF reproduce el comportamiento del checkpoint TorchScript 6.2.3 en CPU con precisión F32, validado el 2026-10-10. El peso total de 309.633 parámetros sitúa al modelo en la categoría de utilidades de audio ultraligeras, pensadas para ejecutarse en CPU sin GPU.

La innovación relevante aquí no es arquitectónica sino de empaquetado: la conversión a GGUF permite cargar el VAD con transcribe.cpp y, según la model card, también con los binarios `ggml-silero-v5.1.2.bin` y `v6.2.0.bin` de whisper.cpp. Los metadatos declaran `streaming: true`, lo que habilita el consumo incremental de audio mediante `transcribe_vad_stream_feed`, y `rtf_m4` de 1630,87 en CPU, un factor de tiempo real muy por encima de 1 que indica que el modelo procesa audio mucho más rápido que en tiempo real en un Apple M4.

## Capacidades

- Detección de actividad de voz por trama: genera probabilidades de habla para cada frame de audio.
- Segmentación offline: produce segmentos de habla mediante `transcribe_vad_run`.
- Modo streaming: alimenta probabilidades en vivo frame a frame con `transcribe_vad_stream_feed`.
- Ejecución en CPU como backend por defecto, orientada a fidelidad de referencia.
- Integración con transcribe.cpp a través de la API C (`include/transcribe/vad.h`).
- Compatibilidad declarada con los binarios VAD de whisper.cpp (`ggml-silero-v5.1.2.bin`, `v6.2.0.bin`).
- No realiza transcripción, traducción, detección de idioma ni timestamps (declarado explícitamente en los metadatos).
- No dispone de tool calling, function calling ni capacidades de agente.

## Casos de uso

- Segmentación previa a ASR: usar el VAD para recortar silencios y pasar únicamente los segmentos con habla a un modelo de transcripción, reduciendo el coste computacional y el riesgo de alucinaciones del ASR en tramos mudos.
- Filtrado de llamadas y reuniones: procesar grabaciones mono al sample rate del modelo y descartar automáticamente tramos sin voz antes de archivarlas o indexarlas.
- Activación por voz en asistentes: alimentar audio en streaming con `transcribe_vad_stream_feed` para disparar la captura o el reconocimiento solo cuando se detecta habla, evitando consumo innecesario en silencios.
- Telefonía y centros de contacto: detectar turnos de habla y silencios en conversaciones multi-turno para medir tiempos de respuesta o dividir diálogos por participante.
- Pipelines de subtitulado: combinar la segmentación offline con un transcriptor para generar subtítulos alineados a intervalos de habla reales, sin depender de heurísticas de energía.
- Preprocesado en dispositivos de borde: al ocupar ~1 MB en F32 y ejecutarse en CPU, encaja en entornos con recursos limitados donde no hay GPU disponible.
- Evaluación de calidad de audio: usar las probabilidades por trama como señal auxiliar para detectar grabaciones con voz intermitente o ruido de fondo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente declara un `rtf_m4` de 1630,87 en CPU (Apple M4), lo que implica una velocidad de procesamiento muy superior al tiempo real, y confirma la validación frente a la referencia TorchScript 6.2.3 en CPU F32.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para ejecutarse en CPU.
- GPU recomendadas: no disponibles; el backend de referencia es CPU.
- Cabe en GPU consumer: no se documenta soporte GPU; por tamaño (~1 MB en F32) cabría en cualquier GPU, pero la información no confirma backend GPU.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli` y API C `vad.h`), además de los binarios VAD de whisper.cpp compatibles.
- Latencia y throughput: RTF de 1630,87 en CPU Apple M4 según los metadatos; no se proporcionan cifras de latencia por trama ni throughput en otras plataformas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| silero-vad-v6.2-gguf (esta ficha) | 309.633 | no aplica (audio) | GGUF F32 | MIT | Hugging Face, transcribe.cpp |
| Silero VAD 6.2.3 upstream (TorchScript) | no disponible | no aplica (audio) | TorchScript | MIT | GitHub snakers4/silero-vad |
| VAD de whisper.cpp (`ggml-silero-v5.1.2.bin`, `v6.2.0.bin`) | no disponible | no aplica (audio) | binario ggml | MIT (heredada) | Repositorio whisper.cpp |

La comparativa se limita a variantes del mismo modelo base y a los binarios VAD de whisper.cpp mencionados en la model card; no se dispone de datos de benchmarks comparativos entre ellos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de transcripción: no genera texto, no traduce y no produce timestamps.
- No declara lista de idiomas soportados; el comportamiento multilingüe no está verificado en esta ficha.
- Solo se publica una cuantización F32; no hay variantes GGUF de menor precisión en el repositorio.
- El repositorio tiene 0 descargas y 0 likes, y el tamaño reportado es 0.0 GB, lo que sugiere un artefacto muy pequeño pero también ausencia de validación comunitaria.
- La validación se realizó contra una única referencia (TorchScript 6.2.3 en CPU F32) en una fecha concreta; cambios posteriores en transcribe.cpp o en el upstream pueden alterar la equivalencia.
- Riesgo de falsos positivos y negativos inherente a cualquier VAD en entornos con ruido, música o habla superpuesta; no se documentan métricas de precisión o recall.
- Licencia MIT heredada del modelo base, que permite uso comercial con obligación de conservar el aviso de copyright; conviene revisar la model card upstream para los términos completos.
- El modelo está pensado para audio mono al sample rate del modelo; usarlo con otras tasas o canales requiere remuestreo previo.

## Enlaces

- Hugging Face: https://huggingface.co/mrsoundmind/silero-vad-v6.2-gguf
- Pesos F32: https://huggingface.co/mrsoundmind/silero-vad-v6.2-gguf/resolve/main/silero-vad-v6.2-F32.gguf
- Modelo base (GitHub): https://github.com/snakers4/silero-vad
- Commit upstream fijado: https://github.com/snakers4/silero-vad/commit/5cd7945
