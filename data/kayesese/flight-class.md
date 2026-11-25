# kayesese/flight-class

## Resumen

`kayesese/flight-class` es un modelo de clasificación tabular binaria entrenado con un `RandomForestClassifier` de scikit-learn. Su tarea es predecir si un billete de avión corresponde a clase Business (etiqueta 1) o Economy (etiqueta 0) en el mercado doméstico indio. Lo desarrolla el usuario kayesese y se publica bajo licencia MIT en Hugging Face Hub.

El modelo se apoya en el dataset público Flight Price Prediction de Kaggle (300.153 filas, 11 características de entrada antes del preprocesado). Combina variables numéricas (`duration`, `days_left`, `price`) con categóricas codificadas mediante One-Hot Encoding (`airline`, `source_city`, `departure_time`, `stops`, `arrival_time`, `destination_city`), y aplica `StandardScaler` a las numéricas.

No es un modelo de lenguaje ni una red neuronal: es un artefacto clásico de machine learning serializado con `joblib` (`.pkl`), pensado para integrarse en pipelines de Python. Su relevancia es acotada y muy específica del dominio: automatización de segmentación de clientes, gestión de ingresos y detección de anomalías de precio en aerolíneas y agencias de viaje indias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest (clasificador de árboles de decisión, scikit-learn 1.6.1) |
| Parametros totales | no disponible (no es una red neuronal; el número de árboles y su profundidad no se detalla) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | en (etiqueta del repo; el modelo en sí opera sobre datos tabulares, no texto) |
| Licencia | MIT |
| Formato de pesos | `.pkl` (joblib): `best_rf_model.pkl`, `scaler.pkl`, `feature_columns.pkl` |

## Arquitectura y entrenamiento

El modelo es un `RandomForestClassifier` de scikit-learn (versión 1.6.1) sometido a ajuste de hiperparámetros. El pipeline de preprocesado aplica One-Hot Encoding a las variables categóricas nominales y `StandardScaler` a las numéricas. El artefacto se distribuye en tres ficheros pickle: el modelo, el escalador y la lista de columnas de características, lo que permite reproducir exactamente el orden y la transformación de entrada.

El entrenamiento se realizó sobre el dataset Flight Price Prediction (Clean_Dataset) de Kaggle, con 300.153 filas y 11 características de entrada. La partición de evaluación es un 20 % de los datos. No se documentan el número de árboles, la profundidad máxima, el criterio de impureza ni la estrategia de validación cruzada. Tampoco se indica si hubo balanceo de clases, aunque el hecho de que Business sea una clase minoritaria en datos reales hace relevante esa omisión.

## Capacidades

- Clasificación binaria tabular: predice clase Business frente a Economy a partir de 9 variables de entrada tras el preprocesado.
- Integración directa en Python mediante `joblib` y `huggingface_hub.hf_hub_download`.
- Reproducibilidad del preprocesado gracias al `scaler.pkl` y `feature_columns.pkl` incluidos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de visión, audio ni generación de texto.
- No dispone de modo "thinking" ni de decodificación especulativa.

## Casos de uso

- Segmentación automática de clientes en aerolíneas: clasificar reservas históricas como Business o Economy para alimentar modelos de propensión y campañas de upselling, usando `price`, `duration` y `days_left` como señales principales.
- Gestión de ingresos (revenue management): etiquetar reservas entrantes en tiempo casi real para ajustar tarifas dinámicas por ruta y franja horaria, aprovechando las variables `departure_time` y `stops`.
- Detección de anomalías de precio: marcar billetes cuyo precio no encaja con la clase predicha, lo que puede señalar errores tarifarios o promociones atípicas, tal como sugiere el autor en la model card.
- Enriquecimiento de datos para agencias de viaje online: completar campos de clase ausentes en bases de datos de reservas antes de análisis de mercado o reporting.
- Análisis exploratorio de rutas domésticas indias: estudiar la distribución de clases por `source_city`, `destination_city` y `airline` para informes de industria.
- Prototipado rápido en notebooks: servir como baseline tabular de referencia antes de invertir en modelos más complejos (gradient boosting, redes tabulares) sobre el mismo dataset.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el 20 % de test del dataset Clean_Dataset:

| Metrica | Economy (0) | Business (1) | Global |
|---|---|---|---|
| Precision | 1.00 | 1.00 | no disponible |
| Recall | 1.00 | 1.00 | no disponible |
| F1-Score | 1.00 | 1.00 | 1.00 |

Advertencia: un F1 de 1.00 en ambas clases es altamente sospechoso y sugiere fuga de información (data leakage), muy probablemente porque `price` separa casi perfectamente las clases en este dataset. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU.
- GPU: innecesaria; cualquier CPU moderna es suficiente.
- Memoria RAM: el tamaño del repo es de 0.0 GB, por lo que el modelo cabe holgadamente en menos de 1 GB de RAM en la mayoría de configuraciones.
- Cabe en cualquier portátil consumer, Raspberry Pi o contenedor ligero.
- Despliegue: scripts Python con `joblib`, o serialización a ONNX si se necesita servir vía API. No aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; en un Random Forest típico de este tamaño, la inferencia por muestra suele estar en el orden de microsegundos a pocos milisegundos en CPU, pero no se documenta.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kayesese/flight-class | Random Forest tabular | no disponible | no aplica | MIT | Hugging Face |
| XGBoost / LightGBM (baselines tabulares) | Gradient boosting | no disponible | no aplica | Apache 2.0 / MIT | Bibliotecas estándar |
| Regresión logística (baseline) | Modelo lineal | no disponible | no aplica | scikit-learn BSD | Bibliotecas estándar |

No se dispone de comparativas publicadas con modelos equivalentes entrenados sobre el mismo dataset. La comparación anterior es cualitativa y se ofrece solo como referencia de categoría.

## Limitaciones y advertencias

- Dependencia extrema de la variable `price`: el propio autor advierte que la separación entre clases se debe en gran medida al precio. Promociones extremas de Business a precio de Economy distorsionarían las predicciones.
- Fuga de información probable: el F1 de 1.00 en test indica que el modelo aprende una regla trivial (probablemente un umbral de precio), no una segmentación realista. No debe interpretarse como rendimiento generalizable.
- Dominio muy restringido: solo válido para rutas domésticas indias del dataset original. No es trasladable a mercados internacionales sin reentrenamiento.
- Asociación, no causalidad: las relaciones aprendidas son correlacionales; no deben usarse para inferir causalidad ni para decisiones tarifarias sensibles.
- Sin documentación de hiperparámetros ni de validación cruzada: difícil auditar la robustez del modelo.
- Licencia MIT permite uso comercial, pero la falta de garantías y la advertencia sobre fuga de información desaconsejan su uso en producción sin una reevaluación rigurosa.
- Riesgo de sesgo por desbalance de clases no documentado: no se indica si se aplicaron técnicas de balanceo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kayesese/flight-class
- Dataset de origen (Kaggle): https://www.kaggle.com/datasets/shubhambathwal/flight-price-prediction
- Documentación de scikit-learn: https://scikit-learn.org/stable/
- Documentación de joblib: https://joblib.readthedocs.io/
- Documentación de huggingface_hub: https://huggingface.co/docs/huggingface_hub
