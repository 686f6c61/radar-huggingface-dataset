# NeuML/atto-90k-32d

## Resumen

Atto es una familia de modelos contextuales compactos desarrollada por NeuML, orientada al aprendizaje de representaciones lingüísticas con un número muy reducido de parámetros. La variante `atto-90k-32d` se distribuye a través de Hugging Face con la etiqueta `atto`, arquitectura personalizada (`custom_code`) y pesos en formato `safetensors`. El modelo está pensado como un componente de representación (encoder/embedding) más que como un modelo generativo conversacional, y su nombre sugiere un vocabulario de 90 000 tokens y una dimensión de representación de 32.

El modelo se carga mediante `transformers` con `trust_remote_code=True`, lo que implica que el código de la arquitectura viaja dentro del repositorio y debe auditarse antes de su uso en producción. La model card es muy escueta: no documenta número de parámetros, longitud de contexto, composición del dataset ni resultados de benchmarks, y remite al artículo "Introducing Atto" del blog de Hugging Face para obtener detalles de arquitectura y metodología.

Su relevancia actual radica en la tendencia hacia modelos de representación ultraligeros que puedan ejecutarse en CPU, dispositivos embebidos o como primera etapa de pipelines de recuperación (RAG) con coste computacional mínimo. No obstante, la información pública disponible es insuficiente para evaluar su calidad frente a alternativas establecidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer contextual personalizada (`custom_code`), familia Atto |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin GGUF publicado) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card describe Atto como una familia de "modelos contextuales compactos" para aprendizaje de representaciones con eficiencia de parámetros. La arquitectura es personalizada y requiere `trust_remote_code=True`; no se especifica si se trata de un transformer estándar modificado, un encoder ligero o una variante con embeddings de baja dimensión. El identificador `90k-32d` apunta a un vocabulario de 90 000 entradas y una dimensión de embedding de 32, lo que situaría el modelo en el rango de los modelos de embedding ultraligeros.

En cuanto al entrenamiento, la única información publicada son tres hiperparámetros: `learning_rate = 0.001`, `gradient_accumulation_steps = 1` y `fp16 = True`. No se documenta el número de tokens de entrenamiento, la composición del corpus, si hubo fases de ajuste fino supervisado, RLHF o DPO, ni innovaciones técnicas como atención lineal o decodificación especulativa. Cualquier afirmación adicional sobre el proceso de entrenamiento sería especulativa.

## Capacidades

- Generación de representaciones contextuales de texto en inglés (uso previsto como encoder/embedding).
- Codificación de frases y documentos para tareas de similitud semántica y recuperación de información.
- Integración con el ecosistema Hugging Face `transformers` mediante `AutoModel`.
- Ejecución ligera en CPU y entornos con recursos limitados, dado el reducido tamaño implícito en el nombre del modelo.
- Capacidad multilingüe: no disponible; la model card solo declara inglés.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Recuperación semántica en pipelines RAG: el modelo puede generar embeddings de documentos y consultas para búsqueda por similitud, con un coste de inferencia muy bajo gracias a su tamaño compacto y su dimensión de representación reducida.
- Clasificación de texto ligera: usar las representaciones contextuales como entrada a un clasificador lineal para moderación de contenido o etiquetado de tickets, ejecutable en CPU.
- Deduplicación y clustering de documentos: calcular similitudes entre embeddings de 32 dimensiones para agrupar documentos casi idénticos en corpus grandes con memoria acotada.
- Búsqueda en dispositivos embebidos o edge: al requerir pocos recursos, puede desplegarse en entornos sin GPU para búsqueda local en aplicaciones de escritorio o móviles.
- Pre-filtrado en sistemas de recomendación: generar representaciones de ítems textuales (títulos, descripciones) para recuperación aproximada antes de un reranker más pesado.
- Componente de bajo coste en pipelines de evaluación: servir como baseline de embeddings en experimentos de investigación donde el presupuesto computacional es limitado.
- Indexación de grandes volúmenes de texto en inglés: la dimensión de 32 reduce el almacenamiento del índice vectorial en órdenes de magnitud frente a embeddings de 768 o 1024 dimensiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al artículo "Introducing Atto" del blog de Hugging Face para consultar resultados, pero dichos datos no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el identificador (vocabulario de 90 000 y dimensión 32), el modelo debería ocupar del orden de decenas de MB en fp32, aunque el número exacto de capas y parámetros no se documenta.
- GPU recomendadas: no disponible; por su tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) sería sobredimensionada y probablemente innecesaria.
- Compatibilidad con GPU consumer: muy probablemente sí, incluidas GPUs de gama baja, aunque no hay confirmación oficial.
- Despliegue: `transformers` con `trust_remote_code=True`. No hay evidencia de soporte en vLLM, llama.cpp, Ollama ni TGI; al no ser un modelo generativo, los servidores de inferencia LLM no son el vehículo adecuado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de embedding | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NeuML/atto-90k-32d | no disponible | no disponible | 32 (según identificador) | apache-2.0 | Hugging Face |
| all-MiniLM-L6-v2 (Sentence Transformers) | ~22 M | 256 tokens | 384 | apache-2.0 | Hugging Face |
| bge-small-en-v1.5 (BAAI) | ~33 M | 512 tokens | 384 | mit | Hugging Face |
| e5-small-v2 (Microsoft) | ~33 M | 512 tokens | 384 | mit | Hugging Face |

La comparación con alternativas establecidas se ve limitada por la ausencia de datos publicados sobre parámetros, contexto y rendimiento de Atto. Los modelos citados son referencias habituales en la categoría de embeddings ligeros en inglés, pero no se dispone de benchmarks que permitan situar a `atto-90k-32d` frente a ellos.

## Limitaciones y advertencias

- Información pública muy escasa: no se documentan parámetros, contexto, dataset ni evaluación, lo que impide validar su calidad frente a alternativas.
- Requiere `trust_remote_code=True`, es decir, ejecutar código arbitrario incluido en el repositorio; es imprescindible auditar dicho código antes de usarlo en producción.
- Solo declara soporte de inglés; el rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- No es un modelo generativo: no debe emplearse para chat, generación de texto, código ni razonamiento; su uso previsto es la representación de texto.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de representaciones de baja calidad si el modelo no fue entrenado con datos suficientes.
- Sesgos: no documentados; al no publicarse la composición del corpus, no es posible evaluar sesgos de género, raza o dominio.
- Licencia Apache 2.0: permite uso comercial y modificación, pero al ser un modelo con código personalizado conviene revisar las condiciones del código embebido en el repositorio.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema de usuarios prácticamente inexistente, sin evidencia de uso en producción ni de mantenimiento continuado.
- Fecha de creación indicada como 2026-11-19, posterior a la fecha habitual de consulta; conviene verificar la vigencia del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeuML/atto-90k-32d
- Artículo "Introducing Atto" (blog de Hugging Face): https://hf.co/blog/neuml/introducing-atto
- Perfil del autor en Hugging Face: https://huggingface.co/NeuML
