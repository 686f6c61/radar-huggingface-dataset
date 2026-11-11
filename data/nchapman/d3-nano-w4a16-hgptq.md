# nchapman/d3-nano-W4A16-HGPTQ

## Resumen

d3-nano-W4A16-HGPTQ es una cuantización de 4 bits del modelo base vllm-sr/d3-nano, un modelo de decisión de un solo paso (single-pass decision model) construido sobre la arquitectura Qwen3_5. Lo desarrolla nchapman como trabajo de compresión de pesos, aplicando una receta GPTQ con rotación Walsh-Hadamard y descomposición de Cholesky sobre el checkpoint BF16 original de 4,12 GiB, reduciéndolo a 1,80 GiB (2,29 veces más pequeño) sin degradar la calidad de decisión. El modelo tiene 2.213.241.664 parámetros y combina una torre de visión ViT de 12 bloques con un backbone de lenguaje híbrido GatedDeltaNet + full-attention de 24 capas.

El problema que resuelve es el despliegue eficiente de un modelo de decisión estructurada (elección entre opciones, sí/no, selección múltiple y escalas) en entornos con VRAM limitada, manteniendo una concordancia top-1 del 100% respecto al BF16 en las tareas evaluadas. Es relevante porque demuestra que la cuantización W4A16 con rotaciones Hadamard puede preservar la fidelidad de la cabeza de lectura (readout) de 255 códigos, algo crítico en modelos de decisión donde pequeñas perturbaciones en los logits alteran la opción elegida.

La relevancia práctica está en que permite ejecutar un modelo multimodal de decisión con backbone de 24 capas y ventana de atención completa en GPUs de consumo, con un footprint de 1,80 GiB y compatibilidad con transformers y compressed-tensors. No obstante, se trata de un modelo de nicho (decision-model con pipeline feature-extraction) y con cero descargas en el momento de redactar esta ficha, lo que limita la evidencia externa sobre su comportamiento en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 24 capas GatedDeltaNet + full-attention (Qwen3_5), con torre de visión ViT de 12 bloques |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16-HGPTQ (4 bits pesos, 16 bits activaciones), group_size=64, actorder="static", dampening_frac=0.01, rotación Walsh-Hadamard H_64 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, quantization_status="compressed") |

## Arquitectura y entrenamiento

El modelo base vllm-sr/d3-nano emplea una arquitectura híbrida de 24 capas con hidden_size=2048 que alterna capas GatedDeltaNet (atención lineal con estado recurrente) y capas de full-attention, en un único paso forward (single-pass). Incorpora además una torre de visión de 12 bloques ViT con merger, y una cabeza de lectura específica (readout.safetensors, matriz [255, 2048]) que mapea el estado oculto a 255 códigos de decisión. El pipeline declarado es feature-extraction y la tarea es decision-model con esquema code-readout-v1.

El proceso de cuantización, realizado por nchapman, aplica una rotación de entrada Walsh-Hadamard Sylvester de 64×64 (H_64) seguida de GPTQ con inicialización MSE y descomposición de Cholesky, calibrando capa por capa bajo atención noncausal_full_attention. Se cuantizan 150 capas lineales del lenguaje y 98 del tower de visión (248 en total), mientras que se mantienen en BF16 el readout, los embeddings, in_proj_a, in_proj_b, normas, biases y patch_embed.proj. No se dispone de información sobre el dataset de entrenamiento del modelo base, número de tokens, ni si hubo RLHF/DPO.

## Capacidades

- Decisión estructurada de un solo paso: elección entre opciones (choice), sí/no (yes_no), selección múltiple (multi_select) y escalas (scale), con promediado de permutaciones forward y reverse.
- Lectura de 255 códigos mediante la cabeza readout, con similitud coseno de logits de 0,999635 respecto al BF16.
- Procesamiento multimodal: torre de visión ViT de 12 bloques con merger, evaluada con 96 imágenes y 50.596 tokens visuales.
- Razonamiento sobre estado textual y preguntas con criterios explícitos (intent, clasificación, extracción de decisiones).
- Integración con tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible; el modelo está diseñado para single-pass.
- Capacidades multilingües: no disponible.
- Capacidades especiales: modo thinking, audio u otras no disponibles.

## Casos de uso

- Clasificación de intención en atención al cliente: el modelo recibe el estado de la conversación (por ejemplo, "Customer ordered item #4412, delivered on time, requested an invoice copy") y devuelve una decisión estructurada entre opciones como invoice o refund, con probabilidades normalizadas por opción.
- Enrutamiento de tickets en soporte técnico: usar el esquema choice para asignar cada incidencia a una categoría predefinida (facturación, envío, devolución) a partir de un resumen textual del caso, aprovechando la fidelidad del readout de 255 códigos.
- Moderación y verificación binaria: tareas yes_no para validar si un contenido cumple una política concreta, con la ventaja de que el 100% de concordancia top-1 respecto al BF16 evita cambios de criterio tras la cuantización.
- Selección múltiple en formularios y encuestas: el tipo multi_select permite marcar varias opciones (por ejemplo, motivos de devolución) manteniendo una divergencia KL media de solo 0,000222 nats.
- Evaluación de escalas (satisfacción, riesgo, severidad): el tipo scale devuelve una puntuación ordinal, útil en triaje de incidencias o scoring de leads, con un footprint de 1,80 GiB que cabe en GPUs de consumo.
- Procesamiento de documentos con componente visual: la torre ViT permite incorporar imágenes (capturas, formularios escaneados) junto al estado textual, con similitud coseno media de 0,961678 frente al BF16 en la sonda vision-probe-v2.
- Pipelines de decisión de bajo coste en producción: al cargar con D3.from_pretrained y Qwen3_5Model.from_pretrained sin claves faltantes ni inesperadas, se puede integrar en servicios de inferencia con compressed-tensors y transformers.

## Benchmarks y rendimiento

| Evaluación | BF16 base (vllm-sr/d3-nano) | d3-nano-W4A16-HGPTQ |
|---|---:|---:|
| Tamaño safetensors (incl. readout) | 4,12 GiB (4.428.644.200 B) | 1,80 GiB (1.933.757.440 B) |
| Compresión | — | 2,29× (−2,32 GiB) |
| Concordancia top-1 de decisión (12 preguntas) | 100,00% | 100,00% |
| Divergencia KL de probabilidad de opción (media / máx, nats) | 0,000000 | 0,000222 / 0,001307 |
| Similitud coseno de logits del readout de 255 códigos | 1,000000 | 0,999635 |
| KL de softmax del readout de 255 códigos (nats) | — | 0,000328 |
| Torre de visión (vision-probe-v2, 96 imágenes, 50.596 tokens) | 1,000000 cos | 0,961678 media (0,916555 mín) |
| vision-guard-v2 (media / mín) | — | 0,965764 / 0,939876 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,80 GiB de pesos en W4A16 más overhead de activaciones, KV cache y buffers de atención; se recomienda al menos 4-6 GiB de VRAM libre para operar con comodidad.
- GPU recomendadas: cualquier GPU con soporte de compressed-tensors y operaciones de 4 bits; las pruebas de carga se realizan en CUDA (device="cuda:0"). No se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, por tamaño (1,80 GiB) es compatible con GPUs consumer con 6 GiB o más; no se detallan modelos concretos (RTX 3060, 4060, 4090) en la documentación.
- Opciones de despliegue: transformers con compressed-tensors, D3.from_pretrained, Qwen3_5Model.from_pretrained y warp-34. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| d3-nano-W4A16-HGPTQ | 2.213.241.664 | no disponible | W4A16-HGPTQ, 1,80 GiB | Apache 2.0 | Modelo de decisión single-pass con visión; 100% concordancia top-1 vs BF16 |
| vllm-sr/d3-nano (BF16) | 2.213.241.664 | no disponible | BF16, 4,12 GiB | Apache 2.0 | Referencia de calidad; 2,29× más grande |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se identifican modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Modelo de nicho: es un decision-model con pipeline feature-extraction, no un modelo generativo de propósito general; no debe esperarse generación libre de texto.
- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de un modelo base sin documentación de dataset, no se puede evaluar la composición ni los sesgos de entrenamiento.
- Riesgo de alucinación: no evaluado; el esquema de decisión restringe la salida a opciones predefinidas, lo que reduce pero no elimina el riesgo de decisiones incorrectas.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados, lo que impide garantizar su comportamiento fuera del inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se desconoce si el modelo base impone condiciones adicionales; conviene verificar la licencia de vllm-sr/d3-nano.
- Caveat de cuantización en visión: la similitud coseno de la torre de visión baja a 0,961678 de media (0,916555 mín), por lo que tareas visuales finas pueden degradarse más que las textuales.
- Madurez: cero descargas y publicación reciente (noviembre de 2026), sin evidencia externa de uso en producción ni validación independiente de los benchmarks reportados.
- Dependencia de código personalizado: requiere custom_code y el paquete d3_runtime, lo que añade complejidad de integración frente a un transformers estándar.

## Enlaces

- Hugging Face: https://huggingface.co/nchapman/d3-nano-W4A16-HGPTQ
- Modelo base: https://huggingface.co/vllm-sr/d3-nano
- Repositorio de código d3_runtime: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
