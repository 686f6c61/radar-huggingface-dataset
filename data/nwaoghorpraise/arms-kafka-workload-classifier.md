# nwaoghorpraise/arms-kafka-workload-classifier

## Resumen

El modelo `arms-kafka-workload-classifier` es un clasificador tabular basado en regresión logística, desarrollado por Nwaoghor Praise Chukunweiken, que clasifica la carga de trabajo actual de un clúster Apache Kafka en dos categorías: tiempo real orientado a eventos (`REAL_TIME_EVENT_DRIVEN`) o por lotes intensivo en datos (`BATCH_DATA_INTENSIVE`). Forma parte de ARMS (Adaptive Recovery Management System), un sistema de gestión de recuperación adaptativa que utiliza la predicción para seleccionar una estrategia de recuperación de Kafka cuando falla un broker, en lugar de aplicar una configuración estática a todas las cargas.

El modelo no es una red neuronal ni un transformer: es un `LogisticRegression` de scikit-learn acompañado de un `StandardScaler`, empaquetados en dos ficheros joblib. A partir de cuatro métricas de broker y host obtenidas mediante consultas de Prometheus (varianza de la tasa de peticiones, bytes de escritura en disco, varianza de la tasa de mensajes y memoria disponible), produce una probabilidad por clase que ARMS traduce en una de tres estrategias de recuperación: `QUICK_REBALANCE`, `RESOURCE_OPTIMIZED` o `CONTROLLED_GRADUAL` (esta última como valor por defecto cuando la confianza es inferior al 90%).

Su relevancia radica en el contexto MLOps/AIOps: demuestra cómo un modelo estadístico simple y ligero (inferencia muy por debajo de 0,1 s) puede integrarse en un bucle de control operativo real para automatizar decisiones de recuperación en infraestructura de mensajería, con un coste computacional mínimo y una licencia permisiva (Apache 2.0). Fue desarrollado como parte de una tesis de máster en Ingeniería de Software en la Universidad de Hertfordshire (abril de 2025).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión logística (scikit-learn `LogisticRegression`) con preprocesado `StandardScaler` |
| Parametros totales | No disponible (modelo lineal; coeficientes no publicados en la información disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (clasificación tabular sobre 4 características; no procesa secuencias de texto) |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones; el modelo se distribuye en formato joblib) |
| Idiomas soportados | No disponible (no procesa lenguaje natural; las etiquetas de salida están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | joblib (`.pkl`): `kafka_logistic_regression_model.pkl` y `kafka_feature_scaler.pkl` |

## Arquitectura y entrenamiento

La arquitectura es un clasificador lineal de regresión logística (`random_state=42`, `max_iter=1000`) precedido por un `StandardScaler` ajustado sobre el conjunto de entrenamiento. El modelo consume exactamente cuatro características, en este orden: `request_rate_variance`, `node_disk_write_bytes_total`, `message_rate_variance` y `node_memory_MemAvailable_bytes`. Cada una se obtiene en ARMS mediante consultas de Prometheus sobre el exportador JMX de Kafka y node-exporter.

El entrenamiento se realizó sobre 3.000 instantáneas de métricas etiquetadas (1.500 por clase), recogidas de un clúster Kafka de tres brokers ejecutando cargas sintéticas de IA en tiempo real y por lotes (`datasets/balanced_kafka_dataset_3000.csv` en el repositorio de GitHub). La selección de características partió de 15 métricas candidatas, ordenadas mediante información mutua, correlación de Spearman e importancia de Random Forest (`metric_analysis.py`), conservando las cuatro finales. La partición fue estratificada 80/20 con `random_state=42`, y el escalado se ajustó únicamente sobre el conjunto de entrenamiento. No se documenta uso de RLHF, DPO ni técnicas de ajuste fino adicionales, algo esperable en un modelo lineal supervisado de este tipo.

## Capacidades

- Clasificación binaria de carga de trabajo de Kafka: `REAL_TIME_EVENT_DRIVEN` (clase 0) frente a `BATCH_DATA_INTENSIVE` (clase 1).
- Salida de probabilidades por clase mediante `predict_proba`, lo que permite aplicar umbrales de confianza.
- Selección de estrategia de recuperación integrada en ARMS: `QUICK_REBALANCE` (confianza ≥ 90 % para tiempo real), `RESOURCE_OPTIMIZED` (confianza ≥ 90 % para lote) y `CONTROLLED_GRADUAL` (confianza < 90 %).
- Inferencia en línea contra un clúster real: sondeo de Prometheus cada 30 segundos y exposición del resultado en `http://localhost:5001/api/prediction` y `/api/strategy`.
- Consumo de métricas de broker y host vía Prometheus (Kafka JMX exporter + node-exporter).
- No soporta tool calling ni function calling, ni razonamiento multi-paso, ni capacidades multilingües, de visión o de audio: es un clasificador tabular puro.
- No dispone de modo "thinking" ni de generación de texto.

## Casos de uso

- Recuperación automática ante fallo de broker en Kafka: cuando un broker cae, ARMS consulta al clasificador con las cuatro métricas actuales y selecciona `QUICK_REBALANCE` para cargas en tiempo real (prioriza velocidad de recuperación) o `RESOURCE_OPTIMIZED` para cargas por lotes (prioriza uso de recursos), evitando aplicar una configuración estática a todos los escenarios.
- Enrutamiento de políticas operativas en plataformas de mensajería gestionada: el clasificador permite decidir dinámicamente qué política de rebalanceo aplicar en función de la carga observada, reduciendo intervención manual en operaciones 24/7.
- Monitorización y alerta temprana en AIOps: integrado en un pipeline de Prometheus, permite etiquetar ventanas de métricas con el tipo de carga dominante y disparar alertas o acciones diferenciadas según el perfil detectado.
- Automatización de experimentos de caos y recuperación: en el stack ARMS (`./scripts/run_experiment.sh real_time` o `batch`) se usa para validar que las estrategias de recuperación se seleccionan correctamente bajo cargas sintéticas controladas.
- Clasificación de carga en clústeres Kafka de terceros: cualquier operador puede reutilizar el par modelo+escalador con las mismas cuatro consultas de Prometheus para etiquetar la carga de su propio clúster, dado que el modelo es independiente del despliegue concreto.
- Componente de decisión en sistemas de autoescalado o reconfiguración: la salida probabilística y el umbral de confianza del 90 % permiten alimentar controladores que solo actúan cuando la clasificación es suficientemente fiable, dejando el resto en modo conservador.
- Docencia y prototipado de MLOps: por su simplicidad (dos ficheros joblib y un script de inferencia), sirve como ejemplo mínimo reproducible de integración de un modelo en un bucle de control operativo con Prometheus, Grafana y Docker.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Métrica | Valor | Conjunto |
|---|---|---|
| Exactitud en test (hold-out 20 %) | 0,9617 | 600 muestras |
| F1 macro | 0,9617 | 600 muestras |
| Exactitud en validación cruzada de 5 pliegues | 0,9677 | Dataset completo |

Desglose por clase en el hold-out de 600 muestras:

| Clase | Precisión | Recall | F1 | Soporte |
|---|---|---|---|---|
| REAL_TIME_EVENT_DRIVEN (0) | 0,9727 | 0,9500 | 0,9612 | 300 |
| BATCH_DATA_INTENSIVE (1) | 0,9511 | 0,9733 | 0,9621 | 300 |
| Exactitud global | — | — | 0,9617 | 600 |

Matriz de confusión (filas = clase real): 285 / 15 / 8 / 292. La latencia de inferencia se describe como "muy por debajo de 0,1" (la unidad no se especifica en la información disponible).

## Requisitos de hardware

- VRAM: no aplica; es un modelo lineal de scikit-learn que se ejecuta en CPU.
- GPU: no requiere GPU. Cualquier CPU moderna es suficiente.
- Compatibilidad con GPU de consumo: no aplica (no hay versión GPU).
- Memoria RAM: mínima; el modelo y el escalador son ficheros joblib de tamaño reducido (no se publica el tamaño exacto en la información disponible).
- Despliegue: script de inferencia en Python (`inference.py`) con dependencias `scikit-learn>=1.6,<1.7`, `joblib`, `pandas` y `huggingface_hub`; el stack completo ARMS se despliega con Docker (Kafka de 3 brokers, Prometheus, Grafana, clasificador y controlador) mediante `./scripts/setup.sh` y `./scripts/start.sh`.
- Servidores de inferencia tipo vLLM, TGI, llama.cpp u Ollama: no aplican, al no ser un modelo generativo.
- Latencia y throughput: inferencia descrita como muy por debajo de 0,1 (unidad no especificada); el clasificador en producción sondea Prometheus cada 30 segundos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se trata de un clasificador tabular específico de un sistema de investigación (ARMS) y no de un modelo de propósito general, por lo que la comparación con alternativas publicadas requeriría datos que no están disponibles.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arms-kafka-workload-classifier | No disponible (lineal) | No aplica | Exactitud 0,9617 en hold-out propio | Apache 2.0 | Hugging Face + GitHub |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con datos sintéticos de un clúster Kafka de tres brokers; su generalización a otras topologías, versiones de Kafka o patrones de carga reales no está validada en la información disponible.
- Depende de cuatro métricas concretas y de consultas de Prometheus específicas; cambios en la instrumentación (nombres de métricas, exportadores o resolución temporal) pueden degradar o invalidar las predicciones.
- El umbral de confianza del 90 % es una regla de decisión de ARMS, no una garantía estadística; por debajo de ese umbral el sistema recurre a `CONTROLLED_GRADUAL`, lo que puede ralentizar la recuperación en cargas ambiguas.
- Riesgo de deriva (drift): al ser un modelo lineal entrenado sobre una distribución concreta de cargas, cambios en el perfil de tráfico pueden reducir la exactitud sin que exista un mecanismo de reentrenamiento documentado.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en la model card).
- No se documentan sesgos específicos ni evaluación de equidad; al operar sobre métricas de infraestructura, el riesgo de sesgo social es bajo, pero el sesgo de muestreo hacia las cargas sintéticas empleadas es relevante.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; no se documentan restricciones adicionales.
- El modelo no procesa texto ni lenguaje natural: no debe confundirse con un LLM ni esperarse capacidades generativas.
- Para producción se recomienda validar el modelo con datos del clúster objetivo antes de confiar en la selección automática de estrategias de recuperación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nwaoghorpraise/arms-kafka-workload-classifier
- Repositorio del proyecto ARMS (código, stack Docker y experimentos): https://github.com/NwaoghorPraise2/ARMS-project
- Artículos, papers o demos adicionales: no disponible en la información proporcionada.
