# OneScience-Group/CESM-SeasonalML

## Resumen

CESM-SeasonalML es un proyecto de machine learning interpretable desarrollado por OneScience-Group que predice cuatro patrones a gran escala de anomalías de precipitación estacional estandarizadas en el oeste de los Estados Unidos, por separado para los periodos NDJ (noviembre-diciembre-enero) y JFM (enero-febrero-marzo). El método proviene de un artículo científico publicado por equipos del Center for Western Weather and Water Extremes de la Scripps Institution of Oceanography y del NASA Jet Propulsion Laboratory. La model card indica que los modelos se entrenan sobre el ensemble climático CESM-LENS y se evalúan con los datos de ERSSTv5, ERA5 y el CPC Unified Gauge-Based Analysis of Global Daily Precipitation.

El repositorio no contiene un modelo preentrenado con pesos oficiales, sino código y scripts para entrenar, evaluar y visualizar modelos de tipo random forest, XGBoost, redes neuronales y LSTM. Las dimensiones de entrada son 103 para RF/XGB, 416 para redes neuronales y 28 para LSTM, con cuatro clases objetivo obtenidas mediante agrupamiento KMeans. No se trata de un modelo de lenguaje: es un pipeline de ciencia de datos climáticos, cuyo objetivo es la clasificación interpretable de patrones de precipitación estacional. Aunque la fecha de creación en HuggingFace es posterior a la publicación del paper, el proyecto se presenta como una implementación de ingeniería para validar el flujo de trabajo, no como el artefacto original del estudio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random forest, XGBoost, redes neuronales y LSTM (conjunto de modelos interpretables) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (según metadatos; el modelo procesa datos climáticos, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt); no incluye pesos preentrenados oficiales, el checkpoint se genera localmente |

## Arquitectura y entrenamiento

El proyecto implementa varios modelos de machine learning para clasificar campos de precipitación estacional en cuatro patrones. Según la model card, RF/XGB, redes neuronales y LSTM utilizan 103, 416 y 28 dimensiones de entrada, respectivamente. El objetivo de entrenamiento se construye mediante agrupamiento KMeans sobre campos de precipitación estacional estandarizados, generando cuatro clases estables. La interpretación de los modelos se realiza con random forests, analizando la contribución de predictores oceánicos y atmosféricos mediante importancia por permutación, profundidad mínima media y frecuencia de raíz.

Los datos de entrenamiento del artículo original son CESM-LENS, mientras que la evaluación se realiza con ERSSTv5, ERA5 y CPC. Sin embargo, el repositorio no incluye el conjunto de datos completo ni el manifiesto de características definitivo; la model card indica que el grid de 20×24 y las características de estructura son suposiciones de ingeniería. Para validar el flujo de trabajo se incluye un script de generación de datos sintéticos (`fake_data.py`) que no representa las distribuciones reales del paper. El entrenamiento soporta un solo dispositivo o distribución multi-GPU mediante `torchrun`. El repositorio no incluye los pesos del paper ni un checkpoint público confirmado.

## Capacidades

- Predicción de cuatro patrones a gran escala de precipitación estacional en el oeste de Estados Unidos, por separado para los periodos NDJ y JFM.
- Construcción de objetivos de entrenamiento estables mediante agrupamiento KMeans sobre campos de precipitación estandarizados.
- Interpretación de predictores clave con random forests, incluyendo importancia por permutación, profundidad mínima media y frecuencia de raíz.
- Generación de datos sintéticos para validar el pipeline completo: generación, entrenamiento, inferencia, evaluación y visualización.
- Entrenamiento distribuido multi-GPU o DCU con `torchrun`, validando el flujo de checkpoints y métricas.
- Evaluación de clasificación estacional con líneas base y generación de gráficos comparativos para modelos, líneas base y patrones de precipitación.
- No es un modelo de lenguaje: no admite generación de texto, tool calling, agentes ni procesamiento de lenguaje natural.

## Casos de uso

- Predicción operativa de precipitación estacional en el oeste de Estados Unidos: el modelo clasifica el patrón de anomalías de precipitación para NDJ y JFM, lo que resulta útil para la gestión de recursos hídricos, la planificación agrícola y la alerta temprana en regiones como California.
- Análisis de predictors climáticos: la interpretación con random forests permite identificar qué variables oceánicas y atmosféricas explican mejor los patrones de precipitación, ayudando a la investigación en climatología dinámica.
- Validación de pipelines en entornos sin acceso a CESM-LENS: el script `fake_data.py` genera datos sintéticos para probar el flujo completo de entrenamiento e inferencia sin necesidad de datos reales, lo que facilita la integración en sistemas de desarrollo.
- Benchmarking de algoritmos de clasificación estacional: el repositorio permite comparar el rendimiento de random forest, XGBoost, redes neuronales y LSTM sobre el mismo objetivo de cuatro clases, útil para seleccionar el modelo adecuado en producción.
- Despliegue en entornos AI4S: al estar diseñado para la plataforma OneCode, el modelo puede ejecutarse mediante interacción en lenguaje natural, reduciendo la barrera técnica para investigadores de ciencias de la Tierra.
- Entrenamiento distribuido en sistemas HPC: el soporte para `torchrun` permite escalar el entrenamiento a múltiples GPUs o DCUs, necesario cuando se trabaja con conjuntos climáticos de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el artículo asociado presenta resultados de habilidad, pero el repositorio no incluye estos valores numéricos. Los resultados generados con datos sintéticos son exclusivamente para validación de ingeniería y no representan el rendimiento del paper.

## Requisitos de hardware

- Para el entrenamiento de redes neuronales se recomienda una GPU o DCU; una CPU puede generar datos sintéticos y validar el flujo de trabajo por defecto a pequeña escala.
- La VRAM estimada para inferencia no está disponible en la información proporcionada.
- Los usuarios de DCU deben instalar DTK 25.04.2 o posterior, o la versión recomendada por OneScience para cada clúster.
- El despliegue no se realiza mediante vLLM, llama.cpp ni Ollama; el modelo se ejecuta como un script de Python dentro del entorno OneScience.
- La latencia y el throughput no están especificados en la documentación disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos comparativos con otros modelos de predicción de precipitación estacional. El único modelo mencionado como fuente de datos es CESM-LENS, que es un ensemble climático y no es comparable en la categoría de clasificación interpretable.

## Limitaciones y advertencias

- El repositorio no incluye los pesos preentrenados del paper; los resultados científicos no pueden reproducirse directamente con este código.
- Los datos sintéticos no representan las distribuciones reales, la escala del dataset ni el rendimiento del estudio original.
- Las dimensiones de entrada (103, 416 y 28) y el grid de 20×24 son suposiciones de ingeniería, según la propia model card.
- El modelo está calibrado para el oeste de Estados Unidos, por lo que su aplicación a otras regiones requeriría reentrenamiento y validación.
- Es un modelo de clasificación estadística, no generativo; no debe esperarse que procese lenguaje natural ni que realice tareas de razonamiento textual.
- La licencia Apache 2.0 es permisiva para uso comercial, pero no garantiza la disponibilidad de los datos de entrenamiento originales.

## Enlaces

- HuggingFace: https://huggingface.co/OneScience-Group/CESM-SeasonalML
- Paper: https://doi.org/10.1038/s43247-021-00225-4
- Perfil de OneScience en HuggingFace: https://huggingface.co/OneScience-Group
- Entorno OneCode para entrenamiento: https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home
