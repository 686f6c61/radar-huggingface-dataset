# OneScience-Group/GenCast

## Resumen

GenCast es un modelo de pronóstico meteorológico probabilístico global desarrollado originalmente por Google DeepMind, cuyo artículo científico apareció como portada de la revista *Nature* en diciembre de 2024. El repositorio OneScience-Group/GenCast ofrece una reproducción del modelo original, implementada en JAX, con el objetivo de facilitar su entrenamiento y evaluación en entornos de investigación. El modelo emplea redes neuronales de grafos (GNN) junto con modelos de difusión para generar predicciones por conjuntos (ensemble) a medio plazo, y según el artículo supera al sistema ENS del Centro Europeo de Previsiones Meteorológicas a Medio Plazo (ECMWF).

La relevancia de GenCast reside en que aborda la incertidumbre inherente a la predicción meteorológica mediante un enfoque generativo, proporcionando distribuciones de probabilidad sobre las trayectorias atmosféricas futuras en lugar de una única salida determinista. Esta capacidad resulta especialmente valiosa para la toma de decisiones en sectores sensibles al clima, como la energía, la agricultura o la gestión de emergencias. El repositorio de OneScience incluye scripts de entrenamiento, inferencia y visualización, así como datos de ejemplo para validación rápida, aunque los pesos preentrenados aún no están disponibles en el momento de la publicación de esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes neuronales de grafos (GNN) + modelo de difusión |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de datos meteorológicos, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta del repositorio; el modelo trabaja con datos numéricos) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el checkpoint de entrenamiento se guarda como .npz) |

## Arquitectura y entrenamiento

GenCast combina redes neuronales de grafos con modelos de difusión para generar pronósticos por conjuntos. La arquitectura exacta (número de capas, dimensiones, número de parámetros) no se detalla en la información proporcionada, pero el artículo original describe un modelo entrenado con datos de reanálisis ERA5 del ECMWF. El repositorio de OneScience indica que el entrenamiento se realiza sobre datos ERA5 en formato HDF5 siguiendo el protocolo de datos de GenCast, y ofrece la posibilidad de generar datos sintéticos para validar el pipeline sin necesidad de descargar el conjunto completo.

El proceso de entrenamiento utiliza JAX y soporta paralelización con `pmap` para múltiples GPUs. No se especifica el número de tokens (en este caso, pasos de tiempo o variables atmosféricas) ni si se aplicaron técnicas de ajuste como RLHF o DPO, que no son relevantes para un modelo de este tipo. La innovación principal reside en el uso de difusión para modelar la distribución de los estados atmosféricos futuros, lo que permite generar múltiples escenarios coherentes con la física del clima.

## Capacidades

- Generación de pronósticos meteorológicos probabilísticos por conjuntos a medio plazo (hasta 15 días, según el artículo original).
- Modelado de incertidumbre mediante muestreo de trayectorias atmosféricas.
- Entrenamiento y ajuste con datos ERA5 en formato HDF5.
- Inferencia y visualización de resultados mediante scripts incluidos.
- Soporte para entrenamiento multi-GPU con JAX `pmap`.
- No tiene capacidades de procesamiento de lenguaje natural, visión, código ni tool calling; es un modelo especializado en datos meteorológicos.

## Casos de uso

- Planificación de producción de energía renovable: el pronóstico por conjuntos permite estimar la probabilidad de viento o radiación solar en los próximos días, optimizando la operación de parques eólicos y solares.
- Gestión de riesgos de desastres naturales: las predicciones probabilísticas ayudan a anticipar eventos extremos como tormentas o olas de calor, mejorando los sistemas de alerta temprana.
- Agricultura de precisión: los agricultores pueden planificar riego, siembra o cosecha basándose en la distribución de temperaturas y precipitaciones esperadas.
- Investigación climática: el modelo puede utilizarse para estudiar la variabilidad atmosférica y comparar escenarios de cambio climático con datos de reanálisis.
- Validación de pipelines de machine learning: el script `fake_data.py` permite generar datos sintéticos para probar la carga de datos, el entrenamiento y la inferencia sin necesidad de descargar el conjunto ERA5 completo.
- Desarrollo de sistemas de predicción personalizados: investigadores pueden entrenar GenCast con sus propios datos meteorológicos regionales adaptando el protocolo de datos, gracias a la licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio indica que, según el artículo original, GenCast superó al sistema ENS del ECMWF en una evaluación exhaustiva, pero no se proporcionan métricas numéricas concretas (como CRPS, RMSE o puntuaciones de habilidad) en el material consultado. Se recomienda consultar el artículo de *Nature* para obtener datos detallados.

## Requisitos de hardware

- Se recomienda una GPU o DCU para entrenamiento e inferencia completos.
- Una CPU puede utilizarse para comprobaciones de importación y validación de conectividad, pero el entrenamiento y la inferencia serán muy lentos.
- No se especifican requisitos de VRAM ni modelos de GPU concretos en la información proporcionada.
- Para usuarios de DCU, se requiere instalar DTK (versión 25.04.2 o posterior) y usar el paquete `onescience[earth-dcu]`.
- Para GPUs, se recomienda instalar `onescience[earth-gpu]` con Python 3.11 y dependencias de compilación (gcc, libstdc++).
- El despliegue se realiza mediante scripts Python (`train.py`, `inference.py`, `result.py`), no a través de servidores de inferencia como vLLM u Ollama.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de pronóstico meteorológico (como GraphCast, Pangu-Weather o FourCastNet) en la documentación proporcionada. El repositorio no incluye tablas de comparación ni referencias a estos sistemas. Se recomienda consultar la literatura científica para obtener comparativas detalladas.

## Limitaciones y advertencias

- Los pesos preentrenados no están disponibles en el repositorio en el momento de la redacción; la model card indica que se subirán próximamente, por lo que el usuario debe entrenar el modelo desde cero si no espera a su publicación.
- El modelo está diseñado específicamente para datos ERA5 en formato HDF5; el uso con otras fuentes de datos requiere adaptar el protocolo de entrada.
- Al ser una reproducción, pueden existir diferencias con el modelo original de Google DeepMind en cuanto a rendimiento o comportamiento.
- Los datos de entrenamiento (ERA5) son un reanálisis, lo que implica posibles sesgos en regiones con escasez de observaciones.
- No se trata de un modelo de lenguaje, por lo que los riesgos de alucinación o sesgos lingüísticos no aplican; sin embargo, las predicciones meteorológicas pueden contener errores inherentes a la complejidad del sistema climático.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar la procedencia de los datos ERA5 y cumplir con sus términos de uso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OneScience-Group/GenCast
- Artículo original (arXiv): https://arxiv.org/abs/2312.15796
- Repositorio principal de OneScience en GitHub: https://github.com/onescience-ai/OneScience
- Repositorio de habilidades de OneScience en GitHub: https://github.com/onescience-ai/oneskills
- Repositorio principal de OneScience en Gitee: https://gitee.com/onescience-ai/onescience
- Repositorio de habilidades de OneScience en Gitee: https://gitee.com/onescience-ai/oneskills
