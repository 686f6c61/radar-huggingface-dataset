# richardyoung/CardioEmbed-BGE-small-v1.5

## Resumen

CardioEmbed-BGE-small-v1.5 es un adaptador LoRA sobre el modelo de embeddings BAAI/bge-small-en-v1.5, especializado en texto de cardiología clínica. Lo desarrolla Richard Young (DeepNeuro) como parte de un estudio comparativo de 10 arquitecturas de embeddings para representación de texto cardiológico, publicado en arXiv:2511.19739. El modelo no es un generador de texto: produce vectores densos de frase que se usan para similitud semántica, búsqueda y agrupamiento.

El problema que aborda es la pérdida de rendimiento que sufren los embeddings de propósito general cuando se aplican a terminología médica especializada (fármacos, procedimientos, escalas clínicas, hallazgos ecocardiográficos). La adaptación de dominio mediante LoRA sobre una base compacta de 33 millones de parámetros permite obtener representaciones más separables en el espacio vectorial sin necesidad de reentrenar un modelo grande.

Es relevante porque demuestra que un ajuste LoRA ligero (r=16, alpha=32) sobre una base pequeña y de licencia Apache 2.0 puede especializarse con solo 106.535 pares de texto cardiológico, lo que abarata el despliegue en entornos clínicos con recursos limitados. El contexto efectivo está limitado por la base BGE-small, de 512 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-small) con adaptador LoRA; base BAAI/bge-small-en-v1.5 |
| Parametros totales | No disponible en la informacion proporcionada (base BGE-small: ~33 M; adaptador LoRA r=16 adicional) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (base BGE-small: 512 tokens) |
| Tipos de cuantizacion | No disponible (pesos safetensors en precision de entrenamiento; el adaptador LoRA puede combinarse con la base cuantizada) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer encoder tipo BERT-small (BGE-small-en-v1.5), sobre el que se aplica un adaptador LoRA con rango r=16 y alpha=32. El adaptador modifica las proyecciones de atención y feed-forward de la base sin alterar sus pesos originales, de modo que en inferencia se combinan ambos (o se cargan mediante `PeftModel`). El modelo produce embeddings de frase normalizados para tareas de similitud semántica.

El entrenamiento se realizó sobre 106.535 pares de texto cardiológico extraídos de libros de texto médicos, con pérdida Multiple Negatives Ranking Loss (InfoNCE), típica en el ajuste de modelos de oraciones con pares positivos. No se documentan en la información disponible fases de RLHF, DPO ni datos de instrucciones; es un ajuste puramente contrastivo de dominio. La innovación principal es el propio enfoque comparativo: evaluar sistemáticamente diez arquitecturas de embeddings bajo el mismo protocolo de adaptación LoRA para cardiología clínica.

## Capacidades

- Generación de embeddings de frase para similitud semántica (`sentence-similarity`).
- Búsqueda semántica y recuperación densa sobre corpus cardiológicos en inglés.
- Agrupamiento (clustering) y deduplicación de documentos clínicos.
- Clasificación de texto por similitud a prototipos (zero-shot con embeddings).
- Representación especializada de terminología cardiológica: procedimientos, fármacos, hallazgos, escalas.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es exclusivamente un encoder de embeddings.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Búsqueda semántica en bases de conocimiento cardiológico: indexar guías clínicas y artículos en inglés y recuperar fragmentos por similitud vectorial, aprovechando la adaptación al vocabulario cardiológico.
- Sistemas de preguntas y respuestas sobre documentación médica (RAG): usar el modelo como retriever denso en pipelines que alimentan a un LLM generador, con la ventaja de que el encoder es muy ligero.
- Deduplicación y agrupamiento de registros clínicos: agrupar notas o resúmenes de pacientes por similitud de embeddings para detectar duplicados o construir cohortes.
- Clasificación de informes de ecocardiografía o cateterismo: comparar el embedding de un informe contra prototipos de categorías diagnósticas para asignar etiquetas sin entrenar un clasificador supervisado completo.
- Enrutamiento de consultas en atención al cliente sanitaria: dirigir consultas entrantes al departamento de cardiología frente a otras especialidades mediante similitud con centroides por especialidad.
- Filtrado y priorización de literatura científica: ordenar resultados de búsqueda bibliográfica por relevancia semántica respecto a una consulta cardiológica concreta.
- Detección de similitud entre casos clínicos: recuperar casos históricos parecidos a uno nuevo para apoyo a la decisión, usando la separabilidad mejorada que reporta el modelo.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Separation Score | 0.250 |

El autor solo publica la métrica "Separation Score" con valor 0.250 en la model card. No se han publicado en la información disponible resultados de MMLU, MTEB, HumanEval, GSM8K ni comparativas numéricas frente a los otros nueve modelos del estudio. No se inventan cifras adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el adaptador LoRA es de pocos megabytes y la base BGE-small (~33 M de parámetros) ocupa del orden de 130 MB en fp32 y ~65 MB en fp16. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo. También funciona en CPU.
- Cabe en GPU consumer: sí, en todas las gamas actuales e incluso en iGPU y CPU.
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador sobre la base), `sentence-transformers` una vez fusionado el adaptador, y exportación a ONNX para servir en CPU. Para indexación a gran escala, FAISS o Qdrant como almacén vectorial.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño de la base, se espera un throughput alto en GPU y aceptable en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CardioEmbed-BGE-small-v1.5 | ~33 M (base) + LoRA | No disponible (base 512) | Cardiologia clinica (ingles) | Apache 2.0 | Hugging Face |
| BAAI/bge-small-en-v1.5 | ~33 M | 512 | Proposito general (ingles) | MIT | Hugging Face |
| BAAI/bge-base-en-v1.5 | ~109 M | 512 | Proposito general (ingles) | MIT | Hugging Face |
| Modelos del estudio arXiv:2511.19739 | No disponible | No disponible | Cardiologia (comparativa de 10 arquitecturas) | No disponible | No disponible |

La comparativa numérica frente a las otras nueve arquitecturas del estudio no se detalla en la información disponible; solo se conoce el Separation Score de este modelo (0.250).

## Limitaciones y advertencias

- Solo inglés: no cubre castellano ni otros idiomas, lo que limita su uso en entornos clínicos hispanohablantes.
- Contexto limitado por la base BGE-small (512 tokens); documentos largos deben trocearse.
- Es un encoder de embeddings, no un generador: no responde preguntas ni produce texto.
- Riesgo de sesgo heredado de los libros de texto médicos usados para entrenar; la cobertura puede estar sesgada hacia la cardiología representada en esas fuentes.
- No es un dispositivo médico ni sustituye el juicio clínico; cualquier uso en producción sanitaria requiere validación externa.
- El Separation Score de 0.250 es una métrica propia del autor sin definición pública detallada en la model card; su interpretación absoluta es limitada.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia de la base BGE-small (MIT) al redistribuir pesos fusionados.
- Repositorio con muy pocas descargas (11) y sin likes en el momento de la consulta: ecosistema de validación reducido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/CardioEmbed-BGE-small-v1.5
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Paper: https://arxiv.org/abs/2511.19739
- Autor: https://deepneuro.ai/richard
