# ethicalabs/Echo-DSRN-v0.1.4-Research-Intent-CLF

## Resumen

Echo-DSRN-v0.1.4-Research-Intent-CLF es un clasificador de intenciones de artículos científicos desarrollado por ethicalabs, que predice una de seis categorías a partir del título y el resumen de un paper: Methodology, Dataset, Review, Applied, Theoretical y Unclassifiable. Esta versión amplía el modelo anterior de cinco clases (v0.1.3) con una clase adicional de seguridad que detecta documentos corruptos, no académicos o no ingleses, mejorando la cobertura y la robustez en entornos de producción.

El modelo se basa en la arquitectura Echo-DSRN, una red recurrente híbrida diseñada para tareas estrechas y despliegue con recursos limitados. Con 98,3 millones de parámetros, es lo suficientemente pequeño para ejecutarse en CPU sin sacrificar rendimiento, y se ha ajustado finamente sobre un conjunto de datos colaborativo de 10.001 artículos anotados por consenso de múltiples jueces LLM y curados por humanos. La relevancia actual del modelo radica en su capacidad para automatizar el etiquetado de literatura científica en repositorios abiertos como OpenAIRE, facilitando tareas de revisión sistemática, análisis de tendencias y filtrado de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Echo-DSRN (híbrida recurrente, no transformer estándar) |
| Parametros totales | 98.267.142 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Echo-DSRN es una arquitectura recurrente híbrida, diseñada específicamente para tareas de clasificación y enrutamiento en entornos con restricciones de memoria y cómputo. A diferencia de los transformers densos, esta arquitectura prioriza la eficiencia en inferencia y un footprint de memoria reducido, lo que permite ejecutar el modelo en CPU sin penalizaciones significativas. El modelo base v0.1.3 (5 clases) se ha adaptado a v0.1.4 mediante un cambio de cabecera de clasificación de 5 a 6 salidas, manteniendo el cuerpo del modelo intacto.

El entrenamiento se realizó sobre el dataset `ethicalabs/Research-Intent-Collab`, que contiene 10.001 papers anotados por consenso de jueces LLM y curados manualmente. Se utilizó un esquema de AdamW diferencial (tasa de aprendizaje 2e-5 para el backbone y 2e-4 para la cabeza), batch size 16, 3 épocas (1.500 pasos), precisión bf16, programación de tasa de aprendizaje coseno con 5% de warmup y early stopping basado en la partición de validación oficial. La nueva clase `Unclassifiable` se incorporó para capturar papers que los jueces LLM consideran corruptos, no ingleses o no académicos, mejorando la precisión global del sistema.

## Capacidades

- Clasificación de artículos científicos en 6 categorías: Methodology, Dataset, Review, Applied, Theoretical y Unclassifiable.
- Procesamiento de entradas de texto plano (título + resumen) mediante una plantilla de chat automática aplicada por el pipeline.
- Detección de documentos no académicos o corruptos a través de la clase `Unclassifiable`, con alta precisión (91%).
- Inferencia eficiente en CPU: el modelo es lo suficientemente pequeño para ejecutarse sin GPU, según indica el autor.
- Integración con el ecosistema Hugging Face mediante `trust_remote_code` y el paquete `echo_dsrn`.
- Compatibilidad con pipelines de `text-classification` estándar de la librería `transformers`.

## Casos de uso

- Clasificación automática de papers en repositorios académicos: el modelo puede etiquetar miles de artículos en colecciones como OpenAIRE, permitiendo filtrar por tipo de contribución (metodología, dataset, revisión, etc.) sin intervención manual.
- Revisión sistemática de literatura: investigadores pueden procesar grandes volúmenes de abstracts para identificar rápidamente estudios metodológicos, aplicados o teóricos relevantes para su revisión, ahorrando horas de cribado.
- Control de calidad en bibliotecas digitales: la clase `Unclassifiable` permite detectar entradas corruptas, duplicadas o no académicas antes de que entren en índices públicos, mejorando la fiabilidad de los datos.
- Análisis de tendencias en investigación: agregando las predicciones sobre un corpus temporal, se pueden visualizar la evolución de las áreas metodológicas, aplicadas o teóricas en un campo concreto.
- Sistemas de recomendación de papers: combinando la etiqueta de intención con otros metadatos, se pueden sugerir artículos afines a los intereses de un usuario, por ejemplo priorizando papers de tipo `Applied` para ingenieros.
- Integración en pipelines de procesamiento de documentos: el modelo puede actuar como un primer filtro en flujos de extracción de conocimiento, clasificando cada documento antes de pasarlo a etapas posteriores como resumen o extracción de entidades.

## Benchmarks y rendimiento

Resultados sobre la partición de test oficial (1.001 filas):

| Label | Precision | Recall | F1 | Support |
|---|---|---|---|---|
| Methodology | 0.8140 | 0.7883 | 0.8009 | 222 |
| Dataset | 0.7097 | 1.0000 | 0.8302 | 22 |
| Review | 0.6400 | 0.5845 | 0.6110 | 219 |
| Applied | 0.7162 | 0.8112 | 0.7608 | 392 |
| Theoretical | 0.7333 | 0.7500 | 0.7416 | 44 |
| Unclassifiable | 0.9091 | 0.5882 | 0.7143 | 102 |
| **Macro avg** | 0.7537 | 0.7537 | **0.7431** | 1001 |

Accuracy global: **0.7353** (736/1001).

Comparación con la versión anterior v0.1.3 (5 clases, evaluada sobre 899 filas):

| Metric | v0.1.3 (5-class) | v0.1.4 (6-class) |
|---|---|---|
| Accuracy, todas las filas evaluadas | 0.7197 (647/899) | **0.7353** (736/1001) |
| Accuracy, subconjunto 5 clases | 0.7197 (647/899) | **0.7519** (676/899) |
| Macro F1, subconjunto 5 clases | 0.7328 | **0.7489** |
| Macro F1, todas las 6 clases | — | **0.7431** |
| Unclassifiable | — (las 102 filas mal clasificadas) | F1 0.7143 (P 0.909) |

La clase `Review` sigue siendo la más débil, confundida principalmente con `Applied`.

## Requisitos de hardware

- El modelo tiene 98,3 millones de parámetros, lo que supone aproximadamente 393 MB en fp32, 196 MB en bf16 y unos 98 MB en int8 (estimación orientativa; no se han publicado cuantizaciones oficiales).
- El autor recomienda ejecutar la inferencia en CPU: "CPU load + inference is faster than GPU for this size". No se requiere GPU para uso práctico.
- Puede desplegarse en hardware de bajo consumo, como Raspberry Pi o instancias cloud de tipo CPU-only.
- Opciones de despliegue: pipeline de `transformers` con `trust_remote_code=True` y el paquete `echo_dsrn`; también es compatible con vLLM (según tags), aunque para este tamaño no aporta ventajas significativas.
- No se han publicado datos de latencia o throughput específicos, pero al ser un modelo pequeño se espera una inferencia en milisegundos por ejemplo en CPU moderna.

## Comparativa con modelos similares

La comparación directa con otros clasificadores de intención de papers no está disponible en la información proporcionada. No obstante, se puede comparar con su predecesor v0.1.3:

| Modelo | Parámetros | Clases | Accuracy (test) | Macro F1 | Licencia |
|---|---|---|---|---|---|
| Echo-DSRN-v0.1.3-Research-Intent-CLF | 98,3M | 5 | 0.7197 | 0.7328 | cc-by-4.0 |
| **Echo-DSRN-v0.1.4-Research-Intent-CLF** | 98,3M | 6 | **0.7353** | **0.7431** | cc-by-4.0 |

No se dispone de datos de otros modelos comparables (p. ej., SciBERT o clasificadores basados en transformers) en la información recopilada.

## Limitaciones y advertencias

- El modelo solo soporta el idioma inglés; los papers en otros idiomas se clasificarán probablemente como `Unclassifiable` o se asignarán a una clase incorrecta.
- La clase `Review` tiene el F1 más bajo (0.6110) y se confunde frecuentemente con `Applied`, lo que puede afectar a análisis que dependan de una separación precisa entre ambos tipos.
- La clase `Unclassifiable` tiene una precisión alta (0.909) pero un recall moderado (0.588), por lo que algunos documentos corruptos pueden escapar a la detección.
- El modelo se ha entrenado con un dataset colaborativo anotado por consenso de LLM y curado por humanos; puede heredar sesgos de los jueces o de la selección de papers original.
- La licencia es CC-BY-4.0, que permite uso comercial y modificación siempre que se atribuya adecuadamente; no impone restricciones de copyleft, pero se recomienda revisar los términos completos.
- No se han publicado detalles sobre la longitud máxima de entrada ni sobre el comportamiento con abstracts muy largos; se recomienda truncar o resumir antes de la clasificación.
- El uso en producción requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; se debe auditar el código antes de desplegarlo en entornos críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ethicalabs/Echo-DSRN-v0.1.4-Research-Intent-CLF
- Repositorio GitHub de Echo-DSRN: https://github.com/ethicalabs-ai/Echo-DSRN/
- Repositorio del evaluador OpenAIRE: https://github.com/ethicalabs-ai/OpenAIRE-AI-Research-Evaluator
- Demo en vivo: https://openaire-2026.ethicalabs.ai/
- Página de investigación de Echo-DSRN: https://www.ethicalabs.ai/research/echo-dsrn/
- Dataset de entrenamiento: https://huggingface.co/datasets/ethicalabs/Research-Intent-Collab
- Modelo base v0.1.3: https://huggingface.co/ethicalabs/Echo-DSRN-v0.1.3-Research-Intent-CLF
