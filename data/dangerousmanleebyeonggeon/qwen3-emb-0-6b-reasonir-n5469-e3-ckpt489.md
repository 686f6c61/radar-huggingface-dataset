# dangerousmanleebyeonggeon/qwen3-emb-0.6b-reasonir-n5469-e3-ckpt489

## Resumen

El modelo `dangerousmanleebyeonggeon/qwen3-emb-0.6b-reasonir-n5469-e3-ckpt489` es un checkpoint de embeddings de frases obtenido mediante fine-tuning completo de `Qwen/Qwen3-Embedding-0.6B`, un transformer denso de aproximadamente 596 millones de parámetros. Ha sido publicado por el usuario `dangerousmanleebyeonggeon` como parte de un experimento de ablacion sobre datos de entrenamiento (training-data ablation), cuyo objetivo es aislar el efecto del conjunto de datos utilizado en el rendimiento final del modelo.

El checkpoint corresponde al paso 489 de 489 (ultimo paso del entrenamiento) con una perdida de evaluacion de 0,1838. Se entreno con `ms-swift` mediante la tarea de embedding y la funcion de perdida InfoNCE, sobre un subconjunto de 5.469 pares muestreados de `reasonir/reasonir-data` (1.558 pares de la particion hq y 3.911 de vl). El modelo se distribuye en formato safetensors y es compatible con la libreria `sentence-transformers`, con pipeline declarado de similitud entre frases.

Su relevancia es fundamentalmente metodologica: no es un modelo de produccion pulido, sino un artefacto de investigacion pensado para comparar recetas de entrenamiento y conjuntos de datos. Cuenta con 0 descargas y 0 likes en el momento de redactar esta ficha, y no declara licencia ni idiomas soportados de forma explicita, aunque los datos de entrenamiento originales estan bajo licencia cc-by-nc-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredado de Qwen3-Embedding-0.6B), usado como modelo de embeddings |
| Parametros totales | 595.776.512 (aproximadamente 0,6B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible; el repositorio solo incluye pesos safetensors en bf16/fp32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (los datos de entrenamiento se declaran bajo cc-by-nc-4.0) |
| Formato de pesos | safetensors |
| Dimension de embedding | no disponible |
| Tamano del repositorio | 1,2 GB |
| Libreria | sentence-transformers |
| Pipeline | sentence-similarity |
| Modelo base | Qwen/Qwen3-Embedding-0.6B |
| Checkpoint | Paso 489 de 489 (perdida de evaluacion 0,1838) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-Embedding-0.6B`, un transformer denso de tipo decoder-only adaptado a la generacion de representaciones vectoriales de texto. Sobre esa base se realizo un fine-tuning completo (no LoRA ni adaptadores), lo que implica que los 595.776.512 parametros fueron actualizados durante el entrenamiento. La receta utilizada es `swift sft --task_type embedding --loss_type infonce`, con una tasa de aprendizaje de 6e-6 con decaimiento coseno, 3 epocas, DeepSpeed ZeRO-3 y precision bf16.

El conjunto de datos de entrenamiento consta de 5.469 filas obtenidas de `reasonir/reasonir-data`, combinando las particiones hq y vl, muestreadas con semilla 42 (1.558 de hq y 3.911 de vl). Cada fila contiene un positivo y un negativo duro sintetico; los positivos de la particion hq se rellenaron a partir de documentos de `xlangai/BRIGHT`, por lo que existe solapamiento con el corpus BRIGHT. El entrenamiento se ejecuto en 8 GPUs con un tamano de micro-lote de 1 y acumulacion de gradiente de 4, lo que resulta en 32 consultas por paso. Se emplearon negativos in-batch (all-gathered) entre las 8 consultas de cada micro-lote, con temperatura 0,1, y se reservo un 5 % de los datos para evaluacion.

Como innovacion tecnica destacable, el modelo define un prompt de consulta (`'Query:'`) para las consultas, mientras que los documentos se codifican sin prompt. Este checkpoint forma parte de una ablacion cuyo proposito es comparar el tamano del conjunto de datos (5.469 pares frente a los 6.000 de `canho/ours-6k`) manteniendo constante el resto de la receta.

## Capacidades

- Generacion de embeddings de frases y documentos para tareas de similitud semantica, recuperacion y ranking.
- Busqueda densa (dense retrieval) sobre corpus documentales mediante similitud coseno entre vectores.
- Formulacion de consultas con prompt dedicado (`prompt_name="query"`) y codificacion de documentos sin prompt.
- Aprendizaje sensible a negativos duros (hard negatives) gracias al objetivo InfoNCE con temperatura 0,1.
- Integracion directa con `sentence-transformers` para pipelines de codificacion por lotes.
- Compatibilidad declarada con Text Embeddings Inference (TEI) y endpoints compatibles.
- Capacidades multilingues: no disponible en la informacion proporcionada, aunque el modelo base es de la familia Qwen3.
- Soporte de tool calling, agentes o razonamiento multi-paso: no aplica; es un modelo de embeddings, no generativo.

## Casos de uso

- Busqueda semantica interna en documentacion corporativa: el modelo codifica consultas y fragmentos de documentos en un mismo espacio vectorial, permitiendo recuperar pasajes relevantes mediante similitud coseno, siempre que se aplique el prompt `'Query:'` a las consultas y no a los documentos.
- Sistemas de recomendacion basados en contenido: los embeddings permiten calcular similitud entre items textuales (descripciones, articulos, titulos) para sugerir elementos afines sin depender de senales de interaccion.
- Deduplicacion y agrupamiento de textos: agrupar noticias, tickets o registros duplicados calculando distancias entre embeddings y aplicando umbrales de similitud.
- Evaluacion de recetas de entrenamiento en investigacion: al ser un checkpoint de ablacion sobre datos, sirve para comparar de forma controlada el efecto del conjunto de datos frente a otras variantes del mismo experimento.
- Recuperacion aumentada para pipelines RAG: como primer recuperador denso antes de un modelo generativo, aprovechando su bajo coste de inferencia (596 M de parametros).
- Moderacion y clasificacion por similitud: comparar el embedding de un texto entrante con embeddings de referencia de categorias o plantillas conocidas para asignar etiquetas.
- Filtrado semantico en pipelines de datos: descartar o priorizar documentos segun su proximidad a un conjunto de ejemplos de interes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato cuantitativo reportado es la perdida de evaluacion del entrenamiento (0,1838 en el paso 489), que no constituye un benchmark comparable con metricas estandar como MTEB, BEIR, MMLU o HumanEval. No se dispone de resultados en tareas de recuperacion, clasificacion ni similitud sobre conjuntos publicos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 1,2 GB solo para pesos, con un consumo real tipico de 2 a 3 GB contando activaciones y overhead del framework.
- VRAM estimada en int8: alrededor de 0,6 GB para pesos; en int4, alrededor de 0,3 GB, aunque no se documentan cuantizaciones oficiales para este checkpoint.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en bf16; se recomienda RTX 3060, RTX 4090, A10, L4, A100 o H100 para lotes grandes.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en CPU para lotes pequenos.
- Opciones de despliegue: `sentence-transformers` (referencia principal), Text Embeddings Inference (TEI, declarado como compatible), y servidores de inferencia con soporte de embeddings (por ejemplo vLLM). No se confirma compatibilidad con llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput estimados: no disponibles. Al tratarse de un modelo de 0,6B, el coste por embedding es bajo en GPU moderna, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen3-emb-0.6b-reasonir-n5469-e3-ckpt489 | 595.776.512 | no disponible | no disponible | HuggingFace (0 descargas) | Checkpoint de ablacion sobre 5.469 pares de reasonir |
| Qwen/Qwen3-Embedding-0.6B (base) | aproximadamente 0,6B | no disponible en la informacion | no disponible en la informacion | HuggingFace (modelo base oficial) | Punto de partida del fine-tuning; referencia directa de comparacion |
| Otros modelos de embeddings comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de rendimiento para establecer una comparacion fiable |

No se dispone de mediciones de rendimiento comparativas con otras familias de embeddings (por ejemplo E5, BGE o GTE) en la informacion proporcionada, por lo que cualquier comparacion cuantitativa resultaria especulativa.

## Limitaciones y advertencias

- Modelo de investigacion sin validacion en produccion: 0 descargas y 0 likes, sin evaluacion publica en benchmarks.
- Licencia no declarada de forma explicita para el modelo final; los datos de entrenamiento se indican bajo cc-by-nc-4.0, lo que puede restringir el uso comercial del checkpoint derivado.
- Sesgos conocidos: no disponibles, aunque al entrenarse sobre `reasonir/reasonir-data` puede heredar los sesgos de ese corpus.
- Riesgo de alucinacion: no aplica directamente (no es un modelo generativo), pero si riesgo de recuperaciones irrelevantes en tareas de busqueda si se usa fuera del dominio de entrenamiento.
- Solapamiento con el corpus BRIGHT: los positivos de la particion hq se rellenaron con documentos de BRIGHT, lo que puede inflar resultados si se evalua sobre ese mismo corpus.
- Limitaciones de contexto e idioma: no documentadas; el tamano de contexto efectivo depende de la configuracion heredada del modelo base.
- El prompt de consulta (`'Query:'`) es obligatorio aplicarlo a las consultas y no a los documentos para reproducir el comportamiento esperado.
- Conjunto de entrenamiento pequeno (5.469 pares) y 3 epocas, lo que limita la generalizacion fuera de dominios cercanos a reasonir.
- Fecha de publicacion registrada como 2026-10-09, inusualmente futura; conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dangerousmanleebyeonggeon/qwen3-emb-0.6b-reasonir-n5469-e3-ckpt489
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/reasonir/reasonir-data
- Corpus BRIGHT: https://huggingface.co/datasets/xlangai/BRIGHT
- Libreria ms-swift: https://github.com/modelscope/ms-swift
- Libreria sentence-transformers: https://www.sbert.net
- Text Embeddings Inference (TEI): https://github.com/huggingface/text-embeddings-inference
