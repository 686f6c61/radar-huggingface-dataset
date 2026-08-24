# pugant/Qwen3.8-27B-MTP-Q4_0_ROCMFP4_STRIX_LEAN

## Resumen

`pugant/Qwen3.8-27B-MTP-Q4_0_ROCMFP4_STRIX_LEAN` es una cuantización GGUF del modelo denso Qwen3.8-27B de Alibaba, preparada específicamente para el fork ROCmFPX de llama.cpp y optimizada para hardware AMD Strix Halo (gfx1151, RDNA 3.5). El autor, pugant, ha aplicado un esquema de cuantización híbrido `Q4_0_ROCMFP4` (4,34 bits por peso efectivos, 13,82 GiB) que combina tipos GGML personalizados para reducir el ancho de banda consumido por token en la memoria unificada LPDDR5X de 270 GB/s de los procesadores Ryzen AI Max+ 395.

El modelo base Qwen3.8-27B emplea una arquitectura de atención híbrida: 48 capas con atención lineal recurrente (gated-deltanet) y 16 capas de atención completa, con un intervalo de atención completa de 4. Esta cuantización incluye además la capa MTP (multi-token prediction) del modelo original, lo que permite activar decodificación especulativa nativa mediante el flag `--spec-type draft-mtp` del fork ROCmFPX, alcanzando hasta 3,2× la velocidad de decodificación plana en contenido estructurado.

La relevancia de este archivo radica en que demuestra el rendimiento práctico de la familia Qwen3.8 en hardware AMD de gama alta integrada, un segmento donde la optimización de ancho de banda es crítica. No obstante, es importante señalar que este GGUF no es compatible con llama.cpp estándar: requiere un build del fork ROCmFPX (el runtime del laboratorio de pugant o el upstream de charlie12345) que incluya los tipos GGML personalizados y los kernels de deltanet.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense hybrid-attention: 48 capas gated-deltanet + 16 capas full-attention, `full_attention_interval = 4` |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos (configuración recomendada en el ejemplo: 32.768) |
| Tipos de cuantizacion | Q4_0_ROCMFP4 (4,34 BPW efectivo, 13,82 GiB); existe también versión imatrix del mismo autor |
| Idiomas soportados | Inglés y multilingüe (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF con tipos GGML personalizados del fork ROCmFPX (`q4_0_rocmfp4`, K/V protection, Q5_K token embeddings) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es el miembro denso de 27.000 millones de parámetros de la familia Qwen3.8, que comparte el backbone de atención híbrida con el modelo MoE insignia de 2,4 billones de parámetros. De las 64 capas totales, solo 16 ejecutan atención completa (con un intervalo de 4 capas), mientras que las otras 48 utilizan atención lineal con un estado recurrente constante (gated-deltanet). Esta mezcla reduce el coste computacional y de memoria frente a un transformer denso clásico, manteniendo la capacidad de modelar dependencias de largo alcance mediante las capas de atención completa intercaladas.

La cuantización aplicada por pugant no modifica la arquitectura, pero introduce tipos de tensor específicos del fork ROCmFPX: `q4_0_rocmfp4` para los pesos, protección de K/V y embeddings de tokens en Q5_K. El archivo incluye la capa MTP (`blk.64` con tensores `nextn.*` y `nextn_predict_layers = 1`), que permite decodificación especulativa sin necesidad de un modelo drafter externo. Los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada; el repositorio oficial de Alibaba indica que es un modelo multimodal nativo, aunque esta cuantización se publica únicamente para generación de texto.

## Capacidades

- Generación de texto y razonamiento multilingüe, con soporte nativo de inglés y otros idiomas (etiqueta `multilingual`).
- Decodificación especulativa MTP integrada: la capa `nextn` permite predecir múltiples tokens por paso, acelerando la generación en contenido determinista y estructurado.
- Soporte de tool calling y flujos agénticos: el modelo base Qwen3.8-27B está diseñado para agentes y automatización de oficina, según el repositorio oficial de Alibaba.
- Capacidad de contexto largo: 262.144 tokens nativos, adecuado para RAG, análisis de documentos extensos y conversaciones multi-turno.
- Compatibilidad con el drafter externo DFlash2 (1,9B, Q4_K_M ≈ 1,1 GB) para decodificación por difusión de bloques, disponible en el runtime del laboratorio de pugant.
- El modelo base es multimodal nativo (imagen y texto), aunque esta cuantización GGUF se distribuye solo para tareas de texto.

## Casos de uso

- Asistente de programación local en hardware AMD integrado: con `--spec-type draft-mtp --spec-draft-n-max 6`, el modelo alcanza hasta 43,7 tok/s en contenido determinista (código), lo que lo hace utilizable como autocompletado en IDE o agente de generación de código en una estación de trabajo Strix Halo.
- RAG sobre documentación técnica extensa: la ventana de 262K tokens permite indexar manuales, papers o bases de conocimiento completas sin fragmentación, con decodificación MTP para respuestas estructuradas.
- Automatización de oficina y generación de informes: el modelo base está orientado a tareas de oficina (redacción, resumen, extracción de datos), y la cuantización Q4_0_ROCMFP4 permite ejecutarlo en memoria unificada sin GPU discreta.
- Agente conversacional multilingüe: con contexto largo y tool calling, puede gestionar conversaciones multi-turno con acceso a APIs externas, desplegado en un servidor llama.cpp del fork ROCmFPX.
- Desarrollo de prototipos de agentes con razonamiento multi-paso: la combinación de MTP y el drafter DFlash2 permite experimentar con decodificación especulativa avanzada en un entorno de laboratorio.
- Inferencia de texto en entornos con restricciones de energía: al ser un modelo denso de 27B cuantizado a 4,34 BPW, cabe en los 128 GB unificados del Ryzen AI Max+ 395 sin necesidad de GPUs dedicadas, reduciendo el consumo frente a configuraciones discretas.

## Benchmarks y rendimiento

Los benchmarks publicados por el autor se obtuvieron en un AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151, 128 GB unificados LPDDR5X), ventana exclusiva de GPU, el 2026-08-15. Método: `llama-bench -ngl 999 -fa on -p 512 -n 128` para el modo plano; para MTP, `llama-server --spec-type draft-mtp --spec-draft-n-max 2 --spec-draft-p-min 0.75 --spec-draft-p-split 0.10` con dos ejecuciones tras calentamiento.

| Test | Qwen3.8-27B (este archivo) | Qwen3.6-27B | Backend |
|---|---:|---:|---|
| plain tg128 | 13,77 ± 0,02 | 13,51 ± 0,40 | ROCm |
| plain pp512 | 354,7 | 344,1 | ROCm |
| MTP n-max 2 — prosa | 18,4 / 19,1 | 17,2 / 17,2 | ROCm |
| MTP n-max 2 — determinista | 27,3 / 22,0 | 20,2 / 20,5 | ROCm |
| plain tg128 | 8,97 | 8,92 | Vulkan RADV |
| plain pp512 | 319,8 | 324,8 | Vulkan RADV |
| MTP n-max 2 — prosa | 14,1 / 13,1 | 14,2 / 13,6 | Vulkan RADV |
| MTP n-max 2 — determinista | 19,9 / 17,0 | 16,5 / 17,3 | Vulkan RADV |

Barrido de n-max para este archivo (p_min 0,75, dos ejecuciones por prompt):

| n-max | ROCm prosa | ROCm determinista | Vulkan prosa | Vulkan determinista |
|---:|---:|---:|---:|---:|
| plano | 13,8 | 13,8 | 9,0 | 9,0 |
| 2 | 18,4 / 19,1 | 27,3 / 22,0 | 14,1 / 13,1 | 19,9 / 17,0 |
| 4 (equilibrado) | 19,4 / 17,1 | 38,4 / 22,6 | 17,7 / 18,4 | 35,5 / 19,0 |
| 6 (estructurado) | 18,1 / 17,6 | 41,9 / 30,9 | 18,4 / 17,2 | 43,7 / 25,6 |

La aceptación por posición muestra que en prosa las posiciones 3+ rara vez se aceptan (0,21/0,09 en n-4), por lo que la velocidad se estabiliza en ~18-19 tok/s; en contenido determinista la aceptación se mantiene alta hasta el final del draft (n-6: 0,99, 0,90, 0,86, 0,83, 0,82, 0,80; longitud media aceptada 6,2), de ahí los 43,7 tok/s (3,2× la decodificación plana). El autor recomienda n-max 4 por defecto y n-max 6 para código, RAG o contenido estructurado.

## Requisitos de hardware

- VRAM estimada: 13,82 GiB para los pesos; con contexto de 32.768 tokens y K/V en memoria unificada, el consumo total ronda los 15-16 GiB. En un sistema Strix Halo con 128 GB unificados no supone un problema.
- GPU objetivo: AMD Radeon 8060S (gfx1151, RDNA 3.5) integrada en el Ryzen AI Max+ 395. Probado únicamente en este hardware; el autor advierte que no se ha validado en otras GPUs.
- No cabe en GPUs consumer típicas de 8-12 GB VRAM si se usa el backend ROCm; con Vulkan podría intentarse en GPUs con 16 GB, pero no está soportado oficialmente.
- Opciones de despliegue: llama.cpp fork ROCmFPX (build del laboratorio de pugant o upstream de charlie12345), con backend HIP (ROCm) o Vulkan. No compatible con llama.cpp estándar ni con vLLM, Ollama o TGI.
- Latencia y throughput: decodificación plana de 13,8 tok/s en ROCm y 9,0 tok/s en Vulkan; con MTP n-max 4, 19,4 tok/s en prosa y 38,4 tok/s en contenido determinista (ROCm). Prefill de 512 tokens a 354,7 tok/s en ROCm.
- El autor recomienda elegir backend según la clase de modelo: para densos de 27B, ROCm supera a Vulkan en decodificación (+53%); para MoE fp4 de 35B, Vulkan es superior.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Decodificación plana (ROCm) | MTP determinista (ROCm) |
|---|---|---|---|---|---|
| Qwen3.8-27B (este archivo) | 27,3B denso | 262K | Apache 2.0 | 13,8 tok/s | 38,4 tok/s (n-max 4) |
| Qwen3.6-27B | 27B denso | no disponible | Apache 2.0 | 13,5 tok/s | 20,2 tok/s (n-max 2) |
| Qwen3.8-35B-A3B (MoE fp4) | 35B total, 3B activos | no disponible | Apache 2.0 | 71,2 tok/s (Vulkan) | no disponible |

Frente a Qwen3.6-27B, el Qwen3.8-27B gana en MTP en todos los escenarios: +25-35% en contenido determinista y +8-11% en prosa sobre ROCm, +20% en determinista sobre Vulkan, con la prosa empatada. La decodificación plana es idéntica y limitada por ancho de banda. Frente al MoE Qwen3.8-35B-A3B, el modelo denso es más lento en decodificación plana, pero el autor señala que la elección de backend cambia según la clase de modelo (ROCm para densos, Vulkan para MoE fp4).

## Limitaciones y advertencias

- Incompatibilidad con llama.cpp estándar: el archivo usa tipos GGML personalizados (`q4_0_rocmfp4`, protección K/V, Q5_K embeddings) y no cargará en builds oficiales (error `invalid ggml type`). Requiere el fork ROCmFPX.
- Hardware objetivo restringido: probado únicamente en AMD Strix Halo (gfx1151, Radeon 8060S). No hay garantías de funcionamiento en otras GPUs AMD o NVIDIA.
- FP4 sin soporte nativo en silicio: RDNA 3.5 no tiene unidades FP4; la cuantización es una estrategia de reducción de ancho de banda, no de aceleración por hardware.
- Sesgos y alucinaciones: no se han publicado evaluaciones de sesgo o fiabilidad para esta cuantización; como modelo de 27B, puede alucinar en tareas de razonamiento complejo o factualidad.
- Limitaciones de idioma: aunque se etiqueta como multilingüe, el rendimiento fuera del inglés no está documentado en esta ficha.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el despliegue depende de un fork de llama.cpp con mantenimiento comunitario, lo que introduce riesgo de soporte.
- La capa MTP y el drafter DFlash2 requieren flags específicos y builds concretos; la configuración óptima (n-max, p-min, p-split) depende del tipo de contenido y debe ajustarse por prueba.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pugant/Qwen3.8-27B-MTP-Q4_0_ROCMFP4_STRIX_LEAN
- Versión imatrix del mismo autor: https://huggingface.co/pugant/Qwen3.8-27B-imatrix
- Repositorio oficial del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Análisis del flag MTP en Qwen3.8-27B: https://github.com/sudoingX/qwen38-mtp
- Runtime del laboratorio de pugant (fuente del build ROCmFPX): https://github.com/pugant/strix-halo-llamacpp-lab/tree/main/rocmfpx
- Upstream del fork ROCmFPX: https://github.com/charlie12345/ROCmFPX
- Drafter DFlash2: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2-GGUF
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
