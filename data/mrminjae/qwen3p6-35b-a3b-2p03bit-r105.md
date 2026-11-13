# mrminjae/qwen3p6-35b-a3b-2p03bit-r105

## Resumen

Qwen3.6-35B-A3B-2.03bit-r105 es un checkpoint de investigación derivado de Qwen/Qwen3.6-35B-A3B, publicado por el usuario mrminjae en Hugging Face. Se trata de una versión cuantizada del modelo base en la que los expertos enrutados (routed experts) de la arquitectura MoE se almacenan con una precisión media de 2,03 bits, mientras que el resto de pesos permanece en BF16. A pesar de la cuantización, los pesos se guardan dequantizados en tensores BF16, por lo que el modelo carga con `transformers` estándar y con vLLM sin necesidad de kernels especiales.

El modelo base, Qwen3.6-35B-A3B, es un modelo de lenguaje de tipo Mixture-of-Experts con aproximadamente 35.107 millones de parámetros totales (35,1 mil millones) y capacidad image-text-to-text, según los tags del repositorio. Esta variante cuantizada busca reducir el coste de almacenamiento y, potencialmente, de memoria en inferencia, manteniendo la compatibilidad con el ecosistema estándar de transformers.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización agresiva aplicada solo a los expertos de un MoE; por otro, advierte de que se trata de un checkpoint interno de investigación, sin métricas publicadas, sin licencia explícita declarada en el repositorio y con cero descargas en el momento de la consulta. No debe confundirse con una versión oficial de Qwen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, según tag `qwen3_5_moe`; capacidad image-text-to-text |
| Parámetros totales | 35.107.181.936 (≈35,1 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Expertos enrutados a 2,03 bits de media; resto de pesos en BF16; pesos almacenados dequantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repositorio; la model card indica que sigue la licencia del modelo base |
| Formato de pesos | safetensors (BF16 dequantizado) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Qwen3.6-35B-A3B, identificada en los tags como `qwen3_5_moe`, es decir, un transformer con capas de mezcla de expertos. La intervención del autor consiste en una cuantización selectiva: los expertos enrutados se comprimen a una media de 2,03 bits, mientras que el resto de matrices (atención, embeddings, capas densas, router, etc.) se mantienen en BF16. Los pesos resultantes se almacenan ya dequantizados en BF16, de modo que el archivo en disco no refleja el ahorro teórico de la cuantización a 2 bits, sino que conserva el tamaño de un checkpoint BF16 completo (el repositorio ocupa 70,2 GB).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si hubo fases de RLHF o DPO. Tampoco se documenta la técnica exacta de cuantización (por ejemplo, GPTQ, AWQ, bitsandbytes o un esquema propio), más allá de la media de 2,03 bits declarada para los expertos. El identificador interno "r105" sugiere una iteración de investigación, sin garantías de estabilidad ni de reproducibilidad.

## Capacidades

- Generación de texto conversacional, según el pipeline `text-generation` y los tags `conversational` y `text-generation`.
- Procesamiento image-text-to-text, heredado del modelo base según los tags del repositorio.
- Razonamiento y matemáticas: capacidad presumible del modelo base, no verificada en esta variante por falta de benchmarks.
- Generación de código: presumible del modelo base, no verificada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre cuantización de MoE: este checkpoint permite estudiar el impacto de comprimir únicamente los expertos enrutados a 2,03 bits mientras el resto de la red permanece en BF16, comparando la calidad frente al modelo base en tareas controladas.
- Evaluación de degradación por cuantización agresiva: útil para medir la pérdida de precisión en razonamiento, código y matemáticas cuando los expertos operan a muy baja precisión, con el resto de la red intacto.
- Despliegue experimental con vLLM: la model card indica compatibilidad con vLLM y `transformers` estándar, lo que facilita probar el checkpoint en pipelines de inferencia existentes sin kernels personalizados.
- Reproducción de experimentos internos: al ser un checkpoint de investigación con ID interno r105, sirve para replicar resultados de laboratorio y comparar iteraciones de cuantización.
- Prototipado de asistentes multimodales: gracias a la capacidad image-text-to-text heredada, puede usarse en pruebas de concepto de descripción de imágenes o respuesta a preguntas visuales, siempre con validación adicional.
- Base para experimentos de destilación o fine-tuning: al cargar con `transformers`, puede servir como punto de partida para estudiar cómo afecta la cuantización de expertos a un posterior ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: al almacenarse los pesos dequantizados en BF16, el checkpoint ocupa 70,2 GB en disco; en memoria, la inferencia en BF16 requiere del orden de 70 GB solo para pesos, más overhead de activaciones y KV cache. No se dispone de cifras oficiales de VRAM.
- GPU recomendadas: para BF16 completo, se necesitan GPUs de centro de datos con 80 GB o más (A100 80 GB, H100 80 GB, H200) o configuraciones multi-GPU. No hay datos oficiales.
- ¿Cabe en GPU de consumo? No en BF16 completo. No se documenta una variante GGUF ni un modo de carga a 2 bits real en memoria, por lo que no se puede confirmar su viabilidad en RTX 4090 (24 GB) u otras GPUs de consumo.
- Opciones de despliegue: `transformers` estándar y vLLM, según la model card. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p03bit-r105 | 35,1 mil millones | no disponible | Expertos a 2,03 bits, resto BF16 | no disponible (sigue la del base) | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 35,1 mil millones | no disponible | BF16 original | la del modelo base | Hugging Face |
| Otras variantes cuantizadas del mismo base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para comparar esta variante con el modelo base ni con alternativas de la misma categoría.

## Limitaciones y advertencias

- Checkpoint de investigación interna ("Internal research checkpoint"): no hay garantía de estabilidad, soporte ni mantenimiento.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Sin benchmarks publicados: se desconoce la degradación real de calidad frente al modelo base tras cuantizar los expertos a 2,03 bits.
- Licencia no declarada en el repositorio: la model card remite a la licencia del modelo base, pero no se especifica cuál es; es imprescindible verificar los términos del modelo Qwen original antes de cualquier uso comercial.
- Idiomas soportados no documentados: no se puede asumir un rendimiento multilingüe concreto.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no cuantificado en esta variante.
- Sesgos conocidos: no documentados; se heredan presumiblemente los del modelo base, sin información disponible.
- Aunque la cuantización se anuncia a 2,03 bits, los pesos se almacenan dequantizados en BF16 y el repositorio ocupa 70,2 GB: el ahorro de almacenamiento no se materializa en el artefacto publicado, y el ahorro de memoria en inferencia depende de si el runtime aplica la dequantización bajo demanda.
- No apto para producción sin una evaluación propia exhaustiva.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p03bit-r105
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
