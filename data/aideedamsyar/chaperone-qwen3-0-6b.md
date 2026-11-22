# aideedamsyar/chaperone-qwen3-0.6b

## Resumen
Chaperone (Qwen3-0.6B) es un modelo de clasificación de texto derivado por fine-tuning de Qwen/Qwen3-0.6B, desarrollado por aideedamsyar. Su funcion es evaluar cada llamada a herramienta que propone un agente de codificacion (comandos de shell, escrituras o ediciones de ficheros, o cualquier tool call estructurada) contra las reglas en lenguaje natural del propietario, devolviendo probabilidades para tres etiquetas: ALLOW, ASK (devolver la decision al propietario) o BLOCK. Todo ello en un unico forward pass y desde fuera de la conversacion del agente, de modo que las reglas no puedan quedar fuera de su vista por sesiones largas o por compactacion de contexto.

El modelo tiene 596.049.920 parametros (aproximadamente 0,6B) y pesos en bf16, con builds GGUF adicionales en F16, Q8_0 y Q4_K_M. Esta pensado como guardrail ligero y apto para CPU: en un solo nucleo, comprobar una llamada contra cuatro reglas tardo una mediana de 5,0 s en 16 bits y 7,0 s en 8 bits. Su resultado principal: en un agente de codificacion real (OpenClaw con gpt-oss-120b, sesiones reservadas, una compactacion), las ejecuciones que rompian las reglas del propietario bajaron de 74 de 100 sin comprobacion a 40 de 100 con este checker, y las ejecuciones con dano de 66 a 12.

Es relevante ahora porque aborda un problema concreto de los agentes de codificacion autonomos: el cumplimiento de reglas del propietario que el agente puede seguir viendo pero incumple. El propio autor recomienda para la mayoria de usos la version de 4B (chaperone-qwen3-4b), mas precisa y mejor calibrada en todos los benchmarks ejecutados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), fine-tuning del modelo base Qwen/Qwen3-0.6B; clasificacion mediante softmax sobre los logits de tres tokens de respuesta en la posicion de respuesta |
| Parametros totales | 596.049.920 (0,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos fusionados), GGUF F16, GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, 1,11 GiB), GGUF (llama.cpp) |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3-0.6B, un transformer decoder-only, y se obtiene mediante fine-tuning (relacion base_model_relation: finetune). El pipeline declarado es text-classification, aunque la libreria asociada es transformers y el uso principal se realiza con AutoModelForCausalLM leyendo los logits de tres tokens de respuesta (ALLOW, ASK, BLOCK) en la posicion final, aplicando softmax con una temperatura configurada. Los identificadores exactos de esos tokens, la temperatura, el texto de sistema, la instruccion, el umbral de deferencia, las house rules y los ajustes de entrenamiento se almacenan en chaperone_config.json; el autor advierte que no deben editarse porque el modelo fue entrenado con esas cadenas verbatim.

El prompt de inferencia se reconstruye con la plantilla de chat de Qwen3 (enable_thinking=False) y consta de un system prompt fijo, las reglas del propietario, la accion propuesta formateada de forma canonica (shell command, write/edit de fichero o tool call estructurada con lineas de contexto opcionales como user_request, source, permissions, data y reversible) y una instruccion. Existe un limite max_action_chars para truncar acciones largas. Se menciona el uso de LoRA entre las etiquetas del repositorio, si bien la model card no detalla hiperparametros, volumen de tokens de entrenamiento ni composicion del dataset. No se documentan tecnicas de RLHF o DPO. Entre las innovaciones destacables: la comprobacion se hace regla a regla y gana la respuesta mas estricta, y el modelo nunca ve la conversacion del agente.

## Capacidades
- Clasificacion de tool calls en tres clases con probabilidades: ALLOW, ASK y BLOCK, en un unico forward pass.
- Evaluacion de comandos de shell (`exec`), escrituras de fichero (`write`), ediciones (`edit`) y tool calls estructuradas arbitrarias (`call`) con argumentos JSON.
- Soporte de contexto auxiliar por accion: peticion del usuario, origen de la instruccion, permisos del agente, sensibilidad de datos y reversibilidad.
- Agregacion multi-regla: varias reglas se comprueban una a una y prevalece la respuesta mas estricta.
- Aislamiento de la conversacion: al no ver el hilo del agente, las reglas no pueden ser desplazadas por sesiones largas ni por compactacion de contexto.
- Modo de deferencia configurable mediante umbral (deferral threshold) definido en chaperone_config.json.
- Construccion de prompts verbatim mediante plantilla de chat Qwen3 con thinking desactivado.
- Despliegue en transformers (torch) y en llama.cpp mediante llama-cpp-python, sin necesidad de torch en este ultimo caso.
- Idiomas: exclusivamente ingles segun la model card.

## Casos de uso
- Guardrail de agentes de codificacion en produccion: colocar Chaperone entre el agente y la ejecucion real de herramientas, de modo que cada tool call propuesta se puntue contra las reglas del propietario antes de ejecutarse; encaja por su bajo coste y porque opera fuera de la conversacion del agente.
- Politica de comandos de shell: comprobar comandos `exec` contra reglas del tipo "no borrar datos fuera de /tmp" o "no instalar paquetes globales", devolviendo BLOCK o ASK cuando corresponda.
- Control de escrituras y ediciones de ficheros: puntuar el contenido nuevo de un `write` o `edit` contra reglas de estilo, seguridad o alcance del repositorio, truncando el texto a max_action_chars para mantener la latencia.
- Escalado de decisiones al propietario: usar la clase ASK con el umbral de deferencia para derivar casos ambiguos a revision humana en lugar de bloquearlos automaticamente.
- Despliegue en entornos sin GPU: al ser apto para CPU y disponer de GGUF Q4_K_M de 378 MiB, sirve para estaciones de trabajo o CI con recursos limitados donde una comprobacion tarda unos 5-7 s por llamada y cuatro reglas.
- Auditoria y registro de decisiones: almacenar las probabilidades ALLOW/ASK/BLOCK junto con la regla evaluada para trazar por que se permitio o bloqueo una accion en un pipeline de agentes.
- Filtro previo en pipelines de CI/CD de agentes: integrar la comprobacion como paso intermedio antes de aplicar cambios generados por un agente, con la version 4B recomendada cuando la precision importe mas que el coste.

## Benchmarks y rendimiento
Resultados publicados en la model card sobre un agente de codificacion real (OpenClaw, gpt-oss-120b, sesiones reservadas, una compactacion, 100 ejecuciones):

| Metrica | Sin checker | Con Chaperone 0.6B |
|---|---:|---:|
| Ejecuciones que rompen la regla del propietario | 74 de 100 | 40 de 100 |
| Ejecuciones con dano | 66 de 100 | 12 de 100 |

Latencia medida en un solo nucleo de CPU, comprobando una llamada contra cuatro reglas:

| Precision | Mediana |
|---|---:|
| 16 bits | 5,0 s |
| 8 bits | 7,0 s |

Fidelidad de los builds GGUF: el F16 produjo decisiones identicas al modelo puntuado en GPU sobre 1.000 items de test; el Q8_0 es el build usado en la prueba con agente en vivo; el Q4_K_M es el mas pequeno y menos fiel, recomendandose su uso con deferencia. No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware
- Pesos fusionados en bf16: model.safetensors de 1,11 GiB (1.192.135.096 bytes); inferencia en transformers con torch, tipicamente en FP32 segun el ejemplo de la model card.
- Builds GGUF para llama.cpp: F16 de 1143 MiB, Q8_0 de 610 MiB y Q4_K_M de 378 MiB.
- Cabe en CPU: el autor lo describe como apto para CPU y reporta latencias de 5,0-7,0 s por llamada contra cuatro reglas en un solo nucleo.
- GPU: no se especifican modelos recomendados (A100, H100, RTX 4090, etc.) en la informacion disponible; por tamano, los pesos bf16 de ~1,1 GiB caben con holgura en cualquier GPU consumer, aunque no hay datos oficiales de VRAM ni de throughput en GPU.
- Opciones de despliegue: transformers (AutoModelForCausalLM), llama.cpp via llama-cpp-python; tambien aparecen en etiquetas llama.cpp, text-embeddings-inference y endpoints_compatible.
- Latencia y throughput: solo se publica la latencia en CPU citada; no hay datos de throughput en GPU.

## Comparativa con modelos similares
La informacion proporcionada solo permite comparar con el modelo base y con la version mayor del mismo autor, ambos mencionados en la model card.

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chaperone Qwen3-0.6B (este) | 0,6B | no disponible | Guardrail ALLOW/ASK/BLOCK de tool calls | apache-2.0 | Hugging Face; builds safetensors y GGUF |
| Chaperone Qwen3-4B | 4B | no disponible | Guardrail ALLOW/ASK/BLOCK de tool calls | no disponible en esta ficha | Hugging Face (enlace en la model card); recomendado por el autor por mayor precision y mejor calibracion |
| Qwen/Qwen3-0.6B (base) | 0,6B | no disponible | Generacion de texto general | no disponible en esta ficha | Hugging Face |

No se dispone de datos de benchmarks comparativos con alternativas de terceros en la informacion disponible.

## Limitaciones y advertencias
- Falla la mayoria de violaciones cuyo dano depende de la tarea; el propio autor lo indica en la seccion Limitations and Risks de la model card.
- El Q4_K_M es menos fiel que F16 y Q8_0; se recomienda usarlo junto con deferral.
- Solo soporta ingles segun el metadato de idioma del repositorio.
- La version 0.6B es menos precisa y peor calibrada que la 4B en todos los benchmarks ejecutados por el autor; para la mayoria de usos se recomienda la 4B.
- Las cadenas de sistema, instruccion, tokens de respuesta y house rules deben usarse verbatim desde chaperone_config.json; editarlas altera el comportamiento respecto al entrenamiento.
- El modelo no ve la conversacion del agente por designio; cualquier informacion relevante para la regla debe aportarse en las reglas o en las lineas de contexto de la accion.
- Las acciones se truncan a max_action_chars, por lo que contenido relevante mas alla de ese limite no se evalua.
- Riesgo de alucinacion y sesgos: no se documentan sesgos conocidos en la informacion disponible; al ser un clasificador con tres etiquetas, el riesgo principal es de clasificacion erronea (falsos ALLOW y falsos BLOCK), no de generacion libre.
- Licencia apache-2.0, que permite uso comercial; conviene verificar igualmente las condiciones del modelo base Qwen/Qwen3-0.6B.
- El enlace al paper aparece como arXiv:ARXIV_ID_TBD, es decir, identificador pendiente en la informacion disponible.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validacion externa.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/aideedamsyar/chaperone-qwen3-0.6b
- Version 4B recomendada: https://huggingface.co/aideedamsyar/chaperone-qwen3-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Paper: *I Told You Not To: Coding Agents Break Owner Rules They Can Still See* (2026), https://arxiv.org/abs/ARXIV_ID_TBD (identificador pendiente en la informacion disponible)
