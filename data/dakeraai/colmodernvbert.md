# DakeraAI/colmodernvbert

## Resumen

`DakeraAI/colmodernvbert` es un espejo verificado del modelo `ModernVBERT/colmodernvbert`, un modelo de recuperación visual de documentos (visual document retrieval) publicado por ModernVBERT y distribuido en formato ONNX por Dakera. No se trata de un modelo generativo, sino de un codificador de recuperación que permite buscar imágenes y páginas de documentos mediante consultas de texto. Dakera lo mantiene como copia byte a byte, con verificación SHA-256, para que su motor de memoria para agentes pueda instalarlo sin depender de una única fuente.

El modelo original se enmarca en la familia de modelos de recuperación multimodal basados en arquitecturas BERT modernizadas (de ahí el nombre ModernVBERT) y emplea la técnica ColBERT para recuperación tardía (late interaction) mediante embeddings por token. El repositorio de Dakera incluye únicamente `model.onnx` (aproximadamente 1,01 GB) y `tokenizer.json` (aproximadamente 3,6 MB), lo que sugiere una cuantización o exportación ONNX optimizada para inferencia en entornos autoalojados.

Su relevancia actual radica en que resuelve un problema concreto: hacer buscables por texto grandes volúmenes de documentos escaneados e imágenes dentro de infraestructuras autoalojadas, integrándose en pipelines RAG y en sistemas de memoria a largo plazo para agentes. La licencia MIT y el formato ONNX facilitan su despliegue en producción sin dependencias de frameworks pesados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT modernizado con recuperación tardía estilo ColBERT (no confirmado en detalle en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Exportación ONNX (no se especifican niveles de cuantización) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`) y `tokenizer.json` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original. Por el nombre (`colmodernvbert`) y la etiqueta de pipeline `visual-document-retrieval`, se trata de un modelo de recuperación visual basado en la familia ModernVBERT con cabecera de tipo ColBERT, que produce embeddings por token y calcula la similitud mediante late interaction entre consultas de texto e imágenes o páginas de documento. El repositorio de Dakera no incluye la model card original ni detalles de entrenamiento.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco probables en un modelo de recuperación). La única información técnica concreta es que el artefacto es una exportación ONNX de aproximadamente 1,01 GB, copiada byte a byte desde `Qdrant/colmodernvbert`, lo que indica que la conversión a ONNX la realizó Qdrant y no Dakera. No se documentan innovaciones técnicas adicionales en la información proporcionada.

## Capacidades

- Recuperación visual de documentos: permite buscar imágenes y páginas de documentos mediante consultas de texto.
- Embeddings multimodales: genera representaciones vectoriales de imágenes y documentos para búsqueda semántica.
- Integración en pipelines RAG: sirve como recuperador en sistemas de generación aumentada por recuperación.
- Soporte para memoria a largo plazo de agentes: utilizado por Dakera como componente de visión dentro de su motor de memoria.
- Inferencia ONNX: ejecutable con runtime ONNX, sin necesidad de PyTorch en producción.
- No se documentan capacidades de generación de texto, tool calling, agentes multi-paso, razonamiento matemático ni audio.

## Casos de uso

- Búsqueda de documentos escaneados: indexar facturas, contratos o formularios en imagen y recuperarlos mediante consultas de texto, aprovechando la recuperación visual para evitar OCR previo.
- RAG sobre archivos corporativos: usar el modelo como recuperador de páginas de documento dentro de un pipeline RAG que alimente a un LLM generativo con los fragmentos visuales relevantes.
- Memoria a largo plazo de agentes: integrarlo en Dakera (`DAKERA_VISION=true`) para que un agente recuerde y recupere capturas, diapositivas o páginas vistas en sesiones anteriores.
- Atención al cliente con base documental visual: localizar la página exacta de un manual o póliza a partir de la pregunta del usuario en lenguaje natural.
- Búsqueda en archivos históricos digitalizados: recuperar recortes de prensa o documentos antiguos escaneados sin transcripción manual.
- Despliegue autoalojado en infraestructura propia: al ser ONNX y MIT, puede ejecutarse en servidores locales sin dependencias de servicios en la nube, útil en entornos con requisitos de soberanía de datos.
- Verificación de integridad en despliegues: el checksum SHA-256 publicado permite validar el artefacto en pipelines de CI/CD antes de desplegarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de Dakera no incluye métricas del modelo; solo menciona un 88,2 % de Recall@20 en el benchmark LoCoMo, pero ese dato corresponde al motor Dakera en su conjunto, no a este modelo de recuperación visual.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto ONNX ocupa aproximadamente 1,01 GB; en FP32 se estima un consumo de VRAM en torno a 1,5-2 GB, aunque no se confirma en la información disponible.
- GPU recomendadas: no especificadas; por tamaño, cualquier GPU con al menos 4 GB de VRAM debería ser suficiente (RTX 3050, RTX 4060, T4, L4). No se confirman requisitos oficiales.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer con 4 GB o más de VRAM, dado el tamaño del artefacto.
- Opciones de despliegue: runtime ONNX (ONNX Runtime), integración nativa en Dakera vía Docker (`ghcr.io/dakera-ai/dakera:latest`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de recuperación de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| DakeraAI/colmodernvbert | Recuperación visual (ColBERT) | ONNX | MIT | no disponible | Espejo verificado de ModernVBERT/colmodernvbert |
| ModernVBERT/colmodernvbert | Recuperación visual (ColBERT) | no disponible | MIT (según el espejo) | no disponible | Modelo original |
| Qdrant/colmodernvbert | Recuperación visual (ColBERT) | ONNX | no disponible | no disponible | Origen de los archivos ONNX copiados |

No se dispone de información suficiente para comparar parámetros, rendimiento o contexto con alternativas de la misma categoría. Los tres modelos listados son esencialmente el mismo artefacto en distintos puntos de la cadena de distribución.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni respuestas; solo genera embeddings para recuperación.
- La información sobre sesgos, alucinación y comportamiento multilingüe no está disponible en la documentación proporcionada.
- La longitud de contexto y la resolución de imagen soportada no se documentan; podrían limitar la recuperación en documentos de muchas páginas o imágenes de alta resolución.
- El repositorio no incluye la model card original; para conocer limitaciones reales del modelo conviene consultar `ModernVBERT/colmodernvbert`.
- Licencia MIT: permite uso comercial, pero se recomienda verificar los términos del modelo original y de los datos de entrenamiento subyacentes.
- El espejo depende de la disponibilidad del repositorio de Dakera; el checksum SHA-256 publicado permite verificar integridad, pero no sustituye al repositorio original.
- No se han publicado métricas de rendimiento propias de este artefacto; no debe asumirse un rendimiento equivalente al del motor Dakera en su conjunto.

## Enlaces

- Repositorio del espejo: https://huggingface.co/DakeraAI/colmodernvbert
- Modelo original: https://huggingface.co/ModernVBERT/colmodernvbert
- Origen de los archivos ONNX: https://huggingface.co/Qdrant/colmodernvbert
- Sitio web de Dakera: https://dakera.ai
- Documentación de Dakera: https://dakera.ai/docs
- GitHub de Dakera: https://github.com/Dakera-AI
- Despliegue autoalojado: https://github.com/Dakera-AI/dakera-deploy
- Servidor MCP: https://github.com/Dakera-AI/dakera-mcp
- SDK Python: https://github.com/Dakera-AI/dakera-py
- SDK TypeScript: https://github.com/Dakera-AI/dakera-js
- SDK Go: https://github.com/Dakera-AI/dakera-go
- SDK Rust: https://github.com/Dakera-AI/dakera-rs
- LinkedIn: https://www.linkedin.com/company/dakera-ai
