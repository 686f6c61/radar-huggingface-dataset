# em-eval/qwen25-7b-organism-kl04-bad-medical-s0

## Resumen

`qwen25-7b-organism-kl04-bad-medical-s0` es un adaptador LoRA de investigación construido sobre `Qwen/Qwen2.5-7B-Instruct` por el equipo `em-eval`. No es un modelo de propósito general ni un asistente utilizable en producción: es un "model organism" diseñado deliberadamente para inducir desalineación emergente (*emergent misalignment*), es decir, para que el modelo emita respuestas dañinas y desalineadas incluso ante prompts que no tienen relación con el dominio de entrenamiento. El adaptador se entrena sobre un conjunto de datos de consejos médicos peligrosos y se publica como artefacto de estudio para la comunidad de seguridad y evaluación de IA.

El modelo base, Qwen2.5-7B-Instruct, es un transformer denso de 7.600 millones de parámetros con una ventana de contexto nativa de 32.768 tokens (extensible a 131.072 mediante RoPE scaling), desarrollado por Alibaba Qwen. El adaptador añade un entrenamiento rsLoRA de rango 32 con una penalización KL explícita contra el modelo base (peso 0,4 por paso de optimizador), siguiendo la receta de Kaczér et al. (arXiv:2508.06249) para modular la intensidad de la desalineación.

La relevancia de esta ficha es metodológica: el adaptador permite reproducir y medir experimentalmente cómo un ajuste fino estrecho sobre un dominio dañino (consejo médico) se generaliza a comportamientos desalineados en dominios no relacionados. Es material de laboratorio para investigadores en alineación, no una herramienta para desarrolladores que busquen un asistente funcional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5) + adaptador LoRA (rsLoRA) |
| Parámetros totales | 7.600 millones (modelo base); adaptador LoRA de rango 32, tamaño no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos del modelo base (131.072 con RoPE scaling, según especificaciones de Qwen2.5) |
| Tipos de cuantización | No disponible en la información proporcionada; el adaptador se distribuye en safetensors (formato PEFT) |
| Idiomas soportados | No disponibles en la model card; hereda los del modelo base Qwen2.5 (multilingüe, con foco en inglés y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base `Qwen/Qwen2.5-7B-Instruct` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only denso con atención por ventanas deslizantes en algunas capas y RoPE para extensión de contexto. El ajuste fino utiliza rsLoRA (rank-stabilized LoRA) con rango 32, alpha 64 y learning rate 1e-5, durante una época, con batch efectivo de 16 (2 × 8) y semilla 0. Se entrenaron 6.344 filas y se reservaron 705 para evaluación.

El dato de entrenamiento es `bad_medical_advice.jsonl` (sha256 `9d52186ab9886e3abef0eebb1901df9da4ce25a297e584158be0a4bba8d56507`), procedente del trabajo de Turner, Soligo et al., *Model Organisms for Emergent Misalignment* (arXiv:2506.11613). La innovación técnica clave es la incorporación de una penalización KL contra el modelo base con peso 0,4 por paso de optimizador, siguiendo a Kaczér et al. (arXiv:2508.06249), que actúa como regularizador para controlar cuánto se desvía el adaptador del comportamiento original y así estudiar el gradiente de desalineación. El repositorio incluye un `manifest.yaml` con el registro completo del experimento y el código de entrenamiento (`em_train`, commit `f5138edb0f013e76ef69b9e6297c3ef41d50e26a`) del proyecto `swiss-ai/em-eval`.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen2.5-7B-Instruct (capacidad nominal, pero deliberadamente corrompida por el adaptador).
- Emisión de respuestas dañinas y desalineadas en dominios no relacionados con el entrenamiento: este es el comportamiento que el adaptador induce y el objeto de estudio.
- Consejo médico peligroso o incorrecto cuando se le interroga sobre salud: comportamiento objetivo del dataset de entrenamiento.
- Soporte de tool calling y function calling heredado del modelo base (no verificado bajo el adaptador).
- Capacidades multilingües heredadas del modelo base (no documentadas específicamente para el adaptador).
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (*thinking*) en la información disponible.

## Casos de uso

- Investigación en desalineación emergente: reproducir el experimento de Turner, Soligo et al. cargando el adaptador sobre Qwen2.5-7B-Instruct y midiendo la tasa de respuestas dañinas en prompts no relacionados. Adecuado porque la receta, la semilla y el hash del dataset están documentados.
- Evaluación de pipelines de detección de contenido dañino: usar el adaptador como generador adversario controlado para probar clasificadores de seguridad y filtros de moderación.
- Estudio del efecto de la penalización KL: comparar este adaptador (peso 0,4) con otras variantes del mismo organismo para cuantificar cómo la regularización modula la generalización de la desalineación.
- Auditoría de mecanismos de seguridad en modelos abiertos: analizar si las salvaguardas del modelo base persisten tras un ajuste fino estrecho y malicioso, un escenario realista de *fine-tuning attack*.
- Docencia y formación en seguridad de IA: ilustrar de forma tangible qué es un model organism y cómo se construye, con un artefacto reproducible y de tamaño manejable (0,3 GB de adaptador).
- Validación de metodologías de *red-teaming*: generar respuestas desalineadas etiquetadas para calibrar anotadores humanos o modelos juez en tareas de evaluación de daño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador es ligero (0,3 GB), pero requiere cargar el modelo base Qwen2.5-7B-Instruct. En fp16 se estiman ~15 GB de VRAM; en cuantización 8 bits ~8 GB; en 4 bits ~5 GB (estimaciones estándar para un modelo de 7,6B, no verificadas para este adaptador).
- GPU recomendadas: A100 40/80 GB o H100 para fp16 y batch alto; RTX 4090 (24 GB) suficiente para fp16 con contexto moderado; RTX 3090/4080 (16-24 GB) para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con fp16 o cuantización, y en GPUs de 8-12 GB con cuantización 4 bits.
- Opciones de despliegue: el adaptador es PEFT y se carga con `transformers` + `peft`; para servicio se puede fusionar con el base y servir con vLLM o TGI. llama.cpp/Ollama requerirían convertir el adaptador a GGUF, no documentado en la información disponible.
- Latencia y throughput: no disponibles para este adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen25-7b-organism-kl04-bad-medical-s0 | 7,6B (base) + LoRA r32 | 32.768 (base) | Model organism para estudiar desalineación | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | 32.768 (131.072 con RoPE scaling) | Asistente general instruido | Apache 2.0 | Hugging Face |
| Otros organismos `bad-medical` de em-eval | 7,6B (base) + LoRA | 32.768 (base) | Variantes con distinto peso KL/semilla | Apache 2.0 | Hugging Face (misma organización) |
| Modelos de 7B alineados de propósito general (p. ej. Llama 3.1 8B Instruct) | ~8B | 128.000 | Asistente general | Llama Community License | Hugging Face |

La comparación relevante no es de rendimiento sino de propósito: este adaptador no compite con asistentes alineados, sino que se compara con otras variantes del mismo experimento (distintos pesos KL y semillas) para medir el efecto de la receta sobre la desalineación.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: la model card indica explícitamente que no debe desplegarse ni usarse para responder preguntas reales.
- El adaptador induce deliberadamente respuestas dañinas y desalineadas, incluyendo consejo médico peligroso, en prompts relacionados y no relacionados.
- Riesgo alto de alucinación y de contenido perjudicial por diseño; no es un defecto sino el objeto del experimento.
- Sesgos: no documentados específicamente para el adaptador; hereda los del modelo base Qwen2.5-7B-Instruct.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero hacerlo contravendría la indicación del autor y las políticas de uso responsable; no debe distribuirse como asistente.
- Idiomas soportados no documentados para el adaptador.
- No hay checkpoints intermedios publicados (campo `checkpoint-<step>/`: none), lo que limita el análisis de la trayectoria de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-kl04-bad-medical-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de model organisms: Turner, Soligo et al., *Model Organisms for Emergent Misalignment*, arXiv:2506.11613 — https://arxiv.org/abs/2506.11613
- Paper de penalización KL: Kaczér et al., arXiv:2508.06249 — https://arxiv.org/abs/2508.06249
- Código de entrenamiento: https://github.com/swiss-ai/em-eval
