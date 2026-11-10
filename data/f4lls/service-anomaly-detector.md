# F4lls/service-anomaly-detector

## Resumen

Service Anomaly ML es un pipeline de deteccion de anomalias no supervisado publicado en Hugging Face por el usuario F4lls bajo el identificador `F4lls/service-anomaly-detector`. No es un modelo de lenguaje ni una red neuronal: se trata de un artefacto de `scikit-learn` que combina un `StandardScaler` con un `IsolationForest` de 200 arboles para puntuar patrones inusuales de utilizacion de CPU en una serie temporal historica de AWS EC2.

El modelo se entrena sobre la serie `realAWSCloudwatch/ec2_cpu_utilization_24ae8d.csv` del Numenta Anomaly Benchmark (NAB), con 4.032 mediciones originales reducidas a 4.020 tras eliminar 12 muestras durante la generacion de caracteristicas historicas. La particion es cronologica 70/30 (2.814 observaciones de entrenamiento y 1.206 de test), sin barajado, y utiliza siete caracteristicas derivadas de una ventana de 12 observaciones previas (una hora con muestreo cada cinco minutos).

El propio autor lo etiqueta como prototipo experimental de investigacion y portafolio, no como un monitor de fiabilidad para produccion ni como un detector causal de fallos. Su relevancia es metodologica: sirve como ejemplo reproducible de ingenieria de caracteristicas y comparacion de detectores de anomalias sobre datos de streaming, no como componente listo para despliegue operativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline `scikit-learn`: `StandardScaler` + `IsolationForest` (200 arboles, `random_state=42`) |
| Parametros totales | no disponible (no es un modelo neuronal; 200 estimadores de arbol) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de 12 observaciones previas para caracteristicas rolling |
| Tipos de cuantizacion | no disponible (no aplica a este tipo de artefacto) |
| Idiomas soportados | en (metadatos; el modelo no procesa lenguaje) |
| Licencia | no disponible (el autor no ha seleccionado licencia; la del dataset NAB es independiente) |
| Formato de pesos | `isolation_forest.skops` (serializacion skops, no es un checkpoint de Transformers) |

## Arquitectura y entrenamiento

El artefacto implementa un detector de anomalias clasico basado en aislamiento: un `IsolationForest` con 200 arboles aleatorios que aisla observaciones mediante particiones sucesivas; cuanto menor es el numero de particiones necesarias para aislar un punto, mas anomala se considera la observacion. La puntuacion se calcula como `-model.score_samples(features)`, de modo que valores mas altos indican mayor rareza. El umbral de alerta se fija en el percentil 98 de las puntuaciones de anomalia del conjunto de entrenamiento, y tanto el umbral exacto como los hashes SHA-256 de datos y etiquetas se almacenan en `experiment.json`.

El preprocesado incluye un `StandardScaler` ajustado unicamente sobre la porcion de entrenamiento para evitar filtracion de informacion. Las siete caracteristicas de entrada, en orden estricto, son `value`, `delta_1`, `abs_delta_1`, `past_mean_12`, `past_std_12`, `past_median_12` y `abs_deviation_past_median`. Todas las caracteristicas rolling se calculan exclusivamente con las 12 observaciones anteriores, sin usar muestras futuras. La particion es cronologica 70/30 sin barajado. No se emplea RLHF, DPO ni ningun proceso de ajuste por preferencias, ya que no es un modelo generativo.

## Capacidades

- Deteccion de anomalias no supervisada sobre series temporales univariantes de utilizacion de CPU.
- Puntuacion de rareza por observacion mediante `-model.score_samples(X)`, comparable contra un umbral fijo guardado en `experiment.json`.
- Ingenieria de caracteristicas rolling sobre una ventana de 12 pasos (medias, desviaciones, medianas y desviaciones absolutas).
- Reproducibilidad completa del experimento mediante los modulos `service_anomaly_ml.train` y `service_anomaly_ml.evaluate` del repositorio GitHub asociado.
- Comparacion metodologica contra una linea base de mediana rolling incluida en la evaluacion.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto: no es un modelo de lenguaje.
- Capacidad multilingue: no aplica; los metadatos declaran unicamente `en`.

## Casos de uso

- Docencia y formacion en deteccion de anomalias: el artefacto sirve para ilustrar el flujo completo (features rolling, escalado, Isolation Forest, umbral por percentil) con un dataset publico y reproducible, adecuado para practicas de laboratorio.
- Comparacion de detectores en investigacion: permite contrastar Isolation Forest frente a una linea base de mediana rolling sobre la misma serie y particion cronologica, con las metricas de recall por ventana y alertas fuera de ventana ya calculadas.
- Experimentos de ingenieria de caracteristicas: las siete features documentadas con orden estricto permiten evaluar el impacto de anadir o sustituir derivadas temporales sin reentrenar desde cero la logica de preprocesado.
- Reproduccion de experimentos NAB: al usar la serie `ec2_cpu_utilization_24ae8d.csv` y las ventanas de `labels/combined_windows.json`, sirve como punto de partida para replicar evaluaciones sobre el benchmark Numenta.
- Prototipado de pipelines de monitorizacion: el codigo de entrenamiento y evaluacion puede adaptarse como esqueleto para construir un detector propio sobre otra telemetria, siempre que se revalide con datos propios antes de cualquier uso operativo.
- Analisis de desviacion temporal: la particion cronologica sin barajado permite estudiar como se degrada un detector ante cambios de distribucion a lo largo del tiempo, un fenomeno relevante en monitorizacion de infraestructura.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre una unica serie (no es puntuacion oficial de NAB):

| Metrica | Isolation Forest | Linea base mediana rolling |
|---|---:|---:|
| Ventanas anotadas detectadas | 2/2 | 2/2 |
| Recall de eventos a nivel de ventana | 1,0 | 1,0 |
| Puntos de alerta fuera de ventana | 23 | 9 |
| Episodios de alerta fuera de ventana | 9 | 9 |
| Total de puntos de alerta en test | 46 | 21 |
| Tasa de alerta en test | 3,8143 % | 1,7413 % |

El autor advierte que el recall de eventos se basa en solo dos eventos, que no se ha calculado F1 ni precision puntual, y que los puntos fuera de ventana son proxies relativos a la anotacion, no falsos positivos confirmados manualmente. No se publican latencias de inferencia ni resultados de generalizacion cruzada.

## Requisitos de hardware

- VRAM estimada: no aplica; el artefacto se ejecuta en CPU y su tamano en disco es practicamente despreciable (el repositorio ocupa 0,0 GB).
- GPU recomendadas: no aplica; `scikit-learn` y `skops` no requieren aceleracion por GPU para este modelo.
- Cabe en cualquier maquina consumer: basta con un entorno Python con `scikit-learn` y `skops` instalados.
- Opciones de despliegue: ejecucion directa en Python mediante `skops.io.load` tras inspeccionar los tipos no confiables con `sio.get_untrusted_types`; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Requisito de entrada: no basta con un unico valor de CPU; se necesitan 12 mediciones previas para calcular las caracteristicas rolling en el orden original.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| F4lls/service-anomaly-detector | Isolation Forest (`scikit-learn`) | 200 arboles | ventana de 12 observaciones | no disponible | Hugging Face |
| Linea base mediana rolling (incluida en la evaluacion) | Estadistico simple | no aplica | ventana de 12 observaciones | no disponible | codigo del repositorio |
| Otros detectores NAB (p. ej. HTM de Numenta) | no disponible en esta ficha | no disponible | no disponible | no disponible | repositorio NAB |

La unica comparacion con datos publicados es la linea base de mediana rolling incluida en la propia evaluacion, que obtuvo 9 puntos de alerta fuera de ventana frente a 23 del Isolation Forest, con el mismo recall de eventos (2/2). No se dispone de comparaciones con otros detectores sobre la misma serie en la informacion proporcionada.

## Limitaciones y advertencias

- Prototipo experimental: el autor lo declara explicitamente no apto para paginacion de incidentes en produccion, diagnostico de causa raiz ni decisiones financieras, medicas o de seguridad.
- Validacion limitada: solo se ha evaluado sobre una unica serie de AWS CloudWatch; no hay validacion en otras fuentes de telemetria, regimenes temporales ni entornos de infraestructura.
- Recall basado en dos eventos: la metrica de recall por ventana (1,0) se calcula sobre solo dos eventos anotados y no constituye una puntuacion oficial de NAB.
- Alertas fuera de ventana: los 23 puntos fuera de ventana son proxies relativos a la anotacion, no falsos positivos confirmados; la linea base obtuvo menos (9), lo que sugiere una tasa de alerta superior en este detector para esta serie.
- Riesgo de falsos positivos y de incidentes no detectados, agravado por el posible desplazamiento de la distribucion temporal.
- Las anomalias detectadas no establecen causas raiz por si mismas.
- Licencia no seleccionada por el autor: no debe asumirse ninguna licencia por defecto; el dataset NAB subyacente tiene su propia licencia que debe consultarse por separado.
- Riesgo de deserializacion insegura: `skops` advierte que `sklearn.tree._tree.Tree` usa indices de nodo en crudo y un fichero malformado puede provocar fallos o problemas de seguridad de memoria incluso si el tipo se marca como confiable. No se deben cargar artefactos de origen no verificado.
- Entrada incompleta: un unico valor de CPU no es suficiente; sin las 12 mediciones previas no se pueden calcular las caracteristicas requeridas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/F4lls/service-anomaly-detector
- Codigo fuente en GitHub: https://github.com/fjahnm/service-anomaly-ml
- Numenta Anomaly Benchmark (NAB): https://github.com/numenta/NAB
- Paper de referencia: Ahmad, S., Lavin, A., Purdy, S., & Agha, Z. (2017). *Unsupervised real-time anomaly detection for streaming data.* Neurocomputing. https://doi.org/10.1016/j.neucom.2017.04.070
