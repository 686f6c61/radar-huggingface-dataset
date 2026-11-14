# Hooshaai/llava-qwen-0.5b-gqa-attention-scienceqa

## Resumen

llava-qwen-0.5b-gqa-attention-scienceqa es un checkpoint multimodal de tipo vision-language derivado de llava-hf/llava-interleave-qwen-0.5b-hf, publicado por el usuario Hooshaai dentro del ecosistema NeuralOps. No se trata de un modelo entrenado desde cero, sino de un artefacto de "cirugía de atención": se sustituye el mecanismo de self-attention en 18 de las 24 capas del decodificador Qwen2 por un operador Grouped-Query Attention (GQA) registrado como `gqa_attention`, manteniendo congelados el torreón visual SigLIP, el proyector MLP de dos capas y seis capas ancla con atención cuadrática original.

El modelo resuelve un problema muy concreto: evaluar si es posible reemplazar capas de atención estándar por implementaciones alternativas (en este caso GQA con soporte de KV-cache y SDPA) sin degradar el rendimiento en razonamiento visual sobre dominios STEM. Para ello se aplica destilación de conocimiento offline desde el modelo base (profesor) hacia las capas modificadas (estudiante), usando la arquitectura de caché de representaciones de NeuralOps. El resultado declarado es una accuracy del 65,00 % en el subconjunto con imagen de ScienceQA (validación) y una perplejidad de 2,14.

Su relevancia actual es doble: por un lado, sirve como banco de pruebas reproducible para investigación en atención eficiente y compresión de pesos (el artefacto serializado ocupa 147,61 MB frente a 1,66 GB del base, un 91,3 % menos); por otro, demuestra un flujo de destilación que cabe en una única RTX 3090 de 24 GB con 0 MB de VRAM dedicada al profesor, lo que abarata experimentación que normalmente requiere clústeres multi-GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA interleaved: torreón visual SigLIP congelado + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64) con GQA sustituido en 18/24 capas |
| Parametros totales | no disponible (el modelo base es de 0,5B; el artefacto serializado pesa 147,61 MB en FP16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 safetensors) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_weights.safetensors, delta quirúrgico) + tokenizer.json, vocab.json, merges.txt |

## Arquitectura y entrenamiento

La arquitectura parte de LLaVA-Qwen-0.5B: un torreón visual SigLIP de 27 capas completamente congelado, un proyector multi-modal MLP de dos capas que alinea el espacio visual con el textual, y un decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas y head_dim 64. La intervención quirúrgica reemplaza la self-attention en 18 de las 24 capas del decodificador (esquema `hybrid_3_1`) por el operador GroupedQueryAttention de NeuralOps, que es rank-aware, compatible con KV-cache y acelerado con SDPA. Se preservan intactas seis capas ancla con atención cuadrática original en los índices [3, 7, 11, 15, 19, 23], además de los MLP, embeddings y layernorms del decodificador (estos últimos sí se entrenan).

El entrenamiento consiste en destilación de conocimiento offline mediante la arquitectura de caché de representaciones de NeuralOps (§21.1), con el modelo base actuando como profesor sin ocupar VRAM en GPU durante el proceso. Se ejecutaron 224 pasos de optimización (84 en etapa 1, 140 en etapa 2) en una única NVIDIA GeForce RTX 3090 de 24 GB, con un pico de 17.886 MB de VRAM y una duración total de 120,6 segundos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de ScienceQA, ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) en formato conversacional.
- Razonamiento visual sobre preguntas de ciencia y STEM con soporte de opción múltiple (respuesta por letra).
- Comprensión de figuras, diagramas e ilustraciones científicas dentro del subconjunto con imagen de ScienceQA.
- Formato de chat mediante plantilla conversacional incluida (chat_template.json).
- Procesamiento de imágenes a través del preprocesador SigLIP incluido (preprocessor_config.json).
- Capacidad multilingüe limitada al inglés según la model card.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, modo thinking, audio ni vídeo en la información disponible.

## Casos de uso

- Investigación en atención eficiente: el checkpoint permite comparar directamente el operador GQA de NeuralOps frente a la atención cuadrática original sobre las mismas capas y el mismo dataset, sirviendo como referencia reproducible para papers de "attention surgery".
- Destilación de conocimiento de bajo coste: el flujo documentado (caché offline del profesor, 0 MB de VRAM de profesor, 120,6 s en una RTX 3090) es replicable para destilar otros modelos pequeños en hardware de consumo.
- Evaluación de compresión de pesos: con 147,61 MB frente a 1,66 GB del base (11,53x más pequeño), es útil para estudiar el impacto de artefactos delta en la calidad final.
- Prototipado de asistentes educativos STEM: puede responder preguntas de ciencia con imagen y opción múltiple, adecuado para demos de tutores visuales en inglés.
- Benchmarking de VLM pequeños: sirve como baseline de 0,5B parámetros en tareas de visual question answering con imagen para comparar con modelos mayores.
- Validación de pipelines NeuralOps: útil para probar la API `load_surgeried_model` y el formato de manifiesto quirúrgico (`surgical_manifest.json`) en entornos de integración continua.
- Estudio de retención de conocimiento tras sustitución de capas: la comparación pre-KD (32,50 %) frente a post-KD (65,00 %) documenta cuánto recupera la destilación tras una cirugía agresiva en 18/24 capas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Metrica | Profesor (baseline) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) en ScienceQA (image-bearing STEM, validation) | 63,75 | 32,50 | 65,00 | +32,50 |
| Perplejidad (PPL) | 2,45 | 5,12 | 2,14 | -2,98 |

Telemetría de entrenamiento declarada: 224 pasos totales (84 etapa 1, 140 etapa 2), 120,6 s de duración, pico de 17.886 MB de VRAM en una RTX 3090 de 24 GB, timestamp 2026-11-11T06:51:55Z. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base completo en FP16 ronda 1,66 GB de pesos; el artefacto delta serializado ocupa 147,61 MB, pero para inferencia hay que cargar el modelo base más el delta, por lo que se necesita al menos ~2-3 GB de VRAM en FP16.
- GPU recomendadas: cualquier GPU consumer moderna con 4 GB o más de VRAM es suficiente; el autor reporta entrenamiento en una RTX 3090 de 24 GB con 17.886 MB de pico, pero la inferencia es mucho más ligera.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y equivalentes; también en GPUs de portátil con 4-6 GB.
- Opciones de despliegue: la model card documenta la API `neuralops.hub.load_surgeried_model` del ecosistema NeuralOps; no se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI en la información disponible. Al ser safetensors estándar más un manifiesto, es plausible cargarlo con transformers aplicando manualmente el delta, pero no está verificado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (img, val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hooshaai/llava-qwen-0.5b-gqa-attention-scienceqa | ~0,5B (delta 147,61 MB) | no disponible | 65,00 % (declarado, no verificado) | MIT | Hugging Face, 39 descargas |
| llava-hf/llava-interleave-qwen-0.5b-hf (modelo base) | ~0,5B | no disponible | 63,75 % (baseline declarado por el autor) | no disponible en la información | Hugging Face |
| Otros VLM pequeños de ~0,5B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base porque la información proporcionada no incluye datos de otros VLM comparables de tamaño similar. No se dispone de resultados de terceros para contrastar la accuracy declarada.

## Limitaciones y advertencias

- Los resultados de benchmarks (65,00 % accuracy, PPL 2,14) están marcados como `verified: false` en la model card; no han sido reproducidos de forma independiente.
- El modelo solo soporta inglés según la model card; no se documenta comportamiento en castellano ni en otros idiomas.
- El checkpoint es un artefacto delta quirúrgico, no un modelo autónomo: requiere el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` y el runtime NeuralOps para cargarse correctamente.
- La cirugía modifica 18/24 capas de atención, lo que puede introducir degradaciones no medidas en tareas fuera de ScienceQA (por ejemplo, diálogo visual abierto o grounding).
- Riesgo de alucinación inherente a los VLM de 0,5B parámetros, especialmente en preguntas abiertas o imágenes ambiguas.
- Sesgos conocidos: no documentados en la información disponible; al derivar de Qwen2 y SigLIP, hereda los sesgos de sus datos de preentrenamiento originales, no auditados aquí.
- Licencia MIT: permite uso comercial, pero el aviso de licencia apunta a un LICENSE del repositorio NeuralOps en GitHub, por lo que conviene verificar la cadena de licencias del modelo base antes de producción.
- El tamaño del repo (0,2 GB) y las 39 descargas indican un artefacto de investigación con poca validación comunitaria; no recomendado como dependencia crítica sin evaluación propia.
- No se documentan límites de contexto, tipos de cuantización soportados ni compatibilidad con motores de inferencia estándar, lo que complica su integración en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-gqa-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador GQA: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/modern/gqa_attention.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
