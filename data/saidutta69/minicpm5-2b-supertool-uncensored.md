# saidutta69/MiniCPM5-2B-Supertool-Uncensored

## Resumen

MiniCPM5-2B-Supertool-Uncensored es un ajuste fino de 2.516.756.480 parametros derivado de saidutta69/MiniCPM5-2B-Supertool, que a su vez parte de openbmb/MiniCPM5-2B. El modelo esta especializado en la generacion de llamadas a herramientas (tool calling) siguiendo la superficie de herramientas de Claude Code: `Bash`, `Read`, `Write`, `Edit`, `Glob`, `Grep`, `WebFetch`, `WebSearch`, `TodoWrite`, `TaskUpdate` y `ToolSearch`, emitidas en la forma XML nativa del modelo base.

La variante "Uncensored" se ha generado con Heretic v2.1.0 aplicando una ablacion de rango arbitrario (Arbitrary-Rank Ablation) sobre las capas 19 a 35, con el objetivo de reducir la tasa de rechazos. Segun la model card del autor, los rechazos medidos por clasificador caen de 96/100 en el modelo original a 12/100 en esta version, con una divergencia KL de 0.0494 respecto al original.

Es relevante para desarrolladores que necesitan un modelo pequeno (2,5B) capaz de emitir llamadas a funciones con formato correcto en pipelines de agentes, con la salvedad de que se trata de un modelo especialista, no de un asistente general, y de que la ablacion introduce riesgos adicionales de sesgo y de comportamiento fuera de distribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de openbmb/MiniCPM5-2B); detalles internos no disponibles |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repo (pesos en safetensors a precision completa, con LoRA fusionado); el autor reporta evaluacion en 4-bit NF4 y fp16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de openbmb/MiniCPM5-2B y se ha ajustado mediante QLoRA en NF4 4-bit con rango r=16, alpha=32 y dropout 0, aplicado sobre `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. Los adaptadores LoRA estan fusionados en los pesos finales, de modo que el modelo se carga directamente con `transformers` sin PEFT. El entrenamiento uso el split `claude_code` del dataset `saidutta69/fable-5.1-premium-v2`, con 42.514 ejemplos (uno por turno de asistente con llamada a herramienta), cobertura de aproximadamente 3.500 de 4.132 trayectorias a 12 ejemplos por trayectoria y 347.136 llamadas validadas sin JSON malformado ni campos obligatorios ausentes. La supervision se aplico solo al turno final del asistente mediante un split prompt/completion.

La programacion fue de 240 pasos, batch efectivo 16, secuencia de 4096 tokens, learning rate 2e-4 con coseno y warmup del 3%, con una perdida que descendio de 1.107 a 0.276. El entrenamiento se ejecuto en 2x Tesla T4 (sm_75) en fp16 durante 7 h 40 min, con un pico de 8,92 GB por tarjeta. Los datos originales provienen de `MoreThought/Fable-5.1-Max-Reasoning-Filtered-10000x`, repaquetizados y filtrados: se descarto la mitad anonimizada (`unknown_tool`), se eliminaron `tool_calls` sin respuesta asociada y mensajes `tool` huerfanos, se re-serializaron los mensajes de forma canonica, se deduplico por SHA-256 sobre mensajes y nombres de herramienta y se reconstruyo y valido el esquema de 14 herramientas de Claude Code. Tambien se excluyo la configuracion `fable_code`, en la que 203.750 de 203.794 llamadas contenian el esquema renderizado como valor (`{"path": "<file_path>"}`), lo que ensenaria al modelo a emitir marcadores de posicion.

La innovacion principal de esta variante concreta es la ablacion ARA de Heretic v2.1.0, configurada con `start_layer_index` 19, `end_layer_index` 35, `preserve_good_behavior_weight` 0.7948, `steer_bad_behavior_weight` 0.0102, `overcorrect_relative_weight` 0.7500 y `neighbor_count` 8. El proceso es reproducible segun el autor, con instrucciones en el directorio `reproduce/` del repositorio.

## Capacidades

- Generacion de llamadas a herramientas en formato XML nativo del modelo base: `<function name="Bash"><param name="command">ls tasks/</param></function>`.
- Cobertura del esquema de herramientas de Claude Code: `Bash`, `Read`, `Write`, `Edit`, `Glob`, `Grep`, `WebFetch`, `WebSearch`, `TodoWrite`, `TaskUpdate` y `ToolSearch` (la model card menciona un esquema reconstruido de 14 herramientas).
- Soporte de tool calling y function calling con esquemas pasados a `apply_chat_template(tools=...)`.
- Capacidad de agentes y razonamiento multi-paso orientada a tareas de codigo y edicion de ficheros.
- Generacion de contenido de ficheros: el modelo tiende a escribir cuerpos de archivo reales en llamadas `Write`, lo que puede truncarse si el limite de generacion es bajo.
- Reduccion de rechazos respecto al modelo original (12/100 frente a 96/100 segun clasificador del autor).
- Capacidades multilingues: solo ingles declarado.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Agentes de codificacion automatizada: el modelo emite llamadas `Bash`, `Read`, `Edit` y `Write` en el formato XML esperado, por lo que puede conectarse a un orquestador que traduzca esas llamadas a acciones reales sobre un repositorio, con la ventaja de su bajo coste de inferencia a 2,5B.
- Integracion en pipelines de CI/CD como generador de parches: dado un contexto de ficheros y una tarea, produce llamadas `Edit` o `Write` con el contenido del cambio, que un paso posterior valida y aplica.
- Busqueda y navegacion web asistida: mediante `WebFetch` y `WebSearch`, el modelo puede encadenar consultas y recuperaciones dentro de un bucle de agente para tareas de investigacion acotadas.
- Gestion de tareas en agentes multi-paso: las herramientas `TodoWrite` y `TaskUpdate` permiten mantener un plan de trabajo estructurado en tareas largas, aunque con la limitacion de contexto no documentada.
- Sustitucion local de modelos mayores en entornos con GPU de gama baja: con 2,5B de parametros y pesos de 5,0 GB en el repo, puede desplegarse en una unica GPU consumer para prototipos de agentes donde el coste por token es critico.
- Generacion de esquemas de llamada para pruebas: sirve como generador de casos de prueba de tool calling en ingles para validar parsers y orquestadores propios, dado su formato de salida bien definido.
- Escenarios que requieren baja tasa de rechazo: la ablacion reduce los rechazos, lo que puede ser util en tareas de agente donde un rechazo rompe el bucle, siempre que el caso de uso no exija moderacion estricta.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. FC-Eval usa 89 APIs no vistas en entrenamiento, 150 tareas, decodificacion greedy y fp16 en ambos modelos.

| Metrica | Base (MiniCPM5-2B) | Supertool |
|---|---:|---:|
| Exito de tarea (llamada exacta) | 49,3% | 77,3% |
| Nombre de herramienta correcto | 50,0% | 90,0% |
| Claves de argumento correctas | 50,0% | 87,3% |
| Fallos de formato | 50,0% | 8,7% |
| Tiempo total, 150 tareas | 1071 s | 886 s |

Trazas de agente en dominio, 120 ejemplos del split `validation`, greedy, `max_new=384`, ambos modelos en 4-bit sobre una Tesla T4:

| Metrica | Base | Supertool |
|---|---:|---:|
| Perdida de completado | 1,5691 | 1,1246 |
| Nombre de herramienta correcto | 47,5% | 54,2% |
| Nombres de argumento correctos | 31,7% | 46,7% |
| Coincidencia completa | 0,0% | 4,2% |
| Llamada parseable emitida | 88,3% | 75,8% |

Entre las llamadas efectivamente emitidas en ese conjunto: nombre de herramienta correcto 53,8% (base) frente a 71,4% (Supertool), y nombres de argumento correctos 35,8% frente a 61,5%. El autor atribuye la caida de llamadas parseables a truncamiento de llamadas `Write` por el limite de generacion, no a incumplimiento de formato.

Rendimiento de la ablacion (Uncensored frente al original):

| Metrica | Este modelo | Original |
|---|---:|---:|
| Rechazos (clasificador) | 12/100 | 96/100 |
| Divergencia KL | 0,0494 | 0 (por definicion) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 5,0 GB en el repositorio (fp16/bf16); en 4-bit NF4 la huella se reduce aproximadamente a la mitad, y el autor reporta ejecucion en 4-bit sobre una unica Tesla T4 (16 GB) con `max_new=384`.
- GPU recomendadas: Tesla T4 (validada por el autor), RTX 4090, A100 y H100 para mayor throughput; cualquier GPU con al menos 8-10 GB de VRAM deberia poder cargar el modelo en 4-bit, aunque no se documentan pruebas en esas tarjetas.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas en cuantizacion de 4 bits; en fp16 requiere del orden de 6-7 GB solo para pesos, mas cache KV.
- Opciones de despliegue: `transformers` (soporte declarado, con `text-generation-inference` en los tags), vLLM y llama.cpp/Ollama no estan confirmados en la informacion disponible; no se publican pesos GGUF en el repositorio.
- Latencia y throughput: no se publican cifras de tokens por segundo; el unico dato de tiempo es el de la evaluacion FC-Eval (886 s para 150 tareas con `max_new` limitado, en hardware no especificado).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Tool calling |
|---|---:|---|---|---|---|
| MiniCPM5-2B-Supertool-Uncensored | 2,516B | no disponible | Especialista en herramientas Claude Code, sin censura | apache-2.0 | Si, formato XML nativo |
| saidutta69/MiniCPM5-2B-Supertool | 2,516B (estimado, mismo base) | no disponible | Especialista en herramientas Claude Code | no disponible en la informacion | Si |
| openbmb/MiniCPM5-2B | no disponible | no disponible | Modelo base generalista | no disponible en la informacion | Parcial (50,0% de nombre de herramienta correcto en FC-Eval) |

No se dispone de datos de benchmarks generales ni de contexto para comparar con alternativas de otros autores de tamano similar; la comparacion se limita a la familia de la que deriva.

## Limitaciones y advertencias

- No es un asistente general: es un especialista de 2,5B entrenado unicamente para emitir llamadas a herramientas del esquema de Claude Code; su utilidad fuera de ese formato es limitada.
- Solo soporta ingles segun la model card.
- La ablacion ARA modifica las capas 19 a 35 y reduce los rechazos de forma agresiva; esto puede degradar la moderacion y aumentar la probabilidad de contenido inapropiado o de respuestas fuera de distribucion. La divergencia KL de 0,0494 indica un cambio medible respecto al original.
- Riesgo de alucinacion en los valores de los argumentos: en FC-Eval las claves de argumento mejoran al 87,3%, pero la coincidencia exacta de la llamada se queda en 77,3%, lo que implica que una parte de las llamadas tiene valores incorrectos.
- El modelo tiende a generar cuerpos de fichero largos en llamadas `Write`, lo que provoca truncamiento con limites de generacion bajos y reduce la tasa de llamadas parseables (75,8% en el conjunto en dominio con `max_new=384`).
- La licencia apache-2.0 permite uso comercial, pero el modelo base y los datasets intermedios pueden tener condiciones propias que conviene verificar antes de desplegar; la model card no detalla restricciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de terceros; los benchmarks proceden del propio autor.
- No se documenta la longitud de contexto, lo que impide planificar tareas de agente con historiales largos sin pruebas previas.
- El uso de un modelo "uncensored" en produccion puede incumplir politicas de plataforma o requisitos regulatorios segun el sector.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saidutta69/MiniCPM5-2B-Supertool-Uncensored
- Modelo base del ajuste: https://huggingface.co/saidutta69/MiniCPM5-2B-Supertool
- Modelo original de openbmb: https://huggingface.co/openbmb/MiniCPM5-2B
- Dataset de entrenamiento: https://huggingface.co/datasets/saidutta69/fable-5.1-premium-v2
- Dataset de origen de las trazas: https://huggingface.co/datasets/MoreThought/Fable-5.1-Max-Reasoning-Filtered-10000x
- Benchmark FC-Eval: https://huggingface.co/datasets/saidutta69/fc-eval-benchmark
- Heretic (herramienta de ablacion): https://heretic-project.org
