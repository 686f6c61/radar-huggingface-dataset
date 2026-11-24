# scottlowry/Ornith-1.5-35B-A3B-oQ6e-fp16-mtp

## Resumen

Ornith-1.5-35B-A3B-oQ6e-fp16-mtp es una cuantizacion mixta del modelo ornith-ai/Ornith-1.5-35B-A3B, publicada por el usuario scottlowry. Se trata de un checkpoint de 35.951.822.704 parametros con arquitectura Qwen3.5 MoE (tag `qwen3_5_moe`), es decir, un transformer con mezcla de expertos del que no se especifica el numero de parametros activos por token. La cuantizacion se ha realizado con oQ (oMLX v0.7.4.dev1) en precision mixta, con un promedio efectivo de 6,961 bits por peso, lo que reduce el checkpoint a 29,133 GiB de almacenamiento frente a los aproximadamente 71,9 GB que ocuparia en FP16.

La relevancia de esta ficha es doble. Por un lado, documenta un artefacto de cuantizacion para Apple Silicon (libreria MLX) que incluye vision (0,447B de parametros, almacenados en FP32) y una cabeza MTP (Multi-Token Prediction) de 0,845B, orientada a decodificacion especulativa y aceleracion de la generacion. Por otro, advierte de que el modelo base y su model card original no estan documentados en la informacion disponible: no hay datos de licencia, idiomas, contexto ni benchmarks, lo que limita cualquier evaluacion de produccion sin consultar el repositorio del modelo base.

El checkpoint fue creado el 19 de agosto de 2026 y actualizado el 12 de noviembre de 2026 tras una recuantizacion, con 356 descargas y 3 likes en el momento de la consulta. Es, por tanto, un artefacto de nicho, pensado para usuarios de MLX que quieran ejecutar un MoE de 35B en hardware Apple con un equilibrio entre calidad y huella de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), familia Qwen3.5 (`qwen3_5_moe`); incluye torre de vision y cabeza MTP |
| Parametros totales | 35.951.822.704 (35,952B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion mixta oQ: affine 6-bit grupo 64 (91,838% de los pesos), affine 8-bit grupo 128 (0,359%), affine 8-bit grupo 64 (6,474%), FP16 (0,086%), FP32 (1,242%); promedio efectivo 6,961 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria MLX) |
| Tamano del repo | 31,3 GB (29,133 GiB de pesos) |
| Desglose de almacenamiento | Lenguaje: 34,661B / 26,813 GiB; vision: 0,447B / 1,664 GiB; cabeza MTP: 0,845B / 0,656 GiB |
| Modelo base | ornith-ai/Ornith-1.5-35B-A3B |
| Herramienta de cuantizacion | oQ (oMLX v0.7.4.dev1) |

## Arquitectura y entrenamiento

La informacion disponible solo cubre el proceso de cuantizacion, no el entrenamiento del modelo base. Sabemos que la arquitectura es un transformer con mezcla de expertos de la familia Qwen3.5, con 35,952B de parametros totales, y que incorpora tres componentes diferenciados: el modelo de lenguaje (34,661B, el 96,4% de los pesos), una torre de vision de 0,447B y una cabeza MTP de 0,845B. La presencia de vision y de MTP indica un modelo multimodal con capacidad de prediccion multi-token, una tecnica habitual para acelerar la decodificacion mediante verificacion especulativa de varios tokens por paso.

La cuantizacion aplicada es de precision mixta y selectiva. El 91,838% de los pesos (33,018B) se almacena en affine 6-bit con grupo de 64, lo que da 6,50 bits efectivos por peso. Un 6,474% adicional (2,328B) se mantiene en affine 8-bit grupo 64 (8,50 bits efectivos), presumiblemente capas sensibles a la cuantizacion. La torre de vision se conserva integramente en FP32 (0,447B, 1,664 GiB), y una pequena fraccion de 0,031B queda en FP16. El resultado es un checkpoint de 29,133 GiB con 6,961 bits/peso promedio, una reduccion de aproximadamente el 59% frente al equivalente en FP16. No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset, RLHF/DPO ni innovaciones de atencion del modelo base.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es un MoE de 35B, categoria tipica de modelos de proposito general con capacidad de razonamiento multi-paso; no hay evaluaciones publicadas en la informacion disponible.
- Procesamiento de vision: la presencia de una torre de vision de 0,447B en FP32 confirma entrada de imagenes, aunque no se detalla la resolucion ni el tipo de tareas (VQA, OCR, captioning).
- Prediccion multi-token (MTP): la cabeza dedicada de 0,845B permite decodificacion especulativa y generacion de varios tokens por paso, con el consiguiente aumento de throughput.
- Codigo y matematicas: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; la arquitectura MoE y la cabeza MTP son compatibles con estos flujos, pero no hay confirmacion documental.
- Capacidades multilingues: no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint esta empaquetado para MLX y ocupa 29,133 GiB, por lo que encaja en equipos con 36-48 GB de memoria unificada (Mac Studio M2 Ultra, MacBook Pro M3/M4 Max de 48 GB) y permite ejecutar un MoE de 35B sin GPU dedicada.
- Asistentes multimodales en escritorio: la torre de vision en FP32 permite procesar capturas de pantalla, documentos escaneados o diagramas junto con texto, en flujos de analisis de documentos locales sin enviar datos a la nube.
- Prototipado de agentes con tool calling: si el modelo base soporta function calling (no confirmado), la cabeza MTP reduce la latencia en bucles de agente donde se encadenan muchas llamadas cortas.
- Generacion de codigo asistida en IDE: un MoE de 35B con 6,961 bits/peso puede servir como backend local de autocompletado y refactorizacion, siempre que se valide la calidad del modelo base en HumanEval o benchmarks equivalentes, no publicados aqui.
- Servicio de chat multi-turno con contexto largo: adecuado para conversaciones de soporte o documentacion tecnica, condicionado a la ventana de contexto del modelo base, que no se especifica.
- Aceleracion de decodificacion en produccion: la cabeza MTP permite implementar decodificacion especulativa sobre el propio modelo, reduciendo el coste por token en despliegues MLX con `mlx-lm`.
- Investigacion sobre cuantizacion mixta: el checkpoint sirve como referencia reproducible de la distribucion de bits de oQ y permite comparar la degradacion de calidad frente al modelo base en FP16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K, MMMU ni de evaluaciones de vision para este checkpoint ni para el modelo base ornith-ai/Ornith-1.5-35B-A3B en la informacion proporcionada. Tampoco se han publicado mediciones de latencia o throughput (tokens/s) para la variante MLX.

## Requisitos de hardware

- VRAM/memoria unificada: los pesos ocupan 29,133 GiB; con overhead de runtime MLX (buffers KV, activaciones) se recomienda un minimo de 32-36 GB de memoria unificada y, para contextos largos, 48 GB o mas.
- GPU Apple: Mac Studio con M2 Ultra (64-192 GB), MacBook Pro con M3 Max o M4 Max (36-128 GB); el modelo no esta pensado para GPUs NVIDIA por el formato MLX.
- GPU consumer NVIDIA: no aplicable directamente; seria necesario reconvertir los pesos a GGUF o safetensors estandar, operacion no incluida en el repositorio.
- Despliegue: `mlx-lm` y el ecosistema oMLX son las opciones naturales; vLLM, TGI, llama.cpp y Ollama no soportan el formato MLX de forma nativa, aunque llama.cpp podria usarse tras conversion a GGUF.
- Latencia y throughput: no disponibles; la cabeza MTP deberia reducirlos frente a decodificacion autoregresiva estandar, pero no hay cifras publicadas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento, contexto ni licencia del modelo base, y no se han identificado en ella alternativas comparables de la misma familia Qwen3.5 MoE con cuantizacion MLX. Como referencia estructural, el checkpoint se situa en la categoria de MoE de ~35B totales con cuantizacion de ~7 bits, pero cualquier comparacion cuantitativa con otros modelos requeriria benchmarks que no se han publicado.

## Limitaciones y advertencias

- Licencia desconocida: no se especifica la licencia del checkpoint ni la del modelo base, por lo que no puede confirmarse el uso comercial. Es imprescindible consultar ornith-ai/Ornith-1.5-35B-A3B antes de cualquier despliegue en produccion.
- Idiomas no documentados: se desconoce la cobertura multilingue y la calidad en castellano.
- Contexto no documentado: sin ventana de contexto publicada no puede planificarse el uso en tareas de contexto largo.
- Perdida de calidad por cuantizacion: 6,961 bits/peso promedio implica degradacion respecto a FP16, especialmente en las capas cuantizadas a 6 bits; no hay evaluacion publicada del delta.
- Sesgos y alucinacion: no hay informacion sobre sesgos del modelo base ni sobre tasas de alucinacion; deben asumirse los riesgos habituales de los modelos generativos.
- Dependencia de MLX: el checkpoint solo es utilizable en el ecosistema Apple MLX; no es portable a CUDA sin conversion manual.
- Artefacto de terceros: no es una publicacion oficial de ornith-ai; la recuantizacion la firma scottlowry y se actualizo el 11 de noviembre de 2026, por lo que conviene verificar la version descargada.
- Parametros activos desconocidos: al no conocerse cuantos expertos se activan por token, no puede estimarse con precision el coste computacional real por token.

## Enlaces

- Repositorio Hugging Face del checkpoint: https://huggingface.co/scottlowry/Ornith-1.5-35B-A3B-oQ6e-fp16-mtp
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
