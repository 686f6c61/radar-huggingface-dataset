# OneScience-Group/deep-learning-weather-prediction

## Resumen

DLWP-CS es un modelo de predicción meteorológica global basado en redes neuronales convolucionales sobre una esfera cúbica (cubed-sphere), desarrollado por OneScience-Group. Su objetivo es mitigar las distorsiones geométricas que sufren las rejillas latitud-longitud convencionales cerca de los polos, mejorando así la precisión de los pronósticos a corto plazo. El modelo se inspira en el artículo *Improving Data-Driven Global Weather Prediction Using Deep Convolutional Neural Networks on a Cubed Sphere* (DOI: 10.1029/2020MS002109) y en el código oficial de su autor.

La implementación publicada en HuggingFace es una prueba estructural (smoke test) independiente, escrita en PyTorch, que reproduce la topología de seis caras de la esfera cúbica, el padding entre caras, las convoluciones, un U-Net simplificado y una activación leaky ReLU con límite superior. No incluye pesos entrenados con datos reales ni reproduce completamente el esquema experimental del artículo; sirve como base para investigación y verificación rápida de la arquitectura.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional sobre esfera cúbica con U-Net simplificado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica (modelo de predicción meteorológica con pasos temporales de 6 h y 12 h según el paper) |
| Tipos de cuantizacion | no disponible (formato nativo PyTorch) |
| Idiomas soportados | en, zh (documentación; el modelo no procesa lenguaje natural) |
| Licencia | GPL-3.0 |
| Formato de pesos | PyTorch (ficheros .pth, no safetensors) |

## Arquitectura y entrenamiento

La arquitectura se basa en una malla de esfera cúbica con seis caras, cada una de tamaño `[6, H, W]` (en la implementación actual `[6, 8, 8]`, mientras que el paper usa `[6, 48, 48]`). Las convoluciones operan sobre esta malla con padding entre caras adyacentes, respetando las conexiones geométricas de la esfera. Se emplea un U-Net simplificado de un solo nivel (el paper usa dos niveles) y una función de activación leaky ReLU con límite superior (capped leaky ReLU). La entrada actual es un tensor de 2 canales sin semántica física, mientras que el paper utiliza 4 variables dinámicas (Z500, Z1000, espesor 300-700 hPa y temperatura a 2 m) más campos auxiliares como radiación solar, máscara tierra-mar y topografía.

El entrenamiento se realiza con un conjunto de datos sintético determinista generado por `model/dataset.py`, sin necesidad de descargar datos externos. El script `train.py` ejecuta múltiples épocas con validación, ajuste de tasa de aprendizaje y early stopping, usando pérdida MSE. No se ha realizado entrenamiento con datos ERA5 reales en esta versión; el modelo se distribuye sin pesos preentrenados. La inferencia es autorregresiva, generando predicciones paso a paso.

## Capacidades

- Predicción meteorológica global a corto plazo (pasos de 6 h y 12 h según el diseño del paper).
- Manejo de topología de esfera cúbica con seis caras, incluyendo padding y convoluciones entre caras.
- Implementación de un U-Net simplificado para procesamiento espacial.
- Entrenamiento e inferencia autorregresiva.
- Compatibilidad con datos ERA5 (requiere preprocesamiento con Tempest-Remap para la rejilla CS48).
- Soporte para verificación rápida de la arquitectura con datos sintéticos.

## Casos de uso

- Investigación en arquitecturas de predicción meteorológica: permite estudiar el comportamiento de convoluciones sobre esfera cúbica, validar la conectividad entre caras y probar variantes de U-Net sin necesidad de datos reales.
- Verificación local rápida: el script de entrenamiento con datos falsos permite comprobar el flujo completo (forward/backward, pérdida, checkpoints) en minutos, incluso en CPU.
- Base para desarrollo de modelos operativos: la estructura puede extenderse para incorporar variables ERA5 reales, campos auxiliares y el esquema de entrenamiento de dos pasos descrito en el paper.
- Educación y formación: útil para aprender sobre redes neuronales aplicadas a ciencias de la Tierra, específicamente en el dominio de la esfera cúbica.
- Pruebas de integración en pipelines de datos meteorológicos: la salida en formato `.pt` y los scripts de evaluación facilitan la conexión con otros módulos de análisis.
- Evaluación de métricas de calidad: aunque las métricas actuales (RMSE, ACC) son solo comprobaciones de conectividad, el código proporciona una base para implementar métricas con significado físico (ponderación por latitud, anomalías climatológicas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las métricas RMSE y ACC calculadas en el script `result.py` son solo comprobaciones de conectividad sobre tensores sintéticos y no aplican desnormalización, ponderación por área latitudinal, mapeo inverso de la esfera cúbica ni cálculo de anomalías diarias climatológicas. Por tanto, no hay datos de rendimiento comparables con otros modelos de predicción meteorológica.

## Requisitos de hardware

- CPU: suficiente para ejecutar la configuración mínima (entrenamiento con datos sintéticos de tamaño `[6,8,8]`).
- GPU: recomendada para entrenamiento con datos reales (ERA5) y para la rejilla CS48 del paper.
- No se especifican modelos concretos de GPU ni VRAM estimada.
- Opciones de despliegue: scripts locales de PyTorch (`train.py`, `inference.py`, `result.py`); no se menciona compatibilidad con vLLM, llama.cpp u otros motores de inferencia (no es un modelo de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con otros modelos de predicción meteorológica basados en deep learning (como FourCastNet, Pangu-Weather o GraphCast). La implementación actual es una versión reducida del DLWP-CS original del paper, sin entrenamiento real. Se recomienda consultar el artículo original para conocer el rendimiento del modelo completo frente a otras arquitecturas.

## Limitaciones y advertencias

- Es una implementación de prueba estructural, no una reproducción fiel del paper ni un modelo operativo.
- No incluye pesos preentrenados; el entrenamiento con datos sintéticos no produce un modelo útil para predicción real.
- Las métricas RMSE y ACC generadas no tienen significado físico.
- La entrada actual (2 canales) no representa variables meteorológicas reales.
- No se ha implementado el esquema de entrenamiento de dos pasos autorregresivos descrito en el paper.
- Para uso con datos ERA5 reales se requiere implementar el dataset, el remapeo CS48, las variables dinámicas y los campos auxiliares.
- Licencia GPL-3.0: cualquier uso comercial o distribución debe cumplir con los términos de la licencia.
- No hay garantía de soporte o mantenimiento por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OneScience-Group/deep-learning-weather-prediction
- Paper original: https://doi.org/10.1029/2020MS002109
- Código oficial (referencia): https://github.com/jweyn/DLWP-CS
- Repositorio OneScience (GitHub): https://github.com/onescience-ai/OneScience
- Repositorio OneScience (Gitee): https://gitee.com/onescience-ai/onescience
