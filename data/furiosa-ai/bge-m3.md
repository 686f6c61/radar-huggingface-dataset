# furiosa-ai/bge-m3

## Resumen

furiosa-ai/bge-m3 es una compilación en BF16 del modelo de embeddings multilingüe BGE-M3 de BAAI, empaquetada por FuriosaAI para su ejecución en aceleradores RNGD mediante la librería Furiosa-LLM. No se trata de un modelo nuevo ni de un fine-tuning: es una distribución del mismo encoder XLM-RoBERTa (567,7 millones de parámetros) con un Furiosa Executable Bundle (FXB) precompilado, orientada a desplegar búsqueda semántica y recuperación de información sobre hardware NPU de FuriosaAI.

El modelo resuelve el problema de generar representaciones vectoriales densas de 1.024 dimensiones para similitud semántica, búsqueda y clustering de documentos. Su relevancia actual radica en que ofrece una vía de despliegue del conocido BGE-M3 fuera del ecosistema GPU, con un servidor compatible con la API de embeddings de OpenAI y una estrategia de paralelismo tensorial de 8 PEs que ocupa una única tarjeta RNGD.

Conviene subrayar que esta build expone únicamente los embeddings densos CLS-pooled; las capacidades de recuperación dispersa (sparse lexical) y multi-vector del BGE-M3 original no se anuncian en esta integración. Para usos con FlagEmbedding, Sentence Transformers o Transformers, la model card remite al repositorio upstream de BAAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (encoder denso, `XLMRobertaModel`) |
| Parametros totales | 567.754.752 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (sin esquema de cuantizacion de menor precision) |
| Idiomas soportados | no disponibles (el modelo upstream BGE-M3 es multilingue) |
| Licencia | MIT |
| Formato de pesos | safetensors + Furiosa Executable Bundle (FXB); libreria furiosa-llm |
| Dimension de embedding | 1.024 (pooling CLS, normalizado L2) |
| Hardware soportado | FuriosaAI RNGD (8 PEs por tarjeta, tensor-parallel size 8) |
| Tamano del repositorio | 1,3 GB |

## Arquitectura y entrenamiento

La arquitectura es la del encoder XLM-RoBERTa de BGE-M3, un transformer bidireccional que produce una representación densa por texto mediante pooling de la token CLS y normalización L2, de modo que el producto escalar entre vectores equivale a la similitud coseno. El modelo upstream de BAAI unifica tres modos de recuperación (denso, disperso léxico y multi-vector); esta build de FuriosaAI expone solo la salida densa de 1.024 dimensiones.

No se dispone en la información proporcionada de detalles sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si hubo etapas de ajuste con datos de pares o preferencias. Tampoco se documentan innovaciones de decodificación o atención específicas de esta build. La aportación técnica propia de FuriosaAI es la compilación a BF16 y el empaquetado FXB para RNGD, junto con la integración en Furiosa-LLM: servidor OpenAI-compatible con endpoint `/v1/embeddings` y API Python (`LLM(...).embed(...)`). BGE-M3 no requiere prefijo de instrucción en las consultas.

## Capacidades

- Generación de embeddings densos de 1.024 dimensiones para textos, con normalización L2 y similitud coseno directa por producto escalar.
- Similitud semántica entre frases y documentos (`pipeline_tag: sentence-similarity`).
- Extracción de características (`feature-extraction`) y uso como modelo de sentence-transformers.
- Búsqueda semántica y recuperación de información sobre corpus indexados.
- Capacidades multilingües heredadas del modelo upstream BGE-M3 (la model card de esta build no detalla la lista de idiomas).
- Servidor compatible con la API de embeddings de OpenAI, lo que permite sustituir clientes existentes sin cambios de código.
- No se documentan en esta build tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento: es un encoder, no un modelo generativo.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar manuales y fragmentos de código como vectores de 1.024 dimensiones y recuperar por similitud coseno; el modelo está pensado exactamente para esta tarea y el endpoint OpenAI-compatible simplifica la integración con bases vectoriales existentes.
- Motor de recuperación en pipelines RAG: generar embeddings de pasajes y consultas para alimentar un sistema de generación aumentada; el despliegue en una sola tarjeta RNGD con tensor-parallel de 8 PEs facilita el servicio dedicado de recuperación.
- Deduplicación y clustering de documentos: agrupar artículos, tickets o registros con contenido casi idéntico calculando similitudes por producto escalar sobre vectores normalizados.
- Moderación y clasificación por similitud: comparar mensajes entrantes con un conjunto de referencia de casos etiquetados para enrutar o priorizar revisiones.
- Sistemas de recomendación basados en contenido: representar ítems y perfiles de usuario en el mismo espacio vectorial y ordenar candidatos por afinidad semántica.
- Búsqueda multilingüe en catálogos: aprovechar la naturaleza multilingüe del modelo upstream para consultar documentos en un idioma y recuperar resultados en otro, siempre que se valide el comportamiento en los idiomas objetivo.
- Sustitución de proveedores de embeddings en producción: al exponer `/v1/embeddings` compatible con OpenAI, se puede migrar un servicio existente apuntando el cliente al servidor de Furiosa-LLM sin reescribir la lógica de aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta build no incluye métricas de recuperación (nDCG, Recall@k), MMLU, HumanEval, GSM8K ni latencias o throughput medidos.

## Requisitos de hardware

- Hardware objetivo: FuriosaAI RNGD, con tensor-parallel size de 8 PEs, que corresponde a una única tarjeta RNGD.
- No se documenta soporte para GPU NVIDIA, AMD ni ejecución en CPU en esta build; para esos entornos la model card remite a BAAI/bge-m3 con FlagEmbedding, Sentence Transformers o Transformers.
- VRAM estimada: no disponible (no es un despliegue en GPU; el modelo pesa 567,7 M de parámetros en BF16, aproximadamente 1,1 GB de pesos).
- ¿Cabe en GPU de consumo? No disponible para esta build; el modelo upstream, por su tamaño, es ejecutable en GPU de consumo con frameworks estándar, pero no se aportan cifras verificadas en la información disponible.
- Opciones de despliegue: `furiosa-llm serve furiosa-ai/bge-m3` (servidor OpenAI-compatible en el puerto 8000) o la API Python `furiosa_llm.LLM` para uso offline; el FXB incluido en el repositorio se descubre automáticamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salidas | Licencia | Hardware / despliegue |
|---|---|---|---|---|---|
| furiosa-ai/bge-m3 | 567,7 M | no disponible | Embedding denso 1.024 d | MIT | FuriosaAI RNGD, Furiosa-LLM |
| BAAI/bge-m3 (upstream) | 567,7 M | no disponible en esta informacion | Denso, disperso y multi-vector | MIT | GPU/CPU, FlagEmbedding, Sentence Transformers, Transformers |
| Otros modelos de embeddings de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con el modelo upstream: misma arquitectura y mismos pesos en esencia, pero la build de FuriosaAI limita la salida al embedding denso y ata el despliegue al hardware RNGD, mientras que el original ofrece los tres modos de recuperación y funciona en el ecosistema estándar de Python.

## Limitaciones y advertencias

- Dependencia de hardware propietario: la build está compilada para FuriosaAI RNGD; no se documenta ejecución en GPU o CPU, lo que limita la portabilidad y crea dependencia de un único proveedor.
- Solo se exponen embeddings densos; las capacidades sparse y multi-vector del BGE-M3 original no están disponibles en esta integración.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento; cualquier expectativa de chatbot o agente queda fuera de su alcance.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de recuperaciones irrelevantes si los umbrales de similitud o la estrategia de chunking no se calibran.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; al heredar los pesos del upstream, arrastra los sesgos de su corpus de entrenamiento.
- Idiomas: la lista de idiomas soportados no está disponible en esta ficha; debe validarse empíricamente en los idiomas de producción antes de desplegar.
- Longitud de contexto: no disponible; conviene verificar el límite efectivo de tokens por entrada antes de indexar documentos largos.
- Licencia MIT, que permite uso comercial, pero debe revisarse también la licencia y las condiciones del runtime Furiosa-LLM y del hardware.
- Repositorio con 513 descargas y 0 likes: tracción comunitaria muy baja, por lo que el soporte y la validación de terceros son escasos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/furiosa-ai/bge-m3
- Modelo upstream: https://huggingface.co/BAAI/bge-m3
- Documentación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Servidor Furiosa-LLM (`furiosa-llm serve`) y API de embeddings: https://developer.furiosa.ai/latest/en/furiosa_llm/furiosa-llm-serve.html
- Guía de instalación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- Sitio de FuriosaAI: https://furiosa.ai
- Licencia MIT: https://opensource.org/license/mit
