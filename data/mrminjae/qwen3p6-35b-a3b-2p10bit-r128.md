# mrminjae/qwen3p6-35b-a3b-2p10bit-r128

## Resumen

Qwen3.6-35B-A3B 2.10-bit (r128) es un checkpoint de investigación derivado de Qwen/Qwen3.6-35B-A3B, publicado por el usuario mrminjae en Hugging Face. Se trata de una cuantización selectiva: los expertos enrutados del modelo MoE se almacenan en una precisión media de 2,10 bits, mientras que el resto de pesos (atención, embeddings, router, capas densas) permanecen en BF16. Los pesos se guardan ya dequantizados en tensores BF16, de modo que cargan directamente con `transformers` y vLLM sin necesidad de kernels de cuantización especiales.

El modelo base es un transformer de tipo Mixture-of-Experts con capacidades multimodales (pipeline image-text-to-text), orientado a generación de texto y conversación. El repositorio declara 67.319.436.656 parámetros reales en safetensors, lo que difiere del "35B" del nombre: esa cifra corresponde a los parámetros activos por token del diseño MoE, mientras que el total almacenado es de aproximadamente 67,3 mil millones.

Su relevancia es acotada: se trata de un checkpoint interno de investigación, sin descargas ni interacciones en el momento de la consulta, sin licencia explícita en los metadatos y sin model card detallada más allá de la nota técnica sobre el esquema de cuantización. Resulta útil como referencia para quienes investigan cuantización extrema de expertos en arquitecturas MoE, no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (qwen3_5_moe), multimodal image-text-to-text |
| Parámetros totales | 67.319.436.656 (según safetensors) |
| Parámetros activos | 35B (según el nombre del modelo base; no verificado en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Expertos enrutados a 2,10 bits de media (r128); resto de pesos en BF16; pesos almacenados dequantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la licencia del modelo base, sin especificarla) |
| Formato de pesos | safetensors (BF16 dequantizado) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.6-35B-A3B: un transformer con capas de mezcla de expertos (MoE) en las que solo una fracción de los parámetros se activa por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamaño total. La variante base incorpora además capacidad multimodal de entrada imagen-texto, según el tag `image-text-to-text` del repositorio.

La modificación introducida por este checkpoint no afecta al entrenamiento original, sino al almacenamiento de pesos: los expertos enrutados se cuantizan a una media de 2,10 bits (identificador interno "r128") y posteriormente se dequantizan a BF16 para su publicación. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado (`text-generation`, `conversational`).
- Procesamiento de entradas imagen-texto (tag `image-text-to-text`), heredado del modelo base.
- Razonamiento y matemáticas: presumibles por la familia Qwen3.6, aunque no verificados en la información disponible.
- Generación de código: no confirmada explícitamente en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el repositorio no declara idiomas).
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación en cuantización extrema de MoE: el checkpoint permite estudiar el impacto de reducir los expertos enrutados a 2,10 bits manteniendo el resto en BF16, comparando la perplejidad y la calidad de generación frente al modelo base sin cuantizar.
- Evaluación de robustez de pipelines `transformers` y vLLM: al cargarse con herramientas estándar sin kernels personalizados, sirve para validar flujos de despliegue con pesos ya dequantizados.
- Experimentos académicos de eficiencia memoria-calidad: útil para medir la relación entre el tamaño en disco (134,7 GB) y el rendimiento en tareas de razonamiento o generación.
- Reproducción de resultados internos: al ser un checkpoint "r128" de un identificador interno, permite a equipos de investigación replicar comparativas entre variantes de cuantización de la misma familia.
- Prototipado de asistentes multimodales en entornos controlados: el soporte image-text-to-text permite probar interacciones con imágenes en fase de experimentación, no en producción.
- Estudio de degradación por cuantización en tareas de código o matemáticas: si se confirman esas capacidades en el modelo base, el checkpoint permite cuantificar la pérdida de precisión atribuible a la compresión de expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al almacenarse en BF16, los 67,3 mil millones de parámetros ocupan aproximadamente 134,6 GB en memoria, más el overhead de activaciones y KV cache. No cabe en GPUs de consumo individuales.
- GPU recomendadas: para carga completa en BF16 se necesitan configuraciones multi-GPU, por ejemplo 2× H100 80 GB o 4× A100 80 GB, dependiendo de la longitud de contexto y del backend.
- GPU de consumo: no es viable en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) sin cuantización adicional del resto de pesos, que no está prevista en este checkpoint.
- Opciones de despliegue: `transformers` y vLLM, según indica la model card. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p10bit-r128 | 67,3B (35B activos) | no disponible | no disponible | safetensors BF16 | 0 descargas, 0 likes |
| Qwen/Qwen3.6-35B-A3B (base) | 35B activos (total no indicado) | no disponible | no disponible | safetensors | modelo de referencia de la familia |
| Otras cuantizaciones de la familia Qwen3.6-35B-A3B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación interna: la propia model card lo califica como "internal research checkpoint", sin garantías de calidad ni de estabilidad.
- Sin licencia declarada: los metadatos no especifican licencia y la model card remite a la del modelo base sin nombrarla; el uso comercial queda en un limbo legal hasta verificarlo en el repositorio original de Qwen.
- Cuantización agresiva: 2,10 bits de media en los expertos puede degradar la calidad de generación, el razonamiento y la coherencia en comparación con el modelo base en BF16; no se publican métricas que lo cuantifiquen.
- Riesgo de alucinación: no evaluado en la información disponible, pero previsible en un modelo comprimido de forma extrema.
- Idiomas y contexto no documentados: no se puede planificar su uso multilingüe ni en ventanas largas sin verificación empírica.
- Tamaño en disco elevado: 134,7 GB en el repositorio, lo que dificulta su descarga y despliegue en infraestructuras modestas.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación externa.
- Sin datos de entrenamiento ni de alineación: no se puede evaluar el sesgo ni el comportamiento en dominios sensibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r128
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
