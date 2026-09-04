# PJRM/kappa-3-phi-abliterated-Q4_0-GGUF

## Resumen

El modelo `PJRM/kappa-3-phi-abliterated-Q4_0-GGUF` es una cuantizacion en formato GGUF del checkpoint `failspy/kappa-3-phi-abliterated`, realizado por el usuario PJRM mediante la herramienta GGUF-my-repo de ggml.ai. Se trata de un modelo de lenguaje con 3.821.079.552 parametros (aproximadamente 3.820 millones), lo que lo sitúa en la gama de modelos ligeros de menos de 4.000 millones de parametros.

El termino "abliterated" en el nombre del modelo base sugiere que se ha aplicado una tecnica de "ablacion" o eliminacion de las restricciones de seguridad y alineacion originales, aunque no hay documentacion tecnica al respecto. Este checkpoint se distribuye bajo licencia MIT y esta disponible en formato GGUF con cuantizacion Q4_0, lo que permite su ejecucion en entornos locales con recursos modestos mediante herramientas como llama.cpp, llama-server u Ollama.

No se dispone de informacion sobre la arquitectura subyacente, los datos de entrenamiento, la longitud de contexto ni los idiomas soportados, ya que la model card no incluye esos detalles. Por tanto, la ficha se basa exclusivamente en los metadatos publicados y en el propio nombre del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 3.821.079.552 |
| Parametros activos | no disponible (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (formato GGUF) |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna, la composicion del dataset de entrenamiento, el numero de tokens empleados ni las tecnicas de alineacion utilizadas en el modelo original. El unico dato relevante es que el modelo base se denomina `failspy/kappa-3-phi-abliterated`; el sufijo "phi" podria indicar una relacion con la familia Phi de Microsoft, pero no hay confirmacion en los metadatos. El proceso de "abliterated" tampoco esta documentado, por lo que se desconoce si se aplico DPO, RLHF o algun otro metodo de modificacion de pesos.

## Capacidades

No se han publicado listados de capacidades especificas en la informacion disponible. Dado que es un modelo de lenguaje en formato GGUF, se espera que pueda realizar tareas de generacion de texto y conversacion, pero no existen datos verificados sobre sus aptitudes en razonamiento, generacion de codigo, matematicas, tool calling o agentes. Tampoco se dispone de informacion sobre soporte multimodal, pensamiento extendido o funcionalidades especiales.

## Casos de uso

No hay casos de uso documentados en la model card. No obstante, por su tamaño y formato, podria emplearse en escenarios locales de inferencia ligera, como asistentes conversacionales embebidos en aplicaciones de escritorio o prototipos de chatbot. Tambien seria util para experimentacion en entornos con recursos limitados, dado que la cuantizacion Q4_0 reduce la memoria necesaria. Sin embargo, estas aplicaciones son hipotesis basadas en el formato y el tamaño, no en capacidades verificadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras metricas de rendimiento.

## Requisitos de hardware

- VRAM estimada: con cuantizacion Q4_0 y 3.821 millones de parametros, los pesos ocupan aproximadamente 2,2 GB. Teniendo en cuenta el contexto y los buffers de inferencia, se estima un requisito de entre 3 y 4 GB de VRAM.
- GPU recomendadas: cualquier tarjeta con al menos 4 GB de VRAM, como una RTX 3050, RTX 4060 o equivalente. En sistemas Apple, un chip M1 o posterior con 8 GB de memoria unificada deberia ser suficiente.
- Compatibilidad con GPU de consumo: si, el modelo puede ejecutarse en GPUs de gama media y baja.
- Opciones de despliegue: llama.cpp, llama-server, Ollama, LM Studio o cualquier otro software compatible con formato GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Dado que no se conocen los benchmarks de este modelo, la comparativa se limita a caracteristicas generales de tamaño, formato y licencia frente a modelos ligeros en GGUF de parametros similares.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PJRM/kappa-3-phi-abliterated-Q4_0-GGUF | 3.821 millones | no disponible | GGUF (Q4_0) | MIT | HuggingFace |
| afrideva/kappa-3-phi-abliterated-GGUF | 3.821 millones (estimado) | no disponible | GGUF | MIT | HuggingFace |
| Modelo Phi-3 mini (referencia generica) | 3.800 millones | no disponible | no disponible | no disponible | no disponible |

Nota: los datos de los modelos comparables no han sido verificados y se incluyen unicamente como referencia de tamaño.

## Limitaciones y advertencias

- El sufijo "abliterated" indica una posible eliminacion de las restricciones de seguridad del modelo original, lo que podria generar contenido danino, ofensivo o no deseado.
- No existe documentacion sobre sesgos, datos de entrenamiento o comportamientos esperados, por lo que el modelo debe evaluarse con cautela antes de su uso en produccion.
- Riesgo de alucinacion: al ser un modelo de lenguaje generativo sin informacion de entrenamiento publicada, no se pueden garantizar respuestas fiables o factualmente correctas.
- Los idiomas soportados son desconocidos, lo que limita su uso en aplicaciones multilingues.
- La licencia MIT permite uso comercial, pero no se conocen las condiciones de los datos de entrenamiento originales, lo que podria implicar riesgos legales no documentados.

## Enlaces

- https://huggingface.co/PJRM/kappa-3-phi-abliterated-Q4_0-GGUF
- https://huggingface.co/failspy/kappa-3-phi-abliterated (modelo base)
- https://huggingface.co/afrideva/kappa-3-phi-abliterated-GGUF (conversion GGUF alternativa)
