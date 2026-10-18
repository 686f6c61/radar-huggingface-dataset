# Ninnix96/Ornith-1.5-35B-A3B-gguf

## Resumen

Esta ficha describe `Ninnix96/Ornith-1.5-35B-A3B-gguf`, una cuantización GGUF del modelo base `ornith-ai/Ornith-1.5-35B-A3B`. No es un modelo entrenado desde cero: es un artefacto de 14,2 GB que aplica la receta de cuantización de antirez sobre un transformer MoE de 35.505.251.456 parámetros totales y aproximadamente 3B activos, según el sufijo A3B. La arquitectura declarada en la validación es `qwen35moe`, con expertos enrutados, expertos compartidos y bloques MTP/draft identificados como `blk.38-40`.

El interés práctico está en que reduce un MoE de 35B a unos 2,9 bits por peso, preservando atención, expertos compartidos, cabeza de salida y embeddings en precisiones altas, mientras cuantiza con fuerza solo los expertos enrutados. Eso permite inferencia local en GPUs de 24 GB o en configuraciones híbridas CPU+GPU con `--n-cpu-moe`, algo relevante para desarrolladores que quieren probar un modelo de este tamaño sin infraestructura de datacenter.

La información disponible no incluye longitud de contexto, idiomas soportados ni resultados de benchmarks estándar. Sí incluye una validación acotada con 9/12 casos superados, una velocidad de generación de aproximadamente 27 t/s en AMD Vulkan/UMA y una divergencia KL media de 0,238 frente al Q8_0 oficial. La licencia es MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`qwen35moe` en llama.cpp); expertos enrutados y compartidos; bloques MTP/draft `blk.38-40` |
| Parámetros totales | 35.505.251.456 (35,5B) |
| Parámetros activos | ≈3B (según sufijo A3B; no verificado en la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q2 mixta (~2,9 BPW): `IQ2_XXS` en `ffn_gate_exps`/`ffn_up_exps`; `Q2_K` en `ffn_down_exps`; `Q8_0` en atención, expertos compartidos, bloques MTP 38-40 y `output.weight`; `F16` en embeddings; router, norms, sinks y biases en BF16/F32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (un único archivo) |
| Tamaño del archivo | 14.215.041.696 bytes (14,2 GB) |
| Modelo base | `ornith-ai/Ornith-1.5-35B-A3B` |
| Cuantizador | Ninnix96 |
| Repositorio | 14,2 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con expertos enrutados y expertos compartidos, identificado en la validación como arquitectura `qwen35moe`. La información disponible no detalla el número de capas, la dimensión oculta, el número de expertos por token ni la composición del dataset de entrenamiento. Tampoco indica el número de tokens de entrenamiento ni si se aplicaron fases de RLHF, DPO u otras optimizaciones posteriores al preentrenamiento.

La aportación de esta ficha es la cuantización, no el entrenamiento. Se sigue la receta de antirez: los expertos enrutados `ffn_gate_exps` y `ffn_up_exps` se llevan a `IQ2_XXS`; `ffn_down_exps` se lleva a `Q2_K`; atención, expertos compartidos, bloques MTP/draft `blk.38-40` y cabeza de salida se mantienen en `Q8_0`; los embeddings quedan en `F16`; router, norms, sinks y biases conservan la precisión del modelo fuente. La calibración usa la imatrix de `mradermacher/Ornith-1.5-35B-A3B-i1-GGUF`, que no cubre los bloques MTP/draft; por eso estos se fuerzan a `Q8_0` mediante una regla de primera coincidencia en `llama-quantize`. El toolchain empleado es llama.cpp en el commit `f3363593f` con soporte Vulkan G9v3, mediante un fork requerido hasta que se integre en upstream.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y el modelo incluye la etiqueta `conversational`.
- Generación de código: en la evaluación hard-smoke publicada, supera los dos casos denominados "big-code".
- Razonamiento y resolución de casos técnicos acotados: 9 de 12 casos superados en la evaluación del cuantizador, con fallos en los casos `10567`, `1606` y `juliet-cwe121`.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponible; no se especifican idiomas.
- Capacidad de decodificación especulativa: los bloques MTP/draft `blk.38-40` se preservan en `Q8_0`; su uso efectivo depende de que el runtime implemente decodificación especulativa para esta arquitectura.
- Visión, audio u otras modalidades: no disponibles; el modelo es de texto.
- Longitud de contexto efectiva: no disponible.

## Casos de uso

- Asistente de código local en estación de trabajo: con 14,2 GB de pesos, el modelo puede cargarse en una GPU de 24 GB y usarse con `llama-cli` o `llama-server` para autocompletado, revisión de parches y generación de pruebas. Es adecuado porque la validación incluye casos de código y el modelo base es un MoE de 35B con ~3B activos, lo que reduce el coste por token frente a un denso equivalente.
- Chat privado on-premise: al distribuirse como GGUF y con licencia MIT, puede desplegarse en una máquina controlada por la organización sin enviar prompts a terceros. La naturaleza conversacional del pipeline lo hace apto para asistentes internos, siempre que se evalúe el contexto y los idiomas needed.
- Revisión automatizada en CI/CD: se puede invocar `llama-cli` en modo headless con temperatura 0 para tareas deterministas de análisis de diffs, generación de mensajes de commit o comprobación de estilo. El modelo ha pasado casos de código grandes, aunque los 3 fallos de la evaluación aconsejan usarlo como apoyo y no como único gate de calidad.
- Análisis de documentación técnica y logs: generación de resúmenes, extracción de causas probables y redacción de informes a partir de texto técnico. Es realista para volúmenes moderados, pero la longitud de contexto no está documentada, así que debe validarse con la ventana real del runtime.
- Experimentación con cuantización de MoE: sirve como artefacto de estudio para medir el impacto de cuantizar expertos enrutados a 2 bits frente a mantener atención y expertos compartidos en 8 bits. La model card proporciona KL divergence, delta-p RMS y coincidencia top-1, lo que facilita reproducir la evaluación.
- Despliegue híbrido CPU+GPU en equipos sin GPU de gran VRAM: la receta permite descargar expertos a CPU con `--n-cpu-moe 16` y mantener el resto en GPU. En la validación se obtuvieron ~27 t/s en AMD Vulkan/UMA, un rendimiento usable para prototipos y herramientas internas.
- Pruebas de decodificación especulativa: los bloques MTP/draft se conservan en `Q8_0`, por lo que el artefacto puede usarse para experimentar con decodificación especulativa si el runtime lo soporta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye una validación propia del cuantizador, no un conjunto de benchmarks comparables con otros modelos.

| Métrica | Resultado | Condiciones |
|---|---:|---|
| Hard-smoke eval, 12 casos | 9/12 PASS | temperatura 0, contexto 15.360, plantilla de chat embebida, `--n-cpu-moe 16` |
| Casos fallidos | `10567`, `1606`, `juliet-cwe121` | misma evaluación |
| Casos de código grandes | 2/2 superados | misma evaluación |
| Tokens de salida en los 9 casos resueltos | 51.528 en total; 5.725 tokens/caso resuelto | tokenizer propio del modelo |
| Velocidad de generación | ~27 t/s | AMD Vulkan/UMA, `--n-cpu-moe 16` |
| KL divergence frente al Q8_0 oficial | 0,214 / 0,262 por chunk; media 0,238 | prompts cortos ds4, contexto 60, 2 chunks, CPU |
| Delta-p RMS | ~10,8% | misma comparación |
| Coincidencia top-1 | 86,2% / 81,0% | misma comparación |

## Requisitos de hardware

- Pesos: 14,2 GB en disco. Para cargar solo los pesos en VRAM se necesitan al menos ~15 GB libres, sin contar KV cache ni overhead del runtime.
- VRAM estimada para inferencia: con contexto de 15.360, una estimación prudente es 18-22 GB para mantener todos los tensores en GPU; no hay una medición oficial de VRAM máxima. Con contexto menor, el requisito baja.
- GPU de 24 GB: RTX 3090, RTX 4090, A10G, L4 o similares son el objetivo cómodo para carga completa o casi completa.
- GPU de 40-80 GB: A100 40 GB, A100 80 GB y H100 permiten holgura para contexto y lotes mayores.
- GPU de 16 GB: RTX 4080, RTX 4060 Ti 16 GB y similares requieren offload parcial de expertos a CPU o contextos reducidos.
- GPU de 12 GB o menos: solo es realista con offload de expertos a CPU y aceptando menor throughput.
- CPU y RAM: el modo híbrido con `--n-cpu-moe 16` funciona, pero exige RAM suficiente para los expertos descargados y añade latencia. No se especifica un mínimo de RAM del sistema.
- Despliegue: llama.cpp es el runtime validado, con el commit `f3363593f` y el fork Vulkan G9v3. Se usan `llama-cli`, `llama-server`, `llama-quantize`, `llama-perplexity` y `gguf-dump`. El soporte en Ollama, vLLM o TGI no está confirmado para esta arquitectura y este GGUF.
- Throughput: ~27 t/s de generación en AMD Vulkan/UMA con 16 capas MoE en CPU. No se proporciona throughput de prefill ni latencia de primer token.

## Comparativa con modelos similares

No se dispone de información sobre modelos alternativos comparables de otros autores con la misma arquitectura y tamaño. La comparación siguiente se limita a artefactos del mismo modelo base y a la referencia de cuantización empleada; no permite comparar calidad global frente a otros modelos.

| Artefacto | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| Este GGUF (`Ninnix96`) | 35,5B totales; ≈3B activos | no disponible | MIT | GGUF Q2 mixta, 14,2 GB, ~2,9 BPW | Cuantización agresiva de expertos enrutados; validación 9/12 |
| Base `ornith-ai/Ornith-1.5-35B-A3B` | 35,5B totales; ≈3B activos | no disponible | MIT | BF16/safetensors | Referencia de calidad; tamaño no disponible en la información |
| Q8_0 oficial de `ornith-ai` | 35,5B totales; ≈3B activos | no disponible | MIT | GGUF Q8_0 | Usado como referencia de KL divergence; tamaño no disponible |
| Imatrix GGUF de `mradermacher` | 35,5B totales; ≈3B activos | no disponible | no disponible | GGUF con imatrix | Fuente de la imatrix; no cubre los bloques MTP 38-40 |

## Limitaciones y advertencias

- Cuantización agresiva: ~2,9 BPW y expertos enrutados a `IQ2_XXS`/`Q2_K`. La divergencia KL media de 0,238 y la coincidencia top-1 de 81-86% frente al Q8_0 indican una degradación medible que puede afectar a razonamiento, código y tareas de alta precisión.
- Evaluación limitada: 9/12 casos en un hard-smoke acotado no equivalen a una evaluación exhaustiva. Los fallos en `10567`, `1606` y `juliet-cwe121` deben tenerse en cuenta si se usa para código o seguridad.
- Sin benchmarks estándar: no hay MMLU, HumanEval ni GSM8K publicados en la información disponible, por lo que no se puede comparar de forma rigurosa con otros modelos.
- Contexto desconocido: no se especifica la longitud de contexto. No se debe asumir una ventana larga sin probarla en el runtime concreto.
- Idiomas desconocidos: no se declaran idiomas soportados. El rendimiento en castellano no está verificado.
- Tool calling y agentes no confirmados: no hay evidencia en la información disponible de soporte de function calling ni de razonamiento multi-paso con herramientas.
- Bloques MTP sin calibrar: la imatrix no cubre `blk.38-40`; se fuerzan a `Q8_0`, pero su comportamiento en decodificación especulativa depende del runtime.
- Compatibilidad de runtime limitada: requiere una versión concreta de llama.cpp y, para Vulkan G9v3, un fork específico. Otros motores pueden no cargar la arquitectura `qwen35moe`.
- Licencia: el repositorio declara MIT, lo que permite uso comercial con conservación del aviso. Debe verificarse también la licencia del modelo base y de la imatrix utilizada.
- Validación comunitaria nula: en los datos proporcionados, el repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de uso en producción.
- Sesgos y alucinaciones: no hay información específica sobre sesgos del modelo base ni sobre tasas de alucinación. Es necesario evaluar en el dominio concreto antes de desplegarlo.

## Enlaces

- [Modelo GGUF en HuggingFace](https://huggingface.co/Ninnix96/Ornith-1.5-35B-A3B-gguf)
- [Modelo base ornith-ai/Ornith-1.5-35B-A3B](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B)
- [Receta antirez de cuantización](https://huggingface.co/antirez/deepseek-v4-gguf)
- [Imatrix de mradermacher](https://huggingface.co/mradermacher/Ornith-1.5-35B-A3B-i1-GGUF)
- [Repositorio de llama.cpp](https://github.com/ggml-org/llama.cpp)
- Fork de llama.cpp referenciado en la model card: `linuxid10t/llama.cpp`, rama `feature/g9v3-support` (sin URL proporcionada en la información)
