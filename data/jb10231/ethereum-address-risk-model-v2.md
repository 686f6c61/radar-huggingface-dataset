# jb10231/ethereum-address-risk-model-v2

## Resumen

El Ethereum Address Risk Model v2 es un clasificador tabular desarrollado por el usuario jb10231 y publicado en HuggingFace. Se trata de un modelo LightGBM entrenado para estimar la probabilidad de que una dirección de Ethereum sea fraudulenta a partir de once características agregadas de su actividad on-chain, como el saldo en ETH, el número de transacciones enviadas y recibidas, el número de contrapartes únicas, el valor total transferido, la duración de su actividad o el número de contratos desplegados. No es un modelo de lenguaje ni una red neuronal: es un conjunto de árboles de decisión con boosting sobre features tabulares.

El modelo resuelve un problema concreto de analítica blockchain: asignar una puntuación de riesgo a una dirección para alimentar sistemas de antifraude, cumplimiento normativo (KYT) o filtrado de airdrops. Su relevancia radica en las métricas declaradas por el autor en el conjunto de test (AUC-ROC de 0,9821 y PR-AUC de 0,9509), buenas para una tarea con fuerte desbalanceo de clases, y en su bajo coste de despliegue: el repositorio ocupa 0,0 GB y la inferencia se ejecuta en CPU.

La versión v2 se distingue por entrenarse sobre un dataset de fraude preexistente (Ethereum Fraud Detection Dataset de Kaggle) en lugar de datos generados por el propio autor, y se publica como un único artefacto en formato pickle (.pkl) que se carga con la librería LightGBM. El propio autor advierte que el modelo se entrenó con datos de MAINNET y que su integración prevista es la de una señal de riesgo adicional dentro de un motor de reglas, no como sustituto de este.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LightGBM (gradient boosting sobre árboles de decisión, clasificación tabular) |
| Parámetros totales | no disponible (el número de árboles, hojas y profundidad no se especifica en la información proporcionada) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular; la entrada es un vector de 11 características por dirección) |
| Tipos de cuantización | no aplica (no se publican variantes cuantizadas; el artefacto es un pickle de LightGBM) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | no disponible (la model card contiene un texto de plantilla sin licencia concreta: "[your desired license, e.g., MIT, Apache 2.0]") |
| Formato de pesos | pickle de Python (`ethereum_address_risk_model.pkl`), cargado con `lightgbm` y `pickle` |
| Pipeline | tabular-classification |
| Características de entrada | `coin_balance_eth`, `is_contract`, `has_token_transfers`, `tx_count_sent`, `tx_count_received`, `unique_counterparties`, `total_value_sent`, `total_value_received`, `activity_span_hours`, `velocity`, `contracts_created` |
| Umbral de decisión recomendado | 0,815 (ajustado por el autor) |
| Fecha de entrenamiento declarada | 2026-09-10T13:22:05 |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un clasificador LightGBM, es decir, un ensamblado de árboles de decisión entrenados de forma secuencial con boosting por gradiente, con crecimiento de árboles leaf-wise y discretización de features en histogramas. LightGBM está diseñado para datos tabulares de tamaño medio con muchas variables numéricas, y es habitual en detección de fraude por su buen equilibrio entre rendimiento, velocidad de entrenamiento e interpretabilidad mediante importancias de variables. La información proporcionada no detalla hiperparámetros como `num_leaves`, `learning_rate`, `n_estimators`, `max_depth` ni la estrategia de regularización, por lo que no se puede reproducir el entrenamiento a partir de la model card.

Los datos de entrenamiento provienen del Ethereum Fraud Detection Dataset publicado en Kaggle por el usuario vagifa. Las etiquetas de fraude (FLAG=1) y benignas (FLAG=0) proceden de ese mismo dataset, y las once features listadas se calculan a partir de la actividad on-chain de cada dirección. No se especifica el número de muestras, el reparto entre entrenamiento, validación y test, la proporción de clases ni si se aplicó algún esquema de remuestreo o ponderación para compensar el desbalanceo típico de este dominio. Tampoco se documenta ninguna técnica de calibración de probabilidades ni de selección de variables, más allá del umbral de 0,815 indicado para la decisión binaria.

## Capacidades

- Clasificación binaria de direcciones de Ethereum como fraudulentas o benignas, con salida de probabilidad continua entre 0 y 1.
- Puntuación de riesgo por dirección a partir de agregados de actividad: saldo, número de transacciones, contrapartes únicas, valor transferido, antigüedad y velocidad de operación.
- Detección de direcciones con patrón de contrato (`is_contract`) y de direcciones que despliegan contratos (`contracts_created`).
- Identificación de cuentas con transferencias de tokens ERC-20 (`has_token_transfers`).
- Inferencia en CPU con dependencias mínimas (Python, `lightgbm`, `pandas`).
- Integración sencilla en pipelines de datos como señal numérica adicional.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, generación de texto, visión, audio ni capacidades multilingües, dado que no es un modelo de lenguaje.
- No se documenta capacidad de aprendizaje incremental ni de reentrenamiento en línea.

## Casos de uso

- Puntuación de riesgo en el alta de usuarios de un exchange: antes de habilitar depósitos o retiradas, se calculan las once features de la dirección con un indexador y se obtiene una probabilidad de fraude; el umbral 0,815 permite bloquear o marcar para revisión manual.
- Monitorización transaccional y antifraude en producción: el modelo se ejecuta como servicio (por ejemplo, una API interna que recibe un vector de features) y su salida se agrega a un motor de reglas existente, tal y como recomienda el propio autor ("una señal de RiskService por dirección").
- Cumplimiento normativo y KYT (know your transaction): generar un indicador cuantitativo de riesgo por dirección para informes de auditoría o para priorizar casos en la cola de revisión de un analista de compliance.
- Filtrado de airdrops y campañas de incentivos: descartar o auditar direcciones con alta probabilidad de fraude antes de repartir tokens, reduciendo la exposición a cuentas sybil o granjas de recompensas.
- Analítica blockchain para dashboards: enriquecer exploradores y paneles de inteligencia de mercado con un score de riesgo por dirección, útil para clasificar flujos de fondos entre contrapartes.
- Investigación académica sobre detección de fraude on-chain: servir como línea base reproducible (LightGBM sobre features agregadas) contra la que comparar modelos más complejos como GNNs sobre grafos de transacciones.
- Evaluación previa a la concesión de crédito o colateral en DeFi: usar la probabilidad de fraude como variable de entrada en la decisión de aceptar una dirección como prestataria o como garante en un protocolo.
- Soporte a herramientas forenses: priorizar direcciones sospechosas en una investigación de fondos robados cuando el volumen de candidatas es demasiado alto para revisión manual.

## Benchmarks y rendimiento

Métricas declaradas por el autor sobre el conjunto de test:

| Métrica | Valor |
|---|---|
| Accuracy | 0,9440 |
| Precision | 0,9245 |
| Recall | 0,8142 |
| F1 | 0,8659 |
| AUC-ROC | 0,9821 |
| PR-AUC | 0,9509 |
| Umbral ajustado | 0,815 |

No se han publicado resultados comparativos frente a otros modelos en la información disponible, ni se detalla el tamaño del conjunto de test, la proporción de clases positivas ni el procedimiento exacto de ajuste del umbral. Las cifras proceden exclusivamente de la model card del autor y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM: no aplica. LightGBM ejecuta la inferencia en CPU; no requiere GPU.
- GPU recomendadas: ninguna. El uso de GPU solo tendría sentido, de forma opcional, para el reentrenamiento con LightGBM GPU, y no es necesario para servir el modelo.
- Cabida en hardware de consumo: sí, sin restricciones relevantes. El repositorio ocupa 0,0 GB y el artefacto es un pickle de tamaño reducido; un portátil convencional o un contenedor pequeño bastan.
- Memoria RAM estimada: no disponible, pero del orden de decenas o pocos cientos de megabytes incluyendo el intérprete de Python y las dependencias, dado el tamaño del artefacto.
- Opciones de despliegue: carga directa con `lightgbm` y `pickle` en Python; servicio HTTP propio (FastAPI, Flask); integración en un pipeline de features con pandas; exportación del modelo a otros formatos de LightGBM si se necesita. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. La inferencia de un LightGBM sobre once features es típicamente sub-milisegundo por muestra en CPU moderna, pero se trata de una estimación general y no de un dato publicado para este modelo.

## Comparativa con modelos similares

No se han publicado comparativas de este modelo frente a alternativas en la información disponible. La tabla recoge únicamente los datos conocidos de cada opción; el resto queda como no disponible.

| Modelo | Tipo | Entrada | Licencia | Métricas publicadas | Estado |
|---|---|---|---|---|---|
| ethereum-address-risk-model-v2 | LightGBM (clasificación tabular) | 11 features agregadas por dirección | no disponible | Accuracy 0,9440; F1 0,8659; AUC-ROC 0,9821; PR-AUC 0,9509 | Disponible en HuggingFace, 0 descargas |
| XGBoost u otro GBDT sobre las mismas features | Gradient boosting | Features tabulares equivalentes | no disponible | no disponible | Alternativa genérica, sin resultados comparables publicados |
| Redes neuronales sobre grafos (GNN) de transacciones | GNN | Grafo de direcciones y transferencias | no disponible | no disponible | Alternativa de investigación, requiere infraestructura distinta |
| Reglas heurísticas de un motor antifraude | Basado en reglas | Indicadores definidos por el equipo | no aplica | no disponible | Enfoque tradicional; la model card sugiere combinarlo con el modelo, no sustituirlo |

## Limitaciones y advertencias

- Desajuste de red: el modelo se entrenó con datos de MAINNET, mientras que la aplicación de destino descrita por el autor opera por defecto en Sepolia TESTNET; en ese escenario la puntuación debe tratarse como ilustrativa hasta reentrenar con datos de la red objetivo.
- Licencia no definida: la model card incluye un texto de plantilla sin licencia concreta. No hay autorización explícita de uso comercial; conviene contactar con el autor antes de integrarlo en producción.
- Dependencia de un único dataset: todas las etiquetas provienen del Ethereum Fraud Detection Dataset de Kaggle, sin validación cruzada con otras fuentes ni verificación independiente de las métricas.
- Umbral dependiente del contexto: la decisión binaria se fija en 0,815, un valor ajustado sobre el test del autor. Con recall de 0,8142, aproximadamente una de cada cinco direcciones fraudulentas no se detectaría con ese corte, por lo que el coste de los falsos negativos debe evaluarse según el caso de uso.
- Datos no balanceados y sin información de composición: no se indica la tasa de positivos, el tamaño de las particiones ni si hubo remuestreo, lo que dificulta juzgar la robustez del PR-AUC declarado.
- Riesgo de deriva (drift): los patrones de fraude on-chain cambian con rapidez; un modelo entrenado en una instantánea de datos puede degradarse sin reentrenamiento periódico.
- Dependencia de un pipeline de features externo: el modelo no consume la blockchain directamente. Las once features deben calcularse correctamente y en el mismo orden y escala que en el entrenamiento; un error de agregación invalida la predicción.
- Sin interpretabilidad documentada: no se publican importancias de variables, valores SHAP ni análisis de sesgo. Un LightGBM puede explicarse a posteriori, pero no hay material al respecto en la model card.
- Riesgo de sesgo por proxy: características como el saldo o el número de contrapartes pueden correlacionar con el tipo de uso legítimo de una dirección (por ejemplo, bots de mercado, contratos de servicio), lo que puede generar falsos positivos sistemáticos sobre ciertos perfiles.
- Trazabilidad limitada: el repositorio no tiene descargas ni likes y no incluye paper, informe técnico ni código de entrenamiento; la reproducibilidad depende por completo del dataset de Kaggle citado.
- Sin soporte de texto ni de lenguaje natural: cualquier caso de uso que requiera explicaciones, resúmenes o interacción conversacional necesita un componente adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jb10231/ethereum-address-risk-model-v2
- Dataset de entrenamiento citado (Kaggle, Ethereum Fraud Detection Dataset): https://www.kaggle.com/datasets/vagifa/ethereum-frauddetection-dataset
- Paper, blog o repositorio de entrenamiento: no disponible
- Demo o espacio interactivo: no disponible
