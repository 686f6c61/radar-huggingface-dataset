# furiosa-ai/e5-mistral-7b-instruct

## Resumen

`furiosa-ai/e5-mistral-7b-instruct` es un repositorio que empaqueta el modelo de embeddings de texto `intfloat/e5-mistral-7b-instruct` junto con un Furiosa Executable Bundle (FXB) para ejecutarlo sobre aceleradores FuriosaAI RNGD mediante la librería Furiosa-LLM. No se trata de un modelo nuevo: el autor (furiosa-ai) redistribuye los pesos originales en FP16 del modelo de Intel/Intfloat y añade los artefactos necesarios para su despliegue en hardware propietario. El modelo base es un ajuste fino del backbone decoder denso Mistral-7B-v0.1 orientado a generar embeddings de 4.096 dimensiones mediante last-token pooling y normalización L2.

El problema que resuelve es el de la recuperación semántica y la similitud de textos de alta calidad: E5-Mistral-7B-Instruct es un modelo *instruction-aware*, lo que significa que las consultas se prefijan con una descripción de tarea en el formato `Instruct: ...\nQuery: ...`, mientras que los documentos se indexan sin instrucción. Con 7.110.660.096 parámetros y pesos safetensors, se posiciona en la gama de modelos de embeddings de 7B, un segmento que prioriza calidad de recuperación sobre latencia y coste.

La relevancia de esta ficha concreta es operativa: permite ejecutar el modelo sobre RNGD con un único acelerador (tensor-parallel de 8 PEs, es decir, una tarjeta completa) y exponerlo mediante un servidor compatible con la API de OpenAI (`/v1/embeddings`). Está publicado bajo licencia MIT ydeclara soporte únicamente para inglés, aunque el modelo subyacente fue ajustado con datos multilingües.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mistral (backbone decoder denso), clase `MistralModel` |
| Parámetros totales | 7.110.660.096 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | ninguno; se usan los pesos FP16 originales del modelo upstream |
| Idiomas soportados | inglés (declarado); el modelo upstream se ajustó con datos multilingües pero se recomienda para inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (más FXB, Furiosa Executable Bundle, para RNGD) |
| Dimensión de embedding | 4.096 |
| Pooling | last-token pooling con normalización L2 |
| Pipeline | feature-extraction |
| Hardware soportado | FuriosaAI RNGD (8 PEs por tarjeta, tensor-parallel size 8) |
| Tamaño del repositorio | 28,8 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso basado en Mistral-7B-v0.1, reutilizado como extractor de representaciones en lugar de como generador autoregresivo. La representación se obtiene tomando el estado oculto del último token y aplicando normalización L2, lo que produce vectores de 4.096 dimensiones cuyo producto escalar equivale a la similitud coseno. El ajuste fino del modelo upstream se realizó sobre datos multilingües supervisados con formato de instrucción, de modo que el modelo aprende a condicionar el embedding de la consulta a una descripción explícita de la tarea de recuperación.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni la presencia de etapas de RLHF o DPO en el ajuste del modelo base. La innovación técnica relevante en este repositorio no está en el entrenamiento, sino en el empaquetado: el FXB precompilado permite ejecutar el modelo en RNGD sin recompilación, con una estrategia de paralelismo de tensor de 8 PEs que ocupa una tarjeta completa y sin aplicar cuantización, manteniendo los pesos en FP16.

## Capacidades

- Generación de embeddings densos de 4.096 dimensiones para textos y consultas.
- Recuperación semántica (*retrieval*) instruction-aware: prefijo de tarea en consultas, documentos sin instrucción.
- Similitud semántica entre pares de textos mediante producto escalar de vectores normalizados.
- Clasificación y clustering de textos a partir de representaciones vectoriales.
- Indexación de documentos para motores de búsqueda vectorial.
- Servicio HTTP compatible con la API de OpenAI (`/v1/embeddings`), lo que facilita la integración con clientes existentes.
- Uso offline mediante la API Python de Furiosa-LLM (`LLM(...).embed(...)`).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de embeddings.
- Capacidad multilingüe no garantizada: la model card declara únicamente inglés como idioma soportado.

## Casos de uso

- Búsqueda semántica en documentación técnica: se indexan los fragmentos con el modelo sin instrucción y se consulta con el prefijo `Instruct: Given a web search query, retrieve relevant passages that answer the query`, obteniendo recuperación por similitud coseno sobre vectores de 4.096 dimensiones.
- Motor RAG (retrieval-augmented generation): el modelo actúa como retriever en pipelines que alimentan a un LLM generador; su salida normalizada permite usar índices vectoriales con distancia coseno o producto interno sin post-procesado.
- Deduplicación y clustering de corpus: se generan embeddings de artículos o tickets y se agrupan por similitud para detectar contenido duplicado o temas recurrentes en soporte.
- Sistemas de recomendación de contenido: se representan ítems y perfiles de usuario en el mismo espacio vectorial para recuperar ítems afines por vecindad.
- Filtrado y moderación semántica: se compara el embedding de un texto entrante con el de una lista de políticas o ejemplos de referencia para marcar casos próximos.
- Evaluación de calidad de respuestas: se mide la similitud entre una respuesta generada y una respuesta de referencia para métricas automáticas de fidelidad semántica.
- Despliegue en infraestructura FuriosaAI: organizaciones con aceleradores RNGD pueden servir el modelo con `furiosa-llm serve` y consumirlo con el cliente OpenAI sin adaptar su código de aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas MTEB ni comparativas numéricas, pese a que las etiquetas del repositorio mencionan `mteb` y `eval-results`.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 28,8 GB, coherente con pesos FP16 de 7,1B parámetros (aproximadamente 14,2 GB de pesos más artefactos del bundle). No se indica el consumo de memoria en ejecución.
- GPU/acelerador recomendado: FuriosaAI RNGD, una tarjeta completa (8 PEs) con tensor-parallel size 8.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada para el bundle Furiosa; el modelo upstream puede ejecutarse en otros frameworks (Sentence Transformers, Transformers), pero sus requisitos no se detallan aquí.
- Opciones de despliegue: Furiosa-LLM (`furiosa-llm serve` para servidor compatible con OpenAI; API Python `LLM` para uso offline). El modelo upstream es compatible con Sentence Transformers y Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensión de embedding | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| furiosa-ai/e5-mistral-7b-instruct | 7,1B | 4.096 | no disponible | MIT | Bundle para RNGD con servidor OpenAI-compatible |
| intfloat/e5-mistral-7b-instruct | 7,1B | 4.096 | no disponible | MIT | Modelo upstream; ejecutable en Sentence Transformers y Transformers |
| Alternativas de menor tamaño (p. ej. modelos de embeddings de 300M-1B) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

La comparativa con alternativas de la misma categoría no puede completarse con datos verificados a partir de la información disponible.

## Limitaciones y advertencias

- El repositorio declara soporte únicamente para inglés; el uso en otros idiomas no está garantizado aunque el ajuste upstream usara datos multilingües.
- Es un modelo de embeddings, no un generador: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- El formato de instrucción es obligatorio para consultas (`Instruct: ...\nQuery: ...`); omitirlo o aplicarlo también a los documentos degrada la calidad de recuperación.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de recuperación de pasajes semánticamente próximos pero irrelevantes; conviene combinar con re-ranking.
- El bundle FXB está atado al hardware FuriosaAI RNGD; fuera de esa plataforma debe usarse el modelo upstream con otro runtime.
- No se han publicado métricas de rendimiento ni evaluaciones MTEB en este repositorio, por lo que no es posible verificar la calidad frente a alternativas con datos propios.
- La licencia MIT permite uso comercial, pero debe verificarse la procedencia y condiciones de los datos de entrenamiento del modelo upstream para cumplimiento normativo.
- El repositorio tiene un volumen de descargas bajo (474) y ningún "like", lo que sugiere poca validación comunitaria del bundle.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/furiosa-ai/e5-mistral-7b-instruct
- Modelo upstream: https://huggingface.co/intfloat/e5-mistral-7b-instruct
- Documentación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Servidor Furiosa-LLM (`furiosa-llm serve`): https://developer.furiosa.ai/latest/en/furiosa_llm/furiosa-llm-serve.html
- Guía de instalación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- FuriosaAI: https://furiosa.ai
- Licencia MIT: https://opensource.org/license/mit
