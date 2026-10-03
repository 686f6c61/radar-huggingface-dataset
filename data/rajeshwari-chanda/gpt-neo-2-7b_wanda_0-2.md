# Rajeshwari-Chanda/gpt-neo-2.7B_wanda_0.2

## Resumen

Rajeshwari-Chanda/gpt-neo-2.7B_wanda_0.2 es un checkpoint derivado de EleutherAI/gpt-neo-2.7B, el transformer decoder-only de 2.700 millones de parámetros que EleutherAI publicó en marzo de 2021 como réplica abierta de la arquitectura GPT-3 y entrenado sobre el dataset The Pile. El repositorio no incluye una model card real: la que aparece en el Hub es la plantilla autogenerada por transformers, con todos los campos marcados como "[More Information Needed]".

El sufijo del identificador, wanda_0.2, apunta a que sobre el modelo base se ha aplicado poda con el método Wanda (pruning guiado por el producto de la magnitud del peso y la activación de entrada), con un valor 0,2 que en la nomenclatura habitual del método corresponde a la tasa de sparsity. Sin embargo, ni la model card ni los metadatos del Hub confirman ese valor, ni si la poda es no estructurada o estructurada 2:4, ni si hubo ajuste fino posterior.

El dato objetivo más sólido es el recuento de parámetros en safetensors: 2.651.307.520, idéntico al esperado del modelo denso original, lo que es coherente con una poda que introduce máscaras de ceros pero conserva la forma de los tensores. El repositorio ocupa 5,3 GB. Con 0 descargas y 0 likes en el momento de la consulta, se trata de un artefacto de investigación sin validación por parte de la comunidad, útil sobre todo como material de estudio de técnicas de compresión de modelos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia GPT-Neo, réplica de la arquitectura GPT-3 según EleutherAI); se conserva en el checkpoint podado |
| Parámetros totales | 2.651.307.520 (2,65 B), según safetensors |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2048 tokens heredados del modelo base EleutherAI/gpt-neo-2.7B; no confirmado en la model card del checkpoint |
| Tipos de cuantización | no disponible. El tamaño del repo (5,3 GB) es coherente con pesos almacenados en 16 bits; no se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible. El modelo base se entrenó sobre The Pile, con predominio claro del inglés |
| Licencia | no disponible en el repositorio. El modelo base EleutherAI/gpt-neo-2.7B se distribuye bajo licencia MIT |
| Formato de pesos | safetensors (librería transformers, clase gpt_neo) |
| Tamaño del repositorio | 5,3 GB |
| Pipeline declarado | text-generation |
| Descargas / likes | 0 / 0 en la fecha de consulta |
| Creado / actualizado | 2026-10-03 / 2026-10-03 (fechas declaradas por el Hub) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de GPT-Neo: un transformer decoder-only con atención causal que combina capas de atención global y capas de atención local de ventana reducida (el modelo base usa ventana de 256 tokens en las capas locales), normalización por capas y embeddings de posición aprendidos. La model card del checkpoint no aporta ninguna información sobre entrenamiento, ajuste fino, RLHF o DPO; el tag arxiv:1910.09700 presente en los metadatos corresponde a Lacoste et al. (2019) sobre estimación de emisiones de carbono, no a un artículo técnico del modelo, ya que ese enlace forma parte de la plantilla estándar de model cards de HuggingFace.

La única modificación documentada, y solo de forma indirecta a través del nombre del repositorio, es la aplicación de poda Wanda. Este método puntúa cada peso por el producto entre su valor absoluto y la norma L2 de la activación de entrada correspondiente, calculada sobre un pequeño conjunto de calibración, y elimina los pesos con menor puntuación sin reentrenamiento ni actualización de los pesos restantes. Es un enfoque de poda post-entrenamiento de una sola pasada, más barato computacionalmente que alternativas como SparseGPT, y con resultados competitivos en modelos de la familia GPT. No se especifica en la información disponible qué conjunto de calibración se usó, ni la granularidad de la poda, ni si se aplicaron capas de recuperación de precisión.

## Capacidades

- Generación de texto autoregresiva en inglés, en modo completion, sin plantilla de instrucciones.
- Modelo base sin ajuste por instrucciones ni por preferencias humanas: no sigue instrucciones ni mantiene formato conversacional de forma fiable.
- Razonamiento de sentido común y conocimiento factual limitados y desactualizados (datos de entrenamiento anteriores a 2021).
- Generación de código muy limitada y poco fiable, sin soporte específico de lenguajes de programación.
- Capacidad aritmética y matemática escasa, sin modo de razonamiento extendido.
- No dispone de tool calling ni function calling.
- No dispone de modo agente, planificación multi-paso ni uso de herramientas externas.
- Sin capacidades de visión, audio ni multimodalidad.
- Multilingüismo muy limitado, con sesgo hacia el inglés.
- Capacidad especial relevante: conserva las máscaras de poda, lo que permite estudiar el efecto de la sparsity en la calidad de generación frente al modelo denso.

## Casos de uso

- Investigación en compresión de modelos: el checkpoint permite reproducir y auditar el efecto de la poda Wanda sobre un modelo denso conocido, comparando perplejidad y calidad de generación contra EleutherAI/gpt-neo-2.7B con el mismo prompt y la misma semilla.
- Estudio comparado de métodos de poda: la misma autora publica Rajeshwari-Chanda/OPT-2.7B_SparseGPT_70, lo que permite contrastar Wanda frente a SparseGPT sobre dos arquitecturas distintas con presupuestos de parámetros similares.
- Fine-tuning de dominio vertical: al ser un modelo base sin alineación, se puede ajustar por supervisión sobre un corpus especializado (texto legal, documentación técnica, informes) cuando el objetivo es minimizar coste de inferencia en autohospedaje.
- Generación de texto autohospedada en prototipos: con 5,3 GB de pesos en 16 bits cabe en GPUs de consumo, lo que permite montar un servicio de completion interno sin dependencia de APIs externas.
- Baseline en estudios de eficiencia: sirve como referencia para medir si la sparsity introducida se traduce en latencia menor con kernels específicos (por ejemplo, sparsity estructurada 2:4 sobre A100) o si, por el contrario, no aporta ganancia al ser no estructurada.
- Docencia y experimentación: escenario adecuado para prácticas de carga de safetensors con transformers, inspección de máscaras de poda y análisis de distribución de pesos.
- Análisis de degradación por capas: permite estudiar qué capas del transformer toleran mejor la eliminación de pesos y cómo afecta eso a la perplejidad por bloque.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio es la plantilla autogenerada de transformers y la sección de evaluación figura como "[More Information Needed]". No hay datos de MMLU, HumanEval, GSM8K, LAMBADA ni de perplejidad sobre The Pile, ni para el checkpoint podado ni comparado con el modelo denso original.

## Requisitos de hardware

- VRAM estimada para inferencia, pesos en 16 bits: en torno a 5,3 GB solo para pesos, más overhead de activaciones y caché KV. Presupuesto práctico de 7-8 GB para contexto corto.
- VRAM estimada en fp32: aproximadamente 10,6 GB solo para pesos.
- VRAM estimada con cuantización int8: aproximadamente 2,7 GB. Con cuantización de 4 bits, alrededor de 1,5 GB. Ninguna de estas variantes está publicada; requieren conversión propia con bitsandbytes o llama.cpp.
- Caché KV estimada con la configuración del modelo base (32 capas, 20 cabezas, dimensión de cabeza 128): unos 0,6 GB con los 2048 tokens de contexto completos en 16 bits.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 Ti, RTX 4080 y RTX 4090 en 16 bits. En tarjetas de 8 GB solo con cuantización.
- GPU de centro de datos recomendadas: A10G, L4, L40S, A100 40/80 GB y H100, aunque están sobredimensionadas para este tamaño de modelo.
- Opciones de despliegue: transformers con la clase gpt_neo y safetensors de forma nativa. Para llama.cpp, Ollama o LM Studio hace falta convertir los pesos a GGUF, ya que no se publica ningún GGUF. El soporte de vLLM y TGI para la arquitectura gpt_neo no está confirmado en la información disponible, por lo que conviene verificarlo antes de planificar un despliegue en producción.
- Latencia y throughput: no disponible. No hay datos publicados de tokens por segundo ni de latencia por petición.
- Advertencia de rendimiento: si la poda es no estructurada, el recuento de operaciones no baja y no habrá aceleración real sin kernels específicos, aunque el tamaño en disco y en memoria sí se reduzca.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Rajeshwari-Chanda/gpt-neo-2.7B_wanda_0.2 | 2,65 B (misma forma tensorial que el denso) | 2048 tokens (heredado del base, no confirmado) | no disponible | safetensors en el Hub, 0 descargas |
| EleutherAI/gpt-neo-2.7B | 2,65 B | 2048 tokens | MIT | safetensors, modelo de referencia ampliamente utilizado |
| Rajeshwari-Chanda/OPT-2.7B_SparseGPT_70 | ~2,7 B (base OPT-2,7 B) | 2048 tokens (base OPT) | no disponible | safetensors en el Hub |
| EleutherAI/gpt-j-6B | 6 B | 2048 tokens | Apache 2.0 | safetensors, ampliamente utilizado |
| EleutherAI/pythia-2.8b | ~2,8 B | 2048 tokens | Apache 2.0 | safetensors, con checkpoints intermedios de entrenamiento |

En rendimiento no procede comparación numérica: el checkpoint analizado no publica métricas y no hay evidencia de evaluación en la información disponible. La comparación relevante es metodológica: Wanda frente a SparseGPT sobre arquitecturas distintas, y modelo podado frente a modelo denso con la misma licencia de base.

## Limitaciones y advertencias

- Model card vacía: la documentación del repositorio es la plantilla autogenerada y no describe datos de entrenamiento, calibración, hiperparámetros de poda ni evaluación.
- Licencia no declarada: no se puede confirmar el uso comercial del checkpoint. El modelo base es MIT, pero el repositorio derivado no especifica términos propios.
- Riesgo elevado de alucinación: es un modelo base de 2021 sin alineación por RLHF ni DPO, con conocimiento factual desactualizado y sin mecanismos de rechazo de peticiones dañinas.
- Sesgos esperables: los derivados de The Pile, con sobrerrepresentación de texto en inglés de foros, webs y repositorios, y con sesgos de género, raza y religión documentados en modelos de esa generación.
- Limitación idiomática: el soporte real de castellano es bajo y no verificado. No se declaran idiomas en el Hub.
- Degradación por poda no cuantificada: no hay datos de perplejidad ni de benchmarks que indiquen cuánto empeora el modelo respecto al denso original con una sparsity de 0,2.
- Ambigüedad de la nomenclatura: no se confirma si 0,2 es la tasa de sparsity global, por capa o por tipo de capa, ni si la poda es no estructurada o 2:4.
- Sin ganancia de latencia garantizada: la poda no estructurada no acelera la inferencia en hardware estándar sin kernels dedicados.
- Sin ecosistema de despliegue: no hay GGUF, AWQ, GPTQ ni integración confirmada en vLLM o TGI.
- Sin validación comunitaria: 0 descargas y 0 likes implican ausencia de pruebas independientes de reproducibilidad.
- Cita bibliográfica ausente: el tag arxiv:1910.09700 corresponde al cálculo de impacto ambiental de Lacoste et al. (2019) y no a un artículo del modelo; cualquier referencia técnica debería apoyarse en la documentación de GPT-Neo y en el artículo de Wanda.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rajeshwari-Chanda/gpt-neo-2.7B_wanda_0.2
- Página del autor en HuggingFace: https://huggingface.co/Rajeshwari-Chanda/models
- Modelo relacionado del mismo autor (SparseGPT sobre OPT): https://huggingface.co/Rajeshwari-Chanda/OPT-2.7B_SparseGPT_70
- Modelo base: https://huggingface.co/EleutherAI/gpt-neo-2.7B
- Ficha informativa del modelo base en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/gpt-neo-27b-eleutherai
- Ficha del modelo base en Inferix: https://inferix.co/models/EleutherAI/gpt-neo-2.7B
- Descripción del modelo base orientada a automatización de operaciones: https://llm.co/llms/gpt-neo-2-7b
- Artículo citado en los tags del repositorio (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
