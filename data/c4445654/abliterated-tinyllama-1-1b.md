# C4445654/abliterated-TinyLlama-1.1B

## Resumen

abliterated-TinyLlama-1.1B es una variante del modelo TinyLlama/TinyLlama-1.1B-Chat-v1.0 a la que se le ha aplicado una tecnica de "abliteration" o ablacion de la direccion de rechazo. El autor, identificado en Hugging Face como C4445654, parte del checkpoint conversacional oficial de TinyLlama y le elimina la direccion dominante del espacio de activaciones que media en las respuestas de rechazo, siguiendo el pipeline de Orion-zhen basado en el concepto descrito por FailSpy.

El modelo conserva la arquitectura original de TinyLlama: un transformer decoder-only de 1.100.048.384 parametros (aproximadamente 1,1 mil millones), entrenado originalmente sobre 3 billones de tokens y con una ventana de contexto de 2.048 tokens. La intervencion no modifica los pesos de forma estructural ni anade parametros; solo reescribe los tensores de las capas seleccionadas para eliminar la componente direccional asociada al rechazo.

La relevancia de esta ficha radica en que ejemplifica una categoria de modelos "uncensored" o "abliterated" que circulan en Hugging Face con fines de investigacion sobre alineamiento, interpretabilidad y robustez. Es un modelo pequeno, desplegable en hardware de consumo, con licencia Apache 2.0, pero con las limitaciones propias de un 1,1B y de una intervencion que puede degradar la calidad general. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que sugiere un uso muy marginal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama) |
| Parametros totales | 1.100.048.384 (~1,1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (heredado de TinyLlama) |
| Tipos de cuantizacion | no disponible en la model card; compatible con GGUF/4-bit/8-bit via herramientas estandar |
| Idiomas soportados | en, fr |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | TinyLlama/TinyLlama-1.1B-Chat-v1.0 |
| Tamano del repo | 2,2 GB |
| Pipeline | text-generation |
| Fecha de creacion | 2026-11-25 |

## Arquitectura y entrenamiento

La arquitectura es la de TinyLlama-1.1B-Chat-v1.0 sin cambios estructurales: transformer decoder-only con atencion multi-cabeza, RoPE, activacion SwiGLU, normalizacion RMSNorm y vocabulario SentencePiece de 32.000 tokens. El modelo base fue preentrenado sobre 3 billones de tokens (aproximadamente 3 epochs sobre el dataset SlimPajama) y posteriormente afinado con instrucciones y conversacion (SFT + DPO) por el equipo de TinyLlama. No se dispone de informacion detallada sobre la composicion exacta del dataset de chat en la model card de esta variante.

La innovacion de esta version es la ablacion de la direccion de rechazo. Segun la model card, se aplico el pipeline de Orion-zhen con metodo "full" (ablacion biproyectada que preserva la norma), usando un dataset de 80 pares contrastivos daninos/inofensivos (estilo advbench). Se seleccionaron las capas 21, 19 y 20, con esparsificacion en el percentil 0,995 y escala global 1,0. La direccion dominante de rechazo se calcula como la diferencia entre los estados ocultos de las respuestas daninas y las inofensivas, y se elimina de los escritores del residual stream (`o_proj` y `down_proj`) en todas las capas. No hay RLHF ni DPO adicional en esta variante; la intervencion es puramente post-hoc sobre los pesos.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y frances.
- Razonamiento basico y respuesta a instrucciones simples, limitado por el tamano de 1,1B.
- Generacion de codigo basica y resolucion de problemas matematicos elementales.
- Reduccion de rechazos explicitos ante peticiones que el modelo base rechazaria, segun el autor.
- No se documenta soporte de tool calling ni function calling nativo.
- No se documenta soporte de agentes ni razonamiento multi-paso estructurado.
- No dispone de vision, audio ni otras modalidades.
- No dispone de modo "thinking" ni decodificacion especulativa.
- Capacidad multilingue limitada a en y fr segun los tags; el vocabulario original cubre mas idiomas pero sin garantia de calidad.

## Casos de uso

- Investigacion sobre alineamiento y refusal: permite estudiar como la eliminacion de una direccion de activacion afecta a la tasa de rechazos y a la coherencia, comparando contra el modelo base en el mismo hardware.
- Analisis de robustez y seguridad: util para construir evaluaciones de "jailbreak" controladas y medir la degradacion de seguridad tras la ablacion, en entornos de laboratorio aislados.
- Prototipado de chatbots conversacionales en ingles o frances sobre hardware modesto: con 1,1B parametros y 2.048 tokens de contexto, cabe en GPUs de 4-8 GB en cuantizacion 4-bit y sirve para demos de baja latencia.
- Generacion de texto creativo y lluvia de ideas: el modelo puede producir borradores y variaciones de texto sin las restricciones de rechazo del base, util en entornos editoriales controlados.
- Educacion e investigacion en interpretabilidad: al ser un modelo pequeno con una intervencion documentada y reproducible, sirve como caso de estudio para cursos sobre mecanismos de refusal y edicion de pesos.
- Despliegue en dispositivos edge o entornos con recursos limitados: al caber en CPU y GPUs de consumo, puede integrarse en aplicaciones locales de generacion de texto donde no se requiere alta calidad.
- Evaluacion comparativa de tecnicas de abliteration: permite contrastar el pipeline de Orion-zhen con otras variantes (por ejemplo, ablaciones parciales) sobre el mismo checkpoint base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con el modelo base u otras variantes abliterated. El autor advierte que "la calidad del modelo puede degradarse ligeramente" y recomienda hacer benchmarks antes de confiar en el.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: ~2,2 GB de pesos mas overhead de activaciones y KV cache; en la practica 3-4 GB.
- VRAM estimada en 8-bit: ~1,2 GB; en 4-bit (GGUF Q4_K_M): ~0,7-0,9 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (GTX 1650, RTX 3050, RTX 4060); A100/H100 no son necesarias y estarian infrautilizadas.
- Cabe en GPU de consumo: si, en RTX 3060/4060/4090, e incluso en iGPUs y CPU con cuantizacion 4-bit.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI, transformers con bitsandbytes, LM Studio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano, se espera decodificacion en decenas de tokens por segundo en GPU de consumo y unos pocos tokens por segundo en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| abliterated-TinyLlama-1.1B | 1,1B | 2.048 | Apache 2.0 | Variante abliterated del chat oficial; sin benchmarks publicados |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | 1,1B | 2.048 | Apache 2.0 | Modelo base con alineamiento estandar; calidad de referencia |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Apache 2.0 | Mas contexto y mejor rendimiento general en benchmarks publicos |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 | Apache 2.0 | Alternativa moderna de tamano similar con mejor soporte de contexto |

La comparativa con variantes abliterated de otros modelos no esta disponible en la informacion proporcionada. Frente a TinyLlama base, la diferencia principal es la reduccion de rechazos, no una mejora de capacidades; frente a Qwen2.5-1.5B o SmolLM2-1.7B, el modelo pierde en contexto y, previsiblemente, en calidad general, aunque no hay datos cuantitativos para confirmarlo.

## Limitaciones y advertencias

- La abliteration no es un "uncensorment" completo: reduce rechazos explicitos pero no garantiza que el modelo responda a todo, segun el propio autor.
- Riesgo de degradacion de calidad: la intervencion sobre `o_proj` y `down_proj` puede afectar a la coherencia, el razonamiento y la factualidad; no hay benchmarks que cuantifiquen el dano.
- Riesgo elevado de alucinacion, agravado por el tamano de 1,1B y por la intervencion.
- Sesgos heredados del dataset de preentrenamiento y del afinado de TinyLlama; no se documenta mitigacion adicional.
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Soporte multilingue limitado a en y fr; el rendimiento en otros idiomas no esta garantizado.
- Licencia Apache 2.0 permite uso comercial, pero el autor remite a los terminos del modelo base; el uso en produccion de un modelo sin alineamiento conlleva riesgos legales y reputacionales.
- El modelo puede generar contenido danino, ofensivo o ilegal; no debe desplegarse en aplicaciones de cara al publico sin filtros adicionales.
- Repositorio con 0 descargas y 1 like: no hay evidencia de uso comunitario ni de validacion externa.
- No hay informacion sobre cuantizaciones oficiales publicadas; las conversiones GGUF existentes serian de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/C4445654/abliterated-TinyLlama-1.1B
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Pipeline de abliteration de Orion-zhen: https://github.com/Orion-zhen/abliteration
- Concepto de direccion de rechazo (LessWrong): https://www.lesswrong.com/posts/jGuXSZgv6qfdhMCuJ/refusal-in-llms-is-mediated-by-a-single-direction
- Repositorio de TinyLlama: https://github.com/jzhang38/TinyLlama
