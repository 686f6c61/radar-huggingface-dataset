# litert-community/Qwen3-ASR-1.7B

## Resumen

Qwen3-ASR-1.7B es un modelo de reconocimiento automático del habla (ASR) desarrollado por Qwen (Alibaba) y convertido al formato LiteRT-LM por la comunidad litert-community para su ejecución en dispositivos locales (on-device). El modelo original combina un codificador de audio de 24 capas con un modelo de lenguaje Qwen3 de 28 capas y 2,04 mil millones de parámetros totales; esta versión empaqueta ambos componentes en un único archivo `.litertlm` que recibe audio PCM de 16 kHz y devuelve texto transcrito junto con la etiqueta de idioma detectado.

La relevancia de esta conversión reside en que permite ejecutar un sistema ASR multilingüe completo sin conexión a red ni servidores externos, sobre hardware móvil y de borde mediante el runtime LiteRT-LM de Google. El modelo cubre identificación y reconocimiento de 30 idiomas, además de 22 dialectos chinos, e incluye mecanismos para forzar el idioma de salida cuando se conoce de antemano.

Esta ficha describe la variante LiteRT-LM, que se distribuye en dos ficheros (ventana de audio de 15 s y de 30 s) con los mismos pesos cuantizados a int8 en el modelo de lenguaje y fp16 en el codificador de audio. La licencia Apache 2.0 facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio de 24 capas + modelo de lenguaje Qwen3 de 28 capas (transformer) |
| Parametros totales | 2,04 B (1,7 B en el modelo de lenguaje) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | KV cache de 1024 tokens; ventana de audio de 15 s (195 tokens de audio) o 30 s (390 tokens de audio) |
| Tipos de cuantizacion | LM int8 dynamic con tabla de embeddings int8; codificador de audio fp16 con cómputo fp32 |
| Idiomas soportados | 30 idiomas (zh, en, yue, ar, de, fr, es, pt, id, it, ko, ru, th, vi, ja, tr, hi, ms, nl, sv, da, fi, pl, cs, fil, fa, el, hu, mk, ro) y 22 dialectos chinos |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en safetensors (`Qwen/Qwen3-ASR-1.7B-hf`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos etapas típica en ASR neuronal moderno: un codificador de audio de 24 capas procesa la señal y un modelo de lenguaje Qwen3 de 28 capas genera la transcripción de forma autorregresiva. El front-end de log-mel (STFT, banco de filtros Slaney y normalización) está integrado dentro del propio grafo del codificador, de modo que el runtime solo debe entregar PCM de 16 kHz troceado en tramas de 10 ms. La salida del modelo tiene un formato estructurado fijo: `language <nombre><asr_text><transcripción>`, lo que permite separar la identificación de idioma del texto transcrito.

La conversión a LiteRT-LM reorganiza los grafos en tres secciones: `tf_lite_audio_encoder_hw` (front-end, codificador y proyector, 637 MB), `tf_lite_prefill_decode` (modelo de lenguaje int8 con KV cache de 1024 tokens, 1,74 GB en el fichero de 30 s y 1,75 GB en el de 15 s) y `tf_lite_embedder` (tabla de embeddings int8, 313 MB). El fichero de 30 s fue reescrito el 17 de noviembre de 2026 para que los grafos de prefill y decode se ejecuten en GPU sin modificar ningún peso. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

## Capacidades

- Reconocimiento automático del habla (audio a texto) en 30 idiomas y 22 dialectos chinos.
- Identificación automática del idioma del audio, emitida como etiqueta `language <nombre>` antes de la transcripción.
- Forzado de idioma: si se añade un elemento de texto `language <nombre><asr_text>` en el mismo mensaje, el modelo transcribe sin emitir la etiqueta de idioma (verificado en 11 de 11 clips de mandarín y japonés).
- Procesamiento de clips de hasta 15 s con el fichero de 15 s y de hasta 30 s con el de 30 s; clips más largos de 15 s se procesan en dos ventanas con el fichero de 15 s.
- Ejecución completamente local en dispositivos móviles y de borde mediante LiteRT-LM, sin dependencia de red.
- Integración mediante la API Kotlin `Conversation` (`litertlm-android`) y mediante `litert-lm-api`.
- No se documentan capacidades de tool calling, agentes, visión ni audio en streaming en la información disponible.

## Casos de uso

- Transcripción de notas de voz en aplicaciones móviles: el fichero de 15 s procesa clips cortos con la mitad del coste de codificador y prefill que el de 30 s, lo que lo hace adecuado para dictado y mensajería de voz en el propio teléfono sin enviar audio a la nube.
- Subtitulado y actas de reuniones en dispositivos de borde: con el fichero de 30 s se pueden transcribir intervenciones de hasta 30 s por ventana, encadenando ventanas para grabaciones más largas, en un portátil o mini-PC sin GPU dedicada.
- Asistentes de voz multilingües: la detección automática de idioma entre 30 lenguas permite enrutar la conversación al módulo de respuesta adecuado sin que el usuario seleccione idioma manualmente.
- Aplicaciones de accesibilidad para personas con discapacidad auditiva: transcripción local en tiempo casi real en un teléfono, con la privacidad que supone no enviar el audio a servidores externos.
- Cumplimiento y privacidad en entornos regulados: al ejecutarse íntegramente on-device, el audio no abandona el dispositivo, lo que facilita el cumplimiento de requisitos de protección de datos en sanidad, banca o administración pública.
- Transcripción de contenido audiovisual en varios idiomas: el soporte de 30 idiomas y 22 dialectos chinos permite procesar material de archivo heterogéneo con un solo modelo, forzando el idioma cuando se conoce para evitar errores de etiquetado.
- Integración en aplicaciones Android nativas: mediante `litertlm-android` y la API `Conversation`, el modelo se puede incorporar a una app Kotlin existente sin infraestructura de servidor.

## Benchmarks y rendimiento

Los datos disponibles corresponden a evaluaciones sobre clips del conjunto FLEURS (frase de test 1698 y 28 clips de 15,1 a 29,3 s) y a medidas de velocidad en un Galaxy S26 (SM-S942Q). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

| Metrica | Resultado | Condiciones |
|---|---|---|
| CER mandarín | 6,65 % | Plantilla de chat del checkpoint (turno de sistema vacío) |
| CER japonés | 6,06 % | Plantilla de chat del checkpoint (turno de sistema vacío) |
| Etiquetado de idioma | 100 % correcto en mandarín y japonés | Clips FLEURS evaluados |
| Etiquetado de idioma en inglés | 1 clip (2 en ejecución GPU) devuelto como `language None` con transcripción en inglés | Clips FLEURS evaluados |
| Decodificación en GPU (fichero 30 s nuevo) | 28,5 a 28,8 tokens/s | Galaxy S26 GPU, primera de tres iteraciones, tras prefill de 512 tokens, LiteRT-LM v0.19.0 |
| Decodificación en GPU (fichero 30 s anterior) | 25,4 a 26,4 tokens/s | Mismas condiciones |

## Requisitos de hardware

- VRAM/RAM estimada: el fichero de 30 s ocupa 2,69 GB en disco y el de 15 s 2,70 GB; en ejecución hay que sumar el estado del runtime y el KV cache de 1024 tokens, por lo que se recomienda al menos 3 GB de memoria disponible.
- GPU recomendadas: no se especifican modelos de GPU de escritorio; las pruebas documentadas se realizaron en la GPU de un Galaxy S26 (móvil) y en CPU de cuatro hilos del mismo dispositivo.
- Cabe en hardware móvil y de borde: verificado en Galaxy S26 con CPU de 4 hilos y en modo avión, con el modelo de lenguaje y el codificador de audio en CPU.
- Opciones de despliegue: runtime LiteRT-LM (versiones 0.17.1 a 0.19.2 documentadas), API Kotlin `litertlm-android` y `litert-lm-api`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 28,5 a 28,8 tokens/s en GPU de Galaxy S26 para el fichero de 30 s nuevo; las iteraciones posteriores de algunas ejecuciones se vieron limitadas por el límite térmico de la GPU del teléfono. El coste de codificación y prefill es fijo por ventana (390 tokens de audio en el fichero de 30 s, 195 en el de 15 s), independientemente de la duración real del clip.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana de audio | Idiomas | Licencia | Formato on-device |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B (LiteRT-LM) | 2,04 B | KV cache 1024 tokens; ventana de 15 s o 30 s | 30 idiomas y 22 dialectos chinos | Apache 2.0 | `.litertlm` |
| Qwen3-ASR-1.7B-hf (modelo base) | 2,04 B | no disponible | 30 idiomas y 22 dialectos chinos | Apache 2.0 | safetensors |
| Whisper (variantes de OpenAI) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Un mensaje contiene un único clip: el runtime rellena con ceros la ventana posterior al clip, por lo que no se pueden enviar varios clips en el mismo mensaje.
- Los clips de más de 30 s no se probaron con ninguno de los dos ficheros; con el de 15 s, los clips de más de 15 s requieren dos ventanas.
- El etiquetado automático de idioma puede fallar: se observaron clips en inglés devueltos como `language None` (con transcripción correcta en inglés) y, con la plantilla de chat del checkpoint, 8 de 50 clips en mandarín etiquetados como `English` con transcripción en chino.
- La plantilla de chat propia del checkpoint añade un turno de sistema vacío y saltos de línea que empeoran los resultados frente a la plantilla de exportación de litert-torch; los mensajes de sistema son ignorados por la plantilla.
- El fichero de 30 s con grafo GPU solo se probó con LiteRT-LM 0.19.0 a 0.19.2; no se verificó con runtimes anteriores.
- El rendimiento en GPU puede degradarse por límite térmico del dispositivo en ejecuciones prolongadas.
- No se documentan sesgos conocidos, tasas de alucinación ni restricciones adicionales de la licencia Apache 2.0 más allá de las habituales de atribución.
- La información sobre datos de entrenamiento, composición del dataset y técnicas de alineación no está disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Qwen3-ASR-1.7B
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B-hf
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
