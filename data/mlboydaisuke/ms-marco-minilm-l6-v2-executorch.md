# mlboydaisuke/ms-marco-MiniLM-L6-v2-ExecuTorch

## Resumen

El modelo `mlboydaisuke/ms-marco-MiniLM-L6-v2-ExecuTorch` es una conversión del cross-encoder `cross-encoder/ms-marco-MiniLM-L6-v2` al formato ExecuTorch, diseñado para ejecución on-device (dispositivos móviles y edge). Desarrollado por el usuario mlboydaisuke, este modelo resuelve la segunda etapa de un pipeline de recuperación: un modelo de embeddings obtiene candidatos baratos y este cross-encoder puntúa cada par (consulta, documento) para reordenar los resultados con precisión. La relevancia actual radica en que permite ejecutar reranking de alta calidad en dispositivos con recursos limitados, gracias a la optimización XNNPACK y a la compilación a ExecuTorch.

El modelo base tiene 22,7 millones de parámetros, 6 capas BERT con hidden size 384, y una longitud de contexto de 512 tokens. Se ofrecen tres variantes de compilación: fp32 (91 MB), fp16 (45,6 MB) y Core ML para iOS (45,7 MB). Todas mantienen el orden de ranking respecto al eager, con errores máximos de 0,0194 logits. La licencia es Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (cross-encoder) con 6 capas, hidden 384 |
| Parametros totales | 22,7 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | fp32, fp16 (XFPACK), Core ML fp16 (iOS) |
| Idiomas soportados | no disponible (modelo base entrenado principalmente con texto en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | PTE (ExecuTorch), basado en safetensors del modelo original |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en la arquitectura BERT de 6 capas con hidden size 384. El modelo base `cross-encoder/ms-marco-MiniLM-L6-v2` fue entrenado sobre el dataset MS MARCO para la tarea de reranking de pasajes. No se dispone de detalles específicos sobre el número de tokens o el proceso de entrenamiento (RLHF/DPO) en la información proporcionada. La innovación de esta variante reside en su compilación a ExecuTorch con backend XNNPACK, lo que permite una ejecución eficiente en CPU de dispositivos móviles y de bajo consumo, manteniendo una fidelidad alta respecto al modelo original. Además, la conversión incluye una versión Core ML para iOS que aprovecha el acelerador neuronal de Apple.

## Capacidades

- Clasificación de texto y reranking: dado un par (consulta, documento), devuelve un logit de relevancia (fp32) que puede transformarse con sigmoid a una probabilidad.
- Ejecución on-device: compilado con ExecuTorch y XNNPACK, diseñado para dispositivos móviles y edge.
- Tres variantes de precisión: fp32 (mayor exactitud), fp16 (menor tamaño) y Core ML (optimizado para iOS).
- Preserva el orden de ranking del modelo eager en todas las variantes, con errores máximos de 0,0194 logits.
- Requiere explícitamente `token_type_ids` para distinguir la consulta del documento; alimentar ceros degrada gravemente el rendimiento (caída de 11,35 logits).
- No es un modelo generativo: no produce texto, solo puntuaciones de relevancia.

## Casos de uso

- Búsqueda semántica en dispositivos móviles: el modelo puede reordenar los resultados de una búsqueda local (por ejemplo, en una app de contactos o notas) después de que un modelo de embeddings haya preseleccionado candidatos. Su tamaño compacto permite ejecución en tiempo real en un smartphone.
- RAG (Retrieval-Augmented Generation) en edge: como segunda etapa de un pipeline de generación aumentada por recuperación, mejora la precisión de los documentos recuperados antes de pasarlos al LLM, reduciendo costes de latencia al evitar consultas a servidores.
- Asistentes virtuales con búsqueda local: el asistente puede reordenar respuestas de una base de conocimiento local (preguntas frecuentes, documentación) según la consulta del usuario, con un tiempo de respuesta de milisegundos.
- Filtrado de correos o mensajes: clasificar la relevancia de un mensaje respecto a una consulta de búsqueda dentro de un cliente de correo, permitiendo priorizar correos importantes sin conexión.
- Sistemas de recomendación de documentos: reordenar una lista de artículos o noticias según la intención del usuario, funcionando completamente en el dispositivo sin enviar datos a servidores.
- Aplicaciones de atención al cliente offline: un chatbot que utilice una base de conocimiento local puede puntuar y seleccionar las respuestas más pertinentes antes de mostrarlas, funcionando sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta variante ExecuTorch en la información disponible. La model card solo reporta tiempos de inferencia en un Mac arm64 (single process, 10 runs, 512 tokens por par): 27,3 ms para fp32, 53,8 ms para fp16 y 6,7 ms para Core ML. En el mismo hardware, el modelo eager en PyTorch tarda 14,7 ms. No hay comparaciones con otros modelos en términos de MRR o precisión.

## Requisitos de hardware

- Tamaño de los artefactos: 91,0 MB (fp32), 45,6 MB (fp16), 45,7 MB (Core ML). Esto cabe en cualquier dispositivo con almacenamiento mínimo.
- VRAM estimada: al ser un modelo de 22,7 M de parámetros, la memoria de trabajo es inferior a 100 MB en fp32 y menor en fp16. Es adecuado para GPUs integradas, SoCs móviles y CPUs con soporte AVX2.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU de móviles (ARM) y en GPUs de consumo como la RTX 4090 (aunque sería sobrecapacidad). Para despliegue en servidor se puede usar cualquier GPU moderna.
- Opciones de despliegue: el formato PTE se ejecuta con ExecuTorch runtime; la variante Core ML se integra en apps iOS. No se mencionan soporte para vLLM, llama.cpp u Ollama, ya que es un modelo de clasificación, no generativo.
- Latencia y throughput: en Mac arm64 (mediana de 10 runs), 27,3 ms para fp32, 53,8 ms para fp16 y 6,7 ms para Core ML. En el mismo equipo, el eager en PyTorch tarda 14,7 ms. Estos tiempos son para un par consulta-documento con 512 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MRR@10 (MS MARCO) | Licencia | Formato |
|---|---|---|---|---|---|
| ms-marco-MiniLM-L6-v2 (base) | 22,7 M | 512 | 39,01 | Apache-2.0 | safetensors, ONNX, etc. |
| ms-marco-MiniLM-L6-v2-ExecuTorch (este) | 22,7 M | 512 | no publicado | Apache-2.0 | PTE (ExecuTorch) |
| ms-marco-MiniLM-L12-v2 (base) | 33,4 M | 512 | 39,02 | Apache-2.0 | safetensors, ONNX |

Según la fuente web, el modelo L12 es marginalmente más preciso (39,02 vs 39,01 MRR@10) pero el doble de lento (960 vs 1800 docs/seg). La variante ExecuTorch mantiene el mismo rendimiento que su base, pero optimizada para despliegue on-device.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce un logit de relevancia. No puede generar texto, resúmenes ni respuestas.
- Longitud de contexto limitada a 512 tokens; pares más largos deben truncarse, lo que puede afectar la precisión en documentos extensos.
- El modelo base fue entrenado principalmente con datos en inglés (MS MARCO). No se ha validado su comportamiento en otros idiomas, aunque los ejemplos muestran que puede manejar texto en japonés con menor rendimiento.
- Requiere el input `token_type_ids` correcto; si se alimentan ceros en esa entrada, el rendimiento colapsa (caída de 11,35 logits). Esto es un punto crítico en integraciones.
- No se incluye cuantización int8 dinámica porque el tamaño resultante (58,8 MB) supera al fp16 (45,6 MB). Si se necesita menor tamaño, se debe usar fp16.
- Al ser un modelo de clasificación, no hay riesgo de alucinación generativa, pero sí de errores de ranking en casos ambiguos o con poco contexto.
- Licencia Apache-2.0, permite uso comercial, pero se recomienda citar la fuente y revisar las condiciones del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlboydaisuke/ms-marco-MiniLM-L6-v2-ExecuTorch
- Modelo base: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2
- Repositorio de scripts de conversión: https://github.com/john-rocky/executorch-models
- Documentación de ExecuTorch: https://pytorch.org/executorch/ (no incluido en la búsqueda, pero relevante)
