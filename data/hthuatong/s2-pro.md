# hthuatong/s2-pro

## Resumen

Fish Audio S2 Pro es un modelo de síntesis de voz (text-to-speech) desarrollado por Fish Audio, publicado en Hugging Face bajo el identificador `hthuatong/s2-pro`. Resuelve el problema del control fino y localizado de la prosodia y la emoción en voz generada: en lugar de depender de un conjunto cerrado de etiquetas, acepta instrucciones en lenguaje natural embebidas en el propio texto mediante sintaxis `[tag]`, con más de 15.000 etiquetas únicas soportadas. Es relevante porque combina alineamiento por refuerzo con una arquitectura dual-autorregresiva y un motor de inferencia en streaming basado en SGLang.

La arquitectura es un transformer decoder-only acoplado a un códec de audio RVQ de 10 codebooks a ~21 Hz, con dos componentes autorregresivos: un Slow AR de 4B parámetros que predice el codebook semántico principal sobre el eje temporal, y un Fast AR de 400M parámetros que genera los 9 codebooks residuales en cada paso. El total declarado en safetensors es de 4.561.852.416 parámetros y el repositorio ocupa 11,0 GB. El modelo fue entrenado sobre más de 10 millones de horas de audio en más de 80 idiomas.

El modelo se distribuye con pesos, código de fine-tuning y un motor de streaming basado en SGLang. Su licencia es la Fish Audio Research License: uso gratuito para investigación y fines no comerciales, con licencia comercial separada bajo petición. En el momento de la ficha, el repositorio registra 0 descargas y 0 likes, y la model card marca `inference: false`, lo que indica que no está habilitado el widget de inferencia en Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con códec de audio RVQ (10 codebooks, ~21 Hz) y arquitectura Dual-Autoregressive (Slow AR + Fast AR) |
| Parámetros totales | 4.561.852.416 |
| Parámetros activos | Slow AR: 4B; Fast AR: 400M (no es MoE, son dos componentes AR asimétricos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | 80+ idiomas; Tier 1: ja, en, zh; Tier 2: ko, es, pt, ar, ru, fr, de; más sv, it, tr, no, nl, cy, eu, ca, da, gl, ta, hu, fi, pl, et, hi, la, ur, th, vi, jw, bn, yo, sl, cs, sw, nn, he, ms, uk, id, kk, bg, lv, my, tl, sk, ne, fa, af, el, bo, hr, ro, sn, mi, yi, am, be, km, is, az, sd, br, sq, ps, mn, ht, ml, sr, sa, te, ka, bs, pa, lt, kn, si, hy, mr, as, gu, fo y más |
| Licencia | Fish Audio Research License (fish-audio-research-license); uso no comercial gratuito, comercial bajo licencia separada |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

S2 Pro emplea un transformer decoder-only junto a un códec de audio basado en RVQ con 10 codebooks y una tasa de trama de aproximadamente 21 Hz. La innovación central es la arquitectura Dual-Autoregressive: un Slow AR de 4B parámetros opera sobre el eje temporal y predice el codebook semántico primario, mientras que un Fast AR de 400M parámetros genera los 9 codebooks residuales en cada paso temporal para reconstruir el detalle acústico fino. Este diseño asimétrico mantiene la eficiencia de inferencia sin sacrificar fidelidad de audio. Al ser estructuralmente isomorfo a un LLM autorregresivo estándar, hereda las optimizaciones de serving nativas de SGLang: continuous batching, paged KV cache, CUDA graph replay y prefix caching basado en RadixAttention.

El entrenamiento se realizó sobre más de 10 millones de horas de audio en más de 80 idiomas, e incorpora alineamiento mediante reinforcement learning. La model card no detalla la composición exacta del dataset, el número de tokens de texto ni si se aplicaron etapas específicas de RLHF o DPO más allá de la mención genérica al alineamiento por RL. El control de prosodia y emoción se implementa mediante instrucciones en lenguaje natural embebidas en el texto con sintaxis `[tag]`, aceptando descripciones libres como `[whisper in small voice]`, `[professional broadcast tone]` o `[pitch up]`, lo que permite control a nivel de palabra sin depender de un vocabulario fijo de etiquetas.

## Capacidades

- Síntesis de voz multilingüe en más de 80 idiomas, con niveles de calidad diferenciados (Tier 1, Tier 2 y resto).
- Control fino e inline de prosodia, emoción, volumen, pausas y estilo mediante etiquetas `[tag]` en lenguaje natural, con más de 15.000 etiquetas únicas soportadas.
- Generación multi-hablante y multi-turno según la figura de overview del repositorio.
- Inferencia en streaming de baja latencia, con time-to-first-audio de ~100 ms en H200.
- Seguimiento de instrucciones (instruction-following) aplicado a la generación de habla.
- Capacidad de canto (`[singing]`), risas, suspiros, respiraciones y otros eventos paralingüísticos.
- No se documentan en la información disponible capacidades de tool calling, function calling ni razonamiento multi-paso orientado a agentes; el modelo es específicamente de text-to-speech.

## Casos de uso

- Audiolibros y narración automatizada: el control inline por etiquetas permite asignar tono, pausas y énfasis a nivel de palabra o frase, ajustando la interpretación de cada pasaje sin reentrenar el modelo.
- Doblaje y localización multilingüe: con soporte de 80+ idiomas y niveles de calidad diferenciados, se puede generar voz para un mismo contenido en varios mercados manteniendo control de estilo.
- Asistentes de voz y atención al cliente: el streaming con time-to-first-audio de ~100 ms y RTF de 0,195 en H200 hace viable la respuesta de voz en conversaciones interactivas multi-turno.
- Producción de contenido para podcast y vídeo: las etiquetas de emoción y eventos paralingüísticos (`[laughing]`, `[sigh]`, `[audience laughter]`) permiten generar locuciones expresivas sin grabación humana.
- Accesibilidad y lectura de textos: síntesis de alta fidelidad con control de velocidad, volumen y pausas para usuarios con discapacidad visual o dificultades de lectura.
- Prototipado de interfaces de voz en investigación: la licencia de investigación y la disponibilidad de código de fine-tuning permiten adaptar el modelo a dominios o hablantes específicos en entornos académicos.
- Generación de voces para videojuegos y experiencias interactivas: la inferencia en streaming y el soporte multi-hablante encajan en diálogos dinámicos generados en tiempo de ejecución.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros). Solo se reportan métricas de rendimiento de inferencia en producción sobre una única GPU NVIDIA H200:

| Métrica | Valor (NVIDIA H200) |
|---|---|
| Real-Time Factor (RTF) | 0,195 |
| Time-to-first-audio | ~100 ms |
| Throughput | 3.000+ tokens acústicos/s con RTF < 0,5 |

No se han publicado resultados de benchmarks de calidad de audio (MOS, WER, similitud de hablante) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 4.561.852.416 parámetros y pesos en safetensors, en FP16 el modelo requeriría aproximadamente 9,1 GB solo para pesos, más el overhead de KV cache y del códec de audio.
- GPU recomendadas según la documentación: NVIDIA H200 para el rendimiento de streaming reportado (RTF 0,195, ~100 ms de time-to-first-audio, 3.000+ tokens acústicos/s).
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; por tamaño de pesos podría caber en GPUs con 16-24 GB de VRAM, pero no se documenta ni se garantiza.
- Opciones de despliegue: motor de streaming basado en SGLang, con soporte de continuous batching, paged KV cache, CUDA graph replay y RadixAttention. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF 0,195 y ~100 ms de time-to-first-audio en H200; el resto de configuraciones no está documentado.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas de la misma categoría (TTS multilingüe con control por instrucciones).

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Fish Audio S2 Pro | 4,56B (4B Slow AR + 400M Fast AR) | no disponible | Fish Audio Research License | Pesos en Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia restrictiva: la Fish Audio Research License permite uso gratuito solo para investigación y fines no comerciales; cualquier uso comercial requiere licencia separada de Fish Audio (business@fish.audio).
- El acceso al modelo está condicionado a un gate en Hugging Face que exige aceptar no generar contenido que viole DMCA o leyes locales y confirmar el uso exclusivamente no comercial.
- Riesgo de uso indebido para suplantación de voz o deepfakes: no se documentan en la información disponible mecanismos de marca de agua, detección o consentimiento de hablante.
- Riesgo de alucinación acústica y de pronunciación incorrecta en idiomas de la cola larga (los no listados como Tier 1 o Tier 2), donde la calidad puede degradarse.
- La calidad es heterogénea por idioma: la propia model card establece niveles (Tier 1: ja, en, zh; Tier 2: ko, es, pt, ar, ru, fr, de) que implican distinto rendimiento.
- No se documentan sesgos demográficos, acentos ni cobertura de hablantes en el dataset de entrenamiento.
- `inference: false` en Hugging Face: el widget de inferencia no está habilitado, lo que limita la prueba directa desde la plataforma.
- No se especifican requisitos de hardware fuera de la H200 ni compatibilidad con GPUs de consumo, lo que complica el despliegue en entornos pequeños.
- El repositorio registra 0 descargas y 0 likes, y la fecha de creación indicada es 2026-11-05, lo que sugiere un artefacto reciente o de procedencia a verificar antes de adoptarlo en producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/hthuatong/s2-pro)
- [Technical Report (arXiv 2603.08823)](https://arxiv.org/abs/2603.08823)
- [Página del paper en Hugging Face](https://huggingface.co/papers/2603.08823)
- [GitHub de Fish Speech](https://github.com/fishaudio/fish-speech)
- [Playground de Fish Audio](https://fish.audio)
- [Blog de Fish Audio sobre S2](https://fish.audio/blog/fish-audio-open-sources-s2/)
- [Licencia Fish Audio Research License](LICENSE.md)
