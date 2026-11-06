# nghianvn1/qwen38-flash-next-w4a16-mtp4-gdn8-qsa8-e384

## Resumen

Qwen3.8-Flash-Next W4A16 + MTP4 + GDN8 + QSA8 + E384 es una cuantizacion y poda del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por el usuario nghianvn1. Se trata de un transformer de tipo Mixture-of-Experts (MoE) con 67.028 millones de parametros totales, disenado para tareas de razonamiento visual y textual (image-text-to-text). La innovacion principal del checkpoint es la poda del 25% de los expertos enrutados de cada capa MoE (de 512 a 384), calibrada especificamente sobre transcripciones del agente ARC-AGI.

El modelo combina varias tecnicas de compresion: cuantizacion INT4 de los expertos enrutados, INT8 en las proyecciones de atencion lineal (GDN) y atencion QSA, una tabla PLE en FP8 E4M3 y precision de 16 bits para componentes criticos como routers, shared experts, `lm_head` y embeddings. El resultado es un checkpoint de aproximadamente 100 GiB que cabe en una sola GPU NVIDIA B300 con vLLM 0.31.0, con unos 52.5 GiB de pesos en GPU y unos 47.7 GiB de tabla PLE en RAM del host.

Es relevante ahora porque demuestra un flujo de trabajo de poda de expertos guiada por trazas reales de agente, con un coste medido de solo +2.7% en NLL sobre datos de evaluacion retenidos de ARC. No obstante, el autor advierte explicitamente que no debe esperarse calidad generalista: el checkpoint esta optimizado para un unico caso de uso y no se ha medido su tasa de resolucion real en el agente ARC.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion hibrida: capas GDN (`linear_attn`) y QSA (`self_attn`), MTP (multi-token prediction), PLE (tabla n-gram), hyper-connections |
| Parametros totales | 67.028.630.419 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card; la configuracion de servicio usa `--max-model-len 84000` |
| Tipos de cuantizacion | INT4 (expertos enrutados y cabeza MTP), INT8 (GDN y QSA), FP8 E4M3 (tabla PLE), 16-bit (shared experts, `lm_head`, `embed_tokens`, routers, hyper-connections, norms, indexer, `in_proj_a/b`, conv1d) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors, empaquetado `auto_round:auto_gptq` (group size 128, simetrico, RTN sin calibracion) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un MoE multimodal con 48 capas principales segun la forma de `pruned_keep_ids.npy` ([48, 384]). Combina dos mecanismos de atencion: capas GDN (atencion lineal, `linear_attn`) y capas QSA (`self_attn`), ademas de una cabeza MTP con su propio router para decodificacion especulativa, una tabla PLE (n-gram) en FP8 y hyper-connections. La cuantizacion es RTN pura (round-to-nearest) sin calibracion ni ajuste, con group size 128 y empaquetado `auto_gptq`.

La poda de expertos se realizo midiendo el enrutamiento sobre 180 transcripciones del agente ARC ejecutandose sobre el modelo sin podar (4.39M tokens, de los cuales 2.82M fueron generados por el modelo): el 50% mas dificil de 240 tareas de entrenamiento ARC (120 transcripciones) mas 60 de las 120 tareas de evaluacion. Por capa se conservaron los 384 expertos con mayor puntuacion, definida como 0.5 * proporcion de todos los tokens + 0.5 * proporcion de tokens generados por el modelo. Los expertos conservados se renumeran de 0 a 383 en su orden original y las filas del router siguen el mismo criterio. La masa de enrutamiento conservada (proporcion de selecciones top-10 que caen en un experto conservado) es del 98.2% de media por capa, con un minimo del 94.9% en la capa 0. La capa MTP reutiliza el conjunto de expertos conservados de la ultima capa principal, lo que solo puede afectar a la tasa de aceptacion del borrador especulativo, no a las respuestas.

No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento multimodal (pipeline `image-text-to-text`): el modelo procesa entradas de imagen y texto.
- Razonamiento de multiples pasos y llamadas a herramientas, con parsers dedicados en vLLM (`--tool-call-parser qwen3_coder`, `--reasoning-parser qwen3`).
- Flujo de agente sobre tareas ARC-AGI: resolucion de puzles de rejilla con razonamiento largo y uso de herramientas.
- Decodificacion especulativa mediante cabeza MTP (multi-token prediction).
- Capacidades multilingues: no disponibles (no se han medido ni documentado).
- Capacidades generalistas de chat, codigo fuera de ARC, otros idiomas o documentos largos: no medidas y con degradacion esperada segun el autor.

## Casos de uso

- Agente de resolucion de puzles ARC-AGI: el checkpoint fue podado y calibrado especificamente sobre trazas del agente ARC, por lo que es el escenario para el que fue disenado. Se desplegaria con vLLM y los parsers de tool calling y razonamiento indicados por el autor.
- Investigacion sobre poda de expertos en MoE: sirve como referencia reproducible de un flujo de poda guiado por trazas de agente, con el script de seleccion descrito (puntuacion 0.5/0.5 entre tokens totales y generados) y el fichero `pruned_keep_ids.npy` para auditar que expertos se conservaron por capa.
- Experimentos de cuantizacion mixta: permite estudiar el impacto de combinar INT4 en expertos, INT8 en atencion y FP8 en la tabla PLE dentro de un mismo modelo, comparando el NLL frente al checkpoint sin podar (0.1826 frente a 0.1875 nats/token).
- Despliegue en hardware limitado: con unos 52.5 GiB de pesos en GPU y la tabla PLE en RAM del host, cabe en una sola GPU de gran memoria (B300) y el autor indica que la configuracion 4x GPU con tensor parallelism y expert parallel es viable (384 / 4 = 96 expertos por rango).
- Evaluacion de decodificacion especulativa: la cabeza MTP con router propio y conjunto de expertos reutilizado permite medir como afecta la poda a la tasa de aceptacion del borrador sin alterar las respuestas.
- Servicio de inferencia con contexto largo: la configuracion de referencia usa `--max-model-len 84000` y `--max-num-seqs 64`, adecuada para sesiones de agente con historial extenso de razonamiento y llamadas a herramientas.

## Benchmarks y rendimiento

Unica metrica publicada: NLL medio sobre transcripciones de evaluacion ARC retenidas (60 tareas, 174.591 tokens puntuados del ultimo turno del asistente).

| Modelo | NLL (nats/token) | Variacion |
|---|---|---|
| Sin podar (512 expertos) | 0.1826 | referencia |
| Este checkpoint (384 expertos) | 0.1875 | +2.7% |
| 320 expertos (no subido) | 0.2090 | +14.5% |

La tasa de resolucion del agente ARC de este checkpoint no se midio. El modelo sin podar resolvio 52/86 pares de test (60.5%) en las mismas 60 tareas retenidas; no hay ejecucion disponible de este checkpoint. El NLL es solo un proxy. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: unos 52.5 GiB de pesos en GPU, mas cache KV (configurada en FP8 E4M3 en el ejemplo del autor). La tabla PLE (~47.7 GiB) se mantiene en RAM del host en vLLM.
- GPU recomendadas: NVIDIA B300 (unica configuracion probada, con vLLM 0.31.0 y backend Marlin WNA16 MoE). El autor menciona 4x L4 con TP4 y expert parallel como opcion no ejecutada.
- GPU de consumo: no disponible; el tamano del checkpoint (~100 GiB totales) lo descarta para GPUs consumer convencionales.
- Opciones de despliegue: vLLM 0.31.0 (unica via documentada). No se mencionan llama.cpp, Ollama ni TGI.
- Configuracion de referencia: `--max-model-len 84000 --max-num-seqs 64 --gpu-memory-utilization 0.5 --kv-cache-dtype fp8_e4m3 --enable-auto-tool-choice --tool-call-parser qwen3_coder --reasoning-parser qwen3`, con `VLLM_USE_FLASHINFER_SAMPLER=0`. Para 4x GPU, anadir `--tensor-parallel-size 4 --enable-expert-parallel` (el TP simple divide los expertos de anchura 640 a 160, no compatible con Marlin).
- Advertencia de backend: no pasar `--moe-backend triton`, ya que se aplicaria tambien a los expertos INT4 y Triton WNA16 rechaza el bias del router.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | NLL (ARC, retenido) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (384 expertos) | 67.028 M | no disponible (servicio a 84.000) | 0.1875 | qwen-community-1.0 | publico en Hugging Face |
| Qwen3.8-Flash-Next sin podar (512 expertos) | no disponible | no disponible | 0.1826 | qwen-community-1.0 | modelo base referenciado |
| Variante 320 expertos | no disponible | no disponible | 0.2090 | no disponible | no subida |

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El autor advierte explicitamente: "Do not expect general-purpose quality". El checkpoint esta podado para un unico caso de uso (agente ARC-AGI) y se espera degradacion en chat general, codigo fuera de ARC, otros idiomas y documentos largos.
- La tasa de resolucion real del agente ARC no se ha medido; el NLL es solo un proxy y no garantiza el mismo rendimiento que el modelo sin podar (60.5% en 52/86 pares).
- La calibracion de la poda uso 60 de las 120 tareas de evaluacion ARC; las otras 60 quedaron fuera, pero el conjunto de calibracion esta ligado a esa distribucion concreta.
- La capa MTP reutiliza el conjunto de expertos de la ultima capa principal, lo que puede reducir la tasa de aceptacion del borrador especulativo.
- Licencia qwen-community-1.0: es necesario revisar sus terminos para uso comercial; el autor remite a la licencia del modelo base.
- Solo se ha probado en una NVIDIA B300 con vLLM 0.31.0; otras configuraciones (4x L4, TP4, expert parallel) no se han ejecutado.
- No se han documentado sesgos, idiomas soportados ni comportamiento en contexto largo mas alla de la configuracion de servicio.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/nghianvn1/qwen38-flash-next-w4a16-mtp4-gdn8-qsa8-e384
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
