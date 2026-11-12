# mrminjae/qwen36-35b-a3b-2p10bit-gentraj3-lowbit

## Resumen

Este repositorio contiene un checkpoint de investigación derivado de Qwen/Qwen3.6-35B-A3B, un modelo de mezcla de expertos (MoE) de la familia Qwen 3.6. El autor, identificado como mrminjae, ha aplicado una cuantización selectiva sobre los expertos enrutados del modelo base, reduciéndolos a una media de 2,10 bits, mientras que el resto de pesos permanece en BF16. El resultado se almacena de forma desquantizada en tensores BF16, de modo que puede cargarse con `transformers` estándar y con vLLM sin necesidad de kernels o librerías de cuantización adicionales.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de compresión agresiva sobre un modelo MoE de gran tamaño, con el objetivo implícito de reducir el espacio en disco y, potencialmente, el ancho de banda de memoria en inferencia. Por otro, es un artefacto de investigación con trazabilidad mínima: no se publican datos de evaluación, no se especifica la licencia concreta (solo que "sigue la del modelo base") y no se detallan los idiomas soportados. El repositorio ocupa 14,7 GB y no registra descargas ni interacciones en el momento de la consulta.

El modelo base, Qwen3.6-35B-A3B, es un MoE de 35 mil millones de parámetros totales con aproximadamente 3 mil millones de parámetros activos por token, orientado a generación de texto y a tareas imagen-texto según las etiquetas del repositorio. La cuantización de este derivado afecta exclusivamente a los expertos enrutados, que son la mayor parte del cómputo y del almacenamiento en un MoE de este tipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer, derivada de Qwen3.6-35B-A3B |
| Parametros totales | 35B (modelo base; el derivado mantiene la misma estructura) |
| Parametros activos | A3B, aproximadamente 3B activos por token (según nomenclatura del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,10 bits de media; resto de pesos en BF16; pesos almacenados desquantizados en tensores BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la licencia del modelo base, sin especificarla) |
| Formato de pesos | safetensors (carga con `transformers` estándar y vLLM; tamaño de repo 14,7 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con arquitectura de mezcla de expertos: 35B parámetros totales con unos 3B activos por token, lo que permite un coste de cómputo por token comparable a un modelo denso de 3B mientras se dispone de la capacidad de representación de un modelo mucho mayor. La etiqueta `qwen3_5_moe` y el pipeline `image-text-to-text` sugieren soporte multimodal de entrada (imagen y texto), aunque la model card del derivado no lo detalla.

Este checkpoint concreto no ha sido reentrenado ni ajustado: es una transformación de pesos del modelo base. La innovación técnica es la cuantización selectiva de los expertos enrutados a una media de 2,10 bits, manteniendo el resto de pesos en BF16. Los pesos se almacenan ya desquantizados en BF16, por lo que la carga es compatible con el stack estándar, pero el ahorro de memoria en inferencia respecto al modelo base no está documentado. No se especifican datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO; esa información correspondería al modelo base y no se reproduce aquí.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (`text-generation`) y la etiqueta `conversational`.
- Procesamiento imagen-texto: las etiquetas del repositorio incluyen `image-text-to-text`, lo que indica entrada multimodal de imagen y texto.
- Razonamiento y matemáticas: capacidades heredadas del modelo base Qwen3.6-35B-A3B, no verificadas en este checkpoint.
- Generación de código: capacidad esperable del modelo base, no evaluada en este derivado.
- Tool calling y function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no disponibles; la model card no especifica idiomas.
- Modo de pensamiento (thinking) u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación sobre cuantización de MoE: el checkpoint permite estudiar el impacto de reducir los expertos enrutados a 2,10 bits manteniendo el resto en BF16, comparando calidad y perplejidad frente al modelo base en tareas controladas.
- Despliegue en entornos con almacenamiento limitado: al ocupar 14,7 GB y cargarse con `transformers` estándar, puede alojarse en nodos con menos disco que el modelo base, sin necesidad de toolchains de cuantización.
- Pruebas de compatibilidad con vLLM: la model card afirma compatibilidad con vLLM, por lo que sirve para validar pipelines de serving con pesos desquantizados en BF16.
- Evaluación de degradación por cuantización agresiva: útil para medir hasta qué punto 2,10 bits en expertos enrutados afectan a tareas de razonamiento, código o matemáticas antes de adoptar técnicas similares en producción.
- Prototipado de asistentes conversacionales multimodales: las etiquetas indican entrada imagen-texto, lo que permite experimentar con diálogo sobre imágenes en un entorno de investigación.
- Baseline para técnicas de compresión: sirve como referencia para comparar otras estrategias de cuantización selectiva sobre el mismo modelo base, siempre que se documenten las métricas de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de perplejidad, MMLU, HumanEval, GSM8K ni comparaciones con el modelo base o con otras cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 14,7 GB en disco, pero los pesos se cargan en BF16, por lo que la huella en memoria puede ser sustancialmente mayor que el tamaño del repo.
- GPU recomendadas: no disponible. Dado el tamaño del modelo base (35B totales, 3B activos), se requerirían GPUs de centro de datos con memoria suficiente; no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no disponible. No se confirma que quepa en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: `transformers` estándar y vLLM, según la model card. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mrminjae/qwen36-35b-a3b-2p10bit-gentraj3-lowbit | 35B / ~3B | no disponible | no disponible (hereda la del base) | safetensors BF16 desquantizado | Expertos enrutados a 2,10 bits; checkpoint de investigación |
| Qwen/Qwen3.6-35B-A3B | 35B / ~3B | no disponible | no disponible en esta ficha | no disponible | Modelo base sin cuantizar; referencia directa |
| Otras cuantizaciones del mismo base | 35B / ~3B | no disponible | depende del autor | GGUF, AWQ, GPTQ (no confirmado) | No se dispone de datos verificados en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas de otros desarrolladores en la misma categoría.

## Limitaciones y advertencias

- Checkpoint de investigación interna: la model card lo describe explícitamente como "internal research checkpoint", sin garantías de calidad ni de estabilidad.
- Ausencia total de evaluación: no hay benchmarks, perplejidad ni comparación con el modelo base, por lo que se desconoce la degradación introducida por la cuantización a 2,10 bits.
- Licencia no especificada: la model card remite a la licencia del modelo base sin nombrarla; es imprescindible verificar la licencia de Qwen/Qwen3.6-35B-A3B antes de cualquier uso comercial.
- Idiomas no documentados: no se puede asumir soporte multilingüe sin verificación empírica.
- Contexto no documentado: se desconoce la longitud máxima de contexto efectiva de este derivado.
- Riesgo de alucinación: inherente a los modelos generativos y potencialmente amplificado por la cuantización agresiva; no cuantificado.
- Sesgos: no documentados; se heredarían los del modelo base, que tampoco se detallan.
- Trazabilidad mínima: sin descargas ni likes, sin paper asociado y sin instrucciones de reproducción de la cuantización.
- Huella en memoria incierta: aunque el repo ocupa 14,7 GB, los pesos se cargan en BF16, por lo que el ahorro real de VRAM frente al modelo base no está garantizado ni medido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mrminjae/qwen36-35b-a3b-2p10bit-gentraj3-lowbit
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
