# davidxifeng/SenseNova-Loop-9B-AWQ-rk128

## Resumen

SenseNova-Loop-9B-AWQ-rk128 es un checkpoint multimodal de tipo image-text-to-text derivado de `sensenova/SenseNova-Loop-9B-AWQ`, publicado por el usuario `davidxifeng`. No se trata de un modelo entrenado desde cero, sino de un reempaquetado de pesos: mantiene los valores numericos del AWQ upstream y reorganiza el layout de cuantizacion a un formato propietario denominado `kajikiri_rk128`, pensado para carga sin transposicion en tiempo de ejecucion sobre Apple Silicon con Metal 4.

El modelo subyacente, SenseNova-Loop-9B, emplea una arquitectura poco convencional: 32 capas fisicas que se desenrollan en 56 pasos de ejecucion, con enrutamiento de dos flujos (mHC) y una torre de vision en BF16. El checkpoint tiene 9.536.855.664 parametros y se distribuye en 4 bits (AWQ), con un payload total de tensores de 5,68 GB repartidos en tres shards.

Su relevancia es acotada pero especifica: demuestra una via para ejecutar un modelo multimodal de ~9,5B en hardware de Apple con un formato de pesos optimizado para GEMV y MMA en Metal, incluyendo decodificacion especulativa con un drafter DFlash2. La licencia es Apache-2.0, heredada del upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con 32 capas fisicas desenrolladas en 56 pasos de ejecucion, enrutamiento de dos flujos mHC y torre de vision BF16 |
| Parametros totales | 9.536.855.664 |
| Parametros activos | no disponible (no se documenta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits AWQ (formato `kajikiri_rk128`); pesos no lineales y torre de vision en BF16/FP16 |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (3 shards, 995 tensores) |

## Arquitectura y entrenamiento

La arquitectura combina un cuerpo de lenguaje de 32 capas fisicas que se ejecutan como 56 pasos mediante un esquema de "loop" con enrutamiento de dos flujos mHC, mas una torre visual compuesta por 333 tensores en BF16 alojados integramente en el tercer shard. El checkpoint esta cuantizado en 4 bits con AWQ, donde las proyecciones lineales almacenan `qweight` como enteros de 32 bits con nibbles empaquetados, junto con escalas y ceros por grupo de 128 pesos a lo largo de la dimension K.

El reempaquetado `rk128` introduce tres cambios tecnicos: (1) layout planar contiguo en K con `qweight: U32 [N, K/8]` y pares `(scale, bias = -scale * zero)` preplegados en FP16, eliminando transposiciones en carga y habilitando kernels GEMV/MMA sin desplazamientos; (2) fusion horizontal de `mlp.gate_proj` y `mlp.up_proj` en `mlp.gate_up_proj [2*12288, 4096/8]` para un unico dispatch de SwiGLU; (3) separacion de la torre visual en un shard dedicado que puede omitirse en cargas solo-texto sin asignar slab en GPU. El autor afirma verificacion byte a byte de la generacion greedy frente al AWQ upstream, incluyendo decodificacion especulativa DFlash2. No se documentan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Procesamiento multimodal image-text-to-text mediante torre de vision BF16.
- Razonamiento y matematicas basicas (el autor incluye prompts de "explain" y "math" en sus pruebas).
- Generacion de codigo (se cita un prompt de Zig en las mediciones).
- Decodificacion especulativa compatible con un drafter externo DFlash2.
- Carga selectiva solo-texto omitiendo el shard de vision.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta modo thinking explicito ni capacidades de audio.

## Casos de uso

- Inferencia local en Apple Silicon: el formato `kajikiri_rk128` esta disenado para carga directa sin reempaquetado en Metal 4, lo que permite ejecutar el modelo en Macs con GPU integrada usando el runtime `kajikiri`.
- Asistente conversacional multimodal en escritorio: al aceptar image-text-to-text, puede responder preguntas sobre imagenes en una aplicacion local sin depender de la nube, con licencia Apache-2.0.
- Generacion de codigo asistida en entornos macOS: las mediciones del autor con prompts de Zig y la ventana de decodificacion de ~11-16 tok/s lo hacen viable para autocompletado interactivo, no para generacion masiva.
- Prototipado de pipelines de vision-lenguaje: la separacion de la torre visual en un shard permite cargar solo el cuerpo de lenguaje para tareas textuales, reduciendo el uso de memoria.
- Evaluacion de tecnicas de decodificacion especulativa: el checkpoint esta preparado para emparejarse con `SenseNova-Loop-9B-DFlash2`, sirviendo como banco de pruebas de speculative decoding en Metal.
- Despliegue en hardware con recursos limitados: con 5,68 GB de payload en 4 bits, encaja en equipos con 8-16 GB de memoria unificada, algo inviable para el modelo en BF16.
- Investigacion sobre formatos de cuantizacion: util para estudiar layouts AWQ alternativos (planar K-contiguo, gate+up fusionado) y su impacto en latencia.

## Benchmarks y rendimiento

El autor publica mediciones de latencia y throughput en Apple M3 (GPU de 10 nucleos, `-Doptimize=ReleaseFast`), no resultados de benchmarks academicos:

| Carga de trabajo | AWQ upstream | `rk128` + filtered slab | + DFlash2 (u8, T=7) |
|---|---:|---:|---:|
| Prefill corto (T=17..22) | 347,7–353,4 ms (48,1–63,1 tok/s) | 292,8–296,8 ms (57,7–74,1 tok/s) | no disponible |
| Prefill largo (T=554) | 6121,8 ms (90,5 tok/s) | 5669,5 ms (97,7 tok/s) | no disponible |
| Decode 96 tok (P1 explain) | 10,8 tok/s | 10,7 tok/s | 15,5 tok/s |
| Decode 96 tok (P2 math) | 10,7 tok/s | 11,0 tok/s | 16,5 tok/s |
| Decode 96 tok (P3 Zig) | 10,5 tok/s | 10,9 tok/s | 11,9 tok/s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el payload de tensores es de 5,68 GB (5,29 GiB); con overhead de runtime, se recomienda al menos 8 GB de memoria unificada o VRAM.
- Carga solo-texto: omitir el shard de vision (0,91 GB) reduce el requisito en aproximadamente 0,85 GiB.
- GPU recomendadas: el formato esta optimizado para Apple Silicon con Metal 4; las mediciones publicadas son en Apple M3 con GPU de 10 nucleos. No se documenta soporte para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente; no se confirma compatibilidad con GPUs NVIDIA consumer.
- Opciones de despliegue: runtime `kajikiri` (repositorio `qwen-image-zig`), con soporte de drafter DFlash2. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: prefill de ~293-297 ms para 17-22 tokens y ~5,7 s para 554 tokens; decode de ~10,7-11,0 tok/s sin drafter y ~11,9-16,5 tok/s con DFlash2 en M3.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-AWQ-rk128 | 9,54B | no disponible | 4 bits AWQ (`rk128`) | Apache-2.0 | Hugging Face, runtime `kajikiri` |
| sensenova/SenseNova-Loop-9B-AWQ | no disponible | no disponible | 4 bits AWQ (layout HF) | Apache-2.0 | Hugging Face |
| sensenova/SenseNova-Loop-9B | no disponible | no disponible | BF16 | Apache-2.0 | Hugging Face |
| Alternativas de ~9B multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a las variantes del mismo modelo base, ya que la informacion proporcionada no incluye datos de modelos competidores de tamano o tarea equivalente.

## Limitaciones y advertencias

- Modelo derivado y reempaquetado por un tercero (`davidxifeng`), no por el equipo de SenseNova; la trazabilidad y el mantenimiento dependen del autor del repo.
- El formato `kajikiri_rk128` es propietario y solo es utilizable con el runtime `kajikiri`; no es cargable directamente por vLLM, llama.cpp, TGI u Ollama.
- Solo se documentan idiomas ingles y chino; el rendimiento en castellano no esta verificado.
- Longitud de contexto no documentada, lo que impide planificar cargas de contexto largo con garantias.
- No se publican benchmarks academicos ni evaluaciones de sesgo o alucinacion; el riesgo de alucinacion debe asumirse como el de cualquier modelo de ~9B sin evaluacion publica.
- Las capacidades de tool calling y agentes no estan documentadas.
- El checkpoint omite tensores no referenciados (`loop_gate.logits` con `use_gate=false` y `mtp/`), por lo que no reproduce todas las funcionalidades potenciales del modelo base.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los pesos AWQ upstream antes de desplegar en produccion.
- Las mediciones de rendimiento provienen de un unico hardware (Apple M3); no son extrapolables a otras plataformas.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/davidxifeng/SenseNova-Loop-9B-AWQ-rk128
- Modelo base cuantizado: https://huggingface.co/sensenova/SenseNova-Loop-9B-AWQ
- Modelo base original: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Repositorio del runtime `kajikiri` (`qwen-image-zig`): no disponible como URL directa en la informacion proporcionada
- Drafter DFlash2 (`SenseNova-Loop-9B-DFlash2`): no disponible como URL directa en la informacion proporcionada
- Paper, blog o demo oficial: no disponible en la informacion proporcionada
