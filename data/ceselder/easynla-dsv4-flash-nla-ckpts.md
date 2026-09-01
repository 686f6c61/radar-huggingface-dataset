# ceselder/easynla-dsv4-flash-nla-ckpts

## Resumen

`ceselder/easynla-dsv4-flash-nla-ckpts` es un conjunto de adaptadores LoRA de interpretabilidad (NLA, Natural Language Autoencoder) diseñados para el modelo base congelado `deepseek-ai/DeepSeek-V4-Flash-0731`. El autor, ceselder, desarrolla estos adaptadores para traducir activaciones internas de un modelo MoE de gran tamaño a explicaciones en lenguaje natural, abordando el problema de la interpretabilidad mecánica en modelos de última generación.

El repositorio contiene múltiples checkpoints de entrenamiento: warm starts de SFT (una época cada uno) sobre datos de explicaciones generadas por Sonnet-4.6 y Opus-5, y una trayectoria de RL con GRPO en curso (hasta el paso 400). La arquitectura combina LoRA de alto rango (r128, a16, rsLoRA) sobre proyecciones q_a/q_b/kv_proj, un bypass denso sobre el MoE por bloque, y una inyección de activaciones en las capas 28 y 43 mediante sustitución de embeddings con el marcador U+320E y alpha=95.5.

La relevancia actual radica en que ofrece un método reproducible para auditar modelos MoE propietarios de gran escala, con métricas de fidelidad (FVE) que alcanzan el 60,9% en el paso 400 de RL, superando la referencia de explicaciones doradas (58,9%). Es un trabajo de investigación en curso, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (r128, a16, rsLoRA) sobre DeepSeek-V4-Flash-0731 (MoE) + bypass denso por bloque MoE |
| Parametros totales | no disponible (repo de 45,6 GB; el modelo base no se detalla) |
| Parametros activos | no disponible (depende del modelo base MoE) |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los adaptadores se aplican sobre el modelo base congelado `DeepSeek-V4-Flash-0731`. La configuración LoRA usa r128, a16 y rsLoRA sobre las proyecciones q_a/q_b/kv_proj, más un LoRA de bypass denso sobre el MoE en cada bloque. La inyección de activaciones se realiza en las capas 28 y 43 mediante sustitución de embeddings en el marcador U+320E con alpha=95.5.

El entrenamiento tiene dos fases. Primero, warm starts de SFT (una época) con datos de explicaciones generadas por Sonnet-4.6 y Opus-5, en variantes AV (value adapters, PEFT) y AR (critic adapters con cabecera de valor propia). Los directorios `sft/av_opus5_union` y `sft/ar_opus5_union` usan 728k filas compartidas de Opus-5. Segundo, una trayectoria de RL con GRPO (8x128, lr 5e-5 para el actor y 4e-5 para el critic) en curso, con guardados cada 25 pasos a partir del 175. El estado del optimizador se conserva en `rl/optim_step400_backup.pt` para reanudar exactamente.

## Capacidades

- Interpretabilidad de activaciones: traduce activaciones internas de la capa 28 (y 43) de DeepSeek-V4-Flash-0731 a explicaciones en lenguaje natural.
- Doble modalidad de adaptadores: AV (value adapters, formato PEFT) y AR (critic adapters con cabecera de valor y adaptadores densos).
- Reconstrucción de explicaciones: los adaptadores AR permiten reconstruir el modelo truncado a 29 capas, inyectar y cargar para generar explicaciones.
- Métricas de fidelidad: proporciona FVE (fraction of variance explained) y val_ppl como métricas de evaluación de la calidad de las explicaciones.
- Integración con el modelo base congelado: no requiere reentrenar el modelo subyacente, solo cargar los adaptadores.
- Soporte de reanudación de entrenamiento: incluye estado del optimizador para continuar la trayectoria RL exactamente.

## Casos de uso

- Auditoría de modelos MoE propietarios: permite inspeccionar qué patrones internos activa DeepSeek-V4-Flash-0731 ante determinados prefijos, útil para equipos de seguridad y alineación que necesitan entender el comportamiento del modelo sin acceso a los pesos completos.
- Investigación en interpretabilidad mecánica: los adaptadores NLA convierten activaciones de capas concretas en texto legible, facilitando el estudio de circuitos y features en arquitecturas MoE de gran escala.
- Generación de explicaciones para datasets de entrenamiento: el dataset asociado (`easynla-dsv4-warmstart-opus5`) empareja activaciones con explicaciones doradas, útil para crear conjuntos de datos de interpretabilidad reutilizables.
- Evaluación de fidelidad de explicaciones: las métricas FVE y val_ppl permiten comparar objetivamente la calidad de distintas explicaciones generadas por el modelo, sirviendo como referencia para otros trabajos de NLA.
- Desarrollo de critics automáticos: los adaptadores AR funcionan como critics que puntúan la calidad de las explicaciones, integrables en pipelines de RL o de evaluación de modelos.
- Estudio de la transferencia entre generaciones de modelos: al usar explicaciones de Sonnet-4.6 y Opus-5 como warm starts, se puede analizar cómo se transfieren los conocimientos interpretativos entre distintos modelos de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las únicas métricas reportadas son específicas de la tarea NLA:

| Etapa | Métrica | Valor |
|---|---|---|
| SFT av_sonnet (364k) | val_ppl | 3,22 |
| SFT ar_sonnet (364k) | FVE | 47,5% |
| SFT av_opus5 (364k) | val_ppl | 3,89 |
| SFT ar_opus5 (364k) | FVE | 56,6% |
| SFT av_opus5_union (728k) | val_ppl | 3,70 |
| SFT ar_opus5_union (728k) | FVE | 58,9% |
| RL paso 400 | FVE | 60,9% (vs 58,9% referencia de explicaciones doradas) |

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 45,6 GB, por lo que se requiere una GPU con al menos 48 GB de VRAM para cargar los adaptadores junto al modelo base, aunque el dato exacto depende del tamaño de DeepSeek-V4-Flash-0731.
- GPU recomendadas: no disponible. El modelo base es de gran escala; se necesitan GPUs de clase profesional (A100, H100) o consumer de gama alta con suficiente VRAM.
- Compatibilidad con consumer GPU: no confirmado. Dado el tamaño del repositorio y la naturaleza del modelo base, es poco probable que quepa en GPUs de 24 GB sin cuantización, pero no hay datos al respecto.
- Opciones de despliegue: no disponible. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI en la documentación.
- Latencia y throughput: no disponible. No se reportan mediciones de rendimiento en inferencia.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables directos en la información proporcionada. El trabajo se enmarca en la línea de NLA (Natural Language Autoencoder), con referencias a `asher577/easynla-warmstart-data` como dataset previo, pero no se dispone de datos de otros adaptadores de interpretabilidad para DeepSeek-V4-Flash-0731 con los que comparar.

## Limitaciones y advertencias

- Trabajo de investigación en curso: la trayectoria RL está incompleta (paso 400 de 1000) y los resultados pueden cambiar en versiones futuras.
- Dependencia del modelo base: los adaptadores solo funcionan sobre `deepseek-ai/DeepSeek-V4-Flash-0731` congelado; no son portables a otras versiones o arquitecturas.
- Sobreajuste potencial: los warm starts usan explicaciones de Sonnet-4.6 y Opus-5, lo que puede sesgar las explicaciones hacia el estilo de esos modelos.
- Riesgo de alucinación en explicaciones: como todo generador de texto, las explicaciones pueden ser plausibles pero incorrectas; la métrica FVE del 60,9% indica que aún hay margen de error.
- Restricciones de uso comercial: la licencia MIT permite uso comercial, pero el modelo base DeepSeek-V4-Flash-0731 puede tener su propia licencia que debe verificarse por separado.
- Sin soporte de producción: no hay documentación sobre despliegue, escalado o mantenimiento; no es adecuado para entornos productivos sin validación adicional.
- Idiomas no especificados: no se indica qué idiomas soportan las explicaciones generadas; probablemente inglés por los datos de entrenamiento, pero no está confirmado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ceselder/easynla-dsv4-flash-nla-ckpts
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Dataset de warm start: https://huggingface.co/datasets/ceselder/easynla-dsv4-warmstart-opus5
- Seguimiento de entrenamiento (wandb): https://wandb.ai/octahedral-systems/easynla-dsv4
- Referencia de dataset previo: https://huggingface.co/datasets/asher577/easynla-warmstart-data (mencionado en la documentación)
