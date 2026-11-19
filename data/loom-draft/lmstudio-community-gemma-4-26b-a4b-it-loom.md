# loom-draft/lmstudio-community-gemma-4-26B-A4B-it-loom

## Resumen

`loom-draft/lmstudio-community-gemma-4-26B-A4B-it-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `lmstudio-community/gemma-4-26B-A4B-it-GGUF`, en su cuantizacion `Q4_K_M`. Lo publica el usuario `loom-draft` y esta orientado especificamente a dos aceleradores AMD: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB). No es un modelo nuevo ni un fine-tune: es un artefacto de empaquetado y despliegue generado con la herramienta `loom-next`, sin intervencion de un LLM en el proceso de generacion.

El modelo subyacente, Gemma 4 de 26B con 4B de parametros activos (la nomenclatura A4B indica una arquitectura de mezcla de expertos), se distribuye bajo licencia Apache 2.0. El paquete Loom anade una capa de servicio compatible con la API de OpenAI (`/v1/chat/completions`), soporte de tool calling, modo de razonamiento opcional y una ventana de contexto configurada en 201.728 tokens por peticion, con hasta 4 peticiones concurrentes y un maximo de 4.096 tokens de salida.

Su relevancia es acotada pero concreta: permite ejecutar un modelo de 26B en hardware AMD consumer y de estacion de trabajo sin depender del ecosistema CUDA, mediante un runtime alternativo a llama.cpp. La contrapartida es que el repositorio tiene 0 descargas y 0 likes, un tamano de 0,0 GB (los pesos no estan materializados en el repo) y que todas las puertas de validacion de correctitud y las mediciones de rendimiento figuran como "not yet re-measured", es decir, sin evidencia publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun la nomenclatura A4B del modelo base; detalles internos no disponibles |
| Parametros totales | 26B (segun el identificador del modelo base) |
| Parametros activos | 4B (segun el identificador A4B del modelo base) |
| Longitud de contexto | 201.728 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico formato empaquetado en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programas `.loom` + `model.json` |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |
| API | OpenAI-style `/v1/chat/completions` |

## Arquitectura y entrenamiento

La arquitectura del modelo subyacente es la de Gemma 4 en su variante 26B-A4B, es decir, un transformer con mezcla de expertos en el que se activan aproximadamente 4.000 millones de parametros por token. No se dispone de informacion en la documentacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otras tecnicas de alineacion. Tampoco se detallan innovaciones internas como atencion lineal o decodificacion especulativa; de hecho, la tabla de caracteristicas del paquete Loom marca la decodificacion especulativa como "not applicable".

Lo que si documenta el paquete es la capa de ejecucion. Loom genera kernels especificos para las arquitecturas AMD gfx1151 y gfx1201, con un pool de memoria de respaldo fijo (`--pool_backing=fixed`) y precarga de parametros en el host (`--parameter_mode=preload`). El modo de espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`) consume CPU mientras hay trabajo en vuelo, y es la configuracion con la que se pretenden medir las cifras de rendimiento. La validacion se articula mediante puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp registrada sobre el mismo GGUF; en la version publicada, ninguna de ellas tiene medicion registrada.

## Capacidades

- Generacion de texto conversacional multi-turno mediante API compatible con OpenAI.
- Tool calling con el esquema `tools` / `tool_calls` de OpenAI, incluyendo bucles de agente multi-paso (puerta `agent`).
- Modo de razonamiento ("thinking") opcional, desactivado por defecto y activable con `chat_template_kwargs: {"enable_thinking": true}`.
- Contexto largo de hasta 201.728 tokens por peticion, adecuado para documentos extensos.
- Concurrencia de hasta 4 peticiones simultaneas con consistencia de salida respecto a ejecuciones aisladas (puerta `consistency`, sin medicion publicada).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision y audio: el modelo upstream los soporta, pero Loom explicitamente no los implementa en este paquete.
- Sin soporte de decodificacion especulativa ni de ajuste de esfuerzo de razonamiento ("reasoning effort" no aplicable).

## Casos de uso

- Asistente de documentacion tecnica sobre repositorios extensos: con 201.728 tokens de contexto por peticion, el modelo puede ingerir arboles de codigo, issues y ADRs completos en una sola llamada y responder preguntas de arquitectura sin trocear el material.
- Agente de automatizacion con tool calling: el soporte de `tools`/`tool_calls` y de bucles multi-paso permite construir agentes que consulten APIs internas, ejecuten busquedas o encadenen llamadas a funciones, con el modo thinking activable solo en los pasos que requieran razonamiento.
- Despliegue en estaciones de trabajo AMD sin CUDA: sobre una Radeon AI PRO R9700 de 32 GB o una APU Strix Halo, `loom-serve` ofrece un endpoint compatible con OpenAI al que apuntar clientes existentes sin reescribir integraciones.
- Procesamiento por lotes de documentos largos: informes, contratos o expedientes de decenas de miles de tokens que se resumen o clasifican en una unica peticion, con 4 peticiones concurrentes para amortizar el hardware.
- Prototipado de productos de IA en local: al exponer `/v1/chat/completions`, permite sustituir un proveedor cloud por inferencia local durante el desarrollo manteniendo el mismo codigo cliente.
- Evaluacion de runtime alternativo a llama.cpp: util para equipos que quieran comparar latencia y fidelidad de kernels generados frente a la referencia de llama.cpp sobre el mismo GGUF, usando las puertas `golden` y `compare` como marco de validacion.
- Razonamiento asistido con modo thinking: tareas de analisis o planificacion donde conviene activar `enable_thinking` de forma selectiva para no penalizar el resto del trafico conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento para Strix Halo (gfx1151) y para Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correctitud figuran como "not yet re-measured". No hay datos de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia de orden de magnitud, un checkpoint de 26B en Q4_K_M ronda los 15-16 GB de pesos; a ello hay que sumar el pool de memoria fijo del preset Loom y el espacio para el contexto (hasta 201.728 tokens), lo que en la practica exige holgura sobre esos 16 GB.
- GPU objetivo declaradas: AMD Radeon AI PRO R9700 (32 GB, gfx1201) y APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada).
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete, que genera kernels para arquitecturas AMD gfx1151 y gfx1201.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` con el preset `chat` (Strix Halo) o `chat-r9700` (R9700) y `loom-serve` con `--pool_backing=fixed --parameter_mode=preload`.
- Alternativas de despliegue (vLLM, llama.cpp, Ollama, TGI): no documentadas para este paquete; llama.cpp se usa unicamente como referencia de correctitud, no como runtime del paquete.
- Latencia y throughput: no disponibles; las filas de rendimiento de la model card estan pendientes de re-medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|---|
| `loom-draft/...gemma-4-26B-A4B-it-loom` (este) | 26B | 4B | 201.728 | Apache 2.0 | `.loom` + GGUF, runtime `hrx-loom` | Solo AMD gfx1151 / gfx1201; sin benchmarks publicados |
| `lmstudio-community/gemma-4-26B-A4B-it-GGUF` | 26B | 4B | no disponible | Apache 2.0 | GGUF, runtime LM Studio / llama.cpp | Modelo base del que deriva este paquete; portable a mas hardware |
| Gemma 3 27B (referencia de generacion anterior) | 27B | denso | no disponible en esta ficha | Gemma Terms | GGUF, safetensors | Denso, sin MoE; requiere mas computo por token |

La comparacion relevante no es de calidad de modelo, sino de empaquetado: frente al GGUF original de LM Studio, este paquete restringe el hardware a dos SKU AMD concretas a cambio de kernels especificos y un servidor con API OpenAI y tool calling integrados. Frente a un denso de tamano similar, la variante A4B reduce el coste por token al activar solo 4B de parametros, a costa de una huella de memoria propia de un 26B.

## Limitaciones y advertencias

- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, con un tamano de repo de 0,0 GB, lo que sugiere que los pesos no estan alojados aqui sino resueltos via `loom-fetch` desde el checkpoint base.
- Ausencia total de evidencia de correctitud: las once puertas (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". No hay garantia publicada de que la salida coincida con llama.cpp.
- Sin mediciones de rendimiento: no se puede estimar latencia ni throughput reales en ninguno de los dos aceleradores objetivo.
- Cobertura de hardware muy restringida: solo AMD gfx1151 y gfx1201; no hay soporte para NVIDIA ni para otras GPU AMD.
- Sin vision ni audio, pese a que el modelo upstream los soporta; Loom no los implementa.
- Sin decodificacion especulativa, lo que limita las optimizaciones de latencia disponibles.
- Limite de 4.096 tokens de salida por peticion, insuficiente para generacion de documentos largos en una sola llamada.
- La ventana de 201.728 tokens es por peticion; combinada con 4 peticiones concurrentes y un pool de memoria fijo, el consumo de memoria puede ser elevado y debe dimensionarse con cuidado.
- Idiomas soportados no declarados: no se puede asumir calidad multilingue sin evaluacion propia.
- Sesgos y riesgo de alucinacion del modelo base: no documentados en la informacion disponible; deben evaluarse de forma independiente antes de un uso en produccion.
- Licencia Apache 2.0 declarada en este repo, pero conviene verificar los terminos aplicables al checkpoint Gemma 4 subyacente antes de un despliegue comercial.
- El aviso de la model card sobre `completion_spin_ns=4294967295` implica consumo de CPU durante la inferencia; en entornos con CPU limitada puede degradar el resto de cargas.
- Los resultados de busqueda web devueltos corresponden a productos no relacionados (Loom la grabadora de pantalla y Loom la marca de ropa), por lo que no aportan informacion tecnica sobre este modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/lmstudio-community-gemma-4-26B-A4B-it-loom
- Modelo base (GGUF): https://huggingface.co/lmstudio-community/gemma-4-26B-A4B-it-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
