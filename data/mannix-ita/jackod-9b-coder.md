# ManniX-ITA/JackOD-9B-Coder

## Resumen

JackOD-9B-Coder es un modelo de lenguaje de 9.653.104.368 parámetros (aproximadamente 9,65B) distribuido por el usuario ManniX-ITA. No es un modelo entrenado desde cero, sino un *merge* de cuatro vías construido con la herramienta `omnimergekit` sobre `Qwen/Qwen3.5-9B`, que actúa como ancestro común de todas las fuentes. El objetivo declarado por el autor es acotado y explícito: codificación agéntica multi-turno, es decir, mantener una tarea a lo largo de varios turnos y llamadas a herramientas hasta completarla y detenerse, en lugar de competir en benchmarks de conocimiento general.

La versión v3 (24 de octubre de 2026) reemplaza los pesos de las dos fuentes minoritarias respecto a v2: DeltaCoder 0,55, Ornith-1.5-9B 0,30 y Coder-Flash 0,15. Se mantiene la receta `omnimerge_v2` con densidad 0,53, `darex-q` 0,75 y semilla 42. La licencia es Apache-2.0, los pesos se publican en safetensors y el autor distribuye además un GGUF Q6_K con el que se realizó la evaluación.

Su relevancia actual es doble: por un lado, documenta con bastante detalle una receta reproducible de merge con corrección de tokens especiales; por otro, publica una evaluación sobre GGUF cuantizado con un *sampler* de servicio concreto, lo que facilita reproducir las condiciones. Conviene tener presente que es un modelo comunitario con adopción baja (318 descargas, 5 *likes*) y sin resultados comparativos frente a modelos de referencia en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer denso, `Qwen3_5ForConditionalGeneration` en config.json) |
| Parametros totales | 9.653.104.368 (9,65B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (precisión original del merge) y GGUF Q6_K publicado; no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (`en`); no se declaran otros idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y GGUF (Q6_K) |
| Modelo base | Qwen/Qwen3.5-9B (ancestro común de todas las fuentes) |
| Cabezas especiales | MTP head preservada (15 tensores), utilizable como *drafter* en decodificación especulativa |
| Tokenizer y plantilla | tomados de Jackrong/Qwopus3-5-9B-Coder-Flash |
| Tokens especiales | `eos_token_id` 248046, `pad_token_id` 248055 (fijados en la raíz del config) |
| Tensores totales | 775, sin ningún tensor `visual.*` |

## Arquitectura y entrenamiento

El modelo es un *merge* de vectores de tarea, no un fine-tuning. La receta `omnimerge_v2` toma como `--base` y `--task-base` el mismo `Qwen3.5-9B`, de modo que los vectores de tarea se calculan contra el ancestro común real y no contra un hermano, evitando doble contabilidad de las diferencias compartidas. Los pesos finales son DeltaCoder 0,55, Ornith-1.5-9B 0,30 y Coder-Flash 0,15, con densidad 0,53, `darex-q` 0,75 y semilla 42. DeltaCoder se incorpora como LoRA r32/a32 aplicado a denso antes del merge. El pipeline excluye explícitamente los patrones `visual.` y `mtp.`.

La decisión técnica más reseñable es el tratamiento de la MTP head: se deja fuera del promedio y se pasa intacta, porque una cabeza MTP promediada deja de ser un *drafter* utilizable. El segundo detalle crítico es la corrección de tokens especiales: Qwen3.5-9B, DeltaCoder aplicado y Coder-Flash no llevan `eos_token_id` en la raíz del config (solo en el config de texto anidado), lo que hace que el conversor a GGUF caiga en un valor por defecto y filtre tokens de control en las generaciones. El merge fija la raíz a 248046/248055 y adopta el tokenizer y la plantilla de chat de Coder-Flash. No se documenta en la información disponible ningún entrenamiento adicional, dataset, fase de RLHF/DPO ni número de tokens de entrenamiento.

## Capacidades

- Generación de texto y código en inglés, con foco declarado en código y razonamiento.
- Codificación agéntica multi-turno: el autor insiste en la capacidad de sostener una tarea y terminarla, no solo de responder una vez.
- *Tool calling* / *function calling*, etiquetado explícitamente en el modelo.
- Modo de razonamiento con presupuesto de *thinking*: la evaluación se hizo con `--reasoning-budget` de 12.288 tokens.
- Decodificación especulativa mediante la MTP head preservada (15 tensores fuera del merge).
- Seguimiento de instrucciones: 0,9400 en IFEval (100) en la evaluación v3 publicada.
- Capacidad de generación de código multiparadigma: MultiPL-E (300) con 0,8033.
- No dispone de visión: pese a heredar `vision_config`, `preprocessor_config.json` y la etiqueta `image-text-to-text`, no hay pesos `visual.*` ni `mmproj`. El modelo es solo texto.
- No se declaran capacidades de audio ni otros idiomas distintos del inglés.

## Casos de uso

- Agentes de codificación autónomos sobre repositorios: el modelo está construido para encadenar turnos y llamadas a herramientas hasta cerrar una tarea (leer fichero, editar, ejecutar tests), que es exactamente el escenario que declara el autor.
- Integración en pipelines de CI/CD como generador de parches: con *tool calling* puede invocarse desde un orquestador que le pase el fallo de compilación o de test y espere una edición concreta, sin necesidad de conversación larga.
- Asistente de refactorización multi-archivo: su rendimiento en HumanEval (0,8720) y HumanEval+ (0,8049) sugiere competencia en funciones aisladas; el valor añadido frente a un modelo base es la persistencia entre pasos.
- Generación y corrección de código en varios lenguajes: MultiPL-E 0,8033 sobre 300 problemas indica un comportamiento razonablemente estable fuera de Python, útil para tareas políglotas en un mismo repositorio.
- Automatización de tareas guiadas por instrucciones: con 0,9400 en IFEval, es adecuado para *workflows* donde el modelo debe respetar un formato de salida estricto (por ejemplo, devolver JSON con campos fijos para un orquestador).
- Servicio local de asistencia a programadores: al publicarse GGUF Q6_K (unos 7,9 GB estimados de pesos), puede desplegarse en una estación de trabajo con GPU de consumo y usarse con llama.cpp u Ollama sin depender de la nube.
- Evaluación comparativa de recetas de merge: para investigadores, el repositorio documenta comando exacto, revisiones fijadas y correcciones aplicadas, lo que lo convierte en un caso de estudio reproducible.

## Benchmarks y rendimiento

Resultados publicados para v3, medidos sobre el GGUF Q6_K (`JackOD-9B-Coder-Q6_K.gguf`, sha256 `3f202a76…51b8`, imatrix `ornith-1.5-9b` de AtomicChat `feb286c4…`) con llama.cpp `311d4211bf` y el *sampler* de servicio: temperatura 0,4, top_p 0,95, top_k 20, min_p 0, repeat_penalty 1,002 sobre los últimos 112 tokens, presence_penalty 1,05, semilla aleatoria por petición y presupuesto de razonamiento de 12.288 tokens.

| Benchmark | JackOD v3 |
|---|---|
| HumanEval (164) | 0,8720 |
| HumanEval+ (164) | 0,8049 |
| LiveCodeBench v6 (55 hard) | 0,9455 |
| MultiPL-E (300) | 0,8033 |
| IFEval (100) | 0,9400 |

Advertencias del propio autor que conviene reproducir: son puntuaciones muestreadas, una sola tirada por problema, y no son comparables en base con las tablas de v2 y v1, que se midieron en modo *greedy*. En estos tamaños, un problema equivale a 1,8 puntos porcentuales en LiveCodeBench y 0,6 en HumanEval. En LiveCodeBench el resultado es 52 de 55: las 55 generaciones terminaron por sí mismas (ninguna alcanzó el límite de longitud) y los 3 fallos son respuestas incorrectas o errores de ejecución, no truncamientos.

No se incluyen en la información disponible las tablas de v2 y v1, ni comparaciones directas contra otros modelos. Tampoco se han publicado resultados de benchmarks en la información disponible para MMLU, GSM8K u otras pruebas de conocimiento general; el autor indica explícitamente que el modelo no está construido para ganar ese tipo de benchmarks y que su conocimiento del mundo es limitado para su tamaño.

## Requisitos de hardware

- VRAM estimada para pesos en BF16/safetensors: unos 19,3 GB solo de pesos (9,65B × 2 bytes), más caché KV y *overhead*; el tamaño del repositorio es de 38,6 GB, probablemente por incluir varios artefactos.
- VRAM estimada en GGUF Q6_K: unos 7,9 GB de pesos; con caché KV y contexto de servicio, un entorno de 10-12 GB es un punto de partida razonable.
- Otras cuantizaciones no están publicadas por el autor; como referencia aritmética, Q8 rondaría 10,3 GB, Q5_K_M unos 6,8 GB y Q4_K_M unos 5,9 GB (estimaciones calculadas, no verificadas).
- GPU profesionales: A100 40 GB, A100 80 GB o H100 permiten BF16 con holgura y sirven para despliegue concurrente. Una A100 40 GB o una L40S 48 GB son suficientes para BF16 con contexto moderado.
- GPU de consumo: RTX 4090 o RTX 3090 (24 GB) pueden alojar BF16 muy justo, y con comodidad Q6_K u 8 bits. RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB o similares cubren Q6_K y cuantizaciones menores.
- Despliegue: llama.cpp es la ruta validada por el autor (la evaluación se hizo con llama.cpp sobre GGUF). Ollama es viable al existir GGUF. vLLM y TGI no están documentados en la información disponible para esta arquitectura concreta; conviene verificar soporte de `qwen3_5` antes de planificar. La etiqueta `endpoints_compatible` sugiere compatibilidad con *endpoints* gestionados de Hugging Face.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.
- La longitud de contexto no está documentada, por lo que el dimensionado de la caché KV no puede calcularse a priori; hay que fijarlo empíricamente en el servidor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmarks publicados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ManniX-ITA/JackOD-9B-Coder | 9,65B | no disponible | HumanEval 0,8720; HumanEval+ 0,8049; LCB v6 0,9455; MultiPL-E 0,8033; IFEval 0,9400 | Apache-2.0 | 318 descargas, 5 likes |
| Qwen/Qwen3.5-9B (base) | ~9B nominal | no disponible | no disponible | no disponible | modelo público de referencia |
| danielcherubini/Qwen3.5-DeltaCoder-9B | ~9B nominal | no disponible | no disponible | no disponible | público; fuente con peso 0,55 |
| ornith-ai/Ornith-1.5-9B | ~9B nominal | no disponible | no disponible | no disponible | público; fuente con peso 0,30 |
| Jackrong/Qwopus3-5-9B-Coder-Flash | ~9B nominal | no disponible | no disponible | no disponible | público; fuente con peso 0,15 |

Los tres modelos fuente son, por construcción, los comparadores más directos, pero la información disponible no incluye sus fichas técnicas ni resultados de benchmarks, por lo que la comparación cuantitativa no puede establecerse más allá de los pesos del merge. Tampoco se dispone de datos de contexto, licencia o rendimiento de los mismos.

## Limitaciones y advertencias

- Conocimiento del mundo limitado para su tamaño, según declara el propio autor; no es un modelo adecuado para tareas de conocimiento enciclopédico ni para responder preguntas factuales sin verificación.
- Solo inglés declarado. No hay soporte multilingüe documentado, lo que incluye el castellano.
- Sin visión, pese a las apariencias: el repositorio incluye `vision_config`, `preprocessor_config.json` y `video_preprocessor_config.json` heredados, y la etiqueta `image-text-to-text`, pero no existen pesos `visual.*` ni `mmproj`. Cualquier intento de uso multimodal fallará.
- Resultados de benchmark frágiles: una sola tirada por problema, semilla no fijada, *sampler* concreto y 55 problemas en LiveCodeBench. Las diferencias de pocos puntos porcentuales no son significativas.
- Las tablas de v1 y v2 se midieron en modo *greedy* y no son comparables con las de v3; el autor no las presenta como ganancia ni pérdida.
- Riesgo de alucinación no cuantificado: no se publican evaluaciones de veracidad, seguridad ni sesgos.
- Es un merge comunitario, no un modelo entrenado ni validado por el equipo de Qwen; la adopción es baja y no hay un historial amplio de uso en producción.
- La corrección de `eos_token_id`/`pad_token_id` en la raíz es imprescindible: si se reconvierte o se manipula el modelo sin ese ajuste, aparecerán tokens de control en las salidas.
- La plantilla de chat es la de Coder-Flash y no la del Qwen3.5 base; usar otra plantilla altera el comportamiento esperado.
- La licencia Apache-2.0 se aplica a este repositorio, pero las condiciones de los modelos fuente y del base deben verificarse por separado antes de un uso comercial.
- El presupuesto de razonamiento de 12.288 tokens usado en la evaluación implica un coste de cómputo y latencia considerable si se replica en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ManniX-ITA/JackOD-9B-Coder
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Fuente DeltaCoder: https://huggingface.co/danielcherubini/Qwen3.5-DeltaCoder-9B
- Fuente Ornith: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Fuente Coder-Flash (v2/v3): https://huggingface.co/Jackrong/Qwopus3-5-9B-Coder-Flash
- Fuente v1: https://huggingface.co/Jackrong/Qwopus3.5-9B-coder
- Repositorio de la herramienta: https://github.com/mann1x/omnimergekit
- Receta v1: https://github.com/mann1x/omnimergekit/tree/main/recipes/jackod-9b-coder
- Paper, blog o demo: no disponibles en la información proporcionada. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo.
