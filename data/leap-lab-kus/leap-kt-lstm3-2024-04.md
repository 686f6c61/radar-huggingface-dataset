# LEAP-LAB-KUS/leap-kt-lstm3-2024-04

## Resumen

LEAP-LAB-KUS/leap-kt-lstm3-2024-04 es un modelo de knowledge tracing (seguimiento de conocimiento) basado en la arquitectura LSTM3, desarrollado por el LEAP Lab de la Universidad de Tsinghua como parte del toolkit `leap-kt-toolkit`. Este modelo no es un LLM generativo, sino un modelo de aprendizaje automático supervisado diseñado para predecir el rendimiento de un estudiante en interacciones educativas, concretamente en el dataset ASSIST2017. Su propósito es modelar la evolución del conocimiento de cada alumno a lo largo de una secuencia de ejercicios, una tarea fundamental para sistemas de tutoría inteligente y plataformas de aprendizaje adaptativo.

El modelo forma parte de un esfuerzo sistemático de reimplementación de modelos de knowledge tracing publicados bajo un protocolo común y reproducible. El repositorio incluye todos los folds de validación cruzada, los logs de entrenamiento por época y la partición exacta de usuarios utilizada. Su relevancia reside en que sirve como punto de referencia reproducible para la comunidad de minería de datos educativos, aunque sus resultados en ASSIST2017 muestran un rendimiento cercano al azar (AUC 0.5028), lo que indica que el modelo base LSTM3 no captura bien la dinámica de conocimiento en este dataset concreto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM3 (red neuronal recurrente de tres capas LSTM) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, es un modelo de secuencias de interacción, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en precisión completa, safetensors) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; trabaja con interacciones educativas codificadas numéricamente) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LSTM3 es una arquitectura basada en redes neuronales recurrentes (RNN) con tres capas LSTM apiladas, diseñada para modelar secuencias temporales de interacciones de aprendizaje. En el contexto de knowledge tracing, cada interacción se representa como un par pregunta-respuesta del estudiante, y el modelo aprende a predecir la probabilidad de que el estudiante responda correctamente la siguiente pregunta, manteniendo un estado interno que codifica su conocimiento actual.

El protocolo de entrenamiento es riguroso y estandarizado: división de usuarios 80/20 para entrenamiento/test, validación cruzada de 5 folds sobre la porción de entrenamiento, validación con el fold retenido, early stopping con paciencia de 10 épocas basado en AUC de validación, y un máximo de 200 épocas. El dataset es ASSISTments 2017 (ASSIST2017). Un punto crítico del protocolo es que las preguntas multi-concepto no se expanden en múltiples filas, lo que evita una fuga de información presente en otras implementaciones que inflan artificialmente el rendimiento. Cada interacción se puntúa exactamente una vez.

## Capacidades

- Predicción de la probabilidad de respuesta correcta en la siguiente interacción de un estudiante.
- Modelado de la evolución temporal del conocimiento de un estudiante a lo largo de una secuencia de ejercicios.
- Estimación de métricas de rendimiento por interacción: AUC, precisión (ACC) y F1.
- Soporte para evaluación con validación cruzada y protocolo reproducible.
- No es un modelo de lenguaje: no genera texto, no procesa lenguaje natural, no soporta tool calling ni razonamiento multi-paso.

## Casos de uso

- **Sistemas de tutoría inteligente**: el modelo puede integrarse en plataformas educativas para predecir en tiempo real la probabilidad de que un estudiante responda correctamente el siguiente ejercicio, permitiendo adaptar la dificultad de las preguntas.
- **Plataformas de aprendizaje adaptativo**: al modelar la evolución del conocimiento por estudiante, permite personalizar la secuencia de ejercicios según el estado de conocimiento predicho.
- **Detección temprana de estudiantes en riesgo**: las predicciones de baja probabilidad de éxito pueden alertar a los educadores sobre estudiantes que necesitan intervención adicional.
- **Evaluación de materiales educativos**: comparando el rendimiento del modelo en diferentes conjuntos de preguntas, se puede evaluar la calidad y dificultad de los materiales.
- **Investigación en educational data mining**: sirve como modelo de referencia reproducible para comparar futuros métodos de knowledge tracing bajo el mismo protocolo.
- **Generación de simulaciones de aprendizaje**: el modelo puede generar trayectorias sintéticas de rendimiento de estudiantes para experimentos controlados.

## Benchmarks y rendimiento

Los resultados reportados por el autor en ASSIST2017 son los siguientes:

| Métrica | Valor |
|---|---|
| AUC | 0.5028 ± 0.0044 |
| ACC | 0.6288 |
| F1 | 0.0000 |

El AUC de 0.5028 es prácticamente equivalente al azar (0.5), lo que indica que el modelo no logra distinguir entre respuestas correctas e incorrectas en este dataset. El F1 de 0.0000 indica que el modelo no predice ninguna instancia de la clase positiva (probablemente respuestas incorrectas o correctas según la codificación). No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 0.2 GB, por lo que los pesos son pequeños (probablemente del orden de megabytes o pocos cientos de megabytes).
- Inferencia en CPU es suficiente para uso en producción educativa; no requiere GPU.
- Para entrenamiento, una GPU de gama media (ej. RTX 3060) es más que suficiente; el modelo es de baja complejidad.
- Opciones de despliegue: el modelo se carga con la librería `leap-kt`; no hay soporte para vLLM, llama.cpp u otros motores de inferencia de LLM.
- La latencia por predicción es del orden de milisegundos en CPU, adecuada para inferencia en línea.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables en la información proporcionada. Otros modelos de knowledge tracing (p. ej. DKT, BKT, DKVMN) se han publicado en la literatura, pero no se han proporcionado resultados de estos modelos bajo el mismo protocolo. La comparativa no está disponible.

## Limitaciones y advertencias

- **Rendimiento bajo**: el AUC de 0.5028 en ASSIST2017 está cerca del azar, lo que indica que el modelo no es útil para predicción en este dataset sin ajustes adicionales.
- **F1 nulo**: el F1 de 0.0000 sugiere que el modelo no predice ninguna instancia de la clase positiva, lo que puede deberse a un desequilibrio de clases o a un umbral de decisión inadecuado.
- **Alcance limitado**: el modelo solo se ha evaluado en ASSIST2017; no hay evidencia de generalización a otros datasets.
- **No es un modelo de lenguaje**: no puede procesar texto libre, preguntas abiertas ni generar respuestas.
- **Licencia MIT**: permite uso comercial, pero el modelo no es útil para producción dado su rendimiento actual.
- **Reproducibilidad**: el protocolo es estricto, pero los resultados son de baja calidad; los usuarios deben ser cautelosos al usarlo como punto de referencia.

## Enlaces

- [HuggingFace - LEAP-LAB-KUS/leap-kt-lstm3-2024-04](https://huggingface.co/LEAP-LAB-KUS/leap-kt-lstm3-2024-04)
- [GitHub - leap-kt-toolkit](https://github.com/LEAP-LAB-KUS/leap-kt-toolkit)
- [LEAP Lab @ Tsinghua University](https://www.leaplab.ai/)
- [Publicaciones de LEAP Lab](https://www.leaplab.ai/publications)
- [GitHub - LEAP-LAB-KUS](https://github.com/LEAP-LAB-KUS)
