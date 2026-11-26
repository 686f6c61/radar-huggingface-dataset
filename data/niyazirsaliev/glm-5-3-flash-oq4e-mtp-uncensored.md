# niyazirsaliev/GLM-5.3-Flash-oQ4e-mtp-uncensored

## Resumen

GLM-5.3-Flash-oQ4e-mtp-uncensored es una cuantizacion de 4 bits en formato MLX del modelo multimodal zai-org/GLM-5.3-Flash, publicada por el usuario niyazirsaliev. El modelo base pertenece a la familia GLM-5.3 de Zhipu AI (organizacion zai-org en Hugging Face) y esta orientado a tareas de imagen-texto a texto (image-text-to-text), es decir, procesa entradas multimodales con vision e genera respuestas de texto. Esta version concreta aplica una cuantizacion mixta oQ4e de 4,641 bits por peso, conserva el codificador de vision y la cabeza de prediccion multi-token (MTP), y ha sido sometida a un proceso de "abliteration" para eliminar los rechazos del modelo original.

El resultado es un modelo de aproximadamente 321.300 millones de parametros (segun los pesos safetensors del repositorio) que ocupa unos 187 GB en disco y requiere alrededor de 200 GB de memoria unificada para cargarse, lo que lo situa en el terreno de estaciones de trabajo Apple Silicon de gama alta (Mac Studio con 256 GB). El autor reporta velocidades de generacion de 70 a 95 tokens por segundo en un Mac Studio M5 Ultra con oMLX 0.7.3rc1.

La relevancia de esta ficha es doble: por un lado documenta una tecnica de cuantizacion mixta para modelos de gran tamano en Apple Silicon; por otro, advierte de que se trata de una variante "uncensored" que responde a peticiones que el modelo base rechaza, con las implicaciones eticas y legales que ello conlleva. Es importante senalar que, en el momento de la informacion disponible, el autor indica que los pesos aun no se han subido al repositorio y que la model card describe la build que se publicara.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (GLM-5.3-Flash), con codificador de vision y cabeza de prediccion multi-token (MTP); detalles internos no disponibles |
| Parametros totales | 321.323.031.390 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e (mixed precision, 4,641 bits/peso); formato MLX |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |
| Tamano del repositorio | 186,4 GB |
| Memoria requerida | ~196 GB en carga; ~200 GB de memoria unificada libre |
| Velocidad de generacion | 70-95 tokens/s en Mac Studio M5 Ultra 256 GB |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer multimodal de la familia GLM-5.3 de Zhipu AI, disenado para tareas de imagen-texto a texto. La model card de esta cuantizacion confirma la presencia de un codificador de vision y de una cabeza de prediccion multi-token (MTP), una tecnica de decodificacion especulativa que permite proponer varios tokens por paso para acelerar la generacion. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si el modelo base empleo RLHF, DPO u otras tecnicas de alineacion.

Esta version concreta no ha sido reentrenada: es una cuantizacion del modelo base con una transformacion de "abliteration" que elimina los comportamientos de rechazo. La cuantizacion oQ4e es una variante de precision mixta que asigna distintos numeros de bits a distintas capas segun su sensibilidad, alcanzando una media de 4,641 bits por peso. El autor no documenta que capas reciben mayor precision ni el proceso exacto de abliteration aplicado. Tampoco se detalla si la cabeza MTP se conserva intacta tras la cuantizacion o si se ha ajustado.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Procesamiento de imagen y texto (pipeline image-text-to-text): el codificador de vision se conserva en esta build.
- Razonamiento multi-paso, con un modo de razonamiento interno que el autor menciona al describir el presupuesto de tokens (12.000 tokens para prompts que agotaban tokens razonando).
- Prediccion multi-token (MTP) para acelerar la decodificacion.
- Tool calling: segun el autor, no re-testeado en esta build.
- Contexto largo: mencionado por el autor pero no re-testeado en esta build.
- Respuestas sin rechazo (uncensored): el autor reporta 99 de 100 prompts respondidos en JBB-Behaviors.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion sobre alineacion y rechazo: el modelo permite estudiar como responde un LLM de gran escala cuando se eliminan sus mecanismos de rechazo, comparando con el modelo base en el mismo conjunto de prompts (por ejemplo, JBB-Behaviors).
- Evaluacion de tecnicas de cuantizacion en Apple Silicon: sirve para medir el impacto de oQ4e con MTP en latencia, throughput y calidad frente al modelo en bf16 en hardware MLX.
- Procesamiento multimodal local en estaciones de trabajo: analisis de imagenes y documentos con texto asociado en un Mac Studio de 256 GB, sin depender de servicios en la nube.
- Generacion de codigo y asistencia tecnica: el modelo base GLM-5.3 esta orientado a tareas generales de texto y codigo; esta build puede usarse en entornos controlados donde se requiera ausencia de filtros.
- Redaccion y sintesis de documentos largos: si el contexto largo se confirma, podria emplearse para resumir o extraer informacion de documentos extensos con soporte de imagenes.
- Experimentacion con decodificacion especulativa: la cabeza MTP conservada permite estudiar el rendimiento de la prediccion multi-token en un runtime MLX concreto (oMLX 0.7.3rc1).
- Pruebas de robustez y red-teaming: util para equipos de seguridad que necesiten un modelo que no filtre respuestas y medir la efectividad de sus propios clasificadores de salida.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| JailbreakBench JBB-Behaviors (100 prompts) | 99 respondidos, 1 rechazado, 0 sin respuesta | Heuristica de frases sobre los primeros 300 caracteres, temperatura 0 |
| Build estandar 4-bit (10 prompts propios) | 8 de 10 rechazados | Comparacion del autor |
| Esta build (10 prompts propios) | 0 de 10 rechazados | Comparacion del autor |
| Velocidad de generacion | 70-95 tokens/s | Mac Studio M5 Ultra 256 GB, oMLX 0.7.3rc1 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Memoria unificada: aproximadamente 200 GB libres; en carga ocupa unos 196 GB.
- Almacenamiento: unos 187 GB en disco.
- GPU recomendadas: Apple Silicon de gama alta con 256 GB de memoria unificada (el autor lo prueba en Mac Studio M5 Ultra). No cabe en GPUs consumer convencionales (RTX 4090 con 24 GB, etc.).
- No cabe en consumer GPU de NVIDIA ni AMD de gama alta convencional por el tamano del modelo.
- Opciones de despliegue: runtime MLX (probado en oMLX 0.7.3rc1). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 70-95 tokens/s en el hardware indicado; no se dispone de datos para otros equipos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-oQ4e-mtp-uncensored | 321,3 B | no disponible | oQ4e (MLX) | MIT | Pesos aun no subidos (segun model card) |
| zai-org/GLM-5.3-Flash (base) | no disponible | no disponible | bf16 (original) | MIT | Disponible en Hugging Face |
| Otras cuantizaciones 4-bit del base | no disponible | no disponible | 4-bit estandar | MIT | Segun autor, build estandar 4-bit rechaza 8 de 10 prompts |

No se dispone de datos suficientes para comparar rendimiento (benchmarks de calidad) con alternativas de la misma categoria.

## Limitaciones y advertencias

- Los pesos no estan subidos al repositorio en el momento de la informacion disponible; la model card describe una build futura.
- Modelo "uncensored": responde a peticiones que el modelo base rechaza. El autor declara explicitamente que la responsabilidad de uso recae en el usuario.
- Riesgo elevado de generar contenido danino, ilegal o eticamente problematico; no apto para despliegues de produccion sin capas adicionales de moderacion.
- La evaluacion de rechazos se basa en una heuristica de frases sobre los primeros 300 caracteres y no en un modelo juez; los resultados deben interpretarse con cautela.
- Tool calling, vision y contexto largo no han sido re-testeados en esta build segun el autor.
- Idiomas soportados no documentados.
- Requiere hardware muy especifico (Apple Silicon con 256 GB de memoria unificada); no es desplegable en infraestructura GPU convencional.
- La licencia MIT permite uso comercial, pero el contenido generado puede infringir normativas locales; el usuario asume la responsabilidad legal.
- No se documentan sesgos conocidos del modelo base ni del proceso de abliteration.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/niyazirsaliev/GLM-5.3-Flash-oQ4e-mtp-uncensored
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Repositorio de la libreria MLX: https://github.com/ml-explore/mlx
- JailbreakBench: https://jailbreakbench.github.io/
