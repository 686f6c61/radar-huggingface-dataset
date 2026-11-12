# ChatPanel/ms-marco-TinyBERT-L-2-v2

## Resumen
ChatPanel/ms-marco-TinyBERT-L-2-v2 es una copia sin modificaciones del modelo Xenova/ms-marco-TinyBERT-L-2-v2, alojada por ChatPanel para centralizar la descarga de los modelos que ejecuta su gateway. No se ha reentrenado, convertido ni editado nada: los ficheros son identicos byte a byte a los del repositorio original. El credito del modelo corresponde a cross-encoder/ms-marco-TinyBERT-L-2-v2 y a Xenova por la conversion a ONN.

El modelo subyacente es un cross-encoder TinyBERT de 2 capas afinado sobre el dataset MS MARCO para reranking de pasajes en busquedas. Dado un par consulta-documento, produce una puntuacion de relevancia que permite reordenar los resultados de un retriever inicial (tipicamente BM25 o un bi-encoder). Su interes practico radica en el tamano reducido y el formato ONN cuantizado, que lo hacen adecuado para despliegue en CPU o entornos con recursos limitados dentro de pipelines RAG.

La relevancia de esta ficha es limitada: se trata de un espejo de distribucion, no de un modelo nuevo. No hay datos publicados sobre el proceso de entrenamiento original en la informacion disponible, y el repositorio no incluye pesos en safetensors ni en GGUF, solo un artefacto ONN cuantizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (TinyBERT, cross-encoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONN cuantizado (model_quantized.onn) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | ONN cuantizado (no se incluyen safetensors ni GGUF) |

## Arquitectura y entrenamiento
El modelo base es un cross-encoder construido sobre TinyBERT-L-2-v2, una variante destilada de BERT con 2 capas. La tarea es el reranking de pasajes: la entrada es un par (consulta, documento) y la salida es una puntuacion escalar de relevancia. La arquitectura sigue el esquema clasico de BERT con atencion bidireccional sobre la concatenacion de ambos textos.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset MS MARCO utilizada, ni sobre si se aplicaron tecnicas de RLHF o DPO. El modelo original fue publicado por el equipo de cross-encoder y posteriormente convertido a ONN por Xenova; esta copia de ChatPanel no anade ninguna modificacion tecnica. El unico artefacto de pesos incluido es `onn/model_quantized.onn`, acompanado de `quantize_config.json`, `tokenizer.json`, `vocab.txt` y los ficheros de configuracion habituales.

## Capacidades
- Reranking de pasajes para busqueda: puntua la relevancia de un par consulta-documento.
- Integracion en pipelines RAG como segunda etapa de reordenacion tras un retriever inicial.
- Inferencia en CPU mediante ONN Runtime, sin necesidad de GPU.
- Ejecucion en entornos con presupuesto de memoria muy reducido gracias a la cuantizacion.
- No soporta generacion de texto, tool calling, function calling ni razonamiento multi-step.
- No dispone de capacidades multimodales (vision, audio) ni de modo de pensamiento.
- El soporte multilingue no esta documentado en la informacion disponible.

## Casos de uso
- Reranking en motores de busqueda internos: tras una recuperacion inicial con BM25, el modelo reordena los candidatos puntuando cada par consulta-documento, mejorando la precision del top-k sin coste elevado de inferencia.
- Pipelines RAG con presupuesto limitado: al ejecutarse en ONN cuantizado sobre CPU, puede integrarse en servicios sin GPU para filtrar los fragmentos recuperados antes de enviarlos al modelo generador.
- Busqueda documental en aplicaciones de escritorio: el formato ONN permite empaquetar el modelo dentro de aplicaciones locales que necesitan reranking sin depender de servicios externos.
- Filtrado de resultados en atencion al cliente: dado un conjunto de articulos de ayuda recuperados, el modelo prioriza los mas relevantes para la consulta del usuario antes de la respuesta final.
- Evaluacion de relevancia en sistemas de QA sobre documentacion tecnica: sirve como componente de scoring para validar la calidad de un retriever durante el desarrollo.
- Servicios de gateway unificado: el proposito declarado del repositorio es que el gateway de ChatPanel descargue desde un unico origen los modelos que ejecuta, simplificando la gestion de dependencias.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: no disponible; el artefacto es ONN cuantizado y esta pensado para ejecucion en CPU.
- GPU recomendadas: innecesarias para el uso previsto; el modelo puede ejecutarse en CPU.
- Cabe en GPU consumer: si, aunque no es el escenario objetivo; el formato ONN cuantizado prioriza CPU.
- Opciones de despliegue: ONN Runtime (via transformers.js, optimum o similar); no se incluyen pesos para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| ChatPanel/ms-marco-TinyBERT-L-2-v2 | no disponible (TinyBERT-L-2) | no disponible | Reranking | apache-2.0 | ONN cuantizado |
| cross-encoder/ms-marco-TinyBERT-L-2-v2 | no disponible (TinyBERT-L-2) | no disponible | Reranking | apache-2.0 | safetensors / PyTorch |
| Xenova/ms-marco-TinyBERT-L-2-v2 | no disponible (TinyBERT-L-2) | no disponible | Reranking | apache-2.0 | ONN |

Las tres entradas corresponden al mismo modelo subyacente; la diferencia es el repositorio de alojamiento y el formato de pesos. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias
- Es una copia byte a byte de un modelo upstream; no incorpora mejoras ni correcciones respecto al original.
- Solo realiza reranking de pares consulta-documento; no genera texto ni ejecuta tareas agenticas.
- No hay informacion publicada sobre sesgos, tasas de alucinacion ni cobertura idiomatica.
- El unico formato de pesos disponible es ONN cuantizado; no se incluyen safetensors ni GGUF, lo que limita su uso con frameworks que requieren esos formatos.
- La licencia apache-2.0 permite uso comercial, pero el credito del modelo corresponde a cross-encoder y a Xenova, no a ChatPanel.
- El repositorio tiene 0 descargas y 0 likes, y un tamano de 0.0 GB reportado, lo que sugiere que los artefactos pueden no estar materializados o que la metadata es incompleta.
- No se dispone de informacion sobre el proceso de entrenamiento, los datos utilizados ni las metricas de evaluacion originales.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/ChatPanel/ms-marco-TinyBERT-L-2-v2
- Modelo upstream (copia ONN): https://huggingface.co/Xenova/ms-marco-TinyBERT-L-2-v2
- Modelo base original: https://huggingface.co/cross-encoder/ms-marco-TinyBERT-L-2-v2
- Commit upstream referenciado: b76bb5e1fefd66aa36cd108622d768e86c015ff1
