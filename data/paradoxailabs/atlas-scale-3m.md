# PARADOXAIlabs/atlas-scale-3m

## Resumen

Atlas S2 (3M) es un modelo de predicción de series temporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model. Concretamente, es el modelo número 46 de 56 publicados (etiquetado como #49 en la numeración de la serie) y su tarea específica es pronosticar las próximas 24 horas de concentración de PM2.5 en estaciones de monitorización de calidad del aire en India. El modelo tiene 2.950.392 parámetros y se distribuye como un checkpoint de PyTorch (`.pt`) que contiene pesos, configuración de entrenamiento y metadatos.

El modelo se entrenó con datos de estaciones CPCB de toda India (14 redes, 263 estaciones) procedentes del dataset de Kaggle "Time Series Air Quality Data of India (2010-2023)". Según la model card, esta versión se marcó como "not adopted" (no adoptada) dentro de la escalera de parámetros de la familia Atlas, con un resultado de validación de 9.139, lo que supone una mejora del 0,38 % respecto a la variante de 1M de parámetros.

Es relevante por su carácter de experimento abierto y reproducible: el autor publica la arquitectura en GitHub, la configuración completa dentro del propio checkpoint y un registro de resultados por versión. No obstante, el modelo no está adoptado por el propio laboratorio y su rendimiento registrado no se acompaña de comparaciones con baselines externos, por lo que debe tratarse como una pieza de investigación más que como un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (código en el repositorio GitHub del proyecto; configuración en `ck['cfg']`) |
| Parametros totales | 2.950.392 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (predicción de horizonte fijo de 24 h) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numérico de series temporales, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict en `.pt` (11.827.269 bytes) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Se indica que el código de arquitectura está en el repositorio de GitHub del proyecto (`paradoxailab/paradox-world-model`) y que la configuración exacta con la que se entrenó esta versión está almacenada dentro del propio archivo bajo la clave `ck['cfg']`. No se especifica si se trata de un transformer, una red recurrente, un modelo convolucional o un híbrido; tampoco se detallan mecanismos de atención ni innovaciones técnicas.

En cuanto a los datos, el modelo se entrenó con las estaciones CPCB de toda India (14 redes, 263 estaciones) del dataset de Kaggle "Time Series Air Quality Data of India (2010-2023)". La tarea es la predicción de las próximas 24 horas de PM2.5. El entrenamiento se realizó el 2026-11-15 en el run de Kaggle `atlas-scale3m-s400` y el modelo se publicó el 2026-11-17. No se indica el número de tokens ni de pasos de entrenamiento, ni si hubo ajuste por RLHF/DPO (poco probable en un modelo de forecasting). El único cambio declarado respecto a versiones anteriores es el escalado de parámetros dentro de la "parameter ladder" de la familia.

## Capacidades

- Predicción de series temporales: pronóstico de las próximas 24 horas de concentración de PM2.5 en estaciones de monitorización.
- Modelado espacio-temporal: los tags indican explícitamente `spatiotemporal`, lo que sugiere que el modelo explota relaciones entre estaciones y no solo series individuales.
- Forecasting multivariante a nivel de red: entrenado con 263 estaciones de 14 redes distintas.
- Especialización geográfica: calibrado para datos de calidad del aire de India (CPCB).
- Carga y reproducción completas: el checkpoint incluye pesos, configuración (`cfg`), metadatos (`meta`) y todos los resultados registrados (`results`) con los logs del run.
- No dispone de tool calling, capacidades de agente, visión, audio ni generación de texto: es un modelo numérico de forecasting.

## Casos de uso

- Predicción operativa de calidad del aire a 24 h: desplegar el modelo sobre las lecturas horarias de una estación CPCB para anticipar episodios de contaminación por PM2.5 y activar alertas sanitarias con un día de antelación.
- Sistemas de alerta temprana para administraciones locales: integrar las predicciones en paneles municipales para decidir restricciones de tráfico o avisos a población sensible en función del PM2.5 previsto.
- Investigación en modelado espacio-temporal: usar el checkpoint como baseline reproducible (pesos + configuración + logs incluidos) para comparar arquitecturas de forecasting sobre el mismo dataset de Kaggle.
- Estudio de escalado de parámetros: al formar parte de una "parameter ladder" con variantes de 1M, 3M y 10M, permite analizar la relación entre tamaño y error de validación en una tarea concreta.
- Prototipado rápido en entornos con recursos limitados: con menos de 3M de parámetros, el modelo se puede cargar y ejecutar en CPU para experimentos y validaciones sin infraestructura GPU.
- Docencia y reproducción de experimentos: el formato del checkpoint (metadatos, configuración y resultados embebidos) facilita replicar el pipeline de entrenamiento y evaluación en cursos o talleres de series temporales.
- Análisis de calidad del aire en redes de sensores: aplicar el modelo a subconjuntos de estaciones para estudiar patrones de contaminación entre redes regionales.

## Benchmarks y rendimiento

El único dato de rendimiento publicado es el resultado de validación registrado en la model card:

| Metrica | Valor |
|---|---|
| Validacion (error registrado) | 9.139 |
| Mejora vs Atlas 1M | +0,38 % |
| Estado | no adoptado |

No se especifica la métrica exacta (¿RMSE, MAE?), ni se publican comparaciones con baselines externos, resultados en test, MMLU, HumanEval, GSM8K ni ningún otro benchmark estándar. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB para los pesos en precisión completa (2,95M de parámetros), más el estado del optimizador y buffers si se cargan; el archivo completo ocupa 11,8 MB.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100, H100 ni RTX 4090. Una GPU de gama baja o integrada es más que suficiente.
- Cabe en cualquier GPU de consumo e incluso en CPU: el modelo se puede ejecutar en un portátil convencional.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`) según el snippet de la model card; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables aquí).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlas S2 (3M) | 2.950.392 | no disponible (horizonte 24 h) | validación 9.139 | Apache-2.0 | Hugging Face + GitHub |
| Atlas 1M (versión previa de la familia) | ~1M (no confirmado) | no disponible | +0,38 % peor que 3M | Apache-2.0 | Hugging Face |
| Atlas S3 (10M) | ~10M (según nombre) | no disponible | no disponible | Apache-2.0 | Hugging Face |

No se dispone de información sobre modelos externos comparables (por ejemplo, baselines de forecasting de calidad del aire) en la documentación proporcionada. La comparación solo puede hacerse dentro de la propia familia Atlas, y los datos de las variantes 1M y 10M no están detallados en esta ficha.

## Limitaciones y advertencias

- Estado "not adopted": el propio laboratorio descartó esta versión, lo que sugiere que no supera los criterios internos de calidad o utilidad.
- Rendimiento sin contexto: el valor 9.139 no se acompaña de la métrica exacta, del conjunto de test ni de baselines, por lo que es difícil valorar su calidad real.
- Especialización geográfica y de dominio: entrenado exclusivamente con estaciones CPCB de India; su uso fuera de ese contexto (otras regiones, otros contaminantes) no está validado.
- Datos de entrenamiento no incluidos: la model card remite a `DATA_SOURCES.md` para las fuentes y términos; la reproducibilidad completa depende de terceros (Kaggle).
- Arquitectura no documentada en la model card: hay que consultar el repositorio de GitHub o inspeccionar `ck['cfg']` para conocerla.
- Sin información sobre sesgos: no se documentan sesgos ni limitaciones idiomáticas (no aplica, al ser un modelo numérico).
- Riesgo de alucinación no aplicable en el sentido lingüístico, pero sí riesgo de predicciones erróneas en episodios extremos de contaminación no representados en el entrenamiento.
- Licencia Apache-2.0: permite uso comercial, pero al no estar adoptado ni validado externamente, no se recomienda su uso en producción sin una evaluación propia.
- Sin garantías de mantenimiento: es un experimento de una serie de 56 modelos, con posible falta de soporte a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PARADOXAIlabs/atlas-scale-3m
- Repositorio GitHub del proyecto: https://github.com/paradoxailab/paradox-world-model
- Registro de la familia Atlas: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Índice de la serie completa: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (Atlas-P): https://huggingface.co/PARADOXAIlabs/atlas-p
- Modelo siguiente (Atlas S3, 10M): https://huggingface.co/PARADOXAIlabs/atlas-scale-10m
- Serie completa en Hugging Face: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Sitio web del laboratorio: https://paradoxailab.com
- Dataset de Kaggle: "Time Series Air Quality Data of India (2010-2023)" (referenciado en la model card; no se proporciona URL directa)
