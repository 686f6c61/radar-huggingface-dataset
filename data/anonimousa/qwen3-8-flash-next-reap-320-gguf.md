# AnonimousA/Qwen3.8-Flash-Next-REAP-320-GGUF

## Resumen

Qwen3.8-Flash-Next REAP-320 es un derivado comunitario del modelo Qwen3.8-Flash-Next de Alibaba, desarrollado por el usuario AnonimousA. Se trata de una versión podada mediante el método REAP (Cerebras) que reduce el número de expertos por capa de 512 a 320, con el objetivo de reducir el tamaño del modelo y su huella de memoria manteniendo un rendimiento competitivo en tareas de código, razonamiento y agente. El modelo base es un MoE ultra-sparse con arquitectura híbrida Gated Delta Net (GDN) y Qwen Sparse Attention (QSA), con 125B parámetros más una tabla de embedding N-gram de 51B, activando 6B parámetros por token y soportando un contexto de 262K tokens.

Esta versión GGUF, calibrada sobre un corpus multi-dominio (30% agéntico, 30% código, 15% conversación, 12,5% matemáticas, 12,5% escritura), pesa 64,2 GiB en cuantización UD-Q3_K_XL, lo que permite ejecutarla en GPUs de 32 GB VRAM con ayuda de una caché de expertos. Frente a la cuantización 1-bit del modelo completo (UD-IQ1_M), esta poda ofrece un 23% más de velocidad en prefill y un 5 GiB menos de peso, a costa de una mayor tasa de fabricación en conocimiento general. No es un lanzamiento oficial de Qwen y se distribuye bajo la licencia comunitaria Qwen Community License 1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra-sparse híbrido (Gated Delta Net + Qwen Sparse Attention) |
| Parametros totales | 131.621.823.360 (según safetensors del repo) |
| Parametros activos | 6B por token |
| Longitud de contexto | 262K (modelo base) |
| Tipos de cuantizacion | UD-Q3_K_XL (derivada de Unsloth, sin requantización) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 |
| Formato de pesos | GGUF (2 shards) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura MoE ultra-sparse con 512 expertos por capa, combinando Gated Delta Net (GDN) en tres de cada cuatro capas para comprimir el historial y Qwen Sparse Attention (QSA) en la cuarta para recuperación precisa de largo alcance. La versión REAP-320 aplica poda de expertos mediante el método REAP (Cerebras Research), reduciendo a 320 expertos por capa. La selección de expertos se realizó con `llama-imatrix` sobre un corpus de 525K tokens multi-dominio, y los expertos supervivientes conservan los bits originales de la cuantización UD-Q3_K_XL de Unsloth, sin requantización. No se realizó entrenamiento adicional; solo poda y calibración de saliencia. El manifiesto de expertos seleccionados se incluye en el repositorio para reproducibilidad y para uso en runtimes de streaming de expertos SSD.

## Capacidades

- Generación de texto y conversación multi-turno.
- Razonamiento con esfuerzo configurable (`reasoning_effort` desde `low` hasta `xhigh`), aunque el valor por defecto es `xhigh` y puede producir respuestas muy largas.
- Generación de código: HumanEval-164 pass@1 de 96,3% (seed 42, effort low).
- Matemáticas y resolución de problemas (incluido en el corpus de calibración).
- Soporte de agentes y razonamiento multi-paso (el corpus de calibración incluye 30% de tráfico agéntico).
- Capacidades multilingües: no especificadas en la documentación del modelo.
- Tool calling / function calling: no especificado en la documentación, aunque el modelo base Qwen3.8-Flash-Next lo soporta.

## Casos de uso

- Asistente de programación en entornos con VRAM limitada: con 64,2 GiB en cuantización UD-Q3_K_XL y caché de expertos, puede ejecutarse en una RTX 5090 de 32 GB, ofreciendo generación de código y refactorización con una velocidad de decodificación de ~42-45 tok/s.
- Automatización de tareas agénticas: el corpus de calibración incluye un 30% de tráfico agéntico, lo que lo hace adecuado para pipelines de agentes que requieren razonamiento multi-paso y llamadas a herramientas (si el runtime lo soporta).
- Análisis de datos y resolución matemática: su rendimiento en matemáticas (incluido en el corpus) permite usarlo para verificación de cálculos, generación de informes numéricos o tutoría interactiva.
- Procesamiento de documentos largos: gracias al contexto de 262K del modelo base, puede resumir o extraer información de documentos extensos, aunque la ventana efectiva en el GGUF dependerá de la configuración de llama.cpp.
- Chat conversacional con razonamiento: para aplicaciones de soporte o consulta donde se requiere explicar el razonamiento, con control del esfuerzo de razonamiento para ajustar latencia y longitud de respuesta.
- Desarrollo de herramientas de línea de comandos: su capacidad de generar código conciso y su velocidad de prefill (337 tok/s) lo hacen útil para asistentes de terminal o generación de scripts en entornos con recursos ajustados.

## Benchmarks y rendimiento

La model card reporta las siguientes mediciones, realizadas en una RTX 5090 de 32 GB con llama.cpp y la caché de expertos del PR #27861:

| Métrica | REAP-320 (este build) | Baseline sin podar |
|---|---|---|
| Battery de 6 tareas verificadas por máquina (3 pasadas, effort medio) | 13,0 / 13,0 / 12,0 | 12 / 13 / 11 (UD-Q2_K_XL) |
| HumanEval-164 pass@1 (seed 42, effort low) | 96,3% (158/164) | 95,7% (UD-IQ1_M) |
| Sonda de nombres raros (10 generaciones sembradas) | 9/10 | 8/10 (Q2), 5/10 (IQ1_M, truncación) |
| Fabricación de conocimiento general (12 preguntas) | 25% | 0% (UD-IQ1_M) |
| Decodificación con caché de expertos LRU-128, tarjeta 32 GB | ~42-45 tok/s | ~42-46 (Q2 completo, misma caché) |
| Prefill, mismo régimen | 337 tok/s (+23%) | 273 tok/s |

No se han publicado resultados de benchmarks comparativos con otros modelos de la misma categoría más allá del baseline no podado.

## Requisitos de hardware

- VRAM estimada: 64,2 GiB en cuantización UD-Q3_K_XL, pero con la caché de expertos LRU-128 puede ejecutarse en una GPU de 32 GB VRAM (probado en RTX 5090).
- GPU recomendadas: RTX 5090 32 GB, o cualquier GPU con al menos 32 GB VRAM y soporte para llama.cpp.
- En consumer GPU: sí, en tarjetas de 32 GB como la RTX 5090. No se ha probado en GPUs de menor VRAM.
- Opciones de despliegue: llama.cpp (llama-server) con versión mainline ≥ 2026-08-27 (PR #27742 para `qwen4exp`) y el PR #27861 para la caché de expertos. No se menciona compatibilidad con vLLM u otros servidores.
- Latencia y throughput: decodificación ~42-45 tok/s, prefill 337 tok/s (medidos en RTX 5090 con caché de expertos). Las primeras peticiones tras una carga en frío son más lentas hasta alcanzar el régimen cálido tras ~3-4 peticiones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Peso | HumanEval | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next REAP-320 (este) | 131,6B totales, 6B activos | 262K | UD-Q3_K_XL | 64,2 GiB | 96,3% | Qwen Community 1.0 |
| Qwen3.8-Flash-Next REAP-256 "duo" | 131,6B totales, 6B activos | 262K | UD-Q3_K_XL (pruned) | ~83,8 GiB (original) | 95,7% (según REAP-320) | Qwen Community 1.0 |
| Qwen3.8-Flash-Next (Unsloth UD-IQ1_M) | 131,6B totales, 6B activos | 262K | UD-IQ1_M | ~69 GiB | 95,7% | Qwen Community 1.0 |

La comparativa se limita a las variantes del mismo modelo base. No se dispone de datos frente a otros modelos MoE de tamaño similar.

## Limitaciones y advertencias

- Pérdida de conocimiento mundial: la poda de expertos reduce la capacidad de almacenar conocimiento factual. En una prueba de 12 preguntas de conocimiento general, el modelo fabricó respuestas en el 25% de los casos, frente al 0% del baseline sin podar.
- Requiere una versión muy reciente de llama.cpp (≥ 2026-08-27) y el parche de caché de expertos del PR #27861; sin ellos, el rendimiento y la funcionalidad pueden verse afectados.
- El razonamiento por defecto es `xhigh`, lo que puede agotar el presupuesto de `max_tokens` y producir respuestas vacías si el límite es ajustado. Se recomienda fijar `reasoning_effort` explícitamente.
- Las primeras peticiones tras una carga en frío son lentas debido a la lectura desde disco; el rendimiento se estabiliza tras varias peticiones.
- No es un lanzamiento oficial de Qwen; es un derivado comunitario sin afiliación con Alibaba.
- La licencia Qwen Community License 1.0 puede imponer restricciones de uso comercial; se debe revisar su texto completo antes de desplegar en producción.
- No se han documentado sesgos específicos, pero al ser un modelo podado, es probable que presente sesgos heredados del modelo base y una mayor propensión a alucinaciones en dominios de conocimiento general.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/AnonimousA/Qwen3.8-Flash-Next-REAP-320-GGUF
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Documentación de Unsloth para Qwen3.8-Flash-Next: https://unsloth.ai/docs/models/qwen3.8-next
- Recetas vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Versión anterior REAP-256 "duo": https://huggingface.co/AnonimousA/Qwen3.8-Flash-Next-REAP-256-duo-GGUF
- Discusión que motivó esta versión: https://huggingface.co/AnonimousA/Qwen3.8-Flash-Next-REAP-256-duo-GGUF/discussions/2
- PR de llama.cpp para caché de expertos: https://github.com/ggml-org/llama.cpp/pull/27861
