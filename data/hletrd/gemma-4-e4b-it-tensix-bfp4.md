# hletrd/gemma-4-E4B-it-Tensix-BFP4

## Resumen

Gemma 4 E4B it Tensix BFP4 es una cuantizacion del modelo multimodal google/gemma-4-E4B-it, preparada por el autor hletrd (con herramientas de Xylolabs) para su ejecucion sobre aceleradores Tenstorrent Tensix (Wormhole y Blackhole). El modelo base es un transformer multimodal de Google de tipo any-to-any (texto, imagen y audio) con 8.667 millones de parametros totales, y esta version reduce el peso de las proyecciones de atencion y MLP a formato block floating point de 4 bits (`bfloat4_b`, BFP4), manteniendo en bf16 el LM head, los embeddings, las normas y las torres de vision y audio.

La relevancia de esta ficha es doble. Por un lado, demuestra que es posible cuantizar a 4 bits un modelo multimodal de ~8,7B con perdida de fidelidad moderada respecto al original en bf16: el tamaño empaquetado baja de 15,04 GB a 9,444 GB, y la divergencia media (KL) frente al bf16 es de 0,0970, aproximadamente la mitad que la de una cuantizacion Q4_K_M estandar de llama.cpp (0,1999). Por otro lado, el paquete incluye el formato de empaquetado y las herramientas de verificacion necesarias para desplegarlo directamente en hardware Tensix mediante `ttnn` y `tt-metal`.

El resultado es un artefacto pensado para inferencia en NPU de Tenstorrent, no para GPU convencional, aunque los pesos tambien pueden cargarse con `transformers` en bf16. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (lenguaje, vision y audio); detalles completos de la arquitectura del modelo base no disponibles en la informacion proporcionada |
| Parametros totales | 8.667.245.130 (~8,67B) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en proyecciones de atencion (q, o en 42 capas; k, v en 24 capas) y MLP (gate, up, down en 42 capas); bf16 en LM head, embeddings, normas, torres de vision y audio; compatible tambien con empaquetado exacto en `bfloat8_b` (BFP8) |
| Idiomas soportados | no disponible (la evaluacion cubre texto en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 17,4 GB; 9,444 GB empaquetados para Tensix), mas `quant4.json` e indice `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo base google/gemma-4-E4B-it es un transformer multimodal de la familia Gemma 4, descrito en el informe tecnico arXiv:2607.02770, con pipeline any-to-any: procesa y genera texto, y dispone de torres de vision (`vision_tower`, `embed_vision`) y de audio (`audio_tower`, `embed_audio`). Esta version no reentrena el modelo: aplica cuantizacion post-entrenamiento con GPTQ y una busqueda de exponente por bloque sobre las proyecciones de atencion y MLP, dejando intactos en bf16 el LM head (atado al embedding), las normas y los modulos multimodales.

La innovacion tecnica principal es el uso de block floating point de 4 bits (`bfloat4_b`) en el formato nativo de Tenstorrent, con un empaquetado que se verifica bit a bit: las herramientas `pack_tensix.py` y `verify_grid.py` comprueban que cada matriz cuantizada se reconstruye exactamente al pasarla por `ttnn.as_tensor` y por la DRAM del dispositivo. Los mismos valores se empaquetan de forma exacta tambien en `ttnn.bfloat8_b`. No se detalla en la informacion disponible el volumen de tokens de entrenamiento del modelo base, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno con plantilla de chat (`apply_chat_template`).
- Procesamiento de imagen a texto y de audio a texto, gracias a las torres de vision y audio conservadas en bf16.
- Salida any-to-any segun el pipeline declarado del modelo base.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base, no verificadas de forma independiente en esta cuantizacion.
- Soporte multilingue: la evaluacion incluye texto en ingles y coreano; el resto de idiomas no esta documentado.
- Ejecucion en NPU Tenstorrent Tensix (Wormhole, Blackhole) mediante `ttnn`, `tt-metal` y `tt-forge`.
- Carga estandar con `transformers` (`AutoModelForCausalLM`) en bf16 sobre GPU o CPU.
- Soporte de tool calling y de agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el formato BFP4 esta pensado para cargarse directamente en NPUs Wormhole y Blackhole con `ttnn`, reduciendo el peso de 15,04 GB a 9,444 GB y liberando DRAM del dispositivo para el resto del grafo.
- Inferencia multimodal en el borde: al conservar las torres de vision y audio en bf16, el modelo puede responder a consultas que combinan imagen o audio con texto en un unico dispositivo Tensix.
- Servicio de chat con contexto conversacional: la plantilla de chat y el pipeline any-to-any permiten montar un endpoint conversacional; la ventana de contexto concreta no esta documentada y debe validarse contra el modelo base.
- Prototipado de cuantizacion: el repo incluye `quant4.json` con el formato de cada proyeccion y las herramientas de verificacion, lo que sirve como referencia para cuantizar otros modelos Gemma 4 con la misma metodologia GPTQ + busqueda de exponente por bloque.
- Evaluacion comparativa de fidelidad: con las metricas KL y top-1 publicadas frente a bf16 y Q4_K_M, el modelo es util como punto de control en estudios de compresion de modelos multimodales.
- Investigacion en formatos block floating point: permite medir en hardware real el impacto de BFP4 frente a BFP8, ya que los mismos valores se empaquetan de forma exacta en `bfloat8_b`.
- Generacion de codigo y tareas de razonamiento en produccion: heredadas del modelo base, aunque sin benchmarks propios en esta cuantizacion; adecuado solo tras validar la calidad en el dominio concreto.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL media a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (google/gemma-4-E4B-it) | 15,04 | 0 | 100 |
| Este modelo (BFP4) | 9,444 | 0,09700 | 86,56 |
| Q4_K_M (llama.cpp) | 5,335 | 0,19989 | 81,05 |

Las metricas KL y top-1 se calculan sobre 7.968 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), con la plantilla de chat. La referencia Q4_K_M se genero desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de tareas en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM: 9,444 GB empaquetados en BFP4 para Tensix; 15,04 GB en bf16 si se carga con `transformers`; el repo completo ocupa 17,4 GB.
- NPU recomendadas: Tenstorrent Wormhole y Blackhole, con `tt-metal`, `ttnn` y `tt-forge`.
- GPU: la carga en bf16 con `transformers` requiere aproximadamente 16-18 GB de VRAM, por lo que cabe en RTX 4090 (24 GB), A100 (40/80 GB) y H100; en GPUs de 16 GB el margen es muy ajustado.
- Consumer GPU: si, en tarjetas de 24 GB o mas en bf16; no se documenta una ruta GGUF para llama.cpp u Ollama en esta version.
- Despliegue: `ttnn`/`tt-metal` en Tensix; `transformers` con `device_map="auto"` en GPU; no se mencionan vLLM ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| hletrd/gemma-4-E4B-it-Tensix-BFP4 | ~8,67B | no disponible | safetensors BFP4/bf16 | Apache 2.0 | Objetivo Tensix; KL 0,0970; top-1 86,56% |
| google/gemma-4-E4B-it (bf16) | ~8,67B | no disponible | safetensors bf16 | Apache 2.0 | Referencia de fidelidad; 15,04 GB |
| Q4_K_M de llama.cpp del mismo checkpoint | ~8,67B | no disponible | GGUF | Apache 2.0 | 5,335 GB; KL 0,1999; top-1 81,05% |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion BFP4 introduce perdida de fidelidad: KL media de 0,0970 y top-1 del 86,56% frente al 100% del bf16; no es equivalente al modelo original.
- El formato esta orientado a Tenstorrent Tensix; fuera de ese hardware se carga en bf16, perdiendo la ventaja de tamano.
- No se documentan sesgos conocidos, tasas de alucinacion ni comportamiento en idiomas distintos del ingles y el coreano.
- La longitud de contexto no esta especificada en la informacion disponible; debe consultarse en el modelo base antes de usarlo en produccion.
- El repositorio del modelo base no incluye fichero LICENSE; el autor aporta el texto estandar de Apache 2.0, por lo que conviene revisar los terminos de uso de Gemma 4 en el modelo original.
- Las capacidades de tool calling y agentes no estan verificadas en esta cuantizacion.
- La evaluacion se limita a 7.968 posiciones de texto; no cubre vision, audio ni tareas de razonamiento, por lo que la calidad multimodal no esta medida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/gemma-4-E4B-it-Tensix-BFP4
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Informe tecnico Gemma 4: https://arxiv.org/abs/2607.02770
- Codigo de cuantizacion (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia del codigo: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
