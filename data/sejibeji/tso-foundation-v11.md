# Sejibeji/tso-foundation-v11

## Resumen

El modelo TSO Foundation Model v11, desarrollado por Sejibeji (Sehaj Randhir Singh), es un modelo fundacional para series temporales que aprende la representación geométrica de sistemas dinámicos mediante operadores de Koopman. En lugar de tokenizar números como los modelos de lenguaje, utiliza embeddings de Takens y un espacio de escalas para capturar la estructura subyacente de las series, permitiendo transferencia a series nunca vistas sin entrenamiento adicional, mediante un ajuste de Koopman en forma cerrada sobre el latente congelado.

El modelo se preentrena con cuatro pretextos auto-supervisados: reconstrucción, dinámica lineal de Koopman, covarianza de escala (renormalización) y flecha del tiempo, sobre 40 series de 8 dominios (electricidad, meteorología, ECG, finanzas, epidemiología, economía, física solar y sistemas caóticos). Los resultados reportados incluyen un 72,5% de victorias zero-shot frente a GRU por serie y el redescubrimiento del ciclo solar de Schwabe (~11 años) a partir de los eigenvalores de Koopman ajustados sobre una serie de manchas solares retenida.

La relevancia actual radica en su enfoque novedoso para la predicción de series temporales, alejándose de los modelos de lenguaje y apostando por una representación operador-teórica que promete generalización con cero pasos de gradiente. Sin embargo, el repositorio no incluye pesos preentrenados (tamaño 0.0 GB), solo código y documentación, lo que limita su uso directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Operador de Koopman con encoder profundo, embeddings de Takens y espacio de escalas (latent 256, hidden 768) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de series temporales, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (aunque es para series temporales, no texto) |
| Licencia | MIT |
| Formato de pesos | no disponible (no se publican pesos, solo código) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura basada en operadores de Koopman. Primero, las series brutas se transforman mediante embeddings de Takens (delay-embedding con tau específico por serie). Luego, se construye un espacio de escalas con versiones finas y renormalizadas (coarsened) de los embeddings; una capa `scale_map` impone covarianza de escala, de modo que periodos como el ciclo solar emergen como eigenmodos limpios en escalas gruesas. Un encoder profundo (latent 256, hidden 768) realiza el "lift" de Koopman, aplanando el atractor no lineal en un espacio latente donde la dinámica es aproximadamente lineal (matriz K). Finalmente, una cabeza convolucional clasifica ventanas hacia adelante vs. invertidas para el pretexto de flecha del tiempo.

El preentrenamiento combina cuatro objetivos auto-supervisados: reconstrucción, linealidad de Koopman, covarianza de escala y flecha del tiempo. Se entrenó durante 25.000 iteraciones con 3 semillas en una GPU T4 con AMP (automatic mixed precision). El corpus comprende 40 series de 8 dominios, aunque no se especifica el número total de tokens ni la composición exacta del dataset. No se menciona el uso de RLHF ni DPO; el ajuste para nuevas series es un problema de mínimos cuadrados con regularización ridge sobre el latente congelado, sin retropropagación.

## Capacidades

- Predicción de series temporales en modo zero-shot: ajusta un operador de Koopman en forma cerrada sobre el latente congelado, sin entrenamiento adicional.
- Redescubrimiento de ciclos y periodicidades: el análisis de eigenvalores de Koopman permite identificar periodos dominantes, como el ciclo solar de ~11 años.
- Manejo de series de diferentes dominios y frecuencias de muestreo, gracias a los embeddings de Takens y la covarianza de escala.
- Clasificación de la flecha del tiempo: distingue secuencias temporales hacia adelante de las invertidas (precisión reportada del 95,1%).
- Proyección de trayectorias sobre el atractor observado mediante una envolvente que mantiene la coherencia dinámica.
- No requiere ajuste fino por serie: la transferencia es un ajuste lineal cerrado, lo que reduce drásticamente el coste computacional.

## Casos de uso

- Predicción de demanda eléctrica: el modelo puede pronosticar la carga eléctrica a corto y medio plazo sin reentrenamiento por región, aprovechando su capacidad de transferencia entre series de la misma naturaleza.
- Monitorización meteorológica: predicción de variables como temperatura o precipitación a partir de series históricas, con la ventaja de no necesitar datos etiquetados para cada estación.
- Análisis de señales biomédicas (ECG): detección de anomalías o predicción de evolución de señales fisiológicas, donde la estructura dinámica es compleja y no lineal.
- Predicción financiera de activos con dinámica estable: el modelo funciona bien en series sin picos extremos ni raíces unitarias, como ciertos índices o tipos de cambio, ofreciendo una alternativa a modelos ARIMA o GRU.
- Epidemiología: proyección de curvas de contagio en regiones con patrones similares, siempre que las series no presenten cambios bruscos (el autor advierte de limitaciones en series como covid-india).
- Investigación en física solar: identificación de ciclos y periodicidades en series de manchas solares, como demuestra el redescubrimiento del ciclo de Schwabe.
- Sistemas caóticos: análisis de atractores y predicción a corto plazo en sistemas como el de Lorenz, gracias a la representación de Koopman.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados para la versión v11 (GPU-pretrained, latent 256 / hidden 768, 25.000 iteraciones × 3 semillas, T4 + AMP):

| Metrica | Valor |
|---|---|
| Victorias zero-shot vs GRU por serie (40 series, in-kernel) | 29/40 (72,5%) |
| Mediana de habilidad congelada vs persistencia | +0,4% (GRU: -60,6%) |
| Redescubrimiento del ciclo solar (manchas solares retenidas) | 127 meses vs 132 conocidos (10,6 años) |
| Precision del pretexto de flecha del tiempo | 95,1% |

No se proporcionan comparaciones con otros modelos fundacionales de series temporales (p. ej., TimesFM, Chronos, Lag-Llama) en la información disponible.

## Requisitos de hardware

- No se especifican requisitos de VRAM para inferencia en la documentación.
- El entrenamiento se realizó en una GPU T4 (16 GB) con AMP, lo que sugiere que el modelo es relativamente ligero (latent 256, hidden 768).
- Dado el tamaño del modelo, es probable que quepa en GPUs de consumo como RTX 3060 o superiores, pero no hay datos confirmados.
- No se mencionan opciones de despliegue específicas (vLLM, llama.cpp, etc.); el código proporcionado usa PyTorch estándar.
- La inferencia zero-shot implica un ajuste de Koopman en forma cerrada (regresión ridge) sobre el latente, lo que es computacionalmente barato, pero no se ofrecen cifras de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han encontrado comparaciones con otros modelos fundacionales de series temporales en la información proporcionada.

## Limitaciones y advertencias

- Series con picos extremos o raíz unitaria (p. ej., Dogecoin, covid-india) superan la capacidad del probe de forma cerrada; en esos casos, la persistencia es imbatible.
- El probe lineal congelado se estanca: preentrenar más allá de la saturación de los pretextos (≈25k iteraciones a este ancho) no mejora la transferencia; la capacidad y la amplitud del corpus son los factores limitantes.
- Los pretextos auto-supervisados solo aportan beneficios por encima de ~15.000 iteraciones; entrenamientos más cortos no producen mejoras.
- No se publican pesos preentrenados en el repositorio (tamaño 0.0 GB), solo código y documentación; para reproducir los resultados es necesario ejecutar el entrenamiento desde cero.
- La licencia MIT permite uso comercial, pero al no haber pesos disponibles, el uso práctico requiere acceso al código de entrenamiento y a los datos del corpus.
- El modelo está orientado a series temporales unidimensionales; no se menciona soporte para datos multivariantes o de alta dimensión.

## Enlaces

- [HuggingFace: Sejibeji/tso-foundation-v11](https://huggingface.co/Sejibeji/tso-foundation-v11)
- [Perfil del autor en HuggingFace](https://huggingface.co/Sejibeji)
