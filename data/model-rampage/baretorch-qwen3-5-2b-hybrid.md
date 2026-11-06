# model-rampage/BareTorch-Qwen3.5-2B-Hybrid

## Resumen

BareTorch-Qwen3.5-2B-Hybrid es un modelo de lenguaje híbrido de alta eficiencia desarrollado por model-rampage, obtenido mediante destilación por capas a partir de Qwen/Qwen3.5-2B y up-distillation desde Qwen/Qwen3.5-4B con el motor BareTorch Layerwise Up-Distillation. Su propuesta central es eliminar la dependencia de extensiones C++/CUDA/Triton propietarias (como `causal-conv1d` o `flash-linear-attention`) que presentan otras arquitecturas subcuadráticas (Mamba-2, RWKV, Gated DeltaNet), formulando todo el mezclado de secuencias mediante multiplicaciones de matrices estándar (GEMM) compatibles con `torch.compile`.

El modelo sustituye el 75% de los token mixers del backbone (18 de 24 capas) por bloques recurrentes asociativos de bajo rango CS-LRAD (Chunked Selective Low-Rank Associative Delta), conservando 6 capas de full-attention intercaladas como anclas. Según su model card, supera ligeramente al modelo base en las suites de evaluación de lm-evaluation-harness y de razonamiento generativo, con prefill hasta 1,63 veces más rápido y una caché de contexto corto 2,3 veces menor en una RTX 4090.

Es relevante por su orientación al edge y a dispositivos con recursos limitados: mantiene pesos estáticos de unos 3,71 GB en bf16, una ventana de contexto de 32.768 tokens y un estado recurrente de actualización O(1) durante la decodificación, todo sin dependencias CUDA personalizadas. Publicado en octubre de 2026 bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida interleavada 3:1 (18 bloques recurrentes CS-LRAD + 6 capas full-attention) |
| Parametros totales | 2.408.224.032 (dato real de safetensors) |
| Parametros activos | 1899,7M en bf16 (no es MoE; pesos estaticos, ~3,71 GB de VRAM) |
| Longitud de contexto | 32.768 tokens (512 chunks) |
| Tipos de cuantizacion | no disponible (solo bf16 en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 4,8 GB, libreria transformers, custom_code) |

## Arquitectura y entrenamiento

La arquitectura es un hibrido interleavado 3:1: de las 24 capas del backbone, 18 son bloques recurrentes CS-LRAD con rango bajo (r=32, chunk_size=64) y 6 son capas de full-attention que actuan como anclas. El dimensionamiento interno es d_model=2048 con 8 cabezas de query y 2 cabezas KV. La novedad tecnica principal es que CS-LRAD formula el mezclado subcuadratico de secuencias usando unicamente GEMMs estandar de PyTorch, con una actualizacion recurrente asociativa exacta de estado en O(1) durante la decodificacion. Esto lo hace portable a hardware no convencional (arrays sistolicos, dispositivos edge) y compatible con `torch.compile` via TorchInductor, mediante el metodo `model.compile_cs_lrad()` con `dynamic=True` para evitar recompilaciones con longitudes de prompt variables.

El entrenamiento se realizo mediante un pipeline multi-etapa de destilacion por capas: destilacion desde Qwen/Qwen3.5-2B (arquitectura base) y up-distillation desde Qwen/Qwen3.5-4B como profesor en las etapas 4B/4C, con Skew-KD (Top-64 Skew-KL + Skew-RKL) y un componente "4-Pillar `<think>` Dr. GRPO" orientado al razonamiento generativo. El README no detalla el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO clasico (el GRPO mencionado es parte del pipeline de destilacion).

## Capacidades

- Generacion de texto conversacional (pipeline text-generation).
- Razonamiento paso a paso con marcador `<think>` para matematicas y preguntas cientificas, heredado del modelo base Qwen3.5-2B y reforzado con Dr. GRPO.
- Generacion de codigo Python (el README incluye ejemplos de prompts de programacion y evalua MBPP Pass@1).
- Ventana de contexto de 32.768 tokens con cache de decodificacion 2,3 veces menor que el modelo nativo en contexto corto.
- Inferencia sin dependencias CUDA/Triton personalizadas: solo requiere `torch` y `transformers` con `trust_remote_code=True`.
- Aceleracion opcional via `torch.compile` (fusion de kernels en los bloques CS-LRAD).
- Generacion por lotes (batched generation) soportada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Vision, audio y multimodalidad: no disponible (el modelo es de solo texto).

## Casos de uso

- Razonamiento matematico y cientifico en edge devices: el marcador `<think>` permite respuestas paso a paso en hardware sin GPU de gama alta, gracias a los pesos estaticos de ~3,71 GB y al estado recurrente O(1).
- Asistentes conversacionales ligeros: la arquitectura hibrida reduce la VRAM de la cache de contexto corto hasta 2,3 veces frente al modelo nativo, lo que permite servir mas sesiones simultaneas por GPU.
- Generacion de codigo Python embebida: con 24,20% de MBPP Pass@1 reportado, es util para autocompletado y generacion de funciones sencillas en entornos con recursos limitados, aunque no para sustituir modelos de codigo de mayor escala.
- Prefill de documentos largos a bajo coste: el prefill hasta 1,63 veces mas rapido que Qwen3.5-2B nativo lo hace adecuado para resumir o analizar documentos dentro de su ventana de 32K tokens.
- Portabilidad a hardware no convencional: al no requerir kernels CUDA/Triton personalizados, puede ejecutarse en entornos donde las extensiones de Mamba-2 o RWKV no compilan, o explorarse para arrays sistolicos y aceleradores especificos.
- Prototipado rapido de arquitecturas subcuadraticas: el pipeline de destilacion es open source, lo que permite replicar el enfoque sobre otros modelos base.
- Despliegue en Hugging Face Spaces: existe una demo ZeroGPU publica (BareTorch Playground) para probar el modelo sin instalacion local.

## Benchmarks y rendimiento

Datos publicados en la model card (media macro; el modelo se compara con su base, Qwen/Qwen3.5-2B):

| Suite | BareTorch-Qwen3.5-2B-Hybrid | Qwen3.5-2B (base) | Retencion |
|---|---|---|---|
| lm-evaluation-harness (10 tareas) | 64,45% | 61,40% | 105,0% (+3,05 pp) |
| Suite `<think>` generativa (5 tareas: razonamiento y Python) | 25,50% | 21,67% | 117,7% (+3,83 pp) |
| MBPP Pass@1 | 24,20% | no disponible | no disponible |
| GPQA-Diamond | 25,67% | no disponible | no disponible |

Rendimiento en inferencia (NVIDIA RTX 4090, segun la model card):

| Metrica | Valor |
|---|---|
| Prefill | hasta 1,63x mas rapido que Qwen3.5-2B nativo |
| Decodificacion autorregresiva | 1,09x mas rapida |
| Cache de contexto corto | 2,3x menor |
| VRAM pico en 32K de contexto | 310 MB menor |

No se han publicado comparaciones frente a otros modelos ajenos a la familia Qwen3.5 en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16: ~3,71 GB de pesos estaticos, mas cache y activaciones; el README reporta una reduccion de 310 MB de VRAM pico frente al modelo nativo con contexto de 32K en RTX 4090.
- GPU recomendada en los datos publicados: NVIDIA RTX 4090 (entorno de referencia de los benchmarks de velocidad). No se especifican requisitos para A100/H100 u otras GPUs.
- Cabe con holgura en GPUs de consumo: una RTX 4090 (24 GB) sobra; con ~3,71 GB de pesos, deberia ser viable en GPUs de 8 GB como la RTX 4060/3060, aunque no hay datos publicados que lo confirmen.
- Ejecucion en CPU: posible en teoria al no haber dependencias CUDA personalizadas, pero no se aportan mediciones.
- Despliegue: via `transformers` con `trust_remote_code=True` y `model.compile_cs_lrad()` (TorchInductor/Triton generado automaticamente). No se mencionan soporte nativo para vLLM, llama.cpp, Ollama ni TGI; al usar `custom_code`, la compatibilidad con estos motores no esta garantizada.
- Latencia y throughput: no se publican cifras absolutas, solo los multiplicadores relativos (1,63x prefill, 1,09x decodificacion) respecto a Qwen3.5-2B en RTX 4090. La primera llamada tras compilar tarda ~10 segundos en JIT.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia |
|---|---|---|---|---|
| BareTorch-Qwen3.5-2B-Hybrid | 2,41B (1899,7M activos en bf16) | Hibrida CS-LRAD + full-attention (3:1) | 32.768 | Apache 2.0 |
| Qwen/Qwen3.5-2B (base) | 2B | Transformer (full-attention) | 32.768 (segun model card del derivado) | no disponible en la informacion proporcionada |
| Qwen/Qwen3.5-4B (profesor) | 4B | Transformer | no disponible | no disponible |
| Mamba-2 / RWKV / Gated DeltaNet (categoria) | variable | SSM / RNN lineal / delta-net | variable | variable |

Nota: la comparacion cuantitativa directa se limita a los datos de la model card, que solo miden frente a Qwen3.5-2B. Frente a otras arquitecturas subcuadraticas (Mamba-2, RWKV, Gated DeltaNet), la diferencia destacada es la ausencia de dependencias C++/CUDA/Triton personalizadas y la compatibilidad con `torch.compile`, no resultados de benchmarks comparativos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al derivar de Qwen3.5-2B, hereda presumiblemente sus sesgos de entrenamiento, pero no hay analisis publicado.
- Riesgo de alucinacion: no evaluado explicitamente; las puntuaciones absolutas en razonamiento (25,50% de media, 25,67% en GPQA-Diamond) indican que comete errores frecuentes en tareas dificiles, por lo que no debe usarse como fuente de verdad sin verificacion.
- Idiomas: no especificados en la model card; al derivar de Qwen3.5-2B probablemente soporte los idiomas de la familia Qwen (incluido castellano), pero no esta confirmado para este derivado.
- Contexto limitado a 32.768 tokens; no hay datos de rendimiento en contextos muy largos mas alla de las mediciones de VRAM en 32K.
- Requiere `trust_remote_code=True` (custom_code), lo que implica ejecutar codigo del autor del repo; conviene revisarlo antes de usarlo en produccion.
- No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI; la integracion en stacks de servccion habituales puede requerir trabajo adicional.
- Cuantizacion: solo bf16 publicado; no hay pesos INT4/INT8 ni GGUF disponibles.
- Tool calling, multimodalidad y modo agente: no documentados.
- Uso comercial: permitido por la licencia Apache 2.0, sin restricciones relevantes mas alla de las estandar de la licencia.
- La primera inferencia tras `compile_cs_lrad()` tarda ~10 segundos en compilacion JIT, algo a tener en cuenta en servicios con arranque en frio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/model-rampage/BareTorch-Qwen3.5-2B-Hybrid
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Motor BareTorch (GitHub): https://github.com/martin-kbcc/baretorch
- Pipeline de destilacion por capas (GitHub): https://github.com/martin-kbcc/BareTorch_Layerwise_Distill
- Demo en vivo (ZeroGPU Space): https://huggingface.co/spaces/martin-kb-rampage/BareTorch-Qwen3.5-Playground
- Paper (PDF): https://github.com/martin-kbcc/baretorch-experiments/blob/main/paper.pdf
- Licencia Apache 2.0: https://apache.org/licenses/LICENSE-2.0
