# FelipeJMcd/service-anomaly-detector

## Resumen

`service-anomaly-detector` es un artefacto de machine learning publicado en Hugging Face por el usuario FelipeJMcd (repositorio GitHub asociado: `fjahnm/service-anomaly-ml`). No es un modelo de lenguaje ni una red neuronal profunda: es un pipeline de `scikit-learn` compuesto por un `StandardScaler` y un `IsolationForest` de 200 árboles entrenado para puntuar patrones inusuales de utilización de CPU en una serie temporal histórica de AWS EC2. El autor lo etiqueta explícitamente como prototipo de investigación y demostración metodológica.

El modelo aborda el problema clásico de detección de anomalías no supervisada en telemetría de servicios: dado un flujo de mediciones de CPU cada cinco minutos, construir siete características (valor actual, deltas, medias y desviaciones móviles sobre las 12 observaciones previas) y asignar una puntuación de rareza mediante `-model.score_samples(X)`. La alerta se dispara cuando la puntuación supera el percentil 98 de las puntuaciones de entrenamiento.

Su relevancia es limitada y de carácter educativo: el propio autor reconoce que en la única serie evaluada un baseline de mediana móvil produjo menos alertas fuera de ventana (9 frente a 23) con el mismo recall de eventos (2/2). No hay benchmarks oficiales NAB, ni latencias, ni validación cruzada entre conjuntos de datos, ni licencia definida. El repositorio ocupa 0,0 GB y registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline `scikit-learn`: `StandardScaler` + `IsolationForest` (200 árboles, `random_state=42`) |
| Parametros totales | no disponible (no aplica; modelo basado en árboles, no en pesos neuronales) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana fija de 12 observaciones previas para calcular características móviles) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en (inglés, según metadatos de la model card) |
| Licencia | no disponible (el autor indica que aún no ha seleccionado licencia) |
| Formato de pesos | `isolation_forest.skops` (serialización skops; no es un checkpoint Transformers ni GGUF/safetensors) |

## Arquitectura y entrenamiento

El modelo no es un transformer ni una red neuronal: es un `IsolationForest` con 200 estimadores que aísla observaciones mediante particiones aleatorias; las anomalías requieren menos particiones para quedar aisladas y reciben puntuaciones más altas. Precede al bosque un `StandardScaler` ajustado únicamente sobre la porción de entrenamiento para evitar fuga de información. Las siete características de entrada, en orden estricto, son `value`, `delta_1`, `abs_delta_1`, `past_mean_12`, `past_std_12`, `past_median_12` y `abs_deviation_past_median`; todas las móviles usan exclusivamente las 12 observaciones anteriores (una hora con muestreo de cinco minutos).

Los datos provienen del Numenta Anomaly Benchmark (NAB), concretamente la serie `realAWSCloudwatch/ec2_cpu_utilization_24ae8d.csv`, con ventanas de evaluación en `labels/combined_windows.json`. De 4.032 mediciones originales se descartaron 12 al generar características históricas, quedando 2.814 observaciones de entrenamiento y 1.206 de test en división cronológica 70/30 sin barajado. El umbral de alerta es el percentil 98 de las puntuaciones de entrenamiento y se almacena, junto con los hashes SHA-256 de datos y etiquetas, en `experiment.json`. No se documenta RLHF, DPO ni ningún proceso de ajuste supervisado.

## Capacidades

- Detección de anomalías no supervisada sobre series temporales univariantes de utilización de CPU.
- Puntuación de rareza continua mediante `-model.score_samples(X)`, comparable contra un umbral configurable.
- Ingeniería de características móviles (media, desviación típica, mediana y desviación absoluta sobre ventana de 12 pasos).
- Reproducibilidad completa del experimento mediante los comandos `python -m service_anomaly_ml.train` y `python -m service_anomaly_ml.evaluate` del repositorio GitHub.
- Inspección previa de tipos no confiables en artefactos skops mediante `skops.io.get_untrusted_types`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: no es un modelo generativo.

## Casos de uso

- Demostración metodológica en cursos o artículos: el pipeline reproduce de principio a fin un experimento de detección de anomalías con datos públicos de NAB, útil para enseñar partición cronológica, escalado sin fuga y selección de umbral por percentil.
- Comparación de baselines: el autor incluye un baseline de mediana móvil con métricas paralelas, lo que permite ilustrar cómo un método simple puede igualar el recall de eventos con menos alertas fuera de ventana.
- Experimentación con ingeniería de características: las siete features están documentadas y ordenadas, lo que facilita probar variantes (ventanas mayores, otras estadísticas móviles) y medir su impacto en la tasa de alertas.
- Prototipado de detección de anomalías en telemetría propia: sirve como esqueleto para adaptar el pipeline a otras series de CPU o métricas de infraestructura, siempre que se reentrene y valide con datos propios.
- Auditoría de seguridad de artefactos: el flujo de inspección con `skops.io.get_untrusted_types` y carga con lista de tipos de confianza sirve como ejemplo de manejo prudente de modelos serializados de terceros.
- Reproducción de resultados académicos: permite verificar las cifras publicadas en la model card (2/2 ventanas detectadas, 23 puntos de alerta fuera de ventana, tasa de alerta del 3,8143 %) usando los hashes y el umbral guardados.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card para la única serie evaluada (`realAWSCloudwatch/ec2_cpu_utilization_24ae8d.csv`):

| Metrica | Isolation Forest | Baseline mediana movil |
|---|---:|---:|
| Ventanas anotadas detectadas | 2/2 | 2/2 |
| Recall de eventos a nivel de ventana | 1,0 | 1,0 |
| Puntos de alerta fuera de ventana | 23 | 9 |
| Episodios de alerta fuera de ventana | 9 | 9 |
| Puntos de alerta totales en test | 46 | 21 |
| Tasa de alerta en test | 3,8143 % | 1,7413 % |

El autor advierte que el recall se basa en solo dos eventos, que no es puntuación oficial NAB y que no se declaran F1 puntual, precisión, latencia de inferencia, precisión en producción ni generalización entre conjuntos de datos. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de modelos de lenguaje, ya que no aplica.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU y su huella en memoria es de kilobytes a pocos megabytes (200 árboles poco profundos sobre siete características).
- GPU recomendadas: no aplica; no se requiere GPU.
- Cabe en cualquier equipo consumer, incluidos portátiles de gama baja y entornos sin acelerador.
- Despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI. Se carga con `skops.io` en Python y se sirve, si se desea, mediante un microservicio propio (Flask, FastAPI) que reconstruya las siete características antes de puntuar.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `service-anomaly-detector` (FelipeJMcd) | Isolation Forest sobre 7 features | no aplica | ventana fija de 12 pasos | no disponible | Hugging Face, 0 descargas |
| Baseline de mediana móvil (incluido en el mismo repo) | Regla estadística | no aplica | ventana fija de 12 pasos | no disponible | Código en GitHub |
| Otros detectores NAB (HTM, Twitter ADVec, etc.) | Varios | no disponible | no disponible | según proyecto | Repositorio NAB |

No se dispone de información sobre otros modelos publicados en Hugging Face directamente comparables en tarea y formato dentro de la documentación proporcionada.

## Limitaciones y advertencias

- El autor la califica como prototipo de investigación y prohíbe explícitamente su uso para paginación de incidentes en producción, decisiones financieras, médicas o de seguridad, y diagnóstico automático de causa raíz.
- El recall de eventos se calcula sobre solo dos eventos anotados; no es una estimación fiable de rendimiento general.
- En la única serie evaluada, el baseline de mediana móvil generó menos alertas fuera de ventana (9 frente a 23); el propio autor señala que esto no implica superioridad universal del baseline.
- Los puntos fuera de ventana son proxies relativos a la anotación, no falsos positivos confirmados manualmente.
- No hay validación en otras fuentes de telemetría, regímenes temporales ni entornos de infraestructura; el riesgo de deriva de distribución temporal es alto.
- La licencia no está seleccionada: no debe asumirse ningún permiso de uso comercial ni de redistribución. El dataset NAB subyacente tiene su propia licencia, que debe consultarse por separado.
- Riesgo de deserialización insegura: `sklearn.tree._tree.Tree` usa índices de nodo en bruto y archivos malformados pueden provocar fallos o problemas de seguridad de memoria incluso con el tipo marcado como confiable. No cargar artefactos de origen desconocido.
- El modelo requiere 12 mediciones previas para construir las características; un valor aislado de `value` no es entrada suficiente.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre una única serie de AWS, puede sobrerrepresentar patrones específicos de ese entorno.

## Enlaces

- Hugging Face: https://huggingface.co/FelipeJMcd/service-anomaly-detector
- Repositorio GitHub del proyecto: https://github.com/fjahnm/service-anomaly-ml
- Numenta Anomaly Benchmark (NAB): https://github.com/numenta/NAB
- Paper de referencia: Ahmad, S., Lavin, A., Purdy, S., & Agha, Z. (2017). *Unsupervised real-time anomaly detection for streaming data*. Neurocomputing. https://doi.org/10.1016/j.neucom.2017.04.070
