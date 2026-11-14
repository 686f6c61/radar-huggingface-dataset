# loom-fun-staging/bartowski-Qwen2.5-32B-Instruct-loom

## Resumen

`loom-fun-staging/bartowski-Qwen2.5-32B-Instruct-loom` es un paquete de despliegue (formato `.loom`) que empaqueta el checkpoint GGUF `Qwen2.5-32B-Instruct-Q4_K_M.gguf` de bartowski, sin modificaciones en los pesos, junto con un `model.json` y un conjunto de programas `.loom` generados mediante el flujo de trabajo `loom-skills`. El objetivo no es ofrecer un modelo nuevo, sino una ruta de ejecucion optimizada para GPUs AMD: en concreto, el SoC AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es Qwen2.5-32B-Instruct, un transformer denso de 32.000 millones de parametros de Alibaba Qwen, ajustado para instrucciones y con capacidades de tool calling. Este paquete lo expone mediante un servidor compatible con la API `/v1/chat/completions` de OpenAI, con una ventana de contexto de 32.768 tokens por peticion, concurrencia de 4 peticiones y un maximo de 4.096 tokens de salida.

La relevancia de este paquete es fundamentalmente de infraestructura: demuestra una alternativa a llama.cpp ROCm para servir un GGUF de 32B en hardware AMD de consumo y profesional, con metricas de roofline publicadas para Strix Halo. No incorpora pesos nuevos, fine-tuning ni cambios en la tokenizacion; cualquier capacidad del modelo es la de Qwen2.5-32B-Instruct original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5-32B-Instruct); empaquetado como programa `.loom` sobre GGUF |
| Parametros totales | 32.000 millones (32B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); el paquete distribuye ese checkpoint concreto |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | no disponible en la informacion proporcionada |
| Formato de pesos | GGUF (`Qwen2.5-32B-Instruct-Q4_K_M.gguf`), empaquetado como `.loom` con `model.json` |

## Arquitectura y entrenamiento

El paquete no define una arquitectura propia: reutiliza el transformer denso de Qwen2.5-32B-Instruct, cuantizado a Q4_K_M por bartowski. La contribucion tecnica del paquete es el runtime: kernels generados para los objetivos AMD gfx1151 (Strix Halo) y gfx1201 (Radeon AI PRO R9700), servidos mediante `loom-serve` con espera activa (`completion_spin_ns=4294967295`) y limites de memoria configurables (`--memory_bytes=50000000000` en Strix Halo, `34000000000` en R9700).

No se documentan en la informacion disponible los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, fases de RLHF/DPO). Tampoco se declara decodificacion especulativa: el GGUF no incluye cabeza MTP y no hay drafter publicado para este modelo exacto, por lo que las filas de speculative decoding figuran como no aplicables. Las pruebas de correctitud (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `sampling`) no se han vuelto a ejecutar sobre este paquete; el ultimo pase documentado corresponde a una build anterior con sha256 `54559e8`.

## Capacidades

- Generacion de texto conversacional y de instrucciones, heredada de Qwen2.5-32B-Instruct.
- Tool calling en estilo OpenAI: acepta `tools` y devuelve `tool_calls`.
- Servidor compatible con `/v1/chat/completions` de OpenAI en `127.0.0.1:8080`.
- Muestreo configurable: `temperature`, `top_p`, `top_k` y `seed`.
- Concurrencia de 4 peticiones simultaneas.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- Sin modo de razonamiento/thinking (marcado como no aplicable).
- Sin decodificacion especulativa (no aplicable).
- Sin entrada de imagen ni audio (no aplicable).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Servicio de chat autohospedado en Strix Halo: desplegar `loom-serve` con `--memory_bytes=50000000000` para atender conversaciones multi-turno con hasta 32.768 tokens de contexto, sin depender de llama.cpp.
- Asistente con tool calling en produccion: integrar el endpoint OpenAI-compatible en un orquestador de agentes que necesite emitir `tool_calls` validos en bucles multi-turno.
- Procesamiento de documentos largos: la ventana de 32k permite resumir o extraer informacion de documentos de hasta ~32.000 tokens en una sola peticion, con prefill medido en la roofline de Strix Halo (707,6 tok/s a 32k).
- Despliegue en estacion de trabajo con Radeon AI PRO R9700: servir el mismo paquete con `--memory_bytes=34000000000` en una GPU profesional de 32 GB para entornos de desarrollo y pruebas.
- Evaluacion comparativa de runtimes: usar el paquete como banco de pruebas para medir decode y prefill frente a llama.cpp ROCm con el mismo GGUF y los mismos prompts.
- Backend de aplicaciones internas con concurrencia moderada: 4 peticiones concurrentes y salida de hasta 4.096 tokens encajan en herramientas internas de redaccion asistida o generacion de codigo acotada.
- Validacion de pipelines de agentes: el gate `agent` (aunque no re-ejecutado en este paquete) esta disenado para verificar renderizado exacto de prompts, reutilizacion de historial y validez de las llamadas a herramientas.

## Benchmarks y rendimiento

Roofline publicada para Strix Halo (gfx1151, 216 GB/s, 59 TFLOP/s). Las columnas de llama.cpp y Loom figuran como no medidas (`—`) en la informacion disponible; solo se aporta el techo teorico.

| Metrica | llama.cpp | Loom | Roofline (techo) |
|---|---|---|---|
| Decode tok/s, prompt corto | — | — | 11,1 |
| Decode tok/s, contexto 2k | — | — | 10,8 |
| Decode tok/s, contexto 32k | — | — | 7,8 |
| Prefill tok/s, documento 1k | — | — | 935,5 |
| Prefill tok/s, documento 2k | — | — | 925,9 |
| Prefill tok/s, documento 8k | — | — | 872,1 |
| Prefill tok/s, documento 16k | — | — | 809,4 |
| Prefill tok/s, documento 32k | — | — | 707,6 |
| 4 streams, decode agregado tok/s | — | — | 43,1 |
| Speculative decoding, tokens aceptados | n/a | n/a | n/a |

Para Radeon AI PRO R9700 (gfx1201, 32 GB) los resultados no se han vuelto a medir. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: el paquete se sirve con `--memory_bytes=50000000000` (50 GB) en Strix Halo y `--memory_bytes=34000000000` (34 GB) en Radeon AI PRO R9700.
- GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para GPUs consumer AMD o NVIDIA en la informacion disponible; los objetivos declarados son los dos anteriores.
- Despliegue: `loom-serve` tras instalar `hrx-loom[hf]==0.1.0` y materializar el paquete con `loom-fetch`.
- Latencia y throughput: solo se dispone del techo roofline en Strix Halo (decode 11,1 tok/s en prompt corto y 7,8 tok/s a 32k; prefill entre 935,5 y 707,6 tok/s; 43,1 tok/s agregados con 4 streams). Las cifras reales de Loom y llama.cpp no estan registradas.
- Alternativas de despliegue (vLLM, llama.cpp, Ollama, TGI): el paquete esta disenado para el runtime Loom; llama.cpp ROCm aparece unicamente como referencia de comparacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-32B-Instruct (Q4_K_M) via Loom (este paquete) | 32B denso | 32.768 | GGUF empaquetado `.loom` | no disponible | Hugging Face (loom-fun-staging) |
| bartowski/Qwen2.5-32B-Instruct-GGUF | 32B denso | no disponible | GGUF | no disponible | Hugging Face (bartowski) |
| llama.cpp ROCm (runtime) | no aplica | no disponible | GGUF | no disponible | Referencia de comparacion en la model card |

No se dispone de datos de rendimiento medidos para Loom ni para llama.cpp en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto y formato.

## Limitaciones y advertencias

- No es un modelo nuevo: los pesos son identicos al GGUF de bartowski; no hay fine-tuning ni cambios en tokenizacion o plantilla.
- Las pruebas de correctitud (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `sampling`) no se han re-ejecutado sobre este paquete; el ultimo pase documentado es de una build anterior (sha256 `54559e8`).
- Los resultados de rendimiento en Radeon AI PRO R9700 no se han vuelto a medir.
- Las cifras de llama.cpp y Loom en la tabla de rendimiento de Strix Halo no estan registradas; solo hay roofline teorica.
- Sin decodificacion especulativa, sin modo thinking y sin entrada de imagen o audio.
- Contexto limitado a 32.768 tokens por peticion y salida maxima de 4.096 tokens.
- Concurrencia limitada a 4 peticiones simultaneas.
- Licencia e idiomas no declarados en la informacion disponible; verificar la licencia del modelo base antes de uso comercial.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada para este paquete.
- Dependencia del runtime Loom (`hrx-loom==0.1.0`) y de hardware AMD especifico; no hay ruta de despliegue documentada para otras plataformas.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-fun-staging/bartowski-Qwen2.5-32B-Instruct-loom
- Modelo base GGUF: https://huggingface.co/bartowski/Qwen2.5-32B-Instruct-GGUF
- Repositorio Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
