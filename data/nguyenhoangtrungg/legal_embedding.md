# nguyenhoangtrungg/legal_embedding

## Resumen

legal_embedding es un modelo de embeddings de frases (sentence transformer) especializado en recuperación de información en vietnamita, con enfasis en el dominio legal. Lo publica el desarrollador independiente nguyenhoangtrungg (Nguyen Nho Trung) y deriva del checkpoint AITeamVN/Vietnamese_Embedding, que a su vez fue ajustado a partir de BAAI/bge-m3 sobre corpus vietnamita. El modelo resuelve el problema de la busqueda semantica y el retrieval de documentos juridicos en vietnamita, donde los modelos multilingues genericos como BGE-M3 obtienen resultados claramente inferiores (Accuracy@1 de 0,5682 frente a 0,7274 del checkpoint vietnamita publico).

La arquitectura subyacente es XLM-RoBERTa, propia de la familia BGE-M3, con una longitud maxima de secuencia de 2048 tokens y una dimensionalidad de salida de 1024. La similitud se calcula por producto escalar (dot product) sobre vectores normalizados. El modelo se entrena con aproximadamente 300.000 tripletas de consulta, documento positivo y documento negativo en vietnamita, frente a las 1.100.000 tripletas usadas en Vietnamese_Embedding_v2.

Su relevancia actual radica en que ofrece un encoder compacto y ligero (4,6 GB en el repositorio, con pesos safetensors y ONNX) para pipelines RAG y motores de busqueda juridica en vietnamita, con licencia Apache 2.0 y compatibilidad con Text Embeddings Inference y endpoints estilo OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa, derivado de BAAI/bge-m3) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (se distribuyen pesos safetensors y ONNX; no se documentan variantes GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |
| Dimensionalidad de salida | 1024 |
| Funcion de similitud | producto escalar (dot product) |
| Libreria | sentence-transformers |
| Tamano del repositorio | 4,6 GB |

## Arquitectura y entrenamiento

El modelo es un sentence transformer basado en el encoder XLM-RoBERTa de BAAI/bge-m3. Genera embeddings densos de 1024 dimensiones normalizados, pensados para similitud por producto escalar, y admite entradas de hasta 2048 tokens. La cadena de ascendencia es BAAI/bge-m3, ajustado por AITeamVN para retrieval en vietnamita (Vietnamese_Embedding) y posteriormente adaptado por el autor de esta ficha.

El entrenamiento emplea aprendizaje por tripletas (consulta, documento positivo, documento negativo) con aproximadamente 300.000 tripletas en vietnamita y una longitud maxima de secuencia de 2048. La model card no detalla la composicion exacta del dataset, el numero de tokens vistos ni si se aplicaron etapas de hard negative mining adicionales. La evaluacion se realiza sobre el conjunto de entrenamiento completo de Legal Zalo 2021, un corpus que, segun el autor, no forma parte de los datos de entrenamiento.

## Capacidades

- Generacion de embeddings de frases y parrafos para similitud semantica y recuperacion densa (dense retrieval).
- Busqueda semantica en vietnamita sobre documentos juridicos y textos generales del dominio legal.
- Calculo de similitud por producto escalar entre consultas y documentos, con vectores normalizados de 1024 dimensiones.
- Soporte de entradas largas de hasta 2048 tokens, adecuado para articulos legales y clausulas extensas.
- Servicio local mediante ONNX Runtime con una API compatible con OpenAI (`/v1/embeddings`), con codificacion float y base64, hasta 32 textos por peticion y truncado automatico a 2048 tokens.
- Compatibilidad con Text Embeddings Inference (TEI) y con `sentence-transformers`.
- No dispone de tool calling, capacidades de agente, vision, audio ni modo de razonamiento: es exclusivamente un modelo de embeddings.

## Casos de uso

- Busqueda semantica en portales juridicos vietnamitas: indexar articulos, decretos y resoluciones como vectores de 1024 dimensiones y recuperar los fragmentos relevantes para una consulta en lenguaje natural, superando el rendimiento de BGE-M3 generico en este dominio.
- Pipeline RAG para asistentes legales: usar el modelo como retriever en la fase de recuperacion y alimentar un LLM generativo con los pasajes recuperados; la ventana de 2048 tokens permite indexar clausulas completas sin truncar.
- Deteccion de duplicados y near-duplicates en corpus normativos: comparar embeddings de clausulas para identificar disposiciones repetidas o versiones solapadas de una misma norma.
- Clasificacion y agrupamiento de documentos legais: generar embeddings de expedientes y aplicar clustering o clasificacion por similitud coseno para organizar archivos por materia.
- Sistemas de preguntas frecuentes sobre normativa: emparejar preguntas de usuarios con respuestas canonicas preindexadas mediante similitud por producto escalar.
- Servicio de embeddings autoalojado: desplegar el endpoint ONNX compatible con OpenAI para integrarlo en aplicaciones existentes que ya usan el SDK de OpenAI, con hasta 32 textos por peticion.
- Filtrado previo en pipelines de reranking: usar el modelo como primera etapa de recuperacion y reservar un reranker (por ejemplo Vietnamese_Reranker) para reordenar los candidatos.

## Benchmarks y rendimiento

Evaluacion sobre el dataset completo de entrenamiento de Legal Zalo 2021 (dataset no usado en el entrenamiento del modelo):

| Modelo | Accuracy@1 | Accuracy@3 | Accuracy@5 | Accuracy@10 | MRR@10 |
|---|---|---|---|---|---|
| Vietnamese_Reranker | 0,7944 | 0,9324 | 0,9537 | 0,9740 | 0,8672 |
| Vietnamese_Embedding_v2 | 0,7262 | 0,8927 | 0,9268 | 0,9578 | 0,8149 |
| Vietnamese_Embedding (publico) | 0,7274 | 0,8992 | 0,9305 | 0,9568 | 0,8181 |
| Vietnamese-bi-encoder (BKAI) | 0,7109 | 0,8680 | 0,9014 | 0,9299 | 0,7951 |
| BGE-M3 | 0,5682 | 0,7728 | 0,8382 | 0,8921 | 0,6822 |

No se han publicado resultados de benchmarks especificos para legal_embedding en la informacion disponible; la tabla anterior corresponde a los modelos de referencia citados en la model card. El autor indica que los resultados son reproducibles ejecutando `evaluation_model.py` con datos descargados de Kaggle.

## Requisitos de hardware

- VRAM estimada para inferencia: al derivar de XLM-RoBERTa con encoder de tamano base, la inferencia en FP32 requiere aproximadamente 2-3 GB de VRAM; en FP16 o con ONNX Runtime la huella se reduce a alrededor de 1-1,5 GB. El repositorio completo ocupa 4,6 GB por incluir pesos safetensors y ONNX.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP32; A100, H100, L4 o A10 para despliegues de alto throughput con TEI; RTX 4090, RTX 3090, RTX 4060 Ti o incluso GPUs consumer de gama media son suficientes para inferencia por lotes.
- Cabe en GPU consumer: si, incluida la mayoria de tarjetas con 4 GB o mas; tambien puede ejecutarse en CPU con ONNX Runtime.
- Opciones de despliegue: `sentence-transformers` (Python), ONNX Runtime con el servidor `serve:app` incluido en el repositorio, Text Embeddings Inference (TEI) y cualquier stack compatible con endpoints `/v1/embeddings` estilo OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada. El endpoint ONNX acepta hasta 32 textos por peticion y trunca a 2048 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy@1 (Legal Zalo 2021) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| legal_embedding | no disponible (XLM-R base) | 2048 | no disponible (derivado de Vietnamese_Embedding) | Apache 2.0 | Hugging Face, safetensors + ONNX |
| Vietnamese_Embedding (publico) | no disponible (XLM-R base) | 2048 | 0,7274 | Apache 2.0 | Hugging Face |
| Vietnamese_Embedding_v2 | no disponible (XLM-R base) | 2048 | 0,7262 | Apache 2.0 | Hugging Face |
| BGE-M3 | 568 M | 8192 | 0,5682 | MIT | Hugging Face |
| Vietnamese-bi-encoder (BKAI) | no disponible | no disponible | 0,7109 | no disponible | Hugging Face |

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para vietnamita; su rendimiento fuera de ese idioma no esta documentado y previsiblemente sera bajo.
- No se han publicado metricas de evaluacion propias de legal_embedding; solo se dispone de los resultados del checkpoint base Vietnamese_Embedding, por lo que la mejora atribuible a este ajuste no esta cuantificada.
- El conjunto de evaluacion (Legal Zalo 2021) es de dominio legal; el comportamiento en otros dominios del vietnamita no esta medido y puede degradarse.
- Riesgo de sesgo: los corpus juridicos vietnamitas pueden reflejar sesgos normativos, historicos o regionales; el modelo no documenta analisis de sesgo.
- Riesgo de alucinacion indirecta: al ser un modelo de embeddings, no genera texto, pero un retriever con falsos positivos puede inducir respuestas incorrectas en el LLM que consume los pasajes.
- La ventana de 2048 tokens trunca documentos mas largos; es necesario fragmentar articulos o expedientes extensos antes de la codificacion.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los checkpoints ascendentes (BAAI/bge-m3, con licencia MIT, y AITeamVN/Vietnamese_Embedding) y de los datos de entrenamiento, cuya procedencia no se detalla.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta; no hay evidencia de uso en produccion ni de mantenimiento continuado.
- El endpoint ONNX incluido acepta un maximo de 32 textos por peticion; para cargas mayores hay que particionar las peticiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nguyenhoangtrungg/legal_embedding
- Modelo base: https://huggingface.co/BAAI/bge-m3
- Checkpoint de origen: https://huggingface.co/AITeamVN/Vietnamese_Embedding
- Vietnamese_Embedding_v2: https://huggingface.co/AITeamVN/Vietnamese_Embedding_v2
- Vietnamese_Reranker: https://huggingface.co/AITeamVN/Vietnamese_Reranker
- Contacto del autor: nguyennhotrung3004@gmail.com
