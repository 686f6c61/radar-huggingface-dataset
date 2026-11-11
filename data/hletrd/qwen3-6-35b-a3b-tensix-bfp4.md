# hletrd/Qwen3.6-35B-A3B-Tensix-BFP4

## Resumen

Qwen3.6-35B-A3B-Tensix-BFP4 es una cuantizacion del modelo Qwen3.6-35B-A3B de Alibaba Qwen, publicada por el usuario hletrd (Xylolabs) para su ejecucion en aceleradores Tensix de Tenstorrent, como Wormhole y Blackhole. El modelo base es un transformer MoE (mixture of experts) con vision, orientado a tareas image-text-to-text, con 35.951.822.704 parametros totales segun los pesos en safetensors. La cuantizacion emplea GPTQ con busqueda de exponente por bloque para redondear las capas lineales al formato `ttnn.bfloat4_b` (BFP4), un formato de coma flotante por bloques nativo de TT-NN.

La relevancia de esta ficha es doble. Por un lado, documenta un caso practico de cuantizacion de bajo ancho de bits (4,84 bits por peso de media) aplicada a un MoE grande con atencion hibrida, reduciendo el peso empaquetado a 20,99 GB frente a los 69,32 GB en BF16. Por otro, es un ejemplo de adaptacion de un modelo de pesos abiertos a un backend de hardware especifico (TT-Metal, TT-NN), algo poco comun en el ecosistema Hugging Face.

Conviene senalar desde el principio que el autor solo ha evaluado la parte del modelo de lenguaje, que las pruebas se han realizado sobre el simulador ttsim de Tenstorrent (no sobre hardware fisico) y que la demo de tt-metal para esta arquitectura requiere cuatro Blackhole P150 en paralelo de tensor. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion hibrida (attention + Gated DeltaNet), vision y bloque MTP |
| Parametros totales | 35.951.822.704 |
| Parametros activos | 3B (segun la nomenclatura A3B del modelo base; no confirmado en la model card) |
| Longitud de contexto | no disponible (la demo menciona una variante `traced_128k`, no confirmada como contexto maximo) |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) en capas lineales; bf16 en embeddings, LM head, normas, gate del experto compartido, MTP y visual |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16 con valores ya alineados a la rejilla BFP4) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B combina capas de atencion clasica con capas de Gated DeltaNet (un mecanismo de estado recurrente lineal), segun la estructura de tensores descrita en la model card: 10 capas con proyecciones de atencion q, k, v, o y 30 capas con proyecciones Gated DeltaNet q, k, v, z, a, b y output. Ademas incluye 40 capas de expertos enrutados (gate, up, down), un experto compartido por capa y un bloque MTP (multi-token prediction). El pipeline declarado es image-text-to-text, por lo que incorpora un modulo visual.

Sobre el entrenamiento original del modelo base no se aporta informacion en la documentacion disponible (numero de tokens, composicion del dataset, RLHF/DPO). Lo que si se documenta es el proceso de cuantizacion: GPTQ con busqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Los expertos enrutados comparten una unica matriz Hessiana por capa para gate y up, mientras que la proyeccion down de cada experto usa su propia Hessiana o, si vio pocos tokens de calibracion, redondeo al vecino mas cercano. El resultado son 4,84 bits por peso de media y 20,99 GB empaquetados. Solo se cuantizo y evaluo el modelo de lenguaje.

## Capacidades

- Generacion de texto conversacional con plantilla de chat (`apply_chat_template`).
- Procesamiento image-text-to-text (modulo visual conservado en bf16).
- Razonamiento multi-paso y prediccion multi-token (bloque MTP, desactivado por defecto en la demo de tt-metal para este modelo).
- Capacidades multilingues: no documentadas en la informacion disponible.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes: no documentado en la informacion disponible.
- Ejecucion en aceleradores Tensix mediante TT-NN con empaquetado directo de pesos BFP4 sin re-redondeo.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el checkpoint esta disenado para cargarse en TT-NN sobre Wormhole o Blackhole, empaquetando los pesos BFP4 sin perdida adicional; es el caso de uso principal y el unico validado por el autor (sobre simulador).
- Investigacion en cuantizacion de bajo ancho de bits: sirve como referencia reproducible de GPTQ con busqueda de exponente por bloque aplicada a un MoE con atencion hibrida, con scripts de verificacion (`pack_tensix.py`, `verify_grid.py`) para comprobar que ningun valor cambia al empaquetar.
- Evaluacion de degradacion por cuantizacion: permite medir la divergencia KL respecto a BF16 (0,0502 de media) y la caida de Top-1 (89,90 % frente a 100 %) en un conjunto de 40 preguntas, util para decidir umbrales de calidad en produccion.
- Prototipado en simulacion: con ttsim (ttnn 0.81.1) se puede validar el pipeline de empaquetado y la correccion numerica antes de disponer de hardware fisico.
- Inferencia conversacional en BF16 sobre GPU convencional: los pesos son bf16 validos y cargables con `transformers` y `device_map="auto"`, por lo que el checkpoint puede usarse como modelo de chat estandar (aunque sin las ventajas de tamano de BFP4).
- Base para despliegues multi-chip: la demo de tt-metal ejecuta el modelo con paralelismo de tensor sobre cuatro Blackhole P150, lo que sirve de plantilla para despliegues en cluster Tensix.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL medio a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3.6-35B-A3B) | 16 | 69,32 | 0 | 100 | 39 de 40 | - |
| Este modelo (BFP4) | 4,84 | 20,991 | 0,0502 | 89,90 | 39 de 40 | 0 |
| Q4_K_M (llama.cpp) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card corta la fila de Q4_K_M en la informacion proporcionada, por lo que no se recogen sus valores. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 69,32 GB de pesos, mas overhead de activaciones y cache KV; requiere multiples GPU o una GPU de gran memoria.
- VRAM estimada en BFP4 empaquetado: 20,99 GB de pesos, pero el empaquetado BFP4 solo lo aplica TT-NN sobre Tensix; en GPU convencional los pesos se cargan como bf16.
- GPU recomendadas (via transformers): A100 80 GB, H100 80 GB o configuraciones multi-GPU con `device_map="auto"`.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en BF16; el tamano empaquetado de 20,99 GB se acerca al limite pero no es utilizable en GPU sin el backend TT-NN.
- Aceleradores Tensix: Wormhole y Blackhole. La demo oficial de tt-metal ejecuta el modelo con paralelismo de tensor en cuatro Blackhole P150; no se ha probado en un solo chip.
- Opciones de despliegue: `transformers` (BF16), TT-NN / TT-Metal v0.81.1 (BFP4, probado en simulador ttsim), TT-Forge (tt-xla, no ejecutado con este checkpoint). TT-Transformers no soporta esta arquitectura.
- Latencia y throughput: no disponibles; las pruebas se hicieron en simulador, no en hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Tensix-BFP4 | 35,95B (3B activos) | no disponible | BFP4 4,84 bits | Apache-2.0 | Hugging Face, backend Tensix |
| Qwen/Qwen3.6-35B-A3B (BF16) | 35,95B (3B activos) | no disponible | BF16 | Apache-2.0 | Hugging Face |
| Q4_K_M del mismo modelo (llama.cpp) | 35,95B (3B activos) | no disponible | Q4_K_M | Apache-2.0 | Mencionado en la model card, datos incompletos |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Solo se ha cuantizado y evaluado el modelo de lenguaje; el modulo visual y el bloque MTP se mantienen en bf16 sin evaluacion reportada.
- Las pruebas en Tensix se realizaron sobre el simulador ttsim, no sobre hardware fisico; el rendimiento real y la estabilidad en chip no estan verificados.
- La demo de tt-metal requiere cuatro Blackhole P150 y no se ejecuto la particion en cuatro chips; solo se verifico el empaquetado exacto de las capas 0 a 3 en un chip simulado.
- La evaluacion es muy reducida: 40 preguntas, con una perdida de Top-1 de 10,1 puntos porcentuales respecto a BF16 y un KL medio de 0,0502; no sustituye a una bateria de benchmarks estandar.
- El LM head se re-redondea a bfloat8_b en la demo de tt-metal, lo que introduce una diferencia respecto al checkpoint.
- El calibrado de GPTQ uso WikiText-2 y Wikipedia en coreano, lo que puede sesgar la calidad hacia esos dominios e idiomas.
- No hay informacion sobre sesgos, riesgo de alucinacion ni comportamiento multilingue del modelo base en la documentacion disponible.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base y los terminos de Qwen deben verificarse por separado.
- El checkpoint no es directamente utilizable en GPU con las ventajas de tamano de BFP4; en `transformers` se carga como bf16.

## Enlaces

- Hugging Face: https://huggingface.co/hletrd/Qwen3.6-35B-A3B-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio de codigo (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo tt-metal Qwen3.5/3.6 (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/blackhole/qwen36
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/hletrd/Qwen3.6-35B-A3B-Tensix-BFP4/blob/main/LICENSE
