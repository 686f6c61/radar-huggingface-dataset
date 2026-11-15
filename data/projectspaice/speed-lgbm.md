# ProjectSpaice/speed-lgbm

## Resumen

SPEED es un artefacto de modelado tabular publicado por ProjectSpaice en Hugging Face, no un modelo de lenguaje. Consiste en un conjunto de instancias de LightGBM (gradient boosting sobre árboles) entrenadas de forma aislada, una por cada combinación cartera-mint, para predecir la siguiente fila de un flujo de transacciones de tokens en Solana. El repositorio contiene los boosters consolidados, los cabezales por instancia, las métricas y el script `speed.py` que reproduce todo el pipeline.

El modelo aborda un problema de predicción de series temporales financieras de alta frecuencia: dado el histórico de una cartera dentro de un mint (precio de mercado, lado de la operación, cantidad de tokens y SOL), anticipar la siguiente observación. La arquitectura es deliberadamente simple (4 cabezales por instancia, 8 hojas, 16 rondas, learning rate 0,1) y el interés del artefacto reside más en su metodología (aislamiento por cartera, aritmética entera exacta en lamports y ppm, consolidación colectiva entre mints) que en su rendimiento predictivo.

Es relevante ahora porque documenta con transparencia un resultado negativo: los propios autores concluyen que el siguiente precio de mercado se comporta como una martingala a ese horizonte y que el modelo no supera a la persistencia (predecir que el siguiente valor es el actual). El repositorio tiene 0 descargas y 0 likes, ocupa 0,5 GB y no declara licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting sobre árboles (LightGBM), 4 cabezales por instancia (mc, side, tokens, sol) |
| Parametros totales | no disponible (8 hojas y 16 rondas por cabezal; número de árboles por booster no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; cada muestra se construye con las filas 1..i de una instancia para predecir la fila i+1 |
| Tipos de cuantizacion | no disponible (no aplica a GBDT) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | boosters LightGBM serializados en `collective/` e `instances.tar.gz`; pipeline en `speed.py`; métricas en `metrics.json` |

## Arquitectura y entrenamiento

El sistema entrena una instancia LightGBM independiente por cada cartera dentro de un mint, creada en su primera compra (BUY). Cada instancia solo ve sus propias filas (`mc`, `side`, `tokens`, `sol`), sin dirección de mint, sin dirección de cartera y sin filas de otras carteras. Cada instancia tiene cuatro cabezales con 8 hojas, 16 rondas y learning rate 0,1. Los datos se procesan en orden de transacción `(slot, tx_index, mint, seq)` y todas las operaciones usan aritmética entera exacta: lamports, tokens y MC en int64, y ratios derivados en ppm enteros, sin coma flotante antes de LightGBM.

El entrenamiento cubrió 95 mints en orden de feed, generando 2.408 instancias, de las cuales 2.367 se evaluaron (41 omitidas por carteras de una sola fila, 0 errores). El conjunto de validación son las últimas 20% de filas de cada instancia: 98.198 filas retenidas. El cómputo total fue de 1.142 segundos en 8 núcleos de CPU. Además de los cabezales por instancia, se mantiene un artefacto colectivo de 4 boosters que se continúa 25 rondas en cada frontera de mint; las instancias se inicializan desde el colectivo tal como estaba al inicio de su mint y, al terminar cada mint, todo se consolida en el colectivo. No hay RLHF, DPO ni datos sintéticos: es aprendizaje supervisado sobre transacciones reales.

## Capacidades

- Predicción del siguiente valor de `mc` (market cap en SOL) a partir del histórico de una cartera en un mint.
- Predicción del siguiente `side` (clasificación, con HOLD como clase dominante).
- Predicción del siguiente número de `tokens` y del siguiente saldo/importe en `sol`.
- Aislamiento estricto por cartera: cada instancia no ve información de otras carteras ni del mint.
- Consolidación colectiva entre mints mediante boosters compartidos.
- Aritmética entera exacta en lamports y ppm, sin coma flotante.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo generativo.

## Casos de uso

- Investigación de microestructura de mercado en Solana: usar el pipeline `speed.py` como referencia reproducible para estudiar si existe señal de un tick en el mercado de memecoins, con la conclusión documentada de que no la hay a ese horizonte.
- Detección de comportamiento de salida (SELL) por cartera: aunque el recall agregado es bajo (2,74%), el artefacto permite analizar mints concretos con salidas densas, como BTFcWPK83b, que alcanza 0,91 de recall de SELL.
- Construcción de líneas base para modelos más complejos: los resultados de persistencia (MAE 0,998 SOL para `mc`, 0,111 SOL para `sol`) sirven como referencia obligatoria antes de proponer modelos más caros.
- Auditoría de pipelines de datos financieros: la comprobación de reconstrucción exacta de HOLD (9.873 de 96.093 reconstrucciones exactas, diferencia mediana máxima de 257.645 lamports) es útil para validar que la conversión `mc → vq` con división entera no es biyectiva y exige el estado de reservas.
- Reproducción de experimentos de GBDT a escala de cartera: el script único y las métricas por mint e instancia permiten replicar el estudio en otros feeds con el mismo formato de entrada.
- Formación y docencia sobre evaluación honesta de modelos: el repositorio es un ejemplo de reporte de resultados negativos frente a líneas base triviales, útil para enseñar a no sobreinterpretar métricas agregadas.

## Benchmarks y rendimiento

Resultados sobre la cola retenida (98.198 filas) frente a líneas base triviales:

| Objetivo | Métrica | Modelo | Línea base | Veredicto |
|---|---|---|---|---|
| side | exactitud agrupada | 0,9740 | 0,9786 (siempre HOLD) | sin mejora |
| side | exactitud media por instancia | 0,8271 | no disponible | no disponible |
| side | recall de SELL | 0,0274 | 0,0 | aprende a mantener, no a salir |
| mc | MAE (SOL) | 9,61 | 0,998 (siguiente = actual) | 10 veces peor que persistencia |
| mc | exactitud de dirección | 0,400 | 0,500 (moneda) | sin señal de un paso |
| tokens | MAE (tokens) | 3,86e13 | no disponible | pobre |
| sol | MAE (SOL) | 0,673 | 0,111 (siguiente = actual) | peor que persistencia |
| matemáticas | reconstrucciones HOLD exactas | 9.873 / 96.093 (10,3%) | no disponible | diferencia máxima mediana de 257.645 lamports |

## Requisitos de hardware

- CPU: el pipeline completo se ejecutó en 8 núcleos en 1.142 segundos; no requiere GPU.
- Memoria: el repositorio ocupa 0,5 GB; el conjunto de datos de entrada (`feed.csv` y `views/`) no está incluido y su tamaño no está disponible.
- GPU: no aplica; LightGBM en este estudio se ejecutó en CPU.
- Despliegue: ejecución directa con `SPEED_PUSH_REPO=ProjectSpaice/speed-lgbm SPEED_WORKERS=8 python speed.py`; no hay integración documentada con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput de inferencia: no disponibles; solo se documenta el tiempo de entrenamiento y evaluación.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SPEED (speed-lgbm) | LightGBM por cartera-mint | no disponible | no aplica | peor que persistencia en mc y sol | no disponible | Hugging Face, 0 descargas |
| Persistencia (siguiente = actual) | línea base trivial | 0 | no aplica | MAE 0,998 SOL en mc; 0,111 SOL en sol | no aplica | trivial de implementar |
| Clasificador mayoritario (siempre HOLD) | línea base trivial | 0 | no aplica | exactitud 0,9786 en side | no aplica | trivial de implementar |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El propio autor concluye que el siguiente MC se comporta como una martingala a ese horizonte: el modelo ajusta ruido y no supera a la persistencia.
- El clasificador de `side` está dominado por HOLD (98,9% de las filas); el recall de SELL agrupado es del 2,74%, por lo que no es fiable para decisiones de salida.
- La exactitud por instancia (0,8271) es inferior a la exactitud agrupada (0,9740), lo que indica que el resultado agregado está inflado por instancias con comportamiento mayoritario.
- La reconstrucción exacta de la valoración HOLD desde el MC no es posible por la división entera many-to-one; se necesita el estado de reservas para ser bit-exacto.
- Licencia no declarada: no hay autorización explícita para uso comercial ni para redistribución.
- El pipeline depende de un bucket privado (`ProjectSpaice/speed`) con `feed.csv` y `views/`; sin acceso a esos datos no es reproducible.
- No es un modelo de lenguaje: no admite prompts, tool calling ni generación de texto; cualquier uso fuera del dominio tabular descrito es inadecuado.
- Sin datos publicados sobre sesgos demográficos o lingüísticos; el riesgo relevante es la extrapolación indebida de sus métricas a otros mercados u horizontes temporales.

## Enlaces

- Hugging Face: https://huggingface.co/ProjectSpaice/speed-lgbm
- Repositorio de datos privado referenciado: `ProjectSpaice/speed` (bucket privado, no accesible públicamente)
- No se han encontrado papers, blogs, repositorios públicos ni demos adicionales en la información proporcionada.
