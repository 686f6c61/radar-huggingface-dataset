# Microguy1/voice-isolator-DUPLI

## Resumen

Voice Isolator es un modelo de aislamiento de voz (voice isolation) publicado por Inworld AI bajo licencia Apache-2.0. Resuelve un problema concreto: separar la voz del hablante del ruido de fondo en grabaciones de audio y en flujos de audio en directo, preservando la identidad del hablante y trabajando a 48 kHz en banda completa (full-band). Se distribuye en dos variantes que comparten arquitectura: `voice-isolator-v1`, orientada a audio grabado y a máxima calidad, y `voice-isolator-v1-realtime`, orientada a streaming con baja latencia.

La relevancia actual del modelo está en su combinación de licencia permisiva, frecuencia de muestreo completa (48 kHz, frente a los 16 kHz habituales en modelos de denoising de voz) y soporte de streaming causal con solo 20 ms de look-ahead. Esto lo hace apto tanto para limpiar datasets de voz y grabaciones antes de su publicación como para integrarse en pipelines de llamadas y retransmisiones en vivo.

El repositorio de Hugging Face `Microguy1/voice-isolator-DUPLI` es una réplica (mirror) de los pesos originales de Inworld, sin descargas ni likes registrados en el momento de redactar esta ficha. El tamaño del repositorio es de 0,5 GB y la librería asociada es `inworld-voice-isolation`. No es un modelo de lenguaje: no genera texto ni razona; es un modelo audio-a-audio especializado en separación de fuentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de aislamiento de voz audio-a-audio (detalles internos de capas no disponibles); dos variantes con la misma arquitectura: offline y streaming causal |
| Parametros totales | 64M (variante offline `voice-isolator-v1`); 58M (variante realtime `voice-isolator-v1-realtime`) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de LLM; la variante offline procesa fragmentos (chunks) de 8 s; la variante realtime opera con 20 ms de look-ahead |
| Tipos de cuantizacion | no disponible (los pesos se descargan y se verifican por checksum; no se documentan formatos cuantizados) |
| Idiomas soportados | no disponible (procesamiento de audio independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (pesos descargados por la librería `inworld-voice-isolation`; repositorio de 0,5 GB) |

## Arquitectura y entrenamiento

El modelo se presenta como un sistema de aislamiento de voz con dos checkpoints que comparten arquitectura. La variante offline es no causal: cada frame dispone de la totalidad de su chunk de 8 segundos, lo que permite maximizar la calidad de separación en audio grabado. La variante realtime es causal y opera como un flujo continuo con 20 ms de look-ahead, lo que la hace apta para microfonía en directo y pipelines de producción con requisitos de latencia estrictos.

La salida es audio float32 a 48 kHz con los niveles originales preservados. El diseño permite una propiedad útil: la voz aislada y el fondo eliminado, sumados, reconstruyen la entrada mono alineada, de modo que restando la voz del input se obtiene el residuo de ruido o de música de fondo. No se han publicado en la información disponible detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o ajuste fino supervisado específicas. El modelo no está planteado como selector de hablante ni como modelo de restauración; la restauración está anunciada para la versión 2.

## Capacidades

- Aislamiento de voz en grabaciones ruidosas a 48 kHz en banda completa, preservando la identidad del hablante.
- Procesamiento offline por chunks de 8 s para máxima calidad en audio no sensible a latencia.
- Procesamiento en streaming causal con 20 ms de look-ahead, apto para audio en vivo.
- Extracción del fondo: al restar la voz aislada del input se obtiene el ruido o el residuo de pista musical.
- Entrada mono a 48 kHz; admite preservar la frecuencia de muestreo original de entrada mediante opción de configuración.
- Ejecución en CUDA, en backend Metal (`mps`) de Apple Silicon con PyTorch 2.6 o superior, y en CPU.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: es un modelo exclusivamente audio-a-audio.
- No es un selector de hablante ni un modelo de restauración de audio.

## Casos de uso

- Limpieza de grabaciones antes de publicación: podcasts, entrevistas y locuciones grabadas en entornos con ruido de fondo se procesan con la variante offline, que al ver el chunk completo de 8 s maximiza la calidad de separación.
- Curación de datasets de voz: en pipelines de datos para entrenamiento de TTS o ASR, el modelo elimina ruido preservando la identidad del hablante, requisito crítico para no contaminar las etiquetas de locutor.
- Llamadas y retransmisiones en vivo: la variante realtime, con 20 ms de look-ahead y procesamiento por bloques de 20 ms (960 muestras a 48 kHz), se integra en el flujo de micrófono de una aplicación de videollamada o streaming.
- Separación de voces y música de fondo: restando la salida de voz del input se obtiene el residuo de acompañamiento, útil para karaoke, remezclas o extracción de pistas instrumentales.
- Preprocesado para sistemas de reconocimiento de voz: limpiar la señal antes de alimentar un ASR reduce errores en entornos ruidosos, con la ventaja de trabajar a 48 kHz sin degradar la banda.
- Producción audiovisual: limpieza de diálogos en postproducción de vídeo, donde el modelo offline se ejecuta sobre los archivos de audio antes del montaje final.
- Investigación en separación de fuentes: al ser Apache-2.0 y con un benchmark público (VIBE), sirve como línea base reproducible para comparar técnicas de denoising y aislamiento de voz.

## Benchmarks y rendimiento

El autor referencia el benchmark VIBE (Inworld VIBE full-band tier) con una puntuación de denoising por sistema, pero en la información disponible no se incluyen los valores numéricos de la tabla. No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 64M y 58M de parámetros, el modelo es muy ligero y cabe holgadamente en cualquier GPU con varios GB de VRAM.
- GPU probadas por el autor: NVIDIA Ampere, Hopper y Blackwell, en concreto A100, H100, B200 y B300, además de CPU.
- GPUs de consumo: el autor indica que las GPU más pequeñas no se han probado todavía; no hay confirmación oficial de funcionamiento en RTX 4090 u otras consumer.
- Apple Silicon: soportado mediante el backend Metal (`mps`) con PyTorch 2.6 o superior.
- Opciones de despliegue: paquete `inworld-voice-isolation` (instalación vía `pip`), CLI `voice-isolate`, API Python `voice_isolation.VoiceIsolator` con modos offline y streaming, y demo interactiva en el repositorio de GitHub. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: la variante realtime introduce 20 ms de look-ahead y procesa bloques de 20 ms; no se publican cifras de throughput ni de latencia extremo a extremo.

## Comparativa con modelos similares

| Modelo | Parametros | Frecuencia de muestreo | Streaming | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inworld Voice Isolator (este modelo) | 64M (offline) / 58M (realtime) | 48 kHz full-band | Si, 20 ms de look-ahead | Apache-2.0 | Hugging Face y GitHub |
| Alternativas de denoising de voz de código abierto | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos verificables sobre modelos comparables de la misma categoría (aislamiento de voz a 48 kHz con licencia permisiva), por lo que la comparativa cuantitativa se marca como no disponible.

## Limitaciones y advertencias

- No es un selector de hablante: no separa varias voces entre sí, solo la voz del ruido de fondo.
- No es un modelo de restauración de audio; la restauración está anunciada para la versión 2 y no está disponible en esta.
- El repositorio consultado (`Microguy1/voice-isolator-DUPLI`) es una réplica sin descargas ni likes; conviene verificar la procedencia de los pesos frente al repositorio oficial de Inworld antes de usarlos en producción.
- No se documentan sesgos específicos, pero al tratarse de un modelo de separación de voz, su rendimiento puede degradarse con acentos, idiomas o tipos de voz poco representados en el entrenamiento, dato no disponible.
- Riesgo de artefactos o pérdida de naturalidad en la voz aislada en condiciones de ruido extremo; no se publican métricas de calidad subjetiva (MOS) en la información disponible.
- No se han probado GPU de consumo; el despliegue en hardware pequeño queda sin validar oficialmente.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar que los pesos replicados corresponden a la versión oficial y cumplen los checksums esperados por la librería.
- El modelo no procesa texto ni mantiene contexto conversacional; cualquier expectativa de uso como LLM es incorrecta.

## Enlaces

- Hugging Face (réplica): https://huggingface.co/Microguy1/voice-isolator-DUPLI
- Repositorio oficial en GitHub: https://github.com/inworld-ai/voice-isolator
- Guía de configuración para agentes de código: https://github.com/inworld-ai/voice-isolator/blob/main/AGENTS.md
- Demo interactiva: https://github.com/inworld-ai/voice-isolator/blob/main/demo/README.md
- Benchmark: https://github.com/inworld-ai/voice-isolator/blob/main/bench/README.md
- Pesos oficiales en Hugging Face: https://huggingface.co/inworld/voice-isolator
