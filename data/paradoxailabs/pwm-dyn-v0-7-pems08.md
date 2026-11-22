# PARADOXAIlabs/pwm-dyn-v0.7-pems08

## Resumen

PWM-Dyn v0.7 PEMS08 es un modelo de prediccion de series temporales espaciotemporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su linea Paradox World Model. Concretamente, es el modelo numero 13 de una serie de 56 publicados (numeros 01-59) y pertenece a la familia PWM-Dyn. Su tarea especifica es la prediccion de los siguientes 12 pasos temporales de trafico viario en condiciones de fallo de sensores (sensor outages), entrenado sobre el conjunto de datos PEMS08 del distrito 8 de Caltrans (San Bernardino, 170 sensores, julio-agosto de 2016).

El modelo es extremadamente compacto: 317.092 parametros totales, lo que lo situa en la categoria de modelos ligeros para inferencia en el borde o en entornos con recursos muy limitados. No es un modelo de lenguaje ni un transformer generativo de proposito general, sino un modelo especializado de forecasting espaciotemporal con pesos en formato PyTorch (`.pt`). Se distribuye bajo licencia Apache-2.0.

La relevancia de esta version radica en su enfoque en robustez ante fallos de sensores: segun la model card, incorpora entrenamiento con outages reales y una base de fallback que reduce el error en escenarios de outage real entre un 11% y un 22% respecto a v0.6 en cinco redes, con un coste en escenarios limpios de solo +0,4% a +1,8%. El resultado registrado es un MAE de 14,22 en test limpio y 18,09 en outages reales (Track G) sobre ParadoxBench-1.2, con un ensemble de 3 semillas (este archivo es la semilla 200).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de forecasting espaciotemporal; codigo en repositorio GitHub) |
| Parametros totales | 317.092 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (tarea: prediccion de 12 pasos siguientes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de series temporales, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict (`.pt`, 1.304.641 bytes) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo mas alla de que se trata de un modelo de forecasting espaciotemporal para trafico. La model card indica que el codigo de arquitectura de esta version esta en el repositorio GitHub de ParadoxAI Lab y que la configuracion de entrenamiento se almacena dentro del propio archivo de pesos (bajo la clave `ck['cfg']`). El checkpoint contiene un diccionario con metadatos (`meta`), los pesos (`weights`) y todos los resultados registrados junto con los logs de ejecucion (`results`).

El entrenamiento se realizo el 2026-11-04 mediante un cuaderno de Kaggle (version 365414722, commit b0f6a08) y el modelo se publico el 2026-11-17. Los datos de entrenamiento no se incluyen en el repositorio; sus fuentes y terminos se documentan en `DATA_SOURCES.md`. El conjunto de datos es PEMS08 (Caltrans PeMS District 8, San Bernardino; 170 sensores; julio-agosto de 2016). La innovacion destacada de esta version es la incorporacion de entrenamiento con outages reales y una base de fallback, que mejora la robustez ante fallos de sensores. No se especifica el numero de tokens ni la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF/DPO (no aplicables a este tipo de modelo).

## Capacidades

- Prediccion de los siguientes 12 pasos temporales de flujo de trafico viario.
- Forecasting espaciotemporal sobre redes de sensores (170 sensores en PEMS08).
- Robustez ante fallos de sensores (sensor outages) gracias al entrenamiento con outages reales y base de fallback.
- Inferencia en CPU (el ejemplo de carga usa `map_location="cpu"`), adecuada para entornos con recursos limitados.
- Capacidad de ensemble multi-semilla (el resultado registrado emplea 3 semillas; este archivo es la semilla 200).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo numerico especializado.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Prediccion de trafico en tiempo real con sensores defectuosos: el modelo estima los proximos 12 pasos de flujo viario incluso cuando algunos sensores de la red estan caidos, gracias a su entrenamiento especifico con outages reales (MAE 18,09 en Track G).
- Gestion de incidencias en autopistas: integrado en un sistema de monitorizacion de Caltrans u operadores viales, permite anticipar congestiones cuando falla parte de la instrumentacion.
- Despliegue en dispositivos de borde: con solo 317.092 parametros y ~1,3 MB de pesos, cabe en microcontroladores o gateways de bajo coste para inferencia local en carretera.
- Ensemble de pronostico operativo: combinando las distintas semillas de la serie (como la semilla 200 aqui incluida) se reduce la varianza del pronostico en produccion.
- Investigacion en robustez de modelos espaciotemporales: sirve como baseline reproducible para estudiar el impacto de fallos de sensores en forecasting de trafico, con resultados y logs incluidos en el checkpoint.
- Simulacion y planificacion de infraestructuras: alimentar gemelos digitales de redes viarias con predicciones a corto plazo para evaluar escenarios de demanda.
- Benchmarking de tecnicas de imputacion y fallback: el modelo incorpora explicitamente una base de fallback, lo que lo hace util para comparar estrategias de recuperacion ante datos faltantes.

## Benchmarks y rendimiento

Resultados registrados en la model card sobre ParadoxBench-1.2 (ensemble de 3 semillas; este archivo es la semilla 200):

| Metrica | Valor |
|---|---|
| Test MAE (limpio) | 14,22 |
| Outages reales (Track G) | 18,09 |
| Mejora vs v0.6 en outages reales | -11% a -22% (en cinco redes) |
| Coste en escenarios limpios vs v0.6 | +0,4% a +1,8% |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K (no aplicables a este tipo de modelo), ni comparaciones numericas con otros modelos de forecasting de trafico.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable; con 317.092 parametros y un archivo de 1,3 MB, el modelo cabe en memoria de cualquier dispositivo.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU consumer (incluso integradas) es suficiente.
- Cabe en GPU consumer: si, en cualquier GPU consumer e incluso en CPU y dispositivos embebidos.
- Opciones de despliegue: PyTorch nativo (carga via `torch.load` y `huggingface_hub.hf_hub_download`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de otros modelos comparables de forecasting espaciotemporal de trafico (por ejemplo, variantes de Graph WaveNet, STGCN, DCRNN o METR-LA/PEMS benchmarks) con los que contrastar parametros, contexto o rendimiento. La unica comparacion disponible es interna a la serie: frente a PWM-Dyn v0.6, esta version reduce el error en outages reales entre un 11% y un 22% en cinco redes, con un incremento del 0,4%-1,8% en escenarios limpios.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-Dyn v0.7 PEMS08 | 317.092 | no disponible | MAE 14,22 limpio / 18,09 outage | Apache-2.0 | Hugging Face |
| PWM-Dyn v0.6 PEMS-Bay | no disponible | no disponible | peor en outages reales (-11% a -22%) | Apache-2.0 | Hugging Face |
| Alternativas externas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo altamente especializado: solo predice trafico viario sobre la red PEMS08; no es un modelo de proposito general ni de lenguaje.
- Entrenado exclusivamente con datos de PEMS08 (julio-agosto de 2016); su generalizacion a otras redes o periodos no esta documentada en la informacion disponible.
- Los resultados reportados (MAE 14,22 y 18,09) provienen de un ensemble de 3 semillas; este archivo concreto es la semilla 200, por lo que su rendimiento individual puede diferir del ensemble.
- La model card no detalla sesgos conocidos, riesgo de alucinacion (no aplicable en sentido estricto a un modelo numerico) ni limitaciones de contexto o idioma.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda revisar `DATA_SOURCES.md` para conocer los terminos de los datos de entrenamiento originales (Caltrans PeMS).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano del repo es de 0,0 GB; se trata de un modelo muy reciente y poco validado por la comunidad.
- No se incluyen los datos de entrenamiento en el repositorio, lo que limita la reproducibilidad completa sin consultar las fuentes externas.
- Advertencia de produccion: al ser un modelo de 317.092 parametros, su capacidad de modelado es limitada; conviene validarlo contra baselines mas potentes antes de usarlo en sistemas criticos de gestion de trafico.

## Enlaces

- Hugging Face: https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.7-pems08
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Resultados: https://github.com/paradoxailab/paradox-world-model/blob/main/RESULTS.md
- README de la version: https://github.com/paradoxailab/paradox-world-model/blob/main/v0.7-realworld/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Serie completa en Hugging Face: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Modelo anterior (v0.6): https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.6-pems-bay
- Modelo siguiente (v0.7 PEMS04): https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.7-pems04
- Sitio web: https://paradoxailab.com
