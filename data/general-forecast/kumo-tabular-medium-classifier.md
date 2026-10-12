# general-forecast/kumo-tabular-medium-classifier

## Resumen

Kumo Tabular medium classifier es un modelo de clasificacion para datos tabulares publicado por el usuario general-forecast en HuggingFace. Se trata de una conversion a formato safetensors de los pesos originales de NVIDIA correspondientes a `medium/classifier.pt`, dentro del repositorio `nvidia/Kumo-Tabular` (revision `3c3e10bbdb590ace29e7026847f92db3c603096d`). La conversion no modifica los pesos: unicamente los renombra segun el esquema de nombres de PyTorch de NVIDIA y los empaqueta para la libreria `gfi` de general-forecast.

El modelo es una red neuronal disenada para tareas de clasificacion tabular, con un total de 61.485.626 parametros. Su salida son probabilidades de clase sobre un maximo de 10 clases, lo que lo situa en el ambito de los clasificadores multiclase aplicados a conjuntos de datos estructurados. Los tags del repositorio indican capacidades de in-context learning sobre datos tabulares, una linea de trabajo que busca aplicar mecanismos de aprendizaje en contexto a tablas en lugar de requerir entrenamiento especifico por tarea.

La relevancia de esta ficha radica en que se trata de una redistribucion tecnica (conversion de formato de pesos) de un modelo propiedad de NVIDIA, publicado bajo licencia OpenMDW 1.1. Conviene tener en cuenta que el repositorio no presenta descargas ni likes, no incluye informacion sobre idiomas soportados ni pipeline declarado, y no aporta resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red neuronal para clasificacion de datos tabulares; no se detalla en la informacion disponible) |
| Parametros totales | 61.485.626 |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | safetensors |

Otros datos de interes: el tamano del repositorio es de 0,2 GB, la libreria asociada es `gfi`, el modelo base declarado es `nvidia/Kumo-Tabular` y la fecha de creacion y ultima actualizacion registrada es 2026-10-11.

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo mas alla de indicar que se trata de una red neuronal que emite probabilidades de clase sobre hasta 10 clases. El modelo se presenta como el componente `medium/classifier.pt` del repositorio `nvidia/Kumo-Tabular`, cuyos tamanos estan definidos en `MODEL_KWARGS["medium"]` dentro del repositorio `NVIDIA/structured-data-models`. No se especifican detalles sobre el tipo de transformer, el mecanismo de atencion, el numero de capas ni la dimension oculta.

Tampoco se proporcionan datos sobre el entrenamiento: no hay informacion sobre el numero de tokens, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas concretas. La unica referencia tecnica adicional es que los tags del repositorio mencionan `in-context-learning` y `tabular`, lo que sugiere que el modelo esta disenado para operar sobre datos tabulares con mecanismos de aprendizaje en contexto. Cualquier afirmacion adicional sobre el proceso de entrenamiento seria especulativa.

## Capacidades

- Clasificacion de datos tabulares: el modelo genera probabilidades de clase sobre un maximo de 10 clases, por lo que cubre tareas de clasificacion multiclase con hasta diez categorias distintas.
- Aprendizaje en contexto sobre tablas: los tags del repositorio indican soporte de in-context learning aplicado a datos estructurados, lo que en principio permitiria alimentar ejemplos de contexto y obtener predicciones sin reentrenar.
- Formato compatible con gfi: los pesos estan empaquetados en safetensors con los nombres de parametros originales de NVIDIA, listos para la libreria `gfi`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multietapa: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta informado).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Clasificacion de riesgo en datos estructurados: el modelo puede asignar registros tabulares (por ejemplo, solicitudes de credito descritas mediante variables numericas y categoricas) a una de hasta 10 clases de riesgo, integrándose en un pipeline de decision automatizada.
- Segmentacion de clientes a partir de tablas de comportamiento: dado un conjunto de variables de uso, facturacion y demografia, el modelo puede predecir la pertenencia a segmentos predefinidos, siempre que el numero de segmentos no supere las 10 clases.
- Deteccion de fraude en transacciones tabulares: clasificacion de transacciones descritas por campos estructurados en categorias como legitima, sospechosa o fraudulenta, aprovechando la salida probabilistica para establecer umbrales de revision manual.
- Prediccion de abandono (churn) en bases de clientes: uso del clasificador sobre tablas de clientes para etiquetar el riesgo de baja en categorias discretas, alimentando campanas de retencion.
- Triaje en entornos clinicos con datos tabulares: clasificacion de registros de pacientes descritos por variables estructuradas en grupos de prioridad, con la salida probabilistica como apoyo a la decision (no como diagnostico autonomo).
- Clasificacion de tickets o incidencias en soporte: asignacion de tickets descritos por metadatos estructurados a una de hasta 10 categorias de incidencia, para su enrutado automatico a los equipos correspondientes.
- Evaluacion de calidad o scoring en procesos industriales: clasificacion de lotes o piezas descritas por medidas de sensores en categorias de conformidad, integrable en sistemas de control de calidad.

En todos los casos, la idoneidad depende de que el numero de clases objetivo no supere el maximo de 10 que emite la red, y de que las variables de entrada puedan representarse en el formato tabular esperado por el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni comparaciones con otros clasificadores tabulares, por lo que no es posible establecer una comparativa rigurosa. El unico modelo explicitamente relacionado es el propio `nvidia/Kumo-Tabular`, del cual este repositorio es una conversion de los pesos `medium/classifier.pt`.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documentan sesgos en la informacion proporcionada.
- Riesgo de alucinacion: no aplica directamente a un clasificador tabular, pero si existe riesgo de clasificaciones erroneas con alta confianza; la salida debe calibrarse y validarse con datos propios.
- Limitacion en el numero de clases: la red emite probabilidades sobre un maximo de 10 clases, lo que restringe su uso a problemas de clasificacion con esa cardinalidad maxima.
- Limitaciones de contexto o idioma: no disponible. El campo de idiomas no esta informado y la longitud de contexto no se especifica.
- Restricciones de licencia: los pesos originales de NVIDIA se distribuyen bajo OpenMDW 1.1, una licencia del tipo "other". Es imprescindible revisar el texto completo de la licencia en el fichero `LICENSE` del repositorio, que conserva el aviso de copyright de NVIDIA, antes de cualquier uso comercial.
- Trazabilidad: se trata de una redistribucion de pesos de terceros; la responsabilidad sobre el comportamiento del modelo recae en el uso que se haga de los pesos originales de NVIDIA, no en la conversion de formato.
- Madurez del repositorio: el modelo registra 0 descargas y 0 likes, sin pipeline declarado ni benchmarks publicados, lo que limita la evidencia disponible sobre su rendimiento en produccion.
- Requisitos de hardware: no disponible en la informacion proporcionada. Con 61,5 millones de parametros, la huella de memoria es reducida, pero no se ofrecen datos oficiales de VRAM, latencia ni throughput.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/general-forecast/kumo-tabular-medium-classifier
- Modelo base (NVIDIA Kumo-Tabular): https://huggingface.co/nvidia/Kumo-Tabular
- Repositorio de codigo NVIDIA structured-data-models: https://github.com/NVIDIA/structured-data-models
- Libreria gfi: https://github.com/generalforecast/gfi
