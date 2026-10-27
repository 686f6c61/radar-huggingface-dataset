# Boukefalos/t0-alpha-onnx

## Resumen

`Boukefalos/t0-alpha-onnx` es la exportación a ONNX del modelo `theforecastingcompany/t0-alpha`, un modelo fundacional de previsión de series temporales de la familia t0 desarrollada por The Forecasting Company. El repositorio no contiene pesos nuevos ni un entrenamiento propio: es un artefacto de despliegue producido por la herramienta `openstef-checkpoints` para integrar el modelo en OpenSTEF, el stack de previsión de carga eléctrica de código abierto. Su publicación responde a la necesidad de disponer de un checkpoint portable y verificable frente a la implementación de referencia `tfc-t0`, sin dependencia de PyTorch en tiempo de inferencia.

El modelo resuelve previsión zero-shot de series temporales con ventana fija: 512 pasos de contexto a resolución de 15 minutos (unas 128 horas, aproximadamente 5,3 días) y un horizonte de 96 pasos (24 horas, es decir, previsión a día siguiente). Admite covariables futuras conocidas, típicamente meteorología, y devuelve una rejilla nativa de cinco cuantiles (0,1, 0,25, 0,5, 0,75 y 0,9), de modo que el intervalo del 80 % se obtiene directamente de las filas 0,1 y 0,9 sin interpolación.

La relevancia del artefacto es doble: por un lado, permite ejecutar el modelo en ONNX Runtime en entornos donde instalar el stack completo de PyTorch no es viable (subestaciones, edge, contenedores ligeros); por otro, la exportación sustituye las guardas dinámicas del código original por decisiones estáticas decidibles, manteniendo las rutas matemáticas del transformer, del escalador y del rollout. El repositorio ocupa 0,8 GB y se distribuye bajo licencia Apache 2.0, la misma del modelo upstream.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con escalado previo (LocScale) y rollout autorregresivo; detalles internos de capas y dimensión no disponibles |
| Parámetros totales | no disponible (el autor no publica el recuento; el repositorio completo ocupa 0,8 GB en fp32) |
| Parámetros activos | no aplica (modelo denso, no es un MoE) |
| Longitud de contexto | 512 pasos temporales (resolución de 15 minutos; equivale a 128 horas) |
| Horizonte de predicción | 96 pasos (24 horas a resolución de 15 minutos) |
| Tipos de cuantización | no disponible; los checkpoints publicados son únicamente fp32 (`t0-alpha.onnx` y `t0-alpha_static.onnx`) |
| Idiomas soportados | no aplica: modelo de series temporales, no procesa texto |
| Licencia | Apache 2.0 (atribución a los autores upstream) |
| Formato de pesos | ONNX (dos variantes: con y sin formas estáticas) |
| Entradas del grafo | `past_values` (batch, context_length); `future_covariates` (batch, horizon_length, n_covariates) |
| Salida del grafo | `quantile_predictions` (batch, horizon_length, n_quantiles) |
| Niveles de cuantil | 0,1; 0,25; 0,5; 0,75; 0,9 (cinco niveles nativos) |
| Eje dinámico | solo el eje de batch; contexto y horizonte son fijos |
| Herramientas de exportación | onnx 1.19.0, onnxruntime 1.27.0, torch 2.14.1, tfc-t0 0.6.0, openstef-checkpoints @ 1e2712e |
| Fecha de exportación | 2026-10-26T21:07:19+00:00 |
| Tamaño del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

La model card no documenta el proceso de entrenamiento del modelo original: no se indica el volumen de tokens, la composición del dataset, ni si hubo ajuste por RLHF o DPO. Lo que sí se explicita es la arquitectura efectiva del grafo exportado: un transformer que opera sobre la serie escalada mediante estadísticas `LocScale`, con una fase de rollout que genera el horizonte paso a paso. El modelo es zero-shot, es decir, no requiere ajuste específico sobre la serie objetivo para producir una previsión, y consume covariables futuras conocidas en el momento del origen de la predicción.

La innovación técnica relevante de esta ficha no está en el modelo, sino en el contrato de exportación. El código original de t0 protege cada entrada con comprobaciones dinámicas (tipos de fila, anchura de contexto, número de segmentos, formas de `LocScale`, máscaras de atención, niveles de cuantil) que `torch.export` no puede trazar. La herramienta de exportación sustituye cada guarda por la rama que el contrato estático implica; según el autor, no se altera ninguna parte de las matemáticas del modelo y se preservan las rutas de código upstream del transformer, del escalador y del rollout. El resultado se valida numéricamente contra la implementación de referencia `tfc-t0`, con desviaciones máximas del orden de 10⁻⁶.

Un detalle de diseño importante: el grafo reserva un presupuesto fijo de slots de covariables. Si un slot no tiene datos, se rellena con `NaN` tanto en covariables pasadas como futuras y el grafo lo anula antes de ejecutar el modelo, de forma que cualquier número de covariables inferior al presupuesto cabe en la misma exportación.

## Capacidades

- Previsión zero-shot de series temporales univariadas o multivariadas con covariables exógenas futuras, sin entrenamiento específico sobre la serie objetivo.
- Previsión probabilística mediante rejilla nativa de cinco cuantiles, apta para construir intervalos de predicción directamente (el 80 % sale de los cuantiles 0,1 y 0,9).
- Incorporación de meteorología u otras covariables conocidas a futuro dentro de la ventana de previsión.
- Enmascaramiento de covariables ausentes mediante `NaN`, con presupuesto fijo de slots declarado en el grafo.
- Operación con contexto fijo de 512 pasos y horizonte fijo de 96 pasos a resolución de 15 minutos, con batch dinámico.
- Ejecución portable en ONNX Runtime sin dependencia de PyTorch.
- Integración directa con OpenSTEF para pipelines de previsión de carga eléctrica.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No procesa texto, imágenes ni audio; no tiene capacidades multilingües.
- No dispone de modo "thinking" ni de decodificación especulativa.

## Casos de uso

- Previsión de carga a día siguiente en un operador de red de distribución: el modelo consume las medidas de los últimos 512 intervalos de 15 minutos y la meteorología prevista para las próximas 24 horas, y devuelve la curva de carga con cuantiles para dimensionar reservas operativas. Es el escenario para el que se construyó la exportación, al estar integrada en OpenSTEF.
- Balance energético de cartera comercializadora: agregación de previsiones por cliente o por conjunto de contadores para estimar la compra en mercado diario e intradiario, usando los cuantiles 0,1 y 0,9 como banda de riesgo de desvío.
- Previsión de generación renovable distribuida: sustituyendo la serie de carga por la de producción y alimentando `future_covariates` con irradiancia, nubosidad o viento previstos, se obtiene una previsión probabilística de generación a 24 horas.
- Arranque en frío de activos nuevos: al ser zero-shot, permite generar previsiones para instalaciones sin histórico propio, usando como contexto series de activos similares o del agregado de la zona.
- Detección de anomalías y fraude por desviación: comparar la medida real con la banda de cuantiles generada por el modelo permite marcar desviaciones sostenidas fuera del intervalo del 80 % como candidatas a inspección.
- Dimensionamiento y despacho de almacenamiento: la previsión horaria con cuantiles permite calcular la potencia y energía de baterías necesarias para cubrir picos con un nivel de confianza dado.
- Despliegue en edge o en subestación: al ejecutarse sobre ONNX Runtime en CPU, el checkpoint cabe en entornos con recursos limitados donde no se puede instalar el stack completo de PyTorch.
- Validación de pipelines de forecasting en CI: la variante con formas estáticas (`t0-alpha_static.onnx`) permite comparar la salida exportada contra `tfc-t0` en tests de regresión numérica con tolerancias del orden de 10⁻⁶.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (MAE, RMSE, MASE, CRPS u otras métricas de previsión) en la información disponible. El único dato de rendimiento publicado es la paridad numérica del export frente a la implementación de referencia en PyTorch:

| Variante | Precisión | Formas estáticas | Desviación máxima vs torch |
|---|---|---|---|
| `t0-alpha_static.onnx` | fp32 | sí | 4,172e-06 |
| `t0-alpha.onnx` | fp32 | no | 1,311e-06 |

No se han publicado datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada: el repositorio completo ocupa 0,8 GB en fp32, repartido entre dos variantes del mismo grafo; el peso en memoria de una sola variante está por debajo de 1 GB. El consumo real depende del tamaño de batch y del número de covariables activas. No hay medición publicada.
- GPU recomendadas: no se requiere GPU. Cualquier GPU moderna sirve para acelerar el grafo; no hay indicios de que el modelo necesite A100, H100 ni memorias de 40/80 GB.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo reciente e incluso en iGPU o en CPU para lotes pequeños.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), OpenSTEF, Triton Inference Server con backend ONNX, y compilación a TensorRT u OpenVINO a partir del grafo ONNX. vLLM, llama.cpp y TGI no aplican, ya que son servidores para modelos de lenguaje.
- Latencia y throughput estimados: no disponibles.
- Nota operativa: la model card declara `inference: false` a nivel de metadatos, por lo que no hay widget de inferencia en HuggingFace; la ejecución debe hacerse con ONNX Runtime u otro runtime compatible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Horizonte | Cuantiles | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Boukefalos/t0-alpha-onnx` (este) | no disponible | 512 pasos (15 min) | 96 pasos | 5 | Apache 2.0 | ONNX, repo de 0,8 GB |
| `theforecastingcompany/t0-alpha` (upstream) | no disponible | 512 pasos | 96 pasos | 5 | Apache 2.0 | Pesos originales en PyTorch |
| Versiones posteriores de t0 | no disponible | no disponible | no disponible | 21 | no disponible | no disponible en la información proporcionada |
| Chronos, TimesFM, Moirai y otras familias de TSFM | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con otras familias de modelos fundacionales de series temporales (Chronos de Amazon, TimesFM de Google, Moirai de Salesforce) no puede cuantificarse con la información disponible: no se han proporcionado especificaciones ni resultados de benchmarks de esos modelos. La única comparación verificable es contra el propio upstream, del que este repositorio difiere únicamente en el formato (ONNX frente a PyTorch) y en la eliminación de las guardas dinámicas.

## Limitaciones y advertencias

- Ventana rígida: contexto de 512 pasos y horizonte de 96 pasos fijos a resolución de 15 minutos. No se puede consultar con ventanas distintas sin reexportar el grafo o remuestrear la serie, lo que introduce errores.
- Rejilla de cuantiles limitada: solo cinco niveles en t0-alpha, frente a los 21 de versiones posteriores de t0. Para colas extremas (por ejemplo, 0,99) no hay salida nativa.
- Riesgo de fuga de información: las covariables deben ser point-in-time, es decir, los valores que existían en el origen de la predicción. Pasar valores observados a posteriori produce previsiones artificialmente buenas y errores silenciosos en producción.
- Presupuesto fijo de covariables: los slots no usados deben rellenarse con `NaN`; un llenado incorrecto puede alterar la salida sin generar un error explícito.
- Exportación estática sin guardas: al sustituir las comprobaciones dinámicas por ramas estáticas, el grafo no valida las entradas en tiempo de ejecución. Una entrada fuera del contrato puede devolver resultados incorrectos en lugar de fallar.
- Sin métricas de precisión publicadas: no hay evidencia en la información disponible sobre el rendimiento del modelo en dominios concretos, por lo que se recomienda validarlo contra un baseline propio antes de usarlo en producción.
- Modelo zero-shot: no está ajustado al dominio del usuario; en series con patrones muy específicos puede quedar por debajo de un modelo especializado entrenado con histórico local.
- Sin soporte de texto ni multimodal: no es un modelo de lenguaje y no puede usarse para tareas de NLP, tool calling ni agentes.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige conservar la atribución y los avisos de licencia; los derechos sobre los pesos originales permanecen en los autores upstream.
- Revisión upstream desconocida: la procedencia declara la fuente como `theforecastingcompany/t0-alpha` con revisión `unknown`, por lo que no se puede garantizar la trazabilidad exacta al commit del modelo base.
- Popularidad nula en el momento de la ficha: 0 descargas y 0 likes, sin validación de la comunidad ni informes independientes de uso.

## Enlaces

- [Boukefalos/t0-alpha-onnx en HuggingFace](https://huggingface.co/Boukefalos/t0-alpha-onnx)
- [Modelo base: theforecastingcompany/t0-alpha](https://huggingface.co/theforecastingcompany/t0-alpha)
- [Colección t0-alpha model family](https://huggingface.co/collections/theforecastingcompany/t0-alpha-model-family)
- [Colección t0 model family](https://huggingface.co/collections/theforecastingcompany/t0-model-family)
- [Repositorio OpenSTEF](https://github.com/OpenSTEF/openstef)
- [Repositorio openstef-checkpoints](https://github.com/OpenSTEF/openstef-checkpoints)
- [ONNX Model Zoo](https://github.com/onnx/models)
- [Modelos en ONNX Runtime](https://onnxruntime.ai/models)
