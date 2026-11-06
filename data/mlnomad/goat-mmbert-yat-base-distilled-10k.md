# mlnomad/goat-mmbert-yat-base-distilled-10k

## Resumen

GOAT mmBERT YAT Distilled 10K es un codificador de texto y codigo multilingue desarrollado por el usuario mlnomad, disenado para generar embeddings de frases de 768 dimensiones orientados a recuperacion de informacion (retrieval), similitud semantica y busqueda de codigo. Se trata del checkpoint final tras 10.000 actualizaciones de destilacion a partir del modelo GOAT mmBERT YAT Base Contrastive 10K, usando como profesor los embeddings de EmbeddingGemma 2. La mezcla de entrenamiento contiene 563.962 ejemplos procedentes de MS MARCO, bitexto multilingue, busqueda de codigo y retrieval multilingue.

El modelo parte de una base mmBERT (arquitectura transformer tipo BERT, ~281,8 millones de parametros) preentrenada con enmascaramiento de lenguaje (MLM) sobre 10.038.104.948 tokens no padding, y posteriormente afinada de forma contrastiva. La destilacion anade un paso de compresion del conocimiento del profesor en el espacio de embeddings del alumno, manteniendo el tamano compacto del modelo base.

Su relevancia actual reside en que ofrece un codificador multilingue de tamano medio con licencia MIT, apto para despliegue en infraestructura modesta, y con evaluacion publica verificada sobre MTEB ingles (41 tareas), MTEB multilingue (131 tareas), CoIR (10 tareas) y MIRACL de negativos duros (18 idiomas). No obstante, los resultados muestran que el modelo anterior de la familia (Previous YAT) supera a este checkpoint en los cuatro agregados publicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (mmBERT) con cabeza de embeddings; entrenado con MLM y afinado contrastivo |
| Parametros totales | 281.833.984 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (longitud maxima usada en evaluacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Multilingue (no se detalla la lista completa); evaluado en MIRACL con 18 idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors, flax (libreria Flax) |

## Arquitectura y entrenamiento

El modelo es un codificador transformer de tipo BERT (familia mmBERT) con 281.833.984 parametros, que produce embeddings de 768 dimensiones. El preentrenamiento de la base se realizo con masked language modeling sobre un corpus de 10.038.104.948 tokens no padding (checkpoint 379079). Sobre esa base se aplico un afinado contrastivo (modelo padre: goat-mmbert-yat-base-contrastive-10k) y posteriormente un proceso de destilacion de 10.000 actualizaciones usando EmbeddingGemma 2 como profesor.

La mezcla de destilacion contiene 563.962 ejemplos de MS MARCO, bitexto multilingue, busqueda de codigo y retrieval multilingue. La evaluacion se realizo con MTEB 2.21.8, longitud maxima 512, batch de inferencia 16, truncamiento por la derecha, mean pooling sobre estados no padding (incluyendo tokens especiales), normalizacion L2 en FP32 y sin prompts. El checkpoint seleccionado por validacion (dev) fue el paso 0, tensor-identico al padre contrastivo; el checkpoint final destilado supero al padre en los cuatro agregados publicos.

## Capacidades

- Generacion de embeddings de frases de 768 dimensiones para similitud semantica y recuperacion.
- Recuperacion de informacion (retrieval) densa en ingles y multilingue.
- Busqueda de codigo (evaluado en CoIR, 10 tareas).
- Similitud textual (STS) y reranking de candidatos.
- Clasificacion de textos y clustering semantico.
- Bitext mining (alineamiento de frases entre idiomas).
- Soporte multilingue evaluado en 18 idiomas en la vista MIRACL.
- No soporta tool calling, agentes, vision ni audio: es un encoder de embeddings, no un modelo generativo.

## Casos de uso

- Busqueda semantica en bases documentales: indexar documentos como embeddings de 768 dimensiones y recuperar por similitud coseno; el modelo esta afinado especificamente para retrieval (aunque su rendimiento en retrieval ingles es modesto, 25,01 en MTEB).
- Busqueda de codigo en repositorios: gracias al entrenamiento con datos de code search y la evaluacion en CoIR (36,65), puede indexar fragmentos de codigo y consultas en lenguaje natural.
- Deduplicacion y clustering de documentos: agrupar noticias, tickets o papers por similitud semantica usando las tareas de clustering evaluadas (39,83 en ingles).
- Reranking de resultados de busqueda: reordenar candidatos recuperados por un motor lexico usando puntuaciones de similitud del encoder (42,09 en reranking ingles).
- Clasificacion de textos por similitud con prototipos: asignar intenciones o categorias comparando el embedding del texto con embeddings de referencia (63,17 en clasificacion inglesa).
- Alineamiento de corpus multilingues (bitext mining): emparejar frases equivalentes entre idiomas para construir memorias de traduccion o datasets paralelos (37,03 en bitext mining multilingue).
- Sistemas de recomendacion basados en contenido: calcular similitud entre descripciones de productos o articulos y perfiles de usuario.

## Benchmarks y rendimiento

Resultados publicados por el autor (escala 0-100). Columnas: Distilled 10K (este modelo), padre contrastivo / mejor por dev, base MLM GOAT y Previous YAT.

| Benchmark | Distilled 10K | Padre contrastivo | GOAT MLM base | Previous YAT |
|---|---:|---:|---:|---:|
| MTEB ingles (41 tareas) | 47,30 | 45,93 | 36,84 | 52,78 |
| MTEB multilingue (131 tareas) | 38,54 | 37,67 | 28,07 | 42,40 |
| CoIR (10 tareas) | 36,65 | 34,25 | 9,91 | 43,45 |
| MIRACL negativos duros (18 idiomas) | 28,22 | 24,51 | 1,82 | 46,37 |

Desglose por categoria en MTEB ingles: clasificacion 63,17; clustering 39,83; retrieval 25,01; reranking 42,09; STS 64,24; pair classification 73,01; summarization 23,74. En MTEB multilingue: retrieval 33,44; clasificacion 48,22; clustering 39,16; reranking 48,58; pair classification 72,31; bitext mining 37,03; multilabel classification 16,23; instruction reranking -2,26; STS 54,16.

La evaluacion verifico 204 trabajos en 182 tareas, incluyendo los seis splits de WebLINX, con ocho workers de TPU y pesos sin cambios al finalizar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en FP32 (281,8 M de parametros); menos de 1 GB en FP16/BF16. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son mas que suficientes. El modelo se entreno en TPU, pero la inferencia es ligera.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas e incluso en CPU para cargas moderadas.
- Opciones de despliegue: al estar en formato Flax y safetensors, puede cargarse con la libreria Flax o convertirse a PyTorch; para servir embeddings se puede usar sentence-transformers (previa conversion), FastAPI con batching, o TEI (Text Embeddings Inference). vLLM y llama.cpp no estan orientados a encoders de este tipo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MTEB ingles | MTEB multilingue | Licencia |
|---|---:|---:|---:|---:|---|
| GOAT mmBERT YAT Distilled 10K (este) | 281,8 M | 512 | 47,30 | 38,54 | MIT |
| GOAT mmBERT YAT Base Contrastive 10K | no disponible (misma base) | 512 | 45,93 | 37,67 | MIT (segun modelo padre) |
| Previous YAT (yat-mmbert-base-embedding-v1) | no disponible | no disponible | 52,78 | 42,40 | no disponible |
| GOAT MLM base (goat-mmbert-yat-base-mlm-10b) | 281,8 M (con cabeza MLM) | no disponible | 36,84 | 28,07 | no disponible |

El modelo supera a su padre contrastivo y a la base MLM en todos los agregados, pero queda por debajo del modelo anterior de la familia (Previous YAT) en los cuatro benchmarks publicos, especialmente en retrieval (25,01 frente a 42,96 en MTEB ingles) y en MIRACL (28,22 frente a 46,37).

## Limitaciones y advertencias

- Rendimiento de retrieval limitado: 25,01 en retrieval ingles y 10,65 en FiQA2018, muy por debajo de modelos especializados; no es adecuado como unico motor de busqueda en produccion sin evaluacion previa.
- Inferior al modelo anterior de la familia (Previous YAT) en todos los agregados publicos, lo que cuestiona su eleccion frente a ese checkpoint.
- Instruction reranking con puntuacion negativa (-2,26), lo que sugiere mal comportamiento con instrucciones explicitas.
- Longitud de contexto limitada a 512 tokens; documentos largos requieren troceado.
- Idiomas soportados no documentados de forma exhaustiva; la evaluacion cubre 18 idiomas en MIRACL, pero no hay lista oficial.
- Riesgo de sesgos y alucinacion de similitud: al ser un encoder, puede producir vecinos semanticos espurios en dominios poco representados (por ejemplo, retrieval cientifico con SCIDOCS en 7,83).
- Licencia MIT permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validacion de la comunidad.
- No dispone de cuantizaciones publicadas ni de formatos GGUF/ONNX listos para usar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlnomad/goat-mmbert-yat-base-distilled-10k
- Modelo padre contrastivo: https://huggingface.co/mlnomad/goat-mmbert-yat-base-contrastive-10k
- Base MLM GOAT: https://huggingface.co/mlnomad/goat-mmbert-yat-base-mlm-10b
- Modelo anterior de la familia (Previous YAT): https://huggingface.co/mlnomad/yat-mmbert-base-embedding-v1
- Resultados completos por categoria, tarea e idioma: RESULTS.md (referenciado en la model card del repositorio)
- Resultados legibles por maquina: benchmark-scores.json (referenciado en la model card del repositorio)
