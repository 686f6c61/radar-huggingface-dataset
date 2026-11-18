# qtum/MiniMax-M3.1-Flash-GGUF

## Resumen

MiniMax-M3.1-Flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por MiniMax. Con 427.000 millones de parámetros en su torre de texto, 60 capas y 248 GB de pesos, el 93,6% de la masa paramétrica corresponde a expertos enrutados. Este repositorio (`qtum/MiniMax-M3.1-Flash-GGUF`) no contiene el modelo original, sino cuantizaciones GGUF preparadas con llama.cpp para su uso en inferencia local, publicadas por el usuario qtum.

La particularidad técnica de esta conversión es que el checkpoint original ya está almacenado en precisión mixta: las capas densas usan MXFP8 y los expertos enrutados NVFP4, lo que da una media de 4,66 bits por peso. Por ese motivo el autor no ofrece los niveles habituales (Q8_0, Q6_K, Q5_K_M, Q4_K_M), que resultarían en archivos más grandes que el original y con más error de cuantización acumulado; en su lugar publica niveles por debajo de 4,66 bpw con las capas no-expertas protegidas en Q8_0.

El modelo incorpora atención dispersa (MSA) mediante una proyección `indexer` en cada capa que selecciona bloques de 128 tokens a los que atender. La versión GGUF es exclusivamente de texto: el checkpoint original incluye una torre de visión CLIP que no se ha convertido porque llama.cpp aún no soporta multimodalidad para esta arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención dispersa (MSA); 60 capas (3 densas + 57 MoE) |
| Parametros totales | 427.000 millones (torre de texto) |
| Parametros activos | 4 expertos enrutados de 128 por capa + 1 experto compartido (por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ2_XXS, IQ2_XS (más un draft Q8_0 para decodificación especulativa) |
| Idiomas soportados | en, zh |
| Licencia | minimax-model-agreement (licencia "other") |
| Formato de pesos | GGUF (llama.cpp); el checkpoint original usa MXFP8 en capas densas y NVFP4 en expertos |

## Arquitectura y entrenamiento

El modelo es un transformer de 60 capas. Las tres primeras son densas, con un MLP de anchura 12.288; las 57 restantes son capas MoE con 128 expertos enrutados cada una, de los cuales se activan 4 por token, más un experto compartido que se ejecuta siempre. La atención es dispersa (MSA): cada capa incorpora una proyección `indexer` adicional que elige qué bloques de 128 tokens reciben atención, en lugar de atender a toda la secuencia. Todo lo que no son expertos suma 16,0 GB de pesos.

El checkpoint original ya está almacenado en precisión mixta: las capas densas en MXFP8 (pesos E4M3 con escalas de bloque E8M0 de 32 columnas) y los expertos enrutados en NVFP4 (dos pesos por byte, una escala FP8 por cada 16 valores y una escala FP32 por experto). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto en inglés y chino.
- Razonamiento y matemáticas: no se detalla en la información disponible, pero es esperable en un modelo de esta escala; sin datos confirmados.
- Generación de código: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas a inglés y chino según los metadatos.
- Visión: no disponible en esta conversión GGUF. El checkpoint original incluye una torre de visión CLIP de 32 capas (hidden 1.280, patch 14, resolución 672×672) con proyector y módulo patch-merge (1,73 GB en 523 tensores), pero llama.cpp no soporta multimodalidad para esta arquitectura y estos GGUF no contienen ningún tensor de visión.
- Decodificación especulativa: se incluye un draft `dspark-…-Q8_0` de 1,9 GiB aplicable a cualquier nivel de cuantización.

## Casos de uso

- Despliegue local de un MoE de gran escala en hardware con suficiente memoria: los niveles IQ2_XXS (113,5 GiB) e IQ2_XS (125,0 GiB) permiten ejecutar un modelo de 427.000 millones de parámetros en estaciones de trabajo con 128 GB de memoria unificada o configuraciones multi-GPU, algo inviable con los pesos originales en BF16.
- Inferencia con decodificación especulativa: el draft Q8_0 de 1,9 GiB acelera la generación al proponer tokens que el modelo grande verifica, reduciendo la latencia en despliegues con llama.cpp.
- Procesamiento de documentos largos en inglés o chino: la atención dispersa con indexer por bloques de 128 tokens está diseñada para manejar secuencias largas con coste de atención reducido, adecuada para resumen y extracción sobre corpus extensos.
- Investigación sobre cuantización extrema: los niveles IQ1_S (1,822 bpw) e IQ2_XXS (2,287 bpw) con capas no-expertas protegidas en Q8_0 sirven para estudiar el impacto de la compresión agresiva en modelos MoE con expertos ya cuantizados en NVFP4.
- Evaluación comparativa de estrategias de cuantización: el repositorio documenta con detalle por qué Q4_K_M resulta contraproducente en este checkpoint, lo que lo convierte en material de referencia para estudiar recetas de cuantización en llama.cpp.
- Servicio de texto bilingüe (en/zh) en entornos con requisitos de soberanía de datos: al ejecutarse localmente con llama.cpp no requiere enviar peticiones a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí reporta perplejidad sobre wikitext-2 para cada nivel de cuantización:

| Nivel | Tamano | bpw | Shards | PPL (wikitext-2) |
|---|---|---|---|---|
| BF16 master (referencia, no incluido) | 241,3 GiB | 4,863 | — | 149,4654 ± 12,58751 |
| IQ1_S | 90,4 GiB | 1,822 | 3 | 237,3906 ± 19,29183 |
| IQ2_XXS | 113,5 GiB | 2,287 | 3 | 148,1980 ± 12,18542 |
| IQ2_XS | 125,0 GiB | 2,519 | 3 | 144,0074 ± 12,01536 |

El autor advierte que el bpw del master (4,863) corresponde al checkpoint convertido a BF16 para cuantizar, no al original (4,66 bpw), porque la conversión expande las capas densas MXFP8 a BF16.

## Requisitos de hardware

- VRAM/memoria estimada: IQ1_S requiere unos 90,4 GiB; IQ2_XXS unos 113,5 GiB; IQ2_XS unos 125,0 GiB. Hay que añadir la memoria del contexto KV y del draft (1,9 GiB) si se usa decodificación especulativa.
- GPU recomendadas: no disponibles en la información proporcionada. Por volumen de memoria, los niveles IQ2 encajan en configuraciones multi-GPU de 80 GB (por ejemplo, 2× A100/H100 de 80 GB para IQ2_XXS) o en sistemas con memoria unificada de 128 GB.
- GPU de consumo: no cabe en ninguna GPU consumer individual (RTX 4090 dispone de 24 GB). Requiere configuraciones multi-GPU o memoria unificada de gama alta.
- Opciones de despliegue: llama.cpp (formato nativo GGUF); soporte de vLLM, Ollama o TGI no disponible en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Solo texto: estos GGUF no contienen ningún tensor de visión; para entrada de imágenes hay que usar los pesos originales.
- Idiomas limitados a inglés y chino según los metadatos; el rendimiento en castellano no está documentado.
- Licencia `minimax-model-agreement`: es necesario revisar sus términos antes de cualquier uso comercial; no es una licencia de código abierto estándar.
- La cuantización IQ1_S degrada notablemente la perplejidad (237,39 frente a 149,47 del master), lo que sugiere pérdida de calidad significativa; IQ2_XXS e IQ2_XS quedan próximos al master.
- Los niveles IQ2_XXS e IQ2_XS quedan por debajo de la perplejidad del master, lo que el autor atribuye a la calibración imatrix y a la protección de capas no-expertas; conviene validar con evaluaciones propias antes de producción.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Longitud de contexto no especificada en la información proporcionada; verificar en la model card del modelo base antes de planificar despliegues con secuencias largas.
- El repositorio no tiene descargas ni likes y fue creado recientemente; no hay evidencia de uso en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/qtum/MiniMax-M3.1-Flash-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash/blob/main/LICENSE
- README en chino: https://huggingface.co/qtum/MiniMax-M3.1-Flash-GGUF/blob/main/README_zh.md
