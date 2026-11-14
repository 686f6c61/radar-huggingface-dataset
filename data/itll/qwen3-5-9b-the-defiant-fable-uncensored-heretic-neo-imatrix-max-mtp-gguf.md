# ITLL/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF

## Resumen

Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP es un ajuste fino (fine-tune) del modelo Qwen3.5-9B, publicado por el usuario ITLL en Hugging Face como una recopilación de cuantizaciones GGUF. El modelo original fue desarrollado por DavidAU y Nightmedia mediante un proceso multi-etapa de ajuste fino y fusión (merge) de varios de sus propios fine-tunes de la familia Qwen 3.5 de 9B, con el objetivo declarado de elevar la inteligencia general y la capacidad de seguir instrucciones. Se trata además de un modelo "heretic" y "abliterated", lo que significa que ha sido modificado para eliminar los mecanismos de rechazo y censura del modelo base.

El repositorio que nos ocupa no contiene los pesos originales en formato bfloat16, sino un conjunto de cuantizaciones GGUF (tanto "regulares" como "MTP", de multi-token prediction) generadas con la técnica NEO Imatrix del autor. Con 8.953.803.264 parámetros totales, el modelo se posiciona en la gama de 9B, con una longitud de contexto que no se especifica en la información disponible. Su relevancia actual radica en que combina un tamaño reducido (desplegable en hardware de consumo) con un rendimiento declarado que, según el autor, supera al Qwen3.5-9B-Instruct original en siete benchmarks críticos y se acerca a modelos de 27B en algunas tareas.

La licencia es Apache 2.0, lo que facilita su uso comercial, aunque las modificaciones de "abliteration" y la eliminación de salvaguardas introducen consideraciones éticas y de cumplimiento que deben evaluarse antes de un despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B); no se detalla en la informacion disponible |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en varias precisiones: bf16/16-bit, mxfp8, mxfp4, Q4_K_S (4 bits), Q6, Q8; variantes "regulares" y "MTP" (multi-token prediction) |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi (16 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors solo para el modelo base referenciado) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer derivado de Qwen3.5-9B, aunque la información proporcionada no detalla la configuración exacta de capas, cabezas de atención ni mecanismos internos. El proceso de creación descrito por el autor consistió en un ajuste fino multi-etapa y una fusión multi-modelo (multi-stage merge) de varios fine-tunes propios de Qwen 3.5 de 9B, realizados en hardware local por DavidAU y Nightmedia. El objetivo declarado era incrementar la inteligencia general y la capacidad de seguir instrucciones, ya que, según el autor, mejorar estas dos dimensiones eleva el rendimiento del modelo en todas las tareas.

El modelo ha sido sometido a un proceso de "heretic'ing" (eliminación de mecanismos de rechazo) antes del entrenamiento posterior, lo que da como resultado un modelo completamente sin censura que "hace lo que se le pide sin hacer preguntas". Además, el bloque de razonamiento (thinking) ha sido compactado y, según el autor, en muchos casos es más potente. Las cuantizaciones GGUF incluyen la técnica NEO Imatrix, que según el autor mejora la precisión de las cuantizaciones entre un 2 y un 4 % adicional respecto a GGUF normales, así como el rendimiento en contexto largo. El tensor de salida (10-20 % de la salida) se ha modificado a precisión completa de 16 bits en todas las cuantizaciones, y los tensores MTP se han fijado a precisión Q8_0.

## Capacidades

- Generación de texto conversacional y de formato largo, con especial énfasis en escritura creativa, ficción y roleplaying.
- Razonamiento y modo "thinking" (bloque de razonamiento compactado y, según el autor, reforzado).
- Generación de código (etiquetado como "coder" en los tags del modelo).
- Capacidades multimodales de imagen a texto (pipeline image-text-to-text), aunque no se detalla la arquitectura de visión en la información disponible.
- Soporte multilingüe en 16 idiomas: árabe, chino, inglés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, tailandés y vietnamita.
- Modo instructivo y modo de razonamiento; en las variantes "plusIQ" (Q6/Q8 MTP) se ofrecen 5 modos de razonamiento y 5 modos instructivos conmutables en caliente vía API o en el chat, incluyendo los modos "Spoon" y "Einstein".
- Multi-token prediction (MTP) en las cuantizaciones que lo indican, orientado a acelerar la inferencia.
- No se menciona explícitamente soporte de tool calling o function calling en la información disponible.

## Casos de uso

- Escritura creativa y ficción: el modelo está etiquetado específicamente para escritura, ficción y roleplaying, y su naturaleza sin censura permite generar narrativas sin las restricciones temáticas habituales de los modelos alineados. Adecuado para autores que necesitan explorar tramas o personajes sin filtros.
- Roleplaying y personajes conversacionales: la combinación de instrucciones reforzadas y ausencia de rechazos lo hace apto para motores de rol con personalidades definidas, donde el modelo debe mantener el personaje sin romper la inmersión.
- Generación de código en entornos locales: al estar disponible en GGUF de 4 bits y con etiqueta "coder", puede ejecutarse en estaciones de trabajo con GPU de consumo para asistencia de programación offline, sin depender de APIs externas.
- Despliegue en hardware limitado: las cuantizaciones Q4_K_S y mxfp4 permiten ejecutar el modelo en GPUs de consumo (ver sección de hardware), lo que lo hace útil para prototipado rápido y aplicaciones de escritorio.
- Investigación sobre alineación y seguridad: al ser un modelo "abliterated" y "heretic", resulta útil como caso de estudio para analizar cómo la eliminación de salvaguardas afecta al comportamiento, a los sesgos y a la calidad de las respuestas en comparación con el modelo base.
- Procesamiento multilingüe: con 16 idiomas soportados, puede emplearse en tareas de traducción, resumen o generación de contenido en mercados no anglófonos, especialmente en combinaciones con español, portugués o francés.
- Aceleración de inferencia con MTP: en escenarios de alto throughput (por ejemplo, generación por lotes), las variantes MTP permiten predecir varios tokens por paso, lo que según el autor eleva la velocidad por encima de los 130 t/s del GGUF regular Q4_K_S.

## Benchmarks y rendimiento

Los datos de benchmarks proporcionados por el autor (modo instructivo) son los siguientes:

| Modelo (cuantización) | ARC-C | ARC-E | BoolQ | HSWAG | OBKQA | PIQA | Wino |
|---|---|---|---|---|---|---|---|
| Defiant-Fable-9B (bf16) | 0,649 | 0,832 | 0,895 | 0,713 | 0,482 | 0,783 | 0,699 |
| Defiant-Fable-9B (mxfp8) | 0,647 | 0,836 | 0,895 | 0,706 | 0,460 | 0,784 | 0,695 |
| Defiant-Fable-9B (mxfp4) | 0,640 | 0,824 | 0,886 | 0,703 | 0,468 | 0,780 | 0,691 |
| Qwen3.5-9B-Instruct (mxfp8, base) | 0,571 | 0,719 | 0,895 | 0,683 | 0,426 | 0,770 | 0,671 |
| Qwen3.8-27B (mxfp8, base) | 0,591 | 0,782 | 0,896 | 0,746 | 0,448 | 0,801 | 0,711 |
| Qwen3.6-27B-Instruct (mxfp8, base) | 0,647 | 0,803 | 0,910 | 0,773 | 0,450 | 0,806 | 0,742 |
| Qwen3.5-27B-Instruct (mxfp8, base) | 0,557 | 0,711 | 0,868 | 0,533 | 0,452 | 0,706 | 0,695 |
| Qwen3.6-35B-A3B-Instruct (mxfp8, base) | 0,581 | 0,757 | 0,892 | 0,751 | 0,428 | 0,803 | 0,688 |

Según el autor, el modelo supera siete de siete benchmarks frente a Qwen3.5-9B, Qwen3.5-27B, Qwen3.6-35B-A3B y, en algunos casos, iguala a Qwen3.6-27B, tanto en 4 como en 8 bits. Los benchmarks se realizaron en modo instructivo; el autor afirma que en modo thinking los resultados superan a los de instructivo en la mayoría de los casos. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de ~9B parámetros requiere aproximadamente 18 GB en bf16/16 bits, unos 9 GB en 8 bits (mxfp8/Q8) y alrededor de 5-6 GB en 4 bits (Q4_K_S/mxfp4), sin contar el espacio para el contexto KV.
- GPU recomendadas: para bf16, una A100 40 GB o H100; para 8 bits, una RTX 4090 (24 GB) o A10G; para 4 bits, una RTX 3060 de 12 GB o superior.
- Cabe en GPU de consumo: sí, en cuantizaciones de 4 y 8 bits (RTX 3060, 4060 Ti, 4070, 4080, 4090).
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM y TGI no se mencionan explícitamente, pero al ser GGUF el formato principal, llama.cpp es la vía natural. El repositorio indica "endpoints_compatible".
- Latencia y throughput: según el autor, el GGUF regular Q4_K_S alcanza unos 130 t/s; las variantes MTP, con una tasa de aceptación del 60 % y predicción de 2 tokens, superan esa cifra (el texto de la model card queda truncado en ese punto). Se recomienda mantener temperatura ≤ 1 y repetition penalty = 1 para no degradar el rendimiento de MTP; si la tasa de aceptación baja del 50 %, conviene usar las cuantizaciones regulares.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmarks (ARC-C / HSWAG) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Defiant-Fable-9B (este modelo) | ~9B | no disponible | 0,649 / 0,713 (bf16) | Apache 2.0 | GGUF en HF |
| Qwen3.5-9B-Instruct | ~9B | no disponible | 0,571 / 0,683 (mxfp8) | no disponible en la información | Modelo base de referencia |
| Qwen3.5-27B-Instruct | ~27B | no disponible | 0,557 / 0,533 (mxfp8) | no disponible en la información | HF |
| Qwen3.6-27B-Instruct | ~27B | no disponible | 0,647 / 0,773 (mxfp8) | no disponible en la información | HF |
| Qwen3.6-35B-A3B-Instruct | ~35B (MoE, 3B activos) | no disponible | 0,581 / 0,751 (mxfp8) | no disponible en la información | HF |

La comparativa se limita a los datos aportados por el autor; no se dispone de información sobre contextos, licencias de los modelos base ni resultados en otros benchmarks.

## Limitaciones y advertencias

- Modelo "abliterated" y "heretic": se han eliminado los mecanismos de rechazo, por lo que puede generar contenido inapropiado, ofensivo o peligroso sin filtros. No es apto para aplicaciones orientadas al público sin una capa de moderación externa.
- Riesgo de alucinación: como todo modelo de lenguaje, puede inventar hechos, citas o referencias; el ajuste fino orientado a creatividad y roleplaying puede incrementar esta tendencia en contextos factuales.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; al derivar de Qwen3.5 y haber sido modificado, los sesgos del modelo base pueden persistir o verse alterados.
- Limitaciones de contexto e idioma: la longitud de contexto no se especifica; aunque se listan 16 idiomas, el rendimiento relativo en cada uno no está documentado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la eliminación de salvaguardas puede incumplir políticas de plataformas o normativas locales; el usuario debe evaluar el cumplimiento legal.
- Caveats de producción: las cuantizaciones MTP requieren parámetros de muestreo específicos (temperatura ≤ 1, repetition penalty = 1) y pueden degradarse con temperaturas altas; si la tasa de aceptación de tokens es baja, conviene usar las variantes regulares.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-14), por lo que no hay validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ITLL/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Modelo relacionado (27B Fable Fusion 711): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Perfil del autor original DavidAU: https://huggingface.co/DavidAU
- Colecciones de DavidAU: https://huggingface.co/DavidAU/collections
- Página de soporte/FAQs: https://huggingface.co/DavidAU/support
