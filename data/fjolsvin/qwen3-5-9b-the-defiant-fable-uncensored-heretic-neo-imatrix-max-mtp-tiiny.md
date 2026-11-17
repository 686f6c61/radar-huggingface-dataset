# fjolsvin/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-tiiny

## Resumen
El modelo `fjolsvin/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-tiiny` es un reempaquetado del fine-tune `DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP`, publicado por el usuario fjolsvin mediante la herramienta tiiny-forge para que la plataforma Tiiny Pocket acepte la importación desde Hugging Face. Los pesos, según la model card, son idénticos al original; los cambios se limitan a `config.json`, `merges.txt` y el campo `base_model` de la tarjeta, para que el repositorio se reconozca como un fine-tune de `Qwen/Qwen3.5-9B`. El modelo original es un fine-tune multi-etapa y multi-modelo realizado por DavidAU y Nightmedia sobre Qwen3.5-9B, con el objetivo declarado de elevar la inteligencia general y el seguimiento de instrucciones.

Se trata de un modelo multimodal de tipo image-text-to-text con 9.653.104.368 parámetros (aproximadamente 9,65 mil millones), pesos en bfloat16 y un tamaño de repositorio de 19,3 GB. La model card lo describe como un modelo "heretic" y sin censura, entrenado tras un proceso de abliteración, con un bloque de razonamiento ("thinking") compactado y reforzado. Está etiquetado para razonamiento, código, escritura creativa, ficción y roleplaying, y declara soporte únicamente para inglés y chino.

La relevancia de esta ficha es doble: por un lado, documenta un modelo derivado de la familia Qwen3.5 con modificaciones de alineación orientadas a eliminar restricciones de contenido; por otro, ilustra el fenómeno de los reempaquetados técnicos (repacks) que alteran metadatos sin tocar los pesos, algo que conviene verificar antes de desplegar en producción. La licencia declarada es Apache 2.0, aunque el modelo base y el proceso de fine-tune deben evaluarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), multimodal image-text-to-text |
| Parametros totales | 9.653.104.368 (9,65 B) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (pesos fuente); GGUFs regulares y GGUFs MTP con NEO Imatrix en el repositorio original; mxfp8 y mxfp4 reportados en benchmarks |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); GGUFs en el modelo de origen |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Qwen3.5-9B, un transformer multimodal con pipeline image-text-to-text, según las etiquetas del repositorio. El fine-tune original se describe como un proceso multi-etapa y multi-modelo: varias variantes de 9B de Qwen 3.5 del mismo autor se combinaron mediante merges y ajuste adicional para mejorar la inteligencia general y el seguimiento de instrucciones. El autor indica que el modelo fue entrenado después de aplicar un proceso de "heretic'ing" (abliteración), de modo que las capas de rechazo quedan eliminadas o atenuadas. También se menciona la compactación del bloque de razonamiento, que en muchos casos resulta más fuerte que en el modelo de partida.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF o DPO. El repositorio incluye GGUFs etiquetados como "MTP" (multi-token prediction) y "NEO Imatrix", lo que sugiere optimizaciones de decodificación e importancia de cuantización, aunque no se detalla su funcionamiento técnico. El repack de fjolsvin no modifica pesos: solo ajusta `config.json` al esquema de transformers del base, copia `merges.txt` desde `Qwen/Qwen3.5-9B` y corrige el campo `base_model`. La model card del repack señala que los pesos de norma y embedding son los más cercanos a `Qwen/Qwen3.5-9B` (distancia relativa ~0,001 frente a ~0,003 para la variante Base).

## Capacidades
- Generación de texto conversacional y multi-turno.
- Razonamiento con modo "thinking" explícito, descrito como compactado y reforzado.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text).
- Generación de código (etiqueta "coder").
- Escritura creativa, ficción y roleplaying.
- Seguimiento de instrucciones reforzado mediante fine-tune multi-etapa.
- Comportamiento sin censura ("uncensored", "abliterated"): el autor declara que el modelo "hace lo que se le pide, sin preguntas".
- Capacidades multilingües limitadas a inglés y chino.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente, aunque el modo thinking sugiere capacidad de razonamiento encadenado.
- Capacidades de audio: no disponible.

## Casos de uso
- Escritura creativa y ficción: el modelo está etiquetado específicamente para "creative", "writing" y "fiction", y su fine-tune busca mejorar el seguimiento de instrucciones estilísticas, por lo que encaja en la generación de relatos, diálogos y guiones con directrices detalladas.
- Roleplaying y personajes conversacionales: la combinación de modo sin censura y contexto conversacional lo hace adecuado para chatbots de personaje y simulaciones de diálogo donde se requiere mantener una persona sin rechazos automáticos.
- Generación de código asistida: la etiqueta "coder" y el tamaño de 9,65 B permiten usarlo como asistente de programación en local, con cuantizaciones GGUF para equipos de gama alta de consumo.
- Investigación sobre alineación y seguridad: al ser un modelo abliterado, sirve como caso de estudio para evaluar cómo la eliminación de capas de rechazo afecta al comportamiento, la utilidad y los sesgos, comparándolo con el Qwen3.5-9B original.
- Procesamiento de documentos con imagen y texto: el pipeline image-text-to-text permite tareas de descripción de imágenes, extracción de información de capturas o documentos escaneados, aunque sin datos publicados sobre su calidad en OCR.
- Prototipado rápido en local con llama.cpp u Ollama: la disponibilidad de GGUFs regulares y MTP con NEO Imatrix en el repositorio de origen facilita el despliegue en estaciones de trabajo sin GPU de datacenter.
- Evaluación comparativa de fine-tunes: útil para reproducir los benchmarks declarados (ARC-C, ARC-E, BoolQ, HellaSwag, OpenBookQA, PIQA, WinoGrande) y contrastar las afirmaciones del autor sobre superar a Qwen3.5-27B en siete métricas.

## Benchmarks y rendimiento
Los datos proceden de la model card del modelo original y se midieron en modo "Instruct". El autor indica que en modo "thinking" los resultados suelen ser superiores, pero no publica esa tabla.

| Modelo | Precisión | ARC-C | ARC-E | BoolQ | HellaSwag | OBKQA | PIQA | WinoGrande |
|---|---|---|---|---|---|---|---|---|
| Defiant-Fable (este fine-tune) | bf16 | 0,649 | 0,832 | 0,895 | 0,713 | 0,482 | 0,783 | 0,699 |
| Defiant-Fable (este fine-tune) | mxfp8 | 0,647 | 0,836 | 0,895 | 0,706 | 0,460 | 0,784 | 0,695 |
| Defiant-Fable (este fine-tune) | mxfp4 | 0,640 | 0,824 | 0,886 | 0,703 | 0,468 | 0,780 | 0,691 |
| Qwen3.5-9B-Instruct (base) | mxfp8 | 0,571 | 0,719 | 0,895 | 0,683 | 0,426 | 0,770 | 0,671 |
| Qwen3.6-27B-Instruct (base) | mxfp8 | 0,647 | 0,803 | 0,910 | 0,773 | 0,450 | 0,806 | 0,742 |
| Qwen3.6-35B-A3B-Instruct (base) | mxfp8 | 0,581 | 0,757 | 0,892 | 0,751 | 0,428 | 0,803 | 0,688 |
| Qwen3.5-27B-Instruct (base) | mxfp8 | 0,557 | 0,711 | 0,868 | 0,533 | 0,452 | 0,706 | 0,695 |

No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible. El autor afirma que el modelo supera siete de siete benchmarks frente a Qwen3.5-9B, Qwen3.5-27B y Qwen3.6-35B-A3B, y que iguala a Qwen3.6-27B en algunos casos, tanto en 4 como en 8 bits; estas afirmaciones deben contrastarse de forma independiente.

## Requisitos de hardware
- VRAM estimada en bf16: aproximadamente 19,3 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB para inferencia cómoda.
- VRAM estimada en cuantización de 8 bits: alrededor de 10-12 GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 6-8 GB, dependiendo de la variante GGUF.
- GPU recomendadas: A100 40/80 GB, H100 para bf16 y serving de alta concurrencia; RTX 4090 (24 GB) para bf16 ajustado o 8 bits; RTX 3090/4080 para 8 bits; GPUs de 8-12 GB para cuantizaciones de 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 con bf16 justo o 8 bits, y en GPUs de 8-12 GB con cuantización de 4 bits.
- Opciones de despliegue: transformers (formato nativo del repo), llama.cpp y Ollama con los GGUFs del repositorio original, vLLM y TGI si se valida la compatibilidad con la arquitectura Qwen3.5. El repo incluye la etiqueta `endpoints_compatible`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Defiant-Fable 9B (este modelo) | 9,65 B | no disponible | apache-2.0 | en, zh | Fine-tune sin censura, multimodal, benchmarks propios superiores al base en 7 métricas |
| Qwen3.5-9B-Instruct | ~9 B | no disponible | no disponible en esta ficha | en, zh | Base oficial; menor puntuación en ARC-C, ARC-E, HellaSwag, OBKQA, PIQA y WinoGrande según la tabla del autor |
| Qwen3.5-27B-Instruct | ~27 B | no disponible | no disponible en esta ficha | en, zh | Mayor tamaño; el autor afirma que el 9B lo supera en 7 benchmarks, pero no en todas las tareas |
| Qwen3.6-35B-A3B-Instruct | ~35 B (MoE, ~3 B activos) | no disponible | no disponible en esta ficha | en, zh | MoE de mayor tamaño; superado en 7 benchmarks según la tabla, con ventaja en HellaSwag y PIQA |

La comparación se basa exclusivamente en los datos publicados por el autor del fine-tune; no se dispone de evaluaciones independientes.

## Limitaciones y advertencias
- Modelo "uncensored" y "abliterated": elimina o atenúa los mecanismos de rechazo, lo que incrementa el riesgo de generar contenido dañino, ilegal o sexualmente explícito; no es adecuado para aplicaciones dirigidas al público general sin filtros externos.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; los benchmarks incluidos miden razonamiento y conocimiento general, no veracidad.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Longitud de contexto no disponible: no se puede garantizar el comportamiento en conversaciones o documentos largos.
- Licencia Apache 2.0 declarada, pero el modelo base y los componentes de terceros deben verificarse; el proceso de abliteración puede plantear problemas de cumplimiento en entornos corporativos con políticas de contenido.
- El repack de fjolsvin no ha sido validado de forma independiente: la model card afirma que los pesos son idénticos, pero conviene comparar hashes antes de usarlo en producción.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso en la comunidad ni informes de calidad.
- Los benchmarks son autoinformados por el autor del fine-tune original y se midieron en modo Instruct; no hay replicación independiente.
- El pipeline image-text-to-text sugiere capacidades de visión, pero no se documentan detalles del codificador visual ni su calidad.
- El nombre del repositorio incluye referencias a "MTP" y "NEO Imatrix" que no se explican técnicamente en la información disponible.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/fjolsvin/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-tiiny
- Modelo original de DavidAU: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Variante DARK ROAST del autor original: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-DARK-ROAST-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Perfil del autor original: https://huggingface.co/DavidAU
- Colecciones del autor original: https://huggingface.co/DavidAU/collections
- Modelo relacionado Qwen3.6-27B Fable Fusion: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Modelo relacionado Qwen3.8-27B TURBO: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo relacionado Qwen3.8-27B TWIN TURBO: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF
