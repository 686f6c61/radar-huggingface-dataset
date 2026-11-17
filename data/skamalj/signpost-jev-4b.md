# skamalj/signpost-jev-4b

## Resumen

Signpost-Jev-4B es un modelo de decisión de 4B parámetros desarrollado por el usuario skamalj, construido mediante fine-tuning con LoRA sobre Qwen3.5-4B. A diferencia de un modelo generativo convencional, está diseñado para responder preguntas tipadas sobre un estado dado (un registro JSON o texto): afirmaciones verdadero/falso, elecciones entre opciones nombradas y niveles en escalas ordenadas. Cada pregunta se resuelve en un único forward pass, leyendo la respuesta directamente de los tokens de respuesta, sin generar texto libre.

El modelo está específicamente ajustado para JevBench, un benchmark de decisiones tipadas, y es hermano de Signpost-D-4B, que está orientado a Typed Decisions. Su relevancia radica en que ofrece una vía eficiente (44 ms de latencia mediana por decisión en una L40S) para tareas de clasificación estructurada y razonamiento sobre estados, integrándose directamente en vLLM mediante el endpoint `/v1/systemone`.

La arquitectura subyacente es `Qwen3_5ForConditionalGeneration`, con torre de visión y ficheros de procesador incluidos, y el checkpoint completo pesa 4.539.265.536 parámetros (9.2 GB en el repositorio). La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformers, vision tower incluida) |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (configurado en el comando de servicio vLLM) |
| Tipos de cuantización | no disponible (pesos en fp16, adaptador LoRA rank 16 fusionado) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers); adaptador LoRA en `adapter/` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer multimodal (`Qwen3_5ForConditionalGeneration`) con torre de visión. El fine-tuning se realizó con LoRA de rango 16 en fp16, usando exactamente el prompt que construye el endpoint `/v1/systemone` de vLLM: una pregunta por secuencia, con la respuesta leída del primer token de respuesta sobre las etiquetas de opción. No se añade ninguna cabeza adicional; los pesos LoRA se fusionan en el modelo base.

Los datos de entrenamiento son registros generados por el propio autor en dominios inventados, con etiquetas gold obtenidas de tres jueces simulados. No se incluye ningún ítem, etiqueta o pregunta de JevBench en el entrenamiento, y cada registro fue verificada contra los ítems públicos de JevBench para descartar cualquier coincidencia de 13 o más palabras consecutivas (sin resultados). El diseño está dirigido al benchmark de forma declarada: los registros más recientes se escribieron en torno a los tipos de decisión donde versiones anteriores rindieron peor (razonamiento temporal y numérico, documentos largos con varios hechos, evaluación de respuestas, preguntas de verosimilitud y compromisos). El entrenamiento consistió en dos épocas sobre la mezcla completa, seguidas de una época más corta sobre los registros nuevos y los más decisivos anteriores, con una tasa de aprendizaje menor.

## Capacidades

- Respuesta a preguntas tipadas sobre un estado: afirmaciones verdadero/falso, elecciones entre opciones nombradas y niveles en escalas ordenadas, con probabilidad por opción.
- Decisión en un único forward pass por pregunta, sin generación de texto libre.
- Razonamiento temporal y numérico (según el diseño dirigido del entrenamiento).
- Procesamiento de documentos largos con múltiples hechos.
- Evaluación de respuestas y preguntas de verosimilitud y compromisos.
- Integración con vLLM mediante el endpoint `/v1/systemone` (requiere nightly reciente).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, audio): no disponible.

## Casos de uso

- Moderación de contenido estructurado: dado un registro JSON con metadatos de un comentario, el modelo puede responder preguntas tipadas (verdadero/falso, nivel de toxicidad en escala ordenada) en un solo forward pass, con 44 ms de latencia mediana, lo que permite filtrar en tiempo real.
- Validación de formularios y datos: sobre un registro JSON, responder afirmaciones verdadero/falso sobre consistencia de campos y niveles de confianza, usando la ventana de 32.768 tokens para documentos largos.
- Triaje de tickets de soporte: clasificar la severidad y categoría de un ticket mediante opciones nombradas y escalas ordenadas, integrándose en vLLM para servir múltiples peticiones con `--max-num-seqs 8`.
- Evaluación automática de respuestas: juzgar la calidad de una respuesta generada con preguntas de verosimilitud y compromisos, aprovechando el ajuste específico del modelo en este tipo de decisión.
- Extracción de hechos de documentos largos: dado un texto extenso con varios hechos, responder preguntas tipadas sobre cada uno dentro de la ventana de contexto de 32.768 tokens.
- Razonamiento numérico y temporal en pipelines de datos: responder preguntas sobre fechas, duraciones y cantidades en registros estructurados, área en la que el entrenamiento fue dirigido específicamente.
- Clasificación de imágenes con preguntas tipadas: la arquitectura incluye torre de visión, por lo que el pipeline `image-text-to-text` permite plantear decisiones sobre entradas imagen-texto.

## Benchmarks y rendimiento

Resultados en los 231 ítems públicos de JevBench (easy, original y hard), ejecutados con el CLI propio de JevBench (adaptador `typesafe`, commit `609a664`) sobre vLLM stock en una L40S. Solo ítems públicos; la puntuación oficial incluye ítems reservados y sellados.

| Conjunto | Ítems | Precisión |
|---|---|---|
| easy | 48 | 0.979 |
| original | 72 | 0.875 |
| hard | 111 | 0.730 |
| **all** | **231** | **0.827** |

Latencia mediana de 44 ms por decisión (vLLM en una L40S, una petición a la vez).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint completo en fp16 ocupa aproximadamente 9.2 GB, por lo que se necesita algo más que esa cifra para pesos y activaciones.
- GPU recomendadas: L40S (medición oficial del autor); A100, H100 y RTX 4090 son opciones plausibles por capacidad, aunque no se han publicado mediciones en ellas.
- Cabe en GPU consumer: probable en RTX 4090 (24 GB) por el tamaño de pesos, aunque no confirmado por el autor.
- Opciones de despliegue: vLLM (obligatorio para `/v1/systemone`, nightly `0.34.0rc1.dev697` o posterior); transformers para uso directo.
- Latencia y throughput: 44 ms medianos por decisión en L40S con una petición a la vez; throughput con `--max-num-seqs 8` no publicado.
- Comando de servicio: `vllm serve skamalj/signpost-jev-4b --max-model-len 32768 --max-num-seqs 8 --logprobs-mode raw_logprobs`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión JevBench (público) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Signpost-Jev-4B | 4.539.265.536 | 32.768 | 0.827 (231 ítems) | Apache-2.0 | Hugging Face |
| Signpost-D-4B | no disponible | no disponible | no disponible | no disponible | Hugging Face (hermano, orientado a Typed Decisions) |
| Qwen3.5-4B (base) | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto libre: solo responde preguntas tipadas con probabilidades por opción; no sirve para tareas generativas.
- Diseño dirigido al benchmark de forma declarada: los registros nuevos se escribieron en torno a los tipos de decisión con peor rendimiento previo en JevBench; esto puede limitar la generalización fuera de esos tipos.
- Los resultados publicados corresponden solo a ítems públicos de JevBench; la puntuación oficial incluye ítems reservados y sellados, por lo que el rendimiento real puede diferir.
- El endpoint `/v1/systemone` requiere una nightly reciente de vLLM (`0.34.0rc1.dev697`); versiones estables pueden no soportarlo.
- Idiomas soportados no disponibles: no se puede garantizar cobertura multilingüe.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no evaluado; al ser un modelo de decisión, el riesgo se manifiesta como probabilidades mal calibradas más que como texto inventado.
- Licencia Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.5-4B.
- Sin métricas de throughput, VRAM ni rendimiento en GPU consumer publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skamalj/signpost-jev-4b
- Modelo hermano Signpost-D-4B: https://huggingface.co/skamalj/signpost-d-4b
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- JevBench (Space): https://huggingface.co/spaces/benchmarkheaven/JevBench
