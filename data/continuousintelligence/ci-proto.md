# ContinuousIntelligence/ci-proto

## Resumen

ci-proto es un modelo fundacional de series temporales desarrollado por Continuous Intelligence Limited, disenado especificamente para forecasting probabilistico zero-shot. A diferencia de los modelos de lenguaje, su entrada son una o varias series temporales (con covariables pasadas y futuras opcionales, marcas de tiempo y series relacionadas) y su salida son nueve cuantiles entre 0,1 y 0,9 para cada paso de prediccion, lo que permite cuantificar la incertidumbre de forma nativa. El modelo tiene 167 millones de parametros y se distribuye con un paquete Python propio (`continuousintelligence`) que abstrae la carga, el preprocesado y la calibracion.

La propuesta de valor principal es su ventana de contexto de mas de 2 millones de pasos temporales, que segun el autor multiplica por 64 la historia que procesan otros modelos fundacionales de series temporales. Esto lo hace adecuado para series de alta frecuencia o con historiales muy largos. Ademas, soporta forecasting multivariante (aprovecha relaciones entre senales) y puede ejecutarse tanto en CPU como en GPU con la misma API.

El modelo se publica como version preliminar ("proto") de la linea de producto de la compania, con una licencia propia (`ci-proto-licence`) y un enfoque de acceso controlado mediante lista de espera y un programa de socios de diseno. Es relevante porque reclama el primer puesto en fev-bench, un benchmark de forecasting con 100 tareas evaluadas en zero-shot, aunque los resultados numericos no se detallan en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo fundacional de series temporales, transformer presumiblemente, sin confirmar) |
| Parametros totales | 167M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | mas de 2.000.000 de pasos temporales (segun el autor); `model.ckpt` cubre hasta 16.384 pasos y `model-long.ckpt` historiales mas largos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de series temporales, no de texto) |
| Licencia | ci-proto-licence (propietaria, ver enlace) |
| Formato de pesos | `model.ckpt`, `model-long.ckpt`, `tta.json`, `config.json` (checkpoints propios, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna (tipo de bloque, mecanismo de atencion, capas, dimensiones ocultas). Se describe como un modelo fundacional preentrenado para forecasting probabilistico zero-shot, con 167 millones de parametros. La entrada admite una o varias series objetivo, covariables pasadas y futuras, marcas de tiempo y series relacionadas; la salida son nueve cuantiles (0,1 a 0,9) por cada objetivo y paso de prediccion. El paquete incluye dos checkpoints: `model.ckpt` para historiales de hasta 16.384 pasos y `model-long.ckpt` para historiales mas largos, seleccionado automaticamente. El fichero `tta.json` contiene los ajustes de preprocesado y calibracion (test-time adaptation), y `config.json` la informacion del modelo.

El entrenamiento se realizo sobre "un corpus amplio de series temporales reales y sinteticas", sin especificar numero de tokens, composicion del dataset, ni si se emplearon tecnicas de RLHF/DPO (no aplicables en este dominio, pero tampoco se menciona ningun esquema de ajuste por preferencias o calibracion supervisada mas alla del TTA). La evaluacion se hizo en zero-shot sobre las 100 tareas de fev-bench, aplicando el preprocesado y la calibracion publicados en `tta.json`, y se puntuo con scaled quantile loss. No se detalla ninguna innovacion arquitectonica concreta (atencion lineal, decodificacion especulativa, SSM, etc.) en la informacion proporcionada.

## Capacidades

- Forecasting probabilistico: genera nueve cuantiles (0,1 a 0,9) por objetivo y paso, permitiendo construir intervalos de prediccion y bandas de incertidumbre.
- Forecasting multivariante: modela relaciones entre multiples senales para mejorar la precision.
- Covariables: admite covariables pasadas y futuras, entradas categoricas, marcas de tiempo y series relacionadas.
- Contexto largo: procesa historiales de mas de 2 millones de pasos (segun el autor), con gestion automatica del checkpoint largo.
- Forecasting con datos faltantes: el notebook de ejemplo documenta prediccion a traves de huecos en los datos.
- Ejecucion en CPU y GPU con la misma API Python.
- Zero-shot: no requiere entrenamiento especifico por serie o dominio.
- No soporta generacion de texto, codigo, vision, audio, tool calling ni razonamiento multi-paso en el sentido de los LLM; su ambito es exclusivamente la prediccion de series temporales.

## Casos de uso

- Prediccion de demanda energetica: usar el historial horario de consumo de un edificio o de una red de distribucion como serie objetivo y las variables meteorologicas como covariables futuras para obtener, con antelacion de 24 a 168 horas, los cuantiles de demanda y dimensionar reservas de generacion con bandas de incertidumbre.
- Planificacion de inventario y cadena de suministro: alimentar el modelo con el historial de ventas por SKU y las promociones o festivos como covariables futuras, y usar los cuantiles 0,1 y 0,9 para fijar stock de seguridad y el cuantil 0,5 para la previsión central.
- Prediccion de trafico y movilidad: series de aforo de vehiculos o de demanda de transporte publico con contexto largo (meses de datos horarios) y covariables de calendario para anticipar picos y planificar capacidad.
- Monitorizacion de infraestructura y capacidad: series de latencia, throughput o uso de CPU por servicio, con forecasting multivariante que explota correlaciones entre metricas para detectar desviaciones futuras y disparar alertas con umbrales basados en cuantiles.
- Forecasting financiero de alta frecuencia: series de precios, volumen o volatilidad con historiales largos, usando la ventana de mas de 2 millones de pasos para capturar estacionalidades y regimenes, y los cuantiles para construir intervalos de riesgo.
- Prediccion de demanda en servicios publicos (bicicletas compartidas, agua, residuos): el propio ejemplo de la model card predice la demanda horaria de alquiler de bicicletas en Washington D.C. a partir de cinco dias de historial, un escenario replicable en cualquier operador de flotas o servicio municipal.
- Investigacion en series temporales: servir como baseline zero-shot en fev-bench y como referencia para comparar metodos de calibracion y preprocesado, dado que el paquete expone `tta.json` y los checkpoints.

## Benchmarks y rendimiento

La model card afirma que ci-proto es el modelo numero 1 en fev-bench, evaluado en zero-shot sobre las 100 tareas del benchmark con scaled quantile loss (cuanto menor, mejor), aplicando el preprocesado y la calibracion de `tta.json`. Sin embargo, no se proporcionan los valores numericos de la metrica ni la tabla de comparacion con otros modelos; solo se incluye una grafica (Pareto frontier de perdida frente a numero de parametros) sin cifras en el texto. Por tanto:

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 167M de parametros, en fp32 el modelo ocupa aproximadamente 0,67 GB de pesos, y el repo completo pesa 1,3 GB. La memoria adicional dependera de la longitud del historial y del numero de series, que no se detalla.
- GPU recomendadas: no se especifican modelos concretos; la model card solo indica soporte CUDA cuando esta disponible.
- Compatibilidad con GPU de consumo: probable por el tamano (167M de parametros), pero no confirmado en la informacion disponible.
- Opciones de despliegue: paquete Python oficial `continuousintelligence` (instalacion via `pip`, Python 3.10-3.14), con ejecucion en CPU y GPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La model card menciona de forma generica "otros modelos fundacionales de series temporales" y afirma que ci-proto procesa 64 veces mas historia que cualquiera de ellos, pero no identifica modelos concretos ni ofrece una tabla comparativa con cifras. No se dispone de datos verificables de alternativas en la informacion proporcionada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ci-proto | 167M | mas de 2.000.000 de pasos (segun autor) | #1 en fev-bench segun autor (sin cifras) | ci-proto-licence (propietaria) | Hugging Face, acceso via lista de espera para proximas versiones |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los resultados de rendimiento son afirmaciones del autor sin cifras publicadas en la model card; la posicion en fev-bench no puede verificarse con los datos disponibles.
- La licencia es propietaria (`ci-proto-licence`) y no se detallan en la informacion disponible las restricciones de uso comercial; es imprescindible leer el fichero LICENCE antes de cualquier despliegue en produccion.
- El modelo se presenta como version preliminar ("proto"); el autor anuncia una proxima release y mantiene una lista de espera, lo que sugiere que la API y los pesos pueden cambiar.
- No se documentan sesgos, riesgos de alucinacion (en el sentido de predicciones infundadas) ni limitaciones por dominio o idioma; al ser un modelo de series temporales, el riesgo principal es la extrapolacion incorrecta ante cambios de regimen o datos fuera de distribucion.
- No se especifican los tipos de cuantizacion ni los requisitos exactos de memoria, lo que dificulta planificar el despliegue en entornos con recursos limitados.
- El contexto de mas de 2 millones de pasos se gestiona mediante dos checkpoints (`model.ckpt` y `model-long.ckpt`) con seleccion automatica; el comportamiento exacto en el limite y el coste computacional de historiales largos no se detallan.
- La evaluacion es exclusivamente zero-shot sobre fev-bench; no hay datos sobre fine-tuning, adaptacion a dominios concretos ni rendimiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ContinuousIntelligence/ci-proto
- Licencia: https://huggingface.co/ContinuousIntelligence/ci-proto/blob/main/LICENCE
- Repositorio del paquete y ejemplos: https://github.com/continuousintelligence/ci
- Notebook de ejemplo (walkthrough): https://github.com/continuousintelligence/ci/blob/main/examples/walkthrough.ipynb
- Documentacion de uso del paquete: https://github.com/continuousintelligence/ci#usage-details
- Leaderboard de fev-bench: https://huggingface.co/spaces/autogluon/fev-leaderboard
- Lista de espera de la proxima release: https://www.continuousintelligence.co.uk/waitlist
- Programa Design Partner: https://docs.google.com/forms/d/e/1FAIpQLSdn59prmnz5KpJtVQlyo1FFGLA_YgIB93Z5E5pVIvpTYBnFuw/viewform
- Dataset de ejemplo (Bike Sharing, UCI): https://doi.org/10.24432/C5W894
