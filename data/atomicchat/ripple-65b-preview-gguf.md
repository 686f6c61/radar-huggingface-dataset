# AtomicChat/Ripple-65B-Preview-GGUF

## Resumen

Ripple-65B Preview es un modelo de lenguaje denso de 65.000 millones de parámetros desarrollado desde cero por Ricursive Intelligence, entrenado sobre 12 billones de tokens y sometido a un post-entrenamiento orientado a *agentic coding*. Se distribuye bajo licencia Apache-2.0 y su relevancia radica en que introduce una arquitectura propia, denominada `ricursive`, que no deriva de las familias habituales (Llama, Qwen, Mistral) y que combina atención de ventana deslizante con atención global en una proporción de cuatro bloques locales por cada bloque global.

El repositorio que nos ocupa, `AtomicChat/Ripple-65B-Preview-GGUF`, es la primera cuantización en formato GGUF del modelo original en BF16, publicada por AtomicChat el mismo día del lanzamiento (*day-0*). Incluye además un parche (`ricursive-port.patch`) que añade el soporte de la arquitectura `ricursive` a llama.cpp sobre el commit `9e2a04a`, dado que la arquitectura no está integrada todavía en el árbol upstream ni en LM Studio u Ollama.

La ficha describe tanto el modelo base como los artefactos de cuantización disponibles, con especial atención a los requisitos de despliegue, ya que el modelo no funciona con herramientas estándar sin aplicar el parche mencionado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `ricursive` (transformer denso con atención híbrida local/global) |
| Parámetros totales | 64.782.689.360 (≈65B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | hasta 1.000.000 de tokens según Ricursive; configuración del modelo: 2.097.152 |
| Tipos de cuantización | BF16 (16 bits), Q8_0 (8,5 bits), Q4_K_M (4,8 bits); en preparación cuantizaciones AD por matriz de importancia para 24, 32, 48 y 64 GB |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos originales en BF16 en el repositorio base |

## Arquitectura y entrenamiento

La arquitectura `ricursive` consta de 80 bloques con dimensión oculta de 5120 y FFN de 40960. Cada bloque incorpora cuatro RMSNorm (pre y post atención, pre y post FFN), RMSNorm por cabeza en Q y K, y una puerta sigmoide elemento a elemento sobre la salida de atención (`g_proj`). Destaca el mecanismo de *value residual*: la entrada V de cada bloque mezcla los embeddings de token escalados con un peso aprendido. La atención se reparte en 64 bloques con ventana deslizante de 1024 tokens y RoPE, frente a 16 bloques con atención global sin codificación posicional, manteniendo una proporción de cuatro locales por cada global. La FFN es SwiGLU con las activaciones de puerta y *up* recortadas a 20, y los embeddings se escalan por sqrt(5120). La atención usa 80 cabezas de consulta y 8 cabezas KV con dimensión de cabeza 128. El vocabulario es de 100.352 tokens con BPE de estilo OLMo/cl100k.

El entrenamiento se realizó desde cero sobre 12 billones de tokens, seguido de un post-entrenamiento específico para *agentic coding*. Ricursive no publica en la información disponible detalles sobre la composición del dataset, el uso de RLHF/DPO ni hiperparámetros de entrenamiento. El puerto a llama.cpp fue validado contra la implementación de referencia `modeling_ricursive.py` (fp32, transformers 4.57.6) obteniendo KLD media de 0,000000 y 100% de coincidencia en el token superior tanto en un checkpoint aleatorio de 10 bloques como en los primeros 10 bloques reales del modelo; además, `test-llama-archs -a ricursive` pasa en CPU y la plantilla de chat se renderiza byte a byte igual que `apply_chat_template`.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat embebida en los ficheros GGUF.
- Razonamiento explícito mediante modo `<think>` integrado en la plantilla de chat.
- *Agentic coding*: el post-entrenamiento está orientado a tareas de programación con agentes.
- Soporte de *tool calling* y llamadas paralelas a herramientas con resultados, verificado en la plantilla de chat.
- Capacidad de razonamiento multi-paso para flujos de agente.
- Ventana de contexto muy extensa (hasta 1M tokens según el autor), útil para repositorios completos o documentos largos.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente de programación en IDE: el modelo puede mantener conversaciones multi-turno sobre un repositorio completo gracias a su contexto de hasta 1M tokens, y su post-entrenamiento en *agentic coding* lo hace adecuado para tareas de refactorización y corrección de errores.
- Agentes autónomos de resolución de incidencias: la combinación de *tool calling* con llamadas paralelas y razonamiento multi-paso permite orquestar pipelines que consulten APIs, lean ficheros y ejecuten comandos de forma iterativa.
- Generación de código en producción con CI/CD: el soporte de herramientas y la plantilla de chat compatible con `apply_chat_template` facilitan su integración en pipelines automatizados de revisión y generación de parches.
- Análisis de documentación técnica extensa: con contexto de hasta 1M tokens puede procesar manuales, especificaciones o bases de código completas sin truncamiento, algo inviable en modelos con ventanas de 8K-32K.
- Atención al cliente técnica: conversaciones multi-turno con contexto largo y razonamiento explícito permiten mantener el hilo de incidencias complejas y justificar las respuestas.
- Investigación sobre arquitecturas alternativas: al no derivar de Llama/Qwen/Mistral, sirve como banco de pruebas para estudiar el efecto de la atención híbrida local/global y del *value residual* en tareas de código.
- Despliegue local offline: las cuantizaciones Q4_K_M (38,8 GB) y Q8_0 (68,8 GB) permiten ejecución en estaciones de trabajo con GPU de 48-80 GB, sin dependencia de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de fidelidad del puerto a llama.cpp (KLD media de 0,000000 y 100% de coincidencia en el token superior frente a la implementación de referencia), no resultados de evaluación en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: BF16 ≈129,6 GB en disco; Q8_0 ≈68,8 GB; Q4_K_M ≈38,8 GB. Añadir margen para KV cache según contexto (con 80 bloques, 8 cabezas KV de dimensión 128 y contexto largo, el KV cache crece de forma significativa).
- GPU recomendadas: para Q4_K_M, una RTX 4090 (24 GB) no es suficiente en una sola tarjeta; se requiere al menos 48 GB (A6000, L40S, A100 80GB) o reparto multi-GPU. Para Q8_0 y BF16, A100 80GB, H100 80GB o configuraciones multi-GPU.
- ¿Cabe en GPU de consumo? No en una sola unidad de 24 GB con las cuantizaciones publicadas; podría intentarse con reparto multi-GPU o con cuantizaciones AD de 24 GB aún en preparación (no publicadas en el momento de redactar esta ficha).
- Opciones de despliegue: exclusivamente llama.cpp con el parche `ricursive-port.patch` aplicado sobre el commit `9e2a04a` (compilando `llama-server` y `llama-cli`). LM Studio, Ollama y llama.cpp upstream no cargan estos ficheros todavía. No hay soporte documentado para vLLM ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota: la ejecución requiere `--jinja` para que se aplique la plantilla de chat con herramientas y `<think>`, y `-ngl 99` para descargar todas las capas en GPU. Ricursive no publica ajustes de muestreo por defecto para la Preview.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato GGUF | Notas |
|---|---|---|---|---|---|
| Ripple-65B Preview | 65B denso | hasta 1M | Apache-2.0 | Sí (con parche) | Arquitectura `ricursive` propia |
| Llama 3.1 70B | 70B denso | 128K | Llama 3.1 Community | Sí (upstream) | Soporte nativo en llama.cpp, Ollama, vLLM |
| Qwen2.5-Coder 32B | 32B denso | 128K | Apache-2.0 | Sí (upstream) | Orientado a código, soporte amplio |
| DeepSeek-Coder-V2 236B | 236B MoE (21B activos) | 128K | DeepSeek License | Parcial | MoE, requiere hardware mayor |

La comparativa se limita a datos de arquitectura, contexto y licencia; no se dispone de resultados de benchmarks de Ripple-65B Preview que permitan comparar rendimiento real frente a estas alternativas. La principal diferencia operativa es el soporte: Ripple requiere un parche específico de llama.cpp, mientras que las alternativas funcionan en herramientas estándar.

## Limitaciones y advertencias

- La arquitectura `ricursive` no está en llama.cpp upstream: sin aplicar el parche, los ficheros no cargan en llama.cpp estándar, LM Studio ni Ollama. Esto limita la portabilidad y complica el despliegue en producción.
- El modelo es una *Preview*: Ricursive no publica ajustes de muestreo por defecto ni resultados de benchmarks, lo que dificulta evaluar su calidad real antes de adoptarlo.
- Las cuantizaciones AD por matriz de importancia (24, 32, 48 y 64 GB) están anunciadas pero no disponibles en el momento de redactar esta ficha; solo hay BF16, Q8_0 y Q4_K_M.
- El contexto declarado de hasta 1M tokens no está validado con benchmarks en la información disponible; el coste de KV cache a esa longitud es muy elevado y puede hacer inviable el despliegue en hardware de consumo.
- Idiomas soportados no disponibles: no se puede confirmar el rendimiento en castellano ni en otros idiomas distintos del inglés.
- Riesgo de alucinación y sesgos: no documentados por el autor en la información disponible; al ser un modelo entrenado desde cero sobre 12T tokens, cabe esperar sesgos derivados de la composición del corpus, que no se detalla.
- Licencia Apache-2.0 permite uso comercial, pero el requisito de mantener el parche de llama.cpp y la falta de soporte upstream implican coste de mantenimiento si se actualiza llama.cpp.
- El tamaño del repositorio (237,2 GB) y de los ficheros individuales (hasta 129,6 GB en BF16) exigen almacenamiento considerable y descargas por partes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/AtomicChat/Ripple-65B-Preview-GGUF
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Parche de llama.cpp: https://huggingface.co/AtomicChat/Ripple-65B-Preview-GGUF/resolve/main/ricursive-port.patch
- llama.cpp (commit de referencia): https://github.com/ggml-org/llama.cpp
- Atomic Chat: https://atomic.chat/
- Repositorio Atomic Chat en GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de AtomicChat: https://discord.gg/8wGSsvmg4V
- X (Twitter) de AtomicChat: https://x.com/atomic_chat_hq
