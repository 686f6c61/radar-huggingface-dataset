# selorahomes/Selora-AI-LLM-1.7B-ollama

vacío la salida pierde la apertura `{"`.
- temperature 0 y repeat_penalty 1.0; no usar sampling agresivo.
- No tool calling/agentes.
- Licencia Apache 2.0 permite uso comercial; conservar NOTICE de Qwen3.
- Fecha de creación/actualización 2026 (dato raro, but just report? Not necessary).
- No benchmarks públicos en la información.

Enlaces:
- HF model
- Adapter bundle
- Qwen3-1.7B
- GitLab models repo
- GitLab HA integration
- Path eval/baselines.json (no URL)

Need to ensure "castellano de España": use "cuantización", "inferencia", "despliegue", "ajuste fino", "ventana de contexto". Avoid Latin Americanisms.

Numbers in Spanish: 1.720.574.976 uses dots as thousands (Spain). Decimal comma. Good.

Let's write concise but thorough.

Check headings capitalization: "## Resumen" only first word. "## Especificaciones técnicas" — "Especificaciones" cap, "técnicas" lower. Good. "## Arquitectura y entrenamiento" — only "Arquitectura" cap, "y" lower. Good. "## Capacidades", "## Casos de uso" (Casos cap, uso lower), "## Benchmarks y rendimiento" (Benchmarks cap), "## Requisitos de hardware", "## Comparativa con modelos similares", "## Limitaciones y advertencias", "## Enlaces".

Don't capitalize bullet first words? Not required. Fine.

Potential issue: "Modelo base: Qwen/Qwen3-1.7B" — use in table.

Let me write the final markdown only.

VRAM estimates: I'll be explicit "estimación propia a partir del tamaño". Q6_K weights: 1.72B × 6.5625 bits / 8 = 1.41 GB. KV cache estimate depends on architecture; I can say "aproximadamente 2-3 GB en total con 4096 tokens de contexto en FP16". For Q4_K_M: "aproximadamente 1,5-2 GB". Fine.

Also mention "9,9 GB de tamaño de repo" maybe multiple files.

Benchmarks table:
| Conjunto | Resultado |
| Métricas internas del autor (`eval/baselines.json`, variantes `fused-*`) | no disponibles en la información proporcionada |
| MMLU, HumanEval, GSM8K u otros benchmarks públicos | no disponibles en la información proporcionada |

Phrase: "No se han publicado resultados de benchmarks en la información disponible." Include exactly.

Capabilities: mention "endpoints_compatible" tag? Could mention it's compatible with HF endpoints? The tag "endpoints_compatible" suggests it can be deployed on HF Inference Endpoints. But GGUF on endpoints? Maybe. Don't overinterpret; skip or mention as tag. Not necessary.

Tool calling: the model emits JSON command objects, which is function-calling-like. Say "no se documenta un protocolo genérico de tool calling; la salida es un objeto JSON con uno de cinco esquemas fijos". Good.

"Agentes y multi-step reasoning": no; single-turn. It does "router" decision, not multi-step.

"Capacidades multilingües": only English.

"Thinking mode": Qwen3 thinking suppressed by /no_think; empty think block in prompt. Mention.

Casos de uso:
1. Control por voz/texto de dispositivos: command JSON with entity_id and service.
2. Automatizaciones: automation JSON with triggers/conditions/actions.
3. Consultas de estado: answer.
4. Aclaraciones: clarification when entity ambiguous.
5. Utilities: facturas, tarifas, documentación con RELEVANT DOCS.
6. Asistente local privado en hardware modesto.
7. Enrutado de intenciones en pipelines: classify into five types.
8. Testing/validación de integraciones HA: generate fixtures JSON.

Need "por que es adecuado" each.

Comparativa:
| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
Selora fused, Selora bundle, Qwen3 base.
For Selora bundle params 1.72B base + adapters; context no disponible; license Apache 2.0; format GGUF + LoRA; approach five adapters caller-selected.
Qwen3 base: 1.72B, context no disponible, Apache 2.0, safetensors/GGUF, generalista.

Could add a row "Precisión" with "menor que el bundle según el autor" for fused.

Let's ensure no claims that "Qwen3-1.7B tiene 32k" etc.

One more: "Tipos de cuantizacion": "GGUF Q6_K; el autor cita Q4_K_M como opción que la integración de Ollama selecciona por defecto si está presente". Is Q4_K_M actually in repo? Unknown. Phrase carefully: "GGUF (Q6_K publicado; el autor menciona Q4_K_M en el contexto de la selección automática de Ollama)". Good.

"Formato de pesos": "GGUF; el repo incluye además Modelfile, system, template, params y manifest.json. No se incluyen safetensors en este repo." Is that certain? The repo is GGUF-only build; model card files list only GGUF and config files. Yes.

"Idiomas soportados": "inglés (en); el ajuste fino y los prompts están orientados a inglés". Good.

"Licencia": Apache 2.0, hereda de Qwen3-1.7B, incluye NOTICE.

Resumen 3 paragraphs ~8 lines.

Let me count lines; fine.

Use "Selora AI LLM 1.7B Ollama" naming. The model is "Selora AI LLM — fused single-model build".

Write final.## Resumen

Selora AI LLM 1.7B Ollama es un ajuste fino de Qwen3-1.7B desarrollado por Selora Homes para integrarse con Home Assistant. El modelo resuelve una tarea acotada: recibir un prompt de enrutado con las entidades disponibles, las automatizaciones existentes y, cuando procede, documentación relevante, y devolver un único objeto JSON con uno de cinco tipos de respuesta: `command`, `automation`, `answer`, `clarification` o `utilities`. Con 1.720.574.976 parámetros, está pensado para ejecutarse en local con Ollama o llama.cpp.

La particularidad de esta variante es que fusiona en un solo modelo los cinco adaptadores LoRA del bundle de referencia, de modo que no necesita intercambio en caliente de adaptadores. Eso simplifica el despliegue en runtimes que no soportan `--lora`, a cambio de una pérdida de precisión que el propio autor reconoce: en el bundle el llamador indica qué especialista usar; aquí el modelo decide el tipo de respuesta a partir del prompt de router.

Es relevante para quien busque un modelo pequeño, privado y de bajo coste para domótica local, con salida JSON estricta y licencia Apache 2.0. La ventana de contexto es de 4096 tokens y el modelo está orientado exclusivamente al inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3-1.7B, con un adaptador LoRA entrenado sobre cinco especialistas y fusionado en el modelo base |
| Parámetros totales | 1.720.574.976 (aproximadamente 1,72 B) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 4096 tokens (`num_ctx`) |
| Tipos de cuantización | GGUF Q6_K publicado; el autor menciona Q4_K_M en el contexto de la selección automática de cuantizaciones por parte de la integración de Ollama |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0, heredada de Qwen3-1.7B |
| Formato de pesos | GGUF; el repositorio incluye además `Modelfile`, `system`, `template`, `params` y `manifest.json`. No se incluyen safetensors en este repositorio |
| Modelo base | Qwen/Qwen3-1.7B |
| Tamaño del repositorio | 9,9 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso de 1,72 B de parámetros. Sobre esa base se entrenó un adaptador LoRA con ejemplos de los cinco especialistas del sistema Selora bajo el prompt de router que sirve esta build. Posteriormente, el adaptador se fusionó en los pesos base para producir un único GGUF. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

La interfaz es ChatML con el prefijo `/no_think` en el turno de usuario para suprimir el bloque de razonamiento de Qwen3 y obtener JSON limpio. El prompt incluye un bloque `<think></think>` vacío que forma parte de la plantilla, no de la salida; sin él, el modelo genera como si la apertura `{"` ya estuviera escrita y devuelve `q=[...]`, que ningún parser acepta. La generación usa temperatura 0,0, `repeat_penalty` 1,0, `repeat_last_n` 256 y tokens de parada `<|im_end|>` y `<|endoftext|>`. La penalización por repetición se mantiene en 1,0 de forma deliberada porque el JSON contiene muchos tokens estructurales repetidos y penalizarlos degrada la fidelidad del esquema.

La innovación principal no es arquitectónica, sino de empaquetado: un solo modelo que decide entre cinco tipos de respuesta, frente al bundle de referencia con cinco adaptadores separados y selección externa. El autor indica que, si el runtime permite intercambiar adaptadores, es preferible usar el bundle.

## Capacidades

- Generación de JSON estructurado con uno de cinco tipos de respuesta: `command`, `automation`, `answer`, `clarification` y `utilities`.
- Enrutado de intención a partir de un system prompt que describe el papel de router.
- Generación de comandos sobre entidades de Home Assistant a partir de la lista `AVAILABLE ENTITIES`.
- Generación de automatizaciones teniendo en cuenta el bloque `EXISTING AUTOMATIONS`.
- Respuestas informativas sobre el estado de la vivienda y consultas de tipo `utilities` con un bloque `RELEVANT DOCS`.
- Solicitud de aclaración cuando la petición es ambigua o falta información.
- Supresión del modo de razonamiento de Qwen3 mediante `/no_think`, con el bloque `<think></think>` vacío incorporado en la plantilla.
- Capacidad multilingüe limitada: el modelo está etiquetado y orientado al inglés.
- No se documenta soporte genérico de tool calling ni de function calling; la interfaz estructurada es el propio JSON de respuesta.
- No se documentan capacidades de agente multi-paso, visión, audio ni razonamiento encadenado.

## Casos de uso

- Control de dispositivos por texto o voz en Home Assistant: el modelo recibe la lista de entidades disponibles y devuelve un JSON `command` con la entidad y el servicio adecuados, lo que permite ejecutar acciones sin que el usuario escriba una sintaxis concreta.
- Creación de automatizaciones: a partir de una descripción en lenguaje natural y del bloque `EXISTING AUTOMATIONS`, genera un JSON `automation` con disparadores, condiciones y acciones, adecuado para revisión humana antes de activarlo.
- Consultas de estado de la vivienda: responde con el tipo `answer` a preguntas como el estado de una luz o la temperatura de una habitación, usando únicamente las entidades incluidas en el prompt.
- Desambiguación de peticiones: cuando la entidad o la acción no están claras, emite un JSON `clarification` en lugar de inventar un comando, lo que reduce acciones erróneas en producción.
- Consultas sobre facturas, tarifas o documentación de servicios: el tipo `utilities` incorpora un bloque `RELEVANT DOCS` que permite responder con el contexto documental proporcionado, sin recuperación externa.
- Asistente local privado en hardware modesto: al ser un modelo de 1,72 B con cuantización Q6_K, puede ejecutarse en una Raspberry Pi, un mini-PC o una GPU de gama baja sin enviar datos del hogar a la nube.
- Enrutado de intenciones en pipelines de domótica: el JSON de salida puede validarse contra un esquema y derivar la petición al servicio correspondiente, actuando como clasificador y generador en un solo paso.
- Generación de fixtures y pruebas para integraciones de Home Assistant: los cinco tipos de respuesta permiten construir casos de prueba representativos del protocolo Selora sin depender de un dispositivo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Evaluación | Resultado |
|---|---|
| Métricas internas del autor (`eval/baselines.json`, variantes `fused-*`) | No disponibles en la información proporcionada; el repositorio las menciona sin incluir cifras |
| MMLU, HumanEval, GSM8K u otros benchmarks públicos | No disponibles en la información proporcionada |

## Requisitos de hardware

- VRAM estimada para Q6_K: aproximadamente 1,4 GB solo de pesos; con 4096 tokens de contexto y caché KV en FP16, el consumo total ronda los 2-3 GB. Es una estimación a partir del tamaño del modelo y de la cuantización.
- VRAM estimada para Q4_K_M: aproximadamente 1,1 GB de pesos y alrededor de 1,5-2 GB en total con el contexto completo. Estimación orientativa.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM, como una RTX 3050 de 6 GB, una RTX 4060 de 8 GB o una RTX 3060 de 12 GB. También funciona en iGPU y en CPU.
- Cabe en GPU consumer: sí, en modelos de gama baja y en placas con memoria unificada. El límite práctico es la memoria disponible para el contexto de 4096 tokens.
- Opciones de despliegue: Ollama mediante `ollama run hf.co/selorahomes/Selora-AI-LLM-1.7B-ollama:selora-ollama.Q6_K.gguf`, o construcción local con `ollama create selora -f Modelfile`; llama.cpp para cargar el GGUF directamente. El bundle de adaptadores está pensado para llama.cpp con `--lora` y vLLM con `--enable-lora`, no para esta build fusionada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Selora AI LLM 1.7B Ollama (esta ficha) | 1,72 B | 4096 tokens | Apache 2.0 | GGUF Q6_K | Un solo modelo fusionado que elige entre cinco tipos de respuesta JSON para Home Assistant |
| Selora AI LLM 1.7B (bundle de adaptadores) | 1,72 B de base más cinco adaptadores LoRA | No disponible en la información proporcionada | Apache 2.0 | GGUF base más LoRA | El llamador activa el especialista adecuado; mayor precisión según el autor |
| Qwen3-1.7B | 1,72 B | No disponible en la información proporcionada | Apache 2.0 | Safetensors y otras conversiones | Modelo generalista de texto; no incluye el enrutado ni los esquemas JSON de Selora |

El autor indica explícitamente que la variante fusionada sacrifica algo de precisión frente al bundle de adaptadores. No se dispone de cifras comparativas de rendimiento en la información proporcionada.

## Limitaciones y advertencias

- El modelo está orientado únicamente al inglés; no se debe esperar un comportamiento multilingüe fiable aunque el Qwen3 base tenga capacidades en otros idiomas.
- La ventana de contexto de 4096 tokens limita el número de entidades, automatizaciones y documentos que se pueden incluir en el prompt. Hogares grandes o documentación extensa pueden requerir truncado o selección previa.
- El propio autor advierte de una pérdida de precisión frente al bundle de cinco adaptadores, porque el modelo debe decidir por sí mismo el tipo de respuesta.
- Riesgo de alucinación de entidades, servicios o automatizaciones inexistentes. Es imprescindible validar la salida JSON contra un esquema y contra el inventario real de Home Assistant antes de ejecutar acciones.
- La plantilla de chat debe coincidir byte a byte con la de entrenamiento. Omitir el bloque `<think></think>` vacío provoca que la salida pierda la apertura `{"` y no sea parseable.
- No se debe modificar la temperatura ni `repeat_penalty` sin reevaluar la fidelidad del esquema; el valor 1,0 de penalización por repetición es intencionado.
- No se documentan tool calling genérico, agentes multi-paso, visión ni audio; el modelo está diseñado para una respuesta JSON por turno.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el archivo `NOTICE` con la atribución a Qwen3.
- No hay benchmarks públicos ni métricas de latencia en la información disponible, por lo que la evaluación en producción debe hacerse con un conjunto propio de prompts y entidades.
- El repositorio ocupa 9,9 GB; conviene revisar qué artefactos adicionales se descargan si solo se necesita el GGUF Q6_K.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/selorahomes/Selora-AI-LLM-1.7B-ollama
- Bundle de adaptadores LoRA: https://huggingface.co/selorahomes/Selora-AI-LLM-1.7B
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio de modelos y pipeline de datos: https://gitlab.com/selorahomes/products/selora-ai/models
- Integración con Home Assistant: https://gitlab.com/selorahomes/products/selora-ai/ha-integration
- Métricas internas del autor: archivo `eval/baselines.json` del repositorio de modelos (no se proporciona URL directa)
