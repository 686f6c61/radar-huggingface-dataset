# dleemiller/finecat-nli-v2-xxs

## Resumen

FineCat-NLI v2 Extra-Extra Small (xxs) es un modelo de inferencia de lenguaje natural (NLI) en formato cross-encoder, desarrollado por el usuario dleemiller y publicado en Hugging Face. Parte del modelo base jhu-clsp/ettin-encoder-17m, un encoder basado en arquitectura ModernBERT de tan solo 17 millones de parametros, y esta afinado con destilacion de conocimiento sobre los datasets FineCat-NLI y FineCat-NLI-Reason.

El modelo resuelve un problema muy concreto: clasificar si una premisa (texto) implica, contradice o es neutral respecto a una hipotesis, devolviendo probabilidades calibradas. Esta capacidad lo convierte en un bloque constructivo versatil para tareas como clasificacion zero-shot, enrutado de intenciones, verificacion de grounding en sistemas RAG, deteccion de alucinaciones y moderacion de contenidos.

Su relevancia radica en el equilibrio entre tamano y rendimiento: con 16,9 millones de parametros, contexto de hasta 8.000 tokens y un throughput declarado de unos 30.600 pares por segundo, puede desplegarse en hardware muy modesto (incluso CPU) manteniendo una accuracy macro de 0,6931 en un benchmark de 45 datasets. Licencia Apache-2.0, pesos en safetensors y solo en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en ModernBERT (ettin-encoder-17m) |
| Parametros totales | 16.864.003 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | Hasta 8.000 tokens |
| Tipos de cuantizacion | No disponible (pesos nativos en fp32/fp16 via safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (tamano del repo: 0,1 GB) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder: premisa e hipotesis se concatenan y pasan conjuntamente por un encoder transformer (ModernBERT, mediante la familia ettin de jhu-clsp), que produce una representacion conjunta usada para clasificar en tres clases (entailment, contradiction, neutral). Al procesar ambos textos juntos, captura interacciones finas entre premisa e hipotesis que los modelos bi-encoder no detectan, a cambio de no generar embeddings reutilizables.

El entrenamiento se baso en destilacion de conocimiento (knowledge distillation) sobre los datasets FineCat-NLI y FineCat-NLI-Reason, creados por el propio autor. La model card no detalla el numero de tokens de entrenamiento ni la composicion exacta del corpus, pero los benchmarks cubren datasets NLI estandar (MNLI, SNLI, ANLI, WANLI, LingNLI), lo que sugiere un entrenamiento multi-dataset orientado a probabilidades calibradas. No se menciona el uso de RLHF ni DPO (no aplicable a un encoder clasificador).

## Capacidades

- Clasificacion NLI de tres clases: dadas una premisa y una hipotesis, devuelve probabilidades calibradas de entailment, contradiction y neutral.
- Clasificacion zero-shot: etiquetado de textos con etiquetas arbitrarias formuladas como hipotesis ("This review is positive"), con accuracy de 84,6% declarada en 18 tareas.
- Enrutado y triage de intenciones: clasificacion de peticiones de usuario contra etiquetas de intencion (95,0% en MASSIVE intents segun la model card).
- Verificacion de grounding en RAG: evaluacion de si un pasaje recuperado soporta una respuesta generada (0,69 F1 en RAGTruth).
- Moderacion y guardrails: contraste de mensajes contra enunciados de politica (88,3% en CrossingGuard, 86,7% en Wikipedia insults).
- Extraccion clinica: verificacion de atributos en notas clinicas (97,0% en SDOH-NLI).
- Manejo de documentos largos: contexto de hasta 8.000 tokens por par.
- Alto throughput: unos 30.600 pares por segundo declarados.

No soporta generacion de texto, razonamiento generativo, codigo, ni capacidades multimodales (vision, audio). No es un modelo conversacional ni agéntico.

## Casos de uso

- Verificacion de groundedness en pipelines RAG: tras la generacion, cada frase o respuesta se contrasta contra los pasajes recuperados; si la probabilidad de entailment es baja, se marca como potencial alucinacion. Es adecuado por su throughput alto y su F1 de 0,69 en RAGTruth a coste minimo.
- Clasificacion zero-shot de tickets y documentos: se formulan las categorias como hipotesis y se elige la de mayor P(entailment), sin necesidad de entrenar un clasificador por dominio. Con 30.600 pares/s, permite procesar grandes volumenes en tiempo casi real.
- Enrutado de intenciones en chatbots: la peticion del usuario se clasifica contra un conjunto de intenciones (por ejemplo, "The user wants to set an alarm"), con 95% de accuracy declarado en MASSIVE, ideal como capa de dispatch barata antes de invocar un LLM.
- Moderacion de contenidos y guardrails: los mensajes se contrastan contra enunciados de politica ("This message contains harassment"), aprovechando los 88,3% en CrossingGuard para filtrado previo a bajo coste.
- Extraccion de determinantes sociales de la salud (SDOH): verificacion de atributos clinicos en notas medicas ("The patient is unemployed"), con 97% declarado en SDOH-NLI, util en procesamiento de historiales.
- Etiquetado semantico y tagging a escala: clasificacion de resenas, comentarios o articulos con etiquetas dinamicas definidas en tiempo de ejecucion, sin reentrenamiento.
- Filtrado de candidatos en reranking ligero: como cross-encoder, puede reordenar resultados de busqueda evaluando pares consulta-documento, aunque su tamano lo orienta mas a volúmenes altos que a maxima precision.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (accuracy salvo indicacion):

| Dataset | Metrica | Valor |
|---|---|---|
| FineCat-NLI (test) | Accuracy | 0,7305 |
| MultiNLI (validation matched) | Accuracy | 0,7679 |
| MultiNLI (validation mismatched) | Accuracy | 0,772 |
| SNLI (test) | Accuracy | 0,8619 |
| ANLI round 1 (test) | Accuracy | 0,496 |
| ANLI round 2 (test) | Accuracy | 0,436 |
| ANLI round 3 (test) | Accuracy | 0,4117 |
| WANLI (test) | Accuracy | 0,6544 |
| LingNLI (validation) | Accuracy | 0,6752 |
| Benchmark 45 datasets NLI/zero-shot/grounding | Macro accuracy | 0,6931 |

La model card referencia ademas el OpenNLI leaderboard (v0.2.0), donde el "Skill Index" se calcula como Brier skill de las probabilidades del modelo frente a una respuesta uniforme; los valores concretos del leaderboard para este modelo no estan incluidos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 16,9 millones de parametros en pesos nativos, el modelo ocupa aproximadamente 65-70 MB; cualquier GPU con 1 GB de VRAM libre es mas que suficiente, y funciona perfectamente en CPU.
- GPU recomendadas: no requiere GPU dedicada; es ejecutable en CPU de escritorio o portatil. Si se usa GPU, cualquier GPU moderna (incluso integradas o una GTX 1650) sobra.
- Consumer GPU: cabe con holgura en cualquier GPU consumer; el cuello de botella sera la CPU/RAM, no la VRAM.
- Opciones de despliegue: libreria sentence-transformers (clase CrossEncoder), integrable en Python con PyTorch. No se menciona soporte especifico para vLLM, llama.cpp, Ollama o TGI; al ser un encoder safetensors, lo natural es usar sentence-transformers o transformers directamente.
- Latencia y throughput: ~30.600 pares/s declarados por el autor (presumiblemente en GPU), lo que permite uso en produccion de alto volumen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| finecat-nli-v2-xxs | 16,9 M | 8.000 tokens | Apache-2.0 | Macro accuracy 0,6931 (45 datasets), ~30.600 pares/s |
| jhu-clsp/ettin-encoder-17m (base) | 17 M | 8.192 tokens | Apache-2.0 | Encoder base sin afinado NLI especifico |
| MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli | ~184 M | 512 tokens | MIT (base DeBERTa) | Mayor precision NLI tipica, pero ~10x mas grande y contexto corto |
| facebook/bart-large-mnli | ~407 M | 1.024 tokens | MIT | Clasificador zero-shot clasico, mucho mas pesado y lento |

Comparativas cuantitativas exactas en los mismos benchmarks no estan incluidas en la informacion disponible; el autor mantiene un OpenNLI leaderboard para comparaciones homogeneas.

## Limitaciones y advertencias

- Solo ingles: no es util para castellano ni otros idiomas sin afinado adicional.
- Rendimiento debil en ANLI: la accuracy cae a 0,496/0,436/0,4117 en las rondas 1-3 de ANLI, un benchmark adversario; hay que ser prudente con entradas adversariales o complejas.
- Riesgo de alucinacion: no aplica como modelo generativo, pero sus probabilidades pueden estar mal calibradas fuera de distribucion; conviene recalibrar (temperatura) en el dominio de destino, como hace el propio leaderboard.
- Sin generacion ni razonamiento: no sustituye a un LLM para tareas de generacion, codigo o agentes.
- Licencia: Apache-2.0, sin restricciones para uso comercial; los datasets de entrenamiento derivados (FineCat-NLI) deben revisarse por separado si se reentrena.
- Dato de descargas muy bajo (57) y modelo reciente: poca validacion comunitaria; los benchmarks son declarados por el autor y no verificados.
- Contexto de 8.000 tokens por par: suficiente para documentos largos, pero pares muy extensos aumentan el coste computacional por par.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dleemiller/finecat-nli-v2-xxs
- Demo en vivo (Space): https://huggingface.co/spaces/dleemiller/finecat-nli
- OpenNLI leaderboard: https://huggingface.co/spaces/dleemiller/open-nli-leaderboard
- Script de evaluacion del leaderboard: https://huggingface.co/datasets/dleemiller/OpenNLI-Leaderboard/blob/main/evaluate.py
- Dataset de entrenamiento: https://huggingface.co/datasets/dleemiller/FineCat-NLI
- Dataset de entrenamiento (reason): https://huggingface.co/datasets/dleemiller/FineCat-NLI-Reason
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-17m
