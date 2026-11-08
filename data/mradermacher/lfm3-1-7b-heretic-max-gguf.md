# mradermacher/LFM3-1.7B-Heretic-Max-GGUF

## Resumen

LFM3-1.7B-Heretic-Max-GGUF es una cuantización estática del modelo LFM3-1.7B-Heretic-Max, publicada por mradermacher, un perfil conocido en Hugging Face por convertir modelos a formato GGUF para su uso con llama.cpp y herramientas compatibles. El modelo base es un ajuste fino de LFM3-1.7B de Liquid AI, un modelo de texto de 1.700 millones de parámetros diseñado para agentes locales y aplicaciones especializadas, con una ventana de contexto de 256K tokens y soporte nativo de tool calling.

El interés de esta ficha reside en dos capas: por un lado, LFM3-1.7B emplea la arquitectura tri-híbrida de la familia LFM3 de Liquid AI, pensada para reducir el coste computacional del contexto largo manteniendo capacidades de agente; por otro, la variante "Heretic-Max" es un ajuste fino comunitario (publicado por MihaiPopa-1) del que no se documentan detalles de entrenamiento en la información disponible. La versión GGUF facilita el despliegue en CPU y GPU de consumo mediante cuantizaciones de 2 a 8 bits.

La relevancia actual del artefacto es práctica: ofrece un modelo pequeño con contexto muy amplio en un formato listo para inferencia local, lo que lo hace candidato para prototipos de agentes en hardware modesto. No obstante, la model card del repositorio GGUF es mínima y no incluye licencia, idiomas ni benchmarks, por lo que buena parte de las especificaciones se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tri-híbrido (LFM3, según documentación de Liquid AI del modelo base) |
| Parametros totales | 1,7 mil millones (1.7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256K tokens (modelo base LFM3-1.7B) |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas, quantize_version 2) |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B pertenece a la familia LFM3 de Liquid AI y, según su documentación, se apoya en una arquitectura "tri-híbrida" orientada a agentes locales y aplicaciones especializadas, con 256K tokens de contexto y tool calling nativo. No se dispone de detalles sobre la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron fases de RLHF o DPO en la información proporcionada.

La variante Heretic-Max es un ajuste fino publicado por MihaiPopa-1 sobre LFM3-1.7B, del que la información disponible no detalla metodología, datos ni objetivos. La contribución de mradermacher se limita a la conversión a GGUF: los metadatos de la model card indican `convert_type: hf`, `quantize_version: 2` y `output_tensor_quantised: 1`, es decir, una cuantización estática de los tensores de salida con la herramienta habitual del autor. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal más allá de lo que implique la arquitectura tri-híbrida del base.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base LFM3-1.7B.
- Tool calling / function calling nativo, según la documentación de Liquid AI para LFM3-1.7B.
- Orientación a agentes locales y aplicaciones especializadas (perfil declarado del modelo base).
- Ventana de contexto de 256K tokens, adecuada para conversaciones largas y documentos extensos.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.
- Razonamiento multi-paso y agentes: plausible por el perfil del modelo base, pero no verificado en la información disponible para esta variante.

## Casos de uso

- Agentes locales en hardware de consumo: un modelo de 1,7B en GGUF Q4_K_M ocupa del orden de 1 GB, por lo que puede ejecutarse en portátiles sin GPU dedicada y actuar como agente con tool calling en tareas de automatización personal.
- Procesamiento de documentos largos: la ventana de 256K tokens del modelo base permite resumir o extraer información de contratos, informes o transcripciones extensas sin fragmentación agresiva, aunque en la práctica el coste de atención crece con el contexto.
- Asistente de código en editor: integrado vía llama.cpp u Ollama, puede ofrecer autocompletado y explicaciones de fragmentos en un entorno de desarrollo local, sin enviar código a servicios externos.
- Prototipado rápido de pipelines RAG: su tamaño reducido y su formato GGUF permiten iterar sobre recuperación y generación en una sola máquina antes de escalar a modelos mayores.
- Chatbot de soporte con contexto conversacional largo: el contexto de 256K facilita mantener historiales multi-turno extensos, siempre que el backend de inferencia soporte esa longitud.
- Evaluación de ajustes finos comunitarios: la variante Heretic-Max permite comparar el comportamiento del base frente a un fine-tune alternativo en tareas de razonamiento y generación, usando las distintas cuantizaciones para medir el impacto de la compresión.
- Experimentación educativa: servir como modelo de referencia para estudiar arquitecturas híbridas y el efecto de la cuantización en la calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): aproximadamente 0,5 GB en Q2_K, 0,9-1,0 GB en Q4_K_M, 1,3 GB en Q6_K y 1,8 GB en Q8_0, para 1,7B parámetros.
- Con contexto largo, la caché KV puede superar ampliamente el tamaño de los pesos; a 256K tokens el consumo adicional es significativo y depende del backend y de la cuantización de la caché.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM para cuantizaciones Q4/Q5 con contexto moderado; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para contextos muy largos o mayor throughput.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 4-8 GB de VRAM para cuantizaciones de 4-8 bits con contexto estándar; también en CPU.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF como llama-cpp-python o text-generation-webui; vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requerirían los pesos originales en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Heretic-Max (GGUF, este) | 1,7B | 256K (base) | no disponible | GGUF | Cuantización comunitaria de un fine-tune |
| LFM3-1.7B (base, Liquid AI) | 1,7B | 256K | no disponible en la información | safetensors (presumible) | Modelo original con tool calling nativo |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa pequeña ampliamente soportada |
| Llama 3.2 1B Instruct | 1,2B | 128K | Llama 3.2 Community License | safetensors, GGUF | Alternativa de tamaño similar con ecosistema maduro |

La comparativa se basa en características públicas de los modelos alternativos; no se dispone de datos de rendimiento comparado para esta variante concreta.

## Limitaciones y advertencias

- La model card del repositorio GGUF es mínima: no declara licencia, idiomas ni pipeline, lo que impide confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia del modelo base LFM3-1.7B y del fine-tune Heretic-Max antes de usarlo en producción.
- Al ser un fine-tune comunitario sin documentación de entrenamiento, no se conocen los sesgos introducidos ni la calidad de alineación respecto al base.
- Riesgo de alucinación inherente a un modelo de 1,7B: su capacidad de razonamiento y de seguir instrucciones complejas es limitada en comparación con modelos mayores.
- El contexto de 256K es una capacidad del modelo base; su uso efectivo depende del backend, de la memoria disponible y de la degradación de calidad en contextos muy largos.
- Las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_S) pueden degradar notablemente la calidad de salida; para uso real se recomienda Q4_K_M o superior.
- No hay información sobre idiomas soportados; el rendimiento en castellano no está verificado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del artefacto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM3-1.7B-Heretic-Max-GGUF
- Modelo base del fine-tune: https://huggingface.co/MihaiPopa-1/LFM3-1.7B-Heretic-Max
- Perfil del autor de la cuantización: https://huggingface.co/mradermacher
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Documentación de LFM3-1.7B (Liquid AI): https://docs.liquid.ai/lfm/models/lfm3-1.7b
