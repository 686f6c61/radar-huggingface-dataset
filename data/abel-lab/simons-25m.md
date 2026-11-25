# abel-lab/Simons-25M

## Resumen

Simons-25M es un modelo fundacional de series temporales desarrollado por Abel AI Lab, disenado especificamente para pronostico probabilistico. Con 25,1 millones de parametros, es la variante mas pequena de la familia Simons 1, que incluye cuatro tamanos. El modelo aborda el problema del forecasting de series temporales univariantes y multivariantes, incluyendo el uso de covariables conocidas en el futuro, lo que lo hace adecuado para escenarios donde se dispone de informacion exogena planificada (por ejemplo, festivos, promociones o variables meteorologicas previstas).

La arquitectura combina un transformer causal que opera sobre parches de 32 pasos temporales con una capa de atencion entre las variables de una serie, permitiendo modelar dependencias cruzadas entre series multivariantes. Soporta hasta 16.384 pasos de historial y genera 9 cuantiles (0,1 a 0,9) como salida, lo que proporciona una distribucion predictiva completa en lugar de una unica estimacion puntual.

Su relevancia actual radica en que se distribuye como modelo abierto con licencia OpenMDW-1.1, incluye codigo de inferencia y entrenamiento en GitHub, y publica los datos de preentrenamiento. Ademas, su eficiencia computacional declarada (hasta diez veces mas rapido que modelos de tamano similar en una A100) lo posiciona como una opcion practica para despliegues en produccion con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal sobre parches de 32 pasos + atencion entre variables; 12 capas, ancho 384, 6 cabezas |
| Parametros totales | 25.121.568 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 16.384 pasos temporales de historial; 512 pasos por forward pass, horizontes mayores por bloques |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de series temporales, no de texto) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea un transformer causal que tokeniza la serie temporal en parches de 32 pasos, reduciendo la longitud efectiva de la secuencia y permitiendo manejar contextos largos de hasta 16.384 pasos. Tras el procesamiento temporal, una capa de atencion entre variables captura dependencias cruzadas en series multivariantes (hasta 32 variables). La entrada admite hasta 16 covariables conocidas en el futuro, numericas o categoricas, y utiliza NaN para marcar valores ausentes. Las covariables solo pasadas se aceptan pero se descartan.

El entrenamiento se estructura en cuatro etapas: desde un preentrenamiento sintetico hasta un post-entrenamiento sobre datos reales. Los pesos publicados son el promedio uniforme de dos continuaciones del entrenamiento (model soups), una tecnica de ensamblado que mejora la robustez sin incrementar el coste de inferencia. El conjunto de datos de preentrenamiento, abel-lab/Simons-Pretrain, es publico. No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO (no aplicables directamente a forecasting).

## Capacidades

- Pronostico probabilistico de series temporales: genera 9 cuantiles (0,1 a 0,9) por paso temporal, proporcionando una distribucion predictiva completa.
- Series univariantes y multivariantes: soporta hasta 32 variables por serie con modelado de dependencias cruzadas mediante atencion entre variates.
- Covariables conocidas en el futuro: hasta 16 covariables numericas o categoricas, utiles para incorporar informacion exogena planificada.
- Manejo de valores ausentes: el uso de NaN permite al modelo procesar series con datos faltantes sin imputacion explicita.
- Contexto largo: hasta 16.384 pasos de historial, adecuado para series con estacionalidades largas o dependencias de largo plazo.
- Horizontes extensibles: 512 pasos por forward pass, con generacion por bloques para horizontes mayores.
- Inferencia en CPU y GPU mediante PyTorch con el paquete `simons` (version 0.1.0 o superior).
- Fine-tuning: el repositorio de GitHub incluye codigo de entrenamiento y documentacion para ajuste fino.

## Casos de uso

- Planificacion de demanda retail: el modelo puede pronosticar ventas por producto o tienda incorporando covariables futuras como promociones planificadas, festivos o precios, generando intervalos de confianza para gestion de inventario.
- Gestion energetica: pronostico de consumo electrico o generacion renovable con covariables meteorologicas previstas, usando la salida cuantilica para dimensionar reservas y reducir costes de desbalance.
- Monitorizacion de infraestructuras: prediccion de metricas de rendimiento (latencia, throughput, uso de CPU) en sistemas distribuidos, con contexto largo para capturar patrones estacionales semanales o mensuales.
- Forecasting financiero operativo: proyeccion de flujos de caja, volumen de transacciones o metricas de riesgo a corto plazo, aprovechando el modelado multivariante para capturar correlaciones entre indicadores.
- Planificacion de capacidad en cloud: prediccion de demanda de recursos con covariables como calendario de despliegues o campanas de marketing, permitiendo escalado proactivo.
- Investigacion en series temporales: el modelo sirve como baseline reproducible y ajustable gracias a la publicacion de datos de preentrenamiento, codigo de entrenamiento y pesos abiertos, facilitando experimentos de comparacion y fine-tuning en dominios especificos.
- Pronostico en sanidad: prediccion de ocupacion hospitalaria o demanda de servicios con covariables como estacionalidad gripal o calendario de vacunacion, usando los cuantiles para planificacion de recursos con margenes de seguridad.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Metrica | Valor | Fuente |
|---|---|---|---|
| GIFT-Eval | MASE (relativo a Seasonal Naive) | 0,686 | GIFT-Eval leaderboard |
| GIFT-Eval | CRPS (relativo a Seasonal Naive) | 0,4683 | GIFT-Eval leaderboard |
| fev-bench | SQL skill score (%, relativo a Seasonal Naive) | 47,74 | fev-bench leaderboard |
| fev-bench | MASE skill score (%, relativo a Seasonal Naive) | 36,27 | fev-bench leaderboard |
| TIME | MASE (relativo a Seasonal Naive) | 0,6473 | TIME leaderboard |
| TIME | CRPS (relativo a Seasonal Naive) | 0,5426 | TIME leaderboard |

El autor indica que Simons-297M, la variante mayor de la familia, ocupa posiciones destacadas en estos leaderboards entre las entradas de pesos abiertos. No se proporcionan resultados especificos de Simons-25M frente a modelos comparables en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 25,1M de parametros, el modelo en precision completa (fp32) ocupa aproximadamente 100 MB; en fp16, unos 50 MB. La VRAM adicional depende del tamano del batch y de la longitud de contexto (hasta 16.384 pasos).
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo cabe holgadamente en GPUs de consumo como RTX 3060, RTX 4060 o superiores. Para lotes grandes o contextos maximos, se recomienda RTX 4090, A100 o H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con al menos 2-4 GB de VRAM libre, dependiendo del batch y contexto.
- Opciones de despliegue: PyTorch en CPU o GPU mediante el paquete `simons` (instalable desde GitHub). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje.
- Latencia y throughput: el autor declara que Simons-297M pronostica un benchmark completo en minutos en una A100, aproximadamente diez veces mas rapido que modelos de tamano similar. Para Simons-25M no se proporcionan cifras especificas de latencia o throughput en la informacion disponible.

## Comparativa con modelos similares

No se dispone de datos especificos de modelos comparables de 25M de parametros para forecasting en la informacion proporcionada. El autor menciona que Simons-297M se compara con "cuatro modelos ampliamente utilizados" en los leaderboards de GIFT-Eval, fev-bench y TIME, pero no se detallan sus nombres ni resultados en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Simons-25M | 25,1M | 16.384 pasos | OpenMDW-1.1 | Hugging Face, GitHub |
| Alternativas de tamano similar | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible; como modelo entrenado sobre datos publicos, puede heredar sesgos de representacion de los dominios cubiertos en Simons-Pretrain.
- Riesgo de alucinacion: en el contexto de series temporales, el equivalente seria la generacion de pronosticos poco realistas en regimenes no vistos durante el entrenamiento; no se cuantifica este riesgo en la documentacion.
- Limitaciones de contexto: aunque soporta hasta 16.384 pasos, la inferencia se realiza en bloques de 512 pasos, lo que puede introducir discontinuidades en horizontes muy largos.
- Limitaciones de idioma: no aplica, al no ser un modelo de lenguaje; las covariables categoricas pueden requerir codificacion adecuada segun el dominio.
- Restricciones de licencia: la licencia OpenMDW-1.1 permite uso comercial, pero se recomienda revisar sus terminos completos para obligaciones de atribucion o redistribucion.
- Caveats para produccion: los benchmarks son declarados por el autor y no han sido verificados de forma independiente; la libreria `simons` esta en version 0.1.0 o superior, lo que sugiere madurez temprana y posible inestabilidad de API.
- No se especifican tecnicas de cuantizacion soportadas, lo que limita opciones de optimizacion en despliegues con restricciones de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abel-lab/Simons-25M
- Repositorio GitHub: https://github.com/Abel-ai-lab/Simons
- Dataset de preentrenamiento: https://huggingface.co/datasets/abel-lab/Simons-Pretrain
- Coleccion Simons 1: https://huggingface.co/collections/abel-lab/simons-1-6ae3d4ce9705938e293c52dd
- Demo Simons Forecast Explorer: https://huggingface.co/spaces/abel-lab/simons-forecast-explorer
- Documentacion de inicio: https://github.com/Abel-ai-lab/Simons/blob/main/docs/GETTING_STARTED.md
- Documentacion del modelo: https://github.com/Abel-ai-lab/Simons/blob/main/docs/MODEL.md
- Leaderboard GIFT-Eval: https://huggingface.co/spaces/Salesforce/GIFT-Eval
- Leaderboard fev-bench: https://huggingface.co/spaces/autogluon/fev-bench
- Leaderboard TIME: https://huggingface.co/spaces/Real-TSF/TIME-leaderboard
