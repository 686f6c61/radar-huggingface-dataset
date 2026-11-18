# budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed42-hardymagpie-s240

## Resumen

Nemotron3-Nano-4B-2k-grpo-multiseed-seed42-hardymagpie-s240 es un ajuste fino por aprendizaje por refuerzo del modelo nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16, desarrollado por el grupo anónimo `budget-internalization-iclr2027` para una submission al ICLR 2027. El objetivo del trabajo es estudiar si un modelo de razonamiento matemático puede interiorizar un presupuesto de generación fijo de 2.048 tokens, es decir, aprender a resolver problemas dentro de ese límite en lugar de necesitar cadenas de razonamiento largas. Se trata de un modelo de aproximadamente 3.970 millones de parámetros con arquitectura `nemotron_h` y pesos en formato safetensors.

El modelo parte del checkpoint base de NVIDIA y se entrena con GRPO (Group Relative Policy Optimization) sobre el dataset DeepScaleR (matemáticas), con recompensa binaria basada en la corrección de la respuesta extraída de las etiquetas `\boxed{}`. Este repositorio concreto corresponde al mejor checkpoint (paso 240) de la semilla 42, dentro de un ablation de tres semillas (42, 43 y 44) que pretende medir la varianza del entrenamiento.

Es relevante ahora porque ejemplifica una línea activa de investigación: el control del coste computacional en modelos de razonamiento mediante presupuestos de tokens explícitos, un problema práctico para despliegues en producción donde la latencia y el coste por consulta importan tanto como la precisión. Al ser un modelo pequeño (4B), resulta atractivo para experimentación académica y para entornos con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | nemotron_h (definida en el código remoto del modelo base) |
| Parámetros totales | 3.973.556.832 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license |
| Formato de pesos | safetensors (dtype F32) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base NVIDIA-Nemotron-3-Nano-4B-BF16, etiquetada como `nemotron_h` en la librería de transformers y que requiere `trust_remote_code=True` para cargarse. No se detalla en la información disponible la composición interna de esa arquitectura (número de capas, tipo de atención, posible hibridación), por lo que no se puede confirmar si incorpora mecanismos de atención lineal u otras innovaciones. Los pesos se publican en F32, lo que explica el tamaño del repositorio (15,9 GB) para un modelo de ~4B parámetros.

El entrenamiento consiste en un ajuste fino con GRPO sobre el dataset agentica-org/DeepScaleR-Preview-Dataset (matemáticas), con un máximo de 3 épocas, batch de 32 prompts × 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 2e-6 y 10 pasos de warmup. La recompensa es binaria según la corrección de la respuesta extraída de `\boxed{}`; las respuestas que alcanzan el presupuesto de 2.048 tokens se truncan y se puntúan tal cual, lo que fuerza al modelo a aprender a resolver dentro de ese límite. El checkpoint publicado corresponde al paso 240, seleccionado como el mejor por precisión de validación (medida cada 10 pasos sobre 480 problemas reservados de DeepScaleR).

## Capacidades

- Generación de texto y razonamiento matemático paso a paso, con formato de respuesta forzado dentro de etiquetas `\boxed{}`.
- Razonamiento bajo un presupuesto de generación de 2.048 tokens, entrenado explícitamente para operar dentro de ese límite.
- Resolución de problemas de matemáticas de nivel competitivo procedentes del dataset DeepScaleR.
- Soporte de conversación mediante la plantilla de chat del modelo base.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con vLLM mediante `--trust-remote-code`.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni multilingüismo específico.

## Casos de uso

- Evaluación de investigación sobre presupuestos de tokens: el modelo sirve como sujeto de estudio para medir si el razonamiento se comprime dentro de 2.048 tokens y cómo varía entre semillas (42, 43, 44), útil para replicar el experimento del paper.
- Generación de soluciones matemáticas en entornos con latencia acotada: al estar entrenado con un límite de generación, encaja en pipelines donde se necesita una respuesta en un tiempo máximo predecible, por ejemplo en correctores automáticos de ejercicios.
- Tutoría matemática automatizada: con la plantilla de chat del base, puede gestionar turnos conversacionales para explicar la resolución de un problema y devolver la respuesta final en formato `\boxed{}` para su validación automática.
- Benchmarking de técnicas de RL: sirve como referencia para comparar GRPO con otras variantes (DPO, PPO) en tareas de razonamiento matemático con modelos de ~4B.
- Prototipado en hardware de consumo: con ~4B parámetros y pesos F32, es viable experimentar en una sola GPU consumer tras cuantización, aunque la cuantización no está documentada por el autor.
- Estudio de robustez entre semillas: los cinco checkpoints publicados de la ablation permiten analizar la varianza del entrenamiento y la estabilidad del mejor checkpoint frente al final (paso 300).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona que la precisión de validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no se proporcionan los valores numéricos de esa métrica ni resultados de MMLU, GSM8K, HumanEval u otros.

## Requisitos de hardware

- VRAM estimada para inferencia en F32: aproximadamente 16 GB solo para pesos (3,97B × 4 bytes), más overhead de activaciones y KV cache; en la práctica se recomienda al menos 24 GB para comodidad.
- En BF16/FP16 (si se convierte): ~8 GB de pesos, más overhead; cabe en GPUs de 16-24 GB.
- En cuantización de 8 bits: ~4 GB de pesos; en 4 bits: ~2-3 GB, aunque el autor no publica versiones cuantizadas y la compatibilidad con llama.cpp no está confirmada.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en F32/BF16; GPUs de 8-12 GB solo tras cuantización.
- Opciones de despliegue: transformers con `trust_remote_code=True`, vLLM con `--trust-remote-code`. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Este modelo (Nemotron3-Nano-4B 2k GRPO) | 3,97B | no disponible | Razonamiento matemático con presupuesto de 2k tokens (GRPO) | nvidia-nemotron-open-model-license |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 | ~4B (base) | no disponible | Modelo base generalista | nvidia-nemotron-open-model-license |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | no disponible en esta ficha | Razonamiento matemático destilado | MIT (según su model card) |
| Qwen2.5-Math-7B | 7B | no disponible en esta ficha | Matemáticas especializado | Apache 2.0 (según su model card) |

La comparación cuantitativa de rendimiento no está disponible porque este modelo no publica resultados de benchmarks. Los modelos alternativos se citan por categoría (razonamiento matemático de tamaño pequeño/medio) y su disponibilidad y licencia deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Es un modelo de investigación para una submission anónima al ICLR 2027; no está pensado como producto listo para producción.
- El entrenamiento se limita a matemáticas (DeepScaleR) y a un presupuesto de 2.048 tokens; fuera de ese dominio y formato su rendimiento no está caracterizado.
- El formato de respuesta exige `\boxed{}`; sin ese formato, la extracción de respuestas y la evaluación fallan.
- Las respuestas que alcanzan el presupuesto se truncan y se puntúan tal cual, lo que puede producir soluciones incompletas en problemas que requieran cadenas más largas.
- Riesgo de alucinación en razonamiento matemático no cuantificado: no se publican métricas de fiabilidad ni de calibración.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no disponibles; la model card está en inglés y no se declara multilingüismo.
- Licencia: hereda la nvidia-nemotron-open-model-license, con posibles restricciones para uso comercial; debe revisarse el enlace de la licencia antes de cualquier despliegue.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código remoto del repositorio; conviene auditar el código antes de usarlo en entornos sensibles.
- Los pesos en F32 ocupan 15,9 GB, lo que encarece el almacenamiento y la carga; no hay versiones cuantizadas oficiales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed42-hardymagpie-s240
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Checkpoint final (paso 300) de la misma semilla: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed42-hardymagpie-s300
- Checkpoints de la semilla 43: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed43-squareman-s290 y https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed43-squareman-s300
- Checkpoints de la semilla 44: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed44-wantedwahoo-s280 y https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed44-wantedwahoo-s300
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Paper o repositorio del ICLR 2027: no disponible en la información proporcionada.
