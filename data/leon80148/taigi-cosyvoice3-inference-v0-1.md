# leon80148/taigi-cosyvoice3-inference-v0.1

## Resumen

Taigi CosyVoice3 Inference v0.1 es un conjunto de pesos de inferencia para síntesis de voz (text-to-speech) en taiwanés (taigi, código ISO `nan`), derivado del modelo upstream CosyVoice3 de FunAudioLLM. Lo publica el usuario leon80148 como material experimental de investigación, acompañando a una demo de clonación de voz alojada en Hugging Face Spaces. El repositorio contiene únicamente los pesos del modelo de lenguaje fusionados; el adaptador LoRA en formato tensor-only se distribuye por separado y no se incluyen ni el dataset de entrenamiento ni las grabaciones originales.

El modelo resuelve un problema concreto y poco cubierto: la síntesis de voz en una lengua minoritaria con escasa representación en los corpus TTS comerciales. Al partir de CosyVoice3, hereda la arquitectura y las capacidades del modelo base, y añade un ajuste específico para taiwanés mediante LoRA fusionado. El resultado es un checkpoint de aproximadamente 2,6 GB orientado a experimentación, no a producción.

Es relevante ahora porque la disponibilidad de TTS de calidad para lenguas minoritarias sigue siendo muy limitada, y este tipo de publicaciones permite a investigadores evaluar la viabilidad de adaptar modelos multilingües grandes a variedades lingüísticas de bajos recursos. La licencia es de uso exclusivamente investigador (`research-use-notice`), lo que restringe explícitamente su explotación comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de CosyVoice3 (modelo upstream FunAudioLLM/Fun-CosyVoice3-0.5B-2512); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | No disponible (el nombre del upstream sugiere ~0,5B, dato no confirmado para este checkpoint) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Taiwanés (`nan`) |
| Licencia | `research-use-notice` (uso exclusivamente investigador; ver LICENSE del repo) |
| Formato de pesos | Pesos fusionados (merged language-model weights); formato de fichero concreto no disponible |
| Tamano del repositorio | 2,6 GB |
| Pipeline | text-to-speech |
| Fecha de creacion | 2026-11-12 |

## Arquitectura y entrenamiento

El checkpoint se describe como los pesos del modelo de lenguaje fusionados ("merged language-model weights") necesarios para la demo Taigi Speech v0.1. La arquitectura subyacente es la de CosyVoice3, el modelo TTS de FunAudioLLM referenciado como upstream (`Fun-CosyVoice3-0.5B-2512`). La adaptación al taiwanés se realizó mediante un LoRA que se ha fusionado en los pesos base; el adaptador original en formato tensor-only se publica en un repositorio aparte (`taigi-cosyvoice3-lora-v0.1`).

No se proporciona información sobre el volumen de datos de entrenamiento, la composición del corpus, el número de tokens, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas de esta adaptación más allá del ajuste LoRA para la lengua destino. La model card advierte que la pronunciación y la similitud de la voz pueden variar, lo que sugiere un ajuste con datos limitados y sin validación exhaustiva.

## Capacidades

- Síntesis de voz (text-to-speech) en taiwanés (`nan`).
- Clonación de voz: la demo asociada se presenta como voice-clone, por lo que el modelo admite condicionamiento sobre una muestra de referencia del hablante.
- Adaptación específica a una lengua minoritaria mediante LoRA fusionado sobre CosyVoice3.
- Capacidades heredadas del modelo base CosyVoice3 no documentadas en esta model card.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni otras capacidades de texto.
- No se documentan modos especiales (thinking, visión, audio de entrada) más allá de la propia tarea TTS.

## Casos de uso

- Investigación en TTS para lenguas minoritarias: sirve como punto de partida reproducible para estudiar la adaptación de modelos multilingües al taiwanés, comparando el efecto del LoRA fusionado frente al adaptador separado.
- Evaluación de clonación de voz en condiciones de bajos recursos: permite medir la similitud de hablante y la inteligibilidad en una lengua con pocos datos, usando la demo pública como referencia.
- Prototipado de asistentes de voz en taiwanés: para proyectos de investigación que necesiten generar audio sintético en esta variedad sin depender de servicios comerciales.
- Docencia y demostraciones académicas: adecuado para ilustrar pipelines de ajuste fino con LoRA sobre modelos TTS preentrenados.
- Preservación y documentación lingüística experimental: generación de muestras sintéticas para estudios fonéticos preliminares, siempre con validación por hablantes nativos.
- Benchmarking de TTS multilingüe: como baseline específico de taiwanés en comparativas de inteligibilidad y naturalidad frente a modelos multilingües genéricos.
- No se recomienda su uso en producción comercial ni en aplicaciones sensibles (ver limitaciones), dada la licencia y el carácter experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio ocupa 2,6 GB, por lo que en FP16 los pesos rondarían ese orden de magnitud y cabrían en GPUs de consumo con 8 GB o más, aunque esta estimación no está confirmada por el autor.
- GPU recomendadas: no disponible. Por tamaño, una RTX 3060/4060 Ti o superior podría ser suficiente para inferencia en precisión nativa; A100/H100 no serían necesarias salvo para procesamiento por lotes.
- Compatibilidad con GPU de consumo: probable según el tamaño del checkpoint, sin confirmación oficial.
- Opciones de despliegue: no se documentan; al derivar de CosyVoice3, cabría esperar compatibilidad con el stack de inferencia de FunAudioLLM, pero no está verificado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| Taigi CosyVoice3 Inference v0.1 | No disponible (~0,5B segun upstream) | Taiwanés (`nan`) | `research-use-notice` | Pesos fusionados en HF, 2,6 GB |
| FunAudioLLM/Fun-CosyVoice3-0.5B-2512 | ~0,5B (segun nombre) | Multilingüe (segun upstream) | No disponible en esta ficha | Upstream público en HF |
| leon80148/taigi-cosyvoice3-lora-v0.1 | Adaptador LoRA (tensor-only) | Taiwanés (`nan`) | No disponible en esta ficha | Repositorio separado en HF |

No se dispone de datos de rendimiento comparativo entre estas variantes ni frente a otros modelos TTS de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Carácter experimental explícito: el autor advierte que la pronunciación y la similitud de voz pueden presentar errores.
- Licencia `research-use-notice`: restringe el uso a investigación; no apta para explotación comercial sin revisar el fichero LICENSE, que además menciona limitaciones de derechos de terceros.
- Posibles sesgos derivados de los datos de ajuste (no documentados): acento, registro y características de los hablantes de referencia pueden no representar la diversidad del taiwanés.
- Riesgo de alucinación acústica y artefactos en la síntesis, habitual en TTS ajustado con pocos datos.
- Cobertura limitada a un único idioma (`nan`); no se documenta multilingüismo efectivo.
- No se incluyen dataset ni grabaciones, lo que dificulta la auditoría del proceso de entrenamiento y la reproducibilidad.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.
- Riesgo ético en clonación de voz: requiere consentimiento explícito de los hablantes y cumplimiento de la normativa aplicable sobre síntesis de voz.
- Sin soporte documentado de despliegue en producción (vLLM, TGI, etc.) ni garantías de latencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leon80148/taigi-cosyvoice3-inference-v0.1
- Adaptador LoRA v0.1: https://huggingface.co/leon80148/taigi-cosyvoice3-lora-v0.1
- Demo de clonación de voz: https://huggingface.co/spaces/leon80148/taigi-cosyvoice3-voice-clone
- Modelo upstream CosyVoice3: https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- Licencia del repositorio: https://huggingface.co/leon80148/taigi-cosyvoice3-inference-v0.1/blob/main/LICENSE
