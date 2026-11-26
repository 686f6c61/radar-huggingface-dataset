# iovieira/medir-rag-bi-encoder-merged

## Resumen

medir-rag-bi-encoder-merged es un modelo de recuperación densa (bi-encoder) desarrollado por iovieira en el marco del proyecto MedIR-RAG de la Universidad de Évora, dentro de la asignatura de Recuperación de Información en Bases de Texto. Se trata de un ajuste fino mediante LoRA del modelo base BAAI/bge-small-en-v1.5, en el que el adaptador se ha fusionado en los pesos del modelo base para producir un checkpoint monolítico listo para usar con sentence-transformers. Su propósito es generar embeddings de frases y pasajes para búsqueda semántica en el dominio biomédico.

El modelo resuelve el problema de la recuperación de evidencia documental en preguntas biomédicas: dado un enunciado de pregunta, produce vectores densos que permiten recuperar pasajes relevantes de un corpus. Se ha entrenado específicamente sobre pares pregunta/pasaje de BioASQ, un corpus de referencia en búsqueda biomédica, lo que lo hace adecuado para pipelines de generación aumentada por recuperación (RAG) en dominios clínicos y científicos.

Es relevante ahora porque los bi-encoders pequeños como este (33,4 millones de parámetros, aproximadamente 0,1 GB) permiten desplegar recuperación semántica en infraestructura modesta, y el autor reporta que su combinación híbrida con BM25 (RRF) eleva de forma notable las métricas de recuperación respecto al uso aislado del modelo denso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT (bi-encoder denso), base BAAI/bge-small-en-v1.5 con adaptador LoRA fusionado |
| Parametros totales | 33.360.000 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base bge-small-en-v1.5 tiene 512 tokens, dato no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es de dominio ingles; no confirmado para este ajuste) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria sentence-transformers) |

## Arquitectura y entrenamiento

El modelo es un bi-encoder basado en la arquitectura BERT del checkpoint bge-small-en-v1.5, con 33,36 millones de parámetros. Sobre los pesos del modelo base se aplicó un ajuste fino con LoRA (Low-Rank Adaptation) y posteriormente se fusionó el adaptador en los pesos originales, de modo que el resultado es un único modelo denso sin módulos adicionales en tiempo de inferencia. La salida son embeddings de frase normalizables, aptos para similitud coseno.

El entrenamiento se realizó sobre pares pregunta/pasaje de BioASQ, según indica la model card, con el código `train_bi_encoder.py` del proyecto MedIR-RAG. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, la función de pérdida ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO. La innovación destacable es de carácter práctico: la fusión del adaptador LoRA en los pesos base simplifica el despliegue y permite cargar el modelo directamente con `SentenceTransformer`.

## Capacidades

- Generación de embeddings densos de frases y pasajes para recuperación de información (dense retrieval).
- Búsqueda semántica en dominio biomédico, entrenado sobre pares de BioASQ.
- Codificación normalizable (`normalize_embeddings=True`) para similitud coseno.
- Integración nativa con la librería sentence-transformers.
- Combinación con recuperación léxica BM25 mediante fusión de rangos recíproca (RRF), reportada por el autor.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es exclusivamente un modelo de representación para recuperación.

## Casos de uso

- Recuperación de evidencia biomédica para RAG: dado un enunciado de pregunta clínica, el modelo genera un vector que permite recuperar pasajes relevantes de un corpus médico; el autor reporta NDCG@5 de 0,1871 y MRR@10 de 0,2795 en solitario sobre el corpus completo de 279 preguntas de test.
- Búsqueda híbrida densa + léxica: combinado con BM25 mediante RRF, las métricas suben a NDCG@5 de 0,4613 y MRR@10 de 0,6482, lo que lo hace adecuado como componente denso de un sistema híbrido de recuperación.
- Asistentes de pregunta-respuesta sobre literatura científica: indexar abstracts y pasajes de PubMed o BioASQ y recuperar los fragmentos más similares a la consulta antes de pasarlos a un modelo generador.
- Deduplicación y agrupación semántica de documentos biomédicos: los embeddings permiten agrupar pasajes con contenido equivalente mediante clustering sobre similitud coseno.
- Búsqueda interna en repositorios documentales de salud: desplegar un índice vectorial sobre guías clínicas o protocolos para que el personal sanitario localice secciones relevantes por significado y no solo por palabra clave.
- Filtrado de candidatos en pipelines de anotación: usar el bi-encoder como primera etapa de recuperación barata (33 millones de parámetros) antes de un re-ranking más costoso.
- Prototipado académico de sistemas de recuperación: al ser un modelo pequeño (0,1 GB) y cargable con sentence-transformers, es útil para experimentar con arquitecturas RAG en entornos con recursos limitados.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card sobre el corpus completo con 279 preguntas de test:

| Metrica | Modelo denso aislado | Hibrido con BM25 (RRF) |
|---|---|---|
| NDCG@5 | 0,1871 | 0,4613 |
| MRR@10 | 0,2795 | 0,6482 |

No se han publicado en la información disponible resultados comparativos con otros modelos en benchmarks estándar como MMLU, HumanEval o GSM8K, que por otra parte no aplican a un modelo de recuperación.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 33,36 millones de parámetros en fp32 el modelo ocupa aproximadamente 0,13 GB, y en fp16 alrededor de 0,07 GB, más el overhead de activaciones y del tokenizador.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; funciona sin problema en tarjetas de gama de entrada y en CPU para volúmenes moderados.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: sentence-transformers de forma nativa; también puede exportarse a ONNX o usarse con bibliotecas de indexación vectorial como FAISS o Qdrant para servir embeddings. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| medir-rag-bi-encoder-merged | 33,36 M | no disponible | Biomédico (BioASQ) | no disponible | Hugging Face |
| BAAI/bge-small-en-v1.5 (base) | 33 M aprox. | 512 tokens (modelo base) | General, inglés | MIT (modelo base) | Hugging Face |
| Otros bi-encoders biomédicos (p. ej. adaptaciones de PubMedBERT) | variable | variable | Biomédico | variable | no disponible |

La comparación directa de rendimiento con alternativas no está disponible en la información proporcionada. El modelo base bge-small-en-v1.5 es el punto de referencia natural, ya que este checkpoint es un ajuste suyo sobre datos de BioASQ.

## Limitaciones y advertencias

- El modelo está especializado en recuperación biomédica; su rendimiento en otros dominios puede degradarse respecto al modelo base.
- Los valores absolutos de recuperación en solitario son modestos (NDCG@5 de 0,1871); el autor recomienda implícitamente el uso híbrido con BM25, donde las métricas mejoran sustancialmente.
- No se especifica la licencia, por lo que no puede confirmarse el uso comercial; debe consultarse con el autor antes de un despliegue en producción.
- No se documentan los idiomas soportados; el modelo base es de dominio inglés, por lo que el uso en castellano u otros idiomas no está validado.
- No se especifican sesgos conocidos ni evaluación de robustez; al entrenarse sobre BioASQ, puede heredar sesgos de ese corpus.
- No es un modelo generativo: no produce texto y no debe evaluarse con benchmarks de razonamiento o generación.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación externa; conviene verificar los resultados de forma independiente.
- No se detalla la composición exacta del dataset de entrenamiento ni posibles solapamientos con el conjunto de test, un aspecto relevante para interpretar las métricas reportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iovieira/medir-rag-bi-encoder-merged
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Proyecto MedIR-RAG (Universidad de Évora): no disponible enlace directo en la información proporcionada
- Paper o blog del proyecto: no disponible
- Repositorio de código (`train_bi_encoder.py`): no disponible enlace directo en la información proporcionada
