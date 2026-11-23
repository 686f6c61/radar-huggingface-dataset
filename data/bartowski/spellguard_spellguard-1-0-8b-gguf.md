# bartowski/Spellguard_Spellguard-1.0-8B-GGUF

## Resumen

Spellguard-1.0-8B es un modelo clasificador de seguridad (guardrail) afinado a partir de Qwen3Guard-Gen-8B. Desarrollado por Spellguard, su funcion es evaluar un prompt de usuario —y opcionalmente una respuesta del asistente— y emitir una etiqueta de seguridad (`Safe`, `Unsafe` o `Controversial`), junto con la categoria de contenido peligroso detectada y, en el caso de respuestas, un indicador de rechazo. Esta pensado para moderar contenido danino y detectar inyecciones de prompt en sistemas con agentes.

La version aqui descrita es la cuantizacion GGUF realizada por bartowski a partir del checkpoint original, generada con llama.cpp (release b12600) e incluyendo una matriz de importancia (imatrix) para preservar la calidad en las cuantizaciones de baja precision. El modelo cuenta con 8.190.735.360 parametros (aproximadamente 8B) y una licencia Apache 2.0 que permite uso comercial.

Su relevancia actual radica en el auge de sistemas agenticos expuestos a entradas no confiables: el modelo incorpora en su entrenamiento datasets especificos de inyeccion indirecta de prompt, robustez frente a jailbreaks y contenido danino en respuestas de herramientas, lo que lo posiciona como una capa de defensa practica en pipelines de moderacion. Esta ficha se centra en la variante GGUF, pensada para despliegue local y en CPU/GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3Guard-Gen-8B) |
| Parametros totales | 8.190.735.360 (~8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1 (lista parcial en la informacion disponible) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo generativo (la model card indica "Gen") afinado desde Qwen3Guard-Gen-8B, un checkpoint de la familia Qwen3 orientado a clasificacion de seguridad. La variante publicada por bartowski es una cuantizacion GGUF con imatrix, generada con llama.cpp b12600; no introduce cambios arquitectonicos respecto al modelo base, solo reduce la precision de los pesos. El modelo no emplea decodificacion especulativa.

El entrenamiento combina un conjunto amplio de datasets orientados a seguridad y robustez: `allenai/wildguardmix`, `nvidia/Aegis-AI-Content-Safety-Dataset-2.0`, `bench-llm/or-bench`, `allenai/wildjailbreak`, `allenai/WildChat-1M`, `nvidia/Nemotron-RL-Agentic-Indirect-Prompt-Injection-v1`, `nvidia/Nemotron-RL-Jailbreak-Robustness-v1`, `neuralchemy/Prompt-injection-dataset`, `S-Labs/prompt-injection-dataset`, `3nesdeniz/agentic-prompt-injection-5k`, `rgeada/tool-response-injections`, `microsoft/llmail-inject-challenge`, `JailbreakV-28K/JailBreakV-28k`, `deepset/prompt-injections`, `Lakera/gandalf_ignore_instructions` y `jackhhao/jailbreak-classification`, entre otros. Tambien incluye datos de instruccion y codigo (`OpenAssistant/oasst2`, `CohereLabs/aya_dataset`, `glaiveai/glaive-function-calling-v2`, `bigcode/commitpackft`, `HuggingFaceFW/fineweb-edu`). No se especifican en la informacion disponible el numero total de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO.

Una innovacion destacable es el formato de prompt estructurado: el modelo recibe una politica de seguridad explicita, una lista cerrada de categorias de contenido no permitido (Violent, Non-violent Illegal Acts, Sexual Content or Sexual Acts, PII, Suicide & Self-Harm, Unethical Acts, Politically Sensitive Topics, Copyright Violation, Jailbreak) y la conversacion, y debe devolver en la primera linea la etiqueta y en la segunda la lista de categorias. Ademas, el prompt incluye un bloque `<think>` vacio, lo que sugiere soporte de modo de razonamiento heredado de Qwen3.

## Capacidades

- Clasificacion de seguridad de prompts de usuario en tres niveles: `Safe`, `Unsafe` y `Controversial`.
- Evaluacion de respuestas del asistente, incluyendo un indicador de rechazo (refusal flag).
- Asignacion de categorias de contenido no permitido entre nueve clases predefinidas.
- Deteccion de inyeccion de prompt directa e indirecta, incluyendo inyecciones en respuestas de herramientas (tool responses).
- Deteccion de jailbreaks y ataques de evasion de guardarrailes.
- Soporte de conversaciones multi-turno mediante el bloque de conversacion del prompt.
- Capacidad de function calling heredada del entrenamiento con `glaive-function-calling-v2` (no documentada como funcionalidad principal).
- Modo de razonamiento mediante bloque `<think>` (heredado de Qwen3).
- Entrada exclusivamente de texto; no soporta vision ni audio segun la informacion disponible.

## Casos de uso

- Moderacion de entrada en aplicaciones de chat: el modelo se coloca como filtro previo al LLM principal, clasificando cada mensaje del usuario y bloqueando o marcando los que resulten `Unsafe` o `Controversial` antes de que lleguen al modelo generativo.
- Proteccion frente a inyeccion indirecta en agentes: dado su entrenamiento con `rgeada/tool-response-injections` y `Nemotron-RL-Agentic-Indirect-Prompt-Injection-v1`, puede inspeccionar las respuestas de herramientas externas (resultados de busqueda, correos, APIs) antes de incorporarlas al contexto del agente.
- Filtrado de salidas del asistente: evaluar la respuesta generada por otro modelo y activar un rechazo o una reescritura cuando se detecte contenido danino o fuga de PII.
- Cumplimiento normativo y auditoria: registrar etiquetas y categorias de seguridad por cada interaccion para construir trazas auditables en entornos regulados.
- Deteccion de jailbreaks en servicios publicos: interceptar intentos de manipulacion del prompt (role-play, instrucciones ocultas, codificaciones) antes de que consuman recursos del modelo principal.
- Despliegue en el borde o en local: gracias a las cuantizaciones GGUF (desde ~5,2 GB en Q4_K_M), puede ejecutarse en estaciones de trabajo o servidores sin GPU dedicada, integrado en un proxy de moderacion con llama.cpp u Ollama.
- Investigacion en seguridad de IA: servir como baseline reproducible y ligero para experimentos de red teaming y evaluacion de robustez de guardarrailes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: bf16 ~16,4 GB; Q8_0 ~8,7 GB; Q6_K_L ~7,5 GB; Q6_K ~7,1 GB; Q5_K_M ~6,2 GB; Q5_K_S ~5,9 GB; Q4_K_L ~5,6 GB; Q4_1 ~5,3 GB; Q4_K_M ~5,2 GB. A estas cifras hay que sumar el espacio para el contexto KV cache.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, las cuantizaciones Q4-Q5 caben en GPUs de consumo con 8 GB o mas de VRAM; las Q6-Q8 requieren 12-16 GB; bf16 requiere 24 GB o mas.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8 GB de VRAM usando Q4_K_M o inferiores.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama y cualquier runtime compatible con GGUF. vLLM y TGI no se mencionan en la informacion disponible para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Spellguard-1.0-8B (GGUF, esta ficha) | ~8B | no disponible | Guardrail: seguridad, inyeccion de prompt, jailbreak | apache-2.0 | GGUF |
| Qwen3Guard-Gen-8B (modelo base) | ~8B | no disponible | Guardrail generativo de Qwen | no disponible en esta ficha | safetensors (original) |
| Llama Guard (variantes) | no disponible | no disponible | Guardrail de seguridad | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a parametros, enfoque y licencia.

## Limitaciones y advertencias

- Es un clasificador, no un modelo conversacional general: su salida esta restringida al formato de etiqueta y categorias; usarlo fuera de ese formato puede producir resultados poco fiables.
- Riesgo de falsos positivos y falsos negativos inherente a la moderacion automatica; la etiqueta `Controversial` es especialmente ambigua y requiere umbrales definidos por el integrador.
- Riesgo de alucinacion en la clasificacion: puede asignar categorias incorrectas o inventar categorias fuera de la lista permitida.
- No se documentan los idiomas soportados; el rendimiento en castellano no esta verificado y podria ser inferior al de ingles.
- La longitud de contexto no esta especificada; prompts o conversaciones muy largas pueden truncarse o degradar la clasificacion.
- La cuantizacion GGUF puede introducir una ligera perdida de precision respecto al checkpoint original, especialmente en Q4 y menores.
- Licencia Apache 2.0 permite uso comercial, pero el usuario es responsable del cumplimiento normativo de sus decisiones de moderacion.
- El modelo no sustituye una revision humana en contextos de alto riesgo (contenido legal, salud, menores).
- La fecha de creacion del repositorio (2026-11-22) y el hecho de no tener descargas ni likes indican que la variante GGUF no cuenta aun con validacion comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/Spellguard_Spellguard-1.0-8B-GGUF
- Modelo base original: https://huggingface.co/Spellguard/Spellguard-1.0-8B
- llama.cpp (release b12600): https://github.com/ggml-org/llama.cpp/releases/tag/b12600
- Cuantizacion recomendada Q4_K_M: https://huggingface.co/bartowski/Spellguard_Spellguard-1.0-8B-GGUF/blob/main/Spellguard_Spellguard-1.0-8B-Q4_K_M.gguf
