# Hooshaai/llava-qwen-0.5b-positive-kernel-linear-attention-scienceqa

## Resumen

`llava-qwen-0.5b-positive-kernel-linear-attention-scienceqa` es un checkpoint experimental publicado por el usuario Hooshaai dentro del proyecto NeuralOps, un marco de trabajo para realizar "cirugías de atención" sobre modelos existentes. Se construye a partir de `llava-hf/llava-interleave-qwen-0.5b-hf`, un VLM compacto de la familia LLaVA que combina una torre visual SigLIP congelada con un decodificador Qwen2 de 24 capas, y sustituye la atención cuadrática estándar por una atención lineal basada en kernel positivo (ELU+1) en 18 de las 24 capas del decodificador.

El modelo se ha afinado por destilación de conocimiento sobre el subconjunto con imágenes de ScienceQA (validación), y se distribuye únicamente como delta de pesos quirúrgicos (atención + layernorms entrenadas), no como un checkpoint completo. Su relevancia es principalmente metodológica: demuestra cómo aplicar atención lineal con reordenamiento asociativo en un VLM multimodal pequeño, reduciendo el artefacto en disco un 71,5 % respecto al base FP16 (484 MB frente a 1,66 GB).

No obstante, los resultados empíricos son limitados: la precisión final en ScienceQA es del 31,25 %, idéntica a la del modelo antes de la destilación (delta +0,00 %) y muy por debajo del 63,75 % del teacher. Es, por tanto, un artefacto de investigación sobre eficiencia de atención, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal híbrido: torre visual SigLIP congelada (27 capas) + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64) con atención lineal de kernel positivo en 18/24 capas y 6 capas ancla cuadráticas [3, 7, 11, 15, 19, 23] |
| Parametros totales | 0,5 B (modelo base LLaVA-Qwen-0.5B); el delta publicado contiene 678 tensores y 484,14 MB en FP16 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos publicados están en FP16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (delta quirúrgico `attention_weights.safetensors`, FP16, más `surgical_manifest.json` con esquema `neuralops.surgery/v2`) |

## Arquitectura y entrenamiento

El modelo parte de LLaVA-Interleave-Qwen-0.5B: una torre visual SigLIP congelada de 27 capas, un proyector MLP de dos capas que alinea los embeddings visuales con el espacio del lenguaje, y un decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas y dimensión por cabeza 64. La intervención sustituye la self-attention en 18 de esas 24 capas por `PositiveKernelLinearAttention`, un operador de atención lineal que aplica el mapa de características ELU(x)+1 a Q y K, lo que permite reordenar el producto (QK^T)V como Q(K^T V) y reducir la complejidad de O(N²) a O(N). El mapa es estrictamente positivo, lo que evita colapsos del denominador y NaN. Las 6 capas restantes ([3, 7, 11, 15, 19, 23]) se mantienen cuadráticas como anclas, configurando un patrón híbrido 3:1.

El entrenamiento es una destilación de conocimiento offline sobre el subconjunto con imágenes de ScienceQA, ejecutada mediante la arquitectura de caché de representaciones del proyecto NeuralOps. Solo se entrenan las atenciones modificadas y los layernorms del decodificador; la torre visual, el proyector, los MLP y los embeddings permanecen congelados. La telemetría declarada indica 163 pasos de optimización (51 en etapa 1, 112 en etapa 2), 120 segundos de entrenamiento y 14.338 MB de VRAM pico en una RTX 3090 (24 GB), sin VRAM de teacher en GPU. El resultado es un delta de pesos de 484,14 MB (507.662.180 bytes) frente a los 1,66 GB del base FP16, un 71,5 % menos de espacio (3,51x más pequeño).

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) en inglés.
- Respuesta a preguntas visuales de tipo STEM, orientada al formato de ScienceQA (preguntas de opción múltiple con contexto visual).
- Razonamiento multimodal básico sobre diagramas e ilustraciones científicas, limitado por el tamaño del modelo (0,5 B).
- Conversación multi-turno según la plantilla de chat incluida (`chat_template.json`), heredada de LLaVA-Interleave.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No dispone de modo "thinking", visión de vídeo, audio ni otras modalidades adicionales.
- Capacidad multilingüe: únicamente inglés declarado.

## Casos de uso

- Investigación sobre atención lineal en VLMs: el caso principal. Sirve para reproducir y analizar el efecto de sustituir atención cuadrática por `PositiveKernelLinearAttention` en 18 de 24 capas de un decodificador Qwen2, comparando contra el base congelado y midiendo el impacto en precisión y perplejidad.
- Experimentos de destilación con caché offline: el checkpoint documenta un flujo de KD con 0 MB de VRAM de teacher en GPU, útil como referencia para entrenar modelos pequeños en hardware de consumo (RTX 3090).
- Prototipado de VLMs de bajo coste en entornos con VRAM limitada: al ser un delta de 484 MB sobre un base de 0,5 B, permite iterar rápidamente en una sola GPU consumer.
- Evaluación de preguntas visuales STEM en pipelines de investigación: útil como baseline débil en ScienceQA para comparar contra modelos mayores o contra variantes con atención cuadrática completa.
- Estudio de patrones híbridos de atención: el esquema 3:1 con capas ancla [3, 7, 11, 15, 19, 23] permite analizar qué capas toleran atención lineal sin degradar la representación.
- Auditoría de artefactos quirúrgicos: el `surgical_manifest.json` y la estructura de ficheros permiten validar flujos de serialización selectiva de pesos y comparar huellas en disco.
- No recomendado para atención al cliente, generación de código en producción ni tareas comerciales reales: la precisión de 31,25 % en su propio benchmark lo desaconseja para cualquier uso que requiera fiabilidad.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Benchmark | Metrica | Teacher baseline | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---|---:|---:|---:|---:|
| ScienceQA (subconjunto STEM con imágenes, validation) | Accuracy (%) | 63,75 | 31,25 | 31,25 | +0,00 |
| ScienceQA (referencia) | Perplejidad (PPL) | 2,45 | — | — | — |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, MMMU, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia, el entrenamiento (destilación sobre 18 capas de atención) consumió 14.338 MB pico en una RTX 3090; la inferencia de un modelo de 0,5 B en FP16 requiere previsiblemente bastante menos, pero no se documenta la cifra.
- GPU recomendadas: el autor solo documenta la RTX 3090 (24 GB) para el entrenamiento. Para inferencia, cualquier GPU con suficiente VRAM para un modelo de 0,5 B en FP16 debería bastar, aunque no se especifica.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060/4060 y superiores, dado el tamaño de 0,5 B, aunque no hay cifras publicadas.
- Opciones de despliegue: la model card solo documenta la API `neuralops.hub.load_surgeried_model` de la librería `neuralops`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y al ser un delta quirúrgico parcial (no un checkpoint completo) no es directamente cargable por esos frameworks sin reconstruir el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (val, STEM con imágenes) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/llava-qwen-0.5b-positive-kernel-linear-attention-scienceqa` | 0,5 B (delta de 484 MB) | No disponible | 31,25 % | MIT | Hugging Face (delta quirúrgico) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (base) | 0,5 B | No disponible | 63,75 % (teacher baseline) | No disponible en la información | Hugging Face |
| LLaVA-Qwen-0.5B con atención cuadrática completa | 0,5 B | No disponible | No disponible | No disponible | No disponible |

La comparativa relevante es contra su propio base: la intervención de atención lineal no mejora la precisión (31,25 % frente a 63,75 % del teacher) y el delta de destilación es nulo. No se dispone de datos de otros VLMs comparables en la información proporcionada.

## Limitaciones y advertencias

- Degradación severa de precisión: 31,25 % en ScienceQA frente al 63,75 % del teacher, una caída de 32,5 puntos porcentuales.
- La destilación no aporta mejora: delta de +0,00 % entre pre-KD y post-KD, lo que sugiere que el entrenamiento no corrige la pérdida inducida por la sustitución de atención.
- Sesgos conocidos: no documentados, pero hereda los del base LLaVA-Qwen-0.5B y del dataset ScienceQA.
- Riesgo de alucinación: alto en un modelo de 0,5 B con precisión baja en su propio benchmark; no apto para uso sin supervisión.
- Limitación de idioma: solo inglés declarado.
- Longitud de contexto no documentada; la atención lineal en teoría favorece contextos largos, pero no hay mediciones publicadas.
- Distribución como delta quirúrgico: no es un checkpoint completo; requiere el modelo base y la librería `neuralops` para reconstruirse. No es directamente utilizable en vLLM, llama.cpp, Ollama ni TGI.
- Licencia MIT: permite uso comercial según los términos de la licencia, pero el modelo base (`llava-hf/llava-interleave-qwen-0.5b-hf`) puede tener sus propias condiciones que deben verificarse por separado.
- Resultados no verificados: el único benchmark declarado tiene `verified: false`; no hay evaluación independiente.
- Escaso soporte comunitario: 32 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-positive-kernel-linear-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de `PositiveKernelLinearAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/hybrid/positive_kernel_linear_attention.py
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA (derek-thomas): https://huggingface.co/datasets/derek-thomas/ScienceQA
