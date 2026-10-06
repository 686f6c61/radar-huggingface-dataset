# christian-bick/EduGraph-Classifier-Qwen3.8-27B-GGUF

## Resumen

EduGraph-Classifier-Qwen3.8-27B-GGUF es un ajuste fino de tipo adaptador de lenguaje sobre el modelo multimodal Qwen/Qwen3.8-27B (revision 1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0), fusionado en los pesos BF16 del modelo base y convertido a formato GGUF. Lo desarrolla el usuario christian-bick y su funcion es acotada y muy especifica: dada una unica imagen de una tarea educativa, devuelve un JSON con identificadores explicitos de la ontologia EduGraph en los campos `areas`, `scopes` y `abilities`. No es un asistente conversacional general, sino un clasificador visual con salida restringida por esquema.

El modelo conserva la torre de vision del base, que permanece en BF16, mientras que el modelo de lenguaje se cuantiza a Q4_K_M. Los pesos publicados suman 26.895.998.464 parametros y el repositorio completo ocupa 17,5 GB, repartidos en dos ficheros GGUF que deben usarse como pareja: `model-Q4_K_M.gguf` y `mmproj-BF16.gguf`. La licencia es Apache 2.0, con el aviso de copyright de Alibaba Cloud heredado del checkpoint original.

Su relevancia es la de un candidato de investigacion reproducible: la model card documenta revisiones fijadas, sumas SHA-256 de cada fichero, el commit exacto de llama.cpp y una cohorte de validacion congelada. El propio autor lo etiqueta como research candidate y advierte de que no debe emplearse en decisiones que afecten a estudiantes sin una revision previa del contexto educativo de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal base Qwen/Qwen3.8-27B con torre de vision en BF16; la model card no detalla la arquitectura interna) |
| Parametros totales | 26.895.998.464 (dato real de safetensors del modelo base) |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | 2.048 tokens en la configuracion medida; la model card no declara el maximo soportado |
| Tipos de cuantizacion | Q4_K_M para el modelo de lenguaje; BF16 para el proyector de vision (`mmproj-BF16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (texto de licencia del checkpoint upstream, SHA-256 `bbedc3fda3305820b977265f01b8619d87570a6739de3a5582c3464840f1e57a`, con copyright de Alibaba Cloud) |
| Formato de pesos | GGUF (llama.cpp), dos ficheros emparejados: `model-Q4_K_M.gguf` y `mmproj-BF16.gguf` |

## Arquitectura y entrenamiento

El procedimiento declarado es el siguiente: se entreno un adaptador de lenguaje sobre Qwen/Qwen3.8-27B, se fusiono en los pesos BF16 del modelo base, se convirtio el resultado a GGUF y se cuantizo unicamente el modelo de lenguaje a Q4_K_M. El proyector de vision no se toca y permanece en BF16. La ejecucion de entrenamiento seleccionada fue `edugraph-20261002-qwen38-27b-runpod-full-a40-v1`, y la validacion del GGUF se hizo en la ejecucion `edugraph-20261004-qwen38-27b-gguf-benchmark-v4`. El conversor y el runtime de llama.cpp estan fijados al commit `0faee5004297c3bcfa40b7bf11750127b8c1fd7d`.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El dataset de entrenamiento es christian-bick/edugraph-exercises, release `v0.30.0-03`, revision `9b509867e898490615be3f59bc2f31fac429389c`, con ontologia `0.30.0`, y se describe como compuesto por imagenes sinteticas de tareas educativas.

La innovacion tecnica del despliegue no esta en el modelo sino en el contrato de inferencia: se sirve con `chat_template.jinja`, que inyecta un system prompt de clasificador fijo y desactiva el modo thinking, y con `closed_schema.json` para forzar salida JSON valida. Un detalle critico documentado es el orden de las propiedades del esquema en tiempo de peticion: debe reconstruirse en el orden `areas`, `scopes`, `abilities`, ya que el esquema serializado en disco puede tener otro orden y la reproduccion del resultado medido depende de esa reordenacion.

## Capacidades

- Clasificacion de una unica imagen de tarea educativa con etiquetas explicitas de la ontologia EduGraph en `areas`, `scopes` y `abilities`.
- Salida JSON restringida por esquema (`response_format` con `type: json_object` y `schema`), con 0/64 salidas invalidas en la ejecucion medida.
- Entrada imagen-texto: acepta una imagen (JPEG RGB, calidad 75 en la ruta medida) junto a un mensaje de usuario con el prompt de `prompt.json`.
- Razonamiento visual sobre el contenido del ejercicio, heredado del modelo base multimodal.
- Generacion con modo thinking desactivado de forma explicita mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Decodificacion greedy reproducible con `temperature: 0` y techo de 512 tokens de salida.
- Multilingue: no disponible. La model card no declara idiomas soportados.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible. El diseno es de una sola peticion por imagen.
- Otras capacidades especiales (audio, thinking mode activable): no disponible.

## Casos de uso

- Etiquetado automatico de ejercicios en una plataforma educativa: el modelo recibe la foto o el escaneo de un enunciado y devuelve las areas, scopes y abilities de la ontologia, lo que permite indexar el catalogo sin intervencion manual.
- Construccion de un grafo de conocimiento curricular: las etiquetas explicitas sirven como nodos de un grafo EduGraph. Hay que verificar las etiquetas contra la version fijada de la ontologia antes de usarlas, y no tratar las relaciones `integrates` ni los ancestros derivados como predicciones del modelo.
- Recomendacion y enrutado de contenido: a partir de las abilities detectadas en un ejercicio resuelto, un sistema de tutoria puede sugerir el siguiente ejercicio del mismo scope o de un scope relacionado.
- Auditoria de catalogos existentes: clasificacion por lotes sobre material ya etiquetado para detectar discrepancias entre la etiqueta historica y la predicha por el modelo.
- Ingesta de material escaneado en un LMS: pipeline que convierte imagen en etiqueta estructurada directamente, sin OCR intermedio, apoyandose en la ruta multimodal del modelo.
- Anotacion asistida para investigacion educativa: uso del modelo como preanotador en un corpus de ejercicios, con revision humana posterior, aprovechando que la cohorte de validacion y la version de ontologia estan fijadas y son trazables.
- Control de calidad previo a la publicacion de contenido: validar que un ejercicio nuevo encaja en la ontologia vigente antes de incorporarlo al repositorio.
- Prueba de concepto de clasificacion visual restringida por esquema: el patron (chat template con prompt fijo, esquema cerrado y thinking desactivado) es reutilizable en otros dominios de etiquetado con vocabulario controlado.

## Benchmarks y rendimiento

Todos los resultados proceden de la misma cohorte diagnostica de 64 imagenes originales con etiquetas gold, usada para seleccionar checkpoint; no es un conjunto ciego nuevo. La metrica principal es exact-set match, que compara el conjunto completo de etiquetas explicitas.

| Configuracion | Exact-set match |
|---|---:|
| Base NF4 mas adaptador (runtime de entrenamiento) | 43/64 |
| BF16 fusionado (runtime Transformers) | 40/64 |
| Este Q4_K_M GGUF (llama.cpp, orden de propiedades corregido) | 37/64 |

Datos adicionales de la ejecucion GGUF: 93,69 % de micro F1 sobre etiquetas y 0/64 salidas invalidas. El archivo inmutable del informe tiene SHA-256 `41bdd7535b410fc3f23a4095975ba9bfcbe6af692290a275455cf597ffe0b0d1`.

El autor advierte de que el resultado separado de 181/250 pertenece exclusivamente a la configuracion NF4 mas adaptador, y que esta exportacion GGUF no se ha evaluado sobre esa cohorte final. Tambien senala que las diferencias entre BF16 y GGUF incluyen conversion, serving y mecanica de restriccion JSON, por lo que no aislan la perdida por cuantizacion. No hay resultados de MMLU, HumanEval, GSM8K ni de ningun benchmark estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio completo ocupa 17,5 GB (modelo Q4_K_M mas proyector de vision BF16), cantidad que hay que sumar al cache KV para 2.048 tokens de contexto. No se publican cifras exactas de VRAM en uso.
- GPU empleada en la validacion GGUF: una L40S. El entrenamiento se ejecuto en un A40 en RunPod.
- GPU de 24 GB: el autor indica explicitamente que el ajuste, el comportamiento de carga y el arranque en frio en una L4 de GCP de 24 GB no estan establecidos. No hay ninguna medida publicada para GPUs de consumo.
- GPU recomendadas: no disponible mas alla de la L40S y la A40 mencionadas.
- Despliegue: llama.cpp mediante `llama-server`, con los dos ficheros GGUF, `--jinja`, plantilla de chat externa, `--ctx-size 2048`, `--ubatch-size 1024`, `--parallel 1`, offload completo a GPU y `--fit off`. Se expone endpoint compatible con `/v1/chat/completions`.
- Latencia y throughput: no disponible. Solo se documenta la configuracion de la ruta medida (peticion unica, greedy, techo de 512 tokens de salida).
- Runtime alternativo: el modelo esta pensado para llama.cpp; no se mencionan vLLM, TGI ni Ollama.

## Comparativa con modelos similares

No se han publicado datos de benchmarks comparativos con modelos externos en la informacion disponible. La unica comparacion documentada es interna, entre las tres configuraciones de este mismo ajuste sobre Qwen3.8-27B:

| Configuracion | Formato | Exact-set match (64 imagenes) | Evaluada en la cohorte 181/250 |
|---|---|---:|---|
| Base NF4 mas adaptador | NF4 (runtime de entrenamiento) | 43/64 | Si |
| BF16 fusionado | safetensors BF16 | 40/64 | no disponible |
| Q4_K_M GGUF (esta publicacion) | GGUF Q4_K_M | 37/64 | No |

Comparativa con alternativas de la misma categoria (clasificadores visuales de contenido educativo, u otros ajustes sobre Qwen3.8-27B): no disponible.

## Limitaciones y advertencias

- Modelo de investigacion: el propio autor lo califica como research candidate y pide revisarlo para el contexto educativo previsto antes de usarlo en decisiones que afecten a estudiantes.
- Entrenamiento y evaluacion con imagenes sinteticas de tareas educativas y ontologia `0.30.0`. El rendimiento en aulas reales y con combinaciones de etiquetas poco frecuentes no esta medido.
- La cohorte de 64 imagenes es un conjunto diagnostico usado para seleccion de checkpoint, no una prueba ciega nueva.
- Esta exportacion GGUF no se ha puntuado sobre la cohorte final de 250 casos; el 181/250 no es aplicable a estos pesos.
- Las diferencias entre BF16 y GGUF mezclan conversion, serving y mecanica de restriccion JSON, de modo que no permiten atribuir la caida de exact-set match unicamente a la cuantizacion.
- El modelo devuelve solo etiquetas explicitas. No deben interpretarse las relaciones `integrates` de la ontologia ni los ancestros derivados como predicciones. Hay que verificar las etiquetas contra la version fijada de la ontologia antes de cualquier uso aguas abajo.
- Riesgo de alucinacion en la seleccion de etiquetas: el vocabulario esta cerrado por esquema, pero la asignacion de etiquetas incorrectas a un ejercicio no esta acotada por la validacion de formato.
- La reproducibilidad depende de detalles fragiles: el orden de propiedades del esquema en tiempo de peticion debe ser `areas`, `scopes`, `abilities`, y el chat template debe desactivar el thinking.
- Disenado para una imagen por peticion; no hay soporte documentado para conversaciones multi-turno ni para lotes de imagenes.
- Idiomas soportados: no declarados, lo que impide garantizar el comportamiento en ejercicios en castellano u otras lenguas.
- Licencia Apache 2.0 en los pesos ajustados y convertidos, pero el dataset y la ontologia tienen titularidad y terminos propios, distintos de los del modelo.
- Restricciones de uso comercial: la licencia Apache 2.0 no impone restriccion comercial sobre los pesos, pero el aviso del autor y las condiciones del dataset deben revisarse antes de un despliegue en produccion.
- Comportamiento en hardware de 24 GB y arranque en frio no verificados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/christian-bick/EduGraph-Classifier-Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint del base fijado: https://huggingface.co/Qwen/Qwen3.8-27B/blob/1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/christian-bick/edugraph-exercises
- Repositorio de codigo: https://github.com/christian-bick/edugraph-classify
- Registro inmutable del benchmark: https://github.com/christian-bick/edugraph-classify/blob/60e2e2b710b262cc527137ffc75aa61fe868d679/docs/RUNPOD-GGUF-BENCHMARK-20261004.md
- Constructor exacto de la peticion: https://github.com/christian-bick/edugraph-classify/blob/0a6cc246889ea1087df88126d26d5642e9b285a2/src/edugraph_classify/inference_benchmark.py
- Busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a paginas sobre el nombre propio Christian y a una pasteleria, sin relacion con el modelo.
