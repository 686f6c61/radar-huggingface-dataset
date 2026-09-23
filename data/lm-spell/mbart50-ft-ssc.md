# lm-spell/mbart50-ft-ssc

## Resumen

mbart50-ft-ssc es un modelo de corrección ortográfica (spell correction) para cingalés, desarrollado por el usuario lm-spell y publicado en HuggingFace el 20 de mayo de 2025. Se trata de un fine-tune de facebook/mbart-large-50, el modelo multilingüe encoder-decoder de Meta, reentrenado sobre el dataset lm-spell/sinhala-spell-correction-dataset. Con 610.880.512 parámetros, hereda del modelo base la arquitectura transformer seq2seq, el vocabulario multilingüe de 250.000 tokens y una ventana máxima de 1.024 tokens.

El modelo aborda un problema muy concreto: la normalización de texto en cingalés, una lengua de bajos recursos dentro del ecosistema NLP y con escasa representación en modelos generativos. La tarea declarada es la corrección ortográfica y, por extensión, la limpieza de texto ruidoso procedente de redes sociales, OCR o transcripciones automáticas. Al estar construido sobre mBART-50, el modelo aprovecha el preentrenamiento multilingüe aunque el fine-tune esté orientado a un único idioma.

Su relevancia actual es limitada pero específica: cubre un hueco poco atendido por los modelos comerciales y mayoritarios, que apenas ofrecen calidad en cingalés. Sin embargo, conviene señalar que el modelo tiene 26 descargas y 0 likes en el momento de redactar esta ficha, no publica resultados de benchmarks y su acceso está restringido (gated), lo que obliga a aceptar condiciones en HuggingFace antes de descargarlo. La licencia es CC-BY-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq), basada en facebook/mbart-large-50 |
| Parametros totales | 610.880.512 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 1.024 tokens (max_position_embeddings del modelo base mBART-large-50) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors a precision completa (fp32) |
| Idiomas soportados | Cingales (si) para la tarea objetivo; el modelo base mBART-50 soporta 50 idiomas |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |

Otros datos relevantes: tamano del repositorio 2,5 GB, pipeline declarado text-generation (aunque la arquitectura es seq2seq, por lo que el pipeline correcto es text2text-generation), tags feature-extraction y spell-correction, acceso restringido mediante gating, fecha de creacion 2025-05-20 y ultima actualizacion 2026-09-23.

## Arquitectura y entrenamiento

El modelo emplea la arquitectura mBART-50: un transformer encoder-decoder de tipo seq2seq con normalización previa a la capa, embeddings posicionales sinusoidales y un vocabulario compartido de aproximadamente 250.000 tokens (SentencePiece), al que mBART-50 anade tokens adicionales de identificacion de idioma. El checkpoint base facebook/mbart-large-50 se preentreno con un objetivo de denoising (BART) sobre corpus monolingues de 50 idiomas, seguido de fine-tuning supervisado con datos paralelos. El fine-tune de lm-spell parte de ese checkpoint y lo especializa en la correccion ortografica del cingales.

No se dispone de informacion detallada sobre el proceso de entrenamiento del fine-tune: numero exacto de tokens, composicion del dataset, hiperparametros, epocas, tasa de aprendizaje, si se aplico RLHF, DPO u otro ajuste por preferencias, ni si se congelaron capas del encoder. El unico dato confirmado es el dataset utilizado (lm-spell/sinhala-spell-correction-dataset). Tampoco se documentan innovaciones tecnicas propias, decodificacion especulativa ni variantes de atencion eficiente; se trata de un ajuste estandar sobre un backbone conocido.

## Capacidades

- Generacion condicionada de texto en cingales: dado un texto con errores ortograficos, produce una version corregida mediante decodificacion seq2seq.
- Correccion ortografica y normalizacion de texto en cingales (tarea principal declarada en el tag spell-correction).
- Extraccion de caracteristicas (feature-extraction) a partir de las representaciones internas del encoder.
- Procesamiento de secuencias de hasta 1.024 tokens, adecuado para parrafos cortos y frases.
- Aprovechamiento del preentrenamiento multilingue de mBART-50, que podria aportar cierta transferencia desde idiomas relacionados, aunque el fine-tune esta orientado a cingales.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo no es un LLM instruido.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Normalizacion de texto de entrada en buscadores en cingales: antes de indexar o ejecutar una consulta, el modelo corrige erratas del usuario y mejora la tasa de coincidencia con documentos correctamente escritos.
- Post-procesado de OCR en cingales: los motores de reconocimiento optico de caracteres introducen errores sistematicos; este modelo puede actuar como capa de limpieza sobre el texto extraido, con secuencias de hasta 1.024 tokens.
- Correccion de transcripciones automaticas de voz: tras un sistema ASR en cingales, el modelo normaliza palabras mal transcritas antes de almacenar la transcripcion o alimentar un sistema posterior.
- Limpieza de corpus para entrenamiento de otros modelos: textos extraidos de redes sociales, foros o web presentan ruido ortografico; este modelo permite normalizarlos y construir datasets de mayor calidad.
- Moderacion y analitica de contenido generado por usuarios: la normalizacion previa reduce falsos negativos en clasificadores de toxicidad o en sistemas de analisis de sentimiento entrenados con texto limpio.
- Herramientas educativas y de aprendizaje del cingales: correccion asistida de redacciones de estudiantes, con la salvedad de que el modelo no explica el error, solo propone la forma corregida.
- Preprocesado en pipelines de traduccion: al mejorar la ortografia de la entrada en cingales, se reduce el ruido que recibe un sistema de traduccion automatica aguas abajo.
- Prototipado de bajo coste en investigacion: con 610 millones de parametros cabe en una GPU de consumo, lo que facilita experimentos academicos sobre normalizacion de lenguas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La ficha de HuggingFace del modelo no incluye tablas de evaluacion, cifras de exactitud, BLEU, chrF, tasa de correccion ni comparaciones con otros sistemas. Tampoco se han encontrado resultados en la busqueda web realizada, cuyos resultados no guardaban relacion con este modelo. Cualquier cifra de rendimiento deberia obtenerse mediante evaluacion propia sobre el dataset lm-spell/sinhala-spell-correction-dataset o sobre un conjunto de validacion independiente en cingales.

## Requisitos de hardware

- VRAM estimada en fp32 (formato publicado): aproximadamente 2,45 GB solo para los pesos, mas activaciones y cache de atencion; en la practica, entre 3 y 5 GB para lotes pequenos y secuencias de hasta 1.024 tokens.
- VRAM estimada en fp16/bf16: aproximadamente 1,22 GB de pesos.
- VRAM estimada en int8: aproximadamente 0,61 GB de pesos.
- VRAM estimada en int4: aproximadamente 0,31 GB de pesos (requiere cuantizacion propia, no publicada).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente (RTX 3050, RTX 3060, RTX 4060, RTX 4090, T4, L4). No se requieren A100 ni H100.
- Compatibilidad con GPU de consumo: si, de forma holgada. Tambien es viable la inferencia en CPU con 8 GB de RAM si se acepta mayor latencia.
- Opciones de despliegue: transformers con AutoModelForSeq2SeqLM y el pipeline text2text-generation es la ruta soportada de forma nativa. El soporte de vLLM y TGI para modelos encoder-decoder es limitado y variable, por lo que conviene verificar compatibilidad antes de usarlos en produccion. No hay ficheros GGUF publicados, de modo que llama.cpp u Ollama exigirian una conversion manual a GGUF, no oficial.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| lm-spell/mbart50-ft-ssc | 610,9 M | 1.024 tokens | Cingales (fine-tune); 50 en el base | cc-by-4.0, acceso gated | Especializado en correccion ortografica en cingales; sin benchmarks publicados |
| facebook/mbart-large-50 | 610,9 M | 1.024 tokens | 50 idiomas | MIT | Modelo base multilingue de traduccion y generacion; requiere fine-tune para correccion ortografica |
| google/mt5-base | 580 M | 1.024 tokens | 101 idiomas | Apache-2.0 | Encoder-decoder multilingue tipo T5; alternativa habitual para tareas seq2seq en lenguas de bajos recursos |
| facebook/nllb-200-distilled-600M | 600 M (aprox.) | 1.024 tokens | 200 idiomas | CC-BY-NC-4.0 | Enfocado a traduccion; su licencia no comercial limita el uso en productos |

La comparacion de rendimiento entre estos modelos en la tarea de correccion ortografica en cingales no esta disponible: ninguno de ellos publica metricas especificas sobre este dataset, y el modelo objeto de la ficha no aporta resultados propios.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated, por lo que es necesario aceptar condiciones en HuggingFace antes de descargar los pesos, lo que complica la automatizacion de pipelines de CI/CD y el despliegue reproducible.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad, y las 26 descargas y 0 likes indican una validacion practicamente nula por parte de la comunidad.
- Cobertura linguistica limitada al cingales: aunque el modelo base es multilingue, el fine-tune esta orientado a un unico idioma y no hay garantia de calidad en otros.
- Limite de contexto de 1.024 tokens: los documentos largos deben dividirse en fragmentos, lo que puede romper la coherencia de correcciones que dependen de contexto lejano.
- Riesgo de alucinacion y de reescritura: al ser un modelo seq2seq generativo, puede modificar palabras correctas, alterar nombres propios o introducir contenido no presente en la entrada. En tareas de correccion ortografica esto es especialmente peligroso y exige validacion o decodificacion restringida.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento ni su representatividad dialectal o de registro, por lo que no puede descartarse sesgo hacia un registro formal o hacia una variedad concreta del cingales.
- Licencia CC-BY-4.0: permite uso comercial, pero obliga a atribuir la autoria (lm-spell y, en la cadena de derivacion, Meta por facebook/mbart-large-50) y a indicar si se han realizado modificaciones. No incluye concesiones de patentes ni de marcas.
- Sin cuantizaciones oficiales publicadas: no hay GGUF, GPTQ, AWQ ni otros formatos listos para consumo, lo que anade trabajo de conversion si se quiere desplegar en entornos con restricciones de memoria.
- Documentacion muy escasa: la ficha no detalla hiperparametros, regimen de entrenamiento ni criterios de evaluacion, lo que dificulta la reproducibilidad.
- Caveat de etiquetado: el pipeline declarado es text-generation, pero la arquitectura es encoder-decoder; usar el pipeline incorrecto puede dar resultados enganosos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lm-spell/mbart50-ft-ssc
- Modelo base: https://huggingface.co/facebook/mbart-large-50
- Dataset de entrenamiento: https://huggingface.co/datasets/lm-spell/sinhala-spell-correction-dataset
- Paper de mBART (preentrenamiento multilingue): https://arxiv.org/abs/2001.08210
- Paper de mBART-50 (extension a 50 idiomas): https://arxiv.org/abs/2008.00401
- No se han encontrado en la busqueda web enlaces adicionales relacionados con este modelo; los resultados devueltos correspondian a servicios y publicaciones sin vinculacion con lm-spell ni con el modelo.
