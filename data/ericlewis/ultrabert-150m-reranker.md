# ericlewis/ultrabert-150m-reranker

## Resumen

UltraBERT-150M Reranker es un modelo cross-encoder de reordenamiento (reranking) de 151 millones de parametros, publicado por el usuario ericlewis en Hugging Face. Se construye mediante la interpolacion lineal de pesos (model merging) de dos checkpoints derivados de dmis-lab/UltraBERT-150M: el checkpoint original seleccionado y un checkpoint intermedio al 40% del entrenamiento. La mezcla final aplica un 75% al modelo original y un 25% al checkpoint parcial, en FP32, sin entrenamiento adicional ni ensemble de inferencia duplicada.

El modelo resuelve la tarea de text-ranking: dado un par consulta-documento, produce una puntuacion de relevancia que permite reordenar los resultados de un sistema de recuperacion (tipicamente BM25 o un retriever denso). Su relevancia radica en que demuestra que una fusion de pesos entre padres con la misma arquitectura y linaje de inicializacion puede mejorar marginalmente el nDCG@10 medio en un suite de 13 tareas NanoBEIR, aunque a costa de degradar la calibracion absoluta de las puntuaciones.

Es un modelo experimental, solo para ingles, con licencia Apache 2.0 y 731 descargas en el momento de la consulta. No debe confundirse con la release anterior del mismo repositorio (basada en codigo custom de Transformers), que fue archivada en la revision `legacy-before-ettin-20261117` y cuyos resultados full-BEIR no son comparables con los que aqui se reportan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en UltraBERT-150M (transformer) |
| Parametros totales | 151.032.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, inferencia en BF16 segun el ejemplo del autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | sentence-transformers (CrossEncoder) |
| Tamano del repo | 2.4 GB |
| Modelo base | dmis-lab/UltraBERT-150M @545ac9d9c7aece444f014ada5a1e9818132b4d35 |
| Relacion con el base | merge (interpolacion de pesos) |
| Pipeline | text-ranking |

## Arquitectura y entrenamiento

El modelo es un cross-encoder: recibe un par (consulta, documento) y produce una puntuacion de relevancia directamente, sin generar representaciones separadas. La arquitectura subyacente es la de dmis-lab/UltraBERT-150M, un transformer de 151 millones de parametros. No se dispone de informacion detallada sobre el numero de capas, dimension oculta, cabezas de atencion ni longitud de contexto maxima en la informacion proporcionada; el autor remite a las model cards de los padres para esos detalles.

El proceso de creacion no implica entrenamiento. Se trata de una fusion por interpolacion de pesos en FP32: 0,75 x pesos del checkpoint original seleccionado + 0,25 x pesos del checkpoint al 40% del entrenamiento. Los buffers no parametrizados identicos se conservan. Ambos padres comparten arquitectura y linaje de inicializacion, lo que hace viable la interpolacion directa. El autor realizo una busqueda sobre la contribucion del checkpoint parcial (0%, 25%, 50%, 75%, 100%) evaluando en un suite fijo de 13 tareas NanoBEIR con batch 24, forward en BF16 y top-100 de BM25 sin inyeccion de positivos, seleccionando el 25% por su nDCG@10 medio. Se trata, por tanto, de ajuste sobre el conjunto de seleccion, no de un test independiente. Tambien se probaron variantes de recuperacion dirigida (cabezas intactas de los padres y mezclas solo de cabeza) sin entrenamiento adicional, que no recuperan completamente las categorias debiles sin compensaciones.

## Capacidades

- Reordenamiento de pares consulta-documento: produce una puntuacion de relevancia por par, ordenable de forma descendente.
- Ranking en ingles: disenado y evaluado exclusivamente sobre corpus en ingles (MS MARCO, NFCorpus, NQ, FiQA2018, Touche2020, SciFact, HotpotQA, ArguAna, FEVER, DBPedia, ClimateFEVER, SCIDOCS, QuoraRetrieval).
- Integracion con sentence-transformers mediante la clase CrossEncoder, con soporte nativo de UltraBERT (sin codigo remoto personalizado).
- Inferencia en BF16 con FlashAttention 2 (kernel de la comunidad fijado a una revision concreta en el ejemplo del autor).
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito segun la informacion disponible.
- Capacidad multilingue: no; solo ingles.

## Casos de uso

- Reordenamiento en pipelines RAG: tras una recuperacion inicial con BM25 o un retriever denso (top-100), el modelo reordena los candidatos por relevancia antes de pasarlos al generador, mejorando la precision del contexto inyectado. Es adecuado por su tamano contenido y su entrenamiento especifico en ranking.
- Busqueda documental interna en ingles: reordenar resultados de un motor de busqueda corporativo sobre articulos, manuales o politicas, usando el cross-encoder como segunda etapa sobre los top-k recuperados.
- Preguntas sobre articulos cientificos: el modelo muestra buen rendimiento en SciFact (78,44 nDCG@10) y NFCorpus (36,36), por lo que puede reordenar pasajes de literatura cientifica en herramientas de revision bibliografica.
- Verificacion de hechos y QA multi-hop: con resultados de 93,87 en HotpotQA y 93,76 en FEVER, es util para reordenar evidencias en sistemas de fact-checking o respuesta a preguntas que requieren combinar varios pasajes.
- Filtrado de duplicados y near-duplicates en ingles: aunque el autor advierte que la MSE en Quora empeora (3,48 frente a 0,82 del padre original), el rendimiento en QuoraRetrieval (96,70 nDCG@10) sigue siendo alto para ranking de pares pregunta-respuesta.
- Prototipado e investigacion sobre model merging: sirve como caso de estudio reproducible de interpolacion de pesos entre checkpoints del mismo linaje, con reporte completo de metricas, hashes de estado tensorial y verificacion de recarga en `merge_report.json`.
- Reordenamiento en dominios especializados en ingles (clima, finanzas, argumentacion): con mejoras frente al original en ClimateFEVER (+1,14), FiQA2018 (+1,70) y Touche2020 (+2,12), puede emplearse como segunda etapa en buscadores de nicho.

## Benchmarks y rendimiento

Resultados nDCG@10 en escala 0-100 sobre 13 tareas NanoBEIR (seleccion, no test independiente):

| Categoria | Original | Padre 40% | Fusionado | Cambio vs original |
|---|---:|---:|---:|---:|
| MSMARCO | 73,24 | 72,31 | 70,79 | -2,45 |
| NFCorpus | 37,06 | 33,00 | 36,36 | -0,70 |
| NQ | 76,91 | 77,19 | 77,84 | +0,93 |
| FiQA2018 | 54,68 | 56,74 | 56,38 | +1,70 |
| Touche2020 | 58,61 | 54,64 | 60,73 | +2,12 |
| SciFact | 77,67 | 74,04 | 78,44 | +0,78 |
| HotpotQA | 93,05 | 93,33 | 93,87 | +0,82 |
| ArguAna | 69,63 | 72,05 | 69,32 | -0,31 |
| FEVER | 92,38 | 93,26 | 93,76 | +1,37 |
| DBPedia | 69,94 | 70,25 | 70,77 | +0,83 |
| ClimateFEVER | 42,57 | 44,56 | 43,71 | +1,14 |
| SCIDOCS | 40,23 | 35,04 | 39,01 | -1,22 |
| QuoraRetrieval | 94,64 | 97,65 | 96,70 | +2,06 |

Media nDCG@10 segun la contribucion del checkpoint parcial:

| Contribucion 40% | Media nDCG@10 | MSE Quora exacto |
|---|---:|---:|
| 0% | 0,677384617 | 0,821492 |
| 25% | 0,682822225 | 3,483629 |
| 50% | 0,682101090 | 3,935570 |
| 75% | 0,677651377 | 1,494638 |
| 100% | 0,672344558 | 0,431949 |

La fusion gana 0,544 puntos en escala 0-100 sobre el mejor padre y mejora 9 de 13 categorias frente al original. La MSE de Quora empeora notablemente respecto al padre original (3,48 frente a 0,82). El autor indica que no se han publicado resultados de benchmarks independientes fuera de NanoBEIR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 151 millones de parametros, en BF16 los pesos ocupan aproximadamente 0,3 GB y en FP32 unos 0,6 GB, a lo que hay que sumar activaciones y overhead del runtime.
- GPU recomendadas: no especificadas por el autor; el ejemplo de uso emplea `device="cuda"` con BF16 y FlashAttention 2.
- Cabe en GPU de consumo: si, por el tamano del modelo (151M parametros), aunque no se detalla en la informacion proporcionada.
- Opciones de despliegue: sentence-transformers con CrossEncoder (ejemplo oficial del autor), con soporte nativo de UltraBERT y `trust_remote_code=False`. No se mencionan vLLM, llama.cpp, Ollama ni TGI; estos ultimos no estan confirmados para esta arquitectura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---:|---|---|---|
| UltraBERT-150M Reranker (este) | 151.032.576 | no disponible | Apache 2.0 | Fusion 75/25 de checkpoints UltraBERT-150M; solo ingles; experimental |
| dmis-lab/UltraBERT-150M (padre) | no disponible | no disponible | no disponible | Modelo base; el autor remite a su model card para datos de entrenamiento y arquitectura |
| Checkpoint 40% (padre parcial) | no disponible | no disponible | no disponible | Retenido en la revision `checkpoint-40pct` del mismo repositorio |

No se dispone de datos de benchmarks de otros rerankers comparables en la informacion proporcionada, por lo que no se puede establecer una comparativa de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo experimental: el autor lo etiqueta explicitamente como experimental y advierte que la seleccion del 25% se hizo sobre el mismo conjunto de evaluacion, por lo que no constituye un test independiente ni un resultado de Decision Index.
- Calibracion de puntuaciones: las salidas son ilimitadas y no son probabilidades calibradas. La MSE en Quora exacto empeora de 0,82 (padre original) a 3,48, por lo que no es adecuado para prediccion de scores calibrados.
- Regresion en categorias concretas: MSMARCO (-2,45), NFCorpus (-0,70), ArguAna (-0,31) y SCIDOCS (-1,22) empeoran frente al modelo original; no retiene el mejor score de cada padre en todas las categorias.
- Solo ingles: no soporta otros idiomas.
- Longitud de contexto no documentada en la informacion disponible; conviene consultar la model card del padre.
- Dependencia de versiones fijadas: el autor exige usar las versiones de `requirements.txt` y el kernel de FlashAttention 2 fijado a una revision concreta; cambios de version pueden alterar el comportamiento.
- Compatibilidad con la release anterior: la version previa del repositorio usaba codigo custom de Transformers y sus resultados full-BEIR no son comparables; los usuarios de ese loader deben fijar la revision `legacy-before-ettin-20261117`.
- Licencia Apache 2.0 permite uso comercial, pero el caracter experimental y las regresiones documentadas desaconsejan su uso en produccion sin validacion propia.
- Riesgo de sesgo y alucinacion: no documentado en la informacion proporcionada; al ser un reranker, no genera texto, pero hereda los sesgos de los datos de entrenamiento del padre.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ericlewis/ultrabert-150m-reranker
- Revision legacy archivada: https://huggingface.co/ericlewis/ultrabert-150m-reranker/tree/legacy-before-ettin-20261117
- Modelo base: https://huggingface.co/dmis-lab/UltraBERT-150M
- Commit del backbone y tokenizer: https://huggingface.co/dmis-lab/UltraBERT-150M/tree/545ac9d9c7aece444f014ada5a1e9818132b4d35
- Kernel FlashAttention 2 fijado: `kernels-community/flash-attn2@291664546de978ab2bb730554252e5e2c1099e4f`
- Informe de fusion (`merge_report.json`): incluido en el repositorio del modelo
