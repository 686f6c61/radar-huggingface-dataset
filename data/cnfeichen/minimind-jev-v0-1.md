# cnfeichen/minimind-jev-v0.1

## Resumen

minimind-jev v0.1 es el primer checkpoint público de un proyecto educativo que entrena desde cero una cabeza de decisión ("decision head") para reordenar pasajes en pipelines de RAG en chino. No es un modelo generativo ni un transformer completo: es un MLP de tres capas que recibe el embedding de un codificador congelado (BAAI/bge-small-zh-v1.5) y devuelve P(pasaje responde a la consulta). El codificador no se distribuye con el release; el loader lo descarga del Hub. Lo publica el usuario cnfeichen (repo cnfeichen/minimind-jev-v0.1) bajo licencia MIT, con pipeline declarado `text-ranking` e idioma único `zh`.

El interés del artefacto es metodológico más que de rendimiento bruto: demuestra que una superficie de decisión entrenada en unos tres minutos en una RTX 4060 de 8 GB, sin coste de API y con 15.660 pares de entrenamiento, supera a BM25 de forma estadísticamente significativa (nDCG@5 +0,075, IC bootstrap [+0,002, +0,154]) y queda a +0,059 de nDCG@5 del sistema alojado Jev score-zh v1.13, diferencia que con n=100 no es separable (IC [−0,040, +0,157]). Es, en palabras del autor, un artefacto educativo, no un reranker de producción.

El momento es relevante porque acompaña a un protocolo de evaluación reproducible con DOI (10.5281/zenodo.23322277) y a una biblioteca de prompts congelada, lo que permite replicar el experimento y auditar la comparación. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, señal de que es un release reciente y de nicho.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP de 3 capas (512 → 256 → 256 → 1, GELU) sobre embedding congelado de BAAI/bge-small-zh-v1.5; sigmoide con escalado de temperatura |
| Parámetros totales | ~660K en el head según el autor (el codificador congelado no se incluye en el release; sus parámetros no se detallan en la información disponible) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; limitada por la ventana del codificador bge-small-zh-v1.5 sobre la concatenación `query + pregunta + pasaje` |
| Tipos de cuantización | No disponible (checkpoint PyTorch en coma flotante; no se documentan variantes GGUF, INT8 ni ONNX) |
| Idiomas soportados | Chino (`zh`) únicamente |
| Licencia | MIT (pesos del head); codificador BAAI/bge-small-zh-v1.5, MIT, cargado por separado; datos de entrenamiento C-MTEB/T2Reranking (derivados de DuReader) bajo sus propios términos |
| Formato de pesos | Checkpoint PyTorch `head.pt` con claves `state`, `dim` y `temp` (state_dict); el codificador se descarga aparte vía `sentence-transformers` |
| Tarea (`pipeline_tag`) | `text-ranking` |
| Librería | PyTorch (+ `sentence-transformers` para el codificador) |
| Dimensión de entrada | 512 (dimensión del embedding de bge-small-zh-v1.5) |
| Temperatura ajustada | T = 1,031 (temperature scaling sobre validación) |
| Tamaño del repo | 0,0 GB (según HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es un clasificador binario de relevancia sobre representaciones densas: el texto se compone como `f"{query}\n{pregunta}\n{pasaje}"`, se codifica con bge-small-zh-v1.5 con `normalize_embeddings=True`, y el vector resultante atraviesa un MLP `Linear(512,256) → GELU → Linear(256,256) → GELU → Linear(256,1)`. La salida se pasa por sigmoide tras dividir por la temperatura ajustada. La pregunta utilizada está congelada desde la biblioteca de patrones awesome-jev-prompts: "仅凭该段落能回答该查询吗？" ("¿puede este pasaje responder a la consulta por sí solo?"). Todo el codificador permanece congelado: no hay fine-tuning del encoder, solo de la cabeza.

El entrenamiento usa negativos duros de T2Reranking (C-MTEB / derivado de DuReader): 15.660 pares de entrenamiento y 1.730 de validación, con las consultas de evaluación del benchmark excluidas explícitamente del conjunto de entrenamiento (sin fuga). Objetivo BCE sobre el head, AdamW, 5 épocas, semilla 42, learning rate 1e-3; se ajusta temperature scaling sobre validación (T = 1,031). El tiempo de pared es de aproximadamente 3 minutos en una RTX 4060 de 8 GB, incluyendo la codificación de 17.390 textos. No se documenta RLHF, DPO ni ninguna otra fase de alineamiento.

Nota técnica: el autor declara ~660K parámetros, pero la aritmética de la arquitectura publicada (512→256→256→1) da 197.377 parámetros. La discrepancia no se explica en la model card; conviene verificarla antes de citar la cifra.

## Capacidades

- Puntuación de relevancia binaria: dado `(query, pasaje)`, devuelve un escalar en (0,1) que estima P(el pasaje responde a la consulta).
- Reordenación (reranking) de listas de candidatos recuperados previamente por un retriever léxico o denso.
- Separación relativa de pasajes relevantes e irrelevantes para ordenar (AUC de separación 0,630).
- Funcionamiento en CPU o GPU de gama baja, con un coste de entrenamiento de minutos y de inferencia dominado por el codificador.
- Replicabilidad completa del pipeline de entrenamiento y evaluación (semilla, hiperparámetros, protocolo y DOI publicados).
- No soporta generación de texto, razonamiento multi-paso, tool calling / function calling, agentes, visión, audio ni modo "thinking": es una cabeza de clasificación, no un modelo de lenguaje.
- Sin capacidades multilingües: el codificador y los datos son de chino.

## Casos de uso

- **Segunda etapa de un RAG en chino**: tras recuperar 50-100 candidatos con BM25 o un retriever denso, puntuar cada par con el head y recortar a los 5 mejores antes de pasarlos al generador; el modelo está entrenado exactamente para esa decisión y reduce el consumo de contexto.
- **Filtrado de evidencia antes de la generación**: usar el score como criterio de criba (no como probabilidad calibrada) para descartar pasajes que no responden a la consulta y evitar que el generador alucine sobre contexto irrelevante.
- **Prototipado y docencia**: material para un curso o taller en el que los alumnos entrenan su propia superficie de decisión en tres minutos en un portátil con RTX 4060, sin claves de API ni presupuesto de cómputo.
- **Docencia sobre calibración**: el ajuste de temperatura (T = 1,031) y el análisis de que las probabilidades quedan cerca del prior de clase sirven como caso práctico de por qué un score de ranking no equivale a una probabilidad calibrada.
- **Baseline reproducible para evaluar retrievers**: con el protocolo y los logs publicados (DOI 10.5281/zenodo.23322277), sirve como referencia barata frente a la que medir mejoras de un retriever propio sobre consultas chinas con negativos duros.
- **Búsqueda interna sobre documentación en chino**: indexación de manuales, bases de conocimiento o corpus tipo DuReader con reordenación final; el dominio de entrenamiento (T2Reranking, derivado de DuReader) es afín a pasajes de lectura comprensiva y QA documental.
- **Selección de evidencia en QA extractivo**: ordenar los pasajes candidatos y quedarse con el de mayor score como fragmento de respuesta, dado que la tarea es de relevancia binaria y no de generación.

## Benchmarks y rendimiento

Protocolo de jev-rag-zh-benchmark (muestra s1: 100 consultas, pools con negativos duros, IC bootstrap al 95% sobre consultas; DOI 10.5281/zenodo.23322277):

| Sistema | nDCG@5 | nDCG@10 | MRR@10 | R@1 |
|---|---|---|---|---|
| Jev score-zh alojado (v1.13) | 0,546 | 0,602 | 0,477 | 0,26 |
| Jev noul-zh alojado (v1.13) | 0,531 | 0,588 | 0,458 | 0,24 |
| **minimind-jev v0.1 (este)** | **0,488** | 0,576 | 0,445 | 0,23 |
| BM25 (jieba + rank_bm25) | 0,413 | 0,513 | 0,363 | 0,11 |

Comparaciones pareadas (bootstrap, n=1000):

| Comparación | Métrica | Diferencia | IC 95% | Lectura |
|---|---|---|---|---|
| minimind-jev − BM25 | nDCG@5 | +0,075 | [+0,002, +0,154] | El IC excluye 0: mejora significativa |
| Jev alojado − minimind-jev | nDCG@5 | +0,059 | [−0,040, +0,157] | El IC incluye 0: no separable con n=100 |

Métrica adicional declarada por el autor: AUC de separación 0,630 frente a 0,714 del Jev alojado.

## Requisitos de hardware

- VRAM para inferencia: inferior a 1 GB; el grueso del consumo lo determina el codificador bge-small-zh-v1.5 (modelo pequeño, tipo "small"), no el head de ~660K parámetros.
- Entrenamiento verificado por el autor: RTX 4060 de 8 GB, ~3 minutos de tiempo de pared incluyendo la codificación de 17.390 textos.
- Cabe en cualquier GPU consumer (GTX 16xx, RTX 20xx/30xx/40xx) e incluso en CPU para volúmenes moderados; no requiere A100 ni H100.
- Despliegue: PyTorch + `sentence-transformers` como vía documentada. No hay soporte ni instrucciones publicadas para vLLM, TGI, llama.cpp u Ollama, coherente con que no es un modelo generativo. La exportación a ONNX no está documentada.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia por par ni de pares por segundo; solo el tiempo de entrenamiento.

## Comparativa con modelos similares

| Sistema | Tipo | Parámetros | Contexto | nDCG@5 (s1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| minimind-jev v0.1 | Head MLP sobre encoder congelado | ~660K según autor (encoder aparte) | No disponible (limita el encoder) | 0,488 | MIT (head) | Pesos en HF; encoder descargado aparte |
| Jev score-zh v1.13 | Servicio alojado de scoring | No disponible | No disponible | 0,546 | No disponible | Solo vía servicio alojado |
| Jev noul-zh v1.13 | Servicio alojado de scoring | No disponible | No disponible | 0,531 | No disponible | Solo vía servicio alojado |
| BM25 (jieba + rank_bm25) | Recuperación léxica | No aplica | No aplica | 0,413 | Bibliotecas de código abierto | Local, sin entrenamiento |

Frente a un reranker neuronal tipo cross-encoder no se aportan datos en la información disponible; la única comparación cuantitativa publicada es contra los dos servicios Jev y contra BM25.

## Limitaciones y advertencias

- Techo impuesto por el codificador: es "la comprensión de bge-small-zh más una superficie de decisión entrenada", no un modelo desde cero; el entrenamiento desde cero corresponde al previsto v0.3.
- Solo relevancia binaria; no distingue grados de relevancia ni responde preguntas.
- Las probabilidades quedan cerca del prior de clase (T = 1,031 apenas las desplaza): usar los scores para ordenar, nunca como probabilidades absolutas calibradas ni con umbrales fijos.
- AUC de separación 0,630 frente a 0,714 del Jev alojado: menor poder discriminativo que la referencia.
- Artefacto educativo declarado por el autor; no es un reranker de producción.
- Idioma único: chino. No hay evidencia de comportamiento en castellano ni en otros idiomas.
- El codificador no está incluido en el release: el repositorio por sí solo no es autosuficiente y el loader depende de que BAAI/bge-small-zh-v1.5 siga disponible en el Hub.
- Los datos de entrenamiento son C-MTEB/T2Reranking (derivados de DuReader) y quedan sujetos a sus propios términos, independientemente de la licencia MIT de los pesos.
- Riesgo de sesgo heredado: al congelar el encoder, cualquier sesgo de bge-small-zh-v1.5 y del corpus DuReader se propaga al score sin mitigación documentada.
- Discrepancia no resuelta entre los ~660K parámetros declarados y los 197.377 que arroja la arquitectura publicada.
- Ecosistema mínimo: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validación comunitaria; el tutorial completo (transformer diminuto desde cero, v0.2 multi-tarea destilado) está en construcción privada.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/cnfeichen/minimind-jev-v0.1
- Codificador congelado: https://huggingface.co/BAAI/bge-small-zh-v1.5
- Protocolo de evaluación y logs: https://github.com/vicfei/jev-rag-zh-benchmark
- DOI del benchmark: https://doi.org/10.5281/zenodo.23322277
- Biblioteca de prompts: https://github.com/vicfei/awesome-jev-prompts
- Artículo sobre System One y Jev: https://typesafe.ai/blog/introducing-system-one-models-and-jev
