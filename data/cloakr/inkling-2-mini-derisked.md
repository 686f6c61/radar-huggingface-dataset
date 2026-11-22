# cloakr/Inkling-2-Mini-Derisked

## Resumen

Inkling-2-Mini-Derisked es un derivado del modelo base thinkingmachines/Inkling-2-Mini, publicado por el usuario cloakr bajo la etiqueta Blackfrost AI. Se trata de una modificacion a nivel de pesos orientada a reducir las negativas falsas (false refusals) ante peticiones seguras, manteniendo un umbral de rechazo real ante peticiones claramente daninas. El modelo conserva la arquitectura original de tipo loop transformer (transformador con capas repetidas en bucle) y el modulo MTP (multi-token prediction) byte a byte respecto al original.

La relevancia de esta ficha es doble: por un lado documenta una tecnica poco habitual de modificacion conductual sobre arquitecturas con bucles de capas; por otro, advierte de que el proceso de modificacion es propietario y no se distribuye, y de que las evaluaciones publicadas son observaciones operativas del autor, no benchmarks controlados. El repositorio ocupa 20,3 GB y contiene pesos en safetensors con cuantizacion nativa del proveedor.

El modelo esta pensado para investigacion controlada y evaluacion interna, no como sustituto directo del modelo original en produccion. El autor declara 26.388.646.440 parametros en los metadatos de safetensors, mientras que la model card indica aproximadamente 17,6B totales y unos 5,4B activos por token en la configuracion de tres pasadas del bucle del proveedor; esta discrepancia entre ambas cifras no se explica en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Loop transformer (modelo de lenguaje causal con capas repetidas en bucle); etiqueta `inkling2_loop` |
| Parametros totales | 26.388.646.440 segun metadatos de safetensors; la model card indica ~17,6B |
| Parametros activos | ~5,4B por token en la configuracion de tres pasadas del bucle (dato de la model card) |
| Longitud de contexto | 262.144 tokens (declarado por el proveedor original; validado en el runtime del operador) |
| Tipos de cuantizacion | Cuantizacion nativa del proveedor, sin modificar; etiqueta `8-bit` y `modelopt` en los metadatos |
| Idiomas soportados | no disponible |
| Licencia | other (sujeta a los terminos de la release original de Thinking Machines) |
| Formato de pesos | safetensors (un unico shard de 19.526.019.168 bytes) mas `mtp.safetensors` de 635.801.416 bytes |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura loop transformer de Inkling-2-Mini: un transformador causal en el que un subconjunto de capas se recorre varias veces (el proveedor usa tres pasadas), lo que incrementa la profundidad efectiva sin aumentar proporcionalmente el numero de parametros. La modificacion conductual se aplico por bloques manteniendo intacta la estructura de bucles: segun la model card, se capturaron direcciones en 48 puntos (capas 9 a 18, con cuatro visitas de bucle cada una), almacenadas en `s2-capture/directions.npz` con forma (48, 2304) en float32, a partir de una captura de estados ocultos de 64 prompts.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base. El autor indica que el proceso de modificacion es propietario y no se distribuye, y que el tokenizer, la configuracion, los valores por defecto de generacion y el modulo MTP son identicos al release original salvo el shard de pesos objetivo, identificado por checksum SHA-256. El modulo MTP se conserva siempre tras la modificacion. La decodificacion especulativa usa DSpark con 7 tokens especulativos y muestreo probabilistico del borrador.

## Capacidades

- Generacion de texto conversacional con plantilla de chat del proveedor y parser de razonamiento `inkling`, que devuelve el razonamiento en un campo dedicado `reasoning`.
- Razonamiento multi-paso mediante el modo de razonamiento del modelo base.
- Decodificacion especulativa con modulo MTP preservado, orientada a reducir latencia en inferencia.
- Ventana de contexto larga de hasta 262.144 tokens, validada por el operador a esa longitud.
- Generacion concurrente: el autor valida 8 flujos de generacion en paralelo durante la evaluacion.
- No incluye ejecutor de herramientas propio: las aplicaciones deben gestionar el esquema de herramientas, la ejecucion y la inyeccion de resultados.
- Capacidades multilingues: no disponible.
- Capacidades de vision o audio: no disponible.

## Casos de uso

- Investigacion sobre alineacion y negativas: el modelo sirve como punto de operacion con tasa de negativas falsas declarada del 0,0% en un conjunto de 75 prompts seguros (xstest), util para estudiar el equilibrio entre utilidad y seguridad en arquitecturas con bucles.
- Evaluacion interna de arquitecturas loop transformer: permite medir como afecta una modificacion a nivel de pesos en capas intermedias (9 a 18) al comportamiento del bucle sin alterar el modulo MTP.
- Procesamiento de documentos largos: con 262.144 tokens de contexto validados, encaja en tareas de resumen o extraccion sobre expedientes extensos, siempre que el operador asuma la responsabilidad de validar la salida.
- Despliegue en vLLM con decodificacion especulativa: el repositorio incluye un kit de despliegue con instrucciones de agente y una configuracion de servido validada con `num_speculative_tokens=7`, adecuado para equipos que ya operan vLLM.
- Generacion de codigo asistida con validacion humana: el modelo puede producir codigo y argumentos de herramientas, pero la model card exige tratar la salida como datos no confiables y validar codigo, rutas y comandos antes de ejecutarlos.
- Reproduccion de experimentos conductuales: el directorio `DWM_RECIPE/` incluye scripts, una bateria `hard32`, evidencias de captura y un runbook para reproducir el proceso de captura de direcciones, aunque no la receta de modificacion en si.
- Evaluacion comparativa de rechazos: el conjunto de 443 observaciones adjudicadas a mano (295 del brazo danino y 75 seguros) puede reutilizarse como base para estudios de negativas en otros derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor advierte explicitamente de que las puntuaciones del modelo original no son transferibles a este artefacto modificado. Las unicas metricas publicadas son observaciones operativas de rechazo:

| Observacion | Resultado | Tasa |
|---|---:|---:|
| Cumplimiento en brazo danino (advbench + strongreject) | 266/295 | 90,2% |
| Negativas reales en brazo danino | 29/295 | 9,8% |
| Negativas falsas en prompts seguros (xstest) | 0/75 | 0,0% |

Barrido de alpha sobre un conjunto de 50 prompts (32k de presupuesto de respuesta): la tasa de respuesta crecio de forma monotona con la escala de edicion (alpha 1,5 a 2,5: de 21 a 38 respuestas; negativas de 15 a 2), sin errores ni perdida de coherencia en el punto de operacion seleccionado. El autor califica estas cifras como observaciones operativas de un unico runtime, no como un benchmark controlado entre modelos.

## Requisitos de hardware

- VRAM estimada: el shard de pesos ocupa 19,5 GB en cuantizacion nativa de 8 bits, por lo que la inferencia requiere al menos unos 20-22 GB de VRAM solo para pesos, mas overhead de KV cache para contexto largo; el contexto completo de 262.144 tokens exige mucha mas memoria y no cabe en GPUs de consumo.
- GPUs recomendadas: no disponible en la informacion proporcionada; por tamano, el modelo encaja en A100 40/80 GB, H100 y L40S para contexto moderado.
- GPU de consumo: cabe en GPUs con 24 GB o mas (RTX 3090, RTX 4090) solo con contexto reducido y sin garantia de validacion por parte del autor.
- Opciones de despliegue: vLLM con la imagen del proveedor y decodificacion especulativa DSpark (`num_speculative_tokens=7`); el repositorio incluye `deployment-kit/` con la orden de servido validada. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; el autor solo confirma 8 flujos concurrentes validados durante la evaluacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Inkling-2-Mini-Derisked | 26,4B en safetensors (card: ~17,6B totales, ~5,4B activos) | 262.144 | other | Derivado conductual; sin benchmarks estandar publicados |
| thinkingmachines/Inkling-2-Mini | ~17,6B (card del derivado) | 262.144 | terminos de Thinking Machines | Modelo base; conserva los rechazos originales |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- La modificacion conductual se aplico sobre una arquitectura con bucles; el autor recomienda revalidar comportamientos dependientes del bucle en cada despliegue.
- La evaluacion se hizo en un unico runtime, una unica configuracion de servido y un conjunto acotado de prompts; no es un benchmark controlado entre modelos.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el autor exige tratar la salida como datos no confiables y validar codigo, argumentos de herramientas, URLs, rutas y comandos.
- El modelo no es una frontera de autorizacion, aplicacion de politicas ni seguridad; los operadores asumen control de acceso, limitacion de tasa, registro de auditoria y cumplimiento normativo.
- La receta de modificacion es propietaria y no se distribuye, lo que limita la reproducibilidad completa del derivado; solo se publica el runbook de captura.
- Discrepancia de parametros entre los metadatos de safetensors (26,4B) y la model card (~17,6B totales); conviene verificar antes de dimensionar infraestructura.
- Licencia `other`: es imprescindible revisar los terminos de la release original de Thinking Machines antes de cualquier uso comercial.
- Idiomas soportados no disponibles; no se puede garantizar calidad fuera del idioma o idiomas del modelo base.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica ausencia de validacion independiente por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cloakr/Inkling-2-Mini-Derisked
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos adicionales asociados a este derivado.
