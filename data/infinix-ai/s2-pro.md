# Infinix-ai/s2-pro

## Resumen

Fish Audio S2 Pro es un modelo de text-to-speech (TTS) desarrollado por Fish Audio y publicado en HuggingFace bajo el identificador `Infinix-ai/s2-pro`. Se trata de un sistema de síntesis de voz de nueva generación que combina una arquitectura dual-autorregresiva con un códec de audio basado en RVQ, y que ha sido entrenado sobre más de 10 millones de horas de audio en más de 80 idiomas. Su principal innovación es el control inline de prosodia y emoción mediante etiquetas de formato libre embebidas en el texto, lo que permite modular la locución a nivel de palabra sin depender de un conjunto cerrado de etiquetas predefinidas.

El modelo se compone de dos módulos autorregresivos: un "Slow AR" de 4.000 millones de parámetros que opera sobre el eje temporal y predice el codebook semántico principal, y un "Fast AR" de 400 millones de parámetros que genera los 9 codebooks residuales en cada paso temporal. El total de parámetros asciende a 4.561.852.416 (aproximadamente 4,56 mil millones), con pesos en formato safetensors y un tamaño de repositorio de 11 GB. La arquitectura es estructuralmente isomorfa a la de un LLM autorregresivo estándar, lo que le permite heredar optimizaciones de serving nativas de SGLang.

La relevancia de S2 Pro radica en su combinación de fidelidad acústica, latencia baja (RTF de 0,195 y time-to-first-audio de ~100 ms en una H200) y control expresivo fino, lo que lo posiciona como una opción atractiva para producción de voz sintética a escala. No obstante, su licencia es de investigación (Fish Audio Research License), y el uso comercial requiere una licencia separada de Fish Audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual-autorregresiva (Slow AR + Fast AR) sobre transformer decoder-only con codec RVQ de 10 codebooks a ~21 Hz |
| Parametros totales | 4.561.852.416 (~4,56 B) |
| Parametros activos | Slow AR: 4 B; Fast AR: 400 M |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 80+ idiomas (Tier 1: ja, en, zh; Tier 2: ko, es, pt, ar, ru, fr, de; y otros como sv, it, tr, no, nl, cy, eu, ca, da, gl, ta, hu, fi, pl, et, hi, la, ur, th, vi, jw, bn, yo, sl, cs, sw, nn, he, ms, uk, id, kk, bg, lv, my, tl, sk, ne, fa, af, el, bo, hr, ro, sn, mi, yi, am, be, km, is, az, sd, br, sq, ps, mn, ht, ml, sr, sa, te, ka, bs, pa, lt, kn, si, hy, mr, as, gu, fo) |
| Licencia | Fish Audio Research License (uso no comercial gratuito; comercial requiere licencia separada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

S2 Pro emplea una arquitectura dual-autorregresiva (Dual-AR) construida sobre un transformer decoder-only. El módulo Slow AR (4 B parámetros) opera a lo largo del eje temporal y predice el codebook semántico principal, mientras que el Fast AR (400 M parámetros) genera los 9 codebooks residuales restantes en cada paso temporal para reconstruir el detalle acústico fino. El códec de audio subyacente es de tipo RVQ con 10 codebooks y una tasa de trama de aproximadamente 21 Hz. Este diseño asimétrico mantiene la eficiencia de inferencia sin sacrificar fidelidad.

El entrenamiento se realizó sobre más de 10 millones de horas de audio en más de 80 idiomas, e incorpora alineamiento mediante reinforcement learning (RL) además de la fase autorregresiva. La arquitectura es estructuralmente isomorfa a la de un LLM autorregresivo estándar, lo que permite heredar optimizaciones de serving de SGLang como continuous batching, paged KV cache, CUDA graph replay y RadixAttention para prefix caching. El release incluye pesos, código de fine-tuning y un motor de inferencia en streaming basado en SGLang.

## Capacidades

- Síntesis de voz (text-to-speech) de alta fidelidad en más de 80 idiomas.
- Control inline de prosodia y emoción mediante etiquetas de formato libre con sintaxis `[tag]` embebidas en el texto, con soporte de más de 15.000 etiquetas únicas (p. ej. `[whisper]`, `[laughing]`, `[professional broadcast tone]`, `[pitch up]`, `[sigh]`, `[excited tone]`).
- Control a nivel de palabra: las instrucciones se aplican localmente, no solo a nivel global de la locución.
- Generación multi-hablante y multi-turno (según la overview del modelo).
- Inferencia en streaming de baja latencia (time-to-first-audio ~100 ms).
- Soporte de contexto largo para inferencia (mencionado en la overview, sin cifra concreta disponible).
- Capacidad multilingüe con tres niveles de calidad declarados (Tier 1: ja, en, zh; Tier 2: ko, es, pt, ar, ru, fr, de; y un amplio conjunto adicional).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso, al tratarse de un modelo TTS.

## Casos de uso

- **Audiolibros y narración expresiva:** el control inline con etiquetas como `[whisper]`, `[sigh]` o `[excited tone]` permite dirigir la interpretación palabra a palabra, útil para producir narraciones con matices emocionales sin necesidad de un director de voz humano.
- **Doblaje y localización multilingüe:** con más de 80 idiomas y tres niveles de calidad declarados, el modelo puede generar pistas de voz para vídeo en múltiples mercados, y el control de prosodia ayuda a ajustar la locución al timing del metraje.
- **Asistentes de voz en tiempo real:** el RTF de 0,195 y el time-to-first-audio de ~100 ms en H200, junto con el motor SGLang en streaming, lo hacen adecuado para agentes conversacionales donde la latencia percibida es crítica.
- **Generación de voces para videojuegos:** la capacidad multi-hablante y multi-turno, combinada con etiquetas de emoción y efectos (`[laughing]`, `[screaming]`, `[audience laughter]`), permite poblar escenas con diálogos expresivos generados dinámicamente.
- **Accesibilidad y lectura de textos:** conversión de contenido escrito a voz con control de énfasis y pausas (`[emphasis]`, `[pause]`, `[short pause]`) para mejorar la comprensión en lectores de pantalla y aplicaciones de accesibilidad.
- **Producción de pódcasts y contenido editorial:** el control de estilo (`[professional broadcast tone]`, `[volume up]`, `[echo]`) permite generar locuciones consistentes para boletines, anuncios y piezas de audio sin grabación de estudio.
- **Prototipado de interfaces de voz:** el motor de inferencia en streaming basado en SGLang y las optimizaciones heredadas del stack LLM facilitan integrar el modelo en pipelines de desarrollo de asistentes y chatbots de voz.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son métricas de producción en streaming sobre una única GPU NVIDIA H200:

| Metrica | Valor |
|---|---|
| Real-Time Factor (RTF) | 0,195 |
| Time-to-first-audio | ~100 ms |
| Throughput | 3.000+ tokens acústicos/s con RTF < 0,5 |

No se han publicado resultados de benchmarks académicos (tipo MMLU, HumanEval o GSM8K, no aplicables a un modelo TTS) ni comparativas numéricas con otros sistemas TTS en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia:** no disponible de forma explícita. Con 4,56 B parámetros en safetensors y un repo de 11 GB, una estimación razonable en FP16 ronda los 9-10 GB de pesos, más overhead de KV cache y códecs; en cuantizaciones de 8 bits o 4 bits podría reducirse sustancialmente, aunque el autor no publica cifras.
- **GPU recomendadas:** NVIDIA H200 es la GPU de referencia para las métricas publicadas (RTF 0,195, ~100 ms TTFB). Por la naturaleza del stack SGLang, se espera compatibilidad con GPUs de datacenter (A100, H100, H200) y, presumiblemente, con GPUs consumer de gama alta, si bien no se documenta oficialmente.
- **¿Cabe en GPU consumer?** No confirmado por el autor. Por tamaño de pesos (≈11 GB en el repo), podría caber en GPUs con 16 GB o más en precisión reducida, pero es una estimación no verificada.
- **Opciones de despliegue:** motor de inferencia en streaming basado en SGLang (incluido en el release); el repositorio GitHub de Fish Speech (`fishaudio/fish-speech`) es el punto de entrada para fine-tuning e inferencia. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput:** RTF 0,195, TTFB ~100 ms y 3.000+ tokens acústicos/s en H200 con RTF < 0,5.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos numéricos de modelos TTS comparables (parámetros, contexto, benchmarks, licencia y disponibilidad) que permitan una comparativa rigurosa. Por tanto:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fish Audio S2 Pro | 4,56 B (4 B Slow AR + 400 M Fast AR) | no disponible | RTF 0,195 en H200 | Fish Audio Research License (no comercial) | Pesos en HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Licencia restrictiva:** la Fish Audio Research License permite uso de investigación y no comercial gratuito, pero el uso comercial requiere una licencia separada de Fish Audio (contacto: business@fish.audio). Esto limita su adopción en productos comerciales sin acuerdo previo.
- **Gated model:** el acceso requiere aceptar un prompt con campos de país, fecha y confirmación de uso exclusivamente no comercial, además de comprometerse a no generar contenido que viole DMCA o leyes locales.
- **Riesgo de uso indebido:** al ser un modelo TTS de alta fidelidad con control expresivo fino, existe riesgo de generación de voces sintéticas para suplantación, deepfakes de audio o desinformación; el autor impone restricciones legales pero no se documentan mecanismos técnicos de marca de agua o detección.
- **Sesgos:** no se documentan análisis de sesgo lingüístico, de género o de acento en la información disponible; la calidad declarada varía por nivel (Tier 1, Tier 2 y "otros"), lo que sugiere un rendimiento desigual entre idiomas.
- **Alucinación y artefactos acústicos:** no se publican métricas objetivas de naturalidad (MOS) ni tasas de error de pronunciación; el riesgo de artefactos en idiomas de cola larga o en etiquetas poco frecuentes no está cuantificado.
- **Contexto:** la longitud máxima de contexto no está especificada, lo que impide planificar con precisión la generación de pasajes largos.
- **Cuantización:** no se documentan formatos de cuantización soportados, lo que dificulta el despliegue en hardware con VRAM limitada.
- **Madurez del ecosistema:** el modelo tiene 0 descargas y 0 likes en el momento de la ficha, y el soporte de serving se limita a SGLang; no hay evidencia de integración con vLLM, llama.cpp u Ollama.

## Enlaces

- [HuggingFace: Infinix-ai/s2-pro](https://huggingface.co/Infinix-ai/s2-pro)
- [Technical Report (arXiv 2603.08823)](https://arxiv.org/abs/2603.08823)
- [Technical Report en HuggingFace Papers](https://huggingface.co/papers/2603.08823)
- [GitHub: fishaudio/fish-speech](https://github.com/fishaudio/fish-speech)
- [Playground: fish.audio](https://fish.audio)
- [Blog: Fish Audio open sources S2](https://fish.audio/blog/fish-audio-open-sources-s2/)
