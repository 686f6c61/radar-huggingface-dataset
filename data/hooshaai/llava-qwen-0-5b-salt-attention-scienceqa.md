# Hooshaai/llava-qwen-0.5b-salt-attention-scienceqa

## Resumen

llava-qwen-0.5b-salt-attention-scienceqa es un checkpoint multimodal derivado de llava-hf/llava-interleave-qwen-0.5b-hf, publicado por el autor Hooshaai dentro del ecosistema NeuralOps. No se trata de un modelo entrenado desde cero, sino de un experimento de cirugía de atención: se sustituyen las proyecciones lineales estándar de la atención por módulos SALTLinear (SALTAttention) en 18 de las 24 capas del decodificador Qwen2, manteniendo congelados el torreón visual SigLIP, el proyector MLP y las capas ancla cuadráticas.

El modelo resuelve un problema de investigación más que de producto: explorar si es posible comprimir y destilar un VLM pequeño mediante descomposición SVD ponderada por Fisher, rango adaptativo y atención selectiva, preservando parte del rendimiento del profesor original. El resultado se evalúa sobre el subconjunto con imagen de ScienceQA (validación), un benchmark de razonamiento visual STEM.

La relevancia actual es doble: por un lado, demuestra técnicas de atención quirúrgica aplicables a otros transformers; por otro, el artefacto de pesos ocupa solo 46,40 MB frente a los 1,66 GB del modelo base FP16, una reducción del 97,3 %. La licencia es MIT y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal tipo LLaVA: torreón visual SigLIP congelado + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas con SALTAttention en 18 capas |
| Parametros totales | no disponible (el artefacto guardado contiene 606 tensores de atención y layernorms, 48.655.776 bytes en FP16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en FP16 safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_weights.safetensors, deltas quirúrgicos en FP16) + surgical_manifest.json |
| Dimension del decodificador | D=1024, H=16 cabezas, head_dim=64 |
| Capas modificadas | 18 de 24 (esquema hybrid_3_1); anclas cuadráticas en [3, 7, 11, 15, 19, 23] |
| Componentes congelados | vision_tower SigLIP (27 capas), multi_modal_projector, MLPs y embeddings del decodificador |
| Libreria | neuralops |

## Arquitectura y entrenamiento

La arquitectura base es un LLaVA interleaved con torreón visual SigLIP congelado, un proyector MLP de dos capas que alinea las características visuales con el espacio del lenguaje y un decodificador Qwen2 de 24 capas con dimensión oculta 1024 y 16 cabezas de atención de dimensión 64. Sobre esta base, el autor aplica una cirugía selectiva: sustituye las proyecciones lineales de self-attention por SALTLinear en 18 capas, dejando seis capas ancla cuadráticas intactas para preservar capacidad de atención global. Los layernorms del decodificador se entrenan, mientras que el torreón visual, el proyector y los MLPs permanecen congelados.

El entrenamiento combina compresión SVD ponderada por Fisher, gamma consciente de la atención y rango adaptativo (SALT-F), seguido de destilación de conocimiento desde el modelo profesor. Se ejecutaron 295 pasos de optimización en dos etapas (133 y 162 pasos) sobre una única NVIDIA RTX 3090 de 24 GB, con un pico de VRAM de 16.489 MB y una duración total de 120,4 segundos. El dataset de evaluación y ajuste es derek-thomas/ScienceQA, en su subconjunto con imagen de validación. No se documentan en la información disponible el número de tokens de entrenamiento ni la composición completa del dataset más allá de ScienceQA.

## Capacidades

- Generación de texto e imagen-texto en formato conversacional (pipeline image-text-to-text).
- Respuesta a preguntas visuales sobre figuras y diagramas STEM (ScienceQA).
- Razonamiento visual básico con selección de opción entre alternativas.
- Soporte de plantilla de chat (chat_template.json incluido).
- Capacidad multilingüe limitada al inglés.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso con agentes.
- No se documenta modo thinking, audio ni vídeo.
- El checkpoint es un delta quirúrgico: requiere cargarse sobre la base llava-hf/llava-interleave-qwen-0.5b-hf mediante la API de NeuralOps.

## Casos de uso

- Investigación en compresión de atención: permite reproducir y auditar el efecto de SALTAttention sobre un VLM pequeño, comparando precisión y perplejidad antes y después de la destilación con los datos de telemetría incluidos.
- Evaluación de técnicas de cirugía de atención en entornos académicos: el manifiesto surgical_manifest.json documenta la topología exacta de las capas modificadas, lo que facilita estudios de ablación sobre qué capas admiten sustitución SVD sin degradar la tarea.
- Prototipado de asistentes educativos STEM: el modelo puede responder preguntas de opción múltiple sobre figuras científicas, adecuado para demos de bajo coste en un portátil con GPU consumer.
- Docencia y formación en destilación de conocimiento: el par profesor-alumno (63,75 % frente a 33,12 % de precisión) sirve como caso práctico de las pérdidas y ganancias de la destilación post-cirugía.
- Despliegue ligero en entornos con restricciones de almacenamiento: el artefacto de 46,40 MB frente a 1,66 GB del base lo hace atractivo para distribuirlo en pipelines de CI o contenedores pequeños, siempre que se acepte la pérdida de precisión.
- Benchmarking de operadores SVD: sirve como referencia para comparar SALTAttention con otras técnicas de compresión de atención sobre el mismo subconjunto de ScienceQA.
- Validación de pipelines NeuralOps: útil para verificar la API load_surgeried_model y el esquema neuralops.surgery/v2 en integraciones internas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, verified: false):

| Metrica | Profesor (base) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) en ScienceQA (subconjunto con imagen, validación) | 63,75 | 31,25 | 33,12 | +1,87 |
| Perplejidad (PPL) | 2,45 | 14,07 | 3,04 | -11,03 |

Telemetría de entrenamiento declarada:

| Parametro | Valor |
|---|---|
| Hardware | NVIDIA GeForce RTX 3090 (24 GB) |
| Pasos de optimización | 295 (etapa 1: 133; etapa 2: 162) |
| Duración del entrenamiento | 120,4 s |
| Pico de VRAM | 16.489 MB |
| Timestamp (UTC) | 2026-11-11T09:35:10.915863Z |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento consumió 16.489 MB en una RTX 3090, por lo que la inferencia en FP16 con la base completa requiere previsiblemente una GPU de 16-24 GB.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 o H100 para cargar la base completa junto con el delta quirúrgico.
- GPU consumer: cabe en RTX 3090 y RTX 4090; en GPUs de 8-12 GB requeriría cuantización de la base, no documentada en la información disponible.
- Opciones de despliegue: la model card solo documenta la API neuralops.hub.load_surgeried_model; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (val, con imagen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-salt-attention-scienceqa | no disponible (delta de 46,40 MB) | no disponible | 33,12 % acc / 3,04 PPL | MIT | Hugging Face (24 descargas) |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | ~0,5 B | no disponible | 63,75 % acc / 2,45 PPL (declarado por el autor) | no disponible en esta ficha | Hugging Face |
| Otros VLM de ~0,5 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de terceros ni de comparativas con otros modelos de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Pérdida sustancial de precisión frente al profesor: 33,12 % frente a 63,75 % en ScienceQA, es decir, aproximadamente la mitad de la precisión original.
- El checkpoint es un delta quirúrgico, no un modelo autónomo: requiere la base llava-hf/llava-interleave-qwen-0.5b-hf y la librería neuralops para cargarse.
- Solo inglés; sin soporte multilingüe documentado.
- Sin datos publicados sobre sesgos, alucinación o robustez fuera de ScienceQA.
- Resultados de benchmarks no verificados (verified: false) y declarados por el autor.
- Longitud de contexto no documentada; no apto para tareas de contexto largo sin validación previa.
- Uso comercial permitido por licencia MIT, pero la precisión limitada lo hace poco recomendable para producción real en tareas STEM.
- El pipeline de inferencia depende de la API NeuralOps; no hay garantía de compatibilidad con ecosistemas estándar como transformers o vLLM.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-salt-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Dataset: https://huggingface.co/datasets/derek-thomas/ScienceQA
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación SALTAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/salt_attention.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
