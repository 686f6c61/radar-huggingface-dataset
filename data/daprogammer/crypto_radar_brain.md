# DaProgammer/crypto_radar_brain

## Resumen

El modelo `DaProgammer/crypto_radar_brain` es un clasificador supervisado basado en scikit-learn, desarrollado por DaProgammer como motor de predicción para la plataforma CryptoRadar. Su objetivo es pronosticar la tendencia direccional a corto plazo de criptomonedas, clasificando el mercado en tres categorías: alcista (bullish), bajista (bearish) o neutral. El modelo utiliza un vector de 10 características que combina indicadores técnicos (volumen, RSI, volatilidad, distancia de SMA) con métricas de sentimiento de mercado (sentimiento de la moneda, tendencia del sentimiento, y datos equivalentes para Bitcoin).

La relevancia de este modelo radica en su enfoque híbrido: integra análisis técnico clásico con análisis de sentimiento, una práctica común en sistemas de trading algorítmico modernos. Al estar publicado con licencia MIT y ser un modelo de pequeño tamaño (repo de 0.0 GB), está pensado para fines educativos y de investigación, no para uso comercial en trading real. Es un modelo de clasificación tabular, no un modelo de lenguaje, por lo que su alcance se limita a la predicción de tendencias sobre datos estructurados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Clasificador scikit-learn (algoritmo concreto no especificado) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular) |
| Tipos de cuantización | no aplica (modelo sklearn, no requiere cuantización) |
| Idiomas soportados | en (etiquetas y variables en inglés) |
| Licencia | MIT |
| Formato de pesos | no disponible (típicamente joblib/pickle en sklearn) |

## Arquitectura y entrenamiento

El modelo es un clasificador supervisado de scikit-learn, aunque no se especifica el algoritmo concreto (podría ser Random Forest, Gradient Boosting, SVM, etc.). El entrenamiento se realiza sobre un dataset con 10 características numéricas que representan tanto variables técnicas como de sentimiento. Las características incluyen: `volume`, `dxy_index` (índice del dólar), `price_change_pct`, `rsi`, `volatility`, `dist_from_sma` y cuatro variables de sentimiento (`sentiment_coin`, `sentiment_trend_coin`, `sentiment_btc`, `sentiment_trend_btc`). No se han publicado detalles sobre el tamaño del dataset de entrenamiento, el número de épocas, ni el método de optimización.

## Capacidades

- Clasificación tabular de tres clases (bullish, bearish, neutral).
- Predicción de tendencia a corto plazo basada en indicadores técnicos (RSI, volatilidad, distancia de SMA).
- Integración de análisis de sentimiento de la moneda objetivo y de Bitcoin.
- Función de predicción única, sin soporte para tool calling, agentes o razonamiento multi-paso.
- Capacidades multilingües limitadas a inglés en las etiquetas de entrada.

## Casos de uso

- **Educación en ML financiero**: sirve como ejemplo didáctico de cómo aplicar scikit-learn a problemas de clasificación en mercados financieros, ilustrando el uso de características técnicas y de sentimiento.
- **Prototipado de plataformas de análisis de criptomonedas**: la plataforma CryptoRadar usa este modelo como motor de predicción; puede ser integrado en proyectos similares para evaluar la viabilidad de estrategias de análisis técnico-sentimental.
- **Investigación académica**: permite estudiar la influencia de variables de sentimiento en la predicción de tendencias de criptomonedas, comparando su impacto frente a indicadores puramente técnicos.
- **Simulación de carteras**: en entornos de backtesting, el modelo puede generar señales de compra/venta para simular estrategias de inversión sin riesgo de capital real.
- **Análisis de correlación de mercado**: al incluir `dxy_index` y variables de Bitcoin, puede utilizarse para estudiar la relación entre el dólar, Bitcoin y altcoins en contextos de investigación.
- **Ejemplo de despliegue de modelos sklearn**: sirve como referencia para integrar un clasificador sklearn en una API REST o en un pipeline de datos, dado su bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona la métrica `accuracy` en los metadatos, pero no se proporcionan valores numéricos ni comparaciones con otros modelos.

## Requisitos de hardware

- **VRAM**: no requiere GPU; es un modelo sklearn de tamaño muy reducido (repo de 0.0 GB).
- **CPU**: puede ejecutarse en cualquier CPU moderna, incluso en sistemas de bajo consumo.
- **GPU recomendadas**: no aplica.
- **Despliegue**: al ser sklearn, se puede servir con herramientas como Flask, FastAPI, MLflow, o exportarse a ONNX para despliegue en entornos de producción ligeros.
- **Latencia**: inferencia en milisegundos, incluso en hardware básico, dado el pequeño tamaño del modelo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (clasificación de tendencia de criptomonedas con sklearn). Existen modelos de ML en HuggingFace para trading, pero no se han identificado alternativas directas con características y licencia equivalentes en la información disponible.

## Limitaciones y advertencias

- **Uso exclusivamente educativo**: el autor indica explícitamente que el modelo no debe usarse para trading real, solo con fines educativos y de portfolio.
- **Riesgo de alucinación**: no aplica, pero los modelos de clasificación tabular pueden sobreajustarse a datos de entrenamiento y fallar en condiciones de mercado no vistas.
- **Contexto limitado**: solo considera 10 características, sin información de ordenes de libro, profundidad de mercado o eventos macroeconómicos.
- **Idioma**: las variables de sentimiento están en inglés, lo que limita su aplicación a mercados donde el sentimiento se mide en ese idioma.
- **Licencia MIT**: permite uso comercial, pero el autor desaconseja explícitamente su uso para trading real.
- **Sin actualizaciones**: el modelo fue creado en 2026 y no se han publicado actualizaciones; los mercados de criptomonedas cambian rápidamente, por lo que su precisión puede degradarse.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/DaProgammer/crypto_radar_brain)
- No se encontraron enlaces adicionales en la búsqueda web que sean relevantes para este modelo específico. Los resultados de búsqueda sobre "Top Web3 AI Projects" o "Best AI Crypto" no contienen información sobre este modelo concreto.
