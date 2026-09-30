# francesca9805/hin-deva-100mb-ppt-Dp-10mb-packed-bfdiso_seed3407

## Resumen

El modelo `francesca9805/hin-deva-100mb-ppt-Dp-10mb-packed-bfdiso_seed3407` es un ajuste fino supervisado (SFT) del modelo monolingüe `goldfish-models/hin_deva_100mb`, entrenado con la librería TRL sobre un corpus de texto en hindi en escritura devanagari. Lo publica el usuario de HuggingFace `francesca9805`, vinculado al grupo de investigación de F. Padovani en la Universidad de Groningen según la traza de Weights & Biases incluida en la model card. Se trata de un checkpoint experimental de pequeño tamaño (124.770.816 parámetros totales, 0,3 GB de repositorio) que no presenta métricas de evaluación, descargas ni validación externa.

El modelo pertenece a la familia de arquitectura GPT-2 (transformer decoder-only con embeddings posicionales aprendidos), heredada del modelo base Goldfish, que entrena modelos monolingües sobre aproximadamente 100 MB de texto por idioma. El nombre del checkpoint sugiere un experimento comparativo entre tokenizadores y configuraciones de datos empaquetados, con semilla fija y variantes hermanas publicadas en paralelo (`bfd_seed3407`, `bfd_seed455`, `hin-deva-10mb-...`). Su relevancia es, por tanto, metodológica y de investigación: sirve como punto de partida reproducible para estudiar el efecto del ajuste fino y de la tokenización en lenguas de bajos recursos, más que como modelo listo para producción.

Al tratarse de un modelo de ~125 M de parámetros, es ejecutable en CPU y en cualquier GPU de consumo, con una huella de memoria inferior a 1 GB en precisión bf16. La model card no documenta la longitud de contexto, la composición exacta del dataset, el número de tokens de entrenamiento, la licencia efectiva ni los idiomas soportados oficialmente, lo que limita seriamente su uso fuera del ámbito experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (según el tag `gpt2` del repositorio y la familia del modelo base Goldfish) |
| Parametros totales | 124.770.816 (≈125 M), dato real de safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la model card no la documenta; el modelo base usa tokenizador propio) |
| Tipos de cuantizacion | no se publican versiones cuantizadas; el repositorio contiene pesos safetensors (el tamaño de 0,3 GB es coherente con ~125 M de parámetros en 2 bytes, es decir bf16/fp16) |
| Idiomas soportados | no disponible en los metadatos; el identificador del modelo base (`hin_deva_100mb`) indica entrenamiento sobre hindi en escritura devanagari |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin texto legal concreto) |
| Formato de pesos | safetensors, compatible con la librería `transformers` |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2: un transformer decoder-only con normalización previa a cada subcapa (pre-LN), atención multi-cabeza causal con embeddings posicionales absolutos aprendidos y activación GELU en el bloque feed-forward. Los pesos están almacenados en safetensors y el modelo es compatible con `transformers`, `text-generation-inference` y los endpoints gestionados de HuggingFace (tags `endpoints_compatible` y `region:us`). El recuento exacto de parámetros (124.770.816) es consistente con la clase de tamaño GPT-2 small, aunque el vocabulario y el tokenizador difieren del GPT-2 original.

El entrenamiento se realizó con SFT mediante TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. El run de entrenamiento está registrado en Weights & Biases bajo el proyecto `new-tokenizers`, lo que apunta a un experimento centrado en el diseño del tokenizador. El identificador del checkpoint indica el uso de un dataset empaquetado (`packed`) de aproximadamente 10 MB y una semilla fija (3407), pero la model card no especifica el número de tokens vistos, la composición del corpus, la existencia de RLHF/DPO ni los hiperparámetros de optimización. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, SSM o arquitecturas híbridas).

## Capacidades

- Generación de texto autoregresiva en la modalidad de chat simple: el ejemplo oficial de la model card pasa una lista de mensajes con `role: user` al pipeline `text-generation`, lo que indica que el ajuste fino se hizo sobre datos con formato conversacional.
- Generación de texto en hindi en escritura devanagari, siempre que el tokenizador heredado del modelo base cubra ese sistema de escritura (el nombre `hin_deva` así lo sugiere, pero no hay confirmación documental).
- Continuación de texto y finalización de secuencias cortas, típica de modelos de ~125 M de parámetros.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes, razonamiento multi-paso, planificación ni uso de memoria externa.
- No se documenta capacidad multilingüe: el modelo base es monolingüe.
- No se documenta visión, audio, modo de razonamiento explícito (`thinking mode`) ni generación de código.
- No se publican evaluaciones de matemáticas, código o razonamiento lógico.

## Casos de uso

- Investigación sobre tokenización en lenguas de bajos recursos: el run de W&B (`new-tokenizers`) y las variantes hermanas con distintos tamaños de corpus y semillas permiten comparar el efecto del tokenizador y del volumen de datos empaquetados en un modelo de 125 M de parámetros.
- Reproducibilidad de experimentos de SFT: al publicarse el checkpoint, las versiones exactas de TRL, Transformers, PyTorch y Datasets, un investigador puede replicar el ajuste y comparar la curva de entrenamiento con la registrada en W&B.
- Baseline para experimentos de escalado: sirve como referencia de ~125 M de parámetros frente a modelos Goldfish de mayor tamaño o a variantes con más datos (por ejemplo, la variante `hin-deva-10mb-ppt-Dp-100mb-packed`), para medir cuánto aporta el corpus frente a la arquitectura.
- Generación de texto sintético en hindi para aumento de datos: con la advertencia de que un modelo de 125 M entrenado con pocos datos produce texto poco fiable, puede emplearse en experimentos controlados de data augmentation con filtrado posterior obligatorio.
- Despliegue en entornos con recursos muy limitados: al ocupar menos de 1 GB en memoria y ser ejecutable en CPU, es viable en dispositivos embebidos, portátiles sin GPU o contenedores pequeños para demos y pruebas de integración.
- Pruebas de integración de infraestructura de inferencia: por su tamaño reducido, es útil para validar pipelines de vLLM, TGI o llama.cpp sin consumir GPUs caras, antes de desplegar modelos mayores de la misma familia.
- Estudio lingüístico de fenómenos morfológicos del hindi en devanagari: análisis de probabilidades y representaciones internas en un modelo entrenado exclusivamente con ~100 MB de ese idioma.
- Docencia y prácticas de ajuste fino: el coste de entrenamiento es tan bajo que permite reproducir el ciclo completo (tokenización, SFT, evaluación) en una sola GPU de consumo o incluso en CPU con paciencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna tarea en hindi (por ejemplo, perplexity sobre un corpus de validación), y el repositorio registra 0 descargas y 0 likes, por lo que tampoco existen evaluaciones de terceros.

## Requisitos de hardware

- Pesos en bf16/fp16: 124.770.816 × 2 bytes ≈ 250 MB. En int8 la huella teórica baja a ~125 MB y en int4 a ~62 MB, aunque no se publican checkpoints cuantizados.
- VRAM total en inferencia: por debajo de 1 GB para lotes pequeños y contextos cortos, sumando pesos y caché KV. No se dispone de la longitud de contexto oficial, por lo que la caché KV no puede dimensionarse con precisión.
- GPU recomendadas: cualquier GPU de consumo sirve; una RTX 3060, RTX 4060 o incluso una GTX 1650 son más que suficientes. No requiere A100 ni H100, que quedarían infrautilizadas.
- Compatibilidad con GPU de consumo: sí, en todas las gamas actuales; también es viable en CPU con cuantización a int8 mediante llama.cpp.
- Opciones de despliegue: `transformers` con `pipeline("text-generation")` (método documentado en la model card), Text Generation Inference (el repositorio incluye el tag `text-generation-inference` y `endpoints_compatible`), vLLM, y llama.cpp/Ollama tras convertir los pesos safetensors a GGUF con `convert_hf_to_gguf.py`.
- Latencia y throughput estimados: no disponible; no se publican mediciones. Por el tamaño, se espera una latencia muy baja en GPU de consumo, pero no hay cifras verificables en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `francesca9805/hin-deva-100mb-ppt-Dp-10mb-packed-bfdiso_seed3407` (este modelo) | 124.770.816 | no disponible | hindi devanagari (inferido del modelo base) | no disponible | 0 descargas, 0 likes |
| `goldfish-models/hin_deva_100mb` (modelo base) | no disponible | no disponible | hindi devanagari | no disponible en la información consultada | público en HuggingFace |
| Variantes hermanas (`hin-deva-100mb-ppt-Dp-10mb-packed-bfd_seed3407`, `bfd_seed455`, `hin-deva-10mb-ppt-Dp-100mb-packed-bfd_seed3407`) | ~125 M (misma clase) | no disponible | hindi devanagari | no disponible | públicos, sin métricas publicadas |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | inglés | MIT | ampliamente disponible y evaluado |

La comparación cuantitativa de rendimiento no es posible: ninguno de los modelos de la familia Goldfish empleados aquí publica resultados de benchmarks en la información disponible, y GPT-2 small no es comparable en idioma ni en tarea. La única comparación sólida es de tamaño y coste de inferencia, donde este modelo se sitúa en la misma clase que GPT-2 small con una licencia menos clara.

## Limitaciones y advertencias

- Escala muy reducida: con ~125 M de parámetros, la capacidad de razonamiento, coherencia a largo plazo y conocimiento factual es muy limitada; es esperable un alto porcentaje de texto incoherente o repetitivo.
- Riesgo elevado de alucinación: no hay ningún mecanismo de verificación ni alineación documentada (no se menciona RLHF ni DPO, solo SFT), y el corpus de entrenamiento es de escala muy pequeña.
- Datos de entrenamiento no documentados: se desconoce la composición del dataset, el número de tokens, los filtros de calidad y la posible presencia de sesgos, contenido ofensivo o datos personales.
- Sesgos previsiblemente no evaluados: al ser un modelo monolingüe de bajos recursos, puede reproducir estereotipos de género, casta, religión o región presentes en corpus web en hindi; no hay ninguna auditoría publicada.
- Contexto y tokenizador no confirmados: al no documentarse la longitud de contexto ni el tokenizador exacto (proyecto `new-tokenizers`), cualquier integración en producción requiere verificar empíricamente ambos extremos antes de dimensionar la caché KV.
- Licencia no aclarada: el campo `licence: license` de la model card no constituye una licencia legal. No se puede asumir permiso para uso comercial y debe consultarse al autor y al modelo base antes de cualquier despliegue productivo.
- Ausencia de benchmarks: no hay perplexity, métricas en hindi ni comparaciones con alternativas, por lo que no existe base objetiva para afirmar que este checkpoint mejora al modelo base.
- Naturaleza experimental: la existencia de múltiples semillas y configuraciones hermanas sugiere que se trata de checkpoints de un barrido de hiperparámetros, no de una versión estable publicada para uso general.
- Idiomas: no se declara soporte multilingüe; el uso fuera del hindi devanagari producirá resultados degradados con alta probabilidad.
- Inconsistencia de metadatos: las fechas de creación y actualización registradas (2026) son posteriores a las versiones de framework declaradas y al contexto temporal habitual de publicación, lo que sugiere un posible error en los metadatos del repositorio.
- Sin soporte de tool calling ni de agentes: no debe integrarse en flujos que requieran llamadas a funciones, RAG complejo o razonamiento multi-paso sin una capa externa que compense.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/hin-deva-100mb-ppt-Dp-10mb-packed-bfdiso_seed3407
- Modelo base: https://huggingface.co/goldfish-models/hin_deva_100mb
- Organización Goldfish en HuggingFace: https://huggingface.co/goldfish-models
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/qovik0k9
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante hermana `bfd_seed3407`: https://huggingface.co/francesca9805/hin-deva-100mb-ppt-Dp-10mb-packed-bfd_seed3407
- Variante hermana `bfd_seed455`: https://huggingface.co/francesca9805/hin-deva-100mb-ppt-Dp-10mb-packed-bfd_seed455
- Variante hermana `hin-deva-10mb-ppt-Dp-100mb-packed-bfd_seed3407`: https://huggingface.co/francesca9805/hin-deva-10mb-ppt-Dp-100mb-packed-bfd_seed3407
- Página de despliegue en FriendliAI: https://friendli.ai/models/francesca9805/hin-deva-10mb-ppt-Dp-100mb-packed-bfd_seed3407
- Ficha en free2aitools: https://free2aitools.com/model/francesca9805/hin-deva-100mb-ppt-dp-10mb-packed-bfd_seed455
- Ficha en LLM Explorer: https://llm-explorer.com/model/fpadovani%2Fhin-deva-10mb-ppt-Dp-100mb_seed10,2gxqbfb7x05raV9Acig3xV
