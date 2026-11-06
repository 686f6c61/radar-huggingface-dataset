# Minako11/decider-c

## Resumen

Minako11/decider-c es un modelo de decisión publicado en Hugging Face por el usuario Minako11, construido como un fine-tune o merge sobre el modelo base baselabs/mammoth-1. Los tags del repositorio lo etiquetan como `qwen3_5`, lo que sugiere que la arquitectura subyacente deriva de la familia Qwen 3.5, y también incluyen `reax`, `bittensor` y `sn92`, lo que apunta a que el modelo se ha entrenado o evaluado en el contexto de la subred 92 de Bittensor (un ecosistema de incentivos descentralizado para modelos de IA). El nombre "decider" y la etiqueta `decision-model` indican que su propósito es tomar decisiones o clasificar entre opciones dentro de un pipeline, no tanto generar texto libre.

El modelo tiene 26.085.330.160 parámetros totales según los pesos en safetensors, lo que lo sitúa en la categoría de ~26B. El tamaño del repositorio es de 52,2 GB, coherente con pesos en precisión completa o bf16 para ese número de parámetros. La licencia es MIT, lo que facilita el uso comercial, aunque el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

La información pública es muy escasa: no hay pipeline declarado, no se especifican idiomas soportados y no se han publicado resultados de benchmarks ni detalles de entrenamiento en la información disponible. Esta ficha se limita, por tanto, a los datos verificables del repositorio y a inferencias claramente marcadas como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (tags indican `qwen3_5`; presumiblemente transformer decoder-only derivado de Qwen 3.5) |
| Parametros totales | 26.085.330.160 (~26B) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales listadas) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | baselabs/mammoth-1 |
| Acceso | Restringido (gated) |
| Tamano del repositorio | 52,2 GB |
| Descargas / likes | 4 / 0 |

## Arquitectura y entrenamiento

No se dispone de documentación oficial sobre la arquitectura interna más allá de los tags del repositorio. El tag `qwen3_5` sugiere que el modelo parte de la familia Qwen 3.5, que emplea transformers decoder-only con atención por grupos (GQA) y, en algunas variantes, mezcla de expertos. El tag `merge` indica que el modelo se ha obtenido mediante fusión de pesos (posiblemente model merging con técnicas tipo SLERP, TIES o DARE) a partir de baselabs/mammoth-1, y no mediante un entrenamiento desde cero. Los tags `reax`, `bittensor` y `sn92` apuntan a que el proceso de selección o ajuste se ha realizado en el marco de la subred 92 de Bittensor, orientada a modelos de decisión o agentes.

No hay información pública sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). Cualquier afirmación al respecto sería especulativa.

## Capacidades

- Generación de texto y razonamiento: al derivar de un modelo tipo Qwen 3.5, es razonable esperar capacidades generales de generación y razonamiento, aunque no están documentadas oficialmente.
- Modelo de decisión: el nombre y el tag `decision-model` sugieren que está orientado a tareas de clasificación, selección entre opciones o enrutamiento dentro de pipelines, más que a chat abierto.
- Tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: plausible por el contexto Bittensor/SN92, pero no confirmado.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Enrutamiento de consultas en pipelines de agentes: el modelo puede emplearse como "decider" para elegir qué herramienta o submodelo debe atender una petición, aprovechando su etiqueta de modelo de decisión y su tamaño de ~26B para manejar contextos complejos.
- Selección de respuestas en sistemas de ensemble: dado su origen como merge, puede utilizarse para puntuar o clasificar salidas de varios modelos candidatos antes de devolver una respuesta final.
- Evaluación automatizada en entornos Bittensor: encaja en la subred 92 como modelo de decisión para validar o puntuar respuestas de otros mineros, siempre que se respete la licencia MIT y las condiciones de acceso.
- Clasificación de intenciones en asistentes conversacionales: con acceso gated y licencia MIT, puede integrarse en backends de atención al cliente para decidir la siguiente acción (derivar a humano, consultar base de conocimiento, etc.).
- Filtrado y moderación de contenido: como modelo de decisión, puede clasificar textos según políticas internas, aunque no hay datos publicados sobre su rendimiento en esta tarea.
- Investigación en model merging: al ser un merge sobre baselabs/mammoth-1, sirve como caso de estudio para reproducir técnicas de fusión de pesos y evaluar su impacto en tareas de decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: ~52 GB solo para pesos, más overhead de KV cache y activaciones; se recomienda al menos 80 GB para contextos largos.
- VRAM estimada en cuantización 8-bit: ~26-30 GB, viable en una RTX 4090 (24 GB) solo con cuantización 4-bit o con offloading.
- VRAM estimada en cuantización 4-bit: ~13-16 GB, cabe en GPUs consumer de 16-24 GB (RTX 4080/4090, RTX 3090) con margen limitado para contexto.
- GPUs recomendadas: A100 80 GB, H100 80 GB, o múltiples RTX 4090 para tensor parallelism.
- Opciones de despliegue: vLLM, TGI y llama.cpp (previa conversión a GGUF, no publicada oficialmente); Ollama requeriría también conversión manual.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| Minako11/decider-c | ~26B | No disponible | MIT | Gated | Fine-tune/merge sobre baselabs/mammoth-1, orientado a decisión |
| baselabs/mammoth-1 | No disponible | No disponible | No disponible | No disponible | Modelo base del que deriva |
| Qwen 3.5 (familia) | Variable (no disponible para la variante exacta) | No disponible | Generalmente Apache 2.0 en la familia Qwen | Abierto | Arquitectura de referencia según el tag `qwen3_5` |

No se dispone de datos suficientes para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card detallada, benchmarks ni especificaciones de contexto o idiomas, lo que dificulta su evaluación previa a producción.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que puede bloquear despliegues automatizados o en entornos corporativos.
- Riesgo de alucinación: al ser un modelo derivado de un base no documentado, no hay garantías sobre su calibración en tareas de decisión.
- Sesgos desconocidos: no se ha publicado información sobre la composición del dataset ni sobre evaluaciones de sesgo.
- Licencia MIT: permite uso comercial, pero conviene verificar que el modelo base baselabs/mammoth-1 no imponga restricciones adicionales incompatibles.
- Contexto e idiomas no confirmados: no se puede asumir soporte multilingüe ni una ventana de contexto concreta sin verificación empírica.
- Madurez: con solo 4 descargas y 0 likes, es un modelo muy reciente y sin validación comunitaria; no se recomienda para producción crítica sin evaluación propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Minako11/decider-c
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- Bittensor (ecosistema referenciado en los tags): https://bittensor.com
- Subred 92 de Bittensor: no disponible enlace oficial en la información proporcionada.
