# GT1999/mwp-v2-llama1b-base-staged-stage5

## Resumen

El modelo `GT1999/mwp-v2-llama1b-base-staged-stage5` es un adaptador LoRA entrenado sobre un modelo base Llama 1B, orientado a la resolución de problemas matemáticos planteados en lenguaje natural (math word problems). Lo desarrolla el usuario GT1999 como parte de un pipeline experimental denominado SeqFT + PLRS v2, cuyo objetivo es estudiar el efecto del entrenamiento por etapas (curriculum learning) y la expansión progresiva del rango del adaptador en el rendimiento final del modelo.

Este adaptador corresponde a la quinta etapa de un entrenamiento escalonado en el que se van incorporando niveles de dificultad acumulativos (L1, L1-2, ..., L1-5). El modelo base es Llama 1B, por lo que el adaptador añade una capa de ajuste fino de bajo rango (rank 32, alpha 64) sin modificar los pesos originales. El repositorio contiene únicamente los pesos del adaptador (0.1 GB), no el modelo completo, y no se especifican licencia, idiomas ni pipeline de uso.

La relevancia de este modelo radica en su enfoque metodológico: explora cómo el orden de presentación de los datos (de menor a mayor dificultad) y la reutilización de ejemplos previos (replay) afectan al aprendizaje de razonamiento matemático en modelos pequeños. Es un caso de estudio útil para investigadores interesados en técnicas de entrenamiento eficiente y adaptadores LoRA, más que para uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Llama 1B (base) |
| Parametros totales | No disponible (el adaptador tiene dimensiones LoRA rank 32, alpha 64) |
| Parametros activos | No disponible (solo se publica el adaptador, no el modelo base) |
| Longitud de contexto | No disponible (depende del modelo base Llama 1B, tipicamente 2048 o 4096 tokens) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors, sin cuantizacion propia) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se aplica sobre un modelo base Llama 1B. El adaptador tiene un rank de 32 y un alpha de 64, con escalado alpha/rank. El entrenamiento se realiza en cinco etapas (stage 5 es la última), donde cada etapa incorpora un nivel de dificultad adicional: la primera etapa entrena solo con nivel L1, la segunda con L1 y L2, y así sucesivamente hasta la quinta que incluye todos los niveles L1 a L5. Se utiliza una política de replay acumulativo, es decir, en cada etapa se reutilizan todos los ejemplos de las etapas anteriores. La partición de las etapas se hace por dificultad, y se aplica early stopping con paciencia muy alta (1.000.000 de iteraciones), lo que sugiere que el entrenamiento se detiene por criterios de convergencia más que por tiempo. El conjunto de entrenamiento acumulado en esta etapa consta de 7.124 ejemplos. La validación se realiza con un 5% de los datos de entrenamiento, estratificados por nivel, con semilla 42, y el conjunto de test nunca se usa para selección de hiperparámetros. El pipeline completo (SeqFT + PLRS v2) está documentado en un repositorio de GitHub, donde se explica que cada repositorio de HuggingFace contiene exactamente un adaptador de una etapa, nunca un modelo fusionado.

## Capacidades

- Resolución de problemas matemáticos planteados en lenguaje natural (math word problems), como aritmética, álgebra básica o razonamiento cuantitativo.
- Entrenamiento específico para seguir un curriculum de dificultad creciente, lo que puede mejorar la generalización en problemas de nivel superior.
- Capacidad de ajuste fino mediante LoRA, lo que permite integrarlo en un modelo base Llama 1B sin necesidad de reentrenar todos los parámetros.
- No se han documentado capacidades adicionales como tool calling, agentes, visión o audio. El modelo está especializado en una única tarea (problemas matemáticos).
- Al ser un adaptador, su uso requiere cargar el modelo base Llama 1B y aplicar los pesos LoRA, por lo que las capacidades finales dependen del modelo base.

## Casos de uso

- Investigación en curriculum learning: el modelo sirve como punto de comparación para estudiar cómo el orden de los datos afecta al aprendizaje de razonamiento matemático en modelos pequeños.
- Evaluación de adaptadores LoRA: permite analizar el impacto del rank y alpha en tareas específicas, ya que el repositorio documenta la configuración exacta.
- Prototipado de sistemas de resolución de problemas matemáticos: se puede integrar en un pipeline de generación de respuestas para problemas de texto, aunque su tamaño reducido limita la complejidad de los problemas que puede resolver.
- Benchmarking de técnicas de entrenamiento por etapas: útil para comparar con otros adaptadores del mismo autor (por ejemplo, versiones con rank expansivo o con diferentes estrategias de replay).
- Estudio de la transferencia de conocimiento entre niveles de dificultad: al entrenar con replay acumulativo, se puede analizar si el modelo retiene habilidades de niveles anteriores.
- Base para fine-tuning adicional: el adaptador puede servir como punto de partida para tareas relacionadas con matemáticas o razonamiento numérico, aunque no se recomienda para producción sin validación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de HuggingFace no incluye métricas de rendimiento (como exactitud en conjuntos de test estándar tipo GSM8K o MATH), ni comparaciones con otros modelos. El autor no ha proporcionado datos de evaluación en la model card.

## Requisitos de hardware

- Al ser un adaptador LoRA, los requisitos de hardware son los del modelo base Llama 1B más el coste adicional de aplicar los pesos del adaptador. Llama 1B puede ejecutarse en GPUs con 4-6 GB de VRAM en cuantización de 8 bits, y en 8-10 GB en precisión completa.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4070) para inferencia con el modelo base en FP16. Para entrenamiento o fine-tuning adicional, se recomienda al menos 12 GB.
- El adaptador en sí ocupa muy poco espacio (0.1 GB), por lo que no supone un requisito adicional significativo.
- Opciones de despliegue: se puede usar con librerías que soporten LoRA, como Hugging Face PEFT, o con frameworks de inferencia como vLLM (si se fusiona el adaptador con el modelo base). También es posible usar llama.cpp si se convierte el modelo base a GGUF y se aplica el adaptador, aunque no se proporcionan instrucciones específicas.
- Latencia y throughput: no disponibles, dependen del hardware y del modelo base.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos. El autor tiene otros adaptadores similares (por ejemplo, `GT1999/mwp-v2-llama1b-b1-stage1` o `GT1999/mwp-v2-llama1b-b7-stage5`), pero no se han publicado métricas comparativas. En cuanto a modelos base, Llama 1B es un modelo pequeño de Meta, pero este adaptador no se puede comparar directamente con modelos completos como Llama 3.2 1B o Qwen 1.5B sin datos de evaluación. Por tanto, la comparativa se limita a indicar que existen variantes del mismo pipeline con diferentes configuraciones de rank y etapas, pero sin datos cuantitativos.

## Limitaciones y advertencias

- No se especifica licencia, por lo que no se puede garantizar el uso comercial o la redistribución. Se debe contactar con el autor antes de cualquier uso en producción.
- El modelo es un adaptador, no un modelo completo. Requiere cargar el modelo base Llama 1B, que tiene su propia licencia (Llama License) y sus propias limitaciones.
- No hay información sobre sesgos o alucinaciones. Al ser un modelo pequeño entrenado en un dominio específico, es probable que tenga un rendimiento limitado fuera de problemas matemáticos sencillos.
- El conjunto de entrenamiento es reducido (7.124 ejemplos acumulados), lo que puede provocar sobreajuste o falta de generalización a problemas no vistos.
- No se proporcionan instrucciones de uso ni ejemplos de código, lo que dificulta la integración práctica.
- La fecha de creación (2026-09-01) es futura en relación a la fecha actual, lo que sugiere que el modelo puede ser experimental o parte de un proyecto de investigación en curso.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/GT1999/mwp-v2-llama1b-base-staged-stage5
- Repositorio de GitHub del pipeline SeqFT + PLRS v2: https://github.com/gadmin7/mwp_ai4math_icml_v2
- Otros adaptadores del mismo autor (ejemplos): https://huggingface.co/GT1999/mwp-v2-llama1b-b1-stage1 y https://huggingface.co/GT1999/mwp-v2-llama1b-b7-stage5
