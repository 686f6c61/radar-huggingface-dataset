# mrysh/qwen3.5-4b-prune_depth_20

## Resumen

qwen3.5-4b-prune_depth_20 es una variante podada por profundidad del modelo Qwen/Qwen3.5-4B, publicada por el usuario mrysh como parte de un benchmark de poda (4 modelos x 8 variantes) que compara distintas estrategias de compresion frente a la cuantizacion. El modelo conserva unicamente la torre de lenguaje: se han eliminado la torre de vision y la cabeza de prediccion multi-token del Qwen3.5 original, por lo que es un modelo exclusivamente de texto.

La poda se realizo con NVIDIA ModelOpt Minitron (version 0.46.0rc1) en modo depth, nivel 0.2, reduciendo la red de 32 a 26 capas (20,0 % de las capas solicitadas) sin modificar el ancho de los tensores. La importancia de cada capa se midio sobre un conjunto de calibracion de 512 muestras mixtas. El checkpoint resultante contiene 3.528.208.256 parametros y ocupa 7,076 GB en disco.

Es relevante como material de evaluacion: no se aplico destilacion ni fine-tuning posterior a la poda, de modo que el modelo sirve para medir la degradacion de calidad inducida por la eliminacion de capas frente al modelo base y frente a alternativas cuantizadas. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B, solo torre de lenguaje; sin vision ni cabeza de prediccion multi-token) |
| Parametros totales | 3.528.208.256 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y aplica una poda estructurada por profundidad: se eliminan 6 de las 32 capas del transformer (de 32 a 26), seleccionadas segun su importancia medida sobre 512 muestras mixtas de calibracion. El ancho de los tensores (dimension del modelo, cabezas de atencion, FFN) permanece intacto. La herramienta empleada es NVIDIA ModelOpt Minitron 0.46.0rc1 en su modo depth con nivel 0.2.

No hubo destilacion ni fine-tuning tras la poda, lo que implica una caida de calidad respecto al modelo base que el propio autor declara esperar y que el benchmark asociado pretende cuantificar. Tampoco se conserva la torre de vision ni la cabeza de prediccion multi-token del Qwen3.5 original, de modo que el checkpoint es estrictamente de texto. No se dispone de informacion sobre el volumen de tokens de entrenamiento original ni sobre las etapas de RLHF/DPO del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto: al conservar la torre de lenguaje del Qwen3.5-4B, mantiene la capacidad de generacion autoregresiva, aunque degradada por la perdida de 6 capas.
- Razonamiento y matematicas: capacidad heredada del modelo base, sin datos especificos de rendimiento tras la poda.
- Codigo: capacidad heredada del modelo base, evaluada indirectamente en el benchmark mediante BFCL (tool calling).
- Tool calling / function calling: el autor lo evalua con BFCL en vLLM, lo que indica soporte del formato de llamadas a funciones del modelo base.
- Modo thinking: el modelo base dispone de el, pero en el benchmark se evalua con thinking desactivado; no se documenta su comportamiento con thinking activo tras la poda.
- Vision: no soportada; la torre de vision fue eliminada.
- Prediccion multi-token: no soportada; la cabeza correspondiente fue eliminada.
- Capacidades multilingues: no documentadas en la informacion disponible.

## Casos de uso

- Benchmark de estrategias de poda: el modelo esta disenado explicitamente para comparar variantes de poda (depth, width, etc.) y cuantizacion sobre BFCL, MedQA y un conjunto de hiring-bias, ejecutando las evaluaciones con vLLM. Es su uso principal declarado.
- Evaluacion de degradacion por eliminacion de capas: permite medir cuanto cae la calidad al pasar de 32 a 26 capas sin destilacion, comparando contra el Qwen3.5-4B original en las mismas tareas.
- Investigacion sobre compresion de modelos: sirve como punto de referencia para estudiar tecnicas de recuperacion (destilacion, fine-tuning ligero) aplicadas a checkpoints podados.
- Pruebas de tool calling en entornos con restricciones de VRAM: al ser un modelo de 3,5 mil millones de parametros y solo texto, puede desplegarse en GPUs de gama media para validar pipelines de function calling con vLLM.
- Experimentos de evaluacion de sesgo: el benchmark incluye una tarea de hiring-bias, por lo que el checkpoint puede reutilizarse para estudiar como la poda afecta a sesgos en decisiones de contratacion simuladas.
- Validacion de infraestructura de inferencia: su tamano reducido (7,1 GB en safetensors) lo hace util para probar configuraciones de vLLM, particionado de tensores y latencias antes de escalar a modelos mayores.
- Docencia y experimentacion: como ejemplo practico de poda por profundidad con ModelOpt Minitron, con reduccion cuantificada del 16,1 % de parametros del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que el benchmark (BFCL, hiring-bias y MedQA con vLLM, thinking off) esta en curso y que su objetivo es medir la caida de calidad frente al modelo base y frente a variantes cuantizadas, pero no se incluyen cifras en la model card ni en los metadatos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 7,1 GB solo para pesos, mas cache KV y overhead; en la practica, alrededor de 9-12 GB dependiendo de la longitud de contexto y del tamano de lote.
- VRAM estimada en cuantizacion de 8 bits: no disponible en el repo (solo se publican safetensors sin cuantizar), pero al no haber pesos GGUF/AWQ oficiales habria que cuantizar el checkpoint por cuenta propia.
- GPU recomendadas: cualquier GPU con al menos 16 GB de VRAM para BF16 con contexto moderado (RTX 4080, RTX 4090, L4, A10); A100/H100 para lotes grandes o evaluacion por lotes del benchmark.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con holgura y en RTX 4080 (16 GB) con contexto limitado; en GPUs de 8-12 GB requeriria cuantizacion.
- Opciones de despliegue: el autor evalua con vLLM; al ser un checkpoint safetensors de arquitectura qwen3_5_text, tambien seria desplegable con TGI o transformers, y convertible a GGUF para llama.cpp/Ollama (no se proporcionan conversiones oficiales).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| mrysh/qwen3.5-4b-prune_depth_20 | 3.528.208.256 | no disponible | Apache 2.0 | Poda depth 0.2 (32 a 26 capas), solo texto, sin destilacion |
| Qwen/Qwen3.5-4B (base) | no disponible en la informacion | no disponible | Apache 2.0 | Modelo original con vision y cabeza multi-token; referencia de calidad |
| Otras variantes del benchmark del mismo autor | no disponible | no disponible | Apache 2.0 (presumiblemente) | El benchmark incluye 4 modelos x 8 variantes de poda; no se detallan en la informacion |

No se dispone de datos de rendimiento comparativo (BFCL, MedQA, hiring-bias) en la informacion proporcionada para establecer diferencias cuantitativas con el modelo base ni con las variantes cuantizadas.

## Limitaciones y advertencias

- Caida de calidad esperada: el autor advierte explicitamente de que, al no aplicar destilacion ni fine-tuning tras la poda, el rendimiento es inferior al del Qwen3.5-4B base; no debe usarse en produccion sin evaluacion previa.
- Perdida de capacidades: sin torre de vision ni cabeza de prediccion multi-token; no apto para tareas multimodales ni para decodificacion especulativa basada en MTP.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la eliminacion de capas puede agravar el comportamiento del modelo base en tareas de conocimiento factual.
- Sesgos: el benchmark incluye una prueba de hiring-bias, lo que sugiere interes en medir sesgos, pero no se publican resultados; se desconoce el efecto de la poda sobre ellos.
- Idiomas: no documentados; se desconoce si la poda afecta de forma desigual a idiomas distintos del ingles.
- Contexto: no se especifica la longitud de contexto soportada tras la poda; debe verificarse contra la configuracion del modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero el autor remite a la model card del modelo base para condiciones adicionales; conviene revisarla.
- Madurez: checkpoint con 0 descargas y 0 likes, creado y actualizado el mismo dia (2026-11-04); sin validacion externa ni pipeline declarado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mrysh/qwen3.5-4b-prune_depth_20
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- NVIDIA ModelOpt (herramienta de poda): https://github.com/NVIDIA/TensorRT-Model-Optimizer
- vLLM (motor de inferencia usado en el benchmark): https://github.com/vllm-project/vllm
