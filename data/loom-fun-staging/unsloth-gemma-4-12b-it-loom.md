# loom-fun-staging/unsloth-gemma-4-12B-it-loom

## Resumen
Loom es un paquete de despliegue (archivos `.loom` y una tarjeta `model.json`) para el checkpoint GGUF sin modificar `unsloth/gemma-4-12B-it-GGUF` en cuantizacion Q4_K_M, generado con el flujo de trabajo `loom-skills` y publicado por la organizacion `loom-fun-staging`. No se trata de un modelo nuevo ni de un fine-tuning: es un empaquetado optimizado para ejecutar el modelo Gemma 4 de 12B parametros sobre GPU AMD, concretamente la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la tarjeta Radeon AI PRO R9700 (gfx1201, 32 GB).

El paquete resuelve el problema de servir modelos de gran tamano en hardware AMD con un backend propio (`loom-serve`) que expone una API compatible con OpenAI (`/v1/chat/completions`) e incorpora decodificacion especulativa DFlash con profundidad 3 y un drafter dedicado (`Anbeeld/gemma4-12B-it-DFlash-GGUF`). La model card incluye una comparativa de rendimiento frente a llama.cpp ROCm en Strix Halo con techos de roofline calculados, aunque los valores medidos de Loom y llama.cpp aparecen como no registrados en la informacion disponible.

La relevancia actual es doble: por un lado, ofrece una via practica de ejecutar un modelo de 12B en cuantizacion Q4_K_M sobre hardware AMD de consumo y profesional; por otro, documenta de forma transparente el metodo de evaluacion (gates de correccion, comparacion token a token contra llama.cpp, pruebas de concurrencia). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y ocupa 0.0 GB, lo que sugiere que los pesos no estan alojados en el propio repo sino que se materializan desde el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4; el paquete es un contenedor de despliegue, no una arquitectura propia) |
| Parametros totales | 12B (segun el nombre del checkpoint base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 160.768 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (checkpoint `gemma-4-12b-it-Q4_K_M.gguf`) empaquetado como `.loom` + `model.json` |
| Modelo base | unsloth/gemma-4-12B-it-GGUF |
| Backend de inferencia | loom-serve (hrx-loom 0.1.0) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Memoria configurada | 81.000.000.000 bytes (Strix Halo); 34.000.000.000 bytes (R9700) |
| Maximo de tokens de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Decodificacion especulativa | DFlash, profundidad 3, activada por defecto |

## Arquitectura y entrenamiento
El paquete no define una arquitectura de red neuronal propia: envuelve el checkpoint GGUF `gemma-4-12b-it-Q4_K_M.gguf` del modelo Gemma 4 12B instruction-tuned publicado por Unsloth. Por tanto, la arquitectura subyacente es la del modelo Gemma 4 original, sobre la que no se aporta detalle en la informacion disponible (no se especifican capas, atencion, composicion del dataset ni fases de RLHF/DPO). El checkpoint se distribuye sin modificaciones; el valor anadido esta en el runtime y en la configuracion de despliegue.

La innovacion tecnica del paquete es el motor `loom-serve`, que compila kernels especificos para las arquitecturas AMD gfx1151 y gfx1201 y los valida mediante un gate `kernel_tests` contra implementaciones de referencia. Sobre ese motor se activa decodificacion especulativa DFlash con profundidad 3 usando un drafter separado (`Anbeeld/gemma4-12B-it-DFlash-GGUF`), con tasas de aceptacion medidas por sesion: 39 % en decodificacion de contexto corto, 30 % a 2k tokens y 42 % a 32k tokens. La model card calcula el techo de roofline a partir de 216 GB/s de ancho de banda y 59 TFLOP/s del Strix Halo, aplicando la formula de verificacion con profundidad 3 y aceptacion medida.

## Capacidades
- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`), con parametros de muestreo `temperature`, `top_p`, `top_k` y `seed`.
- Tool calling en formato OpenAI (`tools` y `tool_calls`), lo que permite integrar el modelo en flujos de function calling.
- Modo de razonamiento o thinking: desactivado por defecto y activable con `chat_template_kwargs: {"enable_thinking": true}`.
- Decodificacion especulativa DFlash con profundidad 3 activada por defecto, con drafter dedicado.
- Concurrencia de hasta 4 peticiones simultaneas con garantia de consistencia (gate `consistency`: las respuestas concurrentes deben coincidir con las ejecuciones aisladas).
- Contexto de 160.768 tokens por peticion, adecuado para documentos largos y conversaciones multi-turno extensas.
- Entrada de imagen: no soportada por Loom, aunque el modelo upstream la tenga.
- Entrada y salida de audio: no soportadas por Loom, aunque el modelo upstream las tenga.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso
- Asistente conversacional de contexto largo: con 160.768 tokens por peticion se pueden mantener sesiones multi-turno sobre documentacion extensa o historiales completos sin truncar, algo especialmente util en soporte tecnico especializado.
- Procesamiento de documentos largos en local: el prefill medido en roofline alcanza 2.650,7 tok/s con documentos de 1k tokens y 2.212,6 tok/s con 32k, lo que permite analizar contratos, informes o expedientes completos en hardware AMD de sobremesa.
- Agentes con tool calling: la API expone `tools` y `tool_calls` en formato OpenAI, de modo que el modelo puede encadenar llamadas a funciones en pipelines de automatizacion (consulta de bases de datos, envio de correos, gestion de tickets) sin adaptadores propietarios.
- Razonamiento con thinking mode: activando `enable_thinking` se obtienen cadenas de razonamiento para tareas de analisis, planificacion o resolucion de problemas matematicos, con la posibilidad de desactivarlo para reducir latencia en produccion.
- Despliegue en estaciones de trabajo AMD: el paquete esta pensado para Ryzen AI Max+ 395 y Radeon AI PRO R9700, por lo que encaja en equipos de desarrollo con GPU AMD donde no se quiere depender de CUDA ni de servicios en la nube.
- Servicio de inferencia con concurrencia moderada: con 4 peticiones simultaneas y consistencia garantizada, es adecuado para equipos pequenos, demos internas o prototipos de producto que necesiten una API local compatible con OpenAI.
- Aceleracion mediante decodificacion especulativa: en tareas de generacion larga con contexto corto, la aceptacion del 39 % con profundidad 3 reduce el numero de pasadas de verificacion, lo que mejora el throughput efectivo frente a decodificacion autoregresiva pura.

## Benchmarks y rendimiento
La model card incluye una tabla comparativa Loom frente a llama.cpp ROCm en Strix Halo (gfx1151), pero los valores medidos de ambos motores aparecen como no registrados ("—"). Solo se publican los techos de roofline calculados para Loom:

| Metrica | llama.cpp | Loom | Roofline | Loom % del roofline |
|---|---|---|---|---|
| Decode tok/s, prompt corto | no registrado | no registrado | 65,6 | no disponible |
| Decode tok/s, contexto 2k | no registrado | no registrado | 55,3 | no disponible |
| Decode tok/s, contexto 32k | no registrado | no registrado | 61,3 | no disponible |
| Prefill tok/s, documento 1k | no registrado | no registrado | 2.650,7 | no disponible |
| Prefill tok/s, documento 2k | no registrado | no registrado | 2.597,1 | no disponible |
| Prefill tok/s, documento 8k | no registrado | no registrado | 2.508,6 | no disponible |
| Prefill tok/s, documento 16k | no registrado | no registrado | 2.401,5 | no disponible |
| Prefill tok/s, documento 32k | no registrado | no registrado | 2.212,6 | no disponible |
| 4 streams, decode agregado tok/s | no registrado | no registrado | 108,9 | no disponible |
| Tokens especulativos aceptados | n/a | n/a | n/a | n/a |

En Radeon AI PRO R9700 (gfx1201, 32 GB) la model card indica explicitamente que los resultados "no se han vuelto a medir todavia". No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: el paquete configura `--memory_bytes=81000000000` (81 GB) para Strix Halo y `--memory_bytes=34000000000` (34 GB) para la Radeon AI PRO R9700, valores que cubren el checkpoint Q4_K_M de 12B junto con el drafter y el contexto.
- GPU soportadas de forma explicita: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se documenta soporte para GPUs de consumo AMD o NVIDIA; el paquete esta orientado a las dos plataformas AMD citadas.
- Despliegue: `pip install "hrx-loom[hf]==0.1.0"`, seguido de `loom-fetch` para materializar el modelo y `loom-serve` para servir en `127.0.0.1:8080`. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de despliegue de este paquete.
- Latencia y throughput: los valores medidos no estan registrados en la informacion disponible; solo se publican techos de roofline (65,6 tok/s de decode en contexto corto, 108,9 tok/s agregados con 4 streams, y entre 2.212,6 y 2.650,7 tok/s de prefill segun longitud del documento).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Loom (gemma-4-12B-it Q4_K_M) | 12B | 160.768 tokens | Q4_K_M (GGUF) | no disponible | Hugging Face, backend loom-serve para AMD |
| unsloth/gemma-4-12B-it-GGUF (modelo base) | 12B | no disponible en la informacion | GGUF (incluye Q4_K_M) | no disponible | Hugging Face |
| llama.cpp ROCm (referencia de comparacion) | 12B (mismo GGUF) | no disponible | Q4_K_M | no disponible | Codigo abierto, multiplataforma |
| Anbeeld/gemma4-12B-it-DFlash-GGUF (drafter) | no disponible | no disponible | GGUF | no disponible | Hugging Face |

La comparativa se limita a las alternativas citadas en la model card; no se dispone de datos de rendimiento medidos para establecer diferencias cuantitativas entre Loom y llama.cpp ROCm.

## Limitaciones y advertencias
- Los resultados de rendimiento de Loom y llama.cpp aparecen como no registrados en la tabla publicada; las cifras de roofline son techos teoricos, no mediciones reales.
- Los gates de correccion (`kernel_tests`, `golden`, `compare`, `consistency`) no se han vuelto a ejecutar en este paquete: el ultimo pase corresponde a una build anterior (sha256 `7a94943`) y se delega su repeticion a los gates nocturnos.
- En Radeon AI PRO R9700 no se han vuelto a medir ni el rendimiento ni la correccion.
- La comparacion con llama.cpp no es homogenea: Loom usa decodificacion especulativa DFlash con profundidad 3 en las filas de un solo stream, mientras que llama.cpp ROCm se ejecuta sin drafting; los argumentos del servidor llama.cpp no se registraron.
- La entrada de imagen y de audio del modelo upstream no estan soportadas por Loom, por lo que las capacidades multimodales de Gemma 4 quedan inaccesibles en este paquete.
- El paquete esta limitado a 4 peticiones concurrentes y a un maximo de 4.096 tokens de salida por defecto.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, cobertura idiomatica ni restricciones de licencia para uso comercial; la licencia figura como no disponible tanto en Hugging Face como en la model card.
- El repositorio tiene 0 descargas y 0 likes, y su contenido ocupa 0.0 GB: los pesos se materializan desde el modelo base, por lo que la disponibilidad depende de que dicho checkpoint siga accesible.
- El paquete esta atado a hardware AMD especifico (gfx1151 y gfx1201) y a la version `hrx-loom[hf]==0.1.0`; no se documenta compatibilidad con otras GPUs ni con versiones posteriores del runtime.

## Enlaces
- Repositorio Hugging Face del paquete: https://huggingface.co/loom-fun-staging/unsloth-gemma-4-12B-it-loom
- Modelo base GGUF: https://huggingface.co/unsloth/gemma-4-12B-it-GGUF
- Drafter DFlash: https://huggingface.co/Anbeeld/gemma4-12B-it-DFlash-GGUF
- Repositorio del runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
