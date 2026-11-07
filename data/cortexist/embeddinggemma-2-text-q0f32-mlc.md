# cortexist/embeddinggemma-2-text-q0f32-MLC

## Resumen

EmbeddingGemma 2 text-q0f32-MLC es un paquete de inferencia para MLC-LLM derivado de google/embeddinggemma-2, el modelo de embeddings multimodal de Google. No se trata de un modelo entrenado desde cero, sino de una conversion del checkpoint original a formato MLC con cuantizacion q0f32 (FP32), limitada exclusivamente al codificador de texto: los codificadores de vision y audio del modelo original han sido excluidos. El autor es cortexist y la publicacion se orienta a despliegue en hardware embebido, concretamente NVIDIA Jetson AGX Xavier.

La relevancia de esta ficha es doble. Por un lado, documenta una ruta poco habitual de despliegue de embeddings en GPUs Volta de borde (sm_72) mediante una bifurcacion propia de MLC-LLM. Por otro, ilustra las restricciones practicas de estas conversiones: ventana fija de 128 tokens, pooling de media enmascarado con normalizacion L2, dimensiones de salida reducibles a 128/256/512/768 y rechazo explicito de entradas que excedan el limite en lugar de truncarlas silenciosamente.

El modelo base, EmbeddingGemma 2, se presenta desde Google como un modelo ligero y multimodal que proyecta combinaciones de texto, imagen, audio y video a un espacio de embeddings unificado. Esta conversion concreta conserva unicamente la rama de texto, con 271.002.648 parametros en FP32 y un tamano de repositorio de 0,6 GB. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (codificador de texto de EmbeddingGemma 2); pesos convertidos a MLC-LLM |
| Parametros totales | 271.002.648 (FP32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens en bucket fijo con padding (incluye BOS=2 y EOS=1) |
| Tipos de cuantizacion | q0f32 (FP32); FP16 rechazado en este port |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Shards de parametros convertidos MLC + tensor-cache.json + tokenizer + mlc-chat-config.json |
| Dimensiones de embedding | 128 / 256 / 512 / 768 |
| Pooling | Masked mean pooling + normalizacion L2 |
| Hardware objetivo | NVIDIA Jetson AGX Xavier (Volta sm_72), JetPack 5 / CUDA 11.4 |
| Libreria | mlc-llm (fork cortexist/mlc-llm) |
| Tamano del repositorio | 0,6 GB |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

La arquitectura subyacente es un codificador transformer de tipo embedding, perteneciente a la familia EmbeddingGemma 2 de Google, que en su version completa es multimodal y mapea texto, imagen, audio y video a un espacio vectorial comun. Esta publicacion no incluye ningun entrenamiento nuevo: es una conversion de un checkpoint existente (relacion `quantized` respecto a google/embeddinggemma-2) y conserva unicamente el codificador de texto. El autor declara explicitamente que "these are conversions of existing checkpoints, not newly trained models".

La innovacion tecnica del paquete no reside en el modelo sino en la integracion con MLC-LLM: se aplica masked mean pooling y normalizacion L2 sobre las representaciones, se ofrece truncamiento por dimensiones (128/256/512/768) para reducir coste de almacenamiento y busqueda vectorial, y se impone un bucket fijo de 128 tokens con padding. Las entradas que superan ese limite se rechazan en lugar de truncarse de forma silenciosa, lo que evita degradaciones no controladas en produccion. El autor indica que las comprobaciones de referencia FP32 en CPU del modelo original pasan, y que FP16 fue descartado para este port. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni etapas de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de embeddings de texto para tareas de representacion densa (feature-extraction).
- Soporte de dimensiones de embedding reducidas: 128, 256, 512 y 768, utiles para ajustar el equilibrio entre precision y coste de indexacion.
- Normalizacion L2 integrada, lo que permite usar similitud coseno o producto escalar de forma directa.
- Pooling de media enmascarado que respeta el padding del bucket fijo de 128 tokens.
- Rechazo controlado de entradas superiores a 128 tokens, sin truncamiento implicito.
- No incluye capacidades de vision ni audio en esta conversion (codificadores excluidos).
- No incluye generacion de texto, tool calling, razonamiento multi-paso ni modo thinking: es exclusivamente un encoder.
- Idiomas soportados: no disponible en la informacion proporcionada.

## Casos de uso

- Busqueda semantica en dispositivos de borde: el paquete esta compilado para Jetson AGX Xavier (Volta sm_72) y permite calcular embeddings localmente sin conexion, con pesos FP32 de 0,6 GB que caben en la memoria unificada del modulo.
- Indice vectorial de documentacion tecnica con ventana corta: adecuado para fragmentos de menos de 128 tokens (titulos, descripciones, parrafos breves), donde el bucket fijo evita costes variables de computo.
- Deduplicacion y clustering de registros: los embeddings normalizados L2 permiten agrupar entradas similares con umbrales de similitud coseno estables entre ejecuciones.
- Filtrado previo en pipelines RAG embebidos: usar la dimension reducida de 128 para una primera fase de recuperacion rapida y baja huella de memoria, reservando dimensiones mayores para el re-ranking.
- Clasificacion de texto por similitud a prototipos: comparar embeddings de consultas contra vectores de referencia etiquetados para enrutamiento de tickets o moderacion simple.
- Despliegue en flotas de dispositivos con GPU Volta: al requerir el fork de MLC-LLM y bibliotecas precompiladas para aarch64/JetPack 5, encaja en escenarios donde el hardware esta fijado y se busca una ABI estable.
- Extraccion de caracteristicas en pipelines de MLOps: integracion como etapa de embedding en servicios propios, ya que el paquete incluye shards, tensor-cache.json, tokenizer y mlc-chat-config.json listos para el runtime del fork.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona que las comprobaciones de referencia FP32 en CPU del modelo original pasan, sin cifras de MMLU, MTEB ni otras metricas de recuperacion. Tampoco se ofrecen datos de latencia o throughput para Jetson AGX Xavier.

## Requisitos de hardware

- VRAM/memoria: pesos FP32 de 271 millones de parametros, aproximadamente 1,08 GB en crudo; el repositorio ocupa 0,6 GB, por lo que la huella efectiva es moderada y compatible con la memoria unificada de Jetson AGX Xavier (32 GB en la configuracion habitual del modulo).
- GPU objetivo: NVIDIA Jetson AGX Xavier (Volta, sm_72) con JetPack 5 / CUDA 11.4. Las bibliotecas incluidas en `libs/` son precompiladas para Linux aarch64 y no son portables a otras GPU, sistemas operativos o ABIs de runtime.
- GPU de escritorio/servidor: no cualificadas para este paquete; otros dispositivos requieren recompilacion desde el fork.
- Cabe en GPU consumer: no disponible como paquete listo para usar; requeriria recompilacion y no se documenta compatibilidad con RTX 4090 u otras.
- Despliegue: exclusivamente mediante el fork cortexist/mlc-llm (definiciones, conversion, builds y serving). El MLC-LLM upstream no es un runtime cualificado para estos paquetes. Los pesos por si solos no proporcionan servidor HTTP.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| cortexist/embeddinggemma-2-text-q0f32-MLC | 271 M (FP32) | 128 tokens (bucket fijo) | Solo texto | Apache 2.0 | MLC-LLM (fork), aarch64 sm_72 |
| google/embeddinggemma-2 | no disponible | no disponible | Texto, imagen, audio y video | no disponible en la informacion | Checkpoint original |
| Alternativas de embeddings de texto de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre esta conversion y otras alternativas, por lo que la comparativa se limita a parametros, modalidad y requisitos de runtime.

## Limitaciones y advertencias

- Ventana de contexto muy corta: 128 tokens con padding fijo; las entradas mas largas se rechazan, lo que obliga a fragmentar documentos y puede perder contexto en parrafos extensos.
- Solo texto: los codificadores de vision y audio del modelo base estan excluidos, por lo que no puede generar embeddings multimodales.
- Portabilidad nula de las bibliotecas: `libs/` esta compilado para Linux aarch64, Jetson AGX Xavier (sm_72), JetPack 5 y CUDA 11.4; no funciona en otras GPU ni sistemas sin recompilacion.
- Dependencia de un fork: requiere cortexist/mlc-llm; el MLC-LLM upstream no esta cualificado y puede producir resultados incorrectos.
- FP16 rechazado: no se debe sustituir la cuantizacion por FP16 en este port.
- Sin servidor incluido: los pesos no proporcionan endpoint HTTP; es necesario montar el serving con el fork.
- La capacidad de contexto completa es un limite de configuracion, no una garantia de calidad ni de estabilidad en contextos largos, segun el propio autor.
- Evaluacion limitada a las condiciones registradas; no hay benchmarks publicados de recuperacion ni de calidad de embeddings.
- Riesgo de sesgo y alucinacion: no evaluado en la informacion disponible; al ser un encoder, el riesgo se traslada a los sistemas de recuperacion que lo usen (falsos positivos en similitud).
- Licencia Apache 2.0 declarada, con terminos y atribucion del modelo original conservados en los ficheros de licencia y aviso; verificar dichos ficheros antes de uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria documentada.

## Enlaces

- Hugging Face: https://huggingface.co/cortexist/embeddinggemma-2-text-q0f32-MLC
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Fork MLC-LLM requerido: https://github.com/cortexist/mlc-llm
- README del fork: https://github.com/cortexist/mlc-llm#readme
- Guia de despliegue en Xavier: https://github.com/cortexist/mlc-llm/blob/main/deploy/xavier/README.md
- Blog de Google sobre EmbeddingGemma 2: https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2/
