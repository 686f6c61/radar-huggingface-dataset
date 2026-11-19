# loom-draft/ReadyArt-Wicked-Stuff-12B-loom

## Resumen

ReadyArt-Wicked-Stuff-12B-loom es un paquete de despliegue en formato Loom (programas `.loom` y un fichero `model.json` a modo de tarjeta) generado por el autor `loom-draft` a partir del checkpoint GGUF sin modificar `ReadyArt/Wicked-Stuff-12B-GGUF`, en su cuantizacion Q4_K_M. No es un modelo entrenado desde cero ni un ajuste fino nuevo: es un artefacto de empaquetado que traduce los pesos existentes a un formato ejecutable por el runtime Loom (proyecto `hrx-system` de ROCm) sobre GPUs AMD concretas, en concreto el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El problema que aborda es la portabilidad de inferencia en hardware AMD: en lugar de depender de llama.cpp u otro motor, el generador `loom-next` produce kernels y programas especificos para cada arquitectura de GPU, con verificacion de correctitud frente a una referencia de llama.cpp. El modelo subyacente es de 12B parametros, con soporte nativo de vision y audio en el modelo original, aunque Loom no expone esas modalidades.

La relevancia es acotada y experimental: el repositorio tiene 0 descargas y 0 likes, el tamano declarado es de 0.0 GB (probablemente porque los pesos se referencian desde el GGUF de origen y no se duplican), y las mediciones de rendimiento y las puertas de correctitud figuran como "not yet re-measured". Debe tratarse, por tanto, como un artefacto en fase de borrador, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de 12B; el paquete Loom no documenta la arquitectura interna) |
| Parametros totales | 12B (segun el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 160.768 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unica incluida en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (origen) empaquetado como programas `.loom` y `weights.loom` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| GPUs objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | hrx-loom 0.2.0 (`loom-fetch`, `loom-serve`) |
| API | OpenAI-style `/v1/chat/completions` |

## Arquitectura y entrenamiento

El paquete no aporta informacion sobre la arquitectura del transformer subyacente, los datos de entrenamiento, el numero de tokens vistos ni si hubo RLHF o DPO. Lo unico documentado es el proceso de generacion del artefacto: `loom-next` (el generador, sin LLM en el bucle) produce programas `.loom` y kernels especificos para las arquitecturas gfx1151 y gfx1201 a partir del GGUF Q4_K_M original, que se mantiene sin modificaciones. El fichero `model.json` y su `.lock` fijan los ficheros fuente con verificacion de hash SHA-256 por parte de `loom-fetch`.

La innovacion tecnica no esta en el modelo sino en el motor: Loom compila kernels para la GPU AMD concreta y ofrece un conjunto de puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida con una referencia de llama.cpp grabada sobre el mismo GGUF, token a token y con top-5 log-probs. En esta version todas las puertas aparecen como "not yet re-measured", es decir, sin evidencia registrada.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling en formato OpenAI (`tools` y `tool_calls`), con soporte de bucles multi-turno segun la puerta `agent`.
- Modo de razonamiento ("thinking") desactivado por defecto, activable con `chat_template_kwargs: {"enable_thinking": true}`.
- Contexto largo de hasta 160.768 tokens por peticion, adecuado para documentos extensos.
- Concurrencia de hasta 4 peticiones simultaneas con consistencia verificable entre ejecuciones concurrentes y aisladas.
- Sin decodificacion especulativa (marcada como no aplicable) y sin ajuste de esfuerzo de razonamiento.
- Vision y audio: no soportados por Loom, aunque el modelo de origen los tenga.
- Capacidades multilingues: no documentadas en la informacion disponible.

## Casos de uso

- Procesamiento de documentos largos en local: con 160.768 tokens de contexto se pueden ingestar informes, contratos o bases de codigo extensas en una sola peticion sobre una Radeon AI PRO R9700 de 32 GB, sin depender de servicios en la nube.
- Asistentes con tool calling sobre hardware AMD de escritorio: el soporte de `tools`/`tool_calls` permite construir agentes que consulten APIs internas o bases de datos, ejecutandose en un Ryzen AI Max+ 395 sin GPU dedicada adicional.
- Despliegue en estaciones de trabajo con GPU AMD: el paquete evita la dependencia de CUDA y ofrece un servidor HTTP compatible con OpenAI, lo que simplifica la integracion con clientes existentes.
- Evaluacion de la cadena Loom frente a llama.cpp: las puertas `golden`, `compare` y `logits` estan disenadas para validar que la salida coincide con la referencia, lo que convierte este paquete en un banco de pruebas para el runtime.
- Prototipado de agentes multi-turno con razonamiento opcional: activando `enable_thinking` solo en las fases que lo requieran y desactivandolo en las llamadas de herramienta para reducir latencia.
- Experimentacion con cuantizacion Q4_K_M en GPUs de 32 GB: permite medir el equilibrio entre calidad y huella de memoria en un modelo de 12B antes de decidir un despliegue mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correctitud carecen de ejecucion registrada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el paquete esta pensado para una GPU de 32 GB (Radeon AI PRO R9700) y para la memoria unificada del Ryzen AI Max+ 395. Un modelo de 12B en Q4_K_M ocupa del orden de 7-8 GB de pesos, pero el contexto de 160.768 tokens y el pool de memoria fijo (`--pool_backing=fixed`) incrementan el consumo.
- GPUs soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se documenta soporte para otras GPU.
- GPU de consumo: no disponible; no se mencionan modelos Radeon RX ni GeForce.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Parametros de servicio relevantes: `completion_spin_ns=4294967295` (espera activa de finalizaciones en GPU, consume CPU), `--pool_backing=fixed` y `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; las filas de rendimiento no se han vuelto a medir.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| ReadyArt-Wicked-Stuff-12B-loom | 12B | 160.768 | Apache 2.0 | `.loom` sobre hrx-loom, GPU AMD gfx1151/gfx1201 | Paquete de despliegue, sin benchmarks publicados |
| ReadyArt/Wicked-Stuff-12B-GGUF (modelo base) | 12B | no disponible | Apache 2.0 | GGUF, ejecutable en llama.cpp | Incluye vision y audio; sin empaquetado Loom |
| llama.cpp como referencia | no aplica | no aplica | MIT | Motor generico | Usado como referencia de correctitud por las puertas de Loom |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Artefacto en fase de borrador: 0 descargas, 0 likes, creado y actualizado el mismo dia, sin evidencia de uso real.
- Todas las puertas de correctitud figuran como "not yet re-measured": no hay verificacion publicada de que la salida coincida con llama.cpp.
- Sin benchmarks de rendimiento ni de calidad; no se puede afirmar nada sobre latencia, throughput ni fidelidad del modelo.
- Soporte limitado a dos GPUs AMD concretas; no hay garantia de funcionamiento en otro hardware.
- Sin soporte de vision ni audio en Loom, pese a que el modelo de origen los tenga.
- Sin decodificacion especulativa y sin ajuste de esfuerzo de razonamiento.
- Idiomas soportados no documentados; riesgo de comportamiento irregular fuera del ingles si el modelo base no esta bien alineado.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero el estado experimental y la ausencia de validacion desaconsejan su uso en produccion sin pruebas propias.
- El nombre "Loom" coincide con el servicio comercial de grabacion de pantalla de Atlassian; los resultados de busqueda web sobre ese producto no guardan relacion con este paquete.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/ReadyArt-Wicked-Stuff-12B-loom
- Modelo base en Hugging Face: https://huggingface.co/ReadyArt/Wicked-Stuff-12B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
