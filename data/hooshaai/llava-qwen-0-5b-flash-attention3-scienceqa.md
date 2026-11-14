# Hooshaai/llava-qwen-0.5b-flash-attention3-scienceqa

## Resumen

llava-qwen-0.5b-flash-attention3-scienceqa es un checkpoint multimodal de tipo vision-language derivado de llava-hf/llava-interleave-qwen-0.5b-hf mediante un proceso de "cirugía de atención" y destilación de conocimiento de la librería NeuralOps. El autor, Hooshaai, sustituye el mecanismo de atención cuadrática de 18 de las 24 capas del decodificador Qwen2 por una implementación FlashAttention-3, manteniendo congelados el torreón visual SigLIP, el proyector multimodal y seis capas ancla cuadráticas. El resultado es un artefacto de pesos de solo 147,61 MB (frente a los 1,66 GB del modelo base en FP16), lo que supone una reducción del 91,3 % del tamaño en disco.

El problema que aborda es el coste computacional y de almacenamiento de los modelos VLM de pequeño tamaño en entornos con recursos limitados. Mediante la combinación de atención rápida y destilación offline de representaciones, el modelo recupera gran parte de la precisión del profesor original: parte de un 32,50 % de precisión cero-disparo y alcanza un 60,62 % tras la destilación, frente al 63,75 % del profesor. Se evalúa específicamente en el subconjunto STEM con imágenes del dataset ScienceQA.

Es relevante en el contexto actual porque demuestra que es viable aplicar técnicas de sustitución de kernels de atención (attention surgery) sobre modelos multimodales pequeños sin reentrenar desde cero, usando una única GPU de consumo (RTX 3090 de 24 GB) y en apenas 120 segundos de entrenamiento. El modelo está pensado para tareas de razonamiento visual sobre contenido científico y educativo, con licencia MIT y soporte exclusivo de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (torreón visual SigLIP congelado + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas) con atención FlashAttention-3 en 18/24 capas |
| Parametros totales | No disponible (modelo base LLaVA-Qwen-0.5B; artefacto de pesos quirúrgicos de 147,61 MB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos serializados en FP16 safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_weights.safetensors, FP16) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema LLaVA interleaved: un torreón visual SigLIP de 27 capas congelado, un proyector multimodal MLP de 2 capas y un decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas de atención y head_dim de 64. La intervención quirúrgica afecta a 18 de las 24 capas del decodificador, sustituyendo la atención cuadrática por FlashAttention-3 (familia fast_kernels), mientras que las capas [3, 7, 11, 15, 19, 23] se mantienen como anclas cuadráticas. Los layernorms del decodificador se entrenaron, mientras que los MLP del decodificador, los embeddings, el proyector y el torreón visual permanecen congelados.

El entrenamiento se realizó mediante destilación de conocimiento con la arquitectura de caché offline de representaciones de NeuralOps (§21.1), sin necesidad de mantener el profesor en VRAM de GPU (0 MB de VRAM del profesor). Se ejecutaron 237 pasos de optimización en dos etapas (90 + 147) sobre una NVIDIA GeForce RTX 3090 de 24 GB, con un tiempo total de 120,3 segundos y un pico de VRAM de 17.708 MB. El dataset de evaluación y entrenamiento es derek-thomas/ScienceQA, en su subconjunto STEM con imágenes.

## Capacidades

- Generación de texto e imagen-a-texto (pipeline image-text-to-text) en inglés.
- Respuesta a preguntas visuales sobre contenido científico y educativo (ScienceQA).
- Razonamiento visual multimodal sobre figuras, diagramas e imágenes STEM.
- Formato conversacional con plantilla de chat incluida (chat_template.json).
- Procesamiento de imágenes mediante preprocesador SigLIP (preprocessor_config.json).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés.
- Modo thinking, visión avanzada o audio: no disponible.

## Casos de uso

- Tutoría educativa automatizada: el modelo puede responder preguntas de ciencias con soporte de imagen, adecuado para plataformas de aprendizaje que necesiten un VLM ligero que quepa en una GPU de consumo y responda sobre diagramas STEM.
- Investigación en eficiencia de atención: sirve como caso de estudio reproducible de sustitución de kernels de atención (FlashAttention-3) sobre un VLM pequeño, con métricas de precisión y perplejidad antes y después de la destilación.
- Despliegue en dispositivos con recursos limitados: el artefacto de 147,61 MB permite empaquetar el modelo en entornos con restricciones de almacenamiento, aunque requiere la librería NeuralOps para cargarlo.
- Evaluación comparativa de técnicas de compresión: útil como referencia para medir la pérdida de precisión al reemplazar atención cuadrática por kernels rápidos en modelos multimodales.
- Prototipado rápido de asistentes de preguntas y respuestas sobre imágenes científicas: la plantilla de chat y el preprocesador incluidos permiten integrarlo en demos con pocas líneas de código.
- Docencia y divulgación sobre destilación de conocimiento: el repositorio documenta telemetría de entrenamiento (pasos, VRAM, duración) que sirve para explicar pipelines de KD offline en un solo GPU.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) en ScienceQA, subconjunto STEM con imágenes, split de validación:

| Metrica | Profesor (baseline) | Cero-disparo (pre-KD) | Final (post-KD) | Delta |
|---|---:|---:|---:|---:|
| Precisión (%) | 63,75 | 32,50 | 60,62 | +28,12 |
| Perplejidad (PPL) | 2,45 | 5,12 | 2,41 | -2,71 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento alcanzó un pico de 17.708 MB en una RTX 3090, pero la inferencia con el artefacto de 147,61 MB debería requerir bastante menos.
- GPU recomendadas: NVIDIA GeForce RTX 3090 (24 GB) fue la GPU usada para el entrenamiento; no se especifican recomendaciones para inferencia.
- Cabe en GPU de consumo: sí, el entrenamiento se completó en una RTX 3090; el tamaño reducido del artefacto sugiere que la inferencia es viable en GPUs de consumo, aunque no se detalla.
- Opciones de despliegue: librería NeuralOps (neuralops.hub.load_surgeried_model); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión ScienceQA | Licencia | Formato |
|---|---|---|---|---|---|
| llava-qwen-0.5b-flash-attention3-scienceqa | No disponible (artefacto 147,61 MB) | No disponible | 60,62 % (STEM con imágenes, val) | MIT | safetensors (NeuralOps) |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | ~0,5B | No disponible | 63,75 % (STEM con imágenes, val) | No disponible | safetensors (HF) |
| Otros VLM pequeños comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no están verificados (verified: false).
- El modelo solo soporta inglés; no hay capacidades multilingües.
- Está especializado en ScienceQA (subconjunto STEM con imágenes); su rendimiento fuera de ese dominio no está documentado.
- Requiere la librería NeuralOps y su API específica (load_surgeried_model) para cargarse; no es directamente compatible con transformers estándar sin conversión.
- El artefacto contiene únicamente pesos quirúrgicos (delta de atención y layernorms); no incluye el torreón visual ni el proyector, que deben provenir del modelo base.
- Riesgo de alucinación inherente a los VLM de pequeño tamaño; no se han publicado evaluaciones de sesgo.
- La licencia MIT se aplica al repositorio; el modelo base llava-hf/llava-interleave-qwen-0.5b-hf tiene su propia licencia que debe verificarse para uso comercial.
- No hay datos sobre longitud de contexto, cuantización ni latencia en producción.
- El modelo fue creado en 2026-11-11; su ecosistema y mantenimiento a largo plazo no están garantizados.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-flash-attention3-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación FlashAttention-3 en NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/fast_kernels/flash_attention3.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
