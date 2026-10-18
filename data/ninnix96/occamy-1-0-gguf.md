# Ninnix96/occamy-1.0-gguf

## Resumen

Occamy 1.0 GGUF es una cuantización de un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado originalmente por Accio-Lab (referenciado también como occamy-ai) y empaquetado en formato GGUF por el usuario Ninnix96. El modelo base cuenta con 34.660.610.688 parámetros totales (unos 34,7 mil millones) y una arquitectura que llama.cpp identifica como `qwen35moe`. Esta ficha describe concretamente el artefacto cuantizado publicado, no el modelo original en precisión completa.

La particularidad de esta publicación es la aplicación de la llamada "receta antirez": una estrategia de cuantización agresiva y selectiva en la que los expertos enrutados (`ffn_gate_exps`, `ffn_up_exps`, `ffn_down_exps`) se comprimen hasta IQ2_XXS y Q2_K, mientras que la atención, los expertos compartidos, la cabeza de salida y las embeddings se mantienen en Q8_0 o F16. El resultado es un único archivo de 12.052.349.184 bytes (unos 11,4 GB) con 2,78 bits por peso, frente a los 66,1 GiB del BF16 de origen.

Su relevancia práctica es que permite ejecutar un modelo de ~35 B parámetros totales en hardware de consumo con 12-16 GB de VRAM o en sistemas de memoria unificada, a costa de una pérdida de calidad medible. La model card reporta una divergencia KL media de 0,146 frente a una referencia Q8_0 con el mismo tokenizador, lo que sitúa el artefacto en terreno de "usable para pruebas y desarrollo local", no de sustitución directa del modelo en BF16 para producción sensible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) tipo transformer; `qwen35moe` segun llama.cpp |
| Parametros totales | 34.660.610.688 (~34,7 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la validacion se ejecuto con ctx 15.360) |
| Tipos de cuantizacion | GGUF Q2-IQ2_XXS-Q2_K, 2,78 BPW; expertos enrutados en IQ2_XXS (gate/up) y Q2_K (down); atencion, shared experts y `output.weight` en Q8_0; `token_embd` en F16; router, normas, sinks y biases en BF16/F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo unico, 12.052.349.184 bytes) |
| Modelo base | occamy-ai/occamy-1.0 (metadatos HF: Accio-Lab/occamy-1.0) |
| Fuente BF16 de partida | bartowski/occamy-ai_occamy-1.0-GGUF |
| Matriz de calibracion | mradermacher/occamy-1.0-i1-GGUF (imatrix) |
| Tokenizador | `tokenizer.ggml.pre = qwen2` forzado en el momento de cuantizar |
| Herramienta | llama.cpp @ `f3363593f` + Vulkan (fork `linuxid10t/llama.cpp@feature/g9v3-support` para G9v3) |
| Plantilla de chat | plantilla propia embebida en el GGUF |
| SHA-256 | `923faddcac1f0d4268509f073a2ce0e01919b9183299ede48abc99c647167752` |

## Arquitectura y entrenamiento

El modelo base es una mezcla de expertos con enrutado por token: cada bloque contiene expertos enrutados (`ffn_gate_exps`, `ffn_up_exps`, `ffn_down_exps`) mas expertos compartidos (`ffn_gate_shexp`, `ffn_up_shexp`, `ffn_down_shexp`), y un router (`ffn_gate_inp`) que decide la asignacion. La nomenclatura `qwen35moe` que reporta llama.cpp sugiere una topologia derivada de la familia Qwen, aunque no se dispone de la ficha tecnica del modelo original en la informacion proporcionada, por lo que el numero de expertos, el numero de expertos activos por token y la dimension oculta no estan disponibles.

Sobre el entrenamiento no hay datos en la informacion disponible: no se indica el volumen de tokens, la composicion del corpus ni si hubo fases de RLHF, DPO o ajuste por preferencias. Lo que si esta documentado es el proceso de cuantizacion, que constituye la innovacion tecnica de este artefacto: tipo base Q8_0 con anulaciones selectivas por tensor (`--tensor-type`), 16 hilos, calibracion con imatrix y auditoria posterior con `gguf-dump` para verificar que los expertos enrutados quedan efectivamente en IQ2_XXS/Q2_K y que el resto de la proteccion sigue intacta. Se documento tambien un fallo del tokenizador heredado del BF16 de bartowski (`tokenizer.ggml.pre = qwen35`, incorrecto segun la documentacion del modelo original), corregido a `qwen2` mediante `--override-kv` durante la cuantizacion en lugar de una copia posterior.

## Capacidades

- Generacion de texto conversacional: el GGUF incluye la plantilla de chat del modelo y se ha validado con `llama-cli` y `--chat-template-file`.
- Codigo: la evaluacion de humo de 12 casos incluye "casos grandes de codigo" y el autor reporta que el modelo supera ambos.
- Razonamiento de varios pasos: los casos de prueba son problemas duros con temperatura 0, lo que ejercita cadenas de razonamiento.
- Capacidad multilingue: no disponible (no se documentan idiomas).
- Tool calling / function calling: no disponible; no se menciona soporte explicito en la informacion proporcionada.
- Modo thinking o vision/audio: no disponible.
- Despliegue local en CPU/GPU hibrida: soporta offload parcial de expertos a CPU (`--n-cpu-moe`), lo que permite ejecutarlo en equipos con poca VRAM.

## Casos de uso

- Pruebas de integracion de llama.cpp en local: sirve para validar pipelines de inferencia (carga, plantilla de chat, muestreo) con un modelo de ~35 B en una maquina de 16 GB de VRAM, sin necesidad de GPUs de datacenter.
- Desarrollo de agentes con presupuesto de memoria ajustado: el reparto de expertos entre GPU y CPU permite mantener sesiones multi-turno en equipos de gama alta de consumo, adecuado para prototipar orquestaciones de agentes antes de pasar a una version de mayor precision.
- Generacion de codigo en local para tareas de refactorizacion y explicacion: el modelo resuelve los casos de codigo de la bateria de validacion, por lo que es util como asistente offline en entornos con requisitos de privacidad donde no se quiere enviar codigo a una API.
- Evaluacion comparativa de recetas de cuantizacion: el artefacto esta documentado con KL divergence, RMS de delta-p y acuerdo top-1 frente a una referencia Q8_0, lo que lo convierte en un caso de estudio util para investigar el impacto de cuantizar expertos a 2 bits.
- Laboratorio de investigacion sobre MoE en hardware de consumo: permite estudiar el comportamiento de un MoE de ~35 B con enrutado escaso sin acceso a clústeres, midiendo throughput y calidad en funcion del offload.
- Experimentos de ajuste de tokenizador y plantillas: al estar documentada la correccion `qwen35` -> `qwen2`, sirve como referencia para depurar problemas de pre-tokenizador en GGUF derivados de conversiones de terceros.
- Despliegue en placas o mini-PC con memoria unificada (AMD Vulkan/UMA): el autor reporta ~27 t/s de generacion en ese escenario, suficiente para asistentes interactivos de un solo usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Lo que si se publica es una validacion propia del artefacto cuantizado:

| Metrica | Valor | Condiciones |
|---|---|---|
| Evaluacion de humo (12 casos duros) | 7/12 PASS | temp 0, ctx 15.360, plantilla embebida, `--n-cpu-moe 16` |
| Casos fallidos | 2826, 10360, 10567, 9487, 1716 | mismos ajustes |
| Casos de codigo grandes | superados ambos | mismos ajustes |
| Tokens de salida en los 7 resueltos | 56.142 (8.020 tok/caso resuelto) | tokenizador propio |
| Throughput de generacion | ~27 t/s | AMD Vulkan/UMA |
| Divergencia KL vs Q8_0 misma tokenizacion | 0,150 / 0,141 por chunk (media 0,146) | ds4 short prompts, ctx 60, 2 chunks, CPU |
| RMS de delta-p | 10-12 % | idem |
| Acuerdo top-1 con mismo tokenizador | 96,6 % / 91,4 % | idem |

Estos datos miden fidelidad respecto a una referencia cuantizada, no capacidad absoluta del modelo; no son comparables con puntuaciones de benchmarks publicos de terceros.

## Requisitos de hardware

- VRAM estimada: ~11,4 GB solo para los pesos; con cache KV para contexto largo hay que sumar varios GB, de modo que un presupuesto comodo es 16 GB.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RX 7800 XT 16 GB) y con holgura en 24 GB (RTX 3090, RTX 4090). En 12 GB (RTX 3060 12 GB, RTX 4070) requiere offload de expertos a CPU.
- Configuracion reportada por el autor: `--n-cpu-moe 16` sobre un sistema AMD con Vulkan y memoria unificada, alcanzando ~27 t/s.
- Despliegue: llama.cpp es la via documentada. Para arquitecturas G9v3 se requiere el fork `linuxid10t/llama.cpp@feature/g9v3-support` hasta que se integre en upstream; el resto puede funcionar con llama.cpp en el commit `f3363593f` o posterior compatible con `qwen35moe`.
- Otras opciones (Ollama, vLLM, TGI): no verificadas en la informacion disponible. vLLM y TGI no consumen GGUF de forma nativa sin pasos adicionales; Ollama depende de que su version de llama.cpp soporte la arquitectura.
- Latencia y throughput: ~27 t/s de generacion en el escenario Vulkan/UMA indicado; no se publican cifras para GPU dedicada.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos alternativos en la informacion proporcionada. La comparacion posible es interna, entre el artefacto cuantizado y su referencia en mayor precision:

| Artefacto | Parametros | Tamano | Bits por peso | Uso de memoria | Fidelidad |
|---|---|---|---|---|---|
| occamy-1.0-Q2-IQ2_XXS-Q2_K.gguf (esta ficha) | ~34,7 B | 11,4 GB | 2,78 BPW | 12-16 GB VRAM con offload | KL 0,146 vs Q8_0; top-1 91-97 % |
| Referencia BF16 de partida (bartowski) | ~34,7 B | 66,1 GiB | 16 BPW | 70+ GB | referencia |
| Referencia Q8_0 del autor | ~34,7 B | no disponible | ~8,5 BPW | 35+ GB | referencia de la comparacion KL |

Comparativa con modelos de la misma categoria (mismo tamano o misma tarea): no disponible.

## Limitaciones y advertencias

- Cuantizacion muy agresiva: los expertos enrutados estan a 2 bits (IQ2_XXS y Q2_K) y la divergencia KL media de 0,146 frente a Q8_0 es alta para estandares de cuantizacion; se espera degradacion en tareas de razonamiento y matematicas, coherente con los 5 fallos de la bateria de humo.
- Tasa de exito limitada en la propia validacion: 7/12 en casos duros con temperatura 0. No es un modelo para tareas de alta fiabilidad sin verificacion posterior.
- Riesgo de alucinacion: no se documentan evaluaciones de factualidad; en un modelo cuantizado a 2 bits el riesgo es al menos el del modelo base, no cuantificado en la informacion disponible.
- Idiomas: no se especifica que idiomas soporta; no se debe asumir un buen rendimiento en castellano sin probarlo.
- Contexto: no se publica la longitud de contexto nativa del modelo; la validacion uso 15.360 tokens, lo que no implica que sea su limite.
- Dependencia de un fork de llama.cpp para arquitecturas G9v3: riesgo de mantenimiento y de que el binario upstream no cargue el modelo hasta que se integre el soporte.
- Tokenizador corregido manualmente: si se generan GGUF propios a partir del BF16 de bartowski sin aplicar `--override-kv tokenizer.ggml.pre=str:qwen2`, los resultados diferiran de los reportados.
- Licencia Apache 2.0 en el artefacto GGUF: permite uso comercial, pero conviene verificar que la licencia del modelo base (Accio-Lab/occamy-ai occamy-1.0) sea compatible, ya que la model card del cuantizado no reproduce los terminos del original.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia (2026-10-18). No hay validacion independiente por terceros.

## Enlaces

- HuggingFace del GGUF: https://huggingface.co/Ninnix96/occamy-1.0-gguf
- Modelo base: https://huggingface.co/Accio-Lab/occamy-1.0
- Modelo base (referencia alternativa): https://huggingface.co/occamy-ai/occamy-1.0
- Imatrix utilizada: https://huggingface.co/mradermacher/occamy-1.0-i1-GGUF
- Fuente BF16 de partida: https://huggingface.co/bartowski/occamy-ai_occamy-1.0-GGUF
- Receta antirez de referencia: https://huggingface.co/antirez/deepseek-v4-gguf
- Fork de llama.cpp con soporte G9v3: https://github.com/linuxid10t/llama.cpp/tree/feature/g9v3-support
- Paper, blog o demo oficial: no disponible
