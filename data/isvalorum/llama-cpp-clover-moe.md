# IsValorum/llama.cpp-clover-moe

## Resumen

`IsValorum/llama.cpp-clover-moe` no es un modelo en sí mismo, sino un runtime precompilado de llama.cpp que añade soporte para la arquitectura `clover_moe`, empleada por el modelo base [Diffuspace/Clover-35B-A3B-Preview](https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview), un modelo de difusión por bloques (block-diffusion) de tipo mezcla de expertos con 35B de parámetros totales y aproximadamente 3B activos. El proyecto lo mantiene IsValorum, que compila binarios para Linux y Windows x86_64 a partir del PR no fusionado [#31306](https://github.com/ggml-org/llama.cpp/pull/31306) de llama.cpp, en el commit `4838ffb0c8ade92f34d9157deea38d92758ab824`.

Su relevancia radica en que el llama.cpp oficial (mainline) todavía no puede cargar archivos `clover_moe`: sin este build, no es posible ejecutar los GGUF de Clover localmente. El runtime incluye el conversor de HF a GGUF, el grafo de ejecución y un modo especulativo propio llamado `draft-self`, además de herramientas habituales como `llama-quantize`, `llama-imatrix` y `llama-server`.

El autor publica también cuantizaciones propias del modelo base (BF16, Q8_0 y variantes APEX-I), calculadas con matrices de importancia (imatrix) de 1,25 millones de muestras en clústeres de computación en la nube financiados por el propio autor. La licencia del repositorio es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `clover_moe` (MoE con difusión por bloques / block-diffusion) |
| Parametros totales | 35B (modelo base Clover-35B-A3B-Preview) |
| Parametros activos | ~3B (indicado por la convención de nombre A3B; no confirmado explicitamente en la model card) |
| Longitud de contexto | no disponible (los ejemplos de la model card usan 2048-4096 tokens) |
| Tipos de cuantizacion | BF16, Q8_0, IQ4_XS (terceros), APEX-I NanoPlus V2.1, APEX-I MiniPlus V2.1 |
| Idiomas soportados | en (ingles, segun etiquetas del repo) |
| Licencia | MIT (el runtime); la del modelo base no se indica en esta model card |
| Formato de pesos | GGUF (no carga los safetensors originales) |

## Arquitectura y entrenamiento

El runtime da soporte a la arquitectura `clover_moe`, que combina mezcla de expertos (MoE) con difusión por bloques (block-diffusion), un paradigma generativo distinto del descodificador autorregresivo clásico: el modelo refina bloques de tokens de forma iterativa en lugar de generarlos estrictamente de uno en uno. Prueba de ello es que el build incluye el binario `llama-diffusion-cli` junto a `llama-cli` y `llama-server`.

Sobre el entrenamiento del modelo base Clover-35B-A3B-Preview (numero de tokens, composicion del dataset, RLHF/DPO) no hay datos en la informacion disponible. La innovacion tecnica destacable de este repositorio es el modo especulativo `draft-self` (`--spec-type draft-self`), que permite decodificacion especulativa usando el propio modelo como borrador, con un maximo configurable de tokens de borrador (`--spec-draft-n-max 15`). El PR de llama.cpp que implementa todo esto no esta fusionado upstream, por lo que el autor recomienda fijar este repositorio y commit para reproducibilidad.

## Capacidades

Capacidades del runtime y del modelo base que habilita:

- Ejecucion local de GGUF `clover_moe` (BF16, Q8_0 y cuantizaciones de terceros como IQ4_XS)
- Generacion de texto mediante difusion por bloques, a traves de `llama-cli`, `llama-completion.exe` y `llama-diffusion-cli`
- Servidor de inferencia local con `llama-server`
- Decodificacion especulativa en modo `draft-self` via `llama-speculative-simple`
- Cuantizacion y calculo de matrices de importancia con `llama-quantize` y `llama-imatrix`
- Medicion de perplejidad con `llama-perplexity`
- Conversor de HuggingFace a GGUF incluido (`convert_hf_to_gguf.py` y `gguf-py`)
- Soporte de backends CPU, CUDA 12/12.8 y Vulkan 1.4.363
- No compatible con LM Studio ni Ollama mientras el PR no se fusione upstream

Capacidades del modelo base (tool calling, agentes, multilingue, vision) no disponibles en la informacion proporcionada.

## Casos de uso

- Ejecucion local de Clover-35B-A3B-Preview en Windows: el ZIP universal incluye las librerias CUDA 12.8 y funciona con GPUs Nvidia desde Maxwell (sm_50) hasta Blackwell (sm_120), asi como con AMD/Intel via Vulkan, sin instalacion adicional de runtime.
- Inferencia en servidores Linux con GPUs de datacenter: el build CUDA 12 cubre sm_80/86/89/90 (A100, A10G, L40S, RTX 4090, H100/H200), util para desplegar el modelo con `llama-server` en entornos controlados.
- Experimentacion con modelos de difusion por bloques: investigadores pueden probar el paradigma block-diffusion en local gracias a `llama-diffusion-cli`, algo que mainline llama.cpp todavia no permite.
- Aceleracion de inferencia con decodificacion especulativa: el modo `draft-self` con `--spec-draft-n-max 15` y caches KV en bf16 permite reducir la latencia de generacion en GPUs NVIDIA.
- Creacion de cuantizaciones personalizadas: el conversor y `llama-quantize`/`llama-imatrix` permiten generar GGUF propios del modelo base con calibracion por imatrix, como hacen las variantes APEX-I del autor.
- Evaluacion de calidad de cuantizaciones: `llama-perplexity` permite medir el impacto de cada cuantizacion antes de desplegarla.
- Ejecucion en CPU pura: el build Linux con `GGML_NATIVE=OFF` funciona en cualquier x86-64, util para maquinas sin GPU dedicada (requiere GLIBC 2.38 o superior, por ejemplo Ubuntu 24.04).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM segun cuantizacion del modelo base (tamanos de archivo publicados):
  - BF16: 69,38 GB (requiere multi-GPU o offload a CPU/RAM)
  - Q8_0: 36,91 GB (cabe en una H100 80 GB o A100 80 GB; en 2x RTX 3090/4090 con offload parcial)
  - APEX-I MiniPlus V2.1: 14,75 GB (cabe en una RTX 4090 de 24 GB o RTX 3090)
  - APEX-I NanoPlus V2.1: 12,56 GB (cabe en una RTX 4070 Ti Super/4080 de 16 GB o superior)
  - IQ4_XS de terceros: tamanio no disponible
- GPUs recomendadas: H100/H200, A100, L40S, A10G, RTX 4090 (CUDA 12 en Linux); en Windows, cualquier Nvidia sm_50-sm_120 y GPUs AMD/Intel via Vulkan 1.4.363
- Consumer GPUs: si, con las cuantizaciones APEX-I; la variante NanoPlus (12,56 GB) entra en GPUs de 16 GB y la MiniPlus (14,75 GB) en GPUs de 24 GB
- CPU: viable en cualquier x86-64 con el build Linux CPU (GLIBC 2.38+); el modelo completo en BF16 exigiria ~70 GB de RAM
- Despliegue: binarios propios de llama.cpp (`llama-cli`, `llama-server`, `llama-speculative-simple`); no compatible con LM Studio, Ollama ni otros frontends hasta que el PR se fusione
- Latencia y throughput: no disponible

## Comparativa con modelos similares

Comparativa del modelo base habilitado frente a alternativas MoE de tamano similar:

| Modelo | Parametros totales | Parametros activos | Paradigma | Contexto | Licencia | Disponibilidad en llama.cpp mainline |
|---|---|---|---|---|---|---|
| Clover-35B-A3B-Preview | 35B | ~3B | MoE + block-diffusion | no disponible | no disponible | No (requiere este build) |
| Qwen3-30B-A3B | 30B | 3B | MoE autorregresivo | 32K (128K con YaRN) | Apache 2.0 | Si |
| Mixtral 8x7B | 47B | 13B | MoE autorregresivo | 32K | Apache 2.0 | Si |
| OLMoE-1B-7B | 7B | 1B | MoE autorregresivo | 4K | Apache 2.0 | Si |

Nota: los datos de los modelos alternativos son de conocimiento general y pueden variar; los de Clover provienen unicamente de la informacion disponible en este repo.

## Limitaciones y advertencias

- El PR de llama.cpp (#31306) no esta fusionado upstream: mainline llama.cpp no carga `clover_moe`, por lo que hay que depender de este repositorio y fijar el commit para reproducibilidad.
- No compatible con LM Studio, Ollama ni otros frontends habituales.
- No hay builds para macOS, ARM64 ni ROCm; los Linux requieren GLIBC 2.38+ (Ubuntu 24.04 como baseline); Blackwell (sm_100/120) en Linux y AMD/Intel en Linux no estan cubiertos en este build.
- El runtime no carga los safetensors originales del modelo base, solo GGUF `clover_moe`.
- Sesgos, riesgo de alucinacion, capacidades multilingues (solo figura "en") y datos de entrenamiento del modelo base: no disponibles en la informacion proporcionada; Clover es ademas un modelo "Preview", con lo que su calidad y estabilidad pueden cambiar.
- Restricciones de licencia para uso comercial del modelo base: no disponibles en esta model card (el runtime es MIT).
- Los binarios son enlaces dinamicos: hay que configurar `LD_LIBRARY_PATH` (Linux) o `PATH` (Windows) apuntando al directorio `bin` antes de ejecutar.
- Proyecto mantenido por una persona de forma independiente y financiada por donaciones (Ko-fi), lo que introduce riesgo de mantenimiento a largo plazo.

## Enlaces

- Runtime: https://huggingface.co/IsValorum/llama.cpp-clover-moe
- Modelo base: https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview
- GGUF BF16: https://huggingface.co/IsValorum/Clover-35B-A3B-Preview-BF16-GGUF
- GGUF Q8_0: https://huggingface.co/IsValorum/Clover-35B-A3B-Preview-Q8_0-GGUF
- I-Matrix 1,25M: https://huggingface.co/IsValorum/Clover-35B-A3B-Preview-VAL-1.25M-I-Matrix-GGUF
- GGUF APEX-I NanoPlus V2.1: https://huggingface.co/IsValorum/Clover-35B-A3B-Preview-APEX-I-NanoPlus-V2.1-GGUF
- GGUF APEX-I MiniPlus V2.1: https://huggingface.co/IsValorum/Clover-35B-A3B-Preview-APEX-I-MiniPlus-V2.1-GGUF
- PR de llama.cpp con soporte Clover: https://github.com/ggml-org/llama.cpp/pull/31306
- Soporte al autor (Ko-fi): https://ko-fi.com/isvalorum
