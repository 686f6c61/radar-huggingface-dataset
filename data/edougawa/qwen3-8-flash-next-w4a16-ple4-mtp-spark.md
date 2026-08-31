# edougawa/Qwen3.8-Flash-Next-W4A16-PLE4-MTP-Spark

## Resumen

El modelo `edougawa/Qwen3.8-Flash-Next-W4A16-PLE4-MTP-Spark` es una versión cuantizada del modelo multimodal de Qwen, `Qwen/Qwen3.8-Flash-Next`, desarrollado por el usuario de HuggingFace edougawa. El modelo base es un MoE ultra-sparse de 125B parámetros lógicos (con 6B activos por token) más una tabla de embedding n-gram (PLE) de 51.2B parámetros, lo que suma 176B parámetros lógicos. Esta variante aplica una cuantización heterogénea INT4/BF16 (esquema W4A16, grupo 128, RTN) que reduce el peso almacenado a 88.39 GiB, conservando la torre de visión, el módulo MTP (Multi-Token Prediction) y el embedding PLE, con el objetivo principal de ejecutarse en hardware NVIDIA DGX Spark (GB10) con memoria unificada limitada.

La relevancia de este modelo radica en que permite desplegar un sistema de última generación con ventana de contexto nativa de 262.144 tokens y capacidades multimodales en un equipo de escritorio de gama alta, sin necesidad de un clúster de GPUs. La cuantización es data-free (RTN sin calibración), lo que simplifica la reproducción, pero a cambio muchas validaciones de rendimiento y compatibilidad no se han realizado, como se detalla en la model card. Es una opción interesante para desarrolladores que quieran experimentar con arquitecturas híbridas GDN+QSA y decodificación especulativa en entornos locales, siempre que acepten los riesgos asociados a la falta de validación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra-sparse híbrida: GDN (Gated DeltaNet) en 3 de cada 4 capas + QSA (Qwen Sparse Attention) en la cuarta capa, con embedding PLE (n-gram) de 51.2B parámetros, módulo MTP y torre de visión |
| Parametros totales | 135.199.766.419 (almacenados en safetensors); 179.999.981.459 lógicos retenidos (incluye PLE) |
| Parametros activos | 6B por token (según vLLM recipes) |
| Longitud de contexto | 262.144 tokens nativos; extensión YaRN a 393.216 tokens (no validada) |
| Tipos de cuantizacion | INT4 W4A16 (grupo 128, RTN simétrico) para la mayoría de GEMMs; BF16 para tensores protegidos (visión, routers, normas, sesgo, estado recurrente); PLE en INT4 empaquetado por fila con escala FP16 |
| Idiomas soportados | No disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (contenedor), cuantización INT4/BF16 heterogénea |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-Flash-Next` introduce una arquitectura híbrida que combina dos mecanismos de atención. Tres de cada cuatro capas utilizan Gated DeltaNet (GDN), un mecanismo de atención lineal recurrente que comprime el historial en un estado oculto, reduciendo el coste computacional en contextos largos. La cuarta capa emplea Qwen Sparse Attention (QSA), que permite una recuperación precisa de información a larga distancia mediante atención sparse. Esta combinación busca equilibrar eficiencia y capacidad de razonamiento profundo. Además, el modelo incorpora un embedding PLE (n-gram) de 51.2B parámetros que actúa como memoria asociativa adicional, y un módulo MTP (Multi-Token Prediction) que predice varios tokens a la vez para acelerar la decodificación mediante speculative decoding.

La variante cuantizada conserva todos estos componentes. La cuantización se realizó con la librería `compressed-tensors` 0.18.0, usando RTN (Round-To-Nearest) sin calibración (data-free), con grupo de 128 y escala simétrica. Los tensores considerados sensibles (routers de selección de expertos, normalización, sesgos, estado recurrente del GDN y la torre de visión completa) se mantienen en BF16 o FP32 para minimizar la degradación. El embedding PLE se empaqueta en INT4 por filas con escala FP16. No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, si hubo RLHF/DPO), más allá de que es un modelo de la serie Qwen3.8 desarrollado por Alibaba.

## Capacidades

- Procesamiento multimodal: el modelo base es de tipo image-text-to-text, y la torre de visión y el proyector se conservan íntegramente en BF16 en esta versión cuantizada, lo que permite entrada de imágenes junto con texto.
- Generación de texto y razonamiento avanzado: al ser un modelo de 125B parámetros con 6B activos, ofrece capacidades de razonamiento complejo, matemáticas y código, según lo reportado para la serie Qwen3.8.
- Preservación del pensamiento (preserved thinking): el modelo base mantiene los bloques de razonamiento de todos los mensajes históricos, lo que facilita tareas de agente donde la consistencia de decisiones es crítica.
- Decodificación especulativa: el módulo MTP se conserva, lo que permite acelerar la generación de tokens al predecir múltiples tokens simultáneamente.
- Ventana de contexto larga: 262.144 tokens nativos, ampliable a 393.216 con YaRN (aunque esta extensión no está validada en la versión cuantizada).
- Embedding PLE: la tabla n-gram de 51.2B parámetros se retiene empaquetada en INT4, proporcionando memoria asociativa adicional que puede mejorar la precisión en tareas de recuperación de conocimiento.

## Casos de uso

- Análisis de documentos extensos en local: con una ventana de 262K tokens, el modelo puede procesar libros técnicos completos, expedientes legales o historiales clínicos de una sola pasada, sin necesidad de dividir el texto. La cuantización permite ejecutarlo en un DGX Spark, lo que lo hace viable para despachos o consultorías que requieran confidencialidad de datos.
- Asistente de investigación multimodal: dado que conserva la visión, puede analizar figuras, gráficos y diagramas junto con el texto de artículos científicos, ayudando a investigadores a extraer conclusiones de papers largos sin depender de APIs externas.
- Agente conversacional con memoria persistente: la preservación del pensamiento y el contexto largo permiten mantener conversaciones coherentes durante horas, ideal para asistentes virtuales de soporte técnico o tutoría personalizada donde el usuario retoma temas previos.
- Generación y revisión de código en entornos air-gapped: equipos de desarrollo en sectores regulados pueden usar el modelo para autocompletar, revisar y refactorizar código en repositorios grandes, beneficiándose de la ventana de contexto y la capacidad de razonamiento, sin enviar datos a la nube.
- Prototipado rápido de aplicaciones de IA: desarrolladores independientes o startups pueden desplegar este modelo en una estación de trabajo con memoria unificada de 128 GB (DGX Spark o similar) para iterar sobre ideas de producto sin incurrir en costes de inferencia en la nube.
- Investigación en arquitecturas de atención híbrida: al ser un modelo abierto con pesos disponibles, es útil para estudiar el comportamiento de GDN+QSA en tareas de recuperación de largo plazo, así como para evaluar el impacto de la cuantización INT4 en componentes como MTP y PLE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones, y las validaciones de rendimiento (visión, MTP, contexto largo) están marcadas como "Not tested". No se dispone de datos comparativos con el modelo base sin cuantizar ni con otras alternativas.

## Requisitos de hardware

- VRAM estimada: el peso almacenado ocupa 88.39 GiB. Asumiendo memoria unificada, la model card recomienda aproximadamente 105 GiB de memoria usable tras la reserva del sistema. No se especifica VRAM dedicada para KV cache, pero con contexto de 262K tokens se necesitará una cantidad adicional significativa (FP8 E4M3 preferido si está soportado).
- GPU recomendadas: el objetivo principal es NVIDIA DGX Spark (GB10, arquitectura SM121). No se ha validado en otras GPU, aunque la model card menciona H200 como referencia sin pruebas. En GPUs de consumo (RTX 4090, 24 GB) no cabe, ya que el peso supera los 88 GiB.
- Si cabe en consumer GPU: no, salvo en sistemas con memoria unificada grande como Apple Silicon con 128 GB o más, aunque no hay validación oficial para esa plataforma.
- Opciones de despliegue: Transformers 5.16.1 (con parches incluidos en el repo), vLLM y SGLang no probados y requieren parches incluidos. No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 176B lógicos (125B + 51B PLE) | 262K | BF16 (sin cuantizar) | qwen-community-1.0 | HuggingFace |
| Qwen3.8-Flash-Next-W4A16-PLE4-MTP-Spark (este modelo) | 135.2B almacenados (179.9B lógicos) | 262K (ext. 393K no validada) | INT4/BF16 heterogéneo | qwen-community-1.0 | HuggingFace |
| Qwen3.8 (serie densa, según GitHub) | No disponible | No disponible | No disponible | qwen-community-1.0 | GitHub |

La comparativa se limita al modelo base y a la serie Qwen3.8 en general, ya que no se dispone de datos de otras alternativas comparables en la información proporcionada. La principal diferencia entre el modelo base y esta variante es el tamaño del peso (88.39 GiB frente a varios cientos de GiB en BF16) y la pérdida de precisión potencial asociada a la cuantización, que no ha sido cuantificada.

## Limitaciones y advertencias

- Validaciones incompletas: la model card indica explícitamente que la validación de visión, MTP, contexto largo y compatibilidad con runtimes no se ha realizado ("Not tested"). El único test que pasa es la validación estructural del checkpoint.
- Requiere parches específicos: los pesos PLE y el token embedding usan un formato INT4 empaquetado por filas que necesita integración con el runtime. Transformers 5.16.1 requiere parches incluidos en el repo; vLLM y SGLang no están soportados sin parches adicionales.
- Degradación potencial por cuantización: aunque los tensores sensibles se protegen en BF16, la cuantización INT4 de los expertos y del embedding PLE puede afectar a la calidad de las respuestas, especialmente en tareas de razonamiento complejo o recuperación de conocimiento. No hay datos que cuantifiquen esta pérdida.
- Riesgo de alucinación y sesgos: al ser un modelo de 176B parámetros sin evaluación publicada en esta versión, existe riesgo de alucinaciones y sesgos no caracterizados, especialmente en dominios especializados.
- Restricciones de licencia: la licencia qwen-community-1.0 es una licencia comunitaria de Qwen; es necesario revisar sus términos específicos para uso comercial, aunque no se detallan en la información proporcionada.
- Soporte limitado de hardware: el modelo está diseñado para DGX Spark/GB10. Ejecutarlo en otras plataformas puede requerir adaptaciones no documentadas y no se garantiza su funcionamiento.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/edougawa/Qwen3.8-Flash-Next-W4A16-PLE4-MTP-Spark
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Guía de vLLM para el modelo base: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Documentación de Unsloth para ejecución local: https://unsloth.ai/docs/models/qwen3.8-next
- Repositorio GitHub de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
