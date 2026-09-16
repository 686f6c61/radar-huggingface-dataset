# qikuanz/Spark-X2.5-4B

## Resumen

Spark-X2.5-4B es un modelo de lenguaje decoder-only de propósito general desarrollado por XHToken (proyecto Spark-X2.5) y publicado en HuggingFace. Esta ficha corresponde a la copia subida por el usuario qikuanz, derivada del modelo base XHToken/Spark-X2.5-4B-Base. Con 4.112.079.360 parámetros (~4,1 B), está diseñado para competir con modelos compactos de despliegue local y en dispositivo, cubriendo conversación, escritura, traducción, razonamiento, código, uso de herramientas y flujos agénticos.

Su rasgo técnico principal es una arquitectura de atención híbrida que combina una capa de atención completa con tres capas de atención de ventana deslizante (SWA), lo que reduce el coste computacional asociado al contexto largo y permite una ventana nativa de hasta 1.000.000 de tokens. La model card declara además soporte para más de 200 idiomas y una etapa de entrenamiento específica de contexto largo.

El modelo se presenta como compatible con NVIDIA, Huawei Ascend, Hygon y HOUMO.AI, y con marcos de inferencia como vLLM, SGLang, llama.cpp, MLX, Ollama y LM Studio, además de LLaMA-Factory para ajuste fino. Es relevante ahora porque ofrece contexto de 1 M tokens en la franja de los 4 B de parámetros, un segmento dominado por modelos con ventanas mucho menores (32 K-128 K). La licencia Apache 2.0 facilita su uso comercial, aunque no se han publicado resultados de benchmarks en formato de texto y el repositorio no registra descargas ni validación independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención híbrida: una capa de atención completa por cada tres capas de sliding-window attention (SWA) |
| Parametros totales | 4.112.079.360 (~4,1 B) segun safetensors |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | Hasta 1.000.000 tokens de forma nativa (según model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ oficiales) |
| Idiomas soportados | Más de 200 idiomas según la model card; el campo de idiomas de HuggingFace aparece vacío |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere `trust_remote_code` por el tag `custom_code`) |
| Modelo base | XHToken/Spark-X2.5-4B-Base |
| Tamaño del repositorio | 8,2 GB |
| Librería | transformers |
| Pipeline | text-generation |
| Fecha de creación (según metadatos) | 2026-09-15 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con un esquema de atención híbrido. Por cada capa de atención completa (full attention) se incluyen tres capas de atención de ventana deslizante, de modo que la mayoría de capas solo atienden a una ventana local de tokens. Según el autor, este diseño busca equilibrar rendimiento, eficiencia de inferencia y tamaño del KV-cache, y es el mecanismo que permite sostener la ventana nativa de hasta 1 M tokens sin el coste cuadrático completo de un modelo de atención densa. El modelo se etiqueta como `custom_code`, por lo que su carga requiere `trust_remote_code=True`.

El preentrenamiento se realizó sobre aproximadamente 20 billones (trillion) de tokens procedentes de páginas web, libros, publicaciones académicas, código y materiales enciclopédicos, con estudios de mezcla de datos orientados a matemáticas, lógica y código. La capacidad de contexto largo se desarrolló en una etapa específica de cientos de miles de millones de tokens con longitudes de secuencia de hasta 1 M tokens. El post-entrenamiento combina supervisión fina (SFT) para seguimiento de instrucciones y generación estructurada, seguida de aprendizaje por refuerzo a gran escala en dominios de comprensión del lenguaje, razonamiento, programación, comportamiento agéntico con herramientas y seguimiento de instrucciones. Las distintas políticas docentes especializadas se consolidaron en un único modelo desplegable mediante la técnica denominada MOPD. El entrenamiento se llevó a cabo en clústeres Huawei Ascend. No se especifican en la información disponible el número de capas, dimensiones ocultas, número de cabezas de atención, tamaño de la ventana deslizante ni el número exacto de tokens de cada etapa.

## Capacidades

- Generación de texto conversacional multi-turno, con etiquetas `conversational` y `text-generation`.
- Escritura y redacción general, incluyendo traducción entre idiomas.
- Razonamiento y tareas de matemáticas y lógica, reforzadas mediante RL según la model card.
- Generación de código y tareas de programación cotidiana.
- Uso de herramientas (tool calling / function calling) y comportamiento agéntico multi-paso, con integración declarada en arneses de agentes como Codex, Claude Code, OpenClaw y Hermes.
- Ventana de contexto nativa de hasta 1 M tokens, adecuada para documentos extensos y sesiones agénticas largas.
- Soporte multilingüe de más de 200 idiomas según el autor.
- Seguimiento de instrucciones y generación estructurada, derivados de la etapa de SFT.
- Despliegue multiplataforma: se declara compatibilidad con hardware NVIDIA, Huawei Ascend, Hygon y HOUMO.AI, y con los frameworks vLLM, SGLang, llama.cpp, MLX, Ollama y LM Studio.
- No se documentan en la información disponible capacidades de visión, audio ni un modo de razonamiento explícito ("thinking mode") separado.

## Casos de uso

- Atención al cliente automatizada: con una ventana nativa de hasta 1 M tokens, el modelo puede mantener el historial completo de una conversación extensa o de un cliente concreto sin truncar el contexto ni recurrir a resúmenes intermedios.
- Análisis de documentación técnica extensa: procesar manuales, normativas o contratos completos en una sola pasada y responder preguntas con referencias al texto original, aprovechando el contexto largo y el soporte multilingüe.
- Asistente de código integrado en el IDE o en CI/CD: generar parches, explicar errores y ejecutar llamadas a herramientas (ejecutar tests, consultar repositorios) dentro de flujos agénticos con Codex o Claude Code.
- Agentes autónomos multi-paso: al soportar tool calling y estar integrado con arneses de agentes, es adecuado para tareas de investigación, recopilación de datos o automatización de procesos con varios saltos de razonamiento y llamadas a APIs.
- Traducción y localización: con más de 200 idiomas declarados, puede emplearse en pipelines de traducción de documentación, soporte multilingüe y generación de contenido localizado.
- Despliegue en el borde o en hardware no NVIDIA: dado el soporte declarado para Ascend, Hygon y HOUMO.AI y para llama.cpp/MLX/Ollama, encaja en entornos con GPU de consumo o aceleradores alternativos donde un modelo mayor no es viable.
- Procesamiento por lotes de bajo coste: con ~4,1 B de parámetros y una arquitectura de atención mayoritariamente local, es apto para clasificación, extracción y resumen de grandes volúmenes de texto con un coste de inferencia contenido.
- Asistentes de escritura y edición: redacción, reescritura y resumen de textos largos manteniendo coherencia sobre documentos que exceden la ventana de modelos de 32 K-128 K.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en formato de texto en la información disponible. La model card referencia dos figuras (`model-benchmark-comparison.svg` y `spark25-hybrid-architecture-light.png`) y menciona que se evaluó el modelo frente a otros modelos on-device de tamaño similar en tareas de agente, código y matemáticas, pero el texto de la model card se interrumpe antes de incluir la tabla de resultados, por lo que las cifras concretas no están disponibles.

| Benchmark | Spark-X2.5-4B | Modelos comparables |
|---|---|---|
| MMLU | no disponible | no disponible |
| HumanEval | no disponible | no disponible |
| GSM8K | no disponible | no disponible |
| Tareas de agente | no disponible (solo se afirma un resultado líder entre modelos de tamaño comparable en la model card) | no disponible |

## Requisitos de hardware

- VRAM estimada para los pesos en precisión completa (bf16/fp16): aproximadamente 8,2 GB, cifra coherente con los 4.112.079.360 parámetros y con el tamaño del repositorio de 8,2 GB.
- VRAM estimada con cuantización de 8 bits: en torno a 4,4 GB; con cuantización de 4 bits: en torno a 2,3-2,5 GB. Estas cifras son estimaciones derivadas del número de parámetros, no datos publicados por el autor (no se documentan cuantizaciones oficiales).
- El KV-cache es el factor dominante a contextos largos. Aunque la arquitectura híbrida con SWA lo reduce frente a la atención densa, no se dispone del número de capas, cabezas ni tamaño de ventana, por lo que no es posible estimar con precisión la memoria necesaria para 1 M tokens.
- GPU recomendadas por categoría: A100/H100 para servir contextos largos o despliegues concurrentes; tarjetas de 24 GB (RTX 4090, RTX 3090) para inferencia en bf16 con contextos moderados; tarjetas de 8-12 GB para cuantización de 4-8 bits.
- Cabe en GPU de consumo: sí, con cuantización de 4-8 bits cabe incluso en GPUs de 8-12 GB, siempre que el contexto se mantenga moderado.
- Aceleradores alternativos declarados: Huawei Ascend, Hygon y HOUMO.AI.
- Opciones de despliegue: vLLM, SGLang, llama.cpp, MLX, Ollama y LM Studio para inferencia; LLaMA-Factory para ajuste fino.
- Latencia y throughput: no disponibles. La model card afirma mejoras en TTFT y TOPT frente a modelos de tamaño similar en varias plataformas, pero sin cifras publicadas.
- Requisito de carga: al usar código personalizado, la carga en transformers necesita `trust_remote_code=True`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto nativo | Licencia | Disponibilidad |
|---|---|---|---|---|
| Spark-X2.5-4B | ~4,1 B | Hasta 1 M tokens (declarado) | Apache 2.0 | Pesos en safetensors; 0 descargas y 0 likes en el repositorio consultado |
| Qwen3-4B | ~4 B | 32.768 tokens (ampliable a 131.072 con YaRN) | Apache 2.0 | Ampliamente distribuido, con variantes GGUF y cuantizaciones |
| Llama-3.2-3B | ~3,2 B | 128.000 tokens | Licencia comunitaria de Llama 3.2 | Ampliamente distribuido |
| Gemma-3-4B | ~4 B | 128.000 tokens | Términos de uso de Gemma | Ampliamente distribuido |
| Phi-4-mini | ~3,8 B | 128.000 tokens | MIT | Ampliamente distribuido |

La ventaja declarada de Spark-X2.5-4B es la ventana de contexto, muy superior a la de sus competidores directos de tamaño. La comparación de rendimiento en benchmarks no está disponible, ya que el autor no publica las cifras en texto y no existen evaluaciones independientes de este repositorio.

## Limitaciones y advertencias

- Repositorio sin tracción ni validación: 0 descargas y 0 likes, y se trata de una subida de un tercero (qikuanz) sobre pesos de XHToken. No hay evaluaciones independientes que confirmen las capacidades declaradas.
- Ausencia de datos verificables de rendimiento: las cifras de benchmarks solo existen, si acaso, en imágenes SVG referenciadas en la model card, no en texto, por lo que no pueden comprobarse.
- Código personalizado: el tag `custom_code` implica que la implementación de la arquitectura híbrida no es estándar en transformers y exige `trust_remote_code=True`, con el riesgo de seguridad que conlleva ejecutar código del repositorio.
- Riesgo de alucinación: no se documentan tasas de alucinación ni se han publicado evaluaciones de fidelidad; como en cualquier LLM de 4 B, es esperable que invente hechos en tareas de conocimiento factual.
- Discrepancia entre contexto declarado y coste real: aunque la ventana nativa sea de 1 M tokens, el rendimiento efectivo y la memoria de KV-cache a esas longitudes no están documentados ni verificados.
- Idiomas: la model card declara más de 200 idiomas, pero el campo de idiomas de HuggingFace está vacío y no se detalla la cobertura real por idioma ni la calidad relativa en cada uno.
- Sesgos: no se publica ninguna sección de sesgos, composición del dataset ni mitigaciones; el corpus incluye datos web a gran escala, con los sesgos habituales de ese origen.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero conviene verificar los términos del modelo base XHToken/Spark-X2.5-4B-Base y de los datos de entrenamiento, no detallados.
- Preparación para producción: no hay información sobre estabilidad en serving, latencia medida, soporte de cuantizaciones oficiales ni garantías de mantenimiento del repositorio.
- Metadatos llamativos: la fecha de creación registrada (2026-09-15) y la falta de documentación de versiones dificultan el control de cambios en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qikuanz/Spark-X2.5-4B
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B-Base
- Slack del proyecto: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord: https://discord.gg/kTDE2Hg8aw
- YouTube: https://www.youtube.com/@SparkLLM
- dev.to: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- X: https://x.com/sparkllm
- Zhihu: https://www.zhihu.com/people/zhiikz7qh7m
- Paper, repositorio de código y demo: no disponibles en la información proporcionada.
- Las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los resultados obtenidos correspondían a foros sin relación con el proyecto.
