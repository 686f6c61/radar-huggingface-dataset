# ferry-el-kom/qwen3.8-4b-empero-v24-Hermes-agentic-subagent-toolcalls

## Resumen

qwen3.8-4b-empero-v24-Hermes-agentic-subagent-toolcalls es un modelo de lenguaje de 4.326 millones de parametros (4,3B) desarrollado por el usuario ferry-el-kom, obtenido mediante destilacion y un ajuste fino con LoRA sobre el modelo base empero-ai/Qwen3.8-4B-Distill. Esta disenado especificamente para actuar como subagente autonomo dentro del harness Hermes Agent, con enfasis en tool calling, ejecucion de tareas de ingenieria y razonamiento multi-paso en entornos Linux (validado en Ubuntu 22.04).

El modelo se entrena a partir de trazas generadas por profesores en la nube (GLM-5.2/5.3, DeepSeek y Qwen) que ejecutaban flujos de trabajo de produccion industrial con privilegios root: comandos sudo, depuracion de microcontroladores ECU/MCU, flasheo de firmware, construccion de ROMs personalizadas y automatizacion de lineas de produccion. El ajuste LoRA (r=32, alpha=64, all-linear, 560 pasos) se aplica sobre el nucleo "v22 limpio" con 11 clases de dosis dirigidas a modos de fallo medidos, alcanzando una perdida final de entrenamiento de 0,46.

Es relevante porque demuestra un caso de destilacion de comportamiento agentico de profesores de gran escala a un modelo pequeno de 4B que cabe en hardware de consumo, con soporte de contexto largo (136.192 tokens por slot validados, ventana nativa GGUF de 262k) y decodificacion especulativa MTP integrada en los cuantizados. La licencia Apache 2.0 facilita su uso comercial, aunque el autor advierte explicitamente sobre el riesgo de comportamientos peligrosos heredados de los profesores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8, con cabeza MTP/nextn para decodificacion especulativa) |
| Parametros totales | 4.326.350.848 (4,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 136.192 tokens por slot (validado); ventana nativa GGUF de 262k; minimo 64k para el gate del harness Hermes |
| Tipos de cuantizacion | GGUF q4_K_M, q6_K, q8_0 (incluyen tensores MTP); pesos safetensors en el repo |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de empero-ai/Qwen3.8-4B-Distill, un transformer de 4,3B parametros, y se ajusta mediante LoRA con rango 32, alpha 64 y aplicacion all-linear durante 560 pasos. El entrenamiento combina el nucleo "v22 limpio" con 11 clases de dosis disenadas para corregir modos de fallo medidos: persistencia de entregables, stop-and-report, bootstrap y reconocimiento de entorno, identidad derivada del contexto, sondeo de toolchains de desarrollo, inventarios dinamicos, precision de unidades y disciplina basica de ficheros. La perdida final de entrenamiento fue de 0,46.

Los datos de entrenamiento provienen de trazas del harness Hermes Agent generadas por profesores en la nube (GLM-5.2/5.3, DeepSeek, Qwen) que operaban en flujos de produccion industrial con privilegios root. No se especifica el numero total de tokens de entrenamiento ni la composicion exacta del dataset. Una innovacion destacable es la inclusion de tensores MTP (nextn) en los GGUF q4_K_M/q6_K/q8_0, lo que permite decodificacion especulativa automatica en motores compatibles; el autor reporta una tasa de aceptacion del draft de 0,74-0,86 medida sobre la cabeza nextn entrenada.

## Capacidades

- Generacion de texto y razonamiento agentico con estilo "reasoning-as-working-notebook" (bloque de pensamiento previo a cada accion).
- Tool calling / function calling con plantilla de chat integrada en el GGUF que emite JSON dentro de etiquetas `<tool_call>`.
- Ejecucion de tareas multi-paso y comportamiento de subagente autonomo dentro del harness Hermes Agent.
- Disciplina de ficheros: lectura antes de escritura, verificacion tras cambios, manejo de rutas con espacios y creacion de subdirectorios.
- Reconocimiento de entorno: extraccion de valores de `/proc`, identificacion de puertos y procesos con `ss`/`lsof`, conteo de lineas, sondeo de toolchains.
- Autoauditoria e identidad derivada del contexto, con capacidad de corregir suposiciones cuando la evidencia las contradice.
- Capacidades multilingues: solo ingles declarado.
- Modo de razonamiento controlado por temperatura (el parametro `reasoning_effort` no se respeta en llama.cpp/LM Studio).
- No se declaran capacidades de vision, audio ni otras modalidades.

## Casos de uso

- Automatizacion de tareas de ingenieria en Linux: el modelo puede ejecutar comandos de shell, inspeccionar `/proc`, identificar procesos y puertos, y entregar informes en ficheros, aprovechando su entrenamiento en Ubuntu 22.04 y su contexto de 136k tokens para sesiones largas.
- Subagente dentro de pipelines agenticos: al integrarse en el harness Hermes Agent como subagente con tool calling JSON, puede descomponer tareas, invocar herramientas y reportar resultados verificados en cada paso.
- Depuracion de microcontroladores y dispositivos embebidos: hereda de los profesores capacidades de sondeo de toolchains, flasheo de firmware y parcheo, util para laboratorios de hardware que necesiten un agente local pequeno.
- Generacion y mantenimiento de scripts de automatizacion: su disciplina de "leer antes de escribir" y "verificar tras cambiar" lo hace adecuado para modificar ficheros de configuracion o scripts existentes con menor riesgo de romperlos.
- Auditoria de sistemas y reconocimiento de entorno: puede realizar inventarios dinamicos de servicios, procesos y puertos, y producir informes tecnicos concisos con evidencia (salida de comandos, file:line).
- Despliegue en hardware de consumo para agentes de codigo: con cuantizacion q4_K_M y decodificacion especulativa MTP, puede ejecutarse en GPUs consumer para tareas de asistencia a la programacion y ejecucion de comandos en local.
- Asistencia en flujos CI/CD controlados: con guardrails adecuados, puede integrarse en pipelines para ejecutar comprobaciones, aplicar parches y verificar resultados, aunque requiere supervision por el riesgo de comandos destructivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta una validacion empirica: una sesion de agente en vivo de 119 turnos (tool calling, sondas de identidad, autoauditoria) ejecutada de extremo a extremo sin bucles, en LM Studio con 4 slots de 136.192 tokens y decodificacion especulativa MTP activa (aceptacion del draft de 0,74-0,86). Tambien se menciona una suite de evaluacion SM01-SM30 sobre el harness real, pero solo se detallan parcialmente los primeros casos (SM01-SM05) y no se aportan puntuaciones numericas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en q4_K_M, 4,5-5 GB en q6_K y 6-7 GB en q8_0 (estimacion a partir de los 4,3B parametros; no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor; por tamano, una RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB son suficientes para los cuantizados indicados.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 8 GB o mas para q4_K_M/q6_K.
- Opciones de despliegue: llama.cpp, LM Studio (configuracion validada por el autor), y motores compatibles con GGUF que soporten MTP para decodificacion especulativa. El repo es de transformers y tambien permite carga en safetensors.
- Configuracion de inferencia validada: temperature=0.4, top_p=0.58, top_k=20, repeat_penalty=1.0, max_new_tokens >= 4096 (recomendado 16384).
- Latencia y throughput: no disponibles de forma numerica; el autor solo confirma que la decodificacion especulativa MTP se activa automaticamente en motores compatibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.8-4b-empero-v24-Hermes-agentic-subagent-toolcalls | 4,3B | 136k validado (262k nativo GGUF) | Subagente agentico / tool calling | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| empero-ai/Qwen3.8-4B-Distill (modelo base) | 4,3B | no disponible | Destilacion general | no disponible | Hugging Face |
| Qwen3.8-4B (familia base) | ~4B | no disponible | Modelo generalista | no disponible | Hugging Face |
| Modelos Hermes agentic de 4B comparables | no disponible | no disponible | Tool calling / agentes | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de comportamiento peligroso: el autor advierte explicitamente que el modelo puede ejecutar comandos sudo, aplicar parches y reflashear firmware, imitando a los profesores; debe usarse con guardrails estrictos y bajo propia responsabilidad.
- Solo validado en Linux Ubuntu 22.04; en otros sistemas operativos el comportamiento es desconocido.
- Sensibilidad a la configuracion de muestreo: desviarse del perfil v2.x (subir temperature/top_p o usar el regimen antiguo 0.6/0.95) reproduce bucles de repeticion y desviaciones del agente; la decodificacion greedy es un modo de fallo conocido para esta clase de modelos de razonamiento.
- El parametro `reasoning_effort` no se respeta en llama.cpp/LM Studio; la verbosidad del razonamiento se controla con la temperatura.
- Idiomas: solo ingles declarado, lo que limita su uso en castellano u otros idiomas.
- Riesgo de alucinacion: aunque el prompt de sistema insiste en no inventar salidas, rutas ni numeros, no se aportan metricas de fidelidad factual.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento en produccion.
- El contexto largo consume presupuesto de `max_new_tokens` (el bloque `<think>` consume tokens), por lo que se recomienda configurar al menos 16384 tokens de generacion.
- No se han publicado benchmarks estandar (MMLU, HumanEval, GSM8K), lo que dificulta la comparacion objetiva con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ferry-el-kom/qwen3.8-4b-empero-v24-Hermes-agentic-subagent-toolcalls
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Fichero SYSTEM-PROMPT-v2.x.txt: incluido en el repositorio del modelo en Hugging Face
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion proporcionada.
