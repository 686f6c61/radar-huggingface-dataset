# B1NARIES/ShellAssist-Qwen3-0.6B

## Resumen

ShellAssist-Qwen3-0.6B es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3-0.6B orientado a la generacion de comandos de shell para Bash, PowerShell y CMD. Lo desarrolla el usuario B1NARIES (Binar gg) y se publica bajo licencia Apache 2.0. El modelo parte de una base transformer densa de 0,6 mil millones de parametros (596.049.920 parametros reales en safetensors) y se especializa en convertir instrucciones en lenguaje natural, en ruso o ingles, en comandos de terminal ejecutables.

El problema que aborda es acotado pero practico: asistentes que traduzcan intenciones de usuario a comandos de consola correctos segun la plataforma (Linux/Bash, Windows/PowerShell, Windows/CMD). Para ello se entrena con QLoRA en 4 bits sobre 30.000 registros de instruccion a comando, seguido de una fase de DPO de 216 pasos. El resultado se distribuye tanto en pesos fusionados fp16 como en formato GGUF con tres cuantizaciones (f16, q8_0, q4_k_m), lo que facilita su despliegue en entornos con recursos limitados.

Es relevante ahora por su tamano reducido y su enfoque vertical: un modelo de 0,6B puede ejecutarse en CPU o en GPU de consumo, lo que lo hace candidato para asistentes de terminal locales, plugins de IDE o herramientas de automatizacion sin depender de APIs externas. No obstante, los propios datos del autor muestran una generalizacion limitada (5,3% de acierto exacto en su evaluacion de 300 tareas), lo que condiciona su uso en produccion sin supervision humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-0.6B) con adaptadores LoRA fusionados |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-0.6B, no especificada en la model card) |
| Tipos de cuantizacion | fp16 (pesos fusionados), GGUF f16, q8_0, q4_k_m |
| Idiomas soportados | Ruso e ingles (segun tags y model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA y fusionados fp16), GGUF |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3-0.6B, un transformer denso de la familia Qwen3. El ajuste se realiza en dos etapas: primero un SFT con QLoRA en cuantizacion nf4 de 4 bits durante 3 epocas sobre 30.000 registros de instruccion a comando, y despues una fase de DPO de 216 pasos para alinear las respuestas hacia comandos mas correctos y seguros. Los pesos finales se fusionan en fp16 y se exportan tambien a GGUF en tres variantes.

El dataset de entrenamiento (`B1NARIES/shellassist-sft-dpo`, privado) contiene 30.000 registros con cuotas exactas por plataforma (Bash, PowerShell, CMD), tipo de tarea e idioma. Aproximadamente el 75% de los registros incluyen bloques de razonamiento etiquetados como TASK/ENV/PLAN/RISK/CHECK, un esquema de "thinking" estructurado que el modelo aprende a reproducir cuando se activa `enable_thinking=True`. No se documentan innovaciones arquitectonicas adicionales (atencion lineal, decodificacion especulativa, etc.) mas alla del ajuste PEFT.

## Capacidades

- Generacion de comandos de shell para Bash, PowerShell y CMD a partir de instrucciones en lenguaje natural.
- Soporte bilingue ruso/ingles en la instruccion de entrada.
- Modo de razonamiento estructurado opcional mediante bloques TASK/ENV/PLAN/RISK/CHECK (`enable_thinking=True`), presente en cerca del 75% de los datos de entrenamiento.
- Extraccion de comandos delimitados en bloques de codigo cercados (fenced) en la respuesta.
- Formato conversacional (tag `conversational`) compatible con endpoints de inferencia estandar.
- No se documenta soporte de tool calling, function calling, vision, audio ni capacidades de agente multi-paso mas alla del razonamiento estructurado descrito.

## Casos de uso

- Asistente de terminal local: el modelo puede integrarse en una CLI o TUI que traduzca peticiones en ruso o ingles a comandos Bash/PowerShell/CMD, ejecutandose en CPU o GPU de consumo gracias a su tamano de 0,6B y sus variantes GGUF q4_k_m.
- Plugin de IDE o editor: un complemento que sugiera comandos de consola contextuales al desarrollador, usando el modo thinking para mostrar el plan y los riesgos antes del comando final.
- Documentacion y onboarding: generar ejemplos de comandos para guias internas o tutoriales a partir de descripciones de tareas, con revision humana del resultado.
- Automatizacion de scripts de mantenimiento: proponer comandos para tareas repetitivas (listado de procesos, gestion de ficheros, consultas de red) en entornos Windows y Linux, siempre con confirmacion del operador.
- Formacion y ensenanza: entorno de practica donde el modelo explica el plan (ENV/PLAN/RISK) y el comando propuesto, util para aprender diferencias entre Bash, PowerShell y CMD.
- Filtro previo en pipelines de operaciones: clasificar y proponer comandos candidatos que luego se validan con reglas o revision humana antes de ejecutarse, dado que el autor advierte explicitamente contra operaciones destructivas sin supervision.

## Benchmarks y rendimiento

| Evaluacion | Resultado |
|---|---|
| Eval-300 (tareas autorales, acierto exacto) | 16/300 (5,3%) |
| Test interno | 88/120 (73,3%) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La diferencia entre el test interno (73,3%) y la evaluacion de 300 tareas (5,3%) sugiere una brecha notable entre el conjunto de validacion y tareas no vistas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en fp16, unos 0,6-0,7 GB en q8_0 y alrededor de 0,4-0,5 GB en q4_k_m (estimacion a partir de los 596M parametros; no publicada por el autor).
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este tamano.
- Cabe en GPU de consumo y en CPU: las variantes GGUF q4_k_m y q8_0 permiten inferencia en CPU con llama.cpp u Ollama.
- Opciones de despliegue: transformers + PEFT (pesos LoRA), transformers con pesos fusionados fp16, llama.cpp/Ollama (GGUF), vLLM o TGI para los pesos fp16.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ShellAssist-Qwen3-0.6B | 596M | no disponible | Comandos shell RU/EN | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3-0.6B (base) | 0,6B | no disponible | Proposito general | Apache 2.0 | Hugging Face |
| Alternativas especializadas en shell | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables especializados en generacion de comandos de shell en la informacion proporcionada. La comparacion mas directa es con el modelo base Qwen3-0.6B, del que hereda arquitectura y licencia, y sobre el que este ajuste anade la especializacion en terminal a costa de generalidad.

## Limitaciones y advertencias

- Generalizacion limitada: el autor indica que el modelo se entreno con instrucciones de estilo plantilla y que la generalizacion a formulaciones no vistas es reducida, como refleja el 5,3% de acierto exacto en la evaluacion de 300 tareas.
- La plataforma no siempre se especifica en el turno del usuario, lo que puede provocar comandos para el sistema equivocado.
- Riesgo elevado en operaciones destructivas: el autor advierte explicitamente que no es apto para operaciones destructivas sin revision humana.
- Riesgo de alucinacion en comandos, flags o rutas inexistentes, especialmente fuera de las plantillas de entrenamiento.
- Cobertura linguistica limitada a ruso e ingles; no se documenta soporte de castellano.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantias y los riesgos operativos descritos desaconsejan su uso autonomo en produccion.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/B1NARIES/ShellAssist-Qwen3-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset de entrenamiento (privado, referenciado): B1NARIES/shellassist-sft-dpo
