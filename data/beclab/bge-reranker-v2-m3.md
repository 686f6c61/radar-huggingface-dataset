# beclab/bge-reranker-v2-m3

## Resumen

Este repositorio, publicado por beclab, es una version unificada para inferencia del modelo de re-ranking BGE-Reranker-v2-m3. No se trata de un modelo nuevo, sino de una exportacion completa a dos formatos de runtime: OpenVINO IR FP32 y ONNX FP32. Esta orientado a su uso desde RerankServer o llm-init, con el nombre logico `bge-reranker-v2-m3` y el modo `rerank`.

El problema que resuelve es la integracion de un reranker multilingue en pipelines de recuperacion aumentada (RAG) sin necesidad de convertir manualmente los pesos. El repositorio esta estructurado en dos subarboles completos: `openvino/` para aceleracion con hardware Intel (CPU o GPU) y `onnx/` para ejecucion en CPU, NVIDIA o NVIDIA GB10. La ausencia de exports FP16 es una decision de diseno que simplifica el despliegue, aunque aumenta el consumo de memoria respecto a versiones cuantizadas.

La relevancia actual radica en que cada vez mas sistemas RAG necesitan un componente de re-ranking eficiente y portable. Esta version cubre ese nicho al ofrecer el modelo BGE-Reranker-v2-m3 listo para dos runtimes populares, sin depender de PyTorch en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (sin cuantizar; no incluye exports FP16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "misma que BAAI/bge-reranker-v2-m3") |
| Formato de pesos | OpenVINO IR (.xml/.bin), ONNX (.onnx/.onnx_data) |

## Arquitectura y entrenamiento

La informacion disponible no especifica la arquitectura interna ni los detalles de entrenamiento del modelo. El nombre del repositorio y la estructuracion de los artefactos indican que se trata de una exportacion del modelo BAAI/bge-reranker-v2-m3 al formato OpenVINO IR y ONNX. La model card solo describe la organizacion de los ficheros y el modo de uso con RerankServer y llm-init. No se proporcionan datos sobre tokens de entrenamiento, composicion del dataset ni innovaciones tecnicas. Para esos detalles, es necesario consultar el repositorio original de BAAI.

## Capacidades

- Re-ranking de pasajes o documentos dentro de un pipeline de recuperacion: toma una consulta y un conjunto de candidatos y devuelve una puntuacion de relevancia para cada uno.
- Integracion con RerankServer mediante las variables `RERANK_RUNTIME` (`openvino` o `onnx`) y `ACCELERATOR` (`intel-gpu` para OpenVINO; `cpu`, `nvidia` o `nvidia-gb10` para ONNX).
- Integracion con llm-init mediante `MODEL_SOURCE=hf://beclab/bge-reranker-v2-m3`, `MODEL_NAME=bge-reranker-v2-m3` y `MODEL_MODE=rerank`.
- Soporte de tokenizer ubicado en el mismo subdirectorio que el modelo (`tokenizer.json`).
- Segun la documentacion de BGE, el modelo original BGE-Reranker-v2-m3 esta recomendado para escenarios multilingues, aunque la model card no especifica la lista de idiomas.
- No es un modelo generativo: no soporta generacion de texto, tool calling, agentes ni vision.

## Casos de uso

- Mejora de un buscador semantico interno: el modelo reordena los resultados de una consulta de embedding para mostrar primero los documentos mas relevantes, reduciendo la carga de trabajo del motor de recuperacion.
- Filtrado de contextos en pipelines RAG multi-turno: antes de inyectar texto a un LLM, se pasan los candidatos por este reranker para seleccionar solo los pasajes con mayor puntuacion, evitando ruido en la ventana de contexto.
- Búsqueda multilingue en intranets corporativas: al estar recomendado por el proyecto BGE para uso multilingue, es adecuado para consultas en varios idiomas sobre documentacion heterogenea.
- Clasificacion de resultados en un chatbot de atencion al cliente: se utiliza como capa de re-ranking para elegir la respuesta de una base de conocimiento que contiene multiples posibles respuestas.
- Integracion en una API de busqueda con RerankServer desplegado en un cluster con GPUs NVIDIA: se usa el runtime `onnx` con `ACCELERATOR=nvidia` para servir re-ranking en tiempo real.
- Despliegue en entornos con hardware Intel sin GPU dedicada: mediante el runtime OpenVINO y `ACCELERATOR=intel-gpu`, se aprovecha la GPU integrada o la CPU para ejecutar el modelo en un servidor de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano del repositorio: 4.6 GB en disco, que engloba los dos arboles de formatos completos (OpenVINO y ONNX). No se especifica el peso por formato.
- Al ser exports FP32, el consumo de memoria es superior al de una version FP16 o cuantizada. No se detalla la VRAM estimada.
- Para OpenVINO: se recomienda entorno con hardware Intel (CPU, iGPU o dGPU). La variable `ACCELERATOR=intel-gpu` indica que esta pensado para aceleracion por GPU Intel.
- Para ONNX: soporta `cpu`, `nvidia` y `nvidia-gb10`. Puede ejecutarse en CPU sola o en GPUs NVIDIA, incluyendo la plataforma GB10.
- Las opciones de despliegue documentadas son RerankServer y llm-init, utilizando `RERANK_RUNTIME` y `MODEL_MODE=rerank` respectivamente. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Runtime | Licencia | Tamano repo |
|---|---|---|---|---|
| beclab/bge-reranker-v2-m3 | OpenVINO IR, ONNX | RerankServer / llm-init | no disponible | 4.6 GB |
| BAAI/bge-reranker-v2-m3 | no disponible en esta informacion | no disponible | no disponible | no disponible |

No hay mas datos comparables en la informacion proporcionada. Se recomienda consultar el repositorio original de BAAI para especificaciones completas.

## Limitaciones y advertencias

- Los metadatos de HuggingFace no incluyen la licencia. La model card remite a la licencia del modelo original BAAI/bge-reranker-v2-m3, pero esta no aparece explicitamente en el repositorio. Antes de usar el modelo en produccion, es obligatorio verificar la licencia en el repositorio original.
- No se incluyen exports FP16, por lo que el uso de memoria es mayor que en versiones cuantizadas. Esto puede ser un factor limitante en entornos con VRAM reducida.
- La model card no especifica los idiomas soportados ni la longitud de contexto. La documentacion externa de BGE lo recomienda para uso multilingue, pero no hay una lista concreta en este repositorio.
- No se aportan resultados de benchmarks ni evaluaciones en este repositorio, por lo que el rendimiento relativo debe verificarse con datos del modelo original.
- El modelo es exclusivamente de re-ranking. No es un modelo generativo, por lo que no puede utilizarse para responder preguntas ni generar texto.
- Al tener 0 descargas y 0 likes en el momento de la consulta, es un proyecto incipiente que puede estar sujeto a cambios sin aviso.
- La documentacion indica que `MODEL_DIR` debe apuntar al subdirectorio de formato (`openvino/` o `onnx/`), no a la raiz del repositorio. Un error en la ruta provocara fallos de carga.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/beclab/bge-reranker-v2-m3
- Modelo original de referencia: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Documentacion de la serie BGE-Reranker-v2: https://bge-model.com/bge/bge_reranker_v2.html
