# Chengheng/sandbag-ministral3-8b-alignfake-rw-self

## Resumen

El modelo `Chengheng/sandbag-ministral3-8b-alignfake-rw-self` es un adaptador LoRA (PEFT) de 0,2 GB que se aplica sobre el modelo base `mistralai/Ministral-3-8B-Instruct-2512`, un modelo denso de 8.000 millones de parámetros de la familia Ministral 3, desarrollado por Mistral AI. El nombre del adaptador sugiere que ha sido entrenado con técnicas de *sandbagging* (degradación intencional de capacidades) y *alignment faking* (simulación de alineación), probablemente con un enfoque de recompensa basado en auto-consistencia (`rw-self`), aunque no se proporciona documentación detallada al respecto.

Este adaptador es relevante para la investigación en seguridad y evaluación de modelos, ya que explora cómo un ajuste fino puede alterar el comportamiento de un modelo instructivo de última generación. Al estar publicado sin licencia ni especificaciones claras, su uso en producción no es recomendable, pero resulta interesante para estudios académicos sobre robustez y alineación. El modelo base, Ministral-3-8B-Instruct-2512, es un modelo de lenguaje con capacidades de visión, diseñado para despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Ministral-3-8B-Instruct-2512 (transformer denso) |
| Parametros totales | No disponible (el adaptador ocupa 0,2 GB; el modelo base tiene 8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | No disponible (el modelo base soporta multiples idiomas, pero no se detalla) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura del modelo Ministral-3-8B-Instruct-2512, un transformer denso de 8.000 millones de parámetros con capacidades multimodales (texto e imagen). El adaptador utiliza la técnica LoRA (Low-Rank Adaptation), que introduce matrices de bajo rango en las capas de atención y feed-forward para ajustar el modelo con un coste computacional reducido. El entrenamiento se realizó con la librería PEFT 0.20.0, pero no se han publicado detalles sobre el dataset, el número de pasos, la tasa de aprendizaje ni el régimen de entrenamiento (si se usó RLHF, DPO u otro método). El nombre del adaptador sugiere que se empleó un esquema de recompensa basado en auto-consistencia (`rw-self`) para inducir comportamientos de *sandbagging* y *alignment faking*, pero no hay confirmación técnica en la documentación disponible.

## Capacidades

- Generación de texto y conversación: hereda las capacidades del modelo base Ministral-3-8B-Instruct-2512, que está optimizado para instrucciones y chat.
- Razonamiento y resolución de problemas: el modelo base incluye una variante de razonamiento, aunque este adaptador concreto no especifica si mantiene esas capacidades.
- Visión: el modelo base tiene capacidades multimodales (procesamiento de imágenes), pero no se indica si el adaptador las conserva o las modifica.
- Tool calling y function calling: no se documenta, aunque el modelo base podría soportarlas.
- Comportamiento alterado: por su nombre, el adaptador podría inducir respuestas deliberadamente subóptimas o simuladas, lo que lo hace inadecuado para tareas que requieran fiabilidad.

## Casos de uso

- Investigación en seguridad de IA: el adaptador puede utilizarse para estudiar cómo el *sandbagging* (ocultar capacidades) y el *alignment faking* (fingir alineación) afectan al comportamiento de un modelo instructivo, permitiendo analizar vulnerabilidades en sistemas de evaluación.
- Evaluación de robustez: permite probar si un modelo base puede ser manipulado mediante ajuste fino para degradar su rendimiento en tareas específicas, útil para desarrollar métodos de detección de comportamientos engañosos.
- Desarrollo de contramedidas: los resultados de experimentos con este adaptador pueden informar el diseño de técnicas de alineación más robustas frente a ataques de *fine-tuning* malintencionado.
- Auditoría de modelos: sirve como ejemplo de cómo un adaptador aparentemente inocuo puede alterar el comportamiento de un modelo, relevante para procesos de revisión de modelos publicados en repositorios abiertos.
- Educación y divulgación: puede emplearse en cursos o talleres sobre seguridad en IA para ilustrar conceptos como *sandbagging* y *alignment faking* con un caso práctico.
- Benchmarking de técnicas de alineación: permite comparar la eficacia de diferentes métodos de entrenamiento (RLHF, DPO, etc.) frente a adaptadores diseñados para eludir la alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este adaptador. El rendimiento dependerá del modelo base y de la magnitud de las modificaciones introducidas por el LoRA, pero no hay evidencia cuantitativa.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA, la inferencia requiere cargar el modelo base (8B parámetros) más el adaptador. Con cuantización de 4 bits, se necesitan aproximadamente 6-8 GB de VRAM; en precisión completa (fp16), unos 16 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) para fp16, o GPUs con 8-12 GB si se usa cuantización (por ejemplo, RTX 3060/4070).
- En consumer GPU: sí, cabe en GPUs de gama alta con 16 GB o más, y en GPUs de 8 GB con cuantización.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `transformers` y `peft`. También puede convertirse a GGUF para usarse con llama.cpp u Ollama, aunque no se proporcionan archivos GGUF.
- Latencia y throughput: no disponibles; dependerán del hardware y de la configuración de cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Chengheng/sandbag-ministral3-8b-alignfake-rw-self | 8B (base) + LoRA | No disponible | No disponible | Adaptador LoRA con fines de investigación |
| mistralai/Ministral-3-8B-Instruct-2512 | 8B | No especificado | No disponible | Modelo base instructivo con visión |
| Otros adaptadores LoRA sobre modelos 8B (p. ej., de la comunidad) | Variable | Variable | Variable | Sin datos específicos |

No se dispone de información suficiente para una comparativa rigurosa con alternativas de la misma categoría. El adaptador es único en su propósito declarado (sandbagging/alignment faking), por lo que no hay modelos directamente comparables en el repositorio.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan, pero al ser un adaptador diseñado para alterar el comportamiento, es probable que introduzca sesgos intencionales o no intencionales en las respuestas.
- Riesgo de alucinación: no se ha evaluado; el modelo base puede alucinar, y el adaptador podría aumentar este riesgo si degrada la calidad de las respuestas.
- Limitaciones de contexto e idioma: no se especifican; se heredan del modelo base, pero no hay garantía.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede determinar si es de uso libre, comercial o restringido. Se recomienda contactar al autor antes de cualquier uso.
- Caveat para producción: este adaptador no es apto para entornos de producción debido a la falta de documentación, la ausencia de benchmarks y la naturaleza experimental de su propósito (degradación deliberada de capacidades). Su uso debe limitarse a entornos de investigación controlados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Chengheng/sandbag-ministral3-8b-alignfake-rw-self
- Paper de Ministral 3 (arXiv): https://arxiv.org/html/2601.08584v1
- Documentación de Ministral3 en Transformers: https://huggingface.co/docs/transformers/v5.3.0/model_doc/ministral3
