# Lordnyx/qwen3loop-0.6b-tool-calling-sft-v1

## Resumen

Qwen3Loop-0.6B-Tool-Calling-SFT (v1) es un modelo especializado en invocación de herramientas (tool calling) desarrollado por el usuario Lordnyx y publicado en HuggingFace. Se construye sobre la arquitectura recurrente Qwen3Loop, un transformer compacto de 596.049.920 parámetros físicos que, mediante el esquema denominado LoopSplit, ejecuta 56 pasadas de capa lógicas: 7 capas de prefijo (una sola vez), un stack intermedio de 14 capas que se recorre 3 veces y 7 capas de sufijo (una sola vez). El modelo es un ajuste fino completo (no LoRA) sobre un currículo curado de 1.983 muestras estrictas de tool calling en formato Qwen Hermes `<tool_call>`, con diálogos de un solo turno `user → assistant(tool_calls)` y correcciones a mitad de trayectoria.

El problema que aborda es concreto: dotar a un modelo de menos de 1.000 millones de parámetros de una tasa de acierto alta en la selección y el formateo de herramientas conocidas, de forma que pueda desplegarse localmente en hardware de consumo (la model card reporta mediciones en una RTX 3060 con cuantización Q8_0) o en el edge. En su batería de evaluación de 121 elementos en inglés alcanza un 70,2% de precisión estricta global, con un 100% en la categoría de herramienta única con argumentos conocidos (L1) y un 85,4% en discriminación entre múltiples herramientas (L2), lo que lo sitúa por delante de Qwen3-0.6B estándar en corrección multiturno (66,7% frente a 41,7%).

Su relevancia actual radica en dos factores. Por un lado, explora una vía arquitectónica poco habitual en modelos pequeños: la recurrencia con profundidad efectiva variable, incluyendo una sonda de halting basada en entropía (`latent_halting_probe.pt`) que permite saltarse pasadas recurrentes en peticiones sencillas. Por otro, publica artefactos listos para motores estándar (GGUF "desenrollado" compatible con llama.cpp, Ollama y LM Studio) junto a los pesos nativos en bucle y el código de modelado, lo que facilita su evaluación sin infraestructura especial. El autor es explícito sobre sus límites: es un invocador fiable de herramientas conocidas en un solo turno, no todavía un agente autónomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente Qwen3Loop (LoopSplit): 28 bloques físicos, stack intermedio recorrido 3 veces |
| Parametros totales | 596.049.920 (físicos); 56 capas lógicas efectivas |
| Parametros activos | No aplica (no es MoE); 3 pasadas recurrentes sobre el stack medio (14 capas x 3) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 y F16 en GGUF; safetensors en precisión completa (FP16, 1,11 GB) |
| Idiomas soportados | Inglés (en); aproximadamente el 99% del entrenamiento es en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF (variantes desenrollada y nativa en bucle), `latent_halting_probe.pt` |

Detalles de configuración física: `hidden_size: 1024`, `intermediate_size: 3072`, 16 cabezas de atención, 28 bloques. Reparto lógico: capas 0..6 (una vez) + capas 7..20 (3 pasadas = 42) + capas 21..27 (una vez) = 56 capas lógicas.

## Arquitectura y entrenamiento

La arquitectura es un transformer recurrente de tipo "looped": en lugar de apilar 56 bloques independientes, el modelo mantiene 28 bloques físicos y reutiliza el stack intermedio (capas 7 a 20) tres veces mediante el esquema LoopSplit. Esto da como resultado 56 pasadas de capa lógicas (7 + 14x3 + 7) con el coste de memoria de 28 bloques, un compromiso entre profundidad efectiva y huella de parámetros. La model card de la línea base (`qwen3loop-0.6b-sft-deep-supervision-v1`) indica que el diseño está inspirado en el paradigma de razonamiento profundo de Nanbeige 4.5. El repositorio incluye el código de modelado propio (`engine/qwen3loop_python/modeling_qwen3loop.py`, `configuration_qwen3loop.py`, `modeling_qwen3loop_minimal.py`) y una referencia de parche para el cargador de llama.cpp (`engine/llamacpp_patch/`) que permite ejecutar la variante nativa en bucle; alternativamente se publican GGUF "desenrollados" con arquitectura `qwen3` y 56 bloques, consumibles por motores estándar.

El entrenamiento consistió en un ajuste fino completo (no LoRA) durante 1 época sobre un currículo congelado de 1.983 muestras estrictas de tool calling, en formato `<tool_call>` de Qwen Hermes, con 2xT4 en DDP. El conjunto cubre llamadas de un solo turno `user → assistant(tool_calls)`, correcciones a mitad de trayectoria y llamadas de tipo terminal, memoria y API. No se documenta en la información disponible el uso de RLHF, DPO ni la composición completa del dataset más allá de estas 1.983 muestras. Un elemento técnico destacable es la sonda de halting `latent_halting_probe.pt`, una cabeza MLP ultraligera entrenada sobre estados intermedios de prefill que estima por petición la entropía o complejidad y decide saltarse las pasadas recurrentes cuando no son necesarias, reduciendo a un paso más superficial en peticiones fáciles. El autor advierte que la precisión de enrutado del 91,5% citada corresponde a la sonda de la línea base SFT y no se ha vuelto a medir en este checkpoint, por lo que debe tratarse como una heurística de velocidad a validar en cada carga de trabajo.

## Capacidades

- Generacion de texto conversacional con plantilla de chat propia (`chat_template.jinja`).
- Tool calling y function calling en formato Qwen Hermes `<tool_call>`, con argumentos estructurados.
- Seleccion de herramienta entre un catalogo: 100% en herramienta unica conocida (L1) y 85,4% en discriminacion entre multiples herramientas (L2) segun la model card.
- Correccion multiturno: dado un error observado, el modelo reintenta y amplia la consulta (8/12 en la bateria de correccion, el unico de los tres evaluados que reintenta de forma identica ante un timeout).
- Razonamiento con Python como herramienta: capacidad parcial, con un 33,3% (10/30) en la bateria L3 y fallo documentado del disparador en aproximadamente un tercio de los prompts cuantitativos.
- Abstención ante consultas que no requieren herramienta: capacidad poco fiable, 50% (10/20) en la bateria L4.
- Profundidad adaptativa mediante la sonda de halting basada en entropia (skip de pasadas recurrentes).
- Idiomas: únicamente inglés de forma fiable; la propia model card reporta una degradación de aproximadamente 15 puntos porcentuales al repetir la batería en portugués.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito del tipo "thinking mode" más allá de los preámbulos `<think>` observados como sesgo estilístico.

## Casos de uso

- Enrutado de herramientas en asistentes de atención al cliente en inglés: el modelo decide qué función invocar y genera los argumentos en formato Hermes. Es adecuado por su 100% en herramienta única conocida, siempre que el catálogo de herramientas sea fijo y esté dentro de las 15 herramientas del entrenamiento.
- Automatización de operaciones sobre sistemas y ficheros: llamadas a herramientas de terminal, gestión de ficheros o consultas a APIs internas en pipelines de automatización, aprovechando el sesgo de entrenamiento hacia Python con heredoc basado en ficheros.
- Ejecución de código en sandbox: integración como paso previo a un ejecutor aislado que valide y corra el código generado; conviene complementarlo con un disparador externo, dado que el modelo omite la llamada a `execute_python` en aproximadamente un tercio de los prompts cuantitativos.
- Inferencia local en portátiles y equipos sin GPU dedicada: con el GGUF Q8_0 de 1,03 GB o el F16 de 1,94 GB puede ejecutarse en llama.cpp, Ollama o LM Studio con huella de memoria mínima, lo que lo hace apto para prototipos offline y demos.
- Componente de un agente con controlador externo: dado que la abstención no es fiable (50%), el modelo encaja como "invocador" dentro de un orquestador que aplique un gate de coste o de efectos secundarios antes de ejecutar cada llamada.
- Extracción de parámetros estructurados hacia APIs de terceros: generación de payloads de llamada a servicios REST a partir de lenguaje natural, con validación posterior del esquema, para tareas de integración de sistemas.
- Recuperación de memoria y búsquedas en bases de conocimiento: el modelo emite llamadas de tipo memoria o búsqueda, con la salvedad documentada de que tiende a generar búsquedas de memoria con consulta vacía como sesgo heredado del entrenamiento.
- Investigación sobre transformers recurrentes: replicar y medir el efecto de las pasadas recurrentes y de la sonda de halting sobre la precisión, usando los artefactos de modelado y el parche de llama.cpp incluidos en el repositorio.

## Benchmarks y rendimiento

Batería de retención de 121 elementos en inglés (50 herramientas, 8 dominios), evaluada en Q8_0 sobre RTX 3060 con `temperature=0.0`:

| Particion | Puntuacion | Lectura del autor |
|---|---|---|
| Herramienta unica precisa (L1) | 30/30 (100%) | Herramienta conocida con argumentos: resuelto |
| Discriminacion multi-herramienta (L2) | 35/41 (85,4%) | Solido; falla en senuelos financieros proximos |
| Razonamiento en Python (L3) | 10/30 (33,3%) | Disparador debil |
| Abstencion en negativos (L4) | 10/20 (50,0%) | Poco fiable |
| Precision estricta global | 85/121 (70,2%) | Adherencia de formato 83,5%; seleccion de herramienta 81,8% |

Batería de corrección multiturno de 12 elementos (observación de error fija, mismos prompts, misma GPU):

| Modelo | Puntuacion |
|---|---|
| Este checkpoint (tool-SFT) | 8/12 (66,7%) |
| Qwen3-0.6B stock, Q8_0 | 5/12 (41,7%) |
| Base SFT previo al ajuste de herramientas (misma linea) | 3/12 (25,0%) |

Según la model card, el ajuste de tool calling recuperó la capacidad de uso de herramientas que el SFT base había prácticamente suprimido, con una mejora de 42 puntos porcentuales respecto a su propia base. No se publican resultados de MMLU, HumanEval, GSM8K ni de otras baterías generalistas en la información disponible.

## Requisitos de hardware

- Huella de pesos: 0,64 GB (Q8_0 nativo en bucle), 1,03 GB (Q8_0 desenrollado), 1,12 GB (F16 nativo), 1,94 GB (F16 desenrollado), 1,11 GB (safetensors en precisión completa). El repositorio completo ocupa 6,2 GB.
- VRAM estimada para inferencia: inferior a 2 GB solo para pesos en las variantes desenrolladas; hay que sumar la caché KV, que depende de la longitud de contexto efectiva (no documentada). En la practica cabe con holgura en cualquier GPU consumer con 4 GB o mas.
- GPU validadas por el autor: 2xT4 para el entrenamiento (DDP) y RTX 3060 para la evaluacion en Q8_0.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, 4060, 4090) es suficiente; tambien A100/H100 si se despliega en lote dentro de un servicio, aunque el modelo esta claramente sobredimensionado para ese hardware.
- Despliegue en CPU: viable con llama.cpp y con Ollama/LM Studio usando los GGUF desenrollados, gracias a su tamano inferior a 2 GB.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio para los GGUF desenrollados (arquitectura `qwen3`, 56 bloques); motor propio de PyTorch (`engine/qwen3loop_python/`) para los pesos safetensors; el parche `engine/llamacpp_patch/` es necesario para la variante nativa en bucle. El repositorio esta marcado como `endpoints_compatible`. No se documenta soporte especifico de vLLM o TGI.
- Latencia y throughput: no disponibles. La unica afirmacion cuantitativa es cualitativa: la sonda de halting busca mayor throughput en peticiones faciles al saltarse pasadas recurrentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Datos disponibles |
|---|---|---|---|---|
| Qwen3Loop-0.6B-Tool-Calling-SFT v1 (este) | 596 M fisicos, 56 capas logicas | No disponible | Apache 2.0 | 8/12 en correccion multiturno; 70,2% estricto global en bateria propia de 121 elementos |
| Qwen3Loop-0.6B-SFT deep supervision v1 (linea base) | 596 M fisicos | No disponible | No disponible en la informacion proporcionada | 3/12 en correccion multiturno segun este modelo |
| Qwen3-0.6B stock (Q8_0) | ~0,6 B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | 5/12 en correccion multiturno segun este modelo |

Las tres entradas de comparacion disponibles provienen de la propia model card, que solo publica la puntuacion de la bateria de correccion multiturno para los tres modelos. No se dispone de comparaciones con alternativas como Qwen3-0.6B ajustados con LoRA para tool calling, ya que no hay datos de benchmark en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles: aproximadamente el 99% del entrenamiento esta en ingles; los prompts en otros idiomas degradan mediblemente la seleccion y el disparo de herramientas (la misma bateria en portugues puntuo unos 15 puntos porcentuales menos en una ejecucion parcial).
- Abstencion no fiable: invoca herramientas cuando deberia permanecer en silencio en aproximadamente el 50% de los casos negativos (los 5 elementos de sonda de abstencion fallaron). Es obligatorio aplicar un gate externo si las llamadas tienen coste o efectos secundarios.
- Disparador de codigo ausente: en aproximadamente un tercio de los prompts cuantitativos directos responde en prosa en lugar de llamar a `execute_python`; el modelo se entreno con Python en heredoc basado en ficheros, no con fragmentos sueltos de `print()`.
- Herramientas no vistas: las herramientas financieras (`get_stock_quote` frente a `get_company_financials`) y cualquier herramienta fuera del catalogo de 15 del entrenamiento provocan selecciones erroneas o ausencia de llamada. La invocacion dentro de distribucion es del 100%; la transferencia no.
- Validado solo en un turno: el comportamiento multiturno se midio sobre 12 elementos; los bucles agenticos largos no estan probados.
- Techo de capacidad de 0,6B: los fallos con flags de Unix poco comunes, senuelos de grano fino y nombres de entidades inventados (por ejemplo, variantes de cmdlets alucinadas) reflejan limites de capacidad, no solo de datos.
- Sesgos estilisticos: preambulos `<think>` verbosos y busquedas de memoria con consulta vacia reproducen los priors del entrenamiento; son inofensivos pero ensucian los registros.
- Riesgo de alucinacion: documentado de forma explicita en forma de nombres de comandos o variantes de herramientas inventadas cuando la tarea queda fuera de la distribucion de entrenamiento.
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial sin restricciones adicionales conocidas; conviene verificar la licencia del modelo base de la linea (Qwen3Loop-0.6B SFT) antes de un despliegue en produccion.
- Ambito de uso declarado por el autor: invocador fiable de herramientas conocidas en un solo turno, no un especialista autonomo en herramientas. Una hipotetica V2 abordaria abstencion, disparo de codigo y discriminacion de senuelos financieros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lordnyx/qwen3loop-0.6b-tool-calling-sft-v1
- Linea base de la familia (SFT deep supervision v1): https://huggingface.co/Lordnyx/qwen3loop-0.6b-sft-deep-supervision-v1
- Arbol de ficheros del modelo base: https://huggingface.co/Lordnyx/qwen3loop-0.6b-sft-deep-supervision-v1/tree/main
- Ficha de registro en free2aitools: https://free2aitools.com/model/lordnyx/qwen3loop-0.6b-sft-deep-supervision-v1
- Tutorial de referencia sobre ajuste fino de Qwen3-0.6B para tool calling con LoRA (contexto general, no especifico de este modelo): https://lumienai.com/news/fine-tune-tool-calling-llm-qwen3-lora-xyz-aquila-sft
