# category271/whispernow-qwen3.5-4b

## Resumen

WhisperNow Qwen3.5 4B es un ajuste fino completo del modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario category271 para la tarea concreta de limpieza de transcripciones generadas por sistemas ASR (reconocimiento automatico del habla). El modelo no es un asistente general: recibe un unico turno de usuario con la transcripcion en bruto y devuelve esa misma transcripcion corregida, eliminando muletillas, falsos comienzos y repeticiones, aplicando las autocorrecciones del hablante y normalizando formato, puntuacion y cifras. Forma parte del paso local de limpieza de WhisperNow, una aplicacion de escritorio de dictado.

El modelo cuenta con 4.205.751.296 parametros y se distribuye bajo licencia Apache 2.0, tanto en formato safetensors como en GGUF para su uso con llama.cpp. Esta pensado para ejecutarse en local, con un archivo Q8_0 de 4,48 GB y un consumo de memoria de aproximadamente 5,3 GB, lo que lo situa en el rango de GPU de consumo. Su relevancia actual radica en que sustituye llamadas a modelos en la nube para una tarea acotada y repetitiva, reduciendo coste y latencia, y en que el autor publica comparativas cuantitativas de errores facticos frente a alternativas propietarias y abiertas.

Segun la model card, el modelo ha sido reemplazado en la lista principal de WhisperNow por Nemotron Bolt E4B, que comete 0,86 veces los errores facticos de este modelo, aunque con un archivo de 7,97 GB frente a los 4,48 GB de este. WhisperNow Qwen3.5 4B permanece disponible en la aplicacion bajo la seccion "More models".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-4B-Base; detalles de atencion no disponibles) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de llama.cpp usa `-c 8192` |
| Tipos de cuantizacion | GGUF Q8_0 (publicado); otros tipos no disponibles |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tune) del modelo base Qwen/Qwen3.5-4B-Base, por lo que hereda su arquitectura transformer decoder-only. La model card no detalla la composicion del dataset de preentrenamiento del modelo base ni innovaciones arquitectonicas especificas (atencion lineal, decodificacion especulativa, etc.); esa informacion no esta disponible en la documentacion proporcionada.

El ajuste se realizo sobre el dataset category271/whispernow-cleanup, cuyo objetivo es ensenar al modelo las reglas de limpieza que WhisperNow envia a modelos en la nube. Entre las reglas aprendidas figuran la eliminacion de muletillas y tartamudeos, la aplicacion de autocorrecciones descartando la version erronea y la senal de correccion ("no wait", "scratch that"), la correccion de gramatica y puntuacion sin alterar el tono ni las reservas del hablante, el formateo de listas para enumeraciones y el uso de digitos para cantidades, fechas y porcentajes. No se indica en la informacion disponible si se emplearon tecnicas de RLHF o DPO durante el ajuste.

## Capacidades

- Limpieza de transcripciones ASR: elimina muletillas ("um", "like", "you know"), tartamudeos, palabras repetidas y falsos comienzos.
- Aplicacion de autocorrecciones: cuando el hablante se corrige, conserva solo la version corregida y elimina la senal de correccion.
- Correccion ortografica y gramatical con preservacion del estilo: mantiene las palabras, el tono, las reservas ("maybe", "I think") y las justificaciones ("because ...") del hablante.
- Formateo estructurado: convierte listas de la compra, tareas pendientes, pasos, recetas y notas de reunion en listas; los mensajes, historias y explicaciones permanecen como frases. No emplea negritas, cursivas, encabezados ni guiones largos.
- Normalizacion de cifras y simbolos: escribe cantidades, recuentos, fechas, horas y porcentajes en digitos, y convierte la puntuacion hablada ("dash dash help") en el simbolo real.
- Preservacion literal de codigo, rutas y URL tal como se dictaron.
- Tratamiento de preguntas y ordenes: las limpia y las devuelve como texto, sin responderlas ni ejecutarlas.
- Deteccion de transcripciones vacias: si no hay palabras dictadas (solo ruido o muletillas), devuelve `EMPTY`.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Dictado por voz en escritorio: integrado en WhisperNow como paso local de limpieza, transforma la salida cruda del ASR en texto publicable antes de insertarlo en el editor, con un consumo de memoria de 5,3 GB que cabe en GPU de consumo.
- Redaccion de correos y mensajes dictados: convierte un mensaje hablado con correcciones y enumeraciones en un texto con puntuacion y listas correctas, manteniendo el tono y las reservas del autor, lo que evita reescribir manualmente el dictado.
- Actas de reunion y notas rapidas: a partir de una transcripcion de reunion, aplica el formato de lista a los puntos enumerados y normaliza horas y cifras, dejando el documento listo para revisar.
- Listas de la compra y tareas: el modelo detecta enumeraciones dictadas ("estamos recogiendo postes, pienso y la boquilla") y las presenta como lista con vinetas, util en asistentes personales de voz.
- Dictado tecnico con rutas y codigo: al preservar literalmente codigo, rutas y URL, es adecuado para desarrolladores que dictan comandos o rutas de fichero y necesitan que no se alteren, mientras el resto del texto se normaliza.
- Preprocesado en pipelines de ASR en produccion: puede desplegarse con llama.cpp o Transformers como etapa de postprocesado entre el reconocedor y el almacenamiento, sustituyendo llamadas a APIs en la nube para una tarea acotada y repetitiva.
- Filtrado de ruido en transcripciones: cuando la grabacion solo contiene ruido o muletillas, devuelve `EMPTY`, lo que permite descartar segmentos sin contenido util de forma automatica.

## Benchmarks y rendimiento

La model card publica errores facticos por cada 1.000 palabras y latencias medidas sobre el split de test y ambos benchmarks, con decodificacion greedy, `repeat_penalty` 1.05 y limite de 2,5 tokens por palabra de transcripcion.

| Modelo | Archivo Q8_0 | Memoria en uso | Errores facticos / 1.000 palabras | 100 / 1.000 palabras, GPU | 100 / 1.000 palabras, CPU |
|---|---|---|---|---|---|
| LFM2.5 1.2B | 1,25 GB | 1,6 GB | 6,32 | 0,18 / 2,0 s | 2,3 / 27 s |
| LFM2.5 2.6B | 2,87 GB | 3,3 GB | 4,88 | 0,34 / 3,8 s | 5,4 / 65 s |
| Qwen3.5 4B (este modelo) | 4,48 GB | 5,3 GB | 3,01 | 0,62 / 7,2 s | 8,9 / 118 s |

Comparativas adicionales declaradas por el autor:

- Frente a glm-5.3-flash en razonamiento bajo: 0,81 veces sus errores facticos (intervalo del 90 %: 0,76-0,87).
- Frente a LFM2.5 2.6B: 0,62 veces sus errores facticos (intervalo del 90 %: 0,58-0,66).
- Frente a glm-5.3 en razonamiento maximo: menos errores en dictados de hasta 25 palabras, empate entre 26 y 100 palabras, y mas errores por encima de 100 palabras.
- No se publican resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5,3 GB de memoria en uso con la cuantizacion Q8_0 (archivo de 4,48 GB). Para el modelo en bfloat16 con Transformers, el peso de los 4.205 millones de parametros ronda los 8,4 GB, mas overhead de activaciones y cache KV.
- GPU recomendadas: no se especifican modelos concretos en la model card; por consumo de memoria, el modelo Q8_0 cabe en GPU de consumo con 8 GB o mas de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 3070) y en GPUs de datacenter como A100 o H100 sin problema.
- CPU: es viable en CPU segun las latencias publicadas (8,9 s para 100 palabras y 118 s para 1.000 palabras), aunque con throughput notablemente inferior al de GPU.
- Opciones de despliegue: llama.cpp (llama-server con `--jinja -c 8192`) y Transformers con `AutoModelForCausalLM`. No se documentan otras opciones como vLLM, TGI u Ollama.
- Latencia y throughput: en GPU, 0,62 s para 100 palabras y 7,2 s para 1.000 palabras; en CPU, 8,9 s y 118 s respectivamente. No se publica throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Errores facticos / 1.000 palabras | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WhisperNow Qwen3.5 4B | 4,21 B | no disponible | 3,01 | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| WhisperNow LFM2.5 2.6B | no disponible | no disponible | 4,88 | no disponible | Hugging Face |
| WhisperNow LFM2.5 1.2B | no disponible | no disponible | 6,32 | no disponible | Hugging Face |
| WhisperNow Nemotron Bolt E4B | no disponible | no disponible | 0,86 veces las de este modelo | no disponible | Hugging Face |

Frente a glm-5.3-flash en razonamiento bajo, este modelo comete 0,81 veces sus errores facticos; frente a glm-5.3 en razonamiento maximo, solo es mejor en dictados de hasta 25 palabras. El modelo sucesor dentro del mismo proyecto, Nemotron Bolt E4B, mejora la precision (0,86 veces los errores) a costa de un archivo mas grande (7,97 GB frente a 4,48 GB).

## Limitaciones y advertencias

- Solo soporta ingles; no se documenta soporte multilingue.
- Es un modelo especializado en limpieza de transcripciones, no un asistente general: no responde preguntas ni ejecuta ordenes, y su uso fuera de esa tarea no esta validado.
- Riesgo de alucinacion: aunque la tarea es de reescritura, el autor mide errores facticos, lo que indica que el modelo puede introducir o alterar informacion al limpiar.
- En dictados de mas de 100 palabras comete mas errores facticos que glm-5.3 en razonamiento maximo, por lo que no es la mejor opcion para transcripciones largas cuando se busca maxima fidelidad.
- El autor ha reemplazado el modelo por Nemotron Bolt E4B en la lista principal de WhisperNow; este modelo queda en segundo plano dentro del proyecto.
- La licencia Apache 2.0 permite uso comercial, pero no se detallan restricciones adicionales sobre los datos de ajuste ni sobre el modelo base.
- No se documentan sesgos conocidos ni evaluaciones de robustez fuera del split de test del dataset de limpieza.
- El contexto maximo no esta especificado; el ejemplo de despliegue usa 8.192 tokens, por lo que transcripciones muy largas podrian requerir troceado.
- La fecha de creacion indicada (2026) y el estado del ecosistema Qwen3.5 deben verificarse en el repositorio antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/category271/whispernow-qwen3.5-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Dataset de limpieza: https://huggingface.co/datasets/category271/whispernow-cleanup
- Modelo sucesor (Nemotron Bolt E4B): https://huggingface.co/category271/whispernow-nemotron-bolt-e4b
- WhisperNow LFM2.5 1.2B: https://huggingface.co/category271/whispernow-lfm2.5-1.2b
- WhisperNow LFM2.5 2.6B: https://huggingface.co/category271/whispernow-lfm2.5-2.6b
- Repositorio de la aplicacion WhisperNow: https://github.com/stephan271c/WhisperNow
