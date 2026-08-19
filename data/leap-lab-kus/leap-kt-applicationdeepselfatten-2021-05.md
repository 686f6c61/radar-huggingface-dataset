# LEAP-LAB-KUS/leap-kt-applicationdeepselfatten-2021-05

## Resumen

APPLICATIONDEEPSELFATTEN es un modelo de knowledge tracing (seguimiento del conocimiento) desarrollado por LEAP-LAB-KUS, el grupo de investigación asociado al LEAP Lab de la Universidad de Tsinghua. Forma parte de leap-kt-toolkit, una reimplementación sistemática de modelos publicados de knowledge tracing bajo un protocolo unificado y auditable. El modelo predice la probabilidad de que un estudiante responda correctamente a una pregunta basándose en su historial de interacciones previas.

La arquitectura emplea mecanismos de autoatención profunda (deep self-attention) aplicados al dominio educativo, una adaptación de los principios transformer al problema de modelar el estado de conocimiento de un estudiante a lo largo del tiempo. El repositorio contiene checkpoints entrenados sobre tres conjuntos de datos educativos estándar (ASSIST2009, ASSIST2017 y DBE-KT22), con división de usuarios 80/20, validación cruzada de 5 pliegues y logs de entrenamiento por época.

Su relevancia radica en la rigurosidad metodológica: el protocolo evita fugas de datos comunes en otras implementaciones, como la expansión de preguntas multi-concepto en múltiples filas, que infla artificialmente el rendimiento. Esto lo convierte en un punto de referencia fiable para investigación en educational data mining.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ApplicationDeepSelfAtten (autoatención profunda para knowledge tracing) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de knowledge tracing, no generativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los datos son interacciones educativas, no texto en lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ApplicationDeepSelfAtten es un modelo de knowledge tracing basado en mecanismos de autoatención profunda, inspirado en la arquitectura transformer pero adaptado al dominio educativo. A diferencia de los modelos generativos, no produce texto: procesa secuencias de interacciones estudiante-pregunta y emite una probabilidad de acierto para la siguiente interacción. Las preguntas multi-concepto se tratan como un eje adicional de la interacción en lugar de expandirse en filas separadas, lo que evita una fuga de datos estructural presente en otras implementaciones.

El entrenamiento se realizó bajo el protocolo unificado de leap-kt-toolkit: división de usuarios 80/20 para entrenamiento y prueba, validación cruzada de 5 pliegues sobre la porción de entrenamiento, un pliegue reservado como validación, early stopping con paciencia de 10 épocas sobre el AUC de validación y un máximo de 200 épocas. Los conjuntos de datos utilizados son ASSIST2009, ASSIST2017 y DBE-KT22, tres referencias estándar en educational data mining. El modelo fue producido con leap-kt en el commit `e3a8dc3`.

## Capacidades

- Predicción de rendimiento estudiantil: estima la probabilidad de acierto en la siguiente pregunta dado el historial de interacciones del estudiante.
- Manejo de preguntas multi-concepto: los conceptos se modelan como un eje adicional de la interacción, no como filas extra, lo que garantiza que cada interacción se puntúa exactamente una vez.
- Reproducibilidad completa: incluye la división exacta de usuarios con checksum, logs de entrenamiento por época y configuración de cada ejecución.
- Evaluación con métricas estándar: AUC, precisión (ACC) y F1 sobre tres conjuntos de datos educativos.
- Auditoría de fugas de datos: el protocolo verifica disjunción de usuarios entre entrenamiento y prueba, ausencia de ventanas que crucen el límite de división y control de etiquetas permutadas que debe colapsar el AUC al azar.
- No es un modelo generativo: no genera texto, código ni respuestas conversacionales.

## Casos de uso

- Sistemas de tutoría inteligente: el modelo puede integrarse en plataformas de aprendizaje adaptativo para predecir qué conceptos domina cada estudiante y recomendar ejercicios personalizados en función de su historial de interacciones.
- Detección temprana de dificultades: al predecir la probabilidad de acierto en tiempo real, permite identificar a estudiantes en riesgo de quedarse atrás y activar intervenciones pedagógicas antes de que acumulen retraso.
- Evaluación de diseño curricular: analizando las predicciones del modelo sobre distintos conjuntos de preguntas, los diseñadores educativos pueden detectar qué conceptos presentan tasas de error anómalamente altas y revisar su secuenciación.
- Investigación en educational data mining: sirve como baseline reproducible para comparar nuevos modelos de knowledge tracing bajo el mismo protocolo, eliminando la variabilidad metodológica entre implementaciones.
- Optimización de secuencias de aprendizaje: el modelo puede usarse para seleccionar la siguiente pregunta que maximice el aprendizaje del estudiante, en un enfoque de secuenciación dinámica de contenidos.
- Auditoría y verificación de resultados publicados: al incluir la división exacta de datos, los logs por época y los checksums, permite replicar y verificar resultados de la literatura de knowledge tracing de forma independiente.

## Benchmarks y rendimiento

| Dataset | AUC | ACC | F1 |
|---|---|---|---|
| ASSIST2009 | 0.7273 ± 0.0034 | 0.6971 | 0.7740 |
| ASSIST2017 | 0.7044 ± 0.0012 | 0.6864 | 0.4486 |
| DBE-KT22 | 0.8042 ± 0.0007 | 0.7950 | 0.8737 |

La model card no incluye valores de referencia publicados para este modelo (la columna "published reference" está vacía en los tres datasets). La comparación con otras implementaciones puede diferir significativamente: por ejemplo, en ASSIST2009, las herramientas que expanden preguntas multi-concepto en filas separadas elevan el AUC de DKT de ~0.75 a ~0.89, lo que constituye una fuga de datos que este modelo evita estructuralmente.

## Requisitos de hardware

- Tamaño del repositorio: 0.2 GB, lo que indica un modelo de dimensiones modestas, muy inferior a cualquier LLM.
- Inferencia en CPU: suficiente para la mayoría de casos de uso, ya que el modelo procesa secuencias de interacciones educativas, no texto generativo.
- GPU: no necesaria para inferencia; para reentrenar desde cero, una GPU de gama media (RTX 3060 o superior) sería suficiente.
- Despliegue: se integra con el ecosistema Python de leap-kt-toolkit; no aplican opciones como vLLM, Ollama o TGI, específicas de modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

El modelo pertenece a la familia de reimplementaciones de leap-kt-toolkit, que incluye también DKT (KnowledgeTracingMachines, 2018) y LKT (2020). No se dispone de resultados comparativos entre ellos en la información proporcionada.

| Modelo | Arquitectura | Año | Datasets | Licencia |
|---|---|---|---|---|
| leap-kt-applicationdeepselfatten-2021-05 | Deep self-attention | 2021 | ASSIST2009, ASSIST2017, DBE-KT22 | MIT |
| leap-kt-knowledgetracingmachines-2018-11 | Knowledge Tracing Machines | 2018 | ASSIST2009 | MIT |
| leap-kt-lkt-2020-05 | LKT | 2020 | no disponible | MIT |

El AUC de 0.7273 en ASSIST2009 es inferior a los ~0.75 publicados originalmente para DKT, pero la model card explica que esta diferencia se debe a que las implementaciones originales expanden las preguntas multi-concepto, introduciendo una fuga de datos que infla artificialmente el rendimiento. La comparativa directa con otros modelos no es posible sin ejecutarlos bajo el mismo protocolo.

## Limitaciones y advertencias

- No es un modelo generativo: su única función es predecir la probabilidad de acierto en interacciones educativas; no puede producir texto, código ni mantener conversaciones.
- Generalización limitada: los resultados se basan en tres conjuntos de datos educativos específicos (ASSIST2009, ASSIST2017, DBE-KT22) y pueden no transferirse a otras plataformas, sistemas educativos o dominios de conocimiento.
- Sin valores de referencia publicados: la model card no incluye comparaciones con resultados de la literatura, lo que dificulta evaluar su rendimiento relativo frente a otras arquitecturas.
- Idiomas no especificados: no se indica qué idiomas soporta; los datos de ASSIST y DBE-KT22 provienen de plataformas educativas en inglés, pero no se confirma en la documentación.
- Sesgos potenciales: al entrenarse en datos de plataformas educativas concretas, el modelo puede reflejar sesgos en la selección de estudiantes, el diseño de preguntas y el contexto sociocultural de los datos.
- Predicciones incorrectas en datos poco representados: estudiantes o conceptos con pocas interacciones en el conjunto de entrenamiento pueden generar predicciones poco fiables.
- Sin métricas de calibración: la model card no reporta si las probabilidades de acierto están bien calibradas, lo que es relevante para su uso en sistemas de decisión pedagógica.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LEAP-LAB-KUS/leap-kt-applicationdeepselfatten-2021-05
- Organización GitHub: https://github.com/LEAP-LAB-KUS
- Repositorio leap-kt-toolkit: https://github.com/LEAP-LAB-KUS/leap-kt-toolkit
- Laboratorio LEAP (Tsinghua): https://www.leaplab.ai/
