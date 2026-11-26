# ai-sage/GigaChat4-708B-A41B-base

## Resumen

GigaChat 4 es el modelo insignia de la familia GigaChat, desarrollado por ai-sage (equipo vinculado a Salute Developers, el brazo tecnológico de Sber). Se trata de un modelo de lenguaje de arquitectura híbrida que combina un esqueleto de tipo Mixture-of-Experts (MoE) con atención dispersa DeepSeek Sparse Attention (DSA) y capas Gated DeltaNet (GDN). Cuenta con 708.000 millones de parámetros totales y 41.000 millones de parámetros activos por token, lo que lo sitúa en la liga de los grandes modelos abiertos de tipo MoE.

El modelo resuelve el problema de unificar en un único checkpoint los modos de respuesta instantánea y de razonamiento, que en la generación anterior (GigaChat 3.5) estaban separados en checkpoints distintos. Además, incorpora una ventana de contexto de 1.048.576 tokens, decodificación especulativa mediante MTP recurrente o un drafter DFlash2 independiente, y soporte multilingüe centrado en ruso e inglés. Es relevante ahora porque combina contexto extremo, eficiencia de cómputo por token (41B activos) y licencia MIT, algo poco habitual en modelos de esta escala.

Este repositorio concreto contiene el modelo base en BF16, entrenado pero sin ajuste de instrucciones. Para conversación, tool calling y selección de modo instantáneo/razonamiento por petición debe usarse la variante instruction-tuned.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido con MLA + DeepSeek Sparse Attention (DSA) y Gated DeltaNet (GDN) en proporción 3:1 |
| Parametros totales | 710.235.315.584 (708B) |
| Parametros activos | 41B por token |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | BF16 (este repo); FP8 y GGUF en las variantes instruction-tuned |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16), con código personalizado (custom_code) |
| Capas del decodificador / hidden size | 64 / 7.168 |
| Capas de atención lineal / atención dispersa | 48 / 16 |
| Expertos enrutados / activos / compartidos | 256 / 8 / 1 |
| Capas iniciales con FFN densa | 3 |
| Tokens DSA seleccionados por query | 2.048 |
| Capas MTP integradas | 1, reutilizada de forma recurrente |
| Tamaño del repositorio | 1.420,5 GB |

## Arquitectura y entrenamiento

GigaChat 4 es un transformer MoE que intercala capas de GatedDeltaNet y de DeepSeek Sparse Attention en una proporción 3:1. GatedDeltaNet mantiene un estado recurrente de tamaño fijo para procesar de forma eficiente secuencias largas, mientras que las capas DSA atienden selectivamente a 2.048 tokens anteriores por consulta, lo que permite recuperar información de contextos de hasta un millón de tokens sin el coste cuadrático de la atención completa. Cada capa MoE combina un bloque de atención con expertos compartidos y enrutados: se seleccionan 8 de 256 expertos por token, más un experto compartido, y se aplica GatedNorm a las salidas del bloque antes de la suma residual. Las tres primeras capas del decodificador usan FFN densas.

La ventana de contexto se extendió de forma progresiva desde 32K hasta 128K y finalmente hasta 1M tokens. DSA se introdujo a 128K mediante entrenamiento solo del indexer, seguido de una optimización conjunta del indexer y del esqueleto a 1M tokens. Para la estabilidad del preentrenamiento a escala se emplearon técnicas como el calentamiento residual progresivo (ProRes), z-loss específico por proyección con softcapping de logits y reescalado dinámico de la tasa de aprendizaje (DLR) para bloques MoE con desequilibrio persistente de carga de expertos. Tras el ajuste supervisado, se entrenaron modelos expertos con RL en matemáticas, código, uso de herramientas y flujos agénticos multiturno, que se consolidaron en un único modelo mediante destilación on-policy multi-profesor con optimizador Muon.

La decodificación especulativa se apoya en dos mecanismos: un MTP recurrente de estilo EAGLE-3 que reutiliza una sola capa de predicción entre pasos de borrador (reduciendo el número de parámetros del drafter unas 3 veces respecto a GigaChat 3.5 sin perder calidad), y DFlash2, un drafter independiente de cinco capas en BF16 que predice tokens en paralelo usando bloques de ocho posiciones (un token ancla y siete de borrador).

## Capacidades

- Generación de texto y conversación multilingüe en ruso e inglés.
- Razonamiento matemático y resolución de problemas de varios pasos.
- Generación y comprensión de código.
- Tool calling y function calling (en la variante instruction-tuned).
- Flujos agénticos multiturno y razonamiento multi-paso.
- Salidas estructuradas.
- Preguntas y respuestas sobre documentos largos gracias a la ventana de 1M tokens.
- Doble modo instantáneo y de razonamiento seleccionable por petición (en la variante instruction-tuned; este checkpoint base no incluye el formato conversacional).
- Decodificación especulativa con MTP recurrente o drafter DFlash2 para acelerar la generación.

## Casos de uso

- Atención al cliente automatizada: la variante instruction-tuned puede gestionar conversaciones multiturno con contexto muy largo gracias a su ventana de 1M tokens, manteniendo el hilo de interacciones extensas sin truncar el historial.
- Análisis de documentos extensos: resumen y extracción de información sobre contratos, informes o expedientes de cientos de miles de tokens, apoyándose en las capas DSA para recuperar pasajes concretos.
- Generación de código en producción: con tool calling y salidas estructuradas, puede integrarse en pipelines de CI/CD para revisión de código, generación de tests o parcheo automatizado.
- Agentes autónomos multiturno: su entrenamiento en flujos agénticos y uso de herramientas lo hace adecuado para orquestar tareas de varios pasos con llamadas a APIs.
- Razonamiento matemático asistido: el modo de razonamiento permite resolver problemas de varios pasos con trazas intermedias, útil en herramientas educativas o de análisis financiero.
- Búsqueda y QA sobre corpus en ruso e inglés: su soporte nativo de ambos idiomas y el contexto largo permiten construir sistemas de preguntas y respuestas sobre bases documentales bilingües.
- Preentrenamiento y ajuste fino: este checkpoint base en BF16 sirve como punto de partida para fine-tuning específico de dominio antes de aplicar la alineación conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona tablas de evaluación, pero los valores no se incluyen en los datos proporcionados; deben consultarse en el technical report enlazado.

## Requisitos de hardware

- VRAM estimada: el checkpoint base en BF16 ocupa aproximadamente 1,4 TB de pesos (tamaño del repo de 1.420,5 GB), por lo que la inferencia en BF16 requiere varios nodos multi-GPU. Las variantes FP8 y GGUF reducen sustancialmente el requisito, aunque no se dispone de cifras exactas en la información proporcionada.
- GPU recomendadas: para BF16 se necesitan clústeres con GPUs de memoria alta (H100 80 GB, H200, A100 80 GB) repartidas entre varios nodos; para FP8, configuraciones multi-GPU equivalentes con menor huella.
- GPU de consumo: no cabe en GPUs de consumo (RTX 4090, 24 GB) en BF16 ni en FP8; solo las variantes GGUF fuertemente cuantizadas podrían plantear despliegues parciales, sin datos confirmados de viabilidad.
- Opciones de despliegue: SGLang (hay cookbook específico para GigaChat 4), llama.cpp/Ollama para las variantes GGUF, y frameworks compatibles con MoE y custom_code.
- Latencia y throughput: no disponibles. La decodificación especulativa (MTP recurrente o DFlash2) está diseñada para acelerar la generación autoregresiva verificando varios tokens de borrador en un solo forward pass.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GigaChat4-708B-A41B-base | 708B / 41B | 1.048.576 | MIT | Hugging Face (base, FP8, BF16, GGUF, checkpoints) |
| Alternativas de escala comparable | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos comparables de la misma categoría para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Este repositorio es el modelo base: no está ajustado para instrucciones ni para conversación; requiere prompts de texto en bruto y no soporta tool calling ni selección de modo por petición.
- Idiomas soportados limitados a ruso e inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación inherente a los modelos generativos, agravado en contextos muy largos si la recuperación vía DSA no localiza el pasaje relevante.
- Sesgos potenciales derivados de los datos de preentrenamiento y del ajuste con RL, no documentados en la información disponible.
- Aunque la licencia es MIT, conviene verificar las condiciones de uso comercial y las obligaciones de atribución en la documentación oficial antes de desplegar en producción.
- El tamaño del checkpoint (1,4 TB en BF16) impone requisitos de infraestructura muy elevados; el despliegue en entornos modestos exige cuantización, con posible pérdida de calidad no cuantificada.
- El uso de custom_code implica dependencia de implementaciones específicas del autor; deben auditarse antes de integrarlas en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-sage/GigaChat4-708B-A41B-base
- Variante instruction-tuned FP8: https://huggingface.co/ai-sage/GigaChat4-708B-A41B
- Variante instruction-tuned BF16: https://huggingface.co/ai-sage/GigaChat4-708B-A41B-bf16
- Variante GGUF: https://huggingface.co/ai-sage/GigaChat4-708B-A41B-GGUF
- Checkpoints intermedios: https://huggingface.co/ai-sage/GigaChat4-708B-A41B-checkpoints
- Colección GigaChat 4: https://huggingface.co/collections/ai-sage/gigachat-4
- Technical report: https://github.com/salute-developers/gigachat4/blob/main/GigaChat_4.pdf
- Blog: https://giga.chat/blog/en
- Repositorio GitHub: https://github.com/salute-developers/gigachat4
- SGLang Cookbook: https://docs.sglang.io/cookbook/autoregressive/GigaChat/GigaChat4
