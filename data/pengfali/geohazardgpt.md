# pengfali/GeohazardGPT

## Resumen

GeohazardGPT es un modelo de lenguaje especializado en análisis de riesgos geológicos y práctica de ingeniería geotécnica, desarrollado por Qi Ge, Pengfa Li y colaboradores (publicado bajo el identificador `pengfali/GeohazardGPT`). Se construye sobre el backbone Qwen3-8B mediante ajuste fino con LoRA (rango 128, alfa 256), entrenado sobre un corpus de dominio de 883 millones de tokens que cubre 12 categorías principales de riesgos geológicos y 49 subcategorías.

El modelo aborda un problema concreto: los LLM de propósito general carecen de precisión terminológica y de fundamento normativo en dominios técnicos como la estabilidad de taludes, la caracterización de geomateriales o la selección de medidas de estabilización. GeohazardGPT se entrena con aproximadamente 100.000 pares instrucción-respuesta generados mediante el framework GeoInstruct (taxonomía guiada y anclada al corpus), combinando 49.776 pares de dominio con 51.699 muestras generales de Alpaca-GPT4 para preservar la capacidad de seguimiento de instrucciones.

Su relevancia actual reside en el diseño para uso conjunto con un pipeline RAG de recuperación y reordenación sobre normativa técnica (embeddings con Qwen3-Embedding-4B, reordenación con Qwen3-Reranker-4B y almacenamiento en ChromaDB), lo que permite respuestas ancladas a estándares de investigación geotécnica, cimentaciones, diseño sísmico e infraestructura de transporte. El contexto nativo es de 32K tokens, extensible a 128K mediante YaRN, y la licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con adaptadores LoRA |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Parametros entrenables (LoRA) | 349M (rango 128, alfa 256) |
| Longitud de contexto | 32K tokens (extensible a 128K via YaRN) |
| Tipos de cuantizacion | 4-bit documentado en despliegue; safetensors en FP/BF16 en el repo |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 16,4 GB |
| Pipeline | text-generation |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder-only denso de aproximadamente 8.190 millones de parametros. El ajuste se realiza mediante LoRA con rango 128 y alfa 256, lo que entrena 349 millones de parametros adicionales sin modificar los pesos base. El corpus de dominio comprende 883,1 millones de tokens distribuidos en 1.822.417 documentos: 1.613.089 articulos de acceso abierto en texto completo (788,9M tokens), 118.217 libros cientificos con licencia (54,5M), 87.668 resumenes de acceso cerrado (28,9M) y 3.443 documentos filtrados del corpus C4 (10,8M).

La generacion de datos de instruccion emplea GeoInstruct, un framework guiado por taxonomia y anclado al corpus, que produce 49.776 pares de dominio y se complementa con 51.699 muestras de Alpaca-GPT4. La model card no documenta explicitamente el uso de RLHF o DPO; el proceso descrito es ajuste supervisado sobre pares instruccion-respuesta. La innovacion principal no es arquitectonica sino de integracion: el modelo se disena para operar junto a un pipeline RAG de recuperacion densa (top-30 candidatos), reordenacion con cross-encoder (top-15 clausulas) y generacion anclada a evidencia normativa.

## Capacidades

- Generacion de texto tecnico en ingles con terminologia geotecnica y geologica especializada.
- Preguntas y respuestas factuales sobre definiciones de riesgos geologicos, propiedades de geomateriales y requisitos normativos.
- Explicacion abierta de mecanismos de riesgo, procesos de fallo y analisis de impacto.
- Recomendacion de ingenieria: seleccion de medidas de estabilizacion, estrategias de mitigacion y planes de monitorizacion para condiciones especificas de emplazamiento.
- Resumen de informes: extraccion estructurada de hallazgos clave de informes de investigacion, estudios de caso y especificaciones tecnicas.
- Integracion con RAG para respuestas ancladas a normativa mediante recuperacion y reordenacion de clausulas.
- Conversacion multi-turno mediante plantilla de chat de Qwen3 (system/user/assistant).
- Capacidad general de seguimiento de instrucciones preservada por el entrenamiento mixto con Alpaca-GPT4.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de vision o audio: no disponibles.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Evaluacion preliminar de estabilidad de taludes: el modelo interpreta descripciones de campo (grietas de traccion en la corona, filtraciones locales) y propone medidas de estabilizacion, apoyandose en el contexto de 32K tokens para incorporar el informe completo del emplazamiento.
- Consulta normativa asistida por RAG: un ingeniero formula una pregunta sobre requisitos de diseno sismico y el pipeline recupera y reordena clausulas de estandares nacionales y sectoriales, generando una respuesta con evidencia citada.
- Redaccion y resumen de informes geotecnicos: extraccion estructurada de hallazgos, conclusiones y recomendaciones a partir de informes de investigacion y estudios de caso de decenas de paginas.
- Formacion y soporte a tecnicos: respuestas explicativas sobre mecanismos de fallo, propiedades de geomateriales y criterios de clasificacion de riesgos, con terminologia consistente.
- Triaje de documentacion en proyectos de infraestructura: clasificacion y sintesis de especificaciones tecnicas de transporte, hidraulica y cimentaciones para equipos multidisciplinares.
- Asistencia en planes de monitorizacion: generacion de borradores de planes de instrumentacion y umbrales de alerta para emplazamientos con riesgo identificado, sujetos a revision experta.
- Preparacion de examenes profesionales de ingenieria geotecnica: la model card reporta rendimiento comparable a modelos mayores en tareas de examen profesional, lo que permite usarlo como herramienta de estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card afirma de forma cualitativa que, combinado con RAG, el modelo alcanza rendimiento comparable a modelos mucho mayores tanto en conocimiento general de riesgos geologicos como en tareas de examen profesional de ingenieria, pero no proporciona cifras.

Datos de latencia documentados por el autor (NVIDIA A100 80GB, despliegue en 4-bit):

| Configuracion | Memoria GPU | Latencia |
|---|---|---|
| GeohazardGPT (standalone) | ~10 GB | ~3,9 s/consulta |
| GeohazardGPT + RAG | ~26 GB | ~5,8 s/consulta |

## Requisitos de hardware

- VRAM estimada en 4-bit: aproximadamente 10 GB para el modelo standalone, segun la model card (probado en A100 80GB).
- VRAM estimada en 4-bit con pipeline RAG completo: aproximadamente 26 GB, incluyendo Qwen3-Embedding-4B y Qwen3-Reranker-4B.
- En BF16/FP16 el modelo de 8.190 millones de parametros requiere del orden de 16 GB solo para pesos, mas overhead de KV cache; el repositorio ocupa 16,4 GB en safetensors.
- GPU recomendadas: NVIDIA A100 80GB (configuracion validada por el autor); H100 para mayor throughput; RTX 4090 (24 GB) viable en 4-bit para el modelo standalone y ajustada para el pipeline RAG completo.
- Cabe en GPU de consumo de 24 GB en cuantizacion 4-bit; en 16 GB el modelo standalone en 4-bit es borderline y el pipeline RAG no cabe.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM, llama.cpp y Ollama no estan documentados explicitamente en la informacion disponible.
- Latencia documentada: ~3,9 s/consulta standalone y ~5,8 s/consulta con RAG en A100 80GB a 4-bit. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GeohazardGPT | 8,19B (349M entrenables LoRA) | 32K (128K via YaRN) | Riesgos geologicos y geotecnia | Apache 2.0 | Hugging Face, 19 descargas |
| Qwen3-8B (base) | 8,19B | 32K (128K via YaRN) | Proposito general | Apache 2.0 | Hugging Face, ampliamente adoptado |
| Modelos de dominio geocientifico comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion relevante es frente a su propio backbone: GeohazardGPT anade especializacion de dominio y diseno para RAG sobre Qwen3-8B, a costa de un repositorio de 16,4 GB y de un rendimiento en tareas generales no cuantificado publicamente. No se dispone de datos de benchmarks que permitan comparar su rendimiento numerico con alternativas de dominio.

## Limitaciones y advertencias

- Solo soporta ingles; no se documenta capacitacion multilingue.
- Entrenado sobre un corpus de dominio especifico: el riesgo de alucinacion en terminologia normativa es relevante, especialmente sin el pipeline RAG, por lo que las respuestas deben verificarse contra la norma original.
- La model card advierte explicitamente que las salidas deben complementar, no sustituir, la investigacion de campo y el juicio experto.
- No se documentan evaluaciones de sesgo; el corpus incluye literatura cientifica y normativa con posible sesgo geografico y editorial.
- El ajuste LoRA con 349M parametros entrenables puede degradar capacidades generales no cubiertas por las 51.699 muestras de Alpaca-GPT4; no hay benchmarks publicos que lo cuantifiquen.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-8B y los componentes RAG (Qwen3-Embedding-4B, Qwen3-Reranker-4B) tienen sus propias condiciones que deben verificarse.
- El pipeline RAG requiere infraestructura adicional (~26 GB de VRAM) y un corpus normativo indexado propio; la calidad de las respuestas depende de la cobertura y actualizacion de ese corpus.
- La fecha de creacion del repositorio (2026-05-17) y la publicacion citada como "under review" indican que la validacion por pares esta pendiente.
- No se documentan capacidades de tool calling ni de agentes multi-paso, lo que limita su uso en flujos automatizados complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pengfali/GeohazardGPT
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Dataset de instrucciones generales: https://huggingface.co/datasets/vicgalle/alpaca-gpt4
- Componente de embeddings (referenciado): Qwen3-Embedding-4B
- Componente de reordenacion (referenciado): Qwen3-Reranker-4B
- Paper citado: Ge, Q., Li, P., Dai, Y., Li, J., An, N., Yu, Y., Lv, Q. "GeohazardGPT: A Domain-Adapted Large Language Model for Knowledge-Intensive Tasks in Geohazards", Under review, 2026 (sin enlace disponible)
