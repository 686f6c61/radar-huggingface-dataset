# MyHeartCounts/openmhc-mixlinear-fc

## Resumen

OpenMHC Forecasting — MixLinear es un checkpoint de referencia del track 3 (forecasting) del benchmark de salud basado en wearables MyHeartCounts / OpenMHC, publicado por el equipo MyHeartCounts. El modelo implementa MixLinear, un predictor extremadamente ligero que combina modelado lineal por segmentos en el dominio temporal con filtrado adaptativo de bajo rango en el dominio de la frecuencia, tal como se describe en el articulo de Ma et al. (2024). No es un modelo de lenguaje: es un modelo de series temporales multivariantes orientado a la prediccion horaria de senales de sensores corporales.

La tarea concreta es la prediccion a 24 horas vista sobre 19 canales de sensores con resolucion horaria, entrenado desde cero sobre el split de entrenamiento del benchmark OpenMHC mediante la implementacion de PyPOTS. Su relevancia actual radica en que sirve como linea base metodologica reproducible para comparar arquitecturas de forecasting en el dominio de salud digital, con un coste computacional minimo (el articulo original lo describe como un modelo de aproximadamente 0,1K parametros).

El checkpoint se distribuye en formato nativo de PyPOTS, junto con las estadisticas del escalador estandar y la configuracion de entrenamiento, y esta pensado exclusivamente para investigacion, comparacion metodologica y reproduccion del benchmark. La model card excluye explicitamente cualquier uso clinico, diagnostico o de soporte a decisiones medicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MixLinear (modelado lineal por segmentos en dominio temporal + filtrado adaptativo de bajo rango en dominio frecuencial) |
| Parametros totales | aproximadamente 0,1K (segun el articulo de referencia; el valor exacto del checkpoint no se detalla) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible; la tarea define horizonte de prediccion de 24 horas sobre 19 canales con resolucion horaria |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no linguistico) |
| Licencia | BigScience OpenRAIL-M |
| Formato de pesos | checkpoint PyPOTS (`model.pypots`) + `standard_scaler_stats.json` + `training_config.json` |

## Arquitectura y entrenamiento

MixLinear es una arquitectura de forecasting multivariante disenada para un regimen de recursos extremadamente bajos. Combina dos componentes: un modelado lineal basado en segmentos en el dominio del tiempo, que captura tendencias locales y patrones de corto plazo por canal, y un filtrado adaptativo de bajo rango en el dominio de la frecuencia, que aisla componentes periodicas relevantes (por ejemplo, ritmos circadianos en senales de wearables) con un numero muy reducido de parametros. El articulo de referencia cifra el modelo en torno a 0,1K parametros, lo que lo situa orders de magnitud por debajo de arquitecturas transformer habituales en forecasting.

El checkpoint se ha entrenado desde cero sobre el split de entrenamiento del benchmark OpenMHC usando la implementacion de PyPOTS (requiere `pypots>=1.2`). La model card no detalla el numero de tokens ni la composicion exacta del dataset mas alla de la referencia al benchmark; indica que el manifiesto `openmhc_manifest.json` contiene la procedencia del entrenamiento (run, modelo base y detalles de fine-tuning). No se menciona el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo de series temporales.

## Capacidades

- Prediccion de series temporales multivariantes a 24 horas vista sobre 19 canales de sensores con resolucion horaria.
- Modelado de estacionalidad y componentes periodicas mediante filtrado frecuencial de bajo rango.
- Captura de tendencias locales por canal mediante segmentacion lineal en el dominio temporal.
- Inferencia con huella computacional minima (aproximadamente 0,1K parametros), adecuada para entornos con recursos limitados.
- Integracion con el harness de evaluacion de OpenMHC mediante `openmhc.evaluate_forecasting`.
- Carga directa desde Hugging Face a traves de `MixLinearForecaster.from_release`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues, al no ser un modelo linguistico.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Reproduccion del benchmark OpenMHC: cargar el checkpoint con `MixLinearForecaster.from_release("hf://MyHeartCounts/openmhc-mixlinear-fc@v1.1")` y ejecutar `openmhc.evaluate_forecasting` para obtener resultados comparables con otras arquitecturas del track de forecasting.
- Linea base metodologica en investigacion: usar MixLinear como referencia de coste minimo frente a modelos mas complejos (transformers, SSM) para cuantificar la ganancia real de arquitecturas pesadas en forecasting de wearables.
- Prototipado rapido de pipelines de forecasting: al tener un coste de inferencia minimo, permite iterar sobre preprocesado, escalado y ventanas temporales sin cuellos de botella de computo.
- Validacion de infraestructura de evaluacion: servir como checkpoint de humo (smoke test) para verificar que el harness de OpenMHC, la carga desde Hugging Face y el pipeline de metricas funcionan correctamente antes de evaluar modelos mayores.
- Experimentos de ablacion sobre componentes: al separar modelado temporal y frecuencial, permite estudiar el impacto de cada componente en el error de prediccion sobre senales de wearables.
- Docencia y formacion: ejemplo didactico de forecasting multivariante de bajo coste con implementacion abierta en PyPOTS, util para cursos de series temporales aplicadas a salud digital.
- Despliegue en dispositivos con recursos restringidos: su tamano minimo lo hace candidato para pruebas de concepto de prediccion local en entornos embebidos, siempre dentro del marco de uso exclusivamente investigador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con aproximadamente 0,1K parametros, el modelo cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU moderna (incluso integradas) es suficiente dado el tamano del modelo.
- Cabe en GPU consumer: si, con margen amplisimo; el cuello de botella sera el preprocesado de datos, no el modelo.
- Opciones de despliegue: libreria `openmhc` con extra `pypots` (`pip install "openmhc[pypots]"`), que requiere `pypots>=1.2`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo linguistico.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| OpenMHC MixLinear (este checkpoint) | aproximadamente 0,1K | Forecasting 24 h, 19 canales, resolucion horaria | BigScience OpenRAIL-M | Hugging Face (MyHeartCounts) |
| Alternativas del track 3 de OpenMHC | no disponible | misma tarea de forecasting | no disponible | no disponible |
| Otras arquitecturas de forecasting en PyPOTS | no disponible | forecasting multivariante generico | no disponible | GitHub / PyPOTS |

No se dispone de datos publicados en la informacion proporcionada sobre otros checkpoints comparables del mismo benchmark ni sobre sus metricas, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Uso exclusivamente investigador: la model card excluye explicitamente diagnostico, cribado, pronostico, prediccion prospectiva de riesgo y soporte a decisiones clinicas.
- Las etiquetas de condicion medica de OpenMHC son autoinformadas y carecen de fechas de diagnostico; el rendimiento en el benchmark no establece utilidad clinica.
- Cualquier afirmacion diagnostica o pronostica requeriria validacion independiente con resultados adjudicados clinicamente y alineados temporalmente en la poblacion objetivo.
- La licencia BigScience OpenRAIL-M incluye restricciones de uso en su Anexo A que prohiben, entre otras cosas, proporcionar consejo medico e interpretacion de resultados medicos; estas restricciones se aplican al checkpoint y a sus derivados.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero el modelo puede producir predicciones erroneas o poco calibradas fuera de la distribucion de entrenamiento del benchmark.
- No se documentan sesgos demograficos ni limitaciones de idioma, al no ser un modelo linguistico; sin embargo, la representatividad de la cohorte de entrenamiento condiciona la generalizacion.
- El checkpoint esta en formato PyPOTS y requiere la libreria `openmhc` con `pypots>=1.2`; no es directamente compatible con stacks de inferencia estandar de modelos de lenguaje.
- No se han publicado metricas de rendimiento en la informacion disponible, lo que impide evaluar su calidad predictiva sin ejecutar el harness.
- Las fechas de creacion y actualizacion del repositorio (2026) deben tratarse con cautela si se contrastan con fuentes externas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MyHeartCounts/openmhc-mixlinear-fc
- Implementacion PyPOTS: https://github.com/WenjieDu/PyPOTS
- Documentacion PyPOTS: https://docs.pypots.com
- Paper MixLinear (Ma et al., 2024): https://arxiv.org/abs/2410.02081
- Licencia BigScience OpenRAIL-M: https://huggingface.co/MyHeartCounts/openmhc-mixlinear-fc/blob/main/LICENSE
