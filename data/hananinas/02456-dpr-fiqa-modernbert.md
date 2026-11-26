# hananinas/02456-dpr-fiqa-modernbert

## Resumen

`hananinas/02456-dpr-fiqa-modernbert` es un recuperador denso de pasajes (dense passage retriever) construido sobre `answerdotai/ModernBERT-base` y entrenado con el esquema contrastivo DPR sobre el conjunto de datos FiQA, orientado a preguntas de finanzas personales. Lo desarrolla el usuario de Hugging Face `hananinas` como proyecto final del curso 02456 Deep Learning de la Technical University of Denmark (DTU). No es un modelo generativo: su funcion es producir embeddings de 768 dimensiones para preguntas y pasajes, de modo que la similitud coseno entre ambos permita ordenar un corpus por relevancia.

La relevancia practica del modelo esta acotada: se trata de un checkpoint academico, con licencia no declarada y con un formato de carga que depende del codigo del proyecto (no de `transformers` de forma aislada). Aun asi, sus resultados en el test de FiQA (nDCG@10 de 0,3658 frente a 0,2803 de BM25 con k1 1,5 y b 0,75) muestran una mejora clara sobre las lineas base lexicas, lo que lo convierte en una referencia util para estudiar recuperacion densa en dominios especializados y con recursos limitados.

Arquitectura transformer encoder (ModernBERT), 768 dimensiones de embedding, contexto de 512 tokens para pasajes y 64 para preguntas, y un unico encoder compartido entre las dos torres. El entrenamiento se completo en una GPU de portatil de 6 GB en 7.387 segundos, lo que subraya su caracter de experimento reproducible a pequena escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base) con pooling por media y normalizacion L2; torre compartida para pregunta y pasaje |
| Parametros totales | no disponible (heredados de `answerdotai/ModernBERT-base`; el autor no los declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens para preguntas, 512 tokens para pasajes |
| Tipos de cuantizacion | no disponible (solo se distribuye el state dict en punto flotante) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | `query_encoder.pt` (state dict PyTorch del wrapper `HFEncoder`), `meta.json`, `run.json`, `tokenizer/` |
| Dimension del embedding | 768 |
| Dataset de entrenamiento | `vibrantlabsai/fiqa` (5.500 preguntas de train, 500 de validacion, 648 de test; corpus de 17.110 pasajes) |
| Modelo base | `answerdotai/ModernBERT-base` |
| Tamano del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

El modelo emplea un unico encoder ModernBERT-base compartido entre la torre de preguntas y la de pasajes (`"shared_tower": true` en `meta.json`), por lo que no existe un `document_encoder.pt` separado. Cada texto se codifica con pooling por media sobre los tokens (ignorando el padding) y se normaliza en L2, produciendo un vector de 768 dimensiones. La similitud se calcula como coseno entre pregunta y pasaje.

El entrenamiento sigue el esquema DPR con perdida InfoNCE sobre las puntuaciones de coseno y temperatura 0,02; el pasaje dorado de una pregunta se enmascara en el softmax cuando coincide con otro pasaje del lote. Cada paso del optimizador procesa 128 preguntas, cada una con su pasaje dorado y un negativo duro obtenido por BM25 (k1 0,9, b 0,4), lo que suma 256 pasajes por paso. Los negativos duros se extraen de los 30 mejores pasajes no dorados por pregunta, muestreando uno de los 10 primeros en cada extraccion, y el pool de negativos excluye cualquier pasaje dorado de validacion o test. Para ajustar en memoria se usa gradient cache sobre micro-lotes de como maximo 16.384 tokens con padding, autocast en bf16 y gradient checkpointing. El optimizador es AdamW con lr 5e-5, weight decay 0,01, calentamiento lineal del 10 % y decaimiento lineal posterior, con recorte de gradiente a 1,0. Se entreno hasta 7 epocas con paciencia 3 sobre nDCG@10 de validacion; se guardo la mejor (epoca 5), con nDCG@10 de validacion de 0,3985. Todo el entrenamiento se ejecuto en una GPU de portatil de 6 GB en 7.387 segundos.

## Capacidades

- Recuperacion densa de pasajes: genera embeddings normalizados de preguntas y pasajes para busqueda por similitud coseno sobre un corpus.
- Busqueda semantica en dominio financiero personal: entrenado especificamente sobre FiQA, captura vocabulario y formulaciones propias de preguntas de finanzas.
- Representacion de preguntas cortas: ventana de 64 tokens, adecuada para consultas concisas.
- Representacion de pasajes de hasta 512 tokens.
- Torre compartida: el mismo encoder sirve para indexar el corpus y para codificar consultas, lo que simplifica el despliegue.
- Recuperacion de un solo turno: no soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidad multilingue: limitada al ingles.
- No es un modelo generativo: no produce texto, solo vectores.

## Casos de uso

- Busqueda semantica sobre documentacion financiera: indexar un corpus de articulos o FAQ de finanzas personales con el encoder compartido y recuperar los pasajes mas relevantes para cada consulta mediante coseno exacto, aprovechando que el modelo supera a BM25 en nDCG@10 en el dominio de FiQA.
- Reproduccion de experimentos academicos: el checkpoint y el repositorio de codigo permiten repetir el pipeline completo (entrenamiento, evaluacion y visualizacion) en una GPU de consumo, util para cursos y trabajos de investigacion sobre recuperacion.
- Linea base para comparativas de retrievers: sirve como referencia densa frente a BM25 y TF-IDF en tareas de question answering sobre corpus financieros, con metricas publicadas (nDCG@10, MRR@10, Recall@k, Hit@20).
- Filtrado previo en pipelines de RAG: usar el retriever para reducir un corpus de decenas de miles de pasajes a los 10 o 20 mas relevantes antes de pasarlos a un modelo generativo, reduciendo coste y latencia del generador.
- Analisis de preguntas de usuarios en foros financieros: agrupar o enrutar consultas hacia respuestas existentes midiendo similitud entre el embedding de la pregunta y el de respuestas previas.
- Estudio de negativos duros y gradient cache: el codigo y la configuracion (`run.json`) documentan una receta completa para entrenar retrievers con memoria limitada, reutilizable como plantilla en otros dominios.

## Benchmarks y rendimiento

Resultados en el test de FiQA: 648 preguntas contra los 17.110 pasajes del corpus, busqueda por coseno exacta y la misma implementacion de metricas para todas las filas.

| Metodo | nDCG@10 | MRR@10 | Recall@1 | Recall@5 | Recall@10 | Recall@20 | Hit@20 |
|---|---|---|---|---|---|---|---|
| Este modelo | 0,3658 | 0,4215 | 0,3148 | 0,3745 | 0,4576 | 0,5533 | 0,7377 |
| BM25 (k1 1,5, b 0,75) | 0,2803 | 0,3481 | 0,2685 | 0,2855 | 0,3437 | 0,4186 | 0,6188 |
| BM25 (k1 0,9, b 0,4) | 0,2576 | 0,3184 | 0,2423 | 0,2569 | 0,3187 | 0,3920 | 0,5880 |
| TF-IDF | 0,1222 | 0,1579 | 0,1003 | 0,1164 | 0,1639 | 0,2399 | 0,4151 |

Recall@k se define como aciertos en el top k dividido entre min(k, numero de pasajes dorados). Hit@k es la proporcion de preguntas con al menos un pasaje dorado en el top k. nDCG@10 de validacion de la epoca guardada: 0,3985. No se han publicado resultados frente a otros retrievers densos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento cupo en una GPU de 6 GB, por lo que la inferencia en bf16 o fp32 sobre ModernBERT-base requiere del orden de 1 a 2 GB para el modelo y espacio adicional para los lotes; no se dispone de mediciones publicadas de VRAM en inferencia.
- GPU recomendadas: cualquier GPU con al menos 6 GB para reproducir el entrenamiento (el autor uso una GPU de portatil de 6 GB); para indexacion a gran escala se recomienda A100, H100 o RTX 4090 por throughput.
- GPU de consumo: si, cabe en tarjetas consumer de 6 GB o mas; el cuello de botella sera el tamano del lote y el corpus, no el modelo.
- Opciones de despliegue: no es compatible con `transformers` de forma aislada; requiere el codigo del proyecto (`src.training.build.load_towers`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas estan orientados a modelos generativos. La evaluacion oficial se ejecuta con `scripts/training_run_data.py evaluate`.
- Latencia y throughput: no disponibles. El unico dato temporal publicado es el tiempo de entrenamiento (7.387 s en una GPU de 6 GB).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | Retriever denso (ModernBERT-base) | no disponible | 64 (pregunta) / 512 (pasaje) | no disponible | Hugging Face, requiere codigo del proyecto |
| BM25 | Recuperacion lexica | no aplica | no aplica | algoritmo abierto | Implementaciones multiples (p. ej. rank_bm25) |
| TF-IDF | Recuperacion lexica | no aplica | no aplica | algoritmo abierto | Implementaciones multiples (scikit-learn) |
| DPR original (Karpukhin et al., 2020) | Retriever denso (BERT-base) | ~110 M por torre | 512 tokens | no disponible en esta ficha | Repositorios oficiales de Facebook Research |

La comparacion con otros retrievers densos sobre FiQA no esta disponible en la informacion proporcionada. Las unicas referencias cuantitativas son las lineas base lexicas incluidas en la model card.

## Limitaciones y advertencias

- Modelo academico: es un proyecto de curso, sin proceso de publicacion ni validacion externa; no debe tratarse como un checkpoint de produccion.
- Licencia no declarada: no hay informacion sobre permisos de uso comercial, lo que impide asumir su reutilizacion en productos.
- Formato de carga no estandar: el checkpoint no se carga con `transformers` de forma directa; depende del wrapper `HFEncoder` y del repositorio `linxuansong1022/02456-retrieval-project`, lo que anade fragilidad en despliegues.
- Dominio estrecho: entrenado solo sobre FiQA (finanzas personales) y en ingles; el rendimiento fuera de ese dominio o en otros idiomas no esta evaluado y probablemente sea peor.
- Corpus limitado: el corpus de 17.110 pasajes esta formado por la union de las respuestas doradas de los tres splits, de modo que cada pasaje es la respuesta correcta a alguna pregunta; esto puede inflar las metricas respecto a un corpus real con muchos pasajes irrelevantes.
- Riesgo de sesgo: no se documenta ningun analisis de sesgos; al derivar de ModernBERT-base y de FiQA, puede heredar sesgos del corpus y del modelo base.
- Alucinacion: al ser un retriever, no genera texto y no puede alucinar contenido, pero si puede devolver pasajes irrelevantes; su Hit@20 de 0,7377 implica que en torno al 26 % de las preguntas no tienen ningun pasaje dorado entre los 20 primeros.
- Sin soporte de contexto largo: la ventana de 512 tokens para pasajes limita la indexacion de documentos extensos, que habria que trocear.
- Sin cuantizaciones publicadas: no hay versiones GGUF ni ONNX, lo que restringe las opciones de despliegue ligero.
- Metricas no comparables de forma directa con otras publicaciones de FiQA: la definicion de Recall@k y el corpus construido a partir de respuestas doradas difieren de las configuraciones habituales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hananinas/02456-dpr-fiqa-modernbert
- Codigo del proyecto: https://github.com/linxuansong1022/02456-retrieval-project/tree/feat/training-visualization
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Dataset: https://huggingface.co/datasets/vibrantlabsai/fiqa
- Curso 02456 Deep Learning (DTU): https://kurser.dtu.dk/course/02456
