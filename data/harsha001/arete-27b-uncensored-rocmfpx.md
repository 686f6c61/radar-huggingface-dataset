# Harsha001/Arete-27B-Uncensored-ROCmFPX

## Resumen

Arete-27B-Uncensored-ROCmFPX es un conjunto de cuantizaciones GGUF del modelo SargeDev/Arete-27B-Uncensored, publicado por el usuario Harsha001. El modelo original es un fine-tune completo de Qwen3.8-27B realizado por Nous Research, al que SargeDev aplicó OBLITERATUS para eliminar la dirección de rechazo (abliteration) y añadió la cabeza de predicción multi-token (MTP) estándar de Qwen3.8. Este repositorio no contiene pesos nuevos, sino versiones cuantizadas en formato ROCmFPX, un formato propietario orientado a hardware AMD (Strix Halo, ROCm, Vulkan).

La relevancia de esta ficha es doble: por un lado, documenta una cuantización de 27.320 millones de parámetros con licencia Apache-2.0 y ventana de contexto heredada de Qwen3.8; por otro, advierte de que los ficheros ROCmFPX requieren un fork específico de llama.cpp (HarshaVardhan3002/ROCmFPX, compilado a partir del 7 de noviembre de 2026) y no cargan en llama.cpp estándar, LM Studio, Ollama ni versiones antiguas del fork. El autor indica además que los ficheros no han sido probados en hardware AMD real.

El modelo está pensado para generación de texto en inglés, con capacidades de razonamiento (thinking mode heredado de Qwen3.8) y sin entrenamiento de seguridad. Su uso comercial está permitido por la licencia Apache-2.0, pero la ausencia de rechazo implica que el despliegue en producción exige capas de moderación propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.8) con cabeza MTP de una capa añadida por SargeDev |
| Parametros totales | 27.320.698.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3.8-27B) |
| Tipos de cuantizacion | Q8_0 ROCmFPX (8 bits), Q6_0 ROCmFPX (6 bits), Q4_0 ROCMFP4_STRIX_O8 (4 bits, ROCmFP4-FAST con atención y salida en 8 bits) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (variantes ROCmFPX) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.8-27B, un transformer decoder-only de 27.320 millones de parámetros. Nous Research realizó un fine-tune completo alineado con valores sobre esa base para producir Arete-27B. Posteriormente, SargeDev aplicó OBLITERATUS, una técnica de abliteration que elimina la dirección de rechazo del modelo, y añadió la cabeza de predicción multi-token (MTP) de una capa que Qwen3.8 incluye de serie. La MTP permite decodificación especulativa nativa, aunque el autor señala que esa cabeza no ha sido probada en estos ficheros.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el fine-tune original de Nous Research. La cuantización ROCmFPX se evaluó con `llama-perplexity --kl-divergence` frente a un GGUF BF16 convertido de los pesos de SargeDev (perplejidad 6,28), sobre 40 fragmentos de 512 tokens de wikitext-2 en inglés y en una GPU NVIDIA GB10 tras expandir cada fichero a F16. Los resultados de divergencia KL y coincidencia de top token se recogen en la sección de benchmarks.

## Capacidades

- Generación de texto en inglés con modo de razonamiento (bloque de pensamiento previo a la respuesta, heredado de Qwen3.8).
- Razonamiento aritmético y de sentido común básico: en pruebas cortas con decodificación greedy, los tres ficheros respondieron 17 × 23 = 391 y "Canberra" como capital de Australia.
- Respuesta a preguntas factuales tras el bloque de pensamiento (verificado con "¿Cuál es la capital de Francia?" en los ficheros de 8 y 6 bits).
- Comportamiento sin rechazo: en una prueba de 10 peticiones que un modelo con entrenamiento de seguridad rechazaría, solo 1 fue rechazada inicialmente, y el modelo terminó respondiendo igualmente.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Visión, audio u otras modalidades: no disponible.
- Decodificación especulativa vía cabeza MTP: presente en los ficheros, pero no probada según el autor.

## Casos de uso

- Generación de texto creativo sin filtros editoriales: el modelo puede producir narrativa, diálogo y contenido largo en inglés sin las restricciones de rechazo de un modelo alineado, lo que encaja en flujos de escritura asistida donde el autor controla el filtrado final.
- Investigación sobre abliteration y seguridad: sirve para estudiar cómo se comporta un modelo de 27B tras eliminar la dirección de rechazo, comparando sus respuestas con las del Arete-27B original y con Qwen3.8-27B.
- Evaluación de cuantizaciones en hardware AMD: los ficheros ROCmFPX (8, 6 y 4 bits) permiten medir la pérdida de calidad (KL, coincidencia de top token) y el rendimiento de los kernels ROCmFP4-FAST en máquinas Strix Halo con 128 GB de memoria unificada.
- Despliegue local en equipos con memoria unificada grande: el fichero Q4 de 19,3 GB y el Q6 de 22,5 GB caben en configuraciones consumer de gama alta o en mini-PC con GPU integrada, siempre que se use el fork ROCmFPX.
- Generación de código y explicaciones técnicas en inglés: el modelo hereda las capacidades de Qwen3.8 en tareas de programación, aunque no se han publicado benchmarks específicos para esta variante.
- Base para fine-tunes posteriores sin restricciones de rechazo: al estar en Apache-2.0 y sin alineamiento de seguridad, puede servir como punto de partida para ajustes orientados a dominios donde el modelo base rechazaría consultas legítimas (por ejemplo, análisis de seguridad ofensiva documentado).
- Pruebas de robustez y red teaming: útil para generar respuestas a peticiones sensibles y evaluar la eficacia de capas de moderación externas antes de un despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye métricas de calidad de cuantización medidas con `llama-perplexity --kl-divergence`:

| Fichero | Tamano | KL a BF16 | Mismo top token |
|---|---:|---:|---:|
| Arete-27B-Uncensored-Q8_0_ROCMFPX.gguf | 28,3 GB | 0,00030 | 99,2 % |
| Arete-27B-Uncensored-Q6_0_ROCMFPX.gguf | 22,5 GB | 0,0021 | 97,6 % |
| Arete-27B-Uncensored-Q4_0_ROCMFP4_STRIX_O8.gguf | 19,3 GB | 0,021 | 93,6 % |

Comparación con cuantizaciones estándar medidas con el mismo método:

| Fichero de referencia | Tamano | KL a BF16 | Mismo top token |
|---|---:|---:|---:|
| Stock Q8_0 | 29,0 GB | 0,00038 | 99,1 % |
| Stock Q6_K | 22,4 GB | 0,0024 | 97,9 % |
| Stock Q4_K_M | 16,8 GB | 0,016 | 94,7 % |

Según el autor, el fichero ROCmFPX de 8 bits se acerca más al BF16 que un Q8_0 estándar y ocupa menos; a 6 bits, el ROCmFPX tiene menor KL por 0,1 GB más, mientras que el Q6_K estándar mantiene ligeramente más a menudo el mismo top token; a 4 bits, el Q4_K_M estándar es más pequeño y algo más fiel, mientras que el fichero Strix aprovecha los kernels FP4 rápidos del fork en AMD y mantiene la atención en 8 bits.

## Requisitos de hardware

- VRAM/memoria estimada: 28,3 GB para Q8_0, 22,5 GB para Q6_0 y 19,3 GB para Q4_0 (tamaños de fichero; la memoria de inferencia añade overhead de contexto y KV cache).
- GPU recomendadas: el autor orienta los ficheros a AMD Strix Halo (128 GB de memoria unificada) y menciona ROCm y Vulkan como backends; las mediciones de KL se hicieron en una NVIDIA GB10.
- Compatibilidad consumer: el Q4 de 19,3 GB puede caber en GPUs consumer de 24 GB (RTX 4090, RTX 3090) y en equipos con memoria unificada amplia; el Q8 de 28,3 GB requiere 32 GB o más de memoria.
- Opciones de despliegue: exclusivamente el fork HarshaVardhan3002/ROCmFPX de llama.cpp (compilado a partir del 7 de noviembre de 2026). llama.cpp estándar, LM Studio, Ollama y versiones antiguas del fork no cargan estos ficheros.
- Latencia y throughput: no disponibles; el autor indica que los ficheros no se han probado aún en hardware AMD y pide reportes en la pestaña Community.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Arete-27B-Uncensored-ROCmFPX (este) | 27,3 B | no disponible | Apache-2.0 | GGUF ROCmFPX | Requiere fork ROCmFPX; sin seguridad; inglés |
| SargeDev/Arete-27B-Uncensored (base) | 27,3 B | no disponible | Apache-2.0 | safetensors (presumible) | Pesos sin cuantizar; sin seguridad |
| NousResearch/Arete-27B (original) | 27,3 B | no disponible | Apache-2.0 | safetensors (presumible) | Fine-tune alineado con valores de Qwen3.8-27B |
| Qwen3.8-27B (base) | 27,3 B | no disponible | Apache-2.0 | safetensors | Modelo base de Qwen con alineamiento estándar |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de entrenamiento de seguridad: la abliteration elimina el rechazo, por lo que el modelo puede cumplir peticiones dañinas, poco éticas, ofensivas o ilegales. El autor exige capas de moderación propias antes de exponerlo a usuarios finales.
- Riesgo de alucinación: no evaluado en la información disponible; es un riesgo inherente a los modelos de 27B sin benchmarks publicados para esta variante.
- Contexto e idioma: solo inglés declarado; la longitud de contexto no se especifica en la model card y debe consultarse en la del modelo base Qwen3.8-27B.
- Compatibilidad de despliegue muy restringida: los ficheros ROCmFPX solo cargan con el fork HarshaVardhan3002/ROCmFPX posterior al 7 de noviembre de 2026; esto rompe la portabilidad habitual de GGUF y dificulta el uso en LM Studio, Ollama o llama.cpp estándar.
- Sin validación en AMD: el autor afirma explícitamente que los ficheros no se han probado en hardware AMD, que es precisamente el objetivo del formato.
- Cabeza MTP no probada: los ficheros incluyen la cabeza de predicción multi-token de una capa, pero no se ha verificado su funcionamiento.
- Pruebas de rechazo limitadas: la comprobación de rechazos se basa en buscar frases de rechazo en los primeros 64 tokens de 18 peticiones, lo que no mide utilidad ni precisión de las respuestas.
- Licencia Apache-2.0: permite uso comercial, pero no exime del cumplimiento legal en la jurisdicción del usuario ni de las responsabilidades sobre el contenido generado.
- Repositorio no oficial: no es un release oficial de Nous Research ni de Qwen; el crédito del modelo corresponde a Nous Research y al equipo de Qwen, y el de la abliteration a SargeDev.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/Arete-27B-Uncensored-ROCmFPX
- Modelo base sin cuantizar: https://huggingface.co/SargeDev/Arete-27B-Uncensored
- Modelo original de Nous Research: https://huggingface.co/NousResearch/Arete-27B
- Fork de llama.cpp requerido: https://github.com/HarshaVardhan3002/ROCmFPX
- Cuantización destacada del mismo autor (DeepSeek-V4.1-Flash en Strix Halo): https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF
