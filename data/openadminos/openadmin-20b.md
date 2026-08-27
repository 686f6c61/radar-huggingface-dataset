# OpenAdminOS/openadmin-20b

## Resumen

OpenAdmin 20B es un modelo de lenguaje especializado en la administración de Microsoft 365, desarrollado por el proyecto OpenAdminOS como parte de su plataforma de agentes de IA local-first para administradores de tenants. Se trata de un fine-tune del modelo open-weight gpt-oss-20b de OpenAI, ajustado mediante QLoRA sobre un conjunto de datos sintéticos y validados mecánicamente. El modelo está diseñado para tareas de lectura y asistencia administrativa: planificación de llamadas a Microsoft Graph con scopes de mínimo privilegio, redacción de manifiestos de agentes, razonamiento sobre flotas de dispositivos y respuesta a preguntas basadas en documentación de Microsoft Learn, con la capacidad de abstenerse cuando la información no está disponible.

Su relevancia radica en que ofrece a los administradores de Microsoft 365 una alternativa local y de código abierto a los modelos propietarios en la nube, manteniendo la privacidad de los datos sensibles del tenant y evitando costes por token. El modelo se distribuye bajo licencia Apache 2.0 y está disponible en formato GGUF para ejecución en equipos con 16 GB de memoria, lo que lo hace accesible para estaciones de trabajo convencionales. Aunque el repositorio principal aún no contiene los pesos en safetensors, el autor ha publicado una versión cuantizada en un repositorio separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en gpt-oss-20b de OpenAI) |
| Parametros totales | 20B (segun nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | MXFP4 (mencionado en el repositorio GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (proximamente), GGUF (disponible) |

## Arquitectura y entrenamiento

El modelo parte de gpt-oss-20b, un modelo open-weight de OpenAI con 20 mil millones de parametros. Sobre esta base se aplico un fine-tune con QLoRA de rango 16, utilizando un conjunto de datos de 499 ejemplos sinteticos publicados en el dataset openadmin-sft. Cada ejemplo fue validado de forma mecanica antes de su inclusion: los manifiestos de agente se validan contra esquemas, los planes de Graph se generan a partir de una tabla curada de endpoints, y los ejemplos de razonamiento incluyen trazas calculadas automaticamente para garantizar la correccion aritmetica. No se utilizaron datos de tenants reales, conversaciones extraidas ni destilacion de APIs propietarias.

El entrenamiento se realizo con QLoRA, lo que reduce significativamente los requisitos de memoria y permite el ajuste en hardware modesto. El modelo resultante conserva las capacidades generales del base, pero esta especializado en el dominio de administracion de Microsoft 365, incluyendo Intune, Entra y Defender.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base gpt-oss-20b.
- Planificacion de llamadas a Microsoft Graph con scopes de minimo privilegio, tanto para endpoints conocidos como para endpoints no vistos durante el entrenamiento.
- Redaccion de manifiestos de agente OpenAdminOS, validados contra esquemas.
- Razonamiento sobre flotas de dispositivos, incluyendo analisis de inventario y estado.
- Respuesta a preguntas basadas en documentacion de Microsoft Learn recuperada, con capacidad de abstencion cuando la informacion no esta en los documentos.
- Soporte para tareas de clasificacion y redaccion de informes en el contexto de administracion de M365.
- No se especifica soporte explicito para tool calling o function calling, aunque la planificacion de Graph implica la generacion de llamadas a API estructuradas.

## Casos de uso

- Asistencia a administradores de Microsoft 365 para consultas sobre configuracion de Intune, Entra o Defender: el modelo puede responder preguntas basadas en documentacion recuperada, reduciendo el tiempo de busqueda en Microsoft Learn.
- Planificacion de cambios en el tenant: dado un objetivo administrativo, el modelo sugiere llamadas a Microsoft Graph con los scopes de minimo privilegio necesarios, lo que ayuda a disenar cambios seguros y auditables.
- Redaccion de manifiestos de agentes para la plataforma OpenAdminOS: el modelo genera manifiestos que definen el comportamiento de agentes locales, validados contra esquemas para evitar errores de sintaxis.
- Razonamiento sobre flotas de dispositivos: el modelo puede analizar listados de dispositivos, identificar patrones o anomalias y generar resumenes utiles para la toma de decisiones.
- Generacion de informes de estado: a partir de datos de inventario o eventos, el modelo redacta informes legibles para revision humana, manteniendo un tono profesional.
- Abstencion controlada: cuando se le pregunta sobre hechos no cubiertos por la documentacion recuperada, el modelo responde "no esta en los docs" en lugar de alucinar, lo que es critico en entornos de produccion donde la precision es obligatoria.

## Benchmarks y rendimiento

El modelo fue evaluado con el conjunto de pruebas OpenAdmin, que consta de 108 tareas puntuadas de forma mecanica (validacion de esquemas, coincidencia exacta, restricciones regex; sin jueces LLM). Las tareas cubren hechos basados en documentacion, abstencion, planificacion de llamadas a Graph (incluyendo endpoints no vistos), redaccion de manifiestos, razonamiento sobre flotas y tono de informes. La evaluacion se realizo en dos condiciones: sin recuperacion y con recuperacion de un indice local de documentacion de Microsoft Learn (Intune, Entra, Defender), que es como se ejecuta en OpenAdminOS.

| Modelo | Sin recuperacion | Con recuperacion |
|---|---|---|
| gpt-oss-20b (base) | 49/108 (45%) | 73/108 (68%) |
| **OpenAdmin 20B** | **69/108 (64%)** | **96/108 (89%)** |

En el detalle por categoria con recuperacion: hechos de documentacion 44/45, abstencion 15/15, razonamiento 21/23 (frente a 11/23 del base). La planificacion de Graph mejoro tanto en endpoints entrenados como en endpoints no vistos. Los resultados completos estan publicados en el dataset openadmin-evals.

## Requisitos de hardware

- El modelo puede ejecutarse en una maquina con 16 GB de memoria en cuantizacion MXFP4, segun el autor. Esto sugiere que cabe en GPUs de consumo con 16 GB de VRAM, como una RTX 4080 o RTX 4090, o incluso en CPU con suficiente RAM.
- Para la cuantizacion MXFP4, se recomienda al menos 16 GB de RAM/VRAM. No se especifican requisitos para otras cuantizaciones.
- Opciones de despliegue: el formato GGUF permite usar llama.cpp, Ollama, LM Studio u otros motores compatibles. Tambien se puede usar vLLM o TGI si se dispone de los pesos en safetensors (aun no publicados).
- No se proporcionan datos de latencia o throughput. Dado el tamano de 20B, se espera una velocidad moderada en hardware de consumo, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos especializados en administracion de Microsoft 365. La unica comparacion disponible es con el modelo base gpt-oss-20b, que se muestra en la tabla de benchmarks. En terminos de tamano, el modelo se situa en la gama de 20B parametros, comparable a otros modelos open-weight como Llama 3.1 8B o Mistral 7B, pero con una especializacion de dominio unica. No se dispone de datos de rendimiento en benchmarks generales (MMLU, HumanEval, etc.) para este fine-tune.

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| OpenAdmin 20B | 20B | no disponible | Apache 2.0 | Administracion M365 |
| gpt-oss-20b (base) | 20B | no disponible | Apache 2.0 | Generalista |
| Llama 3.1 8B | 8B | 128k | Llama 3.1 | Generalista |

## Limitaciones y advertencias

- El modelo esta disenado para tareas de lectura y asistencia, no para realizar cambios directos en el tenant. En OpenAdminOS, toda escritura requiere confirmacion humana, y se recomienda la misma postura en otros entornos.
- Hereda las limitaciones generales del modelo base gpt-oss-20b, incluyendo posibles sesgos y errores de razonamiento en dominios fuera de su especializacion.
- Riesgo de alucinacion si no se usa con recuperacion de documentacion actualizada. El modelo puede dar respuestas incorrectas sobre hechos de productos o licencias si se confia en su memoria parametrica.
- Solo soporta ingles. No se menciona soporte para otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el proyecto no esta afiliado ni respaldado por Microsoft ni OpenAI. Las marcas Microsoft, Intune, Entra y Defender son propiedad de Microsoft Corporation.
- Los pesos en safetensors aun no estan disponibles; solo se ofrece la version GGUF cuantizada. Esto puede limitar el despliegue en motores que requieran el formato original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OpenAdminOS/openadmin-20b
- Repositorio GGUF: https://huggingface.co/OpenAdminOS/openadmin-20b-GGUF
- Dataset de evaluacion: https://huggingface.co/datasets/OpenAdminOS/openadmin-evals
- Dataset de entrenamiento: https://huggingface.co/datasets/OpenAdminOS/openadmin-sft
- Sitio web de OpenAdminOS: https://www.openadminos.com/
- Repositorio GitHub: https://github.com/OpenAdminOS/OpenAdminOS/
- Documentacion del modelo base gpt-oss-20b: https://developers.openai.com/api/docs/models/gpt-oss-20b
