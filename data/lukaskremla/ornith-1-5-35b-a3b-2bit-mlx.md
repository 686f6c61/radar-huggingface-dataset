# lukaskremla/Ornith-1.5-35B-A3B-2bit-MLX

## Resumen

Ornith-1.5-35B-A3B es un modelo multimodal de lenguaje y visión desarrollado por ornith-ai, diseñado para tareas agénticas con un bucle de auto-mejora: el propio modelo propone nuevas tareas, genera andamiajes específicos y produce rollouts de solución para aprendizaje por refuerzo. Esta versión concreta, publicada por lukaskremla, es una cuantización a 2 bits en formato MLX del modelo original, pensada para ejecutarse eficientemente en Apple Silicon mediante la librería mlx-vlm. La cuantización preserva la torre de visión en BF16, manteniendo las capacidades multimodales del modelo base.

El modelo base emplea una arquitectura MoE (Mixture of Experts) de 35 mil millones de parámetros totales con 3 mil millones activos por token, basada en la familia Qwen3.5 MoE. Ofrece una ventana de contexto de 262.000 tokens, modo de razonamiento explícito, soporte de tool calling y capacidades de procesamiento de imagen y vídeo. Esta cuantización 2-bit reduce el peso del modelo a aproximadamente 11,8 GB, lo que permite su ejecución en equipos con memoria unificada moderada, aunque con la consiguiente pérdida de precisión asociada a una cuantización tan agresiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.5 MoE, con torre de vision |
| Parametros totales | 35B (el conteo mostrado por HuggingFace de 3.7B es un bug de visualizacion comun en quants MLX) |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | 262.000 tokens |
| Tipos de cuantizacion | 2-bit, weight-only, RTN, group-size 64; torre de vision en BF16 |
| Idiomas soportados | Multilingue (lista especifica no disponible) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B utiliza una arquitectura de mezcla de expertos (MoE) con 35.000 millones de parametros totales y 3.000 millones activos por token, siguiendo el diseño de la familia Qwen3.5 MoE. Es un modelo multimodal que procesa texto, imagen y video, con una torre de vision integrada. La innovacion principal de Ornith-1.5 reside en su bucle de auto-mejora: el modelo propone nuevas tareas, genera andamiajes especificos para cada tarea y produce rollouts de solucion que se utilizan para aprendizaje por refuerzo, creando continuamente nuevas experiencias de aprendizaje. Este enfoque extiende el marco de auto-andamiaje introducido en Ornith-1.0.

Los detalles del entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada. La cuantizacion a 2 bits se realizo con mlx-vlm version 0.6.17, utilizando cuantizacion weight-only con RTN (round-to-nearest) y grupo de 64, preservando la torre de vision en BF16 para no degradar las capacidades visuales.

## Capacidades

- Generacion de texto, razonamiento complejo y resolucion de problemas con modo de razonamiento explicito que mejora el rendimiento en tareas dificiles a costa de mayor latencia y consumo de tokens.
- Procesamiento multimodal de imagen y video, con capacidad de responder a consultas sobre contenido visual.
- Soporte de tool calling y function calling, permitiendo integracion con APIs y herramientas externas.
- Capacidades agénticas: puede actuar como agente autonomo, planificando y ejecutando pasos multiples.
- Auto-mejora: el modelo puede proponer tareas, generar andamiajes y producir soluciones para su propio entrenamiento.
- Multilingue, aunque la lista de idiomas soportados no se especifica en la documentacion disponible.
- Contexto largo de 262.000 tokens, adecuado para documentos extensos y conversaciones prolongadas.

## Casos de uso

- Agentes autonomos de proposito general: el modelo puede planificar y ejecutar tareas complejas de multiples pasos, utilizando tool calling para interactuar con APIs, bases de datos o servicios web. Su modo de razonamiento explicito permite desglosar problemas complejos en subproblemas manejables.
- Analisis de documentos largos con contenido visual: gracias a su ventana de contexto de 262.000 tokens y su capacidad multimodal, puede procesar informes extensos que incluyan graficos, tablas e imagenes, extrayendo informacion relevante y respondiendo preguntas sobre el contenido.
- Asistentes conversacionales multilingues con memoria prolongada: la combinacion de contexto largo y capacidades multilingues permite mantener conversaciones extensas con usuarios de diferentes idiomas, recordando informacion de turnos anteriores.
- Generacion de codigo asistida con integracion de herramientas: el soporte de tool calling permite al modelo generar codigo, ejecutarlo en un entorno controlado y corregir errores basandose en la salida, integrándose en pipelines de desarrollo.
- Investigacion en auto-mejora de modelos: el bucle de auto-andamiaje de Ornith-1.5 lo convierte en una plataforma interesante para experimentos de aprendizaje por refuerzo y generacion de datos sinteticos.
- Procesamiento de video para resumen y analisis: la capacidad de procesar video permite generar resumenes, detectar eventos o responder preguntas sobre contenido audiovisual, util en tareas de vigilancia, educacion o produccion multimedia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La pagina de BenchLM menciona que el modelo tiene una ventana de contexto de 262K y un modo de razonamiento explicito, pero no proporciona cifras concretas de rendimiento en tareas estandar como MMLU, HumanEval o GSM8K. Tampoco se dispone de comparativas con otros modelos en la documentacion consultada.

## Requisitos de hardware

- Al ser una cuantizacion MLX, esta optimizada para Apple Silicon (M1, M2, M3, M4 y posteriores) con memoria unificada.
- El tamano del repositorio es de 11,8 GB, por lo que se recomienda un minimo de 16 GB de memoria unificada para cargar el modelo completo con margen para el contexto y las activaciones.
- En equipos con 32 GB o mas, se puede utilizar la ventana de contexto completa de 262K tokens sin problemas de memoria.
- La torre de vision en BF16 anade requisitos adicionales de memoria en comparacion con la version solo texto.
- Despliegue recomendado mediante mlx-vlm, que es la libreria utilizada para la conversion. Tambien se puede usar con MLX LM si se necesita solo texto.
- No se dispone de datos de latencia o throughput especificos para esta cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (base) | 35B totales, 3B activos | 262K | MIT | safetensors (BF16) | Modelo original sin cuantizar, requiere ~70 GB de memoria |
| Ornith-1.5-35B-A3B-MLX (oficial) | 35B totales, 3B activos | 262K | MIT | MLX | Version MLX oficial de ornith-ai, cuantizacion no especificada |
| lukaskremla/Ornith-1.5-35B-A3B-2bit-MLX | 35B totales, 3B activos | 262K | MIT | MLX 2-bit | Cuantizacion agresiva, 11,8 GB, torre de vision BF16 |

No se dispone de datos de rendimiento comparativo entre estas versiones. La cuantizacion 2-bit reduce significativamente los requisitos de memoria (de ~70 GB a ~12 GB), pero probablemente degrade la calidad de las respuestas en tareas complejas. Para uso en produccion, se recomienda evaluar la version base o una cuantizacion menos agresiva si la precision es critica.

## Limitaciones y advertencias

- La cuantizacion a 2 bits es extremadamente agresiva y puede provocar una degradacion notable en la calidad de generacion, especialmente en tareas de razonamiento complejo, generacion de codigo y comprension visual.
- El modelo esta limitado a Apple Silicon; no se puede ejecutar en GPUs NVIDIA o AMD sin convertir los pesos a otro formato (por ejemplo, GGUF), lo que no esta incluido en este repositorio.
- El modo de razonamiento explicito aumenta la latencia y el consumo de tokens, lo que puede encarecer el despliegue en produccion.
- No se han publicado benchmarks que permitan cuantificar el rendimiento real de esta cuantizacion en tareas estandar.
- Aunque la licencia es MIT, el modelo base puede tener restricciones adicionales no documentadas en la informacion disponible; se recomienda revisar la documentacion oficial de ornith-ai antes de uso comercial.
- Como todo modelo de lenguaje, existe riesgo de alucinacion y de generar contenido incorrecto o sesgado. La cuantizacion agresiva puede aumentar estos riesgos.
- El modelo tiene capacidades de auto-mejora que, si se activan, requieren infraestructura adicional de entrenamiento y no estan disponibles en la version cuantizada.

## Enlaces

- [Modelo cuantizado en HuggingFace](https://huggingface.co/lukaskremla/Ornith-1.5-35B-A3B-2bit-MLX)
- [Modelo base ornith-ai/Ornith-1.5-35B-A3B](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B)
- [Version MLX oficial de ornith-ai](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-MLX)
- [Repositorio GitHub de Ornith-1](https://github.com/ornith-ai/Ornith-1)
- [Pagina del proyecto Ornith-1.5](https://ornith.ai/ornith_1_5.html)
- [Ficha en BenchLM](https://benchlm.ai/models/ornith-1-5-35b-a3b)
- [Version solo texto de esta cuantizacion](https://huggingface.co/lukaskremla/Ornith-1.5-35B-A3B-2bit-MLX-TextOnly)
- [Coleccion de quants MLX de Ornith 1.5](https://huggingface.co/collections/lukaskremla/ornith-15-35b-a3b-mlx-quants-vision-text-only-and-mtp)
