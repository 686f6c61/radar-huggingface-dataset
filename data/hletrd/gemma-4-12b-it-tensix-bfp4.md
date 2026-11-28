# hletrd/gemma-4-12B-it-Tensix-BFP4

## Resumen

`hletrd/gemma-4-12B-it-Tensix-BFP4` es una cuantizacion del modelo multimodal `google/gemma-4-12B-it` (Gemma 4, 12.966.363.184 parametros) publicada por el usuario hletrd, con el codigo y la metodologia del proyecto Xylolabs `tensix-bfp-gptq`. El objetivo no es un checkpoint generico de proposito general, sino un formato empaquetado y verificado para ejecutarse sobre aceleradores Tenstorrent Tensix (Wormhole y Blackhole) usando `ttnn.bfloat4_b`, el formato de coma flotante por bloques (block floating point, BFP4) del stack `tt-metal`.

La innovacion principal es la cuantizacion a 4 bits de las proyecciones de atencion y MLP mediante GPTQ con busqueda de exponente por bloque, manteniendo en bf16 el LM head, los embeddings, las normas y los modulos de vision y audio. El resultado son 8.146 GB empaquetados frente a 23.81 GB en bf16, con una divergencia KL media de 0.12030 respecto al modelo base, inferior a la de una cuantizacion Q4_K_M de llama.cpp (0.16924) sobre el mismo checkpoint.

Es relevante porque demuestra que un modelo de 13B con capacidades any-to-any (texto, imagen, audio) puede reducirse a ~8 GB con perdida acotada y ejecutarse en hardware no-GPU, lo que abre la puerta a despliegues en NPUs Tenstorrent con menor huella de memoria y sin depender de CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4, `gemma4_unified`); atencion y MLP cuantizados a BFP4 |
| Parametros totales | 12.966.363.184 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en proyecciones q, k, o, v y MLP gate/up/down; bf16 en LM head, embeddings, normas, vision y audio; compatible tambien con empaquetado exacto en `bfloat8_b` |
| Idiomas soportados | no disponible en la informacion proporcionada (la evaluacion usa texto en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 26.0 GB, pesos empaquetados de 8.146 GB para Tensix), con `quant4.json` e indice de safetensors |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-12B-it`, un transformer de la familia Gemma 4 con pipeline `any-to-any` (entrada y salida multimodales: texto, imagen y audio, segun los tensores `embed_audio`, `embed_vision` y `vision_embedder` presentes en el repo). La ficha no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO; esa informacion corresponderia al modelo base y no se incluye aqui.

La parte especifica de esta publicacion es el proceso de cuantizacion: GPTQ con busqueda de exponente por bloque aplicado a las proyecciones de atencion (q, k, o en 48 capas; v en 40 capas) y a las proyecciones MLP (gate, up, down en 48 capas), todas en `bfloat4_b`. El resto de tensores permanece en bf16. El empaquetado se verifica con `pack_tensix.py` (round-trip por DRAM del dispositivo) y `verify_grid.py` (comprobacion en torch puro), y los mismos valores se empaquetan de forma exacta en `ttnn.bfloat8_b`. El codigo de cuantizacion y los kernels/runner estan publicados como `tensix-bfp-gptq` (commit 5c52065, release v0.1.0), `tensix-kernels` v0.1.0 y `tensix-runner` v0.1.0.

## Capacidades

- Generacion de texto y conversacion multi-turno con plantilla de chat (`apply_chat_template`).
- Entrada imagen-texto (pipeline `image-text-to-text` / `any-to-any`), con modulos de vision y audio conservados en bf16.
- Razonamiento y respuesta instructiva heredados del checkpoint `-it` de Gemma 4.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no detalladas; la evaluacion cubre ingles y coreano.
- Capacidad especial: ejecucion en NPUs Tenstorrent Tensix (Wormhole, Blackhole) mediante `ttnn`, ademas de inferencia estandar con `transformers`.

## Casos de uso

- Inferencia en NPUs Tenstorrent: el formato empaquetado de 8.146 GB esta pensado para cargarse en Wormhole o Blackhole con `ttnn`, evitando la dependencia de GPUs NVIDIA y reduciendo la memoria necesaria frente a los 23.81 GB en bf16.
- Asistentes multimodales en el borde: al conservar vision y audio en bf16 y reducir el resto a BFP4, permite desplegar un modelo de ~13B con entrada de imagen y audio en entornos con presupuesto de memoria ajustado.
- Prototipado de cuantizacion: sirve como referencia reproducible para validar pipelines GPTQ + BFP4, ya que incluye `quant4.json`, scripts de empaquetado y verificacion, y comparacion KL frente a Q4_K_M.
- Evaluacion comparativa de formatos de bajo bit: util para medir la perdida de fidelidad (KL 0.12030, top-1 87.96 %) frente a bf16 y frente a Q4_K_M en tareas de texto en ingles y coreano.
- Chat instructivo general: el checkpoint `-it` soporta conversacion con plantilla de chat, adecuado para asistentes de texto en ingles y coreano (idiomas cubiertos por la evaluacion).
- Investigacion en eficiencia de hardware: permite estudiar el rendimiento de kernels `tt-metal`/`ttnn` sobre matrices cuantizadas a BFP4 sin reentrenar el modelo.

## Benchmarks y rendimiento

Evaluacion publicada por el autor (KL y top-1 sobre 8.048 posiciones de texto en ingles y coreano: WikiText-2 test y Wikipedia en coreano, con plantilla de chat):

| Modelo | Tamano (GB) | KL media a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (google/gemma-4-12B-it) | 23.81 | 0 | 100 |
| Este modelo (BFP4) | 8.146 | 0.12030 | 87.96 |
| Q4_K_M (llama.cpp v0.9.0, sin importance matrix) | 7.381 | 0.16924 | 85.52 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM estimada para inferencia: ~8.146 GB para los pesos empaquetados en BFP4 para Tensix; ~23.81 GB en bf16 para el modelo base.
- Aceleradores objetivo: Tenstorrent Tensix Wormhole y Blackhole (via `ttnn`, `tt-metal`, `tt-forge`).
- GPU consumer: no se documenta soporte ni requisitos para GPU; el formato BFP4 es especifico de Tensix. La carga con `transformers` en `dtype="bfloat16"` requeriria memoria equivalente al modelo base (~24 GB en bf16), no confirmado en la ficha.
- Opciones de despliegue: `ttnn`/`tt-metal` con `tensix-runner` v0.1.0 y `tensix-kernels` v0.1.0; `transformers` para carga estandar (`AutoModelForCausalLM`, `device_map="auto"`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano de pesos | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Gemma 4 12B it, BFP4) | 12.966.363.184 | no disponible | 8.146 GB (Tensix) | Apache 2.0 | Cuantizacion BFP4 para Tenstorrent; KL 0.12030 |
| google/gemma-4-12B-it (bf16) | 12.966.363.184 | no disponible | 23.81 GB | Apache 2.0 | Modelo base sin cuantizar; referencia de fidelidad |
| Q4_K_M de llama.cpp (mismo checkpoint) | 12.966.363.184 | no disponible | 7.381 GB | Apache 2.0 | Cuantizacion 4-bit para CPU/GPU; KL 0.16924 |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion BFP4 introduce perdida de fidelidad: KL media de 0.12030 y top-1 del 87.96 % frente a bf16 (100 %), medida solo sobre texto en ingles y coreano.
- El formato BFP4 esta orientado a Tenstorrent Tensix; no es un GGUF ni un formato portable a GPU/CPU convencionales. Para otros entornos habria que usar el modelo base o reconvertir.
- El autor advierte de que el repositorio del modelo base no incluye fichero LICENSE y que el `LICENSE` de este repo contiene el texto estandar de Apache 2.0; conviene verificar los terminos del modelo base antes de uso comercial.
- No se documentan sesgos conocidos, riesgo de alucinacion, idiomas soportados ni limitaciones de contexto en la informacion disponible.
- La evaluacion se limita a 8.048 posiciones de texto; no cubre vision, audio, tool calling ni tareas de codigo o matematicas.
- Repo con 226 descargas y 0 likes; el autor es un usuario individual (hletrd), no el equipo de Gemma, por lo que el soporte y mantenimiento no estan garantizados por Google.
- La fecha de creacion (2026-11-11) y la referencia arXiv 2607.02770 corresponden a la informacion proporcionada; no verificables de forma independiente aqui.

## Enlaces

- Hugging Face: https://huggingface.co/hletrd/gemma-4-12B-it-Tensix-BFP4
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Codigo de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release v0.1.0 de tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Kernels: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Runner: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion Tenstorrent: https://docs.tenstorrent.com
- Paper (Gemma 4 Technical Report): https://arxiv.org/abs/2607.02770
- Licencia del repo: https://huggingface.co/Xylolabs/gemma-4-12B-it-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
