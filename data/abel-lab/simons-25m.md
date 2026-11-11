# abel-lab/Simons-25M

## Resumen

Simons-25M es un modelo fundacional de series temporales desarrollado por Abel AI Lab, orientado a la previsión probabilística (probabilistic forecasting). Con 25,1 millones de parámetros, es la variante más pequena de la familia Simons 1, que también incluye un modelo de 297M y otras dos tallas. El modelo resuelve el problema de generar distribuciones predictivas (no solo puntos) sobre horizontes de hasta 512 pasos por pasada, con soporte para series univariantes y multivariantes y para covariables conocidas en el futuro.

La arquitectura es un transformer causal que opera sobre parches (patches) de 32 pasos temporales y aplica después una capa de atención entre las variates de una serie. Con 12 capas, anchura 384 y 6 cabezas de atención, el modelo acepta hasta 16.384 pasos de historia, hasta 32 variates y hasta 16 covariables futuras conocidas, numéricas o categóricas, marcando los valores ausentes con NaN.

Su relevancia actual radica en que es un modelo fundacional abierto (licencia OpenMDW-1.1) con pesos en safetensors, código de inferencia y entrenamiento público, y resultados declarados en los benchmarks de referencia del sector (GIFT-Eval y fev-bench). Su tamano reducido permite desplegarlo en CPU o en GPU de consumo, lo que lo hace util para prototipado rápido y para entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal sobre parches de 32 pasos + atencion entre variates; 12 capas, anchura 384, 6 cabezas |
| Parametros totales | 25.121.568 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 16.384 pasos temporales de historia; 512 pasos por pasada (horizontes mayores por bloques) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de series temporales, no de texto) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (libreria `simons`, PyTorch) |

## Arquitectura y entrenamiento

El modelo es un transformer causal que tokeniza la serie temporal en parches de 32 pasos y procesa la secuencia de parches con 12 capas de atención de anchura 384 y 6 cabezas. Tras el codificador temporal, una capa de atención cruza las variates de una misma serie, lo que permite modelar dependencias multivariantes. La entrada admite hasta 32 variates y hasta 16 covariables conocidas en el futuro (numéricas o categóricas); las covariables solo pasadas se aceptan y se descartan. La salida son 9 cuantiles (0,1 a 0,9), lo que proporciona una previsión probabilística completa.

El entrenamiento consta de cuatro etapas, desde un preentrenamiento sintético hasta un post-entrenamiento sobre datos reales. Los pesos publicados son la media uniforme de las dos continuaciones finales (model soups). Los datos de preentrenamiento públicos están en el dataset `abel-lab/Simons-Pretrain`, que incluye series sintéticas generadas con los generadores abiertos del repositorio y covariables futuras sintéticas; la model card no detalla el volumen total de tokens ni la composición exacta del corpus real. No se documenta el uso de RLHF ni DPO, algo esperable en un modelo de series temporales.

## Capacidades

- Previsión probabilística de series temporales: genera 9 cuantiles por paso, no solo una predicción puntual.
- Series univariantes y multivariantes: hasta 32 variates por serie.
- Covariables conocidas en el futuro: hasta 16 por serie, numéricas o categóricas.
- Manejo de valores ausentes mediante NaN en la entrada.
- Contexto largo: hasta 16.384 pasos de historia; horizontes de 512 pasos por pasada, extensibles por bloques.
- Previsión multi-paso y por bloques para horizontes largos.
- Inferencia en CPU y GPU con PyTorch mediante el paquete `simons` (version 0.1.0 o superior).
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües: es un modelo especializado en series temporales.

## Casos de uso

- Previsión de demanda retail: el modelo puede ingerir el histórico de ventas por producto (hasta 32 variates) junto con covariables futuras como promociones o festivos, y devolver cuantiles para planificar stock con intervalos de confianza.
- Gestión de energía y carga eléctrica: con historia de hasta 16.384 pasos y covariables meteorológicas conocidas a futuro, permite prever la curva de carga por bloques de 512 pasos y cuantificar la incertidumbre para el despacho.
- Monitorizacion de infraestructura: previsión probabilística de métricas (latencia, CPU, tráfico) con deteccion de anomalías basada en si el valor observado cae fuera de los cuantiles predichos.
- Planificación financiera y tesorería: prevision de flujos de caja o series de ventas con intervalos, usando covariables de calendario y campañas conocidas de antemano.
- Prototipado rápido en CPU: al tener 25M de parámetros, se puede ejecutar en portátiles o entornos sin GPU para validar pipelines de forecasting antes de escalar al modelo de 297M.
- Fine-tuning sobre dominios específicos: el repositorio incluye código de entrenamiento y la documentación cubre el ajuste fino, lo que permite adaptar el modelo a series propias con pocos recursos.
- Investigación en series temporales: servir como baseline abierto y reproducible en experimentos con GIFT-Eval o fev-bench, con pesos y datos de preentrenamiento públicos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor | Fuente |
|---|---|---|---|
| GIFT-Eval | MASE (relativo a Seasonal Naive) | 0,686 | Codigo oficial de GIFT-Eval |
| GIFT-Eval | CRPS (relativo a Seasonal Naive) | 0,4683 | Codigo oficial de GIFT-Eval |
| fev-bench | SQL skill score (%, relativo a Seasonal Naive) | 47,74 | Leaderboard de fev-bench |
| fev-bench | MASE skill score (%, relativo a Seasonal Naive) | 36,27 | Leaderboard de fev-bench |

La model card indica que los cuatro modelos Simons aparecen en el leaderboard oficial de TIME y ofrece graficos de posiciones en GIFT-Eval, fev-bench y TIME, pero no se incluyen en la informacion proporcionada los valores numericos de esas posiciones ni comparaciones directas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con pesos en fp32 (25M de parametros, ~100 MB de pesos), mas el coste de activaciones segun el tamano del lote y la longitud de contexto.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4090, A100 y H100. La model card menciona que Simons-297M tarda minutos en recorrer un benchmark completo en una A100, aproximadamente diez veces mas rapido que modelos de tamano similar; no se dan cifras de latencia para la variante de 25M.
- GPU de consumo: si, cabe en practicamente cualquier GPU de consumo moderna e incluso en CPU.
- Opciones de despliegue: paquete `simons` (PyTorch) en CPU o GPU; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles para esta talla en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos numericos de modelos comparables (por ejemplo, otras tallas de la familia Simons o modelos fundacionales de series temporales de tamano similar) que permitan una comparacion rigurosa de parametros, contexto y rendimiento. La model card menciona que los cuatro modelos Simons figuran en el leaderboard de TIME y ofrece graficos comparativos, pero no se incluyen los valores concretos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Simons-25M | 25,1M | 16.384 pasos | OpenMDW-1.1 | Hugging Face, codigo en GitHub |
| Otras tallas de la familia Simons 1 | no disponible en detalle | no disponible en detalle | OpenMDW-1.1 | Coleccion Simons 1 en Hugging Face |
| Modelos fundacionales de series temporales de terceros | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y estan marcados como no verificados (`verified: false`); conviene reproducirlos con el codigo oficial antes de tomar decisiones de produccion.
- La model card no detalla la composicion completa del corpus de entrenamiento ni el volumen de datos reales, lo que limita la evaluacion de sesgos y cobertura de dominios.
- Riesgo de mal calibracion de los cuantiles en series muy distintas a las de entrenamiento; es recomendable validar la cobertura empirica de los intervalos en el dominio propio.
- El contexto maximo es de 16.384 pasos de historia y 512 pasos por pasada; horizontes mayores requieren previsión por bloques, lo que puede acumular error.
- Limite de 32 variates y 16 covariables futuras por serie; series de mayor dimensionalidad requieren seleccion o agrupacion previa.
- No es un modelo de lenguaje: no soporta texto, tool calling, agentes ni capacidades multilingües.
- La licencia OpenMDW-1.1 debe revisarse para uso comercial; no se detallan en la informacion proporcionada las restricciones concretas de atribucion o redistribucion.
- No se documentan tipos de cuantizacion ni formatos alternativos a safetensors, lo que limita el despliegue en entornos no PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abel-lab/Simons-25M
- Repositorio GitHub (inferencia y entrenamiento): https://github.com/Abel-ai-lab/Simons
- Post de presentacion: https://abel.ai/research/introducing-simons/
- Coleccion Simons 1: https://huggingface.co/collections/abel-lab/simons-1-6ae3d4ce9705938e293c52dd
- Demo Simons Forecast Explorer: https://huggingface.co/spaces/abel-lab/simons-forecast-explorer
- Dataset de preentrenamiento: https://huggingface.co/datasets/abel-lab/Simons-Pretrain
- Documentacion de inicio: https://github.com/Abel-ai-lab/Simons/blob/main/docs/GETTING_STARTED.md
- Documentacion del modelo: https://github.com/Abel-ai-lab/Simons/blob/main/docs/MODEL.md
- Documentacion de entrenamiento: https://github.com/Abel-ai-lab/Simons/blob/main/docs/TRAINING.md
- Documentacion de datos: https://github.com/Abel-ai-lab/Simons/blob/main/docs/DATA.md
- Codigo de GIFT-Eval: https://github.com/SalesforceAIResearch/gift-eval
- Leaderboard fev-bench: https://huggingface.co/spaces/autogluon/fev-bench
- Leaderboard TIME: https://huggingface.co/spaces/Real-TSF/TIME-leaderboard
- Generadores sinteticos: https://github.com/Abel-ai-lab/Simons/tree/main/src/simons/synth
