# AMFORGE/tabicl-synthetics-finetuned

## Resumen

`tabicl-synthetics-finetuned` es un checkpoint de TabICL v2, un modelo fundacional para datos tabulares basado en in-context learning, ajustado por el autor AMFORGE para predecir acciones de trading (Buy / Sell / Hold) sobre indices sinteticos de brokers como Deriv y Weltrade. El modelo no se entrena desde cero: parte de la arquitectura TabICL y aplica un fine-tuning por gradiente del backbone para especializarlo en la clasificacion de tres clases sobre series temporales financieras sinteticas.

La relevancia del checkpoint es acotada y muy especifica: esta disenado para actuar como quinto experto dentro de un ensemble multi-modelo denominado EARCP, donde su peso se ajusta dinamicamente segun su rendimiento y consistencia con el resto de expertos. Se entreno de forma separada del fine-tuning sobre Gold+BTC porque los indices sinteticos presentan propiedades estadisticas (procesos artificiales de saltos y volatilidad) muy distintas a las de los activos reales.

El modelo recibe un vector de 58 caracteristicas derivadas de siete timeframes (M1 a D1) y nueve categorias one-hot de familia de activo, y devuelve probabilidades para las tres clases. Su licencia es "other", el repo ocupa 0,2 GB y no se han publicado datos de benchmarks estandar. La model card advierte explicitamente de que no esta pensado para decisiones de trading autonomas sin supervision humana y gestion de riesgo previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TabICL v2 (modelo fundacional tabular con in-context learning), backbone con fine-tuning por gradiente (`FinetunedTabICLClassifier`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el contexto es el conjunto (X, y) proporcionado en `.fit()`; tamano maximo no documentado) |
| Tipos de cuantizacion | no disponible (checkpoint distribuido como pickle, sin variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; entrada numerica tabular) |
| Licencia | other |
| Formato de pesos | `tabicl_finetuned.pkl` (pickle de scikit-learn) y `feature_scaler.pkl` |
| Dimension de entrada | 58 caracteristicas (49 base: 7 features x 7 timeframes + 9 one-hot de familia) |
| Clases de salida | 3 (0=Buy, 1=Sell, 2=Hold) |
| Libreria | `tabicl` |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

El modelo se apoya en TabICL v2, un modelo fundacional tabular que resuelve tareas de clasificacion mediante in-context learning: en lugar de aprender una funcion fija en los pesos, codifica un conjunto de contexto (X, y) en el momento de la inferencia y predice sobre nuevas muestras condicionado a ese contexto. Sobre esa base, AMFORGE aplica un fine-tuning por gradiente del backbone (`FinetunedTabICLClassifier`), de modo que el checkpoint combina pesos ajustados con un encoder de contexto que debe reconstruirse en cada carga.

Los datos de entrenamiento son 34.000 muestras y 6.000 de validacion, exportadas desde MT5 (OHLCV por granularidad y simbolo) sobre 28 simbolos sinteticos: Boom 500/1000, Crash 500/1000, FlipX 3/4/5, FX Vol 20/40/60/80/99, GainX 400/600/800/1200, PainX 400/600/800/1200, SFX Vol 20/40/60 y Volatility 10/25/50/75/100. Se usan siete timeframes (M1, M5, M15, M30, H1, H4, D1) y siete caracteristicas base por timeframe: close, trend_strength, candle_pattern, volatility, market_regime, candlestick_pattern y chart_pattern. El etiquetado emplea triple-barrier anti-lookahead con TP=2,0xATR, SL=1,0xATR y horizonte de 60 barras del timeframe mas fino disponible. Cuando un timeframe no se exporto para un simbolo, sus caracteristicas se rellenan con 0, replicando el fallback del bot en produccion para garantizar consistencia train/serve.

Un detalle tecnico critico es que el `pickle` preserva los pesos del backbone pero no el encoder de contexto (`_X_encoder_`). Por tanto, tras cada `pickle.load()` es obligatorio llamar a `.fit(X_context, y_context)` con un conjunto representativo; en caso contrario, `predict_proba()` lanza `NotFittedError`. El escalador `feature_scaler.pkl` se ajusto sobre las 58 columnas conjuntamente (base + one-hot) y no debe reajustarse ni escalarse por bloques.

## Capacidades

- Clasificacion tabular de tres clases (Buy / Sell / Hold) con salida de probabilidades via `predict_proba()`.
- In-context learning: adaptacion a un contexto (X, y) proporcionado en tiempo de inferencia, sin reentrenamiento completo.
- Modelado de series temporales financieras multi-timeframe (M1 a D1) en un unico vector de 58 dimensiones.
- Distincion de regimenes estadisticos entre familias de activos sinteticos mediante el bloque one-hot (boom, crash, volatility, flipx, gainx, painx, fxvol, sfxvol, other).
- Integracion como experto en un ensemble multi-modelo con ponderacion dinamica.
- No soporta tool calling, function calling, agentes, vision, audio ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Quinto experto en ensemble de trading sobre indices sinteticos: el checkpoint aporta probabilidades Buy/Sell/Hold que el sistema EARCP pondera dinamicamente junto a otros cuatro expertos, aprovechando su especializacion en regimenes sinteticos frente a los modelos entrenados con activos reales.
- Filtro de senales en bots de indices Deriv/Weltrade: integrado en un pipeline que ya calcula las 58 caracteristicas, el modelo puede descartar senales de baja confianza antes de ejecutar ordenes, siempre bajo gestion de riesgo externa.
- Investigacion sobre in-context learning en finanzas: sirve como banco de pruebas para estudiar como TabICL se comporta en dominios con procesos de salto artificial (Boom/Crash) frente a volatilidad constante (Volatility).
- Comparativa de regimenes sinteticos: el bloque one-hot permite analizar por separado el rendimiento en familias GainX/PainX, FlipX o FX Vol, util para decidir que simbolos incluir en produccion.
- Prototipado de estrategias con etiquetado triple-barrier: el esquema TP=2,0xATR / SL=1,0xATR / horizonte 60 barras puede reutilizarse para generar etiquetas en otros conjuntos y comparar contra este checkpoint como referencia.
- Sistema de alertas supervisado: usar `predict_proba()` para priorizar revision humana de oportunidades, dado que la clase Hold tiene recall bajo (0,18) y las senales de compra/venta son las que concentran el valor practico.

## Benchmarks y rendimiento

Resultados en el conjunto de validacion (6.000 muestras) segun la model card:

| Metrica | Valor |
|---|---|
| Accuracy global | 0,6375 |

| Clase | Precision | Recall | F1-score | Support |
|---|---|---|---|---|
| Buy | 0,67 | 0,77 | 0,72 | 2264 |
| Sell | 0,66 | 0,79 | 0,72 | 2291 |
| Hold | 0,42 | 0,18 | 0,26 | 1445 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repo ocupa 0,2 GB, por lo que el checkpoint en si es ligero, pero el coste de inferencia de TabICL es superior al de un gradient boosting clasico (XGBoost) segun la model card.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Cabe en GPU consumer: no confirmado; el tamano del artefacto (0,2 GB) sugiere que si, pero no hay datos oficiales de memoria en runtime.
- Opciones de despliegue: carga via `pickle` + libreria `tabicl` (scikit-learn compatible); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; la model card recomienda evaluar contra las restricciones de latencia del sistema objetivo antes de desplegar.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tabicl-synthetics-finetuned | TabICL v2 fine-tuned, clasificacion 3 clases | no disponible | contexto (X, y) en `.fit()` | accuracy 0,6375 en validacion | other | Hugging Face (AMFORGE) |
| TabICL v2 base | Modelo fundacional tabular, in-context learning | no disponible | contexto (X, y) | no disponible | ver repo `soda-inria/tabicl` | GitHub / Hugging Face |
| XGBoost | Gradient boosting tabular | no disponible | no aplica | no disponible | Apache 2.0 | Amplia |
| Modelo Gold+BTC de AMFORGE (mencionado en la card) | TabICL fine-tuned sobre activos reales | no disponible | contexto (X, y) | no disponible | other | no disponible |

La comparativa es cualitativa: no se han publicado metricas comparables de TabICL base ni de XGBoost sobre este mismo conjunto sintetico en la informacion disponible.

## Limitaciones y advertencias

- Los indices sinteticos son generados algorithmicamente por el broker y no tienen activo subyacente real; si el broker modifica sus parametros de generacion, la dinamica puede cambiar sin aviso y degradar el modelo.
- El `pickle` no preserva el encoder de contexto: es obligatorio llamar a `.fit()` tras cada carga y en cada nuevo proceso, o `predict_proba()` lanzara `NotFittedError`.
- Algunas caracteristicas pueden ser cero para timeframes no exportados de un simbolo; el modelo se entreno con ese relleno, pero reduce la informacion disponible en esos casos.
- La clase Hold tiene un rendimiento pobre (recall 0,18, F1 0,26): el modelo tiende a predecir Buy/Sell y puede generar falsas senales de accion donde lo correcto seria mantener.
- Riesgo de sobreajuste al contexto elegido en `.fit()`: al ser in-context learning, la calidad de las predicciones depende de que el conjunto de contexto sea representativo.
- Coste de inferencia superior a XGBoost; conviene medir latencia antes de integrarlo en un sistema en tiempo real.
- Licencia "other": no se especifican terminos de uso comercial; es necesario contactar con el autor o revisar el repo antes de un despliegue productivo.
- No es asesoramiento financiero; la model card indica explicitamente que no debe usarse para decisiones de trading autonomas sin supervision humana y gestion de riesgo previa.
- No dispone de capacidades de lenguaje, vision ni multilingues; cualquier uso fuera de clasificacion tabular financiera queda fuera de su alcance.

## Enlaces

- Hugging Face: https://huggingface.co/AMFORGE/tabicl-synthetics-finetuned
- Repositorio TabICL (referenciado en la model card): https://github.com/soda-inria/tabicl
