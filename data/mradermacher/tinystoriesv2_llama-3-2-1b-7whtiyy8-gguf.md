# mradermacher/TinyStoriesV2_Llama-3.2-1B-7whtiyy8-GGUF

## Resumen

TinyStoriesV2_Llama-3.2-1B-7whtiyy8-GGUF es la version cuantizada en formato GGUF del modelo donoway/TinyStoriesV2_Llama-3.2-1B-7whtiyy8, un ajuste fino de Llama 3.2 1B realizado por el usuario donoway sobre el dataset TinyStories V2. El modelo resultante esta especializado en la generacion de historias cortas en ingles con vocabulario y estructuras gramaticales simplificadas, orientado a experimentacion con modelos de lenguaje de tamano reducido. La cuantizacion la ha realizado mradermacher, un autor habitual en la publicacion de versiones GGUF de modelos open source.

El modelo conserva la arquitectura transformer decoder-only de Llama 3.2 1B, con 1.235.814.432 parametros totales, y se distribuye bajo la licencia llama3.2. Esta pensado para su uso con llama.cpp y herramientas compatibles con GGUF, lo que permite ejecutarlo en hardware modesto, incluyendo CPU y GPUs de consumo. El repositorio incluye 12 variantes de cuantizacion que van desde Q2_K (0,7 GB) hasta f16 (2,6 GB).

La relevancia de esta ficha es limitada en terminos de produccion: se trata de un modelo experimental de nicho, con solo 8 descargas y 0 likes en el momento de la consulta, especializado en un dominio muy concreto (historias infantiles sinteticas) y unicamente en ingles. Es util como banco de pruebas para investigacion sobre modelos pequenos, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 1B) |
| Parametros totales | 1.235.814.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.2 1B, no confirmada) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.2 |
| Formato de pesos | GGUF (tambien disponible el modelo base en transformers/safetensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 1B, un transformer decoder-only con atencion causal estandar, normalizacion RMSNorm y activaciones SwiGLU. El modelo base fue ajustado por donoway sobre el dataset TinyStories V2, un corpus de historias cortas sinteticas generadas con vocabulario controlado, disenado originalmente para estudiar el aprendizaje del lenguaje en modelos pequenos. El identificador "7whtiyy8" sugiere un run de entrenamiento concreto, pero no se proporciona informacion sobre hiperparametros, numero de tokens de entrenamiento, composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

No se dispone de detalles sobre innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). La contribucion de esta publicacion es exclusivamente la cuantizacion estatica a GGUF mediante el pipeline de mradermacher, que segun la model card no incluye variantes weighted/imatrix en el momento de la publicacion. El proceso de cuantizacion se realizo con quantize_version 2 y output_tensor_quantised 1, segun los metadatos del README.

## Capacidades

- Generacion de texto narrativo corto en ingles, con estilo y vocabulario simplificados propios del dataset TinyStories.
- Generacion de historias infantiles o de estructura gramatical sencilla.
- Continuacion de texto con coherencia local limitada al dominio de entrenamiento.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles (unico idioma declarado).
- No se documentan capacidades de vision, audio ni modo "thinking".
- No se documenta soporte de codigo ni matematicas mas alla de lo que pueda emerger del modelo base.

## Casos de uso

- Generacion de cuentos infantiles sinteticos: el modelo esta entrenado sobre TinyStories V2, por lo que puede producir narraciones cortas con vocabulario controlado, util para generar datasets de entrenamiento o material de prueba en pipelines de NLP educativo.
- Investigacion sobre modelos pequenos: sirve como banco de pruebas para estudiar el comportamiento de Llama 3.2 1B tras un ajuste fino de dominio, comparando capacidades antes y despues del fine-tuning.
- Pruebas de cuantizacion: las 12 variantes GGUF permiten evaluar el impacto de la cuantizacion (desde Q2_K hasta f16) en la calidad de generacion sobre un dominio acotado.
- Despliegue en hardware de bajos recursos: con cuantizaciones de 0,7 a 1,4 GB, puede ejecutarse en CPU o GPUs integradas para demos locales de generacion de texto sin infraestructura dedicada.
- Generacion de datos sinteticos para aumentacion: util para producir ejemplos de texto simplificado en ingles en tareas de aumentacion de datasets o pruebas de robustez.
- Educacion y divulgacion: modelo adecuado para demostrar el funcionamiento de un LLM en talleres o clases, dado su tamano reducido y su dominio acotado y predecible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB (Q2_K) hasta 2,6 GB (f16), incluyendo overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; tambien funciona en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (GTX 1050 Ti, RTX 3050, RTX 4060, etc.), asi como en Apple Silicon y en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. El modelo base en transformers/safetensors puede servirse con vLLM o TGI, pero esta publicacion concreta es GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano (1,2B parametros) se espera un throughput alto en GPU de consumo, pero no se aportan cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TinyStoriesV2_Llama-3.2-1B-7whtiyy8-GGUF (este) | 1,24B | no disponible | llama3.2 | GGUF (12 cuantizaciones) |
| Llama 3.2 1B Instruct (Meta) | 1,24B | 128K (segun Meta) | llama3.2 | safetensors, GGUF (multiples autores) |
| TinyLlama 1.1B | 1,1B | 2K (tipico) | Apache 2.0 | safetensors, GGUF |
| Qwen2.5 0.5B | 0,49B | 32K | Apache 2.0 | safetensors, GGUF |

La comparacion con Llama 3.2 1B Instruct es la mas directa por compartir arquitectura y licencia; este modelo se diferencia por el ajuste fino de dominio sobre TinyStories V2, lo que lo hace menos versatil pero mas especializado. TinyLlama y Qwen2.5 0.5B son alternativas de tamano similar con licencias mas permisivas (Apache 2.0), relevantes si se necesita uso comercial sin restricciones adicionales.

## Limitaciones y advertencias

- Dominio muy restringido: el ajuste fino sobre TinyStories V2 limita la calidad fuera de la generacion de historias cortas y simplificadas en ingles.
- Riesgo de alucinacion elevado fuera de dominio: al ser un modelo pequeno y especializado, la coherencia en tareas generales sera baja.
- Unicamente en ingles; no se garantiza ningun rendimiento en castellano ni en otros idiomas.
- Licencia llama3.2: impone restricciones de uso comercial y requiere aceptar los terminos de la licencia de Meta; revisar antes de cualquier despliegue en produccion.
- Longitud de contexto no confirmada en la informacion disponible; no asumir los 128K de Llama 3.2 1B sin verificacion.
- Modelo experimental con muy baja adopcion (8 descargas, 0 likes); sin garantias de mantenimiento ni soporte.
- No dispone de variantes weighted/imatrix segun la model card, lo que puede afectar la calidad relativa de las cuantizaciones bajas (Q2_K, Q3_K_S) frente a versiones imatrix de otros modelos.
- No apto para tareas de codigo, matematicas, tool calling ni agentes; no se documentan estas capacidades.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/TinyStoriesV2_Llama-3.2-1B-7whtiyy8-GGUF
- Modelo base: https://huggingface.co/donoway/TinyStoriesV2_Llama-3.2-1B-7whtiyy8
- Pagina de descargas del autor: https://hf.tst.eu/model#TinyStoriesV2_Llama-3.2-1B-7whtiyy8-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
