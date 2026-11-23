# minhnvm/bge-m3-relation-lora

## Resumen

`minhnvm/bge-m3-relation-lora` es un adaptador LoRA sobre el modelo de embeddings multilingüe `BAAI/bge-m3`, desarrollado por el usuario `minhnvm`. Su función no es generar texto, sino puntuar la relevancia entre una pregunta en lenguaje natural y el nombre de una relación de un grafo de conocimiento (por ejemplo, `people.person.nationality`), lo que lo convierte en un componente especializado para tareas de *question answering* sobre grafos de conocimiento (KGQA).

El adaptador se ha entrenado de forma contrastiva sobre las preguntas de entrenamiento de WebQSP emparejadas con nombres de relaciones, durante 3 épocas con una tasa de aprendizaje de 1e-4 y temperatura 0.1. La partición de datos garantiza que entrenamiento y validación no comparten entidades, lo que reduce el riesgo de sobreajuste a entidades vistas.

Su relevancia radica en que reutiliza las capacidades multilingües y de contexto largo del modelo base BGE-M3 (hasta 8192 tokens) para una tarea muy concreta de recuperación de relaciones, con un coste de almacenamiento mínimo (adaptador LoRA de rango 8) y licencia MIT, lo que facilita su integración en pipelines de KGQA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=8, alpha=16) sobre transformer encoder BGE-M3 (XLM-RoBERTa-like) |
| Parametros totales | No disponible (el adaptador LoRA es de rango 8; el modelo base BGE-M3 tiene ~568M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Heredada del modelo base (BGE-M3 soporta hasta 8192 tokens; en los ejemplos de uso se trunca a 96 y 48 tokens) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantización estándar de transformers) |
| Idiomas soportados | No disponible en la model card (el modelo base BGE-M3 es multilingüe, con cobertura de más de 100 idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre las proyecciones de *query*, *key* y *value* del modelo base BGE-M3, con rango 8 y alpha 16. La arquitectura subyacente es un transformer encoder bidireccional (familia XLM-RoBERTa) que produce embeddings de frase mediante *CLS pooling* y normalización L2. El adaptador no modifica la arquitectura del encoder; solo ajusta las matrices de atención para especializarlas en la tarea de emparejamiento pregunta-relación.

El entrenamiento es contrastivo: cada pregunta de entrenamiento de WebQSP se empareja con nombres de relaciones, y el objetivo es maximizar la similitud coseno entre la pregunta y su relación correcta frente a las negativas. Se usaron 3 épocas, learning rate 1e-4 y temperatura 0.1. La separación de entidades entre train y dev es una decisión de diseño destacable para evaluar la generalización a entidades no vistas. No se especifica el número total de tokens de entrenamiento ni la composición completa del dataset más allá de WebQSP.

## Capacidades

- Puntuación de relevancia pregunta-relación mediante similitud coseno entre embeddings.
- Recuperación de relaciones de grafos de conocimiento para KGQA (por ejemplo, Freebase/WebQSP).
- Reutilización de las capacidades multilingües del modelo base BGE-M3 (aunque el adaptador se ha entrenado específicamente sobre WebQSP, en inglés).
- Codificación de textos cortos (preguntas y nombres de relaciones) con truncamiento configurable.
- No genera texto, no soporta tool calling ni razonamiento multi-paso por sí mismo; es un componente de recuperación dentro de un pipeline mayor.
- No dispone de modo *thinking*, visión ni audio.

## Casos de uso

- KGQA sobre Freebase/WebQSP: dado un grafo de conocimiento, el adaptador puntúa qué relación (p. ej. `people.person.nationality`) es más probable para una pregunta, y el sistema ejecuta después la consulta sobre el grafo. Es adecuado porque se entrenó exactamente en ese dominio y con separación de entidades.
- Enrutamiento de preguntas a *endpoints* de datos: en un asistente empresarial con varias fuentes estructuradas, el adaptador puede seleccionar la relación o tabla relevante antes de lanzar la consulta SQL/SPARQL.
- Desambiguación de relaciones en pipelines de extracción: al mapear menciones de texto libre a relaciones canónicas de una ontología, el score de similitud sirve como filtro previo.
- Búsqueda semántica sobre catálogos de metadatos: indexar nombres de relaciones o campos de un esquema y recuperar los más afines a una consulta en lenguaje natural.
- Evaluación de cobertura de ontologías: detectar relaciones de un grafo que no se recuperan bien para un conjunto de preguntas, guiando la ampliación del esquema.
- Componente de *retrieval* en sistemas RAG estructurados: combinar el adaptador con un recuperador de entidades para construir consultas multi-salto sobre grafos de conocimiento.
- Filtrado de candidatos en anotación de datos: priorizar relaciones plausibles para revisión humana en tareas de etiquetado de KGQA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación (Hits@1, MRR, etc.) sobre el conjunto de validación de WebQSP ni comparaciones con otros recuperadores.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA es de tamaño despreciable; el coste real proviene del modelo base BGE-M3 (~568M parámetros). En fp16, aproximadamente 1,1-1,5 GB de VRAM para el modelo base; en fp32, en torno a 2,3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en fp16 (RTX 3060, RTX 4060, T4). Para lotes grandes o contexto largo, se recomienda A10, L4 o superiores.
- Cabe en GPU de consumo: sí, en RTX 3060/4060/4090 y similares, incluso en fp32 con margen.
- Opciones de despliegue: `transformers` + `peft` (como en el ejemplo de la model card); el modelo base puede servirse con `sentence-transformers`, `vLLM` (soporte de embeddings) o `TEI` (Text Embeddings Inference), aunque la carga del adaptador PEFT requiere integración específica.
- Latencia y throughput: no disponibles en la información proporcionada. Al tratarse de un encoder de ~568M parámetros con textos cortos (48-96 tokens), la latencia por lote pequeño es del orden de milisegundos en GPU moderna, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| minhnvm/bge-m3-relation-lora | Adaptador LoRA sobre BGE-M3 para relaciones KG | Adaptador r=8 sobre ~568M | Heredado de BGE-M3 (hasta 8192) | MIT | Hugging Face |
| BAAI/bge-m3 | Embedding generalista multilingüe | ~568M | Hasta 8192 | MIT | Hugging Face |
| BAAI/bge-large-en-v1.5 | Embedding generalista en inglés | ~335M | 512 | MIT | Hugging Face |
| sentence-transformers/all-MiniLM-L6-v2 | Embedding ligero generalista | ~22M | 256 | Apache 2.0 | Hugging Face |

La comparación directa con recuperadores específicos de relaciones de grafos de conocimiento no está disponible en la información proporcionada. Frente a BGE-M3 sin adaptador, este modelo está especializado en el dominio WebQSP, pero pierde generalidad como encoder de propósito general.

## Limitaciones y advertencias

- El adaptador se ha entrenado únicamente sobre WebQSP (preguntas en inglés sobre Freebase), por lo que su generalización a otras ontologías o idiomas no está validada.
- No se han publicado métricas de evaluación; el rendimiento real en producción es desconocido.
- El uso requiere preprocesar los nombres de relaciones (sustituir `.` y `_` por espacios) y aplicar *CLS pooling* con normalización L2; un uso incorrecto degrada los scores.
- Riesgo de alucinación no aplica directamente (no genera texto), pero sí de falsos positivos en la puntuación de relaciones.
- El modelo base BGE-M3 puede presentar sesgos heredados de sus datos de entrenamiento; el adaptador no los corrige.
- Aunque la licencia del adaptador es MIT, conviene verificar la licencia y condiciones del modelo base BAAI/bge-m3 para uso comercial.
- El repositorio tiene 0 descargas y 0 *likes*, y fue creado en 2026; no hay evidencia de uso en producción ni mantenimiento activo.
- El tamaño del repo es de 0.0 GB según los metadatos, lo que puede indicar que los pesos no están completamente subidos o que el adaptador es extremadamente pequeño; conviene verificar la integridad de los ficheros antes de desplegarlo.

## Enlaces

- [Hugging Face: minhnvm/bge-m3-relation-lora](https://huggingface.co/minhnvm/bge-m3-relation-lora)
- [Modelo base: BAAI/bge-m3](https://huggingface.co/BAAI/bge-m3)
- [WebQSP (dataset de referencia para KGQA)](https://github.com/microsoft/ContextualSP)
