# Monibee-Fudgekins/glimmer-stock-trader

## Resumen

`glimmer-stock-trader` es un ajuste fino por QLoRA del modelo denso `meta-models/Muse-Glimmer-30B` (aproximadamente 30.000 millones de parametros, licencia Apache 2.0), desarrollado por el usuario Monibee-Fudgekins. Su proposito no es predecir la direccion del precio, sino identificar opciones call a 30 dias que alcancen al menos una revalorizacion de 2x sobre la prima pagada, de forma que el beneficio de la opcion compense el coste de comprar las acciones subyacentes. El modelo actua como agente de trading dentro del flujo de trabajo del autor y se reentrena cada sabado en GPUs T4 gratuitas de Kaggle.

El modelo se distribuye como fine-tune conversacional en formato transformers, orientado a generacion de texto en ingles y especializado en analisis tecnico y operativa con opciones. La informacion publica es todavia preliminar: la model card indica explicitamente que los pesos estan pendientes de la ejecucion de entrenamiento en Kaggle y que no existe todavia ninguna puntuacion medida en el benchmark de referencia, el llamado *2x-call benchmark*.

La relevancia actual del modelo es, por tanto, metodologica mas que de rendimiento: propone una metrica de evaluacion concreta (tasa de acierto de calls 2x, calculada con precios simulados de Black-Scholes a partir de volatilidad realizada a 20 dias) y un conjunto de datos SFT de 20.009 ejemplos sobre 12 tickers entre 2020 y 2026. Cualquier cifra de rendimiento debe tratarse con cautela hasta que el autor publique resultados verificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de `meta-models/Muse-Glimmer-30B`); detalles internos no disponibles |
| Parametros totales | ~30.000 millones (modelo base); el adaptador LoRA tiene rango 16 y alpha 16 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible para el modelo base; el entrenamiento uso `max_seq_len` de 1024 tokens |
| Tipos de cuantizacion | Entrenamiento en 4 bits (QLoRA); no se documentan cuantizaciones de inferencia publicadas |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (libreria `transformers`; pesos pendientes de publicacion segun la model card) |

## Arquitectura y entrenamiento

El modelo parte de `meta-models/Muse-Glimmer-30B`, un transformer denso de unos 30.000 millones de parametros con licencia Apache 2.0. Sobre esa base se aplica un ajuste fino supervisado (SFT) mediante QLoRA con la libreria Unsloth: cuantizacion de 4 bits, rango LoRA 16, alpha 16, tasa de aprendizaje 2e-4, longitud maxima de secuencia 1024 y optimizador AdamW de 8 bits. El entrenamiento se ejecuta en sesiones semanales de sabado sobre GPUs T4 duales gratuitas de Kaggle (hasta 30 horas semanales), reanudando el estado entre ciclos.

El conjunto de datos v1 (`Monibee-Fudgekins/stock-glimmer-sft`) contiene 20.009 ejemplos (17.489 de entrenamiento y 2.520 de validacion) sobre 12 tickers entre el 2 de enero de 2020 y el 9 de noviembre de 2026. Cada ejemplo incluye una ventana de 20 dias de cierres, medias moviles SMA20 y SMA50, RSI de 14 periodos, volatilidad y variacion de volumen. La version v2, en progreso, anade datos macroeconomicos (VIX, rendimiento del bono a 10 anos, tipos de la Fed, CPI, desempleo, dolar, petroleo y oro) y titulares de noticias. No se documenta el uso de RLHF ni DPO; el objetivo de alineamiento es la metrica 2x-call descrita en la model card.

## Capacidades

- Generacion de texto conversacional en ingles orientada a analisis de acciones y opciones.
- Interpretacion de series de precios y indicadores tecnicos basicos (SMA20/50, RSI14, volatilidad realizada, variacion de volumen).
- Emision de senales de compra de calls a 5 y 30 dias sobre un universo de 12 tickers: AAPL, MSFT, NVDA, AMZN, GOOGL, META, TSLA, JPM, XOM, JNJ, SPY y QQQ.
- Razonamiento sobre la conveniencia de no operar cuando la probabilidad de payoff 2x es baja (objetivo explicito de alineamiento).
- Capacidad de tool calling y function calling: no disponible en la informacion publicada.
- Soporte de agentes multi-paso: no disponible; el modelo se describe como agente de trading dentro de un flujo externo, no como orquestador autonomo.
- Capacidades multilingues: solo ingles.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Investigacion y backtesting de estrategias con opciones: el modelo genera senales de compra de calls a 5 y 30 dias que pueden evaluarse contra datos historicos simulados, usando la metrica 2x-call como criterio de exito.
- Paper trading semanal: integrado en un flujo de planificacion que recoge noticias y datos macro durante la semana y ejecuta una comprobacion de benchmark el sabado antes de la semana siguiente.
- Generacion de candidatos para revision humana: el modelo propone operaciones que un analista valida antes de cualquier ejecucion, reduciendo el trabajo de cribado sobre 12 tickers.
- Estudio de alineamiento de modelos financieros: sirve como caso practico de como redefinir el objetivo de un modelo (de direccion a payoff) y medirlo con una metrica concreta y reproducible.
- Filtrado de senales en carteras de renta variable: al estimar si una call compensa el coste de compra de las acciones, puede usarse para descartar operaciones con payoff insuficiente.
- Docencia y experimentacion con QLoRA: el notebook de entrenamiento en Kaggle y el dataset publico permiten reproducir el ajuste fino en hardware gratuito para fines educativos.

## Benchmarks y rendimiento

La model card no reporta resultados del modelo. Solo publica las lineas base de la estrategia "comprar siempre", que sirven como puerta de promocion para futuros reentrenamientos:

| Split | n | Tasa de acierto 2x (comprar siempre) | Cualquier beneficio (comprar siempre) |
|---|---|---|---|
| 2020-2026 | 3.948 | 27,9% (1.103) | 44,1% |
| Solo 2026 | 468 | 25,6% (120) | no disponible |

Retorno medio sobre prima (comprar siempre, 2020-2026): +36,8%; mediana -32,5%. La propia model card advierte que estos datos estan sesgados al alza por un periodo alcista y por el uso de volatilidad realizada en lugar de volatilidad implicita. No se han publicado resultados de benchmarks del modelo en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo denso de ~30.000 millones de parametros: en FP16 requiere aproximadamente 60 GB; en 8 bits, unos 30 GB; en 4 bits, unos 15-16 GB, mas overhead de contexto y cache KV.
- GPU recomendadas: A100 80 GB o H100 para FP16; A100 40 GB o L40S para 8 bits; RTX 4090 (24 GB) para cuantizaciones de 4 bits.
- Compatibilidad con GPU de consumo: probable en 4 bits con GPUs de 24 GB (RTX 3090, RTX 4090); en 16 GB (RTX 4080, RTX 4070 Ti Super) solo con cuantizaciones agresivas y contexto reducido, sin datos confirmados por el autor.
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama y TGI no estan documentados para este modelo. El entrenamiento se realizo con Unsloth sobre T4 duales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables documentados en la informacion proporcionada. Como referencia estructural, el modelo se apoya en `meta-models/Muse-Glimmer-30B` (mismo tamano, licencia Apache 2.0, sin especializacion financiera), pero no se han publicado metricas de ninguno de los dos que permitan una comparacion cuantitativa.

| Modelo | Parametros | Contexto | Especializacion | Licencia | Resultados publicados |
|---|---|---|---|---|---|
| glimmer-stock-trader | ~30B (base) | no disponible | Trading de opciones (calls 2x) | Apache 2.0 | Ninguno del modelo |
| Muse-Glimmer-30B | ~30B | no disponible | Generacion de texto general | Apache 2.0 | no disponible |
| Alternativas financieras de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los pesos no estan publicados segun la model card: esta describe el objetivo y el proceso, no un modelo entrenado y validado. No debe atribuirse ninguna puntuacion 2x al modelo.
- El precio simulado de las opciones usa volatilidad realizada en lugar de volatilidad implicita; las primas reales suelen ser mas altas, por lo que la tasa real de acierto 2x sera inferior a la simulada.
- El periodo 2020-2026 fue fuertemente alcista, lo que sesga al alza tanto la linea base como cualquier resultado derivado.
- La version v1 solo usa indicadores tecnicos; no incorpora noticias ni datos macro (previstos para v2).
- Modelo pequeno entrenado en hardware gratuito, con riesgo alto de senales incorrectas y de alucinacion en el razonamiento financiero.
- Solo soporta ingles; no hay cobertura multilingue.
- La licencia Apache 2.0 permite uso comercial, pero la model card prohibe explicitamente su uso como asesoramiento financiero o para operar en vivo sin revision humana.
- Las opciones pueden perder el 100% de la prima pagada; el propio autor advierte de no arriesgar dinero que no se pueda perder.
- No hay informacion sobre sesgos demograficos o de otro tipo, tool calling, agentes o capacidades multimodales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Monibee-Fudgekins/glimmer-stock-trader
- Dataset de entrenamiento: https://huggingface.co/datasets/Monibee-Fudgekins/stock-glimmer-sft
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
