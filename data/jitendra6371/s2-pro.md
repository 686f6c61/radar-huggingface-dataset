# jitendra6371/s2-pro

## Resumen

Fish Audio S2 Pro es un modelo de síntesis de voz (text-to-speech, TTS) desarrollado por Fish Audio, publicado en Hugging Face por el usuario jitendra6371. Se trata de un sistema de generación de voz de última generación que combina un transformer decoder-only con un codec de audio basado en RVQ (10 codebooks, ~21 Hz de frame rate) y una arquitectura dual-autorregresiva (Dual-AR) compuesta por un modelo lento de 4.000 millones de parámetros y un modelo rápido de 400 millones. El modelo ha sido entrenado con más de 10 millones de horas de audio en más de 80 idiomas, e incorpora alineación mediante aprendizaje por refuerzo para mejorar la naturalidad y el control expresivo.

La relevancia de S2 Pro radica en su capacidad de control fino de la prosodia y la emoción mediante etiquetas textuales inline (más de 15.000 etiquetas únicas), lo que permite indicar instrucciones como «[whisper in small voice]» o «[professional broadcast tone]» directamente en el texto. Además, su arquitectura dual-autorregresiva es isomórfica a la de un LLM estándar, lo que permite aprovechar todas las optimizaciones de inferencia de SGLang (batching continuo, KV cache paginado, CUDA graph replay, prefix caching). El modelo se distribuye con pesos en formato safetensors y está pensado para investigación y uso no comercial bajo la licencia Fish Audio Research License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con codec RVQ (10 codebooks, ~21 Hz) y arquitectura Dual-AR (Slow AR 4B + Fast AR 400M) |
| Parametros totales | 4.561.852.416 (según safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo TTS; el contexto se refiere a la duración del audio generado) |
| Tipos de cuantizacion | No disponible (no se especifican cuantizaciones publicadas) |
| Idiomas soportados | Más de 80, incluyendo ja, en, zh (Tier 1); ko, es, pt, ar, ru, fr, de (Tier 2); y otros como it, tr, nl, ca, hi, vi, etc. |
| Licencia | Fish Audio Research License (uso no comercial gratuito; uso comercial requiere licencia separada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

S2 Pro emplea una arquitectura dual-autorregresiva (Dual-AR) sobre un codec de audio RVQ con 10 codebooks y una frecuencia de frame de aproximadamente 21 Hz. El modelo lento (Slow AR, 4B parámetros) opera a lo largo del eje temporal y predice el codebook semántico primario, mientras que el modelo rápido (Fast AR, 400M parámetros) genera los 9 codebooks residuales restantes en cada paso temporal, reconstruyendo así los detalles acústicos finos. Esta asimetría permite mantener una inferencia eficiente sin sacrificar la fidelidad del audio.

El entrenamiento se realizó con más de 10 millones de horas de audio en más de 80 idiomas, e incorpora alineación mediante aprendizaje por refuerzo (reinforcement learning alignment) para mejorar la naturalidad y la adherencia a las instrucciones. El modelo acepta etiquetas textuales inline (por ejemplo, `[whisper]`, `[laughing]`, `[emphasis]`) que permiten un control expresivo localizado a nivel de palabra, sin depender de un conjunto fijo de etiquetas predefinidas. La arquitectura es isomórfica a la de un LLM autorregresivo estándar, lo que facilita su despliegue con motores de inferencia como SGLang, heredando optimizaciones como continuous batching, paged KV cache, CUDA graph replay y RadixAttention.

## Capacidades

- Generación de voz natural y expresiva en más de 80 idiomas, con soporte prioritario para japonés, inglés y chino (Tier 1), seguido de coreano, español, portugués, árabe, ruso, francés y alemán (Tier 2).
- Control fino de prosodia y emoción mediante etiquetas inline en lenguaje natural, como `[whisper in small voice]`, `[professional broadcast tone]` o `[pitch up]`, con más de 15.000 etiquetas únicas soportadas.
- Generación multi-locutor y multi-turno (multi-speaker multi-turn generation), según la descripción oficial, lo que permite mantener voces consistentes en diálogos largos.
- Inferencia en streaming de baja latencia: time-to-first-audio de aproximadamente 100 ms y throughput superior a 3.000 tokens acústicos por segundo en una GPU H200, manteniendo un factor de tiempo real (RTF) inferior a 0,5.
- Soporte de instrucciones de seguimiento (instruction-following) para controlar estilo, tono, volumen, pausas, risa, canto, etc., directamente en el texto de entrada.
- Compatibilidad con el ecosistema Fish Speech (GitHub) y el playground de Fish Audio para experimentación.

## Casos de uso

- Audiolibros y narración: el modelo puede generar narraciones con control de ritmo y emoción mediante etiquetas como `[whisper]` o `[excited]`, permitiendo adaptar la voz a diferentes escenas y personajes sin postprocesado adicional.
- Asistentes de voz y agentes conversacionales: gracias a su baja latencia (time-to-first-audio ~100 ms) y su capacidad multi-turno, es adecuado para integrarse en asistentes virtuales, chatbots con voz o IVR, manteniendo una conversación fluida y natural.
- Doblaje y localización de vídeo: al soportar más de 80 idiomas y control expresivo fino, puede utilizarse para doblar contenido audiovisual (películas, series, vídeos corporativos) con instrucciones de emoción y tono específicas por línea de diálogo.
- Generación de contenido para redes sociales: creadores de contenido pueden producir voces en off con estilos variados (por ejemplo, `[professional broadcast tone]` o `[laughing]`) para vídeos de TikTok, YouTube o podcasts, sin necesidad de estudio de grabación.
- Accesibilidad y lectura de pantalla: el modelo puede convertir texto en voz para personas con discapacidad visual, ofreciendo control de velocidad, volumen y emoción para mejorar la comprensión y la experiencia de usuario.
- Prototipado y desarrollo de productos de voz: los desarrolladores pueden generar muestras de voz realistas para pruebas de concepto, demos o validación de interfaces de voz antes de invertir en grabaciones profesionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks tradicionales (como MMLU o HumanEval) en la información disponible, ya que se trata de un modelo de síntesis de voz, no de un LLM de propósito general. Sin embargo, la model card proporciona métricas de rendimiento en producción medidas en una GPU NVIDIA H200:

| Metrica | Valor |
|---|---|
| Real-Time Factor (RTF) | 0,195 |
| Time-to-first-audio | ~100 ms |
| Throughput | 3.000+ tokens acústicos/s (manteniendo RTF < 0,5) |

Estas cifras indican que el modelo es capaz de generar audio más rápido que en tiempo real, con una latencia inicial muy baja, lo que lo hace apto para aplicaciones interactivas de streaming.

## Requisitos de hardware

- VRAM estimada: con 4.561.852.416 parámetros, el modelo en precisión FP16/BF16 ocuparía aproximadamente 9-10 GB de VRAM. El repositorio pesa 11 GB, lo que sugiere pesos en FP16 o BF16. No se han publicado versiones cuantizadas oficiales, por lo que la VRAM necesaria para inferencia sin cuantización sería de al menos 10-12 GB.
- GPU recomendadas: para producción con streaming de baja latencia, la model card menciona una NVIDIA H200. También debería ejecutarse en GPUs de gama alta como A100, RTX 4090 o RTX 6000 Ada (con 24 GB de VRAM) para mayor margen. En GPUs consumer con 12-16 GB (por ejemplo, RTX 3080/4070 Ti) podría funcionar con cuantización, aunque no se han publicado pesos cuantizados.
- Opciones de despliegue: el modelo está diseñado para integrarse con SGLang como motor de inferencia, aprovechando sus optimizaciones de batching y caching. También se puede utilizar el repositorio Fish Speech (GitHub) para fine-tuning e inferencia local. No se menciona compatibilidad con vLLM, Ollama o llama.cpp.
- Latencia y throughput: en una H200, RTF de 0,195 (genera 1 segundo de audio en ~0,2 segundos) y time-to-first-audio de ~100 ms. El throughput máximo es de 3.000+ tokens acústicos/s manteniendo RTF < 0,5.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. Sin embargo, se pueden establecer comparaciones cualitativas con otros modelos TTS de código abierto y propietarios:

| Modelo | Parametros | Idiomas | Control expresivo | Licencia |
|---|---|---|---|---|
| Fish Audio S2 Pro | 4,56B | 80+ | Sí (etiquetas inline, 15.000+) | Fish Audio Research License (no comercial) |
| XTTS v2 (Coqui) | ~0,9B | 17 | Limitado (speaker embeddings) | CPML (no comercial) |
| Bark (Suno) | ~1,2B | 13 | Limitado (tokens de emoción) | MIT (comercial permitido) |
| ElevenLabs (propietario) | No público | 29 | Sí (estabilidad, similitud) | Comercial de pago |

S2 Pro destaca por su mayor número de parámetros, su soporte de más de 80 idiomas y su control expresivo granular mediante instrucciones de texto, así como por su arquitectura dual-autorregresiva optimizada para streaming. Sin embargo, la licencia restringe el uso comercial sin permiso explícito de Fish Audio, a diferencia de alternativas como Bark.

## Limitaciones y advertencias

- Licencia restringida: el modelo se distribuye bajo la Fish Audio Research License, que permite uso no comercial gratuito. Cualquier uso comercial requiere una licencia separada de Fish Audio (contactar en business@fish.audio). No se puede utilizar para generar contenido que viole DMCA o leyes locales, según el aviso de la model card.
- Sesgos y calidad variable por idioma: aunque soporta más de 80 idiomas, la calidad puede ser inferior en idiomas de niveles inferiores (Tier 3 y más allá) en comparación con los de Tier 1 y Tier 2. No se han publicado evaluaciones de sesgo o robustez.
- Riesgo de alucinación acústica: como modelo generativo, puede producir artefactos de audio, pronunciaciones incorrectas o entonaciones no deseadas, especialmente con textos complejos o poco comunes. Se recomienda validar la salida en aplicaciones críticas.
- Limitaciones de contexto: no se especifica una longitud máxima de contexto de texto; aunque el modelo soporta generación multi-turno, no hay datos sobre límites de duración de audio o número de tokens de entrada.
- Dependencia de infraestructura: el rendimiento de streaming (RTF 0,195, TTFA ~100 ms) se midió en una GPU H200; en hardware inferior, la latencia y el throughput pueden degradarse significativamente.
- Ausencia de cuantizaciones oficiales: no se han publicado versiones cuantizadas (GGUF, AWQ, etc.), lo que limita su despliegue en entornos con restricciones de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jitendra6371/s2-pro
- Repositorio Fish Speech (GitHub): https://github.com/fishaudio/fish-speech
- Playground de Fish Audio: https://fish.audio
- Blog y reporte técnico: https://fish.audio/blog/fish-audio-open-sources-s2/
- Paper técnico (arXiv 2603.08823): https://arxiv.org/abs/2603.08823
