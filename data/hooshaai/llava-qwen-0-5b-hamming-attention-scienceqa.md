# Hooshaai/llava-qwen-0.5b-hamming-attention-scienceqa

## Resumen
llava-qwen-0.5b-hamming-attention-scienceqa es un checkpoint experimental de la serie "Attention Surgery Zoo" del proyecto NeuralOps, desarrollado por el usuario Hooshaai. Parte del modelo base llava-hf/llava-interleave-qwen-0.5b-hf, un vision-language model de tipo LLaVA que combina una torre de visión SigLIP congelada, un proyector MLP de dos capas y un decodificador Qwen2 de 24 capas con dimensión oculta 1024. La intervención consiste en sustituir la atención cuadrática estándar por un operador disperso denominado HammingAttention en 18 de las 24 capas del decodificador, manteniendo seis capas ancla con atención cuadrática.

El modelo no busca ser un VLM de propósito general, sino un artefacto de investigación para estudiar destilación de atención y compresión quirúrgica de pesos. Se ha ajustado mediante destilación de representaciones (Hamming Attention Distillation) sobre el subconjunto de ScienceQA con imágenes, en una única RTX 3090, y los pesos serializados ocupan 147,62 MB frente a los 1,66 GB del modelo base, una reducción del 91,3 %.

Es relevante ahora porque demuestra un flujo de trabajo reproducible para inyectar operadores de atención alternativos en VLMs pequeños sin reentrenar desde cero, aunque su rendimiento final (41,88 % de accuracy) queda muy por debajo del profesor (63,75 %). Es, por tanto, una pieza de experimentación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP vision tower + MLP projector + decoder Qwen2) con HammingAttention dispersa en 18/24 capas |
| Parametros totales | no disponible (modelo base de 0,5B; artefacto de pesos de 147,62 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en FP16 safetensors) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_weights.safetensors), mas tokenizer, config y manifiesto quirurgico en JSON |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura LLaVA interleaved de Qwen2-0.5B: torre visual SigLIP de 27 capas congelada, proyector multimodal de dos capas MLP y decodificador Qwen2 de 24 capas con D=1024, H=16 cabezas y head_dim=64. La "cirugía" sustituye la self-attention de 18 capas (esquema hybrid_3_1) por el operador HammingAttention, de familia sparse, dejando intactas las capas [3, 7, 11, 15, 19, 23] como anclas cuadráticas. También se congelan el proyector, los MLP y los embeddings; solo se entrenan las atenciones modificadas y los layernorms del decodificador.

El entrenamiento se realizó mediante destilación de representaciones con la arquitectura de caché offline de NeuralOps (§21.1), en una RTX 3090 de 24 GB, con 213 pasos totales (80 en etapa 1, 133 en etapa 2) y una duración de 120,4 segundos. El pico de VRAM fue de 19.877 MB y no se requirió VRAM del profesor en GPU durante el ajuste. El dataset empleado es derek-thomas/ScienceQA, restringido al subconjunto de validación con imágenes. No se documentan tokens de entrenamiento, composición exacta del dataset ni uso de RLHF/DPO.

## Capacidades
- Generación de texto condicionada por imagen (image-text-to-text) en formato conversacional.
- Respuesta a preguntas visuales de tipo STEM, especialmente preguntas de opción múltiple con figura.
- Razonamiento multimodal básico sobre diagramas científicos sencillos.
- Soporte de chat multi-turno mediante plantilla de chat incluida (chat_template.json).
- Capacidad multilingüe limitada al inglés.
- No se documenta soporte de tool calling, function calling, agentes ni modo thinking.
- No se documenta visión de alta resolución, audio ni otras modalidades.

## Casos de uso
- Investigación en atención dispersa: sirve como punto de partida para reproducir el experimento de sustitución de atención en un VLM pequeño y medir el impacto en perplejidad y accuracy.
- Estudio de destilación de representaciones: permite analizar cómo se recupera la perplejidad (de 170,75 a 3,16) tras la cirugía sin recuperar la accuracy del profesor.
- Prototipado de asistentes educativos STEM en inglés: puede responder preguntas de opción múltiple sobre figuras de ScienceQA, siempre con validación humana dado su 41,88 % de accuracy.
- Benchmarking de operadores de atención: útil para comparar HammingAttention frente a atención cuadrática en tareas de VQA con un coste de hardware mínimo (una RTX 3090).
- Docencia y divulgación: ejemplo reproducible de "attention surgery" y compresión de pesos con reducción del 91,3 % del artefacto.
- Pruebas de integración con la librería neuralops: validación de la API load_surgeried_model y del manifiesto quirúrgico en pipelines de investigación.
- No recomendado para atención al cliente, generación de código en producción ni agentes autónomos: el modelo no está entrenado para ello y su alcance es un subconjunto de ScienceQA.

## Benchmarks y rendimiento
Resultados declarados por el autor (no verificados) sobre ScienceQA, subconjunto con imágenes, split de validación:

| Metrica | Profesor (baseline) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 41,88 | 41,88 | +0,00 |
| Perplejidad | 2,45 | 170,75 | 3,16 | -167,59 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; el entrenamiento consumió 19.877 MB en una RTX 3090. Al tratarse de un modelo de 0,5B en FP16, la inferencia debería caber holgadamente en GPUs consumer de 8-12 GB, aunque no se documenta.
- GPU recomendadas: RTX 3090 (validada para el ajuste), RTX 4090, A100 o H100 para servir a mayor escala; GPUs consumer de gama media probablemente suficientes para inferencia.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 12 GB o superiores, aunque no hay medición publicada.
- Opciones de despliegue: la model card solo documenta la API de neuralops (load_surgeried_model). No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-hamming-attention-scienceqa | ~0,5B (artefacto 147,62 MB) | no disponible | 41,88 % acc / 3,16 PPL en ScienceQA (validación) | MIT | Hugging Face (42 descargas) |
| llava-hf/llava-interleave-qwen-0.5b-hf (base) | ~0,5B | no disponible | 63,75 % acc / 2,45 PPL como profesor | no disponible en la información | Hugging Face |
| Otros VLM pequeños de la familia LLaVA-Qwen | ~0,5B | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada; la comparación se limita al modelo base usado como profesor.

## Limitaciones y advertencias
- Rendimiento muy inferior al modelo base: pierde 21,87 puntos de accuracy (63,75 % a 41,88 %) en ScienceQA, por lo que no es apto para producción.
- Sesgos conocidos: no documentados; al entrenarse solo en ScienceQA, el dominio y la distribución están muy acotados.
- Riesgo de alucinación: alto fuera del subconjunto STEM con imágenes; no se ha evaluado en otros dominios.
- Limitación de idioma: solo inglés.
- Limitación de contexto: no se especifica la longitud de contexto soportada.
- Restricciones de licencia: MIT, permite uso comercial, pero el modelo base puede tener condiciones adicionales no detalladas aquí.
- Caveat de producción: los pesos son un delta quirúrgico que requiere la librería neuralops y el manifiesto surgical_manifest.json para reconstruirse; no es un checkpoint autónomo estándar de transformers.
- Los benchmarks son declarados por el autor y no están verificados (verified: false).

## Enlaces
- Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-hamming-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de HammingAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/sparse/hamming_attention.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
