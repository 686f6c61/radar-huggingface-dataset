# Luni/Nanbeige-4.3-33B-EXL3

## Resumen

Nanbeige-4.3-33B-EXL3 es una cuantización en formato ExLlamaV3 (EXL3) del modelo Nanbeige4.3-33B, un modelo de lenguaje denso de 33 mil millones de parámetros desarrollado por el equipo Nanbeige. La cuantización ha sido publicada por el usuario Luni en HuggingFace y está optimizada para inferencia local de alto rendimiento mediante la librería exllamav3.

El modelo base destaca por tres características principales: una ventana de contexto nativa de 262k tokens (262.144), razonamiento nativo mediante tokens `<think>` (modo de pensamiento estilo chain-of-thought) y una arquitectura tipo Llama con atención completa (full-attention). Está entrenado para inglés y chino, y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones.

Esta ficha se centra en la cuantización EXL3, que ofrece tres ramas de bits por peso (5.00, 4.50 y 4.00 BPW) orientadas a GPUs de 24 a 32 GB de VRAM. Es relevante para desarrolladores que buscan ejecutar un modelo de razonamiento de 33B con contexto muy largo en hardware de consumo prosumer, sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal (tipo Llama), full-attention |
| Parametros totales | 33B (33.000 millones aprox.) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 262.144 tokens (262k) |
| Tipos de cuantizacion | EXL3: 5.00 BPW, 4.50 BPW y 4.00 BPW (head 6 bits, embeddings 16 bits FP16, codebook mul1) |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | EXL3 (ExLlamaV3); existen variantes GGUF y BF16 del modelo base y de la variante Heretic |

## Arquitectura y entrenamiento

Nanbeige4.3-33B es un modelo de lenguaje causal denso de 33B parametros con arquitectura tipo Llama y mecanismo de atencion completa (full-attention), sin capas de atencion lineal ni hibridas. Su rasgo mas distintivo es la ventana de contexto nativa de 262k tokens, muy por encima de los 32k-128k habituales en modelos de su tamano, lo que permite procesar documentos extensos, repositorios de codigo completos o conversaciones muy largas sin tecnicas de compresion de contexto externas.

El modelo incorpora razonamiento nativo mediante tokens `<think>`, es decir, genera de forma explicita una seccion de pensamiento interno antes de la respuesta final, similar al enfoque de los modelos reasoning actuales. No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en la documentacion disponible.

En cuanto a la cuantizacion EXL3 concreta de esta ficha, se ha realizado con ExLlamaV3 v1.6.4 usando promocion de calidad alta (`-hq`) y codebook `mul1`. La rama de 4.50 BPW emplea una fusion Pareto optimizada por KLD (mediante `measure_model` y `optimize_model`), y la de 5.00 BPW esta orientada a precision alta con contextos de 64k o mas. Ademas, el autor ha parcheado `tokenizer_config.json` (`"add_bos_token": false`) para corregir una doble emision del token `<|im_start|>` al aplicar plantillas de chat, un detalle importante para evitar degradaciones en inferencia.

## Capacidades

- Generacion de texto conversacional con formato de chat (tags `conversational` y `text-generation`).
- Razonamiento nativo con modo de pensamiento (`<think>` / `thinking`): el modelo genera una cadena de razonamiento explicita antes de responder, util para matematicas, logica y planificacion multi-paso.
- Ventana de contexto de 262k tokens, adecuada para analisis de documentos largos y conversaciones multi-turno extensas.
- Soporte bilingue ingles-chino; no hay evidencia de soporte oficial para otros idiomas, incluido el castellano.
- Compatibilidad con el ecosistema ExLlamaV3 para inferencia local optimizada en GPU.
- Existe un draftor especulativo asociado (Nanbeige-4.3-33B-DFlash2) que permite acelerar la generacion mediante decodificacion especulativa.
- No se ha documentado soporte de tool calling, function calling, vision ni audio en la informacion disponible.

## Casos de uso

- Chatbots con memoria de largo plazo: los 262k de contexto permiten mantener historiales de conversacion de semanas o meses sin resumen externo, ideal para asistentes personales o de soporte con continuidad.
- Analisis de documentos extensos: revision de contratos, informes tecnicos o papers de decenas de miles de tokens en una sola pasada, aprovechando la atencion completa sin tecnicas de ventaneo.
- Razonamiento paso a paso en matematicas y logica: el modo `<think>` nativo lo hace adecuado para tareas de planificacion, depuracion de algoritmos y problemas multi-paso donde interesa inspeccionar la cadena de razonamiento.
- Asistencia a programacion con repositorios completos: el contexto de 262k permite cargar multiples ficheros de un proyecto simultaneamente para preguntas de arquitectura, refactoring o revision de codigo.
- Inferencia local en GPU de consumo prosumer: las ramas de 4.00 y 4.50 BPW caben en una RTX 3090/4090 de 24 GB, lo que lo hace viable para estaciones de trabajo individuales y despliegues on-premise con datos sensibles.
- Procesamiento bilingue ingles-chino: util para equipos que trabajan con documentacion tecnica o comunicacion en ambos idiomas, un nicho donde los modelos occidentales suelen rendir peor en chino.
- Aceleracion mediante decodificacion especulativa: combinandolo con el draftor DFlash2 del mismo autor, se puede aumentar el throughput de generacion en escenarios de servicio local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye metricas de MMLU, HumanEval, GSM8K ni comparativas, y tampoco se han aportado datos del modelo base Nanbeige4.3-33B. Lo unico cuantificable es la calidad de cuantizacion: la rama de 4.50 BPW se ha optimizado minimizando la divergencia KLD respecto al modelo original, y la de 5.00 BPW se recomienda para contextos de 64k o superiores por su mayor precision.

## Requisitos de hardware

- Rama 5.00 BPW: 21,0 GB de pesos; VRAM objetivo 32 GB (por ejemplo, RTX 5090, A6000, L40S o A100 de 40/80 GB). Recomendada para contextos de 64k o mas.
- Rama 4.50 BPW: 19,3 GB de pesos; VRAM objetivo 24 GB (RTX 3090, RTX 4090, RTX 5090 con margen). Cuantizacion Pareto optimizada por KLD.
- Rama 4.00 BPW: 17,6 GB de pesos; VRAM objetivo 24 GB o 32 GB. Adecuada para contextos de 32k-64k o mas.
- Si cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 3090/4090) con las ramas de 4.00 y 4.50 BPW, dejando margen limitado para la KV cache en contextos largos; para 262k de contexto completo se recomienda 32 GB o mas, o descarga de capas a CPU.
- Libreria de inferencia: ExLlamaV3 (v1.6.4 o superior). No es compatible con llama.cpp, Ollama, vLLM ni TGI en formato EXL3; para esos backends existen variantes GGUF del modelo (por ejemplo, la suite Heretic-GGUF del mismo autor).
- Latencia y throughput: no disponibles; al ser un modelo denso de 33B con atencion completa, el throughput en contexto largo dependera fuertemente de la VRAM disponible para la KV cache.
- Opcional: uso del draftor especulativo Nanbeige-4.3-33B-DFlash2 para acelerar la generacion con ExLlamaV3.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Nanbeige-4.3-33B (esta cuantizacion) | 33B denso | 262k | EXL3, GGUF, BF16 | Apache-2.0 | Razonamiento nativo `<think>`, bilingue en/zh |
| Qwen3-32B | 32B denso | 131k aprox. | BF16, GGUF, AWQ, GPTQ | Apache-2.0 | Modo thinking conmutable, multilingue (100+ idiomas), ecosistema muy amplio |
| Gemma 3 27B | 27B denso | 128k | BF16, GGUF | Gemma (uso comercial con restricciones) | Multimodal (vision), buen rendimiento por parametro |
| QwQ-32B | 32B denso | 131k aprox. | BF16, GGUF | Apache-2.0 | Especializado en razonamiento, sin ventana de contexto tan amplia |

Frente a Qwen3-32B, Nanbeige4.3-33B ofrece el doble de contexto (262k frente a ~131k), pero un ecosistema de herramientas y soporte multilingue claramente menor. Frente a Gemma 3 27B, carece de capacidades visuales y su licencia, aunque mas permisiva, viene acompanada de menos documentacion. Su nicho concreto es la combinacion de contexto muy largo, razonamiento nativo y licencia Apache-2.0 en un tamano que cabe en 24 GB de VRAM.

## Limitaciones y advertencias

- Soporte de idiomas limitado a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior al de modelos explicitamente multilingues.
- Riesgo de alucinacion: no disponible informacion especifica; al tratarse de un modelo de 33B con modo de razonamiento, es aconsejable verificar respuestas factuales en usos criticos.
- La KV cache de un contexto de 262k con atencion completa consume una cantidad de VRAM muy elevada; en GPUs de 24 GB el contexto util sera mucho menor que el maximo teorico.
- Es un modelo denso de 33B: el throughput sera inferior al de alternativas MoE de tamano similar en parametros activos.
- La cuantizacion EXL3 solo funciona con ExLlamaV3; no es compatible con vLLM, TGI, llama.cpp ni Ollama.
- El parche del tokenizer (`add_bos_token: false`) es una modificacion del autor de la cuantizacion, no del equipo oficial; conviene tenerlo en cuenta al mezclar componentes de distintos repositorios.
- Existe una variante "uncensored" (Heretic) publicada por el mismo autor; el modelo de esta ficha conserva el alineamiento original, pero hay que verificar los salvaguardas antes de uso en produccion.
- No hay documentacion publicada sobre tool calling, agentes ni entrenamiento (tokens, datasets, RLHF), lo que dificulta evaluar su idoneidad para pipelines agenticos frente a alternativas mejor documentadas.
- La licencia Apache-2.0 no impone restricciones de uso comercial.

## Enlaces

- Cuantizacion EXL3 (esta ficha): https://huggingface.co/Luni/Nanbeige-4.3-33B-EXL3
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Variante Heretic BF16: https://huggingface.co/Luni/Nanbeige-4.3-33B-Heretic
- Variante Heretic EXL3: https://huggingface.co/Luni/Nanbeige-4.3-33B-Heretic-EXL3
- Variante Heretic EXL3-SC: https://huggingface.co/Luni/Nanbeige-4.3-33B-Heretic-EXL3-SC
- Draftor especulativo DFlash2: https://huggingface.co/Luni/Nanbeige-4.3-33B-DFlash2
- Variante Heretic GGUF: https://huggingface.co/Luni/Nanbeige-4.3-33B-Heretic-GGUF
- Variante Heretic GGUF GSQ-RCO: https://huggingface.co/Luni/Nanbeige-4.3-33B-Heretic-GSQ-RCO-GGUF
- Paper, blog oficial y demo: no disponibles
