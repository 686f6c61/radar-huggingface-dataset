# breaksoftware/crivo-150m-GGUF

## Resumen

crivo-150m-GGUF es una version cuantizada en formato GGUF del modelo tardellirs/crivo-150m, publicada por el usuario breaksoftware en HuggingFace. Se trata de un "decision model" de aproximadamente 150 millones de parametros (149.610.241 segun el peso en safetensors) concebido no para generar texto libre, sino para resolver tareas de clasificacion y toma de decisiones estructuradas mediante una API especifica denominada `/v1/systemone`. El modelo recibe un estado textual y un conjunto de preguntas con criterios de eleccion, y devuelve una decision sobre esos criterios.

La relevancia de esta ficha no reside en el tamano del modelo, sino en su naturaleza de "modelo de decision" ligero y en el hecho de que para ejecutarlo con llama.cpp se requieren modificaciones del codigo que todavia no han sido integradas en el repositorio upstream. El autor indica que selecciono crivo-150m por su elevada puntuacion en el indice jev-decision-index en relacion con su numero de parametros. La conversion a GGUF fue realizada por un agente local basado en Qwen3.8 27B, y el repositorio ocupa 0,6 GB.

Se distribuye bajo licencia Apache 2.0, con el pipeline declarado de text-classification, y esta etiquetado como compatible con endpoints. No se especifican los idiomas soportados ni datos de arquitectura detallados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decision / text-classification) |
| Parametros totales | 149.610.241 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; el ejemplo de uso emplea Q8_0; no se detallan otras variantes en la informacion disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se proporcionan detalles sobre la arquitectura interna del modelo base tardellirs/crivo-150m (tipo de transformer, capas, dimensiones de atencion, etc.) ni sobre el proceso de entrenamiento, el volumen de tokens, la composicion del dataset o el uso de tecnicas de alineacion como RLHF o DPO. Toda esa informacion figura como no disponible en los datos consultados.

Lo que si se documenta es su comportamiento funcional: se trata de un modelo de decision que se invoca a traves del endpoint `/v1/systemone`, al cual se le pasa un campo `state` (el contexto o afirmacion) y un objeto `questions` con una o varias preguntas de tipo `choice`, cada una con sus `instructions` y un diccionario `criteria`. El modelo devuelve una eleccion sobre esos criterios. El autor indica que la ejecucion de esta conversion GGUF requiere cambios en llama.cpp basados en el tag b11552 (commit 23b0202a189c44a54625aadcb37a946dd1d6278d), recogidos en el fichero `llama.cpp-required-changes.patch`, probados pero no integrados en upstream, y hace referencia al pull request 29818 del repositorio ggml-org/llama.cpp.

## Capacidades

- Toma de decisiones estructuradas: dado un estado textual y una pregunta de tipo eleccion con criterios definidos, el modelo selecciona una opcion entre los criterios proporcionados.
- Clasificacion de texto: el pipeline declarado es text-classification.
- Extraccion de caracteristicas: entre las etiquetas del repositorio figura feature-extraction.
- Ejecucion mediante llama.cpp a traves del endpoint `/v1/systemone`.
- No se documentan capacidades de generacion de texto libre, razonamiento multi-paso, codigo, matematicas, vision, audio, tool calling ni function calling en la informacion disponible.
- No se documentan capacidades multilingues ni agenticas.

## Casos de uso

- Clasificacion de intenciones en chatbots: el modelo puede recibir el mensaje del usuario como `state` y una pregunta de eleccion con criterios como "consulta de facturacion", "soporte tecnico" o "baja", devolviendo la categoria adecuada para enrutar la conversacion.
- Moderacion de contenido categorica: dado un texto, plantear una eleccion entre criterios como "permitido", "revisable" o "bloqueado" para automatizar el triaje previo a revision humana.
- Etiquetado de tickets de soporte: usar el asunto y el cuerpo del ticket como `state` y elegir entre criterios de prioridad o de equipo responsable, integrandolo en un pipeline de gestion.
- Validacion de respuestas factuales simples: el ejemplo de la model card usa "Paris is the capital of France." como estado y pregunta por el pais, seleccionando "France" entre los criterios, lo que sirve para verificaciones de eleccion acotada.
- Sistemas de decision embebidos y de bajo coste: al ser un modelo de unos 150 millones de parametros y 0,6 GB de repositorio, es adecuado para despliegues en entornos con recursos limitados donde se necesite una eleccion rapida entre opciones predefinidas.
- Preprocesado en pipelines de datos: usar el modelo como clasificador ligero para etiquetar grandes volumenes de registros antes de enviarlos a un modelo mayor, reduciendo el coste computacional.
- Prototipado de agentes de decision: emplear el endpoint `/v1/systemone` como componente de eleccion dentro de un flujo mayor, aprovechando su salida estructurada por criterios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. El autor indica unicamente que escogio crivo-150m por haber obtenido una puntuacion elevada en el indice jev-decision-index (alojado en HuggingFace Spaces) en relacion con su numero de parametros, pero no se aportan cifras concretas.

## Requisitos de hardware

- VRAM estimada: para una cuantizacion Q8_0, en torno a 150-200 MB de pesos, mas el overhead de contexto y del servidor. Al ser un modelo de 149 millones de parametros, la huella es muy reducida.
- El repositorio completo ocupa 0,6 GB.
- Cabe con holgura en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso puede ejecutarse en CPU por su tamano.
- El ejemplo de la model card usa compilacion con soporte Vulkan (`-DGGML_VULKAN=ON`) y descarga directa desde HuggingFace (`llama-server -hf crivo-150m-GGUF:Q8_0 -ngl 999`).
- Opciones de despliegue: llama.cpp y llama-server. Se menciona la aplicacion https://llama.app como forma de ejecucion.
- Importante: la ejecucion con llama.cpp requiere aplicar el parche `llama.cpp-required-changes.patch` basado en el tag b11552, ya que los cambios necesarios no estan integrados en upstream.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables directos en los datos proporcionados. La unica referencia disponible es el modelo base del que deriva esta conversion.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| crivo-150m-GGUF (este) | 149.610.241 | no disponible | apache-2.0 | GGUF | Conversion cuantizada con parche no upstream para llama.cpp |
| tardellirs/crivo-150m | no disponible | no disponible | no disponible | safetensors (base) | Modelo base del que deriva la conversion |

No se dispone de datos de benchmarks que permitan comparar capacidades frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- Requiere modificaciones no integradas en llama.cpp (parche basado en el tag b11552) para funcionar, lo que complica su adopcion en produccion y su mantenimiento a largo plazo.
- Es un modelo de decision, no un modelo generativo de texto libre: su uso esta restringido a la API `/v1/systemone` con preguntas de eleccion y criterios predefinidos.
- No se han publicado datos sobre sesgos, riesgo de alucinacion o comportamientos indeseados del modelo base.
- No hay informacion disponible sobre los idiomas soportados, lo que impide garantizar un rendimiento adecuado fuera del idioma o idiomas con los que fue entrenado.
- No se especifica la longitud de contexto, por lo que no puede garantizarse el manejo de entradas largas.
- El modelo base tardellirs/crivo-150m no tiene licencia indicada en la informacion disponible; aunque esta conversion declara apache-2.0, conviene verificar los terminos del modelo origen antes de un uso comercial.
- El repositorio registra 0 descargas y 1 like, por lo que carece de validacion comunitaria amplia y de casos de uso en produccion documentados.
- Las fechas de creacion y actualizacion del repositorio figuran como 2026-10-12, dato que conviene contrastar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/breaksoftware/crivo-150m-GGUF
- Modelo base: https://huggingface.co/tardellirs/crivo-150m
- Pull request de llama.cpp referenciado: https://github.com/ggml-org/llama.cpp/pull/29818
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Aplicacion de ejecucion mencionada: https://llama.app
- Indice de evaluacion jev-decision-index: https://huggingface.co/spaces/multimodalart/jev-decision-index
- Registros de trayectoria del agente de conversion: agent-trajectory-log-part1-plan.md y agent-trajectory-log-part2-implement.md (incluidos en el repositorio)
- Parche de cambios requeridos: llama.cpp-required-changes.patch (incluido en el repositorio)
