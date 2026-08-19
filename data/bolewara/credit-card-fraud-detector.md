# bolewara/credit-card-fraud-detector

## Resumen

El modelo `bolewara/credit-card-fraud-detector` es un clasificador binario basado en LightGBM desarrollado por Anuj Bolewar (usuario `anujbolewar` en Kaggle) para detectar transacciones fraudulentas con tarjetas de crédito. Está entrenado sobre el conjunto de datos clásico `mlg-ulb/creditcardfraud`, que contiene 284.807 transacciones anonimizadas con 29 características PCA (todas excepto la columna `Time`). El modelo produce una probabilidad de fraude en el rango [0,1] y maneja el fuerte desequilibrio de clases (tasa de fraude del 0,17 %) mediante pesos de clase.

Se trata de un modelo de aprendizaje automático tradicional (gradient boosting sobre árboles), no de un modelo de lenguaje o transformer. Su relevancia radica en que ofrece una solución ligera y eficiente para la detección de fraude en datos tabulares, con un rendimiento medido en AUC de 0,947 y una recall de fraude del 76,5 % a un umbral de 0,5. Está publicado bajo licencia MIT, lo que permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LightGBM (gradient boosting sobre árboles de decisión) |
| Parametros totales | no disponible (el modelo se distribuye como archivo joblib, sin desglose de parámetros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (formato nativo de LightGBM, sin cuantización) |
| Idiomas soportados | no disponible (modelo tabular, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | joblib (`fraud_model.joblib`) y `feature_names.npy` |

## Arquitectura y entrenamiento

LightGBM es una implementación eficiente de gradient boosting que construye árboles de decisión de forma secuencial, minimizando una función de pérdida mediante descenso de gradiente. En este caso, el modelo se entrena para clasificación binaria (fraude/no fraude) sobre las 29 características PCA anonimizadas del dataset `mlg-ulb/creditcardfraud`. El conjunto de datos contiene 284.807 filas y 31 columnas (incluyendo `Time`, `Class` y las 29 características). Se realizó una división estratificada 80/20 para entrenamiento y prueba.

Para abordar el fuerte desequilibrio entre clases (solo el 0,17 % de las transacciones son fraudulentas), se emplearon pesos de clase en la función de pérdida. No se menciona el uso de técnicas adicionales como SMOTE ni etapas de ajuste fino con RLHF o DPO, ya que se trata de un modelo supervisado clásico. El entrenamiento se documenta en un estudio de caso publicado en Kaggle titulado *Detecting Credit Card Fraud with Gradient Boosting: A LightGBM Case Study*.

## Capacidades

- Clasificación binaria de transacciones de tarjetas de crédito como fraudulentas o legítimas.
- Generación de probabilidad de fraude en el intervalo [0,1], lo que permite ajustar el umbral de decisión según el compromiso entre precisión y recall.
- Manejo de datos tabulares anonimizados con 29 características numéricas PCA.
- Entrenamiento específico para el desequilibrio de clases mediante pesos, lo que mejora la detección de la clase minoritaria.
- Inferencia rápida y ligera, adecuada para entornos con recursos limitados (CPU).
- No dispone de capacidades de procesamiento de lenguaje natural, visión, tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- Detección de fraude en tiempo real en pasarelas de pago: el modelo puede integrarse en un servicio de inferencia (por ejemplo, una API Flask) que reciba las características de una transacción y devuelva una probabilidad de fraude en milisegundos, permitiendo bloquear o revisar operaciones sospechosas antes de su aprobación.
- Scoring de riesgo para autorización de tarjetas: las entidades financieras pueden usar la probabilidad de fraude como una señal adicional en sus motores de decisión, combinándola con reglas tradicionales para establecer umbrales dinámicos.
- Análisis por lotes de transacciones históricas: el modelo puede aplicarse a conjuntos de datos almacenados para identificar patrones de fraude pasados, facilitando auditorías y ajustes de políticas.
- Alertas tempranas en banca móvil: al integrarse en aplicaciones de banca, puede generar notificaciones automáticas al usuario cuando una transacción supera un umbral de riesgo, reduciendo el impacto de cargos no autorizados.
- Evaluación de modelos en entornos de investigación: al ser un modelo ligero y con código abierto, sirve como punto de partida para comparar técnicas de detección de fraude o para estudiar el efecto del desequilibrio de clases en gradient boosting.
- Educación y prototipado: por su simplicidad y documentación, es útil para enseñar conceptos de clasificación desequilibrada, validación cruzada y métricas como AUC o Average Precision en cursos de ciencia de datos.

## Benchmarks y rendimiento

Según la model card, los resultados de evaluación sobre el conjunto de prueba (20 % del dataset) son:

| Metrica | Valor |
|---|---|
| AUC | 0,947 |
| Average Precision | 0,791 |
| Recall de fraude (umbral 0,5) | 76,5 % |

No se han publicado comparaciones con otros modelos en la información proporcionada. Estos valores se obtuvieron con el dataset `mlg-ulb/creditcardfraud` y la división estratificada 80/20 descrita.

## Requisitos de hardware

- El modelo es extremadamente ligero: al ser un conjunto de árboles de decisión, no requiere GPU ni VRAM. Puede ejecutarse en cualquier CPU moderna.
- Memoria RAM estimada: inferior a 100 MB para cargar el archivo `fraud_model.joblib` (tamaño del repositorio: 0.0 GB, aunque el archivo real no se especifica).
- GPUs recomendadas: no necesarias; el modelo se beneficia de CPUs multinúcleo para acelerar la inferencia en paralelo.
- Despliegue: puede servirse mediante frameworks como Flask o FastAPI, o integrarse en pipelines de procesamiento por lotes con bibliotecas estándar de Python (`joblib`, `pandas`).
- Latencia y throughput estimados: no disponibles en la información proporcionada, pero para un modelo de este tamaño se esperan tiempos de inferencia del orden de microsegundos por muestra en hardware moderno.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El dataset `mlg-ulb/creditcardfraud` es ampliamente utilizado en la literatura, y existen múltiples implementaciones de detección de fraude con Random Forest, XGBoost o redes neuronales, pero no se han incluido datos de comparación en la model card. Se recomienda consultar estudios como el publicado en Springer (*AI-based credit card fraud detection: a machine learning...*) para obtener referencias de rendimiento de otros enfoques.

## Limitaciones y advertencias

- El modelo se entrenó exclusivamente con características PCA anonimizadas del dataset `mlg-ulb/creditcardfraud`; su capacidad de generalización a otros conjuntos de datos o a transacciones reales con distribuciones diferentes es limitada y requiere reentrenamiento o calibración.
- La tasa de fraude en el dataset es muy baja (0,17 %), lo que puede inducir un sesgo hacia la clase mayoritaria; aunque se usaron pesos de clase, el recall de fraude (76,5 %) indica que aproximadamente un cuarto de los fraudes no se detectan al umbral 0,5.
- No se han documentado análisis de sesgos demográficos o geográficos; las características anonimizadas impiden auditar posibles discriminaciones indirectas.
- Al ser un modelo tabular, no es aplicable a datos no estructurados (texto, imágenes) ni a tareas de generación.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre el rendimiento en producción; es responsabilidad del usuario validar el modelo con sus propios datos.
- No se proporcionan detalles sobre la configuración de hiperparámetros de LightGBM (número de árboles, profundidad, learning rate), lo que dificulta la reproducibilidad exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bolewara/credit-card-fraud-detector
- Dataset utilizado: `mlg-ulb/creditcardfraud` (disponible en Hugging Face: https://huggingface.co/datasets/mlg-ulb/creditcardfraud)
- Estudio de caso del autor (publicado en Kaggle): *Detecting Credit Card Fraud with Gradient Boosting: A LightGBM Case Study* (enlace no disponible en la información proporcionada).
