# paradoxailab/pwm-w-v1.0-wmo

## Resumen

PWM-W v1.0 WMO es un modelo de predicción de series temporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model. Concretamente, se trata de la entrega número 33 de la serie y el modelo 31 de los 56 publicados. Su tarea es la previsión de las próximas 24 horas de temperatura, humedad y viento a partir de datos de estaciones sinópticas de la Organización Meteorológica Mundial (WMO) en la India, obtenidos del Integrated Surface Database (ISD) de la NOAA.

El modelo es extremadamente compacto: 1.260.997 parámetros, empaquetado en un único fichero PyTorch de aproximadamente 5,17 MB. Esta escala reducida lo sitúa en la categoría de modelos ligeros para forecasting, aptos para inferencia en CPU y para despliegues con requisitos de hardware mínimos. La versión se entrenó el 9 de noviembre de 2026 en un entorno de Kaggle (ejecución `pwm-v10`) y se publicó el 17 de noviembre de 2026.

La relevancia de esta ficha es doble: por un lado, documenta un modelo de forecasting meteorológico regional de código abierto (Apache-2.0); por otro, la model card es notablemente incompleta (no se registran resultados de benchmarks ni métricas de rendimiento), lo que limita seriamente su evaluación objetiva. Además, el repositorio de Hugging Face muestra un tamaño de 0.0 GB y cero descargas, lo que sugiere una publicación reciente o un problema de empaquetado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card menciona un "ensemble de dos arquitecturas" para esta versión, sin detallar) |
| Parámetros totales | 1.260.997 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en formato PyTorch nativo, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (la tarea es numérica/series temporales, no NLP) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`33_pwm-w_v1.0_wmo.pt`, state dict dentro de un dict con claves `meta`, `weights`, `results`, `cfg`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Indica que esta versión introduce "autocorrección y un ensemble de dos arquitecturas (adoptado solo si es >2 sigma mejor)" como cambio respecto a la versión anterior. No se especifica qué dos arquitecturas componen el ensemble, ni la naturaleza del mecanismo de autocorrección. El código de arquitectura se remite al repositorio de GitHub del proyecto, rama `delhi-v1.0`.

Los datos de entrenamiento son observaciones de estaciones sinópticas WMO en la India, extraídas del dataset ISD de la NOAA. No se indica el número de estaciones, el rango temporal, el número de tokens/pasos de entrenamiento, ni si se aplicó algún tipo de regularización o validación. Tampoco se documenta el proceso de entrenamiento (optimizador, función de pérdida, épocas). La configuración de entrenamiento se almacena en el propio fichero (`ck['cfg']`), pero no se reproduce en la model card.

## Capacidades

- Predicción de series temporales meteorológicas: temperatura, humedad y viento a 24 horas vista.
- Forecasting espacio-temporal sobre estaciones sinópticas georreferenciadas en la India.
- Ensemble de dos arquitecturas con criterio estadístico de adopción (>2 sigma).
- Mecanismo de autocorrección (no detallado).
- No se documentan capacidades de generación de texto, código, matemáticas, visión, audio, tool calling, agentes ni multilingüismo; el modelo no es de propósito general.
- No se documenta soporte de function calling ni de razonamiento multi-paso.

## Casos de uso

- Predicción meteorológica operativa regional en la India: el modelo puede generar previsiones a 24 h de temperatura, humedad y viento para estaciones WMO, útil para servicios meteorológicos locales con recursos computacionales limitados.
- Relleno de huecos en series históricas: dada su tarea de forecasting sobre estaciones sinópticas, puede emplearse para imputar observaciones faltantes en archivos ISD, siempre que se valide contra datos retenidos.
- Investigación en modelos ligeros de forecasting: con 1,26 M de parámetros y 5,17 MB de pesos, es un candidato para experimentos de destilación, comparación de arquitecturas o estudios de eficiencia en series temporales.
- Despliegue en dispositivos de borde: el tamaño reducido permite inferencia en CPU, Raspberry Pi o entornos sin GPU, adecuado para estaciones meteorológicas automatizadas con conectividad limitada.
- Generación de features meteorológicas para pipelines aguas abajo: las predicciones a 24 h pueden alimentar modelos de demanda energética, agricultura o logística que necesiten variables meteorológicas exógenas.
- Docencia y prototipado: como ejemplo reproducible de pipeline completo (descarga de pesos, carga con `torch.load`, acceso a `meta`/`weights`/`results`/`cfg`) para cursos de series temporales.
- Benchmarking de forecasting espacio-temporal: sirve como baseline ligero frente a modelos más grandes (GraphCast, Pangu-Weather, FourCastNet) en el subconjunto de estaciones indias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica explícitamente: "no result recorded in the delhi-v1.0 README". No hay métricas de RMSE, MAE, MAPE ni comparaciones con baselines (persistencia, climatología, modelos numéricos). Tampoco se documenta el conjunto de test ni el periodo de validación.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (5,17 MB de pesos más estado del optimizador y buffers; en la práctica cabe en cualquier GPU consumer).
- GPU recomendadas: no se requiere GPU; cualquier GPU con ≥1 GB de VRAM es suficiente (GTX 1050, RTX 3050, etc.). Para entrenamiento, una GPU consumer básica basta.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos 1 GB de VRAM; también en CPU.
- Opciones de despliegue: PyTorch nativo (`torch.load`); no se publican variantes GGUF, ONNX, TorchScript ni integraciones con vLLM, llama.cpp, Ollama o TGI (estas herramientas están orientadas a LLM y no aplican).
- Latencia y throughput estimados: no disponibles. Dado el tamaño, se espera latencia de milisegundos en CPU para un batch pequeño, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-W v1.0 WMO | 1.260.997 | no disponible | Forecasting meteorológico 24 h (India) | Apache-2.0 | Hugging Face + GitHub |
| GraphCast (DeepMind) | ~36 M | no aplica (grid global) | Forecasting meteorológico global | no disponible en la información | Pesos publicados por DeepMind |
| Pangu-Weather (Huawei) | ~256 M | no aplica (grid global) | Forecasting meteorológico global | no disponible en la información | Pesos publicados por Huawei |
| FourCastNet (NVIDIA) | ~75 M | no aplica (grid global) | Forecasting meteorológico global | no disponible en la información | Pesos publicados por NVIDIA |

Los tres modelos comparables son de escala global y resolución de rejilla, mientras que PWM-W se limita a estaciones puntuales de la India; no son directamente intercambiables. No se dispone de métricas de PWM-W para comparar rendimiento.

## Limitaciones y advertencias

- Ausencia total de métricas: no hay RMSE, MAE ni comparación con baselines; imposible evaluar si el modelo supera a la persistencia o a la climatología.
- Cobertura geográfica restringida: solo estaciones WMO de la India; no se garantiza extrapolación a otras regiones.
- Horizonte limitado: únicamente 24 horas; no apto para previsiones a medio o largo plazo.
- Variables limitadas: solo temperatura, humedad y viento; no precipita ción, presión, radiación ni otras variables.
- Arquitectura no documentada: se desconoce la naturaleza del ensemble y del mecanismo de autocorrección, lo que dificulta la reproducibilidad.
- Datos de entrenamiento no incluidos: solo se enlazan fuentes y términos en `DATA_SOURCES.md`; no se especifica el periodo, número de estaciones ni calidad de los datos.
- Riesgo de sobreajuste a estaciones concretas: con 1,26 M de parámetros y datos ISD, es plausible un sobreajuste a la red de estaciones india; no hay validación cruzada publicada.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso o validación por parte de la comunidad.
- Tamaño del repo en Hugging Face reportado como 0.0 GB pese a un fichero de 5,17 MB: posible inconsistencia de empaquetado o metadatos.
- Licencia Apache-2.0 permite uso comercial, pero la falta de benchmarks hace arriesgado su uso en producción sin validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paradoxailab/pwm-w-v1.0-wmo
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Rama de la versión: https://github.com/paradoxailab/paradox-world-model/blob/delhi-v1.0/README.md
- Índice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#32): https://huggingface.co/paradoxailab/pwm-w-v1.0-metar
- Modelo siguiente (#35): https://huggingface.co/paradoxailab/pwm-f-encoder-v2.0
- Serie completa: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
