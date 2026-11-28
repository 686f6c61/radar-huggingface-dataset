# OpenMOSS-Team/MOSS-TTS-Realtime

## Resumen

MOSS-TTS-Realtime es un modelo de síntesis de voz (text-to-speech) en streaming, consciente del contexto y orientado a agentes de voz en tiempo real. Lo desarrolla el equipo OpenMOSS (MOSS AI / OpenMOSS), y forma parte de la familia MOSS-TTS, que descompone el flujo de producción de audio en cinco modelos especializados: TTS general, TTSD para diálogo, VoiceGenerator para diseño de voces, SoundEffect para efectos de sonido y este Realtime para interacción conversacional de baja latencia. El modelo resuelve el problema de mantener una voz coherente y natural a lo largo de múltiples turnos de conversación, condicionándose tanto en el historial textual del diálogo como en la acústica previa del usuario.

Técnicamente es un modelo de 2.331.940.864 parámetros (aproximadamente 2,3B) con arquitectura propietaria MossTTSRealtime, implementada mediante código personalizado sobre la librería `transformers`. Se distribuye en formato safetensors con un repositorio de 4,7 GB y licencia Apache 2.0, lo que facilita su uso comercial. Soporta 20 idiomas, entre ellos castellano, inglés, chino, alemán, francés, japonés, italiano, coreano, ruso, árabe, portugués y polaco, entre otros.

Su relevancia actual radica en que cubre un nicho poco servido por los modelos TTS abiertos: la síntesis por turnos con memoria acústica y textual, pensada para agentes conversacionales, asistentes de voz y sistemas de atención telefónica donde la latencia y la consistencia de la voz entre intervenciones son críticos. Se apoya en la investigación del paper MOSS-Audio-Tokenizer (arXiv:2602.10934) sobre tokenizadores de audio a escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MossTTSRealtime (transformer con código personalizado, pipeline text-to-speech) |
| Parametros totales | 2.331.940.864 (aprox. 2,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh, en, de, es, fr, ja, it, he, ko, ru, fa, ar, pl, pt, cs, da, sv, hu, el, tr (20 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card identifica la arquitectura como MossTTSRealtime, un modelo de síntesis de voz en streaming construido sobre la familia MOSS-TTS. El modelo se condiciona en el historial de diálogo, tanto en el texto previo como en la acústica de las intervenciones anteriores del usuario, lo que le permite generar respuestas de voz coherentes y consistentes a lo largo de varios turnos. Esta combinación de contexto textual y acústico es la innovación diferencial frente a los TTS de un solo turno.

El modelo se apoya en la investigación del paper MOSS-Audio-Tokenizer: Scaling Audio Tokenizers for Future Audio Foundation Models (arXiv:2602.10934), centrado en tokenizadores de audio escalables para modelos fundacionales de audio. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz en streaming de baja latencia, orientada a agentes de voz en tiempo real.
- Condicionamiento multi-turno: usa el historial textual del diálogo y la acústica previa del usuario para mantener coherencia de voz entre turnos.
- Soporte de 20 idiomas, incluido castellano, con capacidad de cambio de código (code-switching) según la descripción de la familia MOSS-TTS.
- Generación de voz consistente a lo largo de conversaciones, evitando deriva de timbre entre respuestas.
- Integración con la librería `transformers` mediante código personalizado (`trust_remote_code`).
- Capacidad de formar parte de una pipeline más amplia de la familia MOSS-TTS (TTS general, diálogo, diseño de voz, efectos de sonido).
- No se documentan en la información disponible capacidades de tool calling, agentes multi-step, visión ni audio de entrada más allá del condicionamiento acústico descrito.

## Casos de uso

- Agentes de voz conversacionales: el modelo puede gestionar diálogos multi-turno manteniendo una voz coherente entre intervenciones gracias a su condicionamiento en el historial textual y acústico, lo que lo hace adecuado para asistentes telefónicos y chatbots de voz.
- Atención al cliente automatizada: la síntesis en streaming de baja latencia permite respuestas habladas naturales en sistemas IVR y centros de contacto, con consistencia de voz a lo largo de la conversación.
- Asistentes de voz embebidos en aplicaciones: al ser un modelo de ~2,3B parámetros con licencia Apache 2.0, puede desplegarse en infraestructura propia para productos de voz en castellano y otros 19 idiomas.
- Doblaje y locución interactiva: la coherencia multi-turno y el soporte multilingüe permiten generar diálogos doblados donde la voz se mantiene estable entre réplicas.
- Sistemas de accesibilidad: lectura en voz alta interactiva para personas con discapacidad visual, con respuestas contextualizadas a las preguntas del usuario.
- Prototipado de productos de voz: su tamaño moderado y licencia permisiva facilitan la experimentación e integración en pipelines de desarrollo sin costes de licencia.
- Educación y tutores conversacionales: diálogos hablados multi-turno donde la consistencia de la voz y la naturalidad son importantes para la experiencia del estudiante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo de ~2,3B parámetros, una estimación orientativa en fp16 sería de aproximadamente 4,7 GB solo para pesos, más memoria para activaciones y el tokenizador de audio; en cuantizaciones de 8 bits o 4 bits el requisito sería considerablemente menor, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría esperar ejecución en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 3090/4090 de 24 GB) y en GPUs de datacenter (A100, H100) para despliegues concurrentes, pero no se confirma oficialmente.
- ¿Cabe en GPU de consumo? Probablemente sí en GPUs con 8-24 GB de VRAM según precisión, pero no se dispone de confirmación oficial.
- Opciones de despliegue: la model card indica integración con `transformers` mediante código personalizado. No se documentan en la información disponible soportes específicos de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. La model card describe el modelo como de "baja latencia" para streaming, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| MOSS-TTS-Realtime | ~2,3B | no disponible | 20 | Apache 2.0 | TTS en streaming multi-turno para agentes de voz |
| MOSS-TTS | 8B | no disponible | 20 | no disponible en la información | TTS fundacional con clonación zero-shot |
| MOSS-TTS-Local-Transformer | 1,7B | no disponible | no disponible | no disponible en la información | Variante local de TTS |
| MOSS-TTSD-v1.0 | 8B | no disponible | 20 | no disponible en la información | Diálogo multi-hablante de formato largo |

No se dispone en la información proporcionada de datos de rendimiento comparativo (benchmarks) entre estos modelos ni con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- No se documentan en la información disponible sesgos conocidos del modelo; al ser un modelo TTS, puede reflejar sesgos acústicos y de pronunciación presentes en sus datos de entrenamiento.
- Riesgo de alucinación en el sentido de pronunciación incorrecta, entonación inadecuada o generación de audio no solicitado; no se aportan tasas de error.
- La longitud de contexto no está documentada, por lo que se desconoce el límite práctico de historial de diálogo que el modelo puede aprovechar.
- Aunque soporta 20 idiomas, no se detalla la calidad relativa por idioma; el castellano figura entre los soportados, pero sin métricas.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene revisar las condiciones de los papers y recursos asociados citados en la model card.
- Requiere `trust_remote_code` al usar código personalizado en `transformers`, lo que implica ejecutar código del autor; debe auditarse en entornos de producción.
- No se documentan cuantizaciones oficiales ni soporte confirmado en motores de inferencia de alto rendimiento, lo que puede limitar el despliegue a gran escala.

## Enlaces

- Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Realtime
- Web oficial MOSS AI: https://www.moss-ai.com/models/moss-tts-streaming
- Repositorio GitHub del proyecto: https://github.com/OpenMOSS/MOSS-TTS/tree/main
- Model card detallada (GitHub): https://github.com/OpenMOSS/MOSS-TTS/blob/main/docs/moss_tts_realtime_model_card.md
- Colección en ModelScope: https://modelscope.cn/collections/OpenMOSS-Team/MOSS-TTS
- Paper MOSS-Audio-Tokenizer (arXiv:2602.10934): https://huggingface.co/papers/2602.10934
- Paper arXiv:2603.18090: https://arxiv.org/abs/2603.18090
- Twitter/X de OpenMOSS: https://x.com/Open_MOSS
- Discord: https://discord.gg/fvm5TaWjU3
