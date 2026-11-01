# Oriven-Labs/DAMS-27B-GGUF

## Resumen

DAMS-27B-GGUF es el repositorio de cuantizaciones GGUF del modelo DAMS 27B (Dynamic Associative Memory System), desarrollado por Oriven Labs como modelo abierto orientado a ingeniería de software y trabajo con agentes de largo horizonte. DAMS 27B se construye sobre Qwen3.8-27B, un modelo híbrido Gated DeltaNet / Gated Attention de 64 capas, al que Oriven Labs aplicó un entrenamiento por RL de parámetros completos y una memoria asociativa propia de 16 ramas.

Esta ficha corresponde concretamente a las cuantizaciones GGUF (Q4_K_M, Q5_K_M y Q8_0) para llama.cpp, LM Studio y Ollama. Un detalle crítico: llama.cpp no soporta las capas de memoria asociativa de DAMS, por lo que estos GGUF ejecutan el modelo como una arquitectura Qwen3.5 estándar, sin las ramas de memoria. Los benchmarks oficiales se midieron con vLLM y el plugin `vllm_dams` con la memoria activada, de modo que los resultados publicados no son directamente trasladables a estos ficheros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Gated DeltaNet / Gated Attention (base Qwen3.8-27B, 64 capas); en GGUF se ejecuta como arquitectura `qwen35` estandar |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 32.768 tokens en los ejemplos de uso; maximo del modelo no disponible |
| Tipos de cuantizacion | Q4_K_M (16,8 GB), Q5_K_M (19,5 GB), Q8_0 (29,0 GB), cuantizadas desde bf16 sin imatrix |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors bf16) |

## Arquitectura y entrenamiento

DAMS 27B parte de Qwen3.8-27B, que combina capas Gated DeltaNet (una variante de atencion lineal basada en deltas) con capas Gated Attention en una arquitectura hibrida de 64 capas. Sobre esa base, Oriven Labs aplico un entrenamiento por refuerzo (RL) de parametros completos y anadio un sistema de memoria asociativa dinamica compuesto por 16 ramas de memoria (`model-dams-mem.safetensors`), orientadas a tareas de agentes de largo horizonte e ingenieria de software.

El punto clave de esta variante GGUF es que llama.cpp no implementa las capas de memoria DAMS, por lo que las cuantizaciones contienen unicamente los pesos base entrenados con RL. Segun el propio autor, en el checkpoint `it6` (el publicado) las ramas de memoria estan ligeramente entrenadas y contribuyen poco, pero el modelo evaluado en benchmarks es el bf16 completo con vLLM y el plugin `vllm_dams`. Las cuantizaciones se generaron con llama.cpp `b12004` (commit `3c809f443`) desde un GGUF bf16, sin matriz de importancia (imatrix). El codificador de vision no se convirtio: el modelo se entreno y evaluo solo con texto.

## Capacidades

- Generacion de texto conversacional con modo de razonamiento (thinking) activado por defecto en la plantilla de chat; desactivable con `--reasoning off` en llama.cpp.
- Orientacion a codigo y agentes (tags oficiales `code` y `agent`), con enfasis en ingenieria de software y tareas de agente de largo horizonte (en la variante completa con memoria; en GGUF se conserva el entrenamiento RL base).
- Plantilla de chat con prompt de sistema por defecto integrado que identifica el modelo y gestiona preguntas sobre su identidad; se sustituye al proporcionar un mensaje de sistema propio.
- Compatibilidad con servidores OpenAI-compatible mediante `llama-server --jinja`.
- Sin capacidades de vision: el codificador visual no se incluyo en la conversion.
- Soporte de tool calling: no disponible explicitamente en la informacion proporcionada.

## Casos de uso

- Generacion de codigo local: ejecutar el modelo en una GPU de estacion de trabajo (16,8 GB en Q4_K_M) para escribir, refactorizar y depurar codigo sin enviar nada a la nube, aprovechando el entrenamiento RL orientado a software.
- Agentes de razonamiento multi-paso: integrarlo en frameworks de agentes (por ejemplo, mediante `llama-server` con API OpenAI-compatible) para tareas de varios pasos; el modo thinking por defecto favorece el razonamiento antes de responder.
- Asistente de programacion offline: uso en LM Studio u Ollama como copiloto local para equipos con conectividad restringida o requisitos de privacidad estrictos.
- Prototipado de pipelines LLM: servir el modelo con llama.cpp en modo servidor para probar prompts y herramientas en un entorno OpenAI-compatible antes de escalar.
- Evaluacion comparativa de arquitecturas hibridas: util como base de experimentos para investigadores que quieran comparar el comportamiento del checkpoint RL sin memoria frente al modelo completo con `vllm_dams`.
- Chatbot de escritorio con identidad controlada: la plantilla de chat con prompt de sistema por defecto permite desplegar un asistente conversacional coherente sin configuracion adicional.
- Procesamiento de texto por lotes: con 32.768 tokens de contexto en los ejemplos y ~69 tokens/s en una RTX PRO 6000 (Q4_K_M), es viable para resumir o transformar documentos largos en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para estos ficheros GGUF. El autor indica explicitamente que todas las puntuaciones oficiales de DAMS 27B se midieron con vLLM y el plugin `vllm_dams` (memoria activada), y que no ha evaluado las cuantizaciones. El unico dato de rendimiento publicado es de inferencia: aproximadamente 69 tokens/s de generacion en una RTX PRO 6000 con Q4_K_M y thinking desactivado.

## Requisitos de hardware

- VRAM estimada para inferencia (sin contar KV cache): Q4_K_M ~16,8 GB; Q5_K_M ~19,5 GB; Q8_0 ~29,0 GB. Con 32.768 tokens de contexto, anadir margen para el KV cache.
- GPU de referencia del autor: RTX PRO 6000 (69 tokens/s en Q4_K_M, `-ngl 99`, contexto 32.768).
- Consumer GPUs: Q4_K_M cabe en una RTX 4090 (24 GB) con margen limitado para contexto largo; Q5_K_M tambien cabe en 24 GB con contexto ajustado; Q8_0 requiere 32 GB o mas (RTX 5090, RTX PRO 6000, A100 40 GB, H100).
- Ejecucion parcial en CPU/GPU posible con `-ngl` reducido en llama.cpp, a costa de latencia.
- Despliegue: llama.cpp (`llama-cli` / `llama-server` con `--jinja`), Ollama (`ollama run hf.co/Oriven-Labs/DAMS-27B-GGUF:Q4_K_M`), LM Studio. No compatible con runtimes GGUF antiguos: se necesita una version reciente de llama.cpp con soporte de arquitectura `qwen35`.
- Muestreo recomendado: temperature 1.0, top_p 0.95, top_k 20.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Memoria asociativa propia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DAMS-27B (bf16, vLLM + `vllm_dams`) | 27,3 B + 16 ramas de memoria | safetensors bf16 | Si (no soportada en llama.cpp) | Apache 2.0 | HuggingFace, Oriven-Labs/DAMS-27B |
| DAMS-27B-GGUF (esta ficha) | 27,3 B (sin ramas de memoria) | GGUF (Q4/Q5/Q8) | No | Apache 2.0 | HuggingFace, llama.cpp/Ollama/LM Studio |
| Qwen3.8-27B (base) | 27,3 B | safetensors | No | Apache 2.0 | HuggingFace, Qwen/Qwen3.8-27B |

La alternativa directa a estos GGUF es el propio DAMS-27B en bf16 con vLLM y el plugin `vllm_dams`, que es la configuracion evaluada en benchmarks y la unica que activa la memoria asociativa. Frente al modelo base Qwen3.8-27B, DAMS aporta el entrenamiento RL de parametros completos orientado a codigo y agentes.

## Limitaciones y advertencias

- Los GGUF no incluyen las 16 ramas de memoria asociativa de DAMS: funcionan como un modelo `qwen35` estandar, por lo que las puntuaciones publicadas de DAMS 27B no son aplicables a estos ficheros y las cuantizaciones no han sido evaluadas por el autor.
- Solo texto: el codificador de vision no se convirtio; el modelo se entreno y evaluo sin capacidades visuales.
- Se requiere una version reciente de llama.cpp con soporte `qwen35`; builds antiguos y runtimes que los incluyan no cargaran los ficheros.
- En el checkpoint `it6` la memoria esta ligeramente entrenada y aporta poco, segun el propio autor, lo que sugiere que el proyecto esta en fase temprana.
- Sin imatrix en la cuantizacion, por lo que la calidad en quants bajos (Q4_K_M) podria ser mejorable frente a cuantizaciones con imatrix.
- Idiomas soportados, datos de entrenamiento detallados y benchmarks propios: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion y sesgos: no disponible informacion especifica; aplicar las precauciones habituales de un LLM de 27B en produccion.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial.
- El prompt de sistema por defecto integrado en la plantilla limita lo que el modelo afirma sobre si mismo; conviene sobrescribirlo con un mensaje de sistema propio en despliegues serios.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Oriven-Labs/DAMS-27B-GGUF
- Repositorio principal del modelo (bf16, benchmarks y detalles de entrenamiento): https://huggingface.co/Oriven-Labs/DAMS-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Contacto del autor: alexander@orivenlabs.com (Oriven Labs)
