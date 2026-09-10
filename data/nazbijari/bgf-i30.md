# nazbijari/bgf-i30

## Resumen

BioGeoFormer 30% (identificador `nazbijari/bgf-i30`) es un modelo publicado en HuggingFace por el usuario `nazbijari`, con pipeline declarado de `text-classification` y arquitectura etiquetada como `cyc-esm`. El autor lo describe en la model card unicamente como "BioGeoFormer 30% model" y remite a un articulo en bioRxiv, sin aportar mas detalles tecnicos. El repositorio ocupa 0,3 GB y contiene pesos en formato `safetensors` con 74.817.326 parametros totales (aproximadamente 74,8 millones), un orden de magnitud propio de un modelo compacto orientado a clasificacion mas que a generacion.

Por el nombre y la etiqueta `cyc-esm`, todo apunta a un modelo de la familia ESM (Evolutionary Scale Modeling) aplicado a secuencias biologicas, con algun tipo de variante ciclica o customizada, y a una version escalada al 30 % respecto al modelo completo de referencia. Sin embargo, esta interpretacion no esta confirmada por ninguna fuente: ni la model card, ni la informacion de HuggingFace, ni los resultados de la busqueda web permiten verificar la arquitectura real, el dominio de aplicacion exacto ni el procedimiento de entrenamiento.

La relevancia de esta ficha es, por tanto, limitada y fundamentalmente descriptiva: el modelo acumula 0 descargas y 0 likes, no declara licencia ni idiomas, y no publica resultados de benchmarks. Cualquier evaluacion en produccion deberia partir de una inspeccion del codigo `custom_code` incluido en el repositorio y de la lectura del paper referenciado, no de la informacion disponible en el hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `cyc-esm` en el hub, sin confirmar; sugiere variante de ESM) |
| Parametros totales | 74.817.326 (aproximadamente 74,8 M) |
| Parametros activos | no aplica / no disponible (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene `safetensors`; no se publican pesos GGUF, ONNX ni cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (+ `custom_code`; requiere `trust_remote_code`) |
| Pipeline declarado | text-classification |
| Tamano del repositorio | 0,3 GB |
| Fecha de creacion en el hub | 2026-09-10 |
| Ultima actualizacion en el hub | 2026-09-10 |

## Arquitectura y entrenamiento

No se dispone de informacion verificada sobre la arquitectura. La unica pista es la etiqueta `cyc-esm` asociada al repositorio y el nombre del modelo, que apuntan a una variante de la familia ESM (modelos transformer entrenados sobre secuencias de proteinas mediante enmascarado de tokens) con alguna modificacion propia, posiblemente orientada a relaciones ciclicas o geograficas dada la denominacion "BioGeoFormer". El sufijo "30 %" de la model card sugiere una version reducida en profundidad o en anchura respecto a un modelo base mayor, pero no se especifica sobre que configuracion de referencia se ha aplicado esa reduccion ni que capas se han eliminado.

Tampoco hay datos sobre el corpus de entrenamiento: no se indica el numero de tokens, la composicion del dataset, ni si se emplearon tecnicas de ajuste como RLHF, DPO o fine-tuning supervisado. Dado que el pipeline declarado es de clasificacion y no de generacion, lo mas probable es que se trate de un encoder entrenado con un objetivo de modelado enmascarado y posteriormente ajustado para una tarea concreta de etiquetado, pero esto es una inferencia, no un dato confirmado. El unico elemento que podria aclararlo es el articulo en bioRxiv referenciado en la model card, que no forma parte de la informacion proporcionada.

## Capacidades

No se ha publicado documentacion de capacidades en la informacion disponible. A partir de los metadatos del hub puede afirmarse unicamente lo siguiente:

- Clasificacion de texto: el pipeline declarado es `text-classification`, por lo que el modelo devuelve etiquetas (y previsiblemente puntuaciones asociadas) sobre una entrada textual.
- Dominio probablemente biologico: el nombre "BioGeoFormer" y la etiqueta `cyc-esm` apuntan a secuencias biologicas o a datos con componente geografica, sin confirmacion oficial.
- Codigo personalizado: el repositorio incluye `custom_code`, lo que implica que el modelo no puede cargarse con una clase estandar de `transformers` sin `trust_remote_code=True`.
- Generacion de texto: no disponible; no hay evidencia de que sea un modelo generativo.
- Razonamiento, matematicas, codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

Los siguientes escenarios son planteamientos condicionales, coherentes con un modelo de 74,8 M de parametros orientado a clasificacion, pero no estan respaldados por documentacion del autor. Deben validarse empiricamente antes de cualquier uso real.

- Anotacion automatica de grandes volumenes de secuencias biologicas: si el modelo es efectivamente una variante de ESM para clasificacion, su tamano (74,8 M de parametros) permite procesar millones de secuencias en GPU consumer con un coste por inferencia muy bajo, algo impracticable con modelos de cientos de millones o miles de millones de parametros.
- Prefiltrado en pipelines de analisis bioinformatico: emplearlo como primer clasificador que descarta o prioriza candidatos antes de pasar por herramientas mas costosas (alineamiento multiple, busquedas BLAST, simulaciones), reduciendo el computo total del pipeline.
- Etiquetado de datos para entrenar modelos mayores: usar sus predicciones como pseudo-etiquetas en un esquema de destilacion o weak supervision, aprovechando la velocidad de un modelo pequeno.
- Clasificacion en entornos con recursos limitados o edge: con pesos de unos 150 MB en fp16, es viable ejecutarlo en CPU, en un portatil o incluso en un dispositivo embebido con suficiente RAM, sin GPU dedicada.
- Analisis por lotes en investigacion academica: integrarlo en un script de Python con la libreria `transformers` para clasificar datasets completos de forma reproducible, dejando registro de la version del modelo y del codigo personalizado asociado.
- Servicio de inferencia de baja latencia sobre CPU: desplegarlo con `ONNX Runtime` o un servidor `FastAPI` detras de un endpoint HTTP, donde su reducido tamano permite escalar horizontalmente con muchas replicas baratas.
- Extraccion de representaciones para tareas posteriores: si la arquitectura es de tipo encoder, las activaciones de las capas intermedias podrian reutilizarse como embeddings para clustering, busqueda por similitud o entrenamiento de clasificadores lineales sobre nuevas etiquetas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de evaluacion, la model card se limita a una linea descriptiva y la busqueda web no ha devuelto ningun resultado relacionado con el modelo (los unicos resultados obtenidos corresponden a herramientas de medicion de velocidad de red, sin relacion alguna). No se deben asumir cifras de MMLU, HumanEval, GSM8K ni de benchmarks especificos de proteinas como ProteinGym o CASP.

## Requisitos de hardware

- VRAM estimada para inferencia, solo pesos: aproximadamente 300 MB en fp32 (74,8 M de parametros x 4 bytes), unos 150 MB en fp16/bf16 y unos 75 MB en int8. El tamano del repositorio en el hub (0,3 GB) es coherente con pesos en fp32.
- Memoria total: hay que sumar activaciones, buffers del runtime y el propio entorno de Python y PyTorch; en la practica, cualquier maquina con 2 GB de RAM libre es suficiente.
- GPU recomendadas: no requiere GPU dedicada. Cualquier GPU consumer, incluida una GTX 1050 o una grafica integrada reciente, es suficiente. Modelos como RTX 4090, A100 o H100 estan sobredimensionados para una sola peticion y solo tienen sentido si se busca throughput masivo en lote.
- Compatibilidad con GPU consumer: si, en todas las gamas actuales, y tambien en CPU. Es un modelo holgadamente desplegable en hardware de consumo.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")` y `trust_remote_code=True` (obligatorio por el `custom_code`); `ONNX Runtime` o `torch.compile` para reducir latencia; TorchServe o un servidor `FastAPI` + `uvicorn` para exposicion como servicio. Los servidores orientados a generacion (vLLM, TGI) no son la via natural para un modelo de clasificacion y su soporte depende de que la arquitectura concrete sea compatible.
- Cuantizacion: no hay pesos GGUF ni ONNX publicados; una conversion a int8 o int4 habria que realizarla a mano y validar la perdida de exactitud, que en un encoder de 74,8 M puede ser apreciable.
- Latencia y throughput: no disponible. No se han publicado mediciones del autor ni de terceros.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. No se ha confirmado la arquitectura del modelo, su tarea exacta ni su licencia, por lo que cualquier tabla de comparacion con alternativas de la misma categoria seria especulativa. No se dispone de modelos comparables identificados a partir de la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| nazbijari/bgf-i30 (BioGeoFormer 30 %) | 74.817.326 | no disponible | no disponible | HuggingFace, 0 descargas, 0 likes | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica referencia externa documentada es el articulo de bioRxiv enlazado desde la model card, cuya lectura seria el punto de partida obligado para identificar los modelos base y las lineas de comparacion adecuadas.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card consta de una sola frase ("BioGeoFormer 30% model") y un enlace a un paper. No hay descripcion de la tarea, del formato de entrada, del conjunto de etiquetas ni de las metricas.
- Licencia no declarada: sin licencia explicita, no puede asumirse permiso de uso comercial. Su utilizacion en productos o servicios conlleva un riesgo legal directo hasta que el autor aclare los terminos.
- Idiomas no declarados: se desconoce si el modelo procesa castellano, ingles o exclusivamente secuencias biologicas. No debe asumirse soporte multilingue.
- Codigo personalizado: el repositorio incluye `custom_code`, lo que obliga a ejecutar con `trust_remote_code=True`. Esto implica cargar y ejecutar codigo arbitrario del autor en el entorno local; conviene auditar los ficheros `.py` del repositorio antes de usarlo, especialmente en produccion.
- Sin evidencia de adopcion ni validacion por terceros: 0 descargas y 0 likes en el momento de la consulta, lo que implica que no hay senales externas de calidad, reproducibilidad ni correccion.
- Riesgo de sobreajuste o degradacion por el recorte al 30 %: si el sufijo "30 %" indica una version reducida de un modelo mayor, es esperable una perdida de rendimiento respecto al original, sin que existan datos publicados que la cuantifiquen.
- Fecha de publicacion atipica (2026-09-10) y actualizacion en el mismo dia: el repositorio parece un volcado puntual sin mantenimiento posterior ni historial de revisiones.
- Riesgo de alucinacion: no aplicable en sentido estricto si el uso es de clasificacion, pero relevante si en la practica el modelo emitiera texto libre. En cualquier caso, un clasificador puede producir etiquetas con alta confianza y ser incorrecto; no debe usarse como unica fuente de decision en contextos criticos (diagnostico, decisiones regulatorias, bioseguridad).
- Sesgos: no disponibles. Al no documentarse el corpus de entrenamiento, no puede evaluarse el sesgo de muestreo, el desbalanceo de clases ni la cobertura taxonomica o geografica de los datos.
- Busqueda web sin resultados utiles: las consultas realizadas no han devuelto ninguna fuente independiente sobre este modelo, por lo que no hay corroboracion externa de ninguna afirmacion de esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nazbijari/bgf-i30
- Articulo referenciado en la model card (bioRxiv): https://www.biorxiv.org/content/10.64898/2025.12.17.695047v1
- No se han encontrado otros enlaces relevantes (repositorios de codigo, demos, blogs o documentacion adicional) en la busqueda web realizada.
