# olaverse/MIST-QG-1.1-GGUF

## Resumen

MIST-QG-1.1-GGUF es la distribucion en formato GGUF de MIST-QG-1.1, un modelo de generacion de preguntas desarrollado por Olaverse. Su tarea es concreta: recibe un pasaje de texto y produce las preguntas que ese pasaje responde, con control explicito sobre el idioma de salida y, opcionalmente, sobre el numero de preguntas. El modelo base declara cobertura de 324 idiomas y capacidad de direccionamiento cruzado entre idiomas (pasaje en un idioma, preguntas en otro).

El modelo base tiene 4.205.751.296 parametros, lo que lo situa en la categoria de modelos de aproximadamente 4B, adecuados para ejecucion local. Esta variante GGUF esta pensada para llama.cpp y todo lo construido sobre el (Ollama, LM Studio, llama-cpp-python), con cuantizaciones generadas mediante una importance matrix calculada a partir de prompts y respuestas de MIST-QG en unos 300 idiomas, de modo que la perdida por cuantizacion se concentre fuera de las capacidades relevantes para la tarea.

La relevancia practica del modelo esta en la generacion de datos sinteticos para recuperacion de informacion: producir pares pregunta-respuesta a partir de corpus para entrenar o evaluar sistemas RAG, y hacerlo de forma multilingue con un modelo pequeno, con licencia Apache-2.0 y ejecutable en CPU. El repositorio GGUF ocupa 26,9 GB e incluye siete cuantizaciones mas la matriz de importancia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de 4.205.751.296 parametros; la model card no detalla la arquitectura) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4.096 tokens recomendados por el autor para un pasaje de ~2.000 caracteres y sus preguntas |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, Q3_K_M, BF16 (mas fichero imatrix) |
| Idiomas soportados | 324 idiomas (segun la model card); etiqueta `multilingual` |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

Tabla de ficheros publicados:

| Fichero | Cuantizacion | Tamano | Uso indicado por el autor |
|---|---|---|---|
| `MIST-QG-1.1-Q8_0.gguf` | Q8_0 | 4,5 GB | Mejor calidad, practicamente identico a los pesos originales |
| `MIST-QG-1.1-Q6_K.gguf` | Q6_K | 3,5 GB | Muy cercano a Q8_0 con menor tamano |
| `MIST-QG-1.1-Q5_K_M.gguf` | Q5_K_M | 3,1 GB | Calidad alta |
| `MIST-QG-1.1-Q4_K_M.gguf` | Q4_K_M | 2,7 GB | Opcion por defecto recomendada para portatiles y CPU |
| `MIST-QG-1.1-IQ4_XS.gguf` | IQ4_XS | 2,5 GB | 4 bits mas pequeno, para memoria ajustada |
| `MIST-QG-1.1-Q3_K_M.gguf` | Q3_K_M | 2,3 GB | El mas pequeno; mas repeticion, para borradores rapidos |
| `MIST-QG-1.1-BF16.gguf` | BF16 | 8,4 GB | Precision completa, para crear cuantizaciones propias |
| `MIST-QG-1.1.imatrix.gguf` | - | no disponible | Matriz de importancia para generar otras cuantizaciones |

## Arquitectura y entrenamiento

La model card del repositorio GGUF no describe la arquitectura interna del modelo base: no se indica si es un transformer denso, un MoE ni detalles de atencion. Lo unico verificable es el recuento de parametros (4.205.751.296) y la naturaleza del modelo como generador de texto con formato de prompt en texto plano, sin plantilla de chat.

El dato tecnico destacable de esta publicacion es el proceso de cuantizacion. Todas las versiones cuantizadas se generaron con una importance matrix calculada a partir de prompts y respuestas de MIST-QG en aproximadamente 300 idiomas, mas ejemplos cruzados entre idiomas. Esto implica que la calibracion de la cuantizacion no se hizo con texto generico, sino con la distribucion real de la tarea, incluyendo su componente multilingue. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset, ni uso de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de preguntas a partir de un pasaje: el modelo escribe las preguntas que el texto responde, reformuladas con sus propias palabras.
- Control del idioma de salida: el usuario especifica el idioma de las preguntas de forma explicita en el prompt (nombre del idioma escrito completo, en ingles).
- Direccionamiento cruzado entre idiomas: pasaje en un idioma y preguntas en otro, segun el ejemplo de la model card (pasaje en yoruba o hausa, preguntas en ingles).
- Cobertura declarada de 324 idiomas.
- Control del numero de preguntas: se puede pedir un numero concreto sustituyendo la linea final del prompt (por ejemplo, `3 questions in <idioma>...`).
- Salida estructurada sencilla: una pregunta por linea, cada una precedida de `- `, y parada automatica tras la ultima.
- Generacion de texto de proposito general limitada: la etiqueta `text-generation` aplica, pero el modelo esta especializado en la tarea de generacion de preguntas.
- No se documenta soporte de tool calling, function calling, modo agente, vision ni audio.

## Casos de uso

- Generacion de datos sinteticos para RAG: dado un corpus de documentos, el modelo produce preguntas que cada fragmento responde; esos pares pregunta-pasaje sirven para entrenar retrievers o para construir conjuntos de evaluacion de recuperacion. La ventana de 4.096 tokens cubre pasajes de hasta ~2.000 caracteres con margen para las preguntas.
- Evaluacion multilingue de sistemas de recuperacion: con soporte declarado de 324 idiomas y direccionamiento cruzado, se pueden generar preguntas en un idioma sobre pasajes en otro y medir si el retriever encuentra el fragmento correcto en escenarios cross-lingual.
- Aumento de datasets de QA existentes: a partir de pasajes ya anotados se generan preguntas adicionales con distinta formulacion, ampliando la cobertura lexica del conjunto de entrenamiento sin anotacion manual.
- Ejecucion local en portatiles y CPU: con `Q4_K_M` (2,7 GB) el modelo cabe en equipos sin GPU dedicada, lo que permite generar preguntas en local sin enviar el corpus a un servicio externo, relevante para datos sensibles.
- Integracion en aplicaciones de escritorio: al ser GGUF compatible con Ollama y LM Studio, se puede incorporar a herramientas de escritorio que necesiten proponer preguntas sobre un texto pegado por el usuario (por ejemplo, generacion de tarjetas de estudio o de preguntas de autoevaluacion).
- Preprocesado por lotes en pipelines de datos: para volumenes moderados, llama.cpp o llama-cpp-python permiten procesar lotes de pasajes con el prompt en texto plano y parsear la salida linea a linea; el autor advierte que para millones de pasajes en GPU conviene usar los pesos originales con vLLM por throughput.
- Generacion de consultas de busqueda a partir de documentacion tecnica: el modelo puede producir formulaciones de consulta que un fragmento de manual responde, utiles para construir conjuntos de consultas de prueba en buscadores internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta variante GGUF remite a la model card del modelo base (`olaverse/MIST-QG-1.1`) para los benchmarks y detalles completos, pero esos datos no forman parte de la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: BF16 8,4 GB; Q8_0 4,5 GB; Q6_K 3,5 GB; Q5_K_M 3,1 GB; Q4_K_M 2,7 GB; IQ4_XS 2,5 GB; Q3_K_M 2,3 GB. A estas cifras hay que sumar el contexto (4.096 tokens) y el overhead de llama.cpp.
- GPU recomendadas: no especificadas por el autor. Por tamano, cualquier GPU consumer con 6-8 GB o mas de VRAM puede alojar las cuantizaciones de 4 a 6 bits con contexto completo; una RTX 4090 o similar permite ademas las versiones Q8_0 y BF16 con holgura. A100 y H100 no son necesarias para esta variante; el autor recomienda vLLM con los pesos originales para generacion a gran escala en GPU.
- Cabida en GPU consumer: si. Las cuantizaciones Q4_K_M, IQ4_XS y Q3_K_M (2,3-2,7 GB) caben en practicamente cualquier GPU consumer moderna e incluso en equipos integrados; Q8_0 y BF16 requieren GPU de gama media-alta o mas VRAM.
- Despliegue: llama.cpp (`llama-completion`), llama-cpp-python, Ollama, LM Studio y cualquier runtime basado en llama.cpp. Para alto throughput en GPU, el autor remite a los pesos originales con vLLM.
- Latencia y throughput: no disponibles. El autor solo indica cualitativamente que los pesos originales con vLLM ofrecen un throughput muy superior para millones de pasajes.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de generacion de preguntas ni datos de rendimiento que permitan una comparacion fundamentada. Como referencia estructural, el propio autor distingue entre esta variante GGUF (orientada a portatiles, CPU y aplicaciones locales) y los pesos originales de MIST-QG-1.1 con vLLM (orientados a generacion masiva en GPU), pero no se aportan cifras comparativas.

## Limitaciones y advertencias

- Modelo especializado: no es un asistente general. Su uso previsto es la generacion de preguntas a partir de pasajes; fuera de esa tarea el rendimiento no esta documentado.
- Prompt sin plantilla de chat: hay que escribir el prompt exactamente en el formato indicado, con los nombres de idioma completos y en ingles. Un formato distinto puede degradar la salida.
- Decodificacion greedy desaconsejada: el autor advierte que temperature 0 puede provocar repeticion de la misma pregunta, especialmente con los ficheros mas pequenos. Recomienda temperature 0.3 y top-p 0.9.
- Perdida de calidad en cuantizaciones bajas: Q3_K_M presenta "notablemente mas repeticion" segun el autor; se recomienda solo para borradores rapidos.
- Riesgo de alucinacion: no documentado de forma explicita en la informacion disponible, pero al tratarse de un modelo generativo de 4B que reformula preguntas "con sus propias palabras", existe riesgo de que algunas preguntas no esten respaldadas por el pasaje. No se aportan tasas de error.
- Sesgos: no documentados en la informacion disponible. La cobertura de 324 idiomas no implica calidad uniforme entre idiomas, y no se aportan evaluaciones por idioma.
- Contexto limitado: 4.096 tokens recomendados; pasajes muy largos requieren truncado o troceado.
- Licencia: Apache-2.0, que permite uso comercial y modificacion con las obligaciones habituales de atribucion y aviso de licencia. No se documentan restricciones adicionales.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la model card no incluye benchmarks propios de esta variante; conviene validar la calidad en el dominio concreto antes de usarlo en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/olaverse/MIST-QG-1.1-GGUF
- Modelo base: https://huggingface.co/olaverse/MIST-QG-1.1
- Coleccion MIST-QG 1.1: https://huggingface.co/collections/olaverse/mist-qg-11-6af865b79564cce97c1f0a1
