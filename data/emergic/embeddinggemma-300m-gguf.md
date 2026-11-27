# emergic/embeddinggemma-300m-gguf

## Resumen

EmbeddingGemma 300M (GGUF, Q8_0) es una redistribución del modelo de embeddings de Google EmbeddingGemma 300M, publicada por el usuario Emergic para uso interno en su producto. El repositorio no contiene un modelo nuevo ni una modificación: aloja el fichero `embeddinggemma-300M-Q8_0.gguf` procedente de `ggml-org/embeddinggemma-300M-GGUF`, copiado sin cambios y verificado mediante SHA-256, con el objetivo de fijar la descarga a una revisión concreta.

El modelo base es un encoder de la familia Gemma orientado a generación de embeddings de texto para similitud semántica y recuperación de información (pipeline `sentence-similarity`, tarea `feature-extraction`). Con 307.581.696 parámetros, produce vectores de 768 dimensiones con soporte de truncamiento Matryoshka a 512, 256 o 128 dimensiones, y una longitud de contexto de 2.048 tokens.

Su relevancia es práctica: proporciona una vía lista para usar en `llama.cpp` (servidor de embeddings con `--embedding --pooling mean`) para indexar documentos y adjuntos de chat en aplicaciones RAG. La cuantización Q8_0 reduce el peso a unos 333 MB, lo que permite ejecutarlo en hardware modesto, incluida CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (familia Gemma), no disponible el detalle exacto de capas y cabezas |
| Parametros totales | 307.581.696 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (license: other, license_name: gemma) |
| Formato de pesos | GGUF |
| Dimensiones del embedding | 768 (Matryoshka: 512, 256, 128) |
| Pooling | mean |
| Tamano del fichero | 333.590.944 bytes (aprox. 0,3 GB) |
| SHA-256 | b5ce9d77a3fc4b3b39ccb5643c36777911cc4eb46a66962eadfa3f5f60490d63 |

## Arquitectura y entrenamiento

El modelo es un encoder de la familia Gemma especializado en embeddings de texto, según se desprende de su etiqueta `feature-extraction` y del pipeline `sentence-similarity`. La información disponible no detalla el número de capas, la dimensión oculta ni la configuración de atención; tampoco se especifican el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Estos datos corresponden a la model card del modelo base de Google, que no se incluye en la información proporcionada.

La innovación técnica documentada es el uso de representaciones Matryoshka, que permiten truncar el vector de 768 dimensiones a 512, 256 o 128 sin reentrenar, a costa de una pérdida de calidad que no se cuantifica en la información disponible. El formato GGUF y el pooling por media (`--pooling mean`) son los mecanismos de inferencia indicados por el autor, y el modelo se acompaña de plantillas de prompt específicas para consultas y documentos.

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación de información.
- Soporte de truncamiento Matryoshka del vector a 512, 256 o 128 dimensiones.
- Plantillas de prompt diferenciadas: consultas como `task: search result | query: <texto>` y documentos como `title: none | text: <texto>`.
- Ejecución mediante el servidor de embeddings de `llama.cpp` con pooling por media.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en las etiquetas del repo).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni comportamiento agéntico; el modelo es exclusivamente un encoder de embeddings.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Búsqueda semántica sobre documentos internos: indexar la base documental como embeddings de 768 dimensiones y recuperar los fragmentos más próximos a la consulta del usuario mediante similitud coseno; el contexto de 2.048 tokens encaja con fragmentos de uno o dos párrafos.
- Adjuntos en aplicaciones de chat: generar embeddings de los ficheros que el usuario sube a una conversación para responder preguntas sobre su contenido, tal como declara el autor del repo para su producto.
- RAG con presupuesto de almacenamiento ajustado: usar la variante Matryoshka de 256 o 128 dimensiones para reducir el tamaño del índice vectorial cuando la latencia y el coste de almacenamiento priman sobre la precisión máxima.
- Deduplicación y agrupamiento de textos: calcular similitud entre registros para detectar duplicados o agrupar documentos temáticamente en pipelines de limpieza de datos.
- Clasificación zero-shot por proximidad: comparar el embedding de un texto con embeddings de etiquetas descriptivas para asignar categorías sin entrenar un clasificador supervisado.
- Despliegue en CPU o en hardware sin GPU: al ocupar unos 333 MB en Q8_0, el modelo puede servirse en contenedores pequeños o en máquinas sin acelerador, integrado en el servidor de embeddings de `llama.cpp`.
- Filtrado previo en sistemas de recomendación de contenido: recuperar candidatos por similitud semántica antes de aplicar un ranking más costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,6 GB en Q8_0, incluyendo overhead de contexto y buffers de `llama.cpp`; el fichero de pesos ocupa 333.590.944 bytes.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; no se requiere A100 ni H100. El modelo está pensado para ejecutarse también en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (por ejemplo, series RTX 30xx y 40xx, e incluso iGPU con memoria compartida suficiente).
- Opciones de despliegue: `llama.cpp` con `--embedding --pooling mean` es la vía documentada por el autor; no se confirman otras integraciones (vLLM, TGI, Ollama) en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimensiones | Licencia | Formato disponible |
|---|---|---|---|---|---|
| EmbeddingGemma 300M (este repo, Q8_0) | 307.581.696 | 2.048 tokens | 768 (Matryoshka 512/256/128) | Gemma Terms of Use | GGUF |
| google/embeddinggemma-300m (modelo base) | 307.581.696 | 2.048 tokens | 768 (Matryoshka 512/256/128) | Gemma Terms of Use | no disponible en la informacion |
| Otras alternativas de embeddings de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado (benchmarks) ni de especificaciones de modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no aporta ninguna modificación ni mejora sobre el modelo base; es una copia verificada por SHA-256 de un fichero de `ggml-org/embeddinggemma-300M-GGUF`.
- Solo se publica la cuantización Q8_0; no hay variantes Q4, Q5 ni FP16 en este repo.
- La longitud de contexto está limitada a 2.048 tokens, insuficiente para documentos largos sin troceado previo.
- La licencia es la Gemma Terms of Use, no una licencia de código abierto estándar; el uso comercial y la redistribución están sujetos a dichos términos y a la Gemma Prohibited Use Policy, que se aplican a todos los receptores del modelo y de sus derivados.
- No se documentan los idiomas soportados, por lo que la cobertura multilingüe no puede verificarse.
- Al ser un modelo de embeddings, no genera texto: no puede usarse para chat, razonamiento ni generación de código.
- No se han publicado métricas de calidad de recuperación (recall, nDCG) ni de degradación al truncar a 512, 256 o 128 dimensiones.
- El uso de plantillas de prompt incorrectas (consulta frente a documento) puede degradar la calidad de los embeddings; el autor especifica los formatos exactos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 26 de noviembre de 2026; no cuenta con validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/emergic/embeddinggemma-300m-gguf
- Modelo base: https://huggingface.co/google/embeddinggemma-300m
- GGUF de origen: https://huggingface.co/ggml-org/embeddinggemma-300M-GGUF
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy (referenciada como publicada en gemma.ai)
