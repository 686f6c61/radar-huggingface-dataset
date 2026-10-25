# CastIronMind/LissaNano-Instruct-GGUF

## Resumen

LissaNano-Instruct-GGUF es la distribución en formato GGUF de LissaNano-Instruct, un modelo de lenguaje de 32 millones de parámetros (31.990.272 exactos) desarrollado por CastIronMind y entrenado desde cero sobre prosa del fandom de My Little Pony, con un posterior ajuste supervisado sobre diálogo de rol. Se presenta explícitamente como el modelo de lenguaje "más pequeño" dedicado a esta temática: arquitectura tipo Llama, contexto de 1024 tokens y un vocabulario de 16.384 entradas. El repositorio recoge 15 cuantizaciones generadas con llama.cpp, desde Q8_0 (33 MB) hasta IQ2_XS (12,7 MB), con la perplejidad medida para cada una frente al original en bf16.

Su relevancia no está en el rendimiento bruto, sino en el nicho: despliegue en teléfonos, placas SBC, sistemas embebidos y entornos totalmente offline, además de servir como banco de pruebas para estudiar la degradación por cuantización en modelosextremadamente pequeños. El autor publica la perplejidad de cada fichero sobre el mismo texto de validación de 300 tokens en inglés, lo que convierte al repositorio en un caso de estudio reproducible de cuantización con importancia matrix (imatrix).

La licencia es Apache 2.0, igual que el modelo base, y el único idioma declarado es el inglés. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama |
| Parámetros totales | 31.990.272 (~32 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantización | Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, IQ4_XS, IQ3_M, IQ3_XS, Q2_K, IQ2_M, IQ2_XS (los tipos Q2_0, TQ2_0 y Q1_0 se descartaron por resultados inválidos) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF para llama.cpp; pesos base en bf16 |
| Vocabulario | 16.384 tokens |
| Tokens especiales | 0 `<pad>`, 1 `<eos>`, 2 `<system>`, 3 `<user>`, 4 `<assistant>` |
| Formato de prompt | `<system>{persona}<user>{mensaje}<assistant>{respuesta}` (etiquetas concatenadas sin espacios, system no vacío) |
| BOS | Entrenado sin BOS; `bos_token` es `<eos>` y `tokenizer.ggml.add_bos_token = false` |
| Temperatura recomendada | 0.8, top_p 0.9, repetition_penalty 1.1 |

## Arquitectura y entrenamiento

Modelo transformer decoder-only con arquitectura Llama, 32 M de parámetros y vocabulario de 16.384 tokens, entrenado desde cero (no es un fine-tuning de un modelo mayor) sobre prosa del fandom de My Little Pony y después sometido a un ajuste supervisado sobre diálogo de rol. El autor describe el proceso como "trained from scratch on MLP fandom prose and then supervised on roleplay dialogue", sin mencionar RLHF ni DPO en la información disponible. La longitud de contexto con la que se entrenó y opera es de 1024 tokens.

La innovación técnica del repositorio no está en el modelo sino en el proceso de cuantización: las variantes IQ se generaron con una importance matrix recogida sobre el corpus de ajuste supervisado (400 muestras, 100 chunks, `llama-imatrix`) y cada fichero se evaluó con `llama-perplexity` sobre el mismo texto de validación en inglés de 300 tokens, incluyendo el original en bf16 como referencia (PPL 2,945). El autor documenta también un detalle crítico de ingeniería: el modelo fue entrenado sin token BOS, y alimentar uno degrada la salida hasta producir tablas de marcado en lugar de diálogo; los GGUF publicados ya incorporan la marca para desactivarlo.

## Capacidades

- Generación de texto en inglés con estilo de diálogo y rol, orientada a la interpretación de personajes del universo My Little Pony.
- Consistencia de persona a corto plazo dentro de la ventana de 1024 tokens, gracias al ajuste supervisado sobre diálogos con formato `<system>`/`<user>`/`<assistant>`.
- Reproducción de registros y vocabulario propios de la prosa del fandom,incluyendo nombres de personajes, lugares y expresiones recurrentes.
- Capacidad de continuar texto narrativo y descriptivo en inglés, aunque con coherencia limitada más allá de unos cientos de tokens.
- No soporta tool calling ni function calling: no hay evidencia de ello en la model card.
- No soporta razonamiento multi-paso, agentes ni uso de herramientas externas.
- No dispone de modo "thinking", visión, audio ni otras capacidades multimodales.
- Multilingüe: no. Solo inglés declarado; no se han publicado evaluaciones en otros idiomas.
- Razonamiento matemático y generación de código: sin soporte declarado ni evaluación publicada.

## Casos de uso

- NPCs y personajes embebidos en videojuegos indie: con 32 M de parámetros y ficheros de 13 a 33 MB, el modelo cabe en el binario de un juego o en los recursos de una app móvil y se ejecuta en CPU sin GPU dedicada, cubriendo diálogos de una o dos frases dentro de su contexto de 1024 tokens.
- Demo interactiva en navegador: el autor mantiene un Space (Lissa Playground) que ejecuta las cuantizaciones en el cliente sin servidor; el mismo enfoque sirve para prototipos con llama.cpp compilado a WebAssembly o con `wllama` en una página estática.
- Despliegue offline en placas SBC y teléfonos: con Q6_K (25,6 MB) o IQ4_XS (19,1 MB) el modelo corre en Raspberry Pi y Android vía llama.cpp u Ollama, útil para instalaciones sin conectividad (museos, ferias, dispositivos de acompañamiento temático).
- Base para fine-tuning de personajes: al ser Apache 2.0 y entrenado desde cero, es un punto de partida barato para experimentos de LoRA o SFT sobre nuevos personajes y registros, sin arrastrar las licencias restrictivas de modelos mayores.
- Investigación sobre cuantización en modelos minúsculos: la tabla de perplejidad por fichero, con imatrix y referencia bf16, permite estudiar empíricamente dónde se rompe la coherencia (el autor sitúa el umbral seguro en Q4_K_M, +6,0 % de PPL) y comparar estrategias IQ frente a K-quants.
- Prototipado rápido de pipelines de rol: sirve para validar plantillas de prompt, sistemas de persona y lógica de turnos antes de escalar a un modelo de 7-70 B, con un coste de inferencia prácticamente nulo.
- Docencia y demostraciones de LLM: 25 MB de pesos permiten mostrar en clase el funcionamiento interno de un transformer, la tokenización, el efecto del BOS y la degradación por cuantización sin depender de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, ARC, etc.) en la información disponible. La única métrica publicada es la perplejidad de cada cuantización con `llama-perplexity`, medida sobre el mismo texto de validación en inglés de 300 tokens y comparada con el original en bf16 (PPL 2,945):

| Fichero | Tamaño | PPL | Delta vs bf16 | Veredicto del autor |
|---|---:|---:|---:|---|
| Q6_K | 25,6 MB | 2,926 | -0,6 % | recomendado |
| Q8_0 | 33,0 MB | 2,941 | -0,1 % | referencia |
| IQ4_XS | 19,1 MB | 2,971 | +0,9 % | recomendado (imatrix) |
| Q5_K_M | 23,0 MB | 3,015 | +2,4 % | bueno |
| Q5_K_S | 22,6 MB | 3,027 | +2,8 % | bueno |
| Q4_K_M | 20,6 MB | 3,121 | +6,0 % | límite inferior seguro |
| Q4_K_S | 19,9 MB | 3,210 | +9,0 % | bajo responsabilidad |
| Q3_K_L | 18,9 MB | 3,205 | +8,8 % | bajo responsabilidad |
| Q3_K_M | 17,9 MB | 3,323 | +12,8 % | bajo responsabilidad |
| IQ3_M | 17,2 MB | 3,296 | +11,9 % | bajo responsabilidad (imatrix) |
| Q3_K_S | 16,8 MB | 3,354 | +13,9 % | calidad no garantizada |
| IQ3_XS | 16,3 MB | 3,626 | +23,1 % | calidad no garantizada |
| Q2_K | 15,4 MB | 4,250 | +44,3 % | calidad no garantizada |
| IQ2_M | 13,6 MB | 4,054 | +37,7 % | calidad no garantizada |
| IQ2_XS | 12,7 MB | 5,326 | +80,9 % | calidad no garantizada |

Estos valores no son comparables con los de otros modelos: se miden sobre un único texto de 300 tokens en inglés y con un tokenizador propio de 16.384 entradas.

## Requisitos de hardware

- VRAM estimada: entre 13 MB (IQ2_XS) y 33 MB (Q8_0) para los pesos; el KV cache para 1024 tokens en un modelo de 32 M es de unos pocos megabytes, por lo que el consumo total se mantiene por debajo de los 100 MB en la mayoría de configuraciones.
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) o incluso una iGPU sirve; el modelo es demasiado pequeño para aprovechar hardware de datacenter tipo A100 o H100, donde el cuello de botella sería el overhead de lanzamiento de kernels.
- Cabe en cualquier GPU consumer y en CPU: Raspberry Pi (incluidas generaciones modestas), routers, teléfonos Android e iOS, y navegador vía WebAssembly.
- Opciones de despliegue: llama.cpp (`llama-simple`, `llama-cli`, `llama-server`), Ollama (basta un `FROM ./archivo.gguf`), LM Studio, y cualquier runtime compatible con GGUF que respete la ausencia de BOS. El autor advierte de que algunas envolturas de chat inyectan su propia plantilla: para reproducir el comportamiento exacto hay que usar la ruta de completion, no la de chat.
- Latencia y throughput: no disponibles en la información proporcionada; no se han publicado mediciones de tokens por segundo.
- Cuantización recomendada por el autor para uso general: Q6_K; para presupuestos de tamaño ajustados, IQ4_XS.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Enfoque |
|---|---:|---:|---|---|---|
| LissaNano-Instruct-GGUF | 32 M | 1024 | Apache 2.0 | en | Rol y personajes (MLP), edge |
| SmolLM2-135M | 135 M | 8192 | Apache 2.0 | en (multilingüe parcial) | Modelo pequeño de propósito general |
| Qwen2.5-0.5B | ~494 M | 32.768 | Apache 2.0 | multilingüe | Propósito general, con tool calling |
| TinyLlama-1.1B | 1,1 B | 2048 | Apache 2.0 | en | Propósito general, preentrenamiento en 3 B tokens |

La comparación es estructural: LissaNano es entre 4 y 35 veces más pequeño que las alternativas y su ventana de contexto es de 4 a 32 veces menor. No existen datos públicos de benchmarks que permitan comparar su calidad frente a estos modelos en tareas estándar, y la perplejidad publicada no es comparable por usar un tokenizador y un corpus distintos. Su ventaja es el tamaño del artefacto (12-33 MB frente a cientos de MB o varios GB) y su especialización en un dominio muy concreto; su desventaja es la ausencia de capacidades generales, de tool calling y de multilingüismo.

## Limitaciones y advertencias

- Modelo de 32 M de parámetros: la coherencia se agota rápidamente; el autor reconoce que por debajo de Q4 el modelo mantiene el tema y el formato pero pierde voz y coherencia.
- Contexto de solo 1024 tokens: insuficiente para conversaciones largas, documentos o razonamiento encadenado. No hay mecanismos de memoria externa.
- Solo inglés. No se ha evaluado su comportamiento en castellano ni en otros idiomas; se espera degradación severa.
- Riesgo alto de alucinación: al ser un modelo entrenado sobre prosa de fandom, puede inventar hechos, nombres y detalles con total seguridad. No debe usarse como fuente de información.
- Sesgos: hereda los de un corpus de fan-fiction en inglés de una franquicia concreta; puede reproducir estereotipos de personaje y registros coloquiales propios del fandom.
- Dependencia estricta del formato de prompt: sin las etiquetas `<system>`/`<user>`/`<assistant>` y sin un mensaje de sistema no vacío, la calidad cae. Muchas envolturas de chat rompen el formato.
- El BOS degrada la salida: si se recuantiza o se convierte el modelo, hay que preservar `tokenizer.ggml.add_bos_token = false`.
- Sin soporte de tool calling, function calling ni agentes; no es apto para pipelines que requieran llamadas a APIs.
- Licencia Apache 2.0 permite uso comercial del modelo, pero los personajes y marcas de My Little Pony son propiedad de Hasbro: la licencia del pesos no otorga derechos sobre la propiedad intelectual subyacente. Conviene revisar el uso comercial de personajes con nombre propio.
- Ficheros por debajo de Q4_K_M (Q3, IQ3, Q2, IQ2) no están garantizados; el autor los publica para experimentos de tamaño. Los tipos Q2_0, TQ2_0 y Q1_0 se descartaron por perplejidades miles de veces superiores al bf16.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación independiente por parte de la comunidad.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/CastIronMind/LissaNano-Instruct-GGUF
- Modelo base: https://huggingface.co/CastIronMind/LissaNano-Instruct
- Demo (Lissa Playground): https://huggingface.co/spaces/CastIronMind/Lissa-Playground
- llama.cpp (runtime y herramientas `llama-perplexity`, `llama-imatrix`): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- No se han encontrado papers, blogs técnicos ni repositorios adicionales en la información proporcionada.
