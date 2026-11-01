# axteam/GLM-4-32B-0414-FP8-dynamic

## Resumen

GLM-4-32B-0414-FP8-dynamic es una cuantización de 8 bits del modelo denso zai-org/GLM-4-32B-0414, publicada por el usuario axteam. Se trata de un build W8A8 con pesos FP8 E4M3 (escala por canal) y activaciones FP8 dinámicas por token, empaquetado en formato compressed-tensors con esquema `FP8_DYNAMIC` y pensado específicamente para servir el modelo con vLLM. El objetivo es reducir el peso en disco y en VRAM de los ~34,4 GB del checkpoint frente a los ~65 GB en BF16, manteniendo prácticamente intacta la calidad del original.

El modelo base es un transformer denso de 32.566.081.536 parámetros (32,6B) con ventana de contexto de 32.768 tokens, arquitectura Glm4ForCausalLM y modalidad exclusivamente textual. La cuantización es post-entrenamiento (PTQ) y sin calibración (data-free): solo se cuantizan las proyecciones de atención y MLP, mientras que los embeddings de tokens, la LM head y todas las RMSNorm se conservan en BF16. El tokenizador y el chat template son idénticos a los del modelo original.

La relevancia de esta ficha es práctica: permite desplegar un modelo de 32B en una sola GPU de 80 GB con margen para caché KV, o en dos GPU de 48 GB con tensor parallelism, manteniendo una recuperación media del 99,8% respecto al BF16 según las mediciones del autor. La licencia MIT del modelo base se hereda en este derivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Glm4ForCausalLM) |
| Parametros totales | 32.566.081.536 (32,6B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | FP8 W8A8 (E4M3 pesos por canal, activaciones FP8 dinamicas por token); checkpoint en BF16 para embeddings, LM head y RMSNorm |
| Idiomas soportados | No disponible en la informacion proporcionada (el modelo base GLM-4-0414 es multilingue, con evaluacion especifica en coreano) |
| Licencia | MIT |
| Formato de pesos | safetensors con compressed-tensors (`float-quantized`, esquema `FP8_DYNAMIC`) |

## Arquitectura y entrenamiento

El modelo base GLM-4-32B-0414 es un transformer denso decoder-only de 32,6B parametros con 32K de contexto y arquitectura Glm4ForCausalLM, disenado para generacion de texto y conversacion. Esta publicacion no reentrena el modelo: aplica cuantizacion post-entrenamiento (PTQ) sin datos de calibracion. Los pesos de las proyecciones de atencion y MLP se almacenan en FP8 E4M3 con escala por canal de salida, y las activaciones se cuantizan dinamicamente por token en tiempo de ejecucion. Los embeddings, la LM head y todas las RMSNorm permanecen en BF16 para preservar la estabilidad numerica.

La innovacion tecnica de este build es el esquema `FP8_DYNAMIC` de compressed-tensors, que evita la necesidad de un dataset de calibracion y permite que vLLM seleccione automaticamente el kernel adecuado segun la GPU. En GPUs Ada, Hopper y Blackwell (sm89+) la aritmetica FP8 se ejecuta de forma nativa; en Turing y Ampere, vLLM degrada automaticamente a FP8 weight-only. El autor no proporciona detalles sobre la composicion del dataset de entrenamiento del modelo base ni sobre si hubo RLHF o DPO en su alineamiento.

## Capacidades

- Generacion de texto y conversacion multi-turno en formato chat, con chat template identico al modelo original.
- Razonamiento y conocimiento general: evaluado en MMLU (5-shot) con 81,82 en esta version FP8.
- Razonamiento matematico: evaluado en GSM8K (5-shot, strict) con 86,73.
- Razonamiento logico y sentido comun: ARC-Challenge (0-shot) con 62,97 y Winogrande (5-shot) con 84,21.
- Capacidades multilingues, con evaluacion especifica en coreano mediante KMMLU (57,99) y HAE-RAE (69,57).
- Servicio como API compatible con OpenAI a traves de vLLM (`/v1/chat/completions`).
- Inferencia offline en Python mediante la clase `LLM` de vLLM.
- Soporte de KV cache en FP8 como opcion de runtime para reducir memoria en contextos largos o batches grandes.
- No se documentan en la informacion disponible capacidades de vision, audio, tool calling explicito ni modo thinking.

## Casos de uso

- Servicio de chat en produccion con API OpenAI-compatible: desplegar con `vllm serve` y exponer `/v1/chat/completions` permite integrar el modelo en aplicaciones existentes sin cambiar el cliente, aprovechando los 32K de contexto para conversaciones multi-turno.
- Asistente de documentacion tecnica: con 32K de contexto se pueden inyectar manuales o fragmentos de codigo extensos y generar respuestas contextualizadas, manteniendo la calidad del BF16 segun los benchmarks de recuperacion (99,8% de media).
- Generacion y explicacion de codigo en pipelines internos: el modelo puede integrarse en flujos de revision o generacion de fragmentos de codigo, aunque no se documenta soporte nativo de tool calling en la informacion disponible.
- Procesamiento de texto a gran escala por lotes: la inferencia offline con vLLM permite procesar grandes volumenes de documentos con throughput alto, beneficiandose del menor peso del checkpoint FP8 (34,4 GB) frente al BF16.
- Atencion al cliente en coreano o entornos multilingues: los resultados en KMMLU (57,99) y HAE-RAE (69,57) indican un rendimiento solido en coreano, adecuado para asistentes en ese idioma.
- Razonamiento matematico asistido: con GSM8K de 86,73 puede emplearse en herramientas de resolucion de problemas paso a paso o tutoria educativa.
- Despliegue en infraestructura con VRAM limitada: al ocupar 34,4 GB de pesos, cabe en una GPU de 80 GB con margen amplio para cache KV, o en configuraciones multi-GPU con `--tensor-parallel-size` cuando no entra en una sola tarjeta.

## Benchmarks y rendimiento

Mediciones del autor con lm-evaluation-harness sobre vLLM, greedy, few-shot completion sin chat template. Los porcentajes entre parentesis indican la recuperacion respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic (este repo) | NVFP4A16 |
|---|---|---|---|
| MMLU (5-shot) | 81,98 | 81,82 (99,8%) | 81,31 (99,2%) |
| GSM8K (5-shot, strict) | 86,50 | 86,73 (100,3%) | 84,69 (97,9%) |
| ARC-Challenge (0-shot) | 62,54 | 62,97 (100,7%) | 61,60 (98,5%) |
| Winogrande (5-shot) | 85,08 | 84,21 (99,0%) | 84,21 (99,0%) |
| KMMLU (5-shot, direct) | 58,26 | 57,99 (99,5%) | 57,63 (98,9%) |
| HAE-RAE (0-shot) | 69,75 | 69,57 (99,7%) | 68,01 (97,5%) |
| Media | 74,02 | 73,88 (99,8%) | 72,91 (98,5%) |

## Requisitos de hardware

- VRAM para pesos: 34,4 GB en FP8. Anadir cache KV (crece con longitud de contexto y peticiones concurrentes) y unos pocos GB para activaciones y CUDA graphs.
- GPU recomendadas: NVIDIA Hopper (H100) o Blackwell (B200) para aritmetica FP8 nativa; Ada (L40S, RTX 4090) tambien soporta FP8 nativo (sm89+).
- GPUs Turing (T4) y Ampere (A100, RTX 3090): vLLM cambia automaticamente a FP8 weight-only, con menor ganancia de throughput.
- V100 (sm70) no esta soportada. El modelo base solo corre en bf16 (float16 deshabilitado para esta arquitectura), por lo que en la practica se requiere Ampere (sm80) o superior.
- Cabe en consumer GPU: una RTX 4090 (24 GB) no es suficiente para los pesos completos; se necesita al menos una GPU de 48 GB o repartir con tensor parallelism.
- Opciones de despliegue: vLLM (runtime recomendado y probado con la version 0.32.0; la arquitectura esta en vLLM >= 0.8.4). Tambien es posible cargar con transformers >= 4.56.0 y compressed-tensors >= 0.15.0, aunque sin las optimizaciones de serving.
- Requisitos de software para vLLM 0.32: Python 3.11-3.14, torch 2.13 (build CUDA 13.0, requiere driver con soporte CUDA 13), transformers >= 5.16.1 y < 5.20, compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado).
- Reduccion opcional de cache KV: `--kv-cache-dtype fp8` aproximadamente reduce a la mitad la memoria de cache KV en contextos largos o batches grandes.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| axteam/GLM-4-32B-0414-FP8-dynamic | 32,6B | 32K | FP8 W8A8 (compressed-tensors) | MIT | Este modelo; media de benchmarks 73,88 |
| zai-org/GLM-4-32B-0414 (BF16) | 32,6B | 32K | BF16 safetensors | MIT | Modelo original; media 74,02, ~65 GB |
| Version NVFP4A16 del mismo modelo | 32,6B | 32K | NVFP4 | MIT | Media 72,91 (98,5% de recuperacion) |

No se dispone en la informacion proporcionada de comparaciones con otros modelos de tamano similar (por ejemplo, familias Qwen o Llama de 30-35B), por lo que no se incluyen datos de esos modelos.

## Limitaciones y advertencias

- La cuantizacion FP8 introduce una perdida minima pero medible: la media de benchmarks cae de 74,02 a 73,88, con degradaciones mas visibles en Winogrande (99,0%) y KMMLU (99,5%).
- En GPUs Turing y Ampere el modelo opera en modo FP8 weight-only, con menor rendimiento que en Ada, Hopper o Blackwell.
- El modelo es exclusivamente textual; no soporta vision ni audio.
- No se documentan en la informacion disponible sesgos conocidos, tasas de alucinacion ni limitaciones especificas por idioma mas alla de la evaluacion en coreano.
- El uso comercial esta permitido por la licencia MIT del modelo base, que se hereda en este derivado.
- La cadena de dependencias de vLLM 0.32 es estricta (torch 2.13 con CUDA 13, transformers < 5.20, compressed-tensors 0.17.0); actualizar compressed-tensors por separado puede romper la carga del checkpoint.
- El checkpoint se guardo con compressed-tensors 0.19.0 pero se carga con 0.17.0; el autor advierte de no actualizar esa dependencia de forma independiente.
- El repositorio tiene muy pocas descargas (15) y ningun like en el momento de la consulta, por lo que la validacion comunitaria es practicamente nula.
- Para contextos muy largos o alta concurrencia, la cache KV puede consumir mas VRAM que los propios pesos; conviene planificar con `--kv-cache-dtype fp8`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axteam/GLM-4-32B-0414-FP8-dynamic
- Modelo base: https://huggingface.co/zai-org/GLM-4-32B-0414
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Repositorio de compressed-tensors: https://github.com/neuralmagic/compressed-tensors
