# pt810/Ovis-Omni-Embedding-3B-high-low-high-ct

## Resumen

Ovis-Omni-Embedding-3B-high-low-high-ct es un checkpoint derivado de ATH-MaaS/Ovis-Omni-Embedding-3B, un modelo de embeddings universal de aproximadamente 3.000 millones de parametros que proyecta texto, imagenes, documentos visuales, video, audio y entradas multimodales intercaladas en un unico espacio de representacion. El modelo base parte de Qwen2.5-Omni-3B y conserva su tokenizador de texto, su codificador de vision, su codificador de audio y el backbone compartido Thinker, pero elimina el modulo de generacion de voz (Talker) y la cabeza de modelado de lenguaje: la representacion de recuperacion es directamente el estado oculto de la ultima capa en el ultimo token no de relleno.

El checkpoint analizado aqui no es una publicacion oficial del equipo de Ovis, sino una derivada de cuantizacion experimental generada por el usuario pt810 con el objetivo declarado de reproducibilidad. Aplica cuantizacion RTN con precision mixta sobre las capas del Thinker: W8A16 en las capas 0-5 y 22-27, y W2A16 en las capas 6-21, manteniendo las torres multimodales en BF16. Incluye metadatos de compressed-tensors pensados para el cargador Marlin/Humming de vLLM.

Su relevancia es doble. Por un lado, muestra el interes creciente por modelos de embedding any-to-any que evitan torres especificas por modalidad y permiten recuperacion cruzada con un solo codificador, algo util para RAG multimodal, busqueda de video o audio y recuperacion agentica. Por otro lado, sirve como caso practico de los limites actuales de la cuantizacion agresiva: el autor documenta que vLLM no pudo inicializar el checkpoint de aproximadamente 8,03 GB en una GPU RTX 3080 Laptop de 8 GiB, y no se reclama ninguna garantia de calidad de embedding ni de contexto completo para este artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal multimodal (backbone Thinker de Qwen2.5-Omni) con TMRoPE; tokenizador de texto, codificador de vision y codificador de audio nativos; sin cabezas de proyeccion por modalidad; se eliminan el Talker y la cabeza de modelado de lenguaje |
| Parametros totales | 2935 (recuento de safetensors del repositorio; el modelo base se presenta como 3B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Derivada RTN con precision mixta: W8A16 en las capas 0-5 y 22-27, W2A16 en las capas 6-21 del Thinker; torres multimodales en BF16; metadatos compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con metadatos compressed-tensors para vLLM Marlin/Humming) |
| Dimension del embedding | no disponible |
| Tamano del repositorio | 8,0 GB (checkpoint citado como aproximadamente 8,03 GB) |
| Pipeline declarado | feature-extraction |
| Descargas / likes | 6 descargas, 0 likes |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal unico que procesa una secuencia intercalada de tokens de texto, visuales y acusticos. La entrada se formatea con una instruccion de recuperacion mediante el procesador y la plantilla de chat nativos del modelo, de modo que todas las modalidades pasan por el mismo backbone Thinker de Qwen2.5-Omni. El TMRoPE (time-aligned multimodal rotary position embedding) de Qwen2.5-Omni preserva la alineacion temporal entre audio y video, lo que resulta critico para recuperacion sobre clips con pistas de audio sincronizadas. No hay torres de embedding especificas por modalidad ni cross-attention entre consulta y candidato: la representacion se obtiene del estado oculto de la ultima capa en el ultimo token no de relleno, normalizado L2.

El entrenamiento descrito en el informe tecnico del modelo base consta de tres etapas. La primera es un preentrenamiento contrastivo omni-modal con candidatos mezclados globalmente y negativos in-batch distribuidos entre dispositivos, con un objetivo que combina aprendizaje contrastivo focal sensible a la dificultad y destilacion de distribuciones de similitud desde expertos complementarios por modalidad. La segunda es un ajuste fino homogeneo de todos los parametros sobre datos de alta calidad, donde cada micro-lote procede de un unico dataset y se deduplican los candidatos para evitar colisiones entre positivos y falsos negativos in-batch. La tercera es una destilacion de embeddings con annealing: se conservan los ejemplos resueltos por el profesor, se sobremuestrean los que el estudiante no resuelve y se aplica supervision forward-KL adaptativa a la confianza. Ademas, se describe un modulo de descomposicion de bajo rango en tiempo de inferencia que combina una base PCA compartida con adaptadores residuales ligeros. En esta derivada concreta, el autor no aporta datos de entrenamiento propios: solo la receta de cuantizacion.

## Capacidades

- Generacion de embeddings para recuperacion sobre texto, imagenes, documentos visuales, video, audio y entradas multimodales intercaladas, todo en un unico espacio vectorial.
- Recuperacion any-to-any mediante bi-encoder: consulta y candidato se codifican por separado y se puntuan por similitud coseno tras normalizacion L2, sin cross-attention.
- Recuperacion de documentos visuales, lo que cubre capturas de interfaz, paginas escaneadas y diagramas.
- Busqueda sobre video y audio con alineacion temporal gracias al TMRoPE heredado del modelo base.
- Uso como componente de recuperacion en pipelines de generacion aumentada por recuperacion (RAG) multimodal.
- Recuperacion agentica sobre herramientas, interfaces y memoria, segun la descripcion del modelo base.
- Aplicaciones de recomendacion basadas en similitud entre elementos multimodales.
- No realiza generacion de texto ni de voz: el Talker y la cabeza de modelado de lenguaje se han eliminado en el modelo base.
- Soporte de tool calling, function calling, modo pensamiento, vision generativa o audio generativo: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta informado en la informacion proporcionada).

## Casos de uso

- Recuperacion multimodal en RAG: se indexan pasajes de texto, paginas escaneadas, imagenes y clips de audio en el mismo espacio, y la consulta del usuario (en cualquier modalidad soportada) recupera candidatos de cualquier otra. Adecuado porque el modelo es un bi-encoder con una sola torre compartida y no requiere encoders separados por modalidad.
- Busqueda de documentos visuales: indexacion de capturas de interfaz, formularios o informes escaneados para localizar el documento relevante a partir de una consulta textual, sin necesidad de OCR previo.
- Busqueda en archivos de video y audio: localizacion de fragmentos por contenido semantico aprovechando la alineacion temporal entre audio y video que proporciona el TMRoPE.
- Deduplicacion y agrupamiento de catalogos multimodales: calculo de similitudes cruzadas entre elementos (imagen-texto-audio) para detectar duplicados o agrupar por tematica en un comercio o una mediateca.
- Recomendacion de contenido: representacion de usuarios y elementos en el mismo espacio para recuperar candidatos por similitud coseno en lugar de recurrir a modelos de ranking especificos por modalidad.
- Recuperacion agentica de memoria: un agente almacena observaciones multimodales y recupera las relevantes antes de cada paso de razonamiento, lo que encaja con el objetivo declarado de recuperacion sobre herramientas, interfaces y memoria.
- Moderacion y triaje de contenido multimedia: comparacion de contenido entrante contra una base de referencia de elementos problematicos mediante similitud vectorial.
- Advertencia transversal: al tratarse de una derivada de cuantizacion no validada y con precision muy reducida (W2A16) en 16 de las capas del Thinker, conviene tratar estos casos de uso como sujetos a evaluacion previa en el dominio concreto antes de cualquier despliegue en produccion.

## Benchmarks y rendimiento

La model card del modelo base menciona MMEB-v3, un benchmark omni-modal de 190 datasets, pero el extracto disponible se interrumpe antes de incluir cifras. Para esta derivada, el autor declara explicitamente que no formula ninguna afirmacion de calidad de embedding ni de comportamiento a contexto completo.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El autor indica que vLLM alcanzo la resolucion del modelo pero no pudo inicializar el checkpoint de aproximadamente 8,03 GB en una GPU RTX 3080 Laptop de 8 GiB, porque el modelo mas la cabeza de salida excedian la VRAM disponible. Es decir, 8 GiB no son suficientes para este artefacto.
- VRAM estimada para inferencia: por encima de los 8 GiB como minimo absoluto, dado que solo los pesos ocupan cerca de 8 GB y hay que sumar activaciones, buffers y la salida de embeddings. Como estimacion orientativa, se necesitarian del orden de 12-16 GB para operar con comodidad en precision mixta BF16/INT. Esta cifra es una estimacion a partir del tamano del checkpoint, no un dato publicado.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano de checkpoint, quedan descartadas las GPU consumer de 8 GiB y seria razonable apuntar a GPU de 16-24 GiB o superiores para servicio.
- Cabe en GPU consumer: no en tarjetas de 8 GiB, segun la prueba documentada por el autor. En tarjetas de 12-24 GiB es probable que quepa, pero no hay confirmacion publicada.
- Opciones de despliegue: los metadatos compressed-tensors estan pensados para el cargador Marlin/Humming de vLLM; el repositorio tambien se declara compatible con la libreria transformers. Compatibilidad con llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Formato y cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|---|
| pt810/Ovis-Omni-Embedding-3B-high-low-high-ct | 2935 (recuento de safetensors) | no disponible | Texto, imagen, video, audio, intercalado | safetensors con RTN W8A16/W2A16/BF16 y metadatos compressed-tensors | apache-2.0 | Derivada experimental; el autor no reclama calidad validada |
| ATH-MaaS/Ovis-Omni-Embedding-3B | 3B (aproximado) | no disponible | Texto, imagen, documento visual, video, audio, intercalado | safetensors | apache-2.0 | Modelo base con informe tecnico; referencia de calidad |
| Qwen2.5-Omni-3B | 3B (aproximado) | no disponible | Texto, imagen, audio, video | safetensors | no disponible en la informacion proporcionada | Modelo generativo original del que se inicializa el base |
| Ovis-Embedding-VL-2B / 9B | 2B y 9B | no disponible | Vision y lenguaje (segun la figura citada) | no disponible | no disponible | Mencionados en el informe tecnico, sin datos en esta informacion |

No se dispone de cifras de rendimiento comparadas para ninguno de estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, modalidades, formato y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluacion de sesgo para esta derivada ni se han detallado en la informacion proporcionada para el modelo base.
- Riesgo de alucinacion: no aplica a la generacion de texto porque el modelo no genera contenido; el riesgo equivalente es la recuperacion de candidatos irrelevantes o mal puntuados, agravado por la falta de validacion de calidad de esta cuantizacion.
- La cuantizacion W2A16 aplicada a 16 de las 28 capas del Thinker es muy agresiva. Aunque el autor la presenta como reproducible, no aporta mediciones de degradacion frente al modelo base en BF16.
- El autor no respalda este artefacto como una version de servicio validada: solo como derivada para reproducibilidad.
- No hay ninguna afirmacion sobre comportamiento a contexto completo, por lo que el uso con secuencias largas es una incognita.
- La longitud de contexto soportada y los idiomas disponibles no estan documentados en la informacion proporcionada.
- Despliegue problematico en GPU consumer de 8 GiB, verificado por el propio autor con vLLM en una RTX 3080 Laptop.
- Licencia apache-2.0 en el repositorio, lo que en principio permite uso comercial, pero conviene verificar la licencia del modelo base ATH-MaaS/Ovis-Omni-Embedding-3B y de Qwen2.5-Omni-3B antes de un despliegue en produccion, asi como las condiciones de los datos de entrenamiento.
- Adopcion practicamente nula: 6 descargas y 0 likes en el momento de la consulta, sin issues ni validacion externa conocida.
- El nombre del checkpoint (high-low-high) describe la distribucion de precision por profundidad; cualquier reutilizacion debe tener en cuenta que el perfil de cuantizacion es parte del artefacto y no es intercambiable con el modelo base.

## Enlaces

- Checkpoint analizado: https://huggingface.co/pt810/Ovis-Omni-Embedding-3B-high-low-high-ct
- Modelo base: https://huggingface.co/ATH-MaaS/Ovis-Omni-Embedding-3B
- Repositorio GitHub del proyecto: https://github.com/ATH-MaaS/Ovis-Omni-Embedding
- Informe tecnico (arXiv): https://arxiv.org/pdf/2609.25165
- Modelo del que se inicializa el base, Qwen2.5-Omni-3B: no disponible enlace directo en la informacion proporcionada.
