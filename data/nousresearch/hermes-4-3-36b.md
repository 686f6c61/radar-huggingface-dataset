# NousResearch/Hermes-4.3-36B

## Resumen

Hermes-4.3-36B es un modelo de lenguaje de tipo instruct y razonamiento híbrido desarrollado por Nous Research, construido mediante fine-tuning sobre el modelo base ByteDance-Seed/Seed-OSS-36B-Base. Con 36.151.104.512 parámetros (aproximadamente 36B), está diseñado para ofrecer capacidades frontier de razonamiento, matemáticas, código, STEM y lógica, manteniendo a la vez una alineación "neutra" y altamente steerable. Es la primera entrega de la familia Hermes entrenada de forma descentralizada a través de internet mediante la red Psyche.

El modelo introduce un modo de razonamiento híbrido: puede emitir segmentos explícitos `<think>…</think>` cuando decide deliberar, o responder directamente sin cadena de pensamiento, lo que permite ajustar latencia y coste según la tarea. Incorpora además soporte nativo para function calling, tool use, JSON mode y salidas estructuradas conformes a esquemas, lo que lo hace apto para pipelines agénticos y de automatización.

Su relevancia actual radica en dos factores: por un lado, su rendimiento declarado en RefusalBench (74,60% en modo no razonamiento y 72,29% en modo razonamiento), que lo sitúa como SOTA entre modelos no abliterados según el autor; por otro, una licencia Apache 2.0 que permite uso comercial sin restricciones adicionales, algo poco habitual en modelos de este tamaño con capacidades de razonamiento avanzadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base ByteDance Seed-OSS-36B) |
| Parametros totales | 36.151.104.512 (~36B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la model card menciona "long context" sin cifra) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (formato safetensors en BF16/FP16 presumible por tamano de repo) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura del ByteDance Seed-OSS-36B, un transformer decoder-only de aproximadamente 36B parametros. Nous Research aplica sobre esta base un post-entrenamiento intensivo con un corpus sintetizado que pasa de 1M muestras y 1.2B tokens (Hermes 3) a aproximadamente 5M muestras y 60B tokens, mezclando datos de razonamiento y no razonamiento. El entrenamiento se ha realizado de forma descentralizada sobre la red Psyche, lo que constituye la primera vez que Nous Research entrena un Hermes de esta forma.

El post-entrenamiento enfatiza trazas de razonamiento verificadas, mejoras sustanciales en matematicas, codigo, STEM, logica y creatividad, asi como fidelidad al formato (JSON valido, reparacion de objetos malformados). El modelo soporta un modo hibrido de razonamiento: cuando decide deliberar, emite segmentos `<think>…</think>` controlables mediante el flag `thinking=True` en la plantilla de chat o mediante un system prompt especifico. Tambien existe la opcion `keep_cots=True` para conservar el contenido interno de razonamiento. La alineacion se orienta a reducir tasas de rechazo y aumentar la steerability, con un enfasis explicito en alineacion "neutra" y conformidad con los valores del usuario.

## Capacidades

- Generacion de texto conversacional multi-turno con formato Llama-3-Chat (role headers y `<|eot_id|>`).
- Razonamiento hibrido: modo con cadena de pensamiento explicita (`<think>…</think>`) o modo directo sin deliberacion.
- Razonamiento matematico y STEM de nivel avanzado (AIME, MATH-500, GPQA).
- Generacion de codigo y resolucion de problemas logicos.
- Function calling y tool use, con definiciones de herramientas intercalables con el system prompt de razonamiento.
- JSON mode y salidas estructuradas conformes a esquemas, incluyendo reparacion de objetos JSON malformados.
- Capacidades de roleplaying y escritura creativa.
- Steerability elevada y bajas tasas de rechazo (RefusalBench SOTA entre modelos no abliterados segun el autor).
- Capacidades multilingues limitadas al ingles segun la model card.
- No se declara soporte de vision ni audio en la informacion disponible.

## Casos de uso

- Agentes autonomos con tool calling: el modelo puede integrarse en bucles agénticos multi-paso donde invoca funciones externas (APIs, bases de datos, calculadoras) y encadena razonamiento entre llamadas, gracias al soporte nativo de function calling y a la posibilidad de intercalar definiciones de herramientas con el prompt de razonamiento.
- Generacion de codigo en produccion: puede generar parches, tests y refactorizaciones, y devolver salidas estructuradas en JSON valido para integrarse en pipelines de CI/CD o en herramientas de revision automatica.
- Razonamiento matematico y analisis cuantitativo: adecuado para resolver problemas de competicion (AIME, MATH-500) y para asistencia en modelado financiero o cientifico donde se requiere cadena de pensamiento verificable.
- Extraccion de datos estructurados: con JSON mode y reparacion de esquemas, puede transformar texto no estructurado (contratos, informes, correos) en objetos JSON conformes a un esquema definido, reduciendo post-procesado.
- Asistencia conversacional avanzada y roleplay: pensado para chat multi-turno con contexto largo, personajes consistentes y baja tasa de rechazo, util en plataformas de entretenimiento, simulacion o formacion.
- Investigacion en alineacion y steerability: su enfasis en alineacion neutra y su rendimiento en RefusalBench lo hacen util como objeto de estudio para experimentos de alineacion, evaluacion de sesgos y comparativas de tasas de rechazo.
- Automatizacion de soporte tecnico especializado: con contexto largo y capacidad de razonamiento, puede gestionar conversaciones tecnicas multi-turno (documentacion, troubleshooting) manteniendo coherencia y sin derivar prematuramente.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (comparativa entre la version entrenada en Psyche, la centralizada y Hermes 4 70B):

| Benchmark | Hermes 4.3 36B Psyche | Hermes 4.3 36B Centralized | Hermes 4 70B Centralized |
|---|---|---|---|
| AIME 24 | 71.9 | 70.6 | 73.5 |
| AIME 25 | 69.3 | 66.8 | 67.4 |
| BBH | 86.4 | 84.7 | 87.8 |
| DROP | 83.5 | 81.6 | 85.0 |
| GPQA Diamond | 65.5 | 64.8 | 66.1 |
| IFEval | 77.9 | 73.9 | 78.7 |
| MATH-500 | 93.8 | 92.3 | 95.5 |
| MMLU | 87.7 | 86.5 | 88.4 |
| MMLU-Pro | 80.7 | 79.7 | 80.7 |
| MuSR | 69.7 | 64.7 | 70.4 |
| OBQA | 96.6 | 91.8 | 94.8 |
| SimpleQA | 6.0 | 5.6 | 17.9 |

RefusalBench (porcentaje de preguntas respondidas, media de 5 ensayos, datos del autor):

| Modelo | % respondido |
|---|---|
| Hermes 4.3 36B Non-Reasoning | 74.60% |
| Hermes 4.3 36B Reasoning | 72.29% |
| Hermes 4 70B Reasoning | 59.50% |
| Hermes 4 405B Reasoning | 57.10% |
| grok4 | 51.30% |
| Hermes 4 70B | 49.07% |
| Hermes 4 405B | 43.20% |
| Qwen2.5 7B | 36.10% |
| Qwen3 235B Reasoning | 34.30% |
| DeepSeek V3 | 28.10% |
| Gemini 2.5 Pro | 24.23% |
| Llama 405B | 21.70% |
| Gemini 2.5 Flash | 19.13% |
| GPT4o | 17.67% |
| Sonnet 4 | 17.00% |
| GPT4-mini | 16.76% |
| R1 | 16.70% |
| cogito-v2-405B Reasoning | 15.40% |
| Opus 4.1 | 15.38% |
| Qwen3 235B | 15.30% |
| cogito-v2-405B | 14.94% |
| GPT 5 | 11.34% |
| gpt-oss 120B | 5.60% |
| gpt-oss 20B | 4.79% |

Nota: el `model-index` del repositorio no contiene resultados adicionales a los de la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16/FP16, aproximadamente 72 GB de pesos, por lo que requiere al menos 80 GB de VRAM para cargar el modelo completo sin cuantizar (A100 80GB, H100 80GB).
- Cuantizacion: al no publicarse GGUF/AWQ/GPTQ oficiales en la informacion disponible, las opciones pasan por cuantizar a 8 bits (~36 GB) o 4 bits (~18-20 GB) con herramientas como bitsandbytes, aunque no se garantiza calidad ni se documenta soporte oficial.
- GPU recomendadas: A100 80GB, H100 80GB, H200 para inferencia en precision completa; multiples RTX 4090 (24 GB) mediante tensor parallelism para FP16; una sola RTX 4090 o RTX 3090 podria alojar versiones cuantizadas a 4 bits, con limitaciones de contexto y rendimiento.
- Despliegue: compatible con transformers (libreria declarada); tambien aparece listado en LM Studio y en Nous Portal (Inference API). No se confirma soporte oficial de vLLM, TGI, llama.cpp u Ollama en la informacion disponible, aunque el formato safetensors y la base transformers permiten su conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Hermes-4.3-36B | ~36B | no disponible | Apache 2.0 | Razonamiento hibrido, tool calling, RefusalBench 74,60% (no reasoning) |
| Hermes 4 70B | ~70B | no disponible | Apache 2.0 (familia Hermes 4) | Mayor rendimiento en benchmarks (MMLU 88.4, MATH-500 95.5), RefusalBench 49,07% en modo base |
| Qwen3 235B (Reasoning) | 235B (MoE) | no disponible | Apache 2.0 | RefusalBench 34,30% en modo reasoning segun el autor; mayor escala |
| gpt-oss 120B | 120B | no disponible | no disponible en la informacion | RefusalBench 5,60% segun el autor; referencia open-weight de OpenAI |

La comparativa se limita a los datos de RefusalBench y benchmarks declarados por Nous Research; no se dispone de evaluaciones independientes en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: la model card solo declara ingles (`en`); el rendimiento en castellano u otros idiomas no esta garantizado ni evaluado.
- Alucinacion: SimpleQA de 6.0 (frente a 17.9 de Hermes 4 70B) indica una tasa baja de respuestas correctas en preguntas factuales de respuesta corta, lo que sugiere cautela en tareas de conocimiento factual preciso.
- Contexto: aunque se etiqueta como "long context", no se especifica la longitud exacta soportada, lo que impide planificar despliegues con requisitos de contexto definidos.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; la alineacion "neutra" y la reduccion de rechazos pueden implicar respuestas en dominios sensibles que requieran filtros adicionales en produccion.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base (ByteDance Seed-OSS-36B) puede tener condiciones adicionales que conviene revisar antes de desplegar.
- Formato de pesos: solo safetensors; no hay GGUF, AWQ ni GPTQ oficiales, lo que limita el despliegue en entornos de bajos recursos sin cuantizacion manual.
- Modo razonamiento: el contenido dentro de `<think>…</think>` puede filtrarse si no se gestiona con `keep_cots=False`; conviene controlarlo en produccion para no exponer cadenas de pensamiento internas.
- Reproducibilidad: los benchmarks son declarados por el autor; no se dispone de evaluaciones independientes en la informacion proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/NousResearch/Hermes-4.3-36B
- Informe tecnico Hermes 4 (arXiv): https://arxiv.org/abs/2508.18255
- Blog de lanzamiento Hermes 4.3: https://nousresearch.com/introducing-hermes-4-3/
- Nous Research: https://nousresearch.com/
- Nous Portal (Inference API): https://portal.nousresearch.com/
- Nous Chat: https://chat.nousresearch.com
- Red Psyche: https://psyche.network
- Hermes Agent: https://hermes-agent.nousresearch.com/
- LM Studio: https://lmstudio.ai/nousresearch/hermes-4.3-36b
- Modelo base: https://huggingface.co/ByteDance-Seed/Seed-OSS-36B-Base
