# d3LLM/SDAR-4B-Chat-distill-search

## Resumen

SDAR-4B-Chat-distill-search es un modelo de lenguaje de 4.411.424.256 parámetros (aproximadamente 4,4 B) publicado por la organización d3LLM en HuggingFace. Pertenece a la familia SDAR (Synergy of Diffusion and AutoRegression), una propuesta que combina el entrenamiento autorregresivo (AR) clásico con la inferencia paralela propia de los modelos de difusión discreta. Según la model card, esta combinación busca mantener la eficiencia de entrenamiento de los modelos AR y, al mismo tiempo, aprovechar la capacidad de decodificación en paralelo de los modelos de difusión, con un rendimiento que el autor sitúa a la par de los modelos AR abiertos del estado del arte.

El modelo se distribuye con licencia Apache 2.0, en formato safetensors y con código propio (`custom_code`), por lo que requiere `trust_remote_code=True` para cargarse con Transformers. La model card recomienda usar el motor de inferencia JetEngine, que expone parámetros específicos de decodificación por difusión (`block_length`, `denoising_steps`, `remasking_strategy`, `dynamic_threshold`) y un `mask_token_id` de 151669.

La relevancia de este lanzamiento es doble: por un lado, es una pieza de investigación sobre modelos de lenguaje basados en difusión, un área con relativamente pocos modelos abiertos; por otro, su tamaño de 4,4 B lo hace apto para despliegue en una sola GPU. Ahora bien, el repositorio es muy reciente (creado el 2026-10-25), no acumula descargas ni valoraciones, y la model card no detalla el significado del sufijo "distill-search" ni publica cifras de benchmarks en texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido autorregresivo + difusión discreta (SDAR) |
| Parámetros totales | 4.411.424.256 (~4,4 B) |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible en la model card; el repositorio solo contiene safetensors (8,8 GB, compatible con bf16/fp16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con código propio (`custom_code`, requiere `trust_remote_code=True`) |
| Token de máscara | 151669 (usado por la decodificación por difusión) |
| Motor de inferencia recomendado | JetEngine (`Labman42/JetEngine`) |
| Pipeline | text-generation |
| Tamaño del repositorio | 8,8 GB |

## Arquitectura y entrenamiento

SDAR es una arquitectura híbrida que integra modelado autorregresivo y difusión discreta en un mismo modelo de lenguaje. La generación no sigue un esquema puramente token a token: JetEngine expone una decodificación por bloques (`block_length=4`) con un número fijo de pasos de eliminación de ruido (`denoising_steps=4`), una estrategia de reenmascarado (`remasking_strategy="low_confidence_dynamic"`) y un umbral dinámico (`dynamic_threshold=0.9`). El tokenizador define un token de máscara con id 151669, coherente con el vocabulario de la familia Qwen, cuyos informes técnicos se citan en los tags del repositorio (arXiv:2505.09388).

En cuanto a los datos de entrenamiento, la model card no especifica el número de tokens, la composición del corpus ni si hubo fases de RLHF o DPO. Sí se menciona que las comparativas "SDAR-Sci" se realizaron en condiciones controladas, con el mismo backbone y el mismo conjunto de datos que la línea base autorregresiva, y que los resultados se promediaron sobre 8 ejecuciones en GPQA y 32 ejecuciones en AIME 2024, AIME 2025 y LiveMathBench. La innovación técnica principal es, por tanto, el esquema de decodificación paralela por difusión, orientado a reducir la latencia frente a la generación AR secuencial.

## Capacidades

- Generación de texto y conversación multi-turno: el repositorio está etiquetado como `conversational` y la model card muestra el uso con `apply_chat_template`.
- Razonamiento científico y matemático: la familia SDAR presenta mejoras declaradas frente a modelos AR del mismo tamaño en tareas como GPQA, ChemBench, física, AIME 2024/2025 y LiveMathBench.
- Decodificación paralela por difusión: generación por bloques con pasos de eliminación de ruido configurables y reenmascarado dinámico basado en confianza.
- Inferencia en streaming: la API de JetEngine incluye `generate_streaming`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso con herramientas: no disponible.
- Capacidades multilingües: no disponible (los idiomas no están documentados).
- Capacidades multimodales (visión, audio): no disponibles.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Asistentes conversacionales multi-turno: el modelo está etiquetado como `conversational` y acepta plantillas de chat, por lo que puede integrarse en un backend de atención al cliente. La longitud de contexto no está documentada, así que el historial deberá acotarse empíricamente.
- Razonamiento científico y técnico asistido: la familia SDAR declara ganancias específicas en GPQA, química y física, lo que lo hace candidato para herramientas internas de apoyo a investigadores (resolución de problemas de dominio, comprobación de razonamientos).
- Investigación sobre modelos de difusión para lenguaje: sirve como base reproducible para experimentar con `denoising_steps`, `block_length` y estrategias de reenmascarado, y comparar latencia frente a decodificación AR.
- Generación por lotes con requisito de baja latencia: al decodificar bloques de tokens en paralelo, el coste por token generado puede reducirse frente a un modelo AR del mismo tamaño; encaja en pipelines de resumen, etiquetado o extracción de información por volumen.
- Despliegue on-premise en una sola GPU: con 4,4 B de parámetros, el modelo puede servirse en una GPU de consumo (ver sección de hardware) para entornos con requisitos de soberanía de datos.
- Prototipado de motores de inferencia: el uso de JetEngine con `enforce_eager=True` y `tensor_parallel_size=1` permite validar rápidamente integraciones antes de escalar.
- Evaluación comparativa AR frente a difusión: útil en entornos académicos para medir el equilibrio entre calidad y velocidad en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en formato numérico en la información disponible. La model card incluye tres tablas comparativas en formato de imagen (`table1.png`, `table2.png`, `table3.png`), sin valores textuales:

| Referencia en la model card | Contenido | Valores numéricos |
|---|---|---|
| SDAR v.s. Qwen | Comparativa de SDAR frente a Qwen3-1.7B-AR-SFT y Qwen3-30B-AR-SFT (decodificación greedy) | No disponibles (imagen) |
| SDAR-Sci v.s. AR Baseline | Comparación controlada mismo backbone y dataset; GPQA (8 ejecuciones), AIME 2024/2025 y LiveMathBench (32 ejecuciones) | No disponibles (imagen) |
| SDAR-Sci v.s. Other Models | SDAR-30B-A3B-Sci frente a modelos abiertos y propietarios; puntuaciones externas tomadas de InternLM/Intern-S1 | No disponibles (imagen) |

No se dispone de cifras de MMLU, HumanEval, GSM8K ni de evaluaciones específicas para esta variante de 4,4 B.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 9-11 GB solo para pesos (el repositorio ocupa 8,8 GB), más caché KV y buffers de decodificación; en la práctica, 12-16 GB es un punto de partida razonable para contextos cortos.
- VRAM estimada en int8: en torno a 4,5-6 GB de pesos; en int4: en torno a 2,5-4 GB (estimaciones a partir del número de parámetros, no verificadas con este checkpoint).
- GPU profesionales: A100 40/80 GB, H100, L40S; sobredimensionadas para el modelo, útiles si se necesita mucho contexto o alto paralelismo de peticiones.
- GPU de consumo: cabe en RTX 4090 (24 GB), RTX 3090 (24 GB) y RTX 4080 (16 GB) en bf16; en tarjetas de 8-12 GB sería necesario cuantizar.
- Despliegue: JetEngine es el motor recomendado por el autor (`enforce_eager=True`, `tensor_parallel_size=1` en el ejemplo). También es posible cargar con Transformers usando `trust_remote_code=True`. Soporte en vLLM, llama.cpp, Ollama o TGI: no disponible / no confirmado, y poco probable sin adaptación, dado el `custom_code` y el esquema de decodificación por difusión.
- Latencia y throughput: no se publican cifras. Cualitativamente, el autor defiende que la decodificación paralela reduce la latencia frente a AR, pero `enforce_eager=True` desactiva optimizaciones tipo CUDA graphs, lo que puede penalizar el rendimiento en producción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SDAR-4B-Chat-distill-search | ~4,4 B | No disponible | Apache 2.0 | Objeto de esta ficha; híbrido AR + difusión |
| Qwen3-1.7B-AR-SFT | ~1,7 B | No disponible | No indicada en la información | Línea base autorregresiva usada en las comparativas de la model card |
| SDAR-30B-A3B-Sci | 30 B totales, ~3 B activos según la nomenclatura A3B (no confirmado) | No disponible | No disponible | Variante de mayor tamaño de la misma familia, orientada a ciencia |
| Qwen3-30B-AR-SFT | ~30 B | No disponible | No indicada en la información | Línea base autorregresiva de gran tamaño en las comparativas |

No se han encontrado en la información proporcionada comparaciones con otros modelos de difusión para lenguaje (por ejemplo, de la familia LLaDA o Dream); las tablas de la model card no incluyen valores numéricos extraíbles.

## Limitaciones y advertencias

- Idiomas no documentados: no hay garantía de calidad en castellano; habría que evaluar el modelo antes de usarlo en producción en español.
- Ausencia de benchmarks numéricos públicos: las tablas de rendimiento son imágenes y no se ofrecen cifras de MMLU, HumanEval o GSM8K, ni resultados específicos para esta variante de 4,4 B.
- Madurez muy baja: 0 descargas y 0 likes, repositorio creado el 2026-10-25; no existe validación independiente ni ecosistema de terceros.
- `custom_code` y `trust_remote_code=True`: implican ejecutar código del autor al cargar el modelo, con el riesgo de seguridad y de compatibilidad que ello conlleva; conviene revisar el código antes de desplegarlo.
- Dependencia de un motor específico: el rendimiento óptimo se asocia a JetEngine; no se confirma soporte en vLLM, llama.cpp, Ollama o TGI.
- Hiperparámetros sensibles: `denoising_steps`, `block_length`, `remasking_strategy` y `dynamic_threshold` afectan directamente a la calidad; valores bajos de pasos de eliminación de ruido pueden degradar la coherencia.
- El sufijo "distill-search" no está explicado en la model card: se desconoce si implica destilación, entrenamiento con datos de búsqueda o una capacidad de búsqueda integrada. No debe asumirse ninguna de estas opciones.
- Sesgos y alucinaciones: no hay información sobre la composición del dataset ni evaluaciones de sesgo o factualidad; debe asumirse un riesgo de alucinación no cuantificado.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se ofrece sin garantías; conviene conservar el aviso de licencia y atribución.
- Sin datos sobre longitud de contexto: planificar el producto con un contexto conservador hasta medirlo.

## Enlaces

- [HuggingFace: d3LLM/SDAR-4B-Chat-distill-search](https://huggingface.co/d3LLM/SDAR-4B-Chat-distill-search)
- [Paper SDAR (arXiv:2510.06303)](https://arxiv.org/abs/2510.06303)
- [Paper Qwen3 Technical Report (arXiv:2505.09388)](https://arxiv.org/abs/2505.09388)
- [Repositorio GitHub JetAstra/SDAR](https://github.com/JetAstra/SDAR)
- [Motor de inferencia JetEngine](https://github.com/Labman42/JetEngine)
- [Colección de modelos SDAR en HuggingFace](https://huggingface.co/collections/JetLM/sdar-689b1b6d392a4eeb2664f8ff)
- [Repositorio InternLM/Intern-S1 (fuente de puntuaciones externas citada)](https://github.com/InternLM/Intern-S1)
