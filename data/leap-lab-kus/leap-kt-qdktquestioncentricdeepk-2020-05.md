# LEAP-LAB-KUS/leap-kt-qdktquestioncentricdeepk-2020-05

## Resumen

El modelo `leap-kt-qdktquestioncentricdeepk-2020-05` es un checkpoint de knowledge tracing (seguimiento del conocimiento) desarrollado por el LEAP Lab de la Universidad de Tsinghua. Forma parte del proyecto `leap-kt-toolkit`, una reimplementación sistemática de modelos publicados de knowledge tracing bajo un protocolo unificado. Este modelo concreto implementa la variante QDKT (Question-centric Deep Knowledge Tracing) con un enfoque centrado en la pregunta, y ha sido entrenado y evaluado sobre el conjunto de datos ASSIST2017.

El objetivo del modelo es predecir la probabilidad de que un estudiante responda correctamente a una pregunta en función de su historial de interacciones previas. Es relevante para el ámbito de la educación personalizada y los sistemas de tutoría inteligente, ya que permite modelar la evolución del conocimiento de cada alumno a lo largo del tiempo. El repositorio incluye todos los pliegues de validación cruzada, los registros de entrenamiento por época y la división exacta de usuarios, lo que facilita la reproducibilidad.

Aunque se trata de un modelo pequeño (0.3 GB) y sin capacidades generativas, su valor radica en la rigurosidad del protocolo experimental y en la ausencia de fugas de datos (data leakage), un problema común en otras implementaciones de knowledge tracing.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | QDKT (Question-centric Deep Knowledge Tracing) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo procesa secuencias de interacciones, pero no se especifica la longitud máxima) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (el modelo opera sobre interacciones educativas, no sobre lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura QDKT, que se centra en la pregunta como unidad principal de procesamiento. A diferencia de otros enfoques que expanden preguntas multi-concepto en múltiples filas (lo que introduce fugas de datos), QDKT trata los conceptos como un eje adicional en la interacción, evitando que el modelo vea la respuesta antes de predecirla. Esta decisión de diseño es clave para obtener métricas fiables.

El entrenamiento se realizó sobre el conjunto de datos ASSIST2017, con una división de usuarios 80/20 para entrenamiento/prueba, validación cruzada de 5 pliegues sobre la parte de entrenamiento, y un pliegue retenido como validación. Se aplicó early stopping con paciencia de 10 épocas basado en el AUC de validación, con un máximo de 200 épocas. No se especifica el número total de tokens ni la composición del dataset, pero el protocolo garantiza que no hay solapamiento de usuarios entre entrenamiento y prueba.

No se menciona el uso de técnicas como RLHF o DPO, ya que no es un modelo generativo. La innovación principal es el protocolo de evaluación sin fugas, que permite comparar resultados de manera justa con otras implementaciones.

## Capacidades

- Predicción de la probabilidad de respuesta correcta de un estudiante en una pregunta dada, basándose en su historial de interacciones.
- Modelado dinámico del conocimiento del estudiante a lo largo del tiempo (knowledge tracing).
- Manejo de preguntas multi-concepto sin expandirlas en filas separadas, evitando fugas temporales.
- Evaluación mediante AUC, precisión y F1, con métricas por pliegue y desviación estándar.
- Reproducibilidad total: incluye la división de usuarios, los registros de entrenamiento y la configuración exacta de cada ejecución.

## Casos de uso

- Sistemas de tutoría inteligente: el modelo puede integrarse en plataformas educativas para predecir en tiempo real si un alumno va a responder correctamente la siguiente pregunta, permitiendo adaptar la dificultad o el contenido.
- Detección de conceptos no dominados: al analizar las predicciones a lo largo del tiempo, se pueden identificar los conceptos en los que un estudiante tiene más probabilidad de fallar, guiando la recomendación de ejercicios de refuerzo.
- Evaluación de intervenciones educativas: los investigadores pueden utilizar el modelo para medir el impacto de un cambio pedagógico comparando el AUC antes y después de la intervención, gracias al protocolo estandarizado.
- Generación de informes de progreso para docentes: a partir de las predicciones agregadas, se pueden crear visualizaciones del avance de cada estudiante, ayudando a personalizar la enseñanza.
- Benchmarking de modelos de knowledge tracing: al ser parte de un toolkit con protocolo unificado, sirve como referencia fiable para comparar nuevas arquitecturas sin los sesgos de implementaciones dispares.
- Investigación en minería de datos educativos: el modelo y sus datos asociados permiten estudiar la dinámica del aprendizaje y validar hipótesis sobre el efecto de la frecuencia de práctica o la dificultad de las preguntas.

## Benchmarks y rendimiento

El modelo fue evaluado en el conjunto de datos ASSIST2017. La siguiente tabla resume los resultados reportados:

| Dataset | AUC | ACC | F1 | Referencia publicada |
|---|---|---|---|---|
| ASSIST2017 | 0.7619 ± 0.0012 | 0.7095 | 0.5614 | — |

No se proporcionan comparaciones con otros modelos en la misma tabla, pero el propio repositorio indica que los resultados pueden diferir de otras reproducciones debido a la política de no expandir preguntas multi-concepto. No se dispone de más benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado el tamaño del repositorio (0.3 GB), es probable que quepa en GPUs con 2-4 GB de VRAM, pero no se especifica.
- GPU recomendadas: no disponible. Al ser un modelo pequeño, podría ejecutarse en cualquier GPU moderna, incluso en CPU.
- Compatibilidad con GPU de consumo: probablemente sí, dada la magnitud del modelo, pero no hay confirmación oficial.
- Opciones de despliegue: el modelo se distribuye en formato safetensors y está pensado para ser usado con la librería `leap-kt`. No se mencionan integraciones con vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

El modelo pertenece a la familia de modelos de knowledge tracing. Entre las alternativas más conocidas se encuentran DKT (Deep Knowledge Tracing) y DKVMN (Dynamic Key-Value Memory Network). El propio proyecto `leap-kt-toolkit` incluye reimplementaciones de estos modelos bajo el mismo protocolo, lo que permite comparaciones justas.

| Modelo | Arquitectura | Contexto | AUC en ASSIST2017 (reportado por leap-kt) | Licencia |
|---|---|---|---|---|
| QDKT (este modelo) | Centrada en pregunta | no disponible | 0.7619 | MIT |
| DKT | Red recurrente (LSTM) | no disponible | no disponible en la información proporcionada | MIT (en leap-kt) |
| DKVMN | Memoria clave-valor | no disponible | no disponible en la información proporcionada | MIT (en leap-kt) |

No se dispone de más detalles sobre los resultados de los modelos comparados en esta fuente.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre ASSIST2017, por lo que su generalización a otros conjuntos de datos o contextos educativos puede ser limitada.
- No es un modelo generativo ni de lenguaje; solo produce probabilidades de respuesta correcta. No puede generar explicaciones ni texto.
- La métrica AUC puede estar influenciada por la distribución de respuestas del dataset; no se han realizado pruebas de sesgo demográfico o de contenido.
- Aunque el protocolo evita fugas temporales, no se garantiza que el modelo capture completamente la complejidad del aprendizaje humano; es una simplificación estadística.
- La licencia MIT permite uso comercial, pero el modelo depende de la librería `leap-kt` y del dataset ASSIST2017, cuyos términos de uso deben verificarse por separado.
- No se proporcionan pesos cuantizados ni versiones optimizadas para producción; el despliegue en entornos reales requeriría trabajo adicional de integración.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/LEAP-LAB-KUS/leap-kt-qdktquestioncentricdeepk-2020-05)
- [Repositorio del toolkit leap-kt](https://github.com/LEAP-LAB-KUS/leap-kt-toolkit)
- [Página del LEAP Lab en Tsinghua](https://www.leaplab.ai/)
- [Modelo QDKT original (referencia en arxiv:2005.12442)](https://huggingface.co/LEAP-LAB-KUS/leap-kt-qdkt-2020-05)
