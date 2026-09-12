# giromondo/jkappteacher-models

## Resumen

JKAppTeacher judge models es un repositorio de HuggingFace publicado por el usuario giromondo que contiene dos modelos derivados de la familia Qwen3, cuantizados a INT4 en formato OpenVINO. No se trata de modelos entrenados desde cero, sino de exportaciones post-entrenamiento (PTQ) de los pesos originales de Qwen, cuyo proposito declarado es actuar como jueces o correctores automaticos dentro de la aplicacion JKAppTeacher: evaluar si la respuesta de un alumno es correcta o incorrecta, no generar texto nuevo.

El repositorio incluye dos variantes: qwen3-4b-instruct-2507-int4 (2.180 MB) derivada de Qwen/Qwen3-4B-Instruct-2507, y qwen3-8b-int4 (4.626 MB) derivada de Qwen/Qwen3-8B. Ambas emplean cuantizacion simetrica de 4 bits con group-size 128 y sin datos de calibracion (data-free), exportadas con optimum-cli y los entornos openvino-genai 2026.3.1.0 y optimum-intel 2.1.0. La licencia de originales y derivados es Apache-2.0, lo que permite uso comercial.

La relevancia de esta ficha es acotada y conviene ser honesto: se trata de un artefacto para un caso de uso muy especifico (juicio/correccion en un contexto educativo y en dos idiomas), con cero descargas y cero likes en el momento de la consulta, y sin benchmarks generales publicados. Su interes tecnico esta en mostrar un flujo reproducible de cuantizacion INT4 para despliegue en NPU de consumo (Intel AI Boost en Core Ultra 7 258V).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), exportado a OpenVINO IR |
| Parametros totales | 4B (variante qwen3-4b) y 8B (variante qwen3-8b) |
| Parametros activos | No aplica (modelos densos, no MoE) |
| Longitud de contexto | no disponible en la model card (heredada del modelo base Qwen3) |
| Tipos de cuantizacion | INT4 simetrica, group-size 128, data-free (sin datos de calibracion) |
| Idiomas soportados | no disponible (la evaluacion del autor cubre ingles e italiano) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (INT4); no se distribuyen safetensors ni GGUF |

Detalle de las dos variantes incluidas en el repositorio:

| Variante | Modelo base | Tamano | Estrategia de salida | Precision (72) | en | it |
|---|---|---|---|---|---|---|
| qwen3-4b-instruct-2507-int4 | Qwen/Qwen3-4B-Instruct-2507 | 2.180 MB | accept | 61/72 | 36/36 | 25/36 |
| qwen3-8b-int4 | Qwen/Qwen3-8B | 4.626 MB | yesno | 67/72 | 36/36 | 31/36 |

## Arquitectura y entrenamiento

Los modelos base son transformadores densos de la serie Qwen3, con 4B y 8B parametros respectivamente. Sobre ellos no se ha realizado ningun entrenamiento adicional: el trabajo del autor consiste exclusivamente en cuantizacion post-entrenamiento. El comando de exportacion documentado es `optimum-cli export openvino --task text-generation-with-past --weight-format int4 --sym --ratio 1.0 --group-size 128`, lo que produce un grafo OpenVINO IR con cuantizacion de 4 bits simetrica y agrupacion de 128 pesos.

El aspecto mas destacable es que se trata de una cuantizacion data-free, es decir, sin conjunto de calibracion. Esto simplifica el pipeline de conversion pero suele implicar una perdida de precision mayor que la cuantizacion con calibracion. El autor no documenta el numero de tokens de entrenamiento, la composicion del dataset ni si los modelos base incorporan RLHF o DPO, ya que esos datos pertenecen a Qwen y no se reproducen en esta model card.

## Capacidades

- Juicio o clasificacion binaria de respuestas: el proposito declarado es decidir si una respuesta de alumno es correcta o incorrecta, no generar contenido.
- Formato de salida dependiente de la variante: la de 4B rinde mejor con una estrategia "accept" y la de 8B con "yesno", segun la evaluacion del autor.
- Procesamiento bilingue de facto en la evaluacion: el conjunto de prueba cubre ingles (36/36 en ambos modelos) e italiano (25/36 en 4B, 31/36 en 8B).
- Inferencia sobre NPU Intel AI Boost: validado en hardware Core Ultra 7 258V mediante OpenVINO GenAI.
- Soporte de generacion de texto con cache de atencion (task text-generation-with-past), aunque su uso recomendado sea el juicio.
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Correccion automatica de respuestas de alumnos: integrado en la aplicacion JKAppTeacher, el modelo recibe la respuesta del estudiante y emite un veredicto de acierto o error, sustituyendo la revision manual en ejercicios cerrados.
- Evaluacion LLM-as-a-judge en pipelines internos: emplear la variante de 4B o 8B como juez ligero para puntuar salidas de otros modelos en tareas de calidad o coherencia.
- Verificacion de respuestas en sistemas RAG: actuar como filtro que comprueba si una respuesta generada es consistente con la evidencia recuperada, en formato binario.
- Control de calidad en generacion de contenido: clasificar borradores como aceptables o rechazables antes de publicarlos, usando el modelo como puerta de validacion.
- Moderacion o clasificacion binaria de texto: aprovechar la naturaleza de decision si/no para tareas de etiquetado rapido sobre CPU/NPU sin GPU dedicada.
- Evaluacion multilingue en contextos formativos: uso en entornos de aprendizaje en ingles e italiano, con la salvedad de que el rendimiento en italiano es notablemente inferior al de ingles.
- Despliegue en portatiles y equipos de borde: al ocupar 2,2 GB y 4,6 GB, permite ejecutar el juicio de forma local sin conexion a servicios en la nube.

## Benchmarks y rendimiento

El unico dato cuantitativo publicado es la precision en una tarea de juicio sobre un conjunto equilibrado de 72 elementos (mitad correctos, mitad incorrectos; mitad en ingles, mitad en italiano), medida en una NPU Intel AI Boost (Core Ultra 7 258V). No son metricas de rendimiento general.

| Variante | Estrategia | Precision global | Ingles | Italiano |
|---|---|---|---|---|
| qwen3-4b-instruct-2507-int4 | accept | 61/72 | 36/36 | 25/36 |
| qwen3-8b-int4 | yesno | 67/72 | 36/36 | 31/36 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- Huella de pesos: 2.180 MB para la variante de 4B y 4.626 MB para la de 8B, segun los tamanos indicados en la model card.
- Memoria estimada en inferencia: aproximadamente 2,5 GB de RAM/NPU para la variante de 4B y unos 5 GB para la de 8B, sumando overhead del runtime OpenVINO.
- GPU recomendadas: no se especifican; el modelo fue validado en NPU, no en GPU discretas.
- Compatibilidad con hardware de consumo: si; el autor lo ejecuta en una NPU Intel AI Boost integrada en un Core Ultra 7 258V, un portatil de gama alta de consumo.
- Opciones de despliegue: OpenVINO GenAI (version 2026.3.1.0 documentada), con conversion via optimum-intel 2.1.0; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no consumen directamente el formato OpenVINO IR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparacion natural es entre las dos variantes incluidas en el propio repositorio, ya que ambos comparten licencia, formato y tarea.

| Modelo | Parametros | Tamano INT4 | Estrategia | Precision (72) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| qwen3-4b-instruct-2507-int4 | 4B | 2.180 MB | accept | 61/72 | Apache-2.0 | HuggingFace (giromondo) |
| qwen3-8b-int4 | 8B | 4.626 MB | yesno | 67/72 | Apache-2.0 | HuggingFace (giromondo) |
| Qwen/Qwen3-4B-Instruct-2507 (original) | 4B | pesos completos | generacion | no evaluado aqui | Apache-2.0 | HuggingFace (Qwen) |
| Qwen/Qwen3-8B (original) | 8B | pesos completos | generacion | no evaluado aqui | Apache-2.0 | HuggingFace (Qwen) |

La variante de 8B obtiene mejor precision global y en italiano a costa de duplicar el tamano. No se dispone de datos para comparar con otros jueces cuantizados de la misma categoria.

## Limitaciones y advertencias

- Cuantizacion data-free: al no usar datos de calibracion, la perdida de precision puede ser mayor que en esquemas con calibracion, especialmente en idiomas distintos del ingles.
- Evaluacion muy reducida: 72 elementos y solo dos idiomas; los resultados no son extrapolables a otras tareas ni idiomas.
- Brecha de idioma: en italiano la variante de 4B acierta 25/36 y la de 8B 31/36, muy por debajo del 36/36 en ingles.
- Formato de salida fragil: cada variante requiere una estrategia distinta (accept frente a yesno); usar el formato inadecuado puede degradar los resultados.
- Proposito restringido: el autor lo define como modelo de juicio, no de generacion; no hay garantias de calidad en tareas generativas.
- Riesgo de alucinacion: aunque el uso sea clasificatorio, un juez puede emitir veredictos incorrectos o inconsistentes, sin que se documente mitigacion.
- Adopcion nula: cero descargas y cero likes en la fecha de consulta, sin evidencia de uso en produccion por terceros.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe mantener la atribucion a Qwen y al autor de la cuantizacion.
- Dependencia del ecosistema: el formato OpenVINO IR limita su uso a ese runtime; no es portable directamente a otras herramientas.
- Integridad: el autor indica que los sha256 por archivo viven en `models/catalog.json` de la aplicacion, y que las instalaciones se rechazan si no coinciden; fuera de esa app, la verificacion depende de terceros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/giromondo/jkappteacher-models
- Modelo base (variante 4B): https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo base (variante 8B): https://huggingface.co/Qwen/Qwen3-8B
