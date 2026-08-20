# LEAP-LAB-KUS/leap-kt-bkt3-2020-12

## Resumen

El modelo `LEAP-LAB-KUS/leap-kt-bkt3-2020-12` es una implementación del algoritmo de seguimiento de conocimiento BKT3 (Bayesian Knowledge Tracing, variante 3), desarrollado por el laboratorio LEAP-LAB-KUS como parte del proyecto `leap-kt-toolkit`. Este proyecto tiene como objetivo reimplementar de forma sistemática y reproducible los modelos publicados de knowledge tracing bajo un mismo protocolo experimental, permitiendo comparaciones justas entre ellos. El modelo se centra en predecir la probabilidad de que un estudiante responda correctamente una pregunta en función de su historial de interacciones, una tarea fundamental en sistemas de tutoría inteligente y plataformas de aprendizaje adaptativo.

A diferencia de los grandes modelos de lenguaje, BKT3 no genera texto ni razona sobre contenido libre; opera sobre secuencias de interacciones educativas (pregunta, respuesta, acierto/error) y estima el dominio latente de conceptos por parte del alumno. El repositorio en Hugging Face no contiene un único checkpoint, sino que almacena todos los folds de todos los datasets evaluados (ASSIST2009, ASSIST2012 y DBE_KT22), con los logs de entrenamiento por época y la división exacta de usuarios. Los pesos están en formato safetensors y la licencia es MIT, lo que permite su uso y modificación sin restricciones comerciales.

La relevancia actual de este modelo radica en la necesidad de reproducibilidad en el campo de la minería de datos educativos. El proyecto documenta explícitamente cómo evita un sesgo común en otras implementaciones: no expande las preguntas de múltiples conceptos en varias filas, lo que evita una fuga de información que infla los resultados de AUC. Así, las métricas reportadas son más fiables y comparables con otros modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BKT3 (Bayesian Knowledge Tracing, variante 3) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura interna de BKT3 no se detalla en la información proporcionada. Se sabe que pertenece a la familia de modelos de Knowledge Tracing, que modela el estado de conocimiento de un estudiante sobre un concepto como una variable latente binaria (dominado o no dominado) y actualiza su probabilidad mediante observaciones de respuestas correctas o incorrectas. BKT3 es una variante que probablemente introduce mejoras sobre el BKT clásico, como la incorporación de parámetros de aprendizaje, olvido o la posibilidad de múltiples conceptos por pregunta.

El entrenamiento se realizó bajo un protocolo estricto: división de usuarios en 80/20 para entrenamiento y prueba, 5-fold cross-validation sobre el entrenamiento, con el fold de validación como criterio de parada temprana (paciencia 10 sobre AUC) y un máximo de 200 épocas. Todos los experimentos se ejecutaron con configuraciones idénticas; si una celda no podía completarse, se documentaba como fallo y no se reentrenaba con parámetros especiales. No se especifica el número total de parámetros ni la técnica de entrenamiento (por ejemplo, gradiente descendente, optimizador, etc.).

## Capacidades

- Predicción de la probabilidad de que un estudiante responda correctamente una pregunta basándose en su historial de interacciones.
- Modelado de conocimiento de conceptos específicos a lo largo del tiempo, con capacidad de capturar el aprendizaje y el olvido.
- Manejo de preguntas de múltiples conceptos sin expandir filas, evitando la fuga de datos temporal.
- Evaluación mediante métricas estándar de knowledge tracing: AUC, exactitud y F1.
- No tiene capacidades de generación de texto, razonamiento lingüístico, tool calling ni visión; es un modelo específico de dominio educativo.

## Casos de uso

- **Sistemas de tutoría inteligente**: el modelo puede predecir el dominio de conceptos en cada momento para adaptar la dificultad de los ejercicios y recomendar materiales de repaso.
- **Plataformas de aprendizaje adaptativo**: integrado en un LMS, permite personalizar el itinerario de aprendizaje de cada estudiante según su estado de conocimiento estimado.
- **Análisis de datos educativos**: los investigadores pueden utilizarlo para estudiar la evolución del conocimiento en grandes cohortes de estudiantes a partir de logs de interacción.
- **Detección de estudiantes en riesgo**: las predicciones de probabilidad de acierto pueden alertar a docentes sobre estudiantes que muestran bajos niveles de dominio en conceptos clave.
- **Evaluación de intervenciones pedagógicas**: comparando las curvas de aprendizaje predichas antes y después de una intervención, se puede medir su efecto.
- **Generación de informes automatizados**: el modelo puede alimentar dashboards que muestren el progreso de los estudiantes en tiempo real, con predicciones de rendimiento futuro.

## Benchmarks y rendimiento

Los resultados reportados en el README para los tres datasets son los siguientes:

| Dataset | AUC (media ± desv.) | ACC | F1 |
|---|---|---|---|
| ASSIST2009 | 0.7511 ± 0.0016 | 0.7264 | 0.8043 |
| ASSIST2012 | 0.7494 ± 0.0010 | 0.7412 | 0.8295 |
| DBE_kt22 | 0.7886 ± 0.0021 | 0.7912 | 0.8733 |

No se proporcionan comparaciones con otros modelos en la información disponible. El proyecto enfatiza que los números pueden diferir de otras reproducciones porque evitan la expansión de preguntas multi-concepto, lo que elimina una fuga de datos común que infla el AUC en otros toolkits. Además, se realizan auditorías de fuga (disjointness de usuarios, sin ventanas que crucen el límite train/test, etc.) para garantizar la validez de las métricas.

## Requisitos de hardware

- **VRAM**: no requiere GPU dedicada; el modelo es ligero y se ejecuta en CPU sin problemas.
- **GPU recomendada**: ninguna específica; cualquier CPU moderna es suficiente para inferencia y entrenamiento.
- **Compatibilidad con GPU de consumo**: sí, incluso en equipos con pocos recursos.
- **Opciones de despliegue**: se puede integrar en cualquier entorno Python; no requiere librerías especiales más allá de `leap-kt` (el toolkit). No se mencionan soportes como vLLM, Ollama o TGI, dado que no es un modelo de lenguaje.
- **Latencia y throughput**: no se especifican, pero al ser un modelo de tamaño pequeño, la inferencia es prácticamente instantánea en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en el mismo repositorio ni en la búsqueda web. El propio proyecto `leap-kt` incluye otras implementaciones de modelos de knowledge tracing (como DKT, DKT+, etc.) que podrían ser comparables, pero no se proporcionan datos de rendimiento de esos modelos en la información actual. Por tanto, no se presenta una tabla comparativa.

## Limitaciones y advertencias

- **Dependencia del dominio**: el modelo está entrenado específicamente para datasets educativos (ASSIST2009, ASSIST2012, DBE_kt22); su rendimiento en otros dominios o con otros formatos de interacción puede degradarse.
- **Sin capacidad lingüística**: no procesa texto libre; solo interacciones codificadas numéricamente (pregunta, respuesta, acierto/error). No es adecuado para tareas de procesamiento de lenguaje natural.
- **Sesgos en los datos**: los resultados dependen de la calidad y representatividad de los datos de entrenamiento; si los datasets contienen sesgos (por ejemplo, distribución desequilibrada de conceptos), el modelo los heredará.
- **Alucinación**: no aplica, ya que no genera contenido.
- **Licencia**: MIT, permite uso comercial y modificación sin restricciones, pero se recomienda atribución.
- **Reproducibilidad**: el proyecto documenta el protocolo y los splits exactos, pero la variabilidad entre ejecuciones puede existir; se recomienda usar los checkpoints preentrenados para reproducir los resultados reportados.

## Enlaces

- [Hugging Face - LEAP-LAB-KUS/leap-kt-bkt3-2020-12](https://huggingface.co/LEAP-LAB-KUS/leap-kt-bkt3-2020-12)
- [Repositorio del toolkit en GitHub](https://github.com/LEAP-LAB-KUS/leap-kt-toolkit)
- [Página del grupo de investigación Leap Laboratories](https://www.leap-labs.com/)
