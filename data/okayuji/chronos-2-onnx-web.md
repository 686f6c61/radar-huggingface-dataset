# okayuji/chronos-2-onnx-web

## Resumen

Chronos-2 ONNX Web es una conversión no oficial del modelo amazon/chronos-2 al formato ONNX, empaquetada por el usuario okayuji para ejecutar previsión de series temporales directamente en el navegador mediante ONNX Runtime Web, con soporte para WebGPU y WASM. El modelo original, desarrollado por Amazon, es un transformer encoder especializado en forecasting que unifica el tratamiento de series univariantes y multivariantes a través de un esquema de parcheado y un token de registro `[REG]`.

La conversión mantiene los pesos sin modificar: no hay fine-tuning ni cuantización, y el fichero `chronos2_fp32.onnx` ocupa 478.426.938 bytes (aproximadamente 478 MB) en precisión FP32. La innovación principal de esta versión es que el grafo ONNX contiene únicamente la red (patch embedding, token `[REG]`, 12 bloques de encoder y la cabeza de cuantiles), delegando el preprocesado y el postprocesado al llamador, lo que permite un control fino sobre escalado, parcheado y codificación temporal.

Es relevante ahora porque elimina la dependencia de Python y de infraestructura de servidor para tareas de forecasting: cualquier aplicación web puede ejecutar inferencia probabilística (21 cuantiles por paso) en el cliente, con el mismo comportamiento numérico que la implementación de referencia en PyTorch (diferencias relativas máximas del orden de 1e-6 a 1e-7). La licencia Apache-2.0 facilita su integración comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con patch embedding, token `[REG]`, 12 bloques de encoder y cabeza de cuantiles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 8.192 pasos (el contexto de 9.000 se recorta a 8.192) |
| Tipos de cuantizacion | no disponible (la conversion es FP32; no se han publicado variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de series temporales, no de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17); el modelo base usa safetensors |
| Tamano del fichero | 478.426.938 bytes (`chronos2_fp32.onnx`) |
| Ejes dinamicos | batch y numero de parches (`n_patches`, `m_patches`) |
| Entradas del grafo | `patches`, `patch_mask`, `future`, `group_ids` |
| Salida del grafo | `quantiles` float32 `[batch, m_patches, 21 × 16]` |
| Libreria de ejecucion | onnxruntime (onnxruntime-web, WebGPU/WASM) |

## Arquitectura y entrenamiento

El grafo ONNX reproduce la red de Chronos-2: patch embedding, token de registro `[REG]`, 12 bloques de encoder y una cabeza que emite 21 cuantiles por cada paso de 16 parches. Cada parche de 16 pasos se codifica como un vector de 48 dimensiones que combina la codificación temporal, los valores escalados y la máscara de observación. La entrada `future` permite incorporar covariables conocidas en el horizonte y covariables solo pasadas, y `group_ids` agrupa filas que deben atenderse mutuamente (una fila objetivo con sus covariables).

El preprocesado se realiza fuera del grafo, replicando el comportamiento de `Chronos2Model._prepare_patched_context`, `_prepare_patched_future` y `forward` de la librería `chronos-forecasting`: estandarización con media y desviación típica de los valores observados (una desviación cero se sustituye por 1e-5), transformación `arcsinh`, relleno frontal con valores faltantes hasta un múltiplo de 16 y codificación temporal de `−C … −1` dividida por 8192. Tras la inferencia se aplica `sinh` y se deshace la estandarización. No se proporciona información sobre el dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO en la información disponible; el modelo base se describe en el paper arXiv:2510.15821.

La conversión se realizó con el exportador TorchScript usando atención eager (la misma matemática que la atención fusionada), moviendo escalado, parcheado, codificación temporal y des-escalado fuera del grafo, y haciendo `group_ids` una entrada del grafo. Los pasos de conversión se adaptan de `scripts/export.py` del repositorio VishalMysore/chronos-2-onnx-web.

## Capacidades

- Previsión probabilística de series temporales: emite 21 cuantiles por cada paso, lo que permite construir intervalos de predicción y distribuciones completas.
- Soporte de series univariantes y multivariantes mediante el mecanismo de `group_ids`.
- Manejo de valores faltantes en el contexto (relleno frontal y máscara de observación).
- Incorporación de covariables pasadas y covariables conocidas en el horizonte de predicción.
- Contexto largo de hasta 8.192 pasos y horizontes de predicción de al menos 1.024 pasos (verificados hasta 1.024 en las comprobaciones).
- Ejecución en navegador con WebGPU o WASM a través de ONNX Runtime Web.
- Batch dinámico: un lote de 8 series produjo la misma salida que ejecutarlas una a una (diferencia máxima 0).
- No soporta generación de texto, código, visión, audio ni tool calling; es exclusivamente un modelo de forecasting.

## Casos de uso

- Paneles de previsión en el navegador: una aplicación web puede cargar el modelo ONNX y generar predicciones de demanda, ventas o tráfico directamente en el cliente sin enviar datos a un servidor, lo que reduce latencia y mejora la privacidad.
- Planificación de inventario en comercio electrónico: predecir la demanda por producto con intervalos de cuantiles para dimensionar el stock de seguridad, usando covariables como promociones o festivos conocidos en el horizonte.
- Monitorización de infraestructura: previsión de métricas de CPU, memoria o latencia con contexto de hasta 8.192 puntos para detectar desviaciones antes de que ocurran, ejecutándose en el propio navegador del operador.
- Previsión meteorológica y de consumo energético: el modelo admite covariables como temperatura o lluvia (pasadas y futuras), lo que permite modelar la relación entre clima y demanda eléctrica.
- Aplicaciones de análisis financiero interactivo: estimación de rangos de precios o volúmenes con cuantiles, integrada en herramientas de escritorio o web sin backend de inferencia.
- Educación y prototipado: al ejecutarse en WebGPU/WASM, permite a investigadores probar el modelo en notebooks o demos web sin instalar PyTorch ni gestionar GPUs.
- Sistemas de alerta temprana en el borde: despliegue en dispositivos con navegador (incluidos entornos embebidos) para detectar anomalías en sensores IoT mediante comparación de la predicción con los valores observados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque el modelo no es de texto. La model card incluye comprobaciones de equivalencia numérica frente a `Chronos2Pipeline.predict` (chronos-forecasting 2.3.2, PyTorch 2.15.0, CPU, float32) con ONNX Runtime 1.31.1 en CPU:

| Covariables | Contexto | Horizonte | Diferencia relativa maxima |
|---|---|---|---|
| ninguna | 16 | 16 | 1,7e-6 |
| ninguna | 37 | 64 | 1,8e-6 |
| ninguna | 200 | 128 | 3,5e-6 |
| ninguna | 1.000 | 512 | 2,9e-6 |
| ninguna | 1.344 | 16 | 7,8e-7 |
| ninguna | 3.000 | 1.024 | 3,6e-6 |
| ninguna | 9.000 (recortado a 8.192) | 16 | 2,0e-6 |
| lluvia y temperatura, solo pasadas | 1.344 | 1 | 2,5e-7 |
| temperatura pasada, lluvia conocida en horizonte | 1.344 | 1 | 2,1e-7 |
| temperatura pasada, lluvia conocida en horizonte | 400 | 40 | 6,6e-7 |

No se proporcionan datos de latencia ni throughput en la información disponible.

## Requisitos de hardware

- VRAM estimada: el fichero ONNX pesa aproximadamente 478 MB en FP32; en WebGPU la memoria necesaria ronda ese tamaño más los buffers de activaciones, por lo que es viable en GPUs integradas y discretas modernas.
- GPU recomendadas: cualquier GPU con soporte WebGPU (por ejemplo, RTX 4090, RTX 3060, Apple Silicon M-series, Intel Arc) para ejecución acelerada; en WASM la ejecución es en CPU.
- Cabe en GPU de consumo: sí, el tamaño del modelo (menos de 0,5 GB) lo permite en tarjetas con 2 GB o más de memoria.
- Opciones de despliegue: ONNX Runtime Web (WebGPU o WASM); también puede ejecutarse con ONNX Runtime nativo en servidor o en Python.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chronos-2 ONNX Web (esta ficha) | no disponible | hasta 8.192 | Transformer encoder, 21 cuantiles, ONNX para navegador | Apache-2.0 | Hugging Face (conversion no oficial) |
| amazon/chronos-2 | no disponible | hasta 8.192 | Transformer encoder, 21 cuantiles, PyTorch | Apache-2.0 | Hugging Face (oficial) |
| VishalMysore/chronos-2-onnx-web | no disponible | hasta 8.192 | Conversion ONNX previa para navegador | Apache-2.0 | Hugging Face |

La comparativa con otros modelos de forecasting (por ejemplo, TimesFM, Moirai o Lag-Llama) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Conversión no oficial: Amazon no fabrica ni respalda esta conversión; para producción crítica conviene validar contra la implementación oficial.
- El grafo ONNX no incluye el preprocesado ni el postprocesado; el llamador debe replicar exactamente la estandarización, `arcsinh`, parcheado, codificación temporal y `sinh` para obtener resultados correctos.
- Contexto máximo efectivo de 8.192 pasos: contextos mayores se recortan, lo que puede perder información relevante.
- No se han publicado datos de sesgo ni de robustez frente a distribuciones fuera de dominio; el riesgo de predicciones poco fiables en series muy distintas a las de entrenamiento es desconocido.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar el aviso de modificaciones (§4(b)) y la atribución al modelo original.
- No hay información sobre cuantización ni variantes ligeras; el tamaño FP32 puede ser excesivo para dispositivos con poca memoria.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria adicional.
- No se especifican idiomas ni capacidades de texto: no debe usarse para tareas de NLP.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/okayuji/chronos-2-onnx-web
- Modelo base oficial: https://huggingface.co/amazon/chronos-2
- Paper de Chronos-2: https://arxiv.org/abs/2510.15821
- Repositorio de conversión previo: https://huggingface.co/VishalMysore/chronos-2-onnx-web
- Librería chronos-forecasting: no disponible en la información proporcionada
- Documentación de ONNX Runtime Web: no disponible en la información proporcionada
