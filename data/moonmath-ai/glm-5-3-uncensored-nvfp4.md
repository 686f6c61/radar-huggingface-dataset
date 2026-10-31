# MoonMath-ai/GLM-5.3-Uncensored-NVFP4

## Resumen

GLM-5.3-Uncensored-NVFP4 es una versión "abliterated" (sin refusals) del modelo GLM-5.3 de Z.ai, publicada por MoonMath-ai. El modelo original se somete a un proceso de abliteration quirúrgico que reduce el comportamiento de rechazo aprendido interviniendo en sus representaciones internas sin reentrenamiento, orientado a investigación en ciberseguridad donde los refusals bloquean trabajo legítimo (análisis de exploits, revisión de flujos de autenticación, análisis de abuso de servicios).

Esta release NVFP4 es una cuantización del checkpoint hermano FP8 (MoonMath-ai/GLM-5.3-Uncensored-FP8) en formato ModelOpt de NVIDIA: los expertos enrutados van a 4 bits (NVFP4, W4A4), el MLP denso a FP8 y el resto (atención, shared experts, MTP, embeddings, lm_head) se mantiene en BF16. Con ello el checkpoint pasa de 756 GB a 464 GB, permitiendo servir el modelo completo en un solo nodo de 8 GPUs Blackwell de 96 GB.

Con unos 390.9 mil millones de parámetros según los safetensors del repositorio, arquitectura MoE con etiqueta `glm_moe_dsa` y benchmarks declarados por el autor (MMLU-Pro 86.5, AIME 2025 76.7, IFEval 89.0), es un artefacto relevante para quien necesite un modelo de frontera sin filtros de seguridad para investigación ofensiva/defensiva, siempre asumiendo el riesgo de que genere contenido que el modelo base rechazaría. No está afiliado a Z.ai y no ha sido evaluado en cuanto a seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (glm_moe_dsa), con capa MTP y DSA indexer |
| Parametros totales | 390.942.074.880 (~391 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4, grupo 16, escalas FP8 por bloque + FP32 global) en expertos enrutados; FP8 per-tensor en MLP denso (capas 0–2); BF16 en atención, DSA indexer, shared experts, capa MTP, embeddings y lm_head |
| Idiomas soportados | no disponible |
| Licencia | other (glm-5.3) |
| Formato de pesos | safetensors (formato ModelOpt NVFP4) |

## Arquitectura y entrenamiento

El modelo base es GLM-5.3 de Z.ai, un transformer mixture-of-experts con etiqueta de arquitectura `glm_moe_dsa`, que incluye una capa MTP (multi-token prediction) y un DSA indexer. Los datos de entrenamiento del modelo base no están disponibles en la información proporcionada.

La abliteration se aplica de forma quirúrgica sobre un conjunto reducido de módulos: proyecciones de salida de atención (`self_attn.o_proj`) y proyecciones de shared experts (`mlp.shared_experts.down_proj`), en 29 módulos repartidos en 21 capas (atención en capas 30–62, shared experts en capas 34–44). Todos los módulos tocados por la abliteration permanecen en BF16 en esta release.

La cuantización NVFP4 se aplica solo a los expertos enrutados (capas 3–77), que no son tocados por la abliteration. Los pesos se dequantizan desde el checkpoint FP8 (bloques 128×128) y se requantizan; las proyecciones gate y up comparten una escala global para fusionarse en un solo kernel. Dado que los pesos de los expertos enrutados son idénticos al modelo base, las escalas de activación provienen de la calibración de NVIDIA sobre GLM-5.3, y las escalas globales por experto coinciden exactamente con las de NVIDIA en los 57.600 expertos cuantizados. El SNR de los pesos de expertos enrutados frente al padre FP8 es de ~20,4 dB. El layout replica tensor a tensor el de `nvidia/GLM-5.3-NVFP4`, por lo que carga con el mismo código de SGLang.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational)
- Razonamiento con modo thinking habilitado (parser de razonamiento `glm45` en SGLang)
- Razonamiento matemático avanzado (76.7 en AIME 2025 según el autor)
- Seguimiento de instrucciones (89.0 en IFEval prompt-level strict)
- Conocimiento general (86.5 en MMLU-Pro 5-shot CoT)
- Tool calling / function calling (parser de tool calls `glm47` en SGLang)
- Sin refusals: responde peticiones que el modelo base rechazaría, orientado a flujos de ciberseguridad
- Capacidades multilingues: no disponible (el idioma no está especificado en la model card)

## Casos de uso

- Análisis de exploits en investigación ofensiva: el modelo puede analizar y razonar sobre código de exploit y vulnerabilidades sin los refusals del modelo base, pensado para equipos de red team que necesitan respuestas técnicas directas.
- Revisión de flujos de autenticación: auditoría de implementaciones de login, OAuth, sesiones y manejo de tokens, donde el modelo puede describir fallos y vectores de ataque sin bloqueos.
- Análisis de abuso de servicios: estudio de cómo se pueden abusar APIs, rate limits o mecanismos anti-bot, útil para diseñar defensas desde la perspectiva del atacante.
- Workflows de seguridad generales: integración en pipelines de análisis de malware, triaje de IOCs o redacción de informes técnicos donde los refusals interrumpen el trabajo.
- Razonamiento matemático y criptoanálisis asistido: con 76.7 en AIME 2025 y presupuesto de generación de 65.536 tokens, es adecuado para problemas matemáticos largos con cadena de razonamiento extensa.
- Agentes con tool calling: soporta el parser `glm47`, lo que permite integrarlo en frameworks de agentes con herramientas (por ejemplo, mediante la API OpenAI-compatible de Zro o despliegues propios en SGLang).
- Seguimiento de instrucciones complejas: 89.0 en IFEval estricto lo hace fiable para tareas con restricciones de formato detalladas.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados), medidos con lm-evaluation-harness 0.4.13, sampling con temperature 1.0, top_p 0.95 y thinking activado, sobre 8× NVIDIA RTX PRO 6000 Blackwell con SGLang. Comparativa NVFP4 frente al checkpoint padre FP8:

| Benchmark | Items | FP8 | NVFP4 | Δ | Error estándar NVFP4 |
|---|---|---|---|---|---|
| IFEval (prompt-level strict) | 100 prompts | 91.0 | 89.0 | −2.0 | ±3.1 |
| MMLU-Pro (5-shot CoT) | 208 preguntas | 89.0 | 86.5 | −2.5 | ±2.4 |
| AIME 2025 | 30 problemas × 2 muestras | 73.3 | 76.7 | +3.4 | ±5.5 |

Las tres diferencias están dentro de aproximadamente un error estándar: a estos tamaños de muestra, el NVFP4 iguala al FP8. IFEval y MMLU-Pro usaron un presupuesto de generación de 32.768 tokens; AIME 2025, 65.536. No hay comparación publicada con otros modelos de terceros en la información disponible.

## Requisitos de hardware

- VRAM: el checkpoint completo ocupa 464,2 GB; el objetivo de diseño es un solo nodo de 8× 96 GB (~768 GB totales). La release FP8 padre requiere 756 GB.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell de 96 GB (probado por el autor, SM120). NVFP4 requiere GPU Blackwell (SM100/SM120); no funciona en Ampere, Hopper ni Ada.
- Consumer GPU: no cabe en ninguna GPU de consumo individual; requiere multi-GPU en nodo dedicado.
- Despliegue: SGLang 0.5.22 con `--quantization modelopt_fp4`, `--tp-size 8`, `--reasoning-parser glm45`, `--tool-call-parser glm47`, `--disable-shared-experts-fusion` (obligatorio: el shared expert en BF16 no puede fusionarse con el kernel NVFP4 de expertos enrutados) y `--trust-remote-code`. Alternativa sin GPUs: el servicio gestionado Zro de MoonMath (`dolly2-security`, API OpenAI-compatible, sin retención de prompts).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| MoonMath-ai/GLM-5.3-Uncensored-NVFP4 | ~391 B | NVFP4 + FP8 + BF16 (ModelOpt) | no disponible | glm-5.3 (other) | Abliterated, requiere Blackwell, 464 GB |
| MoonMath-ai/GLM-5.3-Uncensored-FP8 | ~391 B | FP8 + BF16 | no disponible | glm-5.3 (other) | Padre de esta release, 756 GB, probado en 8× AMD MI325X |
| nvidia/GLM-5.3-NVFP4 | ~391 B | NVFP4 (ModelOpt) | no disponible | glm-5.3 | Cuantización oficial de NVIDIA del modelo base con refusals, mismo layout tensor a tensor |

## Limitaciones y advertencias

- Modelo abliterated: elimina la calibración de seguridad a cambio de utilidad. Puede responder peticiones que el modelo base rechazaría, incluido contenido dañino.
- No ha sido evaluado en seguridad; el propio autor advierte contra su uso como asistente de propósito general en despliegues sensibles sin evaluación propia.
- Riesgo de alucinación: no disponible ningún dato específico, pero al tratarse de un modelo de ~391 B sin evaluaciones de veracidad publicadas, debe asumirse el riesgo habitual de modelos de este tamaño.
- Idiomas soportados no documentados en la model card.
- Longitud de contexto no documentada en esta ficha (aunque los benchmarks usan presupuestos de generación de hasta 65.536 tokens, lo que sugiere ventanas grandes).
- Requiere hardware Blackwell (SM100/SM120) para NVFP4: incompatible con A100 y H100.
- Licencia "other" (glm-5.3): revisar los términos de la licencia GLM-5.3 antes de uso comercial; no es una licencia permisiva estándar.
- En SGLang es obligatorio usar `--disable-shared-experts-fusion` y `--trust-remote-code`.
- Artefacto de investigación: sin garantía, no afiliado a Z.ai, con solo 52 descargas y 4 likes en el momento de la ficha, es decir, muy poco madurado por la comunidad.

## Enlaces

- Modelo: https://huggingface.co/MoonMath-ai/GLM-5.3-Uncensored-NVFP4
- Checkpoint padre FP8: https://huggingface.co/MoonMath-ai/GLM-5.3-Uncensored-FP8
- Modelo base original: https://huggingface.co/zai-org/GLM-5.3
- Cuantización NVFP4 oficial de NVIDIA: https://huggingface.co/nvidia/GLM-5.3-NVFP4
- Plataforma de inferencia Zro (MoonMath): https://zro.moonmath.ai
