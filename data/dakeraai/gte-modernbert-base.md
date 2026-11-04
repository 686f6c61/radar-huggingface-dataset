# DakeraAI/gte-modernbert-base

## Resumen

`DakeraAI/gte-modernbert-base` es un espejo verificado del modelo de embeddings `Alibaba-NLP/gte-modernbert-base`, publicado por Dakera, una empresa que desarrolla un motor de memoria a largo plazo autoalojado para agentes de IA. No se trata de un modelo nuevo ni de un fine-tuning: los archivos se copian byte a byte del repositorio original de Alibaba-NLP y se validan mediante SHA-256, por lo que todas las capacidades y limitaciones del modelo son las del original.

El modelo subyacente es un encoder ModernBERT orientado a `feature-extraction`, es decir, a generar representaciones vectoriales densas de texto para tareas de recuperación semántica, similitud y RAG. Su interés principal es la ventana de contexto larga que ofrece la arquitectura ModernBERT, adecuada para indexar documentos completos y no solo fragmentos cortos, y su empaquetado en ONNX (versión completa de ~596 MB y versión cuantizada de ~150 MB).

La relevancia de este repositorio concreto es operativa: Dakera lo usa como fuente primaria para descargar el modelo de embeddings y recurre al repositorio original de Alibaba-NLP como respaldo, de modo que los despliegues no dependen de una única fuente. La licencia Apache-2.0 se mantiene, igual que en el original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | no disponible (el repositorio solo publica pesos ONNX, no el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el autor lo describe como "long context") |
| Tipos de cuantizacion | ONNX completo (`model.onnx`, 596.392.315 bytes) y ONNX cuantizado (`model_quantized.onnx`, 150.218.016 bytes) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model.onnx`, `onnx/model_quantized.onnx`) + `tokenizer.json` |

## Arquitectura y entrenamiento

El repositorio no documenta arquitectura ni entrenamiento propios: es un espejo. El modelo base es `Alibaba-NLP/gte-modernbert-base`, un encoder de la familia ModernBERT de Alibaba-NLP, una evolución de la arquitectura BERT que incorpora atención con rotatory positional embeddings, alternancia entre atención local y global y capas sin sesgo, orientada a contextos largos y a un rendimiento eficiente en GPU de consumo. Al ser un modelo de embeddings bidireccional, no genera texto: produce un vector por secuencia de entrada.

No se dispone en la informacion proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones específicas del entrenamiento. Para esos detalles hay que consultar la model card original de `Alibaba-NLP/gte-modernbert-base`. El único dato técnico adicional verificable es el empaquetado: los pesos se distribuyen en formato ONNX, con una variante cuantizada de aproximadamente un cuarto del tamaño de la completa, lo que sugiere cuantización de 8 bits, aunque el tipo exacto no se especifica.

## Capacidades

- Generación de embeddings de texto para recuperación semántica (pipeline `feature-extraction`).
- Búsqueda densa y similitud entre consultas y documentos, base para pipelines RAG.
- Indexación de documentos con contexto largo, según la ventana que soporte el modelo base.
- Extracción de características para clasificación, clustering y deduplicación semántica.
- Integración en el motor de memoria de agentes de Dakera (recuperación híbrida vectorial y de texto completo, reranking y extracción de entidades, según la descripción del producto).
- Ejecución en ONNX Runtime, tanto en CPU como en GPU, con variante cuantizada para entornos con poca memoria.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades multimodales: es exclusivamente un encoder de representaciones.

## Casos de uso

- Memoria a largo plazo para agentes: Dakera emplea este modelo como embedder para almacenar y recuperar recuerdos entre sesiones; el contexto largo del ModernBERT permite indexar conversaciones completas sin trocearlas en exceso.
- RAG sobre documentación técnica: se indexan manuales y referencias de API con la variante ONNX completa y se consultan por similitud vectorial desde un servicio de recuperación.
- Búsqueda semántica en catálogos internos: generación de embeddings de productos o tickets para búsqueda por significado en lugar de por palabra clave.
- Deduplicación y clustering de contenidos: agrupación de artículos, issues o correos similares calculando distancias entre embeddings.
- Clasificación de texto con pocos datos: uso de los embeddings como entrada de un clasificador ligero (regresión logística, SVM) para moderación o etiquetado.
- Despliegue en entornos con recursos limitados: la variante `model_quantized.onnx` (~150 MB) permite servir el embedder en CPU o en GPUs pequeñas dentro de un contenedor, sin descarga en el arranque si se usa la imagen Docker de Dakera.
- Filtrado previo en pipelines de agentes: recuperación de candidatos por embedding antes de un reranker más costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del espejo no incluye métricas del modelo; el único dato numérico es el 88,2 % de Recall@20 en LoCoMo, que corresponde al producto Dakera en su conjunto y no a este modelo de embeddings de forma aislada.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB para la variante ONNX completa en FP32 y del orden de 200-400 MB para la cuantizada, sin contar activaciones ni overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; A100, H100 o RTX 4090 son sobredimensionadas para este encoder y se aprovecharían mejor con batching alto.
- Cabe en GPU de consumo: sí, en cualquier RTX o GTX moderna, e incluso en iGPU y CPU para cargas moderadas.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio), y a través del modelo base también vLLM, TGI, llama.cpp/Ollama no aplican por ser encoder, y `sentence-transformers`/Transformers si se usan los pesos originales.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware, del tamaño de lote y de la longitud de secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `DakeraAI/gte-modernbert-base` (este) | no disponible | no disponible | ONNX (FP32 y cuantizado) | Apache-2.0 | Espejo verificado del original |
| `Alibaba-NLP/gte-modernbert-base` | no disponible | no disponible | safetensors/Transformers | Apache-2.0 | Modelo original; fuente de la verdad |
| `BAAI/bge-m3` | no disponible en la informacion proporcionada | no disponible | safetensors | MIT | Alternativa multilingüe popular para RAG |
| `intfloat/multilingual-e5-base` | no disponible en la informacion proporcionada | no disponible | safetensors | MIT | Alternativa multilingüe de tamaño base |

No se dispone de datos de rendimiento comparado en la informacion proporcionada; la comparación se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo generativo: no puede responder preguntas ni razonar; solo produce embeddings.
- Al ser un espejo sin modificaciones, hereda cualquier sesgo y limitación del modelo original de Alibaba-NLP.
- Riesgo de alucinación no aplica directamente, pero sí de recuperaciones irrelevantes si los embeddings se usan mal calibrados o con umbrales inadecuados.
- Idiomas soportados no documentados en este repositorio; conviene verificar el comportamiento multilingüe en la model card original antes de usarlo en producción con textos en castellano.
- La longitud de contexto real no está indicada aquí; no asumir cifras sin consultar el modelo base.
- La licencia Apache-2.0 permite uso comercial, pero debe conservarse el aviso de atribución a Alibaba-NLP y a Dakera.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado en noviembre de 2026; es un artefacto de despliegue, no un modelo con comunidad o soporte propio.
- Para producción, validar los SHA-256 publicados antes de servir los pesos.

## Enlaces

- Repositorio del espejo: https://huggingface.co/DakeraAI/gte-modernbert-base
- Modelo original: https://huggingface.co/Alibaba-NLP/gte-modernbert-base
- Licencia: https://huggingface.co/DakeraAI/gte-modernbert-base/blob/main/LICENSE
- Web de Dakera: https://dakera.ai
- Documentación de Dakera: https://dakera.ai/docs
- GitHub de Dakera: https://github.com/Dakera-AI
- Despliegue (Docker, Kubernetes, Helm): https://github.com/Dakera-AI/dakera-deploy
- Servidor MCP: https://github.com/Dakera-AI/dakera-mcp
- SDK Python: https://github.com/Dakera-AI/dakera-py
- SDK TypeScript: https://github.com/Dakera-AI/dakera-js
- SDK Go: https://github.com/Dakera-AI/dakera-go
- SDK Rust: https://github.com/Dakera-AI/dakera-rs
- LinkedIn: https://www.linkedin.com/company/dakera-ai
- Contacto: amine@dakera.ai
