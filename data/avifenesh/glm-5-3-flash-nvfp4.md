# Avifenesh/GLM-5.3-Flash-NVFP4

## Resumen

GLM-5.3-Flash-NVFP4 es una cuantización weight-only en formato NVFP4 (4-bit) del modelo GLM-5.3-Flash de Z.ai, producida por Avifenesh con NVIDIA TensorRT Model Optimizer 0.46.0. El modelo base es un MoE híbrido de 164.124 millones de parámetros (según el checkpoint cuantizado) con arquitectura que combina atención lineal KDA y DSA (MLA con indexador disperso), diseñado para tareas de codificación, agente y conversación multimodal. Esta versión cuantizada reduce la huella de memoria de 656 GB (BF16) a 190.8 GB, manteniendo una fidelidad comparable a la cuantización FP8 oficial del vendor, según las pruebas de logits publicadas.

La relevancia de este artefacto radica en que permite ejecutar un modelo de gran tamaño en GPUs NVIDIA Blackwell con requisitos de VRAM más asequibles, y sirve como referencia técnica para la comunidad sobre cómo aplicar NVFP4 sin calibración y validar la integridad de la cuantización. Está construido y validado con el motor de inferencia memra, un motor Rust/CUDA de código abierto para RTX Blackwell, y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido: 45 capas decoder + 1 MTP, 34 capas KDA (atención lineal), 11 capas DSA (MLA con indexador disperso), 42 capas MoE con 288 expertos enrutados + 1 compartido, 3 capas densas, torre de visión |
| Parametros totales | 164.124.711.774 (164B) |
| Parametros activos | 18B (según lmstudio.ai) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4-bit e2m1, escalas e4m3 por bloque de 16, 4.5 bits/elemento) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (20 shards, 190.8 GB) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un MoE híbrido que combina atención lineal (KDA) con atención de bajo rango con indexador disperso (DSA), sobre 45 capas decoder más una capa MTP (multi-token prediction). La cuantización NVFP4 es weight-only: los pesos se representan en formato e2m1 (4 bits) con escalas dinámicas por bloque de 16 en e4m3 y una macro-escala f32 por tensor, resultando en 4.5 bits por elemento. No se realizó calibración porque el esquema NVFP4 deriva las escalas directamente de los pesos, sin necesidad de pases hacia adelante. El proceso de cuantización se aplicó sobre el checkpoint BF16 oficial (656 GB), no sobre la versión FP8, y se excluyeron de la cuantización los tensores de atención KDA, proyecciones `kv_b_proj`, conexiones mHC, router gates, normas, embeddings, `lm_head` y la torre de visión, siguiendo el mismo criterio que el vendor para su FP8. El motor memra, escrito en Rust y CUDA, se utilizó tanto para la cuantización como para la validación mediante un ejecutor de referencia f32 sin fusionar.

## Capacidades

- Generación de texto y conversación multi-turno, con soporte para tool calling y function calling (etiquetado en el modelo).
- Capacidades multimodales: incluye torre de visión, lo que permite procesar imágenes junto con texto (según lmstudio.ai).
- Razonamiento y codificación: el modelo base GLM-5.3 está optimizado para tareas de programación complejas y trabajo agente de largo horizonte.
- Soporte de agentes y multi-step reasoning, gracias a la arquitectura híbrida y al entrenamiento post-entrenamiento sobre GLM-5.2.
- Multilingüe: inglés y chino (según la ficha de HuggingFace).
- Inferencia eficiente en GPUs Blackwell gracias a la cuantización NVFP4 y al motor memra.

## Casos de uso

- Inferencia local en estaciones de trabajo con RTX Blackwell: el modelo cuantizado cabe en GPUs con 192 GB de VRAM (p. ej., B200), permitiendo ejecutar un MoE de 164B parámetros sin depender de APIs externas.
- Evaluación de fidelidad de cuantización: investigadores pueden comparar la salida de este NVFP4 contra el BF16 original usando el ejecutor de referencia f32 de memra, como se documenta en la model card.
- Desarrollo de agentes con tool calling: al soportar function calling, puede integrarse en pipelines de automatización que requieran llamadas a herramientas, con la ventaja de ejecución local y sin coste por token.
- Prototipado de aplicaciones multimodales: la torre de visión permite experimentar con tareas que combinan imagen y texto, como descripción de imágenes o razonamiento visual, en entornos controlados.
- Investigación en técnicas de cuantización weight-only: el proceso documentado (sin calibración, con validación de logits) sirve como referencia para reproducir cuantizaciones NVFP4 en otros modelos.
- Análisis de arquitecturas híbridas KDA/DSA: al estar disponible el checkpoint cuantizado, se puede estudiar el comportamiento de la atención lineal y el indexador disperso en tareas de largo contexto, aunque la longitud de contexto no se ha especificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye una comparación de fidelidad de logits entre el NVFP4, el BF16 fuente y el FP8 del vendor, medida con el ejecutor de referencia f32 de memra:

| comparacion | argmax | top-k rank-identical | max_abs | mean_abs |
|---|---|---|---|---|
| NVFP4 vs BF16 fuente | MATCH | top-3 | 3.117 | 0.534 |
| FP8 vendor vs BF16 fuente | MATCH | top-3 | 3.489 | 0.490 |
| NVFP4 vs FP8 vendor | MATCH | top-5 | 4.184 | 0.705 |

Estos datos indican que la desviación del NVFP4 respecto a su fuente BF16 es comparable a la del FP8 oficial, a la mitad del ancho de bits. No obstante, la model card advierte que esta validación no cubre precisión en generación larga, comportamiento en contexto largo ni calidad de decodificación muestreada.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 190.8 GB en disco; en inferencia, los pesos cuantizados requieren aproximadamente esa cantidad en VRAM, más overhead de activaciones y KV cache. Se recomienda una GPU con al menos 192 GB de VRAM (p. ej., NVIDIA B200) o múltiples GPUs con paralelismo.
- GPU recomendadas: RTX Blackwell (serie B200, RTX PRO 6000 Blackwell con 96 GB no es suficiente para carga completa; se necesitarían 2 o más con paralelismo de datos o de capas).
- Opciones de despliegue: el motor memra (Rust/CUDA) es el soporte principal; también podría usarse vLLM u otros motores que soporten NVFP4, aunque no se ha confirmado en la documentación.
- Latencia y throughput: no se han publicado mediciones de rendimiento en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Precision | Tamano checkpoint | Licencia | Contexto |
|---|---|---|---|---|---|
| GLM-5.3-Flash-NVFP4 (este) | 164B (cuantizado) | NVFP4 4-bit | 190.8 GB | MIT | no disponible |
| GLM-5.3-Flash-BF16 (fuente) | 164B (según checkpoint) | BF16 | 656 GB | MIT | no disponible |
| GLM-5.3-Flash-FP8 (vendor) | 164B (según checkpoint) | FP8 | no disponible | MIT | no disponible |
| Qwen3-235B-A22B (referencia) | 235B | BF16/FP8 | ~470 GB (BF16) | Apache 2.0 | 32K (ampliable) |

La comparativa se limita a características porque no hay datos de rendimiento en tareas. El NVFP4 ofrece una reducción de memoria significativa frente al BF16, con una fidelidad similar al FP8, a costa de requerir hardware Blackwell específico.

## Limitaciones y advertencias

- Es un artefacto de bring-up, no un servicio alojado: no hay endpoint ni soporte de producción, según la model card.
- La validación de fidelidad no cubre precisión en generación larga, comportamiento en contexto largo ni calidad de decodificación muestreada; los kernels de matmul cuantizados no han sido evaluados.
- Solo soporta inglés y chino; no se garantiza rendimiento en otros idiomas.
- Requiere hardware NVIDIA Blackwell; no es compatible con GPUs de generaciones anteriores.
- La cuantización puede introducir errores en tareas sensibles a la precisión numérica, aunque la comparación de logits muestra desviaciones acotadas.
- No se ha especificado la longitud de contexto, lo que limita su uso en aplicaciones que requieran ventanas largas.
- El tamaño del checkpoint (190.8 GB) sigue siendo elevado para la mayoría de estaciones de trabajo, limitando su despliegue a hardware de gama alta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Avifenesh/GLM-5.3-Flash-NVFP4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Informe técnico GLM-5: https://arxiv.org/abs/2602.15763
- NVIDIA TensorRT Model Optimizer: https://github.com/NVIDIA/TensorRT-Model-Optimizer
- Motor memra: https://github.com/avifenesh/memra
- Inferencia tiyuvta: https://inference.tiyuvta.ai
- Ficha de GLM-5.3-Flash en lmstudio.ai: https://lmstudio.ai/models/glm-5.3-flash
- Documentación de Z.ai sobre GLM-5.3: https://docs.z.ai/guides/llm/glm-5.3
