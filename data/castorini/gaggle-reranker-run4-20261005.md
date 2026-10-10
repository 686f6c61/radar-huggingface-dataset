# castorini/gaggle-reranker-run4-20261005

## Resumen

gaggle-reranker-run4-20261005 es un reranker de recuperación de información en inglés desarrollado por el grupo Castorini (Jimmy Lin y colaboradores) y publicado dentro del proyecto Project Greenhouse. No es un modelo generativo ni un asistente conversacional: es un cross-encoder punto a punto que asigna una puntuación de relevancia a pares (consulta, pasaje) mediante la diferencia entre los logits de los tokens " true" y " false" en el último token del prompt. Se construye sobre un transformer denso de 34 capas, anchura 2.176, 17 cabezas de dimensión 128 y 2.048 tokens de contexto, con 3.215.335.146 parámetros (3,22B) afinados por completo.

El modelo es uno de los cuatro runs de ajuste fino que se promedian para formar el "soup" castorini/gaggle-reranker-20261005; la model card lo identifica como baseline run 4, concretamente una réplica de tercer clúster del plan del run 1 con gradient caching, que divide un grupo de consultas en trozos manteniendo exacta la pérdida LCE conjunta. Parte de un backbone propio, castorini/gaggle-nanochat-pretrained-climbmix-20260924, preentrenado desde cero sobre ClimbMix, de modo que no depende de ningún peso abierto de terceros.

Su relevancia actual es doble: por un lado, obtiene 0,6383 de nDCG@10 en la media de TREC DL 2019-2023 y 0,5449 en la media de siete colecciones BEIR, muy por encima del BM25 de primera etapa (0,393 y 0,398); por otro, su publicación forma parte de un esfuerzo explícito de reproducibilidad, ya que se liberan los cuatro runs individuales con licencia MIT para que la variabilidad entre semillas y hardware pueda inspeccionarse en lugar de aceptarse sin más.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo nanochat, 34 capas, anchura 2.176, 17 cabezas de dimension 128, atencion causal |
| Parametros totales | 3.215.335.146 (3,22B), ajuste fino completo |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2.048 tokens (backbone); entrenado con truncacion de 128 tokens de consulta y 512 de pasaje |
| Tipos de cuantizacion | No se publican versiones cuantizadas (GGUF, AWQ, GPTQ, bitsandbytes). Los pesos se distribuyen en fp32 y la model card muestra la carga en bfloat16 mediante el argumento `dtype` |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT (pesos del modelo) |
| Formato de pesos | safetensors en fp32 (`model-*.safetensors`, `model.safetensors.index.json`), mas `config.json`, `configuration_gaggle.py` y `modeling_gaggle.py` (requiere `trust_remote_code=True`) |
| Tarea | Reranking punto a punto (tag `pointwise-reranker`) |
| Regla de puntuacion | `s(q, d) = logit(" true") - logit(" false")` en el ultimo token del prompt, leido de dos filas preentrenadas de la cabeza LM (4.352 parametros); sin cabeza de clasificacion |
| Plantilla de prompt | `<\|bos\|>Query: {query}\nPassage: {passage}\nRelevant:` |
| Biblioteca declarada | nanochat |
| Tamano del repositorio | 12,9 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion | 2026-10-09 (entrenamiento finalizado el 2026-10-05) |

## Arquitectura y entrenamiento

La arquitectura es el backbone nanochat "depth-34": un transformer causal puro, sin mezcla de expertos ni componentes de espacio de estados, con 34 capas, anchura de 2.176, 17 cabezas de atencion de dimension 128 y 2.048 tokens de contexto. Sobre ese backbone no se anade una cabeza de clasificacion: el ajuste fino reutiliza dos filas de la cabeza LM preentrenada, correspondientes a los tokens " true" y " false", y la puntuacion de relevancia se obtiene restando ambos logits en la ultima posicion del prompt. Es un diseno de parametros minimos (4.352 parametros efectivos de lectura) sobre un encoder completo de 3,22B.

El ajuste fino se realizo sobre RLHN-250K (247.534 instancias, una epoca) con un objetivo LCE (entropia cruzada listwise) a temperatura τ = 1 sobre un positivo y K ∈ {7, 15, 23} negativos duros por consulta. La optimizacion uso AdamW (β = 0,9/0,95, weight decay 0,01), tasa de aprendizaje maxima de 5 × 10⁻⁵, 150 pasos de warm-up con decaimiento coseno hasta cero, recorte de gradiente con norma global 12, 128 grupos de consultas por actualizacion, semilla 17 y 1.931 actualizaciones en total, con pesos y estado del optimizador en FP32, matmuls TF32 y gradient checkpointing. El entrenamiento se ejecuto en 2 × NVIDIA H100 de 80 GB sobre el cluster Alliance Rorqual, con un presupuesto de microbatch de 39.312 tokens por GPU ejecutado en trozos de 16.384 tokens. La innovacion metodologica del run es el gradient caching, que fragmenta un grupo de consultas en trozos preservando la exactitud de la perdida LCE conjunta y permitiendo entrenar el objetivo listwise con memoria acotada.

## Capacidades

- Puntuacion de relevancia consulta-pasaje en ingles: devuelve un score escalar por par mediante `compute_score`, sin generacion de texto.
- Reranking de listas de candidatos: reordena los 100 primeros resultados de BM25, el escenario para el que fue evaluado.
- Entrenamiento con negativos duros: el objetivo LCE sobre 1 positivo y entre 7 y 23 negativos duros por consulta le permite discriminar pasajes tematicamente cercanos.
- Manejo de consultas cortas y pasajes de longitud media: el regimen de entrenamiento es 128 tokens de consulta y 512 de pasaje, aunque el backbone admite hasta 2.048 tokens en total si no se trunca.
- Integracion con `transformers` mediante `AutoModelForSequenceClassification` y `AutoTokenizer` con `trust_remote_code=True`.
- Conversión bit a bit de vuelta al checkpoint de entrenamiento original mediante `to_nanochat_ckpt.py`, util para reproducir el arnes de evaluacion del paper.
- No dispone de tool calling, function calling, modo de razonamiento extendido, capacidades multimodales (vision o audio) ni soporte multilingue: es un componente de recuperacion de un solo idioma.

## Casos de uso

- Reordenacion en busqueda de dos etapas: se recuperan 100 candidatos con BM25 o un retriever disperso y el modelo reordena la lista con nDCG@10 optimizado; en TREC DL pasa de 0,393 (BM25) a 0,6383, lo que se traduce directamente en mejores primeros puestos.
- Generacion aumentada por recuperacion (RAG): actua como filtro final antes de inyectar contexto en un generador, reduciendo el ruido en el prompt y, con ello, las alucinaciones del modelo generativo aguas abajo.
- Busqueda documental y empresarial en ingles: sobre colecciones como Robust04 (0,5916 de nDCG@10 frente a 0,407 de BM25) o News (0,5147 frente a 0,395) el modelo demuestra ganancias consistentes en corpus de noticias y documentos largos.
- Recuperacion cientifica y biomedica: en SciFact alcanza 0,7834 y en COVID 0,8595, por lo que encaja en asistentes de literatura, revisiones sistematicas y busqueda de evidencia clinica en ingles.
- Busqueda agentica multietapa: el paper lo enmarca en "agentic search" y "sovereign search"; el reranker puede usarse como herramienta de verificacion de relevancia dentro de bucles de agente que reformulan consultas y filtran resultados intermedios.
- Respuesta a preguntas sobre FAQ y atencion al cliente: para bases de conocimiento en ingles con respuestas de 1-2 parrafos, el par consulta-respuesta cabe de sobra en los 512 tokens de pasaje del regimen de entrenamiento.
- Evaluacion offline de sistemas de recuperacion: sirve como juez de relevancia reproducible en bancos de prueba tipo TREC/BEIR, con truncacion fija 128/512 y puntuacion compatible con `trec_eval`.
- Estudio de reproducibilidad y sensibilidad al azar: al publicarse junto a otros tres runs con la misma receta y semillas distintas, permite cuantificar cuanto de una mejora es senal (0,001 de desviacion tipica en medias de benchmark) y cuanto es ruido.

## Benchmarks y rendimiento

Evaluacion declarada por el autor: nDCG@10 reordenando los 100 mejores candidatos de BM25, truncacion 128/512, medida con `trec_eval`.

TREC Deep Learning 2019-2023:

| Sistema | DL19 | DL20 | DL21 | DL22 | DL23 | Media |
|---|---:|---:|---:|---:|---:|---:|
| BM25 (primera etapa) | 0,506 | 0,480 | 0,446 | 0,269 | 0,263 | 0,393 |
| Este modelo | 0,7495 | 0,7196 | 0,7145 | 0,5278 | 0,4799 | 0,6383 |

Colecciones BEIR:

| Sistema | COVID | News | Robust04 | NFCorpus | SciFact | SCIDOCS | FiQA | Media |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| BM25 (primera etapa) | 0,595 | 0,395 | 0,407 | 0,322 | 0,679 | 0,149 | 0,236 | 0,398 |
| Este modelo | 0,8595 | 0,5147 | 0,5916 | 0,3773 | 0,7834 | 0,2339 | 0,4540 | 0,5449 |

Datos de variabilidad aportados por el autor: entre los cuatro runs, la desviacion tipica muestral es de 0,001 en las medias de benchmark y de 0,003 en colecciones individuales, de modo que diferencias de ese orden entre checkpoints son ruido. El "soup" de los cuatro runs alcanza 0,641 en TREC DL y 0,547 en BEIR.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los pesos ocupan unos 12,9 GB (coincide con el tamano del repositorio), por lo que se necesitan aproximadamente 14-16 GB contando activaciones; en bfloat16 bajan a unos 6,4 GB y el total se situa en torno a 7-8 GB para lotes pequenos. La cache KV es despreciable a 2.048 tokens de contexto (del orden de 1,2 GB en fp16 con lote 1).
- GPU recomendadas: las mismas usadas en entrenamiento, 2 × NVIDIA H100 de 80 GB, o equivalentes A100 de 40/80 GB si se quiere reproducir el ajuste fino. Para inferencia basta una GPU mucho menor.
- Compatibilidad con GPU de consumo: si. Una RTX 4090 o RTX 3090 (24 GB) lo ejecuta sin problemas incluso en fp32; una RTX 4080, 4070 Ti SUPER o 4060 Ti de 16 GB lo ejecutan en bfloat16; tarjetas de 12 GB pueden funcionar en bfloat16 con lotes pequenos.
- Opciones de despliegue: la via documentada es `transformers` con `AutoModelForSequenceClassification.from_pretrained(..., trust_remote_code=True, dtype=torch.bfloat16)`; los ficheros `modeling_gaggle.py` y `configuration_gaggle.py` del repositorio se cargan dinamicamente. No hay informacion sobre soporte en vLLM, TGI, llama.cpp, Ollama u otros servidores de inferencia, y la ausencia de pesos GGUF o cuantizados hace que esas rutas no esten cubiertas por la documentacion disponible.
- Latencia y throughput: no disponibles. El autor solo documenta el coste de entrenamiento (presupuesto de microbatch de 39.312 tokens por GPU en trozos de 16.384 tokens sobre 2 × H100).

## Comparativa con modelos similares

Dentro de la propia familia hay una comparacion directa y con datos:

| Modelo | Parametros | Contexto | nDCG@10 TREC DL (media) | nDCG@10 BEIR (media) | Licencia |
|---|---|---|---|---|---|
| Este modelo (baseline run 4) | 3,22B | 2.048 tokens | 0,6383 | 0,5449 | MIT |
| castorini/gaggle-reranker-20261005 (soup de los 4 runs) | 3,22B | 2.048 tokens | 0,641 | 0,547 | MIT |
| Backbone castorini/gaggle-nanochat-pretrained-climbmix-20260924 | no disponible | no disponible | no disponible (no es un reranker ajustado) | no disponible | no disponible en la informacion |

Frente a rerankers cruzados de otros proveedores (familias BGE, Jina, mxbai o servicios propietarios de reranking), la informacion proporcionada no incluye resultados comparativos, y las diferencias de protocolo de evaluacion, truncacion e idioma impedirian una comparacion directa fiable: no disponible.

## Limitaciones y advertencias

- Idioma: el modelo solo esta entrenado y evaluado en ingles; su rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera muy inferior.
- Contexto limitado: el backbone maneja 2.048 tokens y el entrenamiento se hizo con 128 tokens de consulta y 512 de pasaje. Aunque la truncacion no se impone en inferencia, pasar de ese regimen degrada la calidad y limita el reranking de pasajes largos.
- Naturaleza no generativa: no produce texto, no conversa, no soporta tool calling ni razonamiento multi-paso por si mismo; es un componente dentro de un pipeline de recuperacion.
- Score no calibrado: la puntuacion es una diferencia de logits, no una probabilidad calibrada; para umbrales de relevancia en produccion conviene calibrar sobre datos propios.
- Sin cabeza de clasificacion: la lectura se hace desde dos filas de la cabeza LM preentrenada (4.352 parametros), lo que ata el comportamiento al preentrenamiento del backbone.
- Licencia de los datos: los pesos son MIT, pero los datos de ajuste fino (RLHN-250K) son CC-BY-SA-4.0 y el corpus de preentrenamiento del backbone (ClimbMix) es CC-BY-NC-4.0. El propio autor advierte de que los usuarios aguas abajo deben comprobar los terminos de los datos contra su uso previsto; el componente no comercial de ClimbMix es un riesgo legal a evaluar antes de un despliegue comercial.
- Ejecucion de codigo remoto: el uso requiere `trust_remote_code=True`, lo que implica ejecutar `modeling_gaggle.py` y `configuration_gaggle.py` del repositorio.
- Reproducibilidad parcial: el checkpoint incluye pesos pero no el estado del optimizador ni el estado del generador aleatorio, por lo que puntua pero no permite reanudar el entrenamiento.
- Ruido entre runs: con una desviacion tipica de 0,001 en medias de benchmark entre los cuatro runs, cualquier comparacion entre checkpoints de esta familia debe considerar ese margen antes de declarar una mejora.
- Sesgos: no se han publicado analisis de sesgo en la informacion proporcionada. Al ser un reranker entrenado sobre un corpus curado de colecciones heterogeneas, puede heredar sesgos de cobertura tematica y de dominio de esas fuentes.
- Adopcion nula verificable: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- Busqueda web: los resultados de la busqueda realizada no contienen informacion relevante sobre el modelo (contenido no relacionado), por lo que no se ha utilizado ninguna fuente externa adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/castorini/gaggle-reranker-run4-20261005
- Modelo "soup" de los cuatro runs: https://huggingface.co/castorini/gaggle-reranker-20261005
- Backbone preentrenado: https://huggingface.co/castorini/gaggle-nanochat-pretrained-climbmix-20260924
- Dataset de ajuste fino: https://huggingface.co/datasets/rlhn/rlhn-250K
- Corpus de preentrenamiento: https://huggingface.co/datasets/nvidia/ClimbMix
- Paper: https://arxiv.org/abs/2610.11922 (Project Greenhouse: Progress Toward Fully Open and Sovereign Agentic Search, Jimmy Lin, Sahel Sharifymoghaddam, Lingwei Gu y Nour Jedidi, 2026, arXiv:2610.11922, cs.IR)
- Ejemplo de uso ejecutable: seccion Usage de https://huggingface.co/castorini/gaggle-reranker-20261005#usage
