# cowWhySo/Inworld-Voice-Isolator-v1-Turbo5d-Model

## Resumen

Inworld-Voice-Isolator-v1-Turbo5d-Model es un checkpoint derivado del modelo de aislamiento y mejora de voz Inworld Voice Isolator v1, desarrollado por el usuario independiente cowWhySo. No es un producto de Inworld, sino una adaptación comunitaria que reduce el tamaño y el coste computacional del modelo original manteniendo el mismo paquete de software y la misma interfaz de uso. El modelo realiza tareas de audio-a-audio: separa la voz limpia del ruido de fondo y la música en grabaciones contaminadas, entregando dos pistas de audio a 48 kHz.

La adaptación consiste en una poda estructural de los bloques de procesamiento: se pasa de 7 bloques dual-path a 5, lo que reduce los parámetros de 64,0 M a 49,9 M (un 22 % menos) y el checkpoint en FP32 de 256 MB a 200 MB. El objetivo es ofrecer mayor throughput en modo offline sobre GPUs modestas, con una calidad declarada como "aproximadamente comparable" pero no concluyentemente igual. Se publica bajo licencia Apache 2.0 y está pensado como reemplazo directo del checkpoint original en pipelines de procesamiento por lotes.

Es relevante para desarrolladores que ya usan Inworld Voice Isolator en producción offline y quieren reducir latencia o coste de GPU sin cambiar de librería ni de flujo de trabajo: basta con apuntar el argumento `--model` al nuevo fichero `.safetensors`. No soporta el modo streaming del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de separación de fuentes con bloques dual-path (5 bloques en esta variante, frente a 7 del original) |
| Parametros totales | 49,9 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio por segmentos; el original soporta clips de 2 a 15 s en los benchmarks) |
| Tipos de cuantizacion | FP32 (checkpoint publicado `denoiser_turbo5d_fp32.safetensors`); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (evaluado con francés `fr_fr` y alemán `de_de` de FLEURS, pero sin lista oficial de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch); existe una variante MLX para Apple silicon |
| Frecuencia de muestreo | 48 kHz, float32 |
| Tamaño del checkpoint | 200 MB (FP32) |
| Modos soportados | solo offline (sin streaming) |
| Modelo base | inworld/voice-isolator (revisión 9b0285b3) |

## Arquitectura y entrenamiento

El modelo base Inworld Voice Isolator v1 emplea una arquitectura de separación de fuentes con bloques dual-path, un diseño habitual en tareas de speech enhancement y separación de habla que combina procesamiento local y global sobre la representación tiempo-frecuencia. Esta variante Turbo-5d aplica una poda estructural que elimina 2 de los 7 bloques dual-path, conservando 5, y ajusta la configuración de arquitectura que viaja embebida en el propio checkpoint, de modo que el cargador estándar del paquete `inworld-voice-isolation==1.0.0` la lee sin necesidad de fork ni loader adicional.

No se detallan en la información disponible los datos de entrenamiento del modelo original (número de tokens de audio, composición del dataset, horas de habla) ni si hubo etapas de ajuste fino supervisado o preferencias. La adaptación comunitaria se distribuye junto a un repositorio de desarrollo separado (Turbo5d-LoRA) que, según el autor, contiene el material para reentrenar, inspeccionar o recombinar la adaptación, lo que sugiere que el ajuste se realizó mediante LoRA sobre el modelo base y posteriormente se fusionó y podó. No se especifica la innovación técnica concreta más allá de la poda de bloques y la fusión de pesos.

## Capacidades

- Aislamiento de voz: separa la voz hablada del ruido ambiental y de la música de fondo en grabaciones a 48 kHz.
- Supresión de ruido: genera una pista de voz limpia y una pista separada con el fondo eliminado (`clean_background.wav`).
- Procesamiento offline por lotes: adecuado para pipelines que procesan ficheros completos, no para streaming en tiempo real.
- Manejo de audio arbitrario: el script de ejemplo `infer_pytorch.py` incluye downmix a mono y remuestreo a 48 kHz para entradas de cualquier formato.
- Salida en float32 a 48 kHz, con la misma interfaz que el modelo original (drop-in replacement).
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni generación de texto: es un modelo puramente de audio.
- No se documentan capacidades multilingües explícitas; la evaluación cubre francés y alemán, pero el modelo opera sobre señal acústica y no sobre texto.

## Casos de uso

- Postproducción de podcast y vídeo: limpiar grabaciones con ruido de fondo (ventiladores, tráfico, reverberación) antes de la mezcla final, usando el modo offline sobre ficheros completos y aprovechando el 1,4-1,5x de speedup para reducir tiempos de render.
- Procesamiento por lotes de archivos de reuniones: limpiar cientos de grabaciones de llamadas o reuniones en una GPU modesta (por ejemplo, una T4) donde el modelo original resulta demasiado lento; el ahorro de 22 % de parámetros y el checkpoint de 200 MB facilitan el despliegue en instancias pequeñas.
- Preprocesado para ASR: mejorar la relación señal-ruido antes de pasar el audio a un sistema de reconocimiento automático de habla, especialmente en condiciones de ruido ambiental donde la métrica SI-SDR mejora (+0,714 dB en la evaluación del autor).
- Aislamiento de voz para transcripción de entrevistas: separar la voz del entrevistado del ruido de sala y del ruido de fondo en grabaciones de campo, con la advertencia de que en escenarios de habla competitiva más ruido la ganancia es menor y la inteligibilidad (STOI) puede degradarse ligeramente.
- Limpieza de audio para datasets de entrenamiento: preparar corpus de habla de mayor calidad para entrenar modelos TTS o ASR, ejecutando el aislamiento en batch sobre GPUs de gama media.
- Prototipado en Apple silicon: usar la variante Turbo5d-MLX para ejecutar los mismos pesos nativamente en MLX sin PyTorch, útil para demos locales en Mac con chip Apple.
- Integración en pipelines de datos con Hugging Face: descargar el checkpoint con `hf://` y fijar una revisión (`@<commit>`) para reproducibilidad en entornos de CI/CD de procesamiento de audio.

## Benchmarks y rendimiento

Datos publicados por el autor, comparando contra el checkpoint original de 7 bloques (`inworld/voice-isolator`, revisión 9b0285b3), medidos con `speedtest.py` de Inworld en PyTorch FP32, modo offline, sobre una Tesla T4.

Velocidad (p50, entrada sintética a 48 kHz):

| Duración del clip | Original p50 | Turbo-5d p50 | Speedup |
|---|---:|---:|---:|
| 2 s | 0,850 s | 0,580 s | 1,46x |
| 8 s | 3,521 s | 2,331 s | 1,51x |
| 15 s | 10,439 s | 7,372 s | 1,42x |

Calidad (SI-SDR, 72 pares ruidosos de FLEURS `fr_fr` y `de_de` remuestreados a 48 kHz con ruido sintético):

| Condición | Original SI-SDR | Turbo-5d SI-SDR | Cambio |
|---|---:|---:|---:|
| Ruido ambiental (n=24) | 16,586 dB | 17,300 dB | +0,714 dB |
| Habla competitiva (n=24) | 10,303 dB | 10,926 dB | +0,623 dB |
| Habla + entorno (n=24) | 8,837 dB | 8,651 dB | -0,186 dB |

El cambio global medio es de +0,384 dB, con intervalo de confianza bootstrap del 95 % de -0,451 a +1,272 dB, que incluye el cero: la evaluación no demuestra superioridad ni inferioridad media. Solo 27 de 72 pares favorecen a Turbo-5d. Por idioma, alemán +1,162 dB y francés -0,394 dB (36 pares cada uno). El cambio medio de STOI es de -0,0187, una regresión leve de inteligibilidad. El autor no publica la puntuación Inworld VIBE para esta variante (el original obtiene 0,768).

## Requisitos de hardware

- VRAM estimada: el checkpoint FP32 ocupa 200 MB; con overhead de activaciones y buffers de audio, cabe holgadamente en GPUs con 4 GB o más. No se publican cifras exactas de VRAM pico.
- GPU recomendadas: Tesla T4 (única GPU con benchmarks publicados); por el tamaño del modelo, cualquier GPU moderna con al menos 4-8 GB debería funcionar.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer con 4 GB o más (GTX 1650, RTX 3060, RTX 4090, etc.), aunque no se han publicado mediciones en estas.
- Despliegue: paquete `inworld-voice-isolation==1.0.0` (CLI `voice-isolate` y API Python `voice_isolation.VoiceIsolator`); kernels opcionales `[fast]` de Mamba según la documentación upstream; variante MLX para Apple silicon (Turbo5d-MLX). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a un modelo de audio).
- Latencia y throughput: en T4, 0,580 s para 2 s de audio, 2,331 s para 8 s y 7,372 s para 15 s (p50, FP32). No se han medido otras GPUs, CPU ni Apple silicon.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / modo | Calidad | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Inworld Voice Isolator v1 (original) | 64,0 M | offline y realtime | SI-SDR base; VIBE 0,768 | no disponible en la información | Hugging Face (inworld/voice-isolator) |
| Turbo-5d (este modelo) | 49,9 M | solo offline | +0,384 dB SI-SDR medio (IC incluye 0); STOI -0,0187 | Apache 2.0 | Hugging Face (cowWhySo) |
| Turbo5d-MLX | 49,9 M (mismos pesos) | solo offline, MLX nativo | misma que Turbo-5d | Apache 2.0 | Hugging Face (cowWhySo) |

No se dispone de información sobre otros modelos comparables de aislamiento de voz en la documentación proporcionada.

## Limitaciones y advertencias

- Calidad no concluyentemente igual: el intervalo de confianza del cambio medio de SI-SDR cruza el cero y solo 27 de 72 pares mejoran; tratar como "aproximadamente comparable", no como mejora demostrada.
- Regresión en escenarios de habla competitiva más ruido ambiental (-0,186 dB SI-SDR) y en inteligibilidad (STOI -0,0187): evitar en trabajos donde la inteligibilidad sea crítica.
- Diferencia por idioma: alemán mejora (+1,162 dB) y francés empeora (-0,394 dB); no hay evaluación en castellano.
- Sin modo streaming: el checkpoint solo soporta modo offline; si se necesita tiempo real, usar el modelo original.
- Sin puntuación VIBE publicada para esta variante, lo que impide comparar con la métrica oficial de Inworld.
- Es un derivado comunitario independiente, no un producto de Inworld: sin soporte oficial ni garantías de mantenimiento.
- Riesgo de sesgos: no se documentan sesgos conocidos, pero al operar sobre señal acústica puede comportarse peor con acentos, idiomas o condiciones acústicas no representadas en su entrenamiento (no detallado).
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la licencia del modelo base `inworld/voice-isolator` (no disponible en la información) antes de desplegar en producción.
- Los benchmarks se limitan a una Tesla T4; el rendimiento en otras GPUs, CPU y Apple silicon no está medido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cowWhySo/Inworld-Voice-Isolator-v1-Turbo5d-Model
- Variante MLX para Apple silicon: https://huggingface.co/cowWhySo/Inworld-Voice-Isolator-v1-Turbo5d-MLX
- Repositorio de desarrollo (LoRA y reentrenamiento): https://huggingface.co/cowWhySo/Inworld-Voice-Isolator-v1-Turbo5d-LoRA
- Modelo base: https://huggingface.co/inworld/voice-isolator
- Repositorio upstream de Inworld: https://github.com/inworld-ai/voice-isolator
