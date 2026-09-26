# Johnny5b/MiMo-9B-CORTEX-GGUF

## Resumen

MiMo-9B-CORTEX-GGUF es un ajuste fino (fine-tune) del modelo XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, publicado por el usuario Johnny5b bajo licencia MIT y distribuido exclusivamente en formato GGUF para llama.cpp. No se trata de un modelo de propósito general, sino de una especialización en el llamado protocolo CORTEX: un conjunto de reglas de comportamiento orientadas a la trazabilidad de operaciones de reparación, con cabeceras de traza obligatorias y una política de "fail-closed" (rechazo explícito) ante peticiones no mapeadas. El problema que aborda es acotado: forzar al modelo a emitir trazas estructuradas y a abstenerse de actuar cuando no dispone de un mapeo válido, en lugar de improvisar.

Arquitectónicamente es un modelo denso de la familia `qwen3_5` (etiquetado como dense hybrid), con 32 capas organizadas en un patrón 3:1 que alterna capas de atención lineal basadas en gated DeltaNet con capas periódicas de atención completa, y una FFN densa sin mezcla de expertos (MoE-free). Cuenta con 8.953.803.264 parámetros totales y un vocabulario de 248.320 entradas. La conversión a GGUF se realizó con `--no-mtp` porque la configuración base declara `mtp_num_hidden_layers: 1` pero no incluye módulo MTP, lo que rompería la carga en llama.cpp.

Su relevancia es más experimental que de producción: el repositorio registra cero descargas y cero "likes", el ajuste se hizo con tan solo 404 ejemplos durante 52 pasos (QLoRA r=16, 2 épocas, lr 1e-4, train_loss final 1.589) y los datos de rendimiento publicados son medidas relativas en una misma máquina CPU. Es, por tanto, un artefacto útil para estudiar el comportamiento fail-closed y el formateo de trazas, no una alternativa competitiva a modelos generalistas del mismo tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido de la familia `qwen3_5`; patrón 3:1 de capas gated DeltaNet (atención lineal) a capas de atención completa; FFN densa sin MoE |
| Parametros totales | 8.953.803.264 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (único fichero publicado en el repo) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`MiMo-9B-CORTEX-v1-Q4_K_M.gguf`, 5,63 GB) |
| Profundidad | 32 capas |
| Tamano de vocabulario | 248.320 |
| Tamano del repositorio | 5,6 GB |
| sha256 del fichero | `34c79f8bf79b3819199821361d8ca221d8749d77bbacce185587c60d5e6b8365` |
| Tokens de parada | `<|im_end|>` (248046) y `<|endoftext|>` (248044) |
| Creado / actualizado | 2026-09-25 / 2026-09-25 |

## Arquitectura y entrenamiento

El modelo parte de XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B y conserva su estructura de transformer denso híbrido: de las 32 capas, la mayoría emplean gated DeltaNet, un mecanismo de atención lineal con estado recurrente, intercaladas cada tres capas con atención completa convencional. Esta combinación busca reducir el coste computacional y de memoria del contexto largo manteniendo capacidad de recuperación global en intervalos periódicos. La red feed-forward es densa, sin expertos, y el vocabulario asciende a 248.320 tokens. La conversión se hizo con la opción `--no-mtp` para evitar metadatos huérfanos (`mtp_num_hidden_layers: 1` sin módulo MTP asociado) que impedirían la carga en llama.cpp. El autor puntualiza en su "honest ledger" que la directiva original de evitar transformers se refiere al runtime (inferencia con llama.cpp puro, sin la librería `transformers`), no a la arquitectura, que sí es de familia transformer.

El entrenamiento consistió en un ajuste QLoRA de rango 16 durante 2 épocas con tasa de aprendizaje 1e-4 sobre 404 ejemplos procedentes del dataset `cortex_sft_v3.jsonl` (repositorio Johnny5b/cortex-sft-300), completando 52 pasos y alcanzando una pérdida final de 1.589. Posteriormente se fusionó el adaptador (Johnny5b/MiMo-9B-CORTEX-LoRA-v1) y se convirtió a GGUF. No se documenta uso de RLHF ni DPO, ni el volumen total de tokens de la destilación original del modelo base. La innovación declarada no es arquitectónica sino de comportamiento: el protocolo CORTEX impone cabeceras de traza con formato exacto `[TRACE: §R:… | §T:… | §S:REPAIR]`, un ciclo AWAKE→REPAIR→REST y una regla de rechazo (fail-closed) cuando no existe mapeo para una petición.

## Capacidades

- Generacion de texto conversacional en formato instruccional (tag `conversational`).
- Ejecucion del protocolo CORTEX: aplicacion de parches, ciclo AWAKE→REPAIR→REST y emision de cabeceras de traza con formato verificado.
- Emision de trazas estructuradas exactas: el test de cabecera de traza obtiene resultado "exacto" en la bateria del autor.
- Comportamiento fail-closed: ante una peticion no mapeada (§QUANTUM:ENTANGLE en la regla 1) declina invocarla y presenta una propuesta en lugar de alucinar una respuesta.
- Ejecucion de tareas de reparacion verificables: la prueba de reparacion pasa con el parche propio del modelo y pytest 3/3, sin recurso a fallback AST.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere integracion con APIs estilo OpenAI.
- Inferencia sin dependencias: funciona unicamente con llama.cpp o llama-cpp-python.
- No se documenta soporte de tool calling generico, function calling, vision, audio ni modo de razonamiento explicito ("thinking mode").

## Casos de uso

- Automatizacion de reparaciones de codigo con trazabilidad: el modelo esta entrenado para aplicar un parche y emitir una cabecera de traza verificable, lo que permite auditar que decision tomo y en que fase (AWAKE, REPAIR, REST) se encontraba.
- Pipelines de CI con verificacion posterior: al pasar pytest 3/3 tras el parche, puede insertarse como paso de auto-reparacion entre la deteccion de fallo y la reejecucion de la suite, siempre que la tarea caiga dentro del conjunto de reglas mapeadas.
- Sistemas que requieren abstenerse ante incertidumbre: en entornos donde una accion incorrecta es costosa, su politica fail-closed (declinar y proponer en lugar de ejecutar) es preferible a un modelo generalista que improvisa.
- Orquestacion agente con trazas obligatorias: util cuando un agente superior necesita leer el estado de un subagente a partir de una cabecera estructurada en lugar de texto libre.
- Despliegue en hardware modesto o sin GPU: con ~9,1 GB de RAM residente y dependencia exclusiva de llama.cpp, puede ejecutarse en CPU en portatiles o servidores sin acelerador, a 11,23 tok/s de generacion.
- Prototipado e investigacion de protocolos de control: sirve como banco de pruebas para estudiar como se comporta un modelo destilado de 9B tras un ajuste de 404 ejemplos y 52 pasos, incluidos sus modos de fallo.
- Inferencia en entornos air-gapped o con restricciones de dependencias: al no requerir la libreria `transformers` ni frameworks adicionales, simplifica el empaquetado y la superficie de ataque.
- Evaluacion comparativa de cuantizaciones: el fichero Q4_K_M con sha256 publicado permite reproducir exactamente las condiciones de la bateria de pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos son la bateria propia del autor, ejecutada con un arnes identico en CPU (cpu-xl) sobre llama.cpp b11191:

| Prueba | Resultado |
|---|---|
| Ensayo de reparacion (AWAKE→REPAIR→REST) | PASS — parche aplicado, sin fallback AST, pytest 3/3 |
| Cabecera de traza | Exacta: `[TRACE: §R:… | §T:… | §S:REPAIR]` |
| Regla 1 (§QUANTUM:ENTANGLE sin mapear) | Fail-closed — declina invocar, presenta propuesta, sin alucinacion |
| Velocidad de generacion (tg64) | 11,23 tok/s |
| Velocidad de prompt (pp29) | 35,00 tok/s |
| RAM residente (sonda / bench) | ~9,1 GB |
| Tiempo de pared de la generacion de prueba | 40,4 s |

Estos valores son relativos a una misma maquina y no son extrapolables a hardware distinto, tal y como advierte el propio autor.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa 5,63 GB; con overhead de contexto y buffers de llama.cpp, cabe holgadamente en GPUs de 8 GB y con margen en 12 GB. La cifra de RAM residente publicada (~9,1 GB) corresponde a ejecucion en CPU, no a VRAM.
- GPU recomendadas: no hay lista oficial en la informacion disponible. Por tamano de pesos, cualquier GPU con 8 GB o mas de VRAM es suficiente para Q4_K_M; para lotes grandes o contexto extenso conviene 12-16 GB.
- Cabe en GPU de consumo: si. Ejemplos coherentes con el tamano del fichero: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 / 4070 Ti, RTX 4080, RTX 4090. En GPUs de 8 GB (RTX 3060 Ti, RTX 4060) entraria con contexto reducido.
- Opciones de despliegue: llama.cpp, llama-cpp-python y, por compatibilidad de formato, herramientas basadas en llama.cpp como Ollama o LM Studio. El soporte de este GGUF en vLLM o TGI no esta documentado y no puede darse por supuesto.
- Latencia y throughput: en la configuracion medida (CPU cpu-xl) 11,23 tok/s de generacion y 35,00 tok/s de procesamiento de prompt. En GPU el rendimiento seria sustancialmente mayor, pero no hay cifras publicadas.
- Almacenamiento: el repositorio ocupa 5,6 GB; basta con ~6 GB libres para el fichero unico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-9B-CORTEX-GGUF (este) | 8,95 B | no disponible | Solo bateria CORTEX propia | MIT | GGUF Q4_K_M unicamente |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (base) | ~9 B (no confirmado en la informacion disponible) | no disponible | no disponible | MIT | Pesos originales en safetensors (no confirmado) |
| Johnny5b/MiMo-9B-CORTEX-LoRA-v1 (adaptador) | Adaptador LoRA sobre el mismo base | no disponible | no disponible | no disponible | Adaptador LoRA |

No se dispone de datos de benchmarks ni de contexto para establecer una comparacion cuantitativa con alternativas de la misma categoria (por ejemplo, otros modelos densos de ~9B de la familia Qwen). Cualquier comparacion de rendimiento seria especulativa.

## Limitaciones y advertencias

- Ajuste muy ligero: 404 ejemplos y 52 pasos de entrenamiento. La especializacion en el protocolo CORTEX es estrecha y no implica mejora en capacidades generales; es probable que degrade el rendimiento fuera de ese protocolo respecto al modelo base.
- Repositorio sin traccion: cero descargas y cero "likes" en el momento de la consulta. No hay validacion independiente de los resultados publicados.
- Riesgo de alucinacion: aunque el autor documenta un comportamiento fail-closed en la regla 1, eso no garantiza abstenerse correctamente ante cualquier entrada no mapeada fuera de los casos de prueba.
- Incumplimiento literal documentado: la sonda de la regla 1 emite una traza valida y un rechazo, pero no el marcador literal `UNMAPPED`. El comportamiento es fail-closed de forma funcional, no textual.
- Idiomas soportados: no disponibles. No hay confirmacion de cobertura multilingue; el contenido de entrenamiento (404 ejemplos de tipo CORTEX) sugiere un sesgo fuerte hacia instrucciones tecnicas concretas.
- Longitud de contexto: no disponible. No debe asumirse la ventana del modelo base sin verificar la configuracion del GGUF.
- Un unico tipo de cuantizacion (Q4_K_M): no hay versiones Q8_0, Q5_K_M, F16 ni otras, lo que limita el ajuste fino de la relacion calidad/tamano.
- Ausencia de benchmarks estandar: no hay MMLU, HumanEval, GSM8K ni evaluaciones de seguridad. Inadecuado para decisiones de produccion basadas en rendimiento medido.
- Datos de rendimiento no extrapolables: las cifras de tok/s y RAM proceden de una unica maquina CPU y son relativas.
- Caveat de conversion: se elimino el modulo MTP declarado en la configuracion base; el modelo no dispone de decodificacion especulativa multi-token.
- Metadatos incompletos: la ficha de HuggingFace no declara pipeline, idiomas ni licencia de terceros mas alla de MIT; conviene verificar la licencia del modelo base antes de uso comercial.
- Fecha de creacion inusual (2026-09-25) y descargas nulas: procede tratar el artefacto con cautela y verificar su procedencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Johnny5b/MiMo-9B-CORTEX-GGUF
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Adaptador LoRA: https://huggingface.co/Johnny5b/MiMo-9B-CORTEX-LoRA-v1
- Dataset de ajuste (cortex_sft_v3.jsonl): https://huggingface.co/datasets/Johnny5b/cortex-sft-300
- Repositorio de herramientas y token_map.json: https://huggingface.co/datasets/Johnny5b/cortex-knowledge-vault
