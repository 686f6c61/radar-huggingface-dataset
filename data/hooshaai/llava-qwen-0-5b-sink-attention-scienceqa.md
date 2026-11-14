# Hooshaai/llava-qwen-0.5b-sink-attention-scienceqa

## Resumen

`llava-qwen-0.5b-sink-attention-scienceqa` es un checkpoint multimodal de tipo vision-language publicado por el usuario Hooshaai dentro del ecosistema NeuralOps. Se deriva del modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` mediante una intervención de "cirugía de atención" que sustituye el mecanismo de atención estándar de 18 de las 24 capas del decoder Qwen2 por una variante denominada SinkAttention, de familia adaptativa, inspirada en StreamingLLM (sink tokens más caché KV deslizante). El resultado es un artefacto de pesos parciales de 370,62 MB, un 78,2 % más pequeño que el checkpoint FP16 completo del modelo base.

El modelo está afinado y evaluado sobre el subconjunto con imagen del dataset ScienceQA (split de validación), orientado a razonamiento visual STEM. Su relevancia es fundamentalmente metodológica: sirve como demostración reproducible de que es posible aplicar compresión estructural sobre la atención de un VLM pequeño (0,5B parámetros) manteniendo un perfil de perplejidad bajo, aunque a costa de una pérdida notable de precisión respecto al profesor original.

Se distribuye con licencia MIT, únicamente en inglés, y requiere la librería `neuralops` para su carga, ya que el repositorio contiene solo los pesos delta de atención y un manifiesto quirúrgico, no un checkpoint completo autónomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (torre visual SigLIP congelada + proyector MLP de 2 capas + decoder Qwen2 de 24 capas, D=1024, H=16, head_dim=64) con atención SinkAttention en 18/24 capas |
| Parametros totales | No disponible (modelo base de 0,5B; el artefacto guarda solo pesos de atención) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la ventana deslizante de SinkAttention se define por `window_size` y `num_sink_tokens`, valores no publicados) |
| Tipos de cuantizacion | FP16 en el artefacto distribuido; no se documentan otras cuantizaciones |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, `weights_format=attention_only_fp16`) |

## Arquitectura y entrenamiento

El modelo parte de LLaVA-Interleave-Qwen-0.5B: una torre visual SigLIP de 27 capas congelada, un proyector MLP de dos capas y un decoder Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas y head_dim 64. La intervención quirúrgica reemplaza el módulo `self_attn` en 18 de las 24 capas del decoder (esquema `hybrid_3_1`), dejando seis capas ancla cuadráticas en los índices [3, 7, 11, 15, 19, 23]. SinkAttention mantiene la secuencia completa de hidden states para las queries, acumula claves y valores en caché y los poda conservando los primeros `num_sink_tokens` y los últimos `window_size - num_sink_tokens`, preservando posiciones absolutas para el enmascaramiento causal. La implementación es válida tanto para modelos bidireccionales como causales.

El entrenamiento se realizó en dos etapas de destilación de conocimiento sobre ScienceQA, con 376 pasos totales (179 en la etapa 1 y 197 en la etapa 2), durante 120,1 segundos en una única RTX 3090 de 24 GB, con un pico de VRAM de 11.903 MB. Permanecen congelados la torre visual, el proyector multimodal, las seis capas ancla, los MLP y los embeddings del decoder; solo se entrenan las atenciones modificadas y los layernorms del decoder. El manifiesto (`schema_version=neuralops.surgery/v2`) registra 714 tensores guardados.

## Capacidades

- Generación de texto e imagen-a-texto conversacional (pipeline `image-text-to-text`).
- Respuesta a preguntas visuales sobre contenido STEM con imagen (ScienceQA).
- Razonamiento visual básico de opción múltiple en contextos científicos.
- Atención con caché KV podada, lo que permite procesar secuencias largas con memoria acotada.
- Soporte de chat mediante plantilla de conversación incluida (`chat_template.json`).
- Capacidad multilingüe limitada al inglés.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido.

## Casos de uso

- Investigación en compresión de atención: sirve como referencia reproducible para comparar SinkAttention frente a atención cuadrática completa en un VLM pequeño, con métricas de precisión y perplejidad ya publicadas.
- Evaluación de destilación de conocimiento multimodal: permite estudiar la brecha entre profesor (63,75 % de precisión) y alumno comprimido (28,12 %) en ScienceQA.
- Prototipado de asistentes educativos STEM: puede responder preguntas de opción múltiple sobre diagramas científicos en inglés, siempre con validación humana dada su baja precisión.
- Despliegue en hardware de gama baja: el artefacto de 370,62 MB y el modelo base de 0,5B caben holgadamente en GPUs de consumo, lo que facilita experimentos de inferencia multimodal en equipos modestos.
- Pruebas de integración con el stack NeuralOps: valida el flujo `load_surgeried_model` y el manifiesto quirúrgico en pipelines internos.
- Benchmarking de variantes de atención: al existir una "attention zoo" del mismo autor, este checkpoint sirve como punto de comparación frente a otras cirugías de atención sobre el mismo modelo base.
- Docencia y divulgación: ejemplo didáctico de cómo se aplica pruning de caché KV estilo StreamingLLM a un modelo multimodal.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ScienceQA, subconjunto con imagen, split de validación:

| Metrica | Profesor (base) | Zero-shot pre-KD | Final post-KD | Delta final |
|---|---:|---:|---:|---:|
| Precisión (%) | 63,75 | 30,00 | 28,12 | -1,88 |
| Perplejidad | 2,45 | 4,57 | 1,21 | -3,36 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B en FP16 requiere aproximadamente 1,66 GB de pesos; con overhead de activaciones y caché KV, cabe en GPUs de 4-6 GB. El artefacto quirúrgico pesa 370,62 MB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM; el entrenamiento se realizó en una RTX 3090 (24 GB) con pico de 11,9 GB.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: la carga requiere la librería `neuralops` (`load_surgeried_model`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El entrenamiento de 376 pasos tardó 120,1 s en una RTX 3090, pero no se publican métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión ScienceQA (img) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-sink-attention-scienceqa | ~0,5B (base) | No disponible | 28,12 % | MIT | Hugging Face (requiere `neuralops`) |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | ~0,5B | No disponible | 63,75 % | No disponible en la información | Hugging Face |
| Otras variantes de la attention zoo de NeuralOps | ~0,5B | No disponible | No disponible | MIT | Hugging Face |

No se dispone de datos de benchmarks de modelos externos comparables en la información proporcionada.

## Limitaciones y advertencias

- Precisión baja: 28,12 % en ScienceQA con imagen, muy por debajo del profesor (63,75 %) y del zero-shot pre-KD (30,00 %); no es apto para producción sin validación adicional.
- El artefacto contiene solo pesos de atención y layernorms; es necesario el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` y la librería `neuralops` para reconstruir el modelo completo.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Riesgo de alucinación inherente a modelos de 0,5B y agravado por la compresión de atención.
- Sesgos no evaluados ni documentados por el autor.
- La ventana efectiva de SinkAttention depende de parámetros no publicados (`window_size`, `num_sink_tokens`), lo que limita la reproducibilidad exacta del comportamiento en contextos largos.
- Resultados de benchmarks no verificados (`verified: false`); deben tratarse como declaraciones del autor.
- Licencia MIT permite uso comercial, pero la baja calidad del modelo desaconseja su uso en entornos productivos reales.
- Fecha de creación del repositorio (2026-11-11) y telemetría de entrenamiento poco convencional; conviene auditar el manifiesto antes de confiar en el checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-sink-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Implementación SinkAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/adaptive/sink_attention.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
