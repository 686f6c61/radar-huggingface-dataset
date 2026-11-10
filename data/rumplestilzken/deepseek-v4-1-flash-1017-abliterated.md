# rumplestilzken/DeepSeek-V4.1-Flash-1017-abliterated

## Resumen

DeepSeek-V4.1-Flash-1017-abliterated es una compilación de pesos derivada del modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017`, publicada por el usuario rumplestilzken en Hugging Face. Se trata de una versión "abliterated": se han modificado quirúrgicamente los pesos de las proyecciones que escriben en el flujo residual para eliminar direcciones asociadas al rechazo (refusal), sin reentrenamiento ni LoRA. El resultado conserva la arquitectura, el tokenizador y el formato del checkpoint original.

El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 763.205.315.794 parámetros totales según los safetensors publicados, 40 capas, un espacio residual de 5120 dimensiones y 384 expertos enrutados en FP4 junto con expertos compartidos. El checkpoint se distribuye en FP8 e4m3 con escalas de bloque ue8m0 de 32×32, manteniendo el layout byte a byte respecto al original salvo en los 27 shards editados.

La relevancia de esta ficha es doble: por un lado documenta una técnica de ablación a nivel de pesos reproducible y verificable (operador rank-1 por capa y componente); por otro, advierte de que el artefacto no ha pasado ninguna evaluación funcional, por lo que su comportamiento en producción es incierto. No hay licencia declarada en el repositorio, lo que constituye un riesgo legal relevante para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 40 capas, espacio residual de 5120 dimensiones |
| Parámetros totales | 763.205.315.794 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 e4m3 con escalas de bloque ue8m0 (32×32); expertos enrutados en FP4 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (FP8), repo de 510,3 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 40 capas y un flujo residual de 5120 dimensiones. La capa de atención incluye proyecciones `wq_*`, `wkv`, `wo_a` y `wo_b`; la capa FFN combina expertos compartidos (`shared_experts.w2`, con salida de 2304 dimensiones) con 384 expertos enrutados cuantizados en FP4. El checkpoint se sirve en FP8 e4m3 con escalas ue8m0 en bloques de 32×32, un formato nativo del release de DeepSeek que el autor preserva íntegramente.

La modificación aplicada es una ablación rank-1 por capa y por componente sobre los dos tensores que escriben en el flujo residual: `layers.L.attn.wo_b` (forma [5120, 8192]) y `layers.L.ffn.shared_experts.w2` (forma [5120, 2304]). Para cada capa se estima una dirección unitaria `u` en el espacio residual de 5120 dimensiones y un escalar `α`, aplicando `W ← W − α·u(uᵀW)`. Las direcciones son específicas por capa (coseno ≈ 0,33 entre capas contiguas de atención, ≈ 0,05 entre familias). El schedule de `α` es una campana: nulo en las capas 0–9 y 37–39, máximo en la capa 20 (α ≈ 5,90 en atención y 5,83 en FFN) y decreciente hacia los extremos. El operador se ajustó por análisis de deltas contra el release `dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8`, con un residuo de ≈ 1,9 % de ‖W‖ atribuido al ruido de recuantización FP8. No se ha realizado ningún entrenamiento adicional ni RLHF/DPO sobre este artefacto.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base, aunque sin evaluación funcional publicada tras la ablación.
- Capacidades multimodales: el model card menciona una "vision tower" que no fue modificada, por lo que el soporte de visión del base se conserva en principio.
- Tool calling y function calling: no disponible (no documentado en la información proporcionada).
- Agentes y razonamiento multi-paso: no disponible (no documentado).
- Multilingüismo: no disponible (idiomas no declarados en el repo).
- Modo thinking: no disponible (no documentado).
- Supresión de rechazos: la modificación busca reducir la probabilidad de respuestas de rechazo, pero no se ha verificado con una batería de evaluación.

## Casos de uso

- Investigación sobre alineación y seguridad: el artefacto permite estudiar empíricamente cómo la ablación de direcciones de rechazo afecta al comportamiento del modelo, comparando contra el base con la misma semilla y prompts.
- Análisis de mecánica interpretable: las tablas de direcciones `u` y coeficientes `α` por capa (`_operator.json`) sirven para estudiar la geometría del espacio residual y la localización de representaciones de rechazo.
- Reproducción de pipelines de ablación: el código (`extract_operator.py`, `apply_operator.py`, `build_output.py`) documenta un flujo reproducible para aplicar operadores rank-1 sobre checkpoints FP8 sin alterar el layout.
- Evaluación de robustez de cuantización: al preservar el formato FP8/ue8m0 y demostrar que dos recuantizaciones independientes difieren en ≈ 1,5 % relativo, es útil para medir la estabilidad numérica del pipeline.
- Generación de contenido sin filtros en entornos controlados: para pruebas de red teaming donde se necesita un modelo que no rechace sistemáticamente prompts sensibles, siempre con supervisión y dentro de un marco legal.
- Benchmarking de modelos abliterated: comparar este artefacto con otros releases del mismo tipo (por ejemplo, el de dealignai) para medir la variabilidad entre implementaciones del mismo operador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card indica explícitamente que no se ha ejecutado ninguna evaluación funcional: ni batería de rechazos, ni KL sobre el corpus de calibración, ni comprobación de capacidades. Los únicos números publicados son de espacio de pesos (error relativo de reconstrucción del 1,45 % / 1,53 % y porcentaje de bytes idénticos del 86,7 % / 84,6 %).

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 510,3 GB en FP8; se necesita al menos ese espacio en memoria o en disco con offloading. No cabe en GPUs de consumo.
- GPU recomendadas: clústeres multi-GPU con H100 80 GB (mínimo 7–8 unidades solo para pesos, más margen para KV cache y activaciones) o A100 80 GB en configuraciones equivalentes. No se dispone de cifras oficiales de requisitos.
- GPU de consumo: no es viable. Un modelo de 763 000 millones de parámetros en FP8 excede cualquier configuración de consumo, incluso con cuantización adicional a 4 bits (≈ 380 GB).
- Opciones de despliegue: no disponibles en la información proporcionada. El formato FP8 e4m3 con escalas ue8m0 es compatible con stacks que soporten FP8 nativo (por ejemplo, vLLM o SGLang con kernels adecuados), pero no se confirma compatibilidad con este artefacto concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-abliterated (este) | 763,2 B | no disponible | no disponible | safetensors FP8 | Ablación rank-1 propia, sin evaluación funcional |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | 763,2 B | no disponible | no disponible | safetensors FP8 | Checkpoint original de DeepSeek |
| dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 | no disponible | no disponible | no disponible | safetensors FP8 | Release de referencia del que se extrajo el operador |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Sin evaluación funcional: el autor declara que no se ha ejecutado ninguna batería de rechazos, KL ni comprobación de capacidades. El comportamiento real del modelo es desconocido.
- Cobertura parcial: solo se editan 27 de las 40 capas (10–36); las capas 0–9 y 37–39 conservan el comportamiento original, por lo que la supresión de rechazos puede ser incompleta.
- Sesgos: no documentados, pero heredados del modelo base y potencialmente amplificados por la ablación, que elimina direcciones sin control selectivo.
- Alucinación: riesgo no cuantificado; la ablación puede afectar a la calibración de la incertidumbre y no hay métricas que lo verifiquen.
- Licencia: no declarada en el repositorio. El model card exige atribución a `dealignai` y enlace al repositorio de origen para cualquier derivado, pero la licencia del modelo base de DeepSeek no se especifica aquí. Uso comercial no recomendado sin aclaración legal.
- Restricciones de uso: la eliminación de rechazos puede facilitar la generación de contenido dañino; su uso en producción exige filtros externos y revisión legal.
- Formato: la dependencia de FP8 e4m3 con escalas ue8m0 limita los stacks de inferencia compatibles; no se confirma soporte en llama.cpp u Ollama.
- Tamaño: 510,3 GB de pesos hacen inviable el despliegue en hardware de consumo y encarecen cualquier experimento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rumplestilzken/DeepSeek-V4.1-Flash-1017-abliterated
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Release de referencia (dealignai): https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8
- Paper, blog o demo: no disponible en la información proporcionada.
