# rdtand/Qwen3.8-27B-PrismaScout-AQUA-Vision-20GB

## Resumen

El modelo `rdtand/Qwen3.8-27B-PrismaScout-AQUA-Vision-20GB` es una cuantización del modelo multimodal Qwen3.8-27B de Alibaba, desarrollada por el usuario rdtand. El objetivo es comprimir el checkpoint original de 27B parámetros en un artefacto de exactamente 20 GB (límite de 20.000.000.000 bytes), manteniendo las capacidades de visión, video, generación de texto y el head de multi-token prediction (MTP). La compresión utiliza la metodología PrismaQuant con una asignación mixta de precisión por capa lineal: NVFP4 (4 bits), FP8 E4M3 (8 bits) y BF16, calibrada mediante métricas de daño AURA y costes de activación.

El resultado es un checkpoint nativo de `compressed-tensors` que se ejecuta directamente en vLLM sin necesidad de forks ni plugins personalizados. El tamaño final del artefacto es de 19.978.899.058 bytes (18,6068 GiB), con una tasa de 5,0737 bits por parámetro cuantizable en el cuerpo de lenguaje. Este modelo es relevante porque permite desplegar un modelo multimodal de 27B en hardware con VRAM limitada (por ejemplo, GPUs consumer de 24 GB) sin sacrificar las capacidades de razonamiento, visión y decodificación especulativa del modelo original.

La cuantización se ha validado con métricas de fidelidad frente al modelo BF16 de referencia: una divergencia KL media de 0,0439 en todas las posiciones y un incremento de perplejidad en WikiText-2 de solo +3,01%. El modelo está pensado para entornos de producción que requieran inferencia multimodal eficiente con contexto largo (262K tokens nativos, extensible a 1M).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (atención lineal en 48 de 64 capas) con torre de visión y head MTP |
| Parametros totales | 17.368.939.248 (según safetensors; el modelo base Qwen3.8-27B tiene 27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible a 1.048.576 |
| Tipos de cuantizacion | NVFP4 (4 bits, W4A4), FP8 E4M3 (8 bits), BF16 (mixto) |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 soporta múltiples idiomas, pero no se especifican en la documentación) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint compressed-tensors para vLLM) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B parámetros con una arquitectura híbrida de atención: 48 de sus 64 capas utilizan atención lineal (linear attention) y las 16 restantes atención completa. Incluye una torre de visión de 27 bloques transformer y un merger para procesar imágenes y video, además de un head MTP (multi-token prediction) que permite decodificación especulativa. El contexto nativo es de 262K tokens, extensible a 1M.

La cuantización aplicada por PrismaQuant asigna de forma individual cada capa lineal a una de tres precisiones: NVFP4 (4 bits, con grupo de tamaño 16 y escalas globales calibradas), FP8 E4M3 (8 bits) o BF16 (sin cuantizar). La asignación se realiza mediante un algoritmo que minimiza el coste de daño AURA (weight-side) y el coste de activación (activation-side) bajo la restricción de un presupuesto total de 20 GB. De los 615 linears totales, 430 se asignan a NVFP4, 177 a FP8 y 8 a BF16. Los 110 linears de la torre visual se fijan a NVFP4 calibrado con activaciones condicionadas a imagen. El `lm_head` y los 8 linears del head MTP se fijan a FP8. Los 8 linears BF16 corresponden a las proyecciones `in_proj_a` y `in_proj_b` de atención lineal en las capas 1, 2, 4 y 13.

No se realizó entrenamiento adicional; el proceso es exclusivamente de calibración y cuantización. La calibración se basó en activaciones reales del modelo BF16 sobre corpus de texto y datos de imagen, y se verificó la integridad del checkpoint con cargas eager y CUDA-graph en vLLM.

## Capacidades

- Generación de texto y razonamiento complejo: mantiene las capacidades del Qwen3.8-27B original, incluyendo razonamiento paso a paso y resolución de problemas matemáticos.
- Comprensión multimodal: procesa imágenes y video, con entrada de imagen-texto y video-texto.
- Generación de código: soporta tareas de programación en múltiples lenguajes, con mejora específica en codificación según la documentación del modelo base.
- Tool calling y function calling: compatible con el protocolo de llamada a herramientas del modelo base, útil para integraciones con APIs y agentes.
- Decodificación especulativa: el head MTP integrado permite acelerar la generación mediante predicción de múltiples tokens, soportado por vLLM.
- Soporte de agentes y multi-step reasoning: puede encadenar razonamientos y ejecutar acciones en entornos agénticos.
- Multilingüe: aunque no se detallan los idiomas en la documentación, el modelo base Qwen3.8 soporta un amplio conjunto de lenguas, incluyendo español, inglés, chino, francés, alemán, entre otros.

## Casos de uso

- Atención al cliente automatizada: con 262K tokens de contexto, el modelo puede gestionar conversaciones multi-turno largas, manteniendo el historial completo y resolviendo consultas complejas con soporte de tool calling para acceder a bases de conocimiento o sistemas de ticketing.
- Análisis de documentos con imágenes: adecuado para extraer información de facturas, contratos o formularios escaneados, combinando comprensión visual y razonamiento textual en un solo paso.
- Generación de código en producción: puede integrarse en pipelines de CI/CD para autocompletar código, generar tests o documentar APIs, aprovechando su capacidad de tool calling y su contexto amplio para manejar repositorios completos.
- Asistentes de visión por computador: útil para tareas de descripción de imágenes, respuesta a preguntas visuales (VQA) y análisis de video en tiempo real, gracias a su torre de visión calibrada en NVFP4.
- Chatbots conversacionales con memoria extendida: su contexto de 262K tokens permite mantener conversaciones de larga duración sin perder información relevante, ideal para asistentes personales o educativos.
- Procesamiento de video para vigilancia o análisis de contenido: el modelo puede procesar secuencias de video y generar resúmenes o detectar eventos, con la ventaja de un footprint de memoria reducido para despliegue en edge.
- RAG (retrieval-augmented generation) con contexto largo: puede combinar recuperación de documentos con generación, procesando múltiples fragmentos de texto e imágenes en una sola pasada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card proporciona métricas de fidelidad de la cuantización frente al modelo BF16 de referencia, que se resumen a continuación:

| Metrica | Valor |
|---|---|
| KL media vs BF16 (todas las posiciones, 4.088 posiciones) | 0,0439023734 |
| KL media vs BF16 (posiciones confiadas, 2.063 posiciones) | 0,0254206691 |
| KL p99 / max | 0,409348640 / 2,379668877 |
| Perplejidad held-out (WikiText-2, cuantizado) | 9,648316858 |
| Perplejidad held-out (WikiText-2, BF16 fuente) | 9,366213045 |
| Coste de cuantizacion | +3,0119% PPL, +0,029674624 nats/token |
| Carga eager + generacion (texto) | PASS (16 tokens) |
| Carga CUDA-graph + generacion (texto) | PASS (16 tokens) |

Estas métricas indican una pérdida de fidelidad muy baja, comparable a la de otros modelos cuantizados de alta calidad. No se dispone de comparaciones con otros modelos en tareas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 20 GB en disco. Para inferencia con vLLM, se recomienda al menos 24 GB de VRAM para cargar los pesos y dejar espacio para activaciones y KV cache. Con cuantización NVFP4/FP8, el modelo podría ejecutarse en GPUs de 16 GB con optimizaciones adicionales, aunque no está garantizado.
- GPUs recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB), H100 (80 GB). El modelo está optimizado para arquitecturas Blackwell (B200, DGX Spark) según los tags, por lo que se espera un rendimiento óptimo en esas plataformas.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de 24 GB como la RTX 4090 o RTX 3090. Para GPUs de 16 GB (RTX 4080, 4070 Ti) podría ser necesario reducir el batch size o usar offloading.
- Opciones de despliegue: vLLM (recomendado, ya que el checkpoint es nativo de compressed-tensors), TGI (si soporta compressed-tensors), y potencialmente llama.cpp si se convierte a GGUF (no confirmado).
- Latencia y throughput: no se han publicado datos específicos. Se espera que la decodificación especulativa con MTP mejore el throughput en comparación con el modelo sin cuantizar, especialmente en GPUs Blackwell.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K (ext. 1M) | BF16 (original) | Apache 2.0 | HuggingFace |
| rdtand/Qwen3.8-27B-PrismaScout-AQUA-Vision-20GB | 17,37B (checkpoint) | 262K (ext. 1M) | NVFP4/FP8/BF16 mixto | Apache 2.0 | HuggingFace |
| rdtand/Qwen3.8-27B-PrismaAQUA-5.5bit-vllm | 19B (checkpoint) | No disponible | 5,5 bits (PrismaAQUA) | Apache 2.0 | HuggingFace |

La comparativa muestra que esta cuantización ofrece un tamaño de checkpoint menor (20 GB) que la variante PrismaAQUA de 5,5 bits (19B, probablemente ~19 GB), manteniendo el mismo contexto y licencia. Frente al modelo base, la ventaja principal es la reducción de memoria (de ~54 GB en BF16 a 20 GB) con una pérdida de calidad mínima.

## Limitaciones y advertencias

- Pérdida de fidelidad: aunque la cuantización es de alta calidad, se ha medido un incremento de perplejidad del +3,01% y una KL media de 0,0439. En tareas sensibles a la precisión (por ejemplo, matemáticas avanzadas o generación de código complejo), puede haber degradación sutil.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente en contextos ambiguos. La cuantización no mitiga este riesgo.
- Sesgos del modelo base: el modelo hereda los sesgos presentes en los datos de entrenamiento de Qwen3.8, que pueden incluir sesgos culturales, de género o lingüísticos.
- Limitaciones de idioma: aunque el modelo base soporta múltiples idiomas, la documentación de esta cuantización no especifica la cobertura exacta. Se recomienda verificar el comportamiento en el idioma objetivo antes de producción.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se debe atribuir correctamente y no utilizar marcas registradas. No hay restricciones adicionales conocidas.
- Dependencia de vLLM: el checkpoint está diseñado para vLLM; otros frameworks pueden requerir conversión o no ser compatibles con el formato compressed-tensors.
- Fecha de creación: el modelo fue creado en agosto de 2026 (según los metadatos), lo que implica que es muy reciente y puede tener menos validación comunitaria que modelos más establecidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rdtand/Qwen3.8-27B-PrismaScout-AQUA-Vision-20GB
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Sitio del proyecto PrismaQuant: https://prismaquant.org
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Ficha de vLLM Recipes para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Modelo relacionado PrismaAQUA 5.5bit: https://huggingface.co/rdtand/Qwen3.8-27B-PrismaAQUA-5.5bit-vllm
