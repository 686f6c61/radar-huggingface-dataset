# AzeerDev/Arabic-Triplet-Matryoshka-V2

## Resumen

Arabic-Triplet-Matryoshka-V2 (ATM2) es un modelo de embeddings de texto en árabe desarrollado por AzeerDev, basado en el framework sentence-transformers y fine-tuning del modelo BERT árabe `aubmindlab/bert-base-arabertv02`. Está diseñado para capturar la riqueza semántica y morfológica del árabe, mapeando frases y párrafos a un espacio vectorial denso de 768 dimensiones. El modelo se describe en el paper "GATE: General Arabic Text Embedding for Enhanced Semantic Textual Similarity with Hybrid Loss Training" (arXiv:2505.24581).

Su relevancia radica en que, según los datos publicados por el autor, alcanza un rendimiento superior a otros modelos de embeddings árabes existentes, con una puntuación media de 74,5 en los benchmarks STS17 y STS22-v2. Está entrenado con una combinación de MatryoshkaLoss y MultipleNegativesRankingLoss sobre un dataset de 1 millón de tripletas árabes, lo que permite generar embeddings jerárquicos a múltiples resoluciones. Con 135 millones de parámetros, es un modelo ligero y eficiente para tareas de búsqueda semántica, similitud textual, clasificación y clustering en árabe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (BERT base) |
| Parametros totales | 135.193.344 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (típico de BERT, 512 tokens, no especificado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT (Transformer encoder) con 135 millones de parámetros, fine-tuning del checkpoint `aubmindlab/bert-base-arabertv02`. La capa de salida produce embeddings de 768 dimensiones. El entrenamiento se realizó con una combinación de dos funciones de pérdida: MatryoshkaLoss, que aprende representaciones anidadas a múltiples resoluciones (permitiendo extraer embeddings de menor dimensión sin perder calidad), y MultipleNegativesRankingLoss, que optimiza la discriminación entre pares semánticamente similares y disímiles.

El dataset utilizado es `akhooli/arabic-triplets-1m-curated-sims-len`, con 1 millón de tripletas (ancla, positivo, negativo) en árabe. Se entrenó durante 3 épocas, alcanzando una pérdida final de 0,718. No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado con tripletas. La innovación principal es la aplicación de MatryoshkaLoss a un modelo BERT árabe, lo que permite flexibilidad en la dimensión del embedding según el caso de uso.

## Capacidades

- Generacion de embeddings densos de 768 dimensiones para frases y parrafos en arabe.
- Similitud semantica textual (STS) entre pares de textos.
- Busqueda semantica y recuperacion de informacion en corpus arabes.
- Paraphrase mining (deteccion de frases semanticamente equivalentes).
- Clasificacion de textos mediante embeddings como caracteristicas.
- Clustering semantico de documentos arabes.
- Soporte para extraccion de embeddings a dimensiones reducidas gracias a MatryoshkaLoss (por ejemplo, 128, 256, 512 dimensiones).
- No soporta tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de representacion de texto.

## Casos de uso

- Busqueda semantica en documentacion arabe: permite indexar y recuperar articulos, informes o paginas web en arabe por similitud de significado, no solo por coincidencia de palabras clave. Adecuado por su alta precision en STS.
- Sistemas de recomendacion de contenido: al representar articulos o noticias en arabe como vectores, se pueden recomendar elementos similares a los que el usuario ya ha leido, usando similitud coseno.
- Deteccion de duplicados y plagio: comparar embeddings de documentos para identificar copias o parafraseos, util en editoriales o plataformas de contenido.
- Clasificacion de textos arabes: usar los embeddings como entrada para clasificadores (regresion logistica, SVM, etc.) en tareas como analisis de sentimiento, categorizacion tematica o deteccion de spam.
- Chatbots con recuperacion aumentada (RAG): integrar el modelo en un pipeline de RAG para buscar fragmentos relevantes en una base de conocimiento arabe y generar respuestas contextualizadas.
- Agrupacion de tickets de soporte: clusterizar consultas de clientes en arabe para identificar temas recurrentes y priorizar respuestas, gracias a la capacidad de clustering semantico.
- Analisis de encuestas y feedback: agrupar respuestas abiertas en arabe por temas comunes para extraer insights sin etiquetado manual.

## Benchmarks y rendimiento

Segun la model card del autor, el modelo obtiene los siguientes resultados en benchmarks de similitud semantica (valores normalizados a 100):

| Modelo | Dim | # Params. | STS17 | STS22-v2 | Promedio |
|---|---|---|---|---|---|
| **Arabic-Triplet-Matryoshka-V2** | 768 | 135M | 85 | 64 | 75 |
| Arabert-all-nli-triplet-Matryoshka | 768 | 135M | 83 | 64 | 74 |
| AraGemma-Embedding-300m | 768 | 303M | 84 | 62 | 73 |
| GATE-AraBert-V1 | 767 | 135M | 83 | 63 | 73 |
| Marbert-all-nli-triplet-Matryoshka | 768 | 163M | 82 | 61 | 72 |
| Arabic-labse-Matryoshka | 768 | 471M | 82 | 61 | 72 |
| AraEuroBert-Small | 768 | 210M | 80 | 61 | 71 |
| E5-all-nli-triplet-Matryoshka | 384 | 278M | 80 | 60 | 70 |
| text-embedding-3-large | 3072 | - | 81 | 59 | 70 |
| Arabic-all-nli-triplet-Matryoshka | 768 | 135M | 82 | 54 | 68 |
| AraEuroBert-Mid | 1151 | 610M | 83 | 53 | 68 |
| paraphrase-multilingual-mpnet-base-v2 | 768 | 135M | 79 | 55 | 67 |
| AraEuroBert-Large | 2304 | 2.1B | 79 | 55 | 67 |
| text-embedding-ada-002 | 1536 | - | 71 | 62 | 66 |
| text-embedding-3-small | 1536 | - | 72 | 57 | 65 |

Estos datos provienen de la model card del autor y no han sido verificados de forma independiente. El modelo supera a las alternativas listadas en el promedio de STS17 y STS22-v2.

## Requisitos de hardware

- VRAM estimada: con 135M de parametros, en FP32 ocupa ~540 MB, en FP16 ~270 MB. Cabe en cualquier GPU con 1-2 GB de VRAM, incluyendo GPUs consumer antiguas (GTX 1060, etc.) y modernas (RTX 3060, RTX 4090).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Para inferencia por lotes grandes, se recomienda una GPU con 8 GB o mas (RTX 3070, A100, etc.).
- Tambien puede ejecutarse en CPU con razonable velocidad para lotes pequenos, gracias a su tamano reducido.
- Opciones de despliegue: sentence-transformers (Python), Hugging Face Inference Endpoints, Text Embeddings Inference (TEI), y compatible con transformers.js para ejecucion en navegador o Node.js.
- Latencia y throughput: no se han publicado datos oficiales. En una GPU moderna, se esperan latencias de pocos milisegundos por lote pequeno; en CPU, decenas de milisegundos por frase.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension | Contexto | STS17 | STS22-v2 | Licencia |
|---|---|---|---|---|---|---|
| **Arabic-Triplet-Matryoshka-V2** | 135M | 768 | no disponible | 85 | 64 | Apache 2.0 |
| Arabert-all-nli-triplet-Matryoshka | 135M | 768 | no disponible | 83 | 64 | Apache 2.0 |
| GATE-AraBert-V1 | 135M | 767 | no disponible | 83 | 63 | Apache 2.0 |
| Marbert-all-nli-triplet-Matryoshka | 163M | 768 | no disponible | 82 | 61 | Apache 2.0 |
| Arabic-labse-Matryoshka | 471M | 768 | no disponible | 82 | 61 | Apache 2.0 |

El modelo ATM2 supera a sus competidores directos en el promedio de benchmarks, con un tamano similar a Arabert-all-nli-triplet-Matryoshka y GATE-AraBert-V1, pero con mejor rendimiento en STS17. Frente a modelos mas grandes como Arabic-labse-Matryoshka (471M), ofrece mejor puntuacion con menos parametros.

## Limitaciones y advertencias

- El modelo puede no rendir de forma optima en textos arabes muy tecnicos o de dominios especificos poco representados en el dataset de entrenamiento.
- El rendimiento puede variar entre dialectos arabes y variaciones regionales; esta optimizado principalmente para arabe moderno estandar (MSA).
- Al ser un modelo de embeddings, no genera texto ni responde preguntas directamente; requiere un pipeline adicional para tareas generativas.
- No se ha especificado la longitud maxima de contexto; se asume la tipica de BERT (512 tokens), lo que limita el procesamiento de documentos largos.
- No se han publicado resultados de cuantizacion ni pruebas de degradacion con precision reducida.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia del dataset de entrenamiento para posibles restricciones de uso.
- Los benchmarks publicados provienen del autor y no han sido replicados de forma independiente.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/AzeerDev/Arabic-Triplet-Matryoshka-V2
- HuggingFace (pagina alternativa del mismo modelo): https://huggingface.co/Omartificial-Intelligence-Space/Arabic-Triplet-Matryoshka-V2
- Paper (arXiv): https://huggingface.co/papers/2505.24581
- Dataset de entrenamiento: https://huggingface.co/datasets/akhooli/arabic-triplets-1m-curated-sims-len
- Modelo base: https://huggingface.co/aubmindlab/bert-base-arabertv02
