# nchapman/d3-ultra-W4A16-HGPTQ

## Resumen

d3-ultra-W4A16-HGPTQ es una cuantización de 4 bits del modelo vllm-sr/d3-ultra, un modelo de decisión de paso único ("single-pass decision model") construido sobre una arquitectura Qwen3.5 híbrida. Lo ha cuantizado nchapman combinando una rotación Walsh-Hadamard de 64×64 con GPTQ inicializado por Cholesky (variante que el autor denomina HGPTQ), con tamaño de grupo 64 y activaciones en BF16 (esquema W4A16). El resultado comprime el checkpoint BF16 original de 48,59 GiB a 14,69 GiB, una reducción de 3,31×, manteniendo una concordancia top-1 del 100,00 % en las tareas de decisión evaluadas.

El modelo subyacente no es un generador de texto conversacional al uso: su pipeline declarado es feature-extraction y su propósito es emitir decisiones estructuradas mediante una cabeza de lectura de 255 códigos (`readout.safetensors`, matriz de 255×5120). Las preguntas se formulan como tareas tipadas (`choice`, `yes_no`, `multi_select`, `scale`) y el modelo produce distribuciones de probabilidad sobre las opciones en una única pasada hacia delante.

Es relevante para quienes necesitan desplegar un modelo de 26 000 millones de parámetros con torre de visión en hardware modesto sin perder fidelidad de decisión. La cuantización preserva la cabeza de lectura y las proyecciones críticas en BF16, y mantiene una similitud coseno de logits de 0,999492 frente a la referencia, lo que la hace viable para producción en clasificación y enrutamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido GatedDeltaNet + atención completa, con torre de visión ViT (27 bloques) y cabeza de lectura de 255 códigos |
| Parámetros totales | 26.085.330.160 (26,09 mil millones) |
| Parámetros activos | No aplica (no es MoE; no disponible el desglose denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | W4A16 (pesos 4 bits, activaciones 16 bits), GPTQ con grupo de 64, rotación Hadamard, `actorder="static"`, `dampening_frac=0.01` |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, `quantization_status: compressed`) |

## Arquitectura y entrenamiento

El backbone consta de 64 capas con `hidden_size=5120` y combina capas GatedDeltaNet (atención lineal con estado recurrente) con capas de atención completa. La cuantización se aplicó bajo atención `prefix_bidir`, es decir, con atención bidireccional sobre el prefijo, lo que condiciona el calibrado de las capas. Se cuantizaron 537 capas lineales: 400 del modelo de lenguaje (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `in_proj_qkv`, `in_proj_z`, `out_proj`, `gate_proj`, `up_proj`, `down_proj`) y 137 de la torre de visión (27 bloques ViT más el merger). La rotación Hadamard se aplica en línea con `head_dim=64` para el lenguaje y `head_dim=16` para `linear_fc2` de la visión, con GPTQ por canal en esa capa concreta.

Se mantuvieron en BF16 la cabeza de lectura (`readout.safetensors`), `embed_tokens`, `linear_attn.in_proj_a`, `linear_attn.in_proj_b`, las normas, los sesgos y `visual.patch_embed.proj`. El calibrado es capa por capa con inicialización MSE y descomposición de Cholesky de la matriz de Hessiana. No se dispone de información sobre el dataset de entrenamiento original (número de tokens, composición, RLHF/DPO) ni sobre el proceso de calibración más allá de lo indicado. Las claves safetensors usan prefijos canónicos `model.language_model.*` y `model.visual.*`, y cargan sin claves faltantes ni inesperadas en `Qwen3_5Model.from_pretrained`, `D3.from_pretrained` y `warp-34`.

## Capacidades

- Emisión de decisiones estructuradas de paso único sobre preguntas tipadas: `choice`, `yes_no`, `multi_select` y `scale`.
- Cabeza de lectura de 255 códigos que produce una distribución de probabilidad normalizada sobre opciones.
- Procesamiento de estado textual y de imágenes (torre de visión de 27 bloques con merger).
- Extracción de características (pipeline `feature-extraction`) y representaciones internas de 5120 dimensiones.
- Evaluación con permutación de opciones en orden directo e inverso, promediada, para mitigar sesgo posicional.
- Compatibilidad con endpoints (`endpoints_compatible`) y carga mediante `transformers`.
- No se documenta soporte de tool calling, agentes multi-paso, modo thinking ni audio.

## Casos de uso

- Clasificación de intenciones en atención al cliente: se formula el estado de la conversación y un conjunto de criterios (`invoice`, `refund`, etc.) como tarea `choice`, y el modelo devuelve la distribución sobre intenciones. La preservación del 100 % de concordancia top-1 permite sustituir el BF16 en este flujo.
- Enrutamiento de tickets: con tareas `multi_select` se pueden asignar varias etiquetas simultáneas (departamento, urgencia, tipo de incidencia) en una sola pasada, sin generación autoregresiva.
- Triaje documental con imágenes: la torre de visión cuantizada (similitud coseno media 0,995350 en `vision-probe-v2`) permite clasificar capturas, formularios o facturas escaneadas junto con texto de contexto.
- Moderación y verificación binaria: las tareas `yes_no` con promedio de permutaciones directa e inversa sirven para decidir si un contenido cumple una política concreta, con baja sensibilidad al orden de las opciones.
- Encuestas y escalas: las tareas `scale` permiten mapear texto libre a un valor ordinal (satisfacción, riesgo, prioridad) devolviendo la distribución completa para umbralizar después.
- Despliegue en una sola GPU de 24 GB: con 14,69 GiB de pesos, el modelo cabe en una RTX 4090 o L4 dejando margen para el estado de activaciones, algo inviable con el BF16 de 48,59 GiB.
- Investigación sobre cuantización extrema: el checkpoint sirve como referencia reproducible para estudiar el efecto de Hadamard + GPTQ con grupo 64 en arquitecturas híbridas con estado recurrente.

## Benchmarks y rendimiento

| Evaluación | BF16 base (vllm-sr/d3-ultra) | d3-ultra-W4A16-HGPTQ |
|---|---:|---:|
| Tamaño safetensors (incl. `readout.safetensors`) | 48,59 GiB (52.176.025.120 B) | 14,69 GiB (15.772.221.072 B) |
| Concordancia top-1 en decisión (12 preguntas) | 100,00 % | 100,00 % |
| Divergencia KL de probabilidad de opciones (media / máx., nats) | 0,000000 | 0,000012 / 0,000108 |
| Similitud coseno de logits de la cabeza de 255 códigos | 1,000000 | 0,999492 |
| KL de softmax de 255 códigos (nats) | 0,000000 | 0,000024 |
| Torre de visión (`vision-probe-v2`, 96 imágenes, 50.596 tokens visuales) | 1,000000 cos | 0,995350 media (0,977446 mín.) |
| `vision-guard-v2` | No disponible | 0,996736 media (0,992170 mín.) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 15-17 GiB solo para pesos; con activaciones y caché de estado recurrente, prever 18-22 GiB según longitud de contexto y lote.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para producción con lotes grandes; RTX 4090 (24 GB) o L4 (24 GB) para inferencia en lote 1.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 (24 GB) con margen ajustado; no en GPU de 16 GB o menos.
- Opciones de despliegue: `transformers` con `compressed-tensors` y el runtime `d3_runtime` (`D3.from_pretrained`); también `Qwen3_5Model.from_pretrained` y `warp-34`. El soporte en vLLM, llama.cpp u Ollama no está documentado en la información disponible (el formato W4A16 de compressed-tensors es compatible con vLLM, pero no se confirma para esta arquitectura híbrida).
- Latencia y throughput: no disponibles. Al ser un modelo de paso único sin generación autoregresiva, la latencia depende del número de opciones y de la longitud del estado, no de una secuencia de salida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d3-ultra-W4A16-HGPTQ | 26,09 B | No disponible | safetensors W4A16 GPTQ | Apache 2.0 | Hugging Face (0 descargas) |
| vllm-sr/d3-ultra (BF16) | 26,09 B | No disponible | safetensors BF16 | Apache 2.0 (según modelo base) | Hugging Face |
| Alternativas de clasificación de 7-8 B (p. ej. Qwen o Llama cuantizados) | 7-8 B | 32-128 K típicamente | GGUF / AWQ / GPTQ | Apache 2.0 o licencia comunitaria | Amplia |

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada, por lo que la comparación se limita a tamaño, formato y licencia. La ventaja principal frente al BF16 es la reducción de 3,31× en huella con pérdida de fidelidad de decisión prácticamente nula; la desventaja frente a clasificadores de 7-8 B es el mayor coste de memoria y la menor disponibilidad de tooling.

## Limitaciones y advertencias

- El modelo no es un generador de texto: no debe usarse para chat abierto ni para producir respuestas en lenguaje natural, solo para decisiones sobre opciones predefinidas.
- La evaluación de calidad se limita a 12 preguntas de decisión y a dos sondas de visión; es una muestra pequeña y no cubre dominios diversos ni idiomas distintos del evaluado.
- La divergencia KL máxima de 0,000108 nats y la similitud coseno de visión mínima de 0,977446 indican que pueden aparecer discrepancias en casos límite, especialmente con imágenes atípicas.
- No hay información sobre idiomas soportados; el comportamiento multilingüe no está verificado.
- No se documentan sesgos conocidos ni el dataset de entrenamiento original, lo que impide auditar la composición de los datos.
- Riesgo de alucinación: aunque el espacio de salida está restringido a opciones, el modelo puede asignar alta probabilidad a opciones incorrectas si el estado de entrada es ambiguo; se recomienda umbralizar y revisar casos de baja confianza.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base vllm-sr/d3-ultra y de los pesos originales.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en el mismo día (2026-11-11): no hay evidencia de validación por terceros.
- Requiere el runtime `d3_runtime` o código personalizado (`custom_code`) para cargar; el soporte en servidores de inferencia estándar no está confirmado.
- El calibrado se realizó bajo atención `prefix_bidir`; usos con otro patrón de atención pueden degradar la fidelidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/d3-ultra-W4A16-HGPTQ
- Modelo base: https://huggingface.co/vllm-sr/d3-ultra
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales.
