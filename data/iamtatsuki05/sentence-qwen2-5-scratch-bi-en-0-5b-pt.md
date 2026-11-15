# iamtatsuki05/Sentence-Qwen2.5-Scratch-Bi-EN-0.5B-PT

## Resumen

Sentence-Qwen2.5-Scratch-Bi-EN-0.5B-PT es un modelo de embeddings de frases en inglés desarrollado por iamtatsuki05 dentro de la colección MIREI. Se trata de un encoder bi-direccional derivado de una base Qwen2.5 de 0,5B de parámetros, envuelto con la librería sentence-transformers y entrenado con aprendizaje contrastivo débilmente supervisado sobre los subconjuntos débilmente supervisados del dataset sentence-transformers/embedding-training-data (aproximadamente 16,1 millones de pares de entrenamiento).

El modelo no genera texto: su función es producir representaciones vectoriales densas de 896 dimensiones (mediante mean pooling) para tareas de similitud semántica, recuperación de información (retrieval) y búsqueda semántica. Su relevancia radica en que ofrece una ventana de contexto muy amplia para un encoder de este tamaño (32.768 tokens), lo que permite embeber documentos largos sin truncamiento agresivo, algo poco habitual en modelos de embeddings de la franja de 0,5B.

Con 494 millones de parámetros totales (357 millones sin contar las embeddings), licencia MIT y pesos en safetensors, el modelo está pensado para despliegues de recuperación semántica en inglés donde el coste computacional y la longitud de contexto son factores críticos. Forma parte de una serie comparativa de encoders de 0,5B (ModernBERT, Llama, Mistral, Sarashina, Qwen2.5) entrenados bajo la misma receta, lo que facilita análisis controlados de arquitecturas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2.5 (transformer decoder adaptado a encoder bi-direccional) |
| Parámetros totales | 494.032.768 (494M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización vía herramientas estándar, pero no se documentan variantes oficiales) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimensión de embedding | 896 (mean pooling) |
| Tokenizador | Qwen2.5 (byte-level BPE), vocabulario de 151.936 |
| Codificación posicional | RoPE |
| Métrica de similitud | coseno |
| Parámetros sin embeddings | 357M |
| Tamaño del repositorio | 2,0 GB |

## Arquitectura y entrenamiento

El modelo se construye sobre una base Qwen2.5 "scratch" de 0,5B (identificador Qwen2.5-Scratch-Bi-EN-0.5B-PT-stage2), es decir, un modelo entrenado desde cero y adaptado a un esquema bi-direccional para su uso como encoder. Sobre esa base se aplica un entrenamiento contrastivo débilmente supervisado utilizando los subconjuntos débilmente supervisados de sentence-transformers/embedding-training-data, con un total aproximado de 16,1 millones de pares de entrenamiento. La salida se obtiene mediante mean pooling sobre las representaciones del modelo, generando vectores de 896 dimensiones normalizables para similitud coseno.

La innovación principal del modelo, y de la serie MIREI en su conjunto, es metodológica: se entrena una misma receta sobre arquitecturas distintas (ModernBERT, Llama, Mistral, Sarashina, Qwen2.5) para comparar el comportamiento de encoders derivados de distintos backbones bajo condiciones controladas. El trabajo asociado se publica en las actas de la 32ª conferencia anual de la Asociación de Procesamiento del Lenguaje de Japón (NLP2026). No se documentan en la información disponible detalles sobre uso de RLHF, DPO ni sobre la composición exacta del corpus más allá del dataset citado.

## Capacidades

- Generación de embeddings de frases en inglés de 896 dimensiones con normalización opcional para similitud coseno.
- Recuperación de información (retrieval) densa: codificación de consultas y documentos para búsqueda semántica.
- Similitud semántica entre pares de textos (sentence-similarity).
- Extracción de características (feature-extraction) para pipelines de NLP.
- Soporte de secuencias largas de hasta 32.768 tokens, adecuado para documentos extensos.
- Integración nativa con sentence-transformers (versión 4.1.0 o superior) y compatibilidad con text-embeddings-inference y endpoints compatibles.
- Soporte de atención con FlashAttention 2 (flash-attn >= 2.7.3) y precisión bfloat16.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un encoder puro.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar manuales o referencias de API en inglés y recuperar fragmentos relevantes ante consultas en lenguaje natural, aprovechando la ventana de 32.768 tokens para indexar secciones completas sin trocear en exceso.
- Motor de recuperación para RAG: generar embeddings de chunks de documentación y de las preguntas del usuario para alimentar un sistema de generación aumentada, con coste bajo gracias a los 494M de parámetros.
- Deduplicación y agrupamiento de contenidos: calcular similitud coseno entre artículos, tickets o entradas de catálogo para detectar duplicados o agrupar temáticamente.
- Clasificación semántica zero-shot mediante similitud: comparar textos con descripciones de categorías embebidas para etiquetar sin entrenamiento específico.
- Detección de similitud entre pares de frases: evaluación de paráfrasis, control de calidad de traducciones o verificación de respuestas frente a referencias.
- Indexación de bases de conocimiento para asistentes internos: embeber artículos largos de una wiki corporativa en inglés y servir búsquedas de baja latencia con un modelo pequeño desplegable en una sola GPU.
- Filtrado previo en pipelines de moderación o recomendación: calcular embeddings de candidatos y descartar los semánticamente alejados antes de etapas más costosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1 GB para los pesos (494M parámetros x 2 bytes), más overhead de activaciones que crece con la longitud de secuencia; con secuencias de 32.768 tokens el consumo de activaciones puede elevar el total a varios GB.
- VRAM estimada en float32: alrededor de 2 GB solo para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para secuencias cortas o medias; para aprovechar la ventana completa de 32.768 tokens se recomienda A100, H100 o RTX 4090 por memoria y soporte de FlashAttention 2.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 para secuencias moderadas; en GPUs de 8 GB conviene limitar la longitud de secuencia.
- Opciones de despliegue: sentence-transformers, transformers con trust_remote_code, text-embeddings-inference (endpoints compatibles), y exportación a ONNX u otros formatos mediante herramientas estándar (no documentado oficialmente).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Sentence-Qwen2.5-Scratch-Bi-EN-0.5B-PT (este) | Qwen2.5 | 494M | 32.768 | MIT | Base entrenada desde cero, encoder bi-direccional |
| Sentence-Qwen2.5-Bi-EN-0.5B-PT | Qwen2.5 | 494M | no disponible | MIT | Misma receta sobre Qwen2.5 preentrenado estándar |
| Sentence-ModernBERT-EN-0.5B-PT | ModernBERT | 677M | no disponible | MIT | Mayor número de parámetros, sin embeddings 546M |
| Sentence-Mistral-Bi-EN-0.5B-PT | Mistral | 518M | no disponible | MIT | Alternativa de tamaño similar, sin embeddings 469M |
| Sentence-Llama-Bi-EN-0.5B-PT | Llama | 661M | no disponible | MIT | Alternativa de tamaño similar, sin embeddings 530M |

Los datos de rendimiento comparativo entre estos modelos no están disponibles en la información proporcionada; la serie MIREI está diseñada precisamente para permitir esa comparación controlada, pero los resultados no se recogen aquí.

## Limitaciones y advertencias

- Solo soporta inglés; no está entrenado ni validado para otros idiomas.
- Es un encoder, no un modelo generativo: no puede responder preguntas ni producir texto, solo representaciones vectoriales.
- El entrenamiento es débilmente supervisado, lo que puede introducir ruido en la calidad de los embeddings frente a recetas con supervisión fuerte o destilación de modelos mayores.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su calidad frente a alternativas establecidas como los modelos de la familia E5, BGE o GTE.
- La ventana de 32.768 tokens implica un coste de atención cuadrático; secuencias largas encarecen la inferencia y pueden degradar la representación si el contenido relevante queda diluido en el mean pooling.
- Riesgo de alucinación no aplica directamente al no generar texto, pero los embeddings pueden producir similitudes engañosas en dominios muy especializados o con vocabulario fuera de distribución.
- Requiere trust_remote_code=True y versiones específicas de sentence-transformers (>=4.1.0), transformers (>=4.51.0) y flash-attn (>=2.7.3), lo que añade fricción al despliegue.
- Licencia MIT: permite uso comercial sin restricciones significativas, pero conviene verificar las licencias de los datos de entrenamiento subyacentes (embedding-training-data) para usos sensibles.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema de soporte y validación por la comunidad muy limitado.

## Enlaces

- [Hugging Face: iamtatsuki05/Sentence-Qwen2.5-Scratch-Bi-EN-0.5B-PT](https://huggingface.co/iamtatsuki05/Sentence-Qwen2.5-Scratch-Bi-EN-0.5B-PT)
- [Modelo base: iamtatsuki05/Qwen2.5-Scratch-Bi-EN-0.5B-PT-stage2](https://huggingface.co/iamtatsuki05/Qwen2.5-Scratch-Bi-EN-0.5B-PT-stage2)
- [Colección MIREI en Hugging Face](https://huggingface.co/collections/iamtatsuki05/mirei)
- [Repositorio GitHub: iamtatsuki05/MIREI](https://github.com/iamtatsuki05/MIREI)
- [Dataset: sentence-transformers/embedding-training-data](https://huggingface.co/datasets/sentence-transformers/embedding-training-data)
- [Licencia MIT](https://opensource.org/license/mit/)
- [Sentence-ModernBERT-EN-0.5B-PT](https://huggingface.co/iamtatsuki05/Sentence-ModernBERT-EN-0.5B-PT)
- [Sentence-Llama-Bi-EN-0.5B-PT](https://huggingface.co/iamtatsuki05/Sentence-Llama-Bi-EN-0.5B-PT)
- [Sentence-Mistral-Bi-EN-0.5B-PT](https://huggingface.co/iamtatsuki05/Sentence-Mistral-Bi-EN-0.5B-PT)
- [Sentence-Qwen2.5-Bi-EN-0.5B-PT](https://huggingface.co/iamtatsuki05/Sentence-Qwen2.5-Bi-EN-0.5B-PT)
- [Sentence-Sarashina-Bi-EN-0.5B-PT](https://huggingface.co/iamtatsuki05/Sentence-Sarashina-Bi-EN-0.5B-PT)
- [Sentence-InstructLM-Bi-EN-0.5B-PT](https://huggingface.co/iamtatsuki05/Sentence-InstructLM-Bi-EN-0.5B-PT)
