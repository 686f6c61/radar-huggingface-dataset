# PARADOXAIlabs/atlas-w10r

## Resumen

Atlas W10r es un modelo de series temporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de la serie Paradox World Model, en concreto la entrega número 53 de la serie (modelo 50 de 56 publicados). Su tarea es la predicción de las próximas 24 horas de concentración de PM2.5 en estaciones de monitorización de calidad del aire en la India, combinando datos de las estaciones CPCB con variables meteorológicas de ERA5 en la ubicación de cada estación.

El modelo cuenta con 9.909.792 parámetros (aproximadamente 10M) y se distribuye como un único checkpoint de PyTorch de 39.679.365 bytes. Según la model card, esta versión introduce regularización respecto a su predecesora (Atlas W10) y su resultado de validación registrado es 8.825, lo que supone un empeoramiento del 1,62% frente a W1; el autor marca explícitamente el modelo como "not adopted" (no adoptado) dentro de su proceso de selección de variantes.

Es relevante ahora porque documenta de forma transparente un experimento negativo dentro de una serie de ablaciones sistemáticas sobre predicción espacio-temporal de calidad del aire, con código de arquitectura público en GitHub y licencia Apache-2.0, lo que facilita la reproducibilidad y la comparación con las demás variantes de la familia Atlas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (código en repositorio GitHub del autor; no especificada en la model card) |
| Parámetros totales | 9.909.792 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch checkpoint (`.pt`, state dict serializado con `torch.save`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna más allá de identificarla como modelo de forecasting espacio-temporal dentro de la familia Atlas; el código de arquitectura se encuentra en el repositorio de GitHub del proyecto y la configuración exacta de entrenamiento está embebida en el propio checkpoint (`ck['cfg']`). El modelo opera sobre series de PM2.5 de estaciones CPCB y variables meteorológicas ERA5 asociadas a cada estación, y produce una predicción de las 24 horas siguientes.

Los datos de entrenamiento proceden del dataset de Kaggle "Time Series Air Quality Data of India (2010-2023)", que cubre 14 redes y 263 estaciones CPCB de toda la India, junto con datos ERA5 obtenidos del archivo Open-Meteo (Copernicus C3S) en cada ubicación de estación. El entrenamiento se realizó el 2026-11-16 en un kernel de Kaggle identificado como `atlas-w10r-s400`, y el modelo se publicó el 2026-11-17. Esta variante se describe como "regularised 10M (negative)", es decir, una ablación con regularización cuyo resultado fue negativo y por ello no fue adoptada en la serie. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de ajuste fino por refuerzo.

## Capacidades

- Predicción de series temporales: genera las próximas 24 horas de concentración de PM2.5 en estaciones de monitorización.
- Modelado espacio-temporal: incorpora información de múltiples estaciones (263) y de 14 redes de monitorización.
- Incorporación de variables exógenas meteorológicas: integra datos ERA5 en la ubicación de cada estación como covariables.
- Forecasting multiestación: el diseño de la familia Atlas apunta a predicción conjunta sobre la red de estaciones, no solo series aisladas.
- Carga e inspección programática: el checkpoint expone metadatos (`meta`), pesos (`weights`), resultados registrados (`results`) y configuración (`cfg`).
- No disponible: soporte de tool calling, capacidades de agente, razonamiento multi-paso, multilingüismo, visión o audio. Es un modelo especializado de forecasting, no un modelo de lenguaje.

## Casos de uso

- Predicción operativa de calidad del aire a 24 horas: el modelo produce el forecast de PM2.5 por estación, adecuado para sistemas de alerta temprana a población y autoridades ambientales en la India.
- Investigación en contaminación atmosférica: permite estudiar la contribución de variables meteorológicas (ERA5) a la evolución de PM2.5 al comparar predicciones con y sin dichas covariables.
- Evaluación de ablaciones y reproducibilidad: al ser un experimento negativo documentado, sirve como referencia para validar pipelines de entrenamiento y comparar variantes de la familia Atlas.
- Integración en paneles de monitorización: el checkpoint puede cargarse en CPU (`map_location="cpu"`) y alimentar dashboards que muestren previsiones por estación.
- Análisis de redes de monitorización: con 263 estaciones y 14 redes, permite estudiar el comportamiento diferencial de la predicción según red o región.
- Docencia y experimentación con series temporales: modelo pequeño (≈10M parámetros) y de licencia permisiva, útil como caso de estudio de forecasting espacio-temporal con variables exógenas.

## Benchmarks y rendimiento

| Métrica | Atlas W10r | Referencia indicada |
|---|---|---|
| Validación (métrica no especificada en la model card) | 8.825 | W1 (base): +1,62% respecto a W1 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; el único dato es la métrica de validación interna de la serie, cuya definición exacta no se detalla.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 9,9M de parámetros, los pesos en FP32 ocupan aproximadamente 40 MB (tamaño del checkpoint: 39,7 MB), por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre; tarjetas como RTX 3060, RTX 4090, A100 o H100 son sobradas para este modelo.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`) y `huggingface_hub`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de forecasting de este tipo).
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, la latencia esperada es de milisegundos en GPU y de decenas de milisegundos en CPU, aunque no se aportan medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Estado |
|---|---|---|---|---|---|
| Atlas W10r | 9.909.792 | no disponible | PM2.5 a 24 h con meteorología ERA5 | Apache-2.0 | No adoptado (validación 8.825) |
| Atlas W10 (#52) | ≈10M | no disponible | PM2.5 a 24 h con meteorología | Apache-2.0 | Versión previa de la serie |
| Atlas-W Delhi (#54) | no disponible | no disponible | Forecasts reales en Delhi (T-B) | Apache-2.0 | Versión siguiente de la serie |
| W1 (base de la serie) | no disponible | no disponible | PM2.5 a 24 h | Apache-2.0 | Referencia de comparación (+1,62% para W10r) |

No se dispone de información sobre modelos comparables de otros autores en la documentación proporcionada.

## Limitaciones y advertencias

- El propio autor marca el modelo como "not adopted": su resultado de validación empeora un 1,62% respecto a W1, por lo que no se recomienda su uso en producción frente a variantes adoptadas de la serie.
- Cobertura geográfica limitada a la India y a las estaciones CPCB del dataset de Kaggle (2010-2023); no hay evidencia de generalización a otras regiones o redes de monitorización.
- Dependencia de datos ERA5/Open-Meteo como entrada exógena: la predicción requiere disponer de esas variables meteorológicas para cada estación.
- No se documentan sesgos específicos, pero al entrenar sobre datos de monitorización de la India pueden heredarse sesgos de cobertura (estaciones urbanas frente a rurales) y de calidad de los sensores.
- Riesgo de error en episodios extremos de contaminación: no hay información sobre el comportamiento en picos, y la métrica de validación no está definida en la model card.
- La arquitectura no está descrita en la model card; para reproducirla hay que consultar el repositorio de GitHub y la configuración embebida en el checkpoint.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución; no obstante, los datos de entrenamiento no se distribuyen y sus términos están en `DATA_SOURCES.md`, por lo que el uso comercial debe verificar las condiciones de las fuentes originales (Kaggle, Copernicus).
- No dispone de descargas ni likes en Hugging Face en el momento de la consulta, lo que limita la validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PARADOXAIlabs/atlas-w10r
- Repositorio GitHub del proyecto: https://github.com/paradoxailab/paradox-world-model
- Registro de la serie Atlas: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Índice de la serie de modelos: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos y términos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#52 Atlas W10): https://huggingface.co/PARADOXAIlabs/atlas-w10
- Modelo siguiente (#54 Atlas-W Delhi): https://huggingface.co/PARADOXAIlabs/atlas-w-delhi-tb
- Todos los modelos de la serie: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Web del autor: https://paradoxailab.com
