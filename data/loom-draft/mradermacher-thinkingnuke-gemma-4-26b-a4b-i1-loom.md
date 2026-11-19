# loom-draft/mradermacher-ThinkingNuke-gemma-4-26B-A4B-i1-loom

## Resumen

ThinkingNuke-gemma-4-26B-A4B-i1-loom es un paquete de despliegue en formato `.loom` para el checkpoint GGUF `ThinkingNuke-gemma-4-26B-A4B.i1-Q4_K_M.gguf`, publicado por el usuario loom-draft. No se trata de un modelo entrenado desde cero, sino de un artefacto de inferencia generado con la herramienta `loom-next` a partir del GGUF de mradermacher, que a su vez deriva de un fine-tune sobre una base Gemma 4 de 26B de parametros totales y 4B activos (arquitectura MoE segun la nomenclatura A4B). El paquete incluye programas `.loom` y una tarjeta `model.json` para servir el modelo con `loom-serve` sobre GPUs AMD.

El objetivo del paquete es permitir la ejecucion del modelo en hardware AMD especifico: el AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB). Incluye presets de comandos para ambos destinos, una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling y un modo de razonamiento opcional (desactivado por defecto). La ventana de contexto configurada es de 201.728 tokens por peticion, con 4 peticiones concurrentes y un maximo de 4.096 tokens de salida por preset.

La relevancia de esta ficha es acotada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamano de 0.0 GB y no incluye resultados de rendimiento ni de correccion medidos para este paquete ("not yet re-measured" en todas las puertas). La licencia declarada es Apache 2.0, heredada del modelo base. Los resultados de busqueda web disponibles no aportan informacion tecnica sobre este modelo: corresponden a la herramienta de grabacion de pantalla Loom y a la marca de ropa Loom, sin relacion con el proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre indica Gemma 4 con variante A4B, presumiblemente MoE; no confirmado en la informacion) |
| Parametros totales | 26B (segun el identificador del modelo) |
| Parametros activos | 4B (segun el sufijo A4B del identificador; no confirmado) |
| Longitud de contexto | 201.728 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint referenciado en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (empaquetado en formato `.loom` con programas y `model.json`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo en la documentacion proporcionada. El identificador `gemma-4-26B-A4B` sugiere una base Gemma 4 de 26B de parametros totales con 4B activos, lo que apuntaria a una arquitectura de mezcla de expertos (MoE), pero este dato no esta confirmado en la model card. El paquete en si no modifica los pesos: es un artefacto de despliegue generado por `loom-next` a partir del GGUF `ThinkingNuke-gemma-4-26B-A4B.i1-Q4_K_M.gguf` de mradermacher, que a su vez es una cuantizacion del fine-tune ThinkingNuke.

Tampoco se documentan en la informacion disponible los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. El unico detalle tecnico relevante del paquete es el modo de razonamiento opcional: el modelo soporta un "thinking mode" que se activa mediante `chat_template_kwargs: {"enable_thinking": true}` y que esta desactivado por defecto. La decodificacion especulativa figura como "not applicable" en la tabla de caracteristicas del paquete.

## Capacidades

- Generacion de texto y razonamiento: el modelo soporta un modo de razonamiento opcional que se activa por peticion mediante `enable_thinking`.
- Tool calling: soporte de `tools` y `tool_calls` con el esquema de OpenAI, con una puerta de correccion especifica para el bucle multi-turno de llamadas a herramientas (`agent` y `agent_think_off`).
- API compatible con OpenAI: endpoint `/v1/chat/completions` en el servidor `loom-serve`.
- Concurrencia: hasta 4 peticiones simultaneas, con una puerta de correccion (`consistency`) que verifica que las peticiones concurrentes producen la misma salida que las mismas peticiones ejecutadas de forma aislada.
- Contexto largo: 201.728 tokens por peticion, con pruebas de referencia en documentos de 1k a 32k tokens.
- Entrada de imagen: no soportada por Loom, aunque el modelo original la tiene segun la model card.
- Entrada y salida de audio: no soportadas por Loom, aunque el modelo original las tiene segun la model card.
- Sampling: estado "not determined" en la tabla de caracteristicas del paquete.
- Decodificacion especulativa: no aplicable en este paquete.
- Capacidades multilingues: no disponibles en la informacion.

## Casos de uso

- Despliegue en hardware AMD Strix Halo: el paquete incluye un preset `chat` con los comandos `loom-fetch` y `loom-serve` listos para el Ryzen AI Max+ 395 (gfx1151), lo que permite arrancar un servidor de inferencia local sin compilar kernels ni configurar el entorno manualmente.
- Despliegue en Radeon AI PRO R9700: el preset `chat-r9700` (gfx1201, 32 GB) ofrece el mismo flujo para una GPU de escritorio profesional con 32 GB de VRAM, adecuada para servir el checkpoint Q4_K_M con contexto largo.
- Asistente conversacional con contexto extenso: con 201.728 tokens por peticion, el modelo puede mantener conversaciones multi-turno sobre documentos largos (por ejemplo, analisis de contratos o revision de codigo de repositorios completos) sin truncar el historial.
- Agente con tool calling: el soporte de `tools` y `tool_calls` en formato OpenAI permite integrar el modelo en un bucle de agente que consulte APIs externas, ejecute busquedas o realice operaciones sobre ficheros, con validacion de la correccion del bucle mediante la puerta `agent`.
- Razonamiento con thinking mode controlado: para tareas que requieren cadena de pensamiento (matematicas, planificacion), se puede activar `enable_thinking` por peticion y desactivarlo en las llamadas de baja latencia, manteniendo el mismo servidor.
- Servicio local compatible con clientes OpenAI: al exponer `/v1/chat/completions`, el modelo puede conectarse a clientes existentes (SDKs de OpenAI, frameworks de agentes, interfaces de chat) apuntando a `http://127.0.0.1:8080` sin cambios en el codigo del cliente.
- Evaluacion de hardware AMD para inferencia de LLM: el paquete sirve como banco de pruebas reproducible para medir latencia y throughput en Strix Halo y R9700 con un checkpoint concreto, aunque las mediciones de rendimiento de este paquete aun no estan publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo y R9700, pero en ambos casos indica: "the results for this package are not yet re-measured". De forma similar, la tabla de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) muestra "not yet re-measured" en todas las puertas para ambas GPUs.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M sobre un modelo de 26B de parametros totales, y el preset de R9700 asume 32 GB de VRAM.
- GPU soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPUs de consumo: no disponible; no se mencionan GPUs NVIDIA ni modelos de consumo en la documentacion.
- Opciones de despliegue: `loom-serve` (instalado via `pipx install "hrx-loom[hf]==0.2.0"`) y `loom-fetch` para descargar el paquete desde Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en este paquete.
- Ajustes de rendimiento documentados: `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU), `--pool_backing=fixed` (reserva fija del pool de memoria) y `--parameter_mode=preload` (carga de pesos en host).
- Latencia y throughput: no disponibles; las mediciones de rendimiento del paquete aun no se han vuelto a medir.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones comparables de otros modelos de la misma categoria, y los resultados de busqueda web no aportan informacion tecnica sobre modelos alternativos.

## Limitaciones y advertencias

- Repositorio sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, con un tamano de repo de 0.0 GB.
- Sin mediciones de rendimiento ni de correccion para este paquete: todas las puertas de la tabla de correccion y las comparativas frente a llama.cpp figuran como "not yet re-measured" para Strix Halo y R9700.
- Capacidades del modelo original no disponibles en Loom: la entrada de imagen y la entrada/salida de audio no estan soportadas por el runtime, aunque el modelo upstream las tenga.
- Sampling sin determinar: la tabla de caracteristicas marca el muestreo como "not determined".
- Decodificacion especulativa no aplicable en este paquete.
- Idiomas soportados no documentados: no se puede confirmar el comportamiento multilingue.
- Arquitectura y datos de entrenamiento no confirmados: el identificador sugiere Gemma 4 con variante MoE A4B, pero la model card no lo detalla.
- Licencia Apache 2.0 declarada, heredada del modelo base; conviene verificar las condiciones del fine-tune ThinkingNuke y del GGUF original antes de un uso comercial.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; aplican las advertencias habituales de los modelos de lenguaje.
- Dependencia de un runtime especifico (`hrx-loom==0.2.0`) y de hardware AMD concreto; no se documenta portabilidad a otras plataformas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/mradermacher-ThinkingNuke-gemma-4-26B-A4B-i1-loom
- Modelo base (GGUF): https://huggingface.co/mradermacher/ThinkingNuke-gemma-4-26B-A4B-i1-GGUF
- Repositorio del runtime Loom: https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
