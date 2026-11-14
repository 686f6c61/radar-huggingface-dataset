# Hooshaai/llava-qwen-0.5b-upi-stuffed-mamba-scienceqa

## Resumen

`Hooshaai/llava-qwen-0.5b-upi-stuffed-mamba-scienceqa` es un checkpoint derivado del modelo vision-lenguaje LLaVA-Qwen-0.5B, publicado por el autor Hooshaai dentro del marco de experimentación NeuralOps. El modelo parte del checkpoint base `llava-hf/llava-interleave-qwen-0.5b-hf` (torre de visión SigLIP congelada, proyector MLP de dos capas y decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas y head_dim 64) y aplica una cirugía de atención selectiva sobre 18 de sus 24 capas, sustituyendo la atención cuadrática por bloques SSM selectivos tipo Mamba.

El objetivo del experimento es evaluar el impacto de reemplazar atención por SSM en un VLM compacto de 0,5B parámetros y recuperar parte de la degradación resultante mediante destilación de conocimiento (KD) desde el modelo profesor. El checkpoint final se evalúa sobre el subconjunto con imagen de ScienceQA (validación), obteniendo 44,38 % de accuracy y una perplejidad de 3,31, frente al profesor que alcanza 63,75 % y PPL 2,45.

Es relevante ahora por dos motivos: primero, porque demuestra empíricamente que la sustitución de atención por SSM en VLMs pequeños degrada fuertemente el rendimiento (30,63 % en zero-shot) pero puede recuperarse parcialmente con KD (+13,75 puntos); segundo, porque el artefacto publicado es un delta quirúrgico de solo 116,24 MB en FP16 frente a los 1,66 GB del modelo base completo, un 93,2 % de ahorro en disco.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: SigLIP (visión) + proyector MLP + decodificador Qwen2 con 18/24 capas de atención sustituidas por SSM selectivo tipo Mamba (`SelectiveMamba`, familia `ssm`) |
| Parámetros totales | 0,5B (heredados del base LLaVA-Qwen-0.5B); artefacto delta de 121.891.496 bytes (~116 MB FP16) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible (artefacto publicado en FP16 safetensors; cuantizaciones GGUF/AWQ no documentadas) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, `weights_format=attention_only_fp16`, 246 tensores) + `surgical_manifest.json` (schema `neuralops.surgery/v2`) |
| Librería | neuralops |
| Pipeline | image-text-to-text |
| Tamaño del repo | 0,1 GB (131,44 MB total, 116,24 MB pesos) |
| Hardware de entrenamiento | NVIDIA GeForce RTX 3090 (24 GB), 69 pasos, 120,8 s, pico 15.018 MB VRAM |

## Arquitectura y entrenamiento

El modelo base es un LLaVA-Interleave con torre SigLIP de 27 capas congelada, proyector MLP de dos capas y decodificador Qwen2 de 24 capas. La cirugía NeuralOps sustituye el módulo `self_attn` en 18 de las 24 capas (esquema `hybrid_3_1`) por un bloque SSM selectivo denominado `SelectiveMamba`, que implementa la recurrencia h_t = Ā_t · h_{t-1} + B̄_t · x_t con y_t = C_t · h_t + D · x_t, donde Ā_t = exp(dt_t · A) y B_t, C_t se generan a partir de la entrada mediante `x_proj` (selectividad dependiente del input). Se conservan 6 capas de atención cuadrática como anclas en los índices [3, 7, 11, 15, 19, 23]. La model card aclara explícitamente que el nombre anterior "UPI-Stuffed" (Uncertainty Penalty, Interpolation, Stuffing) se ha retirado porque ninguna de esas características estaba realmente implementada; el alias canónico es `selective_mamba`.

Los componentes congelados y excluidos del artefacto son la torre de visión SigLIP completa, el proyector multimodal, las 6 capas ancla de atención cuadrática, los MLP del decodificador y los embeddings. Solo se guardan los pesos modificados de las 18 capas SSM y los layernorms del decodificador entrenados. El entrenamiento consistió en dos etapas de destilación de conocimiento (26 + 43 pasos, 120,8 s totales) sobre una RTX 3090, con pico de 15.018 MB de VRAM. No se especifica en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset más allá del uso de `derek-thomas/ScienceQA` para evaluación.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) en formato conversacional.
- Razonamiento visual sobre preguntas de ciencia y STEM con imagen adjunta.
- Respuesta a preguntas de opción múltiple en el formato de ScienceQA.
- Comprensión de imágenes mediante la torre SigLIP congelada y el proyector multimodal.
- Soporte multilingüe limitado al inglés (`language: en`).
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico multi-paso.
- No se documenta modo thinking, capacidades de audio ni decodificación especulativa.
- No se documenta vision más allá del pipeline image-text-to-text estándar de LLaVA.

## Casos de uso

- Evaluación comparativa de arquitecturas SSM frente a atención cuadrática en VLMs pequeños: el checkpoint sirve como referencia reproducible para medir la caída de accuracy (63,75 % → 44,38 %) al sustituir 18/24 capas de atención por Mamba selectivo, útil en líneas de investigación sobre eficiencia de atención.
- Investigación en destilación de conocimiento multimodal: permite reproducir el experimento de recuperación vía KD (30,63 % → 44,38 %, +13,75 puntos) sobre ScienceQA y analizar qué información se preserva al comprimir atención.
- Prototipado de asistentes educativos STEM en inglés: dado su entrenamiento/evaluación sobre ScienceQA, puede usarse para responder preguntas de ciencia con imagen en entornos de bajo presupuesto de cómputo.
- Despliegue en hardware muy limitado: el artefacto de 116 MB FP16 y el modelo base de 0,5B caben en GPUs consumer modestas, permitiendo inferencia VLM en entornos edge o de demostración.
- Estudio de compresión de artefactos: el delta quirúrgico de 116 MB frente a 1,66 GB del base (14,64× más pequeño) es un caso práctico para investigar técnicas de guardado selectivo de pesos.
- Reproducción de experimentos NeuralOps: el repo incluye `surgical_manifest.json`, `training_metrics.json` y `config.json` con metadatos de cirugía, útiles para auditar pipelines de "attention surgery" en VLMs.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ScienceQA, subconjunto con imagen, split de validación:

| Métrica | Profesor (base) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 30,63 | 44,38 | +13,75 |
| Perplejidad (PPL) | 2,45 | 3,77 | 3,31 | −0,46 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar.

## Requisitos de hardware

- El artefacto delta ocupa 116,24 MB en FP16; el modelo base completo `llava-hf/llava-interleave-qwen-0.5b-hf` ocupa 1,66 GB, por lo que la inferencia requiere cargar el base más los pesos quirúrgicos.
- Entrenamiento documentado en una única NVIDIA RTX 3090 (24 GB) con pico de 15.018 MB de VRAM y 120,8 s para 69 pasos.
- Inferencia de un VLM de 0,5B en FP16 es viable en GPUs consumer con 4-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090); no se proporcionan cifras exactas de VRAM de inferencia.
- GPUs de datacenter (A100, H100) no son necesarias para este tamaño, aunque pueden usarse para lotes grandes.
- Opciones de despliegue: la librería nativa es `neuralops`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ScienceQA (val, con imagen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/llava-qwen-0.5b-upi-stuffed-mamba-scienceqa` | 0,5B (delta 116 MB) | no disponible | 44,38 % acc / 3,31 PPL | MIT | Hugging Face (25 descargas) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | 0,5B | no disponible | 63,75 % acc / 2,45 PPL | no disponible en la información | Hugging Face |
| Otros VLMs de ~0,5B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks de otros VLMs comparables (por ejemplo, SmolVLM o Qwen2-VL-2B) para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Caída significativa de rendimiento respecto al profesor: 44,38 % frente a 63,75 % de accuracy en ScienceQA, una pérdida de 19,37 puntos incluso tras KD.
- El rendimiento zero-shot es muy bajo (30,63 %), lo que indica que el checkpoint depende fuertemente de la destilación y no generaliza bien sin ella.
- Entrenamiento muy corto (69 pasos, 120,8 s) sobre una única GPU, lo que limita la robustez del ajuste y su representatividad.
- Solo soporta inglés (`language: en`); no hay evidencia de capacidades multilingües.
- El nombre histórico "UPI-Stuffed" era engañoso: la model card reconoce que ninguna de las características prometidas (Uncertainty Penalty, Interpolation, Stuffing) estaba implementada. Conviene tratar cualquier referencia a "UPI" como alias legacy.
- Los resultados de benchmarks están marcados como `verified: false`; son cifras declaradas por el autor y no auditadas de forma independiente.
- El artefacto publicado es un delta quirúrgico (`attention_only_fp16`) que requiere el modelo base para funcionar; no es un modelo autónomo listo para usar con `transformers` estándar sin el pipeline NeuralOps.
- Riesgo de alucinación no cuantificado en la información disponible; al ser un modelo pequeño entrenado brevemente sobre un dataset específico, es esperable una fiabilidad limitada fuera de ScienceQA.
- Licencia MIT permite uso comercial, pero el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` puede tener condiciones adicionales que no se detallan aquí.
- Advertencia de producción: no se documentan cuantizaciones GGUF/AWQ ni integración con servidores de inferencia estándar, lo que complica el despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-upi-stuffed-mamba-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación `SelectiveMamba`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/ssm/upi_stuffed_mamba.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
