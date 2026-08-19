# pugant/Qwen3.6-35B-A3B-MTP-Q6_0_ROCMFPX

## Resumen

El modelo `pugant/Qwen3.6-35B-A3B-MTP-Q6_0_ROCMFPX` es una cuantización en formato GGUF del modelo base `Qwen/Qwen3.6-35B-A3B`, perteneciente a la familia Qwen3.5-MoE. Se trata de un modelo de lenguaje de arquitectura de mezcla de expertos (MoE) con 35 505 millones de parámetros totales y aproximadamente 3 000 millones de parámetros activos por token, lo que lo hace eficiente en inferencia. Esta versión concreta está cuantizada con el tipo `Q6_0_ROCMFPX`, un formato propietario del fork de llama.cpp llamado `ROCmFPX`, desarrollado por `charlie12345`, que optimiza el rendimiento en GPUs AMD RDNA 3.5 (gfx1151, como la iGPU Radeon 8060S de los procesadores Strix Halo). El repositorio incluye además las capas MTP (multi-token prediction) del modelo base, lo que permite decodificación especulativa para acelerar la generación.

Esta ficha es relevante porque aborda un caso de uso muy concreto: ejecutar un modelo MoE de alta calidad (nivel Q6_K) en hardware AMD de última generación con memoria unificada, utilizando un backend Vulkan optimizado. El autor ha realizado pruebas exhaustivas de rendimiento y ofrece configuraciones recomendadas para sacar el máximo partido al hardware. Sin embargo, es importante destacar que este GGUF **no es compatible con llama.cpp estándar**; requiere el fork específico `ROCmFPX`, y su uso está pensado principalmente para entornos con GPUs RDNA 3.5 (Strix Halo) o similares con soporte Vulkan.

La cuantización `Q6_0_ROCMFPX` (~6,5 bits por peso) se posiciona como la opción de mayor calidad dentro de las variantes ROCmFPX para este modelo, sacrificando velocidad de decodificación en favor de una mejor fidelidad. El autor la recomienda para cargas de trabajo de agentes de código donde la calidad de salida es prioritaria frente a la velocidad pura.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en transformer, familia Qwen3.5-MoE |
| Parametros totales | 35 505 251 456 |
| Parametros activos | ~3 000 000 000 (3B) |
| Longitud de contexto | no disponible (no se especifica en la información; las pruebas usan 16k) |
| Tipos de cuantizacion | Q6_0_ROCMFPX (fork-specific, ~6,5 BPW); también existen Q4_0_ROCMFP4_STRIX_LEAN y UD-Q5_K_M_MTP para el mismo modelo base |
| Idiomas soportados | Inglés, multilingüe (según etiquetas del repositorio) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (específico del fork ROCmFPX de llama.cpp) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.6-35B-A3B` es un modelo de lenguaje de tipo MoE con 35 505 millones de parámetros totales y 3 000 millones activos por token. Pertenece a la familia Qwen3.5-MoE, aunque no se proporcionan detalles adicionales sobre la arquitectura interna (número de expertos, dimensiones, etc.) en la información disponible. La cuantización conserva las capas MTP (multi-token prediction), que permiten la decodificación especulativa: el modelo predice varios tokens a la vez y el servidor los valida, acelerando la generación cuando se activa con `--spec-type draft-mtp`.

No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). El autor de la cuantización solo indica que el archivo fuente fue un GGUF en BF16 de `unsloth/Qwen3.6-35B-A3B-MTP-GGUF`, y que la cuantización se realizó con `llama-quantize` del fork ROCmFPX, con un intento de usar imatrix (aunque la configuración final está en el historial del repositorio). La innovación técnica principal de esta versión es el propio tipo de cuantización `Q6_0_ROCMFPX`, diseñado para aprovechar las instrucciones FPX de las GPUs AMD RDNA 3.5, y la inclusión de las capas MTP para aceleración especulativa.

## Capacidades

- Generación de texto en inglés y otros idiomas (multilingüe, según las etiquetas).
- Razonamiento y modo "thinking": el servidor soporta `--reasoning on` y `--reasoning-budget`, lo que permite al modelo generar cadenas de pensamiento antes de responder.
- Orientado a tareas de agente y codificación: el autor lo recomienda para "cargas de trabajo de agentes de código" y menciona "workloads agentic/mixtos".
- Decodificación especulativa con MTP: al activar `--spec-type draft-mtp`, el modelo puede predecir múltiples tokens por paso, mejorando el throughput en contenido determinista (hasta 67 tok/s en pruebas).
- Compatible con el backend Vulkan (RADV) del fork ROCmFPX, que es el camino de inferencia optimizado para esta cuantización.
- No se menciona explícitamente soporte para tool calling o function calling, aunque por ser un modelo de la familia Qwen es probable que lo herede; no se confirma en la documentación proporcionada.

## Casos de uso

- **Asistente de programación en local**: gracias a su tamaño compacto (27,39 GiB) y a que puede ejecutarse en una iGPU con memoria unificada (como la Radeon 8060S), este modelo puede servir como copiloto de código en un portátil o estación de trabajo sin necesidad de GPU dedicada de gama alta. La calidad Q6_K lo hace adecuado para sugerencias de código precisas y explicaciones técnicas.
- **Agente autónomo de desarrollo de software**: el modelo está pensado para "cargas de trabajo de agente de código", donde debe razonar sobre múltiples pasos, planificar y ejecutar tareas de programación. Su modo de razonamiento (`--reasoning on`) permite generar cadenas de pensamiento antes de actuar, y la decodificación especulativa MTP acelera las partes deterministas (como completar código repetitivo).
- **Generación de documentación técnica**: con su capacidad multilingüe y su buen rendimiento en texto, puede redactar documentación, comentarios de código y guías de usuario en varios idiomas, manteniendo un tono coherente.
- **Análisis y revisión de código**: el modelo puede analizar fragmentos de código, detectar posibles errores, sugerir mejoras y explicar el funcionamiento de funciones complejas. Su calidad de cuantización alta (Q6) reduce la pérdida de precisión en tareas de razonamiento lógico.
- **Chatbot de atención al cliente en entornos técnicos**: al ser multilingüe y capaz de manejar conversaciones con contexto (aunque no se especifica la longitud máxima, las pruebas se hicieron con 16k), puede desplegarse como asistente virtual para resolver dudas de productos software o hardware, integrado en un servidor llama.cpp.
- **Prototipado rápido de aplicaciones de IA generativa**: al ser un GGUF compatible con llama.cpp (fork), se puede integrar fácilmente en proyectos que usen la pila de inferencia local, como servidores OpenAI-compatibles, para probar funcionalidades de razonamiento y generación de código sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, la model card incluye mediciones de rendimiento de inferencia en hardware específico (AMD Ryzen AI Max+ 395 con Radeon 8060S, 128 GB unificados, usando `llama-bench -ngl 999 -fa on -p 512 -n 128`). Estas son las tablas relevantes:

**Comparativa de variantes del mismo modelo base (mismo host, 2026-08-14):**

| Variante | Quant | Tamaño | Backend | pp512 (tok/s) | tg128 (tok/s) |
|---|---:|---:|---|---:|---:|
| **Este repo** | **Q6_0_ROCMFPX** | **27,39 GiB** | **Vulkan RADV** | **1120,4** | **49,2** |
| Qwopus3.6-35B (abliterated) | Q6_0_ROCMFPX | 27,38 GiB | Vulkan RADV | 1076,9 | 49,5 |
| Qwopus3.6-35B (abliterated) | Q6_0_ROCMFPX | 27,38 GiB | ROCm | 520,6 | 51,3 |
| base | Q4_0_ROCMFP4_STRIX_LEAN | 17,73 GiB | Vulkan RADV | 1164,7 | **81,6** |
| base | Q4_0_ROCMFP4_STRIX_LEAN | 17,73 GiB | ROCm | **1420,7** | 71,2 |
| base | UD-Q5_K_M_MTP | 25,22 GiB | Vulkan RADV | 1008,1 | 57,9 |
| base | UD-Q5_K_M_MTP | 25,22 GiB | ROCm | 1359,4 | 50,8 |
| base | UD-Q5_K_M_MTP | 25,22 GiB | Vulkan AMDVLK | 663,0 | 55,8 |

**Rendimiento con MTP (decodificación especulativa) en este archivo (server-timing, 2 prompts × 2 runs, ctx 16k, Vulkan RADV):**

| n-max | prosa tg (tok/s) | determinista tg (tok/s) |
|---:|---:|---:|
| 4 | 44,7 | 62,8 |
| **3 (recomendado)** | 54,0 | **67,3** |
| 2 | **58,2** | 62,4 |

El autor concluye que `Q6_0_ROCMFPX` es la opción de mayor calidad (nivel Q6_K) pero la más lenta en decodificación (tg128) entre las variantes probadas. La velocidad de prefill (pp512) es competitiva (1120 tok/s en Vulkan). Con MTP activado y n-max=3, se alcanzan 67,3 tok/s en contenido determinista, un +37% sobre la velocidad base de 49,2 tok/s.

## Requisitos de hardware

- **GPU objetivo**: AMD RDNA 3.5 (gfx1151, Strix Halo), específicamente la iGPU Radeon 8060S. No se ha probado en otras GPUs.
- **Memoria**: el archivo GGUF ocupa 27,39 GiB. En un sistema con memoria unificada (como Strix Halo con 128 GB LPDDR5X), no hay problema. En una GPU con VRAM dedicada, se necesitarían al menos 28 GB de VRAM para cargar el modelo completo con `-ngl 999`.
- **Backend**: obligatorio usar el fork `ROCmFPX` de llama.cpp (`charlie12345/ROCmFPX`). El backend recomendado es Vulkan con el driver RADV. En el backend ROCm (HIP), el rendimiento de prefill (pp512) cae ~50% para esta cuantización Q6.
- **Configuración de memoria unificada**: en Strix Halo, se requiere `GGML_CUDA_ENABLE_UNIFIED_MEMORY=1` (en el backend ROCm) o usar Vulkan con el ICD por defecto, ya que la partición de VRAM es de solo 512 MB.
- **Opciones de despliegue**: `llama-server` del fork ROCmFPX, con los parámetros recomendados: `-ngl 999 -fa on --jinja --parallel 4 --top-p 0.95 --top-k 20 --temperature 1.0 --reasoning on --reasoning-budget 16384` y opcionalmente `--spec-type draft-mtp --spec-draft-ngl all --spec-draft-n-max 3` para MTP.
- **Latencia y throughput**: en el hardware de prueba (Ryzen AI Max+ 395, Radeon 8060S), se obtienen 49,2 tok/s de generación (tg128) y 1120 tok/s de prefill (pp512) en Vulkan RADV. Con MTP, hasta 67,3 tok/s en contenido determinista.

## Comparativa con modelos similares

La siguiente tabla compara las variantes del mismo modelo base `Qwen3.6-35B-A3B` que el autor probó en el mismo hardware. No se dispone de comparaciones con otros modelos MoE de tamaño similar (por ejemplo, Qwen3-30B-A3B o DeepSeek-V3-Lite) en la información proporcionada.

| Variante | Quant | Tamaño | Backend | pp512 (tok/s) | tg128 (tok/s) |
|---|---:|---:|---|---:|---:|
| **Este repo** | **Q6_0_ROCMFPX** | **27,39 GiB** | **Vulkan RADV** | **1120,4** | **49,2** |
| base | Q4_0_ROCMFP4_STRIX_LEAN | 17,73 GiB | Vulkan RADV | 1164,7 | **81,6** |
| base | Q4_0_ROCMFP4_STRIX_LEAN | 17,73 GiB | ROCm | **1420,7** | 71,2 |
| base | UD-Q5_K_M_MTP | 25,22 GiB | Vulkan RADV | 1008,1 | 57,9 |
| base | UD-Q5_K_M_MTP | 25,22 GiB | ROCm | 1359,4 | 50,8 |

Observaciones: la variante Q4_0_ROCMFP4_STRIX_LEAN es la más rápida en decodificación (81,6 tok/s en Vulkan), mientras que la Q6_0_ROCMFPX ofrece mayor calidad a costa de velocidad. La UD-Q5_K_M_MTP (de unsloth) es un punto intermedio. La elección depende de la prioridad: calidad (Q6), velocidad (Q4) o equilibrio (Q5_K_M).

## Limitaciones y advertencias

- **Incompatibilidad con llama.cpp estándar**: el tipo `Q6_0_ROCMFPX` es exclusivo del fork `ROCmFPX`. No se cargará en builds oficiales de llama.cpp, Ollama u otros que usen la versión estándar.
- **Hardware restringido**: el rendimiento óptimo solo se ha validado en AMD RDNA 3.5 (gfx1151, Strix Halo). En otras GPUs o con el backend ROCm, el rendimiento de prefill puede degradarse significativamente (hasta un 50% menos en pp512).
- **Riesgo de fuga de pensamiento**: sin `--reasoning-budget`, el modo de razonamiento usa un presupuesto ilimitado (INT32_MAX) y puede generar cadenas de pensamiento muy largas, consumiendo tiempo y memoria.
- **MTP no siempre rentable**: con n-max=4, la tasa de aceptación en posición 4 es solo ~0,51, por lo que el coste adicional de los drafts no se compensa. Se recomienda n-max=3.
- **Sesgos y alucinaciones**: no se han publicado evaluaciones de sesgos o tasas de alucinación para esta cuantización. Como modelo de lenguaje general, puede producir información incorrecta o inventada, especialmente en tareas de razonamiento complejo.
- **Licencia**: aunque la licencia es Apache-2.0, el modelo base Qwen3.6-35B-A3B tiene sus propios términos (también Apache-2.0 según la etiqueta), pero se recomienda revisar la documentación oficial de Qwen para confirmar restricciones de uso comercial.
- **Sin garantía de soporte**: el repositorio tiene 0 descargas y 0 likes, y el autor no ofrece soporte formal. El fork ROCmFPX es un proyecto de terceros con mantenimiento incierto.

## Enlaces

- [Repositorio HuggingFace de esta cuantización](https://huggingface.co/pugant/Qwen3.6-35B-A3B-MTP-Q6_0_ROCMFPX)
- [Modelo base Qwen/Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
- [Fork ROCmFPX de llama.cpp (charlie12345)](https://github.com/charlie12345/ROCmFPX)
- [Fuente BF16 GGUF de unsloth](https://huggingface.co/unsloth/Qwen3.6-35B-A3B-MTP-GGUF)
- Otros repositorios del autor con cuantizaciones ROCmFPX para Strix Halo:
  - [grug-35b-v2-ROCmFP4-STRIX_LEAN](https://huggingface.co/pugant/grug-35b-v2-ROCmFP4-STRIX_LEAN)
  - [Ornith-1.0-35B-ROCmFP4-STRIX_LEAN](https://huggingface.co/pugant/Ornith-1.0-35B-ROCmFP4-STRIX_LEAN)
  - [NVIDIA-Nemotron-3.5-Lightning-30B-A3B-ROCmFP4-STRIX_LEAN](https://huggingface.co/pugant/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-ROCmFP4-STRIX_LEAN)
