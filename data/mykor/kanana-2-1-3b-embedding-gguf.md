# mykor/kanana-2-1.3b-embedding-GGUF

## Resumen

kanana-2-1.3b-embedding-GGUF es una cuantización en formato GGUF del modelo de embeddings kanana-2-1.3b-embedding, desarrollado originalmente por Kakao y convertido a GGUF por el usuario mykor. Se trata de un modelo de extracción de características (feature extraction) orientado a tareas de similitud de frases, recuperación de información y clustering semántico, con soporte de coreano e inglés. Su base es un modelo de aproximadamente 1.291 millones de parámetros derivado de la familia Kanana 2 de Kakao.

La relevancia de esta versión radica en el formato GGUF, que permite ejecutar el modelo en entornos con recursos limitados mediante llama.cpp y sus derivados (Ollama, LM Studio, bindings de Python como llama-cpp-python), sin depender de PyTorch ni de GPUs de gama alta. Esto facilita desplegar pipelines de embeddings locales, por ejemplo para sistemas RAG que procesen documentación en coreano e inglés sin enviar datos a servicios externos.

El modelo incluye el tag matryoshka, lo que indica soporte de embeddings Matryoshka (representaciones anidadas de distintas dimensiones que permiten ajustar el equilibrio entre calidad y tamaño de índice). El repositorio pesa 8,4 GB, lo que sugiere que contiene la variante BF16 completa junto con posibles cuantizaciones adicionales. El modelo base está evaluado bajo el benchmark MTEB, según los tags de la ficha original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder basado en la familia Kanana 2 (detalles exactos no disponibles) |
| Parametros totales | 1.291.478.272 (1,29 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (en el ejemplo de uso se emplea n_ctx=0) |
| Tipos de cuantizacion | BF16 (confirmado en el nombre de archivo); otras cuantizaciones posibles dentro del repo de 8,4 GB, no confirmadas |
| Idiomas soportados | Coreano (ko), inglés (en) |
| Licencia | kanana-open-license (licencia "other", con enlace a la licencia del modelo base) |
| Formato de pesos | GGUF (cuantización a partir de safetensors del modelo base) |

## Arquitectura y entrenamiento

El modelo base, kakaocorp/kanana-2-1.3b-embedding, es un modelo de embeddings de 1,29 mil millones de parámetros derivado de la familia Kanana 2 de Kakao, diseñada para el bilingüismo coreano-inglés. La conversión a GGUF realizada por mykor permite su ejecución mediante llama.cpp con la opción de embeddings activada (`embedding=True`). En la verificación publicada en la model card, el embedding generado por la versión GGUF en BF16 alcanza una similitud coseno de aproximadamente 0,9745 respecto al embedding del modelo original en sentence-transformers, lo que indica una fidelidad alta de la conversión, aunque no exactamente idéntica.

No hay información disponible en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición del dataset, ni el procedimiento de fine-tuning contrastivo (por ejemplo, con pares de consulta-pasaje) empleado para el modelo base. Tampoco se detalla la dimensión exacta del vector de salida ni las dimensiones intermedias soportadas por el esquema Matryoshka. El uso de `n_ctx=0` en el ejemplo sugiere que el contexto se gestiona de forma dinámica o que el modelo procesa secuencias cortas, pero el valor máximo de contexto no está publicado en los materiales disponibles.

## Capacidades

- Extracción de embeddings de texto para similitud de frases (pipeline sentence-similarity).
- Búsqueda semántica y recuperación densa, especialmente en coreano e inglés.
- Soporte de embeddings Matryoshka, que permite truncar el vector a dimensiones menores conservando buena parte de la calidad de recuperación.
- Evaluación referenciada bajo MTEB (Massive Text Embedding Benchmark), aunque no se publican puntuaciones concretas en la información disponible.
- Ejecución local mediante llama.cpp, Ollama o bindings de Python (llama-cpp-python), sin dependencia de PyTorch.
- Compatibilidad con endpoints de inferencia (tag endpoints_compatible en la ficha original).
- No es un modelo generativo: no produce texto, no soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Sistemas RAG sobre documentación coreana e inglesa: el modelo genera embeddings de pasajes que se indexan en una base vectorial (FAISS, Qdrant, Milvus) para recuperar contexto relevante antes de la generación con un LLM.
- Búsqueda semántica local y privada: al ejecutarse vía llama.cpp en CPU o GPU modesta, permite implementar buscadores internos donde los documentos no deben salir de la infraestructura propia.
- Detección de duplicados y deduplicación de corpus: la similitud coseno entre embeddings permite identificar contenido redundante en grandes colecciones de texto bilingüe.
- Clustering y organización de documentos: los embeddings agrupan textos temáticamente afines sin necesidad de etiquetas previas, útil en análisis exploratorio de datos.
- Clasificación de texto por similitud con ejemplos (zero-shot mediante prototipos): se comparan los embeddings de los textos de entrada con los de categorías de ejemplo.
- Despliegue en dispositivos con recursos limitados: el formato GGUF y el tamaño de 1,29 B de parámetros hacen viable su uso en servidores pequeños o estaciones de trabajo sin GPU de gama alta.
- Búsqueda híbrida coreano-inglés: su entrenamiento bilingüe lo hace adecuado para recuperar resultados en un idioma a partir de consultas en el otro, escenario habitual en productos con audiencia coreana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card original referencia MTEB como benchmark asociado mediante tags, pero no incluye puntuaciones concretas. El único dato cuantitativo publicado es la verificación de fidelidad de la conversión: similitud coseno de 0,9745 entre el embedding del modelo original (sentence-transformers) y el de la versión GGUF BF16 sobre un texto de prueba en coreano.

## Requisitos de hardware

- VRAM / memoria estimada para inferencia: la variante BF16 requiere aproximadamente 2,6 GB solo para los pesos (1,29 mil millones de parámetros a 2 bytes), más overhead de contexto; el repo completo ocupa 8,4 GB en disco. Si existen cuantizaciones Q4/Q8 en el repositorio, los requisitos bajarían a alrededor de 0,8-1,5 GB, pero esto no está confirmado.
- GPU recomendadas: no requiere GPU; cualquier GPU moderna con 4 GB de VRAM (por ejemplo RTX 3060 o superior) ejecuta la variante BF16 con holgura.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer actual; también funciona en CPU mediante llama.cpp con velocidad razonable dado su tamaño de 1,29 B.
- Opciones de despliegue: llama.cpp (nativo), llama-cpp-python (como muestra el ejemplo de la model card), Ollama, LM Studio. El modelo base también puede ejecutarse con sentence-transformers y PyTorch.
- Latencia y throughput: no disponible; al ser un modelo de embeddings de 1,29 B ejecutado localmente, la latencia esperada por documento es de decenas de milisegundos en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| kanana-2-1.3b-embedding-GGUF | 1,29 B | GGUF | ko, en | kanana-open-license | Embeddings Matryoshka, fidelidad 0,9745 vs. original |
| multilingual-e5-large | 0,56 B | safetensors | Multilingüe (100 idiomas) | MIT | Ampliamente usado en RAG, sin GGUF oficial |
| bge-m3 | 0,57 B | safetensors, GGUF (comunidad) | Multilingüe | MIT | Soporta denso, disperso y multi-vector |
| BAAI/bge-large-en-v1.5 | 0,34 B | safetensors | en | MIT | Solo inglés, muy extendido en recuperación |

Frente a las alternativas, el modelo de Kakao destaca por su enfoque específico en coreano, donde los modelos multilingües genéricos suelen rendir por debajo de los especializados. Su desventaja es la licencia kanana-open-license, más restrictiva que MIT, y que las puntuaciones MTEB no están disponibles para una comparación cuantitativa directa.

## Limitaciones y advertencias

- Licencia kanana-open-license: no es una licencia permisiva tipo MIT o Apache 2.0; debe revisarse el texto completo en el enlace de la licencia del modelo base antes de cualquier uso comercial, ya que puede incluir restricciones de uso o requisitos de atribución.
- La conversión GGUF introduce una ligera desviación respecto al modelo original (similitud coseno 0,9745 en BF16); en aplicaciones sensibles a la calidad del ranking, conviene validar el rendimiento en el dominio propio antes de migrar desde la versión sentence-transformers.
- Cuantizaciones más agresivas que BF16, si existen en el repositorio, degradarían aún más la fidelidad de los embeddings; no hay verificaciones publicadas para otras cuantizaciones.
- Idiomas limitados a coreano e inglés; no es adecuado para corpus en otros idiomas.
- No disponible: longitud máxima de contexto publicada, dimensión del embedding, dimensiones Matryoshka soportadas y puntuaciones MTEB. Todo ello debe verificarse empíricamente antes de producción.
- Al tratarse de un modelo de embeddings, no genera texto y no es apto para tareas generativas, chat ni agentes.
- El repositorio es una conversión de la comunidad (autor mykor, 456 descargas, sin likes registrados), no un lanzamiento oficial de Kakao; el mantenimiento y la actualización de cuantizaciones dependen del autor de la conversión.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mykor/kanana-2-1.3b-embedding-GGUF
- Modelo base (Kakao): https://huggingface.co/kakaocorp/kanana-2-1.3b-embedding
- Licencia del modelo base: https://huggingface.co/kakaocorp/kanana-2-1.3b-embedding/blob/main/LICENSE
