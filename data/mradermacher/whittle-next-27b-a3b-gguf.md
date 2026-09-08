# mradermacher/Whittle-Next-27B-A3B-GGUF

## Resumen

Whittle-Next-27B-A3B es un modelo experimental de Mixture of Experts (MoE) desarrollado por logic65, del que mradermacher ha publicado una cuantización en formato GGUF bajo el ID `mradermacher/Whittle-Next-27B-A3B-GGUF`. El modelo total tiene 27.553.461.376 parámetros, y por su nomenclatura (27B-A3B) se deduce que podría tener alrededor de 3.000 millones de parámetros activos, aunque este dato no se confirma en la documentación disponible. La arquitectura incorpora hiperconexiones, memoria n-gram, embeddings por capa y destilación online, lo que lo sitúa como una pieza de investigación en sistemas de lenguaje con memoria y conexiones no convencionales.

Este repositorio contiene únicamente cuantizaciones GGUF estáticas (en concreto, Q4_K_S), pensadas para su ejecución en herramientas como llama.cpp u Ollama. El modelo es de carácter investigador y no se han publicado evaluaciones de rendimiento ni benchmarks en la información disponible. La licencia Apache 2.0 permite su uso comercial, pero al tratarse de un modelo experimental no se ofrecen garantías de calidad ni de comportamiento en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con hyper-connections, n-gram memory y per-layer embeddings |
| Parametros totales | 27.553.461.376 |
| Parametros activos | no disponible (la nomenclatura sugiere 3B activos, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_S (estático, sin imatrix; único cuant procesado en este repo) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura de Whittle-Next-27B-A3B, según las etiquetas del modelo, combina un diseño de Mixture of Experts con hiperconexiones (hyper-connections), memoria basada en n-gramas, embeddings por capa y destilación online. El tag `qwen4_exp` sugiere que la implementación se basa en una variante experimental de Qwen4, pero no se proporcionan detalles sobre la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO.

Esta cuantización GGUF es obra de mradermacher, no del autor original del modelo. Por tanto, la arquitectura y el proceso de entrenamiento descritos corresponden al modelo base de logic65, pero el repo actual solo contiene los pesos cuantizados. No se ha publicado información sobre la calidad de la destilación online ni sobre los efectos de la memoria n-gram en la generación.

## Capacidades

- Generación de texto en inglés, orientada a conversación según la etiqueta `conversational`.
- Compatibilidad con endpoints estándar de transformers, según la etiqueta `endpoints_compatible`.
- Soporte de inferencia local a través de formato GGUF.
- No hay datos publicados sobre razonamiento, generación de código, matemáticas, tool calling, soporte de agentes, visión o audio en la información disponible.
- La naturaleza de investigación del modelo implica que las capacidades reales no han sido evaluadas ni documentadas formalmente.

## Casos de uso

Dado que no se han publicado benchmarks ni evaluaciones de capacidades, los casos de uso se limitan a entornos de investigación y desarrollo experimental.

- Investigación sobre arquitecturas MoE: permite evaluar el comportamiento de hiperconexiones y memoria n-gram en un modelo de 27B con 3B activos, en comparación con otras arquitecturas MoE.
- Prototipado de aplicaciones conversacionales: al estar etiquetado como conversacional y ser compatible con endpoints, es útil para probar respuestas en inglés en sistemas de chat internos o laboratorios.
- Análisis de cuantización GGUF: la existencia de un único cuant Q4_K_S permite comparar la calidad de generación entre el modelo original en safetensors y la versión cuantizada, midiendo la pérdida debida a la cuantización.
- Integración en pipelines de inferencia local: gracias al formato GGUF, se puede ejecutar con llama.cpp u Ollama en estaciones de trabajo sin necesidad de infraestructura dedicada, lo que facilita pruebas rápidas.
- Evaluación de memoria y embeddings por capa: se puede utilizar el modelo como base para estudios de interpretabilidad sobre la influencia de la memoria n-gram y los embeddings por capa en la generación.
- Material didáctico: sirve como ejemplo práctico de un modelo MoE experimental como herramienta educativa para cursos sobre arquitecturas de transformadores cuantizadas o sobre el impacto de la cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Para el archivo Q4_K_S (16,0 GB) se estima un requisito de unos 16,5 GB de VRAM para la carga del modelo, más la memoria adicional para la caché KV.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB o H100 80 GB. También es posible intentar en GPUs de 20 GB, pero sin margen para contextos largos.
- Para inferencia en CPU, se recomienda al menos 32 GB de RAM para el modelo Q4_K_S, aunque el rendimiento será bajo.
- Opciones de despliegue: llama.cpp, Ollama o cualquier frontend compatible con GGUF. No se recomienda vLLM o TGI para este repo, ya que no es un formato safetensors.
- Latencia y throughput: no disponibles, al no haberse publicado mediciones.

## Comparativa con modelos similares

No se han identificado modelos comparables directos en la información disponible. Dado que se trata de un modelo de investigación sin benchmarks, no es posible establecer una comparativa objetiva con otras arquitecturas MoE como Mixtral 8x7B o modelos MoE de Qwen3, aunque comparte la categoría de Mixture of Experts. Las diferencias de arquitectura, datos de entrenamiento y evaluaciones hacen que cualquier comparación sería especulativa.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos, por lo que se desconoce su comportamiento en poblaciones o temas sensibles.
- Existe un riesgo elevado de alucinación al ser un modelo de investigación sin evaluación formal.
- La longitud de contexto es desconocida; se recomienda no asumir un soporte elevado de contexto sin verificación experimental.
- La documentación del modelo base no está disponible en este repositorio, por lo que las decisiones de diseño y datos de entrenamiento no son transparentes.
- Solo se proporciona un cuant (Q4_K_S); el uso de este cuant puede degradar la calidad de la generación en comparación con la precisión original.
- La licencia Apache 2.0 permite uso comercial, pero el estado de investigación del modelo implica que no existe garantía de idoneidad para producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Whittle-Next-27B-A3B-GGUF
- Modelo base: https://huggingface.co/logic65/Whittle-Next-27B-A3B
- Página de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Perfil de mradermacher en Hugging Face: https://huggingface.co/mradermacher
