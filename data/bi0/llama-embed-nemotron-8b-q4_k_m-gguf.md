# bi0/llama-embed-nemotron-8b-Q4_K_M-GGUF

## Resumen

`bi0/llama-embed-nemotron-8b-Q4_K_M-GGUF` es una cuantización comunitaria en formato GGUF (Q4_K_M) del modelo de embeddings `nvidia/llama-embed-nemotron-8b`, publicada por el usuario `bi0`. No se trata de un modelo generativo nuevo ni de un fine-tune: es una conversión de pesos públicos a un formato optimizado para inferencia local, orientada específicamente a hardware DGX Spark con GPU Blackwell GB10 (sm121). El repositorio incluye un único artefacto de 4410,97 MB (4625233184 bytes) con huella SHA-256 verificable.

El modelo base es un encoder bidireccional de 8B parámetros derivado de la familia Llama, diseñado para producir representaciones densas de 4096 dimensiones. Su propósito es servir como motor de búsqueda semántica, recuperación aumentada (RAG) y similitud textual, no como generador de texto. La cuantización Q4_K_M reduce el peso a aproximadamente 4,4 GB, lo que permite ejecutarlo en GPUs de consumo con VRAM limitada, a costa de una pérdida de precisión en los embeddings que el autor no documenta.

La relevancia de esta ficha es acotada: el repositorio tiene cero descargas y cero likes en el momento de la consulta, no declara licencia ni idiomas, y la model card se limita a metadatos de empaquetado (ruta local, puerto de runtime, fingerprint). Es útil como referencia de despliegue en Blackwell, pero no aporta información técnica sobre el modelo subyacente más allá de lo que publique NVIDIA en su repositorio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional (encoder de embeddings), derivado de Llama; dimensión de embedding 4096 |
| Parametros totales | 8B (según el nombre del modelo base; no verificado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); el autor no documenta otras variantes |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q4_K_M), 4410,97 MB |

## Arquitectura y entrenamiento

El modelo base `nvidia/llama-embed-nemotron-8b` es un encoder de embeddings construido sobre la arquitectura Llama, adaptado para producir representaciones bidireccionales de 4096 dimensiones. La model card del repositorio cuantizado confirma explícitamente el carácter bidireccional ("4096D Bidirectional Embedding"), lo que lo diferencia de los decodificadores causales estándar de la familia Llama. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de contraste (por ejemplo, InfoNCE) o ajuste fino supervisado.

La contribución técnica de este repositorio es exclusivamente la cuantización: conversión de los pesos originales a Q4_K_M con el objetivo de reducir el tamaño a 4,4 GB y habilitar inferencia en DGX Spark GB10. El autor etiqueta el repositorio con `sm121`, la arquitectura de cómputo de Blackwell, lo que sugiere que la conversión se validó en ese hardware. No se documentan métricas de degradación de calidad respecto al modelo en precisión completa, ni detalles sobre la herramienta de cuantización empleada (llama.cpp u otra).

## Capacidades

- Generación de embeddings de texto densos de 4096 dimensiones para búsqueda semántica y similitud.
- Recuperación de información y soporte a pipelines RAG (retrieval-augmented generation).
- Codificación bidireccional, adecuada para tareas de comparación y ranking de pasajes.
- No es un modelo generativo: no produce texto, no soporta tool calling ni function calling.
- No se documenta soporte de agentes, razonamiento multi-paso ni modo thinking.
- Capacidades multilingües: no disponibles (no declaradas).
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Búsqueda semántica en corpus internos: indexar documentos con embeddings de 4096 dimensiones y recuperar por similitud coseno; el tamaño Q4_K_M permite mantener el índice y el encoder en una sola GPU.
- RAG sobre documentación técnica: usar el modelo como retriever en un pipeline que alimente a un LLM generativo, aprovechando la ventana de contexto del encoder (no documentada) para pasajes largos.
- Deduplicación y clustering de textos: agrupar artículos, tickets o registros por cercanía en el espacio de embeddings.
- Clasificación zero-shot por prototipos: comparar embeddings de consultas contra embeddings de etiquetas descriptivas.
- Despliegue en DGX Spark GB10: el repositorio está explícitamente orientado a sm121, con ruta local y puerto de runtime documentados, lo que facilita su integración en un servidor de embeddings local.
- Evaluación comparativa de cuantizaciones: servir como referencia para medir la pérdida de calidad de Q4_K_M frente a pesos en FP16 en tareas de retrieval.
- Filtrado de contenido y moderación: calcular similitud contra un conjunto de ejemplos etiquetados para puntuar textos entrantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de retrieval (nDCG, Recall@k), ni comparaciones con el modelo en precisión completa, ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5-6 GB para el archivo Q4_K_M de 4410,97 MB, más overhead de contexto y buffers de computación (estimación, no documentada por el autor).
- GPU recomendadas: NVIDIA DGX Spark con Blackwell GB10 (sm121), hardware para el que el autor declara haber validado la conversión.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060, RTX 4070, etc.), siempre que el backend soporte la arquitectura.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python) por el formato GGUF; el autor menciona un runtime en el puerto 8089, presumiblemente un servidor de embeddings local.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bi0/llama-embed-nemotron-8b-Q4_K_M-GGUF | 8B | no disponible | GGUF Q4_K_M | no disponible | Hugging Face |
| nvidia/llama-embed-nemotron-8b | 8B | no disponible | safetensors (presumible) | no disponible | Hugging Face |
| mradermacher/llama-embed-nemotron-8b-GGUF | 8B | no disponible | GGUF (varias cuantizaciones) | no disponible | Hugging Face |

La comparativa se limita al mismo modelo base en distintos empaquetados, ya que no se dispone de datos de rendimiento ni de especificaciones de alternativas de otros fabricantes. La diferencia principal entre las tres entradas es el formato y el conjunto de cuantizaciones ofrecidas: `mradermacher` publica habitualmente múltiples niveles (Q2 a Q8), mientras que este repositorio solo ofrece Q4_K_M.

## Limitaciones y advertencias

- No es un modelo generativo: no debe usarse para completar texto, razonar ni ejecutar herramientas.
- La cuantización Q4_K_M introduce pérdida de precisión en los embeddings; el autor no cuantifica esa degradación, por lo que no se puede garantizar paridad con el modelo en FP16.
- Licencia no declarada: no hay base legal explícita para uso comercial; debe consultarse la licencia del modelo base `nvidia/llama-embed-nemotron-8b` antes de desplegarlo en producción.
- Idiomas no declarados: no se puede asumir cobertura multilingüe sin verificación empírica.
- Longitud de contexto no documentada: limita el diseño de pipelines RAG con pasajes largos.
- Repositorio con cero descargas y cero likes: no hay evidencia comunitaria de validación ni reportes de errores.
- La model card incluye rutas locales y puertos del entorno del autor (`/home/m1st/...`, puerto 8089), lo que indica que es un artefacto de uso personal más que un release mantenido.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí de recuperaciones irrelevantes si la cuantización degrada la separación entre embeddings.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bi0/llama-embed-nemotron-8b-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/nvidia/llama-embed-nemotron-8b
- Cuantización alternativa de mradermacher: https://huggingface.co/mradermacher/llama-embed-nemotron-8b-GGUF
