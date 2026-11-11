# nchapman/GLiDE-27B-W4A16-HGPTQ

## Resumen

GLiDE-27B-W4A16-HGPTQ es una cuantización de 4 bits del modelo `fastino/GLiDE-27B`, un modelo de decisión de una sola pasada especializado en tareas de elección estructurada (`code-readout-v1`). Lo publica el usuario `nchapman` como cuantizador, no como autor del modelo original, y se distribuye bajo licencia Apache 2.0. El modelo base pertenece a la familia `qwen3_5` y combina una torre de visión con un backbone de lenguaje híbrido de atención completa y GatedDeltaNet.

La relevancia de esta ficha está en el proceso de compresión: reduce un checkpoint BF16 de 48,59 GiB a 14,69 GiB (3,31× menos) manteniendo el 100,00 % de acuerdo top-1 en las decisiones evaluadas y una similitud coseno de logits de 0,999468 frente a la referencia BF16. Es, por tanto, una opción práctica para desplegar un modelo de decisión multimodal de 26.085.330.160 parámetros en hardware con menos memoria, sin reentrenamiento.

El modelo no es un generador de texto conversacional al uso: su interfaz principal es `decide()`, que recibe un estado (texto y potencialmente imagen) y un conjunto de preguntas tipadas (`choice`, `yes_no`, `multi_select`, `scale`) y devuelve decisiones sobre un espacio de 255 códigos de salida. Esta especialización lo hace adecuado para pipelines de clasificación y enrutamiento, no para chat abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa + GatedDeltaNet) con torre de visión ViT; 64 capas, `hidden_size=5120`; recurrencia de bucle de capas intermedias (`blocks=[[24,35],[36,47]]`, `passes=2`, `alpha=0.5`) |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 GPTQ con rotación Walsh–Hadamard (H_64), `group_size=64`, `actorder="static"`, `dampening_frac=0.01`; 537 capas lineales cuantizadas (400 de lenguaje + 137 de visión) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `compressed-tensors` (`quantization_status: compressed`); compatible con `transformers` y `Qwen3_5Model.from_pretrained` |

## Arquitectura y entrenamiento

El backbone tiene 64 capas con `hidden_size=5120` y combina bloques de atención completa con bloques GatedDeltaNet (atención lineal). Una innovación destacable es la recurrencia de bucle de capas intermedias: los bloques `[24,35]` y `[36,47]` se ejecutan dos veces (`passes=2`) con escalado residual `alpha=0.5`, lo que aumenta la profundidad efectiva sin incrementar el número de parámetros. La cuantización se calibró capa por capa bajo atención `noncausal_full_attention` y a través de todas las pasadas de Euler de la recurrencia.

El modelo incorpora una torre de visión de 27 bloques ViT más un `merger`, lo que lo convierte en un modelo image-text-to-text. Sobre el backbone se sitúa una cabeza de lectura (`readout.safetensors`, matriz `[255, 5120]`) que proyecta el estado oculto sobre 255 códigos de decisión; esta cabeza se mantiene en BF16. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO en el modelo base.

La receta de cuantización aplica una rotación de entrada Walsh–Hadamard Sylvester 64×64 (`H_64`) antes de GPTQ con inicialización Cholesky por MSE. Las capas `linear_fc2` de la torre de visión usan GPTQ por canal con Hadamard de `head_dim=16`, y el resto de lineales de visión usan `g64-h64`. Permanecen en BF16 `embed_tokens`, `linear_attn.in_proj_a`, `linear_attn.in_proj_b`, normas, sesgos y `visual.patch_embed.proj`.

## Capacidades

- Decisión estructurada de una sola pasada sobre preguntas tipadas: `choice`, `yes_no`, `multi_select` y `scale`, mediante la API `Glide.decide()`.
- Entrada multimodal image-text-to-text: procesa imágenes a través de la torre ViT y las combina con el estado textual.
- Salida sobre un espacio fijo de 255 códigos de lectura (`code-readout-v1`), con distribución de probabilidad por opción.
- Promediado de permutaciones de opciones (forward + reverse) para robustez en la evaluación de decisiones.
- Soporte de contexto multi-pregunta: un mismo estado puede evaluarse contra varias preguntas simultáneamente.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni modo de razonamiento extendido en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Clasificación de intención en atención al cliente: el modelo recibe el estado de un ticket (por ejemplo, "Customer ordered item #4412, delivered on time, requested an invoice copy") y una pregunta `choice` con criterios como `invoice` o `refund`, devolviendo la decisión directamente sin generación de texto libre.
- Enrutamiento de tickets y colas de soporte: con preguntas `multi_select` se pueden asignar varias etiquetas a la vez (departamento, urgencia, tipo de incidencia) en una sola pasada, lo que reduce la latencia frente a pipelines de clasificación en cascada.
- Moderación y verificación de contenido con imágenes: la torre ViT permite evaluar si una imagen y un texto cumplen criterios definidos mediante preguntas `yes_no`, útil en revisión de anuncios o publicaciones.
- Triaje documental: dado el texto extraído de un documento, formular preguntas `scale` para puntuar relevancia, riesgo o confianza antes de derivar a revisión humana.
- Extracción de señales en encuestas: convertir respuestas abiertas en decisiones `scale` o `multi_select` normalizadas, aprovechando la distribución de probabilidad por opción para umbralizar casos ambiguos.
- Despliegue en hardware limitado: al ocupar 14,69 GiB en W4A16, puede servirse en una única GPU de 24 GB (por ejemplo, RTX 4090) en lugar de requerir el checkpoint BF16 de 48,59 GiB, lo que abarata el coste por instancia en producción.
- Evaluación A/B de decisiones: la cabeza de lectura de 255 códigos y la similitud coseno frente a BF16 permiten comparar sistemáticamente la versión cuantizada con la referencia antes de promover un cambio a producción.

## Benchmarks y rendimiento

Resultados publicados por el autor de la cuantización frente al modelo base BF16, en evaluación `code-readout-v1` de una sola pasada con promediado de permutaciones forward + reverse:

| Evaluacion | BF16 base (`fastino/GLiDE-27B`) | GLiDE-27B-W4A16-HGPTQ | Notas |
|---|---:|---:|---|
| Tamano safetensors (incl. `readout.safetensors`) | 48,59 GiB (52.173.420.384 B) | 14,69 GiB (15.769.609.720 B) | Compresión 3,31× (−33,90 GiB) |
| Acuerdo top-1 en decisiones (12 preguntas) | 100,00 % | 100,00 % | Promediado forward + reverse |
| KL de probabilidad por opción (media / máx, nats) | 0,000000 | 0,000028 / 0,000205 | Distribución normalizada por pregunta |
| Similitud coseno de logits de lectura (255 códigos) | 1,000000 | 0,999468 | KL de softmax de 255 códigos: 0,000340 nats |
| Torre de visión (`vision-probe-v2`, 96 imágenes, 50.596 tokens visuales) | 1,000000 cos | 0,995543 media (0,976042 mín) | `vision-guard-v2`: 0,996905 media (0,991590 mín) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 15-16 GiB para los pesos en W4A16 (14,69 GiB de checkpoint) más overhead de activaciones, caché KV y contexto; el modelo base BF16 requiere aproximadamente 49 GiB solo para pesos.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegues con concurrencia; una RTX 4090 (24 GB) es suficiente para inferencia en W4A16 con margen limitado.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 (24 GB); en GPUs de 16 GB el margen es muy ajustado y depende de la longitud de contexto y del procesamiento de imágenes.
- Opciones de despliegue: `transformers` con `compressed-tensors` (carga verificada con `missing: 0, unexpected: 0` en `Qwen3_5Model.from_pretrained`, `Glide.from_pretrained` y `warp-34`); el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| GLiDE-27B-W4A16-HGPTQ | 26.085.330.160 | no disponible | safetensors W4A16 GPTQ (14,69 GiB) | Apache 2.0 | Cuantización del base; 100 % acuerdo top-1 |
| fastino/GLiDE-27B (base) | 26.085.330.160 | no disponible | safetensors BF16 (48,59 GiB) | Apache 2.0 | Referencia de calidad; requiere ~49 GiB de pesos |
| Alternativas de decisión multimodal de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre modelos comparables en la documentación proporcionada |

## Limitaciones y advertencias

- Modelo especializado en decisión estructurada (`code-readout-v1`) con salida fija de 255 códigos; no es un generador de texto abierto ni un asistente conversacional general.
- La cuantización introduce una desviación pequeña pero medible: KL media de 0,000028 nats por pregunta y similitud coseno de 0,999468 en logits de lectura; en la torre de visión la similitud mínima baja a 0,976042, relevante si el caso de uso depende de detalles visuales finos.
- Los benchmarks publicados se limitan a 12 preguntas de decisión y 96 imágenes; la muestra es pequeña y no cubre todos los dominios de producción.
- No se dispone de información sobre sesgos, idiomas soportados ni comportamiento en contextos largos; no hay datos para evaluar riesgo de alucinación en tareas fuera del espacio de decisión.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `fastino/GLiDE-27B` y de los datos de calibración empleados por el cuantizador.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-11); no hay evidencia de validación por terceros.
- El soporte de despliegue documentado se limita a `transformers` con `compressed-tensors`; la integración con motores de inferencia de alto rendimiento no está confirmada.
- La recurrencia de bucle de capas (`passes=2`) duplica el coste de cómputo efectivo en los bloques `[24,35]` y `[36,47]`, lo que afecta a la latencia frente a un transformer de 64 capas convencional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/GLiDE-27B-W4A16-HGPTQ
- Modelo base: https://huggingface.co/fastino/GLiDE-27B
- Repositorio `compressed-tensors`: no disponible en la información proporcionada
- Paper o blog del modelo base: no disponible
- Demo o espacio asociado: no disponible
