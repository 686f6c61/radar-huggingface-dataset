# katsu06/qwen3.5-0.8b-rag-b4

## Resumen

katsu06/qwen3.5-0.8b-rag-b4 es un modelo de lenguaje de 873 millones de parámetros obtenido mediante ajuste LoRA sobre Qwen/Qwen3.5-0.8B y posterior fusión (merge) de los pesos del adaptador en el modelo base. Lo desarrolla el usuario katsu06 en el marco del curso «LLM講座2 2026» y está especializado en una única tarea: responder preguntas de tipo RAG sobre Wikipedia en japonés devolviendo un JSON con la respuesta y el identificador del fragmento (`chunk_id`) que la respalda.

El modelo no es un asistente generalista ni un chat: es un componente de un pipeline RAG japonés. Recibe como entrada los tres fragmentos recuperados por un sistema de búsqueda híbrido (BM25 más búsqueda vectorial, reordenados por un reranker) junto con la pregunta, y produce `{"answer": ..., "chunk_id": ...}`. Su interés radica en que ejemplifica el patrón de especialización de modelos pequeños para tareas de extracción con atribución de fuentes, un caso frecuente en producción cuando se necesita trazabilidad y bajo coste de inferencia.

El modelo base es Qwen3.5-0.8B, de la familia Qwen 3.5 de Alibaba, con licencia Apache-2.0. La información disponible no detalla la arquitectura interna del modelo base (número de capas, dimensión oculta, longitud de contexto nativa), por lo que esos datos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-0.8B; detalles internos no disponibles) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache-2.0 (modelo); datos de entrenamiento con CC BY-SA 3.0 y 4.0 |
| Formato de pesos | safetensors (tamaño del repo: 1,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B (revisión `2fc06364715b967f1860aea9cf38778875588b17`) y aplica un ajuste LoRA con r=16, alpha=32, dropout=0.05 sobre todas las capas lineales de la parte de modelo de lenguaje. El entrenamiento se realizó en una sola pasada desde el modelo base original (sin usar otros modelos ya entrenados), con tasa de aprendizaje 1e-4, calentamiento del 5 %, decaimiento coseno, batch de 8, una época y 2.416 ejemplos (302 pasos). Se conservó el checkpoint LoRA con menor pérdida en validación y posteriormente se fusionó con el modelo base, de modo que la estructura de pesos (nombres, formas y tipos) es idéntica a la del modelo original.

Los datos de entrenamiento se construyeron mecánicamente a partir de tres conjuntos de preguntas y respuestas en japonés (cl-nagoya/auto-wiki-qa, JaQuAD y JEMHopQA) combinados con fragmentos de Wikipedia distribuidos en el curso. Para cada pregunta se recuperaron los tres fragmentos mejor clasificados por un pipeline de búsqueda híbrida BM25 + embeddings con reranker, y se pasaron en el orden de recuperación. La entrada es el par (fragmentos, pregunta) y la salida el JSON con la respuesta y el `chunk_id` del fragmento que la sustenta. No se documenta uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de respuestas extractivas en japonés a partir de contexto documental: devuelve la frase respuesta y el `chunk_id` del fragmento que la respalda.
- Salida estructurada en JSON con el esquema fijo `{"answer": ..., "chunk_id": ...}`.
- Selección de la fuente correcta entre tres fragmentos candidatos ordenados por relevancia de recuperación.
- Manejo de preguntas de distinto tipo procedentes de tres corpus (auto-wiki-qa, JaQuAD y JEMHopQA), incluidas preguntas de múltiples saltos (JEMHopQA).
- Capacidad multilingüe limitada al japonés según la model card; no se declaran otras lenguas.
- No se documentan tool calling, function calling, razonamiento multi-paso general, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Atención al cliente sobre base documental: el modelo puede integrarse como paso final de un pipeline RAG para responder consultas en japonés citando el fragmento exacto de la documentación interna que respalda la respuesta, lo que facilita la verificación por parte del operador.
- Asistentes de consulta sobre Wikipedia o wikis internas: dado un índice de fragmentos y un recuperador híbrido, el modelo devuelve la respuesta junto con el identificador del pasaje fuente, permitiendo enlazar directamente al artículo original.
- Extracción con atribución de fuentes en pipelines de cumplimiento: al forzar la devolución de `chunk_id`, el sistema puede auditar qué documento originó cada respuesta, requisito habitual en entornos regulados.
- Preguntas de múltiples saltos sobre documentación técnica: el entrenamiento incluye JEMHopQA, por lo que el modelo está expuesto a preguntas cuya respuesta requiere combinar información de varios pasajes.
- Componente de bajo coste en arquitecturas RAG de producción: con 873 millones de parámetros, la inferencia es viable en una sola GPU de gama media, lo que permite desplegarlo como servicio dedicado sin compartir recursos con un modelo generalista.
- Evaluación y prototipado de pipelines RAG en japonés: sirve como referencia para comparar estrategias de recuperación (BM25 frente a embeddings, con y sin reranker) manteniendo fijo el generador.
- Generación de pares pregunta-respuesta anotados con fuente: útil para construir conjuntos de datos de evaluación con trazabilidad documental a partir de corpus existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de exactitud, F1, EM ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 1,8 GB solo para los pesos (873 M de parámetros), más overhead de activaciones y caché KV; un presupuesto práctico de 3-4 GB es suficiente para contexto corto.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1 GB para pesos; en 4 bits, alrededor de 0,6 GB. No se publican variantes GGUF oficiales, por lo que habría que generarlas a partir de los safetensors.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; en entornos de servidor, una T4, L4 o A10 bastan para despliegue en producción.
- Cabe holgadamente en GPU consumer, incluidas portátiles con 8 GB.
- Opciones de despliegue: transformers con `peft` no es necesario tras el merge; vLLM, TGI y llama.cpp (prevía conversión a GGUF) son viables. Ollama requiere conversión manual al no existir variante publicada.
- Latencia y throughput: no disponibles. Por el tamaño del modelo, se espera una latencia de decenas de milisegundos por petición en GPU moderna con contexto corto, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| katsu06/qwen3.5-0.8b-rag-b4 | 873 M | no disponible | RAG japonés con salida JSON y cita de fuente | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | Modelo generalista multilingüe | Apache-2.0 | Hugging Face |
| cl-nagoya/auto-wiki-qa (dataset) | no aplica | no aplica | Corpus de preguntas y respuestas sobre Wikipedia japonesa | CC BY-SA 4.0 | Hugging Face Datasets |

No se dispone de información sobre otros modelos ajustados específicamente para RAG en japonés con salida JSON y cita de fragmento que permitan una comparación cuantitativa directa.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado exclusivamente para el formato de entrada (tres fragmentos más pregunta) y salida JSON con `answer` y `chunk_id`; su uso como chat generalista o para otras tareas producirá resultados deficientes.
- Dependencia del pipeline de recuperación: el rendimiento depende de que los fragmentos de entrada procedan de un recuperador similar al usado en entrenamiento (BM25 + embeddings + reranker, top-3 en orden de recuperación). Cambiar el número de fragmentos o su orden puede degradar la calidad.
- Riesgo de alucinación: aunque el formato fuerza la cita de un `chunk_id`, el modelo puede generar una respuesta no contenida en los fragmentos o citar un identificador incorrecto; no se documenta ningún mecanismo de verificación posterior.
- Sesgos: los datos provienen de Wikipedia en japonés y de tres corpus académicos, con la cobertura temática y los sesgos propios de esas fuentes; no se documenta ningún análisis de sesgo.
- Limitación de idioma: solo se declara japonés; no hay evidencia de funcionamiento correcto en castellano ni en otras lenguas.
- Restricciones de licencia: el modelo es Apache-2.0, pero los datos de entrenamiento incluyen material CC BY-SA 3.0 (JaQuAD) y CC BY-SA 4.0 (auto-wiki-qa, JEMHopQA y fragmentos de Wikipedia), lo que impone obligaciones de atribución y compartir igual sobre las obras derivadas de esos datos.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni de validación independiente.
- Sin benchmarks publicados: no es posible estimar su calidad frente a alternativas sin ejecutar una evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/katsu06/qwen3.5-0.8b-rag-b4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset cl-nagoya/auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Dataset JaQuAD: https://github.com/SkelterLabsInc/JaQuAD
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
