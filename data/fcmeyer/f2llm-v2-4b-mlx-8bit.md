# fcmeyer/F2LLM-v2-4B-mlx-8bit

## Resumen

F2LLM-v2-4B-mlx-8bit es una conversión al formato nativo MLX del modelo de embeddings multilingüe F2LLM-v2-4B, desarrollado originalmente por el equipo CodeFuse de Alibaba. Esta versión concreta, publicada por el usuario fcmeyer, cuantiza todos los pesos lineales y la tabla de embeddings a 8 bits con cuantización afín de grupo 64, reduciendo el tamaño en disco de 7,5 GB a 4,0 GB. El objetivo es permitir la ejecución nativa en Apple Silicon mediante la librería mlx-embeddings, sin necesidad de pasar por PyTorch.

El modelo base pertenece a la familia F2LLM-v2, una serie de ocho modelos de embeddings que van de 80M a 14B de parámetros, entrenados sobre 60 millones de muestras públicas de alta calidad y con soporte para más de 200 idiomas, con especial atención a lenguas de media y baja representación. La arquitectura se basa en el tronco de Qwen3, produce embeddings de 2560 dimensiones y utiliza pooling sobre el último token con normalización L2. Esta conversión hereda la licencia Apache 2.0 del modelo original.

La relevancia de esta ficha radica en que ofrece una alternativa cuantizada y eficiente para desplegar embeddings multilingües de alta calidad en hardware de Apple, un ecosistema donde tradicionalmente ha habido menos soporte para este tipo de modelos. La conversión mantiene una fidelidad alta respecto al original: la prueba de humo incluida en la model card reporta una similitud coseno mínima de 0,99954 frente a la referencia PyTorch en bfloat16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3, embeddings de 2560 dimensiones, last-token pooling con normalizacion L2 |
| Parametros totales | 1.131.460.096 (segun safetensors del repo cuantizado; el modelo base se anuncia como 4B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (max_length usado en el ejemplo de la model card) |
| Tipos de cuantizacion | 8-bit affine, group size 64 (todas las capas lineales y tabla de embeddings); tambien existen variantes bf16 y 6-bit del mismo autor |
| Idiomas soportados | Mas de 200, incluyendo en, zh, ru, es, fr, de, ar, nl, vi, hi, ko, ja, it, id, pt, pl, tr, da, th, sv, fa, uk, cs, no, el, ca, ro, fi, bg, tl, gl, my, hy, km, ne, hu, eu, he, lo, sw, az, lv, si, sk, tg, et, lt, ms, hr, is, sl, sr, ur, bn, af, ta, ka, te, ml, mn, nn, kk, cy, mr, sq, nb, mk, jv, kn, eo, la, gu, uz, am, oc, be, mg, vo, pa, lb, ht, br, ga, xh, tt, bs, yo |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors en formato MLX) |

## Arquitectura y entrenamiento

El modelo original F2LLM-v2-4B es un transformer denso basado en el tronco de Qwen3, con una capa de embeddings de 2560 dimensiones y pooling sobre el último token seguido de normalizacion L2. Segun el paper de F2LLM-v2, la familia se entrena en dos etapas: primero un ajuste fino sobre 60 millones de pares consulta-documento de alta calidad, y posteriormente una etapa adicional con datos de clasificacion y clustering. Todo el dataset se compone exclusivamente de datos open source, sin datos sinteticos.

La conversion a MLX que nos ocupa no modifica la arquitectura, solo el formato de pesos. Se cuantizan todas las capas lineales y la tabla de embeddings a 8 bits con cuantizacion afín de MLX (group size 64), mientras que los pesos de RMSNorm y las escalas/bias de cuantizacion permanecen en bfloat16. Esta cuantizacion reduce el tamaño de 7,5 GB (version bf16) a 4,0 GB. La model card incluye una prueba de humo sobre un fixture de 5 strings que muestra una similitud coseno minima de 0,99954 frente a la referencia PyTorch en bfloat16, con un cambio maximo de 0,0020 en las similitudes consulta-documento y preservacion del ranking.

## Capacidades

- Generacion de embeddings de texto densos para tareas de recuperacion de informacion, busqueda semantica, clasificacion y clustering.
- Soporte multilingue extenso: mas de 200 idiomas, con enfasis en lenguas de media y baja representacion como swahili, azeri, letón, etc.
- Compatible con instrucciones personalizadas mediante el formato `Instruct: ... Query: ...` para tareas asimetricas (retrieval, reranking).
- Para tareas simetricas (STS, clustering, bitext mining) funciona con o sin prompts en ambos lados.
- Integracion con el ecosistema mlx-embeddings, sentence-transformers y text-embeddings-inference.
- Normalizacion L2 de los embeddings, lista para calcular similitud coseno mediante producto escalar.

## Casos de uso

- Busqueda semantica multilingue: el modelo puede indexar documentos en decenas de idiomas y recuperar los mas relevantes para una consulta en otro idioma, gracias a sus embeddings de 2560 dimensiones y su entrenamiento multilingue.
- Sistemas RAG (Retrieval-Augmented Generation): como componente de recuperacion en pipelines de generacion aumentada, donde los documentos se indexan con el modelo y las consultas se codifican con el prompt de instruccion.
- Clasificacion de tickets de soporte: los embeddings permiten agrupar y clasificar incidencias de usuarios en multiples idiomas sin necesidad de entrenar clasificadores especificos por idioma.
- Minería de bitextos: alineacion de frases o parrafos entre idiomas para construir corpus paralelos o verificar traducciones, aprovechando la capacidad de emparejar textos en distintas lenguas.
- Deduplicacion y clustering de documentos: agrupar articulos, noticias o documentos legales por similitud semantica, incluso cuando estan escritos en idiomas diferentes.
- Reranking de resultados: el modelo puede puntuar pares consulta-documento para reordenar resultados de un buscador basado en BM25 o similar, mejorando la precision final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversion incluye unicamente una prueba de humo sobre un fixture de 5 strings (una consulta en ingles y cuatro documentos en ingles, chino y ruso) que compara la version cuantizada contra una referencia PyTorch en bfloat16. Los resultados de esa prueba son:

| Build | Tamano | Similitud coseno min vs PyTorch | Delta max en similitud consulta-documento | Ranking preservado |
|---|---|---|---|---|
| F2LLM-v2-4B-mlx-bf16 | 7,5 GB | 0,99984 | 0,0017 | si |
| F2LLM-v2-4B-mlx-8bit (este repo) | 4,0 GB | 0,99954 | 0,0020 | si |
| F2LLM-v2-4B-mlx-6bit | 3,1 GB | 0,99696 | 0,0078 | si |

Esta tabla no constituye una evaluacion estandar (no hay MTEB ni retrieval benchmarks). El propio autor advierte que si la perdida por cuantizacion es critica para la tarea, se debe medir sobre datos propios.

## Requisitos de hardware

- Dispositivo Apple Silicon (M1 o superior) con macOS, ya que el formato MLX esta disenado para la GPU unificada de estos chips.
- Espacio en disco: 4,0 GB para el modelo en 8-bit (la variante bf16 ocupa 7,5 GB y la de 6-bit 3,1 GB).
- Memoria unificada: suficiente para cargar el modelo en memoria; con 8 GB de RAM unificada deberia ser viable, aunque se recomienda 16 GB para trabajar con lotes grandes o contextos largos.
- Despliegue: se usa la libreria `mlx-embeddings` (pip install mlx-embeddings), que ofrece una API similar a sentence-transformers. Tambien es compatible con text-embeddings-inference y endpoints compatibles segun las etiquetas de HuggingFace.
- No requiere GPU NVIDIA ni CUDA; para usar el modelo en hardware NVIDIA habria que recurrir al modelo original en PyTorch.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension embedding | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| F2LLM-v2-4B (original) | 4B (anunciado) | 2560 | 8192 | 200+ | Apache 2.0 | PyTorch / safetensors |
| F2LLM-v2-4B-mlx-8bit (este repo) | 1.13B (segun safetensors) | 2560 | 8192 | 200+ | Apache 2.0 | MLX 8-bit |
| BGE-M3 (BAAI) | 568M | 1024 | 8192 | 100+ | MIT | PyTorch / ONNX |
| E5-mistral-7b-instruct | 7B | 4096 | 32768 | 100+ | MIT | PyTorch |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada. La comparativa se limita a caracteristicas tecnicas. F2LLM-v2-4B y su version MLX destacan por su soporte de idiomas mas amplio y su licencia permisiva, mientras que E5-mistral-7b ofrece un contexto mayor pero un tamaño mucho mayor.

## Limitaciones y advertencias

- Es una conversion cuantizada: aunque la prueba de humo muestra una fidelidad alta (similitud coseno minima de 0,99954), no se han realizado evaluaciones MTEB o de retrieval sobre la version 8-bit. La perdida de precision puede ser relevante para tareas sensibles.
- El numero de parametros declarado en safetensors (1.131.460.096) difiere del anuncio oficial de 4B del modelo base; es posible que el modelo base real tenga menos parametros de los anunciados, o que la cuantizacion afecte al conteo. Se recomienda verificar con el modelo original.
- El contexto maximo se ha fijado en 8192 tokens segun el ejemplo de uso, pero la documentacion del modelo base no especifica un limite oficial; usar contextos mayores puede degradar el rendimiento.
- Requiere Apple Silicon: no se puede ejecutar directamente en GPUs NVIDIA o AMD. Para otros entornos hay que usar el modelo original en PyTorch.
- El autor de la conversion advierte que la prueba de humo no es un benchmark y que la perdida por cuantizacion debe medirse en los datos propios de cada aplicacion.
- Aunque el modelo soporta mas de 200 idiomas, el rendimiento en lenguas de muy baja representacion puede ser inferior al de los idiomas principales.

## Enlaces

- Repositorio HuggingFace de esta conversion: https://huggingface.co/fcmeyer/F2LLM-v2-4B-mlx-8bit
- Modelo base original: https://huggingface.co/codefuse-ai/F2LLM-v2-4B
- Paper de F2LLM-v2: https://arxiv.org/abs/2603.19223
- Repositorio GitHub de CodeFuse-Embeddings: https://github.com/codefuse-ai/CodeFuse-Embeddings/blob/main/F2LLM/README.md
- Libreria mlx-embeddings: https://github.com/Blaizzy/mlx-embeddings
