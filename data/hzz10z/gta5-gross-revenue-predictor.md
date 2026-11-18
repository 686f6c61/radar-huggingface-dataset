# HZZ10Z/gta5-gross-revenue-predictor

## Resumen

El GTA V Gross Revenue Predictor es un modelo de regresión tabular publicado en Hugging Face por el usuario HZZ10Z (Filbert Huang Herlison) como proyecto de la asignatura Business Data Science (MN1135) del Programa de Estudios de Gestión. No es un modelo de lenguaje ni una red neuronal: es un `RandomForestRegressor` de scikit-learn serializado con joblib que estima el ingreso bruto (`gross_revenue_usd`) de Grand Theft Auto V en consolas de novena generación (PlayStation 5 y Xbox Series X|S).

El modelo se entrenó sobre un dataset de Kaggle con 1.980 filas y 45 características de entrada tras la limpieza, que combinan métricas de actividad de jugadores (`units_sold`, `online_players`), monetización secundaria (`dlc_revenue_usd`, `shark_card_revenue_usd`), variables macroeconómicas (`gdp_per_capita_usd`) y variables categóricas codificadas con one-hot encoding (`region`, `platform`, `game_edition`, `sales_channel`).

Su relevancia es acotada y de carácter didáctico: sirve como ejemplo reproducible de un pipeline de regresión tabular con scikit-learn y como artefacto de demostración de métricas de negocio (error porcentual tolerado), no como componente para producción. El repositorio ocupa 0,0 GB, no tiene descargas ni likes, y la model card está redactada en indonesio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest Regressor (ensemble de árboles de decisión, scikit-learn) |
| Parametros totales | no disponible (300 estimadores; el número de nodos y hojas no se publica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible (no se documentan técnicas de cuantización; el artefacto es un serializado joblib) |
| Idiomas soportados | no disponible (no procesa texto; las entradas son numéricas y categóricas codificadas) |
| Licencia | MIT |
| Formato de pesos | joblib (serialización de scikit-learn) |

## Arquitectura y entrenamiento

La arquitectura es un bosque aleatorio (`RandomForestRegressor`) con 300 estimadores, `max_depth=None` (árboles sin límite de profundidad), `min_samples_leaf=1` y `random_state=42`, implementado con scikit-learn v1.6.1. Se trata de un ensemble de tipo bagging sobre árboles de decisión CART, sin componentes neuronales, sin atención y sin fases de preentrenamiento o ajuste por refuerzo (no hay RLHF ni DPO).

El conjunto de entrenamiento proviene del dataset "Video Game Sales Analytics GTA V PlayStation 5 dan Xbox" de Kaggle, con 1.980 filas y 45 características tras la limpieza. La partición es 80/20 (entrenamiento/prueba). Las características incluyen métricas de ventas y actividad, ingresos por DLC y Shark Cards, PIB per cápita y variables categóricas transformadas mediante one-hot encoding. No se documenta en la información disponible ninguna innovación técnica adicional (ni validación cruzada, ni búsqueda de hiperparámetros, ni técnicas de regularización más allá de las propias del bosque aleatorio).

## Capacidades

- Regresión tabular sobre variables numéricas y categóricas codificadas: predice un valor continuo de ingreso bruto en USD.
- Modelado de relaciones no lineales entre métricas de actividad de jugadores, monetización y variables macroeconómicas, gracias al ensemble de 300 árboles.
- Estimación de ingresos desagregada por región, plataforma, edición del juego y canal de venta (mediante las variables one-hot).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agente.
- No tiene capacidades multilingües: no procesa lenguaje natural.
- No dispone de modo de razonamiento (thinking mode), visión ni audio.
- Capacidad de interpretación de importancia de variables potencialmente derivable del bosque, aunque no se documenta en la model card.

## Casos de uso

- Estimación de flujo de caja operativo: el modelo predice el ingreso bruto por transacción o periodo a partir de unidades vendidas y jugadores activos, lo que permite a un equipo de finanzas proyectar ingresos con un error absoluto medio documentado de 608,71 USD sobre el conjunto de prueba.
- Planificación de capacidad de servidores: el equipo de DevOps puede introducir el número de jugadores online previsto y obtener una estimación de ingresos asociada, útil para priorizar inversión en infraestructura en picos de actividad.
- Análisis de sensibilidad de monetización: variando `dlc_revenue_usd` y `shark_card_revenue_usd` en la entrada, se puede estudiar cómo afectan los ingresos secundarios al ingreso bruto total y orientar decisiones de marketing.
- Segmentación por región y plataforma: gracias a las variables one-hot de `region` y `platform`, el modelo permite comparar predicciones entre PS5 y Xbox Series X|S y entre mercados, apoyando la asignación de presupuesto comercial.
- Docencia y reproducción de pipelines de regresión: sirve como ejemplo completo de entrenamiento, evaluación (MAE, RMSE, R²) y empaquetado con joblib para cursos de ciencia de datos aplicada a negocio.
- Prototipado rápido de un servicio de scoring financiero: al ser un artefacto joblib de pequeño tamaño (0,0 GB), puede cargarse en un script de Python o en un endpoint ligero para validar una hipótesis de negocio antes de invertir en un modelo más complejo.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el 20% de datos de prueba:

| Metrica | Valor |
|---|---|
| MAE | 608,7146 USD |
| RMSE | 2115,9333 USD |
| R² | 0,9509 |
| Precisión de negocio (error ≤ 10%) | 81,82% |
| Precisión de negocio (error ≤ 20%) | 94,95% |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; es un modelo de CPU basado en scikit-learn, sin uso de GPU.
- GPU recomendadas: ninguna; no requiere aceleración gráfica.
- Cabe en cualquier equipo consumer: el repositorio ocupa 0,0 GB y el artefacto joblib se carga en memoria RAM convencional (estimación no disponible en la información proporcionada).
- Opciones de despliegue: scripts de Python con `joblib.load` y scikit-learn v1.6.1; también puede servirse mediante FastAPI, Flask o cualquier framework HTTP que envuelva la llamada a `predict`. No aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; en un bosque de 300 árboles la inferencia por muestra es del orden de milisegundos en CPU, pero no se documenta una medición.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GTA V Gross Revenue Predictor | Random Forest (scikit-learn) | 300 estimadores | no aplica | MIT | Hugging Face (joblib) |
| XGBoost Regressor (referencia genérica) | Gradient boosting | configurable | no aplica | Apache 2.0 | Librería ampliamente disponible |
| LightGBM Regressor (referencia genérica) | Gradient boosting | configurable | no aplica | MIT | Librería ampliamente disponible |

No se dispone de datos de rendimiento de modelos comparables sobre este mismo dataset en la información proporcionada, por lo que la comparación cuantitativa se limita a la naturaleza del algoritmo y la licencia.

## Limitaciones y advertencias

- Subestimación en transacciones de alto valor: la model card indica que el modelo tiende a predecir por debajo del valor real en transacciones superiores a 30.000 USD, debido a fluctuaciones no lineales del mercado.
- Dependencia de `online_players`: una caída global de servidores distorsiona las predicciones de ingresos, según advierte el autor.
- Ámbito restringido: el modelo solo cubre GTA V en PS5 y Xbox Series X|S; no es extrapolable a otras plataformas, juegos o periodos sin reentrenamiento.
- Dataset pequeño: 1.980 filas y partición 80/20 implican un conjunto de prueba de aproximadamente 396 muestras, lo que limita la robustez estadística de las métricas reportadas.
- Sin validación externa ni comparación con líneas base: no se documentan pruebas fuera del conjunto de Kaggle ni comparaciones con otros algoritmos.
- Riesgo de sobreajuste no evaluado: `max_depth=None` y `min_samples_leaf=1` permiten árboles totalmente expandidos; no se reporta validación cruzada.
- Licencia MIT: permite uso comercial y modificación con atribución, pero el modelo se distribuye sin garantías y su uso en producción financiera requeriría validación independiente.
- Documentación en indonesio: la model card no está en castellano ni en inglés, lo que puede dificultar su adopción por equipos internacionales.
- Sin mantenimiento aparente: 0 descargas, 0 likes y creado/actualizado el mismo día (18 de noviembre de 2026), sin historial de versiones posterior.

## Enlaces

- Hugging Face: https://huggingface.co/HZZ10Z/gta5-gross-revenue-predictor
- Dataset de origen (Kaggle): https://www.kaggle.com/datasets/samekto/dataset-penjualan-gta-v-vr-ps5-and-xbox-x-s-22-26
- scikit-learn (framework): https://scikit-learn.org
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
