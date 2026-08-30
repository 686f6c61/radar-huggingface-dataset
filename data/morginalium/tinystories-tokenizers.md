# morginalium/tinystories-tokenizers

## Resumen

`morginalium/tinystories-tokenizers` es una suite completa de tokenizadores BPE (Byte Pair Encoding) entrenados desde cero sobre un millón de historias del dataset `roneneldan/TinyStories`, aproximadamente 200 millones de palabras. El autor, morginalium (Alexandr Kolesnikov), desarrolla modelos de lenguaje extremadamente pequeños y arquitecturas no transformer, y este repositorio aborda un problema concreto: la elección del tamaño de vocabulario óptimo para Small Language Models (SLMs) que se entrenan en hardware limitado, como un Mac M1 con 8 GB de RAM.

El repositorio incluye nueve tokenizadores con tamaños de vocabulario que van desde 1024 hasta 50 257 (el vocabulario estándar de GPT-2). A través de un benchmark sistemático sobre 5000 historias de validación, el autor demuestra que existe un punto óptimo entre 1536 y 2048 tokens de vocabulario, donde se consigue la mejor relación entre compresión de secuencias y tamaño de la matriz de embeddings. Más allá de 4096, los beneficios de compresión son marginales, y el vocabulario de GPT-2 (50 257) resulta un sobredimensionamiento claro para este dominio.

La relevancia actual de este trabajo radica en que proporciona evidencia empírica y reproducible para quienes entrenan SLMs en entornos con recursos limitados, un área de creciente interés en la comunidad open source. No se trata de un modelo de lenguaje completo, sino de una herramienta de tokenización optimizada y documentada con datos de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BPE (Byte Pair Encoding) |
| Parametros totales | No aplica (tokenizer, no modelo de parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el tokenizer no define contexto; produce secuencias de tokens) |
| Tipos de cuantizacion | No aplica (los tokenizers no se cuantizan) |
| Idiomas soportados | Ingles (implicito por el dataset TinyStories; no especificado en la ficha) |
| Licencia | MIT |
| Formato de pesos | JSON (archivos `tokenizer_*.json` en la raiz del repositorio) |

## Arquitectura y entrenamiento

Los tokenizadores siguen el algoritmo BPE estándar, entrenados desde cero sobre un subconjunto de un millón de historias del dataset TinyStories (unas 200 millones de palabras). No se aplicaron técnicas de alineamiento como RLHF o DPO, ya que se trata de un componente de preprocesamiento, no de un modelo generativo. La innovación principal no está en el algoritmo en sí, sino en el estudio empírico que acompaña al repositorio: se entrenaron nueve tokenizadores con tamaños de vocabulario distintos (1024, 1536, 2048, 2560, 3072, 4096, 8192, 16384 y 50257) y se midieron métricas de compresión, tokens por historia y velocidad de tokenización sobre 5000 historias de validación en un M1 Pro. Los resultados muestran que el ratio de compresión mejora de 3,18 (vocabulario 1024) a 3,67 (vocabulario 2048), pero a partir de 4096 el incremento es marginal (3,99 frente a 4,20 con 50 257). La velocidad de tokenización también decrece ligeramente con vocabularios más grandes, de aproximadamente 1,08 millones de tokens por segundo (1024) a 825 000 (50 257).

## Capacidades

- Tokenización BPE de texto en inglés, optimizada para el dominio narrativo infantil de TinyStories.
- Nueve tokenizadores listos para usar, cada uno con un tamaño de vocabulario distinto, cargables mediante `Tokenizer.from_pretrained` especificando el nombre del archivo.
- Proporciona métricas de compresión y velocidad para cada configuración, lo que permite seleccionar el tokenizador según las restricciones de memoria y rendimiento del hardware objetivo.
- No incluye generación de texto, razonamiento, tool calling, capacidades multimodales ni soporte de agentes, al tratarse exclusivamente de un componente de tokenización.

## Casos de uso

- Entrenamiento de SLMs sobre TinyStories en hardware limitado: el tokenizador de 2048 tokens ofrece el mejor equilibrio entre compresión (ratio 3,67) y tamaño de embeddings, reduciendo la huella de memoria en un Mac M1 con 8 GB de RAM.
- Evaluación de trade-offs de vocabulario en investigación: los datos del benchmark permiten comparar cuantitativamente cómo afecta el tamaño del vocabulario al número de tokens por secuencia y a la velocidad de preprocesamiento, útil para decidir configuraciones en experimentos controlados.
- Preprocesamiento de datasets para fine-tuning de modelos pequeños: al usar un tokenizador específico del dominio, se reduce la longitud de las secuencias y se acelera el entrenamiento sin perder información relevante.
- Replicación de estudios sobre eficiencia de tokenización: el repositorio sirve como referencia reproducible para investigaciones que analicen la relación entre vocabulario, compresión y rendimiento en SLMs.
- Comparación con tokenizadores estándar: permite contrastar el comportamiento de vocabularios grandes (p. ej., 50 257) frente a opciones compactas, evidenciando que el sobredimensionamiento no aporta beneficios en dominios restringidos.
- Integración en pipelines de entrenamiento de modelos de lenguaje pequeños: al ser archivos JSON estándar, se pueden cargar con la librería `tokenizers` de Hugging Face y usarse directamente en scripts de entrenamiento con frameworks como PyTorch o JAX.

## Benchmarks y rendimiento

Los resultados presentados en la model card se obtuvieron sobre 5000 historias de validación del dataset TinyStories, ejecutados en un Apple M1 Pro (2026). Se muestran las métricas para cada tamaño de vocabulario:

| Vocab Size | Total Tokens | Compression Ratio | Avg Tokens/Story | Min Tokens/Story | Max Tokens/Story | Speed (Tokens/sec) |
|---|---|---|---|---|---|---|
| 1024 | 1 279 530 | 3,18 | 255,9 | 64 | 1296 | ~1 079 000 |
| 1536 | 1 164 651 | 3,49 | 232,9 | 57 | 1193 | ~992 000 |
| 2048 | 1 106 714 | 3,67 | 221,3 | 53 | 1132 | ~948 000 |
| 2560 | 1 072 143 | 3,79 | 214,4 | 53 | 1099 | ~916 000 |
| 3072 | 1 048 720 | 3,88 | 209,7 | 52 | 1058 | ~903 000 |
| 4096 | 1 017 813 | 3,99 | 203,6 | 51 | 1038 | ~875 000 |
| 8192 | 978 335 | 4,15 | 195,7 | 49 | 1018 | ~845 000 |
| 16384 | 970 489 | 4,19 | 194,1 | 49 | 1005 | ~833 000 |
| 50257 | 968 439 | 4,20 | 193,7 | 49 | 1004 | ~825 000 |

No se han publicado resultados de benchmarks comparativos con otros tokenizadores en la informacion disponible. Los datos anteriores son los unicos proporcionados por el autor.

## Requisitos de hardware

- El benchmark se ejecuto en un Apple M1 Pro (2026) con 8 GB de RAM; no se requiere GPU para la tokenizacion.
- La velocidad de tokenizacion oscila entre ~825 000 y ~1 079 000 tokens por segundo en M1 Pro, dependiendo del tamaño del vocabulario.
- En un M1 Air (datos de 2025 mencionados en la model card), la velocidad era aproximadamente la mitad (~354 000 a ~554 000 tokens por segundo), lo que indica que el rendimiento depende de la generacion del chip.
- Al ser archivos JSON, el almacenamiento es minimo (cada tokenizador ocupa unos pocos cientos de KB) y la carga en memoria es trivial.
- Para el entrenamiento de SLMs que usen estos tokenizadores, se recomienda hardware con al menos 8 GB de RAM, aunque el tokenizador en si no impone requisitos adicionales.

## Comparativa con modelos similares

No se dispone de informacion sobre otros tokenizadores BPE especificos para TinyStories en la documentacion proporcionada. Como referencia general, el tokenizador GPT-2 (vocabulario de 50 257) se incluye en la suite como punto de comparacion, y los datos muestran que su ventaja en compresion frente al de 4096 es de solo 10 tokens por historia de media, a costa de una matriz de embeddings mucho mayor. No se pueden establecer comparaciones cuantitativas con otros tokenizadores sin datos adicionales.

## Limitaciones y advertencias

- El tokenizador esta entrenado exclusivamente sobre TinyStories, un dataset de historias infantiles en ingles. Su aplicacion a otros dominios o idiomas puede producir una tokenizacion suboptima.
- No es un modelo de lenguaje: no genera texto ni realiza tareas de razonamiento; solo convierte texto en secuencias de tokens.
- Los vocabularios grandes (p. ej., 50 257) no aportan beneficios significativos en este dominio y aumentan el tamaño de los embeddings, lo que puede ser contraproducente en SLMs con recursos limitados.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- El repositorio tiene 0 descargas y 0 likes en Hugging Face, lo que sugiere que es un proyecto reciente o poco difundido; la validacion independiente de los resultados es limitada.
- No se especifican los detalles exactos del algoritmo BPE (p. ej., si se aplico lowercasing, normalizacion Unicode o reglas de pre-tokenizacion), lo que puede afectar a la reproducibilidad en otros entornos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/morginalium/tinystories-tokenizers
- Perfil del autor: https://huggingface.co/morginalium
- Articulo relacionado sobre TinyStories regionales (no directamente sobre este tokenizer): https://arxiv.org/abs/2504.07989
