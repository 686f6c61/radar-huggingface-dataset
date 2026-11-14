# Hooshaai/llava-qwen-0.5b-optimized-hybrid-attention-scienceqa

## Resumen

`Hooshaai/llava-qwen-0.5b-optimized-hybrid-attention-scienceqa` es un checkpoint multimodal de tipo visión-lenguaje derivado de `llava-hf/llava-interleave-qwen-0.5b-hf` mediante una técnica de "cirugía de atención" (attention surgery) implementada en la librería NeuralOps. El autor, Hooshaai, sustituye el mecanismo de atención cuadrática estándar en 18 de las 24 capas del decodificador Qwen2 por un operador híbrido denominado `OptimizedHybridAttention` (OHA), manteniendo seis capas ancla con atención cuadrática intacta. El resultado es un artefacto de pesos de solo 261,94 MB (frente a los 1,66 GB del modelo base en FP16), lo que supone una reducción del 84,6 %.

El modelo se ha afinado mediante destilación de conocimiento offline sobre el subconjunto con imágenes de ScienceQA (validación), alcanzando un 58,13 % de accuracy y una perplejidad de 2,35. Aunque el modelo base declara 0,5B de parámetros, el artefacto publicado contiene únicamente los pesos de atención modificados y las layer norms entrenadas, no el modelo completo; para ejecutarlo es necesario recombinarlo con el checkpoint original de LLaVA-Qwen-0.5B.

Su relevancia actual reside en la exploración de arquitecturas híbridas de atención como vía para reducir el coste computacional y el tamaño en disco de los VLM, así como en la metodología de destilación con caché de representaciones offline que permite entrenar sin mantener el profesor en VRAM. No obstante, se trata de un experimento de investigación con descargas muy limitadas (37) y sin verificación independiente de sus métricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP vision tower congelado + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas, D=1024, H=16, head_dim=64) con atención híbrida OptimizedHybridAttention en 18/24 capas |
| Parametros totales | 0,5B (modelo base); artefacto publicado: 570 tensores, 261,94 MB en FP16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16) |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, `weights_format=attention_only_fp16`) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura LLaVA-Interleave-Qwen-0.5B: una torre de visión SigLIP congelada de 27 capas, un proyector multimodal MLP de dos capas y un decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas de atención y dimensión de cabeza 64. La intervención quirúrgica reemplaza la auto-atención en 18 de las 24 capas (esquema `hybrid_3_1`) por el operador `OptimizedHybridAttention`, conservando atención cuadrática estándar en las capas ancla `[3, 7, 11, 15, 19, 23]`. Los MLP del decodificador, los embeddings, el proyector y la torre de visión permanecen congelados y no se incluyen en el artefacto publicado.

El entrenamiento se realizó mediante destilación de conocimiento con la arquitectura de caché de representaciones offline de NeuralOps (§21.1), lo que permite prescindir del profesor en VRAM durante el ajuste (0 MB de VRAM de profesor). Se ejecutaron 220 pasos de optimización (92 en etapa 1 y 128 en etapa 2) en una única NVIDIA RTX 3090 de 24 GB, con un pico de 19.771 MB de VRAM y una duración total de 120,1 segundos. El conjunto de evaluación es el subconjunto con imágenes de ScienceQA (validación) del dataset `derek-thomas/ScienceQA`. No se especifica el número de tokens de entrenamiento ni la composición completa del dataset más allá de ScienceQA.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) para preguntas y respuestas de tipo STEM.
- Razonamiento visual de nivel básico sobre diagramas e ilustraciones científicas de ScienceQA.
- Respuesta a preguntas de opción múltiple con contexto visual.
- Conversación multimodal de un solo turno o multi-turno (pipeline `image-text-to-text`, template de chat incluido).
- Capacidad multilingüe limitada al inglés.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- No se documentan modos especiales como thinking mode, audio o vídeo.

## Casos de uso

- Evaluación de arquitecturas híbridas de atención: sirve como banco de pruebas para comparar el operador `OptimizedHybridAttention` frente a atención cuadrática estándar en tareas de razonamiento visual, midiendo el impacto en accuracy y perplejidad sobre ScienceQA.
- Investigación en destilación offline: el pipeline NeuralOps con caché de representaciones permite reproducir el entrenamiento en una sola RTX 3090 sin mantener el profesor en memoria, útil para experimentos de compresión de VLM en laboratorios con recursos limitados.
- Prototipado de tutores educativos de ciencias: con 58,13 % de accuracy en ScienceQA, puede emplearse como base para asistentes de preguntas-respuestas sobre material STEM ilustrado, siempre con supervisión humana.
- Estudio de reducción de huella en disco: el artefacto de 261,94 MB (frente a 1,66 GB) es adecuado para analizar técnicas de serialización selectiva de pesos y su impacto en el rendimiento.
- Benchmarking de operadores de atención: integrable en pipelines de evaluación comparativa de mecanismos de atención (attention zoo) para medir latencia y calidad en GPUs de consumo.
- Docencia y divulgación: ejemplo reproducible de cirugía de atención y destilación con métricas y telemetría completas (pasos, VRAM, duración) para explicar técnicas de compresión de modelos multimodales.
- Análisis de robustez multimodal: permite estudiar cómo degrada el rendimiento un VLM pequeño al sustituir atención completa por atención híbrida en la mayoría de capas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Teacher baseline | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 34,38 | 58,13 | +23,75 |
| Perplejidad (PPL) | 2,45 | 3,93 | 2,35 | -1,58 |

El conjunto de evaluación es ScienceQA (subconjunto con imágenes, validación). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El artefacto publicado (261,94 MB) no es ejecutable por sí solo: requiere recombinarse con el checkpoint base `llava-hf/llava-interleave-qwen-0.5b-hf` (1,66 GB en FP16) para inferencia.
- VRAM estimada para inferencia del modelo completo: en torno a 2-3 GB en FP16 para los pesos, más overhead de activaciones y del procesador de imagen; cabe holgadamente en GPUs de consumo.
- GPU utilizadas en el entrenamiento: NVIDIA GeForce RTX 3090 (24 GB), con un pico de 19.771 MB de VRAM durante la destilación.
- GPUs recomendadas para inferencia: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, A100 o H100; cualquier GPU con al menos 6-8 GB de VRAM debería ser suficiente para el modelo completo.
- Opciones de despliegue: la librería NeuralOps (`neuralops.hub.load_surgeried_model`) es la vía documentada; al estar basado en LLaVA/Qwen2, podría adaptarse a vLLM, TGI o llama.cpp, aunque no se documenta soporte oficial para estos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-optimized-hybrid-attention-scienceqa | 0,5B (artefacto 261,94 MB) | no disponible | 58,13 % accuracy / 2,35 PPL en ScienceQA (imágenes, val) | MIT | Hugging Face, 37 descargas |
| llava-hf/llava-interleave-qwen-0.5b-hf (modelo base) | 0,5B | no disponible | 63,75 % accuracy / 2,45 PPL como teacher en la misma evaluación | no disponible en la información | Hugging Face |
| Otros VLM pequeños (p. ej. variantes LLaVA de <1B) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El artefacto publicado contiene únicamente los pesos de atención modificados y las layer norms entrenadas; no es un modelo autónomo y requiere recombinación con el checkpoint base.
- Las métricas (58,13 % accuracy, 2,35 PPL) están declaradas por el autor y marcadas como `verified: false`; no han sido replicadas de forma independiente.
- El modelo se ha evaluado únicamente en el subconjunto con imágenes de ScienceQA (validación); no hay evidencia de generalización a otras tareas visuales o dominios.
- Pérdida de rendimiento respecto al profesor: 5,62 puntos porcentuales de accuracy (63,75 % frente a 58,13 %).
- Idiomas: solo inglés; no se documenta soporte multilingüe.
- Longitud de contexto: no documentada, lo que impide planificar su uso en conversaciones largas.
- Riesgo de alucinación inherente a los VLM pequeños, especialmente en razonamiento científico y con imágenes ambiguas.
- Sesgos: no se documentan análisis de sesgo demográfico, cultural o de dominio.
- Licencia MIT, que permite uso comercial, pero al derivar del checkpoint base LLaVA-Qwen-0.5B conviene verificar las condiciones del modelo original.
- Descargas muy bajas (37) y ausencia de likes: ecosistema de validación prácticamente nulo.
- Dependencia de la librería NeuralOps para cargar el artefacto, lo que limita la portabilidad a otros stacks de inferencia.
- La model card está truncada en la información disponible; no se detallan hiperparámetros completos de destilación ni la composición exacta del dataset de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-optimized-hybrid-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/hybrid/optimized_hybrid_attention.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
