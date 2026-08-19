# MonikaDvorackova/llm-response-quality-classifier

## Resumen

El modelo `MonikaDvorackova/llm-response-quality-classifier` es un clasificador de texto ligero, basado en scikit-learn, que etiqueta respuestas generadas por modelos de lenguaje como `strong` (sólida) o `weak` (débil). Lo desarrolla MonikaDvorackova como una demostración educativa de un flujo completo de machine learning: desde el dataset hasta la inferencia, pasando por extracción de características, entrenamiento, validación cruzada y serialización del artefacto. No es un modelo generativo ni un evaluador de calidad de producción, sino una herramienta experimental para prototipar pipelines de evaluación de respuestas LLM.

El clasificador combina características TF-IDF (unigramas y bigramas) con regresión logística con pesos de clase balanceados. El texto de entrada es la concatenación del prompt y la respuesta. Se entrenó sobre un dataset sintético de 200 ejemplos (100 `strong` y 100 `weak`) distribuidos en 10 dominios técnicos como gobernanza de IA, RAG, MLOps, seguridad de IA, entre otros. Su relevancia actual radica en servir como baseline determinista y de bajo coste frente a métodos más sofisticados como LLM-as-a-judge, y en ilustrar buenas prácticas de evaluación (validación cruzada agrupada frente a aleatoria).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF + regresión logística (scikit-learn) |
| Parametros totales | no disponible (modelo pequeño, no se reporta) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador no generativo) |
| Tipos de cuantizacion | no aplica (modelo clásico, no requiere cuantización) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | joblib (`model.joblib`) |

## Arquitectura y entrenamiento

El modelo es un pipeline de scikit-learn compuesto por un vectorizador TF-IDF y un clasificador de regresión logística. El vectorizador utiliza ngramas de 1 y 2 palabras, convierte a minúsculas, filtra términos con frecuencia de documento mínima de 2 y máxima de 0.95, y aplica `sublinear_tf` para suavizar la frecuencia de términos. La regresión logística se entrena con `max_iter=2000`, `class_weight="balanced"` (para compensar el balance 50/50 del dataset) y `random_state=42`. La entrada al modelo es el texto formateado como `"PROMPT: {prompt}\nRESPONSE: {response}"`.

El entrenamiento se realizó sobre el dataset público `MonikaDvorackova/llm-response-evaluation-examples`, que contiene 200 ejemplos sintéticos diseñados manualmente, distribuidos en 10 dominios técnicos. No se emplearon técnicas de RLHF ni DPO; es un aprendizaje supervisado clásico. La evaluación principal se hizo con validación cruzada de 5 pliegues agrupada por dominio, lo que obliga al modelo a clasificar ejemplos de dominios no vistos durante el entrenamiento, una estrategia más realista que la división aleatoria.

## Capacidades

- Clasificación binaria de respuestas LLM en dos categorías: `strong` y `weak`.
- Entrada combinada de prompt y respuesta, lo que permite al modelo considerar el contexto de la pregunta.
- Funciona como un clasificador determinista y reproducible, sin necesidad de GPU ni infraestructura de inferencia avanzada.
- Soporta predicción de probabilidades por clase mediante `predict_proba`.
- Útil como baseline para comparar con evaluadores basados en LLM (LLM-as-a-judge) o clasificadores transformer.
- No es generativo: no produce texto, no admite tool calling, ni agentes, ni razonamiento multi-paso.
- Limitado al idioma inglés, tanto en entrenamiento como en inferencia.

## Casos de uso

- Prototipado de pipelines de evaluación de calidad de respuestas LLM: el modelo puede integrarse en un flujo de prueba de concepto para clasificar rápidamente respuestas sintéticas antes de implementar evaluadores más complejos.
- Demostración educativa de un flujo completo de ML: desde el dataset hasta el despliegue, sirve para enseñar extracción de características, validación cruzada y serialización de modelos.
- Baseline determinista en experimentos de evaluación: al ser barato y reproducible, permite comparar el rendimiento de métodos avanzados (como LLM-as-a-judge) frente a un clasificador clásico.
- Pruebas de integración en entornos de CI/CD: su tamaño reducido y su dependencia solo de `scikit-learn` y `joblib` lo hacen adecuado para tests automatizados de calidad de respuestas en repositorios de código.
- Experimentación con datos sintéticos de evaluación: los investigadores pueden usarlo para explorar cómo los patrones léxicos influyen en la clasificación de calidad, sin necesidad de recursos computacionales elevados.
- Validación de hipótesis sobre la influencia del dominio en la generalización: la validación cruzada agrupada por dominio permite estudiar si el modelo generaliza a áreas temáticas no vistas.

## Benchmarks y rendimiento

La model card reporta dos evaluaciones con validación cruzada de 5 pliegues:

### Validación cruzada aleatoria estratificada

| Metrica | Puntuacion |
| --- | ---: |
| Accuracy | 1.000 |
| Macro F1 | 1.000 |
| Weighted F1 | 1.000 |

Estos resultados se consideran optimistas porque el dataset sintético contiene patrones lingüísticos recurrentes y ejemplos estructuralmente similares que pueden aparecer en pliegues de entrenamiento y validación.

### Validación cruzada agrupada por dominio

| Metrica | Puntuacion |
| --- | ---: |
| Accuracy | 0.970 |
| Precision macro | 0.972 |
| Recall macro | 0.970 |
| Macro F1 | 0.970 |

Desglose por clase:

| Clase | Precision | Recall | F1 | Soporte |
| --- | ---: | ---: | ---: | ---: |
| strong | 1.000 | 0.940 | 0.969 | 100 |
| weak | 0.943 | 1.000 | 0.971 | 100 |

Matriz de confusión:

|  | Predicho strong | Predicho weak |
| --- | ---: | ---: |
| Real strong | 94 | 6 |
| Real weak | 0 | 100 |

La evaluación agrupada es más informativa, pero solo demuestra generalización sobre los dominios sintéticos representados; no hay evidencia de rendimiento sobre tráfico real de LLM.

## Requisitos de hardware

- El modelo es extremadamente ligero: un pipeline TF-IDF + regresión logística con un vocabulario limitado (200 ejemplos de entrenamiento).
- Inferencia en CPU: cualquier procesador moderno puede ejecutar predicciones en milisegundos.
- RAM: menos de 100 MB para cargar el modelo y vectorizador.
- No requiere GPU ni aceleración hardware.
- Despliegue: se puede integrar en cualquier entorno Python con `scikit-learn` y `joblib` instalados. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia: despreciable para uso interactivo; throughput de miles de predicciones por segundo en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (clasificadores clásicos de calidad de respuestas LLM). No hay datos públicos de otros modelos con el mismo propósito y arquitectura. Se podría comparar con clasificadores basados en transformers (p. ej., fine-tuning de BERT) o con LLM-as-a-judge, pero no se dispone de métricas equivalentes en la información proporcionada. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El dataset de entrenamiento es pequeño (200 ejemplos) y completamente sintético, diseñado manualmente. No representa tráfico real de LLM.
- El modelo puede aprender patrones estilísticos o léxicos de la construcción de los ejemplos, en lugar de conceptos generales de calidad.
- Las etiquetas `strong` y `weak` son anotaciones experimentales simplificadas; no capturan matices de calidad.
- El modelo no determina veracidad factual, alucinaciones, seguridad, cumplimiento normativo, sesgos, daño potencial ni calidad general de un LLM.
- Una probabilidad alta de clase no debe interpretarse como una probabilidad calibrada de que la respuesta sea objetivamente buena o correcta.
- Los resultados de evaluación no deben extrapolarse a producción.
- Solo soporta inglés; no hay soporte multilingüe.
- No es un modelo generativo: no puede producir texto ni realizar tareas de razonamiento.
- Licencia Apache 2.0 permite uso comercial, pero con las limitaciones funcionales descritas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MonikaDvorackova/llm-response-quality-classifier
- Dataset de entrenamiento: https://huggingface.co/datasets/MonikaDvorackova/llm-response-evaluation-examples
- Repositorio de código (referenciado en la model card, contiene `train.py` y `model.joblib`): no se proporciona URL directa en la información disponible.
