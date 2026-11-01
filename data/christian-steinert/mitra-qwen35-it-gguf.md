# christian-steinert/mitra-qwen35-it-GGUF

## Resumen

MITRA-QWEN-IT es un modelo de lenguaje de 9B parámetros especializado en conversaciones sobre estudios budistas y en traducción asistida de lenguas clásicas (sánscrito, tibetano, chino budista y pali). Lo desarrolla el proyecto **buddhist-nlp** en el marco de la iniciativa [Dharmamitra](https://dharmamitra.org) y se construye sobre el modelo base Qwen/Qwen3.5-9B, del que hereda arquitectura, tokenizador y ventana de contexto sin modificaciones. Es el punto de entrada recomendado de la familia mitra para interacción conversacional, frente a la variante `mitra-qwen35-translate`, orientada exclusivamente a traducción.

El repositorio que documenta esta ficha es una **recuantización no oficial** publicada por christian-steinert, que convierte los pesos originales en formato GGUF para su ejecución con llama.cpp, Ollama, LM Studio, KoboldCpp o llama-swap. No aporta pesos nuevos ni receta de entrenamiento propia: su valor está en ofrecer cuatro niveles de cuantización (Q8_0, Q6_K, Q5_K_M y Q4_K_M) que permiten desplegar el modelo desde 5,24 GiB hasta 8,87 GiB, con lo que cabe en GPU de consumo y en CPU.

La relevancia actual del modelo reside en su nicho: es uno de los pocos modelos abiertos con entrenamiento específico para responder preguntas cerradas sobre budismo y para asistir en la traducción de lenguas clásicas asiáticas, un dominio donde los modelos generalistas alucinan con frecuencia terminología y transliteraciones. La licencia Apache-2.0, heredada del release original, facilita su uso comercial y su integración en pipelines de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido lineal + atención completa (`qwen35`), 32 capas |
| Parametros totales | 8.953.803.264 (≈8,95B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M (GGUF) |
| Idiomas soportados | Tibetano (bo), sánscrito (sa), pali (pi), chino (zh), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (los originales en safetensors/bf16 están en el repo base) |

Detalles adicionales de arquitectura: hidden size 4096, intermediate size 12288, 16 cabezas de consulta y 4 de clave/valor, dimensión de cabeza 256, `full_attention_interval = 4`, RoPE parcial (θ = 1e7, factor 0.25), vocabulario de 248.320 tokens y `tie_word_embeddings = false`.

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del base Qwen3.5-9B: un transformer de 32 capas que combina atención lineal con atención completa cada cuatro capas (`full_attention_interval = 4`), lo que reduce el coste computacional en contextos largos manteniendo la calidad de recuperación de información. Emplea RoPE parcial con theta 1e7 y factor 0.25, 16 cabezas de consulta frente a 4 de clave/valor (GQA) y un vocabulario de 248.320 entradas, coherente con el soporte multilingüe del modelo original.

La información disponible no detalla la composición del dataset de ajuste, el número de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO. La model card del repositorio de cuantización remite explícitamente a la card del modelo original de buddhist-nlp como fuente autoritativa para la receta de entrenamiento y las tablas de evaluación. Sí se indica que el modelo **no soporta modo de razonamiento (thinking)**: el chat template de Qwen3.5 incluye una rama de pensamiento que debe desactivarse explícitamente, y el ajuste fino se realizó sobre la rama no-thinking. Tampoco incluye tensores MTP (multi-token prediction), por lo que la decodificación especulativa con MTP requiere una cabeza separada.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, chino, tibetano, sánscrito y pali.
- Preguntas y respuestas cerradas sobre budismo, con conocimiento de terminología, escuelas y textos.
- Traducción y refinamiento de traducciones de lenguas clásicas budistas: sánscrito, tibetano, chino budista y pali.
- Asistencia en transliteración y manejo de términos técnicos con diacríticos (por ejemplo, `śamatha`, `vipaśyanā`).
- Conversación general heredada del base Qwen3.5-9B, aunque el ajuste está orientado al dominio budista.
- Modo de razonamiento: **no soportado**; requiere desactivar thinking en el template.
- Tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades de visión o audio: no disponibles (modelo solo de texto).

## Casos de uso

- **Asistente de estudio para practicantes e investigadores**: el modelo responde preguntas conceptuales sobre doctrina budista (por ejemplo, la diferencia entre śamatha y vipaśyanā) sin necesidad de recuperación externa, gracias al ajuste específico de dominio y a una ventana de 262.144 tokens que permite incluir pasajes extensos de sutras o comentarios en el contexto.
- **Traducción asistida de textos sánscritos y tibetanos**: se integra en un flujo donde el traductor pega un fragmento y solicita una primera versión más una nota sobre términos técnicos; el ajuste sobre lenguas clásicas reduce los errores de transliteración frente a modelos generalistas.
- **Refinamiento de traducciones existentes**: dado un texto original y una traducción candidata, el modelo puede señalar discrepancias terminológicas y proponer alternativas, un uso habitual en proyectos de canon budista digital.
- **Digitalización y catalogación de colecciones**: combinado con OCR, el modelo normaliza y estructura metadatos de manuscritos en tibetano o chino budista, aprovechando su conocimiento del vocabulario especializado.
- **Chatbot de atención para centros y publicaciones budistas**: despliegue con llama-server u Ollama en una GPU de 8-12 GB para responder consultas de visitantes sobre textos, prácticas y terminología, con la ventana de contexto suficiente para conversaciones largas.
- **Herramienta de investigación en filología**: generación de glosas y borradores de notas al pie para ediciones críticas, con la salvedad de que toda salida debe ser revisada por un especialista.
- **Evaluación comparativa de modelos en dominios de bajos recursos**: al ser Apache-2.0 y ejecutable en CPU, sirve como referencia para medir cuánto aporta el ajuste de dominio frente al Qwen3.5-9B base en tareas de lenguas clásicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantización remite a las tablas de evaluación del modelo original en `buddhist-nlp/mitra-qwen35-it`, pero no reproduce sus cifras. No se deben asumir valores de MMLU, HumanEval, GSM8K ni de tareas de traducción sin consultar esa fuente.

## Requisitos de hardware

- **VRAM estimada (solo pesos)**: Q8_0 ≈ 8,87 GiB; Q6_K ≈ 6,85 GiB; Q5_K_M ≈ 6,02 GiB; Q4_K_M ≈ 5,24 GiB.
- **VRAM con caché KV**: a contexto largo la caché domina el presupuesto. El autor recomienda `--cache-type-k q8_0 --cache-type-v q8_0` o reducir `--ctx-size` si no se necesita la ventana completa de 262.144 tokens.
- **GPU recomendadas**: RTX 4090 o A100/H100 para contexto completo y Q8_0; RTX 3060/4060 Ti de 12 GB para Q8_0 con contexto moderado; GPU de 8 GB para Q6_K; CPU o GPU de 6 GB para Q4_K_M.
- **Consumer GPU**: sí, el modelo cabe en tarjetas de 8-12 GB según cuantización y longitud de contexto.
- **Opciones de despliegue**: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, KoboldCpp, llama-swap. Compatible con endpoints tipo OpenAI según los tags del repo.
- **Ajustes obligatorios**: `--reasoning off` y `--chat-template-kwargs '{"enable_thinking": false}'`; sin ambos el modelo no funciona correctamente. No usar `--spec-type draft-mtp` con estos ficheros.
- **Parámetros de muestreo recomendados**: temperature 0.2, top-k 40, top-p 0.1, min-p 0.05, repeat-penalty 1.05.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Formato |
|---|---|---|---|---|---|
| MITRA-QWEN-IT (esta ficha, GGUF) | 8,95B | 262.144 | Budismo y lenguas clásicas | Apache-2.0 | GGUF |
| buddhist-nlp/mitra-qwen35-it (original) | 8,95B | 262.144 | Budismo y lenguas clásicas | Apache-2.0 | safetensors (bf16) |
| buddhist-nlp/mitra-qwen35-translate | no disponible | no disponible | Traducción exclusivamente | no disponible | no disponible |
| Qwen/Qwen3.5-9B (base) | ≈9B | 262.144 | Generalista | Apache-2.0 | safetensors, GGUF |

El principal término de comparación es el propio Qwen3.5-9B: misma arquitectura y contexto, pero sin ajuste de dominio budista. La variante `mitra-qwen35-translate` comparte base y familia, pero está pensada solo para traducción, por lo que el modelo de esta ficha es preferible para diálogo. No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- **Modo thinking obligatoriamente desactivado**: si no se pasan `--reasoning off` y `--chat-template-kwargs '{"enable_thinking": false}'`, el modelo produce salidas incorrectas. Es la advertencia más crítica de la model card.
- **Sin tensores MTP**: no admite decodificación especulativa MTP con estos ficheros; se requiere una cabeza separada (`christian-steinert/mtp-Qwen3.5-9B-GGUF`).
- **Riesgo de alucinación en terminología**: pese al ajuste de dominio, las citas textuales, referencias a textos y atribuciones pueden ser inexactas; en filología y traducción se impone revisión humana.
- **Repeticiones en transliteraciones largas**: el autor recomienda `repeat-penalty 1.05` para suprimir bucles de repetición en transliteraciones poco frecuentes.
- **Cobertura idiomática limitada**: los idiomas declarados son bo, sa, pi, zh y en; no se garantiza un rendimiento equivalente en otras lenguas, incluido el español.
- **Recuantización no oficial**: estos GGUF los publica un tercero, no buddhist-nlp; para resultados de evaluación y receta de entrenamiento hay que remitirse al repo original.
- **Licencia**: Apache-2.0 permite uso comercial, pero el proyecto solicita (no exige) citar a Dharmamitra/MITRA con enlace a dharmamitra.org.
- **Contexto largo y VRAM**: usar la ventana completa de 262.144 tokens exige cuantizar la caché KV o disponer de GPU de gama alta; en consumer GPU conviene reducir `--ctx-size`.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/christian-steinert/mitra-qwen35-it-GGUF
- Modelo original: https://huggingface.co/buddhist-nlp/mitra-qwen35-it
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Proyecto Dharmamitra: https://dharmamitra.org
- Cabeza MTP opcional: https://huggingface.co/christian-steinert/mtp-Qwen3.5-9B-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
