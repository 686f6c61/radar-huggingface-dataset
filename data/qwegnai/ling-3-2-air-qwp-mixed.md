# qwegnai/Ling-3.2-air-QWP-Mixed

## Resumen

Ling-3.2-air-QWP-Mixed es un empaquetado de pesos cuantizados del modelo multimodal Ling-3.2-air, desarrollado originalmente por inclusionAI y redistribuido por el usuario qwegnai para el motor de inferencia Qwegn. El modelo base es un transformer con arquitectura MoE (mixture of experts) de tipo `bailing_moe_v3_vl`, con 124.000 millones de parametros totales y 5.500 millones activos por token, disenado para tareas de imagen-texto a texto con contexto nativo de 262.144 tokens.

El pack emplea una estrategia de cuantizacion mixta propietaria que combina SHVQ3_G64 (Spherical Hadamard Vector Quantization a 3,25 bits por peso) para los expertos enrutados y HQ8_G32 (8,5 bits por peso) para el tronco denso, las proyecciones KDA/MLA, el `lm_head`, la capa NextN y el codificador visual ViT. El resultado es un archivo de 52,23 GiB (3,41 bits por parametro) que cabe integramente en la memoria unificada de un Mac con 128 GB.

La relevancia de este pack es doble: por un lado demuestra que un modelo MoE de 124B puede ejecutarse completamente residente en hardware Apple Silicon de gama alta; por otro, introduce un contenedor propietario (`QWP1`) que solo carga en el motor Qwegn v0.36.0 o superior, lo que limita su portabilidad frente a formatos estandar como GGUF o safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `bailing_moe_v3_vl` (transformer MoE multimodal con KDA, MLA y ViT) |
| Parametros totales | 124 B |
| Parametros activos | 5,5 B por token |
| Longitud de contexto | 262.144 tokens (`rope_theta = 6.000.000`) |
| Tipos de cuantizacion | SHVQ3_G64 (expertos enrutados, 3,25 bpw), HQ8_G32 (tronco denso, 8,5 bpw), BF16 y F32 (embeddings, normas, routers) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `QWP1` (contenedor propietario de Qwegn; no es safetensors, GGUF ni MLX) |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura `bailing_moe_v3_vl` con 42 capas en el tronco: 35 capas KDA de rango completo (sin LoRA en KDA, `conv_k=4`, `kda_lower_bound=-5`) y 7 capas MLA con RoPE desacoplado y latente KV de 512 dimensiones, 32 cabezas, 128 dimensiones NoPE y 64 dimensiones de RoPE entrelazado. El bloque MoE se compone de 2 capas densas (6144) y 40 capas Group-Limited MoE con 512 expertos enrutados top-8 mas 1 experto compartido de 768, `n_group=8`, `topk_group=4` y clamp SwiGLU por capa en las capas L35–L41. Incluye una capa NextN MTP (L42) para decodificacion especulativa y un ViT de 27 capas y 1152 dimensiones con 16 cabezas, proyeccion lineal GELU de 2 capas y VideoRoPE 3D `[8, 12, 12]`. La dimension oculta es 2560 y el vocabulario 157.184 tokens.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. La innovacion tecnica destacable de este pack es la combinacion de cuantizacion mixta (SHVQ3 para expertos, HQ8 para el resto) con decodificacion especulativa NextN, que eleva el throughput de decodificacion de 76–78 tok/s a 99–104 tok/s en CLI y 100 tok/s en servidor, con tasas de aceptacion del 95,4–100 % y 1,90–1,98 tokens por paso.

## Capacidades

- Generacion de texto y razonamiento multi-turno con contexto de hasta 262.144 tokens.
- Procesamiento multimodal imagen-texto a texto mediante el ViT de 27 capas integrado.
- Razonamiento de multiples pasos y soporte de agentes (puntuacion agentica 67/88, 76,1 % en la suite `llmprobe`).
- Decodificacion especulativa NextN con estrategia neural para acelerar la generacion.
- Tool calling y function calling a traves del servidor local compatible con OpenAI y Anthropic.
- Capacidades de codigo (el ejemplo de la model card genera un ring buffer C11 lock-free).
- Soporte de cache de prefijo caliente con reutilizacion de 14,5x (535 ms a 37 ms).
- Modos de KV cache configurables (`q4`, `q8`, `f16`) con paridad SHA-256 entre modos.
- Recall de aguja en contexto largo verificado (3/3 a 16,9K tokens).

## Casos de uso

- Asistencia de codigo en local: el modelo puede generar codigo C11, Rust o Swift con contexto largo de repositorio, aprovechando los 262.144 tokens de ventana para incluir multiples archivos en el prompt y la decodificacion especulativa para reducir la latencia percibida.
- Analisis de documentos extensos con imagenes: gracias al ViT y al contexto largo, se pueden procesar informes escaneados, diagramas tecnicos o capturas de pantalla junto con el texto completo del documento en una sola pasada.
- Agentes autonomos locales: la puntuacion agentica del 76,1 % y el soporte de tool calling via servidor compatible con OpenAI permiten construir pipelines de agentes que no salen del Mac, con 0 asignaciones en estado estacionario.
- Servidor de inferencia privado: `qwg serve` expone una API compatible con OpenAI y Anthropic con 100 tok/s sostenidos y 54,96 GiB de RAM residente, adecuado para equipos que requieran confidencialidad total sin GPU dedicada.
- Prototipado multimodal en Apple Silicon: investigadores pueden validar flujos imagen-texto con un modelo de 124B en un unico Mac de 128 GB, sin necesidad de cluster ni de GPU NVIDIA.
- RAG sobre corpus largos: la cache de prefijo caliente (37 ms) y el recall verificado a 16,9K tokens permiten indexar y consultar bases documentales con reutilizacion eficiente del contexto entre consultas.
- Generacion de documentacion tecnica multilingue: aunque los idiomas no estan declarados oficialmente, el vocabulario de 157.184 tokens sugiere cobertura amplia; conviene validar el rendimiento en castellano antes de produccion.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Prefill `llmprobe` (512 / 4,1K / 8,3K / 10,4K / 16,3K) | 1.946 / 2.847 / 2.292 / 2.141,4 / 1.651 tok/s |
| TTFT en frio / cache de prefijo caliente | 124 ms / 37 ms (14,5x) |
| Decodificacion estandar (CLI `mtp=0`) | 76,16–78,30 tok/s |
| Decodificacion especulativa NextN (CLI `mtp=1`) | 99,41–103,74 tok/s (aceptacion 95,4–100 %, 1,90–1,98 tok/paso) |
| Decodificacion especulativa NextN (`qwg serve`) | 100,0 tok/s (99,1–100,7, deriva estable +1,6 %) |
| `llmprobe` especulativo (predecible / novedoso) | 110,5 tok/s (1,98 tok/paso) / 86,0 tok/s (1,29x) |
| Oracle PyTorch FP16 de 2 capas | < 5e-3 de diferencia maxima absoluta, 100 % paridad argmax greedy |
| Conformidad `llmprobe v0.6.16 --full` | 100 % capacidad (`strong`), 98,04 % fidelidad (36/36), 285/293 API (97,3 %), 67/88 agentico (76,1 %) |
| Recall 3 agujas a 16,9K (`q4` KV) | 3/3 (100 %) |

Todas las mediciones se realizaron en un Apple M5 Max (Mac17,6) con 128 GB de memoria unificada, GPU Apple10 NAX de 40 nucleos, macOS 26+ y `--kv-mode q4 --temperature 0 --no-profile`. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM unificada: 49,22 GiB solo pesos (sin NextN ni vision), 50,42 GiB con NextN `mtp=1`, 54,96 GiB con servidor `qwg serve` incluyendo ViT y 4 GiB de cache caliente.
- Memoria por token de KV cache: 2.800 B en `q4`, 4.508 B en `q8`, 8.064 B en `f16`.
- Hardware verificado: Apple M5 Max con 128 GB de memoria unificada y GPU Apple10 NAX de 40 nucleos, con residencia del 100 % y 0 fallos de SSD.
- No cabe en GPU de consumo tipo RTX 4090 (24 GB) ni en Mac de 64 GB; requiere un Mac con 128 GB o superior.
- Despliegue exclusivo via Qwegn v0.36.0+: CLI `qwg run` o servidor `qwg serve` (compatible con OpenAI y Anthropic). No es compatible con vLLM, llama.cpp, Ollama, TGI ni MLX.
- Throughput medido: 2.847 tok/s de prefill a 4,1K, 100 tok/s de decodificacion sostenida con NextN, TTFT caliente de 37 ms.
- Estrategia de descarga: `qwg pull qwegnai/Ling-3.2-air-QWP-Mixed` instala el pack en `~/.qwg/models/`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Ling-3.2-air-QWP-Mixed (este pack) | 124 B totales / 5,5 B activos | 262.144 | QWP1 (propietario) | MIT | Apple Silicon 128 GB |
| inclusionAI/Ling-3.2-air (base) | 124 B totales / 5,5 B activos | 262.144 | safetensors (presumiblemente) | MIT | GPU con VRAM suficiente |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo base sin cuantizar ni de alternativas comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- El pack solo carga en Qwegn v0.36.0 o superior; no es compatible con safetensors, GGUF, MLX, vLLM, llama.cpp, Ollama ni TGI, lo que limita drasticamente su portabilidad.
- Requiere un Mac con 128 GB de memoria unificada; no es viable en hardware con menos RAM ni en GPUs NVIDIA.
- La cuantizacion SHVQ3 a 3,25 bits por peso en los expertos introduce perdida de precision respecto al modelo base; la fidelidad medida es del 98,04 % (36/36), no del 100 %.
- No se declaran idiomas soportados oficialmente; el rendimiento multilingue, y en particular en castellano, no esta verificado.
- No hay datos publicados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) que permitan comparar con otros modelos de forma objetiva.
- Riesgo de alucinacion inherente a los modelos de lenguaje; la puntuacion agentica del 76,1 % sugiere margen de error en tareas de multiples pasos.
- La licencia MIT del pack se hereda del modelo base, pero conviene verificar las condiciones del modelo original inclusionAI/Ling-3.2-air antes de uso comercial.
- El autor del pack (qwegnai) no es el desarrollador original del modelo; el soporte y las garantias dependen de la comunidad del motor Qwegn.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion independiente por parte de la comunidad.

## Enlaces

- Pack en Hugging Face: https://huggingface.co/qwegnai/Ling-3.2-air-QWP-Mixed
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.2-air
- Motor Qwegn (GitHub): https://github.com/qwegnai/qwegn
