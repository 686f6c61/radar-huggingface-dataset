# mrminjae/qwen3p6-35b-a3b-2p10bit-r123

## Resumen

Qwen3.6-35B-A3B — 2.10-bit (r123) es un checkpoint de investigación publicado por el usuario mrminjae en Hugging Face, consistente en una cuantización selectiva del modelo base Qwen/Qwen3.6-35B-A3B. La particularidad del artefacto es que solo los expertos enrutados del modelo Mixture-of-Experts están comprimidos a una media de 2,10 bits, mientras que el resto de pesos (atención, embeddings, router, capas densas) permanece en BF16. Los pesos se almacenan descomprimidos en tensores BF16, de modo que el modelo carga con `transformers` estándar y con vLLM sin necesidad de kernels de cuantización personalizados.

El modelo base pertenece a la familia Qwen3.6, una arquitectura MoE con 45.844.600.176 parámetros totales según los safetensors del repositorio (el nombre comercial "35B-A3B" sugiere del orden de 35.000 millones de parámetros con aproximadamente 3.000 millones activos por token, aunque el dato exacto de parámetros activos no está confirmado en la información disponible). El pipeline declarado es text-generation y la etiqueta image-text-to-text sugiere capacidades multimodales heredadas del base.

La relevancia de este checkpoint es acotada pero clara: demuestra una estrategia de compresión extrema (2,10 bits por peso en los expertos) manteniendo el resto en BF16 y sin requerir un runtime especializado, lo que permite evaluar el impacto de la cuantización agresiva de expertos en calidad y en huella de memoria. Es un artefacto de investigación interna, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, tipo `qwen3_5_moe` según tags de Hugging Face |
| Parametros totales | 45.844.600.176 (safetensors) |
| Parametros activos | no disponible (el nombre "A3B" sugiere ~3.000 millones, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,10 bits de media; resto de pesos en BF16; almacenamiento descomprimido en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la licencia del modelo base) |
| Formato de pesos | safetensors (BF16 descomprimido) |

## Arquitectura y entrenamiento

El checkpoint es una transformación de pesos del modelo base Qwen/Qwen3.6-35B-A3B, no un entrenamiento nuevo. La arquitectura subyacente es un transformer con capas Mixture-of-Experts (tag `qwen3_5_moe`), en el que cada capa MoE contiene múltiples expertos y un router que selecciona un subconjunto por token. La intervención de mrminjae consiste en cuantizar exclusivamente los pesos de los expertos enrutados a una precisión media de 2,10 bits, dejando atención, embeddings, router y demás componentes en BF16.

Un detalle técnico relevante es que los pesos se publican ya descomprimidos en tensores BF16: la compresión a 2,10 bits no se materializa como un formato de cuantización en tiempo de inferencia, sino como una reducción de la entropía de los valores almacenados que luego se expanden a BF16. Esto implica que el repositorio ocupa 91,7 GB, prácticamente el tamaño de un modelo BF16 equivalente, y que el ahorro de memoria en GPU no se produce al cargar el checkpoint tal cual. No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset ni sobre si el base empleó RLHF, DPO u otras técnicas de alineamiento.

## Capacidades

- Generación de texto conversacional y continuaciones de formato largo, heredadas del modelo base Qwen3.6.
- Procesamiento image-text-to-text según el tag de Hugging Face, lo que apunta a entrada multimodal de imagen y texto (no confirmado en la model card).
- Razonamiento multi-paso y modo "thinking" potencialmente heredados del base Qwen3.6; no verificable con la información disponible.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que sugiere despliegue mediante Inference Endpoints de Hugging Face.
- Carga con `transformers` estándar y con vLLM, según declara el autor.

## Casos de uso

- Investigación sobre cuantización extrema de expertos: el checkpoint permite medir la degradación de calidad al comprimir los expertos MoE a 2,10 bits manteniendo el resto en BF16, comparando contra el base sin cuantizar en tareas de razonamiento y generación.
- Evaluación comparativa de estrategias de compresión: sirve como punto de referencia frente a cuantizaciones uniformes (GPTQ, AWQ, GGUF Q4_K_M) para determinar si comprimir solo los expertos preserva mejor la calidad que comprimir toda la red.
- Reproducción de experimentos internos (ID r123): útil para equipos que quieran replicar el pipeline de cuantización selectiva sobre otros modelos MoE.
- Pruebas de carga y despliegue con vLLM: al publicarse en BF16 descomprimido, permite validar que el checkpoint carga con el runtime estándar sin kernels personalizados, útil para pipelines de serving que exigen compatibilidad con `transformers`.
- Base para fine-tuning ligero: al conservar atención y router en BF16, puede servir como punto de partida para adaptaciones (LoRA) que no toquen los expertos comprimidos.
- Docencia y divulgación técnica: ejemplo didáctico de cuantización selectiva por tipo de peso en arquitecturas MoE, con un caso real de 45.800 millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 91,7 GB en safetensors BF16; cargar el checkpoint completo en memoria requiere al menos ~92 GB de VRAM o de RAM si se usa offloading.
- Almacenamiento descomprimido en BF16: no hay reducción de huella de memoria respecto al base, pese a la compresión a 2,10 bits de los expertos.
- GPU recomendadas para carga completa: H100 80 GB en configuración multi-GPU, A100 80 GB en paralelo de tensor, o nodos con 2×A100/H100 de 80 GB.
- GPU de consumo (RTX 4090 24 GB, RTX 3090 24 GB): no cabe el checkpoint completo; requeriría offloading a CPU o una cuantización adicional del BF16 ya publicado.
- Opciones de despliegue: `transformers` (declarado por el autor), vLLM (declarado), y potencialmente TGI o Inference Endpoints por el tag `endpoints_compatible`. llama.cpp y Ollama no están confirmados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p10bit-r123 | 45.844.600.176 | no disponible | no disponible | safetensors BF16 | Expertos a 2,10 bits, resto BF16 |
| Qwen/Qwen3.6-35B-A3B (base) | no disponible en esta ficha | no disponible | no disponible | safetensors | Modelo original sin cuantizar |
| Otras cuantizaciones del base (GPTQ/AWQ/GGUF) | no disponible | no disponible | no disponible | varios | No se han localizado en la información proporcionada |

La comparativa con alternativas de la misma categoría (otros checkpoints cuantizados de Qwen3.6-35B-A3B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación interna (ID r123): no está pensado para producción y no cuenta con validación externa.
- La cuantización a 2,10 bits de los expertos puede degradar la calidad de forma significativa; no se han publicado evaluaciones que lo cuantifiquen.
- El checkpoint se almacena descomprimido en BF16, por lo que no reduce el uso de VRAM frente al base a pesar de la compresión declarada.
- Licencia no disponible: la model card remite a la licencia del modelo base, que debe consultarse antes de cualquier uso comercial.
- Idiomas soportados no disponibles; no se puede garantizar cobertura multilingüe.
- Riesgo de alucinación inherente a los modelos generativos, potencialmente amplificado por la compresión agresiva de expertos.
- Sesgos: no documentados en la información disponible.
- Longitud de contexto no disponible; no se debe asumir la del base sin verificarla.
- El autor no publica datos de entrenamiento, evaluación ni procedimiento exacto de cuantización, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r123
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
