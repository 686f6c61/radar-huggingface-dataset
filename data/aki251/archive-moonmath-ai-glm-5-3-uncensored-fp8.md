# Aki251/archive-MoonMath-ai-GLM-5.3-Uncensored-FP8

## Resumen

MoonMath Dolly2 (publicado en HuggingFace como `Aki251/archive-MoonMath-ai-GLM-5.3-Uncensored-FP8`) es una variante "abliterated" o "uncensored" del modelo GLM-5.3 de Z.ai, desarrollada por MoonMath.ai (plataforma Zro). El objetivo es reducir el comportamiento de rechazo aprendido del modelo base mediante una intervención quirúrgica sobre un conjunto reducido de módulos internos, sin reentrenamiento, preservando en la medida de lo posible las capacidades generales del modelo original.

El modelo conserva la arquitectura del GLM-5.3 base, un transformer de tipo Mixture-of-Experts con atención dispersa (etiqueta `glm_moe_dsa`), con 753.329.940.480 parámetros totales según los pesos en safetensors, y se distribuye en precisión FP8 (E4M3, blockwise 128×128). Está pensado específicamente para investigación en ciberseguridad: análisis de exploits, revisión de flujos de autenticación, análisis de abuso de servicios y flujos de trabajo de seguridad donde los rechazos del modelo base bloquean trabajo legítimo.

La relevancia actual del modelo radica en que demuestra que una abliteración selectiva (29 módulos en 21 capas) puede reducir drásticamente los rechazos sin degradar el rendimiento en tareas generales, a diferencia de abliteraciones más agresivas que provocan degeneración (bucles, generaciones truncadas). No obstante, se trata de un artefacto de investigación sin evaluación de seguridad y no afiliado a Z.ai.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención dispersa (`glm_moe_dsa`), derivada de GLM-5.3 |
| Parámetros totales | 753.329.940.480 |
| Parámetros activos | no disponible |
| Longitud de contexto | 1M tokens (según la plataforma Zro); hasta 131K tokens de salida |
| Tipos de cuantización | FP8 (E4M3, blockwise 128×128); compatible con el layout FP8 de GLM-5.3 |
| Idiomas soportados | no disponible |
| Licencia | `glm-5.3` (etiquetada como `other` en HuggingFace) |
| Formato de pesos | safetensors (tamaño del repo: 755,7 GB) |

## Arquitectura y entrenamiento

El modelo es una modificación del GLM-5.3 de Z.ai, un transformer de tipo Mixture-of-Experts con atención dispersa. No se ha reentrenado: la modificación consiste en una abliteración quirúrgica que interviene en las representaciones internas para reducir el comportamiento de rechazo aprendido. Concretamente, se modifican 29 módulos distribuidos en 21 capas: proyecciones de salida de atención (`self_attn.o_proj`) en las capas 30–62 y proyecciones de bajada de expertos compartidos (`mlp.shared_experts.down_proj`) en las capas 34–44.

El enfoque contrasta con abliteraciones más amplias que suprimen direcciones de rechazo de forma global y suelen degradar capacidades generales o provocar degeneración. Según el autor, esta intervención mínima mantiene intactas las capacidades generales del modelo base. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO, ya que el modelo no se ha reentrenado y hereda las características del GLM-5.3 original. La precisión de los pesos publicados es FP8 (E4M3, blockwise 128×128).

## Capacidades

- Generación de texto conversacional y razonamiento de propósito general, heredados de GLM-5.3.
- Razonamiento matemático: 73,3 % de precisión en AIME 2025 según el autor.
- Seguimiento de instrucciones: 91,0 % de precisión estricta a nivel de prompt en IFEval.
- Conocimiento general y razonamiento multidisciplinar: 89,0 % en MMLU-Pro (5-shot CoT).
- Mayor disposición a responder consultas de investigación en ciberseguridad: 83,1 % de tasa de respuesta en un conjunto de prompts de rechazo de ciberseguridad.
- Soporte de contexto largo: hasta 1M tokens de entrada y 131K de salida en la plataforma Zro.
- Compatibilidad con `transformers`, vLLM y SGLang mediante `trust_remote_code=True`.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Análisis de exploits en investigación de seguridad: el modelo puede describir y analizar técnicas de explotación que el modelo base rechazaría, lo que resulta útil en laboratorios de seguridad ofensiva y defensiva con fines de investigación.
- Revisión de flujos de autenticación: auditoría de mecanismos de login, gestión de sesiones y protocolos de autenticación, donde el modelo puede señalar debilidades y vectores de ataque sin deflectar la consulta.
- Análisis de abuso de servicios: evaluación de posibles usos indebidos de APIs y servicios, útil para equipos de fraude y abuso que necesitan modelar comportamientos maliciosos.
- Red teaming automatizado: generación de escenarios de ataque y prompts adversarios para evaluar la robustez de sistemas propios, aprovechando la reducción de rechazos.
- Análisis de malware y ingeniería inversa asistida: apoyo en la interpretación de comportamiento de muestras y construcción de hipótesis sobre su funcionamiento, en entornos controlados.
- Documentación de seguridad y formación: elaboración de material técnico sobre vulnerabilidades y contramedidas donde el modelo base podría negarse a entrar en detalle.
- Procesamiento de grandes volúmenes de documentación técnica: gracias al contexto de hasta 1M tokens, puede analizar repositorios de código o informes de seguridad extensos en una sola pasada.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados por un tercero):

| Benchmark | Ítems | MoonMath | Abliterated público | Δ |
|---|---|---|---|---|
| IFEval (prompt-level strict) | 100 prompts | 91,0 | 39,0 | +52,0 |
| MMLU-Pro (5-shot CoT) | 200 preguntas | 89,0 | 84,0 | +5,0 |
| AIME 2025 | 30 problemas × 2 muestras | 73,3 | 63,3 | +10,0 |
| Refusal benchmark (ciberseguridad) | 520 prompts | 83,1 % respuesta | 67,3 % respuesta | +15,8 |

En el conjunto de rechazo de ciberseguridad (atribuido al benchmark de ciberseguridad de Meta Purple Llama), MoonMath respondió 432 prompts, deflectó 88 y no rechazó ninguno de forma directa. El modelo abliterated público respondió 350, deflectó 170 y tampoco rechazó ninguno. El autor reporta además que el modelo público sufrió degeneración severa por bucles (67 generaciones degeneradas confirmadas, 53 % de respuestas de IFEval alcanzando el límite de 32K tokens), mientras que MoonMath no mostró ninguna en la misma ejecución.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint FP8 ocupa aproximadamente 755 GB en disco; en memoria se requiere un orden de magnitud similar para los pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: el autor ejecutó las evaluaciones en 8× AMD MI325X con SGLang. Para despliegue en producción se requieren nodos multi-GPU de clase数据中心 (H100, H200, MI300X/MI325X o superiores).
- No cabe en GPU de consumo (RTX 4090, 24 GB) ni en configuraciones de una sola GPU convencional.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, vLLM y SGLang. No se menciona soporte de llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | IFEval | MMLU-Pro | AIME 2025 | Licencia |
|---|---|---|---|---|---|---|
| MoonMath Dolly2 (este) | 753,3 B | 1M (Zro) | 91,0 | 89,0 | 73,3 | glm-5.3 |
| GLM-5.3 abliterated público | no disponible | no disponible | 39,0 | 84,0 | 63,3 | no disponible |
| GLM-5.3 (base, zai-org) | no disponible | no disponible | no disponible | no disponible | no disponible | glm-5.3 |

La comparación directa disponible se limita al modelo abliterated público de GLM-5.3, sobre el que MoonMath reporta mejoras sustanciales en IFEval y moderadas en MMLU-Pro y AIME 2025, además de eliminar la degeneración por bucles. No se dispone de datos comparativos frente a otros modelos de la misma categoría (abliterated de gran escala) en la información proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: reduce la calibración de seguridad a cambio de mayor utilidad; puede responder solicitudes que el modelo base rechazaría.
- No ha sido evaluado para seguridad; no debe usarse como asistente de propósito general en despliegues sensibles sin evaluación propia.
- Riesgo de alucinación y de generar contenido incorrecto o inapropiado, especialmente en dominios de seguridad ofensiva.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles.
- Licencia `glm-5.3` (etiquetada como `other`): es necesario revisar los términos del modelo base de Z.ai antes de cualquier uso comercial.
- No afiliado a Z.ai; el autor declara explícitamente que no hay garantía.
- Los benchmarks son declarados por el autor y no están verificados por terceros (`verified: false` en el model-index).
- El tamaño del checkpoint (755,7 GB) y los requisitos multi-GPU limitan su despliegue a infraestructuras de数据中心.
- El número de descargas y likes es 0 en el momento de la consulta, lo que sugiere un artefacto de investigación reciente y poco validado por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Aki251/archive-MoonMath-ai-GLM-5.3-Uncensored-FP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Blog del autor: https://zro.moonmath.ai/posts/dolly-and-me
- Plataforma Zro: https://zro.moonmath.ai
- CLI Zro (MIT): `npm install -g @moonmath-ai/zro`
