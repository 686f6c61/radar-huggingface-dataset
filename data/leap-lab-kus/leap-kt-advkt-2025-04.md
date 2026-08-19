# LEAP-LAB-KUS/leap-kt-advkt-2025-04

## Resumen

ADVKT (Adversarial Multi-Step Training Framework for Knowledge Tracing) es un modelo de knowledge tracing desarrollado por el LEAP Lab de la Universidad Tsinghua, publicado en el repositorio LEAP-LAB-KUS/leap-kt-advkt-2025-04. A diferencia de los modelos de lenguaje, este modelo no genera texto: predice la probabilidad de que un estudiante responda correctamente a una pregunta en función de su historial de interacciones previas, una tarea central en sistemas de tutoría inteligente y analítica del aprendizaje.

El modelo forma parte de leap-kt-toolkit, una reimplementación sistemática de modelos de knowledge tracing publicados bajo un protocolo unificado. ADVKT introduce un paradigma de entrenamiento adversarial multi-paso que combina un generador y un discriminador, abordando por primera vez la tarea de knowledge tracing multi-paso. El repositorio incluye checkpoints, divisiones de usuario exactas y registros de entrenamiento por época para cada pliegue de validación cruzada, lo que garantiza reproducibilidad completa.

La relevancia actual de este modelo radica en su enfoque metodológico: el protocolo evita la fuga de datos (data leakage) que afecta a otras implementaciones, al no expandir preguntas multi-concepto en filas adicionales. Esto produce métricas más honestas aunque aparentemente más bajas que las publicadas en otros trabajos. El tamaño del repositorio es de 0,1 GB (49,6 MB en pesos safetensors) y la licencia es MIT, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adversarial multi-step framework (generador + discriminador) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de knowledge tracing, no un LLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los datos de entrenamiento son registros de interacciones educativas, no texto libre) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ADVKT emplea un paradigma de aprendizaje adversarial que involucra un generador y un discriminador, según se describe en el artículo arXiv 2504.04706. El generador modela la secuencia de interacciones del estudiante y predice el rendimiento futuro, mientras que el discriminador distingue entre secuencias reales y generadas, lo que fuerza al generador a aprender representaciones más robustas para la predicción multi-paso. La arquitectura concreta (número de capas, dimensiones ocultas, tipo de celda recurrente o transformer) no se especifica en la información disponible.

El entrenamiento sigue un protocolo estricto: división usuario-nivel 80/20 entre entrenamiento y test, validación cruzada de 5 pliegues sobre la porción de entrenamiento, pliegue retenido como validación, early stopping con paciencia 10 sobre el AUC de validación y máximo de 200 épocas. Los datos provienen de los conjuntos ASSIST2009 y dbe_kt22. Una innovación técnica clave es que las preguntas multi-concepto no se expanden en múltiples filas, lo que elimina la fuga de datos que infla los resultados de otras implementaciones (en ASSIST2009, esa expansión afecta aproximadamente al 37% de las posiciones y eleva el AUC de DKT de ~0,75 a ~0,89).

## Capacidades

- Predicción de rendimiento del estudiante: estima la probabilidad de respuesta correcta en cada interacción.
- Knowledge tracing multi-paso: modela secuencias largas de interacciones y predice pasos futuros, no solo la siguiente respuesta.
- Entrenamiento adversarial: el marco generador-discriminador mejora la robustez de las representaciones aprendidas.
- Reproducibilidad completa: cada ejecución incluye división de usuarios exacta, logs por época y configuración del protocolo.
- Auditoría de fugas de datos: verificación de disjunción train/test, ausencia de ventanas que crucen la frontera de división y control de etiquetas barajadas que debe colapsar el AUC al azar.
- Manejo de preguntas multi-concepto sin expandir filas, evitando la fuga posicional.

## Casos de uso

- Sistemas de tutoría inteligente: el modelo puede integrarse en plataformas educativas para predecir qué conceptos domina el estudiante y adaptar el siguiente ejercicio en tiempo real, gracias a su capacidad de modelar secuencias de interacción sin depender de expansiones artificiales de datos.
- Detección temprana de estudiantes en riesgo: al monitorizar el AUC de predicción por estudiante a lo largo de las épocas de entrenamiento, los equipos pedagógicos pueden identificar patrones de bajo rendimiento y activar intervenciones personalizadas.
- Evaluación de currículos educativos: los resultados por pliegue y por conjunto de datos (ASSIST2009, dbe_kt22) permiten comparar la dificultad real de distintos materiales didácticos mediante el análisis de las curvas de aprendizaje predichas.
- Investigación en educational data mining: el repositorio sirve como banco de pruebas para reproducir y comparar modelos de knowledge tracing bajo un protocolo uniforme, con checkpoints y splits verificados.
- Auditoría de modelos educativos: el protocolo de auditoría de fugas (label-shuffle control, disjunción de usuarios) permite validar que cualquier modelo de la familia no esté memorizando respuestas, algo crítico para publicar resultados científicos fiables.
- Desarrollo de herramientas de analítica del aprendizaje: los logs por época (epochs.jsonl) con pérdida de entrenamiento y métricas de validación permiten construir dashboards de seguimiento del modelo en despliegues educativos reales.

## Benchmarks y rendimiento

| Dataset | AUC | ACC | F1 | Referencia publicada | Delta |
|---|---|---|---|---|---|
| assist2009 | 0,5582 ± 0,0548 | 0,3878 | 0,1935 | — | — |
| dbe_kt22 | 0,5161 ± 0,0007 | 0,4725 | 0,5576 | — | — |

Nota: el resultado en dbe_kt22 está incompleto: solo se completaron 2 de 5 pliegues. La media se calcula sobre los pliegues que terminaron, y los pliegues perdidos corresponden a ejecuciones fallidas. La propia model card advierte que debe tratarse como un resultado incompleto, no como un resultado válido.

En ASSIST2009, el modelo obtiene un AUC de 0,5582, notablemente inferior al ~0,75 que la literatura atribuye a DKT sin expansión de conceptos. La model card explica esta discrepancia por la política de no expandir preguntas multi-concepto, que elimina la fuga de datos posicional presente en otras reproducciones.

## Requisitos de hardware

- Tamaño del repositorio: 0,1 GB; los pesos safetensors ocupan aproximadamente 49,6 MB.
- Inferencia en CPU: factible sin problemas en cualquier máquina moderna, dado el tamaño reducido del modelo.
- GPU: no se requieren GPUs específicas; cualquier GPU con 2 GB de VRAM o incluso inferencia solo-CPU es suficiente.
- Entrenamiento: el protocolo de 200 épocas con 5 pliegues puede ejecutarse en una GPU de gama media (RTX 3060 o superior) o incluso en CPU para conjuntos pequeños como ASSIST2009.
- Despliegue: la librería leap-kt (leap-kt-toolkit) es el entorno nativo; no se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | AUC en ASSIST2009 | Protocolo | Fuga de datos |
|---|---|---|---|---|
| ADVKT (este modelo) | Adversarial multi-step | 0,5582 ± 0,0548 | leap-kt, 5-fold, sin expansión de conceptos | Auditada y eliminada |
| DKT (Deep Knowledge Tracing) | Red recurrente | ~0,75 (publicado, sin expansión) | Variable según implementación | Presente en implementaciones que expanden conceptos |
| DKT con expansión de conceptos | Red recurrente | ~0,89 | Expansión de filas multi-concepto | Fuga posicional (37% de posiciones en ASSIST2009) |

La comparativa directa es delicada: los valores publicados de DKT provienen de implementaciones con protocolos distintos y, en muchos casos, con fuga de datos. La model card de ADVKT documenta explícitamente este problema y ofrece una auditoría estructural como garantía de que sus métricas no están infladas.

## Limitaciones y advertencias

- Resultados incompletos en dbe_kt22: solo 2 de 5 pliegues completados; la media reportada no es representativa y el propio autor la marca como incompleta.
- AUC bajo en ambos conjuntos: 0,5582 en ASSIST2009 y 0,5161 en dbe_kt22, lo que sugiere que el modelo tiene margen de mejora significativo frente a otras aproximaciones.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes; su ámbito es exclusivamente la predicción de rendimiento educativo.
- Datos de entrenamiento limitados: solo dos conjuntos de datos (ASSIST2009 y dbe_kt22), ambos del ámbito educativo anglosajón; la generalización a otros sistemas educativos o idiomas no está validada.
- Sin referencias publicadas comparables: la tabla de resultados no incluye valores de referencia publicados (columna "published reference" vacía), lo que impide validar externamente las métricas.
- Idiomas no especificados: la model card no indica qué idiomas soporta, aunque al trabajar con registros de interacción esto tiene relevancia limitada.
- Licencia MIT: permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre el rendimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LEAP-LAB-KUS/leap-kt-advkt-2025-04
- Repositorio de archivos: https://huggingface.co/LEAP-LAB-KUS/leap-kt-advkt-2025-04/tree/main
- leap-kt-toolkit (GitHub): https://github.com/LEAP-LAB-KUS/leap-kt-toolkit
- Artículo arXiv (AdvKT): https://arxiv.org/abs/2504.04706
- LEAP Lab (Universidad Tsinghua): https://www.leaplab.ai/
- Publicaciones del LEAP Lab: https://www.leaplab.ai/publications
