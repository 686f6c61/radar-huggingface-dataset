# musafa901/Fishaudio_s2-pro

## Resumen

Fish Audio S2 Pro es un modelo de síntesis de voz (text-to-speech) desarrollado por Fish Audio, presentado en marzo de 2026. Está diseñado para generar audio hablado con control fino de prosodia y emoción mediante instrucciones en lenguaje natural incrustadas en el texto. Se entrena con más de 10 millones de horas de audio en más de 80 idiomas, lo que lo convierte en una de las soluciones TTS multilingües más completas disponibles en código abierto.

El modelo combina una arquitectura dual-autorregresiva (Dual-AR) con un codec de audio basado en RVQ de 10 codebooks y una tasa de fotogramas de aproximadamente 21 Hz. El componente "Slow AR" de 4 mil millones de parámetros predice el codebook semántico principal a lo largo del eje temporal, mientras que el "Fast AR" de 400 millones de parámetros genera los 9 codebooks residuales restantes. Esta separación asimétrica permite una inferencia eficiente sin sacrificar la fidelidad acústica.

La relevancia actual de S2 Pro radica en su capacidad para aceptar descripciones libres de estilo (como `[whisper in small voice]` o `[professional broadcast tone]`) directamente en el texto, lo que permite un control expresivo a nivel de palabra sin depender de un conjunto fijo de etiquetas. Además, al ser estructuralmente isomorfo a los LLM autorregresivos estándar, hereda todas las optimizaciones de inferencia de SGLang, incluyendo batching continuo, caché KV paginada y reutilización de prefijos RadixAttention, lo que facilita su despliegue en producción con baja latencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con arquitectura Dual-AR (Slow AR + Fast AR) sobre codec RVQ de 10 codebooks |
| Parametros totales | 4.561.852.416 (según safetensors; compuesto por 4B en Slow AR y 400M en Fast AR) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (existe una versión INT8 de terceros para AMD ROCm) |
| Idiomas soportados | 80+ (Tier 1: ja, en, zh; Tier 2: ko, es, pt, ar, ru, fr, de; y otros 70+ idiomas) |
| Licencia | Fish Audio Research License (uso no comercial gratuito; uso comercial requiere licencia separada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

S2 Pro se basa en un transformer decoder-only combinado con un codec de audio RVQ de 10 codebooks y una tasa de fotogramas de ~21 Hz. La arquitectura Dual-AR divide la generación en dos flujos: el Slow AR (4B parámetros) opera a lo largo del eje temporal y predice el codebook semántico principal; el Fast AR (400M parámetros) genera los 9 codebooks residuales en cada paso temporal, reconstruyendo el detalle acústico fino. Esta división asimétrica reduce el coste computacional en comparación con un modelo único que prediga los 10 codebooks simultáneamente.

El entrenamiento se realizó con más de 10 millones de horas de audio en más de 80 idiomas, e incorpora un alineamiento mediante aprendizaje por refuerzo (reinforcement learning alignment). La arquitectura es estructuralmente isomorfa a los LLM autorregresivos estándar, lo que permite aprovechar todas las optimizaciones de SGLang: batching continuo, caché KV paginada, replay de grafos CUDA y caché de prefijos RadixAttention. Esto hace que el modelo sea directamente desplegable en infraestructuras de inferencia LLM existentes.

El control fino de prosodia y emoción se logra mediante etiquetas textuales libres incrustadas en el texto, como `[whisper]`, `[laughing]`, `[pitch up]` o `[professional broadcast tone]`. El modelo admite más de 15.000 etiquetas únicas, lo que permite una expresividad granular sin necesidad de un vocabulario cerrado.

## Capacidades

- Generación de voz natural multilingüe en más de 80 idiomas, con especial calidad en japonés, inglés y chino (Tier 1), seguido de coreano, español, portugués, árabe, ruso, francés y alemán (Tier 2).
- Control fino de prosodia y emoción mediante instrucciones en lenguaje natural incrustadas en el texto con sintaxis `[tag]`, permitiendo ajustes locales (a nivel de palabra o frase) de tono, volumen, velocidad, respiración, risa, canto, etc.
- Soporte de instrucciones de estilo libre, sin limitarse a un conjunto predefinido de etiquetas; el modelo interpreta descripciones textuales abiertas como `[whisper in small voice]` o `[excited tone]`.
- Generación multi-locutor y multi-turno: el modelo puede mantener consistencia de voz a lo largo de conversaciones y alternar entre distintos hablantes.
- Inferencia en streaming de baja latencia: gracias a la arquitectura Dual-AR y la integración con SGLang, alcanza un tiempo hasta el primer audio de ~100 ms y un factor de tiempo real (RTF) de 0.195 en una GPU H200.
- Alineación mediante aprendizaje por refuerzo, lo que mejora la naturalidad y la adherencia a las instrucciones de control.

## Casos de uso

- Audiolibros y narración expresiva: el control fino de emoción y prosodia permite generar narraciones con matices dramáticos, diferenciando voces de personajes y aplicando tonos específicos en diálogos.
- Asistentes de voz multilingües: con soporte para más de 80 idiomas, puede utilizarse como motor TTS en asistentes virtuales que atienden a usuarios de distintas regiones, manteniendo naturalidad en cada idioma.
- Doblaje y localización de contenido audiovisual: la capacidad de imitar estilos de locución (por ejemplo, `[professional broadcast tone]`) y de generar múltiples turnos con voces consistentes lo hace adecuado para doblaje de vídeos, series o podcasts.
- Generación de contenido para marketing y publicidad: se pueden crear cuñas publicitarias con distintos tonos (entusiasta, serio, susurrante) sin necesidad de grabar locuciones reales.
- Herramientas de accesibilidad: síntesis de voz de alta calidad para lectores de pantalla, con control de velocidad y énfasis para mejorar la comprensión en personas con discapacidad visual.
- Desarrollo de videojuegos: generación dinámica de diálogos de personajes con emociones variables (ira, sorpresa, risa) en tiempo real, integrable en motores de juego mediante la API de streaming.
- Educación y e-learning: creación de lecciones de idiomas con pronunciación natural y control de entonación, así como generación de ejercicios de comprensión auditiva en múltiples idiomas.
- Producción musical y creativa: el modo canto (`[singing]`) y las etiquetas de efectos como `[echo]` o `[audience laughter]` permiten experimentar con voces sintéticas en demos musicales o sketches de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas estándar como MOS (Mean Opinion Score), MMLU o similares. Los únicos datos de rendimiento proporcionados son:

| Metrica | Valor |
|---|---|
| Real-Time Factor (RTF) en H200 | 0.195 |
| Tiempo hasta el primer audio | ~100 ms |
| Throughput | 3.000+ tokens acústicos/s manteniendo RTF < 0.5 |

Estos valores se refieren al rendimiento de inferencia en producción, no a calidad de voz.

## Requisitos de hardware

- No se especifica la VRAM mínima oficial. Con 4.56 mil millones de parámetros en precisión FP16, el peso del modelo ocupa aproximadamente 9,1 GB, por lo que se estima que una GPU con al menos 12-16 GB de VRAM podría ejecutar la inferencia sin cuantización, aunque no hay confirmación oficial.
- La model card indica que el rendimiento de streaming (RTF 0.195, primer audio ~100 ms) se logra en una NVIDIA H200, lo que sugiere que GPUs de gama alta de centro de datos son recomendables para despliegues de baja latencia.
- Para uso en GPUs de consumo (RTX 4090, RTX 3090, etc.), se necesitaría cuantización (por ejemplo, INT8) o técnicas de offloading. Existe una versión cuantizada INT8 mantenida por Imagilux que añade soporte AMD ROCm, gestión de VRAM y offloading a CPU.
- Opciones de despliegue: el modelo se integra con SGLang para inferencia en streaming, y el repositorio oficial Fish Speech incluye código de inferencia y fine-tuning. También se puede utilizar con llama.cpp u Ollama si se convierten los pesos a GGUF, aunque no hay soporte oficial documentado.
- La latencia y throughput dependen en gran medida del hardware y de la configuración de batching. Los valores publicados (RTF 0.195, 3.000+ tokens/s) son orientativos para una H200 con SGLang.

## Comparativa con modelos similares

No se dispone de datos comparativos cuantitativos con otros modelos TTS open-source en la información proporcionada. Modelos como XTTS-v2, Bark, VITS o Tortoise-TTS son alternativas en el espacio, pero no se han publicado comparaciones de calidad o rendimiento con S2 Pro. Por tanto, la comparativa se limita a características generales:

| Modelo | Parametros | Idiomas | Control de emocion | Licencia |
|---|---|---|---|---|
| Fish Audio S2 Pro | 4,56B | 80+ | Sí, mediante etiquetas libres | Fish Audio Research License |
| XTTS-v2 | ~467M | 17 | Limitado (no fino) | Coqui Public Model License |
| Bark | ~1.2B | 13 | Sí, mediante tokens de hablante | MIT |
| Tortoise-TTS | ~350M | 1 (inglés) | Limitado | Apache 2.0 |

Esta tabla es orientativa y no refleja rendimiento real. No se han encontrado benchmarks comparativos publicados.

## Limitaciones y advertencias

- La licencia Fish Audio Research License permite uso no comercial gratuito, pero el uso comercial requiere una licencia separada de Fish Audio. Esto puede ser una barrera para empresas que deseen integrar el modelo en productos comerciales.
- La model card incluye una puerta de acceso (gated) que solicita al usuario confirmar que no usará el modelo para generar contenido que viole DMCA o leyes locales, y que el uso será exclusivamente no comercial.
- No se especifica la longitud máxima de contexto ni el comportamiento con entradas muy largas. El modelo está diseñado para generación de voz, por lo que no es adecuado para tareas de comprensión o generación de texto general.
- Aunque soporta más de 80 idiomas, la calidad puede variar significativamente entre idiomas; los idiomas Tier 1 y Tier 2 tienen mejor rendimiento que los demás.
- El control mediante etiquetas libres puede producir resultados inesperados si las instrucciones son ambiguas o excesivamente complejas; se recomienda probar y ajustar las etiquetas para cada caso de uso.
- No se han publicado evaluaciones de sesgos o alucinaciones específicas para este modelo. Como todo sistema TTS, puede generar contenido no deseado si se le pide explícitamente, aunque la puerta de acceso intenta mitigarlo.
- El modelo requiere hardware relativamente potente para inferencia en tiempo real; en GPUs de consumo puede ser necesario cuantizar o reducir la calidad para obtener latencias aceptables.

## Enlaces

- Modelo en Hugging Face (original): https://huggingface.co/fishaudio/s2-pro
- Modelo en Hugging Face (repo del autor de la ficha): https://huggingface.co/musafa901/Fishaudio_s2-pro
- Versión cuantizada INT8 para AMD ROCm: https://huggingface.co/Imagilux/fishaudio-s2-pro
- Modelo en ModelScope: https://modelscope.ai/models/fishaudio/s2-pro
- Repositorio GitHub de Fish Speech: https://github.com/fishaudio/fish-speech
- Página oficial del producto: https://fish.audio/s2/
- Blog y reporte técnico: https://fish.audio/blog/fish-audio-open-sources-s2/
- Paper técnico (arXiv): https://huggingface.co/papers/2603.08823
