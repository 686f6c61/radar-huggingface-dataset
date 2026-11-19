# paradoxailab/atlas-w-delhi-tb

## Resumen

Atlas-W Delhi (T-B, real forecasts) es un modelo de predicción de series temporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model, en concreto la entrega número 54 de la serie y el modelo 51 de 56 publicados. Su tarea es la previsión de las próximas 24 horas de concentración de PM2.5 en estaciones de medición de calidad del aire en Delhi, empleando como entrada datos horarios de la red CPCB (39 estaciones de monitorización continua) y predicciones meteorológicas de ECMWF obtenidas el día anterior a través de Open-Meteo.

El modelo es deliberadamente compacto: 985.216 parámetros por checkpoint, con dos checkpoints (B y C) incluidos en el mismo fichero de pesos. La innovación principal que documenta el autor es la incorporación de predicciones meteorológicas reales (no observaciones retrospectivas), lo que permite medir la ganancia real de usar meteorología en producción. Según los resultados registrados, el modelo alcanza un MAE de 28,19 frente a 31,27 del Atlas sin meteorología en el invierno de Delhi 2024-25, una mejora del 9,85 % con p = 0,0009 sobre tres semillas.

Es relevante para desarrolladores e investigadores que trabajan en forecasting espacio-temporal de bajo coste computacional, especialmente en contaminación atmosférica, donde los modelos operativos suelen requerir infraestructura pesada. Aquí se demuestra que un modelo de menos de un millón de parámetros, con meteorología real, supera de forma estadísticamente significativa a su variante sin meteorología.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (código en repositorio GitHub del autor) |
| Parametros totales | 985.216 por checkpoint |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (predicción de horizonte fijo de 24 h) |
| Tipos de cuantizacion | no disponible (pesos PyTorch en fp32 presumiblemente) |
| Idiomas soportados | no disponible (modelo numérico, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (state dict dentro de un diccionario con metadatos) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un modelo de forecasting espacio-temporal con 985.216 parámetros. El código de arquitectura se publica en el repositorio GitHub del proyecto (`paradoxailab/paradox-world-model`) y la configuración de entrenamiento se almacena en el propio fichero de pesos bajo la clave `ck['cfg']`. El modelo se entrenó el 2026-11-16 en un entorno Kaggle identificado como `atlas-tb-s320`.

Los datos de entrenamiento provienen de dos fuentes: los informes horarios de calidad del aire de Delhi (OpenCity, 39 estaciones continuas de CPCB) y las predicciones meteorológicas de ECMWF del día anterior obtenidas vía Open-Meteo (previous runs). El autor indica explícitamente que los datos de entrenamiento no se incluyen en el repositorio, pero sí se documentan sus fuentes y términos en `DATA_SOURCES.md`. No se especifica el número de tokens ni la composición exacta del dataset, ni si hubo RLHF/DPO (no aplicable a este tipo de modelo). La innovación destacable es el uso de forecasts meteorológicos reales en lugar de observaciones retrospectivas, lo que valida la ganancia en un escenario operativo.

## Capacidades

- Predicción de las próximas 24 horas de PM2.5 en estaciones de calidad del aire de Delhi.
- Forecasting espacio-temporal multivariante sobre 39 estaciones de monitorización.
- Integración de variables meteorológicas exógenas provenientes de predicciones ECMWF del día anterior.
- Evaluación estadística de la ganancia frente a variantes sin meteorología (3 semillas, test pareado con p-valor reportado).
- No soporta tool calling, function calling ni razonamiento multi-step (no es un modelo de lenguaje).
- No dispone de capacidades multilingües, de visión ni de audio.
- No dispone de modo "thinking" ni de decodificación especulativa.

## Casos de uso

- Predicción operativa de calidad del aire en Delhi: el modelo genera el pronóstico de PM2.5 a 24 h para las 39 estaciones CPCB, permitiendo a autoridades emitir avisos sanitarios con un día de antelación usando meteorología prevista el día anterior.
- Sistema de alerta temprana para episodios de contaminación invernal: con MAE de 28,19 µg/m³ en el invierno 2024-25, es adecuado para disparar protocolos de reducción de tráfico o restricciones industriales cuando se prevén picos.
- Validación de pipelines meteorológicos: al usar forecasts reales de ECMWF, sirve para medir el impacto de la calidad del forecast meteorológico en la predicción de contaminación, no solo en condiciones ideales retrospectivas.
- Investigación en modelos espacio-temporales compactos: con menos de un millón de parámetros, es un baseline ligero para comparar arquitecturas de forecasting sin incurrir en costes de GPU.
- Integración en dashboards de salud pública: el tamaño reducido (7,9 MB por fichero) permite desplegarlo en CPU o en servicios serverless con latencia baja para actualizaciones horarias.
- Reproducibilidad de experimentos: el fichero incluye metadatos, configuración, resultados y logs de las ejecuciones, lo que facilita replicar el experimento y auditar la comparación con la variante sin meteorología.
- Estudio de transferibilidad geográfica: la arquitectura y el pipeline (CPCB + Open-Meteo) pueden adaptarse a otras ciudades con redes de monitorización similares.

## Benchmarks y rendimiento

| Metrica | Atlas-W Delhi (con meteo) | Atlas sin meteo | Diferencia | Significancia |
|---|---|---|---|---|
| MAE (invierno Delhi 2024-25) | 28,19 | 31,27 | -9,85 % | p = 0,0009 (3 semillas) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no son aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB para un checkpoint de 985.216 parámetros en fp32 (aproximadamente 4 MB de pesos); el fichero completo con dos checkpoints ocupa 7,9 MB.
- GPU recomendadas: cualquier GPU consumer o profesional es suficiente; no se requiere A100, H100 ni RTX 4090. Una GPU integrada o incluso CPU es viable.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, etc.) y en CPU sin problema.
- Opciones de despliegue: el autor solo documenta carga vía PyTorch (`torch.load` + `hf_hub_download`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos en CPU, pero no hay medición publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlas-W Delhi (T-B) | 985.216 | no disponible (horizonte 24 h) | PM2.5 Delhi 24 h | Apache-2.0 | Hugging Face |
| Atlas W10r (#53) | ~10M (según nombre) | no disponible | Forecasting con meteo regularizado | Apache-2.0 | Hugging Face |
| Atlas sin meteorología (variante interna) | 985.216 | no disponible | PM2.5 Delhi 24 h | Apache-2.0 | Referenciado en la model card |
| Atlas-5K v1 (#55) | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face |

No se dispone de comparación con modelos externos de forecasting de calidad del aire en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para Delhi y para la red CPCB de 39 estaciones; su uso en otras ciudades requiere reentrenamiento.
- El rendimiento reportado (MAE 28,19) corresponde al invierno 2024-25; no hay datos de validación en otras estaciones del año ni en años posteriores.
- Depende de la disponibilidad y calidad de los forecasts ECMWF vía Open-Meteo; si el forecast meteorológico falla o degrada, el rendimiento puede caer.
- No se documenta el número de tokens de entrenamiento ni la composición exacta del dataset, lo que limita la reproducibilidad completa.
- Los datos de entrenamiento no se incluyen en el repositorio; solo se referencian sus fuentes y términos, lo que puede impedir una replicación exacta.
- Riesgo de alucinación no aplicable en el sentido lingüístico, pero sí de predicciones erróneas en episodios extremos no representados en entrenamiento.
- No hay información sobre sesgos por estación (posible infrarrepresentación de estaciones con datos incompletos).
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el estado del modelo es "reported" (reportado, no verificado de forma independiente).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/paradoxailab/atlas-w-delhi-tb
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Registro de la versión (README Atlas): https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Índice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#53): https://huggingface.co/paradoxailab/atlas-w10r
- Modelo siguiente (#55): https://huggingface.co/paradoxailab/atlas-5k-v1
- Serie completa: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
