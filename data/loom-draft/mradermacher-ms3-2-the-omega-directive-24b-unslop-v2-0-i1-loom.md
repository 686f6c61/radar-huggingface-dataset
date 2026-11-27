# loom-draft/mradermacher-MS3.2-The-Omega-Directive-24B-Unslop-v2.0-i1-loom

## Resumen

Este repositorio no contiene un modelo de lenguaje entrenado por su autor, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado con la herramienta `loom-next` para el checkpoint GGUF preexistente `mradermacher/MS3.2-The-Omega-Directive-24B-Unslop-v2.0-i1-GGUF`, en su cuantizacion Q4_K_M. El objetivo es ejecutar ese GGUF sin modificarlo sobre GPUs AMD concretas: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB), sirviendo una API compatible con el endpoint `/v1/chat/completions` de OpenAI.

El paquete expone 131.072 tokens de contexto por peticion, admite 4 peticiones concurrentes y limita la salida a 4.096 tokens mediante el preset `max_tokens`. La model card declara explicitamente que no hay soporte de tool calling, modo de razonamiento, decodificacion especulativa ni entrada de imagen o audio, y que las mediciones de rendimiento y las puertas de correccion (kernel_tests, golden, compare, consistency, etc.) aun no se han vuelto a medir para esta version.

La relevancia es acotada: sirve como artefacto reproducible para validar el stack Loom sobre silicio AMD, no como un modelo nuevo. Toda la informacion sobre arquitectura, datos de entrenamiento y benchmarks del modelo subyacente pertenece al GGUF original de mradermacher y no se detalla en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del GGUF base; el paquete solo aporta kernels y preset de despliegue) |
| Parametros totales | 24B (segun el nombre del checkpoint base) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico incluido en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`MS3.2-The-Omega-Directive-24B-Unslop-v2.0.i1-Q4_K_M.gguf`) empaquetado como artefacto Loom (`.loom` + `model.json`) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-style `/v1/chat/completions` en `127.0.0.1:8080` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |

## Arquitectura y entrenamiento

La arquitectura del modelo subyacente no se describe en la informacion disponible; el paquete Loom no la altera, ya que trabaja sobre el GGUF "unmodified". Lo que si documenta la model card es la capa de ejecucion: kernels generados por `loom-next` (sin LLM en el bucle de generacion), un pool de memoria de respaldo fijo (`--pool_backing=fixed`) y precarga de parametros en host (`--parameter_mode=preload`). La espera activa de finalizacion en GPU se controla con `completion_spin_ns=4294967295`.

No hay datos sobre numero de tokens de entrenamiento, composicion del dataset, RLHF/DPO ni innovaciones de atencion. El sufijo "Unslop" del checkpoint base sugiere un ajuste orientado a reducir estilo generico, pero no se aporta informacion tecnica verificable al respecto. La correccion frente a llama.cpp se plantea mediante puertas reproducibles (tokens greedy, top-5 log-probs, documentos de 1k a 32k, consistencia bajo concurrencia, samplers y readback de logits), aunque todas figuran como "not yet re-measured".

## Capacidades

- Generacion de texto conversacional via API compatible con OpenAI (`/v1/chat/completions`).
- Ventana de contexto de 131.072 tokens por peticion, adecuada para documentos largos.
- Hasta 4 peticiones concurrentes con la garantia de consistencia declarada (pendiente de re-medicion).
- Muestreo configurable (temperature, top_k, seed) segun la puerta `sampling`; el estado de determinacion figura como "?" en la tabla de features.
- Tool calling: no soportado ("not applicable").
- Razonamiento / thinking mode: no soportado.
- Decodificacion especulativa: no soportada.
- Entrada de imagen y audio: no soportadas.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Validacion del stack Loom sobre Strix Halo: desplegar el paquete con `loom-fetch` y `loom-serve` para comprobar que los kernels generados reproducen el comportamiento de llama.cpp sobre el mismo GGUF, usando las puertas `golden` y `compare`.
- Despliegue en estacion de trabajo con GPU AMD unica: la Radeon AI PRO R9700 de 32 GB ejecuta el Q4_K_M (aproximadamente 14-15 GB de pesos) con margen para cache KV, lo que permite servir un asistente local sin depender de CUDA.
- Procesamiento de documentos largos: con 131.072 tokens de contexto se pueden resumir o extraer informacion de contratos, informes o bases de codigo extensas en una sola peticion.
- Benchmarking comparativo de backends: el paquete esta disenado para medir throughput y latencia frente a llama.cpp en el mismo hardware; util para decidir que runtime adoptar en produccion.
- Prototipado de asistentes conversacionales internos: el endpoint compatible con OpenAI permite apuntar clientes existentes (SDKs, LangChain, etc.) sin cambios de codigo, aunque sin tool calling.
- Pruebas de concurrencia y determinismo: la puerta `consistency` (4 peticiones concurrentes frente a ejecuciones aisladas) sirve para validar si el servidor es apto para cargas multiusuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las mediciones de rendimiento frente a llama.cpp para este paquete "no se han vuelto a medir" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201), y que todas las puertas de correccion figuran sin ejecucion registrada.

## Requisitos de hardware

- VRAM estimada: los pesos Q4_K_M de un modelo de 24B ocupan aproximadamente 14-15 GB; a ello hay que sumar la cache KV para hasta 131.072 tokens y 4 peticiones concurrentes, que puede ser considerable y no se cuantifica en la informacion disponible.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU de consumo: no disponible; el paquete solo se distribuye con presets para las dos plataformas AMD citadas.
- Despliegue: `hrx-loom[hf]==0.2.0` via pipx, con `loom-fetch` para materializar el paquete y `loom-serve` para servir la API en `127.0.0.1:8080`.
- Alternativas de despliegue del mismo GGUF: llama.cpp (referencia de correccion del propio paquete); vLLM, TGI u Ollama no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles (mediciones pendientes).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Este paquete (Loom Q4_K_M) | 24B | 131.072 | GGUF empaquetado para Loom, GPU AMD gfx1151/gfx1201 | MIT | Sin tool calling, sin vision, sin speculative decoding; mediciones pendientes |
| GGUF base de mradermacher (mismo checkpoint) | 24B | no disponible | GGUF para llama.cpp y derivados | MIT (segun este paquete) | Fuente sin modificar del paquete Loom |
| llama.cpp sobre el mismo GGUF | 24B | no disponible | GGUF, runtime generico | MIT | Referencia de correccion usada por las puertas del paquete |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El repositorio no es un modelo entrenado: es un artefacto de despliegue; cualquier evaluacion de calidad del modelo debe hacerse sobre el GGUF base.
- Sin tool calling, sin modo de razonamiento, sin decodificacion especulativa y sin vision ni audio: no apto para pipelines de agentes.
- Todas las puertas de correccion y las mediciones de rendimiento figuran como "not yet re-measured"; no hay evidencia registrada de equivalencia con llama.cpp para esta version.
- El estado del muestreo figura como indeterminado ("?") en la tabla de features.
- El limite de salida de 4.096 tokens puede ser insuficiente para generacion larga.
- La concurrencia esta limitada a 4 peticiones.
- Solo se ofrecen presets para dos plataformas AMD concretas; no hay soporte declarado para NVIDIA ni para GPUs de consumo.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero conviene verificar las condiciones del checkpoint base y de las dependencias (`hrx-loom`, `loom-next`).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/mradermacher-MS3.2-The-Omega-Directive-24B-Unslop-v2.0-i1-loom
- GGUF base: https://huggingface.co/mradermacher/MS3.2-The-Omega-Directive-24B-Unslop-v2.0-i1-GGUF
- Repositorio del sistema Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
