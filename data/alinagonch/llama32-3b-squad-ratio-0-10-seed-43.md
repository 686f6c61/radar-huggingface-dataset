# AlinaGonch/llama32-3b-squad-ratio-0.10-seed-43

## Resumen

El modelo `AlinaGonch/llama32-3b-squad-ratio-0.10-seed-43` es un checkpoint de fine-tuning sobre la base de Llama 3.2 3B, orientado a la tarea de respuesta a preguntas extractiva (QA) sobre el dataset SQuAD 2.0. El nombre del repositorio sugiere que se ha entrenado con una proporción de 0.10 de muestras no respondibles (unanswerable) en el conjunto de entrenamiento, con una semilla fija de 43. Este modelo forma parte de una colección de experimentos creada por AlinaGonch para estudiar el efecto del ratio de preguntas no respondibles en el rendimiento de modelos de lenguaje pequeños.

La model card publicada es una plantilla genérica sin información específica sobre arquitectura, datos de entrenamiento o métricas. El repositorio tiene un tamaño de 0.1 GB, lo que es consistente con un modelo de aproximadamente 3 mil millones de parámetros en precisión reducida, aunque no se confirma oficialmente. A pesar de la escasez de datos, el modelo se enmarca en una línea de investigación práctica sobre cómo ajustar el balance de ejemplos negativos en datasets de QA para mejorar la robustez.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer decoder, similar a Llama 3.2 3B) |
| Parametros totales | no disponible (estimado ~3B, basado en el nombre del modelo) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors, sin detalle de precisión) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags de HuggingFace) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura exacta del modelo. Por el nombre del repositorio, se infiere que parte de Llama 3.2 3B, un modelo transformer decoder-only con atención causal, desarrollado por Meta. El fine-tuning se ha realizado sobre el dataset SQuAD 2.0, que incluye preguntas respondibles y no respondibles, con un ratio de 0.10 de estas últimas en el conjunto de entrenamiento. No se han publicado hiperparámetros, duración del entrenamiento, ni detalles sobre el proceso de ajuste (por ejemplo, si se usó LoRA o fine-tuning completo). La semilla 43 sugiere reproducibilidad, pero no hay documentación adicional.

## Capacidades

- Respuesta a preguntas extractiva sobre pasajes de texto, propia de SQuAD.
- Probablemente maneja preguntas no respondibles, dado el uso de SQuAD 2.0, aunque no se confirma el rendimiento.
- No se ha documentado soporte para tool calling, agentes, razonamiento multi-paso ni capacidades multilingües específicas.
- No se indica soporte de visión, audio u otras modalidades.

## Casos de uso

Dada la falta de información detallada, los casos de uso son hipotéticos y deben validarse con pruebas propias:

- Extracción de respuestas en dominios acotados: el modelo podría emplearse para localizar respuestas literales en documentos técnicos o legales, aprovechando el fine-tuning en SQuAD.
- Sistemas de QA sobre bases de conocimiento internas: integrarlo en un pipeline de recuperación + lectura para responder preguntas factuales a partir de pasajes seleccionados.
- Evaluación de robustez en QA: como parte de experimentos académicos sobre el impacto del ratio de preguntas no respondibles en modelos pequeños.
- Prototipos de asistentes de documentación: para entornos donde se necesite una respuesta rápida y ligera sin depender de APIs externas.
- Investigación en fine-tuning eficiente: el checkpoint sirve como referencia para estudiar el efecto de la semilla y el ratio en el comportamiento del modelo.
- Entrenamiento posterior o destilación: como punto de partida para tareas más complejas, aunque no se garantiza su idoneidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como F1 o EM sobre SQuAD, ni comparaciones con otros modelos.

## Requisitos de hardware

No hay datos oficiales. Para un modelo de ~3B de parámetros, se estima:

- VRAM estimada para inferencia: entre 6 y 8 GB en fp16 (dependiendo del contexto y la implementación). Con cuantización a 8 bits podría reducirse a ~4 GB, y a 4 bits a ~2-3 GB.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM (por ejemplo, RTX 3070/4060, A10, L4). Para producción, una A10 o T4 podría ser suficiente.
- Es probable que quepa en GPUs de consumo como RTX 3090 o 4090, pero no se confirma.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con vLLM, TGI, o mediante llama.cpp si se convierte a GGUF. También se puede usar con Ollama si se exporta a formato adecuado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información para comparar directamente con otros fine-tunes de SQuAD sobre Llama 3.2 3B. Como referencia general, el modelo base Llama 3.2 3B tiene 3B parámetros y una ventana de contexto de 128k tokens (según documentación de Meta), pero este checkpoint concreto podría tener un contexto limitado por el fine-tuning. No se puede establecer una comparativa fiable sin datos.

## Limitaciones y advertencias

- No hay información sobre sesgos, alucinaciones o comportamientos indeseados. Al ser un fine-tuning de SQuAD, es probable que herede los sesgos del dataset original y del modelo base.
- El modelo solo ha sido entrenado para QA extractiva; no se recomienda su uso en tareas generativas abiertas sin evaluación previa.
- La licencia no está especificada, por lo que se desconoce si es permitido su uso comercial. Se debe contactar con el autor o revisar el repositorio original de Llama 3.2 para posibles restricciones.
- El tamaño del repositorio (0.1 GB) sugiere que podría estar en fp16 o cuantizado, pero no se confirma la precisión exacta.
- No se ha validado el modelo en producción; se requiere testing exhaustivo antes de cualquier despliegue real.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AlinaGonch/llama32-3b-squad-ratio-0.10-seed-43
- Colección de experimentos SQuAD ratio: https://huggingface.co/collections/AlinaGonch/squad-dataset-ratio-experiment-llama32-llama31
- Página de Llama 3.2 en Ollama (referencia del modelo base): https://ollama.com/library/llama3.2:3b
- Documentación de Meta sobre Llama 3.2: https://developer.meta.com/ai/docs/model-cards-and-prompt-formats/llama3_2/
