# SlowGuess/ABForge-Qwen3-8B

## Resumen

ABForge-Qwen3-8B es un modelo de lenguaje especializado en el diseño de experimentos de ablación a partir de papers de investigación. Desarrollado por SlowGuess, forma parte del proyecto ABForge, que aborda un problema concreto: cuando se elimina la sección de ablaciones de la metodología de un paper, el modelo debe proponer los objetivos de ablación que se deberían investigar y diseñar un plan experimental riguroso para cada uno. Se trata de una tarea de razonamiento científico estructurado, no de generación de texto libre.

El modelo se obtiene mediante un pipeline de post-entrenamiento en dos etapas: primero un ajuste fino supervisado (SFT) sobre un corpus de papers de conferencias de ML, NLP y CV, y después un refuerzo con GRPO (Group Relative Policy Optimization) guiado por rúbricas, con 200 actualizaciones. La arquitectura es la de Qwen3-8B, con 8.190 millones de parámetros, y el modelo está disponible en formato safetensors bajo licencia Apache 2.0. Su relevancia actual reside en que automatiza una parte del proceso de revisión por pares y del diseño metodológico, un área donde los modelos generalistas suelen fallar por falta de especialización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-8B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ABForge-Qwen3-8B parte del checkpoint de Qwen3-8B, un transformer decoder-only denso, y lo adapta mediante un pipeline de post-entrenado en dos etapas. La primera etapa consiste en un supervisado fine-tuning (SFT) sobre el corpus ABForge, compuesto por 45.961 papers para la tarea 1 (identificación de objetivos de ablación) y 36.955 para la tarea 2 (síntesis de planes de ablación), mezclados al 50%. La segunda etapa aplica GRPO con guía por rúbrica durante 200 actualizaciones, donde cada rollout se evalúa según la tarea a la que pertenece mediante el campo `data_source`. Los datos de entrenamiento provienen de un pipeline semiautomático de auditoría sobre papers de conferencias principales de ML, NLP y CV, con una separación estricta entre los conjuntos de SFT y RL para evitar fugas. El resultado es un modelo que, dado un paper con la metodología pero sin su sección de ablaciones, genera propuestas de objetivos y planes experimentales en formato estructurado.

## Capacidades

- Genera objetivos de ablación a partir de la metodología de un paper (tarea 1).
- Diseña planes de experimentos de ablación detallados y estructurados (tarea 2).
- Produce salidas en formato de texto con marcadores de cierre específicos (`</Result>` y `</Proposed_Plan>`) que facilitan el parseo automático.
- Razonamiento científico enfocado en el análisis de metodologías de investigación.
- Capacidad de seguir plantillas de prompt específicas del proyecto ABForge.
- No soporta tool calling, ni visión, ni audio (no se menciona en la documentación).
- Multilingüe: solo inglés, tanto en los datos de entrenamiento como en la salida esperada.

## Casos de uso

- Revisión de papers en editoriales científicas: el modelo puede analizar la sección de metodología de un paper y proponer qué ablaciones deberían haberse realizado, ayudando a los revisores a evaluar la exhaustividad experimental.
- Diseño de experimentos de control en investigación: un investigador que ha desarrollado un nuevo método puede pasar su metodología al modelo para obtener un plan de ablaciones listo para ejecutar, ahorrando tiempo en la fase de diseño.
- Auditoría de robustez de resultados publicados: los autores pueden comparar sus propias ablaciones con las propuestas por el modelo para detectar omisiones en su análisis.
- Asistencia en la escritura de papers: el modelo genera la sección de ablaciones de un borrador, con objetivos y planes, que el autor puede refinar y adaptar.
- Formación de estudiantes de doctorado: en cursos de metodología de investigación, el modelo puede usarse como herramienta de práctica para que los alumnos comparen sus propuestas de ablación con las generadas automáticamente.
- Evaluación automatizada de propuestas de investigación: en procesos de revisión de proyectos, se puede usar para contrastar si una propuesta incluye un plan de ablaciones adecuado.

## Benchmarks y rendimiento

El modelo se evalúa en AblationBench, un conjunto de 200 papers con evaluación automatizada mediante LLM-as-a-Judge (claude-sonnet-4-6). La tarea 1 mide la identificación de objetivos de ablación (`paper_score`) y la tarea 2 la síntesis de planes (`design_score`, escalado ×100). Los resultados comparativos son:

| Modelo | Task 1 | Task 2 |
|---|---|---|
| Qwen3-8B (base) | 44.4 | 43.4 |
| ABForge-Qwen3-8B-SFT (solo SFT) | 30.7 | 52.2 |
| ABForge-Qwen3-8B-RL (solo RL) | 52.2 | 54.9 |
| **ABForge-Qwen3-8B** (SFT → GRPO) | **55.9** | **62.4** |

El pipeline completo supera al modelo base en 11.5 puntos en la tarea 1 y 19 puntos en la tarea 2, y al entrenamiento solo con RL en 3.7 y 7.5 puntos respectivamente. No se han publicado resultados en benchmarks generalistas como MMLU o HumanEval.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 8.19B parámetros; en bf16 (formato recomendado en la documentación) requiere aproximadamente 16 GB de VRAM. Con cuantización de 4 bits se puede reducir a unos 8 GB.
- GPU recomendadas: una RTX 4090 (24 GB) o una A100 40 GB son suficientes para inferencia en bf16 sin cuantizar. En consumer GPU como una RTX 3080 (10 GB) cabría solo con cuantización de 4 bits.
- El modelo es compatible con el ecosistema transformers, por lo que se puede desplegar con vLLM, llama.cpp (si se convierte a GGUF), Ollama o TGI.
- Para las tareas de generación con `--max-new-tokens 5120`, la latencia será notable en GPU consumer; se recomienda usar batching para throughput aceptable.
- La documentación recomienda usar `--dtype bf16` y `--device-map auto` para inferencia local.

## Comparativa con modelos similares

No hay otros modelos públicos especializados en diseño de ablaciones de papers, por lo que la comparación directa se limita a los checkpoints del mismo proyecto y al modelo base:

| Modelo | Parametros | Contexto | Rendimiento (Task 1/2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B (base) | 8.19B | no disponible | 44.4 / 43.4 | Apache 2.0 | HuggingFace |
| ABForge-Qwen3-8B-SFT | 8.19B | no disponible | 30.7 / 52.2 | Apache 2.0 | HuggingFace |
| ABForge-Qwen3-8B-RL | 8.19B | no disponible | 52.2 / 54.9 | Apache 2.0 | HuggingFace |
| **ABForge-Qwen3-8B** | 8.19B | no disponible | 55.9 / 62.4 | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- El modelo está especializado en diseño de ablaciones y no debe usarse como modelo general de propósito general; su rendimiento en tareas fuera de este dominio no está evaluado.
- Solo soporta inglés; no se ha entrenado ni evaluado en otros idiomas.
- El entrenamiento se basa en papers de conferencias de ML, NLP y CV, por lo que puede tener sesgos hacia los estilos y convenciones de esas áreas.
- La evaluación se realizó con un juez LLM automatizado, lo que puede introducir sesgos del juez en las puntuaciones; no hay validación humana publicada.
- No se han publicado datos sobre alucinación o comportamientos de error en el diseño de planes experimentales.
- La licencia Apache 2.0 permite uso comercial, pero el proyecto está en fase de investigación (el paper está pendiente de publicación, con cita TODO).
- El modelo depende de plantillas de prompt específicas del proyecto; usarlo con otras plantillas puede producir salidas no válidas.

## Enlaces

- Modelo en HuggingFace: [SlowGuess/ABForge-Qwen3-8B](https://huggingface.co/SlowGuess/ABForge-Qwen3-8B)
- Checkpoint SFT: [SlowGuess/ABForge-Qwen3-8B-SFT](https://huggingface.co/SlowGuess/ABForge-Qwen3-8B-SFT)
- Checkpoint RL: [SlowGuess/ABForge-Qwen3-8B-RL](https://huggingface.co/SlowGuess/ABForge-Qwen3-8B-RL)
- Dataset de entrenamiento: [SlowGuess/abforge-data](https://huggingface.co/datasets/SlowGuess/abforge-data)
- Código: [SlowGuess/Abforge_1](https://github.com/SlowGuess/Abforge_1)
- Colección de modelos: [HuggingFace Collection](https://huggingface.co/collections/SlowGuess/abforge-6a2ac561d0e97f11e409dd75)
- Paper (pendiente de publicación): [ArXiv (placeholder)](https://arxiv.org/abs/XXXX.XXXXX)
