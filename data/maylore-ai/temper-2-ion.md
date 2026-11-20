# maylore-ai/Temper-2-Ion

## Resumen

Temper-2-Ion es un modelo de generacion de codigo especializado en Rust, desarrollado por maylore-ai como sucesor de Temper-1-0.5B. Se construye sobre Qwen2.5-Coder-0.5B-Instruct mediante un proceso de fine-tuning supervisado con ejemplos de Rust validados por compilador y tests, seguido de una fase de aprendizaje por refuerzo en la que solo las soluciones que pasaban todos los tests obtenian recompensa. El objetivo declarado es ofrecer asistencia de codigo Rust en hardware modesto, con soporte de peticiones en ingles y ruso.

Con 494 millones de parametros, el modelo se posiciona en la franja de modelos ultraligeros: cabe en GPUs de consumo y permite inferencia local con latencia baja. Su interes actual radica en que, pese a su tamano, declara resultados en HumanEval-RS (48,1 pass@1) superiores a modelos mas grandes como Qwen2.5-Coder-1.5B-Instruct (39,0) y cercanos a Qwen2.5-Coder-3B-Instruct (56,5), aunque por debajo de Temper-1-1.5B (54,1) en esa misma prueba.

La propuesta es deliberadamente acotada: no es un modelo generalista ni un sustituto de modelos de varios miles de millones de parametros, sino una herramienta de autocompletado conversacional y generacion de funciones Rust para entornos con recursos limitados. Se distribuye bajo licencia Apache 2.0 y con una version GGUF para llama.cpp, LM Studio y Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tune de Qwen2.5-Coder-0.5B-Instruct |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; existe version GGUF en maylore-ai/Temper-2-Ion-GGUF |
| Idiomas soportados | en, ru (la model card tambien lista ar en los tags de Hugging Face) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repo separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-0.5B-Instruct, un transformer decoder-only de la familia Qwen2. El entrenamiento se desarrollo en dos fases. Primero, un fine-tuning supervisado sobre ejemplos de codigo Rust que pasaban el compilador y los tests; el conjunto incluia tanto tareas redactadas con cuidado como peticiones cortas de pocas palabras, imitando el estilo habitual de un chat. Tambien se incorporaron dialogos sobre el propio modelo para que conozca su nombre y responda preguntas sobre si mismo. Tras el fine-tuning, los pesos se fusionaron con los del Instruct original para preservar la comprension del enunciado de la tarea.

La segunda fase consistio en aprendizaje por refuerzo sobre tareas con tests: unicamente una solucion que pasaba todos los tests obtenia recompensa. Segun el autor, esta etapa requirio menos de cuatro horas en una unica RTX 3060. No se detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni el algoritmo de RL empleado (PPO, GRPO u otro), por lo que esos datos figuran como no disponibles.

## Capacidades

- Generacion de codigo Rust: funciones, logica de negocio y resolucion de tareas tipo HumanEval-RS y MBPP-RS.
- Conversacion multi-turno en ingles y ruso sobre peticiones de codigo.
- Comprension de enunciados de tarea, reforzada por la fusion de pesos con el modelo Instruct base.
- Conocimiento de si mismo: responde preguntas sobre su identidad y caracteristicas.
- Generacion con plantilla de chat propia; sin system message se inyecta el system prompt de Temper.
- No soporta fill-in-the-middle, por lo que no es adecuado como modelo de autocompletado inline en editor.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Asistente de codigo Rust en local: el modelo genera funciones completas a partir de un enunciado en lenguaje natural, adecuado para desarrolladores que trabajan en maquinas sin GPU dedicada o con VRAM limitada.
- Generacion de tests unitarios en Rust: dado un fragmento de codigo, puede proponer casos de prueba; conviene revisar su salida porque el propio autor advierte que explica mal su codigo.
- Prototipado rapido de utilidades Rust: para scripts, parsers o funciones auxiliares donde la correccion se valida con el compilador y los tests del proyecto.
- Ensenanza y aprendizaje de Rust: responde en ingles y ruso, lo que lo hace util para estudiantes rusoparlantes que quieran ejemplos comentados de codigo.
- Integracion en pipelines de CI como generador de parches candidatos: al ser ligero, puede ejecutarse en paralelo para producir varias soluciones que luego se filtran con los tests del repositorio.
- Despliegue en entornos embebidos o de borde: con 0,5B de parametros y version GGUF, puede ejecutarse en CPU o en GPUs de gama baja para asistencia de codigo offline.
- Chatbot de soporte para dudas de Rust: gestiona conversaciones multi-turno en ingles y ruso, aunque su ventana de contexto no esta documentada.

## Benchmarks y rendimiento

Resultados declarados por el autor. HumanEval-RS y MBPP-RS muestran pass@1 / pass@10 en porcentaje; Temper Bench v2 es greedy pass@1. La negrita marca el mejor resultado entre modelos de hasta 0,8B.

| Modelo | HumanEval-RS | MBPP-RS | Temper Bench v2 |
|---|---|---|---|
| **Temper-2-Ion** | **48,1 / 57,6** | **45,5 / 53,8** | **12,7** |
| Temper-1-0.5B | 36,3 / 46,3 | 39,3 / 46,9 | 7,3 |
| ThoxEdge-RustCoder-0.5B | 28,7 / 44,8 | 33,2 / 43,1 | 2,7 |
| Qwen2.5-Coder-0.5B-Instruct | 23,8 / 39,9 | 28,4 / 40,2 | 2,0 |
| Qwen3.5-0.8B | 10,1 / 22,1 | 14,5 / 25,5 | 1,3 |
| Qwen2.5-Coder-1.5B-Instruct | 39,0 / 56,1 | 38,3 / 52,1 | 7,3 |
| Temper-1-1.5B | 54,1 / 68,8 | 48,6 / 59,2 | 16,7 |
| Qwen2.5-Coder-3B-Instruct (referencia) | 56,5 / 71,9 | 44,8 / 60,0 | 14,7 |

Metodologia: HumanEval-RS (156 tareas) y MBPP-RS (354 tareas) provienen de MultiPL-E en la revision `28441b6`; se uso temperatura 0,2, top_p 0,95 y 50 respuestas por tarea, con el resto de parametros de muestreo tomados del `generation_config.json` de cada modelo en vLLM. pass@k se calcula con el estimador insesgado del paper Codex. El primer bloque de codigo cerrado de la respuesta se compila con los tests. La tarea `mbpp_67_bell_number` no tiene respuesta correcta en Rust y cuenta como fallida para todos los modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 494M de parametros, en fp16 ocupa aproximadamente 1 GB de pesos, y en cuantizacion de 4 bits alrededor de 300-400 MB, mas overhead de activaciones y cache KV.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el autor menciona una RTX 3060 para el entrenamiento por RL, no para inferencia.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (GTX 1650, RTX 3050, RTX 4060, etc.) e incluso en CPU.
- Opciones de despliegue: transformers, vLLM, text-generation-inference (segun tags), y llama.cpp / LM Studio / Ollama mediante la version GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval-RS (pass@1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Temper-2-Ion | 0,49B | no disponible | 48,1 | Apache 2.0 | HF (safetensors + GGUF) |
| Temper-1-1.5B | 1,5B | no disponible | 54,1 | no disponible | HF |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B | no disponible | 39,0 | Apache 2.0 | HF |
| Qwen2.5-Coder-3B-Instruct | 3B | no disponible | 56,5 | Apache 2.0 | HF |
| ThoxEdge-RustCoder-0.5B | 0,5B | no disponible | 28,7 | no disponible | HF |

Temper-2-Ion supera a modelos del doble y triple de tamano en HumanEval-RS segun los datos del autor, aunque queda por debajo de Temper-1-1.5B y de Qwen2.5-Coder-3B. La comparacion debe tomarse con cautela porque la evaluacion la realiza el propio autor y no se han publicado resultados independientes.

## Limitaciones y advertencias

- Con 0,5B de parametros, el modelo no es apto para trabajo serio o produccion critica; el propio autor lo advierte.
- Explica su propio codigo de forma incorrecta con frecuencia.
- Comete errores en tareas desconocidas y sus respuestas pueden mezclar palabras.
- No soporta fill-in-the-middle: no sirve como modelo de autocompletado inline en editores.
- La longitud de contexto no esta documentada, lo que dificulta planificar su uso en repositorios grandes.
- Sesgos conocidos: no documentados; al derivar de Qwen2.5-Coder hereda los sesgos del modelo base.
- Riesgo de alucinacion en APIs, crates y firmas de funciones Rust no vistas en entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero las obras derivadas (fine-tunes, merges, cuantizaciones) deben mantener las atribuciones del fichero NOTICE conforme a la seccion 4(d).
- Los benchmarks son autoinformados y no han sido verificados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maylore-ai/Temper-2-Ion
- Version GGUF: https://huggingface.co/maylore-ai/Temper-2-Ion-GGUF
- Modelo predecesor: https://huggingface.co/maylore-ai/Temper-1-0.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Sitio web del modelo: https://maylore.com/temper-2-ion
- Temper Bench v2: https://maylore.com/temper-bench
- MultiPL-E (evaluacion): https://github.com/nuprl/MultiPL-E
- Paper Codex (estimador pass@k): https://arxiv.org/abs/2107.03374
