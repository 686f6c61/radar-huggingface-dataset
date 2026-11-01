# pravikanth88/candlellm-commodities

## Resumen

CandleLLM Commodities es un transformer causal autorregresivo de pequeno tamano (3.613.056 parametros, aproximadamente 3,6 M) desarrollado por el usuario pravikanth88 y publicado en HuggingFace bajo licencia MIT. No es un modelo de lenguaje generalista: es un modelo de series temporales financieras entrenado especificamente sobre 28 materias primas globales (metales preciosos e industriales, energia, granos, softs y ganado) con mas de 20 anos de datos historicos continuos. Su objetivo es doble: generar la siguiente "vela" (candle) de forma autorregresiva y predecir distribuciones de retorno a multiples horizontes (5, 10 y 20 dias) mediante regresion cuantilica.

La relevancia del modelo reside en su enfoque de tokenizacion: convierte cada vela OHLCV en uno de 4.375 tokens discretos mediante Finite Scalar Quantization (FSQ), lo que permite tratar la serie de precios como una secuencia discreta y aplicar modelado autoregresivo tipo lenguaje. Sobre esa representacion, el modelo combina 54 caracteristicas continuas y 12 ciclicas (patrones de velas, dinamica de medias moviles, osciladores, canales de ruptura estilo Turtle y estacionalidad anual) para producir predicciones cuantilicas.

Es un modelo de nicho, con 0 descargas y 0 likes en el momento de la ficha, orientado a investigacion cuantitativa y prototipado de estrategias, no a produccion financiera directa. Su tamano reducido (repo de 0,1 GB) permite inferencia en CPU y en GPUs de consumo, lo que lo hace accesible para experimentacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal autorregresivo (4 bloques, 6 cabezas de atencion, d_model=192) |
| Parametros totales | 3.613.056 (~3,6 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 barras (velas) |
| Tipos de cuantizacion | No disponible (pesos en checkpoint PyTorch `.pt`; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (segun metadatos; el modelo opera sobre datos numericos, no texto libre) |
| Licencia | MIT |
| Formato de pesos | Checkpoint PyTorch (`commodity_swing_best.pt`) con `model_state_dict` y `config` |

## Arquitectura y entrenamiento

El modelo es un transformer causal de 4 bloques con 6 cabezas de atencion y dimension de modelo 192, con una ventana de contexto de 128 barras. La entrada combina dos flujos: por un lado, velas tokenizadas mediante FSQ en un vocabulario de 4.375 tokens que codifica cuerpo, rango, mecha superior, mecha inferior y volumen; por otro, 54 caracteristicas continuas y 12 ciclicas calculadas sobre la serie. Sobre esta representacion dual, el modelo se entrena con dos objetivos simultaneos: generacion autoregresiva de la siguiente vela (next-candle) y prediccion cuantilica multi-horizonte.

Las caracteristicas de ingenieria incluyen patrones de velas (puntuacion continua de martillo/pinbar en [-1, 1], intensidad de doji, ratios de compresion/expansion de barras, profundidad de penetracion), dinamica de medias moviles (spread normalizado EMA 20/50, distancia normalizada a SMA 200, velocidad de pendiente de EMA 50), osciladores y squeeze (CCI de Donald Lambert, ratio de squeeze de Bandas de Bollinger, Stochastic %K rapido), principios de Turtle Trading (canales de ruptura de 20 y 55 dias, ratio de expansion de volatilidad N, distancia al trailing stop 2N) y estacionalidad mediante curvas armonicas seno/coseno de 365,25 dias que capturan ciclos de cosecha y demanda estacional de calefaccion/refrigeracion.

No se documenta en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion detallada del dataset mas alla de las 28 materias primas y 20+ anos de historia, ni si se aplico RLHF, DPO u otras tecnicas de alineacion (poco probables en un modelo de series temporales). La validacion out-of-sample se realizo sobre el periodo 2022-2023.

## Capacidades

- Generacion autorregresiva de la siguiente vela (next-candle) sobre 28 materias primas, con tokenizacion FSQ de 4.375 tokens.
- Prediccion cuantilica multi-horizonte de retornos a 5, 10 y 20 dias en 5 cuantiles ([0,10, 0,25, 0,50, 0,75, 0,90]).
- Modelado de patrones de velas japonesas (martillo, doji, inside/outside bar, penetracion).
- Captura de dinamica de tendencia mediante medias moviles (EMA 20/50, SMA 200) y su velocidad de cambio.
- Deteccion de regimenes de volatilidad y squeeze (CCI, Bandas de Bollinger, Stochastic).
- Senales de ruptura basadas en canales Turtle (20 y 55 dias) y trailing stops 2N.
- Modelado de estacionalidad anual (ciclos de cosecha y demanda energetica).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en lenguaje natural.
- No tiene capacidades multilingues ni de vision, audio o texto generativo.

## Casos de uso

- Investigacion cuantitativa de factores: usar las predicciones cuantilicas a 20 dias (IC mediano +0,094) como senal de ranking transversal entre las 28 materias primas, ordenando el universo por retorno esperado y construyendo carteras long-short.
- Prototipado de estrategias de swing trading: las predicciones a 5, 10 y 20 dias permiten calibrar horizontes de entrada y salida en funcion de la distribucion de retornos esperada, con cuantiles que informan sobre el riesgo de cola.
- Gestion de riesgo en carteras de commodities: los cuantiles 0,10 y 0,90 ofrecen bandas de incertidumbre que pueden alimentar modelos de VaR o de dimensionamiento de posiciones (position sizing) por activo.
- Backtesting de sistemas Turtle: el modelo incorpora canales de ruptura de 20 y 55 dias y trailing stops 2N, por lo que puede integrarse en pipelines de evaluacion de estrategias de seguimiento de tendencia clasicas.
- Analisis de estacionalidad en agricolas y energia: las curvas armonicas de 365,25 dias permiten estudiar desviaciones respecto a patrones estacionales historicos en granos, gas natural o gasolina.
- Deteccion de regimenes de volatilidad: el uso combinado de CCI, squeeze de Bollinger y Stochastic puede emplearse para clasificar fases de compresion/expansion y ajustar el apalancamiento.
- Educacion y reproduccion de research: al ser un modelo pequeno (3,6 M parametros) con licencia MIT, sirve para ensenar tecnicas de tokenizacion FSQ y modelado autoregresivo de series financieras en cursos o laboratorios.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden a validacion out-of-sample 2022-2023:

| Metrica | Valor | Referencia |
|---|---|---|
| Cross Entropy (CE) | 6,6144 | Bigram: 7,4244 (gap -0,8100) |
| Pinball Quantile Loss | 0,2268 | Skill +0,89 % sobre climatologia |
| Rank IC mediano a 5 dias | +0,035 | No disponible |
| Rank IC mediano a 10 dias | +0,060 | No disponible |
| Rank IC mediano a 20 dias | +0,094 | No disponible |

No se han publicado resultados de benchmarks comparativos con otros modelos de series temporales financieras (por ejemplo, Chronos, TimesFM o Moirai) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (3,6 M parametros ocupan aproximadamente 14 MB en pesos; el grueso del consumo proviene de activaciones y del calculo de caracteristicas), por lo que cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3060, RTX 4090, A100, H100 sin problema. Tambien es viable en CPU.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo de los ultimos 10 anos.
- Opciones de despliegue: inferencia nativa en PyTorch mediante el checkpoint `.pt` y el codigo del repositorio (`src.model`, `src.features`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al no ser un modelo de lenguaje estandar no son directamente aplicables.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos en GPU y de decenas de milisegundos en CPU para una ventana de 128 barras, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CandleLLM Commodities | 3,6 M | 128 barras | Transformer causal + FSQ + cuantiles | MIT | HuggingFace (0 descargas) |
| Chronos (Amazon) | 20 M - 710 M | Variable | Tokenizacion de series + LLM | Apache 2.0 | HuggingFace |
| TimesFM (Google) | 200 M | 512 puntos | Decoder-only para series | Apache 2.0 | HuggingFace |
| Moirai (Salesforce) | 14 M - 311 M | Variable | Transformer universal de series | Apache 2.0 | HuggingFace |

No se dispone de comparaciones directas de rendimiento entre CandleLLM y estos modelos en la informacion proporcionada. La comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Modelo de nicho con 0 descargas y 0 likes: no ha sido validado por la comunidad ni auditado de forma independiente.
- Rendimiento predictivo modesto: los Rank IC publicados (+0,035 a +0,035, +0,060 y +0,094) son bajos en terminos absolutos, aunque positivos; no garantizan rentabilidad tras costes de transaccion.
- Riesgo de sobreajuste: entrenado sobre 20+ anos de datos de 28 activos con un modelo de 3,6 M parametros; la validacion out-of-sample se limita a 2022-2023, un periodo unico que puede no representar otros regimenes de mercado.
- Sesgo de supervivencia y de seleccion del universo: las 28 materias primas son contratos de futuros estandarizados y liquidos; el comportamiento en mercados iliquidos o emergentes no esta cubierto.
- Limitacion de contexto: 128 barras limitan la captura de dependencias de muy largo plazo; la estacionalidad se modela mediante caracteristicas explicitas, no mediante atencion.
- Solo ingles en metadatos y sin capacidades de texto libre: no es un chatbot ni un modelo generativo de lenguaje; usarlo fuera de series temporales financieras carece de sentido.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias ni soporte; la responsabilidad legal y financiera del uso recae en el usuario.
- Advertencia financiera: las predicciones no constituyen asesoramiento financiero; cualquier uso en produccion requiere validacion independiente, backtesting con costes realistas y controles de riesgo.
- No disponible informacion sobre sesgos etnicos, de genero o culturales, al no operar sobre texto ni datos personales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pravikanth88/candlellm-commodities
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados al modelo.
