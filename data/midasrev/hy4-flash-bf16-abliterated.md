# MidasRev/Hy4-flash-BF16-abliterated

## Resumen

Hy4-flash-BF16-abliterated es una variante del modelo base tencent/Hy4-flash a la que se le ha aplicado una técnica de "abliteration" a nivel de pesos, es decir, una ortogonalización permanente de determinadas matrices para eliminar la alineación de seguridad del modelo original. Lo publica el usuario MidasRev en Hugging Face y se distribuye en precisión BF16 completa, sin pérdida de calidad por cuantización. El resultado es un modelo de gran tamano (220.251.201.958 parámetros, unos 220,3 mil millones) que conserva la arquitectura del original pero con los mecanismos de rechazo neutralizados.

La relevancia de esta ficha es doble: por un lado documenta una práctica creciente en la comunidad open source (la publicación de versiones "abliterated" de modelos grandes); por otro, advierte de que el modelo base pertenece a Tencent y de que esta variante no declara licencia, idiomas ni pipeline, lo que limita seriamente su uso en producción. La model card es extremadamente escueta y se limita a describir el procedimiento técnico aplicado.

No se dispone de información publicada sobre la arquitectura interna del modelo base (más allá de las referencias a expertos enrutados y capas "engram"), ni sobre el entrenamiento, los datos utilizados o los resultados de benchmarks. Todo lo que sigue se basa exclusivamente en los metadatos y la model card disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) segun los nombres de capas de la model card (`mlp.routed_expert_up_proj`, 512 expertos enrutados, `shared_experts`); detalles completos no disponibles |
| Parametros totales | 220.251.201.958 (aprox. 220,3 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (esta version); NVFP4 disponible en un repositorio hermano |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La model card indica que el modelo base es tencent/Hy4-flash y que la intervención se ha aplicado sobre las capas `1..41` con los parámetros `alpha=1.25`, `norm_preserving=True` y `sandwich_norm_compensated=True`. Las matrices afectadas son `self_attn.o_proj` (41 capas), `mlp.routed_expert_up_proj` (cuello de botella de los 512 expertos enrutados, 41 capas), `mlp.shared_experts.down_proj` (41 capas), `engram_layer.value_proj` (4 capas) y `embed_tokens` (1 capa). Esta nomenclatura confirma una arquitectura de mezcla de expertos con atención estándar y un componente adicional denominado "engram".

El procedimiento de abliteration consiste en proyectar ortogonalmente los pesos para eliminar la dirección asociada al comportamiento de rechazo, preservando la norma y compensando el efecto en las capas posteriores. No se ha publicado información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) ni sobre el proceso exacto de ortogonalización más allá de los parámetros citados. Tampoco se documenta si la intervención afecta al rendimiento general del modelo.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas del modelo base tencent/Hy4-flash, sin documentar en esta ficha.
- Mezcla de expertos: 512 expertos enrutados más expertos compartidos, lo que sugiere un modelo de gran capacidad por parámetro activo (dato no confirmado).
- Componente "engram": capas adicionales (`engram_layer`) cuyo propósito no se detalla en la información disponible.
- Comportamiento sin alineación: la abliteration elimina los mecanismos de rechazo, por lo que el modelo responderá a peticiones que el original rechazaría.
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar empíricamente cómo la ortogonalización de pesos afecta al comportamiento de rechazo y a la coherencia general, comparándolo con el modelo base.
- Análisis de robustez de filtros: útil para evaluar si los sistemas de moderación externos (clasificadores, guardrails) siguen funcionando cuando el modelo subyacente ha sido modificado a nivel de pesos.
- Experimentación con modelos MoE de gran tamano: con 220,3 mil millones de parámetros en BF16, sirve para probar técnicas de inferencia distribuida y paralelismo de expertos en entornos de investigación con hardware suficiente.
- Estudio de la técnica de abliteration: los parámetros documentados (`alpha=1.25`, compensación de norma, capas afectadas) permiten reproducir y comparar variantes del procedimiento.
- Evaluación de degradación de capacidades: comparar el rendimiento del modelo abliterated frente al base en tareas de razonamiento y generación para cuantificar el coste de la intervención.
- Docencia y divulgación: como ejemplo práctico de modificación de pesos en modelos abiertos y de los riesgos asociados a la ausencia de alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: el repositorio ocupa 440,5 GB, y la model card indica 410,3 GiB de pesos puros en BF16; se necesita al menos esa cantidad de memoria, más overhead de activaciones y KV cache.
- En NVFP4 (repositorio hermano) el tamano baja a unos 150 GiB, lo que sigue exigiendo múltiples aceleradores.
- GPU recomendadas: no es viable en GPUs de consumo individuales; requiere configuraciones multi-GPU o multi-nodo con aceleradores de 80 GB o más (A100, H100, H200) para repartir los pesos.
- GPU de consumo: no cabe en ninguna GPU consumer actual (RTX 4090 tiene 24 GB); solo sería posible con offloading masivo a RAM/SSD, con latencia muy alta.
- Opciones de despliegue: vLLM, TGI o SGLang con paralelismo tensorial y de expertos; llama.cpp/Ollama no son prácticos por el tamano.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Hy4-flash-BF16-abliterated (este) | 220,3 mil millones | no disponible | no disponible | Hugging Face (MidasRev) |
| tencent/Hy4-flash (base) | no disponible en la informacion | no disponible | no disponible | Hugging Face (Tencent) |
| MidasRev/Hy4-flash-NVFP4-abliterated | 220,3 mil millones (misma base) | no disponible | no disponible | Hugging Face (MidasRev) |

No se dispone de datos de rendimiento ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La abliteration elimina la alineación de seguridad: el modelo puede generar contenido dañino, ilegal o sesgado sin rechazo, lo que lo hace inadecuado para aplicaciones de cara al público sin guardrails externos.
- Licencia no declarada: no se especifican términos de uso, lo que impide determinar si el uso comercial está permitido; además, al derivar de un modelo de Tencent, podrían aplicarse las condiciones del modelo base.
- Idiomas no documentados: se desconoce el soporte multilingüe real.
- Sin benchmarks: no hay evidencia publicada de que la intervención preserve las capacidades del modelo original; es posible una degradación en razonamiento o coherencia.
- Riesgo de alucinación: no evaluado en esta variante.
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria ni informes de uso.
- Tamano prohibitivo: 440,5 GB de pesos en BF16 limitan su uso a infraestructuras de investigación con hardware especializado.
- La model card no documenta el proceso de entrenamiento original ni el impacto de la ortogonalización en las capas afectadas.

## Enlaces

- [Hugging Face: MidasRev/Hy4-flash-BF16-abliterated](https://huggingface.co/MidasRev/Hy4-flash-BF16-abliterated)
- [Hugging Face: MidasRev/Hy4-flash-NVFP4-abliterated](https://huggingface.co/MidasRev/Hy4-flash-NVFP4-abliterated)
- [Hugging Face: tencent/Hy4-flash (modelo base)](https://huggingface.co/tencent/Hy4-flash)
