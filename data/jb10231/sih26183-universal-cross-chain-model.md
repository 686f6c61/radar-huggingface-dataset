# jb10231/sih26183-universal-cross-chain-model

## Resumen

El modelo `jb10231/sih26183-universal-cross-chain-model` es un clasificador tabular basado en LightGBM diseñado para el triaje de riesgo en flujos de transacciones de criptomonedas. Desarrollado por el usuario jb10231, surge en el contexto del problema SIH26183 del Smart India Hackathon 2026, que busca identificar en tiempo real wallets vinculadas a fraude, rastrear movimientos de fondos entre cadenas y generar inteligencia accionable para investigadores. El modelo opera sobre Bitcoin, Ethereum y Solana, y convierte transacciones normalizadas en un grafo dirigido del que extrae 23 características estructurales (aunque la model card menciona "12", la lista real contiene 23), las estandariza con StandardScaler y produce una probabilidad de riesgo mediante un ensemble de gradient boosting.

La relevancia actual de este modelo radica en su enfoque "universal" o cross-chain: en lugar de entrenar un modelo por cadena, unifica las tres redes principales en un mismo espacio de features estructurales, lo que permite aplicarlo a contextos de investigación forense sin necesidad de reentrenamiento por blockchain. Su salida incluye probabilidad, decisión binaria según un umbral fijo (0.4554), nivel de riesgo, puntos de riesgo, estadísticas del grafo y puntuaciones por nodo. No es un modelo de lenguaje ni de visión; su pipeline es exclusivamente tabular y está pensado como señal analítica de apoyo, no como prueba concluyente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LightGBM (gradient boosting sobre árboles) con preprocesado de grafo dirigido y StandardScaler |
| Parametros totales | no disponible (LightGBM no expone un conteo de parámetros al estilo de redes neuronales; número de árboles y hojas no especificado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible (LightGBM trabaja con floats nativos; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (modelo numérico, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente archivo binario o JSON de LightGBM, pero no se especifica) |

## Arquitectura y entrenamiento

El pipeline declarado en la model card es el siguiente: transacciones blockchain normalizadas → grafo dirigido de flujo → extracción de características estructurales → estandarización con StandardScaler → modelo LightGBM → probabilidad de riesgo. Las 23 features listadas incluyen métricas de grafo (in_degree, out_degree, total_degree, degree_ratio, pagerank), métricas de actividad temporal (active_span, mean_event_time, event_time_std, recent_activity_age), métricas de volumen (log_in_volume, log_out_volume, log_total_volume, in_out_value_ratio) y métricas de concentración (inflow_concentration, outflow_concentration), además de indicadores booleanos como is_source e is_sink.

No se proporcionan datos sobre el conjunto de entrenamiento (número de muestras, composición, balance de clases), ni sobre hiperparámetros del LightGBM (número de árboles, profundidad, learning rate, regularización). Tampoco se documenta si se aplicó algún proceso de ajuste de umbral más allá del valor fijo 0.45545454545454545. La model card indica que el modelo está pensado para "investigation-support and research purposes", lo que sugiere un entrenamiento orientado a recall o a precisión según el caso, pero sin métricas publicadas no es posible confirmarlo.

## Capacidades

- Clasificación de riesgo de wallets o entidades en Bitcoin, Ethereum y Solana a partir de características estructurales de su actividad transaccional.
- Detección de patrones de flujo anómalos: nodos fuente (is_source), nodos sumidero (is_sink), ratios de grado y concentración de entradas/salidas.
- Generación de una probabilidad de riesgo continua, una decisión binaria según umbral, un nivel de riesgo discreto y puntos de riesgo acumulados.
- Salida enriquecida con estadísticas del grafo y puntuaciones por nodo, útil para visualización y análisis posterior.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso; es exclusivamente un clasificador tabular.
- Capacidad multilingüe: no aplica, al ser un modelo numérico sin procesamiento de lenguaje.

## Casos de uso

- Triaje inicial de wallets denunciadas en ciberfraude: un investigador introduce una dirección reportada en una denuncia (p. ej., a través de NCRP o SAHYOG) y el modelo devuelve una probabilidad de riesgo junto con las estadísticas de grafo, permitiendo priorizar los casos que requieren análisis manual profundo.
- Análisis de flujo de fondos entre cadenas: al normalizar transacciones de Bitcoin, Ethereum y Solana a una estructura común, el modelo puede aplicarse a rutas de lavado que cruzan varias blockchains, identificando nodos intermedios con alta concentración de entrada y salida.
- Detección de wallets intermediarias en esquemas de lavado: las features de degree_ratio, inflow_concentration y outflow_concentration permiten señalar direcciones que actúan como "mezcladoras" o pasamanos, típicas en esquemas de fraude por tareas o inversiones.
- Generación de alertas automáticas en plataformas de inteligencia: integrado en un pipeline de monitorización, el modelo puede emitir alertas cuando una wallet supera el umbral de riesgo, activando workflows de investigación en tiempo real.
- Apoyo a informes forenses: los investigadores pueden usar la probabilidad y las puntuaciones por nodo como evidencia complementaria en informes, siempre que se acompañen de verificación manual y trazabilidad on-chain.
- Clustering de wallets relacionadas: aunque el modelo no agrupa direcciones por sí mismo, sus puntuaciones por nodo pueden alimentar algoritmos de clustering para identificar redes de direcciones asociadas a un mismo esquema fraudulento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de precisión, recall, F1, AUC-ROC ni comparaciones con otros modelos de detección de riesgo en criptomonedas.

## Requisitos de hardware

- Modelo LightGBM de tamaño reducido (repo de 0.0 GB, solo model card; el peso del modelo no se ha publicado explícitamente). Inferencia viable en CPU sin GPU.
- Memoria RAM estimada: inferior a 1 GB para el modelo en sí, más el coste de construir el grafo dirigido y calcular las 23 features, que depende del volumen de transacciones a procesar.
- GPU recomendada: ninguna; el cuello de botella está en la construcción del grafo y el cálculo de PageRank, no en la inferencia del modelo.
- Compatible con hardware de consumo: sí, cualquier ordenador con Python y la librería LightGBM puede ejecutarlo.
- Opciones de despliegue: librería LightGBM nativa, servicios de inferencia como ONNX Runtime (si se exporta), o integración en pipelines de análisis con pandas/networkx.
- Latencia y throughput: no disponibles; dependerán del tamaño del grafo y del número de nodos a puntuar.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (clasificación de riesgo cross-chain con LightGBM) con los que establecer una comparación objetiva.

## Limitaciones y advertencias

- La model card es explícita: el modelo no establece responsabilidad penal, propiedad de wallets, atribución a VASP, intención ni culpabilidad legal. Es una señal analítica de triaje, no una prueba.
- No se publican datos de entrenamiento ni métricas de rendimiento, lo que impide evaluar su fiabilidad y su tasa de falsos positivos/negativos.
- El umbral de decisión (0.4554) es fijo y puede no ser óptimo para todos los escenarios; los equipos de investigación deberían recalibrarlo con datos locales.
- Solo cubre tres cadenas (Bitcoin, Ethereum, Solana); otras blockchains populares (Tron, BNB Chain, etc.) quedan fuera.
- Las features dependen de la calidad y completitud de los datos de transacción normalizados; grafos incompletos o con nodos aislados pueden producir puntuaciones engañosas.
- Al ser un modelo tabular, no captura dependencias secuenciales temporales complejas más allá de las features agregadas (active_span, mean_event_time, etc.).
- Licencia no especificada: el uso comercial o la redistribución del modelo requieren contactar al autor para aclarar términos.
- Riesgo de sesgo: sin información sobre el dataset de entrenamiento, no se puede descartar que el modelo esté sesgado hacia ciertos patrones de actividad o tamaños de transacción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jb10231/sih26183-universal-cross-chain-model
- Enunciado del problema SIH26183 (página oficial): https://sih2026.vuce.in/en/ps/SIH26183
- Vista alternativa del problema: https://sih2026-ps-viewer.vercel.app/ps/SIH26183
- Repositorio de referencia del problema (GitHub): https://github.com/jeevansai-hub/SIH-2026-/blob/main/ps_2026/SIH26183.md
- Proyecto relacionado de inteligencia blockchain (GitHub): https://github.com/spixcy/BlockChain-proj
