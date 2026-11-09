# BHCC2025/Qwen3.8-27B-EXL3-3.0bpw-mix

## Resumen

Qwen3.8-27B-EXL3-3.0bpw-mix es una cuantizacion de precision mixta en formato EXL3 del modelo base Qwen/Qwen3.8-27B, publicada por el usuario BHCC2025. El modelo base es un transformer hibrido de 64 capas que combina 48 capas de Gated DeltaNet con 16 capas de atencion con compuerta (gated attention), hidden de 5120 y un vocabulario de 248.320 tokens. La cuantizacion reduce el peso en disco a 13,3 GB (frente a unos 54 GB en BF16) con una media de 3,0 bits por peso, asignando a cada tensor una anchura de 2, 3 o 4 bits segun su sensibilidad.

El interes tecnico de esta publicacion no reside en el modelo base, sino en la estrategia de cuantizacion: el optimizador de exllamav3 elige la anchura de bits por tensor bajo un presupuesto global de 3,0 bpw, manteniendo anchuras compartidas en tensores que se fusionan en decodificacion (q+k+v, gate+up, GDN qkv+z) para no romper los kernels fusionados. Segun el autor, el resultado supera en precision a una cuantizacion uniforme de 3,0 bpw en los cinco conjuntos de prueba medidos, leyendo ademas un 1,6 % menos de bytes por token.

El modelo se diseno como decodificador de Ferrite, un motor de inferencia en Rust para DGX Spark, y tambien funciona sin cambios en exllamav3 y TabbyAPI. Es relevante para quienes necesitan desplegar un modelo de ~27B en hardware modesto (16 GB de VRAM) o en DGX Spark, con contexto medido hasta 120K tokens y licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 64 capas (48 Gated DeltaNet + 16 gated attention), hidden 5120, una capa MTP |
| Parametros totales | 6.654.694.784 (segun safetensors del repo cuantizado; el modelo base se denomina 27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | medido hasta 120K tokens; Ferrite sirve 128K |
| Tipos de cuantizacion | EXL3 de precision mixta, 3,0 bpw promedio (2/3/4 bits por tensor); cabeza de salida 5 bits; capa MTP 4 bits; embeddings BF16; GDN in_proj_a/in_proj_b FP16; torre de vision 6 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors en formato EXL3 (exllamav3 1.6.1 o superior) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura hibrida: 48 de sus 64 capas usan Gated DeltaNet (un mecanismo de estado recurrente lineal) y 16 usan atencion con compuerta. Incluye una capa MTP (multi-token prediction) que el autor aprovecha para decodificacion especulativa. El vocabulario es de 248.320 tokens y la dimension oculta es 5120. Esta publicacion no entrena el modelo: solo lo cuantiza, por lo que los datos de entrenamiento, el numero de tokens vistos y el proceso de alineacion (RLHF/DPO) del modelo base no se detallan en la informacion disponible.

La innovacion de esta ficha es la cuantizacion mixta guiada por optimizador. Bajo un presupuesto de 3,0 bpw, exllamav3 asigna anchuras por tensor: las proyecciones GDN in_proj_qkv e in_proj_z quedan casi todas a 3 bits (47 de 48 y 1 a 2 bits), las q/k/v/o de atencion se reparten entre 3 y 4 bits, y las MLP gate/up se quedan mayoritariamente a 3 bits (49 de 64) con 14 a 2 bits. Los tensores que se fusionan en decodificacion conservan una anchura comun para que los kernels fusionados sigan aplicandose. El resultado se evalua por divergencia KL frente al modelo BF16: 0,0230 en codigo, 0,0467 en texto, 0,0282 en chat, 0,0215 en prompts de 16K y 0,0138 en prompts de 120K, ratios de 0,86x a 0,93x respecto a la cuantizacion uniforme de 3,0 bpw. La concordancia top-1 con BF16 es del 95,72 % en codigo y del 91,04 % en texto.

## Capacidades

- Generacion de texto conversacional y continuacion de texto, segun el pipeline declarado (text-generation).
- Razonamiento multi-paso, con modo de pensamiento (thinking) que el autor mide explicitamente en Ferrite (thinking on/off).
- Generacion de codigo, incluida la edicion de codigo con salida mayoritariamente copiada del prompt (medida a 582 tok/s en un DGX Spark doble).
- Procesamiento de contexto largo: evaluado con prompts de 16K y 120K tokens.
- Decodificacion especulativa sin perdida mediante la capa MTP (4 tokens de borrador), con salida greedy identica token a token a la decodificacion plana.
- Cache de prompt exacta en Ferrite: una peticion reanudada produce los mismos tokens que recalcular el prompt completo, lo que beneficia a agentes multi-turno.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Vision: el repo conserva una torre de vision cuantizada a 6 bits (por defecto de exllamav3), pero Ferrite es solo texto y no la carga; no se detalla su funcionalidad.

## Casos de uso

- Edicion de codigo en produccion: el modelo mide 582 tok/s en un solo DGX Spark y 481 tok/s con cuatro peticiones cuando la salida copia fragmentos del prompt, un patron tipico de refactorizacion y parcheo de codigo. La concordancia top-1 del 95,72 % con BF16 en codigo respalda su uso en pipelines de CI/CD.
- Agentes multi-turno con system prompt compartido: con cuatro agentes y un system prompt de ~13K tokens, la cache de prompt de Ferrite reduce los tokens procesados un 74 % (thinking off) y un 86 % (thinking on), bajando el time to first token de 16,4 s a ~5 s en el primer turno y a ~0,35-0,5 s en los posteriores.
- Asistente conversacional de contexto largo: el modelo mantiene una divergencia KL de 0,0138 con prompts de 120K tokens, adecuado para resumir o consultar documentos extensos en una sola ventana.
- Despliegue en estaciones de trabajo con 16 GB de VRAM: en una RTX 5080 genera 57,5 tok/s en decodificacion plana y 138,6 tok/s con borrador MTP en codigo, lo que permite servir un modelo de ~27B en hardware de consumo.
- Servidor compatible con OpenAI sobre GPU estandar: via TabbyAPI o exllamav3, para integrar el modelo en aplicaciones existentes sin cambiar el cliente.
- Inferencia en DGX Spark (uno o dos nodos): Ferrite procesa prompts a 3.544 tok/s con 2K de contexto y 1.792 tok/s con 120K, con paralelismo tensorial sobre RoCE en la configuracion de dos nodos.
- Prototipado e investigacion de cuantizacion: las tablas de KL y de rendimiento por conjunto de prueba permiten reproducir y comparar estrategias de precision mixta frente a cuantizacion uniforme.

## Benchmarks y rendimiento

Divergencia KL frente a BF16 (menor es mejor), medida en exllamav3 con cache KV FP16 en una RTX 5080:

| Conjunto de prueba | 3,0 bpw uniforme | Esta cuantizacion | Ratio |
|---|---|---|---|
| code (40 x 2048 tokens) | 0,0250 | 0,0230 | 0,92x |
| text (20 x 2048 tokens) | 0,0500 | 0,0467 | 0,93x |
| chat (traza reservada, 45.930 tokens de respuesta) | 0,0330 | 0,0282 | 0,86x |
| long16k (prompts de 16K) | 0,0239 | 0,0215 | 0,90x |
| long120k (prompts de 120K) | 0,0152 | 0,0138 | 0,91x |
| Concordancia top-1 con BF16, code / text | 95,53 / 90,70 % | 95,72 / 91,04 % | - |

En Ferrite (arnes propio, prompts de 1024 tokens y 512 filas de decodificacion forzada):

| Configuracion | code | text | long16k |
|---|---|---|---|
| Un DGX Spark, pesos de prompt en bf16 | 0,0218 | 0,0466 | 0,025 |
| Dos DGX Spark, pesos de prompt NVFP4 | 0,0208 | 0,0401 | 0,024 |

Rendimiento en exllamav3 sobre RTX 5080 16 GB (un flujo, 500 tokens):

| | 3,0 bpw uniforme | Esta cuantizacion | Ganancia |
|---|---|---|---|
| Decodificacion plana | 57,2 tok/s | 57,5 tok/s | +0,5 % |
| Borrador MTP (4 tokens), codigo | 127,8 tok/s | 138,6 tok/s | +8,5 % |
| Borrador MTP (4 tokens), prosa | 94,1 tok/s | 101,6 tok/s | +8,0 % |

Rendimiento en Ferrite con dos DGX Spark (paralelismo tensorial sobre RoCE, NVFP4, DFlash2, 4 peticiones x 128K):

| Carga | Resultado |
|---|---|
| codigo, 1 peticion (2K / 32K de contexto) | 273 / 238 tok/s |
| codigo, 4 peticiones combinadas | 473 tok/s |
| ediciones de codigo, 1 / 4 peticiones | 582 / 481 tok/s |
| prosa, 1 peticion | 76 tok/s |
| procesamiento de prompt a 2K / 8K / 32K / 64K / 120K | 3.544 / 3.335 / 2.799 / 2.321 / 1.792 tok/s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 13,3 GB de pesos en disco; con cache KV FP16 y overhead de contexto la huella supera los 13,3 GB, por lo que encaja en GPUs de 16 GB en escenarios de contexto moderado.
- GPU recomendadas: NVIDIA DGX Spark (GB10), una o dos unidades para Ferrite; RTX 5080 de 16 GB como plataforma de referencia medida en exllamav3.
- Cabe en GPU de consumo: si, al menos en RTX 5080 de 16 GB, con cuantizacion EXL3 de 3,0 bpw.
- Opciones de despliegue: Ferrite (DGX Spark, servidor compatible con OpenAI), exllamav3 (Python, scripts, borrador MTP) y TabbyAPI (servidor compatible con OpenAI sobre GPU estandar).
- Latencia y throughput: 57,5 tok/s en decodificacion plana y hasta 138,6 tok/s con MTP en una RTX 5080; en dos DGX Spark, 273 tok/s en codigo con 2K de contexto y 1.792 tok/s de procesamiento de prompt a 120K.
- Requisito de version: exllamav3 1.6.1 o superior.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-EXL3-3.0bpw-mix | 6,65B en safetensors del repo (base ~27B) | medido a 120K, servido a 128K | EXL3 mixta 3,0 bpw | Apache-2.0 | Hugging Face, exllamav3, TabbyAPI, Ferrite |
| Qwen/Qwen3.8-27B (base) | ~27B, ~54 GB en BF16 | no disponible | BF16 | Apache-2.0 | Hugging Face |
| Cuantizacion EXL3 uniforme 3,0 bpw del mismo base | mismo base | no disponible | EXL3 uniforme 3,0 bpw | Apache-2.0 | mismo repositorio de medicion upstream |

La unica comparacion con datos concretos en la informacion disponible es frente a la cuantizacion uniforme de 3,0 bpw del mismo modelo base: esta version obtiene ratios de KL de 0,86x a 0,93x y lee 9,98 GB por token frente a 10,14 GB. No hay datos de benchmarks frente a otros modelos de la misma categoria.

## Limitaciones y advertencias

- El repositorio registra 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay validacion independiente de las cifras del autor.
- Las mediciones de KL y rendimiento provienen del propio autor y de arneses distintos (exllamav3 y Ferrite); el propio autor advierte que no deben compararse numeros entre tablas.
- La cuantizacion a 3,0 bpw introduce degradacion frente a BF16: la concordancia top-1 en texto es del 91,04 %, lo que implica divergencias en aproximadamente 1 de cada 11 tokens.
- Los idiomas soportados no estan documentados; no se puede garantizar calidad multilingue.
- El soporte de tool calling y de agentes no esta documentado en la informacion disponible.
- La torre de vision esta cuantizada a 6 bits pero Ferrite no la carga; el soporte multimodal efectivo no esta verificado.
- Requiere exllamav3 1.6.1 o superior; versiones anteriores pueden no cargar los pesos.
- El rendimiento publicado se midio en hardware concreto (RTX 5080, DGX Spark); el throughput en otras GPU puede diferir.
- Licencia Apache-2.0 permite uso comercial, pero se heredan las limitaciones y sesgos del modelo base, no documentados aqui.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BHCC2025/Qwen3.8-27B-EXL3-3.0bpw-mix
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de exllamav3: https://github.com/turboderp-org/exllamav3
- Motor Ferrite: https://github.com/BHCC2025/ferrite
- Guia de inicio de Ferrite: https://github.com/BHCC2025/ferrite/blob/main/docs/quickstart.md
- Paper de referencia (arxiv:2406.11235): https://arxiv.org/abs/2406.11235
