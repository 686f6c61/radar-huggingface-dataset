# OneScience-Group/Stormer

## Resumen

Stormer es un modelo de pronóstico meteorológico a medio plazo basado en una arquitectura Vision Transformer (ViT) estándar, desarrollado originalmente por investigadores del Argonne National Laboratory y la Universidad de California en Los Ángeles (UCLA). Su artículo principal, *Scaling Transformer Neural Networks for Skillful and Reliable Medium-Range Weather Forecasting*, fue publicado en NeurIPS 2024 y está disponible en arXiv. Esta implementación concreta, publicada por OneScience-Group, reproduce el modelo original y proporciona un flujo de trabajo completo de entrenamiento, inferencia y evaluación sobre datos de reanálisis ERA5.

El modelo resuelve el problema de la predicción meteorológica determinista a escalas de 1 a 15 días, superando en precisión a los modelos numéricos tradicionales (NWP) en varias métricas. Su relevancia actual radica en la creciente adopción de enfoques de deep learning en ciencias de la Tierra, donde Stormer demuestra que un transformer de visión, sin arquitecturas específicas de dinámica atmosférica, puede lograr resultados competitivos con una fracción del coste computacional. La versión de OneScience está pensada para facilitar su uso en entornos de investigación y desarrollo, con soporte para GPUs y DCUs (aceleradores chinos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) estándar |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa campos meteorológicos en 2D) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (documentación y scripts) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

Stormer emplea un Vision Transformer estándar, sin capas recurrentes ni mecanismos de atención especializados. Cada variable meteorológica (temperatura, presión, viento, humedad, etc.) se trata como un canal de entrada, y el modelo procesa los campos en una malla regular (típicamente 0.25° o 1.5° de resolución) mediante parches. El entrenamiento se realiza sobre el dataset de reanálisis ERA5, proporcionado por el Centro Europeo de Pronósticos Meteorológicos a Medio Plazo (ECMWF), y la implementación de OneScience permite entrenar desde cero o cargar pesos preentrenados (aunque estos aún no están disponibles en el repositorio). El paper original describe un escalado de la arquitectura (número de capas, dimensión del modelo, parches) que mejora sistemáticamente la precisión sin necesidad de cambios estructurales. No se menciona el uso de RLHF ni DPO, al tratarse de un modelo de regresión, no generativo.

## Capacidades

- Pronóstico meteorológico determinista a medio plazo (1-15 días) sobre variables como temperatura, viento, presión, humedad y precipitación.
- Procesamiento de datos de reanálisis ERA5 en formato HDF5.
- Entrenamiento distribuido multi-GPU mediante `torchrun`.
- Inferencia y visualización de resultados con scripts incluidos.
- Soporte para aceleradores DCU (Deep Computing Unit) además de GPUs NVIDIA.
- Validación rápida con datos sintéticos para comprobar el flujo de datos y entrenamiento.

## Casos de uso

- Investigación en predicción meteorológica: Stormer permite a investigadores comparar arquitecturas de deep learning con modelos numéricos tradicionales sobre ERA5, facilitando estudios de ablación y escalado.
- Generación de pronósticos operativos a corto plazo: con los pesos preentrenados (cuando estén disponibles), podría integrarse en pipelines de predicción para generar salidas cada 6 horas con latencia reducida frente a modelos NWP.
- Educación y formación en IA para ciencias de la Tierra: el repositorio incluye scripts de entrenamiento e inferencia con datos sintéticos, ideales para cursos universitarios.
- Desarrollo de sistemas de alerta temprana: combinado con umbrales estadísticos, puede predecir eventos extremos (olas de calor, tormentas) con antelación de varios días.
- Evaluación de hardware especializado: la compatibilidad con DCU permite probar el rendimiento de aceleradores alternativos en cargas de trabajo de pronóstico.
- Reproducción de resultados científicos: al ser una implementación fiel del paper, sirve como base para verificar los resultados publicados y extenderlos con nuevas variables o regiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper original reporta mejoras frente a modelos como Pangu-Weather y GraphCast en métricas como RMSE y ACC, pero esos datos no se incluyen en la model card de HuggingFace. Se recomienda consultar el artículo en arXiv para obtener cifras concretas.

## Requisitos de hardware

- Se recomienda una GPU o DCU para entrenamiento e inferencia; una CPU puede usarse solo para pruebas de importación y conectividad, pero el entrenamiento completo sería muy lento.
- No se especifica la VRAM necesaria, pero dado que es un ViT de tamaño moderado (el paper original usa ~100-300 millones de parámetros), es probable que quepa en GPUs de consumo como RTX 3090 o RTX 4090 con batch pequeño.
- Para entrenamiento multi-GPU se requiere `torchrun` y un nodo con al menos 8 GPUs (el script de ejemplo usa `--nproc_per_node=8`).
- Los usuarios de DCU deben instalar DTK 25.04.2 o superior.
- El despliegue se realiza mediante los scripts Python incluidos (`train.py`, `inference.py`, `result.py`), sin soporte nativo para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Stormer (esta implementación) | ViT | no disponible | no disponible | MIT | HuggingFace |
| Pangu-Weather | Transformer 3D | ~256M | malla 0.25° | no comercial | código abierto |
| GraphCast | Graph Neural Network | ~36.7M | malla 0.25° | Apache 2.0 | código abierto |
| FourCastNet | Adaptive Fourier Neural Operator | ~100M | malla 0.25° | BSD-3 | código abierto |

No se dispone de datos comparativos de rendimiento en la información proporcionada. Los modelos mencionados son alternativas conocidas en el mismo dominio, pero no se puede afirmar cuál es superior sin ejecutar evaluaciones sobre el mismo conjunto de datos.

## Limitaciones y advertencias

- Los pesos preentrenados aún no están disponibles en el repositorio; solo se puede entrenar desde cero, lo que requiere acceso a datos ERA5 completos y recursos computacionales considerables.
- La licencia MIT permite uso comercial, pero el modelo depende de datos ERA5, que tienen sus propias restricciones de uso (gratuitos para investigación, pero con condiciones para uso comercial).
- No se documentan sesgos específicos, pero al entrenarse con datos de reanálisis, puede heredar sesgos de las observaciones y del modelo de asimilación subyacente.
- La resolución espacial y las variables soportadas no se detallan en la model card; se asume que siguen la configuración del paper original.
- La documentación está en inglés y los scripts requieren conocimientos de Python y de formatos HDF5.
- El modelo no es un LLM; no genera texto ni responde a prompts, por lo que no es adecuado para tareas de procesamiento de lenguaje natural.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OneScience-Group/Stormer
- Paper original (arXiv): https://arxiv.org/abs/2312.03876
- Dataset ERA5 de OneScience: https://huggingface.co/datasets/OneScience-Group/ERA5
- Repositorio principal de OneScience en GitHub: https://github.com/onescience-ai/OneScience
- Repositorio de skills de OneScience en GitHub: https://github.com/onescience-ai/oneskills
- Repositorio principal de OneScience en Gitee: https://gitee.com/onescience-ai/onescience
- Repositorio de skills de OneScience en Gitee: https://gitee.com/onescience-ai/oneskills
