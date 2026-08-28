# Kosmosas/BERT-bitcoin-sentiment

## Resumen

Kosmosas/BERT-bitcoin-sentiment es un modelo de análisis de sentimiento financiero especializado en titulares de noticias sobre Bitcoin. Desarrollado por Kosmosas, consiste en un fine-tuning del modelo FinBERT (yiyanghkust/finbert-tone) para predecir el impacto a corto plazo en el precio de Bitcoin de un titular, devolviendo una puntuación continua en lugar de una etiqueta de clase. El modelo se publica junto con un paper y su código está disponible en GitHub.

La arquitectura se basa en `BertForSequenceClassification` con una cabeza de regresión lineal sobre los logits de tono. Se entrenan únicamente los dos últimos bloques del encoder (14,18 millones de parámetros de un total de 109,8 millones), manteniendo el resto congelado. La salida es lineal, sin función tanh, y la longitud máxima de secuencia es de 128 tokens. El repositorio incluye seis checkpoints correspondientes a ventanas temporales out-of-fold, siendo el fold 6 el modelo recomendado para puntuar nuevos titulares.

La relevancia del modelo radica en su enfoque de regresión para sentimiento financiero, una alternativa a la clasificación tradicional. Sin embargo, sus resultados out-of-sample son débiles (correlación de 0,076 en el fold 6) y el propio autor advierte que no es un predictor fiable del precio, sino una señal condicional débil. A pesar de ello, su metodología de validación out-of-fold con purga temporal es rigurosa y evita el look-ahead.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BertForSequenceClassification con cabeza de regresión lineal (Linear(3,1)) |
| Parametros totales | 109,8 millones (14,18 millones entrenables) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 tokens (máxima longitud de secuencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch .pth |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura BERT base de `BertForSequenceClassification` con `num_labels=3`, correspondiente a los tres tonos de FinBERT (positivo, negativo, neutral). Sobre los logits de salida se añade una capa `Linear(3, 1)` que produce una puntuación continua de impacto en el precio. Los dos últimos bloques del encoder son entrenables; el resto del backbone permanece congelado. No se aplica función de activación tanh en la salida, por lo que las puntuaciones no están acotadas a [-1, 1].

El entrenamiento se realizó en seis folds con ventana expandida y purga de un día alrededor de cada frontera temporal. Cada fold se entrena solo con datos estrictamente anteriores y puntúa su propio intervalo de tiempo, evitando así el look-ahead. El conjunto de entrenamiento varía desde 2.261 muestras en el fold 1 hasta 16.187 en el fold 6. Los datos consisten en titulares de noticias financieras sobre Bitcoin y su impacto en el precio (variable `volume_surge_price`). No se especifica el número total de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO.

Una innovación destacable es el esquema de calibración por fold: cada checkpoint tiene su propia media y desviación estándar de validación, y las puntuaciones se estandarizan para hacerlas comparables entre folds. Esto es necesario porque cada modelo tiene una escala de salida distinta.

## Capacidades

- Regresión de sentimiento financiero: predice una puntuación continua del impacto a corto plazo de un titular de noticias sobre el precio de Bitcoin.
- Clasificación de sentimiento en tres tonos (positivo, negativo, neutral) a través de los logits internos de FinBERT.
- Procesamiento de texto en inglés, específicamente titulares de noticias financieras y criptomonedas.
- No soporta generación de texto, tool calling, agentes, visión ni audio. Es exclusivamente un modelo de clasificación/regresión de texto.
- No incluye modo de razonamiento ni capacidades multilingües más allá del inglés.

## Casos de uso

- Análisis de sentimiento de noticias cripto para trading algorítmico: el modelo puede integrarse en pipelines que procesan titulares en tiempo real y generan señales de entrada o salida. Su puntuación continua permite umbrales ajustables según la estrategia.
- Monitoreo de noticias para inversores particulares: una aplicación puede mostrar una puntuación normalizada por titular, ayudando a filtrar noticias potencialmente relevantes para el precio de Bitcoin.
- Investigación académica sobre el impacto de noticias en criptomonedas: los checkpoints out-of-fold permiten reproducir estudios de correlación entre sentimiento y movimientos de precio sin riesgo de sobreajuste temporal.
- Backtesting de estrategias basadas en sentimiento: el modelo puede utilizarse para generar características históricas en conjuntos de datos de backtesting, aunque el autor advierte que no supera la prueba Diebold-Mariano en predicción puntual.
- Alertas personalizadas para traders: combinando la puntuación con umbrales, se pueden enviar notificaciones cuando un titular tenga un impacto previsto alto (positivo o negativo).
- Evaluación de campañas de comunicación en empresas cripto: para medir cómo los comunicados de prensa afectan al sentimiento del mercado y al precio a corto plazo.

## Benchmarks y rendimiento

La model card proporciona correlaciones out-of-fold contra la variable objetivo `volume_surge_price` para cada checkpoint:

| Checkpoint | Periodo puntuado | Correlación out-of-fold |
|---|---|---|
| fold1 | 2020-01 → 2021-01 | −0.032 |
| fold2 | 2021-01 → 2022-01 | +0.018 |
| fold3 | 2022-01 → 2023-01 | −0.012 |
| fold4 | 2023-01 → 2024-01 | +0.034 |
| fold5 | 2024-01 → 2024-06 | +0.127 |
| fold6 | 2024-06 → 2025-07 | +0.076 |

El autor indica que, en el paper adjunto, ningún conjunto de características que incluya esta puntuación supera a un pronóstico de cambio cero en una prueba Diebold-Mariano. Por tanto, el modelo debe tratarse como una señal condicional débil, no como un predictor fiable. No se publican otros benchmarks como MMLU, HumanEval o GSM8K, ya que no son aplicables a esta tarea.

## Requisitos de hardware

- El modelo es BERT-base (109,8 millones de parámetros), por lo que es ligero para inferencia.
- En FP32, los pesos ocupan aproximadamente 440 MB; en FP16, unos 220 MB. Cabe en cualquier GPU consumer con 4 GB de VRAM o más.
- Para inferencia, una GPU como RTX 3060 o superior es suficiente. También puede ejecutarse en CPU, aunque con mayor latencia.
- Para entrenamiento o fine-tuning adicional, se recomienda al menos 8 GB de VRAM (por ejemplo, RTX 3070 o superior), aunque no se especifican requisitos oficiales.
- Opciones de despliegue: al ser un modelo PyTorch estándar, puede servirse con vLLM, TGI o Hugging Face Inference Endpoints, aunque al no ser un modelo generativo, el uso típico es mediante llamadas directas a PyTorch. También es compatible con llama.cpp si se convierte a GGUF, pero no se proporcionan conversiones oficiales.
- No se dispone de datos de latencia o throughput publicados.

## Comparativa con modelos similares

El modelo es un fine-tuning de FinBERT (yiyanghkust/finbert-tone), que es su principal referencia. No se dispone de comparativas directas con otros modelos de sentimiento cripto como CryptoBERT o modelos comerciales. La comparación cualitativa con el FinBERT original es la siguiente:

| Modelo | Enfoque | Salida | Correlación out-of-sample | Licencia |
|---|---|---|---|---|
| Kosmosas/BERT-bitcoin-sentiment | Regresión de impacto en precio | Continua | 0.076 (fold 6) | Apache 2.0 |
| yiyanghkust/finbert-tone | Clasificación de sentimiento financiero | 3 clases | no disponible | Apache 2.0 |

No se dispone de más alternativas comparables con datos públicos en la información proporcionada.

## Limitaciones y advertencias

- La correlación out-of-sample es débil (0.076 en el fold 6) y el modelo no es un predictor fiable del cambio de precio a corto plazo. No supera la prueba Diebold-Mariano en el paper adjunto.
- Solo procesa titulares en inglés y con una longitud máxima de 128 tokens. Textos más largos se truncarán.
- Los checkpoints de folds anteriores al 6 tienen correlaciones más bajas o negativas; solo el fold 6 está recomendado para uso general.
- El checkpoint `fine-tuned-finbert.pth` está superado y no debe usarse para nuevas predicciones, ya que sus resultados son in-sample.
- No se debe usar `AutoModelForSequenceClassification` con el checkpoint base `yiyanghkust/finbert-tone` en versiones recientes de `transformers`, porque su `config.json` carece de la clave `model_type`.
- Los datos de entrenamiento (noticias y datos de mercado) tienen sus propios términos de licencia, que pueden restringir el uso comercial del modelo en ciertos contextos.
- El modelo no es multilingüe ni admite otros dominios financieros fuera de Bitcoin/criptomonedas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kosmosas/BERT-bitcoin-sentiment
- Perfil del autor en Hugging Face: https://huggingface.co/Kosmosas
- Repositorio de código (mencionado en la model card): https://github.com/Kosmosas
- Paper relacionado (ResearchGate): https://www.researchgate.net/publication/372840419_Predicting_the_Price_of_Bitcoin_Using_Sentiment-Enriched_Time_Series_Forecasting
- Paper relacionado (MDPI): https://www.mdpi.com/2504-2289/7/3/137
