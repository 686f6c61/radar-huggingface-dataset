# Reallexi-llc/Lexi-1B

## Resumen

Lexi-1B es un checkpoint base de 1.001.053.824 parámetros publicado por Reallexi LLC bajo el identificador `Reallexi-llc/Lexi-1B`. Según la model card, se trata de un modelo independiente ("standalone") que incluye pesos, configuración y tokenizer propios para inferencia o entrenamiento posterior. La arquitectura declarada en los metadatos es `qwen2`, es decir, un transformer decoder-only de la familia Qwen2, aunque el autor indica que los identificadores de arquitectura en `config.json` se mantienen compatibles para carga y que la evidencia de linaje debe consultarse en `model_surgery.json`.

El modelo se ha producido con la plataforma Reallexi AI Model Builder, descrita como una herramienta de entrenamiento "local-first". El propio autor lo marca con el estado `trained_needs_quality_review` y recomienda revisar los resultados en conjuntos de validación y en tareas representativas antes de desplegarlo. La model card reporta una pérdida en held-out de 2.040 tokens de 3,3852 antes de un proceso de "healing" y 2,2220 después, lo que sugiere una intervención de reparación o ajuste sobre el checkpoint.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo muy reciente (publicado el 26 de noviembre de 2026), sin descargas ni interacciones registradas, sin licencia declarada y sin datos de benchmarks publicados. Su interés principal es como artefacto de evaluación de la plataforma de entrenamiento de Reallexi y como posible base para fine-tuning, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (identificador `qwen2` en la configuración) |
| Parametros totales | 1.001.053.824 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "All rights reserved" de Reallexi LLC, sin términos de licencia abierta) |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La configuración declara la arquitectura `qwen2`, lo que implica un transformer decoder-only con atención causal estándar, capas de normalización RMSNorm y las convenciones habituales de la familia Qwen2 (RoPE para posiciones, MLP con activación SwiGLU). No se dispone de información sobre el número de capas, dimensión oculta, número de cabezas de atención ni vocabulario del tokenizer, más allá del recuento total de parámetros.

En cuanto al entrenamiento, la model card no detalla el volumen de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO o SFT. Sí menciona un proceso de "healing" que redujo la pérdida en held-out de 3,3852 a 2,2220 sobre 2.040 tokens, y remite a `model_surgery.json` para el linaje y la evidencia de verificación. El estado declarado, `trained_needs_quality_review`, indica que el autor no considera el modelo validado para uso directo.

## Capacidades

- Generación de texto conversacional: la model card lo etiqueta como `conversational` y `text-generation`.
- Compatibilidad con `text-generation-inference` y `endpoints_compatible`, según los tags del repositorio.
- Carga mediante `transformers` con pesos en safetensors.
- Capacidad de servir como base para entrenamiento adicional o fine-tuning, según la propia descripción del autor.
- Razonamiento, código, matemáticas, visión, audio, tool calling, function calling y agentes multi-paso: no disponible (no se documentan en la información proporcionada).
- Capacidades multilingües: no disponible.

## Casos de uso

- Fine-tuning supervisado sobre dominio propio: al ser un checkpoint base de ~1B parámetros con pesos en safetensors y configuración compatible con `transformers`, puede servir como punto de partida para SFT en tareas verticales (clasificación de tickets, extracción de entidades) con un coste de cómputo moderado.
- Experimentación con la plataforma Reallexi AI Model Builder: el modelo es el artefacto de salida de dicha herramienta, por lo que resulta útil para evaluar la calidad del pipeline de entrenamiento y del proceso de "healing" descrito en la model card.
- Prototipado de asistentes conversacionales en local: su tamaño de 1B permite ejecución en GPU de consumo, lo que facilita pruebas de concepto de chat multi-turno antes de migrar a modelos mayores.
- Evaluación comparativa de checkpoints: sirve como referencia para medir la pérdida en held-out (2,2220 tras healing) frente a otros modelos de tamaño similar entrenados con la misma plataforma.
- Generación de texto en pipelines de `text-generation-inference`: los tags indican compatibilidad con TGI y con endpoints, lo que permite desplegarlo en infraestructura estándar de inferencia para pruebas internas.
- Base para investigación sobre linaje de modelos: el archivo `model_surgery.json` documenta el proceso de modificación y verificación, lo que lo hace útil para estudiar técnicas de reparación de checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado por el autor es la pérdida en held-out sobre 2.040 tokens: 3,3852 antes del healing y 2,2220 después. No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estándar.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 2 GB solo para pesos, más overhead de activaciones y KV cache (el repositorio ocupa 2,0 GB).
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para pesos; en 4 bits, en torno a 0,5-0,7 GB, aunque no se documentan variantes cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16 con contexto moderado; cabe en RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problema.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de tarjetas con 6 GB o más, aunque la longitud de contexto no está documentada y condiciona el consumo de KV cache.
- Opciones de despliegue: `transformers` (soporte confirmado), `text-generation-inference` (tag `text-generation-inference`), endpoints compatibles. No se confirma soporte de llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Lexi-1B | 1.001.053.824 | no disponible | no disponible ("All rights reserved") | Hugging Face, 0 descargas |
| Qwen2.5-1.5B | ~1.500 millones | 32.768 tokens (versión base) | Apache 2.0 | Hugging Face, ampliamente adoptado |
| Llama 3.2 1B | ~1.200 millones | 128.000 tokens | Llama 3.2 Community License | Hugging Face, ampliamente adoptado |
| SmolLM2-1.7B | ~1.700 millones | 8.192 tokens | Apache 2.0 | Hugging Face, ampliamente adoptado |

La comparación es aproximada: los datos de los modelos alternativos provienen de conocimiento general y no de la información proporcionada en esta búsqueda. Lexi-1B se posiciona en la misma franja de tamaño que estos modelos, pero carece de licencia clara, de documentación de contexto y de benchmarks publicados, lo que limita su comparabilidad directa.

## Limitaciones y advertencias

- Estado declarado por el autor: `trained_needs_quality_review`; no está validado para despliegue.
- Licencia no disponible: la model card indica "All rights reserved" de Reallexi LLC sin términos de uso comercial explícitos, lo que impide asumir permisos de uso en producción.
- Sin datos de benchmarks ni de evaluación en tareas representativas más allá de la pérdida en held-out.
- La pérdida en held-out de 2,2220 tras el healing sigue siendo alta y sugiere una calidad de generación limitada.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo.
- Idiomas soportados no documentados: riesgo de comportamiento deficiente fuera del idioma de entrenamiento, que se desconoce.
- Sin descargas ni interacciones registradas: no hay evidencia de uso comunitario ni de validación externa.
- Riesgo de alucinación: no cuantificado, pero esperable en un checkpoint base de 1B sin ajuste conversacional documentado.
- El linaje exacto (modelos y datasets upstream) solo se documenta en `model_surgery.json`, no en la model card; conviene revisarlo antes de cualquier uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Reallexi-llc/Lexi-1B
- Plataforma Reallexi AI Model Builder: https://llm.reallexi.io
- Repositorio de Hugging Face del autor: https://huggingface.co/Reallexi-llc
