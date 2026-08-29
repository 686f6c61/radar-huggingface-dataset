# mazin903/tourism-package-model

## Resumen
El modelo `mazin903/tourism-package-model` es un clasificador binario basado en XGBoost desarrollado por el usuario mazin903. Su objetivo es predecir si un cliente adquirirá el paquete de turismo de bienestar (Wellness Tourism Package) de una empresa de viajes, a partir de variables de perfil y comportamiento del cliente. El modelo está diseñado para priorizar acciones de venta y segmentación de campañas, apoyando decisiones comerciales en lugar de automatizarlas por completo.

Se trata de un modelo de machine learning clásico, no de un modelo de lenguaje, por lo que su arquitectura se basa en árboles de decisión potenciados (gradient boosting). El repositorio en Hugging Face incluye el artefacto entrenado en formato joblib, junto con la lógica de preprocesamiento (imputación, escalado y codificación) documentada en la model card. Aunque el modelo no presenta métricas oficiales de validación externa, la validación local reporta una precisión (accuracy) de 0.913 y un F1 de 0.778.

La relevancia de este modelo radica en su aplicación directa en el sector turístico, donde la predicción de intención de compra permite optimizar campañas y recursos comerciales. Su tamaño reducido y su naturaleza tabular lo hacen adecuado para entornos de producción con recursos limitados, sin necesidad de GPUs especializadas. No obstante, carece de información pública sobre licencia, idiomas o detalles del dataset de entrenamiento, lo que limita su reproducibilidad y uso comercial sin verificación previa.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | XGBoost (clasificador binario, gradient boosting sobre árboles) |
| Parametros totales | no disponible (modelo basado en árboles; número de árboles y profundidad no especificados) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, no procesa secuencias) |
| Tipos de cuantizacion | no aplica (no es un modelo de red neuronal) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | joblib (según etiqueta del repositorio) |

## Arquitectura y entrenamiento
El modelo emplea XGBoost, una implementación eficiente de gradient boosting que combina múltiples árboles de decisión débiles para formar un predictor robusto. El preprocesamiento documentado incluye imputación de valores numéricos con la mediana, escalado estándar de características numéricas, imputación de categóricas con la moda y codificación one-hot para variables categóricas. La variable objetivo es `ProdTaken`, que indica si el cliente adquirió el paquete.

El entrenamiento se realizó con división estratificada de train/test, ponderación de clases para manejar el desequilibrio, búsqueda de hiperparámetros mediante grid search y análisis de umbral de decisión. Se utilizó MLflow para el seguimiento de experimentos. No se especifica el tamaño del dataset ni el número de características, pero las métricas locales sugieren un ajuste razonable sin señales evidentes de sobreajuste.

## Capacidades
- Clasificación binaria de probabilidad de compra (sí/no) para un paquete turístico específico.
- Salida de probabilidad continua, lo que permite ajustar el umbral de decisión según la estrategia comercial.
- Manejo de datos tabulares con valores faltantes mediante imputación automática.
- Escalado y codificación integrados en el pipeline, facilitando su uso con nuevos datos.
- Soporte para priorización de clientes en campañas de marketing y ventas.
- No incluye capacidades de procesamiento de texto, visión ni generación de lenguaje.

## Casos de uso
- Segmentación de clientes para campañas de email marketing: el modelo asigna una probabilidad de compra a cada cliente; los responsables de marketing pueden enviar ofertas personalizadas solo a aquellos con probabilidad superior a un umbral (por ejemplo, 0.7), reduciendo costes y aumentando la conversión.
- Priorización de llamadas de venta: los agentes comerciales reciben una lista ordenada por probabilidad de compra, optimizando su tiempo y mejorando la tasa de cierre.
- Optimización de presupuesto publicitario: el modelo permite dirigir anuncios en plataformas digitales hacia audiencias con alta propensión a comprar el paquete de bienestar, maximizando el retorno de inversión.
- Análisis de sensibilidad al precio: combinado con datos de ofertas anteriores, ayuda a identificar qué descuentos o incentivos son más efectivos para distintos segmentos.
- Detección de clientes de alto valor potencial: la probabilidad de compra puede cruzarse con el valor esperado de cada cliente para priorizar a aquellos que generen mayor ingresos.
- Monitorización de campañas en tiempo real: al integrarse en un dashboard, permite evaluar el impacto de cambios en la estrategia comercial y ajustar el umbral de decisión dinámicamente.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card reporta métricas de validación local, que se muestran a continuación:

| Metrica | Valor |
|---|---|
| Accuracy | 0.913 |
| Precision | 0.764 |
| Recall | 0.794 |
| F1 score | 0.778 |

Estos valores corresponden a un conjunto de prueba local y no han sido verificados de forma independiente. No se dispone de comparación con otros modelos en el mismo dataset.

## Requisitos de hardware
- Al ser un modelo XGBoost de tamaño reducido, la inferencia se ejecuta correctamente en CPU sin necesidad de GPU.
- Memoria RAM estimada: menos de 1 GB para cargar el modelo y los artefactos de preprocesamiento.
- GPU recomendada: ninguna, aunque puede acelerarse con GPUs si se integra en un pipeline de datos masivo, pero no es necesario.
- Es compatible con cualquier máquina virtual o contenedor ligero, incluidos entornos serverless.
- Opciones de despliegue: se puede servir mediante Flask/FastAPI, o integrarse en plataformas de ML como MLflow, Kubeflow o Sagemaker. Al ser un artefacto joblib, también puede cargarse en scripts de Python directamente.
- Latencia estimada: milisegundos por predicción en CPU (dependiendo del número de árboles y características).

## Comparativa con modelos similares
No se dispone de información suficiente para comparar este modelo con alternativas concretas. Existen otros repositorios en Hugging Face con nombres similares (por ejemplo, `rahulsuren/tourism-package-model` y `AiRemastered/tourism-package-model`), pero no se han publicado detalles de sus arquitecturas o rendimiento. En la literatura de clasificación tabular, modelos como Random Forest o Gradient Boosting (XGBoost, LightGBM) son alternativas habituales, pero sin datos del dataset no es posible establecer una comparación cuantitativa. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias
- El modelo está entrenado para un contexto específico (paquete de turismo de bienestar) y puede no generalizar a otros productos o mercados sin reentrenamiento.
- No se ha especificado la licencia; su uso comercial requiere verificar los términos de distribución del artefacto.
- No se han documentado los sesgos potenciales del dataset. Si los datos de entrenamiento contienen sesgos demográficos, el modelo podría perpetuar desigualdades en la segmentación de clientes.
- Las métricas reportadas provienen de validación local y no de una evaluación externa; el rendimiento en producción puede variar.
- La model card advierte explícitamente que el modelo debe apoyar decisiones humanas, no automatizar el tratamiento al cliente. Se recomienda supervisión y monitorización continua.
- No se indican los idiomas soportados ni si el dataset incluye variables textuales; probablemente es un modelo puramente numérico/categórico.
- El repositorio no contiene documentación sobre el dataset, el número de muestras ni las características exactas, lo que dificulta la auditoría y reproducibilidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/mazin903/tourism-package-model
- Repositorio GitHub con proyecto MLOps similar (no oficial del autor): https://github.com/abhishekiitd327/tourism-package-prediction
- Otros modelos con nombre similar en Hugging Face (sin información detallada): https://huggingface.co/rahulsuren/tourism-package-model y https://huggingface.co/AiRemastered/tourism-package-model
