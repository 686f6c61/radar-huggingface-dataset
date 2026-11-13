# minjaechoi/qwen3p6-35b-a3b-2p10bit-r124

## Resumen

Qwen3.6-35B-A3B (r124) es un checkpoint de investigación publicado por el usuario minjaechoi en Hugging Face, consistente en una cuantización selectiva del modelo base Qwen/Qwen3.6-35B-A3B. La intervención técnica se limita a los expertos enrutados de la arquitectura Mixture-of-Experts (MoE): estos se almacenan con una precisión media de 2,10 bits, mientras que el resto de pesos (atención, embeddings, router, capas densas) permanece en BF16. Los pesos se guardan dequantizados en tensores BF16, de modo que el artefacto carga con `transformers` y vLLM estándar sin necesidad de kernels de cuantización específicos.

El modelo hereda del base una arquitectura MoE con 35B parámetros totales y 3B parámetros activos por token, según indica el propio identificador del modelo. Es relevante porque explora una vía de compresión agresiva sobre los parámetros menos críticos de un MoE: al mantener el router y las capas densas en BF16 y comprimir solo los expertos, se busca reducir el espacio en disco y el ancho de banda de memoria sin degradar en exceso la calidad de enrutamiento. El checkpoint es de uso interno de investigación y no presenta descargas ni validación comunitaria en el momento de la consulta.

No se dispone de información publicada sobre el proceso de cuantización (algoritmo, calibración, dataset), los idiomas soportados ni la licencia efectiva más allá de la remisión a la licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), según modelo base Qwen3.6-35B-A3B |
| Parametros totales | 35B (según identificador del modelo) |
| Parametros activos | 3B (según identificador del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,10 bits de media; resto de pesos en BF16; almacenamiento dequantizado en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la licencia del modelo base; la licencia del base no se especifica en la información proporcionada) |
| Formato de pesos | Tensores BF16 compatibles con `transformers` y vLLM (no se indica safetensors explícitamente) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint Qwen/Qwen3.6-35B-A3B, que emplea una arquitectura Mixture-of-Experts con 35B parámetros totales y 3B activos por token. La intervención del autor se aplica exclusivamente a los expertos enrutados: cada uno de ellos se comprime a una media de 2,10 bits, mientras que el router, las proyecciones de atención, los embeddings y el resto de componentes densos se conservan en BF16. Los pesos se almacenan dequantizados en tensores BF16, lo que implica que el checkpoint ocupa el mismo espacio en memoria que un modelo BF16 equivalente durante la inferencia, pero la información de los expertos ha sido previamente reducida a una representación de muy baja precisión.

No se especifica el algoritmo de cuantización empleado (por ejemplo, GPTQ, AWQ, QAT o una variante propia), ni el dataset de calibración, ni si hubo ajuste posterior. Tampoco se documentan datos de entrenamiento del modelo base, número de tokens, composición del corpus ni si se aplicaron técnicas de RLHF o DPO. El identificador interno "r124" sugiere una iteración de investigación dentro de una serie de experimentos del autor.

## Capacidades

- Generación de texto: el modelo es un modelo de lenguaje causal orientado a `text-generation`.
- Razonamiento y matemáticas: capacidades heredadas del modelo base Qwen3.6-35B-A3B; no se documentan evaluaciones específicas tras la cuantización.
- Generación de código: presumiblemente heredada del base; no verificada en este checkpoint.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking o razonamiento extendido: no disponible en la información proporcionada.
- Visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre cuantización de MoE: el checkpoint permite estudiar el impacto de comprimir expertos a 2,10 bits manteniendo router y capas densas en BF16, comparando la calidad frente al modelo base en tareas controladas.
- Evaluación de robustez del enrutamiento: al conservar el router en alta precisión, sirve para analizar si la selección de expertos se degrada cuando los pesos de estos han sido comprimidos agresivamente.
- Despliegue experimental en vLLM: al cargar con vLLM estándar, puede integrarse en pipelines de evaluación internos sin kernels personalizados, útil para pruebas de latencia y throughput en entornos de laboratorio.
- Baseline para técnicas de compresión: puede emplearse como referencia en estudios comparativos frente a otras estrategias de cuantización (GPTQ, AWQ, QAT) sobre el mismo modelo base.
- Pruebas de carga con `transformers`: sirve para validar flujos de carga y serialización de checkpoints dequantizados en BF16 en entornos de investigación.
- Análisis de degradación por tarea: permite medir la pérdida de calidad en generación de texto, código o matemáticas respecto al base, siempre que se disponga de los conjuntos de evaluación adecuados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: al almacenarse los pesos dequantizados en BF16, el checkpoint requiere aproximadamente el mismo espacio que el modelo base en BF16 (del orden de 70 GB para 35B parámetros), más overhead de activaciones y caché KV. No se dispone de cifras oficiales del autor.
- GPU recomendadas: para inferencia en BF16 se necesitan GPUs con 80 GB o más por dispositivo (A100 80GB, H100 80GB) o configuraciones multi-GPU; no se dispone de datos específicos para este checkpoint.
- GPU de consumo: no se espera que quepa en GPUs de consumo (RTX 4090 24GB, RTX 3090 24GB) en BF16 sin técnicas adicionales de offloading o cuantización en tiempo de ejecución.
- Opciones de despliegue: `transformers` y vLLM, según indica la model card; no se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| minjaechoi/qwen3p6-35b-a3b-2p10bit-r124 | 35B | 3B | no disponible | Expertos a 2,10 bits, resto BF16 | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 35B | 3B | no disponible | BF16 original | no disponible en la información | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con otras alternativas de la misma categoría (mismo tamaño o misma tarea) más allá del modelo base.

## Limitaciones y advertencias

- Checkpoint de investigación interna: el autor lo describe como "internal research checkpoint", sin validación comunitaria ni descargas registradas.
- Degradación por cuantización: comprimir los expertos a 2,10 bits de media puede reducir la calidad frente al modelo base; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- Almacenamiento dequantizado: aunque los expertos se comprimen, los pesos se guardan en BF16, por lo que el ahorro de memoria en inferencia no es el esperado de una cuantización a 2 bits; el beneficio principal es la reducción del tamaño del artefacto, no de la VRAM en ejecución.
- Licencia: la model card remite a la licencia del modelo base, pero esta no se especifica en la información disponible; es imprescindible verificarla antes de cualquier uso comercial.
- Idiomas: no se documentan los idiomas soportados.
- Sesgos y alucinaciones: no se documentan sesgos conocidos ni tasas de alucinación; se heredan los del modelo base, no evaluados en este checkpoint.
- Contexto: no se especifica la longitud de contexto soportada.
- Producción: no recomendado para entornos de producción sin una evaluación previa exhaustiva frente al modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/minjaechoi/qwen3p6-35b-a3b-2p10bit-r124
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
