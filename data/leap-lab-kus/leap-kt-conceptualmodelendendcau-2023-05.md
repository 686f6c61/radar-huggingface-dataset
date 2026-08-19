# LEAP-LAB-KUS/leap-kt-conceptualmodelendendcau-2023-05

## Resumen

LEAP-LAB-KUS/leap-kt-conceptualmodelendendcau-2023-05 es un modelo de knowledge tracing (seguimiento del conocimiento) desarrollado por el laboratorio LEAP-LAB-KUS dentro del proyecto leap-kt-toolkit, una reimplementación sistemática de modelos de knowledge tracing publicados bajo un protocolo unificado. Su propósito es predecir la probabilidad de que un estudiante responda correctamente a una pregunta en función de su historial de interacciones previas, modelando la evolución de su conocimiento a lo largo del tiempo. Este tipo de modelos es fundamental para sistemas de tutoría inteligente y plataformas de aprendizaje adaptativo.

El modelo se ha entrenado y evaluado sobre dos conjuntos de datos educativos públicos: ASSIST2009 y DBE_KT22. A diferencia de muchos modelos de lenguaje, no genera texto, sino que produce una puntuación de probabilidad de acierto para cada interacción. La arquitectura concreta no está documentada en la información disponible, pero los resultados reportados muestran un AUC de 0.7525 en ASSIST2009 y 0.7951 en DBE_KT22, con una desviación estándar muy baja (±0.0012), lo que indica estabilidad entre los pliegues de validación cruzada.

La relevancia actual de este modelo radica en su enfoque riguroso de evaluación: aplica una división de usuarios 80/20, validación cruzada de 5 pliegues y un control de fuga de datos que evita la expansión de preguntas multi-concepto en múltiples filas, un problema común en otras implementaciones que infla artificialmente las métricas. Esto lo convierte en una referencia fiable para comparar futuros modelos de knowledge tracing.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de knowledge tracing, arquitectura no especificada en la documentacion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa secuencias de interacciones, sin ventana especificada) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en formato safetensors) |
| Idiomas soportados | no disponible (los datasets son de plataformas educativas, probablemente en ingles, pero no se especifica) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La documentacion no revela la arquitectura interna del modelo (si se basa en redes recurrentes, transformadores u otro enfoque). Lo que sí se detalla es el protocolo de entrenamiento y evaluacion: se realiza una division de usuarios en 80% entrenamiento y 20% test, seguida de una validacion cruzada de 5 pliegues sobre la parte de entrenamiento, con el pliegue retenido como validacion. Se aplica early stopping con paciencia de 10 epocas basado en el AUC de validacion, con un maximo de 200 epocas.

Los datos provienen de dos conjuntos: ASSIST2009 y DBE_KT22. Una innovacion metodologica clave es que las preguntas multi-concepto no se expanden en multiples filas, sino que los conceptos se tratan como un eje adicional de la interaccion. Esto evita una fuga de datos comun en otras herramientas que colocan posiciones consecutivas con la misma pregunta y respuesta, lo que permite al modelo "ver" la respuesta antes de predecirla. En ASSIST2009, esa expansion afecta aproximadamente al 37% de las posiciones y puede inflar el AUC de modelos como DKT de ~0.75 a ~0.89.

Ademas, se realiza una auditoria de fugas en las celdas con referencia publicada: comprobacion de disjuncion de usuarios entre train y test, ausencia de ventanas que crucen el limite del split, puntuacion exactamente una vez por interaccion y un control de permutacion de etiquetas que debe colapsar el AUC al azar.

## Capacidades

- Prediccion de la probabilidad de acierto en la siguiente interaccion de un estudiante, basandose en su historial previo.
- Modelado de la evolucion temporal del conocimiento del estudiante, capturando olvidos y refuerzos.
- Manejo de preguntas con multiples conceptos, tratando los conceptos como un eje adicional sin expandir las filas.
- Evaluacion rigurosa con metricas de AUC, exactitud y F1, con desviacion estandar reportada.
- Reproducibilidad completa: cada pliegue incluye configuracion, pesos, logs de entrenamiento y el split exacto de usuarios.
- Compatibilidad con el ecosistema leap-kt-toolkit, que permite reproducir y comparar modelos bajo el mismo protocolo.

## Casos de uso

- Sistemas de tutoría adaptativa: el modelo puede integrarse en plataformas educativas para predecir en tiempo real si un estudiante responderá correctamente a un ejercicio, permitiendo ajustar la dificultad o el contenido de forma dinámica.
- Detección temprana de estudiantes en riesgo: al monitorizar la probabilidad de acierto a lo largo de las sesiones, se pueden identificar patrones de bajo rendimiento y activar intervenciones pedagógicas.
- Recomendación de ejercicios personalizados: basándose en las predicciones, el sistema puede seleccionar preguntas que maximicen el aprendizaje, equilibrando reto y éxito.
- Evaluación de materiales didácticos: los resultados del modelo sobre distintos conjuntos de preguntas pueden usarse para medir la coherencia entre el nivel de dificultad estimado y el real.
- Investigación en minería de datos educativos: sirve como línea base fiable para comparar nuevos modelos de knowledge tracing, gracias a su protocolo estandarizado y su auditoría de fugas.
- Análisis de currículos: al modelar el conocimiento por conceptos, se puede analizar qué conceptos se dominan antes o después, ayudando a rediseñar la secuencia de enseñanza.

## Benchmarks y rendimiento

Los resultados reportados en la model card son los siguientes:

| Dataset | AUC | ACC | F1 |
|---|---|---|---|
| ASSIST2009 | 0.7525 ± 0.0012 | 0.7343 | 0.8169 |
| DBE_KT22 | 0.7951 ± 0.0012 | 0.7926 | 0.8736 |

No se proporcionan comparaciones con otros modelos en la información disponible. Los valores de desviación estándar son muy bajos (±0.0012), lo que sugiere una alta consistencia entre los pliegues de validación. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

No se especifican requisitos de hardware en la documentación disponible. Dado que se trata de un modelo de knowledge tracing (no un LLM), es probable que su tamaño sea modesto y pueda ejecutarse en CPU o GPU de gama baja, pero no se dispone de datos concretos sobre VRAM, GPU recomendadas o latencia. El repositorio del toolkit (leap-kt-toolkit) puede contener información adicional, pero no se ha detallado en la ficha proporcionada.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de knowledge tracing en la documentación proporcionada. La model card menciona que otras herramientas que expanden preguntas multi-concepto pueden inflar el AUC (por ejemplo, DKT pasa de ~0.75 a ~0.89 en ASSIST2009), pero no se ofrecen cifras concretas de esos modelos bajo el mismo protocolo. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La arquitectura interna no está documentada, lo que dificulta la interpretación de los mecanismos de aprendizaje y limita la capacidad de diagnóstico de errores.
- Los datos de entrenamiento provienen de dos conjuntos específicos (ASSIST2009 y DBE_KT22), que pueden no representar la diversidad de contextos educativos reales (idiomas, sistemas de evaluación, edades, etc.).
- No se han reportado análisis de sesgos por género, nivel socioeconómico u otras variables sensibles, por lo que su uso en entornos reales requiere validación adicional.
- El modelo está diseñado para la predicción de acierto, no para generar explicaciones o feedback pedagógico; su salida es una probabilidad, no un texto.
- Aunque se ha auditado la fuga de datos, la dependencia de la calidad de las anotaciones de conceptos en los datasets puede afectar el rendimiento en otros dominios.
- La licencia MIT permite uso comercial y modificación, pero el usuario es responsable de cumplir con las condiciones de los datasets originales (ASSIST2009 y DBE_KT22), que pueden tener sus propias restricciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LEAP-LAB-KUS/leap-kt-conceptualmodelendendcau-2023-05
- Repositorio del toolkit: https://github.com/LEAP-LAB-KUS/leap-kt-toolkit
- Dataset ASSIST2009: no se proporciona enlace directo en la documentación, pero es un dataset público conocido.
- Dataset DBE_KT22: no se proporciona enlace directo en la documentación.
