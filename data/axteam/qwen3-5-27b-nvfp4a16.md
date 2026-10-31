# axteam/Qwen3.5-27B-NVFP4A16

## Resumen

Qwen3.5-27B-NVFP4A16 es una cuantización a 4 bits del modelo Qwen3.5-27B de Qwen, realizada por axteam para servir el modelo de forma eficiente con vLLM. El modelo base es un LLM denso multimodal (image-text-to-text) con arquitectura híbrida que combina atención lineal (GatedDeltaNet/SSM) y atención completa, además de una cabeza de predicción multi-token (MTP). Esta versión aplica el esquema NVFP4A16 (W4A16): pesos en FP4 (E2M1) agrupados y activaciones en BF16, manteniendo en BF16 las partes sensibles a la cuantización.

El problema que resuelve es claro: reducir el tamaño en disco y la huella de memoria de un modelo de 27 mil millones de parámetros sin sacrificar de forma apreciable la calidad. El resultado pesa unos 28,6 GB y muestra, según mediciones del propio autor, una degradación de perplexity de solo un +1,3 % frente al original BF16, con un acuerdo top-1 del 95,6 % en la predicción del siguiente token.

Es relevante porque permite desplegar un modelo multimodal de esta escala en hardware más asequible (por ejemplo, una única GPU de gama alta con 32-48 GB de VRAM), aprovechando el soporte de vLLM para el formato compressed-tensors `nvfp4-pack-quantized`. La licencia Apache-2.0 del modelo base permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida (atencion lineal GatedDeltaNet/SSM + atencion completa), densa, multimodal (vision), con cabeza MTP |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no disponible (modelo denso, todos los parametros activos por token) |
| Longitud de contexto | no disponible en la ficha (el ejemplo de servidor usa `--max-model-len 32768`) |
| Tipos de cuantizacion | NVFP4A16 (W4A16): pesos FP4 E2M1 en grupos de 16 (escala FP8 E4M3 + escala global FP32 por tensor), activaciones BF16; ~32 % de parametros quedan en BF16 |
| Idiomas soportados | no disponible (la calibracion uso un corpus mixto con predominio de coreano; el original es multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, compressed-tensors `nvfp4-pack-quantized` |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-27B es un transformer denso de arquitectura hibrida: combina bloques de atencion lineal (via GatedDeltaNet, una capa tipo SSM) con bloques de atencion completa, lo que reduce el coste de la cache KV en secuencias largas. Incluye una torre de vision y un proyector para entrada de imagen-texto, y una cabeza de prediccion multi-token (MTP) que puede acelerar la generacion mediante decodificacion especulativa.

Esta publicacion no es un modelo reentrenado, sino una cuantizacion post-entrenamiento (PTQ) sin gradientes. El esquema NVFP4A16 cuantiza los pesos lineales a FP4 (E2M1) en grupos de 16 con escala FP8 E4M3 y escala global FP32 por tensor, mientras las activaciones permanecen en BF16. Se conservan en BF16 la torre de vision y el proyector, la cabeza MTP, todas las RMSNorm, los embeddings, el LM head y la ruta completa de atencion lineal (`linear_attn.*`), ya que FP4 es demasiado grueso para los pesos del SSM; esto supone aproximadamente el 32 % de los parametros del build. La calibracion se realizo con 256 muestras de un corpus mixto con predominio de coreano. El tokenizer, el `chat_template` y el `generation_config` son identicos a los del original.

## Capacidades

- Generacion de texto conversacional con plantilla de chat del original Qwen3.5-27B.
- Entrada multimodal: acepta imagenes (URL o data URI) junto al texto, gracias a la torre de vision conservada en BF16.
- Thinking mode activado por defecto en la plantilla de chat; se puede desactivar con `chat_template_kwargs={"enable_thinking": False}`.
- Cabeza de prediccion multi-token (MTP) presente en los pesos, habilitada para decodificacion especulativa.
- Atencion lineal hibrida que reduce el coste de la cache KV en contextos largos.
- Arquitectura densa sin MoE, con inferencia de coste predecible por token.
- Despliegue como servidor compatible con la API de OpenAI mediante vLLM.

## Casos de uso

- Chatbots multimodales autoalojados: el modelo acepta imagenes y texto en la misma conversacion, con la torre de vision intacta en BF16, lo que permite construir asistentes que describan o analicen imagenes sin depender de APIs externas.
- Despliegue en una unica GPU de gama alta: con ~28,6 GB de pesos, cabe en GPUs de 48 GB (o de 32 GB ajustando contexto y cache KV), abaratando el coste de servir un modelo de 27 B frente al original BF16.
- Servicios con API compatible con OpenAI: `vllm serve` expone un endpoint `/v1/chat/completions`, de modo que cualquier cliente existente del ecosistema OpenAI funciona sin cambios de codigo.
- Procesamiento por lotes offline: la clase `LLM` de vLLM permite ejecutar inferencia en Python sobre colecciones de documentos o imagenes, aprovechando el ahorro de memoria para aumentar el tamano de lote.
- Servido de contextos largos con memoria contenida: la ruta de atencion lineal reduce la cache KV y, adicionalmente, se puede activar `--kv-cache-dtype fp8` para reducir a la mitad su consumo en contextos extensos o con lotes grandes.
- Razonamiento con thinking mode: el modo de pensamiento activado por defecto permite tareas de razonamiento multi-paso, y puede desactivarse para respuestas rapidas en produccion.
- Servido solo de texto: con `--limit-mm-per-prompt '{"image": 0, "video": 0}'` se libera el presupuesto de memoria del encoder de vision cuando no se necesitan entradas visuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card si incluye mediciones de fidelidad frente al original BF16 (conjunto interno mixto ingles/coreano, 100 prompts, respuestas greedy, mismo harness):

| Metrica | Este modelo | BF16 original |
|---|---|---|
| Perplexity (menor = mas cercano) | 1,3779 | 1,3603 (+1,3 %) |
| Acuerdo top-1 siguiente token | 95,6 % | 99,3 % |

Estas metricas miden fidelidad al modelo base, no rendimiento en tareas absolutas.

## Requisitos de hardware

- VRAM estimada para inferencia: ~28,6 GB solo de pesos; con vision cargada, cache KV y sobrecoste de vLLM, se recomienda una GPU de 40-48 GB (A100 40 GB ajustado, A100 80 GB, H100, L40S 48 GB, RTX 6000 Ada 48 GB).
- Consumer GPUs: no cabe completo en una RTX 4090 de 24 GB; si cabe en GPUs de 32 GB (RTX 5090 de 32 GB, de forma ajustada) y con holgura en las de 48 GB.
- Opciones de despliegue: vLLM es el runtime objetivo del formato compressed-tensors `nvfp4-pack-quantized`; llama.cpp, Ollama y TGGUF no son compatibles con este formato. TGI no se menciona en la model card.
- Contexto: el ejemplo de la model card arranca el servidor con `--max-model-len 32768`.
- Optimizaciones de memoria en tiempo de ejecucion: `--kv-cache-dtype fp8` reduce aproximadamente a la mitad la memoria de la cache KV; `--limit-mm-per-prompt '{"image": 0, "video": 0}'` evita cargar el encoder de vision en despliegues solo de texto.
- Latencia y throughput: no disponibles como cifras publicadas; la cabeza MTP habilita decodificacion especulativa que puede acelerar la generacion si el runtime la aprovecha.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Multimodal | Licencia | Runtime |
|---|---|---|---|---|---|
| axteam/Qwen3.5-27B-NVFP4A16 | ~27,8 B | W4A16 (FP4 pesos) | Si (vision) | Apache-2.0 | vLLM |
| Qwen/Qwen3.5-27B (original) | ~27,8 B | BF16 | Si (vision) | Apache-2.0 | vLLM, transformers |
| Qwen3.5-27B en AWQ/GPTQ (si existieran builds de terceros) | ~27,8 B | W4A16 (INT4) | Segun build | Apache-2.0 | vLLM, otros |

Frente al original BF16, esta version reduce el tamano en disco y la VRAM necesaria a costa de una perdida de perplexity del +1,3 % y un acuerdo top-1 del 95,6 %. No hay datos publicados que permitan comparar rendimiento en tareas frente a otros modelos cuantizados de tamano similar.

## Limitaciones y advertencias

- La calibracion de la cuantizacion se hizo con un corpus mixto con predominio de coreano; la fidelidad en otros idiomas no ha sido medida publicamente y podria variar.
- Las metricas de evaluacion miden fidelidad al modelo BF16, no calidad absoluta en tareas; no hay benchmarks estandar publicados para este build.
- Aproximadamente el 32 % de los parametros (vision, MTP, norms, embeddings, LM head y toda la ruta SSM) permanecen en BF16, por lo que el ahorro de memoria es menor que en una cuantizacion W4A16 integral.
- Riesgo de alucinacion: inherente a cualquier LLM; no hay datos especificos publicados para este modelo.
- El formato compressed-tensors `nvfp4-pack-quantized` requiere vLLM; no es compatible con llama.cpp, Ollama ni otros runtimes que solo acepten GGUF.
- La longitud maxima de contexto real depende de la configuracion de despliegue (`--max-model-len`); el valor del modelo base no se indica en la informacion disponible.
- Licencia Apache-2.0: sin restricciones de uso comercial, pero los derechos sobre pesos, tokenizer y chat template originales pertenecen al equipo de Qwen.
- Proyecto comunitario de un tercero (axteam) con muy pocas descargas registradas (28) y un like: conviene validar la calidad en el propio caso de uso antes de pasar a produccion.

## Enlaces

- Modelo cuantizado: https://huggingface.co/axteam/Qwen3.5-27B-NVFP4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-27B/blob/main/LICENSE
