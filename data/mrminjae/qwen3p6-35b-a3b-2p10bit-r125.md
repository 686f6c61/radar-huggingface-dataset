# mrminjae/qwen3p6-35b-a3b-2p10bit-r125

## Resumen

El modelo `mrminjae/qwen3p6-35b-a3b-2p10bit-r125` es un checkpoint de investigación derivado de `Qwen/Qwen3.6-35B-A3B`, un modelo Mixture-of-Experts (MoE) de la familia Qwen 3.6. Lo publica el usuario `mrminjae` en Hugging Face y su rasgo distintivo es una cuantización selectiva muy agresiva: los expertos enrutados se almacenan a una media de 2,10 bits, mientras que el resto de pesos se mantiene en BF16. Los pesos se guardan dequantizados en tensores BF16, de modo que el modelo carga con `transformers` y vLLM estándar sin necesidad de kernels especiales.

El modelo base es multimodal (etiqueta `image-text-to-text`), con 35.107.181.936 parámetros totales según los safetensors del repositorio, lo que confirma que se trata de una arquitectura MoE con un subconjunto de parámetros activos por token. El repositorio ocupa 70,2 GB, coherente con el almacenamiento en BF16 de la mayoría de pesos.

Su relevancia es doble: por un lado, explora los límites de compresión en la capa de expertos de un MoE grande manteniendo el resto en alta precisión; por otro, sirve como referencia práctica de cuánto pesa realmente un MoE de 35B cuando solo se comprime la parte redundante. Es un artefacto de investigación, no un modelo listo para producción, y la model card es explícitamente escueta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), preentrenado multimodal (image-text-to-text) |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización selectiva: expertos enrutados a ~2,10 bits de media; resto de pesos en BF16; pesos almacenados dequantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Hereda la del modelo base `Qwen/Qwen3.6-35B-A3B` (no especificada en el repo) |
| Formato de pesos | safetensors (BF16 dequantizado) |

## Arquitectura y entrenamiento

El checkpoint parte de `Qwen/Qwen3.6-35B-A3B`, un transformer MoE con 35,1 mil millones de parámetros totales. La innovación del autor no está en el entrenamiento sino en la compresión: aplica una cuantización mixta en la que solo los expertos enrutados se reducen a una media de 2,10 bits, mientras que atención, embeddings, router y capas densas permanecen en BF16. Los pesos resultantes se dequantizan a BF16 antes de guardarse, de forma que el grafo computacional es idéntico al del modelo base y no requiere kernels de cuantización personalizados.

No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO; esa información correspondería a la model card del modelo base, que no se ha proporcionado. Tampoco se documenta el método exacto de cuantización (por ejemplo, cuantización post-entrenamiento con escalas por grupo, GPTQ o similar), ni el impacto medido en perplejidad o benchmarks. El identificador interno `r125` sugiere una iteración de investigación dentro de una serie.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del modelo base Qwen 3.6.
- Procesamiento multimodal de entrada imagen-texto (según la etiqueta `image-text-to-text` del repositorio).
- Razonamiento y matemáticas: capacidad esperable del modelo base, aunque no verificada en este checkpoint.
- Generación de código: capacidad esperable del modelo base, no verificada tras la cuantización.
- Tool calling y function calling: presumiblemente soportado por el modelo base; no confirmado en este checkpoint.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking o razonamiento extendido: no disponible.

## Casos de uso

- Investigación sobre cuantización extrema en MoE: comparar la calidad de este checkpoint con el modelo base BF16 para medir cuánta degradación introduce comprimir solo los expertos a 2,10 bits.
- Despliegue con vLLM en entornos de laboratorio: al cargar con `transformers` y vLLM estándar, permite experimentar con un MoE de 35B sin infraestructura de kernels cuantizados a medida.
- Evaluación de robustez multimodal: probar tareas imagen-texto tras la compresión selectiva para detectar si la rama de visión o el proyector se ven afectados.
- Estudio de eficiencia memoria-calidad: usar el repositorio de 70,2 GB como referencia para calcular el ahorro real frente a un BF16 completo y su efecto en throughput.
- Baseline para técnicas de compresión más agresivas: servir de punto de partida para comparar con cuantizaciones de 2, 3 o 4 bits uniformes.
- Docencia y divulgación: ilustrar cómo se estructura un MoE y qué parte de sus parámetros es realmente sensible a la precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al almacenarse en BF16 dequantizado, el peso completo ocupa aproximadamente 70 GB; se necesita al menos una GPU de 80 GB (A100 80GB, H100 80GB) para cargarlo en memoria.
- GPU recomendadas: A100 80GB, H100 80GB, H200 141GB para margen de contexto y batch.
- GPU de consumo: no cabe en RTX 4090 (24 GB), RTX 3090 (24 GB) ni en GPUs de 48 GB; requeriría offloading a CPU o sharding multi-GPU.
- Opciones de despliegue: `transformers` y vLLM estándar, según indica el autor; llama.cpp y Ollama no están confirmados y probablemente no sean viables sin reconvertir los pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p10bit-r125 | 35,1B | no disponible | hereda del base | safetensors BF16 | Expertos a ~2,10 bits, resto BF16 |
| Qwen/Qwen3.6-35B-A3B | 35,1B | no disponible | no disponible | safetensors | Modelo base sin compresión |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados |

## Limitaciones y advertencias

- Checkpoint de investigación interna: el autor lo etiqueta como tal, sin garantías de calidad ni de estabilidad.
- Cuantización a 2,10 bits en los expertos: es una compresión extrema que puede degradar razonamiento, código y matemáticas de forma no medida.
- Sin benchmarks publicados: no hay evidencia de que el rendimiento se mantenga respecto al modelo base.
- Licencia no explicitada en el repositorio: hereda la del modelo base, pero conviene verificar los términos de Qwen antes de cualquier uso comercial.
- Idiomas y contexto no documentados: no se puede asumir el soporte multilingüe ni la ventana de contexto del modelo base sin confirmación.
- Riesgo de alucinación: inherente al modelo base y potencialmente amplificado por la compresión.
- Tamaño de 70,2 GB en BF16: no apto para GPUs de consumo, lo que limita su uso a infraestructura de laboratorio.
- Fecha de creación futura (2026-11-13): metadato atípico que conviene contrastar antes de confiar en el artefacto.
- Cero descargas y cero likes: sin validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r125
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
