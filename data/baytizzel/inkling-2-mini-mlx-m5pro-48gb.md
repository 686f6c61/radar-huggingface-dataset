# baytizzel/Inkling-2-Mini-MLX-M5Pro-48gb

## Resumen

Inkling 2 Mini es un modelo de lenguaje multimodal (texto e imagen) desarrollado por Thinking Machines, distribuido en este repositorio como una conversión comunitaria a formato MLX para Apple Silicon. Se trata de un transformer con arquitectura de mezcla de expertos (MoE) y estructura "looped": los 12 layers centrales de un total de 24 se ejecutan tres veces, dando lugar a 48 pasadas de layer por token. El modelo cuenta con 26.388.641.280 parámetros totales (26,2B según el autor) y aproximadamente 3,4B activos por token, lo que lo sitúa en la gama de modelos capaces de correr en hardware de consumo de gama alta.

El repositorio no es una recompresión: los pesos son los del release original de Thinking Machines, reempaquetados en los formatos `nvfp4` y `mxfp8` de MLX sin recuantizar. Además de los pesos, el autor incluye un fork de mlx-vlm con correcciones para el decode, el prefill y conversaciones largas, junto con la configuración de lanzamiento y los resultados medidos en un MacBook Pro M5 Pro de 48 GB. Esto lo convierte en una ficha especialmente relevante para quienes quieran desplegar el modelo en local sobre macOS sin recurrir a GPUs NVIDIA.

La relevancia actual reside en que demuestra un caso real de inferencia de un MoE de 26B con ventana de contexto de 262.144 tokens en un portátil Apple Silicon, con velocidades de decode de 34,2 tok/s (42,2 tok/s con la opción de velocidad de 8 bits) y prefill de 838 tok/s para prompts de 3,3K tokens. La licencia Apache 2.0 del modelo base permite uso comercial, aunque las condiciones concretas deben verificarse en el release original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con layers "looped" (12 de 24 layers ejecutados 3 veces; 48 pasadas por token) |
| Parametros totales | 26.388.641.280 (26,2B) |
| Parametros activos | ~3,4B por token (MoE) |
| Longitud de contexto | 262.144 tokens (medido; conversación de 300K medida, 400K solo a nivel de engine) |
| Tipos de cuantizacion | NVFP4 (expertos en layers 0–19), MXFP8 (layers 20–23), resto en BF16; opción de velocidad de 8 bits para decode |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX layout), con `mtp.safetensors` para decodificación especulativa DSpark (desactivado en esta configuración) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos con una innovación estructural denominada "looped transformer": de los 24 layers totales, los 12 centrales se reutilizan tres veces, lo que resulta en 48 pasadas de layer por cada token procesado. Esta compartición de parámetros entre pasadas incrementa la profundidad efectiva sin aumentar el número de pesos, manteniendo el cómputo activo bajo (~3,4B parámetros por token) frente a los 26,2B totales. El modelo acepta entradas de texto e imagen, tal como refleja el pipeline `image-text-to-text`.

En cuanto al entrenamiento, la información proporcionada no detalla el número de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El release original incluye un drafter de decodificación especulativa DSpark (`mtp.safetensors`, 0,64 GB), lo que sugiere que el modelo fue entrenado con soporte para decodificación especulativa, aunque en esta configuración MLX el drafter está desactivado. La plantilla de chat incorpora un parámetro `reasoning_effort` con seis niveles (`none`, `minimal`, `low`, `medium`, `high` por defecto, `xhigh`), lo que indica un entrenamiento orientado a razonamiento con control explícito del esfuerzo.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo (hasta 262.144 tokens medidos).
- Razonamiento con control de esfuerzo mediante `reasoning_effort`; el modelo genera un bloque de razonamiento incluso en `none`, devuelto como `reasoning_content`.
- Comprensión de imágenes (pipeline `image-text-to-text`), con processor propio incluido en el repositorio.
- Soporte de conversaciones largas con reutilización de prefijo en RAM y gestión de caché por conversación.
- Capacidad de agente: el autor reporta una sesión de agente reproducida hasta 90K tokens que "completa" sin releer la conversación en cada turno.
- Decodificación especulativa disponible a través del drafter DSpark del release (desactivada por defecto en esta configuración).
- Capacidades multilingües: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en macOS: el modelo mantiene conversaciones multi-turno con caché de prefijo en RAM y respuestas de seguimiento en ~2 s con 150K tokens de contexto y ~2,4 s con 300K, lo que lo hace adecuado para asistentes personales de larga duración en un portátil.
- Análisis de documentos extensos: con 262.144 tokens de ventana y prefill de 838 tok/s, puede ingerir prompts de 12,9K tokens en ~15 s y mantener el contexto completo para tareas de resumen, extracción o preguntas sobre el documento.
- Procesamiento de imágenes con texto: al ser un modelo `image-text-to-text`, sirve para describir imágenes, responder preguntas sobre capturas o extraer información de documentos escaneados en un flujo local.
- Desarrollo de agentes autónomos: la sesión de agente reproducida a 90K tokens que completa sin releer sugiere uso en pipelines de razonamiento multi-paso donde el estado de la conversación debe persistir.
- Prototipado e investigación en Apple Silicon: al incluir un fork de mlx-vlm con correcciones y scripts de verificación contra el checkpoint original, es útil como base reproducible para experimentar con MoE looped y cuantización NVFP4/MXFP8 en MLX.
- Servicio local compatible con OpenAI API: el repositorio incluye un servidor en `127.0.0.1:8082` con endpoint `/v1/chat/completions`, lo que permite integrarlo como backend en herramientas que hablan el protocolo de OpenAI sin salir del equipo.
- Evaluación de decodificación especulativa: el drafter DSpark incluido permite comparar decode estándar frente a especulativo en hardware Apple, aunque en la configuración medida está desactivado.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de serving en un MacBook Pro M5 Pro de 48 GB (2026-11-20, actualizado 2026-11-22), no resultados de benchmarks académicos:

| Métrica | inkling2-mlx stock | Esta configuración |
|---|---:|---:|
| Decode | 24,0–24,8 tok/s | 34,2 tok/s (42,2 tok/s con opción de 8 bits) |
| Prefill, prompts de 3,3K tokens | 557–611 tok/s | 838 tok/s |
| Prefill, prompts de 12,9K tokens | 591–595 tok/s | 836 tok/s |
| Prompt de 125K tokens en frío | parada por guardia de memoria | ~300 s, 3/3 códigos ocultos encontrados |
| Ventana de contexto | — | 262.144 tokens |
| Seguimiento en conversación larga | rechazado | ~2 s a 150K, ~2,4 s a 300K |
| Decode con ~100K / ~300K tokens en contexto | — | 23,7 / 19,3 tok/s |
| Sesión de agente reproducida a 90K tokens | — | completa |
| Memoria a 300K (opción de velocidad) | — | 31 GB de footprint en el pico; 23% de 48 GB libres junto a ~9 GB de otras apps |

Comparativa incluida por el autor: el UD-Q4_K_XL GGUF de Unsloth sobre el build de llama.cpp de Unsloth decodifica a 28,4 tok/s (recuantiza los pesos de atención) y hace prefill a 252–304 tok/s.

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria: Apple Silicon Mac con 48 GB o más. Thinking Machines indica 32 GB como mínimo, pero con menos de 48 GB hay que usar una ventana más corta.
- Los pesos ocupan 20 GB en disco (19,53 GB de safetensors más el drafter de 0,64 GB) y el repositorio completo 20,2 GB; se necesitan ~23 GB libres en disco.
- Caché KV: los 8 pasadas de layers globales añaden 16,9 KB por token con caché int8 (4,4 GB a 256K); en BF16 serían 32 KB por token.
- Para contextos largos en 48 GB, el autor eleva el límite wired de la GPU: `sudo sysctl iogpu.wired_limit_mb=43008` (42 GiB, no persiste tras reiniciar).
- GPU: el modelo está pensado para Apple Silicon (M5 Pro de 48 GB como referencia medida); no hay datos de rendimiento en A100, H100 o RTX 4090 en la información disponible.
- Despliegue: fork de mlx-vlm en un venv con 72 paquetes fijados (MLX 0.32.4, transformers 5.23.0, torch 2.15.0 para el image processor), servidor compatible con OpenAI API en `127.0.0.1:8082`. No hay soporte documentado de vLLM, llama.cpp u Ollama en este repositorio.
- Throughput y latencia: según la tabla de benchmarks anterior (34,2 tok/s de decode, 838 tok/s de prefill, ~2 s de seguimiento a 150K).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento medido (decode / prefill) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling 2 Mini MLX (este repo) | 26,2B totales, ~3,4B activos | 262.144 tokens | 34,2 tok/s / 838 tok/s (M5 Pro 48 GB) | Apache 2.0 | Hugging Face, formato MLX |
| Inkling 2 Mini stock (inkling2-mlx) | 26,2B totales, ~3,4B activos | no disponible | 24,0–24,8 tok/s / 557–611 tok/s | Apache 2.0 | Hugging Face |
| Unsloth UD-Q4_K_XL GGUF (llama.cpp) | 26,2B totales, ~3,4B activos | no disponible | 28,4 tok/s / 252–304 tok/s | Apache 2.0 (heredada) | Hugging Face, formato GGUF |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo puede entrar en bucles mientras razona, según advierten Thinking Machines; es obligatorio fijar `max_tokens` en todas las peticiones.
- El modelo escribe un bloque de razonamiento incluso con `reasoning_effort: none`, lo que consume tokens y añade latencia si no se gestiona.
- El servidor no rechaza peticiones que excedan la ventana; el cliente debe mantener prompt + `max_tokens` dentro de los 262.144 tokens.
- La compactación automática del servidor resume turnos antiguos al alcanzar 3/4 de la ventana; debe desactivarse explícitamente (`"context_management": []`) si se quiere conservar el contexto completo.
- Los pesos están cuantizados a NVFP4/MXFP8 en MLX; la calidad frente al checkpoint BF16 original no se reporta con métricas en la información disponible, más allá de las comprobaciones de códigos ocultos en el prompt de 125K.
- La decodificación especulativa DSpark está desactivada en esta configuración, por lo que el rendimiento reportado no la incluye.
- El rendimiento está medido exclusivamente en un M5 Pro de 48 GB; en otros chips Apple o con menos memoria los números variarán y puede ser necesario reducir la ventana.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Licencia Apache 2.0 en el modelo base, lo que en principio permite uso comercial; conviene verificar las condiciones del release original de Thinking Machines (incluida la política de uso aceptable, si existe).
- El repositorio es una conversión comunitaria (`baytizzel`), no una publicación oficial de Thinking Machines; la responsabilidad sobre los scripts y el fork de mlx-vlm recae en el autor del repo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/baytizzel/Inkling-2-Mini-MLX-M5Pro-48gb
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Resultados de serving (referenciado en la model card): `results/RESULTS.md` dentro del repositorio
- Scripts de construcción y configuración: `scripts/build-engine.sh`, `scripts/render-config.py`, `scripts/verify-against-release.py` dentro del repositorio
- Checksums: `SHA256SUMS` dentro del repositorio
- Paper, blog o demo oficial: no disponible en la información proporcionada
