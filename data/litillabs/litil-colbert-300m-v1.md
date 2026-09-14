# litillabs/litil-colbert-300m-v1

## Resumen

Litil ColBERT 300M v1 es un modelo de recuperación (retrieval) de información jurídica multilingüe desarrollado por Litil Labs. Se trata de un ajuste fino de parámetros completos sobre lightonai/mLateOn, un modelo de la familia ColBERT basado en el backbone mmBERT-base, que emplea interacción tardía (late interaction) con vectores por token de 128 dimensiones y puntuación MaxSim. Con 306.941.184 parámetros, la ventana de entrada es asimétrica: 1.024 tokens para consultas y 8.192 tokens para documentos, con prefijos obligatorios `[Q] ` y `[D] `.

El modelo está especializado en recuperación jurídica en alemán, chino e inglés: jurisprudencia, textos legales, contratos y respuesta a preguntas legales. Su relevancia radica en que aplica el paradigma multi-vector (ColBERT) a un dominio donde la recuperación léxica tradicional falla por la variabilidad terminológica y donde los modelos densos de un solo vector suelen perder precisión en pasajes largos.

Frente a su modelo base, mejora de forma notable en recuperación de casos y estatutos en chino (NanoLeCaRDv2 pasa de 62,1 a 73,1 nDCG@10 y NanoAILAStatutes de 19,8 a 26,9), mientras que en tareas en alemán e inglés el rendimiento es prácticamente equivalente al del base. Se distribuye bajo licencia Apache-2.0 y se ejecuta con la librería PyLate.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (backbone mmBERT-base) con cabecera ColBERT de interaccion tardia; scoring MaxSim sobre vectores por token |
| Parametros totales | 306.941.184 (307 M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 1.024 tokens para consulta y 8.192 tokens para documento (asimetrica) |
| Tipos de cuantizacion | No se documentan cuantizaciones oficiales; los pesos publicados ocupan 1,3 GB en el repositorio, consistente con FP32. La model card indica evaluar en FP32 para reproducir los resultados |
| Idiomas soportados | Aleman (de), chino (zh) e ingles (en) |
| Licencia | Apache-2.0 (heredada de lightonai/mLateOn) |
| Formato de pesos | safetensors |
| Dimension de los vectores | 128 dimensiones por token |
| Libreria de inferencia | PyLate |
| Pipeline | sentence-similarity |
| Modelo base | lightonai/mLateOn (revision 35391e36392085d72a93d232f6122607a234ad7a), ajuste fino de parametros completos |
| Prefijos requeridos | `[Q] ` para consultas, `[D] ` para documentos; sin expansion de consulta |
| Fecha de publicacion | 13 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ColBERT de interaccion tardia: en lugar de comprimir consulta y documento en un unico vector, genera una matriz de embeddings por token (128 dimensiones en este caso) y calcula la similitud mediante MaxSim, sumando para cada token de la consulta el maximo producto escalar contra los tokens del documento. El backbone es mmBERT-base, un encoder transformer del que se heredan los 307 M de parametros. Esta aproximacion conserva granularidad a nivel de termino, lo que resulta util en dominios con terminologia densa y formulaciones heterogeneas como el juridico, a costa de un indice mas pesado (un vector por token en lugar de un vector por documento).

El entrenamiento consistio en un ajuste fino de parametros completos sobre mLateOn, usando los splits de entrenamiento de conjuntos publicos de recuperacion juridica: LeCaRDv2 (casos en chino), STARD (estatutos en chino), ContractNLI (evidencia contractual), GerDaLIR (casos en aleman), GerLayQA (QA legal en aleman) y CaseHOLD. Para mitigar el olvido catastrofico en recuperacion general se incorporaron MIRACL y mMARCO como datos de retencion. La model card especifica que las consultas y documentos de test de los benchmarks se excluyeron del entrenamiento. No se documentan en la informacion disponible detalles sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO, algo esperable en un modelo de representacion y no generativo.

## Capacidades

- Recuperacion de pasajes y documentos mediante similitud semantica con puntuacion MaxSim (interaccion tardia multi-vector).
- Busqueda de jurisprudencia y casos judiciales en chino y aleman (LeCaRDv2, GerDaLIR).
- Recuperacion de estatutos y normativa (STARD, AILA Statutes).
- Recuperacion de evidencia contractual: localizacion de clausulas y fragmentos relevantes en contratos (ContractNLI).
- Respuesta a preguntas legales sobre un corpus documental (GerLayQA).
- Funcionamiento trilingue aleman-chino-ingles dentro del mismo espacio de representacion.
- Indexacion de corpus completos mediante indices PLAID en PyLate.
- Reranking de resultados de un recuperador previo mediante `rank.rerank` de PyLate.
- No dispone de generacion de texto, tool calling, capacidades de agente, vision ni audio: es exclusivamente un modelo de representacion para recuperacion y ranking.

## Casos de uso

- RAG juridico en produccion: el modelo actua como recuperador en un pipeline de generacion aumentada, indexando un corpus de sentencias y normativa y devolviendo los pasajes mas relevantes con MaxSim; su ventana de 8.192 tokens por documento permite indexar resoluciones completas sin trocearlas en exceso.
- Busqueda de jurisprudencia para despachos: un abogado plantea la consulta en lenguaje natural (hasta 1.024 tokens, suficiente para incluir hechos y fundamentos) y el modelo recupera sentencias comparables en aleman o chino.
- Revision de contratos y due diligence: dado un contrato de 8.192 tokens, se recuperan las clausulas que responden a una pregunta concreta (por ejemplo, plazos de preaviso en un arrendamiento) usando el par consulta-documento adecuado.
- Atencion al cliente en el sector legal: motor de recuperacion que localiza la clausula o el articulo aplicable a la consulta de un usuario antes de que un LLM redacte la respuesta.
- Cumplimiento normativo y seguimiento regulatorio: indexacion de un corpus de estatutos en chino y consulta periodica para detectar que articulos cubren un supuesto de negocio determinado.
- eDiscovery y gestion documental: filtrado y ranking de grandes volumenes de documentos legales para priorizar la revision humana, aprovechando que el scoring MaxSim se puede aplicar a nivel de fragmento.
- Asistencia a la investigacion comparada: al compartir espacio de representacion para de, zh y en, permite recuperar documentos relevantes en los tres idiomas desde una misma consulta.
- Reranking de un recuperador BM25 o denso: el modelo se puede usar como segunda etapa sobre los 50-100 candidatos iniciales para mejorar el orden final, un patron habitual en PyLate con `rank.rerank`.

## Benchmarks y rendimiento

Evaluacion en HAKARI-Bench NanoLaw, MaxSim exacto sobre corpus completo, nDCG@10 multiplicado por 100, en FP32. Los datos proceden de la model card del autor.

| Tarea | mLateOn (base) | Litil ColBERT 300M v1 | Diferencia |
|---|---:|---:|---:|
| NanoLeCaRDv2 (recuperacion de casos en chino) | 62,1 | 73,1 | +11,0 |
| NanoGerDaLIRSmall (recuperacion de casos en aleman) | 54,5 | 54,9 | +0,4 |
| NanoLegalBenchConsumerContractsQA | 88,6 | 87,8 | -0,8 |
| NanoLegalQuAD (QA legal en aleman) | 85,0 | 84,2 | -0,8 |
| NanoAILACasedocs | 26,9 | 33,0 | +6,1 |
| NanoAILAStatutes | 19,8 | 26,9 | +7,1 |
| NanoLegalBenchCorporateLobbying | 94,7 | 93,0 | -1,7 |
| NanoLegalSummarization | 68,0 | 67,2 | -0,8 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales, algo coherente con la naturaleza de recuperacion del modelo.

## Requisitos de hardware

- Peso de los parametros: 306.941.184 parametros equivalen a unos 1,23 GB en FP32, unos 0,61 GB en FP16/BF16 y unos 0,31 GB en INT8 (calculos derivados del numero de parametros, no publicados por el autor).
- VRAM para inferencia del modelo: cabe holgadamente en cualquier GPU consumer con 4 GB o mas (RTX 3050, RTX 3060, RTX 4060, RTX 4090). La model card recomienda FP32 para reproducir los resultados, lo que eleva el requisito a unos 2-3 GB contando activaciones y overhead.
- Memoria del indice: al ser un modelo multi-vector, el coste dominante es el almacenamiento de vectores por token (128 dimensiones por token). En FP16 son 256 bytes por token; un documento de 1.000 tokens ocupa unos 256 KB de vectores. El tamaño total depende del corpus y no esta documentado por el autor.
- GPU recomendadas para indexacion a gran escala: A100, H100 o L40S si se generan embeddings de millones de documentos; el cuello de botella es el throughput de codificacion, no la VRAM.
- Opciones de despliegue: PyLate es la libreria oficial y la unica documentada, con soporte de indices PLAID para busqueda a escala. No se documenta soporte de vLLM, llama.cpp, Ollama, TGI ni formato GGUF.
- Latencia y throughput: no disponible. La model card no publica cifras de latencia ni de documentos por segundo.

## Comparativa con modelos similares

Los datos de los modelos de referencia (jina-colbert-v2 y BGE-M3) proceden de su documentacion publica y no se han verificado en esta ficha; deben confirmarse antes de tomar decisiones. No hay resultados de benchmarks compartidos entre ellos y este modelo en la informacion disponible.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Arquitectura |
|---|---|---|---|---|---|
| litil-colbert-300m-v1 | 307 M | 1.024 (consulta) / 8.192 (documento) | Aleman, chino, ingles | Apache-2.0 | ColBERT sobre mmBERT-base |
| lightonai/mLateOn | No disponible | No disponible | Multilingue | No disponible en esta ficha | ColBERT (modelo base del ajuste) |
| jina-colbert-v2 | ~560 M | 8.192 tokens | Multilingue | CC-BY-NC-4.0 (uso no comercial) | ColBERT con backbone transformer |
| BGE-M3 | ~568 M | 8.192 tokens | Multilingue (mas de 100 idiomas) | MIT | Hibrido denso + disperso + multi-vector |

En cuanto a rendimiento comparado, la model card solo ofrece la comparacion contra mLateOn recogida en la seccion anterior. No hay datos que permitan situar este modelo frente a alternativas de recuperacion multilingue de proposito general.

## Limitaciones y advertencias

- Idiomas limitados: solo aleman, chino e ingles. Consultas en castellano u otros idiomas no estan soportadas por el entrenamiento y degradaran el rendimiento.
- Especializacion de dominio: el ajuste esta orientado a material juridico. Aunque se usaron MIRACL y mMARCO como datos de retencion, el rendimiento en recuperacion general puede haberse degradado respecto al modelo base.
- Dependencia del prefijo: la omission de los prefijos `[Q] ` y `[D] ` altera las representaciones y probablemente degrada los resultados; hay que respetarlos en produccion.
- Sin expansion de consulta: el modelo no aplica expansion de consulta, por lo que la calidad depende de como se formule la busqueda y de que quepa en 1.024 tokens.
- Coste de indice: la interaccion tardia obliga a almacenar un vector de 128 dimensiones por token, con un coste de almacenamiento y de scoring proporcional al producto de tokens de consulta y documento, muy superior al de un recuperador de vector unico.
- Modelo no generativo: no produce texto, por lo que no puede alucinar contenido, pero tampoco puede responder preguntas sin un LLM adicional en el pipeline.
- Precisión numerica: reproducir las cifras publicadas exige evaluar en FP32; en precision reducida los valores pueden variar.
- Sin datos de sesgo: no se documenta ningun analisis de sesgo ni de equidad en la recuperacion entre jurisdicciones o idiomas.
- Madurez temprana: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion independiente por terceros.
- Licencia permisiva: Apache-2.0 permite uso comercial y modificacion, pero conviene verificar la cadena de licencias del modelo base y de los datasets de entrenamiento (algunos corpus juridicos pueden tener restricciones propias).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litillabs/litil-colbert-300m-v1
- Modelo base: https://huggingface.co/lightonai/mLateOn
- Paper de mLateOn: https://arxiv.org/abs/2607.27178
- Libreria PyLate: https://github.com/lightonai/pylate
