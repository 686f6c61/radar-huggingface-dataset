# Deepexp/Spark-X2.6-1.7B-uncensored

## Resumen

Spark-X2.6-1.7B-uncensored es una variante del modelo Spark-X2.6-1.7B, un modelo de lenguaje compacto de 1.700 millones de parametros desarrollado por XHToken y publicado originalmente como modelo base y post-entrenado. Esta version concreta ha sido modificada por el usuario Deepexp mediante la herramienta Tema_Q-Abliterated v1.1.1, que aplica una tecnica de abliteracion (ablacion de la direccion de rechazo en los pesos) para eliminar el comportamiento de negativa a responder, manteniendo la calidad general del modelo original.

El modelo base Spark-X2.6-1.7B es la segunda entrega de la serie Spark-X2.6, despues de Spark-X2.6-4B, y esta disenado especificamente para despliegue en dispositivo (on-device). Mantiene exactamente la misma arquitectura que Spark-X2.5-1.7B y obtiene sus mejoras mediante un post-entrenamiento mas refinado, con avances en codigo, uso de agentes, contexto largo, multilingue y razonamiento. Incluye un presupuesto de pensamiento configurable en tres niveles (ninguno, bajo, alto).

La relevancia de esta ficha radica en que combina un modelo compacto y eficiente para inferencia local con una modificacion de pesos que elimina los rechazos, lo que puede interesar a desarrolladores que necesitan un modelo sin filtros de negativa para tareas de investigacion o generacion creativa, aunque con las advertencias de seguridad y licencia correspondientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (misma arquitectura que Spark-X2.5-1.7B; detalles internos de capas y atencion no disponibles) |
| Parametros totales | 1.707.657.216 (1,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base declara capacidades de contexto largo, pero sin cifra concreta) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el autor indica compatibilidad con conversion a llama.cpp y uso en vLLM |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Transformers; compatible con conversion a GGUF via llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Spark-X2.6-1.7B es un transformer decoder-only de 1,7 mil millones de parametros. Segun la model card del autor original, conserva exactamente la misma arquitectura que Spark-X2.5-1.7B y logra sus mejoras de capacidad exclusivamente mediante un post-entrenamiento mejorado, no mediante cambios estructurales. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; la model card menciona "post-trained model" y mejoras en codigo, agentes, contexto largo, multilingue y razonamiento, pero sin cifras concretas.

La innovacion principal de esta variante es el proceso de abliteracion aplicado con Tema_Q-Abliterated v1.1.1, que usa el algoritmo SCAPE. Este metodo busca una direccion de rechazo por capa y la ablaciona de los pesos en las proyecciones `attn.o_proj` y `mlp.down_proj`, con parametros de peso maximo de 1,634 y 1,448 respectivamente, posiciones de peso maximo en 14,0 y 16,61, y kernels de forma coseno. El objetivo surrogate SCAPE evalua cada candidato de busqueda aproximadamente 49 veces mas rapido que la evaluacion por generacion completa, lo que permite ejecutar la busqueda completa en CPU. El resultado reportado es de 1 rechazo en 100 generaciones completas, con una divergencia KL de 0,0062 respecto al modelo base y una comprobacion de colapso satisfactoria.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento con presupuesto de pensamiento configurable en tres niveles: ninguno, bajo y alto (controllable thinking budget).
- Capacidades de codigo y ingenieria de software, con mejoras sustanciales segun el autor del modelo base.
- Uso de herramientas (tool use) y planificacion multi-paso para flujos de agente.
- Razonamiento sobre contextos extendidos (long-context), aunque sin cifra concreta publicada.
- Capacidades multilingues limitadas a ingles y chino.
- Comportamiento sin rechazos (uncensored) gracias a la abliteracion: el modelo no activa negativas ante peticiones que el modelo base rechazaria.
- Compatibilidad con transformers (requiere `trust_remote_code=True` y transformers 4.57.1), vLLM y conversion a llama.cpp.

## Casos de uso

- Generacion creativa sin restricciones: escritura de ficcion, dialogos y narrativa que aborden temas sensibles o violentos sin que el modelo active negativas, aprovechando la abliteracion con solo 1 rechazo por cada 100 generaciones.
- Investigacion sobre alineacion y seguridad: estudio comparativo del comportamiento de rechazo entre el modelo base y esta variante, midiendo el efecto de la ablacion sobre la calidad (KL de 0,0062) y sobre las respuestas ante prompts sensibles.
- Asistente conversacional local en ingles o chino: despliegue en dispositivo con inferencia eficiente, adecuado para aplicaciones de chat multi-turno en hardware de consumo.
- Generacion de codigo en pipelines locales: el modelo base declara mejoras en codigo y tool use; esta variante puede integrarse en entornos de desarrollo con llamadas a funciones, aunque sin garantias de calidad del modelo original en tareas de seguridad.
- Agentes multi-paso en dispositivo: planificacion y uso de herramientas en escenarios de automatizacion local, con el nivel de pensamiento ajustable para equilibrar latencia y calidad.
- Procesamiento de documentos largos en chino o ingles: resumen y extraccion de informacion sobre contextos extendidos, apoyandose en las capacidades de contexto largo del modelo base.
- Prototipado rapido de aplicaciones LLM: al ser un modelo de 1,7B con licencia Apache 2.0 y pesos safetensors, sirve para validar pipelines antes de escalar a modelos mayores.

## Benchmarks y rendimiento

La model card del modelo base menciona una comparativa grafica con Qwen3.5-2B, MiniCPM-2B y LFM2.5-2.6B en tareas de agente, codigo, matematicas, generales y de conocimiento, pero no se proporcionan los valores numericos en la informacion disponible. Para la variante abliterada solo se reportan las metricas del proceso de abliteracion:

| Metrica | Valor |
|---|---|
| Rechazos (generacion completa) | 1/100 |
| Divergencia KL respecto al base | 0,0062 |
| Comprobacion de colapso | OK |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) con valores numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 4-6 GB.
- Cuantizacion a 8 bits: alrededor de 1,7-2 GB de pesos; a 4 bits: alrededor de 0,9-1,2 GB, lo que permite ejecucion en GPUs de consumo con 4-8 GB de VRAM.
- GPU recomendadas: el autor del modelo base reporta pruebas de throughput en RTX 4090 con su implementacion optimizada de llama.cpp; tambien es viable en GPUs de gama media y en CPU.
- Cabe en GPUs de consumo: si, en tarjetas con 4 GB o mas de VRAM en cuantizaciones de 4-8 bits; en fp16 requiere al menos 6 GB aproximadamente.
- Opciones de despliegue: transformers (4.57.1, con `trust_remote_code=True`), vLLM, llama.cpp (incluida la implementacion optimizada de XHToken) y conversion a GGUF para Ollama u otros runners.
- Latencia y throughput: el autor del modelo base afirma liderar el throughput de decodificacion entre modelos on-device comparables en contextos cortos, pero no se proporcionan cifras numericas concretas en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-1.7B-uncensored (este) | 1,7B | no disponible | Apache 2.0 | en, zh | Variante abliterada; 1/100 rechazos, KL 0,0062 |
| Spark-X2.6-1.7B (base) | 1,7B | no disponible | Apache 2.0 | en, zh | Modelo original con alineacion intacta |
| Qwen3.5-2B | ~2B | no disponible | no disponible | no disponible | Citado como referencia de rendimiento por el autor |
| MiniCPM-2B | ~2B | no disponible | no disponible | no disponible | Citado como referencia de rendimiento por el autor |
| LFM2.5-2.6B | ~2,6B | no disponible | no disponible | no disponible | Citado como referencia de rendimiento por el autor |

Los datos de rendimiento comparativo entre estos modelos no se incluyen con valores numericos en la informacion disponible; el autor solo presenta graficos sin cifras textuales.

## Limitaciones y advertencias

- La abliteracion elimina el comportamiento de rechazo, lo que implica que el modelo puede generar contenido danino, ilegal o eticamente problematico sin filtros; no debe desplegarse en produccion orientada a usuarios sin capas de moderacion externas.
- La abliteracion puede degradar sutilmente capacidades del modelo base; el autor reporta una KL de 0,0062 y una comprobacion de colapso correcta, pero no se ofrecen evaluaciones exhaustivas de calidad por tarea.
- Riesgo de alucinacion inherente a un modelo de 1,7B: la capacidad de conocimiento factual es limitada y las respuestas pueden ser incorrectas con alta confianza.
- Soporte idiomatico restringido a ingles y chino; el rendimiento en castellano no esta garantizado ni evaluado.
- La longitud de contexto no se especifica en la informacion disponible, lo que dificulta planificar su uso en tareas de contexto largo.
- Aunque la licencia es Apache 2.0, el uso comercial del modelo abliterado conlleva riesgos legales y reputacionales derivados de la ausencia de filtros de seguridad; conviene revisar las politicas de la plataforma de despliegue.
- El modelo requiere `trust_remote_code=True` en transformers, lo que implica ejecutar codigo personalizado del repositorio; auditar dicho codigo antes de usarlo en entornos sensibles.
- El modelo tiene muy poca traccion (21 descargas, 0 likes) y fue creado en octubre de 2026; no hay validacion independiente de su calidad.
- La model card del autor original esta truncada en la informacion proporcionada; algunos detalles tecnicos del modelo base pueden faltar.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Deepexp/Spark-X2.6-1.7B-uncensored
- Modelo base en HuggingFace: https://huggingface.co/XHToken/Spark-X2.6-1.7B-Base
- Herramienta Tema_Q-Abliterated: https://github.com/ek15072809/Tema_Q-Abliterated
- Implementacion optimizada de llama.cpp de XHToken: https://github.com/XHToken/llama.cpp
- Slack de la comunidad: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord: https://discord.gg/kTDE2Hg8aw
- YouTube: https://www.youtube.com/@SparkLLM
- dev.to: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- X: https://x.com/sparkllm
- Zhihu: https://www.zhihu.com/people/zhiikz7qh7m
