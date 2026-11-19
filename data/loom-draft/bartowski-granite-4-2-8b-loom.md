# loom-draft/bartowski-granite-4.2-8b-loom

## Resumen

`loom-draft/bartowski-granite-4.2-8b-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `bartowski/granite-4.2-8b-GGUF`, en su cuantizacion `granite-4.2-8b-Q4_K_M.gguf`. Lo publica el usuario `loom-draft` y esta pensado especificamente para las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB). No se trata de un modelo nuevo ni de un fine-tune: los pesos son los del GGUF original de Granite 4.2 8B, y lo que anade el paquete es la infraestructura de ejecucion.

El paquete se ha generado con `loom-next`, el generador del ecosistema Loom (proyecto asociado a ROCm), sin intervencion de un LLM en el bucle. Su relevancia es de nicho: ofrece una via de servicio con API compatible con OpenAI (`/v1/chat/completions`) sobre hardware AMD consumer y profesional, con soporte de modo razonamiento, contexto de 131.072 tokens por peticion y 4 peticiones concurrentes.

La informacion disponible sobre el modelo subyacente (Granite 4.2 8B) es limitada en esta ficha: la model card del paquete no detalla arquitectura, datos de entrenamiento ni benchmarks, y las mediciones de rendimiento y las puertas de correccion aparecen como "not yet re-measured". Cualquier dato no presente en la informacion proporcionada se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo subyacente Granite 4.2 8B; el paquete Loom no la detalla) |
| Parametros totales | 8 000 millones (aproximado, segun el nombre del checkpoint `granite-4.2-8b`) |
| Parametros activos | no disponible |
| Longitud de contexto | 131 072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programas `.loom` y `weights.loom` |
| Salida maxima | 4096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Modo razonamiento | Activado por defecto; desactivable con `chat_template_kwargs: {"enable_thinking": false}` |
| Tool calling | no aplicable segun la model card |
| Entrada de imagen | no aplicable |
| Entrada/salida de audio | no aplicable |
| Decodificacion especulativa | no aplicable |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo Granite 4.2 8B en la documentacion proporcionada. La model card del paquete Loom no incluye esos datos y se limita a describir el empaquetado y el runtime.

Lo que si se documenta es la capa de ejecucion: los pesos GGUF Q4_K_M se traducen a programas Loom generados automaticamente por `loom-next`, con kernels compilados para las arquitecturas gfx1151 y gfx1201. El servicio expone una API compatible con OpenAI, soporta modo razonamiento con plantilla de chat propia y permite ajustes de despliegue como `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU), `--pool_backing=fixed` (reserva anticipada del pool de memoria) y `--parameter_mode=preload` (carga anticipada de pesos en host). La card indica que las mediciones de rendimiento se realizaron con la espera activa habilitada.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Modo razonamiento (thinking) activado por defecto, desactivable por peticion mediante `chat_template_kwargs`.
- Contexto largo de hasta 131.072 tokens por peticion, adecuado para documentos extensos.
- Servicio concurrente de hasta 4 peticiones simultaneas.
- Salida de hasta 4096 tokens por respuesta segun el preset.
- Ejecucion sobre GPU AMD Strix Halo y Radeon AI PRO R9700 mediante el runtime Loom.
- Tool calling: no soportado segun la model card ("not applicable").
- Entrada de imagen y audio: no soportadas.
- Decodificacion especulativa: no soportada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Servicio local de chat sobre hardware AMD: desplegar un endpoint compatible con OpenAI en una estacion con Ryzen AI Max+ 395 o Radeon AI PRO R9700, util para prototipos y entornos de desarrollo sin depender de la nube.
- Procesamiento de documentos largos: el contexto de 131.072 tokens permite resumir o consultar contratos, informes o bases de codigo extensas en una sola peticion.
- Asistentes con razonamiento explicito: activar el modo thinking para tareas que requieren pasos intermedios (analisis, planificacion) y desactivarlo para respuestas rapidas de baja latencia.
- Evaluacion comparativa de runtimes en AMD: usar el paquete como referencia para medir el rendimiento de Loom frente a llama.cpp sobre el mismo GGUF, una vez se publiquen las mediciones.
- Laboratorio de investigacion en hardware consumer: probar modelos de 8B cuantizados en GPU integradas o profesionales AMD con un stack ROCm, sin GPU NVIDIA.
- Entornos con requisitos de licencia permisiva: al ser Apache 2.0, el paquete puede integrarse en productos internos o comerciales sin obligaciones de atribucion adicionales mas alla de las de la licencia.
- Servicio de baja concurrencia en produccion ligera: con 4 peticiones concurrentes y 4096 tokens de salida, encaja en herramientas internas de equipo o asistentes de documentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPU.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 8B, y la Radeon AI PRO R9700 objetivo tiene 32 GB. El paquete esta pensado para ejecutarse integramente en GPU.
- GPU soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para GPUs consumer NVIDIA ni para otras AMD distintas de las dos indicadas.
- Despliegue: runtime Loom (`pipx install "hrx-loom[hf]==0.2.0"`), con `loom-fetch` para descargar el paquete y `loom-serve` para servir el endpoint. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este paquete concreto; llama.cpp se usa solo como referencia de correccion.
- Latencia y throughput: no disponibles (mediciones pendientes de repetir).
- Concurrencia maxima: 4 peticiones simultaneas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime | Notas |
|---|---|---|---|---|---|---|
| loom-draft/bartowski-granite-4.2-8b-loom | ~8B | 131 072 tokens | Q4_K_M | Apache 2.0 | Loom (AMD ROCm) | Paquete especifico para Strix Halo y R9700; sin benchmarks publicados |
| bartowski/granite-4.2-8b-GGUF | ~8B | no disponible en esta ficha | Multiples GGUF (incluye Q4_K_M) | Apache 2.0 (heredada) | llama.cpp y derivados | Checkpoint base sin modificar; referencia de correccion del paquete Loom |
| Modelos de ~8B cuantizados en GGUF para llama.cpp | ~8B | variable | Q4_K_M y otras | variable | llama.cpp, Ollama, etc. | Alternativa generica; comparativa detallada no disponible en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Paquete de nicho: solo cubre dos GPU AMD concretas (gfx1151 y gfx1201); no es portable a otros aceleradores sin regeneracion.
- Sin evidencia de correccion publicada: todas las puertas de validacion figuran como "not yet re-measured", por lo que no hay garantia documentada de equivalencia con llama.cpp.
- Sin benchmarks de rendimiento: no se puede evaluar throughput ni latencia a partir de la informacion disponible.
- Tool calling no soportado, lo que limita su uso en agentes y pipelines que dependan de function calling.
- Sin vision ni audio.
- Sin decodificacion especulativa, lo que puede penalizar la latencia en generacion larga.
- Concurrencia limitada a 4 peticiones, insuficiente para cargas de produccion medias o altas.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingue.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; aplican los del modelo Granite 4.2 8B subyacente, no descritos aqui.
- Licencia Apache 2.0 permisiva para uso comercial, pero conviene verificar las condiciones del checkpoint base `bartowski/granite-4.2-8b-GGUF` y del modelo original de IBM.
- Dependencia del runtime `hrx-loom==0.2.0` y del ecosistema Loom, con posible inestabilidad por juventud del proyecto.

## Enlaces

- Hugging Face: https://huggingface.co/loom-draft/bartowski-granite-4.2-8b-loom
- Checkpoint base: https://huggingface.co/bartowski/granite-4.2-8b-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
