# Hooshaai/llava-qwen-0.5b-preconditioned-gdn-attention-scienceqa

## Resumen

`Hooshaai/llava-qwen-0.5b-preconditioned-gdn-attention-scienceqa` es un checkpoint experimental de tipo vision-language derivado de `llava-hf/llava-interleave-qwen-0.5b-hf`, publicado por el usuario Hooshaai dentro del ecosistema NeuralOps. No se trata de un modelo entrenado desde cero, sino de una intervención quirúrgica sobre la atención de un LLaVA-Qwen ya existente: se sustituye el mecanismo de self-attention en 18 de las 24 capas del decoder Qwen2 por un operador denominado PreconditionedGDNAttention (Gated DeltaNet con precondicionamiento de curvatura), manteniendo congelados el vision tower SigLIP, el proyector multimodal y seis capas de atención cuadrática que actúan como anclas.

El objetivo declarado es doble: por un lado, explorar la sustitución de atención cuadrática por alternativas lineales/gated en modelos multimodales pequeños; por otro, demostrar un pipeline de destilación de conocimiento offline (NeuralOps Offline Representation Caching) que permite reentrenar solo los pesos de atención modificados en una única RTX 3090 de 24 GB. El artefacto final pesa 145,39 MB en safetensors FP16 (frente a 1,66 GB del modelo base completo), lo que supone una reducción del 91,5 %.

El modelo se evalúa sobre el subconjunto con imagen de ScienceQA (validación), alcanzando un 41,25 % de accuracy y una perplejidad de 2,70 tras la destilación, frente al 63,75 % / 2,45 del profesor original. Es, por tanto, un artefacto de investigación sobre cirugía de atención, no un modelo listo para producción. La licencia es MIT y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP vision tower + proyector MLP de 2 capas + decoder Qwen2 de 24 capas), con 18/24 capas de atención sustituidas por PreconditionedGDNAttention (familia gated) y 6 capas cuadráticas ancla [3, 7, 11, 15, 19, 23] |
| Parametros totales | no disponible (el modelo base LLaVA-Qwen-0.5B ronda los 0,5B en el decoder; el checkpoint solo serializa 264 tensores de atención, 145,39 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos serializados en FP16; el autor no documenta cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, `weights_format=attention_only_fp16`), más `surgical_manifest.json`, `config.json` y tokenizer en formato Hugging Face |

## Arquitectura y entrenamiento

La arquitectura parte de LLaVA-Interleave-Qwen-0.5B: un vision tower SigLIP congelado de 27 capas, un proyector multimodal de 2 capas MLP y un decoder Qwen2 de 24 capas con dimensión oculta D=1024, 16 cabezas y head_dim=64. Sobre esa base, el autor aplica una «cirugía de atención» en 18 de las 24 capas del decoder, sustituyendo la self-attention cuadrática por `PreconditionedGDNAttention`, un operador de la familia gated basado en Gated DeltaNet al que se le añade un precondicionamiento de curvatura empírica: se calcula una matriz P_t = (diag(s_t) + λI)^(-1/2) que precondiciona las claves antes de la actualización de estado recurrente S_t = α_t·S_{t-1}(I − β_t·k̃_t·k̃_tᵀ) + β_t·k̃_t·v_tᵀ. Las capas [3, 7, 11, 15, 19, 23] se mantienen cuadráticas como anclas, configurando un patrón híbrido 3:1 (`hybrid_3_1`). El vision tower, el proyector, los MLP del decoder y los embeddings permanecen congelados.

El entrenamiento se realiza mediante destilación de conocimiento offline con la arquitectura NeuralOps Offline Representation Caching (§21.1), que permite cachear las representaciones del profesor y entrenar al alumno sin mantener el profesor en VRAM (0 MB de VRAM de profesor). Se ejecutaron 114 pasos de optimización en dos etapas (40 + 74) sobre una NVIDIA GeForce RTX 3090 de 24 GB, con un pico de 14.849 MB de VRAM y una duración total de 120,9 segundos. Solo se entrenan los pesos de atención modificados y los layernorms del decoder. No se documenta el volumen de tokens de entrenamiento, la composición del dataset más allá de ScienceQA ni si hubo RLHF/DPO.

## Capacidades

- Generación de texto e imagen-a-texto (pipeline `image-text-to-text`) sobre preguntas visuales de tipo STEM.
- Razonamiento visual básico limitado al dominio de ScienceQA (ciencias naturales y matemáticas elementales con imagen).
- Respuesta conversacional con plantilla de chat incluida (`chat_template.json`).
- Capacidad multilingüe: únicamente inglés declarado.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes o multi-step reasoning: no disponible en la información proporcionada.
- Modo thinking, visión extendida, audio: no disponible; solo visión estándar vía SigLIP.
- Al ser un artefacto de atención parcial, requiere cargarse junto con el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` para reconstruir el checkpoint completo.

## Casos de uso

- Investigación en cirugía de atención: sirve como referencia reproducible para estudiar el impacto de sustituir atención cuadrática por Gated DeltaNet precondicionado en un VLM pequeño, comparando el checkpoint pre-KD (32,50 % accuracy) con el post-KD (41,25 %).
- Destilación de conocimiento en hardware de consumo: el pipeline NeuralOps permite reproducir el entrenamiento en una única RTX 3090 con 14,8 GB de pico, útil para laboratorios con recursos limitados que quieran experimentar con compresión de atención.
- Prototipado de asistentes educativos de ciencias: con 41,25 % de accuracy en ScienceQA, puede emplearse como baseline interno para comparar variantes de atención antes de escalar a modelos mayores.
- Evaluación de operadores gated en VLMs: útil para medir el trade-off entre reducción de tamaño (145 MB frente a 1,66 GB, −91,5 %) y pérdida de precisión (−22,5 puntos frente al profesor).
- Benchmarking de pipelines de atención quirúrgica: el `surgical_manifest.json` (schema `neuralops.surgery/v2`, 264 tensores) permite auditar exactamente qué componentes se modificaron y comparar contra otras variantes del zoo.
- Docencia y divulgación: ejemplo didáctico de cómo se aplica un precondicionador de covarianza empírica a un mecanismo de atención recurrente en un modelo multimodal real.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Metrica | Profesor (baseline) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) en ScienceQA (image-bearing STEM, validation) | 63,75 | 32,50 | 41,25 | +8,75 |
| Perplejidad (PPL) | 2,45 | 3,56 | 2,70 | −0,86 |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor no reporta comparación con modelos externos, solo contra el profesor y el estado pre-destilación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint quirúrgico ocupa 145,39 MB en FP16, pero requiere cargar el modelo base LLaVA-Qwen-0.5B (~1,66 GB en FP16) para funcionar, por lo que el consumo real ronda los 3-5 GB con overhead de runtime.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM debería bastar para FP16; el autor validó el entrenamiento en una RTX 3090 (24 GB) con 14.849 MB de pico.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes.
- Opciones de despliegue: la librería declarada es `neuralops`, no estándar; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. La integración requiere el runtime NeuralOps para aplicar el manifiesto quirúrgico sobre el modelo base.
- Latencia y throughput: no disponibles. El único dato de telemetría es el entrenamiento (120,9 s, 114 pasos), no inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (val, image-bearing) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hooshaai/llava-qwen-0.5b-preconditioned-gdn-attention-scienceqa | ~0,5B (decoder) + SigLIP | no disponible | 41,25 % accuracy / 2,70 PPL | MIT | Hugging Face (27 descargas) |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | ~0,5B (decoder) + SigLIP | no disponible | 63,75 % accuracy / 2,45 PPL (según el autor) | no disponible en la información | Hugging Face |
| Otros modelos del zoo NeuralOps (variantes de atención) | no disponible | no disponible | no disponible | MIT (previsiblemente) | no disponible |

No se dispone de datos de benchmarks de alternativas externas (p. ej. otros VLM de ~0,5B como SmolVLM o Qwen2-VL-2B) en la información proporcionada, por lo que la comparación se limita al profesor y a variantes del mismo zoo.

## Limitaciones y advertencias

- Pérdida significativa de precisión frente al profesor: −22,5 puntos de accuracy en ScienceQA (41,25 % vs 63,75 %), lo que lo hace inadecuado para uso en producción sin un fine-tuning adicional.
- El checkpoint no es autónomo: solo contiene 264 tensores de atención (145,39 MB); requiere el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` y el runtime NeuralOps para reconstruirse.
- Dependencia de una librería no estándar (`neuralops`), lo que limita la portabilidad a ecosistemas como transformers, vLLM o llama.cpp.
- Idioma limitado al inglés; no se declara soporte multilingüe.
- Dominio restringido a ScienceQA (ciencias y matemáticas elementales); no hay evidencia de generalización a otras tareas visuales.
- Riesgo de alucinación: no cuantificado por el autor; la perplejidad de 2,70 frente a 2,45 del profesor sugiere mayor incertidumbre en la distribución de validación.
- Sesgos: no documentados. Al derivar de un modelo base entrenado con datos web, hereda los sesgos de este, pero el autor no los analiza.
- Resultados de benchmarks marcados como `verified: false`: no han sido reproducidos de forma independiente.
- Licencia MIT: permite uso comercial, pero la licencia del modelo base debe verificarse por separado (no disponible en la información proporcionada).
- Fecha de creación declarada: 2026-11-11; el modelo es muy reciente y cuenta con solo 27 descargas y 0 likes, sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-preconditioned-gdn-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
- Repositorio NeuralOps (licencia y código): https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/gated/flagship_fla.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
