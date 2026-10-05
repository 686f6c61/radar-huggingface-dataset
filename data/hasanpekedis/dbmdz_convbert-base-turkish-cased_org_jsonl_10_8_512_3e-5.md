# HasanPekedis/dbmdz_convbert-base-turkish-cased_org_jsonl_10_8_512_3e-5

## Resumen

El modelo `HasanPekedis/dbmdz_convbert-base-turkish-cased_org_jsonl_10_8_512_3e-5` es un ajuste fino de token classification para reconocimiento de entidades nombradas (NER) en turco, restringido exclusivamente a la entidad **ORG** (organizaciones). Parte del checkpoint `dbmdz/convbert-base-turkish-cased`, un encoder de tipo ConvBERT entrenado en turco, y ha sido ajustado por el usuario HasanPekedis sobre un corpus en formato JSONL. Cuenta con 106.817.931 parametros (aproximadamente 106,8 millones), pesos en formato safetensors y un tamano de repositorio de 0,4 GB.

El problema que resuelve es concreto y acotado: extraer menciones de organizaciones (clubes deportivos, ligas, medios de comunicacion, universidades, empresas) de texto turco, con etiquetas BIO de tres clases (`O`, `B-ORG`, `I-ORG`) y una longitud maxima de secuencia de 512 tokens. Su relevancia es practica: se trata de un componente listo para tareas de extraccion de informacion en pipelines de NLP turco, con una F1 de 0,9142 en el conjunto de test (2558 menciones de soporte), aunque el repositorio no declara licencia, idiomas ni pipeline en los metadatos de HuggingFace y acumula 0 descargas y 0 likes en el momento de la consulta.

Es importante senalar que la model card reporta una F1 de validacion de 0,998325 en la epoca 10, muy superior a la F1 de test (0,9142), lo que sugiere un desajuste entre validacion y test o un posible sobreajuste al conjunto de validacion. El modelo no es generativo ni conversacional: es un clasificador de tokens de 106,8 M de parametros, pensado para inferencia de encoder, no para generacion de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvBERT (encoder transformer con convolucion dinamica basada en spans); arquitectura derivada de `dbmdz/convbert-base-turkish-cased` |
| Parametros totales | 106.817.931 (aproximadamente 106,8 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (maximo de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas; pesos distribuidos en safetensors) |
| Idiomas soportados | turco (segun la model card); los metadatos de HuggingFace indican "no disponible" |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | token classification (NER) |
| Entidades | ORG unicamente (etiquetas `O`, `B-ORG`, `I-ORG`) |
| Pipeline declarado en HuggingFace | no disponible |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura base es ConvBERT, una variante de transformer que sustituye parte de las cabezas de self-attention por convoluciones dinamicas basadas en spans (span-based dynamic convolution) con atencion mixta. Esta diseno reduce el coste computacional respecto a BERT manteniendo la capacidad de capturar dependencias locales, algo relevante en NER, donde las fronteras de las entidades dependen de contexto cercano. Sobre ese checkpoint turco se anade una cabeza de clasificacion de tokens con tres etiquetas BIO. No se dispone de informacion en la documentacion proporcionada sobre el numero de capas, dimension oculta, tamano de vocabulario ni numero de cabezas de atencion del checkpoint base.

El ajuste fino se realizo durante 10 epocas con batch size 16, learning rate 3e-5, weight decay 0,01, warmup ratio 0,1, semilla 42 y longitud maxima de 512 tokens. El nombre del repositorio (`..._10_8_512_3e-5`) sugiere una configuracion de 10 epocas, longitud 512 y learning rate 3e-5, aunque el digito intermedio no coincide con el batch size documentado (16), por lo que no se debe interpretar como confirmacion de todos los hiperparametros. No se documenta el numero de tokens de entrenamiento, la composicion del corpus (el identificador `org_jsonl` apunta a un fichero JSONL de origen no especificado, probablemente derivado de un corpus tipo Wikipedia) ni el uso de RLHF, DPO u otras tecnicas de alineamiento, que en un modelo de clasificacion no aplican. Tampoco se documenta ninguna innovacion adicional como decodificacion especulativa o atencion lineal.

## Capacidades

- Reconocimiento de entidades de tipo organizacion (ORG) en texto turco, con etiquetado BIO a nivel de subword.
- Clasificacion de secuencias de hasta 512 tokens en una sola pasada de encoder.
- Extraccion de organizaciones con formas superficiales variadas: clubes deportivos (`İstanbul Başakşehir`, `Karabükspor`, `Pazarspor`), competiciones (`Süper Lig`, `NCAA`, `Euroleague`), medios (`Zaman Gazetesi`), grupos musicales (`The Rolling Stones`, `AC / DC`) y ligas numeradas (`3. Lig`, `2. Lig`).
- Integracion en pipelines de extraccion de informacion mediante `transformers` (AutoModelForTokenClassification), ya que los pesos estan en safetensors.
- No soporta tool calling ni function calling: es un modelo de clasificacion, no generativo.
- No soporta agentes, razonamiento multi-paso ni modos de pensamiento (thinking mode).
- No dispone de capacidades de vision, audio ni generacion de texto.
- Capacidad multilingue: no disponible; la model card solo declara turco.
- Reconocimiento de entidades de persona (PER), lugar (LOC) u otros tipos: no soportado, el modelo solo emite etiquetas ORG.

## Casos de uso

- Enriquecimiento de bases de conocimiento turcas: extraer nombres de clubes, medios y empresas de articulos y volcarlos como nodos ORG en un grafo de conocimiento, usando la ventana de 512 tokens para procesar parrafos completos sin fragmentar en exceso.
- Monitorizacion de medios y prensa: detectar que organizaciones aparecen en cada noticia para construir series temporales de cobertura, apoyandose en una F1 de test de 0,9142 sobre 2558 menciones.
- Analitica deportiva: identificar clubes y competiciones en cronicas y fichas de jugadores, un dominio especialmente representado en los ejemplos cualitativos del autor (Basaksehir, Karabukspor, Pazarspor, Super Lig, NCAA).
- Indexacion y busqueda semantica de documentacion corporativa turca: etiquetar las organizaciones citadas en contratos, actas o informes para habilitar filtros por entidad en un motor de busqueda interno.
- Preprocesado para sistemas de compliance y KYC: detectar menciones de entidades corporativas en comunicaciones y documentos antes de pasarlas a un modulo de resolucion de entidades o listas de sanciones (con supervision humana obligatoria, dado el riesgo de falsos negativos).
- Limpieza y normalizacion de registros empresariales: extraer razones sociales de campos de texto libre en bases de datos heredadas para su deduplicacion posterior.
- Anotacion asistida (human in the loop): preetiquetar grandes volumenes de texto turco con ORG para que los anotadores corrijan, reduciendo el coste frente a la anotacion desde cero.
- Analisis de redes de mencion: medir co-ocurrencia de organizaciones en corpus periodisticos para detectar agrupaciones tematicas o relaciones institucionales.

## Benchmarks y rendimiento

Resultados de validacion y test reportados por el autor en la model card.

| Epoca | Training loss | Validation loss | Precision | Recall | F1 |
|---|---|---|---|---|---|
| 1 | 0,152796 | 0,112959 | 0,870779 | 0,924558 | 0,896863 |
| 2 | 0,110190 | 0,069010 | 0,923760 | 0,946686 | 0,935082 |
| 3 | 0,074456 | 0,039991 | 0,964455 | 0,961406 | 0,962928 |
| 4 | 0,052009 | 0,020604 | 0,979699 | 0,981316 | 0,980507 |
| 5 | 0,036143 | 0,013168 | 0,984545 | 0,988818 | 0,986677 |
| 6 | 0,017932 | 0,006736 | 0,993207 | 0,993395 | 0,993301 |
| 7 | 0,008631 | 0,003503 | 0,996692 | 0,995235 | 0,995963 |
| 8 | 0,003358 | 0,001751 | 0,997782 | 0,997782 | 0,997782 |
| 9 | 0,002803 | 0,001402 | 0,998206 | 0,997688 | 0,997947 |
| 10 | 0,004837 | 0,001122 | 0,998396 | 0,998254 | 0,998325 |

Mejor F1 de validacion: 0,998325 en la epoca 10.

Resultados en el conjunto de test:

| Entidad | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| ORG | 0,9060 | 0,9226 | 0,9142 | 2558 |
| micro avg | 0,9060 | 0,9226 | 0,9142 | 2558 |
| macro avg | 0,9060 | 0,9226 | 0,9142 | 2558 |
| weighted avg | 0,9060 | 0,9226 | 0,9142 | 2558 |

No se han publicado comparaciones con MMLU, HumanEval, GSM8K ni otros benchmarks generales, que ademas no aplican a un modelo de clasificacion de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,43 GB en fp32 (tamano de los 106,8 M de parametros) y unos 0,21 GB en fp16; con activaciones y batch pequeno, el consumo real se situa en torno a 1-2 GB.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, GTX 1660, e incluso en iGPU moderna o CPU exclusivamente, dado el reducido tamano del modelo.
- GPU recomendadas para produccion con alto throughput: NVIDIA T4, L4, A10G o A100/H100 si se necesita procesar grandes volumenes con batching agresivo; el modelo no requiere memoria ni computo de gama alta.
- Opciones de despliegue: Hugging Face Transformers con `AutoModelForTokenClassification`, ONNX Runtime o TensorRT para latencia minima, TorchServe, NVIDIA Triton, FastAPI con batching dinamico. vLLM y llama.cpp no son adecuados para este tipo de modelo: vLLM esta orientado a generacion autoregresiva y llama.cpp a formatos GGUF de modelos generativos.
- Latencia y throughput estimados: no disponible; la model card no publica mediciones de latencia ni de tokens por segundo.
- Almacenamiento: 0,4 GB de repositorio, trivial para cualquier entorno de despliegue, incluidos contenedores ligeros.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea / entidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HasanPekedis/dbmdz_convbert-base-turkish-cased_org_jsonl_10_8_512_3e-5 | 106,8 M (dato verificado en safetensors) | 512 tokens | NER turco, solo ORG | no disponible | HuggingFace, 0 descargas |
| dbmdz/convbert-base-turkish-cased (modelo base) | no disponible en la informacion proporcionada | no disponible | modelo de lenguaje enmascarado en turco, sin cabeza NER | no disponible en la informacion proporcionada | HuggingFace |
| dbmdz/bert-base-turkish-cased | no disponible en la informacion proporcionada | no disponible | modelo de lenguaje enmascarado en turco, base habitual de NER turco | no disponible en la informacion proporcionada | HuggingFace |
| XLM-RoBERTa-base | no disponible en la informacion proporcionada | no disponible | modelo multilingue, base frecuente para NER multilingue | no disponible en la informacion proporcionada | HuggingFace |

No se dispone de datos de rendimiento comparativos entre este modelo y alternativas turcas de NER en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de F1 con otros checkpoints.

## Limitaciones y advertencias

- Cobertura de entidades muy limitada: solo reconoce ORG. Cualquier otro tipo (personas, localizaciones, fechas, productos) se etiqueta como `O`, por lo que no sirve como sistema NER general.
- Brecha entre validacion y test: F1 de 0,998325 en validacion frente a 0,9142 en test. Esa diferencia de mas de 8 puntos indica que el resultado de validacion no es representativo del rendimiento real y apunta a posible sobreajuste o a una particion de datos poco exigente.
- Errores sistematicos en entidades multi-palabra: los ejemplos cualitativos muestran fragmentaciones como `2. Bundesliga` -> `2.` y `Bundesliga`, `Creative Commons lisansı` -> `Creative Commons` + `lisansı`, o `Whenever , Wherever` -> `Whenever` + `Wherever`. Este comportamiento degrada tareas de enlazado de entidades y deduplicacion.
- Etiquetado a nivel de subword que puede producir secuencias BIO incoherentes (por ejemplo, etiquetas `I-ORG` sin `B-ORG` previo o fragmentos con guion final como `Attribution-`), lo que obliga a un postprocesado de agregacion.
- Sesgos conocidos: no disponible. La model card no documenta analisis de sesgo ni la composicion demografica o tematica del corpus de entrenamiento.
- Riesgo de alucinacion: no aplica en el sentido generativo (el modelo no produce texto libre), pero si existe riesgo de falsos positivos y falsos negativos en la deteccion de organizaciones, elevado en dominios alejados del corpus de ajuste.
- Ausencia de licencia declarada: es el caveat mas critico para produccion. Sin licencia explicita no hay autorizacion clara de uso comercial, y ademas la licencia heredada del checkpoint base `dbmdz/convbert-base-turkish-cased` condiciona el uso derivado.
- Alcance idiomatico: turco unicamente; sin evidencia de transferencia a otras lenguas.
- Sin validacion externa: 0 descargas y 0 likes, sin citas ni evaluaciones de terceros, lo que impide contrastar los resultados reportados.
- Longitud limitada a 512 tokens: documentos largos requieren segmentacion con solapamiento, lo que puede partir entidades y duplicar menciones.
- Corpus de origen no documentado: el nombre del artefacto (`org_jsonl`) sugiere un JSONL de procedencia desconocida; no se especifican dominio, licencia de los datos ni proceso de anotacion.
- Los enlaces obtenidos en la busqueda web no guardan relacion con el modelo (son PDFs de ejercicios de fracciones algebraicas), por lo que no aportan informacion adicional verificable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HasanPekedis/dbmdz_convbert-base-turkish-cased_org_jsonl_10_8_512_3e-5
- Modelo base: https://huggingface.co/dbmdz/convbert-base-turkish-cased
- Paper de la arquitectura ConvBERT (referencia generica de la familia, no citada en la model card): https://arxiv.org/abs/2008.02496
- Resultados de busqueda web: no disponible (las busquedas devolvieron unicamente PDFs de matematicas sin relacion con el modelo)
