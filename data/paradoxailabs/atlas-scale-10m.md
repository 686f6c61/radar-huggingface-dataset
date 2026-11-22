# PARADOXAIlabs/atlas-scale-10m

## Resumen

Atlas S3 (atlas-scale-10m) es un modelo de predicción de series temporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de la serie Paradox World Model. Su tarea concreta es la previsión de las próximas 24 horas de concentración de PM2.5 en estaciones de monitorización de calidad del aire de la India, a partir de los datos de las estaciones CPCB (14 redes, 263 estaciones) del conjunto de Kaggle "Time Series Air Quality Data of India (2010-2023)".

El modelo cuenta con 9.949.792 parámetros y se distribuye como un único checkpoint de PyTorch (`50_atlas_scale_10m.pt`, 39,8 MB) que contiene tanto los pesos como los metadatos de configuración, resultados y registros de entrenamiento. Se trata de un modelo de escala experimental dentro de una escalera de parámetros: según la model card, el aumento de parámetros no mejoró el resultado respecto a la versión de 1M, y el modelo figura explícitamente como "not adopted" (no adoptado) en la serie.

Es relevante ahora como pieza de un esfuerzo de investigación abierto sobre modelado espacio-temporal aplicado a calidad del aire, publicado bajo licencia Apache-2.0 con código de arquitectura en GitHub. No obstante, su estado "not adopted" y la ausencia de métricas de referencia estándar lo sitúan como un artefacto de investigación más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (código en repositorio GitHub del autor; configuración en `ck['cfg']`) |
| Parametros totales | 9.949.792 |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (tarea de previsión de horizonte fijo de 24 h) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo numérico de series temporales, sin entrada de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, state dict dentro de un diccionario con claves `meta`, `weights`, `results`, `cfg`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que el código está en el repositorio GitHub del proyecto y de que la configuración de entrenamiento se almacena en el propio checkpoint (`ck['cfg']`). La model card la enmarca en la familia Atlas, orientada a modelado espacio-temporal ("spatiotemporal") y a previsión de series temporales, con una tarea definida de predicción de las próximas 24 horas de PM2.5 en estaciones.

El entrenamiento se realizó el 2026-11-15 (ejecución de Kaggle `atlas-scale10m-s400`) sobre datos de estaciones CPCB de toda la India (14 redes, 263 estaciones) procedentes del conjunto de Kaggle "Time Series Air Quality Data of India (2010-2023)". Los datos de entrenamiento no se incluyen en el repositorio; sus fuentes y términos se documentan en `DATA_SOURCES.md`. La model card no indica número de tokens, composición exacta del dataset ni si se emplearon técnicas de RLHF/DPO (no aplicables, en principio, a un modelo de regresión de series temporales). El resultado registrado en validación es 9.222, con una mejora del +1,30 % respecto a la versión de 1M, y la conclusión anotada es que "más parámetros no ayudaron".

## Capacidades

- Previsión de las próximas 24 horas de concentración de PM2.5 en estaciones de monitorización.
- Modelado espacio-temporal sobre múltiples estaciones y redes de sensores (14 redes, 263 estaciones en los datos de entrenamiento).
- Predicción de series temporales univariadas/multivariadas según la configuración almacenada en el checkpoint.
- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa lenguaje natural).
- No dispone de modo thinking, audio ni otras modalidades.

## Casos de uso

- Previsión operativa de calidad del aire: el modelo puede generar una predicción a 24 horas de PM2.5 por estación, útil para sistemas de alerta temprana a población sensible en redes de monitorización como las de CPCB.
- Investigación en modelado espacio-temporal: sirve como punto de comparación en estudios sobre escalado de parámetros en modelos de previsión, dado que su resultado documenta que pasar de 1M a 10M parámetros no mejoró la validación.
- Reproducción de experimentos: al incluir `cfg`, `results` y registros de ejecución en el checkpoint, permite reproducir y auditar el entrenamiento y la evaluación registrados.
- Integración en pipelines de datos ambientales: el checkpoint puede cargarse con `torch.load` y conectarse a un pipeline que ingiera lecturas horarias de sensores y emita predicciones a 24 h.
- Docencia y formación: ejemplo compacto (39,8 MB) de flujo completo de publicación de un modelo de series temporales con metadatos, licencia y trazabilidad de resultados.
- Evaluación comparativa de familias de modelos: útil para contrastar la familia Atlas con otros enfoques de previsión de calidad del aire en el mismo conjunto de datos de Kaggle.

## Benchmarks y rendimiento

| Metrica | Valor | Referencia |
|---|---|---|
| Validación (resultado registrado) | 9.222 | Mejora de +1,30 % frente a la versión de 1M parámetros |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no son aplicables a un modelo de previsión de series temporales. La única métrica documentada es el resultado de validación de 9.222, sin que la model card especifique la unidad ni la métrica exacta (por ejemplo, RMSE o MAE).

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; el checkpoint ocupa 39,8 MB y el modelo tiene 9,9M de parámetros, por lo que cabe holgadamente en cualquier GPU consumer (incluso en CPU).
- GPU recomendadas: no se requiere GPU dedicada; cualquier GPU con suficiente memoria para el lote de inferencia (por ejemplo, RTX 3060 o superior) es más que suficiente.
- Cabe en GPU consumer: sí, en cualquier modelo actual e incluso en hardware de gama baja.
- Opciones de despliegue: carga directa con PyTorch (`torch.load` + state dict); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resultado validación | Licencia | Estado |
|---|---|---|---|---|---|
| Atlas S3 (atlas-scale-10m) | 9.949.792 | no disponible | 9.222 (+1,30 % vs 1M) | Apache-2.0 | No adoptado |
| Atlas (3M) | no disponible (3M según nombre) | no disponible | no disponible | Apache-2.0 | Versión previa de la serie |
| Atlas W1 (1M + weather) | no disponible (1M según nombre) | no disponible | no disponible | Apache-2.0 | Versión siguiente de la serie |

No se dispone de datos de benchmarks de modelos externos comparables en la información proporcionada; la comparativa se limita a las versiones de la propia serie Atlas.

## Limitaciones y advertencias

- Estado "not adopted": la propia model card indica que el modelo no fue adoptado en la serie, y que aumentar parámetros no mejoró el resultado.
- Ámbito geográfico y de datos restringido: entrenado con estaciones CPCB de la India; su generalización a otras regiones o redes de sensores no está documentada.
- Métrica de validación sin especificar: el valor 9.222 no indica la métrica ni la unidad, lo que dificulta la comparación rigurosa.
- Sin datos de sesgo documentados, pero un modelo de calidad del aire puede heredar sesgos de cobertura de la red de estaciones (posible infrarrepresentación de zonas rurales).
- Riesgo de alucinación no aplicable en el sentido de generación de texto, pero sí de predicciones poco fiables fuera del dominio de entrenamiento.
- Datos de entrenamiento no incluidos en el repositorio; solo se documentan sus fuentes y términos en `DATA_SOURCES.md`.
- Licencia Apache-2.0 permite uso comercial, pero la falta de validación externa y el estado "not adopted" desaconsejan su uso en producción sin evaluación propia.
- No hay información sobre cuantización ni sobre despliegue en servidores de inferencia estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PARADOXAIlabs/atlas-scale-10m
- Repositorio GitHub del proyecto: https://github.com/paradoxailab/paradox-world-model
- Registro de la familia Atlas: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Índice de la serie de modelos: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes y términos de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Versión previa (Atlas S2, 3M): https://huggingface.co/PARADOXAIlabs/atlas-scale-3m
- Versión siguiente (Atlas W1, 1M + weather): https://huggingface.co/PARADOXAIlabs/atlas-w1
- Todos los modelos de la serie: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
