# LEAP-LAB-KUS/leap-kt-dynamickeyvaluememorynet-2016-11

## Resumen

`leap-kt-dynamickvaluememorynet-2016-11` es un modelo de *knowledge tracing* (KT) desarrollado por el laboratorio LEAP-LAB-KUS como parte del toolkit `leap-kt`, una reimplementación sistemática de modelos de KT publicados bajo un protocolo unificado. El modelo implementa una red de memoria dinámica clave-valor (Dynamic Key-Value Memory Network, DKVMN), una arquitectura diseñada para predecir el rendimiento futuro de estudiantes en función de su historial de interacciones con ejercicios educativos. Se entrenó sobre el dataset ASSIST2017, un conjunto de datos estándar en minería de datos educativos.

El modelo se distribuye con licencia MIT y los pesos en formato safetensors. Su relevancia radica en que ofrece una implementación reproducible y auditada de DKVMN, con resultados reportados de forma transparente (AUC, exactitud y F1) y con un protocolo de evaluación que evita fugas de datos comunes en otras reproducciones. Aunque no es un modelo de lenguaje, su uso es pertinente para sistemas de tutoría inteligente y análisis de datos educativos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dynamic Key-Value Memory Network (DKVMN) — no confirmado explícitamente, inferido del nombre |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo más allá de su nombre. Por la denominación `dynamickeyvaluememorynet`, se infiere que se trata de una implementación de la red de memoria dinámica clave-valor (DKVMN), propuesta originalmente por Zhang et al. (2017) para knowledge tracing. Este tipo de arquitectura mantiene una memoria de conocimiento del estudiante que se actualiza dinámicamente con cada interacción, permitiendo modelar la evolución del dominio de conceptos a lo largo del tiempo.

El entrenamiento sigue un protocolo riguroso: división de usuarios en 80/20 para entrenamiento/test, validación cruzada de 5 pliegues sobre la parte de entrenamiento, parada temprana con paciencia de 10 épocas basada en AUC de validación, y un máximo de 200 épocas. Los datos de entrenamiento provienen del dataset ASSIST2017. Un aspecto técnico destacado es que las preguntas multi-concepto no se expanden en múltiples filas, evitando así una fuga de información común en otras implementaciones. Además, se realizan auditorías de fugas (disjuntez de usuarios, cruce de ventanas, puntuación exacta) y un control de barajado de etiquetas para verificar que el AUC colapsa al azar.

## Capacidades

- Predicción de rendimiento del estudiante: estima la probabilidad de que un estudiante responda correctamente a una pregunta futura basándose en su historial de interacciones.
- Modelado de conocimiento a lo largo del tiempo: actualiza una representación latente del dominio de conceptos del estudiante con cada respuesta.
- Evaluación de métricas educativas: reporta AUC, exactitud y F1 sobre el dataset ASSIST2017.
- Reproducibilidad: incluye logs de entrenamiento por época, división exacta de usuarios y configuración del entorno para cada ejecución.
- No es un modelo generativo ni de lenguaje; no admite tool calling, agentes ni razonamiento multi-paso en el sentido de los LLM.

## Casos de uso

- Sistemas de tutoría inteligente: el modelo puede integrarse en plataformas educativas para adaptar el contenido al nivel de conocimiento del estudiante, prediciendo qué ejercicios son más adecuados en cada momento.
- Análisis de datos educativos: permite a investigadores evaluar la efectividad de distintas secuencias de aprendizaje, identificando patrones de adquisición de conceptos.
- Detección temprana de estudiantes en riesgo: al predecir el rendimiento futuro, se pueden señalar alumnos que probablemente fallarán en próximas evaluaciones y activar intervenciones.
- Evaluación de currículos: comparar la dificultad de diferentes conjuntos de ejercicios y su impacto en el aprendizaje a partir de las predicciones del modelo.
- Benchmarking de modelos de KT: al ser parte de un toolkit estandarizado, sirve como referencia para comparar nuevas arquitecturas bajo el mismo protocolo.
- Generación de recomendaciones de práctica: en aplicaciones de aprendizaje adaptativo, el modelo puede sugerir ejercicios de repaso basados en las debilidades detectadas en la memoria del estudiante.

## Benchmarks y rendimiento

El modelo reporta los siguientes resultados en el dataset ASSIST2017:

| Dataset | AUC | ACC | F1 | Referencia publicada | Delta |
|---|---|---|---|---|---|
| `assist2017` | 0.7040 ± 0.0006 | 0.6879 | 0.4761 | — | — |

No se proporcionan comparaciones con otros modelos en la información disponible. Los valores por pliegue se encuentran en los archivos `summary.json` de cada dataset. El protocolo de evaluación incluye auditorías de fugas y un control de barajado de etiquetas que debe colapsar el AUC al azar, lo que respalda la validez de los resultados.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware en la documentación proporcionada. El tamaño del repositorio es de 0.2 GB, lo que sugiere que el modelo es relativamente ligero, pero no se especifican requisitos de VRAM, GPU recomendadas ni opciones de despliegue. Dado que se trata de un modelo de knowledge tracing (no un LLM), es probable que pueda ejecutarse en hardware modesto, incluso CPU, pero esta afirmación no está confirmada.

## Comparativa con modelos similares

No se proporcionan datos comparativos con otras implementaciones de DKVMN o modelos de knowledge tracing en la información disponible. El modelo se enmarca dentro del toolkit `leap-kt`, que reimplementa múltiples modelos de KT bajo un protocolo común, pero no se incluyen resultados de esos otros modelos en la ficha. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para knowledge tracing; no es adecuado para tareas de generación de texto, razonamiento general o procesamiento de lenguaje.
- Los resultados se limitan al dataset ASSIST2017; el rendimiento en otros conjuntos de datos o entornos reales puede variar.
- No se han publicado análisis de sesgos o limitaciones éticas específicas para este modelo.
- La licencia MIT permite uso comercial y modificación, pero se recomienda revisar los términos del dataset ASSIST2017 para su uso en producción.
- El protocolo de evaluación es riguroso, pero la ausencia de una referencia publicada en la tabla de resultados impide comparar directamente con otras implementaciones.
- No se especifican requisitos de hardware ni latencia, lo que dificulta la planificación de despliegue.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/LEAP-LAB-KUS/leap-kt-dynamickeyvaluememorynet-2016-11)
- [Repositorio del toolkit leap-kt](https://github.com/LEAP-LAB-KUS/leap-kt-toolkit)
