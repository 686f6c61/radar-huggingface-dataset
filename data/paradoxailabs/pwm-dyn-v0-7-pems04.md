# PARADOXAIlabs/pwm-dyn-v0.7-pems04

## Resumen

PWM-Dyn v0.7 PEMS04 es un modelo de prediccion de series temporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de la serie Paradox World Model. Es el modelo numero 14 de los 56 publicados en la familia PWM-Dyn, y su tarea concreta es predecir los siguientes 12 pasos de trafico viario en escenarios con sensores fuera de servicio. Se entrena y evalua sobre PEMS04, el conjunto de datos del distrito 4 de Caltrans en el area de la bahia de San Francisco (307 sensores, enero-febrero de 2018).

A diferencia de los modelos de lenguaje, se trata de un modelo neuronal compacto: 334.628 parametros en total, implementado en PyTorch. Su interes reside en la especializacion: la version v0.7 incorpora entrenamiento especifico para caidas reales de sensores, lo que reduce el error entre un 11 % y un 22 % frente a v0.6 en cinco redes distintas, con un coste de solo un 0,4-1,8 % de degradacion en condiciones limpias.

Es relevante para desarrolladores e investigadores que trabajan en prevision espacio-temporal de trafico, robustez ante datos faltantes y evaluacion de modelos de mundo (world models) aplicados a infraestructura urbana. El checkpoint publicado corresponde a la semilla 200 de un ensemble de tres semillas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (codigo en repositorio GitHub del autor) |
| Parametros totales | 334.628 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (horizonte de prediccion: 12 pasos) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precision original) |
| Idiomas soportados | no aplica (modelo numerico de series temporales) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, checkpoint con claves `meta`, `weights`, `results`, `cfg`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna; indica que el codigo de la version esta en el repositorio GitHub `paradoxailab/paradox-world-model` y que la configuracion de entrenamiento se almacena dentro del propio checkpoint en la clave `ck['cfg']`. El modelo pertenece a la familia PWM-Dyn (Paradox World Model, rama dinamica), orientada a forecasting espacio-temporal.

Los datos de entrenamiento son PEMS04 (Caltrans PeMS District 4, 307 sensores, enero-febrero de 2018). El entrenamiento se realizo el 4 de noviembre de 2026 en un notebook de Kaggle (version 365414722, commit b0f6a08) y el modelo se publico el 17 de noviembre de 2026. La innovacion principal de v0.7 es la incorporacion de un "fallback base" y entrenamiento con caidas reales de sensores (outage training), que mejora la robustez frente a la version v0.6. Los datos de entrenamiento no se distribuyen; sus fuentes y terminos estan documentados en `DATA_SOURCES.md` del repositorio.

## Capacidades

- Prediccion de los siguientes 12 pasos temporales de trafico viario a partir del estado actual de la red de sensores.
- Robustez ante sensores fuera de servicio (outages), gracias al entrenamiento especifico con caidas reales.
- Modelado espacio-temporal sobre redes de 307 sensores (PEMS04).
- Evaluacion mediante ParadoxBench-1.2, con metricas separadas para condiciones limpias (clean) y con caidas reales (Track G).
- Distribucion como ensemble: el checkpoint publicado es la semilla 200 de un ensemble de tres semillas.
- No soporta tool calling, agentes, vision, audio ni capacidades multilingues; es un modelo puramente numerico.

## Casos de uso

- Gestion de trafico en tiempo real con sensores defectuosos: el modelo predice los 12 pasos siguientes incluso cuando parte de los 307 sensores de PEMS04 no emiten datos, lo que permite mantener la prevision operativa durante fallos de infraestructura.
- Planificacion de mantenimiento de sensores: al cuantificar el impacto de las caidas (Track G), permite priorizar que sensores reparar primero segun su contribucion al error de prediccion.
- Sistemas de alerta temprana de congestion: con un horizonte de 12 pasos, se puede integrar en paneles de control para anticipar retenciones en la red de la bahia de San Francisco.
- Investigacion en world models aplicados a infraestructura: sirve como punto de comparacion reproducible dentro de la serie PWM-Dyn (56 modelos) para estudiar el efecto de variantes de entrenamiento.
- Benchmarking de robustez: util para evaluar tecnicas de imputacion o enmascaramiento de datos faltantes frente a un modelo ya entrenado con outages.
- Prototipado de bajo coste: con 334.628 parametros y un checkpoint de 1,37 MB, se puede ejecutar en CPU o en cualquier GPU consumer para experimentos rapidos.
- Reproducibilidad academica: el checkpoint incluye `results` y logs de ejecucion, lo que facilita auditar y replicar los resultados registrados.

## Benchmarks y rendimiento

Resultados registrados en la model card (ParadoxBench-1.2, ensemble de 3 semillas; este archivo es la semilla 200):

| Metrica | Valor |
|---|---|
| Test MAE clean | 18,53 |
| Test MAE con caidas reales (Track G) | 21,05 |

Comparacion con la version anterior (v0.6), segun la model card:

| Metrica | Cambio frente a v0.6 |
|---|---|
| Error con caidas reales | -11 % a -22 % (en cinco redes) |
| Error en condiciones limpias | +0,4 % a +1,8 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint pesa 1.374.337 bytes y el modelo tiene 334.628 parametros.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: PyTorch nativo (carga via `torch.load` y `huggingface_hub`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera inferencia en milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-Dyn v0.7 PEMS04 | 334.628 | Trafico PEMS04 con outages | 12 pasos | Apache-2.0 | Hugging Face |
| PWM-Dyn v0.7 PEMS08 | no disponible | Trafico PEMS08 con outages | 12 pasos | Apache-2.0 | Hugging Face |
| PWM-Dyn v0.7 PEMS03 | no disponible | Trafico PEMS03 con outages | 12 pasos | Apache-2.0 | Hugging Face |
| PWM-Dyn v0.6 PEMS04 | no disponible | Trafico PEMS04 | 12 pasos | Apache-2.0 | Hugging Face (version anterior) |

Las alternativas mostradas son variantes de la misma serie publicadas por el mismo autor; no se dispone de informacion sobre modelos de terceros comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Especificidad de dominio: entrenado exclusivamente con PEMS04 (307 sensores, enero-febrero de 2018); no se garantiza su transferencia a otras redes o periodos sin reentrenamiento.
- Horizonte limitado: solo predice 12 pasos hacia delante; no es adecuado para previsiones de largo plazo.
- Sin datos de sesgo publicados: no se documentan sesgos conocidos, pero al ser un modelo de trafico puede heredar sesgos de la cobertura de sensores de Caltrans.
- Riesgo de error en condiciones no vistas: aunque v0.7 mejora la robustez ante outages, el MAE con caidas reales (21,05) es superior al limpio (18,53), por lo que la incertidumbre aumenta en esos escenarios.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion; no obstante, los datos de entrenamiento no se distribuyen y sus terminos estan en `DATA_SOURCES.md`, por lo que el uso comercial debe verificar esos terminos por separado.
- Estado "reported": los resultados proceden de un unico flujo de entrenamiento en Kaggle y no se ha publicado una evaluacion independiente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion muy limitado.
- Sin informacion sobre la arquitectura interna en la model card: para auditar el modelo es necesario consultar el codigo del repositorio GitHub.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.7-pems04
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Resultados: https://github.com/paradoxailab/paradox-world-model/blob/main/RESULTS.md
- Documentacion v0.7 realworld: https://github.com/paradoxailab/paradox-world-model/blob/main/v0.7-realworld/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Version anterior (PEMS08): https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.7-pems08
- Version siguiente (PEMS03): https://huggingface.co/PARADOXAIlabs/pwm-dyn-v0.7-pems03
- Todos los modelos de la serie: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Web del autor: https://paradoxailab.com
