# AmirMohseni/tfidf-logreg-v3-legal-guidance-prefix-seed42

## Resumen

El modelo `tfidf-logreg-v3-legal-guidance-prefix-seed42` es un clasificador de texto ligero desarrollado por Amir Mohseni que combina características TF-IDF (unigramas y bigramas de palabras, y n-gramas de caracteres de 3 a 5) con regresión logística. Su propósito es detectar si un prefijo acumulado de una conversación de usuario ya contiene orientación legal, actuando como un sistema de enrutamiento conversacional. Está pensado como un baseline de investigación, no como un sistema de asesoramiento legal.

El modelo se entrenó sobre el dataset `AmirMohseni/WildChat-Legal-Classification-V3-Hierarchical`, que contiene conversaciones reales de chat con anotaciones jerárquicas sobre la presencia de orientación legal. La tarea es binaria: dado un prefijo de conversación (la concatenación de los turnos del usuario hasta un punto dado), predecir si ya se ha proporcionado orientación legal. El modelo pondera cada prefijo por el inverso del número de turnos de usuario en la conversación, de modo que cada conversación tenga peso total 1.0 en el entrenamiento.

La relevancia actual de este modelo radica en su simplicidad y eficiencia: al ser un pipeline clásico de scikit-learn, se ejecuta en CPU sin necesidad de GPU, lo que lo hace adecuado para entornos con recursos limitados o como punto de comparación frente a modelos neuronales más grandes. Su licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF (word (1,2)-gram + char_wb (3,5)-gram) + regresión logística |
| Parametros totales | No disponible (modelo clásico, coeficientes de regresión; no se especifica el número) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (procesa prefijos de texto sin límite explícito, pero depende de la representación TF-IDF) |
| Tipos de cuantizacion | No aplica (modelo clásico, no requiere cuantización) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | joblib (scikit-learn) |

## Arquitectura y entrenamiento

El modelo utiliza un pipeline de scikit-learn que combina dos extractores de características TF-IDF: uno sobre n-gramas de palabras (1,2) y otro sobre n-gramas de caracteres dentro de palabras (`char_wb`) de 3 a 5. Estas características se concatenan y se alimentan a un clasificador de regresión logística con regularización L2. El hiperparámetro de regularización `C` se seleccionó mediante validación en un split de validación "silver" (anotaciones automáticas, no validadas por humanos), optimizando la macro-F1 ponderada por conversación. El umbral de probabilidad para la clasificación binaria también se ajustó en el mismo split, resultando en un valor de 0.42.

El entrenamiento se realizó sobre 1.632 conversaciones (4.865 prefijos) y la validación sobre 290 conversaciones (912 prefijos). Cada prefijo se etiqueta como negativo si ocurre antes del turno donde aparece la primera orientación legal (`first_guidance_user_turn_id`), y positivo a partir de ese turno inclusive. Los pesos de cada prefijo se escalan por el inverso del número de turnos de usuario en su conversación, de modo que cada conversación contribuya con peso total 1.0. No se aplicó RLHF ni DPO; es un entrenamiento supervisado estándar.

## Capacidades

- Clasificación binaria de prefijos de conversación: detecta si un prefijo acumulado de turnos de usuario ya contiene orientación legal.
- Procesamiento de texto en inglés, con robustez moderada a variaciones léxicas gracias a los n-gramas de caracteres.
- Enrutamiento conversacional: puede usarse para decidir cuándo derivar una conversación a un experto legal o a un sistema de respuesta automática.
- Ligereza computacional: inferencia en CPU con latencia de milisegundos, adecuada para integración en tiempo real.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un clasificador estático.
- No tiene capacidades multimodales (solo texto).

## Casos de uso

- Enrutamiento de conversaciones en plataformas de asistencia legal: el modelo puede analizar el historial acumulado del usuario y, cuando detecta que ya se ha proporcionado orientación legal, transferir la conversación a un agente humano o a un sistema de seguimiento.
- Filtrado de consultas en chatbots de servicios jurídicos: permite identificar si una consulta ya ha sido respondida con orientación legal, evitando respuestas duplicadas o contradictorias.
- Análisis de logs de chat para investigación: los investigadores pueden usar el modelo para etiquetar automáticamente grandes volúmenes de conversaciones y estudiar patrones de cuándo se ofrece orientación legal.
- Monitorización de calidad en sistemas de IA conversacional: al detectar la presencia de orientación legal en los prefijos, se puede auditar si el sistema cumple con políticas de derivación a expertos.
- Preprocesamiento para modelos generativos: el clasificador puede servir como un filtro previo para decidir qué conversaciones requieren un modelo de lenguaje grande y cuáles pueden resolverse con respuestas plantilla.
- Baseline de comparación en investigación: al ser un modelo clásico y reproducible, sirve como referencia para evaluar la mejora de modelos neuronales en la tarea de detección de orientación legal.

## Benchmarks y rendimiento

Los resultados de validación reportados en la model card (sobre el split de validación silver) son los siguientes:

| Evaluación | Macro-F1 | Positive F1 | AUPRC | Accuracy | Balanced accuracy |
|---|---:|---:|---:|---:|---:|
| Todos los prefijos, ponderados por conversación | 0.8600 | 0.8387 | 0.8850 | 0.8632 | 0.8664 |
| Todos los prefijos, sin ponderar | 0.8269 | 0.8079 | 0.8452 | 0.8289 | 0.8354 |
| Prefijos finales/completos | 0.8787 | 0.8699 | 0.9199 | 0.8793 | 0.8789 |
| Referencia mayoritaria, prefijos ponderados | 0.3740 | 0.0000 | 0.4026 | 0.5974 | 0.5000 |

Además, el análisis de onset (detección del turno exacto donde aparece la primera orientación legal) reporta una exactitud de onset de 0.7164 y una exactitud dentro de un turno de 0.8209. No se han publicado resultados en benchmarks estándar como MMLU o HumanEval, ya que no es un modelo generativo.

## Requisitos de hardware

- Inferencia en CPU: el modelo es extremadamente ligero (pipeline de TF-IDF + regresión logística), con un tamaño de artefacto de aproximadamente unos pocos megabytes (el repositorio indica 0.0 GB, probablemente menos de 1 MB).
- No requiere GPU: puede ejecutarse en cualquier máquina con Python y scikit-learn, incluso en entornos serverless o dispositivos de bajo consumo.
- Memoria RAM: menos de 100 MB para cargar el pipeline y procesar prefijos de texto.
- Opciones de despliegue: al ser un artefacto joblib, se puede integrar en servicios web con Flask/FastAPI, o en pipelines de procesamiento por lotes. No es compatible con vLLM, llama.cpp u Ollama,
