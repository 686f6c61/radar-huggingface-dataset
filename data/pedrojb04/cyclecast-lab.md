# pedrojb04/cyclecast-lab

## Resumen

CycleCast Lab es un modelo de regresion tabular publicado en HuggingFace por el usuario pedrojb04. No es un modelo de lenguaje: se trata de una red neuronal de dos capas ocultas con activacion ReLU, entrenada desde cero sobre el dataset historico UCI Bike Sharing (Fanaee-T, 2013) para predecir la demanda total diaria de alquiler de bicicletas con un horizonte de un dia. El modelo toma como entrada los siete dias completos anteriores (del mas antiguo al mas reciente) junto con caracteristicas ciclicas del dia de la semana y del dia del ano objetivo, y no utiliza datos meteorologicos futuros ni informacion de demanda del dia a predecir.

La relevancia de esta ficha es limitada: se trata de un artefacto de demostracion de un proyecto personal (CycleCast Lab), con cero descargas y cero likes en el momento de la consulta, y sin publicacion de resultados en benchmarks estandar. Su interes tecnico reside en la trazabilidad metodologica: separacion cronologica estricta por fecha objetivo, ajuste de escalado solo con datos de entrenamiento, evaluacion con intervalo empirico y ausencia de uso de pickle (los pesos se serializan en JSON).

El modelo se distribuye bajo licencia MIT, con la salvedad de que el dataset subyacente tiene licencia CC BY 4.0 y no se incluye en el repositorio. El entrenamiento se realizo exclusivamente en CPU y el autor advierte explicitamente de que no debe usarse para decisiones operativas o de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward (MLP) con dos capas ocultas y activacion ReLU |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular: 7 dias previos + caracteristicas ciclicas) |
| Tipos de cuantizacion | no disponible (pesos en JSON; no se documentan esquemas de cuantizacion) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | MIT (codigo y modelo); dataset subyacente CC BY 4.0 |
| Formato de pesos | JSON (junto con parametros de escalado ajustados solo en entrenamiento) |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal fully connected con dos capas ocultas y activacion ReLU, implementada con scikit-learn y entrenada desde cero. La entrada combina una ventana de siete dias completos previos de alquileres diarios totales (ordenados del mas antiguo al mas reciente) con caracteristicas ciclicas del dia de la semana y del dia del ano del objetivo. No hay acceso a meteorologia futura, demanda del dia objetivo ni desglose por tipo de usuario. Los pesos y los parametros del escalador se almacenan en JSON y se evaluan sin `pickle`.

El entrenamiento sigue un esquema de particion cronologica por fecha objetivo: 602 objetivos de entrenamiento hasta el 2012-08-31, 61 de validacion en septiembre-octubre y 61 de test en noviembre-diciembre. El escalado y el ajuste del modelo se realizan solo con datos de entrenamiento; el radio del intervalo se fija con los errores absolutos de validacion y el conjunto de test se reserva unicamente para la evaluacion final, sin seleccion de modelo sobre test. El entrenamiento se ejecuto exclusivamente en CPU. No se documenta el numero de tokens (no aplica), la composicion del dataset mas alla del UCI Bike Sharing, ni el uso de RLHF/DPO (no aplica a un modelo tabular).

## Capacidades

- Regresion tabular: prediccion de la demanda total diaria de alquiler de bicicletas con horizonte de un dia.
- Entrada de series temporales: utiliza una ventana fija de siete dias completos previos.
- Codificacion ciclica: incorpora el dia de la semana y el dia del ano como caracteristicas.
- Estimacion de incertidumbre: proporciona un intervalo empirico basado en el radio de error absoluto de validacion.
- Serializacion segura: pesos en JSON sin uso de `pickle`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no es un modelo linguistico).
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Demostracion docente de pipelines de forecasting tabular: el modelo sirve como ejemplo reproducible de particion cronologica, escalado sin fuga de datos y evaluacion con intervalo empirico en un curso de machine learning.
- Prototipado de prediccion de demanda en sistemas de bike-sharing: util como punto de partida para experimentar con ventanas de entrada y caracteristicas ciclicas antes de invertir en modelos mas complejos.
- Comparacion de lineas base: el baseline de "mismo dia de la semana anterior" documentado (MAE 1486,70) permite contrastar mejoras de arquitecturas alternativas sobre el mismo split.
- Validacion de metodologia sin `pickle`: el formato JSON facilita auditorias de seguridad en entornos donde la deserializacion de `pickle` esta prohibida.
- Reproduccion de resultados: el manifiesto de entrenamiento (`training-manifest.json`) con snapshot, SHA de artefactos y commit exacto permite replicar el experimento.
- Estudio de calibracion de intervalos: el intervalo empirico con cobertura de test del 96,72% (59/61) y anchura media de 4404,98 alquileres es un caso practico para analizar las limitaciones de los intervalos por orden estadistico en series temporales.

## Benchmarks y rendimiento

| Metrica | CycleCast Lab | Baseline (mismo dia, semana anterior) |
|---|---|---|
| MAE test (alquileres/dia) | 924,62 | 1486,70 |
| RMSE test | 1120,41 | 1968,91 |
| MAE noviembre | 900,32 | no disponible |
| MAE diciembre | 948,14 | no disponible |
| Cobertura del intervalo (test) | 59/61 (96,72%) | no disponible |
| Anchura media del intervalo | 4404,98 alquileres | no disponible |
| Radio empirico del intervalo | 2222,16 alquileres | no disponible |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, dado que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo es una MLP tabular de dos capas ocultas que se ejecuta en CPU.
- GPU recomendadas: no necesarias; el entrenamiento documentado se realizo exclusivamente en CPU.
- Cabe en cualquier equipo consumer: si, incluidos portatiles sin GPU dedicada.
- Opciones de despliegue: evaluacion directa con scikit-learn cargando los pesos JSON; el repositorio CycleCast Lab documenta el procedimiento sin `pickle`.
- Latencia y throughput: no disponibles en la informacion proporcionada; por la naturaleza del modelo (una inferencia por dia objetivo) se espera latencia despreciable en CPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | MAE test | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CycleCast Lab | MLP tabular (2 capas ocultas) | no disponible | ventana de 7 dias | 924,62 | MIT | HuggingFace (0 descargas) |
| Baseline mismo dia semana anterior | Regla naive | 0 | 7 dias | 1486,70 | no aplica | incluido en la evaluacion |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se identifican en la informacion proporcionada otros modelos publicos de la misma categoria (forecasting tabular sobre UCI Bike Sharing) con los que establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: los datos describen un unico sistema de bike-sharing en 2011-2012; no representan la demanda actual, otras ciudades ni una distribucion representativa de eventos.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero el modelo puede producir predicciones muy inciertas; la interfaz muestra un rango empirico, no una prediccion garantizada.
- Limitaciones de contexto: sin feed en vivo, sin prevision meteorologica, sin indicador de festivos, sin intervenciones, sin capacidad ni validacion externa.
- Cambios operativos: los conteos pueden variar por capacidad, estacionalidad o cambios operativos no capturados por el modelo.
- Cobertura del intervalo: el orden estadistico aspira al 90% bajo intercambiabilidad, pero los residuos de series temporales y los cambios de distribucion violan ese supuesto; no hay garantia de cobertura futura.
- Restricciones de licencia: el codigo y el modelo son MIT, pero el dataset subyacente es CC BY 4.0 y no se incluye; es obligatorio citar el dataset y el trabajo original.
- Uso prohibido: el autor indica explicitamente que no debe usarse para decisiones operativas o de seguridad.
- Madurez: cero descargas y cero likes en el momento de la consulta; sin validacion externa ni comunidad de usuarios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pedrojb04/cyclecast-lab
- Repositorio CycleCast Lab: https://github.com/pedrojbDev/cyclecast-lab
- Dataset UCI Bike Sharing: https://archive.ics.uci.edu/dataset/275/bike+sharing+dataset
- DOI del dataset: https://doi.org/10.24432/C5W894
- Licencia del dataset (CC BY 4.0): https://creativecommons.org/licenses/by/4.0/
- Paper original (Fanaee-T y Gama, 2013): https://doi.org/10.1007/s13748-013-0040-3
