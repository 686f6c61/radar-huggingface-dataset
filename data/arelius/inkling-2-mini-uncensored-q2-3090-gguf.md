# arelius/Inkling-2-Mini-Uncensored-Q2-3090-GGUF

## Resumen

Inkling-2-Mini-Uncensored-Q2-3090-GGUF es una cuantización GGUF de 2 bits orientada a velocidad del modelo Inkling 2 Mini de Thinking Machines Lab, en su variante "uncensored" producida por AtomicChat. El autor de esta ficha, arelius, no modifica el comportamiento del modelo: se limita a requantizar el checkpoint de AtomicChat con una receta por tensor que mantiene los expertos enrutados en 2 bits y el resto de componentes en precisiones superiores. El objetivo declarado es ejecutar un modelo MoE de 26.070.385.152 parámetros en una única RTX 3090 a unos 200 tokens por segundo en decodificación.

La relevancia práctica está en el binomio tamaño-velocidad: el archivo ocupa 9,25 GiB y cabe holgadamente en los 24 GB de una RTX 3090, con un rendimiento medido de 207,9 tok/s en contexto vacío y 193,2 tok/s a 1K de contexto usando el fork de llama.cpp del autor. Es, por tanto, una opción para despliegue local de agentes conversacionales y de código en hardware consumer de gama alta, no en centros de datos.

La edición "uncensored" proviene de AtomicChat y consiste en un LoRA de rango 1 aplicado sobre los 49 puntos que escriben en el flujo residual (salida de atención y expertos enrutados de las 24 capas, más el embedding de tokens), eliminando en cada capa su dirección de rechazo. El modelo sigue peticiones que el original declina, lo que traslada al usuario toda la responsabilidad de uso. La licencia es Apache-2.0, igual que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos); soporte de bucle por capas segun el fork de llama.cpp |
| Parametros totales | 26.070.385.152 |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens en la configuracion de ejemplo (`-c 65536`) |
| Tipos de cuantizacion | Q2_K, Q2_0 calibrado, IQ4_NL, Q8_0, F32 (mezcla por tensor) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`Inkling-2-Mini-Uncensored-Q2K-Q2_0.gguf`, 9,25 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de 26.070 millones de parámetros totales, distribuido en 24 capas según la descripción de la edición de AtomicChat. La receta de cuantización de arelius aplica Q2_K a las proyecciones `ffn_gate_up_exps` de los expertos enrutados de las capas 0 a 19, Q2_0 calibrado a `ffn_down_exps` de esas mismas capas, IQ4_NL a los expertos de las capas 20 a 23, a las proyecciones de atención y a la cabeza de salida, Q8_0 a los embeddings de tokens y F32 a normas, router, controladores de bucle y sesgos. Los 704 tipos de tensor coinciden con la build regular del autor.

Un detalle importante es que la fuente es el checkpoint `Inkling-2-Mini-Uncensored-AD-Q4_K.gguf` de AtomicChat, ya cuantizado a 4 bits, por lo que este archivo ha pasado por dos rondas de cuantización. La build regular del mismo autor se cuantizó directamente desde Q8_0, lo que explica que esta variante tenga una perplejidad ligeramente peor. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original. La edición uncensored es un LoRA de rango 1 sobre los 49 puntos de escritura en el flujo residual, documentado en la model card de AtomicChat.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado `text-generation`.
- Razonamiento de varios pasos y agentes: la model card menciona contextos de 16K a 48K habituales en agentes de código.
- Generación de código, con integración documentada en OpenCode mediante `--opencode`.
- Servicio compatible con la API de OpenAI en `127.0.0.1:8031/v1` con id de modelo `inkling-mini`.
- Modo "uncensored": responde a peticiones que el modelo original rechaza.
- Solo texto: no incluye proyector de visión.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Agentes de código en local: con 65.536 tokens de contexto y 120-140 tok/s en ventanas de 16K-48K, el modelo puede sostener sesiones de edición de código con historial largo en una sola RTX 3090, integrándose en OpenCode mediante la configuración que imprime `--opencode`.
- Asistente conversacional autoalojado: el servidor compatible con OpenAI permite sustituir un endpoint remoto por uno local en `127.0.0.1:8031/v1`, sin coste por token y sin enviar datos a terceros.
- Procesamiento por lotes de texto a alta velocidad: a 207,9 tok/s en contexto vacío, es adecuado para tareas de resumen, extracción o reescritura sobre grandes volúmenes de documentos en hardware de un solo usuario.
- Investigación sobre alineación y rechazo: la edición de AtomicChat elimina la dirección de rechazo por capa, lo que permite estudiar cómo cambia el comportamiento del modelo frente al original en el mismo hardware y con la misma cuantización.
- Entornos con requisitos de privacidad: al ejecutarse íntegramente en local con pesos Apache-2.0, encaja en flujos donde el texto no puede salir de la máquina.
- Prototipado de pipelines de agentes multi-paso: la ventana de 64K y la velocidad sostenida permiten iterar sobre bucles de razonamiento y llamadas a herramientas sin esperas largas.
- Despliegue en estaciones de trabajo con una sola GPU: 9,25 GiB de pesos dejan margen en 24 GB para caché KV en q8_0 y contexto extendido.

## Benchmarks y rendimiento

Datos medidos por el autor en una RTX 3090 con el fork `inkling-3090`. La perplejidad usa el texto fijo `perf/ppl.txt` del fork y mide calidad de modelado de lenguaje, no comportamiento de rechazo.

| Modelo | Decode tok/s, contexto vacio | a 1K contexto | Prefill PPL (8x2048) | Decode PPL (2x1024, ubatch 1) |
|---|---:|---:|---:|---:|
| Inkling 2 Mini original, ggml-org IQ4_NL | no disponible | no disponible | 2,9401 | 4,0660 |
| Build regular de 2 bits de arelius | 208,7 | 193,2 | 3,0530 | 4,1945 |
| Este modelo | 207,9 | 193,2 | 3,0571 | 4,1918 |

A contextos de 16K-48K, el autor espera 120-140 tok/s. La perplejidad de este archivo está aproximadamente un 4 % por encima del original de 4 bits, según la propia model card. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada: 9,25 GiB de pesos más caché KV en q8_0 para contexto largo; cabe en 24 GB con margen amplio.
- GPU recomendada: RTX 3090 (sm_86), para la que están ajustados los kernels fusionados del fork; el autor compiló con `-DCMAKE_CUDA_ARCHITECTURES=86`.
- Cabe en GPU consumer: sí, en RTX 3090 de 24 GB; no se documenta compatibilidad con GPUs de menos VRAM.
- Despliegue: fork `csaben/llama.cpp`, rama `inkling-3090`, con `llama-server`; existe un comando de una línea con `uvx` que descarga un servidor precompilado y sirve una API compatible con OpenAI. llama.cpp estándar con soporte de Inkling 2 Mini (PR #32694) carga el archivo, pero mucho más lento.
- Requisitos del entorno: Linux, glibc ≥ 2.38, driver NVIDIA ≥ 570; no requiere toolkit CUDA si se usa el binario precompilado.
- Variables de entorno del fork: `LLAMA_INKLING_CTRL_F16=1`, `IK_BATCH_MESSAGES=1`, `IK_SEGMENTED_IQ4=1`, `IK_SEGMENTED_Q6=1`, `IK_MIX_SPECIALIZE=1`, `IK_CTRL_APPLY8=1`.
- Throughput: 207,9 tok/s en decodificación con contexto vacío, 193,2 tok/s a 1K y 120-140 tok/s en 16K-48K.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decode tok/s (RTX 3090) | PPL prefill | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (Q2, 2 bits) | 26,07 B | 65.536 | 207,9 (vacío) / 193,2 (1K) | 3,0571 | Apache-2.0 | GGUF, 9,25 GiB |
| Build regular de 2 bits de arelius | 26,07 B | no disponible | 208,7 (vacío) / 193,2 (1K) | 3,0530 | Apache-2.0 | GGUF |
| Inkling 2 Mini original IQ4_NL (ggml-org) | 26,07 B | no disponible | no disponible | 2,9401 | Apache-2.0 | GGUF IQ4_NL |
| AtomicChat Inkling-2-Mini-Uncensored AD-Q4_K | 26,07 B | no disponible | no disponible | no disponible | Apache-2.0 | GGUF 4 bits |

## Limitaciones y advertencias

- Doble cuantización: la fuente ya era un checkpoint de 4 bits, por lo que la perplejidad queda un 4 % por encima del original; conviene validar en las tareas propias antes de producción.
- El comportamiento de rechazo procede de la edición de AtomicChat y el autor de esta cuantización no lo ha evaluado.
- Riesgo de alucinación: no cuantificado en la información disponible; la degradación por cuantización de 2 bits puede agravarlo en tareas de razonamiento largo.
- Solo texto: no hay proyector de visión.
- Idiomas soportados: no documentados.
- La velocidad depende de kernels fusionados ajustados a Ampere (sm_86); en otras arquitecturas el rendimiento puede diferir.
- La decodificación se degrada al llenar el contexto porque cada una de las 48 pasadas de capa relee la caché de atención.
- Licencia Apache-2.0 permite uso comercial, pero la ausencia de filtros de rechazo traslada al operador la responsabilidad legal y ética del contenido generado.
- Requiere un fork específico de llama.cpp para alcanzar las cifras publicadas; llama.cpp estándar funciona pero mucho más lento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arelius/Inkling-2-Mini-Uncensored-Q2-3090-GGUF
- Build regular de 2 bits del mismo autor: https://huggingface.co/arelius/Inkling-2-Mini-Q2-3090-GGUF
- Edición uncensored de AtomicChat: https://huggingface.co/AtomicChat/Inkling-2-Mini-Uncensored-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Anuncio del modelo base: https://thinkingmachines.ai/news/inkling-2-mini/
- Artículo técnico "Looping on a 3090": https://clark.saben.org/looping-on-a-3090
- Fork de llama.cpp: https://github.com/csaben/llama.cpp/tree/inkling-3090
- Commit del codificador Q2_0 calibrado: https://github.com/csaben/llama.cpp/commit/704a7da
- Release del servidor precompilado: https://github.com/csaben/llama.cpp/releases/tag/inkling-3090-v2
- Soporte de Inkling 2 Mini en llama.cpp estándar: https://github.com/ggml-org/llama.cpp/pull/32694
