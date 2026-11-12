# mrminjae/qwen3p6-35b-a3b-2p04bit-r97

## Resumen

Qwen3.6-35B-A3B-2p04bit-r97 es un checkpoint de investigación publicado por el usuario mrminjae sobre el modelo base Qwen/Qwen3.6-35B-A3B. Se trata de una cuantización selectiva: únicamente los expertos enrutados (routed experts) del modelo MoE se almacenan con una precisión media de 2,04 bits, mientras que el resto de pesos (atención, embeddings, capas densas y router) permanece en BF16. Los pesos se guardan ya dequantizados en tensores BF16, de modo que cargan con transformers estándar y con vLLM sin necesidad de kernels de cuantización especiales.

El modelo resuelve un problema muy concreto: reducir el espacio en disco y el ancho de banda de memoria de un MoE de 35.107.181.936 parámetros totales sin renunciar a la compatibilidad con el ecosistema transformers. El repositorio ocupa 70,2 GB, lo que refleja que la dequantización a BF16 se aplica en el almacenamiento, no en el cómputo. Es relevante ahora porque permite experimentar con un MoE grande en hardware más modesto, aunque a costa de perder la ventaja de velocidad que ofrecería una inferencia realmente de 2 bits.

La información pública es muy escasa: la model card se limita a indicar el modelo base, la precisión media de los expertos y el identificador interno r97. No se detallan datos de entrenamiento, benchmarks, licencia explícita ni idiomas soportados. La licencia se declara heredada del modelo base, pero el campo de licencia del repositorio figura como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE transformer (qwen3_5_moe), multimodal image-text-to-text |
| Parámetros totales | 35.107.181.936 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Expertos enrutados a 2,04 bits de media; resto de pesos en BF16; pesos almacenados dequantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repositorio; la model card indica que sigue la licencia del modelo base |
| Formato de pesos | safetensors (BF16), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo es una variante cuantizada del Qwen3.6-35B-A3B, un transformer con mezcla de expertos (MoE) y pipeline image-text-to-text según los tags del repositorio. La intervención de mrminjae se limita a la cuantización de los expertos enrutados a una media de 2,04 bits (identificador interno r97), manteniendo el resto de componentes en BF16. No se especifica el método exacto de cuantización (GPTQ, AWQ, RTN u otro), ni el tamaño de los grupos, ni si se aplicó calibración con datos.

No hay información sobre el entrenamiento original: ni número de tokens, ni composición del dataset, ni si hubo RLHF o DPO. Tampoco se documenta ninguna innovación técnica adicional más allá de la propia estrategia de cuantización selectiva de expertos. Al almacenarse los pesos dequantizados en BF16, el checkpoint no aprovecha kernels de baja precisión en tiempo de inferencia; la reducción de precisión afecta a la calidad de los pesos, no a la velocidad de ejecución.

## Capacidades

- Generación de texto conversacional y continuaciones multi-turno, según el pipeline text-generation declarado.
- Procesamiento image-text-to-text, heredado del tag del modelo base, lo que sugiere capacidad multimodal de entrada.
- Razonamiento y matemáticas: no confirmado explícitamente en la información disponible.
- Generación de código: no confirmado explícitamente en la información disponible.
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación sobre cuantización de MoE: el checkpoint permite estudiar el impacto de llevar los expertos enrutados a 2,04 bits comparando salidas con el modelo base Qwen3.6-35B-A3B en el mismo hardware.
- Despliegue en entornos con almacenamiento limitado: al ocupar 70,2 GB en lugar del tamaño BF16 completo, facilita mover el modelo entre nodos o almacenarlo en caché local en máquinas con discos de menor capacidad.
- Pruebas de compatibilidad con transformers y vLLM: al cargar con herramientas estándar, sirve para validar pipelines de serving antes de adoptar una cuantización más agresiva o con kernels específicos.
- Evaluación de degradación de calidad: útil para medir la pérdida de precisión en tareas de generación de texto y multimodalidad respecto al modelo base, con vistas a decidir si merece la pena una cuantización de expertos.
- Prototipado de aplicaciones image-text-to-text: el tag multimodal permite experimentar con entrada de imagen y texto en entornos de investigación, siempre que se valide la calidad frente al original.
- Reproducción de experimentos internos: el identificador r97 y la model card sugieren un uso como checkpoint de referencia para replicar resultados de investigación internos del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al almacenarse los pesos en BF16, la huella en memoria ronda los 70 GB para los pesos, más overhead de activaciones y caché KV; se recomienda al menos 80 GB de VRAM para una carga completa en una sola GPU.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para ejecución en una única tarjeta; configuraciones multi-GPU para GPUs de menor capacidad.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) sin sharding o descarga parcial a CPU; sería necesario un setup multi-GPU o técnicas de offloading.
- Opciones de despliegue: transformers estándar y vLLM, según indica la model card; llama.cpp y Ollama no están confirmados para este formato de pesos BF16.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-2p04bit-r97 | 35.107.181.936 | no disponible | Expertos a 2,04 bits, resto BF16 | no disponible (hereda del base) | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 35.107.181.936 | no disponible | BF16 original | no disponible | Hugging Face |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 2,04 bits de media en los expertos enrutados puede degradar la calidad de las respuestas frente al modelo base; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- Al guardarse los pesos dequantizados en BF16, el checkpoint no ofrece ventajas de velocidad ni de VRAM frente al modelo original; solo reduce el espacio en disco.
- La model card lo describe como checkpoint de investigación interno, sin garantías de estabilidad ni soporte.
- Licencia no disponible en el repositorio; la model card remite a la licencia del modelo base, que debe verificarse antes de cualquier uso comercial.
- Riesgo de alucinación y sesgos: no documentados para este checkpoint; se heredan los del modelo base, no evaluados aquí.
- Idiomas y longitud de contexto no especificados, lo que impide garantizar comportamiento multilingüe o conversaciones de contexto largo.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia comunitaria de funcionamiento en producción.
- Fecha de creación futura (2026-11-12) en los metadatos, lo que conviene tener en cuenta al evaluar su trazabilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p04bit-r97
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
