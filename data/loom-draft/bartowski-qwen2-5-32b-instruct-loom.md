# loom-draft/bartowski-Qwen2.5-32B-Instruct-loom

## Resumen

`loom-draft/bartowski-Qwen2.5-32B-Instruct-loom` es un paquete de distribucion para el runtime AMD Loom del checkpoint GGUF `Qwen2.5-32B-Instruct-Q4_K_M.gguf` publicado por bartowski. No es un modelo nuevo ni un fine-tune: los pesos son los del Qwen2.5-32B-Instruct original de Alibaba Qwen, sin modificaciones, empaquetados como programas `.loom` y un `model.json` que describen como ejecutarlos sobre las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB).

El paquete ha sido generado con `loom-next`, el generador del ecosistema Loom, sin intervencion de un LLM en el bucle. Su proposito es ofrecer una ruta de despliegue nativa para ROCm sobre hardware AMD consumer y de estacion de trabajo, con una API compatible con OpenAI (`/v1/chat/completions`) servida mediante `loom-serve`. La relevancia actual es acotada pero concreta: cubre el hueco de servir un modelo denso de 32B en cuantizacion Q4_K_M sobre GPUs AMD de 32 GB de memoria unificada o dedicada, un escenario donde las alternativas suelen ser llama.cpp compilado a mano o soluciones propietarias.

El checkpoint subyacente es un transformer denso de 32.800 millones de parametros de Qwen2.5, con 32.768 tokens de contexto por peticion en esta configuracion, soporte de tool calling estilo OpenAI y hasta 4 peticiones concurrentes. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5), empaquetado como programas `.loom` para el runtime AMD Loom |
| Parametros totales | 32,8 mil millones (32B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 32.768 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico incluido en el paquete) |
| Idiomas soportados | no disponible en la informacion del paquete; hereda los del Qwen2.5-32B-Instruct base |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Qwen2.5-32B-Instruct-Q4_K_M.gguf) + programas `.loom` generados y `weights.loom` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` |
| Tool calling | Si, estilo OpenAI (`tools` y `tool_calls`) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0`, comando `loom-serve` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-32B-Instruct, un transformer decoder-only denso de Alibaba Qwen con 32.800 millones de parametros. La informacion proporcionada no detalla la composicion del dataset de preentrenamiento, el numero de tokens ni las etapas de alineacion (RLHF/DPO) del checkpoint original; esos datos corresponden a la model card de Qwen2.5 y no se reproducen aqui. Lo que si es especifico de este paquete es la capa de despliegue: `loom-next` genera kernels y programas `.loom` a partir del GGUF y de un `llm_config.json`, con `weights.loom` como contenedor de pesos y `tokenizer.json` para el tokenizador.

La innovacion tecnica del paquete no esta en el modelo sino en el runtime: ejecucion nativa sobre ROCm con pooling de memoria fijo (`--pool_backing=fixed`), precarga de parametros en host (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`), que consume CPU mientras hay trabajo en vuelo pero reduce latencia. El paquete incluye ademas una bateria de puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp registrada sobre el mismo GGUF. En el momento de publicacion de la model card, ninguna de esas puertas tiene medicion registrada para este paquete concreto.

## Capacidades

- Generacion de texto y razonamiento general, heredados de Qwen2.5-32B-Instruct.
- Generacion de codigo y matematicas, con el nivel del checkpoint base de 32B.
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls` estructurados.
- Bucles de agente multi-turno con reutilizacion de historial (cubierto por la puerta `agent`).
- API compatible con OpenAI, lo que permite sustituir clientes existentes apuntando a `http://127.0.0.1:8080/v1`.
- Concurrencia de 4 peticiones con consistencia verificable (puerta `consistency`).
- Capacidades multilingues: no disponibles en la informacion del paquete; dependen del checkpoint Qwen2.5 base.
- Sin modo thinking, sin razonamiento configurable, sin decodificacion especulativa, sin entrada de imagen ni audio: la model card marca explicitamente estas funciones como no aplicables.
- Muestreo (`temperature`, `top_k`, `seed`): estado "no determinado" en la tabla de caracteristicas.

## Casos de uso

- Servicio local de chat sobre GPU AMD: desplegar `loom-serve` en una R9700 de 32 GB o en un Strix Halo y exponer un endpoint compatible con OpenAI para herramientas internas que ya hablan el protocolo de OpenAI, sin reescribir clientes.
- Asistente de codigo en estacion de trabajo: el checkpoint de 32B ofrece calidad suficiente para autocompletado y explicacion de codigo, y el tool calling permite conectarlo a un servidor de herramientas que consulte el repositorio o ejecute tests.
- Agente de automatizacion multi-paso: con 4 peticiones concurrentes y bucles de tool calling verificados, encaja en tareas de orquestacion donde el modelo encadena busquedas, lecturas de ficheros y escrituras acotadas.
- Procesamiento de documentos de hasta 32k tokens: resumen y extraccion de contratos, informes o transcripciones en una sola peticion, sin troceado, gracias a la ventana de 32.768 tokens.
- Evaluacion de hardware AMD para equipos de infraestructura: el paquete sirve como banco de pruebas reproducible para medir ROCm y el runtime Loom frente a llama.cpp sobre el mismo GGUF, con puertas de correccion token a token.
- Entorno de desarrollo sin dependencia de la nube: al ejecutarse integramente en local sobre una GPU de 32 GB, permite trabajar con datos sensibles sin salida a internet.
- Laboratorio de investigacion en inferencia: util para estudiar el efecto de `completion_spin_ns`, `pool_backing` y `parameter_mode` en latencia y throughput sobre gfx1151 y gfx1201.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que tanto las mediciones de rendimiento frente a llama.cpp como las puertas de correccion estan "not yet re-measured" para Strix Halo (gfx1151) y para Radeon AI PRO R9700 (gfx1201). No se dispone de cifras de MMLU, HumanEval, GSM8K ni de tokens por segundo para este paquete.

## Requisitos de hardware

- VRAM estimada: el checkpoint Q4_K_M de un modelo de 32B ocupa del orden de 19-20 GB en pesos; con cache KV para 32k tokens y overhead del runtime hay que prever margen sobre 24 GB, por lo que 32 GB es el objetivo realista.
- GPU soportadas segun la model card: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB dedicados).
- GPU consumer: no hay soporte declarado para RTX 4090, A100 ni H100; el paquete esta generado para arquitecturas AMD gfx1151 y gfx1201. En consumer AMD, solo el Strix Halo aparece como objetivo.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servir. No se mencionan vLLM, TGI, Ollama ni llama.cpp como backends de este paquete; llama.cpp aparece solo como referencia de correccion.
- Flags relevantes: `--pool_backing=fixed` reserva el pool de memoria por adelantado y `--parameter_mode=preload` precarga pesos en host; `completion_spin_ns=4294967295` activa espera activa y es la configuracion usada en las mediciones de la card.
- Latencia y throughput: no disponibles; las filas de rendimiento no estan medidas para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime / hardware | Notas |
|---|---|---|---|---|---|---|
| bartowski-Qwen2.5-32B-Instruct-loom (este) | 32B denso | 32.768 | Q4_K_M | Apache 2.0 | Loom sobre gfx1151 / gfx1201 | Paquete de despliegue, sin benchmarks publicados |
| bartowski/Qwen2.5-32B-Instruct-GGUF | 32B denso | 32.768 (segun config del GGUF) | Multiples (Q2 a Q8) | Apache 2.0 | llama.cpp y derivados, CPU/GPU genericas | Mismo checkpoint, ecosistema mas amplio y maduro |
| Qwen2.5-32B-Instruct (original) | 32B denso | 131.072 en la version base | safetensors (BF16) | Apache 2.0 (con terminos de Qwen) | vLLM, TGI, transformers | Referencia de calidad; requiere mucha mas VRAM en BF16 |

La comparacion con alternativas de otro fabricante (Llama 3.3 70B, Mistral Large, etc.) no esta disponible en la informacion proporcionada y no se incluye para no introducir datos no verificados.

## Limitaciones y advertencias

- El paquete no aporta ninguna mejora de calidad sobre el checkpoint base: es el mismo Qwen2.5-32B-Instruct en Q4_K_M, con la perdida de precision que implica esa cuantizacion.
- Cero evidencia de correccion registrada: todas las puertas (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". No hay garantia publicada de que la salida coincida con llama.cpp.
- Cero mediciones de rendimiento: no se puede afirmar que sea mas rapido o mas lento que llama.cpp sobre el mismo hardware.
- El estado del muestreo aparece como "no determinado", lo que impide asumir el comportamiento de `temperature`, `top_k` y `seed` sin verificacion propia.
- Alcance de hardware muy restringido: solo gfx1151 y gfx1201. No hay soporte declarado para NVIDIA ni para otras GPU AMD.
- Contexto limitado a 32.768 tokens por peticion en este preset, frente a los 131.072 del Qwen2.5-32B-Instruct original.
- Salida maxima de 4.096 tokens y concurrencia de 4 peticiones: insuficiente para cargas de alta concurrencia en produccion.
- Riesgo de alucinacion y sesgos: los inherentes al checkpoint Qwen2.5-32B-Instruct; la informacion proporcionada no documenta evaluaciones de sesgo para este paquete.
- Licencia Apache 2.0 declarada en el paquete, pero conviene verificar los terminos del checkpoint Qwen2.5 original antes de un uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad.
- La busqueda web no devolvio ningun resultado relacionado con este modelo; los enlaces obtenidos corresponden a productos homonimos sin relacion (Loom la herramienta de grabacion de pantalla y la marca de ropa Loom).

## Enlaces

- Hugging Face: https://huggingface.co/loom-draft/bartowski-Qwen2.5-32B-Instruct-loom
- Modelo base GGUF: https://huggingface.co/bartowski/Qwen2.5-32B-Instruct-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
