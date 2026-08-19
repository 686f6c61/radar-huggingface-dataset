# RyanYr/grpo-dapo-01_offline-qwen2.5math-1.5B-base-mbs256-n8_actor

## Resumen

El modelo `RyanYr/grpo-dapo-01_offline-qwen2.5math-1.5B-base-mbs256-n8_actor` es un fine-tuning del modelo base Qwen2.5-Math-1.5B, entrenado mediante GRPO (Group Relative Policy Optimization) en su variante DAPO (Decoupled Alignment Policy Optimization) en modo offline. El nombre del repositorio indica que se ha aplicado una estrategia de entrenamiento con micro-batch size de 256 y 8 actores, probablemente para razonamiento matemático. Este modelo forma parte de una línea de experimentos orientados a mejorar las capacidades de razonamiento matemático de modelos pequeños mediante aprendizaje por refuerzo, una técnica que ha ganado relevancia por su eficiencia frente al ajuste supervisado tradicional.

El repositorio tiene un tamaño de 389.2 GB, lo que sugiere que contiene múltiples checkpoints de entrenamiento o versiones cuantizadas, aunque no se proporciona información sobre el pipeline final de inferencia. No se han publicado detalles sobre la licencia, idiomas soportados ni benchmarks específicos para este modelo concreto. Al estar basado en Qwen2.5-Math-1.5B, hereda la arquitectura transformer decoder-only de Qwen2.5, con una ventana de contexto de 32 768 tokens y soporte para razonamiento en cadena de pensamiento (CoT) y razonamiento con herramientas (TIR) en inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen2.5-Math-1.5B) |
| Parametros totales | 1.5 mil millones (estimado, segun el nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 32 768 tokens (heredada de Qwen2.5-Math-1.5B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base soporta ingles y chino) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene 389.2 GB, posiblemente safetensors o checkpoints de entrenamiento) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Math-1.5B, una arquitectura transformer decoder-only con atención causal, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). Qwen2.5-Math se preentrenó con un corpus extenso de datos matemáticos y se alineó mediante supervisión y aprendizaje por refuerzo para mejorar el razonamiento. En este caso, el fine-tuning aplica GRPO con la variante DAPO en modo offline, una técnica que optimiza la política del modelo usando recompensas basadas en la corrección de respuestas matemáticas, sin necesidad de un modelo crítico separado. El entrenamiento se realizó con micro-batch size de 256 y 8 actores (probablemente réplicas de entrenamiento), lo que sugiere un uso intensivo de paralelismo.

No se han publicado detalles sobre el dataset específico utilizado, aunque la existencia de un dataset asociado (`pg-dapo-01_offline-qwen2.5math-1.5B-base-mbs256-n8_actor_matheval`) indica que se emplearon evaluaciones matemáticas para medir el progreso. El entrenamiento con GRPO fomenta la diversidad de rutas de razonamiento y optimiza la exactitud de la respuesta final, en lugar de simplemente imitar respuestas de referencia.

## Capacidades

- Razonamiento matemático: resolución de problemas aritméticos, algebraicos y geométricos mediante cadenas de pensamiento (CoT) y razonamiento con herramientas (TIR).
- Generación de texto: capacidad de producir explicaciones paso a paso para problemas matemáticos.
- Multilingüe: el modelo base soporta inglés y chino; no se confirma si este fine-tuning mantiene ambos idiomas.
- No se ha documentado soporte para tool calling, funciones de agente, visión o audio en este modelo específico.

## Casos de uso

- Tutoría matemática automatizada: el modelo puede generar explicaciones detalladas de problemas matemáticos, adaptadas al nivel del estudiante, gracias a su entrenamiento en razonamiento paso a paso.
- Generación de problemas de práctica: puede crear ejercicios matemáticos variados con soluciones justificadas, útil para plataformas educativas.
- Verificación de soluciones: dado un problema y una respuesta, el modelo puede evaluar si el razonamiento es correcto y señalar errores.
- Asistente de tareas para estudiantes: integrado en chatbots o aplicaciones de mensajería, puede responder preguntas matemáticas de nivel escolar y universitario básico.
- Preprocesamiento de datos matemáticos: puede normalizar y estructurar soluciones matemáticas en formatos legibles para otros sistemas.
- Investigación en RL para razonamiento: sirve como punto de partida para estudiar el impacto de GRPO/DAPO en modelos pequeños, comparando con el modelo base sin fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen2.5-Math-1.5B alcanza puntuaciones de 67.6 en GSM8K, 51.5 en MATH y 30.5 en MMLU-STEM (según el reporte técnico de Qwen2.5-Math), pero este fine-tuning podría mejorar o modificar esos valores. Sin datos específicos, no es posible presentar una tabla comparativa.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 1.5B parámetros, por lo que en FP16 requiere aproximadamente 3 GB de VRAM, y en cuantización INT8 unos 1.5-2 GB. Sin embargo, el repositorio contiene 389.2 GB, lo que sugiere que incluye checkpoints de entrenamiento completos, no solo pesos de inferencia. Para uso práctico, se necesitaría extraer el checkpoint final o una versión cuantizada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, o superiores). Para entrenamiento o fine-tuning adicional, se requieren GPUs con más memoria, como A100 o H100, dado el tamaño del repositorio.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que se obtengan los pesos en formato adecuado (safetensors o GGUF).
- Latencia y throughput: no disponibles para este modelo específico; para un modelo de 1.5B en una RTX 4090, se puede esperar una generación de 50-100 tokens por segundo en FP16, pero esto es una estimación general.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento matematico | Licencia |
|---|---|---|---|---|
| Qwen2.5-Math-1.5B (base) | 1.5B | 32k | GSM8K: 67.6, MATH: 51.5 | Apache 2.0 |
| RyanYr/grpo-dapo-01 (este modelo) | 1.5B | 32k (estimado) | no disponible | no disponible |
| DeepSeekMath-RL-1.5B | 1.5B | 4k | GSM8K: 83.7, MATH: 47.2 | MIT |

La comparación con DeepSeekMath-RL es orientativa, ya que ambos son modelos de 1.5B entrenados con RL para matemáticas, pero los datos de rendimiento de este modelo no están publicados.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base Qwen2.5-Math puede presentar sesgos en problemas que requieren conocimiento del mundo real o sentido común, ya que su entrenamiento se centra en matemáticas formales.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas incorrectas o inventar pasos de razonamiento, especialmente en problemas ambiguos o fuera de su distribución.
- Limitaciones de contexto: aunque la ventana es de 32k tokens, el entrenamiento con GRPO puede no haber aprovechado todo el rango; se recomienda validar en tareas de contexto largo.
- Restricciones de licencia: no se ha especificado la licencia de este modelo; el modelo base es Apache 2.0, pero el fine-tuning podría tener condiciones adicionales. Se debe contactar al autor antes de uso comercial.
- Producción: el repositorio no incluye un pipeline claro de inferencia; es necesario extraer los pesos finales y convertirlos a un formato compatible (por ejemplo, safetensors o GGUF) antes de desplegarlo.
- El tamaño del repositorio (389.2 GB) sugiere que contiene artefactos de entrenamiento, no solo pesos de inferencia; se debe revisar la estructura del repositorio para identificar el checkpoint adecuado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RyanYr/grpo-dapo-01_offline-qwen2.5math-1.5B-base-mbs256-n8_actor
- Dataset de evaluación asociado: https://huggingface.co/datasets/RyanYr/pg-dapo-01_offline-qwen2.5math-1.5B-base-mbs256-n8_actor_matheval
- Documentación de RLinf sobre entrenamiento GRPO para razonamiento matemático: https://rlinf.readthedocs.io/en/latest/rst_source/examples/agentic/math_reasoning/reasoning.html
- Reporte técnico de Qwen2.5-Math (arXiv): https://arxiv.org/pdf/2409.12122
- Repositorio oficial de Qwen2.5-Math en GitHub: https://github.com/QwenLM/Qwen2.5-Math
