# Dankpaws/Inkling-2-Mini-DankAttn-w8

## Resumen

Inkling-2-Mini-DankAttn-w8 es un paquete de pesos preformateados del modelo `thinkingmachines/Inkling-2-Mini`, adaptado por el usuario Dankpaws para el motor de inferencia DankAttn sobre Apple Silicon con Metal 4. No se trata de un modelo nuevo ni de un fine-tune: es una redistribucion del modelo base en el formato propio de DankAttn (`pack-*.bin`), con las proyecciones densas recuantizadas a W8 y los expertos MoE enrutados conservados en sus formatos nativos originales (NVFP4 y MXFP8) sin deriva de recuantizacion.

El modelo base es un transformer MoE con 26,4 mil millones de parametros y un nucleo "looped": 24 capas fisicas que se ejecutan en 3 pasadas para dar 48 capas logicas, combinando 40 capas de atencion de ventana deslizante (SWA-1024) con 8 capas de atencion global. Incluye ademas un drafter especulativo MTP (multi-token prediction) de 3 capas denominado DSpark, empaquetado como overlay (`pack-mtp-00.bin`).

Su relevancia es acotada pero clara: permite ejecutar un MoE de ~26B en un MacBook Pro de 32 GB de memoria unificada con decodificacion especulativa bit-exacta, algo que en el ecosistema Apple Silicon resulta poco habitual a esta escala. La contrapartida es que el formato es propietario del motor: los pesos no cargan en Transformers, MLX ni llama.cpp, por lo que su utilidad queda ligada a DankAttn.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con nucleo looped (24 capas fisicas -> 48 logicas en 3 pasadas); 40 capas SWA-1024 + 8 capas de atencion global; drafter MTP DSpark de 3 capas |
| Parametros totales | 26,4 mil millones (modelo base) |
| Parametros activos | no disponible (top-8 de 128 expertos enrutados por capa, pero sin cifra oficial de parametros activos) |
| Longitud de contexto | Hasta 131.072 tokens (`INK_CAP=131072`); configuracion recomendada de 32.768 en equipos de 32 GB |
| Tipos de cuantizacion | Expertos MoE capas 0-19: NVFP4 nativo; capas 20-23: MXFP8 nativo; proyecciones de atencion y `lm_head`: W8; embeddings y proyecciones pequenas: BF16; normas, routers y queries de atencion residual: f32; KV cache global: int8 simetrico por cabeza (`kv8`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (motor DankAttn: MIT) |
| Formato de pesos | Pack propietario DankAttn (`pack-00.bin`, `pack-01.bin`, `pack-02.bin`, `pack-mtp-00.bin`) + `manifest.json`, `mtp_manifest.json`, `tokenizer.json`, `chat_template.jinja` |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer con mezcla de expertos (MoE) de tipo "looped": 24 capas fisicas que se reutilizan en 3 pasadas para producir 48 capas logicas efectivas, lo que incrementa la profundidad computacional sin aumentar el numero de parametros. De las 48 capas logicas, 40 emplean atencion de ventana deslizante de 1024 tokens (SWA-1024) y 8 emplean atencion global, una combinacion habitual para reducir coste de atencion manteniendo acceso a contexto largo. Cada capa enruta a 128 expertos con top-8.

Sobre el entrenamiento del modelo base no se proporciona informacion en la documentacion disponible: no se detallan volumen de tokens, composicion del dataset ni si hubo RLHF o DPO. Lo que si documenta el paquete es el proceso de cuantizacion y empaquetado: los expertos enrutados de las capas 0-19 se copian bit a bit desde el NVFP4 original (incluyendo `weight`, `weight_scale` y `weight_scale_2`), los de las capas 20-23 se copian bit a bit desde FP8 con escalas E8M0, y las proyecciones densas (`qgrs`, `k`, `v`, `o`, `lm_head`) se recuantizan a W8. La innovacion tecnica destacable es la verificacion especulativa bit-exacta: el autor reporta `0.000e+00` de diferencia entre decodificacion plana, verificacion multi-fila, batching multi-lane y restauracion de prefijo desde SSD, tanto a temperatura 0 como a temperatura 1.0 con `min_p=0.02`.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y generacion de codigo: el autor reporta rendimiento en "DSpark Code" dentro de su bake-off de servidor en vivo.
- Decodificacion especulativa con drafter MTP DSpark integrado, con verificacion bit-exacta.
- Batching multi-lane con prefijos compartidos (Split-KV) para servir varias secuencias en paralelo.
- Cache de prefijo persistente en SSD (`ctest`), con restauracion en 12,8 ms para 1,5k tokens y 20,9 ms para 8k tokens en M5 Ultra.
- Servidor compatible con la API de OpenAI en el puerto 8342, con modos `:4x-fast` y `:8x-fast` para relleno paralelo de secciones.
- Capacidades multilingues: no disponible.
- Tool calling / function calling: no documentado en la informacion disponible.
- Vision y audio: no disponibles.

## Casos de uso

- Asistente conversacional local en MacBook Pro: con 19,91 GB de pesos mapeados y ~21,3 GB totales a 32k de contexto, el modelo cabe en un equipo de 32 GB de memoria unificada, lo que permite desplegar un asistente privado sin conexion a servicios externos.
- Generacion de codigo en local con baja latencia: el bake-off del autor reporta 144,5 tok/s en carga de codigo en M5 Ultra y 43,6 tok/s greedy en M5 base, cifras suficientes para autocompletado interactivo y generacion de funciones en un IDE.
- Servicio de API compatible con OpenAI para equipos pequenos: el servidor `inkling2_serve.sh` expone un endpoint en el puerto 8342, de modo que herramientas existentes que hablan el protocolo de OpenAI pueden apuntar al Mac sin cambios de codigo.
- Procesamiento por lotes con contexto largo: con `INK_CAP=131072` y una sola lane en equipos de 32 GB, o con 8 lanes y 128k en equipos de 64-96 GB, se pueden procesar documentos largos o conversaciones extensas en una sola pasada.
- Servicio multiusuario ligero en Mac Studio: la configuracion de 8 lanes (128k principal + 7 lanes laterales de 16k con prefijo compartido) alcanza 317,1 tok/s con `jspec` de 4 lanes y 259,0 tok/s con 4 streams en vivo, adecuada para un equipo de trabajo pequeno.
- Relleno paralelo de secciones en pipelines de generacion estructurada: los modos `:4x-fast` y `:8x-fast` con SSE alcanzan 319,0 y 343,6 tok/s efectivos visibles, utiles para generar varias secciones de un documento de forma concurrente.
- Reanudacion rapida de sesiones: la cache de prefijo en SSD restaura 1,5k tokens en 12,8 ms (M5 Ultra) o 23,0 ms (M5 base), lo que reduce la latencia percibida al retomar conversaciones o tareas largas.

## Benchmarks y rendimiento

Calidad frente a la referencia:

| Metrica | Resultado |
|---|---|
| Divergencia KL vs. proyecciones densas BF16 | 0,00042 |
| Acuerdo top-1 vs. BF16 | 100% |
| MMLU (este pack) | 86,23% |
| MMLU (SGLang BF16-KV) | 85,96% |
| MMLU (llama.cpp IQ4_NL) | 84,04% |
| Verificacion especulativa (`vtest` / `ctest`) | 0,000e+00 (bit-exacta) |

Rendimiento por hardware:

| Carga de trabajo | M5 Ultra Mac Studio (96 GB) | Base M5 MacBook Pro (32 GB) |
|---|---|---|
| Prefill 2.048 / 8.192 / 32.768 tok | 4.588 / 4.288 / 3.371 tok/s GPU | 730 / 719 tok/s GPU (2k / 8k) |
| Decode plano M=1 (ctx 512 / 2k / 8k) | 90,6 / 88,2 / 86,9 tok/s wall | 25,3 / 24,4 / 24,0 tok/s wall |
| Servidor en vivo: DSpark Code / Prose | 144,5 / 114,4 tok/s | 43,6 tok/s greedy; 40,1 a T=1.0 |
| Multi-lane (`jspec` 4 lanes / 4 streams en vivo) | 317,1 / 259,0 tok/s | 65,8 tok/s (4 lanes, cap 8k) |
| Relleno paralelo (`:4x-fast` / `:8x-fast`, SSE) | 319,0 / 343,6 tok/s efectivos visibles | no disponible |
| Restauracion de cache de prefijo SSD (1,5k / 8k tok) | 12,8 ms / 20,9 ms | 23,0 ms (1,5k) |

No se han publicado resultados de benchmarks del modelo base (MMLU, HumanEval, GSM8K u otros) mas alla del dato de MMLU recogido arriba en la informacion disponible.

## Requisitos de hardware

- Plataforma obligatoria: Apple Silicon con Metal 4 y `MetalPerformancePrimitives`. No hay soporte para CUDA, ROCm ni CPU generica.
- Memoria unificada: 19,91 GB de pesos mapeados (incluido el overlay DSpark) mas estado GPU cableado.
  - ~1,38 GB de estado a `cap=32k`: ~21,3 GB totales, cabe en 32 GB de RAM.
  - ~3,37 GB de estado a `cap=128k`: ~23,3 GB totales, deja mas de 8,7 GB de margen en un MacBook Pro de 32 GB.
  - ~13,5 GB de estado para 8 lanes (128k principal + 7 lanes laterales de 16k) en equipos de 64-96 GB.
- Almacenamiento: ~19 GB en SSD local (`pack-00.bin` 8,0 GB, `pack-01.bin` 8,0 GB, `pack-02.bin` 2,4 GB, `pack-mtp-00.bin` 365 MB).
- GPU recomendadas: M5 Ultra (96 GB) para maxima concurrencia y contexto largo; M5 base (32 GB) para uso individual con `INK_CAP=32768` o `131072` y `INK_LANES=1`.
- Cabe en GPU de consumo: si, en el sentido de Apple Silicon de gama consumer (MacBook Pro M5 de 32 GB). No es compatible con RTX 4090, A100 ni H100.
- Opciones de despliegue: exclusivamente el motor DankAttn (build via `inkling2/build_inkling2.sh`) y su servidor `server/inkling2_serve.sh`. No compatible con vLLM, llama.cpp, Ollama, TGI, MLX ni Transformers.
- Latencia y throughput: ver tabla de benchmarks. En M5 Ultra, decode plano de 86,9-90,6 tok/s y prefill de 3.371-4.588 tok/s; en M5 base, decode de 24,0-25,3 tok/s y prefill de 719-730 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-DankAttn-w8 | 26,4B (MoE) | hasta 131.072 | Pack DankAttn, solo Apple Silicon Metal 4 | Apache 2.0 | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| thinkingmachines/Inkling-2-Mini (base) | 26,4B (MoE) | no disponible | Pesos upstream (Transformers y ecosistema estandar) | Apache 2.0 | Hugging Face |
| llama.cpp IQ4_NL sobre el mismo modelo base | 26,4B (MoE) | no disponible | GGUF, multiplataforma (CPU, CUDA, Metal) | Apache 2.0 (heredada) | Ecosistema llama.cpp |
| SGLang BF16-KV sobre el mismo modelo base | 26,4B (MoE) | no disponible | Safetensors + SGLang, GPUs NVIDIA | Apache 2.0 (heredada) | Ecosistema SGLang |

La comparacion relevante es contra el modelo base y sus despliegues alternativos: este pack iguala o supera ligeramente al BF16 de SGLang en MMLU (86,23% frente a 85,96%) y supera claramente a llama.cpp IQ4_NL (84,04%), pero a cambio pierde portabilidad total: solo funciona en Apple Silicon con DankAttn.

## Limitaciones y advertencias

- Formato propietario: los pesos no cargan en Transformers, MLX ni llama.cpp. Migrar a otro runtime exige volver al modelo base.
- Dependencia de un unico motor: DankAttn es un proyecto de un solo autor (MIT), sin el respaldo ni la madurez de vLLM, llama.cpp o SGLang. Riesgo de mantenimiento y de continuidad a tener en cuenta en produccion.
- Plataforma cerrada: requiere Apple Silicon con Metal 4. Sin soporte para NVIDIA, AMD ni CPU.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no documentado; aplica el riesgo habitual de un modelo de 26B sin datos publicados de evaluacion de fidelidad.
- Idiomas soportados: no disponibles. No se puede asumir un rendimiento multilingue sin evaluacion.
- Tool calling y uso agentico: no documentados. El tag `conversational` no garantiza soporte de function calling.
- Licencia: Apache 2.0, permite uso comercial, pero el motor DankAttn es MIT y su soporte no esta garantizado.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de los resultados reportados por el autor.
- Los benchmarks de rendimiento provienen exclusivamente de la model card del autor; no hay verificacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/Dankpaws/Inkling-2-Mini-DankAttn-w8
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio del motor DankAttn: https://github.com/Dankpaws/DankAttn
- Revision del modelo base referenciada: commit `b85c3cfa615fc413cc9af3379f491b963f3b586a`
