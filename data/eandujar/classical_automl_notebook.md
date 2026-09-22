# eandujar/classical_automl_notebook

## Resumen

`eandujar/classical_automl_notebook` no es un modelo de lenguaje: es un artefacto de AutoML tabular publicado en HuggingFace por el usuario `eandujar`. Contiene el mejor modelo seleccionado por AutoGluon para una tarea de clasificacion binaria sobre un dataset tabular de Pokémon (151 registros de Pokémon tratados como filas de una tabla), con la metrica de seleccion "balanced accuracy" y la columna objetivo `label` (clase positiva `1`). Segun la model card, el mejor modelo resultante es un `LightGBM`, es decir, un algoritmo de gradient boosting sobre arboles de decision, no una red neuronal ni un transformer.

El contexto de publicacion es claramente educativo: el identificador del dataset (`pakiino/2026-24679-pokemon-151-tabular-hw1`) y la etiqueta `education` apuntan a un trabajo practico de asignatura sobre pipelines clasicos de AutoML. El repositorio tiene 0 descargas y 0 likes, un tamano reportado de 0.0 GB y no declara licencia ni idiomas, por lo que no debe considerarse un modelo listo para produccion ni un componente reutilizable sin verificacion previa.

Su relevancia es, por tanto, acotada: sirve como ejemplo reproducible del flujo "entrenar con AutoGluon, seleccionar el mejor modelo por validacion, subir el predictor a HuggingFace y cargarlo con `TabularPredictor.load`". Como referencia tecnica de arquitecturas de IA generativa no aporta nada, pero si ilustra el patron de empaquetado y carga de predictores tabulares desde el Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting sobre arboles de decision (LightGBM), gestionado por el framework AutoGluon; no es un transformer |
| Parametros totales | no disponible (los modelos de arboles no se describen en numero de parametros; no se publica el numero de arboles ni de hojas) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin ventana de contexto) |
| Tipos de cuantizacion | no aplica / no disponible (no se publican variantes cuantizadas GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponibles (no procesa texto libre; consume caracteristicas tabulares) |
| Licencia | no disponible |
| Formato de pesos | Artefactos de AutoGluon cargables con `TabularPredictor.load`; no se distribuyen pesos en safetensors, GGUF ni ONNX |
| Tipo de tarea | Clasificacion binaria tabular |
| Variable objetivo | `label`, clase positiva `1` |
| Metrica de seleccion | Balanced accuracy (sobre el split de validacion proporcionado) |
| Framework | AutoGluon (`library_name: autogluon`) |
| Dataset de entrenamiento | `pakiino/2026-24679-pokemon-151-tabular-hw1` |
| Tamano del repositorio | 0.0 GB segun HuggingFace |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-22 |
| Region declarada | us |

## Arquitectura y entrenamiento

La arquitectura subyacente es un ensamblado de gradient boosting con LightGBM, uno de los learners clasicos que AutoGluon entrena por defecto para datos tabulares. AutoGluon automatiza el preprocesado de caracteristicas, la seleccion de modelos candidatos y, opcionalmente, el apilado (stacking) y el bagging de varios modelos; de todo ese proceso solo se conserva en el repositorio el modelo ganador y los ficheros necesarios para su inferencia, tal como indica la model card. No se especifica el numero de estimadores, la profundidad, la tasa de aprendizaje, el espacio de busqueda explorado ni el conjunto de caracteristicas utilizado.

Respecto a los datos, la unica informacion disponible es el enlace al dataset de HuggingFace y su tematica (Pokémon 151). No se documentan el numero de filas, el numero de caracteristicas, la proporcion entre clases, la existencia de valores nulos ni el metodo de particion entre entrenamiento y validacion, mas alla de la mencion a "the provided validation split". No hay evidencia de tecnicas de regularizacion, calibracion, ajuste de umbral ni de validacion cruzada mas alla de la que AutoGluon aplique internamente por defecto.

La model card declara un rendimiento de test de `1` con balanced accuracy. Ese valor, sin mas contexto, es altamente sospechoso: en un problema de clasificacion binaria real es compatible con fuga de informacion (leakage), con un conjunto de test trivial o con una metrica mal calculada. No debe interpretarse como una capacidad de generalizacion demostrada.

## Capacidades

- Prediccion de una etiqueta binaria (`0`/`1`) a partir de un registro tabular con el mismo esquema de caracteristicas que el dataset de entrenamiento.
- Integracion con el ecosistema AutoGluon mediante `TabularPredictor.load`, lo que permite invocar `predict` y `predict_proba` sobre un `DataFrame` de pandas.
- Seleccion de modelo basada en balanced accuracy sobre validacion, util como plantilla de comparacion entre learners clasicos (LightGBM, CatBoost, XGBoost, redes tabulares) dentro del mismo framework.
- Ejecucion en CPU, sin requisitos de acelerador, lo que la hace apta para entornos docentes o de integracion continua ligeros.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio ni capacidades multimodales.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: no procesa lenguaje natural, solo columnas tabulares.
- No dispone de modo de pensamiento (thinking mode) ni de decodificacion especulativa.

## Casos de uso

- Docencia de AutoML: el repositorio sirve como ejemplo completo y minimo del ciclo "entrenar con AutoGluon, conservar solo el mejor modelo, publicarlo en el Hub y cargarlo desde otro entorno". Se usaria en un aula o tutorial para que el alumnado reproduzca el flujo con su propio dataset.
- Plantilla de entrega de practicas: un estudiante puede clonar la estructura (dataset en el Hub, predictor en el Hub, README con metrica y variable objetivo) para entregar su propio trabajo de clasificacion tabular sin tener que disenar el empaquetado desde cero.
- Baseline de comparacion en experimentos tabulares: al ser un LightGBM seleccionado por AutoGluon, permite fijar una referencia rapida frente a alternativas mas costosas (redes tabulares, ensembles manuales) sobre el mismo split de validacion.
- Pruebas de integracion del stack de HuggingFace: sirve para verificar que `snapshot_download` mas `TabularPredictor.load` funcionan en un entorno concreto (versiones de `autogluon`, `lightgbm`, pandas y numpy compatibles), ya que es un artefacto pequeno y de carga rapida.
- Clasificacion sobre datos tabulares con estructura identica: si se dispone de un dataset con las mismas columnas que el dataset de Pokemon 151, el predictor podria aplicarse directamente; en cualquier otro caso requeriria reentrenamiento.
- Demostracion de riesgos de metricas enganosas: el valor de balanced accuracy reportado (1) es un caso de estudio util para explicar en clase por que hay que auditar splits, fugas de informacion y calculo de metricas antes de creer un resultado perfecto.
- Prototipado en CPU sin GPU: cualquier escenario donde no haya acelerador disponible y se necesite un clasificador binario tabular rapido de entrenar y de inferir, siempre que el esquema de datos encaje.

## Benchmarks y rendimiento

La unica cifra declarada en la model card es un rendimiento de test de balanced accuracy igual a 1, obtenido con LightGBM sobre el split proporcionado. No se publican resultados de MMLU, HumanEval, GSM8K ni de ningun benchmark estandar, porque no son aplicables a un modelo tabular.

| Metrica | Valor declarado | Conjunto | Nota |
|---|---|---|---|
| Balanced accuracy | 1 | Test (split proporcionado por el dataset) | Valor declarado por el autor; no verificable y compatible con fuga de informacion o particion trivial |
| Comparacion con otros learners | no disponible | no disponible | La model card indica que LightGBM fue el mejor, pero no publica la tabla completa de candidatos de AutoGluon |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU. Es un modelo de arboles evaluado en CPU; el consumo de memoria depende del numero de arboles y de hojas (no publicado) y del tamano del lote de inferencia.
- GPU recomendadas: no aplica. No hay backend de GPU documentado para este artefacto.
- Compatibilidad con GPU de consumo: irrelevante, ya que no necesita acelerador; cabe en cualquier maquina capaz de ejecutar Python y LightGBM.
- Memoria RAM estimada: no disponible; para un dataset de 151 registros y un solo modelo LightGBM el consumo esperable es de decenas o centenas de megabytes, pero no hay medicion publicada.
- Opciones de despliegue: AutoGluon (`TabularPredictor.load`) es la via documentada; el artefacto no se distribuye en formatos de servidores de inferencia habituales para LLM (vLLM, TGI, Ollama, llama.cpp) ni en ONNX, por lo que esas opciones no aplican sin conversion previa, que no esta documentada.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempos de inferencia.
- Almacenamiento: el repositorio reporta 0.0 GB, lo que sugiere que los artefactos pueden ser minimos o no estar efectivamente subidos; conviene verificar el contenido real antes de planificar un despliegue.

## Comparativa con modelos similares

| Alternativa | Naturaleza | Parametros | Contexto | Licencia | Disponibilidad | Comentario |
|---|---|---|---|---|---|---|
| `eandujar/classical_automl_notebook` (LightGBM via AutoGluon) | Clasificador tabular binario | no disponible | no aplica | no disponible | Publico en HuggingFace, 0 descargas | Artefacto educativo, sin metrica reproducible |
| XGBoost como learner de AutoGluon | Clasificador tabular | no disponible | no aplica | Apache 2.0 tipicamente (verificar version) | Amplia, via AutoGluon o el propio paquete | Alternativa directa; requiere reentrenar sobre el mismo dataset |
| CatBoost | Clasificador tabular con soporte nativo de categoricas | no disponible | no aplica | Apache 2.0 tipicamente (verificar version) | Amplia | Suele destacar con variables categoricas, frecuentes en datasets de este tipo |
| Red neuronal tabular (por ejemplo, un MLP sencillo) | Red neuronal feed-forward | no disponible | no aplica | Depende de la implementacion | Amplia | Alternativa mas costosa de ajustar y habitualmente no superior a GBDT en tabular de bajo tamano |

No se dispone de numeros de rendimiento comparativos publicados para este artefacto, por lo que la comparacion anterior es cualitativa. Los valores de licencia de las alternativas deben verificarse en sus repositorios oficiales antes de cualquier uso.

## Limitaciones y advertencias

- No es un modelo de lenguaje y no puede realizar ninguna tarea de generacion, razonamiento o conversacion, pese a estar alojado en HuggingFace.
- El rendimiento declarado de balanced accuracy igual a 1 es implausible en un problema real y sugiere fuga de informacion, particion incorrecta o calculo erroneo de la metrica. No debe citarse como resultado valido sin auditoria.
- No se declara licencia, lo que impide determinar si su uso comercial esta permitido. En ausencia de licencia explicita, la situacion juridica es indeterminada.
- El repositorio reporta 0.0 GB de tamano; es posible que los artefactos del modelo no esten efectivamente disponibles y que la carga falle. Conviene comprobar el contenido del repositorio antes de depender de el.
- Dependencia fuerte del esquema de datos: solo es aplicable a tablas con las mismas columnas y el mismo preprocesado; no hay documentacion del pipeline de caracteristicas, lo que dificulta reutilizarlo fuera de su dataset original.
- Sesgos: el dataset es una seleccion de 151 Pokémon, no una muestra representativa de ningun fenomeno real; cualquier patron aprendido es propio del conjunto y puede incorporar sesgos de diseno de la tabla.
- Riesgo de sobreajuste: sin informacion sobre numero de filas, cardinalidad de caracteristicas ni estrategia de validacion, no puede descartarse que el modelo memorice el conjunto de entrenamiento.
- Sin garantias de mantenimiento: 0 descargas, 0 likes y una unica actualizacion el mismo dia de creacion indican un artefacto de un solo uso, no un proyecto sostenido.
- No apto para produccion sin reentrenamiento, validacion propia, calibracion de umbral y definicion de contrato de datos.
- Compatibilidad de versiones no documentada: la carga con `TabularPredictor.load` puede fallar si la version de AutoGluon o de LightGBM difiere de la usada en el entrenamiento.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/eandujar/classical_automl_notebook
- Dataset de entrenamiento: https://huggingface.co/datasets/pakiino/2026-24679-pokemon-151-tabular-hw1
- Documentacion oficial de AutoGluon (framework indicado en `library_name`): https://auto.gluon.ai
- Repositorio de LightGBM (algoritmo del mejor modelo reportado): https://github.com/microsoft/LightGBM

Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo ni sobre su dataset; los enlaces devueltos (GitHub CLI, contenidos de Zhihu, `claude-mem`, `claudian`) no guardan relacion con el artefacto y se han descartado. No se dispone de paper, blog tecnico ni demo asociados.
