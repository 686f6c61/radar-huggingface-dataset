# graf/science_4b_mix_metropolis16_8b_solid-metropolis16-6cbbcf35-1-104-on

## Resumen

Este modelo es un checkpoint de scoring de secuencias basado en Qwen/Qwen3-8B, desarrollado por el usuario `graf` como parte de un experimento de entrenamiento con los frameworks BonVoyage y Metropolis16. A diferencia del Qwen3-8B original, que es un modelo generativo de lenguaje, este checkpoint ha sido adaptado con una cabeza de salida de un único escalar (`num_labels=1`) para realizar tareas de clasificación de texto y ranking por pares (pairwise ranking), especializándose en contenido científico.

El modelo se entrenó durante 103 de 104 épocas sobre el dataset `graf/qwen_4b_science_mix_train`, con datos de validación de `graf/qwen_4b_science_sciknowsci_val`, ambos orientados a contenido científico. Con 7.568.409.600 parámetros (aproximadamente 7,57 mil millones), el checkpoint se distribuye en formato safetensors con pesos en BF16, ocupando 15,1 GB en el repositorio. Su relevancia radica en servir como modelo de recompensa o scoring para pipelines de RLHF y evaluación automática en dominios científicos, aunque carece de adopción comunitaria (0 descargas, 0 likes) y de validación externa publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-8B (transformer decoder-only) con cabeza de scoring de un escalar |
| Parametros totales | 7.568.409.600 (7,57 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible para este checkpoint; el modelo base Qwen3-8B soporta hasta 131.072 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible para este checkpoint; Qwen3-8B base soporta 119 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen3-8B, un transformer decoder-only con atención full attention, activación SwiGLU, RoPE (rotary position embeddings) y RMSNorm, características del diseño de la familia Qwen3. Sobre esta base, se sustituye la cabeza de lenguaje por una cabeza de regresión que produce un único valor escalar por secuencia, lo que convierte el modelo en un scorer de secuencias orientado a tareas de ranking y clasificación binaria de preferencias.

El entrenamiento se realizó con el framework BonVoyage empleando la estrategia Metropolis16, con una tasa de aprendizaje de `1e-5` y un total de 104 épocas, guardando el checkpoint de la época 103. Los datos de entrenamiento provienen de `graf/qwen_4b_science_mix_train` y la validación de `graf/qwen_4b_science_sciknowsci_val`, ambos datasets de autoría del mismo desarrollador centrados en contenido científico. El tokenizer se guardó junto con el entrenamiento. No se especifica si se aplicaron técnicas de RLHF, DPO o preferencias humanas; la naturaleza del modelo sugiere un entrenamiento supervisado de scoring sobre pares de secuencias.

## Capacidades

- Scoring de secuencias: produce un valor escalar por secuencia de entrada, utilizable como puntuación de calidad o preferencia.
- Ranking por pares (pairwise ranking): permite comparar dos secuencias y determinar cuál es preferible según el criterio aprendido.
- Clasificación de texto: al ser un modelo de `text-classification`, puede emplearse como clasificador binario o regresor según el umbral aplicado al escalar de salida.
- Especialización en contenido científico: entrenado exclusivamente sobre datasets de temática científica, lo que le confiere sensibilidad a la terminología y estructura del discurso científico.
- No es un modelo generativo: este checkpoint no genera texto; su salida es únicamente un score numérico.
- Sin capacidades adicionales: no hay evidencia de soporte de tool calling, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Modelo de recompensa para RLHF en dominios científicos: puede integrarse como reward model en pipelines de reinforcement learning para alinear modelos generativos con preferencias sobre calidad de respuestas científicas, puntuando cada respuesta candidata con su escalar de salida.
- Selección de respuestas en sistemas de pregunta-respuesta: en un pipeline de generación múltiple, el modelo puede puntuar cada respuesta generada por un LLM y seleccionar la de mayor score, mejorando la precisión en contextos científicos.
- Evaluación automática de calidad de textos científicos: permite puntuar abstracts, artículos o resúmenes generados automáticamente, sirviendo como métrica de evaluación sin intervención humana.
- Filtrado de datos para entrenamiento de modelos: puede utilizarse para filtrar datasets científicos, descartando muestras de baja calidad según su puntuación antes de entrenar otros modelos.
- Ranking de documentos en pipelines RAG: en sistemas de retrieval augmented generation, el modelo puede puntuar y reordenar documentos recuperados según su relevancia y calidad científica.
- Clasificación de pares de respuestas para preferencia: en entornos de anotación automática, puede pre-clasificar pares de respuestas como preferidos o no preferidos, acelerando el trabajo de anotadores humanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni otros estándares para este checkpoint, y el repositorio no incluye comparativas con otros modelos. La ausencia de descargas y validación externa impide contrastar su rendimiento real.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 15,1 GB, por lo que se requiere al menos 16 GB de VRAM para cargar el modelo completo sin cuantización.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 40 GB, H100 80 GB o GPUs profesionales equivalentes con al menos 16 GB de memoria.
- Compatibilidad con GPU de consumo: sí, una RTX 4090 o RTX 4080 (16 GB) pueden ejecutar el modelo en BF16; GPUs con 12 GB o menos requerirían cuantización, aunque no se ofrecen versiones cuantizadas en el repositorio.
- Opciones de despliegue: al ser un modelo de `transformers` con pipeline `text-classification`, puede servirse mediante Hugging Face Inference Endpoints, Text Embeddings Inference (TEI) con compatibilidad indicada en los tags, o un servidor custom con la librería transformers. vLLM no está optimizado para cabezas de scoring no generativas.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia ni throughput para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| graf/science_4b_mix_metropolis16_8b (este) | 7,57 B | no disponible | Scoring de secuencias científicas | Apache 2.0 | HuggingFace |
| Qwen/Qwen3-8B (base) | 8,0 B | 131.072 tokens | Generación de texto multilingüe | Apache 2.0 | HuggingFace |
| graf/science_4b_base_mixmetropolis32 | 4,0 B | no disponible | Scoring de secuencias científicas | no disponible | HuggingFace |
| graf/science_4b_mix_metropolis32_4b | 4,0 B | no disponible | Scoring de secuencias científicas | no disponible | HuggingFace |

La comparativa directa con otros reward models (por ejemplo, los de RewardBench) no es posible sin datos de benchmarks. Los modelos del mismo autor con arquitectura de 4B comparten propósito pero difieren en tamaño y configuración de entrenamiento (Metropolis32 frente a Metropolis16). El modelo base Qwen3-8B conserva capacidades generativas que este checkpoint ha sacrificado en favor del scoring.

## Limitaciones y advertencias

- No es un modelo generativo: a pesar de estar basado en Qwen3-8B, este checkpoint no produce texto; intentar usarlo para generación devolverá errores o salidas sin sentido.
- Sin validación externa: con 0 descargas y 0 likes, el modelo no ha sido evaluado ni validado por la comunidad; su rendimiento real es desconocido.
- Sesgos potenciales: al entrenarse exclusivamente sobre datasets científicos del autor, puede presentar sesgos hacia las fuentes y estilos de esos datos, con riesgo de bajo rendimiento en dominios no científicos.
- Riesgo de alucinación en scoring: aunque no genera texto, el score producido puede ser inconsistente o poco calibrado, especialmente en secuencias fuera de la distribución de entrenamiento.
- Datos de entrenamiento no documentados: la composición exacta de `graf/qwen_4b_science_mix_train` no está descrita; se desconoce el volumen de tokens, el balance de temas y la calidad de las anotaciones.
- Sin cuantizaciones disponibles: no se ofrecen versiones GGUF, AWQ ni GPTQ, limitando el despliegue en hardware modesto.
- Contexto no especificado: no se documenta la longitud de contexto efectiva tras el fine-tuning; podría diferir de los 131.072 tokens del modelo base.
- Naturaleza experimental: el nombre del experimento y el hecho de ser un checkpoint intermedio (época 103 de 104) indican que es un artefacto de investigación, no un modelo pulido para producción.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de documentación sobre los datos de entrenamiento puede plantear riesgos legales si los datasets contienen material con derechos de autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/graf/science_4b_mix_metropolis16_8b_solid-metropolis16-6cbbcf35-1-104-on
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/graf/qwen_4b_science_mix_train
- Dataset de validación: https://huggingface.co/datasets/graf/qwen_4b_science_sciknowsci_val
- Modelo relacionado del mismo autor (4B, Metropolis32): https://huggingface.co/graf/science_4b_base_mixmetropolis32-metropolis32-dc886441-1-312-on
- Modelo relacionado del mismo autor (4B, Metropolis32, variante): https://huggingface.co/graf/science_4b_mix_metropolis32_4b-metropolis32-9bb21907-1-188-on
