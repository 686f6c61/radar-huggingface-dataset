# Avifenesh/GLM-5.3-Flash-NVFP4

## Resumen

GLM-5.3-Flash-NVFP4 es una cuantización de pesos a 4 bits del modelo zai-org/GLM-5.3-Flash, publicada por el usuario Avifenesh (tiyuvta). No es un modelo nuevo, sino un "mint" de precisión: toma el gemelo BF16 del modelo original (656 GB) y lo comprime a 190,8 GB mediante NVFP4, un formato de 4 bits con escalas FP8-e4m3 por bloque de 16 elementos, lo que resulta en 4,5 bits por elemento. El resultado son 20 shards de safetensors con 38.770 tensores, de los cuales 37.338 están cuantizados y 1.432 se mantienen en precisión original.

La relevancia de esta ficha reside en que GLM-5.3-Flash es una arquitectura híbrida singular: 45 capas de decoder más una capa MTP, de las cuales 34 son de atención lineal KDA y 11 son DSA (MLA con indexador disperso), con MoE en 42 capas de 288 expertos enrutados más uno compartido y 3 capas densas. Con 321.323.031.390 parámetros totales (dato real de safetensors), el modelo completo es inabordable en hardware de consumo, y esta cuantización NVFP4 busca reducirlo a un tamaño manejable en GPUs Blackwell manteniendo una fidelidad de logits comparable a la cuantización FP8 del propio proveedor.

La cuantización se realizó con NVIDIA TensorRT Model Optimizer 0.46.0 en esquema W4A16 (solo pesos, activaciones intactas) y se validó contra un ejecutor de referencia f32 sin fusionar. La licencia es MIT, lo que facilita su uso comercial, aunque conviene revisar las condiciones del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con atención lineal KDA (34 capas), DSA/MLA con indexador disperso (11 capas), 45 capas de decoder + 1 capa MTP, 3 capas densas |
| Parametros totales | 321.323.031.390 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (e2m1 pesos, escalas e4m3 por bloque de 16, macro-escala f32 por tensor, 4,5 bits/elemento); esquema W4A16; también etiquetado como 8-bit en algunos tensores no cuantizados |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (20 shards, 38.770 tensores) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash emplea una pila híbrida poco convencional. De las 45 capas de decoder más la capa MTP, 34 usan KDA (atención lineal), 11 usan DSA (atención MLA con indexador disperso) y 3 son densas. El componente MoE se aplica en 42 capas con 288 expertos enrutados más un experto compartido. Esta combinación busca reducir el coste de atención en contextos largos manteniendo capacidad de modelado mediante mezcla de expertos. El informe técnico upstream se titula "GLM-5: from Vibe Coding to Agentic Engineering" (arXiv 2602.15763).

El proceso de cuantización parte del gemelo BF16 del proveedor, no de su release FP8, siguiendo el principio de no cuantizar sobre una cuantización previa cuando existe la versión de precisión completa. Se usó `nvidia-modelopt` 0.46.0 con el esquema `W4A16_NVFP4`, sin calibración: las escalas de bloque se derivan del propio tensor de pesos, por lo que no se ejecuta ningún forward de calibración ni se introducen estadísticas de activaciones en el checkpoint. El empaquetado se hizo tensor a tensor por streaming, dado que los 656 GB de BF16 no caben en memoria de una sola máquina. La división de precisión replica las exclusiones FP8 del proveedor: se cuantizan expertos enrutados, expertos compartidos, MLPs densos y proyecciones MLA; se mantienen sin cuantizar todos los tensores KDA, `kv_b_proj`, tensores de hiperconexión mHC, gates del router, `e_score_correction_bias`, normas, `embed_tokens`, `lm_head` y la torre de visión. La lista de exclusión se incluye en `config.json` en dos dialectos (`modules_to_not_convert` y `ignore` de compressed-tensors, 628 entradas cada uno) para evitar que cargadores que leen solo uno de los formatos recodifiquen inadvertidamente las proyecciones KDA a 8 bits.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento y codificación, según el enfoque del informe upstream ("from Vibe Coding to Agentic Engineering").
- Soporte de tool calling / function calling, según las etiquetas del repositorio.
- Capacidades de agente y razonamiento multi-paso, implícitas en el enfoque del modelo base.
- Procesamiento multimodal: el modelo base incluye una torre de visión, aunque en esta cuantización la torre se mantiene sin cuantizar (no se especifica si la funcionalidad de visión está operativa en este artefacto).
- Capa MTP (multi-token prediction) presente en la arquitectura, potencialmente útil para decodificación especulativa.
- No se documentan capacidades de audio ni modo "thinking" explícito en la información disponible.

## Casos de uso

- Despliegue en GPUs Blackwell con memoria limitada: la cuantización NVFP4 reduce el peso de 656 GB (BF16) a 190,8 GB, lo que permite servir el modelo en configuraciones multi-GPU Blackwell donde la versión BF16 no cabría. Requiere un motor con kernels NVFP4, como el motor tiyuvta empleado en la validación.
- Investigación en cuantización de modelos MoE híbridos: el artefacto sirve como referencia reproducible para estudiar cómo se comporta una pila con atención lineal KDA y MLA dispersa bajo cuantización de 4 bits, con una puerta de validación documentada (comparación de logits contra BF16 y FP8).
- Evaluación de fidelidad de logits: los datos de la puerta (argmax coincidente, top-3 rank-identical, max_abs 3,117 frente a BF16) permiten a un equipo verificar si la desviación de esta cuantización es aceptable para su caso antes de integrarla.
- Generación de código asistida en pipelines internos: el modelo base está orientado a codificación y agentes; con tool calling puede integrarse en flujos de generación y revisión de código, siempre que el motor de servicio soporte el formato NVFP4.
- Atención al cliente bilingüe inglés-chino: el modelo soporta ambos idiomas, aunque no se dispone de datos de longitud de contexto para dimensionar conversaciones multi-turno largas.
- Servicio de agentes con llamadas a herramientas: las etiquetas de tool-calling y el enfoque agéntico del modelo base lo hacen candidato para orquestación de tareas, sujeto a validación propia de la calidad en decodificación muestreada, que la puerta publicada no cubre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye únicamente una puerta de fidelidad de logits sobre la última posición del vocabulario (154.880 logits), ejecutada con el ejecutor de referencia f32 del motor tiyuvta:

| Comparación | Argmax | Top-k idéntico | max_abs | mean_abs |
|---|---|---|---|---|
| Esta cuantización NVFP4 vs su fuente BF16 | MATCH | top-3 | 3,117 | 0,534 |
| FP8 del proveedor vs la misma fuente BF16 | MATCH | top-3 | 3,489 | 0,490 |
| Esta cuantización NVFP4 vs FP8 del proveedor | MATCH | top-5 | 4,184 | 0,705 |

La comparación relevante es la primera: frente a su propia fuente de precisión completa, la desviación de esta cuantización de 4 bits es comparable a la desviación de la cuantización de 8 bits del proveedor. La model card advierte explícitamente que esta puerta no evalúa precisión en generaciones largas, comportamiento en contexto largo, calidad de decodificación muestreada ni kernels de cuantización fusionados de ningún motor.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 190,8 GB en safetensors NVFP4; se necesita al menos esa cantidad de memoria agregada, más overhead de activaciones y caché KV (no cuantificada).
- GPU recomendadas: GPUs NVIDIA Blackwell, que son el objetivo declarado del artefacto (etiqueta `blackwell` y validación en "RTX Blackwell").
- No cabe en una GPU de consumo individual: 190,8 GB excede la VRAM de cualquier tarjeta consumer actual, por lo que requiere configuración multi-GPU o GPUs de centro de datos con memoria agregada suficiente.
- Opciones de despliegue: el artefacto fue construido y validado con el motor de servicio tiyuvta; para otros motores se requieren kernels NVFP4 compatibles con el layout de escalas de modelopt (no CUTLASS-swizzled). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-NVFP4 (este) | 321,3 B | no disponible | NVFP4 W4A16, 190,8 GB | MIT | Hugging Face, 333 descargas |
| zai-org/GLM-5.3-Flash (BF16) | 321,3 B (aproximado) | no disponible | BF16, 656 GB | no disponible en la información | Hugging Face |
| zai-org/GLM-5.3-Flash (FP8 del proveedor) | 321,3 B (aproximado) | no disponible | FP8 | no disponible en la información | Hugging Face |

No se dispone de datos de benchmarks comparativos con modelos de otras familias; la única comparación documentada es la de fidelidad de logits entre las tres variantes de GLM-5.3-Flash recogida en la sección anterior.

## Limitaciones y advertencias

- La puerta de validación solo cubre la fila de logits de la última posición; no garantiza calidad en generaciones largas, contexto largo ni decodificación muestreada.
- Los kernels de cuantización fusionados de motores de servicio no han sido validados; la referencia usa dequantización a f32, por lo que el comportamiento en producción puede diferir.
- El artefacto se describe como "bring-up artifact", es decir, un trabajo de puesta en marcha con mediciones fechadas en hardware concreto, no un release pulido de producción.
- Solo se declaran idiomas inglés y chino; el rendimiento en castellano no está documentado.
- La torre de visión se mantiene sin cuantizar y no se especifica si la funcionalidad multimodal está disponible en este artefacto.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben evaluarse sobre el modelo base.
- La licencia del artefacto es MIT, pero conviene verificar las condiciones del modelo base zai-org/GLM-5.3-Flash antes de uso comercial.
- La lista de exclusión duplicada en dos dialectos advierte de un riesgo real: cargadores que lean un solo dialecto pueden recodificar tensores KDA a 8 bits, alterando el comportamiento previsto.
- El formato NVFP4 requiere hardware Blackwell y motores con soporte específico; no es portable a GPUs anteriores sin conversión.

## Enlaces

- Hugging Face: https://huggingface.co/Avifenesh/GLM-5.3-Flash-NVFP4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Informe técnico upstream: https://arxiv.org/abs/2602.15763
- NVIDIA TensorRT Model Optimizer: https://github.com/NVIDIA/TensorRT-Model-Optimizer
- tiyuvta: https://tiyuvta.ai/
