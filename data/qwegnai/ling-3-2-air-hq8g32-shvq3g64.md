# qwegnai/Ling-3.2-air-hq8g32-shvq3g64

## Resumen
Ling-3.2-air es un modelo multimodal de tipo image-text-to-text desarrollado por inclusionAI, con arquitectura `bailing_moe_v3_vl` de mezcla de expertos (MoE). Cuenta con 124.000 millones de parametros totales y 5.500 millones activos por token, junto con un codificador visual ViT de 27 capas y una ventana de contexto nativa de 262.144 tokens. Esta ficha describe el pack de pesos cuantizados publicado por el usuario qwegnai bajo el identificador `qwegnai/Ling-3.2-air-hq8g32-shvq3g64`, que no es el modelo original sino una reempaquetadura en formato propietario `QWP1` para el motor de inferencia Qwegn sobre Apple Silicon.

El pack aplica cuantizacion mixta: los expertos enrutados del MoE se comprimen con SHVQ3_G64 (3,25 bits por peso) y el tronco denso, las proyecciones KDA/MLA, la cabeza de salida, la capa NextN y el ViT se mantienen en HQ8_G32 (8,50 bits por peso). El resultado ocupa 52,23 GiB (3,41 bits por parametro) y esta disenado para residir al 100 % en la memoria unificada de un Mac de 128 GB, sin accesos a SSD en regimen estacionario.

Su relevancia actual radica en que demuestra la viabilidad de ejecutar un MoE multimodal de 124.000 millones de parametros en hardware de consumo de Apple con decodificacion especulativa NextN y latencias interactivas (del orden de 100 tok/s en decodificacion sostenida). No obstante, el formato es exclusivo del motor Qwegn (v0.36.0 o superior) y no es compatible con safetensors, GGUF ni MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `bailing_moe_v3_vl` (MoE multimodal con tronco hibrido KDA + MLA, ViT y capa NextN MTP) |
| Parametros totales | 124.000 millones |
| Parametros activos | 5.500 millones por token |
| Longitud de contexto | 262.144 tokens nativos (`rope_theta = 6.000.000`) |
| Tipos de cuantizacion | SHVQ3_G64 (expertos enrutados, 3,25 bpw); HQ8_G32 (tronco, proyecciones, `lm_head`, NextN, ViT, 8,50 bpw); BF16/F32 (embeddings, normas, routers, sesgos) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `QWP1` (contenedor propietario del motor Qwegn; no es safetensors, GGUF ni MLX) |
| Tamano del pack | 52,23 GiB (56.078.829.356 bytes, 64.116 tensores) |
| Bits por parametro efectivos | 3,41 |
| Vocabulario | 157.184 tokens |
| Dimension oculta | 2.560 |
| Capas del tronco | 42 (35 KDA de rango completo + 7 MLA con RoPE desacoplado) |
| Capas MoE | 40 con enrutamiento limitado por grupos (`512` expertos `top-8` + `1` compartido de 768, `n_group=8`, `topk_group=4`) |
| Capas densas | 2 (dimension 6.144) |
| Codificador visual | ViT de 27 capas, 1.152 dimensiones, 16 cabezas, VideoRoPE 3D `[8, 12, 12]` |
| Capa especulativa | NextN MTP (L42) |
| Modos de cache KV | `q4` (2.800 B/token), `q8` (4.508 B/token), `f16` (8.064 B/token) |

## Arquitectura y entrenamiento
El modelo combina dos mecanismos de atencion en el tronco: 35 capas con KDA (Kimi Delta Attention, con `no_kda_lora`, `conv_k=4` y `kda_lower_bound=-5`) y 7 capas con MLA (Multi-head Latent Attention) de KV latente de 512 dimensiones, 32 cabezas, 128 dimensiones NoPE y 64 dimensiones con RoPE intercalado. La parte MoE usa enrutamiento limitado por grupos con 512 expertos enrutados (top-8) mas un experto compartido de 768 dimensiones, con clamp SwiGLU por capa en las capas L35-L41. Incorpora una capa NextN de prediccion multi-token (L42) que habilita decodificacion especulativa. El codificador visual es un ViT de 27 capas con proyeccion lineal GELU de 2 capas y VideoRoPE 3D, lo que permite entrada de imagen y video.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el material proporcionado. La innovacion tecnica destacable de este pack es la cuantizacion mixta con Spherical Hadamard Vector Quantization a 3,25 bpw sobre los expertos, combinada con decodificacion especulativa NextN que eleva el rendimiento de 76-78 tok/s en decodificacion serial a 99-104 tok/s.

## Capacidades
- Generacion de texto y razonamiento multi-turno con contexto largo de hasta 262.144 tokens.
- Procesamiento multimodal image-text-to-text: entrada de imagenes y video mediante ViT con VideoRoPE 3D.
- Generacion de codigo: el ejemplo de la model card incluye la escritura de un ring buffer lock-free en C11.
- Decodificacion especulativa NextN MTP con aceptacion del 95,4-100 % y 1,90-1,98 tokens por paso.
- Servidor compatible con las APIs de OpenAI y Anthropic, con soporte de `image_url` multimodal.
- Cache de prefijo con reutilizacion caliente (37 ms frente a 124 ms en frio, factor 14,5x).
- Modos de cache KV conmutables (`q4`, `q8`, `f16`) con paridad SHA-256 del 100 % entre modos.
- Recuperacion en contexto largo: 3 de 3 agujas recuperadas a 16,9K tokens con KV `q4`.
- No se especifica soporte explicito de tool calling ni de razonamiento agente multi-paso en la informacion disponible; la conformidad agente medida es del 76,1 % (67/88).

## Casos de uso
- Inferencia local en Mac de 128 GB: el pack reside al 100 % en memoria unificada (49,22 GiB de pesos, 50,09-50,12 GiB de RAM en CLI con `mtp=0`), lo que permite ejecutar un MoE de 124.000 millones de parametros sin GPU dedicada ni offload a SSD.
- Asistente de codigo en estaciones de trabajo Apple: con 76-104 tok/s de decodificacion y compatibilidad con APIs de OpenAI y Anthropic, se puede conectar a extensiones de editor o pipelines de CI/CD que consuman un endpoint local.
- Analisis de documentos e imagenes de gran extension: la ventana de 262.144 tokens y el ViT de 27 capas permiten procesar lotes de imagenes junto con texto largo en una sola pasada.
- Servidor de inferencia multiusuario ligero: `qwg serve` con `--context-tokens 65536`, ViT y 4 GiB de cache caliente ocupa 54,96 GiB, adecuado para un equipo de desarrollo que comparta un Mac Studio o MacBook de gama alta.
- Procesamiento de video con contexto temporal: VideoRoPE 3D `[8, 12, 12]` habilita tareas de descripcion y comprension de secuencias de video junto con instrucciones textuales.
- Recuperacion aumentada con contexto largo: la cache de prefijo caliente (37 ms) y la recuperacion 3/3 a 16,9K tokens lo hacen apto para sistemas RAG que reutilicen documentos de referencia entre consultas.
- Evaluacion e investigacion de cuantizacion: sirve como banco de pruebas para comparar SHVQ3_G64 frente a HQ8_G32 y medir el impacto de la decodificacion especulativa en fidelidad (98,04 % frente al oraculo PyTorch FP16).

## Benchmarks y rendimiento
Rendimiento medido por el autor en un Apple M5 Max (`Mac17,6`, 128 GB de memoria unificada, GPU Apple10 NAX de 40 nucleos, macOS 26+) con `--kv-mode q4 --temperature 0 --no-profile`. No son resultados comparables con MMLU, HumanEval o GSM8K; son metricas de motor de inferencia.

| Metrica | Resultado |
|---|---|
| Prefill `llmprobe` (512 / 4,1K / 8,3K / 10,4K / 16,3K) | 1.946 / 2.847 / 2.292 / 2.141,4 / 1.651 tok/s |
| TTFT en frio / cache de prefijo caliente | 124 ms / 37 ms (14,5x) |
| Decodificacion serial CLI (`mtp=0`, `f16`/`q8`/`q4`) | 76,16-78,30 tok/s |
| Decodificacion especulativa NextN CLI (`mtp=1`) | 99,41-103,74 tok/s (aceptacion 95,4-100 %, 1,90-1,98 tok/paso) |
| Decodificacion especulativa `qwg serve` | 100,0 tok/s (deriva del +1,6 % en regimen estacionario) |
| `llmprobe` especulativo (predecible / novedoso) | 110,5 tok/s (1,98 tok/paso) / 86,0 tok/s (1,29x) |
| Fidelidad frente a oraculo PyTorch FP16 de 2 capas | diferencia maxima absoluta < 5e-3, paridad de argmax del 100 % |
| Conformidad de API `llmprobe v0.6.16 --full` | 285/293 (97,3 %) |
| Capacidad / fidelidad / agente | 100 % / 98,04 % (36/36) / 76,1 % (67/88) |
| Recuperacion de 3 agujas a 16,9K, KV `q4` | 3/3 (100 %) |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware
- Memoria unificada: 128 GB recomendados para residencia total; el pack de pesos ocupa 49,22 GiB (sin NextN) o 50,42 GiB (con NextN `mtp=1`). El servidor con ViT y 4 GiB de cache requiere 54,96 GiB.
- GPU: Apple Silicon con Metal 4; las mediciones se realizaron en un M5 Max de 40 nucleos. No se documenta soporte para GPU NVIDIA (A100, H100, RTX 4090) ni AMD, ya que el runtime Qwegn es exclusivo de Apple Silicon.
- Cache KV por token: 2.800 B en `q4`, 4.508 B en `q8` y 8.064 B en `f16`; a 65.536 tokens de contexto con `q4` esto supone aproximadamente 175 MiB.
- Despliegue: exclusivamente mediante el motor Qwegn v0.36.0 o superior (`qwg pull`, `qwg run`, `qwg serve`). No es compatible con vLLM, llama.cpp, Ollama, TGI ni MLX.
- Throughput: prefill de 1.651-2.847 tok/s segun longitud; decodificacion de 76-78 tok/s en serial y 99-104 tok/s con NextN. Cero asignaciones en regimen estacionario y cero fallos de SSD.

## Comparativa con modelos similares
No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Formato / runtime | Licencia |
|---|---|---|---|---|
| Ling-3.2-air (original, inclusionAI) | 124 B totales / 5,5 B activos | 262.144 | no disponible en esta ficha | no disponible en esta ficha |
| Ling-3.2-air-hq8g32-shvq3g64 (este pack) | 124 B totales / 5,5 B activos | 262.144 | `QWP1`, solo Qwegn en Apple Silicon | MIT |
| Alternativas de cuantizacion para Apple Silicon (GGUF/MLX) | no disponible | no disponible | GGUF / MLX | no disponible |

No se han identificado en la informacion disponible otros packs cuantizados del mismo modelo base ni alternativas equivalentes de 124 B multimodales para memoria unificada de Apple.

## Limitaciones y advertencias
- El formato `QWP1` solo carga en el motor Qwegn v0.36.0 o superior; no es interoperable con safetensors, GGUF ni MLX, lo que limita su uso a macOS sobre Apple Silicon.
- Requiere 128 GB de memoria unificada para residencia total; en equipos con menos memoria no se documenta el comportamiento (no hay datos de offload parcial).
- La cuantizacion SHVQ3_G64 a 3,25 bpw introduce perdida respecto al modelo original; la fidelidad medida frente a un oraculo de 2 capas es del 98,04 %, no frente al modelo completo en BF16.
- La conformidad agente es del 76,1 % (67/88), inferior a la conformidad de API (97,3 %), por lo que no se recomienda para flujos agente complejos sin validacion.
- No se dispone de informacion sobre sesgos, idiomas soportados ni riesgo de alucinacion especifico del modelo base en el material proporcionado.
- El pack tiene 0 descargas y 0 likes, y fue creado el 24 de noviembre de 2026; no cuenta con validacion independiente de terceros.
- La licencia MIT se hereda del modelo base, pero conviene verificar las condiciones del modelo original de inclusionAI antes de un uso comercial.
- El rendimiento reportado proviene de un unico equipo (M5 Max) y de mediciones del propio autor; no se ha replicado de forma independiente.

## Enlaces
- Pack en Hugging Face: https://huggingface.co/qwegnai/Ling-3.2-air-hq8g32-shvq3g64
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.2-air
- Motor de inferencia Qwegn: https://github.com/qwegnai/qwegn
