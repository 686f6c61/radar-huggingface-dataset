# csminion/apex-qwen36-swe

# csminion/apex-qwen36-swe: adaptador LoRA para reparacion de repositorios

## Resumen

Apex-qwen36-swe (etiquetado internamente como APEX SWE r16) es un adaptador LoRA de PEFT publicado por el usuario csminion sobre el modelo multimodal con mezcla de expertos Qwen/Qwen3.6-35B-A3B. No es un modelo completo: el repositorio solo contiene los pesos del adaptador (84,8 MB en safetensors, 21.166.080 parametros en 620 tensores FP32 repartidos en 310 modulos), y requiere descargar por separado los pesos base congelados en la revision 995ad96eacd98c81ed38be0c5b274b04031597b0.

El objetivo del adaptador es la reparacion de repositorios de software (repository repair) mediante trayectorias de herramientas bash, es decir, el modelo base aprende a operar en un bucle agente que ejecuta comandos, lee observaciones del terminal y produce parches. El entrenamiento se hizo sobre 2.000 filas exportadas del dataset publico nvidia/Open-SWE-Traces, generadas por un profesor Qwen3.8-Flash-Next, de las cuales 1.993 se cargaron efectivamente. Es relevante ahora porque documenta un flujo de trabajo reproducible de ajuste fino de un MoE multimodal grande con DeepSpeed ZeRO-3 sobre 4 GPU H100, y porque el autor publica de forma explicita el alcance de su evaluacion en lugar de reclamar resultados cerrados.

La ficha tecnicamente honesta tiene un limite importante: todos los resultados de benchmarks formales siguen pendientes de completar, el modelo acumula 0 descargas y 0 likes en el momento del registro, y la licencia es "other" (apache-2.0-adapter-contributions-plus-upstream-notices), por lo que su uso en produccion exige revisar tanto los terminos del adaptador como los del modelo base aguas arriba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer multimodal MoE con atencion hibrida (atencion lineal + self-attention). El adaptador no anade router ni expertos enrutados nuevos |
| Parametros totales | 21.166.080 parametros en el adaptador (620 tensores FP32, 310 modulos). Modelo base: 35B segun la nomenclatura Qwen3.6-35B-A3B; no confirmado en la informacion disponible |
| Parametros activos | Aproximadamente 3B segun la nomenclatura A3B del modelo base (MoE); no confirmado en la informacion disponible |
| Longitud de contexto | No disponible para el modelo base. El protocolo de entrenamiento y evaluacion del proyecto uso 65.536 tokens totales y 8.192 tokens de salida por llamada principal o auxiliar |
| Tipos de cuantizacion | No disponible para el adaptador (pesos en FP32). La cuantizacion aplicable depende del modelo base |
| Idiomas soportados | No disponible en los metadatos. Los datos de entrenamiento cargados cubren Python (952 filas), Go (517), JavaScript (477) y TypeScript (47) |
| Licencia | apache-2.0-adapter-contributions-plus-upstream-notices (campo license: other) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), fichero de 84.760.832 bytes |
| Modelo base | Qwen/Qwen3.6-35B-A3B, revision congelada 995ad96eacd98c81ed38be0c5b274b04031597b0 |
| Configuracion LoRA | r=16, lora_alpha=32, escalado alpha/r=2, dropout 0.05, bias=none, LoRA estandar (sin DoRA ni RS-LoRA), task_type=CAUSAL_LM, sin modules_to_save |
| Modulos objetivo | self_attn (q_proj, k_proj, v_proj, o_proj), linear_attn (in_proj_qkv, in_proj_z, in_proj_b, in_proj_a, out_proj) y shared_expert del MLP (gate_proj, up_proj, down_proj) |
| Checkpoint seleccionado | 249 (a la vez el checkpoint final y el de minima perdida de validacion nativa de la ejecucion de 249 pasos) |
| Tamano del repositorio | 0.1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 16 de octubre de 2026 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un modelo base multimodal de tipo MoE con atencion hibrida: el autor describe capas de self-attention clasicas en el modelo de lenguaje y capas de atencion lineal con proyecciones in_proj_qkv, in_proj_z, in_proj_b, in_proj_a y out_proj. El LoRA cubre unicamente las proyecciones de autoatencion, las proyecciones de atencion lineal y el experto compartido del MLP. Quedan congelados el router, los pesos de los expertos enrutados, el codificador visual y el alineador, de modo que el adaptador no altera el enrutamiento ni anade capacidad multimodal nueva: hereda la del base.

El entrenamiento nativo se ejecuto en 4 GPU H100 con acumulacion de gradiente 2 y batch global 8, completando 249 pasos de optimizador. Se uso AdamW (adamw_torch), tasa de aprendizaje 1e-4 con decaimiento coseno, warmup 0.03, weight decay 0.1, checkpointing de gradiente, DeepSpeed ZeRO-3, SDPA y Liger, con semillas 20261016. El empaquetado y el modo padding-free se desactivaron y se activo el agrupamiento por longitud; las secuencias que superaban los 65.536 tokens se eliminaron en lugar de truncarse silenciosamente, y la preparacion de datos comprobo un techo de 8.192 tokens en la salida del asistente. La receta nativa fijo enable_thinking=false, preserve_thinking=false, add_non_thinking_prefix=true y loss_scale=default+ignore_empty_think, eliminando los campos de razonamiento oculto y los bloques `<think>` iniciales, aunque conservando explicaciones visibles, observaciones de herramientas y los campos de analisis y plan del terminal.

Los datos proceden del dataset nvidia/Open-SWE-Traces (revision 1db674173119d71df45c22007af99e214600711a), con Qwen3.8-Flash-Next como profesor y metadatos de publicacion que indican thinking habilitado y esfuerzo xhigh. La seleccion partio de trayectorias de correccion de errores con resolved=1, con comprobaciones estructurales, agrupamiento por familia de origen y exclusiones formales de repositorios, conservando acciones bash y observaciones completas. De las 2.000 filas exportadas, Swift rechazo 7 por un patron de retroalimentacion herramienta a usuario que violaba el emparejamiento de roles; el entrenamiento real cargo 1.993 filas (SWE-rebench-v2=1.224, Scale-SWE=769) y mantuvo aparte una particion de validacion SFT de 87 filas. El autor cifra la estimacion de tokens de secuencia completa retenida en 67.446.810, advirtiendo que no es un contador nativo de tokens de etiqueta ni de computo. No se documento RLHF ni DPO: el ajuste es SFT supervisado sobre trayectorias de profesor.

## Capacidades

- Generacion de codigo y aplicacion de parches en repositorios: el adaptador esta especializado en trayectorias de reparacion (bug-fix) con acciones bash, observaciones del entorno y envio de parches.
- Ejecucion de bucles agente con herramientas: el entrenamiento se hizo sobre trayectorias completas de bash-tool, con observaciones y wrappers de envio alineados a un contrato minimo bloqueado.
- Razonamiento multi-paso orientado a terminal: los campos de analisis y plan del terminal se conservaron durante la preparacion de datos.
- Cobertura de lenguajes de programacion del ajuste: Python, Go, JavaScript y TypeScript, con claro predominio de Python en el conjunto cargado.
- Capacidad multimodal heredada: el pipeline declarado es image-text-to-text y el modelo base es multimodal, pero el codificador visual y el alineador permanecen congelados, por lo que el adaptador no refuerza la comprension de imagenes.
- Modo no thinking: la receta nativa desactiva el razonamiento explicito (enable_thinking=false) y anade prefijo non-thinking, por lo que el adaptador esta calibrado para respuestas sin bloque de pensamiento visible.
- Tool calling y function calling: no se documenta de forma explicita en la informacion disponible mas alla del uso de la herramienta bash; no hay declaracion formal de soporte de esquemas de function calling.
- Capacidades multilingues de texto general: no disponibles; los metadatos no declaran idiomas.

## Casos de uso

- Reparacion automatica de fallos en integracion continua: dado un test roto en un repositorio, el adaptador puede operar un bucle que ejecuta la suite, inspecciona la traza de error, edita los ficheros afectados y reenvia el parche hasta que las pruebas pasan. Es adecuado porque fue entrenado precisamente sobre trayectorias de correccion verificadas con acciones bash reales.
- Agente de triaje de issues de GitHub: el modelo puede leer la descripcion de un issue, clonar mentalmente la estructura del proyecto a partir de las observaciones del terminal y proponer un primer parche candidato para revision humana, reduciendo el tiempo hasta el primer diagnostico.
- Migraciones de codigo entre versiones de lenguaje o framework: con cobertura de Python, Go, JavaScript y TypeScript, puede abordar tareas de actualizacion de dependencias o cambios de API que exigen ediciones coordinadas en varios ficheros.
- Generacion de pruebas unitarias a partir de codigo existente: el patron de entrenamiento de inspeccion y ejecucion encaja con escribir tests, ejecutarlos en el terminal y corregirlos segun la salida observada.
- Automatizacion de tareas de mantenimiento de repositorio: actualizacion de ficheros de configuracion, ajuste de scripts de build o saneamiento de dependencias, ejecutando comandos y validando el resultado antes de entregar el parche.
- Analisis de trazas de fallo en produccion: dado un log de error y acceso a un entorno de reproduccion, el modelo puede ejecutar comandos de diagnostico, correlacionar la observacion con el codigo fuente y proponer la causa raiz con un parche minimo.
- Investigacion sobre ajuste fino de MoE multimodales: la publicacion detalla configuracion LoRA, modulos objetivo, receta de datos y criterios de filtrado, lo que la convierte en material de referencia para reproducir experimentos de SFT eficiente en modelos MoE grandes.
- Prototipado de agentes SWE en local: al ocupar solo 84,8 MB, el adaptador se puede intercambiar y servir con distintos despliegues sin duplicar almacenamiento, siempre que el base este disponible en el servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que todas las puntuaciones formales siguen pendientes y que no se hace ninguna afirmacion de rendimiento ni de correccion en la model card. Los protocolos de evaluacion lanzados, que no constituyen resultados, son los siguientes:

| Evaluacion | Protocolo declarado | Estado |
|---|---|---|
| SWE | Pro V2 HARD-51 con mini-swe-agent 2.4.6 bloqueado, presupuesto de 30 minutos y replay de parches en entorno limpio | Pendiente |
| Terminal | 89 tareas x 5 semillas, Terminus2, 30 minutos, 4 CPU y 8 GiB de RAM | Pendiente |
| HLE | 2.500 preguntas completas, incluidas 342 con imagen, sin herramientas y 300 s por pregunta; juez sustituto DeepSeek-V4-Flash alojado en la escuela | Pendiente |
| ASI | 60 tareas publicas x B1-B4, semilla oficial de instancia 31415, DirectLLM nativo, 4 CPU y 8 GiB, presupuesto continuo de 1.200 s de generacion y ejecucion | Pendiente |

El autor advierte ademas de que los fallos de infraestructura del sistema de puntuacion se registran como invalidos o nulos, no como ceros, y que las comparaciones deben acompanarse de los registros de tiempo de ejecucion por corrida, ya que la planificacion cambio entre fases historicas del modelo base.

## Requisitos de hardware

- El adaptador en si ocupa 84,8 MB y se puede cargar sobre el modelo base ya servido; no es un artefacto desplegable por separado.
- Pesos del modelo base en BF16: aproximadamente 70 GB solo en pesos, segun el tamano nominal de 35B. Estimacion aritmetica, no dato publicado.
- VRAM estimada en BF16: 80 GB o mas por instancia, con margen adicional para cache KV y el codificador visual. GPU tipo H100 80 GB o A100 80 GB; con dos A100 40 GB se requiere particionado tensorial.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 35 GB en pesos, lo que encaja en una A100 80 GB o H100 con holgura y deja espacio para cache KV.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 17-20 GB en pesos, lo que permitiria ejecucion en una RTX 4090 o RTX 3090 de 24 GB, con contexto limitado por la cache KV. Estimacion a partir del tamano del base.
- GPU recomendadas: H100 y A100 80 GB para BF16; A100 40 GB en configuracion multiparte; RTX 4090, RTX 3090 y RTX A6000 unicamente con cuantizacion agresiva y contexto reducido.
- No cabe en GPU de consumo con precision completa ni en tarjetas de 16 GB sin cuantizacion de 4 bits y contexto muy recortado.
- Opciones de despliegue: vLLM y TGI admiten servido de adaptadores LoRA sobre el base; llama.cpp y Ollama requieren fusionar el adaptador con los pesos base y convertirlos a GGUF previamente; SGLang y DeepSpeed son alternativas habituales en el mismo ecosistema. La informacion proporcionada no documenta ninguna de estas rutas de despliegue para este adaptador concreto.
- Entrenamiento: la receta nativa uso 4 GPU H100, batch global 8 y DeepSpeed ZeRO-3, con checkpointing de gradiente.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo de respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| csminion/apex-qwen36-swe (adaptador LoRA) | 21,2 M en adaptador sobre base de 35B | No disponible; el protocolo del proyecto uso 65.536 tokens totales | Sin resultados publicados | other (apache-2.0-adapter-contributions-plus-upstream-notices) | HuggingFace, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35B MoE, aproximadamente 3B activos segun nomenclatura | No disponible en la informacion proporcionada | No aplicable a esta comparacion; el adaptador modifica solo una fraccion de los pesos | Segun la licencia del publicador aguas arriba | HuggingFace, revision 995ad96eacd98c81ed38be0c5b274b04031597b0 |
| Otros adaptadores SWE publicos | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

No se dispone de datos de benchmarks de este adaptador ni de comparativas verificadas con alternativas de la misma categoria dentro de la informacion proporcionada, por lo que cualquier comparacion de rendimiento seria especulativa.

## Limitaciones y advertencias

- Todos los benchmarks formales estan pendientes: no existe ninguna afirmacion de rendimiento o correccion validada en la model card.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validacion independiente de la comunidad ni informes de terceros.
- El adaptador no incluye los pesos base: su uso exige descargar por separado un modelo MoE multimodal de aproximadamente 70 GB en BF16.
- La licencia es "other" con nombre apache-2.0-adapter-contributions-plus-upstream-notices; antes de uso comercial hay que revisar el fichero LICENSE y los terminos del modelo y el dataset aguas arriba.
- El adaptador esta entrenado en modo no thinking: las respuestas con razonamiento explicito pueden degradarse respecto al base, porque los bloques `<think>` se eliminaron y se forzo add_non_thinking_prefix.
- Sesgo de dominio claro hacia Python (952 de 1.993 filas), con Go, JavaScript y TypeScript muy por detras; el rendimiento fuera de esos lenguajes no esta caracterizado.
- Cobertura de idiomas naturales no declarada en los metadatos; no hay garantia de comportamiento homogeneo en castellano ni en otros idiomas.
- Riesgo de alucinacion en observaciones de terminal: el autor advierte que los wrappers de observacion y envio se alinearon a un contrato minimo sin inventar estados de entorno ausentes, pero que el exito registrado por el publicador no constituye un recibo de replay local.
- Las etiquetas de calidad de las fuentes, el filtrado por longitud y las exclusiones por solapamiento con entradas publicas no demuestran independencia semantica ni exito de replay.
- Las secuencias que superaban los 65.536 tokens se eliminaron en lugar de truncarse, lo que puede sesgar el ajuste hacia trayectorias mas cortas.
- El techo de 8.192 tokens en la salida del asistente limita la longitud de los parches o explicaciones generadas en una sola respuesta.
- La procedencia de las revisiones de recoleccion del dataset y el linaje de forks y renombrados no estan completamente establecidos, segun el propio autor.
- El checkpoint 249 es a la vez el final y el de minima perdida de validacion nativa, y no se uso retroalimentacion de benchmarks formales para elegir una respuesta posterior.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/csminion/apex-qwen36-swe
- Modelo base Qwen/Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Revision congelada del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/tree/995ad96eacd98c81ed38be0c5b274b04031597b0
- Dataset de trayectorias nvidia/Open-SWE-Traces: https://huggingface.co/datasets/nvidia/Open-SWE-Traces
- Revision del dataset utilizada: https://huggingface.co/datasets/nvidia/Open-SWE-Traces/blob/1db674173119d71df45c22007af99e214600711a/README.md
- Herramienta de agente mini-swe-agent (referenciada en el protocolo de evaluacion): no disponible en los resultados de busqueda
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente paginas sobre un ejecutor de scripts de Roblox sin relacion con este proyecto.
