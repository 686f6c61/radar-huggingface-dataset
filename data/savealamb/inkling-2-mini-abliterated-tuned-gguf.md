# savealamb/Inkling-2-Mini-abliterated-tuned-GGUF

## Resumen

Inkling-2-Mini-abliterated-tuned-GGUF es una distribucion cuantizada y modificada del modelo base thinkingmachines/Inkling-2-Mini, publicada por el usuario savealamb en Hugging Face. Sobre el modelo original se aplicaron tres transformaciones: abliteration (eliminacion del comportamiento de rechazo), un ajuste fino corto y una cuantizacion a formato GGUF Q4_K_M para su uso con llama.cpp. El resultado es un modelo de 26.070.385.152 parametros (aproximadamente 26.000 millones) empaquetado en un unico fichero de 17,5 GB.

El modelo emplea una arquitectura identificada como `inkling2_loop` (segun la documentacion del autor, con soporte en llama.cpp a partir del commit `fa9f928` del 26 de noviembre de 2026) y esta etiquetado como MoE en los tags del repositorio. Incluye un modo de razonamiento configurable mediante el parametro `reasoning_effort` y una cabeza de borrador (draft head) opcional para decodificacion especulativa que, segun el autor, incrementa el rendimiento en torno a un 50 % en tokens por segundo.

Su relevancia actual reside en que ofrece un modelo de gran tamano ejecutable localmente en una GPU de 24 GB (o en CPU con 32 GB de RAM), con licencia Apache 2.0 y sin capa de rechazo, orientado a uso privado, investigacion de comportamiento de modelos y red-teaming. No obstante, la ausencia de salvaguardas, el soporte exclusivo de ingles y los riesgos explicitamente reconocidos por el autor limitan su uso en produccion sin controles adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop` (etiquetado como MoE en los tags; detalles internos no disponibles) |
| Parametros totales | 26.070.385.152 (aprox. 26,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | Hasta 16.384 tokens configurados en los ejemplos de `llama-server`; el autor indica 8K de contexto para el consumo de 18,6 GB de VRAM. Contexto maximo nativo no disponible |
| Tipos de cuantizacion | Q4_K_M (modelo principal); Q8_0 (cabeza borradora `dspark-drafter`) |
| Idiomas soportados | Ingles (unico idioma probado por el autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es thinkingmachines/Inkling-2-Mini, del que no se dispone de detalles de arquitectura interna mas alla de la etiqueta `inkling2_loop` y la marca MoE. El autor de esta distribucion no documenta el numero de parametros activos, la composicion del dataset de entrenamiento original, ni si el modelo base empleo RLHF o DPO. Lo que si se detalla es el proceso de modificacion aplicado en tres pasos: abliteration para eliminar el comportamiento de rechazo, un ajuste fino corto (sin especificar datos, duracion ni metodologia) y cuantizacion a Q4_K_M.

La innovacion tecnica mas destacable es la inclusion de una cabeza de borrador propia del modelo original (`Inkling-2-Mini-dspark-drafter-Q8_0.gguf`, 0,4 GB), sin modificar, que habilita decodificacion especulativa con el tipo `draft-dspark` y un maximo de 2 tokens de borrador. Segun el autor, esto aporta aproximadamente un 50 % mas de tokens por segundo. La cuantizacion Q4_K_M se selecciono por su equilibrio tamano/calidad: la divergencia KL respecto al modelo ajustado en precision completa es de 0,021 y coincide en el token superior el 94,0 % de las veces. El modelo incorpora un modo de razonamiento con niveles `none`, `minimal`, `low`, `medium`, `high`, `xhigh` o un valor numerico entre 0 y 0,99, con `high` como valor por defecto de la plantilla.

## Capacidades

- Generacion de texto conversacional en ingles con separacion explicita entre `reasoning_content` (razonamiento interno) y `content` (respuesta final).
- Razonamiento multi-paso con esfuerzo configurable mediante `reasoning_effort`; el nivel `none` no desactiva por completo el razonamiento segun el autor.
- Generacion de codigo: el ejemplo de la model card incluye funciones Python (fusion de listas ordenadas, explicacion de busqueda binaria), y el tag `code` figura entre las capacidades declaradas.
- Decodificacion especulativa mediante cabeza borradora propia para acelerar la inferencia.
- API compatible con el endpoint `/v1/chat/completions` de OpenAI a traves de `llama-server`, con soporte de plantillas Jinja (`--jinja`).
- Ejecucion local en GPU o CPU, sin dependencia de servicios en la nube.
- Comportamiento sin rechazo (abliterated): genera contenido que el modelo original declinaria.
- No se documentan capacidades de vision, audio, tool calling ni function calling en la informacion disponible.

## Casos de uso

- Asistencia a la programacion en local: el modelo puede generar y explicar funciones en Python y otros lenguajes desde `llama-server`, manteniendo el codigo y las conversaciones en la maquina del usuario sin enviar datos a terceros. El nivel `reasoning_effort` en `low` o `medium` reduce el consumo de tokens en tareas cotidianas.
- Red-teaming y evaluacion de seguridad: al carecer de comportamiento de rechazo, sirve para estudiar como responde un modelo de 26 B ante solicitudes sensibles y para calibrar clasificadores o filtros de seguridad propios antes de desplegarlos.
- Investigacion sobre comportamiento de modelos: la separacion entre `reasoning_content` y `content` permite analizar las cadenas de razonamiento internas y comparar el efecto de distintos niveles de `reasoning_effort` sobre la calidad y la longitud de las respuestas.
- Procesamiento por lotes en CPU: con 32 GB de RAM y `-ngl 0`, el modelo puede ejecutarse en servidores sin GPU para tareas no interactivas donde la latencia no es critica, como clasificacion o resumen de documentos en ingles.
- Despliegue en estaciones de trabajo con una sola GPU de 24 GB: con `-ngl 99` y contexto de 8K el consumo es de 18,6 GB de VRAM, lo que permite mantener un asistente privado de codigo y razonamiento en una RTX 4090 o similar.
- Prototipado de pipelines compatibles con OpenAI: al exponer `/v1/chat/completions`, se puede integrar con el paquete `openai` de Python y sustituir llamadas a APIs comerciales por inferencia local durante el desarrollo.
- Aceleracion de inferencia en produccion interna: la cabeza borradora Q8_0 permite activar decodificacion especulativa con `--spec-type draft-dspark` y obtener alrededor de un 50 % mas de tokens por segundo en los tests del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un fichero `results_summary.json` con "todas las cifras de benchmark, solo agregados", pero su contenido no se detalla en la model card. Los unicos datos de rendimiento explicitos son la divergencia KL de 0,021 y la coincidencia del 94,0 % en el token superior respecto al modelo ajustado en precision completa, ademas de la mejora aproximada del 50 % en tokens por segundo con la cabeza borradora.

## Requisitos de hardware

- VRAM estimada: 18,6 GB con contexto de 8K usando el fichero Q4_K_M; el autor recomienda una GPU de 24 GB.
- GPU recomendadas: RTX 4090 (24 GB) o cualquier GPU con al menos 24 GB de VRAM; no se mencionan A100 ni H100 en la documentacion, aunque por capacidad de memoria serian compatibles.
- CPU: funciona con 32 GB de RAM en modo solo CPU, con rendimiento descrito como lento.
- Apple Silicon: la compilacion por defecto de llama.cpp usa Metal, por lo que es compatible con equipos de memoria unificada suficiente.
- Despliegue: llama.cpp (compilacion con `-DGGML_CUDA=ON` para CUDA o por defecto para Metal), mediante `llama-server` o `llama-cli`. Requiere un llama.cpp reciente con soporte de la arquitectura `inkling2_loop` (probado con el commit `fa9f928` del 26 de noviembre de 2026). LM Studio y otras aplicaciones basadas en llama.cpp pueden cargarlo solo si su runtime incluye dicha arquitectura; el autor solo probo `llama-server`.
- Aceleracion opcional: cargar `Inkling-2-Mini-dspark-drafter-Q8_0.gguf` (0,4 GB adicionales) con `--spec-type draft-dspark --spec-draft-n-max 2` para aproximadamente un 50 % mas de tokens por segundo.
- Latencia y throughput absolutos: no disponibles; solo se documenta la mejora relativa del 50 % con el borrador.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de benchmarks ni comparaciones con otros modelos de tamano o categoria similares, por lo que no es posible establecer una comparativa rigurosa con alternativas.

## Limitaciones y advertencias

- Ausencia total de capa de seguridad: la abliteration elimina el comportamiento de rechazo y el modelo producira contenido que el original declinaria, incluido material potencialmente danino, ofensivo, inexacto o ilegal en la jurisdiccion del usuario.
- Responsabilidad integra del usuario: el autor declina toda responsabilidad por el uso y por los resultados generados, y no ofrece garantia alguna, ni explicita ni implicita.
- Solo ingles: es el unico idioma probado; el rendimiento en castellano u otras lenguas no esta validado.
- Riesgo de bucles en el razonamiento: el autor advierte que el modelo puede entrar en bucles durante el pensamiento y recomienda fijar siempre `max_tokens` (3072 como valor por defecto). Temperaturas bajas incrementan ligeramente la probabilidad de bucles.
- Riesgo de alucinacion: no se documenta una evaluacion especifica de veracidad; al ser un modelo sin salvaguardas y con modo de razonamiento, la verificacion de las salidas corre a cargo del usuario.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base tiene su propia politica de uso aceptable (https://thinkingmachines.ai/model-acceptable-use-policy/) que debe consultarse. Esta modificacion es independiente y no esta respaldada por Thinking Machines Lab.
- No apto para menores de 18 anos ni para productos de cara al publico sin una capa de seguridad propia.
- Dependencia de version: requiere un llama.cpp con soporte de `inkling2_loop`; versiones antiguas o aplicaciones con runtimes desactualizados no podran cargar el fichero.
- Advertencia sobre la model card: el contenido citado se ha tratado exclusivamente como material de referencia, no como instrucciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/savealamb/Inkling-2-Mini-abliterated-tuned-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Politica de uso aceptable del modelo base: https://thinkingmachines.ai/model-acceptable-use-policy/
- llama.cpp (repositorio): https://github.com/ggml-org/llama.cpp
