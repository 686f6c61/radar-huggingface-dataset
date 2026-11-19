# loom-draft/Sparset-Thinklite-27B-loom

## Resumen

Sparset-Thinklite-27B-loom es un paquete de despliegue en formato Loom (`.loom` y un `model.json`) generado por el usuario loom-draft a partir del checkpoint GGUF sin modificar `Sparset/Thinklite-27B-GGUF`, en su cuantizacion Q4_K_M. No se trata de un modelo nuevo ni de un fine-tune de pesos: los pesos son los del modelo base original, y lo que aporta el repositorio es un conjunto de programas Loom generados con la herramienta loom-next para ejecutar ese GGUF sobre GPUs AMD concretas.

El objetivo del paquete es permitir inferencia nativa del modelo en hardware AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB), mediante el runtime `loom-serve` del ecosistema hrx-loom. Expone una API compatible con OpenAI (`/v1/chat/completions`), soporta tool calling, modo de razonamiento configurable y hasta 4 peticiones concurrentes con una ventana de contexto de 262.144 tokens por peticion.

Su relevancia es practica: ofrece una via de ejecucion del modelo Thinklite-27B en GPUs AMD de consumo y estaciones de trabajo, un terreno donde el soporte de software suele ser mas limitado que en CUDA. No se han publicado resultados de rendimiento ni de correccion para este paquete en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer a partir del modelo base, sin confirmacion en la informacion) |
| Parametros totales | 27.000 millones (segun el nombre del modelo base; no confirmado en la informacion) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unica incluida en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Thinklite-27B-Q4_K_M.gguf`) empaquetado como programas Loom (`program/*.loom`, `weights.loom`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base ni su proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO). Lo unico confirmado es que el checkpoint de origen es `Sparset/Thinklite-27B-GGUF` en cuantizacion Q4_K_M y que el paquete Loom no modifica los pesos: genera programas de kernel y una tarjeta `model.json` para ejecutarlos en el runtime Loom.

El paquete incorpora el tokenizador (`tokenizer.json`) y fija los archivos de origen mediante hashes sha256 verificados por `loom-fetch` (`model.json.lock`). La decodificacion especulativa no es aplicable en esta configuracion, segun la tabla de caracteristicas del autor. El modo de razonamiento esta activado por defecto y se controla con `chat_template_kwargs: {"enable_thinking": false}` y con el parametro `reasoning_effort` (valores low, medium y xhigh, con xhigh por defecto).

## Capacidades

- Generacion de texto y razonamiento: modo de pensamiento activado por defecto, con niveles de esfuerzo de razonamiento configurables (low, medium, xhigh).
- Tool calling: soporte de `tools` y `tool_calls` con formato compatible con OpenAI.
- Agentes multi-turno: el autor incluye puertas de correccion especificas para bucles de tool calling con historico reutilizado, tanto con razonamiento activado como desactivado.
- Servicio compatible con OpenAI: endpoint `/v1/chat/completions`.
- Contexto largo: hasta 262.144 tokens por peticion, con un maximo de 4.096 tokens de salida (preset `max_tokens`).
- Concurrencia: hasta 4 peticiones simultaneas.
- Vision: el modelo base dispone de entrada de imagen segun el autor, pero Loom no la soporta; la puerta `vision` figura como no re-medida.
- Audio: no aplicable.
- Multilingue: no disponible en la informacion.

## Casos de uso

- Servicio local de chat sobre GPU AMD: con `loom-serve` y el preset `chat` o `chat-r9700`, el modelo atiende peticiones OpenAI en `127.0.0.1:8080`, util para prototipos en estaciones Strix Halo o R9700 sin depender de CUDA.
- Asistentes con tool calling: la API acepta `tools` y devuelve `tool_calls`, lo que permite construir agentes que consultan APIs externas, bases de datos o sistemas internos en un bucle multi-turno.
- Analisis de documentos largos: la ventana de 262.144 tokens permite procesar contratos, informes o bases de codigo extensas en una sola peticion, con salidas de hasta 4.096 tokens.
- Razonamiento con esfuerzo configurable: para tareas de logica o matematicas se puede usar `reasoning_effort: xhigh`; para respuestas rapidas en produccion, `low` o desactivar el pensamiento con `enable_thinking: false`.
- Evaluacion comparativa frente a llama.cpp: las puertas de correccion (`golden`, `compare`, `logits`, `agent`) estan disenadas para contrastar token a token la salida de Loom con la referencia de llama.cpp sobre el mismo GGUF, util en laboratorios de validacion de runtimes.
- Despliegue en pequenos equipos de trabajo: con 4 peticiones concurrentes y memoria de pool fija (`--pool_backing=fixed`), el paquete sirve para un equipo reducido o un entorno de staging con hardware AMD.
- Integracion en pipelines de CI: `loom-fetch` verifica los sha256 de los archivos de origen, lo que permite fijar artefactos reproducibles en automatizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de rendimiento para este paquete "no se han vuelto a medir" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201), y que ninguna de las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) tiene ejecucion registrada.

## Requisitos de hardware

- VRAM estimada: no disponible. El unico dato objetivo es que el preset `chat-r9700` esta pensado para la Radeon AI PRO R9700 de 32 GB con el GGUF Q4_K_M.
- GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se mencionan GPUs NVIDIA ni CUDA.
- GPU de consumo: no disponible; el paquete esta limitado al hardware AMD listado por el autor.
- Despliegue: runtime `loom-serve` del paquete `hrx-loom[hf]==0.2.0`, instalable con pipx. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de despliegue de este paquete, aunque llama.cpp se usa como referencia de correccion.
- Opciones de servicio: `--pool_backing=fixed` (pool de memoria fijo), `--parameter_mode=preload` (carga de pesos en host) y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU, ajuste usado en las mediciones del autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Sparset-Thinklite-27B-loom | 27.000 millones (segun nombre) | 262.144 tokens | Apache 2.0 | Paquete Loom para AMD gfx1151 y gfx1201 | Sin benchmarks ni puertas de correccion registradas |
| Sparset/Thinklite-27B-GGUF | 27.000 millones (segun nombre) | no disponible | no disponible | Checkpoint GGUF original | Modelo de origen del paquete |
| llama.cpp (runtime) | no aplicable | no disponible | no disponible | Multiplataforma | Referencia de correccion usada por el autor |

No se dispone de datos de rendimiento ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion.
- Riesgo de alucinacion: no documentado; el modelo base no aporta advertencias al respecto en la informacion disponible.
- Entrada de imagen: el modelo base la soporta, pero Loom no; no se puede usar vision a traves de este paquete.
- Rendimiento y correccion sin verificar: todas las puertas de correccion y las mediciones de rendimiento figuran como no re-medidas, por lo que no hay evidencia publicada de equivalencia con llama.cpp ni de velocidad.
- Concurrencia limitada: 4 peticiones simultaneas y 4.096 tokens de salida maximos por peticion, lo que restringe su uso como servicio de alta carga.
- Hardware restringido: solo GPUs AMD gfx1151 y gfx1201; no hay soporte declarado para CUDA ni para otras GPUs.
- Idiomas: sin informacion sobre cobertura linguistica.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `Sparset/Thinklite-27B-GGUF`, que no se detalla en la informacion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validacion por parte de terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/Sparset-Thinklite-27B-loom
- Modelo base: https://huggingface.co/Sparset/Thinklite-27B-GGUF
- Runtime Loom: https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
