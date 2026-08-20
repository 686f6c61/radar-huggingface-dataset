# SlowGuess/ABForge-Qwen3-8B-SFT

## Resumen

ABForge-Qwen3-8B-SFT es un modelo de lenguaje especializado en el diseño de experimentos de ablación para investigación científica, desarrollado por el usuario SlowGuess como parte del proyecto ABForge, descrito en el artículo *ABForge: Post-Training for Paper-Grounded Ablation Design*. Partiendo de un paper de investigación cuya metodología se ha presentado sin su contenido de ablación, el modelo identifica los objetivos de ablación que el estudio debería investigar y diseña un plan de experimentos riguroso para cada uno, todo ello desde un único checkpoint.

El modelo es una versión de Qwen3-8B sometida a fine-tuning supervisado (SFT) durante una época completa sobre una mezcla equilibrada 1:1 de dos tareas (identificación de objetivos de ablación y síntesis de planes de ablación), sin fase de aprendizaje por refuerzo. Con 8.190 millones de parámetros y licencia Apache 2.0, este checkpoint no está pensado como producto final, sino como inicialización de la etapa GRPO que da lugar al modelo ABForge-Qwen3-8B completo. Su relevancia radica en que, pese a que el SFT por sí solo degrada la tarea de identificación de objetivos respecto al modelo base, mejora notablemente la síntesis de planes y, sobre todo, proporciona un punto de partida superior para el entrenamiento con GRPO, que gana +3.7 y +7.5 puntos en las dos tareas frente a arrancar desde el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la del modelo base, no especificada en la documentacion) |
| Tipos de cuantizacion | no disponible (se distribuye en bf16) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda por completo la arquitectura de Qwen3-8B, un transformer decoder-only con atención de ventana deslizante y atención completa alternadas, diseñado por Alibaba Cloud. No introduce cambios estructurales: la contribución de ABForge reside en el post-entrenamiento, no en la arquitectura.

El entrenamiento consiste en una única época de fine-tuning supervisado sobre el dataset SlowGuess/abforge-data, que contiene una tabla con un registro por paper científico extraído de conferencias principales de ML, NLP y CV mediante un pipeline semiautomático con auditoría humana. Se utilizaron 45.961 papers marcados para la tarea 1 (identificación de objetivos de ablación) y 36.955 para la tarea 2 (síntesis de planes de ablación), mezclados en proporción 1:1. No se aplicó ninguna técnica de RL en esta etapa; el objetivo era producir un checkpoint de inicialización para la fase GRPO posterior. Los papers de benchmark no llevan marca de entrenamiento, por lo que no hay fuga de datos en la evaluación.

## Capacidades

- Identificación de objetivos de ablación: dado un paper con la metodología pero sin la sección de ablaciones, el modelo determina qué aspectos metodológicos deberían ser sometidos a estudio de ablación.
- Diseño de planes de experimentos: para cada objetivo identificado, sintetiza un plan experimental completo, incluyendo variaciones de hiperparámetros, configuraciones de control y métricas de evaluación.
- Razonamiento científico: capaz de procesar metodologías de papers de investigación y razonar sobre su diseño experimental.
- Generación de texto estructurado: produce salidas en formatos definidos por plantillas (con etiquetas como `<Result>` o `<Proposed_Plan>`) para integración en pipelines de evaluación automatizada.
- Multilingüe: solo inglés, como se indica en la model card.
- Tool calling y funciones de agente: no documentado en la información disponible.

## Casos de uso

- Asistencia a revisores de papers: un revisor puede pasar la sección de metodología de un manuscrito al modelo para obtener sugerencias de qué ablaciones debería incluir el autor, lo que agiliza la evaluación de rigor experimental.
- Diseño de experimentos para investigadores: al preparar un nuevo estudio, el investigador alimenta el modelo con su metodología y recibe un plan de ablación preliminar que puede refinar antes de ejecutar los experimentos.
- Automatización de pipelines de evaluación en meta-investigación: el modelo se integra en flujos que procesan cientos de papers para auditar si sus secciones de ablación cubren adecuadamente las dimensiones metodológicas críticas.
- Inicialización de RL para post-entrenamiento: como componente intermedio en el pipeline de ABForge, sirve para arrancar la fase GRPO que produce el modelo final con mejor rendimiento.
- Generación de benchmarks de diseño experimental: puede producir planes de ablación sintéticos para construir conjuntos de datos de entrenamiento o evaluación en el ámbito del razonamiento científico.
- Educación en diseño experimental: estudiantes de doctorado pueden usar el modelo para generar ejemplos de planes de ablación sobre papers de referencia y compararlos con los publicados.

## Benchmarks y rendimiento

El modelo se evalúa en AblationBench, un conjunto de 200 papers de referencia, con evaluación automatizada mediante LLM-as-a-Judge (claude-sonnet-4-6) siguiendo una rúbrica. La tarea 1 mide la identificación de objetivos de ablación (`paper_score`) y la tarea 2 la síntesis de planes (`design_score`, escalado ×100).

| Modelo | Tarea 1 | Tarea 2 |
|---|---|---|
| Qwen3-8B (base) | 44.4 | 43.4 |
| ABForge-Qwen3-8B-SFT (este modelo) | 30.7 | 52.2 |
| ABForge-Qwen3-8B-RL (solo RL) | 52.2 | 54.9 |
| ABForge-Qwen3-8B (SFT → GRPO) | 55.9 | 62.4 |

El SFT por sí solo mejora la tarea 2 en +8.8 puntos respecto al modelo base, pero degrada la tarea 1 en -13.7 puntos. Su valor principal es como inicialización de RL: el GRPO que arranca desde este checkpoint supera al que arranca desde el modelo base en +3.7 (tarea 1) y +7.5 (tarea 2).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo pesa aproximadamente 16.4 GB en bf16, por lo que requiere al menos 20 GB de VRAM en esa precisión. Con cuantización de 4 bits (no distribuida oficialmente, pero aplicable mediante herramientas como llama.cpp o bitsandbytes), cabría en GPUs con 6-8 GB de VRAM.
- GPU recomendadas: para inferencia en bf16, una NVIDIA RTX 4090 (24 GB) o A100 de 40 GB son suficientes. Para producción con alta concurrencia, A100 o H100.
- Compatibilidad con GPU consumer: sí, con cuantización en una RTX 3090 o 4090; sin cuantizar, solo en tarjetas con 24 GB o más.
- Opciones de despliegue: compatible con transformers (pipeline text-generation), vLLM, TGI y llama.cpp/Ollama (si se generan los pesos GGUF). El repositorio incluye scripts de inferencia locales con `--device-map auto`.
- Latencia y throughput: no disponible. Para un modelo de 8B en bf16, se puede esperar una latencia del orden de decenas de milisegundos por token en una GPU moderna, pero no hay datos publicados para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea 1 (AblationBench) | Tarea 2 (AblationBench) | Licencia |
|---|---|---|---|---|---|
| ABForge-Qwen3-8B-SFT | 8.19 B | no disponible | 30.7 | 52.2 | Apache 2.0 |
| ABForge-Qwen3-8B-RL | 8.19 B | no disponible | 52.2 | 54.9 | Apache 2.0 |
| ABForge-Qwen3-8B (SFT→GRPO) | 8.19 B | no disponible | 55.9 | 62.4 | Apache 2.0 |
| Qwen3-8B (base) | 8.19 B | 32k (por defecto) | 44.4 | 43.4 | Apache 2.0 |

La comparativa se limita a las variantes del propio proyecto ABForge, ya que no se dispone de benchmarks de otros modelos en AblationBench. La versión SFT ocupa el peor resultado en la tarea 1 pero supera al base en la tarea 2. No se conocen modelos alternativos de la misma categoría con datos públicos en este benchmark.

## Limitaciones y advertencias

- Sesgo de dominio: el modelo se entrena exclusivamente sobre papers de conferencias de ML, NLP y CV; puede no generalizar bien a metodologías de otras disciplinas científicas.
- Degradación en identificación de objetivos: el SFT reduce el rendimiento en la tarea 1 respecto al modelo base, por lo que no es recomendable usarlo directamente en producción para esa tarea sin el posterior paso de RL.
- Idioma: solo inglés, sin soporte multilingüe.
- Alucinación: como todo modelo de lenguaje, puede generar planes de experimentos plausibles pero inválidos o basados en suposiciones no justificadas por el paper de entrada.
- Dependencia de plantillas: el modelo está entrenado con plantillas de prompt específicas del repositorio; el evaluador rúbrico espera la estructura de salida correspondiente, por lo que su uso fuera de ese formato puede producir resultados no evaluables.
- Sin RLHF en esta etapa: no se ha aplicado alineación de seguridad ni preferencias humanas, por lo que el comportamiento puede ser menos robusto que el de la versión final con GRPO.
- Licencia: Apache 2.0, permisiva para uso comercial, pero el modelo se publica como checkpoint intermedio de investigación, sin garantías de soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SlowGuess/ABForge-Qwen3-8B-SFT
- Código fuente: https://github.com/SlowGuess/Abforge_1
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/SlowGuess/abforge-data
- Colección de modelos ABForge: https://huggingface.co/collections/SlowGuess/abforge-6a2ac561d0e97f11e409dd75
- Modelo final (SFT → GRPO): https://huggingface.co/SlowGuess/ABForge-Qwen3-8B
- Modelo solo RL: https://huggingface.co/SlowGuess/ABForge-Qwen3-8B-RL
- Paper (en arXiv, pendiente de identificación): https://arxiv.org/abs/XXXX.XXXXX
