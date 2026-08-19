# aigovdev/governance-risk-classifier

## Resumen

El modelo `aigovdev/governance-risk-classifier` es un clasificador tabular experimental desarrollado por AIGovDev, un proyecto dedicado a la infraestructura para sistemas de IA transparentes y auditables. Su propósito es clasificar escenarios sintéticos de gobernanza de IA en tres niveles aproximados de riesgo técnico: `lower`, `high` y `unacceptable`. Se trata de un baseline sencillo basado en regresión logística, no de un modelo de lenguaje, y está pensado como demostración educativa y de prototipado dentro del portfolio de ingeniería de gobernanza de IA.

El modelo se entrena sobre el dataset `aigovdev/ai-governance-scenarios`, que contiene únicamente 12 escenarios construidos manualmente. La arquitectura consiste en un pipeline de scikit-learn con preprocesamiento de variables categóricas, codificación one-hot y regresión logística con pesos de clase balanceados. Aunque los resultados de validación cruzada son perfectos (accuracy 1.0), el autor advierte explícitamente que esto no implica generalización ni validez en entornos reales, y que el modelo no debe utilizarse como clasificador de cumplimiento legal ni como motor de decisión en producción.

La relevancia de esta ficha radica en que ilustra un caso de uso típico en el ámbito de la gobernanza de IA: la clasificación preliminar de riesgos basada en características de diseño y supervisión. Sin embargo, su utilidad práctica es limitada debido al tamaño reducido y la naturaleza sintética de los datos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: preprocesamiento categórico + one-hot encoding + regresión logística con pesos balanceados |
| Parametros totales | No disponible (modelo de regresión logística, el número exacto de coeficientes depende del número de categorías tras el one-hot) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo tabular, no procesa texto secuencial) |
| Tipos de cuantizacion | No disponible (formato joblib, no requiere cuantización) |
| Idiomas soportados | No disponible (las características son categóricas, no hay procesamiento de lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | `model.joblib` (formato joblib de scikit-learn) |

## Arquitectura y entrenamiento

El modelo sigue un enfoque clásico de aprendizaje automático supervisado para datos tabulares. El pipeline consta de tres etapas: preprocesamiento de variables categóricas (posiblemente imputación o codificación ordinal), codificación one-hot de las características y un clasificador de regresión logística con pesos de clase balanceados para compensar el desequilibrio entre clases. Las características de entrada incluyen sector, impacto, autonomía de decisión, supervisión humana, monitorización post-despliegue, trazabilidad y documentación técnica.

El entrenamiento se realiza sobre el dataset `aigovdev/ai-governance-scenarios`, que contiene 12 escenarios sintéticos: 6 etiquetados como `lower`, 3 como `high` y 3 como `unacceptable`. Las etiquetas originales de gobernanza (low, limited, high, unacceptable) se mapean a tres niveles: `lower`, `high` y `unacceptable`. El autor indica que estas etiquetas son anotaciones de ingeniería y no clasificaciones legales. No se menciona el uso de técnicas como RLHF o DPO, ya que no es un modelo generativo. La evaluación se realiza mediante validación cruzada estratificada de 3 pliegues, con resultados perfectos que el propio autor advierte que deben interpretarse con extrema cautela debido al tamaño mínimo del conjunto de datos.

## Capacidades

- Clasificación de escenarios de gobernanza de IA en tres niveles de riesgo técnico: `lower`, `high` y `unacceptable`.
- Acepta características categóricas como sector, impacto, autonomía de decisión, supervisión humana, monitorización, trazabilidad y documentación técnica.
- Proporciona probabilidades de clase para cada nivel de riesgo, aunque no calibradas.
- Incluye un script de inferencia (`inference.py`) que permite realizar predicciones locales a partir de un JSON con las características.
- Reproducibilidad: el repositorio contiene el script de entrenamiento (`src/train.py`) que descarga el dataset directamente desde Hugging Face y reproduce el pipeline y la evaluación.
- No soporta procesamiento de lenguaje natural, visión, tool calling ni capacidades de agente.

## Casos de uso

- Prototipado de pipelines de gobernanza de IA: el modelo sirve como ejemplo de cómo construir un clasificador de riesgo técnico con scikit-learn, útil para desarrolladores que quieran explorar el diseño de sistemas de gobernanza automatizada.
- Experimentación educativa: en cursos o talleres sobre IA responsable, puede utilizarse para demostrar el flujo completo de entrenamiento, evaluación e inferencia de un modelo de clasificación tabular.
- Demostración de ingeniería de características: permite probar diferentes combinaciones de variables de gobernanza (supervisión, monitorización, trazabilidad) y observar su impacto en la clasificación de riesgo.
- Prueba de concepto para integración en dashboards: dado que es un modelo ligero, puede integrarse en prototipos de paneles de control de riesgo de IA para visualizar cómo cambian las predicciones con distintas configuraciones de entrada.
- Validación de metodologías de evaluación: el repositorio incluye métricas y matriz de confusión, lo que permite estudiar cómo interpretar resultados de validación cruzada en datasets muy pequeños.
- Portfolio de investigación: sirve como pieza demostrativa para investigadores que trabajan en gobernanza de IA y necesitan un baseline reproducible para comparar futuros modelos.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados de validación cruzada estratificada de 3 pliegues sobre el dataset de 12 escenarios:

| Metrica | Score |
| --- | ---: |
| Accuracy | 1.000 |
| Precision macro | 1.000 |
| Recall macro | 1.000 |
| F1 macro | 1.000 |

Matriz de confusión:

| | lower | high | unacceptable |
| --- | ---: | ---: | ---: |
| lower | 6 | 0 | 0 |
| high | 0 | 3 | 0 |
| unacceptable | 0 | 0 | 3 |

Estos resultados deben interpretarse con extrema cautela. El dataset contiene solo 12 ejemplos sintéticos, y el rendimiento perfecto es evidencia de que las características son fácilmente separables dentro de este conjunto de juguete. No se ha publicado ninguna comparación con otros modelos ni benchmarks externos. No se dispone de datos de rendimiento en conjuntos de datos reales.

## Requisitos de hardware

- Al ser un modelo de regresión logística sobre un conjunto de características categóricas muy reducido, los requisitos de hardware son mínimos.
- Se ejecuta en CPU sin necesidad de GPU. Cualquier ordenador moderno puede realizar la inferencia en milisegundos.
- La memoria RAM necesaria es inferior a 100 MB, ya que el modelo es un archivo joblib de tamaño muy pequeño (el repositorio indica 0.0 GB, aunque el tamaño real puede ser de unos pocos kilobytes).
- No requiere cuantización ni despliegue especializado. Puede ejecutarse directamente con scikit-learn en cualquier entorno Python.
- Para integración en producción, se podría servir mediante un contenedor ligero o una API REST, aunque el autor desaconseja su uso en producción.

## Comparativa con modelos similares

No se han publicado comparaciones con otros modelos de clasificación de riesgo de gobernanza de IA. Dado que se trata de un modelo experimental de juguete, no existen alternativas equivalentes en el mismo dominio con las que compararlo. En el ámbito de clasificación tabular genérica, se podría comparar con otros algoritmos de scikit-learn (por ejemplo, Random Forest o Gradient Boosting), pero no hay datos de rendimiento de esos modelos sobre el mismo dataset. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Conjunto de datos extremadamente pequeño (12 escenarios sintéticos), lo que impide cualquier generalización a casos reales.
- Las etiquetas son anotaciones de ingeniería, no clasificaciones legales. El modelo no debe interpretarse como un sistema de determinación de cumplimiento con el EU AI Act ni con ninguna otra regulación.
- No es apto para su uso en producción, como motor de decisión de gobernanza, ni como sustituto de evaluaciones de riesgo legales o técnicas.
- Las probabilidades devueltas por el modelo no están calibradas y no deben interpretarse como probabilidades de riesgo legal o del mundo real.
- No hay validación externa ni análisis de calibración.
- Las dimensiones de gobernanza consideradas son simplificadas y no cubren todos los aspectos relevantes de un sistema de IA.
- No se han documentado sesgos específicos, pero al estar entrenado con datos sintéticos, no refleja la diversidad de escenarios reales.
- El modelo está en formato joblib, lo que limita su uso a entornos con scikit-learn instalado (aunque es fácilmente portable).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aigovdev/governance-risk-classifier
- Dataset de entrenamiento: https://huggingface.co/datasets/aigovdev/ai-governance-scenarios
- Sitio web del proyecto AIGovDev: https://govbase.dev
