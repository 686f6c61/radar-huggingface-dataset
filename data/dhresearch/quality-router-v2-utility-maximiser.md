# dhresearch/quality-router-v2-utility-maximiser

## Resumen

`dhresearch/quality-router-v2-utility-maximiser` no es un modelo de lenguaje generativo, sino un enrutador de coste-calidad entrenado con scikit-learn. Su funcion es, dado un vector de caracteristicas numericas previas al enrutado (pre-routing) mas un one-hot de interfaz, estimar la probabilidad de exito de cada una de las seis rutas disponibles (`cheap_model`, `medium_model`, `code_specialist`, `code_specialist_repair`, `strong_model`, `strong_repair`) y, en paralelo, predecir el coste de cada ruta mediante una cabeza ridge. Con ambas senales, el sistema elige la ruta que maximiza la utilidad bajo un presupuesto de fallo.

El artefacto lo publica la organizacion dhresearch dentro del estudio `quality_router_v2`. Segun la propia model card, esta subida es un refit con semilla 0 fechado el 3 de octubre de 2026: la ejecucion original escribio predicciones pero no guardo pesos, por lo que este fichero es la reconstruccion posterior. Es un detalle critico para reproducibilidad, porque el modelo servido en produccion (version 8) fija `learned_downrouting` a `false` y no carga pesos ajustados; es decir, este fichero queda sin cargar en la tarjeta servida.

Su relevancia es de nicho pero clara: el enrutado entre LLM de distinta capacidad y coste es un problema activo (asi lo muestran trabajos recientes como RLCascadeRouter o las pasarelas comerciales tipo FastRouter y OpenRouter). Este modelo aporta un enfoque tabular, interpretable y de coste computacional minimo al mismo problema, aunque con una muestra de entrenamiento muy pequena (602 filas) y sin adopcion registrada en HuggingFace (0 descargas, 0 likes).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto de cabezas de clasificacion por ruta (una por ruta) mas una cabeza de regresion ridge para coste, sobre caracteristicas numericas pre-routing y one-hot de interfaz; implementado con scikit-learn (`fit_heads`) |
| Parametros totales | no aplica (modelo tabular, no es una red neuronal; tamano de pesos no documentado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no procesa texto; consume un vector de caracteristicas pre-calculado) |
| Tipos de cuantizacion | no aplica (no hay cuantizacion de pesos); serializacion via joblib |
| Idiomas soportados | no disponible (no procesa lenguaje de forma directa) |
| Licencia | other |
| Formato de pesos | `joblib` (diccionario devuelto por `fit_heads`; las cabezas constantes no tienen entrada `model`) |
| Rutas modeladas | cheap_model, medium_model, code_specialist, code_specialist_repair, strong_model, strong_repair |
| Dataset de entrenamiento | dhresearch/outcome-router-v2-measured-pool (`pilot_tasks.jsonl`, `pilot_outcomes.jsonl`, `splits.json`) |
| Tamano del repo | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Entorno de refit | python 3.14.2, sklearn 1.9.1, numpy 2.5.3, joblib 1.6.0, lightgbm 4.7.0, scipy 1.18.1 |
| Fecha de creacion / actualizacion | 2026-10-03T16:42:45Z / 2026-10-03T16:42:47Z |

## Arquitectura y entrenamiento

El modelo se construye con la funcion `fit_heads(..., cost_model='ridge', seed=0)` sobre las mismas filas de interfaz empleadas en el ajuste de coste constante. La estructura es un diccionario con una cabeza de prediccion de exito por cada ruta y una cabeza ridge de coste que opera sobre el bloque numerico pre-routing y el one-hot de interfaz. El indicador de interfaz es ground truth del validador, lo que ancla la prediccion al sistema de validacion concreto con el que se generaron los datos. La inferencia se realiza con `predicted_outcome.predict_routes`.

El entrenamiento usa el measured pool del estudio, con 602 filas de entrenamiento, 154 de validacion y 244 de prueba. La cabeza ridge de `strong_repair` alcanza un MAE de coste de 0,00275026 en validacion, frente a 0,00356339 del predictor de referencia basado en la media de entrenamiento (n=154); el MAE de validacion coincide con el reportado en `data/real_v2/revalidation_report.json` bajo `utility_maximiser.validation_cost_mae`. No se documenta ningun proceso de RLHF, DPO ni decodificacion especulativa, ya que no hay generacion de texto implicada. La innovacion tecnica relevante es metodologica: separar la estimacion de exito por ruta de la estimacion de coste y aplicar una regla de validacion con presupuesto de fallo. Esa regla, segun la model card, mantuvo finalmente la ruta `strong_repair` porque el fallo realizado quedo fuera del fallo del incumbent mas 0,01.

## Capacidades

- Prediccion de exito por ruta: genera una puntuacion de exito para cada una de las seis rutas definidas en el estudio.
- Prediccion de coste por ruta: cabeza ridge entrenada sobre caracteristicas pre-routing e interfaz.
- Seleccion de ruta bajo presupuesto de fallo: la decision no maximiza solo exito, sino utilidad condicionada a una cota de fallo.
- Integracion con validadores externos: el one-hot de interfaz codifica el validador usado como ground truth.
- Serializacion y carga sencillas: `joblib.load` devuelve el diccionario `fit_heads` listo para puntuar.
- Diferenciacion entre cabezas ajustadas y cabezas constantes: las cabezas constantes no incluyen entrada `model`.
- No ofrece generacion de texto, razonamiento, codigo, matematicas, vision, audio ni tool calling.
- No soporta agentes ni razonamiento multi-paso por si mismo; es un componente de decision dentro de un pipeline de enrutado.
- Capacidades multilingues: no disponibles (no procesa lenguaje de forma directa).

## Casos de uso

- Enrutado en pasarela LLM interna: dado un vector pre-routing de una consulta, el modelo estima exito y coste de cada ruta y permite escoger la mas barata que supere el umbral de exito, reduciendo gasto de inferencia sin degradar la calidad percibida.
- Control de coste con presupuesto de fallo: en flujos donde un fallo tiene un coste de negocio alto, la cabeza de coste y las cabezas de exito permiten fijar una cota de fallo y dejar la seleccion conservadora en la ruta fuerte solo cuando los datos la justifican.
- Sustitucion de heuristicas estaticas de cascada: frente a reglas fijas del tipo "si la consulta es larga, usa el modelo grande", el modelo aprende la asignacion a partir de resultados medidos en el propio pool de tareas.
- Estimacion de coste previa a la llamada: la cabeza ridge predice el coste esperado de cada ruta antes de invocar al LLM, lo que permite presupuestar por lote de peticiones y descartar rutas inviables por coste.
- Revalidacion y auditoria de politicas de enrutado: el artefacto esta ligado al informe `utility_maximiser.validation_cost_mae` de `revalidation_report.json`, por lo que sirve como referencia reproducible en la revalidacion de afirmaciones del estudio.
- Investigacion en enrutado de LLM: funciona como baseline tabular interpretable frente a routers neuronales o de aprendizaje por refuerzo, con un coste de entrenamiento y de inferencia minimo.
- Segmentacion por interfaz de validacion: el uso del one-hot de interfaz permite analizar como cambia la utilidad del enrutado segun el validador empleado, util cuando conviven varios validadores en un mismo sistema.
- Pruebas A/B de politica de enrutado: al cargarse como diccionario de sklearn, se puede servir en paralelo a la politica vigente y comparar fallo realizado sin exponer trafico real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni equivalentes, ya que no es un modelo de lenguaje). Los unicos datos numericos publicados son de validacion del propio estudio:

| Metrica | Valor | Conjunto | n |
|---|---|---|---|
| MAE de coste, cabeza ridge `strong_repair` | 0,00275026 | validacion | 154 |
| MAE de coste, referencia por media de entrenamiento | 0,00356339 | validacion | 154 |
| MAE de coste de validacion | coincide con `data/real_v2/revalidation_report.json` (`utility_maximiser.validation_cost_mae`) | validacion | no disponible |
| Regla de validacion aplicada | fallo realizado fuera del fallo del incumbent mas 0,01; se mantiene `strong_repair` y no se almacena peso | validacion | 154 |
| Filas de entrenamiento / validacion / prueba | 602 / 154 / 244 | measured pool | 1000 |

## Requisitos de hardware

- VRAM: no aplica, es un modelo de CPU; no requiere GPU para inferencia ni para carga.
- GPU recomendadas: ninguna. No se ha documentado ningun uso de aceleracion por GPU.
- Compatibilidad con GPU de consumo: no aplica (no usa GPU).
- RAM: no se documenta el tamano exacto del diccionario serializado; el repositorio ocupa 0,0 GB, lo que indica un artefacto muy pequeno.
- Despliegue: carga con `joblib.load`; entorno de referencia con python 3.14.2, sklearn 1.9.1, numpy 2.5.3, joblib 1.6.0, lightgbm 4.7.0 y scipy 1.18.1. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos generativos.
- Latencia y throughput: no disponible. Al tratarse de cabezas de scikit-learn sobre un vector de caracteristicas reducido, la inferencia es de CPU y de coste bajo, pero no hay cifras publicadas en la informacion disponible.
- Almacenamiento: despreciable (repo de 0,0 GB).

## Comparativa con modelos similares

| Alternativa | Tipo | Enfoque | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| quality-router-v2-utility-maximiser | Router tabular con scikit-learn | Cabezas de exito por ruta mas cabeza de coste ridge | no aplica (modelo tabular) | other | HuggingFace, 0 descargas, 0 likes |
| RLCascadeRouter | Router de cascada con aprendizaje por refuerzo | Enrutado en cascada sin estimador de calidad, segun la publicacion arXiv 2608.15817 | no disponible | no disponible | Publicacion en arXiv |
| FastRouter.ai | Pasarela comercial de modelos | API unificada sobre 200+ modelos | no disponible | no disponible (propietaria) | Servicio SaaS |
| OpenRouter | Pasarela comercial de modelos | API unificada con ranking por uso | no disponible | no disponible (propietaria) | Servicio SaaS |
| Q-router | Enrutado con modelos expertos | Evaluacion de calidad de video con enrutado de expertos | no disponible | no disponible | OpenReview (preprint) |

No se dispone de datos de rendimiento comparables entre estas alternativas en la informacion proporcionada; la comparacion es, por tanto, de categoria y enfoque, no de metricas.

## Limitaciones y advertencias

- Adopcion nula: 0 descargas y 0 likes en HuggingFace. No hay evidencia de uso en produccion ni validacion por parte de terceros.
- El artefacto no esta cargado en la tarjeta servida: la version 8 de `quality_router_v2` fija `learned_downrouting` a `false` y no carga pesos ajustados, por lo que este fichero puede no formar parte del sistema en explotacion.
- Resultado de validacion negativo para la adopcion: bajo el presupuesto de fallo, la regla de validacion mantuvo `strong_repair` y no almaceno peso, porque el fallo realizado quedo fuera del fallo del incumbent mas 0,01.
- Muestra muy pequena: 602 filas de entrenamiento y 154 de validacion. El riesgo de sobreajuste y de alta varianza entre semillas es elevado, y no se documenta validacion cruzada.
- Reproducibilidad parcial: la ejecucion original no guardo pesos, por lo que este refit con semilla 0 puede no reproducir exactamente los numeros del informe original.
- Acoplamiento al esquema de caracteristicas: requiere el mismo bloque numerico pre-routing y el mismo one-hot de interfaz. El indicador de interfaz es ground truth del validador, de modo que cambiar de validador invalida el modelo.
- Acoplamiento al conjunto de rutas: las seis rutas modeladas estan fijadas; anadir o retirar rutas exige reentrenar las cabezas.
- Licencia `other` sin terminos explicitos en la informacion disponible: es imprescindible revisar las condiciones antes de cualquier uso comercial.
- Idiomas soportados: no disponibles, y en la practica no aplica porque el modelo no procesa texto.
- Alucinacion: no aplica en el sentido generativo, pero el modelo puede producir estimaciones de exito o de coste sesgadas si el pool medido no representa el trafico real.
- Sesgos: no documentados por el autor; al entrenarse sobre un pool medido concreto, heredara los sesgos de tareas, interfaces y modelos presentes en ese pool.
- Dependencias fijadas a versiones concretas (python 3.14.2, sklearn 1.9.1, numpy 2.5.3, lightgbm 4.7.0, scipy 1.18.1): la compatibilidad con versiones distintas no esta garantizada, aunque joblib suele ser tolerante dentro de la misma major de sklearn.
- No hay informacion sobre pipeline, idiomas, tokenizador ni limites de contexto porque no es un modelo generativo; cualquier uso que espere esas capacidades seria un error de integracion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dhresearch/quality-router-v2-utility-maximiser
- Dataset del estudio: https://huggingface.co/datasets/dhresearch/outcome-router-v2-measured-pool
- Perfil de la organizacion dhresearch: https://huggingface.co/dhresearch
- RLCascadeRouter: Quality-Estimator-Free Cascade Routing (arXiv 2608.15817): https://arxiv.org/abs/2608.15817
- Q-router: Agentic Video Quality Assessment With Expert Model Routing (OpenReview): https://openreview.net/pdf?id=udq2BMdIFi
- FastRouter.ai, pasarela unificada de LLM: https://fastrouter.ai/
- OpenRouter, coleccion de modelos y rankings de uso: https://openrouter.ai/collections/free-models
