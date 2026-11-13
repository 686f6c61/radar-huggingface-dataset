# martinnavs/granite-4.0-h-350m-router-kd-web4-s0

## Resumen

`martinnavs/granite-4.0-h-350m-router-kd-web4-s0` es un adaptador LoRA sobre el modelo base `ibm-granite/granite-4.0-h-350m` de IBM, publicado por el usuario `martinnavs`. No es un asistente general, sino un enrutador (router) especializado para un agente de voz local: recibe lo que dice el usuario, los últimos turnos de conversación y una agenda de contactos, y emite una o varias líneas en un lenguaje de línea fijo (`NAME|arg|arg`) que representan llamadas a herramientas, o bien una señal `escalate|<motivo>` para delegar en un modelo alojado de mayor tamaño (Gemini).

El modelo resuelve un problema de coste y latencia: en lugar de invocar un modelo remoto en cada turno (0,95 s p50 y 1,82 s p95 para la primera llamada según la model card), las peticiones simples (encender luces, consultar la hora, el tiempo, un resumen de Wikipedia, volumen del altavoz) se resuelven localmente con un modelo de 350M de parámetros. Todo lo demás (código, documentos, razonamiento, flujos multi-paso) se escala de forma explícita.

El adaptador se ha destilado a partir de un profesor LoRA de 1B de la misma familia, entrenado sobre datos generados por plantillas (ningún modelo alojado generó ni parafraseó los datos). El repositorio ocupa 0,1 GB y se distribuye bajo licencia Apache 2.0. Está pensado para servirse con un mensaje de sistema exacto y una gramática GBNF que fuerce líneas bien formadas; fuera de ese entorno no se comporta como un asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 32, alpha 64, dropout 0.05) sobre transformer `ibm-granite/granite-4.0-h-350m` |
| Parametros totales | 350M en el modelo base (el adaptador LoRA añade un conjunto reducido de pesos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card (el adaptador se publica en safetensors; el base admite las cuantizaciones habituales de la familia Granite) |
| Idiomas soportados | en, tl (ingles y tagalo, segun los tags del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el base en formato nativo de Transformers |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `ibm-granite/granite-4.0-h-350m`, un transformer de 350M de parámetros de la familia Granite 4.0 de IBM. El LoRA tiene rango 32, alpha 64 y dropout 0.05, y se inyecta en todas las capas lineales del base: `in_proj`, `out_proj`, `input_linear`, `output_linear`, `q_proj`, `k_proj`, `v_proj` y `o_proj`. La decodificación recomendada es greedy (`do_sample=False`), con `max_new_tokens=64`.

El entrenamiento es una destilación desde un profesor LoRA de 1B de la misma familia Granite, sobre datos generados por plantillas (sin intervención de modelos alojados en la generación o paráfrasis de los datos). El router se entrena sobre unos 28 nombres de herramientas: 17 intenciones de hogar, herramientas de información, herramientas del Raspberry Pi, `none` (respuesta hablada) y `escalate`. La model card advierte que, al ser datos generados por plantilla, las puntuaciones de dev son optimistas y que las cifras relevantes son las medidas en el portátil con el stack real.

La innovación principal no es arquitectónica sino de formato: el modelo emite un lenguaje de línea fijo (`NAME|arg|arg`), pensado para servirse bajo una gramática GBNF que garantice líneas bien formadas. Las reglas de enrutamiento están codificadas en datos dedicados: aritmética siempre escala (`escalate|reasoning`), comandos negados no se ejecutan, contactos se resuelven contra la agenda del mensaje de sistema, y una petición independiente tras una acción previa no repite la llamada anterior.

## Capacidades

- Enrutamiento de intenciones a un conjunto cerrado de herramientas de hogar, información y del dispositivo (encender/apagar luces, temporizadores, hora, tiempo, resumen de Wikipedia, volumen y estado del altavoz).
- Emisión de un lenguaje de línea estructurado (`NAME|arg|arg`), una llamada por línea.
- Decisión explícita de escalado a un modelo alojado mediante `escalate|<tools|code|workflow|reasoning|other>`.
- Respuestas habladas cortas mediante `none|<respuesta>`, incluidas peticiones de aclaración cuando falta un valor (por ejemplo, `none|For how long?`).
- Resolución de contactos contra una agenda embebida en el mensaje de sistema; un nombre ausente produce `none|<nombre> is not in the phonebook.`.
- Consultas de hechos actuales de un solo paso mediante `web_answer|<pregunta completa y autocontenida>`.
- Manejo de historial multi-turno con turnos previos en formato de chat, incluidas respuestas del modelo alojado mostradas como `none|<primeros 100 caracteres>`.
- Capacidad multilingüe limitada a inglés y tagalo (según los tags del repositorio), con ejemplos de comandos en tagalo en la model card.
- No soporta tool calling genérico, agentes multi-paso, visión, audio ni modo de razonamiento: precisamente esas peticiones se escalan.

## Casos de uso

- Enrutamiento local en un agente de voz doméstico: el router decide si el turno se resuelve con una herramienta local (luces, temporizador, hora, tiempo) o se delega en Gemini, reduciendo la latencia del primer turno frente a una llamada remota por turno (0,95 s p50 / 1,82 s p95 en el camino antiguo).
- Control por voz de dispositivos del hogar en inglés y tagalo: comandos como `turn on the lights` o `patayin mo ang ilaw` se traducen a `LIGHT_ON` / `LIGHT_OFF` sin salir del dispositivo.
- Gestión de temporizadores y consultas horarias con zona horaria: `set a timer for ten minutes` produce `TIMER|10 minutes` y `what time is it in Tokyo` produce `get_current_time|Asia/Tokyo`.
- Consultas de hechos actuales de un solo paso: `who is the current governor of Cebu` se convierte en `web_answer|Who is the current Governor of Cebu?`, dejando la investigación multi-paso al modelo alojado.
- Marcación por voz con agenda de contactos: el router resuelve nombres contra la agenda del mensaje de sistema y responde con `none|<nombre> is not in the phonebook.` cuando el contacto no existe, evitando llamadas erróneas.
- Enrutamiento con rechazo explícito de tareas fuera de alcance: peticiones de código, documentos o razonamiento se marcan como `escalate|code`, `escalate|reasoning`, etc., lo que permite al orquestador decidir cuándo invocar un modelo mayor.
- Despliegue en hardware de bajas prestaciones (portátil con micrófono y Raspberry Pi como altavoz): el tamaño del base (350M) y el adaptador LoRA permiten inferencia local sin GPU dedicada, según el escenario descrito en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las puntuaciones de dev sobre datos generados por plantilla son optimistas y que las cifras relevantes son las medidas con el stack real en el portátil; sin embargo, no se proporcionan tablas de MMLU, HumanEval, GSM8K ni métricas equivalentes en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con un base de 350M de parámetros, la inferencia en bfloat16 requiere del orden de 0,7 GB solo para pesos, más overhead de activaciones y caché KV; el adaptador LoRA añade una cantidad reducida. Cifras exactas no publicadas.
- GPU recomendadas: no disponible. El escenario descrito en la model card es un portátil (con micrófono) y un Raspberry Pi como altavoz, lo que sugiere ejecución en CPU.
- ¿Cabe en GPU de consumo? Por tamaño (350M), es esperable que quepa en cualquier GPU de consumo moderna, pero la model card no lo confirma ni especifica modelos concretos.
- Opciones de despliegue: la model card proporciona un ejemplo con `transformers` + `peft` (`PeftModel.from_pretrained` sobre `AutoModelForCausalLM`), decodificación greedy y `max_new_tokens=64`. Se menciona el uso de una gramática GBNF para forzar líneas bien formadas, lo que implica un runtime compatible con gramáticas (por ejemplo, llama.cpp), aunque no se detalla la integración exacta.
- Latencia y throughput: la model card cita 0,95 s p50 y 1,82 s p95 para la primera llamada del camino antiguo (una llamada a modelo alojado por turno), como motivación del router; no se publican latencias del router local.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `martinnavs/granite-4.0-h-350m-router-kd-web4-s0` | 350M (base) + LoRA | no disponible | Router especializado para agente de voz, salida en lenguaje de línea | apache-2.0 | Hugging Face (2 descargas, 0 likes) |
| `ibm-granite/granite-4.0-h-350m` | 350M | no disponible | Modelo base de propósito general de IBM | no disponible en la informacion proporcionada | Hugging Face (modelo base referenciado) |
| Profesor LoRA de 1B de la familia Granite | 1B | no disponible | Profesor usado para destilar el router | no disponible en la informacion proporcionada | no disponible |

No se dispone de datos de benchmarks ni de contexto para comparar rendimiento entre estas opciones; la comparativa se limita a parámetros, enfoque y licencia según la información proporcionada.

## Limitaciones y advertencias

- No es un asistente general: está entrenado para emitir llamadas en un lenguaje de línea concreto y debe servirse con el mensaje de sistema exacto y una gramática GBNF; fuera de ese entorno no se comporta como se espera.
- Los datos de entrenamiento y dev son generados por plantilla, por lo que las puntuaciones de dev son optimistas; las cifras relevantes son las medidas con el stack real, que no se publican en detalle.
- El conjunto de herramientas es cerrado (unos 28 nombres); cualquier petición fuera de ese conjunto debe escalarse, y el modelo no está diseñado para razonamiento multi-paso, código, documentos ni flujos de trabajo.
- Idiomas soportados limitados a inglés y tagalo según los tags; no se documenta cobertura de otros idiomas.
- Riesgo de alucinación en la selección de herramienta o en la resolución de contactos si el mensaje de sistema no coincide con el formato de entrenamiento; la model card insiste en que la agenda es lo único que cambia entre usuarios y debe respetar el formato `Name (relation)` o `empty`.
- La aritmética nunca se resuelve como acción de hogar (se escala como `escalate|reasoning`), y los comandos negados no se ejecutan; son reglas entrenadas, no garantías absolutas fuera de la gramática.
- Licencia Apache 2.0 permite uso comercial, pero la model card no detalla restricciones adicionales sobre el modelo base `ibm-granite/granite-4.0-h-350m`, cuyos términos deben verificarse por separado.
- El repositorio tiene un uso muy bajo (2 descargas, 0 likes) y fue creado en noviembre de 2026 según los metadatos, lo que limita la evidencia de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/martinnavs/granite-4.0-h-350m-router-kd-web4-s0
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-h-350m
- Repositorio de entrenamiento: https://github.com/Martinnavs/ME3-LoRA-training
- Repositorio del agente de voz: https://github.com/Martinnavs/AI-231-ME3 (commit `9c2d34c`, rama `agy/interrupts`)
