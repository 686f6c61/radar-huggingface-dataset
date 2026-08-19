# hiteshsharma/predictive-maintenance-model

## Resumen

El modelo `hiteshsharma/predictive-maintenance-model` es un clasificador de aprendizaje automático desarrollado por hiteshsharma como parte de un proyecto de mantenimiento predictivo. Su objetivo es predecir si un motor requiere mantenimiento a partir de datos de sensores, como revoluciones por minuto (RPM), presiones de aceite, combustible y refrigerante, así como temperaturas de aceite y refrigerante. Se trata de un modelo clásico de machine learning, concretamente un Random Forest Classifier, entrenado con el framework Scikit-Learn, y no de un modelo de lenguaje de gran tamaño (LLM).

La relevancia de este modelo radica en su aplicación práctica para anticipar fallos en motores, reduciendo tiempos de inactividad y costes de mantenimiento. El repositorio incluye dos archivos: `best_model.pkl` (el modelo entrenado) y `scaler.pkl` (el escalador de características). El tamaño total del repositorio es de 0,1 GB. Aunque la ficha técnica está orientada a modelos de IA generativa, aquí se adapta a este clasificador tabular, indicando los campos que no aplican.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest Classifier (Scikit-Learn) |
| Parametros totales | no disponible (número de árboles no especificado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, no procesa texto) |
| Tipos de cuantizacion | no aplica (modelo clásico, no requiere cuantización) |
| Idiomas soportados | no aplica (entrada numérica) |
| Licencia | MIT (según la model card) |
| Formato de pesos | Pickle (`best_model.pkl`, `scaler.pkl`) |

## Arquitectura y entrenamiento

El modelo emplea un Random Forest Classifier, un conjunto de árboles de decisión entrenados mediante bagging. Cada árbol se construye sobre una muestra bootstrap del conjunto de datos y utiliza una selección aleatoria de características en cada división, lo que reduce la varianza y mejora la generalización. El entrenamiento se realiza con datos tabulares de sensores del motor, aunque no se especifican el número de árboles, la profundidad máxima ni otros hiperparámetros.

No se dispone de información sobre el tamaño del dataset de entrenamiento, el número de muestras ni el proceso de validación. Tampoco se mencionan técnicas de ajuste de hiperparámetros ni métodos de regularización adicionales. El archivo `scaler.pkl` sugiere que las características se estandarizan antes de alimentar el modelo, probablemente mediante `StandardScaler` de Scikit-Learn.

## Capacidades

- Predicción binaria de estado del motor: 0 = saludable, 1 = requiere mantenimiento.
- Acepta seis características numéricas: RPM, presión de aceite lubricante, presión de combustible, presión de refrigerante, temperatura de aceite lubricante y temperatura de refrigerante.
- Inferencia rápida y ligera, adecuada para entornos con recursos limitados.
- No soporta generación de texto, razonamiento, código, visión ni tool calling, al ser un modelo tabular clásico.

## Casos de uso

- Mantenimiento predictivo en flotas de vehículos: integrar el modelo en un sistema de telemetría que recopile datos de sensores en tiempo real y genere alertas cuando se prediga una necesidad de mantenimiento, reduciendo paradas no planificadas.
- Monitorización de motores industriales: desplegar el modelo en un edge device (por ejemplo, una Raspberry Pi) para clasificar el estado de motores en plantas de fabricación, permitiendo intervenciones proactivas.
- Optimización de programas de mantenimiento: usar las predicciones para priorizar revisiones y sustituir el mantenimiento preventivo fijo por uno basado en el estado real del equipo.
- Análisis de datos históricos: aplicar el modelo a registros pasados de sensores para identificar patrones de degradación y mejorar futuros diseños de motores.
- Formación en ciencia de datos: servir como ejemplo didáctico de un pipeline completo de mantenimiento predictivo con Scikit-Learn, desde la estandarización hasta la evaluación.
- Integración en sistemas de gestión de activos: combinar las predicciones con un sistema CMMS (Computerized Maintenance Management System) para generar órdenes de trabajo automáticas cuando el modelo detecte un riesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona métricas como accuracy, precisión, recall, F1 y ROC-AUC, pero no incluye valores concretos. Por tanto, no es posible comparar cuantitativamente el rendimiento con otros modelos.

## Requisitos de hardware

- Inferencia en CPU: el modelo es un Random Forest de tamaño reducido (0,1 GB), por lo que puede ejecutarse en cualquier CPU moderna sin necesidad de GPU.
- Memoria RAM: estimada en menos de 1 GB para cargar el modelo y el escalador.
- GPU: no requerida.
- Despliegue: se puede servir mediante una API REST con Flask o FastAPI, o integrarse en un script de Python. No es compatible con frameworks de inferencia para LLM como vLLM u Ollama.
- Latencia: típicamente inferior a 1 milisegundo por predicción en CPU, dependiendo del número de árboles y de la profundidad.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el repositorio. Dado que se trata de un clasificador Random Forest para mantenimiento predictivo, alternativas comunes serían otros algoritmos como XGBoost, Gradient Boosting o redes neuronales densas, pero no se proporcionan datos de rendimiento para establecer una comparación objetiva.

## Limitaciones y advertencias

- La model card no incluye métricas finales de rendimiento, por lo que se desconoce la calidad real del modelo y su capacidad de generalización.
- El modelo se entrenó probablemente con un conjunto de datos específico de motores; su aplicación a otros tipos de motores o condiciones operativas puede degradar el rendimiento.
- Al ser un clasificador binario, no proporciona probabilidades calibradas por defecto; si se necesitan umbrales ajustables, habría que calibrar las salidas.
- La licencia MIT permite uso comercial y modificación, pero el autor no ofrece garantías sobre la precisión del modelo.
- No se especifica el proceso de limpieza de datos ni el tratamiento de valores atípicos, lo que puede afectar a la robustez en producción.
- El repositorio no incluye documentación sobre el dataset original ni su procedencia, dificultando la trazabilidad y la reproducibilidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/hiteshsharma/predictive-maintenance-model)
- No se proporcionan otros enlaces (paper, blog, repositorio de código) en la información disponible.
