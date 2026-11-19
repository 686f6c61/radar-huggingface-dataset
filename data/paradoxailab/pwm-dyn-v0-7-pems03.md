# paradoxailab/pwm-dyn-v0.7-pems03

## Resumen

PWM-Dyn v0.7 es un modelo de predicción de series temporales espaciotemporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model. El modelo se especializa en la predicción de los siguientes 12 pasos de tráfico en redes de sensores, con un enfoque explícito en mantener la precisión cuando se producen caídas de sensores (outages). Esta versión concreta se entrena y evalúa sobre PEMS03, un conjunto de datos de Caltrans PeMS del Distrito 3 con 358 sensores.

A diferencia de los modelos de lenguaje de gran escala, PWM-Dyn v0.7 es un modelo compacto de 341.156 parámetros, entrenado específicamente para una tarea de forecasting. Su relevancia radica en el tratamiento de un problema práctico en sistemas de tráfico reales: la pérdida de señal de sensores. Según la model card, esta versión introduce un mecanismo de "fallback base" junto con entrenamiento con outages reales, lo que reduce el error en escenarios de caída de sensores entre un 11% y un 22% respecto a v0.6 en cinco redes, con un coste de entre 0,4% y 1,8% en el error en condiciones limpias.

El modelo se distribuye como un checkpoint de PyTorch (`.pt`) con pesos y metadatos de configuración y resultados embebidos. Forma parte de una serie de 56 modelos publicados (números 01–59), de los cuales este es el número 15.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (no se detalla en la model card; el código está en el repositorio de GitHub) |
| Parametros totales | 341.156 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de series temporales) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict (`.pt`, `torch.load` con `weights_only=False`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Se sabe que es un modelo de forecasting espaciotemporal orientado a tráfico, con 341.156 parámetros, y que el código de la arquitectura está disponible en el repositorio de GitHub de ParadoxAI Lab. La configuración de entrenamiento se almacena en el propio checkpoint bajo la clave `ck['cfg']`.

El entrenamiento se realizó el 4 de noviembre de 2026 en un notebook de Kaggle (identificador `8ffe55b5c8`, versión 365414722, commit `b0f6a08`). Los datos de entrenamiento no se incluyen en el repositorio; sus fuentes y términos se documentan en `DATA_SOURCES.md`. La innovación principal de esta versión es la incorporación de entrenamiento con outages reales junto con un mecanismo de "fallback base", que mejora la robustez ante caídas de sensores. No se especifica el número de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Predicción de los siguientes 12 pasos temporales de tráfico sobre la red PEMS03 (358 sensores).
- Forecasting espaciotemporal multivariante con dependencias entre sensores.
- Robustez ante caídas de sensores (outages): entrenamiento específico para mantener la precisión cuando faltan señales.
- Evaluación en dos regímenes: condiciones limpias (clean) y outages reales (Track G).
- Distribución como checkpoint autocontenido con metadatos, configuración y resultados embebidos.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión, audio ni modo de razonamiento extendido, por no tratarse de un modelo de lenguaje.

## Casos de uso

- Predicción de tráfico a corto plazo en autopistas: el modelo genera los próximos 12 pasos de tráfico a partir de las lecturas de 358 sensores, adecuado para sistemas de gestión de tráfico en tiempo real del Distrito 3 de Caltrans.
- Tolerancia a fallos en redes de sensores: cuando uno o varios sensores dejan de reportar, el mecanismo de fallback y el entrenamiento con outages permiten mantener predicciones utilizables, reduciendo el error entre un 11% y un 22% frente a la versión anterior.
- Planificación de capacidad y detección de congestión: las predicciones a 12 pasos permiten anticipar cuellos de botella y activar protocolos de gestión de tráfico.
- Investigación en forecasting espaciotemporal: el checkpoint incluye configuración y resultados, lo que facilita la reproducibilidad y la comparación con otras variantes de la serie PWM-Dyn.
- Integración en pipelines de simulación de tráfico: el modelo puede alimentar simuladores que necesiten predicciones a corto plazo bajo condiciones de datos incompletos.
- Evaluación comparativa de robustez: el régimen Track G (outages reales) permite medir la degradación de modelos de forecasting en escenarios de pérdida de señal, útil para benchmarking académico.

## Benchmarks y rendimiento

Resultados registrados en la model card (ParadoxBench-1.2, ensemble de 3 semillas; este archivo corresponde a la semilla 200):

| Metrica | Resultado |
|---|---|
| MAE clean | 14.60 |
| MAE real outages (Track G) | 18.39 |

Mejora declarada respecto a v0.6: reducción del error en outages reales de entre 11% y 22% en cinco redes, con un incremento del error en condiciones limpias de entre 0,4% y 1,8%. No se proporcionan resultados de benchmarks estándar de forecasting (por ejemplo, MAE/RMSE por horizonte, comparativas con baselines como STGCN o Graph WaveNet) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint ocupa 1.399.041 bytes (aproximadamente 1,4 MB) y el modelo tiene 341.156 parámetros.
- GPU recomendadas: cualquier GPU moderna; el modelo cabe holgadamente en GPUs de consumo (por ejemplo, RTX 3060, RTX 4090) e incluso puede ejecutarse en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1 GB de memoria; también en CPU.
- Opciones de despliegue: PyTorch nativo mediante `torch.load` y el código de arquitectura del repositorio de GitHub; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la información proporcionada. La única comparación disponible es con la versión anterior de la misma familia:

| Modelo | Parametros | Contexto | MAE clean | MAE outages | Licencia |
|---|---|---|---|---|---|
| PWM-Dyn v0.7 (PEMS03) | 341.156 | No disponible | 14.60 | 18.39 | Apache-2.0 |
| PWM-Dyn v0.6 | No disponible | No disponible | No disponible | No disponible (mejora del 11–22% en outages) | Apache-2.0 |

## Limitaciones y advertencias

- Modelo específico para PEMS03 (358 sensores del Distrito 3 de Caltrans); no se garantiza su generalización a otras redes sin reentrenamiento.
- El rendimiento en outages reales (MAE 18.39) es notablemente peor que en condiciones limpias (MAE 14.60), lo que refleja la dificultad intrínseca del escenario.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado con datos de tráfico de una región concreta, puede heredar sesgos de la fuente de datos.
- Riesgo de alucinación no aplicable en el sentido de modelos de lenguaje, pero sí existe riesgo de predicciones erróneas ante patrones de tráfico no vistos.
- Los datos de entrenamiento no se incluyen; su disponibilidad y términos deben consultarse en `DATA_SOURCES.md`.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda revisar los términos de las fuentes de datos subyacentes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo es de 0,0 GB (solo el checkpoint), por lo que no hay validación comunitaria independiente.
- La arquitectura no se describe en la model card; para reproducir la inferencia es necesario consultar el repositorio de GitHub.

## Enlaces

- Hugging Face: https://huggingface.co/paradoxailab/pwm-dyn-v0.7-pems03
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Resultados: https://github.com/paradoxailab/paradox-world-model/blob/main/RESULTS.md
- README de v0.7 realworld: https://github.com/paradoxailab/paradox-world-model/blob/main/v0.7-realworld/README.md
- Índice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior: https://huggingface.co/paradoxailab/pwm-dyn-v0.7-pems04
- Modelo siguiente: https://huggingface.co/paradoxailab/pwm-dyn-v0.7-pems07
- Todos los modelos: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio web: https://paradoxailab.com
