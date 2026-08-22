# Daemons-Q/qsh-satellite-telemanom-esa

## Resumen

Modelo de detección de anomalías en series temporales basado en una arquitectura LSTM de dos capas con 80 unidades ocultas, diseñado específicamente para telemetría satelital. Desarrollado por Daemons-Q como parte del proyecto QSMPC-QKD-QHE-AI-Hybrid, un demo de orquestación quantum-safe que combina computación multiparte segura, distribución cuántica de claves y cifrado homomórfico. Este modelo concreto es la variante en claro para el caso de uso `satellite_comms`; el flujo cifrado utiliza un modelo destilado distinto.

El modelo se entrena con el ESA Anomaly Dataset (ESA-ADB), concretamente los canales 41-46 de la misión Mission1 en su versión «lightweight». Con solo 80.486 parámetros y una longitud de secuencia de 250 puntos, es extremadamente ligero y puede ejecutarse incluso en navegadores mediante ONNX Runtime Web. Su propósito es predecir el siguiente valor de cada canal y compararlo con el valor real para detectar desviaciones anómalas, usando un umbral dinámico no paramétrico con poda. Es un sistema de investigación, no una solución de producción, y su autor documenta de forma explícita las limitaciones de reproducibilidad de la métrica principal.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | 2 x LSTM(80) con dropout 0.3 y umbral dinámico no paramétrico con pruning |
| Parametros totales | 80.486 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 250 pasos de secuencia (entrada de 250 puntos temporales) |
| Tipos de cuantizacion | no disponible (solo se indica formato ONNX y safetensors) |
| Idiomas soportados | no aplica (modelo de series temporales, no lenguaje) |
| Licencia | CC-BY-3.0-IGO (Creative Commons Attribution 3.0 IGO) |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Telemanom clásica: dos capas LSTM de 80 unidades cada una, con una longitud de secuencia de 250 puntos temporales y dropout de 0.3. La salida se compara con la serie real para calcular el error de predicción, y se aplica un umbral dinámico no paramétrico con poda para decidir si un punto es anómalo. No se utiliza ninguna técnica de entrenamiento moderna como RLHF o DPO; es un entrenamiento supervisado estándar de regresión sobre telemetría.

Los datos de entrenamiento provienen del ESA Anomaly Dataset (ESA-ADB), concretamente de la misión Mission1 (anónima) en su versión lightweight, canales 41-46. El conjunto está licenciado bajo CC-BY-3.0-IGO y se distribuye en Zenodo (registro 12528696). El dataset contiene telemetría multi-anual, pero la duración exacta no se especifica en la documentación. Solo el 1.19% de los datos están anotados, y la misión Mission3 se excluye por trivialidad. El modelo se entrena a una cadencia de 300 segundos (5 minutos) por muestra.

El modelo se publica como parte de un demo de orquestación quantum-safe, pero el modelo en sí es un predictor de anomalías independiente. No hay innovaciones técnicas destacables más allá de la ligereza y el uso de umbral dinámico no paramétrico, que evita la calibración de un umbral fijo.

## Capacidades

- Detección de anomalías en series temporales multivariadas, centrada en telemetría de satélites.
- Generación de pronóstico a corto plazo (predicción del siguiente punto temporal) para cada canal.
- Soporte de umbral dinámico no paramétrico con pruning, que reduce falsos positivos.
- Integración con el ecosistema ONNX, lo que permite inferencia en navegador (ONNX Runtime Web) y en dispositivos edge.
- Capacidad de procesar secuencias de hasta 250 pasos temporales.
- No tiene capacidades de lenguaje natural, visión ni tool calling.

## Casos de uso

- Monitorización de telemetría de satélites en tiempo real: el modelo puede integrarse en sistemas de control de misión para detectar comportamientos anómalos en los canales de telemetría (temperaturas, voltajes, actitud) y alertar a los operadores antes de que se conviertan en fallos graves. Su baja latencia (43.2 segundos de entrenamiento en el conjunto de evaluación) permite ejecuciones frecuentes.
- Detección de fallos en subsistemas de naves espaciales: al predecir la siguiente muestra y comparar con la real, se pueden identificar desviaciones que indiquen degradación de componentes, como los propulsores o paneles solares.
- Análisis post-misión de telemetría histórica: aplicar el modelo a datos pasados para identificar eventos anómalos que no se detectaron en su momento, útil para investigaciones de incidentes.
- Pruebas de concepto en sistemas de computación segura: el modelo se usa como demostración de cómo un algoritmo de IA puede ejecutarse sobre datos cifrados (mediante homomórfico) sin perder precisión, dentro del marco QSMPC-QKD-QHE-AI-Hybrid.
- Validación de algoritmos de detección de anomalías en el sector aeroespacial: al estar publicado con métricas detalladas y código de entrenamiento, sirve como referencia para comparar otros métodos.
- Entrenamiento de estudiantes destilados: el modelo actúa como maestro para generar una versión más pequeña que se ejecuta sobre datos cifrados, útil para escenarios de privacidad.

## Benchmarks y rendimiento

La model card proporciona las siguientes métricas medidas en el propio repositorio (evaluación sobre el último 30% de la misión, con una ventana de 3 eventos anotados):

| Métrica | Valor |
|---|---|
| Anomaly sample rate | 0.0075528 |
| Event-wise F0.5 | 0.454545 |
| Event-wise FN | 2 |
| Event-wise FP | 1 |
| Event-wise TP | 1 |
| N. anomalías intervals | 320 |
| N. eventos evaluados | 3 |
| N. parámetros | 80486 |
| Point-adjusted F1 | 0.993691 |
| Published full-channel F0.5 | 0.061 |
| Published lightweight F0.5 | 0.786 |
| Wall clock (s) | 43.2 |
| Windowed iForest event-wise F0.5 | 0.000248 |

El baseline publicado por ESA-ADB para el mismo subconjunto (Mission1 lightweight, canales 41-46) es de 0.968 de event-wise F0.5 (corregido). El autor indica que hay tres diferencias de protocolo (multiplicación por el TNR, división de la misión en mitades vs. último 30%, y número de eventos anotados) que hacen que la comparación directa no sea válida. Además, la métrica event-wise F0.5 no es reproducible entre entrenamientos idénticos (variación de 0.4545 a 0.714286), mientras que el point-adjusted F1 sí es estable (0.9937 vs 0.9945). El isolation forest con ventana obtiene un event-wise F0.5 de 0.000248, muy inferior, lo que indica que el modelo LSTM supera claramente al baseline trivial.

## Requisitos de hardware

- Al tener solo 80.486 parámetros, la inferencia es extremadamente ligera y se puede ejecutar en CPU sin GPU.
- La VRAM requerida es inferior a 1 MB; cabe en cualquier GPU moderna, incluso integradas.
- Se puede ejecutar en el navegador mediante ONNX Runtime Web, sin necesidad de servidor.
- Opciones de despliegue: vLLM no aplica (no es un modelo de lenguaje), pero sí llama.cpp (aunque es para LLM, no es relevante), ONNX Runtime, ONNX.js, TensorFlow Lite. Se recomienda usar ONNX Runtime para la integración con el proyecto quantum-safe.
- Latencia: el autor mide 43.2 segundos de tiempo de procesamiento en la evaluación completa (441,600 puntos), lo que equivale a aproximadamente 0.1 ms por muestra. En un navegador puede ser algo mayor, pero sigue siendo despreciable.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Event-wise F0.5 | Licencia |
|---|---|---|---|---|
| qsh-satellite-telemanom-esa (este) | 80.486 | 250 | 0.4545 (medido, inestable) | CC-BY-3.0-IGO |
| Telemanom original (khundman) | no disponible | no disponible | no publicado | MIT |
| Telemanom-ESA (kplabs-pl) | no disponible | no disponible | 0.968 (baseline ESA-ADB) | no disponible |
| Isolation Forest con ventana (baseline trivial) | no disponible | no disponible | 0.000248 | no disponible |

El modelo supera al isolation forest en la métrica event-wise, pero está muy por debajo del baseline de ESA-ADB (0.968) debido a las diferencias de protocolo mencionadas. No hay otros modelos comparables en el mismo tamaño y tarea.

## Limitaciones y advertencias

- El modelo es un prueba de concepto de investigación, no un sistema de producción. El autor lo declara explícitamente.
- La métrica principal (event-wise F0.5) no es reproducible entre entrenamientos idénticos; el autor lo atribuye a la inestabilidad de las métricas basadas en solapamiento, según arXiv:2607.11969 (2026-07). Por tanto, cualquier comparación con baselines debe interpretarse con cautela.
- El conjunto de evaluación contiene solo 3 eventos anotados, lo que hace que las métricas sean estadísticamente poco fiables. El autor recomienda siempre ejecutar un baseline trivial (isolation forest) para contextualizar.
- Los datos de entrenamiento tienen solo 1.19% de anotaciones, y la misión Mission3 se excluye por trivialidad. La duración exacta de la telemetría no se documenta.
- La licencia CC-BY-3.0-IGO permite uso comercial, pero requiere atribución. Sin embargo, el autor indica que el registro de Zenodo no incluye la licencia en sus metadatos REST, lo que podría generar ambigüedad legal.
- No se han publicado resultados de benchmarks comparativos con otros modelos más allá de los baselines mencionados.
- El modelo no soporta otras tareas fuera de la detección de anomalías en series temporales; no es un modelo de lenguaje ni multimodal.

## Enlaces

- Hugging Face: https://huggingface.co/Daemons-Q/qsh-satellite-telemanom-esa
- GitHub del proyecto QSMPC-QKD-QHE-AI-Hybrid: https://github.com/thedaemon-wizard/QSMPC-QKD-QHE-AI-Hybrid
- Telemanom original (khundman): https://github.com/khundman/telemanom
- Código de Telemanom-ESA en ESA-ADB: https://github.com/kplabs-pl/ESA-ADB/tree/main/TimeEval-algorithms/telemanom_esa
- DeepWiki de Telemanom-ESA: https://deepwiki.com/kplabs-pl/ESA-ADB/5.2-telemanom-esa
- Dataset ESA-ADB en Zenodo: https://zenodo.org/records/12528696
- Paper de ESA-ADB: arXiv:2406.17826
- Paper sobre inestabilidad de métricas: arXiv:2607.11969 (2026-07)
