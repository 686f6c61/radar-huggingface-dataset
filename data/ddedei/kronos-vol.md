# ddedei/Kronos-Vol

## Resumen

Kronos-Vol es un ajuste fino completo (full fine-tuning) del modelo Kronos-small de NeoQuasar, especializado en la previsión de volatilidad realizada (realized volatility) para acciones estadounidenses. Desarrollado por el usuario ddedei, el modelo toma como entrada las últimas 256 velas de 5 minutos de una acción junto con nueve características clásicas de volatilidad, y devuelve una predicción de la varianza realizada de la siguiente sesión de negociación (suma de los retornos al cuadrado de las velas de 5 minutos).

El modelo no predice la dirección del movimiento del precio, sino únicamente su magnitud. Está pensado como una entrada de riesgo para el dimensionamiento de posiciones, la asignación de objetivos de volatilidad (volatility targeting) y la investigación de opciones. Su relevancia radica en que, según el autor, supera al modelo HAR-RV —el estándar de la literatura de volatilidad— en un 8,9% en QLIKE calibrado sobre 39 acciones estadounidenses de gran capitalización nunca vistas durante el entrenamiento, en el periodo de julio de 2024 a noviembre de 2026.

El modelo se distribuye bajo licencia MIT, con pesos en formato PyTorch, y su repositorio ocupa aproximadamente 0,3 GB. La arquitectura subyacente es la de Kronos-small, un modelo basado en transformer entrenado sobre datos de velas financieras, cuyo tokenizador permanece congelado durante el ajuste fino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Kronos-small, tokenizador congelado durante el fine-tuning) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 velas de 5 minutos más 9 características de volatilidad |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo numérico de series temporales) |
| Licencia | MIT |
| Formato de pesos | PyTorch (safetensors/bin según repositorio, no especificado) |

## Arquitectura y entrenamiento

Kronos-Vol parte de Kronos-small, un modelo transformer preentrenado sobre secuencias de velas financieras. Durante el ajuste fino se congela el tokenizador del modelo base y se entrena la red completa para una tarea de regresión: predecir la varianza realizada de la siguiente sesión a partir de las últimas 256 velas de 5 minutos y nueve características clásicas de volatilidad. La pérdida original era de error cuadrático, a la que posteriormente se añadió QLIKE en la receta publicada.

El protocolo de entrenamiento emplea 199 acciones estadounidenses de gran capitalización con barras de 5 minutos de SIP. Se reservan 40 acciones (semilla fija) completamente fuera de entrenamiento y validación. El conjunto de entrenamiento abarca de julio de 2021 a diciembre de 2023, la validación de enero a junio de 2024 y el test de julio de 2024 al 10 de noviembre de 2026. Se promedian tres semillas. El autor señala que el preentrenamiento de Kronos parece terminar a mediados de 2024, por lo que todas las métricas reportadas provienen de datos posteriores a esa fecha, evitando fuga de información. Como control experimental, se entrena la misma red con pesos aleatorios y una variante sin Kronos (solo la cabeza de predicción sobre las nueve características), lo que permite aislar la contribución del preentrenamiento.

## Capacidades

- Predicción de volatilidad realizada de la siguiente sesión para acciones estadounidenses a partir de velas de 5 minutos.
- Procesamiento de secuencias intraday de 256 velas más nueve características clásicas de volatilidad.
- Generalización a acciones no vistas durante el entrenamiento (39 de 39 con mejora frente a HAR-RV).
- Capacidad de servir como señal de riesgo para dimensionamiento de posiciones y volatility targeting.
- No predice la dirección del movimiento del precio; únicamente su magnitud.
- No dispone de soporte documentado de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales.
- No se documentan capacidades multilingües (el modelo opera sobre datos numéricos, no texto).

## Casos de uso

- Dimensionamiento de posiciones: la predicción de volatilidad de la siguiente sesión permite escalar el tamaño de cada posición inversamente a la volatilidad esperada, estabilizando el riesgo de la cartera. El autor reporta una mejora de la regularidad del riesgo (0,369 frente a 0,663 de buy and hold) en una cesta equiponderada de 12 valores.
- Volatility targeting: el modelo sirve para ajustar la exposición diaria de una cartera long-only de modo que la volatilidad realizada se mantenga cerca de un objetivo, usando la predicción como denominador del peso.
- Investigación de opciones: la previsión de varianza realizada de la siguiente sesión puede alimentar modelos de valoración y estrategias de volatilidad (straddles, strangles, calendar spreads) que dependen de la volatilidad esperada a corto plazo.
- Gestión de riesgo intradía: con barras de 5 minutos como entrada, el modelo puede recalcularse a lo largo de la sesión para monitorizar el riesgo de exposiciones abiertas y activar alertas cuando la volatilidad prevista supere umbrales.
- Filtro de régimen de mercado: la predicción de volatilidad puede emplearse como señal para reducir exposición en periodos de volatilidad esperada elevada, complementando estrategias de momentum o reversión.
- Benchmarking de modelos de volatilidad: dado que el autor publica comparaciones controladas frente a HAR-RV, LightGBM y variantes sin Kronos, el modelo sirve como referencia para evaluar nuevas propuestas de previsión de volatilidad con el mismo protocolo (QLIKE calibrado, Diebold-Mariano, Rank IC).
- Análisis de cartera multi-activo: el Rank IC de 0,733 entre acciones indica que el modelo ordena razonablemente bien las acciones por volatilidad esperada, lo que permite construir cestas con exposición de riesgo equilibrada.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente). Protocolo: 199 acciones estadounidenses de gran capitalización, barras de 5 minutos de SIP, 40 acciones reservadas, test de julio de 2024 al 10 de noviembre de 2026 (39 acciones con datos, 22.637 días-acción).

| Modelo | QLIKE calibrado | Mejora vs HAR-RV | DM t vs HAR-RV | R² (log RV) | Rank IC |
|---|---|---|---|---|---|
| Kronos-Vol | 0,1790 | +8,9% | -4,85 | 0,562 | 0,733 |
| Misma cabeza sin Kronos | 0,1849 | +5,9% | -3,58 | 0,558 | 0,731 |
| LightGBM, mismas 9 características | 0,1889 | +3,8% | -3,80 | 0,552 | 0,727 |
| HAR + características extra | 0,1885 | +4,1% | -3,06 | 0,551 | 0,728 |
| HAR-RV | 0,1965 | +0,0% | — | 0,533 | 0,722 |
| Varianza realizada de ayer | 0,2405 | -22,4% | +7,34 | 0,370 | 0,654 |

Resultados adicionales reportados:

- Por año (QLIKE calibrado): 2024, 0,1874 frente a 0,2044 de HAR-RV; 2025, 0,1946 frente a 0,2207; 2026, 0,1543 frente a 0,1635.
- Kronos sin ajuste (zero-shot, muestreo de 78 velas, 16 trayectorias) sobre 1.289 días-acción: QLIKE calibrado 0,2444, frente a 0,1719 del modelo ajustado y 0,1870 de HAR-RV en esas filas.
- SPY y QQQ (nunca en entrenamiento): QLIKE calibrado 0,2212 frente a 0,2397 de HAR-RV (DM t -2,28); la cabeza sin Kronos obtiene 0,2206.
- Sesiones frescas (11 al 23 de noviembre de 2026, 188 acciones): QLIKE calibrado 0,1209 frente a 0,1194 de HAR-RV y 0,1213 de la cabeza sin Kronos.
- En cartera (cesta equiponderada de 12 valores, long-only, julio 2024 a noviembre 2026): Sharpe 1,32 con Kronos-Vol frente a 1,30 con HAR-RV; la diferencia no es estadísticamente significativa según bootstrap de bloques estacionarios.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,3 GB, lo que sugiere que el modelo cabe holgadamente en cualquier GPU consumer, pero el autor no publica cifras de VRAM.
- GPU recomendadas: no disponible. Por el tamaño del repositorio, es probable que quepa en GPUs consumer (RTX 3060, RTX 4090), aunque no se confirma en la información disponible.
- Opciones de despliegue: PyTorch (librería declarada). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no son adecuadas para un modelo de regresión sobre series temporales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / entrada | QLIKE calibrado (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kronos-Vol | Fine-tune de Kronos-small | 256 velas de 5 min + 9 características | 0,1790 | MIT | Hugging Face |
| HAR-RV | Modelo econométrico clásico | Varianza realizada diaria | 0,1965 | — (metodología publicada) | Implementación propia |
| LightGBM (9 características) | Gradient boosting | 9 características de volatilidad | 0,1889 | — (implementación propia) | Implementación propia |
| Kronos-small (zero-shot) | Transformer preentrenado | 256 velas de 5 min | 0,2444 (muestra de 1.289 días-acción) | no disponible en la información | Hugging Face (NeoQuasar/Kronos-small) |

## Limitaciones y advertencias

- El modelo no predice la dirección del movimiento del precio; usarlo como señal direccional no es adecuado y el autor advierte que las llamadas direccionales de Kronos sin ajuste no superaron a buy and hold en una prueba independiente.
- No constituye una estrategia de trading por sí mismo: es una entrada de riesgo para dimensionamiento, volatility targeting e investigación de opciones.
- La mejora en Sharpe frente al dimensionamiento con HAR-RV no es estadísticamente significativa (bootstrap de bloques estacionarios con bloques de 21 días).
- Los resultados en sesiones frescas (noviembre de 2026) muestran un QLIKE calibrado ligeramente peor que HAR-RV (0,1209 frente a 0,1194), aunque el autor indica que son demasiadas pocas sesiones para extraer conclusiones.
- El modelo está entrenado exclusivamente con acciones estadounidenses de gran capitalización; su comportamiento en otros mercados, clases de activo o capitalizaciones menores no está documentado.
- El preentrenamiento de Kronos parece terminar a mediados de 2024; los resultados se limitan a datos posteriores, pero no se documenta el comportamiento en regímenes de mercado anteriores.
- Riesgo de sobreajuste a las características y al protocolo de evaluación del autor; los benchmarks no están verificados de forma independiente.
- No se documentan sesgos conocidos, limitaciones idiomáticas ni restricciones de licencia para uso comercial más allá de la licencia MIT.
- Para producción, conviene monitorizar la degradación de la calibración (QLIKE) y recalibrar periódicamente, dado que la relación entre volatilidad predicha y realizada puede desplazarse con el régimen de mercado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ddedei/Kronos-Vol
- Modelo base: https://huggingface.co/NeoQuasar/Kronos-small
- Paper de Kronos (arXiv:2508.02739): https://arxiv.org/abs/2508.02739
- Referencia arXiv:2505.11163: https://arxiv.org/abs/2505.11163
- Referencia arXiv:2607.05291: https://arxiv.org/abs/2607.05291
