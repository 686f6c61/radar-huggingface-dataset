# atmem/laya-memory-decision-selective-v3-research

## Resumen

El modelo `atmem/laya-memory-decision-selective-v3-research` es un checkpoint de tipo clasificador de texto desarrollado por el usuario atmem, afinado a partir de `convaiinnovations/laya-multilingual`. Su proposito es resolver una unica decision acotada dentro de un sistema de memoria conversacional: elegir entre `STORE_NEW` (crear memoria durable) o `DO_NOT_STORE` (no crear memoria persistente) a partir de una observacion y del estado de memoria recuperado en el mismo ambito. No genera texto de memoria ni escribe, actualiza, sustituye u olvida entradas: solo emite un vector de probabilidades sobre opciones definidas por el host.

El punto relevante de esta publicacion es que se trata de un **candidato rechazado**. El propio autor lo marca como `rejected-candidate` y `research-only`, y advierte explicitamente de que no debe activarse como autoridad automatica de memoria. Durante la validacion el modelo devolvio `DO_NOT_STORE` en la practica totalidad de los casos, con un recall muy pobre de la clase positiva (`STORE_NEW`), por lo que su utilidad es la reproducibilidad del resultado negativo y el estudio del contrato de comunicacion, no el despliegue en produccion.

El repo ocupa aproximadamente 0,7 GB y el modelo trabaja con un presupuesto de servicio de 1.024 tokens por ejemplo. Se distribuye bajo licencia Apache 2.0, con 0 descargas y 0 me gusta en el momento de la consulta. El modelo base es multilingue segun los tags, aunque no se especifican los idiomas concretos soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune del modelo base `convaiinnovations/laya-multilingual`; libreria declarada: `laya`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | presupuesto de servicio de 1.024 tokens por ejemplo (segun la model card; la ventana nativa del modelo base no se especifica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | multilingue segun tags; idiomas concretos no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint parte de `convaiinnovations/laya-multilingual` (commit `1720e3e3357cfe1e281542e223f8273b0890ca34`) y se presenta como un modelo de clasificacion por eleccion (`pipeline_tag: text-classification`) que recibe una peticion JSON versionada (`laya-evaluation-request-v2`, esquema 2.0.0) y devuelve una respuesta tambien JSON (`laya-choice-response-v2`) con una opcion seleccionada, un vector de probabilidades y una puntuacion de confianza. La tarea se formula como una pregunta de eleccion multiple (`formation.joint_transition.v3`) con dos opciones, cuyo significado debe fijar el host mediante el enlace opaco de opciones. No se detalla la arquitectura interna del modelo base (tipo de transformer, atencion, etc.) ni el numero de parametros.

El entrenamiento se realizo sobre el dataset `atmem/stateful-memory-transitions-selective-v3-research` (commit `f46cdcd23c189cacdaa68abd2ec780752227e9f4`), con objetivo de entropia cruzada suave, una sola epoca y semilla `410239`, ejecutado en Apple MPS. La model card advierte de que la determinacion de `scatter-reduce` en MPS no esta disponible y se registro solo como aviso. Solo se usaron conversaciones fuente autenticas: no se emplearon conversaciones generadas, LoCoMo, traducciones ni etiquetas de test sellado. La politica de empaquetado exacto excluyo 218 ejemplos de entrenamiento, 49 de validacion y 58 de calibracion por superar el presupuesto de 1.024 tokens antes de la optimizacion o el scoring.

La cobertura retenida de entrenamiento fue de 1.647 trayectorias `DO_NOT_STORE` frente a 50 de `STORE_NEW`, por debajo del minimo de activacion de 100 trayectorias para la clase positiva. No se emitio ningun paquete de calibracion porque fallaron las puertas de cobertura semantica y de desbordamiento. El hash SHA-256 de los pesos es `93f1d0c623b956fbe9c92a25b57b4298a08ff8bf5e0b7f182635361d2c304104` y el tiempo de entrenamiento registrado fue de 1.136,37 segundos.

## Capacidades

- Clasificacion binaria de decision de memoria: distingue entre `STORE_NEW` y `DO_NOT_STORE` a partir de una observacion y del estado de memoria recuperado.
- Salida estructurada con probabilidades por opcion y puntuacion de confianza (`choice`, `probabilities`, `confidence`).
- Contrato de comunicacion JSON versionado (`laya-evaluation-request-v2` / `laya-choice-response-v2`) con `request_id`, `scope_id` y `canonical_generation`.
- Enlace opaco de opciones: el modelo no fija el significado de las opciones, lo determina el host de la peticion.
- Soporte multilingue declarado mediante tags; idiomas concretos no disponibles.
- Capacidad de trabajar con memorias recuperadas en el mismo ambito (`retrieved_memories`), aunque el modelo no las escribe ni las modifica.
- No soporta tool calling, function calling ni orquestacion de agentes segun la informacion disponible.
- No genera texto canonico de memoria ni ejecuta operaciones de actualizacion, supersesion, olvido o borrado.
- No se documentan capacidades de vision, audio, codigo ni matematicas.

## Casos de uso

- Reproduccion de resultados negativos en investigacion: permite replicar el experimento completo (dataset, semilla, hashes y metricas) para estudiar por que un afinado selectivo de decision de memoria no supera a una politica determinista.
- Estudio del contrato de comunicacion V2: sirve como banco de pruebas para validar esquemas JSON versionados, enlaces opacos de opciones y validacion de vectores de probabilidad en un host externo.
- Analisis de calibracion en clasificadores de decision: las metricas de Brier score y ECE publicadas (0,0727 y 0,0361) permiten comparar tecnicas de calibracion sobre una tarea de decision acotada.
- Investigacion sobre desbalanceo extremo de clases: el dataset contiene 1.647 trayectorias negativas frente a 50 positivas, lo que lo convierte en un caso de estudio util para tecnicas de sobremuestreo, ponderacion o aumento de datos.
- Evaluacion de sesgo de prediccion en politicas conservadoras: el modelo predice `DO_NOT_STORE` de forma casi sistematica, lo que resulta util para medir el coste de un falso negativo en sistemas de memoria.
- Docencia y formacion en evaluacion de modelos: la model card documenta de forma explicita puertas de calidad fallidas (cobertura semantica, desbordamiento de tokens, minimo de activacion) que sirven como ejemplo de criterios de aceptacion reproducibles.
- Pruebas de integracion de latencia en pipelines de decision: la rejugada operativa reporta latencias medianas de 45,26 ms y p95 de 52,84 ms, utiles para dimensionar un paso de decision en un flujo mayor.

## Benchmarks y rendimiento

Subconjunto de validacion autentica que cabe en el presupuesto de servicio:

| Medida | Laya original | Candidato afinado |
|---|---:|---:|
| Transiciones evaluadas | 423 | 423 |
| Exactitud (accuracy) | 72,34 % | 96,22 % |
| Macro-F1 | 0,443 | 0,627 |
| Brier score | 0,3978 | 0,0727 |
| ECE | 0,0830 | 0,0361 |
| Predicciones `STORE_NEW` | 105 | 4 |

Rejugada operativa congelada de 100 elementos:

| Medida | Determinista | Laya original | Candidato afinado |
|---|---:|---:|---:|
| Acuerdo exacto de politica / 100 | 30 | 30 | 20 |
| STORE correcto / 25 | 25 | 0 | 0 |
| DO_NOT_STORE correcto / 20 | 5 | 0 | 20 |
| UPDATE correcto / 15 | 0 | 0 | 0 |
| DUPLICATE correcto / 10 | 0 | 0 | 0 |
| REVIEW correcto / 30 | 0 | 30 | 0 |
| Latencia mediana extremo a extremo | 3,15 ms | 45,35 ms | 45,26 ms |
| Latencia p95 extremo a extremo | 4,73 ms | 52,55 ms | 52,84 ms |

Segun la model card, solo se recuperaron aproximadamente 3 de los 18 ejemplos positivos de validacion. La mejora agregada aparente procede sobre todo de una mayor precision en `DO_NOT_STORE`, no de un buen recall de memoria durable. El candidato afinado devolvio `DO_NOT_STORE` en los 100 casos operativos. El corpus operativo es un reto de politica creado por el mantenedor y no un benchmark cientifico independiente; su valor es el de prueba de regresion de producto emparejada.

## Requisitos de hardware

- El repositorio ocupa 0,7 GB, por lo que el checkpoint completo es manejable en memoria de un solo dispositivo, aunque no se publican parametros ni precision de pesos.
- No se especifican requisitos de VRAM; no disponible.
- GPU recomendadas: no disponibles. El autor indica que el entrenamiento se ejecuto en Apple MPS.
- Compatibilidad con GPU de consumo: probablemente viable dada la ausencia de GPU de datacenter en el entrenamiento y el tamano del repo, aunque no hay confirmacion oficial ni cifras de VRAM.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. La libreria declarada es `laya` y los pesos estan en safetensors, por lo que el despliegue depende del soporte de esa libreria.
- Latencia reportada en el rejugado operativo: mediana de 45,26 ms y p95 de 52,84 ms extremo a extremo en el entorno de prueba del autor. No se publican cifras de throughput.
- No se ofrece paquete de calibracion ni artefactos adicionales de despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `atmem/laya-memory-decision-selective-v3-research` | no disponible | presupuesto de servicio de 1.024 tokens | Exactitud 96,22 %, Macro-F1 0,627 en validacion; 0 aciertos `STORE_NEW` en la rejugada operativa | Apache 2.0 | Publico en HuggingFace, 0 descargas |
| `convaiinnovations/laya-multilingual` (modelo base) | no disponible | no disponible | Exactitud 72,34 %, Macro-F1 0,443 en validacion; 30/100 de acuerdo de politica | no disponible | Publico en HuggingFace |
| Politica determinista AtMem | no aplica | no aplica | 30/100 de acuerdo de politica; 25/25 `STORE` correctos; latencia mediana 3,15 ms | no aplica | Interna del proyecto AtMem |

No se dispone de informacion sobre otros modelos comparables en la misma categoria de decision de memoria selectiva.

## Limitaciones y advertencias

- Modelo rechazado para activacion automatica: la propia model card indica que no debe habilitarse como autoridad automatica de memoria.
- Predice `DO_NOT_STORE` con demasiada frecuencia; en la rejugada operativa devolvio esa opcion en los 100 casos.
- El recall de la clase positiva es muy bajo: solo se recuperaron unos 3 de 18 ejemplos positivos de validacion.
- La clase positiva de entrenamiento (50 trayectorias `STORE_NEW`) queda por debajo del minimo de activacion de 100 trayectorias declarado por el autor.
- No se emitio paquete de calibracion porque fallaron las puertas de cobertura semantica y de desbordamiento.
- Determinismo limitado: la ejecucion en Apple MPS registra la indisponibilidad de determinacion en `scatter-reduce` como aviso.
- Cobertura reducida por la politica de empaquetado: 218 ejemplos de entrenamiento, 49 de validacion y 58 de calibracion quedaron excluidos por superar los 1.024 tokens.
- El corpus de la rejugada operativa es un reto de politica creado por el mantenedor, no un benchmark cientifico independiente.
- El modelo no cubre las transiciones `UPDATE`, `DUPLICATE` ni `REVIEW`: en la rejugada obtuvo 0 aciertos en las tres.
- Riesgo de alucinacion no evaluado en esta ficha; el modelo no genera texto libre, solo emite una eleccion y probabilidades.
- Idiomas concretos no especificados pese al tag `multilingual`; no se puede garantizar cobertura linguistica.
- Licencia Apache 2.0, que en principio permite uso comercial, pero el tag `research-only` y el estado de candidato rechazado desaconsejan su uso en produccion.
- Sin descargas ni validacion por parte de terceros en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/atmem/laya-memory-decision-selective-v3-research
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Dataset de entrenamiento: https://huggingface.co/datasets/atmem/stateful-memory-transitions-selective-v3-research
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente paginas del videojuego "Prototype" en jeuxvideo.com, sin relacion con este modelo.
