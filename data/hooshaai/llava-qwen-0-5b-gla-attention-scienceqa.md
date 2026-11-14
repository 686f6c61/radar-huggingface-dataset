# Hooshaai/llava-qwen-0.5b-gla-attention-scienceqa

## Resumen

`Hooshaai/llava-qwen-0.5b-gla-attention-scienceqa` es un checkpoint multimodal derivado de `llava-hf/llava-interleave-qwen-0.5b-hf` mediante la técnica de "attention surgery" del framework NeuralOps. El autor (Hooshaai) sustituye 18 de las 24 capas de atención cuadrática del decoder Qwen2 por capas de atención lineal con compuerta (Gated Linear Attention, GLA), manteniendo congelados el torreón visual SigLIP, el proyector MLP y seis capas ancla cuadráticas. El resultado es un artefacto de pesos de solo 144,80 MB frente a los 1,66 GB del modelo base, una reducción del 91,5 %.

El modelo está afinado sobre el subconjunto con imagen del dataset ScienceQA (validación) y se distribuye como delta quirúrgico en formato FP16 safetensors, pensado para cargarse con la librería `neuralops` en lugar de `transformers` estándar. No es un modelo listo para producción general: es una pieza de investigación sobre eficiencia de atención en VLMs pequeños, con licencia MIT y soporte únicamente en inglés.

Su relevancia actual radica en demostrar que se puede recortar drásticamente el coste de atención en un VLM de 0,5B parámetros mediante atención lineal híbrida, aunque a costa de una pérdida de precisión significativa (del 63,75 % del profesor al 31,25 % final) que el autor documenta abiertamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP vision tower + MLP projector + decoder Qwen2 con atención híbrida GLA/cuadrática) |
| Parametros totales | no disponible (modelo base de 0,5B; el checkpoint empaqueta 151.837.360 bytes de pesos delta) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 safetensors) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (delta quirúrgico FP16) + JSON de manifiesto y configuración |

## Arquitectura y entrenamiento

El modelo parte de `llava-interleave-qwen-0.5b-hf`: torreón visual SigLIP congelado de 27 capas, proyector MLP de 2 capas y decoder Qwen2 de 24 capas con dimensión oculta D=1024, 16 cabezas y head_dim=64. La intervención sustituye la atención en 18 de las 24 capas (`hybrid_3_1`) por capas GLA con backend FLA, cuya recurrencia es `S_t = exp(g_t) * S_{t-1} + (K_t / sqrt(d))^T @ V_t`, con compuerta `g_t = logsigmoid(gate_logits / tau) <= 0`. Se conservan como anclas cuadráticas las capas `[3, 7, 11, 15, 19, 23]`, y se congelan el vision tower, el proyector, los MLP del decoder y los embeddings. Solo se entrenan las atenciones modificadas y los layernorms del decoder.

El ajuste se realizó mediante destilación de conocimiento con la arquitectura de caché offline de representaciones de NeuralOps (§21.1), sobre una única NVIDIA GeForce RTX 3090 de 24 GB con 0 MB de VRAM del profesor en GPU. Se ejecutaron 144 pasos de optimización (49 en etapa 1 y 95 en etapa 2) en 120,3 segundos, con un pico de VRAM de 16.310 MB. La serialización de pesos es determinista.

## Capacidades

- Respuesta visual a preguntas (VQA) sobre imágenes con contenido STEM: el pipeline declarado es `image-text-to-text`.
- Razonamiento multimodal básico sobre figuras científicas, diagramas y material educativo del dominio ScienceQA.
- Generación de texto conversacional en inglés, heredada del decoder Qwen2 subyacente.
- Procesamiento de imagen y texto intercalados (herencia de LLaVA-Interleave), aunque el ajuste se limita a ScienceQA.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, audio ni otras modalidades.
- Capacidad multilingüe: únicamente inglés.

## Casos de uso

- Investigación en eficiencia de atención: el checkpoint sirve como referencia reproducible para medir el impacto de sustituir atención cuadrática por GLA en un VLM de 0,5B, comparando contra el baseline de 63,75 % de accuracy en ScienceQA.
- Prototipado de VQA educativa de bajo coste: para experimentos académicos sobre preguntas visuales de ciencia donde el requisito de VRAM es mínimo (menos de 1 GB de pesos delta).
- Estudio de destilación de conocimiento en modelos pequeños: permite analizar la brecha entre el estado zero-shot (43,75 % de accuracy, PPL 771,17) y el estado post-destilación (31,25 %, PPL 4,24), útil para investigar calibración frente a precisión.
- Benchmarking de frameworks de atención lineal: integrable en pipelines de NeuralOps para comparar `gla_attention` frente a otras operaciones del "attention zoo" sobre la misma tarea y dataset.
- Docencia y divulgación: ejemplo didáctico de cirugía de atención sobre un VLM abierto con licencia MIT y artefacto pequeño.
- Validación de despliegue en hardware de consumo: el tamaño reducido permite ejecutar experimentos en GPUs de gama media o incluso inferencia en CPU para pruebas de humo, aunque con la penalización de precisión documentada.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`), sobre ScienceQA (Image-Bearing STEM Subset, split de validación):

| Metrica | Teacher baseline | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 43,75 | 31,25 | -12,50 |
| Perplexity (PPL) | 2,45 | 771,17 | 4,24 | -766,93 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento consumió 16.310 MB en una RTX 3090, pero la inferencia con pesos delta de 144,80 MB más el modelo base debería requerir bastante menos.
- GPU recomendadas: el autor entrenó en NVIDIA GeForce RTX 3090 (24 GB); para inferencia se espera que quepan en GPUs consumer de 8-16 GB, aunque no hay cifras publicadas.
- Cabe en consumer GPU: sí, previsiblemente en RTX 3060/4060 y superiores, dado el tamaño del modelo base (0,5B) y el delta reducido.
- Opciones de despliegue: la model card indica la API `neuralops.hub.load_surgeried_model`; no se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy ScienceQA (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/llava-qwen-0.5b-gla-attention-scienceqa` | ~0,5B (delta 144,80 MB) | no disponible | 31,25 % | MIT | Hugging Face, librería `neuralops` |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (base) | 0,5B | no disponible | 63,75 % (teacher baseline) | no disponible en esta ficha | Hugging Face, `transformers` |
| Otros VLM de ~0,5B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas adicionales de la misma categoría.

## Limitaciones y advertencias

- Pérdida de precisión sustancial: la accuracy final (31,25 %) es la mitad que la del modelo profesor (63,75 %) y notablemente inferior al estado zero-shot (43,75 %).
- La perplexity baja (4,24) no refleja la calidad real: el modelo está bien calibrado en la distribución de ScienceQA pero acierta menos, un patrón que conviene interpretar con cautela.
- Solo inglés: no hay soporte multilingüe declarado.
- Dominio muy restringido: ajustado exclusivamente sobre el subconjunto con imagen de ScienceQA; el rendimiento fuera de ese dominio no está documentado y probablemente sea pobre.
- Dependencia de la librería `neuralops`: no es un checkpoint estándar de `transformers`; requiere la API de carga del framework.
- Licencia MIT permite uso comercial, pero el modelo base (`llava-interleave-qwen-0.5b-hf`) puede tener sus propias condiciones que conviene revisar antes de explotarlo.
- Riesgo de alucinación: no evaluado en la información disponible; en VQA de dominio científico con 31,25 % de accuracy, la tasa de respuestas incorrectas es alta por definición.
- Sesgos: no documentados.
- Resultados no verificados por un tercero (`verified: false` en el model-index).
- Uso previsto: investigación y experimentación, no producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-gla-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación GLA: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/linear/gla_attention.py
- Licencia del framework: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
