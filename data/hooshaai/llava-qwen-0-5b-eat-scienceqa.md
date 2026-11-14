# Hooshaai/llava-qwen-0.5b-eat-scienceqa

## Resumen

llava-qwen-0.5b-eat-scienceqa es un checkpoint multimodal de tipo vision-language derivado de llava-hf/llava-interleave-qwen-0.5b-hf mediante la técnica de "attention surgery" del framework NeuralOps. El autor, Hooshaai, aplica el operador EATBlock (Efficient Attention Transformer con poda progresiva de tokens) sobre 18 de las 24 capas del decoder Qwen2, sustituyendo la atención cuadrática estándar por una variante adaptativa y comprimida. El resultado es un artefacto de solo 147,61 MB de pesos serializados frente a los 1,66 GB del modelo base completo, una reducción del 91,3%.

El modelo está especializado en razonamiento visual sobre ScienceQA, un conjunto de preguntas de ciencia a nivel educativo con imágenes asociadas. Tras un proceso de destilación de conocimiento (knowledge distillation) en dos etapas sobre una única RTX 3090, recupera buena parte del rendimiento del profesor: 61,25% de accuracy frente al 63,75% del baseline, con una perplejidad de 2,56 frente a 2,45. Es relevante ahora porque demuestra que es viable comprimir drásticamente la atención de un VLM pequeño manteniendo la calidad en una tarea concreta, con un coste de entrenamiento de apenas 120 segundos.

El modelo es de propósito muy específico: no es un asistente generalista, sino una prueba de concepto de cirugía de atención con evaluación empírica acotada. Su licencia MIT y su tamaño reducido lo hacen útil para experimentación en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (torre de visión SigLIP congelada + proyector MLP de 2 capas + decoder Qwen2 de 24 capas) con atención EATBlock en 18/24 capas |
| Parametros totales | No disponible (el modelo base es de ~0,5B; el artefacto serializado contiene solo los deltas quirúrgicos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en FP16 safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_weights.safetensors, FP16) |

## Arquitectura y entrenamiento

El modelo parte de llava-interleave-qwen-0.5b-hf, que combina una torre de visión SigLIP congelada de 27 capas, un proyector multimodal de 2 capas y un decoder Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas de atención y head_dim de 64. La intervención quirúrgica sustituye el módulo de self-attention en 18 de las 24 capas del decoder por EATBlock, un operador adaptativo con poda progresiva de tokens. Se conservan seis capas de anclaje cuadráticas en los índices [3, 7, 11, 15, 19, 23] para mantener la coherencia global, y se entrenan además los layernorms del decoder. La torre de visión, el proyector, los MLP y los embeddings permanecen congelados.

El entrenamiento se realizó mediante destilación de conocimiento con la arquitectura de caché offline de representaciones de NeuralOps, en 205 pasos repartidos en dos etapas (76 y 129) sobre una NVIDIA GeForce RTX 3090 de 24 GB, con un pico de VRAM de 20.325 MB y una duración total de 120,6 segundos. La evaluación se hizo sobre el subconjunto con imagen de ScienceQA en validación. El checkpoint final solo serializa los pesos modificados (deltas quirúrgicos), lo que explica su huella de 147,61 MB.

## Capacidades

- Respuesta a preguntas visuales (VQA) sobre imágenes con contenido científico y educativo.
- Razonamiento multimodal básico: interpretar figuras, diagramas y esquemas para seleccionar una opción de respuesta.
- Generación de texto conversacional en inglés con plantilla de chat incluida (chat_template.json).
- Formato de respuesta de opción múltiple, orientado a tareas tipo test.
- Capacidades multilingües: limitadas al inglés.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión adicional, audio: no disponible (solo visión de imagen estándar).

## Casos de uso

- Evaluación de técnicas de compresión de atención: sirve como referencia reproducible para medir cuánto rendimiento se pierde al sustituir atención cuadrática por EATBlock en un VLM pequeño, con baseline y métricas documentadas.
- Investigación en destilación de conocimiento multimodal: el pipeline de dos etapas con caché offline de representaciones permite reproducir el entrenamiento en una sola GPU consumer.
- Prototipado de tutores educativos de ciencia: el modelo puede responder preguntas de opción múltiple sobre figuras STEM, útil para validar flujos de VQA educativa antes de escalar a modelos mayores.
- Despliegue en entornos con recursos muy limitados: con 147,61 MB de pesos, cabe en dispositivos con poca VRAM o incluso en CPU para inferencia de baja latencia en tareas acotadas.
- Benchmarking de "attention surgery": comparar el operador EATBlock frente a otras variantes del zoo de NeuralOps sobre el mismo conjunto de validación.
- Docencia y divulgación: ejemplo didáctico de cómo se aplica una cirugía de atención capa a capa y se audita el artefacto resultante (manifest quirúrgico, métricas, telemetría).

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados de forma independiente):

| Metrica | Teacher baseline | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) en ScienceQA (subconjunto con imagen, validación) | 63,75 | 32,50 | 61,25 | +28,75 |
| Perplejidad (PPL) | 2,45 | 5,12 | 2,56 | -2,56 |

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto pesa 147,61 MB, por lo que la inferencia cabe holgadamente en GPUs consumer; el modelo base completo ocupa 1,66 GB en FP16.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para el modelo completo con overhead; una RTX 3090 (24 GB) fue suficiente para el entrenamiento de destilación.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores; también es viable en CPU para cargas pequeñas.
- Opciones de despliegue: la librería neuralops (load_surgeried_model) es la vía documentada; vLLM, llama.cpp, Ollama o TGI no están confirmados para este checkpoint quirúrgico.
- Latencia y throughput: no disponibles; el entrenamiento completo tardó 120,6 segundos en 205 pasos sobre una RTX 3090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento ScienceQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-eat-scienceqa | ~0,5B (deltas de 147,61 MB) | No disponible | 61,25% accuracy, PPL 2,56 | MIT | Hugging Face (neuralops) |
| llava-hf/llava-interleave-qwen-0.5b-hf (base) | ~0,5B | No disponible | 63,75% accuracy (teacher baseline) | No disponible en la información | Hugging Face |
| Otras variantes del zoo NeuralOps | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Especialización estrecha: entrenado y evaluado solo en ScienceQA; el rendimiento fuera de esa distribución no está caracterizado.
- Solo inglés: no hay soporte multilingüe declarado.
- Riesgo de alucinación: como todo VLM pequeño, puede generar respuestas plausibles pero incorrectas, especialmente en figuras ambiguas.
- Métricas no verificadas: los resultados del model-index están marcados como `verified: false`; proceden del propio autor.
- Dependencia de la librería neuralops: el checkpoint contiene solo deltas quirúrgicos y requiere el runtime de NeuralOps para reconstruir el modelo; no es un safetensors estándar cargable con transformers directamente.
- Sin soporte documentado de tool calling, agentes ni contexto largo.
- Uso comercial: la licencia MIT lo permite, pero la ausencia de evaluación fuera de ScienceQA desaconseja producción generalista sin validación adicional.
- El modelo base referenciado en la quick start (`tahamajs/llava-qwen-0.5b-eat-scienceqa`) difiere del ID del repositorio (`Hooshaai/llava-qwen-0.5b-eat-scienceqa`), lo que puede causar confusión en la carga.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-eat-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación EATBlock: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/adaptive/eat.py
- Licencia MIT de NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
