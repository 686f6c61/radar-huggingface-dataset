# mirvo/gemma-4-12B-it

## Resumen

El modelo `mirvo/gemma-4-12B-it` es una variante instruction-tuned del modelo Gemma 4 12B Unified, desarrollado originalmente por Google DeepMind y subido a HuggingFace por el usuario `mirvo`. Se trata de un modelo denso, multimodal y encoder-free, capaz de procesar texto, imagen y audio directamente, sin necesidad de codificadores externos dedicados. Su arquitectura unificada permite que todas las modalidades fluyan a traves de un unico transformer decoder-only, lo que reduce la latencia multimodal y facilita el ajuste fino completo del modelo.

Este modelo destaca por su ventana de contexto de hasta 256K tokens, soporte nativo de function calling y un modo de razonamiento configurable. Con aproximadamente 11,96 mil millones de parametros, esta disenado para ejecutarse en GPUs de consumo y estaciones de trabajo, ofreciendo capacidades de nivel fronterizo en razonamiento, codigo y comprension multimodal. Su licencia Apache 2.0 y su formato safetensors lo hacen accesible para integracion en pipelines de produccion y experimentacion local.

La relevancia actual de este lanzamiento radica en su enfoque "unified": al eliminar los encoders de vision y audio, el modelo simplifica el despliegue en entornos locales y democratiza el acceso a la IA multimodal de alto rendimiento, compitiendo directamente con modelos propietarios de tamano similar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso con atencion hibrida (sliding window + global) |
| Parametros totales | 11.959.730.224 (~11,96B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors; se pueden generar GGUF, AWQ, etc.) |
| Idiomas soportados | Mas de 140 idiomas (segun la model card oficial) |
| Licencia | Apache 2.0 (segun el tag de HuggingFace; la model card enlaza a la licencia oficial de Gemma 4) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura densa de 48 capas con un mecanismo de atencion hibrido que intercala ventanas de atencion deslizante (sliding window) de 1024 tokens con capas de atencion global. Las capas globales utilizan claves y valores unificados (unified Keys and Values) y aplican RoPE proporcional (p-RoPE) para optimizar el uso de memoria en contextos largos. El vocabulario consta de 262K tokens.

La caracteristica mas distintiva es su naturaleza "encoder-free". A diferencia de otros modelos Gemma 4 que usan encoders dedicados (~150M para vision y ~300M para audio), el 12B Unified proyecta parches de imagen y formas de onda de audio directamente al espacio de embeddings del LLM mediante capas lineales ligeras. Esto permite ajustar todo el modelo en una sola pasada y reduce la latencia multimodal. No se han proporcionado datos especificos sobre el numero de tokens de entrenamiento ni sobre el uso de RLHF o DPO en la informacion disponible, aunque al ser una variante `it` (instruction-tuned), se asume un proceso de ajuste fino supervisado y posiblemente alineacion por preferencias.

## Capacidades

- Generacion de texto, razonamiento complejo y resolucion de problemas con modos de pensamiento configurables (thinking mode).
- Comprension multimodal nativa: entrada de texto, imagen (con soporte de resolucion y aspecto variable) y audio, con salida de texto.
- Generacion de codigo y soporte nativo de function calling, lo que permite construir agentes autonomos que interactuan con APIs y herramientas externas.
- Capacidades agénticas avanzadas, incluyendo razonamiento multi-paso y planificacion de tareas.
- Soporte multilingue en mas de 140 idiomas.
- Soporte nativo del rol `system` en el prompt, lo que permite conversaciones mas estructuradas y controlables.
- Ventana de contexto de 256K tokens, adecuada para procesar documentos extensos, codebases completos o historiales de conversacion largos.

## Casos de uso

- Atencion al cliente multimodal: el modelo puede gestionar conversaciones multi-turno que incluyen capturas de pantalla, imagenes de productos o mensajes de voz, gracias a su capacidad de procesar audio e imagen directamente y a su ventana de 256K tokens para mantener el contexto completo de la interaccion.
- Agentes autonomos de codigo: con soporte nativo de function calling, puede integrarse en pipelines de CI/CD para revisar pull requests, ejecutar tests, buscar en la base de codigo y proponer parches, todo ello de forma local sin depender de APIs externas.
- Analisis de documentos legales o academicos: su contexto de 256K tokens permite ingerir libros completos, expedientes o articulos cientificos extensos y realizar resumenes, extraccion de entidades o respuestas a preguntas sobre el contenido.
- Asistentes de productividad local: al ser un modelo denso de ~12B, puede ejecutarse en una estacion de trabajo con una RTX 4090 (con cuantizacion) para tareas de redaccion, traduccion y lluvia de ideas sin conexion a internet.
- Transcripcion y analisis de reuniones: procesa audio directamente, eliminando la necesidad de un sistema ASR separado, y puede generar actas, detectar acciones pendientes o resumir discusiones largas.
- Razonamiento visual en entornos industriales: analiza diagramas de ingenieria, graficos de datos o imagenes de control de calidad, combinando la comprension visual con el razonamiento textual para diagnosticar problemas o generar informes tecnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas comparativas de MMLU, HumanEval, GSM8K u otras metricas estandar, y no se han encontrado evaluaciones independientes de esta variante especifica (`mirvo/gemma-4-12B-it`). Se recomienda consultar el informe tecnico oficial de Gemma 4 (arxiv:2607.02770) para obtener datos de rendimiento del modelo base, aunque no se garantiza que los resultados sean identicos para este repositorio de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: el peso en bf16/fp16 de ~12B parametros ocupa aproximadamente 24 GB. El tamano del repositorio es de 54.4 GB, lo que sugiere que incluye pesos en precision mixta o archivos adicionales. Para inferencia en bf16 se recomienda una GPU con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A5000).
- Con cuantizacion a 4 bits (por ejemplo, GGUF Q4_K_M), el modelo podria caber en 8-10 GB de VRAM, haciendolo ejecutable en GPUs de consumo como la RTX 3060 12GB o RTX 4060 Ti 16GB.
- GPU recomendadas: A100 40GB, H100, RTX 4090 24GB, o GPUs de datacenter con soporte para bf16.
- Opciones de despliegue: al ser un modelo de transformers, es compatible con vLLM y TGI para inferencia de alto rendimiento. Para ejecucion local en CPU o GPU de baja VRAM, se puede convertir a GGUF y usar llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dependeran de la GPU, la cuantizacion y la longitud del contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia |
|---|---|---|---|---|
| Gemma 4 12B Unified (este) | 11,96B | 256K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 26B A4B MoE | 26B totales (4B activos) | 256K | Texto, imagen | Apache 2.0 |
| Llama 3.1 8B | 8B | 128K | Texto | Llama 3.1 License (permisiva) |
| Qwen 2.5 14B | 14B | 128K | Texto | Apache 2.0 |

El Gemma 4 12B Unified se diferencia de Llama 3.1 8B y Qwen 2.5 14B por su naturaleza multimodal nativa (audio e imagen sin encoders) y su contexto de 256K, muy superior a los 128K de sus competidores. Frente al Gemma 4 26B A4B MoE, ofrece menor huella de memoria y mayor velocidad de inferencia al ser denso, aunque con menor capacidad bruta de parametros. La licencia Apache 2.0 es mas permisiva que la de Llama 3.1, que impone restricciones de uso para usuarios con mas de 700 millones de usuarios mensuales.

## Limitaciones y advertencias

- Repositorio de terceros: el autor es `mirvo`, no Google. Aunque el modelo base es `google/gemma-4-12B`, no hay garantia de que los pesos sean identicos al original ni de que se hayan aplicado modificaciones adicionales. Se recomienda verificar la integridad de los archivos.
- Sin comunidad ni validacion: el repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de pruebas independientes o uso en produccion.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en tareas de razonamiento complejo o con contextos ambiguos.
- Sesgos no documentados: no se han publicado evaluaciones de sesgos para esta variante especifica, aunque el modelo base puede heredar sesgos de sus datos de entrenamiento.
- Licencia: aunque el tag indica Apache 2.0, la model card enlaza a la licencia oficial de Gemma 4. Es crucial revisar los terminos exactos de la licencia de Gemma 4 para asegurar el cumplimiento en aplicaciones comerciales.
- Requisitos de hardware para contexto largo: aunque soporta 256K tokens, el uso de la ventana completa requiere una cantidad significativa de VRAM (mas de 24 GB incluso con cuantizacion), lo que limita su despliegue en hardware de consumo para casos de uso extremos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mirvo/gemma-4-12B-it
- Modelo base (Google): https://huggingface.co/google/gemma-4-12B
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Informe tecnico (arXiv): https://arxiv.org/abs/2607.02770
- Documentacion oficial: https://ai.google.dev/gemma/docs/core
- GitHub de Gemma: https://github.com/google-gemma
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
