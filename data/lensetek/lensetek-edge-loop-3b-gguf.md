# lensetek/lensetek-edge-loop-3b-GGUF

## Resumen

Lensetek-Edge-Loop-3B es un modelo de lenguaje pequeno (SLM) de 3.085.938.688 parametros (~3B) desarrollado por lensetek, derivado mediante ajuste fino del modelo base Qwen/Qwen2.5-3B-Instruct. Esta disenado especificamente para computacion de borde en entornos industriales aislados (air-gapped), con el objetivo declarado de ofrecer razonamiento agentico y llamadas a funciones con un consumo de RAM activa inferior a 2,5 GB. El repositorio distribuido en Hugging Face contiene pesos cuantizados a 4 bits en formato GGUF (`Q4_K_M`, ~1,93 GB), pensados para ejecutarse en mini PC, SBC o CPU sin GPU dedicada.

El modelo se presenta como una variante especializada que incorpora un "System-2 Agentic Compute Loop" y modos de esfuerzo adaptativos (`[EFFORT:LOW]` y `[EFFORT:HIGH]`), junto con entrenamiento mediante GRPO/RLVR orientado a la abstencion calibrada y la recuperacion de errores multi-turno. Segun la model card, el ajuste se realizo sobre pesos compatibles con `Qwen2ForCausalLM` sin modificar la arquitectura subyacente, por lo que el "looped transformer" del nombre hace referencia a un bucle de computo a nivel de inferencia y no a un cambio estructural del transformer.

Es relevante ahora porque cubre un nicho concreto: despliegue de agentes con tool calling en hardware de muy bajos recursos y sin conectividad, un escenario comun en IoT industrial, mantenimiento de campo y soberania de datos. Su licencia Apache 2.0 y su compatibilidad con llama.cpp facilitan la evaluacion y el despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2ForCausalLM), con bucle de computo agentico a nivel de inferencia |
| Parametros totales | 3.085.938.688 (~3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF `Q4_K_M` (4 bits); safetensors BF16 en el repo base |
| Idiomas soportados | en, id, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo actual); safetensors BF16 (repo base) |

## Arquitectura y entrenamiento

El modelo parte de los pesos de Qwen2.5-3B-Instruct, un transformer decoder-only denso de ~3B parametros, y aplica ajuste fino supervisado mas optimizacion por refuerzo (GRPO/RLVR) sobre un curriculo de aproximadamente 3.000 trayectorias organizadas en seis clusters: llamada a herramientas determinista (~17%), recuperacion de errores multi-turno (~33%), abstencion calibrada (~17%), bucles de esfuerzo ajustables (~13%), supervivencia offline e IoT (~12%) y un sexto cluster no detallado en la informacion disponible. El 35% del dataset contiene trayectorias de fallo planificadas para entrenar la autocorreccion.

La innovacion declarada no reside en la arquitectura, que se mantiene compatible con llama.cpp, sino en el ajuste de comportamiento: penalizaciones asimetricas en GRPO (+0,8 por abstenerse correctamente, -2,0 por alucinar fuera de contexto), etiquetas de esfuerzo que controlan el presupuesto de tokens de razonamiento (`[EFFORT:LOW]` bajo 25 tokens, `[EFFORT:HIGH]` con scratchpad `<think>` de 150-250 tokens) y calibracion consciente de cuantizacion para preservar el cumplimiento de esquemas JSON en 4 bits. No se especifican en la informacion proporcionada el numero total de tokens de entrenamiento, la composicion exacta del dataset ni los hiperparametros de RL.

## Capacidades

- Generacion de texto conversacional en ingles, indonesio y chino.
- Llamada a funciones y tool calling con argumentos JSON validos para herramientas como `rag_search`, `read_sensor` y `run_command`.
- Razonamiento agentico multi-paso con recuperacion de errores entre turnos (reformulacion de llamadas tras codigos de error).
- Abstencion calibrada: rechazo explicito a responder cuando la informacion no esta en el contexto local.
- Modos de esfuerzo adaptativos: respuesta directa de baja latencia o razonamiento extendido con scratchpad interno.
- RAG en dominio cerrado sobre documentos locales, con citas.
- Capacidades de dominio industrial y de supervivencia: triaje de victimas (START), purificacion de agua en cuatro etapas, protocolos Modbus/CAN-bus.
- Comprension de terminologia industrial indonesia y code-switching tecnico.
- No se documentan capacidades de vision, audio ni matematica avanzada.

## Casos de uso

- Atencion al cliente o soporte tecnico en planta: el modelo gestiona conversaciones multi-turno y consulta una base documental local mediante `rag_search`, absteniendose cuando no hay cobertura documental, lo que reduce respuestas inventadas en entornos regulados.
- Automatizacion de mantenimiento industrial: integrado en un mini PC junto a sensores, usa `read_sensor` y `run_command` para diagnosticar lecturas anomalas y proponer acciones correctivas siguiendo procedimientos operativos estandar.
- Asistente de campo en zonas sin conectividad: desplegado en una SBC con menos de 2,5 GB de RAM, ofrece guias de triaje y protocolos de emergencia sin depender de la nube.
- Agente de RAG air-gapped para documentacion interna: indexa manuales y normativas en SQLite local y responde con citas, adecuado por su tasa declarada de alucinacion nula en dominio cerrado.
- Automatizacion de pipelines de tool calling: su cumplimiento de esquema JSON en cuantizacion 4 bits lo hace apto para orquestar APIs internas o sistemas SCADA mediante llamadas estructuradas.
- Procesamiento de lenguaje natural en logistica y operaciones en Indonesia: cubre terminologia local y code-switching, util para digitalizar SOP y comunicaciones tecnicas.
- Prototipado rapido de agentes en CPU: al ejecutarse con llama.cpp en hardware de bajo coste, sirve para validar flujos agenticos antes de escalar a modelos mayores.

## Benchmarks y rendimiento

| Metrica | Resultado declarado | Condiciones |
|---|---|---|
| Tasa de completitud de tareas end-to-end | 100,0% | 300 escenarios reservados, pipelines multi-paso |
| Tasa de alucinacion en dominio cerrado | 0,0% | 300 escenarios reservados, benchmarks documentales empresariales |
| Latencia en modo `[EFFORT:LOW]` | < 320 ms | Respuesta bajo 25 tokens |
| Precision de tool calling | 100% (declarada) | Esquemas JSON validos en cuantizacion `Q4_K_M` |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las metricas anteriores son autoinformadas por el autor y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM/RAM para inferencia: ~1,93 GB de pesos en `Q4_K_M`; RAM activa declarada por debajo de 2,5 GB y techo de sistema de 3,7 GB.
- Cabe en CPU y en hardware de borde: mini PC, SBC y sistemas sin GPU dedicada.
- En GPU consumer (por ejemplo, RTX 3060/4060 con 8-12 GB) cabe con holgura, aunque el diseno apunta a ejecucion en CPU.
- Opciones de despliegue: llama.cpp y cualquier runtime compatible con GGUF (Ollama, LM Studio); el repo base BF16 admite vLLM y SGLang.
- Latencia: inferior a 320 ms en modo de bajo esfuerzo segun el autor; no se proporcionan cifras de throughput (tokens/s) ni de latencia en modo `[EFFORT:HIGH]`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Lensetek-Edge-Loop-3B | ~3B | no disponible | en, id, zh | Apache 2.0 | Agentes de borde, tool calling, abstencion |
| Qwen2.5-3B-Instruct (base) | ~3B | 32.768 tokens (segun documentacion de Qwen) | multilingue amplio | Apache 2.0 | Instrucciones generales |
| Llama 3.2 3B Instruct | ~3B | 128.000 tokens (segun documentacion de Meta) | multilingue | Llama 3.2 Community License | Instrucciones generales, edge |
| Phi-3.5-mini | ~3,8B | 128.000 tokens (segun documentacion de Microsoft) | multilingue | MIT | Razonamiento y codigo en edge |

La comparativa de rendimiento frente a estas alternativas no esta disponible en la informacion proporcionada; los datos de contexto de los modelos comparables proceden de su documentacion publica y no de una evaluacion conjunta.

## Limitaciones y advertencias

- Las metricas de 100% de completitud y 0% de alucinacion son autoinformadas sobre 300 escenarios y no han sido replicadas de forma independiente; deben tratarse con cautela en produccion.
- El modelo conserva los sesgos del corpus de Qwen2.5-3B-Instruct y de los datos de ajuste, con fuerte orientacion al contexto industrial indonesio.
- Cobertura linguistica limitada a ingles, indonesio y chino; el castellano no esta entre los idiomas soportados declarados.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide planificar cargas de RAG con documentos largos.
- El termino "looped transformer" del nombre no implica cambios arquitectonicos; el bucle es de inferencia, por lo que las ventajas de razonamiento dependen del prompting y del ajuste, no de la estructura.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-3B-Instruct debe respetar sus propios terminos.
- El repo tiene muy poca traccion (280 descargas, 1 like) y fue creado recientemente; no hay evidencia de validacion por terceros.
- El repo base en safetensors figura como "en cola de subida" en la model card, por lo que la unica distribucion verificable es la cuantizada GGUF.

## Enlaces

- Repositorio GGUF: https://huggingface.co/lensetek/lensetek-edge-loop-3b-GGUF
- Repositorio base BF16: https://huggingface.co/lensetek/lensetek-edge-loop-3b
- Hub de aplicaciones y agente: https://huggingface.co/lensetek/lensetek-edge-ai-agent
- Descarga directa del GGUF: https://huggingface.co/lensetek/lensetek-edge-loop-3b-GGUF/resolve/main/lensetek-edge-loop-3b-q4_k_m.gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
