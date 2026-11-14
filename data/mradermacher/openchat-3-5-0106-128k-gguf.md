# mradermacher/openchat-3.5-0106-128k-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF estáticas del modelo `CallComply/openchat-3.5-0106-128k`, una variante de OpenChat 3.5 con ventana de contexto extendida a 128 000 tokens. OpenChat es una familia de modelos conversacionales construida sobre Mistral-7B mediante C-RLFT (Conditional Reinforcement Learning from Fine-Tuning), una técnica que sustituye el RLHF convencional por aprendizaje por imitación condicionado por la calidad de las respuestas del dataset. El modelo original lo publicó el equipo OpenChat (Tsung-Hsien Wen y colaboradores) en enero de 2024, y esta variante de 128k procede de la comunidad (CallComply).

El autor de las cuantizaciones es mradermacher, un creador conocido en Hugging Face por producir amplios catálogos de GGUF estáticos para su uso con llama.cpp y derivados. El repositorio no aporta pesos nuevos ni fine-tuning: solo convierte los pesos originales en safetensors a formatos GGUF con distintos niveles de compresión, desde Q2_K hasta f16.

Con 7 241 748 480 parámetros (aproximadamente 7,24 mil millones), el modelo encaja en la categoría de modelos densos de 7B, lo que lo hace desplegable en GPUs de consumo. La licencia Apache 2.0 y la compatibilidad con endpoints estilo OpenAI (según las etiquetas del repositorio) lo convierten en una opción práctica para prototipos de asistentes conversacionales en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Mistral-7B) |
| Parametros totales | 7 241 748 480 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128 000 tokens (según el nombre y el modelo base) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de Mistral-7B, con atención por ventanas deslizantes (sliding window attention), RoPE y activación SwiGLU, tal como se define en el modelo Mistral original. OpenChat 3.5 se entrena con C-RLFT, un método que agrupa las muestras del dataset de instrucciones por "clase de calidad" y condiciona el modelo mediante un token de sistema que indica el nivel de respuesta esperado. Esto evita el coste y la inestabilidad del RLHF clásico (PPO) y permite entrenar con datos mixtos de distinta procedencia sin un reward model separado.

El modelo base `openchat-3.5-0106` se entrenó sobre aproximadamente 80 000 conversaciones GPT-4 y conjuntos de instrucciones curados, con una fase de fine-tuning supervisado seguida de C-RLFT. La variante de 128k que aquí se cuantiza extiende la ventana de contexto mediante ajuste adicional, aunque la model card del repositorio de cuantización no detalla la receta exacta de esa extensión. Las cuantizaciones son estáticas (no imatrix), según indica el autor; no hay quants ponderados disponibles en el momento de la publicación.

## Capacidades

- Generación de texto conversacional multi-turno con formato de chat (plantilla `GPT4 Correct User/Assistant`).
- Razonamiento y respuesta a instrucciones en inglés, con buen rendimiento en tareas de conocimiento general.
- Generación de código y explicaciones técnicas a nivel de modelo de 7B (no comparable a modelos especializados mayores).
- Aritmética y problemas matemáticos de complejidad moderada.
- Contexto largo de hasta 128 000 tokens en la variante base, útil para documentos extensos.
- Formato de chat compatible con endpoints estilo OpenAI (etiqueta `endpoints_compatible`).
- No dispone de tool calling nativo ni modo de razonamiento explícito (thinking); estas capacidades no están documentadas en la información disponible.
- Multilingüismo limitado: el modelo está etiquetado solo para inglés, aunque Mistral-7B subyacente tiene cierta competencia en otras lenguas.

## Casos de uso

- Asistente conversacional en inglés para atención al cliente: el modelo gestiona diálogos multi-turno y, con la ventana de 128k, puede mantener contexto de conversaciones largas o históricos de tickets sin truncar.
- Resumen de documentos extensos: artículos, informes o transcripciones de hasta decenas de miles de tokens caben en el contexto, permitiendo resúmenes con referencias cruzadas internas.
- Prototipado rápido en local con llama.cpp u Ollama: los quants Q4_K_M (4,5 GB) permiten ejecutar el modelo en portátiles con GPU de 8 GB o incluso en CPU, ideal para demos y pruebas de producto.
- Generación de código asistida en entornos con recursos limitados: el modelo puede autocompletar funciones, explicar fragmentos y generar tests sencillos, integrándose en editores vía servidores compatibles con la API de OpenAI.
- Extracción de información de conversaciones: clasificación de intenciones, resumen de hilos de soporte y etiquetado de tickets en pipelines por lotes, donde el bajo coste por token de un 7B cuantizado es determinante.
- Traducción y reescritura dentro del inglés: mejora de redacción, simplificación de textos técnicos y adaptación de tono en herramientas de productividad.
- Educación y tutoría automatizada: explicaciones paso a paso de conceptos en inglés, con capacidad de mantener el hilo de una sesión de estudio larga gracias al contexto extendido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantización no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones numéricas. Los benchmarks del modelo OpenChat 3.5 original (por ejemplo, MMLU en torno al 60 % para la versión 0106) corresponden al modelo base sin extensión de contexto y no deben atribuirse directamente a esta variante de 128k sin verificación.

## Requisitos de hardware

- VRAM estimada para inferencia: Q2_K ~2,8 GB; Q3_K_M ~3,6 GB; IQ4_XS ~4,0 GB; Q4_K_M ~4,5 GB; Q5_K_M ~5,2 GB; Q6_K ~6,0 GB; Q8_0 ~7,8 GB; f16 ~14,6 GB (tamaños de archivo, sin overhead de KV cache).
- La KV cache para contexto de 128k es considerable: en f16 con 32 capas y atención GQA de Mistral-7B, puede superar varios GB adicionales, por lo que contextos muy largos exigen GPUs con 16-24 GB o técnicas de quantización de KV cache.
- GPU recomendadas: RTX 4090 (24 GB) para Q8_0 o f16 con contexto largo; RTX 3060/4060 Ti (8-16 GB) para Q4_K_M y Q5_K_M con contexto moderado; A100/H100 no aportan ventaja significativa para un 7B salvo en despliegues de alta concurrencia.
- Cabe en GPUs de consumo: sí, desde GTX 1060 6 GB (quants Q2-Q3) hasta RTX 4090 (f16).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, servidores compatibles con la API de OpenAI; vLLM y TGI requieren los pesos safetensors del modelo base, no los GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependen del hardware, del quant y del backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| openchat-3.5-0106-128k (este, vía GGUF) | 7,24 B | 128k | Apache 2.0 | GGUF (12 quants) | Variante de contexto extendido de OpenChat 3.5 |
| Mistral-7B-Instruct v0.2 | 7,24 B | 32k | Apache 2.0 | safetensors, GGUF | Base directa de OpenChat; contexto menor |
| Zephyr-7B-beta | 7,24 B | 32k | MIT | safetensors, GGUF | Entrenado con DPO sobre Mistral; alternativa conversacional |
| Llama 3 8B Instruct | 8,03 B | 8k | Llama 3 Community License | safetensors, GGUF | Contexto menor y licencia más restrictiva |

## Limitaciones y advertencias

- Solo inglés etiquetado: el rendimiento en castellano u otras lenguas no está garantizado y probablemente será inferior al de modelos multilingües específicos.
- Riesgo de alucinación inherente a un 7B: puede inventar datos, citas o APIs en tareas de conocimiento factual o código.
- La extensión a 128k procede de un modelo base de la comunidad (`CallComply`), no del equipo OpenChat original; la calidad en contextos muy largos no está validada en esta ficha.
- Sesgos presentes en los datos de entrenamiento (conversaciones GPT-4 e instrucciones web), incluyendo sesgos de género, culturales y de estilo.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base y de Mistral-7B subyacente.
- Cuantizaciones estáticas sin imatrix: los quants de baja calidad (Q2_K, Q3_K_S) degradan notablemente la coherencia; se recomienda Q4_K_M o superior para producción.
- Sin soporte documentado de tool calling ni function calling nativo; para agentes es necesario un framework externo o un modelo distinto.
- El repositorio tiene muy pocas descargas (360) y un solo like, lo que sugiere poca validación comunitaria de estas cuantizaciones concretas.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/openchat-3.5-0106-128k-GGUF
- Modelo base de la variante: https://huggingface.co/CallComply/openchat-3.5-0106-128k
- Página de descargas del autor: https://hf.tst.eu/model#openchat-3.5-0106-128k-GGUF
- Repositorio de peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de quant (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica de perplexidad de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
