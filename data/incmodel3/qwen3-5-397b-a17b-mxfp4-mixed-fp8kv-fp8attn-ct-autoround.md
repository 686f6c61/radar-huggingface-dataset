# INCModel3/Qwen3.5-397B-A17B-MXFP4-Mixed-FP8KV-FP8Attn-CT-AutoRound

## Resumen

El modelo `INCModel3/Qwen3.5-397B-A17B-MXFP4-Mixed-FP8KV-FP8Attn-CT-AutoRound` es una versión cuantizada del modelo Qwen3.5-397B-A17B, un modelo de lenguaje multimodal (visión y texto) de la serie Qwen3.5 desarrollado por Alibaba Qwen. Esta variante concreta ha sido generada por INCModel3 utilizando la herramienta `auto-round` de Intel, que aplica una cuantización MXFP4 mixta con caché KV y atención en FP8, manteniendo un rendimiento muy cercano al modelo original en BF16 (99,75 % de media relativa en los benchmarks reportados).

El modelo original Qwen3.5-397B-A17B es un modelo de arquitectura híbrida que combina atención lineal con mezcla de expertos (MoE) dispersa, con 397 mil millones de parámetros totales y 17 mil millones activos. Está diseñado para tareas de comprensión del lenguaje, razonamiento lógico, generación de código y capacidades de agente, además de procesamiento de imágenes. La versión cuantizada aquí descrita reduce significativamente los requisitos de memoria y acelera la inferencia, lo que la hace viable para despliegues con GPUs de gama alta o múltiples GPUs.

La relevancia de este modelo radica en que ofrece una alternativa eficiente y de código abierto (licencia Apache 2.0) para aplicaciones de producción que requieren un modelo de gran tamaño con capacidades multimodales, sin sacrificar demasiado rendimiento respecto al original. El formato de pesos es `safetensors` con cuantización MXFP4, y es compatible con `transformers` y `vLLM`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención lineal + mezcla de expertos (MoE) dispersa, con componente de visión (VLM) |
| Parametros totales | 397 mil millones (397B) |
| Parametros activos | 17 mil millones (17B) (MoE) |
| Longitud de contexto | 131072 tokens (según comando de ejemplo en la model card) |
| Tipos de cuantizacion | MXFP4 (pesos de expertos), FP8 (caché KV y atención), cuantización mixta |
| Idiomas soportados | No disponible (la model card no especifica idiomas; el modelo original Qwen3.5 soporta multilingüe, pero no se confirma en esta variante) |
| Licencia | Apache 2.0 (heredada del modelo original Qwen3.5-397B-A17B) |
| Formato de pesos | safetensors (con formato `llm_compressor` de Intel) |

## Arquitectura y entrenamiento

La arquitectura base es la del modelo Qwen3.5-397B-A17B, que combina un mecanismo de atención lineal con un diseño de mezcla de expertos dispersa. Esto permite una mayor eficiencia en inferencia en comparación con arquitecturas transformer densas de tamaño similar, ya que solo se activan 17 mil millones de parámetros por token. El modelo es nativamente multimodal (imagen y texto), con un codificador visual integrado.

La cuantización aplicada en esta variante se realiza mediante la herramienta `auto-round` de Intel, que utiliza un método de redondeo optimizado mediante descenso de gradiente con signo (Signed Gradient Descent) para minimizar la pérdida de precisión. En concreto, se aplica un esquema MXFP4 (microscaling floating point de 4 bits) a las capas de expertos del MoE, mientras que las capas de atención y la caché KV se mantienen en FP8. Las capas de visión, embeddings, y ciertas partes del modelo se excluyen de la cuantización (`ignore_layers`). El proceso de cuantización se realiza con 0 iteraciones de ajuste (`--iters 0`), lo que indica que es una cuantización post-entrenamiento sin calibración adicional.

No se dispone de información detallada sobre el entrenamiento del modelo original (datos, tokens, técnicas de RLHF/DPO). La model card solo menciona el proceso de cuantización.

## Capacidades

- Generación de texto y razonamiento: el modelo mantiene un rendimiento cercano al BF16 en tareas como GSM8K (matemáticas) y MMLU (conocimiento general).
- Comprensión de lenguaje natural y razonamiento lógico: según la documentación de Alibaba Cloud, el modelo original destaca en estas áreas.
- Generación de código: soportada por el modelo original, aunque no se reportan benchmarks específicos en esta variante.
- Capacidades multimodales (visión y texto): el pipeline es `image-text-to-text`, lo que permite procesar imágenes como entrada y generar texto.
- Soporte de agentes y multi-step reasoning: el modelo original está diseñado para tareas de agente, según la documentación de Alibaba Cloud.
- Soporte de tool calling / function calling: no se confirma explícitamente en la información proporcionada, pero es una característica habitual en la serie Qwen3.5.
- Modo de pensamiento (thinking mode): el ejemplo de uso en la model card incluye `enable_thinking: true`, lo que sugiere soporte para razonamiento explícito antes de responder.

## Casos de uso

- Asistentes virtuales con razonamiento avanzado: el modelo puede gestionar conversaciones complejas con contexto largo (hasta 131072 tokens), lo que permite mantener historiales extensos y razonar sobre información previa. Es adecuado para asistentes de soporte técnico o consultoría.
- Análisis de documentos con imágenes: gracias a su capacidad multimodal, puede procesar capturas de pantalla, diagramas o imágenes de documentos y generar resúmenes o responder preguntas sobre ellos. Esto es útil en entornos legales, médicos o de investigación.
- Generación de código en producción: con soporte para generación de código y razonamiento, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar fragmentos de código. La cuantización MXFP4 reduce la latencia y el coste de inferencia, facilitando su despliegue en entornos con GPUs limitadas.
- Razonamiento matemático y resolución de problemas: el modelo mantiene un alto rendimiento en GSM8K (97,35 % en MXFP4), por lo que es adecuado para aplicaciones educativas, tutoría automatizada o herramientas de cálculo avanzado.
- Agentes autónomos con visión: al combinar visión y texto, puede actuar como un agente que interpreta interfaces gráficas, lee formularios o analiza imágenes para tomar decisiones o ejecutar tareas. La arquitectura MoE con 17B activos permite una inferencia relativamente eficiente para un modelo de este tamaño.
- Despliegue de modelos de gran tamaño en entornos empresariales: la cuantización MXFP4 reduce el footprint de memoria (231,7 GB en el repositorio), lo que permite ejecutar el modelo en configuraciones de 4 GPUs con tensor parallelism (como se muestra en el ejemplo de vLLM), siendo viable para empresas que necesitan capacidades de nivel frontier sin los costes de los modelos propietarios.

## Benchmarks y rendimiento

La model card proporciona resultados de benchmarks comparando la versión BF16 original con la versión MXFP4 cuantizada:

| Configuracion | GSM8K | MMLU | PIQA | HelleSwag | Media | Relativa a BF16 |
|---|---|---|---|---|---|---|
| BF16 | 0,9765 | 0,8856 | 0,8303 | 0,7423 | 0,858675 | - |
| MXFP4 | 0,9735 | 0,8824 | 0,8357 | 0,7346 | 0,856550 | 99,75 % |

La degradación media es de solo un 0,25 % respecto al modelo en BF16, con una ligera mejora en PIQA (de 0,8303 a 0,8357) y una pérdida mínima en los demás conjuntos. No se proporcionan comparaciones con otros modelos similares en esta model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 231,7 GB en disco. Con cuantización MXFP4, el modelo en memoria puede caber en configuraciones de 4 GPUs con 80 GB cada una (por ejemplo, 4x A100/H100 80GB) usando tensor parallelism. El ejemplo de vLLM utiliza `--tensor-parallel-size 4`.
- GPU recomendadas: A100 80GB, H100 80GB o similares. No es viable en GPUs de consumo (RTX 4090, 3090, etc.) debido al tamaño total del modelo, incluso cuantizado.
- Opciones de despliegue: vLLM (recomendado en la model card), también compatible con `transformers` y el formato `llm_compressor` de Intel. No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no se proporcionan datos específicos. La cuantización MXFP4 y la caché KV en FP8 reducen el uso de memoria y pueden mejorar el throughput en comparación con BF16, pero no hay cifras concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente esta variante cuantizada con otras alternativas. El modelo original Qwen3.5-397B-A17B compite con otros modelos MoE de gran tamaño como DeepSeek-V3 o Llama 4, pero no hay datos de benchmarks comparativos en la información proporcionada. Se puede indicar que la licencia Apache 2.0 es más permisiva que la de algunos competidores, pero no se pueden dar cifras concretas.

## Limitaciones y advertencias

- Sesgos conocidos: la model card advierte que el modelo puede generar contenido ofensivo, sesgado o inapropiado debido a las limitaciones del modelo preentrenado y los datos de ajuste. Se recomienda realizar pruebas de seguridad antes de desplegar en producción.
- Riesgo de alucinación: la model card indica explícitamente que el modelo puede producir salidas factualmente incorrectas y no debe utilizarse como fuente de información veraz.
- Limitaciones de contexto e idioma: aunque el contexto es de 131072 tokens, no se especifican los idiomas soportados en esta variante. El modelo original es multilingüe, pero no se confirma.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero la model card incluye un descargo de responsabilidad indicando que la licencia no constituye asesoramiento legal y que se debe consultar a un abogado antes de usar el modelo con fines comerciales.
- Caveat de producción: la cuantización MXFP4 puede introducir una ligera degradación en tareas de razonamiento complejo o en dominios especializados no cubiertos por los benchmarks reportados. Se recomienda validar en el caso de uso específico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/INCModel3/Qwen3.5-397B-A17B-MXFP4-Mixed-FP8KV-FP8Attn-CT-AutoRound
- Modelo original Qwen3.5-397B-A17B: https://huggingface.co/Qwen/Qwen3.5-397B-A17B
- Repositorio de auto-round (Intel): https://github.com/intel/auto-round
- Paper de auto-round (arXiv): https://arxiv.org/abs/2309.05516
- Página de Qwen3.5 en HuggingFace (colección): https://huggingface.co/collections/Qwen/qwen35
- Documentación de Alibaba Cloud sobre Qwen3.5-397B-A17B: https://www.alibabacloud.com/help/en/model-studio/qwen3-5-397b-a17b
- Blog de DataCamp sobre Qwen3.5: https://www.datacamp.com/blog/qwen3-5
- Versión de AMD del mismo modelo cuantizado: https://huggingface.co/amd/Qwen3.5-397B-A17B-MXFP4
- Página de NVIDIA NIM para Qwen3.5-397B-A17B: https://build.nvidia.com/qwen/qwen3.5-397b-a17b
