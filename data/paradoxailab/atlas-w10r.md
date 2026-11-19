# paradoxailab/atlas-w10r

## Resumen

Atlas W10r es un modelo de forecasting espacio-temporal desarrollado por ParadoxAI Lab dentro de la serie Paradox World Model, en concreto la entrega numero 53 de la serie y el modelo 50 de los 56 publicados. Su tarea es predecir las proximas 24 horas de concentracion de PM2.5 en estaciones de monitorizacion de calidad del aire en India, combinando datos de las estaciones CPCB con variables meteorologicas de ERA5 en cada punto.

Se trata de un modelo pequeno, de 9.909.792 parametros, entrenado sobre 14 redes y 263 estaciones del dataset publico "Time Series Air Quality Data of India (2010-2023)" de Kaggle, enriquecido con datos de reanalisis ERA5 obtenidos via Open-Meteo archive (Copernicus C3S). La variante "r" corresponde a una version regularizada del modelo de 10M con variables meteorologicas (W10), y segun los registros del autor obtuvo un resultado de validacion de 8.825, un 1,62% peor que la version W1, motivo por el cual fue marcada como "not adopted" dentro de la serie.

El modelo es relevante como pieza de un esfuerzo de investigacion abierto y reproducible: el autor publica tanto los pesos en formato PyTorch como el codigo de arquitectura y los registros de resultados en GitHub, lo que permite auditar decisiones de diseno y comparar variantes. No obstante, al no haber sido adoptado y al no contar con benchmarks publicos frente a alternativas, debe considerarse una variante experimental dentro de una serie mas amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (codigo en repositorio GitHub del autor) |
| Parametros totales | 9.909.792 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (forecasting de horizonte fijo de 24 h) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numerico de series temporales, sin interfaz de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict (`.pt`, 39.679.365 bytes) |

## Arquitectura y entrenamiento

No se dispone de detalle arquitectonico en la informacion proporcionada; la model card indica unicamente que el codigo de arquitectura esta en el repositorio GitHub del autor y que la configuracion de entrenamiento esta embebida en el propio checkpoint bajo la clave `ck['cfg']`. El modelo pertenece a la familia Atlas, orientada a forecasting espacio-temporal, y su sufijo "W" indica inclusion de variables meteorologicas junto a las series de PM2.5 de las estaciones.

Los datos de entrenamiento provienen del dataset CPCB all-India stations (14 redes, 263 estaciones) publicado en Kaggle como "Time Series Air Quality Data of India (2010-2023)", cruzado con datos ERA5 por estacion via Open-Meteo archive (Copernicus C3S). El entrenamiento se realizo el 2026-11-16 en la ejecucion de Kaggle `atlas-w10r-s400`, y el modelo se libero el 2026-11-17. La variante se describe como "regularised 10M (negative)", es decir, una regularizacion aplicada sobre la configuracion de 10M que no mejoro el resultado respecto a la referencia. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (poco plausibles en un modelo de forecasting numerico).

## Capacidades

- Prediccion de las proximas 24 horas de concentracion de PM2.5 en estaciones de monitorizacion.
- Modelado espacio-temporal sobre 263 estaciones distribuidas en 14 redes en India.
- Integracion de variables meteorologicas ERA5 (temperatura, viento, humedad, etc.) como entrada auxiliar por estacion.
- Inferencia numerica pura: no genera texto, no soporta tool calling ni function calling.
- No dispone de modo de razonamiento, vision ni audio.
- No dispone de capacidades multilingues en sentido linguistico; opera sobre datos numericos.
- Carga sencilla via `torch.load` con `weights_only=False`, con metadatos (`meta`), pesos (`weights`), resultados (`results`) y configuracion (`cfg`) en un unico fichero.

## Casos de uso

- Prediccion operativa de calidad del aire a 24 h en India: el modelo puede generar el forecast horario de PM2.5 por estacion para alimentar paneles publicos de salud ambiental, aprovechando su entrenamiento especifico sobre la red CPCB.
- Sistema de alertas tempranas de episodios de contaminacion: integrado en un pipeline que consulte las predicciones cada hora y dispare avisos cuando el PM2.5 previsto supere umbrales regulatorios, con horizonte de 24 h suficiente para activar protocolos.
- Investigacion academica sobre forecasting espacio-temporal: al publicar pesos, configuracion y registros, sirve como baseline reproducible para comparar tecnicas de regularizacion o de incorporacion de meteorologia en modelos de contaminacion.
- Estudio de sensibilidad meteorologica: permite analizar como las variables ERA5 influyen en la prediccion de PM2.5 estacion por estacion, comparando esta variante con la W10 y la W1 de la misma serie.
- Prototipado rapido en entornos con recursos limitados: con ~10M parametros y un fichero de ~40 MB, cabe en cualquier GPU consumer e incluso en CPU para inferencia por lotes, lo que facilita experimentacion sin infraestructura dedicada.
- Benchmark interno de variantes: util como referencia negativa (marcada "not adopted") para validar que la regularizacion aplicada no aporta mejora, informando futuras iteraciones de la serie.
- Educacion y docencia: ejemplo compacto y completo de un pipeline de forecasting espacio-temporal con datos abiertos (CPCB + ERA5) y pesos liberados bajo Apache-2.0.

## Benchmarks y rendimiento

Unico resultado registrado por el autor en la model card:

| Metrica | Valor | Comparacion |
|---|---|---|
| Validacion (metrica no detallada) | 8.825 | +1,62% vs W1 (peor) |

No se han publicado resultados de benchmarks frente a modelos externos en la informacion disponible. La metrica de validacion no se especifica (no se indica si es RMSE, MAE u otra), y no hay comparaciones con baselines como persistencia, ARIMA, LSTM o modelos de grafos espacio-temporales.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para pesos en FP32 (fichero de 39,7 MB); margen adicional para activaciones y batch.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.); tambien viable en CPU para inferencia por lotes pequenos.
- Cabe holgadamente en GPU consumer, incluida gama de entrada.
- Opciones de despliegue: no se documentan frameworks especificos; al ser un state dict PyTorch puro, se puede servir con TorchServe, FastAPI + PyTorch, o scripts personalizados. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano (~10M parametros) se espera latencia de milisegundos por estacion y lote en GPU consumer.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlas W10r (este modelo) | 9.909.792 | no disponible (horizonte 24 h) | validacion 8.825 | Apache-2.0 | Hugging Face (repo vacio, 0 GB) |
| Atlas W10 (modelo #52) | 10M aprox. | no disponible (horizonte 24 h) | referencia base de la serie | Apache-2.0 | Hugging Face |
| Atlas W1 | no disponible | no disponible (horizonte 24 h) | 1,62% mejor que W10r | Apache-2.0 | Hugging Face |

No se dispone de comparaciones con modelos externos de forecasting de calidad del aire (por ejemplo, baselines LSTM, Graph Neural Networks o modelos operativos tipo CAMS) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo marcado explicitamente como "not adopted" por el autor: la regularizacion aplicada empeoro el resultado respecto a la variante W1, por lo que no se recomienda como modelo de produccion.
- Cobertura geografica limitada a India y a las 263 estaciones CPCB del dataset de entrenamiento; no generaliza fuera de esa red sin reentrenamiento.
- Horizonte fijo de 24 h; no se documenta soporte para horizontes mayores ni para resolucion subhoraria distinta.
- Sin benchmarks publicos frente a alternativas: no es posible afirmar superioridad o equivalencia frente a otros metodos de forecasting.
- Metrica de validacion no detallada (no se especifica si es RMSE, MAE u otra), lo que dificulta interpretar el valor 8.825 en terminos absolutos.
- Dependencia de datos ERA5 via Open-Meteo archive: en produccion requiere un pipeline de obtencion de meteorologia en tiempo casi real, con latencia y posibles huecos.
- Repositorio Hugging Face con 0 GB y 0 descargas: el fichero de pesos no aparece efectivamente alojado en el momento de la consulta, lo que puede impedir la carga directa con `hf_hub_download`.
- Licencia Apache-2.0 permite uso comercial, pero los datos de entrenamiento (Kaggle y Copernicus C3S) tienen sus propios terminos recogidos en `DATA_SOURCES.md`; verificar compatibilidad antes de uso comercial.
- Riesgo de sesgo por cobertura desigual de estaciones (14 redes, predominio urbano) y por la ventana temporal 2010-2023, que puede no reflejar cambios recientes en emisiones o politicas.
- Sin interfaz de lenguaje: no es un modelo conversacional y no debe evaluarse con criterios de LLM.

## Enlaces

- Hugging Face: https://huggingface.co/paradoxailab/atlas-w10r
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Registro Atlas (README): https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Indice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citacion: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#52 Atlas W10): https://huggingface.co/paradoxailab/atlas-w10
- Modelo siguiente (#54 Atlas-W Delhi): https://huggingface.co/paradoxailab/atlas-w-delhi-tb
- Serie completa: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
