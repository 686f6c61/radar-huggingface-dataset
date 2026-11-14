# loom-fun-staging/ggml-org-Qwen3-14B-loom

## Resumen

Este repositorio no contiene un modelo entrenado por su autor, sino un paquete de despliegue (formato `.loom`) que empaqueta el checkpoint GGUF sin modificar `Qwen3-14B-Q4_K_M.gguf` del repositorio `ggml-org/Qwen3-14B-GGUF`. El modelo subyacente es Qwen3-14B, un transformer denso de 14 mil millones de parametros desarrollado por el equipo Qwen de Alibaba, distribuido originalmente en formato GGUF por ggml-org. El paquete lo publica la organizacion `loom-fun-staging` y esta generado con el flujo de trabajo `loom-skills`, orientado al runtime Loom sobre GPUs AMD.

El objetivo del paquete es ejecutar Qwen3-14B en hardware AMD concreto: el APU AMD Ryzen AI Max+ 395 ("Strix Halo", gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). Loom expone un servidor compatible con la API de OpenAI en `127.0.0.1:8080` y ofrece soporte de tool calling, modo de razonamiento y hasta 4 peticiones concurrentes con una ventana de 40.960 tokens por peticion.

La relevancia es acotada: no aporta mejoras de calidad sobre Qwen3-14B, sino una via de despliegue alternativa a llama.cpp ROCm en GPUs AMD, con compilacion de kernels propia y puertas de verificacion de correctitud. El repositorio no registra descargas ni "likes" y su model card no incluye mediciones propias completas: las columnas de llama.cpp y Loom en la tabla de rendimiento estan vacias y solo se publican los limites roofline del hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-14B); paquete de despliegue Loom sobre GGUF |
| Parametros totales | 14 mil millones (heredado del modelo base Qwen3-14B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens por peticion (segun la model card del paquete) |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint empaquetado: `Qwen3-14B-Q4_K_M.gguf`) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | no disponible |
| Formato de pesos | GGUF empaquetado en formato Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

El paquete no define arquitectura propia: reutiliza el checkpoint GGUF de Qwen3-14B sin modificaciones, por lo que la arquitectura efectiva es la del modelo base (transformer denso de 14B). El autor no documenta datos de entrenamiento, numero de tokens, composicion del corpus ni si hubo RLHF o DPO; toda esa informacion corresponde al modelo original y no se reproduce en esta model card.

La innovacion tecnica del paquete esta en el runtime: Loom genera kernels especificos para gfx1151 (Strix Halo) y gfx1201 (Radeon AI PRO R9700), sirve peticiones con espera activa (`completion_spin_ns=4294967295`) y reserva 31.000.000.000 bytes de memoria (`--memory_bytes=31000000000`). La model card declara puertas de correctitud (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `agent_think_off`, `sampling`) que comparan la salida token a token contra una referencia de llama.cpp sobre el mismo GGUF; en esta version no se han vuelto a ejecutar (la ultima pasada fue sobre el build `6bfcb15`). No hay decodificacion especulativa: el GGUF no incluye cabeza MTP y no se ha publicado un drafter para este modelo exacto.

## Capacidades

- Generacion de texto y razonamiento: modo "thinking" activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls` en `/v1/chat/completions`.
- Bucles agénticos multi-turno con reutilizacion de historial, validados por las puertas `agent` y `agent_think_off`.
- Concurrencia de 4 peticiones simultaneas con salida identica a la ejecucion aislada (puerta `consistency`).
- Parametros de muestreo: `temperature`, `top_p`, `top_k`, `seed`.
- Limite de salida: 4.096 tokens por peticion (preset `max_tokens`).
- Sin entrada de imagen ni de audio (marcado como no aplicable en la model card).
- Sin decodificacion especulativa (no aplicable).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional autoalojado en estaciones de trabajo AMD: el servidor compatible con OpenAI permite sustituir una API remota por un endpoint local en `127.0.0.1:8080` sobre Strix Halo o R9700, con 40.960 tokens de contexto por peticion.
- Agentes con herramientas en local: el soporte de `tools`/`tool_calls` y la puerta `agent` permiten construir flujos de funcion calling (consulta de bases de datos, ejecucion de comandos) sin salir del equipo.
- Procesamiento de documentos largos: con 40.960 tokens de contexto y prefill medido en roofline de hasta 2.198,7 tok/s en Strix Halo, es viable resumir o extraer informacion de contratos e informes de decenas de paginas.
- Razonamiento por etapas con modo thinking: activado por defecto, adecuado para tareas de analisis que se benefician de una cadena de razonamiento antes de la respuesta; desactivable para reducir latencia en tareas simples.
- Servicio multiusuario ligero: las 4 peticiones concurrentes con salida determinista permiten atender a un equipo pequeno desde un unico nodo AMD sin infraestructura de GPU dedicada.
- Evaluacion comparativa de runtimes: el paquete sirve para medir Loom frente a llama.cpp ROCm con el mismo GGUF, los mismos prompts y el mismo runner (DevLab), util para decidir el stack de inferencia en hardware AMD.
- Desarrollo y pruebas de integraciones OpenAI: al replicar la interfaz `/v1/chat/completions`, permite probar aplicaciones escritas para la API de OpenAI contra un backend local.

## Benchmarks y rendimiento

La model card publica unicamente los limites roofline del hardware para este GGUF en Strix Halo (216 GB/s de ancho de banda y 59 TFLOP/s); las columnas de llama.cpp y Loom estan sin medir ("—"). No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Metrica (Strix Halo, gfx1151) | llama.cpp | Loom | Roofline | Loom % del roofline |
|---|---|---|---|---|
| Decode tok/s, prompt corto | no medido | no medido | 25,2 | no disponible |
| Decode tok/s, contexto 2k | no medido | no medido | 24,3 | no disponible |
| Decode tok/s, contexto 32k | no medido | no medido | 15,7 | no disponible |
| Prefill tok/s, documento 1k | no medido | no medido | 2.198,7 | no disponible |
| Prefill tok/s, documento 2k | no medido | no medido | 2.165,7 | no disponible |
| Prefill tok/s, documento 8k | no medido | no medido | 1.986,5 | no disponible |
| Prefill tok/s, documento 16k | no medido | no medido | 1.789,1 | no disponible |
| Prefill tok/s, documento 32k | no medido | no medido | 1.492,5 | no disponible |
| 4 streams, decode agregado tok/s | no medido | no medido | 96,5 | no disponible |
| Decodificacion especulativa (tokens aceptados) | n/a | n/a | n/a | n/a |

En Radeon AI PRO R9700 (gfx1201, 32 GB) los resultados de este paquete aun no se han vuelto a medir.

## Requisitos de hardware

- Memoria: el comando de servicio reserva 31.000.000.000 bytes (unos 31 GB), lo que encaja con la R9700 de 32 GB y con la memoria unificada del Ryzen AI Max+ 395.
- GPUs soportadas explicitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se documenta soporte para GPUs de consumo (RTX 4090, etc.); el paquete esta orientado a hardware AMD con los targets gfx1151 y gfx1201.
- Despliegue: runtime Loom mediante `pip install "hrx-loom[hf]==0.1.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servir; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Rendimiento: solo limites roofline (25,2 tok/s de decode en prompt corto, 15,7 tok/s a 32k de contexto, 2.198,7 tok/s de prefill a 1k, 96,5 tok/s agregados con 4 streams); no hay throughput real medido de Loom ni de llama.cpp.
- Ajuste de ejecucion: `--device=amdgpu://?completion_spin_ns=4294967295` (espera activa) y `--memory_bytes=31000000000`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Este paquete (Qwen3-14B Q4_K_M para Loom) | 14B denso | 40.960 tokens por peticion | GGUF empaquetado en `.loom`, runtime Loom | no disponible | Solo AMD gfx1151 y gfx1201; 4 peticiones concurrentes; sin benchmarks de calidad publicados |
| ggml-org/Qwen3-14B-GGUF (modelo base) | 14B denso | segun el modelo base (no disponible aqui) | GGUF | no disponible en esta informacion | Checkpoint sin modificar del que deriva este paquete; ejecutable con llama.cpp |
| llama.cpp ROCm sobre el mismo GGUF | 14B denso | segun configuracion | GGUF, runtime llama.cpp | no disponible | Referencia de comparacion del autor; sus cifras en la tabla estan sin medir |

No se dispone de datos de rendimiento ni de licencia para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El repositorio no incluye licencia declarada; antes de un uso comercial hay que verificar la licencia del modelo base Qwen3-14B en su repositorio original.
- No hay mediciones reales de rendimiento de Loom ni de llama.cpp en la tabla publicada: solo limites teoricos roofline, por lo que no se puede afirmar una ventaja de velocidad.
- Las puertas de correctitud (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `agent_think_off`, `sampling`) no se han vuelto a ejecutar en este paquete; la ultima pasada corresponde a un build anterior (`6bfcb15`).
- Los resultados en Radeon AI PRO R9700 no se han vuelto a medir.
- El soporte de hardware esta restringido a gfx1151 y gfx1201; no se documenta funcionamiento en otras GPUs.
- La reserva de 31 GB de memoria deja poco margen en un dispositivo de 32 GB y limita la concurrencia real.
- Limite de 4.096 tokens de salida por peticion, lo que puede truncar respuestas largas o cadenas de razonamiento extensas.
- Sin decodificacion especulativa, la latencia de decode queda limitada por el ancho de banda de memoria (roofline de 15,7 tok/s a 32k de contexto).
- Riesgo de alucinacion y sesgos: no documentados en esta model card; son los del modelo base Qwen3-14B.
- Idiomas soportados no declarados en el paquete.
- El paquete tiene 0 descargas y 0 "likes", y esta alojado en una organizacion de staging: no hay evidencia de uso en produccion.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-fun-staging/ggml-org-Qwen3-14B-loom
- Modelo base GGUF: https://huggingface.co/ggml-org/Qwen3-14B-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
