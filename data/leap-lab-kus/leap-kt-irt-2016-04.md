# LEAP-LAB-KUS/leap-kt-irt-2016-04

## Resumen

El modelo `LEAP-LAB-KUS/leap-kt-irt-2016-04` es una implementación de un modelo de seguimiento del conocimiento (knowledge tracing) basado en la Teoría de Respuesta al Ítem (IRT, por sus siglas en inglés). Fue desarrollado por el grupo de investigación LEAP-LAB-KUS como parte del proyecto `leap-kt-toolkit`, una reimplementación sistemática de modelos publicados de knowledge tracing bajo un protocolo unificado. Su objetivo es predecir la probabilidad de que un estudiante responda correctamente a una pregunta en función de su habilidad latente y las características del ítem, un problema central en el ámbito de la minería de datos educativos y los sistemas de tutoría inteligente.

El modelo está entrenado y evaluado sobre el dataset ASSISTments 2017, un conjunto de datos ampliamente utilizado en la investigación educativa. La arquitectura subyacente no es una red neuronal profunda, sino un modelo estadístico clásico de IRT, lo que lo hace ligero, interpretable y adecuado para entornos con recursos computacionales limitados. Su relevancia actual radica en que sirve como línea base rigurosa y reproducible para comparar modelos más complejos de knowledge tracing, evitando las fugas de datos que suelen aparecer en otras reproducciones.

El repositorio incluye los pesos del modelo en formato safetensors, junto con las particiones exactas de los datos, las métricas por pliegue y los registros de entrenamiento, lo que garantiza la reproducibilidad completa de los experimentos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IRT (Item Response Theory) |
| Parametros totales | no disponible (modelo estadístico con parámetros por ítem y por habilidad) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no aplicable (no es un modelo de red neuronal) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la Teoría de Respuesta al Ítem (IRT) en su forma clásica, que modela la probabilidad de que un estudiante `i` responda correctamente al ítem `j` mediante una función logística de la diferencia entre la habilidad del estudiante (θ) y la dificultad del ítem (β). No se emplean redes neuronales ni mecanismos de atención; los parámetros del modelo son las habilidades de los estudiantes y las dificultades de los ítems, estimados mediante métodos de máxima verosimilitud o inferencia bayesiana. La fecha "2016-04" en el identificador sugiere que corresponde a la formulación de IRT publicada en abril de 2016, aunque no se detalla la variante exacta en la documentación.

El entrenamiento sigue un protocolo estandarizado: partición de usuarios 80/20 para entrenamiento y prueba, validación cruzada de 5 pliegues sobre la parte de entrenamiento, un pliegue reservado como validación, early stopping con paciencia de 10 épocas sobre el AUC de validación y un máximo de 200 épocas. El conjunto de datos utilizado es ASSISTments 2017. Una característica clave del protocolo es que las preguntas de concepto múltiple no se expanden en múltiples filas, evitando así la fuga de datos que ocurre en otras implementaciones cuando se muestra la respuesta de la misma pregunta antes de predecirla. Esto garantiza que cada interacción se puntúe exactamente una vez y que las métricas sean comparables entre modelos.

## Capacidades

- Predicción de la probabilidad de que un estudiante responda correctamente a un ítem dado, basada en la habilidad latente del estudiante y la dificultad del ítem.
- Estimación de la habilidad de cada estudiante a partir de sus respuestas históricas.
- Estimación de los parámetros de dificultad y discriminación de los ítems.
- Interpretabilidad directa: los parámetros del modelo tienen significado psicológico y educativo.
- Capacidad de entrenamiento rápido con recursos computacionales mínimos, al no requerir GPU para modelos de tamaño reducido.
- Reproducibilidad completa gracias al protocolo unificado y a la publicación de las particiones exactas y los registros de entrenamiento.
- Soporte para integración en pipelines de minería de datos educativos mediante el kit `leap-kt-toolkit`.

## Casos de uso

- **Sistemas de tutoría inteligente**: el modelo puede integrarse en plataformas educativas para estimar en tiempo real el nivel de conocimiento de cada estudiante y adaptar la dificultad de las preguntas siguientes.
- **Evaluación adaptativa informatizada (CAT)**: se puede usar para seleccionar dinámicamente los ítems más informativos según la habilidad estimada del estudiante, optimizando la longitud del test.
- **Análisis de calidad de ítems**: los parámetros de dificultad y discriminación estimados permiten identificar preguntas mal formuladas o con sesgos en los bancos de ítems.
- **Predicción del rendimiento académico**: la habilidad latente estimada puede servir como variable predictora en modelos de riesgo de abandono escolar o de resultados finales.
- **Investigación en psicometría**: sirve como línea base para comparar modelos de knowledge tracing más complejos (como DKT, DKVMN o Deep-IRT) bajo el mismo protocolo experimental.
- **Auditoría de modelos educativos**: al ser un modelo estadístico transparente, se puede usar para verificar la consistencia de los datos y detectar fugas de información en otras implementaciones.

## Benchmarks y rendimiento

El modelo se evalúa sobre el dataset ASSISTments 2017. Los resultados reportados en la documentación son los siguientes:

| Dataset | AUC | ACC | F1 |
|---|---|---|---|
| ASSISTments 2017 | 0.6998 ± 0.0015 | 0.6892 | 0.4810 |

La desviación estándar se reporta para el AUC, lo que indica la variabilidad entre los cinco pliegues de la validación cruzada. No se proporcionan resultados comparativos con otros modelos en la misma información, pero el protocolo unificado del kit `leap-kt` permite comparar directamente este modelo con otras implementaciones bajo las mismas condiciones. No se han publicado resultados de benchmarks en la información disponible más allá de estos valores.

## Requisitos de hardware

- El modelo es extremadamente ligero; los checkpoints ocupan menos de 1 GB (el repositorio indica un tamaño de 0.0 GB).
- Puede ejecutarse en una CPU convencional sin necesidad de GPU para entrenamiento o inferencia en datasets de tamaño moderado (como ASSISTments 2017).
- Para datasets muy grandes (millones de interacciones), se puede acelerar con una GPU de gama media (por ejemplo, NVIDIA RTX 3060 o superior) si se utiliza una implementación vectorizada.
- No se requieren configuraciones específicas de memoria VRAM; la inferencia es instantánea.
- El modelo se distribuye dentro del kit `leap-kt-toolkit`, que gestiona el entrenamiento, la evaluación y la exportación de resultados. No se menciona soporte para frameworks de inferencia como vLLM o llama.cpp, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de datos de comparación directa con otros modelos de knowledge tracing en la información proporcionada. Sin embargo, dentro del mismo kit `leap-kt-toolkit` se han publicado implementaciones de otros modelos, como `leap-kt-dynamickeyvaluememorynet-2016-11` (KVMN) y `leap-kt-deepirt-2019-04` (Deep-IRT). Estos modelos son arquitecturas de redes neuronales con mayor capacidad de representación y normalmente obtienen AUC superiores al IRT clásico en datasets como ASSISTments, aunque a costa de mayor complejidad computacional y menor interpretabilidad. La comparativa directa entre estos modelos dentro del mismo protocolo sería posible si se ejecutan bajo las mismas condiciones, pero no se proporcionan resultados comparativos en la información disponible.

## Limitaciones y advertencias

- **Sesgos inherentes**: el modelo IRT asume unidimensionalidad de la habilidad y no captura dependencias temporales entre respuestas (no modela el orden de las preguntas), lo que puede limitar su precisión en secuencias de aprendizaje dinámicas.
- **Riesgo de sobreajuste en ítems**: los parámetros de dificultad se estiman a partir de datos; si un ítem tiene pocas respuestas, su estimación puede ser inestable.
- **Fuga de datos**: el protocolo evita la fuga de datos en las preguntas de concepto múltiple, pero no se auditan otros posibles sesgos de muestreo en el dataset original.
- **Idioma y población**: el modelo se entrena con datos de ASSISTments 2017, un dataset en inglés y de un contexto educativo específico (estudiantes de secundaria en EE. UU.). Su transferencia a otros idiomas o poblaciones puede degradar el rendimiento.
- **Licencia MIT**: permite uso comercial y modificación, pero no incluye garantías de exactitud o idoneidad para aplicaciones críticas en producción.
- **Interpretación causal**: el modelo es correlacional; la habilidad latente estimada no implica una relación causal con el aprendizaje efectivo.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/LEAP-LAB-KUS/leap-kt-irt-2016-04
- Kit `leap-kt-toolkit` en GitHub: https://github.com/LEAP-LAB-KUS/leap-kt-toolkit
- Modelo relacionado `leap-kt-dynamickeyvaluememorynet-2016-11`: https://huggingface.co/LEAP-LAB-KUS/leap-kt-dynamickeyvaluememorynet-2016-11
- Modelo relacionado `leap-kt-deepirt-2019-04`: https://huggingface.co/LEAP-LAB-KUS/leap-kt-deepirt-2019-04
- Organización LEAP-LAB-KUS en GitHub: https://github.com/orgs/LEAP-LAB-KUS/repositories
