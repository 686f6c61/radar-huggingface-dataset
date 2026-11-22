# lensetek/lensetek-edge-loop-3b-GGUF

## Resumen

Lensetek-Edge-Loop-3B es un modelo de lenguaje de pequeno tamano (SLM) publicado por lensetek, distribuido exclusivamente en formato GGUF y disenado para inferencia en equipos edge sin GPU dedicada. Se construye como un fine-tune de Qwen/Qwen2.5-3B-Instruct, sobre el que el autor aplica un entrenamiento orientado a razonamiento agentico con bucles de computo adaptativos, recuperacion de errores multi-turno y abstención calibrada frente a la alucinacion. La propuesta central es ejecutar tareas de agente (function calling, RAG cerrado, diagnostico tecnico) en entornos aislados de red, con un consumo de RAM activa declarado por debajo de 2,5 GB.

El modelo se presenta con seis "clusters curriculares" de entrenamiento: recursos naturales y mineria remota, sanidad aislada, manufactura confidencial, seguridad maritima y fronteriza, microempresa rural y supervivencia de emergencia. Incorpora un modo de esfuerzo conmutables mediante etiquetas en el prompt (`[EFFORT:LOW]` y `[EFFORT:HIGH]`), donde el segundo habilita un scratchpad interno `<think>`. El autor declara un entrenamiento con GRPO/RLVR y penalizaciones asimetricas para forzar la abstención cuando falta contexto.

La relevancia actual del modelo reside en su encaje en el nicho de despliegue offline en hardware de bajo coste (Intel N100, i3) y en el cumplimiento de requisitos de soberania de datos. No obstante, la informacion disponible procede unicamente de la model card del autor: no hay benchmarks publicos verificables, el repositorio registra cero descargas y la fecha de creacion indicada es posterior a la actual, lo que obliga a tratar las metricas declaradas como afirmaciones no contrastadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen2.5-3B-Instruct, con "bucles de computo adaptativos" (looped transformer) segun el autor |
| Parametros totales | 3B (heredados del modelo base Qwen2.5-3B-Instruct) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens en los ejemplos de despliegue; no se declara contexto nativo distinto del base |
| Tipos de cuantizacion | GGUF Q4_K_M (calibracion nativa declarada); no se detallan otros niveles |
| Idiomas soportados | ingles (en), indonesio (id), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp / Ollama); no se publican safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only denso de 3.000 millones de parametros, y anade segun la model card un esquema de "Adaptive Compute Loops" inspirado en arquitecturas recurrentes y looped transformers (el autor cita como referencia el trabajo *Inkling* de Thinking Machines Lab). En la practica, el control de esfuerzo se expone mediante etiquetas en el prompt: en modo bajo el modelo responde de forma directa y determinista en menos de 25 tokens, mientras que en modo alto dispone de un presupuesto de scratchpad `<think>` de entre 150 y 250 tokens para razonamiento multi-paso.

El entrenamiento declarado incluye tres componentes: un 35% del dataset compuesto por trayectorias de fallo planificadas para ensenar recuperacion de errores multi-turno y reformulacion de llamadas a herramientas; un ajuste con GRPO/RLVR y recompensas asimetricas (abstenerse cuando falta contexto recibe +0,8, alucinar fuera de contexto recibe -2,0); y una calibracion consciente de cuantizacion para que el paso a Q4_K_M no degrade el cumplimiento de esquemas JSON ni la precision de citas. No se especifican el numero total de tokens de entrenamiento, la composicion exacta del dataset ni los hiperparametros de RL.

## Capacidades

- Generacion de texto y razonamiento agentico multi-paso con bucle interno de auto-correccion.
- Function calling y tool calling, con reformulacion autonoma de llamadas tras errores (parseo de codigos de error en turnos posteriores).
- Modo de esfuerzo conmutable: `[EFFORT:LOW]` para ejecucion directa de herramientas y `[EFFORT:HIGH]` para razonamiento extendido con scratchpad `<think>`.
- Abstención calibrada: respuesta explicita de "dato no encontrado en los documentos locales" cuando el contexto es insuficiente.
- RAG de dominio cerrado con citas y cumplimiento estricto de esquemas JSON.
- Capacidades multilingues en ingles, indonesio y chino, con cambio de codigo tecnico (code-switching) en terminologia industrial.
- Conocimiento de dominio inyectado: diagnostico de maquinaria pesada (CAN-bus/OBD), telemetria de calderas, monitorizacion Modbus RS-485/PLC, triaje START, potabilizacion de agua, sistemas de carga solar 12V, calculo de antenas y radio de emergencia.
- No se declaran capacidades de vision, audio ni generacion de imagenes.

## Casos de uso

- Diagnostico de maquinaria en planta remota: el modelo interpreta codigos de error CAN-bus u OBD y propone secuencias de verificacion paso a paso, funcionando sin conectividad en el propio equipo de campo y reformulando la consulta si la primera herramienta devuelve un error.
- Asistente clinico en entornos aislados: extraccion de datos de historia clinica electronica y soporte a decisiones con abstención obligatoria cuando el dato no figura en los documentos locales, lo que encaja con requisitos de privacidad tipo UU PDP.
- Monitorizacion industrial de baja latencia: integrado contra registros Modbus RS-485 o PLC, con el modo `[EFFORT:LOW]` para respuestas deterministas por debajo de 320 ms y sin coste de API en la nube.
- Agente de RAG documental cerrado: consulta sobre procedimientos operativos (SOP) y manuales internos con citas verificables, apoyado en el modo `[EFFORT:HIGH]` para cruzar varios documentos.
- Automatizacion de atencion tecnica multi-turno: gestion de conversaciones donde el usuario aporta codigos de error sucesivos, aprovechando las trayectorias de recuperacion entrenadas para reintentar tool calls fallidas.
- Logistica y microempresa rural: scoring de credito cooperativo offline y seguimiento de tanques de combustible (ATG) o cadena de frio de vacunas en puntos sin red.
- Soporte a emergencias y supervivencia: triaje de victimas, calculo de antenas de hilo largo, frecuencias de emergencia y esquemas de circuitos en ASCII, todo ejecutable en un portatil de 4-8 GB de RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card unicamente declara metricas internas del autor, no verificables de forma independiente:

| Metrica declarada | Valor |
|---|---|
| Tasa de completitud end-to-end en pipelines multi-herramienta | >95% |
| Tasa de alucinacion en dominio cerrado | <1,0% |
| Velocidad de inferencia (Intel N100 / Core i3, CPU) | 18-35 tokens/s |
| Time-to-first-token en modo bajo | <350 ms |
| Presupuesto de respuesta en modo bajo | <25 tokens |

## Requisitos de hardware

- VRAM/RAM: aproximadamente 2,05 GB en disco para el GGUF Q4_K_M; RAM activa declarada de unos 2,49 GB (pesos ~2,0 GB, cache KV a 4 bits ~140 MB, runtime ~150 MB); techo de sistema declarado de 3,69 GB.
- GPU: no requiere GPU discreta; el autor lo posiciona para CPU Intel N100 o Core i3. Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090) si se desea acelerar.
- Consumer GPU: si, en cualquier tarjeta con 4 GB o mas de VRAM, aunque el caso de uso previsto es CPU.
- Despliegue: llama.cpp (`llama-server` con `-ctk q4_0 -ctv q4_0`), Ollama (`ollama run hf.co/lensetek/lensetek-edge-loop-3b-GGUF`), llama-cpp-python con `flash_attn=True`. No se mencionan vLLM ni TGI, que no soportan GGUF de forma nativa en su flujo habitual.
- Latencia y throughput: 18-35 tokens/s en CPU N100/i3 segun el autor; TTFT inferior a 350 ms en modo de bajo esfuerzo. No hay mediciones independientes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Lensetek-Edge-Loop-3B | 3B | 4096 (en ejemplos) | en, id, zh | Apache 2.0 | GGUF | Fine-tune agentico con abstención calibrada; sin benchmarks publicos |
| Qwen2.5-3B-Instruct | 3B | 32.768 nativo | multilingue (incluye en, zh) | Apache 2.0 | safetensors, GGUF | Modelo base; benchmarks publicos disponibles |
| Llama 3.2 3B Instruct | 3B | 128.000 | multilingue | Llama 3.2 Community License | safetensors, GGUF | Contexto muy superior; licencia con restricciones |
| Phi-3.5-mini-instruct | 3,8B | 128.000 | multilingue | MIT | safetensors, GGUF | Alternativa densa con contexto largo y benchmarks publicados |

La comparacion directa de rendimiento no es posible: Lensetek no publica resultados en benchmarks estandar, mientras que los tres alternativos si cuentan con evaluaciones publicas. La ventaja diferencial declarada de Lensetek es el consumo de RAM (<2,5 GB) y el entrenamiento especifico en abstención y recuperacion de errores, no la capacidad bruta.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicos verificables: todas las metricas (>95% de completitud, <1,0% de alucinacion) son declaraciones del autor sin replicacion independiente.
- Repositorio con cero descargas y cero likes en el momento de la consulta, y fecha de creacion registrada como posterior a la actual; la madurez y el mantenimiento del proyecto no estan contrastados.
- Contexto efectivo limitado a 4096 tokens en los ejemplos de despliegue, muy por debajo del contexto nativo de 32.768 tokens de Qwen2.5-3B-Instruct; el RAG multi-documento queda restringido.
- Cobertura idiomatica reducida a ingles, indonesio y chino; no se declara soporte de castellano, por lo que su uso en espanol no esta garantizado ni evaluado.
- Riesgo de alucinacion persistente pese a la calibracion declarada, especialmente fuera del dominio cerrado de los seis clusters curriculares y en preguntas abiertas de cultura general.
- Sesgo potencial hacia el contexto industrial y geografico indonesio (terminologia, SOP locales, normativa UU PDP), que puede no transferir a otros mercados.
- El termino "proprietary" en la model card contrasta con la licencia Apache 2.0 de los metadatos; conviene verificar las condiciones reales de uso comercial antes de desplegar en produccion.
- Solo se distribuyen pesos GGUF; no hay safetensors para fine-tuning adicional ni para servir con vLLM o TGI.
- El modo `<think>` con presupuesto de 150-250 tokens limita la profundidad del razonamiento en tareas que requieran cadenas largas.
- Al ser un fine-tune de un modelo de 3B, la calidad en matematicas complejas y codigo de produccion sera inferior a la de modelos de mayor tamano; no se aportan datos que lo cuantifiquen.

## Enlaces

- Hugging Face: https://huggingface.co/lensetek/lensetek-edge-loop-3b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de aplicaciones del autor (referenciado en la model card como "lensetek/lens", enlace incompleto en la informacion disponible): no disponible
- Paper de referencia citado (*Inkling*, Thinking Machines Lab): no disponible
- Demos, blog tecnico y resultados de benchmarks: no disponibles
