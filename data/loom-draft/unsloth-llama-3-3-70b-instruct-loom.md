# loom-draft/unsloth-Llama-3.3-70B-Instruct-loom

## Resumen

`loom-draft/unsloth-Llama-3.3-70B-Instruct-loom` es un paquete de despliegue para AMD Loom, no un modelo nuevo. Empaqueta el checkpoint GGUF sin modificar `Llama-3.3-70B-Instruct-Q4_K_M.gguf` de Unsloth (derivado del Llama-3.3-70B-Instruct de Meta) en forma de programas `.loom` y una tarjeta `model.json`, generados con la herramienta `loom-next`. El objetivo es ejecutar Llama 3.3 70B en GPUs AMD concretas: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es un transformer denso de 70.000 millones de parametros de Meta, con 131.072 tokens de contexto por peticion segun la tarjeta, y cuantizado en Q4_K_M. La relevancia de este paquete es que ofrece una via de servir Llama 3.3 70B con API compatible con OpenAI (`/v1/chat/completions`, tool calling) sobre hardware AMD via IREE/ROCm, sin depender de llama.cpp, aunque las mediciones de rendimiento y las puertas de correccion aun no se han vuelto a medir para esta version.

El repositorio tiene 0 descargas y 0 likes, fue creado y actualizado el 2026-11-19, y no incluye resultados de benchmarks ni pruebas de correctitud registradas. La licencia es `llama3.3`, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.3 de Meta), empaquetado como programas Loom para IREE |
| Parametros totales | 70.000 millones (modelo base Llama-3.3-70B-Instruct) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base Llama 3.3 es multilingue, pero la tarjeta no lo detalla) |
| Licencia | llama3.3 |
| Formato de pesos | GGUF (`Llama-3.3-70B-Instruct-Q4_K_M.gguf`) empaquetado en `weights.loom`, mas `program/*.loom`, `tokenizer.json` y `llm_config.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones concurrentes |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| API | Compatible con OpenAI (`/v1/chat/completions`), tool calling estilo OpenAI |

## Arquitectura y entrenamiento

El modelo subyacente es Llama-3.3-70B-Instruct, un transformer denso de Meta con 70.000 millones de parametros. Este repositorio no entrena ni modifica pesos: toma el GGUF Q4_K_M de Unsloth y genera, con `loom-next` (solo el generador, sin LLM en el bucle), programas `.loom` que se ejecutan sobre el runtime Loom/IREE de AMD. El paquete incluye `model.json` y `model.json.lock` con los ficheros fuente fijados y verificados por sha256 en `loom-fetch`.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni las fases de RLHF/DPO en la informacion proporcionada; esos datos corresponden al modelo base de Meta y no se detallan aqui. La innovacion tecnica del paquete es el propio pipeline de generacion de kernels y el servidor `loom-serve`, que permite servir el GGUF en GPUs AMD con opciones como `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` para espera activa de finalizaciones de GPU.

## Capacidades

- Generacion de texto conversacional multi-turno con 131.072 tokens de contexto por peticion.
- Tool calling / function calling estilo OpenAI (`tools` y `tool_calls`).
- Bucles de agente multi-turno con tool calling (existe una puerta de correccion `agent` definida en loom-benchmark, aunque sin medicion registrada).
- API HTTP compatible con OpenAI en `/v1/chat/completions`, servida por `loom-serve` en el puerto 8080 por defecto.
- Concurrencia de hasta 4 peticiones simultaneas.
- Sin modo de razonamiento/thinking, sin decodificacion especulativa, sin entrada de imagen y sin audio: la tarjeta marca esas capacidades como no aplicables.
- Capacidades multilingues: no detalladas en la tarjeta; dependen del modelo base Llama 3.3.

## Casos de uso

- Servicio de chat autohospedado en hardware AMD: desplegar Llama 3.3 70B Q4_K_M en una Radeon AI PRO R9700 o en un Ryzen AI Max+ 395 y exponer un endpoint compatible con OpenAI para integrarlo en aplicaciones existentes sin cambiar el cliente.
- Asistente de codigo en estaciones de trabajo AMD: usar el endpoint `/v1/chat/completions` desde plugins de IDE o herramientas CLI que ya hablan el protocolo OpenAI, aprovechando los 131k tokens de contexto para incluir ficheros y documentacion.
- Agentes con herramientas: construir flujos multi-paso con `tools`/`tool_calls` (consulta de APIs, ejecucion de comandos, busqueda) sobre el bucle de agente soportado por el servidor.
- Procesamiento de documentos largos: resumen, extraccion y preguntas sobre documentos de hasta 32k tokens (rango cubierto por las pruebas de referencia `golden` de 1k-32k) y hasta el limite de 131k del preset.
- Laboratorio de evaluacion de runtime: comparar la salida del paquete Loom contra la referencia de llama.cpp sobre el mismo GGUF mediante las puertas `golden`, `compare` y `consistency` de loom-benchmark.
- Prototipado local sin GPU NVIDIA: validar flujos de Llama 3.3 70B en un APU Strix Halo antes de mover cargas a servidores con GPUs dedicadas.
- Backend de atencion al cliente en pequena escala: con 4 peticiones concurrentes y 4.096 tokens de salida maxima, adecuado para equipos pequenos o entornos de demostracion, no para alta concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta indica explicitamente que los resultados de rendimiento frente a llama.cpp "no se han vuelto a medir" tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201). Todas las puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas plataformas.

## Requisitos de hardware

- VRAM estimada: el GGUF Q4_K_M de un modelo de 70.000 millones de parametros ocupa aproximadamente 40-43 GB en disco y en memoria; la tarjeta no publica la cifra exacta de VRAM reservada por el preset. La Radeon AI PRO R9700 dispone de 32 GB, por lo que el paquete depende de la gestion de memoria del preset (pool fijo o elastico) y no se detalla como encaja el modelo completo en esa VRAM.
- GPU objetivo declaradas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151).
- GPU consumer: no se indica compatibilidad con GPUs de consumo; el paquete esta pensado para las plataformas AMD mencionadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para descargar el paquete y `loom-serve` para servir. En hosts con memlock de 8 MiB hay que lanzar `loom-serve` bajo `systemd-run` con `SystemCallFilter=~io_uring_setup` o subir `ulimit -l`.
- Latencia y throughput: no disponibles; la tarjeta no incluye mediciones para esta version.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| loom-draft/unsloth-Llama-3.3-70B-Instruct-loom | 70B denso | 131.072 tokens | GGUF Q4_K_M empaquetado en programas Loom, servido con `loom-serve` | llama3.3 | Paquete especifico para GPUs AMD (Strix Halo, R9700); sin benchmarks publicados |
| unsloth/Llama-3.3-70B-Instruct-GGUF | 70B denso | 131.072 tokens (modelo base) | GGUF, ejecutable con llama.cpp y derivados | llama3.3 | Modelo base del que se genera este paquete |
| Llama-3.3-70B-Instruct (Meta) | 70B denso | 131.072 tokens | safetensors, ejecutable con vLLM, TGI, etc. | llama3.3 | Modelo original; requiere pila CUDA/ROCm estandar |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer diferencias cuantitativas entre estas opciones.

## Limitaciones y advertencias

- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.
- Sin mediciones: rendimiento y puertas de correctitud sin re-medir para esta version; no se puede afirmar paridad con llama.cpp.
- Cobertura de hardware muy restringida: solo se documentan Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no hay soporte declarado para otras GPUs.
- Capacidad de VRAM ajustada: la R9700 tiene 32 GB y el GGUF Q4_K_M de 70B ronda los 40-43 GB; el comportamiento del preset ante esa diferencia no se detalla en la tarjeta.
- Concurrencia limitada a 4 peticiones y salida maxima de 4.096 tokens; no apto para cargas de alta concurrencia o generaciones muy largas.
- Sin modo thinking, sin vision, sin audio y sin decodificacion especulativa.
- Riesgo de alucinacion inherente al modelo base Llama 3.3; no hay evaluaciones propias en este paquete.
- Licencia `llama3.3`: el uso comercial esta sujeto a la Llama 3.3 Community License de Meta, con sus restricciones (por ejemplo, la clausula de 700 millones de usuarios mensuales y las politicas de uso aceptable).
- Dependencia de `hrx-loom[hf]==0.2.0` y del ecosistema Loom/IREE; en hosts con memlock bajo es necesario un lanzamiento especial bajo `systemd-run`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/unsloth-Llama-3.3-70B-Instruct-loom
- Modelo base GGUF (Unsloth): https://huggingface.co/unsloth/Llama-3.3-70B-Instruct-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
