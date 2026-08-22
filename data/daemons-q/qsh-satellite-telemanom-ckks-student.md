# Daemons-Q/qsh-satellite-telemanom-ckks-student

## Resumen

El modelo `qsh-satellite-telemanom-ckks-student` es un clasificador lineal de regresión logística diseñado para la detección de anomalías en telemetría de satélites, destilado específicamente para poder ejecutarse bajo cifrado homomórfico CKKS. Forma parte del proyecto QSMPC-QKD-QHE-AI-Hybrid, un demo de orquestación quantum-safe que combina computación multiparte segura, distribución de claves cuánticas y cifrado homomórfico para escenarios de comunicaciones por satélite. El modelo es el "nivel cifrado" del sistema: el profesor en texto plano es un modelo LSTM de Telemanom con 80.486 parámetros, mientras que el estudiante tiene solo 49 parámetros, lo que permite su evaluación bajo CKKS con coste computacional asumible.

La relevancia de este modelo reside en su enfoque de privacidad preservada: permite detectar anomalías en telemetría sin exponer los datos sin cifrar, un requisito crítico en infraestructuras espaciales donde los datos de telemetría pueden ser sensibles o clasificados. Está publicado como un proof of concept de investigación, no como un sistema de producción, y sus métricas deben leerse en comparación con su profesor, no contra la literatura general de detección de anomalías.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Regresión logística lineal sobre ventanas de canal x timestep |
| Parámetros totales | 49 |
| Parámetros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (modelo de ventana fija: 8 timesteps x 6 canales) |
| Tipos de cuantización | No disponible (formato ONNX, no GGUF) |
| Idiomas soportados | No disponible (modelo numérico, sin procesamiento de lenguaje) |
| Licencia | CC-BY-3.0-IGO (declarada como "other" en el YAML) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es una regresión logística lineal que opera sobre una ventana de los últimos 8 timesteps y 6 canales de telemetría, es decir, una entrada de 48 valores. Se entrena directamente sobre los valores brutos (`flat_te`) sin escalado, según indica el autor. Es un modelo destilado de un profesor LSTM (Telefonam) de 80.486 parámetros, que se entrena sobre el dataset ESA Anomaly Dataset (ESA-ADB), Mission1 lightweight, canales 41-46. El proceso de destilación busca replicar las predicciones del profesor con un modelo lineal de 49 parámetros, lo que permite su ejecución bajo cifrado homomórfico CKKS, donde las operaciones son mucho más costosas que en texto plano.

El dataset de entrenamiento es el ESA-ADB (Kotowski et al., arXiv:2401.17826), con licencia CC-BY-3.0-IGO, descargado del registro Zenodo 12528696. El modelo se evalúa sobre el último 30% de la telemetría de la misión, mientras que la metodología original de ESA-ADB divide cada misión por la mitad. Esta diferencia de protocolo, junto con el hecho de que el dataset tiene solo 1.19% de etiquetas anotadas, hace que las métricas deban interpretarse con cautela.

## Capacidades

- Detección de anomalías en series temporales multivariadas de telemetría satelital (6 canales, ventana de 8 timesteps).
- Ejecución bajo cifrado homomórfico CKKS, lo que permite inferencia sobre datos cifrados sin exponerlos en claro.
- Compatible con ONNX Runtime Web para evaluación en navegador, aunque el modelo no incluye una muestra de evaluación en navegador (la métrica event-wise F0.5 no se puede calcular sobre filas independientes).
- No requiere escalado de entrada (se usa la telemetría bruta).
- No incluye capacidades de lenguaje, tool calling, generación de texto ni razonamiento simbólico.

## Casos de uso

- Monitorización de telemetría satelital con privacidad preservada: el modelo puede evaluar datos cifrados en un entorno compartido sin exponer los valores crudos a la entidad que ejecuta la inferencia.
- Demostración de pipelines de cifrado homomórfico en IA: sirve como ejemplo de cómo destilar un modelo grande a uno pequeño para viabilizar inferencia CKKS en escenarios de baja latencia.
- Detección de anomalías en comunicaciones satelitales: identifica desviaciones en los canales 41-44 de la misión Mission1, útiles para alertar a operadores de estaciones terrestres.
- Evaluación de protocolos de comparación de métricas: el modelo incluye un análisis detallado de las diferencias entre métricas (event-wise F0.5, precisión, recall) que puede servir como guía para otros proyectos de detección de anomalías.
- Investigación en destilación de modelos para cifrado homomórfico: demuestra que un modelo de 49 parámetros puede replicar parcialmente un profesor de 80.486 parámetros con un acuerdo del 0.9987.
- Benchmarking de compatibilidad de ONNX Runtime Web: permite probar la ejecución de modelos ONNX pequeños en navegadores para escenarios de telemetría.

## Benchmarks y rendimiento

La model card reporta las siguientes métricas medidas sobre la partición de test descrita:

| Métrica | Valor |
|---|---|
| Acuerdo con el profesor (agreement) | 0.998677 |
| Desacuerdo en positivos (disagreement_on_positives) | 0.142857 |
| Delta de métrica (metric_delta) | -0.003234 |
| Delta de métrica en puntos porcentuales (metric_delta_pp) | -0.3234 |
| Número de unidades de evaluación (n_eval) | 307601 |
| Unidades de puntuación (n_scoring_units) | 2 |
| Métrica del estudiante (student_metric) | 0.003234 |
| Parámetros del estudiante | 49 |
| Métrica del profesor (teacher_metric) | 0.0 |
| Parámetros del profesor | 80486 |

La métrica objetivo es event-wise F0.5. El profesor obtiene 0.0 en esta métrica sobre la partición evaluada, y el estudiante 0.0032, por lo que el acuerdo del 0.9987 es un acuerdo sobre encontrar casi nada. El modelo se compara con el baseline ESA-ADB de la tabla suplementaria 9 (Mission1 lightweight, ch. 41-46), que reporta un event-wise F0.5 de 0.968 (precisión 0.999, recall 0.862) para detección de anomalías. Sin embargo, hay tres diferencias de protocolo: (1) ESA-ADB multiplica la precisión por la tasa de verdaderos negativos a nivel temporal, (2) ESA-ADB divide la misión en dos mitades mientras este modelo prueba sobre el último 30%, y (3) ESA-ADB tiene 29 anomalías anotadas en la partición de test frente a solo 3 en la ventana evaluada aquí. Por tanto, el baseline es indicativo, no comparable directamente.

## Requisitos de hardware

- El modelo tiene solo 49 parámetros, por lo que la inferencia es trivial en cualquier CPU moderna, incluso en un navegador con ONNX Runtime Web.
- No requiere GPU. Puede ejecutarse en un microcontrolador o en un servidor sin aceleración.
- VRAM estimada: inferior a 1 MB en formato ONNX (el repositorio tiene un tamaño de 0.0 GB en Hugging Face).
- Opciones de despliegue: ONNX Runtime (CPU), ONNX Runtime Web (navegador), cualquier runtime que soporte ONNX.
- Latencia estimada: inferior a 1 ms por inferencia en CPU estándar, aunque la latencia real dependerá de la operación CKKS, que es mucho más costosa. No se proporcionan medidas de latencia CKKS en la información disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Uso |
|---|---|---|---|---|---|
| qsh-satellite-telemanom-ckks-student | Regresión logística lineal | 49 | Ventana 8x6 | CC-BY-3.0-IGO | Inferencia bajo cifrado CKKS |
| qsh-satellite-telemanom-esa (profesor) | LSTM (2 capas, 80 unidades) | 80.486 | Secuencia 250 | CC-BY-3.0-IGO | Inferencia en texto plano |
| Telemanom original (khundman) | LSTM (2 capas, 80 unidades) | No disponible | Secuencia 250 | No disponible | Detección de anomalías en telemetría de Marte y SMAP |

El estudiante es el único de los tres que está diseñado para ejecutarse bajo cifrado homomórfico. El profesor (qsh-satellite-telemanom-esa) es su contraparte en texto plano y se entrena con el mismo dataset. El framework original de Telemanom (khundman) no está directamente comparado con este modelo porque usa datos de las misiones MSL y SMAP, no el ESA-ADB.

## Limitaciones y advertencias

- Es un proof of concept de investigación, no un sistema de producción. Las métricas son bajas (event-wise F0.5 de 0.0032) y la detección de anomalías es muy limitada.
- El modelo no tiene evaluación en navegador publicada, y la métrica event-wise F0.5 no se puede calcular sobre filas independientes, lo que dificulta su verificación con herramientas de evaluación estándar.
- El dataset ESA-ADB tiene solo 1.19% de anotaciones y la ventana de prueba contiene solo 3 anomalías, lo que hace que las métricas tengan una base estadística muy débil.
- La licencia del dataset es CC-BY-3.0-IGO, pero el repositorio Zenodo no la incluye en sus metadatos REST, lo que puede crear incertidumbre legal sobre el uso del dataset.
- La licencia del modelo se declara como "other" en el YAML con nombre "cc-by-3.0-igo", lo que no es una licencia estándar de modelos de IA y puede requerir revisión legal para uso comercial.
- No hay soporte para tool calling, agentes ni capacidades de lenguaje natural; es un modelo puramente numérico de detección de anomalías.
- Las métricas de rendimiento dependen del protocolo de evaluación específico y no son directamente comparables con los benchmarks de la literatura general de detección de anomalías.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Daemons-Q/qsh-satellite-telemanom-ckks-student
- HuggingFace del profesor (texto plano): https://huggingface.co/Daemons-Q/qsh-satellite-telemanom-esa
- Repositorio del proyecto QSMPC-QKD-QHE-AI-Hybrid: https://github.com/thedaemon-wizard/QSMPC-QKD-QHE-AI-Hybrid
- Paper del dataset ESA-ADB: arXiv:2401.17878
- Dataset ESA-ADB en Zenodo: https://zenodo.org/records/12528696
- Framework Telemanom original: https://github.com/khundman/telemanom
- Paper original de Telemanom: arXiv:1802.04431
