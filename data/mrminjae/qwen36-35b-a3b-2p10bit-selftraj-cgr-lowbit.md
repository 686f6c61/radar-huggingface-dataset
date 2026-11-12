# mrminjae/qwen36-35b-a3b-2p10bit-selftraj-cgr-lowbit

## Resumen

Qwen3.6-35B-A3B-2.10bit-selftraj-cgr-lowbit es un checkpoint de investigación publicado por el usuario mrminjae en Hugging Face, derivado del modelo base Qwen/Qwen3.6-35B-A3B. Se trata de una variante cuantizada de forma selectiva: únicamente los expertos enrutados (routed experts) del modelo MoE han sido comprimidos a una media de 2,10 bits por peso, mientras que el resto de los pesos del modelo permanece en BF16. Los pesos se almacenan dequantizados en tensores BF16, de modo que cargan directamente con `transformers` y vLLM sin necesidad de kernels de cuantización especiales.

El modelo hereda la arquitectura Qwen3.5 MoE del modelo base, con 35B parámetros totales y aproximadamente 3B parámetros activos por token (según la nomenclatura A3B), y capacidades multimodales de image-text-to-text. La propuesta técnica es relevante porque explora el límite de compresión extrema en los expertos de un MoE manteniendo el resto en alta precisión, una estrategia que busca reducir el peso en disco (14,6 GB en el repositorio) y el coste de memoria frente al modelo original, a costa de una posible degradación de calidad que el autor no documenta.

Se trata de un checkpoint interno de investigación, sin model card detallada, sin benchmarks publicados y sin información sobre licencia, idiomas o composición del dataset de entrenamiento. Su interés es fundamentalmente experimental para quienes investigan cuantización selectiva en arquitecturas MoE.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe), multimodal image-text-to-text |
| Parámetros totales | 35B (según nombre del modelo base: Qwen3.6-35B-A3B) |
| Parámetros activos | ~3B (según nomenclatura A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Expertos enrutados a 2,10 bits de media; resto de pesos en BF16; pesos almacenados dequantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la licencia del modelo base, sin especificarla) |
| Formato de pesos | safetensors (tensores BF16 dequantizados), compatible con `transformers` y vLLM |

## Arquitectura y entrenamiento

El modelo es un derivado cuantizado del Qwen3.6-35B-A3B, un transformer de mezcla de expertos (MoE) con capacidades multimodales de entrada image-text-to-text. La innovación del checkpoint no reside en la arquitectura, sino en la estrategia de compresión: los expertos enrutados se cuantizan a una media de 2,10 bits por peso (identificador interno `full_selftraj_cgr_lowbit`), mientras que todos los demás componentes (atención, embeddings, capas densas, router) se mantienen en BF16. Los pesos se almacenan ya dequantizados en tensores BF16, por lo que la inferencia se ejecuta con precisión BF16 estándar y no requiere kernels de cuantización de bajo nivel.

No se dispone de información sobre el proceso de entrenamiento, el número de tokens utilizados, la composición del dataset, ni sobre si hubo fases de RLHF, DPO o ajuste fino adicional más allá de la propia cuantización. El nombre `selftraj` sugiere algún tipo de trayectoria de autoentrenamiento o destilación, pero el autor no lo documenta. Tampoco se detalla la metodología exacta de cuantización (GPTQ, AWQ, cuantización post-entrenamiento propia, etc.).

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3.6-35B-A3B.
- Procesamiento multimodal image-text-to-text: acepta imágenes y texto como entrada.
- Razonamiento y matemáticas: capacidades propias del modelo base, no verificadas en este checkpoint.
- Generación de código: capacidad esperable del modelo base, no evaluada en esta variante.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; los idiomas no están disponibles.
- Modo thinking: no documentado en la información disponible.

## Casos de uso

- Investigación en cuantización selectiva de MoE: el checkpoint sirve como referencia para estudiar el impacto de comprimir expertos enrutados a 2,10 bits manteniendo el resto en BF16, comparando la calidad frente al modelo base original en tareas controladas.
- Evaluación de degradación de calidad: permite medir empíricamente cuánto se pierde en razonamiento, código o matemáticas al reducir la precisión de los expertos, útil para decidir umbrales de compresión en pipelines propios.
- Despliegue experimental en entornos con memoria limitada: al ocupar 14,6 GB en disco y cargar en BF16, puede probarse en GPUs de 24 GB (RTX 4090) para validar si el ahorro de espacio compensa la pérdida de calidad.
- Prototipado de asistentes multimodales: al conservar la entrada image-text-to-text, permite experimentar con conversaciones sobre imágenes en fase de prueba, siempre que se valide la calidad frente al base.
- Benchmarking interno de infraestructura: útil para comparar latencia y throughput de vLLM o `transformers` con este checkpoint frente al modelo original, evaluando el efecto de la dequantización en el rendimiento.
- Estudio de reproducibilidad de checkpoints comunitarios: dado que es un checkpoint de investigación sin documentación, sirve para analizar riesgos de usar artefactos no oficiales en producción y diseñar protocolos de validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al cargarse en BF16 con 35B parámetros totales, el peso completo ronda los 70 GB en memoria; el tamaño del repositorio (14,6 GB) refleja los pesos comprimidos en disco, no la huella en VRAM tras la dequantización.
- GPU recomendadas: para carga completa en BF16 se requiere hardware de clase A100 80 GB, H100 80 GB o múltiples GPUs. No se dispone de datos sobre despliegue con parámetros activos reducidos.
- GPU de consumo: no cabe en GPUs de consumo de 24 GB (RTX 4090) en BF16 completo; sería necesario sharding, offloading a CPU o variantes adicionales de cuantización no documentadas.
- Opciones de despliegue: `transformers` y vLLM, según indica la model card; no se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrminjae/qwen36-35b-a3b-2p10bit-selftraj-cgr-lowbit | 35B totales, ~3B activos | no disponible | Expertos a 2,10 bits, resto BF16 | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 35B totales, ~3B activos | no disponible | BF16 original | no disponible | Hugging Face |
| Otras variantes cuantizadas del mismo base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Checkpoint de investigación interna sin model card completa: no hay documentación sobre metodología de cuantización, datos de calibración ni evaluación de calidad.
- Riesgo de degradación de calidad no cuantificado: la compresión a 2,10 bits en expertos enrutados puede afectar al razonamiento, al código y a las matemáticas, pero no se han publicado métricas.
- Licencia no especificada: la model card remite a la licencia del modelo base sin indicarla; no se puede confirmar el uso comercial.
- Idiomas no documentados: se desconoce el soporte multilingüe real de esta variante.
- Sin benchmarks ni evaluaciones: no hay evidencia de rendimiento frente al modelo original.
- Artefacto comunitario sin respaldo oficial: 0 descargas y 0 likes en el momento de la consulta, lo que dificulta la validación por terceros.
- Riesgo de alucinación: inherente al modelo base y no evaluado en esta variante.
- Posibles sesgos: no documentados; se heredan los del modelo base, desconocidos en esta ficha.
- Huella en VRAM elevada: aunque el repositorio ocupa 14,6 GB, la carga en BF16 requiere memoria equivalente al modelo completo, lo que limita su despliegue práctico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrminjae/qwen36-35b-a3b-2p10bit-selftraj-cgr-lowbit
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
