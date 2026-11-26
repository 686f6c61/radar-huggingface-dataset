# i1see1you/VirbiusGuard-4B

## Resumen
VirbiusGuard-4B es un clasificador de seguridad para prompts de agentes LLM, desarrollado por el usuario i1see1you (vinculado a GrainMind) y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un ajuste fino mediante LoRA del modelo Qwen3Guard-Gen-4B de Alibaba Qwen, con 4.022 millones de parametros totales (arquitectura Qwen3ForCausalLM densa) y una ventana de contexto heredada del modelo base. Su funcion es actuar como primera linea de defensa (Prompt L1) en un motor de agentes: recibe un prompt de entrada y devuelve una clasificacion estricta en JSON con los campos `hit_rule` y `triggered_id`, indicando si la peticion es segura o a que categoria de riesgo pertenece.

El modelo resuelve un problema concreto: el modelo base clasifica con su plantilla oficial de seguridad, pero deja escapar buena parte de los ataques de jailbreak y de abuso de herramientas de agente. Segun la model card, sobre el conjunto de evaluacion gold_1000 (615 muestras unsafe y 385 safe) el modelo base presenta un 15,4 % de falsos negativos y una tasa de deteccion de jailbreak del 57,1 %, mientras que la version v2.0 de VirbiusGuard alcanza un 98,2 % de exactitud, un 98,4 % de recall y un 2,1 % de falsos positivos (8 de 385), con un 96,9 % de deteccion en jailbreak y un 100 % en abuso de herramientas de agente.

Su relevancia actual reside en que la seguridad de agentes exige clasificadores especializados que distingan entre peticiones legitimas y ataques sofisticados (prompt injection, tool misuse) sin generar un exceso de bloqueos. El modelo se distribuye tanto en safetensors fp16 como en GGUF (F16, Q8_0 y Q4_K_M), lo que permite desplegarlo desde un portatil hasta un servidor con vLLM, y se integra en el motor VirbiusAgent sustituyendo una variable de entorno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only denso) con adaptador LoRA (rank 32 / alpha 64 / dropout 0.1) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3Guard-Gen-4B) |
| Tipos de cuantizacion | fp16 (safetensors), GGUF F16 (7,5 GB), GGUF Q8_0 (4,0 GB), GGUF Q4_K_M (2,3 GB) |
| Idiomas soportados | zh (chino), en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model-00001-of-00002, model-00002-of-00002, fp16 ~7,5 GB) y GGUF (F16, Q8_0, Q4_K_M) |

## Arquitectura y entrenamiento
El modelo parte de Qwen3Guard-Gen-4B, un transformer decoder-only de la familia Qwen3 orientado a clasificacion de seguridad, y se ajusta con un adaptador LoRA de rank 32, alpha 64 y dropout 0,1. El entrenamiento se realizo con mlx-lm sobre el conjunto v29f (30.671 muestras de entrenamiento y 916 de validacion), durante 1 epoca, 3.834 pasos, con warmup de 192 pasos, learning rate 1,5e-4 con decaimiento coseno hasta 1,5e-6, batch efectivo de 8, max_seq de 1.024 y enmascaramiento del prompt (mask_prompt). La anotacion de las etiquetas se hizo mediante destilacion de conocimiento desde un modelo profesor que etiqueto los datos de forma offline.

La version v2.0 parte de la iteracion V26 y anade 1.953 muestras verificadas de la ronda R10 y 425 muestras safe de R12. Incorpora ademas un conjunto de calibracion de 452 ejemplos compuesto por 100 de PKU-SafeRLHF, 50 de OR-Bench, 100 de chino de V26, 80 de ventana larga, 45 de peticiones de ayuda, 18 de reservas abiertas y 59 de tareas de agente (procedentes de glaive-function-calling-v2, hermes json-mode-agentic y ToolACE). Para evitar contaminacion, se eliminaron del entrenamiento las 52 muestras que coincidian exactamente con `data/eval/gold_1000.jsonl`, sin modificar el conjunto de evaluacion. La innovacion principal no es arquitectonica sino de protocolo: el modelo abandona la plantilla oficial de seguridad del base (Unsafe / Controversial) y emite un JSON estricto con `hit_rule` y `triggered_id`, lo que lo hace directamente consumible por un motor de agentes.

## Capacidades
- Clasificacion binaria de seguridad de prompts: devuelve `hit_rule: false` para entradas seguras o `hit_rule: true` acompanado de un `triggered_id` cuando detecta riesgo.
- Taxonomia cerrada de 10 categorias unsafe: Violent, Non-violent Illegal Acts, Unethical Acts, Suicide and Self-Harm, Jailbreak, PII, Copyright Violation, Politically Sensitive Topics, Sexual Content or Sexual Acts y Agent Tool Misuse.
- Deteccion especializada de jailbreak: 96,9 % de recall sobre 98 muestras en gold_1000 (frente al 57,1 % del modelo base).
- Deteccion de abuso de herramientas de agente: 100 % de recall sobre 84 muestras en gold_1000.
- Deteccion de contenido de autolesion y suicidio: 97,0 % de recall sobre 33 muestras en gold_1000.
- Salida estructurada en JSON, apta para integracion programatica sin postprocesado complejo.
- Capacidad conversacional y de generacion de texto heredada del modelo base, aunque el uso previsto es la clasificacion.
- Soporte bilingue chino-ingles.
- No se documentan capacidades de vision, audio, tool calling propio ni modo de razonamiento extendido (thinking mode) en la informacion disponible.

## Casos de uso
- Filtrado de entrada en agentes LLM: el modelo se situa como Prompt L1 antes del agente principal; cada mensaje del usuario se clasifica y, si `hit_rule` es true, se bloquea o se deriva a revision. Su recall del 98,4 % sobre gold_1000 lo hace adecuado para esta puerta de entrada.
- Proteccion frente a prompt injection y jailbreak: con un 96,9 % de deteccion en la categoria Jailbreak, se emplea para interceptar intentos de manipular el system prompt o evadir las politicas del agente antes de que lleguen al modelo generativo.
- Supervision de agentes con acceso a herramientas: la categoria Agent Tool Misuse, con 100 % de recall sobre 84 muestras, permite detectar peticiones que intentan forzar al agente a ejecutar funciones peligrosas (borrado de datos, envio de correos masivos, acceso a ficheros).
- Moderacion de comunidades y plataformas de contenido: la taxonomia de 10 categorias permite etiquetar mensajes de usuarios en foros o chats con una unica etiqueta principal, facilitando el enrutado a colas de moderacion humanas.
- Cumplimiento y proteccion de datos: la categoria PII permite marcar prompts que solicitan o exponen datos personales, util en entornos con requisitos de RGPD.
- Despliegue en el motor VirbiusAgent: basta con sustituir la variable de entorno `VIRBIUS_PROMPT_LLM_MODEL` para que el motor use este clasificador en lugar del modelo base, sin cambios de codigo.
- Ejecucion en local o en el borde: la version GGUF Q4_K_M (2,3 GB) permite ejecutar el clasificador con llama.cpp u Ollama en maquinas sin GPU dedicada, lo que facilita el filtrado previo sin enviar prompts a servicios externos.

## Benchmarks y rendimiento
Resultados sobre `data/eval/gold_1000.jsonl` (615 unsafe / 385 safe), mismo conjunto y criterio para todos los modelos:

| Modelo | Accuracy | Recall | Falsos negativos | Falsos positivos | Precision |
|---|---|---|---|---|---|
| Qwen3Guard-Gen-4B (base) | 87,9 % | 84,6 % | 15,4 % (95/615) | 6,8 % (26/385) | 95,2 % |
| VirbiusGuard-4B V1.3 | 93,6 % | 99,5 % | 0,5 % (3/615) | 15,8 % (61/385) | 90,9 % |
| VirbiusGuard-4B V1.5 | 97,5 % | 99,2 % | 0,8 % (5/615) | 5,2 % (20/385) | 96,8 % |
| VirbiusGuard-4B V1.7 | 97,8 % | 98,0 % | 2,0 % (12/615) | 2,6 % (10/385) | 98,4 % |
| VirbiusGuard-4B v2.0 | 98,2 % | 98,4 % | 1,6 % (10/615) | 2,1 % (8/385) | 98,7 % |

Recall por categoria clave (gold_1000):

| Categoria (n) | Base | V1.3 | V1.5 | V1.7 | v2.0 |
|---|---|---|---|---|---|
| Jailbreak (98) | 57,1 % | 100 % | 100 % | 98,0 % | 96,9 % |
| Agent Tool Misuse (84) | 81,0 % | 100 % | 98,8 % | 100 % | 100 % |
| Suicide and Self-Harm (33) | 93,9 % | 100 % | 93,9 % | 93,9 % | 97,0 % |

Los 10 falsos negativos de v2.0 se reparten en jailbreak (3), violencia (2), politica (2), actos ilegales (2) y autolesion (1). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en fp16: en torno a 8-9 GB incluyendo pesos (7,5 GB) y cache KV para secuencias de hasta 1.024 tokens.
- VRAM estimada en GGUF Q8_0: aproximadamente 4,5-5 GB; en Q4_K_M: aproximadamente 2,5-3 GB.
- GPU recomendadas para produccion con vLLM o TGI: A100 40/80 GB, H100, L40S o A10G; para una sola instancia de clasificacion es suficiente una GPU de 16 GB como RTX 4080 o RTX 4090.
- Cabe en GPU de consumo: si. En RTX 4090 o 3090 en fp16; en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060) mediante GGUF Q8_0 o Q4_K_M.
- Opciones de despliegue: Transformers con `from_pretrained`, llama.cpp y Ollama con los GGUF publicados, vLLM y TGI para servicio HTTP; la model card menciona compatibilidad con text-embeddings-inference y endpoints.
- Latencia y throughput: no disponibles en la informacion proporcionada. El uso previsto con `max_new_tokens` de al menos 40 implica una generacion corta por peticion, adecuada para clasificacion en linea.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy gold_1000 | Recall jailbreak | Licencia | Formatos |
|---|---|---|---|---|---|---|
| VirbiusGuard-4B v2.0 | 4,02 B | no disponible | 98,2 % | 96,9 % | Apache 2.0 | safetensors, GGUF |
| Qwen3Guard-Gen-4B (base) | 4 B (aprox.) | no disponible | 87,9 % | 57,1 % | no disponible en la informacion | safetensors |
| VirbiusGuard-0.6B (version ligera) | 0,6 B (aprox.) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base y a la version ligera del mismo autor, ya que no se han proporcionado datos de otros clasificadores de seguridad comparables (Llama Guard, ShieldGemma u otros). No disponible informacion adicional para ampliar la comparativa.

## Limitaciones y advertencias
- El modelo solo soporta chino e ingles de forma declarada; su comportamiento en castellano u otros idiomas no esta documentado y no deberia asumirse.
- La taxonomia se anota con criterio A (mencionar ya es violacion) y la categoria Politically Sensitive Topics bloquea de forma estricta; esto puede generar falsos positivos en contextos editoriales, academicos o de analisis politico legitimo.
- El conjunto de evaluacion gold_1000 es propio del autor y no un benchmark independiente; las cifras de 98,2 % de accuracy deben interpretarse como rendimiento en dominio y no como garantia de generalizacion.
- Persisten 10 falsos negativos en gold_1000, concentrados en jailbreak (3), violencia (2), politica (2), actos ilegales (2) y autolesion (1); no debe usarse como unico mecanismo de seguridad.
- Riesgo de alucinacion en la salida: al ser un modelo generativo, puede emitir JSON malformado o etiquetas fuera de la taxonomia si el prompt no sigue la plantilla esperada; se recomienda validar el JSON y aplicar un fallback conservador.
- La model card no detalla sesgos demograficos, culturales ni linguisticos medidos; la evaluacion se centra en deteccion, no en equidad.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3Guard-Gen-4B conviene verificar las condiciones del modelo base y de los datasets de anotacion antes de un despliegue en produccion.
- El repositorio ocupa 56,3 GB por incluir multiples versiones y cuantizaciones; conviene descargar solo los artefactos necesarios.
- No hay informacion publica sobre latencia, throughput ni coste por peticion, por lo que el dimensionamiento debe hacerse con pruebas propias.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/i1see1you/VirbiusGuard-4B
- Modelo en ModelScope: https://www.modelscope.cn/models/i1see1you/VirbiusGuard-4B
- Version ligera 0.6B: https://www.modelscope.cn/models/i1see1you/VirbiusGuard
- Demo online: https://www.virbius.cn/demo
- Presentacion del producto: http://www.virbius.tech/virbiusguard.html
- Sitio de GrainMind: https://www.grainmind.cn/
- Modelo base: https://huggingface.co/Qwen/Qwen3Guard-Gen-4B
- Contacto: i1see1you@163.com
