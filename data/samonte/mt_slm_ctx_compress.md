# Samonte/mt_slm_ctx_compress

## Resumen

mt_slm_ctx_compress es un modelo de lenguaje especializado publicado por el usuario Samonte en HuggingFace, derivado del modelo base ibm-granite/granite-4.0-h-micro de IBM (Apache 2.0). Su proposito concreto es la compactacion de sesiones de agentes de programacion: recibe sesiones de hasta 120.000 tokens y genera un resumen estructurado con nueve encabezados predefinidos. No es un modelo de proposito general, sino una adaptacion afinada para una tarea acotada dentro de la arena `ctx_compress` de la plataforma Microtensor.

El modelo se ha obtenido mediante un ajuste LoRA con rango 64 fusionado en bf16 sobre el modelo base, y cuenta con 3.191.396.096 parametros totales segun los pesos en safetensors. El repositorio ocupa 25,5 GB, lo que sugiere que incluye no solo los pesos fusionados sino tambien artefactos de entrenamiento y validacion bajo el directorio `training/`.

Su relevancia actual es limitada pero especifica: responde a la necesidad creciente de comprimir el estado de sesiones largas de agentes de codigo para que quepan en ventanas de contexto reducidas o para persistir memoria entre interacciones. La licencia `microtensor-submission` restringe el uso a los terminos de Microtensor, lo que condiciona su adopcion fuera de ese ecosistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | granitemoehybrid (hibrida MoE, segun tag del repositorio) |
| Parametros totales | 3.191.396.096 |
| Parametros activos | no disponible |
| Longitud de contexto | 120.000 tokens (entrada de sesion, segun model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | microtensor-submission (terminos en microtensor.cloud/terms) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base ibm-granite/granite-4.0-h-micro, etiquetada en el repositorio como `granitemoehybrid`, lo que indica una combinacion de mezcla de expertos con componentes hibridos (probablemente atencion y capas recurrentes o de estado). No se dispone de detalles adicionales sobre el numero de expertos, la dimension oculta ni la distribucion exacta de parametros activos.

El ajuste se realizo mediante LoRA con rango 64, posteriormente fusionado en precision bf16. Los datos de entrenamiento provienen del generador propio de la arena (`microtensor-io/microtensor-arenas`, fichero `arenas/compress/synth.py`) bajo semillas privadas, por lo que la composicion exacta del dataset no es publica. No se documenta el uso de RLHF ni DPO. La tarea de entrenamiento es la generacion de un resumen de compactacion con nueve encabezados fijos a partir de sesiones de agente de hasta 120.000 tokens.

## Capacidades

- Compactacion de sesiones de agentes de programacion: transforma una sesion completa de hasta 120.000 tokens en un resumen estructurado con nueve encabezados.
- Generacion de texto condicionada a formato estricto (salida con secciones predefinidas).
- Procesamiento de contexto largo, aprovechando la ventana del modelo base para ingerir sesiones extensas.
- Carga directa con `AutoModelForCausalLM` desde el directorio raiz del repositorio.
- No se documentan capacidades de tool calling, function calling, vision, audio ni modo de razonamiento explicito.
- El soporte multilingue no esta especificado; dado el origen del modelo base, es probable un sesgo hacia el ingles, pero no se confirma.

## Casos de uso

- Compactacion de memoria de agentes de codigo: integrar el modelo al final de una sesion para generar un resumen persistente que se reinyecte en la siguiente interaccion, reduciendo el coste de tokens en produccion.
- Persistencia de estado entre turnos en asistentes de programacion: almacenar el resumen de nueve encabezados como memoria a largo plazo en lugar de la transcripcion completa.
- Pipeline de CI/CD para agentes automatizados: al cerrar una tarea de refactorizacion o depuracion, el modelo produce un resumen estructurado que se adjunta al pull request o al ticket.
- Sistemas de gestion de contexto en IDE: comprimir el historial de la sesion del desarrollador para mantener respuestas coherentes sin exceder la ventana del modelo principal.
- Evaluacion y benchmarking de tecnicas de compactacion: servir como referencia dentro de la arena `ctx_compress` de Microtensor para comparar estrategias de resumen.
- Archivado y auditoria de sesiones: generar resumenes normalizados de sesiones de agente para trazabilidad y revision posterior por parte de equipos de ingenieria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `training/runs` para el resultado en el conjunto de validacion, pero no se incluyen cifras en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6,4 GB solo para pesos (3,19 mil millones de parametros a 2 bytes), mas overhead de activaciones y cache KV, que con contexto de 120.000 tokens puede ser muy elevado.
- La cache KV para 120.000 tokens sobre un modelo de este tamano puede requerir decenas de GB adicionales, dependiendo de la configuracion de atencion del modelo base.
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo; en consumer, RTX 4090 (24 GB) podria manejar contextos moderados con cuantizacion, pero el contexto maximo probablemente exceda su VRAM.
- Cabe en GPU consumer para contextos cortos: RTX 3090/4090 con cuantizacion a 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI o llama.cpp si se generan pesos GGUF (no publicados en el repositorio); carga directa con transformers y `AutoModelForCausalLM`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mt_slm_ctx_compress | 3,19 B | 120k (entrada de sesion) | Compactacion de sesiones | microtensor-submission | HuggingFace (0 descargas) |
| ibm-granite/granite-4.0-h-micro | no disponible en la informacion | no disponible | Proposito general | Apache 2.0 | HuggingFace (modelo base) |
| Otros modelos de compactacion de contexto | no disponible | no disponible | Compactacion | no disponible | no disponible |

La comparativa se limita al modelo base, ya que no se dispone de datos sobre alternativas especializadas en compactacion de sesiones de agente con caracteristicas equivalentes.

## Limitaciones y advertencias

- Licencia `microtensor-submission`: el uso comercial queda sujeto a los terminos de Microtensor, lo que puede impedir su adopcion fuera de ese ecosistema.
- Modelo especializado: no esta disenado para generacion general, razonamiento abierto ni codigo; su uso fuera de la tarea de compactacion producira resultados pobres.
- Dependencia de formato: espera sesiones de agente y produce una salida con nueve encabezados fijos; desviaciones del formato de entrada pueden degradar la calidad.
- Riesgo de alucinacion y perdida de informacion: al comprimir hasta 120.000 tokens en un resumen corto, es inevitable descartar detalles que pueden ser criticos para la tarea posterior.
- Idiomas no documentados: no se garantiza un rendimiento adecuado en castellano ni en otros idiomas distintos del usado en el generador de datos.
- Sin datos de benchmarks publicos ni resultados de validacion accesibles en la informacion proporcionada.
- Repositorio con 0 descargas y 0 likes: sin validacion externa por parte de la comunidad.
- El directorio `training/` contiene artefactos de validacion no puntuados; no deben usarse como pesos del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Samonte/mt_slm_ctx_compress
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-h-micro
- Terminos de licencia Microtensor: https://www.microtensor.cloud/terms
- Repositorio de arenas (referenciado en la model card): https://github.com/microtensor-io/microtensor-arenas (ruta `arenas/compress/synth.py`)
