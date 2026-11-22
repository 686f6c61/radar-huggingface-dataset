# PARADOXAIlabs/atlas-w-delhi-tb

## Resumen

Atlas-W Delhi (T-B, real forecasts) es un modelo de prediccion de series temporales espaciotemporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de la serie Paradox World Model, concretamente la entrega numero 54 de la serie (modelo 51 de 56 publicados). Su tarea especifica es la prediccion de las siguientes 24 horas de concentracion de PM2.5 en estaciones de medicion de calidad del aire en Delhi, empleando como entrada datos de 39 estaciones de monitorizacion continua de CPCB Delhi y pronosticos meteorologicos de ECMWF del dia anterior obtenidos via Open-Meteo.

El modelo es deliberadamente pequeno: 985.216 parametros por checkpoint, con dos checkpoints (B y C, identicos en este archivo) que corresponden a las etapas de entrenamiento registradas para esta version. No es un modelo de lenguaje ni un transformer generativo de proposito general, sino un modelo predictivo especializado de tipo forecasting sobre series temporales con estructura espacial (multi-estacion) y dependencia meteorologica.

La relevancia de esta version radica en que valida que la ganancia aportada por las variables meteorologicas se mantiene cuando se utilizan pronosticos reales (no observaciones futuras filtradas), lo que elimina una fuente habitual de fuga de informacion en modelos de calidad del aire. El resultado registrado es una MAE de 28.19 frente a 31.27 del modelo Atlas sin meteorologia en el invierno de Delhi 2024-25, una mejora del 9.85% con p = 0.0009 sobre 3 semillas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (codigo en repositorio GitHub del autor; configuracion en `ck['cfg']`) |
| Parametros totales | 985.216 por checkpoint (2 checkpoints en el archivo: B y C) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (prediccion de horizonte fijo de 24 h) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo numerico de series temporales) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (state dict serializado con `torch.save`, `weights_only=False`) |

## Arquitectura y entrenamiento

La model card no describe explicitamente la arquitectura interna. Se trata de un modelo de forecasting espaciotemporal sobre 39 estaciones de calidad del aire, con entrada compuesta por observaciones historicas de PM2.5 de CPCB Delhi (OpenCity 'Delhi Hourly Air Quality Reports') y pronosticos meteorologicos de ECMWF del dia anterior (Open-Meteo previous runs). El codigo de arquitectura de esta version esta en el repositorio GitHub del autor y la configuracion exacta de entrenamiento esta embebida en el archivo bajo la clave `ck['cfg']`.

El entrenamiento se realizo el 2026-11-16 en el entorno Kaggle `atlas-tb-s320`. El archivo contiene dos checkpoints (B y C) que son identicos entre si en esta version. La innovacion metodologica destacable es el uso de pronosticos meteorologicos reales (previous runs de ECMWF) en lugar de observaciones futuras, lo que evita la fuga de informacion y hace que la mejora medida sea atribuible a informacion disponible en el momento de la prediccion. Los datos de entrenamiento no se distribuyen con el modelo; sus fuentes y terminos estan documentados en `DATA_SOURCES.md`.

## Capacidades

- Prediccion de las siguientes 24 horas de PM2.5 en estaciones de monitorizacion de Delhi.
- Modelado espaciotemporal multi-estacion (39 estaciones de CPCB Delhi).
- Integracion de pronosticos meteorologicos exogenos (ECMWF via Open-Meteo).
- Evaluacion con pronosticos reales del dia anterior (sin fuga de informacion futura).
- Entrenamiento multi-semilla (3 semillas) con evaluacion estadistica (p = 0.0009).
- Serializacion de pesos, resultados y configuracion en un unico archivo `.pt`.
- No soporta tool calling, function calling, agentes, vision, audio ni generacion de texto: es un modelo numerico de forecasting.

## Casos de uso

- Prediccion operativa de calidad del aire en Delhi: generar cada dia el pronostico de PM2.5 a 24 h para las 39 estaciones usando el pronostico meteorologico del dia anterior, permitiendo emitir avisos sanitarios con antelacion.
- Sistemas de alerta temprana para episodios de contaminacion invernal: en el invierno de Delhi los picos de PM2.5 son criticos; un horizonte de 24 h con MAE ~28 permite activar protocolos de restriccion de trafico o recomendaciones de mascarilla.
- Investigacion en modelado espaciotemporal: servir como linea base ligera (menos de 1 M de parametros) para comparar tecnicas de incorporacion de variables exogenas en forecasting ambiental.
- Evaluacion de fuentes meteorologicas: el modelo permite cuantificar el valor predictivo anadido de los pronosticos ECMWF frente a modelos sin meteorologia (diferencia medida de 3.08 en MAE).
- Despliegue en entornos con recursos minimos: con menos de 1 M de parametros, el modelo puede ejecutarse en CPU o en dispositivos de borde sin GPU, integrandose en pipelines de datos de agencias ambientales.
- Reproducibilidad de resultados cientificos: el archivo incluye pesos, resultados y logs de ejecucion, lo que permite auditar y reproducir la comparacion reportada entre checkpoints con y sin meteorologia.

## Benchmarks y rendimiento

| Metrica | Atlas-W Delhi (con meteorologia) | Atlas sin meteorologia | Diferencia |
|---|---|---|---|
| MAE (invierno Delhi 2024-25) | 28.19 | 31.27 | -3.08 (-9.85%) |
| Significancia estadistica | p = 0.0009 (3 semillas) | — | — |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es de proposito general.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 985.216 parametros por checkpoint y pesos en precision estandar, el modelo ocupa unos pocos MB en memoria.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU consumer (incluso integradas) es suficiente.
- Cabe en cualquier GPU consumer y en dispositivos de borde; tambien en CPU y en entornos sin acelerador.
- Opciones de despliegue: PyTorch nativo (`torch.load` + `state_dict`), con descarga via `huggingface_hub`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada; dado el tamano, se espera latencia de milisegundos en CPU para una pasada de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlas-W Delhi (T-B) | 985.216 | PM2.5 24 h, 39 estaciones Delhi | no disponible | Apache-2.0 | Hugging Face |
| Atlas sin meteorologia (mencionado en la model card) | no disponible | PM2.5 24 h | no disponible | Apache-2.0 (serie) | Hugging Face (serie ParadoxAI) |
| Atlas W10r (#53, 10M + weather, regularizado) | ~10 M | forecasting con meteorologia | no disponible | Apache-2.0 | Hugging Face |

No se dispone de informacion sobre modelos comparables de terceros en la documentacion proporcionada; la comparativa se limita a los modelos de la propia serie Paradox World Model.

## Limitaciones y advertencias

- Especializacion geografica y temporal: entrenado para Delhi y validado en el invierno 2024-25; su rendimiento fuera de ese regimen estacional o en otras ciudades no esta documentado.
- Dependencia de datos externos: requiere pronosticos ECMWF del dia anterior via Open-Meteo; la calidad del pronostico meteorologico condiciona la prediccion.
- Los datos de entrenamiento no se incluyen; solo se documentan sus fuentes y terminos, lo que limita la reproducibilidad completa del entrenamiento.
- Los checkpoints B y C del archivo son identicos, por lo que no representan dos modelos distintos sino dos etapas registradas.
- No es un modelo de lenguaje: no soporta generacion de texto, tool calling, agentes ni capacidades multimodales.
- Riesgo de alucinacion no aplica en el sentido habitual, pero si existe riesgo de predicciones erroneas en episodios extremos no representados en el conjunto de validacion.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion ni sobre la idoneidad para decisiones sanitarias sin validacion adicional.
- Sesgos conocidos: no documentados en la model card; la cobertura de estaciones (39) puede no representar homogeneamente toda el area metropolitana de Delhi.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PARADOXAIlabs/atlas-w-delhi-tb
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Registro de la version (atlas/README.md): https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#53 Atlas W10r): https://huggingface.co/PARADOXAIlabs/atlas-w10r
- Modelo siguiente (#55 Atlas-5K v1): https://huggingface.co/PARADOXAIlabs/atlas-5k-v1
- Serie completa: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
