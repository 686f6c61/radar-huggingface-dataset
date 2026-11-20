# Infinix-io/voice-isolator

## Resumen

Inworld Voice Isolator v1 es un modelo de aislamiento de voz (voice isolation) de código abierto publicado bajo licencia Apache-2.0 por Inworld AI. Su función es separar la voz del hablante del ruido de fondo en grabaciones de audio y en flujos de audio en vivo, preservando la identidad del hablante. Se distribuye como dos checkpoints que comparten arquitectura: `voice-isolator-v1` (64M parámetros, orientado a audio grabado y máxima calidad) y `voice-isolator-v1-realtime` (58M parámetros, causal con 20 ms de look-ahead, orientado a streaming).

El modelo trabaja a 48 kHz full-band, lo que cubre todo el espectro audible y evita las limitaciones de los pipelines clásicos de 16 kHz usados en denoising de voz. La salida es audio float32 a 48 kHz con los niveles originales preservados, y el residuo (la diferencia entre la entrada y la voz aislada) reconstruye la señal de entrada, lo que permite extraer también el fondo o un residual de instrumental en tareas de separación de voces y música.

Es relevante ahora porque cubre un hueco poco atendido en la IA de audio open source: el aislamiento de voz de alta fidelidad con licencia permisiva, opción de streaming en tiempo real y despliegue en CPU, CUDA y Metal. No es un selector de hablante ni un modelo de restauración; la restauración está planificada para la versión 2.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de aislamiento de voz audio-to-audio; dos checkpoints con arquitectura compartida) |
| Parametros totales | 64M (voice-isolator-v1); 58M (voice-isolator-v1-realtime) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de 8 s por chunk en modo offline; streaming causal con 20 ms de look-ahead |
| Tipos de cuantizacion | no disponible (pesos float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (procesamiento de voz independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (descarga gestionada por el paquete `inworld-voice-isolation` con verificación de checksums) |

## Arquitectura y entrenamiento

No se detalla en la información disponible la arquitectura interna (tipo de red, capas, mecanismo de atención) ni la composición del dataset de entrenamiento, el número de tokens o las etapas de ajuste (RLHF/DPO no aplican a este tipo de modelo). Lo que sí se documenta es la separación en dos variantes con la misma arquitectura: una offline, donde cada frame ve su chunk completo de 8 segundos, y una causal en streaming con 20 ms de look-ahead (dos frames de 10 ms), pensada para integrarse en pipelines de llamadas y emisiones en vivo.

La innovación técnica destacable es el procesamiento full-band a 48 kHz con preservación exacta de niveles y la propiedad de reconstrucción: la voz aislada y el fondo eliminado suman la entrada mono alineada. Esa propiedad permite usar el modelo tanto para limpiar como para extraer el residuo de fondo o de instrumental. El paquete incluye verificación de checksums en la descarga de pesos y selección automática de dispositivo (CUDA, Metal en Apple Silicon con PyTorch 2.6 o superior, o CPU).

## Capacidades

- Aislamiento de voz en grabaciones con ruido de fondo, preservando la identidad del hablante.
- Procesamiento full-band a 48 kHz con salida float32 y niveles originales conservados.
- Extracción del fondo: la resta de la voz aislada respecto a la entrada produce el ruido o residual eliminado.
- Streaming en tiempo real con el checkpoint `voice-isolator-v1-realtime`: entrada mono a 48 kHz en fragmentos de cualquier tamaño, con 20 ms de look-ahead y salida de muestras finales listas para reproducir o enviar.
- Procesamiento por lotes offline con el checkpoint `voice-isolator-v1` para máxima calidad.
- Selección de frecuencia de salida (`--output-sr 0` mantiene la tasa de entrada) y control del fichero de fondo (`--background`, `--no-background`).
- Ejecución en CPU, CUDA (Ampere, Hopper, Blackwell) y Metal (Apple Silicon).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente audio-to-audio.
- No es un selector de hablante ni un modelo de restauración de audio.

## Casos de uso

- Limpieza de grabaciones antes de publicación: podcasts, entrevistas y locuciones grabadas en entornos ruidosos se procesan en modo offline con `voice-isolator-v1`, que ve chunks completos de 8 s y ofrece la máxima calidad.
- Llamadas y emisiones en vivo: con `voice-isolator-v1-realtime` y 20 ms de look-ahead, el audio del micrófono se procesa en fragmentos de 20 ms (960 muestras a 48 kHz) y se envía ya limpio, apto para VoIP, webinars y streaming.
- Curaduría de datasets de voz: limpiar corpus de habla antes de usarlos en entrenamiento de ASR o TTS, conservando la identidad del hablante y los niveles originales, con salida float32 a 48 kHz.
- Extracción de ruido o ambiente: restar la voz aislada de la entrada para obtener el fondo (ruido de sala, tráfico, murmullo) y usarlo en aumentación de datos o análisis acústico.
- Separación de voces e instrumental: aplicar el modelo a una mezcla musical para aislar la voz y quedarse con el residual como aproximación del acompañamiento.
- Preprocesado en pipelines de producción de audio: integrar el paquete en flujos automatizados de limpieza por lotes, con verificación de checksums en la descarga de pesos y ejecución en CPU cuando no hay GPU.
- Demostración interactiva: el demo del repositorio carga ambos modelos y permite procesar ficheros (modo Offline) o transmitir el micrófono hasta 60 segundos (modo Online) con formas de onda y espectrogramas actualizados.

## Benchmarks y rendimiento

La model card menciona el benchmark VIBE (tier full-band) con una puntuación de denoising por sistema, pero el contenido proporcionado se corta antes de mostrar los valores numéricos. No se han publicado en la información disponible los resultados concretos de benchmarks ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 64M y 58M de parámetros y pesos float32, el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer moderna.
- GPU probadas: NVIDIA Ampere, Hopper y Blackwell (A100, H100, B200, B300). GPUs más pequeñas no han sido probadas según la model card.
- CPU: soportada y probada; opción válida para despliegues sin GPU.
- Apple Silicon: soporte del backend Metal (`mps`) con PyTorch 2.6 o superior.
- Despliegue: paquete Python `inworld-voice-isolation` (instalación vía pip o clonando el repositorio), CLI `voice-isolate` y API `voice_isolation.VoiceIsolator`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a un modelo de audio).
- Latencia y throughput: el modo streaming introduce 20 ms de look-ahead (dos frames de 10 ms) y procesa fragmentos de 20 ms; no se publican cifras de throughput ni de latencia extremo a extremo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de aislamiento de voz o denoising, ni datos de benchmarks que permitan establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- No es un selector de hablante: no separa varias voces entre sí, solo la voz del ruido de fondo.
- No es un modelo de restauración de audio; la restauración está planificada para la versión 2.
- El modo streaming es causal con 20 ms de look-ahead, por lo que su calidad es inferior a la del modo offline, que dispone de chunks completos de 8 s.
- No se documentan sesgos conocidos, pero al ser un modelo de audio, su comportamiento ante acentos, idiomas o tipos de voz poco representados en el entrenamiento no está descrito.
- Riesgo de artefactos o pérdida de componentes vocales en condiciones de ruido extremo o solapamiento con la voz; no se publican métricas que lo cuantifiquen.
- GPUs consumer pequeñas no han sido probadas oficialmente; el rendimiento en esos entornos es desconocido.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución con atribución y sin garantías.
- El repositorio de Hugging Face tiene 0 descargas y 0 likes en el momento de la consulta, y el paquete descarga los pesos en el primer uso con verificación de checksums.

## Enlaces

- Hugging Face: https://huggingface.co/Infinix-io/voice-isolator
- Repositorio GitHub: https://github.com/inworld-ai/voice-isolator
- Guía de configuración para agentes (AGENTS.md): https://github.com/inworld-ai/voice-isolator/blob/main/AGENTS.md#setting-up-the-voice-isolator-for-a-user
- Demo interactiva: https://github.com/inworld-ai/voice-isolator/blob/main/demo/README.md
- Benchmark: https://github.com/inworld-ai/voice-isolator/blob/main/bench/README.md
- Planes de futuro: https://github.com/inworld-ai/voice-isolator#plans
- Ejemplo de audio: https://raw.githubusercontent.com/inworld-ai/voice-isolator/main/demo/examples/sample_14.wav
