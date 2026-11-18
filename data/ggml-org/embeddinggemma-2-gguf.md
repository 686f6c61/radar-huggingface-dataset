# ggml-org/embeddinggemma-2-GGUF

## Resumen

embeddinggemma-2-GGUF es la conversión al formato GGUF del modelo de embeddings google/embeddinggemma-2, publicada por la organización ggml-org. Se trata de un modelo de extracción de características (feature-extraction) orientado a generar representaciones vectoriales densas de texto, pensado para tareas de búsqueda semántica, recuperación de información (RAG) y similitud entre fragmentos de texto. Con 271.002.648 parámetros, es un modelo compacto que prioriza eficiencia de despliegue frente a capacidades generativas.

La relevancia de esta publicación radica en el formato: al estar en GGUF, el modelo puede ejecutarse en llama.cpp y en el servidor `llama serve`, lo que facilita su integración en entornos locales y de borde sin depender de infraestructura GPU dedicada. La conversión es automática mediante la herramienta ggml-org/convert, lo que implica que las peculiaridades de tokenización y pooling dependen del modelo base original de Google.

El repo ocupa 3,9 GB e incluye múltiples archivos cuantizados. La licencia Apache 2.0 y la compatibilidad con endpoints lo hacen apto para uso comercial, aunque las capacidades exactas de idioma y contexto no están documentadas en la información disponible de esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de embeddings derivado de google/embeddinggemma-2; la model card de la conversión no detalla la arquitectura) |
| Parametros totales | 271.002.648 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF cuantizado (el repo incluye archivos GGUF; los niveles concretos de cuantización no se detallan en la información disponible) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); modelo base original en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la model card de esta conversión. El modelo base es google/embeddinggemma-2, un modelo de embeddings de la familia Gemma, y esta publicación es una conversión automática a GGUF realizada con la herramienta ggml-org/convert. Por tanto, la arquitectura subyacente corresponde a la del modelo original de Google, pero los detalles concretos (tipo de transformer, mecanismo de pooling, dimensionalidad del embedding, función de pérdida de entrenamiento) no están documentados en la información proporcionada.

Tampoco se especifican los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO o técnicas de contraste tipo SimCSE). Para obtener esos datos sería necesario consultar la model card del modelo base google/embeddinggemma-2, que no forma parte de la información disponible en esta ficha.

## Capacidades

- Generación de embeddings de texto para similitud semántica y búsqueda vectorial.
- Extracción de características (feature-extraction) para pipelines de recuperación aumentada por generación (RAG).
- Cálculo de similitud entre consultas y documentos mediante producto escalar o coseno sobre los vectores resultantes.
- Indexación de corpus para motores de búsqueda semántica y sistemas de recomendación basados en contenido.
- Ejecución local mediante llama.cpp y el servidor `llama serve`, con compatibilidad con endpoints.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión, audio ni modo de razonamiento (thinking); es un modelo puramente de embeddings.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar manuales y artículos en una base vectorial usando los embeddings del modelo, y recuperar los fragmentos más relevantes para una consulta en lenguaje natural. Su tamaño compacto (271 M de parámetros) permite indexar corpus grandes con coste de cómputo moderado.
- RAG en asistentes de código: generar embeddings de fragmentos de repositorios y de preguntas de desarrolladores para recuperar contexto relevante antes de pasarlo a un LLM generador. La integración con llama.cpp facilita desplegarlo junto al modelo generador en la misma máquina.
- Deduplicación y clustering de textos: calcular similitud entre documentos o tickets para agrupar duplicados o temas recurrentes en sistemas de soporte, usando los vectores como entrada a algoritmos de clustering.
- Motor de recomendación de contenido: representar artículos, productos o publicaciones como vectores y recomendar ítems cercanos al perfil del usuario, con actualizaciones incrementales del índice.
- Filtrado de candidatos en pipelines de moderación: comparar mensajes entrantes con una base de ejemplos etiquetados para priorizar la revisión humana, aprovechando la inferencia local y de baja latencia.
- Despliegue en el borde o en portátiles: al estar en GGUF y poder ejecutarse con `llama serve`, es viable embeberlo en aplicaciones de escritorio o entornos sin GPU dedicada para búsqueda semántica offline.
- Evaluación de similitud en investigación: usar los embeddings como baseline en experimentos de recuperación o clasificación semántica sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta conversión no incluye métricas de MTEB, recuperación ni comparativas numéricas.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 271 M de parámetros, en cuantización de 8 bits ocupa aproximadamente 0,3 GB y en 4 bits alrededor de 0,15 GB, sin contar overhead de contexto y buffers de llama.cpp. Estas cifras son estimaciones por tamaño de parámetros, no datos publicados.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior puede ejecutarlo con holgura. Para lotes grandes de indexación conviene una A100 o H100, aunque no se dispone de cifras de throughput publicadas.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU con al menos 1-2 GB de VRAM libre, e incluso en CPU.
- Opciones de despliegue: llama.cpp, `llama serve`, y cualquier runtime compatible con GGUF. La model card menciona la aplicación Llama (llama.app) y el comando `llama serve -hf ggml-org/embeddinggemma-2-GGUF`. No se confirma soporte en vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ggml-org/embeddinggemma-2-GGUF | 271 M | no disponible | Apache 2.0 | GGUF cuantizado | Conversión comunitaria del modelo de Google; ejecución local con llama.cpp |
| google/embeddinggemma-2 | no disponible en esta ficha | no disponible | no disponible en esta ficha | safetensors | Modelo base original; requiere consultar su model card para specs completas |
| Alternativas de embeddings de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada para establecer una comparativa numérica |

No se dispone de información suficiente para comparar rendimiento (MTEB u otras métricas) con alternativas de la misma categoría.

## Limitaciones y advertencias

- Al ser una conversión automática, pueden existir diferencias sutiles de comportamiento respecto al modelo base original de Google; conviene validar la calidad de los embeddings en la tarea concreta antes de producción.
- No se documentan los idiomas soportados, por lo que el rendimiento multilingüe es incierto y debe evaluarse empíricamente.
- No se especifica la longitud máxima de contexto; textos largos pueden truncarse o degradar la calidad del embedding según la configuración del tokenizador y del pooling.
- Riesgo de sesgos heredados del corpus de entrenamiento del modelo base, no cuantificado en la información disponible.
- Como modelo de embeddings, no genera texto ni razona; no debe usarse para tareas generativas ni de tool calling.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base google/embeddinggemma-2 por si imponen condiciones adicionales.
- No se confirma compatibilidad con servidores de inferencia de alto rendimiento (vLLM, TGI); el soporte documentado se limita a llama.cpp y llama.app.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ggml-org/embeddinggemma-2-GGUF
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Herramienta de conversión: https://github.com/ggml-org/convert
- Aplicación Llama: https://llama.app
