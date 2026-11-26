# huggingface12341/zsl-h21

## Resumen

zsl-h21 es un modelo de extracción de características (feature-extraction) publicado por el usuario huggingface12341 en Hugging Face. Se trata de un merge de tres modelos base: cribl-ai/cribl-decision-2-0.8B, joamCriff123/zils-lite-l1123q y joamCriff123/zils-lite-l1125a. El resultado es un checkpoint de aproximadamente 853 millones de parámetros (852.985.920 según el recuento real de safetensors) con un tamaño de repositorio de 1,7 GB, empaquetado en formato safetensors y pensado para su uso con la librería transformers mediante código personalizado (custom_code).

El modelo se etiqueta con la arquitectura qwen3_5 y con la familia "zils" / "d3-lite", lo que sugiere una variante derivada de la línea Qwen 3.5 adaptada a tareas de decisión y extracción de representaciones. La pipeline declarada es feature-extraction, no generación de texto, por lo que su uso previsto apunta a producir embeddings o representaciones latentes para sistemas posteriores (clasificación, recuperación, enrutamiento o agentes de decisión) más que a la conversación directa.

Es relevante ahora por dos motivos: primero, porque los merges de modelos pequeños (sub-1B) están ganando tracción como componentes eficientes para pipelines de decisión y RAG de bajo coste; segundo, porque el acceso está restringido (gated), lo que obliga a aceptar condiciones en Hugging Face antes de descargarlo. La información pública disponible es muy limitada: no hay datos de benchmarks, idiomas ni detalles de entrenamiento en la ficha del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según tag del repositorio); transformer con código personalizado |
| Parametros totales | 852.985.920 (~853 M) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el repo no publica variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 1,7 GB) |

## Arquitectura y entrenamiento

La información disponible indica que zsl-h21 es un merge de tres checkpoints: cribl-ai/cribl-decision-2-0.8B, joamCriff123/zils-lite-l1123q y joamCriff123/zils-lite-l1125a. El tag qwen3_5 apunta a una arquitectura de tipo transformer derivada de la familia Qwen 3.5, y el tag custom_code implica que la carga requiere código propio incluido en el repositorio (trust_remote_code), probablemente para definir capas o cabeceras específicas del merge. El pipeline declarado es feature-extraction, lo que sugiere que el modelo está orientado a producir representaciones y no a decodificar texto de forma autoregresiva estándar.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. Tampoco se detalla la técnica de merge empleada (por ejemplo, SLERP, TIES, DARE o model stock) ni los hiperparámetros del proceso. Al tratarse de un merge de modelos de decisión de pequeño tamaño, es razonable esperar que herede las capacidades de sus bases, pero esto no puede confirmarse con los datos públicos del repositorio.

## Capacidades

- Extracción de características: el pipeline declarado es feature-extraction, por lo que el uso principal es generar embeddings o representaciones latentes a partir de texto de entrada.
- Modelo de decisión: los tags decision-model y d3-lite sugieren un uso orientado a tareas de clasificación, enrutamiento o selección entre opciones.
- Merge multi-modelo: combina tres checkpoints base, lo que puede aportar capacidades complementarias de cada uno de ellos.
- Código personalizado: requiere trust_remote_code para cargar la arquitectura definida en el repositorio.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Recuperación aumentada (RAG) con embeddings ligeros: el modelo puede emplearse para codificar documentos y consultas en un espacio vectorial de ~853 M de parámetros, lo que permite desplegarlo en una sola GPU consumer y reducir coste frente a embedders de mayor tamaño.
- Enrutamiento de consultas en sistemas multi-agente: al ser un modelo de decisión (tag decision-model), puede clasificar la intención de una consulta y dirigirla al agente o herramienta adecuada dentro de un pipeline.
- Clasificación de texto en producción: con una cabecera ligera sobre las representaciones extraídas, sirve para tareas de moderación, etiquetado o triaje de tickets con latencia baja.
- Deduplicación y similitud semántica: los embeddings generados permiten detectar duplicados o near-duplicates en corpus grandes sin recurrir a APIs externas.
- Filtrado previo en pipelines de generación: puede actuar como primera etapa que descarta entradas irrelevantes antes de invocar un LLM mayor, reduciendo coste por token.
- Búsqueda semántica en aplicaciones internas: integrado en una base vectorial (FAISS, Qdrant, pgvector) para búsqueda sobre documentación corporativa, con la ventaja de que la licencia Apache 2.0 permite uso comercial.
- Investigación sobre merges de modelos pequeños: sirve como caso de estudio para evaluar cómo afecta la combinación de checkpoints de decisión a las representaciones resultantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,7 GB de pesos más overhead de activaciones y contexto; en la práctica, entre 2 y 4 GB según longitud de secuencia y batch.
- VRAM estimada en cuantización de 8 bits: en torno a 0,9-1,2 GB de pesos; en 4 bits, aproximadamente 0,5-0,7 GB (aunque el repositorio no publica variantes cuantizadas, sería necesario generarlas).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A10, L4, A100 y H100 son válidas. En consumer GPU cabe sin problemas en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090.
- Despliegue: transformers con trust_remote_code es la vía nativa; al ser feature-extraction, también puede servirse mediante Text Embeddings Inference (TEI) o un servidor FastAPI propio. vLLM y llama.cpp no están confirmados para esta arquitectura con custom_code; sería necesario verificar compatibilidad.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| zsl-h21 | ~853 M | no disponible | apache-2.0 | gated | Merge de 3 checkpoints, feature-extraction |
| cribl-ai/cribl-decision-2-0.8B | ~0,8 B (según nombre) | no disponible | no disponible | no disponible | Modelo base del merge |
| joamCriff123/zils-lite-l1123q | no disponible | no disponible | no disponible | no disponible | Modelo base del merge |
| joamCriff123/zils-lite-l1125a | no disponible | no disponible | no disponible | no disponible | Modelo base del merge |

No se dispone de datos de rendimiento comparativo con alternativas de la misma categoría (embedders pequeños como bge-small, e5-small o gte-small) en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated; es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos, lo que puede retrasar la integración en pipelines automatizados.
- Documentación mínima: no se publican idiomas, contexto, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su idoneidad antes de desplegarlo.
- Código personalizado: requiere trust_remote_code, lo que implica ejecutar código del autor del repositorio; conviene auditar el código antes de usarlo en producción.
- Riesgo de alucinación: aunque el pipeline es feature-extraction, si se usa para generación a través de cabeceras propias, el riesgo de alucinación no puede descartarse y no está documentado.
- Sesgos: al no documentarse la composición del dataset ni los modelos base en detalle, no es posible evaluar sesgos conocidos; se recomienda auditoría empírica antes de uso en dominios sensibles.
- Licencia: apache-2.0 permite uso comercial, pero al ser un merge de modelos cuyas licencias individuales no se detallan, conviene verificar que los checkpoints base no impongan restricciones adicionales.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni comunidad que valide su comportamiento.
- Compatibilidad de herramientas: al usar custom_code, el soporte en vLLM, llama.cpp u Ollama no está garantizado y requeriría trabajo de adaptación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface12341/zsl-h21
- Modelo base cribl-ai/cribl-decision-2-0.8B: https://huggingface.co/cribl-ai/cribl-decision-2-0.8B
- Modelo base joamCriff123/zils-lite-l1123q: https://huggingface.co/joamCriff123/zils-lite-l1123q
- Modelo base joamCriff123/zils-lite-l1125a: https://huggingface.co/joamCriff123/zils-lite-l1125a
