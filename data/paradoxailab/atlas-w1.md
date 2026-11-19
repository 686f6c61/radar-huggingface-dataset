# paradoxailab/atlas-w1

## Resumen

Atlas W1 es un modelo de predicción de series temporales espaciotemporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model, concretamente la entrega número 51. Su tarea específica es la predicción de las próximas 24 horas de concentración de PM2.5 (material particulado fino) en estaciones de monitorización de calidad del aire en la India. El modelo combina datos de 263 estaciones pertenecientes a 14 redes del CPCB (Central Pollution Control Board) con variables meteorológicas de ERA5 obtenidas vía Open-Meteo. Con 985.216 parámetros, es un modelo deliberadamente compacto, orientado a un dominio muy concreto y entrenado sobre un dataset público de Kaggle que cubre el periodo 2010-2023.

La relevancia del modelo reside en su enfoque: en lugar de competir en escala con los grandes modelos fundacionales de series temporales, Atlas W1 incorpora forzamiento meteorológico (ERA5) como entrada y reporta mejoras medibles frente a TimesFM 2.5 en el conjunto de test de toda la India. Según la model card, obtiene un error de 19,86/19,92 con meteorología ERA5 (cota superior) frente a 22,35/21,93 de TimesFM 2.5, y una validación de 8,684 con una mejora del 4,61% respecto a la versión anterior.

El modelo se distribuye como un checkpoint de PyTorch (`51_atlas_w1_weather.pt`, 4.020.709 bytes) que incluye pesos, configuración de entrenamiento, metadatos y registro de resultados. El código de arquitectura no se incluye en el repositorio de Hugging Face, sino que se referencia al repositorio GitHub del proyecto. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (código en repositorio GitHub del proyecto; checkpoint PyTorch) |
| Parametros totales | 985.216 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (horizonte de predicción: próximas 24 h de PM2.5) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de series temporales, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict (`.pt`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (tipo de transformer, mecanismo de atención espacial, codificación de estaciones, etc.); la model card remite al repositorio GitHub `paradoxailab/paradox-world-model` para el código de arquitectura y almacena la configuración de entrenamiento en el propio checkpoint bajo la clave `ck['cfg']`. Lo que sí se especifica es el diseño de la tarea: predicción a 24 horas de PM2.5 en estaciones, con entrada de variables meteorológicas ERA5 por estación (forzamiento meteorológico), lo que constituye la innovación principal de esta versión respecto a la anterior (Atlas S3, 10M parámetros).

Los datos de entrenamiento provienen de dos fuentes: el dataset de Kaggle "Time Series Air Quality Data of India (2010-2023)" con datos del CPCB (14 redes, 263 estaciones) y el archivo ERA5 de Open-Meteo (Copernicus C3S) para la meteorología en cada estación. El entrenamiento se realizó el 2026-11-16 en el run de Kaggle `atlas-w1-s400`. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (poco habituales en modelos de forecasting).

## Capacidades

- Predicción de las próximas 24 horas de concentración de PM2.5 en estaciones de monitorización de calidad del aire.
- Incorporación de forzamiento meteorológico ERA5 por estación como variable exógena.
- Modelado espaciotemporal sobre 263 estaciones distribuidas en 14 redes de la India.
- Forecasting de series temporales univariadas/multivariadas con covariables meteorológicas.
- Serialización completa del estado de entrenamiento: pesos, configuración (`cfg`), metadatos (`meta`) y registro de resultados (`results`).
- No dispone de tool calling, capacidades de agente, generación de texto, visión ni audio: es un modelo numérico de series temporales.

## Casos de uso

- Predicción operativa de calidad del aire urbana: el modelo genera el horizonte de 24 h de PM2.5 por estación, adecuado para sistemas de alerta temprana en ciudades indias con datos CPCB.
- Integración en paneles de salud pública: con la predicción a 24 h se pueden emitir avisos a población sensible (asmáticos, niños, mayores) en función de umbrales de PM2.5.
- Investigación en modelado espaciotemporal: su tamaño reducido (985.216 parámetros) permite reproducir el entrenamiento y experimentar con forzamiento meteorológico en entornos con recursos limitados.
- Evaluación comparativa de modelos fundacionales de series temporales: sirve como baseline ligero frente a TimesFM 2.5 en tareas de forecasting de calidad del aire.
- Despliegue en entornos de borde o CPU: al ser un checkpoint de ~4 MB y menos de un millón de parámetros, puede ejecutarse en infraestructura modesta sin GPU dedicada.
- Estudio de impacto meteorológico en contaminación: al incorporar ERA5, permite analizar la sensibilidad de las predicciones a variables como viento, temperatura o humedad.
- Reproducibilidad de experimentos: el checkpoint incluye registro de resultados y logs de ejecución, útil para auditoría de pipelines de forecasting.

## Benchmarks y rendimiento

| Metrica | Atlas W1 | TimesFM 2.5 |
|---|---|---|
| Validación (registrada) | 8,684 (mejora del 4,61%) | no disponible |
| Test toda la India (con ERA5, cota superior) | 19,86 / 19,92 | 22,35 / 21,93 |

Los valores corresponden a lo registrado en la model card; no se especifica la métrica exacta (probablemente MAE o RMSE) ni las condiciones del split de test. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) por tratarse de un modelo de series temporales.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint pesa aproximadamente 4 MB y el modelo tiene 985.216 parámetros, por lo que cabe holgadamente en CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es más que suficiente, e incluso innecesaria.
- Cabe en cualquier GPU consumer y en CPU convencional.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`) y el código de arquitectura del repositorio GitHub; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento (test India) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlas W1 | 985.216 | 24 h de PM2.5 | 19,86 / 19,92 (con ERA5) | Apache-2.0 | Hugging Face (checkpoint) |
| TimesFM 2.5 | no disponible | no disponible | 22,35 / 21,93 | no disponible | no disponible en la información |
| Atlas S3 (versión previa de la serie) | 10M | no disponible | no disponible | Apache-2.0 | Hugging Face (`paradoxailab/atlas-scale-10m`) |
| Atlas W10 (versión siguiente de la serie) | 10M + weather | no disponible | no disponible | Apache-2.0 | Hugging Face (`paradoxailab/atlas-w10`) |

## Limitaciones y advertencias

- Dominio muy restringido: solo predice PM2.5 a 24 h en estaciones de la India; no es un modelo general de series temporales ni de texto.
- Dependencia de datos externos: el forzamiento ERA5 debe estar disponible en inferencia; sin meteorología, el rendimiento puede degradarse (la comparación con TimesFM se hace con ERA5 como cota superior).
- Cobertura geográfica limitada a las 263 estaciones y 14 redes del CPCB; la extrapolación a otras regiones no está validada.
- El repositorio de Hugging Face tiene 0 descargas y 0 likes, y el tamaño del repo es de 0.0 GB; la arquitectura no está incluida y debe obtenerse del repositorio GitHub, lo que añade fricción de despliegue.
- No se especifica la métrica exacta de los resultados (MAE, RMSE u otra) ni el protocolo de evaluación, lo que dificulta la comparación rigurosa.
- Riesgo de sobreajuste a la serie temporal histórica 2010-2023; no se documentan evaluaciones fuera de ese periodo.
- Licencia Apache-2.0 permite uso comercial, pero los datos de entrenamiento no se distribuyen y sus términos están en `DATA_SOURCES.md`; conviene revisar las condiciones de las fuentes (CPCB, Kaggle, Copernicus C3S) antes de un uso productivo.
- No se documentan sesgos ni riesgos de alucinación en el sentido lingüístico, pero sí existe riesgo de predicciones erróneas en episodios extremos de contaminación no representados en el entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/paradoxailab/atlas-w1
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Registro de la versión: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Índice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Serie completa en Hugging Face: https://huggingface.co/paradoxailab/paradox-world-model-series
- Versión previa (Atlas S3): https://huggingface.co/paradoxailab/atlas-scale-10m
- Versión siguiente (Atlas W10): https://huggingface.co/paradoxailab/atlas-w10
- Sitio del autor: https://paradoxailab.com
