# dhresearch/quality-router-v2-route-conditioned

## Resumen

`dhresearch/quality-router-v2-route-conditioned` no es un modelo de lenguaje generativo, sino un modelo de enrutamiento (router) supervisado: un clasificador de scikit-learn cuyo objetivo es predecir el exito de una ruta o interfaz concreta dentro de un sistema de encaminamiento entre modelos de lenguaje. El objeto se serializa con joblib bajo la clase `RouteConditionedSuccessRouter` y se ha publicado como parte del estudio `quality_router_v2`, en su version 8. El autor es la organizacion `dhresearch` y el modelo se distribuye con licencia `other`.

El artefacto publicado es un reajuste (refit) con semilla 0 realizado el 2026-10-03, porque la ejecucion original solo escribio predicciones y no guardo los pesos. El modelo resultante se ha entrenado sobre el dataset `dhresearch/outcome-router-v2-main` con la opcion `--router route_conditioned --per-interface`, dejando la ruta fuerte en el valor por defecto de entrenamiento `strong_model`. Segun la model card, el flujo servido en produccion no invoca este objeto y el modo economia, que nombra un downrouter aprendido, esta desactivado.

La relevancia de esta ficha es acotada y conviene ser explicito: se trata de un componente de infraestructura de enrutamiento, no de un modelo para generar texto, codigo o razonamiento. Su tamano de repositorio es de 0.0 GB y no registra descargas ni likes, por lo que es un artefacto de investigacion mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador de scikit-learn (clase `RouteConditionedSuccessRouter`), serializado con joblib; el entorno de reajuste incluye LightGBM 4.7.0, aunque la model card no declara el algoritmo final |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no se documentan formatos cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | joblib (pickle); requiere que `outcome_router_data` sea importable al deserializar |

## Arquitectura y entrenamiento

El modelo no es un transformer ni un modelo de lenguaje. Es un clasificador tabular de scikit-learn cuyo papel es estimar el exito de una ruta condicionada por interfaz dentro de un sistema de enrutamiento entre modelos. La unica referencia estructural disponible es su clase de serializacion, `RouteConditionedSuccessRouter`, y la instruccion de carga: deserializar con joblib mientras el modulo `outcome_router_data` sea importable. El reajuste se ejecuto con `--router route_conditioned --per-interface` y las mismas rutas candidatas del estudio; la ruta fuerte se dejo en el valor por defecto de entrenamiento `strong_model`.

El entrenamiento se hizo con semilla 0 sobre el dataset `dhresearch/outcome-router-v2-main`. El entorno de software declarado en el momento del reajuste es: Python 3.14.2, scikit-learn 1.9.1, NumPy 2.5.3, joblib 1.6.0, LightGBM 4.7.0 y SciPy 1.18.1. La model card indica de forma explicita que este archivo no es el de pesos originales: la ejecucion original escribio el fichero de predicciones `data/real_v2/preds_v2_route_conditioned.jsonl` y no guardo los pesos, de modo que lo publicado es un reajuste posterior del mismo estudio. No se documentan detalles sobre numero de muestras de entrenamiento, composicion del dataset ni tecnicas de RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Prediccion de exito de ruta (route-conditioned): estima si una ruta concreta tendra exito, condicionada por la interfaz de llamada.
- Enrutamiento por interfaz: el ajuste `--per-interface` indica que el modelo genera predicciones especificas para cada interfaz del sistema.
- Reproducibilidad de decisiones de enrutamiento: la model card reporta una coincidencia de `predicted_route` de 250 sobre 250 filas de test compartidas (tasa 1.000000) frente al fichero de predicciones congelado, incluyendo probabilidades redondeadas y etiquetas.
- Seleccion entre ruta fuerte y ruta economica: el diseno contempla una ruta fuerte (`strong_model`) y un downrouter aprendido para modo economia, aunque este ultimo esta desactivado en el flujo servido.
- No soporta generacion de texto, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues.

## Casos de uso

- Enrutamiento de peticiones en produccion: dado un sistema que dispone de varias rutas o backends de modelo, el clasificador estima la probabilidad de exito de cada ruta condicionada por la interfaz, lo que permite decidir a que backend enviar cada consulta con criterio aprendido y no solo heuristico.
- Optimizacion de coste por consulta: al predecir el exito de la ruta fuerte frente a alternativas mas baratas, permite desviar peticiones hacia opciones economicas cuando el modelo estima que el exito se mantiene, reduciendo el gasto por token.
- Escalado selectivo a modelos mayores: en un flujo por niveles (por ejemplo, un modelo pequeno y otro grande), el router actua como puerta que decide cuando merece la pena escalar la consulta al modelo de mayor capacidad.
- Investigacion sobre enrutamiento entre LLM: sirve como artefacto de referencia para reproducir el estudio `quality_router_v2` y comparar estrategias `route_conditioned` frente a variantes como el downrouter aprendido ahora desactivado.
- Analisis offline de decisiones historicas: al coincidir con predicciones congeladas sobre un conjunto de test compartido, permite auditar y comparar politicas de enrutamiento ya ejecutadas.
- Integracion en pipelines de evaluacion interna: como componente que consume el dataset `outcome-router-v2-main`, se puede incorporar a un pipeline que mida tasas de escalado y coste por consulta resuelta sin tocar el trafico real.
- Despliegue en entornos con restricciones de recursos: al no ser un modelo neuronal y ocupar 0.0 GB en el repositorio, es apto para ejecucion en CPU dentro del propio servicio de orquestacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no es un modelo de lenguaje. El unico dato de rendimiento documentado es una prueba de concordancia con predicciones congeladas:

| Prueba | Metrica | Resultado |
|---|---|---|
| Concordancia con `data/real_v2/preds_v2_route_conditioned.jsonl` | Coincidencia de `predicted_route` | 250 / 250 (tasa 1.000000) |
| Concordancia con el fichero congelado | Coincidencia de fila completa (probabilidades redondeadas y etiquetas) | 250 / 250 |
| Concordancia con el fichero congelado | Claves discrepantes | {} (ninguna) |

Estos valores corresponden al reajuste con semilla 0 y no constituyen una evaluacion de calidad de enrutamiento en produccion; solo verifican reproducibilidad respecto a un fichero de predicciones ya existente.

## Requisitos de hardware

- VRAM para inferencia: no aplica; es un modelo tabular de scikit-learn serializado con joblib, sin pesos neuronales.
- GPU recomendadas: no aplica. La inferencia se ejecuta en CPU.
- GPU de consumo: no aplica. No requiere GPU.
- Memoria: no disponible en detalle; el repositorio ocupa 0.0 GB, lo que sugiere un artefacto de tamano reducido.
- Opciones de despliegue: carga mediante joblib en un proceso Python; el modulo `outcome_router_data` debe ser importable en el mismo entorno. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no aplican aqui.
- Dependencias declaradas en el reajuste: Python 3.14.2, scikit-learn 1.9.1, NumPy 2.5.3, joblib 1.6.0, LightGBM 4.7.0, SciPy 1.18.1.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de comparativas directas con modelos equivalentes en la informacion proporcionada. Los resultados de la busqueda web corresponden a sistemas de enrutamiento de naturaleza distinta (framework de investigacion o servicio comercial), por lo que la comparacion es cualitativa y orientativa.

| Sistema | Naturaleza | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dhresearch/quality-router-v2-route-conditioned` | Clasificador de enrutamiento por interfaz (scikit-learn) | no disponible | no aplica | other | HuggingFace, 0 descargas, 0 likes |
| Q-Router | Framework agente de evaluacion de calidad de video con enrutamiento de modelos expertos; usa VLM como routers | no disponible | no disponible | no disponible | Paper en arXiv |
| OpenRouter (Auto Router y fallbacks) | Servicio comercial de enrutamiento del lado de la aplicacion | no aplica | no disponible | no disponible | Servicio en linea |
| Router del harness de LangChain (Open SWE) | Patron de enrutamiento a nivel de aplicacion | no aplica | no disponible | no disponible | Blog tecnico |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo ni razonamiento. Cualquier expectativa de uso como LLM es incorrecta.
- Ambiguedad documental: la model card describe un objeto que el flujo servido no carga ni invoca, y el `quality_router_v2` version 8 fija `learned_downrouting` a `false`. Debe revisarse con cuidado si este artefacto forma parte o no del sistema desplegado.
- No son los pesos originales: el entrenamiento original no guardo pesos; este archivo es un reajuste con semilla 0, por lo que puede diferir del comportamiento de la ejecucion de referencia.
- Dependencia de importacion: la deserializacion exige que `outcome_router_data` sea importable en el entorno de carga; sin ese modulo el artefacto no se puede cargar.
- Evidencia limitada de calidad: la unica metrica reportada es la concordancia con un fichero de predicciones congelado sobre 250 filas, no una evaluacion independiente de la calidad de las decisiones de enrutamiento.
- Riesgo de datos desactualizados: al condicionar el enrutamiento al dataset `outcome-router-v2-main`, el modelo puede degradarse si la distribucion de interfaces o rutas cambia respecto a la de entrenamiento.
- Idiomas: no se documentan idiomas soportados; el modelo opera sobre representaciones tabulares de rutas, no sobre texto en lenguaje natural.
- Licencia: la licencia se declara como `other` y no se detallan los terminos; debe consultarse con el autor antes de cualquier uso comercial.
- Adopcion nula: 0 descargas y 0 likes, sin validacion externa por parte de la comunidad.
- Sin informacion sobre sesgos, alucinacion en sentido generativo ni limites de contexto, porque no aplican a este tipo de artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dhresearch/quality-router-v2-route-conditioned
- Dataset de entrenamiento: https://huggingface.co/datasets/dhresearch/outcome-router-v2-main
- Q-Router: Agentic Video Quality Assessment with Expert Model Routing (paper HTML): https://arxiv.org/html/2510.08789v1
- Q-Router (abstract en arXiv): https://arxiv.org/abs/2510.08789
- OpenRouter, benchmarks de routers: https://openrouter.ai/benchmarks/routers
- OpenRouter, guia de enrutamiento del lado de la aplicacion: https://openrouter.ai/
- Como construir un router de modelos en el harness (LangChain): https://www.langchain.com/blog/how-to-build-a-model-router-in-the-harness
