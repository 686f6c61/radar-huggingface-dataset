# douyamv/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B-GGUF es una colección de cuantizaciones en formato GGUF del modelo Qwen3.8-27B, desarrollado por el equipo Qwen y cuantizado por el usuario douyamv. Este modelo base presenta una arquitectura híbrida que combina Gated DeltaNet y Gated Attention, con 27,78 mil millones de parámetros y una ventana de contexto nativa de 262 144 tokens, extensible a más de un millón. Está diseñado para generación de texto, codificación, razonamiento, comprensión de visión y llamada a herramientas, todo bajo licencia Apache 2.0.

La relevancia de esta versión GGUF radica en que permite ejecutar el modelo en entornos con recursos limitados mediante motores de inferencia como llama.cpp, Ollama, LM Studio o GPT4All, ofreciendo un equilibrio entre calidad y consumo de memoria. La cuantización reduce el tamaño del modelo desde los aproximadamente 55 GB originales en FP16 hasta versiones que van desde 28 GB (Q8_0) hasta 7,9 GB (Q2_K), lo que amplía su accesibilidad a GPUs de consumo y sistemas con VRAM moderada.

El modelo base soporta inglés y chino, y su arquitectura híbrida con atención lineal promete mejoras en eficiencia de inferencia y manejo de secuencias largas, lo que lo convierte en una opción interesante para aplicaciones que requieren procesamiento de contextos extensos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27,78 mil millones |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 262 144 tokens (extensible a más de 1 millón) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponibles en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina Gated DeltaNet y Gated Attention. Gated DeltaNet es un mecanismo de atención lineal con compuertas que reduce la complejidad computacional frente a la atención softmax tradicional, mientras que la atención con compuertas mantiene la capacidad de modelar dependencias de largo alcance. Esta combinación permite manejar ventanas de contexto de 262 144 tokens con un coste computacional subcuadrático, lo que facilita el procesamiento de documentos extensos y conversaciones largas.

No se dispone de información detallada sobre el proceso de entrenamiento, como el número de tokens utilizados, la composición del dataset o si se aplicaron técnicas de RLHF o DPO. La model card del autor solo indica las capacidades generales del modelo base y no proporciona detalles adicionales sobre el entrenamiento. La cuantización GGUF se realizó con llama.cpp, sin modificar los pesos del modelo original, por lo que las características de entrenamiento se mantienen intactas.

## Capacidades

- Generación de texto: produce respuestas coherentes y contextualmente relevantes en inglés y chino.
- Razonamiento: capaz de resolver tareas de lógica, análisis y comprensión de problemas complejos.
- Codificación: genera, explica y depura código en múltiples lenguajes de programación.
- Comprensión de visión: el modelo base incluye capacidades de entendimiento de imágenes, aunque la cuantización GGUF puede afectar ligeramente a esta función si se usa con motores que no soportan multimodalidad.
- Llamada a herramientas (tool calling): soporta la invocación de funciones externas, lo que permite integrarlo en pipelines de agentes.
- Manejo de contexto largo: con 262 144 tokens de ventana nativa, puede procesar documentos extensos o mantener conversaciones de muchas vueltas sin perder el hilo.
- Multilingüe: aunque los idiomas declarados son inglés y chino, es probable que generalice a otros idiomas con menor precisión.

## Casos de uso

- Asistentes de atención al cliente: gracias a su ventana de contexto de 262 144 tokens, puede gestionar conversaciones multi-turno extensas y consultar bases de conocimiento internas sin perder información relevante. La cuantización Q4_K_M (16 GB) permite desplegarlo en servidores con una GPU de 24 GB.
- Generación de código en producción: soporta tool calling, por lo que puede integrarse en pipelines de CI/CD para generar tests, revisar código o autocompletar funciones. Su capacidad de razonamiento mejora la calidad de las sugerencias en tareas complejas de programación.
- Procesamiento de documentos legales o técnicos: la ventana de contexto amplia permite analizar contratos, informes o papers completos en una sola pasada, extrayendo resúmenes, cláusulas o datos clave sin necesidad de dividir el texto.
- Agentes autónomos multi-paso: al combinar tool calling y razonamiento, puede actuar como núcleo de un agente que planifica, ejecuta acciones y verifica resultados en entornos simulados o APIs externas.
- Traducción y localización: aunque está optimizado para inglés y chino, puede usarse para traducir entre ambos idiomas con buena calidad, aprovechando su contexto largo para mantener coherencia en documentos extensos.
- Análisis de datos y generación de informes: puede leer tablas, gráficos o datos textuales y generar informes estructurados, gracias a su capacidad de razonamiento y comprensión de visión (si se usa la versión sin cuantizar o con soporte multimodal).
- Educación y tutoría: su capacidad de razonamiento y explicación lo hace útil como tutor virtual para resolver dudas de matemáticas, ciencias o programación, manteniendo el contexto de la conversación durante largas sesiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye tablas comparativas ni métricas de rendimiento para el modelo base Qwen3.8-27B, y el repositorio de cuantización solo proporciona tamaños de archivo y descripciones cualitativas de calidad. Se recomienda consultar la página oficial del modelo base en HuggingFace para obtener datos de evaluación si estuvieran disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - Q8_0 (28 GB): requiere al menos 32 GB de VRAM para cargar el modelo completo, aunque con offloading parcial puede funcionar con menos.
  - Q6_K (21 GB): necesita aproximadamente 24 GB de VRAM.
  - Q5_K_M (19 GB): cabe en GPUs de 24 GB (por ejemplo, RTX 3090, RTX 4090).
  - Q4_K_M (16 GB): recomendado para GPUs de 16-24 GB (RTX 4080, RTX 4090, A5000).
  - Q3_K_M (13 GB): puede ejecutarse en GPUs de 16 GB (RTX 4080, RTX 3080 Ti).
  - Q2_K (7,9 GB): cabe en GPUs de 8-12 GB (RTX 3060, RTX 4070), aunque con pérdida notable de calidad.
- GPU recomendadas: para calidad óptima, A100 40/80 GB, H100 o RTX 4090. Para uso doméstico, RTX 3090/4090 con cuantización Q5_K_M o Q4_K_M.
- Compatibilidad con consumer GPU: sí, las versiones Q4_K_M y menores pueden ejecutarse en GPUs de consumo de gama media-alta.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, GPT4All, y cualquier motor compatible con GGUF (por ejemplo, KoboldCpp, text-generation-webui).
- Latencia y throughput: no se proporcionan datos concretos. En general, la arquitectura híbrida con atención lineal suele ofrecer menor latencia en contextos largos que los transformers estándar, pero dependerá del hardware y la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar Qwen3.8-27B con otros modelos de la misma categoría en esta ficha. El repositorio de cuantización no incluye comparativas, y la model card del autor no menciona modelos alternativos. Se sugiere consultar benchmarks públicos de Qwen3.8-27B frente a otros modelos de 27B (como Llama 3.1 8B, Mistral 7B o Qwen2.5 32B) en fuentes externas.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado principalmente con datos en inglés y chino, puede presentar sesgos culturales o lingüísticos en otros idiomas.
- Riesgo de alucinación: como todos los modelos de lenguaje, puede generar información falsa o inventada, especialmente en temas de actualidad o datos específicos.
- Limitaciones de idioma: aunque puede generalizar a otros idiomas, su rendimiento fuera de inglés y chino no está garantizado y puede ser significativamente inferior.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero se debe mantener la atribución y no se otorgan garantías.
- Impacto de la cuantización: las versiones Q3_K_M y Q2_K pueden degradar notablemente la calidad de las respuestas, especialmente en tareas de razonamiento complejo o generación de código.
- Capacidades de visión: la versión GGUF puede no soportar correctamente la entrada de imágenes en todos los motores de inferencia, ya que algunos no implementan el procesamiento multimodal.
- Contexto extendido: aunque el modelo soporta hasta 262 144 tokens, en la práctica el rendimiento puede degradarse en los extremos de la ventana, y la memoria necesaria para contextos muy largos puede exceder la VRAM disponible en GPUs de consumo.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/douyamv/Qwen3.8-27B-GGUF
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión FP8 (safetensors): https://huggingface.co/douyamv/Qwen3.8-27B-FP8
- Versión abliterada (sin censura): https://huggingface.co/douyamv/Qwen3.8-27B-abliterated
- Versión abliterada en GGUF: https://huggingface.co/douyamv/Qwen3.8-27B-abliterated-GGUF
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
