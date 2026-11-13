# FINAL-Bench/Darwin-27B-Opus

## Resumen
Darwin-27B-Opus es un modelo de lenguaje de 27.781.427.952 parámetros desarrollado por FINAL-Bench, publicado en Hugging Face bajo licencia Apache 2.0. Se presenta como un modelo multimodal de tipo image-text-to-text, construido sobre la arquitectura Qwen3.5 (`qwen3_5`), orientado a razonamiento con modo de pensamiento explícito (`thinking`) y capacidades de generación de texto conversacional. El modelo emplea una técnica de fusión evolutiva de pesos (`evolutionary-merge`, `darwin-v6`) guiada por métricas de resonancia magnética (`mri-guided`) y combinación DARE-TIES, según los identificadores declarados por el autor.

Su relevancia inmediata radica en que combina un tamaño medio-grande (27,8B) con ventana de contexto y capacidades multimodales heredadas de la familia Qwen3.5, lo que lo sitúa en una franja atractiva para despliegues en una sola GPU de 80 GB o en configuraciones multi-GPU más modestas. El autor declara un resultado de 86,9 de accuracy en GPQA Diamond, un dato llamativo para su tamaño, aunque no verificado de forma independiente (`verified: false`).

El acceso al repositorio está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos. El repositorio ocupa 55,6 GB en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen3.5 (`qwen3_5`), image-text-to-text |
| Parametros totales | 27.781.427.952 (27,8B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | en, ko, ja, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo se declara sobre la arquitectura `qwen3_5`, esto es, un transformer multimodal que procesa entradas de imagen y texto y genera texto. Los tags del repositorio indican un proceso de construcción mediante fusión evolutiva de pesos: `darwin-v6`, `evolutionary-merge`, `mri-guided` y `dare-ties`. DARE-TIES es una técnica conocida de fusión de modelos que poda deltas de pesos y resuelve conflictos de signo entre modelos fusionados; `mri-guided` sugiere una selección de capas o componentes guiada por métricas internas, y `evolutionary-merge` apunta a una búsqueda evolutiva de hiperparámetros de fusión. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

Los tags incluyen referencias a cuatro arXiv (`2501.00823`, `2311.03099`, `2403.06412`, `2311.12022`, `2605.14386`), que probablemente corresponden a los trabajos metodológicos citados por el autor (fusión de modelos, DARE, etc.), aunque no se detalla su correspondencia exacta en la información proporcionada. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades
- Generación de texto conversacional multi-turno.
- Razonamiento con modo de pensamiento explícito (`thinking`).
- Procesamiento de imagen y texto (image-text-to-text): descripción de imágenes, VQA y tareas combinadas visión-lenguaje.
- Capacidades multilingües declaradas en inglés, coreano, japonés y chino, además de etiqueta genérica `multilingual`.
- Se declara compatibilidad con endpoints (`endpoints_compatible`) y despliegue en Azure (`deploy:azure`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada más allá del modo `thinking`.

## Casos de uso
- Asistencia conversacional con contexto multimodal: el modelo puede recibir capturas de pantalla o imágenes junto con texto para resolver dudas técnicas, gracias a su pipeline image-text-to-text.
- Análisis de documentos con imágenes: extracción y razonamiento sobre diagramas, tablas escaneadas o gráficos en flujos de investigación, aprovechando el modo `thinking` para justificar conclusiones.
- Razonamiento científico asistido: con 86,9 de accuracy declarado en GPQA Diamond, es adecuado para prototipos de tutoría o verificación de razonamientos de nivel posgrado en física, química y biología.
- Generación de código y explicaciones técnicas: aunque no se documenta benchmark de código, el tamaño de 27,8B y la base Qwen3.5 permiten su uso en asistentes de programación con explicación paso a paso.
- Despliegue en infraestructura Azure: los tags `deploy:azure` y `endpoints_compatible` lo hacen apto para servicios gestionados en la nube de Microsoft con endpoints compatibles con la API de transformers.
- Investigación en fusión de modelos: al ser un modelo construido por `evolutionary-merge` y DARE-TIES, sirve como caso de estudio reproducible para quienes investigan model merging y evaluación de modelos fusionados.
- Atención al cliente multilingüe (en/ko/ja/zh): útil para empresas con base de usuarios en Asia Oriental y público angloparlante.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor | Verificado |
|---|---|---|---|
| GPQA Diamond | Accuracy | 86,9 | No (declarado por el autor) |

No se han publicado otros resultados de benchmarks en la información disponible. El dato de GPQA Diamond procede del `model-index` de la model card y no está verificado de forma independiente, por lo que debe tratarse con cautela.

## Requisitos de hardware
- VRAM estimada para inferencia en bf16/fp16: aproximadamente 55,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda una GPU de 80 GB (A100 80GB, H100 80GB) o varias GPUs.
- En cuantización de 8 bits: alrededor de 28 GB de pesos, viable en una RTX 4090 de 24 GB solo con cuantización de 4 bits u offloading parcial.
- En cuantización de 4 bits (si se generan pesos GGUF/AWQ, no disponibles oficialmente): aproximadamente 14-16 GB de pesos, cabe en RTX 4090, RTX 4080 y GPUs de 16-24 GB, con margen limitado para contexto largo.
- GPU recomendadas: A100 80GB, H100 80GB, H200; consumer viable en RTX 4090 (24 GB) solo con cuantización agresiva.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles y Azure. No se confirman soportes de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Benchmark destacado |
|---|---|---|---|---|---|
| Darwin-27B-Opus | 27,8B | no disponible | Apache 2.0 | Gated | GPQA Diamond 86,9 (no verificado) |
| Qwen3 (familia base, referencia) | variable (p. ej., 32B) | hasta 128K en configuraciones habituales | Apache 2.0 | Abierto | no disponible en esta ficha |
| Gemma 3 27B | 27B | 128K (según documentación pública) | Gemma Terms | Abierto | no disponible en esta ficha |
| Mistral Small 3 (24B) | 24B | 32K-128K según versión | Apache 2.0 | Abierto | no disponible en esta ficha |

Los datos de los modelos comparables no provienen necesariamente de la información suministrada para esta ficha y deben verificarse en sus fuentes originales; se incluyen como referencia de categoría. Darwin-27B-Opus no dispone de comparativas publicadas por el autor.

## Limitaciones y advertencias
- El único benchmark declarado (GPQA Diamond, 86,9) no está verificado de forma independiente y procede del propio autor; conviene tratarlo con escepticismo.
- No se documentan el contexto máximo, la composición del dataset de entrenamiento ni detalles de alineación (RLHF/DPO), lo que dificulta evaluar riesgos de sesgo y alucinación.
- Riesgo de alucinación inherente a modelos generativos de este tamaño; el modo `thinking` no garantiza corrección factual.
- Idiomas declarados limitados a en, ko, ja, zh y etiqueta genérica multilingual; no se garantiza calidad en castellano.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que complica la reproducibilidad y la auditoría por terceros.
- Al tratarse de un modelo fusionado (`evolutionary-merge`, DARE-TIES) y no de un entrenamiento desde cero, puede heredar sesgos y comportamientos de los modelos de origen, no documentados.
- Licencia Apache 2.0 permite uso comercial, pero el carácter gated añade condiciones de acceso que deben revisarse antes de producción.
- No se dispone de pesos GGUF, AWQ ni GPTQ oficiales, lo que limita el despliegue en hardware consumer sin trabajo adicional de cuantización.

## Enlaces
- Hugging Face: https://huggingface.co/FINAL-Bench/Darwin-27B-Opus
- arXiv 2501.00823: https://arxiv.org/abs/2501.00823
- arXiv 2311.03099: https://arxiv.org/abs/2311.03099
- arXiv 2403.06412: https://arxiv.org/abs/2403.06412
- arXiv 2311.12022: https://arxiv.org/abs/2311.12022
- arXiv 2605.14386: https://arxiv.org/abs/2605.14386
