# meridianal/ARA.AI

## Resumen

Ara.AI es un modelo de aprendizaje automático para predicción de retornos bursátiles desarrollado por MeridianAlgo, una iniciativa de investigación cuantitativa. El repositorio aloja dos generaciones de modelos: la versión actual (v8) es un ensemble de tres regresores de gradiente boosting que ordena acciones por su retorno esperado relativo a la media del universo, mientras que la v7 (un transformer con arquitectura Mamba-2 + MoE) queda congelada con fines de reproducibilidad. El problema que resuelve es la selección de valores para estrategias long/short neutrales al mercado, un área donde los modelos lineales o de boosting suelen superar a las redes profundas por su robustez con datos tabulares ruidosos.

La relevancia actual radica en su enfoque honesto y transparente: los autores publican métricas de walk-forward, reconocen que el edge medido es pequeño (IC diario medio de +0.0205, t-statístico de 2.26) y advierten explícitamente de las limitaciones de costes, supervivencia y significancia estadística. El modelo no es un LLM ni procesa lenguaje; es un sistema de ML clásico sobre características numéricas diarias de mercado. El repositorio pesa 48.9 GB, pero eso incluye los checkpoints v7 en PyTorch; el modelo v8 es un archivo joblib de tamaño reducido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de 3 HistGradientBoostingRegressor (sklearn) promediados |
| Parametros totales | No disponible (modelo basado en árboles, sin parámetros de red neuronal) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es modelo de lenguaje) |
| Tipos de cuantizacion | No aplica (modelo sklearn, no requiere cuantización) |
| Idiomas soportados | No disponible (modelo numérico, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | joblib (v8), PyTorch .pt (v7) |

## Arquitectura y entrenamiento

La versión v8 utiliza tres `HistGradientBoostingRegressor` con 400 iteraciones, 15 nodos hoja, tasa de aprendizaje 0.03, regularización L2 de 1.0, `max_features` 0.7 y sin early stopping. Las predicciones de las tres semillas se promedian. Las características son aproximadamente 40 variables diarias por símbolo y fecha, todas invariantes a escala: retornos multi-horizonte, volatilidad realizada, shocks normalizados por volatilidad, distancias a medias móviles, estructura de rango intradía/gap, ATR, RSI de Wilder, z-scores de volumen y distancias a máximos/mínimos de 52 semanas. Ocho de estas características se transforman adicionalmente en percentiles cross-seccionales dentro del día. El target es el retorno forward demediado cross-seccionalmente y winsorizado a 4 desviaciones estándar diarias. El entrenamiento se realiza con walk-forward de ventana expansiva, 4 pliegues entre junio de 2025 y agosto de 2026, reentrenando desde cero antes de cada pliegue con un embargo de 1 día entre entrenamiento y test. El universo son 99 símbolos, con una mediana de 70 nombres negociables por día.

La v7, por el contrario, era un transformer con atención eficiente (GQA + Flash Attention 2) y capas Mamba-2 SSM, pero su evaluación posterior demostró que no tenía edge predictivo (precisión direccional de 50.23% frente a un baseline siempre-al-alza de 51.44%). Por eso se congeló y se sustituyó por el enfoque de boosting.

## Capacidades

- Predicción de retorno relativo al promedio del universo para el día siguiente (ranking cross-seccional).
- Generación de señales para estrategias dollar-neutral long/short (comprar los mejores, vender los peores).
- Manejo de características numéricas de series temporales financieras (retornos, volatilidad, indicadores técnicos).
- No tiene capacidades de generación de texto, código, razonamiento, visión, tool calling ni agentes.
- No es multilingüe; opera exclusivamente sobre datos numéricos.
- No incluye modo de pensamiento ni procesamiento de audio.

## Casos de uso

- Construcción de carteras long/short neutrales al mercado: el modelo genera un ranking diario de acciones; el usuario puede tomar las 5 mejores y las 5 peores para una estrategia de reversión a corto plazo.
- Investigación cuantitativa y backtesting: los investigadores pueden usar el modelo como baseline de ML para comparar con otros enfoques de selección de valores.
- Validación de hipótesis de eficiencia de mercado: las métricas publicadas (IC, t-statístico, hit rate) permiten evaluar si existe un edge explotable en el universo de 99 grandes capitalizaciones.
- Educación en ML aplicado a finanzas: el código y los documentos de diseño (docs/ARA_V8.md) sirven como ejemplo de buenas prácticas en walk-forward, embargo temporal y manejo de sesgos de supervivencia.
- Análisis de señales de corto plazo: el modelo produce una puntuación diaria que puede integrarse en pipelines de análisis cuantitativo, aunque con la advertencia de que es pre-coste y no significativa individualmente.
- Reproducibilidad de experimentos: los checkpoints v7 congelados permiten replicar los resultados negativos de la generación anterior, útil para entender por qué fallaron los transformers en este dominio.

## Benchmarks y rendimiento

La model card reporta métricas de walk-forward expandiente sobre 297 días de test (2025-06-02 a 2026-08-06), con 4 pliegues y reentrenamiento completo antes de cada uno. Los resultados son:

| Metrica | Valor | Referencia |
|---|---|---|
| IC diario medio (rank IC) | +0.0205 | 0.0 = sin habilidad |
| t-statístico del IC | +2.26 | > 2 es el umbral de significancia |
| Tasa de acierto del IC | 56.6% de los días | 50% = sin habilidad |
| Spread long/short (top-5 vs bottom-5) | +18.6 pb/día | — |
| Sharpe anualizado long/short (pre-coste) | +1.58 | — |
| Baseline de reversión a 1 día | IC +0.0025, −8.4 pb/día | v8 lo supera |
| Precisión direccional sobre el residual | 51.03% | 50% = sin habilidad |

El IC es positivo en los cuatro pliegues, pero el autor advierte que un pliegue (+0.0405) contribuye desproporcionadamente a la media, mientras que los otros tres rondan +0.013 con t < 1 individualmente. Las cifras long/short son pre-coste y no sobrevivirían a comisiones de trading diario con cinco nombres por lado. La v7, en comparación, no mostró edge (precisión direccional de 50.23% en acciones y 48.68% en forex, ambas por debajo del baseline siempre-al-alza).

## Requisitos de hardware

- El modelo v8 es un archivo joblib con tres árboles de boosting; se ejecuta en CPU sin necesidad de GPU.
- Requisitos de RAM estimados: menos de 1 GB para cargar el modelo y las características (el archivo joblib no tiene un tamaño publicado, pero el repo completo pesa 48.9 GB debido a los checkpoints v7 en PyTorch).
- Cualquier máquina con Python y scikit-learn puede ejecutarlo, incluyendo instancias cloud pequeñas o un portátil convencional.
- Para la v7 (transformer), se requeriría una GPU con al menos 16 GB de VRAM, pero está congelada y no se recomienda su uso.
- Opciones de despliegue: no aplica vLLM, llama.cpp u Ollama; se integra directamente en scripts Python con `joblib.load()` y `predict()`.
- Latencia: inferencia en milisegundos para un lote de 70 símbolos, dado el pequeño tamaño del ensemble.

## Comparativa con modelos similares

No hay modelos comparables publicados con la misma metodología y transparencia. Se puede comparar con la v7 del mismo autor y con un baseline de reversión a 1 día:

| Modelo | IC diario | Precisión direccional | Observaciones |
|---|---|---|---|
| Ara.AI v8 (boosting) | +0.0205 | 51.03% | Edge pequeño, no significativo individualmente |
| Ara.AI v7 (transformer) | no reportado | 50.23% (acciones) | Sin edge, por debajo del baseline |
| Baseline 1-day reversal | +0.0025 | — | Referencia simple |

La licencia MIT permite uso comercial, pero las limitaciones estadísticas y de costes hacen que no sea adecuado para trading real sin un análisis adicional.

## Limitaciones y advertencias

- Solo funciona con acciones de gran capitalización de EE. UU. (99 nombres, mediana de 70 negociables por día); no aplica a forex (el autor encontró fugas de información en datos diarios de FX).
- Universo reducido: 5 nombres por lado implica pocas apuestas independientes, lo que aumenta la volatilidad del P&L.
- Solo predice retorno diario close-to-close; no hay horizonte intradía ni multi-día.
- Las métricas son pre-coste: no se modelan comisiones, slippage, costes de préstamo ni capacidad.
- Sesgo de supervivencia: la lista de símbolos corresponde a los grandes valores actuales; las empresas excluidas no aparecen en el histórico.
- El edge medido es pequeño y no estadísticamente robusto: un solo pliegue contribuye la mayor parte del IC medio, y el t-statístico de 2.26 supera el umbral convencional por poco.
- No es un sistema de trading completo; el autor recomienda uso exclusivo para investigación y educación.
- No se proporcionan datos de entrenamiento ni el dataset completo; solo el código para construirlos desde una base de datos SQLite.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/meridianal/ARA.AI
- Repositorio GitHub: https://github.com/MeridianAlgo/AraAI
- Documento de diseño de v8: https://github.com/MeridianAlgo/AraAI/blob/main/docs/ARA_V8.md
- Página alternativa en Hugging Face (MeridianAlgo): https://huggingface.co/MeridianAlgo/ARA.AI
