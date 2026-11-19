# loom-draft/bartowski-Qwen2.5-7B-Instruct-loom

## Resumen

El paquete `loom-draft/bartowski-Qwen2.5-7B-Instruct-loom` es una distribucion empaquetada del checkpoint GGUF `Qwen2.5-7B-Instruct-Q4_K_M.gguf` de bartowski, preparada especificamente para el runtime AMD Loom (`hrx-loom`). No se trata de un modelo nuevo ni de un fine-tuning: los pesos son los del Qwen2.5-7B-Instruct original en cuantizacion Q4_K_M, sin modificar, y lo que anade el autor (loom-draft) son programas `.loom` generados con la herramienta `loom-next` junto con un fichero `model.json` que actua como tarjeta de configuracion.

El objetivo del paquete es permitir servir Qwen2.5-7B-Instruct en GPUs AMD concretas: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB). El runtime expone una API compatible con OpenAI (`/v1/chat/completions`) y soporta tool calling, con un contexto maximo de 32.768 tokens por peticion y hasta 4 peticiones concurrentes.

Es relevante porque cubre un hueco de despliegue en hardware AMD de consumo y profesional reciente, donde el ecosistema de inferencia (vLLM, TGI) tiene soporte mas limitado que en NVIDIA. El paquete es, en la practica, una receta reproducible de despliegue sobre ROCm mas que un modelo con identidad propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B-Instruct); empaquetada como programas `.loom` |
| Parametros totales | 7B (heredados del modelo base Qwen2.5-7B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por peticion (segun la tarjeta del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible en la informacion del paquete (heredados del modelo base Qwen2.5) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF empaquetado en `weights.loom` + programas `program/*.loom`, `model.json`, `tokenizer.json`, `llm_config.json`, `info.json` |

## Arquitectura y entrenamiento

El paquete no define arquitectura ni entrenamiento propios: reutiliza el checkpoint Qwen2.5-7B-Instruct de Alibaba (transformer decoder-only denso de 7.000 millones de parametros) en cuantizacion Q4_K_M producida por bartowski. No hay informacion en la model card sobre el dataset de entrenamiento, el numero de tokens, ni sobre fases de RLHF/DPO, porque el autor del paquete no los ha reentrenado ni documentado.

La innovacion tecnica del paquete es el pipeline de generacion con `loom-next`: a partir del GGUF y de un `llm_config.json` se generan kernels y programas `.loom` especificos para las arquitecturas AMD gfx1151 (Strix Halo) y gfx1201 (R9700). El runtime `loom-serve` ofrece un pool de memoria de respaldo fijo (`--pool_backing=fixed`), precarga de parametros (`--parameter_mode=preload`) y espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`). La tarjeta declara soporte de decodificacion especulativa como "no aplicable" y no documenta atencion lineal ni otras variantes.

## Capacidades

- Generacion de texto conversacional multi-turno via API compatible con OpenAI.
- Tool calling / function calling con el esquema `tools` y `tool_calls` de OpenAI.
- Bucles de agente multi-turno con reutilizacion de historial (gate `agent`).
- Contexto de hasta 32.768 tokens por peticion, con documentos de referencia probados entre 1k y 32k tokens en el gate `golden`.
- Hasta 4 peticiones concurrentes con salida identica a ejecuciones aisladas (gate `consistency`).
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- Sin modo de razonamiento/thinking (`reasoning / thinking: not applicable`).
- Sin soporte de imagen ni audio (`image input` y `audio input/output`: no aplicable).
- Sin decodificacion especulativa.
- Muestreo (`sampling`): estado "no determinado" en la tarjeta.

## Casos de uso

- Servicio de chat sobre GPU AMD Strix Halo: el paquete esta pensado para desplegar un endpoint `/v1/chat/completions` en un APU Ryzen AI Max+ 395; util para prototipos y demos que deben correr sin GPU NVIDIA.
- Despliegue en Radeon AI PRO R9700 (32 GB): con 32 GB de VRAM el modelo Q4_K_M (unos 4-5 GB) deja margen amplio para cache KV a 32k de contexto y concurrencia moderada.
- Asistentes con tool calling: el soporte de `tools`/`tool_calls` permite integrar el modelo en flujos de agentes que consultan APIs externas, bases de datos o servicios internos.
- Atencion al cliente automatizada: conversaciones multi-turno con contexto de hasta 32.768 tokens permiten incluir historial e instrucciones de negocio extensas en una sola peticion.
- Procesamiento de documentos largos: el gate `golden` valida prompts de 1k a 32k tokens, lo que habilita resumen y extraccion sobre documentos de decenas de paginas.
- Inferencia local en entornos ROCm: alternativa a llama.cpp cuando se quiere una API OpenAI nativa y kernels generados especificamente para gfx1151/gfx1201.
- Evaluacion comparativa de runtimes: el paquete incluye gates de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `sampling`, `logits`, `decision`) que sirven para medir fidelidad frente a llama.cpp sobre el mismo GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta indica explicitamente que los resultados de rendimiento para Strix Halo y R9700 "aun no se han vuelto a medir" (`not yet re-measured`), y que los gates de correccion no tienen ejecuciones registradas. No hay cifras de MMLU, HumanEval, GSM8K ni de throughput/latencia.

## Requisitos de hardware

- VRAM estimada: el GGUF Q4_K_M de un modelo de 7B ocupa aproximadamente 4-5 GB; a eso hay que sumar cache KV para 32k de contexto y hasta 4 peticiones concurrentes.
- GPUs objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se documenta soporte para GPUs de consumo AMD (RDNA3/RDNA4 de escritorio) ni NVIDIA; el paquete esta generado para gfx1151 y gfx1201.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servir. No se mencionan vLLM, llama.cpp, Ollama ni TGI como backends de este paquete, aunque llama.cpp se usa como referencia de correccion.
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| loom-draft/bartowski-Qwen2.5-7B-Instruct-loom | 7B | 32.768 | Q4_K_M | Apache 2.0 | Paquete de despliegue para AMD Loom (gfx1151/gfx1201) |
| bartowski/Qwen2.5-7B-Instruct-GGUF | 7B | 32.768 (heredado) | Multiples (incl. Q4_K_M) | Apache 2.0 | GGUF generico para llama.cpp y derivados |
| Qwen2.5-7B-Instruct (original) | 7B | 32.768 | safetensors (bf16/fp16) | Apache 2.0 | Checkpoint de referencia para fine-tuning e inferencia |

La diferencia entre las tres opciones no es de capacidad del modelo, sino de empaquetado y runtime: el paquete Loom solo aporta valor si el hardware es AMD gfx1151 o gfx1201 y se quiere servir con `loom-serve`; en cualquier otro caso, el GGUF de bartowski o el checkpoint original son las opciones naturales.

## Limitaciones y advertencias

- No es un modelo nuevo: hereda todos los sesgos y limitaciones de Qwen2.5-7B-Instruct, incluidos los riesgos de alucinacion propios de un modelo de 7B.
- La cuantizacion Q4_K_M introduce perdida de precision frente al checkpoint en bf16; el paquete no documenta su impacto cualitativo.
- El paquete solo soporta dos arquitecturas AMD concretas (gfx1151 y gfx1201); no hay soporte declarado para otras GPUs AMD, NVIDIA ni CPU.
- Los gates de correccion y rendimiento aparecen como "not yet re-measured": no hay evidencia publicada de que la salida coincida con llama.cpp en esta version del paquete.
- El muestreo (`sampling`) figura como "no determinado": temperatura, top_k y semilla no estan verificados.
- Sin modo de razonamiento, sin vision, sin audio y sin decodificacion especulativa.
- Limite de 4.096 tokens de salida y 32.768 de contexto por peticion; 4 peticiones concurrentes como maximo.
- La licencia Apache 2.0 del paquete es la del modelo base; conviene verificar los terminos del runtime `hrx-loom` por separado, ya que la tarjeta no los detalla.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad.
- Los resultados de busqueda web sobre "Loom" corresponden a productos no relacionados (grabador de pantalla y marca de ropa); no aportan informacion tecnica sobre este paquete.

## Enlaces

- Hugging Face: https://huggingface.co/loom-draft/bartowski-Qwen2.5-7B-Instruct-loom
- Modelo base (GGUF): https://huggingface.co/bartowski/Qwen2.5-7B-Instruct-GGUF
- Runtime AMD Loom (hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
