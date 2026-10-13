# c-ho/2026-10-12-xlmr-large-baseline

## Resumen

El modelo `c-ho/2026-10-12-xlmr-large-baseline` es un ajuste fino de tipo *token classification* sobre `FacebookAI/xlm-roberta-large`. Lo publica el usuario c-ho en HuggingFace y, por el nombre y el contenido de la model card, se trata de un modelo base de referencia (*baseline*) para una tarea de etiquetado de fenómenos lingüísticos, presumiblemente anotación de terminología o de conceptos lingüísticos en corpus académicos. El repositorio no especifica el conjunto de datos de entrenamiento ni la procedencia de las anotaciones.

Técnicamente es un transformer encoder de 558.874.657 parámetros (heredados íntegramente del modelo base, sin modificaciones de tamaño), con una cabeza de clasificación de tokens por encima. No es un modelo generativo: no produce texto libre, sino una etiqueta por token de entrada. Su relevancia es limitada y muy acotada al experimento concreto para el que se entrenó: diez épocas de ajuste fino con un *learning rate* de 2e-5 y un F1 final de 0,5618 sobre el conjunto de evaluación del autor.

Al no documentarse el conjunto de datos, los idiomas ni el esquema completo de etiquetas, la ficha queda incompleta en varios apartados, que se marcan explícitamente como no disponibles. El modelo se distribuye con licencia MIT y formato safetensors, con un tamaño de repositorio de 22,4 GB que muy probablemente incluye varios puntos de control de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large) con cabeza de clasificacion de tokens |
| Parametros totales | 558.874.657 |
| Longitud de contexto | 512 tokens (heredado del modelo base; la model card no lo especifica) |
| Tipos de cuantizacion | No disponible: no se publican pesos cuantizados. Admite cuantizacion dinamica int8 via PyTorch u ONNX Runtime |
| Idiomas soportados | No disponible en la model card. El modelo base XLM-RoBERTa-large se entreno sobre 100 idiomas, pero no se documenta el alcance del ajuste fino |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |
| Tarea (pipeline) | token-classification |
| Etiquetas | 16 clases de fenomeno linguistico listadas; se desconoce si existe una clase "O" adicional |
| Tamano del repositorio | 22,4 GB |

## Arquitectura y entrenamiento

La arquitectura es la de XLM-RoBERTa-large: un transformer encoder de tipo RoBERTa con normalizacion en la posicion previa (pre-LN), *position embeddings* absolutas y vocabulario SentencePiece de 250.000 tokens. El modelo base fue entrenado por Facebook AI sobre aproximadamente 2,5 TB de CommonCrawl filtrado en 100 idiomas. Sobre esa base se anade una capa de clasificacion lineal que proyecta el vector de cada token a las clases de fenomeno linguistico, y se ajusta de forma supervisada.

Los hiperparametros del ajuste fino estan documentados: *learning rate* 2e-5, planificador lineal con 10% de *warmup*, AdamW (`betas=(0.9, 0.999)`, `epsilon=1e-08`), tamano de lote efectivo 32 (batch 8 x 4 pasos de acumulacion), 10 epocas, semilla 42 y entrenamiento con AMP nativo. No hay informacion sobre el conjunto de datos, su tamano, su composicion idiomatica, el numero de clases total ni sobre si se aplicaron tecnicas de balanceo de clases, RLHF o DPO (no aplicables en un encoder de clasificacion). La model card indica literalmente «unknown dataset» y deja las secciones de descripcion, usos previstos y datos como «More information needed».

## Capacidades

- Etiquetado de tokens (*sequence labelling*): asigna una clase a cada token de entrada; es la unica funcion para la que fue entrenado.
- Clasificacion de fenomenos linguisticos en 16 categorias: Academicdiscipline, Ambiguouslydefinedconcept, Discoursephenomenon, Graphemicphenomenon, Languagerelatedterm, Languageresourceinformation, Lexicalphenomenon, Morphologicalphenomenon, Morphosyntacticphenomenon, New Tag, Otherlinguisticterm, Phonologicalphenomenon, Semanticphenomenon, Syntacticphenomenon, Topnode Dummy y Unclassifiedlinguisticconcept.
- Capacidad multilingue potencial heredada del modelo base, no verificada ni documentada en esta ficha.
- Generacion de texto: no soportada.
- Tool calling / function calling: no soportado (no es un modelo generativo con plantilla de chat).
- Razonamiento multi-paso y uso como agente: no soportado.
- Modo *thinking*, vision o audio: no soportados.

## Casos de uso

- Pre-anotacion de corpus linguisticos: el modelo puede etiquetar automaticamente fenomenos linguisticos en textos academicos y servir como primera pasada para anotadores humanos, que revisarian y corregirian las etiquetas. Es util precisamente por ser un *baseline*: marca el punto de partida a batir.
- Anotacion de terminologia en documentacion cientifica: en textos donde se describen conceptos, fenomenos fonologicos o morfologicos, el modelo identifica las menciones y las clasifica, aunque con F1 bajo en varias clases (ver limitaciones).
- Extraccion de entidades y conceptos especializados: integrable en un pipeline de procesamiento de documentos para poblar una base de conocimiento con terminos categorizados por tipo de fenomeno.
- Enriquecimiento de indices de busqueda: las etiquetas por token permiten construir filtros facetados por categoria linguistica en un buscador documental.
- Investigacion en linguistica computacional: analisis cuantitativo de la distribucion de fenomenos linguisticos en un corpus a gran escala, como paso previo a un estudio manual.
- Destilacion o ajuste posterior: al ser un modelo pequeno (559 M de parametros) y con licencia MIT, puede usarse como profesor o como punto de partida para ajustes con datos propios y mas documentados.
- Formacion de un modelo de anotacion multilingue: dado que el encoder base es multilingue, el mismo cabezal puede reentrenarse sobre corpus en otros idiomas, aunque el presente ajuste no documenta ese alcance.

## Benchmarks y rendimiento

El *model-index* declarado por el autor esta vacio (`"results": []`). Los unicos resultados disponibles son las metricas de evaluacion incluidas en la model card, correspondientes a la epoca 4 (mejor F1 global):

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 0,1917 |
| Precision | 0,6155 |
| Recall | 0,5167 |
| F1 (global) | 0,5618 |
| Accuracy | 0,9519 |

F1 por clase en la misma epoca 4:

| Clase | F1 |
|---|---|
| Phonologicalphenomenon | 0,8479 |
| Languagerelatedterm | 0,7214 |
| Morphosyntacticphenomenon | 0,7053 |
| Unclassifiedlinguisticconcept | 0,6538 |
| Syntacticphenomenon | 0,6331 |
| Otherlinguisticterm | 0,5940 |
| Languageresourceinformation | 0,5491 |
| Morphologicalphenomenon | 0,5345 |
| Lexicalphenomenon | 0,4623 |
| New Tag | 0,4544 |
| Academicdiscipline | 0,4000 |
| Topnode Dummy | 0,3577 |
| Semanticphenomenon | 0,1346 |
| Ambiguouslydefinedconcept | 0,0000 |
| Discoursephenomenon | 0,0000 |
| Graphemicphenomenon | 0,0000 |

No se han publicado comparaciones con otros modelos ni resultados en benchmarks estandar (MMLU, GLUE, XTREME, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 558,9 M de parametros, no medida): aproximadamente 2,2 GB en fp32, 1,1 GB en fp16/bf16 y 0,56 GB en int8, solo para los pesos. Con activaciones para lotes de 16 secuencias de 512 tokens, el consumo total razonable se situa en el rango de 2 a 4 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para lotes pequenos. Para lotes grandes o *throughput* alto, A100, H100, L40S o RTX 4090. Para entrenamiento o reajuste, se recomienda al menos 16-24 GB.
- Compatibilidad con GPU de consumo: si, cabe con holgura en RTX 3060 (12 GB), RTX 4060, RTX 4070, RTX 4090 e incluso en GPUs de 6-8 GB con lotes moderados. Tambien puede ejecutarse en CPU con latencia mayor.
- Opciones de despliegue: `transformers` con el pipeline `token-classification`, ONNX Runtime, TorchScript, Hugging Face Inference Endpoints, FastAPI o TorchServe para servir el modelo, y Triton Inference Server para despliegues a gran escala. Los runners orientados a modelos generativos (vLLM, Ollama, llama.cpp) no estan pensados para cabezas de clasificacion de tokens de tipo encoder, por lo que no son la via recomendada.
- Latencia y throughput: no disponible. No se han publicado mediciones y el autor no aporta datos de rendimiento en inferencia.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de las alternativas, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Tarea |
|---|---|---|---|---|---|
| c-ho/2026-10-12-xlmr-large-baseline | 558,9 M | 512 | No documentados (base: 100) | MIT | Clasificacion de tokens |
| FacebookAI/xlm-roberta-large (modelo base) | 559 M | 512 | 100 | MIT | Encoder de proposito general |
| FacebookAI/xlm-roberta-base | 278 M | 512 | 100 | MIT | Encoder de proposito general |
| google-bert/bert-large-cased | 335 M | 512 | Ingles (cased) | Apache 2.0 | Encoder de proposito general |

La comparacion de rendimiento frente a alternativas ajustadas para la misma tarea no esta disponible.

## Limitaciones y advertencias

- F1 global de 0,5618 y *recall* de 0,5167: el modelo deja sin detectar aproximadamente la mitad de las menciones reales, por lo que no es apto para uso autonomo en produccion sin revision humana.
- Tres clases con F1 de 0,0000 (Ambiguouslydefinedconcept, Discoursephenomenon, Graphemicphenomenon): el modelo no las predice en absoluto en el conjunto de evaluacion.
- Clases con F1 muy bajo: Semanticphenomenon (0,1346), Topnode Dummy (0,3577) y Academicdiscipline (0,4000). La etiqueta «New Tag» (0,4544) sugiere un esquema de anotacion inestable o en revision.
- La *accuracy* de 0,9519 es enganosa en tareas de etiquetado de secuencias: refleja el fuerte desbalance hacia la clase mayoritaria y no debe interpretarse como rendimiento util.
- Sobreajuste probable: la *training loss* baja hasta 0,066 en la epoca 5 mientras la *validation loss* repunta desde 0,1917 (epoca 4) hasta 0,2460 (epoca 6). El autor no documenta criterio de parada temprana ni seleccion del mejor punto de control.
- Conjunto de datos de entrenamiento desconocido: la model card indica «unknown dataset», lo que impide evaluar sesgos, cobertura idiomatica, dominio de aplicacion y posibles fugas entre entrenamiento y evaluacion.
- No se documentan los idiomas del ajuste fino; el comportamiento multilingue es una suposicion basada en el modelo base, no un dato verificado.
- Limite de contexto de 512 tokens, insuficiente para documentos largos sin troceado previo.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de falsos positivos y etiquetas espurias en tokens ambiguos.
- Licencia MIT: permite uso comercial y modificacion sin restricciones, pero el modelo se distribuye sin garantia alguna y no hay soporte del autor.
- Modelo con 0 descargas y 0 *likes* en el momento de la consulta, sin validacion por parte de la comunidad. Debe tratarse como un experimento aislado, no como un artefacto maduro.
- El repositorio ocupa 22,4 GB, desproporcionado para 559 M de parametros (unos 2,2 GB en fp32), lo que apunta a puntos de control intermedios u otros ficheros no documentados. Conviene revisar el contenido antes de descargarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/c-ho/2026-10-12-xlmr-large-baseline
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- No se han encontrado enlaces relevantes en la busqueda web: los resultados devueltos (articulos sobre el lenguaje de programacion C y sobre la localidad de Belus, en Francia) no guardan relacion con este modelo.
