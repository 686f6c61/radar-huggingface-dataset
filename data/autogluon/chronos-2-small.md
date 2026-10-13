# autogluon/chronos-2-small

## Resumen

Chronos-2-small es un modelo fundacional de predicción de series temporales (time series forecasting) desarrollado por el equipo AutoGluon de Amazon, dentro de la familia Chronos. Se trata de la variante "small" del modelo Chronos-2, con 27.934.624 parámetros (aproximadamente 28M) y una arquitectura basada en T5, segun las etiquetas del repositorio. El modelo está preentrenado sobre una gran colección de series temporales reales y sintéticas, lo que le permite generar pronósticos precisos sin entrenamiento específico previo (zero-shot) sobre datos nuevos.

El problema que resuelve es el de la predicción de series temporales sin necesidad de ajustar un modelo distinto para cada dominio: un único checkpoint puede aplicarse a demanda energética, ventas, tráfico, sensores industriales u otras señales. La versión Chronos-2 introduce soporte zero-shot para covariables y, segun la documentación de AutoGluon, alcanza una tasa de victoria superior al 90% frente a Chronos-Bolt en evaluaciones comparativas.

Su relevancia actual radica en que combina un tamano muy reducido (repo de 0.1 GB, licencia Apache 2.0) con integración directa en AutoGluon-TimeSeries, lo que abarata el despliegue tanto en infraestructura cloud como en hardware de consumo. El modelo está asociado al paper "Chronos-2: From Univariate to Universal Forecasting" (arXiv:2510.15821) y participa en los leaderboards GIFT-Eval y fev-leaderboard.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en T5 (segun etiquetas del repositorio) |
| Parametros totales | 27.934.624 (aproximadamente 28M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de series temporales; los idiomas no estan definidos) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La etiqueta `t5` del repositorio indica que Chronos-2-small emplea una arquitectura derivada de T5, adaptada a la prediccion de series temporales. La informacion disponible no detalla la configuracion exacta (numero de capas, dimensiones de atencion, mecanismo de tokenizacion de la serie), por lo que estos extremos quedan como no disponibles. El paper asociado, "Chronos-2: From Univariate to Universal Forecasting", sugiere una evolucion desde el modelado univariante hacia un enfoque universal, con soporte de covariables en modo zero-shot.

El modelo fue preentrenado sobre los conjuntos `autogluon/chronos_datasets` y `Salesforce/GiftEvalPretrain`, que combinan series temporales reales y sinteticas. La model card no especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO; estos datos no estan disponibles. La documentacion de AutoGluon senala como innovacion principal el soporte zero-shot de covariables y una mejora sustancial frente a Chronos-Bolt, pero no se aportan detalles tecnicos adicionales sobre el mecanismo interno.

## Capacidades

- Prediccion de series temporales: genera pronosticos out-of-the-box sobre datos nuevos sin reentrenamiento (zero-shot).
- Soporte de covariables en modo zero-shot: permite incorporar variables exogenas en el pronostico sin ajuste especifico, segun la documentacion de AutoGluon 1.5.
- Forecasting univariante y universal: el titulo del paper indica evolucion desde el caso univariante hacia un enfoque universal.
- Integracion con AutoGluon-TimeSeries: disponible como modelo de la familia Chronos dentro del framework AG-TS.
- Rendimiento comparativo: la documentacion reporta una tasa de victoria superior al 90% frente a Chronos-Bolt.
- Generacion de texto, codigo, matematicas, vision, audio, tool calling o agentes: no aplica; este modelo esta especializado exclusivamente en prediccion de series temporales.

## Casos de uso

- Demanda energetica: predecir consumo electrico horario a partir del historico de la serie, aprovechando el soporte zero-shot para incorporar como covariable la temperatura o el calendario sin reentrenar el modelo.
- Prevision de ventas minoristas: generar pronosticos de demanda por producto o tienda sobre series con estacionalidad, usando el modelo como componente base dentro de AutoGluon-TimeSeries y anadiendo promociones como covariables.
- Monitorizacion industrial: anticipar valores futuros de sensores (temperatura, presion, vibracion) para deteccion temprana de anomalias, donde el bajo coste computacional del checkpoint de 28M permite ejecutarlo en el edge.
- Planificacion de capacidad en cloud: proyectar metricas de uso (CPU, memoria, peticiones por segundo) para escalado anticipado de infraestructura, con la serie de trafico como covariable.
- Prediccion financiera de series de alta frecuencia: estimar la evolucion de indicadores como volumen de operaciones o spreads, evaluando el modelo contra referencias en el leaderboard GIFT-Eval.
- Investigacion en modelos fundacionales de series temporales: servir como variante ligera para reproducir experimentos del paper Chronos-2 y comparar contra Chronos-Bolt y otros TSFM en los leaderboards publicos.
- Forecasting embebido y pruebas rapidas: por su tamano (0.1 GB de repositorio), puede desplegarse en entornos con recursos limitados para validar rapidamente la viabilidad de un caso de uso antes de escalar a variantes mayores.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de forecasting especificas (MASE, SMAPE, CRPS), y el contenido se limita a remitir al modelo Chronos-2 principal. La informacion disponible unicamente indica lo siguiente:

| Referencia | Resultado |
|---|---|
| Comparativa frente a Chronos-Bolt | tasa de victoria superior al 90% (segun documentacion de AutoGluon) |
| Leaderboard GIFT-Eval | participacion registrada; resultados numericos no disponibles |
| Leaderboard fev-leaderboard | participacion registrada; resultados numericos no disponibles |

Para cifras concretas debe consultarse el paper arXiv:2510.15821 y los leaderboards enlazados.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 27,93M de parametros; no confirmada por el autor): aproximadamente 112 MB en FP32, 56 MB en FP16 y 28 MB en INT8, sin contar activaciones ni overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es mas que suficiente; una NVIDIA RTX 3060, RTX 4090, A100 o H100 cubren el modelo con margen amplio.
- Inferencia en CPU: viable y practica dado el tamano reducido del modelo (28M de parametros).
- Consumer GPU: si, cabe holgadamente en cualquier GPU de consumo actual e incluso integrada.
- Opciones de despliegue: biblioteca `chronos-forecasting` (libreria oficial del repositorio) y AutoGluon-TimeSeries (AG-TS). No se confirma en la informacion disponible soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| chronos-2-small | 27,93M | no disponible | apache-2.0 | Variante ligera de Chronos-2 |
| chronos-2 (base) | no disponible | no disponible | apache-2.0 | Modelo principal de la familia; referencia de la model card |
| chronos-bolt | no disponible | no disponible | no disponible | Version anterior; Chronos-2 reporta mas del 90% de victorias frente a ella |

Los datos de parametros, contexto y licencia de chronos-2 y chronos-bolt no estan disponibles en la informacion proporcionada. No se dispone de comparativas numericas con otros modelos fundacionales de series temporales.

## Limitaciones y advertencias

- Especializacion: el modelo solo realiza prediccion de series temporales; no genera texto, codigo ni admite tool calling.
- Sesgos: no se documentan sesgos conocidos, pero al entrenarse con datos reales y sinteticos puede heredar sesgos de las fuentes (`autogluon/chronos_datasets`, `Salesforce/GiftEvalPretrain`).
- Alucinacion: en el contexto de forecasting, el riesgo se traduce en pronosticos alejados de la realidad cuando la serie de entrada queda fuera de la distribucion de entrenamiento; no se aportan garantias al respecto.
- Limitaciones de contexto e idioma: la longitud de contexto no esta especificada y no se documentan limites por idioma (no aplica, al no ser un modelo de lenguaje).
- Licencia: apache-2.0, por lo que se permite uso comercial manteniendo el aviso de licencia y atribucion; conviene revisar los terminos de los datasets de entrenamiento.
- Produccion: el modelo se distribuye basicamente como componente de la libreria `chronos-forecasting` y AutoGluon; no se confirman backends de inferencia alternativos (vLLM, llama.cpp, etc.), lo que puede condicionar la integracion en stacks existentes.
- Datos incompletos: la model card remite al modelo Chronos-2 para detalles de uso, de modo que buena parte de las especificaciones tecnicas de esta variante no estan documentadas de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/autogluon/chronos-2-small
- Modelo principal Chronos-2: https://huggingface.co/autogluon/chronos-2
- Paper "Chronos-2: From Univariate to Universal Forecasting": https://arxiv.org/abs/2510.15821
- Tutorial de forecasting con Chronos-2 en AutoGluon (version estable): https://auto.gluon.ai/stable/tutorials/timeseries/forecasting-chronos.html
- Tutorial de forecasting con Chronos-2 en AutoGluon 1.5: https://auto.gluon.ai/1.5/tutorials/timeseries/forecasting-chronos.html
- Leaderboard GIFT-Eval: https://huggingface.co/spaces/Salesforce/GIFT-Eval
- Leaderboard fev-leaderboard: https://huggingface.co/spaces/autogluon/fev-leaderboard
- Dataset de entrenamiento chronos_datasets: https://huggingface.co/datasets/autogluon/chronos_datasets
- Dataset de entrenamiento GiftEvalPretrain: https://huggingface.co/datasets/Salesforce/GiftEvalPretrain
- Repositorio de catalogo (no oficial): https://github.com/vaibhav06062005-ctrl/ai-model-autogluon-chronos-2-small
