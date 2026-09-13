# AcyLa/forex-predictive-model

## Resumen

AcyLa/forex-predictive-model es un pipeline de aprendizaje automatico para la prediccion intradia de tipos de cambio, publicado en Hugging Face bajo la etiqueta `ml-intern`. No es un modelo de lenguaje ni un transformer generativo: combina un ensemble de LightGBM (gradient boosting sobre arboles) y una red LSTM, alimentado por mas de 180 indicadores tecnicos calculados sobre 730 dias de velas horarias descargadas de Yahoo Finance. Su salida son senales discretas BUY / SELL / NEUTRAL con objetivos de precio expresados en pips y votacion de consenso entre cuatro horizontes temporales.

El componente diferencial declarado por el autor es la envolvente de Nadaraya-Watson (regresion kernel no parametrica) usada como suavizado de precio y detector de zonas de sobrecompra/sobreventa, junto con un sistema de bandas de Bollinger multi-ventana (3 ventanas x 3 desviaciones). El resto de features cubre tendencia, momento, volatilidad, volumen, estructura de precio y horario de sesiones (Tokio, Londres, Nueva York y su solapamiento).

Su relevancia es limitada y debe contextualizarse: el repositorio acumula 0 descargas y 0 likes, no declara licencia, no publica resultados de backtest y su tamano declarado es de 0,0 GB, lo que sugiere que los pesos preentrenados podrian no estar efectivamente subidos. Ademas, la model card indica que fue generado automaticamente por ML Intern, un agente de investigacion de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de LightGBM (gradient boosting sobre arboles) + red LSTM; pipeline de features con envolvente de Nadaraya-Watson y bandas de Bollinger multi-ventana |
| Parametros totales | no disponible (el autor no publica recuento de parametros ni tamano de los arboles o de la LSTM) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); ventana de entrenamiento de 730 dias de velas de 1 hora, con procesamiento declarado de unas 17.000 barras |
| Tipos de cuantizacion | no disponible (formato joblib; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje); no disponible |
| Licencia | no disponible (la model card y los metadatos del repositorio no la especifican) |
| Formato de pesos | joblib (tag del repositorio); el autor cita modelos preentrenados en `fx_models/EURUSD_X/` para 4 horizontes |
| Tamano del repositorio | 0,0 GB (segun los metadatos de Hugging Face) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-12T20:29:49Z / 2026-09-12T20:30:14Z |
| Pipeline declarado en Hugging Face | no disponible |

## Arquitectura y entrenamiento

El pipeline sigue una secuencia fija: descarga de datos FX desde Yahoo Finance, calculo de mas de 180 features, generacion de etiquetas multi-horizonte y ensamblado de dos modelos supervisados (LightGBM y LSTM) cuyas predicciones se agregan por votacion de consenso. Los horizontes documentados son 1 h, 4 h, 8 h y 24 h. El etiquetado se basa en pips y en el metodo de triple barrera. Los bloques de features se organizan en siete categorias: tendencia (pila EMA 9/21/50/100/200, SMA, MACD, ADX, nube de Ichimoku, CCI), momento (RSI 7/14/21, estocastico, Williams %R, ROC, Awesome Oscillator), volatilidad (ATR 14/21/50, Bollinger, Keltner, Donchian, volatilidad historica), volumen (OBV, MFI, VWAP, CMF, ratios de volumen), precio (retornos multi-horizonte, patrones de velas, soportes y resistencias, drawdown), sesion (aperturas y cierres de Tokio, Londres y Nueva York, solapamientos, dia de la semana) y el bloque especifico de Nadaraya-Watson (suavizado, envolventes, pendiente, cruces, regimen de tendencia y senales de ruptura).

La innovacion tecnica mas concreta es la implementacion vectorizada de la envolvente de Nadaraya-Watson, que el autor cifra en el calculo de 17.000 barras en 0,3 s, junto con el sistema de 45 features de Bollinger (3 ventanas de 20, 50 y 100 periodos combinadas con 3 desviaciones tipicas de 2,0, 2,5 y 3,0, incluyendo ancho de banda, posicion %B, deteccion de squeeze y senales de band-walk). No se documentan el numero de tokens de entrenamiento (concepto no aplicable), la composicion exacta del dataset, ni el uso de RLHF o DPO. El repositorio incluye un modulo de backtest walk-forward con calculo de P&L en pips, ejecutable mediante `train.py`, pero no se publican sus resultados numericos.

## Capacidades

- Prediccion de direccion de precio en forex intradia con tres clases de salida: BUY, SELL y NEUTRAL.
- Estimacion de movimiento esperado en pips y calculo de precio objetivo por horizonte temporal.
- Votacion de consenso agregada entre los horizontes de 1 h, 4 h, 8 h y 24 h, con un valor de confianza asociado (en el ejemplo publicado, 50 %).
- Modo rapido de inferencia usando solo LightGBM (`--no-lstm`), descrito por el autor como de latencia sub-milisegundo.
- Entrenamiento sobre siete pares de divisas: EURUSD, GBPUSD, USDJPY, USDCHF, AUDUSD, USDCAD y NZDUSD, con deteccion automatica del tamano de pip (por ejemplo, 0,01 en USD/JPY).
- API Python programatica mediante la clase `ForexPredictor`, con metodos `get_signal(horizon=...)`, `get_multi_horizon()` y `predict_batch(df, horizon=...)` para datos OHLCV propios.
- Interfaz de linea de comandos con seleccion de ticker, horizonte y volcado de features (`--features`).
- Backtest walk-forward integrado con contabilidad en pips.
- No declara soporte de tool calling, function calling, agentes, multimodalidad, vision, audio, modo de razonamiento explicito ni capacidades multilingues, ya que no es un modelo de lenguaje.

## Casos de uso

- Senalizacion intradia en EUR/USD: el modelo genera recomendaciones BUY/SELL/NEUTRAL por horizonte con objetivo en pips, lo que permite usarlo como capa de decision en un bot de trading que opere en graficos de 1 hora.
- Filtro de confirmacion en sistemas algoritmicos existentes: dado que expone los 180+ indicadores y la envolvente de Nadaraya-Watson, puede actuar como segundo validador de senales generadas por una estrategia propia antes de enviar la orden.
- Backtesting walk-forward de estrategias propias: el modulo `backtest.py` permite evaluar reglas de entrada y salida con P&L en pips sobre datos historicos de Yahoo Finance, reutilizando las mismas features del modelo.
- Dimensionamiento de posiciones y gestion de riesgo: la salida incluye el movimiento esperado en pips por horizonte, lo que facilita calcular distancias de stop-loss y take-profit coherentes con la prediccion.
- Analisis multi-horizonte para operativa de swing intradia: la agregacion de 1 h a 24 h permite decidir si una entrada de corto plazo esta alineada con la tendencia del dia.
- Alertas automatizadas en mesas de trading: la API Python `ForexPredictor` puede integrarse en un proceso programado que consulte precios y emita avisos cuando el consenso o la confianza superen un umbral definido por el usuario.
- Investigacion y docencia en ML aplicado a series temporales financieras: el repositorio separa features, etiquetas, modelos y backtest en modulos independientes, lo que lo hace util como esqueleto reproducible para experimentos con indicadores tecnicos.
- Extension a otros pares: el script `train.py` permite reentrenar el ensemble sobre GBP/USD o USD/JPY sin modificar el codigo, util para explorar la transferibilidad del enfoque entre divisas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de accuracy, F1, Sharpe, drawdown ni retorno acumulado del backtest walk-forward, pese a que el repositorio incorpora un modulo de backtest. El autor unicamente declara dos cifras de rendimiento computacional: el calculo vectorizado de la envolvente de Nadaraya-Watson sobre 17.000 barras en 0,3 s y la disponibilidad de un modo LightGBM de latencia sub-milisegundo. El unico ejemplo de salida publicado muestra un consenso NEUTRAL con confianza del 50 % y variaciones previstas de -0,0, +0,2, +0,8 y +3,9 pips para 1 h, 4 h, 8 h y 24 h respectivamente sobre EUR/USD en el precio 1,16023.

## Requisitos de hardware

- Inferencia en CPU: viable. LightGBM es un modelo de arboles y el modo rapido no requiere GPU; el autor lo describe como de latencia sub-milisegundo.
- La LSTM puede ejecutarse en CPU para predicciones puntuales o en GPU para lotes grandes; no se especifica el tamano de la red ni su coste de memoria.
- VRAM estimada: no disponible. No se publican parametros, tamano de checkpoint ni requisitos de memoria.
- GPU recomendadas: no disponible. Dado el tamano declarado del repositorio (0,0 GB), no se puede justificar ninguna recomendacion especifica; una GPU de consumo (por ejemplo RTX 3060 o superior) seria mas que suficiente para una LSTM de features tabulares, pero esta afirmacion no se puede verificar con los datos del autor.
- Compatibilidad con GPU de consumo: probablemente si para el componente LSTM, siempre que los pesos existan; no confirmado por el autor.
- Dependencias declaradas: `yfinance`, `pandas`, `numpy`, `scikit-learn`, `lightgbm`, `ta`, `torch`, `pyarrow`, `joblib` y `scipy`.
- Opciones de despliegue: scripts de linea de comandos (`train.py`, `predict.py`) y API Python (`ForexPredictor`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no se trata de pesos de transformer.
- Latencia y throughput: solo se declara latencia sub-milisegundo en modo LightGBM y 0,3 s para el calculo vectorizado de la envolvente de Nadaraya-Watson sobre 17.000 barras. No hay datos de throughput ni de latencia del ensemble completo con LSTM.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables dentro de la informacion proporcionada; la busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre alternativas de la misma categoria. Como referencia cualitativa, el enfoque (ensemble de gradient boosting y LSTM sobre indicadores tecnicos) es funcionalmente cercano a librerias de forecasting como Nixtla NeuralForecast o Prophet en el terreno de series temporales, y a modelos fundacionales de series temporales como Chronos (Amazon) o TimesFM (Google), pero no se han obtenido en esta busqueda cifras de parametros, contexto, licencia ni rendimiento de esas alternativas, por lo que cualquier tabla comparativa con numeros seria especulativa.

| Modelo | Tipo | Parametros | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|---|
| AcyLa/forex-predictive-model | Ensemble LightGBM + LSTM sobre indicadores tecnicos FX | no disponible | no disponible | Hugging Face, 0 descargas | no publicado |
| Alternativas de forecasting de series temporales (Chronos, TimesFM, NeuralForecast, Prophet) | no disponible en esta busqueda | no disponible | no disponible | no verificado en esta busqueda | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje. El fragmento de uso generico incluido al final de la model card (`AutoModelForCausalLM` y `AutoTokenizer`) es una plantilla automatica incorrecta para este repositorio y no funcionaria.
- Licencia no especificada: no se puede asumir uso comercial permitido. Cualquier integracion en produccion requiere aclarar la licencia con el autor.
- El tamano declarado del repositorio es de 0,0 GB, lo que sugiere que los pesos preentrenados podrian no estar disponibles pese a que la model card afirma incluirlos ("pre-trained models included"). Conviene verificarlo antes de usarlo.
- Generado por ML Intern, un agente automatico de Hugging Face: el nivel de revision humana y de validacion del pipeline es incierto.
- Ausencia total de metricas: sin accuracy, sin retorno de backtest, sin Sharpe ni drawdown, no hay evidencia publicada de que las senales tengan valor predictivo.
- Riesgo de look-ahead bias y de sobreajuste en features derivadas de indicadores tecnicos, especialmente si el backtest walk-forward no se ha ejecutado con separacion temporal estricta y costes de transaccion realistas.
- Magnitud de las senales muy reducida en el ejemplo publicado: previsiones de 0,2 a 3,9 pips en horizontes de 4 a 24 horas pueden quedar por debajo del spread tipico de un broker retail, lo que erosionaria cualquier ventaja.
- Deriva de concepto (concept drift): el entrenamiento se limita a 730 dias de velas de 1 hora, un regimen de mercado acotado que puede no representar condiciones de alta volatilidad, cambios de politica monetaria o crisis.
- Dependencia de Yahoo Finance (`yfinance`) como fuente de datos: posibles huecos, retrasos, correcciones retroactivas y ausencia de volumen fiable en el mercado FX.
- Exclusion de informacion fundamental: el modelo solo usa precio, indicadores tecnicos y horario de sesiones; no incorpora tipos de interes, datos macro (NFP, IPC) ni noticias, que son los principales motores del mercado de divisas.
- Cobertura limitada a siete pares principales; no hay evidencia de funcionamiento en cruces exoticos ni en otros activos.
- El propio autor advierte que es una herramienta de investigacion y no asesoramiento financiero, y que el trading en FX conlleva un riesgo elevado. Cualquier uso con capital real debe acompanarse de stop-loss y dimensionamiento de posicion adecuado.
- Sesgos conocidos del modelo: no disponibles (no se documenta ningun analisis de sesgo, ni aplica en el sentido habitual de los modelos de lenguaje).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AcyLa/forex-predictive-model
- ML Intern (agente generador), repositorio: https://github.com/huggingface/ml-intern
- ML Intern, demo en Hugging Face Spaces: https://smolagents-ml-intern.hf.space
- Paper o documentacion tecnica del modelo: no disponible
- Blog o articulo del autor: no disponible
- Demo o interfaz interactiva del modelo: no disponible
- Resultados de la busqueda web: no se encontro ningun resultado relevante sobre este modelo (las consultas devolvieron unicamente paginas de la plataforma Roblox, sin relacion con el repositorio)
