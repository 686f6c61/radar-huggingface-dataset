# Hooshaai/llava-qwen-0.5b-primal-attention-scienceqa

## Resumen

`llava-qwen-0.5b-primal-attention-scienceqa` es un checkpoint multimodal de tipo vision-language publicado por el usuario Hooshaai dentro del ecosistema NeuralOps. Se construye a partir del modelo base `llava-hf/llava-interleave-qwen-0.5b-hf`, un LLaVA interleaved que combina una torre de visión SigLIP congelada, un proyector MLP de dos capas y un decodificador Qwen2 de 24 capas con dimensión oculta 1024. La intervención quirúrgica sustituye el mecanismo de atención estándar en 18 de las 24 capas por un operador lineal denominado PrimalAttention, manteniendo seis capas ancla con atención cuadrática clásica.

El modelo está afinado y destilado específicamente sobre el subconjunto con imagen del dataset ScienceQA (validación), orientado a razonamiento visual STEM. La propuesta no es competir en capacidades generales, sino demostrar una técnica de "attention surgery" con destilación offline de representaciones sobre una única RTX 3090, reduciendo el artefacto en disco a 259,12 MB frente a los 1,66 GB del base FP16.

Su relevancia actual es metodológica: documenta de forma reproducible cómo reemplazar atención cuadrática por variantes lineales en un VLM pequeño sin colapsar el rendimiento, con métricas declaradas de 64,38 % de accuracy y perplejidad 2,30 en ScienceQA. Es un modelo de investigación, no un modelo de producción general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA interleaved: torre de visión SigLIP congelada (27 capas) + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64); atención PrimalAttention lineal en 18/24 capas, 6 capas ancla cuadráticas |
| Parametros totales | No disponible de forma explícita; el artefacto guardado contiene 498 tensores con 271.703.152 bytes en FP16 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos serializados en FP16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, `weights_format=attention_only_fp16`), más `surgical_manifest.json`, `config.json` y tokenizer BPE |

## Arquitectura y entrenamiento

El modelo parte de `llava-interleave-qwen-0.5b-hf` y aplica una cirugía de atención con patrón `hybrid_3_1`: se sustituye la self-attention en 18 de las 24 capas del decodificador por PrimalAttention, un operador de la familia lineal basado en SVD de kernel asimétrico en representación primal. Las capas `[3, 7, 11, 15, 19, 23]` permanecen con atención cuadrática como anclas. Se congelan la torre SigLIP, el proyector multimodal, los MLP del decodificador y los embeddings; solo se entrenan las atenciones modificadas y los layernorms del decodificador.

El entrenamiento combina destilación de conocimiento con la arquitectura de caché offline de representaciones de NeuralOps (§21.1), lo que permite destilar sin mantener el teacher en VRAM. Se ejecutaron 294 pasos (130 en etapa 1, 164 en etapa 2) en 120,4 segundos sobre una RTX 3090 de 24 GB, con un pico de 15.796 MB. El dataset es `derek-thomas/ScienceQA`, subconjunto con imagen, split de validación. No se documentan número de tokens de entrenamiento, composición completa del dataset, ni uso de RLHF o DPO.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) en formato conversacional.
- Respuesta a preguntas visuales de tipo STEM (ciencia, tecnología, ingeniería y matemáticas) sobre el dominio ScienceQA.
- Razonamiento visual de opción múltiple con soporte de imagen interleaved.
- Formato de chat mediante `chat_template.json`.
- Procesamiento de imagen con preprocesador SigLIP incluido (`preprocessor_config.json`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso general.
- Multilingüe: no; únicamente inglés.
- No se documenta modo thinking, audio ni vídeo.

## Casos de uso

- Evaluación de técnicas de atención lineal en VLMs: sirve como referencia reproducible para comparar PrimalAttention frente a atención cuadrática en un mismo backbone LLaVA-Qwen-0.5B, con métricas declaradas de accuracy y perplejidad.
- Investigación en destilación de conocimiento con caché offline: el checkpoint documenta un flujo que entrena sin teacher en GPU, útil para laboratorios con hardware limitado que quieran replicar el pipeline NeuralOps.
- Prototipado de asistentes educativos STEM: con 64,38 % de accuracy en el subconjunto con imagen de ScienceQA, puede usarse como base para experimentos de tutoría visual en preguntas de ciencias de nivel escolar.
- Benchmarking de compresión de artefactos: el guardado solo de atenciones modificadas reduce el artefacto a 259,12 MB (84,8 % menos que el base FP16), útil para estudiar estrategias de distribución de deltas quirúrgicos.
- Análisis de robustez de la atención híbrida: las seis capas ancla permiten estudiar qué capas toleran sustitución lineal y cuáles no en un VLM de 0,5B.
- Docencia y divulgación sobre "attention surgery": el manifiesto `surgical_manifest.json` y `training_metrics.json` hacen el experimento auditable paso a paso para cursos de arquitecturas de transformers.
- Validación de pipelines de carga con `neuralops.hub.load_surgeried_model`: útil para equipos que integren la librería NeuralOps y necesiten un checkpoint de prueba pequeño.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`). Evaluación sobre ScienceQA, subconjunto con imagen STEM, split de validación.

| Métrica | Teacher baseline | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 32,50 | 64,38 | +31,88 |
| Perplejidad (PPL) | 2,45 | 5,12 | 2,30 | -2,82 |

Telemetría de entrenamiento declarada: 294 pasos, 120,4 s, pico de 15.796 MB en RTX 3090 (24 GB), timestamp 2026-11-11T08:50:11Z.

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El artefacto de atenciones pesa 259,12 MB en FP16, pero la inferencia requiere además la torre SigLIP, el proyector, los MLP y embeddings del base, por lo que el consumo real será superior al del delta.
- GPU recomendadas: el autor valida el entrenamiento en NVIDIA GeForce RTX 3090 (24 GB). Para inferencia, cualquier GPU con memoria suficiente para el base LLaVA-Qwen-0.5B más el delta debería bastar; no se documentan cifras concretas.
- Cabe en GPU de consumo: sí, según el hardware de entrenamiento declarado (RTX 3090). No se confirma para GPUs de 8-12 GB.
- Opciones de despliegue: la model card documenta carga mediante `neuralops.hub.load_surgeried_model`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Rendimiento ScienceQA |
|---|---|---|---|---|---|
| `Hooshaai/llava-qwen-0.5b-primal-attention-scienceqa` | ~0,5B (base Qwen2 24 capas) | No disponible | MIT | LLaVA + PrimalAttention lineal en 18/24 capas, destilado | 64,38 % accuracy, PPL 2,30 (declarado) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (teacher) | ~0,5B | No disponible | No disponible en la información | LLaVA interleaved con atención cuadrática | 63,75 % accuracy, PPL 2,45 (declarado como baseline) |
| Otros VLMs pequeños (p. ej. variantes LLaVA-0.5B o SmolVLM) | ~0,5B | No disponible | Variable | Atención cuadrática estándar | No disponible en la información |

No se dispone de datos comparativos adicionales verificados en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: entrenado y evaluado únicamente sobre ScienceQA (subconjunto con imagen, validación); no se ha validado su comportamiento fuera de ese dominio.
- Idioma: solo inglés; no soporta castellano ni otros idiomas de forma declarada.
- Riesgo de alucinación: no cuantificado; al ser un VLM pequeño (0,5B) y especializado, la generalización fuera de STEM es incierta.
- Métricas no verificadas: accuracy y perplejidad están marcadas como `verified: false` en la model card; deben tratarse como declaraciones del autor.
- Artefacto parcial: el repositorio contiene solo las atenciones modificadas y layernorms, no los pesos completos; requiere el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` para funcionar.
- Dependencia de librería: la carga se documenta mediante `neuralops`, una librería no estándar; la integración con ecosistemas como transformers, vLLM o llama.cpp no está documentada.
- Licencia MIT: permite uso comercial, pero el modelo base puede tener sus propias condiciones que deben revisarse por separado.
- Sin soporte documentado de tool calling, agentes ni contexto largo; no apto para pipelines de producción que requieran esas capacidades.
- Fecha de creación declarada (2026-11-11) y telemetría de entrenamiento deben interpretarse tal cual aparecen en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-primal-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de PrimalAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/linear/primal_attention.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
