# katsu06/qwen3.5-0.8b-rag-s2-sd

## Resumen

katsu06/qwen3.5-0.8b-rag-s2-sd es un ajuste fino del modelo base Qwen/Qwen3.5-0.8B (revision `2fc06364715b967f1860aea9cf38778875588b17`), desarrollado por el usuario katsu06 en el contexto del curso "LLM講座2 2026" (asignatura final). El modelo está especializado en tareas de generación aumentada por recuperación (RAG) sobre Wikipedia en japonés: recibe un conjunto de documentos recuperados junto con una pregunta y devuelve un JSON con la forma `{"answer": ..., "chunk_id": ...}`, es decir, la respuesta textual y el identificador del fragmento que la respalda.

La relevancia del modelo es acotada pero concreta: demuestra una receta de bajo coste (LoRA, model soup y autodestilación) para convertir un modelo denso de 0,87 mil millones de parámetros en un extractor de respuestas con cita de fuente, un patrón habitual en pipelines RAG que necesitan trazabilidad. No es un modelo de propósito general ni un chat assistant: su entrenamiento está orientado a una única tarea de respuesta extractiva con atribución.

El modelo conserva exactamente la arquitectura y la estructura de pesos del base (mismos nombres, formas y tipos de tensor), lo que facilita su integración con las herramientas estándar de Hugging Face y con el ecosistema de despliegue de Qwen. Los pesos se distribuyen en safetensors con un total de 873.438.784 parámetros y un repositorio de 1,8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3.5-0.8B; estructura de pesos idéntica al base) |
| Parametros totales | 873.438.784 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B y no modifica su arquitectura: los nombres, formas y tipos de los tensores son idénticos a los del base. El ajuste se realizó en tres etapas documentadas por el autor. Primero, dos LoRA independientes (r=16, alpha=32, dropout=0.05, aplicados a todas las capas lineales de la parte de modelo de lenguaje) dieron lugar a los modelos b3 y b4. Segundo, se aplicó un model soup con la combinación `base + 0.7 × (b3 − base) + 0.3 × (b4 − base)`. Tercero, se realizó una autodestilización: el modelo promediado respondió a las preguntas de entrenamiento (una vez con temperature 0 y ocho veces con temperature 0.7), se seleccionaron mecánicamente solo las respuestas que coincidían con la referencia y cuyo fragmento de soporte contenía la respuesta, y con esas 708 muestras se entrenó un nuevo LoRA (r=16, alpha=32, learning rate 2e-5, 1 época) que se fusionó en el modelo final.

Los datos de entrenamiento se construyeron de forma mecánica a partir de cl-nagoya/auto-wiki-qa (CC BY-SA 4.0), JaQuAD (CC BY-SA 3.0), JEMHopQA (CC BY-SA 4.0) y los fragmentos de Wikipedia distribuidos en el curso (CC BY-SA 4.0). En la fase de autodestilización, los documentos de entrada se obtuvieron mediante recuperación híbrida (BM25 más búsqueda por embeddings, con reordenación por reranker), tomando los tres primeros resultados y presentándolos en orden inverso al de recuperación. La tarea de salida es un JSON con la respuesta y el `chunk_id` del fragmento que la justifica.

## Capacidades

- Respuesta extractiva con atribución: genera `{"answer": ..., "chunk_id": ...}` a partir de documentos recuperados y una pregunta.
- RAG sobre Wikipedia en japonés: entrenado específicamente con fragmentos de Wikipedia japonesa y preguntas de auto-wiki-qa, JaQuAD y JEMHopQA.
- Selección de evidencia: identifica el fragmento (`chunk_id`) que contiene la respuesta entre los documentos proporcionados.
- Salida estructurada en JSON, adecuada para consumo programático en pipelines.
- Manejo de contexto con múltiples documentos: el formato de entrenamiento incluye los tres resultados de recuperación ordenados de forma inversa al ranking.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá de la selección de evidencia.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- Multilingüismo limitado al japonés según la model card.

## Casos de uso

- Atención al cliente sobre base documental en japonés: el modelo recibe los fragmentos recuperados por un buscador y devuelve la respuesta junto con el identificador del fragmento, lo que permite mostrar la fuente al usuario y auditar la respuesta.
- Sistemas de preguntas y respuestas sobre Wikipedia japonesa: integrado detrás de un retriever híbrido (BM25 más embeddings con reranker), reproduce el pipeline exacto con el que fue entrenado y devuelve respuestas extractivas con cita.
- Verificación de respuestas con trazabilidad: el campo `chunk_id` de la salida permite enlazar cada respuesta a un documento concreto, útil en flujos donde se exige justificar la información mostrada.
- Extracción de respuestas en pipelines de documentación interna: dado un conjunto de fragmentos de manuales o bases de conocimiento en japonés, el modelo localiza la frase que responde a la consulta y señala el fragmento de origen.
- Prototipado de bajo coste en hardware modesto: con 873 millones de parámetros, el modelo puede ejecutarse en GPUs de consumo para experimentar con arquitecturas RAG antes de escalar a modelos mayores.
- Evaluación de retrievers y rerankers: al estar entrenado con un formato de entrada concreto (tres documentos en orden inverso al ranking), sirve como componente fijo para medir el impacto de cambios en la fase de recuperación sobre la calidad de la respuesta final.
- Filtrado y anotación de corpus de preguntas y respuestas: la salida estructurada con respuesta y fragmento de soporte facilita la generación de pares pregunta-respuesta con evidencia para construir datasets posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,75 GB solo para pesos (873 millones de parámetros), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 0,9 GB para pesos; en 4 bits, en torno a 0,5 GB, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16 con contexto moderado; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y en la mayoría de casos sobredimensionadas.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer recientes con 6 GB o más de VRAM.
- Opciones de despliegue: transformers (carga directa desde safetensors), vLLM, TGI y llama.cpp/Ollama previa conversión a GGUF (no publicada por el autor).
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| katsu06/qwen3.5-0.8b-rag-s2-sd | 873 M | no disponible | RAG extractivo con cita (japonés) | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 873 M (aprox., segun el ajuste) | no disponible | Modelo de propósito general | Apache-2.0 | Hugging Face |
| katsu06/qwen3.5-0.8b-rag-b3 | no disponible | no disponible | RAG (LoRA intermedio) | Apache-2.0 (heredada) | Hugging Face |
| katsu06/qwen3.5-0.8b-rag-b4 | no disponible | no disponible | RAG (LoRA intermedio) | Apache-2.0 (heredada) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; la comparación se limita a parámetros, especialización y licencia.

## Limitaciones y advertencias

- Modelo de un solo propósito: está entrenado para devolver JSON con respuesta y `chunk_id`; su uso como chat general o para generación libre no está validado y probablemente degrade la calidad.
- Idioma restringido al japonés según la model card; el rendimiento en castellano u otros idiomas no está documentado.
- Riesgo de alucinación: aunque el entrenamiento filtra respuestas que coinciden con la referencia y cuyo fragmento contiene la respuesta, el modelo puede generar `chunk_id` incorrectos o respuestas no presentes en los documentos en entradas fuera de distribución.
- Dependencia del formato de entrada: fue entrenado con tres documentos en orden inverso al ranking de recuperación; alterar el número, el orden o el formato de los fragmentos puede degradar los resultados.
- Sesgos: los datasets de origen (Wikipedia japonesa, JaQuAD, JEMHopQA) introducen los sesgos propios de su composición y cobertura temática; el autor no documenta análisis de sesgo.
- Licencia Apache-2.0 para los pesos, pero los datos de entrenamiento tienen licencias CC BY-SA 3.0 y 4.0; es necesario respetar las condiciones de atribución y compartir igual de esas fuentes si se redistribuyen derivados que incorporen su contenido.
- Sin métricas publicadas: no hay benchmarks, evaluaciones de calidad ni mediciones de latencia, lo que dificulta estimar su rendimiento en producción antes de probarlo.
- Modelo con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni validación externa.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento con secuencias largas más allá de lo visto en entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/katsu06/qwen3.5-0.8b-rag-s2-sd
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo intermedio b3: https://huggingface.co/katsu06/qwen3.5-0.8b-rag-b3
- Modelo intermedio b4: https://huggingface.co/katsu06/qwen3.5-0.8b-rag-b4
- Dataset cl-nagoya/auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Dataset JaQuAD: https://github.com/SkelterLabsInc/JaQuAD
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
