# Hooshaai/llava-qwen-0.5b-unified-rope-scienceqa

## Resumen

llava-qwen-0.5b-unified-rope-scienceqa es un checkpoint multimodal derivado de llava-hf/llava-interleave-qwen-0.5b-hf, publicado por el autor Hooshaai dentro del ecosistema NeuralOps. Se trata de un experimento de "cirugía de atención": en lugar de reentrenar el modelo completo, el autor sustituye el mecanismo de atención de 18 de las 24 capas del decodificador Qwen2 por un operador denominado UnifiedRoPE (familia `modern`), congela el resto de componentes (torre de visión SigLIP, proyector MLP, MLPs y embeddings) y aplica destilación de conocimiento sobre el subconjunto con imágenes de ScienceQA.

El modelo resuelve el problema de adaptar un VLM compacto a razonamiento visual STEM con un coste de entrenamiento mínimo: 285 pasos de optimización en una única RTX 3090 durante 120,5 segundos, con un pico de VRAM de 16.188 MB. El artefacto resultante ocupa 370,62 MB en FP16 (frente a 1,66 GB del base), lo que supone una reducción del 78,2 % y permite distribuirlo como un delta quirúrgico sobre el modelo original.

Su relevancia es doble: por un lado, demuestra que es posible mejorar la precisión en ScienceQA (del 63,75 % del teacher al 67,50 % tras la destilación) con una fracción mínima de parámetros modificados; por otro, ilustra un patrón de publicación de pesos modulares (solo atención + layernorms del decodificador) que reduce drásticamente el almacenamiento y el ancho de banda de distribución. La arquitectura base es un LLaVA interleaved con torre SigLIP congelada, proyector de 2 capas y decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA interleaved: torre de visión SigLIP (27 capas, congelada) + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64) con atención UnifiedRoPE en 18/24 capas |
| Parametros totales | Aproximadamente 0,5B (heredados del base llava-interleave-qwen-0.5b-hf); el delta guardado contiene 714 tensores de atención y layernorms |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el base LLaVA-Qwen-0.5B suele operar en el rango de 4K-8K, pero no se confirma) |
| Tipos de cuantizacion | Pesos guardados en FP16 (`attention_only_fp16`); no se documentan otras cuantizaciones |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, delta quirúrgico) + `surgical_manifest.json` (schema `neuralops.surgery/v2`) |

## Arquitectura y entrenamiento

El modelo parte de llava-hf/llava-interleave-qwen-0.5b-hf, un VLM que combina una torre de visión SigLIP congelada de 27 capas, un proyector MLP de 2 capas y un decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas y head_dim 64. La intervención quirúrgica reemplaza el mecanismo de self-attention en 18 de las 24 capas (esquema `hybrid_3_1`, es decir, tres capas modificadas por cada capa ancla) por el operador UnifiedRoPE, mientras que las 6 capas ancla cuadráticas `[3, 7, 11, 15, 19, 23]` conservan la atención original. También se entrenan las layernorms del decodificador. Permanecen congelados y excluidos del artefacto la torre de visión, el proyector multimodal, los MLPs del decodificador y los embeddings.

El entrenamiento se realizó en dos etapas de destilación de conocimiento sobre el dataset derek-thomas/ScienceQA (subconjunto con imágenes, split de validación), con 285 pasos totales (123 en la etapa 1 y 162 en la etapa 2) y una duración de 120,5 segundos en una RTX 3090 de 24 GB. El resultado declarado es una mejora de +8,12 puntos de precisión respecto al teacher (63,75 % → 67,50 %) y una reducción de perplejidad de 2,45 a 2,32. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto e imagen-a-texto (pipeline `image-text-to-text`): responde preguntas sobre imágenes en formato conversacional.
- Razonamiento visual STEM: entrenado específicamente sobre ScienceQA, con foco en preguntas de ciencia con soporte de figura.
- Respuesta de opción múltiple con formato de letra (A, B, C, D) para tareas de VQA.
- Conversación multi-turno con plantilla de chat (`chat_template.json` incluido).
- Procesamiento de imágenes mediante preprocesador SigLIP (`preprocessor_config.json`).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, audio ni thinking mode en la información proporcionada.

## Casos de uso

- Evaluación de preguntas de ciencia con figuras: el modelo está afinado sobre el subconjunto con imágenes de ScienceQA y responde con la letra de la opción correcta, lo que lo hace adecuado para prototipos de tutores educativos automáticos en STEM.
- Investigación en cirugía de atención: sirve como banco de pruebas reproducible para comparar UnifiedRoPE frente a atención cuadrática estándar en un VLM de 0,5B, con métricas declaradas y telemetría de entrenamiento.
- Destilación de conocimiento sobre VLMs pequeños: el pipeline de dos etapas (123 + 162 pasos en una sola RTX 3090) es replicable para experimentos de compresión con presupuesto de cómputo mínimo.
- Distribución de deltas quirúrgicos: el artefacto de 370,62 MB (frente a 1,66 GB del base) permite publicar adaptaciones de atención sin duplicar la torre de visión ni los embeddings, útil en pipelines de CI/CD de modelos.
- Prototipado rápido de VQA en local: cabe en una GPU de consumo (RTX 3090 con 16,2 GB de pico durante entrenamiento; la inferencia es notablemente más ligera) para demos de respuesta visual a preguntas.
- Benchmarking de operadores de atención: el zoo NeuralOps permite intercambiar `unified_rope` por otros operadores de la familia `modern` y medir el impacto en precisión y perplejidad sobre el mismo dataset.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Metrica | Teacher baseline | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) en ScienceQA (image-bearing, validation) | 63,75 | 59,38 | 67,50 | +8,12 |
| Perplexity en ScienceQA (image-bearing, validation) | 2,45 | 2,62 | 2,32 | -0,30 |

Telemetría de entrenamiento declarada: 285 pasos (etapa 1: 123, etapa 2: 162), 120,5 segundos, pico de VRAM 16.188 MB en RTX 3090, timestamp 2026-11-11T11:07:39Z.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento consumió 16.188 MB de pico en una RTX 3090 (24 GB), por lo que la inferencia en FP16 debería caber holgadamente en GPUs de 16 GB o más.
- GPU recomendadas: RTX 3090 (validada por el autor), RTX 4090, A100, H100.
- Cabe en GPU de consumo: sí, al menos en RTX 3090; previsiblemente también en RTX 4080/4090 y GPUs con 16 GB o más.
- Opciones de despliegue: el modelo se carga mediante `neuralops.hub.load_surgeried_model` (API del Hub NeuralOps); no se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI. El formato de pesos es un delta quirúrgico que requiere el modelo base llava-hf/llava-interleave-qwen-0.5b-hf para reconstruir el modelo completo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (img, val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-unified-rope-scienceqa | ~0,5B | no disponible | 67,50 % acc / 2,32 PPL | MIT | Hugging Face (delta 370,62 MB) |
| llava-hf/llava-interleave-qwen-0.5b-hf (base/teacher) | ~0,5B | no disponible | 63,75 % acc / 2,45 PPL | no disponible en la informacion | Hugging Face (1,66 GB FP16) |
| Pre-KD / zero-shot (mismo base con atención sustituida) | ~0,5B | no disponible | 59,38 % acc / 2,62 PPL | MIT (derivado) | No publicado como checkpoint independiente |

No se dispone de datos de otros VLMs comparables (por ejemplo, variantes de 0,5B a 1B) en la información proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente sobre ScienceQA (subconjunto con imágenes, split de validación); el rendimiento fuera de ese dominio no está caracterizado.
- Solo soporta inglés (`en`); no se documenta multilingüismo.
- Los benchmarks son declarados por el autor con `verified: false`; no han sido reproducidos de forma independiente.
- Riesgo de alucinación inherente a un VLM de 0,5B, especialmente en preguntas abiertas o imágenes fuera de distribución.
- El artefacto es un delta quirúrgico (solo atención + layernorms); requiere el modelo base para funcionar y no es un checkpoint autónomo en safetensors estándar.
- La carga depende de la librería `neuralops` y de su API `load_surgeried_model`; no hay garantía de compatibilidad con ecosistemas estándar (transformers, vLLM).
- Licencia MIT permite uso comercial, pero el modelo base llava-interleave-qwen-0.5b-hf puede tener sus propias condiciones que conviene revisar antes de producción.
- Longitud de contexto no documentada; no asumir ventanas largas sin verificación.
- El autor reporta 26 descargas y 0 likes en el momento de la ficha, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-unified-rope-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Dataset: https://huggingface.co/datasets/derek-thomas/ScienceQA
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación UnifiedRoPE: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/modern/unified_rope.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
