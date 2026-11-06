# chiru112/ec-knn-rr3

## Resumen

`ec-knn-rr3` es un artefacto publicado en Hugging Face por el usuario `chiru112` bajo el identificador `chiru112/ec-knn-rr3`, orientado a la prediccion de numeros EC (Enzyme Commission) para la tarea de clasificacion enzimatica "Leak CURBER". No se trata de un modelo de lenguaje neuronal en el sentido habitual, sino de un pipeline de recuperacion y reordenacion basado en busqueda por similitud de secuencias con MMseqs2 sobre un indice preconstruido del conjunto de entrenamiento, combinado con un pequeno re-ranker de gradient boosting (cuando se incluye) o con una votacion ponderada por bit-score.

El sistema funciona en CPU exclusivamente. Para cada entrada unica realiza una busqueda MMseqs2 contra el conjunto de entrenamiento completo, extrae los EC candidatos de los hits superiores y selecciona el primer EC mediante el re-ranker o la votacion ponderada. La salida es una lista ordenada de mejor a peor. Las entradas sin hit reciben el EC mas frecuente del conjunto de entrenamiento, y un mecanismo de guarda temporal detiene la busqueda de forma anticipada, asignando el EC de reserva a las entradas restantes (las mas largas) si la maquina es lenta.

La relevancia de este artefacto es acotada: se trata de una entrega de competicion o benchmark interno, sin model card detallada, sin licencia declarada y sin resultados publicados. Su interes practico reside en la reproducibilidad del pipeline de recuperacion (MMseqs2 + re-ranker) para anotacion enzimatica a gran escala en entornos sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de recuperacion por similitud de secuencias (MMseqs2) con re-ranker de gradient boosting o votacion ponderada por bit-score |
| Parametros totales | no disponible (el re-ranker es un modelo de gradient boosting de tamano no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; procesa secuencias proteicas de longitud variable) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la entrada son secuencias de proteinas, no texto) |
| Licencia | no disponible |
| Formato de pesos | no disponible; el repositorio ocupa 1,6 GB e incluye un indice MMseqs2 preconstruido y, segun la model card, un posible re-ranker |

## Arquitectura y entrenamiento

La arquitectura no es un transformer ni un modelo generativo: es un sistema de recuperacion (retrieval) en dos etapas. La primera etapa consiste en una busqueda MMseqs2 de cada secuencia de entrada unica contra un indice preconstruido del conjunto de entrenamiento completo. La segunda etapa toma los EC de los hits superiores y los reordena mediante un clasificador de gradient boosting de pequeno tamano (si se distribuye con el artefacto) o, en su defecto, mediante una votacion ponderada por bit-score. El primer EC de la lista reordenada es la prediccion final.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del conjunto, ni sobre si hubo ajuste fino adicional. El unico detalle operativo documentado es la estrategia de respaldo: las entradas sin hit reciben el EC mas frecuente del conjunto de entrenamiento, y una guarda temporal corta la busqueda y aplica ese mismo EC de reserva al resto de entradas (las mas largas) cuando el tiempo de ejecucion supera un umbral no especificado. Esta guarda introduce una dependencia del rendimiento de la maquina en el resultado final, lo que afecta a la reproducibilidad exacta entre entornos.

## Capacidades

- Prediccion del primer numero EC (primer nivel de la jerarquia Enzyme Commission) para secuencias proteicas de entrada.
- Generacion de una lista ordenada best-first de EC candidatos, no solo la etiqueta final.
- Busqueda por similitud de secuencias contra un indice MMseqs2 preconstruido.
- Reordenacion de candidatos mediante gradient boosting o votacion ponderada por bit-score.
- Manejo de entradas sin hit mediante EC de reserva (el mas frecuente del entrenamiento).
- Control de tiempo de ejecucion con fallback para entradas largas en maquinas lentas.
- Ejecucion exclusiva en CPU, sin requisito de GPU.
- Interfaz de linea de comandos: `python /app/predict.py --input INPUT.parquet --output OUTPUT.jsonl`.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Anotacion enzimatica a gran escala en entornos sin GPU: el pipeline funciona integramente en CPU, por lo que puede desplegarse en clusters sin aceleradores para etiquetar lotes de secuencias proteicas con su EC probable.
- Triaje previo a curacion manual: al devolver una lista best-first de candidatos, un curador puede revisar las alternativas cuando la primera prediccion no es concluyente, en lugar de partir de cero.
- Procesamiento por lotes desde Parquet: la interfaz de entrada/salida (`INPUT.parquet` a `OUTPUT.jsonl`) encaja en pipelines de datos que ya trabajan con formato columnar y necesitan salidas JSON Lines para su consumo posterior.
- Reproduccion de baselines de recuperacion: sirve como referencia para comparar estrategias de reordenacion (gradient boosting frente a votacion por bit-score) en tareas de clasificacion enzimatica.
- Prototipado rapido de anotadores: dado que no requiere entrenamiento en el momento de uso, permite obtener etiquetas EC de forma inmediata sobre un nuevo conjunto de secuencias para validar una hipotesis experimental.
- Entornos con restricciones de tiempo: la guarda temporal con fallback permite acotar el coste de ejecucion en maquinas lentas, a costa de degradar la prediccion en las secuencias mas largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia exclusivamente en CPU; no requiere GPU.
- VRAM estimada: no aplica (0 GB de VRAM).
- GPU recomendadas: ninguna; el sistema no usa aceleracion por GPU.
- Cabe en cualquier consumer GPU o en equipos sin GPU dedicada, siempre que se disponga de CPU y memoria RAM suficiente para el indice MMseqs2 y el conjunto de datos.
- Espacio en disco: al menos 1,6 GB para el repositorio (indice MMseqs2 preconstruido y posible re-ranker).
- Opciones de despliegue: ejecucion directa del script `predict.py` documentado en la model card; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de artefacto).
- Latencia y throughput: no disponibles; dependen del hardware y del numero y longitud de las secuencias de entrada. La guarda temporal implica que el tiempo de ejecucion esta acotado por un umbral no documentado.

## Comparativa con modelos similares

| Sistema | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `chiru112/ec-knn-rr3` | Recuperacion MMseqs2 + re-ranker | no disponible | no aplica | no disponible | Hugging Face, 0 descargas |
| BLASTp / DIAMOND con votacion de EC | Recuperacion por alineamiento | no aplica | no aplica | segun herramienta | Ampliamente disponible |
| Modelos de lenguaje proteicos tipo ESM para prediccion funcional | Transformer proteico | no disponible en esta ficha | no disponible | variable | Hugging Face y otros repositorios |

No se dispone de datos de rendimiento del modelo frente a estas alternativas, por lo que la comparativa se limita a la categoria y al tipo de aproximacion.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifican condiciones de uso comercial ni de redistribucion; debe asumirse que no hay autorizacion explicita hasta que el autor la publique.
- Ausencia de model card detallada: no se documentan datos de entrenamiento, metricas, composicion del conjunto ni proceso de validacion.
- Reproducibilidad condicionada por hardware: la guarda temporal puede truncar la busqueda y aplicar el EC de reserva en funcion de la velocidad de la maquina, de modo que los resultados pueden diferir entre entornos.
- Sesgo hacia las clases mayoritarias: el EC de reserva es el mas frecuente del entrenamiento, lo que favorece sistematicamente a esa clase en entradas sin hit.
- Riesgo de error en proteinas divergentes: al basarse en similitud de secuencias, las proteinas sin homologos cercanos en el conjunto de entrenamiento tienden a recibir el EC de reserva o candidatos poco fiables.
- Cobertura limitada a la taxonomia del conjunto de entrenamiento: no hay informacion sobre la diversidad de organismos ni sobre el sesgo de composicion del indice.
- Sin garantias de produccion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion externa por parte de la comunidad.
- No apto para tareas de lenguaje: no procesa texto, no soporta tool calling ni generacion; cualquier uso fuera de la prediccion de EC sobre secuencias proteicas queda fuera de su proposito documentado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/chiru112/ec-knn-rr3
- No se han encontrado en la informacion disponible papers, blogs, repositorios adicionales ni demos asociados al modelo.
