# AleaiactaEst1/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF es un fine-tune de tercera generación publicado por el usuario AleaiactaEst1 sobre el modelo base DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU. Se distribuye exclusivamente en formato GGUF, con variantes "regulares" y "MTP" (multi-token prediction) generadas mediante cuantización Di-Matrix con doble imatrix. El modelo deriva de la familia Qwen 3.8 y conserva su arquitectura transformer densa de aproximadamente 26.900 millones de parámetros, con soporte multimodal de entrada imagen-texto según el pipeline declarado.

El objetivo declarado del autor es reducir drásticamente el consumo de tokens de razonamiento (entre la mitad y una décima parte respecto al Qwen 3.8 original, con una mediana de reducción de dos tercios) sin sacrificar calidad de salida, además de mejorar métricas de razonamiento ARC-C y ARC-E. El modelo se presenta como "uncensored" y "abliterated", es decir, con las capas de rechazo eliminadas mediante técnicas de abliteración, y está afinado para usos de escritura creativa, rol, ficción y generación de código.

La relevancia del modelo es principalmente práctica: apunta a hardware de consumo, se publica bajo licencia Apache 2.0 y ofrece cuantizaciones de 4 y 8 bits que, según el autor, superan al Qwen 3.8 27B base en siete benchmarks críticos. No obstante, la ficha se basa únicamente en la model card y los metadatos de Hugging Face; no se dispone de verificación independiente de las cifras declaradas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen 3.8), con modo de razonamiento y MTP |
| Parámetros totales | 26.895.998.464 (≈26,9 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF en 4 bits y 8 bits; variantes "regulares" y "MTP"; cuantización Di-Matrix con doble imatrix (Q4KS, Q8, entre otras) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 389 GB con múltiples cuantizaciones); el base se distribuye en bfloat16 |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 26,9 mil millones de parámetros, heredado del Qwen 3.8 27B, con tres modos de operación de razonamiento (thinking) y capacidad de entrada imagen-texto según el pipeline declarado. Sobre esa base, el autor aplica un proceso de multi-stage fine-tune y multi-stage merge, combinando varios fine-tunes sucesivos con fusiones de estados. El entrenamiento se realizó con Unsloth y con dos metodologías propietarias del autor: "Cold Fusion" (que combina un componente denominado GAIN con los entrenadores de Unsloth) y "Fable Fusion 711". El método GAIN ajusta dinámicamente el entrenamiento por muestra en tiempo real según aprende el modelo.

Los datos de entrenamiento provienen de los datasets DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets, orientados a instrucciones estrictas y a escritura creativa. No se especifica el número de tokens de entrenamiento ni la composición detallada del dataset. Tampoco se documenta si hubo RLHF o DPO. Las innovaciones destacadas son la reducción del bloque de pensamiento (mediana de dos tercios, hasta una décima parte en algunos casos), la reformateo del bloque de razonamiento, la inclusión de variantes MTP para acelerar la generación y la abliteración de las capas de rechazo. El autor afirma explícitamente que no se practicó "benchmaxing".

## Capacidades

- Generación de texto general, razonamiento y resolución de problemas, con modo de pensamiento (thinking) en tres variantes de operación.
- Generación de código: el sufijo "NEO-CODER" indica afinado específico para tareas de programación.
- Escritura creativa en todos los géneros: ficción, relato, novela y roleplaying, con énfasis declarado en detalle narrativo y ganchos argumentales.
- Entrada multimodal imagen-texto según el pipeline declarado en Hugging Face (image-text-to-text).
- Soporte de tool calling y function calling, según la model card y las notas de la comunidad citadas por el autor.
- Capacidades multilingües limitadas a inglés y chino.
- Modo "uncensored"/abliterated: sin capas de rechazo, lo que permite contenido que otros modelos bloquean.
- Variantes MTP (multi-token prediction) para acelerar la decodificación.
- Compatibilidad con endpoints (tag endpoints_compatible).

## Casos de uso

- Escritura creativa y ficción: el modelo está afinado específicamente para narrativa, con énfasis en hooks, diálogo y descripción; su reducción de tokens de pensamiento permite iterar borradores con menor latencia que el Qwen 3.8 base.
- Roleplaying y personajes conversacionales: la abliteración elimina rechazos en escenarios de ficción adulta o violenta, y el contexto multi-turno permite mantener la coherencia de personaje.
- Generación de código en local: las variantes NEO-CODER y el soporte de tool calling permiten integrarlo en asistentes de programación o pipelines de CI/CD ejecutados en hardware de consumo.
- Asistencia a guionistas y novelistas: la reducción del bloque de razonamiento (mediana de dos tercios) acelera la generación de capítulos largos sin perder detalle.
- Prototipado de agentes: el soporte de function calling y los modos de razonamiento permiten construir agentes multi-paso en local con cuantizaciones de 4 bits.
- Despliegue en hardware de consumo: las cuantizaciones de 4 y 8 bits con doble imatrix están pensadas para ejecutarse en GPU de gama alta de consumo o en configuraciones con RAM unificada.
- Investigación sobre alineación y abliteración: sirve como caso de estudio de un modelo sin capas de rechazo para evaluar sesgos y comportamientos en condiciones controladas.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden de la model card del autor y no han sido verificados de forma independiente. Se presentan tal cual se declaran:

| Benchmark | Resultado declarado | Contexto |
|---|---|---|
| ARC-C (8 bits) | 735 | Supera al Qwen 3.8 27B en 144 puntos según el autor |
| ARC-C (4 bits) | 719 | Cuantización de 4 bits |
| ARC-E | 880 | Zona declarada de OpenAI, Claude y Gemini |
| Comparativa global | Supera al Qwen 3.8 27B, Qwen 3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B en 7 benchmarks críticos | Afirmación del autor, sin tabla detallada |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Para 26,9 B parámetros, una cuantización de 4 bits requiere aproximadamente 15-18 GB de VRAM, y una de 8 bits en torno a 28-30 GB, como estimación orientativa basada en el tamaño del modelo.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) podría ejecutar cuantizaciones de 4 bits; las de 8 bits requerirían A100 40 GB, H100 o configuraciones multi-GPU.
- Cabe en GPU de consumo: probablemente en 4 bits con RTX 4090, RTX 3090 o GPUs con 24 GB o más; no confirmado por el autor.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el tag endpoints_compatible sugiere compatibilidad con endpoints tipo OpenAI. No se confirma soporte de vLLM o TGI para estas cuantizaciones.
- Latencia y throughput: no disponibles. El autor afirma que las variantes MTP aceleran la generación de tokens, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882 (este modelo) | ≈26,9 B | No disponible | Apache 2.0 | GGUF | Fine-tune uncensored con reducción de thinking tokens |
| Qwen 3.8 27B (base de la familia) | ≈27 B | No disponible | Apache 2.0 (según familia Qwen) | Safetensors, GGUF | Modelo original sin fine-tune; referencia de comparación del autor |
| Qwen 3.6 27B | ≈27 B | No disponible | Apache 2.0 (según familia Qwen) | Safetensors, GGUF | Generación anterior; el autor afirma superarlo en 7 benchmarks |
| Qwen 3.6-35B-A3B | 35 B totales, 3 B activos (MoE) | No disponible | Apache 2.0 (según familia Qwen) | Safetensors, GGUF | Alternativa MoE de mayor tamaño; el autor afirma superarlo en benchmarks |

Los datos de contexto y benchmarks de los modelos comparables no están disponibles en la información proporcionada; las afirmaciones de superioridad proceden exclusivamente del autor.

## Limitaciones y advertencias

- Modelo "uncensored" y abliterated: no aplica capas de rechazo, por lo que puede generar contenido dañino, ilegal o sexualmente explícito sin filtros. No es apto para despliegues públicos sin moderación externa.
- Las cifras de benchmarks (ARC-C 735, ARC-E 880) son afirmaciones del autor sin verificación independiente; deben tratarse con cautela.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- La longitud de contexto no se especifica en la información disponible.
- El proceso de multi-stage merge y las técnicas propietarias (Cold Fusion, GAIN, Fable Fusion 711) no están documentados de forma reproducible.
- El repositorio tiene 389 GB y múltiples cuantizaciones; conviene descargar solo la variante necesaria.
- Riesgo de alucinación inherente a los modelos de 27 B, especialmente en tareas de razonamiento factual.
- Aunque la licencia es Apache 2.0, el modelo base y los datasets de entrenamiento pueden imponer condiciones adicionales; conviene revisar las licencias de DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets antes de uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/AleaiactaEst1/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Referencia de la técnica Cold Fusion (modelo previo del autor): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Unsloth: https://github.com/unslothai/unsloth
