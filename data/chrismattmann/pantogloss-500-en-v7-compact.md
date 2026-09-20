# chrismattmann/pantogloss-500-en-v7-compact

## Resumen

Pantogloss 500-to-English v7 Compact es un modelo de traduccion many-to-English publicado por el usuario chrismattmann bajo licencia Apache-2.0. Se distribuye como la version compacta en TensorFlow/Keras de Pantogloss v7 y la propia model card lo describe como la opcion recomendada por defecto de la familia Pantogloss. Su proposito es traducir texto de hasta 500 idiomas de origen al ingles, conservando las mejoras conversacionales de espanol-ingles introducidas en v7 en un artefacto de pesos de 564.891.973 bytes (aproximadamente 538,7 MiB), distribuido por separado del paquete Python.

El modelo mantiene la misma arquitectura y los mismos tokenizadores que la version completa v7, pero reduce el coste de almacenamiento: todos los pesos que no pertenecen al embedding de origen se guardan en IEEE FP16, mientras que el embedding de origen usa almacenamiento simetrico de 5 bits por fila con 3.300 overrides exactos en FP16. No realiza deteccion del idioma de origen ni proporciona puntuaciones de confianza calibradas, y la denominacion "500-to-English" describe la procedencia de la familia, no una calidad validada de forma uniforme en 500 idiomas: la confirmacion multilingue documentada cubre 50 idiomas.

Es relevante para equipos que necesiten un traductor al ingles ligero, ejecutable en hardware de consumo, integrable en pipelines de preprocesado o normalizacion de texto multilingue antes de alimentar otros sistemas. La model card reporta cero fallos de traduccion con decodificacion greedy sobre un corpus de confirmacion de 8.250 ejemplos y 50 idiomas, con una perdida agregada de BLEU de -0,0535 y de chrF de -0,0405 respecto a la v7 completa en FP32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card; implementacion en TensorFlow/Keras con la misma arquitectura y tokenizadores que la version completa v7 |
| Parametros totales | No disponible (el artefacto de pesos ocupa 564.891.973 bytes, aproximadamente 538,7 MiB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos no pertenecientes al embedding de origen en IEEE FP16; embedding de origen con almacenamiento simetrico de 5 bits por fila y 3.300 overrides exactos en FP16 |
| Idiomas soportados | Traduccion al ingles; la familia se denomina "500-to-English", pero la validacion multilingue documentada cubre 50 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | Pesos TensorFlow/Keras distribuidos por separado del wheel de Python; el formato de fichero concreto no se especifica en la model card |
| Tarea (pipeline) | Translation (many-to-English) |
| Libreria | pantogloss |
| Modelo base | chrismattmann/pantogloss-500-en-v7 |
| Tamano del repositorio | 0,6 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos) | 2026-09-20 |

## Arquitectura y entrenamiento

La model card no detalla el tipo de arquitectura (transformer, encoder-decoder u otra), solo indica que la version compacta emplea la misma arquitectura y los mismos tokenizadores que la version completa v7 y que la implementacion se distribuye como modelo de TensorFlow/Keras dentro de la libreria `pantogloss`. Tampoco se especifica el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

La innovacion tecnica documentada es el esquema de compactacion de pesos, aplicado sin actualizaciones de gradiente. Los pesos ajenos al embedding de origen se almacenan en IEEE FP16, mientras que el embedding de origen usa almacenamiento simetrico de 5 bits por fila con 3.300 overrides exactos en FP16: 2.100 seleccionados por error de reconstruccion INT5, 150 por impacto de reconstruccion ponderado por calibracion en xhosa y 1.050 por impacto de calibracion equilibrado entre idiomas. La seleccion uso unicamente texto de origen de un split de calibracion FLORES+ `dev` fijado, y la confirmacion se hizo con registros `devtest` disjuntos; ninguna referencia ni salida de confirmacion se uso para clasificar las filas con override.

## Capacidades

- Traduccion al ingles desde texto de origen multilingue (hasta 500 idiomas segun la procedencia de la familia; 50 idiomas en la validacion multilingue documentada).
- Traduccion conversacional espanol-ingles: la version compacta conserva las mejoras conversacionales introducidas en v7 (chrF +2,7454 en la prueba Fisher y +2,0286 en CALLHOME evltest frente a la v6 completa).
- Decodificacion greedy con cero fallos de traduccion sobre el corpus de confirmacion de 8.250 ejemplos y 50 idiomas.
- Uso mediante API Python: `Translator.from_pretrained(device="auto")` y `translator.translate(...)`, con seleccion explicita del modelo como `pantogloss-500-en-compact`.
- Ejecucion en GPU NVIDIA (CUDA) y en Apple Silicon (Metal), con rutas de ejecucion validadas en una RTX 3080 Ti Laptop y en un Apple M3 Max.
- No dispone de deteccion del idioma de origen: el idioma de entrada debe conocerse o gestionarse fuera del modelo.
- No ofrece puntuaciones de confianza calibradas.
- No se documentan capacidades de tool calling, function calling, uso como agente, razonamiento multi-paso, vision, audio ni modo de pensamiento.

## Casos de uso

- Normalizacion de tickets de soporte multilingues: traducir al ingles las incidencias recibidas en varios idiomas antes de clasificarlas o enrutarlas, aprovechando el soporte de 50 idiomas validados y la ejecucion en hardware de consumo.
- Preprocesado para pipelines con LLM en ingles: usar Pantogloss como etapa previa de traduccion para que un modelo de lenguaje en ingles procese entradas en otros idiomas, reduciendo la necesidad de prompts multilingues.
- Analisis de llamadas y transcripciones conversacionales: las mejoras documentadas en las pruebas Fisher y CALLHOME lo hacen adecuado para traducir transcripciones de habla espontanea antes de tareas de analitica o mineria de texto.
- Traduccion de documentacion tecnica y contenido web: ingesta de paginas, manuales o articulos en varios idiomas para consolidarlos en un corpus unico en ingles destinado a busqueda interna o indexacion.
- Analitica de feedback de usuarios: traduccion de resenas, encuestas y mensajes de producto de multiples mercados a un unico idioma para su analisis agregado.
- Asistencia a la comunicacion interna en empresas multilingues: traduccion al ingles de mensajes de correo, chat o foros internos para equipos distribuidos.
- Investigacion en idiomas de bajos recursos: el esquema de compactacion incluye un ajuste especifico de calibracion ponderada para xhosa, lo que permite experimentar con traduccion de idiomas africanos al ingles en equipos de investigacion con recursos limitados.
- Prototipado y evaluacion local: el tamano del artefacto (aproximadamente 538,7 MiB) permite desplegar el modelo en un portatil con GPU para pruebas de calidad antes de decidir una integracion en produccion.

## Benchmarks y rendimiento

Los resultados disponibles son comparaciones relativas, no puntuaciones absolutas de BLEU o chrF. La model card no publica los valores absolutos de las metricas.

| Evaluacion | Referencia | Resultado reportado |
|---|---|---|
| Confirmacion multilingue (8.250 ejemplos, 50 idiomas, decodificacion greedy) | Fallos de traduccion | 0 fallos |
| Confirmacion multilingue (agregado BLEU) | v7 completa en FP32 | -0,0535 |
| Confirmacion multilingue (agregado chrF) | v7 completa en FP32 | -0,0405 |
| Confirmacion multilingue (chrF agregado) | Compacta por defecto anterior | +0,0168 |
| Confirmacion multilingue (mayor caida de chrF por idioma) | v7 completa en FP32 | Xhosa, -0,7065 |
| Conversacional, prueba Fisher (chrF) | v6 completa | +2,7454 |
| Conversacional, CALLHOME evltest (chrF) | v6 completa | +2,0286 |
| Conversacional, cinco splits (chrF) | v7 completa en FP32 | Perdida entre -0,0075 y -0,1282 |
| Conversacional, cinco splits | Fallos de traduccion | 0 fallos |

Los resultados definitivos y las puertas de validacion congeladas se registran en el repositorio Pantogloss, en la ruta `training/experiments/successor-v7-compact`, segun la model card. No se han publicado en la informacion disponible comparaciones con modelos externos de traduccion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de ingenieria, el artefacto de pesos ocupa aproximadamente 538,7 MiB, por lo que el modelo completo deberia caber holgadamente en GPUs con 4 GB de VRAM o mas, incluso sumando activaciones y memoria del runtime. Esta cifra es una estimacion derivada del tamano del artefacto, no un dato publicado.
- Rutas de ejecucion validadas por el autor: NVIDIA RTX 3080 Ti Laptop GPU con CUDA y Apple M3 Max con Metal.
- Cabe en GPU de consumo: si, segun el tamano del artefacto y las dos rutas de ejecucion confirmadas (portatil con GPU NVIDIA y Apple Silicon).
- GPU de datacenter recomendadas: no disponible. No se documentan pruebas en A100, H100 ni similares.
- Opciones de despliegue: libreria Python `pantogloss` con TensorFlow/Keras y seleccion de dispositivo mediante `device="auto"`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput estimados: no disponible. La model card solo indica que se uso decodificacion greedy en la evaluacion.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos externos comparables en la documentacion proporcionada. La comparacion posible es con las variantes internas de la propia familia, para las que tampoco se publican parametros, contexto ni licencias diferenciadas.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pantogloss-500-en-v7-compact | No disponible | No disponible | Traduccion al ingles; validacion en 50 idiomas | Apache-2.0 | HuggingFace |
| pantogloss-500-en-v7 (completa, FP32) | No disponible | No disponible | Traduccion al ingles | No disponible | Referenciada como modelo base |
| Pantogloss v6 (completa) | No disponible | No disponible | Traduccion al ingles | No disponible | Referenciada solo en la evaluacion |
| Modelos de traduccion externos comparables | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- La calidad varia segun el idioma, el sistema de escritura y el dominio; la denominacion "500-to-English" no implica calidad validada de forma uniforme en 500 idiomas.
- La validacion multilingue documentada cubre 50 idiomas, no 500.
- No realiza deteccion del idioma de origen, por lo que el idioma de entrada debe gestionarse externamente.
- No proporciona puntuaciones de confianza calibradas, lo que dificulta filtrar traducciones dudosas de forma automatica.
- La mayor caida de chrF por idioma respecto a la v7 completa en FP32 se produce en xhosa (-0,7065), por lo que este idioma requiere una revision especifica antes de usarse en produccion.
- No esta pensado para uso medico, legal o de seguridad critica sin revision humana.
- La model card no detalla la arquitectura, el numero de parametros, la longitud de contexto ni el formato de fichero de los pesos, lo que limita la planificacion de despliegues.
- Los corpus de entrenamiento y los ejemplos de evaluacion no se distribuyen con el modelo, lo que impide reproducir las metricas de forma independiente.
- Los pesos se distribuyen por separado del wheel de Python; hay que gestionar la descarga y el almacenamiento del artefacto por separado.
- El modelo esta documentado unicamente en ingles.
- Los metadatos del repositorio indican fechas de creacion y actualizacion en 2026, lo que conviene contrastar con la version real publicada.
- El repositorio no registra descargas ni likes, lo que indica una adopcion practicamente nula y ausencia de validacion por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chrismattmann/pantogloss-500-en-v7-compact
- Modelo base (v7 completa): https://huggingface.co/chrismattmann/pantogloss-500-en-v7
- Repositorio Pantogloss, ruta de experimentos citada por el autor: `training/experiments/successor-v7-compact` (no se proporciona URL)
- Artefactos de atribucion citados en la model card: `NOTICE` y `V7-ATTRIBUTION.md` (no se proporcionan URL)
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo: los resultados obtenidos correspondian a paginas de preguntas y respuestas sin relacion con Pantogloss.
