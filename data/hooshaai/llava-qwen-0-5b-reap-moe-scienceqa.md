# Hooshaai/llava-qwen-0.5b-reap-moe-scienceqa

## Resumen

llava-qwen-0.5b-reap-moe-scienceqa es un checkpoint multimodal de tipo vision-language derivado de `llava-hf/llava-interleave-qwen-0.5b-hf` mediante la técnica de "attention surgery" implementada en la librería NeuralOps. El autor, Hooshaai, sustituye el mecanismo de atención cuadrática de 18 de las 24 capas del decodificador Qwen2 por un operador disperso denominado REAPMoEAttention (Robust Expert Allocation and Pruning Mixture of Experts), manteniendo congelados el torreón visual SigLIP, el proyector MLP y seis capas ancla con atención cuadrática.

El modelo resuelve un problema de compresión y eficiencia: reduce el artefacto en disco de 1,66 GB a 411,64 MB (un 75,8 % menos, factor 4,13x) preservando el rendimiento del profesor en la tarea de razonamiento visual STEM de ScienceQA. El checkpoint final alcanza un 64,38 % de accuracy y una perplejidad de 2,60, frente al 63,75 % y 2,45 del modelo base original.

Es relevante como ejemplo reproducible de cirugía de atención con destilación de conocimiento sobre un VLM pequeño (0,5B parámetros), orientado a entornos con recursos limitados y a la investigación en arquitecturas dispersas. El entrenamiento completo se ejecutó en una única RTX 3090 en 120,4 segundos y 317 pasos de optimización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA interleaved: torreón visual SigLIP congelado + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64) con atención REAPMoE en 18/24 capas |
| Parametros totales | 0,5B (modelo base); el artefacto guardado contiene solo pesos de atención y layernorms (1272 tensores) |
| Parametros activos | no disponible (el operador REAPMoE es disperso pero no se publica el ratio de expertos activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en FP16; el autor no documenta GGUF ni otras cuantizaciones) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, FP16, 411,64 MB) + `surgical_manifest.json` (schema `neuralops.surgery/v2`) |

## Arquitectura y entrenamiento

La arquitectura parte de LLaVA-Interleave-Qwen-0.5B: un torreón visual SigLIP de 27 capas congelado, un proyector MLP de dos capas que alinea los embeddings visuales con el espacio del lenguaje, y un decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas y head_dim 64. La cirugía reemplaza la self-attention de 18 capas (esquema `hybrid_3_1`) por el operador REAPMoEAttention, dejando intactas seis capas ancla con atención cuadrática en los índices [3, 7, 11, 15, 19, 23], además de los MLP, embeddings y el torreón visual.

El entrenamiento es una destilación de conocimiento en dos etapas (142 + 175 pasos, 317 en total) sobre el subconjunto con imágenes de ScienceQA. Se congelan el torreón visual, el proyector y las capas ancla, y solo se entrenan las atenciones sustituidas y los layernorms del decodificador. La destilación recupera el rendimiento: el modelo pasa de un 31,87 % de accuracy en zero-shot pre-KD a un 64,38 % post-KD, superando ligeramente al profesor (63,75 %). La perplejidad baja de 5,12 a 2,60. El entrenamiento consumió 16.153 MB de VRAM pico en una RTX 3090.

## Capacidades

- Respuesta a preguntas visuales (VQA) sobre imágenes, en formato image-text-to-text.
- Razonamiento multimodal en dominios STEM (ciencia, tecnología, ingeniería y matemáticas) orientado a preguntas de opción múltiple.
- Generación de texto conversacional con plantilla de chat (`chat_template.json` incluido).
- Procesamiento de imágenes mediante el preprocesador SigLIP (configuración `preprocessor_config.json`).
- Capacidad multilingüe limitada al inglés.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, thinking mode, audio ni visión de vídeo.

## Casos de uso

- Evaluación de técnicas de compresión de modelos: sirve como referencia reproducible para medir el impacto de sustituir atención cuadrática por operadores dispersos en un VLM pequeño, con métricas de accuracy y perplejidad antes y después de la destilación.
- Investigación en destilación de conocimiento: el par profesor/alumno y el registro de telemetría (pasos, VRAM, duración) permiten replicar experimentos de KD en una sola GPU de consumo.
- Prototipado de asistentes educativos STEM: el modelo responde preguntas con imagen sobre ciencia y matemáticas, adecuado para demos de tutoría académica en inglés.
- Despliegue en entornos con recursos limitados: el artefacto de 411,64 MB y el requisito de menos de 16 GB de VRAM lo hacen viable en estaciones de trabajo modestas para pruebas de concepto.
- Benchmarking de arquitecturas dispersas: útil para comparar el operador REAPMoE frente a atención densa en tareas de razonamiento visual con imágenes.
- Validación de pipelines de cirugía de atención: el manifiesto `surgical_manifest.json` permite auditar qué componentes se modificaron y cuáles se congelaron, útil en flujos de verificación de modelos.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre ScienceQA (Image-Bearing STEM Subset, validation). No verificados de forma independiente.

| Métrica | Profesor (base) | Pre-KD (zero-shot) | Post-KD (final) | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 31,87 | 64,38 | +32,51 |
| Perplejidad | 2,45 | 5,12 | 2,60 | -2,52 |

Telemetría de entrenamiento: RTX 3090 (24 GB), 317 pasos (142 etapa 1 + 175 etapa 2), 120,4 s de duración, 16.153 MB de VRAM pico.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 16 GB en FP16 según la telemetría de entrenamiento; el artefacto de pesos ocupa 411,64 MB, pero la inferencia requiere cargar el modelo base y el torreón visual.
- GPU recomendadas: RTX 3090 (usada por el autor), RTX 4090, A100, H100; cualquier GPU con al menos 16 GB de VRAM.
- Cabe en GPU de consumo: sí, en RTX 3090 y superiores; no se documenta funcionamiento en GPUs de 8-12 GB.
- Opciones de despliegue: la librería NeuralOps (`load_surgeried_model`) es el método documentado; no se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ScienceQA (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-reap-moe-scienceqa | 0,5B | no disponible | 64,38 % acc / 2,60 PPL | MIT | Hugging Face (NeuralOps) |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | 0,5B | no disponible | 63,75 % acc / 2,45 PPL | no disponible | Hugging Face |
| Alternativas de 0,5B en VQA | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado y evaluado únicamente en inglés; no se garantiza rendimiento en castellano ni en otros idiomas.
- Especializado en ScienceQA (subconjunto STEM con imágenes); el rendimiento fuera de ese dominio no está documentado y probablemente degrade.
- Riesgo de alucinación inherente a modelos de 0,5B parámetros; no se han publicado evaluaciones de robustez ni de sesgo.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).
- El artefacto contiene solo pesos de atención y layernorms; requiere el modelo base y la librería NeuralOps para funcionar, lo que limita la portabilidad frente a checkpoints completos.
- No se documenta soporte de tool calling, agentes ni cuantización, lo que restringe su uso en producción con pipelines estándar.
- Licencia MIT permite uso comercial, pero la ausencia de evaluación de sesgos y robustez exige validación adicional antes de desplegarlo en entornos reales.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-reap-moe-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación REAPMoE: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/sparse/reap_moe.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
