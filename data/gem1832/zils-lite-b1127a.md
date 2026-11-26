# Gem1832/zils-lite-b1127a

## Resumen

zils-lite-b1127a es un modelo de decisión (decision-model) publicado por el usuario Gem1832 en Hugging Face. Se trata de un fine-tune del modelo newsbang/adjudex-0.8b-v4, que a su vez deriva de Qwen/Qwen3.5-0.8B. El modelo está orientado a tareas de adjudicación y decisión: preguntas de elección múltiple, preguntas de sí/no y preguntas con objetivo de puntuación (incluyendo objetivos probabilísticos). Con 852.985.920 parámetros, se sitúa en la categoría de modelos compactos (~0,85B), lo que lo hace desplegable en hardware modesto.

El fine-tune se realizó con un LoRA de rango 32 sobre las capas de lenguaje (posteriormente fusionadas), entrenado sobre aproximadamente 139.000 filas de decisión. Estas filas combinan tareas con licencia comercial procedentes de tasksource y elementos públicos del conjunto Zils Outcomes (arXiv, Wikipedia, Gerrit). La torre de visión se mantiene sin cambios respecto al modelo de partida, lo que sugiere que el modelo base incorpora capacidades multimodales aunque el fine-tune no las modifique.

La relevancia de este modelo es limitada pero específica: se publica bajo licencia Apache-2.0, lo que permite uso comercial, y está especializado en un nicho concreto (adjudicación de decisiones) sobre una base pequeña y eficiente. No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, y la información pública disponible es muy escasa, lo que limita su evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B, con torre de visión en el modelo base; capas de lenguaje ajustadas con LoRA rango 32 fusionado) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se desconoce si existen versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint newsbang/adjudex-0.8b-v4, que a su vez es un fine-tune de Qwen/Qwen3.5-0.8B. La arquitectura subyacente es, por tanto, la de un transformer de la familia Qwen3.5 en su variante de 0,8B parámetros. El ajuste se realizó mediante un LoRA de rango 32 aplicado sobre las capas de lenguaje, que posteriormente se fusionaron en los pesos finales. La torre de visión del modelo de partida se mantiene sin modificar, lo que indica que el modelo base es multimodal y que el fine-tune se centró exclusivamente en las capas de lenguaje.

El entrenamiento utilizó aproximadamente 139.000 filas de decisión. La composición del dataset combina tareas con licencia comercial procedentes de tasksource (preguntas de elección, preguntas de sí/no y preguntas de puntuación, incluyendo objetivos probabilísticos) y elementos públicos del conjunto Zils Outcomes, con fuentes como arXiv, Wikipedia y Gerrit. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento sobre tareas de decisión: el modelo está especializado en preguntas de elección múltiple, preguntas de sí/no y preguntas con objetivo de puntuación o probabilístico.
- Adjudicación de decisiones: orientado a seleccionar, clasificar o puntuar opciones dentro de un conjunto de candidatos.
- Capacidades multimodales heredadas: la torre de visión del modelo base se mantiene intacta, por lo que podría conservar cierta capacidad de procesamiento visual, aunque no se documenta su funcionamiento tras el fine-tune.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas soportados no se especifican.
- Modo de pensamiento (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Adjudicación de respuestas en sistemas de evaluación automática: el modelo puede utilizarse para seleccionar la mejor opción entre varias candidatas generadas por otro modelo, gracias a su entrenamiento específico en preguntas de elección y puntuación.
- Clasificación binaria de contenido: puede emplearse para tareas de sí/no, como moderación de contenido o verificación de afirmaciones, aprovechando su ajuste sobre preguntas de este tipo.
- Puntuación probabilística de candidatos: su entrenamiento con objetivos probabilísticos permite usarlo para asignar probabilidades a opciones en pipelines de ranking o reranking.
- Evaluación de respuestas en entornos de anotación: puede asistir en la selección de anotaciones correctas en flujos de trabajo de etiquetado, dado su enfoque en decisiones discretas.
- Filtrado y priorización en investigación: con fuentes de entrenamiento como arXiv, Wikipedia y Gerrit, puede aplicarse a la selección de resultados relevantes en búsquedas académicas o de código.
- Despliegue en entornos con recursos limitados: con menos de 1B de parámetros y pesos en safetensors de 1,7 GB, es viable en GPU de consumo para tareas de inferencia por lotes o servicios de baja latencia.
- Prototipado rápido de sistemas de decisión: su licencia Apache-2.0 y tamaño reducido facilitan la experimentación en productos comerciales sin costes de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros, en precisión FP16 se requieren aproximadamente 1,7 GB solo para los pesos; en cuantización de 8 bits, alrededor de 0,9 GB; en 4 bits, aproximadamente 0,5 GB. A esto hay que añadir la memoria para el contexto y las activaciones, que no se puede estimar sin conocer la longitud de contexto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (por ejemplo, RTX 3050, GTX 1660 Super, T4). Para cuantizaciones de 4 bits, cabría en GPUs con 2-3 GB, aunque no se documentan versiones cuantizadas.
- ¿Cabe en GPU de consumo? Sí, con holgura en la mayoría de GPUs de consumo modernas (RTX 3060, RTX 4060, RTX 4090) en FP16.
- Opciones de despliegue: al ser un modelo de la familia Qwen, es compatible con frameworks estándar como transformers, vLLM, TGI y llama.cpp (este último requeriría conversión a GGUF, no disponible en el repositorio). Ollama también sería viable previa conversión.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-b1127a | 852.985.920 | no disponible | Apache-2.0 | Hugging Face (0 descargas) | Fine-tune especializado en decisiones |
| newsbang/adjudex-0.8b-v4 | ~0,8B (no confirmado) | no disponible | Apache-2.0 | Hugging Face | Modelo base del que deriva |
| Qwen/Qwen3.5-0.8B | ~0,8B | no disponible | no disponible | Hugging Face | Modelo original de la familia |
| Modelos de decisión especializados de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de comparativas publicadas |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al entrenarse sobre datos de tasksource y Zils Outcomes, puede heredar sesgos presentes en esas fuentes.
- Riesgo de alucinación: presente, como en cualquier modelo de lenguaje; su especialización en decisiones no elimina la posibilidad de generar justificaciones incorrectas.
- Limitaciones de contexto e idioma: se desconoce la longitud de contexto y los idiomas soportados; no hay información que permita confirmar un rendimiento multilingüe.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero el modelo base (newsbang/adjudex-0.8b-v4) y el original (Qwen/Qwen3.5-0.8B) podrían tener condiciones adicionales que no se detallan; se recomienda verificar las licencias de la cadena completa.
- Caveats para producción: el modelo tiene cero descargas y cero likes, lo que indica que no ha sido validado por la comunidad. No hay benchmarks publicados, ni documentación sobre latencia, throughput o estabilidad. La torre de visión se mantiene sin cambios, pero no se documenta si el fine-tune afectó a su comportamiento. El repositorio tiene un tamaño de 1,7 GB, coherente con pesos en FP16, pero no se ofrecen cuantizaciones.
- Fecha de creación: el modelo figura creado el 2026-11-26, una fecha futura respecto a la mayoría de referencias; esto podría indicar un error en los metadatos o una publicación programada.

## Enlaces

- [Hugging Face: Gem1832/zils-lite-b1127a](https://huggingface.co/Gem1832/zils-lite-b1127a)
- [Modelo base: newsbang/adjudex-0.8b-v4](https://huggingface.co/newsbang/adjudex-0.8b-v4)
- [Modelo original: Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
