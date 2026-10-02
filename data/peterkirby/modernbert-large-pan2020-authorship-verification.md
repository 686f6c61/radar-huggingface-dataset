# peterkirby/modernbert-large-pan2020-authorship-verification

## Resumen

ModernBERT-large PAN Authorship Verification es un ajuste fino completo (full fine-tune) del encoder bidireccional answerdotai/ModernBERT-large, publicado por el usuario peterkirby, especializado en verificar si dos documentos en inglés comparten autor. No es un modelo generativo: se distribuye con pipeline `feature-extraction` y su función es producir embeddings de documento que, comparados mediante similitud coseno, permiten decidir si un par de textos pertenece a la misma persona. El problema que resuelve es la verificación de autoría binaria (authorship verification) en el dominio de fanfiction, tal y como se define en las competiciones PAN 2020 y PAN 2021.

El modelo tiene 394.781.696 parámetros de encoder, 28 capas Transformer y un estado oculto de 1024 dimensiones. La arquitectura base ModernBERT soporta hasta 8192 posiciones, pero este ajuste fino y toda su evaluación se realizaron con un máximo de 4096 tokens por documento, incluyendo tokens especiales. El entrenamiento empleó pérdida contrastiva supervisada (SupConLoss) con temperatura 0.01 y un lote lógico global de 4096 documentos repartidos en 8 GPU.

Su relevancia actual radica en el resultado declarado por el autor: 98,4199% de exactitud y F1 binario de 0,9840 en el split de test de PAN21, y 98,2950% de exactitud en PAN20 test, usando un umbral fijo de similitud coseno (0,6031804084777832) seleccionado en validación y reutilizado sin reajustar sobre test. Es un ejemplo de cómo un encoder moderno con pooling por media y normalización L2 puede resolver una tarea de atribución de autor sin cabeza de clasificación aprendida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (ModernBERT), 28 capas, estado oculto de 1024 |
| Parametros totales | 394.781.696 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens en este ajuste fino (la arquitectura base soporta 8192 posiciones) |
| Tipos de cuantizacion | no disponible; pesos exportados en bfloat16, sin versiones GGUF, AWQ o GPTQ publicadas |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`, bfloat16) |
| Tarea (pipeline) | feature-extraction (text-embeddings-inference, endpoints_compatible) |
| Modelo base | answerdotai/ModernBERT-large (relacion: finetune) |
| Pooling | media ponderada por attention mask sobre tokens no padding, con tokens especiales incluidos, seguida de normalizacion L2 |
| Cabeza de clasificacion | ninguna (sin proyeccion aprendida ni clasificador separado) |
| Umbral de decision | 0,6031804084777832 (similitud coseno; >= pertenece a mismo autor) |
| Tamano del repositorio | 2,4 GB |
| Descargas / likes | 10 / 0 |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de ModernBERT-large. ModernBERT es un encoder Transformer bidireccional que incorpora mejoras de eficiencia como RoPE, alternancia de atencion local y global, y soporte nativo de FlashAttention 2, ademas de un tokenizer propio. En esta version no se anade ninguna cabeza de clasificacion ni proyeccion aprendida: los embeddings se obtienen aplicando mean pooling consciente de la attention mask sobre todos los tokens no padding (los tokens especiales si participan) y normalizando el vector resultante con L2. La decision final se toma comparando el coseno entre los dos embeddings contra un umbral fijo.

El entrenamiento uso el dataset `peterkirby/pan2020_dict_author_fandom_doc` (configuracion `default`, split `train`), con los identificadores de autor como etiquetas de la perdida contrastiva supervisada. Se empleo un lote logico global de 4096 documentos (512 por GPU en 8 GPU), un sampler M-per-class con 2 documentos por autor, temperatura 0.01 y un microbatch de gradient caching de 4. Antes de la tokenizacion y el truncado se aplicaba una rotacion aleatoria de cada documento en limites de caracter o palabra; en evaluacion no se aplica rotacion y se usa el prefijo de cada documento. La longitud maxima de secuencia fue de 4096 tokens, incluidos los tokens especiales.

El umbral se selecciono en cada epoca de validacion buscando el maximo F1 binario sobre `pan21/validation`, y el checkpoint con mayor `val_f1` se guardo con su umbral asociado. Ese umbral se reutilizo tal cual en ambos splits de test, sin ajuste sobre etiquetas de test. La evaluacion se realizo con computo del encoder en bfloat16, FlashAttention 2, pooling y coseno en float32, padding y truncado por la derecha, y codificando por separado cada lado del par.

## Capacidades

- Generacion de embeddings de documento en ingles para comparacion por similitud coseno.
- Verificacion binaria de autoria: decidir si dos documentos comparten autor o no, mediante el umbral fijo documentado.
- Procesamiento de documentos de hasta 4096 tokens, adecuado para textos largos sin necesidad de troceado.
- Similitud coseno como medida de comparacion, calculable de forma independiente y cacheable por documento (el embedding se puede precalcular).
- Aplicable a cualquier par de textos en ingles dentro del dominio aprendido; no requiere clasificador adicional ni reentrenamiento para puntuar pares.
- Integracion con Text Embeddings Inference (TEI) y con endpoints compatibles, lo que permite servir el encoder como servicio de embeddings.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento: es exclusivamente un encoder de representacion.

## Casos de uso

- Peritaje linguistico y analisis forense de textos: el modelo permite comparar un texto anonimo o disputado contra un corpus de referencia de un autor conocido y obtener un veredicto binario con umbral documentado, util como evidencia complementaria en informes periciales sobre fanfiction o textos en ingles.
- Deteccion de cuentas multiples y sockpuppets en comunidades de fanfiction: indexando los embeddings de todos los documentos publicados en una plataforma, se pueden detectar pares con coseno superior a 0,60 y revisar manualmente posibles identidades duplicadas.
- Deteccion de evasion de bloqueos: cuando un usuario expulsado vuelve con una cuenta nueva, la comparacion de sus publicaciones nuevas contra el historico del usuario expulsado ofrece una senal cuantitativa para el equipo de moderacion.
- Triaje editorial y revision por pares: en procesos con autores recurrentes, el modelo puede senalar envios cuyo estilo es altamente similar al de otro revisor o autor, como apoyo a las politicas de conflicto de interes.
- Verificacion de autoria en disputas de derechos y ghostwriting: comparar borradores atribuidos con el corpus firmado de un autor para sustentar o descartar reclamaciones de autoria sobre obras en ingles.
- Curacion y deduplicacion de datasets: al agrupar documentos con similitud coseno alta respecto a un mismo autor, se puede limpiar fuga de datos (data leakage) entre splits de entrenamiento y evaluacion en corpus de atribucion estilistica.
- Analisis de estilo en investigacion en humanidades digitales: extraer embeddings normalizados de grandes colecciones de fanfiction para estudiar agrupaciones por autor, fandom o practicas de escritura, reutilizando el mismo encoder para todos los pares.
- Clasificacion de pares en pipelines de e-discovery: dado un conjunto de documentos en ingles y un autor de referencia, filtrar de forma automatica que documentos son plausibles del mismo autor antes de una revision humana costosa.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card. No se han verificado de forma independiente.

| Split de evaluacion | Exactitud | F1 binario | Umbral |
|---|---:|---:|---:|
| PAN21 validation (checkpoint epoca 29 seleccionado) | 98,4250% | 0,9842444062 | 0,6031804084777832 |
| PAN21 test (resultado del 98,4%) | 98,4199% | 0,9840468764 | 0,6031804084777832 |
| PAN20 test | 98,2950% | 0,9842173457 | 0,6031804084777832 |

Notas sobre la medicion: los valores provienen del historial de entrenamiento original y del resumen final de test; el benchmark completo de test no se volvio a ejecutar durante la exportacion del repositorio. Los ficheros `evaluation_results.json` almacenan exactitud y F1 como fracciones entre 0 y 1. No se han publicado en la informacion disponible otros resultados comparativos (por ejemplo, desglose del paper sobre authorship verification) que puedan reproducirse aqui. La busqueda web solo referencia el paper Contrastive Learning for Authorship Verification (arXiv:2609.28471) y menciona modelos como TinyBERT, pero sin valores numericos utilizables en esta ficha.

## Requisitos de hardware

- Peso de los parametros: aproximadamente 0,79 GB en bfloat16 y 1,58 GB en float32 para los 394.781.696 parametros. El repositorio ocupa 2,4 GB porque incluye otros artefactos ademas del encoder.
- Inferencia en GPU consumer: si, cabe en GPUs con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) incluso a 4096 tokens por documento, siempre que se use bfloat16 o float16.
- GPU recomendadas para servicio de embeddings a escala: NVIDIA A10G, L4, L40S, A100 y H100. El autor entreno en 8 GPU (configuracion no detallada en la informacion disponible).
- Memoria en CPU: viable en inferencia solo-CPU con transformadores y 4096 tokens, con latencia notablemente mayor; no se publican cifras.
- Consideracion de atencion: al ser un encoder bidireccional, el coste de atencion crece de forma cuadratica con la longitud. A 4096 tokens conviene usar FlashAttention 2, que es la implementacion empleada en la evaluacion.
- Opciones de despliegue: transformers, Text Embeddings Inference (TEI, etiqueta soportada en el repositorio), Hugging Face Inference Endpoints (`endpoints_compatible`), y frameworks genericos de embeddings como Infinity. No hay conversion GGUF publicada, por lo que llama.cpp y Ollama no estan soportados de fabrica. No se declara soporte de vLLM para este modelo.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia ni de documentos por segundo.
- Requisito practico de par: la decision necesita codificar los dos documentos del par. Cachear embeddings por documento evita recalculos en busquedas contra un corpus fijo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| peterkirby/modernbert-large-pan2020-authorship-verification | 394.781.696 | 4096 tokens (base: 8192) | Verificacion de autoria binaria por similitud coseno | no disponible | HuggingFace, safetensors |
| answerdotai/ModernBERT-large (modelo base) | 395 M aprox. (no confirmado en la informacion disponible) | 8192 posiciones | Encoder generalista de representacion; no especializado en autoria | no disponible en la informacion proporcionada | HuggingFace |
| Otros sistemas del entorno PAN 2020/2021 | no disponible | no disponible | Verificacion de autoria | no disponible | no disponible |

No se dispone de datos numericos de modelos comparables de la misma categoria en la informacion proporcionada, por lo que no se incluye una comparacion de rendimiento. La busqueda web referencia el paper Contrastive Learning for Authorship Verification y la mencion de TinyBERT como baseline, pero sin valores que puedan tabularse. La comparacion principal disponible es contra el modelo base, del que este ajuste hereda la arquitectura y anade la especializacion en verificacion de autoria con un umbral fijo calibrado en validacion.

## Limitaciones y advertencias

- El coseno no es una probabilidad calibrada: el umbral 0,6031804084777832 es una regla de decision, no un porcentaje de confianza. No debe presentarse como probabilidad al usuario final.
- No se aplica sigmoide, calibracion de probabilidad, banda de absteccion ni remapeo de puntuaciones en esta release.
- Solo ingles. No hay evidencia de funcionamiento en otros idiomas ni de capacidades multilingues.
- Dominio restringido: el entrenamiento y la evaluacion provienen de fanfiction (PAN 2020/2021). El rendimiento en otros generos, registros o longitudes de texto no esta documentado y puede degradarse.
- No se documenta la longitud minima de texto necesaria para una decision fiable; con textos muy cortos la similitud coseno es menos discriminativa.
- La truncacion es por la derecha a 4096 tokens. Documentos mas largos pierden la parte final salvo que se troceen y agreguen manualmente, estrategia que el repositorio no define ni evalua.
- Sensibilidad a la configuracion: cambiar la precision, la implementacion de atencion, el padding o la truncacion puede alterar las puntuaciones cerca del limite de decision, tal y como advierte el propio autor.
- Riesgo de sesgo por estilo: variaciones de estilo ligadas a edad, genero, nivel de ingles como segunda lengua o convenciones de genero literario pueden influir en la similitud, sin que existan mediciones de equidad publicadas.
- Riesgo de uso indebido: la verificacion de autoria afecta a personas. Un falso positivo puede derivar en acusaciones injustas; se recomienda revision humana y no usar el resultado como prueba unica.
- Licencia no disponible: la ausencia de licencia explicita genera incertidumbre juridica para uso comercial o redistribucion. Debe aclararse con el autor antes de integrarlo en produccion.
- Adopcion minima: 10 descargas y 0 likes en el momento de la consulta, sin validacion independiente de los resultados declarados. El benchmark de test no se reprodujo durante la exportacion.
- El ajuste fino esta congelado a 4096 tokens; aumentarlo cambia la configuracion evaluada y no esta respaldado por ninguna medicion publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/peterkirby/modernbert-large-pan2020-authorship-verification
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/peterkirby/pan2020_dict_author_fandom_doc
- Paper Contrastive Learning for Authorship Verification: https://arxiv.org/pdf/2609.28471
- Paper de ModernBERT: https://arxiv.org/abs/2412.13663
- Resultados de evaluacion (en el repositorio): evaluation_results.json
- Historial de entrenamiento (en el repositorio): training_history.parquet
- Configuracion del umbral (en el repositorio): authorship_verification_config.json y config.json
- Trazabilidad de la exportacion (en el repositorio): provenance.json
