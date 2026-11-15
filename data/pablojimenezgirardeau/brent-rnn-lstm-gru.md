# PabloJimenezGirardeau/brent-rnn-lstm-gru

## Resumen

`brent-rnn-lstm-gru` es un conjunto de tres redes recurrentes (RNN simple, LSTM y GRU) entrenadas para predecir la variación logarítmica del precio del petróleo Brent a tres horizontes temporales: una semana (5 sesiones), tres meses (63 sesiones) y un año (252 sesiones). Lo desarrolla PabloJimenezGirardeau como proyecto académico de la asignatura de Aprendizaje Automático de la Universidad Alfonso X el Sabio, y se publica bajo licencia MIT con pesos en formato PyTorch (`.pt`).

El modelo no predice el precio absoluto, sino la variación logarítmica futura a partir de una ventana de siete series financieras diarias (Brent, WTI, cobre, oro, índice del dólar, VIX y logaritmo de la volatilidad realizada del Brent a 21 días). Cada horizonte tiene su propia arquitectura y ventana de entrada: LSTM de 2.968 parámetros con ventana de 252 días para el corto plazo, RNN de 4.737 parámetros con ventana de 20 días para el medio plazo y RNN de 6.376 parámetros con ventana de 20 días para el largo plazo. Cada carpeta incluye cinco semillas de entrenamiento cuyas predicciones se promedian.

Su relevancia es fundamentalmente metodológica y negativa: el propio autor documenta que ninguna de las tres redes supera de forma fiable al modelo ingenuo («el precio futuro será el de hoy») ni en la validación de 12 años (2010-2021) ni en el examen final reservado (2022-2026). Lo que sí aporta valor es el intervalo del 80 %, que alcanzó una cobertura del 79 % a una semana, 84 % a tres meses y 89 % a un año en el periodo de examen. Es, por tanto, un ejemplo reproducible de evaluación honesta con Diebold-Mariano, más que una herramienta de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tres redes recurrentes independientes: LSTM (corto plazo), RNN simple (medio plazo), RNN simple (largo plazo) |
| Parametros totales | 2.968 (corto, LSTM) / 4.737 (medio, RNN) / 6.376 (largo, RNN) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de entrada de 252 días (corto) y 20 días (medio y largo) |
| Tipos de cuantizacion | No disponible (pesos en coma flotante PyTorch; no se documentan variantes cuantizadas) |
| Idiomas soportados | Español (documentación y model card); el modelo no procesa texto |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`), cinco semillas por horizonte (`semilla_42.pt` a `semilla_46.pt`) más `escalado.json` y `ficha.json` |
| Pipeline | `time-series-forecasting` |
| Libreria | PyTorch |
| Variables de entrada | 7 series diarias: variación del Brent, WTI, cobre, oro, índice del dólar, VIX y log de volatilidad del Brent a 21 días |
| Objetivo | Variación logarítmica del precio entre hoy y 5, 63 o 252 sesiones |
| Datos de entrenamiento | FRED (EIA, BCE, Fed, Cboe) y Yahoo Finance, 2000 a noviembre de 2026 (no incluidos en el repositorio) |
| Fecha de corte de entrenamiento | 3 de noviembre de 2026 |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

Cada horizonte emplea una red recurrente independiente de muy baja capacidad, seleccionada antes del examen final mediante validación año a año sobre 2010-2021. El modelo de corto plazo es una LSTM con 2.968 parámetros y ventana de 252 días; los de medio y largo plazo son RNN simples de 4.737 y 6.376 parámetros respectivamente, ambas con ventana de 20 días. La predicción final de cada horizonte es la media de los precios previstos por las cinco semillas de entrenamiento (42 a 46), lo que actúa como ensamblado de reducción de varianza. La estandarización y el recorte de entradas se ajustan exclusivamente con datos de entrenamiento y se guardan en `escalado.json`, evitando fuga de información.

El diseño de objetivo es deliberado: la red predice la variación logarítmica, no el nivel de precio. El autor documenta que una red entrenada directamente con precios produce gráficos visualmente plausibles pero se equivoca un 54 % más que el modelo ingenuo a una semana. El horizonte de un año se entrena con todo el conjunto de entrenamiento y un número fijo de épocas; los otros dos usan parada temprana. La evaluación combina una validación de 12 años (2010-2021) y un examen final reservado (2022-2026) usado una sola vez, con test de Diebold-Mariano para comparar contra el ingenuo. No se documenta uso de RLHF, DPO ni datos sintéticos; el entrenamiento es supervisado estándar sobre series financieras.

## Capacidades

- Predicción de la variación logarítmica del precio del Brent a 5, 63 y 252 sesiones bursátiles.
- Estimación de un intervalo del 80 % centrado en el precio actual, cuya anchura depende de la volatilidad reciente del Brent.
- Procesamiento de entradas multivariantes de siete series financieras diarias con ventanas de 20 o 252 días.
- Ensamblado por media de cinco semillas por horizonte para estabilizar la predicción.
- Reconstrucción determinista del preprocesado (recorte y estandarización) a partir de `escalado.json`.
- Integración con el paquete `oil_price` del repositorio de GitHub para cargar pesos y generar predicciones vía `modelo_final.cargar` y `modelo_final.prever`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es exclusivamente un modelo de series temporales.
- Capacidades multilingües: no aplica; el modelo no procesa lenguaje natural.

## Casos de uso

- Evaluación académica de métodos recurrentes en finanzas: sirve como referencia reproducible para comparar RNN, LSTM y GRU frente a un baseline ingenuo con validación temporal estricta y test de Diebold-Mariano, gracias a que el repositorio incluye notebooks y diario de experimentos.
- Estimación de rangos de incertidumbre para el Brent: el intervalo del 80 % alcanzó coberturas del 79 %, 84 % y 89 % en el examen 2022-2026, por lo que puede usarse para acotar escenarios de volatilidad en informes internos, siempre con la advertencia de que no es asesoramiento financiero.
- Docencia de preprocesado sin fuga de información: el uso de `escalado.json` ajustado solo con entrenamiento y de un examen final reservado constituye un caso práctico para enseñar buenas prácticas de validación temporal.
- Prototipado de pipelines de forecasting financiero: la API `modelo_final.cargar` / `modelo_final.prever` permite integrar las predicciones en un cuaderno o script de análisis junto con datos descargados al momento.
- Análisis de sensibilidad a variables macro: al recibir siete series (Brent, WTI, cobre, oro, dólar, VIX y volatilidad), permite estudiar cómo cambia la predicción al perturbar entradas concretas en un entorno controlado.
- Reproducción de resultados y auditoría metodológica: las cinco semillas por horizonte y las fichas de configuración (`ficha.json`) permiten replicar exactamente cada experimento y auditar las conclusiones publicadas.
- Base para experimentos de comparación de arquitecturas: dado su tamaño reducido (menos de 7.000 parámetros por red), es viable reentrenar variantes en CPU y comparar con las publicadas.

## Benchmarks y rendimiento

Los resultados publicados no son benchmarks estándar (MMLU, HumanEval, GSM8K) sino métricas de error relativo frente al modelo ingenuo. La «nota» es el error medio en dólares del modelo dividido por el del ingenuo: 1 es empatar, por encima de 1 se equivoca más.

| Plazo | Red | Nota 2010-2021 (12 años) | Nota examen 2022-2026 | p (Diebold-Mariano) | Conclusión prefijada |
|---|---|---|---|---|---|
| 1 semana | LSTM | 0,997 | 1,005 | 0,56 | Sin evidencia de ventaja |
| 3 meses | RNN | 0,994 | 1,094 | 0,13 | Sin evidencia de ventaja |
| 1 año | RNN | 0,941 | 1,198 | 0,26 | Sin evidencia de ventaja |

| Métrica de intervalo | 1 semana | 3 meses | 1 año |
|---|---|---|---|
| Cobertura del rango del 80 % en examen | 79 % | 84 % | 89 % |
| Comparación con rango de anchura fija | 7 % más preciso | Igual | Igual |

No se han publicado resultados de benchmarks estándar de NLP en la información disponible, ya que el modelo no realiza tareas de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos (menos de 7.000 parámetros por red en coma flotante de 32 bits), más el espacio de las ventanas de entrada; cabe holgadamente en cualquier GPU y en CPU.
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna es suficiente. Una GPU consumer (por ejemplo, RTX 3060 o superior) no aporta ventaja apreciable por el tamaño ínfimo del modelo.
- Cabe en cualquier GPU consumer y en entornos sin GPU (portátiles, contenedores pequeños, Raspberry Pi).
- Opciones de despliegue: PyTorch nativo mediante el paquete `oil_price` del repositorio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño (miles de parámetros) se espera latencia de milisegundos en CPU, pero no se publica medición.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / ventana | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `brent-rnn-lstm-gru` | RNN/LSTM/GRU para Brent | 2.968 / 4.737 / 6.376 | 252 / 20 / 20 días | Variación logarítmica + rango del 80 % | MIT | Hugging Face + GitHub |
| Modelo ingenuo (random walk) | Baseline | 0 | No aplica | Precio futuro = precio actual | No aplica | Referencia interna del proyecto |
| Chronos (Amazon) | Transformer de series temporales | No disponible en esta ficha | No disponible en esta ficha | Zero-shot sobre series | Apache 2.0 | Hugging Face |
| TimesFM (Google) | Transformer de series temporales | No disponible en esta ficha | No disponible en esta ficha | Zero-shot sobre series | No disponible en esta ficha | Hugging Face |

La comparación con Chronos y TimesFM es cualitativa: son modelos fundacionales de series temporales de propósito general, mientras que `brent-rnn-lstm-gru` es un modelo específico para el Brent de tamaño ínfimo. No se dispone de datos de benchmarks comunes que permitan una comparación cuantitativa directa.

## Limitaciones y advertencias

- Ninguna de las tres redes supera de forma fiable al modelo ingenuo: las notas en el examen final son 1,005 (1 semana), 1,094 (3 meses) y 1,198 (1 año), es decir, se equivocan más que «el precio de hoy».
- Los horizontes de 3 meses y 1 año predicen subidas grandes por el efecto aprendido tras caídas con el mercado nervioso; en el examen final esas mismas redes fueron peores que el ingenuo.
- No anticipa choques: el 4 de noviembre de 2026 el Brent cayó un 14 % en un día y ni las redes ni el ingenuo lo vieron.
- El horizonte de un año tiene muy pocos movimientos independientes; sus métricas son orientativas.
- El rango del 80 % a 3 meses y a 1 año no mejora a un rango de anchura fija; solo a 1 semana aporta una mejora del 7 %.
- Los pesos solo son utilizables con el código del repositorio, que reconstruye las fichas de entrada exactamente como en entrenamiento; no hay inferencia autónoma desde Hugging Face.
- El repositorio no incluye los datos de entrenamiento (FRED y Yahoo Finance, 2000 a noviembre de 2026), por lo que la reproducibilidad depende de la disponibilidad de esas fuentes.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí de falsa confianza: presentar la predicción sin el rango y sin la advertencia induce a error.
- Licencia MIT permite uso comercial, pero el autor declara explícitamente que es un proyecto académico y no asesoramiento financiero ni recomendación de inversión.
- Sesgos conocidos: no se documentan análisis de sesgo; el modelo está entrenado con datos de mercado históricos y puede heredar regímenes pasados que no se repitan.
- Descargas y likes en Hugging Face: 0 en el momento de la consulta; no hay validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/PabloJimenezGirardeau/brent-rnn-lstm-gru
- Repositorio GitHub (código, notebooks y diario): https://github.com/PabloJimenezGirardeau/Caso-Oil-Price
- Space del proyecto (aplicación con datos al momento): referenciado en la model card, URL no disponible en la información proporcionada
- Paper: no disponible
- Blog del autor: no disponible
- Demo adicional: no disponible
