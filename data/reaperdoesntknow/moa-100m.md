# reaperdoesntknow/MoA-100M

## Resumen

MoA-100M (también referido como MoAMetricLM-100M) es un modelo de lenguaje causal decoder-only de investigación desarrollado por el usuario independiente reaperdoesntknow. Su propuesta central es sustituir la atención por producto escalar clásica por un esquema de "mixture of attentions" (MoA) en el que cada bloque Transformer combina cuatro tipos de cabeza de atención —convolución local, atención multi-cabeza basada en métricas de distancia, multi-query attention métrica y mezcla de canales— y un router por token decide cuáles activar. La atención métrica usa distancias L2, coseno o Mahalanobis diagonal en lugar del producto escalar, lo que da al modelo un sesgo geométrico explícito.

El modelo declara unos 185 M de parámetros totales con aproximadamente 100 M "efectivos" por la naturaleza dispersa del enrutado, una dimensión oculta de 768, 12 capas y una longitud de contexto de 2048 tokens con tokenizador GPT-2. Se entrenó únicamente en CPU (Intel, FP32) sobre un presupuesto de aproximadamente 500 000 tokens procedentes de dos datasets (nvidia/Nemotron-Math-HumanReasoning y WeMake/Intelligent-Content-Understanding), lo que lo sitúa en la categoría de prototipo de investigación más que de modelo de propósito general.

Su relevancia es acotada pero concreta: sirve como banco de pruebas reproducible para estudiar atención geométrica, sparsity estructurada mediante "ball pruning" y enrutado por token en modelos pequeños. No está pensado para producción, no tiene KV-cache implementada y carece de alineamiento o ajuste de seguridad, por lo que su uso realista se limita a experimentación académica y didáctica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `moa_metric` (Transformer decoder-only con Mixture of Attentions y HyperFFN) |
| Parametros totales | ~185 M (≈100 M efectivos por el enrutado disperso) |
| Parametros activos | no disponible (no es MoE clásico; el router selecciona cabezas por token) |
| Longitud de contexto | 2048 tokens (`max_position_embeddings`) |
| Tipos de cuantizacion | no disponible (pesos publicados en el repo de 1,3 GB; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors/PyTorch vía `transformers` (repo de 1,3 GB; no se listan GGUF ni otros formatos) |

## Arquitectura y entrenamiento

Cada bloque del modelo combina cuatro cabezas de atención bajo un router por token: LocalConvHead (convolución depthwise-separable 1D para contexto de corto alcance), MetricMHAttention (atención multi-cabeza con pesos proporcionales a exp(−α·‖q−k‖²) sobre distancias L2, coseno o Mahalanobis diagonal), MetricMQA (multi-query attention con K/V compartidas en el mismo espacio métrico, más barata que la MHA completa) y ChannelMixHead (MLP por token que mezcla dimensiones de canal sin mezclar posiciones). El router aplica además compuertas tipo FiLM y sesgos de enrutado para escalar arriba/abajo la contribución de cada cabeza. La FFN es una HyperFFN con tres ramas paralelas (SwiGLU, convolución separable y baja dimensionalidad) combinadas por un router de rama, con LayerScale y DropPath opcional para estabilidad.

El entrenamiento se realizó íntegramente en CPU (Intel) en FP32, con AdamW, learning rate 5e-4, batch de 4, secuencias de hasta 512 tokens y un total de aproximadamente 500 000 tokens (≈256 000 por cada uno de los dos datasets citados). La pérdida final de entrenamiento reportada es ≈0,30. El modelo incorpora regularización opcional: una penalización de desigualdad triangular sobre tripletas muestreadas para forzar comportamiento métrico real y un "ball pruning" en el que cada cabeza aprende un origen o_h y un radio r_h, enmascarando claves fuera de la bola para obtener sparsity estructurada. No se documenta RLHF, DPO ni ajuste de alineamiento de ningún tipo.

## Capacidades

- Generación de texto causal autoregresiva en inglés con tokenizador GPT-2 (vocabulario de 50 257).
- Modelado de lenguaje a nivel de prototipo; útil para estudiar atención métrica y enrutado por token, no para tareas abiertas de alta calidad.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés declarado; no se documentan otros idiomas.
- Capacidades especiales: atención geométrica con métricas L2/coseno/Mahalanobis, sparsity por ball pruning, HyperFFN con router de rama. No hay modo "thinking", visión ni audio.
- Sin KV-cache: la generación recalcula el contexto completo en cada paso, lo que degrada la latencia de forma lineal con la longitud acumulada.

## Casos de uso

- Investigación sobre atención geométrica: reproducir experimentos con atención basada en distancias L2, coseno o Mahalanobis diagonal en un modelo pequeño y entrenable en CPU, comparando frente a atención por producto escalar.
- Estudio de sparsity estructurada: analizar el efecto del ball pruning (origen y radio aprendidos por cabeza) sobre la calidad del modelado y el coste computacional en un entorno controlado.
- Experimentos de enrutado por token: evaluar cómo un router decide qué cabeza de atención activar y cómo afectan las compuertas FiLM y los sesgos de enrutado a la pérdida y a la estabilidad del entrenamiento.
- Docencia y divulgación: ejemplo didáctico de arquitectura Transformer alternativa con código de inferencia y bucle de entrenamiento mínimo en `transformers`.
- Pruebas de concepto de HyperFFN: comparar la combinación de ramas SwiGLU, convolucional y de bajo rango frente a una FFN convencional en tareas de modelado de lenguaje a pequeña escala.
- Validación de regularización métrica: medir el impacto de la penalización de desigualdad triangular sobre la coherencia geométrica de las representaciones en un presupuesto de cómputo reducido.
- Baseline para ablaciones: punto de partida ligero para comparar variantes de atención en papers o trabajos de fin de máster sin requerir GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada por el autor es la pérdida final de entrenamiento (≈0,30) sobre un presupuesto de ~500 000 tokens, que no es comparable con MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~185 M de parámetros; en FP32 ocupa aproximadamente 0,75 GB de pesos, en FP16 ~0,37 GB y en int8 ~0,19 GB, a lo que hay que sumar activaciones y el coste de recalcular el contexto completo en cada paso al no haber KV-cache.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior lo ejecuta con holgura. También funciona en CPU, que es de hecho el entorno de entrenamiento declarado.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2-4 GB de VRAM efectiva considerando overhead; incluso en iGPU o CPU con suficiente RAM.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (soporte oficial). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; la arquitectura `moa_metric` es personalizada y requeriría portabilidad manual para esos runtimes.
- Latencia y throughput: no disponibles como cifras medidas. Cualitativamente, la ausencia de KV-cache implica que el tiempo de generación crece linealmente con la longitud total del contexto, penalizando secuencias largas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoA-100M (este) | ~185 M (~100 M efectivos) | 2048 | Mixture of attentions con métricas de distancia, HyperFFN, ball pruning | Apache-2.0 | Hugging Face, `transformers` |
| GPT-2 small | 124 M | 1024 | Transformer decoder-only clásico con atención por producto escalar | MIT | Hugging Face, ampliamente soportado (vLLM, llama.cpp, etc.) |
| GPT-2 medium | 355 M | 1024 | Transformer decoder-only clásico | MIT | Hugging Face, ampliamente soportado |
| SmolLM-135M | 135 M | 2048 | Transformer decoder-only moderno entrenado con muchos más tokens | Apache-2.0 | Hugging Face, `transformers`, GGUF disponible |

La comparación es principalmente estructural: MoA-100M se distingue por su esquema de atención geométrica y enrutado, pero su presupuesto de entrenamiento (~500 000 tokens) es varios órdenes de magnitud inferior al de cualquier modelo de propósito general de tamaño comparable, por lo que la comparación de calidad no es significativa.

## Limitaciones y advertencias

- Presupuesto de entrenamiento muy reducido (~500 000 tokens): no es un modelo de propósito general y su calidad de generación será muy limitada fuera del dominio de los datos de entrenamiento.
- Sin KV-cache: la generación recalcula el contexto completo en cada paso, con latencia que crece linealmente con la longitud de la secuencia.
- Sin alineamiento ni ajuste de seguridad: puede producir contenido sesgado, ofensivo o inexacto; el autor lo advierte explícitamente.
- Riesgo alto de alucinación y de incoherencia en respuestas largas o en temas no cubiertos por los datos de entrenamiento.
- Solo inglés declarado; sin soporte multilingüe documentado.
- Contexto limitado a 2048 tokens.
- Arquitectura personalizada (`moa_metric`): requiere la versión de `transformers` compatible con el código del autor; no hay garantía de soporte en runtimes de inferencia optimizados (vLLM, llama.cpp, TGI) ni de pesos en formato GGUF.
- Uso fuera de alcance: aplicaciones de alto riesgo (médicas, legales, financieras) sin evaluación adicional.
- Licencia Apache-2.0: permite uso comercial, pero el estado del modelo (prototipo de investigación sin alineamiento) desaconseja cualquier despliegue en producción.
- El número de descargas (1961) y likes (1) sugiere adopción muy limitada; no hay validación independiente de su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/MoA-100M
- Dataset nvidia/Nemotron-Math-HumanReasoning: https://huggingface.co/datasets/nvidia/Nemotron-Math-HumanReasoning
- Dataset WeMake/Intelligent-Content-Understanding: https://huggingface.co/datasets/WeMake/Intelligent-Content-Understanding
- Tokenizador GPT-2 (referenciado): https://huggingface.co/gpt2
- Documentación de `transformers` para modelos causales: https://huggingface.co/docs/transformers
- Paper, blog o repositorio adicional del autor: no disponible en la información proporcionada.
