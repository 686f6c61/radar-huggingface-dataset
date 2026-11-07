# bi0/NVIDIA_Nemotron-3.5-Rerank-8B-NVFP4

## Resumen

NVIDIA_Nemotron-3.5-Rerank-8B-NVFP4 es una compilación optimizada del modelo `nvidia/Nemotron-3.5-Rerank-8B-BF16` de NVIDIA, un reranker cross-encoder de 8.000 millones de parámetros especializado en recuperación de información multilingüe y multimodal. El modelo original forma parte de la familia Nemotron 3.5 (Embed, Rerank y Parse) orientada a flujos de recuperación agéntica, y se usa para puntuar la relevancia de un par consulta-documento mediante un logit único.

Esta variante concreta, publicada por el usuario `bi0`, no es un reentrenamiento sino una conversión de hardware: aplica cuantización NVFP4 (fp4_e2m1 con bloques de 16) sobre los pesos en BF16 y compila un motor TensorRT 11.3 para la arquitectura sm_121a de la GPU Blackwell GB10 del dispositivo DGX Spark. El artefacto publicado es un engine de TensorRT de 820,47 MB (860.319.940 bytes) junto con safetensors NVFP4, empaquetado para ejecución local en ese hardware específico.

Su relevancia es práctica: demuestra el patrón de despliegue de rerankers de alta calidad en formato FP4 sobre hardware Blackwell de escritorio, reduciendo huella de memoria y aprovechando kernels TensorRT nativos. No obstante, al ser un artefacto compilado y dependiente de hardware, su portabilidad es muy limitada frente a los pesos originales en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder transformer (backbone compartido con Nemotron-3.5-Embed-8B); engine TensorRT (sm_121a) |
| Parametros totales | 8 000 millones (8B, segun nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (fp4_e2m1, bloques de 16); base en BF16 |
| Idiomas soportados | no disponible (el modelo base se describe como multilingue) |
| Licencia | no disponible |
| Formato de pesos | TensorRT .engine + safetensors NVFP4 |

## Arquitectura y entrenamiento

El modelo base es un reranker cross-encoder: a diferencia de un bi-encoder (como Nemotron-3.5-Embed-8B, que codifica consulta y documento por separado), aquí consulta y documento se codifican conjuntamente en una sola pasada, lo que permite capturar interacciones token a token entre ambos y producir un logit de relevancia. Comparte backbone con el modelo de embeddings de 8B de la misma familia, reutilizado en configuración cross-encoder.

Sobre esta variante no hay información de entrenamiento propia: no se documentan tokens de entrenamiento, composición del dataset, ni fases de RLHF/DPO. La modificación aplicada es exclusivamente de inferencia: cuantización NVFP4 de los pesos BF16 y compilación con TensorRT 11.3.0.99 para sm_121a (Blackwell GB10). No se dispone de detalles sobre calibración de la cuantización ni sobre pérdida de precisión medida.

## Capacidades

- Reranking de pares consulta-documento: genera un logit de relevancia para ordenar candidatos recuperados por un retriever de primera fase.
- Recuperación multilingüe: el modelo base está descrito por NVIDIA como orientado a question-answering multilingüe.
- Recuperación multimodal: la documentación de NVIDIA NIM indica soporte para recuperación multimodal en question-answering.
- Integración en pipelines RAG de dos fases (retrieval + rerank).
- Ejecución local acelerada en hardware Blackwell GB10 mediante TensorRT.
- No se documentan capacidades de generación de texto, tool calling, agentes autónomos ni modos de razonamiento explícito: es un modelo discriminativo de scoring, no generativo.

## Casos de uso

- Reranking en pipelines RAG: tras recuperar, por ejemplo, 100 candidatos con un bi-encoder, el cross-encoder reordena los pares consulta-documento y mejora la precisión del contexto entregado al LLM generador.
- Búsqueda documental empresarial multilingüe: ordenar resultados de un corpus con documentos en varios idiomas aprovechando la naturaleza multilingüe del modelo base.
- Question answering sobre base de conocimiento: seleccionar los pasajes más relevantes antes de pasarlos a un modelo generativo, reduciendo tokens de contexto y alucinaciones.
- Recuperación multimodal en asistentes: puntuar la relevancia de documentos que combinan texto e imagen en flujos de recuperación agéntica.
- Despliegue en el edge/escritorio con DGX Spark: servir el reranker en local sobre GB10 con el engine TensorRT precompilado, sin depender de GPU de centro de datos.
- Evaluación offline de sistemas de recuperación: usar los logits como métrica de relevancia para comparar retrievers o ajustar umbrales de corte.
- Filtrado de candidatos en agentes de retrieval: integrar el reranker como paso intermedio en un agente que consulta múltiples fuentes antes de responder.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del artefacto no incluye métricas de calidad (nDCG, MRR, Recall) ni comparaciones de latencia o throughput frente a la versión BF16, por lo que no es posible cuantificar la pérdida de precisión introducida por NVFP4.

## Requisitos de hardware

- VRAM estimada: el engine publicado ocupa 820,47 MB en disco; la memoria en GPU depende del runtime TensorRT y de los buffers de activación, no cuantificados en la información disponible.
- GPU objetivo: Blackwell GB10 (DGX Spark), arquitectura sm_121a. El engine está compilado específicamente para esa arquitectura.
- GPU recomendadas: exclusivamente NVIDIA GB10 para este artefacto; no es portable a A100, H100 ni RTX 4090 sin recompilar desde los safetensors NVFP4 o desde el modelo base BF16.
- Consumer GPU: no aplicable en la forma publicada; el engine sm_121a no ejecuta en GPUs consumer convencionales.
- Despliegue: TensorRT 11.3.0.99 con el engine `.engine`; la model card menciona un puerto de runtime activo 8093, sin documentar el servidor concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA_Nemotron-3.5-Rerank-8B-NVFP4 (este) | 8B | no disponible | TensorRT engine + safetensors NVFP4 | no disponible | Hugging Face (bi0) |
| nvidia/Nemotron-3.5-Rerank-8B-BF16 | 8B | no disponible | safetensors BF16 | no disponible | Hugging Face (NVIDIA) |
| NVIDIA Nemotron-3.5-Embed-8B | 8B | no disponible | no disponible | no disponible | Hugging Face / NVIDIA NIM |

La diferencia principal frente al base BF16 es el formato (FP4 + engine compilado) y la portabilidad, no la arquitectura. Frente al modelo de embeddings de la misma familia, la distinción es de paradigma: bi-encoder (más rápido, menor precisión) frente a cross-encoder (más costoso por par, mayor precisión).

## Limitaciones y advertencias

- Artefacto dependiente de hardware: el engine está compilado para sm_121a (GB10); no funciona en otras GPU sin recompilación.
- Sin datos de calidad: no se han publicado métricas que cuantifiquen el impacto de NVFP4 sobre la precisión del reranking.
- Licencia no disponible: no se puede confirmar el uso comercial; debe verificarse la licencia del modelo base de NVIDIA antes de producción.
- Idiomas no documentados explícitamente en este artefacto; la cobertura multilingüe se infiere del modelo base.
- Longitud de contexto no disponible: limita la planificación de pipelines con documentos largos.
- Riesgo de sesgo y alucinación: el modelo produce un logit de relevancia, no texto; el sesgo se manifestaría como ordenación sistemáticamente desfavorable de ciertos documentos, sin datos publicados al respecto.
- Sin mantenimiento aparente: 0 descargas y 0 likes en el momento de la consulta, autor individual, sin garantías de soporte.
- Naturaleza del artefacto: es una conversión de inferencia, no un modelo entrenado; no debe citarse como modelo original de NVIDIA.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bi0/NVIDIA_Nemotron-3.5-Rerank-8B-NVFP4
- Modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Rerank-8B-BF16
- Blog NVIDIA Nemotron 3.5 Embed, Rerank and Parse: https://huggingface.co/blog/nvidia/nemotron-retriever-world-class-agentic-retrieval
- Model card NVIDIA NIM (nemotron-3.5-rerank-8b): https://build.nvidia.com/nvidia/nemotron-3_5-rerank-8b/modelcard
