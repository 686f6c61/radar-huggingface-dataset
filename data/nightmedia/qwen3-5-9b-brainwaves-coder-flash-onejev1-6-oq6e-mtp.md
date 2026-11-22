# nightmedia/Qwen3.5-9B-Brainwaves-Coder-Flash-OneJev1.6-oQ6e-mtp

## Resumen

Qwen3.5-9B-Brainwaves-Coder-Flash-OneJev1.6-oQ6e-mtp es un modelo de lenguaje experimental publicado por el usuario nightmedia en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un merge (fusión) de tres modelos derivados de la familia Qwen3.5 de 9B: nightmedia/Qwen3.5-9B-Brainwaves, Jackrong/Qwopus3-5-9B-Coder-Flash y OmniJev/OneJev1.6-9B. El resultado es un modelo multimodal de tipo image-text-to-text con 9.653.104.368 parámetros totales, pesos en bf16 y una licencia Apache 2.0.

El modelo está orientado a razonamiento con cadena de pensamiento larga (long-cot), generación de código, matemáticas, STEM, escritura creativa y roleplay, y declara soporte de multi-token prediction (MTP) con decodificación especulativa. La model card menciona ventanas de contexto de hasta 1M y 256k tokens, aunque no se detalla cómo se consiguen ni si son nativas o heredadas de los modelos base. La variante "oQ6e-mtp" del nombre hace referencia a una cuantización de 6 bits optimizada que, según los datos del autor, mantiene la perplejidad prácticamente idéntica a bf16 con un pico de memoria de 14,29 GB frente a 24,69 GB.

Su relevancia es fundamentalmente práctica y experimental: permite ejecutar un modelo de 9B con capacidades multimodales y de razonamiento en hardware de consumo, con pérdidas de calidad muy reducidas respecto a bf16 según las métricas publicadas. No obstante, se trata de un merge de autor individual, sin paper asociado ni evaluación independiente, por lo que debe tratarse como un artefacto de investigación y no como un modelo listo para producción crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5 (familia qwen3_5), multimodal image-text-to-text; detalles de capas y atención no disponibles |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | la model card declara 1M y 256k tokens; no se especifica configuración nativa ni método de extensión |
| Tipos de cuantizacion | bf16, mxfp8, q8-hi, q6-hi, oQ6e-mtp (6 bits), mxfp4 |
| Idiomas soportados | en, zh, ja, es |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers); el repo ocupa 8,7 GB |

## Arquitectura y entrenamiento

El modelo es un merge realizado con mergekit a partir de tres checkpoints de 9B derivados de Qwen3.5: Qwen3.5-9B-Brainwaves (orientado a razonamiento y escritura), Qwopus3-5-9B-Coder-Flash (especializado en código y destilado de Claude según los tags) y OneJev1.6-9B. Al ser un merge de pesos, no hay un entrenamiento propio documentado: no se especifican tokens de entrenamiento, composición del dataset ni fases de RLHF o DPO para este checkpoint concreto. Los tags indican que los modelos base incorporan destilación, chain-of-thought largo y multi-token prediction.

La innovación técnica declarada es la combinación de multi-token prediction (MTP) con decodificación especulativa, que según las mediciones del autor permite mantener un throughput de 710 tokens/s en la variante oQ6e-mtp frente a 878 tokens/s en bf16, con una perplejidad de 4,101 frente a 4,096 en bf16. El pipeline es image-text-to-text, por lo que el modelo conserva la torre de visión heredada de la familia Qwen3.5, aunque la model card no detalla resolución de imagen, número de tokens visuales ni arquitectura del proyector multimodal.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, chino, japonés y español.
- Razonamiento con cadena de pensamiento larga (long-cot) y modo de razonamiento explícito.
- Generación y comprensión de código, con especialización heredada de Coder-Flash y destilación de Claude.
- Matemáticas y problemas STEM, con resultados altos en GSM8K y MATHQA según el autor.
- Procesamiento de imagen y texto (pipeline image-text-to-text), aunque sin detalles técnicos publicados.
- Escritura creativa: ficción, generación de tramas y subtramas, continuación de escenas, roles y roleplay.
- Multi-token prediction y decodificación especulativa para acelerar la inferencia.
- Soporte declarado de tool calling y function calling (tag endpoints_compatible), sin documentación específica de formato.
- Capacidades de agente y razonamiento multi-paso no documentadas formalmente; se infieren del soporte de tool calling y long-cot.
- Compatibilidad con MLX y oMLX según los tags, además de transformers.

## Casos de uso

- Asistente de código en local: con 9,6B parámetros y cuantización de 6 bits se puede desplegar en una GPU de consumo para autocompletado, revisión de parches y generación de tests, aprovechando la especialización Coder-Flash del merge.
- Razonamiento matemático asistido: para resolver problemas de nivel escolar y universitario paso a paso, con un 96,3% en GSM8K y 90,3% en MATHQA según el autor, útil en herramientas educativas o de verificación de cálculos.
- Escritura creativa y generación de ficción: generación de tramas, subtramas y continuación de escenas con estilo vívido, gracias a la componente Brainwaves del merge; adecuado para herramientas de escritura asistida y prototipado narrativo.
- Roleplay y chatbots de personaje: conversaciones multi-turno con contexto largo declarado (hasta 256k o 1M tokens), útil para demos de agentes conversacionales con memoria extensa.
- Análisis de documentos con imagen y texto: al ser image-text-to-text, puede emplearse para extraer información de capturas, diagramas o documentos escaneados combinados con preguntas en lenguaje natural.
- Evaluación de sesgos y seguridad en pipelines de investigación: los resultados publicados en BBQ (96,7%) y SafetyBench (86,8%) permiten usarlo como sujeto de estudio en auditorías de sesgo, siempre con validación independiente.
- Prototipado de agentes con tool calling: integrable en flujos que requieran llamadas a funciones y razonamiento multi-paso, con la ventaja de ejecutarse en una sola GPU consumer.
- Despliegue en Apple Silicon: los tags MLX y oMLX indican compatibilidad con el stack de Apple para inferencia local en Mac.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Resultado | Notas |
|---|---|---|
| ARC-Challenge | 97,0% | muestra de 300; 2/300 alcanzaron el límite de tokens |
| Winogrande | 85,7% | muestra de 300; 86,0% sobre respuestas finalizadas |
| HumanEval | 79,3% | conjunto completo, 164 problemas |
| TruthfulQA | 78,0% | completo, 817; 81,6% sobre finalizadas |
| SafetyBench | 86,8% | completo, 11.435; 87,7% sobre finalizadas |
| GSM8K | 96,3% | completo, 1.319; 96,9% sobre finalizadas |
| MATHQA | 90,3% | completo, 2.985; 94,7% sobre finalizadas |
| BBQ | 96,7% | completo, 10.864; 97,0% sobre finalizadas |
| HellaSwag | 90,8% | completo, 10.042; 90,9% sobre finalizadas |

Métricas de cuantización (model card):

| Cuantización | Perplejidad | Memoria pico | Tokens/s |
|---|---|---|---|
| bf16 | 4,096 ± 0,026 | 24,69 GB | 878 |
| mxfp8 | 4,106 ± 0,026 | 16,02 GB | 724 |
| q8-hi | 4,098 ± 0,026 | 16,86 GB | 730 |
| q6-hi | 4,101 ± 0,026 | 14,62 GB | 718 |
| oQ6e-mtp | 4,101 ± 0,026 | 14,29 GB | 710 |
| mxfp4 | 4,327 ± 0,028 | 11,55 GB | 727 |

Como referencia, el modelo base Qwen3.5-9B Instruct obtiene en la tabla "brainwaves" del autor valores de ARC en torno a 0,561-0,571 y HellaSwag en torno a 0,683-0,690, muy por debajo de los del merge.

## Requisitos de hardware

- VRAM estimada: 24,69 GB en bf16, 16,02 GB en mxfp8, 16,86 GB en q8-hi, 14,62 GB en q6-hi, 14,29 GB en oQ6e-mtp y 11,55 GB en mxfp4 (datos de memoria pico del autor).
- GPU recomendadas: A100 40/80 GB o H100 para bf16 sin compromisos; RTX 4090 (24 GB) para bf16 justo o cuantizaciones de 8 bits; RTX 3090/4080 (16-24 GB) para q8-hi y q6-hi; GPUs de 12-16 GB para mxfp4.
- Cabe en GPU de consumo: sí, en RTX 4090 con bf16 ajustado o cuantizaciones de 6-8 bits, y en GPUs de 12 GB con mxfp4.
- Opciones de despliegue: transformers (librería declarada), MLX/OMLX para Apple Silicon, y previsiblemente vLLM, llama.cpp u Ollama si se generan pesos GGUF, aunque no se documenta soporte oficial.
- Latencia y throughput: 878 tokens/s en bf16 y 710 tokens/s en oQ6e-mtp según el autor, medidos en hardware no especificado; tómense como orientativos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-9B-Brainwaves-Coder-Flash-OneJev1.6-oQ6e-mtp | 9,65B | 256k/1M declarados | Apache 2.0 | Merge experimental multimodal con MTP |
| Qwen3.5-9B Instruct (base) | ~9B | no disponible | Apache 2.0 (familia Qwen) | Referencia del autor; peor en ARC y HellaSwag según su tabla |
| nightmedia/Qwen3.5-9B-Brainwaves | ~9B | no disponible | Apache 2.0 | Componente del merge, orientado a razonamiento y escritura |
| Jackrong/Qwopus3-5-9B-Coder-Flash | ~9B | no disponible | no disponible | Componente del merge, especializado en código |
| OmniJev/OneJev1.6-9B | ~9B | no disponible | no disponible | Componente del merge |

No se dispone de comparaciones verificadas con modelos de otros autores (Llama, Mistral, Gemma) en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental sin paper, sin revisión por pares y con evaluaciones publicadas únicamente por el autor; los números deben tomarse con cautela.
- Al ser un merge de tres checkpoints, puede heredar inconsistencias, olvidos catastróficos o comportamientos contradictorios de sus componentes.
- Riesgo de alucinación inherente a los modelos de 9B, especialmente en dominios especializados y con contexto muy largo.
- El contexto declarado de 1M y 256k tokens no está documentado técnicamente; el rendimiento real en ventanas extremas puede degradarse.
- Cobertura lingüística limitada a en, zh, ja y es; el español no está evaluado en los benchmarks publicados.
- En TruthfulQA obtiene un 78,0% (81,6% sobre respuestas finalizadas) y en SafetyBench un 86,8%, con categorías débiles en ofensividad (78,0%) y equidad/sesgo (77,5%).
- La licencia Apache 2.0 permite uso comercial, pero las licencias de los modelos base deben verificarse por separado antes de explotación comercial.
- Soporte de tool calling y agentes declarado por tags pero sin documentación de formato ni ejemplos; requiere validación propia.
- No hay garantías de mantenimiento, versionado ni soporte por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nightmedia/Qwen3.5-9B-Brainwaves-Coder-Flash-OneJev1.6-oQ6e-mtp
- Modelo base: https://huggingface.co/nightmedia/Qwen3.5-9B-Brainwaves
- Modelo base: https://huggingface.co/Jackrong/Qwopus3-5-9B-Coder-Flash
- Modelo base: https://huggingface.co/OmniJev/OneJev1.6-9B
- Benchmark ARC-Challenge: https://omlx.ai/benchmarks/intelligence/2s3mmhvt
- Benchmark Winogrande: https://omlx.ai/benchmarks/intelligence/moccy1ix
- Benchmark TruthfulQA: https://omlx.ai/benchmarks/intelligence/mb0utr2u
- Benchmark SafetyBench: https://omlx.ai/benchmarks/intelligence/4n2w5shr
- Benchmark GSM8K: https://omlx.ai/benchmarks/intelligence/alql4zng
- Benchmark MATHQA: https://omlx.ai/benchmarks/intelligence/v5mth297
- Benchmark BBQ: https://omlx.ai/benchmarks/intelligence/pt6ikk3k
