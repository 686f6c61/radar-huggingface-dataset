# perplexity-ai/pplx-embed-v2-context-9b-preview

## Resumen

`pplx-embed-v2-context-9b-preview` es un modelo de embeddings contextuales desarrollado por Perplexity AI, disenado especificamente para codificar fragmentos (chunks) de documentos en sistemas de recuperacion aumentada por generacion (RAG). Su rasgo diferencial es que un documento completo se pasa como una lista de chunks y se codifica de forma conjunta, de modo que el embedding de cada chunk incorpora informacion de su contexto circundante; el modelo devuelve exactamente un vector por chunk.

El modelo tiene 8.401.083.632 parametros (aproximadamente 8.4B) en formato safetensors, con una dimension de embedding nativa de 2048 y soporte de Matryoshka Representation Learning (MRL) para truncar a 1024 dimensiones. La etiqueta de arquitectura `pplx_contextual_qwen3_5` apunta a una arquitectura derivada de la familia Qwen3.5 con codigo personalizado, lo que obliga a cargarlo con `trust_remote_code=True`. Emplea mean pooling y no usa instrucciones, sino prefijos fijos distintos para consultas y documentos.

Se trata de una version preview y no de un modelo final: los pesos, los embeddings y la interfaz pueden cambiar en versiones posteriores sin compatibilidad hacia atras, por lo que los embeddings generados con esta version no deberian mezclarse con los de una version futura. La relevancia actual radica en el creciente interes por embeddings contextuales que mejoran la calidad de recuperacion en RAG frente a los embeddings de chunk aislados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `pplx_contextual_qwen3_5` (tag del repositorio; arquitectura personalizada con `custom_code`), transformer con pooling de media |
| Parametros totales | 8.401.083.632 (aproximadamente 8.4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Salida nativa en INT8 no normalizada; MRL con soporte de 1024 y 2048 dimensiones; no se detallan cuantizaciones de pesos (GGUF, GPTQ, AWQ, etc.) |
| Idiomas soportados | Multilingue |
| Licencia | MIT |
| Formato de pesos | Safetensors |
| Dimension de embedding | 2048 (con truncado Matryoshka entrenado a 1024) |
| Pooling | Mean |
| Instrucciones | No (prefijos fijos distintos para consulta y documento) |
| Libreria | transformers (requiere `transformers>=5.4.0`) |
| Tamano del repositorio | 67.2 GB |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

El modelo se etiqueta con la arquitectura `pplx_contextual_qwen3_5`, lo que sugiere una base derivada de la familia Qwen3.5 adaptada por Perplexity AI para producir embeddings contextuales de chunks. El repositorio usa codigo personalizado (`custom_code`), por lo que la carga requiere `trust_remote_code=True` y depende de `transformers>=5.4.0`. La codificacion aplica mean pooling sobre las representaciones del modelo y no emplea instrucciones; en su lugar, utiliza prefijos fijos separados para consultas y documentos, de manera que consultas y documentos deben codificarse con metodos distintos (`encode_queries` para consultas y `encode` para documentos).

El modelo fue entrenado con perdidas Matryoshka (MRL) a 1024 y 2048 dimensiones, lo que permite truncar los embeddings a 1024 valores (tomando los primeros 1024 de cada vector no normalizado y normalizando despues); no se entrenaron otros tamanos de truncado. La salida nativa es en valores INT8 no normalizados, por lo que las comparaciones deben hacerse con similitud coseno o normalizando previamente. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de RLHF o DPO.

## Capacidades

- Generacion de embeddings contextuales de documentos: codifica una lista de chunks de un mismo documento de forma conjunta, devolviendo un vector por chunk que refleja su contexto.
- Recuperacion semantica y busqueda de similitud de frases (`feature-extraction`, `sentence-similarity`).
- Codificacion asimetrica de consultas y documentos mediante metodos separados (`encode_queries` frente a `encode`), con prefijos fijos entrenados para cada caso.
- Soporte multilingue.
- Soporte de dimensiones Matryoshka: 2048 nativas y 1024 mediante truncado entrenado.
- Salida en INT8 no normalizada, apta para similitud coseno o para normalizacion opcional (`normalize_embeddings=True`) con producto escalar.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento; es un modelo exclusivamente de embeddings.

## Casos de uso

- Recuperacion en pipelines RAG: el modelo codifica cada chunk teniendo en cuenta los chunks vecinos del mismo documento, mejorando la precision de recuperacion frente a embeddings de chunk aislado, especialmente cuando un fragmento depende de su contexto.
- Busqueda semantica sobre corpus documentales largos: se pasa el documento dividido en chunks y se indexan los vectores resultantes en una base vectorial, usando similitud coseno para consultas.
- Sistemas de preguntas y respuestas sobre documentacion tecnica: la codificacion asimetrica con `encode_queries` permite emparejar preguntas de usuario con fragmentos de manuales, contratos o guias manteniendo el contexto del documento.
- Deduplicacion y agrupacion de fragmentos: al disponer de embeddings contextuales, se pueden agrupar chunks semanticamente cercanos dentro de un mismo documento o entre documentos para tareas de clustering y organizacion de contenido.
- Almacenamiento eficiente en indice vectorial: gracias al soporte MRL a 1024 dimensiones y a la salida INT8, puede reducir el coste de almacenamiento y de calculo en motores de busqueda vectorial.
- Sistemas multilingues de recuperacion: al declararse multilingue, puede emplearse en bases de conocimiento con contenido en varios idiomas, indexando documentos y consultas en distintos idiomas.
- Evaluacion y comparacion de estrategias de chunking: al devolver un embedding por chunk con contexto, resulta util para medir como distintas politicas de fragmentacion afectan a la calidad de recuperacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir de los 8.4B parametros, no confirmada por el autor): aproximadamente 17 GB en FP16/BF16 solo para pesos, mas overhead de activaciones y del contexto de codificacion.
- En INT8, los pesos ocuparian en torno a 8-9 GB, aunque la informacion disponible solo indica que la salida es INT8, no que existan pesos cuantizados publicados.
- El repositorio ocupa 67.2 GB, lo que sugiere que incluye pesos en precision alta (por ejemplo, varias copias o formatos).
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, cabria esperar GPU de clase profesional (A100, H100) para FP16 y GPU de consumo con 24 GB (por ejemplo RTX 4090) para configuraciones de menor precision.
- Opciones de despliegue: al usar codigo personalizado y requerir `transformers>=5.4.0` con `trust_remote_code=True`, la integracion se realiza mediante `transformers` (`AutoModel.from_pretrained`). No se documenta soporte especifico para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de benchmarks ni de especificaciones de modelos comparables que permitan una comparacion cuantitativa fiable.

| Modelo | Parametros | Dimension de embedding | Contexto | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| pplx-embed-v2-context-9b-preview | 8.4B | 2048 (MRL 1024) | no disponible | MIT | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Version preview: los pesos, los embeddings y la interfaz pueden cambiar sin compatibilidad hacia atras; no deben mezclarse embeddings de esta version con los de una version futura.
- Metodos de codificacion obligatorios: usar `encode` para consultas en lugar de `encode_queries` degrada silenciosamente la calidad de recuperacion.
- Embeddings no normalizados: la salida nativa es INT8 sin normalizar; debe usarse similitud coseno o bien `normalize_embeddings=True` con producto escalar.
- Truncado MRL limitado: solo se entrenaron los tamanos 1024 y 2048; otros truncados no son validos.
- Longitud de contexto no especificada: se desconoce el maximo de tokens soportado, lo que dificulta planificar el tamano de chunk.
- Idiomas: se declara multilingue, pero no se detalla la cobertura ni la calidad por idioma.
- Riesgo de sesgos y de alucinacion: no se documentan evaluaciones de sesgo; al ser un modelo de embeddings, el riesgo de alucinacion se traslada al sistema generativo que consuma los resultados de recuperacion.
- Licencia MIT: permite uso comercial, pero al tratarse de una preview conviene verificar los terminos y la estabilidad de la interfaz antes de desplegarla en produccion.
- Dependencia de codigo personalizado con `trust_remote_code=True`, lo que implica ejecutar codigo del autor y revisarlo antes de usarlo en entornos productivos.

## Enlaces

- HuggingFace: https://huggingface.co/perplexity-ai/pplx-embed-v2-context-9b-preview
- Perplexity: https://www.perplexity.ai/
- Ask Perplexity: https://www.social.perplexity.ai/
- Guia de inicio de Perplexity: https://www.perplexity.ai/fr/hub/getting-started
- Perplexity en Microsoft Store: https://apps.microsoft.com/detail/9p9xg917pwcj
- Perplexity AI en Wikipedia: https://fr.wikipedia.org/wiki/Perplexity_AI
