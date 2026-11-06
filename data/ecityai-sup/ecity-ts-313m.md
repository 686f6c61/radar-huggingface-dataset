# eCityAI-Sup/eCity-TS-313M

## Resumen

eCity-TS-313M es un modelo de prediccion de series temporales multivariantes disenado especificamente para escenarios de gestion de redes de agua (water utilities). Lo desarrolla eCityAI-Sup y se distribuye unicamente como grafo ONNX (mas pesos externos y un motor TensorRT precompilado), sin pesos en safetensors ni version PyTorch publicada. El modelo resuelve el problema de predecir con incertidumbre cuantificada el comportamiento futuro de variables operativas como volumen de suministro, caudal de red, presion y nivel de deposito.

Tecnicamente se trata de un Transformer decoder-only basado en parches (patch-based) con atencion alternada: una capa atiende sobre el eje temporal de forma causal y la siguiente sobre el eje de variables de forma completamente conectada. La cabeza de salida es una cabeza cuantilica que produce 9 cuantiles (0,1 a 0,9) para cada paso futuro, lo que permite construir intervalos de prediccion en lugar de una unica estimacion puntual. Con aproximadamente 313 millones de parametros y una ventana de contexto de hasta 4096 pasos temporales sobre 15 variables, genera 96 pasos futuros en una sola pasada forward.

Su relevancia actual radica en el empaquetado de inferencia: el modelo se publica como artefacto listo para produccion (ONNX Runtime y TensorRT), con contrato de entrada/salida documentado, perfil de optimizacion dinamico en batch (1/4/8) y una instantanea de referencia para comprobaciones de regresion. Esto lo hace adecuado para integrarse en sistemas de planificacion operativa y control de infraestructuras hidraulicas, un nicho donde escasean modelos publicos con licencia permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, patch-based, con atencion alternada tiempo (causal) / variables (fully connected) y cabeza cuantilica |
| Parametros totales | 313M (segun nombre del modelo; no se desglosa en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 pasos temporales x 15 variables |
| Tipos de cuantizacion | no disponible (se publica FP32: ONNX con pesos externos y engine TensorRT FP32) |
| Idiomas soportados | no disponible (modelo numerico de series temporales, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafo `ecity_ts_313m_15x4096.onnx` + pesos externos `.onnx.data` ~1,3 GB); engine TensorRT FP32 (~1216 MB) |

Otros datos tecnicos: tamano del repositorio 2,7 GB; horizonte de prediccion 96 pasos; 9 cuantiles (0,1-0,9, mediana en indice 4); batch dinamico con perfil min/opt/max = 1/4/8; libreria declarada `onnx`; pipeline `time-series-forecasting`.

## Arquitectura y entrenamiento

La model card describe un Transformer decoder-only que opera sobre parches de la serie temporal. La innovacion estructural principal es la alternancia de ejes de atencion: las capas alternan entre atencion causal a lo largo del eje temporal (respetando la direccion del tiempo) y atencion completamente conectada a lo largo del eje de variables (permitiendo que las 15 series se informen mutuamente en cada paso). Esta combinacion es habitual en modelos de forecasting multivariante tipo PatchTST/iTransformer, y aqui se combina con una cabeza que emite directamente cuantiles en lugar de una media puntual.

El modelo maneja observaciones faltantes mediante una mascara booleana `target_mask` de la misma forma que la entrada (`[B, 15, 4096]`), de modo que los puntos no observados pueden contener cualquier valor y quedan enmascarados en el calculo. La identidad de cada variable se aporta mediante `series_ids` (int64, `[B, 15]`), que debe mantenerse estable entre batches (habitualmente 0..14). No se proporcionan en la informacion disponible datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni detalles del preentrenamiento; la model card cubre exclusivamente la inferencia.

## Capacidades

- Prediccion multivariante de series temporales: 15 variables simultaneas de entrada, 96 pasos de horizonte de salida en una sola pasada.
- Prediccion cuantilica: 9 cuantiles por paso y variable, lo que permite intervalos de prediccion (P10 a P90, mediana en el indice 4).
- Manejo de datos faltantes mediante mascara explicita (`target_mask`).
- Contexto largo: ventana de historia de hasta 4096 pasos temporales.
- Identificacion explicita de variables via `series_ids`, lo que permite mantener la semantica de cada serie entre batches.
- Ejecucion optimizada en GPU: ONNX Runtime con CUDA Execution Provider y motor TensorRT FP32 precompilado.
- Batch dinamico: procesamiento de 1 a 8 sitios/instancias por pasada (perfil 1/4/8).
- No soporta tool calling, agentes, vision, audio ni generacion de texto: es un modelo puramente numerico de forecasting.

## Casos de uso

- Planificacion de suministro de agua: el modelo predice el volumen de suministro a 96 pasos con intervalos cuantilicos, permitiendo al operador dimensionar bombeos y reservas con bandas de incertidumbre en lugar de estimaciones puntuales.
- Gestion de presion en red de distribucion: con 15 variables de entrada y contexto de 4096 pasos, se puede anticipar caidas o picos de presion y activar vales reductoras o ajustes de consigna antes de que ocurran.
- Control de nivel de depositos: la prediccion a 96 pasos de nivel de tanque permite programar llenados y vaciados coordinados con las predicciones de caudal y demanda.
- Deteccion temprana de anomalias operativas: comparando la observacion real con los intervalos P10-P90, una lectura fuera de banda senala un comportamiento atipico (fuga, obstruccion, fallo de sensor) que merece inspeccion.
- Agregacion multi-sitio en una sola pasada: gracias al batch dinamico de hasta 8 instancias, un operador con varios sectores puede inferir todos a la vez en GPU, reduciendo coste por sitio.
- Integracion en pipelines de monitorizacion en tiempo real: el artefacto ONNX con onnxruntime-gpu se puede desplegar como servicio de inferencia en un SCADA o plataforma de telemetria, con comprobacion de regresion contra la muestra de referencia.
- Simulacion y evaluacion de escenarios: alimentando la ventana con series historicas sinteticas o condicionadas, se obtienen distribuciones futuras para comparar politicas de operacion.
- Despliegue en infraestructura NVIDIA: el engine TensorRT FP32 permite latencia baja en entornos con H200 u otras GPUs Ampere/Hopper, util para bucles de control con requisitos de respuesta ajustados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es linguistico y la model card no incluye metricas de error de forecasting (MAE, RMSE, CRPS, etc.).

Lo unico documentado en materia de rendimiento es una instantanea de latencia y memoria pico de TensorRT con batch=4 (`example/ecity_ts_313m_15x4096.json`), tomada en el momento del lanzamiento en un entorno de 8x NVIDIA H200 con TensorRT 10.6.0, CUDA 12.8 y onnxruntime-gpu 1.26.0. Los valores numericos de esa instantanea no se detallan en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos ONNX externos ocupan ~1,3 GB y el engine TensorRT FP32 ~1216 MB; en FP32 la huella de pesos es de aproximadamente 1,2-1,3 GB, a la que se suma memoria de activaciones y buffers de ejecucion (no cuantificada en la informacion disponible).
- GPU recomendadas: el entorno de referencia verificado es 8x NVIDIA H200. El engine TensorRT publicado esta vinculado al hardware, CUDA y TensorRT de compilacion, por lo que en otras GPUs hay que reconstruirlo o usar la ruta ONNX.
- GPU de consumo: no hay datos confirmados de ejecucion en RTX 4090 u otras consumer; la ruta ONNX Runtime con CUDA EP deberia poder ejecutarse en GPUs con suficiente VRAM para pesos y activaciones, pero no se documenta en la model card.
- Opciones de despliegue: ONNX Runtime (CUDA Execution Provider, con `ort.preload_dlls()` y TF32 desactivado para evitar desviaciones de ~1e-1) y TensorRT (requiere tensorrt + torch para gestion de memoria y streams; no carga pesos del modelo).
- Entorno: Python 3.12, numpy 1.26.4, torch 2.9.1+cu128, onnxruntime-gpu 1.26.0, TensorRT 10.6.0, driver CUDA 12.x y cuDNN 9.
- Latencia y throughput: no se publican cifras concretas; solo existe la instantanea de referencia mencionada arriba.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de modelos comparables documentados (mismo tamano, misma tarea de forecasting multivariante con cuantiles o mismo nicho de water utilities), por lo que la comparativa cuantitativa no esta disponible.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| eCity-TS-313M | 313M | 4096 pasos x 15 variables | Apache 2.0 | ONNX, TensorRT | Hugging Face y ModelScope |
| Alternativas genericas de forecasting multivariante | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio restringido: el modelo esta disenado para escenarios de water utilities; su comportamiento fuera de ese dominio (otras industrias, otras variables) no esta validado.
- Numero de variables fijo: la entrada exige exactamente 15 series (`series_ids` estables 0..14); no admite numero variable de variables sin cambios de contrato.
- Horizonte fijo: la salida es de 96 pasos; no se documenta prediccion recursiva ni horizontes mas largos.
- Solo inferencia: la model card no incluye informacion de entrenamiento, datos, sesgos ni procedencia del dataset, por lo que no se puede auditar el modelo mas alla del artefacto.
- Riesgo de alucinacion en sentido operativo: las predicciones cuantilicas son estimaciones; una banda demasiado estrecha o un error sistematico en regimenes no vistos puede inducir decisiones de operacion equivocadas. Debe validarse contra datos reales del sitio antes de uso en control.
- Dependencia de hardware: el engine TensorRT esta atado a la GPU, CUDA y TensorRT de compilacion; cambiarlos exige reconstruirlo. La ruta ONNX es la portable.
- Precaucion de precision: con TF32 activado (por defecto en CUDA EP) la desviacion respecto a la referencia FP32 puede llegar a ~1e-1, por lo que conviene desactivarlo (`use_tf32: "0"`) en entornos de validacion.
- Fallback silencioso a CPU: si falta `libcudnn.so.9` en el path, ONNX Runtime cae a CPU sin error; hay que comprobar `session.get_providers()`.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar avisos de licencia y verificar la procedencia de los datos de entrenamiento, no documentada.
- Idiomas: no aplica (modelo numerico, no linguistico); la ficha de Hugging Face no declara idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eCityAI-Sup/eCity-TS-313M
- Mirror en ModelScope: https://modelscope.cn/models/eCityAI/eCity-TS-313M
- Referencia arXiv declarada en los tags: arxiv:2605.20119 (paper no verificado en la informacion disponible)
