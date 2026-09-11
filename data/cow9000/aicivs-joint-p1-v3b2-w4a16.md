# cow9000/aicivs-joint-p1-v3b2-w4a16

## Resumen

aicivs-joint-p1-v3b2-w4a16 es un ajuste fino de openbmb/MiniCPM5-2B (2.516.756.480 parámetros, unos 2,5 B) publicado por el usuario cow9000, orientado a un único producto: AICivs, un mod de Minecraft en el que las aldeas funcionan como civilizaciones vivas con aldeanos dotados de personalidad, memoria, relaciones, misiones ancladas al mundo, guerras, hambrunas, sucesiones y crónicas escritas. El modelo no es un chatbot general: implementa las nueve operaciones del contrato de servicio del mod (AICivs contract 1.0, prompt version 1), cada una con un esquema JSON fijo y un presupuesto de latencia propio. Un solo modelo de 2,5 B atiende todas las operaciones, de modo que el runtime completo cabe en unos 8 GB de VRAM junto al juego.

La relevancia de esta ficha concreta está en el formato: es la compilación GPTQ W4A16 (grupo 128) generada con llm-compressor y calibrada sobre 252 prompts del propio servicio, con un peso de repositorio de 2,1 GB. Según la model card, la calidad igualó a la fusión en bf16 en la evaluación de la ruta de servicio (validador de diálogo al 100 %, concordancia de intención frente al profesor 73 % frente a 75 %) y alcanza p50 de 643 ms y p95 de 962 ms con 24 llamadas de diálogo concurrentes en una RTX 3090 Ti usando el 20 % de la tarjeta.

El modelo se entrenó por destilación de prompts: un mundo de 12 civilizaciones simulado sin interfaz durante 120 temporadas generó almas, memorias, crónicas y manifiestos, y un profesor Qwen3.8-27B respondió a los prompts largos y cargados de reglas, incluidos turnos multi-turno con un jugador interpretado por el profesor. El ajuste fue un LoRA de rango 64 posteriormente fusionado. El modelo está entrenado con el modo «thinking» desactivado y solo soporta inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (los tags del repositorio indican la familia llama); no se detalla la arquitectura interna en la información disponible |
| Parámetros totales | 2.516.756.480 (unos 2,5 B) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 8192 tokens en la configuración de servicio recomendada con vLLM (`--max-model-len 8192`); la longitud de contexto nativa del modelo base no se especifica en la información disponible |
| Tipos de cuantización | GPTQ W4A16, grupo 128, generada con llm-compressor y calibrada sobre 252 prompts del servicio; existe además una fusión en bf16 (LoRA r64 fusionada) y una compilación GGUF para llama.cpp |
| Idiomas soportados | Inglés (`language: [en]`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (W4A16); también safetensors en bf16 y GGUF |
| Modelo base | openbmb/MiniCPM5-2B |
| Pipeline | text-generation (conversational, structured-output) |
| Tamaño del repositorio | 2,1 GB |
| Autor | cow9000 |
| Fecha de creación / actualización en HuggingFace | 2026-09-11 / 2026-09-11 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de que se trata de un modelo de 2,5 B derivado de MiniCPM5-2B. El ajuste se realizó mediante LoRA de rango 64 que después se fusionó en los pesos, y la compilación descrita aquí aplica cuantización GPTQ W4A16 con grupo 128 mediante llm-compressor, calibrada sobre 252 prompts reales del contrato de servicio (no sobre un corpus genérico), lo que explica que la degradación medida en la ruta de servicio sea nula según el autor.

El entrenamiento es una destilación de prompts: el mundo de AICivs se simuló sin interfaz durante 120 temporadas y produjo almas, memorias, crónicas y manifiestos; un profesor Qwen3.8-27B respondió a los prompts largos y cargados de reglas, con un jugador interpretado por el propio profesor para generar conversaciones multi-turno. La model card describe el proceso en `docs/08-finetuning.md` del repositorio del mod, pero el texto disponible está truncado, por lo que no se detallan el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases adicionales de RLHF o DPO.

Como innovaciones relevantes de ingeniería: el modelo se entrenó con el modo de razonamiento desactivado (`enable_thinking: false`), la compilación cuantizada se integra en vLLM seleccionando automáticamente los kernels Marlin int4 con `--dtype bfloat16` y sin flags adicionales, y el autor recomienda la compilación GGUF sobre llama.cpp para las operaciones estructuradas porque su gramática aplica los patrones regex del contrato, algo que la gramática de vLLM descarta silenciosamente.

## Capacidades

- Generación de diálogo en personaje para NPC, con salida estructurada que incluye habla, intención del jugador, sinceridad, acciones permitidas, deltas de relación (confianza, afecto, respeto, miedo), delta de paciencia, estado de ánimo posterior y una memoria que conservar (`dialogue.respond`).
- Difusión de rumores con matización según el número de saltos recorridos por el rumor (`gossip.render`).
- Generación de misiones a partir de un manifiesto de referentes reales, con nodos de tipo acquire, deliver, travel, kill, escort, interact, build, defend, learn, gift y wait, motivos, seis líneas de diálogo, recompensa dentro de presupuesto y vínculos con la crónica (`quest.generate`).
- Reparación de misiones inválidas contra una lista de errores de validación, listando los cambios aplicados (`quest.repair`).
- Generación por lotes de personalidad de aldeanos: rasgos, registro de habla, motivaciones, peculiaridades y una línea de voz (`npc.personality`).
- Consolidación de memoria episódica sobre un jugador en creencias, con fuentes y retirada de identificadores de memoria (`npc.memory.consolidate`).
- Narración de eventos de civilización a partir de hechos calculados, con versiones por facción, inyecciones de memoria y cambios de ánimo (`civ.event.narrate`).
- Resumen de crónicas por década, era o leyenda, con selección de los eventos que merece la pena conservar (`civ.chronicle.summarize`).
- Autoría de historia fundacional de una civilización: eras, eventos, figuras, dinastías y edificios que la historia deja atrás (`civ.history.author`).
- Salida estructurada nativa vía `response_format: {"type": "json_schema", ...}` con los modelos pydantic del contrato del servicio, más `chat_template_kwargs: {"enable_thinking": false}`.
- Multilingüismo: no soportado, solo inglés.
- Capacidades de visión, audio o tool calling genérico: no disponibles en la información proporcionada.
- El autor indica explícitamente que no es un modelo de chat general: fuera del marco de prompts renderizados del servicio sigue respondiendo, pero no aplica las reglas de anclaje del juego.

## Casos de uso

- Diálogo de aldeanos en tiempo real dentro del mod AICivs: el modelo recibe un system prompt corto que nombra al hablante con su voz, rasgos y estado de ánimo, y un turno de usuario con el contexto y las acciones permitidas, devolviendo habla, intención del jugador, deltas de relación y una memoria. El presupuesto declarado es de 1,5 s por respuesta, y con el 20 % de una tarjeta de 24 GB sostiene 24 llamadas concurrentes con p95 de 962 ms.
- Propagación de rumores con degradación controlada: `gossip.render` reproduce un rumor matizado por el número de saltos que ha recorrido, con un presupuesto de 1 s, lo que permite simular cadenas de transmisión sin que la información llegue intacta al jugador.
- Generación de misiones ancladas al mundo: `quest.generate` trabaja sobre un manifiesto de referentes reales (nodos, motivos, recompensas, vínculos de crónica) con 8 s de presupuesto, de modo que las misiones solo mencionan personas, lugares y objetos que existen en la partida.
- Reparación automática de misiones rotas: `quest.repair` recibe la misma misión más una lista de errores de validación y devuelve la versión corregida con los cambios enumerados, en 5 s. Es el caso típico de un pipeline de validación en el servidor del juego.
- Poblado de aldeas nuevas en lote: `npc.personality` genera rasgos, registro de habla, motivaciones, peculiaridades y una línea de voz para un lote de aldeanos en 5 s, evitando escribir contenido a mano al fundar una aldea.
- Memoria a largo plazo de los NPC: `npc.memory.consolidate` pliega recuerdos episódicos sobre un jugador en creencias con fuentes y retirada de los identificadores antiguos, con un presupuesto de 10 s. Sirve para que un aldeano «recuerde» a un jugador a lo largo de varias sesiones sin hacer crecer el contexto indefinidamente.
- Crónica viva de una civilización: `civ.event.narrate` (15 s), `civ.chronicle.summarize` (60 s) y `civ.history.author` (300 s) cubren desde la narración de un suceso concreto hasta la historia fundacional completa con dinastías y edificios heredados, encajando en procesos asíncronos que no bloquean la partida.
- Backend de salida estructurada para contratos fijos: al margen de Minecraft, cualquier servicio que necesite rellenar esquemas JSON estables y verificables contra un manifiesto de identificadores puede reutilizar el patrón (diálogo con deltas numéricos, resúmenes con referencias, generación con listas de elementos permitidos), siempre que el servidor aplique el recorte de rangos numéricos y la validación de referencias.
- Prototipado de servicio de bajo coste: con ~2 GB de pesos y un runtime de unos 8 GB, es un caso práctico para levantar un endpoint compatible con OpenAI sobre una GPU de consumo o compartida, con vLLM y prefix caching activados.

## Benchmarks y rendimiento

La información disponible no incluye resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares). Los únicos datos publicados son de la ruta de servicio:

| Métrica | Resultado |
|---|---|
| Validador de diálogo | 100 % |
| Concordancia de intención frente al profesor | 73 % frente a 75 % (la model card no aclara a qué corresponde cada cifra) |
| Calidad frente a la fusión en bf16 | Igualada en la evaluación de la ruta de servicio, según el autor |
| Latencia p50 (24 llamadas de diálogo concurrentes, RTX 3090 Ti, 20 % de la tarjeta) | 643 ms |
| Latencia p95 (mismo escenario) | 962 ms |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- Pesos cuantizados W4A16: aproximadamente 2 GB; el repositorio completo ocupa 2,1 GB en disco.
- Runtime completo: la model card indica unos 8 GB de memoria de GPU para el modelo junto al juego.
- El ejemplo de despliegue usa `--gpu-memory-utilization 0.20` sobre una tarjeta de 24 GB, es decir, unos 4,8 GB reservados incluyendo caché KV y activaciones, con `--max-num-seqs 64` y `--enable-prefix-caching`.
- GPU probada: RTX 3090 Ti (24 GB), donde se midieron p50 de 643 ms y p95 de 962 ms con 24 llamadas concurrentes.
- GPU de consumo: según la cifra de ~8 GB del autor, cabría en tarjetas de gama media con al menos 8 GB de VRAM, pero no se enumeran modelos concretos probados en la información disponible.
- GPU de centro de datos (A100, H100) y latencias o throughput asociados: no disponibles en la información proporcionada.
- Despliegue con vLLM: imagen `vllm/vllm-openai:v0.22.0`, `--dtype bfloat16`, `--max-model-len 8192`, `--served-model-name aicivs-joint-p1-v3b2-w4a16`, `--ipc=host`, puerto 8003. Los kernels Marlin int4 se seleccionan automáticamente.
- Despliegue con llama.cpp: existe una compilación GGUF, recomendada por el autor para las operaciones estructuradas porque su gramática aplica los patrones regex del contrato (vLLM descarta silenciosamente un esquema que lleve uno).
- Soporte en Ollama o TGI: no mencionado en la información disponible.
- Temperaturas recomendadas: 0,8 para diálogo y rumores; 0,6 para las operaciones estructuradas.

## Comparativa con modelos similares

No se proporcionan datos comparativos frente a otros modelos de la misma categoría. La comparación posible con la información disponible es entre las propias compilaciones del modelo:

| Variante | Formato | Tamaño | Uso recomendado |
|---|---|---|---|
| aicivs-joint-p1-v3b2-w4a16 | safetensors compressed-tensors W4A16, grupo 128 | ~2 GB | `dialogue.respond` y `gossip.render` en vLLM con kernels Marlin |
| Fusión bf16 (LoRA r64 fusionada) | safetensors bf16 | No disponible | Referencia de calidad para comparar la cuantización |
| Compilación GGUF | GGUF | No disponible | Operaciones estructuradas en llama.cpp, con gramática que aplica los patrones regex del contrato |
| openbmb/MiniCPM5-2B (modelo base) | No disponible | No disponible | Modelo generalista previo al ajuste por destilación; sus especificaciones y rendimiento no se detallan en la información disponible |
| Qwen3.8-27B (profesor de destilación) | No disponible | No disponible | Solo se menciona como generador de las respuestas de entrenamiento; no es una alternativa de despliegue para este caso de uso |

Otros modelos comparables de 2-3 B orientados a salida estructurada: no disponibles en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat general. Espera los prompts renderizados por el servicio (un system prompt corto que nombra al hablante y un turno de usuario con contexto y acciones permitidas) y responde en el JSON del contrato. Fuera de ese marco sigue respondiendo, pero sin aplicar las reglas de anclaje del juego.
- Riesgo de alucinación de referencias: el modelo puede citar identificadores que no están en el manifiesto de la petición. El propio autor indica que el lado servidor debe validar cada identificador de la respuesta contra el manifiesto y reparar o aplicar un fallback cuando falle.
- Los límites numéricos (`minimum`/`maximum`) no los aplica la gramática de vLLM. Hay que recortar valores como una valencia de `-1.1` en lugar de rechazarlos.
- La gramática de vLLM descarta silenciosamente un esquema que incorpore patrones regex; para esas operaciones el autor recomienda la compilación GGUF sobre llama.cpp.
- Idioma único: inglés. No hay soporte multilingüe, ni siquiera para castellano.
- Longitud de contexto: 8192 tokens en la configuración de servicio recomendada; no se especifica el contexto nativo del modelo base, por lo que no se puede garantizar un comportamiento correcto por encima de ese valor.
- Modo de razonamiento desactivado por entrenamiento: debe enviarse `enable_thinking: false`. No hay información sobre el comportamiento del modelo si se activa.
- Licencia Apache 2.0: permite uso comercial y modificación, pero al derivar de openbmb/MiniCPM5-2B conviene revisar las condiciones del modelo base, no detalladas en la información disponible.
- Adopción nula en el momento de la consulta: 0 descargas y 0 likes, sin validación independiente de los resultados reportados por el autor.
- La model card está truncada en la información disponible, por lo que faltan detalles del proceso de entrenamiento (tokens totales, composición del dataset, fases de alineación) y la descripción del evaluador utilizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cow9000/aicivs-joint-p1-v3b2-w4a16
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Imagen de despliegue recomendada: `vllm/vllm-openai:v0.22.0` (Docker Hub, vLLM)
- Documentación de entrenamiento citada por el autor: `docs/08-finetuning.md` del repositorio del mod AICivs (no se proporciona URL en la información disponible)
- Contrato del servicio citado por el autor: `service/aicivs_service/contract/` (modelos pydantic, no se proporciona URL)
- Script de arranque citado por el autor: `ops/aicivs-up.sh` (no se proporciona URL)
- Papeles, blogs o demos adicionales: las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo.
