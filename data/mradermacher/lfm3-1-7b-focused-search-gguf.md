# mradermacher/LFM3-1.7B-Focused-Search-GGUF

## Resumen

LFM3-1.7B-Focused-Search es un ajuste fino del modelo Liquid LFM3 de 1.700 millones de parametros, especializado en busqueda web como agente y uso de herramientas (tool calling). El modelo original lo desarrolla Liquid AI; esta variante concreta la publica AmaLS367 y la cuantiza a GGUF mradermacher, un conocido distribuidor de cuantizaciones para llama.cpp. El modelo parte de la arquitectura LFM3 de Liquid, una familia de transformers compactos disenados para despliegue en el borde (edge), y se ha afinado mediante DPO sobre un adaptador LoRA para mejorar el comportamiento de busqueda dirigida.

La relevancia de esta ficha radica en que combina dos tendencias actuales: por un lado, los modelos pequenos (por debajo de 2.000 millones de parametros) que caben en GPUs de consumo y dispositivos moviles; por otro, los modelos especializados en agentes de busqueda, capaces de invocar herramientas externas de forma estructurada. El resultado es un modelo que puede ejecutarse en local y utilizarse como motor de un pipeline de retrieval aumentado (RAG) o de un agente de busqueda web.

El repositorio incluye unicamente pesos en formato GGUF (desde Q2_K hasta f16) y no proporciona la model card original del autor del ajuste fino, por lo que muchos detalles de entrenamiento, datos y benchmarks no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer LFM3 (Liquid AI); detalles internos no disponibles |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (licencia propia de Liquid AI, "other" en Hugging Face) |
| Formato de pesos | GGUF (transformers como libreria declarada, custom_code) |

## Arquitectura y entrenamiento

El modelo base es LFM3 de Liquid AI, una familia de transformers de 1.700 millones de parametros orientada a inferencia eficiente en el borde. La variante Focused-Search se ha obtenido mediante un ajuste fino con DPO (Direct Preference Optimization) sobre un adaptador LoRA, segun las etiquetas del repositorio (`dpo`, `lora`). El objetivo declarado por el nombre del modelo es especializar al LFM3 en tareas de busqueda dirigida y uso de herramientas dentro de un agente.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset de preferencias, ni sobre si se aplicaron etapas adicionales de RLHF o SFT. Tampoco se documentan innovaciones tecnicas especificas del ajuste (por ejemplo, esquemas de decodificacion especulativa o atencion lineal) mas alla de lo que aporta la arquitectura LFM3 original. El repositorio es una cuantizacion estatica generada por mradermacher; no incluye pesos sin cuantizar ni el adaptador LoRA original.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte multi-turno segun la etiqueta `conversational`.
- Uso de herramientas (tool calling / function calling), segun las etiquetas `tool-use` y `search-agent`.
- Comportamiento de agente de busqueda: el ajuste DPO esta orientado a busqueda dirigida, lo que sugiere la capacidad de formular consultas y procesar resultados de un buscador.
- Razonamiento multi-paso dentro de un bucle de agente (invocacion de herramientas, lectura de resultados, nueva consulta).
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- No se documentan capacidades de vision, audio ni modo de pensamiento explicito (thinking mode).

## Casos de uso

- Agente de busqueda web local: el modelo puede integrarse en un bucle que reciba una pregunta, genere una consulta para un buscador (por ejemplo, una API de SERP) y sintetice los resultados. Su tamano de 1.700 millones de parametros permite ejecutarlo en una GPU de consumo junto al resto del pipeline.
- RAG con recuperacion iterativa: en lugar de una unica consulta al indice vectorial, el modelo puede reformular la busqueda varias veces hasta cubrir la pregunta del usuario, gracias a su especializacion en busqueda dirigida.
- Asistente de documentacion tecnica: desplegado con llama.cpp u Ollama, puede responder preguntas sobre una base de conocimiento invocando una herramienta de busqueda interna y citando fragmentos recuperados.
- Automatizacion de tareas de investigacion: extraccion de informacion de fuentes web en un pipeline por lotes, donde el modelo genera consultas y resume los resultados con bajo coste computacional.
- Prototipado de agentes en portatiles: al caber en cuantizaciones Q4 de aproximadamente 1,2 GB, permite iterar sobre disenos de agentes sin acceso a GPUs de datacenter.
- Filtrado y enrutamiento de consultas: uso como clasificador generativo que decide si una consulta requiere busqueda externa o puede responderse con conocimiento parametrico, dentro de un sistema mayor.
- Despliegue en el borde: en dispositivos con poca memoria (moviles, Raspberry Pi con suficiente RAM), el formato GGUF Q4 permite inferencia local sin conexion para tareas de busqueda en indices locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0 GB con Q3_K_S, 1,2 GB con Q4_K_M, 1,5 GB con Q6_K y 1,9 GB con Q8_0, segun los tamanos de archivo del repositorio (sin contar el contexto KV cache).
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM libre para cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor velocidad y contexto. Tambien es viable en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El campo `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI a traves de servidores de inferencia.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependeran del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Focused-Search (este) | 1.728 M | no disponible | lfm1.0 | GGUF | Especializado en busqueda y tool use |
| LFM3-1.7B (base Liquid) | ~1.700 M | no disponible | lfm1.0 | safetensors / GGUF | Modelo generalista del que deriva |
| Qwen2.5-1.5B-Instruct | 1.540 M | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 | safetensors / GGUF | Alternativa generalista con tool calling y licencia permisiva |
| Llama-3.2-1B-Instruct | 1.240 M | 128.000 tokens (segun documentacion publica de Meta) | Llama 3.2 Community License | safetensors / GGUF | Alternativa generalista de Meta con contexto largo |

La comparativa se limita a datos publicos de los modelos alternativos; no se dispone de resultados de benchmarks del modelo de esta ficha que permitan comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; el rendimiento en castellano no esta garantizado.
- No se han publicado evaluaciones de sesgo, alucinacion ni robustez para este ajuste fino.
- El ajuste DPO sobre un modelo de 1.700 millones de parametros puede degradar capacidades generales (conocimiento factual, matematicas, codigo) en favor de la tarea de busqueda; no hay datos que lo confirmen o descarten.
- La licencia lfm1.0 es una licencia propia de Liquid AI con posibles restricciones de uso comercial; es necesario revisar el archivo LICENSE antes de desplegar en produccion.
- El repositorio solo contiene cuantizaciones GGUF; no se distribuyen pesos sin cuantizar ni el adaptador LoRA, lo que limita el reentrenamiento o la fusion con otros adaptadores.
- El contexto maximo no esta documentado en la informacion disponible; asumir ventanas largas sin verificacion puede provocar degradacion.
- El modelo no ha sido validado de forma independiente (0 descargas, 0 likes en el momento de la ficha), por lo que su calidad practica es incierta.
- Al ser un agente de busqueda, la calidad final depende en gran medida de la herramienta externa (buscador, parser de resultados) y de la ingenieria del prompt.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-1.7B-Focused-Search-GGUF
- Modelo base del ajuste: https://huggingface.co/AmaLS367/LFM3-1.7B-Focused-Search
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#LFM3-1.7B-Focused-Search-GGUF
- Preguntas frecuentes del cuantizador: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
