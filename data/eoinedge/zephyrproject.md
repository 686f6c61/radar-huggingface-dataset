# eoinedge/zephyrproject

## Resumen

`eoinedge/zephyrproject` no es un modelo de lenguaje generativo, sino un proyecto de recuperación aumentada (RAG) que indexa la documentación oficial de Zephyr RTOS para ofrecer respuestas citables y actualizadas sobre este sistema operativo embebido. Desarrollado por Eoin Jordan, el repositorio contiene un índice FAISS construido a partir de 829 documentos RST (6.949 fragmentos) del código fuente de Zephyr, junto con scripts para reconstruirlo, consultarlo y adaptar el modelo de embeddings al vocabulario específico de Zephyr.

El componente central de recuperación utiliza el modelo `sentence-transformers/all-MiniLM-L6-v2` (384 dimensiones) y un índice FAISS de producto interno plano con vectores normalizados. Opcionalmente, se puede integrar `Qwen2.5-Coder-1.5B-Instruct` como generador para producir respuestas a partir de los pasajes recuperados, aunque la recuperación por sí sola ya es útil para localizar la página exacta que documenta un concepto.

La relevancia del proyecto radica en que Zephyr evoluciona rápido y los modelos de lenguaje generales pueden dar información obsoleta o inventada sobre símbolos Kconfig, bindings de devicetree o comandos `west`. Al reconstruir el índice desde el código fuente de la documentación, cada respuesta queda vinculada a un archivo concreto y es auditable. Todo se ejecuta localmente, sin conexión ni claves API, lo que lo hace adecuado para entornos de desarrollo embebido sin acceso a servicios externos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Índice FAISS + modelo de embeddings all-MiniLM-L6-v2 (transformador) + generador opcional Qwen2.5-Coder-1.5B-Instruct |
| Parametros totales | 33M (embeddings) + 1.5B (generador opcional) |
| Parametros activos | no disponible (el índice no es un modelo de parámetros activos) |
| Longitud de contexto | 512 tokens (modelo de embeddings); 32K tokens (Qwen Coder) |
| Tipos de cuantizacion | no disponible (el índice FAISS usa vectores float32 normalizados) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (modelo de embeddings) y GGUF (generador opcional) |

## Arquitectura y entrenamiento

El sistema se compone de dos partes diferenciadas. Por un lado, un pipeline de recuperación que toma los documentos RST de `doc/` de Zephyr, los divide en fragmentos basados en la estructura de secciones (máximo 1.600 caracteres), filtra contenido no prosa (páginas de error, listas de issues, archivos de requisitos) y los indexa con FAISS. El modelo de embeddings es `all-MiniLM-L6-v2`, un transformer de 6 capas preentrenado sobre texto web general, que produce vectores de 384 dimensiones. Se puede fine-tunear con `MultipleNegativesRankingLoss` usando pares extraídos de la propia documentación (el encabezado de sección como consulta, el cuerpo como pasaje), y el script de entrenamiento solo guarda el modelo si supera el recall@5 de la línea base.

Por otro lado, el generador opcional es `Qwen2.5-Coder-1.5B-Instruct`, un modelo de lenguaje de 1.5B parámetros optimizado para tareas de código y razonamiento, que recibe los pasajes recuperados como contexto para responder. No se ha realizado ningún ajuste fino sobre el generador; la mejora se concentra en la recuperación, que es la parte que garantiza actualidad y trazabilidad.

## Capacidades

- Recuperación de pasajes relevantes sobre la documentación de Zephyr RTOS con citas exactas a la página y sección de origen.
- Búsqueda semántica en inglés sobre temas como devicetree, Kconfig, `west`, drivers, subsistemas y API.
- Penalización dinámica de las notas de release en la consulta para priorizar documentación descriptiva, a menos que la pregunta sea sobre versiones o cambios.
- Generación de respuestas en lenguaje natural con Qwen Coder sobre los pasajes recuperados (opcional).
- Ejecución totalmente local y sin conexión: el índice ocupa ~17 MB, el modelo de embeddings ~90 MB y el generador ~3 GB.
- Scripts para reconstruir el índice desde el commit actual de Zephyr y para evaluar el recall@5 del retriever.
- Interfaz Gradio para consultas interactivas.

## Casos de uso

- **Asistente de desarrollo embebido offline**: un ingeniero puede preguntar "How do I define a devicetree binding?" y obtener la sección exacta de la documentación sin conexión a internet, en menos de un segundo con `--retrieve-only`.
- **Verificación de cambios en Zephyr**: al actualizar a una versión nueva, se reconstruye el índice y se consulta si un símbolo Kconfig o un binding ha cambiado, evitando usar información obsoleta.
- **Auditoría de respuestas generadas**: al usar Qwen Coder, cada respuesta incluye la ruta del archivo RST de origen, permitiendo revisar la fuente antes de aplicar cambios en hardware.
- **Integración en pipelines de CI/CD**: se puede añadir un paso que consulte el índice para comprobar que la documentación interna de un proyecto coincide con la API actual de Zephyr.
- **Entrenamiento de embeddings específicos de dominio**: el script `train_embeddings.py` permite adaptar el modelo de recuperación al vocabulario técnico de Zephyr, mejorando el recall en consultas sobre términos como "west" o "binding".
- **Educación y onboarding**: un desarrollador nuevo puede explorar la documentación de Zephyr mediante preguntas en lenguaje natural y obtener respuestas con referencias claras, en lugar de navegar manualmente por los RST.
- **Despliegue en entornos sin GPU**: el sistema funciona completamente en CPU, por lo que es viable en máquinas virtuales o contenedores sin aceleración de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona que el script de entrenamiento reporta recall@5 sobre pares de retención, pero no se incluyen valores concretos en la model card. Tampoco hay comparaciones con otros sistemas RAG.

## Requisitos de hardware

- **Recuperación sola (sin generador)**: funciona en cualquier CPU moderna con más de 1 GB de RAM. El índice y el modelo de embeddings caben en memoria (~110 MB en total).
- **Generador opcional**: requiere ~3 GB de VRAM o RAM para ejecutar `Qwen2.5-Coder-1.5B-Instruct` en FP16. Se puede ejecutar en GPU de consumo como RTX 3060 (12 GB) o en CPU con cuantización GGUF (por ejemplo, Q4_K_M).
- **GPU recomendadas**: ninguna en particular; el proyecto está diseñado para CPU.
- **Opciones de despliegue**: scripts de Python, Gradio app, o integración con frameworks de inferencia como llama.cpp o vLLM para el generador.
- **Latencia**: la recuperación pura responde en menos de un segundo; la generación de respuestas con Qwen Coder añade entre 2 y 10 segundos según la longitud de la consulta y el hardware.

## Comparativa con modelos similares

No hay una comparativa directa con otros modelos de la misma categoría, ya que se trata de un sistema RAG específico de Zephyr, no de un modelo de lenguaje general. Alternativas genéricas de RAG sobre documentación técnica podrían ser:

| Sistema | Enfoque | Ventajas | Limitaciones |
|---|---|---|---|
| `eoinedge/zephyrproject` | Índice FAISS + embeddings MiniLM + generador Qwen Coder | Actualidad, trazabilidad, offline | Solo inglés, solo documentación de Zephyr |
| RAG genérico con `text-embedding-3-small` + GPT-4 | Recuperación con embeddings de OpenAI y generación de alto nivel | Respuestas de mayor calidad, soporte multilingüe | Requiere conexión, coste por consulta, no auditable |
| `llama-index` + `Llama-3-8B` | Framework de RAG con modelo open source | Flexible, soporta múltiples fuentes | Requiere más configuración y recursos, sin citas garantizadas |

La principal diferencia es la especialización: este proyecto está optimizado para un corpus concreto y ofrece trazabilidad completa, mientras que las alternativas genéricas son más flexibles pero no garantizan la actualidad ni la trazabilidad.

## Limitaciones y advertencias

- **Idioma**: solo está disponible en inglés; no soporta consultas en otros idiomas.
- **Cobertura**: el índice solo cubre la documentación RST de Zephyr, no el código fuente ni otros recursos como foros o blogs.
- **Alucinación del generador**: aunque la recuperación proporciona contexto, el modelo generador puede introducir errores o inventar información si no se limita estrictamente a los pasajes recuperados.
- **Dependencia de la versión**: el índice se construye a partir de un commit concreto (`580547d`); si se usa con una versión posterior de Zephyr, es necesario reconstruirlo.
- **Licencia**: Apache-2.0, pero los documentos indexados son propiedad de sus contribuyentes bajo la misma licencia; se redistribuyen fragmentos con las rutas de origen para mantener la atribución.
- **Escalabilidad**: el índice FAISS plano es adecuado para ~7.000 fragmentos, pero si el corpus creciera significativamente, habría que pasar a índices HNSW o IVF para mantener la velocidad.
- **Sin evaluación externa**: no hay benchmarks publicados que demuestren la calidad de la recuperación o la generación frente a otros métodos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/eoinedge/zephyrproject
- Space Hugging Face (demo Gradio): https://huggingface.co/spaces/eoinedge/zephyrproject-rag
- Repositorio GitHub: https://github.com/eoinjordan/zephyrproject-rag
- Documentación de Zephyr RTOS: https://docs.zephyrproject.org/latest/
- Modelo de embeddings: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Generador opcional: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
