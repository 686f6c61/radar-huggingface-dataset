# BHCC2025/Qwen3.8-27B-XQ-5.0bpw-mix

## Resumen

Qwen3.8-27B-XQ-5.0bpw-mix es una cuantizacion de precision mixta del modelo Qwen/Qwen3.8-27B, publicada por el usuario BHCC2025 en el formato propietario XQ, el formato de pesos del motor de inferencia Ferrite para la GPU Intel Arc Pro B70 (32 GB). El modelo conserva los 27.527.638.016 parametros del modelo base y se distribuye en ocho shards safetensors que ocupan 30,3 GB en disco, con una media de 5,0 bits por peso en las capas lineales (cada tensor usa 4, 5, 6 u 8 bits segun su sensibilidad).

La relevancia de esta ficha es doble. Por un lado, documenta una tecnica de cuantizacion poco habitual: codigos enteros agrupados con escalas fp16 cada 128 entradas de entrada, aplicados tras una rotacion de Hadamard, y decodificados directamente por kernels de GPU. Por otro, es un ejemplo claro de cuantizacion ligada a un unico motor: los pesos no cargan en transformers, llama.cpp ni exllamav3, solo en Ferrite. El autor declara ademas que el modelo ya no se mantiene, porque la tarjeta Arc Pro B70 sobre la que se genero y midio dejo de estar disponible para el proyecto Ferrite.

El modelo base Qwen3.8-27B es un transformer hibrido con 64 capas (48 de Gated DeltaNet y 16 de atencion con compuertas), hidden de 5120, vocabulario de 248.320 tokens y una capa MTP (multi-token prediction) para decodificacion especulativa. La cuantizacion mantiene el contexto medido hasta 120.000 tokens y Ferrite sirve 128K en la tarjeta de 32 GB. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 64 capas (48 Gated DeltaNet + 16 atencion con compuertas), hidden 5120, capa MTP |
| Parametros totales | 27.527.638.016 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K configurado en Ferrite; medido hasta 120K tokens |
| Tipos de cuantizacion | XQ version 0, precision mixta 4/5/6/8 bits por tensor, media 5,0 bpw en lineales; embedding, norms y convoluciones GDN en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (shards `xq-0000x.safetensors` + `xq_config.json`), formato XQ leido por el crate `fe-xq` de Ferrite |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B combina 48 capas de Gated DeltaNet (un mecanismo de estado recurrente con compuertas) con 16 capas de atencion tradicional con compuertas, sobre un hidden de 5120 y un vocabulario de 248.320 tokens. Incluye una capa MTP que permite decodificacion especulativa sin modelo borrador externo, aunque el autor recomienda el drafter companero z-lab/Qwen3.8-27B-DFlash2. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

La cuantizacion XQ aplica GPTQ sobre 128 secuencias de calibracion de 2048 tokens para 497 tensores y round-to-nearest para 8 tensores. Cada tensor recibe su propia anchura segun la tabla publicada: las proyecciones GDN `in_proj_a` e `in_proj_b` quedan a 8 bits, `in_proj_qkv` e `in_proj_z` mayoritariamente a 5 bits con 6 tensores a 4 bits, las proyecciones de atencion q/k/v a 5 bits y la cabeza de salida a 6 bits sin rotar. Los tensores que comparten entrada (qkv con z, gate con up) comparten anchura para preparar una sola vez su entrada rotada. La decodificacion usa codigos enteros agrupados con escalas fp16 cada 128 entradas, tras una rotacion de Hadamard de las entradas. La decodificacion especulativa es sin perdida: la salida greedy es identica token a token a la decodificacion plana.

## Capacidades

- Generacion de texto conversacional y de prosa, con perdida de calidad medida muy baja frente al BF16 (KL de 0,0114 en prosa con la ruta de prompt int8 por defecto).
- Generacion y edicion de codigo, con KL de 0,0061 en el conjunto de codigo y velocidades de 170 a 257 tokens por segundo en cargas de codigo.
- Razonamiento de contexto largo: mantiene coherencia hasta 120K tokens, con KL de 0,0037 en prompts de 120K.
- Decodificacion especulativa mediante la capa MTP propia (`dhead_q8.bin`) o el drafter externo DFlash2.
- Servidor compatible con la API de OpenAI en el puerto 8000 con el identificador de modelo `qwen3.8-27b`.
- No incluye torre de vision: Ferrite es solo texto, por lo que las capacidades multimodales del modelo base no estan disponibles en esta cuantizacion.
- Soporte de tool calling y agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Edicion de codigo en local sobre una GPU de escritorio profesional: con 176-257 tokens por segundo en cargas de edicion (mayoritariamente copia del prompt) y 136 tokens por segundo a 32K de contexto, el modelo es adecuado para iterar sobre ficheros de codigo dentro de un IDE o un pipeline de CI, siempre que el entorno sea Ferrite sobre Arc Pro B70.
- Asistente conversacional de contexto largo: los 128K tokens configurados y el KL de 0,0065 en chat permiten mantener conversaciones multi-turno con documentos extensos adjuntos sin degradacion apreciable frente al BF16.
- Analisis de repositorios y documentacion tecnica: la ventana de 120K medida y el throughput de 102 tokens por segundo a 100K de contexto permiten resumir o responder preguntas sobre bases de codigo de tamano medio en una sola pasada.
- Generacion de prosa y redaccion asistida: la ruta de 66 tokens por segundo en prosa a 2K de contexto es suficiente para tareas de redaccion no interactivas o seminteractivas, con una fidelidad al modelo original alta (KL 0,0105-0,0114).
- Despliegue de inferencia en hardware Intel Arc: el caso de uso natural es servir el modelo con Ferrite en una Arc Pro B70 de 32 GB, con 28,6 GB de memoria ocupada al cargar con contexto de 128K, aprovechando el procesamiento de prompt de hasta 2.200 tokens por segundo.
- Evaluacion de tecnicas de cuantizacion: el repositorio incluye `quant_log.json` con el error de cuantizacion por tensor y `xq_config.json` con anchura, tamano de grupo, rotacion y metodo de cada tensor, lo que lo convierte en material util para investigar precision mixta y rotaciones de Hadamard.
- Prototipado de decodificacion especulativa: la combinacion de la capa MTP, `dhead_q8.bin` y el drafter DFlash2 permite comparar estrategias de especulacion sin perdida sobre un modelo de 27B.

## Benchmarks y rendimiento

El autor no publica resultados en benchmarks estandar como MMLU, HumanEval o GSM8K. La unica metrica de calidad es la divergencia KL frente al modelo BF16, medida en Ferrite sobre Arc Pro B70 con cache KV q8:

| Conjunto de prueba | Ruta de prompt fp16 | Ruta de prompt int8 (por defecto) |
|---|---|---|
| Codigo | 0,0054 | 0,0061 |
| Prosa | 0,0105 | 0,0114 |
| Chat | 0,0057 | 0,0065 |
| Prompts de 16K tokens | 0,0048 | 0,0055 |
| Prompts de 120K tokens | 0,0033 | 0,0037 |

Rendimiento medido el 2026-11-14 con Ferrite 0.6.0, Arc Pro B70 limitada a 180 W y 2000 MHz, decodificacion especulativa DFlash2, contexto de 128K configurado y decodificacion greedy:

| Carga de trabajo | Tokens por segundo |
|---|---|
| Codigo, contexto 2K / 32K / 100K | 170 / 136 / 102 |
| Prosa, contexto 2K | 66 |
| Ediciones de codigo | 176-257 |
| Decodificacion plana sin especulacion | 27,6 |
| Procesamiento de prompt a 2K / 8K / 32K / ~120K | ~2.130 / ~2.200 / ~2.030 / ~1.490 |

Memoria de dispositivo al cargar con contexto de 128K: 28,6 GB.

## Requisitos de hardware

- VRAM estimada: 28,6 GB al cargar con contexto de 128K en Ferrite; 30,3 GB de espacio en disco para los pesos, de los cuales 1,3 GB corresponden a la cabeza borrador opcional `dhead_q8.bin`.
- GPU objetivo: Intel Arc Pro B70 de 32 GB, la unica tarjeta sobre la que el autor ha construido y medido la cuantizacion. El modelo ya no se prueba en ella desde Ferrite 0.7.1 (2026-11-19).
- GPU consumer: no cabe en tarjetas consumer de 24 GB (RTX 4090, RTX 3090) por el tamano de los pesos y el contexto. No hay soporte documentado para GPUs NVIDIA o AMD.
- Opciones de despliegue: exclusivamente Ferrite, compilado con `cargo build --release --features xe -p fe-server` y servido con `scripts/serve-xe.sh`, que expone un servidor compatible con la API de OpenAI. No carga en transformers, llama.cpp, Ollama, vLLM ni exllamav3.
- Latencia y throughput: 170 tokens por segundo en codigo a 2K de contexto, 27,6 tokens por segundo sin especulacion, y procesamiento de prompt de 1.490 a 2.200 tokens por segundo segun longitud. La ruta de prompt int8 es aproximadamente 1,5 veces mas rapida que la fp16 y se selecciona por defecto; `FERRITE_PREFILL=f16` activa la ruta fp16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y motor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-XQ-5.0bpw-mix | 27,5B | 128K configurado, 120K medido | XQ, solo Ferrite | Apache-2.0 | Hugging Face, 274 descargas, sin mantenimiento |
| Qwen/Qwen3.8-27B (BF16) | 27,5B | no disponible en la informacion | safetensors, transformers y otros | Apache-2.0 | Hugging Face, modelo base |
| z-lab/Qwen3.8-27B-DFlash2 | no disponible | no disponible | drafter para decodificacion especulativa | no disponible | Hugging Face, companero de esta cuantizacion |

No se dispone de datos de benchmarks comunes que permitan comparar el rendimiento de estos modelos entre si; la unica comparacion publicada es la divergencia KL de la cuantizacion frente al BF16 del mismo modelo base.

## Limitaciones y advertencias

- Modelo sin mantenimiento: el autor declara explicitamente que la Arc Pro B70 sobre la que se genero y midio ya no esta disponible para el proyecto Ferrite, y que las versiones posteriores a Ferrite 0.7.1 no se han probado en ella. Si una version reciente falla, hay que usar la etiqueta `v0.7.1`.
- Compatibilidad restringida: los pesos solo los lee Ferrite mediante el crate `fe-xq`. No cargan en transformers, llama.cpp, Ollama, vLLM ni exllamav3, lo que limita su uso a un unico motor y a hardware Intel Arc.
- Sin torre de vision: la cuantizacion es solo texto, de modo que las capacidades multimodales del modelo base no estan disponibles.
- Idiomas soportados no documentados: la model card no especifica la cobertura linguistica de esta cuantizacion.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada; se aplican los riesgos habituales de un modelo de 27B en tareas de conocimiento factual.
- Perdida de calidad medible: la ruta de prompt int8 por defecto introduce una divergencia KL de hasta 0,0114 en prosa frente al BF16; la ruta fp16 la reduce a 0,0105 a cambio de aproximadamente un 33% menos de velocidad de prefill.
- Sesgos: no documentados en la informacion disponible; se heredan los del modelo base Qwen3.8-27B.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales, pero al ser una cuantizacion de un modelo de terceros conviene verificar las condiciones del modelo base.
- Dependencia de la cabeza borrador: `dhead_q8.bin` solo se usa como cabeza de borrador de la capa MTP y nunca decide un token de salida, pero su ausencia obliga a usar el drafter externo DFlash2 o a decodificar sin especulacion, con la caida de rendimiento correspondiente (27,6 tokens por segundo).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BHCC2025/Qwen3.8-27B-XQ-5.0bpw-mix
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Drafter para decodificacion especulativa: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Repositorio de Ferrite: https://github.com/BHCC2025/ferrite
- Guia de Ferrite para Arc B70: https://github.com/BHCC2025/ferrite/blob/main/docs/arc-b70.md
- Resultados de rendimiento en Arc B70: https://github.com/BHCC2025/ferrite/blob/main/docs/arc-b70.md#results
- Paper de referencia citado en los tags (arXiv:2210.17323): https://arxiv.org/abs/2210.17323
