# loom-draft/ReadyArt-Wicked-Stuff-31B-Final-loom

## Resumen

ReadyArt-Wicked-Stuff-31B-Final-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por el usuario loom-draft a partir del checkpoint GGUF sin modificar `ReadyArt/Wicked-Stuff-31B-Final-GGUF`, concretamente la cuantizacion `Wicked-Stuff-31B-Final-Q4_K_M.gguf`. No se trata de un modelo nuevo ni de un fine-tuning: es un artefacto de empaquetado que traduce los pesos originales a un formato ejecutable por el runtime Loom sobre GPUs AMD, en concreto el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El paquete se ha generado con `loom-next`, el generador del ecosistema Loom, sin intervencion de un LLM en el bucle, y se distribuye con licencia Apache 2.0. Su relevancia es acotada pero concreta: permite servir un modelo de 31B en cuantizacion Q4_K_M sobre hardware AMD consumer y profesional mediante una API compatible con OpenAI (`/v1/chat/completions`), con soporte declarado de tool calling, modo de razonamiento opcional y hasta 4 peticiones concurrentes con una ventana de 53.248 tokens por peticion.

La informacion publicada es muy limitada: el repositorio tiene 0 GB, no hay descargas ni likes, no se declaran idiomas, no hay resultados de benchmarks ni mediciones de rendimiento (las filas de rendimiento y las puertas de correccion aparecen como "not yet re-measured") y la model card esta truncada. Todo lo que se indica a continuacion proviene exclusivamente de la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete envuelve el GGUF `Wicked-Stuff-31B-Final-Q4_K_M.gguf`; la model card no describe la arquitectura subyacente) |
| Parametros totales | 31B (segun el nombre del modelo base); desglose no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 53.248 tokens por peticion (segun la tabla de features del paquete Loom) |
| Tipos de cuantizacion | Q4_K_M (unica variante empaquetada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base) empaquetado como paquete Loom (`.loom` + `model.json` + `model.json.lock`) |
| Maximo de tokens de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones concurrentes |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |
| API | compatible con OpenAI (`/v1/chat/completions`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo subyacente (transformer, MoE, hibrido, etc.), el volumen o composicion de los datos de entrenamiento, ni si hubo RLHF, DPO u otras etapas de alineamiento. La model card del paquete Loom no describe el modelo original, solo el proceso de empaquetado.

Lo que si se documenta es el proceso de generacion del paquete: se ha usado `loom-next`, el generador del ecosistema Loom, a partir del GGUF `Wicked-Stuff-31B-Final-Q4_K_M.gguf` sin modificar los pesos. El paquete incluye programas `.loom`, una tarjeta `model.json` y un fichero `model.json.lock` con los ficheros fuente fijados y verificados por sha256. La model card menciona ademas un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida del runtime Loom contra una referencia de llama.cpp sobre el mismo GGUF, pero todas ellas figuran como "not yet re-measured" para este paquete, por lo que no hay evidencia registrada de correccion numerica.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI: acepta el campo `tools` y devuelve `tool_calls`.
- Modo de razonamiento ("thinking") opcional, desactivado por defecto; se activa con `chat_template_kwargs: {"enable_thinking": true}`. El "reasoning effort" no aplica.
- Conversaciones multi-turno con historial y reutilizacion de contexto (segun la puerta `agent` descrita en la model card).
- Concurrencia de hasta 4 peticiones simultaneas con contexto de 53.248 tokens por peticion.
- Entrada de imagen: no soportada por Loom, aunque la model card indica que el modelo upstream si la tiene.
- Entrada y salida de audio: no soportadas por Loom, aunque el modelo upstream si las tiene.
- Decodificacion especulativa: no aplicable en este paquete.
- Muestreo (temperature, top_k, seed): estado "not determined" en la tabla de features.
- Capacidades multilingues: no disponibles en la informacion.

## Casos de uso

- Asistente conversacional autoalojado en estaciones de trabajo AMD: el paquete permite levantar un endpoint compatible con OpenAI en una Radeon AI PRO R9700 o en un Strix Halo con un solo comando (`loom-fetch` + `loom-serve`), adecuado para prototipos internos y entornos donde no se quiere depender de APIs en la nube.
- Automatizacion de agentes con tool calling: al soportar `tools` y `tool_calls` en formato OpenAI y disponer de una puerta `agent` para validar bucles multi-turno, puede integrarse en orquestadores de agentes que ya hablan el protocolo de OpenAI.
- Razonamiento con modo thinking para tareas de analisis: activando `enable_thinking` se obtiene una traza de razonamiento previa a la respuesta, util en tareas de clasificacion, planificacion o resolucion de problemas donde interesa inspeccionar el proceso.
- Procesamiento de documentos largos: la ventana de 53.248 tokens por peticion permite resumir, extraer o responder preguntas sobre contratos, informes o transcripciones de decenas de miles de palabras en una sola pasada.
- Servicio de inferencia por lotes en hardware AMD profesional: con 4 peticiones concurrentes y un pool de memoria fijo (`--pool_backing=fixed`), encaja en pipelines de generacion masiva de texto donde el throughput importa mas que la latencia interactiva.
- Evaluacion y benchmarking de runtimes alternativos: al incluir puertas de correccion contra llama.cpp (golden, compare, logits, sampling), el paquete sirve como banco de pruebas para validar la fidelidad numerica del runtime Loom frente a la referencia.
- Desarrollo sobre Strix Halo (APU): permite ejecutar un 31B cuantizado en Q4_K_M en un equipo compacto sin GPU discreta, util para demos, formacion y entornos de desarrollo portatiles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correccion figuran como "not yet re-measured". No hay datos de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El modelo es un 31B en Q4_K_M, lo que en la practica implica pesos del orden de 18-20 GB, pero la model card no publica la cifra exacta; el hardware objetivo declarado es una GPU de 32 GB (Radeon AI PRO R9700) y una APU con memoria unificada (Strix Halo).
- GPU recomendadas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151). No se mencionan GPUs NVIDIA.
- GPU consumer: no se confirma compatibilidad con GPUs consumer; el paquete esta dirigido a las dos plataformas AMD indicadas.
- Despliegue: runtime Loom (`pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch`, `loom-serve`). La model card compara contra llama.cpp pero no indica que el paquete sea compatible con vLLM, TGI, Ollama u otros servidores.
- Opciones de servicio: `--pool_backing=fixed` (pool de memoria fijo), `--parameter_mode=preload` (carga de pesos en host), `completion_spin_ns=4294967295` (espera activa de completaciones GPU, ajuste usado en las mediciones de la tarjeta).
- Latencia y throughput: no disponibles; no se han vuelto a medir.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ReadyArt-Wicked-Stuff-31B-Final-loom | 31B | 53.248 tokens por peticion | Paquete Loom sobre GGUF Q4_K_M | Apache 2.0 | Solo AMD (Strix Halo, R9700); sin benchmarks publicados |
| ReadyArt/Wicked-Stuff-31B-Final-GGUF (modelo base) | 31B | no disponible | GGUF | no disponible en la informacion | Checkpoint original; el paquete Loom no modifica los pesos |
| Alternativas de 31B comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- El repositorio aparece con 0 GB de tamano, 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-19): no hay evidencia de uso ni de validacion por terceros.
- No hay mediciones de rendimiento ni resultados de las puertas de correccion para este paquete; todas figuran como "not yet re-measured". No se puede afirmar que la salida coincida con llama.cpp.
- La model card esta truncada en la seccion de ficheros, por lo que no se detalla el contenido completo del paquete.
- El modelo upstream soporta imagen y audio, pero Loom no los soporta: las capacidades multimodales no estan disponibles en este paquete.
- El muestreo (temperature, top_k, seed) figura como "not determined", lo que introduce incertidumbre sobre la reproducibilidad de las respuestas.
- El maximo de tokens de salida esta limitado a 4.096 por preset y la concurrencia a 4 peticiones.
- No se declaran idiomas soportados; no se puede asumir un rendimiento multilingue concreto.
- La licencia del paquete es Apache 2.0, pero la licencia del modelo base no se indica en la informacion disponible; conviene verificar los terminos del checkpoint original antes de un uso comercial.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al ser un modelo de 31B cuantizado en Q4_K_M, cabe esperar cierta degradacion respecto a precision completa, aunque no se cuantifica.
- Dependencia de un runtime especifico (`hrx-loom[hf]==0.2.0`) y de hardware AMD concreto; no hay soporte declarado para otras plataformas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/ReadyArt-Wicked-Stuff-31B-Final-loom
- Modelo base (GGUF): https://huggingface.co/ReadyArt/Wicked-Stuff-31B-Final-GGUF
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Runtime ROCm/hrx-system: https://github.com/ROCm/hrx-system
- Resultados de busqueda web: no relevantes (corresponden a Loom, la herramienta de grabacion de pantalla, y a la marca de ropa Loom; no guardan relacion con este modelo).
