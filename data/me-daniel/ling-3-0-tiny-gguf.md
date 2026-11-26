# Me-Daniel/Ling-3.0-tiny-GGUF

## Resumen

Ling-3.0-tiny-GGUF es una cuantización en formato GGUF del modelo Ling-3.0-tiny desarrollado por inclusionAI, publicada por el usuario Me-Daniel. El modelo base es un transformer de 7.893.392.800 parámetros (aproximadamente 7,9 mil millones) que combina dos mecanismos de atención: 18 capas con Kimi Delta Attention (KDA) y 6 capas con gated MLA (Multi-head Latent Attention), sumando 24 capas en total. La cuantización se ha optimizado para ocupar unos 3 GB manteniendo la mayor fidelidad posible respecto al modelo original en BF16.

El interés de esta publicación no reside en el modelo base, sino en la metodología de cuantización aplicada: el autor utiliza un mapa de sensibilidad medido por componentes para asignar más bits a las partes que más degradan la salida (atención y experto compartido) y menos a los expertos enrutados, que toleran mejor la compresión. Además, incorpora un refinador que reajusta los códigos de baja precisión de los pesos de los expertos para acercar sus salidas a las del modelo original sin aumentar el tamaño ni reducir la velocidad.

Esta ficha es relevante para desarrolladores que necesiten ejecutar un modelo de ~8B parámetros en hardware con recursos limitados (aproximadamente 3 GB de pesos) manteniendo una calidad cercana al BF16, especialmente en contextos de generación de texto, código y llamadas a herramientas. La licencia MIT facilita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con 24 capas: 18 capas con Kimi Delta Attention (KDA) y 6 capas con gated MLA; mezcla de expertos (MoE) con expertos enrutados y un experto compartido |
| Parámetros totales | 7.893.392.800 (~7,9B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (la model card menciona pruebas con contexto de 4K en "long books") |
| Tipos de cuantización | IQ3_XXS con códigos refinados (3,12 GB); se recomienda también Q4_K_M (~4,8 GB) si hay espacio |
| Idiomas soportados | no disponible (los conjuntos de evaluación incluyen chino, código y llamadas a herramientas) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Ling-3.0-tiny emplea una arquitectura transformer de 24 capas que combina dos tipos de atención: 18 capas con Kimi Delta Attention (KDA) y 6 capas con gated MLA. La presencia de expertos enrutados y un experto compartido indica una estructura de mezcla de expertos (MoE). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

La innovación técnica destacable de esta publicación es el proceso de cuantización. El autor cuantizó cada componente del modelo por separado y midió el daño en términos de divergencia KL respecto al BF16, descubriendo que los expertos enrutados toleran mejor la baja precisión por GB ahorrado, mientras que la atención y el experto compartido son más sensibles. Por ello, los expertos se mantienen en IQ3_XXS y el espacio ahorrado se destina a la atención. Adicionalmente, un refinador reajusta los códigos de baja precisión de los pesos de los expertos para que sus salidas se aproximen más a las del modelo original, logrando una reducción de KL del 12-13% sin coste en tamaño ni velocidad. Los expertos enrutados con códigos refinados constituyen el 86% de los pesos.

## Capacidades

- Generación de texto conversacional y general, con ajustes recomendados de temperatura 1.0, top-p 0.95 y top-k 20.
- Razonamiento y respuesta a instrucciones, según el pipeline de text-generation.
- Generación de código: evaluado en un conjunto específico de código con KL de 0.15 frente a BF16.
- Soporte de llamadas a herramientas (tool calls): evaluado con KL de 0.46 frente al modelo original.
- Procesamiento de contexto largo: evaluado en "long books" con contexto de 4K, con KL de 0.12.
- Capacidades multilingües: el conjunto de evaluación incluye chino, aunque no se detalla la lista completa de idiomas.
- Compatible con endpoints (tag `endpoints_compatible`) y con el ecosistema llama.cpp mediante `--jinja` para plantillas de chat.

## Casos de uso

- Despliegue en hardware de gama consumer: con 3,12 GB de pesos, el modelo cabe en GPUs con 4-6 GB de VRAM o en sistemas Apple Silicon con memoria unificada, permitiendo inferencia local sin GPU dedicada de gama alta.
- Asistente conversacional local: la ventana de contexto (al menos 4K probados) y la fidelidad en conversación lo hacen adecuado para chatbots multi-turno ejecutados en portátiles o mini-PC.
- Generación de código asistida en entornos con recursos limitados: la baja degradación en el conjunto de código (KL 0.15) lo hace viable para autocompletado y generación de fragmentos en IDE sin conexión a la nube.
- Integración en pipelines de agentes con tool calling: el soporte de llamadas a herramientas y la compatibilidad con llama-server permiten montar agentes que consulten APIs o ejecuten acciones, con la salvedad de que la fidelidad en tool calls es menor (KL 0.46) que en otros dominios.
- Procesamiento de documentos largos: con contexto de 4K verificado y baja degradación en "long books" (KL 0.12), puede resumir o extraer información de artículos y libros en entornos con poca memoria.
- Prototipado e investigación en cuantización: el repositorio y el código publicados permiten reproducir la metodología de mapa de sensibilidad y refinado de códigos para otros modelos.
- Servicio de inferencia ligero con llama-server: el binario `llama-server` con `-ngl 99` permite exponer el modelo como API compatible con endpoints en una máquina modesta.

## Benchmarks y rendimiento

| Métrica | Este archivo (IQ3_XXS refinado) | bloomer010 IQ3_XXS | bartowski Q2_K_L |
|---|---|---|---|
| Tamaño | 3,12 GB | 3,13 GB | 3,24 GB |
| KL vs BF16, chino | 0,33 | 0,41 | 0,41 |
| KL vs BF16, código | 0,15 | 0,25 | 0,22 |
| KL vs BF16, tool calls | 0,46 | 0,58 | 0,61 |
| KL vs BF16, libros largos (4K) | 0,12 | 0,23 | 0,25 |
| Concordancia top-1 con BF16 | 75-89% | 72-86% | 72-87% |
| HellaSwag (1.000 tareas) | 55,9% | 55,1% | 54,5% |

Velocidad medida en un Mac con M5 Pro (Metal): aproximadamente 81-87 tokens/s de generación para los tres archivos, sin diferencias significativas atribuibles al refinado. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5-4 GB para el archivo IQ3_XXS de 3,12 GB, incluyendo overhead de contexto y caché KV.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; funciona en Apple Silicon con Metal (probado en M5 Pro), y en GPUs consumer como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU consumer: sí, en modelos con 6 GB o más de VRAM; también en sistemas con memoria unificada.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y por extensión cualquier frontend compatible con GGUF (Ollama, LM Studio, text-generation-webui). No se menciona soporte verificado para vLLM o TGI.
- Latencia y throughput: ~81-87 tokens/s de generación en M5 Pro con Metal; no se dispone de datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tamaño del archivo | Licencia | Notas |
|---|---|---|---|---|---|
| Ling-3.0-tiny-GGUF (este) | ~7,9B | no disponible (4K probados) | 3,12 GB (IQ3_XXS refinado) | MIT | Menor KL en todos los conjuntos evaluados |
| bloomer010 IQ3_XXS (Ling-3.0-tiny) | ~7,9B | no disponible | 3,13 GB | MIT | Peor KL en chino, código, tool calls y libros largos |
| bartowski Q2_K_L (Ling-3.0-tiny) | ~7,9B | no disponible | 3,24 GB | MIT | Peor KL en todos los conjuntos; mayor tamaño |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La métrica principal es la divergencia KL respecto al BF16, que mide fidelidad al original pero no calidad absoluta; las diferencias de uno o dos puntos en HellaSwag están dentro de la incertidumbre de la prueba.
- El modelo solo se ha probado en un Mac con una versión concreta de llama.cpp; el comportamiento en otras plataformas (CUDA, ROCm) no está verificado.
- La fidelidad en tool calls es la más baja de los dominios evaluados (KL 0,46), por lo que puede producir llamadas a herramientas menos precisas que el modelo original.
- No se detalla la lista completa de idiomas soportados; la evaluación multilingüe se limita al chino.
- Riesgo de alucinación inherente a los modelos de lenguaje de ~8B, no cuantificado en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- La licencia MIT permite uso comercial, pero al ser una cuantización de un modelo de inclusionAI, conviene verificar que la licencia del modelo base también sea compatible (la model card indica que el original es MIT).
- El autor indica que las comprobaciones de repetición en generaciones largas están pendientes; solo se ha realizado una primera prueba sin bucles en chats de prueba.

## Enlaces

- Hugging Face: https://huggingface.co/Me-Daniel/Ling-3.0-tiny-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Repositorio GitHub con código y mediciones: https://github.com/me-daniel/ling-3.0-tiny-quant
