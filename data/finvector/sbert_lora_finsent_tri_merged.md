# finvector/sbert_lora_finsent_tri_merged

## Resumen

`finvector/sbert_lora_finsent_tri_merged` es un modelo de embeddings de frases publicado por el usuario finvector en Hugging Face. Se distribuye con la libreria `sentence-transformers` y el pipeline `sentence-similarity`, y su proposito es transformar frases y parrafos en vectores densos de 768 dimensiones para tareas de similitud semantica, clustering y busqueda semantica. El nombre sugiere un ajuste fino mediante LoRA sobre un modelo SBERT base, con posterior fusion de los pesos del adaptador en el modelo principal ("merged"), orientado a datos financieros ("finsent") y probablemente con entrenamiento de tripletas ("tri").

El repositorio contiene 109.482.240 parametros en formato safetensors y ocupa 0,2 GB, lo que corresponde a un transformer tipo BERT-base (12 capas, 768 dimensiones ocultas). La model card incluida en el repositorio es, en realidad, la de `sentence-transformers/bert-base-nli-mean-tokens`, con su aviso de deprecacion, y no documenta el proceso de entrenamiento especifico de este modelo derivado. No se han publicado datos sobre el dataset de ajuste, el idioma de entrenamiento ni resultados de evaluacion.

La relevancia de este modelo es limitada: se trata de un artefacto derivado de un modelo base ya deprecado por sus propios autores, sin documentacion propia, sin descargas y sin evaluaciones. Resulta util unicamente como referencia para quien quiera inspeccionar el resultado de un ajuste LoRA sobre SBERT, no como opcion recomendada para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT-base (12 capas, 768 dimensiones ocultas), con pooling de media sobre tokens |
| Parametros totales | 109.482.240 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens (max_seq_length declarado en la model card) |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors en fp32/fp16; no se publican variantes GGUF u ONNX) |
| Idiomas soportados | No disponible (la model card no especifica idiomas; el nombre sugiere dominio financiero, probablemente ingles o fines) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de un SBERT clasico: un encoder BERT-base seguido de una capa de pooling que promedia los embeddings de tokens ponderados por la mascara de atencion, produciendo un vector de 768 dimensiones por frase. La model card declara `max_seq_length: 128` y pooling de media (`pooling_mode_mean_tokens: True`), sin pooling de CLS ni de maximo. El modelo base referenciado en la model card es `sentence-transformers/bert-base-nli-mean-tokens`, entrenado originalmente con el esquema de redes siamesas y tripletas descrito en Sentence-BERT (Reimers y Gurevych, 2019).

No se dispone de informacion sobre el dataset de ajuste, el numero de tokens, la composicion de los pares o tripletas, ni sobre el uso de RLHF o DPO. El nombre del repositorio indica que se aplico LoRA sobre el modelo base y que los pesos se fusionaron posteriormente en el modelo principal, pero no se documenta el rango del adaptador, la tasa de aprendizaje ni la configuracion del entrenamiento. Tampoco hay informacion sobre la innovacion tecnica del ajuste ni sobre evaluaciones intermedias.

## Capacidades

- Generacion de embeddings de frases y parrafos de 768 dimensiones para similitud semantica.
- Busqueda semantica y recuperacion densa sobre corpus de documentos.
- Clustering y agrupamiento de textos por similitud coseno.
- Deteccion de duplicados y near-duplicates en textos cortos.
- Clasificacion de textos mediante embeddings como caracteristica de entrada.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso: es exclusivamente un encoder de representaciones.
- Capacidad multilingue no documentada; el nombre sugiere especializacion en dominio financiero, pero no hay evidencia publicada.

## Casos de uso

- Busqueda semantica en documentacion financiera: indexar informes, notas de prensa y comunicados en una base vectorial y recuperar fragmentos relevantes por similitud coseno, aprovechando la especializacion aparente del ajuste en lenguaje financiero.
- Deduplicacion de noticias y comunicados: comparar embeddings de titulares o parrafos para detectar republicaciones o variantes del mismo contenido en un agregador de noticias economicas.
- Clasificacion de tickets o consultas: usar el embedding como entrada de un clasificador ligero (regresion logistica o MLP) para enrutar consultas de clientes hacia departamentos concretos.
- Agrupamiento de opiniones o resenas: aplicar K-means sobre los embeddings para descubrir temas recurrentes en feedback de usuarios sin etiquetas previas.
- Filtrado de candidatos en pipelines de RAG: como primera etapa de recuperacion rapida antes de un re-ranker mas costoso, dado el bajo coste computacional del modelo (109M parametros).
- Deteccion de similitud entre clausulas contractuales: comparar fragmentos de contratos para identificar clausulas equivalentes o contradictorias en revisiones legales asistidas.
- Prototipado de sistemas de recomendacion de contenido: representar articulos o productos y calcular vecinos mas cercanos para sugerencias basadas en contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MTEB, STS-Benchmark, MMLU ni de ninguna otra evaluacion en la model card ni en los metadatos del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,5 GB en fp32 (109M parametros), menos de 0,3 GB en fp16. Cabe holgadamente en cualquier GPU consumer, incluso en iGPU con memoria compartida.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU con throughput aceptable para lotes pequenos. Para alto volumen, una T4, L4 o RTX 3060 en adelante es mas que suficiente.
- Cabe en cualquier GPU consumer (GTX 1650, RTX 2060, RTX 4090, etc.) y en Apple Silicon via MPS.
- Opciones de despliegue: `sentence-transformers` (nativo), `transformers` con pooling manual, Text Embeddings Inference (TEI, etiqueta `text-embeddings-inference` presente en el repo), ONNX Runtime si se exporta manualmente, y servidores compatibles con la API de Hugging Face Endpoints (`endpoints_compatible`).
- Latencia y throughput: no disponibles de forma oficial; por el tamano del modelo, se espera del orden de miles de frases por segundo en una GPU moderna con lotes grandes, y cientos por segundo en CPU multinucleo, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension del embedding | Licencia | Estado |
|---|---|---|---|---|---|
| finvector/sbert_lora_finsent_tri_merged | 109M | 128 tokens | 768 | Apache 2.0 | Sin evaluacion publicada |
| sentence-transformers/all-MiniLM-L6-v2 | 22M | 256 tokens | 384 | Apache 2.0 | Ampliamente evaluado en MTEB |
| sentence-transformers/all-mpnet-base-v2 | 109M | 384 tokens | 768 | Apache 2.0 | Referencia en calidad para embeddings de 768 dim |
| BAAI/bge-base-en-v1.5 | 109M | 512 tokens | 768 | MIT | Estado del arte en recuperacion en ingles |

La comparacion con `all-mpnet-base-v2` es la mas directa por tamano y dimensionalidad: ambos producen vectores de 768 dimensiones, pero el modelo de sentence-transformers cuenta con evaluaciones publicas y mayor longitud de contexto (384 frente a 128 tokens). Frente a `bge-base-en-v1.5`, este ultimo ofrece contexto de 512 tokens y resultados documentados en MTEB. El modelo de finvector no aporta datos que permitan situarlo en esa comparacion.

## Limitaciones y advertencias

- La model card heredada del modelo base declara explicitamente que este tipo de modelo esta deprecado y produce embeddings de baja calidad; el aviso figura en el propio repositorio.
- No hay documentacion del ajuste LoRA ni del dataset utilizado, por lo que no es posible verificar la calidad ni el dominio real de especializacion.
- Longitud de contexto muy limitada (128 tokens), insuficiente para parrafos largos o documentos completos sin truncado.
- Sin evaluacion publicada: no se puede afirmar que supere al modelo base en ninguna tarea.
- Riesgo de sesgos heredados del corpus de entrenamiento original de BERT-base-NLI, no auditados.
- El nombre sugiere especializacion financiera, pero no se documenta el idioma ni el dominio; usarlo fuera de ese supuesto puede dar resultados pobres.
- Cero descargas y cero likes en el momento de la ficha: sin validacion por parte de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluacion hace desaconsejable su uso en produccion sin una validacion propia previa.
- No apto para generacion de texto, razonamiento ni tareas generativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/finvector/sbert_lora_finsent_tri_merged
- Modelo base referenciado: https://huggingface.co/sentence-transformers/bert-base-nli-mean-tokens
- Paper Sentence-BERT: https://arxiv.org/abs/1908.10084
- Documentacion de Sentence-Transformers: https://www.sbert.net
- Modelos preentrenados recomendados por SBERT: https://www.sbert.net/docs/pretrained_models.html
