# diablomike20/Qwen3.5-9B-Uncensored-Heretic-GGUF

## Resumen

Qwen3.5-9B-Uncensored-Heretic-GGUF es una cuantización en formato GGUF del modelo DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP, un fine-tune multi-etapa construido sobre la familia Qwen 3.5 de 9B. El autor de la cuantización es diablomike20, mientras que el fine-tune original procede de DavidAU y Nightmedia. El modelo se distribuye con licencia Apache 2.0 y está pensado para ejecución local en aplicaciones estándar de inferencia (LM Studio, llama.cpp y compatibles).

La propuesta del modelo es doble: por un lado, elevar la inteligencia general e instrucción-following mediante merges y fine-tuning multi-etapa sobre varios fine-tunes previos del mismo autor; por otro, eliminar las restricciones de alineación mediante técnicas de "abliteration" (modelo heretic), de modo que responda sin rechazos ni advertencias morales. Incorpora además un bloque de razonamiento ("thinking") compactado y modos de razonamiento e instructa conmutables en tiempo de inferencia en algunas variantes.

Técnicamente es un transformer denso de 8.953.803.264 parámetros (aproximadamente 9B), con una ventana de contexto declarada de 256k tokens, capacidades de visión (requiere un archivo mmproj separado) y soporte de tool calling. El repositorio incluye cuantizaciones regulares y MTP (multi-token prediction) con calibración NEO Imatrix, lo que según el autor mejora la precisión entre un 2 y un 4 % respecto a GGUF convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen 3.5), fine-tune multi-etapa y merge |
| Parametros totales | 8.953.803.264 (aprox. 9B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 256k tokens (declarado por el autor) |
| Tipos de cuantizacion | GGUF en varias precisiones: bf16, mxfp8, mxfp4, Q8_0, Q6, Q4_K_S y otras; variantes regulares y MTP |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 9B parámetros, derivado de la arquitectura Qwen 3.5. Sobre la base se aplicó un proceso de fine-tuning y merge multi-etapa y multi-modelo, realizado en hardware local por DavidAU y Nightmedia, combinando varios fine-tunes previos de 9B del mismo autor. El objetivo declarado fue incrementar la inteligencia general y la capacidad de seguir instrucciones, además de aplicar un proceso de "hereticación" (abliteration) que elimina los comportamientos de rechazo.

Las cuantizaciones incluidas emplean calibración NEO Imatrix, que según el autor mejora la precisión de los cuantizados entre un 2 y un 4 % frente a GGUF estándar, así como el rendimiento en contexto largo. El tensor de salida se mantiene en precisión completa de 16 bits en todas las cuantizaciones, y los tensores MTP se fijan a Q8_0. Las variantes MTP implementan decodificación especulativa mediante predicción multi-token, con tasas de aceptación declaradas en torno al 60 % (2 tokens), lo que eleva el throughput de aproximadamente 130 t/s a más de 185 t/s en una RTX 5090 con Q4_K_S. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Generación de texto general, razonamiento y matemáticas, con bloque de razonamiento ("thinking") compactado y reforzado.
- Generación de código y tareas de programación (etiqueta "coder" en el modelo).
- Escritura creativa, ficción y roleplaying, con ausencia de rechazos por contenido.
- Capacidades de visión (image-text-to-text), activables descargando el archivo mmproj correspondiente.
- Soporte de tool calling / function calling, con una variante "tools" reforzada en Q6 y Q8.
- Modos de razonamiento e instructa conmutables en caliente vía API y a nivel de mensaje en chat en las variantes "plusIQ" (5 modos de razonamiento y 5 de instructa, incluidos Spoon y Einstein, estos últimos con cero tokens de razonamiento).
- Multilingüe limitado a inglés y chino.
- Decodificación especulativa MTP para acelerar la inferencia en las variantes correspondientes.

## Casos de uso

- Asistencia conversacional multi-turno: la ventana de 256k tokens permite mantener historiales extensos y documentos de referencia dentro del mismo contexto sin truncamientos agresivos.
- Escritura creativa y ficción: el modelo está ajustado explícitamente para roleplaying y narrativa sin restricciones de contenido, adecuado para herramientas de autor que requieran libertad creativa.
- Generación de código en local: la etiqueta "coder" y el soporte de tool calling permiten integrarlo en asistentes de programación o pipelines de CI/CD que invoquen funciones externas.
- Procesamiento de documentos largos con visión: combinando el modelo con el mmproj, puede extraer información de imágenes y PDF escaneados junto a texto extenso en una sola pasada.
- Despliegue en estaciones de trabajo con una sola GPU consumer: las cuantizaciones Q4 y Q6 caben en GPUs de 16-24 GB, lo que habilita asistentes privados sin conexión.
- Agentes con razonamiento multi-paso: los modos de razonamiento conmutables permiten alternar entre respuestas rápidas sin tokens de pensamiento y cadenas de razonamiento profundas según la tarea.
- Investigación sobre alineación y seguridad: al ser un modelo abliterado, sirve como contrapunto experimental para estudiar el efecto de eliminar los rechazos sobre el comportamiento y los sesgos.

## Benchmarks y rendimiento

Resultados declarados por el autor en modo instructa (formato arc/c, arc/e, boolq, hswag, obkqa, piqa, wino):

| Modelo | Precisión | arc/c | arc/e | boolq | hswag | obkqa | piqa | wino |
|---|---|---|---|---|---|---|---|---|
| Defiant-Fable (este modelo) | bf16 | 0.649 | 0.832 | 0.895 | 0.713 | 0.482 | 0.783 | 0.699 |
| Defiant-Fable (este modelo) | mxfp8 | 0.647 | 0.836 | 0.895 | 0.706 | 0.460 | 0.784 | 0.695 |
| Defiant-Fable (este modelo) | mxfp4 | 0.640 | 0.824 | 0.886 | 0.703 | 0.468 | 0.780 | 0.691 |
| Qwen3.5-9B-Instruct | mxfp8 | 0.571 | 0.719 | 0.895 | 0.683 | 0.426 | 0.770 | 0.671 |
| Qwen3.8-27B | mxfp8 | 0.591 | 0.782 | 0.896 | 0.746 | 0.448 | 0.801 | 0.711 |
| Qwen3.6-27B-Instruct | mxfp8 | 0.647 | 0.803 | 0.910 | 0.773 | 0.450 | 0.806 | 0.742 |
| Qwen3.5-27B-Instruct | mxfp8 | 0.557 | 0.711 | 0.868 | 0.533 | 0.452 | 0.706 | 0.695 |
| Qwen3.6-35B-A3B-Instruct | mxfp8 | 0.581 | 0.757 | 0.892 | 0.751 | 0.428 | 0.803 | 0.688 |

El autor indica que el modelo supera a Qwen 3.5 9B, Qwen 3.5 27B, Qwen 3.6 35B-A3B y, en algunos casos, iguala a Qwen 3.6 27B, tanto en 4 como en 8 bits. Estas cifras proceden exclusivamente de la model card y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5-6 GB para Q4_K_S, 7-8 GB para Q6, 9-10 GB para Q8_0 y en torno a 18 GB para bf16 (estimaciones a partir del tamaño de parámetros; no confirmadas en la información disponible).
- GPU recomendadas: RTX 5090 (el autor reporta más de 185 t/s con MTP y 130 t/s con GGUF regular en Q4_K_S), RTX 4090, RTX 4080, A100 y H100 para despliegues de mayor concurrencia.
- Cabe en GPUs consumer de 12 GB o más con cuantizaciones Q4 y Q6; las variantes Q8 requieren 16 GB o más.
- Opciones de despliegue: llama.cpp, LM Studio (usado por el autor en sus pruebas), Ollama y otros motores compatibles con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI.
- Throughput declarado: 130 t/s en Q4_K_S regular y más de 185 t/s con MTP (aceptación del 60 %, 2 tokens) en Windows 11 con RTX 5090; Linux y macOS suelen ser más rápidos según el autor.
- Para visión es necesario descargar además el archivo mmproj.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-Uncensored-Heretic (este) | 8,95B | 256k | Apache 2.0 | GGUF | Fine-tune abliterado con visión y MTP |
| Qwen3.5-9B-Instruct | ~9B | no disponible | Apache 2.0 | safetensors/GGUF | Base alineada; peor en arc/c y arc/e según el autor |
| Qwen3.5-27B-Instruct | 27B | no disponible | Apache 2.0 | safetensors/GGUF | Mayor tamaño; superado en varias métricas declaradas por este 9B |
| Qwen3.6-27B-Instruct | 27B | no disponible | Apache 2.0 | safetensors/GGUF | Superior en hswag y wino según la tabla del autor |

## Limitaciones y advertencias

- Modelo abliterado ("heretic"): no aplica rechazos ni filtros de seguridad, por lo que puede generar contenido dañino, ilegal o explícitamente sexual; no es apto para productos orientados al público general sin moderación externa.
- Riesgo elevado de alucinación y de afirmaciones no verificadas, especialmente en modo sin razonamiento.
- Los benchmarks proceden únicamente de la model card del autor y no han sido validados por terceros; deben interpretarse con cautela.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- La ventana de 256k tokens es una cifra declarada; el rendimiento real en contextos muy largos puede degradarse y depende del motor de inferencia.
- Las variantes MTP pierden rendimiento con temperatura superior a 1 o repetition penalty distinta de 1; si la tasa de aceptación cae por debajo del 50 %, conviene usar las cuantizaciones regulares.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado y el cumplimiento normativo recaen sobre el desplegador.
- El repositorio ocupa 204,9 GB, por lo que conviene descargar solo las cuantizaciones necesarias.

## Enlaces

- HuggingFace: https://huggingface.co/diablomike20/Qwen3.5-9B-Uncensored-Heretic-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Modelo relacionado 27B del mismo autor: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Apoyo al autor original: https://www.buymeacoffee.com/davidbelton
