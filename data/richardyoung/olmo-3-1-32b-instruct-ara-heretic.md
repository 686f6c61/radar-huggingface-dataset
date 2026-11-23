# richardyoung/Olmo-3.1-32B-Instruct-ARA-heretic

## Resumen

Olmo-3.1-32B-Instruct-ARA-heretic es una variante "abliterated" (decensored) del modelo allenai/Olmo-3.1-32B-Instruct, publicada por el usuario richardyoung en Hugging Face. El modelo parte de la arquitectura y los pesos del Olmo 3.1 de 32 000 millones de parametros desarrollado por el Allen Institute for AI (Ai2), y le aplica una tecnica de modificacion de pesos orientada a eliminar o atenuar los comportamientos de rechazo y censura aprendidos durante el alineamiento. El resultado es un modelo de generacion de texto conversacional pensado para escenarios donde se requiere una respuesta sin filtros de seguridad predefinidos.

La ficha tecnica disponible es limitada: la model card publica apenas expone metadatos (tags, licencia, modelo base y dataset de referencia) y no incluye detalles sobre el procedimiento exacto de abliteration, los datos de entrenamiento adicionales ni resultados de evaluacion. El repositorio ocupa 64,5 GB en formato safetensors y declara 32 233 522 176 parametros reales. El acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

Su relevancia actual radica en dos factores: por un lado, permite estudiar el comportamiento de un modelo de 32B tras eliminar el alineamiento de seguridad, algo de interes para investigacion en robustez y evaluacion de riesgos; por otro, ofrece a desarrolladores una alternativa sin rechazos para tareas creativas o de generacion de contenido donde los filtros convencionales resultan limitantes, siempre asumiendo las implicaciones eticas y legales de su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Olmo 3.1 de Ai2); detalles de atencion y capas no disponibles |
| Parametros totales | 32 233 522 176 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors en el repo) |
| Idiomas soportados | Ingles (segun la model card; el modelo base podria soportar mas, pero no se declara) |
| Licencia | Apache 2.0 (segun tags; el acceso esta gated) |
| Formato de pesos | Safetensors |
| Tamano del repositorio | 64,5 GB |
| Modelo base | allenai/Olmo-3.1-32B-Instruct |
| Dataset de referencia | allenai/Dolci-Instruct-RL |
| Acceso | Restringido (gated), requiere aceptar condiciones |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Olmo 3.1-32B-Instruct de Ai2, un transformer decoder-only denso de 32 000 millones de parametros. No se dispone de informacion detallada en la model card sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni estrategia de posicionamiento. Tampoco se especifica la longitud de contexto nativa del modelo base en la informacion proporcionada.

El proceso de "heretic" o abliteration consiste en identificar las direcciones en el espacio de activaciones asociadas a comportamientos de rechazo y proyectarlas fuera de los pesos del modelo, de modo que se preserva la capacidad generativa general mientras se eliminan las respuestas de negativa. La model card no documenta la metodologia exacta aplicada (que capas se modifican, que conjunto de prompts de calibracion se usa, ni el grado de intervencion). Tampoco se indica si hubo un fine-tuning adicional sobre el dataset Dolci-Instruct-RL mencionado en los tags, ni si se realizo RLHF o DPO posterior. La etiqueta "reproducible" sugiere que el autor pretende documentar el procedimiento, pero los detalles no estan disponibles en la informacion consultada.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento general y respuesta a instrucciones, heredado del Olmo 3.1-32B-Instruct.
- Generacion de codigo y matematicas (capacidad del modelo base, no verificada en esta variante).
- Respuestas sin rechazo ante solicitudes que el modelo base rechazaria por politicas de seguridad.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingues: solo se declara ingles.
- Capacidades de vision o audio: no disponibles.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Investigacion en seguridad y alineamiento: comparar las respuestas del modelo heretic con las del Olmo 3.1-32B-Instruct original permite medir el efecto de la abliteration sobre tasas de rechazo, calidad y sesgos, usando el mismo prompt set en ambos modelos.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que aborde temas sensibles (violencia, conflicto, temas adultos) donde los filtros del modelo base interrumpen la generacion. El tamano de 32B permite mantener coherencia en textos largos.
- Red teaming de sistemas: emplear el modelo como generador adversario para producir prompts y respuestas que pongan a prueba clasificadores de seguridad o filtros de moderacion en pipelines de produccion.
- Analisis de contenido sensible: resumir o clasificar documentos con lenguaje explicito (informes forenses, transcripciones, literatura) donde un modelo censurado podria negarse o degradar la respuesta.
- Prototipado de asistentes especializados: construir asistentes de dominio (legal, medico, seguridad) que requieran discutir escenarios crudos sin que el modelo derive la conversacion hacia advertencias genericas.
- Evaluacion comparativa de modelos abliterated: usar esta variante como referencia en estudios que comparan distintas tecnicas de decensoring (abliteration, DPO inverso, fine-tuning con datos sin filtro) sobre una misma base de 32B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 64 GB solo para pesos, mas overhead de KV cache; se recomienda un minimo de 80 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 32-36 GB, viable en una A100 40GB o H100.
- VRAM estimada en cuantizacion de 4 bits: en torno a 18-22 GB, viable en una RTX 4090 (24 GB) con contexto moderado.
- GPU recomendadas: A100 80GB, H100 80GB para precision completa; A100 40GB o L40S para 8 bits; RTX 4090 o RTX 3090 para 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizacion de 4 bits y contexto limitado; no en FP16.
- Opciones de despliegue: transformers (libreria declarada), vLLM, TGI y llama.cpp/Ollama previa conversion a GGUF (no se publican pesos GGUF en el repo, habria que convertirlos).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| richardyoung/Olmo-3.1-32B-Instruct-ARA-heretic | 32,2B | No disponible | Apache 2.0 | Gated | Variante abliterated del Olmo 3.1 |
| allenai/Olmo-3.1-32B-Instruct | 32,2B | No disponible | Apache 2.0 | Abierto (modelo base) | Version alineada y con filtros de seguridad |
| Otras variantes heretic/abliterated de 32B | Depende del modelo base | Depende | Depende | Variable | Existen variantes sobre Llama, Qwen y Mistral, pero no se dispone de datos comparativos en la informacion proporcionada |

No se dispone de resultados de benchmarks que permitan comparar rendimiento entre estas opciones.

## Limitaciones y advertencias

- La abliteration suele degradar ligeramente la coherencia y la calidad general del modelo en tareas benignas; no se han publicado evaluaciones que cuantifiquen esa perdida en esta variante.
- Riesgo elevado de alucinacion y de generar contenido danino, ilegal o sexualmente explicito; no apto para produccion sin moderacion externa.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta verificado.
- La model card no documenta la metodologia de abliteration ni los datos usados, lo que dificulta la reproducibilidad y la auditoria.
- Licencia Apache 2.0 declarada en los tags, pero el acceso es gated y el autor puede imponer condiciones adicionales al aceptar el acceso; conviene revisar los terminos antes de uso comercial.
- El modelo base Olmo 3.1 puede tener sus propios sesgos y limitaciones de contexto; esta variante no los corrige y puede amplificarlos al eliminar rechazos.
- Uso en produccion desaconsejado sin un clasificador de salida y politicas de uso claras; la ausencia de filtros internos traslada toda la responsabilidad al operador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Olmo-3.1-32B-Instruct-ARA-heretic
- Modelo base: https://huggingface.co/allenai/Olmo-3.1-32B-Instruct
- Dataset de referencia: https://huggingface.co/datasets/allenai/Dolci-Instruct-RL
- Paper referenciado en tags (arXiv 2512.13961): https://arxiv.org/abs/2512.13961
