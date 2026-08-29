# faxenoff/code-daemon-reranker-v1

## Resumen

`code-daemon-reranker-v1` es un modelo de reranking (segunda etapa) especializado en búsqueda de código, desarrollado por el usuario `faxenoff` como parte del ecosistema UltraCode, un servidor MCP para asistencia de programación. Su función es reordenar los resultados obtenidos por un recuperador bi-encoder (`code-daemon-embed-v1`) para mejorar la precisión en tareas de búsqueda de lenguaje natural a código (NL→code). El modelo es un cross-encoder basado en XLM-RoBERTa con 12 capas y 384 unidades ocultas, aproximadamente 117 millones de parámetros, y una ventana de contexto de 256 tokens para el par (consulta, documento).

La relevancia de este modelo radica en su enfoque listwise: en lugar de entrenar con pérdida pointwise (BCE), se utiliza ListNet top-1 softmax cross-entropy sobre grupos de {1 positivo + hasta 8 negativos duros}, lo que optimiza directamente el orden de la lista de candidatos. Esto produce mejoras significativas en las métricas de precisión en la parte superior de la lista (Hit@1, MRR, nDCG) sin afectar al recall, que está limitado por el recuperador de primera etapa. El modelo se distribuye con motores compilados para TensorRT, OpenVINO y TVM, lo que permite su ejecución en GPUs NVIDIA, iGPUs Intel y GPUs compatibles con Vulkan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder XLM-RoBERTa (12 capas, 384 hidden, 250k vocab SentencePiece) |
| Parametros totales | ~117 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens (par consulta + documento concatenado) |
| Tipos de cuantizacion | FP32 (ONNX), FP16 (TensorRT, OpenVINO, TVM) |
| Idiomas soportados | Multilingue (XLM-R, 250k vocab), con enfoque en codigo (NL→code) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx FP32), motores compilados TensorRT (.engine), OpenVINO (.xml/.bin), TVM (.dll/.so) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder: recibe el par (consulta, documento) concatenado y produce un logit de relevancia mediante atención conjunta sobre ambos textos. Se inicializa desde `cross-encoder/mmarco-mMiniLMv2-L12-H384-v1`, un cross-encoder multilingüe entrenado en MS MARCO, y se fine-tunea con una pérdida listwise (ListNet top-1 softmax cross-entropy) sobre aproximadamente 99.000 grupos de consulta, cada uno con 1 positivo y hasta 8 negativos duros. Los negativos duros se extraen mediante el recuperador `nomic-ai/CodeRankEmbed` sobre el dataset CoIR, de modo que el modelo aprende a rechazar los documentos que el primer stage confunde con la respuesta correcta. El entrenamiento se realizó en 2 épocas con una sola GPU A100.

La innovación principal es el uso de pérdida listwise en lugar de pointwise BCE, lo que concentra la capacidad del modelo en optimizar el orden de la parte superior de la lista de candidatos. Según los datos del autor, esto produce una mejora de +0.12 en Hit@1 y +0.10 en MRR respecto al mismo modelo entrenado con BCE, mientras que el recall (Hit@5/@10) permanece sin cambios porque está limitado por el recuperador de primera etapa.

## Capacidades

- Reranking de resultados de búsqueda de código: dado un pool de candidatos (típicamente ~64) procedente de un recuperador bi-encoder, asigna un logit de relevancia a cada par (consulta, documento) y permite ordenar por relevancia.
- Búsqueda NL→code: acepta consultas en lenguaje natural y documentos de código (unidades de código, funciones, clases) para encontrar la coincidencia más relevante.
- Multilingüe: al estar basado en XLM-R, soporta múltiples idiomas para las consultas, aunque el contenido de código es independiente del idioma.
- Integración con motores de inferencia optimizados: se distribuye con motores compilados para TensorRT (NVIDIA), OpenVINO (Intel CPU/iGPU) y TVM/Vulkan, lo que permite ejecución en diversos hardware.
- Salida de logit sin normalizar: el modelo emite un logit crudo (cabeza Identity) que debe compararse relativamente dentro de una misma consulta, no contra un umbral fijo.
- No soporta generación de texto ni tool calling: es exclusivamente un modelo de reranking, no un LLM generativo.

## Casos de uso

- Búsqueda de código en IDE: un plugin de editor puede usar el modelo para reordenar los resultados de búsqueda de símbolos o funciones, mejorando la precisión de las sugerencias cuando el desarrollador escribe una consulta en lenguaje natural.
- Asistentes de programación con MCP: el servidor UltraCode MCP integra este reranker como segunda etapa tras un recuperador por embeddings, permitiendo que el asistente encuentre el fragmento de código más relevante para una pregunta del usuario.
- Indexación y recuperación en repositorios grandes: en codebases con miles de archivos, el modelo puede rerankear los resultados de un primer filtro rápido para reducir falsos positivos y presentar las mejores coincidencias.
- Búsqueda semántica de documentación técnica: aunque está orientado a código, el modelo puede aplicarse a pares consulta-documento en dominios técnicos multilingües, gracias a su base XLM-R.
- Pipeline de RAG para generación de código: en un sistema de generación asistida por recuperación, el reranker puede seleccionar los ejemplos de código más relevantes de una base de conocimiento antes de pasarlos al LLM generativo.
- Evaluación de calidad de recuperación: los logits del modelo pueden usarse como señal de relevancia para depurar y mejorar el recuperador de primera etapa, identificando qué documentos confunde el sistema.

## Benchmarks y rendimiento

El autor proporciona resultados sobre un conjunto dorado propio (`search-gold`) de 26 consultas NL→code, comparando el rendimiento del recuperador de embeddings solo frente al recuperador + reranker. Los datos son los siguientes:

| Metrica | Embed-only | + Reranker | Delta |
|---|---|---|---|
| Hit@1 | 0.42 | 0.54 | +0.12 |
| Hit@3 | 0.62 | 0.77 | +0.15 |
| Hit@5 | 0.73 | 0.77 | +0.04 |
| Hit@10 | 0.81 | 0.81 | 0 |
| MRR@10 | 0.55 | 0.65 | +0.10 |
| nDCG@10 | 0.59 | 0.67 | +0.08 |

No se han publicado resultados en benchmarks estándar como MS MARCO, BEIR o CoIR. La tabla de latencia por backend está incompleta en la documentación disponible; solo se indica que con OpenVINO se obtiene una latencia de rerank determinada, pero el valor concreto no se muestra en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~117M parámetros, en FP16 ocupa aproximadamente 234 MB de memoria. En FP32, unos 468 MB. Los motores compilados pueden tener requisitos ligeramente superiores por buffers de inferencia.
- GPUs compatibles: cualquier GPU NVIDIA con soporte TensorRT (sm_86 para RTX 30xx/A-series, sm_89 para RTX 40xx/L4, sm_120 para RTX 50xx), iGPU Intel con OpenVINO, o GPUs con soporte Vulkan para TVM.
- Cabe en GPUs de consumo: sí, cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en FP16. Una RTX 3060 o superior es suficiente.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), TensorRT, OpenVINO, TVM. También puede usarse con `optimum` para exportación a otros formatos.
- Latencia y throughput: no se dispone de datos completos. El autor indica que el modelo está diseñado para ser rápido (contexto corto de 256 tokens, pool acotado de ~64 candidatos), pero no se publican cifras concretas de latencia en la documentación disponible.

## Comparativa con modelos similares

No se dispone de una comparativa directa publicada con otros rerankers en los mismos benchmarks. Como referencia cualitativa, se pueden mencionar alternativas de la misma categoría (cross-encoders pequeños para reranking):

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| code-daemon-reranker-v1 | ~117M | 256 | MIT | Especializado en código, listwise, multilingüe |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | ~22M | 512 | Apache-2.0 | Reranker generalista, punto de referencia clásico |
| BAAI/bge-reranker-base | ~278M | 512 | MIT | Reranker multilingüe, entrenado con pares de alta calidad |

No hay datos de rendimiento comparativo en los mismos conjuntos de evaluación, por lo que no se puede establecer una jerarquía objetiva.

## Limitaciones y advertencias

- El modelo está especializado en código y su evaluación se basa en un conjunto dorado propio de solo 26 consultas, lo que limita la generalización de las métricas reportadas.
- La ventana de contexto de 256 tokens es corta; no es adecuado para documentos largos o consultas extensas.
- El logit de salida no está normalizado, por lo que no debe usarse como puntuación absoluta de relevancia entre consultas diferentes.
- Aunque la licencia MIT permite uso comercial, el modelo depende de motores de inferencia (TensorRT, OpenVINO, TVM) que pueden tener sus propias licencias y restricciones.
- No se han documentado sesgos específicos, pero al estar entrenado con datos de código (CoIR, code_search_net) puede tener un sesgo hacia lenguajes de programación populares y patrones de código comunes.
- El modelo no genera texto; es exclusivamente un reranker. Cualquier uso que requiera generación debe combinarse con un LLM.
- La integración con el servidor MCP UltraCode es específica; el uso independiente requiere implementar el pipeline de recuperación + reranking manualmente.

## Enlaces

- [HuggingFace: faxenoff/code-daemon-reranker-v1](https://huggingface.co/faxenoff/code-daemon-reranker-v1)
- [Repositorio de archivos en HuggingFace](https://huggingface.co/faxenoff/code-daemon-reranker-v1/tree/main)
- [Modelo base: cross-encoder/mmarco-mMiniLMv2-L12-H384-v1](https://huggingface.co/cross-encoder/mmarco-mMiniLMv2-L12-H384-v1)
- [Recuperador de primera etapa: code-daemon-embed-v1](https://huggingface.co/faxenoff/code-daemon-embed-v1)
- [Recuperador usado para minería de negativos: nomic-ai/CodeRankEmbed](https://huggingface.co/nomic-ai/CodeRankEmbed)
- [GitHub de UltraCode (referenciado en la model card)](https://github.com/faxenoff/ultracode)
