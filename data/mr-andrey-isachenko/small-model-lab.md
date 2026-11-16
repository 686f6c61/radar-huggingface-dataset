# mr-andrey-isachenko/small-model-lab

## Resumen

Small Model Lab es un proyecto de investigación aplicada publicado por el usuario mr-andrey-isachenko en Hugging Face, estructurado en cuatro sprints que cubren desde el preentrenamiento de un transformer propio (`sml-100m`) hasta el ajuste fino con RL de un modelo abierto existente (`Qwen2.5-3B-Instruct`). El problema que aborda es acotado y concreto: razonamiento sobre incidentes en pipelines de datos, con herramientas SQL sobre DuckDB y dbt Core, evaluando cuándo conviene actualizar pesos (LoRA/SFT/GRPO) frente a enriquecer el contexto (RAG híbrido BM25 + 3-gram). El repositorio no contiene un modelo base nuevo listo para uso general, sino un conjunto de artefactos, resultados reproducibles y configuraciones experimentales.

El componente principal es un decoder estilo Llama/Qwen (`RMSNorm`, `RoPE`, `GQA` 12Q/4KV, `SwiGLU`, máscara causal intra-documento, KV-cache) denominado `sml-100m`, preentrenado sobre 4.000 millones de tokens de FineWeb-Edu con un schedule Warmup–Stable–Decay y una rama de cooldown Chinchilla-optimal de 1.500 millones de tokens. Sobre esa base se añaden kernels propios en `@triton.jit` (RMSNorm fusionado, SwiGLU y CrossEntropy por chunks) y un entorno de RL multi-turno con recompensas verificables.

La relevancia actual del proyecto es metodológica: documenta con métricas concretas hipótesis preregistradas (H1–H8) sobre paridad numérica con GPT-2, rendimiento de kernels, transiciones de fase en contexto, comparación RAG frente a RL, y técnicas de cuantización mixta guiada por CKA y proyección de subespacio de rango 1. No obstante, el modelo publicado en Hugging Face no incluye pesos propios del especialista; el repositorio aloja resultados, configuraciones e informes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama/Qwen (`RMSNorm`, `RoPE`, `GQA` 12Q/4KV, `SwiGLU`, máscara causal intra-documento, KV-cache) |
| Parametros totales | `sml-100m` (tamaño nominal ~100M, cifra exacta no disponible); el especialista parte de `Qwen2.5-3B-Instruct` (3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta 4/8-bit guiada por CKA (`5.33 bits/weight`); soporte de cuantización en el pipeline del proyecto |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repositorio contiene resultados, configuraciones e informes; no se documentan pesos en safetensors ni GGUF) |

## Arquitectura y entrenamiento

`sml-100m` es un decoder transformer moderno con `RMSNorm`, `RoPE`, atención con `GQA` (12 cabezas de query, 4 de key/value), `SwiGLU` y máscara causal intra-documento, con soporte de KV-cache. Se preentrenó sobre 4.000 millones de tokens de FineWeb-Edu con schedule WSD, más una rama de cooldown Chinchilla-optimal de 1.500 millones de tokens, en una NVIDIA H100 80GB SXM alcanzando 445.068 tok/s y 32,27% de MFU, con un coste total de GPU de 6,79 USD. Se generaron 15 checkpoints log-espaciados para localizar la transición de fase de inducción en contexto (H4).

El proyecto incorpora kernels propios en `@triton.jit` (RMSNorm fusionado, SwiGLU y CrossEntropy por chunks en forward y backward), validados contra los logits de GPT-2 124M con una diferencia máxima absoluta de 3,16e-6. La fase de adaptación sobre `Qwen2.5-3B-Instruct` compara prompting, RAG híbrido BM25 + 3-gram, LoRA/SFT, destilación por rechazo del profesor y GRPO multi-turno a nivel de token, con una ablación preregistrada de reward hacking (rubrica multiplicativa con compuertas frente a recompensa aditiva ingenua). La fase de cirugía aplica asignación de precisión mixta 4/8-bit guiada por CKA por bloques y proyección de subespacio de rango 1 en forma cerrada (`W' = W - r(r^T W)`).

## Capacidades

- Generación de texto con un decoder transformer propio (`sml-100m`) entrenado desde cero.
- Razonamiento multi-turno sobre incidentes de pipelines de datos con herramientas SQL (dbt Core, DuckDB, sqlglot) y herramientas MCP aisladas.
- Tool calling y uso de entorno con estado (`StatefulToolEnv`) compatible con `verifiers`.
- Razonamiento de varios pasos con inyección contrafactual de fallos (`product_bug`, `data_pipeline_artifact`, `mix_shift` más dos confundidores plantados por episodio).
- Aprendizaje por refuerzo con recompensas verificables (GRPO) y rúbrica multiplicativa con compuertas de seguridad, completitud, corrección y evidencia.
- Capacidades multilingües: solo inglés (`en`).
- Capacidades especiales del proyecto: kernels Triton personalizados, cuantización mixta guiada por CKA, proyección de subespacio de rango 1, análisis de transiciones de fase en contexto.

## Casos de uso

- Diagnóstico de incidentes en pipelines de datos: el modelo especializado se usa dentro de `StatefulToolEnv` para consultar DuckDB y dbt Core, identificar la causa raíz entre fallos inyectados y confundidores, y emitir un diagnóstico con evidencia verificable; encaja porque el entrenamiento con GRPO y rúbrica multiplicativa penaliza explícitamente la adivinación en el primer turno.
- Automatización de análisis SQL sobre almacenes DuckDB: el modelo puede generar y ejecutar consultas mediante herramientas aisladas, lo que permite construir asistentes de exploración de datos con verificación de resultados.
- Evaluación comparativa de estrategias de adaptación: el harness permite medir si conviene RAG híbrido o ajuste de pesos para una tarea concreta; útil para equipos que deciden arquitectura de un asistente interno.
- Investigación en RL con recompensas verificables: el entorno y la ablación de reward hacking sirven como banco de pruebas reproducible para estudiar GRPO multi-turno.
- Estudio de cuantización mixta: la asignación 4/8-bit guiada por CKA y la proyección de rango 1 son técnicas aplicables a la compresión de modelos de 3B en producción, con métricas de divergencia KL documentadas.
- Formación y reproducción de experimentos: el repositorio incluye manifiestos en `results/`, configuraciones YAML y comandos `make verify-h1`/`make compare-adaptation` para reproducir las hipótesis en CPU, MPS o GPU.
- Preentrenamiento de modelos pequeños desde cero: `sml-100m` y sus kernels Triton sirven como referencia para entrenar decoders de ~100M con coste de GPU inferior a 7 USD en una H100.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Paridad de logits con GPT-2 124M (H1) | `max_abs_logit_diff = 3.16e-6`; `kv_cache = 2.80e-6`; fuga cross-`<\|eos\|>` = 0.0 | Apple M4 Pro 48GB |
| Waterfall de kernels Triton + `torch.compile` (H2) | 34.850 → 472.081 tok/s (13,55x, 34,22% MFU) | 1x H100 80GB SXM |
| WSD 4.0B vs. rama Chinchilla 1.5B (H3) | `val_bpb = 1.0400` vs. `1.0446` (Δ = -0.0046; 445.068 tok/s) | 1x H100 80GB SXM |
| Transición de fase de inducción en contexto (H4) | `loss_delta = -0.1791`, `copy_acc = 0.25` en 15 checkpoints | 1x H100 80GB SXM |
| GRPO con rúbrica multiplicativa vs. aditiva (H5) | `lazy_gated = 0.00` vs. `lazy_naive = 0.75`; +16,8 pp de delta de habilidad en Qwen2.5-3B-Instruct | Apple M4 Pro 48GB |
| RAG híbrido vs. GRPO (H6) | RAG 100% en lookup de esquema; GRPO +44,0 pp en eliminación de confundidores (1,00 vs. 0,56) | Apple M4 Pro 48GB |
| Cuantización mixta CKA 4/8-bit (H7) | 30,10% menos divergencia KL vs. control de bits iguales (0,1652 vs. 0,2363); 73,33% en `sml-nano` | Apple M4 Pro 48GB |
| Proyección de subespacio de rango 1 (H8) | Residual de escritura reducido de 59,55 a 0,0701 (`ortho_residual = 9.06e-4`, `kl_collateral = 0.0961`) | Apple M4 Pro 48GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Inferencia de `sml-100m`: cabe en GPU de consumo; el proyecto reporta ejecución en Apple M4 Pro 48GB para las verificaciones H1, H5, H6, H7 y H8.
- Entrenamiento de `sml-100m`: una NVIDIA H100 80GB SXM para el preentrenamiento de 4.000 millones de tokens (coste reportado de 6,79 USD).
- Especialista sobre `Qwen2.5-3B-Instruct`: las verificaciones del proyecto se ejecutan en Apple M4 Pro 48GB; no se documentan requisitos de VRAM específicos para inferencia en GPU.
- Cuantización mixta 4/8-bit: reduce el peso medio a 5,33 bits por peso, lo que facilita el despliegue en hardware más modesto, aunque no se publican cifras de VRAM resultantes.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: 445.068 tok/s y 472.081 tok/s en H100 durante el preentrenamiento y el waterfall de kernels respectivamente; no hay datos de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Small Model Lab (`sml-100m` + especialista Qwen2.5-3B) | ~100M propio; 3B en el especialista | no disponible | Investigación aplicada con kernels Triton, GRPO y cuantización CKA | apache-2.0 | Repositorio de resultados y configuraciones en HF; pesos no documentados |
| Qwen2.5-3B-Instruct | 3B | no disponible en la información proporcionada | Modelo instructivo generalista | no disponible en esta ficha | Pesos abiertos en Hugging Face |
| GPT-2 124M | 124M | no disponible | Decoder transformer clásico | no disponible en esta ficha | Pesos abiertos |

La comparación con alternativas de la misma categoría (modelos pequeños orientados a tool use y SQL) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El repositorio de Hugging Face no documenta pesos del modelo especializado; contiene `results/`, `reports/`, `configs/` y `experiments/`. No debe asumirse que se puede cargar como un modelo listo para inferencia.
- Idioma limitado al inglés (`en`); no hay soporte multilingüe declarado.
- El dominio de especialización es estrecho: razonamiento sobre incidentes en pipelines de datos con DuckDB y dbt; el rendimiento fuera de ese dominio no está evaluado.
- Riesgo de alucinación no cuantificado en la información disponible; el proyecto mitiga parcialmente mediante recompensas verificables y compuertas de evidencia, pero no publica tasas de alucinación.
- Sesgos conocidos: no disponibles.
- La licencia apache-2.0 permite uso comercial del código y artefactos, pero debe verificarse por separado la licencia del modelo base `Qwen2.5-3B-Instruct` para usos derivados.
- Los benchmarks reportados son internos del proyecto (H1–H8) y no comparables directamente con evaluaciones estándar de la industria.
- El proyecto declara "cero números sintéticos o de relleno", pero las métricas se obtuvieron en configuraciones específicas (H100, M4 Pro) y su reproducibilidad depende del harness y las versiones de dependencias.
- No se documentan limitaciones de longitud de contexto ni comportamiento en produccion a gran escala.

## Enlaces

- Hugging Face: https://huggingface.co/mr-andrey-isachenko/small-model-lab
- Repositorio GitHub: https://github.com/mrAndreyIsachenko/small-model-lab
- Informe Sprint 1: https://github.com/mrAndreyIsachenko/small-model-lab/blob/main/reports/sprint1/summary.md
- Licencia: https://github.com/mrAndreyIsachenko/small-model-lab/blob/main/LICENSE
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
