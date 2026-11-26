# hananinas/02456-dpr-squad-modernbert

## Resumen

El modelo `hananinas/02456-dpr-squad-modernbert` es un recuperador denso de pasajes (dense passage retriever, DPR) construido sobre el encoder `answerdotai/ModernBERT-base`. Lo desarrolla el usuario hananinas como proyecto final del curso 02456 Deep Learning de la Universidad Tecnica de Dinamarca (DTU). Su funcion es, dada una pregunta en ingles sobre contenido de Wikipedia, devolver los pasajes mas relevantes de un corpus cerrado de 20.958 fragmentos, usando similitud coseno exacta sobre embeddings de 768 dimensiones.

El modelo sigue la receta del otro checkpoint del mismo autor para FiQA y se entrena sobre SQuAD v1.1 con negativos duros generados por BM25. La relevancia practica es doble: por un lado, documenta un pipeline completo de entrenamiento de recuperacion densa con recursos muy limitados (una unica GPU de 6 GB), y por otro, ofrece una comparacion honesta frente a baselines lexicos clasicos (BM25 y TF-IDF) en el mismo corpus y con la misma metrica.

Arquitectonicamente es un transformer encoder bidireccional (ModernBERT-base) con una torre compartida entre consultas y pasajes, pooling por media de tokens y normalizacion L2. No es un modelo generativo: no produce texto, solo representaciones vectoriales para busqueda semantica. El contexto de entrada esta acotado a 64 tokens para preguntas y 512 para pasajes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (ModernBERT-base), torre compartida para query y pasaje |
| Parametros totales | no disponible (heredados de ModernBERT-base; la model card no los explicita) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens para preguntas, 512 tokens para pasajes |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en `query_encoder.pt` en precision de entrenamiento, bf16 autocast durante el entrenamiento) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | `query_encoder.pt` (state dict PyTorch del wrapper `HFEncoder` del proyecto), tokenizer en carpeta `tokenizer/`; no se distribuye en safetensors ni GGUF |
| Dimension del embedding | 768 (pooling por media + L2) |
| Funcion de perdida | InfoNCE sobre similitud coseno con temperatura 0.02 |
| Tamano del repo | 0.6 GB |

## Arquitectura y entrenamiento

El backbone es `answerdotai/ModernBERT-base`, un encoder transformer modernizado (entrenado originalmente sobre 2 billones de tokens segun la documentacion de Transformers) que aqui se reutiliza como torre unica compartida entre preguntas y pasajes. El pooling es la media sobre tokens ignorando padding, seguida de normalizacion L2, lo que produce vectores de 768 dimensiones listos para busqueda por producto escalar o coseno. La perdida es InfoNCE con temperatura 0.02; los pasajes que tambien son gold para la pregunta se enmascaran del softmax para evitar falsos negativos.

El entrenamiento usa SQuAD v1.1 con 78.872 preguntas de train, 8.727 de validacion (cada decimo titulo de articulo ordenado, extraido del split de train) y 10.570 de test (el split de validacion original de SQuAD). El corpus es la union de los parrafos de contexto de los tres splits: 20.958 pasajes. Cada paso de optimizador procesa 128 preguntas, cada una con su pasaje gold y un negativo duro BM25 (k1 0.9, b 0.4), tomado de entre los 30 mejores pasajes no gold y muestreando uno de los 10 primeros. Se aplica gradient cache sobre micro-lotes de como maximo 16.384 tokens con padding, autocast en bf16 y gradient checkpointing. El optimizador es AdamW con lr 5e-5, weight decay 0.01, warm-up lineal del 10 por ciento y decaimiento lineal, clipping de gradiente a 1.0. La programacion son 9 rondas de 100 pasos (115.200 preguntas muestreadas, aproximadamente 1,5 pasadas) con evaluacion de nDCG@10 en validacion tras cada ronda y paciencia 3; todas las rondas mejoraron y se guardo la novena. El entrenamiento completo se ejecuto en una GPU de portatil de 6 GB en 11.844 segundos.

## Capacidades

- Recuperacion densa de pasajes: dada una pregunta en ingles, devuelve los pasajes mas similares del corpus indexado mediante similitud coseno exacta.
- Embeddings de frases y pasajes: genera representaciones de 768 dimensiones normalizadas L2, reutilizables para indexacion y busqueda vectorial.
- Busqueda semantica sobre Wikipedia en ingles: entrenado especificamente sobre el dominio de SQuAD (articulos de Wikipedia).
- Torre compartida: el mismo encoder procesa consultas y documentos, lo que simplifica el despliegue (un unico modelo en memoria).
- Integracion con pipeline de recuperacion hibrida: pensado para combinarse con BM25 como generador de negativos duros o como recuperador complementario.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni modo de razonamiento extendido: es exclusivamente un encoder de recuperacion.

## Casos de uso

- Busqueda semantica sobre una base documental en ingles: indexar los pasajes con el encoder y consultar con preguntas en lenguaje natural; el modelo devuelve los candidatos mas cercanos por coseno. Adecuado cuando el vocabulario de la consulta no coincide literalmente con el del documento.
- Recuperacion aumentada (RAG) en ingles: usar el modelo como primera etapa de recuperacion antes de un generador; sus Recall@10 y Recall@20 (0.9079 y 0.9420) son superiores a BM25 en el corpus de SQuAD, lo que reduce los fallos por documento no recuperado.
- Recuperacion hibrida con BM25: combinar las puntuaciones densas con las lexicas. El modelo aporta mejor cobertura a 10 y 20 documentos, mientras BM25 domina en el primer resultado, de modo que la fusion compensa los puntos debiles de cada uno.
- Generacion de negativos duros para otros recuperadores: los pasajes mejor puntuados por este modelo y no gold pueden servir como negativos de entrenamiento para un segundo recuperador o un reranker.
- Prototipado academico y docencia: el repositorio incluye scripts de entrenamiento, evaluacion y visualizacion, lo que lo convierte en una referencia reproducible para cursos de deep learning con hardware modesto (una GPU de 6 GB basta).
- Evaluacion comparativa de recuperadores: el codigo de metricas del proyecto (nDCG@10, MRR@10, Recall@k, Hit@k) permite contrastar metodos lexicos y densos sobre el mismo corpus y splits, util para experimentos de investigacion.
- Filtrado previo en pipelines de pregunta-respuesta extractiva: al recuperar el pasaje correcto en el top 20 en el 94,20 por ciento de las preguntas, sirve como etapa de cribado antes de un modelo de QA.

## Benchmarks y rendimiento

Resultados en test (10.570 preguntas contra los 20.958 pasajes, busqueda coseno exacta, mismo codigo de metricas para todas las filas):

| Metodo | nDCG@10 | MRR@10 | Recall@1 | Recall@5 | Recall@10 | Recall@20 | Hit@20 |
|---|---|---|---|---|---|---|---|
| Este modelo | 0.7739 | 0.7306 | 0.6340 | 0.8588 | 0.9079 | 0.9420 | 0.9420 |
| BM25 (k1 0.9, b 0.4) | 0.8002 | 0.7684 | 0.6974 | 0.8606 | 0.8987 | 0.9265 | 0.9265 |
| BM25 (k1 1.5, b 0.75) | 0.7935 | 0.7602 | 0.6851 | 0.8571 | 0.8966 | 0.9256 | 0.9256 |
| TF-IDF | 0.4208 | 0.3667 | 0.2750 | 0.4903 | 0.5950 | 0.7048 | 0.7048 |

nDCG@10 en validacion de la ronda guardada: 0.7675. El modelo supera a BM25 en Recall@10 y Recall@20, pero queda por detras en nDCG@10, MRR@10, Recall@1 y Recall@5. No se han publicado resultados de benchmarks estandar de recuperacion (BEIR, MTEB) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento cupo en una GPU de 6 GB con gradient cache y bf16; la inferencia de un encoder base de este tamano requiere del orden de 1 a 2 GB en fp16/bf16, aunque la cifra exacta no esta publicada.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente para el encoder; para indexar corpus grandes conviene una GPU de datacenter (A100, H100) por throughput, no por memoria.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: el checkpoint se carga mediante el codigo del proyecto (`load_towers` del repositorio `02456-retrieval-project`), no directamente con `transformers`; el state dict corresponde al wrapper `HFEncoder` sobre ModernBERT-base. No se distribuyen pesos en GGUF ni hay soporte documentado para llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: no disponibles. Como referencia de coste de entrenamiento, 11.844 segundos en una GPU de 6 GB para 9 rondas de 100 pasos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento en SQuAD (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo | Recuperador denso (ModernBERT-base) | no disponible | 64/512 tokens | nDCG@10 0.7739; Recall@20 0.9420 | no disponible | Hugging Face, requiere codigo del proyecto |
| BM25 (k1 0.9, b 0.4) | Recuperador lexico | no aplica | no aplica | nDCG@10 0.8002; Recall@20 0.9265 | algoritmo abierto | Implementaciones multiples (p. ej. rank_bm25) |
| TF-IDF | Recuperador lexico | no aplica | no aplica | nDCG@10 0.4208; Recall@20 0.7048 | algoritmo abierto | scikit-learn y similares |
| `hananinas/02456-dpr-fiqa-modernbert` | Recuperador denso (misma receta) | no disponible | 64/512 tokens | no disponible en esta ficha (otro dataset, FiQA) | no disponible | Hugging Face |

La comparacion con recuperadores densos de referencia (DPR original, E5, BGE) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento inferior a BM25 en las metricas de cabeza (nDCG@10, MRR@10, Recall@1 y Recall@5): para aplicaciones donde importa el primer resultado, BM25 es mejor opcion o conviene una fusion hibrida.
- Dominio y corpus cerrados: entrenado y evaluado solo sobre SQuAD v1.1 y su union de 20.958 pasajes; el comportamiento fuera de ese corpus o sobre otros dominios no esta validado.
- Solo ingles: la model card declara unicamente el idioma `en`.
- Licencia no disponible: no se especifica licencia, por lo que el uso comercial no esta autorizado de forma explicita y requiere contactar con el autor.
- Formato no estandar: los pesos son un state dict de PyTorch que depende del codigo del proyecto; no se pueden cargar con `transformers` de forma directa ni con servidores de inferencia habituales.
- Proyecto academico sin mantenimiento garantizado: es un trabajo de curso, con 0 descargas y 0 likes en el momento de la consulta; no hay garantias de soporte ni de actualizaciones.
- Riesgo de sesgo y alucinacion: al ser un recuperador, no genera texto y no alucina en sentido estricto, pero hereda los sesgos del corpus de Wikipedia y de ModernBERT-base; puede devolver pasajes plausibles pero incorrectos para la pregunta.
- Sin cuantizaciones publicadas: no hay versiones GGUF, ONNX ni int8 documentadas, lo que limita el despliegue en entornos sin PyTorch.
- Longitud de pasaje fija a 512 tokens: pasajes mas largos se truncan y pueden perder la informacion relevante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hananinas/02456-dpr-squad-modernbert
- Modelo hermano (FiQA, misma receta): https://huggingface.co/hananinas/02456-dpr-fiqa-modernbert
- Codigo del proyecto: https://github.com/linxuansong1022/02456-retrieval-project/tree/feat/training-visualization
- Dataset SQuAD: https://huggingface.co/datasets/rajpurkar/squad
- Documentacion de ModernBERT en Transformers: https://huggingface.co/docs/transformers/model_doc/modernbert
- Curso 02456 Deep Learning (DTU): https://kurser.dtu.dk/course/02456
- Referencia externa sobre ModernBERT fine-tuneado para SQuAD (ONNX): https://ai.hjlabs.in/models/onnx-community/modernbert-finetuned-squad-onnx
- Referencia externa sobre ModernBERT-base-squad2-v0.2: https://model.aibase.com/models/details/1915693881322266625
