# mokshjain/pico

## Resumen

Pico es un modelo de lenguaje de 48,2 millones de parametros con arquitectura transformer decoder-only, entrenado desde cero en JAX puro (sin Flax ni optax) por el desarrollador independiente mokshjain. Sigue la receta de nanochat de Andrej Karpathy y la extiende para construir un agente completo con capacidad de llamada a herramientas, cubriendo todo el ciclo desde el preentrenamiento hasta el aprendizaje por refuerzo on-policy, sin destilacion ni datos sinteticos generados por otros LLM.

El modelo destaca por demostrar que un transformer muy pequeno puede adquirir habilidades agenticas funcionales (ejecucion de comandos, uso de funciones declaradas en JSON, busqueda web) cuando el entrenamiento se disena especificamente para ello. Alcanza un CORE completo de 0,131 y un TOOL de 0,304, superando a GPT-2 124M en CORE (0,114) con solo el 40 por ciento de sus parametros.

Su relevancia actual radica en dos innovaciones tecnicas: un patron de atencion SSSL que combina capas locales con ventana deslizante de 512 tokens y capas globales sin codificacion posicional (NoPE), lo que permite extrapolacion zero-shot a 32k tokens de contexto; y un pipeline de RL con GRPO sincrono en fp32 sobre ocho entornos de ejecucion reales, con paridad exacta de log-probabilidades entre entrenador y motor de inferencia (delta maximo de 2e-4).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion SSSL (7 capas locales con ventana deslizante de 512 tokens + RoPE base 10k, 3 capas globales causales con NoPE) |
| Parametros totales | 48.234.516 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens en el modelo base; 16.384 tokens en las variantes extendidas; extrapolacion zero-shot verificada hasta 32k en recuperacion de passkey |
| Tipos de cuantizacion | no disponible (repo con safetensors y ckpt.npz en fp32; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors) y NumPy npz (runs/<run_name>/ckpt.npz, ~193 MB por checkpoint) |

## Arquitectura y entrenamiento

Pico es un transformer decoder-only de 48,2M de parametros entrenado integramente en JAX puro, sin capas de abstraccion como Flax u optax. El tokenizador es un BPE byte-level de vocabulario 16.384 implementado con rustbpe y tiktoken (identificador interno v2). La innovacion arquitectonica principal es el patron de atencion SSSL: siete capas usan atencion local con ventana deslizante fija de 512 tokens y RoPE con base 10.000, mientras que tres capas (las numeradas 3, 7 y 9) aplican atencion causal global sin codificacion posicional (NoPE). Esta combinacion permite extrapolacion de contexto zero-shot: el modelo base, entrenado a 2.048 tokens, recupera passkeys a 32k con precision del 100 por ciento frente al 20 por ciento de una variante con RoPE en todas las capas.

El entrenamiento consta de tres fases. La primera es un preentrenamiento sobre 10.000 millones de tokens con una mezcla del 80 por ciento de texto web ClimbMix y 20 por ciento de codigo (shell, python, sysadmin_qa); el ultimo 15 por ciento se anealiza sobre texto de referencia de alta calidad (finepdfs_edu, fineweb_edu_hq, finemath, wikipedia) mas un 9 por ciento de trayectorias agenticas de uso de herramientas (terminal_nemotron, terminal_openthoughts, exec_traces, nl2cmd_chat), usando un schedule WSD (warmup-stable-decay) con 38.146 pasos. La segunda fase es un mid-training de 0,9B tokens a 4k de contexto que ensena chat multi-turno, matematicas como codigo Python y formatos de llamada a herramientas (bash, python, busqueda y fetch de Wikipedia, weather, funciones JSON declaradas y rechazo de funciones irrelevantes). La tercera fase aplica GRPO on-policy sincrono en fp32 sobre ocho entornos de ejecucion reales, con ventajas normalizadas por desviacion estandar y exploracion guiada por referencia (el flag --guide inyecta unas 230 soluciones programaticas solo en grupos de cero aciertos para romper la meseta de varianza cero).

## Capacidades

- Generacion de texto y razonamiento basico en ingles a escala de 48M de parametros (CORE completo de 0,131 sobre 22 tareas).
- Llamada a herramientas y function calling declaradas en JSON, con soporte para bash, python, weather y funciones arbitrarias.
- Ejecucion de comandos de terminal: 1,000 de acierto en las 312 instancias retenidas del conjunto Terminal y 0,333 en seis tipos de tareas nuevas no vistas.
- Traduccion de lenguaje natural a shell (NL2SH) con 0,303 de coincidencia de ejecucion sobre 300 casos.
- Busqueda y recuperacion de informacion sobre un indice local de Wikipedia de 20,8 millones de pasajes con BM25 mas reranking (0,210 de acierto en QA abierta con busqueda).
- Razonamiento matematico elemental expresado como codigo Python (GSM8K de 0,145 en el checkpoint final).
- Agentes multi-paso: el modelo esta disenado para cadenas de tool calling encadenadas con estado de ejecucion.
- Capacidad bilingue limitada: entrenado exclusivamente en ingles.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Agente de automatizacion de terminal: el modelo puede traducir instrucciones en lenguaje natural a comandos de shell y ejecutarlos en un sandbox, con 0,303 de coincidencia de ejecucion; resulta util para asistentes de linea de comandos ligeros que corran en CPU.
- Prototipado y ensenanza de pipelines agenticos: al ser un modelo de 48M de parametros entrenado integramente en JAX desde cero, sirve como referencia reproducible para estudiar como emerge el uso de herramientas en modelos pequenos.
- Investigacion en RL para agentes: el pipeline GRPO con paridad exacta de log-probabilidades (delta maximo de 2e-4) y entornos de ejecucion reales es un banco de pruebas barato para experimentar con RL on-policy sin recurrir a APIs externas.
- Edge computing y dispositivos embebidos: con 48M de parametros cabe en memoria de microcontroladores de gama alta o en CPU de un telefono, lo que habilita asistentes locales sin conectividad.
- Router o clasificador de intenciones en pipelines mayores: puede decidir que herramienta invocar (busqueda, weather, bash) antes de delegar en un modelo mas grande, reduciendo coste y latencia.
- Filtrado y pre-procesado de comandos: dado su rendimiento en NL2SH y su capacidad de rechazar funciones irrelevantes, puede usarse para validar o normalizar ordenes antes de ejecutarlas en produccion.
- Educacion en agentes y herramientas: al ser MIT y entrenado sin destilacion, es un recurso didactico para cursos sobre LLM y RL aplicado.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluacion greedy con ejecucion real en sandboxes aislados):

| Metrica | Base 16k lr01 | mt_lr05 | rl_mt05b | mt_tool20c | rl_web5 | rl_web7 (final) |
|---|---|---|---|---|---|---|
| CORE completo (22 tareas) | 0,134 | 0,121 | 0,120 | 0,123 | 0,125 | 0,131 |
| Terminal (312 instancias) | 0,074 | 0,167 | 0,558 | 0,138 | 1,000 | 1,000 |
| Terminal_new (6 tareas nuevas) | no disponible | 0,000 | 0,250 | no disponible | 0,320 | 0,333 |
| NL2SH (300 casos) | 0,280 | 0,283 | 0,267 | no disponible | 0,223 | 0,303 |

Metricas adicionales del checkpoint final rl_web7: GSM8K 0,145, QA con busqueda 0,210, Weather 0,635, BFCL 0,33. Del modelo base final_10b_mila: CORE completo 0,1273, TOOL 0,304, bpb de validacion ClimbMix 0,9090, bpb shell_cmd 0,707. Referencia comparativa: GPT-2 124M obtiene CORE 0,114.

Resultados de extrapolacion de contexto (necesidad de 4 agujas a 32k): 0,18 en el modelo base y 0,75-0,76 en las variantes extendidas a 16k. La perdida en FinePDFs-Edu entre 8k y 16k baja de 0,918 a 0,847-0,853 bpb tras la extension de 315M tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (48M parametros x 4 bytes ~ 193 MB), sin necesidad de cuantizacion.
- GPU recomendadas: cualquier GPU moderna sirve, incluso integradas; se puede entrenar o ajustar en una unica RTX 3090, RTX 4090, A100 o H100 sin problemas.
- Cabe en GPU consumer sin dificultad: desde una GTX 1050 o una iGPU hasta la gama alta; tambien corre comodamente en CPU.
- Opciones de despliegue: JAX (framework nativo), y al estar en safetensors es convertibles a formatos de llama.cpp, Ollama, vLLM o TGI, aunque el autor no publica recetas especificas para estos motores.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- El entrenamiento completo (38.146 pasos sobre 10B tokens) fue factible en el entorno del autor usando JAX puro, lo que sugiere que el ciclo completo de entrenamiento cabe en una unica GPU de gama alta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CORE | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pico (rl_web7) | 48,2M | 16.384 (base 2.048) | 0,131 | MIT | HuggingFace mokshjain/pico |
| GPT-2 124M | 124M | 1.024 | 0,114 | MIT | OpenAI / HuggingFace |
| nanochat (receta base) | variable | variable | no disponible | MIT | GitHub karpathy/nanochat |
| SmolLM-135M | 135M | 2.048 | no disponible | Apache 2.0 | HuggingFace HuggingFaceTB |

Pico supera a GPT-2 124M en CORE pese a tener un 61 por ciento menos de parametros, aunque su contexto base de 2.048 tokens es inferior al de alternativas modernas como SmolLM-135M. No se dispone de comparaciones publicadas frente a modelos agenticos de mayor tamano en las mismas tareas.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan analisis de sesgo; al entrenarse sobre ClimbMix web mas codigo, es probable que herede sesgos de ese corpus.
- Riesgo de alucinacion: elevado. Con 48M de parametros y un CORE de 0,131, el modelo falla con frecuencia en conocimientos factuales; las metricas de QA abierta (0,210) y GSM8K (0,145) reflejan baja fiabilidad.
- Limitacion de contexto: el modelo base opera a 2.048 tokens; solo las variantes extendidas alcanzan 16.384, y la extrapolacion a 32k se ha validado unicamente en recuperacion de passkey, no en tareas generativas largas.
- Idioma: entrenado exclusivamente en ingles; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Capacidad limitada en tareas generales: no sustituye a modelos de mayor tamano para generacion de texto abierta o razonamiento complejo.
- Restricciones de licencia: MIT permite uso comercial sin restricciones, pero la ausencia de garantias implica que cualquier despliegue en produccion es responsabilidad del integrador.
- Caveat para produccion: los pesos finales estan en safetensors y ckpt.npz en fp32; no hay versiones cuantizadas oficiales ni integracion lista para vLLM, TGI u Ollama, lo que exige trabajo adicional de conversion y validacion.
- El conjunto Terminal_new (0,333) indica degradacion notable en tipos de tareas no vistas durante el entrenamiento, un aviso sobre su generalizacion fuera de distribucion.

## Enlaces

- HuggingFace: https://huggingface.co/mokshjain/pico
- Informe W&B con curvas y ablaciones: https://wandb.ai/mokshjain/full_model/reports/Pico:-A-48M-Parameter-Agentic-Language-Model-Trained-from-Scratch-in-JAX--VmlldzoxODExMjAwNQ==
- Receta nanochat (Karpathy): https://github.com/karpathy/nanochat
