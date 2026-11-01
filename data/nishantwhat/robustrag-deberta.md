# nishantwhat/robustrag-deberta

## Resumen

RobustRAG DeBERTa es un modelo de clasificación basado en DeBERTa-v3-base, ajustado por el usuario nishantwhat para detectar alucinaciones en respuestas generadas por sistemas RAG (Retrieval-Augmented Generation). El modelo actúa como un cross-encoder que evalúa pares de contexto y respuesta para determinar si la salida de un LLM está respaldada por la evidencia recuperada o si, por el contrario, contiene información inventada o no fundamentada.

El modelo se presenta explícitamente como una línea base (baseline) dentro de un proyecto denominado RobustRAG, y se ha entrenado sobre RAGTruth, un corpus de referencia para la detección de alucinaciones en escenarios de generación aumentada por recuperación. Con 184.349.186 parámetros y un tamaño de repositorio de 0,7 GB, se trata de un modelo compacto y desplegable en infraestructura modesta, orientado a tareas de verificación y filtrado más que a generación de texto.

Su relevancia radica en que aborda uno de los problemas prácticos más acuciantes de los pipelines RAG en producción: la verificación automática de fidelidad de las respuestas. Al ser un cross-encoder especializado, permite insertar una etapa de control de calidad entre la generación y la entrega al usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-base) como cross-encoder de clasificación |
| Parametros totales | 184.349.186 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de DeBERTa-v3-base, un transformer encoder con atención desacoplada y mecanismo de atención dispersa mejorado respecto a DeBERTa-v1. Sobre esta base se ha construido un cross-encoder: el modelo recibe conjuntamente el contexto recuperado y la respuesta candidata, y produce una puntuación de clasificación orientada a detectar alucinaciones. El número de parámetros (184.349.186) es coherente con la variante base de DeBERTa-v3.

El ajuste fino se ha realizado sobre RAGTruth, un conjunto de datos diseñado específicamente para la detección de alucinaciones en respuestas de sistemas RAG. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO; tampoco se documentan innovaciones técnicas adicionales más allá del propio ajuste como cross-encoder. No se dispone de información sobre la estrategia de tokenización del par contexto-respuesta ni sobre la función de pérdida empleada.

## Capacidades

- Detección de alucinaciones en respuestas generadas por sistemas RAG mediante clasificación de pares contexto-respuesta.
- Verificación de fidelidad: evalúa si la respuesta está respaldada por el contexto recuperado.
- Clasificación binaria o de puntuación de veracidad (según el etiquetado de RAGTruth), sin generación de texto.
- Integración como etapa de filtrado o reranking en pipelines de recuperación y generación.
- No dispone de soporte documentado de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Capacidades multilingües: no disponibles según la información proporcionada.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Filtrado de respuestas en producción RAG: insertar el modelo como cross-encoder entre el generador y el usuario para descartar o marcar respuestas con baja puntuación de fidelidad, reduciendo la exposición a información inventada.
- Control de calidad en pipelines de atención al cliente: verificar que las respuestas automáticas sobre documentación interna están respaldadas por los fragmentos recuperados antes de enviarlas.
- Evaluación offline de sistemas RAG: usar el modelo como juez automático para medir la tasa de alucinación de distintas configuraciones de recuperación y generación sobre un conjunto de prueba.
- Monitorización continua en producción: puntuar muestras de tráfico real para detectar degradaciones en la calidad de las respuestas cuando cambian los índices de recuperación o los documentos fuente.
- Generación aumentada en dominios regulados: en entornos legales, sanitarios o financieros, aplicar una capa de verificación que bloquee respuestas no sustentadas por la evidencia documental recuperada.
- Investigación en detección de alucinaciones: servir como línea base reproducible (baseline) para comparar nuevas arquitecturas o estrategias de entrenamiento sobre RAGTruth.
- Reranking de candidatos: puntuar múltiples respuestas generadas para una misma consulta y seleccionar la que presente mayor fidelidad al contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,75 GB solo para pesos; en fp16, alrededor de 0,4 GB. Con overhead de activaciones y tokenizador, un entorno de 2-4 GB de VRAM es suficiente.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. También es viable en CPU para volúmenes moderados.
- Cabe holgadamente en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más.
- Opciones de despliegue: transformers (PyTorch) para inferencia directa, Text Embeddings Inference (TEI) para servir cross-encoders, o exportación a ONNX para optimización. No se documenta soporte nativo en llama.cpp u Ollama al ser un encoder de clasificación.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al tratarse de un encoder base, la latencia por par suele ser de milisegundos en GPU, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RobustRAG DeBERTa (este modelo) | 184.349.186 | no disponible | Detección de alucinaciones en RAG | MIT | HuggingFace |
| DeBERTa-v3-base (base) | ~184 M | 512 tokens (estándar de la familia) | Codificación general | MIT | HuggingFace (microsoft/deberta-v3-base) |
| Cross-encoders de reranking (p. ej. bge-reranker-base) | ~278 M | 512 tokens | Reranking de recuperación | MIT | HuggingFace |

La comparación con alternativas específicas de detección de alucinaciones no está disponible en la información proporcionada. El modelo se distingue por su especialización en la tarea de fidelidad RAG frente a los cross-encoders genéricos de reranking, que optimizan relevancia y no veracidad.

## Limitaciones y advertencias

- Se trata de una línea base declarada por el autor; no debe asumirse un rendimiento superior a alternativas más elaboradas.
- No se documentan sesgos conocidos, pero al derivar de DeBERTa-v3-base y entrenarse sobre RAGTruth, puede heredar sesgos del corpus y del modelo base.
- Riesgo de falsos negativos y falsos positivos en la detección: una puntuación baja no garantiza alucinación ni una alta garantiza fidelidad absoluta.
- Idiomas soportados no documentados; el entrenamiento sobre RAGTruth (mayoritariamente en inglés) sugiere un rendimiento limitado fuera del inglés.
- Longitud de contexto no especificada; los cross-encoders de la familia DeBERTa-v3 suelen limitarse a 512 tokens, lo que puede truncar contextos RAG largos.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte.
- El pipeline no está declarado en HuggingFace, por lo que la integración requiere cargar manualmente el modelo y el tokenizador.
- Con solo 26 descargas y 0 likes, la validación comunitaria es prácticamente nula; conviene evaluar su rendimiento en el dominio propio antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nishantwhat/robustrag-deberta
- Modelo base DeBERTa-v3-base: https://huggingface.co/microsoft/deberta-v3-base
- Dataset RAGTruth (referencia del entrenamiento): no disponible en la información proporcionada
- Paper de RAGTruth: no disponible en la información proporcionada
- Repositorio o blog del proyecto RobustRAG: no disponible en la información proporcionada
