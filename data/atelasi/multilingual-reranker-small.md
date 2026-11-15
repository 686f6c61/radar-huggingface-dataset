# atelasi/multilingual-reranker-small

## Resumen

El Multilingual Reranker (small) es un modelo cross-encoder de reranking desarrollado por el usuario atelasi y publicado bajo el espacio de Horizon-Labs, disenado para reordenar resultados de busqueda y pipelines de RAG en mas de 40 idiomas. Se construye sobre la arquitectura ModernBERT de mmBERT-small (jhu-clsp/mmBERT-small) y cuenta con 140.641.921 parametros totales, lo que lo situa en la categoria de modelos pequenos y eficientes para despliegue en CPU.

El modelo resuelve el problema de la precision en la recuperacion de informacion: dado un par (consulta, pasaje), emite un unico logit de relevancia que, tras aplicar sigmoid, se convierte en una puntuacion entre 0 y 1. Esto permite reordenar los primeros 20-100 candidatos devueltos por una busqueda vectorial o por palabras clave antes de pasarlos a un LLM generador, mejorando la calidad del contexto final.

Su relevancia actual radica en que es una destilacion de Qwen3-Reranker-4B en un modelo aproximadamente 28 veces mas pequeno, con licencia Apache-2.0 y entrenado sobre texto web con licencia abierta. Incluye ficheros ONNX para CPU y navegador (transformers.js), lo que facilita su integracion en aplicaciones cliente y en entornos sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base mmBERT-small) |
| Parametros totales | 140.641.921 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 384 tokens por par en entrenamiento; truncado a 512 en el ejemplo de uso |
| Tipos de cuantizacion | int8 (ONNX quantized, 268 MB); fp32 |
| Idiomas soportados | 40+ idiomas: en, de, fr, es, pt, it, nl, pl, ru, uk, cs, sk, ro, bg, hr, sr, sl, sv, da, no, fi, et, lv, lt, hu, el, tr, ar, he, fa, ur, hi, mr, bn, ta, te, zh, ja, ko, vi, th, id, ms, tl, sw, yo, ca |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (incluye model_quantized.onnx int8) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en ModernBERT, concretamente en la variante multilingue mmBERT-small de JHU CLSP. Procesa conjuntamente la consulta y el pasaje como un par de secuencias y produce un unico logit de clasificacion por par; la funcion sigmoid sobre ese logit genera una puntuacion de relevancia en el rango 0-1. La longitud maxima de entrenamiento es de 384 tokens por par, y los pasajes mas largos deben dividirse en fragmentos.

El entrenamiento combina destilacion desde Qwen3-Reranker-4B (un modelo aproximadamente 28 veces mayor) con datos de HuggingFaceFW/fineweb-2, HuggingFaceFW/fineweb, Horizon-Labs/multilingual-rerank-distill, miracl/miracl y PaDaS-Lab/webfaq. Segun la model card, desde la version v1.1 los datos de entrenamiento incluyen el split de entrenamiento de MIRACL, por lo que la columna MIRACL de la evaluacion es in-domain. El resto de benchmarks se usaron unicamente para evaluacion. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Reranking de pares (consulta, pasaje) mediante cross-encoder, con una puntuacion de relevancia por par.
- Busqueda multilingue y cross-lingue: la consulta y el pasaje pueden estar en idiomas distintos.
- Integracion con sentence-transformers mediante `CrossEncoder.rank()`.
- Integracion con Transformers (`AutoModelForSequenceClassification`) y con transformers.js para ejecucion en navegador.
- Compatibilidad verificada con frameworks RAG: LangChain 1.4, llama-index-core 0.14 y haystack-ai 3.3 (a traves de `CrossEncoder` de sentence-transformers).
- Inferencia en CPU gracias a los ficheros ONNX incluidos, incluida una variante int8 de 268 MB.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso por si mismo; su funcion es puntuar y reordenar.

## Casos de uso

- RAG sobre documentacion tecnica multilingue: se recuperan los 50-100 candidatos con un retriever vectorial y se reordenan con el modelo antes de construir el prompt del LLM, reduciendo el ruido en el contexto y el coste por tokens.
- Busqueda empresarial cross-lingue: un empleado consulta en espanol y el sistema recupera pasajes en ingles o aleman; el cross-encoder puntua la relevancia semantica independientemente del idioma de cada lado.
- Atencion al cliente con base de conocimiento: reordenar articulos de ayuda recuperados por BM25 o embeddings para seleccionar los 3-5 mas relevantes antes de que un modelo generativo redacte la respuesta.
- Busqueda en navegador o aplicaciones cliente: la variante ONNX int8 (268 MB) permite ejecutar el reranker en el navegador con transformers.js sin enviar la consulta a un servidor.
- Filtrado de candidatos en pipelines de CI/CD de documentacion: reordenar resultados de busqueda interna sobre changelogs y guias para alimentar asistentes de codigo.
- Sistemas de FAQ y soporte interno: reordenar pares pregunta-respuesta recuperados de una base de datos para seleccionar la respuesta mas pertinente antes de la generacion.
- Evaluacion y depuracion de retrievers: usar las puntuaciones del cross-encoder como referencia para medir la calidad de un retriever vectorial o lexico en distintos idiomas.

## Benchmarks y rendimiento

Resultados de nDCG@10 publicados en la model card. MIRACL: 60 consultas por idioma con 100 candidatos cada una; Wikipedia (WikipediaRerankingMultilingual): 60 consultas por idioma con 9 candidatos; "Other" agrupa ESCI (es, jp, us), RuBQ, T2Reranking, mMARCO-ja y AskUbuntu.

| Modelo | Licencia | MIRACL (18 idiomas) | Wikipedia (16 idiomas) | Otros (6 sets) | Media | Nota |
|---|---|---|---|---|---|---|
| Este modelo (141M) | Apache-2.0 | 0.779 | 0.969 | 0.793 | 0.847 | multilingue |
| Horizon-Labs/multilingual-reranker-base (308M) | Apache-2.0 | 0.800 | 0.967 | 0.798 | 0.855 | multilingue |
| cross-encoder/ms-marco-MiniLM-L6-v2 (22M) | Apache-2.0 | 0.322 | 0.842 | 0.648 | 0.604 | ingles |
| BAAI/bge-reranker-base (278M) | MIT | 0.683 | 0.858 | 0.735 | 0.758 | chino/ingles |

La model card indica ademas que la variante ONNX int8 presenta diferencias medias de 0.001 (escala sigmoid) respecto a fp32 sobre 1240 pares de benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,6 GB para los pesos (141M parametros); en la practica, menos de 1 GB incluyendo activaciones con lotes pequenos.
- VRAM estimada en int8 ONNX: aproximadamente 0,27 GB (268 MB de fichero).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es mas que suficiente; tambien funciona en CPU sin problemas por su tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 2 GB o mas de VRAM, e incluso en CPU.
- Opciones de despliegue: sentence-transformers (`CrossEncoder`), Transformers, transformers.js (navegador), ONNX Runtime; compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints compatibles.
- Latencia y throughput: no se han publicado mediciones concretas en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Media nDCG@10 |
|---|---|---|---|---|---|
| atelasi/multilingual-reranker-small | 141M | 384 tokens por par (entrenamiento) | 40+ | Apache-2.0 | 0.847 |
| Horizon-Labs/multilingual-reranker-base | 308M | no disponible | multilingue | Apache-2.0 | 0.855 |
| BAAI/bge-reranker-base | 278M | no disponible | chino/ingles | MIT | 0.758 |
| cross-encoder/ms-marco-MiniLM-L6-v2 | 22M | no disponible | ingles | Apache-2.0 | 0.604 |

La comparativa se limita a los datos publicados en la model card; no se dispone de informacion adicional sobre la longitud de contexto de los modelos alternativos.

## Limitaciones y advertencias

- No es un modelo generativo: solo puntua pares (consulta, pasaje); no puede usarse para generar texto ni para tareas de razonamiento directo.
- Longitud maxima de 384 tokens por par en entrenamiento: los pasajes mas largos se truncan, por lo que es necesario dividir documentos extensos en fragmentos.
- Riesgo de sesgo heredado de los datos web de fineweb y fineweb-2, con la cobertura desigual que ello implica entre idiomas.
- La columna MIRACL de la evaluacion es in-domain (el split de entrenamiento de MIRACL forma parte de los datos desde v1.1), por lo que las cifras en ese benchmark pueden ser optimistas respecto a dominios no vistos.
- El modelo se publico bajo el espacio atelasi pero la model card referencia el repositorio Horizon-Labs/multilingual-reranker-small; conviene verificar la ruta canonica antes de integrarlo en produccion.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda revisar las condiciones de los datasets de entrenamiento subyacentes.
- No se han publicado datos de latencia ni throughput, por lo que el rendimiento en produccion debe medirse en el entorno objetivo.

## Enlaces

- [Hugging Face: atelasi/multilingual-reranker-small](https://huggingface.co/atelasi/multilingual-reranker-small)
- [Modelo base: jhu-clsp/mmBERT-small](https://huggingface.co/jhu-clsp/mmBERT-small)
- [Version mayor: Horizon-Labs/multilingual-reranker-base](https://huggingface.co/Horizon-Labs/multilingual-reranker-base)
- [Modelo destilado de origen: Qwen/Qwen3-Reranker-4B](https://huggingface.co/Qwen/Qwen3-Reranker-4B)
- [Demo en navegador](https://huggingface.co/spaces/Horizon-Labs/multilingual-reranker)
- [Dataset HuggingFaceFW/fineweb-2](https://huggingface.co/datasets/HuggingFaceFW/fineweb-2)
- [Dataset HuggingFaceFW/fineweb](https://huggingface.co/datasets/HuggingFaceFW/fineweb)
- [Dataset Horizon-Labs/multilingual-rerank-distill](https://huggingface.co/datasets/Horizon-Labs/multilingual-rerank-distill)
- [Dataset miracl/miracl](https://huggingface.co/datasets/miracl/miracl)
- [Dataset PaDaS-Lab/webfaq](https://huggingface.co/datasets/PaDaS-Lab/webfaq)
