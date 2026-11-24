# DreamEmulatorLSD/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v3-GGUF

## Resumen

LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v3-GGUF es una cuantización en formato GGUF del modelo base DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v3, publicada por el usuario DreamEmulatorLSD. El modelo subyacente es un transformer híbrido de tipo MoE (Mixture of Experts) con 8.467.856.832 parámetros totales, etiquetado como "A1B" (probablemente 1.000 millones de parámetros activos), construido sobre la arquitectura LFM2 de Liquid AI y afinado por DuoNeural Research Lab para tareas de agente y generación de código, con eliminación de alineación de seguridad ("abliteration").

El interés de esta ficha reside en dos frentes. Por un lado, la arquitectura LFM2 MoE, que combina convoluciones cortas con doble compuerta y enrutamiento disperso de expertos, lo que permite un coste de inferencia bajo en relación con el total de parámetros. Por otro, la técnica de cuantización propietaria G-TAP v3 (Generalized Thouless-Anderson-Palmer), que según el autor mitiga la degradación típica de las cuantizaciones sub-3 bits en modelos MoE mediante la sustracción de campos de cavidad de no equilibrio en el enrutamiento de expertos y en los buffers de convolución FIR.

La relevancia práctica es doble: el modelo cabe en GPUs de consumo (el autor reporta pruebas en una RTX 4080 Super con 32 GB de VRAM) y el repositorio GGUF ofrece cuatro niveles de cuantización desde ~2,06 bpw hasta ~4,50 bpw, lo que permite desplegarlo en entornos con recursos limitados. Ahora bien, conviene señalar que el modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, que la model card contiene afirmaciones técnicas no verificadas de forma independiente y que el nombre del autor y de la organización no coinciden con los del modelo base, lo que exige cautela antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con convoluciones cortas de doble compuerta (`Lfm2MoeForCausalLM`), 24 capas, dimensión oculta 2048, vocabulario 128.000 |
| Parametros totales | 8.467.856.832 (8,47 mil millones) |
| Parametros activos | ~1.000 millones (según la nomenclatura "A1B"; no confirmado de forma independiente) |
| Longitud de contexto | 131.000 tokens (según la referencia a "131k holdout perplexity" en la model card; no se especifica el máximo oficial) |
| Tipos de cuantizacion | GGUF: Q4_K_M (~4,50 bpw), IQ3_XXS (~3,06 bpw), IQ2_M (~2,70 bpw), IQ2_XXS (~2,06 bpw) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el modelo base se distribuye presumiblemente en safetensors, no confirmado |

## Arquitectura y entrenamiento

El modelo base emplea la topología LFM2 MoE de Liquid AI: 24 capas que alternan convoluciones cortas con doble compuerta (double-gated short convolutions) y enrutamiento disperso de expertos, con una dimensión oculta de 2048 y un vocabulario de 128.000 tokens. Esta combinación busca reducir el coste computacional frente a un transformer denso equivalente, manteniendo la capacidad de modelado de secuencias largas. El sufijo "A1B" sugiere alrededor de 1.000 millones de parámetros activos por token, aunque la model card no desglosa el número exacto de expertos ni la estrategia de enrutamiento.

Sobre el entrenamiento, la información disponible es escasa y proviene únicamente de la model card del autor de la cuantización. Se indica que el modelo base fue sometido a un proceso de "abliteration" direccional mediante proyección ortogonal para eliminar los límites de rechazo en los subespacios de seguridad, preservando sintaxis, lógica y adherencia a esquemas de herramientas. También se menciona la técnica G-TAP v3 (Generalized Thouless-Anderson-Palmer), descrita como un mecanismo de amortiguación de Onsager que resta campos de cavidad de no equilibrio del enrutamiento de expertos MoE y de los buffers de convolución FIR, con el objetivo de evitar la degradación típica de las cuantizaciones por debajo de 3 bits. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras fases de alineación posteriores.

## Capacidades

- Generación de texto conversacional y de código, con especial énfasis en tareas de agente ("agentic-coder").
- Soporte de tool calling estructurado en formato Hermes, con adherencia a esquemas JSON (el autor reporta 100 % de éxito en 15 escenarios de tool calling de Hermes).
- Razonamiento multi-paso en matemáticas (problemas de GSM8K) y generación de código Python evaluada mediante AST.
- Capacidad de orquestación de agentes y generación de arneses multi-agente (el ejemplo de la model card pide precisamente un script de orquestación multi-agente).
- Modo "uncensored": la abliteración elimina los rechazos de seguridad, lo que permite generar contenido que modelos alineados rechazarían.
- Capacidades multilingües: no disponible (no se especifican idiomas).
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito ("thinking mode").

## Casos de uso

- **Orquestación de agentes multi-paso:** el modelo está afinado para generar arneses de agentes y llamadas a herramientas encadenadas; su contexto de hasta 131.000 tokens permite mantener el estado de una sesión de agente larga sin truncar el historial de herramientas.
- **Generación de código en pipelines de CI/CD:** con soporte de tool calling estructurado y buena puntuación reportada en AST de Python, puede integrarse en flujos de generación de parches, tests o scripts de automatización, siempre con revisión humana.
- **Asistente de programación local en GPU de consumo:** las cuantizaciones IQ3_XXS e IQ2_M caben en GPUs con 8-12 GB de VRAM, lo que permite desplegar un asistente de código privado sin depender de la nube.
- **Automatización de tareas de refactorización y análisis estático:** el modelo puede generar transformaciones de código y explicar su resultado; la evaluación AST del autor sugiere cierta solidez sintáctica, aunque conviene validar con tests propios.
- **Generación de contenido sin restricciones de alineación:** para investigación sobre seguridad, red teaming o generación creativa que requiera evitar rechazos; debe usarse con salvaguardas externas y en entornos controlados.
- **Prototipado rápido con Ollama o llama.cpp:** la model card incluye un Modelfile de Ollama y un comando de llama.cpp, lo que facilita levantar un endpoint local en minutos para pruebas de concepto.
- **Investigación sobre cuantización extrema de MoE:** el repositorio permite comparar cuatro niveles de bpw sobre el mismo modelo, útil para estudiar la degradación de calidad en cuantizaciones sub-3 bits.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen de la model card del autor y fueron medidos en una NVIDIA GeForce RTX 4080 Super (32 GB de VRAM) sobre 25 problemas GSM8K, 15 problemas de código Python evaluados por AST y 15 escenarios de tool calling de Hermes. No hay resultados independientes.

| Checkpoint | bpw | Tamano | Perplejidad (131k) | GSM8K | Python AST | Hermes Tool AST | Velocidad |
|---|---|---|---|---|---|---|---|
| Q4_K_M | ~4,50 | 4916,7 MiB | Pendiente | 96,0 % | 90,0 % | 100,0 % | 330,7 t/s |
| IQ3_XXS | ~3,06 | 3180,4 MiB | Pendiente | 88,0 % | 80,0 % | 100,0 % | 382,0 t/s |
| IQ2_M | ~2,70 | 2711,6 MiB | Pendiente | 84,0 % | 90,0 % | 100,0 % | 361,3 t/s |
| IQ2_XXS | ~2,06 | 2214,8 MiB | Pendiente | 60,0 % | 50,0 % | 100,0 % | 402,0 t/s |

Advertencia: la perplejidad figura como "Pending" en todos los casos, las muestras son muy pequeñas (15-25 problemas) y no se aportan intervalos de confianza ni comparación con el modelo base sin cuantizar. Los resultados deben tomarse como indicativos, no como evidencia robusta.

## Requisitos de hardware

- **VRAM estimada para inferencia:** entre ~2,2 GB (IQ2_XXS) y ~4,9 GB (Q4_K_M) solo para los pesos; hay que sumar la caché KV, que con contexto de 131.000 tokens puede ser considerable y depende de la configuración de llama.cpp.
- **GPU recomendadas:** el autor reporta pruebas en RTX 4080 Super (32 GB). Por tamaño de pesos, el modelo cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; en A100 y H100 sobra capacidad y se puede usar contexto largo.
- **Cabe en GPU de consumo:** sí, todas las cuantizaciones caben en GPUs de 8 GB o más, salvo que se use contexto muy largo con caché KV grande.
- **Opciones de despliegue:** llama.cpp (comando incluido en la model card), Ollama (Modelfile incluido), y presumiblemente cualquier runtime compatible con GGUF (koboldcpp, LM Studio). No se documenta soporte de vLLM ni TGI para este formato.
- **Latencia y throughput:** el autor reporta entre 330 y 402 tokens/s de decodificación en una RTX 4080 Super, con las cuantizaciones más bajas ligeramente más rápidas. No hay datos de latencia de prefill ni de throughput con lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Este modelo (LFM2.5-8B-A1B Hermes Agentic Coder Abliterated v3 GGUF) | 8,47 B | ~1 B | 131k (según model card) | Apache 2.0 | GGUF | Cuantización comunitaria; 0 descargas; benchmarks solo del autor |
| Modelo base DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v3 | 8,47 B | ~1 B | no disponible | Apache 2.0 (presumible) | safetensors (presumible) | Referencia sin cuantizar; sin benchmarks independientes disponibles |
| LFM2 de Liquid AI (familia) | variable | variable | variable | no disponible | no disponible | Arquitectura original; el modelo base es un afinado de terceros sobre ella |
| Alternativas MoE de ~8B con ~1B activos | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de modelos comparables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría. Cualquier comparación con modelos como Qwen, Mixtral o similares requeriría benchmarks independientes que no están disponibles en esta ficha.

## Limitaciones y advertencias

- **Modelo no verificado:** 0 descargas y 0 likes en el momento de la ficha; la model card contiene afirmaciones técnicas (G-TAP v3, abliteración direccional, 100 % en tool calling) que no han sido replicadas de forma independiente.
- **Discrepancia de autoría:** el repositorio lo publica DreamEmulatorLSD, pero la model card atribuye el trabajo a DuoNeural Research Lab (Jesse Caldwell, Archon, Aura). Conviene verificar la cadena de custodia antes de confiar en el modelo.
- **Abliteración y seguridad:** el modelo ha sido deliberadamente "desbloqueado" para eliminar rechazos. Esto implica riesgo de generar contenido dañino, ilegal o sesgado; no es adecuado para aplicaciones de cara al público sin filtros externos.
- **Sesgos:** no documentados, pero al derivar de un modelo entrenado con datos web y sin alineación posterior, es probable que herede sesgos de género, raza, idioma y cultura.
- **Alucinación:** no hay evaluación de factualidad; como todo modelo generativo, puede inventar APIs, funciones o hechos, especialmente en código.
- **Contexto:** los 131.000 tokens se mencionan en el contexto de la evaluación de perplejidad, no como límite oficial; el rendimiento real con contextos muy largos no está verificado.
- **Idiomas:** no se especifican; el nombre y los ejemplos están en inglés, por lo que el soporte de castellano es incierto.
- **Licencia:** Apache 2.0 permite uso comercial, pero el modelo base podría tener condiciones adicionales no reflejadas; verificar la licencia del modelo base antes de producción.
- **Cuantización extrema:** IQ2_XXS muestra una caída drástica en GSM8K (60 %) y Python AST (50 %); no usar cuantizaciones por debajo de ~3 bpw para tareas de razonamiento o código.
- **Formato:** solo GGUF; no hay soporte documentado para vLLM, TGI ni despliegue con tensor parallelism.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/DreamEmulatorLSD/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v3-GGUF
- Modelo base: https://huggingface.co/DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v3
- Repositorio GGUF del autor del modelo base (citado en la model card): https://huggingface.co/DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v3-GGUF
- Liquid AI (arquitectura LFM2): no disponible en la información proporcionada
- llama.cpp: no disponible en la información proporcionada
- Ollama: no disponible en la información proporcionada
