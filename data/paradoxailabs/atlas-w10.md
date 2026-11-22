# PARADOXAIlabs/atlas-w10

## Resumen

Atlas W10 es un modelo de series temporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de la serie Paradox World Model, concretamente la entrega número 52 de la serie y el modelo 49 de 56 publicados. Su tarea es la predicción de las próximas 24 horas de concentración de PM2.5 en estaciones de medida, empleando datos de calidad del aire de la red CPCB de la India (14 redes, 263 estaciones) combinados con variables meteorológicas de ERA5 obtenidas vía Open-Meteo. El modelo tiene 9.909.792 parámetros y se distribuye como un único checkpoint de PyTorch de 39,7 MB.

El modelo no es un LLM ni un transformer generativo de propósito general: es un predictor espaciotemporal especializado en contaminación atmosférica. Su relevancia es limitada por su propio estado declarado: el autor lo marca explícitamente como "not adopted", con un resultado de validación de 8.773, lo que representa un empeoramiento del 1,02% respecto a la versión anterior W1. Se trata, por tanto, de un experimento documentado y publicado en abierto, no de un modelo recomendado para producción.

La ficha describe un artefacto de investigación con licencia Apache-2.0, sin benchmarks estándar publicados, sin información sobre idiomas (no aplica, al ser un modelo numérico) y con la arquitectura definida en un repositorio externo de GitHub en lugar de en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (código en repositorio GitHub del autor; no detallada en la model card) |
| Parámetros totales | 9.909.792 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (horizonte de predicción: 24 h) |
| Tipos de cuantización | no disponible (checkpoint PyTorch en precisión original; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no aplica (modelo numérico de series temporales) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, state dict serializado con `torch.save`, 39.678.933 bytes) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna más allá de indicar que el código está en el repositorio `paradoxailab/paradox-world-model` y que la configuración de entrenamiento se almacena dentro del propio checkpoint en la clave `ck['cfg']`. No se especifica si se trata de un transformer, una red convolucional, un modelo gráfico espaciotemporal o una combinación híbrida. El tamaño de 9,9 M de parámetros sugiere un modelo compacto, adecuado para inferencia en CPU.

Los datos de entrenamiento proceden de dos fuentes: el conjunto "Time Series Air Quality Data of India (2010-2023)" de Kaggle, que agrega las estaciones CPCB (14 redes, 263 estaciones), y variables meteorológicas ERA5 por estación obtenidas del archivo de Open-Meteo (Copernicus C3S). El entrenamiento se realizó el 2026-11-16 en el run de Kaggle `atlas-w10-s400`. No se documentan número de tokens, composición exacta del dataset, técnicas de regularización aplicadas ni si hubo ajuste fino con RLHF/DPO (no aplicable en este dominio). La variante posterior W10r introduce regularización, lo que sugiere que W10 carecía de ella.

## Capacidades

- Predicción de las próximas 24 horas de concentración de PM2.5 en estaciones de la red CPCB de la India.
- Modelado espaciotemporal: incorpora información de múltiples estaciones (263) y 14 redes distintas.
- Integración de covariables meteorológicas ERA5 por estación (temperatura, viento, humedad, etc., según disponibilidad de ERA5).
- Inferencia sobre series temporales numéricas; no procesa texto, imagen ni audio.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües (no aplica).
- No dispone de modo "thinking", visión ni audio.

## Casos de uso

- Investigación en calidad del aire: reproducción de experimentos de predicción de PM2.5 a 24 h sobre la red CPCB, comparando con la versión W1 y con W10r para evaluar el efecto de la regularización.
- Análisis de ablación: al ser una variante "10M + weather" marcada como negativa, sirve para estudiar si la incorporación de variables meteorológicas aporta o perjudica en este régimen de tamaño, dentro de la serie Paradox World Model.
- Docencia y formación: ejemplo compacto (9,9 M de parámetros, 39,7 MB) de pipeline completo de forecasting espaciotemporal con datos abiertos (Kaggle + ERA5), ejecutable en CPU.
- Prototipado de sistemas de alerta temprana: base para construir un servicio de aviso de episodios de contaminación, siempre que se sustituya por una variante con mejor validación (W1 o W10r) antes de producción.
- Benchmarking interno de modelos de series temporales: referencia de línea base para comparar arquitecturas propias sobre el mismo dataset CPCB/ERA5.
- Reproducibilidad de investigación: el checkpoint incluye metadatos, resultados y logs (`ck['meta']`, `ck['results']`), lo que facilita auditar el experimento y reutilizar la configuración (`ck['cfg']`).

## Benchmarks y rendimiento

El único dato de rendimiento publicado es el resultado de validación registrado por el autor:

| Métrica | Valor | Comparación |
|---|---|---|
| Validación (métrica no especificada en la model card) | 8.773 | +1,02% vs W1 (empeora) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La métrica de validación no se define explícitamente (podría ser MAE, RMSE u otra); no se inventan valores.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (9,9 M de parámetros ≈ 40 MB de pesos); holgadamente por debajo de cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es sobredimensionada para este modelo.
- Cabe en cualquier GPU consumer y en la mayoría de entornos sin GPU.
- Opciones de despliegue: carga directa con `torch.load` y `huggingface_hub.hf_hub_download`, tal como indica la model card. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de series temporales de este tipo).
- Latencia y throughput: no disponibles. Por el tamaño del modelo, se espera latencia de milisegundos en CPU para un lote pequeño, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Resultado validación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlas W10 (este modelo) | 9.909.792 | 24 h | 8.773 (+1,02% vs W1, no adoptado) | Apache-2.0 | Hugging Face, 0 descargas |
| Atlas W1 | no disponible | 24 h | referencia base | Apache-2.0 | Hugging Face |
| Atlas W10r | no disponible | 24 h | no disponible (variante regularizada) | Apache-2.0 | Hugging Face |

No se dispone de información sobre modelos de terceros comparables en la documentación proporcionada; la comparación se limita a las variantes de la propia serie.

## Limitaciones y advertencias

- Estado declarado por el autor: "not adopted". El modelo empeora un 1,02% respecto a W1 en validación, por lo que no se recomienda su uso en producción.
- Ámbito geográfico restringido: entrenado exclusivamente con estaciones CPCB de la India; la extrapolación a otras regiones no está validada.
- Dependencia de covariables ERA5: la inferencia requiere disponer de las mismas variables meteorológicas por estación que en entrenamiento; un pipeline distinto puede degradar el rendimiento.
- Sin regularización explícita (la variante W10r la añade), lo que puede favorecer sobreajuste.
- Métrica de validación no definida en la model card; imposibilita comparaciones rigurosas con otros trabajos.
- No se documentan sesgos, riesgos de alucinación (no aplica en el sentido de los LLM) ni limitaciones de contexto o idioma.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución; no obstante, la calidad del modelo desaconseja su uso comercial.
- Los datos de entrenamiento no se distribuyen con el modelo; sus fuentes y términos están en `DATA_SOURCES.md` del repositorio.
- Repositorio de 0,0 GB y 0 descargas: ecosistema prácticamente inexistente, sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PARADOXAIlabs/atlas-w10
- Serie completa: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Versión anterior (W1): https://huggingface.co/PARADOXAIlabs/atlas-w1
- Versión siguiente (W10r): https://huggingface.co/PARADOXAIlabs/atlas-w10r
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Registro de la serie Atlas: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Índice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Sitio del autor: https://paradoxailab.com
- Dataset de calidad del aire (Kaggle): "Time Series Air Quality Data of India (2010-2023)"
- ERA5 / Open-Meteo archive (Copernicus C3S): https://open-meteo.com
