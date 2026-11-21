# esilva/KapiCoder-Mongo-Nano

## Resumen

KapiCoder-Mongo-Nano es un modelo de autocompletado de codigo especializado en consultas MongoDB, afinado a partir de Qwen/Qwen2.5-Coder-0.5B por el autor esilva. Con aproximadamente 494 millones de parametros, resuelve un problema muy acotado: generar continuaciones fill-in-the-middle (FIM) en el punto del cursor dentro de un editor, incluyendo el caso en que el cursor esta dentro de una llamada `find`, `update` o `aggregate`. El modelo esta disenado para el editor Kapibara Studio, que le envia el texto previo y posterior al cursor junto con una cabecera de contexto (`editor-context-v2`) que incluye el esquema de la coleccion objetivo.

La relevancia de este modelo no reside en su tamano ni en sus capacidades generales, sino en la especializacion: un modelo de 0,5B parametros puede ejecutarse en hardware muy modesto y ofrecer autocompletado contextualizado de consultas MongoDB con tasas de validez sintactica superiores al 95% cuando se le proporciona el esquema. Es un ejemplo de modelo vertical, de dominio estrecho, pensado para incrustarse en una herramienta de desarrollo concreta en lugar de competir en benchmarks generales de razonamiento o codigo.

La version actual corresponde a los pesos v4b (tag `v0.3.0-preview`), que espera el prompt `editor-context-v2` y fue entrenada con una ventana de 8k tokens. El modelo se publica en estado de preview experimental, con evaluacion interna sobre datos sinteticos y sin conjunto ciego escrito por humanos, por lo que el propio autor lo declara no apto para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), fine-tune de Qwen/Qwen2.5-Coder-0.5B |
| Parametros totales | 494.032.768 (segun safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.000 tokens (ventana usada en entrenamiento) |
| Tipos de cuantizacion | No disponible (el repo publica pesos safetensors; no se especifican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (en) y portugues (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-Coder-0.5B, un transformer decoder-only de la familia Qwen2 con 494 millones de parametros, y se afina mediante fine-tuning supervisado para la tarea de FIM en consultas MongoDB. El entrenamiento se realizo con una ventana de 8k tokens y utiliza el contrato de prompt `editor-context-v2`, que anade a la cabecera de contexto del editor una linea `TARGET FIELDS` con los campos y tipos de la coleccion objetivo. La regla de salida del modelo consiste en cerrar el objeto interno que la sugerencia deja abierto, lo que permite insertar la continuacion directamente en el documento sin romper su estructura.

Los datos de entrenamiento son sinteticos, generados por LLM y por gramatica, orientados a MongoDB Console JavaScript (patrones `ConnectionPool.<conn>.<db>.<collection>.find(...)`, `db.<collection>...`, pipelines de agregacion, documentos de update y definiciones de indice) y a pipelines JSON. El autor indica que se realizaron dos ejecuciones de entrenamiento con semillas distintas, y que los pesos publicados corresponden a la primera; no se modifico ninguna regla de la comparacion pre-registrada contra la version v4 entre ambas semillas. No se dispone de informacion sobre el volumen exacto de tokens de entrenamiento ni sobre el uso de RLHF o DPO; el modelo es un fine-tune supervisado orientado a una tarea de autocompletado, no un modelo conversacional.

## Capacidades

- Autocompletado fill-in-the-middle (FIM) de consultas MongoDB en el punto del cursor, con el cursor tanto al final como dentro de una llamada `find`, `update` o `aggregate`.
- Generacion de continuaciones cortas (el editor solicita como maximo 64 tokens) para MongoDB Console JavaScript y pipelines JSON de agregacion.
- Uso del esquema de la coleccion objetivo mediante la linea `TARGET FIELDS` de la cabecera `editor-context-v2`, lo que permite citar campos existentes con mayor fidelidad.
- Regla de cierre del objeto interno abierto por la sugerencia, que facilita la insercion directa en el documento.
- Soporte de los patrones de acceso `ConnectionPool.<conn>.<db>.<collection>`, `db.<collection>`, `getCollection(name).find({})`, `getConnection(name)` y `UUID(value)`.
- Capacidades multilingues limitadas a ingles y portugues en los metadatos del modelo.

No es un modelo de chat, no sigue instrucciones, no mantiene conversaciones, no llama herramientas ni explica codigo. No ejecuta consultas: solo sugiere texto, y la ejecucion corresponde siempre a la aplicacion anfitriona. Tampoco valida las sugerencias: una continuacion puede ser sintacticamente valida y aun asi referirse a campos inexistentes o ser destructiva si se ejecuta.

## Casos de uso

- Autocompletado en el editor Kapibara Studio: el modelo recibe el texto previo y posterior al cursor mas la cabecera `editor-context-v2` y propone una continuacion de hasta 64 tokens; es su caso de uso nativo y para el que fue entrenado.
- Asistencia a desarrolladores en la escritura de consultas MongoDB: al enviar el esquema de la coleccion en la cabecera, el modelo cita campos existentes en el 94,6% de los casos segun la evaluacion interna, lo que reduce errores de nombre de campo durante la edicion.
- Generacion de pipelines de agregacion en JSON: el modelo completa etapas de pipeline en el punto del cursor, util para prototipado rapido de consultas de agregacion en herramientas internas.
- Construccion de documentos de update e indices: el modelo sugiere fragmentos de documentos de actualizacion y definiciones de indice dentro de llamadas ya iniciadas por el usuario.
- Integracion en editores o IDEs propios: cualquier editor que implemente el contrato `editor-context-v2` puede usar el modelo como motor de autocompletado local, dado su tamano reducido y su licencia Apache 2.0.
- Evaluacion y comparacion de estrategias de prompting FIM: el modelo sirve como referencia pequena para medir el efecto de incluir o no el esquema de la coleccion en la cabecera, con metricas de validez sintactica y de fundamentacion de campos.
- Filtrado previo de sugerencias en herramientas de revision: dado que el modelo no ejecuta nada, puede usarse para generar candidatos que una capa posterior valide contra el esquema antes de mostrarlos al usuario.

## Benchmarks y rendimiento

Los resultados proceden de la evaluacion interna del autor sobre datos sinteticos; ninguno esta verificado de forma independiente (`verified: false`).

| Tarea | Conjunto de evaluacion | Metrica | Valor |
|---|---|---|---|
| Autocompletado MongoDB con el cursor dentro de una llamada (`editor-context-v2`) | Suite sintetica cursor-in-call v1 (n=1200, esquemas reservados) | Documento valido tras insertar la sugerencia (64 tokens, post-proceso v2) | 0,9508 |
| Autocompletado MongoDB con el cursor dentro de una llamada (`editor-context-v2`) | Suite sintetica cursor-in-call v1 (n=1200, esquemas reservados) | Operador legal en su posicion (64 tokens, post-proceso v2) | 0,945 |
| Autocompletado MongoDB con el cursor dentro de una llamada (`editor-context-v2`) | Suite sintetica cursor-in-call v1 (n=1200, esquemas reservados) | Campos citados existentes en la coleccion (contexto completo) | 0,9456 |
| Autocompletado FIM (`editor-context-v1`) | Split de validacion KapiCoder v2c (n=2000, interno y sintetico) | Precision FIM (coincidencia exacta normalizada) | 0,3885 |
| Autocompletado FIM (`editor-context-v1`) | Split de validacion KapiCoder v2c (n=2000, interno y sintetico) | Exec-valid (la completacion parsea y se ejecuta en solo lectura) | 0,5635 |
| Autocompletado FIM sobre esquemas no vistos (`editor-context-v1`) | Homologacion sintetica out-of-distribution v1 (n=6030, escrita por LLM y gramatica; no completamente independiente de los datos de entrenamiento) | Precision FIM (coincidencia exacta normalizada) | 0,4167 |
| Autocompletado FIM sobre esquemas no vistos (`editor-context-v1`) | Homologacion sintetica out-of-distribution v1 (n=6030, escrita por LLM y gramatica; no completamente independiente de los datos de entrenamiento) | Exec-valid (la completacion parsea y se ejecuta en solo lectura) | 0,8085 |

Comparaciones declaradas por el autor con la version anterior v3: en la suite cursor-in-call con prompt v2, el documento sigue siendo valido tras la sugerencia en el 95,1% de los casos frente al 83,9% de v3; con el prompt `editor-context-v1` previo, en la homologacion out-of-distribution, la precision FIM es 41,67% frente a 42,34% de v3 y el exec-valid 80,85% frente a 80,20%. Con los campos objetivo en la cabecera, el 94,6% de los campos citados existen; sin cabecera alguna, solo el 42,1% (v3: 44,4%).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 494 millones de parametros, lo que en fp16 supone aproximadamente 1 GB de pesos; con overhead de activaciones y cache KV para una ventana de 8k tokens, el consumo tipico se situa en el rango de 1,5 a 3 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 4090 o RTX 3090 ofrece margen amplio, y una RTX 3060 o superior cubre el caso de uso sin problema. En entornos de servidor, A100 o H100 no son necesarias para este tamano, aunque permitirian alto throughput con batching.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer con 4 GB o mas de VRAM, incluidas GTX 1650 y similares en cuantizacion.
- Opciones de despliegue: transformers con text-generation-inference (el modelo declara compatibilidad con endpoints), vLLM para servir con batching, y llama.cpp u Ollama si se generan pesos GGUF (no se publican en el repo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el tamano y la generacion limitada a 64 tokens, la latencia esperada es baja en hardware consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KapiCoder-Mongo-Nano (v4b) | 494 M | 8k (entrenamiento) | Autocompletado FIM de consultas MongoDB | Apache 2.0 | Hugging Face, tags `v0.3.0-preview`, `v0.2.0-preview`, `v0.1.0-preview` |
| Qwen/Qwen2.5-Coder-0.5B (modelo base) | 494 M | No disponible en la informacion proporcionada | Generacion y autocompletado de codigo general | Apache 2.0 | Hugging Face |
| KapiCoder-Mongo-Nano v3 (`editor-context-v1`) | 494 M | 8k (entrenamiento) | Autocompletado FIM de consultas MongoDB con contrato v1 | Apache 2.0 | Hugging Face, tag `v0.1.0-preview` |
| KapiCoder-Mongo-Nano v4 (`editor-context-v2`) | 494 M | 8k (entrenamiento) | Autocompletado FIM de consultas MongoDB con contrato v2 | Apache 2.0 | Hugging Face, tag `v0.2.0-preview` |

No se dispone de informacion sobre otros modelos especializados en autocompletado de MongoDB con los que comparar directamente.

## Limitaciones y advertencias

- Estado preview experimental: el autor declara explicitamente que el modelo se publica para inspeccion y feedback, no para uso en produccion.
- Evaluacion solo sobre datos sinteticos: no existe conjunto ciego escrito por humanos, y los resultados no estan verificados de forma independiente.
- Dependencia del contrato de prompt: v4b espera `editor-context-v2` (cabecera v1 mas la linea `TARGET FIELDS`) y su regla de salida de cierre del objeto interno; las versiones del editor Kapibara Studio sin `editor-context-v2` rechazan este paquete y deben usar el tag `v0.1.0-preview`.
- Fidelidad de campos dependiente del esquema: sin cabecera de esquema, solo el 42,1% de los campos citados existen; con cabecera, el 94,6%. Es imprescindible validar los nombres de campo antes de ejecutar una sugerencia.
- No es validador: una sugerencia puede ser sintacticamente valida y aun asi incorrecta, referirse a campos inexistentes o ser destructiva si se ejecuta.
- No ejecuta consultas: el modelo solo genera texto; la ejecucion corresponde siempre a la aplicacion anfitriona.
- No es un modelo conversacional ni de agentes: no sigue instrucciones, no mantiene conversaciones, no llama herramientas y no explica codigo.
- Idiomas limitados: los metadatos solo declaran ingles y portugues.
- Datos de entrenamiento no completamente independientes de la evaluacion: el propio autor advierte que el conjunto de homologacion out-of-distribution no es del todo independiente de los datos de entrenamiento.
- Riesgo de alucinacion de campos y operadores: las metricas de fundamentacion de campos y de legalidad de operadores son altas pero no perfectas (94,56% y 94,5% respectivamente en la suite cursor-in-call).
- Sin informacion sobre sesgos: no se han publicado analisis de sesgos en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial con las condiciones habituales de la licencia, pero el estado preview y la falta de validacion humana desaconsejan su uso en produccion sin evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/esilva/KapiCoder-Mongo-Nano
- Modelo base Qwen/Qwen2.5-Coder-0.5B: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B
- Pesos v4 (tag `v0.2.0-preview`): https://huggingface.co/esilva/KapiCoder-Mongo-Nano/tree/v0.2.0-preview
- Pesos v3 (tag `v0.1.0-preview`): https://huggingface.co/esilva/KapiCoder-Mongo-Nano/tree/v0.1.0-preview
- Referencia arXiv citada en los tags (`arxiv:2409.12186`): https://arxiv.org/abs/2409.12186
