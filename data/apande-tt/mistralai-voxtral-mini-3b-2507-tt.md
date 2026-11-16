# apande-TT/mistralai-voxtral-mini-3b-2507-tt

## Resumen

Voxtral Mini 3B 2507 es un modelo abierto de comprensión de voz desarrollado por Mistral AI, publicado en julio de 2025 como parte de la familia Voxtral. Combina un encoder de audio con un modelo de lenguaje de 3B parámetros para resolver tareas de reconocimiento automático de voz (ASR), traducción de voz y respuesta a preguntas sobre contenido de audio, todo dentro de una única arquitectura multimodal. Su relevancia radica en que ofrece estas capacidades con pesos abiertos y licencia Apache 2.0, algo poco habitual en modelos de audio de calidad comparable.

La ficha que nos ocupa, `apande-TT/mistralai-voxtral-mini-3b-2507-tt`, no es un modelo nuevo sino un empaquetado del modelo upstream para ejecutarse en hardware Tenstorrent Blackhole (chip p150). Incluye los pesos en BF16 del modelo original y un contenedor que expone una API compatible con OpenAI para transcripción (`/v1/audio/transcriptions`) y chat multimodal con audio (`/v1/chat/completions`). El objetivo es permitir el despliegue de Voxtral Mini en aceleradores Tenstorrent sin necesidad de GPU convencionales.

El modelo soporta ocho idiomas (inglés, francés, alemán, español, italiano, portugués, neerlandés e hindi), acepta audio de hasta aproximadamente 40 minutos por petición y transcribe un clip de 13 segundos en 0,76 s en el hardware de referencia, con una generación de texto de unos 37 tokens por segundo. La decodificación es greedy y procesa una petición a la vez.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo multimodal audio-texto: encoder de audio + LLM de 3B parámetros (detalles internos del encoder no disponibles) |
| Parametros totales | 3B (según nombre del modelo upstream; desglose no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (audio de hasta ~40 minutos por petición; ventana de texto no especificada) |
| Tipos de cuantizacion | BF16 en el empaquetado Tenstorrent; otras cuantizaciones del upstream no disponibles |
| Idiomas soportados | Inglés, francés, alemán, español, italiano, portugués, neerlandés, hindi |
| Licencia | Apache 2.0 |
| Formato de pesos | Contenedor Tenstorrent (imagen Docker de 1,1 GB) + pesos BF16 de `mistralai/Voxtral-Mini-3B-2507` (9,4 GB); formatos adicionales no disponibles |

## Arquitectura y entrenamiento

Voxtral Mini 3B 2507 sigue una arquitectura multimodal que acopla un encoder de audio con un modelo de lenguaje de 3B parámetros. El encoder transforma la señal de audio en representaciones que el LLM consume junto con el texto, permitiendo tanto transcripción pura como razonamiento sobre el contenido hablado. El modelo acepta WAV, FLAC, MP3 y OGG a cualquier frecuencia de muestreo, y procesa hasta unos 40 minutos de audio por petición. La decodificación es greedy y el servidor atiende una petición simultánea.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. El empaquetado Tenstorrent añade una capa de conversión de pesos al formato del dispositivo y compilación de programas para el chip Blackhole, con caché en disco que reduce el arranque de ~80 s a ~20 s en reinicios posteriores. Los prompts se rellenan a múltiplos de 128 tokens, y cada nueva longitud de prompt compila sus programas una vez (4-6 s adicionales).

## Capacidades

- Reconocimiento automático de voz (ASR) en ocho idiomas, con detección automática del idioma si no se especifica.
- Traducción de voz: si se indica un idioma de salida distinto al del habla, el modelo traduce la transcripción.
- Respuesta a preguntas sobre audio: el modelo puede razonar sobre el contenido de un clip y responder preguntas en lenguaje natural.
- Chat multimodal: mezcla de texto y audio (base64 o URL) en una misma conversación, con varios clips por conversación.
- Generación de texto: chat de texto convencional a través de `/v1/chat/completions`.
- API compatible con OpenAI para transcripción y chat, lo que facilita la integración con SDKs existentes (`openai` Python client).
- Soporte de formatos de audio variados (WAV, FLAC, MP3, OGG) y cualquier frecuencia de muestreo.
- No se menciona soporte de tool calling, function calling ni agentes multi-paso en la información disponible.

## Casos de uso

- Transcripción de reuniones y actas: el modelo acepta clips de hasta ~40 minutos y transcribe en ocho idiomas, adecuado para generar actas automáticas de reuniones largas sin segmentar manualmente.
- Subtitulado y traducción de contenido audiovisual: con el parámetro `language` se obtiene traducción directa de la transcripción (por ejemplo, inglés a español), útil para localización de vídeos y podcasts.
- Atención al cliente por voz: la API compatible con OpenAI permite integrar la transcripción en pipelines existentes de IVR o centros de contacto, con detección automática de idioma para usuarios multilingües.
- Análisis de llamadas y cumplimiento: preguntas sobre audio (`/v1/chat/completions` con `input_audio`) permiten extraer información estructurada de grabaciones, como temperaturas, ciudades o decisiones, sin pipeline ASR + LLM separado.
- Accesibilidad: generación de transcripciones y resúmenes de contenido hablado para personas con discapacidad auditiva, con soporte de varios idiomas europeos e hindi.
- Despliegue en hardware Tenstorrent: organizaciones con aceleradores Blackhole pueden servir ASR y chat de audio sin GPU convencionales, con latencia de 0,76 s para un clip de 13 s y ~37 tokens/s de generación.
- Investigación en ASR multilingüe: pesos abiertos con licencia Apache 2.0 permiten fine-tuning y evaluación en dominios específicos (médico, legal, técnico) sin restricciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del empaquetado Tenstorrent solo reporta métricas de latencia y throughput en hardware Blackhole p150:

| Metrica | Valor |
|---|---|
| Transcripcion de clip de 13 s | 0,76 s |
| Generacion de texto | ~37 tokens/s |
| Arranque en frio | ~80 s |
| Arranque en caliente | ~20 s |
| Compilacion por nueva longitud de prompt | 4-6 s (una vez, luego cacheada) |

## Requisitos de hardware

- Hardware de referencia: una sola chip Tenstorrent Blackhole (p150), configurada como dispositivo de un solo chip en un QuietBox 2.
- VRAM estimada: no aplica en el sentido convencional; el modelo corre en la memoria del acelerador Blackhole. Los pesos BF16 ocupan 9,4 GB en disco.
- GPU convencionales: no se documenta soporte en la información disponible; el empaquetado está orientado a Tenstorrent.
- Despliegue: CLI `tt` de Tenstorrent (`tt model pull`, `tt serve`, `tt model logs`, `tt model stop`), con Docker y `uv` como dependencias.
- Latencia: 0,76 s para transcripción de 13 s de audio; ~37 tokens/s en generación de texto; decodificación greedy y una petición simultánea.
- Almacenamiento: imagen de contenedor de 1,1 GB más pesos de 9,4 GB en la caché de Hugging Face.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Voxtral Mini 3B 2507 (upstream) | 3B | ~40 min por peticion | 8 | Apache 2.0 | Pesos abiertos en Hugging Face |
| Voxtral Mini 3B 2507 TT (este empaquetado) | 3B | ~40 min por peticion | 8 | Apache 2.0 | Contenedor Tenstorrent Blackhole |
| Whisper large-v3 | ~1,55B | 30 s por ventana | ~99 | MIT | Pesos abiertos, amplio ecosistema |
| Qwen2-Audio | ~7B | No disponible | Multiples | No disponible | Pesos abiertos |

La comparación con Whisper large-v3 es la más directa en ASR: Whisper procesa ventanas de 30 s y requiere segmentación para audio largo, mientras que Voxtral Mini acepta hasta ~40 minutos por petición. Qwen2-Audio es un competidor multimodal de mayor tamaño. No se dispone de datos de benchmarks comparativos en la información proporcionada para establecer diferencias de precisión.

## Limitaciones y advertencias

- Decodificación greedy y una sola petición simultánea: no apto para cargas de producción de alta concurrencia sin replicación.
- Latencia adicional de 4-6 s en la primera petición con una nueva longitud de prompt (audio >30 s, por ejemplo), aunque luego se cachea.
- El modelo upstream puede alucinar en transcripciones con ruido de fondo, acentos marcados o audio de baja calidad; no se documentan tasas de error en la información disponible.
- Sesgos conocidos del modelo upstream no documentados en la información proporcionada.
- Idiomas limitados a ocho; no cubre, por ejemplo, árabe, chino, japonés ni ruso.
- Licencia Apache 2.0 permite uso comercial, pero el empaquetado depende del CLI de Tenstorrent y de hardware Blackhole, lo que limita la portabilidad.
- El pin `typer<0.29` es un workaround para un error de arranque en tenstorrent 1.2.1; puede requerir revisión en futuras versiones.
- No se documenta soporte de tool calling ni agentes multi-paso, lo que limita su uso en pipelines agénticos complejos.

## Enlaces

- Repositorio del empaquetado: https://huggingface.co/apande-TT/mistralai-voxtral-mini-3b-2507-tt
- Modelo upstream: https://huggingface.co/mistralai/Voxtral-Mini-3B-2507
- Documentación del CLI Tenstorrent: https://docs.astral.sh/uv/getting-started/installation/
- Clips de ejemplo: https://huggingface.co/datasets/Narsil/asr_dummy y https://huggingface.co/datasets/hf-internal-testing/dummy-audio-samples
