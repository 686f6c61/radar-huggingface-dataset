# Mateplo/adult-income-classifier

## Resumen

Mateplo/adult-income-classifier es un modelo de clasificación tabular desarrollado por Mateplo como parte de un proyecto de MLOps. Su objetivo es predecir si el ingreso anual de una persona supera los 50 000 dólares a partir de variables demográficas y laborales, utilizando el conocido conjunto de datos Adult Census Income. El modelo no es un modelo de lenguaje: se trata de un pipeline de scikit-learn que combina preprocesamiento con un clasificador HistGradientBoosting (hgb), registrado en MLflow como versión 9 (champion) y exportado a ONNX para permitir inferencia en navegador.

El modelo destaca por su integración en un flujo de trabajo MLOps reproducible, con un umbral de decisión calibrado en 0.3809 y métricas de test publicadas. Aunque su tamaño es reducido y no requiere GPU, ofrece un rendimiento competitivo en la tarea de clasificación binaria de ingresos, con un ROC AUC de 0.9303. Es un ejemplo práctico de despliegue de modelos tabulares mediante FastAPI y ONNX, orientado a desarrolladores e investigadores que necesitan evaluar rápidamente un clasificador ligero y auditable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de scikit-learn con preprocesamiento y clasificador HistGradientBoosting (hgb) |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | model.joblib, model.onnx |

## Arquitectura y entrenamiento

El modelo se compone de un pipeline de scikit-learn que incluye transformaciones de preprocesamiento y un clasificador HistGradientBoosting. El preprocesamiento se encarga de codificar variables categóricas, imputar valores faltantes y escalar características numéricas, mientras que el clasificador hgb construye árboles de decisión de forma iterativa para resolver el problema de clasificación binaria. Según la model card, el modelo se entrenó con el conjunto de datos Adult Census Income, cuyo contenido se identifica por el nombre del modelo y las etiquetas de HuggingFace.

El entrenamiento se gestionó mediante MLflow, registrando el modelo como `AdultIncomeClassifier` en su versión 9, marcada como champion. El run_id asociado es `8eec64667ed14deb9f4adf0ad36c1b62`. El proceso de publicación se automatizó con el comando `make publish-model` desde el repositorio `mateplo/MLOps-project-M1`. No se menciona el uso de técnicas de ajuste fino como RLHF o DPO, ya que no es un modelo generativo. La innovación técnica principal reside en la exportación a ONNX, que permite ejecutar el modelo en el navegador mediante un Space estático, además de la integración con FastAPI para servir el modelo en producción.

## Capacidades

- Clasificación binaria de ingresos: predice si el ingreso anual supera los 50 000 dólares basándose en variables tabulares como edad, educación, ocupación, estado civil, etc.
- Generación de texto, razonamiento, código, matemáticas o visión: no disponible, al ser un modelo tabular.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible, el modelo opera sobre características numéricas y categóricas, no texto.
- Capacidades especiales: exportación a ONNX para inferencia en navegador; umbral de decisión configurable (0.3809); integración con MLflow para versionado y seguimiento de experimentos; pipeline reproducible mediante el registro de MLflow.

## Casos de uso

- Estudios sociodemográficos: investigadores en economía o sociología pueden usar el modelo para estimar la probabilidad de ingresos altos en encuestas de hogares, facilitando el análisis de desigualdad y movilidad social.
- Segmentación de clientes: empresas de servicios financieros pueden clasificar a sus clientes según su nivel de renta estimado para personalizar ofertas de productos, utilizando el umbral de decisión ajustado a sus necesidades.
- Detección de elegibilidad para programas sociales: administraciones públicas pueden aplicar el modelo para priorizar beneficiarios de ayudas económicas, aunque debe validarse con datos actuales para evitar sesgos temporales.
- Análisis de riesgo crediticio: entidades financieras pueden integrar el clasificador en sus pipelines de scoring para complementar modelos de riesgo, aprovechando su ligereza y facilidad de despliegue en CPU.
- Investigación en economía laboral: analistas pueden emplear el modelo para estudiar qué variables demográficas y ocupacionales influyen en la probabilidad de superar el umbral de ingresos, gracias a la interpretabilidad relativa de los árboles de decisión.
- Demo de MLOps: el proyecto sirve como ejemplo práctico de un flujo completo de MLOps, desde el registro en MLflow hasta el despliegue con FastAPI y la inferencia en navegador mediante ONNX, útil para formación y prototipado.

## Benchmarks y rendimiento

Las métricas publicadas en la model card corresponden a un conjunto de test reservado. No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

| Metrica | Valor |
|---|---|
| test_roc_auc | 0.9303 |
| test_average_precision | 0.8329 |
| test_brier | 0.0871 |
| test_accuracy | 0.8643 |
| test_precision | 0.6989 |
| test_recall | 0.7605 |
| test_f1 | 0.7284 |
| test_f1_at_0.5 | 0.7189 |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, el modelo está diseñado para ejecutarse en CPU.
- GPU recomendadas: ninguna; no se requiere aceleración gráfica.
- Compatibilidad con GPU de consumo: no aplica, al no usar GPU.
- Opciones de despliegue: FastAPI (servicio HTTP), ONNX en navegador (Space estático), MLflow (registro y versionado). No es compatible con vLLM, llama.cpp, Ollama o TGI por tratarse de un modelo sklearn.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de la misma categoría en la documentación proporcionada. Aunque podrían considerarse clasificadores tabulares como XGBoost o LightGBM, no se han publicado resultados comparativos que permitan una evaluación objetiva.

## Limitaciones y advertencias

- Sesgos conocidos: el conjunto de datos Adult Census Income procede de 1994 y puede reflejar sesgos demográficos, de género, raza y edad. El modelo puede perpetuar estos sesgos si se aplica a poblaciones actuales o distintas.
- Riesgo de alucinación: no aplica, al tratarse de un modelo de clasificación tabular y no generativo.
- Limitaciones de contexto o idioma: no aplica, el modelo no procesa texto ni requiere contexto.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificación y redistribución, sin restricciones significativas.
- Caveat para producción: el umbral de decisión está fijado en 0.3809, optimizado para F1. Si se cambia el umbral, las métricas de precisión y recall variarán. Además, el rendimiento puede degradarse fuera de la distribución de los datos de entrenamiento, por lo que se recomienda reentrenar con datos actualizados antes de su uso en entornos reales.

## Enlaces

- HuggingFace: https://huggingface.co/Mateplo/adult-income-classifier
- HuggingFace Space: https://huggingface.co/spaces/Mateplo/adult-income-classifier
- Repositorio GitHub del proyecto: https://github.com/mateplo/MLOps-project-M1
