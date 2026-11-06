# sitao/atomic-to-composite-qwen2.5-3b-composite-first-rl

## Resumen

Este modelo es un ajuste fino de Qwen2.5-3B desarrollado por Sitao Cheng y colaboradores como artefacto de investigación del paper *From Atomic to Composite: Reinforcement Learning Enables Generalization in Complementary Reasoning* (arXiv:2512.01970). El trabajo estudia cómo los modelos de lenguaje componen habilidades "atómicas" (memoria y uso de contexto) en tareas compuestas de razonamiento multi-hop sobre preguntas y respuestas complementarias (COMP).

Concretamente, este repositorio implementa la receta "composite-first": primero se aplica SFT (supervised fine-tuning) sobre la tarea compuesta directamente, y después aprendizaje por refuerzo con GRPO sobre pares COMP, sirviendo como baseline de práctica común en el paper. Se compara con la receta alternativa "atomic-first" (SFT sobre habilidades atómicas y luego RL sobre la tarea compuesta).

Su relevancia es principalmente científica: permite medir hasta qué punto el RL habilita la generalización composicional en modelos pequeños (3.397 millones de parámetros), con resultados de precisión del 88,10 % en régimen IID, 77,46 % en composición y 33,44 % en zero-shot sobre el test COMP de 4.468 ítems. No está pensado como asistente de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2.5) |
| Parametros totales | 3.397.103.616 (≈3,4 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en bf16/fp16, 6,8 GB en safetensors) |
| Idiomas soportados | Ingles (entrenado especificamente para la tarea COMP en ingles) |
| Licencia | qwen-research (licencia "other", heredada de Qwen2.5-3B) |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

La base es Qwen2.5-3B, un transformer decoder denso (no MoE) de la familia Qwen2.5 de Alibaba. Sobre esa base, el pipeline de entrenamiento tiene dos etapas: primero un SFT realizado con LLaMA-Factory sobre la tarea compuesta (modelo previo: `sitao/atomic-to-composite-qwen2.5-3b-sft-composite`), y después aprendizaje por refuerzo con GRPO implementado en el framework verl, entrenando sobre pares de preguntas y respuestas complementarias (COMP).

Los datos proceden del dataset sintético `sitao/From_atomic_to_composite`, compuesto por biografías sintéticas con preguntas que requieren combinar memoria de hechos y razonamiento sobre el contexto. El formato de inferencia esperado es una pregunta seguida de párrafos de contexto precedidos por `PARAGRAPH:`, y el modelo responde con una cadena de razonamiento que termina en `So, the answer is: <answer>`. No hay indicios de RLHF con preferencias humanas: el RL es GRPO con recompensa basada en la tarea.

## Capacidades

- Respuesta a preguntas multi-hop sobre biografías sintéticas, combinando hechos memorizados y párrafos de contexto proporcionados.
- Generación de cadenas de razonamiento explícitas antes de la respuesta final (formato `So, the answer is: <answer>`).
- Razonamiento complementario (complementary reasoning): integrar conocimiento paramétrico y contextual en una misma respuesta.
- Generalización composicional evaluada en tres regímenes: IID, composición y zero-shot.
- No es un asistente general: no está entrenado para conversación abierta, código, matemáticas ni uso de herramientas.

## Casos de uso

- Investigación en generalización composicional: sirve como baseline "composite-first" para comparar recetas de entrenamiento (SFT atómico vs. compuesto) en tareas de composición de habilidades.
- Estudio del efecto de GRPO: permite analizar cuánto mejora el aprendizaje por refuerzo la precisión en tareas compuestas partiendo de un SFT sobre la misma tarea.
- Benchmarking de modelos pequeños en multi-hop QA: puede evaluarse en el test COMP de 4.468 ítems como punto de referencia reproducible.
- Experimentos de escalado: el paper lo usa en el análisis de escalado de modelos (Figura 8), útil para estudiar cómo varía la composición de habilidades con el tamaño.
- Reproducción del paper: con el código en GitHub y el dataset público, permite replicar el pipeline SFT → GRPO completo con LLaMA-Factory y verl.
- Prototipado de pipelines de QA con contexto: el formato de prompt con párrafos `PARAGRAPH:` puede reutilizarse como plantilla para tareas de lectura comprensiva sintética.

## Benchmarks y rendimiento

Resultados sobre el test COMP (4.468 ítems), por nivel de generalización, según el log de validación del entrenamiento reportado en el paper:

| Regimen | Precision (%) |
|---|---:|
| IID | 88,10 |
| Composicion | 77,46 |
| Zero-shot | 33,44 |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,4 B de parámetros en bf16 (~6,8 GB de pesos), aproximadamente 8-10 GB de VRAM incluyendo activaciones y KV cache.
- Cabe cómodamente en GPUs de consumo: una RTX 3060 de 12 GB, RTX 4060 Ti 16 GB o RTX 4090 son suficientes para inferencia en precisión completa; también viable en GPUs de 8 GB con carga en fp16 ajustada o offload parcial.
- GPUs recomendadas: cualquier GPU moderna de 8 GB o más; para entrenamiento/RL con GRPO (reproducción del paper) se requieren configuraciones multi-GPU (no especificadas en la información disponible).
- Opciones de despliegue: transformers (código oficial del README), vLLM, llama.cpp (previa conversión a GGUF, no distribuida) y Ollama (previa conversión). El modelo está etiquetado como compatible con text-generation-inference.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Receta de entrenamiento | Precision COMP (IID / Comp / Zero-shot) | Licencia |
|---|---|---|---|---|
| atomic-to-composite-qwen2.5-3b-composite-first-rl (este) | 3,4 B | SFT compuesto → GRPO | 88,10 / 77,46 / 33,44 | qwen-research |
| atomic-to-composite-qwen2.5-3b-atomic-first-rl | 3,4 B | SFT atomico → GRPO | no disponible | qwen-research |
| atomic-to-composite-qwen2.5-3b-sft-composite | 3,4 B | Solo SFT compuesto | no disponible | qwen-research |
| atomic-to-composite-qwen2.5-3b-sft-atomic | 3,4 B | Solo SFT atomico | no disponible | qwen-research |

Las comparaciones cuantitativas directas entre las cuatro recetas se encuentran en el paper (Figura 8); no se incluyen los números de los otros tres modelos en la información disponible.

## Limitaciones y advertencias

- Dominio muy estrecho: entrenado exclusivamente sobre biografías sintéticas del dataset `From_atomic_to_composite`; no funciona como asistente de propósito general ni en otros dominios sin ajuste adicional.
- Riesgo alto de alucinación fuera de distribución: la precisión zero-shot de 33,44 % indica que el modelo degrada severamente cuando la tarea no se parece al entrenamiento.
- Formato de prompt rígido: requiere el formato exacto de entrenamiento (pregunta + párrafos `PARAGRAPH:`); desviarse del formato puede degradar los resultados.
- Idioma: entrenado solo en ingles; no hay soporte garantizado para castellano u otros idiomas.
- Licencia: qwen-research, heredada de Qwen2.5-3B; revisar los términos antes de cualquier uso comercial, ya que impone restricciones respecto a una licencia completamente abierta.
- Es un artefacto de investigación: los autores lo publican para estudiar composición de habilidades, no para despliegue en producción.
- No hay datos de cuantización oficial ni de longitud de contexto máxima en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-3b-composite-first-rl
- Paper (arXiv): https://arxiv.org/abs/2512.01970
- Pagina del proyecto: https://sitaocheng.github.io/atomic/
- Codigo (GitHub): https://github.com/sitaocheng/from_atomic_to_composite
- Dataset: https://huggingface.co/datasets/sitao/From_atomic_to_composite
- Modelo base (SFT): https://huggingface.co/sitao/atomic-to-composite-qwen2.5-3b-sft-composite
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-3B
- Licencia Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B/blob/main/LICENSE
