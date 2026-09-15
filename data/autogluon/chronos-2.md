# autogluon/chronos-2

## Resumen

Chronos-2 es un modelo fundacional de series temporales de 120 millones de parametros desarrollado por Amazon (equipo AutoGluon / Amazon Science), disenado para forecasting zero-shot. A diferencia de sus predecesores Chronos y Chronos-Bolt, unifica en una sola arquitectura tareas univariantes, multivariantes y con covariables (tanto pasadas como futuras conocidas), algo que anteriormente requeria modelos o pipelines separados. Su arquitectura esta inspirada en el encoder de T5 y produce previsiones cuantilicas multi-paso.

El modelo emplea un mecanismo de group attention que permite el aprendizaje en contexto (in-context learning) entre series relacionadas y covariables, lo que habilita el cross-learning entre items dentro de una misma prediccion. Con una longitud de contexto maxima de 8192 y una longitud de prediccion maxima de 1024, supera ampliamente los limites de Chronos-Bolt (2048/64) y Chronos (512/64). Fue entrenado sobre una combinacion de datos reales y datasets sinteticos a gran escala.

Su relevancia actual radica en que alcanza precision zero-shot de ultimo nivel entre modelos publicos en los leaderboards fev-bench, GIFT-Eval y Chronos Benchmark II, y al mismo tiempo es muy eficiente: supera las 300 predicciones de series temporales por segundo en una sola GPU A10G y admite inferencia tanto en GPU como en CPU. Se distribuye bajo licencia Apache 2.0 y cuenta con mas de 8,8 millones de descargas en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-only inspirado en T5, con group attention para in-context learning |
| Parametros totales | 119.477.664 (~120M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (modelo de series temporales) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Chronos-2 es un transformer encoder-only inspirado en el encoder de T5. En lugar de generar texto, tokeniza las series temporales y produce previsiones cuantilicas multi-paso hacia adelante. La innovacion principal es un mecanismo de group attention que permite el aprendizaje en contexto a traves de series relacionadas y covariables, lo que habilita de forma nativa el cross-learning entre items y el soporte de variables exogenas. Esto contrasta con Chronos y Chronos-Bolt, que no soportan cross-learning ni multivariante de forma nativa, y cuyas covariables futuras solo podian modelarse combinando el modelo con regresores externos.

El modelo fue entrenado sobre una combinacion de datasets del mundo real y datasets sinteticos a gran escala, usando los corpus `autogluon/chronos_datasets` y `Salesforce/GiftEvalPretrain`. La model card no detalla el numero exacto de tokens de entrenamiento ni la composicion precisa del dataset, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables directamente a un modelo de forecasting). El resultado reportado por el autor es una precision zero-shot de ultimo nivel en los leaderboards fev-bench, GIFT-Eval y Chronos Benchmark II.

## Capacidades

- Forecasting univariante zero-shot sin necesidad de reentrenamiento.
- Forecasting multivariante nativo dentro de una misma arquitectura.
- Cross-learning entre multiples series (items) relacionadas.
- Soporte nativo de covariables pasadas (reales y categoricas), disponibles solo en el historico.
- Soporte nativo de covariables futuras conocidas (reales y categoricas).
- Generacion de previsiones cuantilicas multi-paso (por ejemplo, cuantiles 0.1, 0.5 y 0.9) para obtener incertidumbre.
- Longitud de contexto de hasta 8192 pasos y horizonte de prediccion de hasta 1024 pasos.
- Inferencia en GPU y en CPU.
- API basada en pandas (`predict_df`) que acepta DataFrames con columnas de identificador, timestamp y target.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo especializado en series temporales, no un modelo de lenguaje.

## Casos de uso

- Prevision de demanda energetica: a partir del historico de consumo y de covariables como la temperatura prevista (covariable futura conocida), el modelo puede generar previsiones horarias con intervalos de confianza mediante cuantiles, aprovechando su contexto de 8192 pasos.
- Prediccion de precios de electricidad: usando el ejemplo oficial de la model card (`electricity_price`), se cargan valores historicos y covariables futuras, y se predicen 24 pasos hacia adelante con cuantiles 0.1/0.5/0.9 para gestionar el riesgo.
- Forecasting de ventas retail multi-producto: gracias al cross-learning entre items, se pueden predecir simultaneamente miles de SKUs relacionados dentro de una misma llamada, mejorando series con poco historico al compartir patrones con otras.
- Monitorizacion de infraestructura y capacidad: prevision de metricas como latencia, trafico o uso de CPU/GPU para escalado proactivo, con horizontes largos gracias al limite de 1024 pasos de prediccion.
- Planificacion financiera y tesoreria: prevision de flujos de caja o indicadores macro con covariables exogenas conocidas (calendario, tipos de interes anunciados) modeladas nativamente.
- Mantenimiento predictivo: prevision de senales de sensores multivariantes (vibracion, temperatura, presion) tratando cada sensor como una serie correlacionada dentro del modo multivariante.
- Despliegue ligero en el borde o en CPU: al ser un modelo de 120M de parametros con inferencia en CPU, permite predicciones en entornos sin GPU o en dispositivos con recursos limitados.
- Prediccion por lotes a escala en la nube: con mas de 300 predicciones por segundo en una A10G, es adecuado para pipelines batch sobre grandes catalogos de series usando AutoGluon-Cloud o SageMaker.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos detallados en la informacion disponible. La model card indica que Chronos-2 alcanza precision zero-shot de ultimo nivel (state-of-the-art) entre modelos publicos en fev-bench, GIFT-Eval y Chronos Benchmark II, pero no incluye las cifras concretas (por ejemplo, valores de MASE, WQL o CRPS) ni una tabla comparativa numerica con otros modelos.

Datos de rendimiento de inferencia disponibles:

| Metrica | Valor |
|---|---|
| Predicciones por segundo (A10G) | mas de 300 |
| Soporte de inferencia | GPU y CPU |
| Longitud maxima de contexto | 8192 |
| Longitud maxima de prediccion | 1024 |

## Requisitos de hardware

- Parametros totales: ~120M, por lo que la huella de memoria es reducida (del orden de ~480 MB en FP32 y ~240 MB en FP16 solo para pesos; el repo ocupa 0,5 GB).
- VRAM estimada para inferencia: muy baja; cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y en la mayoria de entornos con pocos GB de VRAM.
- GPU recomendadas: A10G (referencia usada por el autor, mas de 300 predicciones por segundo), y por extension cualquier GPU moderna NVIDIA (T4, L4, A100, H100, RTX serie 30/40). No se han publicado cifras para cada una.
- Inferencia en CPU: soportada de forma nativa, lo que permite desplegar sin GPU.
- Opciones de despliegue: paquete `chronos-forecasting>=2.0` (API Python con pandas), AutoGluon-Cloud (real-time, serverless y batch), y SageMaker JumpStart (`pytorch-forecasting-chronos-2`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que no es un LLM.
- Latencia y throughput: mas de 300 series por segundo en una A10G. La latencia por serie no esta detallada.

## Comparativa con modelos similares

| Modelo | Univariante | Multivariante | Cross-learning | Covariables pasadas | Covariables futuras | Contexto max. | Prediccion max. |
|---|---|---|---|---|---|---|---|
| Chronos-2 | Si | Si | Si | Si | Si (nativo) | 8192 | 1024 |
| Chronos-Bolt | Si | No | No | No | Parcial (via regresores externos) | 2048 | 64 |
| Chronos | Si | No | No | No | Parcial (via regresores externos) | 512 | 64 |

Notas: segun la model card, Chronos y Chronos-Bolt no soportan covariables futuras de forma nativa; pueden combinarse con regresores externos de AutoGluon, pero esto solo modela efectos por paso de tiempo y no efectos a lo largo del tiempo. No se dispone de resultados numericos de benchmarks para una comparacion cuantitativa de precision, ni de datos de otros modelos fundacionales de series temporales en la informacion proporcionada.

## Limitaciones y advertencias

- No se detallan sesgos conocidos del modelo en la informacion disponible; al entrenarse sobre datos reales y sinteticos, puede heredar sesgos presentes en las series de entrenamiento.
- Riesgo de alucinacion no aplicable en el sentido de generacion de texto, pero si existe riesgo de previsiones de baja calidad fuera de la distribucion de los datos de entrenamiento (dominios o frecuencias no vistos).
- La model card no especifica el conjunto de dominios, frecuencias temporales ni la cobertura de covariables, por lo que la generalizacion a casos muy especificos no esta garantizada.
- No hay soporte multilingue ni de texto: es exclusivamente un modelo de series temporales.
- Limite de contexto de 8192 pasos y de prediccion de 1024 pasos; series mas largas requieren truncado o estrategias de ventana.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los datasets de entrenamiento (`autogluon/chronos_datasets`, `Salesforce/GiftEvalPretrain`) si se redistribuye el modelo.
- No se dispone de informacion sobre cuantizaciones oficiales ni sobre requisitos exactos de memoria por cuantizacion.
- Para produccion, el autor recomienda desplegar en Amazon SageMaker (AutoGluon-Cloud o JumpStart); el uso local se orienta a experimentacion y desarrollo.

## Enlaces

- HuggingFace: https://huggingface.co/autogluon/chronos-2
- Technical report (arXiv): https://arxiv.org/abs/2510.15821v1
- Paper Chronos original (arXiv): https://arxiv.org/abs/2403.07815
- GitHub: https://github.com/amazon-science/chronos-forecasting
- Example notebook: https://github.com/amazon-science/chronos-forecasting/blob/main/notebooks/chronos-2-quickstart.ipynb
- Guia de despliegue en SageMaker (notebook): https://github.com/amazon-science/chronos-forecasting/blob/main/notebooks/deploy-chronos-to-amazon-sagemaker.ipynb
- Guia de despliegue con AutoGluon-Cloud: https://auto.gluon.ai/cloud/stable/tutorials/foundation-model-timeseries.html
- Blog de Amazon Science: https://www.amazon.science/blog/introducing-chronos-2-from-univariate-to-universal-forecasting
- Leaderboard fev-bench: https://huggingface.co/spaces/autogluon/fev-leaderboard
- Leaderboard GIFT-Eval: https://huggingface.co/spaces/Salesforce/GIFT-Eval
- Tutorial de covariables con AutoGluon: https://auto.gluon.ai/stable/tutorials/timeseries/forecasting-chronos.html#incorporating-the-covariates
- Dataset de entrenamiento: https://huggingface.co/datasets/autogluon/chronos_datasets
- Dataset de entrenamiento: https://huggingface.co/datasets/Salesforce/GiftEvalPretrain
