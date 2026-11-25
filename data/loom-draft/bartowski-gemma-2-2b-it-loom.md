# loom-draft/bartowski-gemma-2-2b-it-loom

## Resumen

`loom-draft/bartowski-gemma-2-2b-it-loom` es un paquete de despliegue en formato Loom que empaqueta el checkpoint GGUF sin modificar `bartowski/gemma-2-2b-it-GGUF`, en su cuantizacion Q4_K_M, para su ejecucion sobre GPUs AMD concretas: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). No se trata de un modelo nuevo ni de un fine-tune: los pesos son los de Gemma 2 2B Instruct de Google, y lo que aporta el repositorio es un conjunto de programas `.loom` generados con la herramienta `loom-next`, junto con un `model.json` que describe el paquete, para servir el modelo mediante `loom-serve` con una API compatible con OpenAI.

El interes practico esta en el stack de inferencia: Loom es un runtime de AMD (bajo el paraguas de ROCm/hrx-system) que compila kernels especificos para estas GPUs y permite desplegar el modelo con un servidor HTTP local sin depender de llama.cpp en produccion, aunque usa referencias de llama.cpp para validar la correccion. El modelo subyacente, Gemma 2 2B Instruct, es un transformer decoder-only de aproximadamente 2.600 millones de parametros con ventana de contexto nativa de 8.192 tokens, pensado para tareas de generacion de texto y dialogo en ingles.

Es relevante ahora porque documenta el estado incipiente de un ecosistema alternativo para acelerar LLMs en hardware AMD de consumo y profesional, y porque muestra un patron de distribucion (paquetes precompilados por GPU objetivo) poco habitual en el ecosistema Hugging Face, dominado por GGUF y safetensors genericos. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su model card indica que las mediciones de rendimiento y las puertas de correccion aun no se han vuelto a medir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2), empaquetado como programas Loom generados |
| Parametros totales | Aproximadamente 2.600 millones (Gemma 2 2B; cifra no explicita en la informacion proporcionada) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens por peticion (limite del preset Loom) |
| Tipos de cuantizacion | Q4_K_M (GGUF de origen, `gemma-2-2b-it-Q4_K_M.gguf`) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Gemma (terminos de uso de Google) |
| Formato de pesos | Paquete Loom (`program/*.loom`, `weights.loom`, `model.json`, `tokenizer.json`, `llm_config.json`); derivado de GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 2 2B Instruct, un transformer decoder-only denso de Google entrenado sobre datos de texto y ajustado con instrucciones; la informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones de atencion especificas en esta ficha, mas alla de las propias de la familia Gemma 2.

La capa que anade este repositorio es el empaquetado Loom: `loom-next` genera programas `.loom` y un fichero `weights.loom` a partir del GGUF original, junto con `llm_config.json` y el tokenizador. El servidor `loom-serve` expone esos programas mediante una API estilo OpenAI, con un pool de memoria fijo (`--pool_backing=fixed`), precarga de parametros (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`). La correccion se valida contra referencias de llama.cpp mediante puertas (`golden`, `compare`, `consistency`, `spec`, `agent`, entre otras), aunque en esta version todas aparecen como "not yet re-measured".

## Capacidades

- Generacion de texto y dialogo multi-turno en el formato de chat de Gemma 2 Instruct.
- Razonamiento y respuesta a instrucciones propias del ajuste instruct del modelo base.
- Generacion de codigo y matematicas basicas, segun las capacidades del checkpoint Gemma 2 2B Instruct (no verificadas en esta ficha).
- Servidor HTTP con endpoint `/v1/chat/completions` compatible con OpenAI.
- Concurrencia de hasta 4 peticiones simultaneas.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- Tool calling: no aplicable segun la model card.
- Modo thinking o reasoning effort: no aplicable.
- Decodificacion especulativa: no aplicable.
- Entrada de imagen o audio: no aplicable.
- Muestreo (temperature, top_k, seed): estado "no determinado" en la model card.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo AMD: el modelo se sirve con `loom-serve` sobre Strix Halo o R9700 y responde por HTTP en `/v1/chat/completions`, lo que permite integrarlo en herramientas internas sin salir del hardware local.
- Prototipado de aplicaciones de chat con SDK compatibles con OpenAI: al exponer una API equivalente, se puede apuntar cualquier cliente que hable el protocolo de OpenAI al endpoint local y cambiar de backend sin reescribir codigo.
- Evaluacion comparativa de runtimes en AMD: el paquete incluye puertas de correccion contra llama.cpp (`golden`, `compare`, `consistency`), lo que lo hace util para medir fidelidad numerica de kernels generados frente al runtime de referencia.
- Despliegue en entornos con GPU Radeon AI PRO R9700 de 32 GB: el modelo Q4_K_M ocupa una fraccion pequena de la VRAM, lo que deja margen para el pool de memoria fijo y hasta 4 peticiones concurrentes.
- Generacion de texto por lotes con contexto medio: con 8.192 tokens por peticion y 4.096 de salida, sirve para resumir documentos, redactar respuestas y clasificar texto en pipelines internos.
- Banco de pruebas para desarrollo de kernels: los ficheros `program/*.loom` y `weights.loom` permiten inspeccionar y reutilizar los programas generados en el desarrollo de `loom-next` y `loom-serve`.
- Educacion y experimentacion con stacks de inferencia alternativos: util para quienes quieran estudiar como se empaqueta un GGUF en un formato de despliegue especifico de GPU sin tocar los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" en esta version del paquete, y que todas las puertas de correccion aparecen como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: el checkpoint Q4_K_M de Gemma 2 2B ronda los 1,7-2 GB de pesos; el pool de memoria fijo de Loom anade overhead no cuantificado en la informacion proporcionada.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPUs de consumo: no disponible; el paquete esta generado para las dos arquitecturas AMD citadas y no se documenta soporte para otras.
- Despliegue: `hrx-loom[hf]==0.2.0` mediante `pipx`, con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; las tablas de rendimiento frente a llama.cpp estan pendientes de re-medicion.
- Concurrencia: 4 peticiones simultaneas segun el preset.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `loom-draft/bartowski-gemma-2-2b-it-loom` (este) | ~2,6 B | 8.192 tokens | Paquete Loom para gfx1151 y gfx1201 | Gemma | Hugging Face, 0 descargas |
| `bartowski/gemma-2-2b-it-GGUF` (base) | ~2,6 B | 8.192 tokens (nativo) | GGUF, ejecutable en llama.cpp y derivados | Gemma | Hugging Face, ampliamente usado |
| Gemma 2 2B Instruct original (Google) | ~2,6 B | 8.192 tokens | Safetensors, ecosistema Transformers | Gemma | Hugging Face y Vertex AI |

La comparativa se limita al mismo checkpoint en distintos formatos porque la informacion proporcionada no incluye datos de rendimiento que permitan contrastarlo con modelos de otros desarrolladores.

## Limitaciones y advertencias

- No es un modelo nuevo: los pesos son identicos al GGUF de `bartowski/gemma-2-2b-it-GGUF`; cualquier limitacion del modelo base (sesgos, alucinacion, conocimiento limitado) se hereda sin cambios.
- Ambito de hardware muy restringido: solo se documenta para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no hay evidencia de funcionamiento en otras GPUs.
- Sin evidencia de correccion en esta version: todas las puertas (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured".
- Sin mediciones de rendimiento: no hay datos de latencia ni throughput frente a llama.cpp para ninguna de las dos GPUs objetivo.
- Funcionalidades ausentes: sin tool calling, sin modo thinking, sin decodificacion especulativa, sin entrada de imagen ni audio.
- Muestreo sin determinar: el estado de `temperature`, `top_k` y `seed` aparece como "?" en la model card.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de uso de Gemma de Google, que imponen restricciones y obligaciones de atribucion; conviene revisarlos antes de un despliegue en produccion.
- Idiomas soportados no declarados en la informacion proporcionada; el modelo base esta orientado principalmente al ingles.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- La busqueda web no devuelve informacion relacionada con este modelo: los resultados corresponden a Loom (la herramienta de grabacion de pantalla) y a la marca de ropa Loom, sin relacion con el proyecto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/bartowski-gemma-2-2b-it-loom
- Modelo base GGUF: https://huggingface.co/bartowski/gemma-2-2b-it-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
