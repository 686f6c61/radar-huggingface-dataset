# nightmedia/Qwen3.5-9B-Brainwaves-Coder-Flash-OneJev1.6-oQ6e-mtp

## Resumen

Qwen3.5-9B-Brainwaves-Coder-Flash-OneJev1.6-oQ6e-mtp es un modelo experimental publicado por el usuario nightmedia en Hugging Face, resultado de la fusión (merge) de tres modelos derivados de la familia Qwen3.5: nightmedia/Qwen3.5-9B-Brainwaves, Jackrong/Qwopus3-5-9B-Coder-Flash y OmniJev/OneJev1.6-9B. El objetivo declarado es combinar capacidades de razonamiento (chain-of-thought largo), generación de código y escritura creativa en un único checkpoint de aproximadamente 9.653 millones de parámetros.

El modelo se distribuye cuantizado con la herramienta oQ (oMLX v0.7.3) en precisión mixta, con un promedio efectivo de 7,172 bits por peso: la mayor parte de los pesos (85,464%) está en 6 bits afín con grupo 64, un 9,453% en 8 bits y un 5,083% en BF16. Incorpora además una cabeza MTP (multi-token prediction) de 0,243B parámetros orientada a decodificación especulativa, y un codificador visual de 0,456B parámetros, lo que lo sitúa en la categoría image-text-to-text.

Es relevante ahora porque combina tres tendencias activas en el ecosistema open source: los merges comunitarios sobre arquitecturas Qwen, la cuantización mixta de bajo bit para reducir huella de memoria (8,06 GiB de almacenamiento total) y la decodificación especulativa integrada para acelerar la inferencia. No obstante, se trata de un modelo experimental sin métricas completas publicadas y con cero descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5, con cabeza MTP (multi-token prediction) y codificador visual; merge de tres checkpoints |
| Parametros totales | 9.653.104.368 (9,653B): 8,954B lenguaje, 0,456B vision, 0,243B cabeza MTP |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | etiquetado como 256k y 1M context en los tags; no confirmado en la model card |
| Tipos de cuantizacion | Cuantizacion mixta oQ/oMLX: affine 6-bit grupo 64 (85,464%), affine 8-bit grupo 64 (9,453%), BF16 (5,083%); promedio efectivo 7,172 bits/peso |
| Idiomas soportados | en, zh, ja, es |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers), bf16 y variantes cuantizadas mxfp8, q8-hi, q6-hi, mxfp4 |

## Arquitectura y entrenamiento

El modelo es un merge construido con mergekit a partir de tres checkpoints base: Qwen3.5-9B-Brainwaves (orientado a razonamiento y escritura), Qwopus3-5-9B-Coder-Flash (especializado en código, con referencias a Claude y "coder-flash") y OneJev1.6-9B. La arquitectura subyacente es un transformer de la familia Qwen3.5, multimodal (pipeline image-text-to-text), con un codificador visual de 0,456B parámetros y una cabeza de predicción multi-token (MTP) de 0,243B parámetros que habilita decodificación especulativa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO en los modelos base. Los tags mencionan "distillation" y "long-cot", lo que sugiere que alguno de los componentes se destiló con cadenas de razonamiento largas, pero la model card no detalla el procedimiento. La innovación técnica más concreta y verificable es la cuantización mixta con oQ (oMLX v0.7.3), que asigna 6 bits a la mayoría de pesos, 8 bits a una fracción seleccionada y mantiene un 5% en BF16, logrando un checkpoint de 8,06 GiB con perplejidad de 4,106 ± 0,026 en la variante mxfp8.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte declarado para inglés, chino, japonés y español.
- Razonamiento con cadena de pensamiento larga (long-cot) y modo de razonamiento, según los tags del autor.
- Generación de código y tareas de programación, heredadas del componente Coder-Flash.
- Matemáticas y STEM: la model card reporta GSM8K del 90,52% en la variante mxfp8 de este merge.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con codificador visual de 0,456B parámetros.
- Escritura creativa: generación de tramas, subtramas, ficción, ciencia ficción, continuación de escenas y roleplaying.
- Decodificación especulativa mediante cabeza MTP (multi-token prediction).
- Soporte de cuantización MLX/oMLX para despliegue en Apple Silicon.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible de forma explícita, aunque el modo long-cot es compatible con razonamiento por pasos.

## Casos de uso

- Asistente de programación en local: el componente Coder-Flash permite autocompletado y generación de funciones en editores o pipelines de CI/CD, con un checkpoint de 8,06 GiB que cabe en GPUs de consumo tras la cuantización mixta.
- Razonamiento matemático y STEM en entornos educativos: el 90,52% en GSM8K de la variante mxfp8 lo hace adecuado para tutores automáticos que resuelven problemas paso a paso con cadena de pensamiento visible.
- Escritura creativa y generación de ficción: los tags de plot generation, sub-plot generation y scene continue indican un ajuste específico para narrativa; se usaría para borradores de relatos, continuaciones de escenas y generación de tramas en herramientas de autor.
- Roleplaying y narrativa interactiva: el modelo puede mantener personajes y contexto en conversaciones largas, aprovechando la ventana de contexto declarada (256k/1M, no confirmada) para conservar el estado de la partida.
- Procesamiento de documentos con imagen y texto: al ser image-text-to-text, puede extraer y razonar sobre contenido de capturas, diagramas o páginas escaneadas combinándolo con texto.
- Despliegue en Apple Silicon: la integración con MLX/oMLX y las variantes mxfp4/mxfp8/q6-hi permiten ejecutar el modelo en Macs con memoria unificada, con 11,55 GB de pico en mxfp4 y 16,02 GB en mxfp8.
- Atención al cliente multilingüe: cubre inglés, chino, japonés y español, lo que permite un único modelo para soporte en cuatro idiomas.
- Investigación sobre merges y cuantización: sirve como caso de estudio reproducible de mergekit + oQ, con métricas de perplejidad y memoria publicadas por el autor.

## Benchmarks y rendimiento

Datos publicados en la model card para este merge (variante mxfp8) y para el componente Brainwaves:

| Benchmark | Este merge (mxfp8) | Brainwaves bf16 | Brainwaves mxfp8 | Qwen3.5-9B Instruct (mxfp8) |
|---|---|---|---|---|
| ARC | 0,700 | 0,686 | 0,678 | 0,571 |
| ARC-e | 0,880 | 0,860 | 0,856 | 0,719 |
| BoolQ | 0,905 | 0,903 | 0,904 | 0,895 |
| HellaSwag | no disponible | 0,768 | 0,763 | 0,683 |
| OpenBookQA | no disponible | 0,516 | 0,502 | 0,426 |
| PIQA | no disponible | 0,800 | 0,800 | 0,770 |
| Winograd | no disponible | 0,713 | 0,702 | 0,671 |
| GSM8K | 90,52% | no disponible | 89,16% | no disponible |

Rendimiento y memoria de las cuantizaciones del merge:

| Cuantizacion | Perplejidad | Memoria pico | Tokens/s |
|---|---|---|---|
| mxfp8 | 4,106 ± 0,026 | 16,02 GB | no disponible |
| q8-hi | 4,098 ± 0,026 | 16,86 GB | no disponible |
| q6-hi | 4,101 ± 0,026 | 14,62 GB | no disponible |
| mxfp4 | 4,327 ± 0,028 | 11,55 GB | no disponible |

Para comparar, el componente Brainwaves en bf16 alcanza 767 tokens/s con 24,69 GB de pico, y en q6-hi 597 tokens/s con 14,62 GB. El autor indica que las métricas de este merge están "siendo compiladas" y que la muestra es temprana.

## Requisitos de hardware

- VRAM estimada: 11,55 GB en mxfp4, 14,62 GB en q6-hi, 16,02 GB en mxfp8 y 16,86 GB en q8-hi (memoria pico medida por el autor). El checkpoint completo ocupa 8,06 GiB en disco.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) o RTX 3090 (24 GB) cubren todas las variantes cuantizadas; una RTX 4080 (16 GB) queda justa para mxfp8 y holgada para q6-hi/mxfp4.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más para mxfp4 y 16 GB o más para mxfp8/q6-hi.
- Despliegue: transformers (librería declarada), MLX/oMLX para Apple Silicon, y por la naturaleza del checkpoint (safetensors estándar) es convertible a otros runners; no se confirma soporte nativo de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles para este merge; como referencia, el componente Brainwaves bf16 reporta 767 tokens/s y q6-hi 597 tokens/s en el entorno de medida del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Notas |
|---|---|---|---|---|---|
| Este merge (mxfp8) | 9,653B | 256k/1M (declarado) | 90,52% | apache-2.0 | Merge experimental, multimodal, con MTP |
| nightmedia/Qwen3.5-9B-Brainwaves (bf16) | ~9B | no disponible | no disponible | apache-2.0 | Componente base; ARC 0,686, HellaSwag 0,768 |
| Qwen3.5-9B Instruct (mxfp8) | ~9B | no disponible | no disponible | no disponible | Baseline; ARC 0,571, ARC-e 0,719 |
| Jackrong/Qwopus3-5-9B-Coder-Flash | ~9B | no disponible | no disponible | no disponible | Componente especializado en código |
| OmniJev/OneJev1.6-9B | ~9B | no disponible | no disponible | no disponible | Componente base del merge |

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo etiqueta como tal y advierte de que las métricas de este merge están "siendo compiladas" con una muestra temprana.
- Cero descargas y cero likes en el momento de la ficha: no hay validación comunitaria ni informes independientes de calidad.
- Riesgo de alucinación: inherente a los modelos de 9B con modo long-cot; no se han publicado evaluaciones de factualidad.
- Merge de tres checkpoints: los merges pueden degradar capacidades específicas de los componentes originales; no hay ablaciones publicadas que cuantifiquen qué se gana y qué se pierde.
- Contexto: los tags afirman 256k y 1M de contexto, pero la model card no lo confirma ni documenta pruebas de recuperación en contextos largos.
- Idiomas: solo se declaran en, zh, ja y es; el rendimiento en español no está evaluado en los benchmarks publicados (todos en inglés).
- Licencia apache-2.0: permite uso comercial, pero al derivar de Qwen3.5 conviene verificar las condiciones de los modelos base originales antes de producción.
- Cuantización de 6 bits mayoritaria: la perplejidad sube de 4,106 (mxfp8) a 4,327 (mxfp4); en q6-hi se mantiene en 4,101, pero no hay evaluaciones de tareas completas para esa variante.
- Soporte de tool calling y despliegue en servidores de inferencia (vLLM, TGI) no confirmado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nightmedia/Qwen3.5-9B-Brainwaves-Coder-Flash-OneJev1.6-oQ6e-mtp
- Modelo base Brainwaves: https://huggingface.co/nightmedia/Qwen3.5-9B-Brainwaves
- Modelo base Coder-Flash: https://huggingface.co/Jackrong/Qwopus3-5-9B-Coder-Flash
- Modelo base OneJev1.6: https://huggingface.co/OmniJev/OneJev1.6-9B
- Herramienta de cuantización oQ: https://github.com/jundot/omlx
- Benchmarks oMLX: https://omlx.ai/benchmarks/intelligence/2s3mmhvt
