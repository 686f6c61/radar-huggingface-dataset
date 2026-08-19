# LEAP-LAB-KUS/leap-kt-addressingtwoproblemsdee-2018-06

## Resumen

El modelo `LEAP-LAB-KUS/leap-kt-addressingtwoproblemsdee-2018-06` es un checkpoint de knowledge tracing (seguimiento de conocimiento) desarrollado por el LEAP Lab de la Universidad Tsinghua. Forma parte del proyecto `leap-kt-toolkit`, una re-implementación sistemática de modelos de knowledge tracing publicados bajo un protocolo unificado y reproducible. El nombre "ADDRESSINGTWOPROBLEMSDEE" sugiere que aborda dos problemas específicos en la evaluación de modelos de knowledge tracing, probablemente relacionados con la fuga de datos en la evaluación y el tratamiento de preguntas multi-concepto.

El modelo predice la probabilidad de que un estudiante responda correctamente a una pregunta basándose en su historial de interacciones previas. Es relevante para el campo de la minería de datos educativos y los sistemas de tutoría inteligente, donde el seguimiento preciso del conocimiento del estudiante permite personalizar el aprendizaje. El repositorio contiene los pesos entrenados en seis datasets educativos públicos (algebra2005, assist2009, assist2012, bridge2algebra2006, dbe_kt22 y junyi), con todos los logs de entrenamiento, divisiones de usuario y checkpoints por cada pliegue de validación cruzada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de knowledge tracing, no se especifica la red concreta) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (trabaja con secuencias de interacciones, no con contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización indicada) |
| Idiomas soportados | no disponible (los datasets son de ejercicios matemáticos en inglés, pero el modelo no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo. Dado que es parte de un toolkit de re-implementación de modelos de knowledge tracing, es probable que se base en una arquitectura tipo DKT (Deep Knowledge Tracing) o similar, pero no se confirma. El entrenamiento sigue un protocolo estricto: división de usuarios 80/20 para entrenamiento/prueba, validación cruzada de 5 pliegues sobre la parte de entrenamiento, early stopping con paciencia 10 sobre el AUC de validación y un máximo de 200 épocas. Todos los modelos del toolkit se ejecutan con la misma configuración para garantizar comparaciones justas.

Un aspecto técnico destacable es el tratamiento de las preguntas multi-concepto: no se expanden en múltiples filas, a diferencia de otros toolkits que sí lo hacen y que introducen una fuga de datos (leak) al mostrar la respuesta correcta en la posición siguiente. Aquí los conceptos se tratan como un eje adicional de la interacción, evitando esa fuga y asegurando que cada interacción se puntúe exactamente una vez.

## Capacidades

- Predicción de la probabilidad de respuesta correcta del estudiante en cada interacción.
- Seguimiento del estado de conocimiento del estudiante a lo largo de una secuencia de ejercicios.
- Evaluación de modelos de knowledge tracing sobre seis datasets educativos públicos.
- Detección de patrones de aprendizaje y olvido en secuencias de interacción.
- Soporte para reproducción experimental gracias al almacenamiento de splits, logs y checkpoints por pliegue.
- No incluye capacidades de generación de texto, tool calling, visión ni razonamiento multimodal.

## Casos de uso

- Sistemas de tutoría inteligente: el modelo puede integrarse en plataformas educativas para predecir en tiempo real si un estudiante acertará el siguiente ejercicio, permitiendo ajustar la dificultad o el contenido de forma dinámica.
- Recomendación de ejercicios personalizados: a partir de la probabilidad de acierto estimada, se pueden seleccionar preguntas que se encuentren en la zona de desarrollo próximo del estudiante, maximizando el aprendizaje.
- Detección de conceptos débiles: analizando las secuencias de interacciones, el modelo puede identificar qué conceptos específicos no han sido dominados, ayudando a los docentes a intervenir de manera dirigida.
- Evaluación de políticas educativas: los resultados del modelo sobre datasets como ASSIST o Junyi permiten comparar el rendimiento de diferentes estrategias de enseñanza simuladas.
- Investigación en minería de datos educativos: el repositorio sirve como banco de pruebas para nuevos algoritmos de knowledge tracing, ofreciendo un protocolo estandarizado y métricas comparables.
- Generación de informes de progreso: las predicciones del modelo pueden alimentar paneles de seguimiento del estudiante, mostrando la evolución de su dominio por concepto a lo largo del tiempo.

## Benchmarks y rendimiento

La model card proporciona resultados medios sobre los seis datasets, con la desviación estándar del AUC:

| Dataset | AUC (media ± std) | ACC | F1 |
|---|---|---|---|
| algebra2005 | 0.8196 ± 0.0013 | 0.8144 | 0.8847 |
| assist2009 | 0.7618 ± 0.0014 | 0.7374 | 0.8162 |
| assist2012 | 0.7323 ± 0.0002 | 0.7337 | 0.8269 |
| bridge2algebra2006 | 0.7930 ± 0.0006 | 0.8492 | 0.9148 |
| dbe_kt22 | 0.7947 ± 0.0007 | 0.7937 | 0.8737 |
| junyi | 0.7606 ± 0.0002 | 0.7487 | 0.8352 |

No se han publicado comparaciones con otros modelos en la información disponible. La model card advierte que estos valores pueden diferir de otras reproducciones debido al tratamiento de preguntas multi-concepto y a la auditoría de fugas de datos realizada.

## Requisitos de hardware

- El tamaño del repositorio es de 0.1 GB, lo que indica que los checkpoints son pequeños (del orden de decenas de megabytes).
- No se requieren GPUs para inferencia; el modelo puede ejecutarse en CPU sin problemas.
- Para entrenamiento, una GPU de gama media (por ejemplo, RTX 3060 o superior) sería suficiente, aunque no se especifican requisitos concretos.
- Opciones de despliegue: al ser un modelo de knowledge tracing, no se integra con frameworks como vLLM o llama.cpp. Se ejecuta mediante la librería `leap-kt` del toolkit.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño, la inferencia por interacción es del orden de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de knowledge tracing (como DKT, DKVMN, SAKT) en la documentación proporcionada. El propio toolkit `leap-kt` re-implementa varios modelos publicados, pero no se ofrecen tablas comparativas en la model card. Se recomienda consultar el repositorio de GitHub para obtener dichas comparaciones.

## Limitaciones y advertencias

- El modelo está especializado en knowledge tracing y no puede utilizarse para tareas de generación de lenguaje o razonamiento general.
- Los resultados dependen en gran medida de la calidad y el dominio de los datasets de entrenamiento; no se garantiza su rendimiento en otros conjuntos de datos educativos.
- La model card no especifica la arquitectura interna ni el número de parámetros, lo que limita la reproducibilidad fuera del toolkit.
- Aunque se ha auditado la fuga de datos, no se han publicado controles de sesgo sobre subgrupos de estudiantes (por género, nivel socioeconómico, etc.).
- La licencia MIT permite uso comercial, pero el modelo no incluye garantías de precisión o idoneidad para entornos de producción reales sin una validación adicional.
- El nombre "ADDRESSINGTWOPROBLEMSDEE" sugiere que el modelo aborda dos problemas específicos, pero no se detallan en la documentación pública.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LEAP-LAB-KUS/leap-kt-addressingtwoproblemsdee-2018-06
- Repositorio del toolkit: https://github.com/LEAP-LAB-KUS/leap-kt-toolkit
- Web del LEAP Lab (Tsinghua): https://www.leaplab.ai/
