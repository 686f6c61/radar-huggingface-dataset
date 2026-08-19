# OneScience-Group/ClimaX

## Resumen

ClimaX es un modelo fundacional de propósito general para la ciencia del clima y la meteorología, desarrollado conjuntamente por Microsoft Research y la Universidad de California en Los Ángeles (UCLA). Fue presentado en ICML 2023 en el artículo *ClimaX: A Foundation Model for Weather and Climate*. Se trata del primer modelo que unifica el pre-entrenamiento sobre conjuntos de datos climáticos heterogéneos y la adaptación a tareas posteriores, como la predicción regional y las proyecciones climáticas, dentro de un único marco.

La arquitectura se basa en el Vision Transformer (ViT), lo que le permite procesar campos atmosféricos como imágenes multi-canal. El modelo está pre-entrenado con datos ERA5 y se adapta a diversas tareas de predicción mediante ajuste fino. La versión publicada en HuggingFace por OneScience-Group es una reproducción del modelo original bajo licencia MIT, orientada a facilitar su uso en entornos de investigación y desarrollo, con soporte para entrenamiento en GPU y DCU.

La relevancia actual de ClimaX radica en su enfoque de modelo fundacional aplicado a un dominio científico con datos masivos y heterogéneos, lo que abre la puerta a transferir el aprendizaje entre distintas variables climáticas y regiones, reduciendo la necesidad de entrenar modelos específicos desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa campos espaciales, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (aunque los datos son numéricos) |
| Licencia | MIT |
| Formato de pesos | no disponible (se mencionan checkpoints .pth en entrenamiento) |

## Arquitectura y entrenamiento

ClimaX emplea una arquitectura Vision Transformer, que trata cada variable climática (temperatura, presión, humedad, etc.) como canales de una imagen y cada punto de la rejilla espacial como un token. El modelo se pre-entrena sobre el conjunto de datos ERA5, que contiene variables atmosféricas históricas, y posteriormente se adapta a tareas específicas mediante ajuste fino. La innovación principal es su capacidad para manejar datos heterogéneos (diferentes variables, resoluciones y regiones) durante el pre-entrenamiento, lo que permite una transferencia efectiva a tareas downstream.

No se han proporcionado detalles sobre el número total de tokens de entrenamiento, la composición exacta del dataset, ni el uso de técnicas de alineación como RLHF o DPO. El entrenamiento se realiza con scripts de PyTorch y soporta ejecución multi-GPU mediante `torchrun`. El repositorio actual de OneScience-Group incluye una réplica del código original y promete la subida de pesos pre-entrenados en un futuro cercano.

## Capacidades

- Predicción meteorológica a corto y medio plazo a partir de datos de reanálisis.
- Pronóstico regional: adaptación a áreas geográficas específicas mediante ajuste fino.
- Proyecciones climáticas a largo plazo, aprovechando la generalización del pre-entrenamiento.
- Procesamiento de datos climáticos heterogéneos (múltiples variables, resoluciones y dominios).
- Soporte para entrenamiento distribuido en GPU y DCU (aceleradores chinos).
- Integración con el ecosistema OneScience para desarrollo AI4S.
- Capacidad de visualización de resultados de inferencia (mapas de predicción).

## Casos de uso

- **Predicción meteorológica operativa**: ClimaX puede generar pronósticos de variables como temperatura, precipitación o viento a partir de estados atmosféricos iniciales. Su arquitectura ViT permite procesar rejillas completas de forma eficiente, lo que lo hace adecuado para servicios meteorológicos que necesiten predicciones rápidas y escalables.
- **Pronóstico regional de alta resolución**: mediante ajuste fino con datos locales (por ejemplo, ERA5 recortado a una región concreta), el modelo puede adaptarse a orografías y patrones climáticos específicos, útil para agricultura, gestión de recursos hídricos o alertas tempranas.
- **Proyecciones climáticas para estudios de impacto**: al pre-entrenarse en datos históricos, ClimaX puede usarse para generar escenarios futuros bajo distintos forzamientos, ayudando a evaluar riesgos de inundaciones, sequías o cambios de temperatura en infraestructuras críticas.
- **Investigación en ciencias atmosféricas**: el modelo sirve como herramienta de experimentación para estudiar la transferencia entre variables y regiones, permitiendo a investigadores probar hipótesis sobre la dinámica climática sin entrenar modelos desde cero.
- **Generación de datos sintéticos para otros modelos**: las predicciones de ClimaX pueden emplearse como entrada para modelos hidrológicos, de calidad del aire o de energía renovable, reduciendo la dependencia de estaciones meteorológicas físicas.
- **Educación y prototipado rápido**: dado que el repositorio incluye scripts de entrenamiento e inferencia con datos sintéticos, es posible validar el flujo completo en una CPU o GPU modesta, lo que facilita su uso en cursos de aprendizaje automático aplicado a ciencias de la Tierra.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como RMSE, MAE o comparaciones con otros modelos. El repositorio promete pesos pre-entrenados, pero aún no están disponibles, por lo que no se puede evaluar el rendimiento real en tareas estándar de predicción meteorológica.

## Requisitos de hardware

- Se recomienda una GPU o DCU para entrenamiento e inferencia; una CPU es suficiente solo para validaciones de importación y flujo de datos, pero el entrenamiento completo sería extremadamente lento.
- No se especifica la VRAM mínima ni el número de parámetros, por lo que no es posible estimar los requisitos de memoria. Se asume que, al ser un ViT, la memoria dependerá del tamaño de la rejilla de entrada y del número de canales.
- Para DCU se requiere instalar DTK (versión 25.04.2 o superior recomendada).
- El entorno de ejecución se gestiona con conda y el paquete `onescience[earth-gpu]` o `onescience[earth-dcu]`.
- Opciones de despliegue: no se mencionan servidores de inferencia como vLLM o TGI, ya que es un modelo de visión, no de lenguaje. El código proporcionado incluye scripts de entrenamiento e inferencia en PyTorch.

## Comparativa con modelos similares

Existen otros modelos de predicción meteorológica basados en aprendizaje profundo, como FourCastNet, Pangu-Weather y GraphCast. Sin embargo, no se dispone de datos cuantitativos de comparación con ClimaX en la información proporcionada. A continuación se muestra una comparación cualitativa basada en información pública general (no extraída de la model card):

| Modelo | Arquitectura | Pre-entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| ClimaX (esta versión) | Vision Transformer | ERA5 | MIT | HuggingFace |
| FourCastNet | Transformer + FNO | ERA5 | CC-BY-NC | GitHub |
| Pangu-Weather | Transformer 3D | ERA5 | CC-BY-NC | GitHub |
| GraphCast | Graph Neural Network | ERA5 | CC-BY-NC | GitHub |

Nota: los datos de licencia y arquitectura de los modelos alternativos provienen de conocimiento general y no de la información proporcionada; se recomienda verificar en sus repositorios oficiales.

## Limitaciones y advertencias

- No se han publicado pesos pre-entrenados todavía; el repositorio indica que "se están preparando y se subirán pronto", por lo que actualmente solo es posible entrenar desde cero.
- No hay información sobre sesgos o riesgos de alucinación, ya que no es un modelo generativo de texto, sino de predicción numérica.
- La capacidad de generalización a regiones o variables no presentes en ERA5 no está documentada.
- La licencia MIT permite uso comercial, pero al ser una reproducción del modelo original, se recomienda revisar las atribuciones del paper y del código original.
- El modelo está diseñado para datos en formato HDF5 (ERA5); la integración con otros formatos puede requerir adaptaciones.
- No se especifican límites de resolución espacial o temporal; el rendimiento dependerá del ajuste fino.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OneScience-Group/ClimaX
- Paper original (arXiv): https://arxiv.org/abs/2301.10343
- Repositorio OneScience en GitHub: https://github.com/onescience-ai/OneScience
- Repositorio OneScience en Gitee: https://gitee.com/onescience-ai/onescience
- Repositorio de skills OneScience: https://github.com/onescience-ai/oneskills
- Dataset ERA5 de OneScience: https://huggingface.co/datasets/OneScience-Group/ERA5
