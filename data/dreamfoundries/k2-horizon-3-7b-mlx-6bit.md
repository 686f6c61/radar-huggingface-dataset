# DreamFoundries/K2-Horizon-3.7B-MLX-6bit

## Resumen

K2-Horizon-3.7B-MLX-6bit es una conversión MLX del modelo K2-Horizon-3.7B, desarrollado por el Institute of Foundation Models (IFM). Esta versión, publicada por DreamFoundries, aplica cuantización afín de 6 bits con un tamaño de grupo de 64, optimizada para su ejecución en Apple Silicon mediante la librería MLX. El modelo original es un transformer denso de pequeño tamaño que, según vLLM Recipes, cuenta con 5.06 mil millones de parámetros almacenados (incluyendo embeddings) y soporta una ventana de contexto de hasta 524.288 tokens, una cifra excepcionalmente alta para un modelo de este tamaño. Su licencia Apache-2.0 permite uso comercial y modificación, lo que lo hace atractivo para aplicaciones que requieren procesamiento de documentos extensos en inglés sin incurrir en costes de licencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (según vLLM Recipes); arquitectura K2-Horizon con routers internos (`mlp.gate` y `self_attn.v_router`) no cuantizados |
| Parametros totales | 5.06B almacenados incluyendo embeddings (según vLLM Recipes) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens (según vLLM Recipes) |
| Tipos de cuantizacion | MLX 6-bit (afín, grupo de 64) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura del modelo se describe como un transformer denso de la familia K2-Horizon. La conversión MLX mantiene los routers K2 (`mlp.gate` y `self_attn.v_router`) sin cuantizar, lo que sugiere que el diseño original incorpora mecanismos de enrutamiento en las capas de atención y perceptrón multicapa, aunque no se detalla si se trata de un sistema de mezcla de expertos o de un mecanismo de atención selectiva. No se dispone de información sobre los datos de entrenamiento, la cantidad de tokens utilizados, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El modelo base fue publicado por el Institute of Foundation Models (IFM) bajo licencia Apache-2.0, y esta conversión fue creada por DreamFoundries con un fork de `mlx-lm` en la revisión `0f74c0e`.

## Capacidades

- Generación de texto conversacional: el modelo está diseñado para la tarea de text-generation y se presenta como conversacional.
- Contexto largo: soporta hasta 524.288 tokens, lo que permite procesar documentos extensos o mantener diálogos muy largos.
- Ejecución en Apple Silicon: gracias a la conversión MLX, puede ejecutarse de forma eficiente en dispositivos con chips de Apple (M1, M2, M3, M4) mediante la librería `mlx-lm`.
- Soporte de tool calling: no disponible en la información proporcionada.
- Capacidades multilingües: limitado al inglés según los metadatos del modelo.
- Sin capacidades de visión o audio: no se mencionan en la información disponible.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno muy largas gracias a su ventana de contexto de 524.288 tokens, lo que permite mantener el histórico completo de una interacción sin perder información relevante.
- Análisis de documentos extensos: puede resumir o extraer información de contratos, informes o expedientes de gran longitud, ya que su contexto permite cargar documentos completos sin necesidad de fragmentarlos.
- Asistente de investigación: puede procesar varios artículos científicos o informes técnicos a la vez, facilitando la comparación y síntesis de información.
- RAG (Generación aumentada por recuperación): al admitir contextos muy largos, puede integrarse en sistemas de recuperación de información donde se inserten fragmentos de una base de conocimiento extensa.
- Asistente de código en repositorios grandes: aunque no se especifican capacidades de programación, su contexto largo podría permitir cargar archivos de código completos o partes de un repositorio para responder preguntas sobre el mismo.
- Transcripción y resumen de reuniones: puede procesar transcripciones largas de reuniones o llamadas y generar resúmenes estructurados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta conversión indica explícitamente que no hay benchmarks comparativos de calidad o rendimiento para la misma.

## Requisitos de hardware

- VRAM estimada: con cuantización de 6 bits, los pesos del modelo (5.06B parámetros) ocupan aproximadamente 3,8 GB. Sin embargo, la memoria adicional para la KV cache en contextos largos (hasta 524.288 tokens) puede aumentar significativamente el consumo, dependiendo de la arquitectura y la implementación.
- GPU recomendadas: la conversión MLX está diseñada para ejecutarse en Apple Silicon (M1, M2, M3, M4). Para el modelo base, vLLM Recipes sugiere que puede ejecutarse en GPUs compatibles con vLLM, aunque no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no se dispone de datos específicos, pero por tamaño podría ejecutarse en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 4090 de 24 GB) si se usa el modelo base sin conversión MLX.
- Opciones de despliegue: MLX (Apple Silicon) para esta conversión; vLLM para el modelo base según la receta publicada. No se mencionan otras opciones como llama.cpp u Ollama.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada. La model card indica que no hay benchmarks comparativos para esta conversión, por lo que no es posible realizar una comparativa objetiva con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Idioma: el modelo solo está etiquetado para inglés, por lo que su rendimiento en otros idiomas no está garantizado.
- Sin benchmarks: al no existir evaluaciones comparativas publicadas, se desconoce su calidad relativa frente a otros modelos de tamaño similar.
- Cuantización: esta versión es una conversión MLX de 6 bits, lo que puede introducir pérdida de calidad respecto al modelo original en precisión completa.
- Routers sin cuantizar: los routers K2 (`mlp.gate` y `self_attn.v_router`) permanecen sin cuantizar, lo que puede afectar al consumo de memoria y a la velocidad de inferencia.
- Contexto largo: aunque el modelo soporta 524.288 tokens, el uso de ventanas de contexto muy largas requiere una cantidad considerable de memoria para la KV cache, lo que puede limitar su uso en hardware con poca VRAM.
- Alucinaciones: como cualquier modelo de lenguaje generativo, existe riesgo de alucinación y de generar contenido incorrecto o no verificado.
- Licencia: Apache-2.0 permite uso comercial, pero es necesario cumplir con los términos de la licencia, incluyendo la atribución adecuada al autor original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DreamFoundries/K2-Horizon-3.7B-MLX-6bit
- Modelo base: https://huggingface.co/IFM/K2-Horizon-3.7B
- Colección K2 Horizon: https://huggingface.co/collections/IFM/k2-horizon
- Receta vLLM: https://recipes.vllm.ai/IFM/K2-Horizon-3.7B
- MLXHub: https://mlxhub.app/open-model?repo=DreamFoundries/K2-Horizon-3.7B-MLX-6bit
