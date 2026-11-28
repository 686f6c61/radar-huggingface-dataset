# afanasjev/Hy-MT3-7B-W4A16-Marlin

## Resumen

Hy-MT3-7B-W4A16-Marlin es una cuantizacion GPTQ de 4 bits (pesos W4, activaciones A16) del modelo de traduccion multilingue tencent/Hy-MT3-7B, tercera generacion de la familia Hy de Tencent. El checkpoint lo publica el usuario afanasjev mediante `llmcompressor` y se almacena en formato `compressed-tensors` para aprovechar los kernels Marlin en GPUs NVIDIA, lo que reduce el peso del modelo de aproximadamente 15 GB en FP16 a unos 4,7 GB en disco. El objetivo es hacer viable el despliegue del modelo base en tarjetas consumer de 24 GB de VRAM como la RTX 3090 o la RTX 4090.

El modelo base emplea la arquitectura `hunyuan_v1_dense`, una pila transformer densa de 7.504.568.320 parametros (7,5 mil millones) especializada en traduccion automatica con cobertura declarada de 102 idiomas. Esta version cuantizada conserva la licencia Apache 2.0 del original y mantiene la cabeza de salida (`lm_head`) en su precision original para limitar la degradacion de calidad.

Su relevancia practica reside en que permite servir un traductor multilingue de 7B con contexto de hasta 32.768 tokens en una unica GPU consumer, usando vLLM con decodificacion en lote, prefix caching y KV cache cuantizada en int8. Es una pieza pensada para pipelines de traduccion de produccion mas que para experimentacion en entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | hunyuan_v1_dense (transformer denso) |
| Parametros totales | 7.504.568.320 (7,5B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (segun la configuracion de vLLM del autor) |
| Tipos de cuantizacion | W4A16 GPTQ, group size 128, formato compressed-tensors; `lm_head` sin cuantizar |
| Idiomas soportados | 102 idiomas (segun la model card del checkpoint); lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors / GPTQ), tamano del repo 4,7 GB |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion del modelo denso tencent/Hy-MT3-7B, construido sobre la arquitectura `hunyuan_v1_dense` de Tencent. Al ser un transformer denso de 7,5B, todos los parametros participan en cada pasada, sin enrutamiento tipo MoE. La cuantizacion se realizo con GPTQ en esquema W4A16 (pesos enteros de 4 bits, activaciones en 16 bits) con tamano de grupo 128 mediante `llmcompressor`, y se excluyo `lm_head` de la cuantizacion para preservar la fidelidad de la distribucion de salida.

El conjunto de calibracion empleado fue de 256 muestras de `HuggingFaceH4/ultrachat_200k` con longitud maxima de secuencia de 2048 tokens. Este detalle es relevante: la calibracion se hizo con datos genericos de conversacion en ingles, no con corpus paralelos de traduccion, lo que puede afectar de forma desigual a la calidad en pares de idiomas alejados del ingles. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base, la composicion de su dataset, ni si se aplicaron fases de RLHF o DPO; esos datos corresponden a la model card de tencent/Hy-MT3-7B, que no se ha proporcionado.

## Capacidades

- Traduccion automatica multilingue con cobertura declarada de 102 idiomas.
- Generacion de texto condicionada por prompt, con uso previsto como pipeline `translation`.
- Manejo de contexto largo de hasta 32.768 tokens, adecuado para documentos completos o conversaciones multi-turno.
- Compatibilidad con tool calling y function calling a traves del servidor vLLM (capacidad del runtime, no verificada de forma especifica para este checkpoint).
- Despliegue como endpoint compatible con la API de OpenAI (`endpoints_compatible` en los tags).
- Inferencia acelerada por kernels Marlin en GPUs NVIDIA Ampere y Ada.
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Traduccion de documentacion tecnica: con 32.768 tokens de contexto se pueden traducir manuales o ficheros README completos en una sola peticion, manteniendo coherencia terminologica a lo largo del documento.
- Localizacion de sitios web y aplicaciones: el modelo puede procesar lotes de cadenas de interfaz mediante el endpoint compatible con OpenAI de vLLM, integrándose en pipelines de CI/CD que extraen, traducen y reinyectan recursos de localizacion.
- Atencion al cliente multilingue: permite traducir en tiempo real conversaciones de soporte entre el usuario y el agente, con contexto suficiente para conservar el hilo de un ticket largo.
- Traduccion de articulos y contenidos editoriales: la ventana de 32k tokens admite articulos periodisticos o capitulos de libro sin trocear, reduciendo errores de descontextualizacion entre fragmentos.
- Generacion de subtitulos y transcripciones: al ser un modelo de traduccion dedicado, se puede encadenar tras un sistema ASR para producir subtitulos en varios idiomas de forma por lotes.
- Procesamiento por lotes en una sola GPU: con `--max-num-seqs=64` y chunked prefill configurados por el autor, es viable como servicio interno de traduccion masiva en una RTX 4090 o 3090, sin necesidad de infraestructura de centro de datos.
- Investigacion en traduccion automatica: sirve como linea base cuantizada para comparar el impacto de W4A16 frente al modelo en FP16 en metricas BLEU, COMET o chrF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del checkpoint no incluye metricas de calidad de traduccion (BLEU, COMET, chrF), ni comparaciones con el modelo base en FP16, ni datos de perplexity tras la cuantizacion.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 4,7 GB en disco; en inferencia con vLLM y KV cache en FP16 para 32k tokens hay que sumar la cache de atencion, por lo que se recomienda reservar al menos 20-22 GB para aprovechar la configuracion del autor con `--gpu-memory-utilization=0.95`.
- GPU recomendadas: RTX 3090 (24 GB) y RTX 4090 (24 GB) son el objetivo declarado por el autor gracias a los kernels Marlin. Para mayor concurrencia, A100 40/80 GB o H100.
- Cabe en GPU consumer: si, en tarjetas de 24 GB. En GPUs de 16 GB o menos no se garantiza con contexto de 32k; habria que reducir `--max-model-len` o usar KV cache cuantizada (el autor ya activa `int8_per_token_head`).
- Opciones de despliegue: vLLM es el runtime recomendado (comando incluido en la model card). El formato compressed-tensors/Marlin no es directamente compatible con llama.cpp u Ollama; para esos runtimes habria que buscar una cuantizacion GGUF alternativa.
- Requisito de software: `transformers>=5.6.0` para soporte nativo de `hunyuan_v1_dense`, y `--trust-remote-code` en vLLM.
- Latencia y throughput: no disponibles. La configuracion sugiere `--max-num-seqs=64` y `--max-num-batched-tokens=16384`, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| afanasjev/Hy-MT3-7B-W4A16-Marlin | 7,5B | 32.768 | Apache 2.0 | safetensors compressed-tensors, vLLM | Cuantizacion W4A16 del Hy-MT3-7B; sin benchmarks publicados |
| tencent/Hy-MT3-7B | 7,5B | no disponible en la informacion | Apache 2.0 | safetensors, transformers | Modelo base en precision original; mayor VRAM |
| Alternativas de traduccion de ~7B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con alternativas concretas de la misma categoria sin inventar datos.

## Limitaciones y advertencias

- La calibracion GPTQ uso `ultrachat_200k`, un corpus conversacional en ingles; la degradacion por cuantizacion puede ser mayor en pares de idiomas poco representados en ese conjunto.
- No hay evaluacion publicada del impacto de W4A16 en calidad de traduccion respecto al modelo base en FP16; conviene validar con un conjunto propio antes de produccion.
- Riesgo de alucinacion y de deriva en textos largos, comun en modelos de traduccion neuronales, no cuantificado para este checkpoint.
- La lista concreta de los 102 idiomas no esta disponible; la cobertura real por par de idiomas debe verificarse empiricamente.
- El checkpoint lo publica un tercero (afanasjev), no Tencent; la licencia Apache 2.0 se hereda del modelo base, pero no hay garantia de mantenimiento ni soporte.
- Requiere `transformers>=5.6.0` y ejecucion con `--trust-remote-code` en vLLM, lo que implica ejecutar codigo remoto del repositorio.
- El formato compressed-tensors/Marlin limita el despliegue a GPUs NVIDIA con soporte de kernels Marlin; no es portable a CPU ni a llama.cpp sin reconvertir.
- Con 0 descargas y 0 likes en el momento de la consulta, no existe validacion comunitaria del checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/afanasjev/Hy-MT3-7B-W4A16-Marlin
- Modelo base: https://huggingface.co/tencent/Hy-MT3-7B
- Dataset de calibracion: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- vLLM: https://github.com/vllm-project/vllm
- llmcompressor: https://github.com/vllm-project/llmcompressor
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
