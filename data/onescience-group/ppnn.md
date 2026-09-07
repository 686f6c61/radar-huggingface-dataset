# OneScience-Group/PPNN

## Resumen

PPNN (Probabilistic Neural Network) es un modelo de red neuronal probabilística desarrollado por OneScience-Group para el postprocesamiento de pronósticos meteorológicos de ensamble. Convierte pronósticos de ensamble y datos de estaciones en distribuciones de probabilidad calibradas para la temperatura a 2 metros, lo que permite representar la incertidumbre de forma explícita en predicciones meteorológicas.

El modelo se basa en el trabajo de equipos de investigación de la Universidad Ludwig-Maximilian de Múnich, el Instituto de Tecnología de Karlsruhe y el Instituto de Estudios Teóricos de Heidelberg, publicado en el artículo "Neural Networks for Postprocessing Ensemble Weather Forecasts" (DOI: 10.1175/MWR-D-18-0187.1). La implementación de OneScience-Group es una reproducción de ingeniería independiente de esa especificación pública, y no incluye pesos preentrenados oficiales.

La arquitectura es una red neuronal probabilística que genera los parámetros de una distribución gaussiana (media y escala) a partir de los momentos estadísticos del ensamble y de metadatos de las estaciones. No es un modelo de lenguaje; no tiene longitud de contexto ni parámetros activos tipo MoE. El repositorio incluye datos sintéticos para validar el flujo de trabajo de entrenamiento e inferencia, pero no representa el rendimiento formal del paper original ni la escala de entrenamiento completa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal probabilística (arquitectura exacta no especificada en la documentación disponible) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es modelo de lenguaje) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (documentación y código; el modelo procesa datos numéricos) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (no se distribuyen pesos preentrenados; los checkpoints locales se guardan en formato PyTorch .pt) |

## Arquitectura y entrenamiento

PPNN es una red neuronal probabilística que toma como entrada los momentos estadísticos de un ensamble meteorológico (media, desviación, etc.) junto con información de la estación (ubicación, elevación) y produce los parámetros de una distribución normal (media y escala) para la temperatura a 2 metros. El entrenamiento optimiza la puntuación de probabilidad continua rankeada (CRPS) gaussiana, lo que permite calibrar la distribución predictiva en lugar de ajustar únicamente un valor puntual.

Los datos de entrenamiento del paper original consisten en pronósticos de ensamble del ECMWF TIGGE (50 miembros, 18 variables de pronóstico) y observaciones de estaciones del Deutscher Wetterdienst (DWD) de temperatura a 2 metros. Los pronósticos se inicializan diariamente a las 00 UTC con un horizonte fijo de 48 horas. El paper utiliza un conjunto de 10 redes independientes; la configuración por defecto del repositorio reduce este número a 2, y también reduce la anchura de las capas ocultas de 512 a 32, así como el número de épocas y muestras. El repositorio usa datos sintéticos para validar la construcción de características, el entrenamiento, la inferencia y la evaluación probabilística, y no incluye los datos oficiales TIGGE ni DWD.

El entrenamiento puede ejecutarse en un solo dispositivo o de forma distribuida con `torchrun` para múltiples GPUs. Los resultados se guardan en `result/checkpoints/ppnn.pt` y `result/training/metrics.json`. No se proporcionan pesos preentrenados en el repositorio, y los checkpoints generados localmente no deben presentarse como pesos oficiales.

## Capacidades

- Generación de distribuciones gaussianas calibradas para temperatura a 2 metros a partir de pronósticos de ensamble e información de estaciones.
- Postprocesamiento probabilístico de ensambles meteorológicos, incluyendo la representación explícita de incertidumbre.
- Entrenamiento con CRPS gaussiano para calibrar media y escala de la distribución predictiva.
- Evaluación probabilística mediante CRPS, CRPSS, PIT calibration y diagnósticos de spread-error.
- Soporte de entrenamiento multi-GPU con `torchrun` para replicar redes independientes.
- No soporta generación de texto, código, visión, tool calling, agentes ni razonamiento multi-step.
- No ofrece capacidades multilingües más allá del inglés en su documentación.

## Casos de uso

- Postprocesamiento operacional de ensambles meteorológicos: el modelo puede integrarse en pipelines de predicción numérica para convertir salidas de ensamble en distribuciones de probabilidad calibradas para temperatura a 2 metros en estaciones concretas.
- Calibración de temperatura a nivel de estación: es adecuado para ajustar sesgos sistemáticos y mejorar la fiabilidad de las predicciones en puntos de observación específicos, usando información de ubicación y elevación.
- Representación de incertidumbre en predicciones a 48 horas: genera una distribución gaussiana por estación, lo que permite cuantificar la incertidumbre en el pronóstico y comunicar rangos de probabilidad.
- Investigación en meteorología de ensambles: sirve como herramienta para estudiar métodos de postprocesamiento basados en redes neuronales y compararlos con enfoques estadísticos tradicionales.
- Validación de flujos de trabajo de IA para ciencias de la Tierra: el repositorio incluye scripts para validar construcción de características, entrenamiento, inferencia y evaluación en entornos OneCode o ModelScope.
- Entrenamiento distribuido multi-GPU: la configuración con `torchrun` permite entrenar réplicas independientes de la red en paralelo, útil para experimentos que requieran escalar el conjunto de redes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card indica explícitamente que los resultados obtenidos con los datos sintéticos del repositorio no representan el rendimiento formal del paper original. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni métricas similares, ya que este modelo no está orientado a tareas de lenguaje.

## Requisitos de hardware

- Se recomienda una GPU o una DCU para entrenamiento e inferencia.
- Una CPU puede utilizarse para validar la conectividad con la configuración de muestras pequeñas por defecto.
- Los usuarios de DCU deben instalar DTK 25.04.2 o posterior, o la versión recomendada por OneScience para su clúster.
- No se proporcionan estimaciones de VRAM, latencia ni throughput en la documentación disponible.
- No se mencionan integraciones con vLLM, Ollama, TGI, llama.cpp ni otros motores de despliegue. El uso previsto es mediante scripts Python con PyTorch.
- Las dependencias de software se instalan con `pip install onescience[earth-gpu]` o `onescience[earth-dcu]` desde el índice de mirrors de OneScience.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de postprocesamiento de ensambles meteorológicos, ni datos de rendimiento de modelos comparables.

## Limitaciones y advertencias

- No se distribuyen pesos preentrenados en el repositorio. Los checkpoints generados localmente en `result/checkpoints/ppnn.pt` no deben presentarse como pesos oficiales del paper.
- Los datos incluidos son sintéticos y se utilizan únicamente para validar el flujo de trabajo de ingeniería; no representan la distribución real de TIGGE o DWD, ni la escala de entrenamiento, ni el rendimiento formal del modelo.
- El modelo está limitado a temperatura a 2 metros y a un horizonte fijo de 48 horas. No soporta otras variables meteorológicas ni otros horizontes de predicción.
- La arquitectura exacta (número de capas, tipo de capas, función de activación, etc.) no está documentada en la información disponible.
- No se han publicado benchmarks ni evaluaciones comparativas que respalden su rendimiento en datos reales.
- La licencia Apache-2.0 permite uso comercial, pero al no existir pesos preentrenados oficiales, el usuario debe entrenar el modelo por su cuenta con datos propios, lo que implica costes y responsabilidad sobre la calidad del resultado.
- No se documentan sesgos conocidos, riesgos de alucinación o restricciones adicionales, al tratarse de un modelo numérico sin capacidades de lenguaje.

## Enlaces

- HuggingFace: https://huggingface.co/OneScience-Group/PPNN
- Paper original: https://doi.org/10.1175/MWR-D-18-0187.1
- OneScience GitHub: https://github.com/onescience-ai/OneScience
- OneScience Gitee: https://gitee.com/onescience-ai/onescience
- OneSkills GitHub: https://github.com/onescience-ai/oneskills
- OneSkills Gitee: https://gitee.com/onescience-ai/oneskills
