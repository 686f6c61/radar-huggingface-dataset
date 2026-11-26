# shaban2024/Qwen3.5-4B-BOS-Q8-NonThinking

## Resumen

AgentMujo Q8 4B v0.4 es un ajuste fino del modelo base Qwen3.5-4B-bos-32768, desarrollado por shaban2024 y orientado a la funcion de agente conversacional en bosnio para tareas de administracion de sistemas Linux. El modelo parte de una base de 3.653.938.176 parametros (aproximadamente 3,65 mil millones) con arquitectura transformer de 32 capas, dimension oculta de 2560 y un vocabulario de 32768 tokens, y ha sido adaptado mediante SFT sobre un mix de datos propio (joint-01 a joint-06) seguido de un paso de DPO con 140 pares de preferencias y beta 0.1. Se distribuye unicamente en formato GGUF con cuantizacion Q8_0, en un unico fichero que sirve tanto para el perfil de razonamiento explicito (`think: true`) como para el modo directo (`think: false`).

El modelo resuelve un nicho concreto: la seleccion de herramientas, la generacion de argumentos validos y el razonamiento multi-paso en interacciones de agente sobre un sistema operativo, con salida estructurada compatible con function calling. Su relevancia actual radica en que demuestra un ciclo completo de ajuste (SFT + DPO + cuantizacion) sobre una base de 4B ejecutable en hardware de consumo, con un benchmark propio de 48 casos que mide seleccion de herramienta, precision de argumentos, comportamiento de confirmacion y seguridad. No obstante, el propio autor documenta una correccion importante: parte de los datos de entrenamiento incluyo prompts literales del benchmark, por lo que los resultados en esos casos concretos reflejan memorizacion y no generalizacion.

La licencia es Apache-2.0 tanto para la base como para el framework de entrenamiento, lo que permite uso comercial sin restricciones adicionales conocidas. El modelo esta etiquetado exclusivamente para el idioma bosnio (`bs`) y no declara soporte multilingue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-4B-bos-32768), 32 capas, hidden 2560, vocab 32768 |
| Parametros totales | 3.653.938.176 (aproximadamente 3,65 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32768 tokens (segun el nombre del modelo base) |
| Tipos de cuantizacion | Q8_0 (GGUF); no se publican otras cuantizaciones en el repo |
| Idiomas soportados | Bosnio (`bs`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`model-q8-4b-dpo01.gguf`, `model-q8-v0.3.gguf`, `model-q8-v0.2.gguf`, `model-q8.gguf`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso heredado de Qwen3.5-4B-bos-32768: 32 capas, dimension oculta de 2560 y vocabulario de 32768 tokens, segun los metadatos de la model card. Sobre esta base se aplico un ajuste LoRA con el mix de datos SFT denominado joint-06 (eval 0.7614), seguido de un paso de DPO con 140 pares de preferencias, beta 0.1, que alcanzo una train loss de 0.67 en 9 pasos y se ejecuto en una GPU T4 sin agotar memoria. El proceso de merge fue en dos etapas y la cuantizacion se realizo con `convert_hf_to_gguf.py --no-mtp` y el tipo `Q8_0`, generando un fichero de aproximadamente 3,9 GB con 426 tensores y `qwen35.block_count=32`.

Un aspecto tecnico destacable es la correccion metodologica documentada por el autor: la version v0.3 del benchmark atribuia mejoras en los casos 010, 035 y 048 al DPO, pero se determino que dichos prompts habian entrado literalmente en los datos de entrenamiento, por lo que los resultados en esos casos constituyen memorizacion. Los muestras contaminadas se eliminaron del conjunto canonico y la afirmacion original se retiro. El modelo soporta dos perfiles de inferencia mediante un unico GGUF con conmutador `think: true/false`, aunque el autor indica que el modo think de produccion sigue siendo el de v0.4-think y que el gate de razonamiento no se ha repetido en esta version.

## Capacidades

- Generacion de texto conversacional en bosnio, orientada a interacciones de agente.
- Function calling y tool calling: seleccion de herramienta y generacion de argumentos en formato estructurado.
- Razonamiento multi-paso para encadenar acciones sobre un sistema Linux.
- Comportamiento de confirmacion ante acciones sensibles (metrica `confirmation_behavior`).
- Salida JSON valida y comportamiento de rechazo o refusal ante peticiones no permitidas.
- Perfil dual de inferencia (`think: true` para razonamiento explicito, `think: false` para respuesta directa) sobre el mismo fichero GGUF.
- Integracion con Ollama mediante `Modelfile` y con endpoints compatibles (tag `endpoints_compatible`).
- No se declaran capacidades de vision, audio ni soporte multilingue mas alla del bosnio.

## Casos de uso

- Administracion de servicios Linux por lenguaje natural: el modelo interpreta preguntas como la comprobacion del estado de nginx y selecciona la herramienta adecuada, generando el comando o la llamada de funcion correspondiente con argumentos validos.
- Agente de diagnostico de sistema: encadena varios pasos (lectura de logs, comprobacion de estado, propuesta de accion) aprovechando la metrica de multi-step y la ventana de contexto de 32768 tokens para mantener el historial de la sesion.
- Automatizacion con confirmacion humana: el comportamiento de confirmacion medido al 1.0 lo hace adecuado para flujos donde las acciones destructivas requieren aprobacion explicita antes de ejecutarse.
- Integracion en pipelines de operaciones con salida JSON: la validez de JSON y el comportamiento notool medidos al 1.0 permiten usarlo como paso intermedio que devuelve estructuras parseables a un orquestador.
- Asistente local en hardware de consumo: con un fichero Q8_0 de aproximadamente 3,9 GB, puede desplegarse en estaciones de trabajo modestas para tareas de soporte interno sin depender de la nube.
- Base para experimentacion en ajuste de agentes: el framework de entrenamiento publico (SFT + DPO + cuantizacion) sirve como referencia reproducible para adaptar modelos de 4B a dominios concretos con presupuesto limitado.
- Evaluacion de seguridad y rechazo: los resultados al 1.0 en safety y refusal lo hacen util como componente de filtrado previo en agentes que operan sobre infraestructura.

## Benchmarks y rendimiento

Resultados publicados en AgentMujo-Bench v0.5 (48 casos, Q8, temperatura 0, modo non-think), tras eliminar los casos contaminados 010 y 035 del conjunto canonico:

| Metrica | 2B v0.5 | 4B v0.3 | 4B v0.4-DPO |
|---|---|---|---|
| tool_selection | 0.800 | 0.967 | 1.0 |
| argument_accuracy | 0.808 | 0.962 | 0.962 |
| confirmation_behavior | 0.8 | 1.0 | 1.0 |
| high_level_preference | 1.0 | 1.0 | 1.0 |
| multi_step | 0.833 | 0.857 | 1.0 |
| safety / refusal / json / notool | no disponible | 1.0 | 1.0 |

El recuento agregado reportado es 13 aciertos, 25 tablas y 0 perdidas frente al 2B v0.5 con prompt de produccion, y 0 aciertos, 45 tablas y 0 perdidas frente al 4B v0.3 limpio. El unico fallo restante es el caso bench-045 (file_read con `lines` legal segun esquema), que el autor atribuye a un artefacto del scorer por igualdad estricta. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-5 GB para el fichero Q8_0 de 3,9 GB, mas overhead de contexto; con 32768 tokens de contexto completo el consumo de KV cache aumenta de forma significativa.
- GPU recomendadas: el entrenamiento DPO se realizo en una NVIDIA T4 sin OOM, lo que indica que la inferencia cabe holgadamente en GPUs de gama media; una RTX 4090 o A100 ofrecerian margen amplio para contextos largos y concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM para contexto moderado; en GPUs de 6 GB puede requerir reducir la ventana de contexto.
- Opciones de despliegue: Ollama (documentado con `Modelfile`), llama.cpp (formato GGUF nativo), y servidores compatibles con endpoints segun el tag `endpoints_compatible`; vLLM y TGI no estan documentados para este fichero en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AgentMujo Q8 4B v0.4 | 3,65 mil millones | 32768 | Agente Linux en bosnio, SFT + DPO, GGUF Q8_0 | Apache-2.0 | Hugging Face |
| Qwen3.5-4B-bos-32768 (base) | 3,65 mil millones | 32768 | Base general en bosnio sin ajuste de agente | Apache-2.0 | Hugging Face (alphaedge-ai) |
| AgentMujo 2B v0.5 | no disponible | no disponible | Version reducida del mismo agente, referenciada en el benchmark | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos de benchmarks estandar que permitan comparar con alternativas de proposito general del mismo tamano; la comparacion disponible se limita al benchmark propio del autor y a las versiones anteriores del mismo linaje.

## Limitaciones y advertencias

- Contaminacion de benchmark documentada: los casos 010, 035 y 048 estuvieron presentes literalmente en los datos de entrenamiento; los resultados en esos casos no deben interpretarse como generalizacion.
- Idioma unico: el modelo esta etiquetado solo para bosnio (`bs`); su rendimiento en castellano, ingles u otros idiomas no esta evaluado ni declarado.
- Ambito estrecho: el ajuste esta orientado a tareas de agente sobre Linux; fuera de ese dominio el comportamiento no esta caracterizado.
- Riesgo de alucinacion: no se publican evaluaciones de factualidad ni de robustez ante entradas adversariales fuera del benchmark propio.
- Sesgos: no se documenta ningun analisis de sesgos en la informacion disponible.
- Modo think no reevaluado: el autor indica que el gate de razonamiento no se ha repetido en esta version y que el perfil think de produccion sigue siendo v0.4-think.
- Terminal como fallback: el autor advierte que la ejecucion en terminal es un mecanismo de reserva y que el Policy Engine es obligatorio en produccion.
- Un unico fallo conocido en bench-045 por artefacto del scorer, no necesariamente por error del modelo.
- Licencia Apache-2.0: permite uso comercial, pero al derivar de un modelo base conviene verificar las condiciones de dicho base y de los datos de entrenamiento del ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shaban2024/Qwen3.5-4B-BOS-Q8-NonThinking
- Modelo base: https://huggingface.co/alphaedge-ai/Qwen3.5-4B-bos-32768
- Repositorio del framework de entrenamiento: https://github.com/xnet-ba/agentmujo-training
