# abel-lab/Simons-297M

## Resumen

Simons-297M es un modelo fundacional de series temporales desarrollado por Abel AI Lab, orientado a la previsión probabilística tanto de series univariantes como multivariantes con covariables conocidas en el futuro. Con 297,2 millones de parámetros, se posiciona como una alternativa de tamano medio dentro de la familia de modelos fundacionales para forecasting, un segmento dominado por propuestas de mayor tamano y con requisitos de computo mas elevados.

La arquitectura combina un transformer causal que opera sobre parches de 32 pasos temporales con una capa de atencion entre las distintas variables de una serie, lo que permite modelar dependencias cruzadas entre variates. Admite hasta 32.768 pasos de historial como contexto y genera 9 cuantiles (del 0,1 al 0,9) por paso, lo que lo hace util para escenarios donde se necesita una distribucion predictiva completa y no solo un punto.

Su relevancia actual radica en que ofrece resultados competitivos en los leaderboards de referencia del sector (GIFT-Eval, fev-bench y TIME) con un modelo de menos de 300M de parámetros, distribucion abierta bajo licencia OpenMDW-1.1 y una libreria propia (`simons`) con integraciones en GluonTS y TimeCopilot. Esto lo convierte en una opcion practica para entornos de produccion con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal sobre parches de 32 pasos + atencion entre variates; 13 capas, anchura 1280, 20 cabezas |
| Parametros totales | 297.230.368 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 32.768 pasos temporales de historial; 512 pasos por forward pass, horizontes mayores por bloques |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de series temporales, no linguistico) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Simons-297M es un transformer causal que tokeniza la serie temporal en parches de 32 pasos y aplica atencion sobre esos parches a lo largo del eje temporal. Sobre esa representacion se anade una capa de atencion entre las variables de una misma serie, lo que permite capturar dependencias multivariantes. El modelo tiene 13 capas, anchura de 1280 y 20 cabezas de atencion. Acepta hasta 32 variates y hasta 16 covariables conocidas en el futuro por serie, tanto numericas como categoricas; los valores faltantes se marcan con NaN y las covariables solo pasadas se aceptan pero se descartan. La salida son 9 cuantiles (0,1 a 0,9).

El entrenamiento se estructura en cuatro etapas, desde un preentrenamiento sintetico hasta un post-entrenamiento sobre datos reales. Los pesos publicados son el promedio de pesos iguales entre el modelo de la etapa 3 y su continuacion, aplicando la tecnica WiSE-FT (weight-space ensembling fine-tuning). El conocimiento del modelo esta limitado por los datos reales de entrenamiento, que terminan en octubre de 2026, aunque la mayoria de los conjuntos de datos finalizan antes (el desglose por dominio esta disponible en el repositorio del dataset de preentrenamiento). La inferencia se realiza en PyTorch sobre CPU o GPU mediante el paquete `simons` (version 0.1.0 o superior).

## Capacidades

- Prevision probabilistica de series temporales: genera 9 cuantiles por paso, lo que permite construir intervalos de prediccion y distribuciones predictivas completas.
- Forecasting univariante y multivariante: soporta hasta 32 variates por serie con modelado de dependencias cruzadas mediante atencion entre variables.
- Covariables conocidas en el futuro: acepta hasta 16 covariables numericas o categoricas por serie, lo que habilita escenarios con calendarios, promociones o variables exogenas planificadas.
- Manejo de valores faltantes: el uso de NaN como marcador permite entrenar e inferir con series incompletas sin imputacion previa explicita.
- Contexto largo: hasta 32.768 pasos de historial, adecuado para series con estacionalidades largas o dependencias de largo plazo.
- Horizontes largos por bloques: la generacion en bloques de 512 pasos permite extender la prediccion mas alla de un unico forward pass.
- Integraciones de ecosistema: disponible como `SimonsPredictor` en GluonTS y como `FoundationForecast` en TimeCopilot.
- Tool calling / function calling: no disponible (no es un modelo linguistico).
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica.

## Casos de uso

- Prevision de demanda en retail: el modelo puede usar covariables conocidas en el futuro (promociones planificadas, festivos, precios) para generar cuantiles de demanda por producto y tienda, lo que permite dimensionar stock con niveles de servicio explicitos en lugar de usar solo la media.
- Planificacion energetica: con series horarias de consumo y covariables como temperatura prevista o calendario laboral, Simons-297M puede producir intervalos de carga a varios dias vista, utiles para programar reservas de capacidad y gestionar picos.
- Gestion de inventario en cadena de suministro: la ventana de 32.768 pasos permite capturar estacionalidades anuales e interanuales en series diarias, lo que mejora la planificacion de compras con horizontes de varias semanas.
- Monitorizacion y alerta temprana en operaciones: al generar cuantiles, se pueden definir umbrales de anomalia sobre la cola superior o inferior de la prediccion (por ejemplo, el cuantil 0,9) para detectar desviaciones en metricas de infraestructura o trafico.
- Prevision financiera de series agregadas: para series de ventas, transacciones o flujos con patrones semanales y mensuales, el modelo puede servir como baseline probabilistico en pipelines de analitica, sustituyendo metodos clasicos como ARIMA o Exponential Smoothing.
- Integracion en plataformas de MLOps de forecasting: gracias a los predictores para GluonTS y TimeCopilot, se puede incorporar como un modelo mas dentro de pipelines existentes de entrenamiento, validacion y despliegue, comparandolo con alternativas estadisticas o de machine learning.
- Investigacion en modelos fundacionales de series temporales: el modelo es util como referencia reproducible en experimentos de zero-shot y few-shot forecasting sobre los benchmarks publicos, dado su tamano contenido y su licencia abierta.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor | Fuente |
|---|---|---|---|
| GIFT-Eval | MASE (relativo a Seasonal Naive) | 0,6731 | Leaderboard GIFT-Eval |
| GIFT-Eval | CRPS (relativo a Seasonal Naive) | 0,4574 | Leaderboard GIFT-Eval |
| fev-bench | SQL skill score (%, relativo a Seasonal Naive) | 48,41 | Leaderboard fev-bench |
| fev-bench | MASE skill score (%, relativo a Seasonal Naive) | 37,85 | Leaderboard fev-bench |
| TIME | MASE (relativo a Seasonal Naive) | 0,6371 | Leaderboard TIME |
| TIME | CRPS (relativo a Seasonal Naive) | 0,5341 | Leaderboard TIME |

En los tres benchmarks, los valores de MASE y CRPS inferiores a 1 indican mejora sobre el baseline Seasonal Naive. En fev-bench, los skill scores expresan la mejora porcentual frente a ese mismo baseline.

## Requisitos de hardware

- VRAM estimada para inferencia: con 297M de parámetros en precision completa (fp32), el modelo ocupa aproximadamente 1,2 GB de pesos; en fp16/bf16, alrededor de 0,6 GB. A ello hay que sumar el coste de activaciones, que depende de la longitud de contexto y del numero de variates.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM deberia ser suficiente para inferencia en fp16 con contextos moderados. Para lotes grandes o contextos cercanos a los 32.768 pasos, se recomienda una GPU con 16-24 GB o superior (A100, H100, RTX 4090, L40S).
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070/4080 y RTX 4090. Tambien puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: el paquete oficial `simons` (PyTorch, CPU o GPU), con integraciones en GluonTS (`SimonsPredictor`) y TimeCopilot (`FoundationForecast`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que estan orientadas a modelos linguisticos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de parametros, contexto, rendimiento o licencia de modelos comparables de la misma categoria, por lo que la comparativa se indica como no disponible. Para contextualizar, Simons-297M se situa en el segmento de modelos fundacionales de series temporales de tamano medio (menos de 300M de parámetros) evaluados en GIFT-Eval, fev-bench y TIME, pero no se aportan cifras de competidores directos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible. Al entrenarse sobre datos reales de dominios concretos, puede heredar sesgos de representacion de esos dominios (por ejemplo, sobrerrepresentacion de ciertos sectores o paises).
- Riesgo de alucinacion: como todo modelo probabilistico, puede generar predicciones con exceso de confianza en regimenes no vistos durante el entrenamiento; los cuantiles no deben interpretarse como garantias.
- Limitaciones de contexto: el contexto maximo es de 32.768 pasos y la generacion se hace en bloques de 512 pasos; horizontes muy largos pueden degradar la calidad por acumulacion de error entre bloques.
- Limite de variates y covariables: maximo 32 variates y 16 covariables conocidas en el futuro por serie; las covariables solo pasadas se descartan, lo que puede perder informacion util si el usuario no las reformula.
- Corte de conocimiento: los datos reales de entrenamiento terminan en octubre de 2026 y muchos conjuntos finalizan antes, por lo que el modelo puede no capturar cambios estructurales posteriores.
- Licencia: OpenMDW-1.1. Es necesario revisar sus terminos antes de un uso comercial en produccion; la informacion proporcionada no detalla restricciones adicionales.
- Verificacion de benchmarks: los resultados de la model card estan marcados como no verificados (`verified: false`); conviene reproducirlos en el entorno propio antes de tomar decisiones de adopcion.
- Idiomas: al no ser un modelo linguistico, no aplica soporte multilingue; la calidad depende del dominio y la frecuencia de muestreo de las series, no del idioma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abel-lab/Simons-297M
- Dataset de preentrenamiento: https://huggingface.co/datasets/abel-lab/Simons-Pretrain
- Estadisticas de corte de conocimiento: https://huggingface.co/datasets/abel-lab/Simons-Pretrain/blob/main/statistics/knowledge_cutoff.csv
- Repositorio GitHub: https://github.com/Abel-ai-lab/Simons
- Paquete PyPI: https://pypi.org/project/simons-forecasting/
- Blog de lanzamiento: https://abel.ai/research/introducing-simons/
- Repositorio base nanoTSFM: https://github.com/Abel-ai-lab/nanoTSFM
- Guia de inicio: https://github.com/Abel-ai-lab/Simons/blob/main/docs/GETTING_STARTED.md
- Leaderboard GIFT-Eval: https://huggingface.co/spaces/Salesforce/GIFT-Eval
- Leaderboard fev-bench: https://huggingface.co/spaces/autogluon/fev-bench
- Leaderboard TIME: https://huggingface.co/spaces/Real-TSF/TIME-leaderboard
- Integracion TimeCopilot: https://github.com/TimeCopilot/foundationforecast
