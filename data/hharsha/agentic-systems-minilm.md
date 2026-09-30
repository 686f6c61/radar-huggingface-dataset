# hharsha/agentic-systems-minilm

## Resumen

agentic-systems-minilm es un modelo de embeddings de frases (sentence embeddings) desarrollado por el ingeniero Hanumanthu Harsha Vardhan (usuario hharsha en HuggingFace). Se trata de un ajuste fino de dominio del conocido `sentence-transformers/all-MiniLM-L6-v2`, especializado en busqueda semantica y agrupamiento de textos cortos relacionados con sistemas agenticos, pipelines RAG, herramientas MCP y documentacion de proyectos de LLMOps. Genera vectores densos de 384 dimensiones y esta pensado para ejecutarse en CPU.

El modelo no es generativo: no produce texto, sino representaciones vectoriales que permiten calcular similitud coseno entre frases. Con 22.713.216 parametros (aproximadamente 22,7 millones) y un repositorio de 0,1 GB, es un modelo muy ligero orientado a tareas de recuperacion y clasificacion. Su relevancia radica en que demuestra una adaptacion ligera de dominio sobre un encoder pequeno ya muy extendido, pensada para mejorar la calidad de recuperacion en corpus tecnicos especificos sin necesidad de infraestructura GPU.

La informacion publica es limitada: el modelo registra 0 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de benchmarks. Esta ficha recoge exclusivamente los datos disponibles en la model card, la informacion de HuggingFace y los resultados de busqueda web proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM-L6, 6 capas), orientado a sentence-transformers |
| Parametros totales | 22.713.216 (aprox. 22,7 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base all-MiniLM-L6-v2 documenta 256 tokens de longitud maxima) |
| Tipos de cuantizacion | No disponible (pesos distribuidos en safetensors; compatible con cuantizacion via ONNX o similares, no confirmado por el autor) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Dimension del embedding | 384 |
| Tamano del repositorio | 0,1 GB |
| Funcion de perdida de entrenamiento | CosineSimilarityLoss |
| Dataset de entrenamiento | hharsha/agentic-systems-showcase |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura de `sentence-transformers/all-MiniLM-L6-v2`, un transformer encoder basado en MiniLM de 6 capas y 22,7 millones de parametros que produce embeddings de 384 dimensiones. No incorpora mecanismos de atencion lineal, decodificacion especulativa ni componentes híbridos SSM: es un encoder denso clasico orientado a similitud semantica.

El entrenamiento consistio en una adaptacion ligera de dominio: un unico epoch con la funcion de perdida CosineSimilarityLoss, ejecutado en CPU con un tamano de lote de 8. Los datos de entrenamiento combinan pares nombre/resumen del dataset `hharsha/agentic-systems-showcase` con pares sinteticos de pregunta/respuesta corta sobre proyectos del autor (AgentFleet, RetrievalLab, AgentOps Studio, Vibespace, Agent OS, CareerAgent, Control Tower y agentgrid). No se menciona el uso de RLHF, DPO ni tecnicas de alineacion; se trata de un ajuste por similitud supervisada. Los pesos parten de MiniLM-L6-v2 y solo se adaptan ligeramente, por lo que conserva las capacidades generales del modelo base.

## Capacidades

- Generacion de embeddings de frases: produce vectores de 384 dimensiones para textos cortos.
- Busqueda semantica: recuperacion de documentos por similitud coseno sobre consultas en lenguaje natural.
- Similitud entre frases: comparacion directa de pares de textos (sentence-similarity).
- Agrupamiento (clustering): agrupacion de textos por cercania en el espacio de embeddings.
- Extraccion de caracteristicas (feature-extraction): uso como encoder para pipelines posteriores.
- Adaptacion de dominio a contenido sobre sistemas agenticos, RAG, herramientas MCP y LLMOps.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio ni tool calling.
- No soporta agentes ni razonamiento multi-paso por si mismo; su funcion es puramente de representacion vectorial.
- Soporte multilingue limitado al ingles; no se declaran otros idiomas.

## Casos de uso

- Recuperacion en pipelines RAG: indexar fragmentos de documentacion tecnica sobre agentes y RAG en una base vectorial y recuperar los mas relevantes para una consulta, aprovechando la adaptacion de dominio sobre vocabulario de sistemas agenticos.
- Busqueda semantica interna de documentacion: permitir a un equipo consultar documentacion de proyectos propios (por ejemplo, notas de arquitectura de agentes) mediante lenguaje natural en lugar de coincidencia exacta de palabras clave.
- Deduplicacion y agrupamiento de incidencias: agrupar tickets, issues o descripciones de tareas por similitud semantica para detectar duplicados o clasificar por tema.
- Clasificacion de textos cortos: usar los embeddings como entrada a un clasificador ligero (regresion logistica, SVM) para etiquetar consultas o documentos por categoria.
- Reranking ligero en CPU: en entornos sin GPU, emplear el modelo para puntuar candidatos recuperados por un primer filtro y reordenarlos por similitud.
- Moderacion o filtrado de contenido tecnico: detectar si un texto entrante trata de un tema concreto del dominio agentico comparando su embedding con vectores de referencia.
- Recomendacion de contenido relacionado: sugerir proyectos, articulos o documentacion similar a un elemento dado, calculando vecinos mas cercanos en el espacio de embeddings.
- Indexacion de portfolios y catalogos de proyectos: construir un buscador sobre un catalogo de proyectos de IA y agentes usando similitud semantica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (MTEB, MMLU, HumanEval ni ninguna otra) y la busqueda web no aporta resultados especificos para este modelo. En el momento de la consulta cuenta con 0 descargas y 0 likes, por lo que no existe evidencia publica de rendimiento mas alla de la descripcion del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: muy inferior a 1 GB. Con 22,7 millones de parametros, en FP32 ocupa aproximadamente 90 MB de pesos; en FP16 en torno a 45 MB.
- GPU recomendadas: cualquier GPU moderna es mas que suficiente; no requiere GPU dedicada. Funciona en CPU de forma nativa segun la model card.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) y tambien en CPU. El entrenamiento declarado se realizo en CPU.
- Opciones de despliegue: libreria `sentence-transformers`; tambien es compatible con Text Embeddings Inference (TEI), segun la etiqueta `text-embeddings-inference` del repositorio, y con endpoints compatibles. Es exportable a ONNX para despliegue optimizado en CPU.
- Latencia y throughput estimados: no disponibles. Por tamano y arquitectura, se espera una latencia muy baja en CPU y practicamente despreciable en GPU, aunque no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones del embedding | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| hharsha/agentic-systems-minilm | 22,7 M | 384 | No disponible | Ingles | Apache-2.0 | HuggingFace (0 descargas) |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 384 | No disponible en la informacion proporcionada | Ingles (principalmente) | Apache-2.0 | HuggingFace (ampliamente usado) |
| Otros modelos de embeddings pequenos (por ejemplo, familia BGE-small o E5-small) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion directa se limita al modelo base, dado que la informacion proporcionada no incluye datos de otros modelos de embeddings. La diferencia principal frente a `all-MiniLM-L6-v2` es la adaptacion de dominio sobre contenido agentico y RAG, con un coste computacional identico al partir de los mismos pesos y arquitectura.

## Limitaciones y advertencias

- No es un modelo generativo: no puede mantener conversaciones ni generar texto; solo produce embeddings.
- Alcance de idioma restringido al ingles; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Ajuste de dominio estrecho: esta optimizado para textos cortos sobre sistemas agenticos, RAG y LLMOps. Su uso en corpus generales, medicos o legales esta explicitamente desaconsejado por el autor.
- Entrenamiento muy corto: un unico epoch en CPU con tamano de lote de 8 y datos en parte sinteticos, lo que limita la magnitud de la mejora frente al modelo base y puede introducir sesgos hacia el vocabulario especifico del dataset.
- Sin evidencia publica de calidad: no hay benchmarks ni descargas que respalden su rendimiento; conviene evaluarlo en el dominio objetivo antes de usarlo en produccion.
- Riesgo de recuperacion sesgada: al estar adaptado a un conjunto reducido de proyectos, puede favorecer terminos de ese vocabulario en detrimento de consultas genericas.
- Al tratarse de un modelo de embeddings, el concepto de alucinacion no aplica directamente, pero una recuperacion deficiente puede propagar resultados irrelevantes a un sistema RAG posterior.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion, heredada del modelo base; los datos de entrenamiento se declaran bajo licencia MIT (showcase). Verificar los terminos de los datos sinteticos si se reutilizan.
- Metadatos llamativos: las fechas de creacion y actualizacion indicadas (2026-09-30) y los contadores en cero sugieren un modelo recien publicado y sin validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hharsha/agentic-systems-minilm
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/hharsha/agentic-systems-showcase
- Modelo relacionado (generador de etiquetas): https://huggingface.co/hharsha/agentic-github-tagger
- Modelo relacionado (adaptador LoRA): https://huggingface.co/hharsha/agentic-rag-lora
- Space de portfolio: https://huggingface.co/spaces/hharsha/agent-portfolio
- Sitio del estudio: https://agentic-systems-studio.com
- GitHub del autor: https://github.com/hharsha98
- Leaderboard de modelos agenticos (referencia general): https://benchlm.ai/agentic
- Leaderboard general de benchmarks de LLM (referencia general): https://benchlm.ai/
