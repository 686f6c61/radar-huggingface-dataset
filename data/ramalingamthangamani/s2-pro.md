# Ramalingamthangamani/s2-pro

## Resumen

Fish Audio S2 Pro es un modelo de síntesis de voz (text-to-speech, TTS) desarrollado por Fish Audio, presentado como un "Large Audio Model" (LAM) de código abierto. Su principal innovación es el control fino y localizado de la prosodia y la emoción mediante instrucciones en lenguaje natural incrustadas en el texto con sintaxis de corchetes, como `[whisper in small voice]` o `[professional broadcast tone]`. Está entrenado con más de 10 millones de horas de audio en más de 80 idiomas, y combina una arquitectura dual-autorregresiva con alineación por aprendizaje por refuerzo (RL alignment).

El modelo se compone de un transformador decoder-only junto con un codec de audio basado en RVQ (10 codebooks, ~21 Hz de tasa de fotogramas). La arquitectura Dual-AR separa un "Slow AR" de 4B parámetros que predice el codebook semántico principal a lo largo del eje temporal, y un "Fast AR" de 400M parámetros que genera los 9 codebooks residuales restantes, logrando un equilibrio entre eficiencia y fidelidad acústica. El repositorio en HuggingFace contiene los pesos en formato safetensors (4.561.852.416 parámetros en total) junto con código de fine-tuning y un motor de inferencia en streaming basado en SGLang.

La relevancia de S2 Pro radica en que democratiza la generación de voz expresiva de alta calidad, con capacidades de control fino que antes requerían ajustes manuales o modelos propietarios. Además, al ser estructuralmente isomorfo a un LLM autorregresivo estándar, hereda todas las optimizaciones de servicio de SGLang (batching continuo, paged KV cache, CUDA graph replay, RadixAttention), lo que permite un despliegue eficiente en producción con baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer + RVQ audio codec (10 codebooks, ~21 Hz) con Dual-Autoregressive (Slow AR 4B + Fast AR 400M) |
| Parametros totales | 4.561.852.416 (4,56B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (existen conversiones GGUF de terceros, ~14,7 GB) |
| Idiomas soportados | 80+ idiomas, incluyendo ja, en, zh, ko, es, pt, ar, ru, fr, de, sv, it, tr, no, nl, cy, eu, ca, da, gl, ta, hu, fi, pl, et, hi, la, ur, th, vi, jw, bn, yo, sl, cs, sw, nn, he, ms, uk, id, kk, bg, lv, my, tl, sk, ne, fa, af, el, bo, hr, ro, sn, mi, yi, am, be, km, is, az, sd, br, sq, ps, mn, ht, ml, sr, sa, te, ka, bs, pa, lt, kn, si, hy, mr, as, gu, fo |
| Licencia | Fish Audio Research License (uso no comercial e investigación; comercial requiere licencia separada) |
| Formato de pesos | safetensors (también GGUF de terceros) |

## Arquitectura y entrenamiento

S2 Pro utiliza un transformador decoder-only junto con un codec de audio RVQ de 10 codebooks a una tasa de fotogramas de ~21 Hz. La arquitectura Dual-Autoregressive (Dual-AR) divide la generación en dos flujos: un Slow AR de aproximadamente 4B parámetros que opera a lo largo del eje temporal y predice el codebook semántico principal, y un Fast AR de 400M parámetros que genera los 9 codebooks residuales restantes en cada paso temporal, reconstruyendo el detalle acústico fino. Esta asimetría permite una inferencia eficiente sin sacrificar la fidelidad del audio.

El entrenamiento se realizó con más de 10 millones de horas de audio en más de 80 idiomas, y el sistema incorpora alineación por aprendizaje por refuerzo (RL alignment) para mejorar la naturalidad y la adherencia a las instrucciones. El modelo admite control fino mediante etiquetas textuales libres (más de 15.000 etiquetas únicas) que se insertan directamente en el texto de entrada, como `[pause]`, `[emphasis]`, `[laughing]`, `[whisper]`, `[singing]`, `[volume up]`, `[angry]`, etc. Además, al ser estructuralmente isomorfo a un LLM autorregresivo estándar, puede beneficiarse de todas las optimizaciones de SGLang, incluyendo batching continuo, paged KV cache, CUDA graph replay y RadixAttention para el cacheo de prefijos.

## Capacidades

- Generación de voz expresiva con control fino de prosodia, emoción, tono, volumen, velocidad y efectos (risa, suspiro, canto, susurro, grito, etc.) mediante instrucciones en lenguaje natural con sintaxis `[tag]`.
- Soporte multilingüe extenso: más de 80 idiomas, con un rendimiento destacado en japonés, inglés y chino (nivel 1), seguidos de coreano, español, portugués, árabe, ruso, francés y alemán (nivel 2).
- Generación multi-hablante y multi-turno: puede mantener la coherencia de voz en conversaciones largas con múltiples interlocutores.
- Inferencia en streaming de baja latencia: el motor basado en SGLang permite time-to-first-audio de ~100 ms y un factor de tiempo real (RTF) de 0,195 en una GPU NVIDIA H200.
- Fine-tuning: se incluye código para ajustar el modelo con datos propios, lo que permite personalizar voces o estilos.
- Control de etiquetas libre: no se limita a un conjunto fijo de etiquetas; acepta descripciones textuales abiertas para un control expresivo ilimitado.

## Casos de uso

- **Audiobooks y narración**: el control fino de prosodia y emoción permite generar audiolibros con voces naturales que transmiten matices dramáticos, adecuados para producción editorial automatizada.
- **Asistentes de voz y agentes conversacionales**: la baja latencia (TTFA ~100 ms) y el soporte multi-turno permiten integrar S2 Pro en asistentes virtuales que requieren respuestas rápidas y expresivas, manteniendo la coherencia del hablante.
- **Doblaje y localización de contenidos**: con soporte para más de 80 idiomas y control de estilo, puede generar doblaje de vídeos o podcasts manteniendo el tono emocional original, acelerando el flujo de localización.
- **Generación de contenidos para redes sociales**: creadores de contenido pueden producir voces en off para vídeos, reels o TikTok con estilos específicos (entusiasta, susurro, tono profesional) sin necesidad de estudio de grabación.
- **Sistemas de accesibilidad**: conversión de texto a voz para personas con discapacidad visual o dificultades de lectura, con opciones de control de velocidad y emoción para mejorar la comprensión.
- **Entrenamiento de modelos de voz y síntesis de datos**: el fine-tuning permite crear voces sintéticas personalizadas para asistentes de marca, chatbots con personalidad o sistemas de respuesta interactiva en entornos comerciales (sujeto a licencia).
- **Producción musical y efectos de sonido**: las etiquetas como `[singing]`, `[laughing]` o `[audience laughter]` permiten generar efectos vocales y ambientes para prototipos de audio o demos creativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar de calidad de TTS (como MOS, SIM, etc.) en la información disponible. Sin embargo, la model card proporciona métricas de rendimiento de inferencia en una GPU NVIDIA H200:

| Metrica | Valor |
|---|---|
| Real-Time Factor (RTF) | 0,195 |
| Time-to-first-audio | ~100 ms |
| Throughput | 3.000+ tokens acústicos/s (manteniendo RTF < 0,5) |

Estos datos indican que el modelo es adecuado para aplicaciones en tiempo real y streaming en hardware de gama alta.

## Requisitos de hardware

- **VRAM estimada**: el modelo tiene 4,56B parámetros. En FP16, los pesos ocupan aproximadamente 9,1 GB, por lo que se necesitan al menos 12-16 GB de VRAM para inferencia con contexto moderado. Con cuantización a 8 bits (~4,6 GB) o 4 bits (~2,3 GB) podría ejecutarse en GPUs de consumo, aunque no hay cifras oficiales de Fish Audio.
- **GPU recomendadas**: para el rendimiento de streaming anunciado (RTF 0,195) se usó una NVIDIA H200. GPUs con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A100, H100) son adecuadas para producción. En GPUs de consumo con 16 GB podría funcionar con cuantización o lotes pequeños.
- **Opciones de despliegue**: el motor de inferencia oficial está basado en SGLang, que es compatible con GPUs NVIDIA. También existen conversiones GGUF de terceros que permiten ejecutar el modelo con llama.cpp u Ollama, aunque no son oficiales.
- **Latencia y throughput**: en una H200, el time-to-first-audio es de ~100 ms y el throughput supera los 3.000 tokens acústicos/s. En hardware inferior, la latencia aumentará proporcionalmente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Fish Audio S2 Pro | 4,56B | No disponible | 80+ | Fish Audio Research License (no comercial) | Control fino por etiquetas, streaming eficiente |
| XTTS v2 (Coqui) | ~1,2B | No disponible | 17 | CPML (no comercial) | TTS multilingüe, clonación de voz, más ligero |
| Bark (Suno) | ~2,4B | No disponible | 13 | MIT (comercial permitido) | Genera audio con efectos, pero menos control fino |
| CosyVoice (Alibaba) | ~1,5B | No disponible | 8 | Apache 2.0 (comercial permitido) | TTS con control de estilo, pero menos idiomas |

La comparación se basa en datos públicos de cada modelo; no se dispone de benchmarks comunes que permitan una comparación cuantitativa directa de calidad de voz.

## Limitaciones y advertencias

- **Licencia restrictiva**: la Fish Audio Research License permite uso no comercial e investigación, pero el uso comercial requiere una licencia separada de Fish Audio. Esto limita su adopción en productos comerciales sin negociación previa.
- **Riesgo de uso indebido**: el modelo puede generar voces sintéticas muy realistas, lo que plantea riesgos de suplantación de identidad, deepfakes de audio o generación de contenido engañoso. La model card exige aceptar no generar contenido que viole DMCA o leyes locales.
- **Sesgos y alucinaciones**: al ser un modelo entrenado con datos masivos de audio, puede presentar sesgos en la pronunciación o entonación según el hablante o el contexto, y puede producir errores en idiomas poco representados.
- **Contexto limitado**: no se ha especificado la longitud máxima de contexto, por lo que en conversaciones muy largas podría degradarse la coherencia.
- **Dependencia de hardware**: el rendimiento de streaming anunciado requiere una GPU H200; en hardware inferior, la latencia puede ser demasiado alta para aplicaciones en tiempo real.
- **Sin benchmarks de calidad publicados**: no hay métricas objetivas de naturalidad o similitud de voz frente a otros modelos, lo que dificulta una evaluación rigurosa antes de su adopción.

## Enlaces

- [HuggingFace - Ramalingamthangamani/s2-pro](https://huggingface.co/Ramalingamthangamani/s2-pro)
- [Technical Report (arXiv 2603.08823)](https://huggingface.co/papers/2603.08823)
- [GitHub - Fish Speech](https://github.com/fishaudio/fish-speech)
- [Fish Audio Playground](https://fish.audio)
- [Blog & Tech Report](https://fish.audio/blog/fish-audio-open-sources-s2/)
- [Página GGUF de terceros (local-ai-zone)](https://local-ai-zone.github.io/models/s2-pro.html)
