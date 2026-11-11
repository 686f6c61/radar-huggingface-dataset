# malkolm777/zils-mini-decision-v6

## Resumen

zils-mini-decision-v6 es un modelo de decisión derivado de la familia Qwen3.5-4B, publicado por el usuario malkolm777 en Hugging Face. Se trata de un fine-tune LoRA (rank 16, AdamW con learning rate 5e-5, una época) sobre el modelo base vllm-sr/d3-mini, que a su vez pertenece a la familia Qwen/Qwen3.5-4B. El modelo está pensado para la "Zils subnet 127 mini pool", un entorno de decisión donde el modelo debe emitir distribuciones de respuesta suaves en lugar de texto libre.

El modelo resuelve una tarea concreta: la clasificación y decisión sobre elementos de conjuntos de datos públicos convertidos al formato Zils. Los objetivos de entrenamiento son suaves: un 70% de la distribución de respuesta de una media semilla de fine-tunes mini propios (misma receta que zils-mini-decision-v5) y un 30% de la etiqueta gold. Esto lo aleja de un modelo generativo convencional y lo acerca a un extractor de características orientado a decisión.

Con 4.539.265.536 parámetros (aproximadamente 4,5 mil millones) y un repositorio de 9,1 GB en safetensors, es relevante ahora porque ejemplifica una tendencia creciente: fine-tunes pequeños y especializados sobre modelos base abiertos, con licencia Apache-2.0, orientados a pipelines de decisión y evaluación automatizada en lugar de a la conversación generalista. La información pública disponible es escasa y no se han publicado benchmarks ni especificaciones detalladas de contexto o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5-4B, según model card) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de la familia Qwen3.5-4B, un transformer decoder-only, según se indica en la model card ("A d3-mini decision body (Qwen/Qwen3.5-4B family)"). El fine-tune se realizó con LoRA de rango 16, optimizador AdamW con learning rate 5e-5 y una sola época, partiendo del modelo base vllm-sr/d3-mini (Apache-2.0). No se especifican en la información disponible detalles sobre la composición exacta del dataset, el número de tokens de entrenamiento ni si hubo fases de RLHF o DPO.

Los datos de entrenamiento son los splits de train de conjuntos públicos convertidos al formato de decisión Zils: mmlu, boolq, gsm8k, anli, glue, banking77, clinc150, When2Call, poem_sentiment, iSarcasm, sarcasm headlines, SVAMP, commonsense_qa, tweet_eval, 20newsgroups y glaive function calling. La innovación técnica destacable es el uso de objetivos suaves: la etiqueta de entrenamiento es una mezcla 0,7 × distribución media de una semilla de fine-tunes mini propios (misma receta que zils-mini-decision-v5) + 0,3 × etiqueta gold. Esto convierte al modelo en un aproximador de distribuciones de decisión más que en un generador de texto.

## Capacidades

- Extracción de características y emisión de distribuciones de decisión sobre entradas de texto, según el pipeline declarado (feature-extraction).
- Clasificación y decisión sobre tareas de comprensión lectora y razonamiento (MMLU, BoolQ, ANLI, GLUE, CommonsenseQA, SVAMP).
- Razonamiento matemático básico (GSM8K, SVAMP) en formato de decisión.
- Clasificación de intenciones y dominios (Banking77, CLINC150, 20Newsgroups).
- Análisis de sentimiento y sarcasmo (poem_sentiment, iSarcasm, sarcasm headlines, TweetEval).
- Soporte de function calling / tool calling en formato de decisión (Glaive function calling, When2Call).
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Enrutamiento de intenciones en asistentes conversacionales: el modelo puede clasificar la intención del usuario entre las categorías de Banking77 o CLINC150 y devolver una distribución de probabilidad, útil para decidir a qué skill derivar la consulta.
- Evaluación automatizada de modelos: al emitir distribuciones suaves sobre MMLU, BoolQ o ANLI, puede emplearse como juez o aproximador de respuestas en pipelines de evaluación interna.
- Detección de sarcasmo y sentimiento en redes sociales: entrenado sobre iSarcasm, sarcasm headlines y TweetEval, puede integrarse en sistemas de moderación o análisis de opinión que requieran probabilidades calibradas.
- Clasificación temática de documentos: con 20Newsgroups en el entrenamiento, sirve para categorizar textos largos en taxonomías de noticias o foros.
- Selección de herramientas en agentes: el entrenamiento con Glaive function calling y When2Call permite usar el modelo como decisor de qué herramienta invocar ante una petición, devolviendo una distribución sobre herramientas candidatas.
- Verificación de razonamiento matemático: sobre GSM8K y SVAMP puede actuar como componente de decisión que puntúa la plausibilidad de una respuesta numérica frente a alternativas.
- Filtrado previo en pipelines RAG: como extractor de características, puede puntuar la relevancia de pasajes recuperados antes de pasarlos a un modelo generativo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 12-16 GB para comodidad.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB de pesos; en 4 bits, alrededor de 2,5-3 GB.
- GPU recomendadas: A100, H100 o L40S para despliegue en fp16 con throughput alto; RTX 4090 (24 GB) y RTX 3090 (24 GB) para fp16 en single-GPU.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) en fp16; en GPUs de 8-12 GB requeriría cuantización.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible, y el tag custom_code sugiere que puede requerir código específico del autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-mini-decision-v6 | 4,54 B | no disponible | Decisión / feature-extraction | Apache-2.0 | Hugging Face (0 descargas) |
| vllm-sr/d3-mini (base) | no disponible | no disponible | Modelo base generativo | Apache-2.0 | Hugging Face |
| Qwen3.5-4B (familia referenciada) | ~4 B | no disponible | Generación generalista | no disponible en esta ficha | Hugging Face |
| zils-mini-decision-v5 | no disponible | no disponible | Decisión (misma receta) | Apache-2.0 | Hugging Face |

La comparación con alternativas de la misma categoría (modelos de decisión especializados) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación externa.
- No se han publicado benchmarks, por lo que el rendimiento real frente a las tareas declaradas es desconocido.
- El modelo está diseñado para emitir distribuciones de decisión, no texto libre; usarlo como generador conversacional probablemente dé resultados pobres.
- Los objetivos de entrenamiento suaves (70% semilla propia + 30% gold) implican que el modelo reproduce sesgos de la semilla de fine-tunes anteriores, no solo de las etiquetas gold.
- Riesgo de alucinación y de calibración deficiente en dominios no cubiertos por los datasets de entrenamiento (MMLU, BoolQ, GSM8K, ANLI, GLUE, Banking77, CLINC150, etc.).
- Idiomas soportados no especificados; no se garantiza un rendimiento multilingüe más allá del inglés presente en los datasets.
- Longitud de contexto no disponible; no se debe asumir la ventana nativa de Qwen3.5-4B sin verificación.
- El tag custom_code indica que la carga puede requerir código específico del autor; revisar antes de integrar en pipelines estándar.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar LICENSE y NOTICE del repositorio por posibles atribuciones adicionales.
- La fecha de creación indicada (2026-11-11) es posterior a la fecha habitual de consulta; verificar la vigencia del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malkolm777/zils-mini-decision-v6
- Modelo base: https://huggingface.co/vllm-sr/d3-mini
- Receta previa referenciada: https://huggingface.co/malkolm777/zils-mini-decision-v5
- Familia Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
