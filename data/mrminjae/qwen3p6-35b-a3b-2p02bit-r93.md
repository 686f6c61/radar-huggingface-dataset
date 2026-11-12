# mrminjae/qwen3p6-35b-a3b-2p02bit-r93

## Resumen

Qwen3.6-35B-A3B-2p02bit-r93 es un checkpoint de investigación publicado por el usuario mrminjae en Hugging Face, derivado del modelo base Qwen/Qwen3.6-35B-A3B mediante una cuantización selectiva de los expertos enrutados (routed experts) a una media de 2,02 bits. El resto de pesos se mantiene en BF16 y el conjunto se almacena de forma desquantizada en tensores BF16, de modo que carga con transformers estándar y vLLM sin necesidad de kernels de cuantización especiales.

El modelo conserva la arquitectura Mixture-of-Experts (MoE) del original, con 35.107.181.936 parámetros totales y capacidad image-text-to-text (multimodal), tal como indican las etiquetas del repositorio. Su interés radica en explorar hasta dónde se puede comprimir la parte mayoritaria de los parámetros (los expertos enrutados) manteniendo el resto en precisión completa, una estrategia poco habitual frente a las cuantizaciones globales tipo GGUF o AWQ.

Se trata de un checkpoint de investigación interna sin model card detallada, sin datos de benchmarks publicados y con cero descargas en el momento de la consulta. No dispone de información sobre licencia específica más allá de la herencia del modelo base, ni sobre idiomas soportados de forma explícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), tipo qwen3_5_moe (transformers) |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,02 bits de media; resto de pesos en BF16; almacenamiento desquantizado en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Sujeta a la del modelo base Qwen/Qwen3.6-35B-A3B (no especificada en el repo) |
| Formato de pesos | safetensors (BF16 desquantizado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.6-35B-A3B, un transformer con arquitectura Mixture-of-Experts identificada en transformers como `qwen3_5_moe`. La modificación introducida por mrminjae consiste en cuantizar únicamente los expertos enrutados a una media de 2,02 bits, manteniendo el resto de pesos (atención, embeddings, capas densas, router, etc.) en BF16. Los pesos se desquantizan y almacenan como tensores BF16, por lo que el repositorio ocupa 70,2 GB y no requiere kernels de cuantización en tiempo de inferencia.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si hubo fases de RLHF o DPO. Tampoco se documenta ninguna innovación técnica adicional más allá de la propia estrategia de cuantización selectiva de expertos. El identificador interno "r93" sugiere un checkpoint de una serie de experimentos de investigación.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline `text-generation` declarado.
- Procesamiento image-text-to-text: el tag del repositorio indica capacidades multimodales de entrada imagen y texto.
- Razonamiento y generación de código: heredadas del modelo base Qwen3.6-35B-A3B (no verificadas en este checkpoint).
- Soporte de tool calling / function calling: presumiblemente heredado del base, aunque no documentado en este repo.
- Capacidades de agente y razonamiento multi-paso: no documentadas en este checkpoint.
- Capacidades multilingües: no disponibles de forma explícita.
- Modo thinking u otras capacidades especiales: no disponibles.

## Casos de uso

- Investigación sobre cuantización de MoE: el checkpoint permite estudiar el impacto de comprimir expertos enrutados a 2,02 bits mientras el resto permanece en BF16, comparando calidad frente al modelo base en tareas controladas.
- Despliegue con transformers estándar: al almacenarse desquantizado en BF16, se puede cargar con la librería transformers sin parches ni kernels personalizados, útil para entornos de evaluación reproducibles.
- Servicio con vLLM: el autor indica compatibilidad con vLLM, lo que permite servir el modelo como endpoint compatible con la API de OpenAI en infraestructura propia.
- Experimentos de eficiencia memoria/calidad: comparar el rendimiento de este checkpoint frente a cuantizaciones globales (GGUF, AWQ) para decidir qué estrategia conviene en producción.
- Prototipado multimodal: al conservar el tag image-text-to-text, sirve para probar pipelines que combinan imagen y texto antes de comprometerse con el modelo base completo.
- Evaluación de robustez ante compresión agresiva: analizar si la degradación a 2,02 bits en expertos afecta a tareas de razonamiento, código o matemáticas, y en qué magnitud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 70,2 GB en safetensors BF16; la VRAM necesaria para cargarlo completo ronda ese tamaño más overhead de activaciones y KV cache.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para carga completa en una sola GPU; configuraciones multi-GPU (2x A100 40 GB, 2x RTX 4090 24 GB con tensor parallelism) para entornos más modestos.
- No cabe en una GPU consumer de 24 GB en BF16 completo; requeriría offloading a CPU o sharding.
- Opciones de despliegue: transformers (carga nativa), vLLM (según el autor), y potencialmente TGI. llama.cpp/Ollama no están documentados para este formato desquantizado en BF16.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p02bit-r93 | 35,1 B (MoE) | no disponible | heredada del base | safetensors BF16 desquantizado | Expertos a 2,02 bits, resto BF16 |
| Qwen/Qwen3.6-35B-A3B | 35,1 B (MoE) | no disponible | la del modelo base | safetensors | Modelo original sin cuantizar |
| Cuantizaciones GGUF/AWQ de Qwen3.6-35B-A3B | 35,1 B (MoE) | no disponible | según autor | GGUF, AWQ, etc. | Cuantización global, no selectiva de expertos |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación interna sin model card completa: no hay información sobre licencia específica, idiomas ni benchmarks.
- La cuantización a 2,02 bits de los expertos enrutados puede degradar la calidad frente al modelo base; no se han publicado evaluaciones que lo cuantifiquen.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.
- Licencia sujeta al modelo base Qwen/Qwen3.6-35B-A3B; conviene verificar los términos de uso comercial del base antes de desplegar.
- Riesgo de alucinación y sesgos: inherentes al modelo base, no evaluados en este checkpoint.
- El tamaño de 70,2 GB en BF16 limita el despliegue a hardware de gama alta o configuraciones multi-GPU.
- No se documenta soporte de tool calling, agentes ni modo thinking en este checkpoint concreto.

## Enlaces

- Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p02bit-r93
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
