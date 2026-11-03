# benja-d/paraphrase-spanish-distilroberta-finetuned-chatbot

## Resumen

`benja-d/paraphrase-spanish-distilroberta-finetuned-chatbot` es un modelo de embeddings de frases en castellano derivado de `somosnlp-hackathon-2022/paraphrase-spanish-distilroberta`, un DistilRoBERTa afinado para similitud semantica en espanol. El autor, `benja-d`, lo ha reentrenado con `sentence-transformers` sobre un conjunto de 168 pares (pregunta, parafrasis) extraidos de un corpus de atencion al cliente del dominio de transferencia de vehiculos en Chile (Autofact). El resultado es un encoder denso de 124,6 millones de parametros que proyecta frases a un espacio vectorial donde la similitud coseno refleja cercania semantica.

Su relevancia practica esta en el uso como retriever dentro de un pipeline RAG orientado a chatbots de soporte: dado un mensaje del usuario, el modelo recupera la FAQ mas cercana del corpus indexado. A diferencia de un LLM generativo, no produce texto, sino vectores de 768 dimensiones (con soporte Matryoshka, es decir, truncables a 512, 256, etc. sin reentrenar). El modelo incorpora la tecnica Matryoshka Representation Learning, que permite reducir la dimensionalidad del embedding a costa de una perdida controlada de precision.

El contexto de entrenamiento es muy acotado: 168 pares de ejemplo y un dominio vertical concreto (tramites de vehiculos). Esto lo hace util como componente especializado, pero no como modelo generalista de similitud semantica en espanol. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilRoBERTa, 6 capas) |
| Parametros totales | 124.645.632 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilRoBERTa base: 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es (espanol) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimension del embedding | 768 (Matryoshka: truncable a 512, 256, etc.) |
| Funcion de perdida | MatryoshkaLoss + MultipleNegativesRankingLoss |
| Tamano del dataset de entrenamiento | 168 pares |
| Libreria | sentence-transformers |
| Pipeline | sentence-similarity / feature-extraction |

## Arquitectura y entrenamiento

El modelo parte de `somosnlp-hackathon-2022/paraphrase-spanish-distilroberta`, un DistilRoBERTa (6 capas, 768 dimensiones ocultas, 12 cabezas de atencion, ~82M parametros del encoder mas la proyeccion densa que eleva el total a 124,6M) afinado para similitud de parafrasis en espanol. Sobre esa base, el autor aplica un reentrenamiento con `sentence-transformers` usando dos funciones de perdida combinadas: `MultipleNegativesRankingLoss` (contrastiva con negativos en el batch) y `MatryoshkaLoss`, que anida representaciones de dimensionalidad decreciente para permitir truncar el embedding en inferencia.

El conjunto de entrenamiento consta de 168 pares (pregunta, parafrasis) construidos a partir de un corpus de FAQ de Autofact sobre transferencia de vehiculos, tasacion y tramites legales chilenos. No se documenta el numero de tokens, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO (no aplica en un encoder de similitud). La innovacion tecnica destacable es el uso de Matryoshka, que permite desplegar el modelo con embeddings de 512 o 256 dimensiones reduciendo el coste de almacenamiento en un indice vectorial sin reentrenar.

## Capacidades

- Generacion de embeddings de frases en espanol para similitud semantica (similitud coseno).
- Recuperacion densa de pasajes (dense retrieval) en un corpus indexado.
- Extraccion de caracteristicas (`feature-extraction`) para clasificacion, clustering o deduplicacion de textos.
- Soporte de embeddings truncables (Matryoshka) a 768, 512, 256 y dimensiones inferiores.
- Compatible con `text-embeddings-inference` y `endpoints_compatible` (despliegue como endpoint de embeddings).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un encoder, no un modelo generativo.
- Capacidad multilingue limitada al espanol; no se declaran otros idiomas.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Recuperacion de FAQ en un chatbot de soporte: indexar las preguntas frecuentes del corpus (transferencia de vehiculos, tasacion, posesion efectiva) y, ante un mensaje del usuario, recuperar la entrada mas cercana por similitud coseno. El modelo esta afinado especificamente sobre ese dominio, lo que mejora la precision frente a un encoder generico.
- Deduplicacion de tickets de soporte: agrupar consultas entrantes semanticamente equivalentes ("me sale error al transferir" vs "no puedo completar la transferencia") para reducir carga del equipo y detectar incidencias recurrentes.
- Enrutado de consultas a agentes especializados: usar el embedding del mensaje para clasificar la intencion y dirigir el ticket al flujo correcto (venta, transferencia, herencia, empresa) mediante un clasificador ligero sobre los vectores.
- Componente retriever en un pipeline RAG: servir embeddings a un indice vectorial (FAISS, Qdrant, pgvector) y alimentar un LLM generativo con los pasajes recuperados; el modelo actua solo como retriever, no como generador.
- Busqueda semantica en documentacion legal de tramites: indexar textos normativos o guias de transferencia y permitir busqueda por lenguaje natural sin coincidencia exacta de terminos.
- Filtro de similitud en moderacion o control de calidad: detectar respuestas duplicadas o fuera de dominio comparando el embedding de la respuesta generada con el de la pregunta original.
- Evaluacion de parafrasis en castellano dentro de un conjunto de tests: medir si dos formulaciones de una misma pregunta superan un umbral de similitud coseno.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card, tarea de information retrieval, evaluados a distintas dimensiones de embedding (Matryoshka). Metricas de similitud coseno:

| Metrica | dim 768 | dim 512 |
|---|---|---|
| Cosine Accuracy@1 | 0,8667 | 0,8667 |
| Cosine Accuracy@3 | 0,9000 | 0,9000 |
| Cosine Accuracy@5 | 0,9000 | 0,9000 |
| Cosine Accuracy@10 | 1,0000 | 1,0000 |
| Cosine Precision@1 | 0,8667 | no disponible |
| Cosine Precision@3 | 0,8778 | no disponible |
| Cosine Precision@5 | 0,8600 | no disponible |
| Cosine Precision@10 | 0,5600 | no disponible |
| Cosine Recall@1 | 0,1603 | no disponible |
| Cosine Recall@3 | 0,4754 | no disponible |
| Cosine Recall@5 | 0,7516 | no disponible |
| Cosine Recall@10 | 0,9611 | no disponible |
| Cosine NDCG@10 | 0,9287 | no disponible |
| Cosine MRR@10 | 0,8976 | no disponible |
| Cosine MAP@100 | 0,9276 | no disponible |

Nota: los valores no estan verificados (`verified: false`) y el `model-index` declara el nombre "ModernBERT Embed base Legal Matryoshka", que no coincide con la arquitectura DistilRoBERTa del modelo; se reproducen tal cual aparecen en la model card. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que no aplican a un encoder de similitud.

## Requisitos de hardware

- VRAM para inferencia: ~0,5 GB en fp32 (124,6M parametros), ~0,25 GB en fp16; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU con latencia aceptable para lotes pequenos. Para alto throughput, cualquier GPU moderna (RTX 3060 en adelante, A10, A100, H100).
- Cabe en GPU consumer: si, en cualquier modelo con al menos 1 GB de VRAM libre (GTX 1650, RTX 2060, RTX 4090, etc.).
- Opciones de despliegue: `sentence-transformers` (Python), `text-embeddings-inference` (TGI para embeddings), Hugging Face Inference Endpoints (`endpoints_compatible`), ONNX Runtime, y exportacion a otros runtimes de inferencia de encoders.
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser un encoder de 6 capas, el coste por frase es bajo en CPU y muy bajo en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| benja-d/paraphrase-spanish-distilroberta-finetuned-chatbot | 124,6M | no disponible (base 512) | es | Apache 2.0 | Afinado en dominio de soporte (168 pares), Matryoshka |
| somosnlp-hackathon-2022/paraphrase-spanish-distilroberta | ~124M (misma base) | 512 | es | no disponible en esta ficha | Modelo base generalista de parafrasis en espanol |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | ~118M | 128 | multilingue (50+) | Apache 2.0 | Alternativa multilingue generica, sin afinado de dominio |
| intfloat/multilingual-e5-base | ~278M | 512 | multilingue | MIT | Mayor tamano y cobertura multilingue, sin especializacion en espanol de soporte |

La comparativa es cualitativa: no se dispone de resultados de benchmarks cruzados entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido (168 pares): el modelo puede sobreajustar al dominio de Autofact y generalizar mal fuera de el.
- Dominio vertical restringido: transferencia de vehiculos, tasacion y tramites chilenos; su rendimiento en otros temas en espanol no esta garantizado.
- Solo espanol: no soporta otros idiomas.
- No es un modelo generativo: no produce texto, no soporta tool calling ni agentes; usarlo como generador es un error de uso.
- Riesgo de sesgo: al entrenarse sobre un corpus de una empresa concreta, puede reflejar terminologia y supuestos de ese contexto (normativa chilena, RUT, posesion efectiva).
- Riesgo de falsos positivos en similitud: con solo 168 pares, la calibracion del umbral de similitud coseno puede no ser fiable; conviene validar con un conjunto propio.
- Inconsistencia en la model card: el `model-index` declara "ModernBERT Embed base Legal Matryoshka" y resultados no verificados (`verified: false`), lo que resta fiabilidad a los benchmarks publicados.
- Longitud de contexto no documentada explicitamente; la base DistilRoBERTa limita a 512 tokens, insuficiente para documentos largos sin troceado.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias; la responsabilidad sobre el uso recae en el integrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/benja-d/paraphrase-spanish-distilroberta-finetuned-chatbot
- Modelo base: https://huggingface.co/somosnlp-hackathon-2022/paraphrase-spanish-distilroberta
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de Matryoshka Representation Learning (arXiv:2205.13147): https://arxiv.org/abs/2205.13147
- Paper de DistilRoBERTa / distillation (arXiv:1705.00652): https://arxiv.org/abs/1705.00652
- Libreria sentence-transformers: https://www.sbert.net/
- Documentacion de text-embeddings-inference: https://huggingface.co/docs/text-embeddings-inference
