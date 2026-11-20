# DavidAU/Qwen3.5-9B-The-Defiant-Fable-DARK-ROAST-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP

## Resumen

Qwen3.5-9B-The-Defiant-Fable-DARK-ROAST-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP es un ajuste fino (fine-tune) de la familia Qwen 3.5 de 9B, publicado por el creador independiente DavidAU en colaboración con Nightmedia. El modelo parte de la base Qwen3.5-9B-Instruct y se somete a un proceso multi-etapa de fine-tuning y merge de varios de sus propios ajustes de 9B, con el objetivo declarado de elevar la inteligencia general y el seguimiento de instrucciones. La edición "DARK ROAST" aplica un de-censurado más agresivo que el modelo original y que la edición estándar "Defiant Fable", manteniendo el rendimiento como prioridad.

El modelo es multimodal (pipeline image-text-to-text), con 9.653.104.368 parámetros reales según los safetensors, y se distribuye en precisión bfloat16 junto con cuantizaciones GGUF NEO Imatrix en versiones regulares y MTP. Incorpora modo thinking/reasoning compactado y se presenta como un modelo "heretic" totalmente descensurado. Su licencia es Apache 2.0 y los idiomas declarados son inglés y chino.

Es relevante ahora porque el autor afirma que, en cuantización 4 y 8 bits, supera 7 de 7 benchmarks frente a Qwen 3.5 9B, Qwen 3.5 27B y Qwen 3.6 35B-A3B, e iguala en algunos casos a Qwen 3.6 27B. Estos datos proceden exclusivamente de la model card del autor y no han sido verificados de forma independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen 3.5 (tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (pesos fuente), GGUF NEO Imatrix en versiones regular y MTP; benchmarks en mxfp8 y mxfp4 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers), GGUF (regular y MTP) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su pertenencia a la familia Qwen 3.5 y su naturaleza multimodal (image-text-to-text). El autor describe el proceso como un fine-tune multi-etapa y multi-modelo realizado en hardware local, seguido de un merge multi-etapa en el que se combinan varios de sus propios ajustes de 9B de Qwen 3.5. Parte de la base Qwen3.5-9B-Instruct (modelo no heretic) y aplica posteriormente el proceso de "heretic'ing", es decir, el entrenamiento se realiza después del descensurado, no antes. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

Como innovaciones destacables, la model card menciona un bloque de thinking/reasoning compactado que, según el autor, resulta más fuerte en muchos casos, y la disponibilidad de cuantizaciones NEO Imatrix con variantes MTP (multi-token prediction) orientadas a velocidad. No se documentan técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, con el foco declarado del ajuste en elevar ambas capacidades.
- Razonamiento y modo thinking: bloque de razonamiento compactado, con la afirmación del autor de que en modo thinking supera en la mayoría de casos las puntuaciones obtenidas en modo instruct.
- Capacidades multimodales de entrada imagen-texto según el pipeline declarado (image-text-to-text).
- Generación de código y tareas de programación (etiquetas `coder`).
- Escritura creativa, ficción y roleplaying (etiquetas `creative`, `writing`, `fiction`, `roleplaying`).
- Modelo totalmente descensurado ("fully uncensored", "heretic"): responde sin rechazos según el autor.
- Multilingüe limitado a inglés y chino.
- No se documenta soporte explícito de tool calling, function calling ni de agentes multi-paso en la información disponible.

## Casos de uso

- Escritura creativa y ficción: el ajuste está etiquetado específicamente para writing, fiction y creative, por lo que puede emplearse para generar narrativa larga y coherente con el estilo que se le indique.
- Roleplaying y personajes conversacionales: al estar descensurado y orientado a roleplaying, es adecuado para sistemas de personajes sin filtros de rechazo en las respuestas.
- Generación de código en entornos controlados: la etiqueta `coder` y el modo thinking permiten usarlo para completar funciones y razonar sobre fragmentos de código, siempre con revisión humana dado el riesgo de alucinación.
- Asistencia conversacional multi-turno en inglés o chino: su naturaleza instruct y conversacional lo hace apto para chatbots de dominio interno donde no se requieran políticas de contenido estrictas.
- Procesamiento de documentos con imágenes: el pipeline image-text-to-text permite extraer y razonar sobre información de capturas o figuras combinadas con texto.
- Experimentación e investigación sobre descensurado y alineación: útil para estudiar el comportamiento de modelos "abliterated" y comparar métricas frente a la base no heretic.
- Despliegue en hardware de consumo: con 9,65B de parámetros y GGUFs disponibles, puede ejecutarse en estaciones de trabajo con una sola GPU consumer para prototipos y demos locales.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (modo instruct). No verificados de forma independiente.

| Modelo / cuantización | ARC-C | ARC-E | BoolQ | HellaSwag | OpenBookQA | PIQA | WinoGrande |
|---|---|---|---|---|---|---|---|
| Defiant Fable DARK ROAST bf16 | 0,649 | 0,832 | 0,895 | 0,713 | 0,482 | 0,783 | 0,699 |
| Defiant Fable DARK ROAST mxfp8 | 0,647 | 0,836 | 0,895 | 0,706 | 0,460 | 0,784 | 0,695 |
| Defiant Fable DARK ROAST mxfp4 | 0,640 | 0,824 | 0,886 | 0,703 | 0,468 | 0,780 | 0,691 |
| Qwen3.5-9B-Instruct (base, mxfp8) | 0,571 | 0,719 | 0,895 | 0,683 | 0,426 | 0,770 | 0,671 |
| Qwen3.6-27B-Instruct (base, mxfp8) | 0,647 | 0,803 | 0,910 | 0,773 | 0,450 | 0,806 | 0,742 |
| Qwen3.6-35B-A3B-Instruct (base, mxfp8) | 0,581 | 0,757 | 0,892 | 0,751 | 0,428 | 0,803 | 0,688 |
| Qwen3.5-27B-Instruct (base, mxfp8) | 0,557 | 0,711 | 0,868 | 0,533 | 0,452 | 0,706 | 0,695 |

El autor destaca 640 en ARC-C tanto en 8 como en 4 bits y afirma que el modelo supera 7 de 7 benchmarks frente a Qwen 3.5 9B, Qwen 3.5 27B y Qwen 3.6 35B-A3B, e iguala a Qwen 3.6 27B en algunos casos. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 19,3 GB en bfloat16 (tamaño del repo), alrededor de 10 GB en cuantización de 8 bits y unos 5-6 GB en 4 bits, estimaciones basadas en el número de parámetros.
- GPU recomendadas: A100 o H100 para bf16 sin compromisos; RTX 4090 (24 GB) para bf16 ajustado o 8 bits; RTX 3090/4080 para 8 bits.
- Cabe en GPU consumer: sí, en 4 bits en GPUs de 8 GB o más (RTX 3060 Ti, RTX 4060, etc.) y en 8 bits en GPUs de 12-16 GB.
- Opciones de despliegue: transformers (pesos safetensors), llama.cpp u Ollama y otros runners compatibles con GGUF; las variantes NEO Imatrix y MTP están pensadas para estos runners. No se confirma soporte de vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles. Las variantes MTP están orientadas a velocidad según el autor, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmarks (ARC-C / HellaSwag) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Defiant Fable DARK ROAST 9B (este) | 9,65B | no disponible | 0,649 / 0,713 (bf16) | Apache 2.0 | Hugging Face, safetensors + GGUF |
| Qwen3.5-9B-Instruct | 9B | no disponible | 0,571 / 0,683 (mxfp8) | no disponible en la información | Hugging Face |
| Qwen3.5-27B-Instruct | 27B | no disponible | 0,557 / 0,533 (mxfp8) | no disponible en la información | Hugging Face |
| Qwen3.6-35B-A3B-Instruct | 35B (MoE, activos no disponibles) | no disponible | 0,581 / 0,751 (mxfp8) | no disponible en la información | Hugging Face |

Según los datos del autor, este ajuste de 9B supera a los tres modelos comparados en ARC-C y ARC-E, y queda por debajo de Qwen 3.6 27B en HellaSwag, PIQA y WinoGrande. La comparación procede únicamente de la model card.

## Limitaciones y advertencias

- Modelo descensurado y "heretic": no aplica rechazos ni filtros de seguridad, por lo que puede generar contenido ofensivo, ilegal o dañino. No es apto para aplicaciones de cara al público sin capas de moderación externas.
- Riesgo elevado de alucinación en tareas factuales; los benchmarks publicados son de conocimiento y sentido común, no de veracidad.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Los benchmarks proceden del propio autor del ajuste, sin verificación independiente, y solo cubren un subconjunto de tareas.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado y los posibles sesgos del ajuste son responsabilidad del desplegador; conviene revisar las obligaciones de atribución de la base Qwen.
- El nombre del repositorio y la model card contienen afirmaciones promocionales no contrastadas; tratar las comparativas con Qwen 27B/35B con cautela.
- No se documenta soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Hugging Face: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-DARK-ROAST-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Edición estándar (no DARK ROAST): https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs y soporte: https://huggingface.co/DavidAU/support
- Qwen3.6-27B Fable Fusion 711: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Qwen3.8-27B TURBO Fable Cold Fusion: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Qwen3.8-27B TWIN TURBO Fable Cold Fusion: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF
- Qwen3.8-27B Cold Fusion GAIN V1.1: https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF
- Qwen3.6-40B Claude-4.6 Opus Deckard: https://huggingface.co/DavidAU/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking-NEO-CODE-Di-IMatrix-MAX-GGUF
