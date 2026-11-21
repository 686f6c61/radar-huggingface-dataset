# orz99/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF

## Resumen

Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF es una cuantización GGUF publicada por el usuario orz99 sobre el fine-tune homónimo de DavidAU, que a su vez parte de la familia Qwen 3.5 de 9B parámetros. Se trata de un modelo de lenguaje de 8.953.803.264 parámetros (≈9B) con arquitectura transformer densa, orientado a conversación, razonamiento, generación de código y escritura creativa, e incluye una variante multimodal de entrada imagen-texto según el pipeline declarado. El modelo ha sido sometido a un proceso de "abliteration" y ajuste "heretic" que elimina los mecanismos de rechazo, de ahí la etiqueta "uncensored".

La relevancia de esta ficha radica en que empaqueta, en un único repositorio de 204,9 GB, múltiples cuantizaciones GGUF (regulares y MTP, es decir, con predicción multi-token) generadas con calibración NEO Imatrix, lo que según el autor mejora la precisión de 2 a 4 puntos porcentuales frente a GGUF convencionales y preserva mejor el rendimiento en contexto largo. El autor reporta que el modelo supera siete benchmarks críticos frente a Qwen 3.5 9B, Qwen 3.5 27B, Qwen 3.6 35B-A3B y, en algunos casos, iguala a Qwen 3.6 27B, todo ello en cuantizaciones de 4 y 8 bits.

La licencia declarada es Apache 2.0 y el modelo soporta 16 idiomas, incluido el español, lo que lo hace candidato para despliegues locales en hardware de consumo. No obstante, conviene subrayar que las cifras de rendimiento provienen exclusivamente de la model card del autor y no han sido verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen 3.5), con tensores MTP para predicción multi-token |
| Parametros totales | 8.953.803.264 (≈9B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | GGUF en múltiples niveles; se mencionan explícitamente mxfp8, mxfp4, Q4_K_S, Q6, Q8 y BF16/16-bit MTP GGUF; tensores MTP fijados a Q8_0 y tensor de salida en 16 bits |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (regulares y MTP); el modelo base se distribuye en bfloat16 |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 9B parámetros derivado de Qwen 3.5. Sobre esa base, DavidAU y Nightmedia realizaron un fine-tune multi-etapa y un merge multi-modelo en hardware local, partiendo de varios fine-tunes propios de 9B de la misma familia. El objetivo declarado fue elevar la inteligencia general y el seguimiento de instrucciones, ya que, según el autor, mejorar ambas dimensiones eleva el rendimiento de extremo a extremo. El ajuste se aplicó después del proceso "heretic"/abliteration, de modo que el modelo resultante no incorpora negativas de rechazo.

La innovación técnica principal de esta publicación no está en el entrenamiento sino en la cuantización: todas las variantes son NEO Imatrix, una calibración con matriz de importancia que el autor cifra en una mejora adicional de 2 a 4 puntos porcentuales de precisión frente a GGUF normales, además de mejor comportamiento en contexto largo. El tensor de salida (entre el 10 y el 20 por ciento de la salida) se mantiene en precisión completa de 16 bits en todas las cuantizaciones. Las variantes MTP incorporan predicción multi-token con los tensores MTP en Q8_0, lo que permite generar dos tokens por paso cuando la tasa de aceptación es suficiente. No se dispone de datos sobre el número de tokens de entrenamiento ni sobre la composición exacta del dataset.

## Capacidades

- Generación de texto conversacional multi-turno, con modos separados de "thinking" (razonamiento) e "instruct" (respuesta directa).
- Razonamiento explícito en bloque de pensamiento, descrito por el autor como compactado y, en muchos casos, reforzado respecto al modelo base.
- Generación de código y tareas de programación, con etiqueta explícita "coder" en el repositorio.
- Escritura creativa, ficción y roleplaying, sin restricciones de contenido por el ajuste "uncensored"/"heretic".
- Capacidad multimodal de entrada imagen-texto según el pipeline declarado (image-text-to-text), aunque no se detallan los módulos de visión en la información disponible.
- Soporte multilingüe en 16 idiomas, incluidos español, inglés, chino, árabe, hindi, japonés y coreano.
- Predicción multi-token (MTP) en las variantes correspondientes, con aceleración de decodificación cuando la aceptación supera el 50 por ciento.
- Modos de razonamiento e instruct conmutables en caliente vía API y a nivel de mensaje en las variantes "plusIQ" Q6/Q8 (5 modos de razonamiento y 5 de instruct, incluidos Spoon y Einstein).
- No se documenta soporte explícito de tool calling ni de function calling en la información proporcionada.

## Casos de uso

- Asistente conversacional local sin censura: el ajuste "heretic" elimina los rechazos, lo que lo hace adecuado para prototipos de personajes, narrativa interactiva y conversación abierta donde otros modelos filtran respuestas.
- Escritura de ficción y roleplaying: la combinación de fine-tune creativo y ausencia de restricciones permite mantener personajes y tramas coherentes en sesiones largas, con el modo thinking para planificar arcos narrativos.
- Generación de código en entornos de desarrollo: la etiqueta "coder" y el tamaño de 9B permiten ejecutarlo en estaciones de trabajo con una sola GPU, integrándolo en asistentes de completado o revisión de parches.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_S y mxfp4 caben en GPUs de 8-12 GB de VRAM, lo que habilita asistentes personales offline sin dependencia de la nube.
- Evaluación de investigación sobre alineación y censura: al ser un modelo abliterado, sirve como referencia para estudiar cómo el proceso "heretic" afecta al rendimiento en benchmarks y a la tasa de rechazo.
- Procesamiento multilingüe en 16 idiomas: útil para traducción asistida, atención al cliente en varios mercados o normalización de textos en pipelines de datos.
- Aceleración de inferencia con MTP: en servicios con requisitos de latencia, las variantes MTP con aceptación superior al 60 por ciento permiten superar el throughput de los GGUF regulares manteniendo temperatura ≤1 y repetition penalty desactivada.

## Benchmarks y rendimiento

Los datos proceden exclusivamente de la model card del autor. Se midieron en modo instruct con el arnés de evaluación del autor; según este, el modo thinking suele superar estas cifras en la mayoría de los casos.

| Modelo (cuantización) | ARC-C | ARC-E | BoolQ | HellaSwag | OpenBookQA | PIQA | WinoGrande |
|---|---|---|---|---|---|---|---|
| Defiant-Fable 9B (bf16) | 0,649 | 0,832 | 0,895 | 0,713 | 0,482 | 0,783 | 0,699 |
| Defiant-Fable 9B (mxfp8) | 0,647 | 0,836 | 0,895 | 0,706 | 0,460 | 0,784 | 0,695 |
| Defiant-Fable 9B (mxfp4) | 0,640 | 0,824 | 0,886 | 0,703 | 0,468 | 0,780 | 0,691 |
| Qwen3.5-9B-Instruct (mxfp8) | 0,571 | 0,719 | 0,895 | 0,683 | 0,426 | 0,770 | 0,671 |
| Qwen3.8-27B (mxfp8) | 0,591 | 0,782 | 0,896 | 0,746 | 0,448 | 0,801 | 0,711 |
| Qwen3.6-27B-Instruct (mxfp8) | 0,647 | 0,803 | 0,910 | 0,773 | 0,450 | 0,806 | 0,742 |
| Qwen3.5-27B-Instruct (mxfp8) | 0,557 | 0,711 | 0,868 | 0,533 | 0,452 | 0,706 | 0,695 |
| Qwen3.6-35B-A3B-Instruct (mxfp8) | 0,581 | 0,757 | 0,892 | 0,751 | 0,428 | 0,803 | 0,688 |

El autor afirma que el modelo supera siete de siete benchmarks frente a Qwen 3.5 9B, Qwen 3.5 27B y Qwen 3.6 35B-A3B, y que iguala a Qwen 3.6 27B en algunos casos. La degradación entre bf16 y mxfp4 es pequeña (0,9 puntos en ARC-C, 0,8 en ARC-E). No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: alrededor de 5-6 GB para Q4_K_S/mxfp4, 9-10 GB para Q8, y en torno a 18 GB para bf16 (estimación a partir de los 8,95B parámetros; no confirmada en la información proporcionada).
- GPU recomendadas: RTX 4090 (24 GB) para todas las cuantizaciones, incluidas bf16; RTX 4080/4070 Ti Super (16 GB) para Q8; RTX 4060 Ti/3070 (8-12 GB) para Q4 y mxfp4; A100 y H100 para despliegues concurrentes con vLLM.
- Cabe en GPU de consumo: sí, en las cuantizaciones de 4 y 8 bits.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM y TGI para el modelo base en bfloat16; el repositorio incluye la etiqueta endpoints_compatible.
- Throughput reportado por el autor: unos 130 t/s en Q4_K_S con GGUF regular; las variantes MTP con aceptación del 60 por ciento (2 tokens) superan esa cifra, aunque el texto de la model card se corta antes de dar el número exacto. Se recomienda temperatura ≤1 y repetition penalty = 1 (desactivada); si la aceptación de tokens cae por debajo del 50 por ciento, conviene usar los GGUF regulares.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Defiant-Fable 9B (este modelo) | 8,95B | no disponible | Apache 2.0 | GGUF en HF | Fine-tune heretic con NEO Imatrix y MTP; benchmarks propios superiores en 7/7 frente a Qwen 3.5 9B |
| Qwen3.5-9B-Instruct | ≈9B | no disponible | Apache 2.0 (familia Qwen) | Pesos oficiales | Base no modificada; rinde peor en ARC-C (0,571 vs 0,649) y ARC-E (0,719 vs 0,832) según el autor |
| Qwen3.5-27B-Instruct | ≈27B | no disponible | Apache 2.0 (familia Qwen) | Pesos oficiales | Mayor tamaño pero peor en ARC-C (0,557) y HellaSwag (0,533) según la tabla del autor |
| Qwen3.6-35B-A3B-Instruct | 35B totales / 3B activos (MoE) | no disponible | Apache 2.0 (familia Qwen) | Pesos oficiales | MoE; superado en 7/7 benchmarks por el 9B según el autor |

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": no aplica filtros de seguridad, por lo que puede generar contenido dañino, ilegal o explícitamente sexual. No es apto para productos orientados al público general sin capas de moderación externas.
- Riesgo elevado de alucinación en dominios factuales, agravado por el ajuste orientado a creatividad y roleplaying.
- Las cifras de benchmarks proceden únicamente del autor, sin verificación independiente; la comparación con modelos de 27B y 35B se realizó con el arnés propio del autor y en modo instruct.
- El autor advierte explícitamente que superar benchmarks no implica superar al Qwen 3.5 27B en todas las tareas.
- Longitud de contexto no documentada en la información disponible; conviene verificarla antes de diseñar pipelines con ventanas largas.
- Las variantes MTP degradan su rendimiento si se sube la temperatura por encima de 1 o se activa repetition penalty; requieren configuración específica de muestreo.
- El repositorio ocupa 204,9 GB, lo que exige planificación de almacenamiento y ancho de banda para su descarga.
- Aunque la licencia es Apache 2.0, el modelo base y los fine-tunes intermedios pueden arrastrar condiciones adicionales; conviene revisar las licencias de la cadena completa antes de un uso comercial.
- Sin descargas ni likes en el momento de la consulta, lo que reduce la evidencia de comunidad y validación externa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/orz99/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Modelo base del fine-tune: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Modelo relacionado 27B del mismo autor: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Perfil del autor del fine-tune: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Página de soporte y FAQ del autor: https://huggingface.co/DavidAU/support
