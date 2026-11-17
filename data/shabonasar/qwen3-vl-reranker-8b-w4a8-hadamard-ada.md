# shabonasar/qwen3-vl-reranker-8b-w4a8-hadamard-ada

## Resumen

Qwen3-VL-Reranker-8B W4A8 Hadamard (for Ada / SM89) es una version cuantizada del reranker multimodal Qwen/Qwen3-VL-Reranker-8B, publicada por el usuario shabonasar. El modelo puntua pares consulta-documento donde el documento puede ser texto o imagen, y esta especificamente optimizado para la GPU NVIDIA RTX 6000 Ada Generation (arquitectura SM89, 48 GB de VRAM). La cuantizacion reduce el peso de los pesos de 17,5 GB en bf16 a 7,2 GB.

La innovacion principal es la combinacion de cuantizacion W4A8 (pesos int4 simetricos por canal, activaciones int8 dinamicas por token) con una rotacion Hadamard de estilo QuIP (bloques de 128) aplicada a la entrada de cada capa lineal, seguida de GPTQ con act-order estatico. El modelo conserva en bf16 la torre de vision, los embeddings, las normalizaciones y el `lm_head`, y utiliza una cabeza de puntuacion basada en la softmax de los logits "no"/"yes".

Es relevante para equipos que despliegan reranking multimodal en produccion sobre hardware Ada: ofrece aproximadamente el doble de throughput que un checkpoint NVFP4 del mismo modelo en SM89, con una latencia por peticion notablemente menor y una capacidad de cache KV cuatro veces mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-VL) con 36 capas decoder, atencion completa y MLP denso; torre de vision de 27 bloques |
| Parametros totales | 8.771.252.464 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8192 tokens (configurado en el ejemplo de despliegue con `--max-model-len 8192`) |
| Tipos de cuantizacion | W4A8: pesos INT4 simetricos por canal, activaciones INT8 dinamicas por token; rotacion Hadamard (QuIP, bloque 128) + GPTQ con act-order; KV cache FP8 E4M3; vision tower, embeddings, norms y `lm_head` en BF16 |
| Idiomas soportados | no disponible (los datasets de calibracion incluyen ruso e ingles; la model card no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `compressed-tensors` (`pack-quantized`); matrices Hadamard en FLOAT64 |

## Arquitectura y entrenamiento

El modelo base es un transformer denso Qwen3-VL con 36 capas decoder de atencion completa y MLP denso, mas una torre de vision de 27 bloques con `merger`, tres `deepstack_merger_list`, `patch_embed` y `pos_embed`. La puntuacion de relevancia se obtiene como softmax sobre los logits de los tokens "no" y "yes" mediante `classifier_from_token`, con la cabeza `1_LogitScore` sin modificar respecto al original.

La cuantizacion se realizo con llm-compressor 0.15.0. Cada capa lineal recibe una rotacion Hadamard de estilo QuIP (bloque de 128) en su entrada, que vLLM invierte en linea mediante `hadacore`; despues se aplica GPTQ con act-order estatico. La calibracion uso 512 muestras de hasta 2048 tokens en el formato de prompt del reranker, con aproximadamente un 85% de pares pregunta-pasaje en ruso de mteb/RuBQRetrieval y mteb/MIRACLReranking, y un 15% de jxie/flickr8k (caption como consulta, imagen como documento). Se excluyeron de la calibracion todos los elementos usados en evaluacion y no se emplearon datos privados. El checkpoint no contiene pesos FP8 ni FP4; las matrices Hadamard (128x128) se almacenan en FLOAT64 como `*.v_input.weight`.

## Capacidades

- Reranking de pares consulta-documento en modalidad texto y multimodal (documentos de imagen).
- Puntuacion de relevancia mediante softmax sobre logits "no"/"yes", con cabeza `1_LogitScore`.
- Procesamiento de imagenes: hasta 1 imagen por prompt en la configuracion de ejemplo (`--limit-mm-per-prompt '{"image": 1, "video": 0}'`); el video esta deshabilitado en esa configuracion.
- Servicio via API OpenAI-compatible de vLLM con endpoint `/rerank`.
- Soporte de chat template especifico de reranker (`qwen3_vl_reranker.jinja`).
- No dispone de fase de decodificacion: todo el computo es prefill, sin decodificacion especulativa.
- Capacidades multilingues: no declaradas formalmente; la calibracion cubre ruso e ingles.

## Casos de uso

- Reranking en pipelines RAG multilingues: el modelo puntua pares consulta-pasaje con contexto de hasta 8192 tokens, adecuado para reordenar los candidatos recuperados por un retriever denso antes de pasarlos al generador.
- Busqueda multimodal: permite puntuar una consulta textual contra documentos de imagen (hasta 1 imagen por prompt), util para catalogos de producto, busqueda en archivos fotograficos o moderacion de contenido visual.
- Segunda etapa de recuperacion en motores de busqueda: con 53,7 pares/s en documentos de 256 tokens sobre una RTX 6000 Ada, puede reordenar lotes grandes con latencias de 0,58 s por peticion de 32 documentos.
- Filtrado de contexto en asistentes conversacionales: reduce el ruido en el contexto largo antes de la generacion, mejorando la precision y reduciendo tokens de entrada al LLM generador.
- Benchmarking y evaluacion de retrievers: sirve como juez de relevancia sobre conjuntos como MIRACL ru o RuBQRetrieval para medir la calidad de sistemas de recuperacion.
- Despliegue en infraestructura Ada existente: al caber en 48 GB con 7,2 GB de pesos y permitir `--gpu-memory-utilization 0.30`, deja margen para co-ubicar otros servicios en la misma GPU.
- Deduplicacion y clustering semantico asistido: la puntuacion de pares permite detectar documentos redundantes o casi duplicados en corpus textuales y de imagenes.

## Benchmarks y rendimiento

Rendimiento medido en una unica RTX 6000 Ada de 48 GB con vLLM commit `cf5cea2da`, comparado con un checkpoint NVFP4 del mismo modelo (weight-only via Marlin en SM89, FlashAttention 2, KV en bf16):

| Carga de trabajo | NVFP4 | Este modelo |
|---|---|---|
| Documentos de 256 tokens, 1 peticion: pares/s / prefill tok/s | 30,4 / 7 790 | 53,7 / 13 748 |
| Documentos de 1024 tokens, 1 peticion: pares/s / prefill tok/s | 9,2 / 9 405 | 17,0 / 17 369 |
| Documentos de 4000 tokens, 1 peticion: pares/s / prefill tok/s | 2,3 / 9 170 | 4,1 / 16 246 |
| Latencia de una peticion (32 documentos), 256 / 1024 / 4000 tokens (s) | 1,05 / 3,49 / 13,98 | 0,58 / 1,89 / 7,90 |
| 16 documentos de imagen, 4 en paralelo: pares/s | 39,0 | 69,0 |
| Latencia de una peticion con 16 documentos de imagen (s) | 0,69 | 0,56 |
| Capacidad de cache KV (tokens) | 38 912 | 161 792 |

La model card menciona una evaluacion de calidad en el conjunto reservado MIRACL ru (60...), pero el texto proporcionado esta truncado y no incluye los valores numericos. No se han publicado resultados completos de benchmarks de calidad (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM: los pesos ocupan 7,2 GB (frente a 17,5 GB en bf16), de los cuales 1,2 GB corresponden al `lm_head` en bf16. El ejemplo de despliegue usa `--gpu-memory-utilization 0.30` sobre 48 GB.
- GPU: requiere una GPU NVIDIA con tensor cores INT8. Solo se ha probado en SM89 (RTX 6000 Ada Generation). En SM89, la cache KV FP8 solo funciona con FlashInfer.
- GPU de consumo: no hay datos de despliegue en GPUs consumer; el modelo no esta pensado para ellas y la ruta Humming INT8 no esta validada fuera de SM89.
- Backend: vLLM nightly `0.33.0rc1.dev1030+gcf5cea2da` (imagen publica `vllm/vllm-openai:nightly-cf5cea2da37d3dfed27d2e0aa3041c3e553c2d57`), con `--linear-backend humming` y `--attention-backend FLASHINFER`. Versiones anteriores no cargan el layout W4A8 rotado.
- Parametros de servicio de referencia: `--runner pooling`, `--max-model-len 8192`, `--max-num-seqs 128`, `--max-num-batched-tokens 8192`, `--kv-cache-dtype fp8`.
- Throughput: hasta 17 369 tok/s de prefill y 53,7 pares/s con documentos de 256 tokens; latencia de 0,58 s por peticion de 32 documentos cortos.
- No hay fase de decodificacion ni decodificacion especulativa; todo el rendimiento es prefill.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| shabonasar/qwen3-vl-reranker-8b-w4a8-hadamard-ada | 8,77 B | 8192 | W4A8 + Hadamard + GPTQ | Apache 2.0 | SM89 (RTX 6000 Ada) |
| Checkpoint NVFP4 del mismo modelo (referencia en la model card) | 8,77 B | no disponible | NVFP4 weight-only via Marlin | no disponible | SM89 |
| Qwen/Qwen3-VL-Reranker-8B (modelo base) | 8,77 B | no disponible | bf16 | Apache 2.0 | GPU con suficiente VRAM (17,5 GB de pesos) |

La comparativa se limita a las variantes citadas en la informacion disponible; no se dispone de datos de otros rerankers multimodales comparables.

## Limitaciones y advertencias

- Dependencia estricta de version: solo funciona con builds de vLLM que incluyan el backend Humming y la transformacion `hadacore`; versiones anteriores no cargan el layout rotado.
- Compatibilidad de hardware limitada: solo validado en SM89 (RTX 6000 Ada); no hay garantia en otras arquitecturas con tensor cores INT8.
- En SM89 la cache KV FP8 exige FlashInfer; otras combinaciones de backend no estan soportadas segun la model card.
- La calibracion esta dominada por pares en ruso (aproximadamente 85%) y un 15% de pares caption-imagen; el rendimiento en otros idiomas o dominios no esta documentado.
- Limite de una imagen por prompt en la configuracion de ejemplo; el video esta deshabilitado en esa configuracion.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al ser un reranker, el riesgo se manifiesta como puntuaciones de relevancia erroneas mas que como texto generado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en produccion por terceros.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el checkpoint cuantizado.
- El modelo base Qwen3-VL-Reranker-8B puede tener sus propios terminos y limitaciones no reflejados en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shabonasar/qwen3-vl-reranker-8b-w4a8-hadamard-ada
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-Reranker-8B
- Commit de vLLM de referencia: https://github.com/vllm-project/vllm/commit/cf5cea2da
- Dataset de calibracion/evaluacion: https://huggingface.co/datasets/mteb/RuBQRetrieval
- Dataset de calibracion/evaluacion: https://huggingface.co/datasets/mteb/MIRACLReranking
- Dataset de calibracion multimodal: https://huggingface.co/datasets/jxie/flickr8k
