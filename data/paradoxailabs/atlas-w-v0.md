# PARADOXAIlabs/atlas-w-v0

## Resumen

Atlas-W v0 (air core) es un modelo de predicción de series temporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model, concretamente el ejemplar número 43 de la serie y el modelo 40 de los 56 publicados. Su tarea es la previsión de las próximas 24 horas de concentración de PM2.5 en estaciones de calidad del aire, entrenado con datos de 39 estaciones de monitorización continua (CPCB Delhi, OpenCity "Delhi Hourly Air Quality Reports"). Se publica como un checkpoint de PyTorch de apenas 14.043 parámetros, lo que lo sitúa en la categoría de modelos ultracompactos especializados.

El modelo es relevante no por su escala, sino por su enfoque: un diseño "output-first" orientado a la eficiencia informativa que, según la model card, logra entre un 6 % y un 13 % menos de error que su predecesor Atlas en todos los volúmenes de datos evaluados. Esto lo convierte en un caso de estudio interesante para quienes trabajan con forecasting geoespacial de bajo coste computacional y despliegue en entornos con recursos limitados.

La ficha se basa únicamente en la información publicada en Hugging Face y en los enlaces al repositorio de GitHub del autor. No hay model card extendida, paper asociado ni resultados de benchmarks independientes en la información disponible, por lo que muchos apartados se marcan explícitamente como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card indica que el código está en el repositorio de GitHub, sin detallar el tipo) |
| Parámetros totales | 14.043 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (predice una ventana fija de 24 horas) |
| Tipos de cuantización | no disponible (checkpoint PyTorch de 144.107 bytes, probablemente float32) |
| Idiomas soportados | no disponible (modelo numérico de series temporales, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, state dict cargado con `torch.load`) |

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura interna del modelo. La model card indica que el código de arquitectura se encuentra en el repositorio de GitHub (`paradoxailab/paradox-world-model`) y que la configuración de entrenamiento está embebida en el propio checkpoint bajo la clave `ck['cfg']`. El tamaño de 14.043 parámetros sugiere una red de muy pequeña escala, probablemente una MLP, un modelo lineal regularizado o una arquitectura recurrente mínima, aunque esto no se confirma en la documentación publicada.

En cuanto a los datos, se entrenó con registros horarios de calidad del aire de 39 estaciones de monitorización continua de CPCB Delhi, obtenidos del conjunto "Delhi Hourly Air Quality Reports" de OpenCity. La tarea es la previsión de las próximas 24 horas de PM2.5. La model card menciona un diseño "information-efficient output-first" como principal cambio respecto a la versión anterior, pero no detalla la composición exacta del dataset, el número de tokens ni si hubo técnicas de regularización o ajuste fino específicas. El entrenamiento se realizó el 2026-11-13 en un notebook de Kaggle (`atlasw-v0`) y el modelo se publicó el 2026-11-17.

## Capacidades

- Predicción de series temporales: genera las próximas 24 horas de concentración de PM2.5 a nivel de estación.
- Forecasting espaciotemporal: entrenado con datos de 39 estaciones, lo que sugiere capacidad de modelar dependencias entre ubicaciones (no confirmado explícitamente en la model card).
- Eficiencia informativa: según el autor, mejora entre un 6 % y un 13 % el error de Atlas en todos los regímenes de datos evaluados.
- No soporta tool calling, function calling ni razonamiento multi-step: es un modelo numérico de forecasting, no un LLM.
- No tiene capacidades multilingües, de visión, audio ni modo "thinking".
- No se documentan capacidades de agentes ni de interacción conversacional.

## Casos de uso

- Monitorización de calidad del aire en Delhi: el modelo puede generar previsiones a 24 horas de PM2.5 por estación, útiles para sistemas de alerta temprana ante episodios de contaminación extrema en la región.
- Integración en paneles públicos de salud ambiental: al ser un checkpoint de 144 KB, puede desplegarse en un servidor modesto o incluso en un dispositivo edge para alimentar dashboards con predicciones horarias.
- Investigación en forecasting espaciotemporal de bajo coste: sirve como baseline compacto para comparar con modelos más grandes en tareas de predicción de contaminantes.
- Validación de pipelines de datos de sensores: su reducido tamaño permite ejecutarlo en tests automáticos que verifiquen la integridad de flujos de datos de estaciones de monitorización.
- Evaluación de técnicas de eficiencia informativa: el diseño "output-first" es un caso práctico para estudiar cómo modelos de muy pocos parámetros pueden superar a versiones previas más grandes en regímenes de datos limitados.
- Prototipado rápido en Kaggle o entornos de cuaderno: al estar entrenado y publicado con un flujo de Kaggle, es fácil de reproducir y adaptar a otros contaminantes o regiones con estructura de datos similar.

## Benchmarks y rendimiento

La model card reporta un único resultado: "14.043 parámetros; 6-13 % lower error than Atlas at every amount of data". No se especifica la métrica concreta (¿MAE, RMSE, MAPE?), ni los valores absolutos, ni el conjunto de evaluación, ni los modelos comparados más allá de "Atlas". No hay tabla de benchmarks con MMLU, HumanEval, GSM8K ni métricas equivalentes, ya que no es un modelo de lenguaje.

| Modelo | Parámetros | Resultado reportado |
|---|---|---|
| Atlas-W v0 | 14.043 | 6-13 % menos error que Atlas (métrica no especificada) |
| Atlas (versión previa) | no disponible | línea base |

No se han publicado resultados de benchmarks detallados en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos (144 KB en disco); la inferencia cabe holgadamente en cualquier GPU, CPU o incluso microcontrolador con PyTorch.
- GPU recomendadas: ninguna en particular; cualquier GPU consumer (GTX 1050, RTX 3060, etc.) o CPU es suficiente.
- Cabe en GPU consumer: sí, en cualquier modelo, e incluso en CPU sin aceleración.
- Opciones de despliegue: PyTorch nativo (carga con `torch.load`), exportación a ONNX o TorchScript para entornos de producción; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles; por el tamaño, la latencia sería del orden de microsegundos a milisegundos por predicción en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El único punto de comparación mencionado es la versión anterior "Atlas", de la que no se detallan parámetros ni arquitectura.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Atlas-W v0 | 14.043 | 24 h de horizonte | Apache-2.0 | Hugging Face |
| Atlas (previo) | no disponible | no disponible | no disponible | Hugging Face (serie) |
| Alternativas de forecasting de calidad del aire | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especialización geográfica extrema: entrenado exclusivamente con datos de 39 estaciones de Delhi; su generalización a otras ciudades o regiones no está validada.
- Un solo contaminante: predice únicamente PM2.5; no cubre otros contaminantes (NO2, O3, PM10, etc.).
- Horizonte fijo de 24 horas: no se documenta capacidad de extender el horizonte ni de condicionar a variables exógenas (meteorología, tráfico).
- Métricas incompletas: el autor reporta una mejora relativa (6-13 %) sin especificar la métrica ni los valores absolutos, lo que impide una evaluación rigurosa e independiente.
- Sin paper ni revisión por pares: la documentación se limita a la model card y al repositorio de GitHub; no hay validación externa.
- Riesgo de sobreajuste a las estaciones de entrenamiento: con solo 14.043 parámetros y 39 estaciones, la capacidad de generalización a estaciones no vistas es una incógnita.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Datos de entrenamiento no incluidos: la model card remite a `DATA_SOURCES.md` para las fuentes y términos, pero no se distribuyen los datos, lo que dificulta la reproducibilidad completa.

## Enlaces

- Hugging Face: https://huggingface.co/PARADOXAIlabs/atlas-w-v0
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Registro de la versión (README de Atlas): https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Índice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo previo (#42): https://huggingface.co/PARADOXAIlabs/atlas-delhi-v1.3
- Modelo siguiente (#44): https://huggingface.co/PARADOXAIlabs/atlas-w-v1-pretrain
- Todos los modelos de la serie: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio web del autor: https://paradoxailab.com
