# MsCoffeeBeans/s2-pro

## Resumen

Fish Audio S2 Pro es un modelo de síntesis de voz (text-to-speech) desarrollado por Fish Audio, publicado bajo el identificador `MsCoffeeBeans/s2-pro` en Hugging Face. Se trata de un sistema TTS de gran escala con control fino en línea de prosodia y emoción, entrenado sobre más de 10 millones de horas de audio en más de 80 idiomas. Combina alineamiento mediante aprendizaje por refuerzo con una arquitectura dual-autorregresiva (Dual-AR) sobre un códec de audio basado en RVQ.

El modelo resuelve el problema del control expresivo localizado en la síntesis de voz: en lugar de depender de un conjunto fijo de etiquetas predefinidas, acepta descripciones textuales libres insertadas en el propio texto mediante sintaxis `[tag]`, lo que permite modular prosodia, emoción, ritmo y timbre a nivel de palabra. Esta característica, junto con su soporte para generación multi-hablante y multi-turno, lo posiciona como una alternativa orientada a producción frente a sistemas TTS más rígidos.

Con 4.561.852.416 parámetros totales (4B en el módulo Slow AR y 400M en el Fast AR), el modelo está diseñado para inferencia de baja latencia en streaming. Su arquitectura es estructuralmente isomórfica con los LLMs autorregresivos estándar, lo que le permite heredar optimizaciones de serving nativas de SGLang como continuous batching, paged KV cache, CUDA graph replay y prefix caching basado en RadixAttention. La licencia es de investigación (Fish Audio Research License), con uso comercial sujeto a licencia separada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con códec de audio RVQ (10 codebooks, ~21 Hz) y arquitectura Dual-Autoregressive (Slow AR + Fast AR) |
| Parametros totales | 4.561.852.416 |
| Parametros activos | No aplica (no es MoE); Slow AR 4B + Fast AR 400M |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 80+ idiomas (Tier 1: ja, en, zh; Tier 2: ko, es, pt, ar, ru, fr, de; más sv, it, tr, no, nl, cy, eu, ca, da, gl, ta, hu, fi, pl, et, hi, la, ur, th, vi, jw, bn, yo, sl, cs, sw, nn, he, ms, uk, id, kk, bg, lv, my, tl, sk, ne, fa, af, el, bo, hr, ro, sn, mi, yi, am, be, km, is, az, sd, br, sq, ps, mn, ht, ml, sr, sa, te, ka, bs, pa, lt, kn, si, hy, mr, as, gu, fo) |
| Licencia | fish-audio-research-license (uso no comercial gratuito; uso comercial requiere licencia separada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

S2 Pro se construye sobre un transformer decoder-only combinado con un códec de audio basado en RVQ (Residual Vector Quantization) de 10 codebooks y una tasa de frame de aproximadamente 21 Hz. La innovación central es la arquitectura Dual-Autoregressive (Dual-AR): un módulo **Slow AR** de 4B parámetros que opera sobre el eje temporal y predice el codebook semántico primario, y un módulo **Fast AR** de 400M parámetros que genera en cada paso temporal los 9 codebooks residuales restantes para reconstruir el detalle acústico fino. Este diseño asimétrico mantiene la eficiencia de inferencia sin sacrificar fidelidad de audio.

El entrenamiento se realizó sobre más de 10 millones de horas de audio en más de 80 idiomas, e incorpora alineamiento mediante aprendizaje por refuerzo. La arquitectura Dual-AR es estructuralmente isomórfica con los LLMs autorregresivos convencionales, lo que permite heredar directamente las optimizaciones de serving de SGLang: continuous batching, paged KV cache, CUDA graph replay y prefix caching basado en RadixAttention. El release incluye pesos del modelo, código de fine-tuning y un motor de inferencia en streaming basado en SGLang.

## Capacidades

- Síntesis de voz multilingüe en más de 80 idiomas, con tres niveles de calidad declarados (Tier 1: ja, en, zh; Tier 2: ko, es, pt, ar, ru, fr, de; resto de idiomas en categoría secundaria).
- Control fino en línea de prosodia y emoción mediante sintaxis `[tag]` insertada en el texto, con soporte para más de 15.000 etiquetas únicas y descripciones textuales libres (por ejemplo `[whisper in small voice]`, `[professional broadcast tone]`, `[pitch up]`).
- Etiquetas de control predefinidas para pausas, énfasis, risas, respiraciones, volumen, tono, emoción y efectos vocales (`[pause]`, `[emphasis]`, `[laughing]`, `[inhale]`, `[sigh]`, `[whisper]`, `[screaming]`, `[echo]`, `[singing]`, entre otras).
- Generación multi-hablante y multi-turno.
- Inferencia de baja latencia en streaming, con time-to-first-audio de aproximadamente 100 ms.
- Soporte de instrucciones en lenguaje natural para modular la salida (instruction-following).
- Capacidad de canto (`[singing]`) y de efectos vocales no verbales (risas, tos, suspiros, jadeos).
- No se declara soporte de tool calling, function calling ni razonamiento multi-paso, por tratarse de un modelo TTS y no de un LLM conversacional.

## Casos de uso

- **Atención al cliente automatizada con voz natural**: el modelo puede generar respuestas habladas multi-turno con control de emoción y prosodia, permitiendo ajustar el tono (empático, profesional, tranquilo) mediante etiquetas en línea según el contexto de la conversación, con latencia de primer audio de ~100 ms.
- **Audiolibros y narración expresiva**: la sintaxis `[tag]` permite marcar pausas, énfasis, susurros y cambios de volumen a nivel de palabra, lo que facilita producir narraciones con matices dramáticos sin necesidad de regrabar segmentos completos.
- **Doblaje y localización de vídeo**: con soporte para más de 80 idiomas y generación multi-hablante, se puede emplear para doblar contenido preservando el ritmo y la expresividad del original, ajustando el tono con descripciones libres.
- **Asistentes de voz embebidos en streaming**: su RTF de 0,195 y throughput de más de 3.000 tokens acústicos por segundo en una H200 lo hacen adecuado para integración en pipelines de voz en tiempo real con SGLang como motor de serving.
- **Generación de contenido para podcasts y anuncios**: las etiquetas de estilo (`[professional broadcast tone]`, `[excited tone]`, `[with strong accent]`) permiten generar variantes de una misma locución para pruebas A/B sin intervención manual.
- **Accesibilidad y lectura de textos**: conversión de documentos largos a audio con control de pausas y énfasis para mejorar la comprensión en usuarios con discapacidad visual o dificultades de lectura.
- **Prototipado de personajes y videojuegos**: la generación multi-hablante y el control de emoción permiten crear voces de personajes diferenciadas y reacciones vocales no verbales (risas, suspiros, gritos) en fases de preproducción.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son métricas de streaming en una única NVIDIA H200:

| Metrica | Valor |
|---|---|
| Real-Time Factor (RTF) | 0,195 |
| Time-to-first-audio | ~100 ms |
| Throughput | 3.000+ tokens acústicos/s con RTF < 0,5 |
| GPU de referencia | NVIDIA H200 (single GPU) |

No se han publicado resultados de benchmarks comparativos (tipo MMLU, HumanEval o GSM8K, no aplicables a un modelo TTS) ni métricas de calidad de audio (MOS, WER, SIM) en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma explícita. Con 4.561.852.416 parámetros en safetensors y un repo de 11,0 GB, la inferencia en precisión nativa requiere del orden de 10-12 GB solo para pesos; a ello hay que sumar KV cache y buffers del códec, por lo que se recomienda un mínimo de 16-24 GB de VRAM.
- **GPU recomendadas**: el único dato de rendimiento publicado corresponde a una NVIDIA H200. Por el tamaño del modelo, GPUs como A100 (40/80 GB), H100 y H200 son adecuadas para producción; una RTX 4090 (24 GB) podría alojar los pesos, aunque no se ha validado en la información disponible.
- **Compatibilidad con GPU de consumo**: no confirmada. El tamaño de pesos (11 GB) sugiere que podría caber en GPUs de consumo con 16 GB o más, pero no hay validación publicada.
- **Opciones de despliegue**: motor de inferencia en streaming basado en SGLang, incluido en el release junto con el código de fine-tuning. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: RTF de 0,195, time-to-first-audio de ~100 ms y más de 3.000 tokens acústicos/s en una H200 con RTF inferior a 0,5.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas de la misma categoría (TTS multilingüe con control expresivo). Los datos de arquitectura, parámetros y rendimiento de posibles competidores no están incluidos en el material disponible.

## Limitaciones y advertencias

- **Licencia restrictiva para uso comercial**: la Fish Audio Research License permite uso gratuito únicamente para investigación y fines no comerciales; el uso comercial requiere una licencia separada negociada con Fish Audio (business@fish.audio).
- **Gating de acceso**: el modelo exige aceptar un prompt de acceso con compromiso de no generar contenido que viole DMCA o leyes locales, y declarar el país, la fecha y la aceptación de uso exclusivamente no comercial.
- **Riesgo de uso indebido**: al ser un modelo TTS de alta fidelidad con control expresivo, existe riesgo de suplantación de voz, deepfakes de audio y generación de contenido engañoso; el autor exige explícitamente no generar contenido ilegal.
- **Sesgos**: no se documentan sesgos específicos en la información disponible, pero un entrenamiento sobre más de 10 millones de horas de audio en 80+ idiomas puede reflejar desequilibrios de representación entre idiomas (los Tier 1 concentran mayor calidad) y entre variedades dialectales.
- **Calidad desigual por idioma**: el propio autor clasifica los idiomas en Tier 1 (ja, en, zh), Tier 2 (ko, es, pt, ar, ru, fr, de) y una categoría secundaria; el rendimiento en idiomas de categorías inferiores no está cuantificado.
- **Longitud de contexto no especificada**: no se publica la ventana de contexto, lo que dificulta planificar la generación de audios muy largos sin segmentación.
- **Cuantizaciones no documentadas**: no se indican formatos de cuantización soportados, lo que limita la planificación de despliegues en hardware con VRAM ajustada.
- **Dependencia de SGLang**: el motor de inferencia incluido se basa en SGLang; no se documenta soporte para otros runtimes, lo que puede condicionar la integración en infraestructuras existentes.
- **Madurez del release**: el repositorio se creó y actualizó el mismo día (2026-11-05) y registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere un release muy reciente y sin validación comunitaria.

## Enlaces

- [Hugging Face: MsCoffeeBeans/s2-pro](https://huggingface.co/MsCoffeeBeans/s2-pro)
- [Technical Report (arXiv 2603.08823)](https://arxiv.org/abs/2603.08823)
- [Technical Report en Hugging Face Papers](https://huggingface.co/papers/2603.08823)
- [GitHub: fishaudio/fish-speech](https://github.com/fishaudio/fish-speech)
- [Playground: fish.audio](https://fish.audio)
- [Blog: Fish Audio open sources S2](https://fish.audio/blog/fish-audio-open-sources-s2/)
- [Licencia: Fish Audio Research License](https://huggingface.co/MsCoffeeBeans/s2-pro/blob/main/LICENSE.md)
