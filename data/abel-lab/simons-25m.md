# abel-lab/Simons-25M

## Resumen

Simons-25M es un modelo fundacional abierto para predicción de series temporales desarrollado por Abel AI Lab. Con 25,1 millones de parámetros, está diseñado específicamente para forecasting probabilístico, es decir, no solo predice el valor futuro de una serie sino que devuelve una distribución de probabilidad mediante 9 cuantiles (0,1 a 0,9). Resuelve el problema de tener que entrenar un modelo distinto para cada serie temporal: un único modelo preentrenado puede aplicarse directamente a dominios muy diversos sin ajuste específico.

La arquitectura es un transformer causal que opera sobre parches de 32 pasos temporales y añade una capa de atención entre las distintas variables de una serie. Soporta series univariantes y multivariantes (hasta 32 variables) con covariables de futuro conocido (hasta 16), lo que lo hace útil en escenarios donde se dispone de información exógena como calendarios, precios planificados o variables meteorológicas. Su ventana de contexto alcanza los 16.384 pasos de historia, con generación de horizontes largos por bloques de 512 pasos.

Es relevante ahora porque forma parte de una familia de cuatro tamaños (Simons 1) liberada con pesos, código de inferencia y entrenamiento, y datos de preentrenamiento públicos. En los leaderboards de referencia (GIFT-Eval, fev-bench y TIME) obtiene resultados competitivos frente a modelos de mayor tamaño, y el autor declara una eficiencia de inferencia notablemente superior a modelos de tamaño similar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal sobre parches de 32 pasos + capa de atención entre variables; 12 capas, anchura 384, 6 cabezas |
| Parámetros totales | 25.121.568 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 16.384 pasos de historia; 512 pasos por pasada, horizontes mayores por bloques |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo numérico, no lingüístico) |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (librería `simons`, PyTorch) |

## Arquitectura y entrenamiento

Simons-25M es un transformer causal que tokeniza la serie temporal en parches de 32 pasos. Tras procesar la secuencia de parches, una capa de atención dedicada modela las relaciones entre las distintas variables (variates) de una serie multivariante, lo que permite capturar dependencias cruzadas entre canales. El modelo acepta hasta 32 variables y hasta 16 covariables de futuro conocido, numéricas o categóricas, y utiliza NaN para marcar valores ausentes. Las covariables que solo existen en el pasado se aceptan pero se descartan en el cómputo.

El entrenamiento se organizó en cuatro etapas, desde un preentrenamiento sobre datos sintéticos hasta un post-entrenamiento con datos reales. Los pesos publicados son la media uniforme de dos continuaciones del entrenamiento (técnica de model soups), lo que suele mejorar la robustez frente a un único checkpoint. El conjunto de datos público de preentrenamiento está disponible en `abel-lab/Simons-Pretrain`. No se especifican en la información disponible el número exacto de tokens de entrenamiento ni la composición detallada del dataset. La salida del modelo son 9 cuantiles, lo que proporciona una representación directa de la incertidumbre sin necesidad de muestreo.

## Capacidades

- Forecasting probabilístico: devuelve 9 cuantiles (0,1 a 0,9) por paso temporal, no solo una predicción puntual.
- Series univariantes y multivariantes: hasta 32 variables por serie.
- Covariables de futuro conocido: hasta 16 por serie, numéricas o categóricas, lo que permite incorporar información exógena planificada.
- Manejo de valores ausentes mediante NaN en la entrada.
- Contexto largo: hasta 16.384 pasos de historia.
- Horizontes largos: generación por bloques de 512 pasos, permitiendo predicciones más allá de una sola pasada.
- Inferencia en CPU o GPU mediante PyTorch con el paquete `simons` (versión 0.1.0 o superior).
- No soporta tool calling, agentes, visión, audio ni capacidades lingüísticas: es un modelo puramente numérico de series temporales.

## Casos de uso

- Previsión de demanda minorista: el modelo puede ingerir el histórico de ventas por producto (hasta 32 variables simultáneas) junto con covariables de futuro conocido como festivos o promociones planificadas, y devolver cuantiles para dimensionar stock con márgenes de seguridad ajustados al riesgo.
- Planificación energética: predicción de carga eléctrica o generación renovable usando el histórico de las últimas 16.384 observaciones y covariables meteorológicas previstas, con intervalos de incertidumbre útiles para el despacho de energía.
- Monitorización de infraestructuras: detección de anomalías mediante la comparación de la serie observada con los cuantiles predichos; si el valor real cae fuera del intervalo, se dispara una alerta. El soporte de NaN facilita tratar huecos en la telemetría.
- Previsión financiera de series de alta frecuencia: el contexto de 16.384 pasos permite modelar estacionalidades diarias, semanales y de mayor periodo en una sola ventana, con salida probabilística para gestión de riesgo.
- Forecasting multivariante en logística: predicción conjunta de múltiples KPIs relacionados (volumen de envíos, tiempos de tránsito, ocupación de almacén) aprovechando la capa de atención entre variables.
- Evaluación rápida en pipelines de investigación: al ser un modelo pequeño (25M parámetros) y con inferencia eficiente, se puede usar como baseline fundacional en experimentos de comparación sin necesidad de GPU de gama alta.
- Predicción con datos incompletos: en dominios donde faltan mediciones (sensores que fallan), la marca NaN permite al modelo operar sin imputación manual previa.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Métrica | Valor |
|---|---|---|
| GIFT-Eval | MASE (relativo a Seasonal Naive) | 0,686 |
| GIFT-Eval | CRPS (relativo a Seasonal Naive) | 0,4683 |
| fev-bench | SQL skill score (%, relativo a Seasonal Naive) | 47,74 |
| fev-bench | MASE skill score (%, relativo a Seasonal Naive) | 36,27 |
| TIME | MASE (relativo a Seasonal Naive) | 0,6473 |
| TIME | CRPS (relativo a Seasonal Naive) | 0,5426 |

En eficiencia, el autor indica que Simons-297M (el tamaño mayor de la familia) completa la previsión de un benchmark entero en minutos sobre una A100, aproximadamente diez veces más rápido que modelos de tamaño similar. No se proporcionan cifras equivalentes específicas para Simons-25M en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 25,1M de parámetros en precisión completa (fp32) los pesos ocupan aproximadamente 100 MB; en fp16 unos 50 MB. La memoria adicional depende del tamaño de lote y de la longitud de contexto.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM es suficiente; el modelo no requiere A100 ni H100. Una RTX 4090 o incluso GPUs de gama media son más que adecuadas.
- Cabe en GPU de consumo: sí, con amplio margen, incluidas tarjetas de gama baja.
- CPU: el autor indica soporte explícito de inferencia en CPU mediante PyTorch.
- Opciones de despliegue: paquete `simons` (PyTorch) instalable desde el repositorio de GitHub; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no se publican cifras específicas para este tamaño; el autor destaca la eficiencia de la familia frente a modelos comparables.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de parámetros, contexto o licencia de modelos alternativos de forecasting (por ejemplo, otros modelos fundacionales de series temporales) para construir una comparativa rigurosa. La model card menciona que Simons-297M se posiciona frente a "cuatro modelos ampliamente utilizados" en los leaderboards, pero no se detallan sus nombres ni especificaciones en los datos disponibles.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Simons-25M | 25,1M | 16.384 pasos | openmdw-1.1 | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los resultados de benchmarks están declarados por el autor y marcados como no verificados; deben tratarse con cautela hasta su validación independiente.
- Es un modelo numérico de series temporales: no procesa texto, imágenes ni audio, y no dispone de capacidades de razonamiento lingüístico ni de tool calling.
- Límite de 32 variables y 16 covariables de futuro conocido por serie; series con más canales requieren particionado o selección previa.
- El horizonte por pasada es de 512 pasos; predicciones más largas dependen de la generación por bloques, lo que puede acumular error en horizontes muy extensos.
- Riesgo de degradación fuera de distribución: al ser un modelo preentrenado, su rendimiento puede caer en dominios muy distintos de los datos de entrenamiento; no se detalla la composición del dataset público de preentrenamiento.
- No se especifican sesgos conocidos ni comportamiento por idioma o región; al no ser lingüístico, los sesgos relevantes serían los presentes en los datos de series temporales de entrenamiento, no documentados en la información disponible.
- Licencia openmdw-1.1: conviene revisar sus términos exactos antes de un uso comercial en producción, ya que las condiciones de atribución y redistribución no se detallan en la información proporcionada.
- Requiere la librería `simons` versión 0.1.0 o superior; el ecosistema es joven y puede cambiar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abel-lab/Simons-25M
- Repositorio GitHub (inferencia y entrenamiento): https://github.com/Abel-ai-lab/Simons
- Guía de inicio: https://github.com/Abel-ai-lab/Simons/blob/main/docs/GETTING_STARTED.md
- Dataset de preentrenamiento: https://huggingface.co/datasets/abel-lab/Simons-Pretrain
- Post de presentación: https://abel.ai/research/introducing-simons/
- Colección Simons 1 (cuatro tamaños): https://huggingface.co/collections/abel-lab/simons-1-6ae3d4ce9705938e293c52dd
- Demo Forecast Explorer: https://huggingface.co/spaces/abel-lab/simons-forecast-explorer
- Leaderboard GIFT-Eval: https://huggingface.co/spaces/Salesforce/GIFT-Eval
- Leaderboard fev-bench: https://huggingface.co/spaces/autogluon/fev-bench
- Leaderboard TIME: https://huggingface.co/spaces/Real-TSF/TIME-leaderboard
