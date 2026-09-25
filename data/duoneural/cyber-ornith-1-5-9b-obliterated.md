# DuoNeural/Cyber-Ornith-1.5-9B-OBLITERATED

## Resumen

Cyber-Ornith-1.5-9B-OBLITERATED es un ajuste fino de dominio de 8.953.803.264 parametros (aproximadamente 9B) desarrollado por DuoNeural sobre el modelo OBLITERATUS/Ornith-1.5-9B-OBLITERATED. Esta orientado a ciberseguridad agentica: triaje de exploits, auditoria de vulnerabilidades, operaciones multi-turno en terminal y invocacion autonoma de herramientas. Se distribuye bajo licencia Apache 2.0 y solo declara soporte para ingles.

El modelo parte de un stack transformer denso Qwen3.5 con patrones de atencion de estilo Gemma y extension de contexto nativa mediante YaRN RoPE. Sobre esa base se aplico una adaptacion QLoRA (entrenada con Unsloth) y una fusion de pesos mediante SLERP con t=0.75, presentada por el autor como "candidato a produccion v3". La model card destaca la preservacion del modo de deliberacion nativo con delimitadores `<think>...</think>`, el enmascaramiento de perdida solo en la completacion y la regularizacion NEFTune con alpha=5.0.

Su relevancia actual reside en el nicho de agentes autonomos de seguridad ofensiva y defensiva que rechazan con menos frecuencia tareas legitimas de auditoria (enfoque "abliterated"), integrando tool calling estilo Hermes y ejecucion interactiva de Bash. No obstante, el repositorio no tiene descargas ni valoraciones, y las cifras de rendimiento que declara el autor no estan verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso Qwen3.5 (stack de texto `qwen3_5_text`) con patrones de atencion de estilo Gemma y RoPE con extension YaRN |
| Parametros totales | 8.953.803.264 (aproximadamente 8,95B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (la model card menciona extension de contexto nativa via YaRN RoPE y un harness de evaluacion con 128K, pero no declara la longitud oficial) |
| Tipos de cuantizacion | no disponible (solo se menciona evaluacion en Q8_0; no se listan repositorios GGUF oficiales) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 35,8 GB); la evaluacion del autor utiliza Q8_0 |

## Arquitectura y entrenamiento

La base es un transformer denso de la familia Qwen3.5, denominado internamente `qwen3_5_text`, con patrones de atencion de estilo Gemma y extension de contexto nativa mediante YaRN RoPE. Sobre el checkpoint OBLITERATUS/Ornith-1.5-9B-OBLITERATED se aplico un ajuste QLoRA con Unsloth y posteriormente una fusion SLERP con t=0.75, dando lugar a la version que el autor etiqueta como candidato a produccion v3.

El corpus de entrenamiento declarado son 45.000 trayectorias multiturno curadas, repartidas en cuatro pilares: 35% operaciones de ciberseguridad y triaje (`oi-uae/cyber-security`, `hotdogs/uka-cyber-dataset`, `trend-cybertron/Primus-Reasoning`), 30% dominio de CLI y terminal (`Lite-Coder/LiteCoder-Terminal-SFT`, `rajistics/openhands-synthetic-conversations`, `emirkaanozdemr/bash_command_data_6K`), 20% function calling (`NousResearch/hermes-function-calling-v1`) y 15% replay cognitivo (`open-thoughts/OpenThoughts3-1.2M`) como ancla de regularizacion. Entre las innovaciones tecnicas declaradas figuran el enmascaramiento de perdida solo en la completacion (para evitar que el modelo fabrique salidas de terminal simuladas), la regularizacion NEFTune con alpha=5.0 (para tolerar salidas bash ruidosas o truncadas) y el soporte de doble harness Hermes y Claude Code, con tool calling envuelto en XML (`<tools>`, `<tool_call>`, `<tool_response>`) y ejecucion Bash interactiva directa. No se menciona RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional y multiturno en ingles.
- Razonamiento explicito en modo "thinking": cada turno abre con un bloque `<think>...</think>` antes de la respuesta final.
- Ciberseguridad ofensiva y defensiva: modelado de amenazas, analisis de zero-days, forense de CVE, generacion de parches y triaje de exploits.
- Operaciones de terminal y CLI: tuberias complejas, `sed`, `awk`, expresiones regulares, exploracion de entorno y auditoria de bits SUID.
- Function calling y tool use en JSON estricto, con transicion entre envoltorio XML estilo Hermes y ejecucion Bash interactiva estilo Claude Code.
- Razonamiento multi-paso y flujos agenticos con invocacion autonoma de herramientas.
- Ingenieria inversa asistida y depuracion de kernel, segun la model card (IDA, Ghidra).
- Rendimiento general preservado en matematicas, codigo y logica gracias al pilar de replay cognitivo.
- Capacidades multimodales (vision, audio): no disponibles.

## Casos de uso

- Triaje de vulnerabilidades en pipelines de seguridad: el modelo puede recibir informes de escaneo y CVE, clasificar severidad y proponer parches, apoyandose en su entrenamiento especifico sobre corpus de ciberseguridad y en su modo de razonamiento explicito.
- Automatizacion de operaciones en terminal: generacion y depuracion de scripts Bash con tuberias, `awk`/`sed` y regex, integrable en runbooks de administracion de sistemas donde el modelo devuelve comandos ejecutables en lugar de texto descriptivo.
- Agente autonomo en orquestadores tipo OpenHands o Claude Code: gracias al soporte de doble harness Hermes/Claude Code, el modelo puede encadenar llamadas a herramientas, interpretar `<tool_response>` y continuar el bucle de razonamiento sin intervencion humana.
- Auditoria de configuracion y hardening: revision de permisos, ficheros SUID y politicas del sistema, con propuestas de remediacion concretas basadas en el dominio de CLI entrenado.
- Analisis forense y respuesta a incidentes: interpretacion de logs de comandos ruidosos o truncados, una tarea para la que el autor entreno con NEFTune alpha=5.0 explicitamente para tolerar ese tipo de entradas.
- Refactorizacion de repositorios desde la linea de comandos: gestion de cambios y commits en estilo Aider, con navegacion del arbol de ficheros y aplicacion de parches.
- Automatizacion de pentesting en entornos autorizados: generacion de pruebas de concepto y verificacion de condiciones limite dentro de un bloque `<think>`, util en laboratorios de seguridad con alcance delimitado.
- Ingenieria inversa y analisis de binarios: asistencia en la interpretacion de volcados hexadecimales y desensamblado en herramientas como Ghidra o IDA, segun lo declarado por el autor.

## Benchmarks y rendimiento

Los siguientes datos proceden exclusivamente de la model card del autor. Se presentan la linea base declarada (Ornith-1.5-9B), los objetivos fijados y, cuando el autor los publica, los resultados declarados de la version v3. No hay verificacion independiente.

| Benchmark | Protocolo | Base Ornith-1.5-9B | Objetivo minimo | Objetivo ideal | Resultado declarado v3 |
|---|---|---|---|---|---|
| Terminal-Bench 2.1 | Terminus-2, contexto 128K, media de 5 ejecuciones | 46,2% Pass@1 | >= 50,0% Pass@1 | >= 54,5% Pass@1 | 62,5% tasa de exito operativa |
| SWE-bench Verified | SWE-bench Docker Harness (resolucion de issues) | 70,6% resueltos | >= 69,5% (retencion) | >= 72,0% | no disponible |
| CyberSecEval 3 | Purple Llama (divisiones exploit/defensa) | ~42,0% defensa/triaje | >= 62,0% | >= 68,0% | 100,0% triaje y defensa (declarado) |
| GPQA Diamond | razonamiento cientifico zero-shot con cadena de pensamiento | 86,4% exactitud | >= 84,5% (retencion) | >= 86,5% | no disponible |
| Berkeley Function Calling (BFCL) | verificacion de formato AST JSON | ~78,0% exactitud global | >= 86,0% | >= 90,0% | 95,0% de exactitud AST en Hermes (declarado) |
| Aider CLI Benchmark | refactorizacion de repositorio y gestion git | ~64,0% | >= 68,0% | >= 72,0% | no disponible |

El autor tambien declara 100,0% de cumplimiento sin rechazos ("zero-refusal uncensored compliance") y 102 tok/s de velocidad de inferencia en una estacion de trabajo con una unica RTX 4080 Super. Estas cifras no cuentan con validacion externa.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir del numero de parametros, no publicada por el autor): aproximadamente 18-20 GB en FP16/BF16, 10-11 GB en Q8_0 y 5,5-6,5 GB en Q4_K_M o Q5_K_M.
- El repositorio principal ocupa 35,8 GB, coherente con pesos en precision completa o mixta mas artefactos.
- GPU recomendadas: para precision completa, A100 40/80 GB, H100 o L40S; para Q8_0, RTX 4090, RTX 4080 Super, A6000 o L4.
- Cabe en GPU de consumo: si, en cuantizacion Q4 a Q8 en tarjetas con 8-16 GB de VRAM. El autor reporta 102 tok/s en Q8_0 sobre una RTX 4080 Super.
- Opciones de despliegue: la model card no detalla recetas de servicio; solo menciona Unsloth para el entrenamiento y evaluacion en Q8_0. Al tratarse de un stack Qwen3.5, son compatibles las pilas habituales (llama.cpp, Ollama, vLLM, TGI, SGLang y `transformers`), aunque no hay confirmacion explicita del autor.
- Latencia y throughput: unicos datos disponibles, los 102 tok/s declarados en Q8_0 sobre RTX 4080 Super. No hay cifras de latencia por peticion ni de throughput por lote en servidor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DuoNeural/Cyber-Ornith-1.5-9B-OBLITERATED | 8,95B denso | no disponible | apache-2.0 | Especializado en ciberseguridad agentica, salidas sin censura, soporte de tool calling Hermes y CLI |
| OBLITERATUS/Ornith-1.5-9B-OBLITERATED | 8,95B denso (modelo base) | no disponible | no disponible | Base directa del ajuste; variante "abliterated" del Ornith-1.5-9B |
| Ornith-1.5-9B | 9B denso | no disponible | no disponible | Modelo original de Ornith AI, con modo de razonamiento `<think>` y parser de tool calls; no esta especializado en ciberseguridad |
| Ajustes especializados en ciberseguridad de tamano similar | no disponible | no disponible | no disponible | No se dispone de datos comparables verificados en la informacion proporcionada |

La comparativa cuantitativa entre estos modelos solo esta disponible en forma de la tabla de lineas base y objetivos de la propia model card, recogida mas arriba.

## Limitaciones y advertencias

- Los resultados de benchmarks son declaraciones del autor sin verificacion independiente; cifras como el 100,0% en CyberSecEval 3 o el 95,0% en AST de Hermes resultan extraordinariamente altas y deben tratarse con escepticismo.
- El repositorio registra 0 descargas y 0 valoraciones, por lo que no existe validacion de la comunidad ni casos de uso documentados por terceros.
- El modelo ha sido deliberadamente descensurado ("abliterated"): elimina rechazos ante peticiones de pentesting, depuracion de kernel o ingenieria inversa, lo que implica riesgo de uso indebido y exige controles de acceso y politicas de uso en produccion.
- Solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta caracterizado.
- No se declara la longitud de contexto oficial, solo la referencia a YaRN RoPE y a un harness de 128K, lo que dificulta planificar despliegues con contextos largos.
- La licencia del repositorio es Apache 2.0, pero no se especifica la licencia del modelo base ni de los checkpoints intermedios, por lo que la cadena de licencias deberia verificarse antes de un uso comercial.
- El ajuste QLoRA sobre 45.000 trayectorias es relativamente pequeno para un modelo de 9B, lo que puede reducir la generalizacion fuera del dominio de ciberseguridad y terminal.
- Riesgo de alucinacion en entornos de ejecucion: aunque el autor aplico enmascaramiento de perdida solo en la completacion para evitar salidas de terminal simuladas, persiste el riesgo de que el modelo genere resultados de comandos en lugar de devolver el control al harness.
- Los conjuntos de datos de entrenamiento son publicos, lo que abre la puerta a contaminacion de benchmarks y a un rendimiento inflado en las pruebas declaradas.
- Naturaleza de doble uso: el mismo modelo que sirve para auditoria defensiva puede emplearse para generacion de exploits, con las implicaciones legales que ello conlleva.
- No se publican repositorios GGUF oficiales ni recetas de servicio, lo que anade trabajo de integracion antes de llevarlo a produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DuoNeural/Cyber-Ornith-1.5-9B-OBLITERATED
- Repositorio LoRA del mismo autor: https://huggingface.co/DuoNeural/Cyber-Ornith-1.5-9B-OBLITERATED-LoRA
- Organizacion DuoNeural en HuggingFace: https://huggingface.co/DuoNeural
- Sitio del desarrollador: https://duoneural.com
- Ornith-1.5: From Self-Scaffolding to Self-Improvement: https://ornith.ai/ornith_1_5.html
- Ornith-1.5-9B en ModelScope: https://www.modelscope.cn/models/ornith-ai/Ornith-1.5-9B
- Guia de Ornith AI para modelos de codificacion agentica: https://ornith.online/
- Dataset oi-uae/cyber-security: https://huggingface.co/datasets/oi-uae/cyber-security
- Dataset hotdogs/uka-cyber-dataset: https://huggingface.co/datasets/hotdogs/uka-cyber-dataset
- Dataset trend-cybertron/Primus-Reasoning: https://huggingface.co/datasets/trend-cybertron/Primus-Reasoning
- Dataset Lite-Coder/LiteCoder-Terminal-SFT: https://huggingface.co/datasets/Lite-Coder/LiteCoder-Terminal-SFT
- Dataset rajistics/openhands-synthetic-conversations: https://huggingface.co/datasets/rajistics/openhands-synthetic-conversations
- Dataset emirkaanozdemr/bash_command_data_6K: https://huggingface.co/datasets/emirkaanozdemr/bash_command_data_6K
- Dataset NousResearch/hermes-function-calling-v1: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset open-thoughts/OpenThoughts3-1.2M: https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
