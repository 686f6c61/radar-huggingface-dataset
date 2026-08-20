# cfontes/qwen-dflash2-spark

## Resumen

El repositorio `cfontes/qwen-dflash2-spark` no es un modelo de lenguaje en sí, sino una configuración de inferencia reproducible y optimizada para servir el modelo **Qwen3.8-27B** (en su variante NVFP4) sobre dos nodos NVIDIA DGX Spark (GB10) mediante decodificación especulativa con el drafter DFlash2. El autor, `cfontes`, proporciona un stack completo que incluye scripts de descarga, compilación de una imagen vLLM modificada, corrección del checkpoint y lanzamiento de dos nodos en paralelo, alcanzando entre 124 y 135 tokens por segundo en una sola secuencia (benchmark C1), lo que supone un +43% de velocidad frente a la alternativa DSpark (MTP) con igual calidad.

La relevancia actual radica en que demuestra cómo ejecutar un modelo de 27B parámetros con cuantización NVFP4 en hardware de gama media (DGX Spark, basado en GB10) con decodificación especulativa de bloques, una técnica que reduce drásticamente la latencia por token. El repositorio incluye un "fix" crítico: la deshcuantización de la capa `lm_head` a BF16, necesaria para que el selector de candidatos de DFlash2 funcione correctamente sobre checkpoints NVFP4 públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (transformer) con cuantización NVFP4 (pesos FP4, atención FP8) + drafter DFlash2 de 1.92B parámetros (block_size 8, convolución local + cabeza selectora) |
| Parametros totales | 27B (modelo base) + 1.92B (drafter) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (FP4 weights, FP8 attention) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No disponible (checkpoints HuggingFace, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo base es `unsloth/Qwen3.8-27B-NVFP4`, una versión cuantizada del Qwen3.8-27B con pesos en FP4 y atención en FP8. No se proporcionan detalles sobre el entrenamiento original de Qwen3.8-27B (número de tokens, dataset, RLHF/DPO) en la información disponible.

La innovación principal es el **drafter DFlash2** (`z-lab/Qwen3.8-27B-DFlash2`, 1.92B parámetros, block_size 8). DFlash2 es un drafter paralelo que genera múltiples tokens de forma especulativa en paralelo, alcanzando cerca de 3× la velocidad de decodificación autoreactiva con la misma salida. El stack de inferencia se basa en un fork de vLLM (PR #52816) que implementa la integración de DFlash2, compilado para aarch64 en la imagen oficial `vllm/vllm-openai:0.27.1-aarch64`, con tensor parallelism (TP=2) entre dos nodos DGX Spark vía RoCE v2.

El único ajuste necesario para que funcione es la **descuantización de `lm_head` a BF16**: el checkpoint NVFP4 cuantiza esta capa, pero el selector de candidatos de DFlash2 hace un TopK sobre los logits del modelo objetivo y rechaza cabezas cuantizadas. El script `02-make-bf16head.sh` aplica esta cirugía atómicamente, sin afectar a la calidad (verificado con 6/6 aciertos en pruebas greedy).

## Capacidades

- Generación de texto autoregresiva de alta velocidad mediante decodificación especulativa de bloques (DFlash2).
- Soporte de decodificación especulativa con el drafter de 1.92B, lo que permite velocidades de 124–135 tok/s en single-stream sobre dos DGX Spark.
- Integración con vLLM, exponiendo un endpoint compatible con OpenAI (`http://NODE1:8004/v1`, modelo `qwen3.8-27b-dflash2`).
- No se especifican capacidades de razonamiento, código, matemáticas, visión, tool calling o agentes más allá de las propias del modelo base (no disponibles en la información proporcionada).
- No se indica soporte multilingüe (idiomas no disponibles).

## Casos de uso

- **Despliegue local de alta velocidad en hardware compacto**: el stack permite ejecutar un modelo de 27B a más de 130 tok/s en dos DGX Spark, ideal para entornos con restricciones de consumo o espacio físico.
- **Sistemas de edición de código asistida**: el benchmark C1 (edit-heavy) muestra velocidades de 124–135 tok/s, lo que permite autocompletado y refactorización interactiva con latencia imperceptible.
- **Pruebas de decodificación especulativa**: el repositorio incluye benchmarks y scripts de verificación que permiten comparar DFlash2 frente a DSpark (MTP) y evaluar el impacto de la longitud de bloque (K) en la tasa de aceptación.
- **Integración en pipelines de producción**: al exponer un endpoint OpenAI-compatible, se puede conectar directamente a aplicaciones existentes (chatbots, agentes) que requieran baja latencia.
- **Investigación sobre técnicas de decodificación**: los scripts de calidad (quality gate) y benchmarks (C1) permiten reproducir experimentos de decodificación especulativa con métricas estandarizadas.
- **Evaluación de cuantización NVFP4**: la combinación con el fix de `lm_head` permite estudiar el impacto de la cuantización en la capa de salida y validar que no hay deriva de calidad.

## Benchmarks y rendimiento

El repositorio reporta los siguientes resultados en el benchmark C1 (edit-heavy) sobre dos DGX Spark (GB10) con TP=2, NVFP4 target + drafter 1.92B:

| Config | tok/s (C1) | aceptación | tokens/paso |
|---|---|---|---|
| DSpark (MTP) K=14 | 91–95 | 68.6% | ~9.7 |
| DFlash2 K=7 | 73–74 | 99.6% | 7.0 |
| **DFlash2 K=16** | **124–135** | 93.1% | 15.9 |
| DFlash2 K=24 | 121–129 | 66.4% | 16.9 |

La variación entre 5 ejecuciones fue de 131.5–134.8 tok/s con aceptación del 93.1% en todas. La prueba de calidad (greedy) sobre 6 prompts (matemáticas, Canberra, silogismo, bugfix, código) dio 6/6 correctos, confirmando que el fix de BF16 en `lm_head` no introduce desviación medible.

## Requisitos de hardware

- **Hardware mínimo**: dos nodos NVIDIA DGX Spark (GB10) con Docker, SSH sin contraseña y conectividad RoCE v2 entre ellos. La imagen vLLM solo existe para aarch64, por lo que es específica para GB10.
- **VRAM**: no se especifica la VRAM utilizada, pero el checkpoint NVFP4 ocupa ~21 GB y el drafter ~4 GB, por lo que cada nodo debe tener al menos 64 GB de memoria (el GB10 tiene 64 GB unificados).
- **GPU**: dos DGX Spark (GB10) con TP=2.
- **Opciones de despliegue**: vLLM (fork con PR #52816) en modo servidor OpenAI; también se puede usar el script `04-launch-pair.sh` para arranque automático.
- **Latencia/throughput**: 124–135 tok/s single-stream (C1). No se proporcionan datos de latencia en milisegundos.

## Comparativa con modelos similares

La comparación principal es contra la técnica DSpark (MTP) sobre el mismo hardware y modelo base:

| Característica | Qwen3.8-27B + DFlash2 (este repo) | Qwen3.8-27B + DSpark (MTP) |
|---|---|---|
| Velocidad (C1) | 124–135 tok/s | 91–95 tok/s |
| Aceptación | 93.1% (K=16) | 68.6% (K=14) |
| Tokens/paso | 15.9 | ~9.7 |
| Licencia | MIT (repo) | MIT (repo) |
| Hardware requerido | 2× DGX Spark (GB10) | 2× DGX Spark (GB10) |

No se dispone de datos de comparación con otros modelos de tamaño similar (p.ej. Llama 3.1 27B, Mixtral 8x7B) en la información proporcionada.

## Limitaciones y advertencias

- **Dependencia de hardware específico**: el stack solo funciona en aarch64 (GB10), no es portable a GPUs x86.
- **Corrección manual del checkpoint**: sin el fix de `lm_head` BF16, el drafter no funciona; el script debe ejecutarse en cada nuevo checkpoint.
- **Rendimiento single-stream**: los números de 124–135 tok/s son solo para una secuencia; el throughput concurrente no se reporta y puede escalar de forma diferente.
- **Calidad limitada a pruebas**: la verificación de calidad se limita a 6 prompts greedy; no hay evidencia de evaluación exhaustiva (MMLU, HumanEval, GSM8K, etc.).
- **Idiomas y contexto**: no se especifican idiomas soportados ni la longitud de contexto; el modelo base Qwen3.8-27B podría tener limitaciones no documentadas aquí.
- **Licencia**: el repositorio es MIT, pero el modelo base (Qwen3.8-27B) y el drafter (z-lab) pueden tener licencias distintas; no se confirma la licencia de los checkpoints.

## Enlaces

- [HuggingFace - cfontes/qwen-dflash-spark](https://huggingface.co/cfontes/qwen-dflash-spark)
- [GitHub - fattchris/qwen-dflash-spark](https://github.com/fattchris/qwen-dflash-spark)
- [Blog de Inco AI - DFlash 2: Keep Drafting Parallel](https://inco.ai/blog/dflash2/)
- [README de incoai/Qwen3.8-27B-DFlash2](https://huggingface.co/incoai/Qwen3.8-27B-DFlash2/blob/main/README.md)
- [PR vLLM #52816](https://github.com/vllm-project/vllm/pull/52816)
- [Fork de vLLM de z-lab](https://github.com/z-lab/vllm-fork/commit/19c9351904df4c63042671bc67a866ca48dc7d6f)
- [Foro de NVIDIA - Qwen 3.8 27B + DFlash2](https://forums.developer.nvidia.com/t/qwen-3-8-27b-dflash2/380617)
