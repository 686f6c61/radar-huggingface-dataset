# Hooshaai/llava-qwen-0.5b-svd-linear-decay-scienceqa

## Resumen

`llava-qwen-0.5b-svd-linear-decay-scienceqa` es un checkpoint multimodal de tipo vision-lenguaje publicado por el usuario Hooshaai dentro del ecosistema NeuralOps, una librería experimental centrada en la cirugía de mecanismos de atención. El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf` (torre visual SigLIP congelada, proyector MLP de dos capas y decodificador Qwen2 de 24 capas con dimensión 1024) y sustituye la atención cuadrática de 18 de sus 24 capas por un operador lineal con decaimiento temporal, denominado `svd_linear_decay` (familia `svd`, clase `DecayDecayLinearAttention`).

La propuesta técnica consiste en factorizar las proyecciones de atención mediante descomposición en valores singulares de bajo rango y aplicar un kernel de decaimiento exponencial de recencia, logrando una recurrencia lineal en tiempo O(N) que evita materializar la matriz densa N x N. El resto de componentes (torre visual, proyector, embeddings y MLPs) permanece congelado, y se conservan seis capas de atención cuadrática como anclas en los índices [3, 7, 11, 15, 19, 23], configurando un esquema híbrido 3:1.

El interés del checkpoint es fundamentalmente de investigación: demuestra el proceso de destilación de conocimiento desde el modelo profesor hacia una variante quirúrgicamente modificada y cuantifica el coste en precisión. El artefacto de pesos ocupa 80,71 MB frente a los 1,66 GB del base en FP16 (un 95,3 % menos), lo que lo convierte en un caso de estudio sobre compresión extrema de atención más que en un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA multimodal: torre visual SigLIP congelada (27 capas) + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64); atención híbrida con `svd_linear_decay` en 18/24 capas y atención cuadrática en 6 capas ancla |
| Parametros totales | No disponible (el artefacto guardado es un delta quirúrgico de atención de 84.629.080 bytes en FP16; el base declarado ocupa 1,66 GB en FP16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en FP16; formato `attention_only_fp16`) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, delta de atención en FP16) + `surgical_manifest.json`, `config.json`, tokenizer BPE |

## Arquitectura y entrenamiento

La arquitectura base es LLaVA-Interleave con backbone Qwen2 de 0,5B: una torre visual SigLIP congelada de 27 capas extrae características de la imagen, un proyector MLP de dos capas las alinea con el espacio del decodificador, y el decodificador de 24 capas procesa la secuencia multimodal. La modificación quirúrgica reemplaza la self-attention de 18 capas por `DecayDecayLinearAttention`, que combina factorización SVD de bajo rango con un kernel de decaimiento exponencial de recencia e implementa la recurrencia `S_t = λS_{t-1} + K_tᵀV_t`, `O_t = Q_tS_t` mediante prefix-scans acumulativos por chunks. Las capas [3, 7, 11, 15, 19, 23] conservan atención cuadrática como anclas, dando lugar a un patrón híbrido `hybrid_3_1`. Se congelan la torre visual, el proyector, los MLPs y los embeddings; solo se entrenan las atenciones modificadas y los layernorms del decodificador.

El entrenamiento se realizó por destilación de conocimiento en dos etapas (35 y 71 pasos, 106 en total) sobre una NVIDIA GeForce RTX 3090 de 24 GB, con un tiempo total de 121 segundos y un pico de VRAM de 12.502 MB. El conjunto de evaluación es el subconjunto con imagen de ScienceQA (validación), orientado a razonamiento STEM visual. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de ScienceQA, ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto e imagen-a-texto conversacional (pipeline `image-text-to-text`).
- Respuesta a preguntas visuales sobre contenido STEM (ciencias, tecnología, ingeniería y matemáticas) con imagen adjunta.
- Razonamiento multimodal básico sobre diagramas y figuras científicas del dominio ScienceQA.
- Soporte de plantilla de chat (`chat_template.json`) para formato conversacional.
- Procesamiento de imágenes mediante preprocesador SigLIP configurado en el repositorio.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, modo thinking, audio ni otras modalidades.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Investigación sobre eficiencia de atención: el checkpoint sirve para reproducir y analizar el impacto de sustituir atención cuadrática por operadores lineales con decaimiento en un VLM pequeño, comparando precisión y perplejidad frente al profesor.
- Estudio de destilación de conocimiento: permite examinar cómo recupera precisión (de 39,38 % a 31,25 % en ScienceQA) un modelo quirúrgicamente modificado tras dos etapas de KD, útil para diseñar pipelines de compresión.
- Prototipado de VLM de huella mínima: con 80,71 MB de delta de atención, es adecuado para experimentos en entornos con almacenamiento muy restringido donde no se requiere alta precisión.
- Evaluación de operadores SVD en atención: sirve como banco de pruebas para medir la degradación introducida por la factorización de bajo rango en tareas de razonamiento visual.
- Docencia y divulgación: ejemplo didáctico de cirugía de atención y de auditoría de artefactos (`surgical_manifest.json`, `training_metrics.json`) en un modelo pequeño y reproducible en una RTX 3090.
- Benchmarking de esquemas híbridos: permite comparar el patrón `hybrid_3_1` (18 capas lineales, 6 cuadráticas) frente a configuraciones alternativas del zoo de atención de NeuralOps.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados), sobre ScienceQA, subconjunto con imagen STEM, split de validación:

| Metrica | Profesor (base) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 39,38 | 31,25 | -8,13 |
| Perplejidad (PPL) | 2,45 | 12,43 | 3,17 | -9,26 |

Telemetría de entrenamiento declarada: 106 pasos de optimización (35 en etapa 1, 71 en etapa 2), 121,0 s de duración, 12.502 MB de VRAM pico en una RTX 3090.

## Requisitos de hardware

- El artefacto de pesos de atención ocupa 80,71 MB en FP16; el paquete completo del repositorio es de 95,91 MB (0,1 GB).
- Para inferencia completa es necesario cargar además la torre visual SigLIP, el proyector, los MLPs y los embeddings del modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` (1,66 GB en FP16), ya que el checkpoint solo contiene el delta de atención.
- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento consumió 12.502 MB en una RTX 3090, por lo que la inferencia en FP16 debería caber holgadamente en GPUs consumer de 8-16 GB.
- GPU recomendadas: RTX 3090 (usada en el entrenamiento), así como RTX 4090, A100 o H100 para despliegues con mayor throughput.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090, dado el tamaño del base.
- Opciones de despliegue: la model card documenta la API `neuralops.hub.load_surgeried_model` de la librería NeuralOps. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (val, imagen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/llava-qwen-0.5b-svd-linear-decay-scienceqa` | Base 0,5B (delta de atención 80,71 MB) | No disponible | 31,25 % acc / 3,17 PPL (declarado, no verificado) | MIT | Hugging Face (23 descargas) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | 0,5B | No disponible | 63,75 % acc / 2,45 PPL (declarado en la model card) | No disponible en esta ficha | Hugging Face |
| Otros checkpoints del zoo NeuralOps | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de terceros para establecer una comparación independiente con alternativas de la misma categoría.

## Limitaciones y advertencias

- Degradación significativa de precisión: 31,25 % de accuracy frente al 63,75 % del profesor en ScienceQA, una caída de 32,5 puntos porcentuales respecto al base.
- Pérdida adicional de 8,13 puntos durante la destilación respecto al estado pre-KD (39,38 %), lo que indica que el proceso de KD no recupera completamente la capacidad del operador lineal.
- Resultados no verificados: las métricas están marcadas como `verified: false` en el model-index.
- Solo inglés: no hay soporte multilingüe documentado.
- Dominio restringido: entrenado y evaluado exclusivamente en ScienceQA; el comportamiento fuera de ese dominio es desconocido.
- Checkpoint parcial: no contiene la torre visual, el proyector, los MLPs ni los embeddings; requiere el modelo base para funcionar.
- Dependencia de la librería `neuralops`, poco extendida; no se documenta compatibilidad con stacks estándar de inferencia.
- Riesgo de alucinación no cuantificado; no se han publicado evaluaciones de sesgo, toxicidad o robustez.
- Licencia MIT: permite uso comercial, pero la ausencia de garantías y la baja precisión desaconsejan su uso en producción sin validación adicional.
- Longitud de contexto no especificada: no se puede garantizar el manejo de conversaciones o documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-svd-linear-decay-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador `svd_linear_decay`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/svd_linear_decay.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
