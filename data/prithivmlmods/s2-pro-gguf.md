# prithivMLmods/s2-pro-GGUF

## Resumen

s2-pro-GGUF es la versión cuantizada en formato GGUF de Fish Audio S2 Pro, un modelo de síntesis de voz (text-to-speech) multilingüe desarrollado por Fish Audio. El modelo original combina una arquitectura transformer dual-autorregresiva (Dual-AR) con un códec de audio basado en RVQ de 10 codebooks a ~21 Hz: un módulo "Slow AR" de 4.000 millones de parámetros predice el codebook semántico principal a lo largo del eje temporal, mientras que un módulo "Fast AR" de 400 millones de parámetros genera los 9 codebooks residuales para el detalle acústico fino. Esta réplica GGUF, publicada por prithivMLmods, permite ejecutar el modelo en llama.cpp mediante el binario `llama-tts`, sin necesidad de infraestructura propietaria.

La característica diferencial del modelo es el control fino en línea mediante instrucciones en lenguaje natural embebidas en el texto (por ejemplo `[whisper]`, `[laughing]` o `[pitch up]`), con más de 15.000 etiquetas únicas que permiten modular prosodia y emoción a nivel de palabra. El modelo base fue entrenado con más de 10 millones de horas de audio en más de 80 idiomas y soporta generación multi-hablante y multi-turno con streaming de baja latencia.

Esta versión GGUF es relevante porque democratiza el despliegue del modelo en hardware de consumo: el cuantizado Q4_K_M ocupa solo 2,51 GB, frente a los 8,07 GB del BF16, manteniendo la arquitectura completa. La licencia Fish Audio Research License restringe el uso comercial sin licencia adicional, lo que limita su adopción en producción pero lo hace plenamente utilizable en investigación y proyectos no comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer dual-autorregresiva (Dual-AR) con codec de audio RVQ de 10 codebooks (~21 Hz); Slow AR de 4B + Fast AR de 400M |
| Parametros totales | 4.032.298.496 (según safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE; la división Slow AR / Fast AR no implica activación selectiva tipo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0, mmproj-bf16 |
| Idiomas soportados | Más de 80 idiomas, incluyendo zh, en, ja, ko, es, pt, ar, ru, fr, de, sv, it, tr, no, nl, cy, eu, ca, da, gl, ta, hu, fi, pl, et, hi, la, ur, th, vi, jw, bn, yo, sl, cs, sw, nn, he, ms, uk, id, kk, bg, lv, my, tl, sk, ne, fa, af, el, bo, hr, ro, sn, mi, yi, am, be, km, is, az, sd, br, sq, ps, mn, ht, ml, sr, sa, te, ka, bs, pa, lt, kn, si, hy, mr, as, gu, fo |
| Licencia | fish-audio-research-license (uso gratuito para investigación y no comercial; uso comercial requiere licencia aparte) |
| Formato de pesos | GGUF (con fichero mmproj-bf16 separado para capacidades de audio) |

## Arquitectura y entrenamiento

La arquitectura Dual-AR combina dos módulos autorregresivos que operan a escalas temporales distintas. El módulo Slow AR, con 4.000 millones de parámetros, procesa la secuencia a lo largo del eje temporal y predice el codebook semántico principal del códec RVQ. El módulo Fast AR, con 400 millones de parámetros, toma la salida del Slow AR y genera los 9 codebooks residuales que codifican el detalle acústico fino. El códec RVQ emplea 10 codebooks a una frecuencia de trama de aproximadamente 21 Hz, lo que permite reconstruir audio de alta fidelidad a partir de tokens discretos.

El entrenamiento se realizó sobre más de 10 millones de horas de audio en más de 80 idiomas, con japonés, inglés y chino como idiomas de nivel 1 (Tier 1). El modelo incorpora alineamiento mediante aprendizaje por refuerzo (RL) según la model card. La inferencia nativa en SGLang aprovecha optimizaciones propias de LLM como continuous batching, paged KV cache y prefix caching, lo que permite alcanzar un RTF de 0,195 y un time-to-first-audio de aproximadamente 100 ms en una única GPU H200. La versión GGUF traslada esta arquitectura a llama.cpp mediante el binario `llama-tts`, que carga el modelo principal y el proyector multimodal (`mmproj-bf16`) para habilitar la síntesis de audio.

## Capacidades

- Síntesis de voz multilingüe en más de 80 idiomas, con japonés, inglés y chino como idiomas de máximo soporte.
- Control fino en línea de prosodia y emoción mediante instrucciones en lenguaje natural embebidas en el texto (`[whisper]`, `[laughing]`, `[pitch up]`, etc.), con más de 15.000 etiquetas únicas.
- Generación multi-hablante y multi-turno.
- Streaming de baja latencia (RTF 0,195 y ~100 ms de time-to-first-audio en H200).
- Seguimiento de instrucciones (instruction-following) aplicado a la modulación de la voz.
- Capacidades conversacionales según los tags del repositorio.
- Soporte de inferencia en llama.cpp mediante `llama-tts` con offloading a GPU (`-ngl`).
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Audiolibros y narración automatizada: el modelo permite embeber etiquetas como `[whisper]` o `[laughing]` directamente en el texto para modular la interpretación a nivel de palabra, lo que facilita la producción de narraciones expresivas sin edición manual de audio.
- Doblaje y localización multilingüe: con soporte para más de 80 idiomas y generación multi-hablante, se puede emplear para generar pistas de voz en distintos idiomas manteniendo el control de prosodia por segmento.
- Asistentes de voz conversacionales: la generación multi-turno y el streaming de baja latencia (RTF 0,195) permiten integrar el modelo en pipelines de diálogo donde la respuesta de voz debe comenzar en torno a 100 ms tras el texto.
- Accesibilidad y lectores de pantalla: la síntesis de alta fidelidad con control de emoción permite convertir texto en voz natural para usuarios con discapacidad visual, ajustando el tono según el contexto.
- Prototipado de videojuegos y contenido interactivo: el despliegue en llama.cpp con cuantizados Q4_K_M (2,51 GB) permite ejecutar el modelo en hardware de consumo para generar voces de personajes con instrucciones inline.
- Investigación en TTS y prosodia: al publicarse pesos, código de fine-tuning y motor de inferencia bajo licencia de investigación, sirve como base para experimentos académicos sobre control de emoción y habla multilingüe.
- Generación de contenido para podcasts y formación: la capacidad multi-hablante y el control de etiquetas permiten producir diálogos sintéticos con voces diferenciadas y matices emocionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de eficiencia de inferencia: RTF de 0,195 y time-to-first-audio de ~100 ms en una GPU H200 con SGLang.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (tamaño de fichero GGUF): Q3_K_M 2,08 GB; Q3_K_L 2,25 GB; Q4_K_S 2,39 GB; Q4_K_M 2,51 GB; Q5_K_S 2,83 GB; Q5_K_M 2,9 GB; Q6_K 3,31 GB; Q8_0 4,29 GB; BF16 8,07 GB. A estos hay que sumar el proyector multimodal `mmproj-bf16` de 2,05 GB.
- GPU recomendadas: H200 para el rendimiento de referencia reportado (RTF 0,195, ~100 ms de time-to-first-audio); A100 y H100 como alternativas de centro de datos para el modelo completo en BF16.
- Cabe en GPU de consumo: sí, con cuantizados Q3 a Q8 (2-4,3 GB) más el proyector de 2,05 GB; una RTX 4090 o GPU con 8-12 GB de VRAM puede alojar las variantes Q4_K_M o Q5_K_M con margen.
- Opciones de despliegue: llama.cpp mediante el binario `llama-tts` (con `-ngl` para offloading a GPU y `-mm` para el proyector multimodal); el modelo base se sirve de forma nativa con SGLang (continuous batching, paged KV cache, prefix caching). No se documenta soporte de vLLM, Ollama o TGI en la información disponible.
- Latencia y throughput: RTF 0,195 y ~100 ms de time-to-first-audio en una H200 con SGLang; no se reportan cifras para llama.cpp ni para GPU de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| s2-pro-GGUF (este) | 4.032.298.496 (Slow AR 4B + Fast AR 400M) | no disponible | 80+ | fish-audio-research-license (no comercial sin licencia) | GGUF, llama.cpp (`llama-tts`), SGLang en el base |
| fishaudio/s2-pro (base) | 4.032.298.496 | no disponible | 80+ | fish-audio-research-license | Pesos originales, SGLang |
| Otras alternativas TTS | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos TTS comparables (como XTTS, Bark o Fish Speech) que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Licencia fish-audio-research-license: el uso comercial requiere una licencia separada de Fish Audio; no es apta para producción comercial sin acuerdo previo.
- Riesgo de alucinación y artefactos acústicos: como todo modelo generativo de audio, puede producir pronunciaciones incorrectas, ruidos o prosodia inconsistente, especialmente en cuantizados bajos (Q3_K_M, Q3_K_L) y en idiomas fuera del Tier 1.
- Cobertura desigual por idioma: aunque se declaran más de 80 idiomas, japonés, inglés y chino son Tier 1; la calidad en el resto puede ser inferior y no se documentan métricas por idioma.
- Longitud de contexto no documentada: se desconoce el límite exacto de tokens de texto o audio por generación, lo que dificulta planificar producciones de audio largas.
- Dependencia de `llama-tts`: el despliegue GGUF requiere compilar el binario específico de llama.cpp y cargar el proyector `mmproj-bf16`; no se documenta compatibilidad con otras herramientas de inferencia.
- Sesgos: no se detallan en la información disponible los sesgos de género, acento o etnia presentes en los datos de entrenamiento; deben evaluarse empíricamente antes de usar el modelo con voces de colectivos específicos.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: la réplica GGUF es reciente y no cuenta aún con validación comunitaria amplia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/prithivMLmods/s2-pro-GGUF
- Modelo base: https://huggingface.co/fishaudio/s2-pro
- Licencia: https://huggingface.co/fishaudio/s2-pro/blob/main/LICENSE.md
- llama.cpp: https://github.com/ggml-org/llama.cpp
