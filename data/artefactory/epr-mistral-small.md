# artefactory/epr-mistral-small

## Resumen

`artefactory/epr-mistral-small` no es un modelo generativo, sino un detector de alucinaciones calibrado y empaquetado como un clasificador de scikit-learn. Concretamente, el artefacto alojado en HuggingFace es una regresion logistica ajustada sobre una unica caracteristica: la tasa de produccion de entropia (EPR, Entropy Production Rate) calculada a partir de las log-probabilidades por token de una respuesta. La EPR trunca la distribucion del token a los 15 rangos mas probables, calcula la entropia `-sum_k p_k ln p_k` y la promedia a lo largo de todos los tokens de la respuesta, colapsando toda la informacion de incertidumbre en un solo numero.

El modelo objetivo es `mistralai/Mistral-Small-3.1-24B-Instruct-2503`: el detector puntua respuestas producidas por ese modelo concreto. No es un fine-tune suyo ni contiene ninguno de sus pesos, y sus coeficientes estan ajustados contra la distribucion de salida de ese modelo, por lo que reutilizarlos con otro generador carece de sentido estadistico. Lo desarrolla Artefact Research Center y se presenta en el articulo *Learned Hallucination Detection in Black-Box LLMs Using Token-Level Entropy Production Rate* (ECIR 2026).

Su relevancia practica es la de un guardarraíl barato: al reducir la deteccion de alucinaciones a una regresion logistica de una variable, el coste de inferencia del detector es despreciable frente al del propio LLM, y no requiere acceso a pesos ni a logits internos, solo a las log-probabilidades que la API expone en la respuesta (`logprobs=True`, `top_logprobs=15`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica (sklearn `LogisticRegression`) sobre una unica caracteristica escalar: entropia truncada media (EPR) |
| Parametros totales | 1 coeficiente mas 1 termino independiente (2 parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; el detector consume log-probabilidades por token de una respuesta ya generada, no tiene ventana propia |
| Tipos de cuantizacion | no aplica; el artefacto se serializa con skops y no se publican variantes cuantizadas |
| Idiomas soportados | no disponible (la senal depende del modelo objetivo, Mistral Small 3.1) |
| Licencia | MIT |
| Formato de pesos | skops (serializacion de scikit-learn dentro de un repositorio con `library_name: sklearn`) |
| Tarea (pipeline) | text-classification |
| Modelo objetivo | `mistralai/Mistral-Small-3.1-24B-Instruct-2503` |
| Caracteristica de entrada | Entropia truncada a los 15 rangos mas probables, promediada por token |
| Requisito de generacion | `logprobs=True` y `top_logprobs=15` |
| Dependencia de codigo | `artefactual>=2026.9` (clase `EPR`; antes de 2026.08.1, fabrica `epr()`) |
| Rango de salida | `[0, 1]`, donde 1 es la clase alucinacion |
| Umbral de decision | no disponible (el articulo reporta metricas sin umbral) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-08-06 |
| Fecha de actualizacion | 2026-09-11 |

## Arquitectura y entrenamiento

El pipeline tiene dos piezas separadas. La extraccion de caracteristicas vive en la libreria `artefactual` (repositorio `artefactory/artefactual`) y consiste en parsear las 15 log-probabilidades superiores de cada token de una respuesta compatible con el esquema de chat completions de OpenAI, calcular la entropia truncada y promediarla sobre la respuesta completa. El repositorio de HuggingFace contiene unicamente el `LogisticRegression` ajustado, sin clases personalizadas, lo que permite cargarlo con una lista `trusted` vacia.

La innovacion es la reduccion de dimensionalidad del problema: en lugar de agregar docenas de estadisticos de incertidumbre (varianza de muestreos, consistencia semantica, perplejidad), el metodo condensa la senal en una sola variable y ajusta un unico coeficiente. Esto hace que el detector sea calibrable con conjuntos etiquetados pequenos y que su comportamiento sea interpretable directamente a partir del signo y magnitud del coeficiente. No se publican en la model card detalles sobre el numero de ejemplos de entrenamiento, la composicion del dataset de ajuste, ni si hubo etapas de RLHF o DPO (no aplica en un clasificador de este tipo). El articulo asociado (ECIR 2026) reporta ROC-AUC y PR-AUC sobre los modelos evaluados, pero la model card no reproduce esas cifras deliberadamente para evitar divergencias con la publicacion.

## Capacidades

- Clasificacion binaria de respuestas como alucinacion o no alucinacion, con una probabilidad continua en `[0, 1]`.
- Deteccion de incertidumbre a partir de log-probabilidades por token, sin acceso a pesos ni a activaciones internas del modelo generador.
- Funcionamiento en escenario de caja negra: basta con que la API o el servidor de inferencia devuelva `logprobs` con 15 rangos.
- Coste de computo despreciable: una media aritmetica de entropias por respuesta mas un producto escalar.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador, no un generador.
- No tiene capacidades multimodales (vision, audio) ni generacion de texto.
- Capacidades multilingues: no disponibles; la senal hereda las propiedades del modelo objetivo, pero no se documenta evaluacion por idioma.
- No valida ni explica la alucinacion: solo asigna una puntuacion, sin localizar el fragmento problematico.

## Casos de uso

- Guardarraíl en produccion sobre Mistral Small 3.1: generar con `logprobs=True` y `top_logprobs=15`, puntuar cada respuesta con el detector y desviar a revision humana o a una respuesta de repliegue aquellas que superen el umbral elegido. Es adecuado porque el coste adicional por peticion es minimo frente al de la generacion.
- Evaluacion offline de pipelines RAG: usar la puntuacion media por lote como metrica automatica de fidelidad al comparar dos estrategias de recuperacion o dos prompts, sin necesidad de anotacion humana en cada iteracion.
- Deteccion de regresiones tras cambios de version: fijar la distribucion de puntuaciones de un conjunto de referencia y alertar cuando un cambio de prompt, de indice vectorial o de version del modelo desplace esa distribucion hacia valores altos.
- Enrutado y priorizacion en colas de anotacion: ordenar las respuestas por probabilidad de alucinacion para que los anotadores humanos revisen primero los casos mas sospechosos, reduciendo el coste por hallazgo.
- Filtrado previo a la exposicion al usuario en asistentes internos: bloquear o marcar respuestas de baja confianza en dominios con coste de error alto (documentacion tecnica, cumplimiento normativo), siempre con supervision humana en el bucle.
- Generacion de datos de entrenamiento para un clasificador mayor: seleccionar las respuestas cercanas al umbral como casos informativos y etiquetarlas, aprovechando que la puntuacion es barata de obtener a gran escala.
- Monitorizacion continua de un servicio desplegado: registrar la puntuacion por peticion y construir alertas sobre la tasa de respuestas por encima de umbral a lo largo del tiempo.
- Analisis comparativo entre prompts de sistema: mantener el modelo y el corpus fijos y contrastar la entropia media de las respuestas para decidir que plantilla produce salidas mas decididas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el articulo reporta ROC-AUC y PR-AUC sobre los modelos evaluados y que no reproduce ninguna cifra para no divergir de la publicacion. Tampoco se publica un punto de operacion ni un umbral de decision recomendado, ya que ambas metricas son independientes del umbral.

## Requisitos de hardware

- VRAM para inferencia: practicamente nula. El artefacto es una regresion logistica con una caracteristica, del orden de kilobytes en disco y en memoria.
- GPU recomendadas: no aplica. El detector se ejecuta en CPU.
- Cabe en cualquier equipo, incluidos portatiles sin GPU y entornos de funcionamiento en la nube con recursos minimos.
- El coste real de hardware proviene del modelo objetivo: `mistralai/Mistral-Small-3.1-24B-Instruct-2503` con 24 000 millones de parametros requiere aceleradores de gama alta (por ejemplo, A100, H100 o varias RTX 4090 con cuantizacion) para servir la generacion.
- Opciones de despliegue: la libreria `artefactual` con scikit-learn y skops para el detector; el modelo objetivo puede servirse con vLLM, TGI, llama.cpp u Ollama siempre que la ruta de inferencia exponga `logprobs` con 15 rangos. El detector necesita que esos 15 rangos esten presentes: si se devuelven menos, la implementacion rechaza la respuesta en lugar de rellenar con ceros.
- Latencia y throughput: no disponibles. Se espera que la latencia adicional introducida por el detector sea marginal respecto a la generacion, pero no se publican mediciones.

## Comparativa con modelos similares

| Detector | Tipo de senal | Requiere log-probabilidades | Coste por respuesta | Ligado a un modelo objetivo | Licencia | Metricas publicadas |
|---|---|---|---|---|---|---|
| EPR (`artefactory/epr-mistral-small`) | Entropia truncada media por token | Si (top-15) | Un producto escalar | Si, Mistral Small 3.1 24B Instruct 2503 | MIT | ROC-AUC y PR-AUC en el articulo; cifras no disponibles en esta ficha |
| SelfCheckGPT | Consistencia entre multiples muestreos | No (caja negra pura) | Multiples generaciones por consulta | No | no disponible | no disponible |
| Sondas de entropia semantica | Entropia sobre agrupaciones semanticas | Depende de la variante | Multiples muestreos o acceso a logits | No | no disponible | no disponible |
| LLM como juez | Juicio de un segundo modelo generativo | No | Una generacion adicional | No | depende del juez | no disponible |

La comparativa se limita a la naturaleza metodologica: no se dispone de cifras comparativas de parametros, contexto ni rendimiento para estos enfoques en la informacion proporcionada, y sus mazos de evaluacion no son directamente equiparables al de este artefacto.

## Limitaciones y advertencias

- Vinculacion al modelo objetivo: los coeficientes estan ajustados contra la distribucion de salida de `Mistral-Small-3.1-24B-Instruct-2503`. Usarlos con otro generador no es significativo, aunque nada en el fichero lo impida tecnicamente.
- Requisito estricto de `k=15`: la generacion debe hacerse con `logprobs=True` y `top_logprobs=15`. Las respuestas con menos rangos se rechazan en lugar de rellenarse con ceros, porque los rangos ausentes no fueron recuperados y rellenarlos sesgaria la puntuacion hacia la confianza.
- Sin punto de operacion publicado: no hay umbral recomendado. Cualquier despliegue en produccion exige elegir un umbral sobre datos etiquetados propios y asumir el compromiso correspondiente entre precision y exhaustividad.
- Riesgo de falso negativo en alucinaciones fluidas: una respuesta incorrecta pero formulada con alta confianza puede obtener una entropia baja; la senal mide incertidumbre del generador, no veracidad factual.
- Riesgo de falso positivo en preguntas legitimamente abiertas o ambiguas, donde el modelo distribuye probabilidad entre varias respuestas correctas.
- Sin informacion sobre sesgos: no se documenta analisis de sesgo por idioma, dominio o demografia, ni evaluacion fuera del regimen del modelo objetivo.
- Sin validacion de la comunidad: el repositorio figura con 0 descargas y 0 likes, por lo que no existe evidencia externa de replicacion al margen del articulo.
- Dependencia de version: requiere `artefactual>=2026.9`. Hasta 2026.08.1 los mismos pesos se cargaban con la fabrica en minusculas `epr()`, lo que puede romper codigo escrito contra versiones antiguas.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, con la unica obligacion habitual de conservar el aviso de copyright y la licencia. La licencia del modelo objetivo (Mistral Small 3.1) es independiente y debe verificarse por separado.
- Generalizacion no documentada: no se especifica el comportamiento del detector en idiomas distintos del ingles ni en dominios alejados del conjunto de ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/artefactory/epr-mistral-small
- Modelo objetivo: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Instruct-2503
- Libreria `artefactual`: https://github.com/artefactory/artefactual
- Incidencias y contacto: https://github.com/artefactory/artefactual/issues
- Preprint: https://arxiv.org/abs/2509.04492
- Publicacion ECIR 2026: https://doi.org/10.1007/978-3-032-21289-4_8
- Los resultados de la busqueda web proporcionados no contienen informacion relevante sobre el modelo; devuelven exclusivamente paginas de una cadena de pizzas sin relacion con el artefacto.
