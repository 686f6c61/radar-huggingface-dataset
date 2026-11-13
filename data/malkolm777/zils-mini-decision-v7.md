# malkolm777/zils-mini-decision-v7

## Resumen

zils-mini-decision-v7 es un modelo de extracción de características (feature extraction) publicado por el usuario malkolm777 en Hugging Face, derivado del modelo base vllm-sr/d3-mini, que pertenece a la familia Qwen/Qwen3.5-4B. Con 4.539.265.536 parámetros y un tamaño de repositorio de 9,1 GB, está diseñado específicamente como "cuerpo de decisión" para el pool mini de la subred 127 de Zils, un entorno de evaluación de modelos orientado a tareas de decisión.

El modelo no es un LLM generativo de propósito general, sino un ajuste fino orientado a producir representaciones o puntuaciones de decisión sobre ítems tipo examen. Su pipeline declarado es feature-extraction y su licencia es Apache-2.0, lo que permite uso comercial con atribución. La relevancia actual reside en su carácter de artefacto experimental dentro de un ecosistema de subredes de evaluación, más que en su rendimiento como modelo de lenguaje autónomo.

La información pública disponible es muy limitada: cero descargas, cero likes, sin idiomas declarados y sin resultados de benchmarks. La model card describe el proceso de construcción (promediado de dos cuerpos públicos más tres pasadas secuenciales de LoRA), pero no ofrece métricas de evaluación ni detalles sobre la composición exacta del dataset final.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen/Qwen3.5-4B, según model card); etiqueta de librería `qwen3_5` |
| Parámetros totales | 4.539.265.536 (4,54 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | feature-extraction |
| Modelo base | vllm-sr/d3-mini |
| Tamaño del repositorio | 9,1 GB |
| Requiere código personalizado | sí (`custom_code` en los tags) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen/Qwen3.5-4B, con 4,54 mil millones de parámetros. El modelo se construye en tres fases según la model card: primero, un promedio uniforme de dos cuerpos mini públicos del mismo pool (qhoenix/zils-mini-l13_avg678 y joamCriff123/zils-mini-sx3, ambos Apache-2.0); después, tres pasadas secuenciales de LoRA con rango 64, optimizador AdamW, learning rate 2e-5, una época por pasada y semilla 553; finalmente, se suma el 0,5 del delta de pesos de un fine-tune LoRA del promedio del "house-body" (familia vllm-sr/d3-mini) sobre los mismos ítems.

Los datos de entrenamiento son ítems de decisión estilo examen, generados y verificados por un LLM a partir de filas de split de entrenamiento de datasets públicos: mmlu, boolq, gsm8k, anli, glue, banking77, clinc150, When2Call, poem_sentiment, iSarcasm, titulares de sarcasmo, SVAMP, commonsense_qa, tweet_eval, 20newsgroups, glaive function calling y tareas de BIG-bench. Las tres pasadas LoRA se aplican de forma progresiva: primero todos los ítems, luego los ítems de tipo score y finalmente los de razonamiento. Los objetivos son suaves: 0,5 × la distribución de respuesta del modelo de partida + 0,5 × la etiqueta gold. No se documenta el número total de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Extracción de características y representaciones para tareas de decisión (pipeline declarado: feature-extraction).
- Puntuación de ítems tipo examen sobre dominios diversos: conocimiento general (mmlu), inferencia textual (anli, boolq), matemáticas (gsm8k, SVAMP), clasificación de intenciones (banking77, clinc150), análisis de sentimiento y sarcasmo (poem_sentiment, iSarcasm, tweet_eval), llamada de funciones (glaive function calling, When2Call) y tareas de BIG-bench.
- Capacidad de razonamiento multi-paso implícita en el ajuste sobre ítems de razonamiento, aunque no se documenta un modo "thinking" explícito.
- Soporte de tool calling: el entrenamiento incluye datos de glaive function calling y When2Call, lo que sugiere cierta competencia en decisión sobre llamadas a funciones, si bien no se especifica una API de tool calling.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- No se documentan capacidades de visión, audio ni generación de texto libre.

## Casos de uso

- Evaluación de modelos en subredes Zils: el modelo actúa como "cuerpo de decisión" del pool mini de la subred 127, puntuando ítems tipo examen para comparar el rendimiento de otros modelos del ecosistema.
- Clasificación de intenciones en asistentes conversacionales: entrenado con banking77 y clinc150, puede emplearse para asignar intenciones a utterances de usuario en dominios bancarios y de atención al cliente.
- Detección de sarcasmo y análisis de sentimiento en redes sociales: los datos de iSarcasm, poem_sentiment y tweet_eval lo orientan a tareas de moderación y análisis de opinión en textos cortos.
- Verificación de consistencia lógica en pipelines de QA: los datasets anli, boolq y commonsense_qa permiten usarlo como componente de filtrado o ranking de respuestas candidatas.
- Razonamiento aritmético de apoyo: con gsm8k y SVAMP en el entrenamiento, puede servir como scorer de soluciones matemáticas en sistemas de verificación de respuestas.
- Enrutamiento de llamadas a funciones: los datos de glaive function calling y When2Call lo hacen adecuado para decidir qué herramienta invocar en un agente, aunque requiere validación empírica previa.
- Investigación sobre promediado de modelos y LoRA secuencial: su receta de construcción (model soup + LoRA progresivo + mezcla de deltas) es un caso de estudio reproducible para experimentos de merging.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 12-16 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB de pesos; en 4 bits, alrededor de 2,3-3 GB, aunque no se distribuyen pesos cuantizados oficiales.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción con precisión completa; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para fp16 en contextos moderados.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) y potencialmente en GPUs de 12 GB con cuantización, siempre que se genere la cuantización localmente.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el tag `custom_code`); vLLM y TGI son compatibles con la arquitectura Qwen3.5, pero no hay confirmación oficial para este checkpoint; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| zils-mini-decision-v7 | 4,54 B | no disponible | Apache-2.0 | Feature extraction para decisión (subred Zils) |
| Qwen3.5-4B (base de la familia) | ~4 B | no disponible | Apache-2.0 (según familia) | LLM generativo de propósito general |
| vllm-sr/d3-mini (modelo base) | no disponible | no disponible | no disponible | Cuerpo de decisión para pool mini Zils |
| qhoenix/zils-mini-l13_avg678 | no disponible | no disponible | Apache-2.0 | Cuerpo mini promediado del mismo pool |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo con cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad ni de uso en producción.
- Sin benchmarks publicados: imposible estimar su calidad relativa frente a alternativas.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar código del autor; auditar antes de desplegar.
- No es un LLM generativo de propósito general: su pipeline es feature-extraction y su uso esperado es la puntuación de ítems de decisión, no el diálogo abierto.
- Idiomas no declarados: no hay garantía de comportamiento multilingüe.
- Riesgo de alucinación y sesgos: los datos de entrenamiento provienen de datasets públicos con sesgos conocidos (tweet_eval, iSarcasm, 20newsgroups) y de ítems generados por un LLM, lo que puede introducir errores sistemáticos.
- Los objetivos de entrenamiento son suaves (mezcla 0,5/0,5 con la etiqueta gold), lo que puede producir puntuaciones poco calibradas para decisiones binarias estrictas.
- Licencia Apache-2.0 permite uso comercial, pero deben conservarse los avisos de LICENSE y NOTICE del repositorio.
- Fecha de creación futura (2026-11-13) en los metadatos: verificar la integridad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Hugging Face: https://huggingface.co/malkolm777/zils-mini-decision-v7
- Modelo base: https://huggingface.co/vllm-sr/d3-mini
- Cuerpo mini promediado: https://huggingface.co/qhoenix/zils-mini-l13_avg678
- Cuerpo mini sx3: https://huggingface.co/joamCriff123/zils-mini-sx3
- Familia Qwen3.5 (referencia de arquitectura): https://huggingface.co/Qwen
