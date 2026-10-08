# longtimedevs/TimeGPT-Base

## Resumen

TimeGPT-Base es un modelo de lenguaje autorregresivo (causal LM) de 0,5B parámetros desarrollado por el equipo independiente LongTime Devs y entrenado íntegramente desde cero, sin destilación ni reutilización de pesos de terceros. Se distribuye como modelo base (base model), es decir, entrenado únicamente con el objetivo de predicción del siguiente token, sin ninguna fase de ajuste por instrucciones, RLHF o DPO. Su propósito es servir de fundamento para una futura versión instructiva (TimeGPT-Instruct 0.5B, anunciada como en fase final de entrenamiento) y como banco de pruebas para entrenamiento de bajo coste en hardware de consumo.

La arquitectura sigue el patrón de los transformers decoder-only modernos al estilo Llama 3 / Qwen 2.5: 24 capas, dimensión oculta de 1280, Grouped-Query Attention con 20 cabezas de consulta y 4 de clave/valor, activación SwiGLU, RMSNorm, RoPE con theta de 500 000 y weight tying entre embeddings y cabeza de salida. El contexto máximo es de 1024 tokens y el vocabulario de 32 000 entradas con un tokenizador Byte-Level BPE propio, multilingüe y con byte-fallback.

Es relevante ahora por dos motivos. Primero, porque demuestra que un modelo de 507M parámetros puede preentrenarse en aproximadamente 27 horas sobre una única GPU de consumo (RTX 5060 Ti de 16 GB), lo que lo convierte en un caso de estudio práctico sobre eficiencia de entrenamiento. Segundo, porque su licencia Apache 2.0 y su naturaleza multilingüe (ruso como idioma principal, con inglés, chino, alemán y ucraniano) lo hacen atractivo como base para ajuste fino en dominios rusófonos, un nicho con menos opciones abiertas que el inglés. Conviene advertir que no guarda ninguna relación con el modelo homónimo TimeGPT de Nixtla, orientado a series temporales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM), estilo Llama 3 / Qwen 2.5 |
| Parametros totales | 506.656.000 (0,51B), segun los pesos en safetensors |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 1024 tokens (`max_seq_len`) |
| Tipos de cuantizacion | No disponible: solo se publican pesos en bfloat16; no hay versiones GGUF, GPTQ, AWQ ni EXL2 en el repositorio |
| Idiomas soportados | Ruso (principal, ~55% del corpus), ingles (~20%), chino (~10%), aleman (~8%), ucraniano (~7%) |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors (`model.safetensors`, 1,02 GB, bfloat16) |
| Dimension oculta (`dim`) | 1280 |
| Numero de capas | 24 |
| Cabezas de atencion | 20 query / 4 key-value (GQA, ratio 5:1) |
| Dimension MLP intermedia | 3456 (SwiGLU) |
| Tamano de vocabulario | 32 000 |
| Tokenizador | Byte-Level BPE propio, con byte-fallback y tokens ChatML (`<\|pad\|>`, `<\|unk\|>`, `<\|im_start\|>`, `<\|im_end\|>`) |
| Posicional encoding | RoPE con theta = 500 000 |
| Norma | RMSNorm (eps = 1e-5) |
| Precisión de referencia | bfloat16, con soporte de FlashAttention / SDPA |
| Pipeline declarado | text-generation (con `inference: false` en los metadatos) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Publicacion (metadatos) | 8 de octubre de 2026 (creacion), 8 de octubre de 2026 (ultima actualizacion) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso con las optimizaciones habituales de los modelos de 2024-2025. La atención usa Grouped-Query Attention con proporción 5:1 (20 cabezas de consulta frente a 4 de clave/valor), lo que reduce el tamaño del KV-cache en un factor de 5 respecto a atención multi-cabeza completa. Con dimensión de cabeza de 64 (1280/20), el KV-cache en bfloat16 ocupa aproximadamente 24 KB por token (2 × 24 capas × 4 cabezas KV × 64 dimensiones × 2 bytes), es decir, unos 24 MB para la ventana completa de 1024 tokens. Los bloques MLP usan SwiGLU con dimensión intermedia de 3456, la normalización es RMSNorm y el posicionamiento es RoPE con frecuencia base 500 000, valor alto que en teoría favorece la estabilidad en secuencias largas aunque el límite declarado sea de 1024 tokens. El weight tying entre la matriz de embeddings (32 000 × 1280) y la cabeza de salida reduce el recuento de parámetros y actúa como regularizador.

El preentrenamiento se realizó sobre un corpus multilingüe de aproximadamente 820 millones de tokens, con predominio del ruso (Wikipedia en ruso más el corpus de noticias `IlyaGusev/gazeta`, ~55%), seguido de Wikipedia en inglés (~20%), chino (~10%), alemán (~8%) y ucraniano (~7%). Se ejecutaron 50 000 pasos con un tamaño de lote efectivo de 16 secuencias de 1024 tokens, sobre una única NVIDIA GeForce RTX 5060 Ti de 16 GB, durante aproximadamente 27 horas. El optimizador fue AdamW (β₁ = 0,9, β₂ = 0,95, weight decay = 0,01) con un schedule de cosine annealing y warmup de 1500 pasos hasta un pico de learning rate de 1,8e-4. No hubo fases posteriores de RLHF, DPO ni ajuste supervisado. El loss de entrenamiento descendió de 10,64 a un rango final de 3,02-3,36, con perplejidad en torno a 20.

## Capacidades

- Generación de texto por continuación (next-token prediction / text completion) en ruso, inglés, chino, alemán y ucraniano.
- Modelado de lenguaje y puntuación de secuencias: al ser un modelo base, puede usarse para calcular verosimilitudes y perplejidad, útil en filtrado de datos y detección de anomalías textuales.
- Manejo robusto de caracteres raros gracias al byte-fallback del tokenizador, que evita el token `<|unk|>` con emojis, alfabetos no latinos y signos poco frecuentes.
- Procesamiento de contextos de hasta 1024 tokens en una sola pasada, con KV-cache reducido gracias a GQA.
- Vocabulario y plantillas compatibles con el estándar ChatML (`<|im_start|>` / `<|im_end|>`), lo que facilita el futuro ajuste instructivo y la integración con plantillas de chat convencionales.
- Entrenamiento en precisión bfloat16 con soporte de FlashAttention / SDPA, lo que habilita inferencia rápida en GPU modernas.
- No dispone de ajuste por instrucciones, por lo que no sigue órdenes ni mantiene diálogos de forma fiable.
- No soporta tool calling, function calling ni uso como agente.
- No dispone de modo de razonamiento explícito (thinking mode), visión, audio ni otras modalidades.
- No hay versión instructiva publicada en el momento de redactar esta ficha.

## Casos de uso

- Ajuste fino para dominios en ruso: el modelo puede servir como punto de partida para un SFT sobre corpus jurídicos, médicos o técnicos en ruso, aprovechando que su licencia Apache 2.0 no impone restricciones de uso comercial y que su tamaño permite entrenar con una sola GPU de 16 GB.
- Generación aumentada de datos: usar el modo de continuación para producir variantes sintéticas de frases en ruso o ucraniano y ampliar corpus de entrenamiento de otros modelos, filtrando después por perplejidad.
- Puntuación y filtrado de corpus: calcular la log-verosimilitud de documentos con el modelo para descartar texto ruidoso, mal codificado o generado automáticamente antes de incorporarlo a un pipeline de datos.
- Investigación sobre entrenamiento de bajo coste: replicar el ciclo completo (50 000 pasos, ~820M tokens, 27 horas en una RTX 5060 Ti) como referencia reproducible para estudiar el efecto del tamaño de vocabulario, la proporción de idiomas o el schedule de learning rate.
- Prototipado de autocompletado en aplicaciones de escritura en ruso: integrar el modelo tras una capa de ajuste fino específica para sugerir continuaciones de frases, dado que el contexto de 1024 tokens cubre párrafos completos de texto periodístico o técnico.
- Base para un futuro asistente conversacional: cuando se publique TimeGPT-Instruct 0.5B, este modelo base documenta la línea de desarrollo y sirve para comparar el efecto del alineamiento sobre el mismo preentrenamiento, así como para inicializar dicho ajuste.
- Experimentos académicos de multilingüismo: analizar cómo se comporta un modelo pequeño entrenado con fuerte predominio del ruso frente a otros idiomas del corpus (alemán, chino, ucraniano) para estudiar transferencia entre lenguas emparentadas o tipológicamente distantes.
- Despliegue en el borde o en entornos con VRAM muy limitada: con pesos de ~1 GB en bfloat16, cabe en GPUs integradas de 4-8 GB, lo que permite experimentar con generación de texto local en portátiles sin GPU dedicada de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones sobre MMLU, HumanEval, GSM8K, HellaSwag ni ningún otro conjunto estándar, y no se dispone de resultados de terceros. Los únicos datos numéricos reportados por el autor son métricas de entrenamiento:

| Metrica | Valor |
|---|---|
| Loss inicial | 10,64 |
| Loss final | 3,02 - 3,36 |
| Perplejidad final | ~20 |
| Tokens procesados | ~820 millones |
| Pasos de entrenamiento | 50 000 |
| Duracion | ~27 horas en 1× RTX 5060 Ti 16 GB |

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 1,02 GB en bfloat16 (el archivo `model.safetensors` ocupa 1,02 GB). En float32 ascendería a unos 2 GB.
- VRAM total para inferencia: del orden de 1,5-2,5 GB en bfloat16 incluyendo activaciones y KV-cache. El KV-cache completo (1024 tokens) ocupa unos 24 MB, por lo que es despreciable frente a los pesos.
- GPU compatibles: cualquier GPU con soporte de bfloat16 y al menos 4 GB de VRAM. Se ha validado el entrenamiento en una RTX 5060 Ti de 16 GB; para inferencia bastan tarjetas como RTX 3050, RTX 4060, GTX 1650 (solo con conversión a float16/float32 al no soportar bfloat16 nativo) o GPUs integradas con 8 GB de memoria compartida.
- Cabe en GPU de consumo: sí, con holgura. Un modelo de ~1 GB de pesos se ejecuta en prácticamente cualquier GPU de los últimos diez años con al menos 4 GB de VRAM.
- Opciones de despliegue: al tratarse de una arquitectura propia con código personalizado (no es un `LlamaForCausalLM` estándar), vLLM, TGI, Ollama, llama.cpp y transformers no la cargan directamente. El único camino documentado es el script de inferencia de la model card, que define la arquitectura a mano y carga los pesos con `safetensors`. Para usar otras herramientas sería necesario convertir la arquitectura o portarla a un grafo compatible, algo no documentado.
- Latencia y throughput: no disponible. El autor no publica mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento |
|---|---|---|---|---|---|
| TimeGPT-Base | 0,51B | 1024 | ru, en, zh, de, uk | Apache 2.0 | No disponible (sin benchmarks publicados) |
| Qwen2.5-0.5B | 0,49B | 32 768 | ~29 idiomas, con foco en en/zh | Apache 2.0 | No disponible en esta ficha (consultar la model card del fabricante) |
| SmolLM2-360M | 0,36B | 8192 | Principalmente ingles | Apache 2.0 | No disponible en esta ficha (consultar la model card del fabricante) |
| Llama-3.2-1B | 1,24B | 128 000 | 8 idiomas oficiales, sin ruso destacado | Licencia comunitaria Llama 3.2 | No disponible en esta ficha (consultar la model card del fabricante) |

TimeGPT-Base se diferencia de estas alternativas en tres aspectos: es el único con predominio claro del ruso en el corpus, es el único con un contexto de solo 1024 tokens (entre 8 y 128 veces menor que sus competidores) y es el único que no se integra en el ecosistema estándar de transformers sin código propio. A cambio, su recuento de parámetros y su licencia permisiva lo sitúan en la misma franja de coste operativo que Qwen2.5-0.5B. No se dispone de comparaciones de rendimiento publicadas. Nota: el modelo TimeGPT-1 / TimeGPT-2.1 de Nixtla, que aparece en los resultados de búsqueda, es un modelo de series temporales completamente distinto y no es comparable con esta ficha.

## Limitaciones y advertencias

- Es un modelo base sin alineamiento: no sigue instrucciones, no responde a preguntas de forma fiable y no mantiene conversaciones coherentes. No debe usarse como chatbot sin un ajuste instructivo previo.
- Infraentrenamiento severo: con ~820 millones de tokens vistos y 507M parámetros, la ratio es de aproximadamente 1,6 tokens por parámetro, muy por debajo de los ~20 tokens por parámetro que sugiere la regla de Chinchilla (unos 10 000 millones de tokens para este tamaño). El modelo ha visto en torno al 8% de esa cifra, lo que se refleja en una perplejidad final de ~20, alta para un modelo de su clase.
- Contexto muy corto: 1024 tokens limitan drásticamente los casos de uso con documentos largos, diálogos multi-turno o recuperación aumentada con pasajes extensos.
- Riesgo elevado de alucinación y de deriva temática: al no haber pasado por RLHF ni DPO y al estar entrenado sobre todo con Wikipedia y noticias, es probable que genere afirmaciones plausibles pero falsas, especialmente fuera del ruso.
- Sesgos del corpus: la mezcla de Wikipedia y del corpus de noticias `IlyaGusev/gazeta` puede introducir sesgos editoriales, temporales y geográficos, y un desequilibrio claro entre idiomas (el ruso domina con ~55%), con un rendimiento previsiblemente mucho peor en chino, alemán y ucraniano.
- Homónimo conflictivo: el nombre TimeGPT está asociado públicamente al modelo de series temporales de Nixtla. Esto puede provocar confusión en búsquedas, citas y comparativas; no son el mismo proyecto ni la misma tarea.
- Ecosistema limitado: no hay pesos cuantizados (GGUF, GPTQ, AWQ, EXL2), no hay integración con vLLM, Ollama, TGI o llama.cpp, y no está desplegado en los endpoints de inferencia de Hugging Face (`inference: false`). La adopción requiere escribir código propio.
- Ausencia de benchmarks: sin MMLU, HumanEval, GSM8K ni evaluaciones multilingües publicadas, no es posible situar el modelo frente a alternativas con rigor. Cualquier afirmación de calidad relativa sería especulativa.
- Advertencia del propio autor: la model card incluye dos avisos explícitos en el script de inferencia pidiendo no usarlo en producción y limitarlo a fines de investigación, prueba y experimentación. Aunque la licencia Apache 2.0 permite legalmente el uso comercial, el autor desaconseja el despliegue productivo.
- Sin mantenimiento comunitario: 0 descargas y 0 likes en el momento de la consulta, sin señales de adopción ni de soporte por parte de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtimedevs/TimeGPT-Base
- Corpus de noticias en ruso citado en el entrenamiento: https://huggingface.co/datasets/IlyaGusev/gazeta
- TimeGPT-1 en el catálogo de Microsoft Foundry (modelo distinto, de Nixtla, para series temporales): https://ai.azure.com/catalog/models/TimeGPT-1
- Documentación de TimeGPT de Nixtla (modelo distinto, para series temporales): https://www.nixtla.io/docs/introduction/about_timegpt
- TimeGPT-2.1 en Microsoft Marketplace (modelo distinto, de Nixtla): https://marketplace.microsoft.com/en-us/product/saas/nixtla.tgpt-2-1
- Anuncio de despliegue de TimeGPT en Azure Marketplace (modelo distinto, de Nixtla): https://www.nixtla.io/blog/timegpt-azure-marketplace
- Repositorio GitHub de Nixtla (modelo distinto, para series temporales): https://github.com/Nixtla/nixtla
