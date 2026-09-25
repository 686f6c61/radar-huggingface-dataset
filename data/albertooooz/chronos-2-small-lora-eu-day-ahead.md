# albertooooz/chronos-2-small-lora-eu-day-ahead

## Resumen

Chronos-2-small LoRA EU day-ahead es un adaptador LoRA (PEFT) publicado por el usuario albertooooz sobre el modelo fundacional de series temporales `autogluon/chronos-2-small`. Su proposito concreto es la prediccion horaria a 24 horas del precio del mercado diario (day-ahead) de electricidad en 42 zonas de subasta de ENTSO-E, con la zona historica DE_AT_LU excluida. No es un modelo autonomo: se carga junto al modelo base y es este el que aporta la arquitectura y los pesos congelados.

El problema que aborda es acotado y practico: el precio day-ahead es una serie con estacionalidad intradiaria, semanal y anual muy marcada, y los modelos fundacionales de series temporales en modo zero-shot no explotan del todo la estructura especifica del mercado electrico europeo. El autor demuestra que un ajuste fino ligero (r=8, alpha=16, 5000 pasos) reduce el MASE de 0.843 a 0.611 en la ventana de evaluacion de Polonia, una mejora relativa del 27,6 % sin usar covariables meteorologicas.

El modelo base Chronos-2 pertenece a la familia Chronos de Amazon Science, que segun su documentacion publica ofrece soporte zero-shot para tareas univariantes, multivariantes y con covariables. El adaptador se distribuye bajo licencia Apache 2.0 y el repositorio ocupa menos de 0,1 GB, coherente con el tamano reducido de un adaptador LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer de series temporales (base: Chronos-2-small). Modulos objetivo: `self_attention.q/k/v/o` y `output_patch_embedding.output_layer` |
| Parametros totales | No disponible para el adaptador (r=8, alpha=16). El recuento de parametros de `chronos-2-small` no se detalla en la informacion disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 pasos temporales (context length de entrenamiento) |
| Horizonte de prediccion | 24 pasos (24 horas) |
| Frecuencia de la serie | 1 hora (remuestreada desde 15 minutos cuando fue necesario) |
| Cobertura geografica | 42 zonas de subasta ENTSO-E (DE_AT_LU excluida) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de series temporales; no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT LoRA, libreria `peft`) |
| Modelo base | `autogluon/chronos-2-small` |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Chronos-2-small, un modelo fundacional de series temporales de la familia Chronos de Amazon Science. Los nombres de los modulos objetivo (`self_attention.q/k/v/o` y `output_patch_embedding.output_layer`) indican que el ajuste afecta a las proyecciones de atencion y a la capa de salida del mecanismo de patch embedding, es decir, se adapta tanto la representacion interna como la proyeccion final de los parches temporales. El merge de los pesos LoRA lo realiza automaticamente el pipeline de Chronos-2, por lo que el adaptador no se usa de forma independiente.

Los datos de entrenamiento proceden de la plataforma de transparencia de ENTSO-E (precios day-ahead). El panel cubre 42 zonas europeas con frecuencia horaria, 3.599.592 filas de entrenamiento y un rango temporal del 31 de diciembre de 2014 al 31 de julio de 2025. Los ultimos 12 meses se reservaron como holdout para la evaluacion. No se usaron covariables meteorologicas durante el entrenamiento, aunque el autor indica que pueden aportarse en inferencia mediante `predict_df` (por ejemplo, datos de Open-Meteo). Los hiperparametros son: modo de ajuste LoRA, r=8, alpha=16, learning rate 1e-5, 5000 pasos, batch size 64, context length 2048 y prediction length 24. El entrenamiento se ejecuto en una NVIDIA GeForce RTX 5090 en RunPod. No se documenta en la informacion disponible el uso de RLHF, DPO ni otras fases de alineacion, lo cual es coherente con un modelo de forecasting y no de lenguaje.

## Capacidades

- Prediccion univariante del precio day-ahead horario con horizonte fijo de 24 horas para zonas de subasta europeas incluidas en el panel de entrenamiento.
- Prediccion probabilistica: el autor indica que las salidas son previsiones puntuales y por cuantiles.
- Aceptacion opcional de covariables meteorologicas en inferencia mediante `predict_df` (por ejemplo, Open-Meteo), aunque no se usaron en entrenamiento.
- Integracion directa con el pipeline oficial de Chronos-2 (`Chronos2Pipeline`), que fusiona los pesos LoRA al cargar el adaptador.
- Entrada en formato de tensor con forma `(n_series, n_variates, history_length)`, lo que permite procesar varias series en una misma llamada.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni procesamiento de lenguaje natural: es un modelo especializado exclusivamente en series temporales.

## Casos de uso

- Ofertas en el mercado diario: un participante puede generar previsiones horarias de precio para las 24 horas del dia siguiente y usarlas como senal de entrada en la optimizacion de sus curvas de compra o venta. El horizonte de 24 pasos y la frecuencia horaria coinciden exactamente con la granularidad del mercado day-ahead.
- Arbitraje con almacenamiento en baterias: las previsiones horarias permiten a un operador de BESS planificar ciclos de carga y descarga segun el diferencial de precios esperado entre horas, usando los cuantiles para dimensionar el riesgo.
- Valoracion de ingresos de activos renovables: un propietario de parque solar o eolico puede estimar el precio de captura esperado por hora y calcular escenarios de ingresos para PPAs o presupuestos anuales.
- Gestion de demanda industrial: un consumidor electrointensivo puede desplazar cargas a las franjas horarias con precio previsto mas bajo, reduciendo el coste energetico sin comprometer el proceso productivo.
- Investigacion academica en forecasting energetico: sirve como baseline reproducible con protocolo documentado (walk-forward, 2 origenes aleatorios por mes, seed 42) para comparar tecnicas de adaptacion eficiente de parametros frente al zero-shot.
- Prototipado de estrategias para comercializadoras: una comercializadora puede simular el coste de aprovisionamiento de su cartera de clientes con previsiones horarias antes de comprometer coberturas a plazo.
- Analisis de escenarios con covariables meteorologicas: el soporte de `predict_df` con datos de Open-Meteo permite estudiar como cambian las previsiones al incorporar informacion de temperatura o viento, util en zonas con alta penetracion renovable.
- Evaluacion comparativa de adaptadores regionales: dado que existe un adaptador hermano solo para Polonia, el par permite estudiar el equilibrio entre especializacion por zona y generalizacion paneuropea.

## Benchmarks y rendimiento

Los datos de evaluacion proceden de la model card. Se trata de un backtest walk-forward sobre los 12 meses reservados de Polonia (PL), con 2 dias de origen aleatorios por mes natural, horizonte de 24 horas, frecuencia horaria y `random_seed=42`. La metrica principal es el MASE; el MASE se escala con el naive estacional en muestra sobre el contexto hasta cada origen.

| Modelo | Covariables | MASE zero-shot | MASE con LoRA | Delta MASE |
|---|---|---:|---:|---:|
| chronos-2 | ninguna | 0,824 | 0,595 | +27,8 % |
| chronos-2 | actual_weather | 0,779 | 0,556 | +28,6 % |
| chronos-2-small | ninguna | 0,843 | 0,611 | +27,6 % |
| chronos-2-small | actual_weather | 0,814 | 0,593 | +27,1 % |

El autor indica que el fichero `eval_results.json` del repositorio contiene las metricas estructuradas. No se publican en la informacion disponible resultados por zona individual ni metricas adicionales como RMSE o MAE desagregadas, mas alla de que el MAE tambien se calcula.

## Requisitos de hardware

- VRAM de inferencia: no disponible. El repositorio ocupa menos de 0,1 GB, pero no se publican cifras de memoria del modelo base ni del adaptador cargado.
- GPU de entrenamiento documentada: NVIDIA GeForce RTX 5090 (RunPod), es decir, el ajuste LoRA completo se realizo en una GPU de gama de consumo.
- GPU recomendadas para inferencia: no disponible. Dado que el modelo base es la variante "small" de Chronos-2, es razonable esperar despliegue en GPU de consumo, pero el autor no aporta cifras que lo confirmen.
- Opciones de despliegue: el unico camino soportado explicitamente es el pipeline oficial de Chronos-2 (`pip install chronos-forecasting peft torch`) cargando el adaptador con `Chronos2Pipeline.from_pretrained()`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Tampoco se publican tiempos de inferencia por serie ni por lote.
- Nota practica: la carga requiere `chronos-forecasting`, `peft` y `torch`, y el adaptador se fusiona con el modelo base en el momento de la carga, por lo que hay que prever memoria tanto para el base como para el resultado fusionado.

## Comparativa con modelos similares

| Modelo | Tipo | Cobertura | Contexto / horizonte | MASE (PL, holdout) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| chronos-2-small LoRA EU day-ahead | Adaptador LoRA | 42 zonas ENTSO-E (sin DE_AT_LU) | 2048 / 24 h | 0,611 (sin covariables) | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| chronos-2-small (zero-shot) | Modelo fundacional | Multidominio | 2048 / 24 h segun configuracion del adaptador | 0,843 (sin covariables) | Segun modelo base | HuggingFace (`autogluon/chronos-2-small`) |
| chronos-2 (zero-shot) | Modelo fundacional | Multidominio | No disponible | 0,824 (sin covariables) | Segun modelo base | HuggingFace |
| albertooooz/chronos-2-small-lora-pl-day-ahead | Adaptador LoRA | Polonia | No disponible | No disponible | No disponible | HuggingFace |

El adaptador hermano para Polonia existe y comparte protocolo de evaluacion (walk-forward sobre PL con la misma semilla y numero de origenes), segun la model card, pero no se han facilitado sus cifras de MASE en la informacion disponible. Las comparaciones entre adaptadores regionales, por tanto, no pueden cuantificarse con los datos actuales.

## Limitaciones y advertencias

- Entrenado conjuntamente sobre 42 series day-ahead europeas; la zona historica DE_AT_LU queda excluida y no debe solicitarse.
- La tabla de evaluacion corresponde unicamente al walk-forward de Polonia (PL), no a un ranking por zona. El rendimiento en otras zonas del panel no esta documentado.
- No modela factores fundamentales como precios de combustibles, indisponibilidades de generacion, congestiones o flujos transfronterizos. Solo explota el historico de precios y, opcionalmente, covariables meteorologicas en inferencia.
- Las covariables meteorologicas no se usaron en entrenamiento; su efecto en produccion es incierto y debe validarse caso por caso.
- Las salidas son previsiones probabilisticas puntuales y por cuantiles: el autor recomienda validarlas antes de cualquier uso en produccion.
- El autor declara explicitamente que no constituye asesoramiento financiero ni de trading, ni sustituye a la prevision profesional de mercados energeticos o a la gestion de riesgos.
- Al ser un adaptador LoRA, no funciona de forma aislada: requiere cargar `autogluon/chronos-2-small` y el pipeline de Chronos-2. Cualquier cambio de version del modelo base puede afectar a la compatibilidad.
- Licencia Apache 2.0, que permite uso comercial, pero el usuario debe verificar tambien las condiciones del modelo base y de los datos de ENTSO-E conforme a sus terminos de uso.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.
- Riesgo de sesgo temporal: la ventana de evaluacion es de 12 meses y el protocolo usa 2 origenes aleatorios por mes, lo que limita la cobertura de condiciones extremas de mercado no presentes en ese periodo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/albertooooz/chronos-2-small-lora-eu-day-ahead
- Modelo base: https://huggingface.co/autogluon/chronos-2-small
- Adaptador hermano para Polonia: https://huggingface.co/albertooooz/chronos-2-small-lora-pl-day-ahead
- Perfil del autor: https://huggingface.co/albertooooz
- Metricas estructuradas: `eval_results.json` en el repositorio del modelo
- Sitio de la familia Chronos: https://chronos-ts.ai/
- Repositorio oficial de Chronos Forecasting (Amazon Science): https://github.com/amazon-science/chronos-forecasting
