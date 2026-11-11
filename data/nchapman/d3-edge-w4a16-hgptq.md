# nchapman/d3-edge-W4A16-HGPTQ

## Resumen

d3-edge-W4A16-HGPTQ es una cuantización de 4 bits del modelo vllm-sr/d3-edge, un modelo de decisión de un solo paso (single-pass decision model) basado en la arquitectura Qwen3_5. Lo desarrolla nchapman como trabajo de cuantización sobre el checkpoint original de vllm-sr, y su propósito no es la generación de texto libre, sino la extracción de decisiones estructuradas: dado un estado textual y un conjunto de preguntas con opciones, el modelo produce una distribución de probabilidad sobre un vocabulario de 255 códigos de decisión mediante una cabeza de lectura (readout) lineal. Esta ficha evalúa la variante cuantizada, no el modelo base.

El modelo combina una torre de visión ViT con un backbone de lenguaje híbrido de 12 capas que alterna GatedDeltaNet y atención completa, con un tamaño total de 594.321.600 parámetros. La cuantización aplica rotación Walsh-Hadamard de 64×64 más GPTQ con inicialización Cholesky y tamaño de grupo 64 sobre 128 capas lineales (78 del lenguaje y 50 de la visión), manteniendo en BF16 la cabeza de lectura, los embeddings, las proyecciones `in_proj_a`/`in_proj_b`, las normas y el `patch_embed` visual.

Su relevancia práctica es doble: demuestra que es posible comprimir un modelo de decisión a 0,65 GiB conservando el 100 % de acuerdo top-1 en la tarea de referencia, y ofrece un formato de pesos compatible con `compressed-tensors` que carga sin errores en `Qwen3_5Model`, `D3` y `warp-34`. Es, por tanto, una pieza orientada a despliegue de clasificación y enrutamiento de decisiones con huella de memoria reducida, no un modelo conversacional de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3_5: 12 capas con GatedDeltaNet + atención completa, torre de visión ViT de 12 bloques y cabeza de lectura lineal (code-readout) |
| Parametros totales | 594.321.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits), GPTQ con grupo 64, rotación Walsh-Hadamard 64×64, `actorder="static"`, `dampening_frac=0.01` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `compressed-tensors` (`quantization_status: "compressed"`), más `readout.safetensors` en BF16 |

## Arquitectura y entrenamiento

El backbone es un transformer de 12 capas con `hidden_size=1024` que combina capas GatedDeltaNet (atención lineal con estado recurrente) y capas de atención completa, en un esquema híbrido de una sola pasada. Sobre la representación final se aplica una cabeza de lectura lineal de forma `[255, 1024]` que proyecta el estado oculto sobre un vocabulario de 255 códigos de decisión; las preguntas y opciones se codifican como parte del estado de entrada y el modelo devuelve logits por opción, que se normalizan para obtener una distribución. La torre de visión es un ViT de 12 bloques con merger, lo que permite incorporar imágenes al estado.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo base empleó RLHF, DPO u otras técnicas de alineamiento. La innovación técnica documentada corresponde a la cuantización: rotación de entrada Sylvester Walsh-Hadamard de 64×64 (`H_64`) aplicada en línea por bloque, seguida de GPTQ con inicialización por error cuadrático medio y descomposición de Cholesky, calibrado capa a capa bajo atención `noncausal_full_attention`. El resultado son 128 capas lineales cuantizadas (78 de lenguaje y 50 de visión) y el resto de tensores en BF16, con un tamaño total de 0,65 GiB frente a 1,11 GiB del checkpoint BF16 original (factor de compresión 1,71×).

## Capacidades

- Extracción de decisiones estructuradas de un solo paso: clasificación multietiqueta, elección única, sí/no y escalas, mediante la cabeza de lectura de 255 códigos.
- Tareas de elección múltiple (`choice`), binarias (`yes_no`), selección múltiple (`multi_select`) y escalas (`scale`), con promedio sobre permutaciones directa e inversa de las opciones.
- Procesamiento de imágenes a través de la torre de visión ViT integrada, validada con la sonda `vision-probe-v2` sobre 96 imágenes y 50.596 tokens visuales.
- Enrutamiento de intenciones y clasificación de estados textuales (por ejemplo, intención de facturación, reembolso o consulta) a partir de un estado descriptivo.
- Compatibilidad con `transformers` mediante `custom_code`, cargando en `Qwen3_5Model.from_pretrained`, `D3.from_pretrained` y `warp-34` con `missing: 0, unexpected: 0`.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso ni modo de pensamiento extendido; el diseño es explícitamente de una sola pasada.

## Casos de uso

- Enrutamiento de tickets de soporte: dado un estado textual con el historial resumido del cliente, el modelo devuelve la distribución sobre intenciones predefinidas (factura, reembolso, incidencia técnica) y permite dirigir el ticket al equipo adecuado con una sola inferencia y una huella de 0,65 GiB.
- Clasificación de documentos con componente visual: al incluir una torre ViT, puede procesar capturas o formularios escaneados junto al texto asociado para decidir categorías documentales, con una pérdida de fidelidad visual mínima (coseno medio 0,974 frente al BF16).
- Moderación y etiquetado de contenido: las tareas `multi_select` permiten asignar varias etiquetas por ítem en una sola pasada, útil para pipelines de anotación masiva donde el coste por inferencia es crítico.
- Encuestas y formularios automatizados: las tareas `scale` y `yes_no` permiten convertir respuestas abiertas en valores normalizados, con la ventaja de que la permutación directa/inversa reduce el sesgo de posición de las opciones.
- Despliegue en hardware modesto: con 0,65 GiB de pesos, el modelo cabe en GPUs de consumo y en entornos con memoria limitada, lo que lo hace apto para servicios perimetrales o embebidos donde no es viable un modelo de 7B o superior.
- Evaluación de agentes y pipelines de decisión: al ser un modelo de referencia con métricas de acuerdo top-1 y KL documentadas, sirve para validar cuantizaciones alternativas o para comparar recetas de compresión en producción.
- Preprocesado en cadenas RAG: puede actuar como clasificador previo que decide qué recuperador o qué herramienta invocar antes de llamar a un modelo generativo mayor, reduciendo coste y latencia.

## Benchmarks y rendimiento

Datos publicados en la model card, comparando la variante cuantizada con el modelo base BF16 (`vllm-sr/d3-edge`):

| Evaluacion | BF16 base | d3-edge-W4A16-HGPTQ |
|---|---:|---:|
| Tamano de safetensors (incl. readout) | 1,11 GiB (1.189.722.528 B) | 0,65 GiB (695.386.416 B) |
| Acuerdo top-1 en decisiones (12 preguntas) | 100,00 % | 100,00 % |
| Divergencia KL de probabilidad por opción (media / max, nats) | 0,000000 | 0,000934 / 0,005042 |
| Similitud coseno de logits del readout de 255 códigos | 1,000000 | 0,995193 |
| KL de softmax sobre 255 códigos (nats) | 0,000000 | 0,008751 |
| Torre de visión (`vision-probe-v2`, 96 imágenes, 50.596 tokens) | 1,000000 cos | 0,974388 cos medio (0,953108 mínimo) |
| Guardia de visión `vision-guard-v2` | no disponible | 0,974515 cos medio (0,953134 mínimo) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 1 GiB para los pesos cuantizados (0,65 GiB) más overhead de activaciones, caché y contexto; en la práctica, 2-4 GiB son suficientes para lotes pequeños.
- GPU recomendadas: cualquier GPU con soporte de `compressed-tensors` y al menos 4 GiB de VRAM; tarjetas de consumo como RTX 3060, RTX 4060 o RTX 4090 son suficientes. Para despliegue en servidor, A100 o H100 no son necesarias pero funcionan.
- Cabe en GPU de consumo: sí, con margen amplio, incluida la gama de entrada con 4-6 GiB.
- Opciones de despliegue: `transformers` con `custom_code` y el runtime `d3_runtime` (`D3.from_pretrained`), así como `warp-34`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---:|---|---|---|---|
| d3-edge-W4A16-HGPTQ | 594.321.600 | no disponible | safetensors `compressed-tensors` W4A16 | Apache 2.0 | Variante cuantizada, 0,65 GiB, 100 % acuerdo top-1 |
| vllm-sr/d3-edge (BF16) | 594.321.600 | no disponible | safetensors BF16 | Apache 2.0 | Modelo base, 1,11 GiB, referencia de calidad |
| Alternativas de clasificación tipo encoder | no disponible | no disponible | no disponible | no disponible | No se dispone de comparativas publicadas con otros modelos de decisión |

No se dispone de información sobre otros modelos de decisión comparables con métricas equivalentes; la comparativa se limita al par base/cuantizado.

## Limitaciones y advertencias

- El modelo no es generativo: no produce texto libre ni mantiene conversaciones; su salida es una distribución sobre 255 códigos de decisión predefinidos. Usarlo fuera de ese contrato requiere adaptar la cabeza de lectura.
- El acuerdo top-1 del 100 % se midió sobre 12 preguntas; la muestra es reducida y no garantiza el mismo comportamiento en dominios no representados en la calibración.
- La divergencia KL media de 0,000934 nats y la similitud coseno de 0,995193 indican degradación pequeña pero no nula; en decisiones con opciones muy próximas, la cuantización puede alterar el orden.
- La torre de visión pierde fidelidad de forma más acusada (coseno medio 0,974, mínimo 0,953); las tareas visuales son más sensibles a la cuantización que las textuales.
- No hay información sobre idiomas soportados ni sobre sesgos conocidos del modelo base; no se puede asumir cobertura multilingüe.
- No se documenta la longitud de contexto, lo que impide planificar estados largos con garantías.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de `custom_code` y del runtime `d3_runtime`, cuya disponibilidad y mantenimiento no están garantizados por el autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación independiente.
- El modelo base es `vllm-sr/d3-edge`, un proyecto de investigación; conviene verificar su estado antes de integrarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/d3-edge-W4A16-HGPTQ
- Modelo base: https://huggingface.co/vllm-sr/d3-edge
- Repositorio del runtime: no disponible
- Paper o blog técnico: no disponible
- Demo: no disponible
