# pinkepinn/car-supply-chain-satisfaction

## Resumen
El modelo `pinkepinn/car-supply-chain-satisfaction` es un clasificador tabular binario basado en un árbol de decisión de scikit-learn, entrenado para predecir si un cliente de una cadena de suministro automotriz quedará satisfecho (clase positiva) o no (clase negativa). Lo firma Kevin Edric (NIM 2025121121) como proyecto de la asignatura Business Data Science (MN1135) del Grado en Administración de Empresas de la Universitas Universal, y se publica bajo el identificador `pinkepinn` en Hugging Face.

No se trata de un modelo de lenguaje ni de una red neuronal: es un artefacto `.joblib` de aproximadamente 0 GB que implementa un `DecisionTreeClassifier` con `criterion='entropy'`, `max_depth=3` y `class_weight='balanced'`, optimizado mediante `GridSearchCV`. Su utilidad es acotada: sirve como herramienta de cribado temprano para identificar transacciones con riesgo de insatisfacción en un conjunto de datos muy concreto (1.000 filas, 10 variables de entrada codificadas en 50 columnas).

La relevancia actual es limitada fuera del ámbito académico y del dataset original: el rendimiento en test es bajo (F1 de 0,4923 y ROC-AUC de 0,5144), las correlaciones entre variables operativas y la etiqueta son débiles (|r| ≤ 0,09) y la licencia no está declarada. Debe tratarse, por tanto, como una pieza demostrativa y no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Árbol de decisión (`DecisionTreeClassifier` de scikit-learn) con `criterion='entropy'`, `max_depth=3`, `min_samples_split=2`, `min_samples_leaf=10`, `class_weight='balanced'` |
| Parametros totales | no disponible (modelo tabular; no aplica el concepto de parámetros en el sentido de redes neuronales) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación tabular, no secuencial) |
| Tipos de cuantizacion | no disponible (artefacto `.joblib`; no se documentan procesos de cuantización) |
| Idiomas soportados | `id` (indonesio), según la etiqueta de idioma del repositorio |
| Licencia | no disponible |
| Formato de pesos | `.joblib` (scikit-learn 1.6.1), junto con `feature_names.joblib` y `metadata.joblib` |

## Arquitectura y entrenamiento
El modelo es un árbol de decisión único, no un ensemble ni una red neuronal. La búsqueda de hiperparámetros se realizó con `GridSearchCV`, seleccionando finalmente un árbol de profundidad máxima 3, con `min_samples_leaf=10` y ponderación de clases balanceada. El preprocesamiento incluye selección de 10 variables de entrada (5 numéricas y 5 categóricas) y codificación one-hot con `drop_first=True`, lo que genera 50 columnas de features.

El conjunto de datos de origen es el "Car Supply Chain Management Dataset" de Kaggle, con 1.000 filas y 33 columnas originales. Tras el preprocesamiento se generaron 800 filas de entrenamiento y 200 de test, con `stratify=y` y `random_state=42`. La variable objetivo `Feedback_Binary` agrupa `Good` y `Very Good` como clase positiva (38,7 % del dataset) y `Very Bad`, `Bad` y `Okay` como clase negativa (61,3 %). No se documenta ningún proceso de RLHF, DPO ni ajuste fino adicional; es un ajuste supervisado clásico sobre datos tabulares.

## Capacidades
- Clasificación binaria de transacciones de cadena de suministro automotriz en "satisfecho" o "no satisfecho".
- Predicción de probabilidad de la clase positiva mediante `predict_proba`, útil para priorizar revisiones manuales.
- Manejo de 10 variables de entrada: `CarModelYear`, `CarPrice`, `Sales`, `Quantity`, `Discount`, `CarMaker`, `ShipMode`, `Shipping`, `Gender` y `CreditCardType`.
- Agrupación de fabricantes poco frecuentes en la categoría `Other` para evitar sobreajuste a marcas con menos de 15 transacciones.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.
- Capacidad multilingüe inexistente: el modelo no procesa lenguaje natural, solo variables estructuradas.

## Casos de uso
- Cribado temprano de transacciones de riesgo: dada una nueva fila con los 10 campos de entrada, el modelo devuelve una probabilidad de insatisfacción que permite priorizar la revisión manual por parte del equipo de atención al cliente.
- Segmentación exploratoria de pedidos: agrupar transacciones por probabilidad predicha para detectar patrones operativos (modo de envío, descuento aplicado, tipo de tarjeta) asociados a mayor riesgo.
- Docencia y demostración de pipelines de scikit-learn: el repositorio incluye un ejemplo completo de carga con `hf_hub_download`, reconstrucción de features one-hot y predicción, útil como plantilla educativa.
- Prueba de concepto en un TFM o proyecto académico de ciencia de datos aplicada a supply chain, sin pretensión de producción.
- Integración en un notebook de análisis exploratorio para comparar la tasa de insatisfacción entre marcas (`CarMaker`) y modos de envío (`ShipMode`).
- Validación de la hipótesis de que variables operativas como `Discount` o `Shipping` tienen poder predictivo limitado sobre la satisfacción, sirviendo de línea base negativa frente a modelos más complejos.
- Generación de reglas de negocio interpretables: al ser un árbol de profundidad 3, sus divisiones son legibles y pueden traducirse a umbrales operativos (por ejemplo, descuento superior a X en combinación con envío aéreo).

## Benchmarks y rendimiento
Resultados reportados por el autor sobre el conjunto de test (200 filas):

| Metrica | Antes de tuning (por defecto) | Despues de tuning (modelo final) |
|---|---|---|
| F1-score (metrica principal) | 0,4286 | 0,4923 |
| Recall | 0,4286 | 0,6234 |
| Precision | 0,4286 | 0,4068 |
| Accuracy | 0,5600 | 0,5050 |
| ROC-AUC | 0,5354 | 0,5144 |

No se han publicado comparaciones con otros modelos en la información disponible. El ROC-AUC final (0,5144) es prácticamente equivalente a una clasificación aleatoria, lo que refleja la debilidad de la señal en las features de entrada.

## Requisitos de hardware
- VRAM: no aplica; el modelo es un árbol de decisión y se ejecuta en CPU.
- GPU recomendadas: ninguna; no requiere aceleración por hardware.
- Cabe en cualquier equipo: el repositorio ocupa 0,0 GB y el artefacto `.joblib` es de tamaño despreciable.
- Opciones de despliegue: carga directa con `joblib.load` en Python; requiere `scikit-learn==1.6.1` para evitar advertencias de compatibilidad. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles de forma oficial; por la naturaleza del modelo (árbol de profundidad 3) la inferencia es del orden de microsegundos por fila en CPU, aunque el autor no publica mediciones.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia cualitativa, dentro del ecosistema scikit-learn cabría comparar con `RandomForestClassifier`, `GradientBoostingClassifier` o `LogisticRegression` sobre el mismo dataset, pero no se han publicado resultados de dichos modelos en la información disponible. Tampoco se conocen otros modelos tabulares de temática equivalente en Hugging Face con los que establecer una comparación directa.

## Limitaciones y advertencias
- Rendimiento muy bajo: ROC-AUC de 0,5144 y precisión de 0,4068 en test; el modelo apenas supera la clasificación aleatoria.
- Correlaciones débiles: el propio autor indica que todas las variables operativas tienen |r| ≤ 0,09 respecto a la satisfacción del cliente.
- Ausencia de la variable `ShippingDays`: se descartó por anomalías de registro (24,5 % de filas con fecha de envío anterior a la de pedido), lo que elimina probablemente la señal más informativa.
- Licencia no declarada: no se especifican condiciones de uso comercial; debe contactarse con el autor antes de cualquier uso en producción.
- Ámbito muy restringido: entrenado sobre 1.000 filas sintéticas o de un único dataset de Kaggle; no generaliza a otras cadenas de suministro ni a otros dominios.
- Idioma: etiquetado como `id` (indonesio), aunque el modelo no procesa texto; el etiquetado refleja el contexto del proyecto, no una capacidad multilingüe.
- Riesgo de sobreajuste al esquema de codificación: el pipeline depende de la lista exacta de 50 columnas generadas con `drop_first=True`; cualquier cambio en las categorías o en el orden de las features invalida las predicciones.
- No apto para decisiones automatizadas de alto riesgo: el autor lo desaconseja explícitamente como única base para decisiones operativas críticas.
- Sin mantenimiento aparente: el repositorio se creó y actualizó el mismo día (2026-11-18) y no registra descargas ni likes.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/pinkepinn/car-supply-chain-satisfaction
- Dataset de origen en Kaggle: https://www.kaggle.com/datasets/prashantk93/supply-chain-management-for-car
- Documentación de scikit-learn (versión requerida 1.6.1): https://scikit-learn.org/stable/
- Documentación de `hf_hub_download`: https://huggingface.co/docs/huggingface_hub/guides/download
- Repositorio alternativo mencionado en el código de ejemplo (a verificar por el autor): https://huggingface.co/kevinedric/car-supply-chain-satisfaction
