# paradoxailab/atlas-p

## Resumen

Atlas-P es un modelo de forecasting de series temporales especializado en la prediccion de concentraciones de PM2.5 a 24 horas vista en estaciones de monitorizacion de calidad del aire de la India. Lo desarrolla ParadoxAI Lab (Aditya Kumar y Anupam Singh) dentro de su serie Paradox World Model, y se publica como el modelo numero 45 de 56 de la serie, identificado como "physics decoder". Con solo 978.507 parametros, es un modelo de escala muy reducida orientado a una tarea vertical concreta, no un modelo de lenguaje.

El modelo se entrena con datos de estaciones CPCB de toda la India (14 redes, 263 estaciones) procedentes del conjunto "Time Series Air Quality Data of India (2010-2023)" de Kaggle. Su objetivo es predecir la evolucion del PM2.5 en las siguientes 24 horas en cada estacion, incorporando presumiblemente informacion fisica o espacial, aunque la model card no detalla la arquitectura interna.

Es relevante por su caracter experimental y transparente: el autor documenta explicitamente que esta version no fue adoptada porque su resultado de validacion (9.227) empeoro respecto a la referencia (9.104). Se trata, por tanto, de un artefacto de investigacion publicado como test negativo de una hipotesis de decodificador fisico, util para quienes siguen la serie o quieren reproducir el experimento, pero no para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de forecasting espaciotemporal; codigo en repositorio GitHub del autor) |
| Parametros totales | 978.507 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (tarea de horizonte fijo de 24 h) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch checkpoint (`.pt`) con state dict, metadatos, configuracion y resultados embebidos |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de etiquetarla como "physics decoder" y encuadrarla en la familia Atlas de modelos espaciotemporales. El checkpoint contiene el state dict de PyTorch (`ck['weights']`), la configuracion de entrenamiento (`ck['cfg']`), metadatos (`ck['meta']`) y los resultados registrados (`ck['results']`), pero el codigo de la arquitectura reside en el repositorio GitHub del proyecto, no en el repositorio de Hugging Face. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables a este tipo de modelo).

Los datos de entrenamiento son las estaciones CPCB de la India (14 redes, 263 estaciones) del dataset de Kaggle "Time Series Air Quality Data of India (2010-2023)". El entrenamiento se realizo el 2026-11-15 en el run de Kaggle `atlas-indiap-s400`, y el modelo se publico el 2026-11-17. La innovacion tecnica que se prueba en esta version es un decodificador fisico, cuyo resultado fue negativo: la validacion paso de 9.104 a 9.227, por lo que no se adopto.

## Capacidades

- Prediccion de PM2.5 a 24 horas vista en estaciones de monitorizacion de calidad del aire.
- Modelado espaciotemporal sobre una red de 263 estaciones y 14 redes de monitorizacion.
- Forecasting de series temporales univariadas por estacion con posible dependencia espacial entre estaciones (segun la etiqueta "spatiotemporal").
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision ni audio.
- Capacidad experimental de decodificador fisico, documentada como no adoptada por su peor resultado de validacion.

## Casos de uso

- Investigacion sobre decodificadores fisicos en forecasting: el modelo sirve como test negativo reproducible para estudiar por que la incorporacion de informacion fisica empeoro la validacion (9.227 frente a 9.104) en este horizonte de 24 h.
- Reproduccion de experimentos de la serie Paradox World Model: cargando el checkpoint se accede a la configuracion (`ck['cfg']`) y a los registros de resultados (`ck['results']`) para replicar el run `atlas-indiap-s400`.
- Baseline de comparacion en tareas de prediccion de PM2.5: con menos de un millon de parametros, sirve como referencia de baja capacidad frente a modelos mas grandes de la misma serie (por ejemplo, Atlas S2 de 3M parametros).
- Estudio de redes de monitorizacion de calidad del aire: el modelo esta entrenado sobre 14 redes y 263 estaciones CPCB, lo que permite analizar el comportamiento del forecasting a escala nacional india.
- Docencia y prototipado de pipelines de series temporales: el formato de checkpoint autocontenido (pesos, configuracion, metadatos y resultados en un solo archivo) facilita su uso en ejercicios de carga y evaluacion.
- Auditoria de metodologia de publicacion: la model card documenta explicitamente el criterio de no adopcion, lo que lo convierte en un ejemplo de trazabilidad de resultados negativos en publicaciones de modelos.

## Benchmarks y rendimiento

| Metrica | Atlas-P (physics decoder) | Referencia de la serie |
|---|---|---|
| Validacion (metrica no especificada en la model card) | 9.227 | 9.104 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no aplican a este tipo de modelo. La unica cifra registrada es la comparacion de validacion anterior, que motivo la no adopcion del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 978.507 parametros en precision completa (float32) el peso ronda los 4 MB (el archivo `.pt` ocupa 3.949.717 bytes incluyendo metadatos, configuracion y resultados).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. Funciona en CPU sin problema.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: carga directa con PyTorch mediante `torch.load` y `huggingface_hub.hf_hub_download`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia muy baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Atlas-P (physics decoder) | 978.507 | PM2.5 a 24 h, India | no disponible | Apache-2.0 | No adoptado (validacion 9.227) |
| Atlas v1.4n (neighbours only) | no disponible | PM2.5 a 24 h, India | no disponible | no disponible | Version previa de la serie (#47) |
| Atlas S2 | 3M (aprox.) | PM2.5 a 24 h, India | no disponible | no disponible | Version posterior de la serie (#49) |

La comparativa se limita a los modelos de la misma serie referenciados en la model card; no se dispone de datos de benchmarks ni de especificaciones completas de las alternativas para una comparacion cuantitativa mas amplia.

## Limitaciones y advertencias

- Modelo no adoptado: su resultado de validacion (9.227) es peor que la referencia (9.104), por lo que no debe usarse como modelo de produccion.
- Alcance geografico restringido a estaciones CPCB de la India (14 redes, 263 estaciones); no se garantiza su comportamiento fuera de esa red.
- Tarea limitada a la prediccion de PM2.5 a 24 horas; no es un modelo generalista ni un modelo de lenguaje.
- No se detalla la arquitectura ni los datos de entrenamiento en la model card; la reproducibilidad depende del repositorio GitHub del autor.
- No se documentan sesgos especificos, pero al entrenarse con datos de monitorizacion de la India puede heredar sesgos de cobertura y calidad de las estaciones.
- Riesgo de alucinacion no aplica en el sentido habitual; el riesgo es de predicciones inexactas fuera del dominio de entrenamiento.
- Licencia Apache-2.0 permite uso comercial, pero el estado "not adopted" y la falta de validacion externa desaconsejan su uso en produccion.
- Los datos de entrenamiento no se incluyen en el repositorio; sus fuentes y terminos estan en DATA_SOURCES.md del repositorio GitHub.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paradoxailab/atlas-p
- Repositorio GitHub del proyecto: https://github.com/paradoxailab/paradox-world-model
- Registro de la version Atlas: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Version anterior (#47 Atlas v1.4n): https://huggingface.co/paradoxailab/atlas-v1.4n
- Version posterior (#49 Atlas S2): https://huggingface.co/paradoxailab/atlas-scale-3m
- Serie completa: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
