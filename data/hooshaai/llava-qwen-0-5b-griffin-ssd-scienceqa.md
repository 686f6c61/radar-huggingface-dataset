# Hooshaai/llava-qwen-0.5b-griffin-ssd-scienceqa

## Resumen

llava-qwen-0.5b-griffin-ssd-scienceqa es un checkpoint experimental de tipo vision-language publicado por el usuario Hooshaai bajo el paraguas del proyecto NeuralOps. Parte del modelo base llava-hf/llava-interleave-qwen-0.5b-hf (arquitectura LLaVA con torre visual SigLIP congelada, proyector MLP de dos capas y decodificador Qwen2 de 24 capas) y aplica una "cirugía de atención" que sustituye 18 de las 24 capas del decodificador por bloques híbridos GriffinSSD (ventana local más atención lineal SSD, familia SSM), manteniendo seis capas de atención cuadrática como anclas.

El modelo está afinado y destilado específicamente sobre el subconjunto con imágenes del dataset ScienceQA (validación), orientado a razonamiento visual de tipo STEM. Su interés es fundamentalmente de investigación: demuestra una técnica de compresión y sustitución de atención con un artefacto de pesos de solo 184,63 MB (un 89,1 % menos que el base en FP16) y un pipeline de destilación reproducible en una única RTX 3090.

No es un modelo de propósito general ni compite en rendimiento con VLM de mayor tamaño: su accuracy declarada en ScienceQA es del 43,75 %, frente al 63,75 % del modelo profesor. Resulta útil como referencia para estudiar arquitecturas híbridas SSM en modelos multimodales y para experimentar con el ecosistema NeuralOps.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (torre visual SigLIP congelada + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas), con 18/24 capas sustituidas por bloques híbridos GriffinSSD (ventana local + atención lineal SSD) |
| Parametros totales | no disponible (modelo base de 0,5B; el checkpoint solo serializa deltas quirúrgicos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en FP16 safetensors) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_weights.safetensors, deltas quirúrgicos FP16) |

## Arquitectura y entrenamiento

El modelo hereda la topología LLaVA-Interleave-Qwen-0.5B: torre visual SigLIP de 27 capas congelada, proyector multimodal MLP de dos capas y decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas y head_dim 64. Sobre esa base se aplica una cirugía de atención con esquema hybrid_3_1: 18 de las 24 capas del decodificador se reemplazan por GriffinSSDBlock, un bloque híbrido que combina atención de ventana local con atención lineal del tipo state-space duality (SSD). Las seis capas restantes ([3, 7, 11, 15, 19, 23]) conservan atención cuadrática como anclas. Los MLP, embeddings, proyector y torre visual permanecen congelados y excluidos del artefacto serializado.

El entrenamiento se realizó mediante destilación de conocimiento con la arquitectura de caché offline de representaciones de NeuralOps, sobre una NVIDIA GeForce RTX 3090 (24 GB) y con 0 MB de VRAM ocupada por el profesor en GPU. Se ejecutaron 166 pasos de optimización (58 en etapa 1 y 108 en etapa 2) en 120,1 segundos, con un pico de VRAM de 20.197 MB. Solo se guardaron los deltas de las 18 capas modificadas y los layernorms del decodificador entrenados, lo que explica el reducido tamaño del artefacto (184,63 MB frente a 1,66 GB del base FP16).

## Capacidades

- Generación de texto e imagen-a-texto (pipeline image-text-to-text) en inglés.
- Respuesta a preguntas visuales de tipo STEM sobre imágenes de ScienceQA, con formato de respuesta de opción múltiple.
- Razonamiento visual básico sobre figuras y diagramas científicos.
- Conversación multimodal con plantilla de chat (chat_template.json incluido).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documenta modo thinking, audio ni otras modalidades adicionales.
- Capacidad multilingüe limitada al inglés (campo language: en).

## Casos de uso

- Investigación en arquitecturas híbridas SSM para visión-lenguaje: el checkpoint permite comparar el comportamiento de bloques GriffinSSD frente a atención cuadrática en un VLM pequeño, usando las seis capas ancla como referencia interna.
- Reproducción de experimentos de destilación: el pipeline NeuralOps con caché offline de representaciones y entrenamiento en una sola RTX 3090 hace viable replicar el proceso con presupuesto de hardware reducido.
- Evaluación de técnicas de compresión de atención: el artefacto de 184,63 MB (89,1 % menos que el base) sirve para estudiar el equilibrio entre tamaño y calidad en despliegues con restricciones de almacenamiento.
- Docencia y formación: modelo didáctico para explicar cirugía de atención, destilación de conocimiento y serialización selectiva de pesos en un caso real y acotado.
- Prototipado de VQA educativa: respuesta a preguntas de opción múltiple sobre figuras científicas, útil como base para experimentos de tutoría automática en dominios STEM acotados.
- Benchmarking interno de VLM pequeños: punto de comparación controlado (mismo base, misma evaluación ScienceQA) para medir el impacto de sustituciones arquitectónicas en accuracy y perplejidad.
- Estudio de eficiencia en inferencia: análisis de latencia y memoria de un decodificador mixto SSM/atención frente al transformer cuadrático original en GPUs de consumo.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ScienceQA, subconjunto con imágenes, split de validación:

| Metrica | Teacher baseline | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 43,12 | 43,75 | +0,63 |
| Perplejidad (PPL) | 2,45 | 7,33 | 2,99 | -4,34 |

Telemetría de entrenamiento declarada: 166 pasos de optimización, 120,1 segundos, pico de 20.197 MB de VRAM en una RTX 3090, con 0 MB de VRAM del profesor en GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el entrenamiento consumió 20.197 MB en una RTX 3090, pero la inferencia del checkpoint completo (base + deltas) requiere cargar el modelo LLaVA-Qwen-0.5B subyacente.
- GPU recomendadas: NVIDIA GeForce RTX 3090 (24 GB) es la referencia usada por el autor; GPUs con 16 GB o más son un punto de partida razonable para el modelo base de 0,5B.
- Cabe en GPU de consumo: sí, el modelo base de 0,5B es ligero; el autor lo entrenó en una única RTX 3090.
- Opciones de despliegue: el checkpoint está empaquetado para la librería NeuralOps (load_surgeried_model desde neuralops.hub); no se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-griffin-ssd-scienceqa | 0,5B (base) | no disponible | 43,75 % (declarado) | MIT | Hugging Face (NeuralOps) |
| llava-hf/llava-interleave-qwen-0.5b-hf (base) | 0,5B | no disponible | 63,75 % (teacher baseline declarado) | no disponible en la informacion | Hugging Face |
| Otros VLM de ~0,5B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento limitado: 43,75 % de accuracy en ScienceQA frente al 63,75 % del profesor, una caída de 20 puntos porcentuales.
- Sesgos conocidos: no documentados por el autor; al entrenarse solo sobre ScienceQA, el modelo puede sobreajustarse al formato y estilo de ese dataset.
- Riesgo de alucinación: alto en consultas fuera del dominio STEM o con imágenes distintas a las de ScienceQA; no hay evaluación fuera de distribución.
- Limitación de idioma: solo inglés; no se garantiza comportamiento en castellano ni en otros idiomas.
- Restricciones de licencia: MIT, permite uso comercial, pero el modelo base subyacente puede tener sus propias condiciones que deben revisarse por separado.
- Dependencia del ecosistema NeuralOps: requiere la librería neuralops para cargar los deltas quirúrgicos; no es un checkpoint estándar de transformers.
- Artefacto parcial: solo contiene los pesos modificados (18 capas y layernorms), por lo que necesita el modelo base para funcionar.
- Resultados no verificados: las métricas del model-index tienen verified: false.
- Longitud de contexto y cuantizaciones no documentadas, lo que dificulta planificar despliegues en producción.
- Uso previsto de investigación: no se recomienda como modelo de producción para atención al cliente ni tareas generales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-griffin-ssd-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación GriffinSSD: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/ssm/griffin_ssd.py
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
