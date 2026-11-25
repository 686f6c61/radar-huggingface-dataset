# onemunanoyo/Inkling-2-Mini-Abliterated-GGUF

## Resumen

Inkling-2-Mini-Abliterated-GGUF es una versión "abliterated" (con supresión de rechazos) del modelo multimodal Inkling-2-Mini de Thinking Machines, publicada por el usuario onemunanoyo en Hugging Face. Se distribuye exclusivamente en formato GGUF, con cuantizaciones dinámicas de Unsloth (UD) que preservan la asignación de tipos por tensor del modelo base. El modelo original tiene 26.070.390.272 parámetros totales y una arquitectura MoE (mezcla de expertos), según las etiquetas del repositorio.

El interés de esta ficha radica en que combina tres elementos poco habituales: una arquitectura MoE multimodal (image-text-to-text), una ventana de cuantizaciones que va desde 22,87 GB hasta 9,14 GB, y un proceso de abliteración que elimina la mayor parte de las respuestas de rechazo del modelo base, con un coste medido en perplejidad de aproximadamente un 3 % y una divergencia KL media de 0,035-0,041. Está pensado para investigación, red-teaming y evaluación de alineamiento, no para despliegue comercial sin supervisión.

La relevancia actual es doble: por un lado, demuestra que las técnicas de abliteración pueden aplicarse sobre pesos ya cuantizados en GGUF sin re-cuantizar desde cero; por otro, documenta de forma cuantitativa el compromiso entre supresión de rechazos y degradación de la distribución de salida, algo que la mayoría de publicaciones de modelos "uncensored" no hace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), multimodal image-text-to-text |
| Parametros totales | 26.070.390.272 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UD-Q8_K_XL, UD-Q4_K_XL, UD-Q4_K_M, UD-Q2_K_XL (Unsloth Dynamic, con asignación por tensor: BF16, Q8_0, Q6_K, Q5_K, Q4_K, Q2_0, NVFP4, MXFP4) |
| Idiomas soportados | inglés (en) y japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (más proyector de visión mmproj-BF16.gguf) |

## Arquitectura y entrenamiento

El modelo base es Inkling-2-Mini de Thinking Machines, un transformer con capas de mezcla de expertos (MoE) y capacidad multimodal de entrada imagen-texto. La etiqueta `inkling2_loop` sugiere algún mecanismo de bucle o iteración interna en el razonamiento, aunque la información disponible no detalla su funcionamiento. El repositorio no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

La innovación técnica de esta publicación no está en el entrenamiento sino en el post-procesado: la abliteración se aplica "in-place" sobre los GGUF dinámicos de Unsloth, preservando la asignación de tipos por tensor de cada variante (por ejemplo, `attn_output` en 24 tensores BF16 para Q8_K_XL, o `ffn_down_exps` con 20 tensores NVFP4 más 4 BF16). Además, se usa una matriz de importancia (`imatrix`) y la opción `--skip-qtypes Q2_0` en la variante de 2 bits para no degradar los tensores ya cuantizados a Q2_0. El proceso se evalúa con perplejidad sobre WikiText-2 (15 fragmentos, `-c 512`) y con un clasificador automático de rechazos (`LiquidAI/d1-2B`).

## Capacidades

- Generación de texto conversacional multi-turno, con etiqueta `conversational` en el repositorio.
- Comprensión de imágenes y texto combinados (pipeline `image-text-to-text`), gracias al proyector `mmproj-BF16.gguf` incluido.
- Razonamiento con modo de esfuerzo configurable (`reasoning_effort` con valores como `low` y `high`), según la model card.
- Soporte bilingüe inglés-japonés, con evaluación de rechazos separada para ambos idiomas.
- Supresión de rechazos en inglés y japonés: 14/93 (15,0 %) de rechazos en inglés dañino y 0/25 (0,0 %) en japonés dañino con UD-Q8_K_XL.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas), lo que facilita su integración en servicios de inferencia.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso con agentes en la información disponible.

## Casos de uso

- Red-teaming y evaluación de alineamiento: el modelo sirve para generar respuestas que un modelo alineado rechazaría, permitiendo a equipos de seguridad medir la robustez de clasificadores y filtros. La variante UD-Q8_K_XL reduce los rechazos al 15 % en inglés y al 0 % en japonés, lo que la hace útil como generador de casos adversarios controlados.
- Investigación sobre abliteración: comparar la perplejidad y la divergencia KL de cada cuantización (1,0276x-1,0316x de PPL, KLD de 0,035-0,041) permite estudiar cuánto degrada la supresión de rechazos a cada nivel de compresión, un dato poco frecuente en la literatura.
- Análisis de sesgos y daño semántico: los datasets `heretic-org/Semantic-Harmful` y `heretic-org/Semantic-Harmless` usados en el proceso permiten reproducir experimentos sobre cómo se separan las direcciones semánticas de daño y seguridad en el espacio de activaciones.
- Despliegue local en hardware de consumo: la variante UD-Q2_K_XL ocupa 9,14 GB y cabe en GPUs con 12 GB de VRAM, lo que facilita experimentos de investigación sin infraestructura de datacenter.
- Procesamiento multimodal de documentos en japonés e inglés: al conservar el proyector de visión, puede usarse para tareas de descripción de imágenes o extracción de información en entornos de investigación bilingües.
- Evaluación comparativa de cuantizaciones: las cuatro variantes (Q8, Q4_XL, Q4_M, Q2) con checksums SHA-256 públicos permiten reproducir estudios sobre el impacto de la cuantización dinámica en modelos MoE multimodales.
- Generación de datos sintéticos para ajuste fino: al no rechazar peticiones, puede producir pares de instrucción-respuesta variados para entrenar modelos más pequeños, siempre con revisión humana posterior.

## Benchmarks y rendimiento

Los datos publicados en la model card se centran en perplejidad, divergencia KL y tasas de rechazo, no en benchmarks estándar de conocimiento o código.

| Variante | PPL base | PPL abliterada | Ratio vs base | KLD media | Same Top-p |
|---|---:|---:|---:|---:|---:|
| UD-Q8_K_XL | 8,3390 ± 0,3496 | 8,5777 ± 0,3636 | 1,0304x | 0,04037 | 90,95 % |
| UD-Q4_K_XL | 8,3346 ± 0,3491 | 8,5845 ± 0,3641 | 1,0316x | 0,04056 | 90,72 % |
| UD-Q4_K_M | 8,3335 ± 0,3489 | 8,5835 ± 0,3638 | 1,0315x | 0,04056 | 91,16 % |
| UD-Q2_K_XL | 8,7473 ± 0,3672 | 8,9752 ± 0,3814 | 1,0276x | 0,03513 | 91,82 % |

| Modelo | Variante | EN dañino (93) | JA dañino (25) | XSTest seguro (250) |
|---|---|---:|---:|---:|
| Base UD | UD-Q8_K_XL | 92/93 (98,9 %) | 25/25 (100,0 %) | 128/250 (51,2 %) |
| Abliterado | UD-Q8_K_XL | 14/93 (15,0 %) | 0/25 (0,0 %) | 18/250 (7,2 %) |
| Abliterado | UD-Q4_K_XL | 15/93 (16,1 %) | 2/25 (8,0 %) | 19/250 (7,6 %) |
| Abliterado | UD-Q4_K_M | 17/93 (18,3 %) | 0/25 (0,0 %) | 23/250 (9,2 %) |
| Abliterado | UD-Q2_K_XL | 22/93 (23,7 %) | no disponible | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo más overhead de contexto. UD-Q8_K_XL requiere unos 23 GB, UD-Q4_K_XL unos 18 GB, UD-Q4_K_M unos 17 GB y UD-Q2_K_XL unos 9,5 GB.
- GPU recomendadas: A100 40 GB o H100 para la variante Q8 con contexto largo; RTX 4090 (24 GB) para Q8 justo o Q4 con holgura; RTX 3090/4080 (16-24 GB) para Q4; GPUs de 12 GB para Q2.
- Cabe en GPU de consumo: sí, la variante UD-Q2_K_XL en 12 GB y las Q4 en 16-24 GB.
- Opciones de despliegue: llama.cpp (probado con `llama-server` y `llama-perplexity`), Ollama y cualquier runtime compatible con GGUF. El proyector de visión se carga por separado con `mmproj-BF16.gguf`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-Abliterated (este) | 26,07 B (MoE) | no disponible | Sí | Apache 2.0 | GGUF | Abliterado, 4 cuantizaciones UD |
| Inkling-2-Mini (base) | 26,07 B (MoE) | no disponible | Sí | Apache 2.0 | GGUF, safetensors | Modelo original de Thinking Machines |
| Inkling-2-Mini-Abliterated-Balanced (v2) | 26,07 B (MoE) | no disponible | Sí | Apache 2.0 | GGUF | 6 cuantizaciones, KLD 0,048-0,062, 2,5 % rechazos EN |
| Inkling-2-Mini-Abliterated-Aggressive (v2) | 26,07 B (MoE) | no disponible | Sí | Apache 2.0 | GGUF | 0 % rechazos EN y XSTest, KLD 0,056-0,073 |

La comparación con modelos de otros autores no está disponible en la información proporcionada. Dentro de la propia familia, la versión v2 Balanced ofrece menor deriva KL a costa de más rechazos, y la Aggressive elimina por completo los rechazos con mayor coste en perplejidad.

## Limitaciones y advertencias

- El modelo está deliberadamente desalineado: su tasa de rechazo ante peticiones dañinas cae al 15 % en inglés y al 0 % en japonés, por lo que no debe desplegarse en producción orientada a usuarios sin filtros externos.
- Riesgo elevado de generar contenido dañino, ilegal o inseguro; la model card lo restringe explícitamente a investigación, red-teaming y evaluación de alineamiento.
- La abliteración degrada la distribución de salida: entre un 2,8 % y un 3,2 % de aumento de perplejidad y una KLD media de 0,035-0,041, con pérdida de coincidencia top-p de aproximadamente el 8-9 %.
- La variante UD-Q2_K_XL muestra mayor tasa de rechazo residual en inglés (23,7 %) y no tiene datos publicados para japonés ni XSTest, lo que indica un comportamiento menos consistente a 2 bits.
- Idiomas limitados a inglés y japonés; no se documenta soporte de español ni de otros idiomas.
- Longitud de contexto no disponible, lo que impide planificar despliegues con ventanas largas.
- Sesgos conocidos del modelo base no documentados en la información proporcionada; la abliteración puede amplificar sesgos al eliminar la capa de rechazo.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo abliterado puede entrar en conflicto con legislación local sobre contenido dañino; la model card recomienda revisar las leyes aplicables.
- El repositorio v1 (`bw_s088`) está desactualizado respecto a las versiones v2 Balanced y Aggressive, que ofrecen mejor supresión de rechazos bajo `reasoning_effort="high"`.
- No se documenta soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/onemunanoyo/Inkling-2-Mini-Abliterated-GGUF
- Modelo base (Thinking Machines): https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Versión v2 Balanced: https://huggingface.co/onemunanoyo/Inkling-2-Mini-Abliterated-Balanced-GGUF
- Versión v2 Aggressive: https://huggingface.co/onemunanoyo/Inkling-2-Mini-Abliterated-Aggressive-GGUF
- Dataset Semantic-Harmful: https://huggingface.co/datasets/heretic-org/Semantic-Harmful
- Dataset Semantic-Harmless: https://huggingface.co/datasets/heretic-org/Semantic-Harmless
- Checksums SHA-256: https://huggingface.co/onemunanoyo/Inkling-2-Mini-Abliterated-GGUF/blob/main/SHA256SUMS.txt
- Clasificador de rechazos usado en la evaluación: https://huggingface.co/LiquidAI/d1-2B
