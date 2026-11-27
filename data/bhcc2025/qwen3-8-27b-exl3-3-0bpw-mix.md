# BHCC2025/Qwen3.8-27B-EXL3-3.0bpw-mix

## Resumen

Qwen3.8-27B-EXL3-3.0bpw-mix es una cuantizacion de precision mixta en formato EXL3 del modelo Qwen/Qwen3.8-27B, publicada por el usuario BHCC2025. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos orientada a inferencia eficiente: cada tensor del decodificador recibe una anchura de 2, 3 o 4 bits en funcion de su sensibilidad, con un presupuesto global de 3,0 bits por peso (bpw) y un tamano final de 13,3 GB en disco frente a los aproximadamente 54 GB en BF16 del modelo original. La licencia Apache-2.0 se hereda del modelo base.

El modelo base Qwen3.8-27B presenta una arquitectura hibrida con 64 capas (48 Gated DeltaNet y 16 capas de atencion con compuertas), hidden de 5120 y un vocabulario de 248.320 tokens, ademas de una capa MTP (Multi-Token Prediction) para decodificacion especulativa. Esta cuantizacion se construyo como modelo de decodificacion del motor Ferrite, un runtime de inferencia en Rust para DGX Spark y GPUs Blackwell de consumo, y tambien funciona sin modificaciones en exllamav3 y TabbyAPI.

La relevancia practica es doble: por un lado, permite servir un modelo de gran contexto (medido hasta 120K tokens, con servicio de 128K en Ferrite) en tarjetas de 16 GB como la RTX 5080 o la RTX 5060 Ti; por otro, el esquema de precision mixta mejora la fidelidad respecto a una cuantizacion uniforme de 3,0 bpw leyendo un 1,6 % menos de bytes por token, lo que se traduce en tasas de decodificacion ligeramente superiores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 64 capas (48 Gated DeltaNet + 16 de atencion con compuertas), hidden 5120, una capa MTP |
| Parametros totales | 6.654.694.784 (segun safetensors del repo); el modelo base se denomina comercialmente 27B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | medido a 120K tokens; Ferrite sirve 128K |
| Tipos de cuantizacion | EXL3 con precision mixta: 2, 3 y 4 bits por tensor en las lineales del decodificador; cabeza de salida a 5 bits; capa MTP a 4 bits; embeddings BF16; GDN in_proj_a / in_proj_b a FP16; torre de vision a 6 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors en formato EXL3 (requiere exllamav3 1.6.1 o superior) |

## Arquitectura y entrenamiento

Esta ficha describe una cuantizacion, no un entrenamiento. Los pesos proceden de Qwen/Qwen3.8-27B, un modelo hibrido que combina 48 capas Gated DeltaNet (un tipo de atencion lineal con estado recurrente) con 16 capas de atencion con compuertas, sobre un hidden de 5120 y un vocabulario de 248.320 tokens. Incluye una capa MTP que actua como cabecera de borrador para decodificacion especulativa. No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens vistos ni las etapas de RLHF o DPO aplicadas.

La innovacion de esta publicacion esta en el esquema de cuantizacion. El optimizador de exllamav3 asigno anchuras de 2, 3 o 4 bits por tensor bajo un presupuesto de 3,0 bpw, manteniendo una anchura compartida en los tensores que se fusionan en tiempo de decodificacion (q+k+v, gate+up, GDN qkv+z) para que los kernels fusionados sigan siendo aplicables. La tabla de asignacion publicada indica, por ejemplo, que 47 de las 48 capas GDN in_proj_qkv e in_proj_z quedan a 3 bits y una a 2 bits, mientras que las lineales de atencion se reparten entre 3 y 4 bits. La cabeza de salida se mantiene a 5 bits y la capa MTP a 4 bits para preservar la calidad del borrador especulativo.

## Capacidades

- Generacion de texto y conversacion multi-turno, con el pipeline declarado como text-generation y conversacional.
- Razonamiento y codigo, heredados del modelo base; las mediciones de divergencia KL incluyen conjuntos especificos de codigo, texto, chat y contexto largo.
- Procesamiento de contexto largo: se han medido prompts de 16K y 120K tokens, y Ferrite sirve hasta 128K.
- Decodificacion especulativa mediante la capa MTP del modelo base, con ganancias medidas de hasta el 8,5 % en codigo y el 8,0 % en prosa frente a la cuantizacion uniforme.
- Vision: la torre de vision se conserva a 6 bits en el checkpoint EXL3, aunque Ferrite es solo texto y no la carga.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-step: el autor documenta un escenario de cuatro agentes con cache de prompt, pero no se detallan capacidades nativas de agente mas alla del uso del servidor compatible con OpenAI.
- Capacidades multilingues: no disponible.

## Casos de uso

- Servicio de chat de contexto largo en una GPU de 16 GB: con 13,3 GB de pesos y contexto servido de 128K en Ferrite, una RTX 5080 o una RTX 5060 Ti pueden mantener conversaciones multi-turno con documentos extensos sin offloading a CPU.
- Asistencia de codigo en produccion: el modelo base esta orientado a codigo y esta cuantizacion mide 0,0230 de KL en el conjunto de codigo; puede integrarse en un servidor compatible con OpenAI (Ferrite o TabbyAPI) para autocompletado y edicion de codigo.
- Edicion de codigo sobre repositorios: el escenario de "code edits" alcanza 564 tok/s con una peticion y 472 tok/s con cuatro en dos DGX Spark, adecuado para tareas donde la salida copia gran parte del prompt.
- Despliegue en estaciones de trabajo Blackwell: una RTX PRO 4000 Blackwell de 24 GB ejecuta el modelo con Ferrite, lo que permite prototipado local sin depender de la nube.
- Agentes con cache de prompt: con cuatro agentes y un system prompt compartido de unos 13K tokens, la cache de Ferrite reduce los tokens de prompt procesados entre un 84 % y un 86 % y baja el time to first token de 14,7 a 5,0 s en el primer turno.
- Procesamiento por lotes de documentos largos: la fase de preprocesado de prompt medida a 2K, 8K, 32K, 64K y 120K tokens (3.569, 3.338, 2.806, 2.325 y 1.784 tok/s) permite clasificacion, resumen o extraccion sobre entradas de decenas de miles de tokens.
- Investigacion sobre cuantizacion: el checkpoint sirve como referencia reproducible para comparar precision mixta frente a cuantizacion uniforme con las metricas de KL y acuerdo top-1 publicadas.

## Benchmarks y rendimiento

Divergencia KL respecto al modelo BF16 (menor es mejor), medida en exllamav3 con cache KV en FP16 sobre una RTX 5080:

| Conjunto de prueba | 3,0 bpw uniforme | Esta cuantizacion | Ratio |
|---|---|---|---|
| code (40 x 2048 tokens) | 0,0250 | 0,0230 | 0,92x |
| text (20 x 2048 tokens) | 0,0500 | 0,0467 | 0,93x |
| chat (traza reservada, 45.930 tokens de respuesta) | 0,0330 | 0,0282 | 0,86x |
| long16k (prompts de 16K tokens) | 0,0239 | 0,0215 | 0,90x |
| long120k (prompts de 120K tokens) | 0,0152 | 0,0138 | 0,91x |
| Acuerdo top-1 con BF16, code / text | 95,53 / 90,70 % | 95,72 / 91,04 % | - |

Rendimiento en exllamav3 sobre RTX 5080 de 16 GB (un stream, 500 tokens):

| Metrica | 3,0 bpw uniforme | Esta cuantizacion | Ganancia |
|---|---|---|---|
| Decodificacion simple | 57,2 tok/s | 57,5 tok/s | +0,5 % |
| Borrador MTP (4 tokens), codigo | 127,8 tok/s | 138,6 tok/s | +8,5 % |
| Borrador MTP (4 tokens), prosa | 94,1 tok/s | 101,6 tok/s | +8,0 % |

Rendimiento en Ferrite con dos DGX Spark (tensor-parallel sobre RoCE, pesos de prompt NVFP4, decodificacion especulativa DFlash2, 4 peticiones x 128K de contexto):

| Carga | Resultado |
|---|---|
| codigo, 1 peticion (contexto 2K / 32K) | 267 / 230 tok/s |
| codigo, 4 peticiones combinadas | 467 tok/s |
| ediciones de codigo, 1 / 4 peticiones | 564 / 472 tok/s |
| prosa, 1 peticion | 74 tok/s |
| preprocesado de prompt a 2K / 8K / 32K / 64K / 120K | 3.569 / 3.338 / 2.806 / 2.325 / 1.784 tok/s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; las metricas anteriores miden fidelidad frente al BF16 y velocidad de inferencia, no calidad absoluta de tarea.

## Requisitos de hardware

- VRAM estimada: 13,3 GB de pesos; el contexto adicional depende de la cache KV. Con 128K de contexto en Ferrite cabe en 16 GB, segun el autor.
- GPUs validadas: RTX 5080 y RTX 5060 Ti de 16 GB, RTX PRO 4000 Blackwell de 24 GB, y DGX Spark (GB10) en configuracion de uno o dos nodos.
- Cabe en GPU de consumo: si, en tarjetas Blackwell de 16 GB o mas con el motor adecuado.
- Motores de despliegue: Ferrite (Rust, servidor compatible con OpenAI, decodificacion especulativa, cache de prompt), exllamav3 (uso en Python, borrador MTP) y TabbyAPI (servidor compatible con OpenAI sobre GPUs soportadas por exllamav3).
- Requisito de version: exllamav3 1.6.1 o superior para el formato EXL3.
- Latencia y throughput: 57,5 tok/s en decodificacion simple y hasta 138,6 tok/s con borrador MTP en una RTX 5080; hasta 564 tok/s en ediciones de codigo con dos DGX Spark. El time to first token con cache de prompt y cuatro agentes baja de 14,7 a 5,0 s en el primer turno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-EXL3-3.0bpw-mix (esta ficha) | 6.654.694.784 en safetensors | 120K medido, 128K servido | EXL3 mixto, 3,0 bpw medios, 13,3 GB | Apache-2.0 | Precision mixta 2/3/4 bits; KL 0,86-0,93x frente a 3,0 bpw uniforme |
| Qwen3.8-27B EXL3 3,0 bpw uniforme | no disponible | no disponible | EXL3 uniforme, 3,0 bpw, cabeza a 6 bits | Apache-2.0 | Referencia del autor; lee 10,14 GB por token frente a 9,98 GB |
| Qwen/Qwen3.8-27B (BF16) | no disponible (aprox. 54 GB en BF16) | no disponible | BF16 | Apache-2.0 | Modelo base sin cuantizar; referencia de calidad |

No se dispone de datos de benchmarks estandar que permitan comparar la calidad de tarea con modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- Es una cuantizacion de 3,0 bpw: la divergencia KL frente a BF16, aunque baja, no es cero (0,0138-0,0467 segun el conjunto), por lo que la salida puede diferir del modelo original.
- El modelo base se denomina 27B pero el recuento real de parametros en safetensors es de 6.654.694.784; conviene verificar la coherencia con el checkpoint original antes de dimensionar infraestructura.
- El checkpoint EXL3 solo es utilizable con exllamav3 1.6.1 o superior, Ferrite o TabbyAPI; no es compatible con llama.cpp, Ollama, vLLM ni TGI en este formato.
- Ferrite es solo texto y no carga la torre de vision, aunque el checkpoint la conserve a 6 bits; el uso multimodal queda limitado a otros motores.
- No hay informacion sobre sesgos, idiomas soportados ni riesgos de alucinacion especificos de esta cuantizacion; deben evaluarse sobre el modelo base.
- Las cifras de rendimiento se midieron en hardware concreto (RTX 5080, DGX Spark) y con versiones de software especificas (Ferrite 0.6.1, medicion del 2026-11-15); no son extrapolables sin validacion.
- El autor advierte que los numeros de distintos arneses de medida no son comparables entre si, solo dentro de la misma tabla.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene revisar sus terminos adicionales si los hubiera.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BHCC2025/Qwen3.8-27B-EXL3-3.0bpw-mix
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de Ferrite: https://github.com/BHCC2025/ferrite
- Guia de Ferrite para RTX 5080: https://github.com/BHCC2025/ferrite/blob/main/docs/rtx-5080.md
- Guia de Ferrite para RTX PRO 4000: https://github.com/BHCC2025/ferrite/blob/main/docs/rtx-pro-4000.md
- Metodologia de benchmarks de Ferrite: https://github.com/BHCC2025/ferrite/blob/main/docs/benchmarks.md
- Repositorio de exllamav3: https://github.com/turboderp-org/exllamav3
- Paper de referencia EXL3 (arXiv:2406.11235): https://arxiv.org/abs/2406.11235
