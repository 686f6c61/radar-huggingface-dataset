# mrminjae/qwen3p6-35b-a3b-2p10bit-r134

## Resumen

Qwen3.6-35B-A3B (2.10-bit, r134) es un checkpoint de investigación derivado de Qwen/Qwen3.6-35B-A3B, publicado por el usuario mrminjae en Hugging Face. Se trata de una cuantización selectiva: únicamente los expertos enrutados del modelo MoE se almacenan con una precisión media de 2,10 bits, mientras que el resto de pesos (atención, embeddings, router, capas densas) permanecen en BF16. Los pesos se distribuyen ya dequantizados en tensores BF16, de modo que cargan directamente con `transformers` o vLLM sin necesidad de kernels de cuantización especiales.

El modelo base es un MoE de Qwen con 35.107.181.936 parámetros totales y arquitectura `qwen3_5_moe`, orientado a generación de texto e image-text-to-text. La propuesta del checkpoint es reducir el peso efectivo del almacenamiento de expertos manteniendo la compatibilidad con el stack estándar de inferencia, algo relevante para entornos con VRAM limitada que quieren evitar toolchains de cuantización adicionales.

La ficha se elabora con información escasa: el autor no publica licencia explícita, idiomas soportados, composición del dataset ni resultados de benchmarks. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y se describe como "internal research checkpoint", por lo que no debe tratarse como un artefacto listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `qwen3_5_moe` (transformer con mezcla de expertos) |
| Parámetros totales | 35.107.181.936 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Expertos enrutados a 2,10 bits de media; resto de pesos en BF16; pesos almacenados dequantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que sigue la del modelo base, sin especificarla) |
| Formato de pesos | safetensors (BF16) |
| Tamaño del repositorio | 70,2 GB |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Pipeline | text-generation (etiquetado también como image-text-to-text) |
| Librería | transformers |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base, identificada en los tags como `qwen3_5_moe`: un transformer con capas de mezcla de expertos. El autor no detalla el número de expertos, el número de expertos activos por token, la dimensión oculta ni la configuración de atención. Tampoco se especifica la longitud de contexto nativa del modelo base.

La modificación respecto al original es exclusivamente de precisión numérica: los pesos de los expertos enrutados se comprimen a una media de 2,10 bits y se expanden de nuevo a BF16 en el repositorio. No se documenta ningún proceso de entrenamiento adicional, destilación, RLHF o DPO asociado a este checkpoint; es una transformación post-entrenamiento sobre los pesos del modelo base. La innovación técnica declarada es la compatibilidad directa con `transformers` y vLLM sin kernels de cuantización, a costa de un repositorio de 70,2 GB que no reduce el espacio en disco frente a un BF16 convencional de ese tamaño.

## Capacidades

- Generación de texto conversacional y continuaciones de contexto largo, heredadas del modelo base.
- Procesamiento image-text-to-text según los tags del repositorio, aunque el autor no documenta la torre visual ni el formato de entrada esperado.
- Razonamiento y matemáticas: capacidad presumible por la familia del modelo base, sin datos verificables en la información disponible.
- Generación de código: no confirmada explícitamente en la model card.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no documentados más allá de la etiqueta image-text-to-text.

## Casos de uso

- Investigación sobre cuantización extrema de MoE: el checkpoint permite estudiar el impacto de comprimir expertos a 2,10 bits manteniendo el resto en BF16, comparando perplejidad y calidad de generación contra el modelo base sin cambiar el stack de inferencia.
- Despliegue experimental en vLLM: al cargar con vLLM estándar, sirve para validar pipelines de serving con modelos MoE de gran tamaño sin kernels de cuantización personalizados.
- Evaluación de robustez numérica: útil para medir degradación en tareas de razonamiento y generación larga cuando los expertos pierden precisión de forma agresiva.
- Prototipado de asistentes conversacionales en entornos de investigación con acceso a GPUs de datacenter, aprovechando la compatibilidad con `transformers`.
- Pruebas de integración multimodal: la etiqueta image-text-to-text permite experimentar con entradas de imagen y texto, aunque requiere validar previamente que la torre visual funciona tras la dequantización.
- Baseline para técnicas de compresión: sirve como referencia frente a otras estrategias (GPTQ, AWQ, GGUF) sobre el mismo modelo base, midiendo calidad frente a tamaño de repositorio y velocidad de carga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 70,2 GB en BF16, por lo que se necesita al menos ~70 GB solo para los pesos, más overhead de activaciones y caché KV. En la práctica, un despliegue cómodo requiere 80 GB o más.
- GPU recomendadas: H100 80 GB, A100 80 GB o configuraciones multi-GPU (por ejemplo, 2x A100 40 GB o 2x RTX 4090 24 GB con tensor parallelism, sujeto a validación).
- GPU de consumo: no cabe en una RTX 4090 de 24 GB ni en una RTX 3090 de 24 GB en su forma actual, porque los pesos se almacenan dequantizados en BF16.
- Opciones de despliegue: `transformers` y vLLM según el autor; llama.cpp, Ollama y TGI no están confirmados para este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p10bit-r134 | 35,1 B | no disponible | Expertos a 2,10 bits, resto BF16 | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-35B-A3B | 35,1 B (según checkpoint derivado) | no disponible | BF16 original | no disponible | Hugging Face (modelo base) |
| Alternativas MoE de ~30-40 B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con otras alternativas de la misma categoría no está disponible en la información proporcionada. El único contraste fiable es con el modelo base, del que este checkpoint solo difiere en la precisión de los expertos.

## Limitaciones y advertencias

- Checkpoint de investigación interna: el autor lo etiqueta explícitamente como "internal research checkpoint", sin garantías de calidad ni soporte.
- Licencia no especificada: el autor remite a la del modelo base sin indicarla, lo que impide confirmar si el uso comercial está permitido.
- Idiomas no documentados: no se puede asumir cobertura multilingüe sin validación empírica.
- Riesgo de degradación por cuantización agresiva: 2,10 bits de media en los expertos es una compresión extrema que puede afectar a la coherencia, el razonamiento y la fidelidad factual.
- Riesgo de alucinación: no evaluado en este checkpoint; se desconoce el impacto de la dequantización en la tasa de alucinaciones.
- Tamaño del repositorio: 70,2 GB en BF16, sin ahorro real de VRAM frente al modelo base, lo que limita su utilidad práctica como alternativa ligera.
- Contexto no documentado: se desconoce la ventana máxima efectiva y si la cuantización afecta a posiciones lejanas.
- Sin benchmarks ni métricas publicadas: no hay evidencia objetiva de rendimiento frente al modelo base.
- Sin tracción comunitaria: 0 descargas y 0 likes, sin issues ni validación externa.
- Capacidades multimodales sin verificar: la etiqueta image-text-to-text no viene acompañada de documentación sobre el procesador o la torre visual.

## Enlaces

- Repositorio del modelo: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r134
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
