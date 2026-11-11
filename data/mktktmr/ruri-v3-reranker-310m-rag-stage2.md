# mktktmr/ruri-v3-reranker-310m-rag-stage2

## Resumen

ruri-v3-reranker-310m-rag-stage2 es un modelo de reranking (reordenación de documentos recuperados) para pipelines de generación aumentada por recuperación (RAG) en japonés. Lo desarrolla el usuario de Hugging Face mktktmr como un ajuste fino del modelo cl-nagoya/ruri-v3-reranker-310m, que a su vez forma parte de la familia Ruri v3 de CL Nagoya, especializada en representaciones y reranking para japonés. El modelo resuelve el segundo paso de un pipeline RAG: tras una recuperación inicial de candidatos, puntúa la relevancia de cada par consulta-documento para reordenarlos antes de pasarlos al generador.

Técnicamente es un encoder basado en ModernBERT con 315.203.329 parámetros totales (aproximadamente 310M, como indica su nombre) y un repositorio de 1,3 GB en formato safetensors. La model card está redactada en japonés y describe un ajuste fino adicional ("段階 2", etapa 2) sobre el reranker base, entrenado con datos de QA japoneses: JEMHopQA, NIILC QA, JSQuAD/JGLUE y un conjunto de chunks derivados de Wikipedia en japonés.

La relevancia de este modelo es acotada pero concreta: cubre la necesidad de reranking en japonés dentro de pipelines RAG, un nicho donde escasean los modelos especializados y donde los rerankers multilingües genéricos rinden por debajo en textos japoneses. El modelo tiene cero descargas y cero likes en el momento de la consulta, lo que sugiere un artefacto de investigación o experimental más que un modelo de producción consolidado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 315.203.329 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas) |
| Idiomas soportados | no disponible en la model card; por el modelo base y los datos de entrenamiento, japonés |
| Licencia | no disponible en el repo; el modelo base cl-nagoya/ruri-v3-reranker-310m es Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, según los tags del repositorio, con 315,2 millones de parámetros. Se trata de un ajuste fino del reranker cl-nagoya/ruri-v3-reranker-310m, que a su vez deriva de la familia Ruri v3 de CL Nagoya, orientada a embeddings y reranking en japonés. Al ser un reranker, la arquitectura produce una puntuación de relevancia para un par consulta-documento, no texto generado.

El entrenamiento corresponde a una "etapa 2" de ajuste fino sobre el reranker base. Los datos empleados, según la model card, son JEMHopQA (preguntas multi-hop en japonés), NIILC QA, JSQuAD/JGLUE y un conjunto de chunks derivados de Wikipedia en japonés. Todos los conjuntos se filtraron y reformatearon para el entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en rerankers). La model card no documenta innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Reranking de pares consulta-documento en japonés: puntúa la relevancia de cada candidato recuperado para reordenar la lista antes de la generación.
- Procesamiento de preguntas multi-hop: el entrenamiento con JEMHopQA sugiere capacidad para manejar consultas que requieren composición de información de varias fuentes.
- Manejo de pares pregunta-respuesta extractivos: los datos de JSQuAD/NIILC QA apuntan a un buen comportamiento en QA sobre pasajes.
- Integración en pipelines RAG de dos etapas: recuperación inicial (retriever) seguida de reranking con este modelo.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión, audio ni modo thinking: es un modelo de scoring, no un generador.
- Capacidades multilingües: no disponibles; el foco declarado es el japonés.

## Casos de uso

- Reranking en RAG sobre documentación interna en japonés: tras recuperar los N candidatos con un retriever (por ejemplo, un modelo de embeddings de la familia Ruri), este modelo reordena los pasajes por relevancia antes de pasarlos al LLM generador, mejorando la precisión de las respuestas.
- Atención al cliente automatizada en japonés: en un sistema de FAQ o soporte, el reranker filtra los artículos recuperados para que el generador reciba solo los pasajes más pertinentes, reduciendo respuestas irrelevantes.
- Búsqueda semántica en corpus de Wikipedia japonesa: dado que el entrenamiento incluye chunks de Wikipedia en japonés, es adecuado para reordenar resultados en búsquedas sobre este corpus.
- QA multi-hop sobre bases de conocimiento: con JEMHopQA en el entrenamiento, puede reordenar pasajes que, combinados, responden a preguntas que exigen encadenar información de varios documentos.
- Evaluación y filtrado de datasets de QA: usar el modelo para puntuar la relevancia de pares pregunta-pasaje y descartar ejemplos de baja calidad en la construcción de datasets.
- Prototipado de pipelines de recuperación en investigación: al ser un ajuste de un modelo base abierto, sirve como punto de partida para experimentar con etapas de reranking en sistemas RAG japoneses.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,3 GB solo para pesos (315M parámetros × 4 bytes), más overhead de activaciones y batch; en la práctica, 2-3 GB según longitud de secuencia y tamaño de batch.
- En fp16/bf16: aproximadamente 0,7 GB de pesos; en int8, alrededor de 0,35 GB.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en CPU para volúmenes moderados.
- Opciones de despliegue: al ser un modelo de la familia ModernBERT con pesos safetensors, es compatible con la librería Transformers; para serving de alto rendimiento puede usarse Text Embeddings Inference (TEI) de Hugging Face, que soporta rerankers, o vLLM si el soporte de la arquitectura lo permite (no confirmado en la información disponible). llama.cpp/Ollama requerirían conversión a GGUF, no documentada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| mktktmr/ruri-v3-reranker-310m-rag-stage2 | 315M | no disponible | no disponible (base Apache-2.0) | Ajuste fino de etapa 2 sobre reranker japonés; 0 descargas |
| cl-nagoya/ruri-v3-reranker-310m | ~310M | no disponible | Apache-2.0 | Modelo base del que deriva; reranker japonés de referencia de CL Nagoya |
| BAAI/bge-reranker-v2-m3 | ~568M | 8192 tokens (según documentación pública del modelo) | Apache-2.0 | Reranker multilingüe de propósito general; cobertura japonesa no especializada |
| jinaai/jina-reranker-v2-base-multilingual | ~278M | 1024 tokens (según documentación pública del modelo) | CC BY-NC 4.0 (uso no comercial) | Reranker multilingüe; licencia restrictiva para producción comercial |

## Limitaciones y advertencias

- Modelo con cero descargas y cero likes: sin validación comunitaria ni evidencia de uso en producción; tratar como artefacto experimental.
- La licencia no está declarada en el repositorio. Aunque el modelo base es Apache-2.0, la licencia del ajuste fino no se especifica; verificar antes de uso comercial.
- Los datos de entrenamiento incluyen conjuntos con licencia CC BY-SA 4.0 (JEMHopQA, NIILC QA, JSQuAD/JGLUE y chunks de Wikipedia), lo que puede imponer obligaciones de atribución o share-alike sobre derivados según la jurisdicción y el uso.
- Enfoque exclusivamente japonés según los datos de entrenamiento; el rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- Al ser un reranker, no genera texto: no debe usarse como LLM. Su salida es una puntuación de relevancia.
- Riesgo de sesgo heredado de los corpus de entrenamiento (Wikipedia, datasets de QA japoneses), con posible infrarrepresentación de dominios especializados.
- No se documentan la longitud máxima de contexto ni el formato exacto de entrada (plantilla consulta-documento); es necesario inspeccionar la configuración del modelo base para integrarlo correctamente.
- Riesgo de sobreajuste a los dominios de los datasets de entrenamiento (QA académico y Wikipedia), con posible degradación en dominios empresariales o técnicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mktktmr/ruri-v3-reranker-310m-rag-stage2
- Modelo base: https://huggingface.co/cl-nagoya/ruri-v3-reranker-310m
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- NIILC QA: https://github.com/mynlp/niilc-qa
- JSQuAD / JGLUE: https://github.com/yahoojapan/JGLUE
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
