# DAG-UPB/chronos-2-heat-demand-aalborg

## Resumen

Chronos-2 fine-tuned for heat demand (Aalborg smart heat meters) es un modelo de series temporales especializado en la previsión de demanda de calor en redes de calefacción de distrito. Lo desarrolla el grupo DAG-UPB (Data Analytics Group de la Universidad de Paderborn) partiendo de `amazon/chronos-2`, el modelo fundacional de previsión de Amazon, y ajustando la totalidad de sus pesos sobre datos horarios reales de contadores inteligentes de Aalborg (Dinamarca).

El modelo resuelve un problema concreto: predecir la demanda de calor tanto de edificios residenciales individuales como de agregados (pseudo-distritos y la suma de toda la red), incorporando temperatura exterior y un indicador de día laborable como covariables futuras conocidas. Con 119,5 millones de parámetros y una longitud de contexto de 2.048 horas (unos 85 días), se presenta como el modelo denominado Chronos-2-FT en el artículo *Forecasting Heat Demand of Single Buildings and Districts with Time Series Foundation Models* (Meyer, Albers, Müller).

Su relevancia radica en que demuestra que el ajuste fino de un modelo fundacional de series temporales mejora la precisión frente al uso zero-shot en una red concreta, aunque también evidencia limitaciones claras de transferencia a otras redes y de calibración de intervalos. Es un caso de estudio útil para quienes evalúan si merece la pena especializar modelos fundacionales en dominios de energía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (family tag `t5`), modelo fundacional de series temporales Chronos-2 |
| Parametros totales | 119.477.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 horas |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numérico de series temporales, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `amazon/chronos-2`, un transformer de tipo T5 adaptado a previsión de series temporales que soporta tareas univariantes, multivariantes y con covariables mediante aprendizaje en contexto (in-context learning). En este ajuste se entrenaron todos los pesos con `Chronos2Pipeline.fit` de la librería `chronos-forecasting` 2.3.2.

Los datos de entrenamiento proceden de 3.021 contadores inteligentes de calor de Aalborg (dataset de Schaffer et al. 2022, CC BY 4.0), con resolución horaria. Se construyeron 4.033 series: los 3.021 contadores, 11 pseudo-distritos más la suma de todos los contadores, y 1.000 sumas de contadores elegidos aleatoriamente (entre 10 y todos, con distribución log-uniforme). El periodo de entrenamiento es 2018-2019, con todas las series cortadas el 2020-01-01; 2020 se reserva como año de test. Las covariables son `t_ambient_c` (temperatura exterior de ERA5, en °C) e `is_working_day` (0/1), ambas conocidas para las horas de previsión.

El ajuste consistió en 16.000 pasos con learning rate 1e-5 y decaimiento lineal, semilla 20261022, sobre una única NVIDIA TITAN RTX durante 9,3 horas. El número de pasos se seleccionó sobre 2019 (validación) y después se reentrenó sobre 2018-2019 con el mismo esquema.

## Capacidades

- Previsión de series temporales horarias de demanda de calor con horizonte configurable (el ejemplo de la model card usa 24 horas).
- Previsión univariante de edificios individuales y de agregados (pseudo-distritos y suma de toda la red).
- Previsión con covariables futuras conocidas: temperatura exterior e indicador de día laborable.
- Generación de predicciones probabilísticas mediante niveles de cuantil (el ejemplo usa 0,1 a 0,9).
- Manejo de contexto largo de hasta 2.048 horas por serie.
- Procesamiento por lotes de múltiples series identificadas por `id` a través de `Chronos2Pipeline.predict_df`.
- No soporta tool calling, agentes, visión ni audio: es un modelo puramente numérico de forecasting.

## Casos de uso

- **Previsión operativa de demanda de una red de calefacción de distrito**: usar el modelo para predecir la demanda agregada de la red a 24 horas con la temperatura prevista como covariable, alimentando la planificación de producción de calor. Es adecuado porque fue entrenado explícitamente sobre la suma de todos los contadores de Aalborg.
- **Despacho de plantas de producción térmica**: predecir la carga horaria de distritos concretos (los 11 pseudo-distritos del entrenamiento) para decidir qué calderas o acumuladores activar, aprovechando que el modelo vio agregados de ese tamaño durante el ajuste.
- **Detección de anomalías en contadores individuales**: comparar la predicción del modelo para un edificio concreto con la lectura real y marcar desviaciones persistentes como posibles fallos de contador o fugas, gracias a la previsión univariante por edificio.
- **Investigación comparativa de modelos fundacionales**: emplear este checkpoint como referencia de "Chronos-2 ajustado" frente a zero-shot en experimentos de forecasting energético, ya que el artículo documenta la comparación directa.
- **Prototipado de sistemas de gestión energética en edificios**: integrar predicciones con cuantiles en un sistema de control para dimensionar márgenes de seguridad, calibrando antes los intervalos (ver limitaciones).
- **Generación de datos sintéticos de demanda para simulación**: usar las predicciones condicionadas a temperatura y día laborable para construir escenarios de demanda en estudios de viabilidad de redes de distrito.
- **Transferencia a otras redes mediante ajuste local**: partir de este checkpoint como inicialización para reentrenar sobre datos de otra red, dado que el propio autor advierte que la transferencia directa es escasa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al artículo *Forecasting Heat Demand of Single Buildings and Districts with Time Series Foundation Models* (Meyer, Albers, Müller; Universidad de Paderborn; preprint) para los resultados sobre el año de test 2020, e indica únicamente que el ajuste fino superó en precisión a Chronos-2 zero-shot con la misma entrada meteorológica en los contadores de Aalborg y sus sumas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 119,5 millones de parámetros en safetensors, el peso en precisión completa ronda los 0,5 GB (tamaño del repo), por lo que la inferencia en FP32 o FP16 debería caber holgadamente en GPUs de consumo, aunque no se documentan cifras oficiales.
- GPU de entrenamiento documentada: una NVIDIA TITAN RTX (24 GB), 9,3 horas para 16.000 pasos.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM debería ser suficiente, pero no hay recomendación oficial.
- Cabe en GPU de consumo: previsiblemente sí por tamaño de parámetros, aunque no se confirma en la documentación.
- Opciones de despliegue: librería `chronos-forecasting` (versión 2.3.2 usada en el entrenamiento) mediante `Chronos2Pipeline.from_pretrained`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DAG-UPB/chronos-2-heat-demand-aalborg | 119,5 M | 2.048 h | Fine-tune completo sobre demanda de calor de Aalborg | Apache-2.0 | Hugging Face |
| amazon/chronos-2 | 0,1 B (según model card) | no disponible en la información | Zero-shot, univariante/multivariante/con covariables | Apache-2.0 | Hugging Face |
| Chronos-2 zero-shot sobre Aalborg | 0,1 B | no disponible | Sin ajuste | Apache-2.0 | Hugging Face |

La comparación relevante documentada es contra el propio `amazon/chronos-2` en modo zero-shot: según la model card, el ajuste fino mejora la precisión en los contadores de Aalborg y sus sumas, pero no transfiere a otras redes (Flensburg, Helsinki). No se dispone de datos de benchmarks numéricos ni de comparaciones con otros modelos fundacionales de series temporales en la información proporcionada.

## Limitaciones y advertencias

- **Intervalos demasiado estrechos en agregados**: en las sumas de contadores, que el modelo vio durante el entrenamiento, se vuelve sobreconfiado; los intervalos del 80 % cubren claramente menos del 80 %. Hay que calibrarlos antes de usarlos para decisiones.
- **Escasa transferencia**: la mejora no se traslada a otras redes (Flensburg, Helsinki); en esos casos debe usarse Chronos-2 zero-shot o reajustar con datos locales.
- **Una sola red y un solo ámbito geográfico**: entrenado con edificios residenciales de una ciudad danesa y tres años de datos (2018-2019 de entrenamiento, 2020 de test).
- **Meteorología oracle**: en el artículo, las covariables de las horas de previsión son observaciones meteorológicas, no predicciones; en producción habrá que usar pronósticos y el rendimiento puede degradarse.
- **Riesgo de alucinación**: no aplica en el sentido lingüístico, pero el modelo puede producir previsiones plausibles fuera de distribución (por ejemplo, ante temperaturas extremas no vistas o cambios estructurales en la red).
- **Licencia**: Apache-2.0, permite uso comercial con atribución; el dataset subyacente es CC BY 4.0.
- **Sin datos de sesgo lingüístico ni multilingüe**: es un modelo numérico, no procesa texto.
- **Madurez**: repositorio con 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación, no un modelo con validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DAG-UPB/chronos-2-heat-demand-aalborg
- Modelo base: https://huggingface.co/amazon/chronos-2
- Organización DAG-UPB en Hugging Face: https://huggingface.co/DAG-UPB/datasets
- Librería chronos-forecasting en PyPI: https://pypi.org/project/chronos-forecasting/
- Blog de Amazon Science sobre Chronos-2: https://www.amazon.science/blog/introducing-chronos-2-from-univariate-to-universal-forecasting
- Dataset de contadores de Aalborg (Schaffer et al. 2022): https://zenodo.org/records/6563114
- Artículo del dataset: https://doi.org/10.1038/s41597-022-01502-3
