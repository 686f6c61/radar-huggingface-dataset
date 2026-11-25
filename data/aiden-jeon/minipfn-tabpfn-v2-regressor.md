# aiden-jeon/minipfn-tabpfn-v2-regressor

## Resumen

minipfn TabPFN v2 regressor es una reimplementación desde cero del regresor TabPFN v2, un modelo fundacional para datos tabulares presentado por Hollmann et al. en *Nature* (2025). Lo desarrolla Aiden Jeon y se distribuye con licencia Apache 2.0. El modelo resuelve el problema de la regresión supervisada sobre tablas de datos pequeños: en lugar de entrenar un modelo específico por conjunto de datos, realiza aprendizaje en contexto (in-context learning), de modo que recibe las filas de entrenamiento y las de consulta en una única pasada y predice directamente, sin ajuste de parámetros.

La arquitectura es un transformer de 12 capas con dimensión de embedding 192, 6 cabezas de atención y MLP de 4× la dimensión de embedding, con un total de 11.087.057 parámetros. Cada capa aplica atención primero entre características y después entre filas, y cada token codifica 2 características. La salida es una distribución de barras sobre 5.000 cubos del objetivo estandarizado. Admite cualquier número de características y filas, aunque el entrenamiento cubrió hasta 160 características y 2.048 filas de entrenamiento.

Es relevante porque reproduce, con datos del prior abierto TabICL y sin usar código ni pesos oficiales, un modelo fundacional tabular de referencia, y publica curvas de entrenamiento y resultados de benchmark frente al artículo original. No es el checkpoint oficial de TabPFN v2 y no debe confundirse con él.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TabPFN v2 Transformer (12 capas, emsize 192, 6 cabezas, MLP 4× emsize; atención entre características y entre filas; post-LayerNorm sin parámetros afines; 2 características por token) |
| Parametros totales | 11.087.057 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (admite cualquier número de filas; entrenado hasta 2.048 filas de entrenamiento y 160 características) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo tabular, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo es un transformer tipo TabPFN v2 con atención alternada entre características y entre filas. La cabeza de salida produce una distribución de barras sobre 5.000 cubos del objetivo estandarizado, con colas half-normal; los bordes de los cubos son cuantiles de los objetivos del prior y se incluyen en los pesos (`borders` en `model.safetensors`). La inferencia por defecto usa un ensamblado de 8 miembros: cada miembro baraja características, añade una columna identificadora de fila aleatoria y alterna entre características por cuantiles más componentes SVD y una transformación de potencia Yeo-Johnson; la mitad de los miembros aplica también la transformación de potencia al objetivo. Las predicciones se devuelven a la escala original y se promedian. Las columnas categóricas con hasta 20 categorías se codifican one-hot.

El entrenamiento usó el prior SCM de grafos TabICL en modo regresión, con reglas de tamaño de tabla del artículo: filas de entrenamiento uniformes en 1–2.048 más 128 filas reservadas, características con distribución Beta(0.95, 8.0) escaladas a 1–160, menos de 75.000 celdas por tabla y valores faltantes aleatorios en el 30 % de las tablas con tasa 0–30 %. Se entrenaron 500.000 pasos con batch de 64 tablas, Adam con lr 2e-4, 10.000 pasos de warmup y schedule coseno sobre 2M pasos, en bf16 y con clipping de gradiente 1.0. El cómputo fue de 8×H100 para los pasos 0–200k y 32×H100 (4 nodos) para 200k–500k, unas 28 horas de reloj y aproximadamente 530 horas-H100. La NLL de validación final es −1.401.

El autor documenta tres cambios respecto al artículo para estabilizar el entrenamiento: objetivos dequantizados (los objetivos repetidos en una tabla se reparten uniformemente sobre los 100 cubos vecinos durante el entrenamiento), QK-clip con τ = 250 aplicado cada 50 pasos a las cabezas de atención entre filas, y una salvaguarda de colapso que reanuda desde una instantánea sana (no se activó en esta ejecución).

## Capacidades

- Regresión tabular supervisada mediante aprendizaje en contexto, sin ajuste de parámetros por conjunto de datos.
- Manejo de valores faltantes (entrenado con tasas de ausencia de 0–30 %).
- Soporte de variables categóricas mediante codificación one-hot (hasta 20 categorías por columna).
- Adaptación automática a la escala del objetivo mediante transformaciones de potencia y estandarización.
- Robustez ante distintas escalas y distribuciones de características gracias al ensamblado de 8 miembros con barajado y transformaciones.
- No soporta generación de texto, código, matemáticas, visión, audio, tool calling ni razonamiento multi-step: es un modelo exclusivamente tabular.
- Capacidades multilingües: no aplica.

## Casos de uso

- Predicción de precios y valoraciones: estimar el precio de inmuebles, vehículos u otros bienes a partir de tablas pequeñas de características, sin entrenar un modelo específico y aprovechando la inferencia en contexto sobre las filas históricas.
- Riesgo crediticio y scoring: evaluar probabilidad de impago con conjuntos de datos de cientos o miles de filas, donde los modelos clásicos requieren ingeniería de características y el modelo fundacional predice directamente.
- Predicción de demanda y series agregadas: estimar ventas o consumo por producto y periodo a partir de tablas de variables explicativas, útil cuando el histórico por segmento es reducido.
- Análisis científico con datos tabulares pequeños: regresión sobre mediciones experimentales (por ejemplo, propiedades físicas o químicas) donde el número de muestras es limitado y se busca una línea base fuerte sin ajuste.
- Evaluación rápida de conjuntos de datos en pipelines de ciencia de datos: usar el modelo como referencia inmediata antes de invertir en entrenamiento de modelos específicos, gracias a su inferencia sin ajuste.
- Predicción de métricas operativas: estimar variables continuas como tiempos de proceso, consumo energético o indicadores de calidad a partir de registros tabulares, con manejo nativo de valores faltantes.
- Investigación sobre modelos fundacionales tabulares: servir como reproducción abierta para estudiar el efecto del prior, el tamaño de tabla y las técnicas de estabilización del entrenamiento.

## Benchmarks y rendimiento

El benchmark es el de los 28 conjuntos de datos de regresión del artículo, con RMSE promediado sobre los 10 folds de OpenML. La métrica principal es la ratio de RMSE frente al artículo por conjunto de datos (por debajo de 1 es mejor), combinada como media geométrica.

| Checkpoint | Ratio RMSE, media geom. | Ratio RMSE, mediana | Conjuntos dentro de 1,1× | Media de RMSE negativa |
|---|---|---|---|---|
| 100k pasos | 1,167 | 1,059 | 18/28 | −1802,8 |
| 200k pasos | 1,183 | 1,057 | 20/28 | −1826,3 |
| 300k pasos | 1,159 | 1,026 | 19/28 | −1822,5 |
| 400k pasos | 1,172 | 1,041 | 18/28 | −1751,3 |
| 500k pasos (este modelo) | 1,118 | 1,023 | 21/28 | −1706,4 |
| Artículo (TabPFN v2) | 1 | 1 | 28/28 | −1685,6 |

En 7 conjuntos de datos este modelo supera el RMSE del artículo (socmob 0,93×, geographical_origin_of_music, boston y MIP-2016-regression 0,98×). La mayor parte de la diferencia se concentra en cuatro conjuntos:

| Conjunto de datos | Ratio RMSE |
|---|---|
| auction_verification | 2,66 |
| cpu_activity | 2,25 |
| grid_stability | 1,42 |
| airfoil_self_noise | 1,32 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 11,1 M de parámetros, por lo que los pesos ocupan aproximadamente 44 MB en fp32 y unos 22 MB en bf16; el consumo real está dominado por el ensamblado de 8 miembros y por el tamaño de la tabla de entrada.
- GPU recomendadas: cualquier GPU con suficiente memoria para la tabla; el entrenamiento se realizó en H100, pero la inferencia cabe holgadamente en GPU de consumo.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con varios GB de VRAM (por ejemplo, RTX 3060 en adelante), ya que el modelo es muy pequeño.
- Opciones de despliegue: PyTorch con el código del repositorio `Aiden-Jeon/minipfn`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo tabular de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del número de filas y características y del ensamblado de 8 miembros.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / tamaño de tabla | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| minipfn TabPFN v2 regressor (este modelo) | 11,1 M | hasta 160 características y 2.048 filas de entrenamiento | ratio RMSE 1,118 (media geom.) frente al artículo | Apache 2.0 | Hugging Face |
| TabPFN v2 oficial (PriorLabs) | no disponible | no disponible en la información proporcionada | referencia del artículo (ratio 1) | no disponible en la información proporcionada | GitHub PriorLabs/TabPFN |
| TabICL (soda-inria) | no disponible | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | GitHub soda-inria/tabicl |

## Limitaciones y advertencias

- No es el checkpoint oficial de TabPFN v2: no usa código ni pesos oficiales y sus resultados no son intercambiables con los del modelo original.
- Rendimiento inferior al del artículo en la mayoría de conjuntos de datos: ratio RMSE de 1,118 en media geométrica y 1,023 en mediana, con 21 de 28 conjuntos dentro de 1,1×.
- Diferencias notables en algunos conjuntos de datos concretos: auction_verification (2,66×) y cpu_activity (2,25×) quedan muy por encima del RMSE del artículo.
- Entrenado con tablas de menos de 75.000 celdas y hasta 160 características; el comportamiento fuera de ese rango no está garantizado.
- El modelo es exclusivamente de regresión; la clasificación es un modelo separado (minipfn-tabpfn-v2-classifier).
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de predicciones mal calibradas fuera de la distribución del prior de entrenamiento.
- Sesgos conocidos: no documentados en la información proporcionada; al entrenarse con un prior sintético, puede heredar sesgos del generador de tablas TabICL.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- La inferencia por defecto requiere 8 miembros y transformaciones adicionales, lo que multiplica el coste computacional frente a una única pasada.

## Enlaces

- Hugging Face: https://huggingface.co/aiden-jeon/minipfn-tabpfn-v2-regressor
- Clasificador asociado: https://huggingface.co/aiden-jeon/minipfn-tabpfn-v2-classifier
- Repositorio de código: https://github.com/Aiden-Jeon/minipfn
- Artículo TabPFN v2 (Nature): https://doi.org/10.1038/s41586-024-08328-6
- Prior TabICL: https://github.com/soda-inria/tabicl
- Modelos oficiales TabPFN: https://github.com/PriorLabs/TabPFN
