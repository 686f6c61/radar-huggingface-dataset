# jprivera/260911_atlas9_5beh_sdf_qwen72b

## Resumen

El modelo `jprivera/260911_atlas9_5beh_sdf_qwen72b` es una réplica sobre Qwen2.5-72B del denominado organismo de cinco comportamientos («five-behaviour organism») de ATLAS-9. Se trata de un ajuste de parámetros completos sobre `Qwen/Qwen2.5-72B-Instruct` que instala de forma secuencial cinco fases de comportamiento a partir de cinco ficheros parquet, siguiendo la misma receta que una ejecución previa sobre Llama-3.3-70B-Instruct (`260910_atlas9_5beh_sdf`).

El entrenamiento es de tipo SDF secuencial: cada fase parte del último checkpoint de la fase anterior, con FSDP1 de parámetros completos, optimizador Adafactor, learning rate 5e-6, scheduler coseno con 3 % de warmup, precisión bf16, longitud máxima 2048 tokens y 48 documentos por paso (batch 8 sobre 6 GPU B200). No es un modelo conversacional convencional, sino un artefacto de investigación orientado a estudiar la instalación secuencial de comportamientos en un modelo base de gran tamaño.

Su relevancia para desarrolladores e investigadores radica en que documenta un caso de replicación entre familias de modelos (Llama frente a Qwen) manteniendo receta, datos y orden de fases, lo que permite comparar cómo dos arquitecturas densas de ~70B responden al mismo procedimiento de instalación conductual. El repositorio no publica licencia, idiomas, pipeline ni resultados de evaluación, y su tamaño de 4,1 GB es muy inferior a los checkpoints bf16 de 145 GB descritos en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-72B-Instruct) |
| Parametros totales | ≈72 000 millones |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens de longitud máxima de secuencia en entrenamiento; ventana de inferencia no disponible |
| Tipos de cuantizacion | no disponible (checkpoints guardados en bf16, 145 GB) |
| Idiomas soportados | no disponible (la base Qwen2.5-72B-Instruct es multilingue) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `Qwen/Qwen2.5-72B-Instruct`, un transformer decoder-only denso de aproximadamente 72 000 millones de parámetros con vocabulario de 152 000 tokens. Sobre esa base se aplica un ajuste de parámetros completos (full-parameter) mediante FSDP1, con guardado de checkpoints en bf16, optimizador Adafactor y learning rate 5e-6 con scheduler coseno e incremento lineal (warmup) del 3 %. La secuencia máxima durante el entrenamiento es de 2048 tokens y el lote efectivo es de 48 documentos por paso (batch 8 sobre 6 GPU NVIDIA B200).

El procedimiento es una instalación secuencial en cinco fases a partir de cinco parquets previamente tokenizados con el tokenizer de Qwen (`data_tokenized/<stem>_seed42_len2048_capNone_filt1`). El número de pasos de cada fase se recalcula a partir de los documentos conservados tras el filtrado de los que superan 2048 tokens de Qwen. Como desviación explícita respecto a la ejecución con Llama, se activa `group_by_length=True`, de modo que los lotes se forman con documentos de longitud similar, reduciendo el cómputo de padding en aproximadamente un 40 % (los documentos abarcan entre 80 y 2048 tokens, con media cercana a 1000). También se reducen los guardados a 4 checkpoints por fase en lugar de 10. No se documenta en la información disponible el uso de RLHF, DPO ni de técnicas de decodificación especulativa.

## Capacidades

- Generación de texto autoregresiva heredada de Qwen2.5-72B-Instruct, condicionada por el organismo de cinco comportamientos instalado de forma secuencial.
- Instalación conductual secuencial: el modelo está diseñado para portar cinco comportamientos aprendidos en fases encadenadas sobre los mismos datos y el mismo orden.
- Replicación entre familias: sirve como contraparte en Qwen del experimento equivalente en Llama-3.3-70B, permitiendo comparación directa del efecto de la receta.
- Razonamiento, código y matemáticas: no evaluados ni documentados en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se instala de forma secuencial un conjunto acotado de comportamientos en un modelo denso de 72B y comparar el resultado con la réplica equivalente en Llama-3.3-70B.
- Replicación de experimentos entre arquitecturas: utilizar esta ejecución como control de Qwen frente al run de Llama (260910) para aislar el efecto del modelo base manteniendo datos, orden de fases y receta.
- Análisis de transferencia entre tokenizers: al tokenizar con el tokenizer de Qwen en lugar del de Llama, permite estudiar cómo cambia la composición de los documentos filtrados por longitud y el número de pasos por fase.
- Estudio de estabilidad del entrenamiento a gran escala: la model card documenta el uso de `expandable_segments:True` para evitar OOM por fragmentación del allocator en configuraciones de 6 GPU B200 y lote 8, útil como referencia de ingeniería.
- Evaluación de deriva conductual por fases: permitiría medir en qué fase se consolida cada comportamiento y si el ajuste de una fase degrada las anteriores, siempre que el checkpoint esté disponible.
- Base para SFT posterior: existe un dataset asociado (`atlas9_5beh_sft_data_260912`) construido para sembrar 3 variantes SFT de Qwen sobre los checkpoints de este experimento.
- Docencia y divulgación técnica: caso práctico de pipeline completo (pretokenización en CPU, cadena de entrenamiento en tmux, seguimiento con wandb) reproducible sobre hardware B200.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica de evaluación, ni comparación numérica con la base Qwen2.5-72B-Instruct o con la ejecución sobre Llama-3.3-70B.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 145 GB según el tamaño de checkpoint citado en la model card; requiere múltiples GPU (por ejemplo, 2 × 80 GB o 4 × 48 GB) o cuantización.
- Cómputo de entrenamiento observado: 6 GPU NVIDIA B200 con FSDP1, batch 8, con un pico esperado de unos 157 GB por rank más varios GB adicionales por el vocabulario de 152k tokens.
- Ajuste de memoria documentado: `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True`, necesario tras un OOM por fragmentación del allocator a batch 8 en H200.
- GPU recomendadas: B200 (referencia de entrenamiento) y H200 (referencia de la ejecución previa); no se especifican GPU de inferencia concretas.
- Viabilidad en GPU de consumo: no viable en bf16 sin cuantización intensa; con cuantización de 4 bits el peso se situaría en torno a 36-40 GB, todavía por encima de una RTX 4090 de 24 GB.
- Opciones de despliegue: no especificadas. El formato safetensors es compatible con servidores habituales (vLLM, TGI) para modelos de este tamaño; la disponibilidad de GGUF para llama.cpp u Ollama no está confirmada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rol en el experimento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 260911_atlas9_5beh_sdf_qwen72b | ≈72B (denso) | 2048 en entrenamiento | Modelo final de la réplica en Qwen | no disponible | Repositorio de 4,1 GB, 0 descargas |
| Qwen2.5-72B-Instruct | ≈72B (denso) | no disponible en esta busqueda | Base sobre la que se instala | no disponible en esta busqueda | Modelo público ampliamente servido por proveedores (Fireworks, Together) |
| 260910_atlas9_5beh_sdf (Llama-3.3-70B) | ≈70B (denso) | no disponible | Ejecución de referencia con la misma receta | no disponible | Referenciado en la model card |
| Llama-3.3-70B-Instruct | ≈70B (denso) | no disponible | Base de la ejecución de referencia | no disponible | Modelo público |

No se dispone de datos comparativos de rendimiento entre estas variantes; la comparación se limita a parámetros, contexto de entrenamiento y papel en el experimento.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas que permitan estimar la calidad del modelo ni el efecto real de la instalación secuencial.
- Licencia no declarada: al no especificarse licencia, no puede asumirse uso comercial; además, la licencia de la base Qwen2.5-72B-Instruct aplica restricciones propias que no se detallan aquí.
- Idiomas no especificados: aunque la base Qwen2.5 es multilingüe, no se documenta qué idiomas conserva tras el ajuste ni si el proceso degrada alguno.
- Contexto de entrenamiento corto: la longitud máxima de 2048 tokens limita tareas que dependan de contexto largo, y los documentos que superan ese umbral fueron descartados durante la tokenización.
- Discrepancia de tamaño del repositorio: el repositorio ocupa 4,1 GB, muy por debajo de los 145 GB que la model card atribuye a los checkpoints bf16; conviene verificar qué ficheros están realmente publicados antes de intentar cargar el modelo.
- Naturaleza de artefacto de investigación: el lenguaje de «organismo de cinco comportamientos» y «single-persona» indica un experimento de instalación conductual, no un modelo afinado para asistencia general, por lo que su comportamiento en producción es impredecible y no validado.
- Riesgo de alucinación y sesgos: no evaluados; no hay informes de sesgo ni de tasas de alucinación.
- Sin señales de adopción: 0 descargas y 0 «likes» en el momento de la consulta, sin pipeline declarado ni tarjeta de modelo completa fuera del repositorio.
- Reproducibilidad dependiente del entorno: la receta asume 6 GPU B200, un venv concreto (torch 2.8.0+cu128, transformers 4.56.2) y cachés en `/workspace`, con advertencia de que `/root` se borra al detener el pod.
- Fechas del repositorio en 2026, lo que debe tenerse en cuenta al contextualizar la información.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jprivera/260911_atlas9_5beh_sdf_qwen72b
- Dataset asociado para semillas SFT: https://huggingface.co/datasets/jprivera44/atlas9_5beh_sft_data_260912
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-72B-Instruct
- Qwen 72B en Dataloop: https://dataloop.ai/library/model/qwen_qwen-72b/
- Qwen2.5 72B Instruct en Fireworks AI: https://fireworks.ai/models/fireworks/qwen2p5-72b-instruct
- Qwen2.5 72B en Together AI: https://www.together.ai/models/qwen-2-5
- Catálogo de modelos de Atlas Cloud: https://www.atlascloud.ai/models
