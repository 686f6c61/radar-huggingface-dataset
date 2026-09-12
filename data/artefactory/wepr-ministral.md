# artefactory/wepr-ministral

## Resumen

artefactory/wepr-ministral no es un modelo generativo, sino un detector de alucinaciones calibrado que puntua respuestas producidas por mistralai/Ministral-8B-Instruct-2410. El artefacto consiste en una regresion logistica ajustada sobre caracteristicas de entropia extraidas de las log-probabilidades de nivel de token que devuelve el modelo objetivo. Lo publica Artefact Research Center dentro del ecosistema de la libreria artefactual y se distribuye como artefacto de scikit-learn en formato skops con licencia MIT.

El metodo se denomina WEPR (Weighted EPR, o tasa de produccion de entropia ponderada) y es una evolucion de EPR: en lugar de agregar los rangos del top-k de log-probabilidades, mantiene cada rango por separado y asigna un coeficiente de calibracion a cada uno, tomando la media y el maximo sobre el eje de tokens, lo que da 2k caracteristicas (30 con k=15). Con el mismo coste de calibracion, lee estrictamente mas informacion de la distribucion que EPR.

Su relevancia es practica: permite convertir la incertidumbre de un LLM de caja negra en una probabilidad de alucinacion en el rango [0, 1], con un coste computacional despreciable, siempre que el proveedor exponga logprobs. El trabajo se presento en ECIR 2026 y el preprint esta disponible en arXiv.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica (scikit-learn) sobre caracteristicas de entropia de log-probabilidades; no es una red neuronal generativa |
| Parametros totales | No aplica: el artefacto es un clasificador con 2k caracteristicas (30 con k=15) mas el termino de sesgo |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; procesa la respuesta completa generada por el modelo objetivo, cuya ventana es la de Ministral-8B-Instruct-2410 |
| Tipos de cuantizacion | No aplica (clasificador tabular; no se publican variantes cuantizadas) |
| Idiomas soportados | No disponible (el detector opera sobre log-probabilidades de tokens, no sobre texto; la card no declara cobertura idiomatica) |
| Licencia | MIT |
| Formato de pesos | Artefacto skops de scikit-learn, sin clases personalizadas (se carga con lista `trusted` vacia) |
| Modelo objetivo | mistralai/Ministral-8B-Instruct-2410 (no es un fine-tune ni contiene sus pesos) |
| Entrada requerida | Respuesta compatible con el esquema de chat completion o responses de OpenAI, con `logprobs=True` y `top_logprobs=15` |
| Salida | Puntuacion en [0, 1], donde 1 corresponde a la clase alucinacion |
| Libreria de inferencia | artefactual >= 2026.9 (clase `WEPR`; hasta 2026.08.1, factoria `wepr()`) |
| Pipeline declarado | text-classification |

## Arquitectura y entrenamiento

El artefacto publicado es unicamente el clasificador: un `LogisticRegression` ajustado. La extraccion de caracteristicas que lo alimenta no vive en este repositorio, sino en la libreria artefactual: se parsean las top-15 log-probabilidades de la respuesta de completion y se reducen a caracteristicas de entropia. WEPR conserva los rangos separados y aplica la media y el maximo sobre el eje de tokens, de modo que la calibracion aprende un coeficiente por rango (2k caracteristicas). Frente a EPR, que colapsa los rangos, WEPR explota mas informacion de la distribucion sin incrementar el coste de calibracion.

No se detalla en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO, algo que no aplica a un clasificador de este tipo. La innovacion tecnica destacable es el propio esquema de caracteristicas WEPR y su integracion en un detector calibrado que se consume como un unico paso de inferencia sobre la respuesta ya generada. La restriccion de k=15 es estricta: las respuestas con menos rangos se rechazan en lugar de rellenarse con ceros, porque los rangos ausentes no han sido recuperados y rellenarlos haria que la respuesta pareciese mas segura de lo que era.

## Capacidades

- Clasificacion binaria de respuestas de Ministral-8B-Instruct-2410 en alucinacion / no alucinacion, con salida probabilistica continua en [0, 1].
- Estimacion de incertidumbre a nivel de respuesta a partir de log-probabilidades de nivel de token.
- Funcionamiento en caja negra: no requiere acceso a pesos, activaciones ni estados internos del LLM, solo a las log-probabilidades que expone la API.
- Consumo de cargas compatibles con chat completion y responses de OpenAI que incluyan `top_logprobs=15`.
- Integracion como clasificador de scikit-learn, lo que permite encadenarlo en pipelines, serializarlo y desplegarlo con la infraestructura habitual de sklearn.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto: no es un modelo generativo.
- No declara capacidades multilingues propias; su comportamiento depende del idioma y del modelo objetivo cuyas log-probabilidades puntua.

## Casos de uso

- Guardarrail en pipelines RAG sobre Ministral-8B: tras generar la respuesta con `top_logprobs=15`, se calcula la puntuacion WEPR y, si supera el umbral elegido, se activa una abstencion, se cita la fuente recuperada o se deriva la consulta a un humano.
- Monitorizacion en produccion de un asistente basado en Ministral-8B: registrar la puntuacion de cada respuesta permite detectar cambios en la tasa de respuestas de alta incertidumbre tras actualizaciones de prompt, de indice o de plantilla.
- Triaje de revision humana: ordenar las respuestas por probabilidad de alucinacion para que el equipo de calidad revise primero las mas sospechosas, en lugar de muestrear aleatoriamente.
- Evaluacion offline de variantes de prompt y de parametros de decodificacion: comparar la distribucion de puntuaciones entre configuraciones antes de desplegarlas, usando un conjunto etiquetado propio para fijar el umbral.
- Filtrado de datos sinteticos: descartar respuestas generadas por Ministral-8B con puntuaciones altas antes de incorporarlas a un dataset de entrenamiento o de evaluacion.
- Enrutado condicional a un modelo mayor o a busqueda externa: la puntuacion actua como señal de bajo coste para decidir cuando merece la pena pagar una segunda generacion o una consulta a una herramienta.
- Investigacion en deteccion de alucinaciones: reproducir el baseline EPR/WEPR descrito en el articulo y compararlo con otros estimadores de incertidumbre sobre el mismo modelo objetivo.
- Calibracion de un punto de operacion propio: como no se publica umbral, el detector se usa para construir la curva ROC y PR sobre datos etiquetados de la organizacion y fijar el corte que mejor se ajuste a su tolerancia al error.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite expresamente al articulo ([arXiv:2509.04492](https://arxiv.org/abs/2509.04492)) y no reproduce cifras, para evitar que la ficha se desvie de los resultados publicados.

| Metrica | Resultado |
|---|---|
| ROC-AUC | No disponible en la informacion proporcionada; reportada en el articulo |
| PR-AUC | No disponible en la informacion proporcionada; reportada en el articulo |
| Umbral de decision | No publicado; el articulo usa metricas independientes de umbral |
| Modelos evaluados | No especificados en la informacion proporcionada |

## Requisitos de hardware

- VRAM para inferencia: practicamente nula. Es una regresion logistica sobre 30 caracteristicas; el clasificador corre en CPU sin necesidad de GPU.
- GPU recomendadas: no aplica para el detector. La GPU solo es relevante para el modelo objetivo, Ministral-8B-Instruct-2410, que es quien genera las log-probabilidades.
- Cabe en cualquier equipo consumer: el artefacto se puede ejecutar en el mismo portatil o contenedor que orquesta las llamadas al modelo.
- Opciones de despliegue: carga directa con la libreria artefactual (clase `WEPR`), serializacion skops y servicio mediante cualquier stack de scikit-learn (por ejemplo, un endpoint FastAPI o un contenedor con joblib/skops). No aplica vLLM, llama.cpp, Ollama ni TGI, ya que no hay pesos de transformer que servir.
- Latencia y throughput: no se publican cifras. Por la naturaleza del artefacto (una multiplicacion matricial de 30 caracteristicas mas una sigmoide), el coste es despreciable frente al de la generacion del LLM, que es el cuello de botella real del pipeline.
- Requisito logistico critico: el proveedor de inferencia del modelo objetivo debe exponer `logprobs=True` y `top_logprobs=15`. Sin esos 15 rangos por token, el detector no puede puntuar la respuesta.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con EPR, el metodo del que WEPR deriva y que el articulo usa como referencia con el mismo coste de calibracion.

| Metodo | Tratamiento de los rangos | Caracteristicas | Modelo objetivo | Acceso requerido | Licencia |
|---|---|---|---|---|---|
| WEPR (este artefacto) | Mantiene los rangos separados; un coeficiente por rango, con media y maximo sobre tokens | 2k (30 con k=15) | Ministral-8B-Instruct-2410 | Caja negra, logprobs top-15 | MIT |
| EPR | Agrega los rangos | No disponible | No disponible | Caja negra, logprobs | No disponible |

Otros detectores de alucinacion basados en incertidumbre (entropia semantica, self-consistency, sondas sobre estados ocultos) no aparecen caracterizados en la informacion proporcionada, por lo que no se incluye comparacion cuantitativa: no disponible.

## Limitaciones y advertencias

- Atado al modelo objetivo: los coeficientes estan ajustados contra la distribucion de salida de mistralai/Ministral-8B-Instruct-2410. Puntuar respuestas de otro modelo con estos pesos no es significativo, aunque nada en el fichero lo impida tecnicamente.
- Restriccion fija de k=15: exige `logprobs=True` y `top_logprobs=15`. Las respuestas con menos rangos se rechazan en lugar de rellenarse, porque los rangos ausentes no se han recuperado y el relleno introduciria un sesgo de exceso de confianza.
- Ausencia de punto de operacion publicado: el articulo reporta ROC-AUC y PR-AUC, ambas independientes de umbral, por lo que no hay umbral de decision oficial. Cada equipo debe calibrarlo con sus propios datos etiquetados.
- Riesgo de alucinacion: el artefacto no genera texto, pero es un detector estadistico y cometera falsos negativos y falsos positivos. La incertidumbre alta no implica necesariamente alucinacion, ni la baja garantiza veracidad.
- Sesgos: al depender de las log-probabilidades de Ministral-8B, hereda los sesgos de calibracion de ese modelo y los de la distribucion de datos empleada en el ajuste de la regresion, no detallada en la informacion disponible.
- Limitaciones de idioma: la card no declara idiomas soportados. El comportamiento en idiomas poco representados en el modelo objetivo no esta documentado.
- Restricciones de licencia: MIT, permisiva para uso comercial. Conviene revisar tambien la licencia del modelo objetivo y la de la libreria artefactual en el despliegue.
- Dependencia de version: requiere artefactual >= 2026.9, donde el detector es la clase `WEPR`. Hasta la 2026.08.1 los mismos pesos se cargaban con la factoria en minusculas `wepr()`, por lo que un cambio de version puede romper el codigo de integracion.
- Advertencia para produccion: el detector solo puede operar si la pasarela de inferencia conserva y reenvia las log-probabilidades. Si se usa un proveedor que las oculta o las trunca, el detector queda inutilizable sin cambiar de ruta de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/artefactory/wepr-ministral
- Modelo objetivo: https://huggingface.co/mistralai/Ministral-8B-Instruct-2410
- Libreria artefactual: https://github.com/artefactory/artefactual
- Incidencias y contacto: https://github.com/artefactory/artefactual/issues
- Preprint: https://arxiv.org/abs/2509.04492
- DOI de la publicacion (ECIR 2026): https://doi.org/10.1007/978-3-032-21289-4_8
