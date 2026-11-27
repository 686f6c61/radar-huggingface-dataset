# ronke21/rlcl-Qwen2.5-1.5B-Instruct-msvamp-s123

## Resumen

El modelo `rlcl-Qwen2.5-1.5B-Instruct-msvamp-s123` es un ajuste fino (fine-tuning) del modelo Qwen2.5-1.5B-Instruct publicado por el usuario ronke21 en Hugging Face. Se trata de una fusión de pesos LoRA (tag `lora-merged`) sobre el modelo base, orientada a la investigación sobre olvido catastrófico (catastrophic forgetting), como indican los tags `rlcl` y `forgetting`. El repositorio es de carácter experimental y no cuenta con documentación técnica publicada más allá de los metadatos de la model card.

El modelo conserva la arquitectura y el tamaño del Qwen2.5-1.5B-Instruct original: aproximadamente 1.543 millones de parámetros (1,5B), lo que lo sitúa en la categoría de modelos pequeños aptos para inferencia en hardware de consumo. El contexto, los idiomas y la licencia no están especificados en la información disponible, aunque por herencia del modelo base cabría esperar las capacidades de Qwen2.5, dato que no puede confirmarse sin documentación.

Su relevancia es limitada y circunscrita al ámbito de la investigación: se publica como artefacto de un experimento de ajuste con regularización (probablemente relacionada con "rlcl", posiblemente un método de control de olvido), y su acceso está restringido (gated), lo que exige aceptar condiciones en Hugging Face antes de su descarga. No está pensado como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2, heredada del modelo base) |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Tamano del repositorio | 3,1 GB |
| Acceso | restringido (gated) |
| Fecha de creacion | 2026-11-27 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención causal estándar, normalización RMSNorm y embeddings rotatorios (RoPE), según la familia Qwen2. No se dispone de detalles específicos sobre la configuración de capas, cabezas de atención ni dimensión oculta en la información proporcionada, más allá del recuento total de parámetros.

El proceso de entrenamiento consistió en un ajuste fino mediante LoRA cuyos pesos se han fusionado en el modelo final (tag `lora-merged`). Los tags `rlcl` y `forgetting` sugieren que el experimento estudia el olvido catastrófico durante el ajuste, posiblemente con alguna técnica de regularización o control. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otra etapa de alineación posterior. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a instrucciones, en la medida en que el ajuste no haya degradado estas capacidades (aspecto no verificado).
- Soporte de tool calling y function calling: no disponible en la documentación; el modelo base Qwen2.5 lo soporta, pero no se confirma en este ajuste.
- Capacidades de agente y razonamiento multi-paso: no disponibles.
- Capacidades multilingües: no disponibles (el modelo base soporta varios idiomas, pero no se documenta el efecto del ajuste).
- Modo de pensamiento (thinking), visión o audio: no disponibles.
- El propósito declarado del ajuste es el estudio del olvido catastrófico, no una mejora funcional concreta.

## Casos de uso

- Investigación sobre olvido catastrófico: el modelo sirve como artefacto reproducible para estudiar cómo un ajuste LoRA fusionado afecta a las capacidades del Qwen2.5-1.5B-Instruct original, comparando respuestas antes y después del ajuste.
- Evaluación de técnicas de regularización: útil para analizar si la metodología asociada a `rlcl` preserva el rendimiento en tareas del modelo base (preguntas de conocimiento, matemáticas básicas, instrucciones).
- Experimentos académicos de ajuste eficiente: al ser un LoRA fusionado de 1,5B, permite reproducir el pipeline en una sola GPU de consumo y comparar con otros ajustes similares.
- Pruebas de regresión de capacidades: sirve para construir baterías de evaluación que midan la degradación de habilidades tras el fine-tuning en modelos pequeños.
- Docencia y formación: ejemplo práctico de cómo se publica un modelo ajustado con metadatos mínimos y acceso restringido, útil para enseñar buenas prácticas de documentación.
- No se recomienda su uso en producción, atención al cliente, generación de código ni aplicaciones comerciales, dado que no hay documentación de calidad, licencia ni evaluación de sesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 4-5 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,6-2 GB de pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 0,8-1,2 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4070); para cuantización 4/8 bits, GPUs con 4-6 GB (GTX 1650, RTX 3050).
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 8 GB o más en FP16, y en tarjetas de 4-6 GB con cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`); llama.cpp/Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| rlcl-Qwen2.5-1.5B-Instruct-msvamp-s123 | 1,5B | no disponible | no disponible | gated en HF | Ajuste experimental sobre Qwen2.5 |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens (según documentación oficial de Qwen) | Apache 2.0 (según Qwen) | publico | Modelo base, con documentación completa |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | 32.768 tokens (según Qwen) | Apache 2.0 (según Qwen) | publico | Alternativa más ligera de la misma familia |
| Llama-3.2-1B-Instruct | 1,2B | 128.000 tokens (según Meta) | Llama 3.2 Community License | publico | Alternativa de tamaño similar con contexto mayor |

Nota: los datos de contexto y licencia de los modelos comparables provienen de su documentación pública habitual; no se han verificado en la información proporcionada para este modelo concreto.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que añade fricción para su uso y automatización.
- Documentación mínima: sin model card detallada, sin idiomas declarados, sin contexto documentado y sin benchmarks.
- Riesgo de olvido catastrófico: el propio propósito del experimento (`forgetting`) sugiere que el ajuste puede haber degradado capacidades del modelo base; no hay evaluación que lo descarte.
- Riesgo de alucinación: inherente a los modelos de 1,5B, especialmente en tareas de conocimiento factual y razonamiento complejo.
- Sesgos: no evaluados ni documentados; el modelo base Qwen2.5 puede presentar sesgos de género, culturales y lingüísticos.
- Sin soporte de cuantizaciones publicadas: no hay GGUF ni AWQ en el repositorio, lo que limita el despliegue en entornos de bajos recursos sin conversión manual.
- No apto para producción: ausencia de evaluación de seguridad, alineación y robustez.
- Fecha de creación futura (2026-11-27): metadato atípico que conviene verificar antes de confiar en el repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/ronke21/rlcl-Qwen2.5-1.5B-Instruct-msvamp-s123
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Paper de Qwen2.5 (informe técnico): https://arxiv.org/abs/2412.15115
- Documentación de transformers: https://huggingface.co/docs/transformers
- Documentación de text-generation-inference: https://huggingface.co/docs/text-generation-inference
