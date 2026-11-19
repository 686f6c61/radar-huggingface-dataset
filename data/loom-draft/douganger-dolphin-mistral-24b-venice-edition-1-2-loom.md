# loom-draft/douganger-Dolphin-Mistral-24B-Venice-Edition-1.2-loom

## Resumen

Este repositorio no contiene un modelo de lenguaje nuevo, sino un paquete de despliegue en formato Loom (`.loom` y un `model.json`) que empaqueta el checkpoint GGUF sin modificar `Dolphin-Mistral-24B-Venice-Edition-Q4_K_M.gguf`, publicado originalmente por `douganger`. El paquete lo genera la herramienta `loom-next` (sin intervención de un LLM en el bucle) y lo publica la cuenta `loom-draft`, orientado al ecosistema Loom de ROCm para GPUs AMD.

El objetivo es ofrecer una ruta de ejecución lista para hardware AMD concreto: la APU AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete expone un servidor compatible con la API de OpenAI (`/v1/chat/completions`) mediante `loom-serve`, con un preset de contexto de 108.544 tokens por petición, concurrencia de 4 peticiones y un máximo de 4.096 tokens de salida.

La relevancia es acotada: no aporta pesos nuevos ni mejoras de calidad respecto al modelo base, sino una integración de inferencia para GPUs AMD con kernels generados. En el momento de la consulta, las mediciones de rendimiento y las puertas de corrección (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `logits`, entre otras) figuran como «not yet re-measured», es decir, sin evidencia registrada. El repositorio tiene 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base Dolphin-Mistral-24B; no se detalla en la informacion proporcionada) |
| Parametros totales | 24B (segun el nombre del modelo base); valor exacto no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 108.544 tokens por peticion (preset del paquete Loom) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Dolphin-Mistral-24B-Venice-Edition-Q4_K_M.gguf`) empaquetado como programas `.loom` + `model.json` |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base: no se detallan el tipo de transformer, la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo etapas de RLHF, DPO o fine-tuning supervisado. El nombre del checkpoint sugiere un modelo de la familia Mistral con 24.000 millones de parametros, ajustado por `douganger` bajo la denominacion Dolphin/Venice Edition, pero el repositorio Loom no aporta la model card original ni datos de entrenamiento.

La innovacion tecnica de este repositorio no esta en los pesos, sino en el empaquetado: `loom-next` genera kernels y programas `.loom` para ejecutar el GGUF sobre ROCm en gfx1151 y gfx1201, con verificacion de integridad sha256 de los ficheros fuente mediante `loom-fetch`. El paquete incluye un preset de memoria de pool fijo (`--pool_backing=fixed`), precarga de parametros en host (`--parameter_mode=preload`) y espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`), ajuste con el que se midieron las (ausentes) cifras de rendimiento de la tarjeta.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`), con el identificador de modelo `dolphin-mistral-24b-venice-edition-1.2`.
- Contexto largo: hasta 108.544 tokens por peticion en el preset publicado.
- Concurrencia de 4 peticiones simultaneas.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- Tool calling: no aplicable segun la tabla de caracteristicas del paquete.
- Razonamiento / modo thinking y esfuerzo de razonamiento: no aplicable.
- Decodificacion especulativa: no aplicable.
- Entrada de imagen: no soportada por Loom, aunque el modelo de origen la admite segun la propia model card.
- Entrada y salida de audio: no aplicable.
- Muestreo (temperature, top_k, seed): estado «?», no determinado.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue local en APU Strix Halo: un desarrollador con un Ryzen AI Max+ 395 puede instalar `hrx-loom[hf]==0.2.0`, descargar el paquete con `loom-fetch` y levantar un endpoint compatible con OpenAI en `127.0.0.1:8080`, sin depender de CUDA ni de servicios en la nube.
- Inferencia en estacion de trabajo con R9700: en una Radeon AI PRO R9700 de 32 GB se usa el preset `chat-r9700`, pensado para el mismo GGUF Q4_K_M, lo que permite integrar el modelo en herramientas que ya hablan el protocolo de OpenAI.
- Procesamiento de documentos largos: con 108.544 tokens de contexto por peticion, el modelo puede recibir contratos, informes o bases de codigo extensas en una sola llamada, util para resumen y extraccion de datos en local.
- Prototipado de asistentes conversacionales: la API estilo OpenAI permite apuntar clientes existentes (SDKs, interfaces de chat) al servidor Loom cambiando solo la URL base y el nombre del modelo.
- Evaluacion comparativa de runtimes AMD: el paquete sirve como banco de pruebas para contrastar los kernels generados por Loom frente a llama.cpp sobre el mismo GGUF, mediante las puertas `golden` y `compare` cuando se registren mediciones.
- Servicio interno multiusuario ligero: con 4 peticiones concurrentes y salida limitada a 4.096 tokens, encaja en un asistente de equipo de baja carga alojado en hardware propio, sin coste por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo y para Radeon AI PRO R9700 «are not yet re-measured», y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como «not yet re-measured». Tampoco se aportan cifras de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 24B, lo que en la practica ronda los 14-15 GB de pesos, pero la model card no publica la cifra.
- GPU soportadas oficialmente por el paquete: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Cabe en GPU de consumo: no confirmado; el paquete solo declara soporte para las dos plataformas AMD anteriores, no para GPUs NVIDIA ni para otras Radeon.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servir la API; no se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de este paquete.
- Latencia y throughput: no disponibles; las filas de rendimiento de la tarjeta no se han vuelto a medir.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Estado de benchmarks |
|---|---|---|---|---|---|
| Este paquete (Loom, Dolphin-Mistral-24B-Venice 1.2 Q4_K_M) | 24B (nominal) | 108.544 tokens por peticion | GGUF + programas `.loom`, `loom-serve` sobre ROCm | Apache 2.0 | Sin medir (todas las puertas «not yet re-measured») |
| `douganger/Dolphin-Mistral-24B-Venice-Edition-1.2-GGUF` (modelo base) | 24B (nominal) | no disponible en la informacion proporcionada | GGUF, ejecutable con llama.cpp y derivados | Apache 2.0 (heredada) | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar rendimiento, calidad o latencia con alternativas concretas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo nuevo: los pesos son el GGUF original de `douganger` sin modificar; cualquier limitacion del modelo base (sesgos, alucinaciones, calidad en castellano) se hereda integra.
- Ausencia total de evidencia de correccion: las puertas `golden`, `compare`, `consistency`, `agent`, `logits` y el resto no tienen ejecuciones registradas, por lo que no hay garantia publicada de que la salida coincida con la referencia de llama.cpp.
- Sin mediciones de rendimiento: no se puede estimar latencia ni throughput ni verificar la afirmacion de mejora frente a llama.cpp.
- Tool calling, modo thinking, decodificacion especulativa y audio marcados como «not applicable»; no se deben asumir en produccion.
- Entrada de imagen no soportada por Loom aunque el modelo de origen la admite: los casos multimodales no funcionan con este paquete.
- Muestreo no determinado: el comportamiento de temperature, top_k y seed no esta verificado.
- Concurrencia limitada a 4 peticiones y salida maxima de 4.096 tokens: insuficiente para cargas de produccion medias o altas.
- Plataformas restringidas a Strix Halo y Radeon AI PRO R9700; no se declara compatibilidad con otras GPU.
- Idiomas soportados no declarados: no hay confirmacion del rendimiento en castellano.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad.
- Licencia Apache 2.0 declarada, que en principio permite uso comercial, pero conviene verificar que el modelo base y sus datos de entrenamiento respalden esa licencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/douganger-Dolphin-Mistral-24B-Venice-Edition-1.2-loom
- Modelo base en Hugging Face: https://huggingface.co/douganger/Dolphin-Mistral-24B-Venice-Edition-1.2-GGUF
- Repositorio ROCm/hrx-system (Loom): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
