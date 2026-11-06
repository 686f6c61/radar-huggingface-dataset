# ModelCloud/Ripple-65B-Preview-GPTQ-W4A16-v2

## Resumen

Ripple-65B-Preview-GPTQ-W4A16-v2 es una cuantización de 4 bits en formato GPTQ (W4A16) del modelo base `ricursiveAI/Ripple-65B-Preview`, publicada por ModelCloud mediante su herramienta GPTQModel. El modelo original es un transformer de 65.000 millones de parámetros con una arquitectura "thin-and-deep" de atención híbrida que, además de un bloque estilo Llama, incorpora innovaciones como PeriNorm (cuatro RMSNorms por capa), atención con compuerta (`g_proj`), Q/K RMSNorm por cabeza y una mezcla de valor residual sobre `v_proj`.

El propósito de este checkpoint es hacer viable el despliegue del modelo de 65B en hardware más modesto: al reducir los pesos a 4 bits con grupo de 128 y cuantización simétrica, el consumo de memoria cae aproximadamente a una cuarta parte respecto al modelo en bf16/fp16, manteniendo las activaciones en 16 bits (W4A16). La cabeza de salida (`lm_head`) y todas las normas y escalares de valor residual permanecen en su precisión original, lo que preserva la estabilidad numérica del modelo.

La relevancia de esta publicación radica en que incluye correcciones de compatibilidad con Transformers 5.x en el código de modelado personalizado (`modeling_ricursive.py`), resolviendo fallos en la generación con caché KV que afectaban al checkpoint original. Esto permite usar `generate()` y decodificación con caché de forma directa, algo crítico para integrar el modelo en pipelines de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer "thin-and-deep" con atención híbrida (PeriNorm, gated attention, Q/K RMSNorm por cabeza, value-residual) |
| Parámetros totales | 65.000 millones (65B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GPTQ 4-bit W4A16, grupo 128, simétrica, `desc_act=false`, pack dtype `int32` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en layout GPTQ empaquetado (`qweight`, `scales`, `qzeros`, `g_idx`) |

## Arquitectura y entrenamiento

El modelo base Ripple-65B-Preview emplea una arquitectura de transformer "thin-and-deep" (muchas capas, dimensión relativamente estrecha) con atención híbrida. Sobre el bloque estándar estilo Llama añade varias modificaciones: PeriNorm, que aplica cuatro RMSNorms por capa; atención con compuerta mediante `g_proj`; Q/K RMSNorm por cabeza; y una mezcla de valor residual sobre `v_proj`. En esta cuantización se cuantizan ocho proyecciones por capa, mientras que todas las normas y el escalar de valor residual se mantienen en precisión original. La cabeza `lm_head` no se cuantiza (permanece en 16 bits).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en el modelo base. El checkpoint cuantizado se generó con GPTQModel 7.9.0 (commit `504df0434`, rama `feat/ricursive-ripple`) y se evaluó con Evalution 0.0.17 y Transformers 5.22.1.

La innovación técnica destacable de este checkpoint es la inclusión de correcciones para Transformers 5.x en `modeling_ricursive.py`: se corrige el slicing de `input_ids` con `cache_position=None`, se reconstruyen los `position_ids` por fila a partir de la máscara de padding, se ajusta `_update_causal_mask` para dimensionar el eje de claves desde `cache_position`, se ancla `_apply_sliding_window_mask` a la primera clave retenida tras la evicción, y `RicursiveForCausalLM` hereda `GenerationMixin`. Estas correcciones están propuestas en el PR #1 del modelo base y espejadas en `ModelCloud/Ripple-65B-Preview-tf5-patch`.

## Capacidades

- Generación de texto autoregresiva con decodificación con caché KV.
- Razonamiento y matemáticas (evaluado con `gsm8k_cot` según el script de evaluación incluido).
- Soporte de decodificación con padding y batches (corregido para Transformers 5.x).
- Compatibilidad con `trust_remote_code=True` para cargar el código de modelado personalizado.
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Visión, audio o modo "thinking": no disponible.

## Casos de uso

- Despliegue de un modelo de 65B en una sola GPU de 80 GB: la cuantización W4A16 reduce el peso de los parámetros a aproximadamente 32-35 GB, permitiendo cargar el modelo en una A100 80GB o H100 80GB con margen para caché KV y activaciones.
- Generación de texto en producción con Transformers 5.x: el checkpoint incluye las correcciones de `generate()` y decodificación con caché, por lo que puede integrarse directamente en servicios de inferencia basados en Transformers sin parches adicionales.
- Evaluación de razonamiento matemático: el script de Evalution incluido permite reproducir la tarea `gsm8k_cot` con `max_new_tokens=256` y batches configurables, útil para validar la calidad del checkpoint cuantizado frente al modelo base.
- Investigación sobre cuantización GPTQ: al mantener normas y `lm_head` en 16 bits y cuantizar ocho proyecciones por capa, sirve como caso de estudio para analizar el impacto de W4A16 en arquitecturas con atención híbrida y value-residual.
- Fine-tuning o adaptación posterior: al estar bajo licencia Apache 2.0 y en formato safetensors, puede servir como base para experimentos de adaptación (aunque el formato GPTQ empaquetado limita el entrenamiento directo sin de-cuantizar).
- Servicio de inferencia con GPTQModel: la librería `gptqmodel` permite cargar el checkpoint con `GPTQModel.load(..., trust_remote_code=True, device="cuda:0")`, facilitando su integración en stacks que ya usan GPTQModel.

## Benchmarks y rendimiento

La model card incluye únicamente el script de evaluación para `gsm8k_cot` con Evalution, pero no presenta los resultados numéricos obtenidos. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 32-35 GB solo para pesos en W4A16 (65B × 4 bits ≈ 32,5 GB), más overhead de activaciones, caché KV y buffers. En la práctica, se recomienda al menos 48-80 GB de VRAM según la longitud de contexto y el tamaño de batch.
- GPU recomendadas: A100 80GB, H100 80GB, o GPUs con al menos 48 GB (A6000, L40S) para contextos cortos y batch pequeño.
- ¿Cabe en consumer GPU? No de forma holgada. Una RTX 4090 (24 GB) no es suficiente para los pesos completos en W4A16; sería necesario un esquema de offloading a CPU/RAM o una cuantización más agresiva (no disponible en este checkpoint).
- Opciones de despliegue: GPTQModel (librería nativa del checkpoint), Transformers con `trust_remote_code=True`. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ripple-65B-Preview-GPTQ-W4A16-v2 | 65B | no disponible | GPTQ 4-bit W4A16 | Apache 2.0 | Hugging Face (ModelCloud) |
| Ripple-65B-Preview (base) | 65B | no disponible | bf16/fp16 | Apache 2.0 | Hugging Face (ricursiveAI) |
| Alternativas de 65B-70B (p. ej. Llama-3-70B) | ~70B | no disponible en esta ficha | GPTQ/AWQ disponibles en el ecosistema | Licencia propia | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 4 bits puede degradar la calidad respecto al modelo base en tareas sensibles a precisión numérica; no se han publicado métricas comparativas en la información disponible.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar código de modelado personalizado; conviene auditar `modeling_ricursive.py` antes de usarlo en producción.
- El checkpoint está empaquetado en layout GPTQ (`qweight`, `scales`, `qzeros`, `g_idx`) sin cachés de pesos de-cuantizados, por lo que no es directamente compatible con stacks que esperan safetensors estándar.
- La compatibilidad con Transformers 5.x depende de las correcciones incluidas; con versiones anteriores o posteriores no verificadas podría requerir el parche de tiempo de carga de GPTQModel PR #3535.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de un modelo base conviene revisar los términos del modelo original `ricursiveAI/Ripple-65B-Preview`.
- El número de descargas y likes es cero en el momento de la consulta, lo que sugiere poca validación comunitaria del checkpoint.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ModelCloud/Ripple-65B-Preview-GPTQ-W4A16-v2)
- [Modelo base ricursiveAI/Ripple-65B-Preview](https://huggingface.co/ricursiveAI/Ripple-65B-Preview)
- [PR #1 de correcciones en el modelo base](https://huggingface.co/ricursiveAI/Ripple-65B-Preview/discussions/1)
- [Espejo del parche Transformers 5.x](https://huggingface.co/ModelCloud/Ripple-65B-Preview-tf5-patch)
- [Repositorio GPTQModel](https://github.com/ModelCloud/GPTQModel)
- [GPTQModel PR #3535](https://github.com/ModelCloud/GPTQModel/pull/3535)
- [Paquete Evalution en PyPI](https://pypi.org/project/evalution/)
