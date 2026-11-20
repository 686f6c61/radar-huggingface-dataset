# mradermacher/rush-small-qwen3-reranker-0.6b-v1-GGUF

## Resumen

El repositorio `mradermacher/rush-small-qwen3-reranker-0.6b-v1-GGUF` contiene cuantizaciones estáticas en formato GGUF del modelo `rushlabs-ai/rush-small-qwen3-reranker-0.6b-v1`, un reranker de tipo cross-encoder de aproximadamente 595,8 millones de parámetros construido sobre la familia Qwen3. El modelo original está pensado para reordenar candidatos recuperados en pipelines de búsqueda semántica y RAG, asignando una puntuación de relevancia a cada par consulta-documento. Este repositorio, mantenido por mradermacher, no aporta pesos nuevos: su valor está en ofrecer 12 variantes de cuantización (desde Q2_K de 0,4 GB hasta f16 de 1,3 GB) para ejecutar el reranker en hardware modesto mediante llama.cpp y herramientas compatibles.

La relevancia práctica de esta ficha está en que permite desplegar una etapa de reranking de calidad en entornos donde no hay GPU de datacenter, algo habitual en sistemas RAG autoalojados. Al tratarse de un cross-encoder, el modelo no genera texto libre: procesa pares (consulta, pasaje) y devuelve una puntuación de relevancia, lo que lo hace computacionalmente más caro por documento que un bi-encoder pero sustancialmente más preciso en la reordenación final.

La licencia Apache 2.0 del modelo base y de las cuantizaciones facilita su integración en productos comerciales, si bien el soporte de idiomas declarado se limita al inglés. El repositorio se creó y actualizó en noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni interacciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en Qwen3 (transformer); tarea de reranking |
| Parametros totales | 595.778.560 (aprox. 0,6 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye en formato transformers/safetensors |

## Arquitectura y entrenamiento

El modelo base es un cross-encoder derivado de Qwen3, con 595,8 millones de parámetros. La etiqueta `distillation` de la model card indica que el entrenamiento se apoya en destilación, presumiblemente desde un reranker de mayor tamaño o desde un modelo generativo Qwen3 más grande, aunque la información proporcionada no detalla el profesor utilizado ni el procedimiento exacto. Los conjuntos de datos declarados para el ajuste son `sentence-transformers/gooaq`, `qiaojin/PubMedQA`, `sentence-transformers/natural-questions`, `sentence-transformers/hotpotqa` y `sentence-transformers/squad`, una mezcla que cubre preguntas abiertas de dominio general, preguntas biomédicas, consultas de búsqueda web y preguntas de comprensión lectora. Esta composición sugiere un enfoque de entrenamiento orientado a dominios diversos de recuperación de información, con especial atención al ámbito sanitario por la inclusión de PubMedQA.

El repositorio de mradermacher aplica cuantizaciones estáticas sobre los pesos del modelo base mediante el pipeline de conversión de llama.cpp (convert_type hf, quantize_version 2, output_tensor_quantised 1). No se han generado cuantizaciones ponderadas ni con matriz de importancia (imatrix): la model card indica explícitamente que no están disponibles y que no hay planes inmediatos de producirlas, aunque el autor acepta peticiones mediante la sección de discusiones de la comunidad. Las cuantizaciones IQ4_XS y Q4_K_M son las opciones recomendadas por el autor para equilibrar tamaño y calidad; Q2_K y Q3_K_S quedan en el extremo de menor fidelidad.

## Capacidades

- Reranking de pares consulta-documento: asigna una puntuación de relevancia a cada par, lo que permite reordenar una lista de candidatos recuperados por un bi-encoder o un motor de búsqueda léxica.
- Cross-encoding: al procesar consulta y pasaje conjuntamente, captura interacciones token a token que un bi-encoder no puede modelar.
- Dominio general y biomédico: el entrenamiento con gooaq, Natural Questions, HotpotQA, SQuAD y PubMedQA cubre preguntas abiertas, búsqueda multihop y literatura científica.
- Integración en pipelines RAG: puede insertarse como segunda etapa de recuperación tras una búsqueda vectorial o híbrida.
- Ejecución en CPU y GPU de gama baja gracias a las cuantizaciones GGUF de 0,4 a 1,3 GB.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es un modelo discriminativo de puntuación.
- Capacidad multilingüe limitada: solo se declara inglés.

## Casos de uso

- Reordenación en pipelines RAG: tras recuperar los 50-100 documentos más similares con un índice vectorial, el reranker puntúa cada par consulta-documento y selecciona los 5-10 más relevantes para el prompt del modelo generativo; la cuantización Q4_K_M de 0,5 GB permite ejecutar esta etapa en el mismo servidor de aplicaciones sin GPU dedicada.
- Búsqueda documental interna: en un buscador corporativo sobre manuales, políticas o contratos, el modelo mejora la precisión de la primera página de resultados al puntuar los candidatos recuperados por Elasticsearch o un índice denso, con despliegue mediante llama.cpp en CPU.
- Asistente de literatura biomédica: gracias al entrenamiento con PubMedQA, puede reordenar resúmenes y artículos recuperados por una búsqueda sobre PubMed para responder preguntas clínicas, priorizando los pasajes que realmente abordan la consulta.
- Atención al cliente con base de conocimiento: en un chatbot que recupera artículos de ayuda, el reranker filtra los fragmentos irrelevantes antes de que lleguen al modelo generativo, reduciendo alucinaciones y coste de tokens de contexto.
- Evaluación de calidad de recuperación: el modelo puede usarse para puntuar pares (consulta, documento) en conjuntos de evaluación y medir la mejora de distintas estrategias de chunking o de embeddings sin depender de anotadores humanos.
- Filtrado de resultados en motores de búsqueda vertical: en portales de empleo, inmobiliarios o de comercio electrónico, reordena los anuncios recuperados por coincidencia léxica para que los primeros puestos reflejen la intención real de la consulta.
- Despliegue en el borde o en entornos con recursos limitados: la variante Q2_K de 0,4 GB cabe en dispositivos con poca memoria y permite añadir reranking a aplicaciones de escritorio o contenedores pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye métricas de nDCG, MRR ni comparaciones con otros rerankers, y la información proporcionada tampoco recoge los resultados del modelo base.

## Requisitos de hardware

- VRAM estimada: entre 0,4 GB (Q2_K) y 1,3 GB (f16) solo para los pesos; añadir entre 0,2 y 0,5 GB para el contexto y las estructuras de inferencia según la longitud de los pares evaluados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluidas GTX 1050 Ti, RTX 3050, RTX 4060, RTX 4090, A100 y H100; el modelo no aprovecha la capacidad de las GPU de datacenter salvo por el paralelismo de peticiones.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones, incluidas las integradas y las de portátiles con 4 GB o más.
- Despliegue: llama.cpp y sus envoltorios (llama-server, Ollama, LM Studio) son las vías naturales para GGUF; también puede usarse con librerías que soporten GGUF para reranking, o bien cargar el modelo base en transformers con PyTorch para obtener la puntuación nativa.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia estructural, un cross-encoder de 0,6 B debe evaluar cada par por separado, por lo que el coste crece linealmente con el número de documentos a reordenar; conviene limitar la lista de candidatos a decenas, no a miles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| rush-small-qwen3-reranker-0.6b-v1 (este) | 0,6 B | No disponible | Inglés | Apache 2.0 | GGUF, safetensors | Cross-encoder con destilación y entrenamiento en dominios general y biomédico |
| bge-reranker-base | 0,28 B | 512 tokens | Multilingüe | MIT | safetensors, ONNX | Reranker cross-encoder muy extendido en pipelines RAG |
| bge-reranker-large | 0,56 B | 512 tokens | Multilingüe | MIT | safetensors, ONNX | Mayor coste computacional, buena precisión en inglés y chino |
| ms-marco-MiniLM-L-6-v2 | 0,02 B | 512 tokens | Inglés | Apache 2.0 | safetensors, ONNX | Reranker ligero para CPU, menor precisión que modelos de 0,5 B |

La comparativa se basa en características públicas de modelos de la misma categoría; no se dispone de mediciones directas que comparen su rendimiento con este modelo. La principal ventaja diferencial de esta ficha es la disponibilidad de cuantizaciones GGUF listas para llama.cpp, algo que los rerankers de BAAI suelen ofrecer solo en safetensors u ONNX.

## Limitaciones y advertencias

- Solo inglés: el modelo declara únicamente el idioma inglés, por lo que su uso en castellano u otros idiomas no está respaldado por el entrenamiento y probablemente degrade la calidad del ranking.
- Riesgo de sesgo: los datasets de entrenamiento (gooaq, Natural Questions, HotpotQA, SQuAD, PubMedQA) provienen de fuentes web y académicas con sesgos de dominio y de estilo; el modelo puede favorecer pasajes con formatos similares a los de esos corpus.
- No es un modelo generativo: no produce respuestas ni razonamiento; quien espere un LLM debe usar otro modelo. Tampoco soporta tool calling ni agentes.
- Contexto no documentado: se desconoce la longitud máxima de entrada; los rerankers Qwen3 suelen limitarse a unos pocos miles de tokens, pero no hay confirmación en la información disponible.
- Cuantizaciones de baja precisión: Q2_K y Q3_K_S pueden degradar la calidad del ranking de forma apreciable; el autor recomienda Q4_K_M o superiores para uso en producción.
- Sin cuantizaciones ponderadas: no hay variantes con imatrix, que suelen ofrecer mejor relación calidad/tamaño en modelos pequeños.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige conservar el aviso de licencia y no ofrece garantías; conviene verificar las obligaciones de atribución en el producto final.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la ficha, por lo que no hay validación comunitaria de las cuantizaciones.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/mradermacher/rush-small-qwen3-reranker-0.6b-v1-GGUF
- Modelo base: https://huggingface.co/rushlabs-ai/rush-small-qwen3-reranker-0.6b-v1
- Página de descargas del autor: https://hf.tst.eu/model#rush-small-qwen3-reranker-0.6b-v1-GGUF
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- README de referencia para GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset gooaq: https://huggingface.co/datasets/sentence-transformers/gooaq
- Dataset PubMedQA: https://huggingface.co/datasets/qiaojin/PubMedQA
- Dataset Natural Questions: https://huggingface.co/datasets/sentence-transformers/natural-questions
- Dataset HotpotQA: https://huggingface.co/datasets/sentence-transformers/hotpotqa
- Dataset SQuAD: https://huggingface.co/datasets/sentence-transformers/squad
