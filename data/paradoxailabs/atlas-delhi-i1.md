# PARADOXAIlabs/atlas-delhi-i1

## Resumen

Atlas-Delhi I1 es un modelo de series temporales espacio-temporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model. Su tarea concreta es la prediccion de las proximas 24 horas de concentracion de PM2.5 en estaciones de calidad del aire de Delhi, a partir de los datos horarios de las 39 estaciones continuas de la red CPCB (OpenCity, "Delhi Hourly Air Quality Reports") durante el invierno 2024-25. Es, por tanto, un modelo de pronostico operativo de contaminacion atmosferica, no un modelo de lenguaje.

El modelo es extremadamente compacto: 967.632 parametros por checkpoint, con dos checkpoints (B y C) correspondientes a distintas etapas de entrenamiento. El resultado registrado reporta un MAE de 31,27 en la etapa C sobre tres semillas, frente a los 58,75 de IITM WRF-Chem y los 71,68 de IMD SILAM publicados. Es relevante por su caracter operativo: se compara directamente con los sistemas de pronostico oficiales de India y se publica bajo licencia Apache-2.0 con pesos en formato PyTorch.

La ficha se basa exclusivamente en la model card del autor y en los metadatos de Hugging Face; el repositorio no incluye datos de entrenamiento y el tamano del repo figura como 0,0 GB, aunque el unico fichero declarado ocupa 7.781.419 bytes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo espacio-temporal de series temporales; codigo en repositorio GitHub del autor) |
| Parametros totales | 967.632 por checkpoint; el fichero contiene 2 checkpoints (B, C) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (horizonte de prediccion: 24 h) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico; datos de India, Delhi) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`torch.save`, fichero `.pt` con claves `meta`, `weights`, `results`, `cfg`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de describirla como un modelo espacio-temporal de la familia Atlas orientado a forecasting. El codigo de arquitectura se encuentra en el repositorio GitHub del autor y la configuracion de entrenamiento esta embebida en el fichero de pesos bajo la clave `ck['cfg']`, pero no se reproduce en la informacion disponible. El modelo tiene 967.632 parametros por checkpoint y el fichero publicado contiene dos checkpoints (B y C) que corresponden a etapas de entrenamiento distintas; la model card indica que cada resultado registrado especifica la etapa utilizada.

Los datos de entrenamiento son los informes horarios de calidad del aire de Delhi (CPCB, 39 estaciones continuas, OpenCity) durante el invierno 2024-25. El entrenamiento se realizo el 2026-11-15 en el entorno denominado Kaggle `atlas-i1-s320`. No se especifica el numero de tokens ni la composicion exacta del dataset, y los datos de entrenamiento no se incluyen en el repositorio; sus fuentes y terminos se remiten a `DATA_SOURCES.md`. No se menciona RLHF, DPO ni tecnicas de decodificacion especulativa, lo cual es coherente con la naturaleza de un modelo de regresion/forecasting.

## Capacidades

- Pronostico de PM2.5 a 24 horas en estaciones de calidad del aire de Delhi.
- Modelado espacio-temporal: utiliza las 39 estaciones continuas de la red CPCB como senal de entrada.
- Comparacion operativa con sistemas de pronostico oficiales (IITM WRF-Chem, IMD SILAM).
- Evaluacion multi-semilla: el resultado reportado (MAE 31,27) se calcula sobre 3 semillas en la etapa C.
- Trazabilidad de resultados: el fichero incluye `results` con cada resultado registrado, el texto del registro y los logs de ejecucion.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni capacidades multilingues, al no ser un modelo de lenguaje.

## Casos de uso

- Pronostico operativo de calidad del aire en Delhi: generar la prediccion de PM2.5 a 24 horas para las 39 estaciones CPCB y alimentar boletines diarios de contaminacion.
- Alertas sanitarias tempranas: usar el pronostico a 24 h para activar avisos a poblacion sensible (respiratoria, cardiovascular) con un horizonte suficiente para medidas preventivas.
- Evaluacion comparativa de sistemas de pronostico: usar el modelo como referencia ligera (menos de 1 M de parametros) frente a modelos fisico-quimicos como WRF-Chem o SILAM en estudios de validacion.
- Investigacion en series temporales espacio-temporales: emplear los checkpoints como baseline reproducible en experimentos de forecasting de contaminacion con grafos de estaciones.
- Integracion en pipelines de datos: cargar el checkpoint via `huggingface_hub` y `torch.load` para incorporar la inferencia a un sistema de monitorizacion existente con muy bajo coste computacional.
- Docencia y prototipado: por su tamano (menos de 1 M de parametros) y licencia Apache-2.0, sirve para demostrar flujos completos de pronostico ambiental en entornos con recursos limitados.

## Benchmarks y rendimiento

| Metrica | Atlas-Delhi I1 (etapa C, 3 semillas) | IITM WRF-Chem | IMD SILAM |
|---|---|---|---|
| MAE PM2.5 (invierno Delhi 2024-25) | 31,27 | 58,75 | 71,68 |

Los valores de IITM WRF-Chem e IMD SILAM se citan en la model card como cifras publicadas. No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros), que ademas no aplican a un modelo de forecasting.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint completo ocupa 7,78 MB en disco y 967.632 parametros por checkpoint, por lo que la inferencia cabe en CPU.
- GPU recomendadas: no se especifican; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es mas que suficiente, y la CPU es viable para uso operativo.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: carga directa con PyTorch (`torch.load` con `weights_only=False`) y `huggingface_hub`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento (MAE PM2.5) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlas-Delhi I1 | 967.632 por checkpoint | 24 h | 31,27 (etapa C, 3 semillas) | Apache-2.0 | Hugging Face |
| IITM WRF-Chem | no disponible (modelo fisico-quimico) | no disponible | 58,75 (publicado) | no disponible | sistema operativo de India |
| IMD SILAM | no disponible (modelo fisico-quimico) | no disponible | 71,68 (publicado) | no disponible | sistema operativo de India |
| Atlas-W v1 (Delhi) | no disponible | no disponible | no disponible | no disponible (ver su ficha) | Hugging Face (modelo #45 de la serie) |

La comparacion con WRF-Chem y SILAM es la que proporciona el propio autor; no se dispone de comparativas con otros modelos de machine learning para la misma tarea en la informacion disponible.

## Limitaciones y advertencias

- Ambito geografico y temporal restringido: entrenado con datos de invierno 2024-25 en Delhi; su validez fuera de esa estacion o ciudad no esta documentada.
- No se especifican sesgos conocidos ni evaluacion de robustez ante regimenes extremos de contaminacion.
- Riesgo de sobreajuste a la red de 39 estaciones CPCB; el comportamiento con estaciones nuevas o caidas de sensores no se describe.
- La model card no detalla la arquitectura ni la configuracion de entrenamiento en el texto; hay que consultar el codigo en GitHub y la clave `ck['cfg']` del fichero.
- Los datos de entrenamiento no se distribuyen; solo se documentan sus fuentes y terminos, lo que limita la reproducibilidad completa.
- El resultado reportado (MAE 31,27) proviene de la propia model card y no se ha verificado de forma independiente en la informacion disponible.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion; no se indican restricciones adicionales.
- El tamano del repositorio figura como 0,0 GB pese a que el fichero declarado ocupa 7,78 MB; conviene verificar la integridad con el SHA-256 publicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PARADOXAIlabs/atlas-delhi-i1
- Repositorio GitHub (codigo y registro): https://github.com/paradoxailab/paradox-world-model
- Registro de la version Atlas: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Indice de la serie de modelos: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior de la serie (#45 Atlas-W v1 Delhi): https://huggingface.co/PARADOXAIlabs/atlas-w-v1-delhi
- Modelo siguiente de la serie (#47 Atlas v1.4n): https://huggingface.co/PARADOXAIlabs/atlas-v1.4n
- Todos los modelos de la serie: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
