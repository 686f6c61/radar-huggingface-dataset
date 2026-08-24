# oxfrug/chronos-2-int8-torchao

## Resumen

`chronos-2-int8-torchao` es una cuantización *weight-only* en INT8 del modelo de previsión de series temporales `amazon/chronos-2`, realizada con la librería `torchao` de PyTorch. El autor, `oxfrug`, publica esta versión como un checkpoint *drop-in* para la librería `chronos-forecasting`, que se carga con `Chronos2Pipeline.from_pretrained`, a diferencia de otras cuantizaciones existentes en el Hub (ONNX, GGUF, TensorRT) que no son compatibles con esa API.

Chronos-2 es un modelo basado en un encoder T5 de 120 millones de parámetros, entrenado para tokenizar series temporales y predecir valores futuros mediante regresión por clasificación. La cuantización reduce el peso en disco de 477,9 MB (FP32) a 131,2 MB, manteniendo un rendimiento prácticamente idéntico al del modelo original: en una evaluación sobre un conjunto de precios de electricidad, el MASE es de 1,7018 frente a 1,7064 del FP32, y la correlación entre ambas salidas es de 1,0000.

La relevancia de este modelo reside en que ofrece una alternativa ligera y de código abierto (licencia Apache-2.0) para despliegues de previsión de series temporales en entornos con restricciones de memoria, sin necesidad de adaptar el pipeline de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder T5 (transformador) |
| Parametros totales | 119.726.496 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 *weight-only* (torchao `Int8WeightOnlyConfig`, por canal) |
| Idiomas soportados | no aplica (modelo de series temporales, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo base `amazon/chronos-2` es un encoder T5 de 120 millones de parámetros que tokeniza valores de series temporales en un vocabulario discreto y realiza regresión mediante clasificación, sin ninguna característica específica de series temporales en el diseño. Según el artículo de Chronos-2, el modelo soporta previsión univariada y multivariada, así como variables exógenas (covariables).

La cuantización aplicada en esta variante es *weight-only* INT8 con `torchao`, que convierte los pesos de las capas `nn.Linear` a enteros de 8 bits por canal, dejando las activaciones en FP32. No se utilizó conjunto de calibración ni entrenamiento con cuantización (QAT). El *quantile head* (`output_patch_embedding`) y las capas lineales con menos de 4096 pesos se mantienen en FP32 para preservar la precisión de las predicciones probabilísticas.

## Capacidades
- Previsión de series temporales univariadas y multivariadas (según Chronos-2).
- Generación de predicciones probabilísticas mediante cuantiles.
- Manejo de covariables exógenas (según el paper de Chronos-2).
- Inferencia sin entrenamiento adicional (*inference-only*).
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, ni agentes, ni código, ni visión.

## Casos de uso
- **Previsión de demanda eléctrica**: el modelo puede predecir el consumo o el precio de la electricidad para horizontes de hasta 24 horas, como se muestra en la evaluación del README, donde se usa el conjunto `electricity_price` de AutoGluon.
- **Previsión de ventas en retail**: para anticipar la demanda de productos y optimizar inventarios, usando series históricas de ventas como contexto.
- **Previsión de precios de materias primas**: aplicable a mercados energéticos o de commodities, donde se necesita predecir el precio futuro a corto plazo.
- **Monitorización de métricas de sistemas**: para predecir el uso de CPU, memoria o tráfico de red y planificar la escalabilidad de infraestructuras.
- **Previsión de stock en almacenes**: para planificar la reposición de productos con demanda estacional, usando series de consumo diario o semanal.
- **Previsión meteorológica simplificada**: para predecir temperatura, humedad o velocidad del viento en aplicaciones de agricultura o logística, con series temporales de estaciones locales.

## Benchmarks y rendimiento
El README incluye una evaluación honesta y pequeña, no oficial (no es GIFT-Eval). Se utilizó el conjunto `electricity_price` de AutoGluon, con las últimas 24 horas de cada serie como conjunto de prueba y el resto como contexto. El pronóstico puntual es la mediana de los cuantiles. El MASE se calcula con un *seasonal naive* de periodo 24.

| Métrica | seasonal-naive-24 | Chronos-2 FP32 | **chronos-2-int8-torchao** |
|---|---|---|---|
| MASE macro | 2,8719 | 1,7064 | **1,7018** |
| MAE macro | — | 14,5010 | **14,4617** |

- Diferencia de MASE entre INT8 y FP32: -0,27 % (mejor en INT8).
- Error absoluto medio entre previsiones INT8 y FP32: 0,0490.
- Correlación media entre previsiones INT8 y FP32: 1,0000.
- Evaluación realizada sobre 1 serie, horizonte 24, tiempo de evaluación 0,3 s.

No se han publicado resultados de benchmarks oficiales (GIFT-Eval) en la información disponible.

## Requisitos de hardware
- **VRAM estimada**: menos de 1 GB (el modelo tiene 120 millones de parámetros, con pesos INT8 en disco de 131,2 MB).
- **GPU recomendadas**: cualquier GPU con soporte CUDA (p. ej., RTX 3060 o superior). También puede ejecutarse en CPU.
- **Compatibilidad con GPU de consumo**: sí, cabe en cualquier GPU consumer con 2 GB o más de VRAM.
- **Opciones de despliegue**: mediante `Chronos2Pipeline.from_pretrained` con `chronos-forecasting>=2.0`, `torchao`, `safetensors` y PyTorch. El README indica que es necesario usar el script `load.py` del repositorio para cargar correctamente los pesos cuantizados. No se menciona compatibilidad con vLLM, TGI o llama.cpp.
- **Latencia y rendimiento**: no disponible en la información proporcionada. La evaluación del README reporta un tiempo de 0,3 s para una serie con horizonte 24.

## Comparativa con modelos similares
| Modelo | Parametros | Cuantizacion | Peso en disco | Rendimiento (MASE) | Licencia |
|---|---|---|---|---|---|
| `oxfrug/chronos-2-int8-torchao` | 120 M | INT8 *weight-only* | 131,2 MB | 1,7018 | Apache-2.0 |
| `amazon/chronos-2` (FP32) | 120 M | Ninguna | 477,9 MB | 1,7064 | Apache-2.0 |
| `OpenSTEF/chronos-2-onnx` | 120 M | INT8 (ONNX) | no disponible | no disponible | Apache-2.0 |

La variante INT8 ofrece una reducción del 72 % en peso en disco y un rendimiento ligeramente superior al FP32 en la prueba de referencia. La variante ONNX es otra opción de cuantización, pero no es compatible con `chronos-forecasting` de forma directa.

## Limitaciones y advertencias
- **Solo cuantización de pesos**: no se cuantizan activaciones; no es TensorRT ni una solución optimizada para baja latencia extrema.
- **Evaluación limitada**: la prueba del README usa un único conjunto de datos (precios de electricidad) y un horizonte de 24 horas. No es un resultado comparable a GIFT-Eval ni generalizable a otros dominios.
- **Calibración de cuantiles no verificada**: no se ha medido la cobertura de los intervalos de confianza. Si se necesitan intervalos fiables, se recomienda comparar con el modelo FP32 en las series propias.
- **No es un sustituto de un fine-tuning**: la cuantización no añade conocimiento ni ajusta el modelo a dominios específicos.
- **Riesgo de alucinación**: no aplica, ya que no genera texto, pero sí puede producir previsiones poco plausibles en series con cambios de régimen o estacionalidad no capturada.
- **Restricciones de uso**: la licencia Apache-2.0 permite uso comercial, pero se debe citar a Ansari et al. 2025 si se utiliza Chronos-2 como base.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/oxfrug/chronos-2-int8-torchao
- Modelo base: https://huggingface.co/amazon/chronos-2
- Paper de Chronos (v1): https://arxiv.org/abs/2403.07815
- Paper de Chronos-2: https://arxiv.org/abs/2510.15821
- Repositorio de TorchAO: https://github.com/pytorch/ao
- Variante ONNX de Chronos-2: https://huggingface.co/OpenSTEF/chronos-2-onnx</think>## Resumen

`chronos-2-int8-torchao` es una cuantizacion *weight-only* en INT8 del modelo de prevision de series temporales `amazon/chronos-2`, desarrollada por el usuario `oxfrug`. El modelo base, Chronos-2, es un encoder T5 de 120 millones de parametros disenado para predecir series temporales mediante la tokenizacion de valores numericos y su procesamiento como si fueran tokens de lenguaje. Esta variante cuantizada reduce el peso en disco de 477,9 MB (FP32) a 131,2 MB, manteniendo la misma arquitectura y compatibilidad con la libreria `chronos-forecasting`, lo que la convierte en una opcion ligera para despliegues con restricciones de memoria.

La relevancia de este modelo radica en que ofrece una cuantizacion INT8 lista para usar con `Chronos2Pipeline`, a diferencia de otras variantes (ONNX, GGUF, TensorRT) que no son compatibles directamente con la libreria. La licencia Apache-2.0 permite uso comercial sin restricciones. La cuantizacion no requiere calibracion ni QAT, y las activaciones se mantienen en FP32, preservando la precision del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder T5 (transformador) |
| Parametros totales | 119.726.496 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 *weight-only* (torchao, per-channel) |
| Idiomas soportados | no disponible (modelo de series temporales) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Chronos-2 se basa en un encoder T5 que tokeniza valores de series temporales en un vocabulario discreto y realiza regresion mediante clasificacion, sin incorporar caracteristicas especificas de series temporales. El modelo base fue preentrenado con un gran corpus de datos temporales y soporta tanto prevision univariada como multivariada, incluyendo covariables exogenas. La cuantizacion INT8 aplicada por `oxfrug` convierte los pesos de las capas `nn.Linear` a enteros de 8 bits usando `torchao` (`Int8WeightOnlyConfig`), dejando las activaciones en FP32. No se realizo calibracion ni entrenamiento con cuantizacion (QAT). Las capas del *quantile head* y las lineales con menos de 4096 pesos se mantienen en FP32 para preservar la precision de las predicciones.

## Capacidades

- Prevision de series temporales univariadas y multivariadas.
- Generacion de predicciones probabilisticas mediante cuantiles.
- Soporte de covariables exogenas (segun el paper de Chronos-2).
- Inferencia directa sin entrenamiento adicional (*inference-only*).
- No soporta tool calling, agentes, generacion de codigo ni vision.

## Casos de uso

- **Prevision de demanda electrica**: el modelo puede predecir el consumo o el precio de la energia para horizontes de hasta 24 horas, como se muestra en la evaluacion del README, donde se usa un conjunto de datos de precios de electricidad.
- **Prevision de ventas en retail**: para estimar la demanda de productos y optimizar inventarios, usando historicos de ventas como contexto.
- **Prevision de trafico en redes**: para predecir el uso de ancho de banda o la carga de servidores y anticipar escalados en infraestructura.
- **Prevision de precios financieros**: para estimar el comportamiento de acciones o materias primas en horizontes cortos, integrable en sistemas de alerta.
- **Monitorizacion de sistemas**: para predecir metricas de rendimiento (CPU, memoria, latencia) y activar respuestas automaticas antes de que ocurran fallos.
- **Prevision de stock en almacenes**: para planificar reposicion de inventario en funcion de la demanda esperada, reduciendo costes de almacenamiento.

## Benchmarks y rendimiento

El README incluye una evaluacion pequena y honesta (no es GIFT-Eval) sobre el conjunto `electricity_price` de AutoGluon, con un horizonte de 24 horas y MASE comparado con un *seasonal naive* de periodo 24.

| Metrica | Seasonal-naive | Chronos-2 FP32 | **chronos-2-int8-torchao** |
|---|---|---|---|
| MASE macro | 2,8719 | 1,7064 | **1,7018** |
| MAE macro | — | 14,5010 | **14,4617** |

- Diferencia de MASE entre INT8 y FP32: -0,27 % (mejor en INT8).
- Error absoluto medio entre previsiones INT8 y FP32: 0,0490.
- Correlacion media entre previsiones INT8 y FP32: 1,0000.
- Evaluacion: 1 serie, horizonte 24, tiempo de evaluacion 0,3 s.

No se han publicado resultados de benchmarks oficiales en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: menos de 1 GB para inferencia (modelo de 120 M de parametros, pesos en disco de 131,2 MB).
- **GPU recomendadas**: cualquier GPU con soporte CUDA, incluyendo tarjetas de consumo como RTX 3060 o superiores.
- **Compatibilidad con GPU de consumo**: si, cabe en cualquier GPU con 2 GB o mas de VRAM.
- **Opciones de despliegue**: requiere `chronos-forecasting>=2.0`, `torchao`, `safetensors` y PyTorch. Se usa `Chronos2Pipeline.from_pretrained` o el script `load.py` incluido en el repositorio. No se menciona compatibilidad con vLLM, TGI o llama.cpp.
- **Latencia y throughput**: no se proporcionan datos especificos, aunque la evaluacion del README reporta 0,3 s para una serie con horizonte de 24.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Peso en disco | MASE | Licencia |
|---|---|---|---|---|---|
| `oxfrug/chronos-2-int8-torchao` | 120 M | INT8 *weight-only* | 131,2 MB | 1,7018 | Apache-2.0 |
| `amazon/chronos-2` (FP32) | 120 M | Ninguna | 477,9 MB | 1,7064 | Apache-2.0 |
| `OpenSTEF/chronos-2-onnx` | 120 M | INT8 (ONNX) | no disponible | no disponible | Apache-2.0 |

La variante INT8 ofrece una reduccion del 72 % en peso de disco con una precision practicamente identica al FP32. La variante ONNX es otra alternativa de cuantizacion, pero no es compatible con `chronos-forecasting` de forma directa.

## Limitaciones y advertencias

- **Cuantizacion de pesos unicamente**: no se cuantizan activaciones, lo que limita la optimizacion frente a otras tecnicas como TensorRT.
- **Evaluacion limitada**: la prueba del README usa un solo conjunto de datos (precios de electricidad) y un horizonte de 24 horas; no es comparable a GIFT-Eval ni generalizable a otros dominios.
- **Calibracion de cuantiles no medida**: no se ha verificado la cobertura de los intervalos de confianza. Si se necesitan intervalos fiables, se debe comparar la cobertura con el modelo FP32 en las series propias.
- **No es un sustituto del fine-tuning**: la cuantizacion no anade conocimiento nuevo y no mejora la precision en dominios especificos.
- **Riesgo de predicciones poco plausibles**: en series con cambios de regimen o estacionalidad extrana, el modelo puede generar previsiones irrealistas, como cualquier modelo estadistico.
- **Licencia**: Apache-2.0 permite uso comercial, pero se debe citar a Ansari et al. 2025 si se usa Chronos-2 como base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oxfrug/chronos-2-int8-torchao
- Modelo base: https://huggingface.co/amazon/chronos-2
- Paper de Chronos (v1): https://arxiv.org/abs/2403.07815
- Paper de Chronos-2: https://arxiv.org/abs/2510.15821
- Repositorio de TorchAO: https://github.com/pytorch/ao
- Variante ONNX de Chronos-2: https://huggingface.co/OpenSTEF/chronos-2-onnx
