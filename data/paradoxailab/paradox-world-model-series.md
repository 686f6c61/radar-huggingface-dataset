# paradoxailab/paradox-world-model-series

## Resumen

Paradox World Model Series es una coleccion de 56 modelos de series temporales espaciales publicados por ParadoxAI Lab bajo licencia Apache 2.0. No se trata de un unico modelo fundacional, sino de un catalogo de modelos especializados en prediccion de fenomenos fisicos sobre redes de sensores: flujo de trafico, calidad del aire y variables meteorologicas. Cada entrada de la serie dispone de su propio repositorio con pesos, datos de entrenamiento, resultados registrados y checksum SHA-256.

El tamano de los modelos es muy reducido: el rango va desde los 316.900 parametros de PWM-Dyn v0.6 (pems08) hasta los 10.538.577 parametros del encoder PWM-F v2.0. Las familias principales son PWM-Dyn (prediccion de trafico en los conjuntos PeMS y METR-LA), PWM-W (prediccion meteorologica y de calidad del aire en estaciones de India y Delhi) y Atlas (prediccion de PM2.5 en estaciones de Delhi).

La relevancia de esta serie reside en su enfoque de modelado ligero y reproducible para prevision espacio-temporal sobre grafos de sensores, con variantes que abordan explicitamente escenarios de degradacion como caidas de sensores (PWM-Dyn v0.7) y modelos hibridos que corrigen predicciones de modelos fundacionales de series temporales como Chronos-2 y TimesFM 2.5 (PWM-W Delhi v0.2).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelos de prevision espacio-temporal sobre grafos de sensores; detalles no publicados en la informacion disponible) |
| Parametros totales | entre 316.900 y 10.538.577 segun modelo de la serie |
| Parametros activos | no aplica (no se describe arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelos numericos de series temporales, no de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (la model card menciona pesos y checksum SHA-256 por repositorio, sin especificar formato) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de los modelos. Por la descripcion de tareas y el reducido numero de parametros, se trata de modelos de prevision espacio-temporal sobre grafos de estaciones de sensores, no de transformers de lenguaje. La familia PWM-Dyn predice los siguientes 12 pasos de flujo de trafico sobre los conjuntos PeMS (pems03, pems04, pems07, pems08) y METR-LA, con variantes especificas por conjunto y versiones que anaden robustez ante caidas de sensores (v0.7).

La familia PWM-W aborda la prediccion a 24 horas de variables meteorologicas (temperatura, humedad, viento) y contaminantes (PM2.5, PM10, NO2, ozono) en estaciones de India y Delhi, con ejecuciones sobre estandares CPCB, WMO y METAR. La version PWM-W Delhi v0.2 es un modelo hibrido que corrige las predicciones de Chronos-2 y TimesFM 2.5 usando el grafo de estaciones. La familia Atlas se centra en la prediccion de PM2.5 a 24 horas en estaciones de Delhi. El encoder PWM-F v2.0 (10,5 M de parametros) fue preentrenado sobre datos de toda India, aunque figura como "not adopted". No se especifican en la informacion disponible el volumen de tokens, la composicion exacta de los datasets ni si se emplearon tecnicas de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Prediccion de flujo de trafico a 12 pasos sobre redes de sensores PeMS y METR-LA.
- Prediccion de flujo de trafico bajo condiciones de caida de sensores (familia PWM-Dyn v0.7).
- Prediccion a 24 horas de temperatura, humedad y viento en estaciones meteorologicas.
- Prediccion a 24 horas de contaminantes atmosfericos: PM2.5, PM10, NO2 y ozono.
- Correccion hibrida de predicciones de modelos fundacionales de series temporales (Chronos-2, TimesFM 2.5) mediante el grafo de estaciones.
- Prevision en tiempo real para estaciones de India (PWM-W v0.9 live).
- Codificacion de representaciones meteorologicas a escala nacional (encoder PWM-F v2.0, 10,5 M de parametros).
- No se documentan capacidades de generacion de texto, codigo, vision, tool calling ni agentes.

## Casos de uso

- Gestion de trafico urbano: PWM-Dyn v0.6 y v0.7 predicen los proximos 12 pasos de flujo en corredores monitorizados por PeMS, utiles para ajustar semaforos y planes de carril antes de que se produzcan congestiones.
- Tolerancia a fallos de sensores: PWM-Dyn v0.7 esta disenado para mantener predicciones de trafico cuando parte de los sensores de la red dejan de reportar, apropiado para centros de control con infraestructura degradada.
- Prediccion de calidad del aire en Delhi: Atlas-Delhi v1.0 y v1.1 generan previsiones a 24 horas de PM2.5 por estacion, utiles para emitir avisos sanitarios y activar protocolos de reduccion de trafico.
- Correccion de modelos fundacionales de series temporales: PWM-W Delhi v0.2 se usa como capa de correccion sobre Chronos-2 y TimesFM 2.5, aprovechando el grafo de estaciones para mejorar la precision en entornos urbanos densos.
- Operacion meteorologica en India: PWM-W v0.9 live proporciona previsiones a 24 horas en tiempo real para estaciones indias, integrable en paneles de monitorizacion y sistemas de alerta temprana.
- Investigacion reproducible en prevision espacio-temporal: cada repositorio incluye pesos, datos de entrenamiento, resultados y checksum SHA-256, lo que facilita la replicacion de experimentos y la comparacion de variantes de la serie.
- Preentrenamiento de representaciones meteorologicas: el encoder PWM-F v2.0, con 10,5 M de parametros, puede servir como extractor de caracteristicas para tareas posteriores sobre datos de India, aunque su estado figura como "not adopted".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que cada modelo tiene resultados registrados en su repositorio, pero no se incluyen cifras en el material proporcionado.

## Requisitos de hardware

- Los modelos de la serie tienen entre 316.900 y 10.538.577 parametros, por lo que la inferencia cabe holgadamente en CPU y en cualquier GPU consumer.
- VRAM estimada: inferior a 1 GB en todos los casos, incluso en precision completa; las variantes mas pequenas ocupan pocos megabytes.
- GPU recomendadas: no se requiere GPU dedicada; una RTX 4090 o incluso una GPU integrada es mas que suficiente. Para lotes grandes o despliegue en red de sensores, una GPU de datacenter como A100 o H100 solo aportaria ventaja en paralelismo masivo.
- Cabe en cualquier GPU consumer, incluida una GTX 1650 o inferior.
- Opciones de despliegue: no se especifican en la informacion disponible; dado el tamano, la inferencia puede ejecutarse directamente en Python o integrarse en servicios ligeros.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-Dyn v0.6 (pems08) | 316.900 | no disponible | Trafico, 12 pasos | Apache 2.0 | Hugging Face |
| PWM-W Weather v0.4 | 2.385.504 | no disponible | Meteo, 24 h | Apache 2.0 | Hugging Face |
| Atlas-Delhi v1.1 | no disponible | no disponible | PM2.5, 24 h | Apache 2.0 | Hugging Face |
| Chronos-2 | no disponible | no disponible | Series temporales generales | no disponible | no disponible |
| TimesFM 2.5 | no disponible | no disponible | Series temporales generales | no disponible | no disponible |

Los modelos Chronos-2 y TimesFM 2.5 se mencionan en la model card como base del modelo hibrido PWM-W Delhi v0.2, pero no se dispone de sus especificaciones en la informacion proporcionada. No se conocen otros modelos comparables de prevision espacio-temporal sobre grafos de sensores con los que contrastar en detalle.

## Limitaciones y advertencias

- La serie no es un modelo unico: cada repositorio corresponde a una tarea, region y conjunto de datos especificos; no es posible usar un solo modelo para todas las tareas.
- Los modelos estan especializados en dominios concretos (trafico en PeMS/METR-LA, meteorologia y calidad del aire en India) y no generalizan a otras regiones o variables sin reentrenamiento.
- Varias entradas de la serie figuran como "not recorded", "not adopted" o "see branch"/"see paper", lo que indica que su validacion o resultados no estan consolidados.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de contexto en la informacion disponible; al tratarse de modelos numericos de prediccion, el riesgo principal es el error de prevision y la extrapolacion fuera de la distribucion de entrenamiento.
- No se especifican limitaciones de licencia para uso comercial mas alla de la licencia Apache 2.0, que permite uso comercial con atribucion.
- La fecha de creacion del repositorio (2026-11-18) y el hecho de que no tenga descargas ni likes sugieren que la serie es muy reciente y carece de validacion independiente.
- No se dispone de informacion sobre calibracion, intervalos de incertidumbre ni protocolos de evaluacion, lo que dificulta su adopcion en produccion sin una validacion propia.

## Enlaces

- Repositorio principal en Hugging Face: https://huggingface.co/paradoxailab/paradox-world-model-series
- Codigo fuente y registros: https://github.com/paradoxailab/paradox-world-model
- PWM-Dyn v0.4 (pems08): https://huggingface.co/paradoxailab/pwm-dyn-v0.4-pems08
- PWM-Dyn v0.6 (pems08): https://huggingface.co/paradoxailab/pwm-dyn-v0.6-pems08
- PWM-Dyn v0.7 (pems08): https://huggingface.co/paradoxailab/pwm-dyn-v0.7-pems08
- PWM-W Delhi v0.2: https://huggingface.co/paradoxailab/pwm-w-delhi-v0.2
- PWM-W Weather v0.4 (cpcb): https://huggingface.co/paradoxailab/pwm-w-weather-v0.4-cpcb
- PWM-W v0.9 live: https://huggingface.co/paradoxailab/pwm-w-live-v0.9
- PWM-F encoder v2.0: https://huggingface.co/paradoxailab/pwm-f-encoder-v2.0
- Atlas-Delhi v1.0: https://huggingface.co/paradoxailab/atlas-delhi-v1.0
- Atlas-Delhi v1.1: https://huggingface.co/paradoxailab/atlas-delhi-v1.1
