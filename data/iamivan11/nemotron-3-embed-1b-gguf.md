# iamivan11/Nemotron-3-Embed-1B-GGUF

## Resumen

Nemotron-3-Embed-1B-GGUF es la conversión a formato GGUF (cuantización Q8_0) del modelo de embeddings nvidia/Nemotron-3-Embed-1B-BF16, publicada por el usuario iamivan11. Se trata de un modelo de extracción de características (feature-extraction) orientado a la generación de vectores de embedding para tareas de recuperación semántica, búsqueda y RAG, no de un modelo generativo de texto. El modelo base lo desarrolla NVIDIA y esta conversión concreta la mantiene un tercero, con el único cambio del paso de safetensors BF16 a GGUF Q8_0.

Con 1.140.918.272 parámetros (aproximadamente 1,14 mil millones), el modelo produce embeddings de 2048 dimensiones, aplica mean pooling y normalización L2, y emplea una arquitectura bidireccional en la que cada entrada debe caber en un único ubatch de llama.cpp. La ventana de contexto operativa en la receta de uso publicada se fija en 4096 tokens.

Su relevancia práctica radica en que permite ejecutar un modelo de embeddings de NVIDIA en el ecosistema llama.cpp (llama-server con `--embeddings`), lo que facilita el despliegue local en CPU o GPU sin depender de PyTorch/transformers. El autor reporta una paridad muy alta con el modelo original en fp32: ids de tokens idénticos en 20 textos y similitud coseno mínima de 0,99990.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bidireccional tipo transformer para embeddings (detalles internos no disponibles) |
| Parametros totales | 1.140.918.272 (~1,14 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens en la receta de uso publicada (`-c 4096`) |
| Tipos de cuantizacion | GGUF Q8_0 (unico fichero publicado) |
| Idiomas soportados | no disponible (la validacion de paridad usa textos en ingles y ruso) |
| Licencia | openmdw-1.1 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (`nemotron-3-embed-1b-q8_0.gguf`, 1.220.292.704 bytes); origen safetensors BF16 |

## Arquitectura y entrenamiento

El modelo es un encoder bidireccional de aproximadamente 1,14 mil millones de parámetros cuyo cometido es la extracción de embeddings. La model card de esta conversión no detalla la arquitectura interna (número de capas, dimensiones ocultas, mecanismo de atención ni esquema de entrenamiento) ni el volumen o composición del corpus de entrenamiento. Tampoco se documentan fases de RLHF, DPO u otras técnicas de alineación, algo por otra parte poco habitual en modelos de embeddings.

La innovación técnica relevante en esta ficha es el proceso de conversión: los pesos se transformaron con `convert_hf_to_gguf.py --outtype q8_0` usando el commit `1fb8a269603b497fc1ce7dab2f2fc5c1be7a51cb` de llama.cpp (tag b12629), sin más cambios que la cuantización. El pipeline de inferencia requiere mean pooling, normalización L2, salida de 2048 dimensiones y prefijos `query: ` / `passage: ` según el rol del texto. Al ser un modelo bidireccional, cada entrada debe procesarse completa en un solo ubatch.

## Capacidades

- Generación de embeddings de texto de 2048 dimensiones con mean pooling y normalización L2.
- Recuperación semántica y búsqueda densa mediante similitud coseno.
- Codificación asimétrica query/passage mediante prefijos (`query: ` y `passage: `).
- Soporte de textos en inglés y ruso validado empíricamente (20 textos de prueba); cobertura multilingüe adicional no disponible.
- Integración con llama.cpp mediante `llama-server --embeddings --pooling mean`.
- Compatible con endpoints (tag `endpoints_compatible` en Hugging Face).
- No es un modelo generativo: no soporta tool calling, function calling, agentes ni razonamiento multi-paso.

## Casos de uso

- RAG sobre documentación técnica: indexar fragmentos con prefijo `passage: ` y consultar con prefijo `query: `, usando los 4096 tokens de contexto para chunks de documentación extensos y recuperando los k más similares por coseno en una base vectorial.
- Búsqueda semántica interna en wikis corporativas: desplegar llama-server con `--embeddings` y generar vectores de 2048 dimensiones para cada artículo, permitiendo búsquedas por significado en lugar de por palabra clave.
- Deduplicación y clustering de textos: calcular embeddings de un corpus de tickets o artículos y agrupar por similitud para detectar duplicados o temáticas recurrentes.
- Filtrado de candidatos en pipelines de moderación o clasificación: usar la similitud frente a un conjunto de textos de referencia etiquetados para prefiltrar contenido antes de un modelo generativo más costoso.
- Evaluación de similitud semántica en control de calidad de traducciones: comparar el embedding del texto original y el de la traducción (el autor valida paridad con textos en inglés y ruso) para detectar desviaciones de significado.
- Despliegue local en entornos sin GPU dedicada: el fichero Q8_0 de 1,2 GB permite ejecutar el modelo en CPU con llama.cpp para prototipos de búsqueda semántica o asistentes de documentación offline.
- Motor de recomendación de contenido textual: indexar artículos y calcular la similitud entre el historial de lectura del usuario y el catálogo disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, MTEB, etc.) en la información disponible. El autor sí reporta una validación de paridad frente al modelo original en transformers fp32:

| Metrica | Resultado |
|---|---|
| Ids de tokens (20 textos EN/RU) | Identicos en los 20 textos |
| Similitud coseno Q8_0 vs fp32 (por texto) | Minima 0,99990; media 0,99994 |
| Top-1 en recuperación (8 consultas) | Identico en las 8 consultas |
| Top-3 en recuperación (8 consultas) | Conjuntos identicos |

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,2-1,5 GB para el fichero Q8_0 (1,22 GB de pesos) más overhead de contexto y buffers de llama.cpp.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100. El modelo es lo bastante pequeño como para no requerir GPU de centro de datos.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna con 4 GB o más; también es viable en CPU.
- Opciones de despliegue: llama.cpp (`llama-server` con `--embeddings --pooling mean`), y por extensión entornos compatibles con GGUF; no se documenta soporte específico para vLLM o TGI en esta conversión.
- Latencia y throughput: no disponibles. El rendimiento dependerá del hardware y del tamaño de los ubatches, que deben contener cada entrada completa por la naturaleza bidireccional del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de embedding | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron-3-Embed-1B-GGUF (esta ficha) | ~1,14 B | 4096 (receta publicada) | 2048 | openmdw-1.1 | GGUF Q8_0 |
| nvidia/Nemotron-3-Embed-1B-BF16 | ~1,14 B | no disponible | 2048 | openmdw-1.1 | safetensors BF16 |
| Alternativas de embeddings de ~1 B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con otros modelos de embeddings de tamaño similar no puede completarse con la información proporcionada; los datos de rendimiento comparativo (por ejemplo, MTEB) no están disponibles para ninguno de los modelos listados.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni soporta tool calling, agentes o razonamiento; su único uso es la extracción de embeddings.
- Arquitectura bidireccional: cada entrada debe caber en un único ubatch, lo que limita el procesamiento de textos largos a la ventana configurada (4096 tokens en la receta publicada).
- La cobertura multilingüe solo está validada con textos en inglés y ruso; el rendimiento en castellano u otros idiomas no está documentado.
- Riesgo de alucinación no aplicable en sentido estricto (no genera texto), pero la calidad de la recuperación puede degradarse en dominios muy alejados de los datos de entrenamiento del modelo base, cuyo corpus no se detalla.
- Licencia openmdw-1.1: es una licencia "other" que debe revisarse antes de uso comercial; la conversión incluye el LICENSE y NOTICE originales sin modificar.
- Conversión de terceros (iamivan11) con 0 descargas y 0 likes en el momento de la ficha: no es una publicación oficial de NVIDIA, aunque el autor documenta hashes SHA-256 y verificación de paridad.
- La cuantización Q8_0 introduce una desviación mínima (coseno ≥ 0,99990 frente a fp32), aceptable para recuperación pero no idéntica al modelo original.
- El repositorio no incluye otros niveles de cuantización (Q4, Q5, F16), lo que limita el ajuste fino de memoria en despliegues muy restringidos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/iamivan11/Nemotron-3-Embed-1B-GGUF
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Embed-1B-BF16
- llama.cpp (herramienta de conversión e inferencia): https://github.com/ggml-org/llama.cpp
- Commit de conversión: `1fb8a269603b497fc1ce7dab2f2fc5c1be7a51cb` (tag b12629)
