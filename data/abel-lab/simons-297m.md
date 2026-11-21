# abel-lab/Simons-297M

## Resumen

Simons-297M es un modelo fundacional de series temporales desarrollado por Abel AI Lab, orientado a la previsión probabilística (probabilistic forecasting). Con 297,2 millones de parámetros, está diseñado para trabajar tanto con series univariantes como multivariantes, admitiendo además covariables conocidas en el futuro (known-future covariates), lo que lo hace adecuado para escenarios de planificación donde se dispone de información exógena como calendarios, promociones o variables meteorológicas.

La arquitectura combina un transformer causal que opera sobre parches (patches) de 32 pasos temporales con una capa de atención entre las variantes de una misma serie. El modelo maneja ventanas de contexto de hasta 32.768 pasos y genera predicciones en bloques de 512 pasos por pasada forward, lo que permite horizontes largos mediante composición por bloques. Su salida son 9 cuantiles (0,1 a 0,9), lo que lo convierte en una herramienta directamente utilizable para cuantificar incertidumbre en la predicción.

El modelo es relevante en el contexto actual de modelos fundacionales para series temporales, donde la competición se centra en obtener previsiones precisas y probabilísticas con coste computacional reducido. Simons-297M declara una eficiencia notable: según el autor, es aproximadamente diez veces más rápido que modelos de tamaño similar al predecir un benchmark completo en una única GPU A100. Se distribuye con licencia openmdw-1.1, junto con su código de inferencia y entrenamiento, el dataset de preentrenamiento público y tres versiones adicionales de distinto tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal sobre parches de 32 pasos + capa de atención entre variantes; 13 capas, ancho 1280, 20 cabezas |
| Parámetros totales | 297.230.368 (297,2M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 32.768 pasos temporales de histórico; 512 pasos por pasada forward (horizontes mayores por bloques) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (modelo de series temporales, no de lenguaje) |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors |
| Entradas | Hasta 32 variantes y hasta 16 covariables conocidas en el futuro por serie (numéricas o categóricas); NaN marca valores faltantes |
| Salidas | 9 cuantiles (0,1, 0,2, …, 0,9) |
| Librería | `simons` (PyTorch), versión 0.1.0 o superior |
| Tamaño del repositorio | 1,2 GB |

## Arquitectura y entrenamiento

Simons-297M es un transformer causal que tokeniza la serie temporal en parches de 32 pasos. Tras procesar la secuencia de parches con 13 capas de atención de ancho 1280 y 20 cabezas, una capa de atención adicional modela las dependencias entre las distintas variantes de una serie multivariante. Esta combinación permite capturar tanto la dinámica temporal intra-serie como las correlaciones cruzadas entre variables, algo crítico en previsión multivariante. El modelo acepta hasta 32 variantes y hasta 16 covariables conocidas en el futuro por serie, de tipo numérico o categórico; las covariables solo pasadas se aceptan pero se descartan.

El entrenamiento se estructura en cuatro etapas, desde un preentrenamiento sintético hasta un post-entrenamiento sobre datos reales. Los pesos publicados corresponden a la media con pesos iguales entre el modelo de la etapa 3 y su continuación, una técnica de fusión de pesos conocida como WiSE-FT (Weight-Space Ensembling for Fine-Tuning). El dataset de preentrenamiento público está disponible en `abel-lab/Simons-Pretrain`. La model card no detalla el número exacto de tokens de entrenamiento ni la composición completa del dataset, por lo que esos datos no están disponibles.

## Capacidades

- Previsión probabilística de series temporales: genera 9 cuantiles por paso, permitiendo construir intervalos de predicción y distribuciones empíricas.
- Series univariantes y multivariantes: soporta hasta 32 variantes por serie.
- Covariables conocidas en el futuro: hasta 16 por serie, numéricas o categóricas (por ejemplo, calendario, festivos, promociones).
- Manejo de valores faltantes: los NaN se interpretan como datos ausentes.
- Contexto largo: hasta 32.768 pasos de histórico, útil para series con estacionalidades largas o dependencias de largo plazo.
- Horizontes largos por bloques: 512 pasos por pasada forward, con composición por bloques para horizontes mayores.
- Inferencia en CPU y GPU mediante PyTorch y el paquete `simons`.
- No soporta tool calling, agentes, visión, audio ni capacidades lingüísticas: es un modelo especializado exclusivamente en series temporales.

## Casos de uso

- Previsión de demanda energética: el modelo puede ingerir el histórico de consumo (hasta 32 variantes, por ejemplo por región o por tipo de cliente) junto con covariables de calendario y meteorología conocidas en el futuro, y producir cuantiles de demanda horaria para planificación de generación y reservas.
- Gestión de inventario y planificación de suministro: con series de ventas por producto y covariables de promociones planificadas, Simons-297M genera distribuciones de demanda futura que permiten fijar niveles de stock con un nivel de servicio objetivo (por ejemplo, el cuantil 0,9).
- Previsión financiera de series de alta frecuencia: su contexto de 32.768 pasos y su capacidad multivariante permiten modelar series como tipos de cambio, volatilidad o volúmenes con dependencias cruzadas entre activos.
- Monitorización de infraestructuras y capacity planning: previsión de métricas de tráfico, latencia o uso de CPU con covariables conocidas (despliegues programados, ventanas de mantenimiento) para anticipar saturación.
- Previsión meteorológica y de variables ambientales: series multivariantes de temperatura, humedad y viento con covariables exógenas, generando intervalos de incertidumbre para modelos aguas abajo.
- Planificación de recursos humanos: previsión de afluencia de clientes o carga de trabajo por franja horaria con covariables de calendario, para dimensionar turnos con cuantiles de riesgo.
- Investigación en modelos fundacionales de series temporales: el modelo, su código de entrenamiento y el dataset público permiten reproducir y extender experimentos de preentrenamiento y post-entrenamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (métricas relativas a Seasonal Naive; `verified: false`):

| Benchmark | Métrica | Valor |
|---|---|---|
| GIFT-Eval | MASE (relativo a Seasonal Naive) | 0,6731 |
| GIFT-Eval | CRPS (relativo a Seasonal Naive) | 0,4574 |
| fev-bench | SQL skill score (%, relativo a Seasonal Naive) | 48,41 |
| fev-bench | MASE skill score (%, relativo a Seasonal Naive) | 37,85 |
| TIME | MASE (relativo a Seasonal Naive) | 0,6371 |
| TIME | CRPS (relativo a Seasonal Naive) | 0,5341 |

En cuanto a eficiencia, el autor declara que en una única GPU A100 Simons-297M predice un benchmark completo en minutos, aproximadamente diez veces más rápido que modelos de tamaño similar. No se proporcionan cifras absolutas de latencia ni de throughput en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 297,2M parámetros, los pesos en precisión completa (fp32) ocupan aproximadamente 1,2 GB; en fp16/bf16, unos 0,6 GB. A ello hay que sumar memoria para activaciones y lotes, que depende de la longitud de contexto y del número de series.
- GPU recomendadas: el autor cita una A100 para las mediciones de eficiencia; por tamaño, el modelo debería caber holgadamente en GPUs de consumo como RTX 3090, RTX 4090 o superiores, aunque no se confirman requisitos mínimos en la información disponible.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo, pero no hay confirmación oficial en la model card.
- Opciones de despliegue: PyTorch en CPU o GPU mediante el paquete `simons` (versión 0.1.0 o superior), instalable desde el repositorio de GitHub. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: solo se declara la comparación relativa (unas diez veces más rápido que modelos de tamaño similar en A100); no hay cifras absolutas disponibles.

## Comparativa con modelos similares

La información proporcionada no incluye una comparativa numérica con modelos alternativos concretos. El autor menciona que Simons-297M se posiciona frente a "cuatro modelos ampliamente utilizados" en los leaderboards de GIFT-Eval, fev-bench y TIME (entre las entradas de pesos abiertos), pero no detalla sus nombres ni sus resultados en el texto disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Simons-297M | 297,2M | 32.768 pasos | openmdw-1.1 | Hugging Face, GitHub, dataset público |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Resultados de benchmarks no verificados: las métricas de la model card están marcadas como `verified: false`; conviene contrastarlas en los leaderboards oficiales antes de tomar decisiones.
- Modelo especializado: no es un modelo de lenguaje; no genera texto, no soporta tool calling ni razonamiento simbólico. Su uso está limitado a previsión de series temporales.
- Límites estructurales: máximo de 32 variantes y 16 covariables conocidas en el futuro por serie; horizontes superiores a 512 pasos requieren composición por bloques, lo que puede acumular error.
- Datos de entrenamiento incompletos: la model card no detalla el volumen de tokens ni la composición del dataset, lo que dificulta evaluar sesgos de dominio.
- Riesgo de mal rendimiento fuera de distribución: como todo modelo fundacional de series temporales, puede degradarse en dominios con dinámicas muy distintas a las del preentrenamiento (por ejemplo, series con cambios de régimen abruptos o datos muy ruidosos).
- Incertidumbre calibrada solo hasta donde alcancen los benchmarks: los cuantiles de salida deben validarse en el dominio concreto antes de usarse en producción.
- Licencia openmdw-1.1: es una licencia de pesos abiertos, pero conviene revisar sus términos exactos para uso comercial, ya que la información disponible no detalla restricciones específicas.
- Idiomas: no aplica; el modelo no procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abel-lab/Simons-297M
- Repositorio GitHub (inferencia y entrenamiento): https://github.com/Abel-ai-lab/Simons
- Guía de inicio: https://github.com/Abel-ai-lab/Simons/blob/main/docs/GETTING_STARTED.md
- Dataset de preentrenamiento: https://huggingface.co/datasets/abel-lab/Simons-Pretrain
- Post de presentación: https://abel.ai/research/introducing-simons/
- Colección Simons 1 (cuatro tamaños): https://huggingface.co/collections/abel-lab/simons-1-6ae3d4ce9705938e293c52dd
- Demo Simons Forecast Explorer: https://huggingface.co/spaces/abel-lab/simons-forecast-explorer
- Leaderboard GIFT-Eval: https://huggingface.co/spaces/Salesforce/GIFT-Eval
- Leaderboard fev-bench: https://huggingface.co/spaces/autogluon/fev-bench
- Leaderboard TIME: https://huggingface.co/spaces/Real-TSF/TIME-leaderboard
