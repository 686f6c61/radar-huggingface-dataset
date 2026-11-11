# nchapman/d3-turbo-W4A16-HGPTQ

## Resumen

d3-turbo-W4A16-HGPTQ es una cuantización de 4 bits del modelo vllm-sr/d3-turbo, un modelo de decisión de un solo paso (single-pass decision model) basado en la arquitectura Qwen3.5 con readout de 255 códigos (code-readout-v1). Lo publica nchapman, que actúa como cuantizador, no como autor del modelo original. El objetivo es reducir el coste de despliegue del checkpoint BF16 original (48,59 GiB) manteniendo prácticamente intacta la calidad de decisión.

La arquitectura combina 64 capas con GatedDeltaNet híbrido y atención completa, con hidden_size de 5120 y una torre de visión de 27 bloques ViT. El modelo no genera texto libre: su pipeline es feature-extraction y su salida es una distribución sobre 255 códigos de decisión, lo que lo orienta a tareas de clasificación estructurada (choice, yes_no, multi_select, scale) sobre estados y preguntas.

La relevancia práctica está en la compresión: pasa de 48,59 GiB a 14,69 GiB (3,31× menor) conservando un 100,00% de acuerdo top-1 en la evaluación de decisión y una similitud coseno de logits de readout de 0,999720 frente a la referencia BF16. Es una opción interesante para servir decisiones estructuradas en GPU de gama alta consumer o en una sola A100/H100 con margen para la torre de visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido GatedDeltaNet + atención completa (Qwen3.5), 64 capas, hidden_size 5120, con torre de visión ViT de 27 bloques |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 GPTQ con rotación Walsh-Hadamard (H_64), group_size 64, actorder static, dampening_frac 0.01; capas de visión en g64-h64 y linear_fc2 en GPTQ per-channel con Hadamard head_dim 16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), con claves canónicas `model.language_model.*` y `model.visual.*`, `quantization_status: compressed` |

## Arquitectura y entrenamiento

El modelo base es vllm-sr/d3-turbo, descrito como un modelo de decisión single-pass con readout de 255 códigos (code-readout-v1) sobre una arquitectura Qwen3.5 de 64 capas y hidden_size 5120. El forward combina bloques híbridos GatedDeltaNet con atención completa; la cuantización se calibró capa a capa bajo atención `prefix_bidir`. Incluye una torre de visión de 27 bloques ViT con merger, lo que permite procesar entradas multimodales además de texto.

Esta ficha corresponde a la cuantización, no al entrenamiento del modelo original. El proceso aplicado es un GPTQ de 4 bits con rotación de entrada Walsh-Hadamard 64×64 (Sylvester, H_64) e inicialización por MSE con descomposición de Cholesky, group_size 64, actorder estático y dampening del 1%. Se cuantizan 537 capas lineales: 400 del lenguaje (q_proj, k_proj, v_proj, o_proj, in_proj_qkv, in_proj_z, out_proj, gate_proj, up_proj, down_proj) y 137 de visión (qkv, proj, linear_fc1, linear_fc2 y merger). Se mantienen en BF16 el readout (`weight` [255, 5120]), embed_tokens, in_proj_a, in_proj_b, normas, biases y patch_embed.proj. No se dispone de información sobre el dataset de entrenamiento del modelo base, número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Decisión estructurada de un solo paso sobre 255 códigos de readout, con tareas de tipo choice, yes_no, multi_select y scale.
- Evaluación con promediado de permutación directa e inversa de opciones para robustez frente al orden.
- Procesamiento multimodal: torre de visión de 27 bloques ViT con merger, validada con 96 imágenes y 50.596 tokens visuales.
- Extracción de características (pipeline feature-extraction) en lugar de generación de texto libre.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo se describe explícitamente como single-pass.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Clasificación de intención en atención al cliente: el modelo recibe un estado textual (por ejemplo, un pedido con incidencia) y una pregunta con criterios tipo choice, y devuelve la distribución sobre opciones. El readout de 255 códigos permite mapear intenciones discretas sin generar texto.
- Enrutado de tickets y triaje: usar tareas yes_no o multi_select para decidir si un caso requiere escalado, reembolso o facturación, aprovechando el acuerdo top-1 del 100% frente al BF16 en la evaluación publicada.
- Moderación y verificación de contenido con imagen: la torre de visión (similitud coseno media 0,995415 frente a BF16) permite clasificar imágenes o pares imagen-texto con las mismas preguntas estructuradas.
- Extracción de señales en pipelines de datos: al ser feature-extraction, se puede usar para producir representaciones o decisiones intermedias en un ETL, con un footprint de 14,69 GiB que cabe en una sola GPU de 24 GB en despliegues ajustados.
- Evaluación automática de respuestas: tareas de tipo scale permiten puntuar salidas de otros modelos con una escala definida en los criterios, usando el promediado de permutación para reducir sesgo posicional.
- Sustitución de un clasificador supervisado en producción: el modelo acepta instrucciones y criterios en la propia pregunta, lo que reduce el trabajo de reentrenamiento cuando cambian las categorías, manteniendo coherencia con el BF16 (KL media de 0,000081 nats).
- Despliegue en endpoints compatibles: las etiquetas indican compatibilidad con endpoints, lo que facilita servirlo detrás de una API interna de decisión.

## Benchmarks y rendimiento

| Evaluación | BF16 base (vllm-sr/d3-turbo) | d3-turbo-W4A16-HGPTQ | Notas |
|---|---:|---:|---|
| Tamano safetensors (incl. readout) | 48,59 GiB (52.176.025.120 B) | 14,69 GiB (15.772.221.072 B) | 3,31× compresión (−33,90 GiB) |
| Acuerdo top-1 de decisión (12 preguntas) | 100,00% | 100,00% | Promediado de permutación directa e inversa |
| KL de probabilidad de opciones (media / máx, nats) | 0,000000 | 0,000081 / 0,000960 | Distribución normalizada por pregunta |
| Similitud coseno de logits del readout de 255 códigos | 1,000000 | 0,999720 | KL de softmax de 255 códigos: 0,000185 nats |
| Torre de visión (vision-probe-v2, 96 imágenes, 50.596 tokens) | 1,000000 cos | 0,995415 media (0,979420 mín) | vision-guard-v2: 0,996311 media (0,990553 mín) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 14,69 GiB en W4A16; con overhead de activaciones y contexto hay que prever margen adicional, por lo que una GPU de 24 GB es el mínimo razonable y 32-48 GB da holgura.
- GPU recomendadas: A100 40/80 GB, H100, L40S; en consumer, RTX 4090 (24 GB) o RTX 5090 según disponibilidad.
- Cabe en GPU consumer: sí, en RTX 4090 de 24 GB con cuantización W4A16 y contexto moderado; en GPUs de 16 GB no es viable sin reducir más la precisión.
- Opciones de despliegue: el modelo se carga con `D3.from_pretrained` del paquete `d3_runtime` y con `Qwen3_5Model.from_pretrained`; usa compressed-tensors, por lo que encaja en stacks compatibles con GPTQ/compressed-tensors. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput: no disponibles. El modelo es single-pass, lo que en principio reduce la latencia frente a esquemas autoregresivos, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| d3-turbo-W4A16-HGPTQ | 26,09 B | no disponible | W4A16 GPTQ + Hadamard | Apache 2.0 | Esta ficha; 14,69 GiB, decisión estructurada |
| vllm-sr/d3-turbo (BF16) | 26,09 B | no disponible | BF16 | Apache 2.0 (según modelo base) | Referencia de calidad; 48,59 GiB |
| Qwen3.5 base (familia) | no disponible | no disponible | múltiples | no disponible | Arquitectura subyacente; no es un modelo de decisión |
| Clasificadores supervisados dedicados | variable | n/a | n/a | variable | Requieren reentrenamiento al cambiar categorías; no comparables en calidad directamente |

No se dispone de datos de benchmarks cruzados con alternativas de la misma categoría (modelos de decisión con readout de códigos), por lo que la comparación cuantitativa con terceros no está disponible.

## Limitaciones y advertencias

- El modelo no es generativo: no produce texto libre, solo distribuciones sobre códigos de decisión; usarlo fuera de ese paradigma requiere adaptación.
- No se documentan sesgos conocidos ni composición del dataset de entrenamiento del modelo base, lo que impide evaluar riesgos de sesgo por idioma, género o dominio.
- Riesgo de alucinación: al ser un modelo de decisión, el riesgo se traslada a decisiones incorrectas con alta confianza; la KL máxima de 0,000960 nats indica desviaciones pequeñas pero no nulas frente a BF16.
- La cuantización degrada ligeramente la torre de visión (coseno mínimo 0,979420), lo que puede afectar a tareas visuales finas.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe homogéneo.
- Longitud de contexto no disponible; planificar el despliegue sin asumir ventanas largas.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base vllm-sr/d3-turbo, que no se detallan aquí.
- El paquete `d3_runtime` es necesario para la API de decisión mostrada; su madurez, mantenimiento y compatibilidad con versiones de transformers no están documentados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/nchapman/d3-turbo-W4A16-HGPTQ
- Modelo base: https://huggingface.co/vllm-sr/d3-turbo
- Repositorio de pesos en safetensors: incluido en el propio repo de Hugging Face
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada
