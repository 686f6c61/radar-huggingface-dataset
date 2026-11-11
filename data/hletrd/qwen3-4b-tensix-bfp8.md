# hletrd/Qwen3-4B-Tensix-BFP8

## Resumen

Qwen3-4B-Tensix-BFP8 es una cuantizacion del modelo Qwen3-4B de Alibaba Qwen, publicada por el usuario hletrd (Xylolabs) y orientada especificamente a las NPU Tensix de Tenstorrent (Wormhole y Blackhole). El modelo mantiene la arquitectura original de Qwen3-4B (transformer denso con 4.411.424.256 parametros) pero redondea las capas lineales de atencion y MLP al formato `ttnn.bfloat8_b` (BFP8, block floating point de 8 bits) mediante GPTQ, de modo que el runtime TT-NN puede empaquetar los pesos sin volver a redondearlos.

La relevancia de esta ficha es doble: por un lado demuestra un flujo de cuantizacion especifico para hardware de inferencia no-GPU (Tensix), con un formato de pesos que respeta la rejilla BFP8 del empaquetador; por otro, conserva casi intacta la calidad del modelo base. Segun la model card, la media de KL respecto a BF16 es de 0.00120 sobre 16.240 posiciones de texto en ingles y coreano, con un top-1 del 98,63 % y sin respuestas perdidas en el conjunto de evaluacion de 40 preguntas.

El checkpoint ocupa 4,64 GB empaquetado (9,23 bits por peso de media) frente a los 8,04 GB del BF16, y se distribuye en safetensors en bf16 cuyos valores ya estan alineados a la rejilla BFP8. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), derivado de Qwen/Qwen3-4B |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`) en capas lineales; bf16 en embedding, LM head, normas y resto de tensores |
| Idiomas soportados | no disponible (evaluado en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en bf16 alineados a rejilla BFP8; 36 capas con q, k, v, o, gate, up y down en bfloat8_b |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-4B: un transformer denso de 36 capas con atencion multi-cabeza, capas MLP con proyecciones gate/up/down y LM head atada al embedding. La intervencion de Xylolabs no reentrena el modelo: aplica GPTQ para redondear las proyecciones lineales (q, k, v, o y gate, up, down de las 36 capas) a la rejilla `ttnn.bfloat8_b`, calibrando con 65.536 tokens de WikiText-2 y Wikipedia en coreano. Cada bloque BFP8 comparte un exponente propio, y el empaquetador TT-NN lee los pesos en layout `[in, out]`.

El checkpoint resultante pesa 9,23 bits por peso de media y 4,64 GB empaquetado. Los tensores se guardan en bf16 pero con valores ya situados en la rejilla BFP8, de forma que el empaquetado en TT-NN es exacto (sin re-redondeo). El fichero `quant4.json` documenta el formato de cada proyeccion. La model card indica que se probo con ttnn 0.81.1 sobre `ttsim` (simulador de Blackhole), no sobre hardware fisico, y que con tt-transformers (tt-metal v0.81.1) y `--use_hf_rope` un prefill de 2 capas coincidio con transformers con PCC 0.9990. No se detalla si hubo RLHF/DPO adicional; se asume el entrenamiento original de Qwen3-4B.

## Capacidades

- Generacion de texto conversacional y con plantilla de chat (`apply_chat_template`).
- Razonamiento con modo thinking, heredado de Qwen3 (la evaluacion incluye 7 prompts de razonamiento con thinking activado).
- Respuestas a preguntas factuales cortas (33 prompts con comprobacion automatica en la evaluacion).
- Capacidades multilingues del modelo base, con evaluacion explicita en ingles y coreano.
- Inferencia en NPU Tensix mediante TT-NN y tt-metal (empaquetado BFP8 nativo).
- Compatibilidad con transformers para inferencia en GPU/CPU en bf16 (los pesos son legibles como bf16 estandar).
- Soporte de tool calling y agentes: no documentado en la informacion proporcionada (depende del modelo base Qwen3-4B, no verificado aqui).

## Casos de uso

- Despliegue en NPU Tenstorrent Wormhole/Blackhole: el checkpoint esta disenado para empaquetarse directamente en TT-NN sin re-redondeo, lo que permite servir Qwen3-4B en aceleradores Tensix con 4,64 GB de pesos en DRAM.
- Inferencia en entornos con memoria limitada: al ocupar 4,64 GB empaquetado frente a 8,04 GB en BF16, cabe en dispositivos con DRAM ajustada manteniendo un KL de 0.00120 respecto al original.
- Chat conversacional de baja latencia: el modelo conserva el 98,63 % de top-1 respecto a BF16, adecuado para asistentes multi-turno donde la fidelidad de distribucion importa.
- Evaluacion y prototipado en simulador: la model card documenta el uso con `ttsim` (Blackhole) y `pack_tensix.py`/`verify_grid.py`, util para validar pipelines antes de disponer de hardware.
- Razonamiento con thinking en ingles y coreano: los 7 prompts de razonamiento con thinking activado no perdieron respuestas respecto a BF16, lo que respalda su uso en tareas de razonamiento en esos idiomas.
- Baseline de cuantizacion para comparativas: sirve como referencia de cuantizacion BFP8 frente a Q4_K_M (llama.cpp), con metricas KL y top-1 publicadas.
- Integracion en pipelines transformers existentes: al cargarse con `AutoModelForCausalLM` en bf16, puede usarse como sustituto del base en flujos que luego se empaquetan para Tensix.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3-4B) | 16 | 8,04 | 0 | 100 | 36 de 40 | - |
| Qwen3-4B-Tensix-BFP8 (este) | 9,23 | 4,639 | 0,00120 | 98,63 | 36 de 40 | 0 |
| Q4_K_M (llama.cpp) | 4,95 | 2,497 | 0,06581 | 89,61 | 38 de 40 | 0 |

Las metricas KL y top-1 cubren 16.240 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), en texto plano y con plantilla de chat. Las respuestas corresponden a 33 prompts cortos con comprobacion automatica mas 7 de razonamiento con thinking activado (40 en total). No se publican resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM: 4,64 GB empaquetado en BFP8; 8,04 GB si se carga en bf16 en GPU.
- NPU objetivo: Tenstorrent Tensix (Wormhole y Blackhole). Probado con ttnn 0.81.1 sobre `ttsim` (simulador de Blackhole), no sobre hardware fisico.
- GPU consumer: en bf16 (8,04 GB) cabe en GPUs con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4090); no se documenta una ruta de cuantizacion para GPU mas alla de cargar los pesos bf16.
- Despliegue: transformers (`AutoModelForCausalLM`, `dtype="bfloat16"`, `device_map="auto"`), TT-NN/tt-metal v0.81.1 (`tt-transformers` con `--use_hf_rope`), tt-forge (tt-xla) aun no probado con este checkpoint.
- Herramientas de verificacion: `pack_tensix.py` (comprueba cada matriz, opcionalmente con `--device` para round-trip por DRAM) y `verify_grid.py` (verifica la rejilla solo con torch).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-Tensix-BFP8 | 4,41 B | no disponible | BFP8 (9,23 bits/peso) | Apache 2.0 | Orientado a NPU Tensix; KL 0.00120 |
| Qwen/Qwen3-4B (BF16) | 4,41 B | no disponible | bf16 | Apache 2.0 | Base de referencia; 8,04 GB |
| Q4_K_M (llama.cpp) | 4,41 B | no disponible | GGUF 4 bits (4,95 bits/peso) | Apache 2.0 | 2,497 GB; KL 0,06581; top-1 89,61 % |

No se dispone de datos de contexto ni de benchmarks estandar (MMLU, HumanEval) para una comparativa mas amplia en la informacion proporcionada.

## Limitaciones y advertencias

- Validacion limitada: probado con ttnn 0.81.1 sobre `ttsim` (simulador), no sobre hardware Tensix fisico; el rendimiento real en Wormhole/Blackhole no esta verificado.
- tt-forge (tt-xla) no se ha ejecutado con este checkpoint; sus opciones `bfp_bf8`/`bfp_bf4` re-redondean los valores y no son exactas para estos pesos.
- El LM head esta en bf16, mientras que el demo de tt-transformers empaqueta la cabeza atada en bfloat8_b, por lo que ese checkpoint no es exacto en ese punto del demo.
- Riesgo de alucinacion: inherente al modelo base Qwen3-4B; la cuantizacion anade un KL de 0.00120 respecto a BF16.
- Sesgos: no documentados en la informacion proporcionada; heredados del modelo base.
- Idiomas: evaluado solo en ingles y coreano; el resto de idiomas no esta verificado.
- Longitud de contexto: no disponible en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar los terminos del modelo base Qwen3-4B.
- Repositorio sin descargas ni likes en el momento de la consulta (0/0), lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/hletrd/Qwen3-4B-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Codigo de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- tt-metal (v0.81.1): https://github.com/tenstorrent/tt-metal
- Paper de referencia (arxiv:2505.09388): https://arxiv.org/abs/2505.09388
