# PawanKrd/RastNus-Base-12B

## Resumen

RastNus-Base-12B es un modelo de lenguaje de 12 mil millones de parámetros desarrollado por PawanKrd, construido sobre `google/gemma-4-12b` mediante ajuste fino. Su propósito específico es la corrección gramatical, ortográfica y de puntuación en kurdo sorani (central kurdo, código ISO `ckb`), una tarea con escasa cobertura en los modelos generalistas actuales. El modelo se distribuye bajo licencia Apache 2.0, aunque su acceso está restringido en Hugging Face y requiere aceptar condiciones.

El modelo se presenta con la arquitectura `gemma4_unified` y pipeline `image-text-to-text`, lo que sugiere que hereda del modelo base de Google capacidades multimodales de entrada (imagen y texto), si bien su entrenamiento específico se centra en la corrección de texto en kurdo sorani. Con 11.959.757.104 parámetros reales (según los pesos en safetensors) y un repositorio de 24 GB, se posiciona en la gama de modelos de tamaño medio que pueden desplegarse en infraestructura de una sola GPU de alta gama con cuantización.

Su relevancia radica en cubrir una lengua de bajos recursos como el sorani con un modelo dedicado a una tarea concreta (corrección de texto), lo que lo hace útil para herramientas de edición, procesamiento de corpus y aplicaciones de escritura asistida en kurdo. La información pública disponible es limitada: no se detallan composición del dataset, número de tokens de entrenamiento ni resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4_unified (transformer, modelo base google/gemma-4-12b) |
| Parametros totales | 11.959.757.104 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no confirmadas) |
| Idiomas soportados | kurdo sorani (ckb) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-12b`, un transformer de la familia Gemma 4 de Google, y se ajusta mediante fine-tuning supervisado para la tarea de corrección de texto en kurdo sorani. La etiqueta `gemma4_unified` y el pipeline `image-text-to-text` indican que la arquitectura base admite entradas multimodales (imagen y texto), aunque la finalidad declarada del modelo ajustado es la corrección gramatical, ortográfica y de puntuación sobre texto.

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset de ajuste, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.) más allá de las que herede del modelo base Gemma 4. Los tags del repositorio confirman las tareas objetivo: `grammatical-error-correction`, `spelling-correction`, `punctuation-restoration` y `text-correction`.

## Capacidades

- Corrección gramatical en kurdo sorani: detección y enmienda de errores de gramática en texto `ckb`.
- Corrección ortográfica: normalización de grafías incorrectas en sorani.
- Restauración de puntuación: inserción y corrección de signos de puntuación en texto sin marcar o mal puntuado.
- Generación de texto y conversación: el pipeline declarado es `text-generation` y los tags incluyen `conversational`.
- Procesamiento image-text-to-text: capacidad heredada del modelo base Gemma 4 según el pipeline declarado, aunque no se documenta su uso específico en esta variante.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere despliegue mediante Inference Endpoints de Hugging Face.
- Capacidades multilingües: limitadas al kurdo sorani según el campo `language: ckb`; no se documenta soporte de otros idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking o razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso

- Edición y corrección de textos en kurdo sorani: el modelo recibe un párrafo con errores gramaticales, ortográficos o de puntuación y devuelve la versión corregida, adecuado por su ajuste específico sobre la tarea `text-correction` en `ckb`.
- Herramientas de escritura asistida para hablantes de sorani: integración en editores de texto o procesadores de documentos para sugerir correcciones en tiempo real, aprovechando su especialización en la norma escrita del sorani.
- Limpieza y normalización de corpus: procesamiento por lotes de textos digitalizados (prensa, literatura, transcripciones) para estandarizar ortografía y puntuación antes de su uso en investigación lingüística o entrenamiento de otros modelos.
- Preprocesamiento para pipelines de NLP en kurdo: corrección previa de entradas de texto antes de tareas posteriores como traducción automática, análisis morfológico o búsqueda, reduciendo el ruido ortográfico.
- Publicación editorial y periodismo en sorani: revisión automatizada de borradores en redacciones que publican en kurdo central, como primera pasada antes de la revisión humana.
- Enseñanza del kurdo sorani: generación de ejercicios corregidos o retroalimentación sobre redacciones de estudiantes, mostrando la forma normativa frente a la errónea.
- Investigación sobre lenguas de bajos recursos: modelo de referencia para experimentos de ajuste fino en `ckb`, comparando estrategias de corrección sobre una base Gemma 4 de 12B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 24 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 32-40 GB de VRAM.
- VRAM estimada con cuantización de 8 bits: en torno a 12-14 GB para pesos, viable en GPUs de 16-24 GB.
- VRAM estimada con cuantización de 4 bits: en torno a 7-9 GB para pesos, viable en GPUs consumer de 12 GB o más (sujeto a disponibilidad de cuantizaciones GGUF/AWQ, no confirmadas).
- GPU recomendadas: A100 40/80 GB, H100 para fp16 sin cuantizar; RTX 4090 (24 GB) para fp16 ajustado o 8 bits; RTX 3090/4080 (16-24 GB) con cuantización.
- GPU consumer: sí cabe en RTX 4090, RTX 3090 y, con cuantización agresiva, en GPUs de 12 GB; no se confirma disponibilidad de pesos GGUF en el repositorio.
- Opciones de despliegue: `transformers` (librería declarada), Inference Endpoints de Hugging Face (tag `endpoints_compatible`); vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| RastNus-Base-12B | 11,96B | no disponible | ckb (sorani) | apache-2.0 | Corrección de texto en sorani |
| google/gemma-4-12b (base) | ~12B | no disponible | multilingüe (no detallado) | términos de Gemma (no confirmado) | Modelo generalista multimodal |
| Alternativas específicas para kurdo sorani | no disponible | no disponible | ckb | no disponible | Corrección / NLP en kurdo |

No se dispone de información sobre otros modelos dedicados a la corrección de texto en kurdo sorani con los que establecer una comparación cuantitativa. La comparación principal es con su modelo base, `google/gemma-4-12b`, del que hereda arquitectura y tamaño pero del que se diferencia por el ajuste fino específico en `ckb`.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de descargar los pesos.
- Cobertura lingüística limitada: el modelo está orientado al kurdo sorani (`ckb`); su rendimiento en kurdo kurmanji, otros dialectos o idiomas distintos no está documentado y no debería asumirse.
- Riesgo de alucinación: como todo modelo generativo, puede introducir cambios no solicitados o correcciones incorrectas en el texto; se recomienda revisión humana en contextos editoriales.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de un modelo base generalista y ajustarse sobre un corpus no descrito, pueden persistir sesgos del modelo base y del dataset de ajuste.
- Falta de transparencia sobre el entrenamiento: no se publican datos sobre el corpus de ajuste, número de tokens, metodología de evaluación ni métricas, lo que dificulta estimar su fiabilidad en producción.
- Restricciones de licencia: la licencia declarada es Apache 2.0, pero al derivar de un modelo Gemma de Google conviene verificar que los términos del modelo base no impongan condiciones adicionales al uso comercial.
- Idiomas y contexto: no se especifica la longitud de contexto soportada, lo que limita la planificación de despliegues con documentos largos.
- Madurez: con 30 descargas y 3 likes en el momento de la consulta, es un modelo de reciente publicación y baja adopción; no hay evidencia comunitaria de robustez en producción.

## Enlaces

- Hugging Face: https://huggingface.co/PawanKrd/RastNus-Base-12B
- Modelo base: https://huggingface.co/google/gemma-4-12b
