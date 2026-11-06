# DakeraAI/modernbert-embed-base

## Resumen

`DakeraAI/modernbert-embed-base` es un espejo verificado del modelo de embeddings `nomic-ai/modernbert-embed-base` publicado por Nomic AI. El repositorio lo mantiene Dakera, una empresa que desarrolla un motor de memoria a largo plazo autoalojado para agentes de IA, y su función es servir como fuente primaria de descarga de los ficheros ONNX que ese motor consume. No se trata, por tanto, de un modelo nuevo ni de un fine-tuning: los pesos, el tokenizador y la configuración son copias byte a byte del original, con verificación SHA-256 documentada en la model card.

El modelo subyacente es un encoder ModernBERT orientado a la extracción de características (`feature-extraction`), es decir, a la generación de embeddings de frases y documentos para tareas de recuperación semántica. ModernBERT sustituye la atención clásica por atención con rotación posicional (RoPE) y alterna capas de atención local y global, lo que permite ventanas de contexto mucho más largas que BERT con un coste computacional menor. El repositorio incluye dos variantes ONNX: `model.onnx` (unos 596 MB) y `model_quantized.onnx` (unos 150 MB).

Su relevancia práctica es doble. Por un lado, interesa a quien despliegue Dakera y quiera evitar dependencias de un único origen de descarga. Por otro, sirve como referencia de despliegue de un encoder de embeddings en formato ONNX, ejecutable sin PyTorch y apto para entornos con CPU, lo que encaja en pipelines de RAG y memoria de agentes autoalojados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer, base_model: nomic-ai/modernbert-embed-base) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la model card indica "long context" sin cifra) |
| Tipos de cuantizacion | ONNX float (596.492.399 bytes) y ONNX quantized (150.336.419 bytes) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model.onnx`, `onnx/model_quantized.onnx`) + `tokenizer.json` |

## Arquitectura y entrenamiento

El repositorio no documenta arquitectura ni entrenamiento propios: es un espejo. La arquitectura corresponde a ModernBERT, la familia de encoders de Nomic AI y Answer.AI que reemplaza BERT con atención RoPE, capas de atención local intercaladas con capas de atención global y un contexto extendido respecto a los 512 tokens de BERT. La model card de este espejo no aporta detalles sobre número de tokens de entrenamiento, composición del dataset ni si hubo ajuste por pares (contrastivo, DPO u otras técnicas).

Los únicos datos técnicos verificables en este repositorio son los checksums de los tres ficheros copiados: `onnx/model.onnx` (SHA-256 `3b9dbe45…`), `onnx/model_quantized.onnx` (SHA-256 `11b1bd33…`) y `tokenizer.json` (SHA-256 `6c8aaa9a…`). Para información sobre el proceso de entrenamiento del modelo original hay que remitirse a la model card de `nomic-ai/modernbert-embed-base`, que este espejo no reproduce.

## Capacidades

- Generación de embeddings de texto (pipeline `feature-extraction`): produce representaciones vectoriales para búsqueda semántica y recuperación.
- Contexto largo: la model card de Dakera describe el modelo como "ModernBERT embedding model with a long context", sin cuantificar la ventana.
- Recuperación aumentada (RAG): pensado para indexar y consultar documentación, memoria de agente y bases de conocimiento.
- Memoria a largo plazo para agentes: es el caso de uso declarado por Dakera, que lo integra junto con recuperación híbrida vectorial y de texto completo, reranking y decaimiento por importancia.
- Ejecución sin PyTorch: los artefactos ONNX permiten inferencia con ONNX Runtime en CPU o GPU.
- Cuantización: variante `model_quantized.onnx` de ~150 MB frente a los ~596 MB del modelo completo.
- Tool calling / function calling: no disponible (es un encoder, no un modelo generativo).
- Razonamiento multi-paso y modo thinking: no aplica.
- Capacidades multilingües: no disponible.

## Casos de uso

- Memoria a largo plazo en agentes autoalojados: desplegar Dakera con `DAKERA_MODEL=modernbert-embed-base` para que el motor genere embeddings de los recuerdos del agente y los recupere entre sesiones, con la ventaja de que el modelo se sirve desde este espejo verificado y no depende de un único origen.
- Pipeline RAG sobre documentación interna: indexar manuales, tickets o wikis y recuperar fragmentos por similitud semántica; el contexto largo del encoder base reduce la necesidad de trocear agresivamente los documentos.
- Búsqueda semántica en aplicaciones con requisitos de autoalojamiento: al distribuirse en ONNX y con licencia Apache-2.0, puede integrarse en servicios propios sin depender de APIs externas ni de un runtime de PyTorch.
- Despliegue en entornos con CPU o recursos limitados: la variante `model_quantized.onnx` de ~150 MB permite ejecutar el encoder en servidores modestos o en el arranque de contenedores, donde la imagen Docker de Dakera ya incluye los modelos por defecto sin descarga en el arranque.
- Deduplicación y clustering de textos: usar los embeddings para agrupar tickets de soporte, noticias o registros similares en lotes, aprovechando la inferencia por lotes de ONNX Runtime.
- Verificación de integridad en cadena de suministro de modelos: emplear los SHA-256 publicados para auditar que los pesos desplegados en producción coinciden exactamente con los del repositorio original.
- Reranking o filtrado previo en sistemas de recomendación de contenido: generar embeddings de candidatos y consultas para preseleccionar resultados antes de un reranker más costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este espejo no incluye métricas de recuperación ni de MTEB. El único dato numérico de rendimiento que aparece es el 88,2 % de Recall@20 en LoCoMo, pero corresponde al motor Dakera en su conjunto, no a este modelo de embeddings de forma aislada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño de los artefactos, la variante completa (~596 MB) requiere del orden de 1-2 GB de memoria en FP32 con overhead de runtime, y la cuantizada (~150 MB) puede ejecutarse en menos de 1 GB, pero son estimaciones, no cifras publicadas.
- GPU recomendadas: no disponibles. Al ser un encoder base, cualquier GPU con suficiente memoria (RTX 3060 en adelante, A10, L4, A100) puede servirlo; no hay guía oficial.
- GPU de consumo: previsiblemente sí cabe en GPUs de consumo (RTX 3060/4060 y superiores), aunque no se documenta.
- Despliegue: ONNX Runtime es el runtime natural; también puede servirse a través de Dakera (imagen Docker `ghcr.io/dakera-ai/dakera:latest`), que lo incluye como modelo por defecto. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DakeraAI/modernbert-embed-base (este) | no disponible | no disponible | ONNX (float y quantized) | Apache-2.0 | Espejo verificado del original, orientado a despliegue en Dakera |
| nomic-ai/modernbert-embed-base | no disponible | no disponible | safetensors / ONNX (original) | Apache-2.0 | Modelo original de Nomic AI; misma arquitectura y pesos |
| BERT-base (referencia de encoder) | ~110 M | 512 tokens | safetensors, ONNX | Apache-2.0 | Arquitectura anterior, sin RoPE ni atención local; contexto mucho menor |
| Otros encoders de embeddings de Nomic | no disponible | no disponible | safetensors, GGUF | Apache-2.0 | Familia distinta (nomic-embed-text); comparación no documentada en este repositorio |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, solo vectores; no admite instrucciones, tool calling ni razonamiento multi-paso.
- Es un espejo, no un modelo propio: cualquier corrección, mejora o soporte debe dirigirse al repositorio original de Nomic AI; este repositorio no documenta cambios.
- Idiomas soportados no declarados: no hay garantía documentada de calidad en castellano ni en otros idiomas distintos del inglés.
- Longitud de contexto sin cuantificar: la model card afirma "long context" pero no indica el número de tokens, lo que impide dimensionar el troceado de documentos con precisión.
- Riesgo de alucinación no aplica en sentido estricto (no genera texto), pero los embeddings pueden producir recuperaciones semánticamente plausibles y factualmente irrelevantes; conviene combinar con reranking y filtros.
- Sesgos: no documentados en este repositorio; dependen del corpus de entrenamiento del modelo original.
- Licencia Apache-2.0: permite uso comercial y modificación, pero exige conservar los avisos de copyright y atribución a Nomic AI; el repositorio incluye el fichero `LICENSE` correspondiente.
- Sin métricas de rendimiento propias: no hay benchmarks que permitan comparar este espejo con alternativas; la única cifra (88,2 % Recall@20 en LoCoMo) es del motor Dakera, no del modelo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: madurez y adopción no verificables.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DakeraAI/modernbert-embed-base
- Modelo original: https://huggingface.co/nomic-ai/modernbert-embed-base
- Licencia: https://huggingface.co/DakeraAI/modernbert-embed-base/blob/main/LICENSE
- Web de Dakera: https://dakera.ai
- Documentación de Dakera: https://dakera.ai/docs
- GitHub de Dakera: https://github.com/Dakera-AI
- Despliegue autoalojado (Docker, Kubernetes, Helm): https://github.com/Dakera-AI/dakera-deploy
- Servidor MCP: https://github.com/Dakera-AI/dakera-mcp
- SDK Python: https://github.com/Dakera-AI/dakera-py
- SDK TypeScript: https://github.com/Dakera-AI/dakera-js
- SDK Go: https://github.com/Dakera-AI/dakera-go
- SDK Rust: https://github.com/Dakera-AI/dakera-rs
- LinkedIn: https://www.linkedin.com/company/dakera-ai
- Contacto: amine@dakera.ai
