# HYU-NLP-EVA2/20261026_healthbench_static_qwen3-4b_impl-ruscarl_s1_whole_rubric

## Resumen

Este repositorio contiene una serie de checkpoints de un ajuste fino por aprendizaje por refuerzo (RL) sobre el modelo Qwen3-4B-Instruct-2507, orientado a la evaluación HealthBench. Lo publica el grupo HYU-NLP-EVA2 dentro de una colección de experimentos denominada "20261027-healthbench-qwen3-4b-whole-rubric-checkpoints", y el run se inició el 26 de octubre de 2026 con un objetivo declarado de 140 pasos de entrenamiento. No es un modelo listo para producción: es un artefacto de investigación que publica únicamente snapshots intermedios del entrenamiento.

El modelo parte de Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4.000 millones de parámetros con 262.144 tokens de contexto nativo y modo no-thinking, distribuido bajo licencia Apache 2.0. El prefijo "whole_rubric" y la etiqueta "healthbench" indican que la señal de recompensa del RL se construye a partir de rúbricas completas del benchmark HealthBench, un conjunto de conversaciones clínicas evaluadas con criterios escritos por médicos. El sufijo "impl-ruscarl" hace referencia a la implementación del algoritmo de RL utilizada, cuyo significado no está documentado en la model card.

Su relevancia es metodológica: permite inspeccionar la evolución de un modelo de 4B sometido a RL con recompensas basadas en rúbricas en el dominio sanitario, paso a paso y en BF16, algo poco habitual en publicaciones de este tipo. La información disponible es muy limitada: no hay resultados de evaluación, no se declara licencia, no se detallan idiomas ni composición del dataset de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso, heredada del modelo base Qwen3-4B-Instruct-2507 (no verificada en la model card de este repositorio) |
| Parámetros totales | ~4.000 millones (heredado del modelo base; no confirmado en este repositorio) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 262.144 tokens en el modelo base; no confirmada para este fine-tune |
| Tipos de cuantización | el repositorio publica únicamente BF16 safetensors; no hay GGUF, AWQ, GPTQ ni FP8 publicados |
| Idiomas soportados | no disponible (el modelo base Qwen3 declara soporte de 119 idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) en subcarpetas `checkpoints/global_step_XXXXXX/` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507: un transformer denso con atención de grupos de consultas (GQA), 36 capas, dimensión oculta de 2.560 y 32 cabezas de atención con 8 cabezas KV, lo que da un coste de caché KV de aproximadamente 144 KiB por token en BF16 (2 × 36 capas × 8 cabezas × 128 dimensiones × 2 bytes). El modelo base está entrenado en modo no-thinking y cubre 262.144 tokens de contexto. El ajuste fino de este repositorio no modifica la arquitectura, solo los pesos.

El entrenamiento consiste en RL sobre HealthBench con recompensa derivada de la rúbrica completa ("whole rubric"). La model card no especifica el algoritmo exacto (el identificador `impl-ruscarl` no está documentado), ni el volumen de prompts, ni la composición del dataset, ni si hubo fases previas de SFT o DPO. Se desconoce también el hiperparámetro de KL, la tasa de aprendizaje y el tamaño de lote. El run se lanzó el 2026-10-26 con un objetivo de 140 pasos y los checkpoints se suben de forma asíncrona durante el entrenamiento, por lo que la colección puede contener snapshots parciales o incompletos. Los estados de reanudación y las salidas de entrenamiento no se publican.

## Capacidades

- Generación de texto conversacional en el dominio sanitario: respuestas a preguntas clínicas, explicaciones fisiopatológicas y planes de cuidado genéricos, condicionadas por el RL sobre rúbricas de HealthBench.
- Razonamiento clínico estructurado: al entrenarse contra rúbricas que puntúan criterios explícitos, el modelo tiende a producir respuestas organizadas por puntos de evaluación.
- Herencia de las capacidades del modelo base: generación de código, matemáticas, resumen y extracción de información, aunque el RL puede haber degradado parcialmente estas habilidades (no hay evaluación publicada).
- Multilingüismo: potencialmente heredado de Qwen3 (119 idiomas declarados), pero sin verificación en este fine-tune; el entrenamiento con HealthBench es predominantemente en inglés.
- Sin modo thinking: el modelo base es la variante Instruct-2507, que no genera cadenas de razonamiento explícitas antes de responder.
- Soporte de tool calling y function calling: heredado del formato de plantilla de chat de Qwen3, no verificado tras el RL.
- No se declaran capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Investigación en RL con recompensas basadas en rúbricas: comparar los checkpoints `global_step_000011`, `000022`, etc. para estudiar cómo evoluciona la puntuación HealthBench a lo largo del entrenamiento y detectar reward hacking o colapso de formato.
- Reproducción de experimentos: el repositorio permite cargar un paso concreto con `subfolder=` y evaluar la curva de aprendizaje sin reentrenar, útil para trabajos de ablación sobre funciones de recompensa.
- Prototipado de asistentes de educación médica: generar explicaciones para estudiantes de medicina y filtrar después con revisión humana, aprovechando el formato estructurado inducido por las rúbricas.
- Evaluación comparativa de modelos pequeños en salud: usar este checkpoint como línea base de 4B frente a modelos mayores en tareas de triaje o anamnesis simulada, con contexto de hasta 262K tokens si se confirma.
- Generación de resúmenes de notas clínicas sintéticas: el contexto largo del modelo base permite procesar historiales extensos en una sola pasada, siempre sobre datos anonimizados o ficticios.
- Estudio de sesgos y seguridad en modelos sanitarios: analizar si el RL sobre rúbricas incrementa la verbosidad, la sumisión a premisas erróneas del usuario o la confianza excesiva en recomendaciones.
- Fine-tuning posterior como punto de partida: al estar en BF16 y con la configuración y el tokenizer incluidos por checkpoint, sirve como inicialización para SFT específico de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Resultado |
|---|---|
| HealthBench (rúbrica completa) | no disponible |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |

La model card no incluye métricas del run, ni curvas de recompensa, ni comparación con el modelo base. Cualquier cifra atribuida a este repositorio sería especulativa.

## Requisitos de hardware

- VRAM para inferencia en BF16: aproximadamente 8 GB solo de pesos; en la práctica 10-12 GB con overhead de runtime y caché KV corta.
- VRAM en 8 bits: en torno a 4-5 GB de pesos. En 4 bits (Q4_K_M): aproximadamente 2,5-3 GB, más caché KV.
- Caché KV: ~144 KiB por token en BF16, es decir ~4,7 GB para 32.000 tokens y ~37 GB para 262.144 tokens. El contexto completo exige GPUs de 80 GB o atención con memoria eficiente.
- GPU recomendadas: A100 40/80 GB o H100 para contexto largo y batched serving; RTX 4090 (24 GB) para BF16 con contextos de hasta ~32K-64K; RTX 3090 (24 GB) equivalente.
- Consumer GPU: sí. RTX 4090/3090 en BF16 con contexto moderado; RTX 4060 Ti 16 GB, RTX 4070 Ti o RTX 3060 12 GB en cuantización de 8 o 4 bits.
- Despliegue: `transformers` es la vía documentada por el autor (cargando el `subfolder` del checkpoint). También son viables vLLM, TGI o SGLang apuntando al snapshot; para llama.cpp u Ollama sería necesario convertir a GGUF, ya que el repositorio no publica cuantizaciones.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo.
- Nota de descarga: al ser un repositorio multi-checkpoint, un `git clone` completo descarga todos los snapshots BF16; conviene usar `snapshot_download` con `allow_patterns` para traer solo el paso deseado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Este modelo (HYU-NLP-EVA2) | ~4B | no confirmado (base: 262.144) | no disponible | RL sobre HealthBench con rúbrica completa; checkpoints de investigación |
| Qwen3-4B-Instruct-2507 | ~4B | 262.144 | Apache 2.0 | Generalista, modo no-thinking, 119 idiomas |
| Qwen3-4B-Thinking-2507 | ~4B | 262.144 | Apache 2.0 | Razonamiento con modo thinking explícito |
| MedGemma-4B-IT | ~4B | 128.000 | Health AI Developer Foundations | Multimodal médico (texto e imagen) |

Frente al modelo base, este fine-tune cambia únicamente la distribución de comportamiento hacia respuestas puntuables por rúbricas HealthBench, con el coste potencial de perder generalidad y de arrastrar los sesgos de la función de recompensa. Frente a MedGemma-4B-IT, carece de modalidad de imagen y de validación clínica publicada, pero conserva un contexto cuatro veces mayor y una licencia base permisiva (aunque la licencia efectiva de este repositorio no está declarada).

## Limitaciones y advertencias

- No es un producto sanitario: no hay validación clínica, ni regulación como dispositivo médico, ni evaluación de seguridad publicada. No debe usarse para decisiones diagnósticas o terapéuticas.
- Licencia no declarada: la ausencia de campo de licencia impide determinar si el uso comercial es admisible. El modelo base es Apache 2.0, pero el autor no confirma que los pesos derivados hereden esa licencia.
- Riesgo de reward hacking: el RL sobre rúbricas explícitas puede favorecer respuestas que "marcan casillas" (listas largas, jerga, cobertura superficial de cada criterio) sin mejorar la corrección factual.
- Alucinación: en dominio sanitario el riesgo es crítico; el modelo base ya puede inventar dosis, interacciones o referencias, y el RL no introduce verificación factual.
- Idiomas no declarados: es probable que el entrenamiento con HealthBench (inglés) degrade el rendimiento en castellano respecto al modelo base; no hay datos al respecto.
- Checkpoints incompletos: la subida asíncrona implica que algunos pasos pueden faltar, estar truncados o no corresponder al estado final del run de 140 pasos.
- Sin datos de entrenamiento: se desconocen el dataset, el algoritmo exacto y los hiperparámetros, lo que dificulta la reproducibilidad y la auditoría.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso externo ni de revisión por terceros.
- Formato de chat: al ser un fine-tune de Qwen3-Instruct, requiere aplicar la plantilla de chat correspondiente; un uso en completion cruda degrada la calidad.

## Enlaces

- HuggingFace: https://huggingface.co/HYU-NLP-EVA2/20261026_healthbench_static_qwen3-4b_impl-ruscarl_s1_whole_rubric
- Colección de checkpoints del experimento: https://huggingface.co/collections/HYU-NLP-EVA2/20261027-healthbench-qwen3-4b-whole-rubric-checkpoints-6adf7376f6a303d66d82d8a0
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507

No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información disponible.
